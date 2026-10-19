import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const AK = '/preview/allkidz/';
const PAGES = ['', 'programs', 'our-day', 'about', 'handbook', 'calendar', 'enroll', 'login'];

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

// Every test starts from the seeded demo data.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('ak-test')) { localStorage.clear(); sessionStorage.setItem('ak-test', '1'); } });
});

test.describe('Allkidz draft: website', () => {
  for (const p of PAGES) {
    test(`${p || 'home'} loads: one h1, the draft note, no errors`, async ({ page }) => {
      const errors = collectErrors(page);
      const res = await page.goto(AK + p);
      expect(res.status()).toBe(200);
      expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('.draftbar')).toContainText('prepared by CTSD');
      await page.waitForTimeout(500);
      expect(errors).toEqual([]);
    });
  }

  test('loads nothing from other sites', async ({ page }) => {
    const outside = [];
    page.on('request', (r) => { if (new URL(r.url()).hostname !== 'localhost') outside.push(r.url()); });
    for (const p of ['', 'our-day', 'portal']) { await page.goto(AK + p); await page.waitForLoadState('networkidle'); }
    expect(outside).toEqual([]);
  });

  test('is not in the sitemap', async ({ request }) => {
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('allkidz');
  });

  test('home has no serious accessibility problems', async ({ page }) => {
    await page.goto(AK);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze();
    expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });

  test('the calendar lists this year’s closings from the shared data', async ({ page }) => {
    await page.goto(AK + 'calendar');
    await expect(page.locator('[data-closings] .slot')).toHaveCount(14);
    await expect(page.locator('[data-closings]')).toContainText('Thanksgiving break');
  });

  test('a tour request lands in the director’s enrollment pipeline', async ({ page }) => {
    await page.goto(AK + 'enroll');
    const f = page.locator('form[data-kind="tour"]');
    await f.locator('[name=parent_name]').fill('Test Parent');
    await f.locator('[name=phone]').fill('434-555-0000');
    await f.locator('[name=email]').fill('test@example.com');
    await f.locator('[name=child_name]').fill('Tiny');
    await f.locator('[name=child_dob]').fill('2024-05-01');
    await f.getByRole('button', { name: 'Request my tour' }).click();
    await expect(f.locator('.done')).toBeVisible();
    await page.goto(AK + 'login');
    await page.getByRole('button', { name: /Director/ }).click();
    await page.goto(AK + 'portal#enrollment');
    await expect(page.locator('.col[data-stage="new"]')).toContainText('Test Parent');
  });

  test('the application walks through five steps and blocks empty ones', async ({ page }) => {
    await page.goto(AK + 'enroll#apply');
    const f = page.locator('form[data-kind="application"]');
    await f.getByRole('button', { name: 'Next' }).click();
    await expect(f.locator('.err')).toBeVisible();
    await expect(f.locator('fieldset').nth(0)).toBeVisible();
  });
});

test.describe('Allkidz draft: portal', () => {
  test('signed out, the portal sends you to sign in', async ({ page }) => {
    await page.goto(AK + 'portal');
    await expect(page).toHaveURL(/login/);
  });

  test('the director can open every screen without errors', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(AK + 'login');
    await page.getByRole('button', { name: /Director/ }).click();
    for (const r of ['overview', 'checkin', 'reports', 'children', 'families', 'staff', 'enrollment', 'billing', 'messages', 'announcements', 'calendar', 'week', 'incidents', 'insights', 'settings']) {
      await page.goto(AK + 'portal#' + r);
      await expect(page.locator('#main h1')).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('check-in refuses a fever and checks in a well child', async ({ page }) => {
    await page.goto(AK + 'login');
    await page.getByRole('button', { name: /Director/ }).click();
    await page.goto(AK + 'portal#checkin');
    await page.locator('[data-kid="c_kofi"]').click();
    const d = page.locator('dialog');
    await d.locator('[name=temp]').fill('101');
    for (const q of ['q1', 'q2', 'q3']) await d.locator(`[name=${q}]`).check();
    await d.getByRole('button', { name: /Check in/ }).click();
    await expect(d.locator('#cerr')).toContainText('100');
    await d.locator('[name=temp]').fill('98.6');
    await d.getByRole('button', { name: /Check in/ }).click();
    await expect(page.locator('[data-kid="c_kofi"]')).toContainText('In since');
  });

  test('a parent sees only their own family', async ({ page }) => {
    await page.goto(AK + 'login');
    await page.getByRole('button', { name: /Parent/ }).click();
    await page.goto(AK + 'portal#family');
    await expect(page.locator('#main h1')).toContainText('Mitchell');
    await page.goto(AK + 'portal#messages');
    await expect(page.locator('.thr')).toHaveCount(1);
    await page.goto(AK + 'portal#overview');
    await expect(page.locator('#main h1')).toContainText('Sarah');
  });
});
