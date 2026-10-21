import { useCallback, useEffect, useRef, useState } from 'react';
import { lockScroll } from '../lib/smooth.js';

const pad = (n) => String(n).padStart(2, '0');

/* One full-screen viewer for everything: photographs, films and 3D shots.
   Black stage, work as large as the screen allows, and a few words of
   control — no frames. Escape closes; arrows step; space pauses; M mutes.
   Focus moves in when it opens, stays inside while it is open, and returns
   to whatever opened it. */
export default function Theater({ open, items, index, onClose, onIndex }) {
  const root = useRef(null);
  const vid = useRef(null);
  const bar = useRef(null);
  const closeBtn = useRef(null);
  const opener = useRef(null);
  const [muted, setMuted] = useState(true);
  const item = open && items[index] ? items[index] : items[0] || null;
  const n = items.length;

  const prev = useCallback(() => onIndex((index - 1 + n) % n), [index, n, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % n), [index, n, onIndex]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    lockScroll(open);
    if (open) {
      dispatchEvent(new Event('vy:cursor-reset'));
      opener.current = document.activeElement;
      const t = setTimeout(() => { if (closeBtn.current) closeBtn.current.focus({ preventScroll: true }); }, 60);
      return () => { clearTimeout(t); document.body.style.overflow = ''; lockScroll(false); };
    }
    if (opener.current && opener.current.focus) { opener.current.focus({ preventScroll: true }); opener.current = null; }
    return () => { document.body.style.overflow = ''; lockScroll(false); };
  }, [open]);

  // Load and play whenever the item changes; stop and unload when closed.
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (!open || !item || item.kind !== 'video') {
      v.pause(); v.removeAttribute('src'); v.load();
      return;
    }
    v.src = item.src;
    v.muted = muted;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, [open, item]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (vid.current) vid.current.muted = muted; }, [muted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && n > 1) next();
      else if (e.key === 'ArrowLeft' && n > 1) prev();
      else if (e.key === ' ' && vid.current && item && item.kind === 'video' && document.activeElement && document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault();
        if (vid.current.paused) vid.current.play(); else vid.current.pause();
      } else if ((e.key === 'm' || e.key === 'M') && item && item.sound) setMuted((m) => !m);
      else if (e.key === 'Tab' && root.current) {
        const f = [...root.current.querySelectorAll('button')].filter((b) => b.tabIndex !== -1 && !b.disabled);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, item, n, next, prev, onClose]);

  const onTime = () => {
    const v = vid.current;
    if (v && bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
  };
  const onEnded = () => { if (n > 1) next(); else if (vid.current) { vid.current.currentTime = 0; vid.current.play(); } };
  const toggle = () => { const v = vid.current; if (v) { if (v.paused) v.play(); else v.pause(); } };

  const isVideo = item && item.kind === 'video';
  return (
    <div ref={root} className={'theater' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label={item ? item.title : 'Viewer'} aria-hidden={!open}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="th-stage" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <video ref={vid} className={isVideo ? '' : 'th-hide'} playsInline preload="none" poster={isVideo ? item.poster : undefined}
               onClick={toggle} onTimeUpdate={onTime} onEnded={onEnded} />
        {open && item && item.kind === 'image' && <img src={item.src} alt={item.alt || item.title} />}
      </div>

      <div className="th-top">
        <span className="mono">{pad(index + 1)} / {pad(n)}</span>
        <button type="button" ref={closeBtn} className="th-btn" onClick={onClose} tabIndex={open ? 0 : -1}>Close ×</button>
      </div>

      <div className="th-bottom">
        <div className="th-title">
          <h3 className="title">{item ? item.title : ''}</h3>
          <p className="mono">{item ? item.sub : ''}</p>
        </div>
        <div className="th-ctrl">
          {item && item.sound && <button type="button" className="th-btn" onClick={() => setMuted((m) => !m)} tabIndex={open ? 0 : -1}>Sound {muted ? 'off' : 'on'}</button>}
          {n > 1 && <button type="button" className="th-btn" onClick={prev} tabIndex={open ? 0 : -1}>← Prev</button>}
          {n > 1 && <button type="button" className="th-btn" onClick={next} tabIndex={open ? 0 : -1}>Next →</button>}
        </div>
      </div>
      {isVideo && <div className="th-progress" aria-hidden="true"><i ref={bar} /></div>}
    </div>
  );
}

