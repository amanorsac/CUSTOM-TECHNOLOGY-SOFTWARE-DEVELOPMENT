/* CTSD live demo: shared UI helpers (escaping, icons, dates, the org's
   homepage preview and its illustrations). No network, no dependencies. */

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  dashboard: '<rect x="3.5" y="3.5" width="7" height="8.5" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.6"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.6"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.6"/>',
  pages: '<rect x="4.5" y="3" width="15" height="18" rx="2.2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  events: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  people: '<circle cx="9" cy="8.5" r="3.4"/><path d="M3 19.5c.7-3.2 3.1-5 6-5s5.3 1.8 6 5"/><path d="M15.5 5.3a3.4 3.4 0 0 1 0 6.4M17.6 14.8c1.8.6 3 2.2 3.4 4.7"/>',
  inbox: '<path d="M3.5 13.5 6 5h12l2.5 8.5V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18z"/><path d="M3.5 13.5h4.8l1.4 2.6h4.6l1.4-2.6h4.8"/>',
  notify: '<path d="M6 16.5v-5.3a6 6 0 1 1 12 0v5.3l1.6 2H4.4z"/><path d="M10 21h4"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4.5 19.5h3.8L19 8.8 15.2 5 4.5 15.7z"/><path d="M13.5 6.7l3.8 3.8"/>',
  trash: '<path d="M4.5 7h15M10 11v5.5M14 11v5.5M6.5 7l.9 12.2a1.6 1.6 0 0 0 1.6 1.3h6a1.6 1.6 0 0 0 1.6-1.3L17.5 7M9.5 7V4.5h5V7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  pin: '<path d="M12 20.5s-6.5-5.8-6.5-10.8a6.5 6.5 0 0 1 13 0c0 5-6.5 10.8-6.5 10.8z"/><circle cx="12" cy="9.7" r="2.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  send: '<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>',
  up: '<path d="M7 17 17 7M9 7h8v8"/>',
  down: '<path d="M7 7l10 10M17 9v8H9"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
};

export function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

