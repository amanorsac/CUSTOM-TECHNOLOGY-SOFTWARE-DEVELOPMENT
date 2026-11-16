// Turns Kingsley's Drive photos (assets-src/kingsley/, gitignored) into the
// files the draft serves: <name>-800 and <name>-1600 in WebP and JPEG, plus
// img/manifest.json { name: { w, h } } giving the 1600 file's size.
//
//   node scripts/kingsley-images.mjs           convert anything new
//   node scripts/kingsley-images.mjs --force   rebuild everything
//
// Names are lowercase kebab: _MG_9033.JPG -> mg-9033,
// GREY7822-Recovered.png2.png -> grey7822-recovered-png2.
//
// It also publishes the hero video: copies the encoded hero-1920.mp4 and
// hero-960.mp4 from assets-src/kingsley/video/ to video/, and makes
// hero-poster.webp (1920 wide, q75) and hero-poster.jpg from hero-poster.jpg.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const SRC_DIR = 'assets-src/kingsley';
export const OUT_DIR = 'public/assets/preview/kingsley/img';
export const WIDTHS = [800, 1600];
export const MAX_WIDTH = 2000;
export const QUALITY = 78;
export const VIDEO_SRC_DIR = 'assets-src/kingsley/video';
export const VIDEO_OUT_DIR = 'public/assets/preview/kingsley/video';
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

async function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const manifest = {};
  for (const file of files) {
    const [name, size] = await convert(file, force);
    manifest[name] = size;
    console.log(`${name}  ${size.w}x${size.h}`);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${files.length} images -> ${OUT_DIR}`);
  await heroVideo(force);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
