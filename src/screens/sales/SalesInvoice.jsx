'use client';
// SalesInvoice — one order / invoice in full (opened from Sales > Invoices, ?id=<invoice no>):
// items and totals, the customer with their standing and advance credit, deliveries (each with a
// printable challan / gate pass), payment history (payments can be corrected or voided), a "receive
// payment" panel, the revisions of the invoice, and the customer's previous orders.
// Front end only: rows come from src/lib/invoices.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState } from '@/components/ui';
import { PaymentLogo } from '@/components/PaymentLogo';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getInvoices, recordPayment, saveInvoice, isPaid, paidSoFar, discountsOf, statusOf, deliveryOf, sentOf, challanNo, creditOf, CREDIT_METHOD, paymentLog, editPayment, voidPayment } from '@/lib/invoices';
import { DeliveryDialog, ChallanDialog, DELIVERY, DELIVERY_CSS } from './DeliveryDialog';
import { HoldStockDialog, HOLD_CSS, canHold } from './HoldStockDialog';
import { EMPLOYEES } from '@/lib/posStore';
import { getCustomers, findCustomer, tierOf } from '@/lib/customers';
import { getHolds } from '@/lib/stockHolds';
import { InvoicePaper, PAPER_CSS, INVOICE_STATUS as STATUS, paymentsOf } from './InvoicePaper';

const METHODS = [['Cash', 'banknote'], ['bKash', null, 'bkash'], ['Nagad', null, 'nagad'], ['Card', 'credit-card'], ['Bank', 'landmark']];
const CREDIT_TILE = [CREDIT_METHOD, 'wallet'];
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const num = (v) => Math.max(0, Number(v) || 0);
const r2 = (n) => Math.round(n * 100) / 100;

const CSS = PAPER_CSS + DELIVERY_CSS + HOLD_CSS + `
.si-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.si-back{display:grid;place-items:center;width:44px;height:44px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-body)}
.si-title{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading);font-family:var(--font-data)}
.si-head__meta{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.si-head__actions{margin-left:auto;display:flex;flex-wrap:wrap;gap:var(--space-2)}
.si-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:var(--space-5);align-items:start}
.si-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.si-card{overflow:hidden}
.si-card__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-3)}
.si-card__head h2{margin:0 auto 0 0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.si-card__body{display:flex;flex-direction:column;gap:var(--space-4);padding:0 var(--space-5) var(--space-5)}
.si-card .gc-table th,.si-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3);white-space:normal}
.si-card .gc-table th:first-child,.si-card .gc-table td:first-child{padding-left:var(--space-5)}
.si-card .gc-table th:last-child,.si-card .gc-table td:last-child{padding-right:var(--space-5)}
.si-card .gc-table td.iv-num,.si-card .gc-badge{white-space:nowrap}
.si-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.si-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary)}
.si-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-5);margin:0 0 0 auto;padding:var(--space-4) var(--space-5);width:min(100%,320px);font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.si-sum dd{margin:0;text-align:right;color:var(--text-heading)}
.si-sum .is-total{padding-top:6px;border-top:1px solid var(--border-strong);font-weight:var(--weight-semibold);color:var(--text-heading)}
.si-sum .is-due{font-weight:var(--weight-semibold);color:var(--text-danger)}
.si-who{display:flex;align-items:center;gap:var(--space-3)}
.si-avatar{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.si-facts{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.si-facts dt{color:var(--text-muted)}
.si-facts dd{margin:0;text-align:right;color:var(--text-heading);overflow-wrap:anywhere}
.si-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.si-stat{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.si-stat span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.si-stat b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.si-due{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.si-due b{font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.si-due.is-paid{background:var(--fill-success-soft);color:var(--text-success)}
.si-methods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.si-method{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:64px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.si-method.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.si-form{display:flex;flex-direction:column;gap:var(--space-3)}
.si-empty{margin:0;padding:0 var(--space-5) var(--space-5);font-size:var(--text-sm);color:var(--text-muted)}
.si-void td{color:var(--text-muted)}
.si-void .si-strike{text-decoration:line-through}
.si-acts{display:flex;justify-content:flex-end;gap:var(--space-1)}
.si-acts .gc-btn{white-space:nowrap}
.si-changes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px}
.si-credit{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs)}
.si-credit b{font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.si-extra{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.si-extra label{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.si-extra .gc-check{flex:none;margin-top:1px}
@media (max-width:1100px){.si-grid{grid-template-columns:minmax(0,1fr)}}
`;


