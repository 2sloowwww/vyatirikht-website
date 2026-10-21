import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Theater from './Theater.jsx';
import { RENDERS, RENDER_SETS } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');
const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

/* One 3D world, full width: its shots play one after another behind the name.
   It only runs while it is on screen. */
function World({ set, shots, start, onOpen }) {
  const vid = useRef(null);
  const [i, setI] = useState(0);
  const [next, setNext] = useState(null);       // the shot being dissolved to, while the current one fades out
  const [live, setLive] = useState(false);
  const n = shots.length;
  const shot = shots[i];
  const shown = next === null ? shot : shots[next];
  const visible = useRef(false);
  const swap = useRef(0);

  // Hand over to the next shot softly: the finished shot fades out over the next
  // shot's first frame, then the next shot loads and fades in over that same frame.
  const advance = () => {
    if (n < 2 || next !== null) return;
    const to = (i + 1) % n;
    setLive(false);
    setNext(to);
    swap.current = setTimeout(() => { setI(to); setNext(null); }, 850);
  };
  useEffect(() => () => clearTimeout(swap.current), []);

  const load = useCallback(() => {
    const v = vid.current;
    if (!v) return;
    v.src = shot.preview || shot.video;
    v.muted = true;
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }, [shot]);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || {};
    if (reduce || conn.saveData) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      if (e.isIntersecting) { if (!v.src || v.src === location.href) load(); else { const p = v.play(); if (p && p.catch) p.catch(() => {}); } }
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => { io.disconnect(); v.pause(); };
  }, [load]);

  // Move to the next shot when one ends (single-shot worlds just loop).
  useEffect(() => { if (visible.current) load(); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="world" data-tone="dark" aria-label={set.title}>
      <img className="world-poster" src={shown.poster} alt="" loading="lazy" decoding="async" />
      <video ref={vid} className={'world-video' + (live ? ' on' : '')} muted playsInline preload="none" loop={n === 1}
             onPlaying={() => setLive(true)} onEnded={advance} />
      <div className="world-scrim" />
      <div className="world-text wrap">
        <p className="mono">{set.line}</p>
        <h3 className="giant world-title">{set.title}</h3>
        <div className="world-foot">
          <span className="mono world-count">{pad((next === null ? i : next) + 1)} / {pad(n)}</span>
          <button type="button" className="tlink gold" onClick={() => onOpen(start + i)} data-cursor="Watch">
            Watch {n > 1 ? `all ${n} shots` : 'the film'} {ARROW}
          </button>
        </div>
      </div>
    </section>
  );
}

/* The 3D work, five worlds, edge to edge. */
export default function Worlds() {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);

  const groups = useMemo(() => {
    let start = 0;
    return RENDER_SETS.map((s) => {
      const shots = RENDERS.filter((r) => r.set === s.key);
      const g = { set: s, shots, start };
      start += shots.length;
      return g;
    });
  }, []);

  const items = useMemo(() => RENDERS.map((r) => ({
    kind: 'video', src: r.video, poster: r.poster, title: r.title, sub: `${r.disc} · ${r.d >= 60 ? Math.floor(r.d / 60) + ':' + pad(r.d % 60) : '0:' + pad(r.d)}${r.sound ? '' : ''}`, sound: !!r.sound
  })), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="worlds" data-bleed>
      <div className="wrap worlds-head">
        <p className="mono">3D &amp; CGI — {RENDERS.length} renders in {RENDER_SETS.length} worlds</p>
      </div>
      {groups.map((g) => (
        <World key={g.set.key} set={g.set} shots={g.shots} start={g.start} onOpen={(idx) => { setAt(idx); setOpen(true); }} />
      ))}
      <Theater open={open} items={items} index={Math.min(at, items.length - 1)} onClose={close} onIndex={setAt} />
    </div>
  );
}

