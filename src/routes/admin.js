// The back office (spec 2026-10-14-back-office-design.md): /admin pages and the /api/admin JSON API.
// Every request passes the Cloudflare Access check first (src/lib/access.js).
import { verifyAccess } from '../lib/access.js';
import { select, one, insert, update, logActivity, signedDownload, DbError } from '../lib/db.js';
import {
  StripeError, setupCatalogue, findMeter, pricesByKey, createCustomer, startSubscription, changePlan,
  pauseSubscription, resumeSubscription, cancelSubscription, sendInvoice, sendSetupInvoice, listInvoices, upcomingInvoice,
} from '../lib/stripe.js';
import { adelaideBilling, reportUsage, monthKey } from '../lib/usage.js';
import { planCost } from '../../public/assets/js/va-plans.js';

const PLANS = ['monthly', 'payg', 'cap'];
const VA_STATUSES = ['new', 'paid', 'onboarding', 'live', 'paused', 'cancelled'];
const PROJECT_CLIENT_STATUSES = ['prospect', 'active', 'done', 'lost'];
const PROJECT_STATUSES = ['quoted', 'active', 'delivered', 'closed'];
const PROJECT_KINDS = ['website', 'app', 'portal', 'crm', 'integration', 'other'];
const CLIENT_FIELDS = ['name', 'contact_name', 'email', 'phone', 'address', 'status', 'plan', 'adelaide_id', 'va_number', 'go_live_on', 'notes'];
const MAX_BODY = 64 * 1024;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
});
const fail = (status, error) => json({ ok: false, error }, status);
const uuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || '');
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : v === null ? null : undefined);
const dollars = (n) => Math.round(Number(n) * 100) / 100;

async function body(request) {
  const text = await request.text();
  if (text.length > MAX_BODY) throw Object.assign(new Error('too_large'), { status: 413 });
  if (!text) return {};
  try { const v = JSON.parse(text); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  catch { throw Object.assign(new Error('bad_json'), { status: 400 }); }
}

// Only known client fields, cleaned. Status and plan are checked against the client's kind.
function clientPatch(input, kind) {
  const out = {};
  for (const f of CLIENT_FIELDS) {
    if (!(f in input)) continue;
    const v = str(input[f], f === 'notes' ? 4000 : 300);
    if (v === undefined) continue;
    out[f] = v === '' ? null : v;
  }
  if ('status' in out && !(kind === 'va' ? VA_STATUSES : PROJECT_CLIENT_STATUSES).includes(out.status)) throw Object.assign(new Error('bad_status'), { status: 400 });
  if ('plan' in out && out.plan !== null && !PLANS.includes(out.plan)) throw Object.assign(new Error('bad_plan'), { status: 400 });
  if ('go_live_on' in out && out.go_live_on && !/^\d{4}-\d{2}-\d{2}$/.test(out.go_live_on)) throw Object.assign(new Error('bad_date'), { status: 400 });
  if (out.name === null) throw Object.assign(new Error('name_required'), { status: 400 });
  return out;
}

// Line items: [{ description, amount }] in dollars. Negative amounts are discounts.
function cleanLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.slice(0, 40).map((l) => ({ description: str(l && l.description, 200) || '', amount: dollars(l && l.amount) }))
    .filter((l) => l.description && Number.isFinite(l.amount));
}
const linesTotal = (lines) => dollars(lines.reduce((a, l) => a + l.amount, 0));

function projectPatch(input) {
  const out = {};
  if ('title' in input) { out.title = str(input.title, 200); if (!out.title) throw Object.assign(new Error('title_required'), { status: 400 }); }
  if ('kind' in input) { if (!PROJECT_KINDS.includes(input.kind)) throw Object.assign(new Error('bad_kind'), { status: 400 }); out.kind = input.kind; }
  if ('status' in input) { if (!PROJECT_STATUSES.includes(input.status)) throw Object.assign(new Error('bad_status'), { status: 400 }); out.status = input.status; }
  if ('scope' in input) out.scope = str(input.scope, 8000) || null;
  if ('notes' in input) out.notes = str(input.notes, 4000) || null;
  if ('valid_until' in input) out.valid_until = /^\d{4}-\d{2}-\d{2}$/.test(input.valid_until || '') ? input.valid_until : null;
  if ('deposit_pct' in input) { const d = Number(input.deposit_pct); if (!Number.isInteger(d) || d < 0 || d > 100) throw Object.assign(new Error('bad_deposit'), { status: 400 }); out.deposit_pct = d; }
  if ('line_items' in input) { out.line_items = cleanLines(input.line_items); out.quote_total = linesTotal(out.line_items); }
  return out;
}

