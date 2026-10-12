import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const OL = '/showcase/osteria-lume';

test('every showpiece says, visibly, that the organization is fictional', async ({ page }) => {
  for (const slug of ['osteria-lume', 'juniper-vale', 'basecamp', 'lanternway']) {
    await page.goto(`/showcase/${slug}?still=1`);
    await expect(page.locator('a[class$="-badge"]')).toContainText('Fictional organization');
    await expect(page.locator('a[class$="-badge"]')).toBeVisible();
  }
});

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
    await page.goto('/designs/consulting-firm');
    await expect(page.locator('[data-d="showcase"]')).toBeHidden();
  });
});

const JV = '/showcase/juniper-vale';

test.describe('Juniper & Vale showpiece', () => {
  test('loads live: one h1, the preloader hands over, no errors', async ({ page, browserName }) => {
    const errors = collectErrors(page);
    const res = await page.goto(JV);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const mode = await page.locator('html').getAttribute('data-jv-mode');
    if (browserName === 'webkit') expect(['live', 'nowebgl']).toContain(mode); else expect(mode).toBe('live');
    await expect(page.locator('[data-pre]')).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator('a.jv-badge')).toHaveAttribute('href', '/designs/real-estate');
    expect(errors).toEqual([]);
  });

  test('a listing opens into the detail view and Escape closes it', async ({ page }) => {
    await page.goto(`${JV}?still=1`);
    await expect(page.locator('.jv-card')).toHaveCount(6);
    await page.locator('.jv-card').first().click();
    await expect(page.locator('[data-detail]')).toHaveClass(/is-open/);
    await expect(page.locator('[data-detail-title]')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-detail]')).not.toHaveClass(/is-open/);
  });

  test('search narrows the homes; Rent shows monthly prices', async ({ page }) => {
    await page.goto(`${JV}?still=1`);
    await page.locator('#q').fill('harbor');
    await page.locator('[data-search]').getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('.jv-card')).toHaveCount(1);
    await page.getByRole('radio', { name: 'Rent' }).click();
    await expect(page.getByRole('radio', { name: 'Rent' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.jv-card__price').first()).toContainText('/mo');
  });

  test('before/after slider, mortgage and neighborhood tabs respond', async ({ page }) => {
    await page.goto(`${JV}?still=1`);
    await page.locator('[data-ba-range]').fill('20');
    expect(await page.locator('[data-ba]').evaluate((el) => el.style.getPropertyValue('--x'))).toBe('20%');
    const before = await page.locator('[data-calc-text]').textContent();
    await page.locator('#c-rate').fill('8');
    await expect(page.locator('[data-calc-text]')).not.toHaveText(before);
    await expect(page.locator('[data-calc-text]')).toContainText('per month');
    await page.locator('[data-map-tabs] button', { hasText: 'Mountain Views' }).click();
    await expect(page.locator('[data-map-tabs] button', { hasText: 'Mountain Views' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-map-card] h3')).toHaveText('Mountain Views');
  });

  test('reduced motion: still version, accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(JV);
    await expect(page.locator('html')).toHaveClass(/jv-static/);
    await expect(page.locator('[data-pre]')).toHaveCount(0);
    await expect(page.locator('[data-plan-svg]')).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });

  test('no WebGL: still hero, plan and map, no errors', async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : get.call(this, t, ...a); };
    });
    const errors = collectErrors(page);
    await page.goto(JV);
    await expect(page.locator('html')).toHaveAttribute('data-jv-mode', 'nowebgl');
    await expect(page.locator('[data-plan-svg]')).toBeVisible();
    await expect(page.locator('.jv-card')).toHaveCount(6);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(JV);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the real-estate design page links to the live showpiece', async ({ page }) => {
    await page.goto('/designs/real-estate');
    await expect(page.locator('[data-d="showcase"]')).toBeVisible();
    await expect(page.locator('[data-d="showcase"]')).toHaveAttribute('href', JV);
  });
});

const BC = '/showcase/basecamp';

