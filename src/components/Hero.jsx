import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { COUNTS, REEL, WHATSAPP_HREF } from '../data.js';
import Magnetic from './Magnetic.jsx';
import { timecode } from './Hud.jsx';

const EASE = [0.16, 1, 0.3, 1];
const rise = { hidden: { y: '118%' }, show: { y: '0%', transition: { duration: 1.15, ease: EASE } } };
const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } } };

const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

/* The showreel: a single pre-cut file behind the headline. The poster paints
   first; the video fades in once it is actually playing. Reduced-motion and
   data-saver visitors keep the poster, and the video stops whenever the hero
   is off screen. */
function Reel({ onCue, tcRef }) {
  const wrap = useRef(null);
  const vid = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || {};
    const thrifty = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    if (reduce || thrifty) return;

    v.muted = true;
    v.src = innerWidth < 760 ? REEL.small : REEL.src;
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const onPlaying = () => setLive(true);
    v.addEventListener('playing', onPlaying);
    play();

    // The readouts follow the video's own clock.
    let raf = 0;
    let last = -1;
    const tick = () => {
      const t = v.currentTime;
      if (tcRef.current) tcRef.current.textContent = timecode(t);
      let i = REEL.cues.length - 1;
      while (i > 0 && REEL.cues[i].at > t) i--;
      if (i !== last) { last = i; onCue(i); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // No point decoding frames nobody can see.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); else v.pause(); }, { threshold: 0.04 });
    io.observe(wrap.current);
    const onVis = () => { if (document.hidden) v.pause(); else play(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      v.removeEventListener('playing', onPlaying);
      v.pause();
    };
  }, [onCue, tcRef]);

  return (
    <div className="reel" ref={wrap} aria-hidden="true">
      <img className="reel-poster" src={REEL.poster} alt="" fetchpriority="high" decoding="async" />
      <video ref={vid} className={live ? 'on' : ''} muted loop playsInline preload="auto" />
      <div className="reel-scrim" />
      <div className="reel-grain" />
    </div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const tc = useRef(null);
  const [cue, setCue] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  const lines = [
    { key: 'a', node: 'We shoot.' },
    { key: 'b', node: 'We edit.' },
    { key: 'c', node: 'We build.' },
    { key: 'd', node: <>We grow <em>your brand.</em></> }
  ];
  const c = REEL.cues[cue];

  return (
    <section className="hero" id="top" ref={ref} data-scene="01" data-scene-name="Open">
      <Reel onCue={setCue} tcRef={tc} />

      <div className="wrap hero-inner">
        <motion.h1 className="hero-title giant" initial="hidden" animate="show" style={reduce ? undefined : { y: copyY }}
                   variants={{ hidden: {}, show: { transition: { delayChildren: 0.2, staggerChildren: 0.11 } } }}
                   aria-label="We shoot. We edit. We build. We grow your brand.">
          {lines.map((l) => (
            <span className="hl" aria-hidden="true" key={l.key}>
              <span className="w"><motion.span className="w-in" variants={rise}>{l.node}</motion.span></span>
            </span>
          ))}
        </motion.h1>

        <motion.div className="hero-side" initial="hidden" animate="show"
                    variants={{ hidden: {}, show: { transition: { delayChildren: 0.75, staggerChildren: 0.1 } } }}>
          <motion.p className="hero-sub" variants={fade}>
            Photography, film, 3D, websites and digital marketing under one roof — a Pune studio that takes your brand from idea to audience, then grows its reach organically.
          </motion.p>
          <motion.div className="hero-cta" variants={fade}>
            <Magnetic>
              <a className="obtn gold" href={WHATSAPP_HREF} target="_blank" rel="noopener">Start a project {ARROW}</a>
            </Magnetic>
            <a className="tlink big plain" href="#shoot">See the work ↓</a>
          </motion.div>
          <motion.p className="hero-note" variants={fade}>Projects from ₹1999* · contact for details</motion.p>
        </motion.div>
      </div>

      <motion.div className="hero-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}>
        <div className="wrap">
          <p className="counts">
            <span><b>{COUNTS.films}</b>Films</span>
            <span><b>{COUNTS.renders}</b>3D renders</span>
            <span><b>{COUNTS.photos}</b>Photographs</span>
            <span><b>{COUNTS.builds}</b>Web builds</span>
          </p>
          <p className="now" aria-hidden="true">
            <i className="now-dot" /><span className="now-tc" ref={tc}>00:00:00:00</span>
            <span><b>{String(c.n).padStart(2, '0')}</b> / {REEL.count} · {c.cat} — {c.title}</span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

