import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Theater from './Theater.jsx';
import { FILMS, FILM_GROUPS } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');
const mmss = (d) => `0:${pad(d)}`;
const split = (t) => { const [a, ...r] = t.split(' — '); return { name: a, sub: r.join(' — ') }; };

/* A hovering preview that follows the pointer and plays the film under it. */
function Preview({ film, x, y }) {
  const vid = useRef(null);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (!film) { v.pause(); return; }
    v.src = film.video; v.muted = true;
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }, [film]);
  const portrait = film && film.ar < 1;
  return (
    <motion.div className={'fprev' + (film ? ' is-on' : '') + (portrait ? ' is-tall' : '')} style={{ x, y }} aria-hidden="true">
      <video ref={vid} muted loop playsInline preload="none" poster={film ? film.poster : undefined} />
      <span className="fprev-hint mono">Click to watch{film && film.sound ? ' · with sound' : ''}</span>
    </motion.div>
  );
}

/* Every film as one line of giant type. Rest the pointer on a title and the
   film plays beside it; click and it fills the screen, with sound. */
export default function FilmIndex() {
  const [cat, setCat] = useState('all');
  const [hover, setHover] = useState(-1);
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const [armed, setArmed] = useState(false);

  const list = useMemo(() => (cat === 'all' ? FILMS : FILMS.filter((f) => f.cat === cat)), [cat]);
  const items = useMemo(() => list.map((f) => ({
    kind: 'video', src: f.video, poster: f.poster, title: split(f.title).name, sub: `${f.disc} · ${mmss(f.d)}${f.sound ? '' : ' · no sound'}`, sound: f.sound
  })), [list]);

  const fine = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  const move = (e) => {
    const w = e.clientY && list[hover] && list[hover].ar < 1 ? 250 : 440;
    x.set(e.clientX > innerWidth * 0.55 ? e.clientX - w - 40 : e.clientX + 40);
    y.set(e.clientY - 150);
  };
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="findex">
      <div className="wrap">
        <div className="filters" role="tablist" aria-label="Film categories">
          <button type="button" role="tab" aria-selected={cat === 'all'} className={cat === 'all' ? 'on' : ''} onClick={() => { setCat('all'); setHover(-1); }}>All<sup>{FILMS.length}</sup></button>
          {FILM_GROUPS.map((g) => (
            <button type="button" role="tab" aria-selected={cat === g.key} key={g.key} className={cat === g.key ? 'on' : ''} onClick={() => { setCat(g.key); setHover(-1); }}>
              {g.label}<sup>{FILMS.filter((f) => f.cat === g.key).length}</sup>
            </button>
          ))}
        </div>

        <ol className={'findex-list' + (hover >= 0 ? ' is-hover' : '')} key={cat}
            onPointerMove={fine ? move : undefined} onPointerEnter={() => setArmed(true)} onPointerLeave={() => setHover(-1)}>
          {list.map((f, i) => {
            const { name } = split(f.title);
            return (
              <li key={f.key}>
                <button type="button" className={'frow' + (hover === i ? ' on' : '')}
                        onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(-1)}
                        onClick={() => { setAt(i); setOpen(true); }} aria-label={`Play: ${f.title}`}>
                  <span className="frow-n mono">{pad(i + 1)}</span>
                  <span className="frow-t title">{name}</span>
                  <span className="frow-m mono">{f.disc}<br />{mmss(f.d)}</span>
                  <img className="frow-thumb" src={f.poster} alt="" loading="lazy" decoding="async" />
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {fine && armed && <Preview film={hover >= 0 ? list[hover] : null} x={sx} y={sy} />}
      <Theater open={open} items={items} index={Math.min(at, items.length - 1)} onClose={close} onIndex={setAt} />
    </div>
  );
}

