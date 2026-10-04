// Industry pages: fill #industry-designs with that industry's design cards.
import { filterDesigns } from './catalog.js';
import { designCard } from './design-card.js';

const section = document.getElementById('industry-designs');
const grid = section && section.querySelector('[data-design-grid]');

async function init() {
  if (!grid) return;
  try {
    const res = await fetch('/data/designs.json');
    if (!res.ok) throw new Error(String(res.status));
    const list = filterDesigns(await res.json(), section.dataset.cat);
    if (!list.length) { section.hidden = true; return; }
    grid.replaceChildren(...list.map((d) => designCard(d)));
  } catch {
    section.hidden = true;
  }
}

init();
