// Grid AI approvals — what the AI may prepare but never do alone (risk level 4): refunds, discounts above the shop's
// limit, stock changes, bulk messages, bulk order changes, deleting customer data. The request carries what was asked,
// where (conversation, page), for whom, the change, the reason and an expiry (24 hours). Approving checks again at
// that moment: the person needs "Approve high-risk AI actions" (lib/permissions.js), the request must not have expired,
// and the AI can't approve its own request.
//   requestApproval({ kind, title, detail, amount, customer, conv, record, change, reason, from }) → request
//   getApprovals() · decide(id, 'approve' | 'reject', { by, user, reason }) → { ok, error }
// Front end only: kept in this browser (gc.gridai.approvals). The approved action is shown as done; a server would run it.

import { can } from '../permissions';
import { logAi } from './activity';

export const APPROVALS_EVENT = 'gc:gridai-approvals';
const KEY = 'gc.gridai.approvals';
const TTL = 24 * 3600e3;
export const KINDS = {
  refund: ['Refund', 'undo-2'], discount: ['Discount above the limit', 'badge-percent'], stock: ['Stock change', 'boxes'],
  'bulk-message': ['Bulk message', 'send'], 'bulk-order': ['Bulk order change', 'list-checks'], 'delete-data': ['Delete customer data', 'trash-2'], payment: ['Payment change', 'wallet'],
};
const H = 3600e3;
const isBrowser = typeof window !== 'undefined';
function seed() {
  const now = Date.now();
  return [
    { id: 'AA-4', at: now - 25 * 60e3, kind: 'refund', title: 'Refund ৳1,890 to bKash', detail: 'Order #136812 · Anker 20W charger arrived broken', amount: 1890, customer: 'Rafiqul Islam', conv: '', record: '#136812', change: 'Refund ৳1,890 to bKash 01712-XX4410 and take the item back', reason: 'Customer sent a photo of the broken charger; the Support agent can’t refund by itself.', from: 'Inbox · WhatsApp', status: 'waiting' },
    { id: 'AA-3', at: now - 2 * H, kind: 'discount', title: 'Discount ৳500 on Galaxy A15', detail: 'Customer asked for ৳500 off; the limit is ৳150', amount: 500, customer: 'Imran Hossain', conv: '', record: 'PH-GAL-A15', change: 'Price ৳19,999 → ৳19,499 for this order only', reason: 'Repeat buyer (4 orders). The Sales agent may offer at most ৳150.', from: 'Inbox · Facebook', status: 'waiting' },
    { id: 'AA-2', at: now - 5 * H, kind: 'bulk-message', title: 'Restock message to 48 customers', detail: 'Wireless Earbuds Pro is back in stock', amount: 0, customer: '48 customers', conv: '', record: 'AU-EAR-PRO', change: 'WhatsApp template “Back in stock” to 48 people who asked in the last 30 days', reason: 'Restock automation. Bulk sends always wait for a person.', from: 'Automation', status: 'waiting' },
    { id: 'AA-1', at: now - 30 * H, kind: 'stock', title: 'Stock −2 Tempered Glass 9H at Dhanmondi', detail: 'Count found 2 fewer', amount: 0, customer: '', conv: '', record: 'AC-GLS-9H', change: 'Dhanmondi branch: 24 → 22', reason: 'The Inventory agent noticed the count difference.', from: 'Assistant', status: 'approved', decidedBy: 'Rakib Hasan', decidedAt: now - 29 * H },
  ].map((r) => ({ ...r, expires: r.at + TTL }));
}
const read = () => {
  if (!isBrowser) return [];
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); if (Array.isArray(v)) return v; } catch { /* ignore */ }
  const s = seed(); try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } return s;
};
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v.slice(0, 200))); window.dispatchEvent(new CustomEvent(APPROVALS_EVENT)); } catch { /* ignore */ } };

/** Every request, newest first, with expired ones marked. */
export function getApprovals(now = Date.now()) {
  return read().map((r) => (r.status === 'waiting' && r.expires <= now ? { ...r, status: 'expired' } : r)).sort((a, b) => b.at - a.at);
}
export function requestApproval(req) {
  const list = read();
  const n = list.reduce((m, x) => Math.max(m, parseInt(String(x.id).split('-')[1], 10) || 0), 0) + 1;
  const at = Date.now();
  const row = { id: 'AA-' + n, at, expires: at + TTL, status: 'waiting', amount: 0, customer: '', conv: '', record: '', change: '', reason: '', from: 'Assistant', detail: '', ...req };
  write([row, ...list]);
  logAi({ kind: 'action', title: 'Asked for approval: ' + row.title, detail: row.reason || row.detail, by: 'Grid AI' });
  return row;
}
/** Approve or reject; checked again now. */
export function decide(id, verdict, { by = 'You', user = null, reason = '' } = {}) {
  const list = read();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return { ok: false, error: 'Not found' };
  const r = list[i];
  if (r.status !== 'waiting') return { ok: false, error: 'Already ' + r.status };
  if (r.expires <= Date.now()) { list[i] = { ...r, status: 'expired' }; write(list); return { ok: false, error: 'This request expired. Ask the AI again.' }; }
  if (verdict === 'approve' && user && !can(user, 'ai-approve')) return { ok: false, error: 'You need “Approve high-risk AI actions”.' };
  if (verdict === 'reject' && !reason.trim()) return { ok: false, error: 'Say why it is rejected.' };
  list[i] = { ...r, status: verdict === 'approve' ? 'approved' : 'rejected', decidedBy: by, decidedAt: Date.now(), reason: verdict === 'reject' ? reason : r.reason, rejectReason: verdict === 'reject' ? reason : '' };
  write(list);
  logAi({ kind: verdict === 'approve' ? 'approved' : 'rejected', title: (verdict === 'approve' ? 'Approved: ' : 'Rejected: ') + r.title, detail: verdict === 'reject' ? reason : r.change, by });
  return { ok: true };
}
export const waitingCount = () => getApprovals().filter((r) => r.status === 'waiting').length;
