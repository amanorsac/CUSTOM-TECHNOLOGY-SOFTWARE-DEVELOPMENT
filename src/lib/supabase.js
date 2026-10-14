// Supabase access with the service key. The key is only ever placed in
// outbound request headers to SUPABASE_URL; it never appears in a response.

export const BUCKET = 'lead-uploads';

const base = (env) => String(env.SUPABASE_URL || '').replace(/\/+$/, '');

// Names of required Supabase settings that are missing, for logging.
export function missingSupabaseConfig(env) {
  return ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'].filter((k) => !env[k]);
}

export const TIMEOUT_MS = 8000;

// Short, PII-free description of a Supabase error response: the status plus
// the PostgREST/Storage `code` (or `error`) and `message`. Never the raw body,
// whose `details`/`hint` can echo the visitor's row.
export async function errorSummary(res) {
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  const pick = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, 160) : '');
  const code = data && typeof data === 'object' ? pick(data.code) || pick(data.error) : '';
  const message = data && typeof data === 'object' ? pick(data.message) : '';
  return [`Supabase ${res.status}`, code, message].filter(Boolean).join(' ');
}

function headers(env, extra = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    ...extra,
  };
}

// Inserts one row into a table. Returns true on 2xx; logs (without the row) and returns false otherwise.
export async function insertRow(env, table, row, label = table) {
  try {
    const res = await fetch(`${base(env)}/rest/v1/${table}`, {
      method: 'POST',
      headers: headers(env, { 'content-type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[${label}] insert failed: ${await errorSummary(res)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[${label}] insert failed: ${e && e.message}`);
    return false;
  }
}

// Inserts one validated lead row.
export const insertLead = (env, row) => insertRow(env, 'leads', row, 'lead');

// Creates a signed upload URL for bucket/path (the lead logo bucket by default). Returns the absolute URL or null.
export async function signUpload(env, path, bucket = BUCKET) {
  const root = `${base(env)}/storage/v1`;
  try {
    const res = await fetch(`${root}/object/upload/sign/${bucket}/${path}`, {
      method: 'POST',
      headers: headers(env, { 'content-type': 'application/json' }),
      body: '{}',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[upload-url] sign failed: ${await errorSummary(res)}`);
      return null;
    }
    const data = await res.json();
    const url = data && typeof data.url === 'string' ? data.url : '';
    if (!url) {
      console.error('[upload-url] sign failed: no url in Supabase response');
      return null;
    }
    if (/^https?:\/\//i.test(url)) return url;
    return root + (url.startsWith('/') ? url : `/${url}`);
  } catch (e) {
    console.error(`[upload-url] sign failed: ${e && e.message}`);
    return null;
  }
}
