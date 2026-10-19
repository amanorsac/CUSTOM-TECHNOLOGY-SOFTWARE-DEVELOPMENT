/* =====================================================================
   The toy cube in the home hero: a 3 x 3 puzzle cube in the Allkidz
   colours, with A B C 1 2 3 on the centre squares.

     drag the background   spin the whole cube
     drag a square         twist that row or column
     Mix it up             scramble it (animated)
     Solve it              play every move back in reverse

   Loaded lazily by ak.js once the page is idle, so the photo and the
   words come first. If WebGL is missing the toy simply stays hidden.
   ===================================================================== */
import * as THREE from '/assets/vendor/three.min.js';

const FACES = [ // [outward normal, colour, centre label]
  [[0, 1, 0],  '#FFC531', 'A'],  // top: sunshine
  [[0, 0, 1],  '#5CC25B', 'B'],  // front: grass
  [[1, 0, 0],  '#E8452C', 'C'],  // right: tomato
  [[0, -1, 0], '#9B6BDF', '1'],  // bottom: grape
  [[0, 0, -1], '#FF5FA2', '2'],  // back: bubblegum
  [[-1, 0, 0], '#2EA7E0', '3']   // left: sky
];
const AXES = ['x', 'y', 'z'];

export function mount(root) {
  const canvas = root.querySelector('canvas');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10.5);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffe9c2, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 5, 6);
  scene.add(sun);

  const cube = new THREE.Group();
  cube.rotation.set(0.52, -0.62, 0);
  scene.add(cube);

  /* ---------- pieces ---------- */
  const bodyGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#2B2A6B', roughness: 0.6 });
  const shape = new THREE.Shape(), s = 0.41, r = 0.12;
  shape.moveTo(-s + r, -s); shape.lineTo(s - r, -s); shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r); shape.quadraticCurveTo(s, s, s - r, s); shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r); shape.lineTo(-s, -s + r); shape.quadraticCurveTo(-s, -s, -s + r, -s);
  const stickerGeo = new THREE.ShapeGeometry(shape, 6);
  // ShapeGeometry UVs follow the shape's coordinates; remap them to 0..1 so a label texture fits
  const uv = stickerGeo.attributes.uv, pos = stickerGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + s) / (2 * s), (pos.getY(i) + s) / (2 * s));

  const plain = FACES.map(([, c]) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42 }));
  const labelled = FACES.map(([, c, l]) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    g.fillStyle = c; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#2B2A6B'; g.font = '800 170px Montserrat, system-ui, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(l, 128, 140);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.42 });
  });

  const cubies = [], stickers = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const piece = new THREE.Group();
    piece.position.set(x, y, z);
    piece.add(new THREE.Mesh(bodyGeo, bodyMat));
    FACES.forEach(([n], f) => {
      if (n[0] && n[0] !== x || n[1] && n[1] !== y || n[2] && n[2] !== z) return;
      const centre = (n[0] ? 0 : Math.abs(x)) + (n[1] ? 0 : Math.abs(y)) + (n[2] ? 0 : Math.abs(z)) === 0;
      const m = new THREE.Mesh(stickerGeo, centre ? labelled[f] : plain[f]);
      const dir = new THREE.Vector3(...n);
      m.position.copy(dir).multiplyScalar(0.485);
      m.lookAt(dir.clone().multiplyScalar(2));
      m.userData = { face: f, normal: dir };
      piece.add(m); stickers.push(m);
    });
    cube.add(piece); cubies.push(piece);
  }

  /* ---------- moves ---------- */
  const queue = [], history = [];
  let turning = null, mixed = false, userMoves = 0, interacted = false;
  const pivot = new THREE.Group();
  cube.add(pivot);
  const snapM = new THREE.Matrix4();

  function turn(axis, layer, dir, opts = {}) {
    queue.push({ axis, layer, dir, ms: still ? 0 : (opts.fast ? 110 : 230), record: opts.record !== false, user: !!opts.user });
    wake();
  }
  function startNext() {
    const mv = queue.shift();
    pivot.rotation.set(0, 0, 0);
    const i = AXES.indexOf(mv.axis);
    cubies.forEach((c) => { if (Math.round(c.position.getComponent(i)) === mv.layer) pivot.attach(c); });
    turning = { ...mv, t0: performance.now() };
  }
  function finish() {
    const mv = turning;
    pivot.rotation[mv.axis] = mv.dir * Math.PI / 2;
    pivot.updateMatrixWorld(true);
    [...pivot.children].forEach((c) => {
      cube.attach(c);
      c.position.round();
      snapM.makeRotationFromQuaternion(c.quaternion);
      for (let k = 0; k < 16; k++) snapM.elements[k] = Math.round(snapM.elements[k]);
      c.quaternion.setFromRotationMatrix(snapM);
    });
    pivot.rotation.set(0, 0, 0);
    turning = null;
    if (mv.record) history.push(mv);
    if (mv.user) { userMoves++; afterUserMove(); }
    if (!queue.length) report();
  }

  function solved() {
    const seen = {};
    const n = new THREE.Vector3();
    for (const m of stickers) {
      // each sticker's outward direction in the cube's own frame, so spinning the whole cube doesn't matter
      n.copy(m.userData.normal).applyQuaternion(m.parent.quaternion).round();
      const key = n.x + ',' + n.y + ',' + n.z;
      if (seen[key] === undefined) seen[key] = m.userData.face;
      else if (seen[key] !== m.userData.face) return false;
    }
    return true;
  }

  const label = root.querySelector('[data-moves]');
  function report(text) {
    const ok = solved();
    root.dataset.state = ok ? 'solved' : 'mixed';
    if (text) { label.textContent = text; return; }
    label.textContent = ok ? (interacted ? 'All matched! Mix it up again?' : 'Drag a square to twist it') : userMoves + (userMoves === 1 ? ' twist' : ' twists') + ' so far';
  }
  function afterUserMove() {
    if (queue.length || !solved()) return;
    history.length = 0;
    if (mixed) { mixed = false; celebrate(); }
  }

  root.querySelector('[data-mix]').addEventListener('click', () => {
    interacted = true;
    let last = '';
    for (let k = 0; k < 18; k++) {
      let axis, layer;
      do { axis = AXES[Math.floor(Math.random() * 3)]; layer = Math.floor(Math.random() * 3) - 1; } while (axis + layer === last);
      last = axis + layer;
      turn(axis, layer, Math.random() < 0.5 ? 1 : -1, { fast: true });
    }
    mixed = true; userMoves = 0;
    report('Mixing...');
  });
  root.querySelector('[data-solve]').addEventListener('click', () => {
    interacted = true;
    if (!history.length && solved()) { report('Already solved. Try mixing it first!'); return; }
    queue.length = 0;
    const steps = history.splice(0).reverse();
    steps.forEach((m) => turn(m.axis, m.layer, -m.dir, { fast: steps.length > 6, record: false }));
    mixed = false;
    report('Solving...');
  });

  function celebrate() {
    report('You solved it! Miss Hannah would give you a gold star.');
    if (still) return;
    const box = document.createElement('div');
    box.className = 'toy-pop';
    box.innerHTML = Array.from({ length: 26 }, (_, k) => {
      const a = (k / 26) * Math.PI * 2, d = 120 + Math.random() * 90;
      return '<i style="--x:' + Math.cos(a) * d + 'px;--y:' + Math.sin(a) * d + 'px;--c:' + FACES[k % 6][1] + ';--r:' + (Math.random() * 540 - 270) + 'deg"></i>';
    }).join('');
    root.querySelector('.toy-stage').appendChild(box);
    setTimeout(() => box.remove(), 1400);
  }

  /* ---------- pointer: twist a layer, or spin the cube ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let drag = null;
  function local(e) { const b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height }; }
  function toScreen(v, w, h) { const p = v.clone().applyMatrix4(cube.matrixWorld).project(camera); return new THREE.Vector2((p.x + 1) / 2 * w, (1 - p.y) / 2 * h); }

  canvas.addEventListener('pointerdown', (e) => {
    interacted = true;
    const p = local(e);
    ndc.set(p.x / p.w * 2 - 1, -(p.y / p.h) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(cube.children, true)[0];
    drag = { x: p.x, y: p.y, lx: p.x, ly: p.y, hit: null, done: false };
    if (hit && hit.face && !turning && !queue.length) { // no new twist while a layer is still moving
      const inv = cube.quaternion.clone().invert();
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).applyQuaternion(inv).round();
      const piece = cubies.find((c) => c === hit.object.parent || c === hit.object.parent.parent) || hit.object.parent;
      const i = Math.abs(n.x) ? 0 : Math.abs(n.y) ? 1 : 2;
      if (Math.round(piece.position.getComponent(i)) === Math.sign(n.getComponent(i))) {
        drag.hit = { n, piece, point: cube.worldToLocal(hit.point.clone()) };
      }
    }
    canvas.setPointerCapture(e.pointerId);
    wake();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = local(e);
    if (drag.hit) {
      if (drag.done) return;
      const dv = new THREE.Vector2(p.x - drag.x, p.y - drag.y);
      if (dv.length() < 12) return;
      const { n, piece, point } = drag.hit;
      const cands = AXES.map((a, i) => new THREE.Vector3(i === 0, i === 1, i === 2)).filter((t) => Math.abs(t.dot(n)) < 0.5);
      let best = null;
      cands.forEach((t) => {
        const sd = toScreen(point.clone().add(t), p.w, p.h).sub(toScreen(point, p.w, p.h)).normalize();
        const d = sd.dot(dv.clone().normalize());
        if (!best || Math.abs(d) > Math.abs(best.d)) best = { t, d };
      });
      const k = new THREE.Vector3().crossVectors(n, best.t).multiplyScalar(Math.sign(best.d));
      const i = Math.abs(k.x) > 0.5 ? 0 : Math.abs(k.y) > 0.5 ? 1 : 2;
      turn(AXES[i], Math.round(piece.position.getComponent(i)), Math.sign(k.getComponent(i)), { user: true });
      drag.done = true;
    } else {
      const dx = p.x - drag.lx, dy = p.y - drag.ly;
      cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dx * 0.011);
      cube.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), dy * 0.011);
      drag.lx = p.x; drag.ly = p.y;
      wake();
    }
  });
  const end = () => { drag = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  /* keyboard: arrows spin the cube, so it is reachable without a pointer */
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (!m) return;
    e.preventDefault(); interacted = true;
    cube.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), m[0] * 0.3);
    cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), m[1] * 0.3);
    wake();
  });

  /* ---------- render only while something is moving and on screen ---------- */
  let raf = 0, visible = true;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function frame(now) {
    raf = 0;
    if (!turning && queue.length) startNext();
    if (turning) {
      const t = turning.ms ? Math.min(1, (now - turning.t0) / turning.ms) : 1;
      pivot.rotation[turning.axis] = turning.dir * Math.PI / 2 * ease(t);
      if (t >= 1) finish();
    }
    const idle = !interacted && !still;
    if (idle) cube.rotation.y += 0.0035;
    renderer.render(scene, camera);
    if (visible && (turning || queue.length || drag || idle)) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }

  const stage = root.querySelector('.toy-stage');
  new ResizeObserver(() => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    wake();
  }).observe(stage);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(root);

  root.hidden = false;
  report();
  wake();
  root._toy = { solved, history, queue }; // for the end-to-end test
}
