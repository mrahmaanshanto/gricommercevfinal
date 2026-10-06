// warranty — what warranty a product comes with, and until when a sold unit is covered.
// A product's own setting (Add product › Warranty: { has, policy, text }) wins. A product without one but flagged
// "Warranty" gets its category's default (phones and wearables: 12 months brand warranty; others: 6 months shop
// service). A product with neither has no warranty, and nothing is shown.
//   POLICIES                   the policies the product form offers (keys as saved on products)
//   warrantyOf(product)        { key, label, months?, days?, text } or null
//   coverOf(product, soldAt)   { ...warranty, until } or null — the date the cover ends for a unit sold at soldAt

export const POLICIES = {
  brand1y: { label: '12 months brand warranty', months: 12, claim: 'Brand service centre' },
  shop6m: { label: '6 months shop service', months: 6, claim: 'Our shop' },
  rep7d: { label: '7-day replacement', days: 7, claim: 'Our shop' },
  elec2y: { label: '2 years parts, 1 year service', months: 24, claim: 'Brand centre' },
};
const LONG = /^(Phones|Tablets|Wearables)\b/;

/** The warranty a product comes with, or null. */
export function warrantyOf(p) {
  if (!p) return null;
  const w = p.warranty;
  if (w && w.has === false) return null;
  if (w && w.has && POLICIES[w.policy]) return { key: w.policy, ...POLICIES[w.policy], text: w.text || '' };
  if ((p.flags || []).includes('Warranty')) { const key = LONG.test(String(p.cat || '')) ? 'brand1y' : 'shop6m'; return { key, ...POLICIES[key], text: '' }; }
  return null;
}
/** The warranty of a unit sold at `soldAt`, with the date its cover ends; null when there is none. */
export function coverOf(p, soldAt = Date.now()) {
  const w = warrantyOf(p);
  if (!w) return null;
  const d = new Date(soldAt);
  if (w.months) d.setMonth(d.getMonth() + w.months); else d.setDate(d.getDate() + (w.days || 0));
  return { ...w, until: d.getTime() };
}
