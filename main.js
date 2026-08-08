/* ══════════════════════════════════════
   MJ PORTFOLIO — SCRIPTS
   main.js
══════════════════════════════════════ */

/* ── Theme toggle ──
   Light is the default; dark is opt-in and remembered.
   The <head> snippet applies the saved theme before paint —
   this only builds the control and handles clicks.
   Runs first so it works even on pages whose nav markup
   differs (mj.html uses .nav-hamburger). */
(function() {
  var STORE = 'vy-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme, btn) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORE, theme); } catch (e) {}
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  function build() {
    var nav = document.querySelector('nav');
    if (!nav || nav.querySelector('.theme-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4' +
      'M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

    apply(current(), btn);
    btn.addEventListener('click', function() {
      apply(current() === 'dark' ? 'light' : 'dark', btn);
    });

    // Sit just before the hamburger when there is one, else at the end of the nav
    var burger = nav.querySelector('.hamburger, .nav-hamburger');
    if (burger) nav.insertBefore(btn, burger);
    else nav.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

/* ── Mobile nav ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

/* Guarded: mj.html has no #hamburger, and the
   unguarded call threw there, killing the rest of this file. */
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

function closeMobile() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

/* ── Portfolio tabs ── */
function showTab(name, btn) {
  document.querySelectorAll('.portfolio-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const pane = document.getElementById('tab-' + name);
  if (pane) {
    pane.classList.add('active');
    /* Tiles in an inactive pane are display:none, so IntersectionObserver
       never fires for them and their reveal-wipe would stay clipped shut
       (i.e. invisible) forever. Reveal them as the pane opens — which also
       gives the grid a staggered wipe-in on every tab switch. */
    pane.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-wipe')
      .forEach(el => el.classList.add('visible'));
  }
  btn.classList.add('active');
}

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-wipe')
  .forEach(el => revealObserver.observe(el));

/* Nav scroll shadow is handled entirely by the .scrolled class toggle
   further down this file (CSS-driven, theme-aware via nav.scrolled in
   style.css). An inline style.boxShadow approach used to live here but
   was removed — inline styles always beat class-based box-shadow on
   specificity, so the two approaches were silently fighting each other
   and the dark-theme shadow was losing every time. */

/* ── Compounding Calculator ── */
(function() {
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const FREQ_PER_YEAR = { monthly: 12, quarterly: 4, halfyearly: 2, yearly: 1 };
  const FREQ_LABEL = { monthly: 'Monthly', quarterly: 'Quarterly', halfyearly: 'Half-Yearly', yearly: 'Yearly' };
  let selectedFreq = 'monthly';

  /* premium: amount per installment, paid `freq` times a year, for `ppt` years.
     Corpus then keeps compounding (no further contributions) for the
     remaining (term - ppt) years until the policy matures — this is how
     limited-pay ULIP/endowment plans actually behave, not a flat SIP. */
  function calcCompound(premium, freq, rate, ppt, term) {
    const perYear = FREQ_PER_YEAR[freq] || 12;
    const periodicRate = (rate / 100) / perYear;
    const payPeriods = Math.max(0, ppt) * perYear;

    let fvAtPPT;
    if (periodicRate === 0) {
      fvAtPPT = premium * payPeriods;
    } else {
      fvAtPPT = premium * ((Math.pow(1 + periodicRate, payPeriods) - 1) / periodicRate) * (1 + periodicRate);
    }

    const remainingYears = Math.max(0, term - ppt);
    const total = fvAtPPT * Math.pow(1 + rate / 100, remainingYears);
    const invested = premium * perYear * Math.max(0, ppt);

    return { invested, gain: total - invested, total };
  }

  let chart = null;

  function drawChart(invested, gain) {
    const canvas = document.getElementById('calc-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = invested + gain;
    const invAngle = total > 0 ? (invested / total) * 2 * Math.PI : 0;
    const cx = 130, cy = 130, r = 100, ir = 60;

    ctx.clearRect(0, 0, 260, 260);

    // Invested slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + invAngle);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink-faint').trim() || '#A5A099';
    ctx.fill();

    // Gain slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2 + invAngle, -Math.PI / 2 + 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#B09020';
    ctx.fill();

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, ir, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#FDFCFA';
    ctx.fill();

    // Centre text
    const gainPct = total > 0 ? Math.round((gain / total) * 100) : 0;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#B09020';
    ctx.font = 'bold 28px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gainPct + '%', cx, cy - 8);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink-muted').trim() || '#6A665E';
    ctx.font = '11px DM Mono, monospace';
    ctx.fillText('returns', cx, cy + 16);
  }

  /* Premium Payment Term can never exceed the Policy Term — keep the
     PPT field's range and value clamped to whatever the term is set to. */
  function clampPPT() {
    const termEl = document.getElementById('calc-years');
    const pptEl = document.getElementById('calc-ppt');
    const pptRangeEl = document.getElementById('calc-ppt-range');
    if (!termEl || !pptEl) return;
    const term = parseFloat(termEl.value) || 1;
    pptEl.max = term;
    if (pptRangeEl) pptRangeEl.max = term;
    if (parseFloat(pptEl.value) > term) {
      pptEl.value = term;
      if (pptRangeEl) pptRangeEl.value = term;
    }
  }

  function update() {
    const premiumEl = document.getElementById('calc-premium');
    const rateEl     = document.getElementById('calc-rate');
    const yearsEl    = document.getElementById('calc-years');
    const pptEl      = document.getElementById('calc-ppt');
    if (!premiumEl || !rateEl || !yearsEl || !pptEl) return; /* calculator not present on this page */

    clampPPT();

    const premium = parseFloat(premiumEl.value) || 0;
    const rate    = parseFloat(rateEl.value)    || 0;
    const years   = parseFloat(yearsEl.value)   || 0;
    const ppt     = parseFloat(pptEl.value)     || 0;
    if (!premium || !rate || !years || !ppt) return;

    const { invested, gain, total } = calcCompound(premium, selectedFreq, rate, ppt, years);
    const investedOut = document.getElementById('res-invested');
    const gainOut      = document.getElementById('res-gain');
    const totalOut     = document.getElementById('res-total');
    const noteOut       = document.getElementById('calc-note');
    if (investedOut) investedOut.textContent = fmt(invested);
    if (gainOut)      gainOut.textContent     = fmt(gain);
    if (totalOut)     totalOut.textContent    = fmt(total);
    if (noteOut) {
      const remaining = Math.max(0, years - ppt);
      noteOut.innerHTML = remaining > 0
        ? `<strong>${fmt(premium)}</strong> paid ${FREQ_LABEL[selectedFreq]} for <strong>${ppt} years</strong> (Premium Payment Term) — then the corpus keeps growing untouched for <strong>${remaining} more years</strong> to a <strong>${years}-year</strong> policy term.`
        : `<strong>${fmt(premium)}</strong> paid ${FREQ_LABEL[selectedFreq]} across the full <strong>${years}-year</strong> policy term.`;
    }
    drawChart(invested, gain);
  }

  function syncRange(inputId, rangeId) {
    const inp = document.getElementById(inputId);
    const rng = document.getElementById(rangeId);
    if (!inp || !rng) return;
    inp.addEventListener('input', () => { rng.value = inp.value; update(); });
    rng.addEventListener('input', () => { inp.value = rng.value; update(); });
  }

  function wireFrequency() {
    const group = document.getElementById('calc-freq-group');
    if (!group) return;
    const btns = group.querySelectorAll('.calc-freq-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFreq = btn.dataset.freq;
        update();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    syncRange('calc-premium', 'calc-premium-range');
    syncRange('calc-rate',    'calc-rate-range');
    syncRange('calc-years',   'calc-years-range');
    syncRange('calc-ppt',     'calc-ppt-range');
    wireFrequency();
    update();
  });
})();


/* ── Image fade-in on load (opt-in via .img-fade class only) ── */
document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
  img.classList.add('img-fade');
  if (img.complete && img.naturalWidth) { img.classList.add('loaded'); return; }
  img.addEventListener('load',  function() { img.classList.add('loaded'); });
  img.addEventListener('error', function() { img.classList.add('loaded'); });
});

/* ── Magnetic buttons: will-change only on hover (not constantly) ── */
document.querySelectorAll('.btn-primary,.btn-ghost,.btn-gold,.nav-cta').forEach(function(el) {
  el.addEventListener('mouseenter', function() { el.style.willChange = 'transform'; });
  el.addEventListener('mouseleave', function() { el.style.willChange = 'auto'; });
});

/* ── Close mobile menu on outside click ── */
document.addEventListener('click', function(e) {
  var menu = document.getElementById('mobileMenu');
  var burger = document.getElementById('hamburger');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) {
    menu.classList.remove('open');
  }
}, { passive: true });

/* ── Smooth anchor scroll with offset for fixed nav+ticker ── */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var href = a.getAttribute('href');
    if (!href || href === '#') return; /* placeholder links (e.g. logo) — do nothing, no real target */
    var target;
    try {
      target = document.querySelector(href);
    } catch (err) {
      return; /* not a valid selector — ignore rather than crash */
    }
    if (!target) return;
    e.preventDefault();
    var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) +
                 parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ticker-h') || '0');
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

/* ── Nav scroll class ── */
(function(){
  var nav = document.getElementById('main-nav');
  if(!nav) return;
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, {passive:true});
})();
/* ── Parallax ──
   Any [data-parallax="n"] shifts by n x the distance it has travelled
   through the viewport. Positive trails the scroll, negative leads it.
   One rAF-throttled scroll listener drives every element. */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if (!items.length) return;

  var ticking = false;

  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;   // offscreen: skip
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      // 0 when the element is centred, +/- as it moves toward either edge
      var centred = (r.top + r.height / 2) - vh / 2;
      el.style.transform = 'translate3d(0,' + (-centred * speed).toFixed(2) + 'px,0)';
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();
})();

