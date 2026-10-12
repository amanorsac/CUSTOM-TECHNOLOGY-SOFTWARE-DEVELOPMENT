// Search engines and link previews often don't run JavaScript: the designs list and each design page must
// carry their real content in the HTML the worker sends. (The page scripts then take over and re-render.)
import { describe, it, expect } from 'vitest';
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

async function html(path) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://ctsd.example${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return { status: res.status, text: await res.text() };
}
const designs = async () => {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request('https://ctsd.example/data/designs.json'), env, ctx);
  await waitOnExecutionContext(ctx);
  return res.json();
};

describe('design pages without JavaScript', () => {
  it('carry the name, tagline, systems, features and integrations', async () => {
    const d = (await designs()).find((x) => x.slug === 'modern-church');
    const { status, text } = await html('/designs/modern-church');
    expect(status).toBe(200);
    expect(text).toMatch(new RegExp(`<h1 id="d-name" data-d="name">${d.name}</h1>`));
    expect(text).toContain(`data-d="tagline">${d.tagline}</p>`);
    const features = text.match(/<ul class="d-features" data-features>([\s\S]*?)<\/ul>/)[1];
    for (const f of d.features) expect(features).toContain(f);
    const ints = text.match(/<ul class="d-chips" data-integrations>([\s\S]*?)<\/ul>/)[1];
    for (const t of d.integrations) expect(ints).toContain(t);
    const systems = text.match(/<ul class="d-systems" data-d="systems"[^>]*>([\s\S]*?)<\/ul>/)[1];
    for (const s of d.systems) expect(systems).toContain(s);
  });
});

describe('the designs list without JavaScript', () => {
  it('links to every design by name', async () => {
    const all = await designs();
    const { status, text } = await html('/designs');
    expect(status).toBe(200);
    const grid = text.match(/<ul[^>]*data-design-grid[^>]*>([\s\S]*?)<\/ul>/)[1];
    for (const d of all) {
      expect(grid).toContain(`href="/designs/${d.slug}"`);
      expect(grid).toContain(d.name.replace(/&/g, '&amp;'));
    }
  });
});
