import { test, expect } from '@playwright/test';

const KA = '/preview/kingsley/';

async function fillBook(page) {
  await page.getByLabel('Organiser type').selectOption({ label: 'Church' });
  await page.getByLabel('Organisation name').fill('Grace Chapel');
  await page.getByLabel('Contact name').fill('Ama Mensah');
  await page.getByLabel('Phone').fill('+233201234567');
  await page.getByLabel(/^Email/).fill('ama@example.com');
  await page.getByLabel('Event name').fill('Night of Worship');
  await page.getByLabel('Event date').fill('2027-03-12');
  await page.getByLabel('Venue and city').fill('Accra');
}

test('empty Book form shows errors and focuses organiser type', async ({ page }) => {
  await page.goto(KA + 'book/');
  await page.getByRole('button', { name: 'Send booking request' }).click();
  await expect(page.getByLabel('Organiser type')).toBeFocused();
  await expect(page.locator('.ka-field__error:visible').first()).toBeVisible();
  expect(await page.locator('.ka-field__error:visible').count()).toBeGreaterThan(3);
});

test('Book success sends a booking lead', async ({ page }) => {
  let body;
  await page.route('**/api/lead', (route) => {
    body = route.request().postDataJSON();
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto(KA + 'book/');
  await fillBook(page);
  await page.getByRole('button', { name: 'Send booking request' }).click();
  await expect(page.getByText("Thank you. Kingsley's team will be in touch.")).toBeVisible();
  expect(body.kind).toBe('booking');
  expect(body.design_slug).toBe('kingsley');
  expect(body.org_type).toBe('church');
  expect(body.message).toContain('Event name: Night of Worship');
  expect(body.message).toContain('Country: Ghana');
});

test('Book failure shows the mailto fallback and keeps typed values', async ({ page }) => {
  await page.route('**/api/lead', (route) => route.fulfill({ status: 500, body: 'no' }));
  await page.goto(KA + 'book/');
  await fillBook(page);
  await page.getByRole('button', { name: 'Send booking request' }).click();
  await expect(page.getByText("Couldn't send right now. Email us instead:")).toBeVisible();
  const href = await page.locator('a[href^="mailto:amanorsac@gmail.com"]').first().getAttribute('href');
  expect(href).toContain('Grace%20Chapel');
  await expect(page.getByLabel('Contact name')).toHaveValue('Ama Mensah');
  await expect(page.getByRole('button', { name: 'Send booking request' })).toBeEnabled();
});

test('Contact form success', async ({ page }) => {
  let body;
  await page.route('**/api/lead', (route) => {
    body = route.request().postDataJSON();
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto(KA + 'contact/');
  await page.getByLabel('Your name').fill('Ama');
  await page.getByLabel('Email').fill('ama@example.com');
  await page.getByLabel('Message').fill('Blessings from Kumasi.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Thank you. Your message is on its way.')).toBeVisible();
  expect(body.kind).toBe('contact');
  expect(body.org_type).toBe('other');
});

test('Contact lists the four social links and prints no email', async ({ page }) => {
  await page.goto(KA + 'contact/');
  const main = page.locator('main');
  for (const n of ['YouTube', 'Spotify', 'Apple Music', 'Instagram']) {
    await expect(main.getByRole('link', { name: new RegExp(n) })).toBeVisible();
  }
  expect(await main.innerText()).not.toMatch(/@gmail|@.*\.(com|org)/i);
});

test('forms work after a client-side page swap', async ({ page }) => {
  await page.goto(KA);
  await page.locator('.ka-nav a', { hasText: 'Book' }).click();
  await expect(page).toHaveURL(/book\/$/);
  await page.getByRole('button', { name: 'Send booking request' }).click();
  await expect(page.getByLabel('Organiser type')).toBeFocused();
});
