// POST /api/lead        — store a lead, email the owner (and the visitor).
// POST /api/upload-url  — issue a signed Supabase Storage upload URL for a logo.
// Same-origin only: no CORS headers. Every response is JSON.

import { validateLead } from '../../public/assets/js/lead-schema.js';
import { verifyTurnstile } from '../lib/turnstile.js';
import { insertLead, signUpload, missingSupabaseConfig } from '../lib/supabase.js';
import { ownerEmail, visitorEmail, sendEmail, DEFAULT_FROM } from '../lib/email.js';

export const MAX_BODY = 32 * 1024;
export const MAX_UPLOAD = 5_242_880;
export const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

const LEAD_PATH = '/api/lead';
const UPLOAD_PATH = '/api/upload-url';

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });
}

const tooLarge = Symbol('tooLarge');
const badJson = Symbol('badJson');

// Reads at most MAX_BODY bytes and parses a JSON object.
async function readJson(request) {
  const declared = Number(request.headers.get('content-length'));
  if (declared > MAX_BODY) return tooLarge;
  if (!request.body) return badJson;

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel().catch(() => {});
      return tooLarge;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) { bytes.set(c, off); off += c.byteLength; }

  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : badJson;
  } catch {
    return badJson;
  }
}

async function bodyOrError(request) {
  const body = await readJson(request);
  if (body === tooLarge) return { error: json({ ok: false, error: 'too_large' }, 413) };
  if (body === badJson) return { error: json({ ok: false, error: 'bad_json' }, 400) };
  return { body };
}

function serverConfigError(env, label) {
  const missing = missingSupabaseConfig(env);
  if (!missing.length) return null;
  console.error(`[${label}] missing config: ${missing.join(', ')}`);
  return json({ ok: false, error: 'server' }, 500);
}

function honeypotFilled(v) {
  if (v === undefined || v === null) return false;
  return String(v).trim() !== '';
}

async function handleLead(request, env) {
  const { body, error } = await bodyOrError(request);
  if (error) return error;

  // Bots fill the hidden field: pretend success, do nothing.
  if (honeypotFilled(body.website_hp)) return json({ ok: true });

  if (!(await verifyTurnstile(env, body.turnstile, request))) {
    return json({ ok: false, error: 'captcha' }, 403);
  }

  const result = validateLead(body);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);
  const lead = result.value;

  const configError = serverConfigError(env, 'lead');
  if (configError) return configError;

  if (!(await insertLead(env, lead))) return json({ ok: false, error: 'server' }, 500);

  // The lead is saved; email problems are logged but never fail the request.
  const owner = ownerEmail(lead);
  const sends = [sendEmail(env, {
    from: env.MAIL_FROM || DEFAULT_FROM,
    to: env.LEAD_EMAIL,
    reply_to: lead.email,
    ...owner,
  }, 'owner email')];

  if (env.MAIL_FROM) {
    sends.push(sendEmail(env, {
      from: env.MAIL_FROM,
      to: lead.email,
      reply_to: env.LEAD_EMAIL,
      ...visitorEmail(lead),
    }, 'visitor email'));
  }
  await Promise.all(sends);

  return json({ ok: true });
}

// Keeps [a-zA-Z0-9._-], max 100 chars, preserving the extension when cutting.
export function safeFilename(name) {
  let s = (typeof name === 'string' ? name : '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[._-]+/, '');
  if (s.length > 100) {
    const dot = s.lastIndexOf('.');
    const ext = dot > 0 && s.length - dot <= 10 ? s.slice(dot) : '';
    s = s.slice(0, 100 - ext.length) + ext;
  }
  return s || 'logo';
}

async function handleUploadUrl(request, env) {
  const { body, error } = await bodyOrError(request);
  if (error) return error;

  if (!(await verifyTurnstile(env, body.turnstile, request))) {
    return json({ ok: false, error: 'captcha' }, 403);
  }

  const errors = {};
  if (!UPLOAD_TYPES.includes(body.type)) errors.type = 'Please upload a PNG, JPG or SVG file.';
  if (!Number.isInteger(body.size) || body.size <= 0 || body.size > MAX_UPLOAD) {
    errors.size = 'The file must be 5MB or smaller.';
  }
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const configError = serverConfigError(env, 'upload-url');
  if (configError) return configError;

  const path = `${crypto.randomUUID()}-${safeFilename(body.filename)}`;
  const uploadUrl = await signUpload(env, path);
  if (!uploadUrl) return json({ ok: false, error: 'server' }, 500);

  return json({ ok: true, path, uploadUrl });
}

const isApiPath = (url) => url.pathname === LEAD_PATH || url.pathname === UPLOAD_PATH;

export const leadRoute = {
  method: 'POST',
  test: (url) => url.pathname === LEAD_PATH,
  handle: (request, env) => handleLead(request, env),
};

export const uploadUrlRoute = {
  method: 'POST',
  test: (url) => url.pathname === UPLOAD_PATH,
  handle: (request, env) => handleUploadUrl(request, env),
};

// Any other method on these paths.
export const leadMethodNotAllowedRoute = {
  method: '*',
  test: isApiPath,
  handle: async () => json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'POST' }),
};
