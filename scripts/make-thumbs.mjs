// Converts generated images dropped into public/images/** into the files the
// site loads: a WebP at the displayed size plus a 600px "-sm" thumbnail.
//
//   node scripts/make-thumbs.mjs            convert anything new
//   node scripts/make-thumbs.mjs --force    rebuild outputs that already exist
//   node scripts/make-thumbs.mjs --dry-run  only print what would be written
//
// Safety: it never deletes or modifies a source file, never writes an output on
// top of its own source, and skips outputs that already exist unless --force.
// Sizes and ratios are documented in docs/image-prompts/README.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUBLIC_DIR = 'public';
export const THUMB_WIDTH = 600;

// First match wins. `name` is tested against the file name without extension.
// fit: 'center' = cover-crop around the middle (device scenes)
//      'top'    = cover-crop keeping the top (screens; the site shows them top-anchored)
//      'extend' = phone screens: scale to width, then extend the top and bottom
//                 edges (edge pixels repeated) to reach 9:19.5, or trim the bottom
//      'width'  = unknown files: scale down to 2400 wide, keep the ratio
export const IMAGE_SPECS = [
  { dir: /^images\/designs\/[^/]+$/, name: /^cover$/, width: 1200, height: 800, fit: 'center' },
  { dir: /^images\/designs\/[^/]+$/, name: /^hero$/, width: 2400, height: 1600, fit: 'center' },
  { dir: /^images\/designs\/[^/]+$/, name: /^(web|portal|admin)-\d+$/, width: 2400, height: 1500, fit: 'top' },
  { dir: /^images\/designs\/[^/]+$/, name: /^app-\d+$/, width: 1200, height: 2600, fit: 'extend' },
  { dir: /^images\/site$/, name: /^hero$/, width: 1440, height: 1200, fit: 'center' },
  { dir: /^images\/site$/, name: /^admin-hero$/, width: 1600, height: 1000, fit: 'top' },
  { dir: /^images\/site$/, name: /^industry-[a-z0-9-]+$/, width: 2400, height: 1600, fit: 'center' },
  { dir: /^images\/site$/, name: /^texture-[a-z0-9-]+$/, width: 1600, height: 1600, fit: 'center' },
  { dir: /^images\/site$/, name: /^og-source$/, width: 1200, height: 630, fit: 'center',
    out: 'assets/brand/og-photo.jpg', format: 'jpeg', thumb: false },
];

const SOURCE_EXT = /\.(png|jpe?g|webp)$/i;

/** 'images/a/b.webp' -> 'images/a/b-sm.webp' */
export const smPath = (p) => p.replace(/\.webp$/i, '-sm.webp');

/**
 * Pure mapping from a source path (relative to public/) to the files to write.
 * Returns null for anything that is not a source image.
 * @param {string} rel
 */
export function planOutputs(rel) {
  const src = String(rel).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!SOURCE_EXT.test(src)) return null;
  const dir = path.posix.dirname(src);
  const ext = path.posix.extname(src);
  const name = path.posix.basename(src, ext);
  if (name.startsWith('_') || /-sm$/.test(name)) return null;

  const spec = IMAGE_SPECS.find((s) => s.dir.test(dir) && s.name.test(name))
    || { width: 2400, height: null, fit: 'width' };

  const full = { path: spec.out || `${dir}/${name}.webp`, width: spec.width, height: spec.height, format: spec.format || 'webp' };
  const outputs = [full];
  if (spec.thumb !== false) {
    outputs.push({
      path: smPath(full.path),
      width: THUMB_WIDTH,
      height: spec.height ? Math.round((THUMB_WIDTH * spec.height) / spec.width) : null,
      format: 'webp',
    });
  }
  return {
    src,
    fit: spec.fit,
    width: spec.width,
    height: spec.height,
    // A WebP already at its final name is the full image: only its thumbnail is made.
    srcIsFull: full.path === src,
    outputs: outputs.filter((o) => o.path !== src),
  };
}

// ---- Image work (sharp) -------------------------------------------------------

async function renderFull(sharp, file, plan) {
  const img = sharp(file).rotate();
  const { width: W, height: H, fit } = plan;
  if (fit === 'width') return img.resize({ width: W, withoutEnlargement: true });
  if (fit === 'extend') {
    const scaled = await img.resize({ width: W }).toBuffer({ resolveWithObject: true });
    const h = scaled.info.height;
    if (h >= H) return sharp(scaled.data).extract({ left: 0, top: 0, width: W, height: H });
    const add = H - h;
    const top = Math.floor(add / 2);
    return sharp(scaled.data).extend({ top, bottom: add - top, extendWith: 'copy' });
  }
  return img.resize({ width: W, height: H, fit: 'cover', position: fit === 'top' ? 'top' : 'centre' });
}

const encode = (pipeline, format) => (format === 'jpeg'
  ? pipeline.jpeg({ quality: 84, mozjpeg: true })
  : pipeline.webp({ quality: 82, effort: 5 }));

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

export async function run({ force = false, dryRun = false, root = PUBLIC_DIR, log = console.log } = {}) {
  const { default: sharp } = await import('sharp');
  const imagesDir = path.join(root, 'images');
  if (!fs.existsSync(imagesDir)) { log(`No ${imagesDir} folder yet.`); return { written: [], skipped: [] }; }

  const written = [];
  const skipped = [];
  const claimed = new Set();
  // Non-WebP sources first, so a fresh PNG wins over an older WebP of the same name.
  const files = walk(imagesDir)
    .map((f) => path.relative(root, f).split(path.sep).join('/'))
    .sort((a, b) => Number(/\.webp$/i.test(a)) - Number(/\.webp$/i.test(b)) || a.localeCompare(b));

  for (const rel of files) {
    const plan = planOutputs(rel);
    if (!plan || plan.outputs.length === 0) continue;
    const todo = plan.outputs.filter((o) => {
      if (claimed.has(o.path)) return false;
      claimed.add(o.path);
      if (!force && fs.existsSync(path.join(root, o.path))) { skipped.push(o.path); return false; }
      return true;
    });
    if (todo.length === 0) continue;

    const srcFile = path.join(root, rel);
    const meta = await sharp(srcFile).metadata();
    if (plan.fit !== 'width' && !plan.srcIsFull && meta.width < plan.width) {
      log(`  note: ${rel} is ${meta.width}px wide, upscaling to ${plan.width}px. Export larger if you can.`);
    }

    // The full image is rendered from the source; a WebP source *is* the full image.
    const fullBuf = plan.srcIsFull
      ? fs.readFileSync(srcFile)
      : await (await renderFull(sharp, srcFile, plan)).toBuffer();

    for (const o of todo) {
      const isThumb = o.width === THUMB_WIDTH && /-sm\.webp$/.test(o.path);
      const pipeline = isThumb ? sharp(fullBuf).resize({ width: THUMB_WIDTH }) : sharp(fullBuf);
      const target = path.join(root, o.path);
      if (path.resolve(target) === path.resolve(srcFile)) continue; // never touch a source
      log(`${dryRun ? 'would write' : 'write'} ${o.path}  <- ${rel}`);
      if (!dryRun) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        await encode(pipeline, o.format).toFile(target);
      }
      written.push(o.path);
    }
  }
  log(`${written.length} written, ${skipped.length} already existed${skipped.length && !force ? ' (use --force to rebuild)' : ''}.`);
  return { written, skipped };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  run({ force: args.includes('--force'), dryRun: args.includes('--dry-run') }).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
