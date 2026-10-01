// orders — the one list of orders that the order screens read: demo online orders, the online orders that
// keep coming in after September (liveOrders.js), orders made in this browser (Create order, order links,
// POS sales) and the demo wholesale invoices.
// Also what happens to an order: approve (hold stock), cancel (release it), deliver, courier return
// (RTO) and merging a duplicate.
// Front end only: status changes, merged lines, activity and courier-return receipts live in this browser:
//   gc.orders.status  { id: 'Cancelled' }            status of orders not made in this browser
//   gc.orders.edits   { id: { lines, total, ... } }  e.g. after a duplicate was merged in
//   gc.orders.log     { id: [{ at, icon, title, meta }] }
//   gc.orders.rto     { id: [{ at, by, lines: [{ name, good, damaged }] }] }
//   gc.orders.times   { id: { approved, shipped, … } }  status times of orders not made in this browser
// Orders made in this browser keep their changes on their own row (updateOrder).
// Every order has `times` { placed, approved, ready, shipped, delivered, returned, cancelled } (ms or
// null; the demo orders' times are set from their status) and `source` (Website, Facebook, Phone,
// Order link, Chat; '' for counter sales and invoices).

import { extraOrders, updateOrder, STATUS_TIME } from './orderLinks';
import { getInvoices, deliveryOf, statusOf } from './invoices';
import { POS_KEYS, load, save } from './posStore';
import { formatBDT, formatDate } from './format';
import { ORDER_STATUSES } from './orderStatus';
import { getHolds, addHolds, closeHold, holdsFor, endHoldsFor } from './stockHolds';
import { productBy, addMove, stockAt } from './stock';
import { DAMAGED_PLACE } from './locations';
import { addReturn } from './returns';
import { collectCod, removeItem, clockNow } from './settlements';
import { editionChannels } from './edition';
import { liveOrders } from './liveOrders';

const STATUS_KEY = 'gc.orders.status';
const EDITS_KEY = 'gc.orders.edits';
const LOG_KEY = 'gc.orders.log';
const RTO_KEY = 'gc.orders.rto';
const TIMES_KEY = 'gc.orders.times';

