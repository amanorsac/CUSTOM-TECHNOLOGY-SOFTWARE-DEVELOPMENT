// Pure ES module (no DOM, no imports): shared by the browser and Node tests.

// Music page order: the album first.
export const GROUPS = {
  unveiled: 'THE UNVEILED',
  'deeper-worship': 'Deeper Worship',
  single: 'Singles and live videos',
  medley: 'Medleys',
};

// Groups that are albums: their entries carry a track number and are listed in
// track order. Some tracks were singles first (their year is the single's).
export const ALBUMS = {
  unveiled: {
    title: 'THE UNVEILED',
    released: '2026-04-24',
    spotifyUrl: 'https://open.spotify.com/album/4Y8MpzdDsxeBXPRMQiWQeW',
    youtubeUrl: 'https://www.youtube.com/playlist?list=OLAK5uy_n74Hdmc1nF0HK9jpFxboc99tjXZD_Xuhg',
    appleUrl: 'https://music.apple.com/ng/album/the-unveiled/1895508929',
  },
};

const SLUG_RE = /^[a-z0-9-]+$/;

export function validateCatalogue(entries) {
  if (!Array.isArray(entries)) return ['catalogue must be an array'];
  const problems = [];
  const slugs = new Set();
  const ids = new Set();
  entries.forEach((e, i) => {
    const label = e && e.slug ? e.slug : `entry #${i}`;
    if (!e || typeof e !== 'object') {
      problems.push(`${label}: not an object`);
      return;
    }
    if (!e.slug || !SLUG_RE.test(e.slug)) problems.push(`${label}: slug missing or not url-safe`);
    else if (slugs.has(e.slug)) problems.push(`${label}: duplicate slug "${e.slug}"`);
    else slugs.add(e.slug);
    if (!e.title) problems.push(`${label}: title missing`);
    if (!Object.hasOwn(GROUPS, e.group)) problems.push(`${label}: unknown group "${e.group}"`);
    if (!Number.isInteger(e.year)) problems.push(`${label}: year missing`);
    if (!e.youtubeId) problems.push(`${label}: youtubeId missing`);
    else if (ids.has(e.youtubeId)) problems.push(`${label}: duplicate youtubeId "${e.youtubeId}"`);
    else ids.add(e.youtubeId);
    if (e.track !== undefined && !(Number.isInteger(e.track) && e.track > 0)) problems.push(`${label}: track must be a positive whole number`);
    if (ALBUMS[e.group] && e.track === undefined) problems.push(`${label}: album tracks need a track number`);
    if (e.featuring !== undefined && !Array.isArray(e.featuring)) problems.push(`${label}: featuring must be an array`);
  });
  return problems;
}

export function findByYoutubeId(entries, id) {
  return entries.find((e) => e.youtubeId === id);
}
