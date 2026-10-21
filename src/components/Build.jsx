import Opener from './Opener.jsx';
import LoopVideo from './LoopVideo.jsx';
import Worlds from './Worlds.jsx';
import Webs from './Webs.jsx';
import { COUNTS } from '../data.js';

export default function Build() {
  return (
    <section id="build" className="chapter build" data-scene="04" data-scene-name="Build">
      <Opener
        num="04" name="Build" meta={`${COUNTS.renders} 3D renders · ${COUNTS.builds} web builds`}
        word="Build" k={2.24} drift={5}
        media={<LoopVideo src="assets/videos/reel/loop-3d.mp4" poster="assets/videos/reel/loop-3d.jpg" />}
        text="Fast, mobile-first websites, landing pages and internal tools built from scratch — and 3D worlds, when a brand needs to be seen differently."
        caps={['Websites', 'Landing pages', 'Web apps', 'ERP & automation', '3D worlds & CGI']}
        chip="Website"
      />
      <Worlds />
      <Webs />
    </section>
  );
}
