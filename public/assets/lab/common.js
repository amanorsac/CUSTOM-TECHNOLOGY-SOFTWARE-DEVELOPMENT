// Shared helpers for the CTSD Lab experiments.

export const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
export const DPR = Math.min(2, window.devicePixelRatio || 1);
export const BRAND = { deep: 0x3E2723, night: 0x2B1B18, wood: 0x6B4F32, tan: 0xC89B6B, gold: 0xD4AF37, cream: 0xF7EFE4 };

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

// Decide live or still mode once, before any canvas work. ?still=1 forces still mode (for review and tests).
export function chooseMode({ needsWebGL = true } = {}) {
  const root = document.documentElement;
  const forced = new URLSearchParams(location.search).has('still');
  const reason = forced ? 'forced' : REDUCED ? 'reduced' : needsWebGL && !hasWebGL() ? 'nowebgl' : null;
  if (reason) { root.classList.add('lab-static'); root.dataset.labMode = reason; return false; }
  root.dataset.labMode = 'live';
  return true;
}

// requestAnimationFrame loop that pauses while the tab is hidden. fn(timeSeconds, deltaSeconds).
export function loop(fn) {
  let id = 0, last = performance.now();
  const tick = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; fn(now / 1000, dt); id = requestAnimationFrame(tick); };
  id = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(id);
    if (!document.hidden) { last = performance.now(); id = requestAnimationFrame(tick); }
  });
}

// Fraction scrolled through an element (default: the live story), 0..1: 0 when its top meets the
// top of the window, 1 when its bottom meets the bottom of the window.
export const scrollProgress = (el = document.querySelector('.lab-live')) => {
  if (!el) return 0;
  const r = el.getBoundingClientRect(), max = r.height - innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 0;
};

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const range = (x, a, b) => clamp((x - a) / (b - a));

export function loadImage(src) {
  const i = new Image(); i.src = src;
  // decode() waits until the image can be drawn (onload can fire earlier for SVGs).
  return i.decode().then(() => i);
}

// Marks the page ready for screenshots/tests once the first live frame has drawn.
export function markReady() { document.documentElement.dataset.labReady = '1'; }
