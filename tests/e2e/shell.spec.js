import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const NAV = ['Home', 'Solutions', 'Industries', 'Explore Designs', 'Live Demo', 'Lab', 'About', 'Start a Project'];
const INDUSTRIES = ['Business', 'Church', 'Education', 'Nonprofit'];

// Generated images that do not exist yet (owner produces them later).
const PENDING_IMAGES = /^\/images\/(site\/(hero|admin-hero)\.webp|designs\/.+)$/;

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    // Generated images (hero, admin, covers) may not exist yet; the page falls
    // back to CSS compositions, so their 404s are expected (Ruling A).
    const path = new URL(m.location().url || 'about:blank', 'http://x').pathname;
    if (/status of 404/.test(m.text()) && PENDING_IMAGES.test(path)) return;
    errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

for (const width of [375, 1280]) {
  test.describe(`shell at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('header nav has the 8 items in order', async ({ page }) => {
      await page.goto('/');
      const items = page.locator('#site-header [data-nav-list] > li');
      await expect(items).toHaveCount(8);
      const labels = (await items.evaluateAll((lis) =>
        lis.map((li) => li.firstElementChild.textContent.replace(/\s+/g, ' ').trim()))).map((t) => t.replace(/\s*▾$/, ''));
      expect(labels).toEqual(NAV);
      const industryLinks = page.locator('#site-header [data-industries] a');
      await expect(industryLinks).toHaveText(INDUSTRIES);
      await expect(page.locator('#site-header a[aria-current="page"]')).toHaveText('Home');
    });

    test('skip link is the first focusable element and targets main', async ({ page, browserName }) => {
      await page.goto('/');
      // WebKit skips links on Tab (Safari's default preference), so there we
      // check the first focusable element in document order instead.
      if (browserName !== 'webkit') await page.keyboard.press('Tab');
      const active = await page.evaluate((real) => {
        const el = real ? document.activeElement
          : document.querySelector('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
        return { text: el.textContent.trim(), href: el.getAttribute('href') };
      }, browserName !== 'webkit');
      expect(active).toEqual({ text: 'Skip to content', href: '#main' });
      await expect(page.locator('main#main')).toHaveCount(1);
    });

    test('no horizontal scroll', async ({ page }) => {
      await page.goto('/');
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      expect(sw).toBeLessThanOrEqual(iw);
    });

    test('no console errors', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });

    test('axe finds no serious or critical violations', async ({ page }) => {
      // Reduced motion: no reveal fade in progress while axe measures contrast.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });

    test('footer has services, industries, mockup, privacy and copyright', async ({ page }) => {
      await page.goto('/');
      const footer = page.locator('#site-footer footer');
      await expect(footer.getByRole('link', { name: 'Get a free mockup' })).toBeVisible();
      await expect(footer.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy');
      for (const name of INDUSTRIES) await expect(footer.getByRole('link', { name, exact: true })).toBeVisible();
      await expect(footer).toContainText('© ');
      await expect(footer).toContainText('CTSD');
    });
  });
}

test.describe('mobile menu (375px)', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('opens with a click, nests industries, closes with Escape', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#site-header [data-menu-toggle]');
    const menu = page.locator('#site-header [data-menu]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu.getByRole('link', { name: 'Solutions' })).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: 'Solutions' })).toBeVisible();

    const ind = menu.getByRole('button', { name: /Industries/ });
    await ind.click();
    await expect(ind).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: 'Church' })).toBeVisible();

    // focus stays trapped inside the open menu
    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const h = document.querySelector('#site-header');
      return h.querySelector('[data-menu]').contains(document.activeElement)
        || h.querySelector('[data-menu-toggle]') === document.activeElement;
    });
    expect(inside).toBe(true);

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu.getByRole('link', { name: 'Solutions' })).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

test.describe('mobile menu after scrolling (375px)', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('panel keeps full height once the header is translucent', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(page.locator('#site-header .site-header')).toHaveClass(/is-scrolled/);
    await page.locator('#site-header [data-menu-toggle]').click();
    const menu = page.locator('#site-header [data-menu]');
    await expect(menu.getByRole('link', { name: 'Home' })).toBeVisible();
    await page.waitForTimeout(400);
    const box = await menu.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(300);
    await expect(menu.getByRole('link', { name: 'Home' })).toBeInViewport();
  });
});

test.describe('industries dropdown (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('is a keyboard-operable disclosure', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#site-header [data-menu-toggle]')).toBeHidden();
    const btn = page.locator('#site-header').getByRole('button', { name: /Industries/ });
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-header').getByRole('link', { name: 'Education' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
    await expect(page.locator('#site-header').getByRole('link', { name: 'Education' })).toBeHidden();
  });

  test('header turns translucent after scrolling', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#site-header .site-header');
    await expect(header).not.toHaveClass(/is-scrolled/);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveClass(/is-scrolled/);
  });
});
