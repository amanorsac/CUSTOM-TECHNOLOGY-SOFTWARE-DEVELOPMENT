import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The Virtual Assistant pages (spec 2026-10-14-virtual-assistant-design.md).
const VA = '/virtual-assistant';

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}
// Records /api/event posts and answers them, so tracking can be checked without a database.
async function catchEvents(page) {
  const events = [];
  await page.route('**/api/event', async (route) => { events.push(JSON.parse(route.request().postData())); await route.fulfill({ status: 204 }); });
  return events;
}
const seriousAxe = async (page) => (await new AxeBuilder({ page }).analyze()).violations
  .filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);

test.describe('Virtual Assistant product page', () => {
  test('loads: one h1, the demo number as a tel: link, no errors', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(VA);
    await expect(page.locator('h1')).toHaveText('Every missed call is a missed table.');
    const call = page.locator('.page-hero a[href^="tel:"]');
    await expect(call).toHaveAttribute('href', 'tel:+14348383287');
    await expect(call).toContainText('(434) 838-3287');
    await expect(page.locator('.page-hero')).toContainText('Our demo assistant, Adelaide, answers 24/7.');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('the product is the Virtual Assistant; Adelaide appears only as the demo', async ({ page }) => {
    await page.goto(VA);
    await expect(page).toHaveTitle(/^Virtual Assistant/);
    const adelaide = await page.locator('main').evaluate((m) => (m.innerText.match(/[^.\n]*Adelaide[^.\n]*/g) || []));
    for (const line of adelaide) expect(line, line).toMatch(/demo|Hi, thanks for calling|Listen to Adelaide/i);
  });

  test('six feature cards and six FAQ answers', async ({ page }) => {
    await page.goto(VA);
    await expect(page.locator('.va-card')).toHaveCount(6);
    const faq = page.locator('.va-faq details');
    await expect(faq).toHaveCount(6);
    await faq.first().locator('summary').click();
    await expect(faq.first()).toContainText("If anyone asks, she says she's the restaurant's virtual assistant.");
  });

  test('the sample call plays the script', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(VA);
    await page.getByRole('button', { name: 'Play sample call' }).click();
    await expect(page.locator('#va-status')).toContainText('On call');
    await expect(page.locator('#va-log .is-assistant').first()).toContainText('this is Adelaide');
    await expect(page.locator('#va-log .is-caller').first()).toContainText('table for four', { timeout: 10000 });
  });

  test('the missed-call calculator starts at $1,949 and responds', async ({ page }) => {
    await page.goto(VA);
    await expect(page.locator('#lost')).toHaveText('$1,949');
    await page.locator('#missed').fill('50');
    await expect(page.locator('#lost')).toHaveText('$3,897');
  });

  test('tapping the number records a call_click', async ({ page }) => {
    const events = await catchEvents(page);
    await page.goto(VA);
    await page.locator('.page-hero a[href^="tel:"]').evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await page.locator('.page-hero a[href^="tel:"]').click();
    await expect.poll(() => events.map((e) => e.event)).toContain('call_click');
    expect(events[0].page).toBe('/virtual-assistant');
  });
});

test.describe('Virtual Assistant pricing', () => {
  test('three plans, Monthly first; at 1,000 minutes the estimates are $497, $549 and $599', async ({ page }) => {
    await page.goto(`${VA}/pricing`);
    await expect(page.locator('.va-plan h3')).toHaveText(['Monthly', 'Pay as you go', 'Pay as you go with a cap']);
    await page.locator('#minutes').fill('1000');
    await expect(page.locator('#est-monthly')).toHaveText('$497/month');
    await expect(page.locator('#est-payg')).toHaveText('$549/month');
    await expect(page.locator('#est-cap')).toHaveText('$599/month');
    await expect(page.locator('[data-plan="monthly"]')).toHaveClass(/is-best/);
    await page.locator('#minutes').fill('300');
    await expect(page.locator('[data-plan="payg"]')).toHaveClass(/is-best/);
  });

  test('the sliders set the minutes', async ({ page }) => {
    await page.goto(`${VA}/pricing`);
    await expect(page.locator('#minutes')).toHaveValue('1216');
    await page.locator('#cpd').fill('10');
    await expect(page.locator('#minutes')).toHaveValue('608');
  });
});

