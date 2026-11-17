import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KA = '/preview/kingsley/';
const LATEST = '**/api/kingsley/latest';

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

const latest = (page) => page.locator('#latest');

test.describe('Kingsley home', () => {
  // Never hit the live YouTube feed: abort by default; tests that need an
  // answer register their own route (later routes win).
  test.beforeEach(async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
  });

  test('one h1, hero carousel of six slides led by the live video', async ({ page }) => {
    const errors = collectErrors(page);
    await page.route(LATEST, (r) => r.abort());
    await page.goto(KA);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Revived to revive.');
    await expect(page.getByText('Kingsley Anyenor · The Refined · Accra')).toBeVisible();
    const slides = page.locator('.ka-carousel .ka-slide');
    await expect(slides).toHaveCount(6);
    const video = slides.first().locator('video');
    await expect(video).toHaveCount(1);
    for (const attr of ['muted', 'loop', 'playsinline']) await expect(video).toHaveAttribute(attr, /.*/);
    await expect(video).toHaveAttribute('poster', /hero-poster\.webp$/);
    await expect(page.getByRole('link', { name: 'Listen now' })).toHaveAttribute('href', '#latest');
    await expect(page.getByRole('link', { name: 'Book Kingsley' })).toHaveAttribute('href', '/preview/kingsley/book/');
    expect(errors).toEqual([]);
  });

  test('latest release swaps in the feed result', async ({ page }) => {
    await page.route(LATEST, (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, youtubeId: 'ZZZZZZZZZZZ', title: 'New Song', published: '2026-12-01T08:00:00Z', source: 'feed' }),
      }),
    );
    await page.goto(KA);
    const block = latest(page);
    await expect(block).toContainText('New Song');
    await expect(block).toContainText('1 Dec 2026');
    await expect(block.locator('a[href="https://www.youtube.com/watch?v=ZZZZZZZZZZZ"]').first()).toBeVisible();
    await expect(block.locator('a[href*="spotify.com"]')).toHaveCount(0);
    await expect(block.locator('a[href*="music.apple.com"]')).toHaveCount(0);
    await expect(block.locator('button[data-play="ZZZZZZZZZZZ"]')).toHaveCount(1);
    await expect(block.locator('img')).toHaveAttribute('src', 'https://i.ytimg.com/vi/ZZZZZZZZZZZ/hqdefault.jpg');
  });

  test('latest release stays as built when the request fails', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.goto(KA);
    const block = latest(page);
    await expect(block).toContainText('Deeper Worship 6.0');
    await expect(block.locator('button[data-play="LqwYHMrrYK0"]')).toHaveCount(1);
    await expect(block.locator('a[href*="spotify.com"]')).toHaveCount(1);
    await expect(block.locator('a[href*="music.apple.com"]')).toHaveCount(1);
  });

  test('a fallback answer never shows a null date', async ({ page }) => {
    await page.route(LATEST, (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, youtubeId: 'JfxWXop_01c', title: 'Deeper Worship 5.0', published: null, source: 'fallback' }),
      }),
    );
    await page.goto(KA);
    const block = latest(page);
    await expect(block).toContainText('Deeper Worship 5.0');
    await expect(block).not.toContainText('null');
    await expect(block).not.toContainText('Invalid');
    // A catalogue entry: its streaming links are used.
    await expect(block.locator('a[href*="spotify.com"]')).toHaveCount(1);
  });

  test('video row has six cards and a link to more videos', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.goto(KA);
    const cards = page.locator('.ka-row .ka-row__track > *');
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toContainText('Deeper Worship 3.0');
    await expect(page.getByRole('link', { name: 'More videos' })).toHaveAttribute('href', '/preview/kingsley/music/');
  });

  test('every play button has a Watch on YouTube link beside it', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.goto(KA);
    const ids = await page.locator('main button[data-play]').evaluateAll((bs) => bs.map((b) => b.dataset.play));
    expect(ids.length).toBeGreaterThanOrEqual(8);
    for (const id of new Set(ids)) {
      await expect(page.locator(`main a[href="https://www.youtube.com/watch?v=${id}"]`).first()).toHaveAttribute('rel', /noopener/);
    }
  });

  test('quote, pillars and events strip carry the exact words', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.goto(KA);
    const main = page.locator('main');
    await expect(main).toContainText('A new generation arose who knew not Jesus but they met me! I reveal the Glorified Jesus in my generation!');
    await expect(main).toContainText("Igniting a fresh hunger for God's presence in churches, campuses, and communities.");
    await expect(main).toContainText('Calling believers back to a life of holiness, intimacy, and wholehearted surrender to Christ.');
    await expect(main).toContainText('Ministering healing, hope, and spiritual renewal through the prophetic power of worship and the Word.');
    await expect(main).toContainText('Malachi 3:1–3');
    await expect(page.getByRole('link', { name: 'About The Refined' })).toHaveAttribute('href', '/preview/kingsley/the-refined/');
    await expect(page.locator('a[href="/preview/kingsley/events/"]', { hasText: 'The Refined Experience 2027' })).toBeVisible();
  });

  test('live band button plays the newest release enlarged', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.route('**/iframe_api', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.YT={PlayerState:{},Player:class{constructor(){}}};' }));
    await page.goto(KA);
    const btn = page.locator('.ka-parallax button[data-play]');
    await expect(btn).toHaveCount(1);
    await expect(btn).toHaveAttribute('data-play', 'LqwYHMrrYK0');
    await expect(btn).toHaveAttribute('data-expand', /.*/);
    await btn.click();
    await expect(page.locator('#ka-player')).toHaveClass(/is-expanded/);
  });

  test('Spotify iframe is absent until the button is clicked', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    const spotify = [];
    page.on('request', (r) => { if (/spotify/.test(r.url())) spotify.push(r.url()); });
    await page.route('**/open.spotify.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' }));
    await page.goto(KA);
    await page.waitForTimeout(500);
    await expect(page.locator('iframe[src*="spotify"]')).toHaveCount(0);
    expect(spotify).toEqual([]);
    await page.getByRole('button', { name: 'Load Spotify player' }).click();
    await expect(page.locator('iframe[src="https://open.spotify.com/embed/artist/1TlaDAmkhwEJv7qz6WfsqE"]')).toHaveCount(1);
  });

  test('no third-party script or iframe on load', async ({ page }) => {
    const third = [];
    page.on('request', (r) => {
      if (['script', 'document', 'xhr', 'fetch'].includes(r.resourceType()) && !r.url().startsWith('http://localhost')) third.push(r.url());
    });
    await page.goto(KA);
    await page.waitForTimeout(800);
    expect(third).toEqual([]);
  });

  test('no horizontal scroll at 375x812', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(KA);
    await page.waitForTimeout(300);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
  });

  test('content is not left hidden when app.js fails to load', async ({ page }) => {
    await page.route('**/js/app.js', (r) => r.abort());
    await page.goto(KA);
    await expect(page.locator('h1')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('html')).not.toHaveClass(/ka-motion/);
    await expect(page.locator('#latest .ka-latest__links')).toBeVisible();
  });

  test('the head failsafe un-hides content when app.js is very slow', async ({ page }) => {
    await page.route('**/js/app.js', async (r) => {
      await new Promise((res) => setTimeout(res, 6000));
      await r.continue().catch(() => {});
    });
    await page.goto(KA, { waitUntil: 'commit' });
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('html')).not.toHaveClass(/ka-motion/);
  });

  test('readable with JavaScript off', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto(KA);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#latest')).toContainText('Deeper Worship 6.0');
    await expect(page.locator('.ka-pillars h3').first()).toBeVisible();
    await ctx.close();
  });

  test('axe finds no serious or critical violations', async ({ page }) => {
    await page.route(LATEST, (r) => r.abort());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(KA);
    await expect(page.locator('.ka-carousel.is-ready')).toHaveCount(1);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(
      axe.violations
        .filter((v) => ['serious', 'critical'].includes(v.impact))
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`),
    ).toEqual([]);
  });
});
