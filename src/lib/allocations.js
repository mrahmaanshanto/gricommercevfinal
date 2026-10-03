// allocations — one customer payment spread across several open invoices, and write-offs of small balances
// left on an invoice (brief #6, "Receivables").
//
//   openInvoicesOf(key)        a customer's invoices with money due, oldest first (key: phone digits or name)
//   splitOldestFirst(list, ৳)  how a payment covers them, oldest first: [{ id, amount }]
//   allocatePayment({...})     records the payment on each invoice (invoices.js recordPayment, which posts the
//                              money to the method's account) and keeps one allocation record that ties them
//   requestWriteOff({...})     asks to write off up to ৳500 left on an invoice, with a reason; it always waits for
//                              approval (approvals.js, kind 'write-off') and is applied by applyWriteOff
// A write-off is not a payment: it lowers what the invoice still owes and is listed on the invoice
// (inv.writeOffs) and here; no money moves. Front end only: gc.fin.allocations, gc.fin.writeoffs.

import { getInvoices, saveInvoice, recordPayment } from './invoices';
import { needsApproval, submit, WRITE_OFF_MAX } from './approvals';
import { claimRef, refMessage } from './paymentRefs';
import { currentUser } from './team';

const ALLOC_KEY = 'gc.fin.allocations';
const WO_KEY = 'gc.fin.writeoffs';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const read = (k) => { if (typeof window === 'undefined') return []; try { return JSON.parse(window.localStorage.getItem(k)) || []; } catch { return []; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

export { WRITE_OFF_MAX };
/** The customer key Dues groups by: phone digits, else 'name:<name>'. */
export const customerKeyOf = (inv) => digits(inv.customer && inv.customer.phone) || 'name:' + ((inv.customer && inv.customer.name) || 'Walk-in customer');
export function openInvoicesOf(key) {
  return getInvoices().filter((inv) => inv.due > 0 && customerKeyOf(inv) === key).sort((a, b) => a.at - b.at);
}
/** Oldest invoice first, until the money runs out. */
export function splitOldestFirst(invoices, amount) {
  let left = r2(amount);
  return invoices.map((inv) => { const take = r2(Math.max(0, Math.min(left, inv.due))); left = r2(left - take); return { id: inv.id, amount: take }; });
}

export const getAllocations = () => read(ALLOC_KEY);
export const allocationsFor = (invoiceId) => getAllocations().filter((a) => a.lines.some((l) => l.id === invoiceId));

/**
 * One payment across several invoices. { key, customer, method, amount, ref, lines: [{ id, amount }], keepExtra }
 * The reference (TrxID / bank ref) is checked once for the whole payment. Returns { ok, message, allocation }.
 */
export function allocatePayment({ customer, method, amount, ref = '', lines, keepExtra = false }, user = currentUser()) {
  const total = r2(amount);
  const parts = (lines || []).map((l) => ({ id: l.id, amount: r2(l.amount) })).filter((l) => l.amount > 0);
  const used = r2(parts.reduce((a, l) => a + l.amount, 0));
  if (!(total > 0)) return { ok: false, message: 'Enter the amount received.' };
  if (!parts.length) return { ok: false, message: 'Put the money on at least one invoice.' };
  if (used > total + 0.001) return { ok: false, message: 'The invoices take more than the payment.' };
  const all = getInvoices();
  const over = parts.find((l) => { const inv = all.find((x) => x.id === l.id); return !inv || l.amount > inv.due + 0.001; });
  if (over) return { ok: false, message: `${over.id} owes less than that.` };
  const extra = r2(total - used);
  if (extra > 0 && !keepExtra) return { ok: false, message: `৳${extra.toLocaleString('en-IN')} is not on any invoice. Put it on one, or keep it as credit.` };
  if (extra > 0) {
    const last = all.find((x) => x.id === parts[parts.length - 1].id);
    if (parts[parts.length - 1].amount < last.due - 0.001) return { ok: false, message: 'Pay the invoices in full before keeping the rest as credit.' };
    if (!digits(last.customer && last.customer.phone)) return { ok: false, message: 'Credit needs the customer’s phone number.' };
  }
  const id = 'PAY-' + Date.now().toString(36).toUpperCase().slice(-6);
  if (ref) { const c = claimRef(ref, id, { by: user.name, what: method + ' payment' }); if (!c.ok) return { ok: false, message: c.message }; }
  parts.forEach((l, i) => {
    const inv = getInvoices().find((x) => x.id === l.id);
    // the last invoice keeps what is left over as the customer's credit, when asked
    recordPayment(inv, method, i === parts.length - 1 && extra ? r2(l.amount + extra) : l.amount, user.name, { ref: [ref, id].filter(Boolean).join(' · '), keepExtra: i === parts.length - 1 && extra > 0 });
  });
  const allocation = { id, at: Date.now(), customer, method, amount: total, ref, lines: parts, extra, by: user.name };
  write(ALLOC_KEY, [allocation, ...read(ALLOC_KEY)]);
  return { ok: true, message: '', allocation };
}
/** "Already used on …" for a payment reference, before saving. */
export const refProblem = (ref) => refMessage(ref);

// ---- write-offs ---------------------------------------------------------------------------------------
export const getWriteOffs = () => read(WO_KEY);
/**
 * Ask to write off a small balance. { invoiceId, amount, reason }. Returns { ok, message, request }.
 * Only up to WRITE_OFF_MAX and never more than the invoice owes; it waits for an approver.
 */
export function requestWriteOff({ invoiceId, amount, reason }, user = currentUser()) {
  const inv = getInvoices().find((x) => x.id === invoiceId);
  const amt = r2(amount);
  if (!inv) return { ok: false, message: 'That invoice could not be found.' };
  if (!(amt > 0)) return { ok: false, message: 'Enter the amount to write off.' };
  if (amt > inv.due + 0.001) return { ok: false, message: `${inv.id} owes only ৳${inv.due.toLocaleString('en-IN')}.` };
  if (amt > WRITE_OFF_MAX) return { ok: false, message: `Only balances up to ৳${WRITE_OFF_MAX} can be written off. Chase the rest.` };
  if (!String(reason || '').trim()) return { ok: false, message: 'Give a reason.' };
  if (getWriteOffs().some((w) => w.invoiceId === inv.id && w.status === 'waiting')) return { ok: false, message: `A write-off on ${inv.id} is already waiting for approval.` };
  const rule = needsApproval({ kind: 'write-off', amount: amt }) || 'LM-7';
  const name = (inv.customer && inv.customer.name) || 'Customer';
  const request = submit({ kind: 'write-off', title: `Write off ${inv.id} · ${name}`, amount: amt, rule, user,
    payload: { invoiceId: inv.id, amount: amt, reason: reason.trim() },
    facts: [['Invoice', inv.id], ['Customer', name], ['Still owed', '৳' + inv.due.toLocaleString('en-IN')], ['Reason', reason.trim()]] });
  write(WO_KEY, [{ id: request.id, invoiceId: inv.id, customer: name, amount: amt, reason: reason.trim(), by: user.name, at: Date.now(), status: 'waiting' }, ...read(WO_KEY)]);
  return { ok: true, message: '', request };
}
/** Approved: the invoice owes that much less (approvalActions.js). */
export function applyWriteOff({ invoiceId, amount, reason }, approver, requestId) {
  const inv = getInvoices().find((x) => x.id === invoiceId);
  if (!inv) return { ok: false, message: 'That invoice could not be found.' };
  const amt = r2(Math.min(amount, inv.due));
  if (!(amt > 0)) return { ok: false, message: `${invoiceId} has nothing left to write off.` };
  saveInvoice({ ...inv, due: r2(inv.due - amt), writeOffs: [...(inv.writeOffs || []), { amount: amt, reason, at: Date.now(), approvedBy: approver.name, request: requestId }] });
  write(WO_KEY, read(WO_KEY).map((w) => (w.id === requestId ? { ...w, status: 'done', amount: amt, decidedBy: approver.name, decidedAt: Date.now() } : w)));
  return { ok: true, message: `৳${amt.toLocaleString('en-IN')} written off ${invoiceId}` };
}
export function denyWriteOff(requestId, approver) {
  write(WO_KEY, read(WO_KEY).map((w) => (w.id === requestId ? { ...w, status: 'denied', decidedBy: approver.name, decidedAt: Date.now() } : w)));
}
