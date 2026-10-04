// Start a Project (/start) and Free Mockup (/mockup) forms.
// One controller for both: <form data-form="project|mockup">.
// - Option cards are rendered from the lead-schema enums (form-model.js).
// - Validation uses the same validateLead the Worker runs.
// - Turnstile is loaded by the page with render=explicit; the site key is in
//   [data-sitekey]. Tokens are single-use, so every attempt gets a fresh one.
// - Nothing the visitor typed is ever cleared on failure; a draft is kept in
//   sessionStorage so a reload loses nothing.
import { validateLead } from './lead-schema.js';
import { findDesign } from './catalog.js';
import {
  OPTIONS, LABELS, PROJECT_STEPS, MOCKUP_FIELDS,
  checkLogo, stepErrors, firstErrorStep, fallbackHref, cleanDraft,
} from './form-model.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const ICON = (d) => `<svg class="choice__icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICONS = {
  business: ICON('M4 8h16v11H4zM9 8V5h6v3M4 13h16'),
  church: ICON('M12 2v5M9.5 4.5h5M6 21V11l6-4 6 4v10M10 21v-4a2 2 0 0 1 4 0v4M3 21h18'),
  school: ICON('M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6'),
  nonprofit: ICON('M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'),
  other: ICON('M5 12h.01M12 12h.01M19 12h.01'),
};

const MSG = {
  captcha: 'Please complete the verification and try again.',
  check: 'Please check the highlighted fields.',
  noTurnstile: 'The spam check could not load, so we cannot send this form right now.',
  noToken: 'We could not complete the spam check, so your details were not sent.',
  failed: 'Sorry, something went wrong and your details were not sent.',
  logoFailed: "Your request was sent, but the logo didn't upload.",
};
const TOKEN_WAIT = 30000;

function storage() {
  try { return window.sessionStorage; } catch { return null; }
}

