// Entry point for every Kingsley Anyenor page.
import { initPlayer, play, syncButtons } from './player.js';
import { initNav } from './nav.js';

initPlayer();
initNav();

// One document-level listener covers play buttons on every swapped-in page.
document.addEventListener('click', (e) => {
  const btn = e.target instanceof Element ? e.target.closest('button[data-play]') : null;
  if (!btn) return;
  e.preventDefault();
  play(btn.dataset.play, { title: btn.dataset.title || '', queue: btn.dataset.queue || undefined });
});

function onPage() {
  syncButtons();
  const main = document.getElementById('main');
  // motion.js arrives in a later task; tolerate its absence.
  import('./motion.js').then((m) => m.initMotion(main)).catch(() => {});
}

onPage();
document.addEventListener('ka:page', onPage);
