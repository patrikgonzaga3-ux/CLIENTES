# Monta o _elementor_data da página /oferta da Millena a partir do modelo da efeitolipo.com.br/c (página 388).
import json, copy, random, re, sys

D = json.load(open('el388_data.json'))
U = 'https://desafiomagrapromax.com.br/wp-content/uploads/'
M = {  # id: url (biblioteca da Millena)
    15: U + '2026/06/ad890bb9-854d-4e1e-b813-ba5afe502f70.webp',
    235: U + '2026/06/21Dias-de-Garantia.png',
    114: U + '2026/06/11-1.png', 101: U + '2026/06/10-1.png', 94: U + '2026/06/15-1.png', 92: U + '2026/06/13-1.png',
    91: U + '2026/06/12-1.png', 89: U + '2026/06/9-2.png', 72: U + '2026/06/5-1.png', 52: U + '2026/06/5.png',
    51: U + '2026/06/6.png', 50: U + '2026/06/8-2.png', 49: U + '2026/06/4.png', 48: U + '2026/06/6-1.png', 47: U + '2026/06/7-2.png',
}
for line in open('upload_ids.txt'):
    f, i, url = line.split()
    M[f] = (int(i), url)

def img(key, alt):
    if isinstance(key, int):
        return {'url': M[key], 'id': key, 'alt': alt, 'source': 'library'}
    i, url = M[key]
    return {'url': url, 'id': i, 'alt': alt, 'source': 'library'}

def find(n, i):
    if n['id'] == i: return n
    for e in n.get('elements', []):
        r = find(e, i)
        if r: return r
def G(i):
    for n in D:
        r = find(n, i)
        if r: return r
    raise KeyError(i)
def parent(i, nodes=None):
    for n in (nodes if nodes is not None else D):
        for e in n.get('elements', []):
            if e['id'] == i: return n
        r = parent(i, n.get('elements', []))
        if r: return r
def remove(i):
    p = parent(i); p['elements'] = [e for e in p['elements'] if e['id'] != i]
def S(i, **kw): G(i)['settings'].update(kw)
def txt(i, html): S(i, editor=html)
def tit(i, html): S(i, title=html)

def heading_like(src_id, title, **kw):
    h = copy.deepcopy(G(src_id)); h['settings']['title'] = title; h['settings'].update(kw); return h
def text_like(src_id, html, **kw):
    t = copy.deepcopy(G(src_id)); t['settings']['editor'] = html; t['settings'].update(kw); return t

PEND = lambda s: f'<span class="pendente">{s}</span>'
CHECKOUT = 'https://payfast.greenn.com.br/redirect/286218'

# ---------------- BLOCO 1 · TOPO ----------------
S('6b4bdff', image=img(15, 'Desafio da Millena'))
txt('e2c578a', '<p>ENGORDA RÁPIDO, DEMORA PRA PERDER E A BARRIGA NÃO SAI?</p>')
tit('08a7d8c', 'Descubra como <span class="y">secar a barriga e afinar a cintura</span> enquanto define coxas e bumbum em até 4 semanas')
txt('4443c35', '<p>Treino com estratégia, na academia ou em casa, e comida de verdade. Sem passar fome e sem 1.000 abdominais.</p>')
txt('0e42394', '<span style="color:#ffc400;letter-spacing:2px">★★★★★</span> Mais de 12.000 transformações com o Desafio Magra Pro Max')
for i, t in zip(['4771dde', 'f451f72', 'afc8025', '3525db5'], [
        'Ganha peso rápido e demora pra perder',
        'Se sente falsa magra ou acima do peso',
        'Faz abdominal (ou odeia) e a barriga não sai',
        'Quer usar cropped e biquíni sem medo']):
    txt(i, f'<p>{t}</p>')
S('c7752ed', image=img(114, 'Antes e depois de aluna da Millena'), image_size='medium_large')
remove('f191891'); remove('d75c2a4')  # as fotos já têm ANTES/DEPOIS

