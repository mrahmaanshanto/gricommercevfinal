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
// Warranty claims (Products › Warranty claims, /warranty-claims) are the same records, with their steps:
//   CLAIM_STEPS                      received → centre (with the service centre) → ready (for pickup) → returned (to
//                                    the customer); or rejected (with the reason). A claim logged on a profile starts
//                                    as 'requested' and counts as Received.
//   getClaims() · claimBy(id) · stepOf(claim) · openClaims()
//   openClaim({ item, problem, phone, name, by })   a claim from the counter (after lookupWarranty)
//   moveClaim(id, step, { by, note, decision })     next step; the customer is told (notifications.js › notifyCustomer,
//                                    'service-ready' / 'service-update') once per step
//   rejectClaim(id, reason, by)
//   lookupWarranty(q)                IMEI / serial, phone or order number → the items with their cover
// Front end only.

import { getOrders } from './orders';
import { load, POS_KEYS } from './posStore';
import { getSerials } from './serials';
import { allProducts } from './products';
import { productBy } from './stock';
import { coverOf } from './warranty';
import { liveSaleOf } from './liveCounterSales';
import { serialBy } from './serials';
import { notifyCustomer } from './notifications';

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
/** The POS sale an order came from (counter sales, including the generated ones after September), or null. */
export const saleOfOrder = (o) => load(POS_KEYS.sales, []).find((x) => x.orderId === o.id || (x.shipOrders || []).some((y) => y.id === o.id)) || liveSaleOf(o.id) || null;
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

// ---- warranty service and claims ---------------------------------------------------------------------------------
export const CLAIM_STEPS = [
  { key: 'received', label: 'Received' },
  { key: 'centre', label: 'With service centre' },
  { key: 'ready', label: 'Ready for pickup' },
  { key: 'returned', label: 'Returned to customer' },
];
export const CLAIM_LABEL = { requested: 'Received', received: 'Received', centre: 'With service centre', ready: 'Ready for pickup', returned: 'Returned to customer', rejected: 'Rejected' };
export const DECISIONS = { repair: 'Repair', replace: 'Replace', refund: 'Refund', credit: 'Store credit' };
// demo claims on units that are in the serial register (lib/serials.js): Nusrat's Redmi phone and earbuds, Karim's Realme
const day = (m, d, h = 11) => new Date(2026, m - 1, d, h, 0).getTime();
const SEED_CLAIMS = [
  { id: 'WR-0003', order: 'ORD-20260928-0014', item: 'Realme Note 50 6/128GB', serials: ['358674110209004'], problem: 'Touch stops working after charging', phone: '', name: 'Karim Saheb', at: day(10, 6), status: 'received', by: 'Sadia Akter', history: [{ status: 'received', at: day(10, 6), by: 'Sadia Akter' }] },
  { id: 'WR-0002', order: '#136410', item: 'Redmi Note 13 8/256GB', serials: ['864291057318404'], problem: 'Battery drains in 4 hours', phone: '01553336655', name: 'Nusrat Jahan', at: day(9, 30), status: 'centre', by: 'Rakib Hasan', decision: 'repair', history: [{ status: 'received', at: day(9, 30), by: 'Rakib Hasan' }, { status: 'centre', at: day(10, 1), by: 'Rakib Hasan', note: 'Sent to Xiaomi service, Mirpur 10' }] },
  { id: 'WR-0001', order: '#136301', item: 'Wireless Earbuds Pro', serials: ['SMX-EP-23Z0007'], problem: 'No sound from the left bud', phone: '01553336655', name: 'Nusrat Jahan', at: day(9, 20), status: 'ready', by: 'Sadia Akter', decision: 'replace', history: [{ status: 'received', at: day(9, 20), by: 'Sadia Akter' }, { status: 'centre', at: day(9, 21), by: 'Sadia Akter' }, { status: 'ready', at: day(9, 27), by: 'Sadia Akter', note: 'New left bud fitted' }] },
];
const readClaims = () => { try { const v = JSON.parse(window.localStorage.getItem(CLAIMS)); return Array.isArray(v) ? v : SEED_CLAIMS; } catch { return SEED_CLAIMS; } };
const writeClaims = (list) => { try { window.localStorage.setItem(CLAIMS, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(CLAIMS_EVENT)); } catch { /* ignore */ } };
const nextId = (list) => 'WR-' + String(list.reduce((m, c) => Math.max(m, Number(String(c.id).split('-').pop()) || 0), 0) + 1).padStart(4, '0');
export const getClaims = () => (typeof window === 'undefined' ? SEED_CLAIMS : readClaims());
export const claimBy = (id) => getClaims().find((c) => c.id === id) || null;
export const claimsFor = (orderId) => getClaims().filter((c) => c.order === orderId);
/** The step a claim is at: 'received' | 'centre' | 'ready' | 'returned' | 'rejected'. */
export const stepOf = (c) => (c.status === 'requested' ? 'received' : c.status);
export const isOpenClaim = (c) => !['returned', 'rejected'].includes(stepOf(c));
export const openClaims = () => getClaims().filter(isOpenClaim);
/** Ask for warranty service on an item ({ problem }). Returns the request. */
export function requestService(item, { problem, phone, name, by }) {
  const list = readClaims();
  const at = Date.now();
  const c = { id: nextId(list), order: item.order, item: item.name, serials: item.serials || [], problem: String(problem || '').trim(), phone, name, at, status: 'requested', by: by || '', history: [{ status: 'received', at, by: by || '' }] };
  writeClaims([c, ...list]);
  return c;
}
/** A claim opened at the counter: the item was handed in. */
export function openClaim({ item, problem, phone, name, by }) {
  const c = requestService(item, { problem, phone, name, by });
  return patchClaim(c.id, { status: 'received' });
}
function patchClaim(id, patch) {
  let out = null;
  writeClaims(readClaims().map((c) => { if (c.id !== id) return c; out = { ...c, ...patch }; return out; }));
  return out;
}
// each step tells the customer (Settings › Notifications › Warranty & service: 'service-ready' when it is ready to
// collect, 'service-update' for the other steps); once per claim and step
function tell(c, step) {
  if (!c.phone) return null;
  try {
    return notifyCustomer(step === 'ready' ? 'service-ready' : 'service-update', { name: c.name, phone: c.phone }, { claim_id: c.id, item_name: c.item, claim_status: step === 'rejected' ? 'not accepted: ' + (c.reason || '') : (CLAIM_LABEL[step] || step).toLowerCase() }, { ref: c.id, once: c.id + '|' + step });
  } catch { return null; }
}
/** Move a claim to a step. Returns { claim, sms } (sms: notifyCustomer's result, null without a phone). */
export function moveClaim(id, step, { by = 'Staff', note = '', decision } = {}) {
  const c = claimBy(id);
  if (!c) return { claim: null };
  const next = patchClaim(id, { status: step, ...(decision ? { decision } : {}), ...(step === 'returned' ? { closedAt: Date.now() } : {}), history: [...(c.history || []), { status: step, at: Date.now(), by, note: String(note || '').trim() }] });
  return { claim: next, sms: tell(next, step) };
}
export function rejectClaim(id, reason, by = 'Staff') {
  const c = claimBy(id);
  if (!c) return { claim: null };
  const next = patchClaim(id, { status: 'rejected', reason: String(reason || '').trim(), closedAt: Date.now(), history: [...(c.history || []), { status: 'rejected', at: Date.now(), by, note: String(reason || '').trim() }] });
  return { claim: next, sms: tell(next, 'rejected') };
}

