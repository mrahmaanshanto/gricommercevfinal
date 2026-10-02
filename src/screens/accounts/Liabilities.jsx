'use client';
// Liabilities — "Bills to pay": money the shop owes that is not a supplier bill: staff salaries, sales
// commission, affiliate payouts and promotions (influencers, ad agencies, printing, stalls) and anything else.
// Laid out like a Shopify list (docs/shopify-style.md):
//   Figures  owed now, overdue, due in 7 days, paid this month, and what is held for customers (the ৳ value
//            of loyalty points and wallet money, loyalty.js; read-only, paid back on /wallet)
//   List     a view per type and a status filter; a row shows who is owed, for which month, when it is
//            due and how much is paid; a click opens its lines (one per person) and the payments so far.
//   Pay      tick the people to pay now (part payments allowed), pay each from their usual account
//            or everyone from one account, and say who paid. Every line paid posts to the money book.
//   Add      a new liability with its lines; "Fill from payroll" copies the month's 13 staff salaries.
// ?id=<liability id> opens that liability's Pay window. Front end only: src/lib/liabilities.js.

import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { formatDate } from '@/lib/format';
import { OWN_ACCOUNTS, balanceOf } from '@/lib/ledger';
import { clockNow, startOfDay, dayKey } from '@/lib/settlements';
import { getLiabilities, LIAB_TYPES, LIAB_TONE, LIAB_SEED, paidOf, leftOf, liabStatus, addLiability, payLiability } from '@/lib/liabilities';
import { AccPage, AccountSelect, useBooks, money, accName, accBrand } from './accShared';
import { getMembers, pointsLiability, walletLiability } from '@/lib/loyalty';

const STAFF = ['Rumana Islam', 'Rakib Hasan', 'Nabila Rahman', 'Staff'];
const CHANNELS = ['Shared', 'Online', 'Retail', 'Wholesale'];
const STATUS_FILTER = [['open', 'Open'], ['paid', 'Paid'], ['all', 'All']];
const TYPE_KEYS = Object.keys(LIAB_TYPES);
const r2 = (n) => Math.round(n * 100) / 100;
const num = (v) => r2(Number(String(v).replace(/[^\d.]/g, '')) || 0);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const DAY = 864e5;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** '2026-09' → 'September 2026' */
const periodLabel = (p) => { const [y, m] = String(p || '').split('-').map(Number); return y && m ? `${MONTHS[m - 1]} ${y}` : '—'; };
const monthKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
/** 'YYYY-MM-DD' → noon that day (ms), like the demo rows. */
const fromDateKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12).getTime(); };
const lineLeft = (x) => r2(x.amount - (x.paid || 0));

function DueWords({ l, now }) {
  const st = liabStatus(l, now);
  const d = Math.round((startOfDay(l.due) - startOfDay(now)) / DAY);
  const words = st === 'Paid' ? 'Paid' : d < 0 ? `Overdue ${plural(-d, 'day')}` : d === 0 ? 'Due today' : `Due in ${plural(d, 'day')}`;
  const tone = st === 'Paid' ? LIAB_TONE.Paid : d < 0 ? LIAB_TONE.Overdue : d === 0 ? 'warning' : LIAB_TONE[st];
  return (
    <>
      <StatusBadge tone={tone === 'slate' ? 'neutral' : tone} icon={st === 'Paid' ? 'circle-check' : d < 0 ? undefined : 'clock'}>{words}</StatusBadge>
      {st === 'Partly paid' ? <> <StatusBadge tone={LIAB_TONE['Partly paid']}>Partly paid</StatusBadge></> : null}
    </>
  );
}

