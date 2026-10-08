// Osteria Lume: orchestration. Preloader → hero light-up → choreographed reveals; plus the menu,
// wine rail, reservations, embers, cursor, magnetic buttons and the optional ambience.
const root = document.documentElement;
const LIVE = root.classList.contains('ol-live');
const MOBILE = matchMedia('(max-width: 860px), (pointer: coarse)').matches;
const DPR = Math.min(2, devicePixelRatio || 1);
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = '/assets/showcase/osteria-lume/img/';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------------------------------------------------------------- data
const MENU = {
  Antipasti: [
    ['Burrata', 16, 'Roasted peaches, basil, aged balsamic', 'dish-burrata'],
    ['Arancini', 12, 'Saffron rice, smoked mozzarella, tomato', 'dish-cacio'],
    ['Carpaccio', 18, 'Beef, capers, rocket, parmigiano', 'dish-branzino'],
  ],
  Pasta: [
    ['Cacio e pepe', 21, 'Tonnarelli, pecorino romano, black pepper', 'dish-cacio'],
    ['Tagliatelle al ragù', 24, 'Six-hour beef and pork ragù', 'dish-cacio'],
    ['Pappardelle', 28, 'Braised short rib, rosemary, parmigiano', 'dish-pappardelle'],
  ],
  'Dal forno': [
    ['Margherita', 18, 'San Marzano, fior di latte, basil', 'dish-margherita'],
    ['Diavola', 20, "'Nduja, honey, chilli, mozzarella", 'dish-margherita'],
    ['Branzino', 34, 'Whole roasted sea bass, lemon, herbs', 'dish-branzino'],
  ],
  Dolci: [
    ['Tiramisù', 11, 'Mascarpone, espresso, cocoa', 'dish-tiramisu'],
    ['Panna cotta', 10, 'Vanilla bean, blood orange', 'dish-tiramisu'],
    ['Affogato', 8, 'Fior di latte gelato, hot espresso', 'dish-tiramisu'],
  ],
};
const WINES = [
  ['Chianti Classico', '2019 · Tuscany', 14, '#3a0b12', '#7a1424'],
  ['Barolo', '2017 · Piedmont', 22, '#2b080d', '#5e0f1b'],
  ['Etna Rosso', '2020 · Sicily', 16, '#3d0a14', '#8a1b2e'],
  ['Vermentino', '2022 · Sardinia', 13, '#c9b26a', '#efe0a0'],
  ['Prosecco Superiore', 'NV · Veneto', 12, '#d8c98a', '#f4ecc0'],
];

