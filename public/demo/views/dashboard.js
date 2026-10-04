import { esc, icon, fmt, byDate, avatar, plural } from '../ui.js';
import { chart } from '../charts.js';

export const title = 'Dashboard';
// The 12 points in each series are the last 12 months, ending last month.
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

function kpi(k) {
  const down = /^[-−]/.test(k.delta);
  return `<li class="kpi" data-kpi>
    <p class="kpi__label">${esc(k.label)}</p>
    <p class="kpi__value">${esc(k.value)}</p>
    <p class="kpi__delta ${down ? 'is-down' : 'is-up'}">${icon(down ? 'down' : 'up')}<span>${esc(k.delta.replace('-', '−'))}</span><span class="kpi__vs">vs last month</span></p>
  </li>`;
}

export function mount(el, { data }) {
  const d = data();
  const [a, b] = d.series;
  const upcoming = [...d.events].sort(byDate).slice(0, 4);
  const open = d.inbox.filter((m) => !m.handled);
  el.innerHTML = `
    <header class="view-head">
      <div><p class="eyebrow">${esc(d.org.name)}</p><h1 tabindex="-1">Dashboard</h1>
      <p class="view-sub">Here is how ${esc(d.org.name)} is doing this month.</p></div>
      <p class="chip">${icon('clock')}Last 12 months</p>
    </header>
    <ul class="kpis" role="list">${d.kpis.map(kpi).join('')}</ul>
    <div class="dash-grid">
      <section class="card card--chart" aria-labelledby="ch-a">
        <div class="card__head"><h2 id="ch-a">${esc(a.label)}</h2><p class="card__meta">${a.points[11].toLocaleString('en-US')} in Sep</p></div>
        <div data-slot="a"></div>
      </section>
      <section class="card" aria-labelledby="up-h">
        <div class="card__head"><h2 id="up-h">Upcoming events</h2><a class="card__link" href="#/events">Manage</a></div>
        <ul class="mini-list" role="list">${upcoming.map((e) => `<li><span class="date-tile"><span>${esc(fmt.month(e.date))}</span><b>${esc(fmt.day(e.date))}</b></span>
          <span class="mini-list__main"><b>${esc(e.title)}</b><span>${esc(fmt.weekday(e.date))} · ${esc(fmt.time(e.date))}</span></span></li>`).join('') || '<li class="muted">No events scheduled.</li>'}</ul>
      </section>
      <section class="card card--chart" aria-labelledby="ch-b">
        <div class="card__head"><h2 id="ch-b">${esc(b.label)}</h2><p class="card__meta">${b.points[11].toLocaleString('en-US')} in Sep</p></div>
        <div data-slot="b"></div>
      </section>
      <section class="card" aria-labelledby="in-h">
        <div class="card__head"><h2 id="in-h">Needs a reply</h2><a class="card__link" href="#/inbox">${esc(plural(open.length, 'open', 'open'))}</a></div>
        <ul class="mini-list" role="list">${open.slice(0, 3).map((m) => `<li>${avatar(m.from)}
          <span class="mini-list__main"><b>${esc(m.subject)}</b><span>${esc(m.from)} · ${esc(m.kind || 'Message')}</span></span></li>`).join('') || '<li class="muted">You are all caught up.</li>'}</ul>
      </section>
    </div>`;
  const off = [chart(el.querySelector('[data-slot="a"]'), a, MONTHS, 'line'), chart(el.querySelector('[data-slot="b"]'), b, MONTHS, 'bar')];
  return { destroy: () => off.forEach((f) => f()) };
}
