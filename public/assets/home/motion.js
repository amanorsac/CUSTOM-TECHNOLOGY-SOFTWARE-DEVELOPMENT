// Section motion for the home page (live mode only): the pinned reel with its colour morph, the connected
// system diagram, the sideways journey, the tilting admin frame, industry previews, the process line, the
// drifting integrations and the work lamp on the closing call to action.
import { toVideo, playLoop } from '/assets/home/video.js';
const { gsap, ScrollTrigger } = window;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const WIDE = '(min-width: 1000px)';

export function startMotion({ lenis }) {
  const mm = gsap.matchMedia();
  mm.add(WIDE, () => { reel(lenis); journey(); });
  mm.add('(max-width: 999.98px)', () => { stackedReel(); });
  system(); manage(); industries(); process(); integrations(lenis); lamp(); magnets(); reveals();
  // Measure now, and again once fonts and images have settled the layout. The page counts as ready
  // only after that second measure, since a refresh restores the scroll position it recorded.
  ScrollTrigger.refresh();
  // Failsafe: any entrance whose trigger is already on or above the screen but hasn't played (a stalled
  // or throttled tab) is finished, so no content is ever left invisible.
  const unstick = () => { for (const st of ScrollTrigger.getAll()) { const a = st.animation; if (a && !st.vars.scrub && !st.vars.pin && st.start <= scrollY + innerHeight && a.progress() === 0) a.progress(1); } };
  const settle = () => { ScrollTrigger.refresh(); document.documentElement.dataset.homeMotion = '1'; setTimeout(unstick, 2500); };
  if (document.readyState === 'complete') setTimeout(settle, 300);
  else addEventListener('load', () => setTimeout(settle, 300));
}

// ---- The reel: pinned, one showpiece at a time, the section colours morphing ----
function reel(lenis) {
  const host = $('[data-reel]'), items = $$('.reel__item', host), sec = $('[data-section="featured"]');
  if (items.length < 2) return;
  host.classList.add('is-pinned');
  const media = items.map((it) => $('.reel__media img, .reel__media video', it));
  media.forEach((el) => { el.dataset.manual = '1'; });
  const vids = [];
  let active = -1;
  const show = (i, play = true) => {
    if (i === active) return; active = i;
    // Inactive showpieces stay in the tab order: focusing one scrolls the reel to it (below).
    items.forEach((it, k) => { it.classList.toggle('is-active', k === i); });
    // Look the media up each time: a shared player may have moved to another section meanwhile.
    items.forEach((it, k) => { const el = $('.reel__media img, .reel__media video', it); if (k === i) { if (play) vids[k] = playLoop(el); } else if (el && el.tagName === 'VIDEO' && it.contains(el)) el.pause(); });
    const cs = getComputedStyle(items[i]);
    gsap.to(sec, { '--reel-bg': cs.getPropertyValue('--reel-bg').trim(), '--reel-fg': cs.getPropertyValue('--reel-fg').trim(), duration: 0.8, ease: 'power2.inOut' });
    gsap.fromTo($$('.reel__copy > *', items[i]), { y: 30, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.06, ease: 'expo.out', overwrite: 'auto' });
    gsap.fromTo($('.reel__media', items[i]), { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'expo.out', overwrite: 'auto' });
  };
  const st = ScrollTrigger.create({
    trigger: host, pin: true, start: 'top top', end: `+=${items.length * 40}%`, scrub: true, invalidateOnRefresh: true,
    onUpdate: (s) => show(Math.min(items.length - 1, Math.floor(s.progress * items.length))),
    onLeave: () => { vids.forEach((v) => v && v.pause()); }, onLeaveBack: () => { vids.forEach((v) => v && v.pause()); },
  });
  show(0, false); // set up the first showpiece, but leave its player with the hero until the reel is reached
  // Keyboard users: focusing a link inside a showpiece scrolls the pin to that showpiece.
  host.addEventListener('focusin', (e) => {
    const it = e.target.closest('.reel__item'); if (!it) return;
    const i = items.indexOf(it), y = st.start + (st.end - st.start) * (i + 0.5) / items.length;
    if (Math.abs(scrollY - y) > 4) lenis.scrollTo(y, { duration: 0.8 });
  });
  return () => { host.classList.remove('is-pinned'); items.forEach((it) => it.classList.remove('is-active')); gsap.set(sec, { clearProps: '--reel-bg,--reel-fg' }); };
}
// Phones: the stacked cards simply rise in and play while on screen.
function stackedReel() {
  const items = $$('.reel__item');
  items.forEach((it) => { gsap.from(it, { y: 50, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: it, start: 'top 85%' } }); });
  const io = new IntersectionObserver((entries) => { for (const e of entries) { if (e.isIntersecting) { const v = playLoop(e.target); if (v !== e.target) { io.unobserve(e.target); io.observe(v); } } else if (e.target.tagName === 'VIDEO') e.target.pause(); } });
  items.forEach((it) => io.observe($('.reel__media img, .reel__media video', it)));
  return () => io.disconnect();
}

