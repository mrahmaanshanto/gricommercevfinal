// orderFlow — what the merchant does with an online order after it is placed (statuses: orderStatus.js):
//   announceNewOrder(id)        the "order received" messages, and On hold / Processing / Payment pending
//   verification                startAutoCall / settleAutoCall (the call's answer comes back by itself) ·
//                               recordCall (a manual call's answer) · verifyOf(order)
//   decision                    approve and cancel are in orders.js · requestAdvance / receiveAdvance:
//                               the advance is paid, the order is approved and the rest becomes the COD amount
//   preparing (Approved)        prepOf / updatePrep: courier, address and amounts checked, slip printed,
//                               packed, slip attached → markReady (Ready for courier)
//   courier                     sendToCourier: the courier's API accepts the parcel → Sent to courier (tracking ID,
//                               COD locked, charge, tracking link) · trackingOf: the courier's scans
//   digital orders              isDigitalOrder: every item is a download or a licence key, so the order skips
//                               packing and the courier · sendDigital: the link or key is sent → Delivered
//   courier updates (webhooks)  courierWebhook: out for delivery · delivered · delivery failed · return started;
//                               the same update twice does nothing · syncCourier moves parcels sent from this
//                               browser along with the clock (a failed or held parcel stops until the next update)
//   COD confirmation            confirmQueue / recordConfirm: Order work › Confirm (call answers, follow-ups in Calls)
//   delivery issues             deliveryIssueOf / deliveryIssues / issueAction: Order work › Delivery issues
// Every step logs to the order (orders.js › logOrder) and sends its messages (notifications.js).
// Front end only: the calls, the courier's API and its webhooks are simulated in this browser.

import { getOrders, findOrder, patchOrder, setOrderStatus, logOrder, approveOrder, cancelOrder, deliverOrder, markReturned, isCounterSale } from './orders';
import { addCallTask, getCallTasks, completeCallTask, snoozeCallTask } from './callTasks';
import { onlinePlace } from './locations';
import { notify } from './notifications';
import { postEntry, accountForMethod } from './ledger';
import { courierPartner, courierChargeOf, clockNow } from './settlements';
import { formatBDT, formatDate, formatTime } from './format';
import { allProducts } from './products';
import { productBy, addMove } from './stock';
import { trackingOf as serialKind, checkSerial, sellSerials } from './serials';
import { keysOf } from './licenceKeys';
import { trackingLink } from './orderStatus';

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

// ---- digital orders ------------------------------------------------------------------------------------------
const DIGITAL = ['digital', 'licence'];
/** Every item is a download or a licence key (product format): no packing, no courier. Mixed orders ship. */
export function isDigitalOrder(o, list = allProducts()) {
  const lines = (o && o.lines) || [];
  return lines.length > 0 && lines.every((l) => {
    const row = productBy(l.sku || l.name);
    const p = (row && row.productId && list.find((x) => x.id === row.productId)) || list.find((x) => x.name === l.name);
    return !!p && DIGITAL.includes(p.format);
  });
}
// ON-F14: what a digital order gives the customer. A licence product gets one key per piece from its pool
// (licenceKeys.js: the stock move of the sale takes them, so a key is never given twice); a download gets its own
// link. Kept on the order as o.digital = { at, by, sends, keys: [{ name, sku, key }], links: [{ name, url, file, limit,
// days }], short } and sent with the "Download or key sent" message ({{licence_key}}, {{download_link}}).
// Front end only: the link is made here; a real shop's server makes it and counts the downloads.
const productOfLine = (l, list = allProducts()) => { const row = productBy(l.sku || l.name); return (row && row.productId && list.find((x) => x.id === row.productId)) || list.find((x) => x.name === l.name) || null; };
/** The keys and links the order has (take: true takes the keys still missing from the pool). */
export function digitalItems(o, { take = false, by = 'Staff' } = {}) {
  const list = allProducts();
  const keys = [], links = [];
  let short = 0;
  (o.lines || []).forEach((l) => {
    const p = productOfLine(l, list);
    if (!p) return;
    const sku = (productBy(l.sku || l.name) || {}).sku || p.sku;
    if (p.format === 'licence') {
      const mine = () => keysOf(sku).filter((k) => k.ref === o.id && k.status === 'assigned');
      let got = mine();
      const missing = (Number(l.qty) || 1) - got.length;
      if (take && missing > 0) { addMove({ sku, place: onlinePlace(), qty: -missing, kind: 'sale', reason: 'Digital order sent', by, ref: o.id, who: o.customer }); got = mine(); }
      got.forEach((k) => keys.push({ name: l.name, sku, key: k.key }));
      short += Math.max(0, (Number(l.qty) || 1) - got.length);
    } else if (p.format === 'digital') {
      const token = (hash(o.id + sku) % 2176782336).toString(36).toUpperCase().padStart(6, '0');
      const d = p.digital || {};
      links.push({ name: l.name, sku, url: 'https://dazzleshop.com.bd/download/' + token, file: d.file || '', limit: d.limit || 0, days: d.days || 0 });
    }
  });
  return { keys, links, short };
}
const digitalExtra = (d, once) => ({ keys: d.keys.map((k) => k.key), download: d.links.map((x) => x.url).join(' '), once });
/** The download link or licence key is sent: an approved digital order is delivered. Returns false otherwise, or
 *  { ok, keys, links, short } (short: keys the pool ran out of). */
