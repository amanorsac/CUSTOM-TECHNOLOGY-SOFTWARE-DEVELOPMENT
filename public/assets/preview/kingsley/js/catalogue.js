// Pure ES module (no DOM, no imports): shared by the browser and Node tests.

export const GROUPS = {
  'deeper-worship': 'Deeper Worship',
  single: 'Singles and live videos',
  medley: 'Medleys',
  unveiled: 'THE UNVEILED',
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
    if (e.featuring !== undefined && !Array.isArray(e.featuring)) problems.push(`${label}: featuring must be an array`);
  });
  return problems;
}

export function findByYoutubeId(entries, id) {
  return entries.find((e) => e.youtubeId === id);
}
