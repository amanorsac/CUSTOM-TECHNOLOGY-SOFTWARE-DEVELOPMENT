// Route registry. Later tasks push entries here:
// { method: 'POST', test: (url) => boolean, handle: async (request, env, ctx, url) => Response }
// method '*' matches any method; such catch-alls must follow the specific routes.
import { designPageRoute, designPageHeadRoute } from './routes/design-page.js';
import { designsListRoute } from './routes/designs-list.js';
import { sitemapRoute, robotsRoute } from './routes/sitemap.js';
import { absolutizeHtml, publicUrl } from './lib/seo.js';
import { leadRoute, uploadUrlRoute, leadMethodNotAllowedRoute } from './routes/lead.js';
import { vaSignupRoute, vaUploadRoute, eventRoute, vaMethodNotAllowedRoute } from './routes/va.js';
import { adminRoute } from './routes/admin.js';
import { stripeWebhookRoute } from './routes/stripe-webhook.js';
import { reportUsage } from './lib/usage.js';

export const routes = [
  designPageRoute, designPageHeadRoute, designsListRoute,
  sitemapRoute, robotsRoute,
  leadRoute, uploadUrlRoute, leadMethodNotAllowedRoute,
  vaSignupRoute, vaUploadRoute, eventRoute, vaMethodNotAllowedRoute,
  stripeWebhookRoute, adminRoute,
];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default {
  // Hourly: send each live restaurant's new minutes to Stripe (src/lib/usage.js).
  async scheduled(event, env, ctx) {
    ctx.waitUntil(reportUsage(env, new Date(event.scheduledTime)).then((r) => console.log('[usage]', JSON.stringify(r))).catch((e) => console.error('[usage]', e.message)));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // The www address forwards to the real domain (SITE_ORIGIN), keeping the path and query.
    const site = publicUrl(url, env);
    if (site !== url && url.hostname === `www.${site.hostname}`) {
      return Response.redirect(`${site.origin}${url.pathname}${url.search}`, 301);
    }

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
    return noindex(absolutizeHtml(res, publicUrl(url, env), { home: url.pathname === '/' }));
  },
};
