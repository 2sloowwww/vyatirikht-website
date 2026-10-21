import { useEffect, useState } from 'react';

/* Stills that cross-fade, for letters filled with photographs. */
export default function ImageStack({ images, interval = 3200 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div className="stack-media">
      {images.map((im, k) => (
        <img key={im} className={k === i ? 'on' : ''} src={im} alt="" loading={k < 2 ? 'eager' : 'lazy'} decoding="async" />
      ))}
    </div>
  );
}
