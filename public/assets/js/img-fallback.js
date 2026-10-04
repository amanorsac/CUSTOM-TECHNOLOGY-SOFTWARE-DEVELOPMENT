// Runtime image fallback (controller rulings A and B).
// Image files may not exist yet; the JSON keeps their final paths.
//   1. srcset (with -sm thumbnails) fails  -> drop srcset, retry the full src
//   2. full src fails, mode 'placeholder'  -> swap to the shared placeholder
//      full src fails, mode 'remove'       -> remove the slide, call onRemove
//   3. placeholder fails                   -> hide the image
// Handlers are attached before src is set, so early errors are never missed.
// Images stay transparent until they load (CSS: img[data-fb]:not(.is-loaded)),
// so a broken-image icon is never painted.

export const PLACEHOLDER = '/images/designs/_placeholder.webp';

export const assetUrl = (path) => `/${String(path).replace(/^\/+/, '')}`;
export const smVariant = (path) => path.replace(/\.webp$/i, '-sm.webp');

/**
 * Create an <img> with fallback handling.
 * @param {object} o
 * @param {string} o.path       image path from designs.json (no leading slash)
 * @param {string} o.alt
 * @param {number} o.full       intrinsic width of the full image (srcset w descriptor)
 * @param {string} [o.sizes]    sizes attribute; omit for no srcset
 * @param {'placeholder'|'remove'} [o.mode]
 * @param {(img: HTMLImageElement) => void} [o.onRemove]
 * @param {boolean} [o.lazy]
 * @param {string} [o.className]
 * @param {boolean} [o.priority] fetchpriority=high (LCP image)
 * @param {number} [o.width]  [o.height]  layout hints against CLS
 */
export function fallbackImg(o) {
  const img = document.createElement('img');
  const src = o.path ? assetUrl(o.path) : PLACEHOLDER;
  let stage = o.path && o.sizes ? 0 : 1;
  if (!o.path) stage = 2;

  img.dataset.fb = '';
  if (o.className) img.className = o.className;
  img.alt = o.alt || '';
  img.decoding = 'async';
  if (o.lazy) img.loading = 'lazy';
  if (o.priority) img.setAttribute('fetchpriority', 'high');
  if (o.width) img.width = o.width;
  if (o.height) img.height = o.height;

  img.addEventListener('load', () => img.classList.add('is-loaded'));
  img.addEventListener('error', () => {
    // It already tried to load, so it is in or near view: retry eagerly, or a
    // lazy retry may wait until it is scrolled back into view.
    img.loading = 'eager';
    if (stage === 0) {
      stage = 1;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = src;
      return;
    }
    if (stage === 1) {
      stage = 2;
      if (o.mode === 'remove') {
        const slide = img.closest('[data-slide]') || img;
        slide.remove();
        if (o.onRemove) o.onRemove(img);
        return;
      }
      img.removeAttribute('srcset');
      img.dataset.placeholder = '';
      img.src = PLACEHOLDER;
      return;
    }
    stage = 3;
    img.hidden = true;
  });

  // Attributes that start a fetch go last, after the handlers.
  if (stage === 0) {
    img.sizes = o.sizes;
    img.srcset = `${assetUrl(smVariant(o.path))} 600w, ${src} ${o.full || 1200}w`;
  }
  if (stage === 2) img.dataset.placeholder = '';
  img.src = stage === 2 ? PLACEHOLDER : src;
  return img;
}
