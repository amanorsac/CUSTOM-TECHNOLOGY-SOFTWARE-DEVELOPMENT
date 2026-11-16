import { describe, it, expect } from 'vitest';
import { layout, img } from '../../scripts/kingsley/layout.mjs';

const MENU = [
  ['Home', '/preview/kingsley/'],
  ['Music', '/preview/kingsley/music/'],
  ['The Refined', '/preview/kingsley/the-refined/'],
  ['Events', '/preview/kingsley/events/'],
  ['Book', '/preview/kingsley/book/'],
  ['Contact', '/preview/kingsley/contact/'],
];

const page = (active = 'music') =>
  layout({ title: 'Music', description: 'Songs', active, body: '<h1>Music</h1>' });

const navHtml = (html) => html.match(/<nav aria-label="Main"[^>]*>([\s\S]*?)<\/nav>/)[1];

describe('kingsley layout', () => {
  it('is an English document with the robots meta and stylesheet', () => {
    const html = page();
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).toContain('<link rel="stylesheet" href="/assets/preview/kingsley/css/site.css">');
  });

  it('shows the exact concept bar text', () => {
    expect(page()).toContain('Concept for Kingsley Anyenor · prepared by CTSD · not yet published');
  });

  it('lists the six menu links in order', () => {
    const links = [...navHtml(page()).matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => [m[2], m[1]]);
    expect(links).toEqual(MENU);
  });

  it('marks only the active item with aria-current', () => {
    const html = page('music');
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(navHtml(html)).toMatch(/<a href="\/preview\/kingsley\/music\/" aria-current="page">Music<\/a>/);
    expect(page('home').match(/aria-current="page"/g)).toHaveLength(1);
    expect(navHtml(page('home'))).toMatch(/href="\/preview\/kingsley\/" aria-current="page"/);
  });

  it('has exactly one <main>, with the player root after it', () => {
    const html = page();
    expect(html.match(/<main/g)).toHaveLength(1);
    expect(html).toContain('<main id="main">');
    const mainEnd = html.indexOf('</main>');
    expect(html.indexOf('<div id="ka-player" hidden>')).toBeGreaterThan(mainEnd);
  });

  it('links the skip link, social icons and app script', () => {
    const html = page();
    expect(html).toMatch(/<a class="ka-skip" href="#main">/);
    for (const label of ['YouTube', 'Spotify', 'Apple Music', 'Instagram']) {
      expect(html).toContain(`aria-label="${label}`);
    }
    expect(html).toContain('<script type="module" src="/assets/preview/kingsley/js/app.js"></script>');
  });

  it('escapes the title and description', () => {
    const html = layout({ title: 'A & B', description: '"x"', active: 'home', body: '' });
    expect(html).toContain('<title>A &amp; B | Kingsley Anyenor</title>');
    expect(html).toContain('content="&quot;x&quot;"');
  });
});

describe('kingsley img()', () => {
  it('emits a picture with webp and jpeg sources, size attributes and lazy loading', () => {
    const html = img('mg-9033', { alt: 'Choir on stage', sizes: '100vw' });
    expect(html).toMatch(/^<picture>/);
    expect(html).toContain('type="image/webp"');
    expect(html).toContain('/assets/preview/kingsley/img/mg-9033-800.webp 800w');
    expect(html).toContain('/assets/preview/kingsley/img/mg-9033-1600.jpg 1600w');
    expect(html).toMatch(/width="\d+" height="\d+"/);
    expect(html).toContain('alt="Choir on stage"');
    expect(html).toContain('loading="lazy"');
  });

  it('drops lazy loading when eager', () => {
    const html = img('mg-9033', { alt: '', sizes: '100vw', eager: true });
    expect(html).not.toContain('loading="lazy"');
    expect(html).toContain('fetchpriority="high"');
  });

  it('throws on an unknown image name', () => {
    expect(() => img('nope', { alt: 'x', sizes: '1px' })).toThrow(/nope/);
  });
});

describe('kingsley image names', async () => {
  const { kebabName } = await import('../../scripts/kingsley-images.mjs');
  it('turns Drive file names into lowercase kebab', () => {
    expect(kebabName('_MG_9033.JPG')).toBe('mg-9033');
    expect(kebabName('AMH_5849.JPG')).toBe('amh-5849');
    expect(kebabName('GREY78221.png')).toBe('grey78221');
    expect(kebabName('GREY7822-Recovered.png2.png')).toBe('grey7822-recovered-png2');
  });
});
