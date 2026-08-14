import { Reveal, RevealGroup, RevealItem } from './Reveal.jsx';

export default function About() {
  return (
    <section id="about" className="about">
      <div className="wrap about-grid">
        <RevealGroup className="about-body" as="div">
          <RevealItem>
            <p className="eyebrow">About</p>
            <h2 className="h2">Developer <br />first, <em>always.</em></h2>
          </RevealItem>
          <RevealItem as="p">I started with a BCA, writing HTML, CSS and JavaScript, then Python, Node and React — and picked up a camera along the way. The camera stuck too: a diploma in filmmaking, three years of field and studio work, now running alongside the code.</RevealItem>
          <RevealItem as="p">Shotokan karate, 1st Dan. I coach it, and I advise on insurance on the side. Neither is the job, but the discipline carries over further than people expect.</RevealItem>
          <RevealItem as="p"><strong>Everything here was coded, shot, cut and graded by me.</strong> One person, start to finish — you deal with the person doing the work, and nothing gets lost being handed over.</RevealItem>

          <RevealItem as="dl" className="creds">
            <div><dt>Stack</dt><dd>React · Node · Python · Supabase</dd></div>
            <div><dt>Studio</dt><dd>DaVinci Resolve · Lightroom</dd></div>
            <div><dt>Based</dt><dd>Pune, shooting across Maharashtra</dd></div>
            <div><dt>Reply</dt><dd>Within a day, usually sooner</dd></div>
          </RevealItem>
        </RevealGroup>
        <Reveal as="figure" className="about-portrait" delay={0.1}>
          <img src="assets/images/web/sm/founder-mj-jpg.jpg" alt="Jitendra Kulkarni" loading="lazy" decoding="async" width="960" height="1280" />
          <figcaption>Jitendra Kulkarni — Pune, IN</figcaption>
        </Reveal>
      </div>
    </section>
  );
}
