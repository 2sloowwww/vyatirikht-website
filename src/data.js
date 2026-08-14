export const TECH_STACK = [
  { name: 'HTML5', icon: 'devicon-html5-plain' },
  { name: 'CSS3', icon: 'devicon-css3-plain' },
  { name: 'JavaScript', icon: 'devicon-javascript-plain' },
  { name: 'TypeScript', icon: 'devicon-typescript-plain' },
  { name: 'React', icon: 'devicon-react-original' },
  { name: 'Node.js', icon: 'devicon-nodejs-plain' },
  { name: 'Python', icon: 'devicon-python-plain' },
  { name: 'Vite', icon: 'devicon-vitejs-plain' },
  { name: 'Supabase', icon: 'devicon-supabase-plain' },
  { name: 'PostgreSQL', icon: 'devicon-postgresql-plain' },
  { name: 'Git', icon: 'devicon-git-plain' },
  { name: 'GitHub', icon: 'devicon-github-original' },
  { name: 'Vercel', icon: 'devicon-vercel-original' },
  { name: 'VS Code', icon: 'devicon-vscode-plain' },
  { name: 'Docker', icon: 'devicon-docker-plain' },
  { name: 'Nginx', icon: 'devicon-nginx-original' },
  { name: 'Linux', icon: 'devicon-linux-plain' },
  { name: 'Kali Linux', icon: 'devicon-kalilinux-original' },
  { name: 'Bash', icon: 'devicon-bash-plain' }
];

/* No icon set carries real logos for these — most are regional/
   automotive/consumer brands outside any open icon library's scope.
   Rendered as clean typographic marks instead of faked logos. */
export const BRANDS = [
  { name: 'Flipkart', kind: 'E-commerce' },
  { name: 'Castrol', kind: 'Automotive' },
  { name: 'Royal Enfield', kind: 'Automotive' },
  { name: 'Coolberg', kind: 'Beverage' },
  { name: '8Moto', kind: 'Motorsport' },
  { name: 'Bhagwati Jewellers', kind: 'Jewellery' },
  { name: 'CineTorque Films', kind: 'Production' }
];

export const SERVICES = [
  { num: '01', name: 'Development', desc: 'Sites and small apps, built from scratch — React, Node, Python, Supabase. This one included.' },
  { num: '02', name: 'Workflow management', desc: 'The boring plumbing between tools — Notion, automations, internal dashboards — set up once so nobody copy-pastes between five tabs.' },
  { num: '03', name: 'Film & motion', desc: 'Brand films, product films, reels. Direction through to the final grade.' }
];

