// admin/gridShopSync — Grid Shop's money in the super admin's books (Batch D; vendors Batch E), like servicesSync:
//   - every paid order becomes Finance › Income (category Grid Shop; items, platform fee and delivery before VAT, VAT apart);
//   - every vendor payout (lib/platform/gridShop.js › payouts: asked for by the vendor, or made by staff) is an expense to
//     that vendor's account: waiting for approval while it is requested, paid when it was paid in Grid Shop. When Finance
//     pays a requested one in Finance › Expenses, the payout (and its parcels) show paid in Grid Shop; when staff pay it in
//     Grid Shop first, the expense is marked paid here with the same reference.
//   - GridCommerce's commission, markups, discounts it funds, vendors' fees and platform fees are the difference between
//     the order income and the payouts, so they are not booked again (that would count them twice).
// Booked once each (keyed), so it is safe to run often: AdminShell runs it on open and on gc:gridshop. A cancelled order is
// not booked (a refund goes through Finance › Refunds by hand). Front end only.

import { read as readShop, markPayoutPaid } from '@/lib/platform/gridShop';
import { bankText } from '@/lib/platform/services';
import { finance, bookServiceCharge, bookPartnerPayout } from './finance';

let running = false;
export function syncGridShop() {
  if (running || typeof window === 'undefined') return;
  running = true;
  try {
    try { finance.load && finance.load(); } catch { /* loads itself */ }
    const db = readShop();
    for (const o of db.orders) {
      if (o.cancelled) continue;
      const fee = o.platformFee || 0;
      bookServiceCharge({ src: o.id + ':pay', shopId: o.shopId, shopName: o.shopName, at: o.paid.at, label: `Grid Shop ${o.id} · ${o.lines.map((l) => l.qty + '× ' + l.name).join(', ')}`, fee: o.subtotal + o.delivery + fee, vatPct: o.vatPct, vat: o.vat, total: o.total, method: o.paid.method, txId: o.paid.txId, financeId: null, category: 'Grid Shop', description: 'Grid Shop order ' + o.id + (fee ? ' (with platform fee)' : '') });
    }
    for (const po of db.payouts || []) {
      const v = (db.vendors || []).find((x) => x.id === po.vendorId) || { name: po.vendorId };
      const key = 'gsp:' + po.id;
      const label = `Grid Shop vendor payout ${po.id} · ${po.parcels.length} parcel${po.parcels.length === 1 ? '' : 's'}${po.feeTotal ? ' less ৳' + po.feeTotal.toLocaleString('en-IN') + ' fees' : ''} · to ${bankText(po.to || v.bank)}`;
      bookPartnerPayout({ src: key, at: po.status === 'paid' ? po.paidAt : po.at, amount: po.amount, partner: { name: v.name, phone: v.phone, email: v.email }, label, paid: po.status === 'paid' ? { at: po.paidAt, ref: po.ref } : null });
      const e = (finance.get().expenses || []).find((x) => x.src === key);
      if (!e) continue;
      if (po.status === 'requested' && e.status === 'paid') markPayoutPaid(po.id, { at: e.paidAt, ref: e.ref, by: e.paidBy || 'Finance' });
      else if (po.status === 'paid' && e.status !== 'paid') {
        finance.commit((F) => { const x = F.expenses.find((y) => y.src === key); if (x && x.status !== 'paid') Object.assign(x, { status: 'paid', approvedBy: x.approvedBy || po.by, approvedAt: x.approvedAt || po.paidAt, paidAt: po.paidAt, paidBy: po.by, ref: po.ref || '' }); return { ok: true }; });
      }
    }
  } catch (e) { /* the books catch up next time */ } finally { running = false; }
}
