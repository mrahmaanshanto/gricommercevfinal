// productCostFacts — the two cost lines under Pricing on Add / Edit product (read only; the product's own cost stays a
// planning figure there, Purchasing and Inventory own the live cost):
//   lastPurchaseCost(sku, name)  what one piece cost on the latest purchase: a direct purchase entered in this browser
//                                (productCost.js › setBuyingPrice, 'gc.cost.last'), else the latest received purchase
//                                order line (purchaseOrders.js). { cost, ref } or null.
//   inventoryCost(sku)           what one piece on the shelf is worth (stock.js › unitValue). A number or 0.

import { DEMO_POS, getPOs } from './purchaseOrders';
import { productBy, unitValue } from './stock';

const GOT = { partial: 1, received: 1, closed: 1, Received: 1, 'Partly received': 1 };

export function lastPurchaseCost(sku, name) {
  if (typeof window === 'undefined') return null;
  try {
    const last = JSON.parse(window.localStorage.getItem('gc.cost.last')) || {};
    const k = [sku, name].filter(Boolean).find((x) => Number(last[x]) > 0);
    if (k) return { cost: Number(last[k]), ref: 'Direct purchase' };
  } catch { /* ignore */ }
  const nm = String(name || '').trim().toLowerCase();
  const hit = (l) => (sku && l.sku && l.sku === sku) || (nm && l.name && (l.name.toLowerCase() === nm || l.name.toLowerCase().indexOf(nm + ' · ') === 0));
  const pos = getPOs().concat(DEMO_POS).filter((p) => GOT[p.s] || GOT[p.status] || (p.got || 0) > 0);
  let best = null;
  pos.forEach((p) => (p.lines || []).forEach((l) => {
    if (!hit(l) || !(Number(l.cost) > 0)) return;
    const at = p.at || 0;
    if (!best || at > best.at) best = { cost: Number(l.cost), ref: p.no, at };
  }));
  return best ? { cost: best.cost, ref: best.ref } : null;
}

export function inventoryCost(sku) {
  if (!sku || typeof window === 'undefined') return 0;
  try { const row = productBy(sku); return row ? Number(unitValue(row)) || 0 : 0; } catch { return 0; }
}
