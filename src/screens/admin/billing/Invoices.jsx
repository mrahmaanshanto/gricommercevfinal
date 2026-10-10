'use client';
// Invoices (/admin/invoices) — every bill GridCommerce has sent its stores, laid out like the merchant panel's Invoices
// list (src/screens/sales/SalesInvoices.jsx): the title row (Export, Record payment), one card with the views as tabs
// (All · Due · Overdue · Paid · Credited / void, counts on the tabs), search and filters (package, method, month), a bulk
// bar (send pay links, export), a compact table (a two-line list on phones) and the pager with the amounts in its foot.
// A row opens the bill (/admin/invoices/view?id=INV-…).
// Data: lib/platform (db.invoices, billing › balance / lastPayment / paidVia / sendPayLinks). Worked out after the saved
// data loads (usePlatform().live); the view, search and filters live in the address (?tab=overdue&pkg=retail …).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, Menu } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dm, dmy } from '@/lib/platform/util';
import { LADDERS, METHODS, ladderLabel, PLAN_NAME } from '@/lib/platform/catalogue';
import { shopOf, subOf, balance, lastPayment, paidVia, sendPayLinks } from '@/lib/platform/billing';
import { AdminShell, usePlatform } from '../AdminShell';
import { BILL_CSS, Skeleton, BillBadge, billState, money, plural, periodText } from './billingShared';

const PAGE = 20;
const TABS = [['all', 'All'], ['due', 'Due'], ['overdue', 'Overdue'], ['paid', 'Paid'], ['credited', 'Credited / void']];
const FILTER_KEYS = ['pkg', 'method', 'month'];
const AUTO = 'Auto-charge';

