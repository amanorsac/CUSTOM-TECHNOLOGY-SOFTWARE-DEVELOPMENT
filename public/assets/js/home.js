// Home page: renders the showpiece reel (reel-data.js + designs.json), keeps the journey highlight, and in
// live mode boots the workshop wall (WebGL hero) and the section motion from /assets/home/.
import { armStaticImg } from './img-fallback.js';
import { REEL } from '/assets/home/reel-data.js';
import { playLoop } from '/assets/home/video.js';

const root = document.documentElement;
const LIVE = root.classList.contains('home-live');
const GL = !root.classList.contains('home-nogl');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---- The reel ---------------------------------------------------------------
function reelItem(r, d, i) {
  const art = document.createElement('article');
  art.className = 'reel__item';
  art.dataset.slug = r.slug;
  art.setAttribute('aria-labelledby', `reel-${r.slug}`);
  art.style.setProperty('--reel-bg', r.palette.bg);
  art.style.setProperty('--reel-fg', r.palette.fg);
  art.style.setProperty('--reel-accent', r.palette.accent);
  const design = encodeURIComponent(r.design), name = esc(d ? d.name : r.industry);
  art.innerHTML = `<div class="container reel__grid">
    <div class="reel__copy">
      <p class="reel__kick"><span class="reel__n" aria-hidden="true">0${i + 1}</span><span>${esc(r.industry)}</span><span class="badge-concept">Concept</span></p>
      <h3 class="reel__title" id="reel-${esc(r.slug)}">${name}</h3>
      <p class="reel__brand">${esc(r.brand)}${d ? ` · ${esc(d.tagline)}` : ''}</p>
      <ul class="reel__highlights" role="list">${r.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      <p class="reel__links">
        <a class="btn btn--primary" href="/showcase/${esc(r.slug)}">Open live showpiece<span class="sr-only">: ${name}</span> <span class="arrow" aria-hidden="true">→</span></a>
        <a class="btn btn--ghost" href="/designs/${design}">See the design<span class="sr-only">: ${name}</span></a>
        <a class="reel__build" href="/start?design=${design}">Build something like this<span class="sr-only">: ${name}</span><span class="chev" aria-hidden="true">›</span></a>
      </p>
    </div>
    <a class="reel__media" href="/showcase/${esc(r.slug)}" tabindex="-1" aria-hidden="true">
      <img src="/assets/home/loops/${esc(r.slug)}.webp" data-video="/assets/home/loops/${esc(r.slug)}.mp4" width="640" height="400" loading="lazy" decoding="async" alt="">
    </a>
  </div>`;
  return art;
}

async function renderReel() {
  const host = document.querySelector('[data-reel]');
  if (!host) return;
  let bySlug = {};
  try {
    const res = await fetch('/data/designs.json');
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    bySlug = Object.fromEntries((Array.isArray(data) ? data : data.designs || []).map((d) => [d.slug, d]));
  } catch { /* names fall back to the industry label */ }
  const frag = document.createDocumentFragment();
  REEL.forEach((r, i) => frag.append(reelItem(r, bySlug[r.design], i)));
  host.append(frag);
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
  // Content above the journey (the reel) renders after load and shifts it; re-measure when the page grows.
  if ('ResizeObserver' in window) new ResizeObserver(onScroll).observe(document.body);
  update();
}

// ---- Videos: load when near, play only while visible ------------------------
// Every loop starts with preload="none" and a data-src; the src is assigned the first time it comes
// within a screen of the viewport, and the video plays only while it is on screen.
function lazyVideos(scope = document) {
  const els = [...scope.querySelectorAll('img[data-video]:not([data-manual])')];
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { const v = playLoop(e.target); if (v !== e.target) { io.unobserve(e.target); io.observe(v); } }
      else if (e.target.tagName === 'VIDEO') e.target.pause();
    }
  }, { rootMargin: '60% 0px' });
  els.forEach((el) => io.observe(el));
}

// ---- Boot -------------------------------------------------------------------
armStaticImg(document.querySelector('.manage__img'), {
  onLoad: (img) => img.closest('.h-frame').classList.add('has-img'),
});
// On wide live screens motion.js pins the journey and lights it by scroll progress; otherwise the
// scroll-position highlight below does the job (and reduced motion keeps it a plain list).
if (!LIVE || innerWidth < 1000) initJourney();
const reelReady = renderReel();

if (LIVE) {
  lazyVideos(document.querySelector('[data-section="lab"]'));
  // GSAP and Lenis are deferred classic scripts; modules run after they have parsed.
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new window.Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const t = document.querySelector(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { duration: 1.4 }); }));

  // The hero pin is created now, in document order, so the pins that follow measure the page as it
  // really is. The WebGL wall arrives later and simply takes over the dolly from the still.
  const copy = document.querySelector('[data-hero-copy]');
  let wall = null;
  ScrollTrigger.create({
    trigger: '[data-hero]', pin: '.hero__stick', start: 'top top', end: '+=160%', scrub: true,
    onUpdate: (s) => {
      const p = s.progress;
      if (wall) wall.setDolly(p); else gsap.set('.hero__img', { scale: 1 + p * 0.25 });
      gsap.set(copy, { opacity: 1 - Math.min(1, p * 2.5), y: -p * 90, filter: `blur(${Math.min(8, p * 20)}px)` });
      gsap.set('.hero__scroll', { opacity: Math.max(0, 1 - p * 5) });
    },
  });
  if (GL) {
    import('/assets/home/wall.js').then((m) => {
      wall = m.bootWall();
      if (wall) { let last = performance.now() / 1000; gsap.ticker.add(() => { const t = performance.now() / 1000, dt = Math.min(0.05, t - last); last = t; wall.tick(t, dt); }); }
    }).catch(() => { root.classList.add('home-nogl'); stillWall(); });
  } else stillWall();
  // The section motion starts once the reel exists, so its pin measures the real content.
  reelReady.then(() => import('/assets/home/motion.js')).then((m) => m.startMotion({ lenis })).catch(() => {});
}

// No WebGL: the four screens play as videos over the still, without downloading three.js at all.
function stillWall() {
  const vids = [...document.querySelectorAll('[data-wall-screens] img[data-video]')].map((img) => { img.dataset.manual = '1'; return playLoop(img); });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }
  });
  vids.forEach((v) => io.observe(v));
}
