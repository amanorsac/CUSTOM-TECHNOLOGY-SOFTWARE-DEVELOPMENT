// Home page: featured design tiles (from designs.json) and the journey
// highlight. The hero and admin images are armed through img-fallback so a
// missing file leaves the CSS composition underneath in place.
import { fallbackImg, armStaticImg } from './img-fallback.js';
import { CATEGORY_LABEL } from './design-card.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---- Mock screens shown until (or instead of) a cover image ---------------
// Decorative only: the whole stage is aria-hidden.
const SITE = {
  church: { kick: 'Sundays 9 &amp; 11 AM', head: 'A place to belong.', a: 'Plan a visit', b: 'Watch live', art: '<span class="m-arch"></span>', app: 'Sunday Service', pill: 'Join live' },
  education: { kick: 'Admissions open', head: 'Where curious minds grow.', a: 'Book a tour', b: 'Apply', art: '<span class="m-sun"></span><span class="m-books"><i></i><i></i><i></i></span>', app: 'Parent conferences', pill: 'Book a slot' },
  business: { kick: 'Strategy and operations', head: 'Clear advice. Real results.', a: 'Book a consult', b: 'Our work', art: '<span class="m-rise"><i></i><i></i><i></i><i></i></span>', app: 'Kickoff call', pill: 'Confirm' },
};

function siteMock(d) {
  const s = SITE[d.category] || SITE.business;
  const short = esc(d.name.split(' ').slice(0, 2).join(' '));
  const cards = (d.features || []).slice(0, 3)
    .map((f) => `<span class="m-card"><i></i><b>${esc(f)}</b><span class="m-line"></span></span>`).join('');
  return `<div class="h-frame"><div class="h-frame__bar"><i></i><i></i><i></i><span></span></div>
  <div class="h-frame__view" data-shot>
    <div class="m-site m-site--${esc(d.category)}">
      <div class="m-nav"><span class="m-logo"><i></i>${short}</span><span class="m-links"><i></i><i></i><i></i><i></i></span><span class="m-btn">${s.a}</span></div>
      <div class="m-hero"><div class="m-hero__copy"><span class="m-kick">${s.kick}</span><b class="m-h">${s.head}</b>
        <span class="m-line"></span><span class="m-line m-line--short"></span>
        <span class="m-ctas"><span class="m-btn">${s.a}</span><span class="m-btn m-btn--ghost">${s.b}</span></span></div>
        <div class="m-hero__art">${s.art}</div></div>
      <div class="m-cards">${cards}</div>
    </div>
  </div></div>
  <div class="tile__phone dev-phone"><div class="m-app m-app--${esc(d.category)}">
    <span class="m-app__bar"><b>${short}</b><i></i></span>
    <span class="m-app__card"><small>Next up</small><b>${s.app}</b><span class="m-app__pill">${s.pill}</span></span>
    <span class="m-app__row"><i></i><span class="m-line"></span></span><span class="m-app__row"><i></i><span class="m-line"></span></span><span class="m-app__row"><i></i><span class="m-line"></span></span>
    <span class="m-app__tabs"><i></i><i></i><i></i><i></i></span>
  </div></div>`;
}

function adminMock(d) {
  return `<div class="h-frame"><div class="h-frame__bar"><i></i><i></i><i></i><span></span></div>
  <div class="h-frame__view" data-shot><div class="m-admin">
    <div class="m-side"><span class="m-logo"><i></i>${esc(d.name.split(' ')[0])}</span>
      <span class="is-on"><i></i>Dashboard</span><span><i></i>Contacts</span><span><i></i>Pipeline</span><span><i></i>Tasks</span><span><i></i>Reports</span></div>
    <div class="m-main">
      <div class="m-top"><b>Pipeline overview</b><span class="m-search"></span></div>
      <div class="m-stats">
        <span class="m-stat"><small>Contacts</small><b>2,481</b><em>+64</em></span>
        <span class="m-stat"><small>Open deals</small><b>64</b><em>+9%</em></span>
        <span class="m-stat"><small>Tasks due</small><b>9</b><em>today</em></span>
      </div>
      <div class="m-chart"><small>Deals won, last 6 months</small>
        <svg viewBox="0 0 300 80" preserveAspectRatio="none"><path class="m-chart__area" d="M0 66 L50 58 L100 60 L150 40 L200 34 L250 22 L300 12 L300 80 L0 80Z"/><path class="m-chart__line" d="M0 66 L50 58 L100 60 L150 40 L200 34 L250 22 L300 12"/></svg></div>
      <div class="m-table">
        <span><i></i><b>Harbor Dental</b><em class="ok">Won</em></span>
        <span><i></i><b>Northside Group</b><em>Proposal</em></span>
        <span><i></i><b>Elm Street Clinic</b><em>Discovery</em></span>
      </div>
    </div>
  </div></div></div>`;
}

