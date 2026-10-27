"""Gera os templates do Elementor (JSON) das versões A, B, C e D do Desafio 7 em 7.

Cada bloco da página vira um container de largura total (fundo, gradiente e onda)
com um container interno de 540px. Tudo é widget nativo (título, texto, imagem,
botão, ícone), então dá para editar direto no Elementor.

As imagens apontam para a prévia na Vercel. Ao importar o template, o Elementor
baixa cada imagem para a Multimídia do WordPress.

Uso: python3 gerar_elementor.py   (gera desafio-7em7-A.json ... D.json nesta pasta)
"""
import json
import os
import random
from pathlib import Path

AQUI = Path(__file__).parent
BASE = os.environ.get("IMG_BASE", "https://clientes-phi-six.vercel.app/michele-salla/desafio-7em7/assets/img/")
LINK_COMPRA = "https://payfast.greenn.com.br/199167/offer/E1YMM7"  # checkout Greenn R$ 47 (pedido do Patrik em 27/10; antes 1qsr9k, R$ 67)

ROXO, VIOLETA, ROSA, ROSA_CLARO = "#9E047C", "#8D29F2", "#D448C2", "#FF9DF4"
ROSA_FUNDO, AMARELO, PRETO, BRANCO = "#FFF3FD", "#FFFC00", "#252525", "#FFFFFF"
FRAMB, VERDE, VERM, TEXTO = "#D14775", "#1C873C", "#A3173F", "#4A4150"
SOMBRA = "rgba(94,8,92,0.14)"
SOMBRA_FORTE = "rgba(60,0,70,0.28)"

_rnd = random.Random(7)


def uid():
    return "%07x" % _rnd.getrandbits(28)


# ---------- valores no formato do Elementor ----------

def px(v, unit="px"):
    return {"unit": unit, "size": v, "sizes": []}


def caixa(t, r=None, b=None, l=None, unit="px"):
    r = t if r is None else r
    b = t if b is None else b
    l = r if l is None else l
    return {"unit": unit, "top": str(t), "right": str(r), "bottom": str(b), "left": str(l),
            "isLinked": t == r == b == l}


def gap(v):
    return {"column": str(v), "row": str(v), "isLinked": True, "unit": "px", "size": v}


def tipo(pref, familia, peso, tam, lh=None, mob=None, ls=None, transform=None):
    d = {f"{pref}_typography": "custom", f"{pref}_font_family": familia,
         f"{pref}_font_weight": str(peso), f"{pref}_font_size": px(tam)}
    if mob:
        d[f"{pref}_font_size_mobile"] = px(mob)
    if lh:
        d[f"{pref}_line_height"] = px(lh, "em")
    if ls is not None:
        d[f"{pref}_letter_spacing"] = px(ls)
    if transform:
        d[f"{pref}_text_transform"] = transform
    return d


def sombra(pref, v=14, blur=34, cor=SOMBRA, h=0, spread=0):
    return {f"{pref}_box_shadow_type": "yes",
            f"{pref}_box_shadow": {"horizontal": h, "vertical": v, "blur": blur, "spread": spread, "color": cor}}


def img_url(nome):
    return {"url": BASE + nome, "id": "", "alt": "", "source": "library", "size": ""}


# ---------- elementos ----------

def container(filhos, titulo=None, interno=True, **s):
    base = {"content_width": "full", "flex_direction": "column"}
    if titulo:
        base["_title"] = titulo
    base.update(s)
    if base.get("flex_direction") == "row" and "flex_wrap" not in base:
        # linha ícone + texto: não quebrar; o ícone não encolhe e o texto ocupa o resto
        base["flex_wrap"] = "nowrap"
        for f in filhos:
            if f["elType"] != "widget":
                continue
            fs = f["settings"]
            if f["widgetType"] in ("icon", "image"):
                fs.setdefault("_flex_size", "none")      # tamanho fixo, não encolhe
            elif f["widgetType"] in ("text-editor", "heading"):
                if "_flex_size" not in fs:              # ocupa o que sobra e pode encolher
                    fs.update({"_flex_size": "custom", "_flex_grow": 1, "_flex_shrink": 1})
    return {"id": uid(), "elType": "container", "isInner": interno, "settings": base, "elements": filhos}


def caixa_conteudo(filhos, pad=(64, 16, 72, 16), largura=540, **s):
    """Container de 540px centralizado (a 'coluna de leitura')."""
    st = {"content_width": "boxed", "boxed_width": px(largura),
          "padding": caixa(pad[0], pad[1], pad[2], pad[3]), "flex_gap": gap(16)}
    st.update(s)
    return container(filhos, **st)


def bloco(titulo, filhos, fundo=None, gradiente=None, onda=None, ancora=None, **s):
    """Container de largura total = 1 bloco da página."""
    st = {"padding": caixa(0)}
    if gradiente:
        st.update({"background_background": "gradient", "background_color": gradiente[0],
                   "background_color_b": gradiente[1], "background_gradient_type": "linear",
                   "background_gradient_angle": px(170, "deg")})
    elif fundo:
        st.update({"background_background": "classic", "background_color": fundo})
    if onda:
        st.update({"shape_divider_bottom": "waves", "shape_divider_bottom_color": onda,
                   "shape_divider_bottom_height": px(60), "shape_divider_bottom_height_mobile": px(30)})
    if ancora:
        st["_element_id"] = ancora
    st.update(s)
    return container(filhos, titulo=titulo, interno=False, **st)


def widget(tipo_w, s):
    return {"id": uid(), "elType": "widget", "widgetType": tipo_w, "settings": s, "elements": []}


def titulo(texto, tag="h2", tam=27, mob=None, cor=PRETO, peso=800, alinhar="center", lh=1.18,
           familia="Sora", **extra):
    s = {"title": texto, "header_size": tag, "align": alinhar, "title_color": cor}
    s.update(tipo("typography", familia, peso, tam, lh, mob))
    s.update(extra)
    return widget("heading", s)


def texto(html, tam=16, cor=TEXTO, alinhar="center", peso=400, familia="Raleway", lh=1.55, mob=None, **extra):
    s = {"editor": html, "align": alinhar, "text_color": cor}
    s.update(tipo("typography", familia, peso, tam, lh, mob))
    s.update(extra)
    return widget("text-editor", s)


def imagem(nome, alt, largura=100, raio=None, **extra):
    s = {"image": img_url(nome), "image_size": "full", "width": px(largura, "%"), "align": "center"}
    s["image"]["alt"] = alt
    if raio:
        s["image_border_radius"] = caixa(raio)
    s.update(extra)
    return widget("image", s)


