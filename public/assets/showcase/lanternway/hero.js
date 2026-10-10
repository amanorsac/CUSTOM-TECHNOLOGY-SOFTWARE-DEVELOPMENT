// Lanternway hero: morning light pours through the sanctuary windows. Bright window pixels are smeared
// toward the sun (screen-space light scattering), dust drifts inside the beams, the depth map gives the
// room parallax, and scrolling dollies the camera down the aisle.
import * as THREE from '/assets/vendor/three.min.js';

const FOCUS = [0.55, 0.6]; // matches object-position 55% 40%

export function startHero(canvas, img, depthImg, { mobile, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.25) : Math.min(dpr, 1.75));
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tex = (im, srgb) => { const t = new THREE.Texture(im); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t; };
  const uniforms = {
    uTex: { value: tex(img, true) }, uDepth: { value: tex(depthImg) }, uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(img.naturalWidth, img.naturalHeight) },
    uSun: { value: new THREE.Vector2(0.95, 1.25) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uDolly: { value: 0 }, uIn: { value: 0 }, uFocus: { value: new THREE.Vector2(...FOCUS) }, uSteps: { value: mobile ? 28 : 48 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTex, uDepth; uniform float uTime, uDolly, uIn, uSteps; uniform vec2 uRes, uImg, uSun, uMouse, uFocus;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec2 cover(vec2 uv, float zoom){ float rs = uRes.x/uRes.y, ri = uImg.x/uImg.y;
        vec2 s = (rs > ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.)) / zoom; return (uv - .5) * s + clamp(uFocus, s*.5, 1. - s*.5); }
      vec3 look(vec2 uv){
        // depth parallax: near things slide more than far things, and the dolly pushes near things outward
        float d = texture2D(uDepth, uv).r;
        vec2 m = uMouse - .5;
        uv -= m * (d - .3) * .03;
        uv = (uv - uFocus) / (1. + d * uDolly * .35) + uFocus;
        return texture2D(uTex, clamp(uv, .001, .999)).rgb;
      }
      float bright(vec2 uv){ vec3 c = texture2D(uTex, clamp(uv, .001, .999)).rgb; float l = dot(c, vec3(.3,.59,.11)); return smoothstep(.62, .92, l); }
      void main(){
        vec2 uv = cover(vUv, 1.04 + uDolly * .28);
        vec3 col = look(uv);
        // light scattering toward the sun, which leans with the mouse
        vec2 sun = uSun + (uMouse - .5) * vec2(.25, .12);
        vec2 dir = (uv - sun) / uSteps * .9;
        vec2 p = uv; float acc = 0., w = 1.;
        for (int i = 0; i < 48; i++) { if (float(i) >= uSteps) break; p -= dir; acc += bright(p) * w; w *= .965; }
        acc /= uSteps;
        float beams = acc * (1.05 + .12 * sin(uTime * .6));
        col += vec3(1., .86, .6) * beams * 2.1;
        // dust motes, only visible where the light is
        vec2 g = uv * vec2(uImg.x / uImg.y, 1.) * 34.;
        vec2 cell = floor(g + vec2(uTime * .05, -uTime * .08)); vec2 f = fract(g + vec2(uTime * .05, -uTime * .08)) - .5;
        float h = hash(cell); vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) - .5;
        float mote = smoothstep(.06, 0., length(f - o * .6)) * step(.82, h) * (.5 + .5 * sin(uTime * (1. + h * 2.) + h * 30.));
        col += vec3(1., .93, .78) * mote * smoothstep(.02, .14, beams) * .9;
        // warm grade, film grain, fade in
        col = mix(col, col * vec3(1.04, 1., .93), .6);
        col = col * 1.08 + vec3(.02, .015, 0.);
        col *= mix(.25, 1., uIn);
        col += (hash(vUv * uRes + uTime) - .5) * .02;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const target = new THREE.Vector2(0.5, 0.5); let lastMove = -1e4, visible = true;
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; target.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight); lastMove = performance.now(); }, { passive: true });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  const resize = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; if (!w || !h) return; renderer.setSize(w, h, false); uniforms.uRes.value.set(w, h); };
  addEventListener('resize', resize); resize();

  return {
    uniforms,
    tick(t, dt) {
      if (!visible) return;
      if (performance.now() - lastMove > 3000) target.set(0.5 + Math.sin(t * 0.25) * 0.3, 0.5 + Math.cos(t * 0.2) * 0.12);
      uniforms.uMouse.value.lerp(target, Math.min(1, dt * 2));
      uniforms.uTime.value = t;
      renderer.render(scene, camera);
    },
  };
}