// ---------------------------------------------------------------- menu
function buildMenu() {
  const tabs = $('[data-tabs]'), list = $('[data-dishes]');
  const show = (name) => {
    $$('button', tabs).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    list.innerHTML = MENU[name].map(([n, p, d, img]) => `<li class="ol-dish" data-img="${esc(img)}"><span class="ol-dish__name">${esc(n)}</span><span class="ol-dish__price">${p}</span><span class="ol-dish__desc">${esc(d)}</span><img class="ol-dish__thumb" src="${IMG}${esc(img)}-sm.webp" alt="" role="presentation" loading="lazy"></li>`).join('');
    if (window.gsap && LIVE) gsap.from($$('.ol-dish', list), { y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
  };
  tabs.innerHTML = Object.keys(MENU).map((k, i) => `<button type="button" role="tab" data-tab="${esc(k)}" aria-selected="${i === 0}">${esc(k)}</button>`).join('');
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });
  tabs.addEventListener('keydown', (e) => {
    if (!/Arrow(Left|Right)/.test(e.key)) return;
    const bs = $$('button', tabs), i = bs.indexOf(document.activeElement), j = (i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length;
    bs[j].focus(); show(bs[j].dataset.tab);
  });
  show('Antipasti');

  // Floating photo that follows the cursor; the liquid filter swells with speed.
  if (!LIVE || MOBILE) return;
  const float = $('[data-float]'), imgs = $$('img', float), disp = $('#ol-liquid feDisplacementMap');
  let front = 0, cur = '', x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, on = false, vx = 0;
  list.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
  list.addEventListener('pointerover', (e) => {
    const li = e.target.closest('.ol-dish'); if (!li) return; on = true;
    if (li.dataset.img !== cur) { cur = li.dataset.img; front ^= 1; imgs[front].src = `${IMG}${cur}.webp`; imgs[front].style.opacity = 1; imgs[front ^ 1].style.opacity = 0; }
  });
  list.addEventListener('pointerleave', () => { on = false; });
  gsap.ticker.add(() => {
    const nx = x + (tx - x) * 0.14, ny = y + (ty - y) * 0.14; vx = nx - x; x = nx; y = ny;
    float.style.opacity = String(Math.min(1, Math.max(0, Number(float.style.opacity || 0) + (on ? 0.12 : -0.12))));
    float.style.transform = `translate(${x + 30}px, ${y - 180}px) rotate(${vx * 0.25}deg) skewX(${-vx * 0.35}deg)`;
    disp.setAttribute('scale', String(Math.min(70, Math.abs(vx) * 4)));
  });
}

// ---------------------------------------------------------------- wine
function bottleSVG(c1, c2, i) {
  const light = i >= 3;
  return `<svg viewBox="0 0 120 380" aria-hidden="true"><defs>
    <linearGradient id="g${i}" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".45" stop-color="${c2}"/><stop offset=".6" stop-color="${c1}"/><stop offset="1" stop-color="#050302"/></linearGradient></defs>
    <ellipse cx="60" cy="372" rx="54" ry="6" fill="rgba(0,0,0,.45)"/>
    <path d="M48 8h24v18c0 6 2 10 4 18 8 30 30 42 30 80v236c0 6-4 10-10 10H24c-6 0-10-4-10-10V124c0-38 22-50 30-80 2-8 4-12 4-18z" fill="url(#g${i})"/>
    <rect x="46" y="4" width="28" height="22" rx="3" fill="${light ? '#c8a24a' : '#5a0d16'}"/>
    <path d="M30 70 q4 -2 6 40" stroke="rgba(255,255,255,.28)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="20" y="200" width="80" height="104" rx="4" fill="#f3e9d8"/><rect x="26" y="206" width="68" height="92" rx="2" fill="none" stroke="#c2410c" stroke-width="1"/>
    <text x="60" y="246" text-anchor="middle" font-family="Cormorant, Georgia, serif" font-style="italic" font-size="20" fill="#2a1d14">Lume</text>
    <text x="60" y="270" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" letter-spacing="2" fill="#8a7f72">SELEZIONE</text></svg>`;
}
function buildWine() {
  const rail = $('[data-rail]');
  rail.innerHTML = WINES.map(([n, o, p, c1, c2], i) => `<article class="ol-bottle">${bottleSVG(c1, c2, i)}<h3>${esc(n)}</h3><p>${esc(o)}</p><b>${p} / glass</b></article>`).join('');
  if (!LIVE) return;
  const word = $('[data-wine-word]'), bottles = $$('.ol-bottle svg', rail);
  const dist = () => Math.max(0, rail.scrollWidth - innerWidth);
  gsap.to(rail, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '[data-wine]', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
  gsap.to('.ol-wine__intro', { opacity: 0, y: -30, ease: 'none', scrollTrigger: { trigger: '[data-wine]', start: 'top top', end: '25% top', scrub: true } });
  gsap.to(word, { x: () => -dist() * 0.35, ease: 'none', scrollTrigger: { trigger: '[data-wine]', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  // Bottles lean into the motion with scroll speed, then settle.
  let lean = 0;
  ScrollTrigger.create({ trigger: '[data-wine]', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { lean = Math.max(-14, Math.min(14, s.getVelocity() / -120)); } });
  gsap.ticker.add(() => { lean *= 0.92; bottles.forEach((b, i) => { b.style.transform = `rotate(${lean * (0.7 + (i % 3) * 0.2)}deg)`; }); });
}

// ---------------------------------------------------------------- reservations
const TABLES = [ // id, x, y, seats, shape
  [1, 110, 110, 2, 'c'], [2, 230, 110, 2, 'c'], [3, 350, 110, 4, 'r'], [4, 490, 110, 4, 'r'],
  [5, 110, 300, 4, 'r'], [6, 250, 300, 6, 'r'], [7, 400, 300, 2, 'c'], [8, 510, 320, 2, 'c'],
];
const TAKEN = new Set([3, 7]);
function buildReserve() {
  const plan = $('[data-plan]');
  const chairs = (x, y, n, shape) => {
    let s = '';
    if (shape === 'c') for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.PI / 2; s += `<circle class="chair" cx="${x + Math.cos(a) * 44}" cy="${y + Math.sin(a) * 44}" r="11"/>`; }
    else for (let i = 0; i < n; i++) { const top = i % 2 === 0, k = Math.floor(i / 2), off = (k - (Math.ceil(n / 2) - 1) / 2) * 34; s += `<rect class="chair" x="${x + off - 11}" y="${y + (top ? -52 : 30)}" width="22" height="22" rx="6"/>`; }
    return s;
  };
  plan.innerHTML = `<defs><radialGradient id="halo"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#e8a54b" stop-opacity="0"/></radialGradient></defs>
    <rect x="12" y="12" width="576" height="416" rx="14" fill="none" stroke="rgba(232,165,75,.18)"/>
    <text x="300" y="408" text-anchor="middle" font-family="Jost" font-size="11" letter-spacing="3" fill="rgba(243,233,216,.4)">KITCHEN · OVEN</text>
    <rect x="200" y="392" width="200" height="6" rx="3" fill="rgba(194,65,12,.5)"/>` +
    TABLES.map(([id, x, y, n, shape]) => {
      const taken = TAKEN.has(id), w = shape === 'r' ? Math.max(64, n * 20) : 0;
      return `<g class="tbl${taken ? ' taken' : ''}" data-t="${id}" role="button" tabindex="${taken ? -1 : 0}" aria-pressed="false" aria-disabled="${taken}" aria-label="Table ${id}, ${n} seats${taken ? ', booked' : ''}">
        <circle class="halo" cx="${x}" cy="${y}" r="80" fill="url(#halo)"/>${chairs(x, y, n, shape)}
        ${shape === 'c' ? `<circle class="top" cx="${x}" cy="${y}" r="30"/>` : `<rect x="${x - w / 2}" y="${y - 24}" width="${w}" height="48" rx="8"/>`}
        <g class="flame"><rect x="${x - 3}" y="${y - 6}" width="6" height="10" rx="1.5" fill="#f3e9d8"/><path d="M${x} ${y - 20} q6 8 0 14 q-6 -6 0 -14z" fill="#ffc861"/></g>
        <text x="${x}" y="${y + (shape === 'c' ? 74 : 70)}" text-anchor="middle">${taken ? 'BOOKED' : `T${id} · ${n}`}</text></g>`;
    }).join('');

  const state = { table: null, date: null, time: null, party: 2 };
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; }).filter((d) => d.getDay() !== 1).slice(0, 6);
  const fmt = (d, o) => d.toLocaleDateString('en-US', o);
  $('[data-dates]').innerHTML = days.map((d, i) => `<button type="button" aria-pressed="false" data-date="${i}"><small>${fmt(d, { weekday: 'short' })}</small>${fmt(d, { month: 'short', day: 'numeric' })}</button>`).join('');
  const times = ['5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00'];
  $('[data-times]').innerHTML = times.map((t) => `<button type="button" aria-pressed="false" data-time="${t}">${t} PM</button>`).join('');
  const summary = $('[data-summary]'), book = $('[data-book]');
  const render = () => {
    const tbl = TABLES.find((t) => t[0] === state.table);
    $('[data-party]').textContent = `${state.party} guest${state.party > 1 ? 's' : ''}`;
    const fits = !tbl || tbl[3] >= state.party;
    summary.textContent = !state.table ? 'Pick a table, a date and a time.' : !fits ? `Table ${state.table} seats ${tbl[3]}. Choose a bigger table.`
      : `Table ${state.table} · ${state.date !== null ? fmt(days[state.date], { weekday: 'long', month: 'long', day: 'numeric' }) : 'choose a date'} · ${state.time ? state.time + ' PM' : 'choose a time'} · ${state.party} guests`;
    book.disabled = !(state.table && state.date !== null && state.time && fits);
  };
  const choose = (g) => {
    if (!g || g.classList.contains('taken')) return;
    $$('.tbl', plan).forEach((t) => { t.classList.remove('is-on'); t.setAttribute('aria-pressed', 'false'); });
    g.classList.add('is-on'); g.setAttribute('aria-pressed', 'true'); state.table = Number(g.dataset.t);
    if (window.gsap && LIVE) gsap.fromTo(g.querySelector('.halo'), { scale: 0.4, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, .5)' });
    render();
  };
  plan.addEventListener('click', (e) => choose(e.target.closest('.tbl')));
  plan.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.tbl')) { e.preventDefault(); choose(e.target.closest('.tbl')); } });
  const pick = (sel, key, attr, conv = (v) => v) => $(sel).addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', $(sel)).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); state[key] = conv(b.dataset[attr]); render();
  });
  pick('[data-dates]', 'date', 'date', Number); pick('[data-times]', 'time', 'time');
  $('[data-less]').addEventListener('click', () => { state.party = Math.max(1, state.party - 1); render(); });
  $('[data-more]').addEventListener('click', () => { state.party = Math.min(8, state.party + 1); render(); });

  const dlg = $('[data-confirm]'), seal = $('[data-seal]');
  book.addEventListener('click', () => {
    $('[data-ok-text]').textContent = `See you ${fmt(days[state.date], { weekday: 'long', month: 'long', day: 'numeric' })} at ${state.time} PM, table ${state.table}, ${state.party} guests.`;
    dlg.classList.add('is-open');
    if (window.gsap && LIVE) {
      gsap.timeline()
        .to(dlg, { opacity: 1, duration: 0.4 })
        .fromTo('.ol-card', { y: 40, rotate: -2 }, { y: 0, rotate: 0, duration: 0.7, ease: 'power3.out' }, 0)
        .fromTo(seal, { scale: 2.6, rotate: -40, opacity: 0 }, { scale: 1, rotate: -8, opacity: 1, duration: 0.45, ease: 'power4.in' }, 0.35)
        .to('.ol-card', { x: 6, duration: 0.05, yoyo: true, repeat: 5 }, 0.8)
        .fromTo(seal, { scale: 1.06 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' }, 0.8);
    } else dlg.style.opacity = 1;
    $('[data-close]').focus();
  });
  const close = () => { dlg.classList.remove('is-open'); dlg.style.opacity = 0; book.focus(); };
  $('[data-close]').addEventListener('click', close);
  dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  render();
}

// ---------------------------------------------------------------- embers
function startEmbers() {
  const c = $('[data-embers]'), g = c.getContext('2d'); let W = 0, H = 0, on = false;
  const P = [...Array(MOBILE ? 40 : 90)].map(() => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 2, v: 0.0006 + Math.random() * 0.0016, w: Math.random() * 6 }));
  const size = () => { W = c.width = c.clientWidth * DPR; H = c.height = c.clientHeight * DPR; };
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(c); addEventListener('resize', size); size();
  gsap.ticker.add((t) => {
    if (!on) return; g.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y -= p.v; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const x = (p.x + Math.sin(t * 0.8 + p.w) * 0.01) * W, y = p.y * H, a = Math.min(1, p.y * 1.4) * (0.5 + 0.5 * Math.sin(t * 6 + p.w));
      g.beginPath(); g.arc(x, y, p.s * DPR, 0, Math.PI * 2); g.fillStyle = `rgba(255, ${140 + p.w * 12 | 0}, 60, ${a * 0.8})`;
      g.shadowColor = 'rgba(255,120,40,.9)'; g.shadowBlur = 8 * DPR; g.fill();
    }
  });
}