const CSS = `
.lb-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.lb-status{max-width:140px}
.lb-paid{display:inline-flex;align-items:center;gap:var(--space-2)}
.lb-bar{display:inline-block;width:48px;height:4px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.lb-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.lb-bar i.is-done{background:var(--text-success)}
.lb-chev{color:var(--text-muted);transition:transform var(--duration-base) var(--ease-out)}
tr[aria-expanded="true"] .lb-chev{transform:rotate(90deg)}
.lb-tile{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.lb-more{display:flex;flex-direction:column;gap:var(--space-4);max-width:860px}
.lb-more h3{margin:0 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lb-more .gc-table-wrap{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.lb-more .ac-mini{margin:0}
.lb-more .ac-mini tr:last-child td{border-bottom:0}
.lb-acc{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.lb-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
/* pay dialog */
.lb-lines{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);max-height:360px;overflow:auto}
.lb-line{display:grid;grid-template-columns:auto minmax(0,1fr) minmax(110px,150px);align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle)}
.lb-line:first-child{border-top:0}
.lb-line.is-on{background:var(--fill-primary-soft)}
.lb-line.lb-all{background:var(--surface-subtle);position:sticky;top:0;z-index:1}
.lb-line label{min-width:0;cursor:pointer}
.lb-line b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.lb-line small{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.lb-line .gc-input{text-align:right}
.lb-line .gc-input[aria-invalid="true"]{border-color:var(--text-danger)}
.lb-total{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.lb-total span{font-size:var(--text-xs);color:var(--text-body)}
.lb-total b{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--primary)}
.lb-from{display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-body)}
.lb-from li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}
.lb-from ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
/* add dialog */
.lb-types{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:var(--space-2)}
.lb-types label{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.lb-types label.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.lb-types input{position:absolute;opacity:0;pointer-events:none}
.lb-types label:focus-within{outline:2px solid var(--primary);outline-offset:2px}
.lb-edit{display:flex;flex-direction:column;gap:var(--space-2)}
.lb-erow{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1.3fr) minmax(90px,.8fr) minmax(0,1.2fr) auto;gap:var(--space-2);align-items:center}
.lb-ehead{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.lb-ebar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2)}
@media (max-width:640px){.lb-line{grid-template-columns:auto minmax(0,1fr)}.lb-line .gc-input{grid-column:2}.lb-erow{grid-template-columns:1fr 1fr}.lb-ehead{display:none}}
`;

const ABOUT = 'Money the shop owes that is not a supplier bill: salaries, sales commission, affiliate payouts and promotions.';

