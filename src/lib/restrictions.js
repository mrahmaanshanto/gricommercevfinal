// restrictions — what a customer may not do, as records (brief #7, Customers & CRM › Commerce controls).
// A restriction is not a status: a customer can stay Active with "No cash on delivery". Each record keeps its type,
// reason, who added it, start, end (or none), the manager who approved it (credit hold and blocked need one) and a
// note. Lifting one writes who lifted it and why; nothing is deleted, so the history stays.
// Checks for the order, POS and invoice screens: checkOrder(), codAllowed(), canOrder(), creditAllowed(),
// methodAllowed(), needsReview(). They take a customer, a customer ID or a phone number.
// Front end only: kept in this browser (gc.crm.restrictions).

import { resolveCustomer } from './customers';

export const RESTRICTIONS_KEY = 'gc.crm.restrictions';
export const RESTRICTIONS_EVENT = 'gc:crm-restrictions';
export const RESTRICTION_TYPES = {
  cod: { label: 'No cash on delivery', short: 'COD blocked', amount: 'optional', amountLabel: 'Allow COD up to', tone: 'warning' },
  prepaid: { label: 'Advance payment above an amount', short: 'Advance needed', amount: 'required', amountLabel: 'Ask for advance above', tone: 'warning' },
  review: { label: 'Check every order by hand', short: 'Manual review', tone: 'info' },
  order_cap: { label: 'Order limit', short: 'Order limit', amount: 'required', amountLabel: 'Largest order', tone: 'info' },
  method: { label: 'Payment method turned off', short: 'Method off', method: true, tone: 'warning' },
  credit_hold: { label: 'Credit on hold', short: 'Credit hold', approval: true, tone: 'error' },
  blocked: { label: 'Blocked from ordering', short: 'Blocked', approval: true, tone: 'error' },
};
export const PAY_METHODS = ['bKash', 'Nagad', 'Card', 'Wallet'];

