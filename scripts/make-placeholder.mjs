// Generates public/images/designs/_placeholder.webp (1200x800 brown gradient + CTSD mark).
import sharp from 'sharp';
import fs from 'node:fs';

const brand = 'public/assets/brand/';
const markFile = fs.existsSync(brand + 'mark-reverse.svg') ? 'mark-reverse.svg' : 'mark.svg';
const mark = await sharp(brand + markFile, { density: 300 })
  .resize({ width: 360, height: 360, fit: 'inside' })
  .ensureAlpha()
  .composite([{ input: Buffer.from([0, 0, 0, Math.round(255 * 0.18)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'dest-in' }])
  .png()
  .toBuffer();

const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#3E2723"/><stop offset="1" stop-color="#6B4F32"/></linearGradient></defs>
<rect width="1200" height="800" fill="url(#g)"/></svg>`);

fs.mkdirSync('public/images/designs', { recursive: true });
await sharp(bg).composite([{ input: mark, gravity: 'center' }])
  .webp({ quality: 82 }).toFile('public/images/designs/_placeholder.webp');
console.log('wrote _placeholder.webp from', markFile);
