'use client';
// WholesaleOrders — the wholesale orders and their delivery: taken or not, how many pieces sent,
// partial or full. The orders themselves are made in New sale; this page only follows them up.
// Laid out like Shopify's lists (components/ui/IndexKit.jsx): the list shows the order, date, customer, total,
// payment, delivery and pieces sent; open an order (the invoice page) to deliver it, print a challan or take payment.
// Front end only: rows are the wholesale invoices from src/lib/invoices.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { getInvoices, deliveryOf, statusOf } from '@/lib/invoices';
import { INVOICE_STATUS as PAY } from './InvoicePaper';
import { DELIVERY } from './DeliveryDialog';

const TABS = [['all', 'All'], ['none', 'Not delivered'], ['partial', 'Partly delivered'], ['full', 'Delivered in full']];
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const hrefOf = (r) => '/sales-invoice?id=' + encodeURIComponent(r.id);

const CSS = `
.wo-id{font-family:var(--font-data)}
`;

export default function WholesaleOrders() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [pay, setPay] = useState('');

  useEffect(() => { setRows(getInvoices().filter((r) => r.wholesale)); }, []);

  const of = (st) => rows.filter((r) => deliveryOf(r).status === st);
  const counts = { all: rows.length, none: of('none').length, partial: of('partial').length, full: of('full').length };
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (tab === 'all' ? rows : of(tab))
      .filter((r) => !pay || statusOf(r) === pay)
      .filter((r) => !text || (r.id + ' ' + r.customer.name + ' ' + r.customer.phone).toLowerCase().includes(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tab, q, pay]);
  const searching = find || !!q || !!pay;
  const closeFind = () => { setFind(false); setQ(''); setPay(''); };
  const toSend = rows.reduce((a, r) => a + deliveryOf(r).left, 0);
  const toCollect = rows.reduce((a, r) => a + Math.max(0, r.due || 0), 0);
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'wo-tab-' + id, label, count: counts[id], on: tab === id, onClick: () => setTab(id) }));

  return (
    <div className="dc-screen ds" data-screen="WholesaleOrders">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-wholesale" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Wholesale orders" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="truck" title="Wholesale orders"
                about="Follow each wholesale order: whether the customer has taken delivery, how many pieces went out, and what is still to pay."
                more={[{ label: 'All orders', href: '/merchant-orders' }, { label: 'Invoices', href: '/sales-invoices' }]}
                primary={{ label: 'New sale', href: '/pos' }} />

              <MetricStrip label="Wholesale orders" items={[
                { label: 'Pieces to send', value: toSend + ' pcs' },
                { label: 'Due to collect', value: money(toCollect) },
              ]} />

              <section className="ix-card" aria-label="Wholesale orders">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer or order no." onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Wholesale orders by delivery" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Payment" className={'ix-filter' + (pay ? ' is-set' : '')} value={pay} onChange={(e) => setPay(e.target.value)}>
                      <option value="">Payment</option>{Object.entries(PAY).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                    {q || pay ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setPay(''); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {shown.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="truck" title={q || pay ? 'No order matches that search' : rows.length ? 'No order in this group' : 'No wholesale orders yet'} actionLabel={q || pay || rows.length ? undefined : 'New sale'} onAction={() => navigate('/pos')} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Wholesale orders">
                    {shown.map((r) => {
                      const d = deliveryOf(r);
                      return (
                        <li key={r.src + r.id}>
                          <Link href={hrefOf(r)} className="ix-pitem">
                            <span className="ix-pitem__top"><b>{r.customer.name}</b><span>{money(r.totals.total)}</span></span>
                            <span className="ix-pitem__mid"><span className="wo-id">{r.id}</span> · {formatDate(r.at)} · {d.sent} of {d.total} pcs sent</span>
                            <span className="ix-pitem__tags">
                              <StatusBadge tone={PAY[statusOf(r)][1]}>{PAY[statusOf(r)][0]}</StatusBadge>
                              <StatusBadge tone={DELIVERY[d.status][1]} icon="truck">{DELIVERY[d.status][0]}</StatusBadge>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Wholesale orders, {shown.length} shown</caption>
                      <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Customer</th><th scope="col" className="ix-num">Total</th><th scope="col">Payment</th><th scope="col">Delivery</th><th scope="col" className="ix-num">Sent</th></tr></thead>
                      <tbody>
                        {shown.map((r) => {
                          const d = deliveryOf(r);
                          return (
                            <tr key={r.src + r.id} onClick={(e) => { if (!e.target.closest('a,button')) navigate(hrefOf(r)); }}>
                              <td><Link href={hrefOf(r)} className="ix-strong wo-id">{r.id}</Link></td>
                              <td className="ix-muted">{formatDate(r.at)}</td>
                              <td>{r.customer.name}</td>
                              <td className="ix-num">{money(r.totals.total)}</td>
                              <td><StatusBadge tone={PAY[statusOf(r)][1]}>{PAY[statusOf(r)][0]}</StatusBadge></td>
                              <td><StatusBadge tone={DELIVERY[d.status][1]} icon="truck">{DELIVERY[d.status][0]}</StatusBadge></td>
                              <td className="ix-num ix-muted">{d.sent} of {d.total} pcs</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{shown.length === 1 ? '1 order' : shown.length + ' orders'}</span></div>
              </section>
              <LearnMore topic="wholesale orders" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
