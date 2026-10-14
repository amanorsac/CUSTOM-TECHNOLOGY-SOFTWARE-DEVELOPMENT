// Virtual Assistant plans and their monthly cost, shared by the pricing page, the product page and the
// Worker's emails. Prices come from the owner's handoff doc. Pure module: no DOM.
export const SETUP_FEE = 499;

export const PLANS = {
  monthly: { id: 'monthly', name: 'Monthly', label: 'Monthly ($497/month)', base: 497, included: 1000, rate: 0.35,
    summary: '$497/month', detail: '1,000 minutes included, then $0.35 a minute',
    reminders: 'Texts you at 80% and 100% of your included minutes' },
  payg: { id: 'payg', name: 'Pay as you go', label: 'Pay as you go ($149/month + $0.40/min)', base: 149, rate: 0.40,
    summary: '$149/month + $0.40/min', detail: 'No minute limit',
    reminders: 'Texts you when the bill passes $300 and $500' },
  cap: { id: 'cap', name: 'Pay as you go with a cap', label: 'Cap ($149/month + $0.45/min, never more than $649)', base: 149, rate: 0.45, cap: 649,
    summary: '$149/month + $0.45/min, never more than $649', detail: 'Calls after the cap are free',
    reminders: 'Texts you at 50%, 80% and 100% of the cap' },
};

// Minutes in a month for a given number of calls a day and average call length.
export const monthlyMinutes = (callsPerDay, minutesPerCall) => callsPerDay * minutesPerCall * 30.4;

export function planCost(id, minutes) {
  const m = Math.max(0, minutes);
  if (id === 'monthly') return 497 + Math.max(0, m - 1000) * 0.35;
  if (id === 'payg') return 149 + m * 0.40;
  if (id === 'cap') return Math.min(149 + m * 0.45, 649);
  throw new Error(`unknown plan ${id}`);
}

// The plan that costs least for these minutes (Monthly wins a tie).
export function cheapestPlan(minutes) {
  return ['monthly', 'payg', 'cap'].reduce((best, id) => (planCost(id, minutes) < planCost(best, minutes) ? id : best), 'monthly');
}

// What unanswered calls cost a restaurant each month.
export function missedCallCost(missedPerWeek, averageTicket, conversion) {
  const lostOrders = missedPerWeek * 4.33 * conversion;
  return { lostOrders, lost: lostOrders * averageTicket, breakEven: Math.ceil(497 / averageTicket) };
}

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
