import { describe, it, expect } from 'vitest';
import { parseFeed, pickLatest } from '../../src/lib/youtube-feed.js';

const entry = (id, title, link, published) => `<entry><id>yt:video:${id}</id><yt:videoId>${id}</yt:videoId><yt:channelId>UCx</yt:channelId><title>${title}</title><link rel="alternate" href="${link}"/><author><name>K</name></author><published>${published}</published></entry>`;
const head = '<feed><title>Kingsley Anyenor</title><link rel="alternate" href="https://www.youtube.com/channel/UCx"/>';

const SHORT = entry('8-Qv7zWQY-U', 'A short', 'https://www.youtube.com/shorts/8-Qv7zWQY-U', '2026-11-14T08:00:00+00:00');
const VIDEO = entry('LqwYHMrrYK0', 'DEEPER WORSHIP 6.0 || KINGSLEY ANYENOR [Live Official Video]', 'https://www.youtube.com/watch?v=LqwYHMrrYK0', '2026-11-13T08:00:10+00:00');

describe('parseFeed', () => {
  const entries = parseFeed(`${head}${SHORT}${VIDEO}</feed>`);

  it('parses entries only, flagging Shorts', () => {
    expect(entries).toEqual([
      { youtubeId: '8-Qv7zWQY-U', title: 'A short', published: '2026-11-14T08:00:00+00:00', isShort: true },
      { youtubeId: 'LqwYHMrrYK0', title: 'DEEPER WORSHIP 6.0 || KINGSLEY ANYENOR [Live Official Video]', published: '2026-11-13T08:00:10+00:00', isShort: false },
    ]);
  });

  it('pickLatest skips Shorts', () => {
    expect(pickLatest(entries).youtubeId).toBe('LqwYHMrrYK0');
  });

  it('pickLatest returns null when all are Shorts or empty', () => {
    expect(pickLatest(parseFeed(`${head}${SHORT}</feed>`))).toBeNull();
    expect(pickLatest([])).toBeNull();
  });

  it('pickLatest skips entries published in the future (scheduled premieres)', () => {
    const now = Date.parse('2026-11-13T12:00:00Z');
    const PREMIERE = entry('abcdefghijk', 'Premiere', 'https://www.youtube.com/watch?v=abcdefghijk', '2026-11-20T18:00:00+00:00');
    const list = parseFeed(`${head}${PREMIERE}${SHORT}${VIDEO}</feed>`);
    expect(pickLatest(list, now).youtubeId).toBe('LqwYHMrrYK0');
    // Once the premiere time has passed it is the latest.
    expect(pickLatest(list, Date.parse('2026-11-21T00:00:00Z')).youtubeId).toBe('abcdefghijk');
    // Only future entries: nothing to show.
    expect(pickLatest(parseFeed(`${head}${PREMIERE}</feed>`), now)).toBeNull();
  });

  it('returns [] for empty or malformed input', () => {
    expect(parseFeed('')).toEqual([]);
    expect(parseFeed('<feed><entry>')).toEqual([]);
    expect(parseFeed(undefined)).toEqual([]);
  });

  it('decodes entities in titles', () => {
    const x = entry('abcdefghijk', 'Tom &amp; Jerry &#39;live&#39; &quot;hi&quot;', 'https://www.youtube.com/watch?v=abcdefghijk', '2026-01-01T00:00:00+00:00');
    expect(parseFeed(`${head}${x}</feed>`)[0].title).toBe('Tom & Jerry \'live\' "hi"');
  });
});
