// Juniper & Vale neighborhoods: a pinned 3D map in the style of an architect's white model. A coastline,
// the urban core's blocks and the hills to the east; scrolling flies the camera from one neighborhood to the next.
import * as THREE from '/assets/vendor/three.min.js';

import { AREAS } from './areas.js';
export { AREAS };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

// Deterministic noise so the map is the same on every visit.
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const vnoise = (x, z) => Math.sin(x * 0.11) * Math.cos(z * 0.13) + Math.sin(x * 0.27 + z * 0.19) * 0.5 + Math.sin(x * 0.53 - z * 0.41) * 0.25;
// Height: below zero is sea (west), flat city in the middle, hills rising east.
const height = (x, z) => {
  const coast = -18 + Math.sin(z * 0.12) * 4;
  if (x < coast) return -1.2;
  const shore = clamp((x - coast) / 6);
  const hills = Math.max(0, (x - 12) / 22) ** 1.6 * (6 + vnoise(x, z) * 3.2) + Math.max(0, vnoise(x * 1.3, z * 1.3)) * 0.4;
  return shore * (0.25 + hills);
};

export function startMap(canvas, pinEl, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : dpr);
  renderer.setClearColor(0xdfe3dc, 1);
  renderer.shadowMap.enabled = !mobile;
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xdfe3dc, 70, 150);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 300);

  // Terrain
  const terrain = new THREE.PlaneGeometry(120, 80, mobile ? 120 : 200, mobile ? 80 : 130); terrain.rotateX(-Math.PI / 2);
  const pos = terrain.attributes.position, colors = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = height(x, z); pos.setY(i, Math.max(h, -0.6));
    c.set(h < 0 ? 0xc9d6d4 : h < 0.35 ? 0xeae3d2 : h < 3 ? 0xd8dcc6 : h < 7 ? 0xc6cbb0 : 0xeeeeea);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  terrain.setAttribute('color', new THREE.BufferAttribute(colors, 3)); terrain.computeVertexNormals();
  const land = new THREE.Mesh(terrain, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  land.receiveShadow = true; scene.add(land);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), new THREE.MeshStandardMaterial({ color: 0xa9c1c3, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -0.35; scene.add(water);

  // Buildings: tall blocks downtown, houses along the coast and in the hills (one instanced mesh)
  const boxes = [];
  for (let gx = -8; gx <= 16; gx += 2.6) for (let gz = -14; gz <= 10; gz += 2.6) {
    if (rnd() < 0.18) continue;
    const dx = gx - 4, dz = gz + 2, core = Math.exp(-(dx * dx + dz * dz) / 90);
    boxes.push([gx + rnd() * 0.4, gz + rnd() * 0.4, 1.6 + rnd() * 0.5, 0.8 + core * 9 * (0.4 + rnd()), 1.6 + rnd() * 0.5]);
  }
  for (let i = 0; i < 70; i++) { const z = -26 + rnd() * 52, x = -17 + Math.sin(z * 0.12) * 4 + 2 + rnd() * 7; boxes.push([x, z, 1.1, 0.9 + rnd() * 0.5, 1.4]); }
  for (let i = 0; i < 46; i++) { const x = 18 + rnd() * 20, z = -30 + rnd() * 34; boxes.push([x, z, 1.2, 0.9 + rnd() * 0.4, 1.5]); }
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xf8f6f1, roughness: 0.9 }), boxes.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
  boxes.forEach(([x, z, w, h, d], i) => { const y = Math.max(height(x, z), 0); p3.set(x, y + h / 2, z); s3.set(w, h, d); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rnd() - 0.5) * 0.3); inst.setMatrixAt(i, m4.compose(p3, q, s3)); });
  inst.castShadow = true; inst.receiveShadow = true; scene.add(inst);
  // Trees as small cones in the hills and parks
  const trees = new THREE.InstancedMesh(new THREE.ConeGeometry(0.5, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x8e9a72, roughness: 1, flatShading: true }), 260);
  for (let i = 0; i < 260; i++) { const x = -14 + rnd() * 56, z = -34 + rnd() * 60, y = height(x, z); if (y < 0.2) { trees.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; } trees.setMatrixAt(i, m4.compose(p3.set(x, y + 0.8, z), q.identity(), s3.setScalar(0.7 + rnd() * 0.8))); }
  trees.castShadow = true; scene.add(trees);
  // A ring that marks the current neighborhood
  const ring = new THREE.Mesh(new THREE.RingGeometry(5.6, 6, 64), new THREE.MeshBasicMaterial({ color: 0xa9492a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; scene.add(ring);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9c2b2, 0.85));
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.1); sun.position.set(-40, 60, 30); sun.castShadow = !mobile;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, far: 220 }); scene.add(sun);

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' }).observe(canvas);
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  const look = new THREE.Vector3(), camPos = new THREE.Vector3(), v = new THREE.Vector3();
  return {
    // f: 0..2, the position between the three neighborhoods
    tick(t, f) {
      if (!visible) return;
      const i = Math.min(1, Math.floor(f)), k = smooth(f - i), a = AREAS[i], b = AREAS[Math.min(2, i + 1)];
      const ax = a.at[0] + (b.at[0] - a.at[0]) * k, az = a.at[1] + (b.at[1] - a.at[1]) * k;
      const fly = Math.sin(k * Math.PI); // rise between stops
      const far = camera.aspect < 1 ? 1.6 : 1;
      look.set(ax, Math.max(height(ax, az), 0), az);
      camPos.set(ax - 20 * far + Math.sin(t * 0.12) * 1.5, (30 + fly * 16) * far, az + 38 * far);
      camera.position.lerp(camPos, 0.12); camera.lookAt(look);
      ring.position.set(ax, look.y + 0.15, az); ring.scale.setScalar(1 + Math.sin(t * 2) * 0.05); ring.material.opacity = 0.8 * (1 - fly);
      water.position.y = -0.35 + Math.sin(t * 0.8) * 0.04;
      renderer.render(scene, camera);
      // DOM pin above the active neighborhood
      const near = AREAS[Math.round(f)], r = canvas.getBoundingClientRect();
      v.set(near.at[0], Math.max(height(...near.at), 0) + 4, near.at[1]).project(camera);
      pinEl.textContent = `${near.name} · from ${near.price}`;
      pinEl.style.transform = `translate(${(v.x + 1) / 2 * r.width}px, ${(1 - v.y) / 2 * r.height}px) translate(-50%, -100%)`;
      pinEl.style.opacity = String(1 - fly * 1.6);
    },
  };
}
