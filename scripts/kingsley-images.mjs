// Turns Kingsley's Drive photos (assets-src/kingsley/, gitignored) into the
// files the draft serves: <name>-800 and <name>-1600 in WebP and JPEG, plus
// img/manifest.json { name: { w, h } } giving the 1600 file's size.
// Only the photos named in USED are published; to use another photo on a page,
// add its kebab name to USED and re-run. tests/unit/kingsley-images.test.js
// checks USED, the manifest and the built pages agree.
//
//   node scripts/kingsley-images.mjs           convert anything new
//   node scripts/kingsley-images.mjs --force   rebuild everything
//
// Names are lowercase kebab: _MG_9033.JPG -> mg-9033,
// GREY7822-Recovered.png2.png -> grey7822-recovered-png2.
//
// It also publishes the hero video: copies the encoded hero-1920.mp4 and
// hero-960.mp4 from assets-src/kingsley/video/ to public/media/kingsley/
// (served by the worker with byte ranges, see src/routes/media.js), and makes
// hero-poster.webp (1920 wide, q75) and hero-poster.jpg from hero-poster.jpg.
//
// And the official logo: assets-src/kingsley/logo/ka-logo-source.jpg (white on
// black) becomes img/brand/ka-monogram.{png,webp} and ka-name.{png,webp}:
// white with luminance as alpha, cropped to content, at 2x display size, plus
// a favicon (cream monogram on stage black). brand.json gives their sizes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const SRC_DIR = 'assets-src/kingsley';
export const OUT_DIR = 'public/assets/preview/kingsley/img';
export const WIDTHS = [800, 1600];
export const MAX_WIDTH = 2000;
export const QUALITY = 78;
// Photos the pages use (kebab names). Everything else in SRC_DIR is skipped.
export const USED = [
  'amh-5789', 'amh-5791', 'amh-5821', 'amh-5845', 'amh-5849', 'amh-5851', 'amh-5953', 'amh-5954',
  'grey7822', 'grey78221',
  'mg-8938', 'mg-8954', 'mg-8962', 'mg-8965', 'mg-8968', 'mg-8972',
  'mg-9007', 'mg-9012', 'mg-9014', 'mg-9025', 'mg-9026', 'mg-9027',
  'mg-9032', 'mg-9033', 'mg-9034', 'mg-9035',
];
export const VIDEO_SRC_DIR = 'assets-src/kingsley/video';
export const VIDEO_OUT_DIR = 'public/media/kingsley';
export const HERO_VIDEOS = ['hero-1920.mp4', 'hero-960.mp4'];

/** '_MG_9033.JPG' -> 'mg-9033' */
export function kebabName(file) {
  return path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function convert(file, force) {
  const name = kebabName(file);
  const src = path.join(SRC_DIR, file);
  const meta = await sharp(src).rotate().metadata();
  // metadata() reports pre-rotation size; swap for EXIF orientations 5-8.
  const swap = (meta.orientation || 1) >= 5;
  const srcW = swap ? meta.height : meta.width;
  const srcH = swap ? meta.width : meta.height;
  let large;
  for (const target of WIDTHS) {
    const w = Math.min(target, srcW, MAX_WIDTH);
    const h = Math.round((srcH * w) / srcW);
    if (target === WIDTHS[WIDTHS.length - 1]) large = { w, h };
    for (const ext of ['webp', 'jpg']) {
      const out = path.join(OUT_DIR, `${name}-${target}.${ext}`);
      if (!force && fs.existsSync(out)) continue;
      let img = sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).flatten({ background: '#0E0F14' });
      img = ext === 'webp' ? img.webp({ quality: QUALITY }) : img.jpeg({ quality: QUALITY, mozjpeg: true });
      await img.toFile(out);
    }
  }
  return [name, large];
}

async function heroVideo(force) {
  if (!fs.existsSync(VIDEO_SRC_DIR)) return;
  fs.mkdirSync(VIDEO_OUT_DIR, { recursive: true });
  for (const file of HERO_VIDEOS) {
    const src = path.join(VIDEO_SRC_DIR, file);
    const out = path.join(VIDEO_OUT_DIR, file);
    if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
    if (force || !fs.existsSync(out)) fs.copyFileSync(src, out);
  }
  const poster = path.join(VIDEO_SRC_DIR, 'hero-poster.jpg');
  const webp = path.join(VIDEO_OUT_DIR, 'hero-poster.webp');
  const jpg = path.join(VIDEO_OUT_DIR, 'hero-poster.jpg');
  const resized = () => sharp(poster).rotate().resize({ width: 1920, withoutEnlargement: true }).flatten({ background: '#0E0F14' });
  if (force || !fs.existsSync(webp)) await resized().webp({ quality: 75 }).toFile(webp);
  if (force || !fs.existsSync(jpg)) await resized().jpeg({ quality: 75, mozjpeg: true }).toFile(jpg);
  console.log(`hero video -> ${VIDEO_OUT_DIR}`);
}

