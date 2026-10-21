import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { WHATSAPP_HREF } from '../data.js';

const FPS = 24;
const RUNTIME = 210;            // the whole page "runs" 3:30 — a nod to the edit, not a promise
const pad = (n, w = 2) => String(n).padStart(w, '0');

export function timecode(sec) {
  const s = Math.max(0, sec);
  const f = Math.floor((s % 1) * FPS);
  const t = Math.floor(s);
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}:${pad(f)}`;
}

/* The page as a recording, in bare type, along the two side edges where it
   can't sit on top of anything: a gold hairline for progress, the timecode and
   scene on the left, a WhatsApp link on the right. Wide screens only — on a
   phone the nav carries the WhatsApp link instead. */
export default function Hud() {
  const [on, setOn] = useState(false);
  const [light, setLight] = useState(false);
  const [covered, setCovered] = useState(false);
  const [scene, setScene] = useState({ id: '01', name: 'Open' });
  const tc = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  useMotionValueEvent(scrollYProgress, 'change', (p) => { if (tc.current) tc.current.textContent = timecode(p * RUNTIME); });

  useEffect(() => {
    const els = [...document.querySelectorAll('[data-scene]')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setScene({ id: e.target.dataset.scene, name: e.target.dataset.sceneName }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));

    // The labels sit at mid-height, so "light" means the paper block is behind that line.
    const tone = [...document.querySelectorAll('[data-tone="light"]')];
    const ioTone = new IntersectionObserver((entries) => {
      entries.forEach((e) => { e.target.__mid = e.isIntersecting; });
      setLight(tone.some((t) => t.__mid));
    }, { rootMargin: '-50% 0px -49% 0px' });
    tone.forEach((el) => ioTone.observe(el));

    // Over full-bleed work (the mosaic, the 3D films, the web pass) the labels step aside rather than sit on the pictures.
    const bleed = [...document.querySelectorAll('[data-bleed]')];
    const ioBleed = new IntersectionObserver((entries) => {
      entries.forEach((e) => { e.target.__under = e.isIntersecting; });
      setCovered(bleed.some((b) => b.__under));
    }, { rootMargin: '-33% 0px -33% 0px' });
    bleed.forEach((el) => ioBleed.observe(el));

    const sync = () => setOn(scrollY > innerHeight * 0.8);
    addEventListener('scroll', sync, { passive: true });
    sync();
    return () => { io.disconnect(); ioTone.disconnect(); ioBleed.disconnect(); removeEventListener('scroll', sync); };
  }, []);

  const show = on && !covered;

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className={'scene' + (show ? ' is-on' : '') + (light ? ' is-light' : '')} aria-hidden="true">
        <i className="scene-dot" />
        <span className="scene-tc" ref={tc}>00:00:00:00</span>
        <span>Scene <b>{scene.id}</b> · {scene.name}</span>
      </div>
      <a className={'wa-link tlink' + (show ? ' is-on' : '') + (light ? ' is-light' : '')} href={WHATSAPP_HREF} target="_blank" rel="noopener" tabIndex={show ? 0 : -1}>
        WhatsApp us <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
      </a>
    </>
  );
}
