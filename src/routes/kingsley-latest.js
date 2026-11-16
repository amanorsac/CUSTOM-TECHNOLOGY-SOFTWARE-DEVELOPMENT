// GET /api/kingsley/latest — the newest non-Short upload on Kingsley's channel,
// from the public YouTube feed, falling back to the newest catalogue entry.

import catalogue from '../../public/assets/preview/kingsley/data/catalogue.json';
import { parseFeed, pickLatest } from '../lib/youtube-feed.js';

const PATH = '/api/kingsley/latest';
const FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCkjUIJjNjY6sa2VYT1ZumGw';

function json(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=1800' },
  });
}

async function fromFeed() {
  try {
    const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return pickLatest(parseFeed(await res.text()));
  } catch {
    return null;
  }
}

async function handle(request, env, ctx, url) {
  // Keyed on the pathname only, so query strings cannot create cache entries.
  const cache = caches.default;
  const key = new Request(`${url.origin}${PATH}`);
  const cached = await cache.match(key);
  if (cached) return cached;

  const latest = await fromFeed();
  if (latest) {
    const res = json({ ok: true, youtubeId: latest.youtubeId, title: latest.title, published: latest.published, source: 'feed' });
    const put = cache.put(key, res.clone()).catch(() => {});
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(put);
    else await put;
    return res;
  }

  const first = catalogue[0];
  return json({ ok: true, youtubeId: first.youtubeId, title: first.title, published: first.published ?? null, source: 'fallback' });
}

export const kingsleyLatestRoute = {
  method: 'GET',
  test: (url) => url.pathname === PATH,
  handle,
};
