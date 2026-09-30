'use client';
// Liabilities — money the shop owes that is not a supplier bill: staff salaries, sales commission,
// affiliate payouts and promotions (influencers, ad agencies, printing, stalls) and anything else.
//   List     one card per liability: who is owed, for which month, when it is due, how much is
//            paid; the chevron opens its lines (one per person) and the payments made so far.
//   Pay      tick the people to pay now (part payments allowed), pay each from their usual account
//            or everyone from one account, and say who paid. Every line paid posts to the money book.
//   Add      a new liability with its lines; "Fill from payroll" copies the month's 13 staff salaries.
// ?id=<liability id> opens that liability's Pay window. Front end only: src/lib/liabilities.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatDate } from '@/lib/format';
import { OWN_ACCOUNTS, balanceOf } from '@/lib/ledger';
import { clockNow, startOfDay, dayKey } from '@/lib/settlements';
import { getLiabilities, LIAB_TYPES, LIAB_TONE, LIAB_SEED, paidOf, leftOf, liabStatus, addLiability, payLiability } from '@/lib/liabilities';
import { AccPage, AccountSelect, useBooks, money, accName, accBrand } from './accShared';

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
      <span className={'gc-badge gc-badge--' + tone}>{words}</span>
      {st === 'Part paid' ? <span className={'gc-badge gc-badge--' + LIAB_TONE['Part paid']}>Part paid</span> : null}
    </>
  );
}

const CSS = `
.lb-tools{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.lb-tools .gc-seg{flex-wrap:wrap}
.lb-tools .gc-seg__btn b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-family:var(--font-data)}
.lb-tools .gc-seg__btn[aria-pressed="true"] b{color:inherit}
.lb-status{width:auto;min-width:150px}
.lb-item{border-top:1px solid var(--border-subtle)}
.lb-item:first-child{border-top:0}
.lb-row{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1.2fr) auto;align-items:center;gap:var(--space-4);padding:var(--space-4) var(--space-5)}
.lb-main{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.lb-tile{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.lb-main b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.lb-main small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.lb-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.lb-due{display:flex;flex-direction:column;align-items:flex-start;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.lb-due > span:first-child{display:flex;flex-wrap:wrap;gap:4px}
.lb-prog{display:flex;flex-direction:column;gap:6px;min-width:0}
.lb-prog .gc-progress{height:4px}
.lb-prog .gc-progress__fill.is-done{background:var(--text-success)}
.lb-prog p{display:flex;justify-content:space-between;gap:var(--space-2);margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.lb-left{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.lb-acts{display:flex;align-items:center;justify-content:flex-end;gap:var(--space-2)}
.lb-chev svg{transition:transform var(--duration-base) var(--ease-out)}
.lb-chev[aria-expanded="true"] svg{transform:rotate(180deg)}
.lb-more{display:flex;flex-direction:column;gap:var(--space-4);padding:0 var(--space-5) var(--space-5)}
.lb-more h3{margin:0 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lb-more .gc-table-wrap{border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
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
@media (max-width:1024px){.lb-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.lb-acts{grid-column:1 / -1;justify-content:flex-start}}
@media (max-width:640px){.lb-row{grid-template-columns:minmax(0,1fr)}.lb-line{grid-template-columns:auto minmax(0,1fr)}.lb-line .gc-input{grid-column:2}.lb-erow{grid-template-columns:1fr 1fr}.lb-ehead{display:none}}
`;

