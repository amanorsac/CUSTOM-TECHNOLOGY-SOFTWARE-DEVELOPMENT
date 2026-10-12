import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The Kezia Woods draft, "The Founder" (docs/superpowers/specs/2026-10-11-kezia-woods-redo-design.md).
const KW = '/preview/kezia-woods';
const SENT = "Thank you. This draft isn't connected yet, so nothing was sent.";
const DP = 'https://dailyprogress.com/life-entertainment/local/food-drink/article_83e28400-cbeb-4679-95ef-bb1557a4faa5.html';
const N29 = 'https://www.29news.com/2026/08/26/bonchon-korean-fried-chicken-opens-west-main-street/';

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}
function outsideRequests(page) {
  const out = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== 'localhost' || r.method() !== 'GET') out.push(`${r.method()} ${r.url()}`); });
  return out;
}

test.describe('Kezia Woods draft', () => {
  test('loads: one h1 "Kezia Woods", the draft bar, no errors', async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(KW);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Kezia Woods');
    await expect(page.locator('.kw-draftbar')).toContainText('Draft for Kezia Woods');
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });

  test('is unlisted: noindex meta, X-Robots-Tag, not in the sitemap', async ({ page, request }) => {
    const res = await page.goto(KW);
    expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/preview/');
  });

  test('loads nothing from other sites; every image is its own', async ({ page }) => {
    const out = outsideRequests(page);
    await page.goto(KW);
    await page.waitForLoadState('networkidle');
    for (const s of await page.locator('img[src]').evaluateAll((l) => l.map((i) => i.getAttribute('src')))) expect(s).toMatch(/^\/assets\/preview\/kezia-woods\//);
    expect(out).toEqual([]);
  });

  test('the old magazine is gone', async ({ page }) => {
    await page.goto(KW);
    await expect(page.locator('.kw-nameplate, .kw-cover, [data-split], [data-clip]')).toHaveCount(0);
    expect(await page.locator('h1').evaluate((h) => h.children.length)).toBe(0);
  });

  test('hero: Book Kezia and Partner with Kezia', async ({ page }) => {
    await page.goto(KW);
    const hero = page.locator('.kw-hero');
    await expect(hero.getByRole('link', { name: 'Book Kezia' })).toHaveAttribute('href', '#speaking');
    await expect(hero.getByRole('link', { name: 'Partner with Kezia' })).toHaveAttribute('href', '#partner');
  });

  test('her words, credited to 29 News', async ({ page }) => {
    await page.goto(KW);
    const q = page.locator('.kw-quote');
    await expect(q).toContainText("I'm beyond blessed to have this opportunity.");
    await expect(q).toContainText('29 News');
  });

  test('three ventures: Bonchon and Kester link out, security does not', async ({ page }) => {
    await page.goto(KW);
    const cards = page.locator('#work .kw-venture');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0).locator('a')).toHaveAttribute('href', 'https://bonchon.com');
    await expect(cards.nth(1).locator('a')).toHaveCount(0);
    await expect(cards.nth(1)).toContainText('Certified Information Security Manager');
    await expect(cards.nth(2).locator('a')).toHaveAttribute('href', 'https://kester.edu.gh');
    for (const a of await page.locator('a[href^="http"]').all()) {
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAttribute('rel', /noopener/);
    }
  });

  test('the press: two articles with outlets and dates', async ({ page }) => {
    await page.goto(KW);
    const rows = page.locator('#press .kw-press__item');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('The Daily Progress');
    await expect(rows.nth(0)).toContainText('July 22, 2026');
    await expect(rows.nth(0).locator('a')).toHaveAttribute('href', DP);
    await expect(rows.nth(1)).toContainText('29 News');
    await expect(rows.nth(1)).toContainText('August 26, 2026');
    await expect(rows.nth(1).locator('a')).toHaveAttribute('href', N29);
  });

  test('every photo slot is marked: seven slots, each with a visible tag', async ({ page }) => {
    await page.goto(`${KW}?still=1`);
    const slots = page.locator('[data-standin]');
    await expect(slots).toHaveCount(7);
    for (const s of await slots.all()) {
      await s.scrollIntoViewIfNeeded();
      await expect(s.locator('.kw-tag')).toBeVisible();
      await expect(s.locator('.kw-tag')).toHaveText(/Photo to come|Stand-in image/);
    }
    await expect(page.locator('.kw-hero [data-standin]')).toContainText('Portrait coming from Kezia');
  });

  for (const [form, fields] of [
    ['book', { name: 'Ama Owusu', email: 'ama@example.com', org: 'Example Forum', message: 'A keynote in March.' }],
    ['partner', { name: 'Ama Owusu', email: 'ama@example.com', company: 'Example Co', message: 'Interested in franchising.' }],
    ['follow', { email: 'ama@example.com' }],
  ]) {
    test(`the ${form} form: errors when empty, then thanks, and nothing is sent`, async ({ page }) => {
      const out = outsideRequests(page);
      await page.goto(KW);
      const f = page.locator(`#${form}-form`);
      await f.locator('button[type="submit"]').click();
      await expect(f.locator('.kw-err:not(:empty)').first()).toBeVisible();
      await expect(f.locator('[aria-invalid="true"]').first()).toBeFocused();
      for (const [k, v] of Object.entries(fields)) await f.locator(`[name="${k}"]`).fill(v);
      await f.locator('button[type="submit"]').click();
      await expect(f.locator('[role="status"]')).toHaveText(SENT);
      await expect(f.locator('[aria-invalid="true"]')).toHaveCount(0);
      expect(out).toEqual([]);
    });
  }

  test('reduced motion: nothing starts hidden', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(KW);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => getComputedStyle(e).opacity === '0' && e.getClientRects().length).length);
    expect(hidden).toBe(0);
  });

  for (const width of [375, 1280]) {
    test(`${width}px: no horizontal scroll, no serious axe violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(KW);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });
  }
});

test.describe('Kezia Woods draft on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('the menu opens, holds the sections, and closes with Escape', async ({ page }) => {
    await page.goto(KW);
    const btn = page.locator('#menuBtn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    const nav = page.locator('#nav');
    await expect(nav.getByRole('link', { name: 'Speaking' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(nav.getByRole('link', { name: 'Speaking' })).toBeHidden();
    await expect(btn).toBeFocused();
  });
});

test.describe('Kezia Woods draft without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every section and form is visible', async ({ page }) => {
    await page.goto(KW);
    for (const id of ['work', 'story', 'speaking', 'press', 'partner', 'follow']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id} h2`)).toBeVisible();
    }
    await expect(page.locator('#book-form')).toBeVisible();
    await expect(page.locator('#partner-form')).toBeVisible();
  });
});
