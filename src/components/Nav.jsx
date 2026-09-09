import { useEffect, useState } from 'react';
import Magnetic from './Magnetic.jsx';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setScrolled(scrollY > 24);
    addEventListener('scroll', sync, { passive: true });
    sync();
    return () => removeEventListener('scroll', sync);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav id="site-nav" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-mark">
        <a href="index.html" aria-label="Vyatirikht — home">
          <img src="assets/images/logo/Logo_transparent.png" alt="" width="217" height="363" />
        </a>
        <Magnetic href="#contact" className="nav-cta" strength={0.3}>
          <span className="nav-cta-main">Projects from ₹1999*</span>
          <span className="nav-cta-sub">Contact for details</span>
        </Magnetic>
      </div>
      <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span></span><span></span><span></span>
      </button>
      <div className={'nav-links' + (open ? ' open' : '')} onClick={(e) => { if (e.target.closest('a')) close(); }}>
        <Magnetic href="#tech" strength={0.4}>Stack</Magnetic>
        <Magnetic href="#web" strength={0.4}>Work</Magnetic>
        <Magnetic href="#journal" strength={0.4}>Journal</Magnetic>
        <Magnetic href="books.html" strength={0.4}>Books</Magnetic>
        <Magnetic href="#contact" strength={0.4}>Contact</Magnetic>
      </div>
    </nav>
  );
}
