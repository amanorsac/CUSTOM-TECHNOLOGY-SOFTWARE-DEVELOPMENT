import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ---- Turnstile stub ---------------------------------------------------------
// Never talk to Cloudflare in tests. The stub issues a fresh fake token on
// render and on every reset, like the real widget with the test site key.
// Tokens arrive asynchronously, so the controller's wait path is exercised.
// With window.__tsMode === 'error' every challenge fails (error-callback).
const TURNSTILE_STUB = `
window.__ts = { renders: 0, resets: 0, sitekeys: [] };
window.turnstile = (function () {
  var n = 0, widgets = {};
  function issue(id) {
    var w = widgets[id]; if (!w) return;
    setTimeout(function () {
      if (!widgets[id]) return;
      if (window.__tsMode === 'error') { if (w.err) w.err('300030'); return; }
      n += 1; w.token = 'fake-token-' + n;
      if (w.cb) w.cb(w.token);
    }, 30);
  }
  return {
    render: function (el, opts) {
      var box = typeof el === 'string' ? document.querySelector(el) : el;
      var id = 'w' + (window.__ts.renders += 1);
      window.__ts.sitekeys.push(opts.sitekey);
      widgets[id] = { cb: opts.callback, err: opts['error-callback'], token: '' };
      var p = document.createElement('p'); p.textContent = 'Verification stub';
      box.appendChild(p);
      issue(id);
      return id;
    },
    reset: function (id) { window.__ts.resets += 1; if (widgets[id]) { widgets[id].token = ''; issue(id); } },
    getResponse: function (id) { return widgets[id] ? widgets[id].token : undefined; },
    remove: function (id) { delete widgets[id]; }
  };
})();`;

const UPLOAD_URL = 'https://storage.example.test/upload/sign/lead-uploads/abc?token=t';
const LOGO_PATH = '0f8fad5b-d9cb-469f-a165-70867728950e-logo.png';

// calls: ordered list of { kind, body } for every /api/* and upload request.
// turnstile: 'ok' (stub), 'error' (stub whose challenges always fail),
// 'abort' (api.js never loads).
async function setup(page, { lead, upload, put, turnstile = 'ok' } = {}) {
  const calls = [];
  await page.route('https://challenges.cloudflare.com/**', (route) => {
    if (turnstile !== 'abort' && route.request().url().includes('/turnstile/v0/api.js')) {
      const mode = turnstile === 'error' ? "window.__tsMode = 'error';" : '';
      return route.fulfill({ contentType: 'application/javascript', body: mode + TURNSTILE_STUB });
    }
    return route.abort();
  });
  await page.route('**/api/lead', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    calls.push({ kind: 'lead', body });
    if (lead) return lead(route, body);
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/upload-url', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    calls.push({ kind: 'upload-url', body });
    if (upload) return upload(route, body);
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, path: LOGO_PATH, uploadUrl: UPLOAD_URL }),
    });
  });
  await page.route('https://storage.example.test/**', async (route) => {
    const req = route.request();
    calls.push({ kind: 'put', method: req.method(), type: req.headers()['content-type'], size: (req.postDataBuffer() || []).length });
    if (put) return put(route);
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"Key":"x"}' });
  });
  return calls;
}

const json = (status, obj) => (route) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(obj) });

async function seriousAxe(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
}

const progress = (page) => page.locator('[data-progress-label]');
const step = (page, n) => page.locator(`[data-step="${n}"]`);
const next = (page) => page.getByRole('button', { name: 'Next' });
const back = (page) => page.getByRole('button', { name: 'Back' });
const submit = (page) => page.getByRole('button', { name: 'Start Your Project' });

async function ready(page, url) {
  await page.goto(url);
  await expect(page.locator('form[data-form]')).toHaveAttribute('data-ready', 'true');
}

