// Amiraa Designs – effects layer (no libraries): thread vines, WhatsApp button, petals, 3D tilt, tap sparkles, parallax, photo viewer
(function () {
  'use strict';
  var WHATSAPP = '923094045446'; // same number as content.js
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var body = document.body;

    /* ── Floating WhatsApp button */
    var wa = document.createElement('a');
    wa.className = 'wa-float';
    wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hello Amiraa Designs, I would like to ask about your designs.');
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'Chat with us on WhatsApp (opens in a new tab)');
    wa.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.9 11.9 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.59 5.93L0 24l6.4-1.68a11.8 11.8 0 005.64 1.44h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.44zM12.05 21.8h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.8 1 1.02-3.7-.24-.38a9.84 9.84 0 01-1.51-5.27c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 012.9 6.99c0 5.45-4.44 9.88-9.84 9.88zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/></svg>';
    body.appendChild(wa);

    /* ── Thread vines: one continuous vine per run of neighbouring plain light sections (wide screens only) */
    var vineLayer = null;
    function eligible(sec) {
      if (sec.id === 'hero' || sec.id === 'cta' || sec.id === 'splash-screen' || sec.offsetHeight < 300) return false;
      var cs = getComputedStyle(sec);
      if (cs.backgroundImage !== 'none') return false;
      var m = cs.backgroundColor.match(/[\d.]+/g);
      if (m && m.length >= 3 && (m.length < 4 || parseFloat(m[3]) > 0.5)) {
        if ((0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 < 0.8) return false; // dark or strongly coloured
      }
      return true;
    }
    function layoutVines() {
      if (vineLayer) { vineLayer.remove(); vineLayer = null; }
      if (window.innerWidth < 1500) return;
      var secs = Array.prototype.slice.call(document.querySelectorAll('body > section, main > section'));
      var runs = [], cur = null;
      secs.forEach(function (sec) {
        if (eligible(sec)) { if (cur && cur.last.nextElementSibling === sec) cur.last = sec; else { cur = { first: sec, last: sec }; runs.push(cur); } }
        else cur = null;
      });
      vineLayer = document.createElement('div');
      vineLayer.className = 'vine-layer';
      vineLayer.setAttribute('aria-hidden', 'true');
      var y = window.pageYOffset;
      runs.forEach(function (r) {
        var top = r.first.getBoundingClientRect().top + y;
        var h = r.last.getBoundingClientRect().bottom + y - top;
        ['left', 'right'].forEach(function (side) {
          var v = document.createElement('div');
          v.className = 'side-vine ' + side;
          v.style.top = top + 'px';
          v.style.height = h + 'px';
          vineLayer.appendChild(v);
        });
      });
      document.body.appendChild(vineLayer);
    }
    var vt;
    function scheduleVines() { clearTimeout(vt); vt = setTimeout(layoutVines, 200); }
    layoutVines();
    window.addEventListener('load', layoutVines);
    window.addEventListener('resize', scheduleVines);
    var lastH = document.body.scrollHeight;
    if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(document.body.scrollHeight - lastH) > 4) { lastH = document.body.scrollHeight; scheduleVines(); } }).observe(document.body);

    if (reduce) { initViewer(); return; }

    /* ── Floating petals in the hero and the call-to-action band */
    var phone = window.innerWidth < 700;
    function rnd(m) { return (Math.random() * 2 - 1) * m; }
    ['hero', 'cta'].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      var n = phone ? 8 : 12;
      for (var i = 0; i < n; i++) {
        var p = document.createElement('span');
        p.className = 'petal';
        p.setAttribute('aria-hidden', 'true');
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDuration = (9 + Math.random() * 7) + 's';
        p.style.animationDelay = (-Math.random() * 14) + 's';
        p.style.setProperty('--sway', rnd(110) + 'px');
        p.style.setProperty('--w1', rnd(90) + 'px');
        p.style.setProperty('--w2', rnd(90) + 'px');
        p.style.setProperty('--r1', (60 + Math.random() * 140) + 'deg');
        p.style.setProperty('--r2', (340 + Math.random() * 140) + 'deg');
        p.style.setProperty('--ps', (phone ? 14 + Math.random() * 12 : 14 + Math.random() * 10) + 'px');
        host.appendChild(p);
      }
    });

    /* ── 3D tilt + shine: mouse hover on computers, finger press on phones (scrolling cancels it) */
    var CARD = '.collection-card, .blog-card';
    function tilt(card, cx, cy) {
      var r = card.getBoundingClientRect();
      var x = Math.min(1, Math.max(0, (cx - r.left) / r.width)), y = Math.min(1, Math.max(0, (cy - r.top) / r.height));
      var shine = card.querySelector('.tilt-shine');
      if (!shine) { shine = document.createElement('span'); shine.className = 'tilt-shine'; shine.setAttribute('aria-hidden', 'true'); card.appendChild(shine); }
      shine.style.setProperty('--mx', (x * 100) + '%');
      shine.style.setProperty('--my', (y * 100) + '%');
      card.classList.add('tilting');
      card.style.transition = 'transform .12s ease-out, box-shadow .3s ease';
      card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 10).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 12).toFixed(2) + 'deg) scale(1.02)';
    }
    function release(card) { card.classList.remove('tilting'); card.style.transition = ''; card.style.transform = ''; }
    var current = null;
    if (fine) {
      document.addEventListener('pointermove', function (e) {
        var card = e.target.closest && e.target.closest(CARD);
        if (current && current !== card) release(current);
        current = card || null;
        if (card) tilt(card, e.clientX, e.clientY);
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', function () { if (current) { release(current); current = null; } });
    }
    var touchCard = null, ty0 = 0;
    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0], card = e.target.closest && e.target.closest(CARD);
      if (!card) return;
      touchCard = card; ty0 = t.clientY; tilt(card, t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!touchCard) return;
      var t = e.touches[0];
      if (Math.abs(t.clientY - ty0) > 10) { release(touchCard); touchCard = null; return; } // the visitor is scrolling
      tilt(touchCard, t.clientX, t.clientY);
    }, { passive: true });
    function endTouch() { if (touchCard) { var c = touchCard; touchCard = null; setTimeout(function () { release(c); }, 160); } }
    document.addEventListener('touchend', endTouch, { passive: true });
    document.addEventListener('touchcancel', endTouch, { passive: true });

    /* ── Sparkle burst on finger taps (phones/tablets only; computers keep the plain pointer) */
    var COLS = ['#d4af37', '#f6dd9a', '#ffffff', '#f5c6bd'];
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      if (e.target.closest && e.target.closest('input, textarea, select, .lb')) return;
      for (var i = 0; i < 9; i++) {
        var s = document.createElement('span');
        s.className = 'burst';
        s.setAttribute('aria-hidden', 'true');
        var ang = (Math.PI * 2 * i) / 9 + Math.random() * 0.5, dist = 34 + Math.random() * 38;
        s.style.setProperty('--x', e.clientX + 'px');
        s.style.setProperty('--y', e.clientY + 'px');
        s.style.setProperty('--tx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        s.style.setProperty('--ty', (Math.sin(ang) * dist).toFixed(1) + 'px');
        s.style.setProperty('--sz', (8 + Math.random() * 10).toFixed(0) + 'px');
        s.style.setProperty('--col', COLS[i % COLS.length]);
        s.addEventListener('animationend', function () { this.remove(); });
        document.body.appendChild(s);
      }
    }, { passive: true });

    /* ── Parallax: hero background and pictures drift as you scroll.
          Only pictures currently on screen are measured, so scrolling stays smooth on phones. */
    var heroBg = document.querySelectorAll('.hero-bg'), pTick = false;
    var PIC = '.collection-card .card-img, .blog-card-img img, .featured-img img';
    var onScreen = new Set(), watched = new WeakSet(), picIO = null;
    if ('IntersectionObserver' in window) {
      picIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) onScreen.add(e.target); else onScreen.delete(e.target); });
        requestParallax();
      }, { rootMargin: '60px' });
    }
    function watchPics() {
      if (!picIO) return;
      document.querySelectorAll(PIC).forEach(function (im) { if (!watched.has(im)) { watched.add(im); picIO.observe(im); } });
    }
    function parallax() {
      pTick = false;
      var vh = window.innerHeight, sy = window.scrollY;
      if (sy < vh * 1.2) {
        var hy = Math.min(sy * 0.2, vh * 0.08).toFixed(1) + 'px';
        heroBg.forEach(function (el) { el.style.setProperty('--hy', hy); });
      }
      onScreen.forEach(function (im) {
        var r = im.getBoundingClientRect();
        var pr = ((r.top + r.height / 2) - vh / 2) / vh;
        im.style.setProperty('--py', (Math.max(-1, Math.min(1, pr)) * -14).toFixed(1) + 'px');
      });
    }
    function requestParallax() { if (!pTick) { pTick = true; requestAnimationFrame(parallax); } }
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    watchPics();
    // pictures rendered later by content.js (collections / blog)
    ['collectionsGrid', 'blogApp'].forEach(function (id) {
      var host = document.getElementById(id);
      if (host && window.MutationObserver) new MutationObserver(watchPics).observe(host, { childList: true, subtree: true });
    });

    initViewer();
  });

  /* ── Photo viewer: open a piece on the Collections page to see it bigger (keyboard + screen-reader friendly) */
  function initViewer() {
    var grid = document.getElementById('collectionsGrid');
    if (!grid) return;
    var lb = null, lastFocus = null;

    function close() {
      if (!lb) return;
      lb.classList.remove('open');
      var gone = lb; lb = null;
      setTimeout(function () { gone.remove(); }, 250);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (!lb) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = lb.querySelectorAll('a[href], button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function open(card) {
      var im = card.querySelector('img.card-img');
      if (!im) return;
      var title = card.querySelector('h3'), price = card.querySelector('.card-price'), inq = card.querySelector('a.btn-gold-card');
      lastFocus = document.activeElement;
      lb = document.createElement('div');
      lb.className = 'lb';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', title ? title.textContent : 'Photo');
      var box = document.createElement('div'); box.className = 'lb-box';
      var big = document.createElement('img'); big.src = im.currentSrc || im.src; big.alt = im.alt || '';
      var cap = document.createElement('div'); cap.className = 'lb-cap';
      var st = document.createElement('strong'); st.textContent = title ? title.textContent : '';
      var sp = document.createElement('span'); sp.textContent = price ? price.textContent : '';
      cap.appendChild(st); cap.appendChild(sp);
      if (inq) { var a = document.createElement('a'); a.href = inq.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Inquire on WhatsApp'; cap.appendChild(a); }
      var x = document.createElement('button'); x.className = 'lb-close'; x.type = 'button'; x.setAttribute('aria-label', 'Close photo'); x.textContent = '×';
      x.addEventListener('click', close);
      lb.addEventListener('click', function (ev) { if (ev.target === lb) close(); });
      box.appendChild(big); box.appendChild(cap);
      lb.appendChild(box); lb.appendChild(x);
      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { lb.classList.add('open'); x.focus(); });
      document.addEventListener('keydown', onKey);
    }
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.card-open');
      if (btn) open(btn.closest('.collection-card'));
    });
  }
})();
