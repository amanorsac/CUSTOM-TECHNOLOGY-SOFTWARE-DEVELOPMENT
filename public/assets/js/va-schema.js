// Virtual Assistant sign-up validation, shared by the browser form and the Worker. Pure module: no DOM.
// validateSignup(input) -> { ok: true, value } | { ok: false, errors }
//   value holds only known fields, trimmed, ready to insert into va_signups.
//   errors maps field name -> a message a restaurant owner understands.

export const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']];
export const BOOKING_SYSTEMS = ['OpenTable', 'Resy', 'None', 'Other'];
export const PLAN_IDS = ['monthly', 'payg', 'cap'];
export const ANSWER_MODES = ['all', 'missed'];
export const MENU_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_MENU = 10 * 1024 * 1024;

const LIMITS = { restaurant: 160, owner_name: 120, email: 254, address: 300, phone: 40, hours: 80, menu_link: 500, ready_time: 60, assistant_name: 60, notes: 2000 };
const EMAIL_RE = /^[^\s@<>()[\]",;:\\.][^\s@<>()[\]",;:\\]*@(?:[^\s@<>()[\]",;:\\.]+\.)+[^\s@<>()[\]",;:\\.]{2,}$/;
const URL_RE = /^https?:\/\/\S+$/i;
const MENU_PATH_RE = /^[0-9a-f-]{36}-[a-zA-Z0-9._-]{1,100}$/;
const CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const str = (v) => (typeof v === 'string' ? v.replace(CONTROL_RE, '').trim() : typeof v === 'number' ? String(v) : '');

export function validateSignup(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: { form: 'Please fill in the form.' } };
  const errors = {};
  const value = {};

  const text = (field, label, { required = true, max = LIMITS[field] } = {}) => {
    const v = str(input[field]);
    if (!v) { if (required) errors[field] = `Please enter ${label}.`; return; }
    if (v.length > max) { errors[field] = `Please keep this under ${max} characters.`; return; }
    value[field] = v;
  };
  const phone = (field, label) => {
    const v = str(input[field]);
    const digits = v.replace(/\D/g, '');
    if (!v) errors[field] = `Please enter ${label}.`;
    else if (v.length > LIMITS.phone || digits.length < 7 || digits.length > 15) errors[field] = `Please enter ${label} with the area code.`;
    else value[field] = v;
  };
  const yesNo = (field, label) => {
    const v = str(input[field]);
    if (v !== 'yes' && v !== 'no') { errors[field] = `Please choose yes or no for ${label}.`; return null; }
    value[field] = v === 'yes';
    return value[field];
  };

  text('restaurant', 'the restaurant name');
  text('owner_name', 'your name');
  phone('mobile', 'your mobile number');
  const email = str(input.email);
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  else value.email = email;
  text('address', 'the restaurant address');
  phone('current_phone', 'the number customers call today');

  // Opening hours: one line per day, at least one day filled in.
  const raw = input.hours && typeof input.hours === 'object' && !Array.isArray(input.hours) ? input.hours : {};
  const hours = {};
  for (const [key] of DAYS) {
    const v = str(raw[key]);
    if (v.length > LIMITS.hours) { errors.hours = 'Please keep each day under 80 characters.'; break; }
    if (v) hours[key] = v;
  }
  if (!errors.hours) { if (Object.keys(hours).length) value.hours = hours; else errors.hours = 'Please enter your opening hours.'; }

  // Menu: an uploaded file or a link.
  const path = str(input.menu_path), link = str(input.menu_link);
  if (path && MENU_PATH_RE.test(path)) value.menu_path = path;
  if (link) {
    if (link.length > LIMITS.menu_link || !URL_RE.test(link)) errors.menu = 'Please enter a full menu link starting with https://';
    else value.menu_link = link;
  }
  if (!value.menu_path && !value.menu_link && !errors.menu) errors.menu = 'Please upload your menu or add a link to it.';

  if (yesNo('reservations', 'reservations')) {
    const party = str(input.party_max);
    if (party) {
      const n = Number(party);
      if (!Number.isInteger(n) || n < 1 || n > 100) errors.party_max = 'Please enter a party size between 1 and 100.';
      else value.party_max = n;
    }
    const sys = str(input.booking_system);
    if (!BOOKING_SYSTEMS.includes(sys)) errors.booking_system = 'Please choose the booking system you use.';
    else value.booking_system = sys;
  }
  if (yesNo('pickup', 'pickup orders')) text('ready_time', 'a typical ready time');

  phone('transfer_phone', 'the number to transfer calls to');

  const plan = str(input.plan);
  if (!PLAN_IDS.includes(plan)) errors.plan = 'Please choose a plan.'; else value.plan = plan;
  const mode = str(input.answer_mode);
  if (!ANSWER_MODES.includes(mode)) errors.answer_mode = 'Please choose which calls she answers.'; else value.answer_mode = mode;

  text('assistant_name', 'an assistant name', { required: false });
  text('notes', 'notes', { required: false });

  if (input.consent !== true) errors.consent = 'Please confirm you agree to calls being answered and recorded by an AI assistant.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value };
}
