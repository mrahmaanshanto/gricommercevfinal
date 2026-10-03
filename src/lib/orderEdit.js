// orderEdit — change an order after it is placed (Nayeem's Sales & Orders brief #4 › Order editing): add, remove or
// change lines, quantity and price, and the delivery (zone, charge, address). The effects are shown before saving:
//   previewEdit(o, draft)  { changes, stock, money, courier, repack, error }
//     stock    per product: hold more / release (stock held for the order), take out / put back (Online edition:
//              taken at approval), or nothing yet (a new order holds at approval)
//     money    total before → after, paid, what is due, the COD amount, and a refund owed when paid > new total
//              (a captured payment is never changed: the refund is recorded as owed)
//     courier  nothing · update the booking (COD or address changed on a booked parcel) · cancel the booking
//              (changed to shop pickup) · a packed order goes back to Approved to be packed again with a new slip
//   applyEdit(o, draft, by)  saves it: version + 1, the change in the order's history (`edits`) and its activity.
//                            A stale version (the order changed in another tab since the edit began) is refused.
//   Edit requests: a change sent for review instead of saved (requestEdit), reviewed on the order page and
//   listed in Order work › Edits to review (editRequestOf · applyEditRequest · discardEditRequest).
// Only orders that haven't shipped can be edited; after that it's Return & exchange.
// Draft: { lines: [{ name, qty, price, orig (index in o.lines) | undefined, variant, sku }], shipping, zone, address,
//          reason, baseVersion }.
// Front end only: the courier's booking update is simulated (a server would call the courier's API).

import { patchOrder, logOrder, setOrderStatus, findOrder, getOrders, holdPlaceOf, isCounterSale } from './orders';
import { holdsFor, addHolds, closeHold } from './stockHolds';
import { productBy, stockAt, addMove } from './stock';
import { freezeLine } from './productCost';
import { prepOf } from './orderFlow';
import { clockNow } from './settlements';
import { formatBDT } from './format';

const EDITABLE = ['onhold', 'processing', 'pending', 'approved', 'ready'];
const sum = (list, f) => list.reduce((a, x) => a + f(x), 0);
const same = (a, b) => String(a || '').trim() === String(b || '').trim();

export const versionOf = (o) => (o && o.version) || 1;
/** '' when the order can be edited, else why not. */
export function whyNoEdit(o) {
  if (!o) return 'Order not found.';
  if (isCounterSale(o) || o.isInvoice) return 'Counter sales and invoices are changed on the invoice.';
  if (o.statusKey === 'cancelled') return 'Cancelled orders can’t be edited.';
  if (!EDITABLE.includes(o.statusKey)) return 'Shipped orders can’t be edited. Use Return & exchange.';
  return '';
}
export const canEdit = (o) => !whyNoEdit(o);

/** A draft that starts from the order as it is. */
export function draftOf(o) {
  return {
    lines: o.lines.map((l, i) => ({ name: l.name, qty: l.qty, price: l.price, listPrice: l.listPrice != null ? l.listPrice : l.price, orig: i, variant: l.variant || '', sku: l.sku || '' })),
    shipping: o.shipping || 0, zone: o.zone || '', address: o.address || '', reason: '', baseVersion: versionOf(o),
  };
}

const qtyBy = (lines) => { const m = {}; lines.forEach((l) => { m[l.name] = (m[l.name] || 0) + (Number(l.qty) || 0); }); return m; };
const stockMode = (o) => (o.stockOut ? 'taken' : holdsFor(o.id).some((h) => h.type === 'online') ? 'held' : 'none');