async function fillProject(page) {
  await page.getByRole('radio', { name: 'Church', exact: true }).check();
  await next(page).click();
  await expect(progress(page)).toHaveText(/Step 2 of 5/);
  await page.getByRole('checkbox', { name: 'Website', exact: true }).check();
  await page.getByRole('checkbox', { name: 'CRM', exact: true }).check();
  await next(page).click();
  await expect(progress(page)).toHaveText(/Step 3 of 5/);
  await page.getByLabel('Organization name').fill('Grace Chapel');
  await page.getByLabel(/Current website/).fill('https://grace.example.org');
  await page.getByLabel(/Current tools/).fill('Planning Center, Mailchimp');
  await next(page).click();
  await expect(progress(page)).toHaveText(/Step 4 of 5/);
  await page.getByRole('radio', { name: '1–3 months', exact: true }).check();
  await page.getByRole('radio', { name: '$5K–$15K', exact: true }).check();
  await next(page).click();
  await expect(progress(page)).toHaveText(/Step 5 of 5/);
  await page.getByLabel('Your name').fill('Ada Lovelace');
  await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.com');
  await page.getByRole('textbox', { name: /Phone/ }).fill('555 0100');
  await page.getByRole('radio', { name: 'Email', exact: true }).check();
  await page.getByLabel(/Message/).fill('We want one system for members and giving.');
}

// Presses Tab until the active element matches `selector` (keyboard only).
const tabKey = (page) => (page.context().browser().browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab');

async function tabTo(page, selector, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(tabKey(page));
    if (await page.evaluate((s) => document.activeElement && document.activeElement.matches(s), selector)) return;
  }
  throw new Error(`Tab never reached ${selector}`);
}

