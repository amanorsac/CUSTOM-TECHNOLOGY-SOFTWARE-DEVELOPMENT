// Osteria Lume kitchen: a pinned 3D scene. As you scroll, flour and pasta ribbons drift onto the board,
// San Marzano tomatoes roll in, basil leaves float down, and the oven fire warms everything at the end.
// Every object is built from simple geometry, so there are no models to download.
import * as THREE from '/assets/vendor/three.min.js';

const IMG = '/assets/showcase/osteria-lume/img/';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const span = (p, a, b) => clamp((p - a) / (b - a));

export function startKitchen(canvas, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = !mobile;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 80);
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---- The board and the plate ------------------------------------------------
  const board = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.14, 64), new THREE.MeshStandardMaterial({ color: 0x6b4426, roughness: 0.75 }));
  board.position.y = -0.07; board.receiveShadow = true; scene.add(board);
  const dish = new THREE.TextureLoader().load(IMG + 'dish-pappardelle.webp'); dish.colorSpace = THREE.SRGBColorSpace;
  dish.center.set(0.5, 0.5); dish.repeat.set(0.5, 1); dish.offset.set(0, 0);
  const plate = new THREE.Mesh(new THREE.CircleGeometry(1.15, 64), new THREE.MeshStandardMaterial({ map: dish, roughness: 0.5 }));
  plate.rotation.x = -Math.PI / 2; plate.position.y = 0.012; plate.receiveShadow = true; scene.add(plate);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.17, 0.06, 12, 80), new THREE.MeshStandardMaterial({ color: 0xe9dcc6, roughness: 0.35 }));
  rim.rotation.x = -Math.PI / 2; rim.position.y = 0.04; rim.castShadow = true; scene.add(rim);

  // ---- Pieces: each flies from `from` to `to` during its chapter --------------
  const pieces = [];
  const addPiece = (mesh, chapter, to, extra = {}) => {
    const dir = new THREE.Vector3(rnd(-1, 1), rnd(0.4, 1.2), rnd(-1, 1)).normalize();
    const from = to.clone().add(dir.multiplyScalar(rnd(5, 9))).add(new THREE.Vector3(0, rnd(2, 4), 0));
    mesh.castShadow = true; scene.add(mesh);
    pieces.push({ mesh, chapter, to, from, delay: Math.random() * 0.35, spin: new THREE.Vector3(rnd(-2, 2), rnd(-2, 2), rnd(-2, 2)), rest: mesh.rotation.clone(), ...extra });
  };
  const ring = (r0, r1, y) => { const a = rnd(0, Math.PI * 2), r = rnd(r0, r1); return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); };

  // Pasta ribbons (chapter 0)
  const pastaMat = new THREE.MeshStandardMaterial({ color: 0xe8c46a, roughness: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < (mobile ? 5 : 9); i++) {
    const g = new THREE.PlaneGeometry(1.5, 0.16, 48, 1), pos = g.attributes.position;
    for (let k = 0; k < pos.count; k++) { const x = pos.getX(k); pos.setZ(k, Math.sin(x * 4 + i) * 0.12); pos.setY(k, pos.getY(k) + Math.sin(x * 2.3) * 0.05); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, pastaMat); m.rotation.set(-Math.PI / 2 + rnd(-0.2, 0.2), rnd(0, Math.PI), 0);
    addPiece(m, 0, ring(1.35, 2.0, 0.06));
  }
  // Tomatoes (chapter 1)
  const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xc8321f, roughness: 0.3 }), stemMat = new THREE.MeshStandardMaterial({ color: 0x3f6b24, roughness: 0.7 });
  for (let i = 0; i < (mobile ? 4 : 7); i++) {
    const t = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 24), tomatoMat); body.scale.set(1, 0.84, 1.15); body.castShadow = true; t.add(body);
    const stem = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.05, 6), stemMat); stem.position.y = 0.22; t.add(stem);
    addPiece(t, 1, ring(1.45, 2.05, 0.22));
  }
  // Basil leaves (chapter 2)
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.bezierCurveTo(0.16, 0.1, 0.18, 0.36, 0, 0.55); leafShape.bezierCurveTo(-0.18, 0.36, -0.16, 0.1, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 16); const lp = leafGeo.attributes.position;
  for (let k = 0; k < lp.count; k++) { const x = lp.getX(k); lp.setZ(k, x * x * 1.6); }
  leafGeo.computeVertexNormals();
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f7a2c, roughness: 0.45, side: THREE.DoubleSide });
  for (let i = 0; i < (mobile ? 7 : 12); i++) {
    const m = new THREE.Mesh(leafGeo, leafMat); m.rotation.set(-Math.PI / 2 + rnd(-0.4, 0.4), rnd(0, Math.PI * 2), rnd(-0.3, 0.3));
    const onPlate = i < 5;
    addPiece(m, 2, onPlate ? ring(0.15, 0.85, 0.14) : ring(1.3, 2.1, 0.05), { flutter: true });
  }
  // Flour dust (chapter 0): points that drift down and settle on the board
  const N = mobile ? 900 : 2600, fp = new Float32Array(N * 3), ff = new Float32Array(N * 3), ft = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 2.2;
    ft.set([Math.cos(a) * r, 0.02, Math.sin(a) * r], i * 3);
    ff.set([rnd(-6, 6), rnd(2, 7), rnd(-6, 4)], i * 3);
  }
  fp.set(ff);
  const flourGeo = new THREE.BufferGeometry(); flourGeo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const flour = new THREE.Points(flourGeo, new THREE.PointsMaterial({ color: 0xf7efe2, size: 0.03, transparent: true, opacity: 0.85, depthWrite: false }));
  scene.add(flour);

  // ---- Light ---------------------------------------------------------------------
  scene.add(new THREE.HemisphereLight(0xffe2bf, 0x1a0f08, 0.55));
  const key = new THREE.DirectionalLight(0xffd6a3, 2.2); key.position.set(-3, 6, 4); key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(key);
  const fire = new THREE.PointLight(0xff6a1a, 0, 14, 1.4); fire.position.set(0, 1.6, -2.4); scene.add(fire);
  const rimLight = new THREE.DirectionalLight(0xffb36b, 0.8); rimLight.position.set(3, 2, -4); scene.add(rimLight);

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' }).observe(canvas);
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  const v = new THREE.Vector3();
  return {
    tick(t, p) {
      if (!visible) return;
      // Camera: high and wide, pushing in and circling slightly as the story goes on.
      const k = ease(p), far = camera.aspect < 0.9 ? 1.55 : 1;
      const ang = -0.5 + k * 0.9, dist = (9.5 - k * 3.2) * far, h = (5.6 - k * 2.2) * far;
      camera.position.set(Math.sin(ang) * dist, h, Math.cos(ang) * dist);
      camera.lookAt(0, 0.1, 0);
      // Pieces fly in during their chapter (each quarter of the scroll), then hold.
      for (const s of pieces) {
        const a = ease(span(p, s.chapter * 0.25 + s.delay * 0.15, s.chapter * 0.25 + 0.2 + s.delay * 0.12));
        s.mesh.visible = a > 0.001;
        s.mesh.position.lerpVectors(s.from, s.to, a);
        s.mesh.position.y += Math.sin(a * Math.PI) * 0.8 + (s.flutter ? Math.sin(t * 2 + s.delay * 9) * 0.03 * (1 - a) : 0);
        s.mesh.rotation.set(s.rest.x + s.spin.x * (1 - a), s.rest.y + s.spin.y * (1 - a), s.rest.z + s.spin.z * (1 - a));
      }
      // Flour settles in chapter 0 and lifts on the oven's heat in chapter 3.
      const fa = ease(span(p, 0.02, 0.22)), heat = span(p, 0.78, 1);
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        fp[j] = ff[j] + (ft[j] - ff[j]) * fa;
        fp[j + 1] = ff[j + 1] + (ft[j + 1] - ff[j + 1]) * fa + heat * (0.4 + Math.sin(i + t) * 0.2) * ((i % 7) / 7);
        fp[j + 2] = ff[j + 2] + (ft[j + 2] - ff[j + 2]) * fa;
      }
      flourGeo.attributes.position.needsUpdate = true;
      // The fire: orange light swells and flickers.
      fire.intensity = heat * (60 + Math.sin(t * 13) * 8 + Math.sin(t * 7.1) * 6);
      key.intensity = 2.2 - heat * 0.9;
      renderer.render(scene, camera);
      return v;
    },
  };
}
