'use client';
// WholesaleOrders — the wholesale orders and their delivery: taken or not, how many pieces sent,
// partial or full, and from where. Each delivery prints a challan / gate pass once saved.
// The orders themselves are still made in New sale; this page only follows them up.
// Front end only: rows are the wholesale invoices from src/lib/invoices.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getInvoices, deliveryOf, statusOf, isPaid } from '@/lib/invoices';
import { INVOICE_STATUS as PAY, PAPER_CSS } from './InvoicePaper';
import { DeliveryDialog, DELIVERY, DELIVERY_CSS } from './DeliveryDialog';

const TABS = [['all', 'All wholesale orders'], ['none', 'Not delivered'], ['partial', 'Partly delivered'], ['full', 'Delivered in full']];
const TAB_DOT = { all: 'var(--primary)', none: 'var(--fill-warning)', partial: 'var(--fill-info)', full: 'var(--fill-success)' };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });

const CSS = PAPER_CSS + DELIVERY_CSS + `
.wo-card{overflow:hidden}
.wo-card .gc-table th,.wo-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.wo-card .gc-table th:first-child,.wo-card .gc-table td:first-child{padding-left:var(--space-5)}
.wo-card .gc-table th:last-child,.wo-card .gc-table td:last-child{padding-right:var(--space-4)}
.wo-card .gc-badge,.wo-card .gc-btn,.wo-num,.wo-id{white-space:nowrap}
.wo-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.wo-count{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wo-search{position:relative;flex:0 1 300px}
@media (max-width:640px){.wo-bar{padding:var(--space-3)}.wo-count{display:none}.wo-search{flex:1 1 100%}}
.wo-search svg{position:absolute;left:12px;top:13px;color:var(--text-muted);pointer-events:none}
.wo-search input{padding-left:38px}
.wo-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.wo-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.wo-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary)}
.wo-num{text-align:right;font-variant-numeric:tabular-nums}
.wo-prog{display:block;width:120px;height:6px;margin-top:6px;border-radius:var(--radius-full);background:var(--slate-200);overflow:hidden}
.wo-prog i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.wo-prog i.is-full{background:var(--fill-success)}
.wo-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
`;

export default function WholesaleOrders() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [deliver, setDeliver] = useState(null);

  const reload = () => setRows(getInvoices().filter((r) => r.wholesale));
  useEffect(() => { reload(); }, []);

  const of = (st) => rows.filter((r) => deliveryOf(r).status === st);
  const counts = { all: rows.length, none: of('none').length, partial: of('partial').length, full: of('full').length };
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (tab === 'all' ? rows : of(tab)).filter((r) => !text || (r.id + ' ' + r.customer.name + ' ' + r.customer.phone).toLowerCase().includes(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tab, q]);

  return (
    <div className="dc-screen ds" data-screen="WholesaleOrders">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-wholesale" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Orders" page="Wholesale orders" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Wholesale orders"
              description="Follow each wholesale order: whether the customer has taken delivery, how many pieces went out, and what is still to pay."
              actions={<>
                <Link href="/merchant-orders" className="gc-btn gc-btn--neutral"><Icon name="inbox" width="18" height="18" aria-hidden="true" /> All orders</Link>
                <Link href="/pos" className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> New sale</Link>
              </>}
            />

            <div className="gc-stattabs" role="tablist" aria-label="Wholesale orders by delivery">
              {TABS.map(([id, label]) => {
                const list = id === 'all' ? rows : of(id);
                const left = list.reduce((a, r) => a + deliveryOf(r).left, 0);
                const sub = id === 'all' ? money(rows.reduce((a, r) => a + r.totals.total, 0)) : id === 'full' ? money(list.reduce((a, r) => a + r.totals.total, 0)) : `${left} pcs to send`;
                return (
                  <button key={id} type="button" role="tab" aria-selected={tab === id} className="gc-stattab" onClick={() => setTab(id)}>
                    <span className="gc-stattab__label"><i className="gc-stattab__dot" style={{ background: TAB_DOT[id] }} />{label}</span>
                    <span className="gc-stattab__nums"><b>{counts[id]}</b><small>{sub}</small></span>
                  </button>
                );
              })}
            </div>

            <section className="gc-card wo-card">
              <div className="wo-bar">
                <p className="wo-count">{TABS.find((x) => x[0] === tab)[1]} · {shown.length}</p>
                <label className="wo-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" type="search" placeholder="Search customer or order no." aria-label="Search customer or order number" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              </div>
              {shown.length === 0 ? <EmptyState icon="truck" title={q ? 'No order matches that search' : 'No order in this group'} body={q ? 'Try the customer’s name, mobile number or the order number.' : 'Wholesale orders appear here when a sale is made to a wholesale customer in New sale.'} /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Date</th><th scope="col" className="wo-num">Total</th><th scope="col">Payment</th><th scope="col">Delivery</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {shown.map((r) => {
                        const d = deliveryOf(r), last = (r.deliveries || [])[(r.deliveries || []).length - 1];
                        return (
                          <tr key={r.src + r.id}>
                            <td><Link href={'/sales-invoice?id=' + encodeURIComponent(r.id)} className="wo-id" aria-label={`Open order ${r.id}`}>{r.id}</Link></td>
                            <td><span className="wo-strong">{r.customer.name}</span><span className="wo-sub">{r.customer.phone}</span></td>
                            <td>{formatDate(r.at)}<span className="wo-sub">{r.lines.length} product{r.lines.length === 1 ? '' : 's'}</span></td>
                            <td className="wo-num"><span className="wo-strong">{money(r.totals.total)}</span>{isPaid(r) ? null : <span className="wo-sub">{money(r.due)} due</span>}</td>
                            <td><span className={'gc-badge gc-badge--' + PAY[statusOf(r)][1]}>{PAY[statusOf(r)][0]}</span></td>
                            <td>
                              <span className={'gc-badge gc-badge--' + DELIVERY[d.status][1]}>{DELIVERY[d.status][0]}</span>
                              <span className="wo-sub">{d.sent} of {d.total} pcs sent{last ? ` · last ${formatDate(last.at)}${last.from ? ' from ' + last.from : ''}` : ''}</span>
                              <span className="wo-prog" role="progressbar" aria-label={`Delivered ${d.sent} of ${d.total} pieces`} aria-valuemin="0" aria-valuemax={d.total} aria-valuenow={d.sent}><i className={d.status === 'full' ? 'is-full' : ''} style={{ width: (d.total ? Math.round(100 * d.sent / d.total) : 0) + '%' }} /></span>
                            </td>
                            <td><div className="wo-actions">
                              {d.status !== 'full' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setDeliver(r)}><Icon name="truck" width="16" height="16" aria-hidden="true" /> Deliver</button> : null}
                              <Link href={'/sales-invoice?id=' + encodeURIComponent(r.id)} className="gc-btn gc-btn--sm gc-btn--neutral">View</Link>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
      <DeliveryDialog inv={deliver} onClose={() => setDeliver(null)} onDone={() => { setDeliver(null); reload(); }} />
    </div>
  );
}