// ============================================================================
test.describe('Start a Project', () => {
  test('5 steps, progress "Step 1 of 5" in a polite live region, only step 1 shown', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#site-header a[aria-current="page"]').first()).toHaveText('Start a Project');
    await expect(page.locator('[data-step]')).toHaveCount(5);
    await expect(progress(page)).toHaveText(/Step 1 of 5/);
    await expect(page.locator('[data-progress]')).toHaveAttribute('aria-live', 'polite');
    await expect(step(page, 1)).toBeVisible();
    for (const n of [2, 3, 4, 5]) await expect(step(page, n)).toBeHidden();
    await expect(page.getByRole('radio')).toHaveCount(5);
    await expect(back(page)).toBeHidden();
  });

  test('uses the lead-schema enum values for every option', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    const values = (name) => page.locator(`input[name="${name}"]`).evaluateAll((els) => els.map((e) => e.value));
    expect(await values('org_type')).toEqual(['business', 'church', 'school', 'nonprofit', 'other']);
    expect(await values('needs')).toEqual(['website', 'app', 'portal', 'crm', 'crm-integration', 'booking', 'payments', 'automation', 'not-sure']);
    expect(await values('timeline')).toEqual(['asap', '1-3m', '3-6m', 'exploring']);
    expect(await values('budget')).toEqual(['<5k', '5-15k', '15-50k', '50k+', 'not-sure', '']);
    expect(await values('contact_pref')).toEqual(['email', 'phone', 'either']);
    await expect(page.getByText('Budget range (optional)')).toHaveCount(1);
  });

  test('Next is blocked until required fields are valid; errors are announced', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    await next(page).click();
    await expect(progress(page)).toHaveText(/Step 1 of 5/);
    const err = page.locator('#err-org_type');
    await expect(err).toHaveText('Please choose organization type.');
    const radio = page.getByRole('radio', { name: 'Church', exact: true });
    await expect(radio).toHaveAttribute('aria-describedby', /err-org_type/);
    await expect(page.locator('[data-form-status]')).toHaveAttribute('aria-live', /polite|assertive/);
    await expect(page.locator('[data-form-status]')).toContainText('Please choose organization type.');

    await radio.check();
    await expect(err).toBeHidden();
    await next(page).click();
    await expect(progress(page)).toHaveText(/Step 2 of 5/);
    await expect(step(page, 2).locator('h2')).toBeFocused();

    await next(page).click();
    await expect(progress(page)).toHaveText(/Step 2 of 5/);
    await expect(page.locator('#err-needs')).toHaveText('Please choose at least one thing you need.');
    await page.getByRole('checkbox', { name: 'Booking', exact: true }).check();
    await next(page).click();
    await expect(progress(page)).toHaveText(/Step 3 of 5/);

    await page.getByLabel(/Current website/).fill('grace.org');
    await next(page).click();
    await expect(progress(page)).toHaveText(/Step 3 of 5/);
    await expect(page.getByLabel(/Current website/)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel(/Current website/)).toHaveAttribute('aria-describedby', /err-website/);
    await expect(page.getByLabel(/Current website/)).toBeFocused();
    await page.getByLabel(/Current website/).fill('');
    await next(page).click();
    await expect(progress(page)).toHaveText(/Step 4 of 5/);
    await next(page).click(); // timeline + budget are optional
    await expect(progress(page)).toHaveText(/Step 5 of 5/);
    await submit(page).click();
    await expect(page.locator('#err-name')).toHaveText('Please enter your name.');
    await expect(page.locator('#err-email')).toHaveText('Please enter your email address.');
  });

  test('Back keeps entered values', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    await fillProject(page);
    for (const n of [4, 3, 2, 1]) {
      await back(page).click();
      await expect(progress(page)).toHaveText(new RegExp(`Step ${n} of 5`));
    }
    await expect(step(page, 1).locator('h2')).toBeFocused();
    await expect(page.getByRole('radio', { name: 'Church', exact: true })).toBeChecked();
    await next(page).click();
    await expect(page.getByRole('checkbox', { name: 'Website', exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'CRM', exact: true })).toBeChecked();
    await next(page).click();
    await expect(page.getByLabel('Organization name')).toHaveValue('Grace Chapel');
    await next(page).click();
    await next(page).click();
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
  });

  test('?design=modern-church shows the chip and sends design_slug', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/start?design=modern-church');
    await expect(page.locator('[data-design-chip]')).toContainText('Inspired by: Modern Church Platform');
    await fillProject(page);
    await submit(page).click();
    await page.waitForURL(/\/thanks(\.html)?\?kind=project$/);
    expect(calls.filter((c) => c.kind === 'lead')[0].body.design_slug).toBe('modern-church');
  });

  test('?design=nope shows no chip and sends no design_slug', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/start?design=nope');
    await expect(page.locator('[data-design-chip]')).toBeHidden();
    await fillProject(page);
    await submit(page).click();
    await page.waitForURL(/\/thanks/);
    expect(calls[0].body.design_slug).toBeUndefined();
  });

  test('success posts the lead and redirects to /thanks?kind=project', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    await page.waitForURL(/\/thanks(\.html)?\?kind=project$/);
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual({
      kind: 'project', org_type: 'church', needs: ['website', 'crm'], org_name: 'Grace Chapel',
      website: 'https://grace.example.org', tools: 'Planning Center, Mailchimp', timeline: '1-3m',
      budget: '5-15k', name: 'Ada Lovelace', email: 'ada@example.com', phone: '555 0100',
      contact_pref: 'email', message: 'We want one system for members and giving.',
      turnstile: expect.stringMatching(/^fake-token-\d+$/), website_hp: '',
    });
  });

  test('double-clicking submit sends exactly one request; busy while in flight', async ({ page }) => {
    let release;
    const gate = new Promise((r) => { release = r; });
    const calls = await setup(page, {
      lead: async (route) => { await gate; return json(200, { ok: true })(route); },
    });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).dblclick();
    await expect(submit(page)).toBeDisabled();
    await expect(submit(page)).toHaveAttribute('aria-busy', 'true');
    await page.waitForTimeout(300);
    expect(calls.filter((c) => c.kind === 'lead')).toHaveLength(1);
    release();
    await page.waitForURL(/\/thanks/);
    expect(calls.filter((c) => c.kind === 'lead')).toHaveLength(1);
  });

  test('a 500 shows the error with a mailto fallback and keeps every value', async ({ page }) => {
    await setup(page, { lead: json(500, { ok: false, error: 'server' }) });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    const status = page.locator('[data-form-status]');
    await expect(status).toContainText(/something went wrong/i);
    const mail = status.locator('a[href^="mailto:"]');
    await expect(mail).toHaveAttribute('href', /^mailto:amanorsac@gmail\.com\?subject=Project%20inquiry&body=/);
    await expect(submit(page)).toBeEnabled();
    await expect(submit(page)).not.toHaveAttribute('aria-busy', 'true');
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@example.com');
    await expect(page.getByLabel(/Message/)).toHaveValue('We want one system for members and giving.');
    await back(page).click();
    await back(page).click();
    await expect(page.getByLabel('Organization name')).toHaveValue('Grace Chapel');
    await back(page).click();
    await back(page).click();
    await expect(page.getByRole('radio', { name: 'Church', exact: true })).toBeChecked();
  });

  test('network failure and 413 also show the fallback', async ({ page }) => {
    let mode = 'abort';
    await setup(page, {
      lead: (route) => (mode === 'abort' ? route.abort() : json(413, { ok: false, error: 'too_large' })(route)),
    });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    await expect(page.locator('[data-form-status] a[href^="mailto:"]')).toBeVisible();
    mode = '413';
    await submit(page).click();
    await expect(page.locator('[data-form-status] a[href^="mailto:"]')).toBeVisible();
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
  });

  test('a 400 maps errors to fields and jumps to the first step with an error', async ({ page }) => {
    await setup(page, { lead: json(400, { ok: false, errors: { website: 'Please enter a full web address starting with http:// or https://.', email: 'Please enter a valid email address.' } }) });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    await expect(progress(page)).toHaveText(/Step 3 of 5/);
    await expect(page.locator('#err-website')).toHaveText(/full web address/);
    await expect(page.getByLabel(/Current website/)).toHaveAttribute('aria-invalid', 'true');
  });

  test('a 403 asks to verify again, resets Turnstile and keeps data', async ({ page }) => {
    const calls = await setup(page, { lead: json(403, { ok: false, error: 'captcha' }) });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    await expect(page.locator('[data-form-status]')).toContainText('Please complete the verification and try again');
    await expect(page.locator('[data-form-status] a[href^="mailto:"]')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__ts.resets)).toBeGreaterThan(0);
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
    await page.waitForTimeout(100);
    await submit(page).click();
    await expect.poll(() => calls.length).toBe(2);
    expect(calls[1].body.turnstile).not.toBe(calls[0].body.turnstile);
  });

  test('Turnstile script blocked: mailto fallback, nothing sent, data kept', async ({ page }) => {
    const calls = await setup(page, { turnstile: 'abort' });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    const status = page.locator('[data-form-status]');
    await expect(status).toContainText(/spam check could not load/i);
    await expect(status.locator('a[href^="mailto:amanorsac@gmail.com?subject=Project%20inquiry"]')).toBeVisible();
    expect(calls).toEqual([]);
    await expect(submit(page)).toBeEnabled();
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
    await back(page).click();
    await back(page).click();
    await expect(page.getByLabel('Organization name')).toHaveValue('Grace Chapel');
  });

  test('Turnstile erroring every time: mailto fallback instead of a dead end', async ({ page }) => {
    const calls = await setup(page, { turnstile: 'error' });
    await ready(page, '/start');
    await fillProject(page);
    await submit(page).click();
    const status = page.locator('[data-form-status]');
    await expect(status.locator('a[href^="mailto:amanorsac@gmail.com"]')).toBeVisible();
    await expect(status).toContainText(/spam check/i);
    expect(calls).toEqual([]);
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@example.com');
  });

  test('the status live region is always rendered', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    const status = page.locator('[data-form-status]');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    expect(await status.evaluate((el) => el.hidden || getComputedStyle(el).display === 'none')).toBe(false);
  });

  test('a reload keeps the draft; success clears it', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    await page.getByRole('radio', { name: 'School', exact: true }).check();
    await next(page).click();
    await page.getByRole('checkbox', { name: 'Automation', exact: true }).check();
    await next(page).click();
    await page.getByLabel('Organization name').fill('Hill Academy');
    await page.reload();
    await expect(page.locator('form[data-form]')).toHaveAttribute('data-ready', 'true');
    await expect(progress(page)).toHaveText(/Step 3 of 5/);
    await expect(page.getByLabel('Organization name')).toHaveValue('Hill Academy');
    await back(page).click();
    await expect(page.getByRole('checkbox', { name: 'Automation', exact: true })).toBeChecked();
  });

  test('honeypot is off-screen, not display:none, out of tab order', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    const hp = page.locator('input[name="website_hp"]');
    await expect(hp).toHaveCount(1);
    await expect(hp).toHaveAttribute('tabindex', '-1');
    await expect(hp).toHaveAttribute('autocomplete', 'off');
    const info = await hp.evaluate((el) => {
      const wrap = el.closest('[aria-hidden="true"]');
      const r = el.getBoundingClientRect();
      return { display: getComputedStyle(el).display, wrapped: !!wrap, offscreen: r.right < 0 || r.left > innerWidth || r.bottom < 0 };
    });
    expect(info).toEqual({ display: expect.not.stringMatching(/^none$/), wrapped: true, offscreen: true });
  });

  test('loads Turnstile with render=explicit and a site key', async ({ page }) => {
    await setup(page);
    await ready(page, '/start');
    await expect(page.locator('script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]')).toHaveAttribute('src', /render=explicit/);
    await expect(page.locator('[data-sitekey]')).toHaveAttribute('data-sitekey', '1x00000000000000000000AA');
    await expect(page.locator('form[data-form]')).toHaveAttribute('data-fallback', 'amanorsac@gmail.com');
    // The widget renders when the visitor reaches the last step, so its token is fresh.
    expect(await page.evaluate(() => window.__ts.renders)).toBe(0);
    await fillProject(page);
    expect(await page.evaluate(() => window.__ts.sitekeys)).toEqual(['1x00000000000000000000AA']);
  });

  test('no serious axe violations (step 1, step 5 with errors)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await setup(page);
    await ready(page, '/start?design=modern-church');
    await expect(page.locator('[data-design-chip]')).toBeVisible();
    expect(await seriousAxe(page)).toEqual([]);
    await page.getByRole('radio', { name: 'Other', exact: true }).check();
    await next(page).click();
    await page.getByRole('checkbox', { name: 'Not sure', exact: true }).check();
    for (let i = 0; i < 3; i++) await next(page).click();
    await submit(page).click();
    await expect(page.locator('#err-email')).toBeVisible();
    expect(await seriousAxe(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await setup(page);
    await ready(page, '/start');
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
    expect(sw).toBeLessThanOrEqual(iw);
  });

  test('can be completed with the keyboard alone', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/start');
    await tabTo(page, 'input[name="org_type"]');
    await page.keyboard.press('ArrowDown'); // moves to and selects "Church"
    await tabTo(page, '[data-next]');
    await page.keyboard.press('Enter');
    await expect(progress(page)).toHaveText(/Step 2 of 5/);
    await tabTo(page, 'input[name="needs"]');
    await page.keyboard.press('Space');
    await tabTo(page, '[data-next]');
    await page.keyboard.press('Enter');
    await expect(progress(page)).toHaveText(/Step 3 of 5/);
    await tabTo(page, 'input[name="org_name"]');
    await page.keyboard.type('Grace Chapel');
    await page.keyboard.press('Enter'); // Enter in a field moves on
    await expect(progress(page)).toHaveText(/Step 4 of 5/);
    await tabTo(page, '[data-next]');
    await page.keyboard.press('Enter');
    await expect(progress(page)).toHaveText(/Step 5 of 5/);
    await tabTo(page, 'input[name="name"]');
    await page.keyboard.type('Ada');
    await page.keyboard.press(tabKey(page));
    await page.keyboard.type('ada@example.com');
    await tabTo(page, '[data-submit]');
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/thanks(\.html)?\?kind=project$/);
    expect(calls[0].body).toMatchObject({ org_type: 'church', needs: ['website'], org_name: 'Grace Chapel', name: 'Ada' });
  });
});

