// Book and Contact forms. bookingPayload / contactPayload are pure (unit tested
// in Node); initForms(root) wires the DOM and is idempotent, so it is safe to
// call on load and after every client-side page swap.
import { validateLead } from '../../../js/lead-schema.js';
import { fallbackHref } from '../../../js/form-model.js';

const MAIL = 'amanorsac@gmail.com';
const SLUG = 'kingsley';

const ORG = {
  Church: 'church',
  'Campus or school': 'school',
  'Ministry or nonprofit': 'nonprofit',
  Corporate: 'business',
  Other: 'other',
};

// Message lines, in order: [field key, label].
const LINES = [
  ['event', 'Event name'],
  ['date', 'Event date'],
  ['time', 'Start time'],
  ['length', 'Length of ministration'],
  ['host', 'Host pastor or minister'],
  ['others', 'Other ministers'],
  ['venue', 'Venue and city'],
  ['country', 'Country'],
  ['notes', 'Notes'],
];

const s = (v) => String(v ?? '').trim();

export function bookingPayload(f) {
  const message = LINES.map(([k, label]) => (s(f[k]) ? `${label}: ${s(f[k])}` : ''))
    .filter(Boolean)
    .join('\n');
  const org = s(f.orgType);
  return {
    kind: 'booking',
    design_slug: SLUG,
    org_type: ORG[org] || (Object.values(ORG).includes(org) ? org : ''),
    org_name: s(f.orgName),
    name: s(f.name),
    email: s(f.email),
    phone: s(f.phone),
    message,
    website_hp: s(f.website_hp),
  };
}

export function contactPayload(f) {
  return {
    kind: 'contact',
    design_slug: SLUG,
    org_type: 'other',
    name: s(f.name),
    email: s(f.email),
    message: s(f.message),
    website_hp: s(f.website_hp),
  };
}

// Server field name -> form control name.
const CONTROL = { org_type: 'orgType', org_name: 'orgName' };

// Extra required fields the shared validator does not insist on.
const EXTRA = {
  book: [['phone', 'Please enter a phone number.'], ['event', 'Please enter the event name.'],
    ['date', 'Please choose the event date.'], ['venue', 'Please enter the venue and city.'],
    ['country', 'Please enter the country.']],
  contact: [['message', 'Please write a message.']],
};

const CONFIG = {
  book: {
    payload: bookingPayload,
    subject: 'Booking request for Kingsley Anyenor',
    thanks: "Thank you. Kingsley's team will be in touch.",
    order: ['orgType', 'orgName', 'name', 'phone', 'email', 'host', 'event', 'date', 'time', 'length', 'others', 'venue', 'country', 'notes'],
  },
  contact: {
    payload: contactPayload,
    subject: 'Message for Kingsley Anyenor',
    thanks: 'Thank you. Your message is on its way.',
    order: ['name', 'email', 'message'],
  },
};

export function validate(kind, fields) {
  const cfg = CONFIG[kind];
  const res = validateLead(cfg.payload(fields));
  const errors = {};
  if (!res.ok) {
    for (const [k, v] of Object.entries(res.errors)) errors[CONTROL[k] || k] = v;
  }
  for (const [k, msg] of EXTRA[kind]) if (!s(fields[k])) errors[k] = msg;
  if (errors.name && kind === 'book') errors.name = 'Please enter the contact name.';
  if (errors.org_name || errors.orgName) errors.orgName = 'Please enter the organisation name.';
  if (errors.orgType) errors.orgType = 'Please choose the organiser type.';
  // Phone is optional in the shared schema, so only the length error can come from it.
  return errors;
}

const done = new WeakSet();

function read(form) {
  const out = {};
  for (const el of form.elements) if (el.name) out[el.name] = el.value;
  return out;
}

function setError(form, name, msg) {
  const el = form.querySelector(`[name="${name}"]`);
  const box = form.querySelector(`[data-error-for="${name}"]`);
  if (!el || !box) return;
  box.textContent = msg || '';
  box.hidden = !msg;
  if (msg) el.setAttribute('aria-invalid', 'true');
  else el.removeAttribute('aria-invalid');
}

function wire(form) {
  const kind = form.dataset.kaForm;
  const cfg = CONFIG[kind];
  if (!cfg) return;
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('button[type="submit"]');
  const idle = button.textContent;
  let busy = false;

  // A fixed message: clears when the visitor edits the field again.
  form.addEventListener('input', (e) => {
    const n = e.target && e.target.name;
    if (n && form.querySelector(`[data-error-for="${n}"]`)) setError(form, n, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    status.replaceChildren();
    const fields = read(form);
    const errors = validate(kind, fields);
    for (const n of cfg.order) setError(form, n, errors[n]);
    const first = cfg.order.find((n) => errors[n]);
    if (first) {
      form.querySelector(`[name="${first}"]`).focus();
      return;
    }

    busy = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    const payload = cfg.payload(fields);
    let ok = false;
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    busy = false;

    if (ok) {
      const thanks = document.createElement('div');
      thanks.className = 'ka-form__done';
      thanks.setAttribute('role', 'status');
      thanks.tabIndex = -1;
      const p = document.createElement('p');
      p.textContent = cfg.thanks;
      thanks.append(p);
      form.replaceWith(thanks);
      thanks.focus();
      return;
    }

    button.disabled = false;
    button.textContent = idle;
    const href = fallbackHref(MAIL, cfg.subject, payload);
    const p = document.createElement('p');
    p.append("Couldn't send right now. Email us instead: ");
    const a = document.createElement('a');
    a.href = href;
    a.textContent = 'Email the team';
    p.append(a, '.');
    status.replaceChildren(p);
  });
}

export function initForms(root = document) {
  if (!root) return;
  for (const form of root.querySelectorAll('form[data-ka-form]')) {
    if (done.has(form)) continue;
    done.add(form);
    form.classList.add('is-ready');
    wire(form);
  }
}
