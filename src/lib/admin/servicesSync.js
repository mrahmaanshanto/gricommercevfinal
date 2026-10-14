// admin/servicesSync — copies the Services shop's money and approvals into the super admin's books, the way a server
// would: every paid charge of a service order (lib/platform/services.js › billables) becomes Finance › Income, every
// partner payout (payables) an expense waiting for approval (owed), every refund sent a Finance › Refunds row, and a store
// access the owner approved in their panel approves the matching access session. Each is booked once (keyed), so it is
// safe to run often: AdminShell runs it when a page opens and when the Services data changes.
// Front end only.

import { read as readServices, billables, payables, serviceById } from '@/lib/platform/services';
import { finance, bookServiceCharge, bookPartnerPayout, bookServiceRefund } from './finance';
import { access, approvedInPanel, stateOf as accessState } from './supportAccess';
import { now as platformNow } from '@/lib/platform/store';

let running = false;
export function syncServices() {
  if (running || typeof window === 'undefined') return;
  running = true;
  try {
    try { finance.load && finance.load(); access.load && access.load(); } catch { /* the stores load themselves */ }
    const db = readServices();
    const t = Date.now();
    for (const o of db.orders) {
      const svc = serviceById(o.serviceId) || { name: o.serviceId };
      for (const b of billables(o, t)) bookServiceCharge({ src: b.key, shopId: o.shopId, shopName: o.shopName, at: b.at, label: b.label, fee: b.fee, vatPct: o.vatPct, vat: b.vat, total: b.total, method: b.method, txId: b.txId, financeId: svc.financeId, category: 'Services' });
      for (const p of payables(o)) bookPartnerPayout({ src: p.key, at: p.at, amount: p.amount, partner: p.expert, label: p.label });
      for (const r of o.refunds || []) if (r.status === 'sent') bookServiceRefund({ src: o.id + ':' + r.id, shopId: o.shopId, amount: r.amount, at: r.at, method: o.paid.method, reason: r.reason, by: r.by, approvedBy: r.approvedBy, sentBy: r.sentBy, sentAt: r.sentAt });
      if (o.access && o.access.status === 'approved' && o.access.sessionId) {
        const s = access.get().list.find((x) => x.id === o.access.sessionId);
        if (s && accessState(s, platformNow()) === 'asked') approvedInPanel(s.id);
      }
    }
  } catch (e) { /* the books catch up next time */ } finally { running = false; }
}
