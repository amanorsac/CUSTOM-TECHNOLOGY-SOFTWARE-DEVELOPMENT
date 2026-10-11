// Each main page shares its own image, and every share image a page names exists on disk.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PUB = join(__dirname, '../../public');
const pages = (dir = PUB) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  if (statSync(p).isDirectory()) return f === 'assets' || f === 'preview' ? [] : pages(p);
  return f.endsWith('.html') ? [p] : [];
});
const image = (html, sel) => (html.match(new RegExp(`<meta ${sel} content="([^"]+)"`)) || [])[1];

describe('share images', () => {
  it('og:image and twitter:image agree and point at real files', () => {
    for (const p of pages()) {
      const html = readFileSync(p, 'utf8');
      const og = image(html, 'property="og:image"');
      if (!og) continue; // design.html gets its tags from the worker
      expect(image(html, 'name="twitter:image"'), p).toBe(og);
      expect(existsSync(join(PUB, og)), `${p} -> ${og}`).toBe(true);
    }
  });

  it('the main pages each have their own image', () => {
    for (const f of ['about', 'solutions', 'designs', 'mockup', 'start', 'privacy', 'demo/index',
      'industries/business', 'industries/church', 'industries/education', 'industries/nonprofit']) {
      const og = image(readFileSync(join(PUB, `${f}.html`), 'utf8'), 'property="og:image"');
      expect(og, f).toMatch(/^\/assets\/og\/[a-z]+\.jpg$/);
    }
  });
});
