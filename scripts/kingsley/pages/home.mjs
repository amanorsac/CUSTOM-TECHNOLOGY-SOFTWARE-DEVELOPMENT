// Home page (spec "Pages > 1. Home"), in spec order:
// hero carousel, latest release, live video row, quote panel, live band,
// pillars, Spotify artist player, events strip.
import { BASE, esc, escAttr, icon } from '../layout.mjs';
import { PLAY_ICON, ARROW, watchUrl, thumbUrl, playButton, watchLink } from '../parts.mjs';

const V = '/media/kingsley';
const SPOTIFY_EMBED = 'https://open.spotify.com/embed/artist/1TlaDAmkhwEJv7qz6WfsqE';
const SPOTIFY_ARTIST = 'https://open.spotify.com/artist/1TlaDAmkhwEJv7qz6WfsqE';

const QUOTE = 'A new generation arose who knew not Jesus but they met me! I reveal the Glorified Jesus in my generation!';
const PILLARS = [
  ['Revival', "Igniting a fresh hunger for God's presence in churches, campuses, and communities."],
  ['Consecration', 'Calling believers back to a life of holiness, intimacy, and wholehearted surrender to Christ.'],
  ['Restoration', 'Ministering healing, hope, and spiritual renewal through the prophetic power of worship and the Word.'],
];
// Popular picks lead the row until he chooses his own (spec, Home 3).
const ROW_LEAD = ['deeper-worship-3-0', 'ghana-worship-medley', 'ghana-praise-medley'];
const ROW_SIZE = 6;

/** Ordered row entries: the three popular picks, then the newest live videos not already shown. */
export function rowEntries(catalogue) {
  const bySlug = new Map(catalogue.map((e) => [e.slug, e]));
  const out = ROW_LEAD.map((s) => bySlug.get(s)).filter(Boolean);
  for (const e of catalogue) {
    if (out.length >= ROW_SIZE) break;
    if (!e.live || e === catalogue[0] || out.includes(e)) continue;
    out.push(e);
  }
  return out;
}

function hero(img) {
  const photo = (name, n, alt) =>
    `<div class="ka-slide" role="group" aria-roledescription="slide" aria-label="${n} of 6">` +
    img(name, { alt, sizes: '100vw' }) +
    `</div>`;
  return (
    `<section class="ka-carousel ka-hero" aria-roledescription="carousel" aria-label="Kingsley Anyenor and The Refined, live">` +
    `<div class="ka-hero__caption">` +
    `<p class="ka-hero__line">Kingsley Anyenor · The Refined · Accra</p>` +
    `<h1 class="ka-hero__title ka-split">Revived to revive.</h1>` +
    `<div class="ka-actions ka-hero__actions">` +
    `<a class="ka-btn" href="#latest">${PLAY_ICON.replace('width="28" height="28"', 'width="18" height="18"')}Listen now</a>` +
    `<a class="ka-btn ka-btn--ghost" href="${BASE}book/">Book Kingsley</a>` +
    `</div></div>` +
    `<div class="ka-carousel__slides">` +
    `<div class="ka-slide is-active" role="group" aria-roledescription="slide" aria-label="1 of 6">` +
    `<video class="ka-slide-video" muted loop playsinline preload="none" poster="${V}/hero-poster.webp" ` +
    `data-src="${V}/hero-1920.mp4" data-src-small="${V}/hero-1280.mp4" aria-hidden="true"></video>` +
    `</div>` +
    // Alt text says only what the photo shows (no event names, places or dates).
    photo('mg-9033', 2, 'Kingsley Anyenor singing centre stage under red light, singers and band behind him and the audience in silhouette in front') +
    photo('mg-9032', 3, 'A wide view of the stage: Kingsley Anyenor at the microphone, singers in patterned shirts with hands raised behind him') +
    photo('mg-9034', 4, 'Kingsley Anyenor singing at the top of the stage steps in a red haze, singers behind him and a raised hand in the crowd') +
    photo('amh-5849', 5, 'Kingsley Anyenor holding a white handkerchief to his face on stage, singers in patterned shirts beside him') +
    photo('amh-5851', 6, 'Kingsley Anyenor leaning forward as he sings into a microphone, singers on the steps behind him') +
    `</div></section>`
  );
}

