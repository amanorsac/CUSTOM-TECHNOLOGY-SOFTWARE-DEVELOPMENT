// Lead emails, sent through Resend (same fetch pattern as amanorsac.studio).
// Every interpolated value in HTML goes through escapeHtml; subjects lose
// CR/LF; the text versions contain no HTML.

export const TIMEOUT_MS = 8000;
const RESEND_URL = 'https://api.resend.com/emails';
export const DEFAULT_FROM = 'CTSD Leads <onboarding@resend.dev>';

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

// Header-safe single line: no CR/LF (or other control characters).
export function cleanSubject(s) {
  return String(s ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 200);
}

const FIELDS = [
  ['kind', 'Request'],
  ['org_name', 'Organization'],
  ['org_type', 'Type'],
  ['needs', 'Needs'],
  ['website', 'Website'],
  ['tools', 'Current tools'],
  ['timeline', 'Timeline'],
  ['budget', 'Budget'],
  ['style', 'Style'],
  ['design_slug', 'Inspired by design'],
  ['logo_path', 'Logo (storage path)'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['contact_pref', 'Preferred contact'],
  ['message', 'Message'],
];

function rows(lead) {
  return FIELDS
    .map(([key, label]) => {
      const v = lead[key];
      const shown = Array.isArray(v) ? v.join(', ') : v;
      return shown ? [label, String(shown)] : null;
    })
    .filter(Boolean);
}

export function ownerEmail(lead) {
  const subject = cleanSubject(`New lead: ${lead.kind} — ${lead.org_type} — ${lead.org_name || lead.name}`);
  const list = rows(lead);

  const html = '<div style="font-family:Arial,sans-serif;color:#1A1A1A;max-width:640px">'
    + `<h2 style="color:#0F1B2D;margin:0 0 12px">${escapeHtml(subject)}</h2>`
    + '<table cellpadding="6" style="border-collapse:collapse">'
    + list.map(([label, v]) => '<tr>'
      + `<th align="left" valign="top" style="color:#1F3A5F;white-space:nowrap">${escapeHtml(label)}</th>`
      + `<td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`).join('')
    + '</table>'
    + '<p style="color:#1F3A5F;font-size:13px">Reply to this email to answer the visitor directly.</p>'
    + '</div>';

  const text = `${subject}\n\n`
    + list.map(([label, v]) => `${label}: ${v}`).join('\n')
    + '\n\nReply to this email to answer the visitor directly.\n';

  return { subject, html, text };
}

// Deliberately contains no visitor-supplied content: the visitor's address is
// unverified, so echoing their text would let anyone send arbitrary copy to
// any inbox through us.
export function visitorEmail(lead) {
  const isMockup = lead.kind === 'mockup';
  const subject = isMockup ? 'We received your free mockup request' : 'We received your project request';
  const what = isMockup ? 'free homepage mockup request' : 'project request';
  const lines = [
    'Hello,',
    `Thank you for your ${what}. It reached us, and we will reply personally soon.`,
    'If you need to add anything, just reply to this email.',
    'Custom Technology & Software Development',
  ];
  const html = '<div style="font-family:Arial,sans-serif;color:#1A1A1A;max-width:560px">'
    + lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('')
    + '</div>';
  const text = lines.join('\n\n') + '\n';
  return { subject, html, text };
}

// Sends one email. Never throws; returns true on a 2xx from Resend and logs
// anything else (status and error name only, never the API key or body).
export async function sendEmail(env, { from, to, reply_to, subject, html, text }, label = 'email') {
  if (!env.RESEND_API_KEY) {
    console.error(`[lead] ${label} not sent: RESEND_API_KEY is not set`);
    return false;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + env.RESEND_API_KEY },
      body: JSON.stringify({ from, to: [to], reply_to, subject: cleanSubject(subject), html, text }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // Only the Resend error name: its message can quote the recipient address.
      let name = '';
      try {
        const data = await res.json();
        if (data && typeof data.name === 'string') name = data.name.replace(/[^\w.-]/g, '').slice(0, 60);
      } catch { /* not JSON */ }
      console.error(`[lead] ${label} failed: Resend ${res.status}${name ? ` ${name}` : ''}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[lead] ${label} failed: ${e && e.message}`);
    return false;
  }
}
