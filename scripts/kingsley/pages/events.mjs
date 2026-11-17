// Events: tabs for Upcoming / Past. No dates anywhere (facts only).
// Both panels show with JS off; js/tabs.js turns the links into real tabs.
import { esc } from '../layout.mjs';

const NEW = [
  ['mg-9007', 'The Refined on stage at The Refined Experience'],
  ['mg-9012', 'Kingsley Anyenor leading worship'],
  ['mg-9014', 'The Refined band and vocalists'],
  ['mg-9025', 'The congregation in worship'],
  ['mg-9026', 'Kingsley Anyenor ministering on stage'],
  ['mg-9027', 'The Refined vocal collective'],
];
const OLD = [
  ['mg-8938', 'An earlier Refined gathering in Accra'],
  ['mg-8954', 'Worship at an earlier Refined gathering'],
  ['mg-8962', 'The Refined band at an earlier gathering'],
  ['mg-8965', 'Kingsley Anyenor at an earlier gathering'],
  ['mg-8968', 'Prayer and worship at an earlier gathering'],
  ['mg-8972', 'The Refined ministering at an earlier gathering'],
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
    `<h2>The Refined Experience 2027</h2>` +
    `<p>Coming soon · Accra. Details will be announced here.</p></article>` +
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
