// The photo wall: polaroids and stickers are Matter.js bodies. They tumble in when the wall scrolls into
// view, and you can grab one and throw it. The DOM elements follow their bodies every frame.
const { Engine, Bodies, Body, Composite, Constraint, Query } = window.Matter;

export function startWall(wall) {
  const els = [...wall.querySelectorAll('[data-body]')];
  const engine = Engine.create({ gravity: { y: 1.1 } });
  engine.enableSleeping = false;
  let W = wall.clientWidth, H = wall.clientHeight;
  const T = 200;
  const floor = Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true });
  const left = Bodies.rectangle(-T / 2, H / 2 - 600, T, H * 3, { isStatic: true });
  const right = Bodies.rectangle(W + T / 2, H / 2 - 600, T, H * 3, { isStatic: true });
  const roof = Bodies.rectangle(W / 2, -900 - T / 2, W * 3, T, { isStatic: true });
  Composite.add(engine.world, [floor, left, right, roof]);

  const items = els.map((el, i) => {
    const w = el.offsetWidth, h = el.offsetHeight, round = el.classList.contains('bc-blob--round');
    const x = W * (0.12 + ((i * 0.37) % 1) * 0.76), y = -120 - i * 85;
    const body = round
      ? Bodies.circle(x, y, w / 2, { restitution: 0.5, friction: 0.3, frictionAir: 0.012, density: 0.002 })
      : Bodies.rectangle(x, y, w, h, { chamfer: { radius: Math.min(20, h / 2 - 1) }, restitution: 0.35, friction: 0.4, frictionAir: 0.014, density: 0.0016 });
    Body.setAngle(body, (Math.random() - 0.5) * 0.9);
    el.style.touchAction = 'none';
    return { el, body, w, h };
  });
  Composite.add(engine.world, items.map((it) => it.body));
  const sync = () => { for (const { el, body, w, h } of items) el.style.transform = `translate3d(${(body.position.x - w / 2).toFixed(1)}px,${(body.position.y - h / 2).toFixed(1)}px,0) rotate(${body.angle.toFixed(3)}rad)`; };
  sync();

  // Grab and throw
  let grab = null;
  const local = (e) => { const r = wall.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  wall.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') e.preventDefault(); // no text selection while dragging on the wall
    const p = local(e), hit = Query.point(items.map((i) => i.body), p)[0];
    if (!hit) return;
    e.preventDefault();
    grab = Constraint.create({ pointA: p, bodyB: hit, pointB: { x: p.x - hit.position.x, y: p.y - hit.position.y }, stiffness: 0.18, damping: 0.08, length: 0 });
    Composite.add(engine.world, grab); wall.classList.add('is-dragging'); wall.setPointerCapture(e.pointerId);
    onGrab?.();
  });
  wall.addEventListener('pointermove', (e) => { if (grab) grab.pointA = local(e); });
  const drop = () => { if (!grab) return; Composite.remove(engine.world, grab); grab = null; wall.classList.remove('is-dragging'); };
  wall.addEventListener('pointerup', drop); wall.addEventListener('pointercancel', drop);

  addEventListener('resize', () => {
    W = wall.clientWidth; H = wall.clientHeight;
    Body.setPosition(floor, { x: W / 2, y: H + T / 2 }); Body.setPosition(right, { x: W + T / 2, y: H / 2 - 600 });
    for (const { body } of items) if (body.position.x > W) Body.setPosition(body, { x: W - 60, y: body.position.y });
  });

  let running = false, visible = false, onGrab = null;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(wall);
  return {
    start() { running = true; },
    onGrab(fn) { onGrab = fn; },
    tick(dt) { if (!running || !visible) return; Engine.update(engine, Math.min(1000 / 30, dt * 1000)); sync(); },
  };
}
