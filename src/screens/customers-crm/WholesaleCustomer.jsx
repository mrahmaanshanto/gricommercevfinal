'use client';
// WholesaleCustomer — the profile of one wholesale customer (?phone=<mobile number>):
// who they are and their price list, what they owe, and their entire purchase history —
// every order, what they bought in total, every payment and every return.
// Front end only: built from the customer book, the invoices and the return history.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getCustomers, findCustomer, tierOf, phoneDigits, updateCustomer } from '@/lib/customers';
import { getInvoices, deliveryOf, statusOf, isPaid, paidSoFar, dueForPhone } from '@/lib/invoices';
import { demoCustomer, saveDemoEdit, mergedPhonesOf } from '@/lib/customerEdits';
import CustomerEditDialog from './CustomerEditDialog';
import { getReturns } from '@/lib/returns';
import { INVOICE_STATUS as PAY, paymentsOf } from '@/screens/sales/InvoicePaper';
import { DELIVERY } from '@/screens/sales/DeliveryDialog';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const r2 = (n) => Math.round(n * 100) / 100;

const CSS = `
.wc-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.wc-back{display:grid;place-items:center;width:44px;height:44px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-body)}
.wc-avatar{display:grid;place-items:center;width:48px;height:48px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-base);font-weight:var(--weight-semibold)}
.wc-title{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wc-meta{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.wc-actions{margin-left:auto;display:flex;flex-wrap:wrap;gap:var(--space-2)}
.wc-grid{display:grid;grid-template-columns:minmax(0,1fr) 288px;gap:var(--space-5);align-items:start}
.wc-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.wc-card{overflow:hidden}
.wc-card__head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2) var(--space-3);padding:var(--space-4) var(--space-5) var(--space-3)}
.wc-card__head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wc-card__body{display:flex;flex-direction:column;gap:var(--space-4);padding:0 var(--space-5) var(--space-5)}
.wc-card .gc-table th,.wc-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.wc-card .gc-table th:first-child,.wc-card .gc-table td:first-child{padding-left:var(--space-5)}
.wc-card .gc-table th:last-child,.wc-card .gc-table td:last-child{padding-right:var(--space-5)}
.wc-card .gc-badge,.wc-num,.wc-id{white-space:nowrap}
.wc-nowrap{white-space:nowrap!important}
.wc-items{min-width:150px}
.wc-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.wc-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.wc-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary)}
.wc-num{text-align:right;font-variant-numeric:tabular-nums}
.wc-due{color:var(--text-danger);font-weight:var(--weight-semibold)}
.wc-facts{display:grid;grid-template-columns:auto 1fr;gap:8px var(--space-4);margin:0;font-size:var(--text-sm)}
.wc-facts dt{color:var(--text-muted)}
.wc-facts dd{margin:0;text-align:right;color:var(--text-heading);overflow-wrap:anywhere}
.wc-owed{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-error-soft);color:var(--text-danger)}
.wc-owed.is-clear{background:var(--fill-success-soft);color:var(--text-success)}
.wc-owed b{font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.wc-empty{margin:0;padding:0 var(--space-5) var(--space-5);font-size:var(--text-sm);color:var(--text-muted)}
.wc-tabs{display:flex;gap:3px;padding:3px;border-radius:var(--radius-lg);background:var(--slate-150)}
.wc-tabs button{height:32px;padding:0 12px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;white-space:nowrap}
.wc-credit{display:flex;flex-direction:column;gap:8px}
.wc-credit__row{display:flex;justify-content:space-between;gap:12px;font-size:var(--text-sm);color:var(--text-muted)}
.wc-credit__row b{font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.wc-credit.is-over .gc-progress__fill{background:var(--text-danger)}
.wc-credit.is-near .gc-progress__fill{background:var(--text-warning)}
.wc-over{display:flex;align-items:flex-start;gap:6px;margin:0;font-size:var(--text-xs);color:var(--text-danger);font-weight:var(--weight-medium)}
.wc-tabs button.is-on{background:#fff;color:var(--primary);box-shadow:0 1px 2px rgba(48,46,56,.12)}
@media (max-width:1100px){.wc-grid{grid-template-columns:minmax(0,1fr)}}
`;

