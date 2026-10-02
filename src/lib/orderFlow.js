// orderFlow — what the merchant does with an online order after it is placed (statuses: orderStatus.js):
//   announceNewOrder(id)        the "order received" messages, and On hold / Processing / Payment pending
//   verification                startAutoCall / settleAutoCall (the call's answer comes back by itself) ·
//                               recordCall (a manual call's answer) · verifyOf(order)
//   decision                    approve and cancel are in orders.js · requestAdvance / receiveAdvance:
//                               the advance is paid, the order is approved and the rest becomes the COD amount
//   preparing (Approved)        prepOf / updatePrep: courier, address and amounts checked, slip printed,
//                               packed, slip attached → markReady (Ready for courier)
//   courier                     sendToCourier: the courier's API accepts the parcel → In transit (tracking ID,
//                               COD locked, charge, tracking link) · trackingOf: the courier's scans
//   courier updates (webhooks)  courierWebhook: out for delivery · delivered · delivery failed · return started;
//                               the same update twice does nothing · syncCourier moves parcels sent from this
//                               browser along with the clock
// Every step logs to the order (orders.js › logOrder) and sends its messages (notifications.js).
// Front end only: the calls, the courier's API and its webhooks are simulated in this browser.

import { getOrders, findOrder, patchOrder, setOrderStatus, logOrder, approveOrder, deliverOrder, markReturned, isCounterSale } from './orders';
import { notify } from './notifications';
import { postEntry, accountForMethod } from './ledger';
import { courierPartner, courierChargeOf, clockNow } from './settlements';
import { formatBDT } from './format';

const HOUR = 60 * 60 * 1000;
const AUTO_CALL_MS = 6000;   // an automatic call answers in a few seconds in the demo
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };

// ---- photos on order items ------------------------------------------------------------------------------
/** A photo for an order line (a data URL, already made small), or null to remove it. Kept with the order. */
export function setLinePhoto(o, index, dataUrl) {
  const photos = { ...(o.photos || {}) };
  if (dataUrl) photos[index] = dataUrl; else delete photos[index];
  patchOrder(o, { photos });
  logOrder(o.id, dataUrl ? 'image-plus' : 'image-minus', dataUrl ? 'Photo added' : 'Photo removed', (o.lines[index] || {}).name || '');
}

// ---- new order ---------------------------------------------------------------------------------------------
const START_EVENT = { onhold: 'on-hold', processing: 'processing', pending: 'payment-pending' };
/** Messages for a new online order: received, then On hold / Processing / Payment pending. */
export function announceNewOrder(id) {
  const o = findOrder(id);
  if (!o || isCounterSale(o) || o.isInvoice) return;
  notify(o, 'new-order');
  if (START_EVENT[o.statusKey]) notify(o, START_EVENT[o.statusKey]);
}

// ---- verification ------------------------------------------------------------------------------------------
export const CALL_RESULTS = [['confirmed', 'Confirmed'], ['no-answer', 'No answer'], ['wrong-number', 'Wrong number'], ['declined', 'Cancelled by customer']];
export const callResultLabel = (k) => (CALL_RESULTS.find((r) => r[0] === k) || [k, k])[1];
/** The order's verification: { state: calling|confirmed|no-answer|wrong-number|declined, method: auto|manual, at, by }. */
export function verifyOf(o, now = clockNow()) {
  if (!o) return null;
  if (o.verify) {
    if (o.verify.state === 'calling' && now - o.verify.at >= AUTO_CALL_MS) return { ...o.verify, state: hash(o.id + o.verify.attempts) % 10 < 8 ? 'confirmed' : 'no-answer', pending: true };
    return o.verify;
  }
  // the demo's own orders were confirmed on a call before they were approved
  if (!o.made && o.times && o.times.approved && !isCounterSale(o) && !o.isInvoice) {
    const auto = hash(o.id) % 3 !== 0;
    return { state: 'confirmed', method: auto ? 'auto' : 'manual', at: o.times.approved - 25 * 60 * 1000, by: auto ? 'Auto call' : 'Lamia Sultana' };
  }
  return null;
}
export function startAutoCall(o) {
  const attempts = ((o.verify && o.verify.attempts) || 0) + 1;
  patchOrder(o, { verify: { state: 'calling', method: 'auto', at: clockNow(), attempts, by: 'Auto call' } });
  logOrder(o.id, 'phone-outgoing', 'Auto call started', `Attempt ${attempts}`);
  notify(o, 'verify-requested', { once: attempts });
}
/** Write down the automatic call's answer once it is in. Returns the answer (or null while it rings). */
export function settleAutoCall(o) {
  const v = verifyOf(o);
  if (!v || !v.pending) return null;
  const { pending, ...done } = v;
  patchOrder(o, { verify: done });
  logOrder(o.id, done.state === 'confirmed' ? 'phone-call' : 'phone-missed', 'Auto call: ' + callResultLabel(done.state), '');
  if (done.state === 'confirmed') notify(o, 'verified');
  return done.state;
}
export function recordCall(o, state, note = '', by = 'Staff') {
  patchOrder(o, { verify: { state, method: 'manual', at: clockNow(), by, note } });
  logOrder(o.id, state === 'confirmed' ? 'phone-call' : 'phone-missed', 'Call: ' + callResultLabel(state), [note, by].filter(Boolean).join(' · '));
  if (state === 'confirmed') notify(o, 'verified');
}

