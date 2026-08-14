/* One-off migration: every blog/<slug>.html (and the
   build-article-pages.js template that generates them) still carries
   the nav/footer markup from an older iteration of the site —
   `#main-nav` / `.nav-logo` / `.hamburger`, styled by nothing in the
   current style.css (which only knows `#site-nav` / `.nav-mark`).
   That's why the nav rendered as a giant unstyled logo and a bare
   link list. Same story for the footer (`.footer-divider-row`, styled
   nowhere, with inline colours assuming a dark background it doesn't
   have). This swaps both blocks for the current working markup
   (identical to what blog.html already uses) and points the script
   tag at site.js instead of the old main.js — main.js's only job on
   these pages was driving the now-replaced hamburger, plus injecting
   a dark-mode toggle that style.css dropped support for already.
   Run once with `node scripts/fix-article-chrome.mjs`. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const OLD_NAV = `<nav id="main-nav">
  <a href="../index.html" class="nav-logo"><img src="../assets/images/logo/Logo_transparent.png" alt="Vyatirikht" class="nav-logo-img" width="217" height="363"></a>
  <ul class="nav-links">
    <li><a href="../blog.html" class="nav-blog">Blog</a></li>
    <li><a href="../index.html#about">About</a></li>
    <li><a href="../index.html#services">Services</a></li>
    <li><a href="../index.html#web">Work</a></li>
    <li><a href="../vault.html">Vault</a></li>
    <li><a href="../index.html#contact" class="nav-cta">Connect</a></li>
  </ul>
  <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="../blog.html" onclick="closeMobile()">Blog</a>
  <a href="../index.html#about" onclick="closeMobile()">About</a>
  <a href="../index.html#services" onclick="closeMobile()">Services</a>
  <a href="../index.html#web" onclick="closeMobile()">Work</a>
  <a href="../vault.html" onclick="closeMobile()">Vault</a>
  <a href="../index.html#contact" onclick="closeMobile()">Connect</a>
</div>`;

const NEW_NAV = `<nav id="site-nav">
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
</nav>`;

const OLD_FOOTER = `<footer>
  <div class="footer-divider-row" style="border-top:none;">
    <span class="footer-copy">© 2026 VYATIRIKHT · <a href="../index.html" style="color:var(--accent);text-decoration:none;">Main site</a> · <a href="../blog.html" style="color:var(--accent);text-decoration:none;">Blog</a> · <a href="../terms.html" style="color:rgba(255,255,255,0.32);text-decoration:none;">Terms</a> · <a href="../privacy.html" style="color:rgba(255,255,255,0.32);text-decoration:none;">Privacy</a></span>
  </div>
</footer>`;

const NEW_FOOTER = `<footer class="site-foot">
  <div class="wrap">
    <span>© 2026 Vyatirikht · Pune, India</span>
    <nav>
      <a href="../index.html#web">Work</a>
      <a href="../index.html#contact">Contact</a>
      <a href="../privacy.html">Privacy</a>
      <a href="../terms.html">Terms</a>
    </nav>
  </div>
</footer>`;

function patch(file) {
  let src = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (src.includes(OLD_NAV)) { src = src.replace(OLD_NAV, NEW_NAV); changed = true; }
  if (src.includes(OLD_FOOTER)) { src = src.replace(OLD_FOOTER, NEW_FOOTER); changed = true; }
  if (src.includes('../main.js')) { src = src.replaceAll('../main.js', '../site.js'); changed = true; }
  if (changed) fs.writeFileSync(file, src);
  return changed;
}

let count = 0;
const blogDir = path.join(root, 'blog');
for (const name of fs.readdirSync(blogDir)) {
  if (!name.endsWith('.html')) continue;
  if (patch(path.join(blogDir, name))) count++;
}
if (patch(path.join(root, 'build-article-pages.js'))) count++;

console.log('fix-article-chrome: patched', count, 'files');
