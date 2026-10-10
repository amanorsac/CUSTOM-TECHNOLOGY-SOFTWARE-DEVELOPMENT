// Spring letters: every letter of a headline sits on a spring at its home position. The cursor (or a finger)
// shoves the letters aside, and they wobble back. drop() throws them in from above for the entrance.

const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function kinetic(el) {
  const text = el.textContent.trim();
  // Screen readers get the sentence once; the letters are decoration.
  el.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">${text.split(' ').map((w) => `<span class="w">${[...w].map((c) => `<span class="l">${esc(c)}</span>`).join('')}</span>`).join(' ')}</span>`;
  const letters = [...el.querySelectorAll('.l')].map((node) => ({ node, x: 0, y: 0, vx: 0, vy: 0, cx: 0, cy: 0, w: 0 }));
  let visible = false, active = false;
  const ptr = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };

  // Home centres, in page coordinates, measured with the springs at rest.
  const measure = () => {
    for (const l of letters) l.node.style.transform = 'none';
    for (const l of letters) { const r = l.node.getBoundingClientRect(); l.cx = r.left + r.width / 2 + scrollX; l.cy = r.top + r.height / 2 + scrollY; l.w = r.width; }
    apply();
  };
  const apply = () => { for (const l of letters) l.node.style.transform = `translate3d(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px,0) rotate(${(l.x * 0.06 + l.vx * 0.7).toFixed(2)}deg)`; };

  addEventListener('pointermove', (e) => {
    const now = performance.now(), x = e.clientX + scrollX, y = e.clientY + scrollY, dt = Math.max(8, now - ptr.t);
    if (ptr.t) { ptr.vx = (x - ptr.x) / dt * 16; ptr.vy = (y - ptr.y) / dt * 16; }
    ptr.x = x; ptr.y = y; ptr.t = now;
  }, { passive: true });
  addEventListener('resize', () => { if (active) measure(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(el);

  return {
    start() { active = true; measure(); },
    // Letters fall in from above, one after another, and land on their springs.
    drop(stagger = 0.035) {
      active = true; measure();
      letters.forEach((l, i) => { l.y = -innerHeight * 0.9 - Math.random() * 300; l.x = (Math.random() - 0.5) * 200; l.vx = 0; l.vy = 0; l.delay = i * stagger; });
      apply();
      this.t0 = performance.now();
    },
    tick(dt) {
      if (!active || !visible) return;
      const R = Math.max(120, innerWidth * 0.1), since = this.t0 ? (performance.now() - this.t0) / 1000 : 99;
      ptr.vx *= 0.9; ptr.vy *= 0.9;
      for (const l of letters) {
        if (l.delay && since < l.delay) continue;
        const dx = l.cx + l.x - ptr.x, dy = l.cy + l.y - ptr.y, d = Math.hypot(dx, dy);
        if (d < R && d > 0.1) {
          const f = Math.pow(1 - d / R, 2);
          l.vx += (dx / d) * f * 9 + ptr.vx * f * 0.35;
          l.vy += (dy / d) * f * 9 + ptr.vy * f * 0.35;
        }
        l.vx += -l.x * 0.06; l.vy += -l.y * 0.06;
        l.vx *= 0.84; l.vy *= 0.84;
        l.x += l.vx; l.y += l.vy;
      }
      apply();
    },
  };
}
