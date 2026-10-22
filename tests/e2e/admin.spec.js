import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The back office UI against a mocked /api/admin (the server side is covered in tests/worker/admin.test.js).
const CLIENT = { id: '33333333-3333-4333-8333-333333333333', kind: 'va', name: 'Mango & Ember', contact_name: 'Ama', email: 'ama@x.com', status: 'paid', plan: 'monthly', stripe_customer_id: 'cus_1', stripe_subscription_id: null, adelaide_id: 'mango-ember', created_at: '2026-10-15T10:00:00Z' };
const PROJECT_CLIENT = { id: '44444444-4444-4444-8444-444444444444', kind: 'project', name: 'Grace Church', contact_name: 'Kofi', email: 'k@x.com', status: 'prospect', stripe_customer_id: 'cus_9', created_at: '2026-10-16T10:00:00Z' };
const PROJECT = { id: '88888888-8888-4888-8888-888888888888', client_id: PROJECT_CLIENT.id, title: 'Website Launch', kind: 'website', status: 'quoted', scope: 'A 7-page site with sermons and events.', line_items: [{ description: 'Website Launch', amount: 3500 }, { description: 'Launch offer (50% off)', amount: -1750 }], deposit_pct: 40, quote_total: 1750, valid_until: '2026-11-30', created_at: '2026-10-17T10:00:00Z' };

async function mockApi(page, calls = []) {
  await page.route('**/api/admin/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname.replace('/api/admin', '');
    calls.push(`${req.method()} ${p}`);
    const ok = (json) => route.fulfill({ json });
    if (p === '/me') return ok({ email: 'dev@ctsd.local' });
    if (p === '/overview') return ok({ revenue: { thisMonth: 1996, lastMonth: 499 }, unpaid: [{ id: 'in_1', customer: 'Grace Church', amount: 700, due: 1790000000, daysLate: 3, url: 'https://invoice.stripe.com/x' }], va: { live: 1, minutes: 412, clients: [{ name: 'Mango & Ember', minutes: 412, bill: 497, projected: 520, profit: 360.5 }] }, pipeline: { newSignups: 1, newLeads: 2, projects: [{ status: 'quoted', count: 1, value: 1750 }, { status: 'active', count: 0, value: 0 }, { status: 'delivered', count: 0, value: 0 }, { status: 'closed', count: 0, value: 0 }], clients: { va: 1, project: 1 } }, warnings: [] });
    if (p === '/inbox') return ok({ signups: [{ id: '11111111-1111-4111-8111-111111111111', created_at: '2026-10-18T10:00:00Z', restaurant: 'Blue Ridge Pizza', owner_name: 'Sam', email: 's@x.com', mobile: '434', plan: 'cap', answer_mode: 'all', reservations: false, pickup: true, ready_time: '20 min', hours: { mon: '11-9' }, status: 'new' }], leads: [{ id: '22222222-2222-4222-8222-222222222222', created_at: '2026-10-18T11:00:00Z', kind: 'mockup', name: 'Kofi', org_name: 'Grace Church', email: 'k@x.com', needs: ['website'], status: 'new' }] });
    if (p === '/inbox/convert') return ok({ ...CLIENT, id: '99999999-9999-4999-8999-999999999999', name: 'Blue Ridge Pizza' });
    if (p === '/clients') return ok([CLIENT, PROJECT_CLIENT]);
    if (p === `/clients/${CLIENT.id}`) return ok({ client: CLIENT, projects: [], activity: [{ at: '2026-10-18T12:00:00Z', kind: 'payment', text: 'Setup fee paid ($499.00).' }], invoices: [], usage: { calls: 40, minutes: 412, bill: 497, projected: 520 }, warnings: [] });
    if (p.startsWith('/clients/99999999')) return ok({ client: { ...CLIENT, id: '99999999-9999-4999-8999-999999999999', name: 'Blue Ridge Pizza' }, projects: [], activity: [], invoices: [], usage: null, warnings: [] });
    if (p === `/clients/${PROJECT_CLIENT.id}`) return ok({ client: PROJECT_CLIENT, projects: [PROJECT], activity: [], invoices: [], usage: null, warnings: [] });
    if (p === `/clients/${CLIENT.id}/go-live`) return ok({ ...CLIENT, status: 'live', stripe_subscription_id: 'sub_1' });
    if (p === `/projects/${PROJECT.id}`) return req.method() === 'GET' ? ok({ project: PROJECT, client: PROJECT_CLIENT }) : ok(PROJECT);
    if (p === `/projects/${PROJECT.id}/deposit`) return ok({ ok: true, amount: 700 });
    if (p === '/billing') return ok({ month: '2026-10', rows: [{ id: CLIENT.id, name: 'Mango & Ember', plan: 'monthly', status: 'live', minutes: 412, reported: 300, bill: 497, backendBill: 497, upcoming: 497, issues: ['112 minutes not yet reported'] }], warning: null });
    if (p === '/billing/report') return ok({ results: [{ month: '2026-10', reported: [{ client: 'Mango & Ember', minutes: 112 }], skipped: [] }] });
    if (p === '/settings') return ok({ stripe: { connected: true, mode: 'test', meter: 'mtr_1', prices: ['va_monthly_base'], webhook: true }, adelaide: { configured: true, ok: true }, access: { team: null } });
    return route.fulfill({ status: 404, json: { error: 'not_found' } });
  });
}

