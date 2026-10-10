import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KW = '/preview/kezia-woods';

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('Kezia Woods draft', () => {
  test('loads live: one h1, the draft bar, no errors', async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(KW);
    expect(res.status()).toBe(200);
    await expect(page.locator('html')).toHaveClass(/kw-live/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveAccessibleName('Kezia Woods');
    await expect(page.locator('.kw-draftbar')).toContainText('Draft for Kezia Woods');
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test('is unlisted: noindex meta, X-Robots-Tag, not in the sitemap', async ({ page, request }) => {
    const res = await page.goto(KW);
    expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /preview/');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain('/preview/');
  });

  test('uses no press photos or third-party images', async ({ page }) => {
    await page.goto(`${KW}?still=1`);
    const srcs = await page.locator('img').evaluateAll((l) => l.map((i) => i.getAttribute('src')));
    for (const s of srcs) expect(s).toMatch(/^\/assets\/preview\/kezia-woods\//);
  });

  test('a speaking topic opens and closes', async ({ page }) => {
    await page.goto(`${KW}?still=1`);
    const btn = page.locator('#speaking button[aria-expanded]').first();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#${await btn.getAttribute('aria-controls')}`)).toBeVisible();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  for (const [name, form, fill] of [
    ['Book Kezia', '[data-form="book"]', async (f) => { await f.getByLabel('Name').fill('Ama Mensah'); await f.getByLabel('Email').fill('ama@example.com'); await f.getByLabel('Message').fill('We would love you to speak at our summit.'); }],
    ['Partner', '[data-form="partner"]', async (f) => { await f.getByLabel('Name').fill('Kofi Boateng'); await f.getByLabel('Email').fill('kofi@example.com'); await f.getByLabel('Message').fill('Interested in a partnership in Accra.'); }],
  ]) {
    test(`${name} form validates, then confirms without sending anything`, async ({ page }) => {
      const sent = [];
      page.on('request', (r) => { if (r.method() !== 'GET') sent.push(r.url()); });
      await page.goto(`${KW}?still=1`);
      const f = page.locator(form);
      await f.getByRole('button', { name: /send|request/i }).click();
      await expect(f.locator('[data-status]')).not.toContainText('Thank you');
      await expect(f.getByLabel('Name')).toBeFocused();
      await fill(f);
      await f.getByRole('button', { name: /send|request/i }).click();
      await expect(f.locator('[data-status]')).toContainText('Thank you');
      await expect(f.locator('[data-status]')).toContainText("isn't connected yet");
      expect(sent).toEqual([]);
    });
  }

  test('numbers show their final values in still mode', async ({ page }) => {
    await page.goto(`${KW}?still=1`);
    await expect(page.locator('#numbers [data-flap]')).toHaveText(['500th', '2', '3', 'Aug 26, 2026']);
  });

  test('press links open in a new tab safely', async ({ page }) => {
    await page.goto(`${KW}?still=1`);
    const links = page.locator('#press a');
    await expect(links).toHaveCount(2);
    for (const l of await links.all()) {
      await expect(l).toHaveAttribute('target', '_blank');
      await expect(l).toHaveAttribute('rel', /noopener/);
    }
  });

  test('reduced motion: still version, accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(KW);
    await expect(page.locator('html')).toHaveClass(/kw-still/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
  });

  test('no JS: every chapter is readable', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(KW);
    await expect(page.locator('#story .kw-ch h2')).toHaveCount(5);
    for (const h of await page.locator('#story .kw-ch h2').all()) await expect(h).toBeVisible();
    await ctx.close();
  });

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(KW);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