export default function Liabilities() {
  const tick = useBooks();
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('open');
  const [open, setOpen] = useState({});      // id → expanded
  const [payId, setPayId] = useState('');
  const [adding, setAdding] = useState(false);

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
  const rank = { Overdue: 0, 'Part paid': 1, Due: 1, Paid: 2 };
  const shown = pool.filter((l) => type === 'all' || l.type === type)
    .sort((a, b) => rank[liabStatus(a, data.now)] - rank[liabStatus(b, data.now)] || a.due - b.due);
  const payL = data && payId ? data.list.find((l) => l.id === payId) : null;

  const kpi = (icon, bg, fg, label, value, sub) => (
    <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">{label}</p><p className="gc-kpi__value">{data ? value : '—'}<small>{data ? sub : ''}</small></p></div></div>
  );

  return (
    <AccPage screen="Liabilities" active="acc-liab" page="Liabilities" title="Liabilities" css={CSS}
      description="Money the shop owes that is not a supplier bill: salaries, sales commission, affiliate payouts and promotions."
      actions={<>
        <Link href="/dues?tab=owe" className="gc-btn gc-btn--neutral"><Icon name="scale" width="18" height="18" aria-hidden="true" /> All dues</Link>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => setAdding(true)}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add liability</button>
      </>}>
      <div className="gc-kpis gc-kpis--tight">
        {kpi('hand-coins', 'var(--fill-primary-soft)', 'var(--primary)', 'Owed now', data && money(data.owed), data && plural(data.openCount, 'liability', 'liabilities'))}
        {kpi('clock-alert', 'var(--fill-error-soft)', 'var(--text-danger)', 'Overdue', data && money(data.overdue.amt), data && plural(data.overdue.n, 'liability', 'liabilities'))}
        {kpi('calendar-clock', 'var(--fill-warning-soft)', 'var(--text-warning)', 'Due in the next 7 days', data && money(data.soon.amt), data && plural(data.soon.n, 'liability', 'liabilities'))}
        {kpi('circle-check', 'var(--fill-success-soft)', 'var(--text-success)', 'Paid this month', data && money(data.paidMonth.amt), data && `${plural(data.paidMonth.n, 'payment')} · ${data.paidMonth.label}`)}
      </div>

      <section className="gc-card ac-card" aria-label="Liabilities">
        <div className="lb-tools">
          <div className="gc-seg" role="group" aria-label="Type">
            {[['all', 'All'], ...TYPE_KEYS.map((k) => [k, LIAB_TYPES[k].label])].map(([k, label]) => (
              <button key={k} type="button" className={'gc-seg__btn' + (type === k ? ' gc-seg__btn--active' : '')} aria-pressed={type === k} onClick={() => setType(k)}>{label}<b>{counts[k] || 0}</b></button>
            ))}
          </div>
          <select className="gc-input gc-select lb-status" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_FILTER.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {!data ? <EmptyState icon="loader" title="Reading the books" /> : shown.length === 0 ? (
          <EmptyState icon="circle-check" title={status === 'open' ? 'Nothing left to pay here' : 'Nothing here'} body={status === 'open' ? 'Every liability of this type is paid.' : 'No liabilities match this filter.'} actionLabel="Add liability" onAction={() => setAdding(true)} />
        ) : (
          <div>
            {shown.map((l) => <LiabItem key={l.id} l={l} now={data.now} open={!!open[l.id]} onToggle={() => setOpen((o) => ({ ...o, [l.id]: !o[l.id] }))} onPay={() => setPayId(l.id)} />)}
          </div>
        )}
      </section>

      {payL ? <PayDialog l={payL} onClose={() => setPayId('')} /> : null}
      {adding && data ? <AddDialog now={data.now} onClose={() => setAdding(false)} /> : null}
    </AccPage>
  );
}

function LiabItem({ l, now, open, onToggle, onPay }) {
  const t = LIAB_TYPES[l.type] || LIAB_TYPES.other;
  const paid = paidOf(l), left = leftOf(l);
  const pct = l.amount ? Math.min(100, Math.round((paid / l.amount) * 100)) : 0;
  const moreId = 'lb-more-' + l.id;
  return (
    <article className="lb-item" aria-label={l.title}>
      <div className="lb-row">
        <div className="lb-main">
          <span className="lb-tile" aria-hidden="true"><Icon name={t.icon} width="20" height="20" /></span>
          <span style={{ minWidth: 0 }}>
            <b>{l.title}</b>
            <small>{l.party} · {periodLabel(l.period)} · <span className="ac-fig">{l.id}</span></small>
            <span className="lb-badges">
              <span className="gc-badge gc-badge--slate">{t.label}</span>
              {l.channel ? <span className="gc-badge gc-badge--info">{l.channel}</span> : null}
            </span>
          </span>
        </div>
        <div className="lb-due">
          <span><DueWords l={l} now={now} /></span>
          <span>Due {formatDate(l.due)}</span>
        </div>
        <div className="lb-prog">
          <p><span>{money(paid)} paid of {money(l.amount)}</span><span className="lb-left">{left > 0 ? money(left) + ' left' : 'Paid'}</span></p>
          <div className="gc-progress" role="progressbar" aria-label={`Paid of ${l.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className={'gc-progress__fill' + (left <= 0 ? ' is-done' : '')} style={{ width: pct + '%' }} /></div>
        </div>
        <div className="lb-acts">
          {left > 0 ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onPay} aria-label={`Pay ${l.title}`}>Pay</button> : null}
          <button type="button" className="gc-iconbtn lb-chev" aria-expanded={open} aria-controls={moreId} onClick={onToggle} aria-label={`${open ? 'Hide' : 'Show'} lines and payments of ${l.title}`}><Icon name="chevron-down" width="18" height="18" aria-hidden="true" /></button>
        </div>
      </div>
      {open ? (
        <div className="lb-more" id={moreId}>
          {l.note ? <p className="lb-note">{l.note}</p> : null}
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
        </div>
      ) : null}
    </article>
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