def botao(rotulo="Sim, quero aproveitar a oferta"):
    s = {"text": rotulo, "link": {"url": LINK_COMPRA, "is_external": "", "nofollow": ""},
         "align": "center", "size": "lg", "selected_icon": {"value": "fas fa-arrow-right", "library": "fa-solid"},
         "icon_align": "right", "icon_indent": px(10), "background_color": AMARELO, "button_text_color": "#000000",
         "hover_color": "#000000", "button_background_hover_color": "#F2EF00",
         "border_radius": caixa(50), "text_padding": caixa(20, 26), "text_padding_mobile": caixa(16, 18),
         "_element_width": "initial", "_element_custom_width": px(100, "%"),
         "_element_custom_width_tablet": px(100, "%"), "_element_custom_width_mobile": px(100, "%"),
         "_css_classes": "botao-compra"}
    s.update(tipo("typography", "Sora", 800, 17, 1.2, ls=0.3, transform="uppercase"))
    s.update(sombra("button_box_shadow", 8, 0, "#C9C600"))
    return widget("button", s)


def icone(valor, cor=ROXO, tam=22, fundo=None, cor_icone=None, link=None):
    s = {"selected_icon": {"value": valor, "library": "fa-solid"}, "align": "center", "size": px(tam)}
    if fundo:
        s.update({"view": "stacked", "shape": "circle", "primary_color": fundo,
                  "secondary_color": cor_icone or BRANCO, "icon_padding": px(int(tam * 0.55))})
    else:
        s["primary_color"] = cor
    if link:
        s["link"] = {"url": link, "is_external": "", "nofollow": ""}
    return widget("icon", s)


def seta(ancora):
    return icone("fas fa-chevron-down", tam=20, fundo=AMARELO, cor_icone="#000000", link="#" + ancora)


def etiqueta(rotulo, fundo=FRAMB, cor=BRANCO, tam=14):
    """Pílula de texto (título pequeno com fundo e cantos arredondados)."""
    s = {"title": rotulo, "header_size": "p", "align": "center", "title_color": cor,
         "_background_background": "classic", "_background_color": fundo,
         "_border_radius": caixa(40), "_padding": caixa(10, 18), "_element_width": "auto",
         "_flex_align_self": "center"}
    s.update(tipo("typography", "Sora", 700, tam, 1.3))
    s.update(sombra("_box_shadow", 8, 20, "rgba(209,71,117,0.35)"))
    return widget("heading", s)


def cartao(filhos, fundo=BRANCO, raio=24, pad=(18, 16), forte=False, **s):
    st = {"background_background": "classic", "background_color": fundo, "border_radius": caixa(raio),
          "padding": caixa(pad[0], pad[1]), "flex_gap": gap(10)}
    st.update(sombra("box_shadow", 22 if forte else 14, 50 if forte else 34, SOMBRA_FORTE if forte else SOMBRA))
    st.update(s)
    return container(filhos, **st)


def linha_check(rotulo, cor_icone=ROXO):
    """Pílula branca com ícone de check e texto (listas 'feito para você' e 'é pra você que')."""
    return cartao([icone("fas fa-check-circle", cor=cor_icone, tam=24),
                   texto(rotulo, tam=15, cor=PRETO, alinhar="left", peso=600, lh=1.35,
                         _flex_grow=1, _margin=caixa(0))],
                  raio=18, pad=(13, 16), flex_direction="row", flex_align_items="center", flex_gap=gap(12))


def grade(filhos, colunas=2, espaco=12):
    """Linha com quebra para montar grades de 2 colunas."""
    largura = 100 / colunas
    for f in filhos:
        f["settings"]["width"] = px(round(largura - 2.4, 2), "%")
        f["settings"]["width_mobile"] = px(round(largura - 2.4, 2), "%")
    return container(filhos, flex_direction="row", flex_wrap="wrap", flex_gap=gap(espaco),
                     flex_justify_content="space-between")


def faixa(html):
    return container([titulo(html, "h2", 23, 21, BRANCO, 800, lh=1.3)],
                     background_background="gradient", background_color=ROXO, background_color_b=VIOLETA,
                     background_gradient_angle=px(170, "deg"), padding=caixa(26, 16))


def destaque(t, cor):
    return f'<span style="color:{cor}">{t}</span>'


def marca(t, fundo=AMARELO, cor=PRETO):
    return f'<span style="background:{fundo};color:{cor};padding:0 8px;border-radius:8px">{t}</span>'


# ---------- blocos ----------

PROMESSAS = {
    "A": (f'Perca {destaque("até 7cm de barriga em 7 dias", AMARELO)} e volte a vestir as roupas que você ama',
          "no Desafio 7 em 7"),
    "F": (f'Descubra como {destaque("perder até 7&nbsp;cm de barriga em 7 dias", AMARELO)} sem gastar R$500 por mês com canetinha',
          "no Desafio 7 em 7"),
    "E": (f'Reduza {destaque("até 7 cm de barriga", AMARELO)} sem gastar R$3.000 com canetinhas',
          "no Desafio 7 em 7"),
    "B": (f'Chega de se sentir mal {destaque("diante do espelho", AMARELO)}',
          "Comece o Desafio 7 em 7 e veja sua barriga mudar"),
}


RUMINACOES = {
    "padrao": ["A calça que um dia serviu agora nem fecha", "Você abre o guarda-roupa e nada te veste bem",
               "Só compra roupa larga para esconder a barriga", "Evita foto, espelho e roupa colada por causa da barriga"],
    # Versão E: da página Desafio Efeito Mounjaro da Michele
    # Versão F (página única): mistura C + E, ancorada em R$500/mês de canetinha
    "final": ['A calça que um dia serviu agora nem fecha', 'Você emagrece, mas a barriga continua', 'Já pensou na canetinha, mas R$500 todo mês pesa no bolso', 'Depois dos 40 parece muito mais difícil', 'Só compra roupa larga para esconder a barriga', 'Já tentou dieta, treino e nada resolve'],
    "mounjaro": ["Sua barriga simplesmente não vai embora", "Você emagrece, mas a barriga continua",
                 "Depois dos 40 parece muito mais difícil", "Já tentou dieta, treino e nada resolve",
                 "Se sente frustrada com o próprio corpo", "Sente que a mente sabota seus resultados"],
}


PILULAS_3 = ['Sem agulha, sem remédio e sem gastar R$3.000', 'Só 15 minutos por dia, no seu ritmo', 'Acompanhando suas medidas dia a dia']


def pilula_topo(txt, largura=300, largura_mob=280):
    return container([icone("fas fa-check-circle", cor=AMARELO, tam=24),
                      texto(txt, tam=15, cor=BRANCO, peso=700, familia="Sora", alinhar="left", lh=1.3, _margin=caixa(0))],
                     flex_direction="row", flex_align_items="center", flex_gap=gap(10), _flex_align_self="center",
                     width=px(largura), width_mobile=px(largura_mob),
                     background_background="classic", background_color="rgba(255,255,255,0.14)",
                     border_border="solid", border_width=caixa(1), border_color="rgba(255,255,255,0.35)",
                     border_radius=caixa(40), padding=caixa(10, 20, 10, 12), flex_justify_content="flex-start")


