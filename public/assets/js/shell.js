// CTSD site shell: header, footer, mobile menu, Industries disclosure,
// scroll state and scroll-reveal. Loaded on every page as an ES module.
// Pages provide <body data-page="<id>">, <div id="site-header"></div> and
// <div id="site-footer"></div>; this file fills them in.

// ---- Navigation data (single source of truth) -------------------------
const NAV = [
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

const SERVICES = [
  { label: 'Websites', href: '/solutions#websites' },
  { label: 'Mobile Apps', href: '/solutions#mobile-apps' },
  { label: 'CRM Systems', href: '/solutions#crm' },
  { label: 'Client Portals', href: '/solutions#portals' },
  { label: 'Automation', href: '/solutions#automation' },
  { label: 'Integrations', href: '/solutions#integrations' },
];

const COMPANY = [
  { label: 'Explore Designs', href: '/designs' },
  { label: 'Live Demo', href: '/demo/' },
  { label: 'CTSD Lab', href: '/lab/' },
  { label: 'About', href: '/about' },
  { label: 'Start a Project', href: '/start' },
];

const INDUSTRIES = NAV.find((n) => n.id === 'industries').children;
const MOBILE = window.matchMedia('(max-width: 959.98px)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const current = (id, page) => (id === page ? ' aria-current="page"' : '');

const CHEVRON = '<svg class="nav-chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function headerHTML(page) {
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

function footerHTML() {
  const list = (arr) => arr.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('');
  const year = new Date().getFullYear();
  return `<footer class="site-footer section--wood">
  <div class="container">
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

// ---- Behaviour -------------------------------------------------------------
function focusables(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
}

function initHeader(root) {
  const header = root.querySelector('[data-header]');
  const toggle = root.querySelector('[data-menu-toggle]');
  const menu = root.querySelector('[data-menu]');
  const subBtn = root.querySelector('[data-sub-toggle]');
  const sub = root.querySelector('[data-industries]');

  const setSub = (open) => {
    subBtn.setAttribute('aria-expanded', String(open));
    sub.hidden = !open;
  };
  const menuOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setMenu = (open, { focusToggle = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    if (!open) setSub(false);
    if (open) focusables(menu)[0]?.focus();
    if (!open && focusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => setMenu(!menuOpen()));
  subBtn.addEventListener('click', () => setSub(subBtn.getAttribute('aria-expanded') !== 'true'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (menuOpen()) { setMenu(false, { focusToggle: true }); return; }
      if (!sub.hidden) { setSub(false); subBtn.focus(); }
      return;
    }
    // Focus trap while the mobile menu is open: toggle + menu contents.
    if (e.key === 'Tab' && menuOpen()) {
      const ring = [toggle, ...focusables(menu)];
      const i = ring.indexOf(document.activeElement);
      if (i === -1) { e.preventDefault(); ring[0].focus(); return; }
      const next = e.shiftKey ? (i - 1 + ring.length) % ring.length : (i + 1) % ring.length;
      e.preventDefault();
      ring[next].focus();
    }
  });

  // Close the desktop dropdown when focus or a click leaves it.
  document.addEventListener('click', (e) => {
    if (!sub.hidden && !subBtn.parentElement.contains(e.target)) setSub(false);
  });
  subBtn.parentElement.addEventListener('focusout', (e) => {
    if (!MOBILE.matches && !subBtn.parentElement.contains(e.relatedTarget)) setSub(false);
  });

  // Leaving mobile layout resets the menu.
  MOBILE.addEventListener('change', () => { if (!MOBILE.matches && menuOpen()) setMenu(false); });

  // Solid at the top; translucent with blur once the page scrolls.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || REDUCED.matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

function ensureSkipLink() {
  if (document.querySelector('.skip-link')) return;
  const a = document.createElement('a');
  a.className = 'skip-link';
  a.href = '#main';
  a.textContent = 'Skip to content';
  document.body.prepend(a);
}

// ANALYTICS: Cloudflare Web Analytics. Paste the site token from the Cloudflare
// dashboard (Web Analytics > your site > Manage site) between the quotes.
// While it is empty nothing loads. It has no custom events, so a lead counts as a
// page view of /thanks?kind=...
const CF_BEACON_TOKEN = '';

function initAnalytics() {
  if (!CF_BEACON_TOKEN) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_BEACON_TOKEN }));
  document.head.appendChild(s);
}

function init() {
  const page = document.body.dataset.page || '';
  ensureSkipLink();
  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');
  if (headerSlot) {
    headerSlot.innerHTML = headerHTML(page);
    initHeader(headerSlot);
  }
  if (footerSlot) footerSlot.innerHTML = footerHTML();
  initReveal();
  initAnalytics();
}

init();