// ============================================================================
test.describe('Free Mockup', () => {
  async function fillMockup(page) {
    await page.getByLabel('Organization name').fill('Grace Chapel');
    await page.getByRole('radio', { name: 'Church', exact: true }).check();
    await page.getByLabel(/Current website/).fill('https://grace.example.org');
    await page.getByRole('radio', { name: 'Classic', exact: true }).check();
    await page.getByLabel('Your name').fill('Ada Lovelace');
    await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.com');
  }
  const logoInput = (page) => page.locator('input[type="file"][name="logo"]');
  const send = (page) => page.getByRole('button', { name: 'Get a free mockup' });

  test('copy promises a free concept and no turnaround time', async ({ page }) => {
    await setup(page);
    await ready(page, '/mockup');
    await expect(page.locator('h1')).toHaveCount(1);
    const t = await page.locator('main').innerText();
    expect(t).toContain("We'll design a homepage concept for your organization, free.");
    expect(t).not.toMatch(/business days|within \d/i);
    const values = (name) => page.locator(`input[name="${name}"]`).evaluateAll((els) => els.map((e) => e.value));
    expect(await values('style')).toEqual(['modern', 'classic', 'bold', 'minimal']);
    expect(await values('org_type')).toEqual(['business', 'church', 'school', 'nonprofit', 'other']);
  });

  test('a 6MB logo is rejected with "Logo must be 5MB or smaller"', async ({ page }) => {
    await setup(page);
    await ready(page, '/mockup');
    await logoInput(page).setInputFiles({ name: 'big.png', mimeType: 'image/png', buffer: Buffer.alloc(6 * 1024 * 1024) });
    await expect(page.locator('#err-logo')).toHaveText('Logo must be 5MB or smaller');
    await expect(logoInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-logo-preview]')).toBeHidden();
  });

  test('a .pdf is rejected on the client', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/mockup');
    await logoInput(page).setInputFiles({ name: 'logo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    await expect(page.locator('#err-logo')).toHaveText('Logo must be a PNG, JPG or SVG file');
    await fillMockup(page);
    await send(page).click();
    await page.waitForURL(/\/thanks(\.html)?\?kind=mockup$/);
    expect(calls.map((c) => c.kind)).toEqual(['lead']);
    expect(calls[0].body.logo_path).toBeUndefined();
  });

  test('shows a filename preview with a remove button', async ({ page }) => {
    await setup(page);
    await ready(page, '/mockup');
    await logoInput(page).setInputFiles({ name: 'grace-logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
    const preview = page.locator('[data-logo-preview]');
    await expect(preview).toContainText('grace-logo.svg');
    const remove = preview.getByRole('button', { name: /Remove/ });
    await remove.click();
    await expect(preview).toBeHidden();
    expect(await logoInput(page).evaluate((el) => el.files.length)).toBe(0);
    await expect(logoInput(page)).toBeFocused();
  });

  test('with a logo: upload-url, then PUT, then a fresh token, then /api/lead with logo_path', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/mockup');
    await fillMockup(page);
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(2048) });
    await send(page).click();
    await page.waitForURL(/\/thanks(\.html)?\?kind=mockup$/);
    expect(calls.map((c) => c.kind)).toEqual(['upload-url', 'put', 'lead']);
    expect(calls[0].body).toEqual({ filename: 'logo.png', type: 'image/png', size: 2048, turnstile: expect.stringMatching(/^fake-token-/) });
    expect(calls[1]).toMatchObject({ method: 'PUT', type: 'image/png', size: 2048 });
    expect(calls[2].body).toEqual({
      kind: 'mockup', org_name: 'Grace Chapel', org_type: 'church', website: 'https://grace.example.org',
      style: 'classic', name: 'Ada Lovelace', email: 'ada@example.com', logo_path: LOGO_PATH,
      turnstile: expect.stringMatching(/^fake-token-/), website_hp: '',
    });
    expect(calls[2].body.turnstile).not.toBe(calls[0].body.turnstile);
  });

  test('without a logo it posts the lead directly', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/mockup');
    await fillMockup(page);
    await send(page).click();
    await page.waitForURL(/\/thanks(\.html)?\?kind=mockup$/);
    expect(calls.map((c) => c.kind)).toEqual(['lead']);
  });

  test('required fields are checked before anything is sent', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/mockup');
    await send(page).click();
    await expect(page.locator('#err-org_name')).toBeVisible();
    await expect(page.locator('#err-style')).toBeVisible();
    await expect(page.locator('#err-email')).toBeVisible();
    await expect(page.getByLabel('Organization name')).toBeFocused();
    expect(calls).toEqual([]);
  });

  async function expectLogoNote(page) {
    const status = page.locator('[data-form-status]');
    await expect(status).toContainText("Your request was sent, but the logo didn't upload.");
    await expect(status.getByRole('link', { name: 'email it to us' })).toHaveAttribute('href', /^mailto:amanorsac@gmail\.com\?subject=/);
    await expect(status.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/thanks?kind=mockup');
    await expect(send(page)).toBeDisabled();
  }

  test('a failed PUT still sends the lead (without logo_path) and says so', async ({ page }) => {
    const calls = await setup(page, { put: (route) => route.fulfill({ status: 500, body: 'no' }) });
    await ready(page, '/mockup');
    await fillMockup(page);
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(100) });
    await send(page).click();
    await expectLogoNote(page);
    expect(calls.map((c) => c.kind)).toEqual(['upload-url', 'put', 'lead']);
    expect(calls[2].body.logo_path).toBeUndefined();
    expect(calls[2].body.org_name).toBe('Grace Chapel');
    expect(calls[2].body.turnstile).not.toBe(calls[0].body.turnstile);
    await send(page).click({ force: true });
    await page.waitForTimeout(200);
    expect(calls.filter((c) => c.kind === 'lead')).toHaveLength(1);
    await page.getByRole('link', { name: 'Continue' }).click();
    await page.waitForURL(/\/thanks\?kind=mockup$/);
  });

  test('an upload-url 500 or network error still sends the lead', async ({ page }) => {
    let mode = 500;
    const calls = await setup(page, {
      upload: (route) => (mode === 500 ? json(500, { ok: false, error: 'server' })(route) : route.abort()),
    });
    await ready(page, '/mockup');
    await fillMockup(page);
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(100) });
    await send(page).click();
    await expectLogoNote(page);
    expect(calls.map((c) => c.kind)).toEqual(['upload-url', 'lead']);
    expect(calls[1].body.logo_path).toBeUndefined();
    expect(calls[1].body.turnstile).not.toBe(calls[0].body.turnstile);

    mode = 'abort';
    await page.reload();
    await expect(page.locator('form[data-form]')).toHaveAttribute('data-ready', 'true');
    await fillMockup(page);
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(100) });
    await send(page).click();
    await expectLogoNote(page);
  });

  test('upload-url validation errors (400) stay on the logo field; nothing is sent', async ({ page }) => {
    const calls = await setup(page, { upload: json(400, { ok: false, errors: { size: 'The file must be 5MB or smaller.' } }) });
    await ready(page, '/mockup');
    await fillMockup(page);
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(100) });
    await send(page).click();
    await expect(page.locator('#err-logo')).toHaveText('The file must be 5MB or smaller.');
    expect(calls.map((c) => c.kind)).toEqual(['upload-url']);
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
  });

  test('a failed /api/lead after a good upload keeps the logo; retry does not re-upload', async ({ page }) => {
    let fail = true;
    const calls = await setup(page, {
      lead: (route) => (fail ? json(500, { ok: false, error: 'server' })(route) : json(200, { ok: true })(route)),
    });
    await ready(page, '/mockup');
    await fillMockup(page);
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(100) });
    await send(page).click();
    await expect(page.locator('[data-form-status] a[href^="mailto:amanorsac@gmail.com"]')).toBeVisible();
    await expect(page.locator('[data-logo-preview]')).toContainText('logo.png');
    await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
    fail = false;
    await send(page).click();
    await page.waitForURL(/\/thanks/);
    expect(calls.map((c) => c.kind)).toEqual(['upload-url', 'put', 'lead', 'lead']);
    expect(calls[3].body.logo_path).toBe(LOGO_PATH);
  });

  test('no serious axe violations, with errors and a logo preview', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await setup(page);
    await ready(page, '/mockup');
    expect(await seriousAxe(page)).toEqual([]);
    await send(page).click();
    await logoInput(page).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.alloc(100) });
    await expect(page.locator('[data-logo-preview]')).toBeVisible();
    expect(await seriousAxe(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await setup(page);
    await ready(page, '/mockup');
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
    expect(sw).toBeLessThanOrEqual(iw);
  });

  test('can be completed with the keyboard alone', async ({ page }) => {
    const calls = await setup(page);
    await ready(page, '/mockup');
    await tabTo(page, 'input[name="org_name"]');
    await page.keyboard.type('Grace Chapel');
    await tabTo(page, 'input[name="org_type"]');
    await page.keyboard.press('Space');
    await tabTo(page, 'input[name="style"]');
    await page.keyboard.press('ArrowRight'); // "Classic"
    await tabTo(page, 'input[name="name"]');
    await page.keyboard.type('Ada');
    await page.keyboard.press(tabKey(page));
    await page.keyboard.type('ada@example.com');
    await tabTo(page, '[data-submit]');
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/thanks(\.html)?\?kind=mockup$/);
    expect(calls[0].body).toMatchObject({ org_name: 'Grace Chapel', org_type: 'business', style: 'classic', name: 'Ada' });
  });
});
