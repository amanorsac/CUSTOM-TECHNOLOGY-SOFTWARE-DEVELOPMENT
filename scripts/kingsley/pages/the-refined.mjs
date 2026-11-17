// The Refined: ministry, philosophy, band and choir (spec "The Refined").
// Light (rose/cream) sections alternate with dark ones.
import { BASE, esc } from '../layout.mjs';
import { ARROW } from '../parts.mjs';

const QUOTE = 'A new generation arose who knew not Jesus but they met me! I reveal the Glorified Jesus in my generation!';
const PILLARS = [
  ['Revival', "Igniting a fresh hunger for God's presence in churches, campuses, and communities."],
  ['Consecration', 'Calling believers back to a life of holiness, intimacy, and wholehearted surrender to Christ.'],
  ['Restoration', 'Ministering healing, hope, and spiritual renewal through the prophetic power of worship and the Word.'],
];
const TEAM = [
  ['Apostle Kubi', 'Producer and piano'],
  ['Theophil Jed Jnr', 'Music director'],
  ['Joojo Forson', 'Drums'],
  ['Stephen Amanor Sackey', 'Mixing and mastering'],
];
const GALLERY = [
  ['amh-5789', 'Kingsley Anyenor and The Refined on stage'],
  ['amh-5791', 'The Refined band and vocal collective in worship'],
  ['amh-5821', 'A Refined Experience worship night in Accra'],
  ['amh-5953', 'Kingsley Anyenor leading the congregation'],
  ['amh-5954', 'The Refined backing vocalists on stage'],
  ['mg-9035', 'The Refined during a live recording'],
];

const intro = () =>
  `<section class="ka-section ka-rhead"><div class="ka-wrap">` +
  `<p class="ka-eyebrow">Kingsley Anyenor Ministries</p>` +
  `<h1 class="ka-split">Revived to revive</h1>` +
  `<p class="ka-rhead__lead ka-up">The Refined is a non-denominational music and outreach group founded and led by Kingsley Anyenor in Accra, Ghana. Rooted in Malachi 3:1–3, it is dedicated to “revealing the glorified Christ in my generation”.</p>` +
  `<p class="ka-rhead__scripture ka-up">Malachi 3:1–3</p>` +
  `</div></section>`;

const story = (img) =>
  `<section class="ka-section ka-section--light ka-rstory" aria-labelledby="story-title"><div class="ka-wrap ka-rsplit">` +
  `<div class="ka-rsplit__media ka-wedge">${img('grey7822', { alt: 'Portrait of Kingsley Anyenor', sizes: '(min-width: 861px) 40vw, 100vw' })}</div>` +
  `<div class="ka-rsplit__body">` +
  `<p class="ka-eyebrow">The story</p>` +
  `<h2 id="story-title" class="ka-split">A Ghanaian gospel minister, worship leader and songwriter</h2>` +
  `<p class="ka-up">Kingsley Anyenor is a Ghanaian gospel minister, worship leader, and songwriter based in Accra, Ghana. He is best known for his extended live worship sessions, particularly his ongoing Deeper Worship series.</p>` +
  `<p class="ka-up">Kingsley Anyenor Ministries operates primarily through The Refined, with the guiding motto “Revived to revive”.</p>` +
  `<a class="ka-btn ka-btn--dark ka-up" href="${BASE}music/">Hear the music${ARROW}</a>` +
  `</div></div></section>`;

const pillars = () =>
  `<section class="ka-section ka-pillars" aria-labelledby="rpillars-title"><div class="ka-wrap">` +
  `<div class="ka-head"><div><p class="ka-eyebrow">The ministry</p><h2 id="rpillars-title" class="ka-split">Three pillars</h2></div></div>` +
  `<ol class="ka-pillars__list">${PILLARS.map(
    ([n, l], i) =>
      `<li class="ka-pillar ka-up"><span class="ka-pillar__num" aria-hidden="true">0${i + 1}</span><h3>${esc(n)}</h3><p>${esc(l)}</p></li>`,
  ).join('')}</ol></div></section>`;