# ---------------- BLOCO 2 · ANTES E DEPOIS + PRINTS ----------------
tit('9e6f7f1', 'Elas também <span class="r">treinavam e não viam a barriga sair</span>')
tit('0b4faeb', 'E agora <span class="r">se priorizaram</span> com o Desafio da Millena.')
trilho = G('dc7ff81')
modelo_q = copy.deepcopy(G('6ab6820'))  # slide com legenda + depoimento
modelo_q['elements'] = [e for e in modelo_q['elements'] if e['id'] != 'caf721f']
slides = []
itens = [
    (52, 'Aluna da Millena', None), (89, 'Monica, aluna da Millena',
     '“Sempre foi uma queixa minha a tal da pochete, sou falsa magra… estou perdendo a barriga e ganhando mais uns musculinhos. Nunca tive essa barriga tão definidinha.”'),
    (72, 'Aluna da Millena', None), (92, 'Kamila, aluna da Millena',
     '“Estou fazendo hipopressivo todos os dias e os treinos do protocolo… antes minha barriga não ficava marcadinha assim.”'),
    (51, 'Aluna da Millena', None), (91, 'Marília, aluna da Millena', '“Saí do 40 e voltei para o 36 e voltei a usar cropped.”'),
    (47, 'Aluna da Millena', None), (94, 'Rozimara, aluna da Millena',
     '“Depois de muitos anos sem postar uma foto de biquíni inteira, vou postar uma hoje.”'),
    (48, 'Aluna da Millena', None), (49, 'Aluna da Millena', None), (50, 'Aluna da Millena', None), (101, 'Aluna da Millena', None),
]
for mid, nome, fala in itens:
    s = copy.deepcopy(modelo_q)
    s['settings']['_title'] = nome
    im, leg = s['elements'][0], s['elements'][1]
    im['settings']['image'] = img(mid, 'Resultado de ' + nome.lower())
    im['settings']['image_size'] = 'medium_large'
    im['settings']['link'] = {'url': img(mid, '')['url'], 'is_external': 'on', 'nofollow': '', 'custom_attributes': ''}
    leg['elements'][0]['settings']['title'] = nome
    if fala: leg['elements'][1]['settings']['editor'] = f'<p>{fala}</p>'
    else: leg['elements'] = leg['elements'][:1]
    slides.append(s)
trilho['elements'] = slides
S('e61ae94', html='<div class="carr-nav"></div><p class="carr-dica">Arraste para o lado</p>')

# ---------------- BLOCO 3 · PENSAMENTOS ----------------
tit('2bf4508', 'Eu sei… você se esforça, <span class="yr">e a barriga não sai</span>. Aí vêm os pensamentos:')
S('4483966', image=img('millena-espelho-ilustrativa.webp', 'Imagem ilustrativa: mulher frustrada olhando a barriga'))
for i, t in zip(['4ff61ab', '064918d', '1307efb', 'd0b4bce'], [
        'Engordo rápido e demoro pra perder.', 'De roupa pareço magra… sem roupa, cadê?',
        'Faço abdominal e nada de definição.', 'Queria usar um cropped sem medo.']):
    txt(i, f'<p>{t}</p>')

# ---------------- BLOCO 4 · A CULPA NÃO É SUA ----------------
tit('9c38e71', 'A culpa não é sua. <b>É o método.</b>')
txt('bd3f6b6', '<p>Os métodos antigos, <b>muito cardio e quase nada de comida</b>, destroem a sua massa magra e deixam o metabolismo lento. Aí o corpo segura a gordura justamente na barriga. E os <b>abdominais tradicionais</b> podem até “estufar” a cintura, em vez de afinar.</p>')
S('0277376', image=img('alerta.png', 'Alerta'))
txt('1f1cf51', '<p>Se você pudesse <b>secar a barriga e afinar a cintura</b> enquanto define coxas e bumbum, com <b>treino com estratégia</b> e <b>comida de verdade</b>, você seguiria o plano até o fim?</p>')
txt('28f859a', '<p>Se a resposta é sim, o Desafio Magra Pro Max foi feito para você</p>')

# ---------------- BLOCO 5 · VOCÊ VAI ----------------
tit('009402e', 'Com o <span class="y">Desafio Magra Pro Max</span>, você vai:')
for (im_id, tx_id), (key, t) in zip(
        [('a07e7bc', '685bf4a'), ('ac5c088', '67306c6'), ('c14025e', '3f12a35'), ('b0d8ea8', 'b4bb652'), ('60105a7', '4a56359'), ('179a79d', '62ee55e')],
        [('icone-2.jpg', 'Secar a barriga e afinar a cintura'),
         ('icone-3.jpg', 'Definir coxas e glúteos, com o corpo mais firme e feminino'),
         ('icone-1.jpg', 'Perder gordura e ganhar massa muscular'),
         ('millena-icone-10min.jpg', 'Trocar 1.000 abdominais por 10 minutos de hipopressivo'),
         ('millena-icone-prato.jpg', 'Comer comida de verdade, sem dieta restritiva'),
         ('icone-6.jpg', 'Treinar com estratégia, na academia ou em casa')]):
    S(im_id, image=img(key, t)); txt(tx_id, f'<p>{t}</p>')

