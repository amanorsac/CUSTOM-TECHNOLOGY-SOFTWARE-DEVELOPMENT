// Hero carousel (.ka-carousel) and swipeable row (.ka-row).
// Manual only: slides never advance on their own (owner decision 2026-11-16).
// Each init returns a destroy() that motion.js calls once the element has
// left the page (the page swapper replaces #main).

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const SWIPE = 40; // px

const ARROW_L = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const ARROW_R = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';

function button(cls, label, html) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.setAttribute('aria-label', label);
  b.innerHTML = html;
  return b;
}

/** Wires one .ka-carousel. Returns destroy(). */
export function initCarousel(el) {
  const slides = [...el.querySelectorAll('.ka-slide')];
  if (!slides.length) return () => {};
  const still = reduced();
  const box = el.querySelector('.ka-carousel__slides') || el;
  box.setAttribute('aria-live', 'polite');

  let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));

  // Controls
  const controls = document.createElement('div');
  controls.className = 'ka-carousel__controls';
  const prev = button('ka-carousel__btn ka-carousel__prev', 'Previous slide', ARROW_L);
  const next = button('ka-carousel__btn ka-carousel__next', 'Next slide', ARROW_R);
  const dotsBox = document.createElement('div');
  dotsBox.className = 'ka-carousel__dots';
  const dots = slides.map((_, i) => {
    const d = button('ka-carousel__dot', `Slide ${i + 1} of ${slides.length}`, '');
    d.addEventListener('click', () => go(i));
    dotsBox.append(d);
    return d;
  });
  const toggle = button('ka-carousel__btn ka-carousel__toggle', 'Play background video', PLAY);
  controls.append(prev, dotsBox, next, toggle);
  if (slides.length < 2) { prev.hidden = true; next.hidden = true; dotsBox.hidden = true; }
  el.append(controls);

  // Video: per-video "wanted" state. Normal motion wants to play; reduced
  // motion waits for the toggle. Plays only while active, visible and on screen.
  const small = matchMedia('(max-width: 960px)').matches;
  const want = new Map();
  let tabVisible = document.visibilityState !== 'hidden';
  let onScreen = true;

  const videoOf = (i) => slides[i].querySelector('video.ka-slide-video');

  function load(v) {
    if (v.getAttribute('src')) return;
    const url = (small && v.dataset.srcSmall) || v.dataset.src;
    if (url) v.src = url;
  }

  function sync() {
    slides.forEach((s, i) => {
      const v = videoOf(i);
      if (!v) return;
      const isActive = i === index;
      if (isActive) load(v);
      const play = isActive && want.get(v) && tabVisible && onScreen;
      if (play) {
        const p = v.play();
        // A refused play (not one cut short by pause()) flips the toggle back to "Play".
        if (p && p.catch) p.catch((err) => {
          if (err && err.name === 'AbortError') return;
          want.set(v, false);
          sync();
        });
      } else if (!v.paused) {
        v.pause();
      }
    });
    const v = videoOf(index);
    toggle.hidden = !v;
    if (v) {
      const on = !!want.get(v);
      toggle.setAttribute('aria-label', on ? 'Pause background video' : 'Play background video');
      toggle.innerHTML = on ? PAUSE : PLAY;
    }
  }

  for (const s of slides) {
    const v = s.querySelector('video.ka-slide-video');
    if (!v) continue;
    want.set(v, !still);
    v.muted = true; // muted autoplay only
    v.autoplay = false;
  }

  function render() {
    slides.forEach((s, i) => {
      const on = i === index;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.inert = !on;
    });
    dots.forEach((d, i) => {
      if (i === index) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    sync();
  }

  function go(i) {
    const n = slides.length;
    const to = ((i % n) + n) % n;
    if (to === index) return;
    index = to;
    render();
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  toggle.addEventListener('click', () => {
    const v = videoOf(index);
    if (!v) return;
    want.set(v, !want.get(v));
    sync();
  });

  el.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault();
    const onDot = dots.includes(document.activeElement);
    go(index + (e.key === 'ArrowRight' ? 1 : -1));
    if (onDot) dots[index].focus();
  });

  // Swipe (pointer events; touch-action: pan-y leaves vertical scrolling alone)
  let startX = null;
  let startY = 0;
  box.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    startX = e.clientX;
    startY = e.clientY;
  });
  const end = (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) >= SWIPE && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', () => { startX = null; });

  const onVisibility = () => {
    tabVisible = document.visibilityState !== 'hidden';
    sync();
  };
  document.addEventListener('visibilitychange', onVisibility);

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    io.observe(el);
  }

  el.classList.add('is-ready');
  if (still) el.classList.add('is-still');
  render();

  return function destroy() {
    document.removeEventListener('visibilitychange', onVisibility);
    if (io) io.disconnect();
    for (const v of want.keys()) {
      v.pause();
      if (v.getAttribute('src')) {
        v.removeAttribute('src');
        v.load(); // drop the download
      }
    }
  };
}

/** Wires one .ka-row: prev/next buttons and one dot per item. Returns destroy(). */
export function initRow(el) {
  const track = el.querySelector('.ka-row__track');
  if (!track) return () => {};
  const items = [...track.children];
  const behavior = () => (reduced() ? 'auto' : 'smooth');

  const controls = document.createElement('div');
  controls.className = 'ka-row__controls';
  const prev = button('ka-row__btn ka-row__prev', 'Previous', ARROW_L);
  const next = button('ka-row__btn ka-row__next', 'Next', ARROW_R);
  const dotsBox = document.createElement('div');
  dotsBox.className = 'ka-row__dots';
  const dots = items.map((item, i) => {
    const d = button('ka-row__dot', `Item ${i + 1} of ${items.length}`, '');
    d.addEventListener('click', () => {
      track.scrollTo({ left: item.offsetLeft - track.firstElementChild.offsetLeft, behavior: behavior() });
    });
    dotsBox.append(d);
    return d;
  });
  controls.append(prev, dotsBox, next);
  el.append(controls);

  const step = () => Math.max(track.clientWidth * 0.85, 1);
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: behavior() }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: behavior() }));

  let frame = 0;
  function update() {
    frame = 0;
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
    const base = track.firstElementChild ? track.firstElementChild.offsetLeft : 0;
    let current = 0;
    if (track.scrollLeft >= max - 1) current = items.length - 1;
    else {
      let best = Infinity;
      items.forEach((item, i) => {
        const d = Math.abs(item.offsetLeft - base - track.scrollLeft);
        if (d < best) { best = d; current = i; }
      });
    }
    dots.forEach((d, i) => {
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  el.classList.add('is-ready');
  update();

  return function destroy() {
    window.removeEventListener('resize', onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}
