// manualPayments — payments a customer made by bKash / Nagad / Rocket / bank transfer and reported with a
// transaction ID, waiting to be checked against the shop's wallet or bank (brief #5, "manual payment
// submission → verification"). A submission is never "paid" until someone verifies it.
//   { id, order, customer, phone, method, sender, txn, claimed, at, status, verified, decidedBy, decidedAt,
//     note, history: [{ at, by, what }] }
//   status: 'waiting' · 'verified' · 'part' (verified a different amount) · 'correction' (customer must fix
//           something) · 'rejected'
//   verifyPayment()  checks the TrxID is not used before (paymentRefs.js), records the money in the method's
//                    account (ledger 'order payment', with the TrxID) and on the order (paid amount, payment
//                    Partial / Paid, activity)
//   One checker at a time: the review panel takes a lock (paymentRefs.js takeLock) and other people see who
//   has it open. Rejected and needs-correction submissions keep their history.
// Order detail can show the same review panel (screens/payments/PaymentReview.jsx). Front end only: kept in
// this browser (gc.pay.manual).

import { postEntry, accountForMethod } from './ledger';
import { findOrder, patchOrder, logOrder } from './orders';
import { claimRef, isRefUsed } from './paymentRefs';
import { currentUser } from './team';

const KEY = 'gc.pay.manual';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ssr = () => typeof window === 'undefined';
const at = (m, d, h, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
export const MANUAL_METHODS = ['bKash', 'Nagad', 'Rocket', 'Bank transfer'];
export const STATUS = { waiting: ['To check', 'warning'], verified: ['Verified', 'success'], part: ['Part verified', 'info'], correction: ['Needs correction', 'warning'], rejected: ['Rejected', 'error'] };

const SEED = [
  { id: 'MP-0103', order: '#136779', customer: 'Nusrat Jahan', phone: '01553-336655', method: 'bKash', sender: '01553-336655', txn: 'AB12CD34', claimed: 1060, at: at(10, 1, 9, 32), status: 'waiting', history: [{ at: at(10, 1, 9, 32), by: 'Nusrat Jahan', what: 'Sent the payment details' }] },
  { id: 'MP-0102', order: '#136811', customer: 'Nusrat Jahan', phone: '01553-336655', method: 'Nagad', sender: '01553-336655', txn: 'N8K44P7Q', claimed: 500, at: at(10, 1, 9, 48), status: 'waiting', history: [{ at: at(10, 1, 9, 48), by: 'Nusrat Jahan', what: 'Sent the payment details' }] },
  { id: 'MP-0101', order: '#136764', customer: 'Sadia Afrin', phone: '01966-330012', method: 'bKash', sender: '01966-330012', txn: '7HQ2LM9XKD', claimed: 5000, at: at(10, 1, 8, 15), status: 'waiting', history: [{ at: at(10, 1, 8, 15), by: 'Sadia Afrin', what: 'Sent the payment details' }] },
  { id: 'MP-0100', order: '#136801', customer: 'Moumita Das', phone: '01711-458821', method: 'bKash', sender: '01711-458821', txn: 'AB12CD34', claimed: 2000, verified: 2000, at: at(9, 30, 11, 50), status: 'verified', decidedBy: 'Farhana Yasmin', decidedAt: at(9, 30, 12, 10), history: [{ at: at(9, 30, 11, 50), by: 'Moumita Das', what: 'Sent the payment details' }, { at: at(9, 30, 12, 10), by: 'Farhana Yasmin', what: 'Verified ৳2,000' }] },
  { id: 'MP-0099', order: '#136793', customer: 'Habib Rahman', phone: '01822-104477', method: 'Nagad', sender: '01822-104477', txn: 'NG55T1RW', claimed: 1450, verified: 1450, at: at(9, 27, 10, 40), status: 'verified', decidedBy: 'Farhana Yasmin', decidedAt: at(9, 27, 11, 5), history: [{ at: at(9, 27, 11, 5), by: 'Farhana Yasmin', what: 'Verified ৳1,450' }] },
  { id: 'MP-0098', order: '#136788', customer: 'Kamrul Hasan', phone: '01911-223344', method: 'bKash', sender: '01911-223399', txn: 'ZZ00KQ11', claimed: 2200, at: at(9, 26, 21, 0), status: 'rejected', decidedBy: 'Farhana Yasmin', decidedAt: at(9, 27, 9, 30), note: 'No such payment in the bKash statement', history: [{ at: at(9, 27, 9, 30), by: 'Farhana Yasmin', what: 'Rejected · No such payment in the bKash statement' }] },
];
const read = () => { if (ssr()) return SEED; try { return JSON.parse(window.localStorage.getItem(KEY)) || SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
const save = (row) => { const list = read(); write(list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list]); return row; };
const note = (row, by, what, patch = {}) => save({ ...row, ...patch, history: [...(row.history || []), { at: Date.now(), by, what }] });

export const getManualPayments = () => read().slice().sort((a, b) => b.at - a.at);
export const manualPaymentBy = (id) => read().find((x) => x.id === id) || null;
export const manualFor = (orderId) => getManualPayments().filter((x) => x.order === orderId);
/** The waiting submission's reference problem: 'Already used on #136801' (another order) or ''. */
export function duplicateOf(mp) {
  if (mp.status !== 'waiting' && mp.status !== 'correction') return '';
  const hit = isRefUsed(mp.txn, mp.order);
  return hit ? `Already used on ${hit.owner}` : '';
}

/** A customer (or staff for them) reports a manual payment on an order. */
export function submitManualPayment({ order, customer, phone, method, sender, txn, claimed }, by = 'Customer') {
  const n = Math.max(0, ...read().map((x) => Number(String(x.id).replace(/\D/g, '')) || 0)) + 1;
  return save({ id: 'MP-' + String(n).padStart(4, '0'), order, customer, phone, method, sender, txn: String(txn || '').trim(), claimed: r2(claimed), at: Date.now(), status: 'waiting', history: [{ at: Date.now(), by, what: 'Sent the payment details' }] });
}

/**
 * Verify: the money is in the wallet or bank. amount defaults to the claimed amount (a different amount is
 * "Part verified"). Returns { ok, message }.
 */
export function verifyPayment(id, amount, user = currentUser()) {
  const mp = manualPaymentBy(id);
  if (!mp || (mp.status !== 'waiting' && mp.status !== 'correction')) return { ok: false, message: 'This payment was already decided.' };
  const amt = r2(amount == null ? mp.claimed : amount);
  if (!(amt > 0)) return { ok: false, message: 'Enter the amount that arrived.' };
  const c = claimRef(mp.txn, mp.order, { by: user.name, what: mp.method + ' payment' });
  if (!c.ok) return { ok: false, message: c.message };
  const account = accountForMethod(mp.method === 'Bank transfer' ? 'bank' : mp.method, false);
  postEntry({ account, amount: amt, kind: 'order payment', ref: mp.order, party: mp.customer, note: `${mp.method} · ${mp.txn}`, by: user.name, txn: mp.txn });
  const o = findOrder(mp.order);
  if (o) {
    const paid = r2((o.paid || 0) + amt);
    patchOrder(o, { paid, payment: paid >= (o.amount || 0) ? 'Paid' : 'Partial' });
    logOrder(o.id, 'badge-check', `${mp.method} payment verified · ৳${amt.toLocaleString('en-IN')}`, `${mp.txn} · ${user.name}`);
  }
  const part = amt !== r2(mp.claimed);
  note(mp, user.name, part ? `Verified ৳${amt.toLocaleString('en-IN')} of ৳${mp.claimed.toLocaleString('en-IN')}` : `Verified ৳${amt.toLocaleString('en-IN')}`, { status: part ? 'part' : 'verified', verified: amt, decidedBy: user.name, decidedAt: Date.now() });
  return { ok: true, message: `৳${amt.toLocaleString('en-IN')} verified on ${mp.order}` };
}
/** Ask the customer to fix something (wrong TrxID, amount, sender). Stays open; the history is kept. */
export function askCorrection(id, why, user = currentUser()) {
  const mp = manualPaymentBy(id);
  if (!mp || mp.status !== 'waiting') return { ok: false, message: 'This payment was already decided.' };
  if (!String(why || '').trim()) return { ok: false, message: 'Say what needs fixing.' };
  note(mp, user.name, 'Needs correction · ' + why.trim(), { status: 'correction', note: why.trim() });
  if (findOrder(mp.order)) logOrder(mp.order, 'circle-alert', 'Payment needs correction', why.trim());
  return { ok: true, message: `${mp.customer} asked to fix the payment details` };
}
/** Reject (no such payment, duplicate reference …). The history is kept. */
export function rejectPayment(id, why, user = currentUser()) {
  const mp = manualPaymentBy(id);
  if (!mp || (mp.status !== 'waiting' && mp.status !== 'correction')) return { ok: false, message: 'This payment was already decided.' };
  if (!String(why || '').trim()) return { ok: false, message: 'Give a reason.' };
  note(mp, user.name, 'Rejected · ' + why.trim(), { status: 'rejected', note: why.trim(), decidedBy: user.name, decidedAt: Date.now() });
  if (findOrder(mp.order)) logOrder(mp.order, 'circle-x', 'Payment rejected', why.trim());
  return { ok: true, message: `Payment on ${mp.order} rejected` };
}
