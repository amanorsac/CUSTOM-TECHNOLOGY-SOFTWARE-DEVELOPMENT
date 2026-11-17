// Parses the YouTube channel Atom feed with regexes (Workers have no DOMParser).
// Never throws: anything unparseable yields [].

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(s) {
  return s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (m, dec, hex, name) => {
    if (name) return ENTITIES[name.toLowerCase()];
    const code = dec ? Number(dec) : parseInt(hex, 16);
    try { return String.fromCodePoint(code); } catch { return m; }
  });
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? decode(m[1].trim()) : '';
}

export function parseFeed(xml) {
  if (typeof xml !== 'string' || !xml) return [];
  try {
    const out = [];
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const block = m[1];
      const youtubeId = tag(block, 'yt:videoId');
      if (!/^[\w-]{6,20}$/.test(youtubeId)) continue;
      const link = (block.match(/<link\b[^>]*\brel="alternate"[^>]*\bhref="([^"]*)"/) || [])[1] || '';
      out.push({
        youtubeId,
        title: tag(block, 'title'),
        published: tag(block, 'published'),
        isShort: link.includes('/shorts/'),
      });
    }
    return out;
  } catch {
    return [];
  }
}

// Newest non-Short entry that is already out. Scheduled premieres appear in
// the feed with a future `published` date; those are skipped.
export function pickLatest(entries, now = Date.now()) {
  const due = (e) => {
    const t = Date.parse(e.published);
    return Number.isNaN(t) || t <= now;
  };
  return (Array.isArray(entries) ? entries : []).find((e) => e && e.isShort === false && due(e)) || null;
}
