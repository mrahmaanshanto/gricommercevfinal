'use client';
// Invoices — one simple list. An invoice is a sale from New sale made out to a customer; it is only
// ever Unpaid or Paid. Record the payment and it becomes Paid (a completed sale and order).
// An unpaid invoice can be edited and sent to the customer again as a new revision (the old version is
// kept; pieces already delivered cannot be edited away). Money above the due can be kept as the
// customer's advance credit, and that credit can pay a later invoice.
// Front end only: the rows come from src/lib/invoices.js (POS sales plus demo invoices).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getInvoices, recordPayment, reviseInvoice, saveInvoice, isPaid, paidSoFar, discountsOf, statusOf, sentOf, creditOf, CREDIT_METHOD } from '@/lib/invoices';
import { EMPLOYEES } from '@/lib/posStore';
import { getHolds } from '@/lib/stockHolds';
import { HoldStockDialog, HOLD_CSS, canHold } from './HoldStockDialog';

const METHODS = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank'];
const TABS = [['all', 'Invoices'], ['paid', 'Paid'], ['partial', 'Partially paid'], ['unpaid', 'Unpaid']];
const STATUS = { paid: ['Paid', 'success'], partial: ['Partially paid', 'info'], unpaid: ['Unpaid', 'warning'] };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const num = (v) => Math.max(0, Number(v) || 0);

const CSS = HOLD_CSS + `
.iv-card{overflow:hidden}
.iv-card .gc-table th,.iv-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2)}
.iv-card .gc-table th:last-child,.iv-card .gc-table td:last-child{padding-right:var(--space-4)}
.iv-card td:nth-child(6) .iv-sub{min-width:150px}
.iv-card .gc-table th:first-child,.iv-card .gc-table td:first-child{padding-left:var(--space-5)}
.iv-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.iv-tab{display:inline-flex;align-items:center;gap:8px}
.iv-tab b{font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.iv-search{position:relative;flex:0 1 300px;margin-bottom:var(--space-2)}
.iv-search svg{position:absolute;left:12px;top:13px;color:var(--text-muted);pointer-events:none}
.iv-search input{padding-left:38px}
.iv-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.iv-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.iv-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary)}
.iv-num{text-align:right;font-variant-numeric:tabular-nums}
.iv-due{color:var(--text-danger);font-weight:var(--weight-semibold)}
.iv-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
.iv-actions .gc-btn--neutral{width:36px;padding:0}
.iv-card .gc-table td{white-space:normal}
.iv-card .gc-table td.iv-num,.iv-card .gc-table .gc-btn,.iv-card .gc-table .gc-badge,.iv-id{white-space:nowrap}
.iv-form{display:flex;flex-direction:column;gap:var(--space-4)}
.iv-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.iv-rows{margin:0;padding:0;list-style:none}
.iv-rows li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.iv-rows li>span:first-child{flex:1;min-width:0}
.iv-rows li b{font-weight:var(--weight-medium);color:var(--text-heading)}
.iv-total{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.iv-total b{font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.iv-total.is-paid{background:var(--fill-success-soft);color:var(--text-success)}
.iv-line{display:grid;grid-template-columns:minmax(0,1fr) auto 110px auto;align-items:center;gap:var(--space-2);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.iv-step{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.iv-step button{display:grid;place-items:center;width:32px;height:36px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-body);cursor:pointer}
.iv-step button:hover{background:var(--surface-subtle)}
.iv-step b{min-width:28px;text-align:center;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.iv-line__name{display:flex;flex-direction:column;min-width:0}
.iv-lock{font-size:var(--text-xs);color:var(--text-warning)}
.iv-step button:disabled{opacity:.4;cursor:not-allowed}
.iv-extra{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.iv-extra label{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.iv-extra .gc-check{flex:none;margin-top:1px}
.iv-cap{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
@media (max-width:599px){.iv-two{grid-template-columns:1fr}.iv-line{grid-template-columns:minmax(0,1fr) auto}}
`;

