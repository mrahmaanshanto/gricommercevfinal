'use client';
// ChartOfAccounts — Accounts › Setup › Chart of accounts: every account the books use, grouped as assets,
// liabilities, equity, income and expenses, with balances, the source that posts to it automatically, and a
// live trial balance. A list in the Shopify style (docs/shopify-style.md): a back arrow to Accounts setup, the
// group totals and the trial balance as figures, then one card with a view per group, search and the table;
// "Add account" opens the form (the code is suggested from the group's range).
// ?group=<group> · ?q=<text> pick the view and the search. Front end only: demo books (March–September 2026).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { AccPage } from './accShared';

// ---- demo books ----------------------------------------------------------------------------------

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function setQuery(key, value) { if (typeof window === 'undefined') return; const u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
// Chart of accounts: code, name, group, normal side (D/C), opening balance, auto-posted note
var COA = [
  [1010, 'Cash in hand · Dhanmondi drawer', 'Assets', 'D', 18450, 'POS sessions'], [1011, 'Cash in hand · Mirpur drawer', 'Assets', 'D', 9820, 'POS sessions'],
  [1020, 'BRAC Bank · current ··2081', 'Assets', 'D', 842300, ''], [1021, 'Dutch-Bangla Bank · savings ··5530', 'Assets', 'D', 310000, ''],
  [1030, 'bKash merchant · 01711-482093', 'Assets', 'D', 126540, 'Online payments'], [1031, 'Nagad merchant · 01811-843300', 'Assets', 'D', 48210, 'Online payments'], [1032, 'Rocket · 01611-390155', 'Assets', 'D', 6300, ''],
  [1040, 'Courier COD receivable', 'Assets', 'D', 85800, 'Deliveries'], [1050, 'SSLCOMMERZ settlement receivable', 'Assets', 'D', 21400, 'Card payments'], [1060, 'POS clearing', 'Assets', 'D', 0, 'POS sales'],
  [1100, 'Accounts receivable', 'Assets', 'D', 32600, 'Credit sales'], [1200, 'Inventory', 'Assets', 'D', 4862300, 'Purchases and sales'], [1300, 'Advances to staff', 'Assets', 'D', 45000, 'Loans & advances'],
  [2010, 'Supplier payables', 'Liabilities', 'C', 1512400, 'Purchase orders'], [2020, 'Salaries payable', 'Liabilities', 'C', 0, 'Payroll'], [2030, 'VAT payable', 'Liabilities', 'C', 38250, 'Sales'],
  [2040, 'BRAC SME loan', 'Liabilities', 'C', 1250000, ''], [2050, 'Customer wallet balances', 'Liabilities', 'C', 18760, 'Loyalty wallet'], [2060, 'Commissions payable', 'Liabilities', 'C', 12400, 'Commissions'],
  [3010, 'Owner’s capital', 'Equity', 'C', 3000000, ''], [3020, 'Owner’s drawings', 'Equity', 'D', 180000, ''], [3030, 'Retained earnings', 'Equity', 'C', 0, 'Year end'], [3040, 'Opening balances', 'Equity', 'C', 0, 'Setup'],
  [4010, 'Sales · online', 'Income', 'C', 3842000, 'Orders'], [4020, 'Sales · shops', 'Income', 'C', 2716000, 'POS'], [4030, 'Delivery charges collected', 'Income', 'C', 214300, 'Orders'], [4040, 'Other income', 'Income', 'C', 12500, ''],
  [5000, 'Cost of goods sold', 'Expenses', 'D', 3291540, 'Sales'],
  [6010, 'Rent', 'Expenses', 'D', 540000, ''], [6020, 'Electricity, water and gas', 'Expenses', 'D', 86400, ''], [6030, 'Salaries', 'Expenses', 'D', 1260000, 'Payroll'], [6040, 'Courier charges', 'Expenses', 'D', 198600, 'Deliveries'],
  [6050, 'Payment gateway fees', 'Expenses', 'D', 42100, 'Settlements'], [6060, 'Advertising', 'Expenses', 'D', 372000, ''], [6070, 'Internet and software', 'Expenses', 'D', 48600, 'GridCommerce billing'],
  [6080, 'Packaging', 'Expenses', 'D', 64300, ''], [6090, 'Bank charges', 'Expenses', 'D', 6200, ''], [6100, 'Staff commissions', 'Expenses', 'D', 52800, 'Commissions'], [6110, 'SMS, WhatsApp and AI calls', 'Expenses', 'D', 16800, 'Wallet'], [6120, 'Miscellaneous', 'Expenses', 'D', 9800, ''], [6130, 'Cash short and over', 'Expenses', 'D', 1250, 'POS sessions'], [6140, 'Loan interest', 'Expenses', 'D', 37500, '']
];
(function () { // retained earnings makes the books balance: assets + drawings + expenses = liabilities + capital + income + RE
  var sum = function (g) { return COA.filter(function (a) { return a[2] === g; }).reduce(function (x, a) { return x + a[4]; }, 0); };
  var dr = sum('Assets') + 180000 + sum('Expenses'), cr = sum('Liabilities') + 3000000 + sum('Income');
  COA.forEach(function (a) { if (a[0] === 3030) a[4] = dr - cr; });
})();
function acct(code) { return COA.filter(function (a) { return a[0] === code; })[0]; }
function aName(code) { var a = acct(code); return a ? a[1] : String(code); }
function tk2(n) { n = Math.round(n * 100) / 100; var neg = n < 0; n = Math.abs(n); var p = n.toFixed(2).split('.'); return (neg ? '−' : '') + bdt(+p[0]) + (p[1] !== '00' ? '.' + p[1] : ''); }

var GROUPS = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];
var RANGE = { Assets: [1000, 1999, 'D'], Liabilities: [2000, 2999, 'C'], Equity: [3000, 3999, 'C'], Income: [4000, 4999, 'C'], Expenses: [5000, 6999, 'D'] };
const ABOUT = 'Every account the books use, grouped as assets (cash, bank, stock, receivables), liabilities (suppliers, loan, VAT), owner’s equity (capital less drawings plus profit), income and expenses, with the balance of each, what posts to it automatically, and a trial balance checked on every change.';