/* ---- Dates: seeds hold local "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM" ---------- */
export function parseDate(s) {
  const [d, t] = String(s || '').split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t ? t.split(':').map(Number) : [0, 0];
  return { date: new Date(y || 2026, (m || 1) - 1, day || 1, hh || 0, mm || 0), hasTime: Boolean(t) };
}
const L = 'en-US';
export const fmt = {
  month: (s) => parseDate(s).date.toLocaleDateString(L, { month: 'short' }),
  day: (s) => String(parseDate(s).date.getDate()),
  weekday: (s) => parseDate(s).date.toLocaleDateString(L, { weekday: 'short' }),
  long: (s) => parseDate(s).date.toLocaleDateString(L, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  short: (s) => parseDate(s).date.toLocaleDateString(L, { month: 'short', day: 'numeric', year: 'numeric' }),
  time: (s) => { const p = parseDate(s); return p.hasTime ? p.date.toLocaleTimeString(L, { hour: 'numeric', minute: '2-digit' }) : 'All day'; },
  stamp: (s) => { const p = parseDate(s); return `${p.date.toLocaleDateString(L, { month: 'short', day: 'numeric' })}, ${p.date.toLocaleTimeString(L, { hour: 'numeric', minute: '2-digit' })}`; },
};
export const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

export function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
export function avatar(name, size = '') {
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `<span class="avatar avatar--${h % 4} ${size}" aria-hidden="true">${esc(initials(name))}</span>`;
}

export function orgBadge(org, cls = '') {
  return `<span class="org-badge ${cls}" style="--org:${esc(org.palette.primary)};--org-accent:${esc(org.palette.accent)}" aria-hidden="true">${esc(org.logoText)}</span>`;
}

/* ---- Hero illustrations (inline SVG, so the preview never has a broken image) */
export const IMAGES = [
  { id: 'sunrise', label: 'Sunrise' },
  { id: 'arches', label: 'Arches' },
  { id: 'grove', label: 'Grove' },
  { id: 'skyline', label: 'Skyline' },
];
let uid = 0;
export function illustration(id) {
  const u = `il${uid++}`;
  const svg = (inner, label) => `<svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${inner}</svg>`;
  switch (id) {
    case 'arches':
      return svg(`<defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D8BF"/><stop offset="1" stop-color="#D9BE98"/></linearGradient><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E7B8"/><stop offset="1" stop-color="#D4AF37"/></linearGradient></defs>
        <rect width="480" height="320" fill="url(#${u}a)"/>
        ${[70, 190, 310].map((x) => `<path d="M${x} 250V120a50 50 0 0 1 100 0v130z" fill="#6B4F32"/><path d="M${x + 10} 250V124a40 40 0 0 1 80 0v126z" fill="url(#${u}b)" opacity=".9"/><path d="M${x + 50} 84v166M${x + 10} 170h80" stroke="#6B4F32" stroke-width="4"/>`).join('')}
        <rect y="250" width="480" height="70" fill="#3E2723"/><rect y="250" width="480" height="6" fill="#2B1B18"/>
        <path d="M0 300h480" stroke="#6B4F32" stroke-width="2" opacity=".6"/>`, 'Illustration: sunlit arched windows');
    case 'grove':
      return svg(`<defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF0E2"/><stop offset="1" stop-color="#D9DFC4"/></linearGradient></defs>
        <rect width="480" height="320" fill="url(#${u}a)"/>
        <circle cx="380" cy="70" r="30" fill="#F2DFA0"/>
        <path d="M0 240c80-30 160-30 240-10s160 20 240-10v100H0z" fill="#8A9A63"/>
        ${[[70, 150, 52], [150, 128, 64], [250, 140, 58], [340, 120, 70], [430, 150, 50]].map(([x, y, r]) => `<rect x="${x - 5}" y="${y + r - 10}" width="10" height="${250 - y - r + 20}" fill="#6B4F32"/><circle cx="${x}" cy="${y}" r="${r}" fill="#556B2F"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .45}" fill="#6E8540" opacity=".8"/>`).join('')}
        <path d="M0 268c90-18 190-18 280 0s150 14 200 4v48H0z" fill="#3E4F21"/>`, 'Illustration: a grove of trees');
    case 'skyline':
      return svg(`<defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89B6B"/><stop offset=".6" stop-color="#E8C9A0"/><stop offset="1" stop-color="#F3E3CB"/></linearGradient></defs>
        <rect width="480" height="320" fill="url(#${u}a)"/>
        <circle cx="120" cy="120" r="44" fill="#F6E7B8" opacity=".85"/>
        ${[[20, 150, 60], [86, 110, 54], [146, 170, 44], [196, 70, 70], [272, 130, 50], [328, 96, 62], [396, 150, 64]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${320 - y}" fill="#3E2723"/>${Array.from({ length: Math.floor((260 - y) / 26) }, (_, i) => `<rect x="${x + 10}" y="${y + 16 + i * 26}" width="${w - 20}" height="6" rx="1" fill="#D4AF37" opacity="${(i + x) % 3 ? .55 : .9}"/>`).join('')}`).join('')}
        <rect y="290" width="480" height="30" fill="#2B1B18"/>`, 'Illustration: a city skyline at dusk');
    default:
      return svg(`<defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3DDBC"/><stop offset="1" stop-color="#E7C08F"/></linearGradient></defs>
        <rect width="480" height="320" fill="url(#${u}a)"/>
        <circle cx="300" cy="170" r="62" fill="#D4AF37" opacity=".9"/><circle cx="300" cy="170" r="92" fill="#D4AF37" opacity=".18"/>
        <path d="M0 210c70-40 150-50 230-20s170 30 250-10v140H0z" fill="#C89B6B"/>
        <path d="M0 240c90-30 190-30 270 0s150 20 210 0v80H0z" fill="#6B4F32"/>
        <path d="M0 278c110-24 230-20 330 0s110 10 150 4v38H0z" fill="#3E2723"/>`, 'Illustration: sunrise over rolling hills');
  }
}

/* ---- The org's homepage, as a visitor would see it ---------------------- */
export function eventsList(events, limit) {
  const list = [...events].sort(byDate).slice(0, limit || events.length);
  if (!list.length) return '<p class="site-empty">No upcoming events yet.</p>';
  return `<ol class="site-events">${list.map((e) => `
    <li><span class="site-date"><span>${esc(fmt.month(e.date))}</span><b>${esc(fmt.day(e.date))}</b></span>
      <span class="site-event"><b>${esc(e.title)}</b><span>${esc(fmt.weekday(e.date))} · ${esc(fmt.time(e.date))}${e.location ? ` · ${esc(e.location)}` : ''}</span></span></li>`).join('')}</ol>`;
}

export function browserFrame(org, inner, label = 'Live preview') {
  return `<div class="browser" data-preview>
    <div class="browser__bar"><span class="browser__dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="browser__url">${esc(org.domain)}</span><span class="browser__tag">${esc(label)}</span></div>
    <div class="site" style="--org:${esc(org.palette.primary)};--org-accent:${esc(org.palette.accent)};--org-soft:${esc(org.palette.soft)}">${inner}</div>
  </div>`;
}

export function siteNav(org) {
  return `<div class="site-nav">${orgBadge(org, 'org-badge--sm')}<b>${esc(org.name)}</b>
    <span class="site-nav__links" aria-hidden="true">${org.labels.nav.map((n) => `<span>${esc(n)}</span>`).join('')}</span></div>`;
}

export function sitePreview(data, { eventsLimit = 3 } = {}) {
  const { org, page, events } = data;
  return browserFrame(org, `${siteNav(org)}
    <div class="site-hero">
      <div class="site-hero__text">
        <span class="site-hero__rule" aria-hidden="true"></span>
        <p class="site-hero__h" data-preview-heading>${esc(page.heading)}</p>
        <p class="site-hero__p" data-preview-body>${esc(page.body)}</p>
        <span class="site-btn">${esc(org.labels.cta)}</span>
      </div>
      <div class="site-hero__img" data-preview-image data-image="${esc(page.image)}">${illustration(page.image)}</div>
    </div>
    <div class="site-section"><p class="site-section__h">Upcoming</p><div data-preview-calendar>${eventsList(events, eventsLimit)}</div></div>`);
}

export const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
