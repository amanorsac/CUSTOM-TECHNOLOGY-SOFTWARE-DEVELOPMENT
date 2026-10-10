// Prepares a showpiece's assets: node scripts/showcase-assets.mjs osteria-lume
// - copies its self-hosted fonts and the shared GSAP builds
// - writes every image as WebP (+ a -sm copy). A photo the owner generated (from
//   docs/showcase/<slug>-prompts.md) wins: drop it in assets-src/<slug>/<name>.(png|jpg|webp).
//   Until then a placeholder is cropped from the CTSD concept images.
import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const slug = process.argv[2] || 'osteria-lume';
const SHOWPIECES = {
  'osteria-lume': {
    fonts: [
      ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2', 'cormorant-500-italic.woff2'],
      ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2', 'cormorant-600-italic.woff2'],
      ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2', 'cormorant-500.woff2'],
      ['@fontsource/jost/files/jost-latin-300-normal.woff2', 'jost-300.woff2'],
      ['@fontsource/jost/files/jost-latin-400-normal.woff2', 'jost-400.woff2'],
      ['@fontsource/jost/files/jost-latin-500-normal.woff2', 'jost-500.woff2'],
    ],
    // name: [width of the full-size WebP, placeholder source, crop [left, top, width, height] in that source]
    images: {
      hero: [2400, 'restaurant/web-1', [0, 105, 1224, 585]],
      kitchen: [2000, 'restaurant/web-2', [900, 598, 600, 287]],
      oven: [1400, 'restaurant/web-1', [1339, 137, 490, 333]],
      room: [2000, 'restaurant/web-1', [1339, 780, 489, 343]],
      'dish-burrata': [900, 'restaurant/web-2', [1633, 886, 591, 246]],
      'dish-cacio': [900, 'restaurant/web-1', [260, 300, 760, 390]],
      'dish-pappardelle': [900, 'restaurant/web-2', [900, 598, 600, 287]],
      'dish-margherita': [900, 'restaurant/web-2', [1633, 598, 591, 247]],
      'dish-tiramisu': [900, 'restaurant/web-1', [1846, 780, 488, 343]],
      'dish-branzino': [900, 'restaurant/web-2', [1633, 1173, 591, 246]],
    },
  },
  'juniper-vale': {
    fonts: [
      ['@fontsource/bodoni-moda/files/bodoni-moda-latin-400-normal.woff2', 'bodoni-400.woff2'],
      ['@fontsource/bodoni-moda/files/bodoni-moda-latin-500-normal.woff2', 'bodoni-500.woff2'],
      ['@fontsource/bodoni-moda/files/bodoni-moda-latin-400-italic.woff2', 'bodoni-400-italic.woff2'],
      ['@fontsource/manrope/files/manrope-latin-400-normal.woff2', 'manrope-400.woff2'],
      ['@fontsource/manrope/files/manrope-latin-500-normal.woff2', 'manrope-500.woff2'],
      ['@fontsource/manrope/files/manrope-latin-600-normal.woff2', 'manrope-600.woff2'],
    ],
    images: {
      hero: [2400, 'real-estate/web-1', [0, 90, 740, 474]],
      'home-linden': [1600, 'real-estate/web-2', [80, 233, 436, 388]],
      'home-harbor': [1600, 'real-estate/web-2', [80, 670, 436, 388]],
      'home-ridge': [1600, 'real-estate/web-2', [80, 1106, 436, 388]],
      'home-maple': [1600, 'real-estate/web-1', [244, 740, 458, 209]],
      'home-oak': [1600, 'real-estate/web-1', [730, 740, 458, 209]],
      'home-cedar': [1600, 'real-estate/web-1', [1700, 740, 458, 209]],
      'room-living': [2000, 'real-estate/web-3', [132, 446, 1510, 574]],
      'room-kitchen': [1600, 'real-estate/web-3', [132, 1054, 740, 420]],
      street: [1600, 'real-estate/web-3', [904, 1054, 740, 420]],
    },
  },
  basecamp: {
    fonts: [
      ['@fontsource/anton/files/anton-latin-400-normal.woff2', 'anton-400.woff2'],
      ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-400.woff2'],
      ['@fontsource/inter/files/inter-latin-500-normal.woff2', 'inter-500.woff2'],
      ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-600.woff2'],
    ],
    images: {
      fire: [1600, 'youth-ministry/web-1', [104, 500, 1069, 960]],
      retreat: [2000, 'youth-ministry/web-2', [480, 415, 1440, 368]],
      people: [1400, 'youth-ministry/hero', [1032, 690, 734, 215]],
      forest: [1400, 'youth-ministry/web-3', [816, 271, 708, 581]],
      gym: [1000, 'youth-ministry/web-2', [1462, 832, 460, 306]],
      lounge: [1000, 'youth-ministry/web-2', [1224, 1186, 340, 290]],
      shoes: [1000, 'youth-ministry/web-2', [1612, 1186, 308, 290]],
      lights: [1000, 'youth-ministry/web-3', [883, 1205, 634, 180]],
      court: [1000, 'youth-ministry/web-3', [1567, 1205, 634, 180]],
    },
  },
  lanternway: {
    fonts: [
      ['@fontsource/fraunces/files/fraunces-latin-400-normal.woff2', 'fraunces-400.woff2'],
      ['@fontsource/fraunces/files/fraunces-latin-400-italic.woff2', 'fraunces-400-italic.woff2'],
      ['@fontsource/fraunces/files/fraunces-latin-500-normal.woff2', 'fraunces-500.woff2'],
      ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-400.woff2'],
      ['@fontsource/inter/files/inter-latin-500-normal.woff2', 'inter-500.woff2'],
      ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-600.woff2'],
    ],
    images: {
      hero: [2400, 'modern-church/web-1', [672, 210, 1728, 750]],
      candles: [1400, 'modern-church/web-2', [130, 452, 940, 523]],
      pews: [1000, 'modern-church/web-2', [130, 1014, 690, 370]],
      bible: [1000, 'modern-church/web-2', [856, 1014, 690, 370]],
      exterior: [1000, 'modern-church/web-2', [1582, 1014, 690, 370]],
      sanctuary: [900, 'modern-church/web-3', [173, 460, 539, 706]],
      ledge: [800, 'modern-church/web-3', [746, 460, 396, 430]],
      chapel: [800, 'modern-church/web-3', [746, 925, 396, 522]],
      linen: [900, 'modern-church/web-3', [173, 1200, 539, 247]],
    },
  },
};

