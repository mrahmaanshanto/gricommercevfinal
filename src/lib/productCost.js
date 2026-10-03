// productCost — what one piece of a product cost to buy, for freezing on a sale line and for the
// cost of goods in reports. Order of preference:
//   1. the latest buying price from a purchase (Purchases › New purchase: setBuyingPrice)
//   2. the cost set on the product in Products (products.js, a variant uses its product's cost)
//   3. the usual buying price (purchaseOrders.unitCost: a set price, else about 70% of the price)
// A bundle or kit without a cost of its own costs the sum of its parts.
// Kept in its own file so orders, invoices and the register can freeze cost without importing salesBook.

import { allProducts } from './products';
import { unitCost } from './purchaseOrders';
import { productBy } from './stock';

// the latest buying price per product (sku and name), from purchases entered in this browser
const LAST_KEY = 'gc.cost.last';
let last = { raw: undefined, map: {} };
function lastPrices() {
  if (typeof window === 'undefined') return {};
  let raw = null;
  try { raw = window.localStorage.getItem(LAST_KEY); } catch { /* ignore */ }
  if (raw !== last.raw) { let map = {}; try { map = JSON.parse(raw) || {}; } catch { map = {}; } last = { raw, map }; }
  return last.map;
}
/** Remember what one piece cost on the latest purchase (so stock value, profit and new sales use it). */
export function setBuyingPrice(sku, name, cost) {
  if (!(Number(cost) > 0)) return;
  const map = { ...lastPrices() };
  [sku, name].filter(Boolean).forEach((k) => { map[k] = Math.round(Number(cost) * 100) / 100; });
  try { window.localStorage.setItem(LAST_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

let index = { raw: undefined, byKey: {} };
const savedRaw = () => { if (typeof window === 'undefined') return null; try { return window.localStorage.getItem('gc.products.saved'); } catch { return null; } };
function costIndex() {
  const raw = savedRaw();
  if (raw === index.raw) return index.byKey;
  const byKey = {};
  try {
    allProducts().forEach((p) => {
      if (!(Number(p.cost) > 0)) return;
      const keys = [p.name, p.sku, ...(p.variants || []).flatMap((v) => [v.sku, p.name + ' · ' + v.name])].filter(Boolean);
      keys.forEach((k) => { if (byKey[k] == null) byKey[k] = Number(p.cost); });
    });
  } catch { /* ignore */ }
  index = { raw, byKey };
  return byKey;
}

/** Buying price of one piece of a product, by name or SKU; 0 when the item is not known. */
export function productCostOf(nameOrSku) {
  const key = String(nameOrSku || '').trim();
  if (!key) return 0;
  const lp = lastPrices();
  if (lp[key]) return lp[key];
  const byKey = costIndex();
  if (byKey[key]) return byKey[key];
  const c = productBy(key);
  if (c) {
    // a bundle or kit costs what its parts cost (unless the product has its own cost)
    if (c.bundle && !byKey[c.sku] && !byKey[c.name]) return Math.round(c.bundle.parts.reduce((a, pt) => a + (pt.sku === c.sku ? 0 : productCostOf(pt.sku)) * (Number(pt.qty) || 1), 0) * 100) / 100;
    if (byKey[c.sku]) return byKey[c.sku];
    if (byKey[c.name]) return byKey[c.name];
    if (c.aka && byKey[c.aka]) return byKey[c.aka];
    return unitCost(c.name) || 0;
  }
  return unitCost(key) || 0;
}

/** sku, cat and the frozen cost for a sale line that does not carry them yet (keeps what it has). */
export function freezeLine(l) {
  const c = productBy(l.sku || l.name) || productBy(l.name);
  const sku = l.sku || (c ? c.sku : '');
  const cat = l.cat || (c ? c.cat : '') || 'Other';
  const cost = Number(l.cost) > 0 ? Number(l.cost) : productCostOf(sku || l.name) || Math.round((Number(l.price) || 0) * 0.7 * 100) / 100;
  return { ...l, sku, cat, cost };
}
