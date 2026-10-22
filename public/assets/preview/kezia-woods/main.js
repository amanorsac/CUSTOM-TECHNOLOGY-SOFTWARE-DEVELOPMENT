// Kezia Woods draft: the phone menu, quiet reveals, a gentle hero parallax, and forms that send nothing.
const $ = (s, root = document) => root.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('still');
const SENT = "Thank you. This draft isn't connected yet, so nothing was sent.";

/* Header hairline after scroll */
const head = $('#head');
const onScroll = () => head.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* Phone menu */
const nav = $('#nav'), btn = $('#menuBtn'), scrim = $('#scrim');
const isOpen = () => nav.classList.contains('is-open');
function setMenu(open) {
  nav.classList.toggle('is-open', open);
  scrim.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', String(open));
  if (open) $('a', nav).focus(); else btn.focus({ preventScroll: true });
}
btn.addEventListener('click', () => setMenu(true));
$('#navClose').addEventListener('click', () => setMenu(false));
scrim.addEventListener('click', () => setMenu(false));
nav.addEventListener('click', (e) => { if (e.target.closest('a') && isOpen()) setMenu(false); });
addEventListener('keydown', (e) => {
  if (!isOpen()) return;
  if (e.key === 'Escape') setMenu(false);
  if (e.key === 'Tab') { // keep focus inside the open panel
    const items = [...nav.querySelectorAll('a, button')];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* Reveals: only what starts below the fold */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.remove('is-pre'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.kw-fade').forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight * 0.92) { el.classList.add('is-pre'); io.observe(el); }
  });
}

/* Hero parallax: at most 40 px across the hero's height */
const art = $('[data-parallax]');
if (art && !reduced) {
  const hero = art.closest('.kw-hero');
  let ticking = false;
  const move = () => {
    ticking = false;
    const r = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / r.height));
    art.style.transform = `translate3d(0, ${(p * 40).toFixed(1)}px, 0)`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
}

/* Forms: inline errors, then a thank-you. Nothing is sent. */
const MESSAGES = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address.',
  message: 'Please add a short message.',
};
document.querySelectorAll('#book-form, #partner-form, #follow-form').forEach((form) => {
  const status = $('[role="status"]', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    let firstBad = null;
    form.querySelectorAll('[required]').forEach((field) => {
      const err = document.getElementById(`${field.id}-err`);
      const ok = field.value.trim() && field.checkValidity();
      err.textContent = ok ? '' : MESSAGES[field.name] || 'Please fill this in.';
      if (ok) field.removeAttribute('aria-invalid'); else { field.setAttribute('aria-invalid', 'true'); firstBad ||= field; }
    });
    if (firstBad) return firstBad.focus();
    form.reset();
    status.textContent = SENT;
  });
});
