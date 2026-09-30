'use client';
// ExpensesBills — every taka that leaves the business and is not a move between the shop's own
// accounts, in one place: expenses, salaries, supplier payments, the owner's withdrawals (and money
// the owner puts in), and what gateways and couriers keep as fees.
//   KPI row      spent this month, supplier bills still to pay, owner withdrawals, gateway & COD fees
//   Money out    the ledger rows of those kinds, filtered by type, month and a search
//   Side         spend by category (bars) and the supplier bills to pay next, each with a Pay link
//   Dialogs      Record expense (posts 'expense' or 'salary') and Owner withdraw / investment
// Front end only: rows come from src/lib/ledger.js, bills from src/lib/supplierBills.js and payout
// fees from src/lib/settlements.js. Everything re-reads when money moves (useBooks).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatTime } from '@/lib/format';
import { KIND_LABEL, balanceOf, getEntries, postEntry } from '@/lib/ledger';
import { getBills, getSuppliers, supplierById, billLeft, billStatus, daysFrom, dayStart } from '@/lib/supplierBills';
import { clockNow, getPayouts, dayKey, fromKey } from '@/lib/settlements';
import { AccPage, AccountSelect, money, signed, shortDate, accName, accBrand, useBooks } from './accShared';

// ---- what counts as money going out --------------------------------------------------------------
const GROUPS = [
  ['all', 'All'],
  ['expense', 'Expenses'],
  ['salary', 'Salaries'],
  ['supplier', 'Supplier payments'],
  ['owner', 'Owner & investment'],
  ['fees', 'Partner fees'],
];
const GROUP_KINDS = {
  expense: ['expense'],
  salary: ['salary'],
  supplier: ['supplier payment'],
  owner: ['owner withdraw', 'investment'],
  fees: ['partner fee', 'courier charge', 'settlement difference'],
};
const OUT_KINDS = new Set([...Object.values(GROUP_KINDS).flat(), 'paid out']);
const SPEND_KINDS = new Set(['expense', 'salary']);
const CATEGORIES = ['Rent', 'Utilities', 'Salary', 'Transport', 'Marketing', 'Packaging', 'Internet & phone', 'Repairs', 'Office', 'Other'];
const MONTHS = [['this', 'This month'], ['last', 'Last month'], ['all', 'All time']];
const PAGE = 50;
const DAY = 864e5;

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
/** [start, end) of this month (0) or an earlier one (-1 = last month). */
function monthRange(now, back = 0) {
  const d = new Date(now);
  return [new Date(d.getFullYear(), d.getMonth() + back, 1).getTime(), new Date(d.getFullYear(), d.getMonth() + back + 1, 1).getTime()];
}
const inRange = (t, [a, b]) => t >= a && t < b;
const monthName = (t) => new Date(t).toLocaleString('en', { month: 'long', year: 'numeric' });
const catOf = (e) => e.cat || (e.kind === 'salary' ? 'Salary' : 'Other');
const spentOf = (list) => r2(list.reduce((a, e) => a - e.amount, 0));

