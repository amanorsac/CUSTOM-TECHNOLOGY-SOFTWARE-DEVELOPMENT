// Screenshot helper for the CTSD Lab while building: node scripts/lab-shots.mjs <path> <out-prefix> [scrollFractions] [w] [h] [waitMs]
// Uses the installed Chrome through the playwright copy in brag-output/work.
import { createRequire } from 'node:module';
const require = createRequire(new URL('../brag-output/work/package.json', import.meta.url));
const { chromium } = require('playwright');
const [path = '/lab/particles', out = 'shot', fr = '0', w = '1440', h = '900', wait = '3200'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:8787' + path, { waitUntil: 'networkidle' });
await p.waitForTimeout(+wait);
for (const f of fr.split(',').map((x) => (x.startsWith('#') ? x : Number(x)))) {
  // A number scrolls to that fraction of the page; '#id' scrolls that element to the top.
  await p.evaluate((f) => (typeof f === 'string'
    ? window.scrollTo(0, document.querySelector(f).getBoundingClientRect().top + scrollY)
    : window.scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight))), f);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${out}-${String(f).replace('#', '')}.jpg`, type: 'jpeg', quality: 70 });
}
console.log('mode', await p.evaluate(() => document.documentElement.dataset.labMode), 'errors', JSON.stringify(errs));
await b.close();
