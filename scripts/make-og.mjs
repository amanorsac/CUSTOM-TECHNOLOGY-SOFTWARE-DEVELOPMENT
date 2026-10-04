// Generates public/assets/brand/og-default.jpg (1200x630): deep-brown wood
// gradient, the CTSD mark and the tagline set in Montserrat.
// Run: node scripts/make-og.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const W = 1200, H = 630;
const brand = 'public/assets/brand/';

// sharp's text renderer (pango) does not load web fonts, so unwrap the WOFF1
// that @fontsource ships into a plain TrueType file in the temp dir.
function woffToSfnt(buf) {
  const n = buf.readUInt16BE(12);
  const dir = [];
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20;
    dir.push({ tag: buf.subarray(o, o + 4), off: buf.readUInt32BE(o + 4), comp: buf.readUInt32BE(o + 8),
      orig: buf.readUInt32BE(o + 12), sum: buf.readUInt32BE(o + 16) });
  }
  const head = Buffer.alloc(12 + n * 16);
  buf.copy(head, 0, 4, 8);
  head.writeUInt16BE(n, 4);
  const sel = Math.floor(Math.log2(n));
  head.writeUInt16BE((2 ** sel) * 16, 6);
  head.writeUInt16BE(sel, 8);
  head.writeUInt16BE(n * 16 - (2 ** sel) * 16, 10);
  const parts = [head];
  let offset = head.length;
  dir.forEach((t, i) => {
    const raw = buf.subarray(t.off, t.off + t.comp);
    const data = t.comp < t.orig ? zlib.inflateSync(raw) : raw;
    const o = 12 + i * 16;
    t.tag.copy(head, o);
    head.writeUInt32BE(t.sum, o + 4);
    head.writeUInt32BE(offset, o + 8);
    head.writeUInt32BE(t.orig, o + 12);
    const pad = Buffer.alloc((4 - (data.length % 4)) % 4);
    parts.push(data, pad);
    offset += data.length + pad.length;
  });
  return Buffer.concat(parts);
}
const woff = fs.readFileSync(require.resolve('@fontsource/montserrat/files/montserrat-latin-700-normal.woff'));
const fontfile = path.join(os.tmpdir(), 'ctsd-montserrat-700.ttf');
fs.writeFileSync(fontfile, woffToSfnt(woff));

const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3E2723"/><stop offset="1" stop-color="#6B4F32"/></linearGradient>
<linearGradient id="grain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#grain)"/>
<rect x="96" y="336" width="96" height="4" fill="#D4AF37"/>
</svg>`);

const mark = await sharp(brand + 'mark-reverse.svg', { density: 300 })
  .resize({ height: 200, fit: 'inside' }).png().toBuffer();

const text = (str, size, rgb, width) => sharp({
  text: { text: `<span foreground="${rgb}">${str}</span>`, font: `Montserrat Bold ${size}`, fontfile, width, rgba: true, wrap: 'word' },
}).png().toBuffer();

const wordmark = await text('CTSD', 64, '#C89B6B', 600);
const tagline = await text('Technology built around your organization.', 60, '#F7EFE4', 1000);

await sharp(bg).composite([
  { input: mark, left: 96, top: 96 },
  { input: wordmark, left: 300, top: 160 },
  { input: tagline, left: 96, top: 372 },
]).jpeg({ quality: 86, mozjpeg: true }).toFile(brand + 'og-default.jpg');
console.log('wrote og-default.jpg');
