// vat — the VAT set on Accounts › Setup › VAT, shared by the POS register (web and phone), receipts and invoices,
// Create order, the counters' generated sales and the sales book.
//   rates      VAT % by product category (the top level of Products › Categories: "Phones › Smartphones" → Phones).
//              A category with no rate set pays its default below, any other category the standard rate.
//              Services, Digital and Gifts are categories like the others, each with its own rate.
//   inclusive  "Prices include VAT (MRP)": the shelf price already holds the VAT (on by default, as in Bangladesh:
//              a ৳780 cable rings up at ৳780 and the VAT inside it is shown). Off: VAT is added on top.
//   notReg     the shop is not VAT-registered: no VAT at all.
// Front end only: the setup the merchant changes is kept in this browser.

export const VAT_KEY = 'gc.vat';
/** The standard VAT rate (%) in Bangladesh, for a category without a rate of its own. */
export const STANDARD_RATE = 15;
/** Default rate of each top-level product category the shop sells (Products › Categories). */
export const DEFAULT_RATES = { Phones: 15, Accessories: 15, Audio: 15, Wearables: 15, 'Power banks': 15, Services: 15, Digital: 15, Gifts: 15 };
/** The categories the VAT page lists first (the shop's own top categories are added after them). */
export const VAT_CATEGORIES = Object.keys(DEFAULT_RATES);
export const VAT_RATES = [0, 5, 7.5, 10, 15];
// rates saved by the old VAT page were kept under its own keys; the shop's categories were all charged as 'elec'
const LEGACY = { Phones: 'elec', Accessories: 'elec', Audio: 'elec', Wearables: 'elec', 'Power banks': 'elec' };

const BLANK = { rates: {}, notReg: false, inclusive: true };
export function loadVat() {
  try { return { ...BLANK, ...(JSON.parse(window.localStorage.getItem(VAT_KEY)) || {}) }; } catch { return { ...BLANK }; }
}
export function saveVat(vat) {
  try { window.localStorage.setItem(VAT_KEY, JSON.stringify({ ...BLANK, ...vat })); } catch { /* ignore */ }
}
/** "Phones › Smartphones" → "Phones". */
export const topCategory = (cat) => String(cat || '').split('›')[0].trim();
/** VAT percent for a product category; 0 when the shop is not VAT-registered (or the setup is not read yet). */
export function vatRateFor(cat, vat) {
  if (!vat || vat.notReg) return 0;
  const top = topCategory(cat);
  const r = vat.rates || {};
  if (r[top] != null && r[top] !== '') return Number(r[top]) || 0;
  if (LEGACY[top] && r[LEGACY[top]] != null) return Number(r[LEGACY[top]]) || 0;
  return DEFAULT_RATES[top] != null ? DEFAULT_RATES[top] : STANDARD_RATE;
}
/** A bill line's VAT %: the product's own rate (Add product › VAT / tax) when it has one, else its category's. */
export function rateForLine(l, vat) {
  if (!vat || vat.notReg) return 0;
  return l && l.vatRate != null && l.vatRate !== '' ? Number(l.vatRate) || 0 : vatRateFor(l && l.cat, vat);
}
/** Whether shelf prices already include VAT (MRP). On unless the shop turned it off. */
export const pricesIncludeVat = (vat) => !vat || vat.inclusive !== false;
/** The VAT in an amount (prices include VAT) or on top of it, at `rate` %. */
export const vatOf = (amount, rate, inclusive) => (rate ? (inclusive ? (amount * rate) / (100 + rate) : (amount * rate) / 100) : 0);
/**
 * VAT of a bill. `lines` are { price, qty, disc?, cat }; `share` is what is left of each taka after the bill's own
 * discounts (1 = none). Returns { tax, included }: with prices that include VAT the tax is inside the total,
 * otherwise it is added to it.
 */
export function billVat(lines, share, vat) {
  const included = pricesIncludeVat(vat);
  const tax = (lines || []).reduce((s, l) => {
    const amount = ((Number(l.price) || 0) * (Number(l.qty) || 0) - Math.min((Number(l.price) || 0) * (Number(l.qty) || 0), Number(l.disc) || 0)) * share;
    return s + vatOf(amount, rateForLine(l, vat), included);
  }, 0);
  return { tax: Math.round(tax * 100) / 100, included };
}

// ---- named tax rates (Products › Catalog setup › Tax rates) ----------------------------------------------------------
// The rates a product can be given by name (Add product › Pricing › VAT / tax). A category's own rate is still set on
// Accounts › VAT (rates above); these are the choices. Kept in this browser (gc.vat.named).
export const TAX_RATES_KEY = 'gc.vat.named';
export const TAX_RATES_EVENT = 'gc:tax-rates';
const SEED_RATES = [
  { id: 'std', name: 'Standard VAT', rate: 15 },
  { id: 'ten', name: 'VAT 10%', rate: 10 },
  { id: 'red', name: 'Reduced VAT', rate: 7.5 },
  { id: 'low', name: 'Lower VAT', rate: 5 },
  { id: 'zero', name: 'No VAT', rate: 0 },
];
export function getTaxRates() {
  if (typeof window === 'undefined') return SEED_RATES;
  try { const v = JSON.parse(window.localStorage.getItem(TAX_RATES_KEY)); return Array.isArray(v) && v.length ? v : SEED_RATES; } catch { return SEED_RATES; }
}
const writeRates = (list) => { try { window.localStorage.setItem(TAX_RATES_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(TAX_RATES_EVENT)); } catch { /* storage blocked */ } };
/** Add or change a named rate: { id?, name, rate }. Returns { ok, rate } or { ok: false, error }. */
export function saveTaxRate({ id, name, rate }) {
  const n = String(name || '').trim();
  const r = Number(rate);
  if (!n) return { ok: false, error: 'Give the rate a name.' };
  if (!(r >= 0 && r <= 100) || String(rate).trim() === '') return { ok: false, error: 'Enter a rate from 0 to 100.' };
  const list = getTaxRates();
  if (list.some((x) => x.id !== id && x.name.toLowerCase() === n.toLowerCase())) return { ok: false, error: 'There is already a rate with this name.' };
  if (list.some((x) => x.id !== id && Number(x.rate) === r)) return { ok: false, error: `There is already a ${r}% rate.` };
  const row = { id: id || 'tx-' + Date.now().toString(36), name: n, rate: Math.round(r * 100) / 100 };
  writeRates(id && list.some((x) => x.id === id) ? list.map((x) => (x.id === id ? row : x)) : [...list, row]);
  return { ok: true, rate: row };
}
export function removeTaxRate(id) { writeRates(getTaxRates().filter((x) => x.id !== id)); }
