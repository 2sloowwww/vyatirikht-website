import Knockout from './Knockout.jsx';
import { Reveal } from './Reveal.jsx';
import { scrollToTarget } from '../lib/smooth.js';

const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

function ask(chip) {
  dispatchEvent(new CustomEvent('vy:service', { detail: chip }));
  scrollToTarget('#contact');
}

/* How every chapter begins: the slate, then the chapter's name set in giant
   letters with its own work playing inside them, and beside it what we do in
   that chapter — in a sentence and a list. */
export default function Opener({ num, name, meta, word, k, media, drift, text, caps, chip }) {
  return (
    <div className="opener wrap">
      <div className="slate"><b>SC.{num}</b><span>{name}</span><i /><span>{meta}</span></div>

      <div className="opener-grid">
        <Knockout className="opener-word" drift={drift} media={media}>
          <div className="giant ko-text" style={{ '--k': k }} aria-hidden="true">{word}</div>
          <h2 className="sr-only">{word}</h2>
        </Knockout>

        <div className="opener-copy">
          <Reveal as="p" className="lede">{text}</Reveal>
          <Reveal as="ul" className="caps" delay={0.08}>
            {caps.map((c) => <li key={c}>{c}</li>)}
          </Reveal>
          <Reveal delay={0.14}>
            <button type="button" className="tlink gold" onClick={() => ask(chip)}>Ask about {name.toLowerCase()} {ARROW}</button>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
