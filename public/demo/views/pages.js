import { esc, icon, IMAGES, illustration, sitePreview } from '../ui.js';

export const title = 'Pages';

export function mount(el, { store, data, announce }) {
  const d = data();
  el.innerHTML = `
    <header class="view-head">
      <div><p class="eyebrow">${esc(d.org.name)}</p><h1 tabindex="-1">Pages</h1>
      <p class="view-sub">Edit your homepage. Every change appears in the preview as you type.</p></div>
      <p class="saved" data-saved>${icon('check')}<span>Saved</span></p>
    </header>
    <div class="split split--pages">
      <section class="card" aria-labelledby="ed-h">
        <div class="card__head"><h2 id="ed-h">Homepage</h2><p class="card__meta">${esc(d.org.domain)}</p></div>
        <form class="form" data-editor novalidate>
          <div class="field">
            <label for="pg-heading">Heading</label>
            <input id="pg-heading" name="heading" type="text" maxlength="80" autocomplete="off" value="${esc(d.page.heading)}">
          </div>
          <div class="field">
            <label for="pg-body">Body text</label>
            <textarea id="pg-body" name="body" rows="5" maxlength="280" aria-describedby="pg-body-count">${esc(d.page.body)}</textarea>
            <p class="field__hint" id="pg-body-count" data-count>${d.page.body.length} / 280</p>
          </div>
          <fieldset class="field picker">
            <legend>Hero image</legend>
            <div class="picker__grid">${IMAGES.map((im) => `
              <label class="picker__opt"><input type="radio" name="image" value="${im.id}" ${im.id === d.page.image ? 'checked' : ''}>
                <span class="picker__thumb" aria-hidden="true">${illustration(im.id)}</span><span class="picker__label">${esc(im.label)}</span></label>`).join('')}
            </div>
          </fieldset>
        </form>
      </section>
      <section class="preview-col" aria-label="Homepage preview"><div data-preview-slot>${sitePreview(d)}</div></section>
    </div>`;

  const form = el.querySelector('[data-editor]');
  const slot = el.querySelector('[data-preview-slot]');
  const saved = el.querySelector('[data-saved]');
  const count = el.querySelector('[data-count]');
  let timer = 0;

  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!['heading', 'body', 'image'].includes(t.name)) return;
    store.dispatch({ type: 'page/update', field: t.name, value: t.value });
  });

  function update(state, action) {
    if (action.type !== 'page/update') return;
    const p = data().page;
    const q = (s) => slot.querySelector(s);
    if (action.field === 'image') {
      const img = q('[data-preview-image]');
      img.dataset.image = p.image;
      img.innerHTML = illustration(p.image);
    } else {
      q(action.field === 'heading' ? '[data-preview-heading]' : '[data-preview-body]').textContent = p[action.field];
      if (action.field === 'body') count.textContent = `${p.body.length} / 280`;
    }
    saved.classList.add('is-saving');
    saved.querySelector('span').textContent = 'Saved just now';
    clearTimeout(timer);
    timer = setTimeout(() => { saved.classList.remove('is-saving'); announce('Changes saved. The preview is up to date.'); }, 700);
  }
  return { update, destroy: () => clearTimeout(timer) };
}
