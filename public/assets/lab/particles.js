// CTSD Lab 01: Particle morph. A GPU particle field that morphs between shapes sampled from the CTSD mark,
// words and a sphere. Positions are recomputed from targets every frame, so the cursor push springs back
// without any physics state.
import * as THREE from '/assets/vendor/three.min.js';
import { chooseMode, loop, MOBILE, DPR, scrollProgress, loadImage, markReady } from './common.js';

if (chooseMode()) start().catch((e) => { console.error(e); document.documentElement.classList.add('lab-static'); });

async function start() {
  const canvas = document.getElementById('lab-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x1e1310, 1);
  const scene = new THREE.Scene();
  // A hidden or not-yet-laid-out window can report 0x0; fall back to 16:9 so the shapes stay finite.
  const aspect0 = innerWidth > 0 && innerHeight > 0 ? innerWidth / innerHeight : 16 / 9;
  const camera = new THREE.PerspectiveCamera(40, aspect0, 0.1, 100);
  camera.position.set(0, 0, 12);

  const N = MOBILE ? 14000 : 60000;
  const viewH = 2 * 12 * Math.tan(THREE.MathUtils.degToRad(20));
  const viewW = () => viewH * camera.aspect;
  const wordW = Math.min(viewW() * (innerWidth < 760 ? 0.94 : 0.84), 12.5);
  const yShift = innerWidth < 760 ? 1.15 : 0.55;
  // On wide screens the logo and sphere sit in the right half, clear of the captions on the left.
  const xSide = innerWidth >= 1000 ? viewW() * 0.2 : 0;

  await document.fonts.load('700 200px Montserrat');
  const mark = await loadImage('/assets/brand/mark-reverse.svg');

  // Sample N points from whatever is drawn on a 2D canvas, mapped to a world-space box `worldW` wide.
  function sample(w, h, worldW, draw, dx = 0) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true }); draw(g, w, h);
    const data = g.getImageData(0, 0, w, h).data, hits = [];
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 110) hits.push(x, y);
    const out = new Float32Array(N * 3), worldH = worldW * h / w, n = hits.length / 2;
    if (!n) throw new Error('particles: nothing drawn to sample');
    for (let i = 0; i < N; i++) {
      const k = (Math.random() * n | 0) * 2;
      out[i * 3] = ((hits[k] + Math.random() * 2) / w - 0.5) * worldW + dx;
      out[i * 3 + 1] = -((hits[k + 1] + Math.random() * 2) / h - 0.5) * worldH + yShift;
      out[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return out;
  }
  const word = (text) => sample(1600, 360, wordW, (g, w, h) => {
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let size = 260; g.font = `700 ${size}px Montserrat`;
    while (g.measureText(text).width > w * 0.94) { size -= 8; g.font = `700 ${size}px Montserrat`; }
    g.fillText(text, w / 2, h / 2 + 8);
  });
  const markH = Math.min(3.8, viewW() * 0.62);
  const logo = sample(500, 560, markH * 500 / 560, (g, w, h) => g.drawImage(mark, 0, 0, w, h), xSide);
  const sphere = (() => {
    const out = new Float32Array(N * 3), r = Math.min(2.4, viewW() * 0.36);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963;
      const j = 1 + (Math.random() - 0.5) * 0.05;
      out[i * 3] = Math.cos(th) * rad * r * j + xSide; out[i * 3 + 1] = y * r * j + yShift; out[i * 3 + 2] = Math.sin(th) * rad * r * j;
    }
    return out;
  })();
  const cloud = (() => {
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = 2.5 + Math.pow(Math.random(), 0.6) * 9;
      out[i * 3] = Math.cos(a) * r; out[i * 3 + 1] = Math.sin(a) * r * 0.6 + yShift; out[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return out;
  })();

  const shapes = [cloud, logo, word('WEBSITES'), word('APPS'), word('PORTALS'), word('CRMs'), sphere];
  const geo = new THREE.BufferGeometry();
  shapes.forEach((s, i) => geo.setAttribute(`aS${i}`, new THREE.BufferAttribute(s, 3)));
  geo.setAttribute('position', new THREE.BufferAttribute(logo, 3));
  const rand = new Float32Array(N * 2), col = new Float32Array(N * 3);
  const palette = [[0.83, 0.69, 0.22], [0.78, 0.61, 0.42], [0.97, 0.94, 0.89], [0.90, 0.77, 0.61]];
  for (let i = 0; i < N; i++) {
    rand[i * 2] = Math.random(); rand[i * 2 + 1] = Math.random();
    const p = palette[Math.random() < 0.55 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.6 ? 3 : 2];
    col.set(p, i * 3);
  }
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 2));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));

  const pick = Array.from({ length: 7 }, (_, i) => `if (s == ${i}) return aS${i};`).join(' ');
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uA: { value: 1 }, uB: { value: 1 }, uMix: { value: 0 }, uIntro: { value: 0 }, uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) }, uPush: { value: 0 }, uSize: { value: MOBILE ? 2.6 : 2.1 }, uDpr: { value: DPR },
    },
    vertexShader: `
      attribute vec3 aS0; attribute vec3 aS1; attribute vec3 aS2; attribute vec3 aS3; attribute vec3 aS4; attribute vec3 aS5; attribute vec3 aS6;
      attribute vec2 aRand; attribute vec3 aColor;
      uniform int uA; uniform int uB; uniform float uMix; uniform float uIntro; uniform float uTime;
      uniform vec3 uMouse; uniform float uPush; uniform float uSize; uniform float uDpr;
      varying vec3 vColor; varying float vAlpha;
      vec3 shape(int s) { ${pick} return aS1; }
      vec3 spin(vec3 p, int s) {
        if (s != 6) return p;
        float a = uTime * 0.35; vec3 q = p; q.y -= ${yShift.toFixed(3)}; q.x -= ${xSide.toFixed(3)};
        q = vec3(q.x * cos(a) + q.z * sin(a), q.y, -q.x * sin(a) + q.z * cos(a));
        q.y += ${yShift.toFixed(3)}; q.x += ${xSide.toFixed(3)}; return q;
      }
      void main() {
        vec3 a = spin(shape(uA), uA), b = spin(shape(uB), uB);
        float d = clamp(uMix * 1.35 - aRand.x * 0.35, 0.0, 1.0);
        d = d * d * (3.0 - 2.0 * d);
        vec3 p = mix(a, b, d);
        // mid-morph swirl
        float sw = sin(d * 3.14159);
        p += sw * vec3(sin(aRand.y * 40.0 + uTime) , cos(aRand.x * 40.0 + uTime), 0.0) * 0.55;
        float ii = clamp(uIntro * 1.5 - aRand.y * 0.5, 0.0, 1.0); ii = 1.0 - pow(1.0 - ii, 3.0);
        p = mix(aS0, p, ii);
        p += 0.025 * vec3(sin(uTime * 1.3 + aRand.x * 30.0), cos(uTime * 1.1 + aRand.y * 25.0), sin(uTime * 0.9 + aRand.x * 9.0));
        vec2 dv = p.xy - uMouse.xy; float dist = length(dv);
        p.xy += normalize(dv + 1e-4) * uPush * 1.5 * (1.0 - smoothstep(0.0, 2.1, dist)) * (0.6 + aRand.y * 0.8);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uDpr * (0.55 + aRand.y * 0.9) * (12.0 / -mv.z);
        vColor = aColor; vAlpha = 0.55 + 0.45 * aRand.x;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5; float r = length(c);
        if (r > 0.5) discard;
        float a = smoothstep(0.5, 0.0, r);
        gl_FragColor = vec4(vColor * (0.6 + a * 0.7), a * vAlpha * 0.85);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  // Smooth scroll, if Lenis is present.
  const lenis = window.Lenis ? new window.Lenis({ lerp: 0.09 }) : null;

  // Cursor in world space on the z = 0 plane; push strength decays when the cursor rests.
  const mouse = new THREE.Vector2(99, 99); let push = 0, lastMove = 0;
  addEventListener('pointermove', (e) => {
    mouse.set(((e.clientX / innerWidth) * 2 - 1) * viewW() / 2, (-(e.clientY / innerHeight) * 2 + 1) * viewH / 2);
    lastMove = performance.now();
  }, { passive: true });
  addEventListener('pointerleave', () => mouse.set(99, 99));

  function resize() {
    if (!innerWidth || !innerHeight) return;
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener('resize', resize); resize();

  let stage = 1, t0 = null;
  loop((t, dt) => {
    if (t0 === null) t0 = t;
    lenis?.raf(t * 1000);
    // Stage 1 (logo) at the top through stage 7 (logo again) at the bottom; shapes hold while each caption is up.
    const target = 1 + scrollProgress() * 6;
    stage += (target - stage) * Math.min(1, dt * 6);
    const lo = Math.floor(stage), f = stage - lo;
    const hold = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
    const idx = (k) => (k >= 7 ? 1 : k);
    mat.uniforms.uA.value = idx(lo); mat.uniforms.uB.value = idx(Math.min(7, lo + 1)); mat.uniforms.uMix.value = hold;
    mat.uniforms.uIntro.value = Math.min(1, (t - t0) / 2.6);
    mat.uniforms.uTime.value = t;
    const active = performance.now() - lastMove < 1200 ? 1 : 0;
    push += (active - push) * Math.min(1, dt * 4);
    mat.uniforms.uPush.value = push;
    mat.uniforms.uMouse.value.set(mouse.x, mouse.y, 0);
    points.rotation.y = Math.sin(t * 0.2) * 0.06;
    renderer.render(scene, camera);
    if (t - t0 > 0.1) markReady();
  });
}