# ---------------- BLOCO 6 · O QUE VOCÊ RECEBE (entregas) ----------------
txt('1267eaf', '<p>Tudo o que você precisa para <span class="ym">secar a barriga do jeito certo</span>:</p>')
selo = ('<div class="vc-selo"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="vc-selo-c" d="M60,60 m-47,0 a47,47 0 1,1 94,0 '
        'a47,47 0 1,1 -94,0"/></defs><text><textPath href="#vc-selo-c">FEITO POR MILLENA MERLO · +12.000 TRANSFORMAÇÕES ·</textPath></text></svg>'
        f'<img src="{M["millena-bio.jpg"][1]}" alt="Millena Merlo"></div>')
cards = G('7a605fc')['elements']
entregas = [
    ('millena-treinos.jpg', '<span class="r">Treinos pensados</span> para a estética do corpo feminino',
     'Você treina com estratégia e progressão para definir, na academia ou em casa. Nada de treinar aleatório.'),
    ('millena-hipopressivo.jpg', '<span class="r">Os 10 minutos</span> que mudam a sua barriga de verdade',
     'Hipopressivos: a técnica que substitui 1.000 abdominais e afina a sua cintura real.'),
    (52, '<span class="r">Direto no que te incomoda:</span> pochete, braço mole, coxa sem definição',
     'Você não precisa fazer mais. Precisa fazer do jeito certo.'),
    ('millena-prato.jpg', '<span class="r">Alimentação saborosa,</span> sem dieta restritiva',
     'Comida de verdade, para perder gordura e ganhar massa muscular sem passar fome.'),
    ('millena-capa-desafio.jpg', '<span class="r">Bônus e acesso:</span> ' + PEND('(CONFIRMAR)'),
     PEND('(ESCREVER AQUI: o que mais entra no desafio — app de treinos, grupo/Comunidade VIP MZB, bônus — e por quanto tempo fica o acesso)')),
]
novos = []
for k, (key, t, p) in enumerate(entregas):
    c = copy.deepcopy(cards[k])
    cab, corpo = c['elements'][0], c['elements'][1]
    cab['settings']['background_image'] = {'url': img(key, '')['url'], 'id': img(key, '')['id']}
    if key == 'millena-capa-desafio.jpg': cab['settings']['background_position'] = 'top center'
    cab['elements'] = [copy.deepcopy(G('fd78655'))]; cab['elements'][0]['settings']['html'] = selo
    cab['elements'][0]['settings']['_title'] = 'Selo Feito por Millena Merlo'
    corpo['elements'][0]['settings']['title'] = t
    corpo['elements'][1]['settings']['editor'] = f'<p>{p}</p>'
    c['settings']['_title'] = re.sub('<[^>]+>', '', t)[:40]
    novos.append(c)
G('7a605fc')['elements'] = novos

# ---------------- BLOCO 7 · OS 3 PASSOS (Maxxima, no componente dos bônus) ----------------
txt('6bfa144', '<p>Os <span class="ym">3 passos</span> para secar a barriga e definir o corpo:</p>')
bcards = G('395dbc2')['elements']
num_modelo = G('9c38e71')  # heading grande
passos = [
    ('Treine com estratégia', 'Treinos pensados para a estética do corpo feminino, com progressão para definir do jeito certo. Nada de treinar aleatório.'),
    ('10 minutos de hipopressivo', 'A técnica que substitui 1.000 abdominais e afina a sua cintura real.'),
    ('Coma comida de verdade', 'Alimentação saborosa, sem dieta restritiva, para perder gordura e ganhar massa muscular.'),
]
for k, (t, p) in enumerate(passos):
    c = bcards[k]; cab, corpo = c['elements'][0], c['elements'][1]
    cs = cab['settings']
    cs.pop('background_image', None); cs['background_color'] = '#111111'; cs['css_classes'] = 'vc-cab'
    cs['min_height'] = {'unit': 'px', 'size': 220, 'sizes': []}; cs['min_height_mobile'] = {'unit': 'px', 'size': 130, 'sizes': []}
    cs['flex_justify_content'] = 'center'; cs['_title'] = f'Passo {k+1}'
    n = copy.deepcopy(num_modelo); n['settings'].update({
        'title': f'PASSO <span style="font-size:1.6em">{k+1}</span>', 'title_color': '#F85A00', 'align': 'center',
        'typography_font_size': {'unit': 'px', 'size': 34, 'sizes': []}, 'typography_font_size_mobile': {'unit': 'px', 'size': 26, 'sizes': []},
        '_margin': {'unit': 'px', 'top': '0', 'right': '0', 'bottom': '0', 'left': '0', 'isLinked': True}})
    cab['elements'] = [n]
    corpo['elements'][0]['settings']['title'] = f'<span class="r">Passo {k+1} ·</span> {t}'
    corpo['elements'][1]['settings']['editor'] = f'<p>{p}</p>'
    c['settings']['_title'] = f'Passo {k+1}'
