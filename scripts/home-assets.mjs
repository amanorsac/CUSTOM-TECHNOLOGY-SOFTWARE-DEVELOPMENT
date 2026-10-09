// Media for the CTSD home page: node scripts/home-assets.mjs [loops|wall]
// - loops: short muted loops (and WebP posters) cut from the showpiece walkthroughs, for the workshop wall,
//   the reel and the industry cards. Record the walkthroughs first with scripts/showcase-preview.mjs.
// - wall: renders the WebGL workshop wall once (dev server on :8787) as the hero still, so the first paint is
//   an image that matches the live scene.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import sharp from 'sharp';

const require = createRequire(new URL('../brag-output/work/package.json', import.meta.url));
const ffmpeg = require('ffmpeg-static');
const OUT = 'public/assets/home';
const step = process.argv[2] || 'loops';

// slug: [source video, start seconds, duration seconds]
export const LOOPS = {
  'osteria-lume': ['.superpowers/showcase/osteria-lume-walkthrough.mp4', 4, 7],
  'juniper-vale': ['.superpowers/showcase/juniper-vale-walkthrough.mp4', 6.5, 7],
  basecamp: ['.superpowers/showcase/basecamp-walkthrough.mp4', 3.5, 7],
  lanternway: ['.superpowers/showcase/lanternway-walkthrough.mp4', 4.5, 7],
  lab: ['public/assets/lab/previews/particles.mp4', 0, 6],
};

async function loops() {
  mkdirSync(`${OUT}/loops`, { recursive: true });
  for (const [slug, [src, ss, t]] of Object.entries(LOOPS)) {
    const mp4 = `${OUT}/loops/${slug}.mp4`, frame = `${OUT}/loops/${slug}-f.png`;
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(ss), '-t', String(t), '-i', src, '-an',
      '-vf', 'scale=640:400:force_original_aspect_ratio=increase,crop=640:400,fps=30',
      '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', frame]);
    await sharp(frame).webp({ quality: 70 }).toFile(`${OUT}/loops/${slug}.webp`);
    rmSync(frame);
    console.log('loop', slug);
  }
}

async function wall() {
  const { chromium } = require('playwright');
  const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8787/?wallshot=1');
  await p.waitForFunction(() => document.documentElement.dataset.wallReady === '1', null, { timeout: 20000 });
  await p.waitForTimeout(2000);
  const png = await p.locator('[data-wall-canvas]').screenshot();
  await b.close();
  await sharp(png).resize(1600, 1000).webp({ quality: 72 }).toFile(`${OUT}/wall.webp`);
  console.log('wall still');
}

// A stand-in for the still until the WebGL wall exists: dark walnut slats with a warm pool of light.
async function wallPlaceholder() {
  const w = 1600, h = 1000, slats = [];
  for (let x = 0; x < w; x += 28) slats.push(`<rect x="${x}" y="0" width="26" height="${h}" fill="${['#2B1B18', '#4E3626', '#5E4430', '#553B29', '#432D1F'][Math.floor(x / 28) % 5]}"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${slats.join('')}
    <radialGradient id="g" cx="68%" cy="42%" r="55%"><stop offset="0" stop-color="#C89B6B" stop-opacity=".55"/><stop offset="1" stop-color="#2B1B18" stop-opacity="0"/></radialGradient>
    <rect width="${w}" height="${h}" fill="url(#g)"/></svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 72 }).toFile(`${OUT}/wall.webp`);
  console.log('wall placeholder');
}

if (step === 'loops') await loops();
else if (step === 'wall') await wall();
else if (step === 'wall-placeholder') await wallPlaceholder();
else throw new Error(`unknown step ${step}`);
