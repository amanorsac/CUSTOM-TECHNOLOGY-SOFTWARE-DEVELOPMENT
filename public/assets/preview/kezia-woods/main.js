// Kezia Woods draft: forms and disclosures work in every mode; in live mode the page moves like print.
// The nameplate presses in letter by letter, cover lines type themselves, the cover turns like a page,
// chapters rise line by line, pull quotes set word by word, figures roll like a split-flap board and
// press clippings slide in askew.
const root = document.documentElement;
const LIVE = root.classList.contains('kw-live');
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------------------------------------------------------------- talks: disclosures
for (const btn of $$('#speaking button[aria-expanded]')) {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open && LIVE && window.gsap) window.gsap.from(panel, { height: 0, opacity: 0, duration: 0.5, ease: 'expo.out', clearProps: 'height,opacity' });
  });
}

// ---------------------------------------------------------------- forms: validate, confirm, send nothing
// The draft isn't connected to an inbox yet, so a valid form shows a thank-you and makes no request.
for (const form of $$('form[data-form]')) {
  const status = $('[data-status]', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = $$('input, textarea, select', form);
    fields.forEach((f) => f.removeAttribute('aria-invalid'));
    const bad = fields.filter((f) => !f.checkValidity());
    if (bad.length) {
      bad.forEach((f) => f.setAttribute('aria-invalid', 'true'));
      status.classList.add('is-error');
      status.textContent = bad.some((f) => f.type === 'email' && f.value) ? 'Please check the email address.' : 'Please fill in the required fields.';
      bad[0].focus();
      return;
    }
    status.classList.remove('is-error');
    const who = (form.elements.name.value || '').trim().split(' ')[0];
    status.textContent = `Thank you, ${who}. Draft: this form isn't connected yet, so nothing was sent.`;
    form.reset();
  });
}

if (LIVE) boot();