// ---- Featured tiles ---------------------------------------------------------
function tile(d, i) {
  const wood = i % 2 === 0;
  const art = document.createElement('article');
  art.className = `tile ${wood ? 'section--wood tile--wood' : 'section--cream tile--cream'}`;
  art.setAttribute('aria-labelledby', `tile-${d.slug}`);
  const slug = encodeURIComponent(d.slug);
  const name = esc(d.name);
  art.innerHTML = `<div class="tile__in container">
    <p class="tile__kick"><span>${esc(CATEGORY_LABEL[d.category] || d.category)}</span><span class="badge-concept">Concept</span></p>
    <h3 class="tile__title" id="tile-${esc(d.slug)}">${name}</h3>
    <p class="tile__tagline">${esc(d.tagline)}</p>
    <p class="tile__links">
      <a href="/designs/${slug}">View design<span class="sr-only">: ${name}</span><span class="chev" aria-hidden="true">›</span></a>
      <a href="/start?design=${slug}">Build something like this<span class="sr-only">: ${name}</span><span class="chev" aria-hidden="true">›</span></a>
    </p>
  </div>
  <div class="tile__stage tile__stage--${d.category === 'software' ? 'admin' : 'site'}" aria-hidden="true">
    ${d.category === 'software' ? adminMock(d) : siteMock(d)}
  </div>`;

  // The cover replaces the mock screen once it loads; if it is missing the
  // image is removed and the mock stays (no generic placeholder on the home page).
  const stage = art.querySelector('.tile__stage');
  const cover = d.images && d.images.cover;
  if (cover) {
    const holder = document.createElement('div');
    holder.className = 'tile__shot';
    holder.dataset.slide = '';
    holder.append(fallbackImg({
      path: cover,
      alt: '',
      full: 1200,
      sizes: '(min-width: 1100px) 1000px, 92vw',
      mode: 'remove',
      lazy: true,
      width: 1200,
      height: 800,
      onLoad: () => stage.classList.add('has-shot'),
    }));
    art.querySelector('[data-shot]').append(holder);
  }
  return art;
}

async function renderFeatured() {
  const root = document.querySelector('[data-featured]');
  if (!root) return;
  let designs = [];
  try {
    const res = await fetch('/data/designs.json');
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    designs = (Array.isArray(data) ? data : data.designs || []).filter((d) => d.featured);
  } catch {
    root.innerHTML = '<p class="container featured__noscript"><a href="/designs">Browse the concept designs</a></p>';
    return;
  }
  const frag = document.createDocumentFragment();
  designs.forEach((d, i) => frag.append(tile(d, i)));
  root.append(frag);

  if (REDUCED.matches || !('IntersectionObserver' in window)) return;
  root.classList.add('tiles--anim');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  root.querySelectorAll('.tile').forEach((t) => io.observe(t));
}

// ---- Journey: highlight the step that matches scroll progress ---------------
function initJourney() {
  const list = document.querySelector('[data-journey]');
  if (!list || REDUCED.matches) return; // reduced motion: a plain static list
  const steps = [...list.children];
  list.classList.add('journey--live');
  let active = -2;
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const tops = steps.map((li) => li.getBoundingClientRect().top);
    let idx;
    if (tops[tops.length - 1] - tops[0] < 10) {
      // One row: progress runs from the list entering at 85% of the
      // viewport to reaching 30%, and walks along the row.
      const p = (vh * 0.85 - tops[0]) / (vh * 0.55);
      idx = p <= 0 ? -1 : Math.min(steps.length - 1, Math.floor(p * steps.length));
    } else {
      // Stacked (tablet grid or phone timeline): the last step past 70%.
      idx = tops.reduce((last, t, i) => (t < vh * 0.7 ? i : last), -1);
    }
    if (idx === active) return;
    active = idx;
    steps.forEach((li, i) => {
      li.classList.toggle('is-lit', i <= idx);
      li.classList.toggle('is-active', i === idx);
    });
    list.style.setProperty('--p', idx < 0 ? 0 : idx / (steps.length - 1));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

armStaticImg(document.querySelector('.hero__img'), {
  onLoad: (img) => img.closest('.hero__art').classList.add('has-img'),
});
armStaticImg(document.querySelector('.manage__img'), {
  onLoad: (img) => img.closest('.h-frame').classList.add('has-img'),
});
initJourney();
renderFeatured();
