// CTSD back office: a small hash-routed app over /api/admin. Every value from the server is escaped.
const main = document.getElementById('main');
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const date = (v) => { if (!v) return '—'; const ymd = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); const d = ymd ? new Date(+ymd[1], +ymd[2] - 1, +ymd[3]) : typeof v === 'number' ? new Date(v * 1000) : new Date(v); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const pill = (s) => `<span class="pill ${esc(s)}">${esc(s)}</span>`;
const PLAN_NAMES = { monthly: 'Monthly · $497', payg: 'Pay as you go · $149 + $0.40/min', cap: 'Cap · $149 + $0.45/min, max $649' };

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/admin${path}`, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

let toastTimer;
function toast(text, error = false) {
  const t = document.getElementById('toast');
  t.textContent = text; t.classList.toggle('is-error', error); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 5000);
}

// Runs an action from a button: disables it, reports the result, re-renders the page.
async function act(btn, fn, done) {
  if (btn.disabled) return;
  btn.disabled = true;
  try { const r = await fn(); if (done) toast(typeof done === 'function' ? done(r) : done); await render(); }
  catch (e) { toast(e.message, true); }
  finally { btn.disabled = false; }
}

const warnings = (list) => (list && list.length ? list.map((w) => `<p class="warn">${esc(w)}</p>`).join('') : '');

/* ---- Overview ------------------------------------------------------------------------------------------------ */
async function overview() {
  const d = await api('/overview');
  const va = d.va || { live: 0, clients: [] };
  const profit = va.clients.reduce((a, c) => a + (c.profit || 0), 0);
  return `<div class="head"><div><h1>Overview</h1><p class="muted">${date(new Date())}</p></div></div>
  ${warnings(d.warnings)}
  <div class="cards">
    <div class="card"><div class="stat">${d.revenue ? money(d.revenue.thisMonth) : '—'}<small>Collected this month</small></div></div>
    <div class="card"><div class="stat">${d.revenue ? money(d.revenue.lastMonth) : '—'}<small>Collected last month</small></div></div>
    <div class="card"><div class="stat">${d.unpaid ? money(d.unpaid.reduce((a, i) => a + i.amount, 0)) : '—'}<small>${d.unpaid ? d.unpaid.length : 0} unpaid invoices</small></div></div>
    <div class="card"><div class="stat">${va.live}<small>Live restaurants · ${(va.minutes || 0).toLocaleString()} minutes this month</small></div></div>
    <div class="card"><div class="stat">${d.pipeline.newSignups + d.pipeline.newLeads}<small><a href="#/inbox">${d.pipeline.newSignups} sign-ups, ${d.pipeline.newLeads} leads waiting</a></small></div></div>
  </div>
  <div class="grid2">
    <section class="card"><h2>Unpaid invoices</h2>${d.unpaid && d.unpaid.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Customer</th><th class="num">Amount</th><th>Due</th><th></th></tr></thead><tbody>${d.unpaid.map((i) => `<tr${i.daysLate ? ' class="is-issue"' : ''}><td>${esc(i.customer)}</td><td class="num">${money(i.amount)}</td><td>${i.daysLate ? `${i.daysLate} days late` : date(i.due)}</td><td>${i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">Open</a>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nothing unpaid.</p>'}</section>
    <section class="card"><h2>Virtual Assistant this month</h2>${va.clients.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Restaurant</th><th class="num">Minutes</th><th class="num">Bill so far</th><th class="num">Projected</th><th class="num">Profit</th></tr></thead><tbody>${va.clients.map((c) => `<tr><td>${esc(c.name)}</td><td class="num">${c.minutes ?? '—'}</td><td class="num">${money(c.bill)}</td><td class="num">${money(c.projected)}</td><td class="num">${money(c.profit)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td></td><td></td><td></td><td class="num"><b>${money(profit)}</b></td></tr></tbody></table></div><p class="muted">Profit is after phone minutes, $2 per number and Stripe's 2.9% + 30¢.</p>` : '<p class="muted">No live restaurants yet.</p>'}</section>
  </div>
  <section class="card"><h2>Projects</h2><div class="cards" style="margin:0">${d.pipeline.projects.map((p) => `<div><div class="stat">${p.count}<small>${esc(p.status)} · ${money(p.value)}</small></div></div>`).join('')}</div></section>`;
}

/* ---- Inbox ------------------------------------------------------------------------------------------------------- */
async function inbox() {
  const d = await api('/inbox');
  setCount(d.signups.filter((s) => s.status === 'new').length + d.leads.filter((l) => l.status === 'new').length);
  const fileLink = (bucket, path, label) => (path ? `<button class="btn ghost" data-file="${esc(bucket)}|${esc(path)}">${label}</button>` : '');
  const signups = d.signups.map((s) => `<tr><td>${date(s.created_at)}</td><td><b>${esc(s.restaurant)}</b><br><span class="muted">${esc(s.owner_name)} · ${esc(s.email)} · ${esc(s.mobile)}</span>
    <details class="more"><summary>All answers</summary><dl class="kv">${[['Address', s.address], ['Customers call', s.current_phone], ['Transfer to', s.transfer_phone], ['Plan', PLAN_NAMES[s.plan] || s.plan], ['Answers', s.answer_mode === 'missed' ? 'Missed calls only' : 'All calls'], ['Reservations', s.reservations ? `Yes${s.booking_system ? ` · ${s.booking_system}` : ''}${s.party_max ? ` · up to ${s.party_max}` : ''}` : 'No'], ['Pickup', s.pickup ? `Yes · ${s.ready_time || ''}` : 'No'], ['Hours', s.hours ? Object.entries(s.hours).map(([k, v]) => `${k}: ${v}`).join('\n') : ''], ['Menu link', s.menu_link], ['Assistant name', s.assistant_name], ['Notes', s.notes]].filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${fileLink('va-menus', s.menu_path, 'Download menu')}</details></td>
    <td>${pill(s.status)}</td><td><div class="actions"><button class="btn" data-convert="signup|${s.id}">Make client</button><button class="btn ghost" data-status="signup|${s.id}|contacted">Contacted</button><button class="btn ghost" data-status="signup|${s.id}|lost">Lost</button></div></td></tr>`).join('');
  const leads = d.leads.map((l) => `<tr><td>${date(l.created_at)}</td><td><b>${esc(l.org_name || l.name)}</b><br><span class="muted">${esc(l.kind === 'mockup' ? 'Free mockup' : 'Start a Project')} · ${esc(l.name)} · ${esc(l.email)}${l.phone ? ` · ${esc(l.phone)}` : ''}</span>
    <details class="more"><summary>All answers</summary><dl class="kv">${[['Type', l.org_type], ['Needs', (l.needs || []).join(', ')], ['Website', l.website], ['Tools', l.tools], ['Timeline', l.timeline], ['Budget', l.budget], ['Style', l.style], ['Design', l.design_slug], ['Message', l.message]].filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${fileLink('lead-uploads', l.logo_path, 'Download logo')}</details></td>
    <td>${pill(l.status)}</td><td><div class="actions"><button class="btn" data-convert="lead|${l.id}">Make client</button><button class="btn ghost" data-status="lead|${l.id}|contacted">Contacted</button><button class="btn ghost" data-status="lead|${l.id}|lost">Lost</button></div></td></tr>`).join('');
  return `<div class="head"><div><h1>Inbox</h1><p class="muted">New Virtual Assistant sign-ups and website leads.</p></div></div>
  <section class="card" style="margin-bottom:14px"><h2>Virtual Assistant sign-ups (${d.signups.length})</h2>${signups ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Date</th><th>Restaurant</th><th>Status</th><th></th></tr></thead><tbody>${signups}</tbody></table></div>` : '<p class="muted">None waiting.</p>'}</section>
  <section class="card"><h2>Website leads (${d.leads.length})</h2>${leads ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Date</th><th>Organization</th><th>Status</th><th></th></tr></thead><tbody>${leads}</tbody></table></div>` : '<p class="muted">None waiting.</p>'}</section>`;
}

/* ---- Clients ----------------------------------------------------------------------------------------------------- */
let clientFilter = 'all';
async function clients() {
  const list = await api('/clients');
  const shown = list.filter((c) => clientFilter === 'all' || c.kind === clientFilter);
  return `<div class="head"><div><h1>Clients</h1><p class="muted">${list.length} clients</p></div><button class="btn ember" id="new-client-toggle">New client</button></div>
  <form class="card stack" id="new-client" hidden><h2>New client</h2><div class="fields">
    <label class="f">Name<input name="name" required></label>
    <label class="f">Kind<select name="kind"><option value="project">Website or app</option><option value="va">Virtual Assistant</option></select></label>
    <label class="f">Contact<input name="contact_name"></label><label class="f">Email<input name="email" type="email"></label><label class="f">Phone<input name="phone"></label></div>
    <div class="actions"><button class="btn" type="submit">Add client</button></div></form>
  <div class="tabs" role="group" aria-label="Filter">${[['all', 'All'], ['va', 'Virtual Assistant'], ['project', 'Websites and apps']].map(([k, l]) => `<button type="button" data-filter="${k}" aria-pressed="${clientFilter === k}">${l}</button>`).join('')}</div>
  <section class="card">${shown.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Client</th><th>Kind</th><th>Status</th><th>Plan</th><th>Added</th></tr></thead><tbody>${shown.map((c) => `<tr><td><a href="#/clients/${c.id}"><b>${esc(c.name)}</b></a><br><span class="muted">${esc(c.contact_name || '')} ${esc(c.email || '')}</span></td><td>${c.kind === 'va' ? 'Virtual Assistant' : 'Website / app'}</td><td>${pill(c.status)}</td><td>${c.plan ? esc(c.plan) : '—'}</td><td>${date(c.created_at)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No clients yet. Turn a lead into a client from the Inbox, or add one here.</p>'}</section>`;
}

async function clientPage(id) {
  const d = await api(`/clients/${id}`);
  const c = d.client;
  const va = c.kind === 'va';
  const statuses = va ? ['new', 'paid', 'onboarding', 'live', 'paused', 'cancelled'] : ['prospect', 'active', 'done', 'lost'];
  const vaActions = va ? `<div class="actions">
      ${!c.stripe_customer_id ? '<button class="btn" data-act="stripe-customer">Create in Stripe</button>' : ''}
      ${c.stripe_customer_id ? '<button class="btn ghost" data-act="setup-invoice">Send $499 setup invoice</button>' : ''}
      ${c.stripe_customer_id && !c.stripe_subscription_id ? '<button class="btn ember" data-act="go-live">Go live (start plan)</button>' : ''}
      ${c.stripe_subscription_id && c.status === 'live' ? '<button class="btn ghost" data-act="pause">Pause</button>' : ''}
      ${c.stripe_subscription_id && c.status === 'paused' ? '<button class="btn ghost" data-act="resume">Resume</button>' : ''}
      ${c.stripe_subscription_id && c.status !== 'cancelled' ? '<button class="btn danger" data-act="cancel">Cancel plan</button>' : ''}
    </div>` : `<div class="actions">${!c.stripe_customer_id ? '<button class="btn" data-act="stripe-customer">Create in Stripe</button>' : ''}<button class="btn ember" id="new-project">New project / proposal</button></div>`;
  return `<div class="head"><div><p class="muted"><a href="#/clients">Clients</a></p><h1>${esc(c.name)}</h1><p>${pill(c.status)} <span class="muted">${va ? 'Virtual Assistant' : 'Website / app'}${c.stripe_customer_id ? ' · in Stripe' : ''}</span></p></div>${vaActions}</div>
  ${warnings(d.warnings)}
  <div class="grid2">
    <form class="card stack" id="client-form"><h2>Details</h2><div class="fields">
      <label class="f">Name<input name="name" value="${esc(c.name)}" required></label>
      <label class="f">Status<select name="status">${statuses.map((s) => `<option${s === c.status ? ' selected' : ''}>${s}</option>`).join('')}</select></label>
      <label class="f">Contact<input name="contact_name" value="${esc(c.contact_name)}"></label>
      <label class="f">Email<input name="email" type="email" value="${esc(c.email)}"></label>
      <label class="f">Phone<input name="phone" value="${esc(c.phone)}"></label>
      <label class="f">Address<input name="address" value="${esc(c.address)}"></label>
      ${va ? `<label class="f">Plan<select name="plan">${['monthly', 'payg', 'cap'].map((p) => `<option value="${p}"${p === c.plan ? ' selected' : ''}>${PLAN_NAMES[p]}</option>`).join('')}</select></label>
      <label class="f">Adelaide id<input name="adelaide_id" value="${esc(c.adelaide_id)}" placeholder="e.g. mango-ember"></label>
      <label class="f">Assistant number<input name="va_number" value="${esc(c.va_number)}"></label>` : ''}
    </div><label class="f">Notes<textarea name="notes">${esc(c.notes)}</textarea></label>
    <div class="actions"><button class="btn" type="submit">Save</button>${va && c.stripe_subscription_id ? '<span class="muted">Changing the plan here also changes it in Stripe.</span>' : ''}</div></form>
    <div class="stack">
      ${va ? `<section class="card"><h2>This month</h2>${d.usage ? `<div class="cards" style="margin:0"><div><div class="stat">${d.usage.minutes}<small>minutes · ${d.usage.calls} calls</small></div></div><div><div class="stat">${money(d.usage.bill)}<small>bill so far</small></div></div><div><div class="stat">${money(d.usage.projected)}<small>projected</small></div></div></div>` : `<p class="muted">${c.adelaide_id ? 'No usage found for this Adelaide id yet.' : 'Add the Adelaide id to see minutes.'}</p>`}</section>` : ''}
      <section class="card"><h2>Invoices</h2>${d.invoices.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Number</th><th>Status</th><th class="num">Total</th><th>Date</th><th></th></tr></thead><tbody>${d.invoices.map((i) => `<tr><td>${esc(i.number || i.id)}</td><td>${pill(i.status)}</td><td class="num">${money(i.total)}</td><td>${date(i.created)}</td><td>${i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">View</a>` : ''} ${i.pdf ? `<a href="${esc(i.pdf)}" target="_blank" rel="noopener">PDF</a>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No invoices yet.</p>'}
        ${c.stripe_customer_id ? `<details class="more"><summary>Send a one-off invoice</summary><form class="stack" id="invoice-form" style="margin-top:10px"><div class="fields"><label class="f">Description<input name="description" required></label><label class="f">Amount ($)<input name="amount" type="number" step="0.01" min="0.5" required></label></div><div class="actions"><button class="btn" type="submit">Send invoice from Stripe</button></div></form></details>` : ''}</section>
    </div>
  </div>
  ${!va || d.projects.length ? `<section class="card" style="margin-bottom:14px"><h2>Projects and proposals</h2>${d.projects.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Project</th><th>Status</th><th class="num">Total</th><th>Created</th></tr></thead><tbody>${d.projects.map((p) => `<tr><td><a href="#/projects/${p.id}"><b>${esc(p.title)}</b></a></td><td>${pill(p.status)}</td><td class="num">${money(p.quote_total)}</td><td>${date(p.created_at)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No projects yet.</p>'}</section>` : ''}
  <section class="card"><h2>Activity</h2><form class="actions" id="note-form" style="margin-bottom:12px"><input name="text" placeholder="Add a note" aria-label="Note" style="flex:1;min-width:200px"><button class="btn ghost" type="submit">Add note</button></form>
    ${d.activity.length ? `<ul class="timeline">${d.activity.map((a) => `<li><time>${date(a.at)}</time><span>${esc(a.text)}</span></li>`).join('')}</ul>` : '<p class="muted">Nothing yet.</p>'}</section>`;
}

/* ---- Projects and proposals ---------------------------------------------------------------------------------------- */
async function projectPage(id) {
  const { project: p, client: c } = await api(`/projects/${id}`);
  const lines = p.line_items && p.line_items.length ? p.line_items : [{ description: '', amount: '' }];
  const row = (l) => `<tr><td><input name="ld" value="${esc(l.description)}" aria-label="Line description"></td><td style="width:160px"><input name="la" type="number" step="0.01" value="${esc(l.amount)}" aria-label="Amount in dollars"></td><td style="width:44px"><button type="button" class="btn ghost" data-remove-line aria-label="Remove line">×</button></td></tr>`;
  return `<div class="head"><div><p class="muted"><a href="#/clients/${c.id}">${esc(c.name)}</a></p><h1>${esc(p.title)}</h1><p>${pill(p.status)} <span class="muted">Total ${money(p.quote_total)} · deposit ${p.deposit_pct}% = ${money(p.quote_total * p.deposit_pct / 100)}</span></p></div>
    <div class="actions"><a class="btn ghost" href="/admin/proposal.html?id=${p.id}" target="_blank" rel="noopener">Proposal (PDF)</a><button class="btn ember" id="deposit">Invoice the deposit</button></div></div>
  <form class="card stack" id="project-form">
    <div class="fields">
      <label class="f">Title<input name="title" value="${esc(p.title)}" required></label>
      <label class="f">Kind<select name="kind">${['website', 'app', 'portal', 'crm', 'integration', 'other'].map((k) => `<option${k === p.kind ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
      <label class="f">Status<select name="status">${['quoted', 'active', 'delivered', 'closed'].map((k) => `<option${k === p.status ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
      <label class="f">Deposit %<input name="deposit_pct" type="number" min="0" max="100" value="${esc(p.deposit_pct)}"></label>
      <label class="f">Valid until<input name="valid_until" type="date" value="${esc(p.valid_until || '')}"></label>
    </div>
    <label class="f">Scope (shown on the proposal)<textarea name="scope" rows="7">${esc(p.scope)}</textarea></label>
    <div><h2 style="margin-bottom:8px">Line items</h2><p class="muted" style="margin:0 0 8px">Use a negative amount for a discount, e.g. "Launch offer (50%)" −1,750.</p>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table class="lines"><thead><tr><th>Description</th><th>Amount ($)</th><th></th></tr></thead><tbody id="lines">${lines.map(row).join('')}</tbody></table></div>
      <div class="actions" style="margin-top:8px"><button type="button" class="btn ghost" id="add-line">Add line</button><button type="button" class="btn ghost" id="add-offer">Add 50% launch offer</button></div></div>
    <label class="f">Internal notes (not on the proposal)<textarea name="notes">${esc(p.notes)}</textarea></label>
    <div class="actions"><button class="btn" type="submit">Save</button></div>
  </form>
  <template id="line-row">${row({ description: '', amount: '' })}</template>`;
}

/* ---- Billing ------------------------------------------------------------------------------------------------------- */
async function billingPage() {
  const d = await api('/billing');
  return `<div class="head"><div><h1>Billing</h1><p class="muted">${esc(d.month)} · Stripe invoices every restaurant on the 1st. Minutes are sent every hour.</p></div><button class="btn" id="report-now">Report usage now</button></div>
  ${d.warning ? `<p class="warn">${esc(d.warning)}</p>` : ''}
  <section class="card">${d.rows.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr><th>Restaurant</th><th>Plan</th><th class="num">Minutes</th><th class="num">Sent to Stripe</th><th class="num">Bill (CTSD)</th><th class="num">Bill (backend)</th><th class="num">Stripe upcoming</th><th>Check</th></tr></thead><tbody>${d.rows.map((r) => `<tr${r.issues.length ? ' class="is-issue"' : ''}><td><a href="#/clients/${r.id}">${esc(r.name)}</a></td><td>${esc(r.plan || '—')}</td><td class="num">${r.minutes ?? '—'}</td><td class="num">${r.reported}</td><td class="num">${money(r.bill)}</td><td class="num">${money(r.backendBill)}</td><td class="num">${money(r.upcoming)}</td><td>${r.issues.length ? esc(r.issues.join('; ')) : '✓'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No live restaurants yet.</p>'}</section>`;
}

/* ---- Settings ------------------------------------------------------------------------------------------------------ */
async function settingsPage() {
  const d = await api('/settings');
  const yes = (b) => (b ? '<span class="pill live">Connected</span>' : '<span class="pill new">Not set</span>');
  return `<div class="head"><div><h1>Settings</h1><p class="muted">Keys are set in Cloudflare (docs/back-office-setup.md). They are never shown here.</p></div></div>
  <div class="grid2">
    <section class="card stack"><h2>Stripe</h2><dl class="kv"><dt>Secret key</dt><dd>${yes(d.stripe.connected)} ${d.stripe.mode ? pill(d.stripe.mode) : ''}</dd><dt>Webhook secret</dt><dd>${yes(d.stripe.webhook)}</dd><dt>Minutes meter</dt><dd>${d.stripe.meter ? esc(d.stripe.meter) : '—'}</dd><dt>Prices</dt><dd>${d.stripe.prices.length ? `${d.stripe.prices.length} of 7: ${esc(d.stripe.prices.join(', '))}` : 'None yet'}</dd></dl>${d.stripe.error ? `<p class="warn">${esc(d.stripe.error)}</p>` : ''}
      <div class="actions"><button class="btn ember" id="stripe-setup"${d.stripe.connected ? '' : ' disabled'}>Set up Stripe plans and prices</button></div><p class="muted">Creates the minutes meter, the three Virtual Assistant plans and the $499 setup price. Safe to run more than once.</p></section>
    <section class="card"><h2>Adelaide backend</h2><dl class="kv"><dt>Connection</dt><dd>${d.adelaide.configured ? (d.adelaide.ok ? '<span class="pill live">Answering</span>' : '<span class="pill cancelled">Not answering</span>') : '<span class="pill new">Not set</span>'}</dd></dl></section>
    <section class="card"><h2>Sign-in</h2><dl class="kv"><dt>Cloudflare Access team</dt><dd>${esc(d.access.team || 'Local development')}</dd></dl></section>
  </div>`;
}

/* ---- Router -------------------------------------------------------------------------------------------------------- */
function setCount(n) { const el = document.getElementById('inbox-count'); el.textContent = n; el.hidden = !n; }
const ROUTES = [
  [/^#?\/?$/, 'overview', () => overview()],
  [/^#\/inbox$/, 'inbox', () => inbox()],
  [/^#\/clients$/, 'clients', () => clients()],
  [/^#\/clients\/([0-9a-f-]{36})$/, 'clients', (m) => clientPage(m[1])],
  [/^#\/projects\/([0-9a-f-]{36})$/, 'clients', (m) => projectPage(m[1])],
  [/^#\/billing$/, 'billing', () => billingPage()],
  [/^#\/settings$/, 'settings', () => settingsPage()],
];

async function render() {
  const hash = location.hash || '#/';
  const hit = ROUTES.map(([re, nav, fn]) => [hash.match(re), nav, fn]).find(([m]) => m);
  document.querySelectorAll('[data-nav]').forEach((a) => (a.getAttribute('data-nav') === (hit ? hit[1] : '') ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (!hit) { main.innerHTML = '<h1>Not found</h1><p><a href="#/">Back to the overview</a></p>'; return; }
  try { main.innerHTML = await hit[2](hit[0]); }
  catch (e) { main.innerHTML = `<h1>Something went wrong</h1><p class="warn">${esc(e.message)}</p><p><button class="btn" onclick="location.reload()">Try again</button></p>`; }
}

/* ---- Events (delegated) ---------------------------------------------------------------------------------------------- */
const formData = (form) => Object.fromEntries(new FormData(form).entries());
const currentId = () => (location.hash.match(/([0-9a-f-]{36})$/) || [])[1];

main.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.convert) { const [type, id] = b.dataset.convert.split('|'); return act(b, () => api('/inbox/convert', { method: 'POST', body: { type, id } }).then((c) => { location.hash = `#/clients/${c.id}`; return c; }), 'Client created.'); }
  if (b.dataset.status) { const [type, id, status] = b.dataset.status.split('|'); return act(b, () => api('/inbox/status', { method: 'POST', body: { type, id, status } }), `Marked ${status}.`); }
  if (b.dataset.file) { const [bucket, path] = b.dataset.file.split('|'); return api(`/file?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`).then((r) => window.open(r.url, '_blank', 'noopener')).catch((err) => toast(err.message, true)); }
  if (b.dataset.filter) { clientFilter = b.dataset.filter; return render(); }
  if (b.id === 'new-client-toggle') { const f = document.getElementById('new-client'); f.hidden = !f.hidden; if (!f.hidden) f.elements.name.focus(); return undefined; }
  if (b.dataset.act) {
    const action = b.dataset.act;
    const confirmText = { cancel: 'Cancel this plan in Stripe? Billing stops.', 'go-live': 'Start the plan in Stripe now? Billing starts on the 1st, with this month prorated.', 'setup-invoice': 'Email a $499 setup invoice from Stripe?' }[action];
    if (confirmText && !window.confirm(confirmText)) return undefined;
    return act(b, () => api(`/clients/${currentId()}/${action}`, { method: 'POST', body: {} }), { 'stripe-customer': 'Created in Stripe.', 'setup-invoice': 'Setup invoice sent.', 'go-live': 'Live. The plan is running in Stripe.', pause: 'Paused.', resume: 'Resumed.', cancel: 'Cancelled.' }[action]);
  }
  if (b.id === 'new-project') return act(b, () => api('/projects', { method: 'POST', body: { client_id: currentId(), title: 'Website Launch', kind: 'website', line_items: [{ description: 'Website Launch: custom 5–12 page site, editing backend, forms, basic SEO', amount: 3500 }] } }).then((p) => { location.hash = `#/projects/${p.id}`; }), 'Project created.');
  if (b.id === 'deposit') { if (!window.confirm('Email the deposit invoice from Stripe?')) return undefined; return act(b, () => api(`/projects/${currentId()}/deposit`, { method: 'POST', body: {} }), (r) => `Deposit invoice sent (${money(r.amount)}).`); }
  if (b.id === 'add-line' || b.id === 'add-offer') {
    const tr = document.getElementById('line-row').content.firstElementChild.cloneNode(true);
    if (b.id === 'add-offer') {
      const total = [...document.querySelectorAll('#lines input[name="la"]')].reduce((a, i) => a + (Number(i.value) || 0), 0);
      tr.querySelector('[name="ld"]').value = 'Launch offer (50% off)';
      tr.querySelector('[name="la"]').value = (-Math.round(total * 50) / 100).toFixed(2);
    }
    document.getElementById('lines').append(tr);
    return undefined;
  }
  if (b.hasAttribute('data-remove-line')) { b.closest('tr').remove(); return undefined; }
  if (b.id === 'report-now') return act(b, () => api('/billing/report', { method: 'POST', body: {} }), (r) => { const n = r.results.reduce((a, x) => a + x.reported.length, 0); return n ? `Sent usage for ${n} restaurant(s).` : 'Nothing new to send.'; });
  if (b.id === 'stripe-setup') return act(b, () => api('/stripe/setup', { method: 'POST', body: {} }), (r) => (r.created.length ? `Created: ${r.created.join(', ')}` : 'Everything already exists.'));
  return undefined;
});

main.addEventListener('submit', (e) => {
  const form = e.target;
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  if (form.id === 'new-client') return act(btn, () => api('/clients', { method: 'POST', body: formData(form) }).then((c) => { location.hash = `#/clients/${c.id}`; }), 'Client added.');
  if (form.id === 'client-form') {
    const data = formData(form);
    return act(btn, async () => {
      const before = await api(`/clients/${currentId()}`);
      if (data.plan && before.client.stripe_subscription_id && data.plan !== before.client.plan) await api(`/clients/${currentId()}/plan`, { method: 'POST', body: { plan: data.plan } });
      return api(`/clients/${currentId()}`, { method: 'PATCH', body: data });
    }, 'Saved.');
  }
  if (form.id === 'note-form') return act(btn, () => api(`/clients/${currentId()}/note`, { method: 'POST', body: formData(form) }), 'Note added.');
  if (form.id === 'invoice-form') {
    const d = formData(form);
    if (!window.confirm(`Email an invoice for ${money(d.amount)} from Stripe?`)) return undefined;
    return act(btn, () => api(`/clients/${currentId()}/invoice`, { method: 'POST', body: { lines: [{ description: d.description, amount: Number(d.amount) }] } }), 'Invoice sent.');
  }
  if (form.id === 'project-form') {
    const d = formData(form);
    const descs = [...form.querySelectorAll('[name="ld"]')].map((i) => i.value.trim());
    const amts = [...form.querySelectorAll('[name="la"]')].map((i) => Number(i.value));
    const line_items = descs.map((description, i) => ({ description, amount: amts[i] })).filter((l) => l.description && Number.isFinite(l.amount));
    return act(btn, () => api(`/projects/${currentId()}`, { method: 'PATCH', body: { title: d.title, kind: d.kind, status: d.status, deposit_pct: Number(d.deposit_pct), valid_until: d.valid_until, scope: d.scope, notes: d.notes, line_items } }), 'Saved.');
  }
  return undefined;
});

window.addEventListener('hashchange', () => { render(); main.focus({ preventScroll: true }); });
api('/me').then((m) => { document.getElementById('who').textContent = m.email ? `Signed in as ${m.email}` : ''; }).catch(() => {});
api('/inbox').then((d) => setCount(d.signups.filter((s) => s.status === 'new').length + d.leads.filter((l) => l.status === 'new').length)).catch(() => {});
render();
