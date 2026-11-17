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


// ---- Form fields (Book and Contact) --------------------------------------
// Visible label above every control, an error slot wired by aria-describedby,
// controls at least 44px tall (site.css).
const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`))
    .join('');

export function field({ name, label, required = false, type = 'text', control = 'input', options, hint, wide = false, max, ...rest }) {
  const id = `f-${name}`;
  const desc = `${hint ? `${id}-hint ` : ''}${id}-err`;
  const common = { id, name, maxlength: max, required: required || undefined, 'aria-describedby': desc.trim(), ...rest };
  let ctl;
  if (control === 'select') {
    ctl =
      `<select${attrs(common)}>` +
      options.map((o) => `<option value="${o.replace(/"/g, '&quot;')}">${o || 'Choose…'}</option>`).join('') +
      `</select>`;
  } else if (control === 'textarea') {
    ctl = `<textarea${attrs({ ...common, rows: rest.rows || 5 })}></textarea>`;
  } else {
    ctl = `<input${attrs({ ...common, type })}>`;
  }
  return (
    `<div class="ka-field${wide ? ' ka-field--wide' : ''}">` +
    `<label for="${id}">${label}${required ? ' <span class="ka-field__req" aria-hidden="true">*</span>' : ''}</label>` +
    ctl +
    (hint ? `<p class="ka-field__hint" id="${id}-hint">${hint}</p>` : '') +
    `<p class="ka-field__error" id="${id}-err" data-error-for="${name}" hidden></p>` +
    `</div>`
  );
}

export const honeypot =
  `<div class="ka-hp" aria-hidden="true"><label>Leave this empty<input type="text" name="website_hp" tabindex="-1" autocomplete="off"></label></div>`;

export const NOJS =
  `<noscript><p class="ka-form__nojs">This form needs JavaScript. You can email the team instead: ` +
  `<a href="mailto:amanorsac@gmail.com">Email the team</a>.</p></noscript>`;
