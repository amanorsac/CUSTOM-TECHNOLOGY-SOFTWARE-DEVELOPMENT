// Juniper & Vale: orchestration. Sketch preloader → hero → numbers → draggable listings that expand into
// detail → 3D floor plan → before/after → 3D neighborhood flyover → mortgage odometer → agents.
import { ROOMS, PLAN_W, PLAN_H } from './plan-data.js';
import { AREAS } from './areas.js';

const root = document.documentElement;
const LIVE = root.classList.contains('jv-live');
const MOBILE = matchMedia('(max-width: 860px), (pointer: coarse)').matches;
const DPR = Math.min(2, devicePixelRatio || 1);
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = '/assets/showcase/juniper-vale/img/';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

const HOMES = [
  { id: 'linden', title: '18 Linden Court', area: 'Mountain Views', price: 685000, beds: 3, baths: 2, sqft: 1840, built: 2019, agent: ['Avery Lin', 'AL'], img: 'home-linden', text: 'Cedar siding, a deep porch and a wall of glass onto the woods. The open living room faces west for long golden evenings.' },
  { id: 'harbor', title: '7 Harbor Row', area: 'Coastal Living', price: 542500, beds: 2, baths: 2, sqft: 1210, built: 2016, agent: ['Sarah Jenkins', 'SJ'], img: 'home-harbor', text: 'A bright corner home three streets from the marina, with a sunset terrace and a kitchen built for long dinners.' },
  { id: 'ridge', title: '302 Ridge Lane', area: 'Mountain Views', price: 910000, beds: 4, baths: 3, sqft: 2650, built: 2021, agent: ['Avery Lin', 'AL'], img: 'home-ridge', text: 'Four bedrooms on a quiet, tree-lined lane, with a trailhead at the end of the street and room for everyone.' },
  { id: 'maple', title: '324 Maple Terrace', area: 'Coastal Living', price: 1250000, beds: 3, baths: 2.5, sqft: 2400, built: 2022, agent: ['Sarah Jenkins', 'SJ'], img: 'home-maple', text: 'Clean lines, ocean light and an outdoor room that opens the whole ground floor to the garden.' },
  { id: 'oak', title: '145 Oak Lane', area: 'Urban Core', price: 980000, beds: 2, baths: 2, sqft: 1800, built: 2018, agent: ['David Chen', 'DC'], img: 'home-oak', text: 'A loft-style home a block from the cafés, with double-height windows and a private roof garden.' },
  { id: 'cedar', title: '278 Cedar Grove', area: 'Urban Core', price: 895000, beds: 2, baths: 2, sqft: 1650, built: 2015, agent: ['David Chen', 'DC'], img: 'home-cedar', text: 'A calm, light-filled home on a leafy street, with a chef’s kitchen and walking distance to everything.' },
];
let mode = 'buy';
const priceOf = (h) => (mode === 'buy' ? money(h.price) : `${money(Math.round(h.price / 230 / 25) * 25)}/mo`);

