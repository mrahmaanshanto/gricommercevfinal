// paymentLinks — a link a customer opens to pay an order or an invoice (brief #5, "payment link record").
//   { id, code, ref (order or invoice id), refKind: 'order'|'invoice', customer, phone, amount, reusable,
//     expiresAt, createdAt, by, cancelled, payments: [{ at, amount, method, txn, by }] }
//   linkStatus(link)  'active' · 'paid' (a one-time link that was paid) · 'expired' · 'cancelled'
//   createLink()      from an order or an invoice (amount defaults to what is still owed)
//   payLink()         the customer paid (demo: a button): the payment is recorded on the invoice
//                     (invoices.js recordPayment) or the order (its paid amount, and the money waits with the
//                     gateway: settlements.js collect), and the TrxID is claimed (paymentRefs.js)
// Front end only: kept in this browser (gc.pay.links); a real link would be served by the payment page and
// confirmed by the gateway's notification.

import { getInvoices, recordPayment } from './invoices';
import { getOrders, findOrder, patchOrder, logOrder } from './orders';
import { collect } from './settlements';
import { claimRef } from './paymentRefs';
import { currentUser } from './team';

const KEY = 'gc.pay.links';
const DAY = 864e5;
export const LINK_BASE = 'https://dazzleshop.com.bd/pay/';
export const LINK_METHODS = [['bKash', 'bkash-pgw'], ['Nagad', 'nagad-pgw'], ['Card', 'sslcommerz']];
export const EXPIRY_CHOICES = [[1, '1 day'], [3, '3 days'], [7, '7 days'], [30, '30 days']];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ssr = () => typeof window === 'undefined';
const at = (m, d, h, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
const SEED = [
  { id: 'PL-0004', code: 'q7Mx2k', ref: '#136811', refKind: 'order', customer: 'Nusrat Jahan', phone: '01553-336655', amount: 500, reusable: false, createdAt: at(10, 1, 9, 50), expiresAt: at(10, 4, 9, 50), by: 'Farhana Yasmin', payments: [] },
  { id: 'PL-0003', code: 'Wd81pZ', ref: 'INV-0231', refKind: 'invoice', customer: 'Jamal Telecom', phone: '01819447210', amount: 10000, reusable: true, createdAt: at(9, 26, 12, 0), expiresAt: at(10, 26, 12, 0), by: 'Sadia Akter', payments: [] },
  { id: 'PL-0002', code: 'h3Rt9c', ref: '#136764', refKind: 'order', customer: 'Sadia Afrin', phone: '01966-330012', amount: 5000, reusable: false, createdAt: at(9, 6, 9, 20), expiresAt: at(9, 9, 9, 20), by: 'Farhana Yasmin', payments: [{ at: at(9, 6, 10, 2), amount: 5000, method: 'bKash', txn: '6TQ8LM2PZK', by: 'Sadia Afrin' }] },
  { id: 'PL-0001', code: 'b5Kp0e', ref: '#136779', refKind: 'order', customer: 'Nusrat Jahan', phone: '01553-336655', amount: 1060, reusable: false, createdAt: at(9, 7, 20, 55), expiresAt: at(9, 8, 20, 55), by: 'Farhana Yasmin', payments: [] },
];
const read = () => { if (ssr()) return SEED; try { return JSON.parse(window.localStorage.getItem(KEY)) || SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
const save = (row) => { const list = read(); write(list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list]); return row; };

export const getLinks = () => read().slice().sort((a, b) => b.createdAt - a.createdAt);
export const linkBy = (id) => read().find((x) => x.id === id || x.code === id) || null;
export const linksFor = (ref) => getLinks().filter((l) => l.ref === ref);
export const linkUrl = (link) => LINK_BASE + link.code;
export const paidOn = (link) => r2((link.payments || []).reduce((a, p) => a + p.amount, 0));
export const STATUS_TEXT = { active: 'Active', paid: 'Paid', expired: 'Expired', cancelled: 'Cancelled' };
export const STATUS_TONE = { active: 'info', paid: 'success', expired: 'neutral', cancelled: 'neutral' };
export function linkStatus(link, now = Date.now()) {
  if (link.cancelled) return 'cancelled';
  if (!link.reusable && (link.payments || []).length) return 'paid';
  if (now > link.expiresAt) return 'expired';
  return 'active';
}

/** Orders and invoices a link can be made for: still owing money. [{ ref, refKind, customer, phone, owed }] */
export function linkTargets() {
  const inv = getInvoices().filter((i) => i.due > 0).map((i) => ({ ref: i.id, refKind: 'invoice', customer: (i.customer && i.customer.name) || 'Customer', phone: (i.customer && i.customer.phone) || '', owed: r2(i.due) }));
  const ord = getOrders().filter((o) => !o.isInvoice && !/^(POS|Wholesale)/.test(o.channel) && !['Cancelled', 'Returned', 'Delivered'].includes(o.status))
    .map((o) => ({ ref: o.id, refKind: 'order', customer: o.customer, phone: o.phone, owed: r2(Math.max(0, (o.amount || 0) - (o.paid || 0))) }))
    .filter((o) => o.owed > 0);
  return [...ord, ...inv];
}
const code = () => Math.random().toString(36).slice(2, 8);

/** { ref, refKind, customer, phone, amount, days (expiry), reusable } → the link. */
export function createLink({ ref, refKind, customer, phone, amount, days = 3, reusable = false }, user = currentUser()) {
  const amt = r2(amount);
  if (!ref || !(amt > 0)) return null;
  const n = Math.max(0, ...read().map((x) => Number(String(x.id).replace(/\D/g, '')) || 0)) + 1;
  return save({ id: 'PL-' + String(n).padStart(4, '0'), code: code(), ref, refKind, customer, phone, amount: amt, reusable: !!reusable, createdAt: Date.now(), expiresAt: Date.now() + Number(days) * DAY, by: user.name, payments: [] });
}
export function cancelLink(id) {
  const l = linkBy(id);
  return l ? save({ ...l, cancelled: true, cancelledAt: Date.now() }) : null;
}

/**
 * The customer paid through the link (demo). { method: 'bKash'|'Nagad'|'Card', txn } → { ok, message, link }.
 * One-time links take one payment; reusable ones (a wholesale customer paying in parts) take many, each up to
 * the amount still owed.
 */
export function payLink(id, { method = 'bKash', txn = '' }, user = currentUser()) {
  const link = linkBy(id);
  if (!link) return { ok: false, message: 'That link could not be found.' };
  const st = linkStatus(link);
  if (st !== 'active') return { ok: false, message: `This link is ${STATUS_TEXT[st].toLowerCase()}.` };
  if (!String(txn).trim()) return { ok: false, message: 'Enter the transaction ID.' };
  const partner = (LINK_METHODS.find((m) => m[0] === method) || LINK_METHODS[0])[1];
  let amount = link.amount;
  if (link.refKind === 'invoice') {
    const inv = getInvoices().find((x) => x.id === link.ref);
    if (!inv || inv.due <= 0) return { ok: false, message: `${link.ref} has nothing left to pay.` };
    amount = r2(Math.min(amount, inv.due));
    const c = claimRef(txn, link.ref, { by: link.customer, what: 'Payment link ' + link.code });
    if (!c.ok) return { ok: false, message: c.message };
    recordPayment(inv, method === 'Card' ? 'SSLCOMMERZ' : method + ' online', amount, 'Payment link', { ref: txn });
  } else {
    const o = findOrder(link.ref);
    if (!o) return { ok: false, message: `${link.ref} could not be found.` };
    const owed = r2(Math.max(0, (o.amount || 0) - (o.paid || 0)));
    if (owed <= 0) return { ok: false, message: `${link.ref} is already paid.` };
    amount = r2(Math.min(amount, owed));
    const c = claimRef(txn, link.ref, { by: link.customer, what: 'Payment link ' + link.code });
    if (!c.ok) return { ok: false, message: c.message };
    const paid = r2((o.paid || 0) + amount);
    patchOrder(o, { paid, payment: paid >= (o.amount || 0) ? 'Paid' : 'Partial' });
    logOrder(o.id, 'link', `৳${amount.toLocaleString('en-IN')} paid by payment link`, `${method} · ${txn}`);
    // a link payment goes through the gateway: it waits there until the payout
    collect(partner, { ref: o.id, party: o.customer, gross: amount, note: 'Payment link ' + link.code, by: user.name, kind: 'order payment' });
  }
  const next = save({ ...link, payments: [...(link.payments || []), { at: Date.now(), amount, method, txn: String(txn).trim(), by: link.customer }] });
  return { ok: true, message: `৳${amount.toLocaleString('en-IN')} paid on ${link.ref}`, link: next };
}
