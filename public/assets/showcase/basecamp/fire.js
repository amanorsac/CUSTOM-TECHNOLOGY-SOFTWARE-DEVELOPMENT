// Basecamp hero photo, alive: heat haze wobbles the air above the fire, the flames flicker, and embers
// rise and drift with the cursor like wind.
import * as THREE from '/assets/vendor/three.min.js';

const FIRE = [0.497, 0.42];   // the fire in texture space (0,0 = bottom-left)
const FOCUS = [0.5, 0.38];    // matches the <img> object-position (50% 62%)

export function startFire(canvas, img, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : Math.min(dpr, 2));
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tex = new THREE.Texture(img); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  const uniforms = {
    uTex: { value: tex }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
    uImg: { value: new THREE.Vector2(img.naturalWidth, img.naturalHeight) }, uFire: { value: new THREE.Vector2(...FIRE) },
    uFocus: { value: new THREE.Vector2(...FOCUS) }, uWind: { value: 0 }, uHeat: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTex; uniform float uTime, uWind, uHeat; uniform vec2 uRes, uImg, uFire, uFocus;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      vec2 cover(vec2 uv){ float rs = uRes.x/uRes.y, ri = uImg.x/uImg.y;
        vec2 s = rs > ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.); return (uv - .5) * s + clamp(uFocus, s*.5, 1. - s*.5); }
      void main(){
        vec2 uv = cover(vUv);
        float asp = uImg.x / uImg.y;
        vec2 d = (uv - uFire) * vec2(asp, 1.);
        // Heat haze: a column of rippling air above the flames, bending with the wind.
        float col = exp(-pow((d.x - uWind * max(d.y, 0.) * .5) * 4.2, 2.)) * smoothstep(-.04, .06, d.y) * smoothstep(.75, .1, d.y);
        vec2 n = vec2(noise(vec2(uv.x * 26., uv.y * 18. - uTime * 3.2)), noise(vec2(uv.x * 22. + 7., uv.y * 16. - uTime * 2.7))) - .5;
        uv += n * .012 * col * uHeat;
        vec3 c = texture2D(uTex, uv).rgb;
        // Flicker: the firelight breathes on everything near it.
        float fl = .85 + .3 * noise(vec2(uTime * 7., 1.)) + .12 * sin(uTime * 23.);
        float glow = exp(-length(d * vec2(1., 1.4)) * 5.);
        c *= 1. + glow * (fl - 1.) * 1.2;
        c += vec3(1., .45, .12) * glow * .12 * fl;
        // Embers: forty sparks, each on its own looping path.
        for (int i = 0; i < 40; i++) {
          float fi = float(i), h1 = hash(vec2(fi, 1.3)), h2 = hash(vec2(fi, 7.1)), h3 = hash(vec2(fi, 3.7));
          float life = 2.2 + h2 * 2.6, t = fract(uTime / life + h1);
          float rise = t * (.32 + h3 * .3);
          vec2 p = uFire + vec2((h2 - .5) * .1 + sin(uTime * (1.5 + h3 * 2.) + fi) * .018 * t + uWind * rise * .9, .02 + rise);
          vec2 q = (uv - p) * vec2(asp, 1.);
          float r = mix(.0042, .0016, t);
          float spark = smoothstep(r, 0., length(q)) * (1. - t) * smoothstep(0., .08, t);
          c += vec3(1., .62 + h3 * .25, .2) * spark * 2.2;
        }
        c += (hash(vUv * uRes + uTime) - .5) * .025;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  let visible = true, targetWind = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); targetWind = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.6))); }, { passive: true });
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); uniforms.uRes.value.set(w, h); };
  addEventListener('resize', resize); resize();
  return {
    tick(t, dt) {
      if (!visible) return;
      uniforms.uTime.value = t;
      uniforms.uWind.value += (targetWind - uniforms.uWind.value) * Math.min(1, dt * 2);
      renderer.render(scene, camera);
    },
  };
}