// ---- Handlers ---------------------------------------------------------------------------------------------------

async function overview(env) {
  const now = new Date();
  const monthStart = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000);
  const lastStart = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1) / 1000);
  const [clients, signups, leads, projects] = await Promise.all([
    select(env, 'clients', 'select=id,kind,name,status,plan,adelaide_id,stripe_customer_id,stripe_subscription_id'),
    select(env, 'va_signups', 'select=id&status=eq.new'),
    select(env, 'leads', 'select=id&status=eq.new'),
    select(env, 'projects', 'select=status,quote_total'),
  ]);
  const out = {
    pipeline: {
      newSignups: signups.length, newLeads: leads.length,
      projects: PROJECT_STATUSES.map((s) => ({ status: s, count: projects.filter((p) => p.status === s).length, value: dollars(projects.filter((p) => p.status === s).reduce((a, p) => a + Number(p.quote_total || 0), 0)) })),
      clients: { va: clients.filter((c) => c.kind === 'va').length, project: clients.filter((c) => c.kind === 'project').length },
    },
    revenue: null, unpaid: null, va: null, warnings: [],
  };
  if (env.STRIPE_SECRET_KEY) {
    try {
      const [paid, open] = await Promise.all([
        listInvoices(env, { status: 'paid', created: { gte: lastStart - 40 * 86400 } }),
        listInvoices(env, { status: 'open' }),
      ]);
      const paidAt = (i) => (i.status_transitions && i.status_transitions.paid_at) || i.created;
      const sum = (list) => dollars(list.reduce((a, i) => a + i.amount_paid / 100, 0));
      out.revenue = { thisMonth: sum(paid.data.filter((i) => paidAt(i) >= monthStart)), lastMonth: sum(paid.data.filter((i) => paidAt(i) >= lastStart && paidAt(i) < monthStart)) };
      const nowSec = Math.floor(Date.now() / 1000);
      out.unpaid = open.data.map((i) => ({ id: i.id, customer: i.customer_name || i.customer_email || i.customer, amount: i.amount_remaining / 100, due: i.due_date, daysLate: i.due_date && i.due_date < nowSec ? Math.floor((nowSec - i.due_date) / 86400) : 0, url: i.hosted_invoice_url }));
    } catch (e) { out.warnings.push(`Stripe: ${e.message}`); }
  } else out.warnings.push('Stripe is not connected yet (Settings).');
  const live = clients.filter((c) => c.kind === 'va' && c.status === 'live');
  if (env.ADELAIDE_BASE && env.ADELAIDE_ADMIN_KEY) {
    try {
      const rows = await adelaideBilling(env, monthKey());
      const byId = new Map(rows.map((r) => [r.id, r]));
      const perClient = live.map((c) => {
        const r = byId.get(c.adelaide_id);
        if (!r) return { name: c.name, minutes: null };
        const bill = Number(r.bill && r.bill.total) || 0;
        const cardFee = bill ? bill * 0.029 + 0.3 : 0;
        return { name: c.name, minutes: Math.round(r.minutes), bill: dollars(bill), projected: dollars(r.projected_total), profit: dollars((Number(r.your_profit) || 0) - 2 - cardFee) };
      });
      out.va = { live: live.length, minutes: perClient.reduce((a, r) => a + (r.minutes || 0), 0), clients: perClient };
    } catch (e) { out.warnings.push(`Adelaide backend: ${e.message}`); out.va = { live: live.length, clients: [] }; }
  } else out.va = { live: live.length, clients: [] };
  return out;
}

async function inbox(env) {
  const [signups, leads] = await Promise.all([
    select(env, 'va_signups', 'select=*&status=in.(new,contacted)&order=created_at.desc&limit=200'),
    select(env, 'leads', 'select=*&status=in.(new,contacted)&order=created_at.desc&limit=200'),
  ]);
  return { signups, leads };
}

