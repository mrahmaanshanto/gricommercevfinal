'use client';
// TakePayment — take one payment from a buyer and spread it across their open invoices, oldest first (Wholesale review
// WH-F7): amount, method (Cash · bKash · Bank · Cheque) with its reference, who received it, the split (each line can
// be changed), money left over kept as credit. Saving records it (lib/allocations.js › allocatePayment: every invoice
// gets its part, the money lands in the method's account, the reference is used once) and shows the money receipt
// (components/docs/MoneyReceipt.jsx) with PDF and Send on WhatsApp. Used by Collections and the buyer page.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { dueDateOf } from '@/lib/invoices';
import { allocatePayment, openInvoicesOf, splitOldestFirst } from '@/lib/allocations';
import { refMessage } from '@/lib/paymentRefs';
import { EMPLOYEES } from '@/lib/posStore';
import { currentUser } from '@/lib/team';
import { demoNow } from '@/lib/demoClock';
import { ReceiptView } from '@/components/docs/MoneyReceipt';

const METHODS = [['Cash', 'banknote'], ['bKash', 'smartphone'], ['Bank', 'landmark'], ['Cheque', 'file-text']];
const REF_LABEL = { bKash: 'Transaction ID', Bank: 'Bank reference', Cheque: 'Cheque no. and bank' };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const money = (n) => formatBDT(n, { decimals: Number.isInteger(r2(n)) ? 0 : 2 });
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');

const CSS = `
.tp{display:flex;flex-direction:column;gap:var(--space-4)}
.tp-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.tp-methods{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.tp-methods .ix-btn[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.tp-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.tp-lines th{padding:0 var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.tp-lines td{padding:6px var(--space-2) 6px 0;border-bottom:1px solid var(--border-subtle)}
.tp-lines .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.tp-lines input{max-width:120px;text-align:right}
.tp-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.tp-late{display:block;font-size:var(--text-xs);color:var(--text-danger)}
.tp-soon{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tp-note{display:flex;align-items:flex-start;gap:var(--space-2);margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font-size:var(--text-sm);color:var(--text-heading)}
.tp-note.is-warn{background:var(--fill-warning-soft)}
.tp-sum{display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--text-muted)}
.tp-sum b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:640px){.tp-two{grid-template-columns:minmax(0,1fr)}}
`;

