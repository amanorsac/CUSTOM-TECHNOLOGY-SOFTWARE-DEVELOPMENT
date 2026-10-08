import { test, expect } from '@playwright/test';

const PAGES = ['/', '/solutions', '/industries/business', '/industries/church', '/industries/education',
  '/industries/nonprofit', '/designs', '/demo/', '/about', '/start', '/mockup', '/privacy',
  '/lab/', '/lab/particles', '/lab/workshop', '/lab/gallery', '/lab/playground'];
const slugs = ['modern-church', 'multi-campus-church', 'youth-ministry', 'private-school', 'music-school',
  'online-academy', 'consulting-firm', 'real-estate', 'restaurant', 'custom-crm', 'client-portal', 'booking-system'];
const ALL = [...PAGES, ...slugs.map((s) => `/designs/${s}`)];

test('every indexable page has unique title + description, canonical and og:image', async ({ request }) => {
  const titles = new Set();
  const descs = new Set();
  for (const p of ALL) {
    const res = await request.get(p);
    expect(res.status(), p).toBe(200);
    const html = await res.text();
    expect(html.match(/<title>/g), p).toHaveLength(1);
    expect(html.match(/<meta name="description"/g), p).toHaveLength(1);
    const title = html.match(/<title>([^<]*)<\/title>/)[1];
    const desc = html.match(/<meta name="description" content="([^"]*)"/)[1];
    expect(title, `${p} title`).toBeTruthy();
    expect(title, `${p} raw ampersand`).not.toMatch(/&(?!amp;|lt;|gt;|quot;|#)/);
    expect(titles.has(title), `${p} dup title ${title}`).toBe(false);
    expect(descs.has(desc), `${p} dup description`).toBe(false);
    titles.add(title);
    descs.add(desc);
    expect(html, p).toMatch(/<link rel="canonical" href="http:\/\/localhost:8787\//);
    expect(html, p).toMatch(/<meta property="og:image" content="http:\/\/localhost:8787\/[^"]+"/);
    expect(html, p).not.toContain('noindex');
  }
});

test('og-default.jpg is served as an image', async ({ request }) => {
  const res = await request.get('/assets/brand/og-default.jpg');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/jpeg');
});

test('home JSON-LD: Organization + ProfessionalService, no priceRange', async ({ page }) => {
  await page.goto('/');
  const blocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => JSON.parse(e.textContent)));
  const types = blocks.map((b) => b['@type']);
  expect(types).toEqual(expect.arrayContaining(['Organization', 'ProfessionalService']));
  expect(JSON.stringify(blocks)).not.toContain('priceRange');
});

test('design page JSON-LD: BreadcrumbList', async ({ page }) => {
  await page.goto('/designs/restaurant');
  const blocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => JSON.parse(e.textContent)));
  expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(true);
});

test('sitemap and robots over HTTP', async ({ request }) => {
  const sm = await request.get('/sitemap.xml');
  expect(sm.headers()['content-type']).toContain('application/xml');
  expect(await sm.text()).toContain('<loc>http://localhost:8787/designs/restaurant</loc>');
  const rb = await request.get('/robots.txt');
  expect(await rb.text()).toContain('Sitemap: http://localhost:8787/sitemap.xml');
});

test('analytics beacon is absent while the token is empty', async ({ page }) => {
  await page.goto('/about');
  expect(await page.locator('script[data-cf-beacon]').count()).toBe(0);
});
