// Back office: Access gate, inbox conversion, Stripe actions, usage reporting, webhook (spec 2026-10-14-back-office-design.md).
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { env as baseEnv, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';
import { _resetAccessCache } from '../../src/lib/access.js';
import { formEncode, signPayload, nextFirstOfMonth } from '../../src/lib/stripe.js';
import { reportMonth } from '../../src/lib/usage.js';

const SB = 'https://sb.example.supabase.co';
const ADE = 'https://adelaide.example';
const TEAM = 'ctsdtest';
const AUD = 'aud-123';
const makeEnv = (over = {}) => ({
  ...baseEnv, SUPABASE_URL: SB, SUPABASE_SERVICE_KEY: 'svc', STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_WEBHOOK_SECRET: 'whsec_test',
  ADELAIDE_BASE: ADE, ADELAIDE_ADMIN_KEY: 'adm', ACCESS_TEAM: TEAM, ACCESS_AUD: AUD, ADMIN_DEV_EMAIL: '', LEAD_EMAIL: 'owner@ctsd.example', RESEND_API_KEY: '', ...over,
});

// ---- A real RS256 key pair, so the Access check verifies genuine signatures ----
let keyPair, jwk;
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlJson = (o) => b64url(new TextEncoder().encode(JSON.stringify(o)));
async function token(claims = {}, { kid = 'k1', key = keyPair.privateKey } = {}) {
  const head = b64urlJson({ alg: 'RS256', kid, typ: 'JWT' });
  const body = b64urlJson({ aud: [AUD], email: 'owner@ctsd.example', exp: Math.floor(Date.now() / 1000) + 600, iss: `https://${TEAM}.cloudflareaccess.com`, ...claims });
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}
beforeAll(async () => {
  keyPair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  jwk = { ...(await crypto.subtle.exportKey('jwk', keyPair.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
});

// ---- Fetch stub: Access certs, Supabase, Stripe, Adelaide ----
let calls, handlers, db;
const route = (match, fn) => handlers.push({ match, fn });
const jsonRes = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
function table(name) { return (db[name] ||= []); }

beforeEach(() => {
  _resetAccessCache();
  calls = []; handlers = []; db = {};
  route((u) => u === `https://${TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`, () => jsonRes({ keys: [jwk] }));
  // A tiny PostgREST: eq filters on select/update, insert returns the row with an id.
  route((u) => u.startsWith(`${SB}/rest/v1/`), (u, call) => {
    const url = new URL(u); const name = url.pathname.split('/').pop();
    const filters = [...url.searchParams].filter(([k, v]) => !['select', 'order', 'limit', 'on_conflict'].includes(k) && /^(eq|in|ilike|not)\./.test(v));
    const match = (row) => filters.every(([k, v]) => {
      if (v.startsWith('eq.')) return String(row[k]) === decodeURIComponent(v.slice(3));
      if (v.startsWith('ilike.')) return String(row[k] || '').toLowerCase() === decodeURIComponent(v.slice(6)).toLowerCase();
      if (v.startsWith('in.(')) return v.slice(4, -1).split(',').includes(String(row[k]));
      if (v === 'not.is.null') return row[k] !== null && row[k] !== undefined;
      return true;
    });
    if (call.method === 'GET') return jsonRes(table(name).filter(match));
    const data = JSON.parse(call.body || '{}');
    if (call.method === 'POST' && url.searchParams.get('on_conflict')) {
      const keys = url.searchParams.get('on_conflict').split(',');
      const rows = table(name); const i = rows.findIndex((r) => keys.every((k) => r[k] === data[k]));
      if (i >= 0) rows[i] = { ...rows[i], ...data }; else rows.push(data);
      return jsonRes([data], 201);
    }
    if (call.method === 'POST') { const row = { id: crypto.randomUUID(), ...data }; table(name).push(row); return jsonRes([row], 201); }
    if (call.method === 'PATCH') { const hits = table(name).filter(match); hits.forEach((r) => Object.assign(r, data)); return jsonRes(hits); }
    return jsonRes([]);
  });
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const req = new Request(input, init);
    const call = { url: req.url, method: req.method, body: await req.text(), headers: req.headers };
    calls.push(call);
    for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i].match(req.url)) return handlers[i].fn(req.url, call);
    throw new Error(`unexpected fetch ${req.method} ${req.url}`);
  });
});
afterEach(() => vi.restoreAllMocks());

async function api(method, path, { body, headers = {}, envOver = {}, auth = true } = {}) {
  const h = { ...headers };
  if (auth) h['cf-access-jwt-assertion'] = await token();
  if (body !== undefined) h['content-type'] = 'application/json';
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsdstudio.com${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }), makeEnv(envOver), ctx);
  await waitOnExecutionContext(ctx);
  return res;
}
const stripeCalls = () => calls.filter((c) => c.url.startsWith('https://api.stripe.com/'));