export const DEFAULT_HOLD_PLACE = 'Central Warehouse';
/** Which statuses allow which action. */
export const CAN_APPROVE = ['pending'];
export const CAN_CANCEL = ['pending', 'approved', 'ready'];
export const CAN_RETURN = ['ready', 'shipped'];
export const CAN_DELIVER = ['approved', 'ready', 'shipped'];
export const RTO_REASONS = ['Customer refused the parcel', 'Customer not reachable', 'Wrong address', 'Customer cancelled at the door', 'Parcel damaged in transit'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = 24 * 60 * 60 * 1000;
const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const stamp = (t) => {
  const d = new Date(t);
  const h = d.getHours();
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
/** "7 Sep, 8:48 PM" -> timestamp (this year) */
const parsePlaced = (text) => {
  const m = /^(\d{1,2}) ([A-Z][a-z]{2}),? (\d{1,2}):(\d{2}) (AM|PM)/.exec(String(text || ''));
  if (!m) return 0;
  const h = (Number(m[3]) % 12) + (m[5] === 'PM' ? 12 : 0);
  return new Date(2026, Math.max(0, MONTHS.indexOf(m[2])), Number(m[1]), h, Number(m[4])).getTime();
};
const numOf = (text) => Number(String(text).replace(/[^0-9.]/g, '')) || 0;
const digitsOf = (text) => String(text || '').replace(/\D/g, '');
const initialsOf = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const sum = (list, f) => list.reduce((a, x) => a + f(x), 0);
const readMap = (key, fallback) => (typeof window === 'undefined' ? fallback : load(key, fallback));

// ---- order times and source ---------------------------------------------------------------------
const HOUR = 60 * 60 * 1000;
/** Demo times never go past the morning of 1 October (the demo's today). */
const DEMO_CUTOFF = new Date(2026, 9, 1, 10, 0).getTime();
const atCounter = (o) => /^(POS|Wholesale)/.test(String(o.channel || ''));
const blankTimes = (placed) => ({ placed: placed || null, approved: null, ready: null, shipped: null, delivered: null, returned: null, cancelled: null });
/** Where a demo order came from (a few were taken by phone, in chat or through an order link). */
const DEMO_SOURCE = { '#136810': 'Phone', '#136771': 'Chat', '#136742': 'Order link' };
function sourceOf(o) {
  if (o.source) return o.source;
  if (DEMO_SOURCE[o.id]) return DEMO_SOURCE[o.id];
  if (atCounter(o)) return '';
  return { 'Online store': 'Website', 'Facebook shop': 'Facebook', 'Order link': 'Order link', Chat: 'Chat' }[o.channel] || 'Phone';
}
/** The times a demo order went through, from its status: approved an hour after it was placed, packed
 *  3 hours later, with the courier 16 hours after that, delivered or brought back after the zone's days. */
function demoTimes(o) {
  const t = blankTimes(o.at);
  if (atCounter(o)) { t.approved = o.at; if (o.status === 'Delivered') t.delivered = o.at; return t; }
  if (o.status === 'Pending') return t;
  if (o.status === 'Cancelled') { t.cancelled = o.at + 3 * HOUR; return t; }
  t.approved = o.at + HOUR;
  if (o.status === 'Approved') return t;
  t.ready = t.approved + 3 * HOUR;
  if (o.status === 'Ready to ship') return t;
  t.shipped = t.ready + 16 * HOUR;
  const end = t.shipped + ({ 'Inside Dhaka': 1, 'Sub-Dhaka': 2, 'Outside Dhaka': 3 }[o.zone] || 2) * 24 * HOUR;
  if (o.status === 'Delivered') t.delivered = Math.min(end, DEMO_CUTOFF);
  if (o.status === 'Returned') { const got = (RTO_SEED[o.id] || [])[0]; t.returned = Math.max(t.shipped, Math.min(end, DEMO_CUTOFF, got ? got.at - 2 * HOUR : Infinity)); }
  return t;
}

// courier returns already booked in (they match the demo stock holds and the returns history)
const RTO_SEED = {
  '#136804': [{ at: at(30, 9, 30), by: 'Sadia Akter', lines: [{ name: 'Denim Jeans · Blue · 32', good: 1, damaged: 0 }] }],
  '#136799': [{ at: at(29, 11, 0), by: 'Sadia Akter', lines: [{ name: 'Hyaluronic Toner 150ml', good: 0, damaged: 1 }] }],
  '#136795': [{ at: at(29, 15, 40), by: 'Arif Rahman', lines: [{ name: 'Premium Cotton Oversized T-Shirt', good: 1, damaged: 0 }] }],
};

// ---- demo orders ------------------------------------------------------------------------------
const L = (name, qty, price) => ({ name, qty, price });
const NUSRAT = 'House 14, Road 7, Sector 4, Uttara, Dhaka 1230';
const demo = (id, when, channel, customer, phone, zone, address, lines, shipping, courier, consignment, status, payment, more) => ({ id, at: when, channel, customer, phone, zone, address, lines, shipping, courier, consignment, status, payment, ...more });
const DEMO = [
  // #136811 and #136812 are a duplicate pair: same phone, same sunscreen, placed half an hour apart
  demo('#136812', at(30, 10, 5), 'Online store', 'Nusrat Jahan', '01553-336655', 'Inside Dhaka', NUSRAT, [L('Sunscreen SPF 50 · 50ml', 2, 1250)], 70, 'Not assigned', '—', 'Approved', 'COD'),
  demo('#136811', at(30, 9, 41), 'Facebook shop', 'Nusrat Jahan', '01553-336655', 'Inside Dhaka', NUSRAT, [L('Sunscreen SPF 50 · 50ml', 1, 1250), L('Hyaluronic Toner 150ml', 1, 990)], 70, 'Not assigned', '—', 'Pending', 'COD'),
  demo('#136810', at(29, 17, 32), 'Online store', 'Karim Saheb', '01718-445120', 'Inside Dhaka', 'Flat 3B, House 9, Road 2, Mohammadpur, Dhaka 1207', [L('Wireless Earbuds Pro', 1, 3490)], 70, 'Pathao', 'PT-4480127', 'Returned', 'COD', { rtoReason: 'Customer not reachable' }),
  demo('#136804', at(27, 11, 58), 'Online store', 'Salma Begum', '01912-330845', 'Sub-Dhaka', 'Holding 21, Bank Colony, Savar, Dhaka 1340', [L('Denim Jeans · Blue · 32', 1, 1890)], 110, 'Steadfast', 'SF-9931402', 'Returned', 'Paid', { rtoReason: 'Customer refused the parcel' }),
  demo('#136799', at(26, 15, 10), 'Online store', 'Rafiq Mia', '01676-221904', 'Outside Dhaka', 'Kazir Dewri, Chattogram 4000', [L('Hyaluronic Toner 150ml', 1, 990)], 150, 'RedX', 'RX-1190874', 'Returned', 'Paid', { rtoReason: 'Parcel damaged in transit' }),
  demo('#136795', at(26, 11, 20), 'Online store', 'Mahmudul Hasan', '01815-667723', 'Outside Dhaka', 'Zindabazar, Sylhet 3100', [L('Classic White Sneakers', 1, 3450), L('Premium Cotton Oversized T-Shirt', 2, 1240)], 150, 'Steadfast', 'SF-9929915', 'Returned', 'COD', { rtoReason: 'Customer cancelled at the door' }),
  demo('#136779', at(7, 20, 48), 'Online store', 'Nusrat Jahan', '01553-336655', 'Inside Dhaka', NUSRAT, [L('Hyaluronic Toner 150ml', 1, 990)], 70, 'Not assigned', '—', 'Pending', 'Unpaid'),
  demo('#136778', at(7, 19, 12), 'Online store', 'Mostafizur Rahman', '01711-902244', 'Outside Dhaka', '22 Jubilee Road, Chattogram 4000', [L('Daily Care Shampoo 340ml', 1, 420), L('Steel Water Bottle 750ml', 1, 650), L('Mustard Oil 1L Pure Ghani', 1, 320)], 150, 'Steadfast', 'SF-9920841', 'Ready to ship', 'COD'),
  demo('#136776', at(7, 16, 3), 'POS · Dhanmondi · Counter 1', 'Walk-in customer', '—', 'Counter sale', '', [L('Budget Android Phone 6/128', 1, 14990)], 0, 'Store pickup', '—', 'Delivered', 'Paid'),
  demo('#136771', at(6, 11, 40), 'Online store', 'Tanvir Hasan', '01822-771190', 'Sub-Dhaka', 'Block C, Savar, Dhaka 1340', [L('Chickpeas Boot Dal 1kg', 2, 165)], 110, 'Pathao', 'PT-4471203', 'Shipped', 'COD'),
  demo('#136764', at(6, 9, 5), 'Online store', 'Sadia Afrin', '01966-330012', 'Outside Dhaka', 'Zindabazar, Sylhet 3100', [L('Budget Android Phone 6/128', 1, 14990)], 150, 'RedX', 'RX-1180553', 'Approved', 'Partial', { paid: 5000 }),
  demo('#136750', at(5, 18, 22), 'Online store', 'Imran Kabir', '01533-889001', 'Inside Dhaka', 'House 5, Road 12, Banani, Dhaka 1213', [L('Wireless Earbuds Pro', 1, 3490)], 70, 'Carrybee', 'CB-7729014', 'Cancelled', 'Unpaid'),
  demo('#136742', at(5, 13, 15), 'Online store', 'Farhana Islam', '01744-556677', 'Outside Dhaka', 'Amberkhana, Sylhet 3100', [L('Rice Cooker 1.8L Walton', 1, 2950)], 150, 'Steadfast', 'SF-9918770', 'Returned', 'Paid', { rtoReason: 'Wrong address' }),
  demo('#136737', at(4, 10, 48), 'Online store', 'Rakib Uddin', '01677-220945', 'Inside Dhaka', 'House 31, Lake Circus, Kalabagan, Dhaka 1205', [L('Classic White Sneakers', 1, 3450)], 70, 'Pathao', 'PT-4469881', 'Delivered', 'Paid'),
].map((o) => ({ ...o, total: sum(o.lines, (l) => l.price * l.qty) + o.shipping, source: sourceOf(o), times: demoTimes(o) }));

// ---- building the list ------------------------------------------------------------------------
/** A demo wholesale invoice as an order row. */
function fromInvoice(r) {
  const dv = deliveryOf(r).status;
  return {
    id: r.id, at: r.at, placed: formatDate(r.at), channel: 'Wholesale', customer: r.customer.name, phone: r.customer.phone, zone: 'Wholesale', address: '',
    lines: r.lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price, variant: l.meta || '' })),
    courier: { none: 'Not delivered', partial: 'Partly delivered', full: 'Delivered' }[dv], consignment: '—',
    status: dv === 'full' && r.due <= 0 ? 'Delivered' : 'Pending', payment: { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid' }[statusOf(r)],
    total: r.totals.total, paid: r.totals.total - Math.max(0, r.due), invoiceId: r.id, invoiceKind: 'Invoice', isInvoice: true,
    source: '', times: { ...blankTimes(r.at), approved: r.at, delivered: dv === 'full' ? Math.max(...(r.deliveries || []).map((d) => d.at || 0), r.at) : null },
  };
}
/** Old rows made before lines were kept: rebuild one line from the item summary. */
function guessLines(row) {
  const qty = parseInt(row.itemMeta, 10) || 1;
  const sub = numOf(String(row.itemMeta || '').split('·')[1]) || numOf(row.total);
  return [{ name: String(row.itemTitle || 'Item').replace(/ \+ \d+ more$/, ''), qty, price: Math.round(sub / qty) }];
}
function finish(o, sales, statuses, edits, stamped = {}) {
  const row = { ...o, ...(edits[o.id] || {}) };
  if (statuses[o.id]) row.status = statuses[o.id];
  const sale = sales.find((s) => s.orderId === row.id) || null;
  const lines = row.lines && row.lines.length ? row.lines : sale ? sale.lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price, variant: l.meta || '' })) : guessLines(row);
  const units = sum(lines, (l) => l.qty);
  const subtotal = sum(lines, (l) => l.price * l.qty);
  const amount = typeof row.total === 'number' ? row.total : numOf(row.total);
  const when = row.at || parsePlaced(row.placed);
  const paid = row.paid != null ? row.paid : sale ? Math.max(0, sale.totals.total - Math.max(0, sale.due)) : row.payment === 'Paid' ? amount : row.payment === 'Partial' ? null : 0;
  return {
    ...row, lines, units, subtotal, amount, paid, at: when,
    placed: row.placed || stamp(when),
    initials: row.initials || initialsOf(row.customer),
    itemTitle: lines[0].name + (lines.length > 1 ? ` + ${lines.length - 1} more` : ''),
    itemMeta: `${units} item${units === 1 ? '' : 's'} · ${formatBDT(subtotal)}`,
    total: formatBDT(amount),
    statusKey: (ORDER_STATUSES.find((s) => s.label === row.status) || {}).key || '',
    invoiceId: row.invoiceId || (sale ? sale.id : ''),
    invoiceKind: row.invoiceKind || (sale ? (sale.invoice || sale.wholesale || sale.due > 0 ? 'Invoice' : 'Memo') : ''),
    made: !!o.made,
    source: sourceOf(row),
    times: { ...blankTimes(when), ...(row.times || (isCounterSale(row) ? { approved: when, delivered: row.status === 'Delivered' ? when : null } : {})), ...(stamped[o.id] || {}) },
  };
}