/* ── Portfolio image lightbox ──
   Click any photo in the portfolio grid to view it full-screen against
   a near-black backdrop, on-brand with the rest of the dark cinematic
   theme — rather than only ever seeing work at thumbnail size. */
(function() {
  var overlay = document.getElementById('lightboxOverlay');
  var imgEl   = document.getElementById('lightboxImg');
  var capEl   = document.getElementById('lightboxCaption');
  var closeBtn = document.getElementById('lightboxClose');
  if (!overlay || !imgEl) return;

  function openLightbox(src, alt, caption) {
    imgEl.src = src;
    imgEl.alt = alt || '';
    if (capEl) capEl.textContent = caption || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function() { imgEl.src = ''; }, 300); /* clear after the fade so nothing flashes */
  }

  document.querySelectorAll('.portfolio-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var img = item.querySelector('.portfolio-item-bg img');
      if (!img) return; /* IG embed tiles have no local image — nothing to enlarge */
      var titleEl = item.querySelector('.portfolio-item-title');
      var catEl   = item.querySelector('.portfolio-item-cat');
      var caption = [catEl ? catEl.textContent : '', titleEl ? titleEl.textContent : ''].filter(Boolean).join(' · ');
      openLightbox(img.src, img.alt, caption);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox();
  });
})();

