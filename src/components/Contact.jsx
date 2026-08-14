import { useRef, useState } from 'react';
import { Reveal, RevealGroup, RevealItem } from './Reveal.jsx';
import Magnetic from './Magnetic.jsx';
import Terminal from './Terminal.jsx';
import { CONTACT_LINKS } from '../data.js';

const WA = 'Please WhatsApp me instead: +91 98901 01755.';

export default function Contact() {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    const phone = phoneRef.current.value.trim();
    if (!name) { setMsg('Your name, please.'); return; }
    if (!phone) { setMsg('A number I can reach you on.'); return; }

    const sb = window.getSupabase ? window.getSupabase() : null;
    if (!sb) { setMsg('The form is offline. ' + WA); return; }

    setSending(true);
    setMsg('Sending…');

    sb.from('enquiries').insert({
      name, phone,
      email: emailRef.current.value.trim() || null,
      message: messageRef.current.value.trim() || null,
      service: 'General',
      contact_via: 'WhatsApp'
    }).then((res) => {
      setSending(false);
      if (res.error) { setMsg('That did not go through. ' + WA); return; }
      setDone(true);
    }).catch(() => {
      setSending(false);
      setMsg('That did not go through. ' + WA);
    });
  };

  return (
    <section id="contact" className="section-dark">
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Contact</p>
            <h2 className="h2">Start <em>something.</em></h2>
            <p className="lede">Tell me what you're building or shooting. WhatsApp is fastest; the form reaches the same place.</p>
          </RevealItem>
        </RevealGroup>

        <div className="contact-grid">
          <RevealGroup className="direct" as="div">
            {CONTACT_LINKS.map((c) => (
              <RevealItem as="a" href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener' : undefined} key={c.label}>
                <b>{c.big}</b><span>{c.label}</span>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            {!done ? (
              <form onSubmit={submit} noValidate>
                <div className="field">
                  <label htmlFor="enq-name">Name</label>
                  <input type="text" id="enq-name" name="name" autoComplete="name" required ref={nameRef} />
                </div>
                <div className="field">
                  <label htmlFor="enq-phone">Phone or WhatsApp</label>
                  <input type="tel" id="enq-phone" name="phone" autoComplete="tel" required ref={phoneRef} />
                </div>
                <div className="field">
                  <label htmlFor="enq-email">Email <span style={{ textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                  <input type="email" id="enq-email" name="email" autoComplete="email" ref={emailRef} />
                </div>
                <div className="field">
                  <label htmlFor="enq-message">What do you need?</label>
                  <textarea id="enq-message" name="message" placeholder="A shoot, a site, an app — and roughly when." ref={messageRef}></textarea>
                </div>
                <Magnetic as="button" type="submit" className="btn btn-solid" disabled={sending} strength={0.18}><span>Send</span></Magnetic>
                <p className="form-msg" role="status" aria-live="polite">{msg}</p>
              </form>
            ) : (
              <p className="form-done">
                Got it — I'll reply within a day.{' '}
                <a href="https://wa.me/919890101755" target="_blank" rel="noopener">Message me on WhatsApp →</a>
              </p>
            )}
          </Reveal>
        </div>

        <p className="terminal-hint eyebrow" style={{ marginTop: 56 }}>Or talk to the terminal</p>
        <Terminal />
      </div>
    </section>
  );
}