test.describe('Virtual Assistant sign-up', () => {
  async function fillValid(page) {
    const f = page.locator('#va-form');
    await f.locator('#restaurant').fill('Mango & Ember');
    await f.locator('#owner_name').fill('Ama Owusu');
    await f.locator('#mobile').fill('(434) 555-0100');
    await f.locator('#email').fill('ama@example.com');
    await f.locator('#address').fill('1 Main St, Charlottesville, VA');
    await f.locator('#current_phone').fill('434-555-0199');
    for (const d of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']) await f.locator(`#hours_${d}`).fill('11am–10pm');
    await f.locator('#hours_sun').fill('Closed');
    await f.locator('#menu_link').fill('https://example.com/menu');
    await f.locator('label.va-choice:has(input[name="reservations"][value="yes"])').click();
    await f.locator('#booking_system').selectOption('OpenTable');
    await f.locator('label.va-choice:has(input[name="pickup"][value="no"])').click();
    await f.locator('#transfer_phone').fill('434-555-0123');
    await f.locator('label.va-choice:has(input[name="answer_mode"][value="missed"])').click();
    await f.locator('#consent').check();
  }

  test('an empty form shows errors and focuses the first one, sending nothing', async ({ page }) => {
    let posted = false;
    await page.route('**/api/va-signup', (r) => { posted = true; r.abort(); });
    await page.goto(`${VA}/start`);
    await page.getByRole('button', { name: /Sign up and pay/ }).click();
    await expect(page.locator('#err-restaurant')).toBeVisible();
    await expect(page.locator('#err-consent')).toBeVisible();
    await expect(page.locator('#restaurant')).toBeFocused();
    expect(posted).toBe(false);
  });

  test('follow-up questions appear only when they apply', async ({ page }) => {
    await page.goto(`${VA}/start`);
    await expect(page.locator('#res-extra')).toBeHidden();
    await page.locator('label.va-choice:has(input[name="reservations"][value="yes"])').click();
    await expect(page.locator('#booking_system')).toBeVisible();
    await page.locator('label.va-choice:has(input[name="pickup"][value="yes"])').click();
    await expect(page.locator('#ready_time')).toBeVisible();
  });

  test('a plan chosen on the pricing page is preselected', async ({ page }) => {
    await page.goto(`${VA}/start?plan=cap`);
    await expect(page.locator('input[name="plan"][value="cap"]')).toBeChecked();
  });

  test('a valid sign-up is sent, tracked, and goes where the server says', async ({ page }) => {
    const events = await catchEvents(page);
    let body = null;
    await page.route('**/api/va-signup', async (r) => { body = JSON.parse(r.request().postData()); await r.fulfill({ json: { ok: true, next: '/virtual-assistant/welcome' } }); });
    await page.goto(`${VA}/start`);
    await fillValid(page);
    await page.getByRole('button', { name: /Sign up and pay/ }).click();
    await expect(page).toHaveURL(/\/virtual-assistant\/welcome$/);
    expect(body).toMatchObject({ restaurant: 'Mango & Ember', reservations: 'yes', booking_system: 'OpenTable', pickup: 'no', plan: 'monthly', answer_mode: 'missed', consent: true });
    expect(body.hours.sun).toBe('Closed');
    expect(events.map((e) => e.event)).toEqual(expect.arrayContaining(['form_start', 'signup_complete']));
    await expect(page.locator('h1')).toHaveText('Welcome aboard.');
    await expect(page.locator('.va-steps li')).toHaveCount(8);
  });

  test('a server error keeps everything typed and offers the email fallback', async ({ page }) => {
    await page.route('**/api/va-signup', (r) => r.fulfill({ status: 500, json: { ok: false, error: 'server' } }));
    await page.goto(`${VA}/start`);
    await fillValid(page);
    await page.getByRole('button', { name: /Sign up and pay/ }).click();
    await expect(page.locator('#va-status')).toContainText('amanorsac@gmail.com');
    await expect(page.locator('#restaurant')).toHaveValue('Mango & Ember');
  });
});

test.describe('Virtual Assistant in the navigation', () => {
  test('it is under Solutions in the header, in the footer, and on the home page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const btn = page.locator('#site-header').getByRole('button', { name: /Solutions/ });
    await btn.click();
    await expect(page.locator('#site-header').getByRole('link', { name: 'Virtual Assistant' })).toHaveAttribute('href', '/virtual-assistant');
    await expect(page.locator('#site-footer').getByRole('link', { name: 'Virtual Assistant' })).toBeVisible();
    await expect(page.locator('.va-promo a[href="/virtual-assistant"]')).toBeVisible();
  });
});

for (const width of [375, 1280]) {
  test.describe(`Virtual Assistant pages at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const path of [VA, `${VA}/pricing`, `${VA}/start`, `${VA}/welcome`]) {
      test(`${path}: no horizontal scroll, no serious axe violations, no secrets`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const res = await page.goto(path);
        expect(res.status()).toBe(200);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await seriousAxe(page)).toEqual([]);
        expect(await page.content()).not.toMatch(/sk_(live|test)_|ADMIN_KEY|TOOL_SECRET|RETELL_API_KEY|service_role/);
      });
    }
  });
}

test('the home hero announces the Virtual Assistant', async ({ page }) => {
  await page.goto('/?still=1');
  const link = page.locator('[data-hero-copy] a.hero__new');
  await expect(link).toHaveAttribute('href', '/virtual-assistant');
  await expect(link).toContainText('Virtual Assistant');
  await expect(link).toBeInViewport();
});
