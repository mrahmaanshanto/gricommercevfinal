// approvalActions — what happens when a waiting request (approvals.js) is decided. Approve posts the movement
// it holds; deny leaves the books as they were. Kept apart from approvals.js so refunds.js and allocations.js
// can submit requests without an import loop.
//   expense / move   the ledger entry (or the transfer between two accounts) is posted, dated now
//   refund           the refund moves to "To send" (refunds.js)
//   write-off        the invoice owes that much less (allocations.js)
// The maker can't decide their own request and the decider needs the Approver duty (financeDuties.js).

import { postEntry, transferBetween } from './ledger';
import { requestBy, saveRequest } from './approvals';
import { canDecide } from './financeDuties';
import { approveRefund, cancelRefund } from './refunds';
import { applyWriteOff, denyWriteOff } from './allocations';
import { currentUser } from './team';

/** Approve or deny. Returns { ok, message, request }. A deny needs a reason. */
export function decide(id, verdict, user = currentUser(), reason = '') {
  const req = requestBy(id);
  if (!req) return { ok: false, message: 'That request could not be found.' };
  if (req.status !== 'waiting') return { ok: false, message: 'This request was already decided.' };
  const may = canDecide(user, req);
  if (!may.ok) return { ok: false, message: may.why };
  const stamp = { decidedBy: user.id, decidedName: user.name, decidedAt: Date.now() };
  if (verdict === 'deny') {
    if (!String(reason).trim()) return { ok: false, message: 'Give a reason.' };
    if (req.kind === 'refund' && req.payload.refundId) cancelRefund(req.payload.refundId, 'Approval denied: ' + reason.trim(), user);
    if (req.kind === 'write-off') denyWriteOff(req.id, user);
    return { ok: true, message: `${req.title} denied`, request: saveRequest({ ...req, ...stamp, status: 'denied', reason: reason.trim() }) };
  }
  const p = req.payload || {};
  let result = '';
  if (req.kind === 'expense' || (req.kind === 'move' && !p.transfer)) {
    const e = postEntry({ ...p, by: req.byName, approvedBy: user.name, approval: req.id });
    if (!e) return { ok: false, message: 'That account could not be found.' };
    result = e.id;
  } else if (req.kind === 'move') {
    transferBetween(p.from, p.to, p.amount, { note: p.note || '', party: p.party || '', by: req.byName, approvedBy: user.name, approval: req.id, ...(p.at ? { at: p.at } : {}) });
    result = 'transfer';
  } else if (req.kind === 'refund') {
    if (!approveRefund(p.refundId, user)) return { ok: false, message: 'That refund is no longer waiting.' };
    result = p.refundId;
  } else if (req.kind === 'write-off') {
    const w = applyWriteOff(p, user, req.id);
    if (!w.ok) return { ok: false, message: w.message };
    result = p.invoiceId;
  }
  return { ok: true, message: `${req.title} approved`, request: saveRequest({ ...req, ...stamp, status: 'approved', result }) };
}