// ---------------------------------------------------------------- ambience (WebAudio, off by default)
function ambience() {
  const btn = $('[data-sound]'); let ctx = null, master = null;
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    if (on && !ctx) {
      ctx = new AudioContext(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // fire: brown noise through a lowpass, plus random crackles
      const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; if (Math.random() < 0.0004) for (let k = 0; k < 120 && i + k < len; k++) d[i + k] += (Math.random() * 2 - 1) * Math.exp(-k / 18) * 0.6; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; const fg = ctx.createGain(); fg.gain.value = 0.5;
      src.connect(lp).connect(fg).connect(master); src.start();
      // a warm pad: Am7 → Dm9 → Gmaj7 → Cmaj7, four seconds each
      const chords = [[57, 60, 64, 67], [50, 57, 60, 64], [55, 59, 62, 66], [48, 55, 59, 64]], f = (m) => 440 * 2 ** ((m - 69) / 12);
      const pad = ctx.createGain(); pad.gain.value = 0.05; const plp = ctx.createBiquadFilter(); plp.type = 'lowpass'; plp.frequency.value = 900; pad.connect(plp).connect(master);
      const voice = (start) => chords.forEach((ch, ci) => ch.forEach((m) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = f(m); o.detune.value = (Math.random() - 0.5) * 8;
        const t0 = start + ci * 4; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.25, t0 + 1.2); g.gain.linearRampToValueAtTime(0, t0 + 4.6);
        o.connect(g).connect(pad); o.start(t0); o.stop(t0 + 4.8);
      }));
      let next = ctx.currentTime; const loop = () => { while (next < ctx.currentTime + 20) { voice(next); next += 16; } }; loop(); setInterval(loop, 5000);
    }
    if (ctx) { ctx.resume(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(on ? 0.5 : 0, ctx.currentTime + 1.2); }
  });
}