export function sendDigital(o, by = 'Staff') {
  if (!o || o.statusKey !== 'approved' || !isDigitalOrder(o)) return false;
  // delivered first: its sale moves take the licence keys from the pool (stock.js)
  deliverOrder(o, by);
  const fresh = findOrder(o.id) || o;
  const d = digitalItems(fresh, { take: true, by });
  patchOrder(fresh, { digital: { at: clockNow(), by, sends: 1, keys: d.keys, links: d.links, short: d.short } });
  logOrder(o.id, 'send', d.keys.length ? 'Licence key sent' : 'Download link sent', [d.keys.length ? d.keys.length + (d.keys.length === 1 ? ' key' : ' keys') : '', d.links.length ? d.links.length + (d.links.length === 1 ? ' link' : ' links') : '', d.short ? d.short + ' key short' : '', by].filter(Boolean).join(' · '));
  notify(fresh, 'digital-sent', digitalExtra(d, 1));
  return { ok: true, ...d };
}
/** Send the same keys and links again (a lost message). */
export function resendDigital(o, by = 'Staff') {
  if (!o || !o.digital) return false;
  const sends = (o.digital.sends || 1) + 1;
  patchOrder(o, { digital: { ...o.digital, sends, lastSent: clockNow() } });
  logOrder(o.id, 'send', 'Download or key sent again', by);
  notify(o, 'digital-sent', digitalExtra({ keys: o.digital.keys || [], links: o.digital.links || [] }, sends));
  return true;
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
// the confirmation queue's own answers (Order work › Confirm), shown wherever a call's answer is shown
const MORE_RESULTS = [['call-later', 'Call later'], ['wants-change', 'Wants a change'], ['needs-advance', 'Needs advance']];
export const callResultLabel = (k) => ([...CALL_RESULTS, ...MORE_RESULTS].find((r) => r[0] === k) || [k, k])[1];
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
  return { ...base, ...(o.prep || {}), courier, serialsOk: past || serialsDone(o) };
}
export const prepDone = (p) => !!(p.courier && p.packed && p.slipPrinted && p.slipAttached && p.serialsOk !== false);

