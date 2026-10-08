// CTSD Lab 03: Liquid gallery. One full-screen WebGL plane shows the 12 concept designs. Scrolling moves
// through them; a noise-displacement shader melts each into the next, and colours split with scroll speed.
// The design name animates in letter by letter, and a magnetic ring follows the cursor.
import * as THREE from '/assets/vendor/three.min.js';
import { chooseMode, loop, MOBILE, DPR, clamp, smooth, markReady } from './common.js';

const live = chooseMode();
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const data = await fetch('/data/designs.json').then((r) => r.json());
const designs = (Array.isArray(data) ? data : data.designs).map((d) => ({
  slug: d.slug, name: d.name, category: d.category, tagline: d.tagline,
  img: `/images/designs/${d.slug}/hero.webp`,
}));

// The still version (and a no-JS-friendly list for everyone else) is a simple grid of links.
document.querySelector('[data-gl-still]').innerHTML = designs.map((d) =>
  `<a href="/designs/${esc(d.slug)}"><img src="${esc(d.img)}" alt="Concept design: ${esc(d.name)}" width="2400" height="1600" loading="lazy"><b>${esc(d.name)}</b><span>${esc(d.tagline)}</span></a>`).join('');

if (live) start();

function start() {
  const N = designs.length;
  const canvas = document.getElementById('lab-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(MOBILE ? Math.min(DPR, 1.5) : DPR);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const loader = new THREE.TextureLoader();
  const textures = designs.map((d) => { const t = loader.load(d.img); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; return t; });

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uA: { value: textures[0] }, uB: { value: textures[1] }, uMix: { value: 0 }, uVel: { value: 0 },
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(2400, 1600) },
      uDim: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uA, uB; uniform float uMix, uVel, uTime, uDim; uniform vec2 uRes, uImg, uMouse;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
      float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
      vec2 cover(vec2 uv) { float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
        vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0); return (uv - 0.5) * s * 0.94 + 0.5; }
      vec3 tex(sampler2D t, vec2 uv, float shift) {
        return vec3(texture2D(t, uv + vec2(shift, 0.0)).r, texture2D(t, uv).g, texture2D(t, uv - vec2(shift, 0.0)).b);
      }
      void main() {
        vec2 uv = cover(vUv);
        // gentle parallax toward the cursor
        uv += (uMouse - 0.5) * 0.012;
        float n = fbm(vUv * 3.2 + vec2(uTime * 0.05, -uTime * 0.04));
        float m = uMix;
        float edge = smoothstep(m - 0.18, m + 0.18, n * 0.9 + vUv.y * 0.1 + 0.05 - 0.05 * (1.0 - m));
        float wave = sin(m * 3.14159);
        vec2 dA = vec2(n - 0.5, fbm(vUv * 2.1 + 4.0) - 0.5) * 0.22 * wave;
        float shift = clamp(abs(uVel), 0.0, 1.0) * 0.012 + wave * 0.004;
        vec3 a = tex(uA, uv + dA * m, shift), b = tex(uB, uv - dA * (1.0 - m), shift);
        vec3 col = mix(a, b, 1.0 - edge);
        // warm highlight along the liquid edge
        float rim = smoothstep(0.08, 0.0, abs(edge - 0.5)) * wave;
        col += vec3(0.83, 0.69, 0.22) * rim * 0.35;
        // legibility: darken toward the bottom-left where the caption sits, plus a soft vignette
        float shade = smoothstep(0.75, 0.0, vUv.y) * 0.62 + smoothstep(0.55, 0.0, vUv.x) * 0.25;
        float vig = smoothstep(1.15, 0.35, length(vUv - 0.5));
        col *= (1.0 - shade * 0.85) * mix(0.55, 1.0, vig);
        col = mix(col, vec3(0.118, 0.075, 0.063), uDim);
        col += (hash(vUv * uRes + uTime) - 0.5) * 0.025;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const track = document.querySelector('.gl-track'), ui = document.querySelector('.gl-ui');
  const elIdx = document.querySelector('[data-gl-index]'), elTitle = document.querySelector('[data-gl-title]');
  const elCat = document.querySelector('[data-gl-cat]'), elTag = document.querySelector('[data-gl-tag]');
  const elLink = document.querySelector('[data-gl-link]'), bar = document.querySelector('[data-gl-bar]');
  document.querySelector('[data-gl-total]').textContent = String(N).padStart(2, '0');

  const lenis = window.Lenis ? new window.Lenis({ lerp: 0.085 }) : null;
  const step = () => innerHeight * 0.7;
  const trackTop = () => track.getBoundingClientRect().top + scrollY;
  const goTo = (i) => { const y = trackTop() + clamp(i, 0, N - 1) * step(); lenis ? lenis.scrollTo(y, { duration: 0.9 }) : window.scrollTo(0, y); };

  // Show one design's caption; the title's letters rise in one after another.
  let shown = -1;
  function caption(i) {
    if (i === shown) return; shown = i; const d = designs[i];
    elIdx.textContent = String(i + 1).padStart(2, '0');
    elCat.textContent = d.category;
    elTag.textContent = d.tagline;
    elLink.href = `/designs/${d.slug}`;
    elTitle.setAttribute('aria-label', d.name);
    // Fit the name on one line: Montserrat 700 runs about 0.62em per character.
    const avail = elTitle.parentElement.clientWidth || innerWidth * 0.9;
    elTitle.style.fontSize = `${Math.min(innerWidth * 0.105, 160, avail / (d.name.length * 0.62))}px`;
    elTitle.innerHTML = [...d.name].map((c, k) => c === ' ' ? ' ' : `<span class="ch" aria-hidden="true" style="animation-delay:${k * 22}ms">${esc(c)}</span>`).join('');
  }
  caption(0);

  // Snap to the nearest design after the scroll settles.
  let idle = 0;
  lenis?.on('scroll', () => { idle = 0; });
  addEventListener('scroll', () => { idle = 0; }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(Math.round(cur) + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(Math.round(cur) - 1); }
  });

  // Magnetic ring and click-to-open over the image.
  const ring = document.querySelector('.gl-ring'), mouse = new THREE.Vector2(0.5, 0.5), rp = { x: innerWidth / 2, y: innerHeight / 2 }, tp = { ...rp };
  let over = false;
  addEventListener('pointermove', (e) => {
    tp.x = e.clientX; tp.y = e.clientY; mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
    const t = e.target;
    over = e.pointerType === 'mouse' && !!t.closest?.('.gl-ui') && !t.closest('a, button') && inDesigns;
  }, { passive: true });
  ui.addEventListener('click', (e) => { if (!e.target.closest('a, button') && inDesigns) location.href = elLink.href; });
  ui.style.cursor = 'none';

  function resize() {
    if (!innerWidth || !innerHeight) return;
    renderer.setSize(innerWidth, innerHeight, false);
    mat.uniforms.uRes.value.set(innerWidth, innerHeight);
  }
  addEventListener('resize', resize); resize();

  let cur = 0, inDesigns = true, lastS = 0;
  loop((t, dt) => {
    lenis?.raf(t * 1000);
    const s = Math.max(0, scrollY - trackTop());
    const f = s / step();
    cur = Math.min(N - 1, f);
    const end = clamp((f - (N - 1)) / 0.9);
    inDesigns = end < 0.3;
    const a = Math.min(N - 2, Math.floor(cur)), frac = cur - a;
    mat.uniforms.uA.value = textures[a]; mat.uniforms.uB.value = textures[a + 1];
    mat.uniforms.uMix.value = smooth(clamp((frac - 0.12) / 0.76));
    const vel = (s - lastS) / Math.max(dt, 0.001) / innerHeight; lastS = s;
    mat.uniforms.uVel.value += (vel * 0.5 - mat.uniforms.uVel.value) * Math.min(1, dt * 6);
    mat.uniforms.uTime.value = t;
    mat.uniforms.uDim.value = end * 0.85;
    mat.uniforms.uMouse.value.lerp(mouse, Math.min(1, dt * 3));
    caption(Math.round(cur));
    ui.style.opacity = 1 - smooth(clamp(end * 1.8));
    bar.style.width = `${(cur / (N - 1)) * 100}%`;
    // snap after ~180ms of stillness, while browsing the designs
    idle += dt;
    if (idle > 0.18 && idle < 0.18 + dt * 1.5 && inDesigns && Math.abs(f - Math.round(f)) > 0.02 && f < N - 1) goTo(Math.round(f));
    // ring
    rp.x += (tp.x - rp.x) * Math.min(1, dt * 12); rp.y += (tp.y - rp.y) * Math.min(1, dt * 12);
    ring.style.transform = `translate(${rp.x}px, ${rp.y}px) scale(${over ? 1 : 0.4})`;
    ring.classList.toggle('is-on', over);
    renderer.render(scene, camera);
    markReady();
  });
}
