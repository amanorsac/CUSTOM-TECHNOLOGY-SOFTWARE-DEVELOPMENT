// The workshop wall, pre-WebGL version: in Task 2 both boots only wire the four screen videos over the
// still. Task 3 replaces bootWall with the three.js scene.
export function bootStillWall() {
  const vids = [...document.querySelectorAll('[data-wall-screens] video')];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }
  });
  vids.forEach((v) => io.observe(v));
}
export function bootWall() { bootStillWall(); }