function latest(e) {
  const link = (key, href, label, ic) =>
    href
      ? `<a class="ka-btn ka-btn--ghost" data-latest-${key} href="${escAttr(href)}" target="_blank" rel="noopener">${icon(ic)}${label}<span class="ka-visually-hidden"> (opens in a new tab)</span></a>`
      : `<a class="ka-btn ka-btn--ghost" data-latest-${key} hidden>${icon(ic)}${label}<span class="ka-visually-hidden"> (opens in a new tab)</span></a>`;
  return (
    `<section class="ka-section ka-latest" id="latest" aria-labelledby="latest-title" data-latest="${escAttr(e.youtubeId)}">` +
    `<div class="ka-wrap ka-latest__grid">` +
    `<div class="ka-latest__media ka-wedge"><div class="ka-latest__frame">` +
    `<img data-latest-thumb src="${escAttr(thumbUrl(e.youtubeId))}" width="480" height="360" alt="" loading="lazy" decoding="async">` +
    playButton(e, { cls: 'ka-playbtn ka-playbtn--lg', extra: ' data-latest-play' }) +
    `</div></div>` +
    `<div class="ka-latest__body">` +
    `<p class="ka-eyebrow">Latest release</p>` +
    `<h2 class="ka-latest__title" id="latest-title" data-latest-title>${esc(e.title)}</h2>` +
    `<p class="ka-latest__meta"><span data-latest-date>${esc(e.year)}</span><span aria-hidden="true"> · </span><span>Kingsley Anyenor &amp; The Refined</span></p>` +
    `<div class="ka-actions ka-latest__links ka-up">` +
    link('youtube', watchUrl(e.youtubeId), 'Watch on YouTube', 'youtube') +
    link('spotify', e.spotifyUrl, 'Listen on Spotify', 'spotify') +
    link('apple', e.appleUrl, 'Listen on Apple Music', 'apple') +
    `</div></div></div></section>`
  );
}

function videoRow(entries) {
  const card = (e) =>
    `<article class="ka-vcard">` +
    `<div class="ka-vcard__frame">` +
    `<img src="${escAttr(thumbUrl(e.youtubeId))}" width="480" height="360" alt="" loading="lazy" decoding="async">` +
    playButton(e, { cls: 'ka-playbtn' }) +
    `</div>` +
    `<h3 class="ka-vcard__title">${esc(e.title)}</h3>` +
    `<p class="ka-vcard__meta">${esc(e.year)} · ${watchLink(e.youtubeId, { label: 'Watch on YouTube' })}</p>` +
    `</article>`;
  return (
    `<section class="ka-section ka-section--raised ka-videos" aria-labelledby="videos-title">` +
    `<div class="ka-wrap">` +
    `<div class="ka-head"><div><p class="ka-eyebrow">On stage</p><h2 id="videos-title" class="ka-split">Live worship</h2></div>` +
    `<a class="ka-textlink ka-head__more" href="${BASE}music/">More videos${ARROW}</a></div>` +
    `<div class="ka-row ka-vrow" role="region" aria-label="Live worship videos"><div class="ka-row__track">${entries.map(card).join('')}</div></div>` +
    `</div></section>`
  );
}

function quotePanel() {
  return (
    `<section class="ka-quote" aria-label="Revived to revive">` +
    `<figure class="ka-quote__wood">` +
    `<blockquote class="ka-quote__text ka-up"><p>${esc(QUOTE)}</p></blockquote>` +
    `<figcaption class="ka-quote__cite">Kingsley Anyenor</figcaption>` +
    `</figure>` +
    `<div class="ka-quote__cream">` +
    `<p class="ka-eyebrow">The Refined</p>` +
    `<h2 class="ka-split">Revived to revive</h2>` +
    `<p class="ka-up">The Refined is Kingsley Anyenor's ministry, band and choir: a non-denominational music and outreach group in Accra, carrying revival, consecration and restoration through worship and the Word.</p>` +
    `<p class="ka-quote__scripture ka-up">Malachi 3:1–3</p>` +
    `<a class="ka-btn ka-btn--dark ka-up" href="${BASE}the-refined/">About The Refined${ARROW}</a>` +
    `</div></section>`
  );
}

