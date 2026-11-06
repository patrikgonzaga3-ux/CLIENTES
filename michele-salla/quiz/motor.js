/* Motor dos quizzes da Michele (Desafio 7 em 7 e Pilates). Os textos de cada quiz ficam no arquivo de dados
   (quiz.js ou ../quiz-pilates/pilates.js), carregado antes deste, que define: IMG, PROMESSAS, TELAS, PERFIS,
   perfilDe(), MEDO, EXEMPLO e QUIZ (slug do painel, imagens, prova, resultado e oferta).
   Endereço: ?p=1..5 escolhe a capa (promessa). Para o painel de revisão: ?tela=<id>&p=<n>&perfil=<id> abre uma tela
   direto (sem rastreio e sem pixel). Itens entre [[ ]] são pendências e aparecem em amarelo. */

const q = new URLSearchParams(location.search)
const P = PROMESSAS[q.get('p')] ? Number(q.get('p')) : 1
const resp = {}
let i = 0
const app = document.getElementById('app')
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
// Texto já escapado + pendências [[…]] em amarelo + <mark> do título.
const pend = s => String(s).replace(/\[\[(.+?)\]\]/g, '<span class="pend">$1</span>')
const txt = s => pend(esc(s))
const revisao = !!q.get('tela')

if (q.get('perfil') && EXEMPLO[q.get('perfil')]) Object.assign(resp, EXEMPLO[q.get('perfil')])
if (revisao) { const k = TELAS.findIndex(t => t.id === q.get('tela')); if (k >= 0) i = k }

// Rastreio do painel da Michele (painel.michelesalla.com.br): cada tela conta como um bloco (window.plBloco) e cada
// capa é uma página (QUIZ.slug + número da promessa). Não roda nas telas abertas pelo painel de revisão.
if (!revisao) {
  const r = document.createElement('script')
  r.async = true
  r.src = 'https://painel.michelesalla.com.br/rastreio.js'
  r.dataset.slug = QUIZ.slug + P
  r.dataset.checkout = 'sim'
  document.body.appendChild(r)
}

// Pixel do Meta da Michele (991344998762063), só no endereço oficial do quiz (a prévia na Vercel não conta).
// PageView ao abrir e CliqueComprar no botão de compra; InitiateCheckout e Purchase saem do checkout.
const PIXEL_ATIVO = !revisao && location.hostname === 'quiz.michelesalla.com.br'
if (PIXEL_ATIVO) {
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  fbq('init', '991344998762063')
  fbq('track', 'PageView')
}
// Microsoft Clarity (gravações e mapas): o código do projeto fica na ficha da Michele no Painel PTK (agenciaptk.com.br/ptk,
// campo Clarity), igual ao site da Libia. Só liga no domínio da ficha (michelesalla.com.br e subdomínios), nunca no relatório.
// Cada tela vira um evento ("tela_05_objetivo") e cada resposta uma etiqueta (objetivo = "Melhorar a postura"), para filtrar
// as gravações por etapa e por resposta. A fila guarda as marcações até o Clarity carregar.
window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments) }
const marca = (...a) => { try { window.clarity(...a) } catch (e) {} }
if (!revisao) {
  fetch('https://agenciaptk.com.br/api/ptk/site?d=' + encodeURIComponent(location.hostname)).then(r => r.ok ? r.json() : null).then(c => {
    const id = c && c.clarity ? String(c.clarity).replace(/[^a-z0-9]/gi, '') : ''
    if (!id || document.querySelector('script[src*="clarity.ms/tag/"]')) return
    const t = document.createElement('script'); t.async = true; t.src = 'https://www.clarity.ms/tag/' + id
    document.head.appendChild(t)
  }).catch(() => {})
  marca('set', 'quiz', QUIZ.slug.replace(/-p$/, ''))
  marca('set', 'promessa', 'p' + P)
  ;['utm_content', 'utm_campaign', 'utm_medium'].forEach(c => q.get(c) && marca('set', c, q.get(c).slice(0, 100)))
}
let cliqueContado = false
function cliqueComprar() {
  marca('event', 'clique_comprar'); marca('upgrade', 'clique_comprar')
  if (PIXEL_ATIVO && !cliqueContado && window.fbq) { cliqueContado = true; fbq('trackCustom', 'CliqueComprar', { value: QUIZ.oferta.valor, currency: 'BRL', content_name: QUIZ.oferta.produto }) }
}

