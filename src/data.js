/* Everything the homepage says and shows, in one place, so copy edits never
   touch markup. Written in the studio's voice ("we"), no individual names. */

export const WHATSAPP = '919890101755';
export const WHATSAPP_HREF =
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Vyatirikht, we'd like to talk about a project.")}`;

/* Articles on /blog — kept as a constant so the stat and the journal
   copy can't drift apart. */
export const ARTICLE_COUNT = 90;

/* ── Showreel ─────────────────────────────────────────
   One silent, pre-cut file (assets/videos/reel/showreel.mp4, 31 s, 13 clips
   from the portfolio) where every clip dissolves into the next — and the last
   dissolves back into the first, so the loop has no seam. `cues` say what is
   on screen at each moment (the label changes at the middle of each dissolve),
   for the readout and the clip counter. Re-cutting the reel only means
   replacing the file and these cues (scripts: buildsmooth). */
export const REEL = {
  src: 'assets/videos/reel/showreel.mp4',
  small: 'assets/videos/reel/showreel-sm.mp4',
  poster: 'assets/videos/reel/showreel.jpg',
  duration: 30,
  count: 13,
  cues: [
    { at: 0, cat: 'Product animation', title: 'Sword', n: 1 },
    { at: 1.95, cat: '3D animation', title: 'Autumn drive', n: 2 },
    { at: 4.45, cat: 'Product film', title: 'Coolberg', n: 3 },
    { at: 6.15, cat: '3D animation', title: 'Kyoto street', n: 4 },
    { at: 8.35, cat: 'Cinematography', title: 'Badminton', n: 5 },
    { at: 10.75, cat: '3D animation', title: 'Nature', n: 6 },
    { at: 13.35, cat: 'Character render', title: 'Joker', n: 7 },
    { at: 15.55, cat: '3D animation', title: 'Kyoto', n: 8 },
    { at: 17.45, cat: 'Cinematography', title: 'Badminton', n: 9 },
    { at: 19.75, cat: '3D animation', title: 'Autumn drive', n: 10 },
    { at: 22.35, cat: '3D animation', title: 'Kyoto shrine', n: 11 },
    { at: 24.75, cat: '3D animation', title: 'Mountain', n: 12 },
    { at: 27.05, cat: '3D animation', title: 'Autumn drive', n: 13 },
    { at: 29.55, cat: 'Product animation', title: 'Sword', n: 1 }
  ]
};

/* Typographic marks — no open icon set carries logos for these. */
export const BRANDS = [
  { name: 'Flipkart', kind: 'E-commerce' },
  { name: 'Castrol', kind: 'Automotive' },
  { name: 'Royal Enfield', kind: 'Automotive' },
  { name: 'Coolberg', kind: 'Beverage' },
  { name: '8Moto', kind: 'Motorsport' },
  { name: 'Bhagwati Jewellers', kind: 'Jewellery' },
  { name: 'CineTorque Films', kind: 'Production' }
];

/* ── What we do — the timeline ────────────────────────
   Five tracks, each a service. `clips` are placed on a 0–100 timeline
   (`at` = start, `len` = length, both in %) so the shapes read like a real
   edit; the four chapters are the process. */
export const CHAPTERS = [
  { id: 'brief', num: '01', name: 'Brief', at: 0, to: 16, text: 'A short WhatsApp or video call: goals, audience, budget and timeline. No long forms.' },
  { id: 'plan', num: '02', name: 'Plan', at: 16, to: 38, text: 'A shot list, sitemap or content calendar, so everyone knows what is being made and why.' },
  { id: 'produce', num: '03', name: 'Produce', at: 38, to: 72, text: 'Shooting, editing and development, all in-house, with check-ins at each stage.' },
  { id: 'publish', num: '04', name: 'Publish & grow', at: 72, to: 100, text: 'Launch, post and track reach — then adjust to what the numbers say is working.' }
];

