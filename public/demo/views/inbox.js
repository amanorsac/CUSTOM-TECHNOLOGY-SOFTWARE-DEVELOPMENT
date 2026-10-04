import { esc, icon, fmt, avatar } from '../ui.js';

export const title = 'Inbox';

export function mount(el, { store, data, announce }) {
  const d = data();
  el.innerHTML = `
    <header class="view-head">
      <div><p class="eyebrow">${esc(d.org.name)}</p><h1 tabindex="-1">Inbox</h1>
      <p class="view-sub">${esc(d.org.labels.inbox)} from your website, in one place.</p></div>
    </header>
    <div class="segmented" role="group" aria-label="Filter messages" data-filters>
      <button type="button" data-filter="open" aria-pressed="true">Open <span class="count" data-n="open"></span></button>
      <button type="button" data-filter="handled" aria-pressed="false">Handled <span class="count" data-n="handled"></span></button>
    </div>
    <div class="split split--inbox">
      <section class="card card--flush" aria-labelledby="ib-h">
        <h2 class="sr-only" id="ib-h">Messages</h2>
        <ul class="inbox-list" role="list" data-inbox-list></ul>
      </section>
      <section class="card reader" data-reader aria-label="Message" tabindex="-1"></section>
    </div>`;

  const list = el.querySelector('[data-inbox-list]');
  const reader = el.querySelector('[data-reader]');
  let filter = 'open';
  let selected = null;

  function renderList() {
    const all = [...data().inbox].sort((a, b) => (a.date < b.date ? 1 : -1));
    el.querySelector('[data-n="open"]').textContent = all.filter((m) => !m.handled).length;
    el.querySelector('[data-n="handled"]').textContent = all.filter((m) => m.handled).length;
    el.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    const shown = all.filter((m) => (filter === 'open' ? !m.handled : m.handled));
    list.innerHTML = shown.map((m) => `
      <li><button type="button" class="inbox-item${m.id === selected ? ' is-selected' : ''}" data-inbox-item data-id="${esc(m.id)}"${m.id === selected ? ' aria-current="true"' : ''}>
        ${avatar(m.from)}
        <span class="inbox-item__main">
          <span class="inbox-item__top"><b>${esc(m.from)}</b><span class="inbox-item__date">${esc(fmt.stamp(m.date))}</span></span>
          <span class="inbox-item__subject" data-subject>${esc(m.subject)}</span>
          <span class="inbox-item__snippet">${esc(m.body)}</span>
        </span></button></li>`).join('')
      || `<li class="empty">${filter === 'open' ? 'All caught up. Nothing is waiting on you.' : 'Nothing handled yet.'}</li>`;
  }

  function renderReader() {
    const m = data().inbox.find((x) => x.id === selected);
    if (!m) {
      reader.innerHTML = `<div class="reader__empty">${icon('mail')}<p>Select a message to read it.</p></div>`;
      return;
    }
    reader.innerHTML = `
      <p class="tag">${esc(m.kind || 'Message')}</p>
      <h2 class="reader__subject">${esc(m.subject)}</h2>
      <div class="reader__from">${avatar(m.from)}<span><b>${esc(m.from)}</b><span>${esc(fmt.stamp(m.date))} · via website form</span></span></div>
      <p class="reader__body">${esc(m.body)}</p>
      <div class="reader__foot">${m.handled
        ? `<p class="handled">${icon('check')}Handled</p>`
        : '<button type="button" class="d-btn d-btn--primary" data-handle>' + icon('check') + 'Mark as handled</button>'}</div>`;
  }

  el.querySelector('[data-filters]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    renderList();
  });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-inbox-item]');
    if (!b) return;
    selected = b.dataset.id;
    renderList();
    renderReader();
    reader.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 899px)').matches) reader.scrollIntoView({ block: 'start' });
  });
  reader.addEventListener('click', (e) => {
    if (!e.target.closest('[data-handle]')) return;
    store.dispatch({ type: 'inbox/handle', id: selected });
  });

  renderList();
  renderReader();
  return {
    update(state, action) {
      if (action.type !== 'inbox/handle') return;
      renderList();
      renderReader();
      const open = data().inbox.filter((m) => !m.handled).length;
      reader.querySelector('.handled')?.setAttribute('tabindex', '-1');
      reader.querySelector('.handled')?.focus();
      announce(`Marked as handled. ${open} open ${open === 1 ? 'message' : 'messages'} left.`);
    },
  };
}
