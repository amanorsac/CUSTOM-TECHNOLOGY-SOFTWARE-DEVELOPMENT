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
    expect(attr(html, /<meta name="twitter:image" content="([^"]*)"/))
      .toBe('https://ctsd.example/images/designs/modern-church/cover.webp');
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html.match(/property="og:title"/g)).toHaveLength(1);
  });

  it('unknown slug: 404 with design.html as the body and noindex', async () => {
    const res = await get('/designs/nope');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('id="design-root"');
    expect(html).toMatch(/<meta name="robots" content="noindex">/);
    expect(html).not.toMatch(/data-slug=/);
    expect(html).not.toMatch(/rel="canonical"/);
    expect(html).not.toMatch(/property="og:url"/);
    expect(attr(html, /<meta property="og:image" content="([^"]*)"/))
      .toBe('https://ctsd.example/images/designs/_placeholder.webp');
    expect(attr(html, /<meta name="twitter:image" content="([^"]*)"/))
      .toBe('https://ctsd.example/images/designs/_placeholder.webp');
  });

  it('trailing slash and nested paths are handled', async () => {
    expect((await get('/designs/modern-church/')).status).toBe(200);
    expect((await get('/designs/modern-church/extra')).status).toBe(404);
  });

  it('HEAD: 200, empty body, HTML content-type', async () => {
    const ctx = createExecutionContext();
    const res = await worker.fetch(new Request('https://ctsd.example/designs/modern-church', { method: 'HEAD' }), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toBe('');
  });

  it('escapes design text in title, description and og/twitter tags', async () => {
    const evil = 'a"><b>&';
    const fake = [{
      slug: 'evil', name: evil, category: 'church', tagline: evil,
      images: { cover: 'images/designs/evil/cover.webp' },
    }];
    const fakeEnv = {
      ASSETS: {
        fetch: (req) => (new URL(req.url).pathname === '/data/designs.json'
          ? new Response(JSON.stringify(fake), { headers: { 'content-type': 'application/json' } })
          : env.ASSETS.fetch(req)),
      },
    };
    const ctx = createExecutionContext();
    const res = await worker.fetch(new Request('https://ctsd.example/designs/evil'), fakeEnv, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(200);
    const html = await res.text();
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).not.toContain('"><b>');
    expect(html).not.toContain('<b>&');
    expect(attr(html, /<title>([^<]*)<\/title>/)).toBe('a"&gt;&lt;b&gt;&amp; — Concept | CTSD'); // text node: a raw quote is safe
    expect(attr(html, /<meta name="description" content="([^"]*)"/)).toBe('a&quot;&gt;&lt;b&gt;&amp;');
    for (const key of ['property="og:title"', 'property="og:description"', 'name="twitter:title"']) {
      expect(attr(html, new RegExp(`<meta ${key} content="([^"]*)"`))).toMatch(/^a&quot;&gt;&lt;b&gt;&amp;/);
    }
  });
});

describe('security headers on HTML responses', () => {
  const expectHeaders = (res) => {
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('content-security-policy')).toBe("frame-ancestors 'none'");
  };

  it('design route (known and unknown slug) sends them', async () => {
    for (const path of ['/designs/modern-church', '/designs/nope']) {
      const res = await get(path);
      expectHeaders(res);
      await res.arrayBuffer();
    }
  });

  it('static HTML pages (home, start, 404) send them via the absolutize pass', async () => {
    for (const path of ['/', '/start', '/no-such-page']) {
      const res = await get(path);
      expect(res.headers.get('content-type')).toContain('text/html');
      expectHeaders(res);
      await res.arrayBuffer();
    }
  });
});