def pilulas_topo(v):
    if v in ("C", "E", "F"):  # versões C, E e F: 3 pílulas
        return [pilula_topo(t, 400, 340) for t in PILULAS_3]
    p = pilula_topo("Só seguir o passo a passo")
    p["settings"]["flex_justify_content"] = "center"
    return [p]


def b03(promessa, avatar, rum="padrao", v="A"):
    titulo_p, depois = PROMESSAS[promessa]
    ruminacoes = RUMINACOES[rum]
    cards = [cartao([icone("fas fa-times", tam=12, fundo="rgba(255,255,255,0.2)"),
                     texto(r, tam=14, cor=BRANCO, peso=700, familia="Sora", lh=1.35, alinhar="left", _margin=caixa(0))],
                    fundo=FRAMB, raio=22, pad=(18, 14), forte=True, flex_align_items="flex-start") for r in ruminacoes]
    hero = [imagem("hero-antes-depois-avatar.webp" if avatar else "hero-antes-depois.webp",
                   "Antes e depois com fita métrica na cintura", _margin=caixa(10, -16, 0, -16),
                   width_mobile=px(100, "%"))]
    filhos = [
        imagem("logo-desafio-7em7-branca.png", "Desafio 7 em 7", largura=62, width_mobile=px(50, "%")),
        etiqueta("Barriga que não cabe mais na calça?"),
        titulo(titulo_p, "h1", 36, 29, BRANCO, 800, lh=1.16),
        titulo(depois, "p", 22, 21, ROSA_CLARO, 800, lh=1.25, _margin=caixa(-6, 0, 0, 0)),
        *pilulas_topo(v),
        *hero,
        grade(cards),
    ]
    return bloco("03 · Ruminação / 1ª dobra", [caixa_conteudo(filhos, pad=(28, 16, 90, 16))],
                 gradiente=(ROXO, VIOLETA), onda=ROSA_FUNDO, ancora="b03")


def b04():
    filhos = [
        etiqueta("Nada que você veste tampa a sua barriga?"),
        titulo(f'Comece a diminuir a barriga e a trabalhar sua cintura com um plano prático de 7 dias, para voltar a vestir as roupas que você ama — {destaque("no Desafio 7 em 7.", ROXO)}',
               "p", 19, 19, PRETO, 700, lh=1.35),
        titulo("Feito para você que:", "p", 18, 18, ROXO, 800, _margin=caixa(10, 0, 0, 0)),
        linha_check("Sente a barriga marcando nas roupas e quer mudar isso"),
        linha_check("Tem uma calça favorita que não fecha mais"),
        linha_check("Quer um plano simples, de poucos minutos por dia, para fazer em casa"),
        container([imagem("barriga-calca-aberta.webp", "Barriga sobre a calça que não fecha")],
                  background_background="gradient", background_color=ROXO, background_color_b=VIOLETA,
                  background_gradient_angle=px(170, "deg"), border_radius=caixa(200, 200, 40, 40),
                  # corta a foto no formato do arco: os cantos retos do recorte não podem sair da curva (bug de 26/10)
                  overflow="hidden", padding=caixa(0), _margin=caixa(20, 0, 0, 0), **sombra("box_shadow", 22, 50, SOMBRA_FORTE)),
    ]
    return bloco("04 · Feito para você que", [caixa_conteudo(filhos)], fundo=ROSA_FUNDO, onda=BRANCO, ancora="b04")


def b05():
    fotos = []
    for i in range(1, 7):
        fotos.append(container([
            imagem(f"resultado-{i}.webp", "Antes e depois de aluna", raio=0),
            titulo("Resultado em 7 dias", "p", 11.5, 11.5, BRANCO, 800, lh=1.2, ls=0.3,
                   _background_background="gradient", _background_color=ROXO, _background_color_b=VIOLETA,
                   _padding=caixa(9, 4), typography_text_transform="uppercase"),
        ], background_background="classic", background_color=BRANCO, border_radius=caixa(18),
            overflow="hidden", flex_gap=gap(0)))
    moldura = container([grade(fotos)], background_background="classic", background_color=PRETO,
                        border_radius=caixa(28), padding=caixa(14), **sombra("box_shadow", 22, 50, SOMBRA_FORTE))
    filhos = [titulo(f'Veja o antes e depois de alunas da Michele<br>{destaque("Resultado em 7 dias", ROXO)}', "h2", 31, 27),
              moldura, texto("Os resultados variam de pessoa para pessoa.", tam=13, cor="#777777")]
    return bloco("05 · Antes e depois", [caixa_conteudo(filhos)], fundo=BRANCO, onda=ROSA_FUNDO, ancora="b05")


def balao(frase):
    return container([texto(frase, tam=14, cor=BRANCO, peso=700, familia="Sora", lh=1.3, _margin=caixa(0))],
                     background_background="classic", background_image=img_url("balao-pensamento.png"),
                     background_size="contain", background_position="center center", background_repeat="no-repeat",
                     width=px(230), width_mobile=px(48, "%"), min_height=px(163), min_height_mobile=px(122),
                     padding=caixa(18, 22, 30, 18),
                     flex_justify_content="center")


def b06(v="A"):
    e = v in ("E", "F")
    pensamentos = ["Nenhuma calça fecha mais em mim", "Todo mundo vai notar minha barriga",
                   "Será que só com canetinha eu resolvo?" if e else "Já tentei de tudo e nada funciona",
                   "Não me reconheço mais no espelho"]
    foto = imagem("foto-espelho-pensamentos-e.webp" if e else "foto-espelho-pensamentos.webp",
                  "Mulher na frente do espelho com pensamentos sobre a barriga: " + " · ".join(pensamentos), raio=28,
                  image_border_border="solid", image_border_width=caixa(5), image_border_color=BRANCO,
                  _margin=caixa(10, 0, 0, 0), **sombra("image_box_shadow", 22, 50, SOMBRA_FORTE))
    filhos = [titulo(f'Eu sei… você já tentou de tudo e {destaque("a barriga continua aí,", ROXO)}', "p", 22, 22, PRETO, 700, lh=1.3),
              texto("se sente mal e sofre todo dia com pensamentos como:", tam=17),
              foto]
    return bloco("06 · Pensamentos", [caixa_conteudo(filhos)], gradiente=(ROSA_FUNDO, "#FBE1F6"), onda=BRANCO,
                 ancora="b06", background_gradient_angle=px(180, "deg"))


