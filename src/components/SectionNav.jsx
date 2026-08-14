import { useEffect, useState } from 'react';

const DARK_SECTIONS = new Set(['hero', 'tech', 'contact']);

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'tech', label: 'Stack' },
  { id: 'web', label: 'Work' },
  { id: 'brands', label: 'Brands' },
  { id: 'services', label: 'Services' },
  { id: 'journal', label: 'Journal' },
  { id: 'motion', label: 'Films' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
];

/* A fixed right-edge dot rail so any section is one click away instead
   of a long scroll — the active dot tracks whichever section sits in
   the middle band of the viewport. */
export default function SectionNav() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className={'section-nav' + (DARK_SECTIONS.has(active) ? ' on-dark' : '')} aria-label="Jump to section">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''} aria-current={active === s.id ? 'true' : undefined}>
          <span className="section-nav-dot"></span>
          <span className="section-nav-label">{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