/** buyer: { name, phone, address }. onClose(saved) — saved is true once a payment was recorded. */
export default function TakePayment({ buyer, onClose }) {
  const key = digits(buyer && buyer.phone) || 'name:' + ((buyer && buyer.name) || 'Walk-in customer');
  const [invoices, setInvoices] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [ref, setRef] = useState('');
  const [by, setBy] = useState(EMPLOYEES[0].name);
  const [lines, setLines] = useState([]);
  const [keep, setKeep] = useState(false);
  const [done, setDone] = useState(null);     // the saved allocation: the receipt is shown
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!buyer) return;
    const list = openInvoicesOf(key);
    const total = r2(list.reduce((a, i) => a + i.due, 0));
    setInvoices(list); setAmount(String(total)); setLines(splitOldestFirst(list, total)); setMethod('Cash'); setRef(''); setKeep(false); setDone(null); setNow(demoNow());
    const me = currentUser();
    if (me && EMPLOYEES.some((e) => e.name === me.name)) setBy(me.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer && buyer.phone, buyer && buyer.name]);
  if (!buyer) return null;

  const owed = r2(invoices.reduce((a, i) => a + i.due, 0));
  const amt = r2(amount);
  const used = r2(lines.reduce((a, l) => a + (Number(l.amount) || 0), 0));
  const left = r2(amt - used);
  const spread = (v) => { setAmount(v); setLines(splitOldestFirst(invoices, r2(v))); };
  const setLine = (id, v) => setLines(lines.map((l) => (l.id === id ? { ...l, amount: v } : l)));
  const dup = ref ? refMessage(ref) : '';
  const needRef = method !== 'Cash';

  const save = (e) => {
    e.preventDefault();
    if (!(amt > 0)) { toast('Enter the amount received', { tone: 'error' }); return; }
    if (needRef && !ref.trim()) { toast(`Enter the ${REF_LABEL[method].toLowerCase()}`, { tone: 'error' }); return; }
    if (dup) { toast(dup, { tone: 'error' }); return; }
    const parts = lines.map((l) => ({ id: l.id, amount: Number(l.amount) || 0 }));
    const r = allocatePayment({ customer: buyer.name, method, amount: amt, ref: ref.trim(), lines: parts, keepExtra: keep,
      meta: { phone: digits(buyer.phone), address: buyer.address || '', owedBefore: owed, owedAfter: r2(Math.max(0, owed - used)) } }, { name: by });
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    const n = r.allocation.lines.length;
    toast(`${money(amt)} from ${buyer.name} recorded on ${n} invoice${n === 1 ? '' : 's'}${r.allocation.extra ? ` · ${money(r.allocation.extra)} kept as credit` : ''}`);
    setDone(r.allocation);
  };
  const close = () => onClose(!!done);

  if (done) {
    return (
      <Dialog open title={`Money receipt · ${done.id}`} onClose={close} width={720}
        footer={<button type="button" className="gc-btn gc-btn--solid" onClick={close}>Done</button>}>
        <ReceiptView alloc={done} />
      </Dialog>
    );
  }
  return (
    <Dialog open title={`Take payment · ${buyer.name}`} onClose={close} width={640}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button><button type="submit" form="tp-form" className="gc-btn gc-btn--solid" disabled={!invoices.length}>Record {amt > 0 ? money(amt) : 'payment'}</button></>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!invoices.length ? <p className="gc-help" style={{ margin: 0 }}>{buyer.name} owes nothing now.</p> : (
        <form id="tp-form" className="tp" onSubmit={save} noValidate>
          <div className="tp-sum"><span>Owes on {invoices.length} invoice{invoices.length === 1 ? '' : 's'}</span><b>{money(owed)}</b></div>
          <div className="tp-two">
            <div><label className="gc-label" htmlFor="tp-amt">Amount received (৳)</label><input id="tp-amt" className="gc-input" inputMode="decimal" value={amount} onChange={(e) => spread(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="tp-by">Received by</label><select id="tp-by" className="gc-input gc-select" value={by} onChange={(e) => setBy(e.target.value)}>{EMPLOYEES.map((m) => <option key={m.name} value={m.name}>{m.name} · {m.role}</option>)}</select></div>
          </div>
          <div>
            <span className="gc-label" id="tp-m-l">Paid by</span>
            <div className="tp-methods" role="group" aria-labelledby="tp-m-l">
              {METHODS.map(([m, icon]) => <button key={m} type="button" className="ix-btn" aria-pressed={method === m} onClick={() => { setMethod(m); setRef(''); }}><Icon name={icon} width="16" height="16" aria-hidden="true" />{m}</button>)}
            </div>
          </div>
          {needRef ? (
            <div>
              <label className="gc-label" htmlFor="tp-ref">{REF_LABEL[method]} *</label>
              <input id="tp-ref" className={'gc-input' + (dup ? ' gc-input--error' : '')} value={ref} onChange={(e) => setRef(e.target.value)} placeholder={method === 'Cheque' ? 'e.g. 0045821 · DBBL' : method === 'Bank' ? 'e.g. deposit slip no.' : 'e.g. 9KT5MX2RQA'} autoComplete="off" aria-invalid={!!dup} />
              {dup ? <p className="gc-help gc-help--error" role="alert" style={{ margin: '4px 0 0' }}>{dup}</p> : null}
            </div>
          ) : null}
          <div>
            <span className="gc-label">Put it on</span>
            <div className="gc-table-wrap">
              <table className="tp-lines">
                <thead><tr><th scope="col">Invoice</th><th scope="col">Due</th><th scope="col" className="r">Owes</th><th scope="col" className="r">Pay</th></tr></thead>
                <tbody>{invoices.map((inv) => {
                  const l = lines.find((x) => x.id === inv.id) || { amount: 0 };
                  const late = now ? Math.floor((now - dueDateOf(inv)) / 864e5) : 0;
                  return (
                    <tr key={inv.id}>
                      <td><span className="tp-id">{inv.id}</span><span className="tp-soon">{formatDate(inv.at)}</span></td>
                      <td>{formatDate(dueDateOf(inv))}{late > 0 ? <span className="tp-late">{late} day{late === 1 ? '' : 's'} late</span> : null}</td>
                      <td className="r">{money(inv.due)}</td>
                      <td className="r"><input className="gc-input" inputMode="decimal" aria-label={`Pay on ${inv.id}`} value={l.amount} onChange={(e) => setLine(inv.id, e.target.value.replace(/[^\d.]/g, ''))} /></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
          {left > 0 ? (
            <p className="tp-note" role="status"><Icon name="info" width="16" height="16" aria-hidden="true" style={{ flex: 'none', marginTop: 2 }} /><span><b>{money(left)} is not on an invoice.</b>{buyer.phone ? <> <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" className="gc-check" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Keep it as {buyer.name}’s credit</label></> : ' Lower the amount.'}</span></p>
          ) : left < 0 ? <p className="tp-note is-warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" style={{ flex: 'none', marginTop: 2 }} /><span><b>The invoices take {money(-left)} more than the payment.</b> Lower one of them.</span></p> : null}
          <p className="gc-help" style={{ margin: 0 }}>Oldest invoice first. Change a line to put the money where the buyer asked.</p>
        </form>
      )}
    </Dialog>
  );
}