describe('Access gate', () => {
  it('lets a valid Access token through', async () => {
    const res = await api('GET', '/api/admin/me');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'owner@ctsd.example' });
  });

  it('refuses no token, a wrong audience, an expired token, a forged signature and missing settings', async () => {
    expect((await api('GET', '/api/admin/me', { auth: false })).status).toBe(403);
    expect((await api('GET', '/api/admin/me', { auth: false, headers: { 'cf-access-jwt-assertion': await token({ aud: ['other'] }) } })).status).toBe(403);
    expect((await api('GET', '/api/admin/me', { auth: false, headers: { 'cf-access-jwt-assertion': await token({ exp: 1000 }) } })).status).toBe(403);
    const other = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    expect((await api('GET', '/api/admin/me', { auth: false, headers: { 'cf-access-jwt-assertion': await token({}, { key: other.privateKey }) } })).status).toBe(403);
    expect((await api('GET', '/api/admin/me', { envOver: { ACCESS_AUD: '' } })).status).toBe(403);
  });

  it('guards the admin pages too, and the dev bypass works only on localhost', async () => {
    expect((await api('GET', '/admin/', { auth: false })).status).toBe(403);
    expect((await api('GET', '/api/admin/me', { auth: false, envOver: { ADMIN_DEV_EMAIL: 'dev@x' } })).status).toBe(403);
    const ctx = createExecutionContext();
    const res = await worker.fetch(new Request('http://localhost:8787/api/admin/me'), makeEnv({ ADMIN_DEV_EMAIL: 'dev@x' }), ctx);
    expect(res.status).toBe(200);
  });
});

describe('Inbox', () => {
  it('turns a Virtual Assistant sign-up into a client and marks the sign-up converted', async () => {
    table('va_signups').push({ id: '11111111-1111-4111-8111-111111111111', restaurant: 'Mango & Ember', owner_name: 'Ama', email: 'ama@x.com', mobile: '434', address: '1 Main', plan: 'cap', answer_mode: 'missed', assistant_name: 'Efua', status: 'new' });
    const res = await api('POST', '/api/admin/inbox/convert', { body: { type: 'signup', id: '11111111-1111-4111-8111-111111111111' } });
    expect(res.status).toBe(200);
    const client = await res.json();
    expect(client).toMatchObject({ kind: 'va', name: 'Mango & Ember', contact_name: 'Ama', plan: 'cap', status: 'new' });
    expect(client.notes).toContain('Assistant name: Efua');
    expect(db.va_signups[0].status).toBe('converted');
    expect(db.activity[0]).toMatchObject({ client_id: client.id, kind: 'status' });
  });

  it('turns a website lead into a project client', async () => {
    table('leads').push({ id: '22222222-2222-4222-8222-222222222222', kind: 'project', name: 'Kofi', org_name: 'Grace Church', email: 'k@x.com', needs: ['website'], status: 'new' });
    const client = await (await api('POST', '/api/admin/inbox/convert', { body: { type: 'lead', id: '22222222-2222-4222-8222-222222222222' } })).json();
    expect(client).toMatchObject({ kind: 'project', name: 'Grace Church', status: 'prospect' });
    expect(db.leads[0].status).toBe('won');
  });
});

describe('Clients and Stripe', () => {
  const CID = '33333333-3333-4333-8333-333333333333';
  beforeEach(() => {
    table('clients').push({ id: CID, kind: 'va', name: 'Mango & Ember', email: 'ama@x.com', status: 'paid', plan: 'monthly', stripe_customer_id: 'cus_1', stripe_subscription_id: null });
    route((u) => u.startsWith('https://api.stripe.com/v1/prices'), () => jsonRes({ data: [{ id: 'price_base', lookup_key: 'va_monthly_base' }, { id: 'price_use', lookup_key: 'va_monthly_usage' }] }));
    route((u) => u === 'https://api.stripe.com/v1/subscriptions', () => jsonRes({ id: 'sub_1' }));
  });

  it('goes live: starts the plan billed on the 1st, records it, and refuses a second subscription', async () => {
    const res = await api('POST', `/api/admin/clients/${CID}/go-live`, { body: {} });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'live', stripe_subscription_id: 'sub_1', plan: 'monthly' });
    const sub = stripeCalls().find((c) => c.url.endsWith('/v1/subscriptions'));
    const params = new URLSearchParams(sub.body);
    expect(params.get('items[0][price]')).toBe('price_base');
    expect(params.get('items[1][price]')).toBe('price_use');
    expect(params.get('collection_method')).toBe('send_invoice');
    expect(Number(params.get('billing_cycle_anchor'))).toBe(nextFirstOfMonth());
    expect(sub.headers.get('authorization')).toBe('Bearer sk_test_x');
    expect((await api('POST', `/api/admin/clients/${CID}/go-live`, { body: {} })).status).toBe(400);
  });

  it('rejects an unknown status and a bad plan', async () => {
    expect((await api('PATCH', `/api/admin/clients/${CID}`, { body: { status: 'prospect' } })).status).toBe(400);
    expect((await api('POST', `/api/admin/clients/${CID}/plan`, { body: { plan: 'gold' } })).status).toBe(400);
  });

  it('a Stripe error comes back as a readable message', async () => {
    route((u) => u === 'https://api.stripe.com/v1/subscriptions', () => jsonRes({ error: { message: 'No such customer: cus_1' } }, 400));
    const res = await api('POST', `/api/admin/clients/${CID}/go-live`, { body: {} });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('No such customer: cus_1');
  });
});