const CSS = `
.coa-code{font-family:var(--font-data);color:var(--text-muted)}
.coa-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.coa-neg{color:var(--text-danger)}
`;

export default function ChartOfAccounts() {
  const [gsel, setG] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [added, setAdded] = useState([]);
  const [adding, setAdding] = useState(false);
  const [ng, setNg] = useState('Assets');
  const [nm, setNm] = useState('');
  const [code, setCode] = useState(null);
  const [err, setErr] = useState({});

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const g = u.get('group'), text = u.get('q');
    if (GROUPS.indexOf(g) >= 0) setG(g);
    if (text) { setQ(text); setFind(true); }
  }, []);

  const list = COA.concat(added);
  const needle = q.toLowerCase();
  const sum = (g) => list.filter((a) => a[2] === g).reduce((x, a) => x + (a[3] === RANGE[g][2] ? a[4] : -a[4]), 0);
  let dr = 0, cr = 0; list.forEach((a) => { if (a[3] === 'D') dr += a[4]; else cr += a[4]; });
  const balanced = Math.abs(dr - cr) < 0.005;
  const profit = sum('Income') - sum('Expenses');
  const used = list.filter((a) => a[2] === ng).map((a) => a[0]), r = RANGE[ng];
  let nc = r[0] + 10;
  while (used.indexOf(nc) >= 0 && nc < r[1]) nc += 10;
  if (used.indexOf(nc) >= 0) { nc = r[0] + 1; while (used.indexOf(nc) >= 0) nc++; }
  const codeTxt = code == null ? String(nc) : code;
  const groups = GROUPS.filter((g) => gsel === 'all' || g === gsel).map((g) => {
    const rows = list.filter((a) => a[2] === g && (!needle || (a[0] + ' ' + a[1]).toLowerCase().indexOf(needle) >= 0));
    return { n: g, total: tk2(sum(g)), rows: rows.map((a) => { const contra = g === 'Equity' && a[3] === 'D'; return { code: String(a[0]), n: a[1], src: a[5], side: a[3] === 'D' ? 'Debit' : 'Credit', bal: (contra ? '−' : '') + tk2(a[4]), zero: a[4] === 0, contra }; }) };
  }).filter((g) => g.rows.length);
  const tabs = [['all', 'All'], ...GROUPS.map((g) => [g, g])].map(([k, label]) => ({ key: k, id: 'coa-tab-' + k, label, count: k === 'all' ? list.length : list.filter((a) => a[2] === k).length, on: gsel === k, onClick: () => { setG(k); setQuery('group', k === 'all' ? '' : k); } }));
  const onQ = (e) => { const x = e.target.value; setQ(x); setQuery('q', String(x || '').trim()); };
  const closeFind = () => { setQ(''); setQuery('q', ''); setFind(false); };
  const clearFilters = () => { setQ(''); setG('all'); setQuery('q', ''); setQuery('group', ''); };
  const findOn = find || !!q;

  const openAdd = () => { setErr({}); setAdding(true); };
  const pickGroup = (g) => { setNg(g); setCode(null); setErr({}); };
  const addAcct = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const n = nm.trim(), cd = parseInt(codeTxt, 10), errs = {};
    if (!n) errs.nm = 'Enter the account name.'; else if (list.some((a) => a[1].toLowerCase() === n.toLowerCase())) errs.nm = 'An account with that name already exists.';
    if (!codeTxt) errs.code = 'Enter the account code.'; else if (isNaN(cd) || cd < r[0] || cd > r[1]) errs.code = ng + ' codes run from ' + r[0] + ' to ' + r[1] + '.'; else if (list.some((a) => a[0] === cd)) errs.code = 'Code ' + cd + ' is already used by ' + aName(cd) + '.';
    if (errs.nm || errs.code) { setErr(errs); toast(errs.nm || errs.code, { tone: 'error' }); return; }
    setAdded([...added, [cd, n, ng, r[2], 0, '']]); setNm(''); setCode(null); setErr({}); setG(ng); setQuery('group', ng); setAdding(false);
    toast('Account ' + cd + ' · ' + n + ' added to ' + ng + '.');
  };

  return (
    <AccPage screen="ChartOfAccounts" active="acc-setup" page="Chart of accounts" title="Chart of accounts" css={CSS} back="/account-setup?tab=advanced" backLabel="Accounts setup" about={ABOUT}
      placeholder="Search" primary={{ label: 'Add account', onClick: openAdd }}>
      <MetricStrip label="Books" items={[
        { label: 'Assets', value: tk2(sum('Assets')) },
        { label: 'Liabilities', value: tk2(sum('Liabilities')) },
        { label: 'Owner’s equity', value: tk2(3000000 - 180000 + profit) },
        { label: 'Profit since March', value: tk2(profit) },
        { label: 'Trial balance', value: <span className={balanced ? '' : 'coa-neg'}>{balanced ? 'Balanced' : 'Out of balance'}</span>, sub: balanced ? '' : 'Out by ' + tk2(Math.abs(dr - cr)) },
      ]} />

      <section className="ix-card" aria-label="Chart of accounts">
        <div className="ix-bar">
          {findOn ? (<>
            <SearchField value={q} onChange={onQ} placeholder="Search code or name" onDone={closeFind} autoFocus={find} />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Account group" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
        {groups.length === 0 ? (
          <div className="ix-empty"><EmptyState title="No accounts match" actionLabel="Clear filters" onAction={clearFilters} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Accounts">
            {groups.map((g) => (
              <React.Fragment key={g.n}>
                <li className="ac-plh">{g.n}<small>{g.total}</small></li>
                {g.rows.map((a) => (
                  <li key={a.code}>
                    <div className="ix-pitem">
                      <span className="ix-pitem__top"><b><span className="coa-code">{a.code}</span> {a.n}</b><span className={'coa-fig' + (a.contra ? ' coa-neg' : a.zero ? ' ix-muted' : '')}>{a.bal}</span></span>
                      <span className="ix-pitem__mid">{a.side}{a.src ? ' · Auto · ' + a.src : ''}</span>
                    </div>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">Chart of accounts</caption>
              <thead><tr><th scope="col" style={{ width: 80 }}>Code</th><th scope="col">Account</th><th scope="col">Posted by</th><th scope="col">Side</th><th scope="col" className="ix-num">Balance</th></tr></thead>
              {groups.map((g) => (
                <tbody key={g.n}>
                  <tr className="ac-grp"><th scope="rowgroup" colSpan={4}>{g.n}<small>{g.rows.length} accounts</small></th><td className="ix-num coa-fig">{g.total}</td></tr>
                  {g.rows.map((a) => (
                    <tr key={a.code}>
                      <td className="coa-code">{a.code}</td>
                      <td className="ix-strong">{a.n}</td>
                      <td>{a.src ? <StatusBadge tone="info" icon="zap">Auto · {a.src}</StatusBadge> : <span className="ix-muted">Entries</span>}</td>
                      <td className="ix-muted">{a.side}</td>
                      <td className={'ix-num coa-fig' + (a.contra ? ' coa-neg' : a.zero ? ' ix-muted' : '')}>{a.bal}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{list.length} accounts · {tk2(dr)} on each side</span></div>
      </section>
      <LearnMore topic="the chart of accounts" />

      <Dialog open={adding} title="Add an account" onClose={() => setAdding(false)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAdding(false)}>Cancel</button><button type="submit" form="coa-add" className="gc-btn gc-btn--solid">Add account</button></>}>
        <form id="coa-add" className="ac-form" noValidate onSubmit={addAcct}>
          <p className="gc-help" style={{ margin: 0 }}>The code is suggested from the group’s range. System accounts cannot be renamed.</p>
          <div>
            <span className="gc-label" id="coa-grp-l">Group</span>
            <div className="ix-chips" role="group" aria-labelledby="coa-grp-l">
              {GROUPS.map((g) => <button key={g} type="button" className="ix-chip" aria-pressed={g === ng} onClick={() => pickGroup(g)}>{g}</button>)}
            </div>
          </div>
          <div>
            <label className="gc-label" htmlFor="an">Account name *</label>
            <input id="an" className={'gc-input' + (err.nm ? ' gc-input--error' : '')} placeholder="e.g. Upay merchant" value={nm} onChange={(e) => { setNm(e.target.value); setErr({ ...err, nm: '' }); }} required aria-required="true" aria-invalid={!!err.nm} aria-describedby={err.nm ? 'an-err' : undefined} data-autofocus />
            {err.nm ? <span id="an-err" className="gc-help gc-help--error">{err.nm}</span> : null}
          </div>
          <div>
            <label className="gc-label" htmlFor="ac">Account code *</label>
            <input id="ac" className={'gc-input coa-fig' + (err.code ? ' gc-input--error' : '')} inputMode="numeric" value={codeTxt} onChange={(e) => { setCode(String(e.target.value || '').replace(/[^\d]/g, '').slice(0, 4)); setErr({ ...err, code: '' }); }} required aria-required="true" aria-invalid={!!err.code} aria-describedby={err.code ? 'ac-err ac-hint' : 'ac-hint'} />
            {err.code ? <span id="ac-err" className="gc-help gc-help--error">{err.code}</span> : null}
            <span id="ac-hint" className="gc-help" style={{ display: 'block', margin: 'var(--space-1) 0 0' }}>{ng} use codes {r[0]} to {r[1]}. Normal balance: {r[2] === 'D' ? 'debit' : 'credit'}. Next free code: {nc}.</span>
          </div>
        </form>
      </Dialog>
    </AccPage>
  );
}
