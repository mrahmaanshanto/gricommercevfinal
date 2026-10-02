'use client';
// MoneyBook — every money account the shop has and every movement posted to the ledger
// (src/lib/ledger.js): sales, invoice payments, refunds, supplier payments, expenses, cash pickups and
// transfers. Balances are opening + every entry. Filter the entries by account, kind and dates.
//   ?account=<ledger account id> opens it filtered to that account (the Cash book and Bank accounts link here)
// Front end only: opening balances are demo figures; entries are the ones posted in this browser.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { ACCOUNTS, accountBy, getEntries, balanceOf } from '@/lib/ledger';

const KINDS = [
  ['sale', 'Sale'], ['invoice payment', 'Invoice payment'], ['refund', 'Refund'], ['supplier payment', 'Supplier payment'],
  ['expense', 'Expense'], ['paid out', 'Paid out'], ['cash pickup', 'Cash pickup'], ['cash in', 'Cash added'], ['transfer', 'Transfer'],
];
const KIND_LABEL = Object.fromEntries(KINDS);
const KIND_TONE = { sale: 'success', 'invoice payment': 'info', refund: 'error', 'supplier payment': 'warning', expense: 'warning', 'paid out': 'warning', 'cash pickup': 'slate', 'cash in': 'slate', transfer: 'slate' };
const TYPES = [['Cash', 'banknote', 'var(--fill-success-soft)', 'var(--text-success)'], ['Mobile', 'smartphone', 'var(--fill-secondary-soft)', 'var(--secondary)'], ['Bank', 'landmark', 'var(--fill-primary-soft)', 'var(--primary)']];
const PAGE = 50;
const money = (n) => formatBDT(Math.abs(n), { decimals: Number.isInteger(n) ? 0 : 2 });
const dayStart = (text) => (text ? new Date(text + 'T00:00:00').getTime() : null);

const CSS = `
.mb-card{overflow:hidden}
.mb-card .gc-table th,.mb-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3);white-space:normal}
.mb-card .gc-table th:first-child,.mb-card .gc-table td:first-child{padding-left:var(--space-5)}
.mb-card .gc-table th:last-child,.mb-card .gc-table td:last-child{padding-right:var(--space-5)}
.mb-card .gc-badge,.mb-num{white-space:nowrap}
.mb-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.mb-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mb-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.mb-num{text-align:right;font-variant-numeric:tabular-nums}
.mb-in{color:var(--text-success);font-weight:var(--weight-medium)}
.mb-out{color:var(--text-danger);font-weight:var(--weight-medium)}
.mb-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.mb-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mb-id{font-family:var(--font-data)}
.mb-acc{display:block;border:0;padding:0;background:none;font:inherit;font-weight:var(--weight-medium);color:var(--primary);text-align:left;cursor:pointer}
.mb-acc:hover{text-decoration:underline}
.mb-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:var(--space-3);align-items:end;padding:0 var(--space-5) var(--space-4)}
.mb-row-on td{background:var(--fill-primary-soft)}
@media (max-width:900px){.mb-filters{grid-template-columns:1fr 1fr}}
@media (max-width:599px){.mb-filters{grid-template-columns:1fr}}
`;

