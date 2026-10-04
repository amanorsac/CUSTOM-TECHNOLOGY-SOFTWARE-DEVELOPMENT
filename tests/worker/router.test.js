import { describe, it, expect } from 'vitest';
import worker from '../../src/worker.js';

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
});
