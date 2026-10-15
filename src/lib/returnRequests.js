// returnRequests — returns of delivered online orders (ON-F8). Unlike a counter return (Return & exchange, done on the
// spot), an online return needs the parcel picked up and checked first:
//
//   requested → approved → pickup (pickup booked) → received → refunded | exchanged
//            ↘ rejected (with the reason the customer is told)
//
//   requested  the customer asked on the tracking page (/track), or staff asked for them; items, reason, refund or
//              exchange, and where a refund goes (bKash / Nagad number)
//   approved   staff agree; pickup   the courier is booked to collect it (a pickup ID)
//   received   it is back and checked: good pieces go back on sale at the online place, damaged ones to the damaged
//              bay (a stock move each, as a courier return does); the return is written to the returns history
//   refunded   a refund is made through refunds.js (approval over the refund limit, then sent from an account)
//   exchanged  the same items go out again as a new order (orderLinks.addOrder, ৳0, approved, its stock held / taken)
// Each step is written to the request's history and to the order's activity. Orders › Return requests
// (/return-requests, screens/merchant-orders/ReturnRequests.jsx) is the queue. returns.js keeps the history of
// everything that came back; this file only keeps the requests (gc.returnRequests).
// Front end only: the pickup booking goes through the courier's API on a real server.

import { findOrder, logOrder, isCounterSale, takeOrderStock } from './orders';
import { getOrderRules } from './orderRules';
import { productBy, addMove } from './stock';
import { addHolds } from './stockHolds';
import { DAMAGED_PLACE, onlinePlace } from './locations';
import { addReturn, setRefund } from './returns';
import { requestRefund } from './refunds';
import { addOrder } from './orderLinks';
import { holdsStock } from './edition';
import { notify, notifyCustomer } from './notifications';
import { clockNow } from './settlements';

const KEY = 'gc.returnRequests';
export const RETURN_REQUESTS_EVENT = 'gc:return-requests';
const DAY = 24 * 60 * 60 * 1000;

export const RR_STAGES = [
  ['requested', 'Requested', 'warning'],
  ['approved', 'Approved', 'info'],
  ['pickup', 'Pickup booked', 'info'],
  ['received', 'Received', 'primary'],
  ['refunded', 'Refunded', 'success'],
  ['exchanged', 'Exchanged', 'success'],
  ['rejected', 'Rejected', 'neutral'],
];
export const RR_LABEL = Object.fromEntries(RR_STAGES.map(([k, l]) => [k, l]));
export const RR_TONE = Object.fromEntries(RR_STAGES.map(([k, , t]) => [k, t]));
export const RR_OPEN = ['requested', 'approved', 'pickup', 'received'];
export const RR_REASONS = ['Faulty or not working', 'Damaged in delivery', 'Wrong item sent', 'Not as described', 'Changed my mind'];
export const RR_REJECT = ['Return window passed', 'Used or not in the original box', 'Seal broken', 'Not bought from us', 'Other'];
export const REFUND_TO = ['bKash', 'Nagad', 'Bank transfer', 'Store credit'];
const PICKUP_PREFIX = { Pathao: 'PT', Steadfast: 'SF', RedX: 'RX', Carrybee: 'CB' };

const read = () => { if (typeof window === 'undefined') return []; try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(RETURN_REQUESTS_EVENT)); } catch { /* storage full */ } };
const save = (row) => { const list = read(); write(list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list]); return row; };
const step = (rq, stage, by, note = '', extra = {}) => save({ ...rq, ...extra, stage, history: [...(rq.history || []), { stage, at: clockNow(), by, note }] });

/** Every request, newest first. */
export const returnRequests = () => read().slice().sort((a, b) => b.at - a.at);
export const returnRequestBy = (id) => read().find((x) => x.id === id) || null;
export const requestsForOrder = (orderId) => returnRequests().filter((x) => x.order === orderId);
export const openRequestCount = () => read().filter((x) => RR_OPEN.includes(x.stage)).length;
const units = (lines) => lines.reduce((n, l) => n + (Number(l.qty) || 0), 0);
export const requestValue = (rq) => (rq.lines || []).reduce((a, l) => a + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);

/** Can this order's customer ask for a return now? → { ok, why, until } */
export function canRequestReturn(o, now = clockNow()) {
  if (!o || isCounterSale(o) || o.isInvoice) return { ok: false, why: 'Counter sales are returned at the shop.' };
  if (o.statusKey !== 'delivered') return { ok: false, why: 'A return can be asked for after delivery.' };
  if (requestsForOrder(o.id).some((x) => RR_OPEN.includes(x.stage))) return { ok: false, why: 'A return is already open for this order.' };
  const days = Number(getOrderRules().returnDays) || 0;
  const delivered = (o.times && o.times.delivered) || o.at;
  const until = delivered + days * DAY;
  if (!days || now > until) return { ok: false, why: days ? `Returns are open for ${days} days after delivery.` : 'This shop does not take returns online.', until };
  return { ok: true, why: '', until };
}

