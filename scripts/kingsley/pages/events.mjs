// Events: tabs for Upcoming / Past. No dates anywhere (facts only).
// Both panels show with JS off; js/tabs.js turns the links into real tabs.
import { esc } from '../layout.mjs';

const NEW = [
  ['mg-9007', 'A standing crowd in a hall with rows of chairs, in pink-toned light'],
  ['mg-9012', 'Vocalists in patterned black and white outfits singing on an orange-lit stage beside a conga drum'],
  ['mg-9014', 'A bass guitarist and a percussionist on stage with conga drums and singers behind them'],
  ['mg-9025', 'Hands raised in a packed crowd under a soft haze of light'],
  ['mg-9026', 'People standing among rows of red chairs, many with arms lifted'],
  ['mg-9027', 'A dense crowd in a hall, some with hands raised, seen from the side'],
];
const OLD = [
  ['mg-8938', 'A dark hall with a lit stage in the distance, a screen above and a crowd in silhouette'],
  ['mg-8954', 'A man in dark clothes holding a microphone and a white cloth against a black background'],
  ['mg-8962', 'A band and singers on a stage lit by white beams, with large lettering on the screen behind and a crowd below'],
  ['mg-8965', 'A wide stage in orange light with a large screen above and the audience in dark silhouette'],
  ['mg-8968', 'Singers standing in a row on stage in front of a screen of large orange words'],
  ['mg-8972', 'A stage with a band and singers under white spotlights, a stepped glowing backdrop and an audience in front'],
];

const gal = (img, list, label) =>
  `<div class="ka-gallery" role="group" aria-label="${esc(label)}">${list
    .map(([n, alt]) => `<figure class="ka-gallery__item">${img(n, { alt, sizes: '(min-width: 861px) 33vw, 50vw' })}</figure>`)
    .join('')}</div>`;

function body(img) {
  return (
    `<section class="ka-section ka-musichead"><div class="ka-wrap">` +
    `<p class="ka-eyebrow">Kingsley Anyenor &amp; The Refined</p>` +
    `<h1 class="ka-split">Events</h1>` +
    `<p class="ka-musichead__lead ka-up">The ministry hosts flagship worship experiences across Accra, including The Refined Experience and New Wineskin. Whether through large-scale live recordings or intimate prayer gatherings, every sound released from this ministry is crafted to usher people beyond mere song into the tangible presence of God.</p>` +
    `</div></section>` +
    `<section class="ka-section ka-events"><div class="ka-wrap"><div class="ka-tabs" data-tabs>` +
    `<ul class="ka-tabs__list" aria-label="Events">` +
    `<li><a href="#panel-upcoming" id="tab-upcoming">Upcoming</a></li>` +
    `<li><a href="#panel-past" id="tab-past">Past</a></li>` +
    `</ul>` +
    `<div class="ka-tabs__panel" id="panel-upcoming" aria-labelledby="tab-upcoming">` +
    `<article class="ka-evcard"><p class="ka-eyebrow">Coming soon · Accra</p>` +
    `<h2>The Refined Experience 2027</h2></article>` +
    `</div>` +
    `<div class="ka-tabs__panel" id="panel-past" aria-labelledby="tab-past">` +
    `<h2 class="ka-evpast">The Refined Experience</h2>` +
    `<p>A flagship worship experience in Accra, with The Refined band and vocal collective.</p>` +
    gal(img, NEW, 'The Refined Experience') +
    `<h3 class="ka-evpast">Earlier gatherings</h3>` +
    `<p>Moments from earlier Refined gatherings, large and intimate.</p>` +
    gal(img, OLD, 'Earlier gatherings') +
    `</div>` +
    `</div></div></section>`
  );
}

export function render({ layout, img }) {
  return [
    {
      path: 'events',
      html: layout({
        title: 'Events',
        description: 'Worship gatherings by The Refined in Accra: The Refined Experience and New Wineskin.',
        active: 'events',
        body: body(img),
      }),
    },
  ];
}
