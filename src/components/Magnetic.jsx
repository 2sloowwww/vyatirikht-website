import { motion } from 'framer-motion';
import useMagnetic from '../useMagnetic.js';

/* A link/button that pulls gently toward the cursor as it approaches —
   the "stick to the cursor" touch, reused everywhere a click matters
   (CTAs, nav). No-ops under prefers-reduced-motion (see useMagnetic). */
export default function Magnetic({ as = 'a', className, children, strength = 0.25, ...rest }) {
  const mag = useMagnetic(strength);
  const Comp = motion[as] || motion.a;
  return (
    <Comp className={className} style={mag.style} onPointerMove={mag.onPointerMove} onPointerLeave={mag.onPointerLeave} {...rest}>
      {children}
    </Comp>
  );
}
