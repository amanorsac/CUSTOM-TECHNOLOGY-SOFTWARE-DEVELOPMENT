// Virtual Assistant pricing page: the plan estimator. Sliders set calls a day and call length; the minutes box
// can also be typed into directly. Each plan shows its estimate and the cheapest one is badged.
import { trackCallLinks } from './va-track.js';
import { monthlyMinutes, planCost, cheapestPlan, money } from './va-plans.js';

trackCallLinks();
const $ = (id) => document.getElementById(id);
const cpd = $('cpd'), len = $('len'), minutes = $('minutes');

function show(m) {
  const best = cheapestPlan(m);
  for (const id of ['monthly', 'payg', 'cap']) {
    $(`est-${id}`).textContent = `${money(planCost(id, m))}/month`;
    document.querySelector(`[data-plan="${id}"]`).classList.toggle('is-best', id === best);
  }
}
function fromSliders() {
  $('cpd-out').textContent = cpd.value;
  $('len-out').textContent = `${len.value} min`;
  const m = Math.round(monthlyMinutes(+cpd.value, +len.value));
  minutes.value = m;
  show(m);
}
cpd.addEventListener('input', fromSliders);
len.addEventListener('input', fromSliders);
minutes.addEventListener('input', () => { const m = Math.max(0, Math.min(100000, +minutes.value || 0)); show(m); });
fromSliders();
