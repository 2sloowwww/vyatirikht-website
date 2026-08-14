import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

/* Fades a block up into place the first time it enters the viewport.
   Thin wrapper around motion + whileInView so every section gets the
   same entrance without repeating the viewport/variant plumbing. */
export function Reveal({ children, className, delay = 0, as = 'div', style, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      style={style}
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

/* Same idea, but for grids — the container just orchestrates timing,
   RevealItem below (or any motion child using `item`) does the move. */
export function RevealGroup({ children, className, as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ children, className, as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp className={className} variants={item} {...rest}>
      {children}
    </Comp>
  );
}