// ---------------------------------------------------------------- listings rail
function buildRail(list = HOMES) {
  const rail = $('[data-rail]');
  rail.innerHTML = list.map((h) => `<button type="button" class="jv-card" role="listitem" data-home="${h.id}" aria-label="${esc(h.title)}, ${esc(h.area)}, ${esc(priceOf(h))}">
    <div class="jv-card__media"><img src="${IMG}${h.img}.webp" alt="" role="presentation" draggable="false" loading="lazy"><span class="jv-card__tag">${esc(h.area)}</span></div>
    <h3>${esc(h.title)}</h3><p>${h.beds} bd · ${h.baths} ba · ${h.sqft.toLocaleString('en-US')} sq ft</p><span class="jv-card__price">${esc(priceOf(h))}</span></button>`).join('');
  railX = 0; railV = 0;
}
let railX = 0, railV = 0, dragging = false;
function railBehaviour() {
  const rail = $('[data-rail]'), bar = $('[data-railbar]');
  const max = () => Math.max(0, rail.scrollWidth - rail.parentElement.clientWidth);
  let startX = 0, startRail = 0, lastX = 0, lastT = 0, moved = 0, downCard = null;
  rail.addEventListener('pointerdown', (e) => { downCard = e.target.closest('.jv-card'); dragging = true; moved = 0; startX = lastX = e.clientX; startRail = railX; lastT = performance.now(); rail.setPointerCapture(e.pointerId); });
  rail.addEventListener('pointermove', (e) => {
    if (!dragging) return; const now = performance.now();
    railX = startRail + (e.clientX - startX); railV = (e.clientX - lastX) / Math.max(1, now - lastT) * 16; lastX = e.clientX; lastT = now;
    moved = Math.max(moved, Math.abs(e.clientX - startX));
  });
  const end = () => { dragging = false; };
  rail.addEventListener('pointerup', end); rail.addEventListener('pointercancel', end);
  rail.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; return; } const c = e.target.closest('.jv-card') || downCard; downCard = null; if (c) openHome(c); }, true);
  rail.addEventListener('focusin', (e) => { const c = e.target.closest('.jv-card'); if (!c) return; const r = c.getBoundingClientRect(), vw = rail.parentElement.clientWidth; if (r.left < 0 || r.right > vw) railX = Math.max(-max(), Math.min(0, railX - (r.left - vw * 0.1))); });
  gsap.ticker.add(() => {
    if (!dragging) { railX += railV; railV *= 0.93; }
    const m = max();
    if (railX > 0) railX += (0 - railX) * 0.15; if (railX < -m) railX += (-m - railX) * 0.15;
    rail.style.transform = `translate3d(${railX}px,0,0)`;
    bar.style.width = `${(m ? (-railX / m) : 0) * 80 + 20}%`;
    // each photo drifts inside its frame with the rail
    const vw = innerWidth;
    for (const img of rail.querySelectorAll('.jv-card__media img')) { const r = img.parentElement.getBoundingClientRect(); const k = (r.left + r.width / 2 - vw / 2) / vw; img.style.transform = `translate3d(${-k * 9}%,0,0)`; }
  });
}

// ---------------------------------------------------------------- home detail (card photo grows to full screen)
let openCard = null;
function openHome(card) {
  const h = HOMES.find((x) => x.id === card.dataset.home), dlg = $('[data-detail]');
  $('[data-detail-img]').src = `${IMG}${h.img}.webp`; $('[data-detail-img]').alt = `${h.title} exterior`;
  $('[data-detail-area]').textContent = h.area; $('[data-detail-title]').textContent = h.title;
  $('[data-detail-text]').textContent = h.text; $('[data-detail-agent]').textContent = h.agent[0]; $('[data-detail-mono]').textContent = h.agent[1];
  $('[data-detail-facts]').innerHTML = [[h.beds, 'Bedrooms'], [h.baths, 'Baths'], [h.sqft.toLocaleString('en-US'), 'Square feet'], [h.built, 'Built']].map(([b, s]) => `<div><b>${esc(b)}</b><span>${s}</span></div>`).join('');
  const price = $('[data-detail-price]');
  dlg.classList.add('is-open'); dlg.scrollTop = 0; openCard = card; lenis?.stop();
  $('[data-detail-close]').focus();
  if (!LIVE) { price.textContent = priceOf(h); return; }
  const r = card.querySelector('.jv-card__media').getBoundingClientRect();
  gsap.timeline()
    .fromTo('[data-detail-media]', { clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)` }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'expo.inOut' })
    .fromTo(dlg, { backgroundColor: 'rgba(244,241,236,0)' }, { backgroundColor: 'rgba(244,241,236,1)', duration: 0.6 }, 0)
    .fromTo('.jv-detail__body > *', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 0.55);
  const o = { v: mode === 'buy' ? h.price * 0.6 : 0 };
  gsap.to(o, { v: h.price, duration: 1.4, delay: 0.6, ease: 'expo.out', onUpdate: () => { price.textContent = mode === 'buy' ? money(o.v) : priceOf(h); } });
}
function closeHome() {
  const dlg = $('[data-detail]'); if (!dlg.classList.contains('is-open')) return;
  const done = () => { dlg.classList.remove('is-open'); lenis?.start(); openCard?.focus(); };
  if (!LIVE || !openCard) return done();
  const r = openCard.querySelector('.jv-card__media').getBoundingClientRect();
  gsap.timeline({ onComplete: done })
    .to('.jv-detail__body > *', { y: 40, opacity: 0, duration: 0.3 })
    .to('[data-detail-media]', { clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`, duration: 0.8, ease: 'expo.inOut' }, 0.1)
    .to(dlg, { backgroundColor: 'rgba(244,241,236,0)', duration: 0.5 }, 0.4);
}

