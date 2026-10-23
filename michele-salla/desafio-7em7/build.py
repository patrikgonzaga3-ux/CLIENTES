"""Gera pagina-A, B, C, D e E a partir de _modelo.html.
E = C (avatar) com a promessa e as ruminações da página Desafio Efeito Mounjaro.
A e C: promessa "Perca até 7cm"; B e D: promessa "Chega de se sentir mal".
A e B usam antes e depois real de aluna; C e D usam avatar.
Uso: python3 build.py
"""
from pathlib import Path

AQUI = Path(__file__).parent

PROMESSAS = {
    "A": '<h1 class="promessa">Perca <span class="marca">até 7cm de barriga em 7 dias</span> e volte a vestir as roupas que você ama'
         '<span class="depois">no Desafio 7 em 7</span></h1>',
    "F": '<h1 class="promessa">Perca <span class="marca">até 7 cm de barriga em 7 dias</span> sem gastar R$500 por mês com canetinha'
         '<span class="depois">no Desafio 7 em 7</span></h1>',
    "E": '<h1 class="promessa">Reduza <span class="marca">até 7 cm de barriga</span> sem gastar R$3.000 com canetinhas'
         '<span class="depois">no Desafio 7 em 7</span></h1>',
    "B": '<h1 class="promessa">Chega de se sentir mal <span class="marca">diante do espelho</span>'
         '<span class="depois">Comece o Desafio 7 em 7 e veja sua barriga mudar</span></h1>',
}

SETA = ('<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" '
        'stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')


def oferta(n: str) -> str:
    nome = "Oferta" if n == "13" else "Oferta repetida"
    return f'''<section class="bloco oferta-bloco fundo-rosa" data-bloco="{n} · {nome}" id="b{n}">
  <div class="wrap">
    <div class="oferta">
      <span class="fita">7 DIAS</span>
      <div class="kit"><img src="assets/img/mockup-kit.webp" alt="Tudo o que vem no Desafio 7 em 7" width="1200" height="851" loading="lazy"></div>
      <div class="corpo">
        <h3>Desafio 7 em 7</h3>
        <p class="valeria">Tudo isso valeria <s>R$ 497</s></p>
        <p class="por">Por apenas</p>
        <p class="preco"><small>R$</small>67</p>
        <p class="avista">à vista, pagamento único</p>
        <p class="parcelas">ou <strong>12x de R$ 6,89</strong></p>
        <a class="botao botao-compra" href="https://payfast.greenn.com.br/199167/offer/1qsr9k">Sim, quero aproveitar a oferta {SETA}</a>
        <div class="selos">
          <div class="selo"><svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z"/><path d="M11 16l3.5 3.5L21 13"/></svg><span>Compra<b>Segura</b></span></div>
          <div class="selo"><svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="13" r="9"/><path d="M11 21l-3 8 5-2 3 3M21 21l3 8-5-2-3 3"/><path d="M13 13l2 2 4-4"/></svg><span>7 Dias de<b>Garantia</b></span></div>
          <div class="selo"><svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="14" width="20" height="14" rx="3"/><path d="M10 14V10a6 6 0 0 1 12 0v4"/><path d="M16 20v3"/></svg><span>Privacidade<b>Protegida</b></span></div>
        </div>
      </div>
    </div>
    <div class="garantia"><img src="assets/img/selo-garantia-7-dias.webp" alt="Garantia de 7 dias" width="400" height="400" loading="lazy">
      <p><strong>Você participa sem risco.</strong>Se dentro do prazo legal você perceber que o desafio não faz sentido para você, pode solicitar o reembolso conforme a política da plataforma.</p></div>
  </div>
  <div class="onda" style="color:#FFFFFF"><svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z"/></svg></div>
</section>'''


X = ('<span class="x"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round">'
     '<path d="M6 6l12 12M18 6L6 18"/></svg></span>')
RUMINACOES = {
    "padrao": ["A calça que um dia serviu agora nem fecha", "Você abre o guarda-roupa e nada te veste bem",
               "Só compra roupa larga para esconder a barriga", "Evita foto, espelho e roupa colada por causa da barriga"],
    # Versão E: promessa e ruminações da página Desafio Efeito Mounjaro da Michele (/desafio-efeito-mounjaro/)
    # Versão F (página única, aprovada pelo Patrik): mistura C + E, ancorada em R$500/mês de canetinha
    "final": ['A calça que um dia serviu agora nem fecha', 'Você emagrece, mas a barriga continua', 'Já pensou na canetinha, mas R$500 todo mês pesa no bolso', 'Depois dos 40 parece muito mais difícil', 'Só compra roupa larga para esconder a barriga', 'Já tentou dieta, treino e nada resolve'],
    "mounjaro": ["Sua barriga simplesmente não vai embora", "Você emagrece, mas a barriga continua",
                 "Depois dos 40 parece muito mais difícil", "Já tentou dieta, treino e nada resolve",
                 "Se sente frustrada com o próprio corpo", "Sente que a mente sabota seus resultados"],
}


def ruminacoes(chave):
    cards = "\n".join(f'      <div class="rumina">{X}{r}</div>' for r in RUMINACOES[chave])
    return f'<div class="ruminacoes">\n{cards}\n    '


HERO_REAL = ('<img class="hero-img" src="assets/img/hero-antes-depois.webp" '
             'alt="Antes e depois de aluna do Desafio 7 em 7, com fita métrica na cintura" width="1080" height="1200">')
HERO_AVATAR = ('<figure class="hero-img hero-fig"><img src="assets/img/hero-antes-depois-avatar.webp" '
               'alt="Antes e depois com fita métrica na cintura" width="1080" height="1200"></figure>')

