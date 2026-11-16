// Reveal motion for the Kingsley draft, plus the carousel and row.
// initMotion(root) is called on load and after every page swap; it is
// idempotent. Hooks: .ka-split (lines rise), .ka-wedge (slanted wipe),
// .ka-up (fade up), .ka-parallax (background at 0.6x scroll). Under
// prefers-reduced-motion nothing is hidden or moved; with JS off the CSS
// hides nothing because html.ka-motion is never set.
import { initCarousel, initRow } from './carousel.js';

const REVEAL = '.ka-split, .ka-wedge, .ka-up';
const done = new WeakSet(); // elements already wired
const live = new Set(); // { el, destroy } for things bound outside their element
let revealer = null;
const watched = new Set();

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Destroys anything whose element has left the page. */
function sweep() {
  for (const item of live) {
    if (!item.el.isConnected) {
      try { item.destroy(); } catch { /* ignore */ }
      live.delete(item);
    }
  }
  for (const el of watched) {
    if (!el.isConnected) {
      if (revealer) revealer.unobserve(el);
      watched.delete(el);
    }
  }
}

/** Wraps each rendered line of a heading in .ka-line > .ka-line__inner. */
function splitLines(el) {
  // Tokens: words from text nodes; element children stay whole.
  const tokens = [];
  for (const node of [...el.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) tokens.push(document.createTextNode(' '));
        else {
          const w = document.createElement('span');
          w.className = 'ka-word';
          w.textContent = part;
          tokens.push(w);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      tokens.push(node);
    }
  }
  el.replaceChildren(...tokens);

  const lines = [];
  let top = null;
  for (const t of tokens) {
    if (t.nodeType !== Node.ELEMENT_NODE) {
      if (lines.length) lines[lines.length - 1].push(t);
      continue;
    }
    if (t.tagName === 'BR') { top = null; continue; }
    const y = t.getBoundingClientRect().top;
    if (top === null || Math.abs(y - top) > 2) {
      lines.push([]);
      top = y;
    }
    lines[lines.length - 1].push(t);
  }

  const out = lines.map((parts, i) => {
    const line = document.createElement('span');
    line.className = 'ka-line';
    const inner = document.createElement('span');
    inner.className = 'ka-line__inner';
    inner.style.setProperty('--i', String(i));
    // Unwrap word spans back to text; trim leading/trailing spaces.
    while (parts.length && parts[parts.length - 1].nodeType === Node.TEXT_NODE) parts.pop();
    for (const p of parts) inner.append(p.classList && p.classList.contains('ka-word') ? p.textContent : p);
    line.append(inner);
    // Keep a space between lines for anything reading textContent.
    if (i < lines.length - 1) line.append(' ');
    return line;
  });
  el.replaceChildren(...out);
  el.normalize();
}

function initParallax(el) {
  const bg = el.querySelector('.ka-parallax__bg');
  if (!bg) return () => {};
  let frame = 0;
  let visible = false;
  const update = () => {
    frame = 0;
    const r = el.getBoundingClientRect();
    const offset = r.top + r.height / 2 - innerHeight / 2;
    const room = Math.max(0, (bg.offsetHeight - el.offsetHeight) / 2);
    const y = Math.max(-room, Math.min(room, -offset * 0.4)); // 0.6x scroll speed
    bg.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  };
  const onScroll = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    onScroll();
  });
  io.observe(el);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  return () => {
    io.disconnect();
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}

function keep(el, destroy) {
  live.add({ el, destroy });
}

/** Wires every motion hook, carousel and row inside root. Safe to call again. */
export function initMotion(root = document) {
  if (!root) return;
  sweep();
  const still = reduced() || !('IntersectionObserver' in window);

  for (const el of root.querySelectorAll('.ka-carousel')) {
    if (done.has(el)) continue;
    done.add(el);
    keep(el, initCarousel(el));
  }
  for (const el of root.querySelectorAll('.ka-row')) {
    if (done.has(el)) continue;
    done.add(el);
    keep(el, initRow(el));
  }

  if (still) return; // final state already: nothing hidden, nothing moves

  document.documentElement.classList.add('ka-motion');

  revealer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        // 15% of the element, or (for elements too tall to ever reach that)
        // a band 15% of the viewport tall, whichever comes first.
        const view = e.rootBounds ? e.rootBounds.height : innerHeight;
        if (e.intersectionRatio < 0.15 && e.intersectionRect.height < view * 0.15) continue;
        e.target.classList.add('is-in');
        revealer.unobserve(e.target);
        watched.delete(e.target);
      }
    },
    { threshold: [0, 0.01, 0.02, 0.05, 0.1, 0.15] },
  );

  const watch = (el) => {
    if (!el.isConnected || el.classList.contains('is-in')) return;
    watched.add(el);
    revealer.observe(el);
  };
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  for (const el of root.querySelectorAll(REVEAL)) {
    if (done.has(el)) continue;
    done.add(el);
    if (el.classList.contains('ka-split')) {
      // Measure lines with the real fonts; the heading stays hidden till then.
      fonts.then(() => {
        if (!el.isConnected) return;
        splitLines(el);
        el.classList.add('is-split');
        watch(el);
      });
    } else {
      watch(el);
    }
  }

  for (const el of root.querySelectorAll('.ka-parallax')) {
    if (done.has(el)) continue;
    done.add(el);
    keep(el, initParallax(el));
  }
}
