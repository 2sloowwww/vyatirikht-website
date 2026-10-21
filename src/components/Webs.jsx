import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { OWN_STORE, WEB_WORK } from '../data.js';

const erp = WEB_WORK.find((w) => w.kind === 'Client work') || WEB_WORK[0];
const concepts = WEB_WORK.filter((w) => w !== erp);

const BUILDS = [
  { key: erp.key, name: erp.name, tag: erp.tag, kind: 'Client work · private', shot: erp.shot, text: erp.solution, note: 'Behind a login — no public link.' },
  { key: OWN_STORE.key, name: OWN_STORE.name, tag: OWN_STORE.tag, kind: 'Our own store', shot: OWN_STORE.shot, text: OWN_STORE.intro, href: OWN_STORE.href, domain: OWN_STORE.domain, own: true },
  ...concepts.map((c) => ({ key: c.key, name: c.name, tag: c.tag, kind: 'Concept build', shot: c.shot, text: c.result, href: c.href }))
];

const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

/* The websites, as one long horizontal pass: the page pins while you scroll
   and the builds slide by, each as large as the screen allows. On touch and
   small screens it is an ordinary swipe. */
export default function Webs() {
  const ref = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const measure = () => {
      const can = matchMedia('(min-width: 901px) and (hover: hover)').matches;
      setPinned(can);
      if (can && track.current) setDist(Math.max(0, track.current.scrollWidth - innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    addEventListener('resize', measure);
    return () => { ro.disconnect(); removeEventListener('resize', measure); };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  return (
    <div className="webs" data-bleed ref={ref} style={pinned ? { height: `calc(100vh + ${dist}px)` } : undefined}>
      <div className="webs-sticky">
        <div className="wrap webs-head">
          <p className="mono">Websites &amp; software — {BUILDS.length} builds</p>
          <p className="mono webs-hint">{pinned ? 'Keep scrolling →' : 'Swipe →'}</p>
        </div>
        <motion.div className="webs-track" ref={track} style={pinned ? { x } : undefined}>
          {BUILDS.map((b, i) => {
            const Tag = b.href ? 'a' : 'div';
            const props = b.href ? { href: b.href, target: '_blank', rel: 'noopener', 'data-cursor': 'Open' } : {};
            return (
              <figure className={'web' + (i % 2 ? ' is-low' : '')} key={b.key}>
                <Tag className="web-shot" {...props}>
                  <img src={b.shot} alt={`${b.name} — ${b.tag}`} loading="lazy" decoding="async" width="1280" height="800" />
                </Tag>
                <figcaption>
                  <span className={'mono web-kind' + (b.own ? ' own' : '')}>{b.kind}</span>
                  <b className="title web-name">{b.name}</b>
                  <span className="web-tag mono">{b.tag}</span>
                  <p>{b.text}</p>
                  {b.href
                    ? <a className="tlink" href={b.href} target="_blank" rel="noopener">{b.domain ? `Visit ${b.domain}` : 'View live'} {ARROW}</a>
                    : <span className="mono web-note">{b.note}</span>}
                </figcaption>
              </figure>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
