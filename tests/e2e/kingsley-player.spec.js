import { test, expect } from '@playwright/test';

const KA = '/preview/kingsley/';
// Real home play buttons: the latest release (built from catalogue[0]) and a row card.
const PLAY_6 = '#latest button[data-play="LqwYHMrrYK0"]';
const PLAY_5 = '.ka-row button[data-play="JfxWXop_01c"]';

// Fake YouTube IFrame API: tests never touch the network. Like the real one,
// playVideo / loadVideoById report PLAYING a moment later, unless the test
// blocks autoplay (__ytBlocked: stays UNSTARTED, as on an iPhone) or drives
// the states by hand (__ytManual).
const FAKE_YT = `
  window.__ytPlayers ??= [];
  window.YT = {
    PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
    Player: class {
      constructor(el, opts) {
        this.opts = opts; this.calls = []; this.state = -1;
        window.__ytPlayers.push(this);
        // Like the real API: replace the mount element with an iframe.
        const f = document.createElement('iframe');
        f.title = 'YouTube video player';
        f.src = 'about:blank';
        el.replaceWith(f);
        if (!window.__ytNoReady) setTimeout(() => opts.events.onReady({ target: this }));
      }
      emit(s) { this.state = s; this.opts.events.onStateChange({ data: s, target: this }); }
      start() {
        if (window.__ytManual || window.__ytBlocked) return;
        setTimeout(() => this.emit(1), 50);
      }
      playVideo() { this.calls.push('play'); this.start(); }
      pauseVideo() { this.calls.push('pause'); this.state = 2; }
      loadVideoById(id) { this.calls.push('load:' + id); this.start(); }
      getPlayerState() { return this.state; }
      getCurrentTime() { return 0; }
      getDuration() { return 100; }
    },
  };
  window.onYouTubeIframeAPIReady();
`;

async function stubYouTube(page, { noReady = false, blocked = false, manual = false } = {}) {
  // Defined before any page script runs, so waits on __ytPlayers never throw
  // while the (delayed) API script is still on its way.
  await page.addInitScript(() => { window.__ytPlayers = []; });
  if (noReady) await page.addInitScript(() => { window.__ytNoReady = true; });
  if (blocked) await page.addInitScript(() => { window.__ytBlocked = true; });
  if (manual) await page.addInitScript(() => { window.__ytManual = true; });
  // The API arrives after a short delay, as over a real network, so tests cannot
  // depend on it having loaded by the time the click returns.
  await page.route('**/iframe_api', async (route) => {
    await new Promise((r) => setTimeout(r, 300));
    await route.fulfill({ status: 200, contentType: 'text/javascript', body: FAKE_YT });
  });
}

