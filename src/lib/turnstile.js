// Cloudflare Turnstile server-side check. Fails closed: a missing secret,
// missing token, network error or non-success response all return false.

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(env, token, request) {
  if (!env.TURNSTILE_SECRET) {
    console.error('[turnstile] TURNSTILE_SECRET is not set');
    return false;
  }
  if (typeof token !== 'string' || !token || token.length > 2048) return false;

  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.set('remoteip', ip);

  try {
    const res = await fetch(SITEVERIFY, { method: 'POST', body: form });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data.success === true;
  } catch {
    return false;
  }
}
