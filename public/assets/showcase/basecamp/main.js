// Basecamp Students showpiece. Everything here is physical: letters on springs, tape that speeds up with
// the scroll, a pinned week that slides sideways, a countdown, confetti, a flipping group card, a tilting
// check-in pass and a photo wall you can throw.
import { kinetic } from './kinetic.js';

const root = document.documentElement;
const LIVE = root.classList.contains('bc-live'), GL = !root.classList.contains('bc-nogl');
const MOBILE = matchMedia('(max-width: 760px)').matches;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
const ticks = [];

// ---------------------------------------------------------------- the retreat countdown
const RETREAT = new Date(2026, 10, 7, 17, 0, 0); // Nov 7, 5 PM: the bus leaves
function countdown() {
  const units = Object.fromEntries($$('[data-unit]').map((el) => [el.dataset.unit, el]));
  const last = {};
  const set = (el, v) => {
    if (last[el.dataset.unit] === v) return; const first = last[el.dataset.unit] === undefined; last[el.dataset.unit] = v;
    if (!LIVE || first) { el.textContent = v; return; }
    // Slot flip: the old number drops out, the new one drops in.
    const old = document.createElement('i'), nu = document.createElement('i');
    old.textContent = el.textContent.trim(); nu.textContent = v; el.textContent = ''; el.append(old, nu);
    gsap.fromTo(old, { yPercent: 0 }, { yPercent: 100, duration: 0.45, ease: 'power3.in' });
    gsap.fromTo(nu, { yPercent: -100 }, { yPercent: 0, duration: 0.55, ease: 'back.out(2)', onComplete: () => { el.textContent = v; } });
  };
  const run = () => {
    let s = Math.max(0, Math.floor((RETREAT - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
    [['d', d], ['h', h], ['m', m], ['s', s]].forEach(([k, v]) => set(units[k], String(v).padStart(2, '0')));
  };
  run(); setInterval(run, 1000);
}

// ---------------------------------------------------------------- spots and registration
let spotsLeft = 18;
function spots() {
  const box = $('[data-spots]');
  box.innerHTML = Array.from({ length: 60 }, (_, i) => `<i class="${i >= 60 - spotsLeft ? 'open' : ''}"></i>`).join('');
  if (LIVE) ScrollTrigger.create({ trigger: box, start: 'top 85%', once: true, onEnter: () => gsap.from(box.children, { scale: 0, duration: 0.5, stagger: 0.012, ease: 'back.out(3)' }) });
}
function registration() {
  const form = $('[data-reg]'), go = $('[data-reg-go]'), hint = $('[data-reg-hint]'), name = $('#reg-name');
  const grades = $('[data-grades]');
  grades.setAttribute('role', 'radiogroup'); grades.setAttribute('aria-label', 'Grade');
  grades.innerHTML = [6, 7, 8, 9, 10, 11, 12].map((g) => `<button type="button" role="radio" aria-checked="false" data-g="${g}">${g}</button>`).join('');
  let grade = null;
  grades.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; grade = b.dataset.g;
    $$('button', grades).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    if (LIVE) gsap.fromTo(b, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: 'back.out(4)' });
    check();
  });
  const boxes = $$('input[type="checkbox"]', form);
  const check = () => {
    const ok = name.value.trim() && grade && boxes.every((b) => b.checked);
    go.disabled = !ok;
    hint.textContent = ok ? 'Ready when you are.' : 'Add a name, a grade and tick all three.';
  };
  form.addEventListener('input', check); form.addEventListener('change', check);
  form.addEventListener('submit', (e) => {
    e.preventDefault(); if (go.disabled) return;
    const who = name.value.trim();
    spotsLeft = Math.max(0, spotsLeft - 1);
    const open = $$('[data-spots] i.open'); const mine = open[0];
    if (mine) { mine.classList.remove('open'); mine.classList.add('mine'); if (LIVE) gsap.fromTo(mine, { scale: 2.6 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, .4)' }); }
    $('[data-spots-tag]').textContent = `${spotsLeft} spots left`;
    $('[data-reg-msg]').textContent = `${who}, you're going to Cedar Ridge.`;
    const face = $('[data-reg-form]'), done = $('[data-reg-done]');
    const swap = () => { face.hidden = true; done.hidden = false; done.focus({ preventScroll: true }); };
    if (LIVE) {
      confetti(go.getBoundingClientRect());
      gsap.timeline().to(form, { rotateY: 90, duration: 0.3, ease: 'power2.in', onComplete: swap })
        .set(form, { rotateY: -90 }).to(form, { rotateY: 0, duration: 0.6, ease: 'back.out(1.6)' })
        .from($('.bc-stamp', done), { scale: 3, opacity: 0, rotate: -30, duration: 0.45, ease: 'back.out(2.4)' }, '-=0.25');
    } else swap();
  });
  $('[data-reg-again]').addEventListener('click', () => {
    form.reset(); grade = null; $$('button', grades).forEach((x) => x.setAttribute('aria-checked', 'false')); check();
    $('[data-reg-done]').hidden = true; $('[data-reg-form]').hidden = false; name.focus();
  });
}

// ---------------------------------------------------------------- confetti
function confetti(from) {
  const c = $('[data-confetti]'), x = c.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.scale(dpr, dpr);
  const COLORS = ['#C6F432', '#FF6B2C', '#111111', '#FFFFFF', '#C6F432'];
  const ox = from.left + from.width / 2, oy = from.top + from.height / 2;
  const bits = Array.from({ length: 160 }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 9 + Math.random() * 15;
    return { x: ox + (Math.random() - 0.5) * from.width * 0.6, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, w: 7 + Math.random() * 9, h: 4 + Math.random() * 6, c: COLORS[Math.floor(Math.random() * COLORS.length)], round: Math.random() < 0.3 };
  });
  const t0 = performance.now();
  const step = () => {
    const t = (performance.now() - t0) / 1000;
    x.clearRect(0, 0, innerWidth, innerHeight);
    for (const b of bits) {
      b.vy += 0.42; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.scale(1, Math.cos(t * 9 + b.r)); x.fillStyle = b.c;
      if (b.round) { x.beginPath(); x.arc(0, 0, b.h * 0.7, 0, 7); x.fill(); } else x.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      x.restore();
    }
    if (t < 3.6) requestAnimationFrame(step); else x.clearRect(0, 0, innerWidth, innerHeight);
  };
  step();
}

// ---------------------------------------------------------------- group finder
const GROUPS = {
  'ms-sports': ['Dodgeball Crew', 'Loud, sweaty and the best warm-up for Wednesday night.', 'Wednesdays 5:45 PM', 'The gym', 'Kemi Okafor'],
  'ms-music': ['Garage Band', 'Learn a song in a week. Play it for everyone on Sunday.', 'Sundays 9:30 AM', 'Music room', 'Kemi Okafor'],
  'ms-games': ['Board & Bored', 'Card games, snacks and zero pressure to talk first.', 'Fridays 4:00 PM', 'The Barn', 'Kemi Okafor'],
  'ms-talk': ['Big Questions', 'Ask the thing you were afraid to ask. Nobody laughs.', 'Sundays 9:30 AM', 'Room 6', 'Kemi Okafor'],
  'hs-sports': ['Pickup League', 'Basketball, then a short talk, then more basketball.', 'Tuesdays 7:00 PM', 'The gym', 'Theo Brandt'],
  'hs-music': ['Worship Team', 'Vocals, keys, drums, guitar, sound. Every spot matters.', 'Thursdays 6:00 PM', 'Main room', 'Jordan Reyes'],
  'hs-games': ['Night Owls', 'Tournament nights, co-op nights and a lot of pizza.', 'Fridays 7:00 PM', 'The Barn', 'Theo Brandt'],
  'hs-talk': ['Coffee & Questions', 'Real conversations about faith, school and what comes next.', 'Sundays 11:00 AM', 'The café', 'Jordan Reyes'],
};
function groups() {
  const pick = { level: null, vibe: null };
  const card = $('[data-match]'), body = $('[data-match-body]'), backs = $$('.bc-card--back');
  const show = () => {
    if (!pick.level || !pick.vibe) return;
    const [name, text, when, where, who] = GROUPS[`${pick.level}-${pick.vibe}`];
    const fill = () => { body.innerHTML = `<span class="bc-tag">Your match</span><h3>${esc(name)}</h3><p>${esc(text)}</p><dl><div><dt>When</dt><dd>${esc(when)}</dd></div><div><dt>Where</dt><dd>${esc(where)}</dd></div><div><dt>Leader</dt><dd>${esc(who)}</dd></div></dl>`; };
    if (!LIVE) { fill(); card.classList.add('is-flipped'); return; }
    const was = card.classList.contains('is-flipped');
    const tl = gsap.timeline();
    if (was) tl.to($('.bc-card__inner', card), { rotateY: 0, duration: 0.35, ease: 'power2.in' });
    // Shuffle the deck, then flip the winner.
    tl.add(() => { fill(); card.classList.add('is-flipped'); })
      .to(backs, { x: (i) => (i ? 140 : -140), rotate: (i) => (i ? 16 : -16), duration: 0.28, ease: 'power2.out' }, '<')
      .to(backs, { x: (i) => (i ? 18 : -24), rotate: (i) => (i ? 5 : -7), duration: 0.6, ease: 'back.out(2)' })
      .fromTo($('.bc-card__inner', card), { rotateY: 0 }, { rotateY: 180, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.6')
      .fromTo(card, { y: 0 }, { y: -30, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }, '<');
  };
  for (const [key, sel] of [['level', '[data-level]'], ['vibe', '[data-vibe]']]) {
    $(sel).addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return; pick[key] = b.dataset.v;
      $$('button', $(sel)).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (LIVE) gsap.fromTo(b, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'back.out(4)' });
      show();
    });
  }
}