// ---- IMEI / serial numbers on a courier order (a phone, earbuds …: one number for each piece, taken when packing) ----
/** The order's lines that need a number per piece: [{ i, name, qty, kind 'imei'|'serial', serials[] }]. */
export function serialLinesOf(o) {
  const got = (o.prep && o.prep.serials) || {};
  return (o.lines || []).map((l, i) => {
    let kind = '';
    try { kind = serialKind(l.sku || l.name); } catch { kind = ''; }
    return { i, name: l.name, sku: l.sku || ((productBy(l.name) || {}).sku) || '', qty: Number(l.qty) || 1, kind, serials: got[i] || [] };
  }).filter((x) => x.kind);
}
export const serialsDone = (o) => serialLinesOf(o).every((x) => x.serials.filter(Boolean).length >= x.qty);
/** Put a number on piece n of line i (checked like at the POS). → { ok, error?, warn? } */
export function setPackSerial(o, i, n, raw) {
  const line = serialLinesOf(o).find((x) => x.i === i);
  if (!line) return { ok: false, error: 'This item takes no number.' };
  const taken = serialLinesOf(o).flatMap((x) => x.serials.filter((v, k) => !(x.i === i && k === n)));
  const chk = raw ? checkSerial(raw, { sku: line.sku, kind: line.kind, taken }) : { ok: true, serial: '' };
  if (!chk.ok) return chk;
  const serials = { ...((o.prep && o.prep.serials) || {}) };
  const list = (serials[i] || []).slice();
  list[n] = chk.serial;
  serials[i] = list;
  updatePrep(o, { serials });
  return chk;
}
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
/** Book the parcel with the courier (its API checks phone and address). Sent to courier when it is accepted. */
export function sendToCourier(o) {
  // booked once: a second press (or a retry after a slow answer) returns the parcel already booked
  if (o.sentAt && o.consignment && o.consignment !== '—') return { ok: true, id: o.consignment, courier: o.courier, duplicate: true };
  if (!['approved', 'ready'].includes(o.statusKey)) return { ok: false, error: 'Only approved or packed orders can be sent to the courier.' };
  const courier = prepOf(o).courier;
  if (!COURIERS.includes(courier)) return { ok: false, error: 'Choose a courier first.' };
  if (serialLinesOf(o).length && !serialsDone(o)) return { ok: false, error: 'Add the IMEI / serial number of each piece first (Prepare parcel).' };
  if (!/^01[3-9]\d{8}$/.test(digits(o.phone))) return { ok: false, error: `${courier} rejected it: phone number not valid.` };
  if (!String(o.address || '').trim()) return { ok: false, error: `${courier} rejected it: no address.` };
  const at = clockNow();
  const id = PREFIX[courier] + '-' + (4400000 + (hash(o.id + courier + at) % 5599999));
  const cod = Math.max(0, (o.amount || 0) - (o.paid || 0));
  // the customer's tracking page (screens/storefront/TrackOrder.jsx), found by the order number and their phone
  const trackingUrl = trackingLink(o.id);
  const sent = { courier, consignment: id, codAmount: cod, codLocked: at, courierCharge: courierCharge(courier, o.zone), trackingUrl, sentAt: at, hooks: [] };
  patchOrder(o, sent);
  // the numbers packed in the parcel leave the shelf (serial register; the order page and the warranty read them)
  const sl = serialLinesOf(o);
  if (sl.length) { try { sellSerials({ id: o.id, at, customer: { name: o.customer }, place: onlinePlace(), cashier: 'Courier order', lines: sl.map((x) => ({ sku: x.sku, name: x.name, serials: x.serials.filter(Boolean) })) }); } catch { /* the register catches up */ } }
  setOrderStatus(o, 'Sent to courier');
  logOrder(o.id, 'truck', 'Sent to courier', `${courier} · ${id} · COD ${formatBDT(cod)}`);
  notify({ ...o, ...sent }, 'in-transit');
  return { ok: true, id, courier };
}

