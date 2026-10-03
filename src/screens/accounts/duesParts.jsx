'use client';
// duesParts — what Dues › You will get can do with a customer's open invoices (brief #6, "Receivables"):
//   AllocateDialog   one payment spread across several invoices (oldest first, each line editable); the
//                    transaction ID is checked for repeats; money left over can be kept as the customer's credit
//   WriteOffDialog   write off a small balance (up to ৳500) with a reason; it waits for an approver
// Front end only: lib/allocations.js (which records each part with invoices.js recordPayment).

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { allocatePayment, openInvoicesOf, splitOldestFirst, requestWriteOff, WRITE_OFF_MAX } from '@/lib/allocations';
import { refMessage } from '@/lib/paymentRefs';
import { RefField, money, useMe } from './accShared';

const METHODS = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank transfer'];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** g: a Dues customer group ({ key, name, phone, digits, due }). */
export function AllocateDialog({ g, onClose }) {
  const me = useMe();
  const invoices = useMemo(() => openInvoicesOf(g.key), [g.key]);
  const total = r2(invoices.reduce((a, i) => a + i.due, 0));
  const [amount, setAmount] = useState(String(total));
  const [method, setMethod] = useState('bKash');
  const [ref, setRef] = useState('');
  const [lines, setLines] = useState(() => splitOldestFirst(invoices, total));
  const [keep, setKeep] = useState(false);
  const amt = r2(amount);
  const used = r2(lines.reduce((a, l) => a + (Number(l.amount) || 0), 0));
  const left = r2(amt - used);
  const spread = (v) => { setAmount(v); setLines(splitOldestFirst(invoices, r2(v))); };
  const setLine = (id, v) => setLines(lines.map((l) => (l.id === id ? { ...l, amount: v } : l)));
  const dup = ref ? refMessage(ref) : '';
  const save = (e) => {
    e.preventDefault();
    if (dup) { toast(dup, { tone: 'error' }); return; }
    const r = allocatePayment({ customer: g.name, method, amount: amt, ref: ref.trim(), lines: lines.map((l) => ({ id: l.id, amount: Number(l.amount) || 0 })), keepExtra: keep }, me);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    const n = r.allocation.lines.length;
    toast(`${money(amt)} from ${g.name} recorded on ${n} invoice${n === 1 ? '' : 's'}${r.allocation.extra ? ` · ${money(r.allocation.extra)} kept as credit` : ''}`);
    onClose(true);
  };
  return (
    <Dialog open title={`Payment from ${g.name}`} onClose={() => onClose(false)} width={600}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="du-alloc" className="gc-btn gc-btn--solid">Record {amt > 0 ? money(amt) : 'payment'}</button></>}>
      <form id="du-alloc" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="du-al-amt">Amount received (৳)</label><input id="du-al-amt" className="gc-input ac-fig" inputMode="decimal" value={amount} onChange={(e) => spread(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus /></div>
          <div><label className="gc-label" htmlFor="du-al-m">Paid by</label><select id="du-al-m" className="gc-input gc-select" value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
        </div>
        {method !== 'Cash' ? <RefField id="du-al-ref" label={method === 'Bank transfer' ? 'Bank reference' : 'Transaction ID'} value={ref} onChange={setRef} /> : null}
        <div>
          <span className="gc-label">Put it on</span>
          <table className="ac-mini">
            <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col" className="ac-num">Owes</th><th scope="col" className="ac-num">Pay</th></tr></thead>
            <tbody>{invoices.map((inv) => { const l = lines.find((x) => x.id === inv.id) || { amount: 0 }; return (
              <tr key={inv.id}>
                <td className="ac-fig">{inv.id}</td>
                <td>{formatDate(inv.at)}</td>
                <td className="ac-num ac-fig">{money(inv.due)}</td>
                <td className="ac-num"><input className="gc-input ac-fig" style={{ maxWidth: 120, textAlign: 'right' }} inputMode="decimal" aria-label={`Pay on ${inv.id}`} value={l.amount} onChange={(e) => setLine(inv.id, e.target.value.replace(/[^\d.]/g, ''))} /></td>
              </tr>); })}</tbody>
          </table>
        </div>
        {left > 0 ? (
          <div className="ac-note ac-note--info" role="status"><Icon name="info" width="16" height="16" aria-hidden="true" /><span><b>{money(left)} is not on an invoice.</b> <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Keep it as {g.name}’s credit</label></span></div>
        ) : left < 0 ? <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>The invoices take {money(-left)} more than the payment.</b> Lower one of them.</span></div> : null}
        <p className="gc-help" style={{ margin: 0 }}>Oldest invoice first. Change any line to put the money where the customer asked.</p>
      </form>
    </Dialog>
  );
}

/** Write off what is left on one invoice (up to WRITE_OFF_MAX), with a reason; it waits for approval. */
export function WriteOffDialog({ inv, onClose }) {
  const me = useMe();
  const [amount, setAmount] = useState(String(Math.min(inv.due, WRITE_OFF_MAX)));
  const [reason, setReason] = useState('');
  const save = (e) => {
    e.preventDefault();
    const r = requestWriteOff({ invoiceId: inv.id, amount: Number(amount) || 0, reason }, me);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    toast(`Write-off on ${inv.id} waits for approval (${r.request.id})`);
    onClose(true);
  };
  return (
    <Dialog open title={`Write off ${inv.id}`} onClose={() => onClose(false)} width={480}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="du-wo" className="gc-btn gc-btn--solid">Ask for approval</button></>}>
      <form id="du-wo" className="ac-form" onSubmit={save} noValidate>
        <p className="gc-help" style={{ margin: 0 }}>{inv.id} still owes {money(inv.due)}. A write-off is not a payment: the invoice owes less and no money moves.</p>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="du-wo-a">Amount (৳, up to {WRITE_OFF_MAX})</label><input id="du-wo-a" className="gc-input ac-fig" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus /></div>
        </div>
        <div><label className="gc-label" htmlFor="du-wo-r">Reason *</label><input id="du-wo-r" className="gc-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Rounding left after the last payment" /></div>
      </form>
    </Dialog>
  );
}
