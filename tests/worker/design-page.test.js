import { describe, it, expect } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

// Uses the pool's real ASSETS binding (configured from wrangler.jsonc), so
// these tests read the actual public/design.html and public/data/designs.json.
async function get(path) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsd.example${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

const attr = (html, re) => (html.match(re) || [])[1];

describe('GET /designs/<slug>', () => {
  it('known slug: 200 HTML with per-design title, meta, og and data-slug', async () => {
    const res = await get('/designs/modern-church');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();

    expect(attr(html, /<title>([^<]*)<\/title>/)).toBe('Modern Church Platform — Concept | CTSD');
    expect(attr(html, /<meta property="og:title" content="([^"]*)"/)).toBe('Modern Church Platform — Concept | CTSD');
    expect(attr(html, /<meta name="description" content="([^"]*)"/))
      .toBe('Website, app, giving and member portal in one connected system.');
    expect(attr(html, /<meta property="og:image" content="([^"]*)"/))
      .toBe('https://ctsd.example/images/designs/modern-church/cover.webp');
    expect(attr(html, /<meta property="og:url" content="([^"]*)"/)).toBe('https://ctsd.example/designs/modern-church');
    expect(attr(html, /<link rel="canonical" href="([^"]*)"/)).toBe('https://ctsd.example/designs/modern-church');
    expect(html).toMatch(/<main[^>]*data-slug="modern-church"/);
    expect(html).not.toContain('noindex');
  });

  it('unknown slug: 404 with design.html as the body and noindex', async () => {
    const res = await get('/designs/nope');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('id="design-root"');
    expect(html).toMatch(/<meta name="robots" content="noindex">/);
    expect(html).not.toMatch(/data-slug=/);
  });

  it('trailing slash and nested paths are handled', async () => {
    expect((await get('/designs/modern-church/')).status).toBe(200);
    expect((await get('/designs/modern-church/extra')).status).toBe(404);
  });

  it('escapes nothing unsafe into attributes for odd slugs', async () => {
    const res = await get('/designs/%22%3E%3Cscript%3E');
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain('<script>"');
  });
});
