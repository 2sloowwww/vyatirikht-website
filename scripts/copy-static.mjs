/* Runs after `vite build`. The homepage is a built React app now, but
   every other page (blog, dashboard, vault, login, the six work/*.html
   demos…) is still plain static HTML that ships as-is. This copies
   everything that isn't build tooling or app source into dist/,
   alongside the built index.html, so the deployed output is the same
   mixed static+app site it was before — just with a compiled home. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

const EXCLUDE = new Set([
  'node_modules', 'src', 'dist', '.git', '.vercel', '.claude',
  'package.json', 'package-lock.json', 'vite.config.js', 'scripts',
  'index.html',           // the source entry — dist/index.html is the built one
  '.gitignore', '.gitattributes', '.env.local', '.env',
  '.image-map.json'
]);

for (const name of fs.readdirSync(root)) {
  if (EXCLUDE.has(name) || name.startsWith('.env')) continue;
  fs.cpSync(path.join(root, name), path.join(dist, name), { recursive: true });
}

console.log('copy-static: merged static pages/assets into dist/');