const philosophy = (img) =>
  `<section class="ka-section ka-section--light ka-rphil" aria-labelledby="phil-title"><div class="ka-wrap ka-rsplit ka-rsplit--flip">` +
  `<div class="ka-rsplit__body">` +
  `<p class="ka-eyebrow">Worship philosophy</p>` +
  `<h2 id="phil-title" class="ka-split">Worship is a natural response</h2>` +
  `<blockquote class="ka-rquote ka-up"><p>Worship is a “natural response to the greatness of God”.</p></blockquote>` +
  `<p class="ka-up">Anyenor defines worship as a “natural response to the greatness of God” rather than mere words or musical tempo. His approach emphasizes a genuine heart posture, reconciliation, and leading believers into extended moments of prayer and spiritual reflection.</p>` +
  `</div>` +
  `<div class="ka-rsplit__media ka-wedge">${img('grey78221', { alt: 'Kingsley Anyenor in a quiet moment', sizes: '(min-width: 861px) 40vw, 100vw' })}</div>` +
  `</div></section>`;

const band = () =>
  `<section class="ka-section ka-section--raised ka-rband" aria-labelledby="band-title"><div class="ka-wrap">` +
  `<p class="ka-eyebrow">Band and choir</p>` +
  `<h2 id="band-title" class="ka-split">More than a banner</h2>` +
  `<p class="ka-up ka-rband__lead">Beyond being a ministry banner, The Refined serves as Anyenor's backing vocal team, band, and independent music imprint.</p>` +
  `<ul class="ka-team">${TEAM.map(
    ([n, r]) => `<li class="ka-team__item ka-up"><h3>${esc(n)}</h3><p>${esc(r)}</p></li>`,
  ).join('')}</ul>` +
  `<p class="ka-up ka-rband__gather">Alongside The Refined band and vocal collective, the ministry hosts flagship worship experiences across Accra, including The Refined Experience and New Wineskin. <a class="ka-textlink" href="${BASE}events/">See events${ARROW}</a></p>` +
  `</div></section>`;

const gallery = (img) =>
  `<section class="ka-section ka-section--light ka-rgallery" aria-labelledby="gal-title"><div class="ka-wrap">` +
  `<div class="ka-head"><div><p class="ka-eyebrow">On stage</p><h2 id="gal-title" class="ka-split">The Refined, live</h2></div></div>` +
  `<div class="ka-gallery ka-wedge">${GALLERY.map(
    ([n, alt]) => `<figure class="ka-gallery__item">${img(n, { alt, sizes: '(min-width: 861px) 33vw, 50vw' })}</figure>`,
  ).join('')}</div></div></section>`;

const awards = () =>
  `<section class="ka-section ka-raward" aria-labelledby="award-title"><div class="ka-wrap">` +
  `<p class="ka-eyebrow">Recognition</p>` +
  `<h2 id="award-title" class="ka-raward__line">Nominated, Praise Achievement Awards</h2>` +
  `<blockquote class="ka-rquote ka-up"><p>${esc(QUOTE)}</p><footer>Kingsley Anyenor</footer></blockquote>` +
  `<div class="ka-actions ka-up"><a class="ka-btn" href="${BASE}book/">Book Kingsley${ARROW}</a>` +
  `<a class="ka-btn ka-btn--ghost" href="${BASE}events/">Events</a></div>` +
  `</div></section>`;

export function render({ layout, img }) {
  return [
    {
      path: 'the-refined',
      html: layout({
        title: 'The Refined',
        description: 'The Refined: the ministry, band and choir led by Kingsley Anyenor in Accra. Revived to revive.',
        active: 'the-refined',
        body: intro() + story(img) + pillars() + philosophy(img) + band() + gallery(img) + awards(),
      }),
    },
  ];
}
