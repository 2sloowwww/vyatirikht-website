import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/* A gentle "stick to the cursor" pull for buttons and tiles. Reads the
   pointer's offset from the element's own center (via currentTarget,
   so no ref plumbing) and springs toward it; resets to 0 on leave.
   No-ops under prefers-reduced-motion. */
export default function useMagnetic(strength = 0.25) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.2 });

  if (reduce) return {};

  return {
    style: { x: springX, y: springY },
    onPointerMove: (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    },
    onPointerLeave: () => { x.set(0); y.set(0); }
  };
}
