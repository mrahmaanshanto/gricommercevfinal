// posSale — saving a POS sale as one operation, the offline queue and its sync, and held sales.
//
// One operation per sale: the register gives every checkout an operation id (opId). commitSale() records
// the opId with the sale it made; a second call with the same opId (a double tap, a retry, a repeated
// sync) returns that sale and changes nothing: no second order, stock move, payment or serial.
// What a sale records (commitSale):
//   - an order for the items taken at the counter, and one order per other place for items shipped from
//     there ("Fulfil from another place"); those items are held at that place until the order ships;
//   - stock out of the counter's place (or held there for a wholesale invoice);
//   - the money, in the account or card terminal chosen at checkout (posStore.postSaleTenders);
//   - serial / IMEI numbers sold (lib/serials), the customer, wallet and points.
// Offline: a sale completed offline is kept in the queue (gc.pos.queue) with its local number and opId and
// nothing is posted. syncQueue() posts every queued sale that has no conflict; a sale with a conflict waits
// for the cashier: stock below zero, a price changed, or a serial sold meanwhile. Each conflict is accepted,
// adjusted or the sale is voided (resolveConflict); once nothing is left the sale is posted.
// Held sales keep their stock (a hold in lib/stockHolds, ref = held sale number) until they are resumed,
// discarded or expire (POS settings › hold minutes); an expired hold puts the stock back on sale once.
// Front end only: the operation list, queue and held sales are kept in this browser. A real backend would
// enforce the opId on the server; the demo behaves as if it answered.

import { POS_KEYS as KEYS, load, save, postSaleTenders, nextSeq } from './posStore';
import { addOrder } from './orderLinks';
import { productBy, addMove, stockAt, allowNegative } from './stock';
import { addHolds, endHoldsFor, holdsFor } from './stockHolds';
import { recordDelivery } from './invoices';
import { getCustomers, findCustomer, saveCustomerOnce, ADDED_FROM } from './customers';
import { getMembers as getLoyaltyMembers, spendWallet, syncPosPoints } from './loyalty';
import { sellSerials, soldElsewhere } from './serials';
import { logAudit } from './auditLog';

const r2 = (n) => Math.round(n * 100) / 100;
export const CREDIT = 'Due / credit';
export const WALLET = 'Wallet';

