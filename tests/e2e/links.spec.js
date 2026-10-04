import { test, expect } from '@playwright/test';

const EXPECTED_404 = ['/designs/nope'];
const IMAGE_OK_404 = ['/images/site/', '/images/designs/'];

test('crawl: every internal link resolves, every img has valid alt, no broken assets', async ({ page, baseURL }) => {
  test.setTimeout(180000);
  const origin = new URL(baseURL).origin;
  const queue = ['/', '/demo/'];
  const seen = new Set();
  const problems = [];

  page.on('response', (res) => {
    const u = new URL(res.url());
    if (u.origin !== origin || res.status() < 400) return;
    const p = u.pathname;
    if (IMAGE_OK_404.some((x) => p.startsWith(x))) return;
    if (EXPECTED_404.includes(p)) return;
    if (p === '/favicon.ico') return;
    problems.push(`asset ${res.status()} ${p}`);
  });

  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const res = await page.goto(path);
    const status = res.status();
    if (EXPECTED_404.includes(new URL(path, origin).pathname)) {
      expect(status, path).toBe(404);
    } else if (status < 200 || status >= 300) {
      problems.push(`page ${status} ${path}`);
    }

    const imgs = await page.$$eval('img', (els) =>
      els.map((i) => ({
        src: i.getAttribute('src'),
        alt: i.getAttribute('alt'),
        decorative: !!i.closest('[aria-hidden="true"]') || i.getAttribute('role') === 'presentation',
      })),
    );
    for (const i of imgs) {
      if (i.alt === null) problems.push(`img missing alt on ${path}: ${i.src}`);
      else if (i.alt.trim() === '' && !i.decorative) problems.push(`img empty alt (not decorative) on ${path}: ${i.src}`);
    }

    const hrefs = await page.$$eval('a[href]', (els) => els.map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      if (!h || h.startsWith('#') || /^(mailto:|tel:)/i.test(h)) continue;
      const u = new URL(h, new URL(path, origin));
      if (u.origin !== origin) continue;
      const next = u.pathname + u.search;
      if (!seen.has(next)) queue.push(next);
    }
  }

  expect(seen.size).toBeGreaterThan(20);
  expect(problems).toEqual([]);
});
