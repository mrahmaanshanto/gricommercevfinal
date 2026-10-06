// approvals — money that waits for a second person before it is posted (brief #6, "approval limits").
//
//   limits      rules by amount, category, account or branch, per kind of movement:
//                 expense    an expense or salary paid from an account
//                 move       money moved between accounts, or taken out
//                 refund     money given back to a customer (refunds.js)
//                 write-off  a small balance left on an invoice, written off (allocations.js)
//               A movement waits when any rule of its kind is passed (amount over the rule's limit, and the
//               category / account / branch is the rule's one when the rule names one).
//   requests    { id, kind, title, amount, payload, facts, by (user id), byName, at, status: 'waiting' |
//               'approved' | 'denied' | 'cancelled', rule, decidedBy, decidedName, decidedAt, reason, result }
//   submit()    puts a movement in the queue; approvalActions.js › decide() approves (and posts it) or denies
// The maker can't decide their own request (financeDuties.js › canDecide). Front end only: kept in this
// browser (gc.fin.limits, gc.fin.approvals); the demo starts with three requests from the shop team.

import { accountProps, accountBy } from './ledger';
import { currentUser } from './team';

const LIMITS_KEY = 'gc.fin.limits';
const REQ_KEY = 'gc.fin.approvals';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ssr = () => typeof window === 'undefined';
const read = (k, fb) => { if (ssr()) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

export const KINDS = [['expense', 'Expenses'], ['move', 'Money moves'], ['refund', 'Refunds'], ['write-off', 'Write-offs']];
export const KIND_TEXT = Object.fromEntries(KINDS);
export const SCOPES = [['amount', 'Any'], ['category', 'Category'], ['account', 'Account'], ['branch', 'Branch']];

export const DEFAULT_LIMITS = [
  { id: 'LM-1', kind: 'expense', scope: 'amount', value: '', limit: 25000 },
  { id: 'LM-2', kind: 'expense', scope: 'category', value: 'Marketing', limit: 10000 },
  { id: 'LM-3', kind: 'expense', scope: 'branch', value: 'Dhanmondi branch', limit: 5000 },
  { id: 'LM-4', kind: 'move', scope: 'amount', value: '', limit: 100000 },
  { id: 'LM-5', kind: 'move', scope: 'account', value: 'brac', limit: 50000 },
  { id: 'LM-6', kind: 'refund', scope: 'amount', value: '', limit: 3000 },
  { id: 'LM-7', kind: 'write-off', scope: 'amount', value: '', limit: 0 },
];
/** Write-offs are only for small balances: above this an invoice is chased, not written off. */
export const WRITE_OFF_MAX = 500;

export const getLimits = () => read(LIMITS_KEY, DEFAULT_LIMITS);
export const saveLimits = (list) => write(LIMITS_KEY, list);
export const resetLimits = () => { try { window.localStorage.removeItem(LIMITS_KEY); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };
export function addLimit(rule) {
  const row = { id: 'LM-' + Date.now().toString(36), value: '', ...rule, limit: Math.max(0, Number(rule.limit) || 0) };
  saveLimits([...getLimits(), row]);
  return row;
}
export const removeLimit = (id) => saveLimits(getLimits().filter((x) => x.id !== id));
export const updateLimit = (id, patch) => saveLimits(getLimits().map((x) => (x.id === id ? { ...x, ...patch } : x)));

/** "Any expense over ৳25,000" · "Marketing expenses over ৳10,000" · "Every write-off". */
export function limitText(rule) {
  const taka = '৳' + Number(rule.limit || 0).toLocaleString('en-IN');
  const what = { expense: 'expense', move: 'money move', refund: 'refund', 'write-off': 'write-off' }[rule.kind] || rule.kind;
  if (!rule.limit) return rule.scope === 'amount' ? `Every ${what}` : `Every ${what} · ${scopeValueText(rule)}`;
  if (rule.scope === 'amount') return `Any ${what} over ${taka}`;
  return `${what[0].toUpperCase() + what.slice(1)}s · ${scopeValueText(rule)} · over ${taka}`;
}
export const scopeValueText = (rule) => (rule.scope === 'account' ? (accountBy(rule.value) || { name: rule.value }).name.replace(/ · 01\d{3}-\d{6}$/, '') : rule.value);

/**
 * The rule a movement passes, or null when it can be posted at once.
 * m: { kind: 'expense'|'move'|'refund'|'write-off', amount, cat, account, to (a move's other account), branch }
 * The branch is the movement's own, else its account's (ledger.js accountProps).
 */
export function needsApproval(m) {
  const amount = Math.abs(Number(m.amount) || 0);
  const branch = m.branch || (m.account ? accountProps(m.account).branch : '');
  const accounts = [m.account, m.to].filter(Boolean).map((a) => (accountBy(a) || { id: a }).id);
  const hit = getLimits().filter((r) => r.kind === m.kind && amount > (Number(r.limit) || 0) && (
    r.scope === 'amount'
    || (r.scope === 'category' && m.cat && String(m.cat).toLowerCase() === String(r.value).toLowerCase())
    || (r.scope === 'account' && accounts.includes(r.value))
    || (r.scope === 'branch' && branch && branch === r.value)
  ));
  return hit.sort((a, b) => (a.limit || 0) - (b.limit || 0))[0] || null;
}

// ---- the queue -------------------------------------------------------------------------------------
const at = (d, h, m = 0) => new Date(2026, 9, d, h, m).getTime();
const SEED = [
  { id: 'AP-R015', kind: 'refund', title: 'Refund INV-0226 · New Madina Telecom', amount: 4200, at: at(1, 10, 5), by: 'rakib', byName: 'Rakib Hasan', status: 'waiting', rule: 'LM-6',
    payload: { refundId: 'RF-0015' }, facts: [['Customer', 'New Madina Telecom'], ['Method', 'Bank transfer'], ['From', 'BRAC Bank current'], ['Reason', 'Four chargers returned']] },
  { id: 'AP-0003', kind: 'expense', title: 'Facebook ads · October boost', amount: 18000, at: at(1, 16, 20), by: 'shakil', byName: 'Shakil Ahmed', status: 'waiting', rule: 'LM-2',
    payload: { account: 'citybank', amount: -18000, kind: 'expense', cat: 'Marketing', party: 'Meta Platforms', note: 'Puja campaign boost' }, facts: [['Category', 'Marketing'], ['Paid from', 'City Bank current'], ['Paid to', 'Meta Platforms']] },
  { id: 'AP-0002', kind: 'move', title: 'Safe to BRAC Bank · cash deposit', amount: 120000, at: at(1, 12, 5), by: 'rakib', byName: 'Rakib Hasan', status: 'waiting', rule: 'LM-4',
    payload: { transfer: true, from: 'safe', to: 'brac', amount: 120000, note: 'Cash deposit, slip 4482' }, facts: [['From', 'Shop safe'], ['To', 'BRAC Bank current'], ['Slip', '4482']] },
  { id: 'AP-0001', kind: 'expense', title: 'AC servicing · Dhanmondi', amount: 6500, at: at(1, 10, 40), by: 'sadia', byName: 'Sadia Akter', status: 'waiting', rule: 'LM-3',
    payload: { account: 'cash-shop', amount: -6500, kind: 'expense', cat: 'Repairs', party: 'Rafiq Electric', note: 'Two AC units serviced', branch: 'Dhanmondi branch' }, facts: [['Category', 'Repairs'], ['Paid from', 'Cash in hand · shop'], ['Branch', 'Dhanmondi branch']] },
];
/** Every request, newest first. */
export const getRequests = () => read(REQ_KEY, SEED).slice().sort((a, b) => b.at - a.at);
export const requestBy = (id) => getRequests().find((r) => r.id === id) || null;
export const waitingRequests = () => getRequests().filter((r) => r.status === 'waiting');
export function saveRequest(row) {
  const list = read(REQ_KEY, SEED);
  write(REQ_KEY, list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list]);
  return row;
}
/**
 * Put a movement in the queue. kind as in needsApproval; payload is what approvalActions.js posts when it is
 * approved (a ledger entry, { transfer, from, to, amount }, { refundId }, { invoiceId, amount, reason }).
 * facts: [[label, value]] shown to the approver. Returns the request.
 */
export function submit({ kind, title, amount, payload, facts = [], rule, user = currentUser(), note = '' }) {
  const n = Math.max(0, ...read(REQ_KEY, SEED).map((x) => (/^AP-\d+$/.test(x.id) ? Number(x.id.slice(3)) : 0))) + 1;
  const row = {
    id: 'AP-' + String(n).padStart(4, '0'),
    kind, title, amount: r2(Math.abs(amount)), payload, facts, note, rule: rule ? rule.id || rule : '',
    by: user.id, byName: user.name, at: Date.now(), status: 'waiting',
  };
  return saveRequest(row);
}
/** The maker takes back a request that is still waiting. */
export function cancelRequest(id, user = currentUser()) {
  const r = requestBy(id);
  if (!r || r.status !== 'waiting' || r.by !== user.id) return null;
  return saveRequest({ ...r, status: 'cancelled', decidedBy: user.id, decidedName: user.name, decidedAt: Date.now() });
}
