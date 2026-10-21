import Opener from './Opener.jsx';
import ImageStack from './ImageStack.jsx';
import Mosaic from './Mosaic.jsx';
import { COUNTS, PHOTO_CATS } from '../data.js';

/* Only bright, colourful, mid-key frames: a dark or flat photograph would
   disappear inside the letters. */
const WORD_PHOTOS = [
  'assets/images/web/sm/jwellery-7.jpg', 'assets/images/web/sm/2xzx10rs.jpg', 'assets/images/web/sm/model-2.jpg',
  'assets/images/web/sm/product-1.jpg', 'assets/images/web/clean/sm/traditional-1.jpg', 'assets/images/web/sm/bike-3.jpg',
  'assets/images/web/sm/maternity-1.jpg', 'assets/images/web/sm/watchproduct.jpg', 'assets/images/web/sm/rmoantic-walk.jpg'
];

export default function Shoot() {
  return (
    <section id="shoot" className="chapter shoot" data-scene="02" data-scene-name="Shoot">
      <Opener
        num="02" name="Shoot" meta={`${COUNTS.photos} photographs · ${PHOTO_CATS.length} categories`}
        word="Shoot" k={2.56} drift={5}
        media={<ImageStack images={WORD_PHOTOS} />}
        text="Product, jewellery, automotive, event and portrait photography, plus brand films and reels — planned, lit and shot by us."
        caps={['Product', 'Jewellery', 'Automotive', 'Events', 'Portraits', 'Brand films']}
        chip="Shooting"
      />
      <Mosaic />
    </section>
  );
}