// ---------------------------------------------------------------- search
function search() {
  const form = $('[data-search]');
  $$('[role="radio"]', form).forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode; $$('[role="radio"]', form).forEach((x) => x.setAttribute('aria-checked', String(x === b))); buildRail(currentList);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#q').value.trim().toLowerCase();
    const hits = HOMES.filter((h) => !q || `${h.title} ${h.area}`.toLowerCase().includes(q));
    currentList = hits.length ? hits : HOMES;
    buildRail(currentList);
    $('#homes-title').setAttribute('data-results', hits.length ? '' : 'none');
    (lenis ? (t) => lenis.scrollTo(t, { duration: 1.6 }) : (t) => t.scrollIntoView())($('#homes'));
  });
}
let currentList = HOMES;

// ---------------------------------------------------------------- still floor plan drawing
function planSVG() {
  const s = 10, svg = $('[data-plan-svg]');
  svg.innerHTML = ROOMS.map((r) => `<rect x="${r.x * s}" y="${r.y * s}" width="${r.w * s}" height="${r.h * s}" fill="#f6f3ee" stroke="#141414" stroke-width="3"/><text x="${(r.x + r.w / 2) * s}" y="${(r.y + r.h / 2) * s}" text-anchor="middle" dominant-baseline="middle" font-family="Manrope, sans-serif" font-size="12" letter-spacing="1.5" fill="#3A3732">${esc(r.name.toUpperCase())}</text>`).join('');
  svg.setAttribute('viewBox', `-4 -4 ${PLAN_W * s + 8} ${PLAN_H * s + 8}`);
}

// ---------------------------------------------------------------- before / after
function beforeAfter() {
  const f = $('[data-ba]'), range = $('[data-ba-range]');
  const set = (v) => { f.style.setProperty('--x', `${v}%`); range.value = v; };
  range.addEventListener('input', () => set(range.value));
  if (!LIVE) return;
  ScrollTrigger.create({ trigger: f, start: 'top 70%', once: true, onEnter: () => {
    const o = { v: 50 }; gsap.timeline().to(o, { v: 22, duration: 1.1, ease: 'expo.inOut', onUpdate: () => set(o.v) }).to(o, { v: 78, duration: 1.4, ease: 'expo.inOut', onUpdate: () => set(o.v) }).to(o, { v: 50, duration: 1, ease: 'expo.inOut', onUpdate: () => set(o.v) });
  } });
}

// ---------------------------------------------------------------- neighborhoods card + tabs
function areas(onPick) {
  const tabs = $('[data-map-tabs]'), card = $('[data-map-card]');
  tabs.innerHTML = AREAS.map((a, i) => `<button type="button" aria-pressed="${i === 0}" data-area="${i}">${esc(a.name)}</button>`).join('');
  let shown = -1;
  const show = (i) => {
    if (i === shown) return; shown = i; const a = AREAS[i];
    $$('button', tabs).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.area) === i)));
    card.innerHTML = `<h3>${esc(a.name)}</h3><p>${esc(a.text)}</p><dl><div><dt>Median price</dt><dd>${esc(a.price)}</dd></div><div><dt>Homes for sale</dt><dd>${a.homes}</dd></div><div><dt>Close to</dt><dd>${esc(a.near)}</dd></div><div><dt>Feels like</dt><dd>${esc(a.feel)}</dd></div></dl>`;
    if (LIVE) gsap.fromTo(card.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out' });
  };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { const i = Number(b.dataset.area); show(i); onPick?.(i); } });
  show(0);
  return show;
}