/** The demo online orders only (what the server renders before the browser's own data is read). */
export const demoOrders = () => DEMO.map((o) => finish(o, [], {}, {}));

/** Every order: made in this browser first, then the demo wholesale invoices, then the demo orders. */
/** The sales channel an order belongs to: Retail (POS counter), Wholesale (invoice) or Online. */
export const orderChannel = (o) => (o.isInvoice || /^Wholesale/.test(o.channel) ? 'Wholesale' : /^POS/.test(o.channel) ? 'Retail' : 'Online');
/** Every order the site's edition sells through (src/lib/edition.js › editionChannels). */
export function getOrders() {
  const chans = editionChannels();
  return allOrders().filter((o) => chans.includes(orderChannel(o)));
}
function allOrders() {
  if (typeof window === 'undefined') return demoOrders();
  const sales = load(POS_KEYS.sales, []);
  const statuses = readMap(STATUS_KEY, {});
  const edits = readMap(EDITS_KEY, {});
  const stamped = readMap(TIMES_KEY, {});
  const made = extraOrders().map((o) => ({ ...o, made: true }));
  const invoices = getInvoices().filter((r) => r.src === 'demo').map(fromInvoice);
  const live = liveOrders(clockNow());
  // a live order the courier brought back is booked in the next day (the last day's are still to receive)
  LIVE_RTO = {};
  live.forEach((o) => { if (o.status === 'Returned' && o.times.returned + 20 * HOUR <= clockNow()) LIVE_RTO[o.id] = [{ at: o.times.returned + 20 * HOUR, by: 'Sadia Akter', lines: o.lines.map((l) => ({ name: l.name, good: l.qty, damaged: 0 })) }]; });
  return [...made, ...invoices, ...live, ...DEMO].map((o) => finish(o, sales, statuses, edits, stamped));
}
let LIVE_RTO = {};
export const findOrder = (id, all = getOrders()) => all.find((o) => o.id === id) || null;
export const orderHref = (id, from) => '/order-detail?id=' + encodeURIComponent(id) + (from ? '&from=' + from : '');
export const invoiceHref = (id) => '/sales-invoice?id=' + encodeURIComponent(id);
export const isCounterSale = (o) => /^(POS|Wholesale)/.test(o.channel);