const contaveis = TELAS.filter(t => !['capa', 'oferta'].includes(t.tipo)).length
function progresso() { const n = TELAS.slice(0, i + 1).filter(t => !['capa', 'oferta'].includes(t.tipo)).length; return Math.round(100 * n / contaveis) }
function topo() { return i === 0 ? '' : `<div class="topo"><button class="voltar" aria-label="Voltar" onclick="volta()">‹</button><div class="barra" aria-hidden="true"><i style="width:${progresso()}%"></i></div></div>` }
function vai() { i = Math.min(i + 1, TELAS.length - 1); desenha(); scrollTo(0, 0) }
let voltando = false // quem volta para a tela de análise não é empurrada para frente de novo
function volta() { i = Math.max(i - 1, 0); voltando = true; desenha(); voltando = false; scrollTo(0, 0) }
const img = (x, extra = '') => `<img src="${x.src}" alt="${esc(x.alt)}" width="${x.w}" height="${x.h}" ${extra}>`
const perfilAtual = () => (q.get('perfil') && PERFIS[q.get('perfil')] ? q.get('perfil') : perfilDe(resp))
// Bloco de pendência (texto amarelo) ou fotos.
const fotos = (lista, pendencia) => lista && lista.length
  ? `<div class="grade">${lista.map(x => img(x, 'loading="lazy"')).join('')}</div>`
  : `<div class="cartao"><p><span class="pend">${esc(pendencia)}</span></p></div>`