export const TRACKS = [
  {
    id: 'V1', name: 'Shooting', chip: 'Shooting',
    blurb: 'Product, jewellery, automotive, event and portrait photography, plus brand films and reels — planned, lit and shot by us.',
    tags: ['Photography', 'Brand films', 'Product shoots', 'Events'],
    clips: [
      { label: 'Recce & shot list', at: 17, len: 15 },
      { label: 'Shoot day', at: 34, len: 13 },
      { label: 'Product & jewellery', at: 49, len: 17 },
      { label: 'Events & portraits', at: 68, len: 15 }
    ]
  },
  {
    id: 'V2', name: 'Editing & motion', chip: 'Editing',
    blurb: 'Video editing, colour grading, retouching, 3D and motion graphics that turn raw footage into content that is ready to publish.',
    tags: ['Reels & shorts', 'Colour grading', '3D & CGI', 'VFX & motion'],
    clips: [
      { label: 'Rough cut', at: 40, len: 12 },
      { label: 'Colour & sound', at: 54, len: 14 },
      { label: '3D & VFX', at: 70, len: 12 },
      { label: 'Reels & shorts', at: 84, len: 15 }
    ]
  },
  {
    id: 'W1', name: 'Websites', chip: 'Website',
    blurb: 'Fast, mobile-first websites, landing pages and internal tools built from scratch — from a portfolio site to a full ERP.',
    tags: ['Websites', 'Landing pages', 'Web apps', 'ERP & automation'],
    clips: [
      { label: 'Sitemap', at: 17, len: 9 },
      { label: 'Design', at: 28, len: 13 },
      { label: 'Build', at: 43, len: 23 },
      { label: 'Launch', at: 68, len: 11 }
    ]
  },
  {
    id: 'M1', name: 'Digital marketing', chip: 'Digital marketing',
    blurb: 'Social media management, content calendars, Google Maps and review setup, and campaign planning — one plan across every channel.',
    tags: ['Social media', 'Content calendars', 'Google Maps & reviews', 'Campaigns'],
    clips: [
      { label: 'Content calendar', at: 19, len: 17 },
      { label: 'Maps & reviews', at: 38, len: 17 },
      { label: 'Social posting', at: 60, len: 20 },
      { label: 'Campaigns', at: 83, len: 15 }
    ]
  },
  {
    id: 'G1', name: 'Organic reach & views', chip: 'Organic growth',
    blurb: 'Hooks, formats and posting rhythm built around what the platforms reward, so reach and views grow without paying for them.',
    tags: ['Reels strategy', 'Hooks & formats', 'Consistency', 'Analytics'],
    clips: [
      { label: 'Hooks & formats', at: 44, len: 17 },
      { label: 'Posting rhythm', at: 63, len: 15 },
      { label: 'Analytics', at: 80, len: 11 },
      { label: 'Iterate', at: 92, len: 7 }
    ]
  }
];

export const WHY = [
  {
    num: '01', title: 'Everything under one roof',
    text: 'Shooting, editing, development and marketing run as one plan — not five freelancers who never talk to each other.'
  },
  {
    num: '02', title: 'Made to be seen',
    text: 'Every shot, page and post is planned around reach — hooks, formats and posting rhythm included — not just how it looks.'
  },
  {
    num: '03', title: 'Direct and quick',
    text: 'You talk to the people doing the work, on WhatsApp, and hear back within a day. A full internal ERP for a client went from brief to live in three days.'
  }
];

/* ── Films ────────────────────────────────────────────
   All fourteen. `cat` drives the filter; `ar` is width / height; `sound`
   marks the files that carry a soundtrack; `d` is the length in seconds. */
export const FILM_GROUPS = [
  { key: 'brand', label: 'Brand & product' },
  { key: 'social', label: 'Reels & social' },
  { key: 'cinema', label: 'Cinematic' },
  { key: 'motion', label: '3D & motion' }
];

const film = (key, title, cat, disc, ar, d, sound = true) => ({
  key, title, cat, disc, ar, d, sound,
  video: `assets/videos/web/${key}.mp4`, poster: `assets/videos/poster/${key}.jpg`
});

