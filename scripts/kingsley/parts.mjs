// Markup pieces shared by the Kingsley page modules (home, music, release pages).
import { escAttr } from './layout.mjs';

export const PLAY_ICON =
  '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
export const ARROW =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export const watchUrl = (id) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
export const thumbUrl = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;

/** A [data-play] button for the persistent player. */
export function playButton(e, { cls, extra = '', inner = PLAY_ICON } = {}) {
  return (
    `<button type="button" class="${cls}" data-play="${escAttr(e.youtubeId)}" data-title="${escAttr(e.title)}" ` +
    `data-queue="${escAttr(e.group)}"${extra} aria-label="Play ${escAttr(e.title)}">${inner}</button>`
  );
}

/** The real link that pairs every play button, so the page works with JS off. */
export function watchLink(id, { cls = 'ka-textlink', label = 'Watch on YouTube', attrs = '' } = {}) {
  return `<a class="${cls}" href="${escAttr(watchUrl(id))}" target="_blank" rel="noopener"${attrs}>${label}<span class="ka-visually-hidden"> (opens in a new tab)</span></a>`;
}