let telaMarcada = -1 // o evento da tela sai uma vez por chegada (a tela redesenha ao marcar uma resposta)
function desenha() {
  const t = TELAS[i]
  if (window.plTique) window.plTique() // fecha o tempo da tela anterior
  window.plBloco = i + 1
  if (!revisao && i !== telaMarcada) { telaMarcada = i; marca('event', 'tela_' + String(i + 1).padStart(2, '0') + '_' + t.id) }
  if (window.plTique) window.plTique() // marca a chegada nesta tela
  let h = topo()
  if (t.tipo === 'capa') {
    const p = PROMESSAS[P]
    h += `<section class="capa" style="display:grid;gap:16px">
      ${QUIZ.logo ? `<img class="logo" src="${QUIZ.logo.src}" alt="${esc(QUIZ.logo.alt)}"${QUIZ.logo.style ? ` style="${QUIZ.logo.style}"` : ''}>` : ''}
      <span class="etiqueta">${esc(p.etiqueta)}</span>
      <h1>${pend(p.titulo)}</h1>
      <p class="sub">${txt(p.sub)}</p>
      <button class="botao" onclick="vai()">${esc(p.botao)} →</button>
      <div class="foto-capa">${img(QUIZ.capa)}</div>
      ${QUIZ.capa.pendencia ? `<p class="miudo"><span class="pend">${esc(QUIZ.capa.pendencia)}</span></p>` : ''}
      <p class="miudo">${esc(QUIZ.assinatura || "Por Michele Salla, educadora física")}</p></section>`
  } else if (t.tipo === 'uma' || t.tipo === 'varias') {
    const marc = t.tipo === 'varias' ? (resp[t.id] || []) : [resp[t.id]]
    h += `<section class="pergunta"><h2>${txt(t.titulo)}</h2><p class="sub">${txt(t.sub || '')}</p></section>
      <div class="ops ${t.cols === 2 ? 'c2' : ''}">${t.op.map(o => `<button class="op ${marc.includes(o[0]) ? 'on' : ''}" data-rotulo="${esc(o[1])}" onclick="escolhe('${t.id}','${o[0]}')">${txt(o[1])}${o[2] ? ` <small>${txt(o[2])}</small>` : ''}</button>`).join('')}</div>
      ${t.tipo === 'varias' ? `<button class="botao" onclick="vai()" ${marc.length ? '' : 'disabled style="opacity:.45"'}>Continuar →</button>` : ''}`
  } else if (t.tipo === 'michele') {
    h += `<section class="michele cartao"><img src="${IMG}michele-recorte.webp" alt="Michele Salla" width="802" height="1292">
      <h2 style="font-size:22px">Prazer, eu sou a Michele Salla</h2>
      ${QUIZ.bio.map(x => `<p>${txt(x)}</p>`).join('')}</section>
      <button class="botao" onclick="vai()">Continuar →</button>`
  } else if (t.tipo === 'prova') {
    h += `<section class="pergunta"><h2>${txt(QUIZ.prova.titulo)}</h2></section>
      ${fotos(QUIZ.prova.fotos, QUIZ.prova.pendencia)}
      <p class="aviso">Os resultados variam de pessoa para pessoa.</p>
      <button class="botao" onclick="vai()">Continuar →</button>`
  } else if (t.tipo === 'insight') {
    h += `<section class="pergunta"><h2>Talvez você se reconheça nisso</h2></section>
      <div class="ciclo">${QUIZ.insight.ciclo.map(x => `<p>${txt(x)}</p>`).join('')}</div>
      <div class="cartao"><p><b>${txt(QUIZ.insight.destaque)}</b> ${txt(QUIZ.insight.texto)}</p></div>
      <button class="botao" onclick="vai()">Faz sentido, continuar →</button>`
  } else if (t.tipo === 'carregando') {
    h += `<section class="carregando" style="display:flex;flex-direction:column;gap:10px"><div class="roda" aria-hidden="true"></div><h2 style="font-size:22px">${txt(t.titulo)}</h2>
      <div class="linhas">${t.linhas.map(l => `<p>${txt(l)}</p>`).join('')}</div>
      <button class="botao" onclick="vai()" style="margin-top:8px">Ver o próximo passo →</button></section>`
    // Segue sozinha em ~2,6 s (também quando aberta pelo relatório). Quem volta para esta tela não é empurrada.
    if (!voltando && !q.get('parado')) { const aqui = i; setTimeout(() => { if (i === aqui) vai() }, 2600) }
  } else if (t.tipo === 'resultado') {
    const pf = PERFIS[perfilAtual()], R = QUIZ.resultado
    if (!revisao) marca('set', 'perfil', pf.nome)
    h += `<section class="perfil"><span class="rot">O seu perfil</span><h2>${esc(pf.nome)}</h2><p>${txt(pf.retrato)}</p></section>
      <div class="bloco cartao"><h3>O que está te travando</h3><p>${txt(pf.trava)}</p>${R.mente ? `<p>${txt(R.mente)}</p>` : ''}</div>
      <div class="bloco cartao"><h3>Por onde você começa</h3><p>${txt(pf.comeca)}</p>${R.extra && !pf.comeca.includes(R.extraSeTem) ? `<p>${txt(R.extra)}</p>` : ''}${R.diaADia ? `<p><b>${txt(R.diaADia)}</b></p>` : ''}</div>
      <button class="botao" onclick="vai()">${esc(R.botao)} →</button>`
  } else if (t.tipo === 'oferta') {
    const pf = PERFIS[perfilAtual()], O = QUIZ.oferta
    const m = MEDO[resp.medo]
    let botao
    if (O.checkout) {
      // Igual ao rastreio.js do painel: leva o rastreio do anúncio e marca a página (sck) com a promessa da capa.
      const u = new URL(O.checkout)
      ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(c => q.get(c) && u.searchParams.set(c, q.get(c)))
      if (q.get('utm_term')) u.searchParams.set('src', q.get('utm_term'))
      u.searchParams.set('sck', QUIZ.slug + P)
      botao = `<a class="botao" href="${u.toString()}" onclick="cliqueComprar()">${esc(O.botao)} →</a>`
    } else {
      botao = `<span class="botao" aria-disabled="true" style="opacity:.6;cursor:default">${esc(O.botao)} →</span><p class="miudo" style="color:#fff"><span class="pend">Link de compra pendente</span></p>`
    }
    h += `<section class="oferta" style="display:grid;gap:14px">
      <span class="etiqueta">Plano para ${esc(pf.nome)}</span>
      <h2>${pend(O.titulo)}</h2>
      <p>${txt(O.intro)}</p>
      <ul class="modulos">${O.modulos.map(x => `<li><b>${txt(x[0])}</b><span>${txt(x[1])}</span></li>`).join('')}
        ${O.bonus && O.bonus.length ? `<li><b>Bônus</b><span>${O.bonus.map(txt).join(' · ')}</span></li>` : ''}</ul>
      ${fotos(O.fotos, O.fotosPendencia)}
      <p class="aviso">Os resultados variam de pessoa para pessoa.</p>
      ${m ? `<div class="medo"><b>Você disse que tem medo de “${esc(TELAS.find(x => x.id === 'medo').op.find(o => o[0] === resp.medo)[1].toLowerCase())}”.</b> Por isso: ${txt(m)}</div>` : ''}
      <div class="preco"><span>Tudo isso por apenas</span><span class="v"><small>R$</small>${esc(O.valor)}</span><span>${txt(O.parcela)}</span>
        ${botao}</div>
      <div class="selos"><img src="${IMG}selo-garantia-7-dias.webp" alt="Garantia" width="400" height="400"><span>${txt(O.selos)}</span></div>
      <p class="miudo">Michele Salla · CNPJ 32.983.139/0001-99</p>
      ${O.rodape ? `<p class="miudo" style="font-size:11.5px">${txt(O.rodape)}</p>` : ''}</section>`
  }
  app.innerHTML = h
}
let trava = false // evita pular 2 telas com toque duplo
function escolhe(id, v) {
  const t = TELAS.find(x => x.id === id)
  if (trava) return
  if (t.tipo === 'varias') {
    let l = resp[id] || []
    if (v === 'nenhum') l = l.includes('nenhum') ? [] : ['nenhum']
    else { l = l.filter(x => x !== 'nenhum'); l = l.includes(v) ? l.filter(x => x !== v) : [...l, v] }
    resp[id] = l; desenha()
  } else { resp[id] = v; desenha(); trava = true; setTimeout(() => { trava = false; vai() }, 220) }
  // etiqueta da resposta no Clarity (várias respostas: juntas, separadas por " + ")
  const rot = x => (t.op.find(o => o[0] === x) || [x, x])[1]
  if (!revisao) marca('set', id, t.tipo === 'varias' ? (resp[id] || []).map(rot).join(' + ') || '-' : rot(v))
}
desenha()
