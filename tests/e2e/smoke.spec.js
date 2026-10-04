import { test, expect } from '@playwright/test';

test('home page serves', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^CTSD — Technology built around your organization.$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Technology built around your organization.');
});

test('unknown API route returns JSON 404', async ({ request }) => {
  const res = await request.get('/api/nope');
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({ ok: false, error: 'not_found' });
});
