'use client';
// Purchases (/purchases) — everything bought from suppliers: direct purchases (New purchase, /buy-goods) and the bills
// from received purchase orders. Summary tabs: All · To pay · Overdue · Paid. A row opens the purchase: items, payments,
// what is left and when, and Pay. Data: src/lib/supplierBills.js (bills, payments). Text stays short.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getDb, billLeft, billStatus, BILL_TONE, supplierById, paySupplier, dayStart, daysFrom } from '@/lib/supplierBills';
import { accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';

const TABS = [['all', 'All', 'var(--primary)'], ['open', 'To pay', 'var(--warning)'], ['overdue', 'Overdue', 'var(--error)'], ['paid', 'Paid', 'var(--success)']];
const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
const money = (n) => formatBDT(Math.round(Number(n) || 0));

const CSS = `
.pu-tools{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.pu-tools .gc-input{max-width:340px}
.pu-list{display:flex;flex-direction:column}
.pu-row{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) auto auto;align-items:center;gap:var(--space-4);min-height:64px;padding:var(--space-2) var(--space-5);border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;color:inherit;cursor:pointer;width:100%;transition:background-color 150ms ease}
.pu-row:first-child{border-top:0}
@media (hover:hover) and (pointer:fine){.pu-row:hover{background:var(--surface-subtle)}.pu-row:hover b{color:var(--primary)}}
.pu-main{display:flex;flex-direction:column;min-width:0}
.pu-main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pu-main small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pu-num{font-family:var(--font-data);font-size:var(--text-sm);text-align:right;white-space:nowrap;color:var(--text-heading)}
.pu-num small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pu-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.pu-sum dt{color:var(--text-muted)}.pu-sum dd{margin:0;text-align:right;font-family:var(--font-data);color:var(--text-heading)}
.pu-sum .is-total{font-weight:var(--weight-semibold);color:var(--primary)}
.pu-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.pu-lines td{padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.pu-lines td:last-child{text-align:right;font-family:var(--font-data)}
.pu-methods{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.pu-methods button{height:40px;padding:0 var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-sm);cursor:pointer}
.pu-methods button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
@media (max-width:640px){
  .pu-row{grid-template-columns:minmax(0,1fr) auto;row-gap:4px;padding:var(--space-3) var(--space-4)}
  .pu-row>:nth-child(2){grid-column:1;grid-row:2}
  .pu-row>:nth-child(4){grid-column:2;grid-row:1 / span 2}
  .pu-row>:nth-child(3){display:none}
}
`;

export default function Purchases() {
  const [db, setDb] = useState(null);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);       // bill no. in the side panel
  const [pay, setPay] = useState(null);         // { amount, method, account }
  useEffect(() => { setDb(getDb()); }, []);
  const reload = () => setDb(getDb());

  const rows = useMemo(() => {
    if (!db) return [];
    const today = dayStart();
    return db.bills.map((b) => {
      const sup = supplierById(b.supplier, db.suppliers) || { name: b.supplier };
      const st = billStatus(b, today);
      return { ...b, sup, st, left: billLeft(b), items: (b.lines || []).reduce((a, l) => a + (Number(l.qty) || 0), 0) };
    }).sort((a, b) => b.at - a.at);
  }, [db]);
  const inTab = (r, t) => (t === 'all' ? true : t === 'paid' ? r.st === 'Paid' : t === 'overdue' ? r.st === 'Overdue' : r.left > 0);
  const query = q.trim().toLowerCase();
  const shown = rows.filter((r) => inTab(r, tab) && (!query || [r.no, r.ref, r.sup.name, ...(r.lines || []).map((l) => l.name)].join(' ').toLowerCase().includes(query)));
  const sel = open ? rows.find((r) => r.no === open) : null;

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
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Products & stock" page="Purchases" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader title="Purchases" description="What you bought and what you still owe."
              actions={<Link href="/buy-goods" className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> New purchase</Link>} />
            {!db ? null : (<>
              <div className="gc-stattabs" role="tablist" aria-label="Purchases by payment">
                {TABS.map(([id, label, dot]) => {
                  const list = rows.filter((r) => inTab(r, id));
                  const sum = list.reduce((a, r) => a + (id === 'all' || id === 'paid' ? r.amount : r.left), 0);
                  return (
                    <button key={id} type="button" role="tab" aria-selected={tab === id} className="gc-stattab" onClick={() => setTab(id)}>
                      <span className="gc-stattab__label"><i className="gc-stattab__dot" style={{ background: dot }} />{label}</span>
                      <span className="gc-stattab__nums"><b>{list.length}</b><small>{money(sum)}{id === 'open' || id === 'overdue' ? ' due' : ''}</small></span>
                    </button>
                  );
                })}
              </div>
              <section className="gc-card" style={{ overflow: 'hidden' }}>
                <div className="pu-tools" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                  <input className="gc-input" type="search" placeholder="Search supplier, bill or product" aria-label="Search purchases" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                {shown.length ? (
                  <div className="pu-list">
                    {shown.map((r) => (
                      <button key={r.no} type="button" className="pu-row" onClick={() => { setOpen(r.no); setPay(null); }}>
                        <span className="pu-main"><b>{r.sup.name}</b><small>{formatDate(r.at)} · {r.no}{r.ref && r.ref !== r.no ? ' · ' + r.ref : ''}{r.items ? ` · ${r.items} pcs` : ''}</small></span>
                        <span className="pu-main"><small>{r.left > 0 ? `Due ${formatDate(r.due)}` : 'Paid'}{r.direct ? '' : r.po ? ' · ' + r.po : ''}</small></span>
                        <span><StatusBadge tone={BILL_TONE[r.st]}>{r.st}</StatusBadge></span>
                        <span className="pu-num">{money(r.amount)}{r.left > 0 ? <small>{money(r.left)} left</small> : null}</span>
                      </button>
                    ))}
                  </div>
                ) : <div style={{ padding: '0 var(--space-5) var(--space-5)' }}><EmptyState icon="shopping-bag" title="No purchases here" body="Enter what you buy from suppliers." /></div>}
              </section>
            </>)}
          </div>
        </main>
      </div>

      <Sheet open={!!sel} title={sel ? sel.sup.name : ''} onClose={() => { setOpen(null); setPay(null); }}
        footer={sel && sel.left > 0 && !pay ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => startPay(sel)}>Pay</button> : null}>
        {sel ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p className="gc-help" style={{ margin: 0 }}>{formatDate(sel.at)} · {sel.no}{sel.ref && sel.ref !== sel.no ? ' · ' + sel.ref : ''} · <StatusBadge tone={BILL_TONE[sel.st]}>{sel.st}</StatusBadge></p>
            {(sel.lines || []).length ? (
              <table className="pu-lines"><tbody>{sel.lines.map((l, i) => <tr key={i}><td>{l.name}<span className="gc-help" style={{ display: 'block', margin: 0 }}>{l.qty} × {money(l.cost)}</span></td><td>{money(l.qty * l.cost)}</td></tr>)}</tbody></table>
            ) : null}
            <dl className="pu-sum">
              {sel.extra ? <><dt>Transport & other</dt><dd>{money(sel.extra)}</dd></> : null}
              {sel.discount ? <><dt>Discount</dt><dd>−{money(sel.discount)}</dd></> : null}
              <dt>Total</dt><dd>{money(sel.amount)}</dd>
              <dt>Paid</dt><dd>{money(sel.paid || 0)}</dd>
              {sel.credited ? <><dt>Returned (credit)</dt><dd>{money(sel.credited)}</dd></> : null}
              <dt className="is-total">{sel.left > 0 ? 'Left to pay' : 'Settled'}</dt><dd className="is-total">{money(sel.left)}</dd>
              {sel.left > 0 ? <><dt>Pay by</dt><dd>{formatDate(sel.due)}{daysFrom(sel.due) < 0 ? ' · overdue' : ''}</dd></> : null}
            </dl>
            {sel.direct && sel.returnable === false ? <p className="gc-help" style={{ margin: 0 }}>Supplier takes no returns on this purchase.</p> : null}
            <Link href={'/supplier-detail?id=' + encodeURIComponent(sel.supplier)} className="gc-btn gc-btn--sm gc-btn--neutral" style={{ alignSelf: 'flex-start' }}>Supplier</Link>
            {pay ? (
              <form onSubmit={doPay} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                <div><label className="gc-label" htmlFor="pu-amt">Amount (৳)</label><input id="pu-amt" className="gc-input" type="number" inputMode="numeric" min="1" max={sel.left} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></div>
                <div className="pu-methods" role="group" aria-label="Paid by">{METHODS.map((m) => <button key={m} type="button" aria-pressed={pay.method === m} onClick={() => { const a = accountsForMethod(m)[0]; setPay({ ...pay, method: m, account: a ? a.id : '' }); }}>{m}</button>)}</div>
                {accounts.length > 1 ? <div><label className="gc-label" htmlFor="pu-acc">From</label><select id="pu-acc" className="gc-input gc-select" value={pay.account} onChange={(e) => setPay({ ...pay, account: e.target.value })}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {money(a.balance)}</option>)}</select></div> : null}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPay(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!(Number(pay.amount) > 0 && Number(pay.amount) <= sel.left && pay.account)}>Save payment</button></div>
              </form>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