export const FILMS = [
  film('royalenfield', 'Royal Enfield — store film', 'brand', 'Brand film', 0.5625, 18),
  film('jewellery', 'Jewellery — product film', 'brand', 'Product film', 1.7778, 18),
  film('coolberg', 'Coolberg — product film', 'brand', 'Product film', 1.7778, 18),
  film('hunter', 'Hunter — delivery film', 'brand', 'Brand film', 0.5625, 18),
  film('nothing', 'Nothing 2a — product film', 'brand', 'Product film', 1.774, 18, false),
  film('karwa', 'Karwa Chauth — campaign', 'social', 'Reels & social', 0.5625, 18),
  film('bhagwati', 'Bhagwati — brand reel', 'social', 'Reels & social', 0.5625, 18),
  film('cinematic', 'Cinematic study', 'cinema', 'Cinematography', 1.7778, 18),
  film('badminton', 'Badminton — cinematic', 'cinema', 'Cinematography', 1.7778, 14),
  film('acting', 'Dramatic relight', 'cinema', 'Colour grading', 1.7778, 17),
  film('joker', 'Joker — character render', 'motion', '3D animation', 1.7778, 18),
  film('national', 'National Treasures', 'motion', '3D animation', 1.7778, 18),
  film('sword', 'Sword — product animation', 'motion', '3D animation', 1.7778, 18),
  film('valorant', 'Valorant — game VFX', 'motion', 'Motion & VFX', 0.5625, 18)
];

/* ── 3D & CGI ─────────────────────────────────────────
   Twenty-one renders in five sets. Web copies live in assets/videos/3d;
   the full-size originals stay in assets/videos. */
const pad2 = (n) => String(n).padStart(2, '0');
const shot = (set, slug, title, ar, d, extra = {}) => ({
  set, key: slug, title, ar, d, disc: '3D animation',
  video: `assets/videos/3d/${slug}.mp4`, poster: `assets/videos/poster/3d-${slug}.jpg`, ...extra
});

export const RENDER_SETS = [
  { key: 'autumn', title: 'Autumn Drive', line: 'Car visualisation · 8 shots' },
  { key: 'kyoto', title: 'Kyoto', line: 'Environment animation · 10 shots' },
  { key: 'nature', title: 'Nature', line: 'Landscape film with sound design · 80 s' },
  { key: 'meeting', title: 'Meeting', line: 'Animation · 42 s' },
  { key: 'mountain', title: 'Mountain', line: 'Landscape render · 6 s' }
];

const AUTUMN = [
  ['Approach', 5], ['Rear tracking', 5], ['Low front angle', 7], ['Wide approach', 7],
  ['Through the branches', 6], ['Through the leaves', 5], ['Top-down pass', 7], ['Tail-light detail', 6]
];
const KYOTO = [
  ['Vending machine & tanabata', 5, 1.446], ['Tanabata bamboo', 3, 1.446], ['Lanterns', 3, 1.446], ['Misty approach', 5, 1.333],
  ['Shrine, close', 5, 1.446], ['Shrine', 5, 1.333], ['Rainy street', 5, 1.333], ['Street banners', 5, 1.333],
  ['Gate & garden', 5, 1.333], ['Shopfront', 5, 1.333]
];

export const RENDERS = [
  ...AUTUMN.map(([t, d], i) => shot('autumn', `autumn-drive-${pad2(i + 1)}`, `Autumn Drive — ${t.toLowerCase()}`, 1.7778, d)),
  ...KYOTO.map(([t, d, ar], i) => shot('kyoto', `kyoto-${pad2(i + 1)}`, `Kyoto — ${t.toLowerCase()}`, ar, d)),
  shot('nature', 'nature', 'Nature — with sound design', 1.7778, 80, { sound: true, preview: 'assets/videos/3d/nature-preview.mp4' }),
  shot('meeting', 'meeting', 'Meeting animation', 1.7778, 42, { preview: 'assets/videos/3d/meeting-preview.mp4' }),
  shot('mountain', 'mountain-render', 'Mountain landscape', 1.7778, 6)
];

