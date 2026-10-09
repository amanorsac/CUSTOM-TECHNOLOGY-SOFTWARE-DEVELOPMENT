import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SECTIONS = ['hero', 'featured', 'services', 'journey', 'manage', 'industries', 'lab', 'process', 'integrations', 'cta'];
// The showpiece reel, in order: [showcase slug, design slug]
const REEL = [['osteria-lume', 'restaurant'], ['juniper-vale', 'real-estate'], ['basecamp', 'youth-ministry'], ['lanternway', 'modern-church']];
const SERVICES = ['Web Development', 'Mobile Apps', 'CRM', 'Client Portals', 'Business Systems', 'Automation', 'Integrations'];
const JOURNEY = ['Discover', 'Register', 'Book', 'Pay', 'Receive', 'Portal', 'Communicate', 'Return'];
const PROCESS = ['Discover', 'Design', 'Build', 'Test', 'Launch', 'Handoff'];
const INTEGRATIONS = ['Planning Center', 'Stripe', 'HubSpot', 'Salesforce', 'QuickBooks', 'Google Workspace',
  'Microsoft 365', 'Mailchimp', 'Twilio', 'Zapier', 'Calendly', 'YouTube'];
const PROCESS_COPY = ['We learn how the organization operates.', 'We design the customer experience and internal system.',
  'Frontend, backend, integrations and infrastructure.', 'Devices, workflows, security and performance.',
  'Deployment and production setup.', 'Training and administration access.'];
const MANAGE_LIST = ['Update content', 'Manage customers', 'Review bookings', 'Manage products', 'Create events',
  'Control users', 'View analytics'];
const INDUSTRIES = ['/industries/business', '/industries/church', '/industries/education', '/industries/nonprofit'];

async function designsBySlug(request) {
  const res = await request.get('/data/designs.json');
  const data = await res.json();
  return Object.fromEntries((Array.isArray(data) ? data : data.designs).map((d) => [d.slug, d]));
}