async function convert(env, input) {
  const { type, id } = input;
  if (!uuid(id) || !['signup', 'lead'].includes(type)) throw Object.assign(new Error('bad_request'), { status: 400 });
  if (type === 'signup') {
    const s = await one(env, 'va_signups', id);
    if (!s) throw Object.assign(new Error('not_found'), { status: 404 });
    const client = await insert(env, 'clients', {
      kind: 'va', name: s.restaurant, contact_name: s.owner_name, email: s.email, phone: s.mobile, address: s.address,
      status: s.status === 'paid' ? 'paid' : 'new', plan: s.plan, source_signup_id: s.id,
      notes: [s.assistant_name && `Assistant name: ${s.assistant_name}`, `Answer mode: ${s.answer_mode === 'missed' ? 'missed calls only' : 'all calls'}`, s.notes].filter(Boolean).join('\n'),
    });
    await update(env, 'va_signups', `id=eq.${id}`, { status: 'converted' });
    await logActivity(env, client.id, 'status', 'Created from a Virtual Assistant sign-up.');
    return client;
  }
  const l = await one(env, 'leads', id);
  if (!l) throw Object.assign(new Error('not_found'), { status: 404 });
  const client = await insert(env, 'clients', {
    kind: 'project', name: l.org_name || l.name, contact_name: l.name, email: l.email, phone: l.phone, status: 'prospect', source_lead_id: l.id,
    notes: [l.kind === 'mockup' ? 'Came in through the free mockup form.' : 'Came in through Start a Project.', l.needs && l.needs.length ? `Needs: ${l.needs.join(', ')}` : '', l.timeline && `Timeline: ${l.timeline}`, l.budget && `Budget: ${l.budget}`, l.message].filter(Boolean).join('\n'),
  });
  await update(env, 'leads', `id=eq.${id}`, { status: 'won' });
  await logActivity(env, client.id, 'status', 'Created from a website lead.');
  return client;
}

async function inboxStatus(env, input) {
  const { type, id, status } = input;
  if (!uuid(id)) throw Object.assign(new Error('bad_request'), { status: 400 });
  if (type === 'signup' && ['contacted', 'lost', 'new'].includes(status)) return update(env, 'va_signups', `id=eq.${id}`, { status });
  if (type === 'lead' && ['contacted', 'lost', 'new'].includes(status)) return update(env, 'leads', `id=eq.${id}`, { status });
  throw Object.assign(new Error('bad_request'), { status: 400 });
}

async function clientDetail(env, id) {
  const client = await one(env, 'clients', id);
  if (!client) throw Object.assign(new Error('not_found'), { status: 404 });
  const [projects, activity] = await Promise.all([
    select(env, 'projects', `select=*&client_id=eq.${id}&order=created_at.desc`),
    select(env, 'activity', `select=*&client_id=eq.${id}&order=at.desc&limit=100`),
  ]);
  const out = { client, projects, activity, invoices: [], usage: null, warnings: [] };
  if (client.stripe_customer_id && env.STRIPE_SECRET_KEY) {
    try {
      const inv = await listInvoices(env, { customer: client.stripe_customer_id, limit: 30 });
      out.invoices = inv.data.map((i) => ({ id: i.id, number: i.number, status: i.status, total: i.total / 100, due: i.amount_remaining / 100, created: i.created, url: i.hosted_invoice_url, pdf: i.invoice_pdf }));
    } catch (e) { out.warnings.push(`Stripe: ${e.message}`); }
  }
  if (client.kind === 'va' && client.adelaide_id && env.ADELAIDE_BASE && env.ADELAIDE_ADMIN_KEY) {
    try {
      const r = (await adelaideBilling(env, monthKey())).find((x) => x.id === client.adelaide_id);
      out.usage = r ? { calls: r.calls, minutes: Math.round(r.minutes), bill: dollars(r.bill && r.bill.total), projected: dollars(r.projected_total) } : null;
    } catch (e) { out.warnings.push(`Adelaide backend: ${e.message}`); }
  }
  return out;
}