// ---- What we build: the connected system ----
function system() {
  const svg = $('[data-sys]'), list = $('.strip__list'); if (!svg || !list) return;
  const light = (id, on) => {
    $$('[data-node]', svg).forEach((n) => n.classList.toggle('is-on', on && (n.dataset.node === id || n.dataset.node === 'org')));
    $$('.edge', svg).forEach((e) => e.classList.toggle('is-on', on && (e.dataset.from === id || e.dataset.to === id)));
    $$('li', list).forEach((li) => li.classList.toggle('is-on', on && li.dataset.service === id));
  };
  for (const li of $$('li[data-service]', list)) {
    li.addEventListener('pointerenter', () => light(li.dataset.service, true));
    li.addEventListener('pointerleave', () => light(li.dataset.service, false));
    li.addEventListener('focusin', () => light(li.dataset.service, true));
    li.addEventListener('focusout', () => light(li.dataset.service, false));
    li.tabIndex = 0;
  }
  for (const n of $$('[data-node]:not([data-node="org"])', svg)) {
    n.addEventListener('pointerenter', () => light(n.dataset.node, true));
    n.addEventListener('pointerleave', () => light(n.dataset.node, false));
  }
  // Idle: every few seconds a pulse runs out from the hub along one edge.
  const edges = $$('.edge', svg); let k = 0;
  setInterval(() => { if (svg.matches(':hover')) return; const e = edges[k++ % edges.length]; e.classList.add('is-pulse'); setTimeout(() => e.classList.remove('is-pulse'), 1400); }, 1800);
  gsap.from($$('[data-node]', svg), { scale: 0, transformOrigin: 'center', duration: 0.7, stagger: 0.07, ease: 'back.out(2)', scrollTrigger: { trigger: svg, start: 'top 80%' } });
  gsap.from($$('.edge__line', svg), { drawSVG: undefined, opacity: 0, duration: 0.9, stagger: 0.04, scrollTrigger: { trigger: svg, start: 'top 80%' } });
}

// ---- The journey: pinned, sliding sideways, the centre step lit ----
function journey() {
  const sec = $('.journey-sec'), list = $('[data-journey]'), inner = $('.journey-sec > .container'); if (!sec || !list || !inner) return;
  list.classList.add('journey--live', 'journey--wide');
  const steps = $$('li', list), n = steps.length;
  const dist = () => Math.max(0, list.scrollWidth - sec.clientWidth + 2 * parseFloat(getComputedStyle(inner).paddingLeft));
  let active = -1;
  // The inner container is pinned, not the section, so the section stays a direct child of <main>.
  const tween = gsap.to(list, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: sec, pin: inner, start: 'top top', end: () => `+=${dist() * 0.6 + innerHeight * 0.2}`, scrub: 0.4, invalidateOnRefresh: true,
      onUpdate: (s) => {
        const idx = Math.min(n - 1, Math.floor(s.progress * n));
        if (idx === active) return; active = idx;
        steps.forEach((li, i) => { li.classList.toggle('is-lit', i <= idx); li.classList.toggle('is-active', i === idx); });
        list.style.setProperty('--p', idx / (n - 1));
      },
    },
  });
  return () => { tween.scrollTrigger.kill(); tween.kill(); gsap.set(list, { clearProps: 'all' }); list.classList.remove('journey--live', 'journey--wide'); steps.forEach((li) => li.classList.remove('is-lit', 'is-active')); };
}

