// scaleBarcode — weighed products and the price-embedded barcodes a shop scale prints.
// A weighed product sells by the kg: its price is the price of 1 kg and the sale line's quantity is the
// weight (3 decimals). Which products are weighed: a product whose unit is kg in Products (its PLU / scale
// code is one of its identifiers), the list below (PLU = the item number keyed on the scale), or a product
// flagged "Weighed". Stock moves keep 3 decimals only for kg products (units.js › roundQty).
// Scale label (EAN-13, 13 digits):   2 T PPPPP VVVVV C
//   2       in-store code
//   T 0–4   VVVVV is the weight in grams (00750 = 0.750 kg)
//   T 5–9   VVVVV is the price in poisha (16500 = ৳165.00)
//   PPPPP   the product's PLU
//   C       EAN-13 check digit
// A code that is a product's own barcode (Products › Make one also starts with 2) is matched before this.
// Front end only: the list of weighed products is demo data plus changes kept in this browser.

import { productBy, getCatalog } from './stock';
import { allProducts } from './products';   // read at run time only

const KEY = 'gc.pos.weighed';
/** sku → PLU on the scale (products with unit kg and a PLU or scale code are added on their own). */
const SEED = { 'AC-LYD-01': '00102', 'SV-RPR-PORT': '00205' };
const isKg = (c) => ['kg', 'g'].includes(String((c && c.unit) || '').toLowerCase());

const read = () => { try { return { ...SEED, ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return { ...SEED }; } };
/** sku → PLU of every weighed product: the list above, changes in this browser, and kg products with a PLU. */
export function getWeighed() {
  const out = typeof window === 'undefined' ? { ...SEED } : read();
  try {
    getCatalog().forEach((c) => {
      if (out[c.sku] !== undefined || !isKg(c)) return;
      const id = (c.ids || []).find((i) => i.type === 'scale' || i.type === 'plu');
      if (id) out[c.sku] = String(id.value).padStart(5, '0').slice(-5);
    });
  } catch { /* catalogue not ready */ }
  return out;
}
/** Add or change a weighed product's PLU (empty PLU = no longer weighed). */
export function setWeighed(sku, plu) {
  const all = (() => { try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
  all[sku] = plu ? String(plu).padStart(5, '0').slice(-5) : '';
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

/** Whether a product (SKU, name or barcode) is sold by weight. */
export function isWeighed(key) {
  const c = productBy(key);
  if (!c) return false;
  if (isKg(c)) return true;
  const plu = getWeighed()[c.sku];
  if (plu) return true;
  if (plu === '') return false;
  try {
    const p = allProducts().find((x) => (c.productId && x.id === c.productId) || (x.sku && x.sku === c.sku));
    return !!p && (p.unit === 'kg' || (p.flags || []).includes('Weighed'));
  } catch { return false; }
}
export const pluOf = (sku) => getWeighed()[sku] || '';

const eanDigit = (d12) => String((10 - (d12.split('').reduce((a, d, i) => a + Number(d) * (i % 2 ? 3 : 1), 0) % 10)) % 10);
/** Whether 13 digits carry a correct EAN-13 check digit. */
export const validEan13 = (code) => /^\d{13}$/.test(code) && eanDigit(code.slice(0, 12)) === code[12];

/**
 * Read a scale label. Returns null when the code is not a scale label at all, or
 * { ok: false, error } when it looks like one but cannot be used, or
 * { ok: true, sku, plu, mode: 'weight'|'price', kg, price, code }.
 * `unitPrice` (৳ per kg) turns a price label into a weight.
 */
export function decodeScale(raw, unitPriceOf = (sku) => (productBy(sku) || {}).price || 0) {
  const code = String(raw || '').trim();
  if (!/^2\d{12}$/.test(code)) return null;
  if (!validEan13(code)) return { ok: false, error: 'The scale label did not read correctly. Scan it again.' };
  const t = Number(code[1]);
  const plu = code.slice(2, 7);
  const value = Number(code.slice(7, 12));
  const sku = Object.entries(getWeighed()).find(([, p]) => p === plu);
  if (!sku) return { ok: false, error: `No weighed product has PLU ${plu}.` };
  const per = unitPriceOf(sku[0]);
  if (t <= 4) {
    const kg = value / 1000;
    if (!kg) return { ok: false, error: 'The label shows no weight.' };
    return { ok: true, sku: sku[0], plu, mode: 'weight', kg, price: Math.round(kg * per * 100) / 100, code };
  }
  const price = value / 100;
  if (!price || !per) return { ok: false, error: 'The label shows no price.' };
  return { ok: true, sku: sku[0], plu, mode: 'price', kg: Math.round((price / per) * 1000) / 1000, price, code };
}

/** Make a scale label (for tests and demos): { kg } or { price }. */
export function makeScaleCode(plu, { kg, price } = {}) {
  const head = kg != null ? '20' : '25';
  const value = kg != null ? Math.round(kg * 1000) : Math.round(price * 100);
  const d12 = head + String(plu).padStart(5, '0') + String(value).padStart(5, '0');
  return d12 + eanDigit(d12);
}

/** Weight to show: 0.750 kg. */
export const kgText = (kg) => `${(Number(kg) || 0).toFixed(3)} kg`;
/** Round a weight to grams. */
export const r3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;