/* ── Photography ──────────────────────────────────────
   Thirty-nine stills in seven categories. `thumb` is 900 px wide; `full` is
   the lightbox image. Four frames use cleaned crops (assets/images/web/clean)
   with an embedded credit line or a white border trimmed off. */
export const PHOTO_CATS = [
  { key: 'product', label: 'Product' },
  { key: 'jewellery', label: 'Jewellery' },
  { key: 'event', label: 'Events' },
  { key: 'moto', label: 'Motorcycles' },
  { key: 'portrait', label: 'Portrait' },
  { key: 'creative', label: 'Creative' },
  { key: 'maternity', label: 'Maternity' }
];

export const PHOTOS = [
  { cat: 'product', thumb: 'assets/images/web/sm/product-4.jpg', full: 'assets/images/web/product-4.jpg', ar: 0.667, cap: 'Coolberg — studio campaign', alt: 'Coolberg bottle shot in studio for a campaign' },
  { cat: 'product', thumb: 'assets/images/web/sm/product-1.jpg', full: 'assets/images/web/product-1.jpg', ar: 0.667, cap: 'Coolberg — ambient series', alt: 'Pink beverage bottle against a dusty-rose backdrop with dark flowers' },
  { cat: 'product', thumb: 'assets/images/web/sm/product-7.jpg', full: 'assets/images/web/product-7.jpg', ar: 0.667, cap: 'Coolberg — dark botanical', alt: 'Coolberg bottle lit against a dark botanical background' },
  { cat: 'product', thumb: 'assets/images/web/clean/sm/smirnoff.jpg', full: 'assets/images/web/clean/smirnoff.jpg', ar: 0.751, cap: 'Smirnoff — bottle study', alt: 'Two vodka bottles photographed in moody black and white' },
  { cat: 'product', thumb: 'assets/images/web/sm/bottle-with-locket.jpg', full: 'assets/images/web/bottle-with-locket.jpg', ar: 0.563, cap: 'Flask with locket', alt: 'A hip flask with a locket chain resting in long grass' },
  { cat: 'product', thumb: 'assets/images/web/sm/watchproduct.jpg', full: 'assets/images/web/watchproduct.jpg', ar: 0.75, cap: 'Watch — lifestyle', alt: 'Black wristwatch on a hand reaching toward orange wildflowers' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-1.jpg', full: 'assets/images/web/jwellery-1.jpg', ar: 1.503, cap: 'Green enamel band', alt: 'Green enamel band ring on a black jewellery box with botanical foliage' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-2.jpg', full: 'assets/images/web/jwellery-2.jpg', ar: 1.503, cap: 'Diamond cluster ring', alt: 'Silver diamond cluster ring on blue silk' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-3.jpg', full: 'assets/images/web/jwellery-3.jpg', ar: 1.503, cap: 'Emerald cocktail ring', alt: 'Emerald-set cocktail ring on crimson fabric, dark mood' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-4.jpg', full: 'assets/images/web/jwellery-4.jpg', ar: 1.503, cap: 'Red enamel leaf band', alt: 'Red enamel leaf-motif band ring on burgundy silk' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-5.jpg', full: 'assets/images/web/jwellery-5.jpg', ar: 1.503, cap: 'Blue enamel band', alt: 'Blue enamel geometric band ring on navy silk' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-7.jpg', full: 'assets/images/web/jwellery-7.jpg', ar: 0.666, cap: 'Gold mangalsutra', alt: 'Gold mangalsutra pendant on a model in warm golden-hour light' },
  { cat: 'jewellery', thumb: 'assets/images/web/sm/jwellery-6.jpg', full: 'assets/images/web/jwellery-6.jpg', ar: 1.503, cap: 'Enamel heart ring', alt: 'Silver ring with a red enamel heart lattice on a black gift box with a composited satin and dried-floral backdrop' },
  { cat: 'event', thumb: 'assets/images/web/sm/djstage-2.jpg', full: 'assets/images/web/djstage-2.jpg', ar: 0.75, cap: 'DJ stage detail', alt: 'DJ controller mid-set under teal and amber light' },
  { cat: 'event', thumb: 'assets/images/web/sm/club-1.jpg', full: 'assets/images/web/club-1.jpg', ar: 0.75, cap: 'Club night', alt: 'Black and white shot from a club night' },
  { cat: 'event', thumb: 'assets/images/web/sm/club-2.jpg', full: 'assets/images/web/club-2.jpg', ar: 0.75, cap: 'Spirits bar — still life', alt: 'Premium spirits bottles on a bar shelf, black and white' },
  { cat: 'moto', thumb: 'assets/images/web/sm/bike-3.jpg', full: 'assets/images/web/bike-3.jpg', ar: 0.75, cap: 'Motocross pit detail', alt: 'Race bike and helmet in the pit after a motocross round' },
  { cat: 'moto', thumb: 'assets/images/web/sm/bike-4.jpg', full: 'assets/images/web/bike-4.jpg', ar: 0.8, cap: 'Rider at dusk', alt: 'Rider in full gear seated on a track-spec sport bike at dusk, pink and blue sky' },
  { cat: 'moto', thumb: 'assets/images/web/clean/sm/mt-15.jpg', full: 'assets/images/web/clean/mt-15.jpg', ar: 0.795, cap: 'Yamaha MT-15', alt: 'Yamaha MT-15 parked on a forest road' },
  { cat: 'moto', thumb: 'assets/images/web/sm/r15.jpg', full: 'assets/images/web/r15.jpg', ar: 0.749, cap: 'Yamaha R15', alt: 'Yamaha R15 motorcycle' },
  { cat: 'moto', thumb: 'assets/images/web/sm/rx100.jpg', full: 'assets/images/web/rx100.jpg', ar: 0.75, cap: 'Yamaha RX100', alt: 'Yamaha RX100 classic motorcycle with a gold tank' },
  { cat: 'moto', thumb: 'assets/images/web/sm/2xzx10rs.jpg', full: 'assets/images/web/2xzx10rs.jpg', ar: 1.333, cap: 'Kawasaki ZX-10R', alt: 'Two Kawasaki ZX-10R superbikes parked by a pool' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/portrait-1.jpg', full: 'assets/images/web/portrait-1.jpg', ar: 0.666, cap: 'Monsoon trails', alt: 'Portrait of a rider on a monsoon trail' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/portrait-2.jpg', full: 'assets/images/web/portrait-2.jpg', ar: 0.751, cap: 'Café portrait', alt: 'Lifestyle portrait in a café' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/portrait-3.jpg', full: 'assets/images/web/portrait-3.jpg', ar: 0.75, cap: 'Portrait session', alt: 'Portrait session' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/portrait-4.jpg', full: 'assets/images/web/portrait-4.jpg', ar: 0.75, cap: 'Portrait session', alt: 'Portrait session' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/portrait-5.jpg', full: 'assets/images/web/portrait-5.jpg', ar: 0.749, cap: 'Portrait session', alt: 'Portrait session' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/model-1.jpg', full: 'assets/images/web/model-1.jpg', ar: 0.667, cap: 'Model portfolio', alt: 'Model portfolio shot outdoors' },
  { cat: 'portrait', thumb: 'assets/images/web/sm/model-2.jpg', full: 'assets/images/web/model-2.jpg', ar: 0.667, cap: 'Model portfolio', alt: 'Portrait of a smiling man wearing headphones in a garden' },
  { cat: 'portrait', thumb: 'assets/images/web/clean/sm/traditional-1.jpg', full: 'assets/images/web/clean/traditional-1.jpg', ar: 0.814, cap: 'Traditional portrait', alt: 'Woman in a purple saree holding a tray of clay pots' },
  { cat: 'portrait', thumb: 'assets/images/web/clean/sm/traditional-2.jpg', full: 'assets/images/web/clean/traditional-2.jpg', ar: 0.811, cap: 'Traditional portrait', alt: 'Woman in a purple saree posing between carved stone pillars' },
  { cat: 'creative', thumb: 'assets/images/web/sm/romantic-proposal.jpg', full: 'assets/images/web/romantic-proposal.jpg', ar: 0.75, cap: 'Proposal', alt: 'A proposal in a green meadow' },
  { cat: 'creative', thumb: 'assets/images/web/sm/rmoantic-walk.jpg', full: 'assets/images/web/rmoantic-walk.jpg', ar: 0.713, cap: 'Romantic walk', alt: 'A couple walking through a green meadow' },
  { cat: 'creative', thumb: 'assets/images/web/sm/flyby-1.jpg', full: 'assets/images/web/flyby-1.jpg', ar: 1, cap: 'Flyby', alt: 'A motion-blurred road at speed' },
  { cat: 'creative', thumb: 'assets/images/web/sm/torch-on-tree.jpg', full: 'assets/images/web/torch-on-tree.jpg', ar: 0.75, cap: 'Light painting', alt: 'Torch light painting on a tree' },
  { cat: 'creative', thumb: 'assets/images/web/sm/light-trails-khandala.jpg', full: 'assets/images/web/light-trails-khandala.jpg', ar: 1.779, cap: 'Light trails — Khandala', alt: 'Long-exposure light trails on the Khandala ghat road' },
  { cat: 'creative', thumb: 'assets/images/web/sm/architecture.jpg', full: 'assets/images/web/architecture.jpg', ar: 0.667, cap: 'Architecture at dusk', alt: 'A heritage building lit at dusk' },
  { cat: 'maternity', thumb: 'assets/images/web/sm/maternity-1.jpg', full: 'assets/images/web/maternity-1.jpg', ar: 0.562, cap: 'Maternity session', alt: 'Maternity portrait in a yellow saree among trees' },
  { cat: 'maternity', thumb: 'assets/images/web/sm/maternity-2.jpg', full: 'assets/images/web/maternity-2.jpg', ar: 0.562, cap: 'Maternity session', alt: 'Maternity portrait in a yellow and red saree' }
];

