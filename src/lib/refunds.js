// refunds — money given back to a customer, as its own record with stages (brief #5, "refund architecture"):
//
//   requested → approved → sent → done          (failed → sent again with Retry; cancelled)
//   requested  waiting for approval: the amount is over the refund limit (approvals.js, kind 'refund')
//   approved   ready to send (refunds under the limit start here)
//   sent       the money left the shop's account (posted to the ledger as a 'refund'); waiting for the customer
//              or the provider to confirm
//   done       confirmed
//   failed     the provider sent it back (wallet closed, wrong number …): the money is back in the account and
//              the refund waits in the failed queue for Retry (maybe to another number or method) or Cancel
// Each refund keeps its history and its age (from the request). The original payment is never changed.
//
//   requestRefund({ ref, customer, phone, amount, method, account, reason, source }) → the refund
//   approveRefund · sendRefund · confirmRefund · failRefund · retryRefund · cancelRefund
// Return & exchange (After-sales) can call requestRefund instead of posting the money itself.
// Front end only: kept in this browser (gc.refunds); providers answer in the demo by the buttons.

import { postEntry, accountForMethod, accountBy } from './ledger';
import { needsApproval, submit, saveRequest, requestBy } from './approvals';
import { currentUser } from './team';
import { claimRef, releaseRef } from './paymentRefs';

