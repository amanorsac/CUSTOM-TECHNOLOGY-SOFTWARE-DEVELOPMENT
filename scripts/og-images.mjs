// Share images (1200x630) for the main pages, drawn on the midnight-and-ember brand background with the
// site's own fonts, then pointed at from each page's og:image and twitter:image.
//   node scripts/og-images.mjs
// Writes public/assets/og/<slug>.jpg and public/assets/brand/og-default.jpg (home, 404, thanks).
// Lab and showcase pages keep their own preview images.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const require = createRequire(new URL('../brag-output/work/package.json', import.meta.url));
const { chromium } = require('playwright');

const ROOT = new URL('../public/', import.meta.url);
const font = (f) => readFileSync(new URL(`fonts/${f}`, ROOT)).toString('base64');
const mark = readFileSync(new URL('assets/brand/mark-reverse.svg', ROOT), 'utf8').replace(/<title[^>]*>.*?<\/title>/, '');

// page file -> [slug, eyebrow, title]. slug 'default' becomes the brand-wide og-default.jpg.
const PAGES = {
  'index.html': ['default', 'Custom technology & software', 'Technology built around your organization.'],
  'about.html': ['about', 'About CTSD', 'A custom technology partner for growing organizations.'],
  'solutions.html': ['solutions', 'Solutions', 'Websites, apps, CRM and integrations.'],
  'designs.html': ['designs', 'Explore designs', 'Concept websites, apps and systems.'],
  'mockup.html': ['mockup', 'Free mockup', 'See your new site before you commit.'],
  'start.html': ['start', 'Start a project', 'Tell us what you need to build.'],
  'privacy.html': ['privacy', 'Privacy policy', 'How we handle your information.'],
  'demo/index.html': ['demo', 'Live demo', 'Try a real admin dashboard.'],
  'industries/business.html': ['business', 'Business', 'Technology that runs the way your business does.'],
  'industries/church.html': ['church', 'Church', 'Technology that serves your congregation.'],
  'industries/education.html': ['education', 'Education', 'Technology for schools, students and staff.'],
  'industries/nonprofit.html': ['nonprofit', 'Nonprofit', 'Technology that moves your mission forward.'],
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const card = (eyebrow, title) => `<!doctype html><html><head><style>
@font-face{font-family:Montserrat;font-weight:700;src:url(data:font/woff2;base64,${font('montserrat-latin-700-normal.woff2')})}
@font-face{font-family:Inter;font-weight:500;src:url(data:font/woff2;base64,${font('inter-latin-500-normal.woff2')})}
@font-face{font-family:Inter;font-weight:600;src:url(data:font/woff2;base64,${font('inter-latin-600-normal.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;color:#F7F4EE;font-family:Inter;
  background:radial-gradient(circle at 86% 16%,rgba(94,128,176,.38),transparent 46%),
             radial-gradient(circle at 10% 110%,rgba(31,58,95,.9),transparent 55%),linear-gradient(120deg,#0F1B2D,#0A1322)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(148,170,204,.08) 1px,transparent 1px),
  linear-gradient(90deg,rgba(148,170,204,.08) 1px,transparent 1px);background-size:60px 60px;
  -webkit-mask-image:linear-gradient(110deg,transparent 35%,#000 100%)}
.wrap{position:absolute;inset:72px 80px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:18px;font:700 34px Montserrat;letter-spacing:.06em}
.brand svg{width:50px;height:56px}
.eyebrow{margin-top:auto;font:600 24px Inter;letter-spacing:.14em;text-transform:uppercase;color:#F2A23A}
h1{margin-top:18px;font:700 66px/1.08 Montserrat;letter-spacing:-.01em;max-width:960px}
.foot{margin-top:40px;display:flex;align-items:center;gap:18px;font:500 22px Inter;color:rgba(247,244,238,.76)}
.foot i{display:block;width:56px;height:4px;border-radius:2px;background:#F2A23A}
</style></head><body><div class="grid"></div><div class="wrap">
<div class="brand">${mark}<span>CTSD</span></div>
<p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>
<p class="foot"><i></i>Custom Technology &amp; Software Development</p></div></body></html>`;

mkdirSync(new URL('assets/og/', ROOT), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [file, [slug, eyebrow, title]] of Object.entries(PAGES)) {
  await page.setContent(card(eyebrow, title), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  const rel = slug === 'default' ? 'assets/brand/og-default.jpg' : `assets/og/${slug}.jpg`;
  await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(fileURLToPath(new URL(rel, ROOT)));
  // Point the page's share tags at its image.
  const path = new URL(file, ROOT);
  const html = readFileSync(path, 'utf8');
  const next = html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(")/g, `$1/${rel}$2`);
  if (next !== html) writeFileSync(path, next);
  console.log(`${file} -> /${rel}`);
}
await browser.close();
