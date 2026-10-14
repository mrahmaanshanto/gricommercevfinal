// customerFilters — Customers › More filters (review CX-U3). Each of the 8 filters is written as segment rules
// (lib/segments.js), so the list shows exactly who a segment saved from these filters would hold:
//   MORE_FILTERS              [{ key, label, options: [[value, label]] }]   (Tag's options come from the page)
//   NO_MORE                   every filter off
//   moreRules(f, now)         the segment rules for the chosen filters → [rule]
//   moreChips(f, tagLabel)    [{ key, label }] "Signed up: Last 7 days" for the chips under the filters
//   moreFromQuery(params)     the filters kept in the page address (?signed=7d&spent=50k …)
//   moreToQuery(url, f)       writes them back (an off filter is removed from the address)
// Dates count back from today, as the segment engine does.

import { PAY_METHODS, HAS_FACTS } from './customerFacts';

export const MORE_FILTERS = [
  { key: 'signed', label: 'Signed up', options: [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['year', 'This year']] },
  { key: 'lastOrder', label: 'Last order', options: [['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['60plus', 'More than 60 days ago'], ['never', 'Never ordered']] },
  { key: 'spent', label: 'Total spent', options: [['u1k', 'Under ৳1,000'], ['1k-10k', '৳1,000 – ৳10,000'], ['10k-50k', '৳10,000 – ৳50,000'], ['50k', 'Above ৳50,000']] },
  { key: 'orders', label: 'Number of orders', options: [['0', '0 orders'], ['1', '1 order'], ['2-4', '2–4 orders'], ['5', '5+ orders']] },
  { key: 'paid', label: 'Paid with', options: PAY_METHODS },
  { key: 'has', label: 'Has', options: HAS_FACTS },
  { key: 'tag', label: 'Tag', options: [] },
  { key: 'bday', label: 'Birthday', options: [['thisMonth', 'This month'], ['nextMonth', 'Next month']] },
];
export const MORE_KEYS = MORE_FILTERS.map((x) => x.key);
export const NO_MORE = Object.fromEntries(MORE_KEYS.map((k) => [k, '']));
const r = (field, op, value) => ({ field, op, value });

/** The segment rules for the chosen filters. */
export function moreRules(f = {}, now = Date.now()) {
  const out = [];
  const jan1 = new Date(new Date(now).getFullYear(), 0, 1).getTime();
  const sinceJan = Math.floor((now - jan1) / 864e5);
  ({
    today: () => out.push(r('signup', 'lte', 0)), yesterday: () => out.push(r('signup', 'gte', 1), r('signup', 'lte', 1)),
    '7d': () => out.push(r('signup', 'lte', 7)), '30d': () => out.push(r('signup', 'lte', 30)), year: () => out.push(r('signup', 'lte', sinceJan)),
  }[f.signed] || (() => {}))();
  ({
    today: () => out.push(r('lastOrder', 'lte', 0)), '7d': () => out.push(r('lastOrder', 'lte', 7)), '30d': () => out.push(r('lastOrder', 'lte', 30)),
    '60plus': () => out.push(r('lastOrder', 'gte', 60)), never: () => out.push(r('lastOrder', 'never', '')),
  }[f.lastOrder] || (() => {}))();
  ({
    u1k: () => out.push(r('spent', 'lte', 999)), '1k-10k': () => out.push(r('spent', 'gte', 1000), r('spent', 'lte', 10000)),
    '10k-50k': () => out.push(r('spent', 'gte', 10000), r('spent', 'lte', 50000)), '50k': () => out.push(r('spent', 'gte', 50001)),
  }[f.spent] || (() => {}))();
  ({
    0: () => out.push(r('orders', 'eq', 0)), 1: () => out.push(r('orders', 'eq', 1)), '2-4': () => out.push(r('orders', 'gte', 2), r('orders', 'lte', 4)), 5: () => out.push(r('orders', 'gte', 5)),
  }[f.orders] || (() => {}))();
  if (f.paid) out.push(r('paidWith', 'has', f.paid));
  if (f.has) out.push(r('has', 'has', f.has));
  if (f.tag) out.push(r('tags', 'has', f.tag));
  if (f.bday) out.push(r('birthday', 'is', f.bday));
  return out;
}
/** Chips for the chosen filters. */
export function moreChips(f = {}) {
  return MORE_FILTERS.filter((x) => f[x.key]).map((x) => {
    const o = x.options.find((p) => p[0] === f[x.key]);
    return { key: x.key, label: `${x.label}: ${o ? o[1] : f[x.key]}` };
  });
}
export const moreCount = (f = {}) => MORE_KEYS.filter((k) => !!f[k]).length;
export function moreFromQuery(params) {
  const out = { ...NO_MORE };
  MORE_KEYS.forEach((k) => { const v = params.get(k); if (v) out[k] = v; });
  return out;
}
export function moreToQuery(url, f = {}) {
  MORE_KEYS.forEach((k) => { if (f[k]) url.searchParams.set(k, f[k]); else url.searchParams.delete(k); });
  return url;
}
