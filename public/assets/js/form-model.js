// Pure data and helpers for the Start a Project and Free Mockup forms.
// No DOM here, so it is unit tested in Node. Option values come straight
// from lead-schema.js; this file only adds human labels.
import {
  validateLead, ORG_TYPES, NEEDS, TIMELINES, BUDGETS, STYLES, CONTACT_PREFS,
} from './lead-schema.js';

export const OPTIONS = {
  org_type: ORG_TYPES,
  needs: NEEDS,
  timeline: TIMELINES,
  budget: BUDGETS,
  style: STYLES,
  contact_pref: CONTACT_PREFS,
};

const L = (title, desc) => (desc ? { title, desc } : { title });

export const LABELS = {
  org_type: {
    business: L('Business', 'Firms, shops and service providers'),
    church: L('Church', 'Congregations, ministries and multi-campus churches'),
    school: L('School', 'Private schools, academies and training programs'),
    nonprofit: L('Nonprofit', 'Charities, foundations and community groups'),
    other: L('Other', 'Something else. Tell us about it later.'),
  },
  needs: {
    website: L('Website', 'A fast, modern site you can update yourself'),
    app: L('Mobile App', 'iOS and Android apps for your people'),
    portal: L('Client/Member Portal', 'A private place to sign in and manage things'),
    crm: L('CRM', 'Contacts, history and follow-ups in one place'),
    'crm-integration': L('CRM Integration', 'Connect the tools you already use'),
    booking: L('Booking', 'Appointments, classes, rooms or events'),
    payments: L('Payments/Giving', 'Online payments, donations and invoices'),
    automation: L('Automation', 'Reminders and workflows that run themselves'),
    'not-sure': L('Not sure', 'We will help you work out what fits'),
  },
  timeline: {
    asap: L('As soon as possible'),
    '1-3m': L('1–3 months'),
    '3-6m': L('3–6 months'),
    exploring: L('Just exploring'),
  },
  budget: {
    '<5k': L('Under $5K'),
    '5-15k': L('$5K–$15K'),
    '15-50k': L('$15K–$50K'),
    '50k+': L('$50K+'),
    'not-sure': L('Not sure'),
    '': L('Prefer not to say'),
  },
  style: {
    modern: L('Modern', 'Clean lines, generous space'),
    classic: L('Classic', 'Timeless, warm and trusted'),
    bold: L('Bold', 'Strong color and big type'),
    minimal: L('Minimal', 'Quiet, simple and focused'),
  },
  contact_pref: {
    email: L('Email'),
    phone: L('Phone'),
    either: L('Either is fine'),
  },
};

export const PROJECT_STEPS = [
  { id: 'org', name: 'Organization', fields: ['org_type'] },
  { id: 'needs', name: 'What you need', fields: ['needs'] },
  { id: 'about', name: 'About you', fields: ['org_name', 'website', 'tools'] },
  { id: 'timeline', name: 'Timeline', fields: ['timeline', 'budget'] },
  { id: 'contact', name: 'Contact', fields: ['name', 'email', 'phone', 'contact_pref', 'message'] },
];

export const MOCKUP_FIELDS = ['org_name', 'org_type', 'website', 'style', 'name', 'email'];

// Same limits as the Worker's /api/upload-url (src/routes/lead.js); a unit test keeps them equal.
export const MAX_LOGO = 5_242_880;
export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const EXT_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };

export function checkLogo(file) {
  const ext = String((file && file.name) || '').split('.').pop().toLowerCase();
  const type = file && file.type ? file.type : EXT_TYPES[ext] || '';
  if (!LOGO_TYPES.includes(type)) return { ok: false, error: 'Logo must be a PNG, JPG or SVG file' };
  if (!(file.size > 0)) return { ok: false, error: 'That file looks empty. Please choose another.' };
  if (file.size > MAX_LOGO) return { ok: false, error: 'Logo must be 5MB or smaller' };
  return { ok: true, type };
}

// The shared validator's errors, limited to `fields`.
export function stepErrors(data, fields) {
  const res = validateLead(data);
  if (res.ok) return {};
  const out = {};
  for (const f of fields) if (res.errors[f]) out[f] = res.errors[f];
  return out;
}

export function firstErrorStep(errors, steps) {
  return steps.findIndex((s) => s.fields.some((f) => errors && errors[f]));
}

const SUMMARY = [
  ['org_type', 'Organization type'], ['needs', 'What you need'], ['org_name', 'Organization'],
  ['website', 'Website'], ['tools', 'Current tools'], ['timeline', 'Timeline'], ['budget', 'Budget'],
  ['style', 'Style'], ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'],
  ['contact_pref', 'Preferred contact'], ['message', 'Message'],
];

const label = (field, v) => (LABELS[field] && LABELS[field][v] ? LABELS[field][v].title : v);

// mailto: link that carries what the visitor typed, so nothing is retyped.
export function fallbackHref(address, subject, data) {
  if (!address) return null;
  const lines = [];
  for (const [field, name] of SUMMARY) {
    const v = data && data[field];
    if (Array.isArray(v) ? !v.length : !v) continue;
    const text = Array.isArray(v) ? v.map((x) => label(field, x)).join(', ') : label(field, String(v));
    lines.push(`${name}: ${text}`);
  }
  let body = lines.join('\n');
  if (body.length > 1200) body = `${body.slice(0, 1200)}…`;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const DRAFT_FIELDS = new Set(['org_type', 'needs', 'org_name', 'website', 'tools', 'timeline', 'budget',
  'style', 'name', 'email', 'phone', 'contact_pref', 'message']);

// Keeps a stored draft to known fields only (never the honeypot or a token).
export function cleanDraft(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'step' && Number.isInteger(v) && v >= 0 && v < 10) out.step = v;
    else if (!DRAFT_FIELDS.has(k)) continue;
    else if (typeof v === 'string') out[k] = v.slice(0, 4000);
    else if (Array.isArray(v)) out[k] = v.filter((x) => typeof x === 'string');
  }
  return out;
}
