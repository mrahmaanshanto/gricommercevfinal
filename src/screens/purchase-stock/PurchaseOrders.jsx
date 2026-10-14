'use client';
// PurchaseOrders — Purchase orders (/purchase-orders), laid out like Shopify's purchase order list
// (components/ui/IndexKit.jsx): title row, what is coming and what is owed, then one card with the status views,
// search and a supplier filter, and a compact table. A row opens the order (/po-detail?no=…), where receiving,
// payment, extra costs, files and history live.
// Orders made in this browser (src/lib/purchaseOrders.js, e.g. from staff requests) come first, then the demo orders,
// with what happened to them since (src/lib/poFlow.js). Orders waiting for approval can be approved or rejected right
// here by the owner or the warehouse manager (not by the person who made the order). Export downloads a CSV.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { formatBDT, formatDate } from '@/lib/format';
import { allPOs, approvePO, rejectPO, canApprove, approvalLimit, PO_LABEL, PO_TONE, PO_EVENT } from '@/lib/poFlow';
import { currentUser, SESSION_EVENT } from '@/lib/team';
import { downloadCsv } from '@/lib/reports/period';
import { ReasonDialog } from './poParts';

const PO_STATUS = [
  { k: 'all', label: 'All' }, { k: 'draft', label: 'Draft' }, { k: 'approval', label: 'Waiting approval' }, { k: 'approved', label: 'Approved' },
  { k: 'ordered', label: 'Ordered' }, { k: 'partial', label: 'Partly received' }, { k: 'received', label: 'Received' }, { k: 'closed', label: 'Closed' }, { k: 'cancelled', label: 'Cancelled' },
];
const NAMES = Object.fromEntries(PO_STATUS.map((x) => [x.k, x.label]));
const TONE = PO_TONE;
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

