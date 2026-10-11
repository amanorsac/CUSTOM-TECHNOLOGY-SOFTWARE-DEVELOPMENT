// With SITE_ORIGIN set, canonical links, share URLs and the sitemap use the real domain, whatever address
// the request arrived on (e.g. the workers.dev test address). Unset, they follow the request as before.
import { describe, it, expect } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

async function get(path, extra = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsd-test.workers.dev${path}`), { ...env, ...extra }, ctx);
  await waitOnExecutionContext(ctx);
  return res.text();
}
const SITE = { SITE_ORIGIN: 'https://www.ctsd.example' };

describe('SITE_ORIGIN', () => {
  it('pins canonical and og:url on static pages, the home JSON-LD and design pages', async () => {
    expect(await get('/about', SITE)).toContain('<link rel="canonical" href="https://www.ctsd.example/about">');
    const home = await get('/', SITE);
    expect(home).toContain('"url":"https://www.ctsd.example/"');
    expect(home).not.toContain('workers.dev');
    const design = await get('/designs/modern-church', SITE);
    expect(design).toContain('<link rel="canonical" href="https://www.ctsd.example/designs/modern-church">');
    expect(await get('/designs', SITE)).toContain('<link rel="canonical" href="https://www.ctsd.example/designs">');
  });

  it('pins the sitemap and robots.txt', async () => {
    const xml = await get('/sitemap.xml', SITE);
    expect(xml).toContain('<loc>https://www.ctsd.example/</loc>');
    expect(xml).not.toContain('workers.dev');
    expect(await get('/robots.txt', SITE)).toContain('Sitemap: https://www.ctsd.example/sitemap.xml');
  });

  it('falls back to the request origin when unset', async () => {
    expect(await get('/about')).toContain('<link rel="canonical" href="https://ctsd-test.workers.dev/about">');
  });
});
