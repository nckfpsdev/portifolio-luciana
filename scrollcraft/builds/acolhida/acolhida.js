(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 860px)');
  if (reduce) root.classList.add('estatico');

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* WhatsApp: one number, one first message */
  var wa = 'https://wa.me/5521966410350?text=' + encodeURIComponent('Olá, Luciana! Gostaria de agendar uma conversa.');
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = wa; a.target = '_blank'; a.rel = 'noopener';
  });

  /* Flowers: clone the vectorised logo into each drawing surface */
  var src = document.getElementById('flor-tpl').content.querySelector('svg');
  var flores = {};
  document.querySelectorAll('svg[data-flor]').forEach(function (svg) {
    var paths = [];
    Array.prototype.forEach.call(src.children, function (p) {
      var c = p.cloneNode(true);
      svg.appendChild(c);
      var len = c.getTotalLength();
      c.style.strokeDasharray = len + ' ' + len;
      c.style.strokeDashoffset = len;
      paths.push({ el: c, len: len, last: -1 });
    });
    flores[svg.getAttribute('data-flor')] = paths;
  });
  function desenhar(nome, quanto) {
    var paths = flores[nome]; if (!paths) return;
    var n = paths.length, alvo = quanto * n;
    for (var i = 0; i < n; i++) {
      var local = clamp(alvo - i);
      local = Math.round(local * 100) / 100;
      if (local !== paths[i].last) {
        paths[i].el.style.strokeDashoffset = paths[i].len * (1 - local);
        paths[i].last = local;
      }
    }
  }

  /* Acts */
  var atos = Array.prototype.slice.call(document.querySelectorAll('[data-ato]'));
  var $ = function (s) { return document.querySelector(s); };
  var abertura = $('#abertura'), nome = $('#nome'), quem = $('#quem'), lilas = $('#lilas'),
      neuro = $('#neuro'), convite = $('#convite'), emblema = $('.emblema'), trilho = $('.neuro__trilho');
  var palavras = Array.prototype.slice.call(nome.querySelectorAll('.nome__palavras li'));
  var fecho = nome.querySelector('.nome__fecho');
  var linhas = Array.prototype.slice.call(lilas.querySelectorAll('[data-linha]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__indice a'));

  function progresso(el, modo) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    if (modo === 'pin') return clamp(-r.top / Math.max(1, r.height - vh));
    if (modo === 'sai') return clamp(-r.top / Math.max(1, r.height));
    return clamp((vh - r.top) / (vh + r.height));
  }

  var abertura0 = reduce ? 1 : 0, inicio = performance.now();

  function quadro() {
    var vh = window.innerHeight;
    var mobile = mqMobile.matches;

    /* Act 1: parallax planes, first strokes */
    var pA = progresso(abertura, 'sai');
    abertura.style.setProperty('--p', reduce ? 0 : pA);
    if (!reduce) abertura0 = Math.min(1, (performance.now() - inicio) / 2600);
    var easeIn = 1 - Math.pow(1 - abertura0, 3);
    desenhar('abertura', reduce ? 1 : easeIn * 0.22 + pA * 0.18);

    /* Act 2: words arrive one at a time */
    var pN = progresso(nome, 'pin');
    var atual = Math.floor(((pN - 0.06) / 0.72) * palavras.length);
    palavras.forEach(function (li, i) {
      li.classList.toggle('agora', !reduce && i === atual);
      li.classList.toggle('vista', reduce || i < atual || (i === atual));
    });
    fecho.classList.toggle('vista', reduce || pN > 0.8);

    /* Act 3: curtain */
    var pQ = progresso(quem);
    quem.style.setProperty('--rev', reduce ? 0 : 1 - clamp((pQ - 0.12) / 0.32));

    /* Act 4: the peak, colour takeover */
    var pL = progresso(lilas, 'pin');
    var rL = lilas.getBoundingClientRect();
    var entrada = clamp((vh - rL.top) / (vh * 0.9));           /* fades in as it arrives */
    var saida = 1 - clamp((pL - 0.86) / 0.14);                   /* fades out at the end */
    var cor = Math.min(entrada, saida);
    root.style.setProperty('--lilas-p', cor.toFixed(3));
    document.body.classList.toggle('no-lilas', cor > 0.5);
    /* title rises while the section arrives, so the first lilac frame is never empty */
    lilas.style.setProperty('--t', reduce ? 1 : clamp((vh - rL.top) / (vh * 0.7) - 0.2).toFixed(3));
    linhas.forEach(function (p, i) { p.classList.toggle('vista', reduce || pL > 0.22 + i * 0.14); });

    /* Act 5: lateral travel (desktop, motion allowed) */
    if (!mobile && !reduce) {
      var pNe = clamp((progresso(neuro, 'pin') - 0.06) / 0.86);
      var distancia = Math.max(0, trilho.scrollWidth - window.innerWidth);
      trilho.style.setProperty('--x', (-pNe * distancia).toFixed(1) + 'px');
    } else {
      trilho.style.removeProperty('--x');
    }

    /* Signature: the emblem is drawn by the whole journey, completes at the invitation */
    var rC = convite.getBoundingClientRect();
    var alvoFim = window.scrollY + rC.top - vh * 0.45;
    var g = reduce ? 1 : clamp(window.scrollY / Math.max(1, alvoFim));
    desenhar('emblema', g);
    var chegou = rC.top < vh * 0.55;
    desenhar('convite', reduce ? 1 : clamp(g * 1.0));
    emblema.classList.toggle('oculto', chegou);

    /* Chapter index */
    var meio = vh * 0.45, atualCap = null;
    atos.forEach(function (a) {
      var r = a.getBoundingClientRect();
      if (r.top < meio && r.bottom > meio) atualCap = a.id;
    });
    navLinks.forEach(function (l) { l.setAttribute('aria-current', String(l.getAttribute('data-cap') === atualCap)); });
  }

  var pendente = false;
  function pedir() { if (!pendente) { pendente = true; requestAnimationFrame(function () { pendente = false; quadro(); }); } }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  if (!reduce) {
    (function abrir() { quadro(); if (abertura0 < 1) requestAnimationFrame(abrir); })();
  } else { quadro(); }

  /* Act 6: steps fill in order */
  var passos = document.querySelectorAll('[data-passo]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -35% 0px' });
    passos.forEach(function (p) { io.observe(p); });
  } else { passos.forEach(function (p) { p.classList.add('on'); }); }

  /* Act 7: breathe with me (4 in, 4 hold, 6 out, three times) */
  var botao = document.querySelector('[data-respira]');
  var fala = document.querySelector('.respira__fala');
  var florBox = document.querySelector('.convite__flor');
  var fases = [['Inspire…', 4000], ['Segure…', 4000], ['Solte devagar…', 6000]];
  botao.addEventListener('click', function () {
    botao.disabled = true;
    if (!reduce) { florBox.classList.remove('respirando'); void florBox.offsetWidth; florBox.classList.add('respirando'); }
    var passo = 0, total = fases.length * 3;
    (function proxima() {
      if (passo >= total) {
        fala.textContent = 'Quando quiser, estou aqui.';
        botao.disabled = false; botao.textContent = 'Respirar de novo';
        florBox.classList.remove('respirando');
        return;
      }
      var f = fases[passo % fases.length];
      fala.textContent = f[0];
      passo++;
      setTimeout(proxima, f[1]);
    })();
  });
})();