/* ── Scroll progress bar ── */
(function() {
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  var ticking = false;
  function update() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* ── Hero cursor spotlight — fine-pointer, motion-OK devices only ── */
(function() {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var glow = document.createElement('div');
  glow.className = 'hero-spotlight';
  hero.appendChild(glow);

  var ticking = false, sx = 50, sy = 15;
  hero.addEventListener('mousemove', function(e) {
    var r = hero.getBoundingClientRect();
    sx = ((e.clientX - r.left) / r.width) * 100;
    sy = ((e.clientY - r.top) / r.height) * 100;
    if (!ticking) {
      requestAnimationFrame(function() {
        hero.style.setProperty('--sx', sx + '%');
        hero.style.setProperty('--sy', sy + '%');
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  hero.addEventListener('mouseenter', function() { hero.classList.add('spotlight-on'); });
  hero.addEventListener('mouseleave', function() { hero.classList.remove('spotlight-on'); });
})();

/* ── Magnetic buttons — subtle cursor-pull on primary/ghost CTAs ── */
(function() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAX = 7;
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(function(el) {
    el.addEventListener('mousemove', function(e) {
      var r = el.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width - 0.5) * MAX;
      var y = ((e.clientY - r.top) / r.height - 0.5) * MAX;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - 1).toFixed(1) + 'px)';
    });
    el.addEventListener('mouseleave', function() { el.style.transform = ''; });
  });
})();
/* ══════════════════════════════════════
   CINEMATIC HERO · INDEX PREVIEW · CURSOR
══════════════════════════════════════ */

/* ── Hero: curtain-wipe frames, image-cut headline, scroll exit ── */
(function () {
  var hero = document.querySelector('.hero-cine');
  if (!hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ── Rotating tagline ──
     One at random per visit. Set synchronously here, before the entrance
     class is armed, so the swap never flashes. The markup ships with a
     real line already in it, so no-JS visitors still get a headline. */
  (function () {
    var TAGLINES = [
      ['I build',        'the whole thing.'],
      ['Idea to',        'launch.'],
      ['I don’t fit',    'one box.'],
      ['Concept to',     'company.'],
      ['I design,',      'develop, ship.'],
      ['From zero',      'to product.'],
      ['I turn ideas',   'into products.'],
      ['Strategy to',    'shipping.'],
      ['Code is',        'the medium.'],
      ['I build',        'businesses.'],
      ['Imagine.',       'Build. Grow.'],
      ['Anything you',   'can imagine.']
    ];
    var lines = hero.querySelectorAll('.cine-title .cl-in');
    if (lines.length < 2) return;
    var pick = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
    lines[0].textContent = pick[0];
    /* second line keeps its <em> so the italic accent styling survives */
    var em = lines[1].querySelector('em');
    if (em) em.textContent = pick[1]; else lines[1].textContent = pick[1];
  })();

  var plates = [].slice.call(hero.querySelectorAll('.cine-plate'));
  var caps   = [].slice.call(hero.querySelectorAll('.fc-cap'));
  var ticks  = [].slice.call(hero.querySelectorAll('.fc-tick'));
  var DWELL  = 6000;
  var i = 0, timer = null;

  /* Frames fetch their image only when readied — the current one plus the
     next, so the following frame is warm before its turn instead of all
     four landing on first paint.
     The paths live in data-* rather than a CSS custom property: Chrome
     resolves url() inside a custom property eagerly, so declaring
     --p:url(...) downloaded every frame even when no rule used it. */
  function ready(n) {
    var p = plates[(n + plates.length) % plates.length];
    if (!p || p.classList.contains('is-ready')) return;
    var small = window.matchMedia('(max-width: 900px)').matches;
    var src = (small && p.getAttribute('data-p-sm')) || p.getAttribute('data-p');
    if (!src) return;
    var img = p.querySelector('.cp-img');
    if (img) img.style.backgroundImage = 'url("' + src + '")';
    p.classList.add('is-ready');
  }
  ready(0);
  ready(1);

  function show(n) {
    var next = (n + plates.length) % plates.length;
    if (next === i && plates[i].classList.contains('is-on')) return;
    ready(next);
    ready(next + 1);
    var prev = i;
    i = next;

    plates.forEach(function (p, k) {
      p.classList.toggle('is-on', k === i);
      /* the outgoing frame stays painted beneath the incoming curtain
         so the wipe never reveals bare background */
      p.classList.toggle('is-out', k === prev && k !== i);
    });

    /* Run the curtain as a one-shot. A paused animation renders its
       closed `from` state, so the class must not persist — the timer
       clears it even in a background tab, leaving the slats open. */
    if (!reduce) {
      var inc = plates[i];
      inc.classList.remove('wipe');
      void inc.offsetWidth;                 /* restart the animation */
      inc.classList.add('wipe');
      clearTimeout(inc._wipeT);
      inc._wipeT = setTimeout(function () { inc.classList.remove('wipe'); }, 1700);
    }
    caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
    ticks.forEach(function (t, k) {
      t.classList.remove('is-on');
      if (k === i) { void t.offsetWidth; t.classList.add('is-on'); }  /* restart fill */
    });
  }

  function start() { if (!reduce && !timer) timer = setInterval(function () { show(i + 1); }, DWELL); }
  function stop()  { clearInterval(timer); timer = null; }

  ticks.forEach(function (t) {
    t.addEventListener('click', function () {
      show(parseInt(t.getAttribute('data-i'), 10) || 0);
      stop(); start();
    });
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) start(); else stop();
    }, { threshold: 0.05 }).observe(hero);
  } else { start(); }

  /* Entrance is opt-in: only hide the copy when we can actually play it.
     rAF and transitions are frozen in a background tab, so arming it
     there would leave the headline invisible until the tab is focused. */
  function play() {
    if (hero.classList.contains('anim')) return;
    hero.classList.add('anim');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('lit'); });
    });
  }
  if (reduce) {
    /* leave the copy plainly visible */
  } else if (document.hidden) {
    document.addEventListener('visibilitychange', function onVis() {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onVis);
      play();
    });
  } else { play(); }

  /* Scroll exit — 0 at rest, 1 by the time the hero is gone. CSS reads
     --exit to lift and fade the copy. */
  if (!reduce) {
    var ticking = false;
    function frame() {
      ticking = false;
      var h = hero.offsetHeight || 1;
      var p = Math.min(Math.max(window.scrollY / h, 0), 1);
      hero.style.setProperty('--exit', p.toFixed(3));
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  }
})();