# Ajustes de copy só da versão E (aprovados pelo Patrik): (antes, depois)
COPY_E = [
    ("sem dietas radicais e sem promessas mirabolantes.", "sem dietas radicais e sem gastar com canetinhas."),
    (f'Enfim, se você quer {destaque("voltar a vestir as roupas que ama", AMARELO)} e se sentir bem com a sua barriga e a sua cintura, o Desafio 7 em 7 é para você',
     f'Enfim, se você quer {destaque("reduzir até 7 cm de barriga", AMARELO)} sem gastar R$3.000 com canetinhas, o Desafio 7 em 7 é para você'),
]


# Ajustes da versão F por cima da E (aprovados pelo Patrik)
COPY_F = [
    ("Barriga que não cabe mais na calça?", "Pensando em gastar R$500 por mês com canetinha?"),
    ("Sem agulha, sem remédio e sem gastar R$3.000", "Sem canetinha"),
    ("Pensou em usar canetinha, mas não quer gastar R$3.000 com isso", "Pensou em usar canetinha, mas não quer gastar R$500 todo mês"),
    (f'Enfim, se você quer {destaque("reduzir até 7 cm de barriga", AMARELO)} sem gastar R$3.000 com canetinhas, o Desafio 7 em 7 é para você',
     f'Enfim, se você quer {destaque("reduzir até 7 cm de barriga", AMARELO)} sem gastar R$500 por mês com canetinha, o Desafio 7 em 7 é para você'),
]


def trocar_copy(conteudo, trocas):
    achou = {a: 0 for a, _ in trocas}

    def andar(e):
        for k, val in e["settings"].items():
            if isinstance(val, dict) and isinstance(val.get("alt"), str):  # texto alternativo das imagens
                for a, d in trocas:
                    val["alt"] = val["alt"].replace(a, d)
            if isinstance(val, str):
                for a, d in trocas:
                    if a in val:
                        achou[a] += val.count(a)
                        val = val.replace(a, d)
                e["settings"][k] = val
        for f in e["elements"]:
            andar(f)
    for e in conteudo:
        andar(e)
    for a, n in achou.items():
        assert n == 1, (a, n)


def b07():
    alerta = container([
        icone("fas fa-exclamation-triangle", cor=AMARELO, tam=64),
        titulo("Agora eu te pergunto...", "h3", 22, 22, AMARELO, 800),
        texto("Você está disposta a dedicar 15 minutos por dia, durante 7 dias, em casa, seguindo um passo a passo simples para começar a mudar sua barriga e sua cintura?",
              tam=17, cor=BRANCO, peso=600, lh=1.45),
        titulo("Se sua resposta for sim, o Desafio 7 em 7 é para você", "p", 19, 19, AMARELO, 800, lh=1.3),
    ], background_background="gradient", background_color=FRAMB, background_color_b=ROXO,
        background_gradient_angle=px(160, "deg"), border_radius=caixa(28), padding=caixa(30, 22, 32, 22),
        flex_gap=gap(10), **sombra("box_shadow", 22, 50, SOMBRA_FORTE))
    filhos = [titulo(f'É horrível ter todos esses pensamentos, né? {destaque("Você merece voltar a se sentir bem com as roupas que ama,", ROXO)} sem dietas radicais e sem promessas mirabolantes.',
                     "p", 20, 20, PRETO, 700, lh=1.35),
              alerta, seta("b08")]
    return bloco("07 · Alerta", [caixa_conteudo(filhos, pad=(64, 16, 40, 16))], fundo=BRANCO, ancora="b07")


def b08():
    itens = [("icone-roupas-marcando.png", "Começar a diminuir a barriga que fica marcando suas roupas."),
             ("icone-pochete.png", "Trabalhar aquela pochete insistente que tanto te incomoda."),
             ("icone-calca.png", "Dar os primeiros passos para voltar a vestir aquela calça que não fecha."),
             ("icone-cintura.png", "Trabalhar sua cintura para conquistar uma silhueta mais definida."),
             ("icone-cabide.png", "Voltar a escolher as roupas que ama, e não apenas as que servem."),
             ("icone-plano-7-dias.png", "Seguir um plano prático de 7 dias, com exercícios e hábitos para fazer em casa.")]
    cards = [cartao([imagem(ic, "", largura=40, width_mobile=px(44, "%"), **sombra("_box_shadow", 8, 18, "rgba(158,4,124,0.2)"),
                            _border_radius=caixa(200)),
                     texto(t, tam=14, cor=PRETO, peso=600, lh=1.4, _margin=caixa(0))],
                    raio=24, pad=(18, 12), border_border="solid", border_width=caixa(0, 0, 4, 0), border_color=ROSA_CLARO,
                    flex_align_items="center") for ic, t in itens]
    filhos = [titulo("Ao fim dos 7 dias, você vai:", "p", 18, 18, PRETO, 700), grade(cards)]
    return bloco("08 · Benefícios", [faixa(f'Com o {marca("Desafio 7 em 7", BRANCO, ROXO)}, você vai:'),
                                     caixa_conteudo(filhos, pad=(30, 16, 72, 16))],
                 fundo=ROSA_FUNDO, onda=BRANCO, ancora="b08")


def item(mockup, alt, dest, resto, desc, forte=None, selo=None):
    vitrine_filhos = []
    if selo:
        vitrine_filhos.append(etiqueta(selo, AMARELO, "#000000", 12) | {})
        vitrine_filhos[-1]["settings"]["_flex_align_self"] = "flex-start"
    vitrine_filhos.append(imagem(mockup, alt, largura=82, width_mobile=px(64, "%")))
    vitrine = container(vitrine_filhos, background_background="gradient", background_color=ROXO,
                        background_color_b=VIOLETA, background_gradient_angle=px(170, "deg"),
                        padding=caixa(20, 24, 10, 24), flex_gap=gap(6))
    corpo = desc + (f" <strong style=\"color:{PRETO}\">{forte}</strong>" if forte else "")
    txt = container([titulo(f'{destaque(dest, ROXO)} {resto}', "h3", 20, 20, PRETO, 800, lh=1.25),
                     texto(corpo, tam=15.5)], padding=caixa(20, 20, 24, 20), flex_gap=gap(10))
    return container([vitrine, txt], background_background="classic", background_color=BRANCO,
                     border_radius=caixa(28), overflow="hidden", flex_gap=gap(0), **sombra("box_shadow"))


