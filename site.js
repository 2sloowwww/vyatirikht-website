/* ══════════════════════════════════════════════════════
   VYATIRIKHT — site.js
   Everything the public site needs, and nothing else.
   Every block is null-guarded so it is safe on any page.
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var thrifty = !!(navigator.connection && navigator.connection.saveData);

  /* ── Nav: scrolled state + mobile menu ── */
  var nav = document.getElementById('site-nav');
  if (nav) {
    var syncNav = function () { nav.classList.toggle('scrolled', scrollY > 24); };
    addEventListener('scroll', syncNav, { passive: true });
    syncNav();

    var burger = document.getElementById('navBurger');
    var links = document.getElementById('navLinks');
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          links.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ── Scroll reveal ── */
  var revealed = document.querySelectorAll('.reveal');
  if (revealed.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealed.forEach(function (el) { el.classList.add('in'); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
      revealed.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ── Hero ── */
  var hero = document.querySelector('.hero');
  if (hero) {
    /* The entrance is opt-in: only hide the copy when we can actually
       play it. rAF and transitions are frozen in a background tab, so
       arming it there would leave the headline invisible until focus. */
    if (!reduce) {
      var play = function () {
        if (hero.classList.contains('anim')) return;
        hero.classList.add('anim');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { hero.classList.add('lit'); });
        });
      };
      if (document.hidden) {
        document.addEventListener('visibilitychange', function once() {
          if (document.hidden) return;
          document.removeEventListener('visibilitychange', once);
          play();
        });
      } else { play(); }

      /* Scroll exit: 0 at rest, 1 by the time the hero has gone. */
      var ticking = false;
      var exit = function () {
        ticking = false;
        var h = hero.offsetHeight || 1;
        hero.style.setProperty('--exit', Math.min(scrollY / h, 1).toFixed(3));
      };
      addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(exit); }
      }, { passive: true });
      exit();
    }

    /* Background clip: fetched only when it can be seen, and skipped
       under reduced-motion or Save-Data. The poster carries the frame
       either way, so nothing is ever blank. */
    var bg = hero.querySelector('video[data-src]');
    if (bg && !reduce && !thrifty && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            if (!v.src) v.src = v.getAttribute('data-src');
            var p = v.play(); if (p && p.catch) p.catch(function () {});
          } else if (v.src) { v.pause(); }
        });
      }, { threshold: 0.1 }).observe(bg);
    }
  }

  /* ── Shared lightbox plumbing ── */
  function lightbox(el, onClose) {
    if (!el) return null;
    var api = {
      open: function () {
        el.classList.add('open');
        document.body.style.overflow = 'hidden';
      },
      close: function () {
        el.classList.remove('open');
        document.body.style.overflow = '';
        if (onClose) onClose();
      },
      isOpen: function () { return el.classList.contains('open'); }
    };
    el.addEventListener('click', function (e) { if (e.target === el) api.close(); });
    return api;
  }

  /* ── Stills: full-screen viewer with prev/next ── */
  var stills = [].slice.call(document.querySelectorAll('.still'));
  var imgEl = document.getElementById('imgLbImg');
  var capEl = document.getElementById('imgLbCap');
  var imgLb = lightbox(document.getElementById('imgLb'), function () {
    /* Drop the source after the fade so the next open never flashes
       the previous photograph. */
    setTimeout(function () { if (!imgLb.isOpen()) imgEl.removeAttribute('src'); }, 400);
  });

  if (stills.length && imgLb && imgEl) {
    var at = 0;
    var show = function (i) {
      at = (i + stills.length) % stills.length;
      var s = stills[at];
      imgEl.src = s.getAttribute('data-full');
      imgEl.alt = s.querySelector('img').alt || '';
      capEl.textContent = (s.getAttribute('data-cap') || '') +
                          '  ·  ' + (at + 1) + ' / ' + stills.length;
      /* Warm the neighbours so arrowing through feels instant. */
      [at + 1, at - 1].forEach(function (n) {
        var next = stills[(n + stills.length) % stills.length];
        var pre = new Image();
        pre.src = next.getAttribute('data-full');
      });
    };

    stills.forEach(function (s, i) {
      s.addEventListener('click', function () { show(i); imgLb.open(); });
    });
    document.getElementById('imgClose').addEventListener('click', imgLb.close);
    document.getElementById('imgPrev').addEventListener('click', function () { show(at - 1); });
    document.getElementById('imgNext').addEventListener('click', function () { show(at + 1); });

    addEventListener('keydown', function (e) {
      if (!imgLb.isOpen()) return;
      if (e.key === 'Escape')     imgLb.close();
      if (e.key === 'ArrowRight') show(at + 1);
      if (e.key === 'ArrowLeft')  show(at - 1);
    });
  }

  /* ── Films: hover preview, click to play ── */
  var vlbVid = document.getElementById('vlbVideo');
  var vlbCap = document.getElementById('vlbCap');
  var vlb = lightbox(document.getElementById('vlb'), function () {
    vlbVid.pause();
    vlbVid.removeAttribute('src');
    vlbVid.load();                       /* free the buffer */
  });

  if (vlb && vlbVid) {
    document.querySelectorAll('.film').forEach(function (card) {
      card.addEventListener('click', function () {
        vlbVid.src = card.getAttribute('data-video');
        vlbCap.textContent = card.getAttribute('data-title') || '';
        vlb.open();
        var p = vlbVid.play(); if (p && p.catch) p.catch(function () {});
      });

      /* A muted preview plays under the pointer. Built on first hover
         rather than up front, so six clips are never fetched for a
         visitor who scrolls straight past. Desktop only — on touch
         there is no hover, and the data is not free. */
      if (!fine || reduce || thrifty) return;
      var prev = null, warm = null;
      card.addEventListener('pointerenter', function () {
        clearTimeout(warm);
        /* Short delay so sweeping the cursor across the grid does not
           kick off every clip in turn. */
        warm = setTimeout(function () {
          if (!prev) {
            prev = document.createElement('video');
            prev.muted = true; prev.loop = true; prev.playsInline = true;
            prev.setAttribute('muted', ''); prev.setAttribute('playsinline', '');
            prev.preload = 'none';
            prev.src = card.getAttribute('data-video');
            card.insertBefore(prev, card.querySelector('b'));
          }
          var p = prev.play();
          if (p && p.then) p.then(function () { prev.classList.add('on'); }).catch(function () {});
          else prev.classList.add('on');
        }, 140);
      });
      card.addEventListener('pointerleave', function () {
        clearTimeout(warm);
        if (!prev) return;
        prev.classList.remove('on');
        prev.pause();
      });
    });
    document.getElementById('vlbClose').addEventListener('click', vlb.close);
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && vlb.isOpen()) vlb.close();
    });
  }

  /* ── Enquiry form ──
     Stored in Supabase. Row-level security lets visitors insert but
     never read the table back, so nobody can harvest other people's
     contact details. If the backend is unreachable the message always
     names WhatsApp — a lost enquiry is a lost job. */
  var form = document.getElementById('enq');
  if (form) {
    var msg = document.getElementById('enq-msg');
    var send = document.getElementById('enq-send');
    var done = document.getElementById('enq-done');
    var WA = 'Please WhatsApp me instead: +91 91680 50906.';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      if (!name)  { msg.textContent = 'Your name, please.'; return; }
      if (!phone) { msg.textContent = 'A number I can reach you on.'; return; }

      var sb = window.getSupabase ? window.getSupabase() : null;
      if (!sb) { msg.textContent = 'The form is offline. ' + WA; return; }

      send.disabled = true;
      msg.textContent = 'Sending…';

      sb.from('enquiries').insert({
        name: name,
        phone: phone,
        email: form.email.value.trim() || null,
        message: form.message.value.trim() || null,
        service: 'General',
        contact_via: 'WhatsApp'
      }).then(function (res) {
        send.disabled = false;
        if (res.error) { msg.textContent = 'That did not go through. ' + WA; return; }
        form.hidden = true;
        done.hidden = false;
      }).catch(function () {
        send.disabled = false;
        msg.textContent = 'That did not go through. ' + WA;
      });
    });
  }
})();
