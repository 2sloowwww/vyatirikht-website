import Words from './Words.jsx';
import { Reveal, RevealGroup, RevealItem } from './Reveal.jsx';
import { ARTICLE_COUNT, JOURNAL } from '../data.js';

const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

export default function Journal() {
  return (
    <section id="journal" className="journal" data-scene="07" data-scene-name="Journal">
      <div className="wrap">
        <div className="slate"><b>SC.07</b><span>Journal</span><i /><span>{ARTICLE_COUNT} articles and counting</span></div>

        <div className="journal-head">
          <Words className="title journal-title" parts={[{ t: 'Notes on getting ' }, { t: 'seen.', em: true }]} />
          <Reveal className="journal-aside" delay={0.1}>
            <p className="lede">Practical guides on content, social media and getting found online.</p>
            <a className="tlink gold" href="blog.html">Read all {ARTICLE_COUNT} articles {ARROW}</a>
          </Reveal>
        </div>

        <RevealGroup as="ul" className="jlist">
          {JOURNAL.map((j) => (
            <RevealItem as="li" key={j.slug}>
              <a className="jrow" href={`blog/${j.slug}.html`}>
                <span className="jrow-meta mono"><b>{j.category}</b>{j.read}</span>
                <span className="jrow-title title">{j.title}</span>
                <span className="jrow-ex">{j.excerpt}</span>
                <span className="jrow-go" aria-hidden="true">↗</span>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