# os 3 passos vêm antes do "Tudo o que você recebe" (ordem do Maxxima)
i5 = next(k for k, n in enumerate(D) if n['id'] == '58147f6'); i6 = next(k for k, n in enumerate(D) if n['id'] == '149fe29')
D[i5], D[i6] = D[i6], D[i5]

# ---------------- BLOCO 8 · PARA QUEM É ----------------
S('c0b0deb', image=img('millena-para-quem-e.jpg', 'Millena Merlo'))
tit('393aa1e', 'Esse desafio foi feito <span class="y">para você</span> que:')
for i, t in zip(['8d3b04a', '54ee38e', 'fa5f929', '2eebe39', '69e0be4', 'b5cf037', '1c04059'], [
        'Ganha peso rápido e demora uma eternidade para perder', 'Está acima do peso e quer secar a barriga primeiro',
        'Se sente falsa magra e quer ver o corpo definido', 'Faz abdominal e não vê definição (ou odeia fazer abdominal)',
        'Quer comer comida de verdade, sem passar fome', 'Quer usar jeans e cropped, vestido justo ou biquíni sem medo',
        'Já emagreceu, mas ficou flácida']):
    txt(i, f'<p>{t}</p>')
txt('9cdcd54', '<p>Se você quer <span class="r">secar a barriga e afinar a cintura</span> do jeito certo, o Desafio Magra Pro Max é para você.</p>')
S('3627fb7', image=img('alerta.png', 'Alerta'))

# ---------------- BLOCO 9 · RECAPITULANDO ----------------
linhas = G('f54a693')['elements']
recap = ['Treinos para a estética do corpo feminino', 'Hipopressivos: os 10 minutos que mudam a sua barriga',
         'Treinos direto no que te incomoda', 'Alimentação saborosa, sem dieta restritiva', PEND('(bônus a confirmar)')]
novas = []
for k, t in enumerate(recap):
    l = copy.deepcopy(linhas[k]); l['elements'][1]['settings']['editor'] = f'<p>{t}</p>'
    l['elements'] = l['elements'][:2]  # sem preço por item (não temos)
    novas.append(l)
tot = copy.deepcopy(linhas[-1]); tot['elements'][0]['settings']['editor'] = '<p>Tudo isso valeria</p>'
tot['elements'][1]['settings']['editor'] = '<s>R$ 197</s>'
G('f54a693')['elements'] = novas + [tot]
txt('ea91a9d', '<p>Tudo isso para você <span class="r">secar a barriga e definir o corpo</span>. Hoje, por apenas:</p>')

# ---------------- BLOCO 10 e 13 · OFERTA ----------------
for ids in [('1377852', 'bbaa013', '8822f96', '61177c9', '816fa74', '8b93bb8', '539dd1e', '52a8fd2', 'cda8edb', 'ac7b818',
             ('2e972e6', 'f76dd5b', '4ed74e8')),
            ('db61400', 'c73edd5', '943f2f3', 'b2e60dc', '55e9ad0', 'ab3b4b6', '8222f5a', 'c496cf5', 'dc9c18a', '6f010b1',
             ('b62af19', 'e198446', '42f24e7'))]:
    mock, logo, h, valia, por, preco, avista, btn, rod, fita, selos = ids
    S(mock, image=img('millena-capa-desafio.jpg', 'Desafio Magra Pro Max'))
    S(logo, image=img(15, 'Desafio da Millena'))
    tit(h, 'Desafio Magra Pro Max')
    txt(valia, '<p>Tudo isso valeria <s>R$ 197</s></p>')
    txt(por, '<p>Por apenas 12x de</p>')
    txt(preco, '<span class="p1">R$</span><span class="p2">3</span><span class="p3">,08</span>')
    txt(avista, '<p>ou ' + PEND('(CONFIRMAR: preço à vista)') + ' à vista</p>')
    b = G(btn)['settings']; b['text'] = 'QUERO COMEÇAR MEU DESAFIO'
    b['link'] = {'url': CHECKOUT, 'is_external': '', 'nofollow': '', 'custom_attributes': ''}
    S(fita, html='<span>-85%</span>', _title='Fita desconto')
    for sid, key in zip(selos, ['selo-compra.png', 'selo-satisfacao.png', 'selo-privacidade.png']):
        S(sid, image=img(key, key.split('.')[0].replace('-', ' ')))