export default function Liabilities() {
  const tick = useBooks();
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('open');
  const [open, setOpen] = useState({});      // id → expanded
  const [payId, setPayId] = useState('');
  const [adding, setAdding] = useState(false);
  const held = useHeld();

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const today = startOfDay(now);
    const list = getLiabilities();
    const openList = list.filter((l) => leftOf(l) > 0);
    const overdue = openList.filter((l) => liabStatus(l, now) === 'Overdue');
    const soon = openList.filter((l) => { const d = Math.round((startOfDay(l.due) - today) / DAY); return d >= 0 && d <= 7; });
    const month = monthKey(now);
    const paidMonth = list.flatMap((l) => l.payments || []).filter((p) => monthKey(p.at) === month);
    const sum = (ls) => r2(ls.reduce((a, l) => a + leftOf(l), 0));
    return {
      now, list,
      owed: sum(openList), openCount: openList.length,
      overdue: { n: overdue.length, amt: sum(overdue) },
      soon: { n: soon.length, amt: sum(soon) },
      paidMonth: { n: paidMonth.length, amt: r2(paidMonth.reduce((a, p) => a + p.amount, 0)), label: periodLabel(month) },
    };
  }, [tick]);

  // ?id=<liability> opens its Pay window once the books are read, then the address is cleaned up
  const booted = useRef(false);
  useEffect(() => {
    if (!data || booted.current) return;
    booted.current = true;
    const u = new URL(window.location.href);
    const id = u.searchParams.get('id');
    if (!id) return;
    const l = data.list.find((x) => x.id === id);
    if (l && leftOf(l) > 0) setPayId(id);
    else if (l) { setStatus('all'); setOpen({ [id]: true }); toast(`${l.title} is already paid`, { tone: 'info' }); }
    else toast(`No liability ${id}`, { tone: 'error' });
    u.searchParams.delete('id');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  }, [data]);

  const byStatus = (l) => (status === 'all' ? true : status === 'open' ? leftOf(l) > 0 : leftOf(l) <= 0);
  const pool = data ? data.list.filter(byStatus) : [];
  const counts = { all: pool.length };
  TYPE_KEYS.forEach((k) => { counts[k] = pool.filter((l) => l.type === k).length; });
  const rank = { Overdue: 0, 'Partly paid': 1, Due: 1, Paid: 2 };
  const shown = pool.filter((l) => type === 'all' || l.type === type)
    .sort((a, b) => rank[liabStatus(a, data.now)] - rank[liabStatus(b, data.now)] || a.due - b.due);
  const payL = data && payId ? data.list.find((l) => l.id === payId) : null;
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const tabs = [['all', 'All'], ...TYPE_KEYS.map((k) => [k, LIAB_TYPES[k].label])].map(([k, label]) => ({ key: k, id: 'lb-tab-' + k, label, count: data ? counts[k] || 0 : null, on: type === k, onClick: () => setType(k) }));
  const fig = (v) => (data ? v : '—');

  return (
    <AccPage screen="Liabilities" active="acc-liab" page="Bills to pay" title="Bills to pay" css={CSS} icon="file-clock" about={ABOUT}
      secondary={[{ label: 'All dues', href: '/dues?tab=owe' }]}
      more={[{ label: 'Income & expenses', href: '/expenses-bills' }, { label: 'Customer wallets', href: '/wallet?tab=wallets' }, { label: 'Loyalty', href: '/loyalty' }]}
      primary={{ label: 'Add bill', onClick: () => setAdding(true) }}>
      <MetricStrip label="Bills to pay" items={[
        { label: 'Owed now', value: fig(data && money(data.owed)), sub: data ? plural(data.openCount, 'liability', 'liabilities') : '' },
        { label: 'Overdue', value: fig(data && money(data.overdue.amt)), sub: data ? plural(data.overdue.n, 'liability', 'liabilities') : '' },
        { label: 'Due in the next 7 days', value: fig(data && money(data.soon.amt)), sub: data ? plural(data.soon.n, 'liability', 'liabilities') : '' },
        { label: 'Paid this month', value: fig(data && money(data.paidMonth.amt)), sub: data ? plural(data.paidMonth.n, 'payment') : '' },
        { label: 'Held for customers', value: held ? money(held.total) : '—', sub: 'points + wallets', href: '/wallet?tab=wallets' },
      ]} />

      <section className="ix-card" aria-label="Liabilities">
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Type" />
          <span className="ix-tools">
            <select className={'ix-filter lb-status' + (status !== 'open' ? ' is-set' : '')} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_FILTER.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </span>
        </div>
        {!data ? <p className="ac-wait">Reading the books…</p> : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="circle-check" title={status === 'open' ? 'Nothing left to pay here' : 'Nothing here'} actionLabel="Add liability" onAction={() => setAdding(true)} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Liabilities">
            {shown.map((l) => (
              <li key={l.id}>
                <button type="button" className="ix-pitem" aria-expanded={!!open[l.id]} onClick={() => toggle(l.id)}>
                  <span className="ix-pitem__top"><b>{l.title}</b><span className="lb-fig">{leftOf(l) > 0 ? money(leftOf(l)) : 'Paid'}</span></span>
                  <span className="ix-pitem__mid">{l.party} · {periodLabel(l.period)}</span>
                  <span className="ix-pitem__tags"><DueWords l={l} now={data.now} /></span>
                </button>
                {open[l.id] ? <div className="ac-pdetail"><LiabDetail l={l} onPay={() => setPayId(l.id)} /></div> : null}
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Bills to pay</caption>
              <thead><tr><th scope="col">Bill</th><th scope="col">Owed to</th><th scope="col">Due</th><th scope="col">Paid</th><th scope="col" className="ix-num">Left</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {shown.map((l) => {
                  const paid = paidOf(l), left = leftOf(l);
                  const pct = l.amount ? Math.min(100, Math.round((paid / l.amount) * 100)) : 0;
                  return (
                    <Fragment key={l.id}>
                      <tr aria-expanded={!!open[l.id]} onClick={(e) => { if (!e.target.closest('a,button')) toggle(l.id); }} title={`${periodLabel(l.period)} · ${(LIAB_TYPES[l.type] || LIAB_TYPES.other).label}${l.channel ? ' · ' + l.channel : ''} · ${l.id}`}>
                        <td><span className="ac-logo"><Icon name="chevron-right" width="14" height="14" className="lb-chev" aria-hidden="true" /><span className="ix-strong ac-trunc">{l.title}</span></span></td>
                        <td><span className="ac-trunc">{l.party}</span></td>
                        <td><DueWords l={l} now={data.now} /></td>
                        <td><span className="lb-paid"><span className="lb-bar" role="progressbar" aria-label={`Paid of ${l.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i className={left <= 0 ? 'is-done' : ''} style={{ width: pct + '%' }} /></span><span className="ix-muted lb-fig">{money(paid)} of {money(l.amount)}</span></span></td>
                        <td className="ix-num lb-fig ix-strong">{left > 0 ? money(left) : 'Paid'}</td>
                        <td className="ac-act">{left > 0 ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPayId(l.id)} aria-label={`Pay ${l.title}`}>Pay</button> : null}</td>
                      </tr>
                      {open[l.id] ? <tr className="ac-detail"><td colSpan={6}><LiabDetail l={l} /></td></tr> : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        {data ? <div className="ix-foot"><span>{plural(shown.length, 'liability', 'liabilities')}</span></div> : null}
      </section>
      <LearnMore topic="bills to pay" />

      {payL ? <PayDialog l={payL} onClose={() => setPayId('')} /> : null}
      {adding && data ? <AddDialog now={data.now} onClose={() => setAdding(false)} /> : null}
    </AccPage>
  );
}

/** What the shop holds for customers — loyalty points (a promise of a discount, at the value of a point) and
 *  wallet money / advances (loyalty.js). It is theirs until used, spent or paid back; the list is on Customer wallets. */
function useHeld() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const read = () => { const members = getMembers(); const pts = pointsLiability(members); const w = walletLiability(members); setD({ total: r2(pts.value + w.total) }); };
    read();
    const evs = ['gc:loyalty', 'gc:ledger', 'storage'];
    evs.forEach((e) => window.addEventListener(e, read));
    return () => evs.forEach((e) => window.removeEventListener(e, read));
  }, []);
  return d;
}

/** A liability's details: its note, one line per person or company, and the payments made so far. */
function LiabDetail({ l, onPay }) {
  return (
    <div className="lb-more">
      <p className="lb-note">For {periodLabel(l.period)} · {(LIAB_TYPES[l.type] || LIAB_TYPES.other).label}{l.channel ? ' · ' + l.channel : ''} · <span className="lb-fig">{l.id}</span>{l.note ? ' · ' + l.note : ''}</p>
      <div>
        <h3>{plural(l.lines.length, 'line')}</h3>
        <div className="gc-table-wrap">
          <table className="ac-mini">
            <thead><tr><th scope="col">Name</th><th scope="col">Note</th><th scope="col" className="ac-num">Amount</th><th scope="col" className="ac-num">Paid</th><th scope="col" className="ac-num">Left</th><th scope="col">Usual account</th></tr></thead>
            <tbody>
              {l.lines.map((x) => (
                <tr key={x.name}>
                  <td className="ac-strong">{x.name}</td>
                  <td>{x.note || '—'}</td>
                  <td className="ac-num ac-fig">{money(x.amount)}</td>
                  <td className="ac-num ac-fig">{x.paid ? money(x.paid) : '—'}</td>
                  <td className={'ac-num ac-fig' + (lineLeft(x) > 0 ? ' ac-strong' : ' ac-in')}>{lineLeft(x) > 0 ? money(lineLeft(x)) : 'Paid'}</td>
                  <td><span className="lb-acc"><BrandLogo brand={accBrand(x.account)} size={20} decorative />{accName(x.account)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3>Payments made</h3>
        {(l.payments || []).length === 0 ? <p className="lb-note">No payments yet.</p> : (
          <div className="gc-table-wrap">
            <table className="ac-mini">
              <thead><tr><th scope="col">Date</th><th scope="col" className="ac-num">Amount</th><th scope="col">From</th><th scope="col">Paid by</th><th scope="col">For</th></tr></thead>
              <tbody>
                {[...l.payments].sort((a, b) => b.at - a.at).map((p, i) => (
                  <tr key={p.at + '-' + i}>
                    <td>{formatDate(p.at)}</td>
                    <td className="ac-num ac-fig ac-strong">{money(p.amount)}</td>
                    <td>{p.account ? <span className="lb-acc"><BrandLogo brand={accBrand(p.account)} size={20} decorative />{accName(p.account)}</span> : 'Each person’s usual account'}</td>
                    <td>{p.by}</td>
                    <td>{(p.lines || []).length > 3 ? `${p.lines.slice(0, 3).join(', ')} +${p.lines.length - 3} more` : (p.lines || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {onPay && leftOf(l) > 0 ? <div><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={onPay}>Pay</button></div> : null}
    </div>
  );
}

function PayDialog({ l, onClose }) {
  const unpaid = l.lines.filter((x) => lineLeft(x) > 0);
  const [sel, setSel] = useState(() => Object.fromEntries(unpaid.map((x) => [x.name, true])));
  const [amt, setAmt] = useState(() => Object.fromEntries(unpaid.map((x) => [x.name, String(lineLeft(x))])));
  const [mode, setMode] = useState('each');
  const [account, setAccount] = useState('brac');
  const [by, setBy] = useState(STAFF[0]);
  const t = LIAB_TYPES[l.type] || LIAB_TYPES.other;

  const picked = unpaid.filter((x) => sel[x.name]);
  const bad = (x) => sel[x.name] && (num(amt[x.name]) <= 0 || num(amt[x.name]) > lineLeft(x) + 0.001);
  const total = r2(picked.reduce((a, x) => a + num(amt[x.name]), 0));
  const allOn = unpaid.length > 0 && picked.length === unpaid.length;
  // money leaving each account
  const perAccount = {};
  picked.forEach((x) => { const acc = mode === 'one' ? account : x.account; perAccount[acc] = r2((perAccount[acc] || 0) + num(amt[x.name])); });
  const short = Object.entries(perAccount).filter(([acc, a]) => a > balanceOf(acc));

  const save = (e) => {
    e.preventDefault();
    const lines = {};
    picked.forEach((x) => { const a = num(amt[x.name]); if (a > 0) lines[x.name] = a; });
    if (!Object.keys(lines).length) { toast('Tick at least one person and enter an amount', { tone: 'error' }); return; }
    const wrong = picked.find(bad);
    if (wrong) { toast(`${wrong.name}: enter an amount up to ${money(lineLeft(wrong))}`, { tone: 'error' }); return; }
    const done = payLiability(l.id, { lines, account: mode === 'one' ? account : undefined, by });
    if (!done) { toast('Nothing was paid. Check the amounts.', { tone: 'error' }); return; }
    const n = Object.keys(lines).length;
    toast(`Paid ${money(total)} · ${plural(n, 'person', 'people')}`);
    onClose();
  };

  const footer = (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="submit" form="lb-pay-form" className="gc-btn gc-btn--solid" disabled={!total}>Pay {total ? money(total) : ''}</button>
    </>
  );
  return (
    <Dialog open title={`Pay · ${l.title}`} onClose={onClose} footer={footer} width={680}>
      <form id="lb-pay-form" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-logo-line">
          <span className="lb-tile" aria-hidden="true"><Icon name={t.icon} width="20" height="20" /></span>
          <span><b>{l.party}</b><small>{t.label} · {periodLabel(l.period)} · due {formatDate(l.due)} · {money(leftOf(l))} left of {money(l.amount)}</small></span>
        </div>

        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend className="gc-label">Who to pay now</legend>
          <div className="lb-lines">
            <div className="lb-line lb-all">
              <input id="lb-all" type="checkbox" className="gc-check" checked={allOn} onChange={() => setSel(Object.fromEntries(unpaid.map((x) => [x.name, !allOn])))} />
              <label htmlFor="lb-all"><b>Select all</b><small>{picked.length} of {plural(unpaid.length, 'person', 'people')} ticked</small></label>
              <span />
            </div>
            {unpaid.map((x, i) => (
              <div key={x.name} className={'lb-line' + (sel[x.name] ? ' is-on' : '')}>
                <input id={'lb-l-' + i} type="checkbox" className="gc-check" checked={!!sel[x.name]} onChange={(e) => setSel({ ...sel, [x.name]: e.target.checked })} />
                <label htmlFor={'lb-l-' + i}>
                  <b>{x.name}</b>
                  <small>
                    {x.note ? <span>{x.note}</span> : null}
                    <span>{money(lineLeft(x))} left{x.paid ? ` · ${money(x.paid)} paid` : ''}</span>
                    {mode === 'each' ? <span className="lb-acc"><BrandLogo brand={accBrand(x.account)} size={16} decorative />{accName(x.account)}</span> : null}
                  </small>
                </label>
                <input className="gc-input ac-fig" inputMode="decimal" aria-label={`Amount for ${x.name}`} disabled={!sel[x.name]} aria-invalid={bad(x) ? 'true' : undefined}
                  value={amt[x.name]} onChange={(e) => setAmt({ ...amt, [x.name]: e.target.value.replace(/[^\d.]/g, '') })} />
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <span className="gc-label" id="lb-from-label">Pay from</span>
          <div className="ac-seg" role="group" aria-labelledby="lb-from-label">
            <button type="button" aria-pressed={mode === 'each'} onClick={() => setMode('each')}>Each person’s usual account</button>
            <button type="button" aria-pressed={mode === 'one'} onClick={() => setMode('one')}>One account for all</button>
          </div>
        </div>
        {mode === 'one' ? (
          <div className="ac-two">
            <AccountSelect id="lb-account" label="Account" value={account} onChange={setAccount} />
            <div><span className="gc-label">Balance</span><p className="ac-fig ac-strong" style={{ margin: 0, lineHeight: 'var(--control-height)' }}>{money(balanceOf(account))}</p></div>
          </div>
        ) : Object.keys(perAccount).length ? (
          <div className="lb-from">
            <ul>
              {Object.entries(perAccount).map(([acc, a]) => (
                <li key={acc}><span className="lb-acc"><BrandLogo brand={accBrand(acc)} size={20} decorative />{accName(acc)} <span className="ac-sub" style={{ display: 'inline' }}>· balance {money(balanceOf(acc))}</span></span><span className="ac-fig ac-strong">{money(a)}</span></li>
              ))}
            </ul>
          </div>
        ) : null}
        {short.length ? (
          <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Not enough money.</b> {short.map(([acc, a]) => `${accName(acc)} has ${money(balanceOf(acc))}, this needs ${money(a)}`).join('; ')}. You can still record it if the money was added outside the books.</span></div>
        ) : null}

        <div className="ac-two">
          <div><label className="gc-label" htmlFor="lb-by">Paid by</label><select id="lb-by" className="gc-input gc-select" value={by} onChange={(e) => setBy(e.target.value)}>{STAFF.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="lb-total" aria-live="polite"><span>To pay now · {plural(picked.length, 'person', 'people')}</span><b>{money(total)}</b></div>
        </div>
      </form>
    </Dialog>
  );
}

const blankLine = () => ({ name: '', note: '', amount: '', account: 'brac' });

function AddDialog({ now, onClose }) {
  const [f, setF] = useState(() => ({
    type: 'salary', title: '', party: '', period: monthKey(now), due: dayKey(now + 7 * DAY), channel: 'Shared', note: '', lines: [blankLine()],
  }));
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const setLine = (i, patch) => setF((x) => ({ ...x, lines: x.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const accounts = OWN_ACCOUNTS();
  const t = LIAB_TYPES[f.type];
  const total = r2(f.lines.reduce((a, l) => a + num(l.amount), 0));
  const filled = f.lines.filter((l) => l.name.trim() && num(l.amount) > 0);

  const fillPayroll = () => {
    const payroll = LIAB_SEED[0].lines.map((l) => ({ name: l.name, note: l.note, amount: String(l.amount), account: l.account }));
    setF((x) => {
      const keep = x.lines.filter((l) => l.name.trim() || num(l.amount) > 0);
      return { ...x, lines: [...keep, ...payroll.filter((p) => !keep.some((k) => k.name === p.name))], title: x.title || `${periodLabel(x.period).split(' ')[0]} salaries`, party: x.party || `${payroll.length} staff` };
    });
    toast(`${payroll.length} staff added from the September payroll`);
  };

  const save = (e) => {
    e.preventDefault();
    if (!f.period) { toast('Pick the month it is for', { tone: 'error' }); return; }
    if (!f.due) { toast('Pick the due date', { tone: 'error' }); return; }
    if (!filled.length) { toast('Add at least one line with a name and an amount', { tone: 'error' }); return; }
    const names = filled.map((l) => l.name.trim());
    if (new Set(names).size !== names.length) { toast('Each line needs a different name', { tone: 'error' }); return; }
    const title = f.title.trim() || `${t.label} · ${periodLabel(f.period)}`;
    const party = f.party.trim() || (filled.length === 1 ? filled[0].name.trim() : plural(filled.length, f.type === 'salary' ? 'staff member' : 'person', f.type === 'salary' ? 'staff' : 'people'));
    const channel = f.type === 'salary' || f.channel === 'Shared' ? '' : f.channel;
    const made = addLiability({
      type: f.type, title, party, period: f.period, due: fromDateKey(f.due), channel, note: f.note.trim(),
      lines: filled.map((l) => ({ name: l.name.trim(), note: l.note.trim(), amount: num(l.amount), account: l.account, ...(channel ? { channel } : {}) })),
    });
    toast(`${made.title} added · ${money(made.amount)} to pay by ${formatDate(made.due)}`);
    onClose();
  };

  const footer = (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="submit" form="lb-add-form" className="gc-btn gc-btn--solid">Add liability{total ? ' · ' + money(total) : ''}</button>
    </>
  );
  return (
    <Dialog open title="Add liability" onClose={onClose} footer={footer} width={760}>
      <form id="lb-add-form" className="ac-form" onSubmit={save} noValidate>
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend className="gc-label">What is it for?</legend>
          <div className="lb-types" role="radiogroup" aria-label="Type">
            {TYPE_KEYS.map((k) => (
              <label key={k} className={f.type === k ? 'is-on' : ''}>
                <input type="radio" name="lb-type" value={k} checked={f.type === k} onChange={() => set({ type: k })} data-autofocus={f.type === k ? true : undefined} />
                <Icon name={LIAB_TYPES[k].icon} width="18" height="18" aria-hidden="true" />
                {LIAB_TYPES[k].label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="lb-title">Title</label><input id="lb-title" className="gc-input" placeholder={`${t.label} · ${periodLabel(f.period)}`} value={f.title} onChange={(e) => set({ title: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="lb-party">Owed to</label><input id="lb-party" className="gc-input" placeholder={f.type === 'salary' ? 'For example: 13 staff' : f.type === 'promotion' ? 'Agency, influencer or printer' : 'Person or company'} value={f.party} onChange={(e) => set({ party: e.target.value })} /></div>
        </div>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="lb-period">For the month *</label><input id="lb-period" type="month" className="gc-input" value={f.period} onChange={(e) => set({ period: e.target.value })} aria-required="true" /></div>
          <div><label className="gc-label" htmlFor="lb-due">Due date *</label><input id="lb-due" type="date" className="gc-input" value={f.due} onChange={(e) => set({ due: e.target.value })} aria-required="true" /></div>
        </div>
        {f.type !== 'salary' ? (
          <div className="ac-two">
            <div><label className="gc-label" htmlFor="lb-channel">Channel</label><select id="lb-channel" className="gc-input gc-select" value={f.channel} onChange={(e) => set({ channel: e.target.value })} aria-describedby="lb-channel-help">{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select><p id="lb-channel-help" className="gc-help" style={{ margin: 'var(--space-1) 0 0' }}>The sales channel whose profit carries this cost.</p></div>
            <div><label className="gc-label" htmlFor="lb-note">Note</label><input id="lb-note" className="gc-input" placeholder="Optional" value={f.note} onChange={(e) => set({ note: e.target.value })} /></div>
          </div>
        ) : null}

        <div className="lb-edit">
          <div className="lb-ebar">
            <span className="gc-label" style={{ margin: 0 }}>Lines · one per person or company</span>
            {f.type === 'salary' ? <button type="button" className="gc-btn gc-btn--xs gc-btn--soft" onClick={fillPayroll}><Icon name="wand-sparkles" width="14" height="14" aria-hidden="true" /> Fill from payroll</button> : null}
          </div>
          <div className="lb-erow lb-ehead" aria-hidden="true"><span>Name</span><span>Note</span><span>Amount (৳)</span><span>Usual account</span><span /></div>
          {f.lines.map((l, i) => (
            <div key={i} className="lb-erow">
              <input className="gc-input" aria-label={`Line ${i + 1} name`} placeholder="Name" value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} />
              <input className="gc-input" aria-label={`Line ${i + 1} note`} placeholder="Note" value={l.note} onChange={(e) => setLine(i, { note: e.target.value })} />
              <input className="gc-input ac-fig" inputMode="decimal" aria-label={`Line ${i + 1} amount`} placeholder="0" value={l.amount} onChange={(e) => setLine(i, { amount: e.target.value.replace(/[^\d.]/g, '') })} style={{ textAlign: 'right' }} />
              <select className="gc-input gc-select" aria-label={`Line ${i + 1} usual account`} value={l.account} onChange={(e) => setLine(i, { account: e.target.value })}>
                {['Bank', 'Mobile', 'Cash'].map((tp) => {
                  const group = accounts.filter((a) => a.type === tp);
                  return group.length ? <optgroup key={tp} label={tp === 'Mobile' ? 'Mobile wallets' : tp}>{group.map((a) => <option key={a.id} value={a.id}>{accName(a.id)}</option>)}</optgroup> : null;
                })}
              </select>
              <button type="button" className="gc-iconbtn" aria-label={`Remove line ${i + 1}`} disabled={f.lines.length === 1} onClick={() => setF((x) => ({ ...x, lines: x.lines.filter((_, j) => j !== i) }))}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
            </div>
          ))}
          <div className="lb-ebar">
            <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => set({ lines: [...f.lines, blankLine()] })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Add line</button>
            <span className="ac-sub">{plural(filled.length, 'line')} · total <b className="ac-fig ac-strong">{money(total)}</b></span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
