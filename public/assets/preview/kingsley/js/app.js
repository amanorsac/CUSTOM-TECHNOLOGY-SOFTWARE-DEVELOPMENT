// Entry point for every Kingsley Anyenor page.
import { initPlayer, play, pause, expand, syncButtons, preloadApi } from './player.js';
import { initLatest } from './latest.js';
import { initNav } from './nav.js';
import { initTabs } from './tabs.js';
import { initForms } from './forms.js';
import { initMenu } from './menu.js';

initPlayer();
initNav();
initMenu();

// Third-party embeds that load only on a click (Spotify players).
const EMBED_HOSTS = ['https://open.spotify.com/embed/'];

// Box -> its original children (the "Load Spotify player" button and note),
// so the embed can be unloaded again.
const embedded = new Map();

function loadEmbed(btn) {
  const src = btn.dataset.embed || '';
  if (!EMBED_HOSTS.some((h) => src.startsWith(h))) return;
  pause(); // one source at a time
  const box = btn.closest('[data-embed-box]') || btn.parentElement;
  embedded.set(box, [...box.childNodes]);
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = btn.dataset.embedTitle || 'Embedded player';
  frame.loading = 'lazy';
  frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  frame.setAttribute('width', '100%');
  frame.setAttribute('height', '352');
  box.replaceChildren(frame);
  box.classList.add('is-loaded');
  frame.focus(); // the button is gone; keep keyboard focus on the player
}

// One source at a time, both ways: when the persistent player starts playing,
// any loaded Spotify embed is removed and its button comes back.
function unloadEmbeds() {
  for (const [box, children] of embedded) {
    embedded.delete(box);
    if (!box.isConnected) continue;
    const hadFocus = box.contains(document.activeElement);
    box.replaceChildren(...children);
    box.classList.remove('is-loaded');
    if (hadFocus) box.querySelector('button')?.focus();
  }
}
document.addEventListener('ka:playing', unloadEmbeds);

// Fetch the YouTube IFrame API as soon as a visitor points at or tabs to a
// play button, so the first tap can start the video at once (iPhone needs
// playback to begin close to the tap). Nothing loads before that.
function warmUp(e) {
  const t = e.target instanceof Element ? e.target : null;
  if (!t || !t.closest('[data-play]')) return;
  document.removeEventListener('pointerover', warmUp);
  document.removeEventListener('focusin', warmUp);
  document.removeEventListener('touchstart', warmUp);
  preloadApi();
}
document.addEventListener('pointerover', warmUp, { passive: true });
document.addEventListener('focusin', warmUp);
document.addEventListener('touchstart', warmUp, { passive: true });

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
  initTabs(main);
  initForms(main);
  // If motion.js cannot load, drop the inline head flag so nothing stays hidden.
  import('./motion.js')
    .then((m) => m.initMotion(main))
    .catch(() => document.documentElement.classList.remove('ka-motion'));
}

onPage();
document.addEventListener('ka:page', onPage);