export default function WholesaleCustomer() {
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState('');
  const [book, setBook] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [returns, setReturns] = useState([]);
  const [tab, setTab] = useState('orders');   // orders | products | payments | returns
  const [demoId, setDemoId] = useState('');   // a demo list customer made wholesale on the Customers page
  const [editing, setEditing] = useState(null);
  const [rev, setRev] = useState(0);           // bumps after an edit so the demo customer is read again

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setPhone(phoneDigits(qs.get('phone'))); setDemoId(qs.get('demo') || '');
    setBook(getCustomers()); setInvoices(getInvoices()); setReturns(getReturns()); setReady(true);
  }, []);

  // `rev` changes after an edit, so a demo customer is read again from this browser
  const cust = ready && rev >= 0 ? findCustomer(book, phone) || demoCustomer(phone, demoId) : null;
  const shell = (body) => (
    <div className="dc-screen ds" data-screen="WholesaleCustomer">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="customers" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Customers" page={cust ? cust.name : 'Wholesale customer'} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>{body}</div>
        </main>
      </div>
    </div>
  );
  if (!ready) return shell(null);
  if (!cust) return shell(<><h1 className="sr-only">Customer not found</h1><EmptyState icon="user-x" title="This customer was not found" body="Open a wholesale customer from the Customers list." /><p style={{ textAlign: 'center' }}><Link href="/all-customers?view=wholesale" className="gc-btn gc-btn--soft">Wholesale customers</Link></p></>);

  const tier = tierOf(cust);
  // invoices of this customer and of any duplicate merged into it
  const phones = cust.demoId ? [cust.phone] : [cust.phone, ...mergedPhonesOf(cust.phone)];
  const orders = invoices.filter((r) => phones.indexOf(r.customer.phone) >= 0);
  const bought = r2(orders.reduce((a, r) => a + r.totals.total, 0));
  const paid = r2(orders.reduce((a, r) => a + paidSoFar(r), 0));
  const due = r2(orders.reduce((a, r) => a + Math.max(0, r.due), 0));
  const pcs = orders.reduce((a, r) => a + deliveryOf(r).total, 0);
  const pcsLeft = orders.reduce((a, r) => a + deliveryOf(r).left, 0);
  const firstUnpaid = [...orders].reverse().find((r) => !isPaid(r));
  // everything bought, by product
  const products = Object.values(orders.reduce((map, r) => {
    r.lines.forEach((l) => { const p = map[l.name] || (map[l.name] = { name: l.name, qty: 0, amount: 0, orders: 0, last: 0 }); p.qty += l.qty; p.amount += l.price * l.qty - (l.disc || 0); p.orders += 1; p.last = Math.max(p.last, r.at); });
    return map;
  }, {})).sort((a, b) => b.amount - a.amount);
  const payments = orders.flatMap((r) => paymentsOf(r).map((p) => ({ ...p, order: r.id }))).sort((a, b) => b.at - a.at);
  const back = returns.filter((r) => r.customer === cust.name);
  const counts = { orders: orders.length, products: products.length, payments: payments.length, returns: back.length };
  const link = (id) => '/sales-invoice?id=' + encodeURIComponent(id);
  // credit limit: what they owe now against the most they may owe (0 = no limit)
  const limit = cust.creditLimit || 0;
  const used = r2(phones.reduce((a, p) => a + dueForPhone(p), 0) + (cust.demoId ? cust.due || 0 : 0));
  const left = r2(limit - used);
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const over = limit > 0 && used > limit;

  const openEdit = () => setEditing({ name: cust.name, phone: cust.demoId ? cust.shownPhone || cust.phone : cust.phone, address: cust.address || '', types: cust.types || [], tier: cust.tier || 'A', creditLimit: limit });
  const saveEdit = (vals) => {
    const patch = { name: vals.name, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit };
    if (cust.demoId) saveDemoEdit(cust.demoId, { ...patch, phone: vals.phone });
    else updateCustomer(cust.phone, patch);
    setEditing(null); setBook(getCustomers()); setRev(rev + 1);
    if (cust.demoId && vals.phone !== cust.phone) setPhone(phoneDigits(vals.phone));
    const stillWhole = vals.types.indexOf('Wholesale') >= 0;
    toast(vals.name + ' was updated.' + (stillWhole ? '' : ' They no longer buy wholesale, so New sale uses retail prices.'));
  };

  return shell(
    <>
      <div className="wc-head">
        <Link href="/all-customers?view=wholesale" className="wc-back" aria-label="Back to wholesale customers"><Icon name="arrow-left" width="18" height="18" /></Link>
        <span className="wc-avatar" aria-hidden="true">{cust.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
        <div><h1 className="wc-title">{cust.name}</h1><p className="wc-meta">{cust.shownPhone || cust.phone} · {cust.address || 'No address on file'}</p></div>
        <span className={'gc-badge gc-badge--lg gc-badge--' + (tier ? 'primary' : 'slate')}>{tier ? 'Wholesale customer' : 'Retail prices'}</span>
        <div className="wc-actions">
          <button type="button" className="gc-btn gc-btn--neutral" onClick={openEdit} aria-haspopup="dialog"><Icon name="pencil" width="18" height="18" aria-hidden="true" /> Edit</button>
          <Link href={'/customer-statement?phone=' + cust.phone} className="gc-btn gc-btn--neutral"><Icon name="file-text" width="18" height="18" aria-hidden="true" /> Statement</Link>
          {firstUnpaid ? <Link href={link(firstUnpaid.id)} className="gc-btn gc-btn--neutral"><Icon name="hand-coins" width="18" height="18" aria-hidden="true" /> Take payment</Link> : null}
          <Link href="/pos" className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> New sale</Link>
        </div>
      </div>

      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="clipboard-list" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Orders</p><p className="gc-kpi__value">{orders.length}<small>{pcs} pcs</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-accent-soft)', color: 'var(--accent-text)' }}><Icon name="shopping-bag" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Total bought</p><p className="gc-kpi__value">{formatBDT(bought)}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="wallet" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Paid so far</p><p className="gc-kpi__value">{formatBDT(paid)}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="file-clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Total due</p><p className="gc-kpi__value">{formatBDT(due)}<small>{orders.filter((r) => !isPaid(r)).length === 1 ? '1 order' : orders.filter((r) => !isPaid(r)).length + ' orders'}</small></p></div></div>
      </div>

      <div className="wc-grid">
        <section className="gc-card wc-card">
          <div className="wc-card__head">
            <h2>Purchase history</h2>
            <div className="wc-tabs" role="tablist" aria-label="Purchase history">
              {[['orders', 'Orders'], ['products', 'Products bought'], ['payments', 'Payments'], ['returns', 'Returns']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-on' : ''} onClick={() => setTab(id)}>{label} · {counts[id]}</button>)}
            </div>
          </div>

          {tab === 'orders' ? (orders.length === 0 ? <p className="wc-empty">No order yet. Start one from New sale.</p> : (
            <div className="gc-table-wrap"><table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col" className="wc-num">Total</th><th scope="col" className="wc-num">Due</th><th scope="col">Payment and delivery</th></tr></thead>
              <tbody>{orders.map((r) => { const d = deliveryOf(r); return (
                <tr key={r.src + r.id}>
                  <td><Link href={link(r.id)} className="wc-id">{r.id}</Link></td>
                  <td className="wc-nowrap">{formatDate(r.at)}</td>
                  <td className="wc-items">{r.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}</td>
                  <td className="wc-num wc-strong">{money(r.totals.total)}</td>
                  <td className={'wc-num' + (isPaid(r) ? '' : ' wc-due')}>{isPaid(r) ? '—' : money(r.due)}</td>
                  <td><span className={'gc-badge gc-badge--' + PAY[statusOf(r)][1]}>{PAY[statusOf(r)][0]}</span> <span className={'gc-badge gc-badge--' + DELIVERY[d.status][1]}>{DELIVERY[d.status][0]}</span><span className="wc-sub">{d.sent} of {d.total} pcs sent</span></td>
                </tr>); })}</tbody>
            </table></div>
          )) : null}

          {tab === 'products' ? (products.length === 0 ? <p className="wc-empty">Nothing bought yet.</p> : (
            <div className="gc-table-wrap"><table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Product</th><th scope="col" className="wc-num">Pieces</th><th scope="col" className="wc-num">In orders</th><th scope="col" className="wc-num">Amount</th><th scope="col">Last bought</th></tr></thead>
              <tbody>{products.map((p) => <tr key={p.name}><td className="wc-strong">{p.name}</td><td className="wc-num">{p.qty}</td><td className="wc-num">{p.orders}</td><td className="wc-num wc-strong">{money(r2(p.amount))}</td><td>{formatDate(p.last)}</td></tr>)}</tbody>
            </table></div>
          )) : null}

          {tab === 'payments' ? (payments.length === 0 ? <p className="wc-empty">No payment received yet.</p> : (
            <div className="gc-table-wrap"><table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Date</th><th scope="col">Order</th><th scope="col">Method</th><th scope="col">Received by</th><th scope="col" className="wc-num">Amount</th></tr></thead>
              <tbody>{payments.map((p, i) => <tr key={i}><td>{formatDate(p.at)}</td><td><Link href={link(p.order)} className="wc-id">{p.order}</Link></td><td className="wc-strong">{p.method}{p.ref ? <span className="wc-sub">{p.ref}</span> : null}</td><td>{p.by || '—'}</td><td className="wc-num wc-strong">{money(p.amount)}</td></tr>)}</tbody>
            </table></div>
          )) : null}

          {tab === 'returns' ? (back.length === 0 ? <p className="wc-empty">This customer has not returned or exchanged anything.</p> : (
            <div className="gc-table-wrap"><table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Date</th><th scope="col">Order</th><th scope="col">What came back</th><th scope="col">Type</th><th scope="col" className="wc-num">Money</th><th scope="col">Stock</th></tr></thead>
              <tbody>{back.map((r) => <tr key={r.id}><td>{formatDate(r.at)}</td><td className="wc-id">{r.ref}</td><td>{r.items}<span className="wc-sub">{r.reason}</span></td><td><span className={'gc-badge gc-badge--' + (r.type === 'return' ? 'warning' : 'primary')}>{r.type === 'return' ? 'Return' : 'Exchange'}</span></td><td className="wc-num wc-strong">{r.amount ? money(r.amount) : '—'}</td><td><span className={'gc-badge gc-badge--' + (r.stock === 'restock' ? 'success' : 'error')}>{r.stock === 'restock' ? 'Back in stock' : 'Damaged'}</span></td></tr>)}</tbody>
            </table></div>
          )) : null}
        </section>

        <aside className="wc-col">
          <section className="gc-card wc-card">
            <div className="wc-card__head"><h2>Account</h2></div>
            <div className="wc-card__body">
              <div className={'wc-owed' + (due ? '' : ' is-clear')}><span>{due ? 'Owes you' : 'Nothing due'}</span><b>{formatBDT(due)}</b></div>
              <dl className="wc-facts">
                <dt>Mobile</dt><dd>{cust.shownPhone || cust.phone}</dd>
                <dt>Address</dt><dd>{cust.address || 'Not on file'}</dd>
                <dt>Buys</dt><dd>{(cust.types || []).join(', ') || '—'}</dd>
                <dt>Price list</dt><dd>{tier ? `${tier.label} · ${tier.off}% below retail` : 'Retail prices'}</dd>
                <dt>First order</dt><dd>{orders.length ? formatDate(orders[orders.length - 1].at) : '—'}</dd>
                <dt>Last order</dt><dd>{orders.length ? formatDate(orders[0].at) : '—'}</dd>
                <dt>Still to deliver</dt><dd>{pcsLeft} pcs</dd>
              </dl>
            </div>
          </section>
          <section className="gc-card wc-card" aria-labelledby="wc-credit-h">
            <div className="wc-card__head"><h2 id="wc-credit-h">Credit limit</h2><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={openEdit} aria-haspopup="dialog">Change</button></div>
            <div className="wc-card__body">
              {limit ? (
                <div className={'wc-credit' + (over ? ' is-over' : pct >= 80 ? ' is-near' : '')}>
                  <div className="wc-credit__row"><span>Limit</span><b>{formatBDT(limit)}</b></div>
                  <div className="gc-progress" role="progressbar" aria-label="Credit used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${formatBDT(used)} of ${formatBDT(limit)} used`}><div className="gc-progress__fill" style={{ width: pct + '%' }} /></div>
                  <div className="wc-credit__row"><span>Used</span><b style={over ? { color: 'var(--text-danger)' } : undefined}>{money(used)}</b></div>
                  <div className="wc-credit__row"><span>{over ? 'Over the limit by' : 'Still available'}</span><b style={{ color: over ? 'var(--text-danger)' : 'var(--text-success)' }}>{money(Math.abs(left))}</b></div>
                  {over ? <p className="wc-over" role="alert"><Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: 'none', marginTop: '1px' }} />Over the credit limit. Take a payment before selling more on credit.</p> : null}
                </div>
              ) : (
                <div className="wc-credit">
                  <div className="wc-credit__row"><span>Limit</span><b>No limit</b></div>
                  <div className="wc-credit__row"><span>Owes now</span><b>{money(used)}</b></div>
                  <p className="gc-help" style={{ margin: 0 }}>Set a limit to be warned before this customer owes too much.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
      <CustomerEditDialog open={!!editing} customer={editing} phoneLocked={!cust.demoId} onSave={saveEdit} onClose={() => setEditing(null)} />
    </>
  );
}
