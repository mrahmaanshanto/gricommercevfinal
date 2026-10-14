'use client';
// ProformaPaper — a quote printed as a proforma invoice with the shop's letterhead (Wholesale review WH-F5 / WH-U11):
// logo, address, BIN and trade licence (Settings › General), the buyer's name, phone, address and BIN, the items,
// discount, VAT and total, how to pay (bank, bKash) with the buyer's payment terms, and how long it is valid.
//   <ProformaPaper quote buyer totals innerRef />   quote: { id, at, sentAt, validUntil, lines, vatRate, note }
//                                                    buyer: { name, phone, address, bin }; totals: quotes.js › quoteTotals
//   Render it inside <OffScreen> (DocPaper.jsx) and print with printDoc, or use ShareActions with paper={ref}.

import React from 'react';
import { formatBDT, formatDate } from '@/lib/format';
import { termsForPhone, termsEntry } from '@/lib/buyerTerms';
import { getCustomers, findCustomer, resolveCustomer } from '@/lib/customers';
import { DocHead, DocParty, DocPayTo, S } from './DocPaper';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2 });

export function termsText(phone) {
  try {
    const t = phone ? termsForPhone(phone) : null;
    const e = t ? termsEntry(t.terms) : null;
    return e ? e.label : '';
  } catch { return ''; }
}

export function ProformaPaper({ quote, buyer = {}, totals }) {
  if (!quote) return null;
  const t = totals || { gross: 0, discount: 0, tax: 0, total: 0 };
  const terms = termsText(buyer.phone);
  return (
    <>
      <DocHead title="Proforma invoice" no={quote.id || 'Draft'} date={quote.sentAt || quote.at || undefined} sub={quote.validUntil ? 'Valid until ' + formatDate(quote.validUntil) : ''} />
      <DocParty label="To" name={buyer.name} phone={buyer.phone} address={buyer.address} bin={buyer.bin} />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={S.th}>#</th><th style={S.th}>Item</th><th style={{ ...S.th, ...S.num }}>Qty</th><th style={{ ...S.th, ...S.num }}>Unit price</th><th style={{ ...S.th, ...S.num }}>Amount</th></tr></thead>
        <tbody>{(quote.lines || []).map((l, i) => (
          <tr key={i}><td style={S.td}>{i + 1}</td><td style={S.td}>{l.name}{l.sku ? <div style={{ ...S.muted, fontFamily: 'var(--font-data)' }}>{l.sku}</div> : null}</td><td style={{ ...S.td, ...S.num }}>{l.qty}</td><td style={{ ...S.td, ...S.num }}>{money(Number(l.price) || 0)}</td><td style={{ ...S.td, ...S.num }}>{money((Number(l.price) || 0) * (Number(l.qty) || 0))}</td></tr>
        ))}</tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6mm', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}><DocPayTo terms={terms} /></div>
        <div style={{ width: '70mm', display: 'flex', flexDirection: 'column', gap: '1mm' }}>
          <div style={S.row}><span>Subtotal</span><span style={S.num}>{money(t.gross)}</span></div>
          {t.discount ? <div style={S.row}><span>Discount</span><span style={S.num}>− {money(t.discount)}</span></div> : null}
          {t.tax ? <div style={S.row}><span>VAT {quote.vatRate}%</span><span style={S.num}>{money(t.tax)}</span></div> : null}
          <div style={{ ...S.row, borderTop: '1px solid var(--text-heading)', paddingTop: '1mm', fontWeight: 'var(--weight-semibold)' }}><span>Total</span><span style={S.num}>{money(t.total)}</span></div>
        </div>
      </div>
      <div style={{ ...S.muted, borderTop: '1px solid var(--border-subtle)', paddingTop: '2mm' }}>
        {quote.validUntil ? `Prices are held until ${formatDate(quote.validUntil)}. ` : ''}This is a proforma invoice, not a tax invoice. Goods are held only once the order is confirmed.{quote.note ? ' ' + quote.note : ''}
      </div>
    </>
  );
}

export default ProformaPaper;

/** Address and BIN for a quote's buyer ({ name, phone, id, kind } from salesOrder.businessBuyers), from the customer
 *  book or the CRM (a company row keeps its billing address and BIN). */
export function buyerDetails(b) {
  if (!b) return {};
  let row = null;
  try { row = (b.id && resolveCustomer(b.id)) || (b.phone && findCustomer(getCustomers(), b.phone)) || null; } catch { row = null; }
  return { name: b.name, phone: b.phone, address: (row && row.address) || '', bin: (row && row.bin) || '' };
}
