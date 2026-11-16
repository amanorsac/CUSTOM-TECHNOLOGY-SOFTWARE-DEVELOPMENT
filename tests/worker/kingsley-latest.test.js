import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';
import catalogue from '../../public/assets/preview/kingsley/data/catalogue.json';

const PATH = 'https://example.com/api/kingsley/latest';
const FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCkjUIJjNjY6sa2VYT1ZumGw';

const entry = (id, title, link, published) => `<entry><id>yt:video:${id}</id><yt:videoId>${id}</yt:videoId><title>${title}</title><link rel="alternate" href="${link}"/><published>${published}</published></entry>`;
const SHORT = entry('8-Qv7zWQY-U', 'A short', 'https://www.youtube.com/shorts/8-Qv7zWQY-U', '2026-11-14T08:00:00+00:00');
const VIDEO = entry('LqwYHMrrYK0', 'DEEPER WORSHIP 6.0 || KINGSLEY ANYENOR [Live Official Video]', 'https://www.youtube.com/watch?v=LqwYHMrrYK0', '2026-11-13T08:00:10+00:00');
const feed = (...e) => `<feed><title>K</title>${e.join('')}</feed>`;

let fetchImpl;
let fetched;

async function get(url = PATH, method = 'GET') {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url, { method }), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

beforeEach(async () => {
  await caches.default.delete(PATH);
  fetched = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    fetched.push(String(input instanceof Request ? input.url : input));
    return fetchImpl();
  });
});
afterEach(() => vi.restoreAllMocks());

describe('GET /api/kingsley/latest', () => {
  it('serves the newest non-Short upload from the feed', async () => {
    fetchImpl = () => new Response(feed(SHORT, VIDEO), { status: 200 });
    const res = await get();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
    expect(res.headers.get('cache-control')).toContain('max-age=1800');
    expect(await res.json()).toEqual({
      ok: true,
      youtubeId: 'LqwYHMrrYK0',
      title: 'DEEPER WORSHIP 6.0 || KINGSLEY ANYENOR [Live Official Video]',
      published: '2026-11-13T08:00:10+00:00',
      source: 'feed',
    });
    expect(fetched[0]).toBe(FEED_URL);
  });

  it('falls back to the catalogue when the feed errors', async () => {
    fetchImpl = () => new Response('nope', { status: 500 });
    const body = await (await get()).json();
    expect(body.source).toBe('fallback');
    expect(body.youtubeId).toBe(catalogue[0].youtubeId);
  });

  it('falls back when fetch throws', async () => {
    fetchImpl = () => { throw new Error('boom'); };
    const body = await (await get()).json();
    expect(body.source).toBe('fallback');
    expect(body.youtubeId).toBe(catalogue[0].youtubeId);
  });

  it('falls back when the feed has only Shorts', async () => {
    fetchImpl = () => new Response(feed(SHORT), { status: 200 });
    expect((await (await get()).json()).source).toBe('fallback');
  });

  it('does not cache fallbacks', async () => {
    fetchImpl = () => new Response('x', { status: 500 });
    await get();
    fetchImpl = () => new Response(feed(VIDEO), { status: 200 });
    expect((await (await get()).json()).source).toBe('feed');
  });

  it('caches feed responses and ignores the query string', async () => {
    fetchImpl = () => new Response(feed(VIDEO), { status: 200 });
    await get();
    await get(`${PATH}?x=1`);
    expect(fetched).toHaveLength(1);
  });

  it('does not match POST', async () => {
    const res = await get(PATH, 'POST');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, error: 'not_found' });
  });
});
