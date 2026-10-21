import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* A label bubble that rides the pointer over anything marked data-cursor
   ("Play", "View", "Drag"). Everywhere else the normal cursor is untouched,
   and it never mounts on touch screens or for reduced-motion visitors. The
   label is re-checked when the page scrolls under a still pointer, and when a
   viewer opens, so it never lingers over the wrong thing. */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 520, damping: 42, mass: 0.5 });

  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduce) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let current = '';
    let px = -1, py = -1, ticking = false;

    const apply = (el) => {
      const t = el && el.closest ? el.closest('[data-cursor]') : null;
      const next = t ? t.getAttribute('data-cursor') : '';
      if (next !== current) { current = next; setLabel(next); }
    };
    const move = (e) => { px = e.clientX; py = e.clientY; x.set(px); y.set(py); apply(e.target); };
    const recheck = () => {
      if (ticking || px < 0) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; apply(document.elementFromPoint(px, py)); });
    };
    const reset = () => { current = ''; setLabel(''); };

    addEventListener('pointermove', move, { passive: true });
    addEventListener('scroll', recheck, { passive: true });
    addEventListener('vy:cursor-reset', reset);
    document.addEventListener('pointerleave', reset);
    return () => {
      removeEventListener('pointermove', move);
      removeEventListener('scroll', recheck);
      removeEventListener('vy:cursor-reset', reset);
      document.removeEventListener('pointerleave', reset);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  return (
    <motion.div className="cursor" style={{ x: sx, y: sy }} aria-hidden="true">
      <span className={'cursor-bubble' + (label ? ' on' : '')}>{label}</span>
    </motion.div>
  );
}

