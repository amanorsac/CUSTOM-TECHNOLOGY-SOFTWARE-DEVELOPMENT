// CTSD Lab 02: Workshop. A warm 3D workbench built from simple shapes. Scroll drives the camera along a
// spline: wide shot → the monitor, where a website assembles strip by strip → the phone, which lights up →
// the five process notes on the wall → a pull-back. Captions fade in and out over their scroll ranges.
import * as THREE from '/assets/vendor/three.min.js';
import { chooseMode, loop, MOBILE, DPR, scrollProgress, range, smooth, markReady } from './common.js';

if (chooseMode()) start();

function start() {
  const canvas = document.getElementById('lab-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'high-performance' });
  renderer.setPixelRatio(MOBILE ? Math.min(DPR, 1.5) : DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !MOBILE;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1310);
  scene.fog = new THREE.Fog(0x1e1310, 9, 18);
  const aspect0 = innerWidth > 0 && innerHeight > 0 ? innerWidth / innerHeight : 16 / 9;
  const camera = new THREE.PerspectiveCamera(42, aspect0, 0.05, 60);

  const loader = new THREE.TextureLoader();
  const tex = (src, rep = [1, 1]) => {
    const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t;
  };
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const add = (geo, mat, pos, rot = [0, 0, 0], shadow = true) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot);
    m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m;
  };

  // ---- Room and desk -------------------------------------------------------
  add(new THREE.PlaneGeometry(16, 9), std({ map: tex('/images/site/texture-wood-slats.webp', [3, 1.6]), color: 0x6a4a36, roughness: 0.92 }), [0, 3, -1.6], [0, 0, 0], false);
  add(new THREE.PlaneGeometry(16, 10), std({ color: 0x24170f, roughness: 1 }), [0, -1.2, 2], [-Math.PI / 2, 0, 0], false);
  add(new THREE.BoxGeometry(6.4, 0.12, 2.8), std({ map: tex('/images/site/texture-wood-grain.webp', [2, 1]), color: 0xb08660, roughness: 0.62 }), [0.3, 0, -0.2]);
  for (const [x, z] of [[-2.7, -1.4], [3.3, -1.4], [-2.7, 1.0], [3.3, 1.0]]) add(new THREE.BoxGeometry(0.12, 1.2, 0.12), std({ color: 0x3b271c, roughness: 0.8 }), [x, -0.66, z]);

  // ---- Monitor with a website that assembles from horizontal strips ---------
  const MON = new THREE.Vector3(-0.6, 1.22, -0.62), SW = 2.28, SH = 1.33;
  const dark = std({ color: 0x1b1310, roughness: 0.35, metalness: 0.3 });
  add(new THREE.BoxGeometry(0.8, 0.03, 0.42), dark, [MON.x, 0.075, MON.z + 0.05]);
  add(new THREE.BoxGeometry(0.09, 0.62, 0.07), dark, [MON.x, 0.38, MON.z - 0.02]);
  add(new THREE.BoxGeometry(SW + 0.12, SH + 0.12, 0.06), dark, [MON.x, MON.y, MON.z]);
  add(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ color: 0x241815 }), [MON.x, MON.y, MON.z + 0.031], [0, 0, 0], false);
  const site = tex('/images/designs/modern-church/web-1.webp'); site.wrapS = site.wrapT = THREE.ClampToEdgeWrapping;
  const STRIPS = 5, strips = [];
  for (let i = 0; i < STRIPS; i++) {
    const t = site.clone(); t.needsUpdate = true;
    // Crop the 1.6:1 image to the 1.71:1 screen, then take one horizontal band of it.
    const crop = (2400 / 1500) / (SW / SH);
    t.repeat.set(1, crop / STRIPS); t.offset.set(0, (1 - crop) / 2 + crop * (STRIPS - 1 - i) / STRIPS);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH / STRIPS), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, toneMapped: false }));
    const home = new THREE.Vector3(MON.x, MON.y + SH / 2 - (i + 0.5) * SH / STRIPS, MON.z + 0.034);
    m.position.copy(home); scene.add(m);
    strips.push({ m, home, from: new THREE.Vector3((i % 2 ? 1 : -1) * (1.1 + i * 0.15), 0.45 - i * 0.22, 0.35 + i * 0.07), spin: (i % 2 ? -1 : 1) * 0.5 });
  }
  const screenGlow = new THREE.PointLight(0xffe2c0, 0, 3.5); screenGlow.position.set(MON.x, MON.y, MON.z + 0.6); scene.add(screenGlow);

  // ---- Keyboard, mug and plant ---------------------------------------------
  add(new THREE.BoxGeometry(1.25, 0.035, 0.42), std({ color: 0x2a1e18, roughness: 0.5 }), [MON.x, 0.08, 0.3]);
  add(new THREE.BoxGeometry(1.15, 0.012, 0.34), std({ color: 0xd8c4a8, roughness: 0.7 }), [MON.x, 0.104, 0.3]);
  add(new THREE.CylinderGeometry(0.13, 0.12, 0.26, 28), std({ color: 0xf2e8da, roughness: 0.4 }), [0.75, 0.19, 0.55]);
  add(new THREE.TorusGeometry(0.07, 0.018, 10, 20), std({ color: 0xf2e8da, roughness: 0.4 }), [0.89, 0.2, 0.55], [0, 0, Math.PI / 2]);
  add(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 24), std({ color: 0xc89b6b, roughness: 0.75 }), [-2.45, 0.23, -0.95]);
  const leaf = std({ color: 0x556b2f, roughness: 0.7 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, h = 0.5 + (i % 3) * 0.18;
    add(new THREE.ConeGeometry(0.07, h, 6), leaf, [-2.45 + Math.cos(a) * 0.08, 0.4 + h / 2, -0.95 + Math.sin(a) * 0.08], [Math.sin(a) * 0.45, 0, Math.cos(a) * 0.45]);
  }

  // ---- Phone on a stand ------------------------------------------------------
  const PH = new THREE.Vector3(1.4, 0.55, -0.2);
  add(new THREE.BoxGeometry(0.5, 0.06, 0.36), std({ color: 0x8a6747, roughness: 0.6 }), [PH.x, 0.09, PH.z + 0.06]);
  const phone = new THREE.Group(); phone.position.copy(PH); phone.rotation.x = -0.2; scene.add(phone);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.92, 0.045), dark); body.castShadow = true; phone.add(body);
  const app = tex('/images/designs/modern-church/app-1.webp'); app.wrapS = app.wrapT = THREE.ClampToEdgeWrapping;
  const appMat = new THREE.MeshBasicMaterial({ map: app, color: 0x000000, toneMapped: false });
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.41, 0.86), appMat); phoneScreen.position.z = 0.0235; phone.add(phoneScreen);

  // ---- Lamp ------------------------------------------------------------------
  const brass = std({ color: 0xc9a14a, roughness: 0.32, metalness: 0.75 });
  const LB = new THREE.Vector3(3.05, 0.06, -0.85);
  add(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 32), brass, [LB.x, LB.y + 0.03, LB.z]);
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 12), brass, [LB.x, 0.71, LB.z], [0, 0, 0.12]);
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 12), brass, [LB.x - 0.32, 1.45, LB.z + 0.05], [0, 0, 1.15]);
  const shade = add(new THREE.ConeGeometry(0.26, 0.34, 32, 1, true), std({ color: 0xc9a14a, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide }), [LB.x - 0.72, 1.55, LB.z + 0.1], [0, 0, 0.5]);
  const bulb = add(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff1d0 }), [LB.x - 0.68, 1.47, LB.z + 0.1], [0, 0, 0], false);
  const lamp = new THREE.SpotLight(0xffd29a, 26, 7, 0.75, 0.6, 1.6);
  lamp.position.copy(bulb.position); lamp.target.position.set(0.6, 0, -0.2); scene.add(lamp, lamp.target);
  lamp.castShadow = !MOBILE; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.0005;

  // ---- Process notes on the wall ---------------------------------------------
  const steps = ['Discover', 'Design', 'Build', 'Launch', 'Care'];
  const paper = ['#F7EFE4', '#E9D3B4', '#F2DFA0', '#DCE3C8', '#F3E6D6'];
  const notes = steps.map((s, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = paper[i]; g.fillRect(0, 0, 512, 512);
    g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 0, 512, 54);
    g.fillStyle = '#6B4F32'; g.font = '700 72px Montserrat, sans-serif'; g.fillText(String(i + 1), 44, 150);
    g.fillStyle = '#3E2723'; g.font = '700 84px Montserrat, sans-serif'; g.fillText(s, 44, 300);
    g.strokeStyle = '#C89B6B'; g.lineWidth = 6; g.beginPath(); g.moveTo(44, 350); g.lineTo(44 + 70 + i * 40, 350); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const x = 0.85 + (i % 3) * 0.62 + (i > 2 ? 0.31 : 0), y = i > 2 ? 1.45 : 2.08;
    const m = add(new THREE.PlaneGeometry(0.5, 0.5), std({ map: t, roughness: 0.95 }), [x, y, -1.58], [0, 0, (i % 2 ? 1 : -1) * 0.06], false);
    return { m, base: new THREE.Vector3(x, y, -1.58) };
  });

  // ---- Light ---------------------------------------------------------------------
  scene.add(new THREE.HemisphereLight(0xffe7c8, 0x2a1a12, 0.8));
  const key = new THREE.DirectionalLight(0xffe3c4, 1.25); key.position.set(-3, 5, 4); key.castShadow = !MOBILE;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 3; key.shadow.camera.bottom = -2;
  scene.add(key);

  // ---- Camera path: [progress, position, look target] -----------------------
  const KEYS = [
    [0.00, [0.3, 2.7, 7.2], [0.3, 0.95, -0.6]],
    [0.14, [-0.2, 1.9, 4.3], [-0.45, 1.05, -0.6]],
    [0.28, [-0.6, 1.25, 2.2], [-0.6, 1.2, -0.62]],
    [0.38, [-0.6, 1.25, 2.05], [-0.6, 1.2, -0.62]],
    [0.47, [0.75, 0.95, 1.5], [1.35, 0.55, -0.2]],
    [0.56, [1.4, 0.82, 1.4], [1.4, 0.55, -0.2]],
    [0.66, [1.5, 1.75, 2.0], [1.5, 1.8, -1.6]],
    [0.84, [1.5, 1.8, 1.75], [1.5, 1.78, -1.6]],
    [1.00, [0.4, 3.1, 8.0], [0.3, 1.0, -0.6]],
  ];
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal');
  // Map scroll progress to curve parameter so each key lands at its progress value.
  const toU = (p) => {
    for (let i = 0; i < KEYS.length - 1; i++) {
      const [a] = KEYS[i], [b] = KEYS[i + 1];
      if (p <= b) return (i + smooth(range(p, a, b))) / (KEYS.length - 1);
    }
    return 1;
  };

  const caps = [...document.querySelectorAll('.ws-cap')].map((el) => ({ el, from: +el.dataset.from, to: +el.dataset.to }));
  const track = document.querySelector('.ws-track');
  const lenis = window.Lenis ? new window.Lenis({ lerp: 0.08 }) : null;

  function resize() {
    if (!innerWidth || !innerHeight) return;
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener('resize', resize); resize();

  let prog = 0;
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), v = new THREE.Vector3();
  loop((t, dt) => {
    lenis?.raf(t * 1000);
    prog += (scrollProgress(track) - prog) * Math.min(1, dt * 5);
    const u = toU(prog);
    posCurve.getPoint(u, pos); lookCurve.getPoint(u, look);
    // Narrow screens: back the camera away from its target so the subject still fits.
    const k = Math.min(2.4, Math.max(1, 1.55 / camera.aspect));
    v.subVectors(pos, look).multiplyScalar(k); camera.position.copy(look).add(v);
    camera.position.x += Math.sin(t * 0.5) * 0.03; camera.position.y += Math.sin(t * 0.37) * 0.02;
    camera.lookAt(look);

    // Website strips fly in and settle, top to bottom.
    strips.forEach((s, i) => {
      const a = smooth(range(prog, 0.17 + i * 0.03, 0.29 + i * 0.03));
      s.m.position.lerpVectors(v.copy(s.home).add(s.from), s.home, a);
      s.m.rotation.y = (1 - a) * s.spin; s.m.rotation.z = (1 - a) * s.spin * 0.3;
      s.m.material.opacity = Math.min(1, a * 1.6);
    });
    screenGlow.intensity = 2.2 * smooth(range(prog, 0.2, 0.36));
    // Phone lights up.
    const on = smooth(range(prog, 0.44, 0.52));
    appMat.color.setScalar(on);
    phone.rotation.y = Math.sin(t * 0.8) * 0.03;
    // Notes pop one at a time.
    notes.forEach((n, i) => {
      const a = range(prog, 0.65 + i * 0.035, 0.7 + i * 0.035), pop = Math.sin(Math.min(1, a) * Math.PI);
      n.m.scale.setScalar(1 + pop * 0.12); n.m.position.z = n.base.z + pop * 0.08;
    });
    // Lamp warms up at the end.
    lamp.intensity = 22 + 18 * smooth(range(prog, 0.86, 1));
    // Captions. They are fixed to the window, so fade them out as the footer scrolls in.
    const exit = range(track.getBoundingClientRect().bottom, innerHeight * 0.55, innerHeight);
    caps.forEach((c) => {
      const o = Math.min(smooth(range(prog, c.from, c.from + 0.03)), 1 - smooth(range(prog, c.to - 0.03, c.to)));
      const op = c.from === 0 ? 1 - smooth(range(prog, c.to - 0.03, c.to)) : o;
      const shown = op * exit;
      c.el.style.opacity = shown; c.el.classList.toggle('is-on', shown > 0.02);
      c.el.style.transform = `translateY(${(1 - op) * 16}px)`;
    });
    renderer.render(scene, camera);
    markReady();
  });
}