// ---- changing an order ------------------------------------------------------------------------
/** Change fields of an order: on its own row when it was made here, otherwise in gc.orders.edits. */
export function patchOrder(o, patch) {
  if (o.made) { updateOrder(o.id, patch); return; }
  const edits = readMap(EDITS_KEY, {});
  save(EDITS_KEY, { ...edits, [o.id]: { ...(edits[o.id] || {}), ...patch } });
}
/** Change the status (a label from orderStatus.js, e.g. 'Cancelled'). Kept in this browser; the time
 *  of the new status is stamped in the order's `times`. */
export function setOrderStatus(o, label) {
  if (o.made) { updateOrder(o.id, { status: label }); return; }
  const was = o.status;
  save(STATUS_KEY, { ...readMap(STATUS_KEY, {}), [o.id]: label });
  const k = STATUS_TIME[label];
  if (k && label !== was) { const map = readMap(TIMES_KEY, {}); save(TIMES_KEY, { ...map, [o.id]: { ...(map[o.id] || {}), [k]: Date.now() } }); }
}
export function logOrder(id, icon, title, meta) {
  const log = readMap(LOG_KEY, {});
  save(LOG_KEY, { ...log, [id]: [{ at: Date.now(), icon, title, meta: meta || '' }, ...(log[id] || [])] });
}
export const logOf = (id) => readMap(LOG_KEY, {})[id] || [];