// ---- Built for your team: the admin frame tilts with the pointer ----
function manage() {
  const frame = $('[data-tilt]'), sec = $('[data-section="manage"]'); if (!frame) return;
  gsap.set(frame, { transformPerspective: 1200 });
  const rx = gsap.quickTo(frame, 'rotationX', { duration: 0.7, ease: 'power3' }), ry = gsap.quickTo(frame, 'rotationY', { duration: 0.7, ease: 'power3' });
  sec.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = frame.getBoundingClientRect(); ry(((e.clientX - (r.left + r.width / 2)) / innerWidth) * 16); rx(-((e.clientY - (r.top + r.height / 2)) / innerHeight) * 12); });
  sec.addEventListener('pointerleave', () => { rx(0); ry(0); });
  gsap.from(frame, { y: 80, rotationX: 10, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 70%' } });
}

// ---- Industries: a card's loop plays while you hover it ----
function industries() {
  for (const card of $$('.ind-card')) {
    let el = $('[data-ind-video]', card); if (!el) continue;
    el.dataset.manual = '1';
    const media = () => $('[data-ind-video], .ind-card__media video, .ind-card__media img[data-video]', card);
    const play = () => { playLoop(media()); };
    const stop = () => { const v = media(); if (v && v.tagName === 'VIDEO' && card.contains(v)) v.pause(); };
    card.addEventListener('pointerenter', play); card.addEventListener('focus', play);
    card.addEventListener('pointerleave', stop); card.addEventListener('blur', stop);
  }
  // The cards are revealed by the site-wide .reveal observer (with its failsafe), not hidden twice here.
}

// ---- Process: a line draws through the steps and lights each one it reaches ----
function process() {
  const sec = $('[data-section="process"]'), svg = $('.process__line'), path = $('[data-process-line]'), steps = $$('.steps li', sec);
  if (!path) return;
  const place = () => { const ol = $('.steps', sec); svg.style.display = 'block'; svg.style.top = `${ol.offsetTop - 22}px`; };
  place(); addEventListener('resize', place);
  const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
  ScrollTrigger.create({
    trigger: sec, start: 'top 75%', end: 'bottom 60%', scrub: 0.3,
    onUpdate: (s) => {
      path.style.strokeDashoffset = String(L * (1 - s.progress));
      steps.forEach((li, i) => li.classList.toggle('is-on', s.progress >= i / steps.length + 0.02));
    },
  });
}

// ---- Integrations: two rows drift past each other, faster when you scroll ----
function integrations(lenis) {
  const ul = $('.wall'); if (!ul) return;
  const names = $$('li', ul).map((li) => li.textContent.trim());
  const row = (dir) => {
    const r = document.createElement('div'); r.className = 'wall-row'; r.setAttribute('aria-hidden', 'true'); r.dataset.dir = dir;
    const track = document.createElement('div'); track.className = 'wall-track';
    track.innerHTML = names.concat(names).map((n) => `<span>${n.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])}</span>`).join('');
    r.append(track); return { r, track, dir, x: 0 };
  };
  const rows = [row(1), row(-1)];
  ul.classList.add('wall--src');
  ul.after(rows[0].r, rows[1].r);
  let boost = 0;
  gsap.ticker.add((t, dt) => {
    const v = lenis ? lenis.velocity : 0; boost += (Math.min(30, Math.abs(v)) - boost) * 0.08;
    for (const r of rows) {
      const w = r.track.scrollWidth / 2; if (!w) continue;
      r.x -= r.dir * (28 + boost * 10) * (dt / 1000) * (v < 0 ? -1 : 1);
      r.x = ((r.x % w) + w) % w; r.track.style.transform = `translate3d(${-r.x}px,0,0)`;
    }
  });
}

// ---- Closing call to action: the work lamp follows the pointer ----
function lamp() {
  const sec = $('[data-section="cta"]'), l = $('[data-lamp]'); if (!l) return;
  const x = gsap.quickTo(l, 'x', { duration: 0.9, ease: 'power3' }), y = gsap.quickTo(l, 'y', { duration: 0.9, ease: 'power3' });
  sec.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = sec.getBoundingClientRect(); l.classList.add('is-on'); x(e.clientX - r.left); y(e.clientY - r.top); });
  sec.addEventListener('pointerleave', () => l.classList.remove('is-on'));
}
function magnets() {
  for (const el of $$('[data-magnet]')) {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, .45)' }), y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, .45)' });
    el.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.3); y((e.clientY - r.top - r.height / 2) * 0.3); });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  }
}
// Headlines rise out of a blur as their section arrives.
function reveals() {
  for (const h of $$('main > section:not([data-section="hero"]) h2')) {
    gsap.from(h, { y: 40, filter: 'blur(10px)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  }
}
