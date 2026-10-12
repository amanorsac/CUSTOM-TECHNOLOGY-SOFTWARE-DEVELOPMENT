// Design product page. Slug comes from <main data-slug> (set by the Worker on
// /designs/<slug>) or from ?id= on /design.html. Sections render only when the
// design lists images for them, and hide again if every image is missing.
import { findDesign, relatedDesigns, designSections } from './catalog.js';
import { fallbackImg } from './img-fallback.js';
import { designCard, CATEGORY_LABEL } from './design-card.js';

const main = document.getElementById('main');
const root = document.getElementById('design-root');
const $ = (sel, scope = root) => scope.querySelector(sel);
const $$ = (sel, scope = root) => [...scope.querySelectorAll(sel)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

const SECTION_LABEL = { website: 'website', app: 'app', portal: 'portal', admin: 'admin' };

// ---- Thin-line feature icons (24px grid, stroked) -----------------------------
const ICONS = {
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m10.5 9.5 4 2.5-4 2.5Z"/>',
  chat: '<path d="M4 5.5h16v10H9.5L4 19.5Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.8-3 3-4.6 5.5-4.6s4.7 1.6 5.5 4.6M15.5 6.2a3 3 0 0 1 0 5.6M17 14.6c1.8.5 3 1.9 3.5 4.4"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8.5 16v-4M12.5 16V8M16.5 16v-6"/>',
  doc: '<path d="M6.5 3h7l4.5 4.5V21h-11.5Z"/><path d="M13.5 3v4.5H18M9 12h6M9 16h6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-4.5 4 3.5 3-2.5 4 3.5"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.2 2.5 2.5 5-5.2"/>',
};
const ICON_RULES = [
  [/secure|login|permission/i, 'lock'],
  [/giving|payment|tuition|checkout|invoice|deposit|gift card|loyalty/i, 'card'],
  [/sermon|livestream|video/i, 'play'],
  [/prayer|care|message|announcement|logging|email/i, 'chat'],
  [/reminder|notification/i, 'bell'],
  [/event|calendar|schedul|booking|reservation|tour|availability|check-in|sign-up|recital|waitlist/i, 'calendar'],
  [/group|member|directory|roster|profile|contact|staff|volunteer|cohort|teacher|agent/i, 'users'],
  [/campus|propert|neighborhood|listing/i, 'pin'],
  [/dashboard|pipeline|report|progress|tracking|lead/i, 'chart'],
  [/document|file|form|admission|proposal|resource|record|catalog|menu|order|certificate|quiz/i, 'doc'],
  [/search|filter/i, 'search'],
  [/photo|galler|case stud/i, 'image'],
];
const iconFor = (text) => (ICON_RULES.find(([re]) => re.test(text)) || [, 'check'])[1];
const svg = (key) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[key]}</svg>`;

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// ---- Section tones: visible sections alternate cream / wood after the hero ----
function retone() {
  $$('[data-tone]').filter((s) => !s.hidden).forEach((s, i) => {
    const wood = i % 2 === 1;
    s.classList.toggle('section--dark', wood);
    s.classList.toggle('section--ivory', !wood);
  });
}

// ---- Galleries ---------------------------------------------------------------
function browserFrame(img) {
  const f = el('div', 'frame-browser');
  const bar = el('div', 'frame-browser__bar');
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<i></i><i></i><i></i><span></span>';
  const screen = el('div', 'frame-browser__screen');
  screen.append(img);
  f.append(bar, screen);
  return f;
}

function phoneFrame(img) {
  const f = el('div', 'frame-phone');
  const screen = el('div', 'frame-phone__screen');
  screen.append(img);
  f.append(screen);
  return f;
}

function initCarousel(section) {
  const track = $('[data-track]', section);
  const ctrl = $('[data-ctrl]', section);
  if (!ctrl) return () => {};
  const prev = $('[data-prev]', section);
  const next = $('[data-next]', section);

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    ctrl.hidden = max <= 4;
    prev.setAttribute('aria-disabled', String(track.scrollLeft <= 2));
    next.setAttribute('aria-disabled', String(track.scrollLeft >= max - 2));
  };
  const step = (dir) => {
    const slide = track.querySelector('[data-slide]');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const by = slide ? slide.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * by, behavior: REDUCED.matches ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => { if (prev.getAttribute('aria-disabled') !== 'true') step(-1); });
  next.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') step(1); });
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  track.addEventListener('load', update, true);
  update();
  return update;
}

// A gallery section stays hidden until one of its images has actually loaded,
// so missing files never open and then collapse a section (no layout shift).
// Probing starts when the section's position comes within ~1200px of view.
function revealWhenLoaded(section, paths, opts, onReveal) {
  const sentinel = el('div', 'd-sentinel');
  sentinel.setAttribute('aria-hidden', 'true');
  section.before(sentinel);
  const probe = (i) => {
    if (i >= paths.length) { sentinel.remove(); return; }
    fallbackImg({
      ...opts,
      path: paths[i],
      alt: '',
      mode: 'remove',
      lazy: false,
      onRemove: () => probe(i + 1),
      onLoad: () => { sentinel.remove(); onReveal(); },
    });
  };
  if (!('IntersectionObserver' in window)) { probe(0); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); probe(0); }
  }, { rootMargin: '1200px 0px' });
  io.observe(sentinel);
}

function renderGallery(design, key) {
  const section = $(`[data-section="${key}"]`);
  const track = $('[data-track]', section);
  const paths = design.images[key];
  const phone = key === 'app';
  const opts = {
    full: phone ? 1200 : 2400,
    sizes: phone ? '(min-width: 960px) 280px, 64vw' : '(min-width: 1248px) 1000px, 86vw',
    width: phone ? 1200 : 2400,
    height: phone ? 2600 : 1500,
  };
  let update = () => {};
  let revealed = false;

  const onRemove = () => {
    if (!track.querySelector('[data-slide]')) {
      section.hidden = true;
      retone();
    } else {
      update();
    }
  };

  paths.forEach((path, i) => {
    const alt = `${design.name} concept — ${SECTION_LABEL[key]} screen${paths.length > 1 ? ` (${i + 1} of ${paths.length})` : ''}`;
    const img = fallbackImg({ ...opts, path, alt, mode: 'remove', onRemove, lazy: true });
    const slide = el('figure', `d-slide${phone ? ' d-slide--phone' : ''}`);
    slide.dataset.slide = '';
    slide.append(phone ? phoneFrame(img) : browserFrame(img));
    track.append(slide);
  });
  update = initCarousel(section);
  revealWhenLoaded(section, paths, opts, () => {
    if (revealed || !track.querySelector('[data-slide]')) return;
    revealed = true;
    section.hidden = false;
    retone();
    update();
  });
}

// ---- Page --------------------------------------------------------------------
function fill(design, designs) {
  const cat = CATEGORY_LABEL[design.category] || design.category;
  const start = `/start?design=${encodeURIComponent(design.slug)}`;
  const shopCat = `/designs?cat=${encodeURIComponent(design.category)}`;

  document.title = `${design.name} — Concept | CTSD`;
  $('[data-d="name"]').textContent = design.name;
  $('[data-d="tagline"]').textContent = design.tagline;
  $('[data-d="cat"]').textContent = cat;
  const catLink = $('[data-d="cat-link"]');
  catLink.textContent = cat;
  catLink.href = shopCat;
  $('[data-d="more-link"]').href = shopCat;
  $$('[data-d="cta"]').forEach((a) => { a.href = start; });
  // Designs with a live showpiece get a button to it.
  const live = $('[data-d="showcase"]');
  if (live && design.showcase) { live.href = design.showcase; live.hidden = false; }

  $('[data-d="systems"]').replaceChildren(...(design.systems || []).map((s) => el('li', '', s)));

  const portalName = (design.systems || []).find((s) => /portal/i.test(s));
  if (portalName) $('[data-d="portal-name"]').textContent = `The ${portalName.toLowerCase()}: a private place to sign in.`;

  const hero = fallbackImg({
    path: design.images && (design.images.hero || design.images.cover),
    alt: `${design.name} concept — hero screen`,
    full: 2400,
    sizes: '(min-width: 1248px) 640px, (min-width: 960px) 50vw, 92vw',
    mode: 'placeholder',
    priority: true,
    width: 1200,
    height: 800,
  });
  hero.setAttribute('data-hero-img', '');
  $('[data-d="hero"]').replaceChildren(hero);

  for (const key of designSections(design)) renderGallery(design, key);

  $('[data-features]').replaceChildren(...(design.features || []).map((f) => {
    const li = el('li', 'd-feature');
    li.innerHTML = svg(iconFor(f));
    li.append(el('span', '', f));
    return li;
  }));
  const ints = design.integrations || [];
  $('[data-integrations]').replaceChildren(...ints.map((t) => el('li', 'd-chip', t)));
  $('[data-section="integrations"]').hidden = !ints.length;
  $('[data-section="features"]').hidden = !(design.features || []).length;

  const related = relatedDesigns(designs, design, 3);
  $('[data-related]').replaceChildren(...related.map((d) => designCard(d)));
  $('[data-section="related"]').hidden = !related.length;

  retone();
}

// Not found (unknown slug) and load failure share one layout; only the words differ.
function message({ title, heading, lead, action }) {
  document.title = `${title} | CTSD`;
  root.innerHTML = `<section class="d-hero d-missing section--dark" aria-labelledby="d-missing">
  <div class="container d-missing__inner">
    <p class="eyebrow">Explore Designs</p>
    <h1 id="d-missing">${heading}</h1>
    <p class="lead">${lead}</p>
    <div class="d-hero__actions">${action}</div>
  </div>