const SCANS = [[1.5, 'picked', 'Picked up'], [6, 'hub', 'At sorting hub'], [11, 'dispatched', 'Sent to delivery area']];
export const HOOK_LABEL = { out: 'Out for delivery', delivered: 'Delivered', failed: 'Delivery failed', held: 'Held at hub', return: 'Return started' };
/** The courier's scans for a parcel, newest first: [{ at, code, text }]. */
export function trackingOf(o, now = clockNow()) {
  if (!o || !o.times || !o.times.shipped || isCounterSale(o)) return [];
  const start = o.sentAt || o.times.shipped;
  const end = o.times.delivered || o.times.returned || Infinity;
  const ev = [{ at: start, code: 'booked', text: `Booked with ${o.courier}` }];
  SCANS.forEach(([h, code, text]) => { const at = start + h * HOUR; if (at <= now && at < end) ev.push({ at, code, text }); });
  const hooks = o.hooks || [];
  hooks.forEach((h) => ev.push({ at: h.at, code: h.code, text: (HOOK_LABEL[h.code] || h.code) + (h.reason ? ' · ' + h.reason : '') }));
  if (!hooks.length) {
    // the demo's own parcels: their end from their times
    if (o.times.delivered) { ev.push({ at: o.times.delivered - 3 * HOUR, code: 'out', text: 'Out for delivery' }, { at: o.times.delivered, code: 'delivered', text: 'Delivered' }); }
    if (o.times.returned) { ev.push({ at: o.times.returned - 22 * HOUR, code: 'failed', text: 'Delivery failed' }, { at: o.times.returned, code: 'return', text: 'Return started' }); }
  }
  return ev.filter((e) => e.at <= now).sort((a, b) => b.at - a.at);
}

/** A courier update (webhook). The same event id twice changes nothing. Returns { ok, duplicate }.
 *  extra: { reason } the courier's note (a failed or held parcel), { at } when it happened, { quiet } no messages. */
export function courierWebhook(o, code, eventId, extra = {}) {
  const hooks = o.hooks || [];
  if (hooks.some((h) => h.eventId === eventId)) return { ok: false, duplicate: true };
  const reason = extra.reason || (code === 'failed' ? FAIL_REASONS[hash(o.id + eventId) % FAIL_REASONS.length] : code === 'held' ? HOLD_REASONS[hash(o.id + eventId) % HOLD_REASONS.length] : '');
  patchOrder(o, { hooks: [...hooks, { at: extra.at || clockNow(), code, eventId, ...(reason ? { reason } : {}) }] });
  const live = { ...o, hooks };
  if (code === 'out' && !extra.quiet) notify(live, 'out-for-delivery', { once: eventId });
  if (code === 'failed') { if (!extra.quiet) notify(live, 'delivery-failed', { once: eventId }); logOrder(o.id, 'circle-alert', 'Delivery failed', [o.courier, reason].filter(Boolean).join(' · ')); }
  if (code === 'held') logOrder(o.id, 'warehouse', 'Held at hub', [o.courier, reason].filter(Boolean).join(' · '));
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
    if (codes.includes('failed') || codes.includes('held') || codes.includes('return')) return;
    if (now >= o.sentAt + 20 * HOUR && !codes.includes('out')) { courierWebhook(o, 'out', 'auto-out-' + o.id); moved += 1; }
    const fresh = findOrder(o.id);
    if (now >= o.sentAt + 26 * HOUR && fresh) { courierWebhook(fresh, 'delivered', 'auto-delivered-' + o.id); moved += 1; }
  });
  return moved;
}

