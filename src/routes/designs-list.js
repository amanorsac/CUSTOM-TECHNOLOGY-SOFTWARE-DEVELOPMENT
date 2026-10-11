// GET /designs: serves the static shop page with every design pre-rendered as a plain linked list inside
// the grid, so crawlers, link previews and no-JS visitors see all twelve concepts. shop.js replaces the
// list with the full cards (grid.replaceChildren), so nothing is doubled.
import { asset, loadDesigns, esc } from './design-page.js';
import { absolutizeHtml } from '../lib/seo.js';

export const designsListRoute = {
  method: 'GET',
  test: (url) => url.pathname === '/designs' || url.pathname === '/designs/',
  async handle(request, env, ctx, url) {
    const [designs, page] = await Promise.all([loadDesigns(env, url), asset(env, url, '/designs.html')]);
    if (!page.ok) return page;
    const list = designs
      .map((d) => `<li class="shop-static"><a href="/designs/${encodeURIComponent(d.slug)}"><b>${esc(d.name)}</b> <span>${esc(d.tagline || '')}</span></a></li>`)
      .join('');
    const filled = new HTMLRewriter()
      .on('[data-design-grid]', { element: (el) => el.setInnerContent(list, { html: true }) })
      .transform(page);
    return absolutizeHtml(filled, url);
  },
};
