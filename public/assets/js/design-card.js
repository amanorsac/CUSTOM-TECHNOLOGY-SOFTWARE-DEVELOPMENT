// Design card used by the shop grid and the design page's related row.
import { fallbackImg, assetUrl } from './img-fallback.js';

export const CATEGORY_LABEL = {
  all: 'All', church: 'Church', education: 'Education', business: 'Business', software: 'Software',
};

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// Hover image: app-1 in a phone frame, fetched on first hover/focus and only
// shown once it has actually loaded. A missing file never reaches the DOM.
function armHover(card, media, design) {
  const path = design.images && Array.isArray(design.images.app) && design.images.app[0];
  if (!path) return;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    const probe = new Image();
    probe.decoding = 'async';
    probe.alt = '';
    probe.addEventListener('load', () => {
      const alt = el('div', 'design-card__alt');
      alt.setAttribute('aria-hidden', 'true');
      const phone = el('div', 'design-card__phone');
      phone.append(probe);
      alt.append(phone);
      media.append(alt);
      requestAnimationFrame(() => card.classList.add('has-alt'));
    }, { once: true });
    probe.src = assetUrl(path);
  };
  card.addEventListener('pointerenter', start);
  card.addEventListener('focus', start);
}

/**
 * @param {object} design  entry from designs.json
 * @param {object} [opts]
 * @param {boolean} [opts.eager]   load the cover eagerly (above the fold)
 * @param {string}  [opts.heading] heading tag for the name (default h3)
 */
export function designCard(design, { eager = false, heading = 'h3' } = {}) {
  const li = document.createElement('li');
  const a = el('a', 'design-card');
  a.href = `/designs/${encodeURIComponent(design.slug)}`;

  const media = el('div', 'design-card__media');
  media.append(fallbackImg({
    path: design.images && design.images.cover,
    alt: `${design.name} concept — cover screen`,
    full: 1200,
    sizes: '(min-width: 1100px) 380px, (min-width: 700px) 46vw, 92vw',
    mode: 'placeholder',
    lazy: !eager,
    width: 1200,
    height: 800,
    className: 'design-card__cover',
  }));
  const badge = el('span', 'badge-concept design-card__badge', 'Concept');
  media.append(badge);

  const body = el('div', 'design-card__body');
  body.append(
    el('p', 'design-card__cat', CATEGORY_LABEL[design.category] || design.category),
    el(heading, 'design-card__name', design.name),
    el('p', 'design-card__tagline', design.tagline),
  );
  if (Array.isArray(design.systems) && design.systems.length) {
    const sys = el('p', 'design-card__systems');
    sys.append(el('span', 'sr-only', 'Includes: '), document.createTextNode(design.systems.join(' · ')));
    body.append(sys);
  }
  const more = el('span', 'design-card__more');
  more.setAttribute('aria-hidden', 'true');
  more.innerHTML = 'View concept <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  body.append(more);

  a.append(media, body);
  armHover(a, media, design);
  li.append(a);
  return li;
}
