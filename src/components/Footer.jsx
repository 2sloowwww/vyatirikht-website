import { version } from '../version.json';
import Knockout from './Knockout.jsx';
import LoopVideo from './LoopVideo.jsx';
import { WHATSAPP_HREF } from '../data.js';

/* The close: the studio's name in giant letters with the 3D worlds playing
   inside them — the same move that opened each chapter. */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <p className="foot-about">A marketing agency in Pune — photography, film, 3D, websites and digital marketing under one roof.</p>
          <nav className="foot-col" aria-label="Explore">
            <span className="mono">Explore</span>
            <a href="#shoot">Shoot</a><a href="#edit">Edit</a><a href="#build">Build</a><a href="#grow">Grow</a><a href="blog.html">Journal</a>
          </nav>
          <div className="foot-col">
            <span className="mono">Say hello</span>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener">WhatsApp</a>
            <a href="mailto:2sloowwww@gmail.com">Email</a>
            <a href="https://www.instagram.com/vyatirikht.xyz/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.youtube.com/@2sloowwwww/" target="_blank" rel="noopener">YouTube</a>
          </div>
        </div>
      </div>

      <div className="wrap foot-mark-wrap">
        <Knockout className="foot-mark" drift={3} media={<LoopVideo src="assets/videos/reel/loop-3d.mp4" poster="assets/videos/reel/loop-3d.jpg" />}>
          <div className="giant ko-text" style={{ '--k': 4.48 }} aria-hidden="true">Vyatirikht</div>
        </Knockout>
      </div>

      <div className="wrap">
        <div className="foot-bottom">
          <span className="mono">© 2026 Vyatirikht · Pune, India · v{version}</span>
          <nav aria-label="Legal">
            <a className="mono" href="privacy.html">Privacy</a>
            <a className="mono" href="terms.html">Terms</a>
            <a className="mono" href="refund.html">Refunds</a>
            <a className="mono" href="login.html">Login</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

