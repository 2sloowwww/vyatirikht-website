/* ══════════════════════════════════════════════════════
   Generate one real page per article.

   WHY THIS EXISTS
   Every article used to live on blog.html as #post-N. A fragment is
   not a URL — Google treats blog.html#post-1 and blog.html#post-90 as
   the same page, so 90 articles competed as a single result. This
   emits blog/<slug>.html for each one, so each can rank on its own
   terms, and rewrites sitemap.xml to list them all.

   RUN IT
     node build-article-pages.js

   Re-run whenever articles are added. It overwrites what it made and
   leaves everything else alone.

   SOURCE OF TRUTH
   Reads articles.json (extracted from blog.html). Articles that live
   only in the database are not included — export them to the same
   shape and concatenate if you want those too.
══════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const SITE = 'https://vyatirikht.xyz';
const OUT_DIR = path.join(__dirname, 'blog');
const DATA = process.argv[2];

if (!DATA || !fs.existsSync(DATA)) {
  console.error('Usage: node build-article-pages.js <articles.json>');
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(DATA, 'utf8'));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
/* Meta descriptions are truncated by search engines around 155–160
   characters. Cut on a word boundary rather than mid-word. */
function metaDesc(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= 155) return t;
  return t.slice(0, 152).replace(/\s+\S*$/, '') + '…';
}
function humanDate(iso) {
  const M = ['January','February','March','April','May','June','July',
             'August','September','October','November','December'];
  const d = new Date(iso);
  const ist = new Date(d.getTime() + 330 * 60000);
  return ist.getUTCDate() + ' ' + M[ist.getUTCMonth()] + ' ' + ist.getUTCFullYear();
}

/* Newest first, so prev/next read chronologically. */
const sorted = rows.slice().sort((a, b) => new Date(b.publish_at) - new Date(a.publish_at));

function page(row, prev, next) {
  const url = SITE + '/blog/' + row.slug + '.html';
  const desc = metaDesc(row.excerpt);
  const img = row.cover_image ? SITE + '/' + row.cover_image : SITE + '/assets/images/web/product-7.jpg';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(row.title)} — VYATIRIKHT</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#0B6623">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" href="../assets/images/logo/Logo_transparent.png">

  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(row.title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${esc(img)}">
  <meta property="og:site_name" content="Vyatirikht">
  <meta property="og:locale" content="en_IN">
  <meta property="article:published_time" content="${row.publish_at}">
  <meta property="article:section" content="${esc(row.category)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(row.title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${esc(img)}">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${JSON.stringify(row.title)},
    "description": ${JSON.stringify(desc)},
    "datePublished": "${row.publish_at}",
    "dateModified": "${row.publish_at}",
    "articleSection": ${JSON.stringify(row.category)},
    "inLanguage": "en-IN",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" },
    "author": { "@type": "Person", "name": "Jitendra Kulkarni" },
    "publisher": {
      "@type": "Organization",
      "name": "Vyatirikht",
      "url": "${SITE}/"
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/" },
      { "@type": "ListItem", "position": 2, "name": "Journal", "item": "${SITE}/blog.html" },
      { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(row.title)}, "item": "${url}" }
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../policy.css">
  <script>
    (function () {
      try {
        if (localStorage.getItem('vy-theme') === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="../journal-theme.css">
</head>
<body>

<nav id="site-nav">
  <a href="../index.html" class="nav-mark">
    <img src="../assets/images/logo/Logo_transparent.png" alt="" width="217" height="363">
    <span>Vyatirikht</span>
  </a>
  <button class="nav-burger" id="navBurger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  <div class="nav-links" id="navLinks">
    <a href="../index.html#web">Work</a>
    <a href="../blog.html">Journal</a>
    <a href="../index.html#contact">Contact</a>
  </div>
</nav>

<div class="pol-hero">
  <div class="orb orb-1" style="width:340px;height:340px;top:-110px;left:-70px;background:radial-gradient(circle,rgba(8,88,32,0.14),transparent 70%);"></div>
  <div class="pol-hero-inner">
    <nav class="art-crumbs" aria-label="Breadcrumb">
      <a href="../index.html">Home</a> <span>/</span>
      <a href="../blog.html">Journal</a> <span>/</span>
      <span>${esc(row.category)}</span>
    </nav>
    <h1 class="pol-title">${esc(row.title)}</h1>
    <div class="pol-updated">${esc(row.category)} · ${humanDate(row.publish_at)} · ${esc(row.read_time)} read</div>
  </div>
</div>

<div class="pol-wrap">
  <article class="pol-body">
    <div class="pol-note"><p>${esc(row.excerpt)}</p></div>

${row.body}

    <div class="pol-contact">
      <h2>Working on something like this?</h2>
      <p>Vyatirikht is a creative studio in Pune — photography, film, branding and social media.</p>
      <p><a href="../index.html#contact">Tell us about the project</a> or read more in the <a href="../blog.html">journal</a>.</p>
    </div>

    <nav class="art-nav" aria-label="More articles">
      ${prev ? `<a class="art-nav-link" href="${prev.slug}.html"><span>← Previous</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="art-nav-link is-next" href="${next.slug}.html"><span>Next →</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
    </nav>
  </article>
</div>

<footer class="site-foot">
  <div class="wrap">
    <span>© 2026 Vyatirikht · Pune, India</span>
    <nav>
      <a href="../index.html#web">Work</a>
      <a href="../index.html#contact">Contact</a>
      <a href="../privacy.html">Privacy</a>
      <a href="../terms.html">Terms</a>
    </nav>
  </div>
</footer>

<script src="../site.js" defer></script>
</body>
</html>
`;
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
sorted.forEach((row, i) => {
  const prev = sorted[i + 1] || null;   // older
  const next = sorted[i - 1] || null;   // newer
  fs.writeFileSync(path.join(OUT_DIR, row.slug + '.html'), page(row, prev, next));
  written++;
});

/* ── Rebuild sitemap.xml with the static pages + every article ── */
const STATIC = [
  ['/', 'weekly', '1.0'],
  ['/blog.html', 'daily', '0.9'],
  ['/vault.html', 'weekly', '0.9'],
  ['/support.html', 'monthly', '0.5'],
  ['/terms.html', 'yearly', '0.3'],
  ['/privacy.html', 'yearly', '0.3'],
  ['/refund.html', 'yearly', '0.3']
];

const urls = STATIC.map(([loc, freq, pri]) =>
  `  <url>\n    <loc>${SITE}${loc}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`
).concat(sorted.map(r =>
  `  <url>\n    <loc>${SITE}/blog/${r.slug}.html</loc>\n    <lastmod>${r.publish_at.slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
)).join('\n');

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED by build-article-pages.js — do not hand-edit.
  Re-run the script after adding articles.
  login.html and dashboard.html are deliberately absent (noindex).
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

console.log('article pages written :', written, '-> blog/');
console.log('sitemap urls          :', STATIC.length + sorted.length);
