// The studio wall: deep navy acoustic panels under an ember work lamp, with the four showpieces hanging as
// live screens. The lamp follows the pointer, the screens glow brighter as it nears them, and scrolling
// dollies the camera into the first screen. Without WebGL the screens sit over the still as plain videos.
import * as THREE from '/assets/vendor/three.min.js';
import { toVideo } from './video.js';

const WARM = 0xFFC27A; // ember-tinted lamp light
const FOV = 35;
// Screen centres on the wall (x, y) for wide screens, and stacked for phones. Size is width × height.
const DESKTOP = { cam: [1.5, 0.2], size: [2.2, 1.375], at: [[1.9, 1.25], [4.6, 1.75], [2.2, -1.25], [4.9, -0.75]] };
const PHONE = { cam: [0, 1.4], size: [1.7, 1.0625], at: [[-1.0, 2.5], [1.0, 3.1], [-1.0, 1.0], [1.0, 1.6]] };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Procedural acoustic fabric: a fine navy weave drawn once to a canvas, tiled down every panel.
function fabricTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 1024;
  const x = c.getContext('2d');
  x.fillStyle = '#16263F'; x.fillRect(0, 0, 256, 1024);
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // warp and weft threads, then a little fibre noise so the light catches it
  for (let y = 0; y < 1024; y += 3) { x.fillStyle = `rgba(10,19,34,${0.18 + rnd() * 0.14})`; x.fillRect(0, y, 256, 1); }
  for (let px = 0; px < 256; px += 3) { x.fillStyle = `rgba(148,170,204,${0.03 + rnd() * 0.04})`; x.fillRect(px, 0, 1, 1024); }
  for (let i = 0; i < 2200; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(10,19,34,.35)' : 'rgba(148,170,204,.08)'; x.fillRect(rnd() * 256, rnd() * 1024, 1, 1 + rnd() * 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function startWall(canvas, videos, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  // Software GL (no GPU, or a headless browser) renders at half size with no shadows so the page stays smooth.
  const gl = renderer.getContext(), info = gl.getExtension('WEBGL_debug_renderer_info');
  const soft = /swiftshader|llvmpipe|software|mesa/i.test(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '');
  const lite = mobile || soft;
  renderer.setPixelRatio(soft ? 0.5 : lite ? Math.min(dpr, 1.5) : Math.min(dpr, 1.5));
  renderer.setClearColor(0x0A1322, 1);
  renderer.shadowMap.enabled = !lite; renderer.shadowMap.type = THREE.PCFShadowMap;
  mobile = lite;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 16 / 10, 0.1, 100);
  const L = mobile ? PHONE : DESKTOP;

  // Panels: fabric-wrapped acoustic columns with slim shadow gaps between them
  const panelGeo = new THREE.BoxGeometry(0.56, 14, 0.34);
  const panelMat = new THREE.MeshStandardMaterial({ map: fabricTexture(), roughness: 0.92, metalness: 0 });
  const panels = new THREE.InstancedMesh(panelGeo, panelMat, 40);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 40; i++) {
    m.makeTranslation(-11.4 + i * 0.6, 0, -0.17 + (rnd() - 0.5) * 0.08);
    panels.setMatrixAt(i, m);
    col.setHSL(0.6, 0.38, 0.42 + rnd() * 0.12); panels.setColorAt(i, col);
  }
  panels.receiveShadow = true; panels.castShadow = !mobile;
  scene.add(panels);

  // Screens: a dark bezel, then the video plane. Each is self-lit, scaled by the lamp's nearness.
  const screens = videos.map((video, i) => {
    const [w, h] = L.size, [x, y] = L.at[i];
    const g = new THREE.Group(); g.position.set(x, y, 0.08);
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.09), new THREE.MeshStandardMaterial({ color: 0x070D18, roughness: 0.5, metalness: 0.3 }));
    bezel.castShadow = !mobile; g.add(bezel);
    const tex = new THREE.VideoTexture(video); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff, toneMapped: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); plane.position.z = 0.05; g.add(plane);
    // A soft ember halo on the panels behind the screen
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, h * 1.7), new THREE.MeshBasicMaterial({ color: 0xF2A23A, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.z = -0.06; g.add(halo);
    scene.add(g);
    return { g, mat, halo, x, y, w, h };
  });

  // Light: a dim ambient and the work lamp
  scene.add(new THREE.AmbientLight(0x6F86A8, 0.22));
  scene.add(new THREE.HemisphereLight(0x1F3A5F, 0x0A1322, 0.3));
  const lamp = new THREE.SpotLight(WARM, 180, 40, 0.55, 0.8, 1.6);
  lamp.position.set(L.cam[0] + 2, L.cam[1] + 1, 6.5); lamp.castShadow = !mobile;
  lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.0005;
  scene.add(lamp, lamp.target);
  const fill = new THREE.PointLight(WARM, 6, 12, 1.8); fill.position.set(L.cam[0] + 1, L.cam[1], 3); scene.add(fill);

  // Camera path: the start pose, and the pose where screen 0 fills the view.
  const start = new THREE.Vector3(L.cam[0], L.cam[1], 9.2), look0 = new THREE.Vector3(L.cam[0], L.cam[1], 0);
  const s0 = screens[0];
  const endDist = (s0.h / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 1.02;
  const end = new THREE.Vector3(s0.x, s0.y, 0.13 + endDist), look1 = new THREE.Vector3(s0.x, s0.y, 0);
  let dolly = 0;
  const ptr = new THREE.Vector2(L.cam[0] + 2.2, L.cam[1] + 0.6), target = ptr.clone();
  let lastMove = -1e4, visible = true, frozen = false;

  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize); resize();
  // Pointer → a point on the wall plane at the camera's current distance
  const toWall = (nx, ny) => {
    const dist = camera.position.z, vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(FOV / 2)), vw = vh * camera.aspect;
    return [camera.position.x + (nx - 0.5) * vw, camera.position.y + (0.5 - ny) * vh];
  };
  addEventListener('pointermove', (e) => { if (frozen || e.pointerType !== 'mouse') return; const [x, y] = toWall(e.clientX / innerWidth, e.clientY / innerHeight); target.set(x, y); lastMove = performance.now(); }, { passive: true });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; for (const v of videos) { if (visible) v.play().catch(() => {}); else v.pause(); } }).observe(canvas);

  let stopped = false;
  return {
    setDolly(p) { dolly = Math.min(1, Math.max(0, p)); },
    freeze(x, y) { frozen = true; ptr.set(x, y); target.set(x, y); },
    lighten() { renderer.shadowMap.enabled = false; lamp.castShadow = false; renderer.setPixelRatio(0.5); for (const s of screens) s.halo.visible = false; },
    stop() { stopped = true; },
    tick(t, dt) {
      if (!visible || stopped) return;
      const k = dolly * dolly * (3 - 2 * dolly);
      camera.position.lerpVectors(start, end, k);
      camera.lookAt(look0.clone().lerp(look1, k));
      if (!frozen && performance.now() - lastMove > 3000) target.set(L.cam[0] + 2.2 + Math.sin(t * 0.35) * 2.2, L.cam[1] + 0.6 + Math.sin(t * 0.7) * 1.1);
      ptr.lerp(target, Math.min(1, dt * 3));
      lamp.position.set(ptr.x + 0.6, ptr.y + 1.2, 6.5 - k * 4);
      lamp.target.position.set(ptr.x, ptr.y, 0);
      fill.position.set(ptr.x, ptr.y, 2.4);
      for (const s of screens) {
        const d = Math.hypot(s.x - ptr.x, s.y - ptr.y) / 3.2;
        const glow = 0.45 + 0.55 * smooth(1, 0, d) + k * 0.4;
        s.mat.color.setScalar(Math.min(1.15, glow));
        s.halo.material.opacity = 0.05 + 0.12 * smooth(1, 0, d);
      }
      renderer.render(scene, camera);
    },
    dispose() { renderer.dispose(); },
  };
}

