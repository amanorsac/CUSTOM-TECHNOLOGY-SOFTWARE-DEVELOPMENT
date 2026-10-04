// Pure catalog helpers. Browser ES module, no imports.
export const CATEGORIES = ['all', 'church', 'education', 'business', 'software'];
const PLACEHOLDER = 'images/designs/_placeholder.webp';

export function normalizeCategory(cat) {
  return CATEGORIES.includes(cat) ? cat : 'all';
}

export function filterDesigns(designs, cat) {
  // Not normalized: tags such as 'nonprofit' are valid filters.
  if (!cat || cat === 'all') return designs.slice();
  return designs.filter((d) => d.category === cat || (d.tags || []).includes(cat));
}

export function findDesign(designs, slug) {
  return designs.find((d) => d.slug === slug) || null;
}

export function relatedDesigns(designs, design, n = 3) {
  const mine = new Set(design.tags || []);
  return designs
    .map((d, i) => ({
      d, i,
      same: d.category === design.category ? 1 : 0,
      shared: (d.tags || []).filter((t) => mine.has(t)).length,
    }))
    .filter((x) => x.d.slug !== design.slug)
    .sort((a, b) => b.same - a.same || b.shared - a.shared || a.i - b.i)
    .slice(0, n)
    .map((x) => x.d);
}

export function imageOrPlaceholder(path) {
  return typeof path === 'string' && path ? path : PLACEHOLDER;
}

export function designSections(design) {
  const im = (design && design.images) || {};
  const has = (a) => Array.isArray(a) && a.length > 0;
  const out = [];
  if (has(im.website)) out.push('website');
  if (has(im.app)) out.push('app');
  if (has(im.portal)) out.push('portal');
  if (has(im.admin)) out.push('admin');
  return out;
}