// ---- operation ids --------------------------------------------------------------------------------
/** A new operation id for one checkout. */
export const newOpId = (counterId = 'REG') => `op-${counterId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const ops = () => load(KEYS.ops, {});
/** The sale an operation already made (saved or queued), or null. */
export function saleForOp(opId) {
  if (!opId) return null;
  const id = ops()[opId];
  if (id) return load(KEYS.sales, []).find((s) => s.id === id) || getQueue().find((s) => s.id === id) || { id };
  return getQueue().find((s) => s.opId === opId) || null;
}
const markOp = (opId, saleId) => { if (opId) save(KEYS.ops, { ...ops(), [opId]: saleId }); };

// ---- one sale -------------------------------------------------------------------------------------
const lineNet = (l) => l.price * l.qty - Math.min(l.price * l.qty, l.disc || 0);
const skuOf = (l) => l.sku || (productBy(l.name) || {}).sku;

/**
 * Post a completed sale (see the top of this file). `sale` carries everything: lines (frozen), customer,
 * member, earned, totals, tenders, change, due, wholesale, stockOut, place, cashier, counter, opId, ship.
 * Returns { sale, already } — already = this operation was done before and nothing changed.
 */
export function commitSale(sale) {
  const before = saleForOp(sale.opId);
  if (before && !before.queued && load(KEYS.sales, []).some((s) => s.id === before.id)) return { sale: before, already: true };
  const owed = sale.due || 0;
  const status = owed ? 'Pending' : sale.wholesale && !sale.stockOut ? 'Approved' : 'Delivered';
  const payment = !owed ? 'Paid' : owed < sale.totals.total ? 'Partial' : 'Unpaid';
  const who = sale.customer || {};
  const here = sale.lines.filter((l) => !l.from);
  const away = sale.lines.filter((l) => l.from);
  const allNet = sale.lines.reduce((a, l) => a + lineNet(l), 0) || 1;
  const shareOf = (ls) => r2(sale.totals.total * ls.reduce((a, l) => a + lineNet(l), 0) / allNet);
  const channel = (sale.wholesale && !sale.atRetail ? 'Wholesale · ' : 'POS · ') + sale.counter;
  // the sale shows under Orders; an unpaid one stays Pending until it is paid
  const order = here.length ? addOrder({ lines: here, customer: who.name || 'Walk-in customer', phone: who.phone || '—', zone: 'Counter sale', total: away.length ? shareOf(here) : sale.totals.total, status, payment, channel }) : null;
  // items sold here but sent from another place: one order per place, held there until it ships
  const shipOrders = [];
  [...new Set(away.map((l) => l.from))].forEach((from) => {
    const ls = away.filter((l) => l.from === from);
    const o = addOrder({ lines: ls, customer: who.name || 'Walk-in customer', phone: who.phone || '—', zone: 'To ship', address: (sale.ship && sale.ship.address) || '', total: shareOf(ls), status: 'Approved', payment, channel, note: `Sold at ${sale.counter}. Ship from ${from}.`, tags: ['Ship from ' + from] });
    addHolds({ type: 'retail', ref: o.id, who: who.name || 'Walk-in customer', place: from, note: `Sold at ${sale.counter} · to ship`, by: sale.cashier }, ls.map((l) => ({ name: l.name, qty: l.qty })));
    shipOrders.push({ id: o.id, from });
  });
  const saved = { ...sale, orderId: order ? order.id : (shipOrders[0] || {}).id, shipOrders, queued: false, syncState: sale.queued ? 'synced' : undefined, syncedAt: sale.queued ? Date.now() : undefined };
  delete saved.conflicts;
  save(KEYS.sales, [saved, ...load(KEYS.sales, []).filter((s) => s.id !== saved.id)]);
  // stock: a retail sale (or a wholesale customer taking the goods now) leaves this place; otherwise it is
  // held here for the invoice, whose deliveries take it out later
  // (op: the stock lib ignores the same move twice)
  if (sale.stockOut) here.forEach((l) => { const sku = skuOf(l); if (sku) addMove({ sku, place: sale.place, qty: -l.qty, kind: 'sale', reason: 'POS sale', by: sale.cashier, ref: sale.id, op: `${sale.opId || sale.id}:${l.id}` }); });
  else if (here.length) addHolds({ type: 'retail', ref: sale.id, who: who.name || 'Wholesale customer', place: sale.place, note: 'Sold at the counter · waiting for delivery', by: sale.cashier }, here.map((l) => ({ name: l.name, qty: l.qty })));
  let done = saved;
  if (sale.wholesale && sale.stockOut && here.length) {
    // handed over at the counter: the invoice shows a full delivery (and its challan)
    done = recordDelivery({ ...saved, src: 'pos' }, Object.fromEntries(here.map((l) => [l.id, l.qty])), { from: sale.place, how: 'Customer collected from the shop', by: sale.cashier, taker: who.name || '', note: '' });
    delete done.src;
  }
  // the money taken lands in the drawer, the chosen wallet / gateway or the card terminal's account
  postSaleTenders(saved);
  // a mobile number that is not in the customer book yet is kept there
  let bookChanged = false;
  if (who.phone && !findCustomer(getCustomers(), who.phone)) bookChanged = !!saveCustomerOnce({ name: who.name || '', phone: who.phone, types: ['Retail'], addedFrom: ADDED_FROM.pos });
  // wallet money used: the balance the shop holds for the member goes down (no money moves)
  const fromWallet = r2(sale.tenders.filter((x) => x.method === WALLET).reduce((s, x) => s + x.amount, 0));
  const m = sale.member;
  if (fromWallet && m) spendWallet({ phone: m.phone, amount: fromWallet, ref: sale.id, by: sale.cashier, channel: sale.wholesale ? 'Wholesale' : 'Retail', where: sale.counter });
  // points: loyalty.js reads them from the saved sale; the register's own points store follows
  if (m) {
    if (getLoyaltyMembers().some((x) => x.phone === m.phone) || fromWallet) syncPosPoints(m.phone);
    else save(KEYS.points, { ...load(KEYS.points, {}), [m.phone]: m.points - (sale.totals.pointsUsed || 0) + (sale.earned || 0) });
  }
  sellSerials(saved);
  markOp(sale.opId, saved.id);
  return { sale: done, already: false, bookChanged };
}

// ---- offline queue --------------------------------------------------------------------------------
export const getQueue = () => load(KEYS.queue, []);
const saveQueue = (list) => save(KEYS.queue, list);
/** Keep a sale made offline. Returns { sale, already }. */
export function queueSale(sale) {
  const before = saleForOp(sale.opId);
  if (before) return { sale: before, already: true };
  const row = { ...sale, queued: true, syncState: 'queued', offline: true };
  saveQueue([row, ...getQueue()]);
  markOp(sale.opId, row.id);
  return { sale: row, already: false };
}
/** Sales still waiting to be posted (queued or needing review), not voided. */
export const pendingQueue = () => getQueue().filter((s) => s.syncState === 'queued' || s.syncState === 'review');
/** Quantity of each SKU sold offline and not posted yet, at one place (so the offline register doesn't sell it twice). */
export function queuedQty(place) {
  const out = {};
  pendingQueue().forEach((s) => s.lines.forEach((l) => { if (!l.from && s.place === place && s.stockOut) { const k = skuOf(l); out[k] = (out[k] || 0) + l.qty; } }));
  return out;
}

/** The conflicts of one queued sale against today's stock, prices and serials. `demo` adds one of each. */
function conflictsOf(sale, demo) {
  const out = [];
  const used = {};
  sale.lines.forEach((l, i) => {
    const sku = skuOf(l);
    const p = productBy(sku || l.name);
    const place = l.from || sale.place;
    if (sku && (sale.stockOut || l.from)) {
      const avail = stockAt(sku, place).available - (used[sku + place] || 0);
      used[sku + place] = (used[sku + place] || 0) + l.qty;
      if ((avail < l.qty && !allowNegative(place)) || (demo && i === 0)) out.push({ id: 'stock-' + i, type: 'stock', line: i, name: l.name, qty: l.qty, avail: demo && i === 0 ? Math.max(0, Math.min(avail, l.qty - 1)) : Math.max(0, avail), place });
    }
    const was = l.basePrice != null ? l.basePrice : null;
    const now = p ? p.price : null;
    const demoNow = demo && i === 0 && was ? Math.round(was * 1.05) : null;
    if (was != null && now != null && (now !== was || demoNow)) out.push({ id: 'price-' + i, type: 'price', line: i, name: l.name, was, now: demoNow || now });
    (l.serials || []).forEach((sn, j) => {
      const other = soldElsewhere(sn, sale.id);
      if (other || (demo && j === 0)) out.push({ id: `serial-${i}-${j}`, type: 'serial', line: i, name: l.name, serial: sn, saleId: other ? other.saleId : 'another register' });
    });
  });
  return out;
}

/**
 * Post the queue. Sales without a conflict are posted; the others wait with their conflicts.
 * Returns { synced: [sale], review: [sale], already: n }. Safe to run again: posted sales are skipped.
 */
export function syncQueue({ demo = false } = {}) {
  const synced = [], review = [];
  let list = getQueue();
  list.filter((s) => s.syncState === 'queued').reverse().forEach((s) => {   // oldest first
    const conflicts = conflictsOf(s, demo && !review.length);
    if (conflicts.length) {
      list = list.map((x) => (x.id === s.id ? { ...x, syncState: 'review', conflicts } : x));
      review.push({ ...s, conflicts });
      return;
    }
    const { sale } = commitSale(s);
    list = list.filter((x) => x.id !== s.id);
    synced.push(sale);
  });
  saveQueue(list);
  list.filter((s) => s.syncState === 'review' && !review.some((r) => r.id === s.id)).forEach((s) => review.push(s));
  return { synced, review };
}

/**
 * Resolve one conflict of a queued sale: 'accept' | 'adjust' | 'void'.
 *   stock   accept = sell anyway (stock goes below zero) · adjust = record the missing stock as found
 *   price   accept = keep the price paid · adjust = book the price rise as a discount on the line
 *   serial  accept = keep the number (the unit is flagged) · adjust = use `serial` instead
 *   void    the whole sale: the money goes back to the customer, nothing is posted
 * When no conflict is left the sale is posted. Returns { sale, posted, voided }.
 */
export function resolveConflict(saleId, conflictId, action, { serial, by = 'Staff', approvedBy = '' } = {}) {
  const list = getQueue();
  const s = list.find((x) => x.id === saleId);
  if (!s) return { sale: null };
  if (action === 'void') {
    const voided = { ...s, syncState: 'voided', voided: true, voidedAt: Date.now(), voidedBy: approvedBy || by };
    saveQueue(list.map((x) => (x.id === saleId ? voided : x)));
    logAudit({ action: 'Void sale', detail: `Offline sale ${s.id} voided at sync: money given back`, by, approvedBy, ok: true, ref: s.id, amount: s.totals.total, counter: s.counter, place: s.place });
    return { sale: voided, voided: true };
  }
  let next = { ...s, lines: s.lines.map((l) => ({ ...l })), conflicts: (s.conflicts || []).map((c) => ({ ...c })) };
  const c = next.conflicts.find((x) => x.id === conflictId);
  if (!c) return { sale: s };
  const line = next.lines[c.line];
  if (c.type === 'stock' && action === 'adjust') {
    const sku = skuOf(line);
    if (sku) addMove({ sku, place: c.place, qty: line.qty - c.avail, kind: 'adjust', reason: 'Offline sale: stock was there', by, ref: s.id });
  }
  if (c.type === 'price' && action === 'adjust' && c.now > c.was) {
    line.disc = r2((line.disc || 0) + (c.now - c.was) * line.qty);
    line.price = r2(line.price + (c.now - c.was));
    line.basePrice = c.now;
    line.discBy = line.discBy || 'Offline price kept';
  }
  if (c.type === 'serial' && action === 'adjust') {
    if (!serial) return { sale: s, error: 'Type the other number.' };
    line.serials = (line.serials || []).map((x) => (x === c.serial ? serial : x));
  }
  if (c.type === 'serial' && action === 'accept') line.serialFlag = true;
  c.resolved = action;
  const open = next.conflicts.filter((x) => !x.resolved);
  if (!open.length) {
    next = { ...next, resolved: next.conflicts };
    const { sale } = commitSale({ ...next, queued: true });
    saveQueue(getQueue().filter((x) => x.id !== saleId));
    return { sale, posted: true };
  }
  saveQueue(list.map((x) => (x.id === saleId ? next : x)));
  return { sale: next, posted: false };
}

// ---- held sales -----------------------------------------------------------------------------------
/** Hold a sale: its items are held at `place` until resumed, discarded or expired. Returns the held row. */
export function holdSale(draft, { place, minutes, cashier, counter }) {
  const id = 'HOLD-' + String(nextSeq('hold')).padStart(4, '0');
  const at = Date.now();
  const row = { ...draft, id, at, place, counter, cashier, expiresAt: minutes ? at + minutes * 60000 : null, reserved: true };
  const here = draft.lines.filter((l) => !l.from);
  if (here.length) addHolds({ type: 'retail', ref: id, who: (draft.customer && draft.customer.name) || 'Walk-in customer', place, note: 'Held sale at the counter', by: cashier }, here.map((l) => ({ name: l.name, qty: l.qty })));
  draft.lines.filter((l) => l.from).forEach((l) => addHolds({ type: 'retail', ref: id, who: 'Held sale', place: l.from, note: 'Held sale at the counter', by: cashier }, [{ name: l.name, qty: l.qty }]));
  return row;
}
/** Put a held sale's stock back on sale (resume, discard or expiry). Does nothing the second time. */
export function releaseHeld(h, why) {
  if (!holdsFor(h.id).length) return false;
  endHoldsFor(h.id, 'released', why);
  return true;
}
/** Held sales whose time is up release their stock (once) and are marked expired. Returns { list, expired }. */
export function expireHeld(held, now = Date.now()) {
  const expired = [];
  const list = held.map((h) => {
    if (!h.reserved || !h.expiresAt || h.expiresAt > now) return h;
    releaseHeld(h, 'Held sale expired');
    expired.push(h.id);
    return { ...h, reserved: false, expired: true };
  });
  return { list, expired };
}
