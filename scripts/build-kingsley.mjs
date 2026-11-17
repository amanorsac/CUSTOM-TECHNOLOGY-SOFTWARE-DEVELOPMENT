// Builds the Kingsley Anyenor draft pages: npm run build:kingsley
// Each scripts/kingsley/pages/*.mjs exports render(ctx) -> Array<{ path, html }>
// with ctx = { catalogue, layout, img }. `path` is relative to /preview/kingsley/
// ('' for home); the page is written to public/preview/kingsley/<path>/index.html.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { layout, img } from './kingsley/layout.mjs';
import { validateCatalogue } from '../public/assets/preview/kingsley/js/catalogue.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(root, 'scripts/kingsley/pages');
const outDir = path.join(root, 'public/preview/kingsley');

const catalogue = JSON.parse(readFileSync(path.join(root, 'public/assets/preview/kingsley/data/catalogue.json'), 'utf8'));
const problems = validateCatalogue(catalogue);
if (problems.length) throw new Error(`catalogue.json has problems:\n  ${problems.join('\n  ')}`);
const ctx = { catalogue, layout, img };

let count = 0;
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = await import(pathToFileURL(path.join(pagesDir, file)).href);
  if (typeof mod.render !== 'function') throw new Error(`${file} does not export render()`);
  for (const { path: rel, html } of mod.render(ctx)) {
    const clean = String(rel).replace(/^\/+|\/+$/g, '');
    if (clean.split('/').some((seg) => seg === '..')) throw new Error(`${file}: bad path "${rel}"`);
    const dir = path.join(outDir, clean);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), html);
    console.log(`/preview/kingsley/${clean ? clean + '/' : ''}`);
    count++;
  }
}
console.log(`${count} pages built`);
