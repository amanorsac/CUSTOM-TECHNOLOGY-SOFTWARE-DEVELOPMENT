// Juniper & Vale hero: the photo becomes 2.5D (a depth map shifts near and far layers as you move), and
// a slider re-grades it from midday to golden hour to night: the sky deepens, stars come out and the
// interior lights glow through the windows.
import * as THREE from '/assets/vendor/three.min.js';

const IMG = '/assets/showcase/juniper-vale/img/';
const SUN = [0.93, 0.55];   // the sun in texture space (0,0 = bottom-left)
const FOCUS = [0.5, 0.48];  // what stays in frame on narrow screens: the house

export function startHero(canvas, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : dpr);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const load = (f, srgb, onLoad) => { const t = new THREE.TextureLoader().load(IMG + f, onLoad); t.minFilter = THREE.LinearFilter; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const uniforms = {
    uTex: { value: load('hero.webp', true, (t) => uniforms.uImg.value.set(t.image.width, t.image.height)) }, uDepth: { value: load('hero-depth.webp') }, uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(16, 9) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTod: { value: 0.45 }, uIn: { value: 0 }, uSun: { value: new THREE.Vector2(...SUN) }, uFocus: { value: new THREE.Vector2(...FOCUS) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTex, uDepth; uniform float uTime, uTod, uIn; uniform vec2 uRes, uImg, uMouse, uSun, uFocus;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec2 cover(vec2 uv, float zoom){ float rs = uRes.x/uRes.y, ri = uImg.x/uImg.y;
        vec2 s = (rs > ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.)) * zoom; return (uv - .5) * s + clamp(uFocus, s*.5, 1. - s*.5); }
      float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
      void main(){
        // slight zoom gives the parallax room to move without showing edges
        vec2 uv = cover(vUv, .94);
        float d = texture2D(uDepth, uv).r;
        vec2 m = (uMouse - .5);
        uv -= m * (d - .35) * .045;
        uv = clamp(uv, .001, .999);
        d = texture2D(uDepth, uv).r;
        vec3 col = texture2D(uTex, uv).rgb;
        float L = lum(col);
        // --- day: cooler, brighter, less orange
        // pull the orange out, lift the shadows, cool and brighten: a clear midday
        vec3 day = mix(vec3(L), col, .5);
        day = pow(day, vec3(.72)) * vec3(.97, 1.02, 1.12) * 1.32 + vec3(.06, .07, .09);
        day = mix(day, vec3(.78, .86, .95), smoothstep(.55, .8, uv.y) * smoothstep(.3, .12, d) * .55);
        // --- night: deep blue, warm windows, stars
        // moonlit blue, with the interior lights glowing through the glass
        vec3 night = col * vec3(.24, .3, .5) + vec3(.01, .015, .04);
        float warm = smoothstep(.04, .2, col.r - col.b) * smoothstep(.3, .62, L);
        float sunMask = smoothstep(.12, .26, distance(uv * vec2(uImg.x / uImg.y, 1.), uSun * vec2(uImg.x / uImg.y, 1.)));
        float glow = 0.;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * .785; vec2 o = vec2(cos(a), sin(a)) * .012;
          vec3 s = texture2D(uTex, uv + o).rgb; glow += smoothstep(.04, .2, s.r - s.b) * smoothstep(.3, .62, lum(s));
        }
        glow /= 8.;
        night += col * vec3(1.5, 1.08, .62) * (warm * 1.6 + glow * .8) * sunMask;
        float sky = smoothstep(.22, .08, d) * smoothstep(.55, .8, uv.y);
        vec2 st = floor(uv * vec2(520., 330.));
        night += vec3(.9, .92, 1.) * step(.9965, hash(st)) * sky * (.5 + .5 * sin(uTime * 2. + hash(st) * 40.));
        // --- blend day → golden (the photo) → night
        vec3 c = uTod < .45 ? mix(day, col, smoothstep(0., .45, uTod)) : mix(col, night, smoothstep(.45, 1., uTod));
        // a soft sun flare, strongest at golden hour
        float g = 1. - abs(uTod - .45) / .45;
        float fl = exp(-distance(uv * vec2(1.6, 1.), uSun * vec2(1.6, 1.)) * 6.) * max(g, 0.);
        c += vec3(1., .78, .45) * fl * .35;
        c *= mix(.35, 1., uIn);
        c += (hash(vUv * uRes + uTime) - .5) * .02;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const target = new THREE.Vector2(0.5, 0.5); let lastMove = -1e4, visible = true;
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; target.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight); lastMove = performance.now(); }, { passive: true });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  const resize = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; if (!w || !h) return; renderer.setSize(w, h, false); uniforms.uRes.value.set(w, h); };
  addEventListener('resize', resize); resize();
  // Tilt a phone to look around.
  addEventListener('deviceorientation', (e) => { if (e.gamma == null) return; target.set(0.5 + Math.max(-1, Math.min(1, e.gamma / 30)) * 0.5, 0.5 - Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * 0.5); lastMove = performance.now(); });

  return {
    uniforms,
    tick(t, dt) {
      if (!visible) return;
      if (performance.now() - lastMove > 3000) target.set(0.5 + Math.sin(t * 0.3) * 0.25, 0.5 + Math.cos(t * 0.23) * 0.15);
      uniforms.uMouse.value.lerp(target, Math.min(1, dt * 3));
      uniforms.uTime.value = t;
      renderer.render(scene, camera);
    },
  };
}