def b09():
    itens = [
        item("mockup-comece-aqui.webp", "Capa Comece Aqui", "Comece Aqui:", "Sua Jornada Começa Agora",
             "Descubra como funciona o Desafio 7 em 7, como acessar suas aulas e o que fazer em cada dia para aproveitar ao máximo o método.",
             "Você vai começar sabendo exatamente o que fazer, sem ficar perdida!"),
        item("mockup-avaliacao-inicial.webp", "Capa Conheça Sua Barriga", "Conheça Sua Barriga:", "Avaliação Inicial",
             "Aprenda a observar seu abdômen, conhecer sinais que podem indicar alterações como a diástase e entender quando é importante buscar uma avaliação profissional. Você também vai aprender a registrar suas fotos e medidas para acompanhar sua evolução.",
             "Assim, você começa sua jornada com um ponto de partida claro e consegue acompanhar suas mudanças."),
        item("mockup-15-minutos-por-dia.webp", "Aulas 15 Minutos por Dia", "15 Minutos por Dia:", "Barriga e Cintura em Ação",
             "Aulas práticas de 15 minutos combinando exercícios funcionais, respiração e hipopressivos para trabalhar o abdômen, fortalecer a musculatura e melhorar a postura.",
             "Uma rotina para fazer em casa, mesmo com o dia corrido!"),
        item("mockup-mente-magra-diva.webp", "Áudio Mente Magra e Diva", "Ative Sua Mente", "Magra e Diva",
             "Um áudio exclusivo de motivação e visualização para reforçar o compromisso com sua rotina e incentivar atitudes alinhadas aos seus objetivos.",
             "Um momento diário para se conectar com a mulher que você deseja se tornar."),
        item("mockup-planner-diva.webp", "Planner Diva aberto", "Planner Diva:", "Seus 7 Dias de Transformação",
             "Um planner prático para organizar sua jornada, acompanhar seus exercícios e colocar em ação os 5 Pilares da Mulher Diva.",
             "Você terá um roteiro diário para saber o que fazer e acompanhar seu progresso durante os sete dias."),
    ]
    filhos = [titulo(f'Veja tudo o que você vai receber no {destaque("Desafio 7 em 7", ROXO)}', "h2", 31, 27),
              texto("Um passo a passo de 7 dias para começar a cuidar da barriga, trabalhar sua cintura e construir hábitos que ajudam você a avançar em direção às roupas que ama vestir!",
                    tam=17, peso=600),
              container(itens, flex_gap=gap(26), _margin=caixa(14, 0, 0, 0)), seta("b10")]
    return bloco("09 · O que você vai receber", [caixa_conteudo(filhos, pad=(64, 16, 40, 16))], fundo=BRANCO, ancora="b09")


def b10():
    itens = [
        item("mockup-bonus1-calca-favorita.webp", "Capa Projeto Minha Calça Favorita", "Projeto", "Minha Calça Favorita",
             "Aprenda a acompanhar sua evolução usando aquela peça que você tanto quer voltar a vestir.", selo="Bônus 1"),
        item("mockup-bonus2-cardapio-emergencia.webp", "Capa Cardápio de Emergência Diva", "Cardápio de", "Emergência Diva",
             "Tenha ideias práticas de refeições para os dias corridos e não fique sem saber o que comer.", selo="Bônus 2"),
        item("mockup-bonus3-cintura-ativa.webp", "Capa Cintura Ativa: Rotina Express", "Cintura Ativa:", "Rotina Express",
             "Uma aula extra de apenas 5 minutos para trabalhar postura e ativação abdominal, mesmo quando o tempo estiver curto.", selo="Bônus 3"),
    ]
    filhos = [container(itens, flex_gap=gap(26)),
              titulo("Tudo pensado para ajudar você a dar continuidade aos seus cuidados com a barriga e a cintura, um dia de cada vez!",
                     "p", 18, 18, ROXO, 700, lh=1.4, _margin=caixa(12, 0, 0, 0))]
    return bloco("10 · Bônus", [faixa(f'E ainda tem {marca("3 bônus especiais", BRANCO, ROXO)} para você!'),
                                caixa_conteudo(filhos, pad=(30, 16, 72, 16))],
                 fundo=ROSA_FUNDO, onda=BRANCO, ancora="b10")


CARTOES = [
    ("Sente a barriga marcando nas roupas e quer mudar isso", "c1-roupa-marcando"),
    ("Tem uma calça que não fecha mais e quer voltar a vesti-la", "c2-calca-nao-fecha"),
    ("Já tentou de tudo e sente que a barriga não sai do lugar", "c3-barriga-nao-sai"),
    ("Tem pouco tempo e precisa de algo prático, para fazer em casa", "c4-pouco-tempo"),
    ("Quer trabalhar barriga e cintura sem depender de dietas radicais", "c5-sem-dieta-radical"),
    ("Sente que a mente sabota seus resultados e quer mudar isso", "c6-mente-sabota"),
    ("Quer um passo a passo claro para saber o que fazer a cada dia", "c7-passo-a-passo"),
]
CARTOES_E = {2: ("Pensou em usar canetinha, mas não quer gastar R$3.000 com isso", "c3e-canetinha"),
             5: ("Quer cuidar da mente e do corpo ao mesmo tempo", "c6e-mente-e-corpo")}


def cartao_foto(txt, img):
    return container([imagem(f"cartao-{img}.webp", txt),
                      texto(txt, tam=13.5, cor=BRANCO, peso=600, alinhar="left", lh=1.35,
                            _padding=caixa(12, 12, 14, 12), _margin=caixa(0))],
                     background_background="classic", background_color=PRETO, border_radius=caixa(20),
                     overflow="hidden", flex_gap=gap(0), **sombra("box_shadow"))


def b11(v="A"):
    lista = [CARTOES_E.get(i, c) if v in ("E", "F") else c for i, c in enumerate(CARTOES)]
    grade_cartoes = grade([cartao_foto(t, i) for t, i in lista])
    grade_cartoes["settings"]["flex_justify_content"] = "center"
    preta = container([titulo(f'Enfim, se você quer {destaque("voltar a vestir as roupas que ama", AMARELO)} e se sentir bem com a sua barriga e a sua cintura, o Desafio 7 em 7 é para você',
                              "p", 18, 18, BRANCO, 700, lh=1.4)],
                      background_background="classic", background_color=PRETO, border_radius=caixa(24),
                      padding=caixa(24, 20), _margin=caixa(10, 0, 0, 0), **sombra("box_shadow", 22, 50, SOMBRA_FORTE))
    dois = container([titulo("Se você se identifica com ao menos 2 itens acima, o Desafio 7 em 7 é para você!",
                             "p", 17, 17, ROXO, 700, lh=1.4)],
                     background_background="classic", background_color=BRANCO, border_border="solid",
                     border_width=caixa(2), border_color=ROXO, border_radius=caixa(22), padding=caixa(18))
    filhos = [titulo(f'O {destaque("Desafio 7 em 7", ROXO)} é pra você que', "h2", 31, 27),
              grade_cartoes, preta, dois,
              texto("Toque no botão abaixo e receba agora o seu acesso ao desafio de 7 dias", tam=15.5, cor=PRETO, peso=600),
              seta("b12")]
    return bloco("11 · O Desafio 7 em 7 é pra você que", [caixa_conteudo(filhos)], fundo=BRANCO, onda=ROSA_FUNDO, ancora="b11")