/* ── Websites ─────────────────────────────────────────
   Our own storefront — a live proof point, shown as "our own", never as a
   client. Every line below is something visible on the site itself. */
export const OWN_STORE = {
  key: 'vyro', name: 'VYRO', tag: 'D2C apparel store', kind: 'Our own store',
  href: 'https://vyrostore.in', domain: 'vyrostore.in',
  shot: 'assets/images/web/cases/vyrostore.jpg',
  line: 'Premium plain tees',
  intro: 'A premium plain-tee label we run ourselves — heavyweight 240gsm cotton in two fits, sold through its own storefront.',
  points: [
    'Two fits shown and priced side by side, with a launch-sale page built around them',
    'Order on the site or on WhatsApp, with free shipping and COD over ₹999',
    'Reviews, FAQ and 20-day returns built into the page, so buyers can decide without asking'
  ]
};

/* kind: 'Client work' is a real engagement; 'Concept' is a build made to
   show how we approach a brief. */
export const WEB_WORK = [
  {
    key: 'neoerp', name: 'NeoMediaWorks ERP', tag: 'Internal tool', kind: 'Client work', shot: 'assets/images/web/cases/neoerp.png',
    issue: 'Staff attendance and SSD inventory were tracked in spreadsheets. NeoMediaWorks needed a real system, not a bloated off-the-shelf ERP built for a completely different kind of business.',
    solution: 'A focused internal tool doing exactly two jobs — attendance logging and SSD inventory — built and shipped in three days.',
    result: 'Live in three days, running the business’s day-to-day since. Private tool — behind a login, so no public link.'
  },
  {
    key: 'chess', name: 'Chess', tag: 'Mobile web game', kind: 'Concept', href: 'work/chess/index.html',
    shot: 'assets/images/web/cases/chess.svg',
    issue: 'Chess apps online are either a desktop site squeezed onto a phone, or a native app behind an install and a sign-up.',
    solution: 'A touch-first board — tap to move, no drag required — pass-and-play, a from-scratch minimax opponent, and real clocks. No backend, installable straight from the browser.',
    result: 'A fully playable game that loads instantly and works offline once opened.'
  },
  {
    key: 'halo', name: 'Halo', tag: 'AI product landing', kind: 'Concept', href: 'work/halo.html',
    shot: 'assets/images/web/cases/halo.png',
    issue: 'A category launch with zero name recognition — the page has to do all the convincing before anyone tries the product.',
    solution: 'Dark, confident, benefit-first. One action above the fold, technical detail held back until asked for.',
    result: 'A reusable launch template — swap the copy in, ship the same day.'
  },
  {
    key: 'vivid', name: 'Vivid', tag: 'Agency one-pager', kind: 'Concept', href: 'work/vivid.html',
    shot: 'assets/images/web/cases/vivid.png',
    issue: 'A design studio wanted one page as loud as their portfolio, not a template with their logo dropped in.',
    solution: 'Oversized type, hard colour blocks, motion doing the talking instead of paragraphs.',
    result: 'A one-pager that reads like a show-reel.'
  },
  {
    key: 'pulse', name: 'Pulse', tag: 'Analytics dashboard', kind: 'Concept', href: 'work/pulse.html',
    shot: 'assets/images/web/cases/pulse.png',
    issue: 'Founders drowning in spreadsheets need the three numbers that matter, not forty.',
    solution: 'A calm dashboard — revenue, churn, invoices — one glance, no digging.',
    result: 'Data that answers the question before it gets asked.'
  },
  {
    key: 'ledgerly', name: 'Ledgerly', tag: 'Fintech SaaS', kind: 'Concept', href: 'work/ledgerly.html',
    shot: 'assets/images/web/cases/ledgerly.png',
    issue: 'Freelancers avoid bookkeeping until tax season panics them into it.',
    solution: 'A product page that sells calm, not features — set-asides handled automatically, said plainly.',
    result: 'Sign-up copy that trades jargon for relief.'
  },
  {
    key: 'forge', name: 'Forge', tag: 'Developer tool', kind: 'Concept', href: 'work/forge.html',
    shot: 'assets/images/web/cases/forge.png',
    issue: 'Dev tools get judged by their docs page and their terminal output, in that order.',
    solution: 'Dark theme, monospace throughout, a live-feeling deploy log instead of a hero illustration.',
    result: 'A page that looks like the tool it sells.'
  },
  {
    key: 'aperture', name: 'Aperture', tag: 'Editorial photo portfolio', kind: 'Concept', href: 'work/aperture.html',
    shot: 'assets/images/web/cases/aperture.png',
    issue: 'Photography portfolios usually compete with their own chrome — nav bars, filters, captions everywhere.',
    solution: 'Full-bleed images, serif type, almost nothing else on screen.',
    result: 'The work is left as the only decoration.'
  }
];

