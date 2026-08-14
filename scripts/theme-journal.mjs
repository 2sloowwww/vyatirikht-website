/* One-off migration: point blog.html, every blog/<slug>.html, and the
   build-article-pages.js template at the new journal-theme.css and
   font stack, instead of the old Cormorant/DM Sans/DM Mono trio.
   Run once with `node scripts/theme-journal.mjs`. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const OLD_FONT_RE = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Cormorant\+Garamond[^"]*" rel="stylesheet">/;
const NEW_FONT = '<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,700&display=swap" rel="stylesheet">';

function patch(file, cssHref) {
  let src = fs.readFileSync(file, 'utf8');
  if (!OLD_FONT_RE.test(src)) return false;
  src = src.replace(OLD_FONT_RE, NEW_FONT);

  const themeLink = `<link rel="stylesheet" href="${cssHref}">`;
  if (!src.includes(themeLink)) {
    // Insert right after the LAST stylesheet link before </head>.
    const headEnd = src.indexOf('</head>');
    const before = src.slice(0, headEnd);
    const after = src.slice(headEnd);
    src = before.replace(/(\n)(?=[^\n]*<\/head>)/, '') + after; // no-op guard
    src = before + '  ' + themeLink + '\n' + after;
  }
  fs.writeFileSync(file, src);
  return true;
}

let count = 0;

if (patch(path.join(root, 'blog.html'), 'journal-theme.css')) count++;

const blogDir = path.join(root, 'blog');
for (const name of fs.readdirSync(blogDir)) {
  if (!name.endsWith('.html')) continue;
  if (patch(path.join(blogDir, name), '../journal-theme.css')) count++;
}

if (patch(path.join(root, 'build-article-pages.js'), '../journal-theme.css')) count++;

console.log('theme-journal: patched', count, 'files');