// ---- duplicates ---------------------------------------------------------------------------------
/** Other open orders from the same phone with at least one same product, placed within 48 hours. */
export function duplicatesOf(order, all) {
  const phone = digitsOf(order.phone);
  if (order.statusKey === 'cancelled' || phone.length < 10) return [];
  const names = new Set(order.lines.map((l) => l.name));
  return all.filter((o) => o.id !== order.id && o.statusKey !== 'cancelled' && digitsOf(o.phone) === phone
    && Math.abs(o.at - order.at) <= 2 * DAY && o.lines.some((l) => names.has(l.name)));
}

// ---- stock held for an order ------------------------------------------------------------------
/** Every hold with this order's number, open or ended. */
export const holdsOfOrder = (id) => getHolds().filter((h) => h.ref === id);
/** Where the order's stock is (or was) held; Central Warehouse when nothing was held. */
export const holdPlaceOf = (id) => (holdsOfOrder(id).find((h) => h.type !== 'damaged') || {}).place || DEFAULT_HOLD_PLACE;
export const heldText = (holds) => holds.map((h) => `${h.qty} × ${h.product} at ${h.place}`).join(', ');
/** Free stock at a place for each line: [{ ...line, known, available, short }]. */
export function availability(lines, place) {
  return lines.map((l) => {
    const known = !!productBy(l.name);
    const available = known ? stockAt(l.name, place).available : 0;
    return { ...l, known, available, short: known && available < l.qty };
  });
}