export const WEB_WORK = [
  {
    key: 'neoerp', name: 'NeoMediaWorks ERP', tag: 'Internal tool', kind: 'Client work', shot: 'assets/images/web/cases/neoerp.png',
    issue: 'Staff attendance and SSD inventory were tracked in spreadsheets. NeoMediaWorks needed a real system, not a bloated off-the-shelf ERP built for a completely different kind of business.',
    solution: 'A focused internal tool doing exactly two jobs — attendance logging and SSD inventory — built and shipped in three days.',
    result: 'Live in three days, running the business’s day-to-day since. Private tool — logged in behind auth, so no public link here.'
  },
  {
    key: 'chess', name: 'Chess', tag: 'Mobile web game', kind: 'Self-directed', href: 'work/chess/index.html',
    shot: 'assets/images/web/cases/chess.svg',
    issue: 'Chess apps online are either a desktop site squeezed onto a phone, or a native app behind an install and a sign-up.',
    solution: 'A touch-first board — tap to move, no drag required — pass-and-play, a from-scratch minimax opponent, and real clocks. No backend, installable straight from the browser.',
    result: 'A fully playable game that loads instantly and works offline once opened.'
  },
  {
    key: 'halo', name: 'Halo', tag: 'AI product landing', kind: 'Self-directed', href: 'work/halo.html',
    shot: 'assets/images/web/cases/halo.png',
    issue: 'A category launch with zero name recognition — the page has to do all the convincing before anyone tries the product.',
    solution: 'Dark, confident, benefit-first. One action above the fold, technical detail held back until asked for.',
    result: 'A reusable launch template — swap the copy in, ship the same day.'
  },
  {
    key: 'vivid', name: 'Vivid', tag: 'Agency one-pager', kind: 'Self-directed', href: 'work/vivid.html',
    shot: 'assets/images/web/cases/vivid.png',
    issue: 'A design studio wanted one page as loud as their portfolio, not a template with their logo dropped in.',
    solution: 'Oversized type, hard colour blocks, motion doing the talking instead of paragraphs.',
    result: 'A one-pager that reads like a show-reel.'
  },
  {
    key: 'pulse', name: 'Pulse', tag: 'Analytics dashboard', kind: 'Self-directed', href: 'work/pulse.html',
    shot: 'assets/images/web/cases/pulse.png',
    issue: 'Founders drowning in spreadsheets need the three numbers that matter, not forty.',
    solution: 'A calm dashboard — revenue, churn, invoices — one glance, no digging.',
    result: 'Data that answers the question before it gets asked.'
  },
  {
    key: 'ledgerly', name: 'Ledgerly', tag: 'Fintech SaaS', kind: 'Self-directed', href: 'work/ledgerly.html',
    shot: 'assets/images/web/cases/ledgerly.png',
    issue: 'Freelancers avoid bookkeeping until tax season panics them into it.',
    solution: 'A product page that sells calm, not features — set-asides handled automatically, said plainly.',
    result: 'Sign-up copy that trades jargon for relief.'
  },
  {
    key: 'forge', name: 'Forge', tag: 'Developer tool', kind: 'Self-directed', href: 'work/forge.html',
    shot: 'assets/images/web/cases/forge.png',
    issue: "Dev tools get judged by their docs page and their terminal output, in that order.",
    solution: 'Dark theme, monospace throughout, a live-feeling deploy log instead of a hero illustration.',
    result: 'A page that looks like the tool it sells.'
  },
  {
    key: 'aperture', name: 'Aperture', tag: 'Editorial photo portfolio', kind: 'Self-directed', href: 'work/aperture.html',
    shot: 'assets/images/web/cases/aperture.png',
    issue: 'Photography portfolios usually compete with their own chrome — nav bars, filters, captions everywhere.',
    solution: 'Full-bleed images, serif type, almost nothing else on screen.',
    result: 'The work is left as the only decoration.'
  }
];

export const STILLS = [
  { full: 'assets/images/web/jwellery-3.jpg', thumb: 'assets/images/web/sm/jwellery-3.jpg', cap: 'Emerald cocktail ring — studio', alt: 'Emerald cocktail ring on crimson fabric', tag: 'Jewellery', w: 1537, h: 1023 },
  { full: 'assets/images/web/product-7.jpg', thumb: 'assets/images/web/sm/product-7.jpg', cap: 'Coolberg — dark botanical', alt: 'Coolberg bottle lit against a dark botanical background', tag: 'Product', w: 1920, h: 2880 },
  { full: 'assets/images/web/smirnoff.jpg', thumb: 'assets/images/web/sm/smirnoff.jpg', cap: 'Smirnoff — dark field', alt: 'Smirnoff bottle, dark-field studio lighting', tag: 'Product', w: 1920, h: 2559 },
  { full: 'assets/images/web/watchproduct.jpg', thumb: 'assets/images/web/sm/watchproduct.jpg', cap: 'Watch — precision detail', alt: 'Macro detail of a watch dial', tag: 'Product', w: 1920, h: 2560 },
  { full: 'assets/images/web/model-2.jpg', thumb: 'assets/images/web/sm/model-2.jpg', cap: 'Model portfolio — series II', alt: 'Editorial portrait', tag: 'Portrait', w: 1920, h: 2880 },
  { full: 'assets/images/web/traditional-1.jpg', thumb: 'assets/images/web/sm/traditional-1.jpg', cap: 'Heritage series', alt: 'Portrait in traditional dress', tag: 'Portrait', w: 1920, h: 2557 },
  { full: 'assets/images/web/maternity-1.jpg', thumb: 'assets/images/web/sm/maternity-1.jpg', cap: 'New beginnings', alt: 'Maternity portrait in soft light', tag: 'Maternity', w: 1920, h: 3416 },
  { full: 'assets/images/web/2xzx10rs.jpg', thumb: 'assets/images/web/sm/2xzx10rs.jpg', cap: 'Kawasaki ZX-10R', alt: 'Two Kawasaki ZX-10R superbikes', tag: 'Automotive', w: 1920, h: 1440 },
  { full: 'assets/images/web/bike-3.jpg', thumb: 'assets/images/web/sm/bike-3.jpg', cap: 'Pune Offroad — pit detail', alt: 'Race bike and helmet in the pit after a motocross round', tag: 'Motorsport', w: 1920, h: 2560 },
  { full: 'assets/images/web/light-trails-khandala.jpg', thumb: 'assets/images/web/sm/light-trails-khandala.jpg', cap: 'Light trails — Khandala', alt: 'Long-exposure light trails on the Khandala ghats', tag: 'Long exposure', w: 1920, h: 1079 },
  { full: 'assets/images/web/djstage-2.jpg', thumb: 'assets/images/web/sm/djstage-2.jpg', cap: 'Live event — DJ stage', alt: 'DJ controller mid-set under teal and amber light', tag: 'Events', w: 1920, h: 2560 }
];

