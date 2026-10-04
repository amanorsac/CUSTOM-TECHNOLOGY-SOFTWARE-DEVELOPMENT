/* CTSD live demo: the app shell. Hash routes, org switcher, reset, banner,
   toasts and the live region. Never touches the network: seeds are ES
   modules and state lives in memory, mirrored to sessionStorage. */
import { createStore } from './store.js';
import church from './seed/church.js';
import school from './seed/school.js';
import business from './seed/business.js';
import { esc, orgBadge } from './ui.js';
import * as dashboard from './views/dashboard.js';
import * as pages from './views/pages.js';
import * as events from './views/events.js';
import * as people from './views/people.js';
import * as inbox from './views/inbox.js';
import * as notify from './views/notify.js';

const VIEWS = { dashboard, pages, events, people, inbox, notify };
const BANNER_KEY = 'ctsd-demo-banner-dismissed';

const store = createStore({ church, school, business });
const $ = (s) => document.querySelector(s);
const viewEl = $('[data-view]');
const live = $('[data-live]');
const toastEl = $('[data-toast]');
const orgSelect = $('#org-switch');
let current = null;

const data = () => { const s = store.getState(); return s.orgs[s.org]; };
const route = () => { const m = /^#\/([a-z]+)/.exec(location.hash); return m && VIEWS[m[1]] ? m[1] : 'dashboard'; };

function announce(msg) {
  live.textContent = '';
  setTimeout(() => { live.textContent = msg; }, 60);
}

let toastTimer = 0;
function toast(message, action) {
  clearTimeout(toastTimer);
  toastEl.innerHTML = `<div class="toast"><span>${esc(message)}</span>${action ? `<button type="button" class="toast__btn">${esc(action.label)}</button>` : ''}</div>`;
  toastEl.classList.add('is-on');
  if (action) toastEl.querySelector('button').addEventListener('click', () => { action.run(); hideToast(); });
  toastTimer = setTimeout(hideToast, action ? 7000 : 4000);
}
function hideToast() { toastEl.classList.remove('is-on'); toastTimer = setTimeout(() => { toastEl.innerHTML = ''; }, 250); }
// Immediate removal, no fade: a stale Undo must never be clickable.
function clearToast() { clearTimeout(toastTimer); toastEl.classList.remove('is-on'); toastEl.innerHTML = ''; }

function renderShell() {
  const d = data();
  const r = route();
  orgSelect.value = store.getState().org;
  $('[data-org-badge]').innerHTML = orgBadge(d.org);
  $('[data-org-name]').textContent = d.org.name;
  $('[data-org-meta]').textContent = `${d.org.type} · ${d.org.domain}`;
  const open = d.inbox.filter((m) => !m.handled).length;
  $('[data-inbox-badge]').textContent = open || '';
  $('[data-inbox-badge-sr]').textContent = open ? `, ${open} open` : '';
  document.querySelectorAll('[data-nav] a').forEach((a) => {
    if (a.getAttribute('href') === `#/${r}`) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const viewTitle = r === 'people' ? d.org.labels.people : VIEWS[r].title;
  document.title = `${viewTitle} · ${d.org.name} | CTSD live demo`;
}

function mount(focus) {
  if (current && current.instance && current.instance.destroy) current.instance.destroy();
  viewEl.innerHTML = '';
  const r = route();
  viewEl.dataset.route = r;
  const instance = VIEWS[r].mount(viewEl, { store, data, announce, toast }) || {};
  current = { route: r, instance };
  renderShell();
  if (focus) {
    const h1 = viewEl.querySelector('h1');
    if (h1) h1.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

store.subscribe((state, action) => {
  if (action.type === 'org/switch' || action.type === 'reset') {
    // Any pending Undo belongs to the previous org's data.
    clearToast();
    mount(false);
    return;
  }
  if (current.instance.update) current.instance.update(state, action);
  renderShell();
});

orgSelect.addEventListener('change', () => {
  store.dispatch({ type: 'org/switch', org: orgSelect.value });
  announce(`Now viewing ${data().org.name}.`);
});
$('[data-reset]').addEventListener('click', () => {
  store.reset();
  toast('Demo reset. Everything is back to the start.');
});
window.addEventListener('hashchange', () => mount(true));

/* Banner: visible until dismissed, for this browser session. */
const banner = $('[data-demo-banner]');
let dismissed = false;
try { dismissed = sessionStorage.getItem(BANNER_KEY) === '1'; } catch { dismissed = false; }
if (dismissed) banner.hidden = true;
banner.querySelector('[data-dismiss]').addEventListener('click', () => {
  banner.hidden = true;
  try { sessionStorage.setItem(BANNER_KEY, '1'); } catch { /* storage blocked: hidden until reload */ }
  $('#org-switch').focus();
});

mount(false);
document.documentElement.setAttribute('data-demo-ready', '1');