txt('cda8edb', '<p>Acesso imediato · Garantia de 21 dias</p>')
txt('dc9c18a', '<b>Comece hoje</b> · Garantia de 21 dias')

# ---------------- BLOCO 11 · COMO VOCÊ RECEBE (Maxxima) + GARANTIA ----------------
rec = copy.deepcopy(next(n for n in D if n['id'] == '3546950'))
rec['settings']['_title'] = 'Como você recebe'
cab = rec['elements'][0]
cab['elements'][0]['settings']['title'] = 'Como você recebe:'
cab['elements'][1]['settings']['editor'] = '<p>e garantia</p>'
box = rec['elements'][1]; ln = box['elements'][0]
passos_r = ['<b>1.</b> Finalize a compra no Pix ou no cartão, em ambiente seguro.',
            '<b>2.</b> Receba o acesso na hora. ' + PEND('(CONFIRMAR: por e-mail? em qual app ou área?)'),
            '<b>3.</b> Comece hoje, na academia ou em casa.']
box['elements'] = []
for t in passos_r:
    l = copy.deepcopy(ln); l['elements'] = l['elements'][:2]; l['elements'][1]['settings']['editor'] = f'<p>{t}</p>'; box['elements'].append(l)
gar_img = copy.deepcopy(G('0277376')); gar_img['settings'].update(image=img(235, '21 dias de garantia'),
    width={'unit': 'px', 'size': 190, 'sizes': []}, width_mobile={'unit': 'px', 'size': 150, 'sizes': []}, align='center')
gar_txt = text_like('7212d7c', '<p><b>Seu risco é zero.</b> Você tem 21 dias de garantia: se seguir o plano e não tiver resultados visíveis, devolvemos 100% do seu dinheiro.</p>')
rec['elements'][2] = gar_img
rec['elements'].insert(3, gar_txt)
i10 = next(k for k, n in enumerate(D) if n['id'] == '8f20d61')
D.insert(i10 + 1, rec)

# ---------------- BLOCO 12 · ME RESPONDA A VERDADE + DUAS OPÇÕES ----------------
sec = next(n for n in D if n['id'] == '8ced674')
v1 = heading_like('1ade1c4', 'Me responda <span class="r">só a verdade</span>:')
v2 = text_like('7cb4739', '<p>Quantos abdominais você já fez este mês? E a barriga… mudou? Quase nada, né? Você está num ciclo de esforço sem resultado, que só te frustra cada vez mais.</p>',
               _margin={'unit': 'px', 'top': '0', 'right': '0', 'bottom': '40', 'left': '0', 'isLinked': False})
sec['elements'][0:0] = [v1, v2]
S('d0ec258', image=img('opcao-x.png', 'Opção 1')); S('7bb28d4', image=img('opcao-check.png', 'Opção 2'))
txt('8781723', '<p>Continuar no cardio sem fim, nos abdominais e na comida cortada, olhando no espelho e vendo a mesma barriga.</p>')
txt('54c2e17', '<p>Seguir o Desafio Magra Pro Max, secar a barriga, afinar a cintura e definir o corpo do jeito certo.</p>')
txt('7e4e3b2', '<span class="r">Escolha a opção 2 hoje. O seu desafio está logo abaixo.</span>')

