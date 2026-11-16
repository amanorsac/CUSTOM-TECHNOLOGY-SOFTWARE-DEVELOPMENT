// Latest release block on the home page ([data-latest] = the YouTube id it
// was built with). Asks /api/kingsley/latest for the newest upload and, only
// if it is a different video, swaps in its title, date, thumbnail, play
// button and streaming links. Any failure leaves the block as built.
import { findByYoutubeId } from './catalogue.js';

const API = '/api/kingsley/latest';
const CATALOGUE_URL = '/assets/preview/kingsley/data/catalogue.json';
const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-11-13T…' -> '13 Nov 2026' (en-GB order, UTC). Empty string when unusable. */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function setLink(a, href) {
  if (!a) return;
  if (href) {
    a.href = href;
    a.hidden = false;
  } else {
    a.removeAttribute('href');
    a.hidden = true;
  }
}

/** Fills the [data-latest] block inside root, if there is one. */
export async function initLatest(root) {
  const block = root && root.querySelector('[data-latest]');
  if (!block || block.dataset.latestChecked) return;
  block.dataset.latestChecked = '1';
  const built = block.dataset.latest;

  let data;
  try {
    data = await getJson(API);
  } catch {
    return;
  }
  if (!data || !data.ok || typeof data.youtubeId !== 'string' || !ID_RE.test(data.youtubeId)) return;
  const id = data.youtubeId;
  if (id === built || !block.isConnected) return;

  let entry;
  try {
    entry = findByYoutubeId(await getJson(CATALOGUE_URL), id);
  } catch {
    entry = undefined;
  }
  if (!block.isConnected) return;

  const title = (entry && entry.title) || (typeof data.title === 'string' ? data.title : '') || 'Latest release';
  const date = formatDate(data.published) || (entry && entry.year ? String(entry.year) : '');
  const q = (sel) => block.querySelector(sel);

  const titleEl = q('[data-latest-title]');
  if (titleEl) titleEl.textContent = title;
  const dateEl = q('[data-latest-date]');
  if (dateEl) {
    dateEl.textContent = date;
    dateEl.hidden = !date;
    const sep = dateEl.nextElementSibling;
    if (sep && sep.getAttribute('aria-hidden') === 'true') sep.hidden = !date;
  }
  const thumb = q('[data-latest-thumb]');
  if (thumb) thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const btn = q('[data-latest-play]');
  if (btn) {
    btn.dataset.play = id;
    btn.dataset.title = title;
    if (entry && entry.group) btn.dataset.queue = entry.group;
    else delete btn.dataset.queue;
    btn.setAttribute('aria-label', `Play ${title}`);
    btn.setAttribute('aria-pressed', 'false');
  }

  setLink(q('[data-latest-youtube]'), `https://www.youtube.com/watch?v=${id}`);
  setLink(q('[data-latest-spotify]'), entry && entry.spotifyUrl);
  setLink(q('[data-latest-apple]'), entry && entry.appleUrl);
  block.dataset.latest = id;
}
