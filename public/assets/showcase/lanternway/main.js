// Lanternway Church showpiece. The motion is light: a lantern lights the page, morning light pours through
// the sanctuary, a lantern walks the path of a first visit, the sermon transcript lights up as it plays,
// and prayers fold into lanterns that rise into the evening sky.
const root = document.documentElement;
const LIVE = root.classList.contains('lw-live'), GL = !root.classList.contains('lw-nogl');
const MOBILE = matchMedia('(max-width: 760px)').matches;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const IMG = '/assets/showcase/lanternway/img/';
const { gsap, ScrollTrigger, Flip } = window;
gsap.registerPlugin(ScrollTrigger, Flip);
let lenis = null;
const ticks = [];

// ---------------------------------------------------------------- words that rise into the light
function splitWords() {
  for (const el of $$('[data-words]')) {
    if (el.dataset.split) continue; el.dataset.split = '1';
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => { if (!part) return; if (/^\s+$/.test(part)) frag.append(part); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      }
    };
    walk(el);
  }
}
function wordsIn(el, opts = {}) {
  return gsap.from($$('.w', el), { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1.3, stagger: 0.07, ease: 'expo.out', ...opts });
}

// ---------------------------------------------------------------- sermon player with a reading transcript
function player() {
  const btn = $('[data-play]'), cv = $('[data-wave]'), time = $('[data-time]'), x = cv.getContext('2d');
  const tr = $('[data-transcript]');
  for (const p of $$('p', tr)) p.innerHTML = p.textContent.split(' ').map((w) => `<span class="tw">${esc(w)}</span>`).join(' ');
  const words = $$('.tw', tr), TOTAL = 38 * 60, RUN = words.length / 3.2; // seconds of demo playback for the whole transcript
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const N = 72, amps = Array.from({ length: N }, (_, i) => 0.25 + rnd() * 0.6 * (0.6 + 0.4 * Math.sin(i / 5)));
  let prog = 0, playing = false, t = 0;
  const draw = () => {
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const live = playing ? 0.75 + 0.25 * Math.sin(t * 6 + i * 0.7) : 1, a = amps[i] * live, bh = Math.max(3, a * h);
      x.fillStyle = i / N < prog ? '#E3A72F' : 'rgba(250,247,240,.32)';
      x.beginPath(); x.roundRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh, 2); x.fill();
    }
    const s = Math.floor(prog * TOTAL); time.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} / 38:00`;
    const k = Math.floor(prog * words.length);
    words.forEach((wd, i) => { wd.classList.toggle('on', i < k); wd.classList.toggle('now', i === k && playing); });
  };
  btn.addEventListener('click', () => {
    playing = !playing; btn.classList.toggle('is-on', playing); btn.setAttribute('aria-label', playing ? 'Pause sermon' : 'Play sermon');
    if (playing && prog >= 1) prog = 0;
    draw();
  });
  // seek by clicking the waveform
  cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(); prog = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); draw(); });
  let last = performance.now();
  const loop = () => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing) { t += dt; prog = Math.min(1, prog + dt / RUN); if (prog >= 1) { playing = false; btn.classList.remove('is-on'); btn.setAttribute('aria-label', 'Play sermon'); } draw(); }
    requestAnimationFrame(loop);
  };
  draw(); addEventListener('resize', draw); requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- sermon library (Flip filtering)
const SERMONS = [
  ['romans', 'Romans · Week 6', 'Grace That Holds', 'Pastor Dana Ellis · 38 min', 'candles'],
  ['romans', 'Romans · Week 5', 'Rooted', 'Pastor Dana Ellis · 34 min', 'pews'],
  ['romans', 'Romans · Week 4', 'No Condemnation', 'Sam Okoro · 31 min', 'sanctuary'],
  ['psalms', 'Psalms of Ascent · Week 1', 'Songs for the Road', 'Pastor Dana Ellis · 29 min', 'bible'],
  ['psalms', 'Psalms of Ascent · Week 2', 'I Lift My Eyes', 'Ruth Haddad · 33 min', 'ledge'],
  ['psalms', 'Psalms of Ascent · Week 3', 'Unless the Lord Builds', 'Sam Okoro · 30 min', 'chapel'],
  ['advent', 'Advent · Week 1', 'Waiting Well', 'Pastor Dana Ellis · 27 min', 'exterior'],
  ['advent', 'Advent · Week 2', 'Light in the Dark', 'Ruth Haddad · 32 min', 'linen'],
];
function library() {
  const list = $('[data-sermons]'), q = $('[data-sermon-q]'), empty = $('[data-sermon-empty]');
  list.innerHTML = SERMONS.map(([s, series, title, who, img], i) => `<li class="lw-sermon" data-series="${s}" data-flip-id="s${i}"><a href="#watch"><div class="lw-sermon__img"><img src="${IMG}${img}-sm.webp" alt="" role="presentation" loading="lazy"></div><small>${esc(series)}</small><h3>${esc(title)}</h3><p>${esc(who)}</p></a></li>`).join('');
  let series = 'all';
  const apply = () => {
    const term = q.value.trim().toLowerCase(), items = $$('.lw-sermon', list);
    const state = LIVE ? Flip.getState(items) : null;
    let shown = 0;
    items.forEach((li, i) => { const [s, sr, title, who] = SERMONS[i]; const ok = (series === 'all' || s === series) && (!term || `${sr} ${title} ${who}`.toLowerCase().includes(term)); li.hidden = !ok; shown += ok; });
    empty.hidden = shown > 0;
    if (state) Flip.from(state, { duration: 0.8, ease: 'expo.inOut', stagger: 0.03, absolute: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }), onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4 }) });
  };
  $('[data-series]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; series = b.dataset.s; $$('button', $('[data-series]')).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); apply(); });
  q.addEventListener('input', apply);
}

// ---------------------------------------------------------------- events: a photo follows the cursor
function events() {
  for (const b of $$('[data-register]')) b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Registered ✓' : 'Register';
    if (LIVE && on) gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' });
  });
  if (!LIVE) return;
  const fl = $('[data-float]'), img = $('[data-float-img]');
  const fx = gsap.quickTo(fl, 'x', { duration: 0.6, ease: 'power3' }), fy = gsap.quickTo(fl, 'y', { duration: 0.6, ease: 'power3' }), fr = gsap.quickTo(fl, 'rotation', { duration: 0.8, ease: 'power3' });
  let lx = 0;
  $('[data-rows]').addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    fx(e.clientX + 30); fy(e.clientY - 120); fr(Math.max(-12, Math.min(12, (e.clientX - lx) * 0.6))); lx = e.clientX;
    const li = e.target.closest('li[data-img]');
    if (li && e.target.closest('button')) { gsap.to(fl, { opacity: 0, scale: 0.6, duration: 0.3 }); return; }
    if (li) { const src = `${IMG}${li.dataset.img}-sm.webp`; if (!img.src.endsWith(src)) img.src = src; gsap.to(fl, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }); }
  });
  $('[data-rows]').addEventListener('pointerleave', () => gsap.to(fl, { opacity: 0, scale: 0.6, duration: 0.4 }));
}

// ---------------------------------------------------------------- giving
function give() {
  const form = $('[data-give]'), go = $('[data-give-go]'), monthlyBtn = $('[data-monthly]'), other = $('[data-other]'), otherIn = $('[data-other-in]');
  const segs = $$('[data-seg]'), C = 2 * Math.PI * 46, SPLIT = [0.5, 0.3, 0.2];
  let monthly = true, amount = 50;
  const shown = { y: 600, s: [300, 180, 120] };
  const update = () => {
    const a = amount === 'other' ? Math.max(0, Number(otherIn.value) || 0) : amount;
    go.textContent = a ? `Give ${money(a)}${monthly ? ' monthly' : ''}` : 'Enter an amount'; go.disabled = !a;
    const yearly = monthly ? a * 12 : a;
    $('[data-yearly-label]').textContent = monthly ? 'a year' : 'this gift';
    const to = { y: yearly, s: SPLIT.map((k) => yearly * k) };
    const paint = () => { $('[data-yearly]').textContent = money(shown.y); shown.s.forEach((v, i) => { $(`[data-share="${i}"]`).textContent = money(v); }); };
    if (LIVE) gsap.to(shown, { y: to.y, duration: 0.9, ease: 'expo.out', onUpdate: paint }) && gsap.to(shown.s, { 0: to.s[0], 1: to.s[1], 2: to.s[2], duration: 0.9, ease: 'expo.out' });
    else { shown.y = to.y; shown.s = to.s; paint(); }
    // the donut: three arcs, each starting where the last ended (gaps of 2 units)
    let off = 0; segs.forEach((c, i) => { const len = C * SPLIT[i] - 3; c.style.strokeDasharray = `${len} ${C - len}`; c.style.strokeDashoffset = String(-off); off += C * SPLIT[i]; });
    if (LIVE) gsap.fromTo('[data-donut]', { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
  };
  monthlyBtn.addEventListener('click', () => { monthly = !monthly; monthlyBtn.setAttribute('aria-checked', String(monthly)); update(); });
  $('[data-amounts]').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; amount = b.dataset.a === 'other' ? 'other' : Number(b.dataset.a);
    $$('button', $('[data-amounts]')).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    other.hidden = amount !== 'other'; if (amount === 'other') otherIn.focus();
    update();
  });
  otherIn.addEventListener('input', update);
  form.addEventListener('submit', (e) => {
    e.preventDefault(); if (go.disabled) return;
    const a = amount === 'other' ? Number(otherIn.value) : amount;
    $('[data-thanks-msg]').textContent = `Your ${money(a)}${monthly ? ' monthly' : ''} gift to the ${$('[data-fund]').value} is on its way to families, missions and our city.`;
    form.classList.add('is-done'); $('[data-thanks]').hidden = false; $('[data-thanks]').focus({ preventScroll: true });
    if (LIVE) gsap.from('[data-thanks] > *', { y: 30, opacity: 0, filter: 'blur(8px)', duration: 0.9, stagger: 0.1, ease: 'expo.out' });
  });
  $('[data-give-again]').addEventListener('click', () => { form.classList.remove('is-done'); $('[data-thanks]').hidden = true; go.focus(); });
  update();
}

// ---------------------------------------------------------------- prayer: lanterns in the evening sky
function prayer() {
  const form = $('[data-prayer]'), text = $('[data-prayer-text]'), go = $('[data-prayer-go]'), priv = $('[data-private]'), status = $('[data-prayer-status]');
  text.addEventListener('input', () => { go.disabled = !text.value.trim(); });
  priv.addEventListener('click', () => priv.setAttribute('aria-checked', String(priv.getAttribute('aria-checked') !== 'true')));
  let sky = null;
  if (LIVE) sky = startSky($('[data-sky]'));
  form.addEventListener('submit', (e) => {
    e.preventDefault(); if (go.disabled) return;
    const isPrivate = priv.getAttribute('aria-checked') === 'true';
    const done = () => { status.textContent = 'Sent. Someone from our prayer team will pray for this today. (Concept demo: nothing was sent.)'; text.value = ''; go.disabled = true; };
    if (!LIVE) { done(); return; }
    // The note lifts off the card, folds into a paper lantern and floats up into the sky.
    const r = text.getBoundingClientRect(), paper = document.createElement('div');
    paper.className = 'lw-paper'; paper.textContent = isPrivate ? 'A private request' : text.value.trim();
    Object.assign(paper.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.append(paper); text.style.visibility = 'hidden';
    const cx = r.left + r.width / 2;
    gsap.timeline({ onComplete: () => { paper.remove(); text.style.visibility = ''; sky?.add(cx / innerWidth, true); } })
      .to(paper, { y: -30, rotation: -2, boxShadow: '0 30px 60px rgba(0,0,0,.35)', duration: 0.5, ease: 'power2.out' })
      .to(paper, { left: cx - 24, width: 48, height: 64, borderRadius: '14px 14px 20px 20px', color: 'transparent', background: 'radial-gradient(circle at 50% 60%, #ffe2a0, #E3A72F 60%, #b8741c)', boxShadow: '0 0 40px 14px rgba(255,190,90,.55)', duration: 0.8, ease: 'expo.inOut' })
      .to(paper, { y: -r.top - 200, x: () => (Math.random() - 0.5) * 120, rotation: 6, duration: 2.6, ease: 'power1.in' }, '>-0.1');
    done();
  });
}
function startSky(cv) {
  const x = cv.getContext('2d'), lanterns = [];
  let W = 0, H = 0, visible = false;
  const resize = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const add = (fx = Math.random(), mine = false, y) => lanterns.push({ x: fx * W, y: y ?? H + 40, s: mine ? 1.3 : 0.4 + Math.random() * 0.8, v: 10 + Math.random() * 18, ph: Math.random() * 7, mine });
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < 34; i++) add(Math.random(), false, Math.random() * H);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
  let last = performance.now();
  const loop = () => {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now;
    if (visible) {
      x.clearRect(0, 0, W, H);
      for (let i = lanterns.length - 1; i >= 0; i--) {
        const l = lanterns[i]; l.y -= l.v * l.s * dt * (l.mine ? 2.2 : 1); l.x += Math.sin(t * 0.4 + l.ph) * 0.15;
        if (l.y < -60) { if (l.mine) { lanterns.splice(i, 1); continue; } l.y = H + 40; l.x = Math.random() * W; }
        const w = 16 * l.s, h = 22 * l.s, fl = 0.8 + 0.2 * Math.sin(t * 5 + l.ph), a = Math.min(1, (H - l.y) / 200) * (l.mine ? 1 : 0.85);
        const g = x.createRadialGradient(l.x, l.y, 0, l.x, l.y, w * 3.5); g.addColorStop(0, `rgba(255,190,90,${0.35 * fl * a})`); g.addColorStop(1, 'rgba(255,190,90,0)');
        x.fillStyle = g; x.fillRect(l.x - w * 4, l.y - w * 4, w * 8, w * 8);
        const body = x.createLinearGradient(0, l.y - h / 2, 0, l.y + h / 2); body.addColorStop(0, `rgba(255,226,160,${a})`); body.addColorStop(1, `rgba(214,130,40,${a})`);
        x.fillStyle = body; x.beginPath();
        x.moveTo(l.x - w * 0.42, l.y - h / 2); x.lineTo(l.x + w * 0.42, l.y - h / 2); x.lineTo(l.x + w / 2, l.y + h / 2); x.lineTo(l.x - w / 2, l.y + h / 2); x.closePath(); x.fill();
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return { add: (fx, mine) => add(fx, mine, H - 60) };
}

// ---------------------------------------------------------------- live-only scroll scenes
function heroScene(hero) {
  const copy = $('[data-hero-copy]'), second = $('[data-hero-second]');
  ScrollTrigger.create({
    trigger: '[data-hero]', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (s) => {
      const p = s.progress;
      if (hero) hero.uniforms.uDolly.value = p;
      else gsap.set('[data-hero-img]', { scale: 1 + p * 0.25 });
      gsap.set(copy, { opacity: 1 - Math.min(1, p * 2.4), y: -p * 120, filter: `blur(${Math.min(10, p * 24)}px)` });
      const k = Math.max(0, Math.min(1, (p - 0.38) / 0.3)) * (1 - Math.max(0, (p - 0.85) / 0.15));
      gsap.set(second, { opacity: k, scale: 0.94 + k * 0.06, filter: `blur(${(1 - k) * 12}px)` });
      gsap.set('.lw-hero__scroll', { opacity: 0.8 - p * 4 });
    },
  });
}
function visitScene() {
  const sec = $('[data-visit]');
  if (innerWidth < 900) { sec.classList.add('is-flat'); gsap.from('.lw-stops li', { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.lw-stops', start: 'top 85%' } }); return; }
  const svg = $('[data-path-svg]'), path = $('[data-path]'), walker = $('[data-walker]'), stops = $$('.lw-stops li');
  const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
  const AT = [0.02, 0.24, 0.48, 0.68, 0.94];
  gsap.set(stops, { opacity: 0, y: 30 });
  gsap.set(walker, { opacity: 0 });
  const shown = stops.map(() => false);
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.5,
    onUpdate: (s) => {
      const p = Math.min(1, s.progress / 0.92);
      path.style.strokeDashoffset = String(L * (1 - p));
      const pt = path.getPointAtLength(L * p), r = svg.getBoundingClientRect(), sr = sec.querySelector('.lw-visit__stick').getBoundingClientRect();
      gsap.set(walker, { x: r.left - sr.left + (pt.x / 1200) * r.width, y: r.top - sr.top + (pt.y / 520) * r.height, opacity: s.progress > 0.002 ? 1 : 0 });
      stops.forEach((el, i) => { const on = p >= AT[i]; if (on !== shown[i]) { shown[i] = on; gsap.to(el, { opacity: on ? 1 : 0, y: on ? 0 : 30, duration: 0.6, ease: 'expo.out' }); } });
    },
  });
}
function reveals() {
  for (const el of $$('[data-words]')) if (!el.closest('[data-hero]')) wordsIn(el, { scrollTrigger: { trigger: el, start: 'top 85%' } });
  gsap.from('[data-reveal-img]', { clipPath: 'inset(100% 0 0 0 round 14px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '[data-reveal-img]', start: 'top 80%' } });
  gsap.fromTo('[data-reveal-img] img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-reveal-img]', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.lw-sermon', { y: 60, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '[data-sermons]', start: 'top 85%' } });
  gsap.from('.lw-rows li', { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '[data-rows]', start: 'top 85%' } });
  gsap.from('.lw-givecard__in > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.lw-givecard', start: 'top 70%' } });
  gsap.from('[data-donut] [data-seg]', { strokeDasharray: `0 ${2 * Math.PI * 46}`, duration: 1.6, stagger: 0.15, ease: 'expo.inOut', scrollTrigger: { trigger: '[data-donut]', start: 'top 85%' } });
  gsap.from('.lw-prayer__card', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.lw-prayer__card', start: 'top 85%' } });
  // The church windows light up one by one as you arrive at the end.
  ScrollTrigger.create({ trigger: '[data-church]', start: 'top 70%', once: true, onEnter: () => {
    $('[data-church]').classList.add('is-lit');
    gsap.to('[data-church] i', { opacity: 1, scale: 1, duration: 1.6, stagger: 0.25, ease: 'expo.out', delay: 0.4 });
  } });
}
function chrome() {
  const nav = $('[data-nav]'), light = $('[data-light]');
  ticks.push(() => { nav.classList.toggle('is-solid', scrollY > $('[data-hero]').offsetHeight - 90); });
  const lx = gsap.quickTo(light, 'x', { duration: 0.8, ease: 'power3' }), ly = gsap.quickTo(light, 'y', { duration: 0.8, ease: 'power3' });
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; light.classList.add('is-on'); lx(e.clientX); ly(e.clientY); }, { passive: true });
  for (const b of $$('.lw-btn')) b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', `${e.clientX - r.left}px`); b.style.setProperty('--my', `${e.clientY - r.top}px`); });
}
function preloader(done) {
  const pre = $('[data-pre]');
  if (!LIVE || root.classList.contains('lw-seen')) { pre.remove(); done(); return; }
  try { sessionStorage.setItem('lw-seen', '1'); } catch (e) {}
  lenis?.stop();
  const strokes = $$('[data-lantern] path'), flame = $('[data-flame]');
  strokes.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.timeline({ onComplete: () => { pre.remove(); lenis?.start(); } })
    .to(strokes, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
    .from('.lw-pre__word', { opacity: 0, y: 12, duration: 0.6 }, 0.3)
    .fromTo(flame, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 1)
    .to(flame, { scale: 0.85, duration: 0.12, yoyo: true, repeat: 3 }, 1.5)
    .to(flame, { scale: 160, duration: 1.1, ease: 'expo.in' }, 2)
    .to(pre, { opacity: 0, duration: 0.6 }, 2.9)
    .add(done, 2.7);
}

// ---------------------------------------------------------------- boot
splitWords(); player(); library(); events(); give(); prayer();

if (!LIVE) {
  $('[data-pre]')?.remove();
  $('[data-hero-second]').remove();
} else {
  lenis = new window.Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 }); }));
  let hero = null, introDone = false;
  const intro = () => {
    introDone = true;
    wordsIn($('#hero-title'), { delay: 0.1 });
    gsap.from('[data-hero-copy] [data-fade], .lw-hero__scroll', { y: 24, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out', delay: 0.7 });
    gsap.from('.lw-nav > *', { y: -20, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.4, clearProps: 'transform,opacity' });
    if (hero) gsap.to(hero.uniforms.uIn, { value: 1, duration: 2.4, ease: 'power2.out' });
  };
  const bootHero = async () => {
    if (!GL) return;
    try {
      const img = $('[data-hero-img]'), depth = new Image(); depth.src = `${IMG}hero-depth.webp`;
      await Promise.all([img.decode(), depth.decode()]);
      const { startHero } = await import('./hero.js');
      hero = startHero($('[data-hero-gl]'), img, depth, { mobile: MOBILE, dpr: devicePixelRatio || 1 });
      $('[data-hero]').classList.add('is-gl');
      ticks.push((dt, t) => hero.tick(t, dt));
    } catch (e) { /* the photo stays */ }
  };
  if (GL) heroScene(null); visitScene(); reveals(); chrome();
  let last = performance.now() / 1000;
  gsap.ticker.add(() => { const t = performance.now() / 1000, dt = Math.min(0.05, t - last); last = t; for (const f of ticks) f(dt, t); });
  bootHero().then(() => { if (hero) { ScrollTrigger.getAll().filter((s) => s.trigger === $('[data-hero]')).forEach((s) => s.kill()); heroScene(hero); if (introDone) gsap.to(hero.uniforms.uIn, { value: 1, duration: 1.6 }); } });
  preloader(intro);
  addEventListener('load', () => ScrollTrigger.refresh());
}