export function previewEdit(o, draft) {
  const lines = (draft.lines || []).filter((l) => (Number(l.qty) || 0) > 0);
  const error = !lines.length ? 'An order needs at least one item.' : lines.some((l) => !(Number(l.price) >= 0)) ? 'Check the prices.' : '';
  // what changed, line by line
  const changes = [];
  const kept = new Set();
  lines.forEach((l) => {
    const was = l.orig != null ? o.lines[l.orig] : null;
    if (!was) { changes.push(`Added ${l.name} × ${l.qty}`); return; }
    kept.add(l.orig);
    if (Number(was.qty) !== Number(l.qty)) changes.push(`${l.name}: qty ${was.qty} → ${l.qty}`);
    if (Number(was.price) !== Number(l.price)) changes.push(`${l.name}: price ${formatBDT(was.price)} → ${formatBDT(l.price)}`);
  });
  o.lines.forEach((l, i) => { if (!kept.has(i)) changes.push(`Removed ${l.name} × ${l.qty}`); });
  const itemsChanged = changes.length > 0;
  const shipping = Math.max(0, Math.round(Number(draft.shipping) || 0));
  if (!same(draft.zone, o.zone) || shipping !== (o.shipping || 0)) changes.push(`Delivery: ${o.zone || '—'} ${formatBDT(o.shipping || 0)} → ${draft.zone || '—'} ${formatBDT(shipping)}`);
  const addressChanged = !same(draft.address, o.address);
  if (addressChanged) changes.push('Address changed');

  // stock
  const mode = stockMode(o);
  const place = o.stockOut ? o.stockOut.place : holdPlaceOf(o.id);
  const before = mode === 'held' ? qtyBy(holdsFor(o.id).filter((h) => h.type === 'online').map((h) => ({ name: h.product, qty: h.qty }))) : qtyBy(o.lines);
  const after = qtyBy(lines);
  const stock = mode === 'none' ? [] : [...new Set([...Object.keys(before), ...Object.keys(after)])].map((name) => {
    const delta = (after[name] || 0) - (before[name] || 0);
    if (!delta) return null;
    const known = !!productBy(name);
    const free = known ? stockAt(name, place).available : 0;
    const action = mode === 'held' ? (delta > 0 ? 'hold' : 'release') : (delta > 0 ? 'take' : 'return');
    return { name, delta, action, place, known, free, short: delta > 0 && known && free < delta };
  }).filter(Boolean);

  // money: VAT, discount and other charges stay as they were
  const extra = o.amount - o.subtotal - (o.shipping || 0);
  const subtotal = sum(lines, (l) => (Number(l.price) || 0) * l.qty);
  const total = Math.max(0, Math.round(subtotal + shipping + extra));
  const paid = o.paid || 0;
  const wasCod = o.payment === 'COD' || o.codAmount != null;
  const dueBefore = Math.max(0, o.amount - paid);
  const due = Math.max(0, total - paid);
  const codBefore = wasCod ? (o.codAmount != null ? o.codAmount : dueBefore) : 0;
  const codAfter = wasCod ? due : 0;
  const money = { before: o.amount, after: total, paid, dueBefore, due, codBefore, codAfter, refund: Math.max(0, paid - total), wasCod };

  // courier
  const booked = !!(o.consignment && o.consignment !== '—' && /^[A-Z]{2}-/.test(o.consignment));
  const pickup = /pickup/i.test(draft.zone || '');
  let courier = { action: 'none', text: booked ? `${o.courier} booking stays as it is` : 'Not booked with a courier yet' };
  if (booked && pickup) courier = { action: 'cancel', text: `Cancel the ${o.courier} booking ${o.consignment}` };
  else if (booked && (codAfter !== codBefore || addressChanged || !same(draft.zone, o.zone))) courier = { action: 'update', text: `Update the ${o.courier} booking ${o.consignment}` + (codAfter !== codBefore ? `: COD ${formatBDT(codBefore)} → ${formatBDT(codAfter)}` : ': new address') };
  const prep = prepOf(o);
  const repack = o.statusKey === 'ready' && (itemsChanged || pickup) ? 'Back to Approved: pack it again and print a new slip'
    : o.statusKey === 'approved' && prep.slipPrinted && changes.length ? 'Print a new slip' : '';

  return { changes, itemsChanged, stock, stockMode: mode, place, money, courier, repack, error: error || (!changes.length ? 'Nothing changed yet.' : ''), empty: !changes.length };
}

