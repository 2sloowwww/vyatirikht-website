import { Fragment } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

const wordVariants = { hidden: { y: '155%' }, show: { y: '0%', transition: { duration: 1, ease: EASE } } };

/* Headline reveal: every word slides up out of its own mask, staggered.
   `parts` is a list of { t: 'text', em?: true } so the italic-serif accent
   words keep their styling. With `now` it plays on mount (the hero);
   otherwise it waits until it scrolls into view. */
export default function Words({ parts, as = 'h2', className, delay = 0, now = false, stagger = 0.045 }) {
  const Tag = motion[as];
  const trigger = now
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-12% 0px' } };

  return (
    <Tag className={className} {...trigger}
         variants={{ hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: stagger } } }}>
      {parts.map((p, i) => {
        const words = p.t.split(' ').filter(Boolean);
        const inner = words.map((w, j) => (
          <Fragment key={j}>
            {j > 0 && ' '}
            <span className="w"><motion.span className="w-in" variants={wordVariants}>{w}</motion.span></span>
          </Fragment>
        ));
        return (
          <Fragment key={i}>
            {i > 0 && /^\s/.test(p.t) && ' '}
            {p.em ? <em>{inner}</em> : inner}
            {/\s$/.test(p.t) && ' '}
          </Fragment>
        );
      })}
    </Tag>
  );
}
