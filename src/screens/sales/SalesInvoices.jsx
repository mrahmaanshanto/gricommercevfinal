'use client';
// Invoices — one simple list. An invoice is a sale from New sale made out to a customer; it is only
// ever Unpaid or Paid. Record the payment and it becomes Paid (a completed sale and order).
// Laid out like Shopify's lists (components/ui/IndexKit.jsx): summary tabs (All · Unpaid · Partly paid · Paid with
// their counts; ?tab= opens one), search and a compact table. Taking a payment, editing, holding stock and sending
// the invoice are on the invoice page (/sales-invoice?id=), which a click on the row opens.
// Front end only: the rows come from src/lib/invoices.js (POS sales plus demo invoices).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { getInvoices, isPaid, statusOf, stageOf, STAGES } from '@/lib/invoices';
import { wholesaleOn } from '@/lib/edition';

const TABS = [['all', 'All'], ['review', 'To accept'], ['unpaid', 'Unpaid'], ['partial', 'Partly paid'], ['paid', 'Paid']];
const STATUS = { paid: ['Paid', 'success'], partial: ['Partly paid', 'info'], unpaid: ['Unpaid', 'warning'], review: ['To accept', 'warning'] };
// an unpaid invoice is accepted by staff before money is recorded against it (invoices.js › acceptInvoice)
const Stage = ({ r }) => (stageOf(r) === 'review' ? <StatusBadge tone={STAGES.review.tone} icon={STAGES.review.icon}>{STAGES.review.label}</StatusBadge> : null);
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const hrefOf = (r) => '/sales-invoice?id=' + encodeURIComponent(r.id);
const unitsOf = (r) => r.lines.reduce((a, l) => a + l.qty, 0);

const CSS = `
.iv-id{font-family:var(--font-data)}
.iv-due{color:var(--text-danger)}
`;

export default function SalesInvoices() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');   // '' | 'wholesale' | 'retail'

  useEffect(() => {
    setRows(getInvoices());
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
  }, []);

  const by = (st) => rows.filter((r) => (st === 'review' ? stageOf(r) === 'review' : statusOf(r) === st));
  const counts = { all: rows.length, review: by('review').length, unpaid: by('unpaid').length, partial: by('partial').length, paid: by('paid').length };
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (tab === 'all' ? rows : by(tab))
      .filter((r) => !kind || (kind === 'wholesale' ? r.wholesale : !r.wholesale))
      .filter((r) => !text || (r.id + ' ' + (r.customer.name || '') + ' ' + (r.customer.phone || '')).toLowerCase().includes(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tab, q, kind]);
  const who = (r) => r.customer.name || 'Walk-in customer';
  const searching = find || !!q || !!kind;
  const closeFind = () => { setFind(false); setQ(''); setKind(''); };
  const sum = (list, f) => list.reduce((a, r) => a + f(r), 0);
  // the foot says what the rows shown add up to: paid money on the Paid tab, what is still due on the others
  const footMoney = tab === 'paid' ? money(sum(shown, (r) => r.totals.total)) + ' paid' : money(sum(shown, (r) => Math.max(0, r.due))) + ' due';
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'iv-tab-' + id, label, count: counts[id], on: tab === id, onClick: () => setTab(id) }));

  return (
    <div className="dc-screen ds" data-screen="SalesInvoices">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="sales-invoices" />
        <main className="gc-shell__main">
          <Topbar crumb="Sales" page="Invoices" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="file-text" title="Invoices"
                about="Every sale made out to a customer: paid, partly paid or unpaid. An unpaid invoice is accepted by staff first, then its payment is recorded. Open an invoice to accept it, take a payment, edit it or send it."
                more={[...(wholesaleOn() ? [{ label: 'Wholesale orders', href: '/wholesale-orders' }] : []), { label: 'Dues', href: '/dues' }, { label: 'Return & exchange', href: '/return-exchange' }]}
                primary={{ label: 'New sale', href: '/pos' }} />

              <section className="ix-card" aria-label="Invoices">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer or invoice no." onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Invoices by payment" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    {wholesaleOn() ? <select aria-label="Customer type" className={'ix-filter' + (kind ? ' is-set' : '')} value={kind} onChange={(e) => setKind(e.target.value)}>
                      <option value="">Customer type</option><option value="retail">Retail</option><option value="wholesale">Wholesale</option>
                    </select> : null}
                    {q || kind ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setKind(''); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {shown.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="file-text" title={q || kind ? 'No invoice matches that search' : tab === 'all' ? 'No invoice yet' : `No ${STATUS[tab][0].toLowerCase()} invoice`} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Invoices">
                    {shown.map((r) => (
                      <li key={r.src + r.id}>
                        <Link href={hrefOf(r)} className="ix-pitem">
                          <span className="ix-pitem__top"><b>{who(r)}</b><span>{money(r.totals.total)}</span></span>
                          <span className="ix-pitem__mid"><span className="iv-id">{r.id}</span> · {formatDate(r.at)}{isPaid(r) ? '' : ' · ' + money(r.due) + ' due'}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={STATUS[statusOf(r)][1]}>{STATUS[statusOf(r)][0]}</StatusBadge><Stage r={r} /></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Invoices, {shown.length} shown</caption>
                      <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col">Customer</th><th scope="col" className="ix-num">Total</th><th scope="col" className="ix-num">Due</th><th scope="col">Status</th><th scope="col" className="ix-num">Items</th></tr></thead>
                      <tbody>
                        {shown.map((r) => (
                          <tr key={r.src + r.id} onClick={(e) => { if (!e.target.closest('a,button')) navigate(hrefOf(r)); }}>
                            <td><Link href={hrefOf(r)} className="ix-strong iv-id">{r.id}</Link></td>
                            <td className="ix-muted">{formatDate(r.at)}</td>
                            <td>{who(r)}</td>
                            <td className="ix-num">{money(r.totals.total)}</td>
                            <td className={'ix-num' + (isPaid(r) ? ' ix-muted' : ' iv-due')}>{isPaid(r) ? '—' : money(r.due)}</td>
                            <td><span style={{ display: 'inline-flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}><StatusBadge tone={STATUS[statusOf(r)][1]}>{STATUS[statusOf(r)][0]}</StatusBadge><Stage r={r} /></span></td>
                            <td className="ix-num ix-muted">{unitsOf(r)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{shown.length === 1 ? '1 invoice' : shown.length + ' invoices'} · {footMoney}</span></div>
              </section>
              <LearnMore topic="invoices" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
