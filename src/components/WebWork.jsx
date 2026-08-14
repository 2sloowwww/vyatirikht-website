import { useState } from 'react';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import Magnetic from './Magnetic.jsx';
import { WEB_WORK } from '../data.js';

const FOLD_COUNT = 2;

export default function WebWork() {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = WEB_WORK.length - FOLD_COUNT;
  const visible = expanded ? WEB_WORK : WEB_WORK.slice(0, FOLD_COUNT);

  return (
    <section id="web">
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Web</p>
            <h2 className="h2">Built from <em>scratch.</em></h2>
            <p className="lede">Two years of freelance builds, plus a few self-directed ones to show range — the problem each one solves, and how.</p>
          </RevealItem>
          <div className="case-grid">
            {visible.map((w) => (
              <RevealItem as="article" className="case-card" key={w.key}>
                <div className="case-shot">
                  <img src={w.shot} alt={`${w.name} — screenshot`} loading="lazy" decoding="async" width="1280" height="800" />
                </div>
                <div className="case-body">
                  <div className="case-head">
                    <b>{w.name}</b><i>{w.tag}</i>
                  </div>
                  <span className={'case-kind' + (w.kind === 'Client work' ? ' is-client' : '')}>{w.kind}</span>
                  <dl className="case-notes">
                    <div><dt>Brief</dt><dd>{w.issue}</dd></div>
                    <div><dt>Build</dt><dd>{w.solution}</dd></div>
                    <div><dt>Result</dt><dd>{w.result}</dd></div>
                  </dl>
                  {w.href
                    ? <a className="case-link" href={w.href} target="_blank" rel="noopener">Open ↗</a>
                    : <span className="case-link is-private">Private — no public link</span>}
                </div>
              </RevealItem>
            ))}
          </div>
          {hiddenCount > 0 && (
            <div className="case-fold">
              <Magnetic as="button" type="button" className="btn" onClick={() => setExpanded((v) => !v)}>
                <span>{expanded ? 'Show less' : `View all work (+${hiddenCount})`}</span>
              </Magnetic>
            </div>
          )}
        </RevealGroup>
      </div>
    </section>
  );
}
