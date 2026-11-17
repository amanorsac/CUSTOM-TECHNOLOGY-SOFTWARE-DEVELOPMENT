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
    expect(html).toContain('<script type="module" src="/assets/preview/kingsley/js/app.js" onerror=');
  });

  it('sets html.ka-motion before first paint unless reduced motion is asked for', () => {
    const html = page();
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
    const script = head.match(/<script>([\s\S]*?)<\/script>/);
    expect(script).not.toBeNull();
    // First thing after the charset meta, before the stylesheet.
    expect(head.indexOf('<script>')).toBeLessThan(head.indexOf('<link rel="stylesheet"'));
    expect(script[1]).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(script[1]).toContain("classList.add('ka-motion')");
  });

  it('never leaves the motion flag stuck: failsafe timer, app.js onerror and nomodule all remove it', () => {
    const html = page();
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
    const flag = head.match(/<script>([\s\S]*?)<\/script>/)[1];
    expect(flag).toContain('setTimeout');
    expect(flag).toContain('__kaMotion');
    expect(flag).toContain("classList.remove('ka-motion')");
    expect(html).toMatch(/<script type="module" src="\/assets\/preview\/kingsley\/js\/app\.js" onerror="[^"]*classList\.remove\('ka-motion'\)[^"]*"><\/script>/);
    expect(html).toMatch(/<script nomodule>[^<]*classList\.remove\('ka-motion'\)[^<]*<\/script>/);
  });

  it('uses the official logo lockup in the header and footer, with one accessible name', () => {
    const html = page();
    const header = html.match(/<header[\s\S]*?<\/header>/)[0];
    expect(header).toContain('aria-label="Kingsley Anyenor — The Refined, home"');
    expect(header).toMatch(/<span class="ka-logo__mono" aria-hidden="true"><\/span>/);
    expect(header).toMatch(/<span class="ka-logo__name" aria-hidden="true"><\/span>/);
    expect(header).toMatch(/<span class="ka-logo__refined" aria-hidden="true">The Refined<\/span>/);
    expect(header).not.toContain('<span>KA</span>');
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
    expect(footer).toContain('ka-logo__mono');
  });

  it('uses the monogram as the favicon', () => {
    const html = page();
    expect(html).toContain('<link rel="icon" type="image/png" href="/assets/preview/kingsley/img/brand/favicon-64.png">');
    expect(html).not.toContain('data:image/svg+xml');
  });

  it('escAttr escapes quotes, angle brackets and ampersands', async () => {
    const { escAttr } = await import('../../scripts/kingsley/layout.mjs');
    expect(escAttr(`a"b'<c>&`)).toBe('a&quot;b&#39;&lt;c&gt;&amp;');
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
    expect(html).toContain('/assets/preview/kingsley/img/mg-9033-2400.jpg 2400w');
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
