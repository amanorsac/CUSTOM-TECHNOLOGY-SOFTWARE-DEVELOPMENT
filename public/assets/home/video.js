// The page ships only poster images; a loop becomes a <video> when it is about to play. That keeps still
// mode free of media players (WebKit spins one up per <video>, even with preload="none") and loads nothing
// ahead of time in live mode.
//
// One player per loop: the hero wall, the reel and the industry cards all show the same few loops, so a
// loop's <video> is shared. When another section needs it, the player moves there and leaves a poster
// image in its old place, so each loop downloads once.
const pool = new Map(); // loop URL -> its one <video>

function posterFor(v) {
  const img = document.createElement('img');
  img.src = v.poster; img.alt = ''; img.decoding = 'async';
  img.dataset.video = v.dataset.src;
  if (v.className) img.className = v.className;
  return img;
}

export function toVideo(img) {
  if (!img || img.tagName === 'VIDEO') return img;
  const src = img.dataset.video;
  let v = pool.get(src);
  if (v) {
    // Hand the shared player over: a poster takes its old place.
    if (v.isConnected) v.replaceWith(posterFor(v));
  } else {
    v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', ''); v.setAttribute('preload', 'none');
    v.poster = img.currentSrc || img.src;
    v.dataset.src = src;
    pool.set(src, v);
  }
  for (const [k, val] of Object.entries(img.dataset)) if (k !== 'video') v.dataset[k] = val;
  v.className = img.className;
  img.replaceWith(v);
  return v;
}

// Loads and plays a loop (moving the shared player here first if it lives elsewhere).
export function playLoop(el) {
  const v = toVideo(el);
  if (!v.src) v.src = v.dataset.src;
  v.play().catch(() => {});
  return v;
}