export const FILMS = [
  { key: 'jewellery', video: 'assets/videos/web/jewellery.mp4', poster: 'assets/videos/poster/jewellery.jpg', title: 'Jewellery — product film', label: 'Product film · Jewellery', alt: 'Jewellery product film' },
  { key: 'cinematic', video: 'assets/videos/web/cinematic.mp4', poster: 'assets/videos/poster/cinematic.jpg', title: 'Cinematic study', label: 'Cinematography · Study', alt: 'Cinematic study' },
  { key: 'royalenfield', video: 'assets/videos/web/royalenfield.mp4', poster: 'assets/videos/poster/royalenfield.jpg', title: 'Royal Enfield — store film', label: 'Brand film · Royal Enfield', alt: 'Royal Enfield store film' },
  { key: 'coolberg', video: 'assets/videos/web/coolberg.mp4', poster: 'assets/videos/poster/coolberg.jpg', title: 'Coolberg — product film', label: 'Product film · Coolberg', alt: 'Coolberg product film' },
  { key: 'karwa', video: 'assets/videos/web/karwa.mp4', poster: 'assets/videos/poster/karwa.jpg', title: 'Karwa Chauth — campaign', label: 'Reel · Karwa Chauth', alt: 'Karwa Chauth campaign reel' }
];

export const JOURNAL = [
  { slug: 'staying-informed-without-drowning-a-creators-media-diet', title: "Staying Informed Without Drowning — A Creator's Media Diet", category: 'Tech Industry', read: '5 min read', excerpt: "Consuming tutorials, tech and world news deliberately, without letting the feed run the day." },
  { slug: 'series-two-what-writing-through-an-uncertain-season-taught-me', title: 'Series Two — What Writing Through an Uncertain Season Taught Me', category: 'Entrepreneurship', read: '6 min read', excerpt: 'Thirty more posts, written through a genuinely tense few months. What changed in the writing, the business, and the thinking.' },
  { slug: 'technological-self-reliance-what-it-really-takes', title: 'Technological Self-Reliance — What It Really Takes', category: 'General Knowledge', read: '5 min read', excerpt: '"Atmanirbhar" is a slogan everyone repeats. What genuine self-reliance actually requires, for a country and for one person.' },
  { slug: 'trade-wars-and-tariffs-explained-in-plain-terms', title: 'Trade Wars and Tariffs — Explained in Plain Terms', category: 'Business & Geopolitics', read: '5 min read', excerpt: 'Behind the jargon is a simple mechanism that quietly reaches the price of everything you buy.' },
  { slug: 'finding-your-style-why-your-early-work-should-look-copied', title: 'Finding Your Style — Why Your Early Work Should Look Copied', category: 'Photography', read: '5 min read', excerpt: 'Almost nobody tells you the uncomfortable truth about how a signature style actually happens.' },
  { slug: 'planning-your-first-long-ride-touring-prep-that-actually-matters', title: 'Planning Your First Long Ride — Touring Prep That Actually Matters', category: 'Motorcycle Education', read: '6 min read', excerpt: 'The reality of a first long tour is decided days before you leave, in the prep most new riders skip.' }
];

export const CONTACT_LINKS = [
  { href: 'https://wa.me/919890101755', label: 'WhatsApp', big: '+91 98901 01755', external: true },
  { href: 'mailto:2sloowwww@gmail.com', label: 'Email', big: '2sloowwww@gmail.com', external: false },
  { href: 'https://www.instagram.com/vyatirikht.xyz/', label: 'Instagram', big: '@vyatirikht.xyz', external: true },
  { href: 'https://www.youtube.com/@2sloowwwww/', label: 'YouTube', big: '@2sloowwwww', external: true },
  { href: 'https://www.linkedin.com/in/2sloowwww/', label: 'LinkedIn', big: 'Jitendra Kulkarni', external: true }
];