/** Hold the order's items at one place (nothing happens when they are already held). */
export function holdOrderStock(o, place, note = 'Order approved', by = 'Staff') {
  if (holdsFor(o.id).length) return false;
  addHolds({ type: 'online', ref: o.id, who: o.customer, place, note, by }, o.lines.map((l) => ({ name: l.name, qty: l.qty })));
  return true;
}
export function approveOrder(o, place, by = 'Staff') {
  holdOrderStock(o, place, 'Order approved', by);
  setOrderStatus(o, 'Approved');
  logOrder(o.id, 'circle-check', 'Order approved', `Stock held at ${place} · ${by}`);
}
/** Cancel and release every open hold. Returns the released holds. */
export function cancelOrder(o, why = 'Order cancelled', by = 'Staff') {
  const ended = endHoldsFor(o.id, 'released', why);
  setOrderStatus(o, 'Cancelled');
  logOrder(o.id, 'circle-x', why, (ended.length ? 'Back to stock: ' + heldText(ended) : 'No stock was held') + ' · ' + by);
  return ended;
}
/** Delivered: the held goods left, so they come off the stock. */
export function deliverOrder(o, by = 'Staff') {
  const ended = endHoldsFor(o.id, 'delivered', 'Delivered to the customer');
  ended.forEach((h) => { const p = productBy(h.product); if (p) addMove({ sku: p.sku, place: h.place, qty: -h.qty, kind: 'sale', reason: 'Online order delivered', by, ref: o.id }); });
  setOrderStatus(o, 'Delivered');
  // cash on delivery: the courier has the money now and pays it out later (Accounts › Settlements)
  const cod = collectCod(o, by);
  if (cod) patchOrder(o, { payment: 'Paid', paid: o.amount });
  logOrder(o.id, 'package-check', 'Marked as delivered', (cod ? `${formatBDT(cod.amount)} COD with ${o.courier} · ` : '') + by);
}
/** The courier is bringing the parcel back. The held stock stays held until it is received. */
export function markReturned(o, reason, by = 'Staff') {
  patchOrder(o, { rtoReason: reason });
  setOrderStatus(o, 'Returned');
  removeItem(o.id, 'Parcel returned by the courier');   // not in the courier's next payout any more
  logOrder(o.id, 'undo-2', 'Courier is returning the parcel', `${reason} · ${by}`);
}
/** Move the duplicate's lines into the other order, then cancel the duplicate. */
export function mergeInto(dup, target, by = 'Staff') {
  const lines = target.lines.map((l) => ({ ...l }));
  dup.lines.forEach((l) => {
    const same = lines.find((x) => x.name === l.name && x.price === l.price);
    if (same) same.qty += l.qty; else lines.push({ ...l });
  });
  // delivery is charged once, on the order that stays
  patchOrder(target, { lines, total: target.amount + dup.subtotal });
  const open = holdsFor(target.id);
  if (open.length) addHolds({ type: 'online', ref: target.id, who: target.customer, place: open[0].place, note: `Merged from ${dup.id}`, by }, dup.lines.map((l) => ({ name: l.name, qty: l.qty })));
  logOrder(target.id, 'merge', `Order ${dup.id} merged in`, dup.lines.map((l) => `${l.name} × ${l.qty}`).join(', ') + ' · ' + by);
  return cancelOrder(dup, `Merged into ${target.id}`, by);
}

