import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/* Work playing inside giant letters. The children are the letters (white on
   black); `media` is whatever should show through them. The media drifts a
   little as you scroll, so the footage seems to sit behind the type. A second,
   hairline copy of the letters sits on top so the word always reads, whatever
   the picture inside it looks like. */
export default function Knockout({ media, children, className = '', drift = 7 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-drift}%`, `${drift}%`]);

  return (
    <div className={'ko ' + className} ref={ref}>
      <motion.div className="ko-media" style={reduce ? undefined : { y }} aria-hidden="true">{media}</motion.div>
      <div className="ko-mask">{children}</div>
      <div className="ko-tint" aria-hidden="true" />
      <div className="ko-edge" aria-hidden="true">{children}</div>
    </div>
  );
}
