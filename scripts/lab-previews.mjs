// Records the looping previews for the CTSD Lab index: node scripts/lab-previews.mjs [name,...]
// Needs the dev server on :8787. Writes public/assets/lab/previews/<name>.mp4 (6s, muted) and <name>.jpg.
// Uses the installed Chrome and the ffmpeg build that ship with brag-output/work.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
const require = createRequire(new URL('../brag-output/work/package.json', import.meta.url));
const { chromium } = require('playwright');
const ffmpeg = require('ffmpeg-static');

const OUT = 'public/assets/lab/previews', TMP = '.superpowers/lab/rec';
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const smoothScroll = async (p, from, to, ms) => {
  const steps = Math.round(ms / 40);
  for (let i = 0; i <= steps; i++) {
    const k = i / steps, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    await p.evaluate((f) => window.scrollTo(0, f * (document.querySelector('.lab-live, .pg-stage').offsetHeight - innerHeight)), from + (to - from) * e);
    await wait(40);
  }
};

// Each script is a function of elapsed seconds (0..6): it sets scroll/mouse for that moment.
const scroll = (p, f) => p.evaluate((f) => window.scrollTo(0, f * (document.querySelector('.lab-live, .pg-stage').offsetHeight - innerHeight)), f);
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const span = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const SCRIPTS = {
  particles: { warm: 2600, at: async (p, t) => { await p.mouse.move(660 + Math.cos(t * 2) * 170, 290 + Math.sin(t * 1.6) * 110); await scroll(p, 0.33 * ease(span(t, 1.4, 4.6))); } },
  workshop: { warm: 1500, at: async (p, t) => scroll(p, 0.4 * ease(span(t, 0.2, 5.6))) },
  gallery: { warm: 1600, at: async (p, t) => scroll(p, (Math.min(2, Math.floor(t / 2)) + ease(span(t % 2, 0.6, 1.6))) / 12.4) },
  playground: { warm: 300, at: async (p, t) => { if (t > 4.2 && !p._shook) { p._shook = 1; await p.click('[data-pg-shake]'); } } },
};
const names = process.argv[2] ? process.argv[2].split(',') : Object.keys(SCRIPTS);

const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
for (const name of names) {
  rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
  const p = await browser.newPage({ viewport: { width: 1024, height: 640 } });
  await p.goto(`http://localhost:8787/lab/${name}`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.lab-back,#site-header,.site-header,[data-pg-tilt]{display:none!important}' });
  await wait(SCRIPTS[name].warm);
  // Stream frames with Chrome's screencast (much faster than screenshots), then rebuild real timing.
  const cdp = await p.context().newCDPSession(p);
  const frames = [];
  cdp.on('Page.screencastFrame', async (f) => { frames.push({ data: f.data, ts: f.metadata.timestamp }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1024, maxHeight: 640, everyNthFrame: 1 });
  const t0 = Date.now();
  while ((Date.now() - t0) / 1000 < 6.3) { await SCRIPTS[name].at(p, (Date.now() - t0) / 1000); await wait(16); }
  await cdp.send('Page.stopScreencast');
  await p.close();
  // concat list with each frame's real duration
  let list = '';
  frames.forEach((f, i) => {
    const file = `f${String(i).padStart(4, '0')}.jpg`; writeFileSync(`${TMP}/${file}`, Buffer.from(f.data, 'base64'));
    const next = frames[i + 1]?.ts ?? f.ts + 1 / 30;
    list += `file '${file}'
duration ${Math.max(0.001, next - f.ts).toFixed(4)}
`;
  });
  writeFileSync(`${TMP}/list.txt`, list);
  const rate = (frames.length / (frames.at(-1).ts - frames[0].ts)).toFixed(1);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${TMP}/list.txt`, '-t', '6', '-an', '-vf', 'scale=1024:-2,fps=30',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}/${name}.mp4`]);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '4.5', '-i', `${OUT}/${name}.mp4`, '-frames:v', '1', '-q:v', '3', `${OUT}/${name}.jpg`]);
  console.log(name, rate + ' fps captured,', `${(statSync(`${OUT}/${name}.mp4`).size / 1024).toFixed(0)} KB`);
}
await browser.close();