function init(form) {
  const kind = form.dataset.form === 'mockup' ? 'mockup' : 'project';
  const steps = kind === 'project' ? PROJECT_STEPS : [{ id: 'all', fields: MOCKUP_FIELDS }];
  const stepEls = [...form.querySelectorAll('[data-step]')];
  const status = form.querySelector('[data-form-status]');
  const btnBack = form.querySelector('[data-back]');
  const btnNext = form.querySelector('[data-next]');
  const btnSubmit = form.querySelector('[data-submit]');
  const DRAFT_KEY = `ctsd-draft-${kind}`;
  let current = 0;
  let busy = false;
  let sent = false; // stored, and the page stays to show the logo note
  let designSlug = '';
  let uploaded = null; // { file, path } once a logo PUT has succeeded

  // ---- Render option cards from the enums ---------------------------------
  form.querySelectorAll('[data-choices]').forEach((fs) => {
    const field = fs.dataset.choices;
    const type = field === 'needs' ? 'checkbox' : 'radio';
    const variant = fs.dataset.variant || 'card';
    const html = OPTIONS[field].map((v) => {
      const lab = LABELS[field][v];
      const id = `${field}-${v ? v.replace(/[^a-z0-9]+/gi, '-') : 'none'}`;
      const icon = fs.hasAttribute('data-icons') && ICONS[v] ? ICONS[v] : '';
      const swatch = variant === 'style' ? `<span class="swatch swatch--${esc(v)}" aria-hidden="true"><i></i><i></i><i></i></span>` : '';
      const desc = lab.desc && variant !== 'pill' ? `<span class="choice__desc" id="${id}-d">${esc(lab.desc)}</span>` : '';
      return `<label class="choice choice--${variant}">`
        + `<input class="choice__input" type="${type}" name="${field}" id="${id}" value="${esc(v)}" aria-labelledby="${id}-t"${desc ? ` aria-describedby="${id}-d"` : ''}>`
        + `<span class="choice__body">${swatch}${icon}<span class="choice__title" id="${id}-t">${esc(lab.title)}</span>${desc}`
        + '<span class="choice__mark" aria-hidden="true"></span></span></label>';
    }).join('');
    fs.insertAdjacentHTML('beforeend', `<div class="choices__grid choices__grid--${variant}">${html}</div>`);
  });

  // ---- Field access ---------------------------------------------------------
  const inputs = (field) => [...form.querySelectorAll(`[name="${field}"]`)];
  const allFields = steps.flatMap((s) => s.fields);

  function getValue(field) {
    const els = inputs(field);
    if (!els.length) return undefined;
    if (els[0].type === 'checkbox') return els.filter((e) => e.checked).map((e) => e.value);
    if (els[0].type === 'radio') { const c = els.find((e) => e.checked); return c ? c.value : ''; }
    return els[0].value;
  }

  function setValue(field, v) {
    const els = inputs(field);
    if (!els.length) return;
    if (els[0].type === 'checkbox') els.forEach((e) => { e.checked = Array.isArray(v) && v.includes(e.value); });
    else if (els[0].type === 'radio') els.forEach((e) => { e.checked = e.value === v; });
    else if (els[0].type !== 'file') els[0].value = v;
  }

  function collect() {
    const data = { kind };
    for (const f of allFields) data[f] = getValue(f);
    if (designSlug) data.design_slug = designSlug;
    return data;
  }

  // ---- Errors ------------------------------------------------------------------
  function errEl(field) { return form.querySelector(`#err-${field}`); }

  function setFieldError(field, message) {
    const el = errEl(field);
    if (el) { el.textContent = message || ''; el.hidden = !message; }
    const errId = `err-${field}`;
    const targets = field === 'logo' ? [form.querySelector('#logo')] : inputs(field);
    targets.filter(Boolean).forEach((input) => {
      const ids = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== errId);
      if (message) ids.push(errId);
      if (ids.length) input.setAttribute('aria-describedby', ids.join(' '));
      else input.removeAttribute('aria-describedby');
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
    form.querySelector(`[data-field="${field}"]`)?.classList.toggle('is-invalid', !!message);
  }

  // Shows errors for `fields`; returns the first invalid field name or null.
  function showErrors(errors, fields) {
    let first = null;
    for (const f of fields) {
      setFieldError(f, errors[f]);
      if (errors[f] && !first) first = f;
    }
    return first;
  }

  function focusField(field) {
    const els = field === 'logo' ? [form.querySelector('#logo')] : inputs(field);
    const target = els.find((e) => e && e.checked) || els[0];
    if (target) target.focus();
  }

  function say(html, tone = 'error') {
    // The live region stays rendered (empty when unused) so it is announced reliably.
    status.innerHTML = html ? `<p class="form-status__msg form-status__msg--${tone}">${html}</p>` : '';
  }

  const mailHref = () => fallbackHref(form.dataset.fallback, form.dataset.fallbackSubject || 'Project inquiry', collect());

  function captchaMessage() {
    const href = mailHref();
    say(esc(MSG.captcha) + (href
      ? ` If it keeps failing, <a href="${esc(href)}">email us your details</a> instead. Your answers are still here.`
      : ' Your answers are still here.'));
  }

  function fallbackMessage(text) {
    const href = mailHref();
    const link = href
      ? ` Your answers are still here. Please try again in a moment, or <a href="${esc(href)}">email us your details</a> instead.`
      : ' Your answers are still here. Please try again in a moment.';
    say(esc(text) + link);
  }

  // ---- Steps (project) ---------------------------------------------------------------
  function render(focus) {
    stepEls.forEach((el, i) => { el.hidden = i !== current; });
    if (kind !== 'project') return;
    const last = current === steps.length - 1;
    btnBack.hidden = current === 0;
    btnNext.hidden = last;
    btnSubmit.hidden = !last;
    const label = form.querySelector('[data-progress-label]');
    label.innerHTML = `Step ${current + 1} of ${steps.length} <span class="progress__name">${esc(steps[current].name)}</span>`;
    form.querySelector('[data-progress-fill]').style.transform = `scaleX(${(current + 1) / steps.length})`;
    if (last) turnstileWidget.ensure();
    if (focus) {
      const h = stepEls[current].querySelector('h2');
      h.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) {
        form.scrollIntoView({ block: 'start', behavior: REDUCED.matches ? 'auto' : 'smooth' });
      }
    }
  }

  function goTo(i, focus = true) {
    current = Math.max(0, Math.min(steps.length - 1, i));
    render(focus);
    saveDraft();
  }

  function checkStep(i) {
    const errors = stepErrors(collect(), steps[i].fields);
    const first = showErrors(errors, steps[i].fields);
    if (first) {
      say(esc(Object.values(errors).join(' ')));
      focusField(first);
      return false;
    }
    say('');
    return true;
  }

  // ---- Draft ---------------------------------------------------------------------------
  function saveDraft() {
    const s = storage();
    if (!s) return;
    try {
      const data = collect();
      delete data.kind; delete data.design_slug;
      s.setItem(DRAFT_KEY, JSON.stringify({ ...data, step: current }));
    } catch { /* storage full or blocked: the form still works */ }
  }

  function loadDraft() {
    const s = storage();
    if (!s) return null;
    try { return cleanDraft(JSON.parse(s.getItem(DRAFT_KEY) || 'null')); } catch { return null; }
  }

  function clearDraft() {
    const s = storage();
    try { if (s) s.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  // ---- Turnstile -------------------------------------------------------------------------
  // The page's <script data-turnstile-script> has inline onload/onerror attributes
  // that set window.ctsdTurnstile = 'loaded' | 'failed' at parse time, so a load
  // error that happens before this module runs is not missed.
  const turnstileWidget = (() => {
    const box = form.querySelector('[data-turnstile]');
    const script = document.querySelector('script[data-turnstile-script]');
    let id = null;
    let token = '';
    let issued = false; // a token was issued since the last reset (so it may be spent)
    let errored = false; // the last challenge failed; don't make the visitor wait for nothing
    let failed = !script || window.ctsdTurnstile === 'failed';
    let wanted = kind !== 'project';
    let waiters = [];

    const settle = () => { const w = waiters; waiters = []; w.forEach((fn) => fn()); };

    function renderWidget() {
      if (id !== null || !wanted || !window.turnstile || !box) return;
      try {
        id = window.turnstile.render(box, {
          sitekey: box.dataset.sitekey,
          theme: 'light',
          size: 'flexible',
          appearance: 'interaction-only',
          callback: (t) => { token = t; issued = true; errored = false; settle(); },
          'expired-callback': () => { token = ''; }, // refreshes itself (refresh-expired: auto)
          // Persistent errors (e.g. a wrong site key) must not leave the visitor waiting.
          'error-callback': () => { token = ''; errored = true; settle(); },
          // An interactive challenge was shown but not solved in time: offer it again.
          'timeout-callback': () => {
            token = ''; issued = false; settle();
            try { window.turnstile.reset(id); } catch { /* ignore */ }
          },
        });
      } catch {
        failed = true; settle();
      }
    }

    if (window.turnstile) renderWidget();
    else if (!failed) {
      script.addEventListener('load', renderWidget);
      script.addEventListener('error', () => { failed = true; settle(); });
    }

    return {
      ensure() {
        wanted = true;
        if (window.ctsdTurnstile === 'failed' && !window.turnstile) failed = true;
        renderWidget();
      },
      available() { return !failed; },
      // Resolves with a token, or '' if none arrives in time or the widget errors.
      token(ms = TOKEN_WAIT) {
        this.ensure();
        if (!token && id !== null && window.turnstile) token = window.turnstile.getResponse(id) || '';
        if (token || failed || errored) return Promise.resolve(token);
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            waiters = waiters.filter((w) => w !== done);
            if (!window.turnstile) failed = true; // the script never arrived
            resolve(token);
          }, ms);
          function done() { clearTimeout(timer); resolve(token); }
          waiters.push(done);
        });
      },
      // Tokens are single-use: once one was issued (and possibly spent), ask for a
      // fresh one. Never reset a challenge that has not produced a token yet; that
      // would wipe an interactive check the visitor may be solving.
      reset() {
        if (!issued) return;
        token = ''; issued = false;
        if (id !== null && window.turnstile) { try { window.turnstile.reset(id); } catch { /* ignore */ } }
      },
    };
  })();

  // ---- Network -------------------------------------------------------------------------------
  async function postJson(url, body) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'same-origin',
      });
    } catch {
      return { status: 0, data: null };
    }
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON */ }
    return { status: res.status, data };
  }

  // Returns true when handled as success; otherwise shows the right message.
  function handleFailure(res, fieldMap) {
    turnstileWidget.reset();
    if (res.status === 403 && res.data && res.data.error === 'captcha') {
      captchaMessage();
      return;
    }
    if (res.status === 400 && res.data && res.data.errors) {
      const errors = fieldMap ? fieldMap(res.data.errors) : res.data.errors;
      const idx = firstErrorStep(errors, steps);
      if (idx !== -1) {
        if (idx !== current) goTo(idx, false);
        const first = showErrors(errors, steps[idx].fields);
        say(esc(MSG.check));
        if (first) focusField(first);
        return;
      }
      if (errors.logo) {
        setFieldError('logo', errors.logo);
        say(esc(MSG.check));
        focusField('logo');
        return;
      }
    }
    fallbackMessage(MSG.failed);
  }

  function setBusy(on) {
    busy = on;
    const btn = btnSubmit;
    btn.disabled = on;
    if (on) btn.setAttribute('aria-busy', 'true');
    else btn.removeAttribute('aria-busy');
    btn.classList.toggle('is-busy', on);
    if (btnBack) btnBack.disabled = on;
  }

  async function uploadLogo(file, type) {
    if (uploaded && uploaded.file === file) return { ok: true, path: uploaded.path };
    const tok = await turnstileWidget.token();
    if (!tok) return { ok: false, noToken: true };
    const res = await postJson('/api/upload-url', { filename: file.name, type, size: file.size, turnstile: tok });
    if (res.status !== 200 || !res.data || !res.data.ok || !res.data.uploadUrl) {
      // 400 (type/size) and 403 (captcha) are the visitor's to fix; anything else is ours.
      const fixable = (res.status === 400 && !!res.data && !!res.data.errors) || res.status === 403;
      return { ok: false, res, fixable };
    }
    // The upload-url call used the token, so the lead call needs a fresh one.
    turnstileWidget.reset();
    try {
      // An ArrayBuffer body (not the File) so every engine sends plain bytes.
      const bytes = await file.arrayBuffer();
      const put = await fetch(res.data.uploadUrl, { method: 'PUT', headers: { 'content-type': type }, body: bytes });
      if (!put.ok) return { ok: false, res: { status: 502, data: null } };
    } catch {
      return { ok: false, res: { status: 0, data: null } };
    }
    uploaded = { file, path: res.data.path };
    return { ok: true, path: res.data.path };
  }

  async function send() {
    if (busy || sent) return;
    const data = collect();
    const result = validateLead(data);
    if (!result.ok) {
      const idx = firstErrorStep(result.errors, steps);
      if (idx !== -1) {
        if (idx !== current) goTo(idx, false);
        const first = showErrors(result.errors, steps[idx].fields);
        say(esc(kind === 'project' ? Object.values(stepErrors(data, steps[idx].fields)).join(' ') : MSG.check));
        focusField(first);
        return;
      }
      fallbackMessage(MSG.failed);
      return;
    }
    if (!turnstileWidget.available()) {
      fallbackMessage(MSG.noTurnstile);
      return;
    }

    setBusy(true);
    say('Sending…', 'info');
    let leaving = false;
    let logoFailed = false;
    try {
      const payload = { ...result.value };
      if (Array.isArray(payload.needs) && !payload.needs.length) delete payload.needs;

      const logoInput = form.querySelector('#logo');
      const file = logoInput && logoInput.files && logoInput.files[0];
      if (file) {
        const check = checkLogo(file);
        if (!check.ok) { setFieldError('logo', check.error); say(esc(MSG.check)); focusField('logo'); return; }
        const up = await uploadLogo(file, check.type);
        if (up.ok) payload.logo_path = up.path;
        else if (up.noToken) { noTokenMessage(); return; }
        else if (up.fixable) {
          handleFailure(up.res, (errs) => ({ logo: errs.type || errs.size || errs.logo }));
          return;
        } else {
          // The logo is optional: a storage problem must not lose the request.
          logoFailed = true;
          turnstileWidget.reset();
        }
      }

      const tok = await turnstileWidget.token();
      if (!tok) { noTokenMessage(); return; }
      const hp = form.querySelector('[name="website_hp"]');
      const res = await postJson('/api/lead', { ...payload, turnstile: tok, website_hp: hp ? hp.value : '' });
      if (res.status === 200 && res.data && res.data.ok) {
        clearDraft();
        if (logoFailed) {
          // Stay on the page so the visitor can read the note and use the email link.
          sent = true;
          const href = fallbackHref(form.dataset.fallback, 'Logo for my mockup request',
            { org_name: payload.org_name, name: payload.name, email: payload.email });
          say(`${esc(MSG.logoFailed)}${href ? ` You can <a href="${esc(href)}">email it to us</a>.` : ''} `
            + `<a class="form-status__next" href="/thanks?kind=${kind}">Continue</a>`, 'info');
          const msg = status.querySelector('.form-status__msg');
          msg.tabIndex = -1;
          msg.focus();
          return;
        }
        say('Sent. Taking you to the next page…', 'info');
        leaving = true; // stay busy: the page is leaving
        window.location.assign(`/thanks?kind=${kind}`);
        return;
      }
      handleFailure(res);
    } catch {
      handleFailure({ status: 0, data: null });
    } finally {
      if (!leaving) setBusy(false);
      if (sent) btnSubmit.disabled = true;
    }
  }

  function noTokenMessage() {
    fallbackMessage(turnstileWidget.available() ? MSG.noToken : MSG.noTurnstile);
  }

  // ---- Wiring ------------------------------------------------------------------------------
  function advance() {
    if (busy) return;
    if (kind === 'project' && current < steps.length - 1) {
      if (checkStep(current)) goTo(current + 1);
      return;
    }
    send();
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });

  // Enter in a single-line field or on an option card moves on (never in a textarea).
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    const t = e.target;
    if (t.tagName === 'INPUT' && !['file', 'button', 'submit', 'reset'].includes(t.type)) {
      e.preventDefault();
      advance();
    }
  });

  btnBack?.addEventListener('click', () => {
    if (busy) return;
    say('');
    goTo(current - 1);
  });

  // Clear a field's error as soon as it becomes valid; never add errors while typing.
  function onEdit(e) {
    const field = e.target.name;
    if (field && allFields.includes(field) && errEl(field) && !errEl(field).hidden) {
      const errs = stepErrors(collect(), [field]);
      if (!errs[field]) setFieldError(field, '');
    }
    saveDraft();
  }
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);

  // ---- Logo (mockup) --------------------------------------------------------------------------
  const logo = form.querySelector('#logo');
  if (logo) {
    const preview = form.querySelector('[data-logo-preview]');
    const showFile = (file) => {
      preview.hidden = !file;
      if (!file) return;
      preview.querySelector('[data-logo-name]').textContent = file.name;
      const kb = file.size / 1024;
      preview.querySelector('[data-logo-size]').textContent = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
    };
    logo.addEventListener('change', () => {
      const file = logo.files && logo.files[0];
      if (!file) { setFieldError('logo', ''); showFile(null); return; }
      const check = checkLogo(file);
      if (!check.ok) {
        logo.value = '';
        showFile(null);
        setFieldError('logo', check.error);
        return;
      }
      setFieldError('logo', '');
      showFile(file);
    });
    preview.querySelector('[data-logo-remove]').addEventListener('click', () => {
      logo.value = '';
      uploaded = null;
      showFile(null);
      setFieldError('logo', '');
      logo.focus();
    });
  }

  // ---- Design chip (?design=slug) ----------------------------------------------------------------
  async function loadDesign() {
    const slug = new URLSearchParams(window.location.search).get('design');
    const chip = form.querySelector('[data-design-chip]');
    if (!slug || !chip || !/^[a-z0-9-]{1,60}$/.test(slug)) return;
    try {
      const res = await fetch('/data/designs.json');
      const json = await res.json();
      const design = findDesign(Array.isArray(json) ? json : json.designs || [], slug);
      if (!design) return;
      designSlug = design.slug;
      chip.querySelector('[data-design-name]').textContent = design.name;
      chip.hidden = false;
      chip.querySelector('[data-design-remove]').addEventListener('click', () => {
        designSlug = '';
        chip.hidden = true;
        (stepEls[current].querySelector('h2') || form.querySelector('h2'))?.focus();
      });
    } catch { /* the chip is only a hint */ }
  }

  // ---- Start --------------------------------------------------------------------------------------
  const draft = loadDraft();
  if (draft) {
    for (const f of allFields) if (draft[f] !== undefined) setValue(f, draft[f]);
  }
  if (kind === 'project') {
    // Resume at the saved step, but never past a step that is still incomplete.
    let resume = draft && Number.isInteger(draft.step) ? Math.min(draft.step, steps.length - 1) : 0;
    for (let i = 0; i < resume; i++) {
      if (Object.keys(stepErrors(collect(), steps[i].fields)).length) { resume = i; break; }
    }
    current = resume;
  }
  render(false);
  // Back from /thanks through the bfcache restores the page as it was left: busy.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && !sent) { setBusy(false); say(''); }
  });

  loadDesign().finally(() => { form.dataset.ready = 'true'; });
}

const formEl = document.querySelector('form[data-form]');
if (formEl) init(formEl);
