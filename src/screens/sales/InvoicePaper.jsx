'use client';
// InvoicePaper — the invoice as the customer gets it: merchant logo and details, bill-to, items,
// totals, payments received and how to pay. "Print" prints only this sheet (see PAPER_CSS).

import React from 'react';
import { formatBDT, formatDate } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { paidSoFar, discountsOf, statusOf, activePayments } from '@/lib/invoices';

export const INVOICE_STATUS = { paid: ['Paid', 'success'], partial: ['Partly paid', 'info'], unpaid: ['Unpaid', 'warning'] };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });

export const PAPER_CSS = `
.iv-paper{display:flex;flex-direction:column;gap:var(--space-5);padding:var(--space-6);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:#fff;color:var(--text-body);font-size:var(--text-sm)}
.iv-paper__head{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-4);padding-bottom:var(--space-4);border-bottom:2px solid var(--primary)}
.iv-paper__brand{display:flex;align-items:center;gap:var(--space-3)}
.iv-paper__brand b{display:block;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.iv-paper__brand span{font-size:var(--text-xs);color:var(--text-muted)}
.iv-paper__title{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.iv-paper__title b{font-size:var(--text-2xl);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-wide);color:var(--primary)}
.iv-paper__title>span:first-of-type{font-family:var(--font-data);color:var(--text-heading)}
.iv-paper__meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-5)}
.iv-paper__meta>div,.iv-paper__notes{display:flex;flex-direction:column;gap:2px;min-width:0;font-size:var(--text-xs);line-height:18px}
.iv-paper__meta b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.iv-paper__items{width:100%;border-collapse:collapse}
.iv-paper__items th{padding:var(--space-2) var(--space-3);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);text-align:left;color:var(--text-heading)}
.iv-paper__items th.iv-num{text-align:right}
.iv-paper__items td{padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle);vertical-align:top}
.iv-paper__foot{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:var(--space-6);align-items:start}
.iv-paper__sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-4);margin:0;font-variant-numeric:tabular-nums}
.iv-paper__sum dd{margin:0;text-align:right;color:var(--text-heading)}
.iv-paper__sum .is-total{padding-top:6px;border-top:1px solid var(--border-strong);font-weight:var(--weight-semibold);color:var(--text-heading)}
.iv-paper__sum .is-due{padding:var(--space-2) var(--space-3);background:var(--fill-primary-soft);font-weight:var(--weight-semibold);color:var(--primary)}
.iv-paper__sum dt.is-due{border-radius:var(--radius-md) 0 0 var(--radius-md)}
.iv-paper__sum dd.is-due{border-radius:0 var(--radius-md) var(--radius-md) 0;margin-left:calc(-1 * var(--space-4))}
.iv-paper__end{display:flex;justify-content:space-between;align-items:flex-end;gap:var(--space-5);padding-top:var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.iv-paper__sign{flex:none;min-width:180px;padding-top:var(--space-6);border-bottom:0;border-top:1px solid var(--border-strong);margin-top:var(--space-6);text-align:center}
@media (max-width:699px){.iv-paper{padding:var(--space-4)}.iv-paper__meta,.iv-paper__foot{grid-template-columns:minmax(0,1fr)}.iv-paper__head{flex-direction:column}.iv-paper__title{align-items:flex-start}}
@media print{body *{visibility:hidden!important}.iv-paper,.iv-paper *{visibility:visible!important}.iv-paper{position:fixed;left:0;top:0;width:100%;border:0;border-radius:0;padding:24px}}
.iv-cap{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.iv-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.iv-num{text-align:right;font-variant-numeric:tabular-nums}
`;