// ---- COD confirmation (Order work › Confirm) ------------------------------------------------------------------
// Staff call each On hold (cash on delivery) order before approving it. One tap writes the answer to the order's
// activity and does what it means:
//   confirmed      the call is noted and the order is approved (stock held or taken at the online place)
//   no-answer      try again at a set time · call-later: the customer asked for another time. Both add a follow-up
//                  to Calls › Tasks (callTasks.js, one open task per order) and move the order to the end of the queue
//   wants-change   what the customer wants changed is noted; the order is edited on its page, then confirmed
//   needs-advance  an advance is asked for (the payment link goes out); the order waits for it on its page
//   cancel         the order is cancelled with the customer's reason
// The order keeps o.confirm = { attempts, last: { outcome, at, by, note }, retryAt } (attempts = calls made).
export const CONFIRM_OUTCOMES = [['confirmed', 'Confirmed'], ['no-answer', 'No answer'], ['call-later', 'Call later'], ['wants-change', 'Wants a change'], ['needs-advance', 'Needs advance'], ['cancel', 'Cancel order']];
export const confirmLabel = (k) => (CONFIRM_OUTCOMES.find((r) => r[0] === k) || [k, k])[1];
export const CANCEL_REASONS = ['Customer changed their mind', 'Ordered by mistake', 'Found it cheaper elsewhere', 'Delivery takes too long', 'Fake or test order', 'Wrong number'];
export const confirmOf = (o) => ({ attempts: 0, last: null, retryAt: 0, ...((o && o.confirm) || {}) });

/** "today, 4:30 PM" · "tomorrow, 10:00 AM" · "16 Oct 2026, 10:00 AM" */
export function whenText(t, now = clockNow()) {
  const day = (x) => { const d = new Date(x); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const diff = Math.round((day(t) - day(now)) / (24 * HOUR));
  return (diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : formatDate(t)) + ', ' + formatTime(t);
}

/** On hold online orders waiting for the call: the ones due now first (oldest first), then the ones to call later. */
export function confirmQueue(all = getOrders(), now = clockNow()) {
  return all.filter((o) => o.statusKey === 'onhold' && !isCounterSale(o) && !o.isInvoice)
    .map((o) => { const c = confirmOf(o); return { ...o, confirmInfo: c, dueNow: !(c.retryAt > now) }; })
    .sort((a, b) => (a.dueNow === b.dueNow ? 0 : a.dueNow ? -1 : 1) || (a.dueNow ? a.at - b.at : a.confirmInfo.retryAt - b.confirmInfo.retryAt));
}

const taskKey = (o) => 'confirm|' + o.id;
const openTaskOf = (o) => getCallTasks({ status: 'open' }).find((t) => t.once === taskKey(o)) || null;
/** A follow-up call in Calls › Tasks at `at` (the order's open one is moved when it exists). */
function followUp(o, at, reason, note) {
  const r = addCallTask({ source: 'Orders', reason, customer: { name: o.customer, phone: o.phone }, amount: o.amount, ref: o.id, due: at, once: taskKey(o), note: note || o.itemTitle || '' });
  if (r.duplicate && r.task) snoozeCallTask(r.task.id, at);
  return r;
}
const closeTask = (o, outcome, note, by) => { const t = openTaskOf(o); if (t) completeCallTask(t.id, { outcome, note, by }); };

/** Write down the confirmation call's answer and do what it means. → { ok, error?, approved?, retryAt?, task? } */
export function recordConfirm(o, outcome, { retryAt = 0, note = '', amount = 0, reason = '', place = onlinePlace(), by = 'Staff' } = {}) {
  if (!o || o.statusKey !== 'onhold') return { ok: false, error: 'This order is no longer on hold.' };
  const at = clockNow();
  const attempts = confirmOf(o).attempts + 1;
  const keep = (more = {}) => patchOrder(o, { confirm: { attempts, last: { outcome, at, by, note: note || reason || '' }, retryAt: 0, ...more } });
  if (outcome === 'confirmed') {
    recordCall(o, 'confirmed', note, by);
    keep();
    closeTask(o, 'Confirmed', note, by);
    return { ok: true, approved: approveOrder(findOrder(o.id) || o, place, by) };
  }
  if (outcome === 'no-answer' || outcome === 'call-later') {
    const when = retryAt > at ? retryAt : at + HOUR;
    if (outcome === 'no-answer') recordCall(o, 'no-answer', note, by);
    else {
      patchOrder(o, { verify: { state: 'call-later', method: 'manual', at, by, note } });
      logOrder(o.id, 'phone-forwarded', 'Call: Call later', [note, by].filter(Boolean).join(' · '));
    }
    keep({ retryAt: when });
    logOrder(o.id, 'alarm-clock', 'Call again ' + whenText(when, at), `Attempt ${attempts}`);
    const t = followUp(o, when, outcome === 'no-answer' ? 'Confirm order: no answer' : 'Confirm order: call back', note);
    return { ok: true, retryAt: when, task: !t.error };
  }
  if (outcome === 'wants-change') {
    if (!note.trim()) return { ok: false, error: 'Write what the customer wants changed.' };
    patchOrder(o, { verify: { state: 'wants-change', method: 'manual', at, by, note } });
    logOrder(o.id, 'pencil', 'Customer wants a change', [note, by].filter(Boolean).join(' · '));
    keep();
    return { ok: true };
  }
  if (outcome === 'needs-advance') {
    if (!(amount > 0)) return { ok: false, error: 'Enter the advance to ask for.' };
    patchOrder(o, { verify: { state: 'needs-advance', method: 'manual', at, by, note } });
    requestAdvance(o, amount);
    keep();
    return { ok: true };
  }
  if (outcome === 'cancel') {
    if (!reason) return { ok: false, error: 'Choose why the order is cancelled.' };
    recordCall(o, 'declined', reason, by);
    keep();
    closeTask(o, reason === 'Wrong number' ? 'Wrong number' : 'Not interested', reason, by);
    cancelOrder(findOrder(o.id) || o, 'Cancelled on the confirmation call', by, reason);
    return { ok: true };
  }
  return { ok: false, error: 'Unknown answer.' };
}

// ---- delivery issues (Order work › Delivery issues) -------------------------------------------------------------
// A parcel the courier could not deliver (Delivery failed) or keeps at its hub (Held at hub) is an issue until the
// courier's next update (out for delivery, delivered, return started) or until the return is approved here.
// Saving it before it comes back (RTO) is where a COD shop keeps its margin: call the customer, reschedule, fix the
// address, tell the courier, or approve the return. Each step is written to the order (o.issueLog) and its activity.
// Front end only: a real shop sends the reschedule, the new address and the note through the courier's API.
export const FAIL_REASONS = ['Customer not reachable', 'Customer asked for another day', 'Address not found', 'Customer refused the parcel', 'Cash not ready'];
export const HOLD_REASONS = ['Address unclear', 'Phone switched off', 'Area not served today'];
export const ISSUE_ACTIONS = { called: 'Customer called', reschedule: 'Delivery rescheduled', address: 'Address fixed', courier: 'Courier told', return: 'Return approved' };
const ISSUE_ICON = { called: 'phone-call', reschedule: 'calendar-clock', address: 'map-pin', courier: 'truck', return: 'undo-2' };
const ENDS_ISSUE = ['out', 'delivered', 'return'];

/** "Thu 16 Oct" for a yyyy-mm-dd day. */
export const dayText = (d) => { const x = new Date(String(d) + 'T10:00:00'); return Number.isNaN(x.getTime()) ? String(d || '') : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][x.getDay()] + ' ' + formatDate(x).replace(/ \d{4}$/, ''); };

