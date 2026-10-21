import { useEffect, useRef, useState } from 'react';

/* A silent looping clip that only runs while it is on screen. The poster
   paints first; the video fades in once it is really playing. Reduced-motion
   and data-saver visitors keep the poster. */
export default function LoopVideo({ src, small, poster, rate = 1 }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || {};
    const thrifty = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    if (reduce || thrifty) return;

    v.muted = true;
    v.playbackRate = rate;
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const onPlaying = () => setLive(true);
    v.addEventListener('playing', onPlaying);

    let loaded = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!loaded) { loaded = true; v.src = small && innerWidth < 760 ? small : src; }
        play();
      } else v.pause();
    }, { threshold: 0.05, rootMargin: '120px 0px' });
    io.observe(v);

    return () => { io.disconnect(); v.removeEventListener('playing', onPlaying); v.pause(); };
  }, [src, small, rate]);

  return (
    <>
      {poster && <img className="lv-poster" src={poster} alt="" loading="lazy" decoding="async" />}
      <video ref={ref} className={'lv' + (live ? ' on' : '')} muted loop playsInline preload="none" />
    </>
  );
}
