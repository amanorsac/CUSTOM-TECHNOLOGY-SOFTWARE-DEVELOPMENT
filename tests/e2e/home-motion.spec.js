import { test, expect } from '@playwright/test';

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/GL_|WebGL|GPU stall|swiftshader|status of 404/i.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}
const noWebGL = () => {
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : get.call(this, t, ...a); };
};

test.describe('home: the workshop wall', () => {
  test('live: the wall canvas is drawn', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebGL is only reliable in headless Chromium');
    const errors = collectErrors(page);
    // Headless browsers render WebGL in software, where the page skips the 3D wall; force it on here.
    await page.goto('/?forcegl=1');
    await expect(page.locator('html')).toHaveClass(/home-live/);
    await expect(page.locator('[data-section="hero"]')).toHaveClass(/is-gl/, { timeout: 8000 });
    await expect.poll(() => page.locator('[data-wall-canvas]').evaluate((c) => Number(getComputedStyle(c).opacity)), { timeout: 8000 }).toBeGreaterThan(0.9);
    expect(errors).toEqual([]);
  });

  test('still: no canvas, no pin', async ({ page }) => {
    await page.goto('/?still=1');
    await expect(page.locator('html')).toHaveClass(/home-still/);
    await expect(page.locator('[data-wall-canvas]')).toBeHidden();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('.wall-screens figure')).toHaveCount(4);
  });

  test('no WebGL: four playing screens over the still', async ({ page }) => {
    await page.addInitScript(noWebGL);
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/home-nogl/);
    await expect(page.locator('[data-wall-canvas]')).toBeHidden();
    const vids = page.locator('.wall-screens video');
    await expect(vids).toHaveCount(4);
    await expect.poll(() => vids.evaluateAll((l) => l.filter((v) => !v.paused).length), { timeout: 8000 }).toBe(4);
    expect(errors).toEqual([]);
  });

  test('videos blocked: the wall still renders', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebGL is only reliable in headless Chromium');
    await page.route('**/assets/home/loops/*.mp4', (route) => route.fulfill({ status: 404, body: '' }));
    const errors = collectErrors(page);
    await page.goto('/?forcegl=1');
    await expect(page.locator('.hero__img')).toBeVisible();
    // The scene shows 2.5 s after boot even with no video; allow for a slow first WebGL frame under load.
    await expect(page.locator('[data-section="hero"]')).toHaveClass(/is-gl/, { timeout: 15000 });
    expect(errors).toEqual([]);
  });

  test('reel: all showpiece links reachable by keyboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-home-motion', '1', { timeout: 15000 });
    await expect(page.locator('.reel__item')).toHaveCount(4);
    const last = page.locator('.reel__item').last().getByRole('link', { name: /^Build something like this/ });
    await last.focus();
    await page.waitForTimeout(1800);
    const box = await last.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(900);
  });

  test('reel: resize to a phone mid-reel keeps no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('.reel__item')).toHaveCount(4);
    await page.evaluate(() => window.scrollTo(0, document.querySelector('[data-reel]').getBoundingClientRect().top + scrollY + 600));
    await page.waitForTimeout(600);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('services: hovering a service lights its node', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-home-motion', '1', { timeout: 15000 });
    const li = page.locator('.strip__list li', { hasText: 'CRM' });
    await li.scrollIntoViewIfNeeded();
    await li.hover();
    await expect(page.locator('.sys [data-node="crm"]')).toHaveClass(/is-on/);
  });

  test('industries: hovering a card starts its preview', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-home-motion', '1', { timeout: 15000 });
    const card = page.locator('.ind-card[href="/industries/church"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect.poll(() => card.locator('video').evaluate((v) => !v.paused), { timeout: 4000 }).toBe(true);
  });

  test('process: steps light up as the line passes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-home-motion', '1', { timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, document.querySelector('[data-section="process"]').getBoundingClientRect().bottom + scrollY - innerHeight * 0.4));
    // Lenis glides to a programmatic position rather than jumping; give it time to arrive.
    await page.waitForTimeout(2200);
    await expect(page.locator('[data-section="process"] .steps li.is-on')).toHaveCount(6);
  });

  test('no GPU: the still wall with its screens playing, not the 3D wall', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'headless Chromium renders WebGL in software');
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-wall', 'still', { timeout: 8000 });
    await expect(page.locator('[data-section="hero"]')).not.toHaveClass(/is-gl/);
    await expect.poll(() => page.locator('.wall-screens video').evaluateAll((l) => l.filter((v) => !v.paused).length), { timeout: 8000 }).toBe(4);
    expect(errors).toEqual([]);
  });

  test('hero videos pause off-screen', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-section="services"]').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.querySelector('[data-section="services"]').getBoundingClientRect().top + scrollY));
    await page.waitForTimeout(800);
    await expect.poll(() => page.locator('.wall-screens video').evaluateAll((l) => l.every((v) => v.paused))).toBe(true);
  });
});