const ssr = () => typeof window === 'undefined';
const DAY = 24 * 60 * 60 * 1000;
const D = (y, m, d) => new Date(y, m - 1, d, 10, 0).getTime();
const SEED = [
  { id: 'R-1001', customerId: 'C-10233', type: 'cod', reason: 'Refused 3 cash-on-delivery parcels', by: 'Shanto', createdAt: D(2026, 9, 14), startsAt: D(2026, 9, 14), endsAt: null, note: 'Can pay by bKash or Nagad.' },
  { id: 'R-1002', customerId: 'C-10140', type: 'credit_hold', reason: '৳2,400 unpaid for more than 60 days', by: 'Shanto', createdAt: D(2026, 8, 1), startsAt: D(2026, 8, 1), endsAt: null, approval: { by: 'Mehedi Rahman', at: D(2026, 8, 1) } },
  { id: 'R-1003', customerId: 'C-30001', type: 'prepaid', amount: 300000, reason: 'Orders above the credit limit', by: 'Tania', createdAt: D(2026, 6, 10), startsAt: D(2026, 6, 10), endsAt: D(2026, 12, 31) },
  { id: 'R-0990', customerId: 'C-10482', type: 'review', reason: 'Address check after a wrong-address return', by: 'Tania', createdAt: D(2026, 8, 28), startsAt: D(2026, 8, 28), endsAt: D(2026, 9, 11), note: 'Ended by itself.' },
];
function read() {
  if (ssr()) return SEED;
  try { const v = JSON.parse(window.localStorage.getItem(RESTRICTIONS_KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; }
}
function write(list) { try { window.localStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(RESTRICTIONS_EVENT)); } catch { /* storage blocked */ } }
const idOf = (ref) => (ref && typeof ref === 'object' ? ref.id : isId(ref) ? String(ref) : (resolveCustomer(ref) || {}).id || '');
const isId = (t) => /^C-\d+$/i.test(String(t || ''));

/** 'active' | 'scheduled' | 'ended' | 'lifted' */
export function restrictionState(r, now = Date.now()) {
  if (r.liftedAt) return 'lifted';
  if (r.startsAt && r.startsAt > now) return 'scheduled';
  if (r.endsAt && r.endsAt <= now) return 'ended';
  return 'active';
}
export const STATE_LABEL = { active: 'Active', scheduled: 'Starts later', ended: 'Ended', lifted: 'Lifted' };
/** Every restriction of one customer, newest first (active ones first). */
export function restrictionsOf(ref, now = Date.now()) {
  const id = idOf(ref);
  const rank = { active: 0, scheduled: 1, ended: 2, lifted: 3 };
  return read().filter((r) => r.customerId === id).sort((a, b) => rank[restrictionState(a, now)] - rank[restrictionState(b, now)] || b.createdAt - a.createdAt);
}
export const activeRestrictions = (ref, now = Date.now()) => restrictionsOf(ref, now).filter((r) => restrictionState(r, now) === 'active');
/** One line for a restriction: "No cash on delivery · up to ৳3,000". */
export function restrictionText(r) {
  const t = RESTRICTION_TYPES[r.type] || { label: r.type };
  const amt = r.amount ? ' ৳' + Number(r.amount).toLocaleString('en-IN') : '';
  if (r.type === 'cod') return r.amount ? 'Cash on delivery up to' + amt : t.label;
  if (r.type === 'prepaid') return 'Advance payment above' + amt;
  if (r.type === 'order_cap') return 'Orders up to' + amt;
  if (r.type === 'method') return (r.method || 'Payment method') + ' turned off';
  return t.label;
}

/**
 * Add a restriction. { type, amount, method, reason, by, startsAt, endsAt, approvedBy, note }.
 * Returns { ok: true, record } or { ok: false, error } (a reason is needed; credit hold and blocked need a manager).
 */
/** What is wrong with a new restriction ('' when it can be added; the manager approval is checked separately). */
export function restrictionProblem(f) {
  const t = RESTRICTION_TYPES[f.type];
  if (!t) return 'Choose a restriction.';
  if (!String(f.reason || '').trim()) return 'Add a reason.';
  if (t.amount === 'required' && !(Number(f.amount) > 0)) return 'Enter an amount.';
  if (t.method && !f.method) return 'Choose a payment method.';
  if (f.endsAt && f.startsAt && f.endsAt <= f.startsAt) return 'The end date must be after the start.';
  return '';
}
export function addRestriction(ref, f) {
  const id = idOf(ref);
  const t = RESTRICTION_TYPES[f.type];
  if (!id) return { ok: false, error: 'Unknown customer.' };
  const problem = restrictionProblem(f);
  if (problem) return { ok: false, error: problem };
  if (t.approval && !f.approvedBy) return { ok: false, error: 'A manager needs to approve this.' };
  const now = Date.now();
  const record = { id: 'R-' + (2000 + read().length) + '-' + (now % 1000), customerId: id, type: f.type, amount: Number(f.amount) || 0, method: f.method || '', reason: String(f.reason).trim(),
    by: f.by || 'Staff', createdAt: now, startsAt: f.startsAt || now, endsAt: f.endsAt || null, approval: f.approvedBy ? { by: f.approvedBy, at: now } : null, note: f.note || '' };
  write([record, ...read()]);
  return { ok: true, record };
}
/** Lift a restriction early; it stays in the history with who lifted it and why. */
export function liftRestriction(rid, { by = 'Staff', reason = '' } = {}) {
  write(read().map((r) => (r.id === rid && !r.liftedAt ? { ...r, liftedAt: Date.now(), liftedBy: by, liftReason: reason } : r)));
}

// ---- checks -------------------------------------------------------------------------------------------------
function customerOf(ref) { return ref && typeof ref === 'object' && ref.phones ? ref : resolveCustomer(ref); }
/** Can this customer order at all? (Suspended / closed accounts and "Blocked" restrictions say no.) */
export function canOrder(ref) {
  const c = customerOf(ref);
  if (!c) return true;   // a new customer has no restrictions
  if (c.status === 'Suspended' || c.status === 'Closed') return false;
  return !activeRestrictions(c).some((r) => r.type === 'blocked');
}
/** Can this order be cash on delivery? amount = order total (optional). */
export function codAllowed(ref, amount) {
  return !activeRestrictions(ref).some((r) => r.type === 'cod' && (!r.amount || (amount != null && amount > r.amount)));
}
/** Must the customer pay in advance for an order of this amount? */
export const advanceNeeded = (ref, amount) => activeRestrictions(ref).some((r) => r.type === 'prepaid' && amount > r.amount);
/** Can the customer buy on credit (unpaid invoice) right now? */
export const creditAllowed = (ref) => !activeRestrictions(ref).some((r) => r.type === 'credit_hold' || r.type === 'blocked');
export const methodAllowed = (ref, method) => !activeRestrictions(ref).some((r) => r.type === 'method' && String(r.method).toLowerCase() === String(method || '').toLowerCase());
export const needsReview = (ref) => activeRestrictions(ref).some((r) => r.type === 'review');

/**
 * Everything an order screen needs in one call. order: { amount, payment: 'cod' | 'credit' | method name }.
 * → { ok, blocks: [text], warnings: [text] }  (blocks stop the order; warnings ask staff to look).
 */
export function checkOrder(ref, order = {}) {
  const c = customerOf(ref);
  const out = { ok: true, blocks: [], warnings: [] };
  if (!c) return out;
  const amount = Number(order.amount) || 0;
  const pay = String(order.payment || '').toLowerCase();
  if (c.status === 'Suspended' || c.status === 'Closed') out.blocks.push('This customer’s account is ' + c.status.toLowerCase() + '.');
  activeRestrictions(c).forEach((r) => {
    if (r.type === 'blocked') out.blocks.push('Blocked from ordering: ' + r.reason);
    if (r.type === 'cod' && pay === 'cod' && (!r.amount || amount > r.amount)) out.blocks.push(restrictionText(r) + ': ' + r.reason);
    if (r.type === 'prepaid' && amount > r.amount && (pay === 'cod' || pay === 'credit')) out.blocks.push(restrictionText(r) + '.');
    if (r.type === 'order_cap' && amount > r.amount) out.blocks.push(restrictionText(r) + '.');
    if (r.type === 'credit_hold' && pay === 'credit') out.blocks.push('Credit is on hold: ' + r.reason);
    if (r.type === 'method' && pay && pay === String(r.method).toLowerCase()) out.blocks.push(restrictionText(r) + '.');
    if (r.type === 'review') out.warnings.push('Check this order by hand: ' + r.reason);
  });
  out.ok = !out.blocks.length;
  return out;
}
/** Short labels of the active restrictions, for list badges and filters. */
export const restrictionBadges = (ref) => activeRestrictions(ref).map((r) => (RESTRICTION_TYPES[r.type] || {}).short || r.type);
export { DAY };
