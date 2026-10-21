import Words from './Words.jsx';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import { CHAPTERS, WHY } from '../data.js';

/* Why one team, and how a project moves — two rows of plain columns. */
export default function How() {
  return (
    <section id="how" className="how" data-scene="06" data-scene-name="How we work">
      <div className="wrap">
        <div className="slate"><b>SC.06</b><span>How we work</span><i /><span>one team · four steps</span></div>
        <Words className="title how-title" parts={[{ t: 'One team for the ' }, { t: 'whole funnel.', em: true }]} />

        <RevealGroup as="ol" className="why-row">
          {WHY.map((w) => (
            <RevealItem as="li" key={w.num}>
              <span className="mono gold">{w.num}</span>
              <h3 className="title">{w.title}</h3>
              <p>{w.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <RevealGroup as="ol" className="steps-row">
          {CHAPTERS.map((c) => (
            <RevealItem as="li" key={c.id}>
              <span className="mono gold">{c.num}</span>
              <h3 className="title">{c.name}</h3>
              <p>{c.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
