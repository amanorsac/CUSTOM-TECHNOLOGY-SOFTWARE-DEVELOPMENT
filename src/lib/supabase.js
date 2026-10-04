// Supabase access with the service key. The key is only ever placed in
// outbound request headers to SUPABASE_URL; it never appears in a response.

export const BUCKET = 'lead-uploads';

const base = (env) => String(env.SUPABASE_URL || '').replace(/\/+$/, '');

// Names of required Supabase settings that are missing, for logging.
export function missingSupabaseConfig(env) {
  return ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'].filter((k) => !env[k]);
}

function headers(env, extra = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    ...extra,
  };
}

// Inserts one validated lead row. Returns true on 2xx; logs and returns false otherwise.
export async function insertLead(env, row) {
  try {
    const res = await fetch(`${base(env)}/rest/v1/leads`, {
      method: 'POST',
      headers: headers(env, { 'content-type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      console.error(`[lead] insert failed: Supabase ${res.status} ${detail}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[lead] insert failed: ${e && e.message}`);
    return false;
  }
}

// Creates a signed upload URL for BUCKET/path. Returns the absolute URL or null.
export async function signUpload(env, path) {
  const root = `${base(env)}/storage/v1`;
  try {
    const res = await fetch(`${root}/object/upload/sign/${BUCKET}/${path}`, {
      method: 'POST',
      headers: headers(env, { 'content-type': 'application/json' }),
      body: '{}',
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      console.error(`[upload-url] sign failed: Supabase ${res.status} ${detail}`);
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
