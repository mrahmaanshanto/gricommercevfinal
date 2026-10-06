'use client';
// Purchases (/purchases) — everything bought from suppliers: direct purchases (New purchase, /buy-goods) and the bills
// from received purchase orders. Laid out like Shopify's index pages (components/ui/IndexKit.jsx): title row, what is
// owed, then one card with the payment views (All · To pay · Overdue · Paid), search and a supplier filter, and a
// compact table. A row opens the purchase in a side panel: items, payments, what is left and when, and Pay.
// Data: src/lib/supplierBills.js (bills, payments). Text stays short.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { getDb, billLeft, billStatus, BILL_TONE, supplierById, paySupplier, dayStart, daysFrom } from '@/lib/supplierBills';
import { accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { ModuleSetup } from '@/components/ModuleSetup';

const TABS = [['all', 'All'], ['open', 'To pay'], ['overdue', 'Overdue'], ['paid', 'Paid']];
const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

const CSS = `
.pu-id{font-family:var(--font-data)}
.pu-idbtn{padding:0;border:0;background:none;font-size:inherit;cursor:pointer}
.pu-sup{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis}
.pu-pbtn{width:100%;border-top:0;border-left:0;border-right:0;background:none;font:inherit;text-align:left;cursor:pointer}
.pu-sheet{display:flex;flex-direction:column;gap:var(--space-4)}
.pu-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-xs-plus);color:var(--text-muted)}
.pu-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.pu-lines td{padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);vertical-align:top}
.pu-lines td:last-child{text-align:right;font-family:var(--font-data);white-space:nowrap;padding-left:var(--space-3)}
.pu-lines small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pu-links{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.pu-pay{display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.pu-methods{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.pu-methods button{height:28px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);cursor:pointer}
.pu-methods button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.pu-acts{display:flex;gap:var(--space-2)}
@media (max-width:640px){.pu-methods button{height:36px}}
`;

export default function Purchases() {
  const [db, setDb] = useState(null);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sup, setSup] = useState('');           // supplier filter (id)
  const [find, setFind] = useState(false);      // search and filters open
  const [open, setOpen] = useState(null);       // bill no. in the side panel
  const [pay, setPay] = useState(null);         // { amount, method, account }
  useEffect(() => { setDb(getDb()); }, []);
  const reload = () => setDb(getDb());

  const rows = useMemo(() => {
    if (!db) return [];
    const today = dayStart();
    return db.bills.map((b) => {
      const s = supplierById(b.supplier, db.suppliers) || { id: b.supplier, name: b.supplier };
      const st = billStatus(b, today);
      return { ...b, sup: s, st, left: billLeft(b), items: (b.lines || []).reduce((a, l) => a + (Number(l.qty) || 0), 0) };
    }).sort((a, b) => b.at - a.at);
  }, [db]);
  const inTab = (r, t) => (t === 'all' ? true : t === 'paid' ? r.st === 'Paid' : t === 'overdue' ? r.st === 'Overdue' : r.left > 0);
  const query = q.trim().toLowerCase();
  const shown = rows.filter((r) => inTab(r, tab) && (!sup || r.sup.id === sup)
    && (!query || [r.no, r.ref, r.sup.name, ...(r.lines || []).map((l) => l.name)].join(' ').toLowerCase().includes(query)));
  const suppliers = [...new Map(rows.map((r) => [r.sup.id, r.sup.name])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const sel = open ? rows.find((r) => r.no === open) : null;
  const searching = find || !!q || !!sup;
  const hasFilters = !!(q || sup);
  const closeFind = () => { setFind(false); setQ(''); setSup(''); };
  const clearFilters = () => { setQ(''); setSup(''); };
  const openRow = (r) => { setOpen(r.no); setPay(null); };

  const owed = rows.filter((r) => r.left > 0);
  const late = rows.filter((r) => r.st === 'Overdue');

  const startPay = (r) => {
    const acc = accountsForMethod('Cash')[0];
    setPay({ amount: String(r.left), method: 'Cash', account: acc ? acc.id : '' });
  };
  const doPay = (e) => {
    e.preventDefault();
    const amount = Math.round(Number(pay.amount) || 0);
    if (!(amount > 0) || amount > sel.left || !pay.account) return;
    paySupplier({ supplier: sel.supplier, bills: [sel.no], amount, method: pay.method, account: pay.account, ref: sel.ref || '' });
    setPay(null); reload();
    toast('Payment saved');
  };
  const entries = pay ? getEntries() : [];
  const accounts = pay ? accountsForMethod(pay.method).map((a) => ({ ...a, balance: balanceOf(a.id, entries) })) : [];

  return (
    <div className="dc-screen ds" data-screen="Purchases">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-buy" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Purchases" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="shopping-bag" title="Purchases"
                about="What you bought and what you still owe."
                more={[{ label: 'Suppliers & payables', href: '/suppliers' }, { label: 'Return goods', href: '/supplier-return' }]}
                primary={{ label: 'New purchase', href: '/buy-goods' }} />

              {db ? (<>
                <ModuleSetup area="purchases" />
                <MetricStrip label="What you owe" items={[
                  { label: 'To pay', value: money(owed.reduce((a, r) => a + r.left, 0)), sub: plural(owed.length, 'bill') },
                  { label: 'Overdue', value: money(late.reduce((a, r) => a + r.left, 0)), sub: plural(late.length, 'bill') },
                  { label: 'Bought', value: money(rows.reduce((a, r) => a + (r.amount || 0), 0)), sub: plural(rows.length, 'purchase') },
                ]} />

                <section className="ix-card" aria-label="Purchases">
                  <div className="ix-bar">
                    {searching ? (<>
                      <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search supplier, bill or product" onDone={closeFind} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                    </>) : (<>
                      <IndexTabs label="Purchases by payment" tabs={TABS.map(([id, label]) => ({ key: id, id: 'pu-tab-' + id, label, count: rows.filter((r) => inTab(r, id)).length, on: tab === id, onClick: () => setTab(id) }))} />
                      <span className="ix-tools">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                      </span>
                    </>)}
                  </div>
                  {searching ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Supplier" className={'ix-filter' + (sup ? ' is-set' : '')} value={sup} onChange={(e) => setSup(e.target.value)}>
                        <option value="">Supplier</option>
                        {suppliers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                      </select>
                      {hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearFilters}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {shown.length ? (<>
                    <ul className="ix-plist" aria-label="Purchases">
                      {shown.map((r) => (
                        <li key={r.no}>
                          <button type="button" className="ix-pitem pu-pbtn" onClick={() => openRow(r)}>
                            <span className="ix-pitem__top"><b>{r.sup.name}</b><span>{money(r.amount)}</span></span>
                            <span className="ix-pitem__mid">{formatDate(r.at)} · {r.no}{r.left > 0 ? ' · ' + money(r.left) + ' left' : ''}</span>
                            <span className="ix-pitem__tags"><StatusBadge tone={BILL_TONE[r.st]}>{r.st}</StatusBadge></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Purchases</caption>
                        <thead>
                          <tr>
                            <th scope="col">Bill</th>
                            <th scope="col">Date</th>
                            <th scope="col">Supplier</th>
                            <th scope="col">Status</th>
                            <th scope="col" className="ix-num">Items</th>
                            <th scope="col" className="ix-num">Total</th>
                            <th scope="col" className="ix-num">Left to pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shown.map((r) => (
                            <tr key={r.no} onClick={(e) => { if (!e.target.closest('a,button')) openRow(r); }}>
                              <td><button type="button" className="ix-strong pu-id pu-idbtn" onClick={() => openRow(r)}>{r.no}</button></td>
                              <td className="ix-muted">{formatDate(r.at)}</td>
                              <td><span className="pu-sup">{r.sup.name}</span></td>
                              <td><StatusBadge tone={BILL_TONE[r.st]}>{r.st}</StatusBadge></td>
                              <td className="ix-num ix-muted">{r.items || '—'}</td>
                              <td className="ix-num">{money(r.amount)}</td>
                              <td className={'ix-num' + (r.st === 'Overdue' ? ' ix-bad' : '')}>{r.left > 0 ? money(r.left) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>) : (
                    <div className="ix-empty">
                      <EmptyState icon="shopping-bag" title={hasFilters ? 'No purchase matches these filters' : 'No purchases here'}
                        actionLabel={hasFilters ? 'Clear filters' : undefined} onAction={hasFilters ? clearFilters : undefined} />
                    </div>
                  )}
                  <div className="ix-foot"><span>{plural(shown.length, 'purchase')}</span></div>
                </section>
                <LearnMore topic="purchases" />
              </>) : null}
            </div>
          </div>
        </main>
      </div>

      <Sheet open={!!sel} title={sel ? sel.sup.name : ''} onClose={() => { setOpen(null); setPay(null); }}
        footer={sel && sel.left > 0 && !pay ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => startPay(sel)}>Pay</button> : null}>
        {sel ? (
          <div className="pu-sheet">
            <p className="pu-meta"><span>{formatDate(sel.at)} · <span className="pu-id">{sel.no}</span>{sel.ref && sel.ref !== sel.no ? ' · ' + sel.ref : ''}</span><StatusBadge tone={BILL_TONE[sel.st]}>{sel.st}</StatusBadge></p>
            {(sel.lines || []).length ? (
              <table className="pu-lines"><tbody>{sel.lines.map((l, i) => <tr key={i}><td>{l.name}<small>{l.qty} × {money(l.cost)}</small></td><td>{money(l.qty * l.cost)}</td></tr>)}</tbody></table>
            ) : null}
            <KV rows={[
              sel.extra ? ['Transport & other', money(sel.extra)] : null,
              sel.discount ? ['Discount', '−' + money(sel.discount)] : null,
              ['Total', money(sel.amount)],
              ['Paid', money(sel.paid || 0)],
              sel.credited ? ['Returned (credit)', money(sel.credited)] : null,
              [sel.left > 0 ? 'Left to pay' : 'Settled', <b key="left" className="ix-strong">{money(sel.left)}</b>],
              sel.left > 0 ? ['Pay by', formatDate(sel.due) + (daysFrom(sel.due) < 0 ? ' · overdue' : '')] : null,
            ]} />
            {sel.direct && sel.returnable === false ? <p className="gc-help" style={{ margin: 0 }}>Supplier takes no returns on this purchase.</p> : null}
            <div className="pu-links">
              <Link href={'/supplier-detail?id=' + encodeURIComponent(sel.supplier)} className="ix-btn ix-btn--sm">Supplier</Link>
              {sel.po ? <Link href={'/po-detail?no=' + encodeURIComponent(sel.po)} className="ix-btn ix-btn--sm pu-id">{sel.po}</Link> : null}
            </div>
            {pay ? (
              <form onSubmit={doPay} className="pu-pay">
                <div><label className="gc-label" htmlFor="pu-amt">Amount (৳)</label><input id="pu-amt" className="gc-input" type="number" inputMode="numeric" min="1" max={sel.left} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></div>
                <div className="pu-methods" role="group" aria-label="Paid by">{METHODS.map((m) => <button key={m} type="button" aria-pressed={pay.method === m} onClick={() => { const a = accountsForMethod(m)[0]; setPay({ ...pay, method: m, account: a ? a.id : '' }); }}>{m}</button>)}</div>
                {accounts.length > 1 ? <div><label className="gc-label" htmlFor="pu-acc">From</label><select id="pu-acc" className="gc-input gc-select" value={pay.account} onChange={(e) => setPay({ ...pay, account: e.target.value })}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {money(a.balance)}</option>)}</select></div> : null}
                <div className="pu-acts"><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPay(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!(Number(pay.amount) > 0 && Number(pay.amount) <= sel.left && pay.account)}>Save payment</button></div>
              </form>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