// ---- courier returns (RTO) --------------------------------------------------------------------
/** Online orders the courier is bringing back or has brought back. */
export const courierReturns = (all) => all.filter((o) => o.statusKey === 'returned' && !isCounterSale(o));
export const rtoReceipts = (id) => readMap(RTO_KEY, RTO_SEED)[id] || LIVE_RTO[id] || [];
/** Per line: sent, received good, received damaged, still with the courier. */
export function rtoState(o) {
  const receipts = rtoReceipts(o.id);
  const lines = o.lines.map((l) => {
    const got = receipts.reduce((a, r) => { const x = r.lines.find((y) => y.name === l.name); return x ? { good: a.good + x.good, damaged: a.damaged + x.damaged } : a; }, { good: 0, damaged: 0 });
    return { ...l, ...got, left: Math.max(0, l.qty - got.good - got.damaged) };
  });
  const sent = sum(lines, (l) => l.qty), good = sum(lines, (l) => l.good), damaged = sum(lines, (l) => l.damaged), left = sum(lines, (l) => l.left);
  return { receipts, lines, sent, good, damaged, left, status: good + damaged === 0 ? 'courier' : left === 0 ? 'received' : 'partial' };
}
/**
 * Book in what came back. `rows` is [{ name, good, damaged }].
 *   good     the hold is released (or, when nothing is held, the stock is added back at the hold place)
 *   damaged  taken out of the hold and set aside at Returns & damaged
 * Each receipt is also written to the returns history.
 */
export function receiveReturn(o, rows, by = 'Staff') {
  const took = rows.filter((r) => r.good + r.damaged > 0);
  if (!took.length) return null;
  const place = holdPlaceOf(o.id);
  took.forEach((r) => {
    const p = productBy(r.name);
    let good = r.good, damaged = r.damaged;
    holdsFor(o.id).filter((h) => h.product === r.name && h.type === 'online').forEach((h) => {
      if (!good && !damaged) return;
      const g = Math.min(good, h.qty), d = Math.min(damaged, h.qty - g), rest = h.qty - g - d;
      closeHold(h.id, 'released', d ? `Courier return: ${g} good, ${d} damaged` : 'Returned by the courier without damage');
      // damaged pieces still counted on this shelf move to the damaged bay (the hold keeps where they came from)
      if (d) addHolds({ type: 'damaged', ref: o.id, who: o.customer, place: h.place, note: 'Courier return: damaged', by }, [{ name: r.name, qty: d }]);
      if (rest) addHolds({ type: 'online', ref: o.id, who: o.customer, place: h.place, note: 'Still with the courier', by }, [{ name: r.name, qty: rest }]);
      good -= g; damaged -= d;
    });
    // nothing held (the stock had already left): good pieces are added back, damaged ones go straight to the bay
    if (good && p) addMove({ sku: p.sku, place, qty: good, kind: 'rto', reason: 'Courier return · good, back on sale', by, ref: o.id });
    if (damaged) addHolds({ type: 'damaged', ref: o.id, who: o.customer, place: DAMAGED_PLACE, note: 'Courier return: damaged', by }, [{ name: r.name, qty: damaged }]);
  });
  const receipt = { at: Date.now(), by, lines: took.map((r) => ({ name: r.name, good: r.good, damaged: r.damaged })) };
  const map = readMap(RTO_KEY, RTO_SEED);
  save(RTO_KEY, { ...map, [o.id]: [...(map[o.id] || []), receipt] });
  const goodText = took.filter((r) => r.good).map((r) => `${r.name} × ${r.good}`).join(', ');
  const damagedText = took.filter((r) => r.damaged).map((r) => `${r.name} × ${r.damaged}`).join(', ');
  const base = { channel: 'Online', ref: o.id, customer: o.customer, type: 'return', amount: 0, money: 'even', method: '', by };
  if (goodText) addReturn({ ...base, items: goodText, stock: 'restock', reason: 'Courier return (RTO) · good', place });
  if (damagedText) addReturn({ ...base, items: damagedText, stock: 'damaged', reason: 'Courier return (RTO) · damaged', place: DAMAGED_PLACE });
  logOrder(o.id, 'package-open', 'Courier return received', [goodText && 'Good: ' + goodText, damagedText && 'Damaged: ' + damagedText, by].filter(Boolean).join(' · '));
  return receipt;
}
