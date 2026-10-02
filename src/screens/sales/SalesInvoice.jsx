'use client';
// SalesInvoice — one order / invoice in full (opened from Sales > Invoices, ?id=<invoice no>), laid out like
// Shopify's order page (IndexKit RecordHeader + ix-record): on the left the work — items, payment (with the
// "receive payment" form), payments taken (they can be corrected or voided), deliveries (each with a printable
// challan / gate pass), the revisions of the invoice and the customer's previous orders; on the right the facts —
// the customer with their standing and advance credit, and the order details. "Edit invoice" (unpaid only) makes a
// new revision; pieces already delivered cannot be edited away.
// Front end only: rows come from src/lib/invoices.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { PaymentLogo } from '@/components/PaymentLogo';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getInvoices, recordPayment, reviseInvoice, saveInvoice, isPaid, paidSoFar, discountsOf, statusOf, deliveryOf, sentOf, challanNo, creditOf, CREDIT_METHOD, paymentLog, editPayment, voidPayment } from '@/lib/invoices';
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
const HISTORY_ROWS = 5;

const CSS = PAPER_CSS + DELIVERY_CSS + HOLD_CSS + `
.si-card .gc-table th,.si-card .gc-table td{white-space:normal}
.si-card .gc-table th:first-child,.si-card .gc-table td:first-child{padding-left:var(--space-4)}
.si-card .gc-table th:last-child,.si-card .gc-table td:last-child{padding-right:var(--space-4)}
.si-card .gc-table td.iv-num,.si-card .gc-badge{white-space:nowrap}
.si-card .ix-card__body+.gc-table-wrap,.si-card .ix-card__head+.gc-table-wrap{margin-top:var(--space-2)}
.si-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.si-id{font-family:var(--font-data)}
.si-line{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.si-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-5);margin:0;font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.si-sum dt{color:var(--text-body)}
.si-sum dd{margin:0;text-align:right;color:var(--text-heading)}
.si-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.si-sum .is-due{font-weight:var(--weight-semibold);color:var(--text-danger)}
.si-pay{display:flex;flex-direction:column;gap:var(--space-4)}
.si-form{display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-4);border-top:1px solid var(--border-subtle)}
.si-form h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.si-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.si-methods{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:var(--space-2)}
.si-method{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:56px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.si-method.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.si-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.si-void td{color:var(--text-muted)}
.si-void .si-strike{text-decoration:line-through}
.si-acts{display:flex;justify-content:flex-end;gap:var(--space-1)}
.si-acts .ix-btn{white-space:nowrap}
.si-changes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px}
.si-credit{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs)}
.si-credit b{font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.si-extra{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.si-extra label{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.si-extra .gc-check{flex:none;margin-top:1px}
.si-who{margin:0 0 var(--space-3);display:flex;flex-direction:column}
.si-dform{display:flex;flex-direction:column;gap:var(--space-4)}
.si-edit-line{display:grid;grid-template-columns:minmax(0,1fr) auto 104px auto;align-items:center;gap:var(--space-2);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.si-edit-line__name{display:flex;flex-direction:column;min-width:0}
.si-lock{font-size:var(--text-xs);color:var(--text-warning)}
.si-step{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.si-step button{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-body);cursor:pointer}
.si-step button:hover{background:var(--surface-subtle)}
.si-step button:disabled{opacity:.4;cursor:not-allowed}
.si-step b{min-width:28px;text-align:center;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.si-total{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.si-total b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
@media (max-width:599px){.si-two{grid-template-columns:1fr}.si-edit-line{grid-template-columns:minmax(0,1fr) auto}}
@media (max-width:640px){
  .si-step button{width:36px;height:36px}
  /* payment tiles: the bKash / Nagad marks fill a wider box so the wordmark is readable */
  .si-method>span:has(>img){width:56px!important;height:34px!important;margin:-6px 0 -4px;padding:0!important;border:0!important;background:none!important}
}
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
  const [edit, setEdit] = useState(null);         // { lines, discount, by } — a new revision of an unpaid invoice
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
          <main className="gc-shell__main">
            <Topbar crumb="Sales" page="Invoice" />
            <div className="gc-shell__content">
              {ready ? <div className="ix-page ix-page--narrow"><h1 className="sr-only">Invoice not found</h1><EmptyState icon="file-x" title="This invoice was not found" body={id ? `There is no invoice ${id} in this browser.` : 'Open an invoice from the Invoices list.'} /><p style={{ textAlign: 'center', margin: 0 }}><Link href="/sales-invoices" className="ix-btn">Back to Invoices</Link></p></div> : null}
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
  /** Send the invoice (or a new revision of it) to the customer by SMS. */
  const send = (target = inv, again = false) => {
    saveInvoice({ ...target, sentAt: Date.now() }); reload();
    toast(phone ? `Invoice ${target.id}${target.rev > 1 ? ' (revision ' + target.rev + ')' : ''} sent ${again ? 'again ' : ''}to ${name} by SMS · ${phone}` : `${name} has no mobile number to send the invoice to.`, phone ? undefined : { tone: 'error' });
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

  // edit and send again: a new revision; pieces already delivered set the lowest a line can go
  const openEdit = () => setEdit({ by: EMPLOYEES[0].name, lines: inv.lines.map((l) => ({ ...l, price: Math.round((l.price * l.qty - (l.disc || 0)) / l.qty * 100) / 100 })), discount: String(Math.round((discountsOf(inv) - (inv.totals.lineDisc || 0)) * 100) / 100 || '') });
  const draft = edit ? (() => {
    const gross = edit.lines.reduce((a, l) => a + l.price * l.qty, 0);
    const d = Math.min(gross, num(edit.discount));
    const rate = inv.totals.taxable ? inv.totals.tax / inv.totals.taxable : 0;
    const total = Math.round((gross - d) * (1 + rate) * 100) / 100;
    const paid = paidSoFar(inv);
    return { gross, disc: d, tax: Math.round((gross - d) * rate * 100) / 100, total, due: Math.max(0, Math.round((total - paid) * 100) / 100), over: Math.max(0, Math.round((paid - total) * 100) / 100) };
  })() : null;
  const minQty = (l) => Math.max(1, sent[l.id] || 0);
  const setLine = (lid, patch) => setEdit((cur) => ({ ...cur, lines: cur.lines.flatMap((l) => (l.id !== lid ? [l] : patch === null ? [] : [{ ...l, ...patch }])) }));
  const saveEdit = (andSend) => {
    if (!edit.lines.length) { toast('An invoice needs at least one item', { tone: 'error' }); return; }
    const low = inv.lines.find((l) => (sent[l.id] || 0) > ((edit.lines.find((x) => x.id === l.id) || {}).qty || 0));
    if (low) { toast(`${sent[low.id]} pcs of ${low.name} were already sent. The quantity cannot go below that.`, { tone: 'error' }); return; }
    const next = reviseInvoice(inv, edit.lines, num(edit.discount), edit.by);
    if (draft.over && phone) toast(`${money(draft.over)} paid above the new total is kept as ${name}’s advance credit`, { tone: 'info' });
    setEdit(null);
    if (andSend) send(next, true); else { reload(); toast(`${next.id} saved as revision ${next.rev}. The customer has not been sent the change yet.`); }
  };

  const shownHistory = history.slice(0, HISTORY_ROWS);
  const meta = `${formatDate(inv.at)}, ${formatTime(inv.at)}${inv.wholesale ? ' · Wholesale order' : ''}${inv.rev > 1 ? ` · revision ${inv.rev}` : ''} · ${inv.sentAt ? `sent ${formatDate(inv.sentAt)}` : 'not sent yet'}`;

  return (
    <div className="dc-screen ds" data-screen="SalesInvoice">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="sales-invoices" />
        <main className="gc-shell__main">
          <Topbar crumb="Invoices" page={inv.id} />
          <div className="gc-shell__content">
            <div className="ix-page">
              <RecordHeader back="/sales-invoices" backLabel="Back to Invoices" title={inv.id} meta={meta}
                badges={<>
                  <StatusBadge tone={STATUS[st][1]}>{STATUS[st][0]}</StatusBadge>
                  {inv.wholesale ? <StatusBadge tone={DELIVERY[dv.status][1]} icon="truck">{DELIVERY[dv.status][0]}</StatusBadge> : null}
                </>}
                secondary={[{ label: 'Send', onClick: () => send(inv, !!inv.sentAt) }, { label: 'Return', href: '/return-exchange?ref=' + encodeURIComponent(inv.id) }]}
                more={[
                  !isPaid(inv) ? { label: 'Edit invoice', onClick: openEdit } : null,
                  holdable ? { label: 'Hold stock', onClick: () => setHold(true) } : null,
                  phone ? { label: 'Customer statement', href: '/customer-statement?phone=' + encodeURIComponent(phone) } : null,
                ].filter(Boolean)}
                primary={{ label: 'View invoice', onClick: () => setPaper(true) }} />

              <div className="ix-record">
                <div className="ix-main">
                  <section className="ix-card si-card" aria-labelledby="si-items">
                    <header className="ix-card__head"><h2 id="si-items">Items</h2></header>
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact">
                        <thead><tr><th scope="col">Item</th><th scope="col" className="iv-num">Qty</th>{inv.wholesale ? <th scope="col" className="iv-num">Sent</th> : null}<th scope="col" className="iv-num">Unit price</th><th scope="col" className="iv-num">Amount</th></tr></thead>
                        <tbody>{inv.lines.map((l) => <tr key={l.id}><td className="si-strong">{l.name}{l.meta ? <span className="iv-sub">{l.meta}</span> : null}</td><td className="iv-num">{l.qty}</td>{inv.wholesale ? <td className="iv-num">{sent[l.id] || 0}</td> : null}<td className="iv-num">{money(l.price)}</td><td className="iv-num si-strong">{money(l.price * l.qty - (l.disc || 0))}</td></tr>)}</tbody>
                      </table>
                    </div>
                  </section>

                  <section className="ix-card si-card" aria-labelledby="si-pay">
                    <header className="ix-card__head"><h2 id="si-pay">Payment</h2></header>
                    <div className="ix-card__body si-pay">
                      <dl className="si-sum">
                        <dt>Subtotal</dt><dd>{money(inv.totals.gross - (inv.totals.lineDisc || 0))}</dd>
                        {disc > 0 ? <><dt>Discount</dt><dd>−{money(disc)}</dd></> : null}
                        <dt>VAT</dt><dd>{money(inv.totals.tax)}</dd>
                        <dt className="is-total">Total</dt><dd className="is-total">{money(inv.totals.total)}</dd>
                        <dt>Paid</dt><dd>{money(paidSoFar(inv))}</dd>
                        <dt className={isPaid(inv) ? '' : 'is-due'}>Due</dt><dd className={isPaid(inv) ? '' : 'is-due'}>{money(Math.max(0, inv.due))}</dd>
                      </dl>
                      {credit > 0 ? <div className="si-credit"><span>{name} has advance credit</span><b>{money(credit)}</b></div> : null}
                      {!isPaid(inv) ? (
                        <form className="si-form" onSubmit={receive}>
                          <h3>Receive payment</h3>
                          <div className="si-methods" role="group" aria-label="Payment method">
                            {tiles.map(([m, icon, logo]) => (
                              <button key={m} type="button" className={'si-method' + (method === m ? ' is-on' : '')} aria-pressed={method === m} onClick={() => setPay({ ...pay, method: m, amount: m === CREDIT_METHOD || method === CREDIT_METHOD ? '' : pay.amount })}>
                                {logo ? <PaymentLogo provider={logo} size={20} radius={6} decorative /> : <Icon name={icon} width="16" height="16" aria-hidden="true" />}{m === CREDIT_METHOD ? 'Credit' : m}
                              </button>
                            ))}
                          </div>
                          <div className="si-two">
                            <div>
                              <label className="gc-label" htmlFor="si-amt">{byCredit ? 'Amount to use from credit (৳)' : 'Amount received (৳)'}</label>
                              <input id="si-amt" className="gc-input" type="number" min="0" step="0.01" max={byCredit ? Math.min(credit, inv.due) : undefined} inputMode="decimal" placeholder={String(byCredit ? Math.min(credit, inv.due) : inv.due)} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                              <p className="gc-help">{byCredit ? `Uses ${money(amount)} of ${money(credit)} credit${amount < inv.due ? ` · ${money(r2(inv.due - amount))} will be left to pay` : ' · pays the invoice in full'}.` : extra > 0 ? `${money(extra)} more than the due.` : amount >= inv.due ? 'Pays the invoice in full.' : `Partly paid: ${money(r2(inv.due - amount))} will be left.`}</p>
                            </div>
                            <div><label className="gc-label" htmlFor="si-by">Who receives the money</label><select id="si-by" className="gc-input gc-select" value={pay.by} onChange={(e) => setPay({ ...pay, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name} value={m.name}>{m.name} · {m.role}</option>)}</select></div>
                          </div>
                          {extra > 0 ? (
                            <div className="si-extra">
                              {phone ? <label><input type="checkbox" className="gc-check" checked={pay.keep} onChange={(e) => setPay({ ...pay, keep: e.target.checked })} /><span>Keep the extra {money(extra)} as advance / credit for this customer</span></label> : null}
                              <span className="gc-help" style={{ margin: 0 }}>{keep ? `${name} can use it on the next invoice with the Customer credit method.` : `Give ${money(extra)} back as change. Only ${money(inv.due)} is recorded.`}</span>
                            </div>
                          ) : null}
                          {method !== 'Cash' && !byCredit ? <div><label className="gc-label" htmlFor="si-ref">{method === 'Bank' ? 'Deposit slip or cheque no.' : method === 'Card' ? 'Card slip no.' : 'Transaction ID'}</label><input id="si-ref" className="gc-input" placeholder="Optional" value={pay.ref} onChange={(e) => setPay({ ...pay, ref: e.target.value })} /></div> : null}
                          <div><button type="submit" className="gc-btn gc-btn--solid" disabled={!amount}>{byCredit ? `Use ${money(amount)} of credit` : keep ? `Record ${money(amount)} · ${money(extra)} to credit` : `Record ${money(applied)} by ${method}`}</button></div>
                        </form>
                      ) : <p className="si-empty">This order is a completed sale. Nothing more to collect.</p>}
                    </div>
                  </section>

                  {log.length ? (
                    <section className="ix-card si-card" aria-labelledby="si-log">
                      <header className="ix-card__head"><h2 id="si-log">Payment history</h2></header>
                      <div className="ix-card__body" style={{ paddingBottom: 0 }}><p className="si-line">{taken.length} payment{taken.length === 1 ? '' : 's'} · {money(paidSoFar(inv))} received{log.length > taken.length ? ` · ${log.length - taken.length} voided` : ''}</p></div>
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
                                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setFix({ key: p.key, row: p, amount: String(p.amount), method: p.method, by: p.by || EMPLOYEES[0].name })} aria-label={`Correct the ${money(p.amount)} ${p.method} payment`}>Edit</button>
                                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setKill({ key: p.key, row: p, reason: '', by: EMPLOYEES[0].name })} aria-label={`Void the ${money(p.amount)} ${p.method} payment`}>Void</button>
                              </div>}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </section>
                  ) : null}

                  {inv.wholesale ? (
                    <section className="ix-card si-card" aria-labelledby="si-delivery">
                      <header className="ix-card__head"><h2 id="si-delivery">Delivery</h2>{dv.status !== 'full' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => setDeliver(true)}><Icon name="truck" width="16" height="16" aria-hidden="true" />Deliver</button> : null}</header>
                      <div className="ix-card__body" style={(inv.deliveries || []).length ? { paddingBottom: 0 } : undefined}>
                        <p className="si-line">{(inv.deliveries || []).length ? `${dv.sent} of ${dv.total} pcs sent · ${dv.left} left` : 'The customer has not taken delivery yet. Nothing has been sent.'}</p>
                      </div>
                      {(inv.deliveries || []).length ? (
                        <div className="gc-table-wrap">
                          <table className="gc-table gc-table--compact">
                            <thead><tr><th scope="col">Date</th><th scope="col">What went out</th><th scope="col">From</th><th scope="col" className="iv-num">Pcs</th><th scope="col"><span className="sr-only">Challan</span></th></tr></thead>
                            <tbody>{inv.deliveries.map((d, i) => (
                              <tr key={i}>
                                <td>{formatDate(d.at)}<span className="iv-sub">{challanNo(inv, i)}</span></td>
                                <td>{inv.lines.filter((l) => d.lines[l.id]).map((l) => `${l.name} × ${d.lines[l.id]}`).join(', ')}{d.note ? <span className="iv-sub">{d.note}</span> : null}</td>
                                <td>{d.from || 'Not recorded'}<span className="iv-sub">{d.how}</span></td>
                                <td className="iv-num si-strong">{Object.values(d.lines).reduce((a, n) => a + n, 0)}</td>
                                <td><div className="si-acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setChallan(i)} aria-label={`Print challan ${challanNo(inv, i)}`}><Icon name="printer" width="16" height="16" aria-hidden="true" />Challan</button></div></td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {revisions.length ? (
                    <section className="ix-card si-card" aria-labelledby="si-revs">
                      <header className="ix-card__head"><h2 id="si-revs">Revisions</h2></header>
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

                  {history.length ? (
                    <section className="ix-card si-card" aria-labelledby="si-prev">
                      <header className="ix-card__head"><h2 id="si-prev">Previous orders</h2>{phone && history.length > HISTORY_ROWS ? <Link href={'/customer-statement?phone=' + encodeURIComponent(phone)}>View all</Link> : null}</header>
                      <div className="gc-table-wrap">
                        <table className="gc-table gc-table--compact">
                          <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col" className="iv-num">Total</th><th scope="col">Status</th></tr></thead>
                          <tbody>{shownHistory.map((r) => (
                            <tr key={r.src + r.id}>
                              <td><a href={'/sales-invoice?id=' + encodeURIComponent(r.id)} className="si-id">{r.id}</a></td>
                              <td>{formatDate(r.at)}</td>
                              <td>{r.lines[0].name}{r.lines.length > 1 ? ` + ${r.lines.length - 1} more` : ''}</td>
                              <td className="iv-num si-strong">{money(r.totals.total)}{isPaid(r) ? null : <span className="iv-sub">{money(r.due)} due</span>}</td>
                              <td><StatusBadge tone={STATUS[statusOf(r)][1]}>{STATUS[statusOf(r)][0]}</StatusBadge></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </section>
                  ) : null}
                </div>

                <aside className="ix-side">
                  <section className="ix-card" aria-labelledby="si-cust">
                    <header className="ix-card__head"><h2 id="si-cust">Customer</h2>{phone ? <Link href={'/customer-statement?phone=' + encodeURIComponent(phone)}>Statement</Link> : null}</header>
                    <div className="ix-card__body">
                      <p className="si-who"><span className="si-strong">{name}</span><span className="iv-sub">{phone || 'No mobile number'}</span></p>
                      <KV rows={[
                        ['Address', (cust && cust.address) || 'Not on file'],
                        ['Buys', cust ? cust.types.join(', ') : 'Retail'],
                        tier ? ['Price list', `${tier.label} · ${tier.off}% below retail`] : null,
                        cust && cust.creditLimit ? ['Credit limit', formatBDT(cust.creditLimit)] : null,
                        credit > 0 ? ['Advance credit', money(credit)] : null,
                        ['Orders', String(lifetime.orders)],
                        ['Bought', formatBDT(lifetime.bought)],
                        ['Total due', formatBDT(lifetime.due)],
                      ]} />
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="si-details">
                    <header className="ix-card__head"><h2 id="si-details">Order details</h2></header>
                    <div className="ix-card__body">
                      <KV rows={[
                        ['Sold by', inv.cashier || '—'],
                        ['Counter', inv.counter || '—'],
                        ['Made in', 'New sale (POS)'],
                        ['Stock', held ? `Held at ${held}` : 'Not held'],
                        ['Revision', `${inv.rev || 1}${inv.editedBy ? ` · last edit by ${inv.editedBy}` : ''}`],
                      ]} />
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={paper} title={`Invoice ${inv.id}`} onClose={() => setPaper(false)} width={820}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => window.print()}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print or save PDF</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { send(inv, !!inv.sentAt); setPaper(false); }}><Icon name="send" width="16" height="16" aria-hidden="true" /> Send to customer</button></>}>
        <InvoicePaper inv={inv} customer={cust} held={held} />
      </Dialog>

      <DeliveryDialog inv={deliver ? inv : null} onClose={() => setDeliver(false)} onDone={() => { setDeliver(false); reload(); }} />
      {challan >= 0 ? <ChallanDialog inv={inv} index={challan} onClose={() => setChallan(-1)} /> : null}
      <HoldStockDialog inv={hold ? inv : null} onClose={() => setHold(false)} onDone={() => { setHold(false); reload(); }} />

      {/* edit and send again: a new revision of an unpaid invoice */}
      <Dialog open={!!edit} title={`Edit invoice · ${inv.id}`} onClose={() => setEdit(null)} width={620}>
        {edit ? (
          <div className="si-dform">
            <span className="iv-sub">{name} · revision {inv.rev || 1} now · saving makes revision {(inv.rev || 1) + 1}</span>
            <div>
              {edit.lines.map((l) => {
                const s = sent[l.id] || 0;
                return (
                  <div key={l.id} className="si-edit-line">
                    <span className="si-edit-line__name"><span className="si-strong">{l.name}</span>{s ? <span className="si-lock">{s} pcs sent — can’t go below {s}</span> : null}</span>
                    <span className="si-step">
                      <button type="button" aria-label={`Fewer ${l.name}`} disabled={l.qty <= minQty(l)} onClick={() => setLine(l.id, { qty: Math.max(minQty(l), l.qty - 1) })}><Icon name="minus" width="16" height="16" /></button>
                      <b aria-label={`Quantity ${l.qty}`}>{l.qty}</b>
                      <button type="button" aria-label={`More ${l.name}`} onClick={() => setLine(l.id, { qty: l.qty + 1 })}><Icon name="plus" width="16" height="16" /></button>
                    </span>
                    <input className="gc-input iv-num" type="number" min="0" step="0.01" inputMode="decimal" aria-label={`Unit price of ${l.name}`} value={l.price} onChange={(e) => setLine(l.id, { price: num(e.target.value) })} />
                    <button type="button" className="gc-iconbtn" aria-label={s ? `${l.name} cannot be removed: ${s} pcs already sent` : `Remove ${l.name}`} title={s ? `${s} pcs already sent` : 'Remove'} disabled={s > 0} onClick={() => setLine(l.id, null)}><Icon name={s ? 'lock' : 'trash-2'} width="16" height="16" /></button>
                  </div>
                );
              })}
              {edit.lines.length === 0 ? <p className="gc-help">All items were removed. Add at least one back, or cancel.</p> : null}
            </div>
            <div className="si-two">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div><label className="gc-label" htmlFor="si-disc">Discount (৳)</label><input id="si-disc" className="gc-input" type="number" min="0" inputMode="decimal" placeholder="0" value={edit.discount} onChange={(e) => setEdit({ ...edit, discount: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="si-editor">Edited by</label><select id="si-editor" className="gc-input gc-select" value={edit.by} onChange={(e) => setEdit({ ...edit, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
              </div>
              <dl className="si-sum">
                <dt>Items</dt><dd>{money(draft.gross)}</dd>
                {draft.disc ? <><dt>Discount</dt><dd>−{money(draft.disc)}</dd></> : null}
                <dt>VAT</dt><dd>{money(draft.tax)}</dd>
                {paidSoFar(inv) ? <><dt>Already paid</dt><dd>−{money(paidSoFar(inv))}</dd></> : null}
              </dl>
            </div>
            <div className="si-total"><span>New total {money(draft.total)} · unpaid</span><b>{money(draft.due)}</b></div>
            {draft.over ? <p className="gc-help" style={{ margin: 0 }}>{phone ? `${money(draft.over)} already paid is above the new total. It is kept as ${name}’s advance credit.` : `${money(draft.over)} already paid is above the new total. Give it back to the customer.`}</p> : null}
            <p className="gc-help" style={{ margin: 0 }}>The current version is kept in the invoice’s revision history.</p>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setEdit(null)}>Cancel</button>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => saveEdit(false)}>Save</button>
              <button type="button" className="gc-btn gc-btn--solid" onClick={() => saveEdit(true)}><Icon name="send" width="16" height="16" aria-hidden="true" /> Save and send again</button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog open={!!fix} title="Correct a payment" onClose={() => setFix(null)} width={460}>
        {fix ? (
          <form className="si-dform" onSubmit={saveFix}>
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
          <form className="si-dform" onSubmit={doVoid}>
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
