"""Ferramenta para o Claude mexer no WordPress da Michele Salla pela API (sem plugin extra).

Lê o acesso do arquivo .env na raiz do repositório (nunca vai para o GitHub):
    WP_URL=https://michelesalla.com.br
    WP_USUARIO=michelesalla
    WP_SENHA_APP=xxxx xxxx xxxx xxxx xxxx xxxx

Comandos:
    python tools/wp_michele.py teste
        confere se a senha funciona e mostra o usuário

    python tools/wp_michele.py paginas
        lista as páginas (id, status, endereço)

    python tools/wp_michele.py subir-imagens
        envia para a Multimídia as imagens que o Desafio 7 em 7 usa (só as que ainda não foram)
        e guarda os endereços em michele-salla/desafio-7em7/elementor/midia-michele.json

    python tools/wp_michele.py criar-pagina --versao A --slug desafio7em7-a
        cria a página como RASCUNHO, no modelo "Elementor Canvas", já com o layout do Elementor.
        Precisa do snippet "Claude · gravar Elementor por API" ativo no Code Snippets.

    python tools/wp_michele.py atualizar-pagina --id 123 --versao C [--titulo "..."] [--slug desafio7em7-c]
        regrava o layout do Elementor numa página que já existe (e, se pedir, troca título e endereço)

    python tools/wp_michele.py publicar --id 123
        publica a página (SÓ com o OK do Patrik)

    python tools/wp_michele.py conferir [--url https://michelesalla.com.br/desafio7em7-a/]
        abre a página no ar (sem senha) e confere promessa, parcelamento, link de compra e rastreio

As páginas são criadas como rascunho. Publicar só com o OK do Patrik.
Só usa a biblioteca padrão do Python (não precisa instalar nada).
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "michele-salla" / "desafio-7em7"
PASTA_IMG = PASTA / "assets" / "img"
PASTA_EL = PASTA / "elementor"
MAPA = PASTA_EL / "midia-michele.json"
# O site recusa programas sem cara de navegador, então nos identificamos como um.
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"


def ler_env():
    # 1º as variáveis do ambiente (sessão do Claude na nuvem); se faltar alguma, o arquivo .env (PC do Patrik)
    env = {k: os.environ[k].strip() for k in ("WP_URL", "WP_USUARIO", "WP_SENHA_APP") if os.environ.get(k, "").strip()}
    if len(env) == 3:
        return env
    arq = RAIZ / ".env"
    if not arq.exists():
        sys.exit("Falta o acesso: crie as variáveis WP_URL, WP_USUARIO e WP_SENHA_APP no ambiente, ou o arquivo .env na pasta CLIENTES.")
    for linha in arq.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if linha and not linha.startswith("#") and "=" in linha:
            k, v = linha.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    for k in ("WP_URL", "WP_USUARIO", "WP_SENHA_APP"):
        if not env.get(k) or "cole-aqui" in env.get(k, ""):
            sys.exit(f"Preencha {k} no arquivo .env.")
    return env


ENV = None


def api(metodo, caminho, dados=None, binario=None, cabecalhos=None):
    url = ENV["WP_URL"].rstrip("/") + "/wp-json" + caminho
    token = base64.b64encode(f'{ENV["WP_USUARIO"]}:{ENV["WP_SENHA_APP"]}'.encode()).decode()
    h = {"Authorization": "Basic " + token, "User-Agent": UA, "Accept": "application/json"}
    corpo = None
    if binario is not None:
        corpo = binario
    elif dados is not None:
        corpo = json.dumps(dados).encode()
        h["Content-Type"] = "application/json"
    h.update(cabecalhos or {})
    req = urllib.request.Request(url, data=corpo, headers=h, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode() or "null")
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors="replace")[:600]
        sys.exit(f"Erro {e.code} em {metodo} {caminho}: {msg}")


def cmd_teste(_):
    eu = api("GET", "/wp/v2/users/me?context=edit")
    print(f'OK: conectado como {eu.get("name")} ({eu.get("slug")}), papéis: {", ".join(eu.get("roles", []))}')


def cmd_paginas(_):
    pagina = 1
    while True:
        lista = api("GET", f"/wp/v2/pages?per_page=100&page={pagina}&status=publish,draft,private&_fields=id,status,link,title")
        for p in lista:
            print(f'{p["id"]:>6}  {p["status"]:<8} {p["link"]}  ·  {p["title"]["rendered"]}')
        if len(lista) < 100:
            break
        pagina += 1


def eh_imagem(v):
    """Só as imagens da prévia (pasta assets/img). Links como o do botão de compra (Greenn) ficam de fora."""
    return isinstance(v, dict) and "/assets/img/" in str(v.get("url", ""))


def imagens_usadas(versao="A"):
    dados = json.loads((PASTA_EL / f"desafio-7em7-{versao}.json").read_text(encoding="utf-8"))
    nomes = set()

    def andar(e):
        for v in e["settings"].values():
            if eh_imagem(v):
                nomes.add(v["url"].rsplit("/", 1)[1])
        for f in e["elements"]:
            andar(f)
    for e in dados["content"]:
        andar(e)
    return dados, nomes


def cmd_subir_imagens(_):
    mapa = json.loads(MAPA.read_text(encoding="utf-8")) if MAPA.exists() else {}
    todas = set()
    for v in "ABCDEF":
        todas |= imagens_usadas(v)[1]
    for nome in sorted(todas):
        if nome in mapa:
            print("já está na Multimídia:", nome)
            continue
        arq = PASTA_IMG / nome
        tipo = mimetypes.guess_type(nome)[0] or ("image/webp" if nome.endswith(".webp") else "application/octet-stream")
        r = api("POST", "/wp/v2/media", binario=arq.read_bytes(),
                cabecalhos={"Content-Type": tipo, "Content-Disposition": f'attachment; filename="desafio7em7-{nome}"'})
        mapa[nome] = {"id": r["id"], "url": r["source_url"]}
        MAPA.write_text(json.dumps(mapa, indent=1, ensure_ascii=False), encoding="utf-8")
        print("enviada:", nome, "→", r["source_url"])
    print(f"Pronto: {len(mapa)} imagens mapeadas em {MAPA.relative_to(RAIZ)}")


def layout_com_midia(versao):
    """Troca os endereços da prévia (Vercel) pelos da Multimídia da Michele."""
    if not MAPA.exists():
        sys.exit("Rode primeiro: python tools/wp_michele.py subir-imagens")
    mapa = json.loads(MAPA.read_text(encoding="utf-8"))
    dados, nomes = imagens_usadas(versao)
    faltam = sorted(n for n in nomes if n not in mapa)
    if faltam:
        sys.exit("Faltam imagens na Multimídia: " + ", ".join(faltam) + ". Rode subir-imagens.")

    def andar(e):
        for v in e["settings"].values():
            if eh_imagem(v):
                m = mapa[v["url"].rsplit("/", 1)[1]]
                v["url"], v["id"], v["source"] = m["url"], m["id"], "library"
        for f in e["elements"]:
            andar(f)
    for e in dados["content"]:
        andar(e)
    return dados


def conteudo_texto(conteudo):
    """Versão em texto da página (títulos, textos e botões), para o conteúdo "por baixo" do WordPress.
    O que a visitante vê vem do Elementor; este texto serve para busca, SEO e para não sobrar versão antiga."""
    partes = []

    def andar(e):
        s, w = e["settings"], e.get("widgetType")
        if w == "heading" and s.get("title"):
            tag = s.get("header_size", "h2")
            tag = tag if tag in ("h1", "h2", "h3") else "p"
            partes.append(f"<{tag}>{s['title']}</{tag}>")
        elif w == "text-editor" and s.get("editor"):
            partes.append(f"<p>{s['editor']}</p>")
        elif w == "button" and s.get("text"):
            partes.append(f'<p><a href="{s.get("link", {}).get("url", "")}">{s["text"]}</a></p>')
        for f in e["elements"]:
            andar(f)
    for e in conteudo:
        andar(e)
    return "\n".join(partes)


def gravar_layout(pid, versao):
    dados = layout_com_midia(versao)
    r = api("POST", f"/claude/v1/elementor/{pid}",
            {"data": json.dumps(dados["content"], ensure_ascii=False), "page_settings": dados.get("page_settings", {})})
    print("Layout gravado. Editar no Elementor:", r.get("editar"))
    print("Ver prévia (logado):", r.get("previa"))
    # Grava também o conteúdo "por baixo" (texto da mesma versão) e, ao salvar a página de novo,
    # o WP Rocket limpa o cache (senão o site segue mostrando a versão antiga).
    api("POST", f"/wp/v2/pages/{pid}", {"content": conteudo_texto(dados["content"])})
    print("Conteúdo por baixo atualizado e cache da página limpo.")


def cmd_criar_pagina(a):
    titulo = a.titulo or f"Desafio 7 em 7 · Versão {a.versao}"
    p = api("POST", "/wp/v2/pages", {"title": titulo, "slug": a.slug, "status": "draft", "template": "elementor_canvas"})
    print(f'Página criada como RASCUNHO: id {p["id"]} · {p["link"]}')
    gravar_layout(p["id"], a.versao)


def cmd_atualizar_pagina(a):
    mudar = {}
    if a.titulo:
        mudar["title"] = a.titulo
    if a.slug:
        mudar["slug"] = a.slug
    if mudar:
        p = api("POST", f"/wp/v2/pages/{a.id}", mudar)
        print(f'Título/endereço atualizados: {p["title"]["rendered"]} · {p.get("slug")} (status: {p["status"]})')
    gravar_layout(a.id, a.versao)


def cmd_publicar(a):
    p = api("GET", f"/wp/v2/pages/{a.id}?context=edit&_fields=id,status,slug,link,content")
    if "#LINK-DE-COMPRA" in p.get("content", {}).get("raw", "") or "#LINK-DE-COMPRA" in json.dumps(
            api("GET", f"/wp/v2/pages/{a.id}?context=edit&_fields=meta"), ensure_ascii=False):
        print("ATENÇÃO: a página ainda tem botões com #LINK-DE-COMPRA (sem link de pagamento).")
    r = api("POST", f"/wp/v2/pages/{a.id}", {"status": "publish"})
    print(f'Publicada: id {r["id"]} · {r["link"]}')


LINK_GREENN = "payfast.greenn.com.br/199167/offer/E1YMM7"


def cmd_conferir(a):
    """Confere a página publicada como uma visitante vê (não usa a senha)."""
    import re
    import time
    url = a.url
    html = ""
    for tentativa in range(3):
        try:
            req = urllib.request.Request(url + ("&" if "?" in url else "?") + f"conferir={int(time.time())}",
                                         headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                html = r.read().decode("utf-8", errors="replace")
            break
        except Exception as e:  # o site às vezes devolve 503 por um instante
            print(f"tentativa {tentativa + 1} falhou: {e}")
            time.sleep(5)
    if not html:
        sys.exit("Não consegui abrir a página. Tente de novo em 1 minuto.")
    texto = re.sub(r"<[^>]+>", " ", html).replace("&nbsp;", " ")
    texto = re.sub(r"\s+", " ", texto)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    h1 = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h1.group(1)).replace("&nbsp;", " ")).strip() if h1 else ""
    checks = [
        ("Promessa começa com \"Descubra como\"", h1.startswith("Descubra como"), h1),
        ("Parcelamento 12x de R$ 4,83 (2 ofertas)", texto.count("12x de R$ 4,83") >= 2, f'{texto.count("12x de R$ 4,83")} vez(es)'),
        ("Nenhum valor antigo (67, 6,89, 5,58, 3,80 ou link 1qsr9k)", not any(v in texto for v in ("R$ 67", "R$67", "6,89", "5,58", "3,80")) and "1qsr9k" not in html, ""),
        ("Botões com o link da Greenn (3)", html.count(LINK_GREENN) >= 3, f"{html.count(LINK_GREENN)} link(s)"),
        ("Nenhum botão sem link (#LINK-DE-COMPRA)", "#LINK-DE-COMPRA" not in html, ""),
        ("Rastreio do botão (CliqueComprar) no rodapé", "CliqueComprar" in html, ""),
        ("Página não manda InitiateCheckout (o oficial é o da Greenn)", "'InitiateCheckout'" not in html, ""),
        ("Pixel 991344998762063 no site", "991344998762063" in html, ""),
        ("Rastreio do painel (tempo de bloco e cliques)", "painel.michelesalla.com.br/rastreio.js" in html, ""),
    ]
    print("Página:", url)
    for nome, ok, extra in checks:
        print(("OK    " if ok else "FALTA ") + nome + (f"  ({extra})" if extra else ""))
    if all(ok for _, ok, _ in checks):
        print("Tudo certo na página publicada.")
    else:
        print("ATENÇÃO: algo não confere. Se acabou de atualizar, espere 1 minuto e rode de novo (cache do site).")


def main():
    global ENV
    # O terminal do Windows nem sempre aceita acentos: força UTF-8 para não travar no meio.
    for fluxo in (sys.stdout, sys.stderr):
        try:
            fluxo.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description="WordPress da Michele Salla")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("teste")
    sub.add_parser("paginas")
    sub.add_parser("subir-imagens")
    c = sub.add_parser("criar-pagina")
    c.add_argument("--versao", choices="ABCDEF", required=True)
    c.add_argument("--slug", required=True)
    c.add_argument("--titulo")
    u = sub.add_parser("atualizar-pagina")
    u.add_argument("--id", type=int, required=True)
    u.add_argument("--versao", choices="ABCDEF", required=True)
    u.add_argument("--titulo")
    u.add_argument("--slug")
    pb = sub.add_parser("publicar")
    pb.add_argument("--id", type=int, required=True)
    cf = sub.add_parser("conferir")
    cf.add_argument("--url", default="https://michelesalla.com.br/desafio7em7-a/")
    a = ap.parse_args()
    if a.cmd == "conferir":
        return cmd_conferir(a)
    ENV = ler_env()
    {"teste": cmd_teste, "paginas": cmd_paginas, "subir-imagens": cmd_subir_imagens,
     "criar-pagina": cmd_criar_pagina, "atualizar-pagina": cmd_atualizar_pagina, "publicar": cmd_publicar}[a.cmd](a)


if __name__ == "__main__":
    main()