const CSS = `
.eb-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-5) var(--space-4)}
.eb-chips{display:flex;flex-wrap:wrap;gap:var(--space-1)}
.eb-chips .gc-seg__btn b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.eb-tools{display:flex;flex-wrap:wrap;gap:var(--space-2);flex:1 1 320px;justify-content:flex-end}
.eb-tools .gc-select{flex:0 1 170px;min-width:140px}
.eb-tools .gc-field__wrap{flex:1 1 200px;min-width:0;max-width:320px}
.eb-what{min-width:180px}
.eb-what .ac-sub{white-space:normal}
.eb-acc{display:flex;align-items:center;gap:var(--space-2);white-space:nowrap}
.eb-more{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.eb-cats{list-style:none;margin:0;padding:0 var(--space-5) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.eb-cat{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px var(--space-3);font-size:var(--text-sm)}
.eb-cat span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-body)}
.eb-cat small{font-size:var(--text-xs);color:var(--text-muted);margin-left:6px}
.eb-track{grid-column:1 / -1;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.eb-fill{height:100%;border-radius:var(--radius-full);background:var(--primary)}
.eb-bills{list-style:none;margin:0;padding:0}
.eb-bill{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--space-1) var(--space-3);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.eb-bill .ac-strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eb-bill-side{display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-1)}
.eb-bill-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin-top:2px}
.eb-foot{display:flex;justify-content:flex-end;padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.eb-link{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:4px}
.eb-link:hover{text-decoration:underline}
.eb-wait{padding:var(--space-8) var(--space-5);text-align:center;font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function ExpensesBills() {
  const tick = useBooks();
  const ready = tick > 0;   // browser-stored data only after mount, so the first render matches the server
  const [group, setGroup] = useState('all');
  const [month, setMonth] = useState('this');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [dialog, setDialog] = useState(null);   // 'expense' | 'owner'

  const data = useMemo(() => {
    if (!ready) return null;
    const now = clockNow();
    const thisM = monthRange(now, 0), lastM = monthRange(now, -1);
    const out = getEntries().filter((e) => OUT_KINDS.has(e.kind)).sort((a, b) => b.at - a.at);
    const spend = out.filter((e) => SPEND_KINDS.has(e.kind) && e.amount < 0);
    const owner = out.filter((e) => e.kind === 'owner withdraw');
    const invest = out.filter((e) => e.kind === 'investment');
    // gateway & COD fees: fee + delivery charge of every payout received this month
    const received = getPayouts(now).filter((p) => p.status === 'received' || p.status === 'review');
    const feesIn = (range) => received.filter((p) => inRange(p.at || p.date, range));
    const feeSum = (list) => r2(list.reduce((a, p) => a + p.fee + p.charge, 0));
    // supplier bills still to pay
    const today = dayStart(now);
    const suppliers = getSuppliers();
    const open = getBills().filter((b) => billLeft(b) > 0).sort((a, b) => a.due - b.due)
      .map((b) => ({ ...b, left: billLeft(b), state: billStatus(b, today), days: daysFrom(b.due, today), sup: supplierById(b.supplier, suppliers) }));
    return {
      now, thisM, lastM, out, spend, open,
      kpi: {
        spent: spentOf(spend.filter((e) => inRange(e.at, thisM))),
        spentLast: spentOf(spend.filter((e) => inRange(e.at, lastM))),
        billsDue: r2(open.reduce((a, b) => a + b.left, 0)),
        overdue: open.filter((b) => b.state === 'Overdue'),
        owner: spentOf(owner.filter((e) => inRange(e.at, thisM))),
        ownerLast: spentOf(owner.filter((e) => inRange(e.at, lastM))),
        investIn: r2(invest.filter((e) => inRange(e.at, thisM)).reduce((a, e) => a + e.amount, 0)),
        fees: feeSum(feesIn(thisM)),
        feePayouts: feesIn(thisM).length,
        feesLast: feeSum(feesIn(lastM)),
      },
    };
  }, [ready, tick]);

  // on the first day of a month there is little to show: open on last month instead
  const picked = useRef(false);
  useEffect(() => {
    if (!data || picked.current) return;
    picked.current = true;
    if (!data.out.some((e) => inRange(e.at, data.thisM))) setMonth('last');
    // ?add=expense|owner (from the Accounts overview) opens that form
    const u = new URL(window.location.href);
    const add = u.searchParams.get('add');
    if (add === 'expense' || add === 'owner') {
      setDialog(add);
      u.searchParams.delete('add');
      window.history.replaceState(window.history.state, '', u.pathname + u.search);
    }
  }, [data]);

  useEffect(() => { setLimit(PAGE); }, [group, month, query]);

  const range = data ? (month === 'this' ? data.thisM : month === 'last' ? data.lastM : null) : null;
  const inMonth = useMemo(() => (data ? data.out.filter((e) => !range || inRange(e.at, range)) : []), [data, range]);
  const counts = useMemo(() => Object.fromEntries(GROUPS.map(([id]) => [id, id === 'all' ? inMonth.length : inMonth.filter((e) => GROUP_KINDS[id].includes(e.kind)).length])), [inMonth]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inMonth.filter((e) => (group === 'all' || GROUP_KINDS[group].includes(e.kind))
      && (!q || [e.cat, KIND_LABEL[e.kind], e.party, e.note, e.ref, e.by, accName(e.account)].some((x) => String(x || '').toLowerCase().includes(q))));
  }, [inMonth, group, query]);
  const rowsTotal = r2(rows.reduce((a, e) => a + e.amount, 0));

  const cats = useMemo(() => {
    const by = {};
    inMonth.filter((e) => SPEND_KINDS.has(e.kind) && e.amount < 0).forEach((e) => { by[catOf(e)] = r2((by[catOf(e)] || 0) - e.amount); });
    const list = Object.entries(by).sort((a, b) => b[1] - a[1]);
    const total = r2(list.reduce((a, [, v]) => a + v, 0));
    const top = list.slice(0, 6);
    const rest = r2(list.slice(6).reduce((a, [, v]) => a + v, 0));
    return { top: rest ? [...top, ['Everything else', rest]] : top, total, max: top.length ? top[0][1] : 0 };
  }, [inMonth]);

  const periodText = !data ? '' : month === 'this' ? monthName(data.thisM[0]) : month === 'last' ? monthName(data.lastM[0]) : 'All time';
  const k = data && data.kpi;
  const close = () => setDialog(null);

  const actions = (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDialog('owner')}><Icon name="hand-coins" width="18" height="18" aria-hidden="true" /> Owner withdraw / investment</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={() => setDialog('expense')}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Record expense</button>
    </>
  );

  return (
    <AccPage screen="ExpensesBills" active="acc-spend" page="Expenses & bills" title="Expenses & bills" css={CSS}
      description="All money going out in one place: expenses, salaries, supplier payments, owner withdrawals and partner fees. Moves between your own accounts are not counted here."
      actions={actions}>

      <div className="gc-kpis gc-kpis--tight">
        <Kpi icon="receipt" tone="primary" label="Spent this month" value={k ? money(k.spent) : '—'} sub={k ? `Last month ${money(k.spentLast)}` : ''} />
        <Kpi icon="file-clock" tone={k && k.overdue.length ? 'error' : 'warning'} label="Bills to pay" value={k ? money(k.billsDue) : '—'} sub={k ? (k.overdue.length ? `${plural(k.overdue.length, 'bill')} overdue` : 'Nothing overdue') : ''} />
        <Kpi icon="piggy-bank" tone="info" label="Owner took, this month" value={k ? money(k.owner) : '—'} sub={k ? (k.investIn ? `${money(k.investIn)} put in this month` : `Last month ${money(k.ownerLast)}`) : ''} />
        <Kpi icon="percent" tone="slate" label="Partner fees, this month" value={k ? money(k.fees) : '—'} sub={k ? (k.feePayouts ? `From ${plural(k.feePayouts, 'payout')} received` : `Last month ${money(k.feesLast)}`) : ''} />
      </div>

      <div className="gc-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,360px)', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* ---- money out ---- */}
        <section className="gc-card ac-card" aria-labelledby="eb-out-title">
          <div className="ac-head">
            <div>
              <h2 id="eb-out-title">Money out</h2>
              <p>{data ? `${periodText} · ${plural(rows.length, 'payment')} · ${rowsTotal < 0 ? '−' : ''}${money(rowsTotal)} net` : 'Loading'}</p>
            </div>
          </div>
          <div className="eb-bar">
            <div className="gc-seg eb-chips" role="group" aria-label="Show">
              {GROUPS.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={group === id} className={'gc-seg__btn' + (group === id ? ' gc-seg__btn--active' : '')} onClick={() => setGroup(id)}>
                  {label}{data ? <b>{counts[id]}</b> : null}
                </button>
              ))}
            </div>
            <div className="eb-tools">
              <label className="sr-only" htmlFor="eb-month">Month</label>
              <select id="eb-month" className="gc-input gc-select" value={month} onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <div className="gc-field__wrap">
                <span className="gc-field__icon"><Icon name="search" width="18" height="18" aria-hidden="true" /></span>
                <input type="search" className="gc-input gc-input--with-icon" placeholder="Search who, what or note" aria-label="Search money out" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
          </div>

          {!data ? <p className="eb-wait">Loading the books…</p> : rows.length ? (
            <>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact gc-table--hoverable">
                  <thead>
                    <tr><th scope="col">Date</th><th scope="col">What</th><th scope="col">Paid from</th><th scope="col" className="ac-num">Amount</th></tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, limit).map((e) => (
                      <tr key={e.id}>
                        <td style={{ whiteSpace: 'nowrap' }}><span className="ac-strong">{shortDate(e.at)}</span><span className="ac-sub">{formatTime(e.at)}{e.by ? ' · ' + e.by : ''}</span></td>
                        <td className="eb-what">
                          <span className="ac-strong">{e.cat || KIND_LABEL[e.kind] || e.kind}</span>
                          <span className="ac-sub">{[e.cat ? KIND_LABEL[e.kind] : '', e.party, e.note].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' · ') || '—'}</span>
                        </td>
                        <td><span className="eb-acc"><BrandLogo brand={accBrand(e.account)} size={24} decorative />{accName(e.account)}</span></td>
                        <td className={'ac-num ac-fig ' + (e.amount < 0 ? 'ac-out' : 'ac-in')}>{signed(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="eb-more">
                <span>Showing {Math.min(limit, rows.length)} of {rows.length}</span>
                {rows.length > limit ? <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => setLimit((n) => n + PAGE)}>Show more</button> : null}
              </div>
            </>
          ) : (
            <EmptyState icon={query ? 'search-x' : 'receipt'}
              title={query ? 'Nothing matches that search' : `No money out ${month === 'all' ? 'yet' : 'in ' + periodText}`}
              body={query ? 'Try another word, or clear the search.' : month === 'this' ? 'Nothing has been paid this month yet. Look at last month, or record an expense.' : 'Record an expense when you pay for something.'}
              actionLabel={query ? 'Clear search' : month === 'this' ? 'Show last month' : 'Record expense'}
              onAction={() => (query ? setQuery('') : month === 'this' ? setMonth('last') : setDialog('expense'))} />
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', minWidth: 0 }}>
          {/* ---- spend by category ---- */}
          <section className="gc-card ac-card" aria-labelledby="eb-cat-title">
            <div className="ac-head">
              <div>
                <h2 id="eb-cat-title">Spend by category</h2>
                <p>{data ? `${periodText} · expenses and salaries · ${money(cats.total)}` : 'Loading'}</p>
              </div>
            </div>
            {!data ? null : cats.top.length ? (
              <ul className="eb-cats">
                {cats.top.map(([name, amt]) => (
                  <li key={name} className="eb-cat">
                    <span>{name}<small>{cats.total ? Math.round((amt / cats.total) * 100) : 0}%</small></span>
                    <b className="ac-fig ac-strong">{money(amt)}</b>
                    <div className="eb-track" aria-hidden="true"><div className="eb-fill" style={{ width: `${cats.max ? Math.max(2, Math.min(100, (amt / cats.max) * 100)) : 0}%` }} /></div>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon="chart-bar" title="No spending yet" body={`No expenses or salaries in ${periodText === 'All time' ? 'the books' : periodText}.`} />}
          </section>

          {/* ---- bills to pay ---- */}
          <section className="gc-card ac-card" aria-labelledby="eb-bills-title">
            <div className="ac-head">
              <div>
                <h2 id="eb-bills-title">Bills to pay</h2>
                <p>{data ? (data.open.length ? `${plural(data.open.length, 'open bill')} · ${money(k.billsDue)} left` : 'All supplier bills are paid') : 'Loading'}</p>
              </div>
            </div>
            {!data ? null : data.open.length ? (
              <ul className="eb-bills">
                {data.open.slice(0, 6).map((b) => (
                  <li key={b.no} className="eb-bill">
                    <div style={{ minWidth: 0 }}>
                      <span className="ac-strong">{b.sup ? b.sup.name : b.supplier}</span>
                      <div className="eb-bill-meta">
                        <span className="ac-id">{b.no}</span>
                        <DueBadge days={b.days} />
                      </div>
                    </div>
                    <div className="eb-bill-side">
                      <span className="ac-fig ac-strong">{money(b.left)}</span>
                      <Link className="gc-btn gc-btn--xs gc-btn--soft" href={`/suppliers?pay=${encodeURIComponent(b.supplier)}`} aria-label={`Pay ${b.sup ? b.sup.name : b.supplier}, bill ${b.no}`}>Pay</Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon="circle-check" title="No bills to pay" body="Bills appear here when you receive goods from a supplier on credit." />}
            <div className="eb-foot"><Link className="eb-link" href="/suppliers">All suppliers <Icon name="chevron-right" width="14" height="14" aria-hidden="true" /></Link></div>
          </section>
        </div>
      </div>

      {dialog === 'expense' ? <ExpenseDialog onClose={close} /> : null}
      {dialog === 'owner' ? <OwnerDialog onClose={close} /> : null}
    </AccPage>
  );
}

// ---- small pieces --------------------------------------------------------------------------------
const TONES = {
  primary: ['var(--fill-primary-soft)', 'var(--primary)'],
  info: ['var(--fill-info-soft)', 'var(--text-info)'],
  warning: ['var(--fill-warning-soft)', 'var(--text-warning)'],
  error: ['var(--fill-error-soft)', 'var(--text-danger)'],
  slate: ['var(--surface-subtle)', 'var(--text-body)'],
};
function Kpi({ icon, tone, label, value, sub }) {
  const [bg, fg] = TONES[tone] || TONES.slate;
  return (
    <div className="gc-kpi">
      <span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="24" height="24" aria-hidden="true" /></span>
      <div className="gc-kpi__text">
        <p className="gc-kpi__label" title={label}>{label}</p>
        <p className="gc-kpi__value ac-fig">{value}</p>
        {sub ? <span className="ac-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sub}>{sub}</span> : null}
      </div>
    </div>
  );
}

function DueBadge({ days }) {
  if (days < 0) return <StatusBadge tone="error">Overdue {plural(-days, 'day')}</StatusBadge>;
  if (days === 0) return <StatusBadge tone="warning">Due today</StatusBadge>;
  return <StatusBadge tone={days <= 3 ? 'warning' : 'neutral'} icon="calendar">Due in {plural(days, 'day')}</StatusBadge>;
}

const cleanAmount = (v) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');

// ---- record expense ------------------------------------------------------------------------------
function ExpenseDialog({ onClose }) {
  const today = dayKey(clockNow());
  const [cat, setCat] = useState('');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('cash-shop');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  const amt = r2(amount);
  const balance = balanceOf(account);
  const errors = {
    cat: cat ? '' : 'Choose what the money was for.',
    amount: amt > 0 ? '' : 'Enter the amount paid.',
    date: !date ? 'Pick the day it was paid.' : date > today ? 'The date can’t be in the future.' : '',
  };
  const show = (f) => (tried ? errors[f] : '');

  const save = (e) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    const row = postEntry({
      account, amount: -amt, kind: cat === 'Salary' ? 'salary' : 'expense', cat,
      party: party.trim() || cat, note: note.trim(), by: 'Staff',
      ...(date !== today ? { at: fromKey(date) + 12 * 3600e3 } : {}),
    });
    if (!row) { toast('That account could not be found', { tone: 'error' }); return; }
    toast(`${money(amt)} for ${cat.toLowerCase()} recorded from ${accName(account)}`);
    onClose();
  };

  return (
    <Dialog open title="Record expense" onClose={onClose} width={560}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="eb-exp-form" className="gc-btn gc-btn--solid">Save expense</button></>}>
      <form id="eb-exp-form" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="eb-cat">Category</label>
            <select id="eb-cat" className={'gc-input gc-select' + (show('cat') ? ' gc-input--error' : '')} value={cat} onChange={(e) => setCat(e.target.value)} aria-invalid={!!show('cat')} aria-describedby={show('cat') ? 'eb-cat-err' : undefined} data-autofocus>
              <option value="">Choose…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {show('cat') ? <p id="eb-cat-err" className="gc-help gc-help--error">{errors.cat}</p> : null}
          </div>
          <div>
            <label className="gc-label" htmlFor="eb-party">Paid to</label>
            <input id="eb-party" className="gc-input" value={party} onChange={(e) => setParty(e.target.value)} placeholder={cat === 'Salary' ? 'Staff name' : 'Shop, person or company'} />
          </div>
        </div>
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="eb-amount">Amount (৳)</label>
            <input id="eb-amount" className={'gc-input ac-fig' + (show('amount') ? ' gc-input--error' : '')} inputMode="decimal" value={amount} onChange={(e) => setAmount(cleanAmount(e.target.value))} aria-invalid={!!show('amount')} aria-describedby={show('amount') ? 'eb-amount-err' : undefined} />
            {show('amount') ? <p id="eb-amount-err" className="gc-help gc-help--error">{errors.amount}</p> : null}
          </div>
          <AccountSelect id="eb-account" label="Paid from" value={account} onChange={setAccount} describedBy={amt > balance ? 'eb-low' : undefined} />
        </div>
        {amt > balance ? (
          <div id="eb-low" className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>{accName(account)} has {money(balance)}.</b> Paying {money(amt)} from it takes it below zero. Check the account, or save anyway if the money did go out.</span></div>
        ) : null}
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="eb-date">Paid on</label>
            <input id="eb-date" type="date" className={'gc-input' + (show('date') ? ' gc-input--error' : '')} value={date} max={today} onChange={(e) => setDate(e.target.value)} aria-invalid={!!show('date')} aria-describedby={show('date') ? 'eb-date-err' : undefined} />
            {show('date') ? <p id="eb-date-err" className="gc-help gc-help--error">{errors.date}</p> : null}
          </div>
          <div>
            <label className="gc-label" htmlFor="eb-note">Note</label>
            <input id="eb-note" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional, e.g. October rent" />
          </div>
        </div>
      </form>
    </Dialog>
  );
}

// ---- owner takes money out / puts money in -------------------------------------------------------
function OwnerDialog({ onClose }) {
  const [mode, setMode] = useState('out');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('brac');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const out = mode === 'out';
  const amt = r2(amount);
  const balance = balanceOf(account);
  const err = tried && !(amt > 0) ? 'Enter the amount.' : '';

  const save = (e) => {
    e.preventDefault();
    setTried(true);
    if (!(amt > 0)) return;
    const row = postEntry({
      account, amount: out ? -amt : amt, kind: out ? 'owner withdraw' : 'investment', party: 'Owner',
      note: note.trim() || (out ? 'Owner draw' : 'Owner put money in'), by: 'Staff',
    });
    if (!row) { toast('That account could not be found', { tone: 'error' }); return; }
    toast(out ? `Owner took ${money(amt)} from ${accName(account)}` : `Owner put ${money(amt)} into ${accName(account)}`);
    onClose();
  };

  return (
    <Dialog open title="Owner withdraw / investment" onClose={onClose} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="eb-own-form" className="gc-btn gc-btn--solid">{out ? 'Record withdrawal' : 'Record investment'}</button></>}>
      <form id="eb-own-form" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-seg" role="group" aria-label="Which way does the money go?" style={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}>
          <button type="button" aria-pressed={out} onClick={() => setMode('out')}>Owner takes money out</button>
          <button type="button" aria-pressed={!out} onClick={() => setMode('in')}>Owner puts money in</button>
        </div>
        <p className="gc-help" style={{ margin: 0 }}>{out ? 'Money the owner takes for personal use. It is not a business expense, so it does not lower profit.' : 'Money the owner adds to the business, for example to buy stock. It is not a sale.'}</p>
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="eb-own-amount">Amount (৳)</label>
            <input id="eb-own-amount" className={'gc-input ac-fig' + (err ? ' gc-input--error' : '')} inputMode="decimal" value={amount} onChange={(e) => setAmount(cleanAmount(e.target.value))} aria-invalid={!!err} aria-describedby={err ? 'eb-own-err' : undefined} data-autofocus />
            {err ? <p id="eb-own-err" className="gc-help gc-help--error">{err}</p> : null}
          </div>
          <AccountSelect id="eb-own-account" label={out ? 'Taken from' : 'Put into'} value={account} onChange={setAccount} describedBy={out && amt > balance ? 'eb-own-low' : undefined} />
        </div>
        {out && amt > balance ? (
          <div id="eb-own-low" className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>{accName(account)} has {money(balance)}.</b> Taking {money(amt)} takes it below zero.</span></div>
        ) : null}
        <div>
          <label className="gc-label" htmlFor="eb-own-note">Note</label>
          <input id="eb-own-note" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={out ? 'Optional, e.g. monthly draw' : 'Optional, e.g. for Eid stock'} />
        </div>
      </form>
    </Dialog>
  );
}
