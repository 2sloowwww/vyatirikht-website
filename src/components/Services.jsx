import { RevealGroup, RevealItem } from './Reveal.jsx';
import { SERVICES } from '../data.js';

export default function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">What I do</p>
            <h2 className="h2">Three things,<br />done <em>properly.</em></h2>
          </RevealItem>
          <div className="rows">
            {SERVICES.map((s) => (
              <RevealItem as="div" className="row" key={s.num}>
                <span className="row-num">{s.num}</span>
                <span className="row-name">{s.name}</span>
                <span className="row-desc">{s.desc}</span>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
