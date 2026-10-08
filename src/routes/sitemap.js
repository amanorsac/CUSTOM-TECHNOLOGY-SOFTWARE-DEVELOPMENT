// GET /sitemap.xml and GET /robots.txt, both built from the request origin so
// they work on workers.dev now and on the custom domain later.
import { loadDesigns, esc } from './design-page.js';

const STATIC_PAGES = [
  '/', '/solutions',
  '/industries/business', '/industries/church', '/industries/education', '/industries/nonprofit',
  '/designs', '/demo/', '/about', '/start', '/mockup',
  '/lab/', '/lab/particles', '/lab/workshop', '/lab/gallery', '/lab/playground',
  '/showcase/osteria-lume', '/showcase/juniper-vale',
];

export const sitemapRoute = {
  method: 'GET',
  test: (url) => url.pathname === '/sitemap.xml',
  async handle(request, env, ctx, url) {
    const designs = await loadDesigns(env, url);
    const paths = [
      ...STATIC_PAGES,
      ...designs.filter((d) => d && d.slug).map((d) => `/designs/${encodeURIComponent(d.slug)}`),
    ];
    const body = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + paths.map((p) => `  <url><loc>${esc(new URL(p, url.origin).href)}</loc></url>`).join('\n')
      + '\n</urlset>\n';
    return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
  },
};

export const robotsRoute = {
  method: 'GET',
  test: (url) => url.pathname === '/robots.txt',
  handle(request, env, ctx, url) {
    const body = `User-agent: *\nAllow: /\n\nSitemap: ${url.origin}/sitemap.xml\n`;
    return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