// Turns the four screen posters into videos, starts the scene, and watches its frame rate: a slow machine
// gets a lighter scene, and a very slow one goes back to the still with the loops over it. Returns the
// wall, or null if it could not start.
export function bootWall() {
  const hero = document.querySelector('[data-hero]'), canvas = hero.querySelector('[data-wall-canvas]');
  const videos = [...hero.querySelectorAll('[data-wall-screens] img[data-video], [data-wall-screens] video')].map((el) => { el.dataset.manual = '1'; return toVideo(el); });
  const MOBILE = matchMedia('(max-width: 760px)').matches;
  const shot = /[?&]wallshot/.test(location.search);
  let wall;
  try { wall = startWall(canvas, videos, { mobile: MOBILE, dpr: devicePixelRatio || 1 }); }
  catch (e) { document.documentElement.classList.add('home-nogl'); bootStillWall(); return null; }
  // Show the scene once a loop can play, or after 2.5 s even if the videos never arrive.
  let shown = false;
  const show = () => { if (shown) return; shown = true; hero.classList.add('is-gl'); if (shot) requestAnimationFrame(() => { document.documentElement.dataset.wallReady = '1'; }); };
  for (const v of videos) { v.addEventListener('canplay', show, { once: true }); v.src = v.dataset.src; v.play().catch(() => {}); }
  setTimeout(show, 2500);
  if (shot) { wall.freeze(3.4, 0.5); document.querySelector('[data-hero-copy]').style.visibility = 'hidden'; document.querySelector('.hero__scroll').style.visibility = 'hidden'; }
  // Frame-time watchdog: after a few seconds of slow frames, lighten; if still slow, give the hero back
  // to the still image (the screens keep playing over it).
  let frames = 0, slow = 0, stage = 0;
  const base = wall.tick;
  wall.tick = (t, dt) => {
    const t0 = performance.now(); base(t, dt); const cost = performance.now() - t0;
    if (shot || stage > 1 || ++frames < 20) return;
    if (cost > 45) slow++; else slow = Math.max(0, slow - 1);
    if (slow > 25) { slow = 0; if (stage === 0) { stage = 1; wall.lighten(); } else { stage = 2; hero.classList.remove('is-gl'); wall.stop(); bootStillWall(videos); } }
  };
  return wall;
}

// No WebGL (or a wall that gave up): the screens play as positioned videos over the still.
export function bootStillWall(existing) {
  const vids = existing || [...document.querySelectorAll('[data-wall-screens] img[data-video], [data-wall-screens] video')].map((el) => { el.dataset.manual = '1'; return toVideo(el); });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }
  });
  vids.forEach((v) => io.observe(v));
}
