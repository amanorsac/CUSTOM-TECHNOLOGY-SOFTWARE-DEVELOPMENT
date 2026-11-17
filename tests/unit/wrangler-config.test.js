// The worker must run first for the Kingsley hero videos (byte-range route in
// src/routes/media.js). Cloudflare: a request matching any "!" rule is served
// straight from assets, whatever the positive rules say.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const config = JSON.parse(
  readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, ''),
);
const rules = config.assets.run_worker_first;
// Rules here are plain paths with a trailing * (no other glob syntax).
const glob = (pattern) => ({ test: (path) => (pattern.endsWith('*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern) });
const workerFirst = (path) =>
  rules.filter((r) => !r.startsWith('!')).some((r) => glob(r).test(path)) &&
  !rules.filter((r) => r.startsWith('!')).some((r) => glob(r.slice(1)).test(path));

describe('wrangler run_worker_first', () => {
  it('runs the worker for the hero videos', () => {
    expect(workerFirst('/media/kingsley/hero-1920.mp4')).toBe(true);
    expect(workerFirst('/media/kingsley/hero-960.mp4')).toBe(true);
  });
  it('still serves /assets/* straight from the asset layer', () => {
    expect(workerFirst('/assets/preview/kingsley/css/site.css')).toBe(false);
  });
});