const cfg = SHOWPIECES[slug];
if (!cfg) throw new Error(`unknown showpiece ${slug}`);
const out = `public/assets/showcase/${slug}`;
for (const d of ['fonts', 'img']) mkdirSync(`${out}/${d}`, { recursive: true });

for (const [src, name] of cfg.fonts) copyFileSync(`node_modules/${src}`, `${out}/fonts/${name}`);
for (const f of ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js', 'Flip.min.js']) copyFileSync(`node_modules/gsap/dist/${f}`, `public/assets/vendor/${f}`);

for (const [name, [width, phSrc, crop]] of Object.entries(cfg.images)) {
  const own = ['png', 'jpg', 'jpeg', 'webp'].map((e) => `assets-src/${slug}/${name}.${e}`).find(existsSync);
  const base = own
    ? sharp(own)
    : sharp(`public/images/designs/${phSrc}.webp`).extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] });
  const buf = await base.toBuffer();
  await sharp(buf).resize({ width, withoutEnlargement: !!own }).webp({ quality: own ? 82 : 86 }).toFile(`${out}/img/${name}.webp`);
  await sharp(buf).resize({ width: Math.round(width / 2.5) }).webp({ quality: 78 }).toFile(`${out}/img/${name}-sm.webp`);
  console.log(`${name}: ${own ? 'owner photo' : 'placeholder'}`);
}

// Juniper & Vale's before/after: an owner "before" photo if there is one, otherwise the staged room
// aged, darkened and desaturated (the page labels it as a simulation).
if (slug === 'juniper-vale') {
  const own = ['png', 'jpg', 'jpeg', 'webp'].map((e) => `assets-src/${slug}/room-living-before.${e}`).find(existsSync);
  const before = own
    ? sharp(own).resize({ width: 2000, withoutEnlargement: true })
    : sharp(`${out}/img/room-living.webp`).modulate({ saturation: 0.35, brightness: 0.78 }).tint({ r: 150, g: 128, b: 96 }).linear(0.82, 8).blur(0.6);
  await before.webp({ quality: 80 }).toFile(`${out}/img/room-living-before.webp`);
  console.log(`room-living-before: ${own ? 'owner photo' : 'simulated'}`);
}
