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
  'Phone Ring Holder': 320,
  'Shipping box · Medium': 18,
  'Camera Lens Protector · Clear': 115,
  'Liquid Silicone Case · Navy · M': 420,
  'Liquid Silicone Case · Navy · L': 420,
  'Baseus Car Phone Holder': 720,
  'Baseus Car Phone Holder · Vent': 720,
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

// ---- the demo purchase orders (Purchase orders list, PO detail, reports) ----------------------------
// s: draft | approval | approved | ordered | partial | received | closed | cancelled (the list's tabs).
// Lines: { name, code, sku, qty, cost, received }; the quantities add up to `of`, the received ones to `got`,
// and qty × cost adds up to `total`. PO-2609-0020 is the order Receive goods opens (its pending pieces match).
const DL = (sku, name, qty, cost, received = 0, code = '') => ({ name, code, sku, qty, cost, received });
const PO_DAY = (day, m) => new Date(2026, m - 1, day).getTime();
export const DEMO_POS = [
  { no: 'PO-2609-0024', date: '18 Sep 2026', at: PO_DAY(18, 9), supplier: 'Rahman Telecom', place: 'Central Warehouse', got: 0, of: 120, total: 86400, paid: 0, due: '', s: 'approval',
    lines: [DL('AU-EAR-TC', 'Type-C Wired Earphones', 114, 710), DL('AC-CHG-20', 'Anker 20W USB-C Charger', 6, 910)] },
  { no: 'PO-2609-0023', date: '17 Sep 2026', at: PO_DAY(17, 9), supplier: 'Dhaka Audio Imports', place: 'Central Warehouse', got: 0, of: 48, total: 38250, paid: 0, due: '', s: 'draft',
    lines: [DL('AC-CHG-20', 'Anker 20W USB-C Charger', 21, 915), DL('AU-EAR-TC', 'Type-C Wired Earphones', 27, 705)] },
  { no: 'PO-2609-0022', date: '16 Sep 2026', at: PO_DAY(16, 9), supplier: 'Chattogram Packaging Co.', place: 'Central Warehouse', got: 0, of: 500, total: 27500, paid: 0, due: '', s: 'approved',
    lines: [DL('', 'Shipping box · Medium', 25, 17, 0, '8941300900014'), DL('', 'Packing tape 2 inch', 475, 57)] },
  { no: 'PO-2609-0021', date: '14 Sep 2026', at: PO_DAY(14, 9), supplier: 'Rahman Telecom', place: 'Central Warehouse', got: 0, of: 200, total: 64800, paid: 0, due: '', s: 'approval',
    lines: [DL('AC-CBL-LTG', 'Lightning Cable 1m', 188, 300), DL('AU-EAR-TC', 'Type-C Wired Earphones', 12, 700)] },
  { no: 'PO-2609-0020', date: '12 Sep 2026', at: PO_DAY(12, 9), supplier: 'Nabil Mobile House', place: 'Central Warehouse', got: 140, of: 240, total: 112600, paid: 50000, due: 'Due 12 Oct 2026', s: 'partial',
    lines: [
      DL('', 'Liquid Silicone Case · Navy · M', 60, 420, 40, '8941200100118'), DL('', 'Liquid Silicone Case · Navy · L', 60, 420, 40, '8941200100125'),
      DL('AC-HLD-CAR', 'Baseus Car Phone Holder', 40, 720, 30, '8941200200214'), DL('', 'Baseus Car Phone Holder · Vent', 40, 720, 30, '8941200200221'),
      DL('', 'Camera Lens Protector · Clear', 40, 115, 0, '8941200300317'),
    ] },
  { no: 'PO-2609-0019', date: '5 Sep 2026', at: PO_DAY(5, 9), supplier: 'Dhaka Audio Imports', place: 'Central Warehouse', got: 96, of: 96, total: 52980, paid: 52980, due: '', s: 'received',
    lines: [DL('AC-CHG-20', 'Anker 20W USB-C Charger', 42, 895, 42), DL('AC-CBL-LTG', 'Lightning Cable 1m', 54, 285, 54)] },
  { no: 'PO-2608-0017', date: '20 Aug 2026', at: PO_DAY(20, 8), supplier: 'Mim Enterprise', place: 'Central Warehouse', got: 60, of: 60, total: 41300, paid: 0, due: 'Overdue 15 days', s: 'received', overdue: true,
    lines: [DL('PB-ANK-10K', 'Anker Power Bank 10000mAh', 8, 2075, 8), DL('AC-STD-FLD', 'Foldable Phone Stand', 52, 475, 52)] },
  { no: 'PO-2609-0018', date: '3 Sep 2026', at: PO_DAY(3, 9), supplier: 'Rahman Telecom', place: 'Central Warehouse', got: 0, of: 150, total: 48600, paid: 0, due: 'Due on delivery', s: 'ordered',
    lines: [DL('AC-CBL-LTG', 'Lightning Cable 1m', 141, 300), DL('AU-EAR-TC', 'Type-C Wired Earphones', 9, 700)] },
  { no: 'PO-2608-0015', date: '12 Aug 2026', at: PO_DAY(12, 8), supplier: 'Rahman Telecom', place: 'Central Warehouse', got: 300, of: 300, total: 95000, paid: 95000, due: '', s: 'closed',
    lines: [DL('AC-CBL-LTG', 'Lightning Cable 1m', 275, 285, 275), DL('AU-EAR-TC', 'Type-C Wired Earphones', 25, 665, 25)] },
  { no: 'PO-2608-0014', date: '8 Aug 2026', at: PO_DAY(8, 8), supplier: 'Nabil Mobile House', place: 'Central Warehouse', got: 0, of: 80, total: 22000, paid: 0, due: '', s: 'cancelled',
    lines: [DL('AC-HLD-CAR', 'Baseus Car Phone Holder', 20, 755), DL('', 'Camera Lens Protector · Clear', 60, 115)] },
];
/** A demo order's status in the words of orders made here. */
export const DEMO_STATUS = { draft: 'Draft', approval: 'Waiting approval', approved: 'Approved', ordered: 'Sent', partial: 'Partly received', received: 'Received', closed: 'Received', cancelled: 'Cancelled' };

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