/* ── Proof ────────────────────────────────────────────
   Straight from a client's own analytics: accounts reached per day over 29
   days of organic posting, June 2026. The total is the sum of the days. */
export const RESULTS = {
  client: 'Jewellery retail · Pune',
  period: 'June 2026',
  days: 29,
  paid: 0,
  total: 16543,
  peak: { day: 6, value: 1288 },
  average: 570,
  aboveAverage: 126,
  series: [182, 156, 134, 284, 891, 1288, 886, 558, 617, 827, 1079, 896, 671, 714, 714, 1095, 825, 780, 540, 380, 285, 250, 540, 340, 350, 420, 450, 290, 101]
};

export const TESTIMONIALS = [
  {
    quote: 'Working with Vyatirikht changed how our business shows up online. The photography, the Instagram strategy, everything — done in days, not weeks. Our reach went from nothing to over 15,000 in a single month.',
    name: 'Jewellery client', role: 'Jewellery retail · Pune', result: '↑ 15,282 accounts reached · June 2026 · organic'
  },
  {
    quote: 'Working with CineTorque Films was an incredible experience. Their creativity, professionalism, and attention to detail transformed our vision into cinematic content that truly stood out. Every frame reflected passion and precision, and the final result exceeded our expectations.',
    name: 'Akshay Choudhari', role: 'Client · CineTorque Films', result: 'Cinematic visual storytelling — exceeded expectations'
  }
];