async function clientAction(env, id, action, input) {
  const client = await one(env, 'clients', id);
  if (!client) throw Object.assign(new Error('not_found'), { status: 404 });
  const needCustomer = () => { if (!client.stripe_customer_id) throw Object.assign(new Error('Create the client in Stripe first.'), { status: 400 }); };
  switch (action) {
    case 'note': {
      const text = str(input.text, 2000);
      if (!text) throw Object.assign(new Error('empty_note'), { status: 400 });
      await logActivity(env, id, 'note', text);
      return { ok: true };
    }
    case 'stripe-customer': {
      if (client.stripe_customer_id) return client;
      const c = await createCustomer(env, client);
      await logActivity(env, id, 'status', 'Created in Stripe.');
      return update(env, 'clients', `id=eq.${id}`, { stripe_customer_id: c.id });
    }
    case 'setup-invoice': {
      needCustomer();
      const inv = await sendSetupInvoice(env, client.stripe_customer_id, id);
      await logActivity(env, id, 'invoice', `Setup-fee invoice ${inv.number || inv.id} sent ($499).`);
      return { ok: true, invoice: inv.hosted_invoice_url };
    }
    case 'go-live': {
      needCustomer();
      const plan = input.plan || client.plan;
      if (!PLANS.includes(plan)) throw Object.assign(new Error('Choose a plan first.'), { status: 400 });
      if (client.stripe_subscription_id) throw Object.assign(new Error('This client already has a subscription.'), { status: 400 });
      const sub = await startSubscription(env, client.stripe_customer_id, plan);
      await logActivity(env, id, 'status', `Went live on the ${plan} plan. Billing on the 1st of each month.`);
      return update(env, 'clients', `id=eq.${id}`, { stripe_subscription_id: sub.id, plan, status: 'live', go_live_on: new Date().toISOString().slice(0, 10) });
    }
    case 'plan': {
      if (!PLANS.includes(input.plan)) throw Object.assign(new Error('bad_plan'), { status: 400 });
      if (client.stripe_subscription_id) await changePlan(env, client.stripe_subscription_id, input.plan);
      await logActivity(env, id, 'status', `Plan changed to ${input.plan}.`);
      return update(env, 'clients', `id=eq.${id}`, { plan: input.plan });
    }
    case 'pause': case 'resume': case 'cancel': {
      if (client.stripe_subscription_id) {
        if (action === 'pause') await pauseSubscription(env, client.stripe_subscription_id);
        if (action === 'resume') await resumeSubscription(env, client.stripe_subscription_id);
        if (action === 'cancel') await cancelSubscription(env, client.stripe_subscription_id);
      }
      const status = { pause: 'paused', resume: 'live', cancel: 'cancelled' }[action];
      await logActivity(env, id, 'status', `Subscription ${status}.`);
      return update(env, 'clients', `id=eq.${id}`, { status });
    }
    case 'invoice': {
      needCustomer();
      const lines = cleanLines(input.lines);
      if (!lines.length || linesTotal(lines) <= 0) throw Object.assign(new Error('Add at least one line with a positive total.'), { status: 400 });
      const inv = await sendInvoice(env, client.stripe_customer_id, lines, { memo: str(input.memo, 300) });
      await logActivity(env, id, 'invoice', `Invoice ${inv.number || inv.id} sent ($${linesTotal(lines).toFixed(2)}).`);
      return { ok: true, invoice: inv.hosted_invoice_url };
    }
    default: throw Object.assign(new Error('not_found'), { status: 404 });
  }
}

async function projectDeposit(env, id) {
  const project = await one(env, 'projects', id);
  if (!project) throw Object.assign(new Error('not_found'), { status: 404 });
  const client = await one(env, 'clients', project.client_id);
  if (!client.stripe_customer_id) throw Object.assign(new Error('Create the client in Stripe first.'), { status: 400 });
  const pct = Number.isInteger(project.deposit_pct) ? project.deposit_pct : 40;
  const amount = dollars(Number(project.quote_total || 0) * pct / 100);
  if (!(amount > 0)) throw Object.assign(new Error('The proposal total is zero.'), { status: 400 });
  const inv = await sendInvoice(env, client.stripe_customer_id, [{ description: `${project.title}: ${pct}% deposit`, amount }], { key: `ctsd-deposit-${id}` });
  await logActivity(env, client.id, 'invoice', `Deposit invoice for "${project.title}" sent ($${amount.toFixed(2)}).`);
  if (!project.status || project.status === 'quoted') await update(env, 'projects', `id=eq.${id}`, { status: 'active' });
  return { ok: true, invoice: inv.hosted_invoice_url, amount };
}

