// Whole-site checks for the Kingsley Anyenor draft: every built page under
// public/preview/kingsley/ (walked from disk, so new pages are covered).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../public/preview/kingsley');
const CONCEPT = 'Concept for Kingsley Anyenor · prepared by CTSD · not yet published';

function pages(dir = ROOT) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) return pages(p);
    if (f !== 'index.html') return [];
    const rel = path.relative(ROOT, path.dirname(p)).split(path.sep).join('/');
    return [`/preview/kingsley/${rel ? `${rel}/` : ''}`];
  });
}

const PAGES = pages();
const serious = (axe) =>
  axe.violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`);

test.describe('Kingsley whole site', () => {
  // Never hit the live YouTube feed from the home page. Answered (not aborted)
  // so the console-error check below stays meaningful; ok:false keeps the
  // block as built.
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/kingsley/latest', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false}' }),
    );
  });

  test('the build has every page', () => {
    for (const p of ['/preview/kingsley/', '/preview/kingsley/music/', '/preview/kingsley/the-refined/',
      '/preview/kingsley/events/', '/preview/kingsley/book/', '/preview/kingsley/contact/']) {
      expect(PAGES).toContain(p);
    }
    expect(PAGES.some((p) => p.includes('_motion-test'))).toBe(false);
    expect(PAGES.length).toBeGreaterThan(6); // release pages under /music/
  });

  for (const url of PAGES) {
    test(`page checks: ${url}`, async ({ page }) => {
      test.setTimeout(60000);
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await page.emulateMedia({ reducedMotion: 'reduce' }); // reveal content shown at once for axe

      const res = await page.goto(url);
      expect(res.status()).toBe(200);
      expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      await expect(page.locator('.ka-concept')).toHaveText(CONCEPT);
      await expect(page.locator('.ka-concept')).toBeVisible();

      expect(serious(await new AxeBuilder({ page }).analyze())).toEqual([]);

      await page.setViewportSize({ width: 375, height: 812 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
        .toBeLessThanOrEqual(0);

      expect(errors).toEqual([]);
    });
  }

  test('neither the sitemap nor the CTSD home mentions the draft', async ({ request }) => {
    for (const url of ['/sitemap.xml', '/']) {
      const body = await (await request.get(url)).text();
      expect(body).not.toContain('/preview/kingsley');
      expect(body).not.toContain('/media/kingsley');
    }
  });

  test('hero videos answer byte ranges through the full stack (iOS needs 206)', async ({ request }) => {
    for (const name of ['hero-1920.mp4', 'hero-1280.mp4']) {
      const res = await request.get(`/media/kingsley/${name}`, { headers: { range: 'bytes=0-1' } });
      expect(res.status()).toBe(206);
      expect(res.headers()['content-range']).toMatch(/^bytes 0-1\/\d+$/);
      expect(res.headers()['accept-ranges']).toBe('bytes');
      expect((await res.body()).length).toBe(2);
    }
  });

  test('axe passes cream on stage black and stage black on ember', async ({ page }) => {
    await page.goto('/preview/kingsley/');
    await page.evaluate(() => {
      const box = document.createElement('div');
      box.id = 'contrast-probe';
      box.innerHTML =
        '<p id="cream-on-black" style="background:var(--ka-black);color:var(--ka-cream);font-size:14px;padding:8px">Cream on stage black</p>' +
        '<p id="black-on-ember" style="background:var(--ka-ember);color:var(--ka-black);font-size:14px;padding:8px">Stage black on ember</p>';
      document.body.prepend(box);
    });
    const axe = await new AxeBuilder({ page }).include('#contrast-probe').withRules(['color-contrast']).analyze();
    expect(axe.violations).toEqual([]);
    const passed = axe.passes.flatMap((r) => r.nodes.map((n) => String(n.target)));
    expect(passed).toEqual(expect.arrayContaining(['#cream-on-black', '#black-on-ember']));
  });
});