// Main menu link: on phones the links sit behind the Menu button.
async function navTo(page, name) {
  const btn = page.locator('.ka-menu-btn');
  if (await btn.isVisible()) await btn.click();
  await page.locator('.ka-nav').getByRole('link', { name, exact: true }).click();
}

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('Kingsley persistent player', () => {
  // Keep the latest-release block as built, so PLAY_6 is stable.
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/kingsley/latest', (route) => route.abort());
  });

  test('no YouTube script, iframe or video request before the first play', async ({ page }) => {
    // Thumbnails (i.ytimg.com) are lazy <img>s on the home page and Chrome's
    // lazy-load margin may fetch them early; the player itself must not load.
    const third = [];
    page.on('request', (r) => { if (/youtube|googlevideo/.test(r.url())) third.push(r.url()); });
    await page.goto(KA);
    await page.waitForTimeout(1500);
    expect(third).toEqual([]);
    await expect(page.locator('iframe')).toHaveCount(0);
    const eager = await page.locator('img[src*="ytimg.com"]').evaluateAll((imgs) => imgs.filter((i) => i.loading !== 'lazy').length);
    expect(eager).toBe(0);
    await expect(page.locator('#ka-player')).toBeHidden();
  });

  test('clicking play shows the bar with the title, thumbnail and controls', async ({ page }) => {
    const errors = collectErrors(page);
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    const bar = page.locator('#ka-player');
    await expect(bar).toBeVisible();
    await expect(bar).toContainText('Deeper Worship 6.0');
    await expect(bar.locator('img')).toHaveAttribute('src', 'https://i.ytimg.com/vi/LqwYHMrrYK0/mqdefault.jpg');
    await expect(bar.locator('[role="progressbar"]')).toHaveCount(1);
    for (const b of await bar.locator('button').all()) await expect(b).toHaveAttribute('aria-label', /.+/);
    await page.waitForFunction(() => window.__ytPlayers.length === 1);
    const opts = await page.evaluate(() => window.__ytPlayers[0].opts);
    expect(opts.host).toBe('https://www.youtube-nocookie.com');
    expect(opts.videoId).toBe('LqwYHMrrYK0');
    expect(errors).toEqual([]);
  });

  test('next moves through the queue and stops at the end', async ({ page }) => {
    await stubYouTube(page, { manual: true }); // the test sends ENDED itself
    await page.goto(KA);
    await page.locator(PLAY_5).click();
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
    await page.locator(PLAY_6).click();
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
    await page.locator(PLAY_6).click();
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
    await expect(page.locator('h1')).toHaveText('Revived to revive.');
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
      await page.locator(PLAY_6).click();
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
      await navTo(page, 'Music');
      await expect(page.locator('h1')).toHaveText('Music');
      await check();
      await page.locator('#ka-player').getByRole('button', { name: 'Enlarge video' }).click();
      await check();
    });
  }

  test('close stops playback and hides the player and its video', async ({ page }) => {
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    await expect(page.locator('#ka-player iframe')).toBeVisible();
    await page.waitForFunction(() => window.__ytPlayers[0]?.calls.includes('play'));
    await page.locator('#ka-player').getByRole('button', { name: 'Close player' }).click();
    await expect(page.locator('#ka-player')).toBeHidden();
    await expect(page.locator('#ka-player iframe')).toHaveCount(0);
    expect(await page.evaluate(() => window.__ytPlayers[0].calls.at(-1))).toBe('pause');
    // Playing again brings it back with a fresh player.
    await page.locator(PLAY_5).click();
    await expect(page.locator('#ka-player iframe')).toBeVisible();
    await expect(page.locator('#ka-player')).toContainText('Deeper Worship 5.0');
  });

  test('a second play while the player is still starting does not throw', async ({ page }) => {
    const errors = collectErrors(page);
    await stubYouTube(page, { noReady: true });
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    await page.waitForFunction(() => window.__ytPlayers.length === 1);
    await page.locator(PLAY_5).click();
    await expect(page.locator('#ka-player')).toContainText('Deeper Worship 5.0');
    // onReady arrives late: it loads the song asked for most recently.
    await page.evaluate(() => { const p = window.__ytPlayers[0]; p.opts.events.onReady({ target: p }); });
    expect(await page.evaluate(() => window.__ytPlayers[0].calls)).toContain('load:JfxWXop_01c');
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('says Loading until YouTube reports PLAYING, then Now playing', async ({ page }) => {
    await stubYouTube(page, { manual: true });
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    const bar = page.locator('#ka-player');
    await expect(bar.locator('.ka-player__label')).toHaveText('Loading…');
    await expect(bar).toHaveClass(/is-loading/);
    await page.waitForFunction(() => window.__ytPlayers[0]?.calls.includes('play'));
    // Not "playing" yet: the toggle offers Play and the page button is not pressed.
    await expect(bar.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    await expect(page.locator(PLAY_6)).toHaveAttribute('aria-pressed', 'false');
    await page.evaluate(() => window.__ytPlayers[0].emit(1));
    await expect(bar.locator('.ka-player__label')).toHaveText('Now playing');
    await expect(bar.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
    await expect(page.locator(PLAY_6)).toHaveAttribute('aria-pressed', 'true');
    await expect(bar).not.toHaveClass(/is-loading/);
  });

  test('when autoplay is blocked (iPhone) it asks for a tap on the video', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await stubYouTube(page, { blocked: true });
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    const bar = page.locator('#ka-player');
    await page.waitForFunction(() => window.__ytPlayers[0]?.calls.includes('play'));
    // Still UNSTARTED ~1.5 s after onReady: not playing, and the bar says so (visible on phones).
    const label = bar.locator('.ka-player__label');
    await expect(label).toHaveText('Tap the video to start', { timeout: 5000 });
    await expect(label).toBeVisible();
    await expect(bar).toHaveClass(/needs-tap/);
    await expect(bar.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    await expect(page.locator(PLAY_6)).toHaveAttribute('aria-pressed', 'false');
    // The video stays visible and uncovered, so the tap reaches YouTube's own player.
    const box = await bar.locator('iframe').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(200);
    const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    expect(hit).toBe('IFRAME');
    // The tap on the video starts it: YouTube reports PLAYING.
    await page.evaluate(() => window.__ytPlayers[0].emit(1));
    await expect(label).toHaveText('Now playing');
    await expect(bar).not.toHaveClass(/needs-tap/);
  });

  test('the IFrame API is fetched on hover over a play button, not before', async ({ page }) => {
    const api = [];
    page.on('request', (r) => { if (r.url().includes('iframe_api')) api.push(r.url()); });
    await stubYouTube(page);
    await page.goto(KA);
    await page.waitForTimeout(800);
    expect(api).toEqual([]);
    await page.locator(PLAY_6).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(api).toEqual([]);
    await page.locator(PLAY_6).hover();
    await expect.poll(() => api.length).toBe(1);
    await expect(page.locator('#ka-player')).toBeHidden(); // hover alone plays nothing
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.locator(PLAY_6).click();
    await expect(page.locator('#ka-player iframe')).toBeVisible();
    expect(api).toHaveLength(1); // the click reuses the preloaded API
  });

  test('starting the player unloads a loaded Spotify embed and restores its button', async ({ page }) => {
    await page.route('**/open.spotify.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' }));
    await stubYouTube(page);
    await page.goto(KA);
    await page.getByRole('button', { name: 'Load Spotify player' }).click();
    await expect(page.locator('iframe[src*="open.spotify.com"]')).toHaveCount(1);
    await page.locator(PLAY_6).click();
    await expect(page.locator('#ka-player .ka-player__label')).toHaveText('Now playing');
    await expect(page.locator('iframe[src*="open.spotify.com"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Load Spotify player' })).toBeVisible();
    await expect(page.locator('[data-embed-box]')).not.toHaveClass(/is-loaded/);
    // And it can be loaded again (which pauses the player).
    await page.getByRole('button', { name: 'Load Spotify player' }).click();
    await expect(page.locator('iframe[src*="open.spotify.com"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.__ytPlayers[0].calls.at(-1))).toBe('pause');
  });

  test('retrying after a failed load keeps the queue', async ({ page }) => {
    await page.addInitScript(() => { window.__ytPlayers = []; });
    let calls = 0;
    await page.route('**/iframe_api', async (route) => {
      calls += 1;
      // The first load fails (slowly, so the click's play() sees it too).
      if (calls === 1) { await new Promise((r) => setTimeout(r, 300)); return route.abort(); }
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: FAKE_YT });
    });
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    const bar = page.locator('#ka-player');
    await expect(bar.getByText("Couldn't load the player.")).toBeVisible({ timeout: 10000 });
    await bar.getByRole('button', { name: 'Play', exact: true }).click();
    await expect(bar.locator('.ka-player__label')).toHaveText('Now playing');
    await expect(bar.getByText("Couldn't load the player.")).toBeHidden();
    // Next still follows the Deeper Worship queue: 6.0 -> 5.0.
    await bar.getByRole('button', { name: 'Next song' }).click();
    await expect(bar).toContainText('Deeper Worship 5.0');
    expect(await page.evaluate(() => window.__ytPlayers[0].calls)).toContain('load:JfxWXop_01c');
  });

  test('phone with the player open: one slim header row and room to read', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await stubYouTube(page);
    await page.goto(KA);
    await page.locator(PLAY_6).click();
    await expect(page.locator('#ka-player iframe')).toBeVisible();
    // Scroll into the page so the sticky header is at the top.
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const h = document.querySelector('.ka-header').getBoundingClientRect();
      const video = document.querySelector('#ka-player .ka-player__video').getBoundingClientRect();
      const bar = document.querySelector('#ka-player').getBoundingClientRect();
      return {
        header: h.height,
        headerBottom: Math.max(0, h.bottom),
        playerTop: Math.min(video.top, bar.top),
        over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(m.header).toBeLessThanOrEqual(64);
    expect(m.playerTop - m.headerBottom).toBeGreaterThanOrEqual(300);
    expect(m.over).toBeLessThanOrEqual(0);
    // The logo name stays legible.
    const nameH = await page.locator('.ka-header .ka-logo__name').evaluate((n) => n.getBoundingClientRect().height);
    expect(nameH).toBeGreaterThanOrEqual(10);
    // The menu opens over the page, works, and closes after the swap.
    const btn = page.locator('.ka-menu-btn');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.ka-nav')).toBeHidden();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.ka-nav').getByRole('link', { name: 'Music' })).toBeVisible();
    await expect(page.locator('#ka-menu').getByRole('link', { name: /Instagram/ })).toBeVisible();
    await page.locator('.ka-nav').getByRole('link', { name: 'Music' }).click();
    await expect(page.locator('h1')).toHaveText('Music');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.ka-nav')).toBeHidden();
    // Escape closes it too.
    await btn.click();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop header is unchanged: no Menu button, links in the row', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(KA);
    await expect(page.locator('.ka-menu-btn')).toBeHidden();
    await expect(page.locator('.ka-nav').getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.locator('.ka-header .ka-social__link').first()).toBeVisible();
  });

  for (const width of [768, 1024]) {
    test(`tablet / small laptop (${width}px): the header stays one row behind the Menu button`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(KA);
      await expect(page.locator('.ka-menu-btn')).toBeVisible();
      const h = await page.locator('.ka-header').evaluate((n) => n.getBoundingClientRect().height);
      expect(h).toBeLessThanOrEqual(64);
    });
  }

  test('phone menu with JavaScript off: links show in the header', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 375, height: 667 } });
    const page = await ctx.newPage();
    await page.goto(KA);
    await expect(page.locator('.ka-menu-btn')).toBeHidden();
    await expect(page.locator('.ka-nav').getByRole('link', { name: 'Contact' })).toBeVisible();
    await ctx.close();
  });

  test('shows the fallback when the player never becomes ready', async ({ page }) => {
    await page.clock.install();
    await stubYouTube(page, { noReady: true });
    await page.goto(KA);
    await page.locator(PLAY_6).click();
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
