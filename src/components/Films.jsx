import { useEffect, useRef, useState } from 'react';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import Stills from './Stills.jsx';
import { FILMS } from '../data.js';

function FilmCard({ film, onOpen }) {
  const videoRef = useRef(null);
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const warm = useRef(null);

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thrifty = !!(navigator.connection && navigator.connection.saveData);
  const canPreview = fine && !reduce && !thrifty;

  const enter = () => {
    if (!canPreview) return;
    clearTimeout(warm.current);
    // Short delay so sweeping the cursor across the grid doesn't kick
    // off every clip in turn.
    warm.current = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => {
        const v = videoRef.current;
        if (!v) return;
        const p = v.play();
        if (p && p.then) p.then(() => setOn(true)).catch(() => {});
        else setOn(true);
      });
    }, 140);
  };
  const leave = () => {
    clearTimeout(warm.current);
    setOn(false);
    if (videoRef.current) videoRef.current.pause();
  };

  return (
    <RevealItem as="button" className="film" type="button" onClick={() => onOpen(film)} onPointerEnter={enter} onPointerLeave={leave}>
      <img src={film.poster} alt={film.alt} loading="lazy" decoding="async" />
      {mounted && (
        <video ref={videoRef} className={on ? 'on' : ''} muted loop playsInline preload="none" src={film.video}></video>
      )}
      <b aria-hidden="true"></b>
      <span>{film.label}</span>
    </RevealItem>
  );
}

export default function Films() {
  // `film` holds the last-opened clip and is left set on close so the
  // caption/video don't blank out mid-fade; `open` drives visibility.
  const [film, setFilm] = useState(null);
  const [open, setOpen] = useState(false);
  const vidRef = useRef(null);

  const launch = (f) => { setFilm(f); setOpen(true); };
  const close = () => {
    setOpen(false);
    const v = vidRef.current;
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
  };

  useEffect(() => {
    if (!open || !film) return;
    document.body.style.overflow = 'hidden';
    const v = vidRef.current;
    if (v) { v.src = film.video; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', onKey); };
  }, [open, film]);

  return (
    <section id="motion">
      <div className="wrap">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">Motion</p>
            <h2 className="h2">Moving.</h2>
          </RevealItem>
          <div className="films">
            {FILMS.map((f) => <FilmCard film={f} key={f.key} onOpen={launch} />)}
          </div>
        </RevealGroup>
        <Stills compact />
      </div>

      <div className={'lb' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label="Film viewer"
           onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        <button className="lb-btn lb-close" aria-label="Close" onClick={close}>&times;</button>
        <figure>
          <video ref={vidRef} controls playsInline preload="none"></video>
          <figcaption>{film ? film.title : ''}</figcaption>
        </figure>
      </div>
    </section>
  );
}