def b12():
    linhas = [("Comece Aqui: Sua Jornada Começa Agora", 47), ("Conheça Sua Barriga: Avaliação Inicial", 97),
              ("15 Minutos por Dia: Barriga e Cintura em Ação", 148), ("Ative Sua Mente Magra e Diva", 47),
              ("Planner Diva: Seus 7 Dias de Transformação", 47), ("Bônus 1: Projeto Minha Calça Favorita", 37),
              ("Bônus 2: Cardápio de Emergência Diva", 37), ("Bônus 3: Cintura Ativa: Rotina Express", 37)]
    rows = [container([icone("fas fa-check-circle", cor=ROXO, tam=20),
                       texto(n, tam=14.5, cor=PRETO, peso=600, lh=1.35, alinhar="left", _flex_grow=1, _margin=caixa(0)),
                       texto(f'<s>R$&nbsp;{v}</s>', tam=14, cor=FRAMB, peso=800, familia="Sora", alinhar="right", _margin=caixa(0), _flex_size="none")],
                      flex_direction="row", flex_align_items="center", flex_gap=gap(12), padding=caixa(12, 0),
                      border_border="dashed", border_width=caixa(0, 0, 1.5, 0), border_color="#E8CFE4")
            for n, v in linhas]
    rows.append(titulo(f'Total {destaque("<s>R$ 497</s>", FRAMB)}', "p", 20, 20, PRETO, 800, _margin=caixa(8, 0, 0, 0)))
    recap = cartao(rows, raio=28, pad=(10, 18), flex_gap=gap(0))
    filhos = [titulo(f'{destaque("Recapitulando:", ROXO)}<br>tudo o que você recebe', "h2", 31, 27), recap]
    fx = faixa("MAS HOJE VOCÊ TEM ACESSO AO DESAFIO 7 EM 7 JUNTO COM TODOS OS BÔNUS POR APENAS:")
    fx["elements"].append(seta("b13"))
    fx["settings"]["padding"] = caixa(30, 16, 30, 16)
    fx["settings"]["flex_gap"] = gap(14)
    return bloco("12 · Recapitulando", [caixa_conteudo(filhos, pad=(64, 16, 40, 16)), fx], fundo=ROSA_FUNDO, ancora="b12")


def oferta(n, ancora=False):
    fita = titulo("7 DIAS", "p", 14, 14, "#000000", 800, ls=1,
                  _background_background="classic", _background_color=AMARELO, _padding=caixa(7, 0),
                  _element_width="initial", _element_custom_width=px(180), _position="absolute",
                  _offset_orientation_h="start", _offset_x=px(-46), _offset_y=px(22),
                  _transform_rotate_popover="transform", _transform_rotateZ_effect=px(-45, "deg"), _z_index=3)
    selos = container([
        container([icone(ic, cor=BRANCO, tam=24),
                   texto(f'{a}<br><strong>{b}</strong>', tam=12, cor=BRANCO, peso=600, lh=1.2, alinhar="left", _margin=caixa(0))],
                  flex_direction="row", flex_align_items="center", flex_gap=gap(8), width=px(31, "%"), width_mobile=px(31, "%"))
        for ic, a, b in [("fas fa-shield-alt", "Compra", "Segura"), ("fas fa-award", "7 Dias de", "Garantia"),
                         ("fas fa-lock", "Privacidade", "Protegida")]],
        flex_direction="row", flex_justify_content="center", flex_gap=gap(8), _margin=caixa(10, 0, 0, 0))
    cartao_oferta = container([
        fita,
        container([imagem("mockup-kit.webp", "Tudo o que vem no Desafio 7 em 7")], padding=caixa(30, 10, 4, 10),
                  padding_mobile=caixa(26, 26, 2, 26),
                  background_background="gradient", background_color="rgba(40,0,50,0.35)", background_color_b="rgba(40,0,50,0)",
                  background_gradient_angle=px(180, "deg")),
        container([
            titulo("Desafio 7 em 7", "h3", 26, 26, BRANCO, 800),
            texto("Tudo isso valeria <s>R$ 497</s>", tam=16, cor=BRANCO, _margin=caixa(0)),
            titulo("Por apenas", "p", 18, 18, BRANCO, 700, _margin=caixa(8, 0, 0, 0)),
            titulo(f'<span style="font-size:0.45em">R$</span>47', "p", 76, 76, AMARELO, 800, lh=1, ls=-2),
            texto("à vista, pagamento único", tam=15, cor=BRANCO, _margin=caixa(0)),
            titulo(f'ou {destaque("12x de R$ 4,83", AMARELO)}', "p", 18, 18, BRANCO, 600, _margin=caixa(0, 0, 12, 0)),
            *([etiqueta("Mais de 7x mais barato que 1 mês de canetinha", "rgba(255,255,255,0.16)", BRANCO, 13.5)] if ancora else []),
            botao(), selos,
        ], padding=caixa(6, 20, 26, 20), flex_gap=gap(6)),
    ], background_background="gradient", background_color=ROXO, background_color_b=VIOLETA,
        background_gradient_angle=px(170, "deg"), border_radius=caixa(32), overflow="hidden", flex_gap=gap(0),
        **sombra("box_shadow", 22, 50, SOMBRA_FORTE))
    garantia = cartao([imagem("selo-garantia-7-dias.webp", "Garantia de 7 dias", largura=100, width=px(92), _element_width="initial",
                              _element_custom_width=px(92), _element_custom_width_mobile=px(72), _flex_shrink=0),
                       texto(f'<strong style="color:{ROXO};font-family:Sora;font-size:16px">Você participa sem risco.</strong><br>Se dentro do prazo legal você perceber que o desafio não faz sentido para você, pode solicitar o reembolso conforme a política da plataforma.',
                             tam=14.5, alinhar="left", _margin=caixa(0), _flex_grow=1)],
                      raio=24, pad=(16, 18), flex_direction="row", flex_align_items="center", flex_gap=gap(16))
    nome = "13 · Oferta" if n == "13" else "16 · Oferta repetida"
    # versão F: "Descubra como" no início da oferta (pedido do Patrik em 23/10)
    descubra = [titulo(f'Descubra como {destaque("perder até -7cm de barriga em 7 dias", ROXO)} sem gastar R$500 por mês com canetinha',
                       "h2", 31, 27, lh=1.2)] if ancora else []
    return bloco(nome, [caixa_conteudo([*descubra, cartao_oferta, garantia], pad=(56, 16, 72, 16), flex_gap=gap(20))],
                 fundo=ROSA_FUNDO, onda=BRANCO, ancora="b" + n)


