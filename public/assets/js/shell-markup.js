// CTSD site shell markup: navigation data and the header and footer HTML. Pure (no DOM), so the worker
// renders it into every page and shell.js reuses it in the browser.

// ---- Navigation data (single source of truth) -------------------------
export const NAV = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'solutions', label: 'Solutions', href: '/solutions' },
  {
    id: 'industries',
    label: 'Industries',
    children: [
      { id: 'business', label: 'Business', href: '/industries/business' },
      { id: 'church', label: 'Church', href: '/industries/church' },
      { id: 'education', label: 'Education', href: '/industries/education' },
      { id: 'nonprofit', label: 'Nonprofit', href: '/industries/nonprofit' },
    ],
  },
  { id: 'designs', label: 'Explore Designs', href: '/designs' },
  { id: 'demo', label: 'Live Demo', href: '/demo/' },
  { id: 'lab', label: 'Lab', href: '/lab/' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'start', label: 'Start a Project', href: '/start', cta: true },
];

export const SERVICES = [
  { label: 'Websites', href: '/solutions#websites' },
  { label: 'Mobile Apps', href: '/solutions#mobile-apps' },
  { label: 'CRM Systems', href: '/solutions#crm' },
  { label: 'Client Portals', href: '/solutions#portals' },
  { label: 'Automation', href: '/solutions#automation' },
  { label: 'Integrations', href: '/solutions#integrations' },
];

export const COMPANY = [
  { label: 'Explore Designs', href: '/designs' },
  { label: 'Live Demo', href: '/demo/' },
  { label: 'CTSD Lab', href: '/lab/' },
  { label: 'About', href: '/about' },
  { label: 'Start a Project', href: '/start' },
];

export const INDUSTRIES = NAV.find((n) => n.id === 'industries').children;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const current = (id, page) => (id === page ? ' aria-current="page"' : '');

const CHEVRON = '<svg class="nav-chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function headerHTML(page) {
  const items = NAV.map((item) => {
    if (item.children) {
      const inSection = item.children.some((c) => c.id === page);
      const links = item.children
        .map((c) => `<li><a href="${c.href}"${current(c.id, page)}>${esc(c.label)}</a></li>`)
        .join('');
      return `<li class="nav-item has-sub${inSection ? ' is-current' : ''}">`
        + `<button type="button" class="nav-link nav-sub-toggle" aria-expanded="false" aria-controls="nav-industries" data-sub-toggle>${esc(item.label)}${CHEVRON}</button>`
        + `<ul class="nav-sub" id="nav-industries" data-industries hidden>${links}</ul></li>`;
    }
    if (item.cta) {
      return `<li class="nav-item nav-cta"><a class="btn btn--primary btn--sm" href="${item.href}"${current(item.id, page)}>${esc(item.label)}</a></li>`;
    }
    return `<li class="nav-item"><a class="nav-link" href="${item.href}"${current(item.id, page)}>${esc(item.label)}</a></li>`;
  }).join('');

  return `<header class="site-header" data-header>
  <div class="site-header__bar">
    <a class="brand" href="/"><img src="/assets/brand/logo-horizontal-reverse.svg" alt="Custom Technology &amp; Software Development, home" width="146" height="42"></a>
    <button type="button" class="menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="site-menu">
      <span class="menu-toggle__label">Menu</span><span class="menu-toggle__icon" aria-hidden="true"><span></span><span></span></span>
    </button>
    <div class="site-menu" id="site-menu" data-menu>
      <nav class="site-nav" aria-label="Primary"><ul class="nav-list" data-nav-list>${items}</ul></nav>
    </div>
  </div>
</header>`;
}

export function footerHTML(year = new Date().getFullYear()) {
  const list = (arr) => arr.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('');
  return `<footer class="site-footer section--dark">
  <div class="site-footer__lamp" data-foot-lamp aria-hidden="true"></div>
  <div class="container">
    <p class="site-footer__big">Let's build <em>yours.</em></p>
    <div class="site-footer__top">
      <div class="site-footer__brand">
        <img src="/assets/brand/logo-horizontal-reverse.svg" alt="Custom Technology &amp; Software Development" width="195" height="56" loading="lazy">
        <p class="site-footer__tagline">Technology built around your organization.</p>
        <a class="btn btn--ghost" href="/mockup">Get a free mockup</a>
      </div>
      <nav class="site-footer__cols" aria-label="Footer">
        <div><h2 class="eyebrow">Services</h2><ul>${list(SERVICES)}</ul></div>
        <div><h2 class="eyebrow">Industries</h2><ul>${list(INDUSTRIES)}</ul></div>
        <div><h2 class="eyebrow">Studio</h2><ul>${list(COMPANY)}</ul></div>
      </nav>
    </div>
    <div class="site-footer__base">
      <p>© ${year} CTSD · Custom Technology &amp; Software Development</p>
      <p><a href="/privacy">Privacy policy</a></p>
    </div>
  </div>
</footer>`;
}
