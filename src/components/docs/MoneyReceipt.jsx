'use client';
// MoneyReceipt — the money receipt (মানি রিসিট) a buyer gets for one payment (Collections, WH-F7): the shop's letterhead,
// receipt number and date, who paid, the amount in figures and in words, how it was paid (method and reference), the
// invoices it paid and what is still owed, who received it, signatures. It is one allocation of lib/allocations.js.
// `alloc.leftOn` ({ invoice id: owed after this payment }) keeps each receipt of a split payment true to its own moment.
//   <MoneyReceiptPaper alloc />          the paper (on screen in the dialog, printed with printDoc)
//   <ReceiptView alloc />                 the paper + PDF / Send on WhatsApp (inside a dialog the caller owns)

import React, { useRef } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getInvoices } from '@/lib/invoices';
import { shareWhatsApp, printDoc } from '@/lib/shareDoc';
import { DocHead, DocParty, S, takaInWords } from './DocPaper';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2 });

/** The paper. */
export function MoneyReceiptPaper({ alloc, innerRef }) {
  if (!alloc) return null;
  const all = typeof window === 'undefined' ? [] : getInvoices();
  const inv = (id) => all.find((x) => x.id === id);
  return (
    <div ref={innerRef} style={{ ...S.page, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }} className="mr-paper">
      <DocHead title="Money receipt" no={alloc.id} date={alloc.at} sub={'মানি রিসিট · ' + formatTime(alloc.at)} />
      <div style={S.row}>
        <DocParty label="Received from" name={alloc.customer} phone={alloc.phone} address={alloc.address} />
        <div style={{ textAlign: 'right' }}>
          <div style={S.cap}>Amount received</div>
          <b style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', fontFamily: 'var(--font-data)' }}>{money(alloc.amount)}</b>
          <div style={S.muted}>{takaInWords(alloc.amount)}</div>
        </div>
      </div>
      <div style={{ ...S.box, display: 'flex', gap: '6mm', flexWrap: 'wrap' }}>
        <div><div style={S.cap}>Paid by</div><b style={{ fontWeight: 'var(--weight-medium)' }}>{alloc.method}</b></div>
        {alloc.ref ? <div><div style={S.cap}>{alloc.method === 'Cheque' ? 'Cheque no.' : alloc.method === 'Bank' ? 'Bank reference' : 'Transaction ID'}</div><b style={{ fontWeight: 'var(--weight-medium)', fontFamily: 'var(--font-data)' }}>{alloc.ref}</b></div> : null}
        <div><div style={S.cap}>Received by</div><b style={{ fontWeight: 'var(--weight-medium)' }}>{alloc.by || '—'}</b></div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={S.th}>Against invoice</th><th style={S.th}>Invoice date</th><th style={{ ...S.th, ...S.num }}>Paid now</th><th style={{ ...S.th, ...S.num }}>Still owed on it</th></tr></thead>
        <tbody>
          {alloc.lines.map((l) => { const x = inv(l.id); return (
            <tr key={l.id}><td style={{ ...S.td, fontFamily: 'var(--font-data)' }}>{l.id}</td><td style={S.td}>{x ? formatDate(x.at) : '—'}</td><td style={{ ...S.td, ...S.num }}>{money(l.amount)}</td><td style={{ ...S.td, ...S.num }}>{alloc.leftOn && alloc.leftOn[l.id] != null ? money(Math.max(0, alloc.leftOn[l.id])) : x ? money(Math.max(0, x.due)) : '—'}</td></tr>
          ); })}
          {alloc.extra ? <tr><td style={S.td} colSpan={2}>Kept as advance credit</td><td style={{ ...S.td, ...S.num }}>{money(alloc.extra)}</td><td style={S.td} /></tr> : null}
        </tbody>
      </table>
      {alloc.owedAfter != null ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '80mm', display: 'flex', flexDirection: 'column', gap: '1mm' }}>
            {alloc.owedBefore != null ? <div style={S.row}><span>Owed before</span><span style={S.num}>{money(alloc.owedBefore)}</span></div> : null}
            <div style={S.row}><span>Paid now</span><span style={S.num}>− {money(alloc.amount - (alloc.extra || 0))}</span></div>
            <div style={{ ...S.row, borderTop: '1px solid var(--text-heading)', paddingTop: '1mm', fontWeight: 'var(--weight-semibold)' }}><span>Still owed</span><span style={S.num}>{money(alloc.owedAfter)}</span></div>
          </div>
        </div>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '12mm', marginTop: '10mm' }}>
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '1mm', ...S.muted }}>Paid by (signature)</div>
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '1mm', ...S.muted }}>Received by (signature and seal)</div>
      </div>
      <div style={{ ...S.muted, borderTop: '1px solid var(--border-subtle)', paddingTop: '2mm' }}>A cheque counts as paid when the bank clears it. This is a computer-made receipt.</div>
    </div>
  );
}

/** The receipt with its two actions; the caller puts it in a dialog. */
export function ReceiptView({ alloc }) {
  const ref = useRef(null);
  if (!alloc) return null;
  const pdf = () => printDoc(ref.current, 'Money receipt ' + alloc.id);
  const wa = () => {
    const r = shareWhatsApp({ kind: 'receipt', id: alloc.id, to: { name: alloc.customer, phone: alloc.phone }, total: alloc.amount,
      lines: [`Against ${alloc.lines.map((l) => l.id).join(', ')}`, `Paid by ${alloc.method}${alloc.ref ? ' · ' + alloc.ref : ''}`, alloc.owedAfter != null ? `Still owed: ${money(alloc.owedAfter)}` : ''] });
    toast(r.toNumber ? `WhatsApp opened with the receipt for ${alloc.customer}` : 'WhatsApp opened. Choose who to send it to.');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div className="mr-acts" style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button type="button" className="ix-btn" onClick={wa}><Icon name="send" width="16" height="16" aria-hidden="true" />Send on WhatsApp</button>
        <button type="button" className="ix-btn" onClick={pdf}><Icon name="download" width="16" height="16" aria-hidden="true" />PDF</button>
      </div>
      <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 560 }}><MoneyReceiptPaper alloc={alloc} innerRef={ref} /></div></div>
    </div>
  );
}
