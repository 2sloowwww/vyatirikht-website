import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/* Counts up to a value like "16543", "126" or "2+" the first time it scrolls
   into view. The finished number holds the space (invisibly) so nothing
   shifts while it counts, and it is always what a screen reader hears. */
export default function CountUp({ value, duration = 2, commas = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const match = String(value).match(/^(\d+)(.*)$/);
  const end = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';
  const fmt = (n) => (commas ? n.toLocaleString('en-IN') : String(n));
  const [n, setN] = useState(reduce ? end : 0);

  useEffect(() => {
    if (!inView || reduce || !match) return;
    const controls = animate(0, end, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, end, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref} className="cu">
      <span className="cu-ghost" aria-hidden="true">{fmt(end)}{suffix}</span>
      <span className="cu-live" aria-hidden="true">{fmt(n)}{suffix}</span>
      <span className="sr-only">{fmt(end)}{suffix}</span>
    </span>
  );
}