/** `customer` is the customer-book row (for the address); `held` is where the stock is held, if anywhere. */
export function InvoicePaper({ inv, customer, held }) {
  const view = inv, cust = customer, STATUS = INVOICE_STATUS;
  const who = (r) => r.customer.name || 'Walk-in customer';
  const heldAt = () => held;
  const st = statusOf(view), disc = Math.round((discountsOf(view) - (view.totals.lineDisc || 0)) * 100) / 100;
  const taken = paymentsOf(view);
  return (
            <article className="iv-paper" aria-label={`Invoice ${view.id}`}>
              <header className="iv-paper__head">
                <div className="iv-paper__brand">
                  <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={`${MERCHANT.name} logo`}><rect width="52" height="52" rx="12" fill="#003087" /><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div><b>{MERCHANT.name}</b><span>{MERCHANT.tagline}</span></div>
                </div>
                <div className="iv-paper__title"><b>INVOICE</b><span>{view.id}{view.rev > 1 ? ` · revision ${view.rev}` : ''}</span><span className={'gc-badge gc-badge--' + STATUS[st][1]}>{STATUS[st][0]}</span></div>
              </header>
              <div className="iv-paper__meta">
                <div><span className="iv-cap">From</span><b>{MERCHANT.name}</b><span>{MERCHANT.address}</span><span>{MERCHANT.phone} · {MERCHANT.email}</span><span>BIN {MERCHANT.bin} · Trade licence {MERCHANT.licence}</span></div>
                <div><span className="iv-cap">Bill to</span><b>{who(view)}</b><span>{(cust && cust.address) || 'Address not on file'}</span><span>{view.customer.phone || 'No mobile number'}</span>{view.wholesale ? <span>{view.tier || 'Wholesale customer'}</span> : null}</div>
                <div><span className="iv-cap">Details</span><span>Invoice date: <b>{formatDate(view.at)}</b></span><span>Sold by: {view.cashier || '—'}</span><span>Counter: {view.counter || '—'}</span>{heldAt(view) ? <span>Stock held at {heldAt(view)}</span> : null}</div>
              </div>
              <table className="iv-paper__items">
                <thead><tr><th scope="col">#</th><th scope="col">Item</th><th scope="col" className="iv-num">Qty</th><th scope="col" className="iv-num">Unit price</th><th scope="col" className="iv-num">Amount</th></tr></thead>
                <tbody>{view.lines.map((l, i) => <tr key={l.id}><td>{i + 1}</td><td>{l.name}{l.meta ? <span className="iv-sub">{l.meta}</span> : null}</td><td className="iv-num">{l.qty}</td><td className="iv-num">{money(l.price)}</td><td className="iv-num">{money(l.price * l.qty - (l.disc || 0))}</td></tr>)}</tbody>
              </table>
              <div className="iv-paper__foot">
                <div className="iv-paper__notes">
                  <span className="iv-cap">Payments received</span>
                  {taken.length ? taken.map((x, i) => <span key={i}>{formatDate(x.at)} · {x.method} · {money(x.amount)}{x.by ? ` · received by ${x.by}` : ''}{x.extra ? ` · ${money(x.extra)} kept as advance` : ''}</span>) : <span>No payment received yet.</span>}
                  <span className="iv-cap" style={{ marginTop: 'var(--space-3)' }}>How to pay</span>
                  <span>{MERCHANT.bank}</span><span>bKash {MERCHANT.bkash}</span>
                </div>
                <dl className="iv-paper__sum">
                  <dt>Subtotal</dt><dd>{money(view.totals.gross - (view.totals.lineDisc || 0))}</dd>
                  {disc > 0 ? <><dt>Discount</dt><dd>−{money(disc)}</dd></> : null}
                  <dt>VAT</dt><dd>{money(view.totals.tax)}</dd>
                  <dt className="is-total">Total</dt><dd className="is-total">{money(view.totals.total)}</dd>
                  <dt>Paid</dt><dd>{money(paidSoFar(view))}</dd>
                  <dt className="is-due">Amount due</dt><dd className="is-due">{money(Math.max(0, view.due))}</dd>
                </dl>
              </div>
              <footer className="iv-paper__end">
                <span>Goods can be exchanged within 7 days with this invoice. This is a computer-made invoice.</span>
                <span className="iv-paper__sign">Authorised signature</span>
              </footer>
            </article>
  );
}

/** Every payment that counts on an invoice (voided ones left out): what was taken with the sale, then what came in later. */
export const paymentsOf = (inv) => activePayments(inv);
