/* Desafio 7 em 7 · avisa o pixel do Meta (InitiateCheckout) quando alguém clica num botão de compra.
   O pixel em si é carregado pelo PixelYourSite do site. Se ele não estiver na página, nada acontece. */
(function () {
  var enviado = false;
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.botao-compra a, a.botao-compra');
    if (!link || typeof window.fbq !== 'function') return;
    if (!enviado) {
      enviado = true; // uma vez por visita, mesmo que clique em mais de um botão
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Desafio 7 em 7', content_category: 'Desafio', value: 67, currency: 'BRL', num_items: 1
      }, { eventID: 'ic-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) });
    }
    // dá tempo do aviso sair antes de ir para o checkout (só quando abre na mesma aba)
    var novaAba = link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
    var href = link.getAttribute('href') || '';
    if (!novaAba && href && href.charAt(0) !== '#') {
      e.preventDefault();
      setTimeout(function () { window.location.href = link.href; }, 300);
    }
  });
})();
