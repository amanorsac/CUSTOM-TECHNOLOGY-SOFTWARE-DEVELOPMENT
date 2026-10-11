// CTSD site shell: header, footer, mobile menu, Industries disclosure,
// scroll state and scroll-reveal. Loaded on every page as an ES module.
// Pages provide <body data-page="<id>">, <div id="site-header"></div> and
// <div id="site-footer"></div>. The worker usually renders them (shell-markup.js); this file fills them in
// only if it didn't, and wires up the behaviour.

import { headerHTML, footerHTML } from './shell-markup.js';

const MOBILE = window.matchMedia('(max-width: 959.98px)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  // Solid at the top; translucent with blur once the page scrolls. Past the first screen the header
  // steps out of the way while you scroll down and returns the moment you scroll up (never while the
  // menu is open, while it holds focus, or under reduced motion).
  let ticking = false;
  let lastY = window.scrollY;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const canHide = !REDUCED.matches && !menuOpen() && !header.contains(document.activeElement);
      if (y <= window.innerHeight || y < lastY - 2) header.classList.remove('is-hidden');
      else if (canHide && y > lastY + 2) header.classList.add('is-hidden');
      if (Math.abs(y - lastY) > 2) lastY = y;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  onScroll();

  // The "Start a Project" button leans toward the pointer.
  magnet(root.querySelector('.nav-cta .btn'));
}

// A button that follows the pointer a little while it is hovered, then springs back.
function magnet(el) {
  if (!el || REDUCED.matches) return;
  el.classList.add('is-magnet');
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
}

// The footer's warm lamp follows the pointer across the sign-off.
function initFooter(root) {
  const footer = root.querySelector('.site-footer'), lamp = root.querySelector('[data-foot-lamp]');
  if (!footer || !lamp || REDUCED.matches) return;
  footer.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = footer.getBoundingClientRect();
    lamp.classList.add('is-on');
    lamp.style.transform = `translate(${Math.round(e.clientX - r.left)}px, ${Math.round(e.clientY - r.top)}px)`;
  });
  footer.addEventListener('pointerleave', () => lamp.classList.remove('is-on'));
  magnet(footer.querySelector('.site-footer__big ~ .site-footer__top .btn'));
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || REDUCED.matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('reveal-on');
  let fired = false;
  const io = new IntersectionObserver((entries) => {
    fired = true;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((el) => io.observe(el));
  // Failsafe: if the observer never reports (a stalled or throttled tab), show everything rather than
  // leave content invisible.
  setTimeout(() => { if (!fired) { io.disconnect(); els.forEach((el) => el.classList.add('is-visible')); } }, 2500);
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
  // The worker usually sends the header and footer already in the HTML; fill them only if it didn't.
  if (headerSlot) {
    if (!headerSlot.querySelector('[data-header]')) headerSlot.innerHTML = headerHTML(page);
    initHeader(headerSlot);
  }
  if (footerSlot) {
    if (!footerSlot.querySelector('.site-footer')) footerSlot.innerHTML = footerHTML();
    initFooter(footerSlot);
  }
  initReveal();
  initAnalytics();
}

init();
