// Measures what the home page transfers before any scroll: node scripts/home-budget.mjs [url]
// Loads the page in Chrome, waits for load plus a short idle, and sums the encoded size of every response.
// The budget from the spec is 1.2 MB.
import { createRequire } from 'node:module';
const require = createRequire(new URL('../brag-output/work/package.json', import.meta.url));
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:8787/';
const BUDGET = 1.2 * 1024 * 1024;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await p.context().newCDPSession(p);
await cdp.send('Network.enable');
const sizes = new Map(), urls = new Map();
cdp.on('Network.responseReceived', (e) => urls.set(e.requestId, e.response.url));
cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(3000);
await b.close();
const rows = [...sizes].map(([id, n]) => [urls.get(id) || '?', n]).sort((a, b) => b[1] - a[1]);
const total = rows.reduce((s, [, n]) => s + n, 0);
for (const [u, n] of rows.slice(0, 12)) console.log(String(Math.round(n / 1024)).padStart(6), 'KB ', u.replace(/^https?:\/\/[^/]+/, ''));
console.log(`total ${(total / 1024).toFixed(0)} KB of ${(BUDGET / 1024).toFixed(0)} KB budget: ${total <= BUDGET ? 'OK' : 'OVER'}`);
process.exitCode = total <= BUDGET ? 0 : 1;
