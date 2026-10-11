// GET /designs/<slug>: serves public/design.html with per-design <head> tags.
// Known slug  -> 200, title/description/og/canonical set, data-slug on <main>.
// Unknown slug -> 404 with the same template (the client shows "Design not
//                found"), robots noindex kept.

import { jsonLdTag, setSecurityHeaders } from '../lib/seo.js';

const PATH = /^\/designs\/([^/]+)\/?$/;

// Fetch a static asset, following the asset layer's html_handling redirects
// (e.g. /design.html -> 307 /design) without leaving the ASSETS binding.
export async function asset(env, base, path) {
  let url = new URL(path, base);
  for (let hop = 0; hop < 3; hop++) {
    const res = await env.ASSETS.fetch(new Request(url, { redirect: 'manual' }));
    const loc = res.status >= 300 && res.status < 400 && res.headers.get('location');
    if (!loc) return res;
    url = new URL(loc, url);
  }
  throw new Error(`too many asset redirects for ${path}`);
}

export async function loadDesigns(env, base) {
  const res = await asset(env, base, '/data/designs.json');
  if (!res.ok) return [];
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);
const meta = (attr, key, content) => `<meta ${attr}="${key}" content="${esc(content)}">`;
const CATEGORY = { church: 'Church', education: 'Education', business: 'Business', software: 'Software' };
// A list of escaped <li> items, optionally wrapped and classed.
const items = (list, open = '', close = '', cls = '') => (Array.isArray(list) ? list : [])
  .map((t) => `<li${cls ? ` class="${cls}"` : ''}>${open}${esc(t)}${close}</li>`).join('');
const remove = { element: (el) => el.remove() };

// Head tags that depend on the request are rebuilt here, always as absolute
// URLs from the request origin. Text values are HTML-escaped.
function rewrite(res, design, url) {
  const headers = new Headers(res.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.delete('content-length');
  headers.delete('etag');
  setSecurityHeaders(headers);

  const abs = (path) => new URL(`/${String(path).replace(/^\/+/, '')}`, url.origin).href;
  const placeholder = abs('images/designs/_placeholder.webp');

  if (!design) {
    // 404: keep the template's noindex, no canonical/og:url, absolute images.
    const tags = [meta('property', 'og:image', placeholder), meta('name', 'twitter:image', placeholder)].join('');
    const rw = new HTMLRewriter()
      .on('link[rel="canonical"], meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]', remove)
      .on('head', { element: (el) => el.append(tags, { html: true }) });
    return rw.transform(new Response(res.body, { status: 404, headers }));
  }

  const title = `${design.name} — Concept | CTSD`;
  const description = design.tagline || `${design.name}, a CTSD concept design.`;
  const pageUrl = abs(`designs/${encodeURIComponent(design.slug)}`);
  const image = design.images && design.images.cover ? abs(design.images.cover) : placeholder;
  const tags = [
    meta('name', 'description', description),
    `<link rel="canonical" href="${esc(pageUrl)}">`,
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:image', image),
    meta('property', 'og:url', pageUrl),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', image),
  ].join('\n');

  const rw = new HTMLRewriter()
    .on('title', { element: (el) => el.setInnerContent(title) })
    .on([
      'meta[name="description"]', 'meta[name="robots"]', 'link[rel="canonical"]',
      'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]',
      'meta[property="og:url"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
    ].join(', '), remove)
    .on('head', {
      element: (el) => {
        el.append(tags, { html: true });
        el.append(jsonLdTag({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: abs('') },
            { '@type': 'ListItem', position: 2, name: 'Explore Designs', item: abs('designs') },
            { '@type': 'ListItem', position: 3, name: design.name, item: pageUrl },
          ],
        }), { html: true });
      },
    })
    .on('main', { element: (el) => el.setAttribute('data-slug', design.slug) })
    // Server-render the page's content so crawlers, link previews and no-JS visitors see it. The page
    // script re-renders these same elements (replaceChildren / textContent), so nothing is doubled.
    .on('[data-d="name"]', { element: (el) => el.setInnerContent(design.name) })
    .on('[data-d="tagline"]', { element: (el) => el.setInnerContent(description) })
    .on('[data-d="cat"]', { element: (el) => el.setInnerContent(CATEGORY[design.category] || design.category || '') })
    .on('[data-d="systems"]', { element: (el) => el.setInnerContent(items(design.systems), { html: true }) })
    .on('[data-features]', { element: (el) => el.setInnerContent(items(design.features, '<span>', '</span>'), { html: true }) })
    .on('[data-integrations]', { element: (el) => el.setInnerContent(items(design.integrations, '', '', 'd-chip'), { html: true }) });

  return rw.transform(new Response(res.body, { status: 200, headers }));
}

export const designPageRoute = {
  method: 'GET',
  test: (url) => PATH.test(url.pathname),
  async handle(request, env, ctx, url) {
    let slug = '';
    try {
      slug = decodeURIComponent(url.pathname.match(PATH)[1]);
    } catch {
      slug = '';
    }
    const [designs, page] = await Promise.all([
      loadDesigns(env, url),
      asset(env, url, '/design.html'),
    ]);
    if (!page.ok) return page;
    const design = designs.find((d) => d && d.slug === slug) || null;
    return rewrite(page, design, url);
  },
};

// HEAD gets the same status and headers.
export const designPageHeadRoute = {
  ...designPageRoute,
  method: 'HEAD',
  async handle(request, env, ctx, url) {
    const res = await designPageRoute.handle(request, env, ctx, url);
    return new Response(null, { status: res.status, headers: res.headers });
  },
};
