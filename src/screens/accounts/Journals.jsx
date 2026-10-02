'use client';
// Journals — Accounts › Setup › Journals: the auto-posted journals (orders, couriers, POS sessions, purchases,
// payroll) and manual ones, and a balanced manual journal editor. A list in the Shopify style
// (docs/shopify-style.md): a back arrow to Accounts setup, then one card with the views (All, Auto, Manual) and
// the journals; a row opens its lines, "New journal" opens the editor (debits must equal credits).
// ?type=auto|manual picks the view. Front end only: demo journals for September 2026.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, StatusBadge } from '@/components/ui';
import { IndexTabs, LearnMore } from '@/components/ui/IndexKit';
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
var MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtD(d) { var x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.getDate() + ' ' + MONS[x.getMonth()]; }
function num(x) { var n = parseFloat(String(x || '').replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n; }
function tk2(n) { n = Math.round(n * 100) / 100; var neg = n < 0; n = Math.abs(n); var p = n.toFixed(2).split('.'); return (neg ? '−' : '') + bdt(+p[0]) + (p[1] !== '00' ? '.' + p[1] : ''); }
function linesView(lines) { var d = 0, c = 0; var rows = lines.filter(function (l) { return l[1] || l[2]; }).map(function (l) { d += l[1] || 0; c += l[2] || 0; return { code: typeof l[0] === 'number' ? String(l[0]) : 'new', n: aName(l[0]), d: l[1] ? tk2(l[1]) : '', c: l[2] ? tk2(l[2]) : '' }; });
  var ok = Math.abs(d - c) < 0.005 && d > 0; return { rows: rows, td: tk2(d), tc: tk2(c), ok: ok, okL: ok ? 'Balanced' : d === 0 ? 'Enter an amount' : 'Out by ' + tk2(Math.abs(d - c)), tone: ok ? 'success' : 'warning' }; }

var AUTO = [
  ['SD-0929', '29 Sep', 'bKash-paid online orders · 12', 'Orders', [[1030, 18620, 0], [4010, 0, 16920], [4030, 0, 1700]]],
  ['CR-PTH-0928', '28 Sep', 'Pathao COD remittance · 14 parcels', 'Couriers', [[1020, 30888, 0], [6040, 312, 0], [1040, 0, 31200]]],
  ['PS-0928-DH1', '28 Sep', 'Dhanmondi counter closed · short ৳250', 'POS sessions', [[1010, 21050, 0], [1030, 11200, 0], [1050, 3600, 0], [6130, 250, 0], [1060, 0, 36100]]],
  ['PO-1042', '26 Sep', 'Goods received · Dhaka Gadget Hub', 'Purchases', [[1200, 184000, 0], [2010, 0, 184000]]],
  ['PR-0831', '31 Aug', 'August payroll · 14 staff', 'Payroll', [[6030, 180000, 0], [1300, 0, 5000], [2020, 0, 175000]]]
];
var MANUAL = [ ['JV-0012', '27 Sep', 'Reclass Facebook boost paid from cash', 'Manual', [[6060, 3000, 0], [6120, 0, 3000]]], ['JV-0011', '31 Aug', 'Damaged stock written off after count', 'Manual', [[6120, 8600, 0], [1200, 0, 8600]]] ];
function jTotal(l) { return l.reduce(function (x, r) { return x + r[1]; }, 0); }
const FILTERS = [['all', 'All'], ['auto', 'Auto'], ['manual', 'Manual']];
const isManual = (j) => j[3] === 'Manual';
const ABOUT = 'Auto-posted journals from orders, couriers, POS sessions, purchases and payroll, and manual journals for corrections and year-end adjustments. Posting is blocked until a journal balances.';
const blank = () => [{ code: 6060, dr: '', cr: '' }, { code: 1020, dr: '', cr: '' }];

const CSS = `
.jn-ref{font-family:var(--font-data)}
.jn-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.jn-lines{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.jn-row{display:grid;grid-template-columns:minmax(0,1fr) 110px 110px 32px;gap:var(--space-2);align-items:center;padding:6px var(--space-3)}
.jn-head{background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.jn-head span:nth-child(2),.jn-head span:nth-child(3),.jn-foot span{text-align:right}
.jn-line{border-bottom:1px solid var(--border-subtle)}
.jn-acc{justify-content:flex-start;width:100%;min-width:0;overflow:hidden}
.jn-acc span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.jn-code{font-family:var(--font-data);color:var(--text-muted)}
.jn-amt{text-align:right;font-variant-numeric:tabular-nums}
.jn-pick{display:flex;flex-direction:column;gap:var(--space-2);padding:0 var(--space-3) var(--space-3)}
.jn-opts{max-height:150px;overflow:auto}
.jn-foot{background:var(--surface-subtle);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.jn-form{display:flex;flex-direction:column;gap:var(--space-4)}
.jn-meta{margin:0 0 var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.jn-view{border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
@media (max-width:640px){.jn-row{grid-template-columns:minmax(0,1fr) 84px 84px 32px;padding:6px var(--space-2)}}
`;

export default function Journals() {
  const [f, setF] = useState('all');
  const [added, setAdded] = useState([]);
  const [sel, setSel] = useState('');
  const [view, setView] = useState(null);      // the journal whose lines are open
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState(blank);
  const [date, setDate] = useState('2026-09-29');
  const [narr, setNarr] = useState('');
  const [pick, setPick] = useState(null);       // index of the line whose account is being changed
  const [aq, setAq] = useState('');

  useEffect(() => { const t = new URLSearchParams(window.location.search).get('type'); if (t === 'auto' || t === 'manual') setF(t); }, []);

  const all = added.concat([AUTO[0], AUTO[1], AUTO[2], MANUAL[0], AUTO[3], AUTO[4], MANUAL[1]]);
  const shown = all.filter((j) => f === 'all' || (f === 'manual' ? isManual(j) : !isManual(j)));
  const count = (k) => (k === 'all' ? all.length : all.filter((j) => (k === 'manual' ? isManual(j) : !isManual(j))).length);
  const tabs = FILTERS.map(([k, label]) => ({ key: k, id: 'jn-tab-' + k, label, count: count(k), on: f === k, onClick: () => { setF(k); setQuery('type', k === 'all' ? '' : k); } }));
  const pv = linesView(lines.map((l) => [l.code, num(l.dr), num(l.cr)]));
  const cv = view ? linesView(view[4]) : null;
  const open = (j) => { setSel(j[0]); setView(j); };
  const query = aq.toLowerCase();
  const setLine = (i, patch) => setLines(lines.map((l, k) => (k === i ? { ...l, ...patch } : l)));

  const reset = () => { setLines(blank()); setNarr(''); setPick(null); };
  const post = () => {
    if (!narr.trim()) { toast('Say what the journal is for.', { tone: 'error' }); return; }
    if (!pv.ok) { toast('Debits and credits must be equal.', { tone: 'error' }); return; }
    const ref = 'JV-' + String(13 + added.length).padStart(4, '0');
    const j = [ref, fmtD(date), narr, 'Manual', lines.map((l) => [l.code, num(l.dr), num(l.cr)]).filter((l) => l[1] || l[2])];
    setAdded([j, ...added]); setSel(ref); reset(); setEditing(false);
    toast(ref + ' posted: ' + pv.td + ' each side.');
  };

  return (
    <AccPage screen="Journals" active="acc-setup" page="Journals" title="Journals" css={CSS} back="/account-setup?tab=advanced" backLabel="Accounts setup" about={ABOUT}
      placeholder="Search" primary={{ label: 'New journal', onClick: () => setEditing(true) }}>
      <section className="ix-card" aria-label="Journals">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Journal type" /></div>
        <ul className="ix-plist" aria-label="Journals">
          {shown.map((j) => (
            <li key={j[0]}>
              <button type="button" className="ix-pitem" onClick={() => open(j)}>
                <span className="ix-pitem__top"><b className="jn-ref">{j[0]}</b><span className="jn-fig">{tk2(jTotal(j[4]))}</span></span>
                <span className="ix-pitem__mid">{j[1]} · {j[2]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Recent journals</caption>
            <thead><tr><th scope="col">Journal</th><th scope="col">Date</th><th scope="col">What it is for</th><th scope="col">Posted by</th><th scope="col" className="ix-num">Amount</th></tr></thead>
            <tbody>
              {shown.map((j) => (
                <tr key={j[0]} className={sel === j[0] ? 'is-sel' : ''} onClick={(e) => { if (!e.target.closest('button')) open(j); }}>
                  <td><button type="button" className="ix-strong jn-ref" onClick={() => open(j)}>{j[0]}</button></td>
                  <td className="ix-muted">{j[1]}</td>
                  <td><span className="ac-trunc">{j[2]}</span></td>
                  <td>{isManual(j) ? <StatusBadge tone="primary" icon="pencil">Manual</StatusBadge> : <StatusBadge tone="info" icon="zap">Auto · {j[3]}</StatusBadge>}</td>
                  <td className="ix-num jn-fig ix-strong">{tk2(jTotal(j[4]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ix-foot"><span>{shown.length === 1 ? '1 journal' : shown.length + ' journals'}</span></div>
      </section>
      <LearnMore topic="journals" />

      <Dialog open={!!view} title={view ? `${view[0]} · ${view[2]}` : 'Journal'} onClose={() => setView(null)} width={560}
        footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setView(null)}>Close</button>}>
        {view ? (<>
          <p className="jn-meta">{view[1]} 2026 · {isManual(view) ? 'posted by hand' : 'posted automatically from ' + view[3]}</p>
          <div className="ix-table-wrap ix-table-wrap--show jn-view">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">{view[0]} lines</caption>
              <thead><tr><th scope="col">Account</th><th scope="col" className="ix-num">Debit</th><th scope="col" className="ix-num">Credit</th></tr></thead>
              <tbody>
                {cv.rows.map((l, i) => <tr key={i}><td><span className="jn-code">{l.code}</span> {l.n}</td><td className="ix-num jn-fig">{l.d}</td><td className="ix-num jn-fig">{l.c}</td></tr>)}
                <tr className="ac-grp"><th scope="row">Total</th><td className="ix-num jn-fig">{cv.td}</td><td className="ix-num jn-fig">{cv.tc}</td></tr>
              </tbody>
            </table>
          </div>
        </>) : null}
      </Dialog>

      <Dialog open={editing} title="Manual journal" onClose={() => setEditing(false)} width={680}
        footer={<>
          <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto' }} onClick={reset}>Clear</button>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEditing(false)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={post}>Post journal</button>
        </>}>
        <div className="jn-form">
          <div className="ac-two">
            <div><label className="gc-label" htmlFor="jd">Date</label><input id="jd" className="gc-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><label className="gc-label" htmlFor="jn">What it is for</label><input id="jn" className="gc-input" placeholder="e.g. Correct misposted expense" value={narr} onChange={(e) => setNarr(e.target.value)} data-autofocus /></div>
          </div>
          <div className="jn-lines">
            <div className="jn-row jn-head"><span>Account</span><span>Debit</span><span>Credit</span><span /></div>
            {lines.map((l, i) => {
              const picking = pick === i;
              const opts = picking ? COA.filter((a) => !query || (a[0] + ' ' + a[1]).toLowerCase().indexOf(query) >= 0).slice(0, 14) : [];
              return (
                <div key={i} className="jn-line">
                  <div className="jn-row">
                    <button type="button" className="ix-btn jn-acc" aria-expanded={picking} aria-label={`Account: ${l.code} ${aName(l.code)}. Change account`} onClick={() => { setPick(picking ? null : i); setAq(''); }}>
                      <span className="jn-code">{l.code}</span><span>{aName(l.code)}</span>
                    </button>
                    <input className="gc-input jn-amt" aria-label="Debit" inputMode="decimal" value={l.dr} onChange={(e) => setLine(i, { dr: String(e.target.value || '').replace(/[^\d.]/g, ''), cr: '' })} />
                    <input className="gc-input jn-amt" aria-label="Credit" inputMode="decimal" value={l.cr} onChange={(e) => setLine(i, { cr: String(e.target.value || '').replace(/[^\d.]/g, ''), dr: '' })} />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove line" onClick={() => { if (lines.length <= 2) { toast('A journal needs at least two lines.', { tone: 'error' }); return; } setLines(lines.filter((_, k) => k !== i)); }}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                  </div>
                  {picking ? (
                    <div className="jn-pick">
                      <input className="gc-input" aria-label="Search accounts" placeholder="Search accounts" value={aq} onChange={(e) => setAq(e.target.value)} />
                      <div className="ix-chips jn-opts">
                        {opts.map((a) => <button key={a[0]} type="button" className="ix-chip" onClick={() => { setLine(i, { code: a[0] }); setPick(null); }}><span className="jn-code">{a[0]}</span> {a[1]}</button>)}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="jn-row jn-foot">
              <button type="button" className="ix-btn ix-btn--sm" style={{ justifySelf: 'start' }} onClick={() => setLines([...lines, { code: 6120, dr: '', cr: '' }])}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add line</button>
              <span className="jn-fig">{pv.td}</span>
              <span className="jn-fig">{pv.tc}</span>
              <span />
            </div>
          </div>
          <div className="ac-row-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gc-help">Debits must equal credits. Each line is either a debit or a credit.</span>
            <StatusBadge tone={pv.tone}>{pv.okL}</StatusBadge>
          </div>
        </div>
      </Dialog>
    </AccPage>
  );
}