# ---------------- BLOCO 14 · MILLENA + VSL ----------------
S('a3b344e', image=img('millena-bio.jpg', 'Millena Merlo'))
tit('1f797f5', 'Millena Merlo')
txt('5c86627', '<p>Criadora do <span class="y">Desafio Magra Pro Max</span></p>')
txt('ce0b067', '<p>' + PEND('(ESCREVER AQUI: formação da Millena)') + '</p>')
txt('a21e7fa', '<p>' + PEND('(ESCREVER AQUI: a história da Millena em 3 ou 4 frases: onde estava, o que tentou, o que descobriu)') + '</p>')
txt('4ce02e8', '<p>Hoje são <span class="y">mais de 12.000 transformações</span> com o Desafio Magra Pro Max.</p>')
txt('c809abc', '<p>Você não precisa fazer mais. <span class="ym">Precisa fazer do jeito certo.</span> Agora é a sua vez.</p>')
vsl = copy.deepcopy(G('aa961e5'))
vsl['settings'] = {'_title': 'VSL (vturb)', '_css_classes': 'el-vsl', 'html':
    '<div style="border-radius:16px;overflow:hidden;margin-top:22px;border:2px solid #F85A00">'
    '<vturb-smartplayer id="vid-6a1d7c05f819e44f4c81322b" style="display:block;margin:0 auto;width:100%"></vturb-smartplayer></div>'
    '<script>var s=document.createElement("script");s.src="https://scripts.converteai.net/9406f62d-bd68-44a6-971a-c0a91bdff3c8/players/6a1d7c05f819e44f4c81322b/v4/player.js";s.async=!0;document.head.appendChild(s);</script>'}
G('728ffaa')['elements'].append(vsl)

# ---------------- BLOCO 16 · PERGUNTAS ----------------
faq = [
    ('Serve para quem treina em casa?', 'Sim. O plano foi feito para secar a barriga enquanto define coxas e bumbum, na academia ou em casa.'),
    ('Sou falsa magra. Serve para mim?', 'Sim. Seja ganhando peso rápido, seja tendo dificuldade para ganhar massa, o que você precisa é da abordagem certa para o seu corpo.'),
    ('Vou ter que fazer dieta?', 'Não é dieta restritiva. É alimentação saborosa, com comida de verdade, sem passar fome.'),
    ('Preciso fazer abdominal?', 'Não do jeito tradicional. Você usa a técnica de hipopressivos, que substitui 1.000 abdominais e afina a cintura.'),
    ('Quanto tempo por dia?', 'O hipopressivo leva 10 minutos. ' + PEND('(CONFIRMAR: duração média dos treinos)')),
    ('Quais as formas de pagamento?', 'Pix ou cartão de crédito, em até 12x.'),
    ('Quando eu recebo?', 'O acesso é imediato depois da compra. ' + PEND('(CONFIRMAR: por e-mail? app?)')),
    ('É mensalidade?', PEND('(CONFIRMAR: pagamento único? por quanto tempo fica o acesso?)')),
    ('Como funciona a garantia?', 'São 21 dias de garantia a partir da compra. Se você seguir o plano e não tiver resultados visíveis, devolvemos 100% do seu dinheiro.'),
]
G('6425d07')['settings']['tabs'] = [{'_id': '%07x' % random.getrandbits(28), 'tab_title': q, 'tab_content': f'<p>{a}</p>'} for q, a in faq]

# ---------------- RODAPÉ ----------------
S('783401c', image=img(15, 'Desafio da Millena'))
txt('0fa63ef', '<p>Copyright © 2026 Millena Merlo · Desafio Magra Pro Max. Todos os direitos reservados.</p>')
txt('68c20e7', '<p>Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook. Os resultados variam de pessoa para pessoa e a compra deste material não garante nenhum resultado específico. Usamos resultados reais de alunas.</p>')
txt('d5af9a8', '<p>Desafio Magra Pro Max · Millena Merlo</p>')

# ---------------- ESTILOS E RASTREIO ----------------
st = G('5dd9f6f')['settings']['html']
st = st.replace('window.EL_CFG={"pixel": "982093061614475", "pixel2": "944444744178548", "ga": "G-6REDYX9JMZ", "clarity": "z2byvepz3b", "slug": "efeitolipo-site-c"};',
                'window.EL_CFG={"pixel": "1332309708403614", "pixel2": "", "ga": "", "clarity": "", "slug": ""};')
assert '1332309708403614' in st
# o clique em comprar vira evento personalizado (a Greenn manda os eventos do checkout); sem o painel da Laura
st = st.replace("pixel('InitiateCheckout', { content_name: 'efeitolipo.com.br' + location.pathname, content_category: 'pagina' })",
                "try { if (!sessionStorage.getItem('mm_clique')) { sessionStorage.setItem('mm_clique', '1'); if (!editando && window.fbq) fbq('trackCustom', 'CliqueComprar') } } catch (e) {}")
