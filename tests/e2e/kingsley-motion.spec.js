import { test, expect } from '@playwright/test';

// Runs against the real home page: hero carousel (video slide + 5 photos),
// split headings, fade-ups, the latest-release wedge and the live video row.
const HOME = '/preview/kingsley/';
const SPLIT = '#spotify-title'; // two lines at desktop width, well below the fold
const SPLIT_TEXT = 'Kingsley Anyenor on Spotify';
const UP = '.ka-quote__text';
const WEDGE = '#latest .ka-wedge';
const ROW = '.ka-vrow';

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

const active = (page) => page.locator('.ka-carousel .ka-slide.is-active');
const dots = (page) => page.locator('.ka-carousel .ka-carousel__dot');
const videoPaused = (page) => page.evaluate(() => document.querySelector('.ka-slide-video').paused);

async function ready(page) {
  await expect(page.locator('.ka-carousel.is-ready')).toHaveCount(1);
}

test.describe('Kingsley motion and hero carousel', () => {
  // The <head> failsafe drops motion if motion.js has not started within 2.5 s
  // (tested in kingsley-home.spec.js). Under a loaded parallel run the home page
  // can miss that window, and the reveal tests then see a page with motion off.
  // Claim motion has started so these tests always exercise motion.js itself.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__kaMotion = true; });
  });

  test('carousel never advances on its own', async ({ page }) => {
    test.setTimeout(30000);
    const errors = collectErrors(page);
    await page.goto(HOME);
    await ready(page);
    await expect(active(page)).toHaveAttribute('aria-label', '1 of 6');
    await page.waitForTimeout(7000);
    await expect(active(page)).toHaveAttribute('aria-label', '1 of 6');
    await expect(dots(page).nth(0)).toHaveAttribute('aria-current', 'true');
    expect(errors).toEqual([]);
  });

  test('dots are labelled and next moves to the following slide', async ({ page }) => {
    await page.goto(HOME);
    await ready(page);
    await expect(dots(page)).toHaveCount(6);
    await expect(dots(page).nth(1)).toHaveAttribute('aria-label', 'Slide 2 of 6');
    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect(active(page)).toHaveAttribute('aria-label', '2 of 6');
    await expect(dots(page).nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(dots(page).nth(0)).not.toHaveAttribute('aria-current', /.*/);
    await page.getByRole('button', { name: 'Previous slide' }).click();
    await expect(active(page)).toHaveAttribute('aria-label', '1 of 6');
    await dots(page).nth(2).click();
    await expect(active(page)).toHaveAttribute('aria-label', '3 of 6');
  });

  test('ArrowRight and ArrowLeft change slides when the carousel has focus', async ({ page }) => {
    await page.goto(HOME);
    await ready(page);
    await dots(page).nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(active(page)).toHaveAttribute('aria-label', '2 of 6');
    await page.keyboard.press('ArrowLeft');
    await expect(active(page)).toHaveAttribute('aria-label', '1 of 6');
  });

  test('a swipe of 40px or more changes the slide', async ({ page }) => {
    await page.goto(HOME);
    await ready(page);
    const box = await page.locator('.ka-carousel').boundingBox();
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + 600, y);
    await page.mouse.down();
    await page.mouse.move(box.x + 580, y, { steps: 3 });
    await page.mouse.up();
    await expect(active(page)).toHaveAttribute('aria-label', '1 of 6'); // 20px: too short
    await page.mouse.move(box.x + 600, y);
    await page.mouse.down();
    await page.mouse.move(box.x + 500, y, { steps: 5 });
    await page.mouse.up();
    await expect(active(page)).toHaveAttribute('aria-label', '2 of 6');
  });

  test('the slide video plays only while its slide is active', async ({ page }) => {
    await page.goto(HOME);
    await ready(page);
    await expect.poll(() => videoPaused(page), { timeout: 10000 }).toBe(false);
    const src = await page.evaluate(() => document.querySelector('.ka-slide-video').currentSrc);
    expect(src).toMatch(/hero-1920\.mp4$/);
    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(() => videoPaused(page)).toBe(true);
    await page.getByRole('button', { name: 'Previous slide' }).click();
    await expect.poll(() => videoPaused(page), { timeout: 10000 }).toBe(false);
  });

  test('narrow screens load the 960 video', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(HOME);
    await ready(page);
    await expect.poll(() => page.evaluate(() => document.querySelector('.ka-slide-video').currentSrc)).toMatch(/hero-960\.mp4$/);
  });

  test('changing page pauses the old slide video', async ({ page }) => {
    await page.goto(HOME);
    await ready(page);
    await expect.poll(() => videoPaused(page), { timeout: 10000 }).toBe(false);
    await page.evaluate(() => { window.__oldVideo = document.querySelector('.ka-slide-video'); });
    await page.locator('.ka-nav a', { hasText: 'Music' }).click();
    await expect(page.locator('#main h1')).toHaveText('Music');
    expect(await page.evaluate(() => window.__oldVideo.paused)).toBe(true);
  });

  test('reduced motion: no autoplay, the toggle plays the video, split text visible at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(HOME);
    await ready(page);
    const toggle = page.getByRole('button', { name: 'Play background video' });
    await expect(toggle).toBeVisible();
    await page.waitForTimeout(1500);
    expect(await videoPaused(page)).toBe(true);
    await toggle.click();
    await expect.poll(() => videoPaused(page), { timeout: 10000 }).toBe(false);
    await expect(page.getByRole('button', { name: 'Pause background video' })).toBeVisible();
    await page.getByRole('button', { name: 'Pause background video' }).click();
    await expect.poll(() => videoPaused(page)).toBe(true);

    expect(await page.evaluate(() => document.documentElement.classList.contains('ka-motion'))).toBe(false);
    const split = page.locator(SPLIT);
    await split.scrollIntoViewIfNeeded();
    const opacity = await split.evaluate((el) => {
      let o = 1;
      for (const n of [el, ...el.querySelectorAll('*')]) o = Math.min(o, Number(getComputedStyle(n).opacity));
      return o;
    });
    expect(opacity).toBe(1);
    await expect(split).toHaveText(SPLIT_TEXT);
  });

  test('reduced motion: the row still scrolls by its buttons', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(HOME);
    const track = page.locator(`${ROW} .ka-row__track`);
    await page.locator(ROW).scrollIntoViewIfNeeded();
    await page.locator(ROW).getByRole('button', { name: 'Next' }).click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test('split heading rises line by line and keeps its text', async ({ page }) => {
    await page.goto(HOME);
    await ready(page); // initMotion has run
    await expect(page.locator('html.ka-motion')).toHaveCount(1);
    const split = page.locator(SPLIT);
    await expect(split.locator('.ka-line').first()).toBeAttached();
    expect(await split.locator('.ka-line').count()).toBeGreaterThan(1);
    await expect(split).toHaveText(SPLIT_TEXT);
    await split.scrollIntoViewIfNeeded();
    await expect(split).toHaveClass(/is-in/);
  });

  test('.ka-up gains .is-in after scrolling into view', async ({ page }) => {
    await page.goto(HOME);
    await ready(page); // initMotion has run
    await expect(page.locator('html.ka-motion')).toHaveCount(1);
    const up = page.locator(UP);
    await page.waitForTimeout(300);
    await expect(up).not.toHaveClass(/is-in/);
    await up.scrollIntoViewIfNeeded();
    await expect(up).toHaveClass(/is-in/);
    await page.locator(WEDGE).scrollIntoViewIfNeeded();
    await expect(page.locator(WEDGE)).toHaveClass(/is-in/);
  });

  test('an element taller than seven viewports still reveals once scrolled into', async ({ page }) => {
    await page.goto(HOME);
    await ready(page); // initMotion has run
    await expect(page.locator('html.ka-motion')).toHaveCount(1);
    // No real page has one, so stretch the first pillar (a .ka-up) before it is reached.
    const tall = page.locator('.ka-pillar').first();
    await tall.evaluate((el) => { el.style.height = '750vh'; });
    const ratio = await tall.evaluate((el) => el.offsetHeight / innerHeight);
    expect(ratio).toBeGreaterThan(7);
    await expect(tall).not.toHaveClass(/is-in/);
    await tall.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY + innerHeight * 2));
    await expect(tall).toHaveClass(/is-in/);
  });

  test('printing shows reveal content that was never scrolled to', async ({ page }) => {
    await page.goto(HOME);
    await ready(page); // initMotion has run
    await expect(page.locator('html.ka-motion')).toHaveCount(1);
    await expect(page.locator(`${SPLIT}.is-split`)).toHaveCount(1);
    await expect(page.locator(UP)).not.toHaveClass(/is-in/);
    await page.emulateMedia({ media: 'print' });
    const style = await page.evaluate((sel) => {
      const up = getComputedStyle(document.querySelector(sel.UP));
      const wedge = getComputedStyle(document.querySelector(`${sel.WEDGE} > *`));
      const line = getComputedStyle(document.querySelector(`${sel.SPLIT} .ka-line__inner`));
      return { upOpacity: up.opacity, upTransform: up.transform, wedgeClip: wedge.clipPath, lineTransform: line.transform };
    }, { UP, WEDGE, SPLIT });
    expect(style).toEqual({ upOpacity: '1', upTransform: 'none', wedgeClip: 'none', lineTransform: 'none' });
  });

  test("the row's next button scrolls it and moves its dots", async ({ page }) => {
    await page.goto(HOME);
    const row = page.locator(ROW);
    const track = row.locator('.ka-row__track');
    await row.scrollIntoViewIfNeeded();
    expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(row.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await row.getByRole('button', { name: 'Next' }).click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(row.locator('.ka-row__dot[aria-current="true"]')).not.toHaveAttribute('aria-label', 'Item 1 of 6');
  });

  test('init runs once per element: calling initMotion again adds nothing', async ({ page }) => {
    await page.goto(HOME);
    await ready(page);
    await page.evaluate(async () => {
      const m = await import('/assets/preview/kingsley/js/motion.js');
      m.initMotion(document.getElementById('main'));
    });
    await expect(dots(page)).toHaveCount(6);
    await expect(page.locator(`${ROW} .ka-row__dot`)).toHaveCount(6);
    expect(await page.locator(`${SPLIT} .ka-line .ka-line`).count()).toBe(0);
  });

  test('with JavaScript off every slide and the split heading are readable', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto(HOME);
    await expect(page.locator(SPLIT)).toBeVisible();
    await expect(page.locator(UP)).toBeVisible();
    for (const n of [1, 2, 3, 4, 5, 6]) await expect(page.locator(`.ka-slide[aria-label="${n} of 6"]`)).toBeVisible();
    await ctx.close();
  });
});