</section>`;
}

function notFound() {
  message({
    title: 'Design not found',
    heading: 'Design not found',
    lead: 'We could not find that concept. It may have been renamed or retired.',
    action: '<a class="btn btn--primary" href="/designs">Browse all designs <span class="arrow" aria-hidden="true">→</span></a>',
  });
}

function loadFailed() {
  message({
    title: 'Design unavailable',
    heading: 'We couldn&#39;t load this design. Please refresh.',
    lead: 'Something went wrong while loading the design details. Check your connection, then refresh the page.',
    action: '<button type="button" class="btn btn--primary" data-reload>Refresh the page</button>',
  });
  root.querySelector('[data-reload]').addEventListener('click', () => location.reload());
}

async function init() {
  const slug = main.dataset.slug || new URLSearchParams(location.search).get('id') || '';
  let designs;
  try {
    const res = await fetch('/data/designs.json');
    if (!res.ok) throw new Error(String(res.status));
    designs = await res.json();
    if (!Array.isArray(designs)) throw new Error('bad data');
  } catch {
    // A load failure is not an unknown slug: say so, and suggest a refresh.
    loadFailed();
    return;
  }
  const design = slug ? findDesign(designs, slug) : null;
  if (!design) { notFound(); return; }
  fill(design, designs);
}

init();