/* Marketing-led pieces from the journal — the ones that show the thinking
   behind the services above. */
export const JOURNAL = [
  { slug: 'instagram-reels-strategy-for-small-businesses-in-2026', title: 'Instagram Reels Strategy for Small Businesses in 2026', category: 'Social media', read: '6 min read', excerpt: 'Posting randomly and hoping for growth is not a strategy. How to build a Reels system that compounds.' },
  { slug: 'the-first-three-seconds-why-reels-live-or-die-at-the-hook', title: 'The First Three Seconds — Why Reels Live or Die at the Hook', category: 'Social media', read: '5 min read', excerpt: 'Nobody decides to watch a reel. They decide not to scroll past it — and that is won or lost in three seconds.' },
  { slug: 'google-maps-setup-for-small-businesses-the-complete-guide', title: 'Google Maps Setup for Small Businesses — The Complete Guide', category: 'Local discovery', read: '9 min read', excerpt: 'A properly set up Google Business Profile is the highest-ROI thing a local business can do for free.' },
  { slug: 'why-your-business-is-invisible-online-and-how-to-fix-it', title: 'Why Your Business Is Invisible Online — And How to Fix It', category: 'Getting found', read: '5 min read', excerpt: 'Most small businesses have something worth paying for. Here is why nobody can find it, and what to change.' },
  { slug: 'facebook-ads-for-local-businesses-what-works-in-india-in-2026', title: 'Facebook Ads for Local Businesses — What Works in India in 2026', category: 'Paid reach', read: '8 min read', excerpt: 'Facebook ads are not dead, just misunderstood. Most businesses waste budget on the wrong objective.' },
  { slug: 'reels-or-photos-for-products-what-actually-sells', title: 'Reels or Photos for Products — What Actually Sells', category: 'Content', read: '5 min read', excerpt: 'Reels and photos do completely different jobs. Knowing which to use, and when, is where product sales are won.' }
];