/**
 * Ask for a return. lines: [{ name, qty }] (never more than was bought); want: 'refund' | 'exchange';
 * refundTo: { method, number } for a refund. → { ok, request?, error? }
 */
export function requestReturn(o, { lines = [], reason = '', note = '', want = 'refund', refundTo = null, from = 'Customer', by = '' } = {}) {
  const can = canRequestReturn(o);
  if (!can.ok) return { ok: false, error: can.why };
  const picked = lines.map((l) => {
    const line = o.lines.find((x) => x.name === l.name);
    return line ? { name: line.name, sku: line.sku || '', qty: Math.min(Number(line.qty) || 0, Math.max(0, Math.round(Number(l.qty) || 0))), price: Number(line.price) || 0 } : null;
  }).filter((l) => l && l.qty > 0);
  if (!picked.length) return { ok: false, error: 'Choose at least one item to return.' };
  if (!reason) return { ok: false, error: 'Choose why it is coming back.' };
  if (want === 'refund' && refundTo && ['bKash', 'Nagad'].includes(refundTo.method) && !/^01[3-9]\d{8}$/.test(String(refundTo.number || '').replace(/\D/g, '').replace(/^88/, ''))) return { ok: false, error: `Enter the ${refundTo.method} number for the refund.` };
  const all = read();
  const n = all.reduce((m, x) => Math.max(m, Number(String(x.id).slice(3)) || 0), 0) + 1;
  const who = by || (from === 'Customer' ? o.customer : 'Staff');
  const rq = { id: 'RR-' + String(n).padStart(4, '0'), order: o.id, customer: o.customer, phone: o.phone, at: clockNow(), from, lines: picked, reason, note: String(note || '').trim(), want: want === 'exchange' ? 'exchange' : 'refund', refundTo: want === 'exchange' ? null : refundTo, stage: 'requested', history: [{ stage: 'requested', at: clockNow(), by: who, note: reason }] };
  save(rq);
  logOrder(o.id, 'undo-2', 'Return requested', `${picked.map((l) => `${l.name} × ${l.qty}`).join(', ')} · ${rq.want === 'exchange' ? 'Exchange' : 'Refund'} · ${who}`);
  return { ok: true, request: rq };
}

export function approveReturn(id, by = 'Staff') {
  const rq = returnRequestBy(id);
  if (!rq || rq.stage !== 'requested') return null;
  logOrder(rq.order, 'circle-check', 'Return approved', `${rq.id} · ${by}`);
  return step(rq, 'approved', by);
}
export function rejectReturn(id, reason, by = 'Staff') {
  const rq = returnRequestBy(id);
  if (!rq || !['requested', 'approved'].includes(rq.stage) || !reason) return null;
  logOrder(rq.order, 'circle-x', 'Return rejected', `${reason} · ${by}`);
  return step(rq, 'rejected', by, reason, { rejectReason: reason });
}
/** Book the courier to collect it. */
export function bookReturnPickup(id, courier, by = 'Staff') {
  const rq = returnRequestBy(id);
  if (!rq || rq.stage !== 'approved' || !courier) return null;
  const pickupId = (PICKUP_PREFIX[courier] || 'RP') + '-R' + String(Math.floor(clockNow() / 1000) % 1000000).padStart(6, '0');
  logOrder(rq.order, 'truck', 'Return pickup booked', `${courier} · ${pickupId} · ${by}`);
  return step(rq, 'pickup', by, `${courier} · ${pickupId}`, { pickup: { courier, id: pickupId, at: clockNow() } });
}
/**
 * It came back. rows: [{ name, good, damaged }]. Good pieces go back on sale at the online place; damaged ones go to the
 * damaged bay. Written to the returns history.
 */
