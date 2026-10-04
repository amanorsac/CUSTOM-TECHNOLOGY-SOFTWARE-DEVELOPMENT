import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function seriousAxe(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
}

const PAGES = [
  { path: '/about', status: 200 },
  { path: '/privacy', status: 200 },
  { path: '/thanks', status: 200 },
  { path: '/does-not-exist', status: 404 },
];

for (const p of PAGES) {
  test(`${p.path} loads with shell, one h1, no serious axe violations`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const res = await page.goto(p.path);
    expect(res.status()).toBe(p.status);
    await expect(page.locator('#site-header header, #site-header nav').first()).toBeVisible();
    await expect(page.locator('#site-footer footer, #site-footer a').first()).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await seriousAxe(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('404 links to /designs and / and is noindex, assets root-absolute', async ({ page }) => {
  await page.goto('/some/deep/missing/path');
  const main = page.locator('main');
  await expect(main.locator('a[href="/designs"]')).toBeVisible();
  await expect(main.locator('a[href="/"]')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('h1')).toContainText('different path');
  const urls = await page.locator('link[href], script[src], img[src]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('href') || e.getAttribute('src')));
  expect(urls.filter((u) => !/^(\/|https?:|data:)/.test(u))).toEqual([]);
});

test('about links to amanorsac.studio, same tab, rel noopener', async ({ page }) => {
  await page.goto('/about');
  const a = page.locator('main a[href="https://www.amanorsac.studio/"]');
  await expect(a.first()).toBeVisible();
  await expect(a.first()).toHaveAttribute('rel', /noopener/);
  expect(await a.first().getAttribute('target')).toBeNull();
  await expect(page.locator('[data-section="cta"] a[href="/start"]')).toHaveCount(1);
  await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText('About');
  expect(await page.locator('main').innerText()).not.toMatch(/\$\d/);
});

test('privacy names processors, retention and contact', async ({ page }) => {
  await page.goto('/privacy');
  const t = await page.locator('main').innerText();
  for (const s of ['Supabase', 'Resend', 'Cloudflare Turnstile', 'Cloudflare Web Analytics',
    'amanorsac@gmail.com', '24 months', 'October 3, 2026']) expect(t).toContain(s);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test.describe('thanks messages', () => {
  const cases = [
    ['?kind=project', /received your project details.*1–2 business days/s],
    ['?kind=mockup', /free mockup request is in.*homepage concept soon/s],
    ['?kind=bogus', /^(?!.*business days)(?!.*mockup request)[\s\S]*Thanks/],
    ['', /Thanks/],
  ];
  for (const [q, re] of cases) {
    test(`thanks${q || ' (none)'}`, async ({ page }) => {
      await page.goto('/thanks' + q);
      await expect(page.locator('#thanks-msg')).toHaveText(re);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      await expect(page.locator('main a[href="/designs"]')).toBeVisible();
      await expect(page.locator('main a[href="/"]')).toBeVisible();
    });
  }
});