export const CONTACT_LINKS = [
  { href: WHATSAPP_HREF, label: 'WhatsApp', big: '+91 98901 01755', external: true },
  { href: 'mailto:2sloowwww@gmail.com', label: 'Email', big: '2sloowwww@gmail.com', external: false },
  { href: 'https://www.instagram.com/vyatirikht.xyz/', label: 'Instagram', big: '@vyatirikht.xyz', external: true },
  { href: 'https://www.youtube.com/@2sloowwwww/', label: 'YouTube', big: '@2sloowwwww', external: true }
];

/* Every count on the page is derived, so none of them can drift from the work. */
export const COUNTS = {
  films: FILMS.length,
  renders: RENDERS.length,
  photos: PHOTOS.length,
  builds: WEB_WORK.length + 1,
  articles: ARTICLE_COUNT
};

export const STATS = [
  { value: '2+', label: 'Years of client work' },
  { value: String(BRANDS.length), label: 'Brands worked with' },
  { value: String(COUNTS.films + COUNTS.renders), label: 'Films & 3D renders' },
  { value: String(COUNTS.photos), label: 'Photographs' }
];

export const FORM_SERVICES = ['Shooting', 'Editing', '3D & motion', 'Website', 'Digital marketing', 'Organic growth', 'Not sure yet'];

