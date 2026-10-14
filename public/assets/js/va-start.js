// Virtual Assistant sign-up form: validates with the shared schema, uploads the menu privately, saves the
// sign-up, then sends the restaurant to the Stripe Payment Link (or the welcome page) the server names.
import { validateSignup, DAYS, MENU_TYPES, MAX_MENU } from './va-schema.js';
import { track, trackCallLinks } from './va-track.js';

trackCallLinks();
const form = document.getElementById('va-form');
const status = document.getElementById('va-status');
const FALLBACK = form.dataset.fallback || '';
const ORDER = ['restaurant', 'owner_name', 'mobile', 'email', 'address', 'current_phone', 'hours', 'menu', 'reservations', 'party_max', 'booking_system', 'pickup', 'ready_time', 'transfer_phone', 'plan', 'answer_mode', 'assistant_name', 'notes', 'consent'];

const field = (name) => form.elements[name];
const radio = (name) => form.querySelector(`[name="${name}"]:checked`)?.value || '';
const val = (name) => (field(name)?.value || '').trim();

// Preselect a plan from the pricing page (?plan=payg).
const asked = new URLSearchParams(location.search).get('plan');
if (['monthly', 'payg', 'cap'].includes(asked)) form.querySelector(`[name="plan"][value="${asked}"]`).checked = true;

// Follow-up questions appear only when they apply.
function syncExtras() {
  document.getElementById('res-extra').hidden = radio('reservations') !== 'yes';
  document.getElementById('pickup-extra').hidden = radio('pickup') !== 'yes';
}
form.addEventListener('change', syncExtras);
syncExtras();

let started = false;
form.addEventListener('input', () => { if (!started) { started = true; track('form_start'); } });

function collect() {
  const hours = Object.fromEntries(DAYS.map(([k]) => [k, val(`hours_${k}`)]));
  return {
    restaurant: val('restaurant'), owner_name: val('owner_name'), mobile: val('mobile'), email: val('email'),
    address: val('address'), current_phone: val('current_phone'), hours, menu_link: val('menu_link'),
    reservations: radio('reservations'), party_max: val('party_max'), booking_system: val('booking_system'),
    pickup: radio('pickup'), ready_time: val('ready_time'), transfer_phone: val('transfer_phone'),
    plan: radio('plan'), answer_mode: radio('answer_mode'), assistant_name: val('assistant_name'), notes: val('notes'),
    consent: field('consent').checked, website_hp: val('website_hp'),
  };
}

function showErrors(errors) {
  form.querySelectorAll('.field__error').forEach((p) => { p.hidden = true; p.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  let first = null;
  for (const key of ORDER) {
    if (!errors[key]) continue;
    const p = document.getElementById(`err-${key}`);
    if (p) { p.textContent = errors[key]; p.hidden = false; }
    const group = form.querySelector(`[data-field="${key}"]`);
    const inputs = group ? [...group.querySelectorAll('input, select, textarea')] : [];
    inputs.forEach((el) => el.setAttribute('aria-invalid', 'true'));
    first ||= inputs.find((el) => el.type !== 'radio' || el.checked) || inputs[0];
  }
  if (first) first.focus();
}

function say(text, error = false) {
  status.textContent = text;
  status.classList.toggle('is-error', error);
}

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { res, data };
}

async function uploadMenu(file) {
  const { res, data } = await postJson('/api/va-upload-url', { type: file.type, size: file.size, filename: file.name });
  if (!res.ok || !data?.ok) throw new Error(data?.errors ? Object.values(data.errors)[0] : 'upload');
  const put = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
  if (!put.ok) throw new Error('upload');
  return data.path;
}

const fallbackText = () => (FALLBACK ? ` You can also email your details to ${FALLBACK}.` : '');
let busy = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy) return;
  const data = collect();
  const file = field('menu_file').files[0] || null;

  // A chosen file counts as the menu for the first check; it is uploaded only once everything else is right.
  const errors = { ...(validateSignup({ ...data, menu_path: file ? '00000000-0000-0000-0000-000000000000-menu.pdf' : '' }).errors || {}) };
  if (file && !MENU_TYPES.includes(file.type)) errors.menu = 'Please upload your menu as a PDF, JPG or PNG.';
  else if (file && file.size > MAX_MENU) errors.menu = 'The menu file must be 10 MB or smaller.';
  if (Object.keys(errors).length) { say('Please check the highlighted fields.', true); showErrors(errors); return; }
  showErrors({});

  busy = true;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  let stage = 'upload';
  try {
    if (file) { say('Uploading your menu…'); data.menu_path = await uploadMenu(file); }
    stage = 'send';
    say('Sending your sign-up…');
    const { res, data: out } = await postJson('/api/va-signup', data);
    if (res.status === 400 && out?.errors) { say('Please check the highlighted fields.', true); showErrors(out.errors); return; }
    if (!res.ok || !out?.ok) throw new Error('server');
    track('signup_complete');
    say('Done. Taking you to the next step…');
    location.assign(out.next || '/virtual-assistant/welcome');
  } catch (err) {
    const upload = stage === 'upload';
    say(upload ? `Your menu didn't upload. Try again, or paste a link to your menu instead.${fallbackText()}` : `Something went wrong on our side and your sign-up wasn't sent. Please try again.${fallbackText()}`, true);
  } finally {
    busy = false; button.disabled = false;
  }
});
