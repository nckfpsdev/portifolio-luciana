(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 860px)');
  if (reduce) { root.classList.add('estatico'); root.classList.remove('anima'); }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function suave(v) { v = clamp(v); return v * v * (3 - 2 * v); }          /* smoothstep: gentle at both ends */
  function saida(v) { v = clamp(v); return 1 - Math.pow(1 - v, 3); }       /* ease-out cubic: settles softly */

  /* Write a style value only when it changes, so idle frames cost nothing */
  function por(el, prop, val) {
    var c = el.__v || (el.__v = {});
    if (c[prop] !== val) { c[prop] = val; el.style.setProperty(prop, val); }
  }

  /* WhatsApp: one number, one first message */
  var wa = 'https://wa.me/5521966410350?text=' + encodeURIComponent('Olá, Luciana! Gostaria de agendar uma conversa.');
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = wa; a.target = '_blank'; a.rel = 'noopener';
  });

  /* Smooth wheel scrolling. Touch keeps the phone's own native momentum. */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true, autoRaf: false });
  }
  var NAV = 76;
  function emQuadratica(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  document.addEventListener('click', function (e) {
    if (!lenis || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1), alvo = id && document.getElementById(id);
    if (!alvo) return;
    e.preventDefault();
    lenis.scrollTo(alvo, { offset: id === 'conteudo' ? 0 : -NAV, duration: 1.5, easing: emQuadratica });
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
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
      var local = Math.round(clamp(alvo - i) * 400) / 400;
      if (local !== paths[i].last) {
        paths[i].el.style.strokeDashoffset = (paths[i].len * (1 - local)).toFixed(2);
        paths[i].last = local;
      }
    }
  }

  /* Headings: split into masked words that rise when the heading arrives */
  function partir(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var j = 0, colado = false;
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); colado = false; return; }
        /* glued to the previous word (e.g. "<em>nome</em>."): forbid a line break between them */
        if (colado) frag.appendChild(document.createTextNode('⁠'));
        var w = document.createElement('span'); w.className = 'w';
        var s = document.createElement('span'); s.textContent = tok; s.style.setProperty('--j', j++);
        w.appendChild(s); frag.appendChild(w);
        colado = true;
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.setAttribute('data-palavras', '');
  }

  /* Scroll reveals: content rises into place as each chapter arrives */
  var revelar = [];
  if (!reduce && 'IntersectionObserver' in window) {
    document.querySelectorAll('.lista h2, .quem h2, .neuro__cab h2, .como__cab h2, .convite h2, .nome__titulo').forEach(function (h) {
      partir(h); revelar.push(h);
    });
    /* (the portrait has its own curtain and the flower is drawn, so neither is in this list) */
    var grupos = ['.lista__itens li', '.lista__apoio', '.quem__texto > p', '.quem__fichas > div',
      '.pilar', '.neuro__cab > p', '.como__passos li', '.como__cab > div > p', '.como__sala', '.como__local',
      '.convite__texto > p', '.respira', '.convite__texto > .btn', '.convite__contatos li'];
    grupos.forEach(function (sel) {
      var porPai = new Map();
      document.querySelectorAll(sel).forEach(function (el) {
        var i = porPai.get(el.parentNode) || 0;
        porPai.set(el.parentNode, i + 1);
        el.setAttribute('data-revela', '');
        el.style.setProperty('--i', Math.min(i, 8));
        revelar.push(el);
      });
    });
    var ioR = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); ioR.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    revelar.forEach(function (el) { ioR.observe(el); });
  }

  /* Acts */
  var atos = Array.prototype.slice.call(document.querySelectorAll('[data-ato]'));
  var $ = function (s) { return document.querySelector(s); };
  var abertura = $('#abertura'), nome = $('#nome'), quem = $('#quem'), lilas = $('#lilas'),
      neuro = $('#neuro'), convite = $('#convite'), emblema = $('.emblema'), trilho = $('.neuro__trilho'),
      fundo = $('.lilas-fundo'), fio = $('.como__passos ol');
  var palavras = Array.prototype.slice.call(nome.querySelectorAll('.nome__palavras li'));
  var fecho = nome.querySelector('.nome__fecho');
  var linhas = Array.prototype.slice.call(lilas.querySelectorAll('[data-linha]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__indice a'));

  /* Layout is measured once (and on resize), never inside the scroll frame */
  var medidas = new Map(), vh = window.innerHeight, distancia = 0, sujo = true;
  var vigiados = [abertura, nome, quem, lilas, neuro, convite, fio].concat(atos);
  function medir() {
    var y = window.scrollY;
    vigiados.forEach(function (el) {
      var r = el.getBoundingClientRect();
      medidas.set(el, { top: r.top + y, h: r.height });
    });
    vh = window.innerHeight;
    distancia = Math.max(0, trilho.scrollWidth - window.innerWidth);
    sujo = true;
  }
  function progresso(el, modo, y) {
    var m = medidas.get(el), top = m.top - y;
    if (modo === 'pin') return clamp(-top / Math.max(1, m.h - vh));
    if (modo === 'sai') return clamp(-top / Math.max(1, m.h));
    return clamp((vh - top) / (vh + m.h));
  }

  var inicio = performance.now(), INTRO = 2600;

  function quadro(y, agora) {
    var mobile = mqMobile.matches;

    /* Act 1: parallax planes, first strokes drawn as the page opens */
    var pA = progresso(abertura, 'sai', y);
    por(abertura, '--p', reduce ? '0' : pA.toFixed(4));
    var abrir = reduce ? 1 : saida((agora - inicio - 350) / INTRO);
    desenhar('abertura', reduce ? 1 : abrir * 0.22 + pA * 0.18);

    /* Act 2: each word arrives, holds, then settles back, continuously with the scroll */
    var pN = progresso(nome, 'pin', y);
    var alvo = ((pN - 0.06) / 0.72) * palavras.length;
    palavras.forEach(function (li, i) {
      por(li, '--v', reduce ? '1' : saida(alvo - i).toFixed(3));
      por(li, '--d', reduce ? '0' : suave(alvo - i - 1).toFixed(3));
    });
    por(fecho, '--f', reduce ? '1' : saida((pN - 0.78) / 0.12).toFixed(3));

    /* Act 3: curtain opens with an eased settle */
    var pQ = progresso(quem, '', y);
    por(quem, '--rev', reduce ? '0' : (1 - saida((pQ - 0.1) / 0.34)).toFixed(4));

    /* Act 4: the peak, colour takeover (opacity on one fixed layer, no document-wide restyle) */
    var pL = progresso(lilas, 'pin', y);
    var topL = medidas.get(lilas).top - y;
    var entrada = clamp((vh - topL) / (vh * 0.9));
    var sai = 1 - clamp((pL - 0.86) / 0.14);
    var cor = suave(Math.min(entrada, sai));
    por(fundo, 'opacity', cor.toFixed(3));
    document.body.classList.toggle('no-lilas', cor > 0.5);
    por(lilas, '--t', reduce ? '1' : saida((vh - topL) / (vh * 0.7) - 0.2).toFixed(4));
    linhas.forEach(function (p, i) { p.classList.toggle('vista', reduce || pL > 0.2 + i * 0.14); });

    /* Act 5: lateral travel (desktop, motion allowed), eased at both ends; photo drifts inside its frame */
    if (!mobile && !reduce) {
      var pNe = suave((progresso(neuro, 'pin', y) - 0.06) / 0.86);
      por(trilho, '--x', (-pNe * distancia).toFixed(1) + 'px');
      por(trilho, '--px', ((pNe - 0.5) * 48).toFixed(1));
    } else {
      por(trilho, '--x', '0px'); por(trilho, '--px', '0');
    }

    /* Act 6: the thread between the steps fills as you read down */
    var mF = medidas.get(fio);
    por(fio, '--fio', reduce ? '1' : (mobile
      ? clamp((vh * 0.62 - (mF.top - y)) / Math.max(1, mF.h))
      : clamp((vh * 0.8 - (mF.top - y)) / (vh * 0.4))).toFixed(4));

    /* Signature: the emblem is drawn by the whole journey, completes at the invitation */
    var topC = medidas.get(convite).top - y;
    var alvoFim = y + topC - vh * 0.45;
    var g = reduce ? 1 : clamp(y / Math.max(1, alvoFim));
    desenhar('emblema', g);
    desenhar('convite', g);
    emblema.classList.toggle('oculto', topC < vh * 0.55);

    /* Chapter index */
    var meio = y + vh * 0.45, atualCap = null;
    atos.forEach(function (a) {
      var m = medidas.get(a);
      if (m.top < meio && m.top + m.h > meio) atualCap = a.id;
    });
    navLinks.forEach(function (l) {
      var v = String(l.getAttribute('data-cap') === atualCap);
      if (l.getAttribute('aria-current') !== v) l.setAttribute('aria-current', v);
    });
  }

  /* One frame loop drives smooth scrolling and every scroll-linked value */
  var ultimoY = -1;
  function loop(t) {
    if (lenis) lenis.raf(t);
    var y = window.scrollY;
    var abrindo = !reduce && t - inicio < INTRO + 400;
    if (sujo || abrindo || y !== ultimoY) { ultimoY = y; sujo = false; quadro(y, t); }
    requestAnimationFrame(loop);
  }

  medir();
  window.addEventListener('resize', medir);
  window.addEventListener('load', medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  if ('ResizeObserver' in window) new ResizeObserver(function () { medir(); }).observe(document.body);
  mqMobile.addEventListener && mqMobile.addEventListener('change', medir);
  quadro(window.scrollY, performance.now());
  requestAnimationFrame(loop);

  /* Act 6: steps light up in order */
  var passos = document.querySelectorAll('[data-passo]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -38% 0px' });
    passos.forEach(function (p) { io.observe(p); });
  } else { passos.forEach(function (p) { p.classList.add('on'); }); }

  /* Act 3: the care points open one at a time; the line fills, then the next opens. A click takes over. */
  (function () {
    var cx = document.querySelector('.pilares'); if (!cx) return;
    var ps = Array.prototype.slice.call(cx.querySelectorAll('.pilar')), atual = 0;
    function abrirPilar(i) {
      atual = i;
      ps.forEach(function (p, k) {
        var on = k === i;
        p.classList.toggle('on', on);
        p.querySelector('.pilar__btn').setAttribute('aria-expanded', String(on));
      });
    }
    ps.forEach(function (p, i) {
      p.querySelector('.pilar__btn').addEventListener('click', function () {
        cx.classList.remove('auto');
        abrirPilar(i);
      });
      p.addEventListener('animationend', function (e) {
        if (e.animationName === 'encher' && cx.classList.contains('auto')) abrirPilar((atual + 1) % ps.length);
      });
    });
    if (!reduce && 'IntersectionObserver' in window) {
      cx.classList.add('auto');
      new IntersectionObserver(function (es) {
        cx.classList.toggle('parado', !es[0].isIntersecting);
      }, { threshold: 0.4 }).observe(cx);
    }
  })();

  /* Act 6: Presencial / Online tabs (arrow keys move between them) */
  (function () {
    var abas = Array.prototype.slice.call(document.querySelectorAll('.abas [role="tab"]'));
    function ir(i, foco) {
      abas.forEach(function (a, k) {
        var on = k === i;
        a.setAttribute('aria-selected', String(on)); a.tabIndex = on ? 0 : -1;
        document.getElementById(a.getAttribute('aria-controls')).hidden = !on;
      });
      if (foco) abas[i].focus();
    }
    abas.forEach(function (a, i) {
      a.addEventListener('click', function () { ir(i); });
      a.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); ir((i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length, true); }
      });
    });
  })();

  /* Act 7: breathe with me (4 in, 4 hold, 6 out, three times) */
  var botao = document.querySelector('[data-respira]');
  var fala = document.querySelector('.respira__fala');
  var florBox = document.querySelector('.convite__flor');
  var fases = [['Inspire…', 4000], ['Segure…', 4000], ['Solte devagar…', 6000]];
  function dizer(txt) {
    fala.classList.remove('troca'); void fala.offsetWidth; fala.classList.add('troca');
    fala.textContent = txt;
  }
  botao.addEventListener('click', function () {
    botao.disabled = true;
    if (!reduce) { florBox.classList.remove('respirando'); void florBox.offsetWidth; florBox.classList.add('respirando'); }
    var passo = 0, total = fases.length * 3;
    (function proxima() {
      if (passo >= total) {
        dizer('Quando quiser, estou aqui.');
        botao.disabled = false; botao.textContent = 'Respirar de novo';
        florBox.classList.remove('respirando');
        return;
      }
      var f = fases[passo % fases.length];
      dizer(f[0]);
      passo++;
      setTimeout(proxima, f[1]);
    })();
  });
})();