/** The parcel's open delivery issue: { code, label, reason, at, tries, acts, last, rescheduledFor } or null. */
export function deliveryIssueOf(o) {
  if (!o || o.statusKey !== 'shipped') return null;
  const hooks = (o.hooks || []).filter((h) => h.code in HOOK_LABEL).slice().sort((a, b) => a.at - b.at);
  const last = hooks[hooks.length - 1];
  if (!last || ENDS_ISSUE.includes(last.code) || !['failed', 'held'].includes(last.code)) return null;
  const acts = (o.issueLog || []).filter((a) => a.at >= last.at);
  const resched = acts.filter((a) => a.kind === 'reschedule').pop();
  return { code: last.code, label: HOOK_LABEL[last.code], reason: last.reason || '', at: last.at, tries: hooks.filter((h) => h.code === 'failed').length, acts, last: acts[acts.length - 1] || null, rescheduledFor: resched ? resched.date : '' };
}
/** Online parcels with an open delivery issue, the oldest problem first. */
export function deliveryIssues(all = getOrders()) {
  return all.filter((o) => !isCounterSale(o) && !o.isInvoice).map((o) => ({ ...o, issue: deliveryIssueOf(o) })).filter((o) => o.issue).sort((a, b) => a.issue.at - b.issue.at);
}
/** One step on a delivery issue: 'called' (note) · 'reschedule' (date yyyy-mm-dd, note) · 'address' (address) ·
 *  'courier' (note) · 'return' (reason). → { ok, error? } */
