// Back-office database access (Supabase PostgREST + Storage) with the service key. Every call throws a
// DbError on failure so the admin API can answer one consistent error; nothing here is reachable without
// the Access check in src/routes/admin.js.
import { errorSummary, TIMEOUT_MS } from './supabase.js';

export class DbError extends Error {}

const base = (env) => String(env.SUPABASE_URL || '').replace(/\/+$/, '');
const headers = (env, extra = {}) => ({ apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, ...extra });

async function call(env, path, init = {}, label = path) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) throw new DbError('database not configured');
  const res = await fetch(`${base(env)}${path}`, { ...init, headers: headers(env, init.headers), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new DbError(`[db ${label}] ${await errorSummary(res)}`);
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// select('clients', 'select=*&order=created_at.desc') -> rows
export const select = (env, table, query = 'select=*') => call(env, `/rest/v1/${table}?${query}`, {}, `select ${table}`);

export async function one(env, table, id) {
  const rows = await select(env, table, `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] || null;
}

export async function insert(env, table, row) {
  const rows = await call(env, `/rest/v1/${table}`, { method: 'POST', headers: { 'content-type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(row) }, `insert ${table}`);
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function update(env, table, filter, patch) {
  const rows = await call(env, `/rest/v1/${table}?${filter}`, { method: 'PATCH', headers: { 'content-type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(patch) }, `update ${table}`);
  return Array.isArray(rows) ? rows[0] || null : rows;
}

export async function upsert(env, table, row, onConflict) {
  const rows = await call(env, `/rest/v1/${table}?on_conflict=${onConflict}`, { method: 'POST', headers: { 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(row) }, `upsert ${table}`);
  return Array.isArray(rows) ? rows[0] : rows;
}

// One line on a client's timeline. Never throws: a missing activity line must not fail the action it records.
export async function logActivity(env, clientId, kind, text) {
  try { await insert(env, 'activity', { client_id: clientId, kind, text: String(text).slice(0, 500) }); } catch (e) { console.error(e.message); }
}

// A short-lived signed download link for a private file (menu or logo).
export async function signedDownload(env, bucket, path, seconds = 300) {
  const data = await call(env, `/storage/v1/object/sign/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expiresIn: seconds }) }, 'sign download');
  const url = data && (data.signedURL || data.signedUrl);
  if (!url) throw new DbError('[db sign download] no url');
  return /^https?:\/\//.test(url) ? url : `${base(env)}/storage/v1${url.startsWith('/') ? '' : '/'}${url}`;
}
