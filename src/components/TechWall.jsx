import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import GlowTile from './Tile.jsx';
import { TECH_STACK } from '../data.js';

export default function TechWall() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [26, -26]);

  return (
    <section id="tech" className="section-dark" ref={ref}>
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Tech stack</p>
            <h2 className="h2">What I build <em>with.</em></h2>
            <p className="lede">The languages, frameworks and tools behind the sites and apps below — this one included.</p>
          </RevealItem>
          <motion.div className="wall-grid" style={reduce ? undefined : { y }}>
            {TECH_STACK.map((t, i) => (
              <GlowTile className="wall-tile" key={t.name} transition={{ delay: i * 0.02 }}>
                <i className={t.icon} aria-hidden="true"></i>
                <span>{t.name}</span>
              </GlowTile>
            ))}
          </motion.div>
        </RevealGroup>
      </div>
    </section>
  );
}