export function issueAction(o, kind, { note = '', date = '', address = '', reason = '', by = 'Staff' } = {}) {
  const issue = deliveryIssueOf(o);
  if (!issue) return { ok: false, error: 'This parcel has no open delivery problem.' };
  if (!ISSUE_ACTIONS[kind]) return { ok: false, error: 'Unknown step.' };
  if (kind === 'called' && !note.trim()) return { ok: false, error: 'Write what the customer said.' };
  if (kind === 'reschedule' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'Pick the new delivery day.' };
  if (kind === 'address' && address.trim().length < 8) return { ok: false, error: 'Enter the full address: house, road, area.' };
  if (kind === 'courier' && !note.trim()) return { ok: false, error: 'Write what to tell the courier.' };
  const entry = { kind, at: clockNow(), by, ...(note.trim() ? { note: note.trim() } : {}), ...(date ? { date } : {}), ...(address.trim() ? { address: address.trim() } : {}), ...(reason ? { reason } : {}) };
  patchOrder(o, { issueLog: [...(o.issueLog || []), entry], ...(kind === 'address' ? { address: address.trim() } : {}) });
  const meta = { called: entry.note, reschedule: [date && dayText(date), entry.note].filter(Boolean).join(' · '), address: entry.address, courier: [o.courier, entry.note].filter(Boolean).join(' · '), return: reason }[kind];
  logOrder(o.id, ISSUE_ICON[kind], ISSUE_ACTIONS[kind], [meta, by].filter(Boolean).join(' · '));
  if (kind === 'return') markReturned(findOrder(o.id) || o, reason || issue.reason || 'Customer not reachable', by);
  return { ok: true };
}

const SEEDED = 'gc.demo.deliveryIssues';
/** The demo's own delivery problems, made once per browser so the queue has something to show: a failed attempt on
 *  #136771 and a parcel held at the hub (the newest parcel with the courier for a few hours). */
export function seedDeliveryIssues(all = getOrders()) {
  if (typeof window === 'undefined') return 0;
  try { if (window.localStorage.getItem(SEEDED)) return 0; window.localStorage.setItem(SEEDED, '1'); } catch { return 0; }
  const now = clockNow();
  const shipped = all.filter((o) => o.statusKey === 'shipped' && !isCounterSale(o) && !o.isInvoice && !o.made && !(o.hooks || []).length);
  const a = shipped.find((o) => o.id === '#136771') || shipped[shipped.length - 1];
  const b = shipped.filter((o) => o !== a && o.times && o.times.shipped && o.times.shipped < now - 6 * HOUR).sort((x, y) => y.at - x.at)[0];
  let n = 0;
  if (a) { courierWebhook(a, 'failed', 'demo-failed-' + a.id, { reason: 'Customer not reachable', at: now - 5 * HOUR, quiet: true }); n += 1; }
  if (b) { courierWebhook(b, 'held', 'demo-held-' + b.id, { reason: 'Address unclear', at: now - 2 * HOUR, quiet: true }); n += 1; }
  return n;
}
/** Demo: the courier reports a failed attempt on the newest parcel with the courier that has no problem yet.
 *  Returns the order id, or '' when no parcel is with the courier. */
