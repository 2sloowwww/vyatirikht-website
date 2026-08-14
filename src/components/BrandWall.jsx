import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import GlowTile from './Tile.jsx';
import { BRANDS } from '../data.js';

export default function BrandWall() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-22, 22]);

  return (
    <section id="brands" ref={ref}>
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Brands</p>
            <h2 className="h2">Worked <em>with.</em></h2>
            <p className="lede">Product shoots, brand films and campaigns — automotive, jewellery, beverage, motorsport.</p>
          </RevealItem>
          <motion.div className="brand-grid" style={reduce ? undefined : { y }}>
            {BRANDS.map((b, i) => (
              <GlowTile className="brand-tile" key={b.name} transition={{ delay: i * 0.03 }}>
                <b>{b.name}</b>
                <span>{b.kind}</span>
              </GlowTile>
            ))}
          </motion.div>
        </RevealGroup>
      </div>
    </section>
  );
}
