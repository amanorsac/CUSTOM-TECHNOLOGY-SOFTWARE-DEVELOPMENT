// Mira's Sartorial draft: the menu, the piece view, and WhatsApp request messages.
// Nothing is posted or fetched. The only way out is a WhatsApp link the visitor taps.
const IMG = '/assets/preview/miras-sartorial/img/';
const NUMBER = document.body.dataset.whatsapp || '';
const GREETING = "Hello Mira's Sartorial, I'd like to request a custom piece.";
const PIECES = {
  'red-floral': { name: 'Red Floral', gallery: ['red-floral-flat', 'red-floral-side', 'red-floral-back', 'red-floral-waist', 'red-floral-fabric'] },
  'purple-swirl': { name: 'Purple Swirl', gallery: ['purple-swirl-flat', 'purple-swirl-model'] },
  'pink-swirl': { name: 'Pink Swirl', gallery: ['pink-swirl-flat', 'pink-swirl-model'] },
  'multi-abstract': { name: 'Multi Abstract', gallery: ['multi-abstract-flat', 'multi-abstract-model'] },
  'yellow-floral': { name: 'Yellow Floral', gallery: ['yellow-floral-model'] },
};
const $ = (s, root = document) => root.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: slims after 80 px */
const head = $('#head');
const slim = () => head.classList.toggle('is-slim', scrollY > 80);
addEventListener('scroll', slim, { passive: true }); slim();

/* Menu */
const nav = $('#nav'), scrim = $('#scrim'), menuBtn = $('#menuBtn');
function setNav(open) {
  if (open) nav.hidden = false;
  requestAnimationFrame(() => { nav.classList.toggle('is-open', open); scrim.classList.toggle('is-open', open); });
  menuBtn.setAttribute('aria-expanded', String(open));
  if (open) $('a', nav).focus();
  else { menuBtn.focus({ preventScroll: true }); setTimeout(() => { if (!nav.classList.contains('is-open')) nav.hidden = true; }, 460); }
}
menuBtn.addEventListener('click', () => setNav(true));
$('#navClose').addEventListener('click', () => setNav(false));
scrim.addEventListener('click', () => setNav(false));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setNav(false); });

/* Reveal: only what starts below the fold wipes in */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.remove('is-pre'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.ms-rv').forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('is-pre'); io.observe(el); }
  });
}

/* Messages */
function waLink(text) { return `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`; }
function showMessage(box, text) {
  box.replaceChildren();
  const label = document.createElement('p'); label.className = 'ms-label'; label.style.margin = '0'; label.textContent = 'Your message';
  const pre = document.createElement('pre'); pre.textContent = text;
  const row = document.createElement('div'); row.className = 'ms-msg__row';
  if (NUMBER) { const a = document.createElement('a'); a.href = waLink(text); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open WhatsApp'; row.append(a); }
  const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'Copy message';
  copy.addEventListener('click', () => {
    const fallback = () => { getSelection().selectAllChildren(pre); copy.textContent = 'Selected'; };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => { copy.textContent = 'Copied'; }, fallback); else fallback();
  });
  row.append(copy);
  box.append(label, pre, row);
  box.hidden = false;
}
function setError(id, msg) {
  const field = document.getElementById(id);
  document.getElementById(`${id}-err`).textContent = msg || '';
  if (msg) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
  return !msg;
}

/* The order form and the service buttons */
document.querySelectorAll('[data-service]').forEach((b) => b.addEventListener('click', () => {
  $('#o-service').value = b.dataset.service;
  setError('o-service', '');
  $('#order').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  $('#o-note').focus({ preventScroll: true });
}));
$('#orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const service = $('#o-service').value;
  if (!setError('o-service', service ? '' : 'Choose what you would like made.')) { $('#o-msg').hidden = true; return $('#o-service').focus(); }
  const note = $('#o-note').value.trim();
  const what = service === 'A piece from the edit' ? 'Piece: From the Wide-Leg Edit' : `Service: ${service}`;
  showMessage($('#o-msg'), [GREETING, what, note && `Note: ${note}`].filter(Boolean).join('\n'));
});

/* A piece's view */
const dlg = $('#piece');
let current = null, slugOpen = '', idx = 0;
function setImg(i) {
  idx = (i + current.gallery.length) % current.gallery.length;
  const img = $('#p-img');
  img.src = `${IMG}${current.gallery[idx]}.webp`;
  img.alt = `${current.name} wide-leg trousers, photo ${idx + 1} of ${current.gallery.length}`;
  [...$('#p-thumbs').children].forEach((b, j) => b.setAttribute('aria-current', String(j === idx)));
}
function openPiece(slug) {
  const piece = PIECES[slug];
  if (!piece) return false;
  current = piece; slugOpen = slug;
  $('#p-name').textContent = `${piece.name} wide-leg trousers`;
  $('#p-thumbs').replaceChildren(...piece.gallery.map((g, j) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', `Photo ${j + 1}`);
    const im = document.createElement('img'); im.src = `${IMG}${g}.webp`; im.alt = '';
    b.append(im); b.addEventListener('click', () => setImg(j)); return b;
  }));
  setImg(0);
  $('#pForm').reset(); $('#p-msg').hidden = true; $('#p-meas-field').hidden = true;
  setError('p-size', ''); setError('p-meas', '');
  if (!dlg.open) dlg.showModal();
  return true;
}
const pieceFromHash = () => (location.hash.match(/^#piece-([a-z-]+)$/) || [])[1] || '';
dlg.addEventListener('close', () => {
  if (pieceFromHash()) history.replaceState(null, '', location.pathname + location.search);
  document.querySelector(`.ms-card[data-slug="${slugOpen}"]`)?.focus({ preventScroll: true });
});
$('#pClose').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('keydown', (e) => {
  if (e.target.closest('form')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); setImg(idx + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); setImg(idx - 1); }
});
document.querySelectorAll('.ms-card').forEach((card) => card.addEventListener('click', (e) => {
  e.preventDefault();
  history.pushState(null, '', `#piece-${card.dataset.slug}`);
  openPiece(card.dataset.slug);
}));
// Back closes the view; a link to a piece opens it.
addEventListener('popstate', () => { const s = pieceFromHash(); if (s) openPiece(s); else if (dlg.open) dlg.close(); });
addEventListener('hashchange', () => { const s = pieceFromHash(); if (s && !dlg.open) openPiece(s); });
if (pieceFromHash()) openPiece(pieceFromHash());

$('#p-size').addEventListener('change', () => {
  const own = $('#p-size').value === 'My own measurements';
  $('#p-meas-field').hidden = !own;
  if (!own) setError('p-meas', '');
});
$('#pForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const size = $('#p-size').value, own = size === 'My own measurements', meas = $('#p-meas').value.trim();
  const okSize = setError('p-size', size ? '' : 'Choose a size, or give your own measurements.');
  const okMeas = setError('p-meas', own && !meas ? 'Add your waist, hips and length.' : '');
  if (!okSize || !okMeas) { $('#p-msg').hidden = true; return (okSize ? $('#p-meas') : $('#p-size')).focus(); }
  const note = $('#p-note').value.trim();
  showMessage($('#p-msg'), [GREETING, `Piece: ${current.name} wide-leg trousers`, `Size: ${size}`, own && `Measurements: ${meas}`, note && `Note: ${note}`].filter(Boolean).join('\n'));
});