export default function SalesInvoices() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [pay, setPay] = useState(null);     // { inv, amount, method, by, keep, credit }
  const [edit, setEdit] = useState(null);   // { inv, lines, discount, by }
  const [hold, setHold] = useState(null);   // the invoice whose stock is being held
  const [holds, setHolds] = useState([]);


  const reload = () => { setRows(getInvoices()); setHolds(getHolds()); };
  useEffect(() => {
    reload();
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
  }, []);

  const by = (st) => rows.filter((r) => statusOf(r) === st);
  const unpaid = by('unpaid'), partial = by('partial'), paid = by('paid');
  const counts = { unpaid: unpaid.length, partial: partial.length, paid: paid.length, all: rows.length };
  const heldAt = (r) => [...new Set(holds.filter((x) => x.ref === r.id && x.status === 'held').map((x) => x.place))].join(', ');
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (tab === 'all' ? rows : by(tab)).filter((r) => !text || (r.id + ' ' + (r.customer.name || '') + ' ' + (r.customer.phone || '')).toLowerCase().includes(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tab, q]);
  const sum = (list, f) => list.reduce((a, r) => a + f(r), 0);
  const who = (r) => r.customer.name || 'Walk-in customer';
  const send = (r, again) => {
    saveInvoice({ ...r, sentAt: Date.now() }); reload();
    toast(r.customer.phone ? `Invoice ${r.id}${r.rev > 1 ? ' (revision ' + r.rev + ')' : ''} sent ${again ? 'again ' : ''}to ${who(r)} by SMS · ${r.customer.phone}` : `Invoice ${r.id} is ready to print. ${who(r)} has no mobile number to send it to.`);
  };

  // take payment: money above the due can be kept as the customer's advance; credit can pay the due
  const r2 = (n) => Math.round(n * 100) / 100;
  const payCalc = pay ? (() => {
    const byCredit = pay.method === CREDIT_METHOD;
    const typed = num(pay.amount);
    const amount = byCredit ? r2(Math.min(typed, pay.credit, pay.inv.due)) : r2(typed);
    const applied = r2(Math.min(amount, pay.inv.due));
    const extra = byCredit ? 0 : r2(Math.max(0, amount - pay.inv.due));
    return { byCredit, amount, applied, extra, keep: extra > 0 && !!pay.inv.customer.phone && pay.keep };
  })() : null;
  const openPay = (r) => setPay({ inv: r, amount: String(r.due), method: 'Cash', by: EMPLOYEES[0].name, keep: true, credit: creditOf(r.customer.phone) });
  const takePayment = (e) => {
    e.preventDefault();
    const { amount, applied, extra, keep } = payCalc;
    if (!amount) return;
    const next = recordPayment(pay.inv, pay.method, keep ? amount : applied, pay.by, { keepExtra: keep });
    setPay(null); reload();
    const tail = keep ? ` · ${money(extra)} kept as ${who(pay.inv)}’s advance` : extra ? ` · give ${money(extra)} back as change` : '';
    toast((isPaid(next) ? `${pay.inv.id} is paid · ${money(applied)} by ${pay.method}, received by ${pay.by}. It is now a completed sale.` : `${money(applied)} received by ${pay.by} (${pay.method}) · ${pay.inv.id} is partially paid, ${money(next.due)} left`) + tail);
  };

  const draft = edit ? (() => {
    const gross = edit.lines.reduce((a, l) => a + l.price * l.qty, 0);
    const disc = Math.min(gross, num(edit.discount));
    const rate = edit.inv.totals.taxable ? edit.inv.totals.tax / edit.inv.totals.taxable : 0;
    const total = Math.round((gross - disc) * (1 + rate) * 100) / 100;
    const paid = paidSoFar(edit.inv);
    return { gross, disc, tax: Math.round((gross - disc) * rate * 100) / 100, total, due: Math.max(0, Math.round((total - paid) * 100) / 100), over: Math.max(0, Math.round((paid - total) * 100) / 100) };
  })() : null;
  // pieces already delivered set the lowest a line can go, and such a line cannot be removed
  const sentNow = edit ? sentOf(edit.inv) : {};
  const minQty = (l) => Math.max(1, sentNow[l.id] || 0);
  const setLine = (id, patch) => setEdit((cur) => ({ ...cur, lines: cur.lines.flatMap((l) => (l.id !== id ? [l] : patch === null ? [] : [{ ...l, ...patch }])) }));
  const saveEdit = (andSend) => {
    if (!edit.lines.length) { toast('An invoice needs at least one item', { tone: 'error' }); return; }
    const low = edit.inv.lines.find((l) => (sentNow[l.id] || 0) > ((edit.lines.find((x) => x.id === l.id) || {}).qty || 0));
    if (low) { toast(`${sentNow[low.id]} pcs of ${low.name} were already sent. The quantity cannot go below that.`, { tone: 'error' }); return; }
    const next = reviseInvoice(edit.inv, edit.lines, num(edit.discount), edit.by);
    if (draft.over && edit.inv.customer.phone) toast(`${money(draft.over)} paid above the new total is kept as ${who(edit.inv)}’s advance credit`, { tone: 'info' });
    setEdit(null);
    if (andSend) send(next, true); else { reload(); toast(`${next.id} saved as revision ${next.rev}. The customer has not been sent the change yet.`); }
  };

  return (
    <div className="dc-screen ds" data-screen="SalesInvoices">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="sales-invoices" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Sales" page="Invoices" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Invoices"
              description="Every sale made out to a customer: paid, partially paid or unpaid."
              actions={<Link href="/pos" className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> New sale</Link>}
            />

            <div className="gc-kpis">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="files" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Invoices</p><p className="gc-kpi__value">{counts.all}<small>{money(sum(rows, (r) => r.totals.total))}</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="file-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Paid</p><p className="gc-kpi__value">{counts.paid}<small>{money(sum(paid, (r) => r.totals.total))}</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="file-clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Partially paid</p><p className="gc-kpi__value">{counts.partial}<small>{money(sum(partial, (r) => r.due))} left</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="file-x" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Unpaid</p><p className="gc-kpi__value">{counts.unpaid}<small>{money(sum(unpaid, (r) => r.due))}</small></p></div></div>
            </div>

            <section className="gc-card iv-card">
              <div className="iv-bar">
                <div className="gc-tabs" role="tablist" aria-label="Invoices by payment" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
                  {TABS.map(([id, label]) => (
                    <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab iv-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{label} <b>{counts[id]}</b></button>
                  ))}
                </div>
                <label className="iv-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" type="search" placeholder="Search customer or invoice no." aria-label="Search customer or invoice number" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              </div>
              {shown.length === 0 ? (
                <EmptyState icon="file-text" title={q ? 'No invoice matches that search' : tab === 'all' ? 'No invoice yet' : `No ${STATUS[tab][0].toLowerCase()} invoice`} body={q ? 'Try the customer’s name, mobile number or the invoice number.' : tab === 'all' ? 'Invoices appear here when a sale is made out to a customer.' : 'Nothing is in this group right now.'} />
              ) : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col">Date</th><th scope="col" className="iv-num">Total</th><th scope="col" className="iv-num">Due</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.src + r.id}>
                          <td><Link href={'/sales-invoice?id=' + encodeURIComponent(r.id)} className="iv-id" aria-label={`Open invoice ${r.id}`}>{r.id}</Link>{r.rev > 1 ? <span className="iv-sub">Revision {r.rev}</span> : null}</td>
                          <td><span className="iv-strong">{who(r)}</span><span className="iv-sub">{r.customer.phone || 'No mobile number'}{r.wholesale ? ' · Wholesale' : ''}</span></td>
                          <td>{formatDate(r.at)}<span className="iv-sub">{r.lines.reduce((a, l) => a + l.qty, 0) === 1 ? '1 item' : r.lines.reduce((a, l) => a + l.qty, 0) + ' items'}</span></td>
                          <td className="iv-num iv-strong">{money(r.totals.total)}</td>
                          <td className={'iv-num' + (isPaid(r) ? '' : ' iv-due')}>{isPaid(r) ? '—' : money(r.due)}</td>
                          <td><span className={'gc-badge gc-badge--' + STATUS[statusOf(r)][1]}>{STATUS[statusOf(r)][0]}</span>{heldAt(r) ? <span className="iv-sub">Stock held · {heldAt(r)}</span> : null}</td>
                          <td><div className="iv-actions">
                            {!isPaid(r) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => openPay(r)}>Take payment</button> : null}
                            {!isPaid(r) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEdit({ inv: r, by: EMPLOYEES[0].name, lines: r.lines.map((l) => ({ ...l, price: Math.round((l.price * l.qty - (l.disc || 0)) / l.qty * 100) / 100 })), discount: String(Math.round((discountsOf(r) - (r.totals.lineDisc || 0)) * 100) / 100 || '') })} aria-label={`Edit invoice ${r.id}`} title="Edit"><Icon name="pencil" width="16" height="16" /></button> : null}
                            {(!isPaid(r) || r.wholesale) && canHold(r, holds) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setHold(r)} aria-label={`Hold stock for invoice ${r.id}`} title="Hold stock"><Icon name="lock" width="16" height="16" /></button> : null}
                            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => send(r, !!r.sentAt)} aria-label={`Send invoice ${r.id} to the customer`} title="Send to customer"><Icon name="send" width="16" height="16" /></button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* record a payment */}
      <Dialog open={!!pay} title={pay ? `Take payment · ${pay.inv.id}` : 'Take payment'} onClose={() => setPay(null)} width={440}>
        {pay ? (
          <form className="iv-form" onSubmit={takePayment}>
            <div className="iv-total"><span>{who(pay.inv)} owes</span><b>{money(pay.inv.due)}</b></div>
            <div className="iv-two">
              <div><label className="gc-label" htmlFor="iv-amt">{payCalc.byCredit ? 'Amount from credit (৳) *' : 'Amount received (৳) *'}</label><input id="iv-amt" className="gc-input" type="number" min="0" step="0.01" max={payCalc.byCredit ? Math.min(pay.credit, pay.inv.due) : undefined} inputMode="decimal" aria-required="true" data-autofocus value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="iv-method">Method</label><select id="iv-method" className="gc-input gc-select" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value, amount: e.target.value === CREDIT_METHOD ? String(Math.min(pay.credit, pay.inv.due)) : pay.method === CREDIT_METHOD ? String(pay.inv.due) : pay.amount })}>{[...METHODS, ...(pay.credit > 0 ? [CREDIT_METHOD] : [])].map((m) => <option key={m} value={m}>{m === CREDIT_METHOD ? `${m} · ${money(pay.credit)}` : m}</option>)}</select></div>
            </div>
            {payCalc.extra > 0 ? (
              <div className="iv-extra">
                {pay.inv.customer.phone ? <label><input type="checkbox" className="gc-check" checked={pay.keep} onChange={(e) => setPay({ ...pay, keep: e.target.checked })} /><span>Keep the extra {money(payCalc.extra)} as advance / credit for this customer</span></label> : null}
                <span className="gc-help" style={{ margin: 0 }}>{payCalc.keep ? `${who(pay.inv)} can use it on the next invoice with the Customer credit method.` : `Give ${money(payCalc.extra)} back as change. Only ${money(pay.inv.due)} is recorded.`}</span>
              </div>
            ) : null}
            <div><label className="gc-label" htmlFor="iv-by">Who receives the money *</label><select id="iv-by" className="gc-input gc-select" aria-required="true" value={pay.by} onChange={(e) => setPay({ ...pay, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name} value={m.name}>{m.name} · {m.role}</option>)}</select></div>
            <p className="gc-help" style={{ margin: 0 }} role="status">{payCalc.byCredit ? `Uses ${money(payCalc.amount)} of ${money(pay.credit)} credit.${payCalc.amount < pay.inv.due ? ` ${money(r2(pay.inv.due - payCalc.amount))} will be left.` : ' This pays the invoice in full.'}` : payCalc.amount >= pay.inv.due ? 'This pays the invoice in full. It becomes Paid and counts as a completed sale.' : payCalc.amount ? `The invoice becomes Partially paid. ${money(r2(pay.inv.due - payCalc.amount))} will be left.` : 'Enter the amount the customer paid.'}</p>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPay(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!payCalc.amount}>Record payment</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* edit and send again */}
      <Dialog open={!!edit} title={edit ? `Edit invoice · ${edit.inv.id}` : 'Edit invoice'} onClose={() => setEdit(null)} width={620}>
        {edit ? (
          <div className="iv-form">
            <span className="iv-sub">{who(edit.inv)} · revision {edit.inv.rev || 1} now · saving makes revision {(edit.inv.rev || 1) + 1}</span>
            <div>
              {edit.lines.map((l) => {
                const s = sentNow[l.id] || 0;
                return (
                  <div key={l.id} className="iv-line">
                    <span className="iv-line__name"><span className="iv-strong">{l.name}</span>{s ? <span className="iv-lock">{s} pcs sent — can’t go below {s}</span> : null}</span>
                    <span className="iv-step">
                      <button type="button" aria-label={`Fewer ${l.name}`} disabled={l.qty <= minQty(l)} onClick={() => setLine(l.id, { qty: Math.max(minQty(l), l.qty - 1) })}><Icon name="minus" width="16" height="16" /></button>
                      <b aria-label={`Quantity ${l.qty}`}>{l.qty}</b>
                      <button type="button" aria-label={`More ${l.name}`} onClick={() => setLine(l.id, { qty: l.qty + 1 })}><Icon name="plus" width="16" height="16" /></button>
                    </span>
                    <input className="gc-input iv-num" type="number" min="0" step="0.01" inputMode="decimal" aria-label={`Unit price of ${l.name}`} value={l.price} onChange={(e) => setLine(l.id, { price: num(e.target.value) })} />
                    <button type="button" className="gc-iconbtn" aria-label={s ? `${l.name} cannot be removed: ${s} pcs already sent` : `Remove ${l.name}`} title={s ? `${s} pcs already sent` : 'Remove'} disabled={s > 0} onClick={() => setLine(l.id, null)}><Icon name={s ? 'lock' : 'trash-2'} width="18" height="18" /></button>
                  </div>
                );
              })}
              {edit.lines.length === 0 ? <p className="gc-help">All items were removed. Add at least one back, or cancel.</p> : null}
            </div>
            <div className="iv-two">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div><label className="gc-label" htmlFor="iv-disc">Discount (৳)</label><input id="iv-disc" className="gc-input" type="number" min="0" inputMode="decimal" placeholder="0" value={edit.discount} onChange={(e) => setEdit({ ...edit, discount: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="iv-editor">Edited by</label><select id="iv-editor" className="gc-input gc-select" value={edit.by} onChange={(e) => setEdit({ ...edit, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
              </div>
              <ul className="iv-rows">
                <li><span>Items</span><b>{money(draft.gross)}</b></li>
                {draft.disc ? <li><span>Discount</span><b>−{money(draft.disc)}</b></li> : null}
                <li><span>VAT</span><b>{money(draft.tax)}</b></li>
                {paidSoFar(edit.inv) ? <li><span>Already paid</span><b>−{money(paidSoFar(edit.inv))}</b></li> : null}
              </ul>
            </div>
            <div className="iv-total"><span>New total {money(draft.total)} · unpaid</span><b>{money(draft.due)}</b></div>
            {draft.over ? <p className="gc-help" style={{ margin: 0 }}>{edit.inv.customer.phone ? `${money(draft.over)} already paid is above the new total. It is kept as ${who(edit.inv)}’s advance credit.` : `${money(draft.over)} already paid is above the new total. Give it back to the customer.`}</p> : null}
            <p className="gc-help" style={{ margin: 0 }}>The current version is kept in the invoice’s revision history.</p>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setEdit(null)}>Cancel</button>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => saveEdit(false)}>Save</button>
              <button type="button" className="gc-btn gc-btn--solid" onClick={() => saveEdit(true)}><Icon name="send" width="18" height="18" aria-hidden="true" /> Save and send again</button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* hold stock for an invoice, line by line */}
      <HoldStockDialog inv={hold} onClose={() => setHold(null)} onDone={() => { setHold(null); reload(); }} />

    </div>
  );
}
