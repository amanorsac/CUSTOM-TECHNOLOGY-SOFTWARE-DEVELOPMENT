/* CTSD live demo: inline SVG charts, no library. The smoothing and the
   "nice ceiling" come from the amanorsac.studio admin charts, re-skinned
   to the wood palette. Each chart ships a visually hidden data table, and
   the SVG carries an aria-label summary, so the numbers are never only
   visual. */
import { esc } from './ui.js';

const num = (n) => Number(n).toLocaleString('en-US');
const short = (v) => (v >= 1e4 ? `${Math.round(v / 1e3)}k` : v >= 1e3 ? `${(v / 1e3).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(v)));

/* the top of a 4-gridline axis: 4 x a "nice" step, so the line fills the frame */
function ceiling(peak) {
  if (peak <= 0) return 4;
  const raw = peak / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * mag >= raw);
  return 4 * nice * mag;
}

/* a smooth path through points, Catmull-Rom turned into cubic curves */
function smooth(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6},${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6},${p2[0]} ${p2[1]}`;
  }
  return d;
}

function summary(series, labels) {
  const p = series.points;
  const first = p[0], last = p[p.length - 1];
  const peak = Math.max(...p), low = Math.min(...p);
  const change = first ? Math.round(((last - first) / first) * 100) : 0;
  return `${series.label}, ${labels[0]} to ${labels[labels.length - 1]}: ${change >= 0 ? 'up' : 'down'} ${Math.abs(change)}% from ${num(first)} to ${num(last)}. High ${num(peak)} in ${labels[p.indexOf(peak)]}, low ${num(low)} in ${labels[p.indexOf(low)]}.`;
}

function table(series, labels) {
  return `<table class="sr-only"><caption>${esc(series.label)} by month</caption>
    <thead><tr><th scope="col">Month</th><th scope="col">${esc(series.label)}</th></tr></thead>
    <tbody>${labels.map((l, i) => `<tr><th scope="row">${esc(l)}</th><td>${num(series.points[i])}</td></tr>`).join('')}</tbody></table>`;
}

function draw(el, series, labels, kind) {
  const W = Math.max(280, Math.round(el.clientWidth || 600));
  const H = W < 480 ? 200 : 240;
  const Lp = 40, R = 8, T = 12, B = 26;
  const pts = series.points;
  const top = ceiling(Math.max(...pts) * 1.05);
  const n = pts.length;
  const band = (W - Lp - R) / n;
  const x = kind === 'bar' ? (i) => Lp + band * (i + 0.5) : (i) => Lp + (W - Lp - R) * (i / (n - 1));
  const y = (v) => T + (H - T - B) * (1 - v / top);

  let g = '';
  for (let i = 0; i <= 4; i++) {
    const yy = T + (H - T - B) * (i / 4);
    g += `<line x1="${Lp}" y1="${yy}" x2="${W - R}" y2="${yy}" class="c-grid"/><text x="${Lp - 8}" y="${yy + 3.5}" text-anchor="end" class="c-axis">${short(top * (1 - i / 4))}</text>`;
  }
  const step = W < 480 ? 3 : 2;
  labels.forEach((l, i) => {
    if (i % step === (n - 1) % step) g += `<text x="${x(i)}" y="${H - 7}" text-anchor="middle" class="c-axis">${esc(l)}</text>`;
  });

  let marks = '';
  if (kind === 'bar') {
    const bw = Math.min(28, band * 0.56);
    marks = pts.map((v, i) => `<rect x="${x(i) - bw / 2}" y="${y(v)}" width="${bw}" height="${H - B - y(v)}" rx="${Math.min(5, bw / 3)}" class="c-bar${i === n - 1 ? ' c-bar--now' : ''}"/>`).join('');
  } else {
    const p = pts.map((v, i) => [x(i), y(v)]);
    const d = smooth(p);
    marks = `<defs><linearGradient id="${el.id}-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="c-fill-a"/><stop offset="1" class="c-fill-b"/></linearGradient></defs>
      <path d="${d} L${x(n - 1)} ${H - B} L${x(0)} ${H - B} Z" fill="url(#${el.id}-fill)"/>
      <path d="${d}" class="c-line"/>
      <circle cx="${x(n - 1)}" cy="${y(pts[n - 1])}" r="4.5" class="c-dot"/>`;
  }
  const hover = `<line data-cx y1="${T}" y2="${H - B}" class="c-cross" opacity="0"/><circle data-hd r="4.5" class="c-dot" opacity="0"/>`;
  const svg = el.querySelector('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.height = `${H}px`;
  svg.innerHTML = g + marks + hover;

  const tip = el.querySelector('.c-tip');
  const cx = svg.querySelector('[data-cx]'), hd = svg.querySelector('[data-hd]');
  el.onpointermove = (e) => {
    const b = svg.getBoundingClientRect();
    const px = (e.clientX - b.left) * (W / b.width);
    const i = Math.max(0, Math.min(n - 1, kind === 'bar' ? Math.floor((px - Lp) / band) : Math.round(((px - Lp) / (W - Lp - R)) * (n - 1))));
    cx.setAttribute('x1', x(i)); cx.setAttribute('x2', x(i)); cx.setAttribute('opacity', '1');
    hd.setAttribute('cx', x(i)); hd.setAttribute('cy', y(pts[i])); hd.setAttribute('opacity', kind === 'bar' ? '0' : '1');
    tip.innerHTML = `<small>${esc(labels[i])}</small>${num(pts[i])}`;
    tip.style.left = `${Math.min(b.width - 50, Math.max(50, (x(i) / W) * b.width))}px`;
    tip.style.top = `${(y(pts[i]) / H) * b.height}px`;
    tip.style.opacity = '1';
  };
  el.onpointerleave = () => { tip.style.opacity = '0'; cx.setAttribute('opacity', '0'); hd.setAttribute('opacity', '0'); };
}

let n = 0;
/* Renders into `el` and redraws on resize. Returns a cleanup function. */
export function chart(el, series, labels, kind = 'line') {
  el.id = el.id || `chart-${n++}`;
  el.setAttribute('data-chart', kind);
  el.innerHTML = `<div class="c-frame"><svg role="img" aria-label="${esc(summary(series, labels))}" preserveAspectRatio="none"></svg><div class="c-tip" aria-hidden="true"></div></div>${table(series, labels)}`;
  const frame = el.querySelector('.c-frame');
  const render = () => draw(frame, series, labels, kind);
  frame.id = `${el.id}-f`;
  render();
  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    let w = frame.clientWidth;
    ro = new ResizeObserver(() => { if (Math.abs(frame.clientWidth - w) > 4) { w = frame.clientWidth; render(); } });
    ro.observe(frame);
  }
  return () => ro && ro.disconnect();
}