export const LOGO_SRC = 'assets-src/kingsley/logo/ka-logo-source.jpg';
export const BRAND_DIR = 'public/assets/preview/kingsley/img/brand';
// Display heights in CSS px; files are made at 2x.
export const BRAND_HEIGHTS = { 'ka-monogram': 32, 'ka-name': 11 };

/** Row bands [start, end] (inclusive) whose max luminance passes the threshold. */
export function contentBands(rowMax, threshold = 64) {
  const bands = [];
  let start = -1;
  rowMax.forEach((v, y) => {
    if (v >= threshold && start < 0) start = y;
    if (v < threshold && start >= 0) { bands.push([start, y - 1]); start = -1; }
  });
  if (start >= 0) bands.push([start, rowMax.length - 1]);
  return bands;
}

async function brand(force) {
  if (!fs.existsSync(LOGO_SRC)) return;
  const marker = path.join(BRAND_DIR, 'brand.json');
  if (!force && fs.existsSync(marker)) return;
  fs.mkdirSync(BRAND_DIR, { recursive: true });
  const { data, info } = await sharp(LOGO_SRC).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const at = (x, y) => data[y * W + x];
  const rowMax = Array.from({ length: H }, (_, y) => { let m = 0; for (let x = 0; x < W; x++) m = Math.max(m, at(x, y)); return m; });
  const bands = contentBands(rowMax);
  if (bands.length !== 2) throw new Error(`logo: expected monogram and name bands, found ${bands.length}`);
  const sizes = {};
  const names = ['ka-monogram', 'ka-name'];
  for (let i = 0; i < 2; i++) {
    const [top, bottom] = bands[i];
    let left = W, right = 0;
    for (let y = top; y <= bottom; y++) for (let x = 0; x < W; x++) if (at(x, y) >= 64) { left = Math.min(left, x); right = Math.max(right, x); }
    const w = right - left + 1;
    const h = bottom - top + 1;
    // White pixels with luminance as alpha; levels 24..232 -> 0..255 for clean edges.
    const rgba = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const l = at(left + x, top + y);
      const a = Math.max(0, Math.min(255, Math.round(((l - 24) * 255) / (232 - 24))));
      rgba.set([255, 255, 255, a], (y * w + x) * 4);
    }
    const outH = BRAND_HEIGHTS[names[i]] * 2;
    const outW = Math.round((w * outH) / h);
    const piece = () => sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).resize({ height: outH, kernel: 'lanczos3' });
    await piece().png({ compressionLevel: 9 }).toFile(path.join(BRAND_DIR, `${names[i]}.png`));
    await piece().webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(BRAND_DIR, `${names[i]}.webp`));
    sizes[names[i]] = { w: outW, h: outH };
    if (i === 0) {
      // Favicon: cream monogram centred on stage black, 64x64.
      const mono = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
        .resize({ width: 44, height: 44, fit: 'inside' })
        .tint('#F4EBDD')
        .png()
        .toBuffer();
      await sharp({ create: { width: 64, height: 64, channels: 4, background: '#0E0F14' } })
        .composite([{ input: mono, gravity: 'centre' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(BRAND_DIR, 'favicon-64.png'));
    }
  }
  fs.writeFileSync(marker, `${JSON.stringify(sizes, null, 2)}\n`);
  console.log(`logo -> ${BRAND_DIR}`, sizes);
}

async function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && USED.includes(kebabName(f))).sort();
  const missing = USED.filter((n) => !files.some((f) => kebabName(f) === n));
  if (missing.length) throw new Error(`USED names with no source photo: ${missing.join(', ')}`);
  const manifest = {};
  for (const file of files) {
    const [name, size] = await convert(file, force);
    manifest[name] = size;
    console.log(`${name}  ${size.w}x${size.h}`);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${files.length} images -> ${OUT_DIR}`);
  await heroVideo(force);
  await brand(force);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
