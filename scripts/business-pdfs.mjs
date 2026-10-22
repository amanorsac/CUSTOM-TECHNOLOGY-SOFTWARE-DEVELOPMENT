// Renders the client-facing business documents in docs/business/ to PDF with headless Chrome:
//   node scripts/business-pdfs.mjs
// packages.html     -> CTSD-Packages.pdf (the four packages, then add-ons and care plans)
// pricing-card.html -> CTSD-Pricing.pdf (both pages), CTSD-Pricing-Studio.pdf (page 1),
//                      CTSD-Pricing-Virtual-Assistant.pdf (page 2)
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = fileURLToPath(new URL('../docs/business/', import.meta.url));
const DOCS = {
  'packages.html': [['CTSD-Packages.pdf']],
  'pricing-card.html': [['CTSD-Pricing.pdf'], ['CTSD-Pricing-Studio.pdf', '1'], ['CTSD-Pricing-Virtual-Assistant.pdf', '2']],
};

const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [], written = [];
for (const [source, outputs] of Object.entries(DOCS)) {
  await page.goto(pathToFileURL(`${DIR}${source}`).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Each page must fit on exactly one sheet: catch content that overflows its page.
  const overflow = await page.$$eval('.page', (pages) => pages.filter((p) => p.scrollHeight > p.clientHeight + 1).map((p) => `${p.id} (+${p.scrollHeight - p.clientHeight}px)`));
  if (overflow.length) { problems.push(`${source}: ${overflow.join(', ')}`); continue; }
  for (const [file, pageRanges] of outputs) {
    await page.pdf({ path: `${DIR}${file}`, format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, ...(pageRanges ? { pageRanges } : {}) });
    written.push(file);
  }
}
await browser.close();
if (written.length) console.log(`wrote ${written.join(', ')}`);
if (problems.length) { console.error(`content overflows: ${problems.join('; ')}`); process.exit(1); }
