import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PENDING_IMAGES = /^\/images\/(site\/.+|designs\/.+)$/;
const INDUSTRIES = [
  { slug: 'business', min: 1, integrations: ['HubSpot', 'Salesforce', 'QuickBooks', 'Calendly'] },
  { slug: 'church', min: 1, integrations: ['Planning Center', 'Stripe', 'YouTube'] },
  { slug: 'education', min: 1, integrations: ['SIS', 'LMS', 'Stripe', 'Google Workspace'] },
  { slug: 'nonprofit', min: 3, integrations: ['Donor CRM', 'Stripe', 'Mailchimp'] },
];

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const path = new URL(m.location().url || 'about:blank', 'http://x').pathname;
    if (/status of 404/.test(m.text()) && PENDING_IMAGES.test(path)) return;
    errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

async function seriousAxe(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);
}

for (const ind of INDUSTRIES) {
  test.describe(`industry: ${ind.slug}`, () => {
    test('hero, designs grid, integrations and CTA band', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/industries/${ind.slug}`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();

      const cards = page.locator('#industry-designs a.design-card');
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThanOrEqual(ind.min);
      if (ind.slug === 'nonprofit') await expect(cards).toHaveCount(3);
      for (const c of await cards.all()) {
        await expect(c).toHaveAttribute('href', /^\/designs\/[a-z0-9-]+$/);
        await expect(c.locator('.badge-concept')).toHaveText('Concept');
      }

      const wall = page.locator('[data-section="integrations"]');
      for (const name of ind.integrations) await expect(wall).toContainText(name);

      const cta = page.locator('[data-section="cta"]');
      await expect(cta.locator('a[href="/start"]')).toHaveCount(1);
      await expect(cta.locator('a[href="/mockup"]')).toHaveCount(1);
      await expect(page.locator('[data-section="problems"] li')).not.toHaveCount(0);
      await expect(page.locator('[data-section="systems"] li')).not.toHaveCount(0);

      const hrefs = await page.locator('main a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs.filter((h) => /\.html(\?|#|$)/.test(h))).toEqual([]);
      await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText(
        ind.slug[0].toUpperCase() + ind.slug.slice(1));
      expect(errors).toEqual([]);
    });

    test('no horizontal scroll at 375 and no serious axe violations', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/industries/${ind.slug}`);
      await expect(page.locator('#industry-designs a.design-card').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(await seriousAxe(page)).toEqual([]);
    });
  });
}

test('education page has the accessibility section and never says guarantee', async ({ page }) => {
  await page.goto('/industries/education');
  await expect(page.getByRole('heading', { name: 'Accessibility (WCAG 2.1 AA)' })).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(text.toLowerCase()).not.toContain('guarantee');
  const html = await page.content();
  expect(html.toLowerCase()).not.toContain('guarantee');
});

test.describe('solutions', () => {
  test('three group headings, anchors the footer links to, and design links', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/solutions');
    await expect(page.locator('h1')).toHaveCount(1);
    for (const name of ['Digital Experience', 'Business Software', 'Connected Systems']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    for (const id of ['websites', 'mobile-apps', 'ecommerce', 'crm', 'portals', 'dashboards', 'booking',
      'membership', 'operations', 'api-integrations', 'third-party-crm', 'payments', 'automation',
      'authentication', 'cloud', 'integrations']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await expect(page.locator('#crm a[href="/designs/custom-crm"]')).toHaveCount(1);
    await expect(page.locator('#booking a[href="/designs/booking-system"]')).toHaveCount(1);
    await expect(page.locator('#portals a[href="/designs/client-portal"]')).toHaveCount(1);
    await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText('Solutions');
    const cta = page.locator('[data-section="cta"]');
    await expect(cta.locator('a[href="/start"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('no horizontal scroll at 375 and no serious axe violations', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/solutions');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(await seriousAxe(page)).toEqual([]);
  });
});
