// Route registry. Later tasks push entries here:
// { method: 'POST', test: (url) => boolean, handle: async (request, env, ctx, url) => Response }
// method '*' matches any method; such catch-alls must follow the specific routes.
import { designPageRoute, designPageHeadRoute } from './routes/design-page.js';
import { leadRoute, uploadUrlRoute, leadMethodNotAllowedRoute } from './routes/lead.js';

export const routes = [
  designPageRoute, designPageHeadRoute,
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

    return env.ASSETS.fetch(request);
  },
};
