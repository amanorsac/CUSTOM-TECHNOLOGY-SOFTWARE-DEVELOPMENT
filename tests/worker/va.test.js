// Virtual Assistant sign-up, menu upload and event tracking (spec 2026-10-14-virtual-assistant-design.md).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env as baseEnv, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

const SB = 'https://sb.example.supabase.co';
const makeEnv = (over = {}) => ({
  ...baseEnv, SUPABASE_URL: SB, SUPABASE_SERVICE_KEY: 'svc-key', RESEND_API_KEY: 're_test',
  LEAD_EMAIL: 'owner@ctsd.example', MAIL_FROM: 'CTSD <hello@ctsd.example>', VA_SETUP_LINK: '', ...over,
});

let calls, handlers;
const route = (match, fn) => handlers.push({ match, fn });
const jsonRes = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  calls = []; handlers = [];
  route((u) => u === `${SB}/rest/v1/va_signups`, () => new Response(null, { status: 201 }));
  route((u) => u === `${SB}/rest/v1/va_events`, () => new Response(null, { status: 201 }));
  route((u) => u === 'https://api.resend.com/emails', () => jsonRes({ id: 'e1' }));
  route((u) => u.startsWith(`${SB}/storage/v1/object/upload/sign/va-menus/`),
    (u) => jsonRes({ url: u.slice(`${SB}/storage/v1`.length) + '?token=abc' }));
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const req = new Request(input, init);
    const call = { url: req.url, method: req.method, body: await req.text() };
    calls.push(call);
    for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i].match(req.url)) return handlers[i].fn(req.url, call);
    throw new Error(`unexpected fetch ${req.url}`);
  });
});
afterEach(() => vi.restoreAllMocks());

async function post(path, body, envOver = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsd.example${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body),
  }), makeEnv(envOver), ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

export const VALID = {
  restaurant: 'Mango & Ember', owner_name: 'Ama Owusu', mobile: '(434) 555-0100', email: 'ama@example.com',
  address: '1 Main St, Charlottesville, VA', current_phone: '434-555-0199',
  hours: { mon: '11–10', tue: '11–10', wed: '11–10', thu: '11–10', fri: '11–11', sat: '11–11', sun: 'Closed' },
  menu_link: 'https://example.com/menu', reservations: 'yes', party_max: '8', booking_system: 'OpenTable',
  pickup: 'yes', ready_time: '25 minutes', transfer_phone: '434-555-0123', plan: 'monthly', answer_mode: 'missed',
  assistant_name: 'Ama', notes: 'Friday nights are busy.', consent: true,
};

describe('POST /api/va-signup', () => {
  it('saves the sign-up, emails the owner and returns the welcome page when no payment link is set', async () => {
    const res = await post('/api/va-signup', VALID);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, next: '/virtual-assistant/welcome' });
    const insert = calls.find((c) => c.url === `${SB}/rest/v1/va_signups`);
    const row = JSON.parse(insert.body);
    expect(row).toMatchObject({ restaurant: 'Mango & Ember', plan: 'monthly', answer_mode: 'missed', reservations: true, party_max: 8, pickup: true });
    expect(row.hours.sun).toBe('Closed');
    expect(row.consent_at).toMatch(/^\d{4}-\d\d-\d\dT/);
    const mails = calls.filter((c) => c.url === 'https://api.resend.com/emails').map((c) => JSON.parse(c.body));
    const owner = mails.find((m) => m.to[0] === 'owner@ctsd.example');
    expect(owner.subject).toContain('Mango & Ember');
    expect(owner.text).toContain('Plan: Monthly ($497/month)');
    expect(owner.text).toContain('Assistant name: Ama');
    expect(owner.reply_to).toBe('ama@example.com');
  });

  it('sends the visitor to the Stripe Payment Link once it is set', async () => {
    const res = await post('/api/va-signup', VALID, { VA_SETUP_LINK: 'https://buy.stripe.com/test_abc' });
    expect((await res.json()).next).toBe('https://buy.stripe.com/test_abc');
  });

  it('names every missing required field', async () => {
    const res = await post('/api/va-signup', { consent: false });
    expect(res.status).toBe(400);
    const { errors } = await res.json();
    for (const f of ['restaurant', 'owner_name', 'mobile', 'email', 'address', 'current_phone', 'hours', 'menu', 'reservations', 'pickup', 'transfer_phone', 'plan', 'answer_mode', 'consent']) {
      expect(errors, f).toHaveProperty(f);
    }
    expect(calls).toEqual([]);
  });

  it('asks for the booking system and ready time only when they apply', async () => {
    const res = await post('/api/va-signup', { ...VALID, booking_system: '', ready_time: '' });
    expect(Object.keys((await res.json()).errors).sort()).toEqual(['booking_system', 'ready_time']);
    const ok = await post('/api/va-signup', { ...VALID, reservations: 'no', pickup: 'no', booking_system: '', ready_time: '', party_max: '' });
    expect(ok.status).toBe(200);
  });

  it('accepts an uploaded menu path instead of a link', async () => {
    const res = await post('/api/va-signup', { ...VALID, menu_link: '', menu_path: '0b3c2f9e-1d2a-4c5b-8e7f-123456789abc-menu.pdf' });
    expect(res.status).toBe(200);
  });

  it('pretends success for bots that fill the hidden field, saving nothing', async () => {
    const res = await post('/api/va-signup', { ...VALID, website_hp: 'spam' });
    expect(res.status).toBe(200);
    expect(calls).toEqual([]);
  });
});

describe('POST /api/va-upload-url', () => {
  it('signs a private upload for a PDF menu up to 10 MB', async () => {
    const res = await post('/api/va-upload-url', { type: 'application/pdf', size: 9_000_000, filename: 'Our menu.pdf' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.path).toMatch(/^[0-9a-f-]{36}-Our_menu\.pdf$/);
    expect(body.uploadUrl).toContain('/storage/v1/object/upload/sign/va-menus/');
  });

  it('rejects other types and files over 10 MB', async () => {
    const res = await post('/api/va-upload-url', { type: 'application/zip', size: 11_000_000, filename: 'x.zip' });
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).errors).sort()).toEqual(['size', 'type']);
  });
});

describe('POST /api/event', () => {
  it('records the three events', async () => {
    for (const event of ['call_click', 'form_start', 'signup_complete']) {
      const res = await post('/api/event', { event, page: '/virtual-assistant' });
      expect(res.status).toBe(204);
    }
    const rows = calls.filter((c) => c.url === `${SB}/rest/v1/va_events`).map((c) => JSON.parse(c.body));
    expect(rows.map((r) => r.event)).toEqual(['call_click', 'form_start', 'signup_complete']);
    expect(rows[0]).toEqual({ event: 'call_click', page: '/virtual-assistant' });
  });

  it('rejects unknown events and outside pages', async () => {
    expect((await post('/api/event', { event: 'purchase', page: '/' })).status).toBe(400);
    expect((await post('/api/event', { event: 'call_click', page: 'https://evil.example/' })).status).toBe(400);
  });

  it('still answers 204 when the database is unavailable or unset', async () => {
    route((u) => u === `${SB}/rest/v1/va_events`, () => new Response('x', { status: 500 }));
    expect((await post('/api/event', { event: 'form_start', page: '/virtual-assistant/start' })).status).toBe(204);
    expect((await post('/api/event', { event: 'form_start', page: '/virtual-assistant/start' }, { SUPABASE_URL: '' })).status).toBe(204);
  });
});
