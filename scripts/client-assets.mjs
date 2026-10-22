// Builds a client draft's self-hosted assets: node scripts/client-assets.mjs <slug>
//   kezia-woods  fonts, plus any photos found in assets-src/kezia-woods/<slot>.(jpg|png|webp) -> img/<slot>.webp
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const CLIENTS = {
  'kezia-woods': {
    fonts: [
      ['@fontsource/bodoni-moda/files/bodoni-moda-latin-500-normal.woff2', 'bodoni-500.woff2'],
      ['@fontsource/bodoni-moda/files/bodoni-moda-latin-500-italic.woff2', 'bodoni-500-italic.woff2'],
      ['@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2', 'dm-sans-400.woff2'],
      ['@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2', 'dm-sans-500.woff2'],
    ],
    // Photo slots (docs/image-prompts/kezia-woods.md): stand-ins now, her own photos later.
    photos: ['hero-light', 'restaurant', 'restaurant-detail', 'office', 'office-detail', 'classroom', 'classroom-detail'],
  },
};

const slug = process.argv[2] || 'kezia-woods';
const client = CLIENTS[slug];
if (!client) throw new Error(`unknown client ${slug}`);
const base = `public/assets/preview/${slug}`;
mkdirSync(`${base}/fonts`, { recursive: true });
for (const [src, name] of client.fonts) copyFileSync(`node_modules/${src}`, `${base}/fonts/${name}`);
console.log(`copied ${client.fonts.length} fonts to ${base}/fonts`);

const found = (client.photos || []).map((p) => [p, ['jpg', 'jpeg', 'png', 'webp'].map((e) => `assets-src/${slug}/${p}.${e}`).find(existsSync)]).filter(([, f]) => f);
if (!found.length) console.log('no photos yet');
else {
  const { default: sharp } = await import('sharp');
  mkdirSync(`${base}/img`, { recursive: true });
  for (const [name, file] of found) {
    const info = await sharp(file).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${base}/img/${name}.webp`);
    console.log(`${name}.webp ${info.width}x${info.height}`);
  }
}
