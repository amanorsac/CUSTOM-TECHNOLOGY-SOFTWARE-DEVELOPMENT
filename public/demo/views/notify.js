import { esc, icon, orgBadge, plural } from '../ui.js';

export const title = 'Notifications';

const clock = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export function mount(el, { store, data, announce, toast }) {
  const d = data();
  const L = d.org.labels;
  const audience = plural(L.audience, L.audienceNoun.replace(/s$/, ''), L.audienceNoun);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  el.innerHTML = `
    <header class="view-head">
      <div><p class="eyebrow">${esc(d.org.name)}</p><h1 tabindex="-1">Notifications</h1>
      <p class="view-sub">Send a push notification to everyone who has your app.</p></div>
    </header>
    <div class="split split--notify">
        <section class="card notify-compose" aria-labelledby="nf-h">
          <div class="card__head"><h2 id="nf-h">New notification</h2><p class="card__meta">To all ${esc(audience)}</p></div>
          <form class="form" data-form novalidate>
            <div class="field">
              <label for="nf-title">Title</label>
              <input id="nf-title" name="title" type="text" maxlength="50" autocomplete="off" placeholder="${esc(L.notifyTitle)}" aria-describedby="nf-title-err nf-title-count">
              <p class="field__hint" id="nf-title-count" data-count="title">0 / 50</p>
              <p class="field__err" id="nf-title-err" hidden>Add a title.</p>
            </div>
            <div class="field">
              <label for="nf-body">Message</label>
              <textarea id="nf-body" name="body" rows="4" maxlength="140" placeholder="${esc(L.notifyBody)}" aria-describedby="nf-body-err nf-body-count"></textarea>
              <p class="field__hint" id="nf-body-count" data-count="body">0 / 140</p>
              <p class="field__err" id="nf-body-err" hidden>Write a short message.</p>
            </div>
            <div class="form__foot"><button type="submit" class="d-btn d-btn--primary">${icon('send')}Send notification</button></div>
          </form>
        </section>
        <section class="card notify-sent" aria-labelledby="sent-h">
          <div class="card__head"><h2 id="sent-h">Sent</h2><p class="card__meta" data-sent-count></p></div>
          <ul class="sent-list" role="list" data-sent-list></ul>
        </section>
      <section class="phone-col" aria-labelledby="ph-h">
        <h2 class="preview-col__h" id="ph-h">Preview</h2>
        <div class="phone" data-phone>
          <div class="phone__screen">
            <span class="phone__notch" aria-hidden="true"></span>
            <p class="phone__time" aria-hidden="true">9:41</p>
            <p class="phone__date" aria-hidden="true">${esc(today)}</p>
            <div class="push">
              <div class="push__top">${orgBadge(d.org, 'org-badge--xs')}<span class="push__app">${esc(d.org.name)}</span><span class="push__now">now</span></div>
              <p class="push__title" data-push-title></p>
              <p class="push__body" data-push-body></p>
            </div>
          </div>
        </div>
      </section>
    </div>`;

  const form = el.querySelector('[data-form]');
  const f = (n) => form.elements[n];
  const pt = el.querySelector('[data-push-title]');
  const pb = el.querySelector('[data-push-body]');
  const sentList = el.querySelector('[data-sent-list]');

  function preview() {
    const t = f('title').value.trim(), b = f('body').value.trim();
    pt.textContent = t || L.notifyTitle;
    pb.textContent = b || L.notifyBody;
    pt.classList.toggle('is-placeholder', !t);
    pb.classList.toggle('is-placeholder', !b);
    el.querySelector('[data-count="title"]').textContent = `${f('title').value.length} / 50`;
    el.querySelector('[data-count="body"]').textContent = `${f('body').value.length} / 140`;
  }
  function renderSent() {
    const sent = data().sent || [];
    el.querySelector('[data-sent-count]').textContent = sent.length ? plural(sent.length, 'notification', 'notifications') : '';
    sentList.innerHTML = sent.map((s) => `<li class="sent">
      <span class="sent__icon">${icon('notify')}</span>
      <span class="sent__main"><b>${esc(s.title)}</b><span>${esc(s.body)}</span><span class="sent__meta">Sent to ${esc(audience)} · ${esc(clock(s.sentAt))}</span></span></li>`).join('')
      || '<li class="empty">Nothing sent yet. Your first notification will show up here.</li>';
  }
  const setErr = (n, show) => { f(n).setAttribute('aria-invalid', String(show)); el.querySelector(`#nf-${n}-err`).hidden = !show; };

  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) setErr(e.target.name, false); preview(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = f('title').value.trim(), b = f('body').value.trim();
    setErr('title', !t); setErr('body', !b);
    if (!t || !b) { (t ? f('body') : f('title')).focus(); return; }
    store.dispatch({ type: 'notify/send', title: t, body: b });
    form.reset();
    preview();
    toast(`Sent to ${audience}`);
    f('title').focus();
  });

  preview();
  renderSent();
  return { update(state, action) { if (action.type === 'notify/send') renderSent(); } };
}