test.describe('Back office', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('is noindexed and shows the overview', async ({ page }) => {
    await mockApi(page);
    const res = await page.goto('/admin/');
    expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await expect(page.locator('h1')).toHaveText('Overview');
    await expect(page.locator('main')).toContainText('$1,996.00');
    await expect(page.locator('main')).toContainText('3 days late');
    await expect(page.locator('#inbox-count')).toHaveText('2');
  });

  test('inbox: a sign-up becomes a client', async ({ page }) => {
    const calls = [];
    await mockApi(page, calls);
    await page.goto('/admin/#/inbox');
    await expect(page.locator('main')).toContainText('Blue Ridge Pizza');
    await page.getByRole('button', { name: 'Make client' }).first().click();
    await expect(page).toHaveURL(/#\/clients\/99999999/);
    expect(calls).toContain('POST /inbox/convert');
  });

  test('a Virtual Assistant client goes live after confirming', async ({ page }) => {
    const calls = [];
    await mockApi(page, calls);
    page.on('dialog', (d) => d.accept());
    await page.goto(`/admin/#/clients/${CLIENT.id}`);
    await expect(page.locator('h1')).toHaveText('Mango & Ember');
    await expect(page.locator('main')).toContainText('412');
    await page.getByRole('button', { name: 'Go live (start plan)' }).click();
    await expect(page.locator('#toast')).toContainText('Live');
    expect(calls).toContain(`POST /clients/${CLIENT.id}/go-live`);
  });

  test('a project proposal: line items, the 50% offer, the deposit invoice and the PDF view', async ({ page, context }) => {
    const calls = [];
    await mockApi(page, calls);
    page.on('dialog', (d) => d.accept());
    await page.goto(`/admin/#/projects/${PROJECT.id}`);
    await expect(page.locator('#lines tr')).toHaveCount(2);
    await page.getByRole('button', { name: 'Invoice the deposit' }).click();
    await expect(page.locator('#toast')).toContainText('$700.00');
    const proposal = await context.newPage();
    await mockApi(proposal);
    await proposal.goto(`/admin/proposal.html?id=${PROJECT.id}`);
    await expect(proposal.locator('h1')).toHaveText('Website Launch');
    await expect(proposal.locator('tfoot')).toContainText('$1,750.00');
    await expect(proposal.locator('.schedule')).toContainText('$700.00');
    await expect(proposal.locator('.neg')).toContainText('−$1,750.00');
    await expect(proposal.getByRole('button', { name: 'Save as PDF' })).toBeVisible();
  });

  test('billing flags unreported minutes and reports them on demand', async ({ page }) => {
    await mockApi(page);
    await page.goto('/admin/#/billing');
    await expect(page.locator('tr.is-issue')).toContainText('112 minutes not yet reported');
    await page.getByRole('button', { name: 'Report usage now' }).click();
    await expect(page.locator('#toast')).toContainText('Sent usage for 1 restaurant');
  });

  for (const hash of ['#/', '#/inbox', '#/clients', `#/clients/${CLIENT.id}`, `#/projects/${PROJECT.id}`, '#/billing', '#/settings']) {
    test(`no serious axe violations on ${hash}`, async ({ page }) => {
      await mockApi(page);
      await page.goto(`/admin/${hash}`);
      await expect(page.locator('main h1')).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });
  }
});
