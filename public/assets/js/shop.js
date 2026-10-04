// Explore Designs: category tabs (?cat=, linkable) + the design grid.
import { CATEGORIES, normalizeCategory, filterDesigns } from './catalog.js';
import { designCard, CATEGORY_LABEL } from './design-card.js';

const tablist = document.querySelector('[data-tabs]');
const grid = document.querySelector('[data-design-grid]');
const status = document.querySelector('[data-shop-status]');
let designs = [];

function renderTabs(active) {
  tablist.replaceChildren(...CATEGORIES.map((cat) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'shop-tab';
    b.id = `tab-${cat}`;
    b.dataset.cat = cat;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'design-panel');
    b.textContent = CATEGORY_LABEL[cat];
    const n = document.createElement('span');
    n.className = 'shop-tab__count';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = filterDesigns(designs, cat).length;
    b.append(n);
    return b;
  }));
  setActive(active, { focus: false });
}

function setActive(cat, { focus }) {
  for (const b of tablist.querySelectorAll('[role="tab"]')) {
    const on = b.dataset.cat === cat;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  }
  grid.closest('[role="tabpanel"]').setAttribute('aria-labelledby', `tab-${cat}`);
}

function renderGrid(cat) {
  const list = filterDesigns(designs, cat);
  grid.replaceChildren(...list.map((d, i) => designCard(d, { eager: i < 3 })));
  status.textContent = `${list.length} ${list.length === 1 ? 'design' : 'designs'}`;
}

function select(cat, { focus = false } = {}) {
  setActive(cat, { focus });
  renderGrid(cat);
  const url = new URL(location.href);
  if (cat === 'all') url.searchParams.delete('cat');
  else url.searchParams.set('cat', cat);
  history.replaceState(history.state, '', url);
}

tablist.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab && tab.getAttribute('aria-selected') !== 'true') select(tab.dataset.cat);
});

tablist.addEventListener('keydown', (e) => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(document.activeElement);
  if (i === -1) return;
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  select(tabs[(next + tabs.length) % tabs.length].dataset.cat, { focus: true });
});

const errorBox = document.querySelector('[data-shop-error]');
const retry = document.querySelector('[data-shop-retry]');

// A failed load: drop the CLS space reservation and show a visible error
// (the status line is visually hidden on small screens).
function showFailure(failed) {
  grid.classList.toggle('is-failed', failed);
  errorBox.hidden = !failed;
}

retry.addEventListener('click', () => {
  retry.disabled = true;
  init().finally(() => {
    retry.disabled = false;
    // Success hides the button; keep keyboard focus somewhere sensible.
    if (errorBox.hidden) {
      const tab = tablist.querySelector('[aria-selected="true"]');
      if (tab) tab.focus();
    }
  });
});

async function init() {
  try {
    const res = await fetch('/data/designs.json');
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('bad data');
    designs = data;
  } catch {
    status.textContent = '';
    showFailure(true);
    return;
  }
  showFailure(false);
  const cat = normalizeCategory(new URLSearchParams(location.search).get('cat'));
  renderTabs(cat);
  renderGrid(cat);
  if (cat === 'all' && new URLSearchParams(location.search).has('cat')) select('all');
}

init();
