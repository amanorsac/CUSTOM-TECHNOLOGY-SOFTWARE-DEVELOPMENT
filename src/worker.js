// Route registry. Later tasks push entries here:
// { method: 'POST', test: (url) => boolean, handle: async (request, env, ctx, url) => Response }
export const routes = [];

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
      if (route.method === request.method && route.test(url)) {
        return route.handle(request, env, ctx, url);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'not_found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
