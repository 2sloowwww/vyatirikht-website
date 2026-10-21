import { useEffect, useRef, useState } from 'react';
import Words from './Words.jsx';
import Magnetic from './Magnetic.jsx';
import { Reveal, RevealGroup, RevealItem } from './Reveal.jsx';
import { CONTACT_LINKS, FORM_SERVICES, WHATSAPP, WHATSAPP_HREF } from '../data.js';

/* If the enquiry can't be saved, the visitor keeps what they typed: the same
   details are handed to WhatsApp, one tap from sending. */
const waLinkFor = (name, phone, body) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    ["Hi Vyatirikht, we'd like to talk about a project.", `Name: ${name}`, `Phone: ${phone}`, body].filter(Boolean).join('\n')
  )}`;

const ARROW = (
  <svg className="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" /></svg>
);

export default function Contact() {
  const [msg, setMsg] = useState('');
  const [waLink, setWaLink] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState([]);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  // A chapter's "Ask about…" link can pre-select its service here.
  useEffect(() => {
    const onPick = (e) => setPicked((p) => (p.includes(e.detail) ? p : [...p, e.detail]));
    addEventListener('vy:service', onPick);
    return () => removeEventListener('vy:service', onPick);
  }, []);

  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = (e) => {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    const phone = phoneRef.current.value.trim();
    if (!name) { setMsg('Your name, please.'); return; }
    if (!phone) { setMsg('A number we can reach you on.'); return; }

    // The enquiries table has a single free-text message column, so the
    // chosen services ride along at the top of it.
    const note = picked.length ? `Interested in: ${picked.join(', ')}` : '';
    const body = [note, messageRef.current.value.trim()].filter(Boolean).join('\n\n');

    const fallBack = () => {
      setSending(false);
      setMsg("We couldn't save that just now — your details are ready to send on WhatsApp instead.");
      setWaLink(waLinkFor(name, phone, body));
    };

    const sb = window.getSupabase ? window.getSupabase() : null;
    if (!sb) { fallBack(); return; }

    setSending(true);
    setWaLink('');
    setMsg('Sending…');

    sb.from('enquiries').insert({
      name, phone,
      email: emailRef.current.value.trim() || null,
      message: body || null,
      service: 'General',
      contact_via: 'WhatsApp'
    }).then((res) => {
      if (res.error) { fallBack(); return; }
      setSending(false);
      setDone(true);
    }).catch(fallBack);
  };

  return (
    <section id="contact" className="contact" data-scene="08" data-scene-name="Contact">
      <div className="wrap">
        <div className="slate"><b>SC.08</b><span>Contact</span><i /><span>we reply within a day</span></div>
        <Words className="giant contact-title" parts={[{ t: "Let's grow " }, { t: 'your brand.', em: true }]} />

        <div className="contact-grid">
          <RevealGroup className="contact-left">
            <RevealItem as="p" className="lede">
              Tell us what you need — a shoot, a film, a site, a content plan. WhatsApp is fastest; the form reaches the same place.
            </RevealItem>
            <RevealItem>
              <Magnetic><a className="obtn gold" href={WHATSAPP_HREF} target="_blank" rel="noopener">Chat on WhatsApp {ARROW}</a></Magnetic>
              <p className="contact-note mono">Projects from ₹1999* · contact for details</p>
            </RevealItem>
            <RevealItem as="ul" className="direct">
              {CONTACT_LINKS.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener' : undefined}>
                    <span className="mono">{c.label}</span><b>{c.big}</b>
                  </a>
                </li>
              ))}
            </RevealItem>
          </RevealGroup>

          <Reveal delay={0.1} className="form-area">
            {!done ? (
              <form onSubmit={submit} noValidate>
                <p className="form-title title">Send an enquiry</p>
                <div className="field">
                  <label htmlFor="enq-name">Name</label>
                  <input type="text" id="enq-name" name="name" autoComplete="name" required ref={nameRef} />
                </div>
                <div className="field">
                  <label htmlFor="enq-phone">Phone or WhatsApp</label>
                  <input type="tel" id="enq-phone" name="phone" autoComplete="tel" required ref={phoneRef} />
                </div>
                <div className="field">
                  <label htmlFor="enq-email">Email <span className="opt">— optional</span></label>
                  <input type="email" id="enq-email" name="email" autoComplete="email" ref={emailRef} />
                </div>

                <fieldset className="field chips">
                  <legend>What do you need?</legend>
                  <div className="chip-row">
                    {FORM_SERVICES.map((s) => (
                      <button type="button" key={s} className={'chip' + (picked.includes(s) ? ' on' : '')}
                              aria-pressed={picked.includes(s)} onClick={() => toggle(s)}>{s}</button>
                    ))}
                  </div>
                </fieldset>

                <div className="field">
                  <label htmlFor="enq-message">Anything else? <span className="opt">— optional</span></label>
                  <textarea id="enq-message" name="message" rows="3" placeholder="A shoot, a site, a content plan — and roughly when." ref={messageRef}></textarea>
                </div>
                <button type="submit" className="obtn gold" disabled={sending}>Send enquiry {ARROW}</button>
                <p className="form-msg" role="status" aria-live="polite">{msg}</p>
                {waLink && <a className="tlink gold" href={waLink} target="_blank" rel="noopener">Send it on WhatsApp {ARROW}</a>}
              </form>
            ) : (
              <p className="form-done title">
                Got it — we'll reply within a day. <a className="tlink gold" href={WHATSAPP_HREF} target="_blank" rel="noopener">Message us on WhatsApp {ARROW}</a>
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
