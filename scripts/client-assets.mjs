// Builds a client draft's self-hosted assets: node scripts/client-assets.mjs <slug>
//   kezia-woods     fonts
//   miras-sartorial fonts, cropped and resized photos from assets-src/miras-sartorial/, the WhatsApp QR code
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const FONTS = {
  'kezia-woods': [
    ['@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2', 'dm-serif-400.woff2'],
    ['@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff2', 'dm-serif-400-italic.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-400-normal.woff2', 'newsreader-400.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-400-italic.woff2', 'newsreader-400-italic.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-500-normal.woff2', 'newsreader-500.woff2'],
    ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'plex-mono-400.woff2'],
    ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'plex-mono-500.woff2'],
  ],
  'miras-sartorial': [
    ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2', 'cormorant-500.woff2'],
    ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2', 'cormorant-500-italic.woff2'],
    ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2', 'cormorant-600.woff2'],
    ['@fontsource/jost/files/jost-latin-400-normal.woff2', 'jost-400.woff2'],
    ['@fontsource/jost/files/jost-latin-500-normal.woff2', 'jost-500.woff2'],
  ],
};

const slug = process.argv[2] || 'kezia-woods';
const fonts = FONTS[slug];
if (!fonts) throw new Error(`unknown client ${slug}`);
const base = `public/assets/preview/${slug}`;
mkdirSync(`${base}/fonts`, { recursive: true });
for (const [src, name] of fonts) copyFileSync(`node_modules/${src}`, `${base}/fonts/${name}`);
console.log(`copied ${fonts.length} fonts to ${base}/fonts`);

if (slug === 'miras-sartorial') {
  const { default: sharp } = await import('sharp');
  const { default: QRCode } = await import('qrcode');
  const SRC = 'assets-src/miras-sartorial/';
  const OUT = `${base}/img/`;
  mkdirSync(OUT, { recursive: true });
  const webp = async (src, name, width, crop) => {
    let s = sharp(SRC + src);
    if (crop) s = s.extract(crop);
    const info = await s.resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OUT}${name}.webp`);
    console.log(`${name}.webp ${info.width}x${info.height}`);
  };
  // The tall models photo holds four looks side by side: yellow floral, purple swirl, pink swirl, multi abstract.
  const tall = await sharp(SRC + 'models-tall.webp').metadata();
  const q = tall.width / 4;
  const quarter = (i) => ({ left: Math.round(i * q) + (i ? 4 : 0), top: 0, width: Math.floor(q) - (i ? 8 : 4), height: tall.height });
  // The catalogue sheet: the Red Floral flat is the top-left panel; side, back, waist and fabric are the second row.
  // The crops stop above the sheet's baked-in labels.
  const row2 = (left, width) => ({ left, top: 772, width, height: 452 });
  await Promise.all([
    webp('models-wide.webp', 'hero-wide', 1800),
    webp('models-tall.webp', 'hero-tall', 1000),
    webp('purple-swirl-flat.webp', 'purple-swirl-flat', 760),
    webp('pink-swirl-flat.webp', 'pink-swirl-flat', 760),
    webp('multi-abstract-flat.webp', 'multi-abstract-flat', 760),
    webp('catalogue-sheet.webp', 'red-floral-flat', 520, { left: 4, top: 4, width: 248, height: 690 }),
    webp('catalogue-sheet.webp', 'red-floral-side', 520, row2(4, 248)),
    webp('catalogue-sheet.webp', 'red-floral-back', 520, row2(266, 244)),
    webp('catalogue-sheet.webp', 'red-floral-waist', 520, row2(522, 244)),
    webp('catalogue-sheet.webp', 'red-floral-fabric', 520, row2(778, 242)),
    webp('models-tall.webp', 'yellow-floral-model', 640, quarter(0)),
    webp('models-tall.webp', 'purple-swirl-model', 640, quarter(1)),
    webp('models-tall.webp', 'pink-swirl-model', 640, quarter(2)),
    webp('models-tall.webp', 'multi-abstract-model', 640, quarter(3)),
    // The portrait's corner sparkle is cropped off.
    webp('seller-portrait.jpg', 'atelier', 800, { left: 0, top: 0, width: 721, height: 1180 }),
  ]);
  const logo = await sharp(SRC + 'logo.jpg').trim({ threshold: 20 }).resize({ width: 520 }).png().toBuffer({ resolveWithObject: true });
  writeFileSync(`${OUT}logo.png`, logo.data);
  const cut = Math.round(logo.info.height * 0.69);
  await sharp(logo.data).extract({ left: 0, top: cut, width: logo.info.width, height: logo.info.height - cut }).trim({ threshold: 10 }).png().toFile(`${OUT}wordmark.png`);
  console.log('logo.png, wordmark.png');
  const svg = await QRCode.toString('https://wa.me/233557018888', { type: 'svg', margin: 1, color: { dark: '#141210', light: '#FFFFFF' }, errorCorrectionLevel: 'M' });
  writeFileSync(`${OUT}whatsapp-qr.svg`, svg);
  console.log('whatsapp-qr.svg');
}
