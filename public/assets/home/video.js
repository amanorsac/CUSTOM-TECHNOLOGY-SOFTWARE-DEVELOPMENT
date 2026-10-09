// The page ships only poster images; a loop becomes a <video> when it is about to play. That keeps still
// mode free of media players (WebKit spins one up per <video>, even with preload="none") and loads nothing
// ahead of time in live mode.
export function toVideo(img) {
  if (!img || img.tagName === 'VIDEO') return img;
  const v = document.createElement('video');
  v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'none';
  v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', ''); v.setAttribute('preload', 'none');
  v.poster = img.currentSrc || img.src;
  v.dataset.src = img.dataset.video;
  for (const [k, val] of Object.entries(img.dataset)) if (k !== 'video') v.dataset[k] = val;
  if (img.className) v.className = img.className;
  img.replaceWith(v);
  return v;
}
// Loads and plays a loop (creating the <video> first if the element is still the poster image).
export function playLoop(el) {
  const v = toVideo(el);
  if (!v.src) v.src = v.dataset.src;
  v.play().catch(() => {});
  return v;
}
