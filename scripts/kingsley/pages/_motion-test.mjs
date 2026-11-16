// Fixture page for tests/e2e/kingsley-motion.spec.js: one of every motion
// hook (carousel, split heading, wedge, fade-up, parallax band, video row).
// Not linked from the site. Removed in Task 11.
const V = '/assets/preview/kingsley/video';

export function render({ layout, img }) {
  const slide = (n, inner, active = false) =>
    `<div class="ka-slide${active ? ' is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${n} of 3">${inner}</div>`;

  const carousel =
    `<section class="ka-carousel" aria-roledescription="carousel" aria-label="Kingsley Anyenor live">` +
    `<div class="ka-carousel__slides">` +
    slide(
      1,
      `<video class="ka-slide-video" muted loop playsinline preload="none" poster="${V}/hero-poster.webp" ` +
        `data-src="${V}/hero-1920.mp4" data-src-small="${V}/hero-960.mp4" aria-hidden="true"></video>` +
        `<div class="ka-slide__caption"><h1>Kingsley Anyenor</h1><p>Revived to revive.</p></div>`,
      true,
    ) +
    slide(2, img('mg-9033', { alt: 'Kingsley Anyenor leading worship', sizes: '100vw' }) + `<div class="ka-slide__caption"><p class="ka-eyebrow">Slide two</p></div>`) +
    slide(3, img('mg-9032', { alt: 'The Refined on stage', sizes: '100vw' }) + `<div class="ka-slide__caption"><p class="ka-eyebrow">Slide three</p></div>`) +
    `</div></section>`;

  const rowItems = ['amh-5849', 'mg-9033', 'mg-9032', 'amh-5849', 'mg-9033', 'mg-9032']
    .map((name, i) => `<article class="ka-row__item">${img(name, { alt: '', sizes: '320px' })}<h3>Video ${i + 1}</h3></article>`)
    .join('');

  const body =
    carousel +
    `<section class="ka-section"><div class="ka-wrap" style="min-height:120vh">` +
    `<h2 class="ka-split" id="split">A long heading that wraps onto more than one line on most screens</h2>` +
    `</div></section>` +
    `<section class="ka-section"><div class="ka-wrap">` +
    `<p class="ka-up" id="up">This paragraph fades up when it scrolls into view.</p>` +
    `<div class="ka-wedge" id="wedge">${img('amh-5849', { alt: 'Worship night', sizes: '(max-width: 1200px) 100vw, 1200px' })}</div>` +
    `</div></section>` +
    `<section class="ka-section"><div class="ka-wrap"><div class="ka-up" id="tall" style="height:750vh;border-left:2px solid var(--ka-clay)">` +
    `<p>A block taller than seven viewports.</p></div></div></section>` +
    `<section class="ka-parallax" id="parallax"><div class="ka-parallax__bg">${img('mg-9032', { alt: '', sizes: '100vw' })}</div>` +
    `<div class="ka-wrap"><h2>Parallax band</h2></div></section>` +
    `<section class="ka-section"><div class="ka-wrap">` +
    `<div class="ka-row" role="region" aria-label="Videos" id="row"><div class="ka-row__track">${rowItems}</div></div>` +
    `</div></section>`;

  return [
    {
      path: '_motion-test',
      html: layout({
        title: 'Motion test',
        description: 'Test fixture for motion and the hero carousel.',
        active: '',
        body,
      }),
    },
  ];
}