async function billing(env, month) {
  const m = /^\d{4}-\d{2}$/.test(month || '') ? month : monthKey();
  const [clients, reports] = await Promise.all([
    select(env, 'clients', 'select=*&kind=eq.va&status=in.(live,paused)'),
    select(env, 'usage_reports', `select=*&month=eq.${m}`),
  ]);
  let rows = [], warning = null;
  try { rows = await adelaideBilling(env, m); } catch (e) { warning = `Adelaide backend: ${e.message}`; }
  const byId = new Map(rows.map((r) => [r.id, r]));
  const rep = new Map(reports.map((r) => [r.client_id, r.minutes_reported]));
  const out = await Promise.all(clients.map(async (c) => {
    const r = byId.get(c.adelaide_id);
    const minutes = r ? Math.round(Number(r.minutes) || 0) : null;
    const ours = minutes === null || !c.plan ? null : dollars(planCost(c.plan, Number(r.minutes) || 0));
    const theirs = r ? dollars(r.bill && r.bill.total) : null;
    let upcoming = null;
    if (c.stripe_subscription_id && env.STRIPE_SECRET_KEY && m === monthKey()) {
      try { upcoming = (await upcomingInvoice(env, c.stripe_customer_id, c.stripe_subscription_id)).amount_due / 100; } catch { upcoming = null; }
    }
    const reported = rep.get(c.id) || 0;
    const issues = [];
    if (!c.adelaide_id) issues.push('No Adelaide id');
    else if (!r) issues.push('Not in the Adelaide backend');
    if (ours !== null && theirs !== null && Math.abs(ours - theirs) > 1) issues.push(`Plan mismatch: CTSD $${ours} vs backend $${theirs}`);
    if (minutes !== null && minutes - reported > 30) issues.push(`${minutes - reported} minutes not yet reported`);
    if (!c.stripe_subscription_id) issues.push('No Stripe subscription');
    return { id: c.id, name: c.name, plan: c.plan, status: c.status, minutes, reported, bill: ours, backendBill: theirs, upcoming, issues };
  }));
  return { month: m, rows: out, warning };
}

async function settings(env) {
  const out = { stripe: { connected: !!env.STRIPE_SECRET_KEY, meter: null, prices: [], webhook: !!env.STRIPE_WEBHOOK_SECRET }, adelaide: { configured: !!(env.ADELAIDE_BASE && env.ADELAIDE_ADMIN_KEY), ok: null }, access: { team: env.ACCESS_TEAM || null } };
  if (env.STRIPE_SECRET_KEY) {
    try { const [meter, prices] = await Promise.all([findMeter(env), pricesByKey(env)]); out.stripe.meter = meter && meter.id; out.stripe.prices = Object.keys(prices); out.stripe.mode = env.STRIPE_SECRET_KEY.startsWith('sk_live') || env.STRIPE_SECRET_KEY.startsWith('rk_live') ? 'live' : 'test'; }
    catch (e) { out.stripe.error = e.message; }
  }
  if (env.ADELAIDE_BASE) {
    try { const r = await fetch(`${String(env.ADELAIDE_BASE).replace(/\/+$/, '')}/health`, { signal: AbortSignal.timeout(8000) }); out.adelaide.ok = r.ok; } catch { out.adelaide.ok = false; }
  }
  return out;
}

// ---- Router -------------------------------------------------------------------------------------------------------

