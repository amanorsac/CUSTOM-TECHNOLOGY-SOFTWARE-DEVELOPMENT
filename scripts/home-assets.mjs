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

if (step === 'loops') await loops();
else if (step === 'wall') await wall();
else throw new Error(`unknown step ${step}`);
