// Music archive (/music/) and one page per release (/music/<slug>/).
import { BASE, esc, escAttr, icon } from '../layout.mjs';
import { GROUPS } from '../../../public/assets/preview/kingsley/js/catalogue.js';
import { ARROW, watchUrl, thumbUrl, playButton, watchLink } from '../parts.mjs';

const TYPE = { 'deeper-worship': 'Live worship set', medley: 'Medley', unveiled: 'From THE UNVEILED', single: 'Single' };
const typeLabel = (e) => (TYPE[e.group] ?? 'Release') + (e.live && e.group !== 'deeper-worship' ? ' · Live' : '');

const releaseUrl = (e) => `${BASE}music/${e.slug}/`;
/** open.spotify.com/track/<id> -> open.spotify.com/embed/track/<id> (null if not a Spotify URL). */
export function spotifyEmbed(url) {
  const m = /^https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/.exec(url || '');
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

/** "Deeper Worship 6.0" -> "6.0"; "Deeper Worship Vol 2" -> "2". */
const numeral = (e) => (e.group === 'deeper-worship' ? /(\d+(?:\.\d+)?)\s*$/.exec(e.title)?.[1] : undefined);

function card(e) {
  const n = numeral(e);
  return (
    `<article class="ka-mcard">` +
    `<div class="ka-vcard__frame">` +
    `<img src="${escAttr(thumbUrl(e.youtubeId))}" width="480" height="360" alt="${escAttr(e.title)}" loading="lazy" decoding="async">` +
    (n ? `<span class="ka-mcard__num" aria-hidden="true">${esc(n)}</span>` : '') +
    playButton(e, { cls: 'ka-playbtn' }) +
    `</div>` +
    `<h3 class="ka-vcard__title"><a href="${releaseUrl(e)}">${esc(e.title)}</a></h3>` +
    `<p class="ka-vcard__meta">${esc(e.year)} · ${watchLink(e.youtubeId)}</p>` +
    `</article>`
  );
}

function musicPage(catalogue) {
  const sections = Object.entries(GROUPS)
    .map(([key, label]) => {
      const list = catalogue.filter((e) => e.group === key);
      if (!list.length) return '';
      return (
        `<section class="ka-musicgroup" aria-labelledby="g-${key}">` +
        `<h2 id="g-${key}" class="ka-musicgroup__title">${esc(label)}</h2>` +
        `<div class="ka-mgrid">${list.map(card).join('')}</div></section>`
      );
    })
    .join('');
  return (
    `<section class="ka-section ka-musichead"><div class="ka-wrap">` +
    `<p class="ka-eyebrow">Kingsley Anyenor &amp; The Refined</p>` +
    `<h1 class="ka-split">Music</h1>` +
    `<p class="ka-musichead__lead ka-up">Every song and live session, one tap from play. Pick a release to watch it here, or open its page to stream it.</p>` +
    `</div></section>` +
    `<div class="ka-wrap ka-musicbody">${sections}</div>`
  );
}

function streamButtons(e) {
  const ext = (href, label, ic) =>
    `<a class="ka-btn ka-btn--ghost" href="${escAttr(href)}" target="_blank" rel="noopener">${icon(ic)}${label}<span class="ka-visually-hidden"> (opens in a new tab)</span></a>`;
  return (
    ext(watchUrl(e.youtubeId), 'Watch on YouTube', 'youtube') +
    (e.spotifyUrl ? ext(e.spotifyUrl, 'Listen on Spotify', 'spotify') : '') +
    (e.appleUrl ? ext(e.appleUrl, 'Listen on Apple Music', 'apple') : '')
  );
}

function releasePage(e, catalogue) {
  const featuring = Array.isArray(e.featuring) && e.featuring.length ? e.featuring : null;
  const credits = e.credits ? (Array.isArray(e.credits) ? e.credits : [e.credits]) : null;
  const spEmbed = spotifyEmbed(e.spotifyUrl);
  const more = catalogue.filter((x) => x.group === e.group && x !== e).slice(0, 3);
  return (
    `<section class="ka-section ka-release"><div class="ka-wrap">` +
    `<p class="ka-release__back"><a class="ka-textlink" href="${BASE}music/">All music</a></p>` +
    `<div class="ka-release__grid">` +
    `<div class="ka-release__media">` +
    `<div class="ka-embed ka-wedge"><div class="ka-embed__poster">` +
    `<img src="${escAttr(thumbUrl(e.youtubeId))}" width="480" height="360" alt="" decoding="async">` +
    playButton(e, { cls: 'ka-playbtn ka-playbtn--lg', extra: ' data-expand' }) +
    `</div></div>` +
    `<p class="ka-release__note">Plays in the site player. ${watchLink(e.youtubeId)}</p>` +
    `</div>` +
    `<div class="ka-release__body">` +
    `<p class="ka-eyebrow">${esc(typeLabel(e))} · ${esc(e.year)}</p>` +
    `<h1 class="ka-release__title">${esc(e.title)}</h1>` +
    `<p class="ka-release__by">Kingsley Anyenor &amp; The Refined</p>` +
    (featuring ? `<p class="ka-release__feat"><span>Featuring</span> ${esc(featuring.join(', '))}</p>` : '') +
    (credits ? `<ul class="ka-release__credits">${credits.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : '') +
    `<div class="ka-actions ka-release__links">${streamButtons(e)}</div>` +
    `</div></div>` +
    (spEmbed
      ? `<div class="ka-release__spotify"><h2>Listen on Spotify</h2>` +
        `<div class="ka-spotify__embed" data-embed-box>` +
        `<button type="button" class="ka-btn" data-embed="${escAttr(spEmbed)}" data-embed-title="${escAttr(e.title)} on Spotify">${icon('spotify')}Load Spotify player</button>` +
        `<p class="ka-spotify__note">Loads the player from open.spotify.com</p></div></div>`
      : '') +
    `</div></section>` +
    (more.length
      ? `<section class="ka-section ka-section--raised" aria-labelledby="more-title"><div class="ka-wrap">` +
        `<div class="ka-head"><h2 id="more-title">More ${esc(GROUPS[e.group])}</h2>` +
        `<a class="ka-textlink ka-head__more" href="${BASE}music/">All music${ARROW}</a></div>` +
        `<div class="ka-mgrid">${more.map(card).join('')}</div></div></section>`
      : '')
  );
}

export function render({ catalogue, layout }) {
  const pages = [
    {
      path: 'music',
      html: layout({
        title: 'Music',
        description: 'Songs, live sessions and medleys by Kingsley Anyenor and The Refined.',
        active: 'music',
        body: musicPage(catalogue),
      }),
    },
  ];
  for (const e of catalogue) {
    pages.push({
      path: `music/${e.slug}`,
      html: layout({
        title: e.title,
        description: `${e.title} (${e.year}) by Kingsley Anyenor and The Refined. ${typeLabel(e)}.`,
        active: 'music',
        body: releasePage(e, catalogue),
      }),
    });
  }
  return pages;
}