def b14():
    def opcao(n, icone_v, cor, frase):
        return cartao([
            container([icone(icone_v, tam=24, fundo=cor), titulo(f"Opção {n}", "h3", 22, 22, cor, 800, _margin=caixa(0))],
                      flex_direction="row", flex_align_items="center", flex_gap=gap(14)),
            texto(frase, tam=15.5, cor=PRETO, alinhar="left", _margin=caixa(0)),
        ], raio=26, pad=(20, 20), border_border="solid", border_width=caixa(0, 0, 6, 0), border_color=cor)
    filhos = [titulo(f'Agora você tem {destaque("duas opções:", ROXO)}', "h2", 31, 27),
              opcao(1, "fas fa-times", VERM, "Fechar esta página, continuar escondendo a barriga com roupas largas e seguir tentando de tudo, sem um plano. Daqui a alguns meses, a calça continua sem fechar e a frustração diante do espelho é a mesma."),
              opcao(2, "fas fa-check", VERDE, "Começar hoje o Desafio 7 em 7, por apenas R$ 47, e seguir um passo a passo de 15 minutos por dia, em casa, para trabalhar sua barriga e sua cintura, com todos os bônus incluídos."),
              titulo(f'Eu sei e você também sabe, {destaque("a opção 2 é a mais inteligente", ROXO)} e é a que você mais precisa', "p", 18, 18, PRETO, 700, lh=1.4),
              titulo("Então toque no botão abaixo e receba agora seu desafio de 7 dias", "p", 16, 16, ROXO, 700, lh=1.4),
              botao()]
    return bloco("14 · Duas opções", [caixa_conteudo(filhos, pad=(64, 16, 150, 16))], fundo=BRANCO, onda=PRETO, ancora="b14")


def b15():
    creds = ["Educadora Física desde 2005", "Mais de 10 especializações",
             "Especialista e licenciada na técnica da Barriga Negativa", "Autora do livro Vida Diva (2025)"]
    lista = [cartao([icone("fas fa-circle", cor=ROSA_CLARO, tam=10),
                     texto(c, tam=15, cor=BRANCO, peso=600, alinhar="left", lh=1.35, _margin=caixa(0))],
                    fundo="rgba(255,255,255,0.06)", raio=16, pad=(12, 14), flex_direction="row",
                    flex_align_items="center", flex_gap=gap(12), box_shadow_box_shadow_type="")
             for c in creds]
    retrato = container([imagem("michele-recorte.webp", "Michele Salla", _margin=caixa(-90, 0, 0, 0))],
                        background_background="gradient", background_color=ROXO, background_color_b=VIOLETA,
                        background_gradient_angle=px(170, "deg"), border_radius=caixa(220, 220, 40, 40),
                        padding=caixa(0, 10), _margin=caixa(-20, 0, 0, 0), width=px(84, "%"), width_mobile=px(70, "%"),
                        _flex_align_self="center", **sombra("box_shadow", 0, 80, "rgba(212,72,194,0.45)"))
    vez = container([titulo("Agora chegou a sua vez de seguir esse desafio de 7 dias e voltar a se sentir bem com a sua barriga e as suas roupas",
                            "p", 17, 17, BRANCO, 700, lh=1.45)],
                    background_background="gradient", background_color=ROSA, background_color_b=ROXO,
                    background_gradient_angle=px(135, "deg"), border_radius=caixa(22), padding=caixa(20),
                    _margin=caixa(10, 0, 0, 0))
    filhos = [retrato,
              titulo("Michele Salla", "h2", 32, 32, ROSA_CLARO, 800, _margin=caixa(14, 0, 0, 0)),
              titulo("Criadora do Desafio 7 em 7", "p", 17, 17, BRANCO, 700),
              texto("Michele Salla é Educadora Física, especialista em emagrecimento comportamental e referência em transformação feminina há mais de 20 anos. Criadora do Desafio 7 em 7 e da metodologia que já ajudou milhares de mulheres a perderem a barriga sem viver de dietas, aprendendo a transformar primeiro a mente para, então, transformar o corpo.",
                    tam=16, cor="#EEEEEE", alinhar="left", lh=1.6),
              *lista, vez]
    return bloco("15 · Autora", [caixa_conteudo(filhos, pad=(0, 16, 72, 16))], fundo=PRETO, onda=ROSA_FUNDO, ancora="b15")


def b17():
    faq = [("Em quanto tempo vejo diferença?", "O Desafio 7 em 7 foi feito para 7 dias. Você registra suas fotos e medidas no começo e acompanha sua evolução até o fim do desafio. Os resultados variam de pessoa para pessoa."),
           ("E se eu não conseguir seguir o plano?", "São só 15 minutos por dia, em casa. E o Planner Diva te mostra o que fazer em cada um dos 7 dias, para você não ficar perdida."),
           ("E se o meu corpo não responder?", "Você participa sem risco. Se dentro do prazo legal você perceber que o desafio não faz sentido para você, pode solicitar o reembolso conforme a política da plataforma."),
           ("Já tentei de tudo e nada funcionou. Serve para mim?", "O Desafio 7 em 7 trabalha corpo e mente juntos: aulas práticas para a barriga e a cintura e o áudio Mente Magra e Diva para reforçar o compromisso com a sua rotina."),
           ("Preciso de academia?", "Não. As aulas são feitas em casa."),
           ("Tenho mais de 40 anos ou estou na menopausa. Posso fazer?", "Sim. Respeite os limites do seu corpo e, se tiver qualquer dúvida sobre a sua saúde, converse com o seu médico antes de começar."),
           ("Tenho diástase. Posso fazer?", "Sim! Você pode fazer o desafio mesmo tendo diástase. O material traz técnicas e exercícios que ajudam a fortalecer o abdômen e auxiliam na recuperação da diástase com segurança."),
           ("Tive bebê há pouco tempo ou tenho hérnia. Posso fazer?", "Nesses casos, você precisa de liberação médica antes de começar o desafio."),
           ("Quando eu recebo?", "Logo após a confirmação do pagamento, você recebe o acesso no seu e-mail."),
           ("É mensalidade?", "Não. É um pagamento único de R$ 47."),
           ("E depois dos 7 dias?", "O desafio foi feito para fazer em 7 dias, mas liberamos o seu acesso por 30 dias."),
           ("Como funciona a garantia?", "Você participa sem risco. Se dentro do prazo legal você perceber que o desafio não faz sentido para você, pode solicitar o reembolso conforme a política da plataforma.")]
    cards = [cartao([titulo(f'<span style="color:{ROXO}">▾</span> {p}', "h3", 16.5, 16.5, PRETO, 700, alinhar="left", lh=1.3),
                     texto(r, tam=15, alinhar="left", _margin=caixa(0))],
                    raio=20, pad=(18, 18), flex_gap=gap(8), border_border="solid", border_width=caixa(0, 0, 0, 5),
                    border_color=ROXO) for p, r in faq]
    filhos = [titulo(f'Perguntas {destaque("frequentes", ROXO)}', "h2", 31, 27), container(cards, flex_gap=gap(12))]
    return bloco("17 · FAQ", [caixa_conteudo(filhos)], fundo=BRANCO, onda=PRETO, ancora="b17")