# A e B: antes e depois real de aluna · C e D: mesmas promessas com avatar
# versão: (promessa, imagem do topo, ruminações)
VERSOES = {"A": ("A", HERO_REAL, "padrao"), "B": ("B", HERO_REAL, "padrao"),
           "C": ("A", HERO_AVATAR, "padrao"), "D": ("B", HERO_AVATAR, "padrao"),
           "E": ("E", HERO_AVATAR, "mounjaro"),
           "F": ("F", HERO_AVATAR, "final")}

# Bloco 06: imagem do espelho com os pensamentos dentro da foto
PENSAMENTOS = ["Nenhuma calça fecha mais em mim", "Todo mundo vai notar minha barriga",
               "Já tentei de tudo e nada funciona", "Não me reconheço mais no espelho"]
PENSAMENTOS_E = ["Nenhuma calça fecha mais em mim", "Todo mundo vai notar minha barriga",
                 "Será que só com canetinha eu resolvo?", "Não me reconheço mais no espelho"]

# Ajustes de copy só da versão E (aprovados pelo Patrik): (antes, depois)
COPY_E = [
    ("sem dietas radicais e sem promessas mirabolantes.", "sem dietas radicais e sem gastar com canetinhas."),
    ("Enfim, se você quer <em>voltar a vestir as roupas que ama</em> e se sentir bem com a sua barriga e a sua cintura, o Desafio 7 em 7 é para você",
     "Enfim, se você quer <em>reduzir até 7 cm de barriga</em> sem gastar R$3.000 com canetinhas, o Desafio 7 em 7 é para você"),
]

# Bloco 11: cartões com foto (frase, foto). A versão E troca os cartões 3 e 6.
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


def cartoes(v):
    lista = [CARTOES_E.get(i, c) if v in ("E", "F") else c for i, c in enumerate(CARTOES)]
    itens = "\n".join(f'      <div class="cartao"><img src="assets/img/cartao-{img}.webp" alt="{txt}" width="900" height="673" loading="lazy"><p>{txt}</p></div>'
                      for txt, img in lista)
    return f'    <div class="cartoes">\n{itens}\n    </div>'


# 1ª dobra: pílula(s) com check abaixo da promessa. As versões C e E têm 3 (aprovadas pelo Patrik).
PILULA = '    <div class="pilula"><span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>Só seguir o passo a passo</div>'
PILULAS_3 = ['Sem agulha, sem remédio e sem gastar R$3.000', 'Só 15 minutos por dia, no seu ritmo', 'Acompanhando suas medidas dia a dia']


def pilulas(v):
    if v not in ("C", "E", "F"):
        return PILULA
    itens = "\n".join("  " + PILULA.replace("Só seguir o passo a passo", t) for t in PILULAS_3)
    return '    <div class="pilulas">\n' + itens + '\n    </div>'


# Ajustes da versão F por cima da E (aprovados pelo Patrik): (antes, depois, quantas vezes aparece)
COPY_F = [
    ('<span class="etiqueta">Barriga que não cabe mais na calça?</span>',
     '<span class="etiqueta">Pensando em gastar R$500 por mês com canetinha?</span>', 1),
    ("Sem agulha, sem remédio e sem gastar R$3.000", "Sem canetinha", 1),
    ("Pensou em usar canetinha, mas não quer gastar R$3.000 com isso", "Pensou em usar canetinha, mas não quer gastar R$500 todo mês", 2),
    ("Enfim, se você quer <em>reduzir até 7 cm de barriga</em> sem gastar R$3.000 com canetinhas, o Desafio 7 em 7 é para você",
     "Enfim, se você quer <em>reduzir até 7 cm de barriga</em> sem gastar R$500 por mês com canetinha, o Desafio 7 em 7 é para você", 1),
    ('<p class="parcelas">ou <strong>12x de R$ 6,89</strong></p>',
     '<p class="parcelas">ou <strong>12x de R$ 6,89</strong></p>\n        <p class="ancora">Mais de 7x mais barato que 1 mês de canetinha</p>', 2),
]

modelo = (AQUI / "_modelo.html").read_text(encoding="utf-8")
for v, (prom, hero, rum) in VERSOES.items():
    promessa = PROMESSAS[prom]
    html = (modelo.replace("{{PROMESSA}}", promessa)
                  .replace("{{HERO}}", hero)
                  .replace("{{RUMINACOES}}", ruminacoes(rum))
                  .replace("{{VERSAO}}", f"Versão {v} · gerada por build.py a partir de _modelo.html")
                  .replace("{{OFERTA:13}}", oferta("13"))
                  .replace("{{OFERTA:16}}", oferta("16"))
                  .replace("{{CARTOES}}", cartoes(v))
                  .replace("{{PILULAS}}", pilulas(v))
                  .replace("{{ESPELHO}}", "foto-espelho-pensamentos-e.webp" if v in ("E", "F") else "foto-espelho-pensamentos.webp")
                  .replace("{{ESPELHO_ALT}}", " · ".join(PENSAMENTOS_E if v in ("E", "F") else PENSAMENTOS)))
    if v in ("E", "F"):
        for antes, depois in COPY_E:
            assert html.count(antes) == 1, antes
            html = html.replace(antes, depois)
    if v == "F":
        for antes, depois, vezes in COPY_F:
            assert html.count(antes) == vezes, (antes, html.count(antes))
            html = html.replace(antes, depois)
    (AQUI / f"pagina-{v}.html").write_text(html, encoding="utf-8")
    print(f"pagina-{v}.html")
