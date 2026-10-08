// Copies the CTSD Lab's third-party libraries into public/assets/vendor/ so the site
// serves them itself (no CDN). Run after `npm install`: node scripts/vendor-lab.mjs
import { build } from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';

const out = 'public/assets/vendor';
mkdirSync(out, { recursive: true });

// Three.js ships unminified ES modules; bundle three.module.js + three.core.js into one minified module.
await build({ entryPoints: ['node_modules/three/build/three.module.js'], bundle: true, minify: true, format: 'esm', outfile: `${out}/three.min.js`, legalComments: 'inline' });
// Lenis and Matter.js ship minified UMD/global builds.
copyFileSync('node_modules/lenis/dist/lenis.min.js', `${out}/lenis.min.js`);
copyFileSync('node_modules/matter-js/build/matter.min.js', `${out}/matter.min.js`);
console.log('vendored into', out);
