"""Gera pagina-A, B, C e D a partir de _modelo.html.
A e C: promessa "Perca até 7cm"; B e D: promessa "Chega de se sentir mal".
A e B usam antes e depois real de aluna; C e D usam avatar.
Uso: python3 build.py
"""
from pathlib import Path

AQUI = Path(__file__).parent

PROMESSAS = {
    "A": '<h1 class="promessa">Perca <span class="marca">até 7cm de barriga em 7 dias</span> e volte a vestir as roupas que você ama'
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
        <a class="botao botao-compra" href="#LINK-DE-COMPRA">Sim, quero aproveitar a oferta {SETA}</a>
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


HERO_REAL = ('<img class="hero-img" src="assets/img/hero-antes-depois.webp" '
             'alt="Antes e depois de aluna do Desafio 7 em 7, com fita métrica na cintura" width="1080" height="1200">')
HERO_AVATAR = ('<figure class="hero-img hero-fig"><img src="assets/img/hero-antes-depois-avatar.webp" '
               'alt="Antes e depois com fita métrica na cintura" width="1080" height="1200"></figure>')

# A e B: antes e depois real de aluna · C e D: mesmas promessas com avatar
VERSOES = {"A": ("A", HERO_REAL), "B": ("B", HERO_REAL), "C": ("A", HERO_AVATAR), "D": ("B", HERO_AVATAR)}

modelo = (AQUI / "_modelo.html").read_text(encoding="utf-8")
for v, (prom, hero) in VERSOES.items():
    promessa = PROMESSAS[prom]
    html = (modelo.replace("{{PROMESSA}}", promessa)
                  .replace("{{HERO}}", hero)
                  .replace("{{VERSAO}}", f"Versão {v} · gerada por build.py a partir de _modelo.html")
                  .replace("{{OFERTA:13}}", oferta("13"))
                  .replace("{{OFERTA:16}}", oferta("16")))
    (AQUI / f"pagina-{v}.html").write_text(html, encoding="utf-8")
    print(f"pagina-{v}.html")