export function receiveReturnRequest(id, rows, by = 'Staff') {
  const rq = returnRequestBy(id);
  if (!rq || !['approved', 'pickup'].includes(rq.stage)) return null;
  const took = (rows || []).map((r) => {
    const line = rq.lines.find((l) => l.name === r.name);
    if (!line) return null;
    const good = Math.max(0, Math.round(Number(r.good) || 0)), damaged = Math.max(0, Math.round(Number(r.damaged) || 0));
    const over = good + damaged - line.qty;
    return { name: line.name, good: over > 0 ? Math.max(0, good - over) : good, damaged };
  }).filter((r) => r && r.good + r.damaged > 0);
  if (!took.length) return null;
  const place = onlinePlace();
  took.forEach((r) => {
    const p = productBy(r.name);
    if (r.good && p) addMove({ sku: p.sku, place, qty: r.good, kind: 'return', reason: 'Online return · good, back on sale', by, ref: rq.order });
    if (r.damaged) {
      addHolds({ type: 'damaged', ref: rq.order, who: rq.customer, place: DAMAGED_PLACE, note: 'Online return: damaged', by }, [{ name: r.name, qty: r.damaged }]);
      if (p) addMove({ sku: p.sku, place: DAMAGED_PLACE, qty: r.damaged, kind: 'return', reason: 'Online return · damaged', by, ref: rq.order });
    }
  });
  const goodText = took.filter((r) => r.good).map((r) => `${r.name} × ${r.good}`).join(', ');
  const badText = took.filter((r) => r.damaged).map((r) => `${r.name} × ${r.damaged}`).join(', ');
  const base = { channel: 'Online', ref: rq.order, customer: rq.customer, phone: rq.phone, type: rq.want === 'exchange' ? 'exchange' : 'return', amount: 0, money: 'even', method: '', by, request: rq.id };
  if (goodText) addReturn({ ...base, items: goodText, stock: 'restock', reason: 'Online return · ' + rq.reason, place });
  if (badText) addReturn({ ...base, items: badText, stock: 'damaged', reason: 'Online return · ' + rq.reason, place: DAMAGED_PLACE });
  logOrder(rq.order, 'package-open', 'Return received', [goodText && 'Good: ' + goodText, badText && 'Damaged: ' + badText, by].filter(Boolean).join(' · '));
  try { notifyCustomer('return-received', { name: rq.customer, phone: rq.phone }, { ref_id: rq.id }, { ref: rq.id, once: rq.id + '|received' }); } catch { /* messages are not essential */ }
  return step(rq, 'received', by, [goodText && 'Good: ' + goodText, badText && 'Damaged: ' + badText].filter(Boolean).join(' · '), { received: { at: clockNow(), by, rows: took } });
}
/** Give the money back (refunds.js: waits for approval over the refund limit). */
export function refundReturn(id, { amount, method, number = '' } = {}, by = 'Staff') {
  const rq = returnRequestBy(id);
  if (!rq || rq.stage !== 'received') return { ok: false, error: 'Receive the item first.' };
  const amt = Math.round(Number(amount) || 0);
  if (!(amt > 0)) return { ok: false, error: 'Enter the amount to refund.' };
  const m = method || (rq.refundTo && rq.refundTo.method) || 'bKash';
  if (m === 'Store credit') {
    // store credit moves no money: noted on the history row (returns.js › storeCreditFor counts it)
    setRefund(rq.order, rq.at, { amount: amt, method: 'Store credit', note: rq.id });
    logOrder(rq.order, 'wallet', 'Refunded as store credit', `${amt} · ${rq.id} · ${by}`);
    return { ok: true, request: step(rq, 'refunded', by, 'Store credit', { refund: { amount: amt, method: m } }) };
  }
  const rf = requestRefund({ ref: rq.order, customer: rq.customer, phone: number || (rq.refundTo && rq.refundTo.number) || rq.phone, amount: amt, method: m, reason: 'Online return · ' + rq.reason, source: 'Return' });
  if (!rf) return { ok: false, error: 'The refund could not be made.' };
  setRefund(rq.order, rq.at, { amount: amt, method: m, note: rf.id });
  logOrder(rq.order, 'hand-coins', 'Refund made', `${rf.id} · ${m} · ${by}`);
  return { ok: true, refund: rf, request: step(rq, 'refunded', by, `${rf.id} · ${m}`, { refund: { id: rf.id, amount: amt, method: m } }) };
}
/** Send the same items again as a new order at no charge. */
export function exchangeReturn(id, by = 'Staff') {
  const rq = returnRequestBy(id);
  const o = rq ? findOrder(rq.order) : null;
  if (!rq || rq.stage !== 'received' || !o) return { ok: false, error: 'Receive the item first.' };
  const lines = rq.lines.map((l) => ({ name: l.name, sku: l.sku, qty: l.qty, price: 0, listPrice: l.price, variant: (o.lines.find((x) => x.name === l.name) || {}).variant || '' }));
  const row = addOrder({ lines, customer: o.customer, phone: o.phone, zone: o.zone, total: 0, status: 'Approved', payment: 'Paid', paid: 0, channel: 'Online store', source: 'Other', address: o.address || '', shipping: 0,
    district: o.district || '', thana: o.thana || '', note: `Exchange for ${o.id}`, tags: ['Exchange'], more: { exchangeOf: o.id, returnRequest: rq.id } });
  const place = onlinePlace();
  if (holdsStock()) addHolds({ type: 'online', ref: row.id, who: o.customer, place, note: 'Exchange approved', by }, lines.map((l) => ({ name: l.name, qty: l.qty })));
  else { const made = findOrder(row.id); if (made) takeOrderStock(made, place, by); }
  const made = findOrder(row.id);
  if (made) { logOrder(row.id, 'repeat', 'Exchange for ' + o.id, `${rq.id} · ${by}`); notify(made, 'approved'); }
  logOrder(o.id, 'repeat', 'Exchange sent as ' + row.id, `${rq.id} · ${by}`);
  return { ok: true, order: row, request: step(rq, 'exchanged', by, 'New order ' + row.id, { exchange: { order: row.id } }) };
}
/** Units still to come back across open requests (for the figures on the queue page). */
export const openUnits = () => read().filter((x) => ['approved', 'pickup'].includes(x.stage)).reduce((n, x) => n + units(x.lines), 0);