function liveBand(e, img) {
  return (
    `<section class="ka-parallax ka-band" aria-labelledby="band-title">` +
    `<div class="ka-parallax__bg">${img('amh-5845', { alt: '', sizes: '100vw' })}</div>` +
    `<div class="ka-wrap ka-band__inner">` +
    playButton(e, { cls: 'ka-playbtn ka-playbtn--xl', extra: ' data-expand' }) +
    `<p class="ka-eyebrow ka-band__eyebrow">Live with The Refined</p>` +
    `<h2 class="ka-band__title" id="band-title">${esc(e.title)}</h2>` +
    `<p class="ka-band__link">${watchLink(e.youtubeId)}</p>` +
    `</div></section>`
  );
}

function pillars() {
  const item = ([name, line], i) =>
    `<li class="ka-pillar ka-up"><span class="ka-pillar__num" aria-hidden="true">0${i + 1}</span>` +
    `<h3>${esc(name)}</h3><p>${esc(line)}</p></li>`;
  return (
    `<section class="ka-section ka-pillars" aria-labelledby="pillars-title">` +
    `<div class="ka-wrap">` +
    `<div class="ka-head"><div><p class="ka-eyebrow">The ministry</p><h2 id="pillars-title" class="ka-split">Three pillars</h2></div>` +
    `<a class="ka-textlink ka-head__more" href="${BASE}the-refined/">Explore the ministry${ARROW}</a></div>` +
    `<ol class="ka-pillars__list">${PILLARS.map(item).join('')}</ol>` +
    `</div></section>`
  );
}

function spotify() {
  return (
    `<section class="ka-section ka-section--raised ka-spotify" aria-labelledby="spotify-title">` +
    `<div class="ka-wrap ka-spotify__grid">` +
    `<div class="ka-spotify__body">` +
    `<p class="ka-eyebrow">Stream</p>` +
    `<h2 id="spotify-title" class="ka-split">Kingsley Anyenor on Spotify</h2>` +
    `<p class="ka-up">Every release, in one place. The official Spotify player loads only when you ask for it.</p>` +
    `<p class="ka-up"><a class="ka-textlink" href="${SPOTIFY_ARTIST}" target="_blank" rel="noopener">Open in Spotify<span class="ka-visually-hidden"> (opens in a new tab)</span></a></p>` +
    `</div>` +
    `<div class="ka-spotify__embed" data-embed-box>` +
    `<button type="button" class="ka-btn" data-embed="${SPOTIFY_EMBED}" data-embed-title="Kingsley Anyenor on Spotify">${icon('spotify')}Load Spotify player</button>` +
    `<p class="ka-spotify__note">Loads the player from open.spotify.com</p>` +
    `</div>` +
    `</div></section>`
  );
}

function eventsStrip() {
  return (
    `<section class="ka-strip" aria-label="Events">` +
    `<a class="ka-strip__link" href="${BASE}events/">` +
    `<span class="ka-strip__label">Next gathering</span>` +
    `<span class="ka-strip__text">The Refined Experience 2027 · coming soon</span>` +
    `<span class="ka-strip__arrow">${ARROW}</span>` +
    `</a></section>`
  );
}

export function render({ catalogue, layout, img }) {
  const newest = catalogue[0];
  const body =
    hero(img) +
    latest(newest) +
    videoRow(rowEntries(catalogue)) +
    quotePanel() +
    liveBand(newest, img) +
    pillars() +
    spotify() +
    eventsStrip();
  return [
    {
      path: '',
      html: layout({
        title: 'Home',
        description: 'Kingsley Anyenor, Ghanaian gospel worship leader, and The Refined. Revived to revive.',
        active: 'home',
        preload: `<link rel="preload" href="${V}/hero-poster.webp" as="image" type="image/webp" fetchpriority="high">`,
        body,
      }),
    },
  ];
}