// ---------------------------------------------------------------- check-in pass
function qr() {
  // A QR-looking code: three finder squares and a seeded pattern (decorative, not scannable).
  const N = 29, cells = [];
  let seed = 12365; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const finder = (x, y) => (x >= 0 && x < 7 && y >= 0 && y < 7) ? ((x === 0 || x === 6 || y === 0 || y === 6) || (x > 1 && x < 5 && y > 1 && y < 5)) : null;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let f = finder(x, y) ?? finder(x - (N - 7), y) ?? finder(x, y - (N - 7));
    const nearFinder = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    if (f === null) f = nearFinder ? false : (y === 6 || x === 6) ? (x + y) % 2 === 0 : rnd() < 0.48;
    if (f) cells.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`);
  }
  $('[data-qr]').innerHTML = cells.join('');
}
function pass() {
  qr();
  const phone = $('[data-tilt]'), card = $('[data-passcard]'), btn = $('[data-checkin]'), status = $('[data-pass-status]');
  if (LIVE) {
    const rx = gsap.quickTo(phone, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(phone, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(phone, { transformPerspective: 1200 });
    $('.bc-pass').addEventListener('pointermove', (e) => {
      const r = phone.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      ry(dx * 34); rx(-dy * 26); card.style.setProperty('--a', String(dx * 220 + dy * 140));
    });
    $('.bc-pass').addEventListener('pointerleave', () => { rx(0); ry(0); });
    gsap.from(phone, { y: 160, rotate: 8, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.bc-pass', start: 'top 70%' } });
  }
  let inside = false;
  btn.addEventListener('click', () => {
    if (inside) { inside = false; card.classList.remove('is-in'); status.classList.remove('is-in'); status.textContent = 'Tonight · Game Night · 6:30 PM'; btn.textContent = 'Check In'; return; }
    btn.disabled = true;
    const finish = () => {
      inside = true; btn.disabled = false; card.classList.add('is-in'); status.classList.add('is-in');
      status.textContent = 'Checked in 6:24 PM · Parents notified'; btn.textContent = 'Reset the demo';
      if (LIVE) gsap.fromTo(phone, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, .2)' });
    };
    if (!LIVE) { finish(); return; }
    gsap.timeline({ onComplete: finish })
      .set('[data-scan]', { opacity: 1, top: 0 })
      .to('[data-scan]', { top: '100%', duration: 0.6, ease: 'power1.inOut', yoyo: true, repeat: 2 })
      .set('[data-scan]', { opacity: 0 });
  });
}

// ---------------------------------------------------------------- parents
function parents() {
  const btn = $('[data-more-btn]'), more = $('[data-more]');
  btn.addEventListener('click', () => {
    const open = more.hidden; more.hidden = !open; btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Show less' : 'Read Update';
    if (open && LIVE) gsap.from(more, { height: 0, opacity: 0, duration: 0.5, ease: 'expo.out', clearProps: 'height,opacity' });
  });
  if (!LIVE) return;
  for (const svg of $$('[data-draw]')) {
    const parts = $$('path, rect, circle', svg);
    parts.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.to(parts, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 85%' } });
  }
  gsap.from('.bc-pcard', { y: 80, rotate: (i) => [-4, 3, -2][i], opacity: 0, duration: 0.9, stagger: 0.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.bc-pcards', start: 'top 85%' } });
  gsap.from('.bc-leaders li', { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.bc-leaders', start: 'top 90%' } });
}

// ---------------------------------------------------------------- live-only motion
function tapes() {
  const tapes = $$('[data-tape]').map((t) => {
    const d = t.firstElementChild; d.innerHTML = d.innerHTML.repeat(4);
    return { d, dir: Number(t.dataset.tape), x: 0, w: () => d.scrollWidth / 4 };
  });
  let boost = 0;
  ticks.push((dt) => {
    const v = lenis ? lenis.velocity : 0; boost += (Math.min(40, Math.abs(v)) - boost) * 0.1;
    for (const t of tapes) {
      const w = t.w(); t.x -= t.dir * (60 + boost * 30) * dt * (v < 0 ? -1 : 1);
      t.x = ((t.x % w) + w) % w; t.d.style.transform = `translate3d(${-t.x}px,0,0)`;
    }
  });
}
function week() {
  const track = $('[data-week-track]'), bar = $('[data-week-bar]');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
  const skew = gsap.quickTo('.bc-day', 'skewX', { duration: 0.4, ease: 'power3' });
  // Lean with the scroll speed, and settle upright once the scroll stops.
  let lean = 0; ticks.push(() => { if (Math.abs(lean) > 0.05) { lean *= 0.9; skew(lean); } });
  const move = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '[data-week]', pin: '.bc-week__stick', start: 'top top', end: () => `+=${dist()}`, scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (s) => { bar.style.transform = `scaleX(${s.progress})`; lean = Math.max(-8, Math.min(8, s.getVelocity() / -220)); skew(lean); },
    },
  });
  for (const st of $$('[data-sticker]')) {
    gsap.from(st, { scale: 0, rotate: -60, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: st.parentElement, containerAnimation: move, start: 'left 80%' } });
  }
  gsap.from('.bc-day', { y: 120, rotate: (i) => (i % 2 ? 6 : -6), opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '[data-week]', start: 'top 75%' } });
}
function retreatMotion() {
  const t = $('[data-slam]'), text = t.textContent;
  t.setAttribute('aria-label', text);
  t.innerHTML = [...text].map((c) => (c === ' ' ? ' ' : `<span class="l" aria-hidden="true">${esc(c)}</span>`)).join('');
  gsap.from($$('.l', t), { yPercent: 115, rotate: () => (Math.random() - 0.5) * 30, duration: 0.8, stagger: 0.04, ease: 'back.out(1.8)', scrollTrigger: { trigger: t, start: 'top 80%' } });
  gsap.fromTo('[data-zoom] img', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-zoom]', start: 'top bottom', end: 'bottom 40%', scrub: true } });
  gsap.from('.bc-count__row > div', { y: 60, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'back.out(2)', scrollTrigger: { trigger: '.bc-count', start: 'top 85%' } });
  gsap.from('.bc-reg', { y: 100, rotate: 3, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.bc-reg', start: 'top 90%' } });
}
function reveals() {
  for (const el of $$('.bc-h2')) gsap.from(el, { yPercent: 40, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  gsap.from('.bc-deck', { scale: 0.85, rotate: -4, opacity: 0, duration: 1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.bc-deck', start: 'top 85%' } });
  gsap.from('.bc-update', { clipPath: 'inset(0 100% 0 0 round 20px)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.bc-update', start: 'top 80%' } });
}
function magnets() {
  for (const el of $$('[data-magnet]')) {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, .4)' }), y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, .4)' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.25); y((e.clientY - r.top - r.height / 2) * 0.25); });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  }
}
function cursor() {
  const c = $('[data-cursor]'), label = $('[data-cursor-label]');
  const LABELS = [['[data-wall]', 'Grab'], ['.bc-tile', 'Go'], ['.bc-phone', 'Tilt'], ['[data-fire]', 'Wind'], ['.bc-hero__title', 'Push']];
  const x = gsap.quickTo(c, 'x', { duration: 0.18, ease: 'power3' }), y = gsap.quickTo(c, 'y', { duration: 0.18, ease: 'power3' });
  let px = -1, py = -1;
  const update = (target) => { const hit = LABELS.find(([s]) => target?.closest?.(s)); c.classList.toggle('is-big', !!hit); if (hit) label.textContent = hit[1]; };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return; c.classList.add('is-on'); x(e.clientX); y(e.clientY); px = e.clientX; py = e.clientY;
    update(e.target);
  }, { passive: true });
  // The page moves under a still mouse, so re-check what is under it on scroll.
  lenis?.on('scroll', () => { if (px >= 0) update(document.elementFromPoint(px, py)); });
  document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
}
function nav() {
  const n = $('[data-nav]'); let lastY = 0;
  ticks.push(() => {
    const y = scrollY; n.classList.toggle('is-solid', y > 40);
    n.classList.toggle('is-hidden', y > 300 && y > lastY + 2 && !n.contains(document.activeElement)); if (Math.abs(y - lastY) > 2) lastY = y;
  });
}

// ---------------------------------------------------------------- hero intro (after the preloader)
function heroIntro(heads) {
  heads.forEach((k) => k.start());
  heads[0].drop();
  gsap.from('[data-fire]', { clipPath: 'inset(100% 0 0 0 round 16px)', duration: 1.1, ease: 'expo.inOut', delay: 0.15 });
  gsap.from('[data-rise]', { y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', delay: 0.5 });
  gsap.from('[data-pop]', { scale: 0, rotate: -20, duration: 0.6, ease: 'back.out(3)', delay: 1.1 });
}
function preloader(done) {
  const pre = $('[data-pre]');
  if (!LIVE || root.classList.contains('bc-seen')) { pre.remove(); done(); return; }
  try { sessionStorage.setItem('bc-seen', '1'); } catch (e) {}
  const word = $('[data-pre-word]'); word.innerHTML = [...word.textContent].map((c) => `<span>${esc(c)}</span>`).join('');
  const count = $('[data-pre-count]'), o = { v: 0 };
  lenis?.stop();
  gsap.timeline({ onComplete: () => { pre.remove(); lenis?.start(); } })
    .from($$('span', word), { yPercent: 130, rotate: () => (Math.random() - 0.5) * 50, scale: 1.4, duration: 0.55, stagger: 0.05, ease: 'back.out(2)' })
    .to(o, { v: 100, duration: 1, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(2, '0'); } }, 0)
    .to($$('span', word), { yPercent: -130, duration: 0.4, stagger: 0.025, ease: 'power3.in' }, 1.2)
    .to(pre, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', duration: 0.7, ease: 'expo.inOut' }, 1.45)
    .add(done, 1.6);
  gsap.set(pre, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' });
}

// ---------------------------------------------------------------- boot
countdown(); spots(); registration(); groups(); pass(); parents();

if (!LIVE) {
  $('[data-pre]')?.remove();
} else {
  lenis = new window.Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: a.getAttribute('href') === '#top' ? 0 : -20, duration: 1.4 }); }));

  const heads = [kinetic($('#hero-title')), kinetic($('.bc-foot__big'))];
  ticks.push((dt) => heads.forEach((k) => k.tick(dt)));

  if (GL) {
    const img = $('[data-fire-img]');
    const boot = async () => {
      try {
        await img.decode();
        const { startFire } = await import('./fire.js');
        const f = startFire($('[data-fire-canvas]'), img, { mobile: MOBILE, dpr: devicePixelRatio || 1 });
        $('[data-fire]').classList.add('is-gl');
        ticks.push((dt, t) => f.tick(t, dt));
      } catch (e) { /* the photo stays */ }
    };
    boot();
  }

  import('./wall.js').then(({ startWall }) => {
    const w = startWall($('[data-wall]'));
    ScrollTrigger.create({ trigger: '[data-wall]', start: 'top 75%', once: true, onEnter: () => w.start() });
    w.onGrab(() => gsap.to('[data-wall-hint]', { opacity: 0, duration: 0.4 }));
    ticks.push((dt) => w.tick(dt));
  }).catch(() => $('[data-wall]').classList.add('is-still'));

  tapes(); week(); retreatMotion(); reveals(); magnets(); cursor(); nav();
  let last = performance.now() / 1000;
  gsap.ticker.add(() => { const t = performance.now() / 1000, dt = Math.min(0.05, t - last); last = t; for (const f of ticks) f(dt, t); });
  preloader(() => heroIntro(heads));
  addEventListener('load', () => ScrollTrigger.refresh());
}
