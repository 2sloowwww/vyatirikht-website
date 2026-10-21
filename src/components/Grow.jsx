import Opener from './Opener.jsx';
import BarsCanvas from './BarsCanvas.jsx';
import CountUp from './CountUp.jsx';
import ReachChart from './ReachChart.jsx';
import { Reveal, RevealGroup, RevealItem } from './Reveal.jsx';
import { RESULTS, TESTIMONIALS } from '../data.js';

const fmt = (n) => n.toLocaleString('en-IN');

export default function Grow() {
  const r = RESULTS;
  return (
    <section id="grow" className="chapter grow" data-scene="05" data-scene-name="Grow">
      <Opener
        num="05" name="Grow" meta={`organic reach · ₹${r.paid} on ads`}
        word="Grow" k={2.37} drift={4}
        media={<BarsCanvas series={r.series} />}
        text="Social media management, content calendars, Google Maps and review setup, campaign planning — with hooks, formats and posting rhythm built around what the platforms reward, so reach and views grow without paying for them."
        caps={['Social media', 'Content calendars', 'Maps & reviews', 'Campaigns', 'Hooks & formats', 'Posting rhythm', 'Analytics']}
        chip="Digital marketing"
      />

      {/* The one light block: the numbers, on paper */}
      <div className="results light" id="proof" data-tone="light">
        <div className="wrap">
          <div className="slate"><b>PROOF</b><span>{r.client} · {r.period}</span><i /><span>{r.days} days · all organic</span></div>

          <div className="results-top">
            <div className="results-num giant" aria-label={`${fmt(r.total)} accounts reached`}><CountUp value={String(r.total)} commas duration={2.4} /></div>
            <Reveal className="results-copy">
              <p className="lede">accounts reached in {r.days} days — with ₹{r.paid} spent on ads.</p>
              <p className="mono">From the client's own account analytics. The total is the sum of the daily figures below.</p>
            </Reveal>
          </div>

          <ReachChart />

          <RevealGroup as="dl" className="kpis">
            <RevealItem className="kpi"><dt className="title"><CountUp value={String(r.peak.value)} commas /></dt><dd className="mono">Peak day · Jun {r.peak.day}</dd></RevealItem>
            <RevealItem className="kpi"><dt className="title"><CountUp value={`${r.aboveAverage}%`} /></dt><dd className="mono">Above the daily average</dd></RevealItem>
            <RevealItem className="kpi"><dt className="title"><CountUp value={String(r.average)} /></dt><dd className="mono">Daily average</dd></RevealItem>
            <RevealItem className="kpi"><dt className="title">₹{r.paid}</dt><dd className="mono">Paid spend</dd></RevealItem>
          </RevealGroup>
        </div>
      </div>

      {/* What clients say — plain type, no cards */}
      <div className="voices wrap">
        <p className="mono voices-label">Client voices</p>
        {TESTIMONIALS.map((t, i) => (
          <Reveal as="figure" className={'voice' + (i % 2 ? ' is-right' : '')} key={t.name}>
            <blockquote className="quote">“{t.quote}”</blockquote>
            <figcaption>
              <b>{t.name}</b>
              <span className="mono">{t.role}</span>
              <span className="mono gold">{t.result}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
