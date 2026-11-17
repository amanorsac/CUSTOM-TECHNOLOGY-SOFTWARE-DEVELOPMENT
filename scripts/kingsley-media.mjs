// Puts the Kingsley hero videos into the R2 bucket the worker serves them from
// (binding MEDIA in wrangler.jsonc, key kingsley/<file>; src/routes/media.js).
// The videos are not in git: they come from assets-src/kingsley/video/
// (gitignored), encoded as described in scripts/kingsley-images.mjs.
//
//   node scripts/kingsley-media.mjs --remote   upload to Cloudflare (needs `wrangler login`)
//   node scripts/kingsley-media.mjs --local    seed wrangler dev's local R2 (Playwright does this)
//
// Re-encoding? Give the file a new name too: the route caches videos for 30 days.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { HERO_VIDEOS, VIDEO_SRC_DIR } from './kingsley-images.mjs';

export const BUCKET = 'ctsd-media';
export const PREFIX = 'kingsley/';

const mode = process.argv.includes('--remote') ? '--remote' : process.argv.includes('--local') ? '--local' : null;
if (!mode) {
  console.error('usage: node scripts/kingsley-media.mjs --remote | --local');
  process.exit(1);
}
const missing = HERO_VIDEOS.filter((f) => !fs.existsSync(path.join(VIDEO_SRC_DIR, f)));
if (missing.length) {
  const msg = `kingsley-media: no ${missing.join(', ')} in ${VIDEO_SRC_DIR}`;
  if (mode === '--local') {
    console.warn(`${msg}; local R2 not seeded, the hero video will 404 in wrangler dev`);
    process.exit(0);
  }
  console.error(msg);
  process.exit(1);
}
const wrangler = path.resolve('node_modules/wrangler/bin/wrangler.js');
for (const file of HERO_VIDEOS) {
  execFileSync(process.execPath, [
    wrangler, 'r2', 'object', 'put', `${BUCKET}/${PREFIX}${file}`,
    '--file', path.join(VIDEO_SRC_DIR, file), '--content-type', 'video/mp4', mode,
  ], { stdio: mode === '--remote' ? 'inherit' : 'ignore' });
  console.log(`${file} -> r2://${BUCKET}/${PREFIX}${file} (${mode.slice(2)})`);
}
