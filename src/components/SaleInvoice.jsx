'use client';
// SaleInvoice — a sale's A4 invoice, printed on its own (lib/printNode): the shop's letterhead (name, address, phone,
// BIN), invoice number and date, customer, items with their IMEI / serial and warranty, totals, how it was paid, who
// sold it. The POS prints it after a sale ("Print invoice", next to Print receipt); the order page prints it too.
//   invoiceFromSale(sale)          a POS sale (Pos.jsx receipt) → the invoice's data
//   invoiceFromOrder(order, sale)  an order (its POS sale when it came from the counter) → the invoice's data
//   <SaleInvoice doc innerRef />   the paper, kept off screen; printInvoice(node, doc) prints it

import React from 'react';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { invoiceIdentity } from '@/lib/businessProfile';
import { printNode } from '@/lib/printNode';
import { coverOf } from '@/lib/warranty';
import { productOfLine, serialsOfLine, coverStart } from '@/lib/customerWarranty';

const r2 = (n) => Math.round(n * 100) / 100;
const money = (n) => formatBDT(n, { decimals: Number.isInteger(r2(n)) ? 0 : 2 });
const warrantyText = (l, at) => { const w = coverOf(productOfLine(l), at); return w ? `${w.label} · until ${formatDate(w.until)}` : ''; };

/** The invoice of a POS sale. */
export function invoiceFromSale(s) {
  const t = s.totals || {};
  const disc = r2((t.cartDisc || 0) + (t.couponDisc || 0) + (t.memberDisc || 0) + (t.pointsDisc || 0));
  return {
    id: s.id, at: s.at, customer: s.customer || {}, seller: s.salesperson || s.cashier || '', place: s.counter || '',
    lines: (s.lines || []).map((l) => ({ name: l.name, qty: l.qty, price: l.price, amount: r2(l.price * l.qty - (l.disc || 0)), serials: l.serials || [], warranty: warrantyText(l, s.at) })),
    subtotal: r2((t.gross || 0) - (t.lineDisc || 0)), discount: disc, vat: t.tax || 0, total: t.total || 0,
    payments: (s.tenders || []).map((x) => ({ method: /^Due/.test(x.method) ? 'Unpaid (due)' : x.method, amount: x.amount })), change: s.change || 0, due: s.due || 0,
  };
}
/** The invoice of an order; a counter order uses its POS sale when there is one. */
export function invoiceFromOrder(o, sale) {
  if (sale) return { ...invoiceFromSale(sale), id: o.id, ref: sale.id };
  const start = coverStart(o);
  const lines = (o.lines || []).map((l) => ({ name: l.name, qty: l.qty, price: l.price, amount: r2(l.price * l.qty), serials: serialsOfLine(o, l, null), warranty: warrantyText(l, start) }));
  const subtotal = r2(lines.reduce((a, l) => a + l.amount, 0));
  const total = o.amount || r2(subtotal + (o.shipping || 0) + (o.vat || 0) - (o.discount || 0));
  const paid = o.payment === 'Paid' ? total : o.paid || 0;
  return {
    id: o.id, at: o.at, customer: { name: o.customer, phone: o.phone !== '—' ? o.phone : '', address: o.address || '' }, seller: o.soldBy || '', place: o.channel,
    lines, subtotal, discount: o.discount || 0, vat: o.vat || 0, shipping: o.shipping || 0, total,
    payments: paid ? [{ method: o.method || (o.payment === 'COD' ? 'Cash on delivery' : 'Payment received'), amount: paid }] : [], change: 0, due: r2(Math.max(0, total - paid)),
  };
}