/** Save the edit. Returns { ok, error, conflict, version }. */
export function applyEdit(o, draft, by = 'Staff') {
  const fresh = findOrder(o.id) || o;
  const why = whyNoEdit(fresh);
  if (why) return { ok: false, error: why };
  if (draft.baseVersion != null && draft.baseVersion !== versionOf(fresh)) return { ok: false, conflict: true, error: 'This order changed while you were editing. Review it again.' };
  const pv = previewEdit(fresh, draft);
  if (pv.error) return { ok: false, error: pv.error };
  const at = clockNow();

  // stock follows the new lines
  pv.stock.forEach((s) => {
    if (s.action === 'hold') addHolds({ type: 'online', ref: fresh.id, who: fresh.customer, place: s.place, note: 'Order edited', by }, [{ name: s.name, qty: s.delta }]);
    if (s.action === 'release') {
      const open = holdsFor(fresh.id).filter((h) => h.type === 'online' && h.product === s.name);
      const held = sum(open, (h) => h.qty);
      open.forEach((h) => closeHold(h.id, 'released', 'Order edited'));
      const keep = held + s.delta;
      if (keep > 0) addHolds({ type: 'online', ref: fresh.id, who: fresh.customer, place: open[0] ? open[0].place : s.place, note: 'Order edited', by }, [{ name: s.name, qty: keep }]);
    }
    if (s.action === 'take' || s.action === 'return') { const p = productBy(s.name); if (p) addMove({ sku: p.sku, place: s.place, qty: -s.delta, kind: s.delta > 0 ? 'sale' : 'return', reason: 'Order edited', by, ref: fresh.id }); }
  });

  // lines: kept lines keep what was frozen when sold (cost, sku …); new ones are frozen now
  const lines = draft.lines.filter((l) => (Number(l.qty) || 0) > 0).map((l) => {
    const was = l.orig != null ? fresh.lines[l.orig] : null;
    const price = Number(l.price) || 0;
    if (was) return { ...was, qty: Number(l.qty), price, priceChanged: (was.listPrice != null ? Number(was.listPrice) : Number(was.price)) !== price };
    const f = freezeLine({ name: l.name, qty: Number(l.qty), price, sku: l.sku || '' });
    const listPrice = l.listPrice != null ? Number(l.listPrice) : price;
    return { name: l.name, qty: Number(l.qty), price, listPrice, priceChanged: listPrice !== price, variant: l.variant || '', sku: f.sku, cat: f.cat, cost: f.cost, productId: l.productId || '', discount: 0, taxRate: 0, tax: 0 };
  });

  const m = pv.money;
  const version = versionOf(fresh) + 1;
  const entry = { version, at, by, reason: String(draft.reason || '').trim(), changes: pv.changes, before: { lines: fresh.lines, total: fresh.amount, shipping: fresh.shipping || 0, zone: fresh.zone, address: fresh.address } };
  const patch = {
    lines, total: m.after, shipping: Math.max(0, Math.round(Number(draft.shipping) || 0)), zone: draft.zone, address: String(draft.address || '').trim(),
    version, edits: [...(fresh.edits || []), entry], editRequest: null,
  };
  if (m.paid > 0) patch.payment = m.paid >= m.after ? 'Paid' : 'Partial';
  if (m.wasCod) patch.codAmount = m.codAfter;
  if (m.refund > 0) patch.refundDue = m.refund;
  else if (fresh.refundDue) patch.refundDue = 0;
  // the courier: booking updated (demo: the courier accepts at once) or cancelled
  if (pv.courier.action === 'cancel') Object.assign(patch, { courier: 'Not assigned', consignment: '—', trackingUrl: '', bookingCancelled: { at, was: fresh.consignment } });
  if (pv.courier.action === 'update') patch.bookingUpdated = { at, cod: m.codAfter, address: patch.address };
  if (pv.repack || pv.courier.action === 'cancel') patch.prep = { ...prepOf(fresh), slipPrinted: false, packed: pv.repack.startsWith('Back') ? false : prepOf(fresh).packed, slipAttached: false, ...(pv.courier.action === 'cancel' ? { courier: '' } : {}) };
  patchOrder(fresh, patch);
  if (pv.repack.startsWith('Back')) setOrderStatus(fresh, 'Approved', { stamp: false });

  logOrder(fresh.id, 'pencil', `Order edited · version ${version}`, [pv.changes.join(', '), entry.reason, by].filter(Boolean).join(' · '));
  if (pv.courier.action === 'update') logOrder(fresh.id, 'truck', 'Courier booking updated', `${fresh.courier} ${fresh.consignment} · COD ${formatBDT(m.codAfter)}`);
  if (pv.courier.action === 'cancel') logOrder(fresh.id, 'truck', 'Courier booking cancelled', `${fresh.courier} ${fresh.consignment}`);
  if (m.refund > 0) logOrder(fresh.id, 'hand-coins', 'Refund owed', formatBDT(m.refund));
  return { ok: true, version };
}

// ---- edit requests ------------------------------------------------------------------------------------------
// a customer asked (on Messenger) to drop the water bottle from a packed, booked order
const DEMO_REQUESTS = {
  '#136778': {
    from: 'Customer', by: 'Mostafizur Rahman', note: 'Please remove the water bottle', at: new Date(2026, 8, 8, 9, 40).getTime(),
    draft: { lines: [{ name: 'Daily Care Shampoo 340ml', qty: 1, price: 420, orig: 0 }, { name: 'Mustard Oil 1L Pure Ghani', qty: 1, price: 320, orig: 2 }], shipping: 150, zone: 'Outside Dhaka', address: '22 Jubilee Road, Chattogram 4000', reason: 'Customer asked', baseVersion: 1 },
  },
};
/** The change waiting for review on this order, or null: { draft, from, by, note, at }. */
export function editRequestOf(o) {
  if (!o || !canEdit(o)) return null;
  return o.editRequest !== undefined ? o.editRequest || null : DEMO_REQUESTS[o.id] || null;
}
export const ordersWithEditRequests = (all = getOrders()) => all.filter((o) => editRequestOf(o));
/** Send a change for review instead of saving it. */
export function requestEdit(o, draft, { from = 'Staff', by = 'Staff', note = '' } = {}) {
  const pv = previewEdit(o, draft);
  if (pv.error) return { ok: false, error: pv.error };
  patchOrder(o, { editRequest: { draft, from, by, note: note || draft.reason || '', at: clockNow() } });
  logOrder(o.id, 'git-pull-request', 'Edit sent for review', pv.changes.join(', ') + ' · ' + by);
  return { ok: true };
}
/** Apply the request to the order as it is now (the reviewer saw its effects on the current version). */
export function applyEditRequest(o, by = 'Staff', draft) {
  const req = editRequestOf(o);
  if (!req) return { ok: false, error: 'No change waiting.' };
  return applyEdit(o, { ...(draft || req.draft), baseVersion: versionOf(o), reason: (draft || req.draft).reason || req.note }, by);
}
export function discardEditRequest(o, reason = '', by = 'Staff') {
  if (!editRequestOf(o)) return false;
  patchOrder(o, { editRequest: null });
  logOrder(o.id, 'git-pull-request-closed', 'Edit request declined', [reason, by].filter(Boolean).join(' · '));
  return true;
}