function boot() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new window.Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.4 });
  }));
  const WIDE = matchMedia('(min-width: 1001px)').matches;

  // ---- the nameplate presses in, letter by letter, like ink meeting paper
  const plate = $('[data-nameplate] span');
  plate.innerHTML = [...plate.textContent].map((c) => (c === ' ' ? ' ' : `<span class="ch">${c}</span>`)).join('');
  const intro = gsap.timeline({ delay: 0.15 });
  intro.from('[data-issue]', { opacity: 0, y: -10, duration: 0.8, ease: 'power2.out' })
    .from($$('.ch', plate), { scale: 1.08, filter: 'blur(10px)', opacity: 0, duration: 0.9, stagger: 0.045, ease: 'expo.out' }, 0.1)
    .from('.kw-cover__tag', { opacity: 0, y: 12, duration: 0.8, ease: 'power2.out' }, 0.6)
    .from('.kw-portrait', { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.inOut' }, 0.4);

  // ---- cover lines type themselves in sequence
  for (const li of $$('[data-coverline]')) {
    const b = $('b', li), text = li.lastChild.textContent.trim();
    li.lastChild.textContent = ' ';
    const span = document.createElement('span'); span.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
    li.append(span, sr);
    intro.from(b, { opacity: 0, x: -8, duration: 0.4 }, '>-0.1');
    const o = { n: 0 };
    intro.to(o, { n: text.length, duration: text.length * 0.022, ease: 'none', onUpdate: () => { span.textContent = text.slice(0, Math.round(o.n)); } }, '>');
  }
  intro.from('.kw-cover__hint', { opacity: 0, duration: 0.6 });

  // ---- the cover turns like a page, revealing the opener beneath (wide screens); phones fade it
  const spread = $('[data-spread]'), cover = $('[data-cover]');
  if (WIDE) {
    spread.classList.add('is-book');
    gsap.timeline({ scrollTrigger: { trigger: spread, pin: true, start: 'top top+=58', end: '+=110%', scrub: 0.6 } })
      .to(cover, { rotationY: -100, ease: 'power1.in', boxShadow: '40px 0 80px rgba(22,19,15,.35)' })
      .from('[data-opener] > *', { y: 40, opacity: 0, stagger: 0.08, ease: 'power2.out' }, 0.25);
  } else {
    gsap.from('[data-opener] > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '[data-opener]', start: 'top 80%' } });
  }

  // ---- chapters: headings slide up out of a rule; paragraphs rise line by line
  for (const ch of $$('.kw-ch')) {
    gsap.from($$('.kw-dateline, h2', ch), { y: 36, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: ch, start: 'top 80%' } });
  }
  for (const p of $$('[data-lines]')) {
    gsap.from(p, { y: 24, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 88%' } });
  }
  gsap.from('.kw-drop', { '--drop': 0, duration: 1 });

  // ---- pull quotes set themselves word by word, then a gold rule draws under them
  for (const q of $$('[data-pull]')) {
    const p = $('p', q), text = p.textContent;
    p.setAttribute('aria-label', text);
    p.innerHTML = text.split(' ').map((w) => `<span class="w" aria-hidden="true">${w.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</span>`).join(' ');
    gsap.timeline({ scrollTrigger: { trigger: q, start: 'top 78%' } })
      .from($$('.w', p), { y: '0.5em', opacity: 0, rotate: 2, duration: 0.6, stagger: 0.07, ease: 'back.out(1.6)' })
      .fromTo(q, { '--rule-x': 0 }, { '--rule-x': 1, duration: 0.8, ease: 'expo.inOut' }, '-=0.2');
  }

  // ---- the chapter list follows you; on phones a progress strip fills
  const links = $$('[data-toc] a');
  for (const a of links) {
    const ch = $(a.getAttribute('href'));
    ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => { if (s.isActive) links.forEach((l) => l.classList.toggle('is-on', l === a)); } });
  }
  ScrollTrigger.create({ trigger: '.kw-chapters', start: 'top 60%', end: 'bottom 60%', onUpdate: (s) => $('[data-toc]').style.setProperty('--p', s.progress.toFixed(3)) });

  // ---- the numbers roll like a split-flap board
  const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const dd of $$('[data-flap]')) {
    const target = dd.dataset.flap;
    dd.setAttribute('aria-label', target);
    dd.innerHTML = [...target].map((c) => `<span class="kw-flap" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const cells = $$('.kw-flap', dd);
    ScrollTrigger.create({ trigger: dd, start: 'top 85%', once: true, onEnter: () => {
      cells.forEach((cell, i) => {
        const final = target[i]; if (final === ' ' || final === ',') return;
        let n = 0; const flips = 8 + i * 2;
        const id = setInterval(() => {
          cell.textContent = ++n >= flips ? final : GLYPHS[Math.floor(Math.random() * (/\d/.test(final) ? 10 : GLYPHS.length))];
          if (n >= flips) clearInterval(id);
        }, 45);
      });
      gsap.from(cells, { rotateX: -90, transformOrigin: '50% 50% -10px', duration: 0.5, stagger: 0.04, ease: 'back.out(2)' });
    } });
  }
  gsap.from('.kw-figs > div', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.kw-figs', start: 'top 85%' } });

  // ---- press clippings slide in askew and settle
  $$('[data-clip]').forEach((c, i) => gsap.from(c, { x: i ? 160 : -160, rotate: i ? 10 : -10, opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: '.kw-clips', start: 'top 80%' } }));

  // ---- the contents page and the departments
  gsap.from('.kw-talks li', { x: -30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.kw-talks', start: 'top 85%' } });
  gsap.from('[data-dept]', { y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.kw-depts', start: 'top 85%' } });
  for (const f of $$('.kw-form')) gsap.from(f, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 88%' } });
  for (const h of $$('.kw-h2')) gsap.from(h, { y: 40, opacity: 0, filter: 'blur(6px)', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });

  // ---- the back cover's nameplate slides along as you reach the end
  gsap.fromTo('.kw-back__plate', { xPercent: 8 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.kw-back', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
}
