import { useEffect } from 'react';
import Lenis from 'lenis';

/* Inertial scrolling for fine pointers (touch stays native). Anchor links are
   routed through Lenis so they glide too; overlays call lockScroll() so the
   page doesn't keep moving behind them. Skipped for reduced-motion visitors. */
let lenis = null;

export function lockScroll(locked) {
  if (!lenis) return;
  if (locked) lenis.stop(); else lenis.start();
}

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.4, ...opts });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Arriving from another page with #section in the URL. The page lays itself out
   from script (mosaic rows, the pinned web pass, media sizes), so the browser's
   own jump lands short; hold the target for a couple of seconds until the layout
   settles, and let go the moment the visitor scrolls. Old section names that
   still sit in links elsewhere (and in search results) are mapped to their chapter. */
const LEGACY = { services: 'shoot', work: 'shoot', web: 'build', why: 'how', about: 'how' };

export function useHashLanding() {
  useEffect(() => {
    const raw = decodeURIComponent(location.hash.slice(1));
    const id = LEGACY[raw] || raw;
    if (!id || id === 'top') return undefined;

    let live = true;
    const release = () => { live = false; };
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    events.forEach((t) => addEventListener(t, release, { passive: true, once: true }));

    const go = () => {
      const el = live && document.getElementById(id);
      if (!el) return;
      const y = Math.max(0, el.getBoundingClientRect().top + scrollY - 64);
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    };
    const timers = [0, 250, 700, 1400, 2400].map((ms) => setTimeout(go, ms));
    return () => { live = false; timers.forEach(clearTimeout); events.forEach((t) => removeEventListener(t, release)); };
  }, []);
}

export function useSmoothScroll() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    if (!reduce) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
      const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }

    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el);
      history.replaceState(null, '', id);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      if (lenis) { lenis.destroy(); lenis = null; }
    };
  }, []);
}
