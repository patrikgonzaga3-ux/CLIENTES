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

    python tools/wp_michele.py atualizar-pagina --id 123 --versao A
        regrava o layout do Elementor numa página que já existe

Nada é publicado: as páginas são criadas como rascunho. Publicar é com o Patrik.
Só usa a biblioteca padrão do Python (não precisa instalar nada).
"""
import argparse
import base64
import json
import mimetypes
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
    env = {}
    arq = RAIZ / ".env"
    if not arq.exists():
        sys.exit("Falta o arquivo .env na pasta CLIENTES. Copie o .env.exemplo para .env e cole a senha de aplicação.")
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


def imagens_usadas(versao="A"):
    dados = json.loads((PASTA_EL / f"desafio-7em7-{versao}.json").read_text(encoding="utf-8"))
    nomes = set()

    def andar(e):
        for v in e["settings"].values():
            if isinstance(v, dict) and str(v.get("url", "")).startswith("http"):
                nomes.add(v["url"].rsplit("/", 1)[1])
        for f in e["elements"]:
            andar(f)
    for e in dados["content"]:
        andar(e)
    return dados, nomes


def cmd_subir_imagens(_):
    mapa = json.loads(MAPA.read_text(encoding="utf-8")) if MAPA.exists() else {}
    todas = set()
    for v in "ABCD":
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
            if isinstance(v, dict) and str(v.get("url", "")).startswith("http"):
                m = mapa[v["url"].rsplit("/", 1)[1]]
                v["url"], v["id"], v["source"] = m["url"], m["id"], "library"
        for f in e["elements"]:
            andar(f)
    for e in dados["content"]:
        andar(e)
    return dados


def gravar_layout(pid, versao):
    dados = layout_com_midia(versao)
    r = api("POST", f"/claude/v1/elementor/{pid}",
            {"data": json.dumps(dados["content"], ensure_ascii=False), "page_settings": dados.get("page_settings", {})})
    print("Layout gravado. Editar no Elementor:", r.get("editar"))
    print("Ver prévia (logado):", r.get("previa"))


def cmd_criar_pagina(a):
    titulo = a.titulo or f"Desafio 7 em 7 · Versão {a.versao}"
    p = api("POST", "/wp/v2/pages", {"title": titulo, "slug": a.slug, "status": "draft", "template": "elementor_canvas"})
    print(f'Página criada como RASCUNHO: id {p["id"]} · {p["link"]}')
    gravar_layout(p["id"], a.versao)


def cmd_atualizar_pagina(a):
    gravar_layout(a.id, a.versao)


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
    c.add_argument("--versao", choices="ABCD", required=True)
    c.add_argument("--slug", required=True)
    c.add_argument("--titulo")
    u = sub.add_parser("atualizar-pagina")
    u.add_argument("--id", type=int, required=True)
    u.add_argument("--versao", choices="ABCD", required=True)
    a = ap.parse_args()
    ENV = ler_env()
    {"teste": cmd_teste, "paginas": cmd_paginas, "subir-imagens": cmd_subir_imagens,
     "criar-pagina": cmd_criar_pagina, "atualizar-pagina": cmd_atualizar_pagina}[a.cmd](a)


if __name__ == "__main__":
    main()
