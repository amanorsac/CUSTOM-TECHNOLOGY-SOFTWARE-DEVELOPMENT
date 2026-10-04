import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const tabKey = (page) => (page.context().browser().browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab');

async function open(page, hash = '') {
  await page.goto(`/demo/${hash}`);
  await expect(page.locator('html')).toHaveAttribute('data-demo-ready', '1');
}

async function seriousAxe(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
}

const view = (page) => page.locator('#main');
const previewHeading = (page) => page.locator('[data-preview-heading]');

test.describe('live admin demo', () => {
  test('banner is visible, links to /start, and can be dismissed for the session', async ({ page }) => {
    await open(page);
    const banner = page.locator('[data-demo-banner]');
    await expect(banner).toContainText('Demo — changes stay in your browser. Want this for your organization?');
    const link = banner.getByRole('link', { name: 'Start a project' });
    await expect(link).toHaveAttribute('href', '/start');
    await banner.getByRole('button', { name: 'Dismiss demo notice' }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-demo-ready', '1');
    await expect(page.locator('[data-demo-banner]')).toBeHidden();
  });

  test('shell: CTSD mark links home, skip link, landmarks, default route', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('link', { name: 'CTSD home' })).toHaveAttribute('href', '/');
    await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main');
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Admin' })).toBeVisible();
    await expect(page.locator('[data-nav] a[aria-current="page"]')).toHaveText(/Dashboard/);
    await expect(view(page).getByRole('heading', { level: 1 })).toHaveText('Dashboard');
    await expect(page.locator('[data-kpi]')).toHaveCount(4);
    await expect(page.locator('[data-chart] svg[role="img"]')).toHaveCount(2);
    await expect(page.locator('[data-chart] table')).toHaveCount(2);
    await page.goto('/demo/#/nowhere');
    await expect(view(page).getByRole('heading', { level: 1 })).toHaveText('Dashboard');
  });

  test('nav routes by hash and moves aria-current', async ({ page }) => {
    await open(page);
    for (const [name, h1] of [['Pages', 'Pages'], ['Events', 'Events'], ['People', 'Members'], ['Inbox', 'Inbox'], ['Notify', 'Notifications']]) {
      await page.locator('[data-nav]').getByRole('link', { name }).click();
      await expect(view(page).getByRole('heading', { level: 1 })).toHaveText(h1);
      await expect(page.locator('[data-nav] a[aria-current="page"]')).toHaveText(new RegExp(name));
    }
  });

  test('editing the heading updates the preview immediately and says Saved', async ({ page }) => {
    await open(page, '#/pages');
    await expect(previewHeading(page)).toHaveText('A place to belong.');
    await page.getByLabel('Heading').fill('Welcome home, neighbor');
    await expect(previewHeading(page)).toHaveText('Welcome home, neighbor');
    await page.getByLabel('Body text').fill('New body copy for the homepage.');
    await expect(page.locator('[data-preview-body]')).toHaveText('New body copy for the homepage.');
    await page.getByRole('radio', { name: 'Grove' }).check();
    await expect(page.locator('[data-preview-image]')).toHaveAttribute('data-image', 'grove');
    await expect(page.locator('[data-saved]')).toContainText('Saved');
    // The edit survives a reload (sessionStorage).
    await page.reload();
    await expect(previewHeading(page)).toHaveText('Welcome home, neighbor');
  });

  test('adding an event shows it in the preview calendar; edit and delete work', async ({ page }) => {
    await open(page, '#/events');
    const cal = page.locator('[data-preview-calendar]');
    await page.getByRole('button', { name: 'Add event' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Save event' }).click();
    await expect(dialog.getByText('Add a title.')).toBeVisible();
    await expect(dialog.getByLabel('Title')).toHaveAttribute('aria-invalid', 'true');
    await dialog.getByLabel('Title').fill('Choir Rehearsal');
    await dialog.getByLabel('Date').fill('2026-10-10');
    await dialog.getByLabel('Location').fill('Chapel');
    await dialog.getByRole('button', { name: 'Save event' }).click();
    await expect(dialog).toBeHidden();
    await expect(cal).toContainText('Choir Rehearsal');
    await expect(page.locator('[data-event-list]')).toContainText('Choir Rehearsal');

    await page.getByRole('button', { name: 'Edit Choir Rehearsal' }).click();
    await dialog.getByLabel('Title').fill('Choir Night');
    await dialog.getByRole('button', { name: 'Save event' }).click();
    await expect(cal).toContainText('Choir Night');

    await page.getByRole('button', { name: 'Delete Choir Night' }).click();
    await expect(cal).not.toContainText('Choir Night');
    await expect(page.locator('[data-event-list]')).not.toContainText('Choir Night');
  });

  test('switching org hides a pending Undo, so it cannot restore into the wrong org', async ({ page }) => {
    await open(page, '#/events');
    const list = page.locator('[data-event-list]');
    await page.getByRole('button', { name: 'Add event' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Title').fill('Undo Probe');
    await dialog.getByLabel('Date').fill('2026-10-12');
    await dialog.getByRole('button', { name: 'Save event' }).click();
    await expect(list).toContainText('Undo Probe');

    await page.getByRole('button', { name: 'Delete Undo Probe' }).click();
    const undo = page.locator('[data-toast]').getByRole('button', { name: 'Undo' });
    await expect(undo).toBeVisible();

    await page.getByLabel('Organization').selectOption('school');
    await expect(page.locator('[data-org-name]')).toHaveText('Oakridge Academy');
    await expect(undo).toHaveCount(0);
    await expect(list).not.toContainText('Undo Probe');

    await page.getByLabel('Organization').selectOption('church');
    await expect(list).not.toContainText('Undo Probe');
  });

  test('event dialog closes on Escape and returns focus', async ({ page }) => {
    await open(page, '#/events');
    const add = page.getByRole('button', { name: 'Add event' });
    await add.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Title')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(add).toBeFocused();
  });

  test('the org switcher changes the org name everywhere', async ({ page }) => {
    await open(page, '#/pages');
    await expect(page.locator('[data-org-name]')).toHaveText('Grace Fellowship');
    await page.getByLabel('Organization').selectOption('school');
    await expect(page.locator('[data-org-name]')).toHaveText('Oakridge Academy');
    await expect(page.locator('[data-preview]')).toContainText('Oakridge Academy');
    await expect(page).toHaveTitle(/Oakridge Academy/);
    // Everywhere but the switcher's own option list.
    await expect(page.locator('[data-app]')).not.toContainText('Grace Fellowship');
    await page.locator('[data-nav]').getByRole('link', { name: 'People' }).click();
    await expect(view(page).getByRole('heading', { level: 1 })).toHaveText('Students & families');
    await page.getByLabel('Organization').selectOption('business');
    await expect(page.locator('[data-org-name]')).toHaveText('Summit Consulting');
    await expect(view(page).getByRole('heading', { level: 1 })).toHaveText('Clients');
  });

  test('Reset restores Grace Fellowship defaults', async ({ page }) => {
    await open(page, '#/pages');
    await page.getByLabel('Heading').fill('Something else');
    await page.getByLabel('Organization').selectOption('business');
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.locator('[data-org-name]')).toHaveText('Grace Fellowship');
    await expect(page.getByLabel('Organization')).toHaveValue('church');
    await expect(previewHeading(page)).toHaveText('A place to belong.');
    expect(await page.evaluate(() => sessionStorage.getItem('ctsd-demo-v1'))).toBeNull();
  });

  test('people: search, status filter and detail panel', async ({ page }) => {
    await open(page, '#/people');
    const rows = page.locator('[data-person-row]');
    await expect(rows).toHaveCount(12);
    await page.getByLabel('Search people').fill('okafor');
    await expect(rows).toHaveCount(1);
    await page.getByLabel('Search people').fill('');
    await page.getByLabel('Status').selectOption('New');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(12);
    await page.getByLabel('Status').selectOption('all');
    await page.getByRole('button', { name: 'Daniel Okafor' }).click();
    const panel = page.getByRole('dialog', { name: 'Daniel Okafor' });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('daniel.okafor@gracefellowship.example');
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('inbox: open, mark as handled, Handled filter count', async ({ page }) => {
    await open(page, '#/inbox');
    const handledTab = page.getByRole('button', { name: /^Handled/ });
    const before = Number((await handledTab.textContent()).match(/\d+/)[0]);
    const first = page.locator('[data-inbox-item]').first();
    const subject = (await first.locator('[data-subject]').textContent()).trim();
    await first.click();
    await expect(page.locator('[data-reader]')).toContainText(subject);
    await page.getByRole('button', { name: 'Mark as handled' }).click();
    await expect(handledTab).toContainText(String(before + 1));
    await expect(page.locator('[data-inbox-list]')).not.toContainText(subject);
    await handledTab.click();
    await expect(page.locator('[data-inbox-list]')).toContainText(subject);
  });

  test('notify: live phone preview, send adds to Sent with a toast', async ({ page }) => {
    await open(page, '#/notify');
    await page.getByLabel('Title').fill('Service time change');
    await page.getByLabel('Message').fill('This Sunday we meet at 10am only.');
    const phone = page.locator('[data-phone]');
    await expect(phone).toContainText('Service time change');
    await expect(phone).toContainText('This Sunday we meet at 10am only.');
    await expect(phone).toContainText('Grace Fellowship');
    await page.getByRole('button', { name: 'Send notification' }).click();
    await expect(page.locator('[data-toast]')).toContainText('Sent to');
    await expect(page.locator('[data-sent-list]')).toContainText('Service time change');
    await expect(page.getByLabel('Title')).toHaveValue('');
  });

  test('makes zero requests to other origins and none to /api/', async ({ page, baseURL }) => {
    const urls = [];
    page.on('request', (r) => urls.push(r.url()));
    await open(page);
    for (const h of ['#/pages', '#/events', '#/people', '#/inbox', '#/notify', '#/dashboard']) {
      await page.goto(`/demo/${h}`);
      await expect(page.locator('html')).toHaveAttribute('data-demo-ready', '1');
    }
    await page.goto('/demo/#/notify');
    await page.getByLabel('Title').fill('Hello');
    await page.getByLabel('Message').fill('World');
    await page.getByRole('button', { name: 'Send notification' }).click();
    await page.getByLabel('Organization').selectOption('school');
    await page.getByRole('button', { name: 'Reset demo' }).click();
    const origin = new URL(baseURL).origin;
    expect(urls.filter((u) => !u.startsWith('data:') && new URL(u).origin !== origin)).toEqual([]);
    expect(urls.filter((u) => u.includes('/api/'))).toEqual([]);
  });

  test('at 375px the sidebar becomes a bottom tab bar with no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page);
    const nav = page.locator('[data-nav]');
    const box = await nav.boundingBox();
    expect(box.y + box.height).toBeGreaterThanOrEqual(811);
    expect(box.width).toBeGreaterThanOrEqual(374);
    expect(await nav.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
    await expect(nav.getByRole('link')).toHaveCount(6);
    for (const h of ['#/dashboard', '#/pages', '#/events', '#/people', '#/inbox', '#/notify']) {
      await page.goto(`/demo/${h}`);
      await expect(page.locator('html')).toHaveAttribute('data-demo-ready', '1');
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      expect(sw, h).toBeLessThanOrEqual(iw);
    }
    // People table renders as cards on phones.
    await page.goto('/demo/#/people');
    expect(await page.locator('[data-person-row]').first().evaluate((el) => getComputedStyle(el).display)).not.toBe('table-row');
  });

  test('with storage blocked the demo still loads and edits', async ({ page }) => {
    await page.addInitScript(() => {
      const blocked = () => { throw new Error('SecurityError: storage blocked'); };
      Object.defineProperty(window, 'sessionStorage', { get: blocked, configurable: true });
      Object.defineProperty(window, 'localStorage', { get: blocked, configurable: true });
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await open(page, '#/pages');
    await page.getByLabel('Heading').fill('No storage, no problem');
    await expect(previewHeading(page)).toHaveText('No storage, no problem');
    await page.getByRole('button', { name: 'Dismiss demo notice' }).click();
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(previewHeading(page)).toHaveText('A place to belong.');
    expect(errors).toEqual([]);
  });

  async function tabUntil(page, selector) {
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press(tabKey(page));
      if (await page.evaluate((s) => document.activeElement?.matches(s), selector)) return true;
    }
    return false;
  }

  test('keyboard: controls are reachable with Tab and show a focus ring', async ({ page }) => {
    await open(page);
    expect(await tabUntil(page, '[data-reset]')).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-toast]')).toContainText('Demo reset');
  });

  test('keyboard: nav links are reachable with Tab', async ({ page, browserName }) => {
    // WebKit, like Safari's default, leaves links out of the Tab order (even with Alt+Tab here).
    test.skip(browserName === 'webkit', 'WebKit does not tab to links by default');
    await open(page);
    expect(await tabUntil(page, '[data-nav] a[href="#/events"]')).toBe(true);
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    expect(outline).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(view(page).getByRole('heading', { level: 1 })).toHaveText('Events');
  });

  for (const width of [1280, 375]) {
    test(`axe: no serious violations on every view at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      for (const h of ['#/dashboard', '#/pages', '#/events', '#/people', '#/inbox', '#/notify']) {
        await open(page, h);
        expect(await seriousAxe(page), h).toEqual([]);
      }
      await open(page, '#/events');
      await page.getByRole('button', { name: 'Add event' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Save event' }).click();
      expect(await seriousAxe(page), 'event dialog').toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});
