'use client';
// WholesaleCustomer — the profile of one wholesale customer (?phone=<mobile number>):
// who they are and their price list, what they owe, and their entire purchase history —
// every order, what they bought in total, every payment and every return. A record page (docs/shopify-style.md):
// RecordHeader (Statement, Take payment, New sale), the four figures, the purchase history on the left and the
// account and credit limit on the right.
// Front end only: built from the customer book, the invoices and the return history.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
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
/* phones: a figure cell grows to fit its value and sub-line (kit request) */
@media (max-width:640px){.ix-metric{flex:0 0 auto}}
.wc-id{white-space:nowrap}
.wc-items{min-width:150px}
.wc-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.wc-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.wc-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary)}
.wc-due{color:var(--text-danger);font-weight:var(--weight-semibold)}
.wc-ok{color:var(--text-success)}
.wc-owed{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-error-soft);font-size:var(--text-sm);color:var(--text-danger)}
.wc-owed.is-clear{background:var(--fill-success-soft);color:var(--text-success)}
.wc-owed b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
.wc-empty{margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.wc-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.wc-credit{display:flex;flex-direction:column;gap:6px}
.wc-credit.is-over .gc-progress__fill{background:var(--text-danger)}
.wc-credit.is-near .gc-progress__fill{background:var(--text-warning)}
.wc-over{display:flex;align-items:flex-start;gap:6px;margin:0;font-size:var(--text-xs);color:var(--text-danger);font-weight:var(--weight-medium)}
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
        <main className="gc-shell__main">
          <Topbar crumb="Customers" page={cust ? cust.name : 'Wholesale customer'} />
          <div className="gc-shell__content"><div className="ix-page">{body}</div></div>
        </main>
      </div>
    </div>
  );
  if (!ready) return shell(null);
  if (!cust) return shell(<><RecordHeader back="/all-customers?view=wholesale" backLabel="Wholesale customers" title="Customer not found" /><section className="ix-card"><div className="ix-empty"><EmptyState icon="user-x" title="This customer was not found" body="Open a wholesale customer from the Customers list." /></div><div className="ix-foot"><span /><Link href="/all-customers?view=wholesale" className="ix-btn ix-btn--sm">Wholesale customers</Link></div></section></>);

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

  const unpaid = orders.filter((r) => !isPaid(r)).length;
  const histTabs = [['orders', 'Orders'], ['products', 'Products bought'], ['payments', 'Payments'], ['returns', 'Returns']]
    .map(([id, label]) => ({ key: id, id: 'wc-tab-' + id, label, count: counts[id], on: tab === id, onClick: () => setTab(id) }));

  return shell(
    <>
      <RecordHeader back="/all-customers?view=wholesale" backLabel="Back to wholesale customers" title={cust.name}
        badges={<StatusBadge tone={tier ? 'primary' : 'neutral'} icon="store">{tier ? 'Wholesale customer' : 'Retail prices'}</StatusBadge>}
        meta={`${cust.shownPhone || cust.phone} · ${cust.address || 'No address on file'}`}
        secondary={[{ label: 'Statement', href: '/customer-statement?phone=' + cust.phone }, firstUnpaid ? { label: 'Take payment', href: link(firstUnpaid.id) } : null].filter(Boolean)}
        more={[{ label: 'Edit', onClick: openEdit }]}
        primary={{ label: 'New sale', href: '/pos' }} />

      <MetricStrip label="Account" items={[
        { label: 'Orders', value: String(orders.length), sub: `${pcs} pcs` },
        { label: 'Total bought', value: formatBDT(bought) },
        { label: 'Paid so far', value: formatBDT(paid) },
        { label: 'Total due', value: formatBDT(due), sub: unpaid === 1 ? '1 order' : unpaid + ' orders' },
      ]} />

      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-label="Purchase history">
            <div className="ix-bar"><IndexTabs tabs={histTabs} label="Purchase history" /></div>

            {tab === 'orders' ? (orders.length === 0 ? <p className="wc-empty">No order yet. Start one from New sale.</p> : (
              <div className="ix-table-wrap ix-table-wrap--show"><table className="ix-table ix-table--static gc-table--keep">
                <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col" className="ix-num">Total</th><th scope="col" className="ix-num">Due</th><th scope="col">Payment and delivery</th></tr></thead>
                <tbody>{orders.map((r) => { const d = deliveryOf(r); return (
                  <tr key={r.src + r.id}>
                    <td><Link href={link(r.id)} className="wc-id">{r.id}</Link></td>
                    <td className="ix-nowrap">{formatDate(r.at)}</td>
                    <td className="wc-items">{r.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}</td>
                    <td className="ix-num wc-strong">{money(r.totals.total)}</td>
                    <td className={'ix-num' + (isPaid(r) ? '' : ' wc-due')}>{isPaid(r) ? '—' : money(r.due)}</td>
                    <td><span className={'gc-badge gc-badge--' + PAY[statusOf(r)][1]}>{PAY[statusOf(r)][0]}</span> <span className={'gc-badge gc-badge--' + DELIVERY[d.status][1]}>{DELIVERY[d.status][0]}</span><span className="wc-sub">{d.sent} of {d.total} pcs sent</span></td>
                  </tr>); })}</tbody>
              </table></div>
            )) : null}

            {tab === 'products' ? (products.length === 0 ? <p className="wc-empty">Nothing bought yet.</p> : (
              <div className="ix-table-wrap ix-table-wrap--show"><table className="ix-table ix-table--static gc-table--keep">
                <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Pieces</th><th scope="col" className="ix-num">In orders</th><th scope="col" className="ix-num">Amount</th><th scope="col">Last bought</th></tr></thead>
                <tbody>{products.map((p) => <tr key={p.name}><td className="wc-strong">{p.name}</td><td className="ix-num">{p.qty}</td><td className="ix-num">{p.orders}</td><td className="ix-num wc-strong">{money(r2(p.amount))}</td><td className="ix-nowrap">{formatDate(p.last)}</td></tr>)}</tbody>
              </table></div>
            )) : null}

            {tab === 'payments' ? (payments.length === 0 ? <p className="wc-empty">No payment received yet.</p> : (
              <div className="ix-table-wrap ix-table-wrap--show"><table className="ix-table ix-table--static gc-table--keep">
                <thead><tr><th scope="col">Date</th><th scope="col">Order</th><th scope="col">Method</th><th scope="col">Received by</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                <tbody>{payments.map((p, i) => <tr key={i}><td className="ix-nowrap">{formatDate(p.at)}</td><td><Link href={link(p.order)} className="wc-id">{p.order}</Link></td><td className="wc-strong">{p.method}{p.ref ? <span className="wc-sub">{p.ref}</span> : null}</td><td>{p.by || '—'}</td><td className="ix-num wc-strong">{money(p.amount)}</td></tr>)}</tbody>
              </table></div>
            )) : null}

            {tab === 'returns' ? (back.length === 0 ? <p className="wc-empty">This customer has not returned or exchanged anything.</p> : (
              <div className="ix-table-wrap ix-table-wrap--show"><table className="ix-table ix-table--static gc-table--keep">
                <thead><tr><th scope="col">Date</th><th scope="col">Order</th><th scope="col">What came back</th><th scope="col">Type</th><th scope="col" className="ix-num">Money</th><th scope="col">Stock</th></tr></thead>
                <tbody>{back.map((r) => <tr key={r.id}><td className="ix-nowrap">{formatDate(r.at)}</td><td className="wc-id">{r.ref}</td><td>{r.items}<span className="wc-sub">{r.reason}</span></td><td><span className={'gc-badge gc-badge--' + (r.type === 'return' ? 'warning' : 'primary')}>{r.type === 'return' ? 'Return' : 'Exchange'}</span></td><td className="ix-num wc-strong">{r.amount ? money(r.amount) : '—'}</td><td><span className={'gc-badge gc-badge--' + (r.stock === 'restock' ? 'success' : 'error')}>{r.stock === 'restock' ? 'Back in stock' : 'Damaged'}</span></td></tr>)}</tbody>
              </table></div>
            )) : null}
          </section>
        </div>

        <aside className="ix-side wc-side">
          <section className="ix-card" aria-labelledby="wc-acct-h">
            <header className="ix-card__head"><h2 id="wc-acct-h">Account</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={openEdit} aria-haspopup="dialog">Edit</button></header>
            <div className="ix-card__body">
              <div className={'wc-owed' + (due ? '' : ' is-clear')}><span>{due ? 'Owes you' : 'Nothing due'}</span><b>{formatBDT(due)}</b></div>
              <KV rows={[
                ['Mobile', cust.shownPhone || cust.phone],
                ['Address', cust.address || 'Not on file'],
                ['Buys', (cust.types || []).join(', ') || '—'],
                ['Price list', tier ? `${tier.label} · ${tier.off}% below retail` : 'Retail prices'],
                ['First order', orders.length ? formatDate(orders[orders.length - 1].at) : '—'],
                ['Last order', orders.length ? formatDate(orders[0].at) : '—'],
                ['Still to deliver', `${pcsLeft} pcs`],
              ]} />
            </div>
          </section>
          <section className="ix-card" aria-labelledby="wc-credit-h">
            <header className="ix-card__head"><h2 id="wc-credit-h">Credit limit</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={openEdit} aria-haspopup="dialog">Change</button></header>
            <div className="ix-card__body">
              {limit ? (
                <div className={'wc-credit' + (over ? ' is-over' : pct >= 80 ? ' is-near' : '')}>
                  <KV rows={[['Limit', formatBDT(limit)]]} />
                  <div className="gc-progress" role="progressbar" aria-label="Credit used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${formatBDT(used)} of ${formatBDT(limit)} used`}><div className="gc-progress__fill" style={{ width: pct + '%' }} /></div>
                  <KV rows={[['Used', <span className={over ? 'wc-due' : ''}>{money(used)}</span>], [over ? 'Over the limit by' : 'Still available', <span className={over ? 'wc-due' : 'wc-ok'}>{money(Math.abs(left))}</span>]]} />
                  {over ? <p className="wc-over" role="alert"><Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: 'none', marginTop: '1px' }} />Over the credit limit. Take a payment before selling more on credit.</p> : null}
                </div>
              ) : (
                <div className="wc-credit">
                  <KV rows={[['Limit', 'No limit'], ['Owes now', money(used)]]} />
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
