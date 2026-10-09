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
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/home-live/);
    await expect(page.locator('[data-section="hero"]')).toHaveClass(/is-gl/, { timeout: 8000 });
    await expect.poll(() => page.locator('[data-wall-canvas]').evaluate((c) => getComputedStyle(c).opacity), { timeout: 6000 }).toBe('1');
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
    await page.goto('/');
    await expect(page.locator('.hero__img')).toBeVisible();
    // The scene shows 2.5 s after boot even with no video; allow for a slow first WebGL frame under load.
    await expect(page.locator('[data-section="hero"]')).toHaveClass(/is-gl/, { timeout: 15000 });
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