test.describe('Basecamp showpiece', () => {
  test('loads live: one h1, the preloader hands over, no errors', async ({ page, browserName }) => {
    const errors = collectErrors(page);
    const res = await page.goto(BC);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Find your people.');
    const mode = await page.locator('html').getAttribute('data-bc-mode');
    if (browserName === 'webkit') expect(['live', 'nowebgl']).toContain(mode); else expect(mode).toBe('live');
    await expect(page.locator('[data-pre]')).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator('a.bc-badge')).toHaveAttribute('href', '/designs/youth-ministry');
    expect(errors).toEqual([]);
  });

  test('retreat registration: needs a name, a grade and all three, then confirms and takes a spot', async ({ page }) => {
    await page.goto(`${BC}?still=1`);
    const go = page.locator('[data-reg-go]');
    await expect(page.locator('[data-unit="d"]')).toHaveText(/^\d\d+$/);
    await expect(go).toBeDisabled();
    await page.locator('#reg-name').fill('Maya');
    await page.locator('[data-grades]').getByRole('radio', { name: '9' }).click();
    await expect(go).toBeDisabled();
    for (const n of ['Permission form', 'Medical info']) await page.getByLabel(n).check();
    await expect(go).toBeDisabled();
    await page.getByLabel(/Payment/).check();
    await expect(go).toBeEnabled();
    await go.click();
    await expect(page.locator('[data-reg-done]')).toBeVisible();
    await expect(page.locator('[data-reg-msg]')).toHaveText("Maya, you're going to Cedar Ridge.");
    await expect(page.locator('[data-spots-tag]')).toHaveText('17 spots left');
    await page.locator('[data-reg-again]').click();
    await expect(page.locator('[data-reg-form]')).toBeVisible();
    await expect(go).toBeDisabled();
  });

  test('group finder matches a grade and an interest', async ({ page }) => {
    await page.goto(`${BC}?still=1`);
    await page.getByRole('button', { name: 'High school' }).click();
    await page.getByRole('button', { name: 'Music' }).click();
    await expect(page.locator('[data-match]')).toHaveClass(/is-flipped/);
    await expect(page.locator('[data-match-body] h3')).toHaveText('Worship Team');
    await page.getByRole('button', { name: 'Middle school' }).click();
    await expect(page.locator('[data-match-body] h3')).toHaveText('Garage Band');
  });

  test('check-in pass checks in and resets; parents update expands', async ({ page }) => {
    await page.goto(`${BC}?still=1`);
    await expect(page.locator('[data-qr] rect').first()).toBeAttached();
    await page.locator('[data-checkin]').click();
    await expect(page.locator('[data-pass-status]')).toContainText('Checked in');
    await page.locator('[data-checkin]').click();
    await expect(page.locator('[data-pass-status]')).toContainText('Tonight');
    const more = page.locator('[data-more-btn]');
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#update-more')).toBeVisible();
  });

  test('reduced motion: still version, accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BC);
    await expect(page.locator('html')).toHaveClass(/bc-static/);
    await expect(page.locator('[data-pre]')).toHaveCount(0);
    await expect(page.locator('[data-fire-img]')).toBeVisible();
    await expect(page.locator('.bc-pol').first()).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });

  test('no WebGL: the photo stays and the rest still moves, no errors', async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : get.call(this, t, ...a); };
    });
    const errors = collectErrors(page);
    await page.goto(BC);
    await expect(page.locator('html')).toHaveAttribute('data-bc-mode', 'nowebgl');
    await expect(page.locator('html')).toHaveClass(/bc-live/);
    await expect(page.locator('[data-fire-img]')).toBeVisible();
    await expect(page.locator('[data-fire]')).not.toHaveClass(/is-gl/);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BC);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the youth ministry design page links to the live showpiece', async ({ page }) => {
    await page.goto('/designs/youth-ministry');
    await expect(page.locator('[data-d="showcase"]')).toBeVisible();
    await expect(page.locator('[data-d="showcase"]')).toHaveAttribute('href', BC);
  });
});

const LW = '/showcase/lanternway';

