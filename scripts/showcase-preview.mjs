// Records a walkthrough of a showpiece: node scripts/showcase-preview.mjs osteria-lume
// Needs the dev server on :8787. Writes .superpowers/showcase/<slug>-walkthrough.mp4.
// A script is a list of [seconds, action] beats run against the live page; Chrome's screencast captures
// frames at render speed and ffmpeg rebuilds their real timing.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
const require = createRequire(new URL('../brag-output/work/package.json', import.meta.url));
const { chromium } = require('playwright');
const ffmpeg = require('ffmpeg-static');

const slug = process.argv[2] || 'osteria-lume';
const TMP = `.superpowers/showcase/rec-${slug}`, OUT = `.superpowers/showcase/${slug}-walkthrough.mp4`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

// Smoothly scroll the window from one element's top to another's over `ms`.
async function glide(p, from, to, ms) {
  const [a, b] = await p.evaluate(([f, t]) => [f, t].map((s) => (typeof s === 'number' ? s : document.querySelector(s).getBoundingClientRect().top + scrollY)), [from, to]);
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const k = ease((Date.now() - t0) / ms); await p.evaluate((y) => window.scrollTo(0, y), a + (b - a) * k); await wait(16); }
}
async function circle(p, cx, cy, r, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const t = (Date.now() - t0) / 1000; await p.mouse.move(cx + Math.cos(t * 1.6) * r, cy + Math.sin(t * 2.1) * r * 0.6); await wait(16); } }

const SCRIPTS = {
  'osteria-lume': async (p) => {
    await wait(3600);                                             // match strike + light-up
    await circle(p, 760, 420, 260, 4200);                         // carry the candle over the table
    await glide(p, 0, '.ol-statement', 1400); await wait(400);
    await glide(p, '.ol-statement', '.ol-kitchen', 1800);
    await glide(p, '.ol-kitchen', '#menu', 7000);                 // the kitchen story
    await wait(500);
    for (const y of [470, 560, 650, 560]) { await p.mouse.move(640 + Math.random() * 120, y, { steps: 18 }); await wait(500); }
    await glide(p, '#menu', '#wine', 1200);
    await glide(p, '#wine', '#reserve', 4200);                    // the wine rail
    await p.click('.tbl[data-t="5"]'); await wait(400);
    await p.click('[data-dates] button'); await p.click('[data-times] button:nth-child(6)'); await wait(300);
    await p.click('[data-book]'); await wait(2400);
  },
  'juniper-vale': async (p) => {
    // Slide a range input from one value to another, firing input events like a drag would.
    const slide = async (sel, from, to, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = from + (to - from) * ease((Date.now() - t0) / ms); await p.$eval(sel, (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, v); await wait(16); } };
    await wait(4200);                                             // the house sketch draws in, then wipes away
    await circle(p, 900, 380, 240, 2600);                         // depth parallax
    await slide('[data-tod]', 45, 0, 1600); await wait(500);      // midday
    await slide('[data-tod]', 0, 100, 2600); await wait(900);     // through golden hour into night
    await slide('[data-tod]', 100, 45, 1400);
    await glide(p, 0, '#homes', 2000); await wait(400);
    await p.mouse.move(1100, 560); await p.mouse.down(); await p.mouse.move(400, 560, { steps: 30 }); await p.mouse.up(); await wait(1400);
    await p.click('.jv-card:nth-child(3)'); await wait(3200);     // the card opens into the home
    await p.keyboard.press('Escape'); await wait(1200);
    await glide(p, '#homes', '#plan', 1200);
    await glide(p, '#plan', '.jv-ba', 8000);                      // the plan rises into a house
    await wait(3600);                                             // before/after sweep
    await glide(p, '.jv-ba', '#neighborhoods', 1200);
    await glide(p, '#neighborhoods', '#mortgage', 8000);          // fly between neighborhoods
    await slide('#c-price', 685000, 1200000, 1800); await wait(1600);
  },
};

rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
const frames = [];
cdp.on('Page.screencastFrame', (f) => { frames.push({ data: f.data, ts: f.metadata.timestamp }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 });
await p.goto(`http://localhost:8787/showcase/${slug}`);
await SCRIPTS[slug](p);
await cdp.send('Page.stopScreencast');
await browser.close();

let list = '';
frames.forEach((f, i) => {
  const file = `f${String(i).padStart(5, '0')}.jpg`; writeFileSync(`${TMP}/${file}`, Buffer.from(f.data, 'base64'));
  list += `file '${file}'\nduration ${Math.max(0.001, (frames[i + 1]?.ts ?? f.ts + 1 / 30) - f.ts).toFixed(4)}\n`;
});
writeFileSync(`${TMP}/list.txt`, list);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${TMP}/list.txt`, '-an', '-vf', 'scale=1440:-2,fps=30',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT]);
console.log('wrote', OUT, frames.length, 'frames');
