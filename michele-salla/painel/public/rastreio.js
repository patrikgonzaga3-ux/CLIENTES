/* Rastreio da página de vendas · Painel de Lucro.
 * Colar UMA linha na página (antes de </body>, ou num bloco HTML do Elementor/WordPress):
 *   <script async src="https://<painel>/rastreio.js" data-slug="<prefixo>-a"></script>
 * Opcional no mesmo <script>:
 *   data-blocos="Topo,Depoimentos,Oferta,…"  nomes dos blocos (só para contar; os nomes do painel vêm do cliente.config.ts)
 *   data-checkout="sim"                      leva para o checkout o rastreio do anúncio (utm_term, utm_content, fbclid) e sck=<slug>
 * Blocos da página: marque cada bloco com data-bloco="01", data-bloco="02"… (ou a classe elb-01, elb-02…).
 * Sem marcação, conta as seções de cima da página, na ordem.
 * Mede por visita: tempo em cada bloco (o bloco no meio da tela, com a aba visível), até onde rolou, onde parou,
 * cada clique com o segundo, tempo até clicar em comprar e o carregamento. Não guarda dados pessoais nem o que a
 * pessoa digita. Ignora prévia/robôs do Meta e navegadores automatizados. */
(function () {
  if (window.__plRastreio) return
  window.__plRastreio = 1
  var eu = document.currentScript || document.querySelector('script[src*="rastreio.js"]')
  if (!eu) return
  var D = eu.dataset || {}
  var API = new URL(eu.src).origin + '/api/comportamento'
  var slug = String(D.slug || (window.PL_CFG || {}).slug || '')
  var q
  try { q = new URLSearchParams(location.search) } catch (e) { return }
  var ROBO = ['facebook_right_column', 'others', 'an', 'audience_network', '{{placement}}']
  var editando = /elementor-preview|[?&]preview=true|[?&]preview_id=/.test(location.search)
  if (!slug || editando || navigator.webdriver) return
  if ((q.get('utm_content') || '').indexOf('{{') >= 0 || ROBO.indexOf((q.get('utm_medium') || '').toLowerCase()) >= 0) return
  var NOMES = D.blocos ? String(D.blocos).split(',') : []
  // Links que levam ao checkout (botão de comprar): data-cta ou domínio de gateway.
  var CHECKOUT = /greenn\.com\.br|hotmart\.com|kiwify\.com\.br|pay\.kiwify|eduzz\.com|ticto\.app|perfectpay\.com\.br|monetizze\.com\.br|braip\.com|lastlink\.com|cakto\.com\.br|pagar\.me|mercadopago/i

  var t0 = Date.now(), agora = function () { return Date.now() - t0 }
  var uid = function () { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : t0 + '-' + Math.random().toString(36).slice(2) }
  var vid = null
  try { vid = localStorage.getItem('pl_vid'); if (!vid) { vid = uid(); localStorage.setItem('pl_vid', vid) } } catch (e) {}
  var w = window.innerWidth || 0
  var s = {
    id: uid(), vid: vid, slug: slug,
    utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign'), utm_content: q.get('utm_content'), utm_term: q.get('utm_term'),
    fbclid: q.get('fbclid') ? 1 : 0, aparelho: w < 768 ? 'celular' : w < 1100 ? 'tablet' : 'computador', largura: w, altura: window.innerHeight || 0,
    ref: (document.referrer || '').slice(0, 120) || null, carregou_ms: null,
    total_ms: 0, ativo_ms: 0, rolagem_max: 0, bloco_max: 0, ultimo_bloco: 0, blocos: {}, cliques: [], comprar_ms: null, comprar_local: null, saiu: false
  }
  // guarda o rastreio do anúncio na aba (para levar ao checkout mesmo depois de navegar)
  function guarda(k, v) { try { if (v) sessionStorage.setItem('pl_' + k, v) } catch (e) {} }
  function le(k) { var v = q.get(k); if (v) { guarda(k, v); return v } try { return sessionStorage.getItem('pl_' + k) } catch (e) { return null } }
  ;['utm_term', 'utm_content', 'utm_campaign', 'utm_medium', 'utm_source', 'fbclid'].forEach(le)

  var blocos = []
  function achaBlocos() {
    var lista = []
    Array.prototype.forEach.call(document.querySelectorAll('[data-bloco],[class*="elb-"]'), function (el) {
      var n = el.getAttribute('data-bloco') || ((/\belb-(\d\d)\b/.exec(el.className) || [])[1])
      if (n && /^\d{1,2}$/.test(n)) lista.push({ n: +n, el: el })
    })
    if (!lista.length) {
      var raiz = document.querySelector('[data-elementor-type="wp-page"]') || document.querySelector('main') || document.body
      var filhos = Array.prototype.filter.call(raiz.children, function (el) { return el.offsetHeight > 40 && !/^(SCRIPT|STYLE|NOSCRIPT|LINK)$/.test(el.tagName) })
      if (filhos.length === 1 && filhos[0].children.length > 2) filhos = Array.prototype.filter.call(filhos[0].children, function (el) { return el.offsetHeight > 40 })
      filhos.forEach(function (el, i) { if (i < 40) lista.push({ n: i + 1, el: el }) })
    }
    blocos = lista
  }
  function blocoDe(el) { for (var i = 0; i < blocos.length; i++) if (blocos[i].el.contains(el)) return blocos[i].n; return 0 }
  function blocoNoMeio() {
    var meio = window.innerHeight / 2
    for (var i = 0; i < blocos.length; i++) { var r = blocos[i].el.getBoundingClientRect(); if (r.top <= meio && r.bottom > meio) return blocos[i].n }
    return 0
  }
  function k2(n) { return n < 10 ? '0' + n : String(n) }
  var mudou = true, ult = Date.now()
  function carregou() {
    try { var n = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]; var t = n ? (n.loadEventEnd || n.domContentLoadedEventEnd) : 0; if (t > 0) { s.carregou_ms = Math.round(t); mudou = true } } catch (e) {}
  }
  if (document.readyState === 'complete') setTimeout(carregou, 0); else window.addEventListener('load', function () { setTimeout(carregou, 0) })
  function tique() {
    var t = Date.now(), d = Math.min(t - ult, 2000); ult = t
    s.total_ms = agora()
    if (document.visibilityState !== 'visible') return
    s.ativo_ms += d
    if (!blocos.length) achaBlocos()
    var n = blocoNoMeio()
    if (n) {
      var b = s.blocos[k2(n)]
      if (!b) { b = s.blocos[k2(n)] = { ms: 0, chegou_ms: agora(), vezes: 0 }; mudou = true }
      if (s.ultimo_bloco !== n) { b.vezes++; s.ultimo_bloco = n; mudou = true }
      b.ms += d
      if (n > s.bloco_max) s.bloco_max = n
    }
    var doc = document.documentElement, alt = Math.max(doc.scrollHeight - window.innerHeight, 1)
    var r = Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / alt) * 100))
    if (r > s.rolagem_max) { s.rolagem_max = r; mudou = true }
  }
  setInterval(tique, 500)

  function curto(t) { return String(t || '').replace(/\s+/g, ' ').trim().slice(0, 60) }
  function ehCompra(a) { return a && a.tagName === 'A' && (a.hasAttribute('data-cta') || CHECKOUT.test(a.getAttribute('href') || '')) }
  function rotuloCompra(a) {
    if (a.getAttribute('data-cta')) return a.getAttribute('data-cta')
    var todos = Array.prototype.filter.call(document.querySelectorAll('a[href]'), ehCompra)
    return 'botão ' + (todos.indexOf(a) + 1)
  }
  function alvoDo(el) {
    if (!el.closest) return '?'
    var tab = el.closest('.elementor-tab-title,summary,[aria-expanded]')
    if (tab && !ehCompra(tab.closest('a')) && (tab.matches('.elementor-tab-title,summary') || (tab.textContent || '').indexOf('?') >= 0)) return 'pergunta: ' + curto(tab.textContent)
    var a = el.closest('a,button,img,[role=button]')
    if (!a) { var t = el.closest('h1,h2,h3,h4,p,li,span,div'); return 'toque fora de botão: ' + curto(t && t.textContent) }
    if (ehCompra(a)) return 'comprar: ' + rotuloCompra(a)
    if (a.tagName === 'IMG') return 'foto: ' + curto(a.getAttribute('alt') || (a.getAttribute('src') || '').split('/').pop())
    if (a.tagName === 'A') return 'link: ' + curto(a.textContent || a.getAttribute('href'))
    return 'botão: ' + curto(a.textContent || a.getAttribute('aria-label'))
  }
  function decora(a) {
    if (String(D.checkout || '').toLowerCase() !== 'sim') return
    try {
      var u = new URL(a.href)
      var p = { utm_term: le('utm_term'), src: le('utm_term'), utm_content: le('utm_content'), utm_campaign: le('utm_campaign'), utm_medium: le('utm_medium'), fbclid: le('fbclid') }
      for (var k in p) if (p[k] && !u.searchParams.get(k)) u.searchParams.set(k, p[k])
      if (!u.searchParams.get('sck')) u.searchParams.set('sck', slug)
      a.href = u.toString()
    } catch (e) {}
  }
  document.addEventListener('click', function (ev) {
    try {
      if (!blocos.length) achaBlocos()
      var alvo = alvoDo(ev.target), ms = agora()
      if (alvo.indexOf('carrossel') >= 0) ultArraste = ms
      if (s.cliques.length < 150) s.cliques.push({ ms: ms, b: blocoDe(ev.target), o: alvo })
      if (alvo.indexOf('comprar: ') === 0) {
        if (s.comprar_ms === null) { s.comprar_ms = ms; s.comprar_local = alvo.slice(9) }
        decora(ev.target.closest('a'))
        mudou = true; envia(true); return
      }
      mudou = true
    } catch (e) {}
  }, true)
  var ultArraste = -1e9
  document.addEventListener('scroll', function (ev) {
    var t = ev.target
    if (!t || t === document || !t.scrollWidth || t.scrollWidth <= t.clientWidth + 4) return
    var ms = agora(); if (ms - ultArraste < 3000) return
    ultArraste = ms
    if (s.cliques.length < 150) s.cliques.push({ ms: ms, b: blocoDe(t), o: 'carrossel: arrastou' })
    mudou = true
  }, true)

  function envia(saindo) {
    tique()
    if (!mudou && !saindo) return
    if (s.ativo_ms < 1000 && !saindo) return
    mudou = false
    if (saindo) s.saiu = true
    var corpo = JSON.stringify(s)
    try {
      if (saindo && navigator.sendBeacon && navigator.sendBeacon(API, new Blob([corpo], { type: 'text/plain' }))) return
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: corpo, keepalive: true }).catch(function () {})
    } catch (e) {}
  }
  setInterval(function () { envia(false) }, 10000)
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') envia(true) })
  window.addEventListener('pagehide', function () { envia(true) })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', achaBlocos); else achaBlocos()
  window.addEventListener('load', achaBlocos)
})()
