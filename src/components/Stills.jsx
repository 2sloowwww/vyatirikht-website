import { useEffect, useState } from 'react';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import { STILLS } from '../data.js';

export default function Stills({ compact = false }) {
  const [at, setAt] = useState(null);   // index of the last/current still
  const [open, setOpen] = useState(false);
  const items = STILLS;

  const show = (i) => setAt((i + items.length) % items.length);
  // `at` is left as-is on close (not cleared) so the photo stays put
  // while the lightbox fades out, instead of vanishing mid-transition.
  const close = () => setOpen(false);
  const openAt = (i) => { show(i); setOpen(true); };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(at + 1);
      if (e.key === 'ArrowLeft') show(at - 1);
    };
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', onKey); };
  }, [open, at]);

  // Warm the neighbours so arrowing through feels instant.
  useEffect(() => {
    if (!open) return;
    [at + 1, at - 1].forEach((n) => {
      const next = items[(n + items.length) % items.length];
      const pre = new Image();
      pre.src = next.full;
    });
  }, [open, at]);

  const cur = at !== null ? items[at] : null;

  const grid = (
    <div className={compact ? 'stills stills-compact' : 'stills'}>
      {items.map((s, i) => (
        <RevealItem as="div" className="still-item" key={s.full}>
          <button className="still" type="button" onClick={() => openAt(i)}>
            <img src={s.thumb} alt={s.alt} loading="lazy" decoding="async" width={s.w} height={s.h} />
          </button>
          <span className="still-tag">{s.tag}</span>
        </RevealItem>
      ))}
    </div>
  );

  const lightbox = (
    <div className={'lb' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label="Photograph viewer"
         onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <button className="lb-btn lb-close" aria-label="Close" onClick={close}>&times;</button>
      <button className="lb-btn lb-prev" aria-label="Previous" onClick={() => show((at ?? 0) - 1)}>&#8249;</button>
      <button className="lb-btn lb-next" aria-label="Next" onClick={() => show((at ?? 0) + 1)}>&#8250;</button>
      <figure>
        {cur && <img src={cur.full} alt={cur.alt} />}
        {cur && <figcaption>{cur.cap} · {at + 1} / {items.length}</figcaption>}
      </figure>
    </div>
  );

  if (compact) {
    return (
      <div className="stills-mini">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Also shoot stills</p>
          </RevealItem>
          {grid}
        </RevealGroup>
        {lightbox}
      </div>
    );
  }

  return (
    <section id="stills">
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Photography</p>
            <h2 className="h2">Stills.</h2>
          </RevealItem>
          {grid}
        </RevealGroup>
      </div>
      {lightbox}
    </section>
  );
}
