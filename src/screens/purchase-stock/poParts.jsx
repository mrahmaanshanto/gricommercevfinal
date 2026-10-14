'use client';
// poParts — shared pieces of the purchase order pages (PR-F4, PR-F5):
//   PODocument     the printed purchase order: the shop's letterhead (businessProfile › invoiceIdentity), supplier,
//                  products, total, terms and signatures. Kept off screen; printPO() prints it on its own (lib/printNode)
//                  so "Save as PDF" in the print window gives the PDF to send.
//   ReasonDialog   asks for a reason (reject, cancel, close the rest) before the action runs.

import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui';
import { invoiceIdentity } from '@/lib/businessProfile';
import { formatBDT, formatDate } from '@/lib/format';
import { printNode } from '@/lib/printNode';

export const PO_DOC_CSS = `
.pod-off{position:absolute;left:-10000px;top:0;width:794px}
.pod{width:794px;box-sizing:border-box;padding:40px 44px;background:#fff;color:var(--slate-900);font-family:var(--font-sans);font-size:var(--text-xs);line-height:1.45}
.pod-head{display:flex;justify-content:space-between;gap:24px;padding-bottom:14px;border-bottom:2px solid var(--primary)}
.pod-head b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.pod-head span{display:block;color:var(--slate-700)}
.pod-kind{text-align:right}
.pod-kind small{display:block;font-size:var(--text-2xs);letter-spacing:.08em;text-transform:uppercase;color:var(--primary);font-weight:var(--weight-semibold)}
.pod-kind strong{display:block;font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold)}
.pod-two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:18px 0}
.pod-two h3{margin:0 0 4px;font-size:var(--text-2xs);letter-spacing:.06em;text-transform:uppercase;color:var(--slate-500);font-weight:var(--weight-semibold)}
.pod-two p{margin:0}
.pod table{width:100%;border-collapse:collapse}
.pod th{padding:8px;border-bottom:1px solid var(--slate-300);background:var(--slate-100);font-size:var(--text-2xs);font-weight:var(--weight-semibold);text-align:left}
.pod td{padding:8px;border-bottom:1px solid var(--slate-200);vertical-align:top}
.pod .n{text-align:right;font-family:var(--font-data);white-space:nowrap}
.pod tfoot td{font-weight:var(--weight-semibold);border-bottom:0}
.pod-note{margin-top:16px;padding:10px 12px;border:1px solid var(--slate-200);border-radius:var(--radius-lg)}
.pod-sign{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:56px}
.pod-sign div{padding-top:4px;border-top:1px solid var(--slate-700);font-size:var(--text-2xs);color:var(--slate-500)}
.pod-foot{margin-top:18px;font-size:var(--text-2xs);color:var(--slate-500)}
`;

/** The printed purchase order. `sup` = the supplier row (phone, address, person) when known. */
export function PODocument({ po, sup, id = 'po-doc' }) {
  const [me, setMe] = useState(null);
  useEffect(() => { setMe(invoiceIdentity()); }, []);
  if (!po || !me) return null;
  const extra = (po.costs || []).reduce((a, c) => a + (Number(c.amt) || 0), 0);
  return (
    <div className="pod-off" aria-hidden="true">
      <div id={id} className="pod">
        <header className="pod-head">
          <div><b>{me.tradingName || me.name}</b>{me.tradingName && me.name !== me.tradingName ? <span>{me.name}</span> : null}<span>{me.address}</span><span>{[me.phone, me.email].filter(Boolean).join(' · ')}</span>{me.bin ? <span>BIN {me.bin}</span> : null}</div>
          <div className="pod-kind"><small>Purchase order</small><strong>{po.no}</strong><span>{formatDate(po.at)}</span></div>
        </header>
        <div className="pod-two">
          <div><h3>Supplier</h3><p><b>{po.supplier}</b></p>{sup && sup.person ? <p>{sup.person}</p> : null}{sup && sup.address ? <p>{sup.address}</p> : null}{sup && sup.phone && sup.phone !== '—' ? <p>{sup.phone}</p> : null}</div>
          <div><h3>Deliver to</h3><p><b>{po.place}</b></p>{po.expected ? <p>By {po.expected}</p> : null}{po.terms != null ? <p>Payment: {po.terms ? po.terms + ' days after delivery' : 'on delivery'}</p> : null}</div>
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th className="n">Quantity</th><th className="n">Unit price</th><th className="n">Amount</th></tr></thead>
          <tbody>
            {po.lines.map((l, i) => <tr key={i}><td>{i + 1}</td><td>{l.name}{l.code ? <><br /><span style={{ color: 'var(--slate-500)', fontFamily: 'var(--font-data)' }}>{l.code}</span></> : null}</td><td className="n">{l.qty}</td><td className="n">{formatBDT(l.cost)}</td><td className="n">{formatBDT(l.qty * l.cost)}</td></tr>)}
          </tbody>
          <tfoot>
            {extra ? <tr><td colSpan={4}>Extra costs</td><td className="n">{formatBDT(extra)}</td></tr> : null}
            <tr><td colSpan={4}>Total ({po.pieces} pieces)</td><td className="n">{formatBDT(po.total + extra)}</td></tr>
          </tfoot>
        </table>
        {po.note ? <div className="pod-note">{po.note}</div> : null}
        <div className="pod-sign"><div>Prepared by {po.by || ''}</div><div>Approved by {po.approvedBy ? po.approvedBy.by : ''}</div><div>Supplier’s signature</div></div>
        <p className="pod-foot">Please quote {po.no} on your challan and invoice.</p>
      </div>
    </div>
  );
}

/** Print the PODocument on the page (Save as PDF in the print window makes the PDF). */
export function printPO(po, id = 'po-doc') {
  const node = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (!node) return false;
  printNode(node, { title: po.no, css: '@page{size:A4 portrait;margin:0}' });
  return true;
}

/** Ask for a reason, then run onSubmit(reason). `optional` lets it go without one. */
export function ReasonDialog({ open, title, label, confirmLabel, danger, optional, body, onClose, onSubmit }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setText(''); setErr(''); } }, [open]);
  const go = (e) => {
    e.preventDefault();
    if (!optional && !text.trim()) { setErr('Write a reason.'); return; }
    onSubmit(text.trim());
  };
  return (
    <Dialog open={open} title={title} onClose={onClose} width={480}>
      <form onSubmit={go} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {body ? <p className="gc-help" style={{ margin: 0 }}>{body}</p> : null}
        <div>
          <label className="gc-label" htmlFor="po-reason">{label}</label>
          <textarea id="po-reason" className="gc-input" rows="3" value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} aria-invalid={err ? 'true' : undefined} aria-describedby={err ? 'po-reason-err' : undefined} />
          {err ? <span id="po-reason-err" className="gc-help" style={{ color: 'var(--text-danger)' }}>{err}</span> : null}
        </div>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
          <button type="submit" className={'gc-btn ' + (danger ? 'gc-btn--error' : 'gc-btn--solid')}>{confirmLabel}</button>
        </div>
      </form>
    </Dialog>
  );
}
