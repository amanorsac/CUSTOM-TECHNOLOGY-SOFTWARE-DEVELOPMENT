// Osteria Lume hero: the photo relit by the cursor. A depth map gives every pixel a height and a
// surface normal, so the warm cursor light falls across the bowl and pasta like a candle carried over the
// table. Two candle lights flicker on their own, and shader steam rises from the bowl.
import * as THREE from '/assets/vendor/three.min.js';

const IMG = '/assets/showcase/osteria-lume/img/';
// Where things sit in the photo, in texture space (0,0 = bottom-left).
const CANDLES = [[0.30, 0.94], [0.92, 0.94]];
const STEAM = [0.6, 0.56];
// The point of the photo that stays in frame when the screen crops it (the bowl).
const FOCUS = [0.62, 0.45];

export function startHero(canvas, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : dpr);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const load = (f) => { const t = new THREE.TextureLoader().load(IMG + f); t.minFilter = THREE.LinearFilter; return t; };
  const photo = load('hero.webp'); photo.colorSpace = THREE.SRGBColorSpace;
  const depth = load('hero-depth.webp');

  const uniforms = {
    uTex: { value: photo }, uDepth: { value: depth }, uTime: { value: 0 }, uIntro: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(2400, 1147) },
    uMouse: { value: new THREE.Vector2(0.55, 0.45) }, uPower: { value: 1 },
    uFocus: { value: new THREE.Vector2(...FOCUS) }, uC1: { value: new THREE.Vector2(...CANDLES[0]) }, uC2: { value: new THREE.Vector2(...CANDLES[1]) }, uSteam: { value: new THREE.Vector2(...STEAM) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTex, uDepth; uniform float uTime, uIntro, uPower;
      uniform vec2 uRes, uImg, uMouse, uC1, uC2, uSteam, uFocus;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= .5; } return v; }
      // screen uv -> image uv for an object-fit: cover image
      vec2 cover(vec2 uv){ float rs = uRes.x/uRes.y, ri = uImg.x/uImg.y;
        vec2 s = rs > ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.); return (uv - .5) * s + clamp(uFocus, s * .5, 1. - s * .5); }
      float D(vec2 uv){ return texture2D(uDepth, uv).r; }
      void main(){
        vec2 uv = cover(vUv);
        vec3 base = texture2D(uTex, uv).rgb;
        float aspect = uImg.x / uImg.y;
        vec2 e = 2.5 / uImg;
        float d = D(uv);
        vec3 n = normalize(vec3((D(uv - vec2(e.x, 0.)) - D(uv + vec2(e.x, 0.))) * 5.0, (D(uv - vec2(0., e.y)) - D(uv + vec2(0., e.y))) * 5.0, 1.0));
        vec3 P = vec3(uv.x * aspect, uv.y, d * .45);
        // the cursor candle
        vec2 m = cover(uMouse);
        vec3 Lp = vec3(m.x * aspect, m.y, .62);
        vec3 L = Lp - P; float dist = length(L); L /= dist;
        float flick = .9 + .07 * sin(uTime * 11.) + .05 * sin(uTime * 23. + 1.7) + .04 * noise(vec2(uTime * 6., 0.));
        float diff = max(dot(n, L), 0.);
        float att = 1. / (1. + dist * dist * 5.5);
        float spec = pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 28.) * att;
        vec3 warm = vec3(1.0, .72, .42);
        vec3 light = vec3(.13 + .1 * uIntro) + warm * (diff * att * 3.4 * uPower * flick) * uIntro;
        // the two candles on the table
        for (int i = 0; i < 2; i++){
          vec2 c = i == 0 ? uC1 : uC2;
          vec3 Cp = vec3(c.x * aspect, c.y - .08, .5);
          vec3 Lc = Cp - P; float dc = length(Lc); Lc /= dc;
          float fc = .85 + .15 * noise(vec2(uTime * (7. + float(i) * 2.), float(i) * 9.));
          light += warm * max(dot(n, Lc), 0.) / (1. + dc * dc * 9.) * 1.1 * fc * uIntro;
        }
        vec3 col = base * light + warm * spec * .55 * uIntro;
        // steam above the bowl
        vec2 s = uv - uSteam;
        float rise = clamp(s.y / .42, 0., 1.);
        float plume = fbm(vec2(s.x * 7. + sin(uTime * .4 + s.y * 6.) * .6, s.y * 3.2 - uTime * .38));
        float mask = smoothstep(.0, .08, s.y) * (1. - rise) * smoothstep(.16 + rise * .12, 0., abs(s.x + sin(s.y * 5. + uTime * .5) * .03));
        col += vec3(.95, .88, .78) * pow(plume, 2.2) * mask * .55 * uIntro * (.4 + .6 * light.r);
        // vignette and a little grain
        col *= smoothstep(1.25, .35, length((vUv - .5) * vec2(1.2, 1.)));
        col += (hash(vUv * uRes + uTime) - .5) * .03;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const target = new THREE.Vector2(0.58, 0.5); let lastMove = -10, visible = true;
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; target.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight); lastMove = performance.now(); }, { passive: true });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  const resize = () => { if (!innerWidth) return; renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false); uniforms.uRes.value.set(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight); };
  addEventListener('resize', resize); resize();

  return {
    uniforms,
    tick(t, dt) {
      if (!visible) return;
      // With no mouse (touch, or idle), the light drifts in a slow loop around the bowl.
      if (performance.now() - lastMove > 2500) target.set(0.6 + Math.cos(t * 0.35) * 0.16, 0.5 + Math.sin(t * 0.5) * 0.14);
      uniforms.uMouse.value.lerp(target, Math.min(1, dt * 4));
      uniforms.uTime.value = t;
      renderer.render(scene, camera);
    },
  };
}
