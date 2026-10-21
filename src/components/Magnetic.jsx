import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* Nudges its child toward the pointer while it hovers nearby. Fine pointers
   only; a no-op everywhere else, so it is safe to wrap any CTA. */
export default function Magnetic({ children, strength = 0.28, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const fine = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  if (!fine) return <span className={className} style={{ display: 'inline-flex' }}>{children}</span>;
  return (
    <motion.span ref={ref} className={className} style={{ display: 'inline-flex', x: sx, y: sy }}
                 onPointerMove={move} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}
