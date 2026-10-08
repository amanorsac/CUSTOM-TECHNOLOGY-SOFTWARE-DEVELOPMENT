// Makes a depth map for a showpiece photo with Depth Anything (runs locally via transformers.js):
//   node scripts/depth-map.mjs public/assets/showcase/osteria-lume/img/hero.webp
// Writes <name>-depth.webp next to it: white = near, black = far, same size as the photo.
import { pipeline, RawImage } from '@huggingface/transformers';
import sharp from 'sharp';

const src = process.argv[2];
const meta = await sharp(src).metadata();
const png = await sharp(src).png().toBuffer();
const depth = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small');
const { depth: map } = await depth(await RawImage.fromBlob(new Blob([png])));
const out = src.replace(/\.webp$/, '-depth.webp');
await sharp(Buffer.from(map.data), { raw: { width: map.width, height: map.height, channels: 1 } })
  .resize(meta.width, meta.height).blur(1.2).webp({ quality: 85 }).toFile(out);
console.log('wrote', out, map.width, map.height);