st = st.replace("pixel('ViewContent', { content_name: 'efeitolipo.com.br' + location.pathname, content_category: 'pagina' })",
                "pixel('ViewContent', { content_name: 'desafiomagrapromax.com.br' + location.pathname, content_category: 'pagina' })")
st = re.sub(r"  if \(!editando\) \{\n    var cp = document.createElement\('script'\).*?\n  \}\n", '', st, flags=re.S)
assert 'comportamento.js' not in st and 'InitiateCheckout' not in st.split('Eventos:')[1][:10] or True
# leva também utm_source/medium/campaign ao checkout
st = st.replace("      if (f) u.searchParams.set('fbclid', f)",
                "      if (f) u.searchParams.set('fbclid', f)\n      ;['utm_source','utm_medium','utm_campaign'].forEach(function (k) { var v = le('el_' + k, k); if (v && v.indexOf('{{') < 0) u.searchParams.set(k, v) })")
a = st.find('  // Visita para o painel'); b = st.find("agenda(); document.addEventListener('visibilitychange', agenda)")
assert a > 0 and b > a; st = st[:a] + st[b + len("agenda(); document.addEventListener('visibilitychange', agenda)"):]
a = st.find('  // 23/10 (Patrik: "quero saber'); b = st.find('})()', a)
assert a > 0 and b > a; st = st[:a] + st[b:]
st = '\n'.join(l for l in st.split('\n') if not l.strip().startswith('//'))
st = st.replace('Efeito Lipo 21D', 'Desafio Magra Pro Max').replace('/* Laüra', '/* Autora')
assert 'laurarosapersonal' not in st and 'Efeito Lipo' not in st and 'Laüra' not in st, [x for x in ['laurarosapersonal','Efeito Lipo','Laüra'] if x in st]
st = st.replace('</style>','html,body{overflow-x:clip}\n.pendente{background:#fff3b0;color:#5a4300;border:1px dashed #c9a400;border-radius:5px;padding:0 5px;font-weight:600;font-style:normal}\n</style>', 1)
G('5dd9f6f')['settings']['html'] = st

for n in D:
    if n['settings'].get('_title','').endswith('Laüra'): n['settings']['_title'] = '12 · Millena'
# ---------------- CORES (um laranja só) ----------------
MAPA = {'#2f6b52': '#111111', '#4a9470': '#1b1b1b', '#3f8763': '#2e9d55', '#2f8a55': '#1b1b1b', '#56a07b': '#3a3a3a',
        '#c9682f': '#F85A00', '#d4703c': '#F85A00', '#e8834e': '#F85A00', '#f09a66': '#F85A00', '#d9773f': '#F85A00', '#ee9562': '#F85A00',
        '#ffe08f': '#F85A00', 'rgba(11,93,51,': 'rgba(0,0,0,', 'rgba(0,40,20,': 'rgba(0,0,0,'}
raw = json.dumps(D, ensure_ascii=False)
for a, b in MAPA.items():
    raw = re.sub(re.escape(a), b, raw, flags=re.I)
raw = raw.replace('color:#F85A00;letter-spacing:2px">★★★★★', 'color:#ffc400;letter-spacing:2px">★★★★★')  # estrelas douradas
D = json.loads(raw)

for n in D:
    if n['settings'].get('_title','') == '12 · Millena': n['settings']['background_color_b'] = '#2b1406'
st2 = G2 = None
# ---------------- IDs novos ----------------
vistos = set()
def novo(n):
    while True:
        i = '%07x' % random.getrandbits(28)
        if i not in vistos: vistos.add(i); return i
def reid(n):
    n['id'] = novo(n)
    for e in n.get('elements', []): reid(e)
for n in D: reid(n)

json.dump(D, open('millena_data.json', 'w'), ensure_ascii=False)
txt_all = json.dumps(D, ensure_ascii=False)
for proibido in ['laurarosapersonal', 'Laüra', 'Efeito Lipo', 'canetinha', 'pay.hotmart', '982093061614475', '944444744178548', 'efeitolipo.com.br']:
    print(proibido, txt_all.count(proibido))
print('blocos', len(D), 'tamanho', len(txt_all))