const unit = (l) => r2((l.price * l.qty - (l.disc || 0)) / (l.qty || 1));
const orderDisc = (totals) => r2(discountsOf({ totals }) - (totals.lineDisc || 0));
/** What changed from one version of the invoice to the next: qty, price, removed lines, discount. */
function changesOf(a, b) {
  const out = [];
  a.lines.forEach((l) => {
    const m = b.lines.find((x) => x.id === l.id);
    if (!m) { out.push(`${l.name} removed (was ${l.qty} × ${money(unit(l))})`); return; }
    if (m.qty !== l.qty) out.push(`${l.name}: qty ${l.qty} → ${m.qty}`);
    if (unit(m) !== unit(l)) out.push(`${l.name}: price ${money(unit(l))} → ${money(unit(m))}`);
  });
  b.lines.filter((m) => !a.lines.some((l) => l.id === m.id)).forEach((m) => out.push(`${m.name} added (${m.qty} × ${money(unit(m))})`));
  const da = orderDisc(a.totals), db = orderDisc(b.totals);
  if (da !== db) out.push(`Discount ${money(da)} → ${money(db)}`);
  return out.length ? out : ['No change to items or prices'];
}

export default function SalesInvoice() {
  const [ready, setReady] = useState(false);
  const [all, setAll] = useState([]);
  const [id, setId] = useState('');
  const [book, setBook] = useState([]);
  const [holds, setHolds] = useState([]);
  const [credit, setCredit] = useState(0);
  const [pay, setPay] = useState({ amount: '', method: 'Cash', by: EMPLOYEES[0].name, ref: '', keep: true });
  const [paper, setPaper] = useState(false);
  const [deliver, setDeliver] = useState(false);
  const [challan, setChallan] = useState(-1);     // index of the delivery whose challan is open
  const [hold, setHold] = useState(false);
  const [fix, setFix] = useState(null);           // { key, row, amount, method, by } — correcting a payment
  const [kill, setKill] = useState(null);         // { key, row, reason, by } — voiding a payment

  const reload = () => {
    const list = getInvoices(), want = new URLSearchParams(window.location.search).get('id') || '';
    const cur = list.find((r) => r.id === want);
    setAll(list); setHolds(getHolds()); setCredit(cur ? creditOf(cur.customer.phone) : 0);
  };
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get('id') || '');
    setBook(getCustomers()); reload(); setReady(true);
  }, []);

  const inv = all.find((r) => r.id === id);
  if (!ready || !inv) {
    return (
      <div className="dc-screen ds" data-screen="SalesInvoice">
        <div className="gc-shell">
          <Sidebar sticky="" active="sales-invoices" />
          <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <Topbar crumb="Sales" page="Invoice" />
            <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px' }}>
              {ready ? <><h1 className="sr-only">Invoice not found</h1><EmptyState icon="file-x" title="This invoice was not found" body={id ? `There is no invoice ${id} in this browser.` : 'Open an invoice from the Invoices list.'} /><p style={{ textAlign: 'center' }}><Link href="/sales-invoices" className="gc-btn gc-btn--soft">Back to Invoices</Link></p></> : null}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const name = inv.customer.name || 'Walk-in customer';
  const phone = inv.customer.phone || '';
  const cust = findCustomer(book, phone);
  const tier = tierOf(cust);
  const st = statusOf(inv);
  const log = paymentLog(inv);
  const taken = paymentsOf(inv);
  const disc = r2(discountsOf(inv) - (inv.totals.lineDisc || 0));
  const heldPlaces = [...new Set(holds.filter((h) => h.ref === inv.id && h.status === 'held').map((h) => h.place))];
  const held = heldPlaces.join(', ');
  const holdable = canHold(inv, holds) && (!isPaid(inv) || inv.wholesale);
  // every other order of the same customer, newest first
  const sameCustomer = phone ? all.filter((r) => r.customer.phone === phone) : [inv];
  const history = sameCustomer.filter((r) => r.id !== inv.id);
  const lifetime = { orders: sameCustomer.length, bought: r2(sameCustomer.reduce((a, r) => a + r.totals.total, 0)), due: r2(sameCustomer.reduce((a, r) => a + Math.max(0, r.due), 0)) };
  const dv = deliveryOf(inv), sent = sentOf(inv);
  const revisions = (inv.revisions || []).map((v, i, list) => ({ ...v, next: list[i + 1] || inv })).reverse();

  // receive payment: money above the due can be kept as the customer's advance
  const method = pay.method === CREDIT_METHOD && !credit ? 'Cash' : pay.method;
  const byCredit = method === CREDIT_METHOD;
  const typed = pay.amount === '' ? (byCredit ? Math.min(credit, inv.due) : inv.due) : num(pay.amount);
  const amount = byCredit ? r2(Math.min(typed, credit, inv.due)) : r2(typed);
  const extra = byCredit ? 0 : r2(Math.max(0, amount - inv.due));
  const keep = extra > 0 && !!phone && pay.keep;
  const applied = r2(Math.min(amount, inv.due));
  const tiles = credit > 0 ? [...METHODS, CREDIT_TILE] : METHODS;

  const receive = (e) => {
    e.preventDefault();
    if (!amount) return;
    const next = recordPayment(inv, method, keep ? amount : applied, pay.by, { ref: pay.ref.trim(), keepExtra: keep });
    setPay({ ...pay, amount: '', ref: '', keep: true }); reload();
    const tail = keep ? ` · ${money(extra)} kept as ${name}’s advance` : extra ? ` · give ${money(extra)} back as change` : '';
    toast((isPaid(next) ? `${inv.id} is paid · ${money(applied)} by ${method}, received by ${pay.by}. It is now a completed sale.` : `${money(applied)} received by ${pay.by} (${method}) · ${money(next.due)} left on ${inv.id}`) + tail);
  };
  const send = () => {
    saveInvoice({ ...inv, sentAt: Date.now() }); reload();
    toast(phone ? `Invoice ${inv.id} sent to ${name} by SMS · ${phone}` : `${name} has no mobile number to send the invoice to.`, phone ? undefined : { tone: 'error' });
  };
  const saveFix = (e) => {
    e.preventDefault();
    const amt = num(fix.amount);
    if (!amt) { toast('Enter the amount that was really paid, or void the payment instead', { tone: 'error' }); return; }
    const next = editPayment(inv, fix.key, { amount: amt, method: fix.method, by: fix.by }, fix.by);
    setFix(null); reload();
    toast(`Payment corrected · ${inv.id} now has ${money(next.due)} due`);
  };
  const doVoid = async (e) => {
    e.preventDefault();
    if (!kill.reason.trim()) { toast('Write why the payment is voided', { tone: 'error' }); return; }
    const ok = await confirmDialog({ title: `Void ${money(kill.row.amount)} ${kill.row.method} payment?`, body: `It stays in the payment history, struck through, with your reason. ${inv.id} will owe ${money(r2(Math.max(0, inv.due) + kill.row.amount))}.`, confirmLabel: 'Void payment', tone: 'danger' });
    if (!ok) return;
    const next = voidPayment(inv, kill.key, kill.reason.trim(), kill.by);
    setKill(null); reload();
    toast(`Payment voided · ${inv.id} now has ${money(next.due)} due`);
  };
  const fixMax = fix ? (fix.method === CREDIT_METHOD ? r2(Math.min(fix.row.amount + Math.max(0, inv.due), (fix.row.method === CREDIT_METHOD ? fix.row.amount : 0) + credit)) : r2(fix.row.amount + Math.max(0, inv.due))) : 0;

  return (
    <div className="dc-screen ds" data-screen="SalesInvoice">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="sales-invoices" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Invoices" page={inv.id} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="si-head">
              <Link href="/sales-invoices" className="si-back" aria-label="Back to Invoices"><Icon name="arrow-left" width="18" height="18" /></Link>
              <div>
                <h1 className="si-title">{inv.id}</h1>
                <p className="si-head__meta">{formatDate(inv.at)}, {formatTime(inv.at)}{inv.rev > 1 ? ` · revision ${inv.rev}` : ''} · {inv.sentAt ? `sent to the customer ${formatDate(inv.sentAt)}` : 'not sent yet'}</p>
              </div>
              <span className={'gc-badge gc-badge--lg gc-badge--' + STATUS[st][1]}>{STATUS[st][0]}</span>
              {inv.wholesale ? <span className="gc-badge gc-badge--lg gc-badge--primary">Wholesale order</span> : null}
              {inv.wholesale ? <span className={'gc-badge gc-badge--lg gc-badge--' + DELIVERY[dv.status][1]}>{DELIVERY[dv.status][0]}</span> : null}
              <div className="si-head__actions">
                {holdable ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setHold(true)}><Icon name="lock" width="18" height="18" aria-hidden="true" /> Hold stock</button> : null}
                <Link href={'/return-exchange?ref=' + encodeURIComponent(inv.id)} className="gc-btn gc-btn--neutral"><Icon name="undo-2" width="18" height="18" aria-hidden="true" /> Return</Link>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={send}><Icon name="send" width="18" height="18" aria-hidden="true" /> Send</button>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => setPaper(true)}><Icon name="file-text" width="18" height="18" aria-hidden="true" /> View invoice</button>
              </div>
            </div>

            <div className="si-grid">
              <div className="si-col">
                <section className="gc-card si-card">
                  <div className="si-card__head"><h2>Items</h2><span className="iv-sub">{inv.totals.units} units{held ? ` · stock held at ${held}` : ''}</span></div>
                  <div className="gc-table-wrap">
                    <table className="gc-table gc-table--compact">
                      <thead><tr><th scope="col">Item</th><th scope="col" className="iv-num">Qty</th>{inv.wholesale ? <th scope="col" className="iv-num">Sent</th> : null}<th scope="col" className="iv-num">Unit price</th><th scope="col" className="iv-num">Amount</th></tr></thead>
                      <tbody>{inv.lines.map((l) => <tr key={l.id}><td className="si-strong">{l.name}{l.meta ? <span className="iv-sub">{l.meta}</span> : null}</td><td className="iv-num">{l.qty}</td>{inv.wholesale ? <td className="iv-num">{sent[l.id] || 0}</td> : null}<td className="iv-num">{money(l.price)}</td><td className="iv-num si-strong">{money(l.price * l.qty - (l.disc || 0))}</td></tr>)}</tbody>
                    </table>
                  </div>
                  <dl className="si-sum">
                    <dt>Subtotal</dt><dd>{money(inv.totals.gross - (inv.totals.lineDisc || 0))}</dd>
                    {disc > 0 ? <><dt>Discount</dt><dd>−{money(disc)}</dd></> : null}
                    <dt>VAT</dt><dd>{money(inv.totals.tax)}</dd>
                    <dt className="is-total">Total</dt><dd className="is-total">{money(inv.totals.total)}</dd>
                    <dt>Paid</dt><dd>{money(paidSoFar(inv))}</dd>
                    <dt className="is-due">Due</dt><dd className="is-due">{money(Math.max(0, inv.due))}</dd>
                  </dl>
                </section>

                {inv.wholesale ? (
                  <section className="gc-card si-card">
                    <div className="si-card__head"><h2>Delivery</h2><span className="iv-sub">{dv.sent} of {dv.total} pcs sent · {dv.left} left</span>{dv.status !== 'full' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setDeliver(true)}><Icon name="truck" width="16" height="16" aria-hidden="true" /> Deliver</button> : null}</div>
                    {(inv.deliveries || []).length === 0 ? <p className="si-empty">The customer has not taken delivery yet. Nothing has been sent.</p> : (
                      <div className="gc-table-wrap">
                        <table className="gc-table gc-table--compact">
                          <thead><tr><th scope="col">Date</th><th scope="col">What went out</th><th scope="col">From</th><th scope="col">Handed over by</th><th scope="col">Received by</th><th scope="col" className="iv-num">Pcs</th><th scope="col"><span className="sr-only">Challan</span></th></tr></thead>
                          <tbody>{inv.deliveries.map((d, i) => (
                            <tr key={i}>
                              <td>{formatDate(d.at)}<span className="iv-sub">{challanNo(inv, i)}</span></td>
                              <td>{inv.lines.filter((l) => d.lines[l.id]).map((l) => `${l.name} × ${d.lines[l.id]}`).join(', ')}{d.note ? <span className="iv-sub">{d.note}</span> : null}</td>
                              <td>{d.from || 'Not recorded'}<span className="iv-sub">{d.how}</span></td>
                              <td>{d.by}</td>
                              <td>{d.taker || '—'}</td>
                              <td className="iv-num si-strong">{Object.values(d.lines).reduce((a, n) => a + n, 0)}</td>
                              <td><div className="si-acts"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setChallan(i)} aria-label={`Print challan ${challanNo(inv, i)}`}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Challan</button></div></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                ) : null}

                <section className="gc-card si-card">
                  <div className="si-card__head"><h2>Payment history</h2><span className="iv-sub">{taken.length} payment{taken.length === 1 ? '' : 's'} · {money(paidSoFar(inv))} received{log.length > taken.length ? ` · ${log.length - taken.length} voided` : ''}</span></div>
                  {log.length === 0 ? <p className="si-empty">No payment has been received for this invoice yet.</p> : (
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact">
                        <thead><tr><th scope="col">Date</th><th scope="col">Method</th><th scope="col">Received by</th><th scope="col">Note</th><th scope="col" className="iv-num">Amount</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                        <tbody>{log.map((p) => (
                          <tr key={p.key} className={p.void ? 'si-void' : ''}>
                            <td><span className="si-strike">{formatDate(p.at)}</span><span className="iv-sub">{formatTime(p.at)}</span></td>
                            <td><span className="si-strong si-strike">{p.method}</span>{p.void ? <span className="gc-badge gc-badge--error" style={{ marginLeft: 'var(--space-2)' }}>Voided</span> : null}</td>
                            <td><span className="si-strike">{p.by || '—'}</span></td>
                            <td>
                              {p.void ? <>Voided {formatDate(p.void.at)} by {p.void.by}<span className="iv-sub">Reason: {p.void.reason}</span></> : <>{p.withSale ? 'Paid with the sale' : p.ref || '—'}</>}
                              {p.extra ? <span className="iv-sub">{money(p.extra)} more kept as advance</span> : null}
                              {p.edits && p.edits.length ? <span className="iv-sub">Corrected {formatDate(p.edits[p.edits.length - 1].at)} · was {money(p.edits[p.edits.length - 1].from.amount)} {p.edits[p.edits.length - 1].from.method}</span> : null}
                            </td>
                            <td className="iv-num si-strong"><span className="si-strike">{money(p.amount)}</span></td>
                            <td>{p.void ? null : <div className="si-acts">
                              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setFix({ key: p.key, row: p, amount: String(p.amount), method: p.method, by: p.by || EMPLOYEES[0].name })} aria-label={`Correct the ${money(p.amount)} ${p.method} payment`}>Edit</button>
                              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setKill({ key: p.key, row: p, reason: '', by: EMPLOYEES[0].name })} aria-label={`Void the ${money(p.amount)} ${p.method} payment`}>Void</button>
                            </div>}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </section>

                {revisions.length ? (
                  <section className="gc-card si-card">
                    <div className="si-card__head"><h2>Revisions</h2><span className="iv-sub">Now at revision {inv.rev || 1} · {revisions.length} change{revisions.length === 1 ? '' : 's'}</span></div>
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact">
                        <thead><tr><th scope="col">Revision</th><th scope="col">Changed</th><th scope="col">What changed</th><th scope="col" className="iv-num">Total</th></tr></thead>
                        <tbody>{revisions.map((v) => (
                          <tr key={v.rev}>
                            <td className="si-strong" style={{ whiteSpace: 'nowrap' }}>{v.rev} → {v.rev + 1}</td>
                            <td>{formatDate(v.at)}<span className="iv-sub">{formatTime(v.at)} · by {v.by}</span></td>
                            <td><ul className="si-changes">{changesOf(v, v.next).map((c) => <li key={c}>{c}</li>)}</ul></td>
                            <td className="iv-num">{money(v.totals.total)} → <span className="si-strong">{money(v.next.totals.total)}</span></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </section>
                ) : null}

                <section className="gc-card si-card">
                  <div className="si-card__head"><h2>Previous orders · {name}</h2><span className="iv-sub">{history.length} other order{history.length === 1 ? '' : 's'}</span></div>
                  {history.length === 0 ? <p className="si-empty">This is the customer’s only order so far.</p> : (
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact gc-table--hoverable">
                        <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col" className="iv-num">Total</th><th scope="col" className="iv-num">Due</th><th scope="col">Status</th></tr></thead>
                        <tbody>{history.map((r) => (
                          <tr key={r.src + r.id}>
                            <td><a href={'/sales-invoice?id=' + encodeURIComponent(r.id)} className="si-id">{r.id}</a></td>
                            <td>{formatDate(r.at)}</td>
                            <td>{r.lines[0].name}{r.lines.length > 1 ? ` + ${r.lines.length - 1} more` : ''}</td>
                            <td className="iv-num si-strong">{money(r.totals.total)}</td>
                            <td className="iv-num">{isPaid(r) ? '—' : money(r.due)}</td>
                            <td><span className={'gc-badge gc-badge--' + STATUS[statusOf(r)][1]}>{STATUS[statusOf(r)][0]}</span></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              <aside className="si-col">
                <section className="gc-card si-card">
                  <div className="si-card__head"><h2>{isPaid(inv) ? 'Payment' : 'Receive payment'}</h2></div>
                  <div className="si-card__body">
                    <div className={'si-due' + (isPaid(inv) ? ' is-paid' : '')}><span>{isPaid(inv) ? 'Paid in full' : 'Amount due'}</span><b>{money(isPaid(inv) ? inv.totals.total : inv.due)}</b></div>
                    {credit > 0 ? <div className="si-credit"><span>{name} has advance credit</span><b>{money(credit)}</b></div> : null}
                    {!isPaid(inv) ? (
                      <form className="si-form" onSubmit={receive}>
                        <div className="si-methods" role="group" aria-label="Payment method">
                          {tiles.map(([m, icon, logo]) => (
                            <button key={m} type="button" className={'si-method' + (method === m ? ' is-on' : '')} aria-pressed={method === m} onClick={() => setPay({ ...pay, method: m, amount: m === CREDIT_METHOD || method === CREDIT_METHOD ? '' : pay.amount })}>
                              {logo ? <PaymentLogo provider={logo} size={24} radius={6} decorative /> : <Icon name={icon} width="20" height="20" aria-hidden="true" />}{m === CREDIT_METHOD ? 'Credit' : m}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="gc-label" htmlFor="si-amt">{byCredit ? 'Amount to use from credit (৳)' : 'Amount received (৳)'}</label>
                          <input id="si-amt" className="gc-input" type="number" min="0" step="0.01" max={byCredit ? Math.min(credit, inv.due) : undefined} inputMode="decimal" placeholder={String(byCredit ? Math.min(credit, inv.due) : inv.due)} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                          <p className="gc-help">{byCredit ? `Uses ${money(amount)} of ${money(credit)} credit${amount < inv.due ? ` · ${money(r2(inv.due - amount))} will be left to pay` : ' · pays the invoice in full'}.` : extra > 0 ? `${money(extra)} more than the due.` : amount >= inv.due ? 'Pays the invoice in full.' : `Partly paid: ${money(r2(inv.due - amount))} will be left.`}</p>
                        </div>
                        {extra > 0 ? (
                          <div className="si-extra">
                            {phone ? <label><input type="checkbox" className="gc-check" checked={pay.keep} onChange={(e) => setPay({ ...pay, keep: e.target.checked })} /><span>Keep the extra {money(extra)} as advance / credit for this customer</span></label> : null}
                            <span className="gc-help" style={{ margin: 0 }}>{keep ? `${name} can use it on the next invoice with the Customer credit method.` : `Give ${money(extra)} back as change. Only ${money(inv.due)} is recorded.`}</span>
                          </div>
                        ) : null}
                        <div><label className="gc-label" htmlFor="si-by">Who receives the money</label><select id="si-by" className="gc-input gc-select" value={pay.by} onChange={(e) => setPay({ ...pay, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name} value={m.name}>{m.name} · {m.role}</option>)}</select></div>
                        {method !== 'Cash' && !byCredit ? <div><label className="gc-label" htmlFor="si-ref">{method === 'Bank' ? 'Deposit slip or cheque no.' : method === 'Card' ? 'Card slip no.' : 'Transaction ID'}</label><input id="si-ref" className="gc-input" placeholder="Optional" value={pay.ref} onChange={(e) => setPay({ ...pay, ref: e.target.value })} /></div> : null}
                        <button type="submit" className="gc-btn gc-btn--solid gc-btn--block" disabled={!amount}>{byCredit ? `Use ${money(amount)} of credit` : keep ? `Record ${money(amount)} · ${money(extra)} to credit` : `Record ${money(applied)} by ${method}`}</button>
                      </form>
                    ) : <p className="gc-help" style={{ margin: 0 }}>This order is a completed sale. Nothing more to collect.</p>}
                  </div>
                </section>

                <section className="gc-card si-card">
                  <div className="si-card__head"><h2>Customer</h2>{tier ? <span className="gc-badge gc-badge--primary">{tier.label.split(' · ')[0]}</span> : null}{phone ? <Link href={'/customer-statement?phone=' + encodeURIComponent(phone)} className="gc-btn gc-btn--sm gc-btn--neutral"><Icon name="scroll-text" width="16" height="16" aria-hidden="true" /> Statement</Link> : null}</div>
                  <div className="si-card__body">
                    <div className="si-who"><span className="si-avatar" aria-hidden="true">{name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span><div><span className="si-strong">{name}</span><span className="iv-sub">{phone || 'No mobile number'}</span></div></div>
                    <dl className="si-facts">
                      <dt>Address</dt><dd>{(cust && cust.address) || 'Not on file'}</dd>
                      <dt>Buys</dt><dd>{cust ? cust.types.join(', ') : 'Retail'}</dd>
                      {tier ? <><dt>Price list</dt><dd>{tier.label} · {tier.off}% below retail</dd></> : null}
                      {cust && cust.creditLimit ? <><dt>Credit limit</dt><dd>{formatBDT(cust.creditLimit)}</dd></> : null}
                      {credit > 0 ? <><dt>Advance credit</dt><dd>{money(credit)}</dd></> : null}
                    </dl>
                    <div className="si-stats">
                      <div className="si-stat"><span>Orders</span><b>{lifetime.orders}</b></div>
                      <div className="si-stat"><span>Bought</span><b>{formatBDT(lifetime.bought)}</b></div>
                      <div className="si-stat"><span>Total due</span><b>{formatBDT(lifetime.due)}</b></div>
                    </div>
                  </div>
                </section>

                <section className="gc-card si-card">
                  <div className="si-card__head"><h2>Order details</h2></div>
                  <div className="si-card__body">
                    <dl className="si-facts">
                      <dt>Sold by</dt><dd>{inv.cashier || '—'}</dd>
                      <dt>Counter</dt><dd>{inv.counter || '—'}</dd>
                      <dt>Made in</dt><dd>New sale (POS)</dd>
                      <dt>Stock</dt><dd>{held ? `Held at ${held}` : 'Not held'}</dd>
                      <dt>Revision</dt><dd>{inv.rev || 1}{inv.editedBy ? ` · last edit by ${inv.editedBy}` : ''}</dd>
                    </dl>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={paper} title={`Invoice ${inv.id}`} onClose={() => setPaper(false)} width={820}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => window.print()}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print or save PDF</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { send(); setPaper(false); }}><Icon name="send" width="18" height="18" aria-hidden="true" /> Send to customer</button></>}>
        <InvoicePaper inv={inv} customer={cust} held={held} />
      </Dialog>

      <DeliveryDialog inv={deliver ? inv : null} onClose={() => setDeliver(false)} onDone={() => { setDeliver(false); reload(); }} />
      {challan >= 0 ? <ChallanDialog inv={inv} index={challan} onClose={() => setChallan(-1)} /> : null}
      <HoldStockDialog inv={hold ? inv : null} onClose={() => setHold(false)} onDone={() => { setHold(false); reload(); }} />

      <Dialog open={!!fix} title="Correct a payment" onClose={() => setFix(null)} width={460}>
        {fix ? (
          <form className="si-form" onSubmit={saveFix}>
            <p className="gc-help" style={{ margin: 0 }}>Recorded {formatDate(fix.row.at)}: {money(fix.row.amount)} by {fix.row.method}, received by {fix.row.by || '—'}. The due changes by the difference.</p>
            <div><label className="gc-label" htmlFor="si-fix-amt">Amount (৳)</label><input id="si-fix-amt" className="gc-input" type="number" min="0" step="0.01" max={fixMax} inputMode="decimal" data-autofocus value={fix.amount} onChange={(e) => setFix({ ...fix, amount: e.target.value })} /><p className="gc-help">At most {money(fixMax)} on this invoice.</p></div>
            <div><label className="gc-label" htmlFor="si-fix-method">Method</label><select id="si-fix-method" className="gc-input gc-select" value={fix.method} onChange={(e) => setFix({ ...fix, method: e.target.value })}>{[...METHODS.map((m) => m[0]), ...(credit > 0 || fix.row.method === CREDIT_METHOD ? [CREDIT_METHOD] : [])].map((m) => <option key={m}>{m}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="si-fix-by">Received by</label><select id="si-fix-by" className="gc-input gc-select" value={fix.by} onChange={(e) => setFix({ ...fix, by: e.target.value })}>{[...new Set([fix.row.by, ...EMPLOYEES.map((m) => m.name)].filter(Boolean))].map((m) => <option key={m}>{m}</option>)}</select></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setFix(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!num(fix.amount)}>Save correction</button></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!kill} title="Void a payment" onClose={() => setKill(null)} width={460}>
        {kill ? (
          <form className="si-form" onSubmit={doVoid}>
            <p className="gc-help" style={{ margin: 0 }}>{money(kill.row.amount)} by {kill.row.method} on {formatDate(kill.row.at)}{kill.row.withSale ? ', taken with the sale' : ''}. It stays in the history, struck through, and the amount goes back on the due.{kill.row.extra ? ` The ${money(kill.row.extra)} kept as advance is taken back too.` : ''}</p>
            <div><label className="gc-label" htmlFor="si-void-why">Reason *</label><input id="si-void-why" className="gc-input" aria-required="true" data-autofocus placeholder="For example: bKash payment reversed, entered twice" value={kill.reason} onChange={(e) => setKill({ ...kill, reason: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="si-void-by">Voided by</label><select id="si-void-by" className="gc-input gc-select" value={kill.by} onChange={(e) => setKill({ ...kill, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setKill(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error" disabled={!kill.reason.trim()}>Void payment</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
