// CTSD Lab 04: Physics playground. Every piece is a real DOM element (words, links, the call to action)
// driven by a Matter.js body. Pointer dragging is handled here rather than by Matter's mouse, so empty
// space still scrolls on phones and a quick tap on a link still follows it.
import { chooseMode, loop, MOBILE, markReady } from './common.js';

if (chooseMode({ needsWebGL: false }) && window.Matter) start();

function start() {
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = window.Matter;
  const stage = document.querySelector('[data-pg-stage]');
  const els = [...document.querySelectorAll('.pg-piece')];
  // Resting pieces sleep: they stop jittering (stable to tap) and cost nothing to simulate.
  const engine = Engine.create({ gravity: { x: 0, y: 1.05 }, enableSleeping: true });
  const world = engine.world;

  // ---- Walls follow the stage size ------------------------------------------
  let walls = [], W = 0, H = 0;
  function buildWalls() {
    Composite.remove(world, walls);
    W = stage.clientWidth; H = stage.clientHeight; const t = 200;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),          // floor
      Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }),             // left
      Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true }),          // right
      Bodies.rectangle(W / 2, -H * 1.2, W * 3, t, { isStatic: true }),           // ceiling, high up
    ];
    Composite.add(world, walls);
  }
  buildWalls();

  // ---- Bodies -----------------------------------------------------------------
  const pieces = els.map((el) => ({ el, body: null, w: 0, h: 0, word: el.classList.contains('pg-word') }));
  function makeBody(p, x, y) {
    p.w = p.el.offsetWidth; p.h = p.el.offsetHeight;
    const r = p.word ? Math.min(p.w, p.h) * 0.08 : p.h / 2;
    p.body = Bodies.rectangle(x, y, p.w, p.h, {
      chamfer: { radius: r }, restitution: p.word ? 0.18 : 0.42, friction: 0.35, frictionAir: 0.012,
      density: p.word ? 0.004 : 0.0016, angle: (Math.random() - 0.5) * 0.5,
    });
    Composite.add(world, p.body);
    p.el.classList.add('is-in');
  }
  let timers = [];
  function drop() {
    timers.forEach(clearTimeout); timers = [];
    pieces.forEach((p) => { if (p.body) Composite.remove(world, p.body); p.body = null; p.el.classList.remove('is-in'); });
    // The two words land first, then the pills, then the call to action last.
    pieces.forEach((p, i) => {
      const delay = p.word ? 200 + i * 380 : p.el.classList.contains('pg-cta') ? 2900 : 950 + (i - 2) * 140;
      timers.push(setTimeout(() => {
        const x = p.word ? W * (i === 0 ? 0.3 : 0.62) : W * (0.12 + Math.random() * 0.76);
        makeBody(p, x, -p.el.offsetHeight - 40 - Math.random() * 120);
      }, delay));
    });
  }

  // ---- Drag and throw ---------------------------------------------------------
  let drag = null;
  const local = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  stage.addEventListener('pointerdown', (e) => {
    const p = pieces.find((q) => q.el === e.target.closest('.pg-piece'));
    if (!p || !p.body) return;
    Sleeping.set(p.body, false);
    const pt = local(e);
    const off = { x: pt.x - p.body.position.x, y: pt.y - p.body.position.y };
    const c = Constraint.create({ pointA: pt, bodyB: p.body, pointB: rotate(off, -p.body.angle), stiffness: 0.12, damping: 0.08, length: 0 });
    Composite.add(world, c);
    drag = { p, c, start: pt, moved: 0, id: e.pointerId };
    p.el.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const pt = local(e); drag.c.pointA = pt;
    drag.moved = Math.max(drag.moved, Math.hypot(pt.x - drag.start.x, pt.y - drag.start.y));
  });
  const release = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    Composite.remove(world, drag.c);
    drag.p.el.dataset.dragged = drag.moved > 6 ? '1' : '';
    drag = null;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  // A drag is not a click: swallow the click that ends a throw.
  stage.addEventListener('click', (e) => {
    const el = e.target.closest('.pg-piece');
    if (el?.dataset.dragged === '1') { e.preventDefault(); el.dataset.dragged = ''; }
  }, true);
  const rotate = (v, a) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) });

  // ---- Controls ---------------------------------------------------------------
  document.querySelector('[data-pg-shake]').addEventListener('click', () => {
    pieces.forEach((p) => p.body && Sleeping.set(p.body, false));
    pieces.forEach((p) => p.body && Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 26, y: -14 - Math.random() * 16 }));
    pieces.forEach((p) => p.body && Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.4));
  });
  document.querySelector('[data-pg-reset]').addEventListener('click', drop);
  const tiltBtn = document.querySelector('[data-pg-tilt]');
  const onTilt = (e) => {
    if (e.gamma == null) return;
    engine.gravity.x = Math.max(-1, Math.min(1, e.gamma / 35));
    pieces.forEach((p) => p.body && p.body.isSleeping && Math.abs(engine.gravity.x) > 0.15 && Sleeping.set(p.body, false));
    engine.gravity.y = Math.max(-0.4, Math.min(1.2, (e.beta ?? 45) / 45));
  };
  if (MOBILE && navigator.maxTouchPoints > 0 && 'DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      tiltBtn.hidden = false; // iOS asks for permission from a tap
      tiltBtn.addEventListener('click', async () => {
        try { if (await DeviceOrientationEvent.requestPermission() === 'granted') { addEventListener('deviceorientation', onTilt); tiltBtn.hidden = true; } } catch { /* declined */ }
      });
    } else addEventListener('deviceorientation', onTilt);
  }

  // ---- Resize, start, render -------------------------------------------------
  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      buildWalls();
      pieces.forEach((p) => p.body && Body.setPosition(p.body, { x: Math.min(Math.max(p.body.position.x, p.w / 2), W - p.w / 2), y: Math.min(p.body.position.y, H - p.h) }));
    }, 150);
  });
  // Start dropping once the stage is on screen (it always is on load, but this keeps a return visit lively).
  document.fonts.ready.then(drop);

  loop((t, dt) => {
    Engine.update(engine, Math.min(dt, 1 / 30) * 1000);
    for (const p of pieces) {
      if (!p.body) continue;
      const { x, y } = p.body.position;
      p.el.style.transform = `translate(${x - p.w / 2}px, ${y - p.h / 2}px) rotate(${p.body.angle}rad)`;
    }
    markReady();
  });
}