test.describe('Lanternway showpiece', () => {
  test('loads live: one h1, the preloader hands over, no errors', async ({ page, browserName }) => {
    const errors = collectErrors(page);
    const res = await page.goto(LW);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('A place to belong.');
    const mode = await page.locator('html').getAttribute('data-lw-mode');
    if (browserName === 'webkit') expect(['live', 'nowebgl']).toContain(mode); else expect(mode).toBe('live');
    await expect(page.locator('[data-pre]')).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator('a.lw-badge')).toHaveAttribute('href', '/designs/modern-church');
    expect(errors).toEqual([]);
  });

  test('the sermon player plays, lights the transcript and seeks', async ({ page }) => {
    await page.goto(`${LW}?still=1`);
    await expect(page.locator('[data-time]')).toHaveText('0:00 / 38:00');
    await page.getByRole('button', { name: 'Play sermon' }).click();
    await expect(page.getByRole('button', { name: 'Pause sermon' })).toBeVisible();
    await expect(page.locator('.tw.on').first()).toBeAttached({ timeout: 5000 });
    await page.getByRole('button', { name: 'Pause sermon' }).click();
    const wave = page.locator('[data-wave]'), box = await wave.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('[data-time]')).toHaveText(/^1[89]:\d\d \/ 38:00$/);
  });

  test('sermon library filters by series and search', async ({ page }) => {
    await page.goto(`${LW}?still=1`);
    const shown = page.locator('.lw-sermon:not([hidden])');
    await expect(shown).toHaveCount(8);
    await page.getByRole('button', { name: 'Romans' }).click();
    await expect(shown).toHaveCount(3);
    await page.getByRole('button', { name: 'All series' }).click();
    await page.getByPlaceholder('Search sermons').fill('light');
    await expect(shown).toHaveCount(1);
    await expect(shown.locator('h3')).toHaveText('Light in the Dark');
    await page.getByPlaceholder('Search sermons').fill('zzz');
    await expect(page.locator('[data-sermon-empty]')).toBeVisible();
  });

  test('giving: monthly, one time and other amounts update the impact, then thank you', async ({ page }) => {
    await page.goto(`${LW}?still=1`);
    const go = page.locator('[data-give-go]');
    await expect(go).toHaveText('Give $50 monthly');
    await expect(page.locator('[data-yearly]')).toHaveText('$600');
    await page.getByRole('switch', { name: 'Monthly' }).click();
    await expect(go).toHaveText('Give $50');
    await expect(page.locator('[data-share="0"]')).toHaveText('$25');
    await expect(page.locator('[data-other]')).toBeHidden();
    await page.getByRole('radio', { name: 'Other' }).click();
    await expect(page.locator('[data-other]')).toBeVisible();
    await page.locator('[data-other-in]').fill('120');
    await expect(go).toHaveText('Give $120');
    await go.click();
    await expect(page.locator('[data-thanks]')).toBeVisible();
    await expect(page.locator('[data-thanks-msg]')).toContainText('$120 gift to the General Fund');
    await page.locator('[data-give-again]').click();
    await expect(go).toBeVisible();
  });

  test('prayer request needs words, then confirms; events register', async ({ page }) => {
    await page.goto(`${LW}?still=1`);
    const send = page.locator('[data-prayer-go]');
    await expect(send).toBeDisabled();
    await page.locator('[data-prayer-text]').fill('For my mom, starting a new job.');
    await page.getByRole('switch', { name: 'Keep this private' }).click();
    await expect(page.getByRole('switch', { name: 'Keep this private' })).toHaveAttribute('aria-checked', 'true');
    await send.click();
    await expect(page.locator('[data-prayer-status]')).toContainText('Sent.');
    await expect(page.locator('[data-prayer-text]')).toHaveValue('');
    const reg = page.locator('[data-register]').first();
    await reg.click();
    await expect(reg).toHaveAttribute('aria-pressed', 'true');
    await expect(reg).toHaveText('Registered ✓');
  });

  test('reduced motion: still version, accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(LW);
    await expect(page.locator('html')).toHaveClass(/lw-static/);
    await expect(page.locator('[data-pre]')).toHaveCount(0);
    await expect(page.locator('[data-hero-img]')).toBeVisible();
    await expect(page.locator('.lw-stops li').first()).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });

  test('no WebGL: the photo hero, and the rest still moves, no errors', async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : get.call(this, t, ...a); };
    });
    const errors = collectErrors(page);
    await page.goto(LW);
    await expect(page.locator('html')).toHaveAttribute('data-lw-mode', 'nowebgl');
    await expect(page.locator('[data-hero-img]')).toBeVisible();
    await expect(page.locator('[data-hero]')).not.toHaveClass(/is-gl/);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(LW);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the modern church design page links to the live showpiece', async ({ page }) => {
    await page.goto('/designs/modern-church');
    await expect(page.locator('[data-d="showcase"]')).toBeVisible();
    await expect(page.locator('[data-d="showcase"]')).toHaveAttribute('href', LW);
  });
});
