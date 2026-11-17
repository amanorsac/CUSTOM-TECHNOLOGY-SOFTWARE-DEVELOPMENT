// GET/HEAD /media/kingsley/<name>.mp4 — the Kingsley draft's hero videos,
// served with HTTP byte ranges. The static asset layer answers a Range request
// with 200 and the whole file, and iOS Safari will not play a <video> unless
// the server answers ranges with 206, so these files go through the worker
// (wrangler.jsonc runs the worker first for /media/*; /assets/* bypasses it).

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

// Bytes start..end (inclusive) of a stream, without buffering the whole file.
function slice(body, start, end) {
  const len = end - start + 1;
  const { readable, writable } = typeof FixedLengthStream === 'function' ? new FixedLengthStream(len) : new TransformStream();
  const pump = async () => {
    const reader = body.getReader();
    const writer = writable.getWriter();
    let pos = 0;
    try {
      while (pos <= end) {
        const { done, value } = await reader.read();
        if (done) break;
        const from = pos;
        pos += value.byteLength;
        if (pos <= start) continue;
        await writer.write(value.subarray(Math.max(0, start - from), Math.min(value.byteLength, end + 1 - from)));
      }
      await writer.close();
    } catch (err) {
      await writer.abort(err).catch(() => {});
    } finally {
      reader.cancel().catch(() => {});
    }
  };
  pump();
  return readable;
}

async function handle(request, env, ctx, url) {
  const asset = await env.ASSETS.fetch(new Request(url.toString()));
  if (asset.status !== 200 || !asset.body) return asset;

  let body = asset.body;
  let size = Number(asset.headers.get('content-length'));
  if (!Number.isFinite(size) || asset.headers.get('content-length') === null) {
    const buf = new Uint8Array(await asset.arrayBuffer());
    size = buf.byteLength;
    body = new Blob([buf]).stream();
  }

  const headers = new Headers({
    'content-type': asset.headers.get('content-type') || 'video/mp4',
    'accept-ranges': 'bytes',
    'cache-control': CACHE,
    'x-robots-tag': 'noindex, nofollow',
  });
  const etag = asset.headers.get('etag');
  if (etag) headers.set('etag', etag);
  const head = request.method === 'HEAD';

  const range = parseRange(request.headers.get('range'), size);
  if (range === 'unsatisfiable') {
    body.cancel().catch(() => {});
    headers.set('content-range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  if (!range) {
    headers.set('content-length', String(size));
    if (head) body.cancel().catch(() => {});
    return new Response(head ? null : body, { status: 200, headers });
  }
  const { start, end } = range;
  headers.set('content-range', `bytes ${start}-${end}/${size}`);
  headers.set('content-length', String(end - start + 1));
  if (head) {
    body.cancel().catch(() => {});
    return new Response(null, { status: 206, headers });
  }
  return new Response(slice(body, start, end), { status: 206, headers });
}

export const mediaRoute = { method: 'GET', test: (url) => PATH.test(url.pathname), handle };
export const mediaHeadRoute = { method: 'HEAD', test: (url) => PATH.test(url.pathname), handle };