// ---------------------------------------------------------------- choreography
function splitReveal(el, delay = 0) {
  const s = new SplitText(el, { type: 'lines,chars', mask: 'lines' });
  return gsap.from(s.chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.022, ease: 'power4.out', delay });
}
function wordsGlow() {
  const p = $('[data-words]'); const s = new SplitText(p, { type: 'words', wordsClass: 'w', aria: 'none' });
  if (!LIVE) return;
  gsap.to(s.words, { color: '#F3E9D8', stagger: 0.1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 75%', end: 'bottom 40%', scrub: true } });
}
function cursorAndMagnets() {
  if (MOBILE) return;
  const cur = $('[data-cursor]'), pos = { x: innerWidth / 2, y: innerHeight / 2 }, to = { ...pos };
  addEventListener('pointermove', (e) => { to.x = e.clientX; to.y = e.clientY; cur.classList.toggle('is-link', !!e.target.closest('a, button, .tbl')); }, { passive: true });
  gsap.ticker.add(() => { pos.x += (to.x - pos.x) * 0.2; pos.y += (to.y - pos.y) * 0.2; cur.style.transform = `translate(${pos.x}px, ${pos.y}px)`; });
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, .4)' }));
  });
}
function drawLogo(delay) {
  const t = $('[data-logo]'); const len = 900;
  gsap.fromTo(t, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 2.2, delay, ease: 'power2.inOut' });
  gsap.to(t, { fillOpacity: 1, strokeOpacity: 0, duration: 1, delay: delay + 1.6 });
}
function preloader(onLight) {
  const pre = $('[data-pre]');
  if (!LIVE || root.classList.contains('ol-lit')) { pre.remove(); onLight(0); return; }
  try { sessionStorage.setItem('ol-lit', '1'); } catch {}
  const sparks = $('[data-sparks]');
  sparks.innerHTML = [...Array(14)].map(() => '<i></i>').join('');
  gsap.timeline({ onComplete: () => pre.remove() })
    .from('[data-match]', { x: -80, rotate: -14, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .to('[data-match]', { x: 90, duration: 0.32, ease: 'power2.in' })
    .add(() => onLight(1.6))
    .fromTo($$('i', sparks), { x: 130, y: 120, opacity: 1, scale: 1 }, { x: () => 130 + (Math.random() - 0.3) * 160, y: () => 120 - Math.random() * 120, opacity: 0, scale: 0.2, duration: 0.6, ease: 'power2.out', stagger: 0.01 }, '<-0.05')
    .to('[data-flame]', { opacity: 1, scale: 1.15, duration: 0.25 }, '<')
    .to('[data-flame]', { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' })
    .to('[data-preword]', { opacity: 1, y: -6, duration: 0.6 }, '<')
    .to('[data-glow]', { scale: Math.hypot(innerWidth, innerHeight) / 20, duration: 1.3, ease: 'power2.in' }, '+=0.25')
    .to(pre, { opacity: 0, duration: 0.6 }, '-=0.3');
}

// ---------------------------------------------------------------- boot
async function boot() {
  buildMenu(); buildWine(); buildReserve(); ambience();
  const nav = $('[data-nav]');
  addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  await document.fonts.ready;
  wordsGlow();
  if (!LIVE) { $('[data-pre]')?.remove(); return; }

  const lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id === '#top' ? 0 : $(id), { duration: 1.6 }); } }));

  const [{ startHero }, { startKitchen }] = await Promise.all([import('./hero.js'), import('./kitchen.js')]);
  const hero = startHero($('[data-hero]'), { mobile: MOBILE, dpr: DPR });
  const kitchen = startKitchen($('[data-kitchen-canvas]'), { mobile: MOBILE, dpr: DPR });

  // Kitchen chapters
  const caps = $$('[data-cap]'), count = $('[data-count]'), fireBg = $('[data-fire]'), title = $('.ol-kitchen__title');
  let kp = 0;
  ScrollTrigger.create({ trigger: '[data-kitchen]', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { kp = s.progress; } });
  gsap.ticker.add((t) => {
    const dt = gsap.ticker.deltaRatio() / 60;
    hero.tick(t, dt);
    kitchen.tick(t, kp);
    const ch = Math.min(3, Math.floor(kp * 4));
    caps.forEach((c, i) => { const local = kp * 4 - i, o = i === ch ? Math.min(1, local * 5, (1 - local) * 6 + (i === 3 ? 9 : 0)) : 0; c.style.opacity = Math.max(0, o); c.style.transform = `translateY(${(1 - Math.max(0, o)) * 24}px)`; });
    count.textContent = `0${ch + 1} / 04`;
    fireBg.style.opacity = Math.max(0, (kp - 0.75) * 4) * 0.85;
    title.style.opacity = Math.max(0, 1 - kp * 10);
  });

  cursorAndMagnets(); startEmbers();
  $$('[data-split]').forEach((el) => { if (el.id !== 'hero-title') gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } }).add(splitReveal(el)); });
  gsap.set('[data-rise]', { opacity: 0, y: 24 });
  preloader((wait) => {
    gsap.to(hero.uniforms.uIntro, { value: 1, duration: 2.4, delay: wait * 0.6, ease: 'power2.out' });
    drawLogo(wait);
    splitReveal($('#hero-title'), wait + 0.2);
    gsap.to('[data-rise]', { opacity: 1, y: 0, duration: 1, stagger: 0.15, delay: wait + 0.9, ease: 'power3.out' });
  });
}
boot();