const KEY = 'gc.refunds';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ssr = () => typeof window === 'undefined';
const read = () => { if (ssr()) return SEED; try { return JSON.parse(window.localStorage.getItem(KEY)) || SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

export const STAGES = [
  ['requested', 'Waiting approval', 'warning'],
  ['approved', 'To send', 'info'],
  ['sent', 'Sent', 'primary'],
  ['done', 'Done', 'success'],
  ['failed', 'Failed', 'error'],
  ['cancelled', 'Cancelled', 'neutral'],
];
export const STAGE_LABEL = Object.fromEntries(STAGES.map(([k, l]) => [k, l]));
export const STAGE_TONE = Object.fromEntries(STAGES.map(([k, , t]) => [k, t]));
export const OPEN_STAGES = ['requested', 'approved', 'sent', 'failed'];
export const METHODS = ['bKash', 'Nagad', 'Rocket', 'Bank transfer', 'Card', 'Cash'];

const at = (m, d, h, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
const H = (stage, when, by, note = '') => ({ stage, at: when, by, note });
const SEED = [
  { id: 'RF-0016', ref: '#136737', customer: 'Rakib Uddin', phone: '01677-220945', amount: 450, method: 'bKash', account: 'bkash', reason: 'Delivery charge back · late delivery', source: 'Order', requestedAt: at(10, 1, 11, 20), by: 'farhana', byName: 'Farhana Yasmin', stage: 'sent', tries: 1, providerRef: 'BK9R2T6M1Q', seed: true,
    history: [H('approved', at(10, 1, 11, 20), 'Farhana Yasmin', 'Under the refund limit'), H('sent', at(10, 1, 11, 45), 'Farhana Yasmin', 'bKash TrxID BK9R2T6M1Q')] },
  { id: 'RF-0015', ref: 'INV-0226', customer: 'New Madina Telecom', phone: '01845-667302', amount: 4200, method: 'Bank transfer', account: 'brac', reason: 'Four sunscreen packs returned', source: 'Return', requestedAt: at(10, 1, 10, 5), by: 'rakib', byName: 'Rakib Hasan', stage: 'requested', tries: 0, approval: 'AP-R015', seed: true,
    history: [H('requested', at(10, 1, 10, 5), 'Rakib Hasan', 'Over the ৳3,000 refund limit')] },
  { id: 'RF-0014', ref: '#136742', customer: 'Farhana Islam', phone: '01744-556677', amount: 2950, method: 'Card', account: 'brac', reason: 'Returned · wrong address', source: 'Return', requestedAt: at(9, 30, 15, 30), by: 'farhana', byName: 'Farhana Yasmin', stage: 'approved', tries: 0, seed: true,
    history: [H('approved', at(9, 30, 15, 30), 'Farhana Yasmin', 'Under the refund limit')] },
  { id: 'RF-0013', ref: '#136799', customer: 'Rafiq Mia', phone: '01676-221904', amount: 990, method: 'bKash', account: 'bkash', reason: 'Returned damaged: bottle leaked', source: 'Return', requestedAt: at(9, 29, 11, 30), by: 'farhana', byName: 'Farhana Yasmin', stage: 'failed', tries: 1, providerRef: 'BK7F1P0X3Z', failReason: 'The bKash number is not a personal account', seed: true,
    history: [H('approved', at(9, 29, 11, 30), 'Farhana Yasmin'), H('sent', at(9, 29, 12, 0), 'Farhana Yasmin', 'bKash TrxID BK7F1P0X3Z'), H('failed', at(9, 29, 18, 10), 'bKash', 'The bKash number is not a personal account')] },
  { id: 'RF-0012', ref: '#136804', customer: 'Salma Begum', phone: '01912-330845', amount: 1890, method: 'bKash', account: 'bkash', reason: 'Returned without damage', source: 'Return', requestedAt: at(9, 30, 9, 40), by: 'farhana', byName: 'Farhana Yasmin', stage: 'done', tries: 1, providerRef: 'BK5L8W2N4D', seed: true,
    history: [H('approved', at(9, 30, 9, 40), 'Farhana Yasmin'), H('sent', at(9, 30, 10, 0), 'Farhana Yasmin', 'bKash TrxID BK5L8W2N4D'), H('done', at(9, 30, 19, 0), 'Salma Begum', 'Customer confirmed')] },
];

export const getRefunds = () => read().slice().sort((a, b) => b.requestedAt - a.requestedAt);
export const refundBy = (id) => read().find((x) => x.id === id) || null;
function save(row) {
  const list = read();
  write(list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list]);
  return row;
}
const step = (rf, stage, by, note = '', extra = {}) => save({ ...rf, ...extra, stage, history: [...(rf.history || []), { stage, at: Date.now(), by: by.name || by, note }] });

/** How long a refund has been open (or took): '3 h' · '2 d'. */
export function ageText(rf, now = Date.now()) {
  const end = rf.stage === 'done' || rf.stage === 'cancelled' ? (rf.history || []).slice(-1)[0]?.at || now : now;
  const h = Math.max(0, (end - rf.requestedAt) / 36e5);
  return h < 1 ? Math.max(1, Math.round(h * 60)) + ' min' : h < 48 ? Math.round(h) + ' h' : Math.round(h / 24) + ' d';
}
export const ageHours = (rf, now = Date.now()) => Math.max(0, (now - rf.requestedAt) / 36e5);

/**
 * Ask to give money back. Over the refund limit it waits for approval (an approvals.js request); otherwise it
 * is ready to send. Returns the refund.
 * { ref (order / invoice / return id), customer, phone, amount, method, account (default: the method's), reason, source }
 */
export function requestRefund(input, user = currentUser()) {
  const amount = r2(input.amount);
  if (!(amount > 0)) return null;
  // a card or gateway refund leaves from the bank (the partner's holding account is not the shop's own money)
  const picked = input.account || accountForMethod(input.method === 'Bank transfer' ? 'bank' : input.method, input.method === 'Cash');
  const account = picked && (accountBy(picked) || {}).type !== 'Holding' ? picked : 'brac';
  const n = Math.max(0, ...read().map((x) => Number(String(x.id).replace(/\D/g, '')) || 0)) + 1;
  const id = 'RF-' + String(n).padStart(4, '0');
  const rule = needsApproval({ kind: 'refund', amount, account });
  const base = { id, ref: input.ref || '', customer: input.customer || 'Customer', phone: input.phone || '', amount, method: input.method || 'bKash', account, reason: input.reason || '', source: input.source || 'Order', requestedAt: Date.now(), by: user.id, byName: user.name, tries: 0, history: [] };
  if (rule) {
    const req = submit({ kind: 'refund', title: `Refund ${base.ref || id} · ${base.customer}`, amount, payload: { refundId: id }, rule, user,
      facts: [['Customer', base.customer], ['Method', base.method], ['From', (accountBy(account) || {}).name || account], ['Reason', base.reason || '—']] });
    return save({ ...base, stage: 'requested', approval: req.id, history: [{ stage: 'requested', at: Date.now(), by: user.name, note: 'Over the refund limit' }] });
  }
  return save({ ...base, stage: 'approved', history: [{ stage: 'approved', at: Date.now(), by: user.name, note: 'Under the refund limit' }] });
}
/** Called when its approval request is approved (approvalActions.js), or for a seeded request without one. */
export function approveRefund(id, user = currentUser()) {
  const rf = refundBy(id);
  if (!rf || rf.stage !== 'requested') return null;
  return step(rf, 'approved', user, 'Approved');
}
/** Money leaves the account (ledger 'refund'). providerRef: the TrxID / bank reference of the refund. */
export function sendRefund(id, { providerRef = '', account, method } = {}, user = currentUser()) {
  const rf = refundBy(id);
  if (!rf || (rf.stage !== 'approved' && rf.stage !== 'failed')) return { ok: false, message: 'This refund can’t be sent now.' };
  if (providerRef) {
    const c = claimRef(providerRef, rf.id, { by: user.name, what: 'Refund' });
    if (!c.ok) return { ok: false, message: c.message };
  }
  const acc = account || rf.account;
  const entry = postEntry({ account: acc, amount: -rf.amount, kind: 'refund', ref: rf.ref || rf.id, party: rf.customer, note: `Refund ${rf.id}${providerRef ? ' · ' + providerRef : ''}`, by: user.name, txn: providerRef || undefined });
  const row = step(rf, 'sent', user, providerRef ? `${method || rf.method} ref ${providerRef}` : `From ${(accountBy(acc) || {}).name || acc}`, { account: acc, method: method || rf.method, providerRef, tries: (rf.tries || 0) + 1, posted: [...(rf.posted || []), entry && entry.id].filter(Boolean), failReason: '' });
  return { ok: true, refund: row };
}
/** The customer or provider confirmed it. */
export function confirmRefund(id, user = currentUser(), note = 'Confirmed') {
  const rf = refundBy(id);
  if (!rf || rf.stage !== 'sent') return null;
  return step(rf, 'done', user, note);
}
/** It came back: the money returns to the account and the refund waits in the failed queue. */
export function failRefund(id, reason, user = currentUser()) {
  const rf = refundBy(id);
  if (!rf || rf.stage !== 'sent') return null;
  // only a refund this browser posted is reversed (the demo's sent refund was posted before the books began)
  if ((rf.posted || []).length) postEntry({ account: rf.account, amount: rf.amount, kind: 'refund', ref: rf.ref || rf.id, party: rf.customer, note: `Refund ${rf.id} failed · money back`, by: user.name });
  if (rf.providerRef) releaseRef(rf.providerRef, rf.id);
  return step(rf, 'failed', user, reason || 'Failed', { failReason: reason || 'Failed' });
}
/** Send a failed refund again (the same way or another). */
export const retryRefund = (id, opts, user) => sendRefund(id, opts, user);
/** Stop a refund that was not sent or that failed. */
export function cancelRefund(id, reason, user = currentUser()) {
  const rf = refundBy(id);
  if (!rf || !['requested', 'approved', 'failed'].includes(rf.stage)) return null;
  if (rf.approval) { const req = requestBy(rf.approval); if (req && req.status === 'waiting') saveRequest({ ...req, status: 'cancelled', decidedBy: user.id, decidedName: user.name, decidedAt: Date.now(), reason: 'Refund cancelled' }); }
  return step(rf, 'cancelled', user, reason || 'Cancelled');
}
/** Figures for the Payments page: open, failed, waiting approval, oldest open (hours). */
export function refundSummary(now = Date.now()) {
  const list = getRefunds();
  const open = list.filter((r) => OPEN_STAGES.includes(r.stage));
  return {
    open: open.length, openAmount: r2(open.reduce((a, r) => a + r.amount, 0)),
    failed: list.filter((r) => r.stage === 'failed').length,
    waiting: list.filter((r) => r.stage === 'requested').length,
    oldest: open.length ? Math.max(...open.map((r) => ageHours(r, now))) : 0,
  };
}