describe('Proposals', () => {
  it('a project total follows its line items, discounts included, and the deposit invoice is 40% of it', async () => {
    const CID = '44444444-4444-4444-8444-444444444444';
    table('clients').push({ id: CID, kind: 'project', name: 'Grace Church', status: 'prospect', stripe_customer_id: 'cus_9' });
    const project = await (await api('POST', '/api/admin/projects', { body: { client_id: CID, title: 'Website Launch', line_items: [{ description: 'Website Launch', amount: 3500 }, { description: 'Launch offer (50%)', amount: -1750 }] } })).json();
    expect(Number(project.quote_total)).toBe(1750);
    let invoiceItem = null;
    route((u) => u === 'https://api.stripe.com/v1/invoices', () => jsonRes({ id: 'in_1' }));
    route((u) => u === 'https://api.stripe.com/v1/invoiceitems', (u, call) => { invoiceItem = new URLSearchParams(call.body); return jsonRes({ id: 'ii_1' }); });
    route((u) => /\/v1\/invoices\/in_1\/(finalize|send)$/.test(u), () => jsonRes({ id: 'in_1', number: 'CTSD-0001', hosted_invoice_url: 'https://invoice.stripe.com/x' }));
    const res = await api('POST', `/api/admin/projects/${project.id}/deposit`, { body: {} });
    expect(await res.json()).toMatchObject({ ok: true, amount: 700 });
    expect(invoiceItem.get('amount')).toBe('70000');
    expect(db.projects[0].status).toBe('active');
  });
});

