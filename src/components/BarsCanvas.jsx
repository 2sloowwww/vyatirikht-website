import { useEffect, useRef } from 'react';

/* A bar chart that fills the letters of GROW: one bar per day of a client's
   real 29-day reach, over a warm gold ground with faint gridlines, so the
   letters stay solid and the chart is the texture. The bars rise when the
   word scrolls into view, then breathe slightly. */
export default function BarsCanvas({ series }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const max = Math.max(...series);
    let w = 0, h = 0, dpr = 1, raf = 0, start = 0, visible = false;

    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t) => {
      const grow = reduce ? 1 : Math.min(1, (t - start) / 2200);
      const ease = 1 - Math.pow(1 - grow, 3);

      // ground: a warm gold, lighter toward the top, so every letter is solid
      const ground = ctx.createLinearGradient(0, 0, 0, h);
      ground.addColorStop(0, '#B07A2A');
      ground.addColorStop(1, '#7C531C');
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, w, h);

      // gridlines, like a chart
      ctx.strokeStyle = 'rgba(255, 226, 150, 0.22)';
      ctx.lineWidth = 1;
      for (let g = 1; g < 4; g++) { const y = Math.round((h * g) / 4) + 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // bars
      const n = series.length;
      const gap = Math.max(3, w * 0.006);
      const bw = (w - gap * (n - 1)) / n;
      const bars = ctx.createLinearGradient(0, h, 0, 0);
      bars.addColorStop(0, '#F2A93B');
      bars.addColorStop(1, '#FFE9A8');
      ctx.fillStyle = bars;
      for (let i = 0; i < n; i++) {
        const breathe = reduce ? 1 : 1 + Math.sin(t / 900 + i * 0.7) * 0.035 * ease;
        const bh = (series[i] / max) * h * 0.94 * ease * breathe;
        ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
      }
    };

    const loop = (t) => {
      if (!start) start = t;
      draw(t);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { start = 0; raf = requestAnimationFrame(loop); }
    }, { threshold: 0.1 });
    io.observe(c);
    draw(performance.now());

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [series]);

  return <canvas ref={ref} aria-hidden="true" />;
}
