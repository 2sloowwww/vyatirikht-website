import { useEffect, useState } from 'react';
import { WHATSAPP_HREF } from '../data.js';
import { lockScroll } from '../lib/smooth.js';

const LINKS = [
  { href: '#shoot', label: 'Shoot' },
  { href: '#edit', label: 'Edit' },
  { href: '#build', label: 'Build' },
  { href: '#grow', label: 'Grow' },
  { href: '#journal', label: 'Journal' },
  { href: '#contact', label: 'Contact' }
];

const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

/* Only type: the logo, a few words, one link. It slides away on the way down,
   returns on the way up, and flips to dark ink while it is over the light block. */
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [light, setLight] = useState(false);

  useEffect(() => {
    let last = scrollY;
    const sync = () => {
      const y = scrollY;
      if (Math.abs(y - last) > 6) { setHidden(y > 240 && y > last); last = y; }
    };
    addEventListener('scroll', sync, { passive: true });
    return () => removeEventListener('scroll', sync);
  }, []);

  // Which chapter is mid-screen (for the highlighted word), and whether the
  // strip under the nav is a light block (so the type can flip to ink).
  useEffect(() => {
    const els = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) seen.add(e.target.id); else seen.delete(e.target.id); });
      const last = [...LINKS].reverse().find((l) => seen.has(l.href.slice(1)));
      setActive(last ? last.href : '');
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));

    const tone = [...document.querySelectorAll('[data-tone="light"]')];
    const ioTone = new IntersectionObserver((entries) => {
      entries.forEach((e) => { e.target.__under = e.isIntersecting; });
      setLight(tone.some((t) => t.__under));
    }, { rootMargin: '0px 0px -94% 0px' });
    tone.forEach((el) => ioTone.observe(el));
    return () => { io.disconnect(); ioTone.disconnect(); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    lockScroll(open);
    const onResize = () => { if (innerWidth > 980) setOpen(false); };
    addEventListener('resize', onResize);
    return () => { document.body.style.overflow = ''; lockScroll(false); removeEventListener('resize', onResize); };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={'nav' + (hidden ? ' is-hidden' : '') + (open ? ' is-open' : '') + (light ? ' is-light' : '')}>
      <a className="nav-brand" href="#top" aria-label="Vyatirikht — back to top" onClick={close}>
        <img src="assets/images/logo/Logo_transparent.png" alt="" width="257" height="403" />
        <span>Vyatirikht</span>
      </a>

      <nav className="nav-links" aria-label="Primary" onClick={(e) => { if (e.target.closest('a')) close(); }}>
        {LINKS.map((l) => <a key={l.href} href={l.href} className={active === l.href ? 'is-active' : undefined}>{l.label}</a>)}
        <a className="nav-cta-mobile" href={WHATSAPP_HREF} target="_blank" rel="noopener">Start a project →</a>
      </nav>

      <a className="obtn gold nav-cta" href={WHATSAPP_HREF} target="_blank" rel="noopener">Start a project {ARROW}</a>
      <a className="tlink gold nav-quick" href={WHATSAPP_HREF} target="_blank" rel="noopener" aria-label="Start a project on WhatsApp">WhatsApp {ARROW}</a>

      <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Menu'}
      </button>
    </header>
  );
}

