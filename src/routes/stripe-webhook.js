// POST /api/stripe/webhook: Stripe tells the back office about payments. The signature is checked against
// STRIPE_WEBHOOK_SECRET before anything is read. Stripe itself emails invoices and receipts.
import { verifyWebhook } from '../lib/stripe.js';
import { select, update, logActivity } from '../lib/db.js';
import { sendEmail, DEFAULT_FROM } from '../lib/email.js';

const ok = () => new Response(JSON.stringify({ received: true }), { headers: { 'content-type': 'application/json' } });
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

async function clientByCustomer(env, customer) {
  if (!customer) return null;
  const rows = await select(env, 'clients', `select=*&stripe_customer_id=eq.${encodeURIComponent(customer)}&limit=1`);
  return rows[0] || null;
}

export async function handleEvent(env, event) {
  const o = event.data && event.data.object ? event.data.object : {};
  switch (event.type) {
    case 'checkout.session.completed': {
      // The $499 setup Payment Link: mark the restaurant's sign-up (and client, if converted) as paid.
      const email = (o.customer_details && o.customer_details.email) || o.customer_email;
      if (!email) return;
      const e = encodeURIComponent(email.toLowerCase());
      const signups = await select(env, 'va_signups', `select=id,status&email=ilike.${e}&order=created_at.desc&limit=1`);
      if (signups[0] && ['new', 'contacted'].includes(signups[0].status)) await update(env, 'va_signups', `id=eq.${signups[0].id}`, { status: 'paid' });
      const clients = await select(env, 'clients', `select=id,status,stripe_customer_id&kind=eq.va&email=ilike.${e}&limit=1`);
      const c = clients[0];
      if (c) {
        const patch = {};
        if (c.status === 'new') patch.status = 'paid';
        if (!c.stripe_customer_id && o.customer) patch.stripe_customer_id = o.customer;
        if (Object.keys(patch).length) await update(env, 'clients', `id=eq.${c.id}`, patch);
        await logActivity(env, c.id, 'payment', `Setup fee paid (${money(o.amount_total || 0)}).`);
      }
      return;
    }
    case 'invoice.paid': {
      const c = await clientByCustomer(env, o.customer);
      if (c) await logActivity(env, c.id, 'payment', `Invoice ${o.number || o.id} paid (${money(o.amount_paid || 0)}).`);
      return;
    }
    case 'invoice.payment_failed': {
      const c = await clientByCustomer(env, o.customer);
      if (c) await logActivity(env, c.id, 'payment', `Payment failed on invoice ${o.number || o.id} (${money(o.amount_due || 0)}).`);
      if (env.LEAD_EMAIL) {
        const who = (c && c.name) || o.customer_name || o.customer_email || o.customer;
        const subject = `Payment failed: ${who}`;
        const text = `A payment failed on invoice ${o.number || o.id} for ${who}, ${money(o.amount_due || 0)}.\nStripe will retry. Invoice: ${o.hosted_invoice_url || 'see the Stripe dashboard'}\n`;
        await sendEmail(env, { from: env.MAIL_FROM || DEFAULT_FROM, to: env.LEAD_EMAIL, subject, text, html: `<p>${text.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]).replace(/\n/g, '<br>')}</p>` }, 'payment failed email');
      }
      return;
    }
    case 'customer.subscription.deleted': {
      const c = await clientByCustomer(env, o.customer);
      if (c && c.status !== 'cancelled') {
        await update(env, 'clients', `id=eq.${c.id}`, { status: 'cancelled' });
        await logActivity(env, c.id, 'status', 'Subscription cancelled in Stripe.');
      }
      return;
    }
    default:
  }
}

export const stripeWebhookRoute = {
  method: 'POST',
  test: (url) => url.pathname === '/api/stripe/webhook',
  async handle(request, env) {
    const raw = await request.text();
    if (raw.length > 512 * 1024) return new Response('too large', { status: 413 });
    if (!(await verifyWebhook(env.STRIPE_WEBHOOK_SECRET, request.headers.get('stripe-signature'), raw))) {
      return new Response(JSON.stringify({ error: 'bad signature' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
    let event;
    try { event = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
    try { await handleEvent(env, event); }
    catch (e) {
      // A database hiccup: tell Stripe to retry later.
      console.error(`[stripe-webhook] ${event.type}: ${e.message}`);
      return new Response(JSON.stringify({ error: 'retry' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    return ok();
  },
};
