import { motion } from 'framer-motion';
import { RevealItem } from './Reveal.jsx';
import useMagnetic from '../useMagnetic.js';

/* A grid tile that (a) reveals on scroll like any RevealItem, (b) gets
   a small cursor-tracked glow (the --mx/--my custom properties, read
   by .wall-tile::before / .brand-tile::before in home.css), and (c)
   pulls gently toward the cursor. The glow and the magnetic pull are
   two different nodes on purpose — the outer one already owns the
   reveal's translateY, and framer-motion lets an externally supplied
   motion value take over a transform axis entirely, which would
   silently cancel the reveal slide if both lived on the same node. */
export default function GlowTile({ className, children, transition }) {
  const mag = useMagnetic(0.12);

  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    if (mag.onPointerMove) mag.onPointerMove(e);
  };

  return (
    <RevealItem className={className} transition={transition} onPointerMove={onPointerMove} onPointerLeave={mag.onPointerLeave}>
      <motion.div className="tile-inner" style={mag.style}>
        {children}
      </motion.div>
    </RevealItem>
  );
}
