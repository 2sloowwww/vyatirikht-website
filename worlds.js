/* ══════════════════════════════════════════════════════════════
   worlds.js — digital-headquarters glue for the gateway + world
   pages. Cinematic page transitions, magnetic cards, lazy card
   video, and active-world highlighting. Vanilla; reduced-motion
   aware; every hook is null-guarded so it is safe on any page.
══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Scroll reveal — mirrors main.js so the world pages animate too.
     Skipped on Studio, where main.js already runs the observer. ── */
  (function () {
    if (document.getElementById('main-nav')) return;          /* studio has main.js */
    var els = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-wipe');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var ob = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { ob.observe(el); });
  })();

  /* ── Active world in the global nav ── */
  (function () {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.gnav-links a').forEach(function (a) {
      var target = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (target && target === here) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ── Cinematic page transition (fade + blur veil on the way out) ──
     Inbound fade is handled purely in CSS (pageIn on the body), so a
     slow script can never leave a page stuck behind the veil. */
  (function () {
    var veil = document.getElementById('pageVeil');
    document.querySelectorAll('a[data-transition]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#') return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; /* let new-tab through */
        if (a.getAttribute('target') === '_blank') return;
        e.preventDefault();
        if (veil && !reduce) {
          veil.classList.add('show');
          setTimeout(function () { window.location.href = href; }, 460);
        } else {
          window.location.href = href;
        }
      });
    });
    /* If restored from bfcache with the veil still up, clear it */
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted && veil) veil.classList.remove('show');
    });
  })();

  /* ── Lazy-load + play the gateway card videos ── */
  (function () {
    var vids = [].slice.call(document.querySelectorAll('.gw-vid[data-src]'));
    if (!vids.length) return;
    function activate(v) {
      if (v.dataset.loaded) return;
      v.dataset.loaded = '1';
      v.muted = true; v.setAttribute('muted', '');
      v.src = v.getAttribute('data-src');
      var p = v.play();
      if (p && p.catch) p.catch(function () {}); /* autoplay may be blocked; poster remains */
    }
    if (reduce) return; /* honour reduced-motion: keep the poster still */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); }
        });
      }, { rootMargin: '200px' });
      vids.forEach(function (v) { io.observe(v); });
    } else {
      vids.forEach(activate);
    }
  })();

  /* ── Studio card: rotate through multiple reels at random ── */
  (function () {
    document.querySelectorAll('.gw-vid[data-reels]').forEach(function (v) {
      var list = (v.getAttribute('data-reels') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!list.length) return;
      v.dataset.loaded = '1';               /* keep the generic lazy loader off this one */
      if (reduce) return;                   /* reduced-motion: keep the still poster */
      var i = Math.floor(Math.random() * list.length);
      function show(n, instant) {
        v.muted = true; v.setAttribute('muted', '');
        if (instant) { v.src = list[n]; var p0 = v.play(); if (p0 && p0.catch) p0.catch(function () {}); return; }
        v.style.opacity = '0';
        setTimeout(function () {
          v.src = list[n]; var p = v.play(); if (p && p.catch) p.catch(function () {});
          v.style.opacity = '1';
        }, 380);
      }
      show(i, true);
      setInterval(function () {
        i = (i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length; /* random next, never a repeat */
        show(i, false);
      }, 9000);
    });
  })();

  /* ── Magnetic pull on the gateway cards' content ── */
  (function () {
    if (!fine || reduce) return;
    var MAX = 10;
    document.querySelectorAll('[data-magnetic]').forEach(function (card) {
      var body = card.querySelector('.gw-body') || card;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width  - 0.5) * MAX;
        var y = ((e.clientY - r.top)  / r.height - 0.5) * MAX;
        body.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (y - 6).toFixed(1) + 'px,0)';
      });
      card.addEventListener('mouseleave', function () { body.style.transform = ''; });
    });
  })();
})();