// ---------------------------------------------------------------- mortgage with an odometer
function calculator() {
  const f = $('[data-calc]'), odo = $('[data-odo]'), txt = $('[data-calc-text]');
  const val = (id) => Number($(id, f).value);
  const render = () => {
    const price = val('#c-price'), down = val('#c-down'), rate = val('#c-rate'), yrs = val('#c-years');
    const P = price * (1 - down / 100), r = rate / 1200, n = yrs * 12, M = r ? (P * r) / (1 - (1 + r) ** -n) : P / n;
    $('[data-out="price"]', f).textContent = money(price); $('[data-out="down"]', f).textContent = `${down}% · ${money(price * down / 100)}`;
    $('[data-out="rate"]', f).textContent = `${rate.toFixed(2)}%`; $('[data-out="years"]', f).textContent = `${yrs} years`;
    const s = Math.round(M).toLocaleString('en-US');
    txt.textContent = `Estimated payment ${money(M)} per month`;
    if (odo.dataset.len !== String(s.length)) {
      odo.dataset.len = s.length;
      odo.innerHTML = [...s].map((ch) => /\d/.test(ch) ? '<span><i>0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</i></span>' : `<span><i>${ch}</i></span>`).join('');
    }
    [...odo.children].forEach((sp, k) => { const ch = s[k]; if (/\d/.test(ch)) sp.firstChild.style.transform = `translateY(-${Number(ch)}em)`; });
  };
  f.addEventListener('input', render); render();
}

