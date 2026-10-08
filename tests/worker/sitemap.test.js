import { describe, it, expect } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

async function get(path, init) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsd.example${path}`, init), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}
const attr = (html, re) => (html.match(re) || [])[1];

describe('GET /sitemap.xml', () => {
  it('lists public pages and all designs as absolute URLs, excluding thanks/404', async () => {
    const res = await get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/xml');
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const o = 'https://ctsd.example';
    for (const p of ['/', '/solutions', '/industries/business', '/industries/church',
      '/industries/education', '/industries/nonprofit', '/designs', '/demo/', '/about', '/start', '/mockup',
      '/lab/', '/lab/particles', '/lab/workshop', '/lab/gallery', '/lab/playground']) {
      expect(locs).toContain(o + p);
    }
    expect(locs.filter((l) => l.startsWith(`${o}/designs/`))).toHaveLength(12);
    expect(locs).toContain(`${o}/designs/modern-church`);
    expect(xml).not.toMatch(/thanks|404/);
    expect(new Set(locs).size).toBe(locs.length);
  });
});

describe('GET /robots.txt', () => {
  it('allows all and points at an absolute sitemap', async () => {
    const res = await get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const t = await res.text();
    expect(t).toContain('User-agent: *');
    expect(t).toContain('Allow: /');
    expect(t).toContain('Sitemap: https://ctsd.example/sitemap.xml');
  });
});

describe('absolute head URLs on static HTML', () => {
  it('/, /designs and /about get absolute canonical, og:url, og:image, twitter:image', async () => {
    for (const [path, canon] of [['/', 'https://ctsd.example/'], ['/designs', 'https://ctsd.example/designs'], ['/about', 'https://ctsd.example/about']]) {
      const res = await get(path);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(attr(html, /<link rel="canonical" href="([^"]*)"/)).toBe(canon);
      expect(attr(html, /<meta property="og:image" content="([^"]*)"/)).toBe('https://ctsd.example/assets/brand/og-default.jpg');
      expect(attr(html, /<meta name="twitter:image" content="([^"]*)"/)).toBe('https://ctsd.example/assets/brand/og-default.jpg');
      expect(attr(html, /<meta property="og:url" content="([^"]*)"/)).toBe(canon);
    }
  });

  it('keeps 404 status and HEAD behaviour; passes non-HTML through', async () => {
    const nf = await get('/no-such-page');
    expect(nf.status).toBe(404);
    expect(nf.headers.get('content-type')).toContain('text/html');
    const head = await get('/about', { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(await head.text()).toBe('');
    const json = await get('/data/designs.json');
    expect(json.headers.get('content-type')).toContain('json');
    expect(Array.isArray(await json.json())).toBe(true);
  });
});

describe('JSON-LD', () => {
  it('home has Organization and ProfessionalService with absolute URLs, no priceRange', async () => {
    const html = await (await get('/')).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const types = blocks.map((b) => b['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('ProfessionalService');
    const org = blocks.find((b) => b['@type'] === 'Organization');
    expect(org.url).toBe('https://ctsd.example/');
    expect(org.logo).toMatch(/^https:\/\/ctsd\.example\//);
    expect(org.alternateName).toBe('CTSD');
    expect(JSON.stringify(blocks)).not.toMatch(/priceRange|telephone|address/);
  });

  it('design page has BreadcrumbList Home > Explore Designs > name', async () => {
    const html = await (await get('/designs/modern-church')).text();
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const b = JSON.parse(m[1]);
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement.map((i) => i.item)).toEqual([
      'https://ctsd.example/', 'https://ctsd.example/designs', 'https://ctsd.example/designs/modern-church']);
    expect(b.itemListElement[2].name).toBe('Modern Church Platform');
  });
});
