// Persistent YouTube player bar. Lives in #ka-player (outside #main), so the
// page swapper in nav.js can change pages without stopping the music.
// Nothing from YouTube loads until the first play().


const API_URL = 'https://www.youtube.com/iframe_api';
const HOST = 'https://www.youtube-nocookie.com';
const CATALOGUE_URL = '/assets/preview/kingsley/data/catalogue.json';
const API_TIMEOUT = 8000;

const state = {
  root: null,
  els: {},
  yt: null, // YT.Player instance once ready
  ytReady: null, // Promise for the API
  current: null, // { id, title }
  queue: [], // catalogue entries in the current group, newest first
  queueReady: Promise.resolve(),
  playing: false,
  expanded: false,
  timer: 0,
};

let cataloguePromise;
function loadCatalogue() {
  cataloguePromise ??= fetch(CATALOGUE_URL)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);
  return cataloguePromise;
}

function loadApi() {
  if (state.ytReady) return state.ytReady;
  state.ytReady = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const timer = setTimeout(() => reject(new Error('timeout')), API_TIMEOUT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      if (typeof prev === 'function') {
        try { prev(); } catch { /* another listener's problem */ }
      }
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = API_URL;
    s.async = true;
    s.onerror = () => { clearTimeout(timer); reject(new Error('load failed')); };
    document.head.append(s);
  });
  // Allow a retry on the next play after a failure.
  state.ytReady.catch(() => { state.ytReady = null; });
  return state.ytReady;
}

const ICONS = {
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
  next: '<path d="M6 6l8.5 6L6 18zM16 6h2v12h-2z"/>',
  expand: '<path d="M7 14l5-5 5 5z"/>',
  collapse: '<path d="M7 10l5 5 5-5z"/>',
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

function build() {
  const root = state.root;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Music player');
  root.innerHTML = `
    <div class="ka-player__video" data-el="video"><div data-el="mount"></div></div>
    <div class="ka-player__progress" role="progressbar" aria-label="Song progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-el="progress"><span data-el="fill"></span></div>
    <div class="ka-player__bar">
      <img class="ka-player__thumb" data-el="thumb" alt="" width="96" height="54">
      <div class="ka-player__meta">
        <p class="ka-player__label">Now playing</p>
        <p class="ka-player__title" data-el="title" aria-live="polite"></p>
        <p class="ka-player__error" data-el="error" hidden>Couldn't load the player. <a data-el="yt" href="#" target="_blank" rel="noopener">Watch on YouTube</a></p>
      </div>
      <div class="ka-player__controls">
        <button type="button" class="ka-player__btn" data-el="toggle" aria-label="Pause">${svg('pause')}</button>
        <button type="button" class="ka-player__btn" data-el="next" aria-label="Next song">${svg('next')}</button>
        <button type="button" class="ka-player__btn" data-el="expand" aria-label="Show video" aria-expanded="false">${svg('expand')}</button>
      </div>
    </div>`;
  for (const el of root.querySelectorAll('[data-el]')) state.els[el.dataset.el] = el;
  state.els.toggle.addEventListener('click', toggle);
  state.els.next.addEventListener('click', next);
  state.els.expand.addEventListener('click', () => expand(!state.expanded));
}

function show() {
  if (!state.root.hidden) return;
  state.root.hidden = false;
  document.body.classList.add('ka-has-player');
}

function setPlaying(playing) {
  state.playing = playing;
  const t = state.els.toggle;
  t.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  t.innerHTML = svg(playing ? 'pause' : 'play');
  state.root.classList.toggle('is-playing', playing);
  syncButtons();
  clearInterval(state.timer);
  if (playing) state.timer = setInterval(tick, 500);
}

function tick() {
  const p = state.yt;
  if (!p || typeof p.getDuration !== 'function') return;
  const d = p.getDuration() || 0;
  const pct = d ? Math.min(100, Math.round((p.getCurrentTime() / d) * 100)) : 0;
  state.els.progress.setAttribute('aria-valuenow', String(pct));
  state.els.fill.style.width = `${pct}%`;
}

function showError(id) {
  state.els.error.hidden = false;
  state.els.yt.href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  setPlaying(false);
}

// Mark the page's play buttons for the song that is playing.
export function syncButtons() {
  const id = state.current && state.current.id;
  for (const b of document.querySelectorAll('button[data-play]')) {
    b.setAttribute('aria-pressed', String(Boolean(id) && b.dataset.play === id && state.playing));
  }
}

function onStateChange(e) {
  const S = window.YT.PlayerState;
  if (e.data === S.PLAYING) setPlaying(true);
  else if (e.data === S.PAUSED) setPlaying(false);
  else if (e.data === S.ENDED) {
    setPlaying(false);
    next();
  }
}

export function initPlayer() {
  state.root = document.getElementById('ka-player');
  if (!state.root) return;
  build();
}

/**
 * Play a song in the bar.
 * @param {string} id YouTube video id
 * @param {{ title: string, queue?: string }} opts queue: catalogue group id
 */
export async function play(id, { title, queue } = {}) {
  if (!state.root || !id) return;
  state.current = { id, title: title || '' };
  const { els } = state;
  els.title.textContent = title || '';
  els.thumb.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;
  els.error.hidden = true;
  els.progress.setAttribute('aria-valuenow', '0');
  els.fill.style.width = '0%';
  show();
  setPlaying(true);

  state.queueReady = queue
    ? loadCatalogue().then((entries) => {
        if (state.current && state.current.id === id) state.queue = entries.filter((e) => e.group === queue);
      })
    : Promise.resolve((state.queue = []));

  let YT;
  try {
    YT = await loadApi();
  } catch {
    if (state.current && state.current.id === id) showError(id);
    return;
  }
  if (!state.current || state.current.id !== id) return; // superseded by a later play()

  if (state.yt) {
    state.yt.loadVideoById(id);
    return;
  }
  state.yt = 'pending';
  new YT.Player(els.mount, {
    host: HOST,
    videoId: id,
    width: '100%',
    height: '100%',
    playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: (e) => {
        state.yt = e.target;
        const want = state.current && state.current.id;
        if (want && want !== id) state.yt.loadVideoById(want);
        else state.yt.playVideo();
      },
      onStateChange,
      onError: () => showError(state.current ? state.current.id : id),
    },
  });
}

export function toggle() {
  const p = state.yt;
  if (!p || p === 'pending') return;
  if (state.playing) {
    p.pauseVideo();
    setPlaying(false);
  } else {
    p.playVideo();
    setPlaying(true);
  }
}

// Next song in the current queue; stops at the end (no wrap).
export async function next() {
  if (!state.current) return;
  const from = state.current.id;
  await state.queueReady;
  if (!state.current || state.current.id !== from) return; // something else started meanwhile
  const i = state.queue.findIndex((e) => e.youtubeId === state.current.id);
  const entry = i >= 0 ? state.queue[i + 1] : undefined;
  if (!entry) {
    if (state.yt && state.yt !== 'pending' && state.playing) state.yt.pauseVideo();
    setPlaying(false);
    return;
  }
  play(entry.youtubeId, { title: entry.title, queue: entry.group });
}

export function expand(open) {
  if (!state.root) return;
  state.expanded = Boolean(open);
  state.root.classList.toggle('is-expanded', state.expanded);
  const b = state.els.expand;
  b.setAttribute('aria-expanded', String(state.expanded));
  b.setAttribute('aria-label', state.expanded ? 'Hide video' : 'Show video');
  b.innerHTML = svg(state.expanded ? 'collapse' : 'expand');
}