/* ── Editorial index: image preview follows the pointer ── */
(function () {
  var list = document.getElementById('ixList');
  var prev = document.getElementById('ixPreview');
  var img  = document.getElementById('ixPreviewImg');
  if (!list || !prev || !img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  /* The preview is display:none below 900px — bail before the preload
     loop so narrow devices don't fetch five full-size frames for nothing */
  if (!window.matchMedia('(min-width: 901px)').matches) return;

  var rows = [].slice.call(list.querySelectorAll('.ix-row'));
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, active = false;

  /* Preload so the first hover doesn't show an empty frame */
  rows.forEach(function (r) {
    var src = r.getAttribute('data-img');
    if (src) { var p = new Image(); p.src = src; }
  });

  function loop() {
    cx += (tx - cx) * 0.14;             /* lag behind the cursor for weight */
    cy += (ty - cy) * 0.14;
    prev.style.left = cx + 'px';
    prev.style.top  = cy + 'px';
    if (active || Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
      raf = requestAnimationFrame(loop);
    } else { raf = null; }
  }

  list.addEventListener('pointermove', function (e) {
    var r = list.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(loop);
  });

  rows.forEach(function (row) {
    row.addEventListener('pointerenter', function () {
      var src = row.getAttribute('data-img');
      /* Tech rows carry no image — the preview stays hidden for them
         rather than flashing the last creative row's photo. */
      if (!src) { active = false; prev.classList.remove('on'); return; }
      img.src = src;
      active = true;
      prev.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });

  list.addEventListener('pointerleave', function () {
    active = false;
    prev.classList.remove('on');
  });
})();

/* ── Custom cursor ── */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var dot  = document.createElement('div'); dot.className  = 'cur-dot';
  var ring = document.createElement('div'); ring.className = 'cur-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add('has-cursor');

  var mx = 0, my = 0, rx = 0, ry = 0, raf = null;

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    /* Stop once the ring has caught up — otherwise this rAF loop runs
       forever after the first pointer move, even while the page is idle. */
    if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }

  window.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  /* Ring swells over anything clickable or image-like */
  var GROW = 'a, button, .ws-item, .portfolio-item, .ix-row, input, textarea, select, [role="button"]';
  document.addEventListener('pointerover', function (e) {
    if (e.target.closest && e.target.closest(GROW)) ring.classList.add('grow');
  });
  document.addEventListener('pointerout', function (e) {
    if (e.target.closest && e.target.closest(GROW)) ring.classList.remove('grow');
  });

  /* Hide when the pointer leaves the window entirely */
  document.addEventListener('pointerleave', function () {
    dot.style.opacity = ring.style.opacity = '0';
  });
  document.addEventListener('pointerenter', function () {
    dot.style.opacity = ring.style.opacity = '1';
  });
})();

