import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { planOutputs, smPath, IMAGE_SPECS } from '../../scripts/make-thumbs.mjs';

const designs = JSON.parse(fs.readFileSync('public/data/designs.json', 'utf8'));
const DIR = 'docs/image-prompts';
const imagePaths = (d) => Object.values(d.images).flat();

describe('image prompt sheets', () => {
  it('has a README, a site sheet and one sheet per design', () => {
    expect(fs.existsSync(path.join(DIR, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(DIR, 'site.md'))).toBe(true);
    for (const d of designs) expect(fs.existsSync(path.join(DIR, `${d.slug}.md`)), d.slug).toBe(true);
  });

  it('every designs.json image path appears in exactly one design sheet', () => {
    const sheets = designs.map((d) => ({ slug: d.slug, text: fs.readFileSync(path.join(DIR, `${d.slug}.md`), 'utf8') }));
    for (const d of designs) {
      for (const p of imagePaths(d)) {
        const owners = sheets.filter((s) => s.text.includes(p)).map((s) => s.slug);
        expect(owners, p).toEqual([d.slug]);
      }
    }
  });

  it('design sheets reference no image path that is missing from designs.json', () => {
    const known = new Set(designs.flatMap(imagePaths));
    for (const d of designs) {
      const text = fs.readFileSync(path.join(DIR, `${d.slug}.md`), 'utf8');
      const found = text.match(/images\/designs\/[a-z0-9-]+\/[a-z0-9-]+\.webp/g) || [];
      expect(found.length, d.slug).toBeGreaterThan(0);
      for (const p of found) expect(known.has(p), `${d.slug}: ${p}`).toBe(true);
    }
  });

  it('each design sheet has one prompt block, alt text and a regenerate line per image', () => {
    for (const d of designs) {
      const text = fs.readFileSync(path.join(DIR, `${d.slug}.md`), 'utf8');
      const n = imagePaths(d).length;
      expect((text.match(/^```text$/gm) || []).length, d.slug).toBe(n);
      expect((text.match(/^\*\*Alt text:\*\*/gm) || []).length, d.slug).toBe(n);
      expect((text.match(/^\*\*Regenerate if:\*\*/gm) || []).length, d.slug).toBe(n);
      const copyLines = text.match(/^\*\*On-screen copy:\*\*.*$/gm) || [];
      expect(copyLines.length, d.slug).toBe(n);
      for (const line of copyLines) expect(line, d.slug).not.toMatch(/lorem|ipsum|dolor sit/i);
    }
  });
});

describe('make-thumbs path mapping', () => {
  it('maps a desktop screen png to its webp and -sm webp', () => {
    const plan = planOutputs('images/designs/x/web-1.png');
    expect(plan.outputs.map((o) => path.posix.basename(o.path))).toEqual(['web-1.webp', 'web-1-sm.webp']);
    expect(plan.outputs[0]).toMatchObject({ path: 'images/designs/x/web-1.webp', width: 2400, height: 1500 });
    expect(plan.outputs[1]).toMatchObject({ path: 'images/designs/x/web-1-sm.webp', width: 600, height: 375 });
  });

  it('uses the sizes the site displays', () => {
    const size = (p) => { const o = planOutputs(p).outputs[0]; return [o.width, o.height]; };
    expect(size('images/designs/x/cover.jpg')).toEqual([1200, 800]);
    expect(size('images/designs/x/hero.png')).toEqual([2400, 1600]);
    expect(size('images/designs/x/app-2.png')).toEqual([1200, 2600]);
    expect(size('images/designs/x/portal-1.png')).toEqual([2400, 1500]);
    expect(size('images/designs/x/admin-1.jpeg')).toEqual([2400, 1500]);
    expect(size('images/site/hero.png')).toEqual([1440, 1200]);
    expect(size('images/site/admin-hero.png')).toEqual([1600, 1000]);
    expect(size('images/site/industry-church.png')).toEqual([2400, 1600]);
    expect(size('images/site/texture-wood-slats.png')).toEqual([1600, 1600]);
  });

  it('phone screens extend, desktop screens crop from the top, scenes crop from the centre', () => {
    expect(planOutputs('images/designs/x/app-1.png').fit).toBe('extend');
    expect(planOutputs('images/designs/x/web-3.png').fit).toBe('top');
    expect(planOutputs('images/designs/x/cover.png').fit).toBe('center');
  });

  it('writes the OG variant as a 1200x630 jpg with no thumbnail', () => {
    const plan = planOutputs('images/site/og-source.png');
    expect(plan.outputs).toEqual([{ path: 'assets/brand/og-photo.jpg', width: 1200, height: 630, format: 'jpeg' }]);
  });

  it('only makes the thumbnail for a webp already at its final name', () => {
    const plan = planOutputs('images/designs/x/web-1.webp');
    expect(plan.outputs.map((o) => o.path)).toEqual(['images/designs/x/web-1-sm.webp']);
  });

  it('ignores thumbnails, placeholders and non-images', () => {
    expect(planOutputs('images/designs/x/web-1-sm.webp')).toBeNull();
    expect(planOutputs('images/designs/_placeholder.webp')).toBeNull();
    expect(planOutputs('images/designs/x/notes.txt')).toBeNull();
  });

  it('never plans an output on top of its source', () => {
    for (const p of ['images/designs/x/web-1.webp', 'images/site/hero.webp', 'images/site/odd.jpg']) {
      const plan = planOutputs(p);
      if (plan) for (const o of plan.outputs) expect(o.path).not.toBe(p);
    }
  });

  it('accepts Windows separators and exposes smPath', () => {
    expect(planOutputs('images\\designs\\x\\web-1.png').outputs[0].path).toBe('images/designs/x/web-1.webp');
    expect(smPath('images/a/b.webp')).toBe('images/a/b-sm.webp');
    expect(IMAGE_SPECS.length).toBeGreaterThan(5);
  });
});
