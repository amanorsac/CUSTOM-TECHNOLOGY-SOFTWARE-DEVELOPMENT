// Renders the client-facing business documents in docs/business/ to PDF with headless Chrome:
//   node scripts/business-pdfs.mjs
// pricing-card.html -> CTSD-Pricing.pdf (both pages), CTSD-Pricing-Studio.pdf (page 1),
//                      CTSD-Pricing-Virtual-Assistant.pdf (page 2)
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = fileURLToPath(new URL('../docs/business/', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(`${DIR}pricing-card.html`).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const pdf = (file, opts = {}) => page.pdf({ path: `${DIR}${file}`, format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, ...opts });
await pdf('CTSD-Pricing.pdf');
await pdf('CTSD-Pricing-Studio.pdf', { pageRanges: '1' });
await pdf('CTSD-Pricing-Virtual-Assistant.pdf', { pageRanges: '2' });

// Each page must fit on exactly one sheet: catch content that overflows its page.
const overflow = await page.$$eval('.page', (pages) => pages.filter((p) => p.scrollHeight > p.clientHeight + 1).map((p) => `${p.id} (+${p.scrollHeight - p.clientHeight}px)`));
await browser.close();
if (overflow.length) { console.error(`content overflows: ${overflow.join(', ')}`); process.exit(1); }
console.log('wrote CTSD-Pricing.pdf, CTSD-Pricing-Studio.pdf, CTSD-Pricing-Virtual-Assistant.pdf');
