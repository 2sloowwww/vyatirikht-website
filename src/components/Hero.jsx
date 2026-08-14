import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Magnetic from './Magnetic.jsx';
import { BRANDS, WEB_WORK } from '../data.js';

const EASE = [0.16, 1, 0.3, 1];

const line = {
  hidden: { y: '102%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: 1, ease: EASE } }
};
const fade = {
  hidden: { y: 14, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 1, ease: EASE } }
};

export default function Hero() {
  const heroRef = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  /* No photograph to give depth to any more, so the parallax carries
     the copy itself: it lifts and fades a little faster than the page
     scrolls, driven by Framer Motion scroll progress. */
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <header className="hero" id="hero" ref={heroRef}>
      <motion.div className="hero-copy" style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
        <motion.p className="eyebrow" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          Jitendra Kulkarni · Software Developer, Pune
        </motion.p>
        <h1>
          <span className="line"><motion.span variants={line} initial="hidden" animate="show" transition={{ delay: 0.08 }}>I build,</motion.span></span>
          <span className="line"><motion.span variants={line} initial="hidden" animate="show" transition={{ delay: 0.17 }}>then I <em>shoot.</em></motion.span></span>
        </h1>
        <motion.p className="h-sub" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.42 }}>
          Two years freelancing — sites and small apps built from scratch for real clients. Alongside that: product, jewellery, automotive and event photography, plus brand films.
        </motion.p>
        <motion.div className="hero-actions" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.54 }}>
          <Magnetic href="https://wa.me/919890101755" className="btn btn-solid" target="_blank" rel="noopener"><span>Start a project</span></Magnetic>
          <Magnetic href="#web" className="btn"><span>See the work</span></Magnetic>
        </motion.div>
        <motion.dl className="hero-stats" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.64 }}>
          <div><dt>2+ yrs</dt><dd>Freelancing</dd></div>
          <div><dt>{BRANDS.length}</dt><dd>Brands worked with</dd></div>
          <div><dt>{WEB_WORK.length}</dt><dd>Case studies</dd></div>
        </motion.dl>
      </motion.div>

      <motion.div className="scroll-cue" aria-hidden="true" style={reduce ? undefined : { opacity: cueOpacity }}>
        <span>Scroll</span><i></i>
      </motion.div>
    </header>
  );
}
