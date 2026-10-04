import { esc, icon, fmt, avatar } from '../ui.js';

export const title = 'People';

const TONE = { Active: 'ok', Enrolled: 'ok', New: 'new', Applicant: 'new', Prospect: 'new' };
const pill = (s) => `<span class="pill pill--${TONE[s] || 'quiet'}">${esc(s)}</span>`;

export function mount(el, { data }) {
  const d = data();
  const label = d.org.labels.people;
  const statuses = [...new Set(d.people.map((p) => p.status))];
  const fresh = d.people.filter((p) => p.joined >= '2026-09-01').length;
  el.innerHTML = `
    <header class="view-head">
      <div><p class="eyebrow">${esc(d.org.name)}</p><h1 tabindex="-1">${esc(label)}</h1>
      <p class="view-sub">${d.people.length} people · ${fresh} joined in the last month</p></div>
    </header>
    <section class="card card--flush" aria-labelledby="pp-h">
      <h2 class="sr-only" id="pp-h">${esc(label)} directory</h2>
      <div class="toolbar">
        <div class="search">${icon('search')}<label class="sr-only" for="pp-q">Search people</label>
          <input id="pp-q" type="search" placeholder="Search by name or email" autocomplete="off"></div>
        <div class="toolbar__filter"><label for="pp-status">Status</label>
          <select id="pp-status"><option value="all">All statuses</option>${statuses.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></div>
        <p class="toolbar__count" data-pp-count aria-live="polite"></p>
      </div>
      <table class="table">
        <caption class="sr-only">${esc(label)}</caption>
        <thead><tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Joined</th></tr></thead>
        <tbody data-pp-body></tbody>
      </table>
    </section>
    <dialog class="dialog dialog--drawer" aria-labelledby="pd-name" data-drawer></dialog>`;

  const q = el.querySelector('#pp-q');
  const status = el.querySelector('#pp-status');
  const body = el.querySelector('[data-pp-body]');
  const count = el.querySelector('[data-pp-count]');
  const drawer = el.querySelector('[data-drawer]');
  let opener = null;

  function render() {
    const term = q.value.trim().toLowerCase();
    const rows = d.people.filter((p) => (status.value === 'all' || p.status === status.value)
      && (!term || p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)));
    body.innerHTML = rows.map((p) => `
      <tr data-person-row>
        <td class="table__name"><button type="button" class="person" data-person="${esc(p.id)}">${avatar(p.name)}
          <span><b>${esc(p.name)}</b><span class="person__email">${esc(p.email)}</span></span></button></td>
        <td data-label="Role">${esc(p.role)}</td>
        <td data-label="Status">${pill(p.status)}</td>
        <td data-label="Joined">${esc(fmt.short(p.joined))}</td>
      </tr>`).join('') || `<tr><td colspan="4" class="empty">No one matches “${esc(q.value)}”.</td></tr>`;
    count.textContent = `Showing ${rows.length} of ${d.people.length}`;
  }

  function open(p, from) {
    opener = from;
    drawer.innerHTML = `
      <div class="dialog__head"><span></span><button type="button" class="icon-btn" data-close aria-label="Close">${icon('close')}</button></div>
      <div class="drawer__id">${avatar(p.name, 'avatar--lg')}<h2 id="pd-name">${esc(p.name)}</h2><p>${esc(p.role)}</p>${pill(p.status)}</div>
      <dl class="drawer__dl">
        <div><dt>Email</dt><dd>${esc(p.email)}</dd></div>
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Status</dt><dd>${esc(p.status)}</dd></div>
        <div><dt>Joined</dt><dd>${esc(fmt.long(p.joined))}</dd></div>
      </dl>
      <p class="drawer__note">In your own system this is where notes, history and permissions live, all editable by your team.</p>`;
    drawer.querySelector('[data-close]').addEventListener('click', () => drawer.close());
    drawer.showModal();
    drawer.querySelector('[data-close]').focus();
  }
  drawer.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); });
  drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.close(); });

  q.addEventListener('input', render);
  status.addEventListener('change', render);
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-person]');
    if (b) open(d.people.find((p) => p.id === b.dataset.person), b);
  });
  render();
  return { destroy: () => drawer.open && drawer.close() };
}
