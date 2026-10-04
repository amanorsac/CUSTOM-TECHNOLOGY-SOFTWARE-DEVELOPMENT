import { test, expect } from '@playwright/test';

test('placeholder home page serves', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Custom Technology & Software Development/);
  await expect(page.getByText('Coming soon')).toBeVisible();
});

test('unknown API route returns JSON 404', async ({ request }) => {
  const res = await request.get('/api/nope');
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({ ok: false, error: 'not_found' });
});