export default function MoneyBook() {
  const [entries, setEntries] = useState([]);
  const [account, setAccount] = useState('');
  const [kind, setKind] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    setEntries(getEntries());
    const want = new URLSearchParams(window.location.search).get('account');
    if (want && accountBy(want)) setAccount(accountBy(want).id);
  }, []);

  const pickAccount = (id) => {
    setAccount(id); setLimit(PAGE);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set('account', id); else u.searchParams.delete('account');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const total = (type) => ACCOUNTS.filter((a) => !type || a.type === type).reduce((n, a) => n + balanceOf(a.id, entries), 0);
  const fromAt = dayStart(from), toAt = dayStart(to);
  const shown = entries.filter((e) => (!account || e.account === account) && (!kind || e.kind === kind)
    && (fromAt == null || e.at >= fromAt) && (toAt == null || e.at < toAt + 86400000));
  const inSum = shown.filter((e) => e.amount > 0).reduce((n, e) => n + e.amount, 0);
  const outSum = shown.filter((e) => e.amount < 0).reduce((n, e) => n - e.amount, 0);
  const filtered = !!(account || kind || from || to);
  const clear = () => { pickAccount(''); setKind(''); setFrom(''); setTo(''); };
  const moved = (id, sign) => entries.filter((e) => e.account === id && Math.sign(e.amount) === sign).reduce((n, e) => n + Math.abs(e.amount), 0);

  return (
    <div className="dc-screen ds" data-screen="MoneyBook">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="acc-moneybook" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Accounts" page="Money book" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Money book"
              about="Every account the shop keeps money in, and every taka that came in or went out: sales, payments, refunds, expenses and transfers."
              actions={<>
                <Link href="/cash-book" className="gc-btn gc-btn--neutral"><Icon name="notebook" width="18" height="18" aria-hidden="true" /> Cash book</Link>
                <Link href="/bank-accounts" className="gc-btn gc-btn--neutral"><Icon name="landmark" width="18" height="18" aria-hidden="true" /> Bank accounts</Link>
              </>}
            />

            <div className="gc-kpis">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="wallet" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">All accounts</p><p className="gc-kpi__value">{formatBDT(total())}<small>{ACCOUNTS.length} accounts</small></p></div></div>
              {TYPES.map(([type, icon, bg, fg]) => (
                <div key={type} className="gc-kpi"><span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">{type === 'Mobile' ? 'Mobile banking' : type}</p><p className="gc-kpi__value">{formatBDT(total(type))}<small>{ACCOUNTS.filter((a) => a.type === type).length} accounts</small></p></div></div>
              ))}
            </div>

            <section className="gc-card mb-card" aria-labelledby="mb-acc-h">
              <div className="mb-head"><div><h2 id="mb-acc-h">Accounts</h2><p>Balance is the opening balance plus every entry below. Pick an account to see only its entries.</p></div></div>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact gc-table--hoverable">
                  <thead><tr><th scope="col">Account</th><th scope="col">Type</th><th scope="col" className="mb-num">Opening</th><th scope="col" className="mb-num">Came in</th><th scope="col" className="mb-num">Went out</th><th scope="col" className="mb-num">Balance</th></tr></thead>
                  <tbody>
                    {ACCOUNTS.map((a) => (
                      <tr key={a.id} className={account === a.id ? 'mb-row-on' : undefined}>
                        <td><button type="button" className="mb-acc" aria-pressed={account === a.id} onClick={() => pickAccount(account === a.id ? '' : a.id)}>{a.name}</button></td>
                        <td>{a.type === 'Mobile' ? 'Mobile banking' : a.type}</td>
                        <td className="mb-num">{formatBDT(a.opening)}</td>
                        <td className="mb-num mb-in">{moved(a.id, 1) ? '+' + money(moved(a.id, 1)) : '—'}</td>
                        <td className="mb-num mb-out">{moved(a.id, -1) ? '−' + money(moved(a.id, -1)) : '—'}</td>
                        <td className="mb-num mb-strong">{formatBDT(balanceOf(a.id, entries))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="gc-card mb-card" aria-labelledby="mb-ent-h">
              <div className="mb-head">
                <div><h2 id="mb-ent-h">Entries</h2><p>{shown.length} {shown.length === 1 ? 'entry' : 'entries'} · {'+' + money(inSum)} in · {'−' + money(outSum)} out · newest first</p></div>
              </div>
              <div className="mb-filters">
                <div><label className="gc-label" htmlFor="mb-account">Account</label><select id="mb-account" className="gc-input gc-select" value={account} onChange={(e) => pickAccount(e.target.value)}><option value="">All accounts</option>{ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="mb-kind">Kind</label><select id="mb-kind" className="gc-input gc-select" value={kind} onChange={(e) => { setKind(e.target.value); setLimit(PAGE); }}><option value="">Everything</option>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="mb-from">From</label><input id="mb-from" type="date" className="gc-input" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setLimit(PAGE); }} /></div>
                <div><label className="gc-label" htmlFor="mb-to">To</label><input id="mb-to" type="date" className="gc-input" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setLimit(PAGE); }} /></div>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={clear} disabled={!filtered}>Clear</button>
              </div>
              {shown.length === 0 ? (
                <EmptyState icon="book-open" title={filtered ? 'No entries match' : 'Nothing posted yet'} body={filtered ? 'Try another account, kind or dates.' : 'Sales, invoice payments, refunds, supplier payments and expenses show here as soon as they are made.'} actionLabel={filtered ? 'Clear filters' : undefined} onAction={filtered ? clear : undefined} />
              ) : (
                <>
                  <div className="gc-table-wrap">
                    <table className="gc-table gc-table--compact gc-table--hoverable">
                      <thead><tr><th scope="col">When</th><th scope="col">Account</th><th scope="col">What</th><th scope="col">Who · reference</th><th scope="col" className="mb-num">In</th><th scope="col" className="mb-num">Out</th></tr></thead>
                      <tbody>
                        {shown.slice(0, limit).map((e) => {
                          const a = accountBy(e.account);
                          return (
                            <tr key={e.id}>
                              <td>{formatDate(e.at)}<span className="mb-sub">{formatTime(e.at)}{e.by ? ' · ' + e.by : ''}</span></td>
                              <td>{a ? a.name : e.account}</td>
                              <td><span className={'gc-badge gc-badge--' + (KIND_TONE[e.kind] || 'slate')}>{KIND_LABEL[e.kind] || e.kind || 'Entry'}</span>{e.note ? <span className="mb-sub">{e.note}</span> : null}</td>
                              <td>{e.party || '—'}{e.ref ? <span className="mb-sub mb-id">{e.ref}</span> : null}</td>
                              <td className="mb-num mb-in">{e.amount > 0 ? '+' + money(e.amount) : ''}</td>
                              <td className="mb-num mb-out">{e.amount < 0 ? '−' + money(e.amount) : ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {shown.length > limit ? <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, shown.length - limit)} more</button></div> : null}
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
