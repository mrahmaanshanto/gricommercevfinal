// purchaseOrders — purchase orders made in this browser (for example from approved staff requests).
//   Draft -> Sent -> Partly received -> Received
// The purchase order list and the order page show these on top of their demo rows; receiving goods
// against one of them adds to its received counts and keeps a record of each delivery.
// Front end only: kept in this browser.

import { productBy } from './stock';

const KEY = 'gc.purchase.orders';
/** The demo purchase orders go up to PO-2609-0024, so new numbers start after it. */
const DEMO_LAST = 24;

export const PO_STATUS_TONE = { Draft: 'slate', Sent: 'primary', 'Partly received': 'warning', Received: 'success' };

// What we pay suppliers for items that are not in the product catalogue.
const COSTS = {
  'Aloe Vera Soothing Gel 300ml': 320,
  'Shipping box · Medium': 18,
  'Cotton T-shirt · Black · M': 115,
  'Men’s Polo Shirt · Navy · M': 420,
  'Men’s Polo Shirt · Navy · L': 420,
  'Denim Jeans · Blue · 32': 720,
  'Denim Jeans · Blue · 34': 720,
  '20W USB-C fast charger': 610,
  'Tempered glass 2-pack': 38,
  'Packing tape 2 inch': 55,
};

/** A believable buying price: a set price for known items, otherwise about 70% of the selling price. */
export function unitCost(name) {
  if (COSTS[name]) return COSTS[name];
  const p = productBy(name);
  return p ? Math.round((p.price * 0.7) / 5) * 5 : 0;
}

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };

export const getPOs = () => (typeof window === 'undefined' ? [] : read());
export const getPO = (no) => getPOs().find((p) => p.no === no) || null;
export const poTotal = (lines) => lines.reduce((a, l) => a + l.qty * l.cost, 0);
export const poPieces = (lines) => lines.reduce((a, l) => a + l.qty, 0);
export const poReceived = (lines) => lines.reduce((a, l) => a + (l.received || 0), 0);
/** What one piece of `name` cost on order `no` (the order's own price, or the usual buying price). */
export function lineCost(no, name) {
  const line = (getPO(no)?.lines || []).find((l) => l.name === name);
  return line && line.cost ? line.cost : unitCost(name);
}

function nextNumbers(list, count) {
  const d = new Date();
  const prefix = 'PO-' + String(d.getFullYear()).slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + '-';
  const last = list.reduce((m, p) => Math.max(m, Number(p.no.split('-')[2]) || 0), DEMO_LAST);
  return Array.from({ length: count }, (_, i) => prefix + String(last + 1 + i).padStart(4, '0'));
}

/**
 * Save new purchase orders. Each is { supplier, place, lines: [{ name, code, sku, qty, cost }], from: [request ids] },
 * optionally with status ('Draft' by default, 'Sent' when placed with the supplier), approval ('waiting' when an
 * admin must check it first), terms (days to pay), expected, invoice, note and extra costs { ship, customs, courier }.
 * Returns the saved orders with their numbers.
 */
export function addPOs(orders) {
  const list = read();
  const nos = nextNumbers(list, orders.length);
  const made = orders.map((o, i) => ({
    ...o, no: nos[i], supplier: o.supplier, place: o.place || 'Central Warehouse', from: o.from || [], status: o.status || 'Draft', at: Date.now(),
    lines: o.lines.map((l) => ({ ...l, received: 0 })), total: poTotal(o.lines), deliveries: [],
  }));
  write([...made, ...list]);
  return made;
}

/** Change one order. `change` is an object or a function of the order. Returns the updated order. */
export function updatePO(no, change) {
  let out = null;
  const list = read().map((p) => {
    if (p.no !== no) return p;
    const next = { ...p, ...(typeof change === 'function' ? change(p) : change) };
    out = { ...next, total: poTotal(next.lines) };
    return out;
  });
  write(list);
  return out;
}
