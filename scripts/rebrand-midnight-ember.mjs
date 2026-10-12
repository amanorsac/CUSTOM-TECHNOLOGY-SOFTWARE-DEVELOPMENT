// One-off re-brand: Brown Wood Theme → Midnight and ember. Renames tokens and classes, maps every
// hard-coded brown to the new palette, and drops Poppins. Run once: node scripts/rebrand-midnight-ember.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = /[\\/](vendor|showcase|preview)[\\/]/;
const walk = (dir, exts, out = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (SKIP.test(p + '/')) continue;
    if (statSync(p).isDirectory()) walk(p, exts, out); else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
};
const targets = [
  ...walk('public/assets/css', ['.css']), ...walk('public/assets/js', ['.js']), ...walk('public/assets/home', ['.js']),
  ...walk('public', ['.html']), ...walk('src', ['.js']), ...walk('tests', ['.js']),
].filter((f) => !f.endsWith('brand.test.js'));

// Token renames, longest first so --cream-muted is not caught by --cream.
const TOKENS = [
  ['--deep-brown-900', '--navy-950'], ['--deep-brown', '--navy'], ['--wood-brown', '--navy-700'],
  ['--warm-tan', '--ember'], ['--gold', '--ember'], ['--cream-muted', '--ivory-muted'], ['--cream', '--ivory'],
  ['--off-white', '--paper'], ['--tan-ink', '--ember-ink'], ['--ink-muted', '--slate'], ['--charcoal', '--ink'], ['--sage', '--teal'],
];
const CLASSES = [[/section--wood\b/g, 'section--dark'], [/section--cream\b/g, 'section--light'], [/\bslats\b/g, 'panels']];
const HEX = {
  '2B1B18': '0A1322', '3E2723': '0F1B2D', '4E3626': '16263F', '5E4430': '1F3A5F', '553B29': '1A2F4D', '432D1F': '13223A',
  '6B4F32': '1F3A5F', 'C89B6B': 'F2A23A', '4A3127': '1A2D4A', 'D6AE82': 'F5B254', '7A5634': '9A5B0A', '5A4636': '4E5D73',
  'F7EFE4': 'F7F4EE', 'D4AF37': 'F2A23A', '556B2F': '2F7D6B',
};
// Faint tan becomes a cool steel line; stronger tan (glows, shadows) becomes ember.
const RGB = [
  [/rgba?\(\s*62\s*,\s*39\s*,\s*35\s*(,\s*[\d.]+)?\s*\)/g, (m, a) => `rgba(15, 27, 45${a || ', 1'})`],
  [/rgba?\(\s*43\s*,\s*27\s*,\s*24\s*(,\s*[\d.]+)?\s*\)/g, (m, a) => `rgba(10, 19, 34${a || ', 1'})`],
  [/rgba?\(\s*107\s*,\s*79\s*,\s*50\s*(,\s*[\d.]+)?\s*\)/g, (m, a) => `rgba(31, 58, 95${a || ', 1'})`],
  [/rgba?\(\s*247\s*,\s*239\s*,\s*228\s*(,\s*[\d.]+)?\s*\)/g, (m, a) => `rgba(247, 244, 238${a || ', 1'})`],
  [/rgba?\(\s*200\s*,\s*155\s*,\s*107\s*(,\s*([\d.]+))?\s*\)/g, (m, a, n) => (n !== undefined && Number(n) <= 0.25 ? `rgba(148, 170, 204, ${n})` : `rgba(242, 162, 58${a || ', 1'})`)],
];

let changed = 0;
for (const f of targets) {
  const before = readFileSync(f, 'utf8');
  let s = before;
  for (const [a, b] of TOKENS) s = s.replace(new RegExp(a.replace(/-/g, '\\-') + '(?![\\w-])', 'g'), b);
  for (const [re, b] of CLASSES) s = s.replace(re, b);
  s = s.replace(/#(2B1B18|3E2723|4E3626|5E4430|553B29|432D1F|6B4F32|C89B6B|4A3127|D6AE82|7A5634|5A4636|F7EFE4|D4AF37|556B2F)\b/gi, (m, h) => `#${HEX[h.toUpperCase()]}`);
  for (const [re, fn] of RGB) s = s.replace(re, fn);
  // Poppins out: labels use Inter; drop its preloads.
  s = s.replace(/^.*poppins-latin-500-normal\.woff2.*\r?\n/gim, '');
  if (s !== before) { writeFileSync(f, s); changed++; }
}
console.log('files changed:', changed);

// tokens.css: the new palette block, Inter 600, no Poppins.
let t = readFileSync('public/assets/css/tokens.css', 'utf8');
t = t.replace(/@font-face \{\s*font-family: 'Poppins';[\s\S]*?\}\s*/, `@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(/fonts/inter-latin-600-normal.woff2) format('woff2');
}
`);
t = t.replace(/--font-label: 'Poppins',/, "--font-label: 'Inter',");
t = t.replace(/Palette is the brand board's "Brown Wood Theme"\. No blue anywhere\./, 'Palette: "Midnight and ember" (navy for trust, ember for every call to action).');
writeFileSync('public/assets/css/tokens.css', t);
copyFileSync('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', 'public/fonts/inter-latin-600-normal.woff2');
console.log('tokens.css updated; Inter 600 added');