/** Every bill as a list row. */
function billRows(db, t) {
  return db.invoices.map((inv) => {
    const shop = shopOf(db, inv.shopId);
    const sub = subOf(db, inv.shopId);
    const st = billState(db, inv, t);
    const p = lastPayment(db, inv.id);
    return {
      id: inv.id, shopId: inv.shopId, store: shop ? shop.name : '#' + inv.shopId, owner: shop && shop.owner ? (shop.owner.name || shop.owner) : '',
      ladder: sub ? sub.ladder : '', pkg: sub ? `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}` : '—',
      period: inv.period, periodText: periodText(inv.period), amount: inv.total, dueAt: inv.dueAt, issuedAt: inv.issuedAt,
      st, tab: st.tab, balance: balance(db, inv),
      method: st.key === 'nocharge' ? '' : p ? (p.via === 'auto' ? AUTO : p.method) : '', via: st.key === 'nocharge' ? 'Trial' : p ? paidVia(p) : '—',
    };
  }).sort((a, b) => b.issuedAt - a.issuedAt || b.id.localeCompare(a.id));
}

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const tab = TABS.some(([k]) => k === p.get('tab')) ? p.get('tab') : 'all';
  const f = {};
  for (const k of FILTER_KEYS) f[k] = p.get(k) || '';
  return { tab, q: p.get('q') || '', f };
}
function toUrl({ tab, q, f }) {
  const p = new URLSearchParams();
  if (tab !== 'all') p.set('tab', tab);
  if (q.trim()) p.set('q', q.trim());
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const csvRows = (rows) => [
  ['Invoice', 'Store ID', 'Store', 'Package', 'Period', 'Amount (BDT)', 'Issued', 'Due', 'State', 'Balance (BDT)', 'Paid via'],
  ...rows.map((r) => [r.id, '#' + r.shopId, r.store, r.pkg, r.periodText, r.amount, dmy(r.issuedAt), dmy(r.dueAt), r.st.label, r.balance, r.via]),
];

export default function Invoices() {
  const router = useRouter();
  const { db, t, live } = usePlatform();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ pkg: '', method: '', month: '' });
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(() => new Set());
  const first = useRef(true);

  useEffect(() => { const s = fromUrl(); setTab(s.tab); setQ(s.q); setF(s.f); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ tab, q, f });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, tab, q, f]);

  let all = [];
  let error = null;
  if (live) { try { all = billRows(db, t); } catch (e) { error = e; } }
  const counts = { all: all.length };
  for (const [k] of TABS.slice(1)) counts[k] = all.filter((r) => r.tab === k).length;
  const months = [...new Set(all.map((r) => r.period))].sort().reverse();

  const s = q.trim().toLowerCase();
  const filtered = all.filter((r) => {
    if (tab !== 'all' && r.tab !== tab) return false;
    if (f.pkg && r.ladder !== f.pkg) return false;
    if (f.method && r.method !== f.method) return false;
    if (f.month && r.period !== f.month) return false;
    if (!s) return true;
    return [r.id, r.store, '#' + r.shopId, r.shopId, r.owner].join(' ').toLowerCase().includes(s);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const billed = filtered.reduce((a, r) => a + r.amount, 0);
  const owed = filtered.reduce((a, r) => a + r.balance, 0);

  const selRows = filtered.filter((r) => sel.has(r.id));
  const allOnPage = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id) => setSel((old) => { const n = new Set(old); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel((old) => { const n = new Set(old); if (allOnPage) rows.forEach((r) => n.delete(r.id)); else rows.forEach((r) => n.add(r.id)); return n; });
  const clearSel = () => setSel(new Set());

  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clearFilters = () => { setQ(''); setF({ pkg: '', method: '', month: '' }); };
  const setFilter = (k) => (v) => setF((old) => ({ ...old, [k]: v }));
  const open = (id) => router.push('/admin/invoices/view?id=' + encodeURIComponent(id));
  const tabLabel = (TABS.find(([k]) => k === tab) || [])[1] || 'All';

  const exportCsv = (which, name) => {
    if (!which.length) { toast('Nothing to export'); return; }
    downloadCsv(name, csvRows(which));
    toast(plural(which.length, 'invoice') + ' exported');
  };
  const doPayLinks = () => {
    const stores = [...new Set(selRows.filter((r) => r.balance > 0).map((r) => r.shopId))];
    if (!stores.length) { toast('None of the selected bills is unpaid'); return; }
    let n = 0;
    for (const id of stores) if (((sendPayLinks(id) || {}).count || 0) > 0) n++;
    clearSel();
    toast(n ? `Pay links sent to ${plural(n, 'store')}` : 'No selected bill is due yet, so no link was sent');
  };

  const sendAll = async () => {
    const n = all.filter((r) => r.balance > 0 && r.dueAt - 7 * 864e5 <= t).length;
    if (!n) { toast('No bill is due yet'); return; }
    if (!(await confirmDialog({ title: `Send pay links for ${plural(n, 'unpaid bill')}?`, body: 'Each store gets an SMS with a link to pay, and a reminder in its panel.', confirmLabel: 'Send links' }))) return;
    const r = sendPayLinks() || {};
    toast(r.count ? `Pay links sent for ${plural(r.count, 'bill')}` : 'No bill is due yet');
  };

  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'inv-tab-' + k, label, count: live && !error ? counts[k] || 0 : null, on: tab === k, onClick: () => { setTab(k); clearSel(); } }));
  const filters = [
    { key: 'pkg', label: 'Package', all: 'All packages', value: f.pkg, options: LADDERS.map((l) => [l.id, l.label]), onChange: setFilter('pkg') },
    { key: 'method', label: 'Method', all: 'All methods', value: f.method, options: [...METHODS, AUTO].map((m) => [m, m]), onChange: setFilter('method') },
    { key: 'month', label: 'Month', all: 'All months', value: f.month, options: months.map((m) => [m, periodText(m)]), onChange: setFilter('month') },
  ];

  let body;
  if (!live) body = <Skeleton label="Loading invoices" />;
  else if (error) {
    body = (
      <section className="ix-card"><div className="bl-err" role="alert">
        <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
        <p style={{ margin: 0 }}>The invoices could not be worked out.</p>
        <button type="button" className="ix-btn" onClick={() => window.location.reload()}>Try again</button>
      </div></section>
    );
  } else {
    const footLabel = (
      <span className="bl-foot">
        <span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 invoices'}</span>
        {billed ? <span>Billed <b>{money(billed)}</b></span> : null}
        {owed ? <span>Owed <b>{money(owed)}</b></span> : null}
      </span>
    );
    body = (
      <section className="ix-card" aria-label={tabLabel + ' invoices'}>
        {selRows.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected invoices">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every invoice on this page" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{selRows.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={doPayLinks}><Icon name="send" width="16" height="16" aria-hidden="true" />Send pay links</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => exportCsv(selRows, 'gridcommerce-invoices-selected.csv')}><Icon name="download" width="16" height="16" aria-hidden="true" />Export selected</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Clear selection', onClick: clearSel }]} />
          </div>
        ) : (
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Invoice views" /></div>
        )}
        <div className="bl-filters">
          <FilterBar label="Filter invoices" filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search invoice, store, ID or owner' }} />
        </div>

        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn
              ? <EmptyState title="No invoices match these filters." actionLabel="Clear filters" onAction={clearFilters} />
              : <EmptyState icon="receipt" title={`No ${tabLabel.toLowerCase()} invoices.`} actionLabel="Show all invoices" onAction={() => setTab('all')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={tabLabel + ' invoices'}>
              {rows.map((r) => (
                <li key={r.id}>
                  <Link href={'/admin/invoices/view?id=' + encodeURIComponent(r.id)} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{r.store}</b><span className="bl-fig">{money(r.balance || r.amount)}</span></span>
                    <span className="ix-pitem__mid"><span className="ix-id">{r.id}</span> · {r.periodText} · due {dm(r.dueAt)}</span>
                    <span className="ix-pitem__tags"><BillBadge st={r.st} />{r.via !== '—' ? <span className="ix-pitem__mid">{r.via}</span> : null}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{tabLabel} invoices</caption>
                <thead>
                  <tr>
                    <th scope="col" className="ix-check"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every invoice on this page" /></th>
                    <th scope="col">Invoice</th>
                    <th scope="col">Store</th>
                    <th scope="col">Period</th>
                    <th scope="col" className="ix-num">Amount</th>
                    <th scope="col">Due</th>
                    <th scope="col">State</th>
                    <th scope="col" className="ix-num">Balance</th>
                    <th scope="col">Paid via</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={sel.has(r.id) ? 'is-sel' : ''} tabIndex={0}
                      onClick={() => open(r.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(r.id); }}>
                      <td className="ix-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} aria-label={'Select ' + r.id} /></td>
                      <td className="ix-nowrap"><Link href={'/admin/invoices/view?id=' + encodeURIComponent(r.id)} className="ix-id ix-strong" onClick={(e) => e.stopPropagation()}>{r.id}</Link></td>
                      <td>
                        <span className="bl-name">
                          <Link href={'/admin/merchant?id=' + r.shopId} onClick={(e) => e.stopPropagation()}>{r.store}</Link>
                          <small>#{r.shopId} · {r.pkg}</small>
                        </span>
                      </td>
                      <td className="ix-nowrap">{r.periodText}</td>
                      <td className="ix-num"><span className="bl-fig">{money(r.amount)}</span></td>
                      <td className={'ix-nowrap' + (r.st.tab === 'overdue' ? ' bl-bad' : ' ix-muted')}>{dm(r.dueAt)}</td>
                      <td><BillBadge st={r.st} /></td>
                      <td className="ix-num"><span className={'bl-fig' + (r.balance ? '' : ' bl-muted')}>{money(r.balance)}</span></td>
                      <td className="ix-muted ix-nowrap">{r.via}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={footLabel} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="invoices" title="Invoices">
      <style dangerouslySetInnerHTML={{ __html: BILL_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="receipt" title="Invoices"
          about="Every bill GridCommerce has sent its stores. A bill is issued 7 days before the store's billing day; unpaid, the store has 7 days of grace, is read-only from day 8 and suspended from day 15. Bills are never edited: corrections are credit notes (Credits & adjustments). Open a bill to record a payment, send a pay link, ask for an adjustment or print it."
          secondary={[{ label: 'Export', icon: 'download', onClick: () => exportCsv(filtered, `gridcommerce-invoices-${tab}.csv`) }]}
          more={[{ label: 'Collections call list', href: '/admin/collections' }, { label: 'Credits & adjustments', href: '/admin/credits' }]}
          primary={{ label: 'Send due pay links', icon: 'send', onClick: sendAll }} />
        {body}
      </div>
    </AdminShell>
  );
}