// ---- advance + approve ---------------------------------------------------------------------------------------
export const ADVANCE_METHODS = [['bkash online', 'bKash payment link'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['bank transfer', 'Bank transfer'], ['cash', 'Cash']];
/** Ask for an advance (sends the payment link). */
export function requestAdvance(o, amount) {
  const remaining = Math.max(0, o.amount - (o.paid || 0) - amount);
  patchOrder(o, { advance: { amount, state: 'requested', at: clockNow() } });
  logOrder(o.id, 'send', 'Advance requested', formatBDT(amount));
  notify({ ...o, advance: { amount } }, 'advance-requested', { advance: amount, remaining });
}
/** The advance arrived: the money goes into its account, the order is approved, the rest is the COD amount. */
export function receiveAdvance(o, { amount, method, place }) {
  const at = clockNow();
  const account = accountForMethod(method, false);
  if (account) postEntry({ account, amount, kind: 'order payment', ref: o.id, party: o.customer, note: 'Advance' });
  const paid = (o.paid || 0) + amount;
  const cod = Math.max(0, o.amount - paid);
  patchOrder(o, { payment: 'Partial', paid, codAmount: cod, advance: { amount, state: 'paid', method, at } });
  const next = { ...o, payment: 'Partial', paid, codAmount: cod, advance: { amount } };
  logOrder(o.id, 'hand-coins', 'Advance received', `${formatBDT(amount)} · COD ${formatBDT(cod)}`);
  notify(next, 'advance-received', { advance: amount, remaining: cod });
  approveOrder(next, place);
}

// ---- preparing ---------------------------------------------------------------------------------------------------
export const COURIERS = ['Pathao', 'Steadfast', 'RedX', 'Carrybee'];
const PREFIX = { Pathao: 'PT', Steadfast: 'SF', RedX: 'RX', Carrybee: 'CB' };
/** What the courier charges the shop for this parcel (Accounts › Settlements rates). */
export function courierCharge(courier, zone) {
  const p = courierPartner(courier);
  return p ? Number(courierChargeOf(p, zone)) || 0 : 0;
}
/** The packing checklist; orders already past this step count as done. */
export function prepOf(o) {
  const past = ['ready', 'shipped', 'delivered', 'returned'].includes(o.statusKey);
  const courier = (o.prep && o.prep.courier) || (COURIERS.includes(o.courier) ? o.courier : '');
  const base = { courier, addressOk: past, amountsOk: past, slipPrinted: past, packed: past, slipAttached: past };
  return { ...base, ...(o.prep || {}), courier };
}
export const prepDone = (p) => !!(p.courier && p.packed && p.slipPrinted && p.slipAttached);
export function updatePrep(o, patch) {
  const prep = { ...prepOf(o), ...patch };
  patchOrder(o, { prep });
  if (patch.slipPrinted) logOrder(o.id, 'printer', 'Shipping slip printed', prep.courier);
  return prep;
}
export function markReady(o) {
  setOrderStatus(o, 'Ready for courier');
  logOrder(o.id, 'package', 'Ready for courier', prepOf(o).courier);
  notify(o, 'ready');
}

// ---- courier -----------------------------------------------------------------------------------------------------
/** Book the parcel with the courier (its API checks phone and address). In transit when it is accepted. */
export function sendToCourier(o) {
  // booked once: a second press (or a retry after a slow answer) returns the parcel already booked
  if (o.sentAt && o.consignment && o.consignment !== '—') return { ok: true, id: o.consignment, courier: o.courier, duplicate: true };
  if (!['approved', 'ready'].includes(o.statusKey)) return { ok: false, error: 'Only approved or packed orders can be sent to the courier.' };
  const courier = prepOf(o).courier;
  if (!COURIERS.includes(courier)) return { ok: false, error: 'Choose a courier first.' };
  if (!/^01[3-9]\d{8}$/.test(digits(o.phone))) return { ok: false, error: `${courier} rejected it: phone number not valid.` };
  if (!String(o.address || '').trim()) return { ok: false, error: `${courier} rejected it: no address.` };
  const at = clockNow();
  const id = PREFIX[courier] + '-' + (4400000 + (hash(o.id + courier + at) % 5599999));
  const cod = Math.max(0, (o.amount || 0) - (o.paid || 0));
  const trackingUrl = 'https://gridshop.com.bd/track/' + id;
  const sent = { courier, consignment: id, codAmount: cod, codLocked: at, courierCharge: courierCharge(courier, o.zone), trackingUrl, sentAt: at, hooks: [] };
  patchOrder(o, sent);
  setOrderStatus(o, 'In transit');
  logOrder(o.id, 'truck', 'Sent to courier', `${courier} · ${id} · COD ${formatBDT(cod)}`);
  notify({ ...o, ...sent }, 'in-transit');
  return { ok: true, id, courier };
}

const SCANS = [[1.5, 'picked', 'Picked up'], [6, 'hub', 'At sorting hub'], [11, 'dispatched', 'Sent to delivery area']];
export const HOOK_LABEL = { out: 'Out for delivery', delivered: 'Delivered', failed: 'Delivery failed', return: 'Return started' };
/** The courier's scans for a parcel, newest first: [{ at, code, text }]. */
export function trackingOf(o, now = clockNow()) {
  if (!o || !o.times || !o.times.shipped || isCounterSale(o)) return [];
  const start = o.sentAt || o.times.shipped;
  const end = o.times.delivered || o.times.returned || Infinity;
  const ev = [{ at: start, code: 'booked', text: `Booked with ${o.courier}` }];
  SCANS.forEach(([h, code, text]) => { const at = start + h * HOUR; if (at <= now && at < end) ev.push({ at, code, text }); });
  const hooks = o.hooks || [];
  hooks.forEach((h) => ev.push({ at: h.at, code: h.code, text: HOOK_LABEL[h.code] || h.code }));
  if (!hooks.length) {
    // the demo's own parcels: their end from their times
    if (o.times.delivered) { ev.push({ at: o.times.delivered - 3 * HOUR, code: 'out', text: 'Out for delivery' }, { at: o.times.delivered, code: 'delivered', text: 'Delivered' }); }
    if (o.times.returned) { ev.push({ at: o.times.returned - 22 * HOUR, code: 'failed', text: 'Delivery failed' }, { at: o.times.returned, code: 'return', text: 'Return started' }); }
  }
  return ev.filter((e) => e.at <= now).sort((a, b) => b.at - a.at);
}

/** A courier update (webhook). The same event id twice changes nothing. Returns { ok, duplicate }. */
export function courierWebhook(o, code, eventId) {
  const hooks = o.hooks || [];
  if (hooks.some((h) => h.eventId === eventId)) return { ok: false, duplicate: true };
  patchOrder(o, { hooks: [...hooks, { at: clockNow(), code, eventId }] });
  const live = { ...o, hooks };
  if (code === 'out') notify(live, 'out-for-delivery', { once: eventId });
  if (code === 'failed') { notify(live, 'delivery-failed', { once: eventId }); logOrder(o.id, 'circle-alert', 'Delivery failed', o.courier); }
  if (code === 'delivered' && o.statusKey === 'shipped') deliverOrder(o, o.courier);
  if (code === 'return' && o.statusKey === 'shipped') markReturned(o, 'Courier could not deliver', o.courier);
  return { ok: true, duplicate: false };
}
/** Parcels sent from this browser move on with the clock: out for delivery after 20 h, delivered after 26 h. */
export function syncCourier(all = getOrders()) {
  const now = clockNow();
  let moved = 0;
  all.filter((o) => o.sentAt && o.statusKey === 'shipped').forEach((o) => {
    const codes = (o.hooks || []).map((h) => h.code);
    if (codes.includes('failed') || codes.includes('return')) return;
    if (now >= o.sentAt + 20 * HOUR && !codes.includes('out')) { courierWebhook(o, 'out', 'auto-out-' + o.id); moved += 1; }
    const fresh = findOrder(o.id);
    if (now >= o.sentAt + 26 * HOUR && fresh) { courierWebhook(fresh, 'delivered', 'auto-delivered-' + o.id); moved += 1; }
  });
  return moved;
}
