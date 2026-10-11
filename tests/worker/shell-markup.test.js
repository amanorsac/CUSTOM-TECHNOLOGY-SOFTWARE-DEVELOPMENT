// The site header and footer arrive in the HTML itself, so every page has navigation even before (or
// without) JavaScript; shell.js then only wires up the behaviour.
import { describe, it, expect } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

async function html(path) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsd.example${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return res.text();
}

describe('server-rendered site header and footer', () => {
  for (const path of ['/', '/start', '/lab/', '/about', '/designs', '/designs/modern-church', '/industries/church']) {
    it(`${path} has the header nav and the footer in its HTML`, async () => {
      const t = await html(path);
      const header = t.match(/<div id="site-header">([\s\S]*?)<\/header>/);
      expect(header, 'header').not.toBeNull();
      for (const label of ['Solutions', 'Explore Designs', 'Lab', 'About', 'Start a Project']) expect(header[1]).toContain(`>${label}<`);
      expect(t).toMatch(/<div id="site-footer"><footer class="site-footer/);
    });
  }

  it('marks the current page in the nav', async () => {
    const t = await html('/about');
    expect(t).toMatch(/<a class="nav-link" href="\/about" aria-current="page">About<\/a>/);
  });
});
