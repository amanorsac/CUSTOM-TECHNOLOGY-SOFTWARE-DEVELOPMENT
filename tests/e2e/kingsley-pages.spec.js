import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KA = '/preview/kingsley/';
const PAGES = ['the-refined/', 'events/'];

// Never hit the live YouTube feed if a test reaches the home page.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/kingsley/latest', (r) => r.abort());
});

async function axeSerious(page) {
  const axe = await new AxeBuilder({ page }).analyze();
  return axe.violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
}

for (const p of PAGES) {
  test(`${p} loads with one h1`, async ({ page }) => {
    const res = await page.goto(KA + p);
    expect(res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('The Refined names the ministry, pillars and all four collaborators', async ({ page }) => {
  await page.goto(KA + 'the-refined/');
  const text = await page.locator('main').innerText();
  for (const s of [
    'Revived to revive', 'Malachi 3:1–3', 'Revival', 'Consecration', 'Restoration',
    'natural response to the greatness of God',
    'Apostle Kubi', 'Theophil Jed Jnr', 'Joojo Forson', 'Stephen Amanor Sackey',
    'Nominated, Praise Achievement Awards',
  ]) expect(text).toContain(s);
  await expect(page.locator('.ka-gallery img')).toHaveCount(6);
});

test('Events tabs switch by click and arrow keys', async ({ page }) => {
  await page.goto(KA + 'events/');
  const tabs = page.getByRole('tab');
  await expect(page.getByRole('tablist')).toHaveCount(1);
  await expect(tabs).toHaveCount(2);
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-upcoming')).toBeVisible();
  await expect(page.locator('#panel-past')).toBeHidden();
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('#panel-past')).toBeVisible();
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-upcoming')).toBeVisible();
});

test('Events: upcoming is coming soon, no form, no dates', async ({ page }) => {
  await page.goto(KA + 'events/');
  const up = page.locator('#panel-upcoming');
  await expect(up).toContainText('Coming soon');
  await expect(up).toContainText('The Refined Experience 2027');
  await expect(up.locator('form')).toHaveCount(0);
  const text = await page.locator('main').innerText();
  expect(text).toContain('New Wineskin');
  expect(text).not.toMatch(/\b20\d\d-\d\d-\d\d\b/);
  expect(text).not.toMatch(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);
});

test('Events tabs survive a page swap and stay single', async ({ page }) => {
  await page.goto(KA + 'events/');
  await page.evaluate(() => document.dispatchEvent(new Event('ka:page')));
  await expect(page.getByRole('tab')).toHaveCount(2);
  await page.getByRole('tab').nth(1).click();
  await page.evaluate(() => document.dispatchEvent(new Event('ka:page')));
  await expect(page.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
});

test('Events readable with JS off: both panels visible', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await ctx.newPage();
  await page.goto(KA + 'events/');
  await expect(page.locator('#panel-upcoming')).toBeVisible();
  await expect(page.locator('#panel-past')).toBeVisible();
  await ctx.close();
});

for (const p of PAGES) {
  test(`${p} axe clean`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(KA + p);
    expect(await axeSerious(page)).toEqual([]);
  });
}
