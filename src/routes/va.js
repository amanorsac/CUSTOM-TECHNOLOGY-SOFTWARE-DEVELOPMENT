// Virtual Assistant endpoints (spec 2026-10-14-virtual-assistant-design.md). Same-origin, JSON only.
//   POST /api/va-signup     save a restaurant's sign-up, email the owner (and the restaurant), say where to go next
//   POST /api/va-upload-url a signed, private upload URL for the menu (PDF, JPG or PNG, up to 10 MB)
//   POST /api/event         record call_click, form_start or signup_complete; always 204 unless the input is bad
import { bodyOrError, honeypotFilled, background, safeFilename } from './lead.js';
import { validateSignup, MENU_TYPES, MAX_MENU } from '../../public/assets/js/va-schema.js';
import { insertRow, signUpload, missingSupabaseConfig } from '../lib/supabase.js';
import { vaOwnerEmail, vaVisitorEmail, sendEmail, DEFAULT_FROM } from '../lib/email.js';

export const MENU_BUCKET = 'va-menus';
export const EVENTS = ['call_click', 'form_start', 'signup_complete'];
const WELCOME = '/virtual-assistant/welcome';
const PATHS = ['/api/va-signup', '/api/va-upload-url', '/api/event'];

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

function configError(env, label) {
  const missing = missingSupabaseConfig(env);
  if (!missing.length) return null;
  console.error(`[${label}] missing config: ${missing.join(', ')}`);
  return json({ ok: false, error: 'server' }, 500);
}

// Where the browser goes after a sign-up: the owner's Stripe Payment Link when set, otherwise the welcome page.
function nextStep(env) {
  const link = String(env.VA_SETUP_LINK || '').trim();
  return /^https:\/\/(buy|checkout)\.stripe\.com\//.test(link) ? link : WELCOME;
}

async function handleSignup(request, env, ctx) {
  const { body, error } = await bodyOrError(request);
  if (error) return error;
  if (honeypotFilled(body.website_hp)) { console.warn('[va-signup] honeypot hit'); return json({ ok: true, next: WELCOME }); }
  const result = validateSignup(body);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);
  const cfg = configError(env, 'va-signup');
  if (cfg) return cfg;

  const row = { ...result.value, consent_at: new Date().toISOString() };
  if (!(await insertRow(env, 'va_signups', row, 'va-signup'))) return json({ ok: false, error: 'server' }, 500);

  // Saved. Emails never fail the request.
  const sends = [sendEmail(env, { from: env.MAIL_FROM || DEFAULT_FROM, to: env.LEAD_EMAIL, reply_to: row.email, ...vaOwnerEmail(row) }, 'va owner email')];
  if (env.MAIL_FROM) sends.push(sendEmail(env, { from: env.MAIL_FROM, to: row.email, reply_to: env.LEAD_EMAIL, ...vaVisitorEmail() }, 'va visitor email'));
  await background(ctx, Promise.allSettled(sends));
  return json({ ok: true, next: nextStep(env) });
}

async function handleUpload(request, env) {
  const { body, error } = await bodyOrError(request);
  if (error) return error;
  const errors = {};
  if (!MENU_TYPES.includes(body.type)) errors.type = 'Please upload a PDF, JPG or PNG.';
  if (!Number.isInteger(body.size) || body.size <= 0 || body.size > MAX_MENU) errors.size = 'The file must be 10 MB or smaller.';
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);
  const cfg = configError(env, 'va-upload-url');
  if (cfg) return cfg;
  const path = `${crypto.randomUUID()}-${safeFilename(body.filename)}`;
  const uploadUrl = await signUpload(env, path, MENU_BUCKET);
  if (!uploadUrl) return json({ ok: false, error: 'server' }, 500);
  return json({ ok: true, path, uploadUrl });
}

async function handleEvent(request, env, ctx) {
  const { body, error } = await bodyOrError(request);
  if (error) return error;
  const page = typeof body.page === 'string' ? body.page : '';
  if (!EVENTS.includes(body.event) || !/^\/(?!\/)[^\s]{0,199}$/.test(page)) return json({ ok: false, error: 'bad_event' }, 400);
  // Tracking never breaks a page: no database, or a failed insert, still answers 204.
  if (!missingSupabaseConfig(env).length) await background(ctx, insertRow(env, 'va_events', { event: body.event, page }, 'event'));
  return new Response(null, { status: 204 });
}

export const vaSignupRoute = { method: 'POST', test: (u) => u.pathname === '/api/va-signup', handle: handleSignup };
export const vaUploadRoute = { method: 'POST', test: (u) => u.pathname === '/api/va-upload-url', handle: (r, env) => handleUpload(r, env) };
export const eventRoute = { method: 'POST', test: (u) => u.pathname === '/api/event', handle: handleEvent };
export const vaMethodNotAllowedRoute = {
  method: '*', test: (u) => PATHS.includes(u.pathname),
  handle: async () => new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json; charset=utf-8', allow: 'POST' } }),
};