/* ── Showreel: lazy video-hero background + click-to-play lightbox ── */
(function () {
  /* 1. Ambient background loops — every video[data-src] is fetched only
        when scrolled near, muted, and skipped entirely under
        reduced-motion or Save-Data. The poster shows until (or instead
        of) the video, so nothing is ever blank. */
  var bgVids = document.querySelectorAll('video[data-src]');
  if (bgVids.length && 'IntersectionObserver' in window) {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var save = navigator.connection && navigator.connection.saveData;
    if (!reduce && !save) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            if (!v.src) v.src = v.getAttribute('data-src');
            var p = v.play(); if (p && p.catch) p.catch(function(){});
          } else if (v.src) { v.pause(); }
        });
      }, { threshold: 0.15 });
      bgVids.forEach(function (v) { io.observe(v); });
    }
  }

  /* 2. Lightbox — the compressed clip is only fetched on click. */
  var lb = document.getElementById('vlb');
  var vid = document.getElementById('vlbVideo');
  var cap = document.getElementById('vlbCap');
  var closeBtn = document.getElementById('vlbClose');
  if (!lb || !vid) return;

  function open(src, title) {
    vid.src = src;
    cap.textContent = title || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var p = vid.play(); if (p && p.catch) p.catch(function(){});
  }
  function close() {
    vid.pause();
    vid.removeAttribute('src'); vid.load();   /* free the buffer */
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.sr-card').forEach(function (c) {
    c.addEventListener('click', function () {
      open(c.getAttribute('data-video'), c.getAttribute('data-title'));
    });
  });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb.classList.contains('open')) close();
  });
})();
