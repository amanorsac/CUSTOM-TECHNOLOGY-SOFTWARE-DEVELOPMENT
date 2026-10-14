// With SITE_ORIGIN set to the real domain, the www address sends visitors to it permanently,
// keeping the path and query. Other addresses (workers.dev, previews) are left alone.
import { describe, it, expect } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

async function get(href, extra = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(href, { redirect: 'manual' }), { ...env, ...extra }, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}
const SITE = { SITE_ORIGIN: 'https://ctsdstudio.com' };

describe('www redirect', () => {
  it('sends www to the bare domain with a 301, keeping path and query', async () => {
    const res = await get('https://www.ctsdstudio.com/designs/modern-church?ref=card', SITE);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://ctsdstudio.com/designs/modern-church?ref=card');
  });

  it('serves the bare domain normally', async () => {
    expect((await get('https://ctsdstudio.com/about', SITE)).status).toBe(200);
  });

  it('leaves the workers.dev and preview addresses alone', async () => {
    expect((await get('https://custom-technology-software-development.amanorsac.workers.dev/about', SITE)).status).toBe(200);
    expect((await get('https://www.ctsdstudio.com/about')).status).toBe(200);
  });
});
