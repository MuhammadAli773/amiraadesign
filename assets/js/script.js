// Amiraa Designs – shared page behaviour (splash, nav + menu, reveal, sparkles, image fallback)
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scriptSrc = document.currentScript && document.currentScript.src;

  // Always start at the top on load / refresh
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() { if (!window.location.hash) window.scrollTo(0, 0); }
  toTop();

  /* ── Splash: full animation on the first visit of a session, skipped afterwards.
        Timed from DOM ready (not from "all images loaded") so it never lingers on slow connections. */
  function seen() { try { return sessionStorage.getItem('amiraaSplashSeen') === '1'; } catch (e) { return false; } }
  function mark() { try { sessionStorage.setItem('amiraaSplashSeen', '1'); } catch (e) { /* storage blocked: fine */ } }
  function hideSplash(splash) {
    splash.classList.add('hidden');
    splash.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    mark(); toTop();
  }
  function initSplash() {
    var splash = document.getElementById('splash-screen');
    if (!splash) { document.body.classList.remove('no-scroll'); return; }
    if (seen() || reduce) { hideSplash(splash); return; }
    setTimeout(function () {
      splash.classList.add('exit');
      setTimeout(function () { hideSplash(splash); }, 300);
    }, 800);
  }

  /* ── Navbar: solid bar once scrolled (also evaluated on load, so inner pages and refreshes match) */
  var navbar = document.getElementById('navbar');
  var navTick = false;
  function navState() { navTick = false; if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', function () { if (!navTick) { navTick = true; requestAnimationFrame(navState); } }, { passive: true });

  /* ── Mobile menu: button state, Escape to close, scroll lock, closes on link tap or when the screen widens */
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    if (navbar) navbar.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-lock', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && menu.classList.contains('open')) setMenu(false); });
  }

  /* ── Scroll reveal */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // reveal when about to enter, and also when it was scrolled past quickly
        if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Sparkles (kept light: fewer dots, and paused while off-screen) */
  function initSparkles() {
    document.querySelectorAll('.sparkle-bg').forEach(function (box) {
      box.innerHTML = '';
      var splash = !!box.closest('#splash-screen');
      var n = splash ? 10 : 8;
      for (var i = 0; i < n; i++) {
        var d = document.createElement('div');
        d.className = 'sparkle-dot';
        if (splash) { var s = Math.floor(Math.random() * 10) + 8; d.style.width = s + 'px'; d.style.height = s + 'px'; }
        d.style.top = Math.random() * 100 + '%';
        d.style.left = Math.random() * 100 + '%';
        d.style.animationDelay = (Math.random() * (splash ? 1.5 : 3)) + 's';
        d.style.animationDuration = (splash ? Math.random() * 1.5 + 1.5 : Math.random() * 2 + 2) + 's';
        box.appendChild(d);
      }
    });
  }
  function initPause() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
    }, { rootMargin: '80px' });
    document.querySelectorAll('#hero, #cta').forEach(function (el) { io.observe(el); });
  }

  /* ── Missing-image fallback (works for images added later by content.js; error events don't bubble, so capture) */
  var PLACEHOLDER = scriptSrc ? new URL('../../images/placeholder.svg', scriptSrc).href : '/images/placeholder.svg';
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && !el.dataset.fallback) { el.dataset.fallback = '1'; el.src = PLACEHOLDER; }
  }, true);
  function fixBrokenImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && !img.dataset.fallback) { img.dataset.fallback = '1'; img.src = PLACEHOLDER; }
    });
  }

  function ready() { toTop(); navState(); initSplash(); initReveal(); initSparkles(); initPause(); fixBrokenImages(); }
  if (document.readyState !== 'loading') ready(); else document.addEventListener('DOMContentLoaded', ready);
  window.addEventListener('load', toTop);
})();
