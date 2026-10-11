// Guards the midnight and ember re-brand: no brown values or wood names survive in the CTSD site's own
// CSS, JS and pages, and only two font families load. (Showpieces and client previews keep their palettes.)
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = /[\\/](vendor|showcase|preview)[\\/]/;
function files(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (SKIP.test(p + '/')) continue;
    if (statSync(p).isDirectory()) files(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}
const SITE = [...files('public/assets/css', ['.css']), ...files('public/assets/js', ['.js']), ...files('public/assets/home', ['.js'])];
const PAGES = files('public', ['.html']);

const BROWN_HEX = /#(2B1B18|3E2723|4E3626|5E4430|553B29|432D1F|6B4F32|C89B6B|4A3127|D6AE82|7A5634|5A4636|F7EFE4|D4AF37|556B2F)\b/i;
const BROWN_RGB = /rgba?\(\s*(62\s*,\s*39\s*,\s*35|43\s*,\s*27\s*,\s*24|200\s*,\s*155\s*,\s*107|107\s*,\s*79\s*,\s*50|247\s*,\s*239\s*,\s*228)\s*[,)]/;
const WOOD_NAMES = /--(deep-brown|wood-brown|warm-tan|tan-ink|cream|gold|sage|charcoal|off-white|ink-muted)\b|section--(wood|cream)\b|\bslats\b/;

describe('midnight and ember brand', () => {
  it('no brown colour values remain in the site CSS and scripts', () => {
    const hits = SITE.filter((f) => BROWN_HEX.test(readFileSync(f, 'utf8')) || BROWN_RGB.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });

  it('no wood-era token or class names remain', () => {
    const hits = [...SITE, ...PAGES].filter((f) => WOOD_NAMES.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });

  it('only Montserrat and Inter are loaded', () => {
    const css = readFileSync('public/assets/css/tokens.css', 'utf8');
    const families = new Set([...css.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]));
    expect([...families].sort()).toEqual(['Inter', 'Montserrat']);
    for (const p of PAGES) expect(readFileSync(p, 'utf8'), p).not.toMatch(/poppins/i);
  });
});
