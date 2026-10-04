import { describe, it, expect } from 'vitest';
import worker, { routes } from '../../src/worker.js';

function makeEnv(body = 'asset-body') {
  const calls = [];
  return {
    calls,
    ASSETS: {
      fetch: async (req) => {
        calls.push(req.url);
        return new Response(body, { status: 200, headers: { 'x-from': 'assets' } });
      },
    },
  };
}

describe('worker router', () => {
  it('GET / returns what env.ASSETS.fetch returns', async () => {
    const env = makeEnv('home');
    const res = await worker.fetch(new Request('https://example.com/'), env, {});
    expect(res.status).toBe(200);
    expect(res.headers.get('x-from')).toBe('assets');
    expect(await res.text()).toBe('home');
    expect(env.calls).toHaveLength(1);
  });

  it('GET /api/nope returns 404 JSON not_found', async () => {
    const env = makeEnv();
    const res = await worker.fetch(new Request('https://example.com/api/nope'), env, {});
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ ok: false, error: 'not_found' });
    expect(env.calls).toHaveLength(0);
  });

  it('dispatches to a registered route, passing url, and skips it on method mismatch', async () => {
    const seen = [];
    const route = {
      method: 'POST',
      test: (url) => url.pathname === '/api/__probe',
      handle: async (request, env, ctx, url) => {
        seen.push({ method: request.method, url });
        return new Response('probe', { status: 201 });
      },
    };
    routes.unshift(route);
    try {
      const env = makeEnv();
      const hit = await worker.fetch(new Request('https://example.com/api/__probe?x=1', { method: 'POST' }), env, {});
      expect(hit.status).toBe(201);
      expect(await hit.text()).toBe('probe');
      expect(seen).toHaveLength(1);
      expect(seen[0].url).toBeInstanceOf(URL);
      expect(seen[0].url.pathname).toBe('/api/__probe');
      expect(seen[0].url.searchParams.get('x')).toBe('1');

      const miss = await worker.fetch(new Request('https://example.com/api/__probe'), env, {});
      expect(miss.status).toBe(404);
      expect(seen).toHaveLength(1);
      expect(env.calls).toHaveLength(0);
    } finally {
      routes.splice(routes.indexOf(route), 1);
    }
  });
});

