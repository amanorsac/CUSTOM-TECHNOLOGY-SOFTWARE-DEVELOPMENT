// Lead validation shared by the browser forms and the Worker.
// Pure ES module: no imports, no DOM, no globals.
//
// validateLead(input) -> { ok: true, value } | { ok: false, errors }
//   value  holds only known fields, trimmed; empty optional fields are omitted;
//          `needs` is always an array. Unknown fields never reach `value`.
//   errors maps field name -> human-readable message.

export const KINDS = ['project', 'mockup'];
export const ORG_TYPES = ['business', 'church', 'school', 'nonprofit', 'other'];
export const NEEDS = ['website', 'app', 'portal', 'crm', 'crm-integration', 'booking', 'payments', 'automation', 'not-sure'];
export const TIMELINES = ['asap', '1-3m', '3-6m', 'exploring'];
export const BUDGETS = ['<5k', '5-15k', '15-50k', '50k+', 'not-sure', ''];
export const STYLES = ['modern', 'classic', 'bold', 'minimal'];
export const CONTACT_PREFS = ['email', 'phone', 'either'];

export const LIMITS = {
  name: 120, org_name: 160, email: 254, message: 4000, website: 300, phone: 40, tools: 500,
};

// No whitespace, commas, quotes, angle brackets or semicolons anywhere, so the
// address can never expand into several recipients or headers downstream.
const EMAIL_RE = /^[^\s@<>()[\]",;:\\]+@[^\s@<>()[\]",;:\\]+\.[^\s@<>()[\]",;:\\.]{2,}$/;
const SLUG_RE = /^[a-z0-9-]{1,60}$/;
const LOGO_RE = /^[0-9a-f-]{36}-[a-zA-Z0-9._-]{1,100}$/;
const URL_RE = /^https?:\/\/\S+$/i;

const INVALID = Symbol('invalid');

// Trimmed string, '' for missing, INVALID for any non-string value.
function str(v) {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') return INVALID;
  return v.trim();
}

export function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: { form: 'Please fill in the form.' } };
  }

  const errors = {};
  const value = {};

  const kind = str(input.kind);
  if (!KINDS.includes(kind)) errors.kind = 'Unknown request type.';
  else value.kind = kind;
  const isMockup = kind === 'mockup';

  // Free text: required flag, max length, error messages.
  function text(field, { required = false, label }) {
    const v = str(input[field]);
    if (v === INVALID) { errors[field] = `${label} is not valid.`; return; }
    if (!v) { if (required) errors[field] = `Please enter ${label.toLowerCase()}.`; return; }
    if (v.length > LIMITS[field]) { errors[field] = `${label} must be ${LIMITS[field]} characters or fewer.`; return; }
    value[field] = v;
  }

  // One of a fixed list. '' counts as "not given" unless the list allows it.
  function choice(field, allowed, { required = false, label }) {
    const v = str(input[field]);
    if (v === INVALID || (v && !allowed.includes(v))) { errors[field] = `Please choose a valid ${label}.`; return; }
    if (!v) { if (required) errors[field] = `Please choose ${label}.`; return; }
    value[field] = v;
  }

  // Contact
  text('name', { required: true, label: 'Your name' });

  const email = str(input.email);
  if (email === INVALID || (email && (email.length > LIMITS.email || !EMAIL_RE.test(email)))) {
    errors.email = 'Please enter a valid email address.';
  } else if (!email) {
    errors.email = 'Please enter your email address.';
  } else {
    value.email = email;
  }

  text('phone', { label: 'Phone' });
  choice('contact_pref', CONTACT_PREFS, { label: 'contact method' });
  text('message', { label: 'Message' });

  // Organization
  text('org_name', { required: isMockup, label: 'Organization name' });
  choice('org_type', ORG_TYPES, { required: true, label: 'organization type' });

  const website = str(input.website);
  if (website === INVALID || (website && (website.length > LIMITS.website || !URL_RE.test(website)))) {
    errors.website = 'Please enter a full web address starting with http:// or https://.';
  } else if (website) {
    value.website = website;
  }

  text('tools', { label: 'Current tools' });

  // Needs: a subset of NEEDS; at least one for a project.
  const rawNeeds = input.needs === undefined || input.needs === null ? [] : input.needs;
  if (!Array.isArray(rawNeeds) || rawNeeds.some((n) => typeof n !== 'string' || !NEEDS.includes(n.trim()))) {
    errors.needs = 'Please choose from the listed options.';
  } else {
    const needs = [...new Set(rawNeeds.map((n) => n.trim()))];
    if (kind === 'project' && needs.length === 0) errors.needs = 'Please choose at least one thing you need.';
    else value.needs = needs;
  }

  choice('timeline', TIMELINES, { label: 'timeline' });
  // Budget allows '' (prefer not to say); stored as absent.
  choice('budget', BUDGETS, { label: 'budget range' });

  // Mockup-only fields are ignored on project leads.
  if (isMockup) {
    choice('style', STYLES, { required: true, label: 'a style' });
    const logo = str(input.logo_path);
    if (typeof logo === 'string' && LOGO_RE.test(logo)) value.logo_path = logo;
  }

  // Invalid slugs are dropped, not rejected: it is only a hint.
  const slug = str(input.design_slug);
  if (typeof slug === 'string' && SLUG_RE.test(slug)) value.design_slug = slug;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value };
}
