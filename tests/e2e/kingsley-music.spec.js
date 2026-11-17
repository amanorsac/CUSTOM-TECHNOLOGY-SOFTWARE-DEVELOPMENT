import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const KA = '/preview/kingsley/';
const catalogue = JSON.parse(
  readFileSync(new URL('../../public/assets/preview/kingsley/data/catalogue.json', import.meta.url), 'utf8'),
);

const FAKE_YT = `
  window.__ytPlayers = [];
  window.YT = {
    PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0 },
    Player: class {
      constructor(el, opts) {
        this.opts = opts; this.calls = [];
        window.__ytPlayers.push(this);
        const f = document.createElement('iframe');
        f.title = 'YouTube video player'; f.src = 'about:blank';
        el.replaceWith(f);
        setTimeout(() => opts.events.onReady({ target: this }));
      }
      playVideo() { this.calls.push('play'); }
      pauseVideo() { this.calls.push('pause'); }
      loadVideoById(id) { this.calls.push('load:' + id); }
      getPlayerState() { return 1; }
      getCurrentTime() { return 0; }
      getDuration() { return 100; }
    },
  };
  window.onYouTubeIframeAPIReady();
`;
async function stubYouTube(page) {
  await page.route('**/iframe_api', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: FAKE_YT }),
  );
}

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('Kingsley music archive', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/kingsley/latest', (r) => r.abort());
    // Never hit the network for third-party media.
    await page.route(/i\.ytimg\.com|youtube-nocookie\.com|open\.spotify\.com/, (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '' }),
    );
  });

  test('one card per catalogue entry, groups in order, play + watch + release link', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`${KA}music/`);
    await expect(page.locator('h1')).toHaveText('Music');
    await expect(page.locator('main h2')).toHaveText([
      'Deeper Worship',
      'Singles and live videos',
      'Medleys',
      'THE UNVEILED',
    ]);
    const cards = page.locator('.ka-mcard');
    await expect(cards).toHaveCount(catalogue.length);
    const first = cards.first();
    await expect(first.locator('img')).toHaveAttribute('src', 'https://i.ytimg.com/vi/LqwYHMrrYK0/hqdefault.jpg');
    await expect(first.locator('img')).toHaveAttribute('loading', 'lazy');
    await expect(first.locator('img')).toHaveAttribute('alt', 'Deeper Worship 6.0');
    await expect(first.locator('button[data-play="LqwYHMrrYK0"]')).toHaveAttribute('data-queue', 'deeper-worship');
    await expect(first.locator('a[href="https://www.youtube.com/watch?v=LqwYHMrrYK0"]')).toHaveAttribute('rel', 'noopener');
    await expect(first.locator(`a[href="${KA}music/deeper-worship-6-0/"]`).first()).toBeVisible();
    // Every play button has a paired watch link.
    expect(await page.locator('main button[data-play]').count()).toBe(catalogue.length);
    expect(await page.locator('main a[href^="https://www.youtube.com/watch?v="]').count()).toBe(catalogue.length);
    expect(errors).toEqual([]);
  });

  test('no third-party iframe or script before a click', async ({ page }) => {
    const third = [];
    page.on('request', (r) => { if (/youtube\.com|spotify\.com|googlevideo/.test(r.url())) third.push(r.url()); });
    await page.goto(`${KA}music/deeper-worship-6-0/`);
    await page.waitForTimeout(800);
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(third).toEqual([]);
  });

  test('release page: play button drives the one persistent player; Spotify pauses it', async ({ page }) => {
    await stubYouTube(page);
    await page.goto(`${KA}music/deeper-worship-6-0/`);
    await expect(page.locator('h1')).toHaveText('Deeper Worship 6.0');
    await expect(page.locator('main')).toContainText('Live worship set');
    await expect(page.locator('main')).toContainText('2026');
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.locator('main button[data-play="LqwYHMrrYK0"]').first().click();
    await expect(page.locator('#ka-player')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__ytPlayers.length)).toBe(1);
    await expect.poll(() => page.evaluate(() => window.__ytPlayers[0].calls.join())).toContain('play');
    // The only YouTube iframe is the player's own, inside #ka-player.
    await expect(page.locator('iframe')).toHaveCount(1);
    await expect(page.locator('#ka-player iframe')).toHaveCount(1);
    await expect(page.locator('main iframe')).toHaveCount(0);
    // Loading Spotify pauses the player.
    await page.evaluate(() => window.__ytPlayers[0].calls.push('---'));
    await page.getByRole('button', { name: /spotify/i }).click();
    await expect(page.locator('iframe[src="https://open.spotify.com/embed/track/74MY5wWHuO8WBcTKVEMhHS"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.__ytPlayers[0].calls.join())).toContain('---,pause');
    await expect(page.locator('main').getByRole('link', { name: /Apple Music/ })).toHaveAttribute('href', /music\.apple\.com/);
  });

  test('focus lands on the h1 after each page swap (Home, Music, Home)', async ({ page }) => {
    await page.goto(KA);
    await page.locator('.ka-nav').getByRole('link', { name: 'Music' }).click();
    await expect(page.locator('h1')).toHaveText('Music');
    await expect(page.locator('h1')).toBeFocused();
    await page.locator('.ka-nav').getByRole('link', { name: 'Home' }).click();
    await expect(page.locator('h1')).toHaveText('Revived to revive.');
    await expect(page.locator('h1')).toBeFocused();
  });

  test('release page without spotifyUrl has no Spotify button; featuring shown', async ({ page }) => {
    await page.goto(`${KA}music/holy/`);
    await expect(page.locator('h1')).toHaveText('Holy');
    await expect(page.locator('main')).toContainText('Philip Adzale');
    await expect(page.getByRole('button', { name: /spotify/i })).toHaveCount(0);
    await expect(page.locator('main').getByRole('link', { name: /spotify/i })).toHaveCount(0);
    await page.goto(`${KA}music/we-will-not-bow/`);
    await expect(page.locator('main').getByRole('link', { name: /apple music/i })).toHaveCount(0);
  });

  test('every release page returns 200 with one h1', async ({ request }) => {
    for (const e of catalogue) {
      const res = await request.get(`${KA}music/${e.slug}/`);
      expect(res.status(), e.slug).toBe(200);
      expect((await res.text()).match(/<h1[\s>]/g)?.length, e.slug).toBe(1);
    }
  });
});
