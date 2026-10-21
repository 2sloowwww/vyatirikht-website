import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Theater from './Theater.jsx';
import { PHOTOS, PHOTO_CATS } from '../data.js';

const EASE = [0.16, 1, 0.3, 1];

/* Fill each row to the full width: add photographs until the row, scaled to
   fit, would be no taller than the target — then start the next row. */
function justify(items, width, target, gap) {
  const rows = [];
  let row = [];
  let sum = 0;
  for (const it of items) {
    row.push(it); sum += it.ar;
    const h = (width - gap * (row.length - 1)) / sum;
    if (h <= target) { rows.push({ items: row, h }); row = []; sum = 0; }
  }
  if (row.length) rows.push({ items: row, h: Math.min(target, (width - gap * (row.length - 1)) / sum) });
  return rows;
}

const label = (key) => (PHOTO_CATS.find((c) => c.key === key) || {}).label || '';

/* Every photograph, edge to edge, no frames — just the gaps between them.
   Filter by category; click any frame to see it full screen. */
export default function Mosaic() {
  const box = useRef(null);
  const [width, setWidth] = useState(1200);
  const [cat, setCat] = useState('all');
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => (cat === 'all' ? PHOTOS : PHOTOS.filter((p) => p.cat === cat)), [cat]);

  useLayoutEffect(() => {
    const el = box.current;
    const sync = () => setWidth(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = 4;
  const target = width < 640 ? 300 : width < 1000 ? 260 : Math.round(Math.min(400, width * 0.26));
  const rows = useMemo(() => justify(list, width, target, gap), [list, width, target]);
  const items = useMemo(() => list.map((p) => ({ kind: 'image', src: p.full, title: p.cap, sub: label(p.cat), alt: p.alt })), [list]);
  const close = useCallback(() => setOpen(false), []);

  let k = 0;
  return (
    <div className="mosaic">
      <div className="wrap">
        <div className="filters" role="tablist" aria-label="Photography categories">
          <button type="button" role="tab" aria-selected={cat === 'all'} className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>All<sup>{PHOTOS.length}</sup></button>
          {PHOTO_CATS.map((c) => (
            <button type="button" role="tab" aria-selected={cat === c.key} key={c.key} className={cat === c.key ? 'on' : ''} onClick={() => setCat(c.key)}>
              {c.label}<sup>{PHOTOS.filter((p) => p.cat === c.key).length}</sup>
            </button>
          ))}
        </div>
      </div>

      {/* The measured container never remounts; only the rows inside it do, so the width stays known. */}
      <div className="mosaic-grid" data-bleed ref={box}>
        <div className="mosaic-rows" key={cat}>
          {rows.map((r, ri) => (
            <div className="mrow" style={{ height: r.h, gap }} key={ri}>
              {r.items.map((p) => {
                const idx = k++;
                return (
                  <motion.button type="button" className="mtile" key={p.thumb} data-cursor="View" style={{ width: p.ar * r.h }}
                                 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                                 transition={{ duration: 0.8, ease: EASE, delay: (idx % 5) * 0.05 }}
                                 onClick={() => { setAt(idx); setOpen(true); }} aria-label={`View photo: ${p.cap}`}>
                    <img src={p.thumb} alt={p.alt} width="900" height={Math.round(900 / p.ar)} loading="lazy" decoding="async" />
                    <span className="mtile-cap"><b>{label(p.cat)}</b>{p.cap}</span>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Theater open={open} items={items} index={Math.min(at, items.length - 1)} onClose={close} onIndex={setAt} />
    </div>
  );
}


