import Opener from './Opener.jsx';
import LoopVideo from './LoopVideo.jsx';
import FilmIndex from './FilmIndex.jsx';
import { COUNTS } from '../data.js';

export default function Edit() {
  return (
    <section id="edit" className="chapter edit" data-scene="03" data-scene-name="Edit">
      <Opener
        num="03" name="Edit" meta={`${COUNTS.films} films · colour, sound & motion`}
        word="Edit" k={1.74} drift={5}
        media={<LoopVideo src="assets/videos/reel/loop-films.mp4" poster="assets/videos/reel/loop-films.jpg" />}
        text="Video editing, colour grading, retouching, 3D and motion graphics that turn raw footage into content that is ready to publish."
        caps={['Reels & shorts', 'Colour grading', 'Retouching', '3D & CGI', 'VFX & motion']}
        chip="Editing"
      />
      <FilmIndex />
    </section>
  );
}
