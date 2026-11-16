import { test, expect } from '@playwright/test';

const KA = '/preview/kingsley/';

// Fake YouTube IFrame API: tests never touch the network.
const FAKE_YT = `
  window.__ytPlayers = [];
  window.YT = {
    PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0 },
    Player: class {
      constructor(el, opts) {
        this.opts = opts; this.calls = [];
        window.__ytPlayers.push(this);
        // Like the real API: replace the mount element with an iframe.
        const f = document.createElement('iframe');
        f.title = 'YouTube video player';
        f.src = 'about:blank';
        el.replaceWith(f);
        if (!window.__ytNoReady) setTimeout(() => opts.events.onReady({ target: this }));
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

async function stubYouTube(page, { noReady = false } = {}) {
  if (noReady) await page.addInitScript(() => { window.__ytNoReady = true; });
  await page.route('**/iframe_api', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: FAKE_YT }),
  );
}

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('Kingsley persistent player', () => {
  test('no YouTube request before the first play', async ({ page }) => {
    const third = [];
    page.on('request', (r) => { if (/youtube|ytimg|googlevideo/.test(r.url())) third.push(r.url()); });
    await page.goto(KA);
    await page.waitForTimeout(800);
    expect(third).toEqual([]);
    await expect(page.locator('#ka-player')).toBeHidden();
  });

  test('clicking play shows the bar with the title, thumbnail and controls', async ({ page }) => {
    const errors = collectErrors(page);
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator('button[data-play="LqwYHMrrYK0"]').click();
    const bar = page.locator('#ka-player');
    await expect(bar).toBeVisible();
    await expect(bar).toContainText('Deeper Worship 6.0');
    await expect(bar.locator('img')).toHaveAttribute('src', 'https://i.ytimg.com/vi/LqwYHMrrYK0/mqdefault.jpg');
    await expect(bar.locator('[role="progressbar"]')).toHaveCount(1);
    for (const b of await bar.locator('button').all()) await expect(b).toHaveAttribute('aria-label', /.+/);
    const opts = await page.evaluate(() => window.__ytPlayers[0].opts);
    expect(opts.host).toBe('https://www.youtube-nocookie.com');
    expect(opts.videoId).toBe('LqwYHMrrYK0');
    expect(errors).toEqual([]);
  });

  test('next moves through the queue and stops at the end', async ({ page }) => {
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator('button[data-play="JfxWXop_01c"]').click();
    const bar = page.locator('#ka-player');
    await expect(bar).toContainText('Deeper Worship 5.0');
    await page.waitForFunction(() => window.__ytPlayers.length === 1);
    // ENDED moves to the next Deeper Worship entry (catalogue order, newest first).
    await page.evaluate(() => window.__ytPlayers[0].opts.events.onStateChange({ data: 0 }));
    await expect(bar).not.toContainText('Deeper Worship 5.0');
    await expect(bar).toContainText('Deeper Worship');
    await expect(bar).toContainText('Deeper Worship 4.0');
    const loads = () => page.evaluate(() => window.__ytPlayers[0].calls.filter((c) => c.startsWith('load:')));
    expect(await loads()).toHaveLength(1);
    // Through 3.0, Vol. 2, Vol. 1, then the end of the queue: no wrap, playback stops.
    for (const title of ['Deeper Worship 3.0', 'Deeper Worship Vol. 2', 'Deeper Worship Vol. 1']) {
      await page.evaluate(() => window.__ytPlayers[0].opts.events.onStateChange({ data: 0 }));
      await expect(bar).toContainText(title);
    }
    await page.evaluate(() => window.__ytPlayers[0].opts.events.onStateChange({ data: 0 }));
    await expect(bar.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    await expect(bar).toContainText('Deeper Worship Vol. 1');
    expect(await loads()).toHaveLength(4);
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(1);
  });

  test('shows a fallback when the YouTube API cannot load', async ({ page }) => {
    await page.route('**/iframe_api', (route) => route.abort());
    await page.goto(KA);
    await page.locator('button[data-play="LqwYHMrrYK0"]').click();
    const bar = page.locator('#ka-player');
    await expect(bar).toContainText("Couldn't load the player.", { timeout: 10000 });
    await expect(bar.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute(
      'href', 'https://www.youtube.com/watch?v=LqwYHMrrYK0',
    );
  });

  test('playback survives moving to another page', async ({ page }) => {
    const errors = collectErrors(page);
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator('button[data-play="LqwYHMrrYK0"]').click();
    await expect(page.locator('#ka-player')).toBeVisible();
    await page.evaluate(() => { window.__kaMarker = 1; });
    await page.locator('.ka-nav').getByRole('link', { name: 'Music' }).click();
    await expect(page).toHaveURL(/\/preview\/kingsley\/music\/$/);
    await expect(page).toHaveTitle(/^Music \| Kingsley Anyenor/);
    await expect(page.locator('h1')).toHaveText('Music');
    await expect(page.locator('h1')).toBeFocused();
    expect(await page.evaluate(() => window.__kaMarker)).toBe(1);
    await expect(page.locator('#ka-player')).toBeVisible();
    await expect(page.locator('.ka-nav a[aria-current="page"]')).toHaveText('Music');
    // Back button swaps the page back, still without a full load.
    await page.goBack();
    await expect(page.locator('h1')).toHaveText('Kingsley Anyenor');
    expect(await page.evaluate(() => window.__kaMarker)).toBe(1);
    await expect(page.locator('#ka-player')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('falls back to a full navigation when the page fetch fails', async ({ page }) => {
    await page.goto(KA);
    await page.evaluate(() => { window.__kaMarker = 1; });
    await page.route('**/preview/kingsley/music/**', (route) =>
      route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server error</h1>' }),
    );
    await page.locator('.ka-nav').getByRole('link', { name: 'Music' }).click();
    await expect(page).toHaveURL(/\/preview\/kingsley\/music\/$/);
    await expect.poll(() => page.evaluate(() => window.__kaMarker)).toBeUndefined();
  });

  test('nav links work with JavaScript off', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto(KA);
    await page.locator('.ka-nav').getByRole('link', { name: 'Music' }).click();
    await expect(page).toHaveURL(/\/preview\/kingsley\/music\/$/);
    await expect(page.locator('h1')).toHaveText('Music');
    await ctx.close();
  });

  for (const [label, size] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 375, height: 812 }]]) {
    test(`the playing video is visible and at least 200x200 (${label})`, async ({ page }) => {
      await page.setViewportSize(size);
      await stubYouTube(page);
      await page.goto(KA);
      await page.locator('button[data-play="LqwYHMrrYK0"]').click();
      const frame = page.locator('#ka-player iframe');
      await expect(frame).toBeVisible();
      const check = async () => {
        const box = await frame.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(200);
        expect(box.height).toBeGreaterThanOrEqual(200);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(size.width);
        const style = await frame.evaluate((f) => {
          let o = 1;
          for (let n = f; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
          return o;
        });
        expect(style).toBe(1);
        // Nothing covers the middle of the video.
        const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, {
          x: box.x + box.width / 2, y: box.y + box.height / 2,
        });
        expect(hit).toBe('IFRAME');
      };
      await check();
      // Still visible after moving page, and after enlarging.
      await page.locator('.ka-nav').getByRole('link', { name: 'Music' }).click();
      await expect(page.locator('h1')).toHaveText('Music');
      await check();
      await page.locator('#ka-player').getByRole('button', { name: 'Enlarge video' }).click();
      await check();
    });
  }

  test('close stops playback and hides the player and its video', async ({ page }) => {
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator('button[data-play="LqwYHMrrYK0"]').click();
    await expect(page.locator('#ka-player iframe')).toBeVisible();
    await page.waitForFunction(() => window.__ytPlayers[0]?.calls.includes('play'));
    await page.locator('#ka-player').getByRole('button', { name: 'Close player' }).click();
    await expect(page.locator('#ka-player')).toBeHidden();
    await expect(page.locator('#ka-player iframe')).toHaveCount(0);
    expect(await page.evaluate(() => window.__ytPlayers[0].calls.at(-1))).toBe('pause');
    // Playing again brings it back with a fresh player.
    await page.locator('button[data-play="JfxWXop_01c"]').click();
    await expect(page.locator('#ka-player iframe')).toBeVisible();
    await expect(page.locator('#ka-player')).toContainText('Deeper Worship 5.0');
  });

  test('a second play while the player is still starting does not throw', async ({ page }) => {
    const errors = collectErrors(page);
    await stubYouTube(page, { noReady: true });
    await page.goto(KA);
    await page.locator('button[data-play="LqwYHMrrYK0"]').click();
    await page.waitForFunction(() => window.__ytPlayers.length === 1);
    await page.locator('button[data-play="JfxWXop_01c"]').click();
    await expect(page.locator('#ka-player')).toContainText('Deeper Worship 5.0');
    // onReady arrives late: it loads the song asked for most recently.
    await page.evaluate(() => { const p = window.__ytPlayers[0]; p.opts.events.onReady({ target: p }); });
    expect(await page.evaluate(() => window.__ytPlayers[0].calls)).toContain('load:JfxWXop_01c');
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('shows the fallback when the player never becomes ready', async ({ page }) => {
    await page.clock.install();
    await stubYouTube(page, { noReady: true });
    await page.goto(KA);
    await page.locator('button[data-play="LqwYHMrrYK0"]').click();
    await page.waitForFunction(() => window.__ytPlayers.length === 1);
    const bar = page.locator('#ka-player');
    await expect(bar.getByText("Couldn't load the player.")).toBeHidden();
    await page.clock.runFor(8100);
    await expect(bar).toContainText("Couldn't load the player.");
    await expect(bar.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute(
      'href', 'https://www.youtube.com/watch?v=LqwYHMrrYK0',
    );
    await expect(bar.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    await expect(bar.locator('iframe')).toHaveCount(0);
  });
});