// ---------------------------------------------------------------- choreography helpers
function linesReveal(el, delay = 0, trigger = true) {
  const s = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
  const tw = gsap.from(s.lines, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay, paused: true });
  if (trigger) ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => tw.play() });
  return tw;
}
function cursor() {
  if (MOBILE) return;
  const c = $('[data-cursor]'), lab = $('[data-cursor-label]'), p = { x: -100, y: -100 }, t = { ...p };
  const LABELS = [['.jv-rail', 'Drag'], ['[data-ba]', 'Slide'], ['[data-tod]', 'Time'], ['[data-map-canvas], .jv-map__stick', 'Scroll to fly'], ['.jv-plan__stick', 'Scroll to build'], ['a, button', '']];
  addEventListener('pointermove', (e) => {
    t.x = e.clientX; t.y = e.clientY;
    const hit = LABELS.find(([s]) => e.target.closest?.(s)); const text = hit ? hit[1] : '';
    lab.textContent = text; c.classList.toggle('has-label', !!text);
  }, { passive: true });
  gsap.ticker.add(() => { p.x += (t.x - p.x) * 0.25; p.y += (t.y - p.y) * 0.25; c.style.transform = `translate(${p.x}px, ${p.y}px)`; });
}
function preloader(done) {
  const pre = $('[data-pre]');
  if (!LIVE || root.classList.contains('jv-seen')) { pre.remove(); done(0); return; }
  try { sessionStorage.setItem('jv-seen', '1'); } catch {}
  const strokes = $$('path, line, rect', pre), count = $('[data-count]'), o = { v: 0 };
  strokes.forEach((s) => { const L = s.getTotalLength?.() || 600; s.style.strokeDasharray = L; s.style.strokeDashoffset = L; });
  gsap.timeline({ onComplete: () => pre.remove() })
    .to(strokes, { strokeDashoffset: 0, duration: 1.8, stagger: 0.07, ease: 'power2.inOut' })
    .to(o, { v: 100, duration: 2.4, ease: 'power1.inOut', onUpdate: () => { count.textContent = Math.round(o.v); } }, 0)
    .to('[data-sketch]', { scale: 1.06, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.15')
    .add(() => done(0.2))
    .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.2');
}

// ---------------------------------------------------------------- boot
let lenis = null;
async function boot() {
  buildRail(); search(); planSVG(); beforeAfter(); calculator();
  $('[data-detail-close]').addEventListener('click', closeHome);
  $('[data-detail]').addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHome(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHome(); });
  $('[data-detail-tour]').addEventListener('click', closeHome);
  const tod = $('[data-tod]');
  const todText = (v) => (v < 25 ? 'Midday' : v < 65 ? 'Golden hour' : 'Night');
  tod.addEventListener('input', () => tod.setAttribute('aria-valuetext', todText(tod.value)));
  const nav = $('[data-nav]');
  addEventListener('scroll', () => nav.classList.toggle('is-solid', scrollY > innerHeight * 0.8), { passive: true });

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  await document.fonts.ready;
  let showArea = areas();
  railBehaviour();
  if (!LIVE) { $('[data-pre]')?.remove(); $$('[data-num]').forEach((n) => { n.textContent = n.dataset.num + (n.dataset.suffix || ''); }); return; }

  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id === '#top' ? 0 : $(id), { duration: 1.6 }); } }));

  const [{ startHero }, { startPlan }, { startMap }] = await Promise.all([import('./hero.js'), import('./plan.js'), import('./map.js')]);
  const hero = startHero($('[data-hero]'), { mobile: MOBILE, dpr: DPR });
  const plan = startPlan($('[data-plan-canvas]'), $('[data-plan-labels]'), { mobile: MOBILE, dpr: DPR });
  const map = startMap($('[data-map-canvas]'), $('[data-map-pin]'), { mobile: MOBILE, dpr: DPR });
  let todV = 0.45; const shade = $('.jv-hero__shade');
  let pp = 0, mf = 0, mfT = 0;
  ScrollTrigger.create({ trigger: '[data-plan]', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { pp = s.progress; } });
  const mapST = ScrollTrigger.create({ trigger: '[data-map]', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { mfT = s.progress * 2; } });
  showArea = areas((i) => lenis.scrollTo(mapST.start + (mapST.end - mapST.start) * (i / 2), { duration: 1.8 }));
  gsap.ticker.add((t) => {
    const dt = gsap.ticker.deltaRatio() / 60;
    todV += (tod.value / 100 - todV) * Math.min(1, dt * 5); hero.uniforms.uTod.value = todV;
    shade.style.opacity = String(0.55 + Math.min(1, todV / 0.45) * 0.45);
    hero.tick(t, dt); plan.tick(t, pp);
    mf += (mfT - mf) * Math.min(1, dt * 4); map.tick(t, mf);
    showArea(Math.round(mf));
  });

  cursor();
  $$('[data-lines]').forEach((el) => { if (el.id !== 'hero-title') linesReveal(el); });
  $$('[data-rise]').forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
  $$('[data-img-wipe]').forEach((el) => gsap.to(el, { clipPath: 'inset(0% 0 0% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%', once: true } }));
  $$('[data-num]').forEach((n) => { const o = { v: 0 }; gsap.to(o, { v: Number(n.dataset.num), duration: 2, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 90%', once: true }, onUpdate: () => { n.textContent = Math.round(o.v) + (n.dataset.suffix || ''); } }); });
  gsap.from('.jv-card', { y: 80, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '[data-rail]', start: 'top 85%', once: true } });

  const heroLines = linesReveal($('#hero-title'), 0, false);
  gsap.set(['.jv-search', '.jv-tod', '.jv-nav'], { opacity: 0, y: 20 });
  preloader((d) => {
    gsap.to(hero.uniforms.uIn, { value: 1, duration: 2, delay: d, ease: 'power2.out' });
    heroLines.delay(d + 0.3).play();
    gsap.to(['.jv-nav', '.jv-search', '.jv-tod'], { opacity: 1, y: 0, duration: 1, stagger: 0.12, delay: d + 0.8, ease: 'expo.out' });
  });
}
boot();
