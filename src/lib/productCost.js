// productCost — what one piece of a product cost to buy, for freezing on a sale line and for the
// cost of goods in reports. Order of preference:
//   1. the cost set on the product in Products (products.js, a variant uses its product's cost)
//   2. the usual buying price (purchaseOrders.unitCost: a set price, else about 70% of the price)
// Kept in its own file so orders, invoices and the register can freeze cost without importing salesBook.

import { allProducts } from './products';
import { unitCost } from './purchaseOrders';
import { productBy } from './stock';

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
  const byKey = costIndex();
  if (byKey[key]) return byKey[key];
  const c = productBy(key);
  if (c) {
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
