// vat — the VAT rates set on Accounts > VAT ("VAT rate by category"), shared with the POS register.
// Front end only: the rates the merchant changes there are kept in this browser.

export const VAT_KEY = 'gc.vat';
// the rates the VAT screen starts from, by its category key
const DEFAULT_RATES = { rice: 0, oil: 5, soap: 7.5, snack: 5, drink: 5, cloth: 7.5, elec: 15 };
// which VAT category a POS product category is taxed as
const POS_CATEGORY = { Grocery: 'oil', Clothing: 'cloth', 'Skin care': 'soap', Electronics: 'elec', Home: 'drink' };

export function loadVat() {
  try { return { rates: {}, notReg: false, ...(JSON.parse(window.localStorage.getItem(VAT_KEY)) || {}) }; } catch { return { rates: {}, notReg: false }; }
}
export function saveVat(vat) {
  try { window.localStorage.setItem(VAT_KEY, JSON.stringify(vat)); } catch { /* ignore */ }
}
/** VAT percent for a POS product category; 0 when the shop is not VAT-registered. */
export function vatRateFor(cat, vat) {
  if (!vat || vat.notReg) return 0;
  const key = POS_CATEGORY[cat];
  return (vat.rates && vat.rates[key] != null ? vat.rates[key] : DEFAULT_RATES[key]) || 0;
}
