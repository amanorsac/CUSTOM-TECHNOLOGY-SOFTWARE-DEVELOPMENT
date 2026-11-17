// The draft publishes only the photos its pages use: scripts/kingsley-images.mjs
// USED, img/manifest.json, the files in img/ and the built pages must agree.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { USED, WIDTHS, WIDE, WIDE_WIDTH } from '../../scripts/kingsley-images.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const IMG = path.join(root, 'public/assets/preview/kingsley/img');
const PAGES = path.join(root, 'public/preview/kingsley');

const manifest = JSON.parse(readFileSync(path.join(IMG, 'manifest.json'), 'utf8'));
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = path.join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const html = walk(PAGES).filter((f) => f.endsWith('.html')).map((f) => readFileSync(f, 'utf8')).join('\n');
const referenced = new Set([...html.matchAll(/\/kingsley\/img\/([a-z0-9-]+)-(?:800|1600)\.(?:jpg|webp)/g)].map((m) => m[1]));

describe('kingsley images', () => {
  it('the manifest lists exactly the USED photos', () => {
    expect(Object.keys(manifest).sort()).toEqual([...USED].sort());
  });

  it('every USED photo is referenced by a built page, and every reference is USED', () => {
    expect([...referenced].sort()).toEqual([...USED].sort());
  });

  it('img/ holds only the USED photos (plus brand/ and the manifest)', () => {
    const widths = (n) => (WIDE.includes(n) ? [...WIDTHS, WIDE_WIDTH] : WIDTHS);
    const expected = USED.flatMap((n) => widths(n).flatMap((w) => [`${n}-${w}.jpg`, `${n}-${w}.webp`]));
    const files = readdirSync(IMG).filter((f) => f !== 'manifest.json' && f !== 'brand');
    expect(files.sort()).toEqual(expected.sort());
  });
});
