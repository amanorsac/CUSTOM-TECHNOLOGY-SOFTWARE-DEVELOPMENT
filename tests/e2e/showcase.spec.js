import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const OL = '/showcase/osteria-lume';

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/GL_|WebGL|GPU stall|swiftshader/i.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('Osteria Lume showpiece', () => {
  test('loads live: one h1, the preloader hands over, no errors', async ({ page, browserName }) => {
    const errors = collectErrors(page);
    const res = await page.goto(OL);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const mode = await page.locator('html').getAttribute('data-ol-mode');
    if (browserName === 'webkit') expect(['live', 'nowebgl']).toContain(mode); else expect(mode).toBe('live');
    await expect(page.locator('[data-pre]')).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator('a.ol-badge')).toHaveAttribute('href', '/designs/restaurant');
    expect(errors).toEqual([]);
  });

  test('menu tabs switch the dishes', async ({ page }) => {
    await page.goto(`${OL}?still=1`);
    await expect(page.locator('.ol-dish')).toHaveCount(3);
    await expect(page.locator('.ol-dish__name').first()).toHaveText('Burrata');
    await page.getByRole('tab', { name: 'Pasta' }).click();
    await expect(page.getByRole('tab', { name: 'Pasta' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.ol-dish__name').first()).toHaveText('Cacio e pepe');
  });

  test('reservation: table, date, time and guests, then the seal', async ({ page }) => {
    await page.goto(`${OL}?still=1`);
    const book = page.locator('[data-book]');
    await expect(book).toBeDisabled();
    // A booked table cannot be chosen.
    await page.locator('.tbl[data-t="3"]').click({ force: true });
    await expect(page.locator('.tbl[data-t="3"]')).toHaveAttribute('aria-pressed', 'false');
    await page.locator('.tbl[data-t="5"]').click();
    await expect(page.locator('.tbl[data-t="5"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-dates] button').first().click();
    await page.locator('[data-times] button', { hasText: '7:30 PM' }).click();
    await expect(book).toBeEnabled();
    // More guests than the table seats disables booking with a clear message.
    for (let i = 0; i < 3; i++) await page.locator('[data-more]').click();
    await expect(page.locator('[data-summary]')).toContainText('seats 4');
    await expect(book).toBeDisabled();
    await page.locator('[data-less]').click();
    await expect(book).toBeEnabled();
    await book.click();
    await expect(page.locator('[data-confirm]')).toHaveClass(/is-open/);
    await expect(page.locator('[data-ok-text]')).toContainText('7:30 PM, table 5, 4 guests');
    await page.locator('[data-close]').click();
    await expect(page.locator('[data-confirm]')).not.toHaveClass(/is-open/);
  });

  test('tables work from the keyboard', async ({ page }) => {
    await page.goto(`${OL}?still=1`);
    await page.locator('.tbl[data-t="1"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.tbl[data-t="1"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('reduced motion: still version, accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(OL);
    await expect(page.locator('html')).toHaveClass(/ol-static/);
    await expect(page.locator('[data-pre]')).toHaveCount(0);
    await expect(page.locator('.ol-hero__img')).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });

  test('no WebGL: the photo hero and everything else still work', async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : get.call(this, t, ...a); };
    });
    const errors = collectErrors(page);
    await page.goto(OL);
    await expect(page.locator('html')).toHaveAttribute('data-ol-mode', 'nowebgl');
    await expect(page.locator('.ol-hero__img')).toBeVisible();
    await expect(page.locator('.ol-bottle')).toHaveCount(5);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(OL);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the restaurant design page links to the live showpiece; others do not', async ({ page }) => {
    await page.goto('/designs/restaurant');
    await expect(page.locator('[data-d="showcase"]')).toBeVisible();
    await expect(page.locator('[data-d="showcase"]')).toHaveAttribute('href', OL);
    await page.goto('/designs/modern-church');
    await expect(page.locator('[data-d="showcase"]')).toBeHidden();
  });
});
