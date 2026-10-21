import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { BRANDS, OWN_STORE } from '../data.js';

const STAR = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.7 7 17 11.3 24 12C17 12.7 12.7 17 12 24C11.3 17 7 12.7 0 12C7 11.3 11.3 7 12 0Z" /></svg>
);

/* Credibility band straight under the hero: the brands we've worked for
   scroll past — faster when the page is scrolled — and the store we run
   ourselves sits beside the label, clearly marked as ours. */
export default function Brands() {
  const reduce = useReducedMotion();
  const track = useRef(null);
  const x = useMotionValue(0);
  const dir = useRef(1);

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });

  useAnimationFrame((_, delta) => {
    const el = track.current;
    if (!el || reduce) return;
    const half = el.scrollWidth / 2;
    const b = boost.get();
    if (b < -0.05) dir.current = -1; else if (b > 0.05) dir.current = 1;
    const step = dir.current * 70 * (delta / 1000) * (1 + Math.abs(b));
    let next = x.get() - step;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  // Three copies per half so even very wide screens never run out of names.
  const set = [0, 1, 2].flatMap((c) => BRANDS.map((b) => ({ ...b, id: `${c}-${b.name}` })));

  return (
    <section className="band" aria-label="Brands we have worked with and our own store">
      <div className="wrap band-top">
        <p className="mono">Brands we've worked with</p>
        <a className="band-own" href={OWN_STORE.href} target="_blank" rel="noopener" data-cursor="Visit">
          <span className="own-tag">Our own store</span>
          <span><b>{OWN_STORE.name}</b> — {OWN_STORE.line} · {OWN_STORE.domain}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="band-marquee" aria-hidden="true">
        <motion.div className="band-track" ref={track} style={{ x }}>
          {[0, 1].map((copy) => (
            <div className="band-set" key={copy} style={{ display: 'flex' }}>
              {set.map((b) => <span className="band-item" key={b.id}>{b.name}{STAR}</span>)}
            </div>
          ))}
        </motion.div>
      </div>
      <ul className="sr-only">{BRANDS.map((b) => <li key={b.name}>{b.name}</li>)}</ul>
    </section>
  );
}
