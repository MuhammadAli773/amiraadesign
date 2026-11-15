/* Amiraa Designs – loads products and blog posts from /data/*.json
   The admin panel (/admin) edits those JSON files; this script shows them. */
(function () {
  'use strict';

  // WhatsApp number for orders/inquiries: country code + number, digits only (no +, no spaces)
  var WHATSAPP = '923094045446';
  function waLink(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }

  var CATS = { bridal: 'Bridal Couture', party: 'Party Wear', modest: 'Abaya & Niqab', bespoke: 'Atelier Bespoke' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slugify(s) {
    return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function load(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }
  function fmtDate(d) {
    var dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function show(el) { requestAnimationFrame(function () { el.classList.add('visible'); }); }
  // A missing picture should leave a soft blank, not a broken-image icon.
  function img(src, alt, attrs, eager) {
    // Missing pictures are swapped for a placeholder by script.js (no inline handlers, so a strict CSP works).
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" ' + (eager ? '' : 'loading="lazy" decoding="async" ') + (attrs || '') + '>';
  }

  /* ---------- Collections page ---------- */
  function initCollections() {
    var grid = document.getElementById('collectionsGrid');
    if (!grid) return;

    load('data/products.json').then(function (data) {
      var items = data.products || [];
      if (!items.length) { grid.innerHTML = '<p class="collections-empty">New pieces coming soon.</p>'; return; }

      grid.innerHTML = items.map(function (p, i) {
        var price = p.price && String(p.price).trim() ? esc(p.price) : 'Price on request';
        return '<div class="collection-card reveal reveal-delay-' + (i % 3) + '" data-category="' + esc(p.category) + '">' +
          img(p.image, p.title, 'class="card-img" width="600" height="800"') +
          '<div class="card-overlay">' +
            '<span class="card-cat">' + esc(CATS[p.category] || p.category) + '</span>' +
            '<h3>' + esc(p.title) + '</h3>' +
            '<p>' + esc(p.description) + '</p>' +
            '<span class="card-price">' + price + '</span>' +
            '<a href="' + esc(waLink("Hello Amiraa Designs, I am interested in: " + p.title)) + '" target="_blank" rel="noopener noreferrer" class="btn-gold-card" aria-label="Inquire about ' + esc(p.title) + ' on WhatsApp (opens in a new tab)">Inquire Piece</a>' +
          '</div>' +
          '<button type="button" class="card-open" aria-label="View larger photo: ' + esc(p.title) + '"></button>' +
          '<div class="card-arrow" aria-hidden="true">↗</div>' +
        '</div>';
      }).join('');
      grid.querySelectorAll('.reveal').forEach(show);

      var buttons = document.querySelectorAll('[data-filter]');
      var cards = grid.querySelectorAll('.collection-card');
      var status = document.getElementById('collectionsStatus');
      var empty = document.createElement('p');
      empty.className = 'collections-empty';
      empty.hidden = true;
      empty.textContent = 'New pieces in this collection are on their way. Message us on WhatsApp to see what is in the atelier.';
      grid.appendChild(empty);
      function apply(f) {
        var n = 0;
        buttons.forEach(function (b) {
          var on = b.getAttribute('data-filter') === f;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        cards.forEach(function (c) {
          var show = (f === 'all' || c.getAttribute('data-category') === f);
          c.style.display = show ? '' : 'none';
          if (show) n++;
        });
        empty.hidden = n > 0;
        if (status) status.textContent = n + (n === 1 ? ' piece shown' : ' pieces shown');
      }
      buttons.forEach(function (b) {
        b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
      });
      var wanted = new URLSearchParams(location.search).get('cat');
      apply(wanted || 'all');
    }).catch(function () {
      grid.innerHTML = '<p class="collections-empty">We could not load the collection. Please refresh the page.</p>';
    });
  }

  /* ---------- Blog list page ---------- */
  var PAGE_SIZE = 9;

  function sortedPosts(data) {
    return (data.posts || []).map(function (p) {
      p.slug = p.slug || slugify(p.title);
      return p;
    }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }

  function initBlog() {
    var app = document.getElementById('blogApp');
    var catBar = document.getElementById('blogCats');
    if (!app || !catBar) return;

    load('data/blog.json').then(function (data) {
      var posts = sortedPosts(data);
      if (!posts.length) { app.innerHTML = '<p class="collections-empty">New stories coming soon.</p>'; return; }

      var featured = posts.filter(function (p) { return p.featured; })[0] || posts[0];
      var cats = [];
      posts.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      var filter = 'All Stories', shown = PAGE_SIZE;

      function link(p) { return 'post.html?p=' + encodeURIComponent(p.slug); }

      function render(focusSel) {
        catBar.innerHTML = ['All Stories'].concat(cats).map(function (c) {
          return '<button type="button" class="category-tag' + (c === filter ? ' active' : '') + '" aria-pressed="' + (c === filter) + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
        }).join('');

        var all = filter === 'All Stories';
        var list = posts.filter(function (p) { return all ? p !== featured : p.category === filter; });
        var html = '';

        if (all) {
          html += '<article class="featured-post reveal">' +
            '<div class="featured-img">' + img(featured.image, featured.title, 'width="800" height="500"', true) + '</div>' +
            '<div class="featured-content">' +
              '<span class="blog-meta">Featured • ' + esc(featured.category) + ' • ' + fmtDate(featured.date) + '</span>' +
              '<h2>' + esc(featured.title) + '</h2>' +
              '<p>' + esc(featured.excerpt) + '</p>' +
              '<a href="' + link(featured) + '" class="blog-link" aria-label="Read the full story: ' + esc(featured.title) + '">Read Full Story →</a>' +
            '</div></article>';
        }
        html += '<div class="blog-grid">' + list.slice(0, shown).map(function (p, i) {
          return '<article class="blog-card reveal reveal-delay-' + (i % 3) + '">' +
            '<div class="blog-card-img">' + img(p.image, p.title, 'width="800" height="500"') + '</div>' +
            '<div class="blog-card-content">' +
              '<span class="blog-meta">' + esc(p.category) + ' • ' + fmtDate(p.date) + '</span>' +
              '<h3><a href="' + link(p) + '">' + esc(p.title) + '</a></h3>' +
              '<p>' + esc(p.excerpt) + '</p>' +
              '<span class="blog-link" aria-hidden="true">Read More →</span>' +
            '</div></article>';
        }).join('') + '</div>';
        if (list.length > shown) {
          html += '<div class="blog-more"><button type="button" class="t-btn" id="moreStories">Load more stories</button></div>';
        }
        app.innerHTML = html;
        app.querySelectorAll('.reveal').forEach(show);

        var more = document.getElementById('moreStories');
        if (more) more.addEventListener('click', function () { var before = shown; shown += PAGE_SIZE; render('.blog-grid .blog-card:nth-child(' + (before + 1) + ') h3 a'); });
        catBar.querySelectorAll('[data-cat]').forEach(function (b) {
          b.addEventListener('click', function () { filter = b.getAttribute('data-cat'); shown = PAGE_SIZE; render('[data-cat="' + filter.replace(/"/g, '') + '"]'); });
        });
        // the lists are rebuilt on every change, so hand keyboard focus back to a sensible place
        if (focusSel) { var t = document.querySelector(focusSel); if (t) t.focus({ preventScroll: focusSel.indexOf('blog-card') < 0 }); }
      }
      render();
    }).catch(function () {
      app.innerHTML = '<p class="collections-empty">We could not load the stories. Please refresh the page.</p>';
    });
  }

  /* ---------- Single post page ---------- */
  function markdown(src) {
    if (window.marked && window.DOMPurify) {
      return window.DOMPurify.sanitize(window.marked.parse(String(src || '')));
    }
    // Fallback if the helper libraries cannot load: plain paragraphs.
    return String(src || '').split(/\n{2,}/).map(function (para) { return '<p>' + esc(para) + '</p>'; }).join('');
  }

  function initPost() {
    var app = document.getElementById('postApp');
    if (!app) return;
    var want = new URLSearchParams(location.search).get('p');

    load('data/blog.json').then(function (data) {
      var posts = sortedPosts(data);
      var p = posts.filter(function (x) { return x.slug === want; })[0];
      if (!p) {
        app.innerHTML = '<p class="collections-empty">That story could not be found.</p>' +
          '<p class="collections-empty"><a href="blog.html" class="blog-link">← Back to the Journal</a></p>';
        return;
      }
      document.title = p.title + ' – Amiraa Designs';
      var t = document.getElementById('postTitle'); if (t) t.textContent = p.title;
      var m = document.getElementById('postMeta'); if (m) m.textContent = p.category + ' • ' + fmtDate(p.date);
      // Per-post description for search engines and link previews
      function setMeta(sel, v) { var el = document.querySelector(sel); if (el && v) el.setAttribute('content', v); }
      setMeta('meta[name="description"]', p.excerpt);
      setMeta('meta[property="og:title"]', p.title + ' – Amiraa Designs');
      setMeta('meta[property="og:description"]', p.excerpt);

      app.innerHTML = img(p.image, p.title, 'class="post-hero" width="1280" height="720"', true) +
        '<div class="post-body">' + markdown(p.body) + '<p><a href="blog.html" class="blog-link">← Back to the Journal</a></p></div>';
    }).catch(function () {
      app.innerHTML = '<p class="collections-empty">We could not load this story. Please refresh the page.</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCollections();
    initBlog();
    initPost();
  });
})();