test.describe('home page', () => {
  test('the 10 sections are in spec order', async ({ page }) => {
    await page.goto('/');
    const ids = await page.locator('main > section').evaluateAll((s) => s.map((n) => n.dataset.section));
    expect(ids).toEqual(SECTIONS);
  });

  test('hero: exact h1 and the two buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Technology built around your organization.');
    const hero = page.locator('[data-section="hero"]');
    await expect(hero.getByRole('link', { name: 'Start Your Project' })).toHaveAttribute('href', '/start');
    await expect(hero.getByRole('link', { name: 'Explore What We Build' })).toHaveAttribute('href', '/designs');
    await expect(hero.locator('.lead')).toHaveText(
      'Custom websites, mobile applications and business systems designed around the way your organization actually works.');
  });

  test('the real hero photo shows when it exists', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('.hero__img');
    await expect(img).toBeVisible();
    expect(await img.evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
  });

  test('hero still missing: the four screen posters still show', async ({ page }) => {
    await page.route('**/assets/home/wall.webp', (route) => route.fulfill({ status: 404, body: '' }));
    for (const w of [1280, 375]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/?still=1');
      const screens = page.locator('.wall-screens figure');
      await expect(screens).toHaveCount(4);
      for (let i = 0; i < 4; i++) await expect(screens.nth(i)).toBeVisible();
    }
  });

  test('no-JS: hero still visible and the reel fallback links to /designs', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    const img = page.locator('.hero__img');
    await expect(img).toBeVisible();
    expect(await img.evaluate((i) => getComputedStyle(i).opacity)).toBe('1');
    await expect(page.locator('[data-section="featured"] noscript')).toHaveCount(1);
    const html = await page.locator('[data-section="featured"] noscript').evaluate((n) => n.innerHTML);
    expect(html).toContain('href="/designs"');
    await ctx.close();
  });

  test('hero image is the high-priority image; every other image is lazy', async ({ page, request }) => {
    const html = await (await request.get('/')).text();
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const hero = imgs.filter((t) => /hero__img/.test(t));
    expect(hero).toHaveLength(1);
    expect(hero[0]).toMatch(/fetchpriority="high"/);
    expect(hero[0]).toMatch(/src="\/assets\/home\/wall\.webp"/);
    for (const t of imgs.filter((x) => !/hero__img/.test(x))) expect(t).toMatch(/loading="lazy"/);
    // Videos never load ahead of time.
    for (const v of html.matchAll(/<video\b[^>]*>/g)) expect(v[0]).toMatch(/preload="none"/);

    // Serve every image so none goes through the error fallback (which retries
    // eagerly by design); what is left is the loading attribute as authored.
    await page.route(/\/images\/(site|designs)\/.+\.webp$/, (route) =>
      route.fulfill({ path: 'public/images/designs/_placeholder.webp', contentType: 'image/webp' }));
    await page.goto('/');
    await expect(page.locator('.reel__item')).toHaveCount(4);
    const notLazy = await page.locator('main img').evaluateAll((list) => list
      .filter((i) => !i.classList.contains('hero__img') && i.getAttribute('loading') !== 'lazy')
      .map((i) => i.outerHTML));
    expect(notLazy).toEqual([]);
  });

  test('service strip lists the 7 services', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-section="services"] li')).toHaveText(SERVICES);
  });

  test('journey is an ordered list of the 8 steps', async ({ page }) => {
    await page.goto('/');
    const steps = page.locator('[data-section="journey"] ol[data-journey] > li');
    await expect(steps).toHaveCount(8);
    await expect(steps.locator('h3')).toHaveText(JOURNEY);
  });

  test('journey highlights a step as it scrolls into view', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const list = page.locator('ol[data-journey]');
    await expect(list.locator('li.is-active')).toHaveCount(0);
    await list.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await expect(list.locator('li.is-active')).toHaveCount(1);
  });

  test('journey is a static list under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const list = page.locator('ol[data-journey]');
    await list.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    await expect(list.locator('li.is-active')).toHaveCount(0);
    await expect(list.locator('li').first()).toBeVisible();
    await expect(list.locator('li').last()).toBeVisible();
  });

  test('the reel shows the 4 showpieces with their links', async ({ page, request }) => {
    const designs = await designsBySlug(request);
    await page.goto('/');
    const items = page.locator('[data-reel] .reel__item');
    await expect(items).toHaveCount(4);
    for (const [i, [slug, design]] of REEL.entries()) {
      const item = items.nth(i);
      await expect(item).toHaveAttribute('data-slug', slug);
      await expect(item.locator('.reel__title')).toHaveText(designs[design].name);
      await expect(item.locator('.badge-concept')).toHaveText('Concept');
      await expect(item.locator('.reel__highlights li')).toHaveCount(3);
      await expect(item.getByRole('link', { name: /^Open live showpiece/ })).toHaveAttribute('href', `/showcase/${slug}`);
      await expect(item.getByRole('link', { name: /^See the design/ })).toHaveAttribute('href', `/designs/${design}`);
      await expect(item.getByRole('link', { name: /^Build something like this/ })).toHaveAttribute('href', `/start?design=${design}`);
    }
  });

  test('"Built for your team to manage" links to the live demo', async ({ page }) => {
    await page.goto('/');
    const manage = page.locator('[data-section="manage"]');
    await expect(manage.getByRole('heading', { level: 2 })).toHaveText('Built for your team to manage.');
    await expect(manage.getByRole('link', { name: 'Open the live demo' })).toHaveAttribute('href', '/demo/');
    await expect(manage.locator('.lead')).toHaveText(
      'Your custom system includes an administration experience designed specifically for your organization.');
    await expect(manage.getByRole('list').locator('li')).toHaveText(MANAGE_LIST);
    await expect(manage.locator('.manage__close')).toHaveText('Handle everyday operations without contacting a developer.');
  });

  test('four industry cards link to the industry pages', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.locator('[data-section="industries"] a').evaluateAll((a) => a.map((n) => n.getAttribute('href')));
    expect(hrefs).toEqual(INDUSTRIES);
  });

  test('process: 6 steps in order', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-section="process"] ol > li h3')).toHaveText(PROCESS);
    await expect(page.locator('[data-section="process"] ol > li p')).toHaveText(PROCESS_COPY);
  });

  test('integrations wall: text wordmarks, no logo images', async ({ page }) => {
    await page.goto('/');
    const wall = page.locator('[data-section="integrations"]');
    await expect(wall.locator('li')).toHaveText(INTEGRATIONS);
    await expect(wall.locator('img')).toHaveCount(0);
  });

  test('final call to action', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('[data-section="cta"]');
    await expect(cta.getByRole('heading', { level: 2 })).toHaveText('Tell us what your organization needs.');
    await expect(cta.getByRole('link', { name: 'Start a Project' })).toHaveAttribute('href', '/start');
    await expect(cta.getByRole('link', { name: 'Get a free mockup' })).toHaveAttribute('href', '/mockup');
  });

  test('unstyled lists keep list semantics (role=list)', async ({ page }) => {
    await page.goto('/');
    for (const sel of ['ol[data-journey]', '.steps', '.strip__list', '.wall', '.ind-grid', '.checks']) {
      await expect(page.locator(sel)).toHaveAttribute('role', 'list');
    }
  });

  test('focus ring has at least 3:1 contrast against cream and wood sections', async ({ page }) => {
    await page.goto('/');
    const lum = (rgb) => {
      const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
        const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    for (const sel of ['[data-section="industries"] a', '[data-section="integrations"] ~ section a', '[data-section="hero"] a.btn--ghost', '.reel__item a.btn--ghost']) {
      const link = page.locator(sel).first();
      await link.scrollIntoViewIfNeeded();
      // A key press first makes the programmatic focus count as keyboard focus
      // (WebKit's Tab skips links, so Tab itself is not used here).
      await page.keyboard.press('Shift');
      await link.focus();
      expect(await link.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
      const { outline, bg } = await link.evaluate((el) => {
        let n = el.parentElement; let bg = 'rgba(0, 0, 0, 0)';
        while (n && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; }
        return { outline: getComputedStyle(el).outlineColor, bg };
      });
      expect(ratio(outline, bg), `${sel}: ${outline} on ${bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  test('no dollar sign anywhere on the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.reel__item')).toHaveCount(4);
    const text = await page.evaluate(() => document.body.innerText + document.title);
    expect(text).not.toContain('$');
  });

  test('no visible broken images once the page settles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Scroll through so lazy images get a chance to load (or fail and fall back).
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    const broken = await page.locator('main img').evaluateAll((list) => list
      .filter((i) => !i.hidden && i.getClientRects().length && getComputedStyle(i).opacity !== '0'
        && i.complete && i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src));
    expect(broken).toEqual([]);
  });
});

for (const width of [375, 1280]) {
  test.describe(`home at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('axe: no serious violations; no horizontal scroll', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('.reel__item')).toHaveCount(4);
      await page.waitForLoadState('networkidle');
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      expect(sw).toBeLessThanOrEqual(iw);
    });
  });
}