def b18():
    topo = caixa_conteudo([
        imagem("logo-desafio-7em7-branca-vertical.png", "Desafio 7 em 7", largura=34, width_mobile=px(30, "%")),
        imagem("logo-michele-salla-branca.png", "Michele Salla", largura=30, width_mobile=px(30, "%"), opacity=0.85),
        texto("Copyright © 2026 Michele Salla · Desafio 7 em 7. Todos os direitos reservados.", tam=15, cor=BRANCO),
        texto("O Desafio 7 em 7 não é tratamento médico. Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook. Os resultados variam de pessoa para pessoa e a compra deste material não garante nenhum resultado específico. Usamos resultados reais de alunas.",
              tam=13.5, cor="#BBBBBB"),
    ], pad=(44, 16, 30, 16), flex_gap=gap(12))
    # Rastreio do painel (tempo por bloco, rolagem, cliques). data-checkout="sim": leva UTMs, fbclid e sck ao link
    # da Greenn no clique (aprovado pelo Patrik em 23/10).
    painel = ('<script async src="https://painel.michelesalla.com.br/rastreio.js" '
              'data-slug="desafio7em7-a" data-checkout="sim"></script>')
    rastreio = widget("html", {"html": "<script>\n" + (AQUI.parent / "rastreio" / "initiate-checkout.js").read_text(encoding="utf-8") + "</script>\n" + painel,
                               "_title": "Rastreio · CliqueComprar (pixel Meta) + painel"})
    final = container([texto("Veranópolis/RS · CNPJ 32.983.139/0001-99", tam=14, cor=BRANCO, _margin=caixa(0)), rastreio],
                      background_background="classic", background_color="#1A1A1A", padding=caixa(18, 16))
    return bloco("18 · Rodapé", [topo, final], fundo=PRETO, ancora="b18")


# ---------- celular: página mais compacta (pedido do Patrik em 23/10) ----------
# Só mexe nos valores "_mobile" (letra, espaço, ícone). Computador e ordem dos blocos ficam iguais.

def letra_celular(t):
    """Tamanho de letra no celular, a partir do tamanho que valia no celular antes."""
    if t >= 60:
        n = t * 0.8          # preço
    elif t >= 24:
        n = t * 0.86         # promessa e títulos
    elif t >= 19:
        n = t * 0.9
    elif t >= 17:
        n = t * 0.92
    elif t >= 15:
        n = t - 1
    else:
        n = max(11, t - 0.5)
    return round(n * 2) / 2


def compactar_geral(conteudo):
    """Página mais enxuta no computador e no celular (pedido do Patrik em 27/10, comparando com efeitolipo.com.br/a):
    menos espaço em cima/embaixo dos blocos, menos vão entre itens, ondas mais baixas, botão e preço menores."""
    def andar(e):
        s = e["settings"]
        if e["elType"] == "container":
            pad = s.get("padding")
            if pad and max(int(float(pad["top"])), int(float(pad["bottom"]))) >= 30:
                t, b = (round(int(float(pad[x])) * 0.62) for x in ("top", "bottom"))
                s["padding"] = caixa(t, pad["right"], b, pad["left"])
            g = s.get("flex_gap")
            if g and g["size"] >= 14:
                s["flex_gap"] = gap(round(g["size"] * 0.75))
            if s.get("shape_divider_bottom_height"):
                s["shape_divider_bottom_height"], s["shape_divider_bottom_height_mobile"] = px(40), px(20)
        if e.get("widgetType") == "button":
            for k in ("typography_font_size",):
                if s.get(k) and s[k]["size"] > 15:
                    s[k] = px(15)
                    s.pop(k + "_mobile", None)
        for k in [k for k in s if k.endswith("_font_size")]:
            if s[k].get("size", 0) >= 70:  # preço grande da oferta
                s[k] = px(round(s[k]["size"] * 0.8))
                s.pop(k + "_mobile", None)
        for f in e["elements"]:
            andar(f)
    for e in conteudo:
        andar(e)


def compactar_celular(conteudo):
    def andar(e):
        s = e["settings"]
        for k in [k for k in s if k.endswith("_font_size")]:
            base = s.get(k + "_mobile") or s[k]
            s[k + "_mobile"] = px(letra_celular(base["size"]))
        if e["elType"] == "container":
            pad = s.get("padding")
            if pad and "padding_mobile" not in s and max(int(float(pad["top"])), int(float(pad["bottom"]))) >= 24:
                t, b = (round(int(float(pad[x])) * 0.6) for x in ("top", "bottom"))
                s["padding_mobile"] = caixa(t, pad["right"], b, pad["left"])
            g = s.get("flex_gap")
            if g and g["size"] >= 12:
                s["flex_gap_mobile"] = gap(round(g["size"] * 0.7))
        if e.get("widgetType") == "icon" and s.get("size", {}).get("size", 0) >= 40:
            s["size_mobile"] = px(round(s["size"]["size"] * 0.65))
        for f in e["elements"]:
            andar(f)
    for e in conteudo:
        andar(e)


# versão: (promessa, avatar?, ruminações)
VERSOES = {"A": ("A", False, "padrao"), "B": ("B", False, "padrao"), "C": ("A", True, "padrao"),
           "D": ("B", True, "padrao"), "E": ("E", True, "mounjaro"), "F": ("F", True, "final")}


def montar(v):
    promessa, avatar, rum = VERSOES[v]
    conteudo = [b03(promessa, avatar, rum, v), b04(), b05(), b06(v), b07(), b08(), b09(), b10(), b11(v), b12(),
                oferta("13", v == "F"), b14(), b15(), oferta("16", v == "F"), b17(), b18()]
    if v in ("E", "F"):
        trocar_copy(conteudo, COPY_E)
    if v == "F":
        trocar_copy(conteudo, COPY_F)
    compactar_geral(conteudo)
    compactar_celular(conteudo)
    return {
        "version": "0.4",
        "title": f"Desafio 7 em 7 · Versão {v}",
        "type": "page",
        "page_settings": {"hide_title": "yes", "background_background": "classic", "background_color": ROSA_FUNDO},
        "content": conteudo,
    }


if __name__ == "__main__":
    for v in VERSOES:
        _rnd.seed(f"desafio-{v}")
        saida = Path(os.environ.get("SAIDA", AQUI)) / f"desafio-7em7-{v}.json"
        saida.write_text(json.dumps(montar(v), ensure_ascii=False, indent=1), encoding="utf-8")
        print(saida.name, round(saida.stat().st_size / 1024), "KB")