/** One unit by its IMEI / serial number, with its cover: the sale it was sold on, the customer and the days left. */
function unitItem(u, now) {
  const list = allProducts();
  const order = u.saleId ? getOrders().find((o) => o.id === u.saleId || ((saleOfOrder(o) || {}).id === u.saleId)) : null;
  const start = order ? coverStart(order) : u.soldAt;
  const row = productBy(u.sku || u.product);
  const p = (row && row.productId && list.find((x) => x.id === row.productId)) || list.find((x) => x.sku && x.sku === u.sku) || list.find((x) => x.name === u.product) || null;
  const w = u.state === 'sold' && start ? coverOf(p, start) : null;
  const days = w ? Math.ceil((w.until - now) / DAY) : 0;
  return { key: 'sn:' + u.serial, order: order ? order.id : u.saleId || '', name: u.product, qty: 1, serials: [u.serial], label: w ? w.label : u.state === 'sold' ? 'No warranty' : 'Not sold yet', claim: w ? w.claim : '',
    start, until: w ? w.until : null, days: Math.max(0, days), state: !w ? 'none' : days <= 0 ? 'expired' : days <= 30 ? 'ending' : 'active', name2: order ? order.customer : u.customer || '', phone: order ? order.phone : '' };
}
/** Look up what can be claimed: an IMEI / serial number, a phone number or an order number. */
export function lookupWarranty(q, now = Date.now()) {
  const raw = String(q || '').trim();
  if (!raw) return [];
  const u = serialBy(raw);
  if (u) return [unitItem(u, now)];
  const d = digits(raw);
  if (d.length >= 10 && d.length <= 11) {
    const name = (getOrders().find((o) => digits(o.phone) === d) || {}).customer || '';
    return warrantyItems(raw, now).map((x) => ({ ...x, name2: name, phone: raw }));
  }
  const o = getOrders().find((x) => x.id.toLowerCase() === raw.toLowerCase() || x.id.replace(/^#/, '') === raw.replace(/^#/, ''));
  if (o) return warrantyItems(o.phone, now).filter((x) => x.order === o.id).map((x) => ({ ...x, name2: o.customer, phone: o.phone }));
  return [];
}
