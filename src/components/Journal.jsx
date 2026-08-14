import { RevealGroup, RevealItem } from './Reveal.jsx';
import { JOURNAL } from '../data.js';

export default function Journal() {
  return (
    <section id="journal">
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Journal</p>
            <h2 className="h2">Written <em>down.</em></h2>
            <p className="lede">Around ninety pieces so far — photography technique, the business side of freelancing, and plain-language explainers on the things in the news. <a className="lede-link" href="blog.html">Read all of them ↗</a></p>
          </RevealItem>
          <div className="journal-grid">
            {JOURNAL.map((j) => (
              <RevealItem as="a" className="journal-card" href={`blog/${j.slug}.html`} target="_blank" rel="noopener" key={j.slug}>
                <span className="journal-meta"><b>{j.category}</b><i>{j.read}</i></span>
                <h3>{j.title}</h3>
                <p>{j.excerpt}</p>
                <span className="journal-read">Read ↗</span>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
