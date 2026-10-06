// customerWarranty — the items a customer bought that come with a warranty, with how many days of cover are left
// (the Warranty card on the customer's profile, customers-crm/CustomerWarranty.jsx), and warranty service logged there.
// Cover starts when the order was delivered (a counter sale: when it was sold) and runs for the product's warranty
// (lib/warranty.js). IMEI / serial numbers come from the serial register (lib/serials.js) by the order or POS sale.
//   productOfLine(line)              the product behind an order line (its warranty setting and category)
//   serialsOfLine(order, line)       the IMEI / serial numbers sold on that line
//   warrantyItems(phone, now)        [{ key, order, name, qty, serials, label, claim, start, until, days, total, state }]
//                                    state 'active' | 'ending' (30 days or less) | 'expired'; newest cover first
//   requestService(item, { problem }) log warranty service for an item (kept in this browser, 'gc.warranty.claims');
//   claimsFor(orderId)               the order page shows it under the item
// Front end only.

import { getOrders } from './orders';
import { load, POS_KEYS } from './posStore';
import { getSerials } from './serials';
import { allProducts } from './products';
import { productBy } from './stock';
import { coverOf } from './warranty';

const DAY = 864e5;
const CLAIMS = 'gc.warranty.claims';
export const CLAIMS_EVENT = 'gc:warranty-claims';
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');

/** The product behind an order line, or null for an item that is not in the product list. */
export function productOfLine(l, list = allProducts()) {
  const row = productBy(l.sku || l.name);
  return (row && row.productId && list.find((p) => p.id === row.productId))
    || list.find((p) => p.sku && p.sku === (l.sku || (row && row.sku)))
    || list.find((p) => p.name === l.name) || null;
}
/** The POS sale an order came from (counter sales), or null. */
export const saleOfOrder = (o) => load(POS_KEYS.sales, []).find((x) => x.orderId === o.id || (x.shipOrders || []).some((y) => y.id === o.id)) || null;
/** The IMEI / serial numbers sold on one line of an order. */
export function serialsOfLine(o, l, sale = saleOfOrder(o), units = getSerials()) {
  const ref = sale ? sale.id : o.id;
  const own = units.filter((u) => u.saleId === ref && ((l.sku && u.sku === l.sku) || u.product === l.name)).map((u) => u.serial);
  const atSale = (sale && (sale.lines.find((x) => x.name === l.name) || {}).serials) || [];
  return [...new Set([...own, ...atSale])];
}
/** When the cover of an order's items starts: delivery, or the sale itself at the counter. */
export const coverStart = (o) => (o.times && o.times.delivered) || o.at;

/** Everything a customer (by phone) bought that has a warranty, with the days left. */
export function warrantyItems(phone, now = Date.now()) {
  const d = digits(phone);
  if (d.length < 10) return [];
  const list = allProducts();
  const units = getSerials();
  const out = [];
  getOrders().filter((o) => digits(o.phone) === d && o.statusKey === 'delivered').forEach((o) => {
    const sale = saleOfOrder(o);
    const start = coverStart(o);
    o.lines.forEach((l, i) => {
      const w = coverOf(productOfLine(l, list), start);
      if (!w) return;
      const days = Math.ceil((w.until - now) / DAY);
      const total = Math.round((w.until - start) / DAY);
      out.push({ key: o.id + ':' + i, order: o.id, name: l.name, qty: l.qty, serials: serialsOfLine(o, l, sale, units), label: w.label, claim: w.claim, text: w.text, start, until: w.until, days: Math.max(0, days), total, state: days <= 0 ? 'expired' : days <= 30 ? 'ending' : 'active' });
    });
  });
  const rank = { ending: 0, active: 1, expired: 2 };
  return out.sort((a, b) => rank[a.state] - rank[b.state] || a.until - b.until);
}

// ---- warranty service logged on the customer's profile ---------------------------------------------------------------------------
const readClaims = () => { try { return JSON.parse(window.localStorage.getItem(CLAIMS)) || []; } catch { return []; } };
export const getClaims = () => (typeof window === 'undefined' ? [] : readClaims());
export const claimsFor = (orderId) => getClaims().filter((c) => c.order === orderId);
/** Ask for warranty service on an item ({ problem }). Returns the request. */
export function requestService(item, { problem, phone, name }) {
  const list = readClaims();
  const c = { id: 'WR-' + String(list.length + 1).padStart(4, '0'), order: item.order, item: item.name, serials: item.serials, problem: String(problem || '').trim(), phone, name, at: Date.now(), status: 'requested' };
  try { window.localStorage.setItem(CLAIMS, JSON.stringify([c, ...list])); window.dispatchEvent(new CustomEvent(CLAIMS_EVENT)); } catch { /* ignore */ }
  return c;
}
