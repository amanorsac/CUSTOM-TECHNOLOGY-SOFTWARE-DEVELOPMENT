import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const cards = (page) => page.locator('[data-design-grid] > li > a.design-card');

async function brokenVisibleImages(page) {
  return page.evaluate(() => [...document.images]
    .filter((img) => img.getClientRects().length > 0 && getComputedStyle(img).visibility !== 'hidden')
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map((img) => img.currentSrc || img.src));
}

// Scroll the whole page so lazy images load (or fail and fall back), then let
// the network settle.
async function scrollThrough(page) {
  await page.waitForLoadState('networkidle');
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
  await page.waitForLoadState('networkidle');
}

async function seriousAxe(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
}

test.describe('Explore Designs shop', () => {
  test('shows 12 cards, each a link with a Concept badge', async ({ page }) => {
    await page.goto('/designs');
    await expect(cards(page)).toHaveCount(12);
    for (const card of await cards(page).all()) {
      await expect(card.locator('.badge-concept')).toHaveText('Concept');
      await expect(card).toHaveAttribute('href', /^\/designs\/[a-z0-9-]+$/);
    }
    await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText('Explore Designs');
    await expect(page.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
  });

  test('Church tab filters to 3 cards and updates ?cat=', async ({ page }) => {
    await page.goto('/designs');
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole('tab', { name: 'Church' }).click();
    await expect(cards(page)).toHaveCount(3);
    await expect(page).toHaveURL(/\/designs\?cat=church$/);
    await expect(page.getByRole('tab', { name: 'Church' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');
  });

  test('?cat=church is linkable', async ({ page }) => {
    await page.goto('/designs?cat=church');
    await expect(cards(page)).toHaveCount(3);
    await expect(page.getByRole('tab', { name: 'Church' })).toHaveAttribute('aria-selected', 'true');
  });

  test('?cat=xyz falls back to All with 12 cards', async ({ page }) => {
    await page.goto('/designs?cat=xyz');
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
  });

  test('tablist is keyboard-operable with arrow keys', async ({ page }) => {
    await page.goto('/designs');
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole('tab', { name: 'All' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Church' })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Church' })).toHaveAttribute('aria-selected', 'true');
    await expect(cards(page)).toHaveCount(3);
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Software' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'All' })).toBeFocused();
    await expect(cards(page)).toHaveCount(12);
    await expect(page).toHaveURL(/\/designs$/);
  });

  test('missing images fall back: no visible img with naturalWidth 0', async ({ page }) => {
    await page.goto('/designs');
    await expect(cards(page)).toHaveCount(12);
    await scrollThrough(page);
    await expect.poll(() => brokenVisibleImages(page), { timeout: 10000 }).toEqual([]);
    const alt = await cards(page).first().locator('img').first().getAttribute('alt');
    expect(alt).toBe('Modern Church Platform concept — cover screen');
  });

  for (const width of [375, 1280]) {
    test(`axe: no serious violations and no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/designs');
      await expect(cards(page)).toHaveCount(12);
      await page.waitForLoadState('networkidle');
      expect(await seriousAxe(page)).toEqual([]);
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      expect(sw).toBeLessThanOrEqual(iw);
    });
  }
});

test.describe('Design page', () => {
  test('/designs/modern-church shows the design', async ({ page }) => {
    await page.goto('/designs/modern-church');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modern Church Platform');
    await expect(page).toHaveTitle('Modern Church Platform — Concept | CTSD');
    await expect(page.locator('main .badge-concept').first()).toHaveText('Concept');
    await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText('Explore Designs');
    await expect(page.locator('[data-features] li')).toHaveCount(7);
    await expect(page.locator('[data-integrations] li')).toHaveCount(3);
    const related = page.locator('[data-related] a.design-card');
    await expect(related).toHaveCount(3);
    await expect(related.first()).toHaveAttribute('href', '/designs/multi-campus-church');
  });

  test('"Build something like this" links to start with the slug', async ({ page }) => {
    await page.goto('/designs/modern-church');
    const ctas = page.getByRole('link', { name: /Build something like this/i });
    await expect(ctas.first()).toBeVisible();
    expect(await ctas.count()).toBeGreaterThanOrEqual(2);
    for (const a of await ctas.all()) await expect(a).toHaveAttribute('href', '/start?design=modern-church');
  });

  test('missing images: hero falls back, empty galleries are hidden', async ({ page }) => {
    // Record whether any gallery section is ever shown (that would be a layout shift).
    await page.addInitScript(() => {
      window.__shown = [];
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.target.matches && r.target.matches('[data-section]') && !r.target.hidden) window.__shown.push(r.target.dataset.section);
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    });
    await page.goto('/designs/modern-church');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modern Church Platform');
    await scrollThrough(page);
    await expect.poll(() => brokenVisibleImages(page), { timeout: 10000 }).toEqual([]);
    // None of the gallery files exist yet, so every gallery section is hidden.
    for (const s of ['website', 'app', 'portal', 'admin']) {
      await expect(page.locator(`[data-section="${s}"]`)).toBeHidden();
    }
    await expect(page.locator('[data-hero-img]')).toHaveAttribute('src', '/images/designs/_placeholder.webp');
    const shown = await page.evaluate(() => window.__shown);
    expect(shown.filter((s) => ['website', 'app', 'portal', 'admin'].includes(s))).toEqual([]);
  });

  test('gallery renders, and prev/next scroll it, when images exist', async ({ page }) => {
    // Serve the placeholder for this design's gallery images to simulate real files.
    await page.route('**/images/designs/modern-church/**', async (route) => {
      const res = await route.fetch({ url: new URL('/images/designs/_placeholder.webp', route.request().url()).href });
      await route.fulfill({ response: res });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/designs/modern-church');
    const web = page.locator('[data-section="website"]');
    await expect(web).toBeVisible();
    await expect(web.locator('img')).toHaveCount(3);
    await expect(page.locator('[data-section="app"] img')).toHaveCount(3);
    await expect(page.locator('[data-section="admin"]')).toBeVisible();
    const track = web.locator('[data-track]');
    const next = web.getByRole('button', { name: /next/i });
    await next.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await scrollThrough(page);
    await expect.poll(() => brokenVisibleImages(page), { timeout: 10000 }).toEqual([]);
  });

  test('/design.html?id=modern-church works as a fallback', async ({ page }) => {
    await page.goto('/design.html?id=modern-church');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modern Church Platform');
  });

  test('/designs/nope shows "Design not found" with a link back to the shop', async ({ page }) => {
    const res = await page.goto('/designs/nope');
    expect(res.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design not found');
    await expect(page.getByRole('link', { name: /Explore Designs|Browse all designs/ }).last()).toHaveAttribute('href', '/designs');
    await expect(page.locator('main a[href="/designs"]')).toHaveCount(1);
  });

  test('/design.html with no id shows "Design not found"', async ({ page }) => {
    await page.goto('/design.html');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design not found');
  });

  for (const width of [375, 1280]) {
    test(`axe: no serious violations and no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/designs/modern-church');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modern Church Platform');
      await page.waitForLoadState('networkidle');
      expect(await seriousAxe(page)).toEqual([]);
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      expect(sw).toBeLessThanOrEqual(iw);
    });
  }

  test('no console errors other than missing image 404s', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load resource/i.test(m.text())) errors.push(m.text()); });
    await page.goto('/designs/modern-church');
    await page.waitForLoadState('networkidle');
    await page.goto('/designs');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});

test.describe('internal links are extensionless (Ruling H)', () => {
  for (const path of ['/', '/designs', '/designs/modern-church']) {
    test(`no same-origin href ends in .html on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#site-footer footer')).toBeAttached();
      if (path !== '/') await expect(page.locator('main a.design-card').first()).toBeAttached();
      const bad = await page.evaluate(() => [...document.querySelectorAll('a[href]')]
        .map((a) => new URL(a.getAttribute('href'), location.href))
        .filter((u) => u.origin === location.origin && /\.html$/.test(u.pathname))
        .map((u) => u.pathname + u.search));
      expect(bad).toEqual([]);
    });
  }
});
