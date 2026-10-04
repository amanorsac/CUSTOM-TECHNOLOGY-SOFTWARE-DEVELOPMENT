import { esc, icon, fmt, byDate, browserFrame, siteNav, eventsList } from '../ui.js';

export const title = 'Events';

const row = (e) => `
  <li class="ev-row">
    <span class="date-tile date-tile--lg"><span>${esc(fmt.month(e.date))}</span><b>${esc(fmt.day(e.date))}</b></span>
    <span class="ev-row__main"><b>${esc(e.title)}</b>
      <span class="ev-row__meta"><span>${icon('clock')}${esc(fmt.weekday(e.date))}, ${esc(fmt.time(e.date))}</span>${e.location ? `<span>${icon('pin')}${esc(e.location)}</span>` : ''}</span></span>
    <span class="ev-row__actions">
      <button type="button" class="icon-btn" data-edit="${esc(e.id)}" aria-label="Edit ${esc(e.title)}">${icon('edit')}</button>
      <button type="button" class="icon-btn icon-btn--danger" data-delete="${esc(e.id)}" aria-label="Delete ${esc(e.title)}">${icon('trash')}</button>
    </span>
  </li>`;

export function mount(el, { store, data, announce, toast }) {
  const d = data();
  el.innerHTML = `
    <header class="view-head">
      <div><p class="eyebrow">${esc(d.org.name)}</p><h1 tabindex="-1">Events</h1>
      <p class="view-sub">Add an event once. It appears on your website calendar instantly.</p></div>
      <button type="button" class="d-btn d-btn--primary" data-add>${icon('plus')}Add event</button>
    </header>
    <div class="split split--events">
      <section class="card" aria-labelledby="ev-h">
        <div class="card__head"><h2 id="ev-h">Upcoming</h2><p class="card__meta" data-ev-count></p></div>
        <ol class="ev-list" data-event-list role="list"></ol>
      </section>
      <section class="preview-col" aria-labelledby="cal-h">
        <h2 class="preview-col__h" id="cal-h">On your website</h2>
        ${browserFrame(d.org, `${siteNav(d.org)}<div class="site-section site-section--cal"><p class="site-section__h">Events at ${esc(d.org.name)}</p><div data-preview-calendar></div></div>`, 'Calendar page')}
      </section>
    </div>
    <dialog class="dialog" aria-labelledby="dlg-h" data-dialog>
      <form class="form" method="dialog" novalidate data-form>
        <div class="dialog__head"><h2 id="dlg-h">Add event</h2>
          <button type="button" class="icon-btn" data-cancel aria-label="Close">${icon('close')}</button></div>
        <div class="field">
          <label for="ev-title">Title</label>
          <input id="ev-title" name="title" type="text" maxlength="80" autocomplete="off" aria-describedby="ev-title-err">
          <p class="field__err" id="ev-title-err" hidden>Add a title.</p>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ev-date">Date</label>
            <input id="ev-date" name="date" type="date" min="2026-01-01" max="2030-12-31" aria-describedby="ev-date-err">
            <p class="field__err" id="ev-date-err" hidden>Pick a date.</p>
          </div>
          <div class="field">
            <label for="ev-time">Start time <span class="opt">optional</span></label>
            <input id="ev-time" name="time" type="time">
          </div>
        </div>
        <div class="field">
          <label for="ev-loc">Location <span class="opt">optional</span></label>
          <input id="ev-loc" name="location" type="text" maxlength="80" autocomplete="off">
        </div>
        <div class="dialog__foot">
          <button type="button" class="d-btn d-btn--quiet" data-cancel>Cancel</button>
          <button type="submit" class="d-btn d-btn--primary" data-save>Save event</button>
        </div>
      </form>
    </dialog>`;

  const list = el.querySelector('[data-event-list]');
  const cal = el.querySelector('[data-preview-calendar]');
  const countEl = el.querySelector('[data-ev-count]');
  const dlg = el.querySelector('[data-dialog]');
  const form = el.querySelector('[data-form]');
  const f = (n) => form.elements[n];
  let editing = null;
  let opener = null;

  function render() {
    const events = [...data().events].sort(byDate);
    list.innerHTML = events.map(row).join('') || '<li class="empty">No events yet. Add your first one.</li>';
    cal.innerHTML = eventsList(events);
    countEl.textContent = `${events.length} scheduled`;
  }

  function setErr(name, show) {
    f(name).setAttribute('aria-invalid', String(show));
    form.querySelector(`#ev-${name}-err`).hidden = !show;
  }

  function openDialog(ev, from) {
    editing = ev ? ev.id : null;
    opener = from;
    form.reset();
    setErr('title', false); setErr('date', false);
    el.querySelector('#dlg-h').textContent = ev ? 'Edit event' : 'Add event';
    if (ev) {
      const [date, time] = ev.date.split('T');
      f('title').value = ev.title; f('date').value = date; f('time').value = time || ''; f('location').value = ev.location || '';
    }
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    f('title').focus();
  }
  function closeDialog() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); opener = null; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = f('title').value.trim();
    const date = f('date').value;
    setErr('title', !title); setErr('date', !date);
    if (!title || !date) { (title ? f('date') : f('title')).focus(); return; }
    const value = { title, date: f('time').value ? `${date}T${f('time').value}` : date, location: f('location').value.trim() };
    if (editing) store.dispatch({ type: 'event/update', id: editing, patch: value });
    else store.dispatch({ type: 'event/add', event: value });
    const was = editing;
    closeDialog();
    announce(`${title} ${was ? 'updated' : 'added'}. It is on your website calendar.`);
  });
  el.querySelectorAll('[data-cancel]').forEach((b) => b.addEventListener('click', closeDialog));
  el.querySelector('[data-add]').addEventListener('click', (e) => openDialog(null, e.currentTarget));

  list.addEventListener('click', (e) => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-delete]');
    if (edit) openDialog(data().events.find((x) => x.id === edit.dataset.edit), edit);
    if (del) {
      const ev = data().events.find((x) => x.id === del.dataset.delete);
      if (!ev) return;
      store.dispatch({ type: 'event/delete', id: ev.id });
      el.querySelector('[data-add]').focus();
      toast(`“${ev.title}” deleted`, { label: 'Undo', run: () => store.dispatch({ type: 'event/add', event: ev }) });
    }
  });

  render();
  return {
    update(state, action) { if (action.type.startsWith('event/')) render(); },
    destroy() { closeDialog(); },
  };
}
