/* Runs before `vite build`. Bumps the site's on-page version number
   (footer) by 0.01 on every build/deploy, rolling 0.99 -> 1.00, and
   writes it back so the new value gets baked into the built bundle. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, 'src', 'version.json');

const { version } = JSON.parse(fs.readFileSync(file, 'utf8'));
const [major, minor] = version.split('.').map(Number);

let nextMajor = major;
let nextMinor = minor + 1;
if (nextMinor > 99) { nextMajor += 1; nextMinor = 0; }

const next = `${nextMajor}.${String(nextMinor).padStart(2, '0')}`;
fs.writeFileSync(file, JSON.stringify({ version: next }) + '\n');

console.log(`bump-version: ${version} -> ${next}`);
