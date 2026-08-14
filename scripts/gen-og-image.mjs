/* One-off asset generator, not part of the build pipeline — run manually
   (`node scripts/gen-og-image.mjs`) whenever the OG/share card needs a
   refresh. Builds a 1200x630 card matching the site's own brutalist
   black/white system (instead of shipping a random product photo as the
   link preview), then rasterizes it to PNG with sharp: social crawlers
   (Facebook/LinkedIn/WhatsApp) have unreliable SVG support for og:image,
   so a real raster file is required. Fonts are embedded as base64 so
   librsvg (sharp's SVG renderer) doesn't need network access to draw
   Anton/JetBrains Mono correctly. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'assets', 'images', 'social');
fs.mkdirSync(outDir, { recursive: true });

const antonB64 = fs.readFileSync(path.join(root, 'scripts', 'fonts', 'Anton-Regular.ttf')).toString('base64');
const monoB64 = fs.readFileSync(path.join(root, 'scripts', 'fonts', 'JetBrainsMono-Bold.ttf')).toString('base64');

function buildSvg({ embedFonts }) {
  const fontFaces = embedFonts
    ? `
      @font-face { font-family: 'Anton'; src: url(data:font/ttf;base64,${antonB64}) format('truetype'); }
      @font-face { font-family: 'JetBrains Mono'; src: url(data:font/ttf;base64,${monoB64}) format('truetype'); font-weight: 700; }
    `
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <style>
    ${fontFaces}
    .display { font-family: 'Anton', 'Archivo Black', Impact, sans-serif; fill: #000; }
    .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 700; }
  </style>

  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="#000000" stroke-width="4"/>

  <rect x="72" y="88" width="30" height="4" fill="#000000"/>
  <text x="112" y="100" class="mono" font-size="15" letter-spacing="3" fill="#000000">VYATIRIKHT</text>
  <text x="112" y="122" class="mono" font-size="12" letter-spacing="2" fill="#6E6E6E">PUNE, INDIA</text>

  <text x="70" y="270" class="display" font-size="118">I BUILD,</text>
  <text x="70" y="392" class="display" font-size="118" textLength="980" lengthAdjust="spacingAndGlyphs">THEN I SHOOT.</text>

  <text x="72" y="452" class="mono" font-size="17" letter-spacing="0.5" fill="#4A4A4A">Freelance developer, 2+ years — plus product, jewellery,</text>
  <text x="72" y="478" class="mono" font-size="17" letter-spacing="0.5" fill="#4A4A4A">automotive and event photography, and brand films.</text>

  <g>
    <rect x="856" y="488" width="26" height="26" fill="#000000"/>
    <rect x="884" y="488" width="26" height="26" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
    <rect x="912" y="488" width="26" height="26" fill="#000000"/>
    <rect x="940" y="488" width="26" height="26" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
    <rect x="968" y="488" width="26" height="26" fill="#000000"/>
    <rect x="996" y="488" width="26" height="26" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
  </g>

  <text x="1128" y="559" class="mono" font-size="17" letter-spacing="0.5" text-anchor="end" fill="#000000">vyatirikht.xyz</text>
</svg>`;
}

// Clean, readable source kept for future manual edits — no embedded font data.
fs.writeFileSync(path.join(outDir, 'og-card.svg'), buildSvg({ embedFonts: false }));

// Font-embedded version, rasterized to the PNG that actually ships in og:image.
const rasterSvg = buildSvg({ embedFonts: true });
await sharp(Buffer.from(rasterSvg)).png().toFile(path.join(outDir, 'og-card.png'));

console.log('gen-og-image: wrote assets/images/social/og-card.svg and og-card.png');
