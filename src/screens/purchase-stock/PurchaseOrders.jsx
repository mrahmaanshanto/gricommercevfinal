'use client';
// PurchaseOrders — Purchase orders (/purchase-orders), laid out like Shopify's purchase order list
// (components/ui/IndexKit.jsx): title row, what is coming and what is owed, then one card with the status views,
// search and a supplier filter, and a compact table. A row opens the order (/po-detail?no=…), where receiving,
// payment, extra costs, files and history live.
// Orders made in this browser (src/lib/purchaseOrders.js, e.g. from staff requests) come first, then the demo orders.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { formatBDT, formatDate } from '@/lib/format';
import { getPOs, poPieces, poReceived, DEMO_POS } from '@/lib/purchaseOrders';

// a stored order's status in the list's words (the tabs)
const STORED_KEY = { Draft: 'draft', Sent: 'ordered', 'Partly received': 'partial', Received: 'received' };
const PO_STATUS = [
  { k: 'all', label: 'All' }, { k: 'draft', label: 'Draft' }, { k: 'approval', label: 'Waiting approval' }, { k: 'approved', label: 'Approved' },
  { k: 'ordered', label: 'Ordered' }, { k: 'partial', label: 'Partly received' }, { k: 'received', label: 'Received' }, { k: 'closed', label: 'Closed' }, { k: 'cancelled', label: 'Cancelled' },
];
const NAMES = Object.fromEntries(PO_STATUS.map((x) => [x.k, x.label]));
const TONE = { draft: 'slate', approval: 'warning', approved: 'info', ordered: 'primary', partial: 'warning', received: 'success', closed: 'slate', cancelled: 'error' };
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

function storedRows() {
  return getPOs().map((p) => ({
    no: p.no, at: p.at, supplier: p.supplier, got: poReceived(p.lines), of: poPieces(p.lines), total: p.total, paid: 0, due: '',
    s: STORED_KEY[p.status] || 'draft', label: p.approval === 'waiting' && p.status === 'Draft' ? 'Waiting for approval' : p.status,
  }));
}
/** What the payment column says: paid, what is due, or not paid yet. */
function payOf(r) {
  const left = r.total - r.paid;
  if (r.s === 'cancelled') return { text: '—', cls: 'ix-muted' };
  if (left <= 0) return { text: 'Paid', cls: '' };
  if (r.paid > 0 || r.overdue) return { text: money(left) + ' due', cls: r.overdue ? 'ix-bad' : 'ix-warn' };
  return { text: 'Not paid', cls: 'ix-muted' };
}

const CSS = `
.po-id{font-family:var(--font-data)}
.po-sup{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis}
`;