/** The list's rows: every order with its status key, received / ordered pieces and payment. */
function listRows() {
  return allPOs().map((p) => ({
    no: p.no, at: p.at, supplier: p.supplier, got: p.got, of: p.pieces, total: p.total, paid: p.demo ? p.paid || 0 : 0, due: p.due || '', overdue: !!p.overdue,
    s: p.s, label: p.s === 'draft' && p.rejected ? 'Rejected' : p.s === 'ordered' ? 'Ordered' : PO_LABEL[p.s], by: p.by || '', byId: p.byId || '',
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
.po-acts{display:inline-flex;gap:6px;white-space:nowrap}
.po-acts--phone{padding:0 var(--space-4) var(--space-3)}
.po-wait{display:flex;align-items:center;gap:var(--space-2)}
.po-wait>span{flex:1}
`;

export default function PurchaseOrders() {
  const [ALL, setAll] = useState([]);
  const [me, setMe] = useState(null);
  const [limit, setLimit] = useState(50000);
  const [rejecting, setRejecting] = useState(null);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sup, setSup] = useState('');
  const [find, setFind] = useState(false);
  const load = () => { setAll(listRows()); setMe(currentUser()); setLimit(approvalLimit()); };
  useEffect(() => {
    load();
    window.addEventListener(PO_EVENT, load); window.addEventListener(SESSION_EVENT, load);
    return () => { window.removeEventListener(PO_EVENT, load); window.removeEventListener(SESSION_EVENT, load); };
  }, []);
  const mayDecide = (r) => r.s === 'approval' && me && canApprove(me) && r.byId !== me.id;
  const approve = (r) => { const x = approvePO(r.no, me); if (!x.ok) { toast(x.error, { tone: 'error' }); return; } toast(`${r.no} approved. Send it to ${r.supplier} next.`); load(); };
  const reject = (reason) => { const x = rejectPO(rejecting.no, me, reason); if (!x.ok) { toast(x.error, { tone: 'error' }); return; } toast(`${rejecting.no} rejected and sent back as a draft`); setRejecting(null); load(); };

  const needle = q.trim().toLowerCase();
  const rows = ALL.filter((r) => (tab === 'all' || r.s === tab) && (!sup || r.supplier === sup) && (!needle || (r.no + ' ' + r.supplier).toLowerCase().includes(needle)));
  const suppliers = [...new Set(ALL.map((r) => r.supplier))].sort();
  const searching = find || !!q || !!sup;
  const hasFilters = !!(q || sup);
  const closeFind = () => { setFind(false); setQ(''); setSup(''); };
  const clearFilters = () => { setQ(''); setSup(''); };
  const hrefOf = (r) => '/po-detail?no=' + encodeURIComponent(r.no);
  const exportRows = () => {
    if (!rows.length) { toast('No orders to export in this view.', { tone: 'error' }); return; }
    downloadCsv('purchase-orders.csv', [['PO no.', 'Date', 'Supplier', 'Status', 'Received', 'Ordered', 'Total (BDT)', 'Paid (BDT)', 'Made by'],
      ...rows.map((r) => [r.no, formatDate(r.at), r.supplier, r.label || NAMES[r.s], r.got, r.of, Math.round(r.total), Math.round(r.paid), r.by])]);
  };
  const waiting = ALL.filter((r) => r.s === 'approval');

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
                about={limit ? `Orders you place with suppliers. Staff orders above ${money(limit)} need the owner or the warehouse manager to approve. Change the limit in Settings › Stock setup.` : 'Orders you place with suppliers. No approval is needed (Settings › Stock setup).'}
                secondary={[{ label: 'Export', onClick: exportRows }]}
                more={[{ label: 'Receive goods', href: '/receive-goods' }, { label: 'Staff requests', href: '/requests' }, { label: 'Suppliers & payables', href: '/suppliers' }, { label: 'Approval limit', href: '/stock-setup' }]}
                primary={{ label: 'New purchase order', href: '/new-po' }} />

              <MetricStrip label="Purchase orders at a glance" items={[
                { label: 'Pieces coming', value: String(coming), sub: plural(placed.length, 'order') },
                { label: 'Unpaid', value: money(owing.reduce((a, r) => a + r.total - r.paid, 0)), sub: plural(owing.length, 'order') },
                { label: 'Overdue', value: money(late.reduce((a, r) => a + r.total - r.paid, 0)), sub: plural(late.length, 'order') },
              ]} />

              {waiting.some(mayDecide) && tab !== 'approval' ? (
                <div className="gc-alert gc-alert--soft gc-alert--warning po-wait" role="status">
                  <Icon name="clock" width="18" height="18" aria-hidden="true" />
                  <span>{plural(waiting.filter(mayDecide).length, 'order')} waiting for your approval.</span>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => setTab('approval')}>Review</button>
                </div>
              ) : null}

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
                          <span className="ix-pitem__tags"><StatusBadge tone={r.label === 'Rejected' ? 'error' : TONE[r.s]}>{r.label || NAMES[r.s]}</StatusBadge></span>
                        </Link>
                        {mayDecide(r) ? <span className="po-acts po-acts--phone"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setRejecting(r)}>Reject</button><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => approve(r)}>Approve</button></span> : null}
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
                          {waiting.some(mayDecide) ? <th scope="col"><span className="sr-only">Approve or reject</span></th> : null}
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
                              <td><StatusBadge tone={r.label === 'Rejected' ? 'error' : TONE[r.s]}>{r.label || NAMES[r.s]}</StatusBadge></td>
                              <td className="ix-num ix-muted">{r.got} / {r.of}</td>
                              <td className="ix-num">{money(r.total)}</td>
                              <td className={pay.cls}>{pay.text}</td>
                              {waiting.some(mayDecide) ? <td>{mayDecide(r) ? <span className="po-acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setRejecting(r)}>Reject</button><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => approve(r)}>Approve</button></span> : null}</td> : null}
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
              <ReasonDialog open={!!rejecting} onClose={() => setRejecting(null)} onSubmit={reject} danger title={rejecting ? `Reject ${rejecting.no}?` : ''}
                body={rejecting ? `It goes back to ${rejecting.by || 'the person who made it'} as a draft, with your reason.` : ''} label="Reason" confirmLabel="Reject" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
