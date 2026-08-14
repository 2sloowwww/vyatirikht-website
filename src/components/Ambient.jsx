import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from 'framer-motion';

/* Two fixed, pointer-events-none overlays that make the page feel less
   flat: a soft film-grain texture (constant), and a low-opacity radial
   that trails the cursor (spring-smoothed, so it drifts rather than
   snaps). Both sit above content but below nav/lightboxes, and both
   disable themselves under prefers-reduced-motion — the grain because
   it's cosmetic, the spotlight because it's motion. */
export default function Ambient() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 90, damping: 22, mass: 0.5 });
  const bg = useMotionTemplate`radial-gradient(480px circle at ${sx}px ${sy}px, rgba(20,21,26,0.05), transparent 70%)`;

  useEffect(() => {
    if (reduce) return;
    const move = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, [reduce, mx, my]);

  return (
    <>
      <div className="grain-overlay" aria-hidden="true"></div>
      {!reduce && <motion.div className="cursor-spotlight" aria-hidden="true" style={{ background: bg }} />}
    </>
  );
}
