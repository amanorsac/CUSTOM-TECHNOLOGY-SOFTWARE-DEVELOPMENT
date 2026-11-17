// Hero videos under /media/kingsley/ are served by the worker with HTTP byte
// ranges (iOS Safari will not play a <video> without 206 responses).
import { describe, it, expect, beforeAll } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';
import { parseRange } from '../../src/routes/media.js';

const VIDEO = 'https://example.com/media/kingsley/hero-1280.mp4';

async function get(url, { method = 'GET', range } = {}) {
  const ctx = createExecutionContext();
  const headers = range ? { range } : {};
  const res = await worker.fetch(new Request(url, { method, headers }), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

let full; // Uint8Array of the whole file, from the asset binding itself
beforeAll(async () => {
  full = new Uint8Array(await (await env.ASSETS.fetch(new Request(VIDEO))).arrayBuffer());
  expect(full.length).toBeGreaterThan(10000);
});

const bytes = async (res) => new Uint8Array(await res.arrayBuffer());
// Byte-for-byte equality without toEqual's slow deep diff on megabytes.
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

describe('parseRange', () => {
  it('reads first-last, open-ended and suffix ranges', () => {
    expect(parseRange('bytes=0-999', 5000)).toEqual({ start: 0, end: 999 });
    expect(parseRange('bytes=4000-', 5000)).toEqual({ start: 4000, end: 4999 });
    expect(parseRange('bytes=-500', 5000)).toEqual({ start: 4500, end: 4999 });
    expect(parseRange('bytes=-9000', 5000)).toEqual({ start: 0, end: 4999 });
    expect(parseRange('bytes=100-99999', 5000)).toEqual({ start: 100, end: 4999 });
  });
  it('ignores malformed and multi-range headers (serve the whole file)', () => {
    for (const h of [null, '', 'bytes=', 'bytes=abc', 'items=0-5', 'bytes=0-1,5-9', 'bytes=10-5']) {
      expect(parseRange(h, 5000)).toBeNull();
    }
  });
  it('flags ranges that start past the end as unsatisfiable', () => {
    expect(parseRange('bytes=5000-', 5000)).toBe('unsatisfiable');
    expect(parseRange('bytes=6000-7000', 5000)).toBe('unsatisfiable');
    expect(parseRange('bytes=-0', 5000)).toBe('unsatisfiable');
  });
});

describe('GET /media/kingsley/*.mp4', () => {
  it('serves the whole file with 200 and Accept-Ranges', async () => {
    const res = await get(VIDEO);
    expect(res.status).toBe(200);
    expect(res.headers.get('accept-ranges')).toBe('bytes');
    expect(res.headers.get('content-type')).toContain('video/mp4');
    expect(res.headers.get('content-length')).toBe(String(full.length));
    expect(res.headers.get('cache-control')).toMatch(/max-age=\d{7,}/);
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(same(await bytes(res), full)).toBe(true);
  });

  it('answers bytes=0-999 with 206 and exactly those 1000 bytes', async () => {
    const res = await get(VIDEO, { range: 'bytes=0-999' });
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe(`bytes 0-999/${full.length}`);
    expect(res.headers.get('content-length')).toBe('1000');
    expect(res.headers.get('accept-ranges')).toBe('bytes');
    expect(res.headers.get('content-type')).toContain('video/mp4');
    const body = await bytes(res);
    expect(body.length).toBe(1000);
    expect(body).toEqual(full.subarray(0, 1000));
  });

  it('answers a range in the middle of the file', async () => {
    const start = 70000;
    const res = await get(VIDEO, { range: `bytes=${start}-${start + 65535}` });
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe(`bytes ${start}-${start + 65535}/${full.length}`);
    expect(await bytes(res)).toEqual(full.subarray(start, start + 65536));
  });

  it('answers an open-ended range to the end of the file', async () => {
    const start = full.length - 1234;
    const res = await get(VIDEO, { range: `bytes=${start}-` });
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe(`bytes ${start}-${full.length - 1}/${full.length}`);
    expect(res.headers.get('content-length')).toBe('1234');
    expect(await bytes(res)).toEqual(full.subarray(start));
  });

  it('answers a suffix range bytes=-500 with the last 500 bytes', async () => {
    const res = await get(VIDEO, { range: 'bytes=-500' });
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe(`bytes ${full.length - 500}-${full.length - 1}/${full.length}`);
    expect(res.headers.get('content-length')).toBe('500');
    expect(await bytes(res)).toEqual(full.subarray(full.length - 500));
  });

  it('answers an unsatisfiable range with 416 and the size', async () => {
    const res = await get(VIDEO, { range: `bytes=${full.length}-` });
    expect(res.status).toBe(416);
    expect(res.headers.get('content-range')).toBe(`bytes */${full.length}`);
    expect(res.headers.get('accept-ranges')).toBe('bytes');
    await res.arrayBuffer();
  });

  it('serves the whole file when the Range header is malformed', async () => {
    const res = await get(VIDEO, { range: 'bytes=nonsense' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-length')).toBe(String(full.length));
    await res.arrayBuffer();
  });

  it('HEAD gives the headers without a body', async () => {
    const res = await get(VIDEO, { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(res.headers.get('accept-ranges')).toBe('bytes');
    expect(res.headers.get('content-length')).toBe(String(full.length));
    expect(res.headers.get('content-type')).toContain('video/mp4');
    expect((await res.arrayBuffer()).byteLength).toBe(0);
  });

  it('HEAD with a range reports the partial length', async () => {
    const res = await get(VIDEO, { method: 'HEAD', range: 'bytes=0-999' });
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe(`bytes 0-999/${full.length}`);
    expect(res.headers.get('content-length')).toBe('1000');
    expect((await res.arrayBuffer()).byteLength).toBe(0);
  });

  it('a missing video is a 404, not a range response', async () => {
    const res = await get('https://example.com/media/kingsley/nope.mp4', { range: 'bytes=0-9' });
    expect(res.status).toBe(404);
    expect(res.headers.get('content-range')).toBeNull();
    await res.arrayBuffer();
  });
});

describe('other paths are unaffected', () => {
  it('the poster image is served as a plain asset, ignoring Range', async () => {
    const res = await get('https://example.com/media/kingsley/hero-poster.webp', { range: 'bytes=0-9' });
    expect(res.headers.get('content-type')).toContain('image/webp');
    expect(res.headers.get('content-range')).toBeNull();
    expect(res.headers.get('accept-ranges')).toBeNull();
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    await res.arrayBuffer();
  });

  it('draft pages keep their noindex header and absolute head tags', async () => {
    const res = await get('https://example.com/preview/kingsley/', { range: 'bytes=0-9' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(res.headers.get('content-range')).toBeNull();
    expect(await res.text()).toContain('<h1');
  });
});