export function demoFailedDelivery(all = getOrders()) {
  const o = all.filter((x) => x.statusKey === 'shipped' && !isCounterSale(x) && !x.isInvoice && !deliveryIssueOf(x)).sort((a, b) => b.at - a.at)[0];
  if (!o) return '';
  courierWebhook(o, 'failed', 'demo-failed-' + o.id + '-' + Date.now().toString(36));
  return o.id;
}

// ---- courier handover (ON-F12) -----------------------------------------------------------------------------------
// The daily hand-over to the courier's rider: pick the courier, scan or tick its parcels (packed for it, or booked in
// the last day and not handed over yet), check the count and the cash to collect, print the manifest for the rider to
// sign, then mark them handed over. A packed parcel not booked yet is booked with the courier first (sendToCourier).
// Each handed-over order keeps o.handover = { at, by, rider, manifest }; the manifests are kept in this browser
// (gc.courierHandovers): { id 'HM-0001', at, by, courier, rider, parcels: [{ id, tracking, customer, area, cod }], cod }.
const HANDOVER_KEY = 'gc.courierHandovers';
export const HANDOVER_EVENT = 'gc:courier-handover';
const readHandovers = () => { if (typeof window === 'undefined') return []; try { return JSON.parse(window.localStorage.getItem(HANDOVER_KEY)) || []; } catch { return []; } };
/** Every manifest, newest first. */
export const handovers = () => readHandovers().slice().sort((a, b) => b.at - a.at);
/** The courier's parcels waiting for its rider: packed for it, or booked with it in the last day and not handed over. */
export function handoverParcels(courier, all = getOrders(), now = clockNow()) {
  return all.filter((o) => !isCounterSale(o) && !o.isInvoice && !o.handover && (
    (o.statusKey === 'ready' && prepOf(o).courier === courier)
    || (o.statusKey === 'shipped' && o.courier === courier && (o.sentAt || (o.times && o.times.shipped) || 0) >= now - 24 * HOUR && !(o.hooks || []).some((h) => ['out', 'delivered', 'failed', 'return'].includes(h.code)))
  )).map((o) => ({ ...o, booked: o.statusKey === 'shipped', cod: o.codAmount != null ? o.codAmount : Math.max(0, (o.amount || 0) - (o.paid || 0)) }))
    .sort((a, b) => a.at - b.at);
}
/** Hand the parcels to the rider. → { ok, manifest, failed: [{ id, error }] } */
export function handOver(list, { courier, rider = '', by = 'Staff' } = {}) {
  const at = clockNow();
  const all = readHandovers();
  const id = 'HM-' + String(all.reduce((m, x) => Math.max(m, Number(String(x.id).slice(3)) || 0), 0) + 1).padStart(4, '0');
  const parcels = [], failed = [];
  list.forEach((x) => {
    let o = findOrder(x.id);
    if (!o || o.handover) return;
    if (o.statusKey === 'ready') {
      const r = sendToCourier(o);
      if (!r.ok) { failed.push({ id: o.id, error: r.error }); return; }
      o = findOrder(o.id) || o;
    }
    patchOrder(o, { handover: { at, by, rider, manifest: id } });
    logOrder(o.id, 'hand-helping', 'Handed to ' + courier, [rider ? 'Rider ' + rider : '', id, by].filter(Boolean).join(' · '));
    parcels.push({ id: o.id, tracking: o.consignment, customer: o.customer, phone: o.phone, area: [o.thana, o.district].filter(Boolean).join(', ') || o.zone || '', cod: o.codAmount != null ? o.codAmount : Math.max(0, (o.amount || 0) - (o.paid || 0)) });
  });
  if (!parcels.length) return { ok: false, manifest: null, failed };
  const manifest = { id, at, by, courier, rider, parcels, cod: parcels.reduce((a, p) => a + (Number(p.cod) || 0), 0) };
  try { window.localStorage.setItem(HANDOVER_KEY, JSON.stringify([manifest, ...all].slice(0, 500))); window.dispatchEvent(new CustomEvent(HANDOVER_EVENT)); } catch { /* storage full */ }
  return { ok: true, manifest, failed };
}
