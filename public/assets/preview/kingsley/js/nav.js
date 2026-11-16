// Page swapper: swaps #main in place for links inside the draft, so the
// player bar (outside #main) keeps playing. Falls back to a normal page load
// on any error; with JS off the links are plain links.
const SCOPE = '/preview/kingsley/';

function eligible(e, a) {
  if (e.defaultPrevented || e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.hasAttribute('download') || a.hasAttribute('target')) return false;
  const raw = a.getAttribute('href') || '';
  if (raw.startsWith('#')) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(SCOPE)) return false;
  // Same page with only a hash: let the browser scroll.
  if (url.hash && url.pathname === location.pathname && url.search === location.search) return false;
  return url;
}

let token = 0;
let shown = ''; // pathname + search of the page in #main
const key = (u) => u.pathname + u.search;

async function swap(url, { push }) {
  const mine = ++token;
  let doc;
  try {
    const res = await fetch(url.href, { headers: { Accept: 'text/html' } });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (res.redirected && res.url) url = new URL(new URL(res.url).pathname + new URL(res.url).search + url.hash, location.href);
    doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    if (!doc.getElementById('main')) throw new Error('no #main');
  } catch {
    location.href = url.href;
    return;
  }
  if (mine !== token) return; // a later click won

  const main = document.getElementById('main');
  main.replaceChildren(...doc.getElementById('main').childNodes);
  document.title = doc.title;
  const desc = doc.querySelector('meta[name="description"]');
  const here = document.querySelector('meta[name="description"]');
  if (desc && here) here.setAttribute('content', desc.getAttribute('content') || '');

  // Keep "current page" markers in the header and footer navs in step.
  const path = url.pathname;
  for (const a of document.querySelectorAll('.ka-nav a')) {
    if (new URL(a.href, location.href).pathname === path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }

  shown = key(url);
  if (push) history.pushState({ ka: true }, '', url.href);

  if (url.hash) {
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, 0);
  }
  const h1 = main.querySelector('h1');
  if (h1) {
    if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }
  document.dispatchEvent(new CustomEvent('ka:page'));
}

export function initNav() {
  if (!document.getElementById('main') || !window.fetch || !window.DOMParser) return;
  history.replaceState({ ka: true }, '', location.href);
  shown = key(location);

  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a) return;
    const url = eligible(e, a);
    if (!url) return;
    e.preventDefault();
    if (url.href === location.href) {
      window.scrollTo(0, 0);
      return;
    }
    swap(url, { push: true });
  });

  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    if (key(url) === shown) return; // hash-only change on the same page
    swap(url, { push: false });
  });
}
