// Copies a client draft's self-hosted fonts: node scripts/client-assets.mjs kezia-woods
import { copyFileSync, mkdirSync } from 'node:fs';

const CLIENTS = {
  'kezia-woods': [
    ['@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2', 'dm-serif-400.woff2'],
    ['@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff2', 'dm-serif-400-italic.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-400-normal.woff2', 'newsreader-400.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-400-italic.woff2', 'newsreader-400-italic.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-500-normal.woff2', 'newsreader-500.woff2'],
    ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'plex-mono-400.woff2'],
    ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'plex-mono-500.woff2'],
  ],
};

const slug = process.argv[2] || 'kezia-woods';
const fonts = CLIENTS[slug];
if (!fonts) throw new Error(`unknown client ${slug}`);
const out = `public/assets/preview/${slug}/fonts`;
mkdirSync(out, { recursive: true });
for (const [src, name] of fonts) copyFileSync(`node_modules/${src}`, `${out}/${name}`);
console.log(`copied ${fonts.length} fonts to ${out}`);
