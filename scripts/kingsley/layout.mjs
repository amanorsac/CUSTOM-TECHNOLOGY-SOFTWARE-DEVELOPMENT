// Shared page shell and image helper for the Kingsley Anyenor draft.
// Used by scripts/build-kingsley.mjs and the page modules in ./pages/.
import { readFileSync } from 'node:fs';

export const BASE = '/preview/kingsley/';
const ASSETS = '/assets/preview/kingsley';
const CONCEPT = 'Concept for Kingsley Anyenor · prepared by CTSD · not yet published';

export const MENU = [
  { key: 'home', label: 'Home', href: BASE },
  { key: 'music', label: 'Music', href: `${BASE}music/` },
  { key: 'the-refined', label: 'The Refined', href: `${BASE}the-refined/` },
  { key: 'events', label: 'Events', href: `${BASE}events/` },
  { key: 'book', label: 'Book', href: `${BASE}book/` },
  { key: 'contact', label: 'Contact', href: `${BASE}contact/` },
];

// Small inline icons (24x24, currentColor). Drawn simply; no icon font, no CDN.
const ICON = {
  youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3Z"/>',
  spotify: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.2a.75.75 0 1 1-.33-1.46c4.5-1 8.4-.6 11.5 1.4.36.22.47.68.25 1Zm1.2-2.8a.94.94 0 0 1-1.3.3c-3.2-2-8-2.5-11.8-1.4a.94.94 0 0 1-.54-1.8c4.3-1.3 9.6-.7 13.3 1.6.44.27.58.85.31 1.3Zm.1-2.9C14.1 8.4 7.7 8.2 4 9.3a1.12 1.12 0 1 1-.65-2.15c4.2-1.3 11.3-1 15.7 1.6a1.12 1.12 0 1 1-1.15 1.95Z"/>',
  apple: '<path d="M19 3.2v11.6a3.2 3.2 0 1 1-1.8-2.9V7.4l-8 1.7v7.7a3.2 3.2 0 1 1-1.8-2.9V5.6c0-.5.3-.9.8-1l9.8-2.1c.5-.1 1 .3 1 .7Z"/>',
  instagram: '<path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm5-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM16.5 2h-9A5.5 5.5 0 0 0 2 7.5v9A5.5 5.5 0 0 0 7.5 22h9a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 16.5 2Zm3.7 14.5a3.7 3.7 0 0 1-3.7 3.7h-9a3.7 3.7 0 0 1-3.7-3.7v-9a3.7 3.7 0 0 1 3.7-3.7h9a3.7 3.7 0 0 1 3.7 3.7Z"/>',
};

export const SOCIAL = [
  { label: 'YouTube', icon: 'youtube', href: 'https://www.youtube.com/@kingsleyanyenor' },
  { label: 'Spotify', icon: 'spotify', href: 'https://open.spotify.com/artist/1TlaDAmkhwEJv7qz6WfsqE' },
  { label: 'Apple Music', icon: 'apple', href: 'https://music.apple.com/ng/artist/kingsley-anyenor/1561319671' },
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/kingsleyanyenor/' },
];

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** esc() plus single quotes, for attribute values from data. */
export function escAttr(s) {
  return esc(s).replace(/'/g, '&#39;');
}

// Runs before first paint so reveal-hidden content never flashes visible
// first. motion.js removes the class again if it cannot run the reveals.
const MOTION_FLAG =
  "<script>if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('ka-motion')</script>";

export const icon = (name) =>
  `<svg class="ka-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">${ICON[name]}</svg>`;

const socialLinks = (cls) =>
  SOCIAL.map(
    (s) => `<a class="${cls}" href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label} (opens in a new tab)">${icon(s.icon)}</a>`,
  ).join('');

const nav = (active) =>
  MENU.map((m) => `<a href="${m.href}"${m.key === active ? ' aria-current="page"' : ''}>${m.label}</a>`).join('');

let manifestCache;
function manifest() {
  manifestCache ??= JSON.parse(
    readFileSync(new URL('../../public/assets/preview/kingsley/img/manifest.json', import.meta.url), 'utf8'),
  );
  return manifestCache;
}

/**
 * <picture> with WebP and JPEG at 800 and 1600 wide.
 * @param {string} name kebab image name from img/manifest.json, e.g. 'mg-9033'
 * @param {{ alt: string, sizes: string, eager?: boolean, className?: string }} opts
 */
export function img(name, { alt, sizes, eager = false, className } = {}) {
  const size = manifest()[name];
  if (!size) throw new Error(`kingsley img: unknown image "${name}"`);
  const small = Math.min(800, size.w);
  const set = (ext) =>
    `${ASSETS}/img/${name}-800.${ext} ${small}w, ${ASSETS}/img/${name}-1600.${ext} ${size.w}w`;
  const load = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  const cls = className ? ` class="${esc(className)}"` : '';
  return (
    `<picture>` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${esc(sizes)}">` +
    `<img${cls} src="${ASSETS}/img/${name}-1600.jpg" srcset="${set('jpg')}" sizes="${esc(sizes)}" ` +
    `width="${size.w}" height="${size.h}" alt="${esc(alt)}"${load} decoding="async">` +
    `</picture>`
  );
}

/**
 * Full HTML document for one page.
 * @param {{ title: string, description: string, active: string, body: string, preload?: string }} p
 *   preload: extra <head> markup (e.g. <link rel="preload" ...>) for this page.
 */
export function layout({ title, description, active, body, preload = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${MOTION_FLAG}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Kingsley Anyenor</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0E0F14">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230E0F14'/%3E%3Ctext x='16' y='22' font-family='Georgia' font-size='14' text-anchor='middle' fill='%23EC8746'%3EKA%3C/text%3E%3C/svg%3E">
<link rel="preload" href="${ASSETS}/fonts/fraunces-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${ASSETS}/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ASSETS}/css/site.css">
${preload}
</head>
<body>
<a class="ka-skip" href="#main">Skip to content</a>
<p class="ka-concept" role="note">${CONCEPT}</p>
<header class="ka-header">
  <a class="ka-wordmark" href="${BASE}" aria-label="Kingsley Anyenor, The Refined: home"><span>KA</span><span class="ka-wordmark__bar" aria-hidden="true">|</span><span>The Refined</span></a>
  <nav aria-label="Main" class="ka-nav">${nav(active)}</nav>
  <div class="ka-social">${socialLinks('ka-social__link')}</div>
</header>
<main id="main">${body}</main>
<footer class="ka-footer">
  <div class="ka-footer__inner">
    <p class="ka-wordmark ka-wordmark--footer"><span>KA</span><span class="ka-wordmark__bar" aria-hidden="true">|</span><span>The Refined</span></p>
    <p class="ka-footer__motto">Revived to revive.</p>
    <nav aria-label="Footer" class="ka-footer__nav">${MENU.map((m) => `<a href="${m.href}">${m.label}</a>`).join('')}</nav>
    <div class="ka-social">${socialLinks('ka-social__link')}</div>
    <p class="ka-footer__note">${CONCEPT}</p>
  </div>
</footer>
<div id="ka-player" hidden></div>
<script type="module" src="${ASSETS}/js/app.js"></script>
</body>
</html>
`;
}