async function api(request, env, ctx, url) {
  const p = url.pathname.replace(/^\/api\/admin/, '') || '/';
  const m = request.method;
  let seg;
  if (m === 'GET' && p === '/me') return { email: request.ctsdAdmin };
  if (m === 'GET' && p === '/overview') return overview(env);
  if (m === 'GET' && p === '/inbox') return inbox(env);
  if (m === 'POST' && p === '/inbox/convert') return convert(env, await body(request));
  if (m === 'POST' && p === '/inbox/status') return inboxStatus(env, await body(request));
  if (m === 'GET' && p === '/file') {
    const bucket = url.searchParams.get('bucket'), path = url.searchParams.get('path') || '';
    if (!['va-menus', 'lead-uploads'].includes(bucket) || !/^[0-9a-f-]{36}-[a-zA-Z0-9._-]{1,100}$/.test(path)) throw Object.assign(new Error('bad_request'), { status: 400 });
    return { url: await signedDownload(env, bucket, path) };
  }
  if (m === 'GET' && p === '/clients') {
    const kind = url.searchParams.get('kind');
    return select(env, 'clients', `select=*&order=created_at.desc${['va', 'project'].includes(kind) ? `&kind=eq.${kind}` : ''}`);
  }
  if (m === 'POST' && p === '/clients') {
    const input = await body(request);
    const kind = input.kind === 'va' ? 'va' : 'project';
    const row = { kind, status: kind === 'va' ? 'new' : 'prospect', ...clientPatch(input, kind) };
    if (!row.name) throw Object.assign(new Error('name_required'), { status: 400 });
    const client = await insert(env, 'clients', row);
    await logActivity(env, client.id, 'status', 'Client added.');
    return client;
  }
  if ((seg = p.match(/^\/clients\/([0-9a-f-]{36})$/i))) {
    if (m === 'GET') return clientDetail(env, seg[1]);
    if (m === 'PATCH') {
      const client = await one(env, 'clients', seg[1]);
      if (!client) throw Object.assign(new Error('not_found'), { status: 404 });
      const patch = clientPatch(await body(request), client.kind);
      if (patch.status && patch.status !== client.status) await logActivity(env, client.id, 'status', `Status: ${client.status} → ${patch.status}.`);
      return update(env, 'clients', `id=eq.${seg[1]}`, patch);
    }
  }
  if (m === 'POST' && (seg = p.match(/^\/clients\/([0-9a-f-]{36})\/([a-z-]+)$/i))) return clientAction(env, seg[1], seg[2], await body(request));
  if (m === 'POST' && p === '/projects') {
    const input = await body(request);
    if (!uuid(input.client_id)) throw Object.assign(new Error('bad_client'), { status: 400 });
    const project = await insert(env, 'projects', { client_id: input.client_id, title: 'New project', ...projectPatch(input) });
    await logActivity(env, input.client_id, 'note', `Project "${project.title}" created.`);
    return project;
  }
  if ((seg = p.match(/^\/projects\/([0-9a-f-]{36})$/i))) {
    if (m === 'GET') {
      const project = await one(env, 'projects', seg[1]);
      if (!project) throw Object.assign(new Error('not_found'), { status: 404 });
      return { project, client: await one(env, 'clients', project.client_id) };
    }
    if (m === 'PATCH') return update(env, 'projects', `id=eq.${seg[1]}`, projectPatch(await body(request)));
  }
  if (m === 'POST' && (seg = p.match(/^\/projects\/([0-9a-f-]{36})\/deposit$/i))) return projectDeposit(env, seg[1]);
  if (m === 'GET' && p === '/billing') return billing(env, url.searchParams.get('month'));
  if (m === 'POST' && p === '/billing/report') return { results: await reportUsage(env) };
  if (m === 'GET' && p === '/settings') return settings(env);
  if (m === 'POST' && p === '/stripe/setup') return setupCatalogue(env);
  throw Object.assign(new Error('not_found'), { status: 404 });
}

export const adminRoute = {
  method: '*',
  test: (url) => url.pathname === '/admin' || url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/admin/'),
  async handle(request, env, ctx, url) {
    const gate = await verifyAccess(request, env);
    const isApi = url.pathname.startsWith('/api/admin/');
    if (!gate.ok) {
      console.warn(`[admin] denied: ${gate.reason}`);
      return isApi ? fail(403, 'forbidden') : new Response('Forbidden', { status: 403, headers: { 'content-type': 'text/plain', 'x-robots-tag': 'noindex, nofollow' } });
    }
    if (!isApi) {
      // The admin pages are static files; Access has already checked who you are.
      const res = await env.ASSETS.fetch(request);
      const h = new Headers(res.headers);
      h.set('x-robots-tag', 'noindex, nofollow');
      h.set('cache-control', 'no-store');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }
    try {
      request.ctsdAdmin = gate.email;
      return json(await api(request, env, ctx, url));
    } catch (e) {
      if (e instanceof StripeError) return fail(e.status >= 500 ? 502 : 400, e.message);
      if (e instanceof DbError) { console.error(e.message); return fail(502, 'The database did not answer. Check Settings.'); }
      if (e.status) return fail(e.status, e.message);
      console.error(`[admin] ${e && e.stack}`);
      return fail(500, 'server');
    }
  },
};
