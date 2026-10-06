// stockAdjustments — stock added or removed by hand, with a reason.
// Any decrease, or any change over APPROVAL_LIMIT pieces, needs a manager: approved on the spot with
// the manager's PIN, or saved as "Waiting for approval". Only an approved adjustment changes the stock
// (it records a stock move of kind 'adjust').
// qty is always in base units; an adjustment entered in packs keeps the pack ({ id, name, qty }) for display. The stock
// move carries the adjustment id as its operation key, so approving twice never changes the stock twice.
// Front end only: kept in this browser; starts from demo rows.

import { addMove, productBy } from './stock';

const KEY = 'gc.stock.adjustments';
export const APPROVAL_LIMIT = 20;
export const ADJUST_REASONS = ['Damaged', 'Lost', 'Found', 'Count correction', 'Expired', 'Gift/sample', 'Other'];
/** True when the change needs a manager: any decrease, or more than APPROVAL_LIMIT pieces. */
export const needsApproval = (qty) => qty < 0 || Math.abs(qty) > APPROVAL_LIMIT;

const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const SEED = [
  { id: 'ADJ-0014', sku: 'AC-CHG-20', place: 'Mirpur branch', qty: -2, reason: 'Damaged', note: 'Tubes split in the carton', by: 'Moumita Das', at: at(30, 11, 40), status: 'waiting' },
  { id: 'ADJ-0013', sku: 'AC-CBL-100', place: 'Central Warehouse', qty: 24, reason: 'Count correction', note: 'Pallet behind rack B-4 was not in the system', by: 'Karim', at: at(29, 16, 5), status: 'waiting' },
  { id: 'ADJ-0012', sku: 'AU-EAR-PRO', place: 'Dhanmondi branch', qty: -1, reason: 'Gift/sample', note: 'Demo unit for the counter', by: 'Rafi Ahmed', at: at(28, 12, 30), status: 'approved', decidedBy: 'Rakib Hasan', decidedAt: at(28, 12, 32) },
  { id: 'ADJ-0011', sku: 'AC-STD-FLD', place: 'Mirpur branch', qty: 3, reason: 'Found', note: 'Found in the back store', by: 'Arif Rahman', at: at(26, 10, 15), status: 'approved', decidedBy: 'Auto', decidedAt: at(26, 10, 15) },
  { id: 'ADJ-0010', sku: 'AC-LNS-PR', place: 'Central Warehouse', qty: -6, reason: 'Expired', note: 'Best before 20 Sep', by: 'Karim', at: at(22, 9, 50), status: 'approved', decidedBy: 'Nabila Rahman', decidedAt: at(22, 14, 0) },
  { id: 'ADJ-0009', sku: 'AC-CSE-A55', place: 'Dhanmondi branch', qty: -4, reason: 'Lost', note: 'Not found after the weekend sale', by: 'Sadia Akter', at: at(20, 19, 10), status: 'rejected', decidedBy: 'Rakib Hasan', decidedAt: at(21, 10, 0), decisionNote: 'Count the shelf first' },
];

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };
const nextId = (list) => 'ADJ-' + String(list.reduce((m, x) => Math.max(m, Number(x.id.split('-')[1]) || 0), 0) + 1).padStart(4, '0');
const move = (a, approver) => addMove({ sku: a.sku, place: a.place, qty: a.qty, kind: 'adjust', reason: a.reason + (a.note ? ' · ' + a.note : ''), by: approver ? `${a.by} · approved by ${approver}` : a.by, ref: a.id, op: a.id, ...(a.pack ? { packInfo: a.pack } : {}) });

/** Every adjustment, newest first. Empty on the server. */
export const getAdjustments = () => (typeof window === 'undefined' ? [] : read());
export const productOf = (a) => productBy(a.sku);

/**
 * Save an adjustment { sku, place, qty (+/−), reason, note, by }.
 * `approvedBy` (a manager, or 'Auto' for small increases) approves it now and changes the stock;
 * without it the adjustment waits for approval. Returns { list, row }.
 */
export function addAdjustment(a, approvedBy) {
  const list = read();
  const row = { id: nextId(list), at: Date.now(), ...a, status: approvedBy ? 'approved' : 'waiting', ...(approvedBy ? { decidedBy: approvedBy, decidedAt: Date.now() } : {}) };
  if (approvedBy) move(row, approvedBy === 'Auto' ? '' : approvedBy);
  const next = [row, ...list];
  write(next);
  return { list: next, row };
}
/** Approve a waiting adjustment: the stock changes now. */
export function approveAdjustment(id, manager) {
  const list = read().map((a) => {
    if (a.id !== id || a.status !== 'waiting') return a;
    move(a, manager);
    return { ...a, status: 'approved', decidedBy: manager, decidedAt: Date.now() };
  });
  write(list);
  return list;
}
/** Reject a waiting adjustment: the stock does not change. */
export function rejectAdjustment(id, by, note) {
  const list = read().map((a) => (a.id === id && a.status === 'waiting' ? { ...a, status: 'rejected', decidedBy: by, decidedAt: Date.now(), decisionNote: note || '' } : a));
  write(list);
  return list;
}