describe('Usage reporting', () => {
  it('reports only the new minutes, once, with an idempotent identifier', async () => {
    const CID = '55555555-5555-4555-8555-555555555555';
    table('clients').push({ id: CID, kind: 'va', name: 'Mango & Ember', status: 'live', adelaide_id: 'mango-ember', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1' });
    table('usage_reports').push({ client_id: CID, month: '2026-10', minutes_reported: 300 });
    let minutes = 412.6;
    route((u) => u.startsWith(`${ADE}/billing.json`), () => jsonRes([{ id: 'mango-ember', minutes, bill: { total: 497 } }]));
    const events = [];
    route((u) => u === 'https://api.stripe.com/v1/billing/meter_events', (u, call) => { events.push(new URLSearchParams(call.body)); return jsonRes({}); });
    const env = makeEnv();
    const first = await reportMonth(env, '2026-10');
    expect(first.reported).toEqual([{ client: 'Mango & Ember', minutes: 113, total: 413 }]);
    expect(events[0].get('payload[value]')).toBe('113');
    expect(events[0].get('payload[stripe_customer_id]')).toBe('cus_1');
    expect(events[0].get('identifier')).toBe(`ctsd-${CID}-2026-10-413`);
    expect((await reportMonth(env, '2026-10')).reported).toEqual([]);
    minutes = 420;
    expect((await reportMonth(env, '2026-10')).reported).toEqual([{ client: 'Mango & Ember', minutes: 7, total: 420 }]);
    expect(events).toHaveLength(2);
  });

  it('skips a restaurant the backend does not know, and keeps going when Stripe fails for one', async () => {
    table('clients').push(
      { id: '66666666-6666-4666-8666-666666666666', kind: 'va', name: 'Gone', status: 'live', adelaide_id: 'gone', stripe_customer_id: 'cus_2', stripe_subscription_id: 's2' },
      { id: '77777777-7777-4777-8777-777777777777', kind: 'va', name: 'Broken', status: 'live', adelaide_id: 'broken', stripe_customer_id: 'cus_3', stripe_subscription_id: 's3' },
    );
    route((u) => u.startsWith(`${ADE}/billing.json`), () => jsonRes([{ id: 'broken', minutes: 50, bill: { total: 169 } }]));
    route((u) => u === 'https://api.stripe.com/v1/billing/meter_events', () => jsonRes({ error: { message: 'meter missing' } }, 400));
    const r = await reportMonth(makeEnv(), '2026-10');
    expect(r.skipped.map((s) => s.client).sort()).toEqual(['Broken', 'Gone']);
    expect(db.usage_reports || []).toEqual([]);
  });
});

describe('Stripe setup', () => {
  it('creates only what is missing and is safe to run twice', async () => {
    const created = { meter: false, products: new Set(), prices: new Set() };
    route((u) => u.startsWith('https://api.stripe.com/v1/billing/meters'), (u, call) => {
      if (call.method === 'POST') { created.meter = true; return jsonRes({ id: 'mtr_1', event_name: 'va_minutes' }); }
      return jsonRes({ data: created.meter ? [{ id: 'mtr_1', event_name: 'va_minutes' }] : [] });
    });
    route((u) => u.startsWith('https://api.stripe.com/v1/products'), (u, call) => {
      if (call.method === 'POST') { created.products.add(new URLSearchParams(call.body).get('id')); return jsonRes({}); }
      const id = u.split('/').pop();
      return created.products.has(id) ? jsonRes({ id }) : jsonRes({ error: { message: 'No such product' } }, 404);
    });
    route((u) => u.startsWith('https://api.stripe.com/v1/prices'), (u, call) => {
      if (call.method === 'POST') { created.prices.add(new URLSearchParams(call.body).get('lookup_key')); return jsonRes({}); }
      return jsonRes({ data: [...created.prices].map((k) => ({ id: `price_${k}`, lookup_key: k })) });
    });
    const first = await (await api('POST', '/api/admin/stripe/setup', { body: {} })).json();
    expect(first.created).toHaveLength(1 + 4 + 7);
    expect(first.prices).toHaveLength(7);
    const capUsage = stripeCalls().find((c) => c.method === 'POST' && c.url.endsWith('/v1/prices') && c.body.includes('va_cap_usage'));
    const p = new URLSearchParams(capUsage.body);
    expect([p.get('tiers[0][up_to]'), p.get('tiers[0][unit_amount]'), p.get('tiers[1][up_to]'), p.get('tiers[1][flat_amount]')]).toEqual(['1111', '45', 'inf', '5']);
    const second = await (await api('POST', '/api/admin/stripe/setup', { body: {} })).json();
    expect(second.created).toEqual([]);
  });

  it('form-encodes nested Stripe parameters', () => {
    expect(formEncode({ items: [{ price: 'a' }], payload: { v: 2 }, skip: undefined })).toBe('items%5B0%5D%5Bprice%5D=a&payload%5Bv%5D=2');
  });
});

describe('Stripe webhook', () => {
  async function send(event, { secret = 'whsec_test', t = Math.floor(Date.now() / 1000) } = {}) {
    const raw = JSON.stringify(event);
    const sig = await signPayload(secret, t, raw);
    const ctx = createExecutionContext();
    const res = await worker.fetch(new Request('https://ctsdstudio.com/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${t},v1=${sig}` }, body: raw }), makeEnv(), ctx);
    await waitOnExecutionContext(ctx);
    return res;
  }

  it('rejects a bad or stale signature', async () => {
    expect((await send({ type: 'invoice.paid' }, { secret: 'wrong' })).status).toBe(400);
    expect((await send({ type: 'invoice.paid' }, { t: Math.floor(Date.now() / 1000) - 3600 })).status).toBe(400);
  });

  it('marks the setup fee paid on the sign-up and client, and logs paid invoices and cancellations', async () => {
    table('va_signups').push({ id: 's1', email: 'Ama@x.com', status: 'new' });
    table('clients').push({ id: 'c1', kind: 'va', email: 'ama@x.com', status: 'new', stripe_customer_id: null });
    expect((await send({ type: 'checkout.session.completed', data: { object: { customer_details: { email: 'ama@x.com' }, customer: 'cus_7', amount_total: 49900 } } })).status).toBe(200);
    expect(db.va_signups[0].status).toBe('paid');
    expect(db.clients[0]).toMatchObject({ status: 'paid', stripe_customer_id: 'cus_7' });
    await send({ type: 'invoice.paid', data: { object: { customer: 'cus_7', number: 'CTSD-1', amount_paid: 49700 } } });
    await send({ type: 'customer.subscription.deleted', data: { object: { customer: 'cus_7' } } });
    expect(db.clients[0].status).toBe('cancelled');
    expect(db.activity.map((a) => a.text)).toEqual(['Setup fee paid ($499.00).', 'Invoice CTSD-1 paid ($497.00).', 'Subscription cancelled in Stripe.']);
  });
});