export default function PurchaseOrders() {
  const [stored, setStored] = useState([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sup, setSup] = useState('');
  const [find, setFind] = useState(false);
  useEffect(() => { setStored(storedRows()); }, []);

  const ALL = [...stored, ...DEMO_POS];
  const needle = q.trim().toLowerCase();
  const rows = ALL.filter((r) => (tab === 'all' || r.s === tab) && (!sup || r.supplier === sup) && (!needle || (r.no + ' ' + r.supplier).toLowerCase().includes(needle)));
  const suppliers = [...new Set(ALL.map((r) => r.supplier))].sort();
  const searching = find || !!q || !!sup;
  const hasFilters = !!(q || sup);
  const closeFind = () => { setFind(false); setQ(''); setSup(''); };
  const clearFilters = () => { setQ(''); setSup(''); };
  const hrefOf = (r) => '/po-detail?no=' + encodeURIComponent(r.no);
  const exportRows = () => toast(rows.length + ' purchase order' + (rows.length === 1 ? '' : 's') + ' exported as CSV');

  // the figures: pieces still coming on placed orders, what is owed on them, and what is late
  const placed = ALL.filter((r) => ['approved', 'ordered', 'partial'].includes(r.s));
  const coming = placed.reduce((a, r) => a + Math.max(0, r.of - r.got), 0);
  const owing = ALL.filter((r) => ['ordered', 'partial', 'received', 'closed'].includes(r.s) && r.total > r.paid);
  const late = ALL.filter((r) => r.overdue && r.total > r.paid);

  return (
    <div className="dc-screen ds" data-screen="PurchaseOrders">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-orders" />
        <main className="gc-shell__main">
          <Topbar crumb="Purchase" page="Purchase orders" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="file-text" title="Purchase orders"
                about="Orders you place with suppliers. Staff orders above ৳50,000 need an admin to approve. Your own orders as admin go straight through."
                secondary={[{ label: 'Export', onClick: exportRows }]}
                more={[{ label: 'Receive goods', href: '/receive-goods' }, { label: 'Staff requests', href: '/requests' }, { label: 'Suppliers & payables', href: '/suppliers' }]}
                primary={{ label: 'New purchase order', href: '/new-po' }} />

              <MetricStrip label="Purchase orders at a glance" items={[
                { label: 'Pieces coming', value: String(coming), sub: plural(placed.length, 'order') },
                { label: 'Unpaid', value: money(owing.reduce((a, r) => a + r.total - r.paid, 0)), sub: plural(owing.length, 'order') },
                { label: 'Overdue', value: money(late.reduce((a, r) => a + r.total - r.paid, 0)), sub: plural(late.length, 'order') },
              ]} />

              <section className="ix-card" aria-label="Purchase orders">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="PO no., supplier or scan" onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs label="Purchase order status" tabs={PO_STATUS.map((x) => ({ key: x.k, id: 'po-tab-' + x.k, label: x.label, count: x.k === 'all' ? ALL.length : ALL.filter((r) => r.s === x.k).length, on: tab === x.k, onClick: () => setTab(x.k) }))} />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Supplier" className={'ix-filter' + (sup ? ' is-set' : '')} value={sup} onChange={(e) => setSup(e.target.value)}>
                      <option value="">Supplier</option>
                      {suppliers.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    {hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearFilters}>Clear all</button> : null}
                  </div>
                ) : null}

                {rows.length ? (<>
                  <ul className="ix-plist" aria-label="Purchase orders">
                    {rows.map((r) => (
                      <li key={r.no}>
                        <Link href={hrefOf(r)} className="ix-pitem">
                          <span className="ix-pitem__top"><b className="po-id">{r.no}</b><span>{money(r.total)}</span></span>
                          <span className="ix-pitem__mid">{r.supplier} · {formatDate(r.at)} · {r.got} / {r.of} received</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={TONE[r.s]}>{r.label || NAMES[r.s]}</StatusBadge></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Purchase orders</caption>
                      <thead>
                        <tr>
                          <th scope="col">Purchase order</th>
                          <th scope="col">Date</th>
                          <th scope="col">Supplier</th>
                          <th scope="col">Status</th>
                          <th scope="col" className="ix-num">Received</th>
                          <th scope="col" className="ix-num">Total</th>
                          <th scope="col">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => {
                          const pay = payOf(r);
                          return (
                            <tr key={r.no} onClick={(e) => { if (!e.target.closest('a,button')) navigate(hrefOf(r)); }}>
                              <td><Link href={hrefOf(r)} className="ix-strong po-id">{r.no}</Link></td>
                              <td className="ix-muted">{formatDate(r.at)}</td>
                              <td><span className="po-sup">{r.supplier}</span></td>
                              <td><StatusBadge tone={TONE[r.s]}>{r.label || NAMES[r.s]}</StatusBadge></td>
                              <td className="ix-num ix-muted">{r.got} / {r.of}</td>
                              <td className="ix-num">{money(r.total)}</td>
                              <td className={pay.cls}>{pay.text}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>) : (
                  <div className="ix-empty">
                    <EmptyState icon="file-text" title={hasFilters ? 'No order matches that search.' : 'No orders with this status. Try another tab.'}
                      actionLabel={hasFilters ? 'Clear filters' : undefined} onAction={hasFilters ? clearFilters : undefined} />
                  </div>
                )}
                <div className="ix-foot"><span>{plural(rows.length, 'purchase order')}</span></div>
              </section>
              <LearnMore topic="purchase orders" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
