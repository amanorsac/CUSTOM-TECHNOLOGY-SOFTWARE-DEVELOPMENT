// Cloudflare Access check for the back office. Access sits in front of /admin and /api/admin and adds a
// signed token (Cf-Access-Jwt-Assertion). This verifies that token here too, so a misconfigured Access
// rule can never expose client data: no valid token for ACCESS_AUD from ACCESS_TEAM -> no entry.
//   ACCESS_TEAM  the team name (https://<team>.cloudflareaccess.com)
//   ACCESS_AUD   the application's audience tag
// Local development and tests only: ADMIN_DEV_EMAIL lets requests to localhost in, never any other host.

const keyCache = new Map(); // team -> { at, keys: Map(kid -> CryptoKey) }
const KEY_TTL_MS = 60 * 60 * 1000;

const b64urlBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));

async function teamKeys(team, force = false) {
  const hit = keyCache.get(team);
  if (hit && !force && Date.now() - hit.at < KEY_TTL_MS) return hit.keys;
  const res = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`access certs ${res.status}`);
  const { keys = [] } = await res.json();
  const map = new Map();
  for (const jwk of keys) {
    map.set(jwk.kid, await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']));
  }
  keyCache.set(team, { at: Date.now(), keys: map });
  return map;
}

// Returns { ok: true, email } or { ok: false, reason }.
export async function verifyAccess(request, env) {
  const url = new URL(request.url);
  if (env.ADMIN_DEV_EMAIL && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return { ok: true, email: env.ADMIN_DEV_EMAIL };

  const team = String(env.ACCESS_TEAM || '').trim();
  const aud = String(env.ACCESS_AUD || '').trim();
  if (!team || !aud) return { ok: false, reason: 'not_configured' };
  const token = request.headers.get('cf-access-jwt-assertion') || '';
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'no_token' };

  let header, payload;
  try { header = b64urlJson(parts[0]); payload = b64urlJson(parts[1]); } catch { return { ok: false, reason: 'bad_token' }; }
  if (header.alg !== 'RS256') return { ok: false, reason: 'bad_alg' };

  let keys;
  try { keys = await teamKeys(team); if (!keys.has(header.kid)) keys = await teamKeys(team, true); } catch (e) { console.error(`[access] ${e.message}`); return { ok: false, reason: 'certs' }; }
  const key = keys.get(header.kid);
  if (!key) return { ok: false, reason: 'unknown_key' };
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(parts[2]), signed);
  if (!valid) return { ok: false, reason: 'bad_signature' };

  const now = Math.floor(Date.now() / 1000);
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(aud)) return { ok: false, reason: 'wrong_audience' };
  if (typeof payload.exp !== 'number' || payload.exp < now - 30) return { ok: false, reason: 'expired' };
  if (payload.iss && payload.iss !== `https://${team}.cloudflareaccess.com`) return { ok: false, reason: 'wrong_issuer' };
  return { ok: true, email: payload.email || '' };
}

export const _resetAccessCache = () => keyCache.clear();