const S = {
  page: { fontFamily: 'var(--font-sans)', color: '#0f172a', fontSize: 'var(--text-sm)', padding: '4mm', display: 'flex', flexDirection: 'column', gap: '5mm' },
  row: { display: 'flex', justifyContent: 'space-between', gap: '6mm' },
  muted: { color: '#475569', fontSize: 'var(--text-xs)' },
  th: { textAlign: 'left', padding: '2mm 1mm', borderBottom: '1px solid #0f172a', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' },
  td: { padding: '2mm 1mm', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' },
  num: { textAlign: 'right', fontFamily: 'var(--font-data)', whiteSpace: 'nowrap' },
};

/** The invoice paper (render it off screen and print it with printInvoice). */
export function SaleInvoice({ doc, innerRef }) {
  if (!doc) return null;
  const id = (() => { try { return invoiceIdentity(); } catch { return {}; } })();
  const sum = [['Subtotal', doc.subtotal], doc.discount ? ['Discount', -doc.discount] : null, doc.shipping ? ['Delivery', doc.shipping] : null, doc.vat ? ['VAT', doc.vat] : null].filter(Boolean);
  return (
    <div style={{ position: 'absolute', left: '-10000px', top: 0, width: '190mm' }} aria-hidden="true">
      <div ref={innerRef} style={S.page}>
        <div style={{ ...S.row, borderBottom: '2px solid #0f172a', paddingBottom: '3mm' }}>
          <div>
            <b style={{ fontSize: 'var(--text-xl)' }}>{id.tradingName || MERCHANT.name}</b>
            <div style={S.muted}>{id.address || MERCHANT.address}</div>
            <div style={S.muted}>{id.phone || MERCHANT.phone}{id.email || MERCHANT.email ? ' · ' + (id.email || MERCHANT.email) : ''}</div>
            <div style={S.muted}>BIN {id.bin || MERCHANT.bin}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <b style={{ fontSize: 'var(--text-lg)' }}>Invoice</b>
            <div style={{ fontFamily: 'var(--font-data)' }}>{doc.id}</div>
            <div style={S.muted}>{formatDate(doc.at)}, {formatTime(doc.at)}</div>
            {doc.place ? <div style={S.muted}>{doc.place}</div> : null}
          </div>
        </div>
        <div style={S.row}>
          <div><div style={S.muted}>Bill to</div><b>{doc.customer.name || 'Walk-in customer'}</b>{doc.customer.phone ? <div>{doc.customer.phone}</div> : null}{doc.customer.address ? <div style={S.muted}>{doc.customer.address}</div> : null}</div>
          {doc.seller ? <div style={{ textAlign: 'right' }}><div style={S.muted}>Sold by</div><b>{doc.seller}</b></div> : null}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={S.th}>Item</th><th style={{ ...S.th, ...S.num }}>Qty</th><th style={{ ...S.th, ...S.num }}>Unit price</th><th style={{ ...S.th, ...S.num }}>Amount</th></tr></thead>
          <tbody>{doc.lines.map((l, i) => (
            <tr key={i}>
              <td style={S.td}><b style={{ fontWeight: 'var(--weight-medium)' }}>{l.name}</b>
                {l.serials.length ? <div style={{ ...S.muted, fontFamily: 'var(--font-data)' }}>{(l.serials.every((x) => /^\d{15}$/.test(x)) ? 'IMEI ' : 'Serial ') + l.serials.join(', ')}</div> : null}
                {l.warranty ? <div style={S.muted}>Warranty: {l.warranty}</div> : null}</td>
              <td style={{ ...S.td, ...S.num }}>{l.qty}</td><td style={{ ...S.td, ...S.num }}>{money(l.price)}</td><td style={{ ...S.td, ...S.num }}>{money(l.amount)}</td>
            </tr>
          ))}</tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '75mm', display: 'flex', flexDirection: 'column', gap: '1mm' }}>
            {sum.map(([k, v]) => <div key={k} style={S.row}><span>{k}</span><span style={S.num}>{v < 0 ? '− ' + money(-v) : money(v)}</span></div>)}
            <div style={{ ...S.row, borderTop: '1px solid #0f172a', paddingTop: '1mm', fontWeight: 'var(--weight-semibold)' }}><span>Total</span><span style={S.num}>{money(doc.total)}</span></div>
            {doc.payments.map((p, i) => <div key={i} style={{ ...S.row, ...S.muted }}><span>Paid · {p.method}</span><span style={S.num}>{money(p.amount)}</span></div>)}
            {doc.change ? <div style={{ ...S.row, ...S.muted }}><span>Change</span><span style={S.num}>{money(doc.change)}</span></div> : null}
            {doc.due ? <div style={{ ...S.row, fontWeight: 'var(--weight-semibold)' }}><span>Due</span><span style={S.num}>{money(doc.due)}</span></div> : null}
          </div>
        </div>
        <div style={{ ...S.muted, borderTop: '1px solid #e2e8f0', paddingTop: '2mm' }}>Thank you for shopping at {MERCHANT.name}. Keep this invoice for warranty claims; bring it with the product and its box.</div>
      </div>
    </div>
  );
}
/** Print the invoice paper. */
export const printInvoice = (node, doc) => printNode(node, { title: 'Invoice ' + (doc ? doc.id : ''), css: '@page{size:A4;margin:12mm}' });
