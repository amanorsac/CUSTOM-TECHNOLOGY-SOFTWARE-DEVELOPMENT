import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const EXPERIMENTS = ['particles', 'workshop', 'gallery', 'playground'];
const WEBGL = ['particles', 'workshop', 'gallery'];

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    // GPU/driver chatter from headless WebGL is not a page error.
    if (m.type() === 'error' && !/GL_|WebGL|GPU stall|swiftshader/i.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('Lab index', () => {
  test('lists the four experiments with previews, and Lab is in the nav', async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto('/lab/');
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const cards = page.locator('.lab-card');
    await expect(cards).toHaveCount(4);
    for (const [i, name] of EXPERIMENTS.entries()) {
      await expect(cards.nth(i)).toHaveAttribute('href', `/lab/${name}`);
      await expect(cards.nth(i).locator('video')).toHaveAttribute('poster', `/assets/lab/previews/${name}.jpg`);
    }
    await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText('Lab');
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('preview files exist', async ({ request }) => {
    for (const name of EXPERIMENTS) {
      for (const ext of ['mp4', 'jpg']) expect((await request.get(`/assets/lab/previews/${name}.${ext}`)).status(), `${name}.${ext}`).toBe(200);
    }
  });
});

for (const name of EXPERIMENTS) {
  test.describe(`/lab/${name}`, () => {
    test('loads live with one h1, a call to action and no errors', async ({ page, browserName }) => {
      const errors = collectErrors(page);
      const res = await page.goto(`/lab/${name}`);
      expect(res.status()).toBe(200);
      await expect(page.locator('h1:visible')).toHaveCount(1);
      await expect(page.locator('a.lab-back')).toHaveAttribute('href', '/lab');
      await expect(page.locator('main a[href="/mockup"], main a[href="/start"]').first()).toBeAttached();
      const mode = await page.locator('html').getAttribute('data-lab-mode');
      // WebKit's headless runner may lack WebGL; then the still version is the right result.
      if (WEBGL.includes(name) && browserName === 'webkit') expect(['live', 'nowebgl']).toContain(mode);
      else expect(mode).toBe('live');
      if (mode === 'live') await expect(page.locator('html')).toHaveAttribute('data-lab-ready', '1', { timeout: 15000 });
      expect(errors).toEqual([]);
    });

    test('reduced motion shows the still version', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/lab/${name}`);
      await expect(page.locator('html')).toHaveClass(/lab-static/);
      await expect(page.locator('html')).toHaveAttribute('data-lab-mode', 'reduced');
      await expect(page.locator('h1:visible')).toHaveCount(1);
      if (name !== 'playground') await expect(page.locator('#lab-canvas')).toBeHidden();
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    });

    test('no horizontal scroll on a phone', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`/lab/${name}`);
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  });
}

for (const name of WEBGL) {
  test(`/lab/${name} falls back to the still version without WebGL`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...a) { return /webgl/.test(type) ? null : get.call(this, type, ...a); };
    });
    const errors = collectErrors(page);
    await page.goto(`/lab/${name}`);
    await expect(page.locator('html')).toHaveAttribute('data-lab-mode', 'nowebgl');
    await expect(page.locator('.lab-still h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('gallery links every concept to its design page', async ({ page }) => {
  await page.goto('/lab/gallery?still=1');
  const links = page.locator('[data-gl-still] a');
  await expect(links).toHaveCount(12);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) expect(href).toMatch(/^\/designs\/[a-z-]+$/);
  await page.goto('/lab/gallery');
  await expect(page.locator('[data-gl-link]')).toHaveAttribute('href', /^\/designs\/[a-z-]+$/);
});

test('playground pieces are real links that drop into view', async ({ page }) => {
  await page.goto('/lab/playground');
  const links = page.locator('.pg-pieces a.pg-piece');
  expect(await links.count()).toBeGreaterThanOrEqual(10);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) expect(href).toMatch(/^\//);
  await expect(page.locator('.pg-piece.is-in')).toHaveCount(await page.locator('.pg-piece').count(), { timeout: 8000 });
});

test('a quick tap on a playground pill follows its link', async ({ page }) => {
  await page.goto('/lab/playground');
  const pill = page.locator('a.pg-piece[href="/solutions#websites"]');
  await expect(pill).toHaveClass(/is-in/, { timeout: 8000 });
  await page.waitForTimeout(2500); // let it settle
  // A visitor taps wherever the pill is now; pieces may still drift a pixel, so tap the live position
  // rather than waiting for Playwright's "stable" check.
  // Pick a point where the pill is the top element (other pieces may overlap parts of it).
  const pt = await pill.evaluate((el) => {
    const r = el.getBoundingClientRect();
    for (let fy = 0.5; fy > 0.1; fy -= 0.1) for (const fx of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy;
      if (el.contains(document.elementFromPoint(x, y))) return { x, y };
    }
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(pt.x, pt.y);
  await expect(page).toHaveURL(/\/solutions#websites$/);
});
