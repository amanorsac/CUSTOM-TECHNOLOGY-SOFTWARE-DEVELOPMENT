import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MS = '/preview/miras-sartorial';
const WA = 'https://wa.me/233557018888';
const PRINTS = ['Red Floral', 'Purple Swirl', 'Pink Swirl', 'Multi Abstract', 'Yellow Floral'];

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe("Mira's Sartorial draft", () => {
  test('loads: one h1, the draft ribbon, no errors', async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(MS);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.ms-ribbon')).toContainText("A draft for Mira's Sartorial by CTSD");
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });

  test('is unlisted: noindex meta, X-Robots-Tag, not in the sitemap', async ({ page, request }) => {
    const res = await page.goto(MS);
    expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('miras');
  });

  test('loads nothing from other sites and posts nothing', async ({ page }) => {
    const outside = [];
    page.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== 'localhost' || r.method() !== 'GET') outside.push(`${r.method()} ${r.url()}`); });
    await page.goto(MS);
    await page.waitForLoadState('networkidle');
    // The piece view's image has no src until a piece opens.
    const srcs = await page.locator('img[src]').evaluateAll((l) => l.map((i) => i.getAttribute('src')));
    for (const s of srcs) expect(s).toMatch(/^\/assets\/preview\/miras-sartorial\//);
    expect(outside).toEqual([]);
  });

  test('the edit: five prints, each "Price on request", with a model photo on hover', async ({ page }) => {
    await page.goto(MS);
    const cards = page.locator('#edit .ms-card');
    await expect(cards).toHaveCount(5);
    await expect(cards.locator('.ms-card__name')).toHaveText(PRINTS);
    for (let i = 0; i < 5; i++) await expect(cards.nth(i)).toContainText('Price on request');
    const alt = cards.nth(1).locator('img.ms-card__alt');
    await expect(alt).toHaveCSS('opacity', '0');
    await cards.nth(1).hover();
    await expect(alt).toHaveCSS('opacity', '1');
  });

  test('a piece opens on click, changes photos with the arrow keys, and closes with Escape', async ({ page }) => {
    await page.goto(MS);
    const card = page.locator('.ms-card', { hasText: 'Purple Swirl' });
    await card.click();
    const dlg = page.locator('dialog#piece');
    await expect(dlg).toBeVisible();
    await expect(page).toHaveURL(/#piece-purple-swirl$/);
    await expect(dlg.getByRole('heading', { level: 2 })).toHaveText('Purple Swirl wide-leg trousers');
    await expect(dlg).toContainText('Price on request');
    const img = dlg.locator('#p-img');
    const first = await img.getAttribute('src');
    await dlg.locator('.ms-piece__gal').focus();
    await page.keyboard.press('ArrowRight');
    await expect(img).not.toHaveAttribute('src', first);
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
    await expect(page).not.toHaveURL(/#piece-/);
    await expect(card).toBeFocused();
  });

  test('a link to a piece opens it; an unknown piece opens nothing', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`${MS}#piece-pink-swirl`);
    await expect(page.locator('dialog#piece')).toBeVisible();
    await expect(page.locator('#p-name')).toHaveText('Pink Swirl wide-leg trousers');
    await page.goto(`${MS}?fresh=1#piece-nothing`);
    await expect(page.locator('dialog#piece')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('Red Floral has five photos', async ({ page }) => {
    await page.goto(`${MS}#piece-red-floral`);
    await expect(page.locator('#p-thumbs button')).toHaveCount(5);
  });

  test('requesting a piece: errors first, then the exact message and a WhatsApp link', async ({ page }) => {
    await page.goto(`${MS}#piece-purple-swirl`);
    const dlg = page.locator('dialog#piece');
    await dlg.getByRole('button', { name: 'Request on WhatsApp' }).click();
    await expect(dlg.locator('#p-size-err')).toHaveText('Choose a size, or give your own measurements.');
    await dlg.locator('#p-size').selectOption('My own measurements');
    await dlg.getByRole('button', { name: 'Request on WhatsApp' }).click();
    await expect(dlg.locator('#p-meas-err')).toHaveText('Add your waist, hips and length.');
    await dlg.locator('#p-meas').fill('Waist 30, hips 42, length 41 in');
    await dlg.locator('#p-size').selectOption('M');
    await dlg.locator('#p-note').fill('For a wedding in December.');
    await dlg.getByRole('button', { name: 'Request on WhatsApp' }).click();
    const text = "Hello Mira's Sartorial, I'd like to request a custom piece.\nPiece: Purple Swirl wide-leg trousers\nSize: M\nNote: For a wedding in December.";
    await expect(dlg.locator('#p-msg pre')).toHaveText(text);
    const link = dlg.locator('#p-msg a', { hasText: 'Open WhatsApp' });
    await expect(link).toHaveAttribute('href', `${WA}?text=${encodeURIComponent(text)}`);
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('own measurements add a Measurements line', async ({ page }) => {
    await page.goto(`${MS}#piece-pink-swirl`);
    const dlg = page.locator('dialog#piece');
    await dlg.locator('#p-size').selectOption('My own measurements');
    await dlg.locator('#p-meas').fill('Waist 30, hips 42, length 41 in');
    await dlg.getByRole('button', { name: 'Request on WhatsApp' }).click();
    await expect(dlg.locator('#p-msg pre')).toHaveText("Hello Mira's Sartorial, I'd like to request a custom piece.\nPiece: Pink Swirl wide-leg trousers\nSize: My own measurements\nMeasurements: Waist 30, hips 42, length 41 in");
  });

  test('a service request: the Bridal button fills the order form with a Service line', async ({ page }) => {
    await page.goto(MS);
    await page.locator('#make').getByRole('button', { name: 'Start a Bridal request' }).click();
    await expect(page.locator('#o-service')).toHaveValue('Bridal');
    await page.locator('#order').getByRole('button', { name: 'Request on WhatsApp' }).click();
    const text = "Hello Mira's Sartorial, I'd like to request a custom piece.\nService: Bridal";
    await expect(page.locator('#o-msg pre')).toHaveText(text);
    await expect(page.locator('#o-msg a')).toHaveAttribute('href', `${WA}?text=${encodeURIComponent(text)}`);
  });

  test('the order form needs a choice first', async ({ page }) => {
    await page.goto(MS);
    await page.locator('#order').getByRole('button', { name: 'Request on WhatsApp' }).click();
    await expect(page.locator('#o-service-err')).toHaveText('Choose what you would like made.');
    await expect(page.locator('#o-msg')).toBeHidden();
  });

  test('content: her name, the QR code, her profiles; only the reels are placeholders', async ({ page }) => {
    await page.goto(MS);
    await expect(page.locator('#atelier')).toContainText('Obaa Yaa Botchway');
    await expect(page.locator('[data-placeholder]')).toHaveCount(3);
    await expect(page.locator('[data-placeholder="reel"]')).toHaveCount(3);
    await expect(page.locator('#order img[src$="whatsapp-qr.svg"]')).toBeVisible();
    await expect(page.locator('#order')).toContainText('055 701 8888');
    for (const href of ['https://www.instagram.com/miras__sartorial_/', 'https://www.tiktok.com/@miras_sartorial']) {
      const links = page.locator(`a[href="${href}"]`);
      expect(await links.count()).toBeGreaterThan(0);
      for (const l of await links.all()) { await expect(l).toHaveAttribute('target', '_blank'); await expect(l).toHaveAttribute('rel', /noopener/); }
    }
  });

  test('reduced motion: the hero holds still and everything is visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(MS);
    await expect(page.locator('.ms-hero img')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.ms-rv.is-pre')).toHaveCount(0);
  });

  for (const width of [375, 1280]) {
    test(`${width}px: no horizontal scroll, no serious axe violations, dialog open or closed`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(MS);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const serious = async () => (await new AxeBuilder({ page }).analyze()).violations
        .filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
      expect(await serious()).toEqual([]);
      await page.locator('.ms-card').first().click();
      await expect(page.locator('dialog#piece')).toBeVisible();
      expect(await serious()).toEqual([]);
      const form = page.locator('dialog#piece').getByRole('button', { name: 'Request on WhatsApp' });
      await form.scrollIntoViewIfNeeded();
      await expect(form).toBeInViewport();
    });
  }
});

test.describe("Mira's Sartorial draft without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test('the prints and the order section are visible', async ({ page }) => {
    await page.goto(MS);
    for (const name of PRINTS) await expect(page.locator('#edit').getByText(name, { exact: true })).toBeVisible();
    await expect(page.locator('#order img[src$="whatsapp-qr.svg"]')).toBeVisible();
    await expect(page.locator('#order a[href^="https://wa.me/233557018888"]').first()).toBeVisible();
  });
});
