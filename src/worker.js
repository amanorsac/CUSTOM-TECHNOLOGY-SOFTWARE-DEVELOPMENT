// Route registry. Later tasks push entries here:
// { method: 'POST', test: (url) => boolean, handle: async (request, env, ctx, url) => Response }
// method '*' matches any method; such catch-alls must follow the specific routes.
import { designPageRoute, designPageHeadRoute } from './routes/design-page.js';
import { designsListRoute } from './routes/designs-list.js';
import { sitemapRoute, robotsRoute } from './routes/sitemap.js';
import { absolutizeHtml } from './lib/seo.js';
import { leadRoute, uploadUrlRoute, leadMethodNotAllowedRoute } from './routes/lead.js';

export const routes = [
  designPageRoute, designPageHeadRoute, designsListRoute,
  sitemapRoute, robotsRoute,
  leadRoute, uploadUrlRoute, leadMethodNotAllowedRoute,
];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    for (const route of routes) {
      if ((route.method === request.method || route.method === '*') && route.test(url)) {
        return route.handle(request, env, ctx, url);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'not_found' }, 404);
    }

    const res = await env.ASSETS.fetch(request);
    // Client drafts are unlisted: no search engine may index or follow them.
    const draft = url.pathname.startsWith('/preview/');
    const noindex = (r) => { if (!draft) return r; const h = new Headers(r.headers); h.set('x-robots-tag', 'noindex, nofollow'); return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h }); };
    // Redirects and non-HTML (images, fonts, JSON) pass straight through.
    if (!(res.headers.get('content-type') || '').includes('text/html')) return noindex(res);
    return noindex(absolutizeHtml(res, url, { home: url.pathname === '/' }));
  },
};
