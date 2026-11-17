// GET/HEAD /media/kingsley/<name>.mp4 — the Kingsley draft's hero videos,
// served from R2 (binding MEDIA, key kingsley/<name>.mp4, uploaded by
// scripts/kingsley-media.mjs) with HTTP byte ranges: iOS Safari will not play
// a <video> unless ranges are answered with 206. The videos live in R2 rather
// than the static assets because assets are capped at 25 MiB per file.

const PATH = /^\/media\/kingsley\/[a-z0-9-]+\.mp4$/;
const CACHE = 'public, max-age=2592000'; // 30 days; rename the file when re-encoding

/**
 * Parse a single-range `Range` header against a file of `size` bytes.
 * @returns {{start:number,end:number}|'unsatisfiable'|null} null means "ignore
 *   the header and send the whole file" (absent, malformed or multi-range).
 */
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header || '').trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  if (m[1] === '') {
    const n = Number(m[2]); // suffix: the last n bytes
    if (n === 0 || size === 0) return 'unsatisfiable';
    return { start: Math.max(0, size - n), end: size - 1 };
  }
  const start = Number(m[1]);
  if (m[2] !== '' && Number(m[2]) < start) return null;
  if (start >= size) return 'unsatisfiable';
  return { start, end: m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1) };
}

async function handle(request, env, ctx, url) {
  const notFound = () => new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  if (!env.MEDIA) return notFound();
  const key = url.pathname.slice('/media/'.length);
  const meta = await env.MEDIA.head(key);
  if (!meta) return notFound();
  const size = meta.size;

  const headers = new Headers({
    'content-type': meta.httpMetadata?.contentType || 'video/mp4',
    'accept-ranges': 'bytes',
    'cache-control': CACHE,
    'x-robots-tag': 'noindex, nofollow',
  });
  headers.set('etag', meta.httpEtag);
  const head = request.method === 'HEAD';

  const range = parseRange(request.headers.get('range'), size);
  if (range === 'unsatisfiable') {
    headers.set('content-range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  if (!range) {
    headers.set('content-length', String(size));
    if (head) return new Response(null, { status: 200, headers });
    const obj = await env.MEDIA.get(key);
    if (!obj) return notFound();
    return new Response(obj.body, { status: 200, headers });
  }
  const { start, end } = range;
  headers.set('content-range', `bytes ${start}-${end}/${size}`);
  headers.set('content-length', String(end - start + 1));
  if (head) return new Response(null, { status: 206, headers });
  const obj = await env.MEDIA.get(key, { range: { offset: start, length: end - start + 1 } });
  if (!obj) return notFound();
  return new Response(obj.body, { status: 206, headers });
}

export const mediaRoute = { method: 'GET', test: (url) => PATH.test(url.pathname), handle };
export const mediaHeadRoute = { method: 'HEAD', test: (url) => PATH.test(url.pathname), handle };
