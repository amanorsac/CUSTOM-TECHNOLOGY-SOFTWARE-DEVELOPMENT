// Juniper & Vale floor plan: pinned 3D. Scrolling lays the floors, raises the walls, glazes the windows and
// sets the furniture, while the camera turns from a top-down plan into a three-quarter view and the sun sweeps.
import * as THREE from '/assets/vendor/three.min.js';
import { ROOMS, PLAN_W, PLAN_H, walls } from './plan-data.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const span = (p, a, b) => clamp((p - a) / (b - a));

export function startPlan(canvas, labelsEl, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : dpr);
  renderer.setClearColor(0xeae5dc, 1);
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 1, 400);
  const group = new THREE.Group(); group.position.set(-PLAN_W / 2, 0, -PLAN_H / 2); scene.add(group);

  // Ground slab and a soft contact shadow under the house
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.12 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // Floors
  const floors = ROOMS.map((r, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(r.w - 0.3, 0.25, r.h - 0.3), new THREE.MeshStandardMaterial({ color: r.floor, roughness: 0.85, transparent: true, opacity: 0 }));
    m.position.set(r.x + r.w / 2, 0.12, r.y + r.h / 2); m.receiveShadow = true; group.add(m);
    return { m, i };
  });
  // Walls
  const H = 9, wallMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.9 });
  const ws = walls().map((s, i) => {
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1), t = s.outer ? 0.7 : 0.4;
    const geo = new THREE.BoxGeometry(s.x1 === s.x2 ? t : len + t, H, s.x1 === s.x2 ? len + t : t); geo.translate(0, H / 2, 0);
    const m = new THREE.Mesh(geo, wallMat); m.position.set((s.x1 + s.x2) / 2, 0, (s.y1 + s.y2) / 2);
    m.castShadow = true; m.receiveShadow = true; m.scale.y = 0.001; group.add(m);
    return { m, i, outer: s.outer, s };
  });
  // Windows on the outer walls: glass panes set into the wall face
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbcd3dc, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0 });
  const panes = [];
  for (const w of ws.filter((x) => x.outer)) {
    const { s } = w, horiz = s.y1 === s.y2, len = horiz ? Math.abs(s.x2 - s.x1) : Math.abs(s.y2 - s.y1);
    const n = Math.max(1, Math.floor(len / 9));
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n, x = horiz ? s.x1 + (s.x2 - s.x1) * f : s.x1, z = horiz ? s.y1 : s.y1 + (s.y2 - s.y1) * f;
      const g = new THREE.Mesh(new THREE.BoxGeometry(horiz ? 4.6 : 0.9, 4.8, horiz ? 0.9 : 4.6), glassMat);
      g.position.set(x, 4.6, z); group.add(g); panes.push(g);
    }
  }
  // Furniture
  const furnMat = { sofa: 0x8c7a66, island: 0xffffff, table: 0x6b4a33, bed: 0xe9e2d6 };
  const furniture = [];
  ROOMS.forEach((r) => r.items.forEach(([kind, x, z, w, d, h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: furnMat[kind], roughness: 0.7 }));
    m.position.set(x, h / 2 + 0.25, z); m.castShadow = true; m.scale.setScalar(0.001); group.add(m); furniture.push(m);
  }));

  // Light
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfc0, 0.9));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4); sun.castShadow = !mobile;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 200 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun);

  // Labels for each room, projected into the page every frame
  labelsEl.innerHTML = ROOMS.map((r) => `<span>${r.name}</span>`).join('');
  const labels = [...labelsEl.children];
  const centers = ROOMS.map((r) => new THREE.Vector3(r.x + r.w / 2 - PLAN_W / 2, 10.5, r.y + r.h / 2 - PLAN_H / 2));

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' }).observe(canvas);
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  const v = new THREE.Vector3();
  return {
    tick(t, p) {
      if (!visible) return;
      // Camera: from straight down to a three-quarter view, turning slowly.
      const k = ease(span(p, 0.05, 0.75)), fit = camera.aspect < 1 ? 2.3 : camera.aspect < 1.4 ? 1.7 : 1.38;
      // Wide screens keep the copy on the left, so the house sits right of centre.
      const side = camera.aspect > 1.2 ? -19 : 0;
      const ang = -0.6 + k * 0.9 + Math.sin(t * 0.15) * 0.03, tilt = 1.45 - k * 0.68, dist = (96 - k * 8) * fit;
      camera.position.set(Math.cos(tilt) * Math.sin(ang) * dist + side, Math.sin(tilt) * dist, Math.cos(tilt) * Math.cos(ang) * dist);
      camera.lookAt(side, 2, 0);
      // Floors, then walls (outer first), then glass, then furniture.
      floors.forEach((f) => { f.m.material.opacity = ease(span(p, 0.02 + f.i * 0.012, 0.1 + f.i * 0.012)); });
      ws.forEach((w) => { w.m.scale.y = Math.max(0.001, ease(span(p, 0.15 + (w.outer ? 0 : 0.08) + (w.i % 9) * 0.012, 0.42 + (w.outer ? 0 : 0.08) + (w.i % 9) * 0.012))); });
      glassMat.opacity = 0.55 * ease(span(p, 0.5, 0.6));
      furniture.forEach((m, i) => m.scale.setScalar(Math.max(0.001, ease(span(p, 0.6 + i * 0.03, 0.7 + i * 0.03)))));
      // The sun sweeps across the afternoon.
      const sa = 0.6 + p * 1.8; sun.position.set(Math.cos(sa) * 40, 120, Math.sin(sa) * 40);
      // Room labels
      const show = ease(span(p, 0.12, 0.2)) * (1 - ease(span(p, 0.9, 1)));
      const r = canvas.getBoundingClientRect();
      labels.forEach((el, i) => {
        v.copy(centers[i]).project(camera);
        el.style.transform = `translate(${(v.x + 1) / 2 * r.width}px, ${(1 - v.y) / 2 * r.height}px) translate(-50%, -50%)`;
        el.style.opacity = show * (v.z < 1 ? 1 : 0);
      });
      renderer.render(scene, camera);
    },
  };
}
