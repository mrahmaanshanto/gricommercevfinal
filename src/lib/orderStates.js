// orderStates — an order's separate states, worked out from what the order already records (Nayeem's Sales &
// Orders brief #4: "separate source, workflow and state"). The merchant still sees one status (orderStatus.js);
// these say which part of the order is waiting, so filters, exports and checks don't have to guess from it.
//
//   confirmation  needed · calling · confirmed · failed · not needed (counter sales and invoices) · cancelled
//   payment       paid · part paid · unpaid · refunded (+ method: COD when the rest is collected on delivery)
//   fulfilment    unfulfilled · stock held · stock taken · packing · packed · fulfilled · cancelled
//   delivery      not booked · in transit · out for delivery · delivery failed · delivered · returning · returned · picked up
//   due           what the customer still owes (0 when paid or cancelled)
//   completed     worked out by the shop's rule (orderRules.js › completionOf): delivered + fully paid + the return
//                 window passed. completion = { done, at, wait, text }; Delivered stays a step before it.
//   proof         'to review' when a payment proof waits (paymentProof.js), else ''
//   custom        the shop's own sub-status label (orderRules.js), or ''
//   exceptions    ['Possible duplicate', 'Delivery failed', 'Payment to review', …] — things that need a look
//   next          { key, label }: the one next step for the order
// Pass the order (as orders.js › getOrders shapes it) and, if known, its verification and holds.

import { completionOf, customStatusOf, getOrderRules } from './orderRules';
import { proofToReview } from './paymentProof';
import { editRequestOf } from './orderEdit';

const NEW = ['onhold', 'processing', 'pending'];
const COUNTER = (o) => /^(POS|Wholesale)/.test(String(o.channel || '')) || !!o.isInvoice;

export function orderStates(o, { verify = o && o.verify, held = false, duplicate = false, rules = getOrderRules(), now } = {}) {
  if (!o) return null;
  const k = o.statusKey;
  const counter = COUNTER(o);
  const amount = Number(o.amount) || 0;
  const paid = o.paid == null ? null : Number(o.paid) || 0;
  const hooks = (o.hooks || []).map((h) => h.code);

  const confirmation = counter ? 'not needed' : k === 'cancelled' ? 'cancelled'
    : !NEW.includes(k) ? 'confirmed'
    : verify && verify.state === 'calling' ? 'calling'
    : verify && verify.state === 'confirmed' ? 'confirmed'
    : verify && ['no-answer', 'wrong-number', 'declined'].includes(verify.state) ? 'failed'
    : 'needed';

  const cod = o.payment === 'COD' || Number(o.codAmount) > 0;
  const payment = o.refunded ? 'refunded'
    : o.payment === 'Paid' || (paid != null && amount > 0 && paid >= amount) ? 'paid'
    : (paid != null && paid > 0) || o.payment === 'Partial' ? 'part paid'
    : 'unpaid';

  const prep = o.prep || {};
  const fulfilment = k === 'cancelled' ? 'cancelled'
    : ['shipped', 'delivered', 'returned'].includes(k) || (counter && k === 'delivered') ? 'fulfilled'
    : k === 'ready' ? 'packed'
    : k === 'approved' ? (prep.packed ? 'packed' : prep.slipPrinted || prep.courier ? 'packing' : o.stockOut ? 'stock taken' : held ? 'stock held' : 'unfulfilled')
    : 'unfulfilled';

  const delivery = counter ? (k === 'delivered' ? 'picked up' : 'not booked')
    : k === 'delivered' ? 'delivered'
    : k === 'returned' ? (o.rtoDone ? 'returned' : 'returning')
    : k === 'shipped' ? (hooks.includes('failed') ? 'delivery failed' : hooks.includes('out') ? 'out for delivery' : 'in transit')
    : 'not booked';

  const due = k === 'cancelled' || payment === 'paid' || payment === 'refunded' ? 0 : Math.max(0, amount - (paid || 0));
  const completion = completionOf(o, { rules, due, ...(now ? { now } : {}) });
  const completed = completion.done;
  const proof = proofToReview(o) ? 'to review' : '';
  const custom = (customStatusOf(o, rules) || {}).label || '';
  const editAsked = !!editRequestOf(o);

  const exceptions = [];
  if (duplicate) exceptions.push('Possible duplicate');
  if (delivery === 'delivery failed') exceptions.push('Delivery failed');
  if (confirmation === 'failed') exceptions.push('Customer not confirmed');
  if (k === 'delivered' && due > 0 && !cod) exceptions.push('Delivered, not paid');
  if (o.advance && o.advance.state === 'requested' && NEW.includes(k)) exceptions.push('Advance requested');
  if (proof) exceptions.push('Payment to review');
  if (editAsked) exceptions.push('Edit to review');
  if (Number(o.refundDue) > 0) exceptions.push('Refund owed');
  // paid more after the parcel was booked: the courier still has the old COD amount
  if (o.sentAt && k === 'shipped' && Number(o.codAmount) > due) exceptions.push('COD to update');

  const next = k === 'cancelled' || completed ? { key: 'none', label: 'Nothing to do' }
    : proof ? { key: 'review', label: 'Review payment' }
    : NEW.includes(k) ? (confirmation === 'confirmed' ? { key: 'approve', label: 'Approve' } : { key: 'confirm', label: 'Confirm customer' })
    : k === 'approved' ? { key: 'pack', label: 'Prepare parcel' }
    : k === 'ready' ? { key: 'send', label: 'Send to courier' }
    : k === 'shipped' ? { key: 'track', label: delivery === 'delivery failed' ? 'Call the customer' : 'Track parcel' }
    : k === 'returned' ? { key: 'receive', label: 'Receive the return' }
    : due > 0 ? { key: 'collect', label: 'Collect payment' }
    : k === 'delivered' && !completed ? { key: 'complete', label: completion.text }
    : { key: 'none', label: 'Nothing to do' };

  return { confirmation, payment, method: cod ? 'COD' : (o.method || ''), fulfilment, delivery, due, completed, completion, proof, custom, exceptions, next };
}
