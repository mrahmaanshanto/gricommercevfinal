// paymentProof — a bKash / Nagad / Rocket / bank payment the customer says they made, checked before it counts
// (Nayeem's Sales & Orders brief #4: "manual payment proof → Review payment"; Payments brief: one verification,
// no double payment).
//   submitProof(o, { method, txn, amount, photo, from, by })   the customer (order link, chat) or staff adds it;
//                                                             the order's next step becomes "Review payment"
//   acceptProof(o, id, by)    the money is posted to the method's account (ledger.postEntry, kind 'order payment',
//                             as the advance is); the order's paid amount, payment and COD amount follow. A new order
//                             paid in full moves to Processing by itself (orderStatus.js › statusKeyOf).
//   rejectProof(o, id, reason, by)
//   proofsOf(o) · proofToReview(o) · ordersToReview(all)
// A transaction ID counts once, across every order. Proofs are kept on the order (orders.js › patchOrder).
// Front end only: nothing checks the wallet or bank statement here; a server would match the transaction ID.

import { getOrders, patchOrder, logOrder, findOrder } from './orders';
import { postEntry, accountForMethod } from './ledger';
import { notify } from './notifications';
import { clockNow } from './settlements';
import { formatBDT } from './format';

export const PROOF_METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['rocket', 'Rocket'], ['bank transfer', 'Bank transfer']];
export const methodLabel = (k) => (PROOF_METHODS.find((m) => m[0] === k) || [k, k])[1];
export const REJECT_REASONS = ['Transaction ID not found', 'Amount does not match', 'Photo not clear', 'Paid to another number', 'Other'];

// a customer sent a bKash proof for this demo order (it shows under Payment to review)
const DEMO_PROOFS = {
  '#136779': [{ id: 'PF-demo1', method: 'bkash', txn: 'BK8H2KQ7TX', amount: 1060, from: 'Customer', by: 'Nusrat Jahan', sender: '01553-336655', at: new Date(2026, 8, 7, 21, 5).getTime(), state: 'review' }],
};
const cleanTxn = (t) => String(t || '').replace(/\s+/g, '').toUpperCase();

/** Every proof on the order, newest first: { id, method, txn, amount, photo, from, by, sender, at, state, reason, reviewedBy, reviewedAt }. */
export const proofsOf = (o) => (!o ? [] : (o.proofs !== undefined ? o.proofs || [] : DEMO_PROOFS[o.id] || []).slice().sort((a, b) => b.at - a.at));
/** The proof waiting for review (the oldest first), or null. Closed orders have nothing to review. */
export function proofToReview(o) {
  if (!o || ['cancelled'].includes(o.statusKey)) return null;
  const list = proofsOf(o).filter((p) => p.state === 'review');
  return list.length ? list[list.length - 1] : null;
}
export const ordersToReview = (all = getOrders()) => all.filter((o) => proofToReview(o));

/** Where else this transaction ID was used (other proofs not rejected): [{ order, proof }]. */
export function txnUsed(txn, exceptOrderId, all = getOrders()) {
  const t = cleanTxn(txn);
  if (!t) return [];
  const hits = [];
  all.forEach((o) => proofsOf(o).forEach((p) => { if (cleanTxn(p.txn) === t && p.state !== 'rejected' && !(o.id === exceptOrderId && p.state === 'review')) hits.push({ order: o, proof: p }); }));
  return hits;
}

/** Add a payment proof. Returns { ok, error, proof }. */
export function submitProof(o, { method, txn, amount, photo = '', from = 'Staff', by = 'Staff', sender = '' }) {
  const t = cleanTxn(txn);
  const amt = Math.round(Number(amount) || 0);
  if (!o) return { ok: false, error: 'Order not found.' };
  if (!t || t.length < 6) return { ok: false, error: 'Enter the transaction ID.' };
  if (amt <= 0) return { ok: false, error: 'Enter the amount paid.' };
  const used = txnUsed(t, null);
  if (used.length) return { ok: false, error: `Transaction ID already used on ${used[0].order.id}.` };
  const proof = { id: 'PF-' + clockNow().toString(36) + Math.random().toString(36).slice(2, 5), method, txn: t, amount: amt, photo, from, by, sender, at: clockNow(), state: 'review' };
  patchOrder(o, { proofs: [proof, ...proofsOf(o)] });
  logOrder(o.id, 'receipt', 'Payment proof added', `${methodLabel(method)} ${t} · ${formatBDT(amt)} · ${from === 'Customer' ? 'from customer' : by}`);
  return { ok: true, proof };
}

const setProof = (o, id, patch) => proofsOf(o).map((p) => (p.id === id ? { ...p, ...patch } : p));

/**
 * Accept: the payment counts. Posts once (an accepted proof can't be accepted again); returns { ok, error, paid, full }.
 * A parcel already with the courier keeps its booked COD amount: orderStates shows "COD to update" until it matches.
 */
export function acceptProof(o, id, by = 'Staff') {
  const fresh = findOrder(o.id) || o;
  const p = proofsOf(fresh).find((x) => x.id === id);
  if (!p || p.state !== 'review') return { ok: false, error: 'This proof was already reviewed.' };
  if (txnUsed(p.txn, fresh.id).some((h) => h.proof.state === 'accepted')) return { ok: false, error: 'This transaction ID was already accepted on another order.' };
  const account = accountForMethod(p.method, false);
  if (account) postEntry({ account, amount: p.amount, kind: 'order payment', ref: fresh.id, party: fresh.customer, note: `${methodLabel(p.method)} ${p.txn}`, by });
  const paid = (fresh.paid || 0) + p.amount;
  const full = paid >= fresh.amount;
  const patch = { proofs: setProof(fresh, id, { state: 'accepted', reviewedBy: by, reviewedAt: clockNow(), account }), paid, payment: full ? 'Paid' : 'Partial' };
  const wasCod = fresh.payment === 'COD' || fresh.codAmount != null;
  if (wasCod && !fresh.sentAt) patch.codAmount = Math.max(0, fresh.amount - paid);
  patchOrder(fresh, patch);
  logOrder(fresh.id, 'badge-check', 'Payment accepted', `${formatBDT(p.amount)} · ${methodLabel(p.method)} ${p.txn} · ${by}`);
  const next = { ...fresh, ...patch };
  if (full) notify(next, 'processing');
  else notify({ ...next, advance: { amount: p.amount } }, 'advance-received', { advance: p.amount, remaining: Math.max(0, fresh.amount - paid) });
  return { ok: true, paid, full };
}

/** Reject with a reason: nothing is posted; the customer can send another proof. */
export function rejectProof(o, id, reason, by = 'Staff') {
  const fresh = findOrder(o.id) || o;
  const p = proofsOf(fresh).find((x) => x.id === id);
  if (!p || p.state !== 'review') return { ok: false, error: 'This proof was already reviewed.' };
  patchOrder(fresh, { proofs: setProof(fresh, id, { state: 'rejected', reason, reviewedBy: by, reviewedAt: clockNow() }) });
  logOrder(fresh.id, 'badge-x', 'Payment rejected', `${methodLabel(p.method)} ${p.txn} · ${reason} · ${by}`);
  return { ok: true };
}
