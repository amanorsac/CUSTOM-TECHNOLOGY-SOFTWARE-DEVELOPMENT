// Stripe REST access for the back office (no SDK: plain fetch with form encoding). The secret key lives only
// in the STRIPE_SECRET_KEY Worker secret and only ever goes into outbound Authorization headers.
// Stripe is the record for money: customers, subscriptions, invoices, payments.

const API = 'https://api.stripe.com/v1';
export class StripeError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

// { a: 1, items: [{ price: 'x' }], payload: { v: 2 } } -> a=1&items[0][price]=x&payload[v]=2
export function formEncode(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (item !== null && typeof item === 'object' ? formEncode(item, `${key}[${i}]`, out) : out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`)));
    else if (typeof v === 'object') formEncode(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}

export async function stripe(env, method, path, params = {}, { idempotencyKey } = {}) {
  if (!env.STRIPE_SECRET_KEY) throw new StripeError('Stripe is not configured', 500, 'not_configured');
  const isGet = method === 'GET';
  const qs = formEncode(params);
  const headers = { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
  if (!isGet) headers['content-type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const res = await fetch(`${API}${path}${isGet && qs ? `?${qs}` : ''}`, { method, headers, body: isGet ? undefined : qs, signal: AbortSignal.timeout(15000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new StripeError((data.error && data.error.message) || `Stripe ${res.status}`, res.status, data.error && data.error.code);
  return data;
}

// ---- The catalogue (spec: "Stripe setup") ------------------------------------------------------------------
export const METER_EVENT = 'va_minutes';
export const PRODUCTS = [
  { id: 'ctsd_va_monthly', name: 'Virtual Assistant Monthly' },
  { id: 'ctsd_va_payg', name: 'Virtual Assistant Pay as you go' },
  { id: 'ctsd_va_cap', name: 'Virtual Assistant Cap' },
  { id: 'ctsd_va_setup', name: 'Virtual Assistant setup' },
];
// Each plan = a flat monthly price + a metered price on the va_minutes meter (amounts in cents).
export const PRICES = (meterId) => [
  { lookup_key: 'va_monthly_base', product: 'ctsd_va_monthly', currency: 'usd', unit_amount: 49700, recurring: { interval: 'month' } },
  { lookup_key: 'va_monthly_usage', product: 'ctsd_va_monthly', currency: 'usd', billing_scheme: 'tiered', tiers_mode: 'graduated',
    tiers: [{ up_to: 1000, unit_amount: 0 }, { up_to: 'inf', unit_amount: 35 }], recurring: { interval: 'month', usage_type: 'metered', meter: meterId } },
  { lookup_key: 'va_payg_base', product: 'ctsd_va_payg', currency: 'usd', unit_amount: 14900, recurring: { interval: 'month' } },
  { lookup_key: 'va_payg_usage', product: 'ctsd_va_payg', currency: 'usd', unit_amount: 40, recurring: { interval: 'month', usage_type: 'metered', meter: meterId } },
  { lookup_key: 'va_cap_base', product: 'ctsd_va_cap', currency: 'usd', unit_amount: 14900, recurring: { interval: 'month' } },
  // 1,111 minutes at 45¢ = $499.95; the free tier's flat 5¢ makes the capped month exactly $149 + $500 = $649.
  { lookup_key: 'va_cap_usage', product: 'ctsd_va_cap', currency: 'usd', billing_scheme: 'tiered', tiers_mode: 'graduated',
    tiers: [{ up_to: 1111, unit_amount: 45 }, { up_to: 'inf', unit_amount: 0, flat_amount: 5 }], recurring: { interval: 'month', usage_type: 'metered', meter: meterId } },
  { lookup_key: 'va_setup', product: 'ctsd_va_setup', currency: 'usd', unit_amount: 49900 },
];
export const PLAN_PRICES = { monthly: ['va_monthly_base', 'va_monthly_usage'], payg: ['va_payg_base', 'va_payg_usage'], cap: ['va_cap_base', 'va_cap_usage'] };
const ALL_KEYS = ['va_monthly_base', 'va_monthly_usage', 'va_payg_base', 'va_payg_usage', 'va_cap_base', 'va_cap_usage', 'va_setup'];

export async function findMeter(env) {
  const list = await stripe(env, 'GET', '/billing/meters', { status: 'active', limit: 100 });
  return (list.data || []).find((m) => m.event_name === METER_EVENT) || null;
}

export async function pricesByKey(env, keys = ALL_KEYS) {
  const list = await stripe(env, 'GET', '/prices', { lookup_keys: keys, active: 'true', limit: 100 });
  return Object.fromEntries((list.data || []).map((p) => [p.lookup_key, p]));
}

// Creates whatever is missing; safe to run any number of times. Returns what was created and what exists.
export async function setupCatalogue(env) {
  const created = [];
  let meter = await findMeter(env);
  if (!meter) {
    meter = await stripe(env, 'POST', '/billing/meters', {
      display_name: 'Virtual Assistant minutes', event_name: METER_EVENT,
      default_aggregation: { formula: 'sum' },
      customer_mapping: { type: 'by_id', event_payload_key: 'stripe_customer_id' },
      value_settings: { event_payload_key: 'value' },
    }, { idempotencyKey: 'ctsd-setup-meter' });
    created.push(`meter ${METER_EVENT}`);
  }
  for (const p of PRODUCTS) {
    try { await stripe(env, 'GET', `/products/${p.id}`); }
    catch (e) {
      if (e.status !== 404) throw e;
      await stripe(env, 'POST', '/products', { id: p.id, name: p.name }, { idempotencyKey: `ctsd-setup-${p.id}` });
      created.push(`product ${p.name}`);
    }
  }
  const have = await pricesByKey(env);
  for (const price of PRICES(meter.id)) {
    if (have[price.lookup_key]) continue;
    await stripe(env, 'POST', '/prices', price, { idempotencyKey: `ctsd-setup-${price.lookup_key}` });
    created.push(`price ${price.lookup_key}`);
  }
  return { created, meter: meter.id, prices: Object.keys(await pricesByKey(env)) };
}

// ---- Customers, subscriptions, invoices ----------------------------------------------------------------------
export const createCustomer = (env, client) => stripe(env, 'POST', '/customers', {
  name: client.name, email: client.email || undefined, phone: client.phone || undefined,
  metadata: { ctsd_client_id: client.id, kind: client.kind },
}, { idempotencyKey: `ctsd-customer-${client.id}` });

// The 1st of next month, as a Unix time (UTC), so every Virtual Assistant bill runs on the 1st.
export function nextFirstOfMonth(now = new Date()) {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) / 1000);
}

// Starts a plan: flat + metered price, billed on the 1st, first month prorated, invoices emailed by Stripe.
export async function startSubscription(env, customerId, plan, { now = new Date() } = {}) {
  const keys = PLAN_PRICES[plan];
  if (!keys) throw new StripeError(`unknown plan ${plan}`, 400, 'bad_plan');
  const prices = await pricesByKey(env, keys);
  if (!prices[keys[0]] || !prices[keys[1]]) throw new StripeError('Stripe prices are missing: run "Set up Stripe" in Settings first', 400, 'no_prices');
  return stripe(env, 'POST', '/subscriptions', {
    customer: customerId,
    items: [{ price: prices[keys[0]].id }, { price: prices[keys[1]].id }],
    billing_cycle_anchor: nextFirstOfMonth(now),
    proration_behavior: 'create_prorations',
    collection_method: 'send_invoice',
    days_until_due: 7,
    metadata: { plan },
  });
}

// Moves a subscription to another plan's two prices.
export async function changePlan(env, subscriptionId, plan) {
  const keys = PLAN_PRICES[plan];
  const [sub, prices] = await Promise.all([stripe(env, 'GET', `/subscriptions/${subscriptionId}`), pricesByKey(env, keys)]);
  const items = sub.items.data.map((it) => ({ id: it.id, deleted: 'true' }));
  items.push({ price: prices[keys[0]].id }, { price: prices[keys[1]].id });
  return stripe(env, 'POST', `/subscriptions/${subscriptionId}`, { items, proration_behavior: 'create_prorations', metadata: { plan } });
}

export const pauseSubscription = (env, id) => stripe(env, 'POST', `/subscriptions/${id}`, { pause_collection: { behavior: 'void' } });
export const resumeSubscription = (env, id) => stripe(env, 'POST', `/subscriptions/${id}`, { pause_collection: '' });
export const cancelSubscription = (env, id) => stripe(env, 'DELETE', `/subscriptions/${id}`);

// A one-off invoice with line items (amounts in dollars), emailed by Stripe with a payment link.
export async function sendInvoice(env, customerId, lines, { daysUntilDue = 7, memo, key } = {}) {
  const invoice = await stripe(env, 'POST', '/invoices', {
    customer: customerId, collection_method: 'send_invoice', days_until_due: daysUntilDue,
    auto_advance: 'false', description: memo,
  }, key ? { idempotencyKey: `${key}-invoice` } : {});
  for (const [i, line] of lines.entries()) {
    const item = { customer: customerId, invoice: invoice.id, description: line.description };
    if (line.price) item.price = line.price; else { item.amount = Math.round(line.amount * 100); item.currency = 'usd'; }
    await stripe(env, 'POST', '/invoiceitems', item, key ? { idempotencyKey: `${key}-item-${i}` } : {});
  }
  await stripe(env, 'POST', `/invoices/${invoice.id}/finalize`, {});
  return stripe(env, 'POST', `/invoices/${invoice.id}/send`, {});
}

export async function sendSetupInvoice(env, customerId, clientId) {
  const prices = await pricesByKey(env, ['va_setup']);
  if (!prices.va_setup) throw new StripeError('Stripe prices are missing: run "Set up Stripe" in Settings first', 400, 'no_prices');
  return sendInvoice(env, customerId, [{ price: prices.va_setup.id, description: 'Virtual Assistant setup' }], { key: `ctsd-setup-fee-${clientId}` });
}

export const listInvoices = (env, params) => stripe(env, 'GET', '/invoices', { limit: 100, ...params });

// Minutes for one customer, as a single meter event. `identifier` makes a retry a no-op on Stripe's side.
export const meterEvent = (env, customerId, minutes, timestamp, identifier) => stripe(env, 'POST', '/billing/meter_events', {
  event_name: METER_EVENT, timestamp, identifier, payload: { stripe_customer_id: customerId, value: String(minutes) },
});

export const upcomingInvoice = (env, customerId, subscriptionId) => stripe(env, 'POST', '/invoices/create_preview', { customer: customerId, subscription: subscriptionId });

// ---- Webhooks -----------------------------------------------------------------------------------------------------
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function signPayload(secret, timestamp, body) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`)));
}

// True when the Stripe-Signature header matches the raw body and is less than 5 minutes old.
export async function verifyWebhook(secret, header, body, now = Math.floor(Date.now() / 1000)) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => { const i = kv.indexOf('='); return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()]; }).filter(([k]) => k === 't'));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(now - t) > 300) return false;
  const expected = await signPayload(secret, t, body);
  const given = header.split(',').map((kv) => kv.trim()).filter((kv) => kv.startsWith('v1=')).map((kv) => kv.slice(3));
  return given.some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
}

function timingSafeEqual(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
