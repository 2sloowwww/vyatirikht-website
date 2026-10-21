import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RESULTS } from '../data.js';

const W = 1000, H = 320, PT = 26, PB = 40;
const fmt = (n) => n.toLocaleString('en-IN');
const pad = (n) => String(n).padStart(2, '0');

/* The client's real day-by-day reach as one line. Hover (or drag a finger)
   across it to read any day; at rest it points at the peak. */
export default function ReachChart() {
  const { series, peak } = RESULTS;
  const [hover, setHover] = useState(null);
  const svg = useRef(null);
  const n = series.length;
  const max = 1400;

  const pts = useMemo(() => series.map((v, i) => [(W * i) / (n - 1), PT + (H - PT - PB) * (1 - v / max)]), [series, n]);

  // Smooth the line through the points (Catmull-Rom converted to Béziers).
  const line = useMemo(() => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }, [pts]);
  const area = `${line} L${W},${H - PB} L0,${H - PB} Z`;

  const at = (e) => {
    const r = svg.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round((x / W) * (n - 1)))));
  };

  const idx = hover === null ? peak.day - 1 : hover;
  const [px, py] = pts[idx];

  return (
    <div className="reach">
      <p className="reach-read mono" aria-live="polite">
        <span>Jun {pad(idx + 1)}</span><b>{fmt(series[idx])}</b><span>accounts reached{idx === peak.day - 1 ? ' — the peak' : ''}</span>
      </p>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="reach-svg" role="img"
           aria-label={`Accounts reached per day over ${n} days, peaking at ${fmt(peak.value)} on day ${peak.day}`}
           onPointerMove={at} onPointerDown={at} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="reach-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.2" /><stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((g) => <line key={g} x1="0" x2={W} y1={PT + ((H - PT - PB) * g) / 3} y2={PT + ((H - PT - PB) * g) / 3} className="reach-grid" />)}
        <motion.path d={area} fill="url(#reach-fill)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 1.4, delay: 0.6 }} />
        <motion.path d={line} className="reach-line" fill="none" vectorEffect="non-scaling-stroke"
                     initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }} />
        <line x1={px} x2={px} y1={PT - 8} y2={H - PB} className="reach-cross" />
        <circle cx={px} cy={py} r="7" className="reach-dot" />
        {[1, 7, 14, 21, 29].map((d) => (
          <text key={d} x={(W * (d - 1)) / (n - 1)} y={H - 10} className="reach-tick" textAnchor={d === 1 ? 'start' : d === 29 ? 'end' : 'middle'}>{pad(d)}</text>
        ))}
      </svg>
    </div>
  );
}
