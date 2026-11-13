(function () {
  'use strict';

  // WhatsApp: número e mensagem inicial centralizados aqui
  var WA_NUMERO = '5521966410350';
  var WA_MSG = 'Olá, Luciana! Gostaria de agendar uma conversa.';
  var waUrl = 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(WA_MSG);
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.setAttribute('href', waUrl);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  // Instagram: preencher quando o @ for confirmado
  var INSTAGRAM = '';
  document.querySelectorAll('[data-insta]').forEach(function (el) {
    if (INSTAGRAM) el.setAttribute('href', INSTAGRAM);
    else el.closest('li').hidden = true;
  });

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  function fechar() {
    menu.classList.remove('aberto');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menu');
  }
  btn.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', String(aberto));
    btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
