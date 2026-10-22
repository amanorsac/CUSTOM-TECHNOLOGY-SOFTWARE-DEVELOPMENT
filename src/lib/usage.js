// Virtual Assistant usage: read each restaurant's minutes from the Adelaide backend and report what Stripe
// hasn't had yet. Runs every hour (Cron Trigger) and from the Billing page's "Report usage now".
import { select, upsert, logActivity } from './db.js';
import { meterEvent } from './stripe.js';

// 'YYYY-MM' for a date, in UTC.
export const monthKey = (d = new Date()) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
export function previousMonth(d = new Date()) { return monthKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 15))); }
// Last second of a month 'YYYY-MM', as Unix time: final reports for a closed month are dated inside it.
export function endOfMonth(month) { const [y, m] = month.split('-').map(Number); return Math.floor(Date.UTC(y, m, 1) / 1000) - 60; }

// The backend's monthly summary: [{ id, name, plan, minutes, bill: { total }, your_profit, ... }]
export async function adelaideBilling(env, month) {
  if (!env.ADELAIDE_BASE || !env.ADELAIDE_ADMIN_KEY) throw new Error('Adelaide backend not configured');
  const url = `${String(env.ADELAIDE_BASE).replace(/\/+$/, '')}/billing.json?month=${encodeURIComponent(month)}&key=${encodeURIComponent(env.ADELAIDE_ADMIN_KEY)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Adelaide billing ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error('Adelaide billing: unexpected response');
  return rows;
}

// Reports unreported minutes for one month. Whole minutes, rounded to the nearest; never negative, never twice.
export async function reportMonth(env, month, { timestamp } = {}) {
  const clients = await select(env, 'clients', 'select=id,name,stripe_customer_id,adelaide_id,status&kind=eq.va&adelaide_id=not.is.null&stripe_customer_id=not.is.null&stripe_subscription_id=not.is.null');
  if (!clients.length) return { month, reported: [], skipped: [] };
  const [rows, done] = await Promise.all([
    adelaideBilling(env, month),
    select(env, 'usage_reports', `select=client_id,minutes_reported&month=eq.${month}`),
  ]);
  const byAdelaide = new Map(rows.map((r) => [r.id, r]));
  const reportedSoFar = new Map(done.map((d) => [d.client_id, d.minutes_reported]));
  const reported = [], skipped = [];
  for (const c of clients) {
    const row = byAdelaide.get(c.adelaide_id);
    if (!row) { skipped.push({ client: c.name, reason: 'not in the Adelaide backend' }); continue; }
    const total = Math.round(Number(row.minutes) || 0);
    const before = reportedSoFar.get(c.id) || 0;
    const delta = total - before;
    if (delta <= 0) continue;
    try {
      await meterEvent(env, c.stripe_customer_id, delta, timestamp || Math.floor(Date.now() / 1000), `ctsd-${c.id}-${month}-${total}`);
      await upsert(env, 'usage_reports', { client_id: c.id, month, minutes_reported: total, updated_at: new Date().toISOString() }, 'client_id,month');
      reported.push({ client: c.name, minutes: delta, total });
    } catch (e) {
      skipped.push({ client: c.name, reason: e.message });
      await logActivity(env, c.id, 'usage', `Usage report failed for ${month}: ${e.message}`);
    }
  }
  return { month, reported, skipped };
}

// The hourly job: this month, plus a final pass for last month during the first hours of the 1st.
export async function reportUsage(env, now = new Date()) {
  const results = [await reportMonth(env, monthKey(now))];
  if (now.getUTCDate() === 1 && now.getUTCHours() < 3) {
    const prev = previousMonth(now);
    results.unshift(await reportMonth(env, prev, { timestamp: endOfMonth(prev) }));
  }
  return results;
}
