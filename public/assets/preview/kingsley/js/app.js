// Entry point for every Kingsley Anyenor page.
import { initPlayer, play, expand, syncButtons } from './player.js';
import { initLatest } from './latest.js';
import { initNav } from './nav.js';

initPlayer();
initNav();

// Third-party embeds that load only on a click (Spotify players, the release-page YouTube embed).
const EMBED_HOSTS = ['https://open.spotify.com/embed/', 'https://www.youtube-nocookie.com/embed/'];

function loadEmbed(btn) {
  const src = btn.dataset.embed || '';
  if (!EMBED_HOSTS.some((h) => src.startsWith(h))) return;
  const box = btn.closest('[data-embed-box]') || btn.parentElement;
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = btn.dataset.embedTitle || 'Embedded player';
  if (src.startsWith('https://open.spotify.com/')) frame.loading = 'lazy';
  frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  frame.setAttribute('width', '100%');
  if (src.startsWith('https://open.spotify.com/')) frame.setAttribute('height', '352');
  else frame.setAttribute('allowfullscreen', '');
  box.replaceChildren(frame);
  box.classList.add('is-loaded');
  frame.focus(); // the button is gone; keep keyboard focus on the player
}

// One document-level listener covers play buttons on every swapped-in page.
document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  const embed = target && target.closest('button[data-embed]');
  if (embed) {
    e.preventDefault();
    loadEmbed(embed);
    return;
  }
  const btn = target && target.closest('button[data-play]');
  if (!btn) return;
  e.preventDefault();
  play(btn.dataset.play, { title: btn.dataset.title || '', queue: btn.dataset.queue || undefined });
  if (btn.hasAttribute('data-expand')) expand(true);
});

function onPage() {
  syncButtons();
  const main = document.getElementById('main');
  initLatest(main);
  // If motion.js cannot load, drop the inline head flag so nothing stays hidden.
  import('./motion.js')
    .then((m) => m.initMotion(main))
    .catch(() => document.documentElement.classList.remove('ka-motion'));
}

onPage();
document.addEventListener('ka:page', onPage);
