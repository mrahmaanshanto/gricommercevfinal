'use client';
// ExpensesBills — "Income & expenses": every taka that went out and every taka that came in that is
// not a sale, in one place: expenses, salaries, sales commission, affiliate payouts, promotions,
// supplier payments, the owner's withdrawals (and money the owner puts in), what gateways and
// couriers keep as fees, and other income (supplier bonuses, bank interest, scrap sales …).
// Laid out like a Shopify list (docs/shopify-style.md):
//   Figures      spent this month, other income this month, owed now (→ Bills to pay), partner fees
//   Card         the ledger rows of those kinds: a view per type, the month, a search, the pager; a cost's
//                sales channel (categories.js homeOf) is in the row's tooltip and on Spend by category
//   Below        spend by category (bars, labelled with their channel); Dues and Bills to pay are in More
//   Dialogs      Record expense (category list from categories.js; posts 'expense' or 'salary'),
//                Record income (posts 'income'; a supplier bonus can instead be taken as credit on
//                their bills, supplierBills.js addCredit, with no money moving) and Owner withdraw /
//                investment. ?add=expense|income|owner opens one.
// Front end only: rows come from src/lib/ledger.js, owed amounts from src/lib/liabilities.js and
// payout fees from src/lib/settlements.js. Everything re-reads when money moves (useBooks).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, InfoTip } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, Pager, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { formatTime } from '@/lib/format';
import { KIND_LABEL, balanceOf, getEntries, postEntry } from '@/lib/ledger';
import { getSuppliers, payableOf, addCredit } from '@/lib/supplierBills';
import { getCategories, homeOf } from '@/lib/categories';
import { getLiabilities, leftOf, liabStatus } from '@/lib/liabilities';
import { clockNow, getPayouts, dayKey, fromKey } from '@/lib/settlements';
import { AccPage, AccountSelect, money, signed, shortDate, accName, accBrand, useBooks } from './accShared';

// ---- what counts: money going out, and money in that is not a sale -------------------------------
const GROUPS = [
  ['all', 'All'],
  ['expense', 'Expenses'],
  ['income', 'Income'],
  ['salary', 'Salaries'],
  ['commission', 'Commission & affiliates'],
  ['promotion', 'Promotions'],
  ['supplier', 'Supplier payments'],
  ['owner', 'Owner & investment'],
  ['fees', 'Partner fees'],
];
const GROUP_KINDS = {
  expense: ['expense'],
  income: ['income'],
  salary: ['salary'],
  commission: ['commission', 'affiliate payout'],
  promotion: ['promotion'],
  supplier: ['supplier payment'],
  owner: ['owner withdraw', 'investment'],
  fees: ['partner fee', 'courier charge', 'settlement difference'],
};
const OUT_KINDS = new Set([...Object.values(GROUP_KINDS).flat(), 'paid out']);
// costs that count against a channel's profit (spend KPI, category card, channel line)
const SPEND_KINDS = new Set(['expense', 'salary', 'commission', 'affiliate payout', 'promotion', 'paid out']);
const BONUS_ID = 'supplier-bonus';
const MONTHS = [['this', 'This month'], ['last', 'Last month'], ['all', 'All time']];
const PAGE = 50;

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
/** [start, end) of this month (0) or an earlier one (-1 = last month). */
function monthRange(now, back = 0) {
  const d = new Date(now);
  return [new Date(d.getFullYear(), d.getMonth() + back, 1).getTime(), new Date(d.getFullYear(), d.getMonth() + back + 1, 1).getTime()];
}
const inRange = (t, [a, b]) => t >= a && t < b;
const monthName = (t) => new Date(t).toLocaleString('en', { month: 'long', year: 'numeric' });
const catOf = (e) => e.cat || (e.kind === 'salary' ? 'Salary' : e.kind === 'paid out' ? 'Paid out at the counter' : KIND_LABEL[e.kind] || 'Other');
/** Where a cost counts: the channel on its liability line (commission, affiliates, promotions), else its category's. */
function channelOf(e, liabs) {
  if (e.liab) {
    const l = liabs.find((x) => x.id === e.liab);
    const ln = l && l.lines.find((x) => x.name === e.party);
    const ch = (ln && ln.channel) || (l && l.channel);
    if (ch) return ch;
  }
  return homeOf(catOf(e));
}
const channelText = (ch) => (ch === 'Shared' ? 'Shared by the whole shop' : ch === 'Several' ? 'Split across channels' : `Counts under ${ch}`);
const spentOf = (list) => r2(list.reduce((a, e) => a - e.amount, 0));

const CSS = `
.eb-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.eb-in{color:var(--text-success)}
.eb-out{color:var(--text-danger)}
.eb-month{max-width:160px}
.eb-cats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-3)}
.eb-cat{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px var(--space-3);font-size:var(--text-sm)}
.eb-cat>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-body)}
.eb-cat small{margin-left:6px;font-size:var(--text-xs);color:var(--text-muted)}
.eb-cat em{margin-left:6px;font-style:normal;font-size:var(--text-xs);color:var(--text-muted)}
.eb-track{grid-column:1 / -1;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.eb-fill{height:100%;border-radius:var(--radius-full);background:var(--chart-1)}
.eb-total{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.eb-help{margin:var(--space-2) 0 0}
.eb-link{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);text-decoration:none}
.eb-link:hover{text-decoration:underline}
`;
const ABOUT = 'Every taka that went out and every taka that came in that isn\'t a sale: expenses, salaries, commission, affiliates, promotions, supplier payments, owner, and other income.';

export default function ExpensesBills() {
  const tick = useBooks();
  const ready = tick > 0;   // browser-stored data only after mount, so the first render matches the server
  const [group, setGroup] = useState('all');
  const [month, setMonth] = useState('this');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [find, setFind] = useState(false);
  const [dialog, setDialog] = useState(null);   // 'expense' | 'income' | 'owner'

  const data = useMemo(() => {
    if (!ready) return null;
    const now = clockNow();
    const thisM = monthRange(now, 0), lastM = monthRange(now, -1);
    const out = getEntries().filter((e) => OUT_KINDS.has(e.kind)).sort((a, b) => b.at - a.at);
    const spend = out.filter((e) => SPEND_KINDS.has(e.kind) && e.amount < 0);
    const income = out.filter((e) => e.kind === 'income');
    const liabs = getLiabilities();
    const owed = liabs.filter((l) => leftOf(l) > 0);
    // gateway & COD fees: fee + delivery charge of every payout received this month
    const received = getPayouts(now).filter((p) => p.status === 'received' || p.status === 'review');
    const feesIn = (range) => received.filter((p) => inRange(p.at || p.date, range));
    const feeSum = (list) => r2(list.reduce((a, p) => a + p.fee + p.charge, 0));
    const gotOf = (list) => r2(list.reduce((a, e) => a + e.amount, 0));
    return {
      now, thisM, lastM, out, spend, liabs,
      kpi: {
        spent: spentOf(spend.filter((e) => inRange(e.at, thisM))),
        spentLast: spentOf(spend.filter((e) => inRange(e.at, lastM))),
        income: gotOf(income.filter((e) => inRange(e.at, thisM))),
        incomeLast: gotOf(income.filter((e) => inRange(e.at, lastM))),
        owed: r2(owed.reduce((a, l) => a + leftOf(l), 0)),
        owedCount: owed.length,
        overdue: owed.filter((l) => liabStatus(l, now) === 'Overdue').length,
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
    // ?add=expense|income|owner (from the Accounts overview) opens that form
    const u = new URL(window.location.href);
    const add = u.searchParams.get('add');
    if (add === 'expense' || add === 'income' || add === 'owner') {
      setDialog(add);
      u.searchParams.delete('add');
      window.history.replaceState(window.history.state, '', u.pathname + u.search);
    }
  }, [data]);

  useEffect(() => { setPage(1); }, [group, month, query]);

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
    const by = {}, homes = {};
    inMonth.filter((e) => SPEND_KINDS.has(e.kind) && e.amount < 0).forEach((e) => {
      const c = catOf(e);
      by[c] = r2((by[c] || 0) - e.amount);
      (homes[c] = homes[c] || new Set()).add(channelOf(e, data.liabs));
    });
    const list = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([name, amt]) => [name, amt, homes[name].size > 1 ? 'Several' : [...homes[name]][0]]);
    const total = r2(list.reduce((a, [, v]) => a + v, 0));
    const top = list.slice(0, 6);
    const rest = r2(list.slice(6).reduce((a, [, v]) => a + v, 0));
    return { top: rest ? [...top, ['Everything else', rest, '']] : top, total, max: top.length ? top[0][1] : 0 };
  }, [inMonth, data]);

  const periodText = !data ? '' : month === 'this' ? monthName(data.thisM[0]) : month === 'last' ? monthName(data.lastM[0]) : 'All time';
  const k = data && data.kpi;
  const close = () => setDialog(null);
  const findOn = find || !!query;
  const closeFind = () => { setQuery(''); setFind(false); };
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pg = Math.min(page, pages);
  const first = (pg - 1) * PAGE;
  const shown = rows.slice(first, first + PAGE);
  const whatOf = (e) => e.cat || KIND_LABEL[e.kind] || e.kind;
  const noteOf = (e) => [e.cat ? KIND_LABEL[e.kind] : '', e.note].filter(Boolean).filter((x) => x !== e.party).join(' · ');
  const rowTitle = (e) => [SPEND_KINDS.has(e.kind) && e.amount < 0 ? channelText(channelOf(e, data.liabs)) : '', e.by ? 'By ' + e.by : '', formatTime(e.at)].filter(Boolean).join(' · ');
  const tabs = GROUPS.map(([id, label]) => ({ key: id, id: 'eb-tab-' + id, label, count: data ? counts[id] : null, on: group === id, onClick: () => setGroup(id) }));
  const monthPick = (
    <select aria-label="Month" className="ix-filter is-set eb-month" value={month} onChange={(e) => setMonth(e.target.value)}>
      {MONTHS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
    </select>
  );

  return (
    <AccPage screen="ExpensesBills" active="acc-spend" page="Income & expenses" title="Income & expenses" css={CSS} icon="receipt" about={ABOUT}
      secondary={[{ label: 'Record income', onClick: () => setDialog('income') }]}
      more={[{ label: 'Owner withdraw / investment', onClick: () => setDialog('owner') }, { label: 'Dues', href: '/dues' }, { label: 'Bills to pay', href: '/liabilities' }, { label: 'Expense categories', href: '/account-setup?tab=categories' }]}
      primary={{ label: 'Record expense', onClick: () => setDialog('expense') }}>

      <MetricStrip label="This month" items={[
        { label: 'Spent this month', value: k ? money(k.spent) : '—', sub: k ? `Last month ${money(k.spentLast)}` : '' },
        { label: 'Other income this month', value: k ? money(k.income) : '—', sub: k ? `Last month ${money(k.incomeLast)}` : '' },
        { label: 'Owed now', value: k ? money(k.owed) : '—', sub: k ? (k.overdue ? `${plural(k.overdue, 'item')} overdue` : plural(k.owedCount, 'item')) : '', href: '/liabilities' },
        { label: 'Partner fees, this month', value: k ? money(k.fees) : '—', sub: k ? (k.feePayouts ? `From ${plural(k.feePayouts, 'payout')} received` : `Last month ${money(k.feesLast)}`) : '' },
      ]} />

      <section className="ix-card" aria-label="Money out and other income">
        <div className="ix-bar">
          {findOn ? (<>
            <SearchField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries" onDone={closeFind} autoFocus />
            {monthPick}
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Show" />
            <span className="ix-tools">
              {monthPick}
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>

        {!data ? <p className="ac-wait">Loading the books…</p> : rows.length ? (<>
          <ul className="ix-plist" aria-label={periodText}>
            {shown.map((e) => (
              <li key={e.id}>
                <div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{whatOf(e)}</b><span className={'eb-fig ' + (e.amount < 0 ? 'eb-out' : 'eb-in')}>{signed(e.amount)}</span></span>
                  <span className="ix-pitem__mid">{shortDate(e.at)} · {e.party || '—'} · {accName(e.account)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">{periodText}, {plural(rows.length, 'entry', 'entries')}</caption>
              <thead><tr><th scope="col">Date</th><th scope="col">What</th><th scope="col">Paid to / from</th><th scope="col">Account</th><th scope="col" className="ix-num">Amount</th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} title={rowTitle(e)}>
                    <td className="ix-nowrap">{shortDate(e.at)}</td>
                    <td><span className="ac-trunc"><span className="ix-strong">{whatOf(e)}</span>{noteOf(e) ? <span className="ix-muted"> · {noteOf(e)}</span> : null}</span></td>
                    <td><span className="ac-trunc">{e.party || '—'}</span></td>
                    <td><span className="ac-logo"><BrandLogo brand={accBrand(e.account)} size={20} decorative /><span className="ix-muted">{accName(e.account)}</span></span></td>
                    <td className={'ix-num eb-fig ' + (e.amount < 0 ? 'eb-out' : 'eb-in')}>{signed(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>) : (
          <div className="ix-empty">
            <EmptyState icon={query ? 'search-x' : 'receipt'}
              title={query ? 'Nothing matches that search' : `Nothing recorded ${month === 'all' ? 'yet' : 'in ' + periodText}`}
              actionLabel={query ? 'Clear search' : month === 'this' ? 'Show last month' : 'Record expense'}
              onAction={() => (query ? setQuery('') : month === 'this' ? setMonth('last') : setDialog('expense'))} />
          </div>
        )}
        <Pager label={data && rows.length ? `Showing ${first + 1}–${first + shown.length} of ${rows.length} · ${rowsTotal < 0 ? '−' : ''}${money(rowsTotal)} net` : periodText} atStart={pg <= 1} atEnd={pg >= pages} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>

      {/* ---- spend by category (the costs of this month, with the channel each counts under) ---- */}
      <section className="ix-card" aria-labelledby="eb-cat-title">
        <header className="ix-card__head">
          <h2 id="eb-cat-title">Spend by category <InfoTip text="Expenses, staff and promotions in the month you picked, and the sales channel each counts under." /></h2>
          {data ? <span className="eb-total">{money(cats.total)}</span> : null}
        </header>
        <div className="ix-card__body">
          {!data ? null : cats.top.length ? (
            <ul className="eb-cats">
              {cats.top.map(([name, amt, home]) => (
                <li key={name} className="eb-cat">
                  <span>{name}<small>{cats.total ? Math.round((amt / cats.total) * 100) : 0}%</small>{home ? <em>{channelText(home)}</em> : null}</span>
                  <b className="eb-fig ix-strong">{money(amt)}</b>
                  <div className="eb-track" aria-hidden="true"><div className="eb-fill" style={{ width: `${cats.max ? Math.max(2, Math.min(100, (amt / cats.max) * 100)) : 0}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="ac-wait" style={{ padding: 0, textAlign: 'left' }}>No expenses, salaries or promotions in {periodText === 'All time' ? 'the books' : periodText}.</p>}
        </div>
      </section>
      <LearnMore topic="income and expenses" />

      {dialog === 'expense' ? <ExpenseDialog onClose={close} /> : null}
      {dialog === 'income' ? <IncomeDialog onClose={close} /> : null}
      {dialog === 'owner' ? <OwnerDialog onClose={close} /> : null}
    </AccPage>
  );
}

// ---- small pieces --------------------------------------------------------------------------------
const cleanAmount = (v) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');

// ---- record expense ------------------------------------------------------------------------------
function ExpenseDialog({ onClose }) {
  const today = dayKey(clockNow());
  const categories = useMemo(() => getCategories('expense'), []);
  const [cat, setCat] = useState('');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('cash-shop');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  const amt = r2(amount);
  const balance = balanceOf(account);
  const picked = categories.find((c) => c.name === cat);
  const isSalary = !!picked && picked.id === 'salary';
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
      account, amount: -amt, kind: isSalary ? 'salary' : 'expense', cat,
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
            <select id="eb-cat" className={'gc-input gc-select' + (show('cat') ? ' gc-input--error' : '')} value={cat} onChange={(e) => setCat(e.target.value)} aria-invalid={!!show('cat')} aria-describedby={show('cat') ? 'eb-cat-err' : picked ? 'eb-cat-help' : undefined} data-autofocus>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {show('cat') ? <p id="eb-cat-err" className="gc-help gc-help--error">{errors.cat}</p>
              : picked ? <p id="eb-cat-help" className="gc-help eb-help">{channelText(picked.home || 'Shared')} · <Link href="/account-setup?tab=categories" className="eb-link">Change</Link></p> : null}
          </div>
          <div>
            <label className="gc-label" htmlFor="eb-party">Paid to</label>
            <input id="eb-party" className="gc-input" value={party} onChange={(e) => setParty(e.target.value)} placeholder={isSalary ? 'Staff name' : 'Shop, person or company'} />
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

// ---- record other income -------------------------------------------------------------------------
function IncomeDialog({ onClose }) {
  const today = dayKey(clockNow());
  const categories = useMemo(() => getCategories('income'), []);
  const suppliers = useMemo(() => getSuppliers().slice().sort((a, b) => a.name.localeCompare(b.name)), []);
  const [catId, setCatId] = useState('');
  const [party, setParty] = useState('');
  const [supplier, setSupplier] = useState('');
  const [recv, setRecv] = useState('money');   // supplier bonus: 'money' into an account | 'credit' on their bills
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('brac');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  const picked = categories.find((c) => c.id === catId);
  const bonus = catId === BONUS_ID;
  const credit = bonus && recv === 'credit';
  const sup = bonus ? suppliers.find((x) => x.id === supplier) : null;
  const owe = sup ? payableOf(sup.id) : 0;
  const amt = r2(amount);
  const errors = {
    cat: catId ? '' : 'Choose what the money is.',
    supplier: bonus && !supplier ? 'Choose the supplier who gave the bonus.' : '',
    amount: amt > 0 ? '' : 'Enter the amount.',
    date: credit ? '' : !date ? 'Pick the day it came in.' : date > today ? 'The date can’t be in the future.' : '',
  };
  const show = (f) => (tried ? errors[f] : '');

  const save = (e) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    const who = bonus ? sup.name : party.trim() || picked.name;
    if (credit) {
      // no money moves: the bonus comes off what the shop owes this supplier
      addCredit({ supplier: sup.id, amount: amt, note: 'Bonus' + (note.trim() ? ' · ' + note.trim() : '') });
      toast(`${money(amt)} credit on ${sup.name} — it lowers what you owe`);
      onClose();
      return;
    }
    const row = postEntry({
      account, amount: amt, kind: 'income', cat: picked.name, party: who, note: note.trim(), by: 'Staff',
      ...(date !== today ? { at: fromKey(date) + 12 * 3600e3 } : {}),
    });
    if (!row) { toast('That account could not be found', { tone: 'error' }); return; }
    toast(`${money(amt)} ${picked.name.toLowerCase()} recorded into ${accName(account)}`);
    onClose();
  };

  return (
    <Dialog open title="Record income" onClose={onClose} width={560}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="eb-inc-form" className="gc-btn gc-btn--solid">{credit ? 'Save credit' : 'Save income'}</button></>}>
      <form id="eb-inc-form" className="ac-form" onSubmit={save} noValidate>
        <p className="gc-help" style={{ margin: 0 }}>Money that comes in and is not a sale. Sales are recorded at the counter and on orders.</p>
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="eb-inc-cat">Category</label>
            <select id="eb-inc-cat" className={'gc-input gc-select' + (show('cat') ? ' gc-input--error' : '')} value={catId} onChange={(e) => setCatId(e.target.value)} aria-invalid={!!show('cat')} aria-describedby={show('cat') ? 'eb-inc-cat-err' : picked && picked.help ? 'eb-inc-cat-help' : undefined} data-autofocus>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {show('cat') ? <p id="eb-inc-cat-err" className="gc-help gc-help--error">{errors.cat}</p>
              : picked && picked.help ? <p id="eb-inc-cat-help" className="gc-help eb-help">{picked.help}</p> : null}
          </div>
          {bonus ? (
            <div>
              <label className="gc-label" htmlFor="eb-inc-sup">Supplier</label>
              <select id="eb-inc-sup" className={'gc-input gc-select' + (show('supplier') ? ' gc-input--error' : '')} value={supplier} onChange={(e) => setSupplier(e.target.value)} aria-invalid={!!show('supplier')} aria-describedby={show('supplier') ? 'eb-inc-sup-err' : sup ? 'eb-inc-sup-help' : undefined}>
                <option value="">Choose…</option>
                {suppliers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
              {show('supplier') ? <p id="eb-inc-sup-err" className="gc-help gc-help--error">{errors.supplier}</p>
                : sup ? <p id="eb-inc-sup-help" className="gc-help eb-help">{owe ? `You owe them ${money(owe)} now` : 'You owe them nothing now'}</p> : null}
            </div>
          ) : (
            <div>
              <label className="gc-label" htmlFor="eb-inc-party">Who paid</label>
              <input id="eb-inc-party" className="gc-input" value={party} onChange={(e) => setParty(e.target.value)} placeholder="Bank, company or person" />
            </div>
          )}
        </div>
        {bonus ? (
          <fieldset className="ac-form" style={{ border: 0, margin: 0, padding: 0, minWidth: 0, gap: 'var(--space-2)' }}>
            <legend className="gc-label" style={{ padding: 0 }}>Received as</legend>
            <div className="ac-seg" role="group" aria-label="Received as" style={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}>
              <button type="button" aria-pressed={recv === 'money'} onClick={() => setRecv('money')}>Money into an account</button>
              <button type="button" aria-pressed={recv === 'credit'} onClick={() => setRecv('credit')}>Credit on their bills</button>
            </div>
            <p className="gc-help" style={{ margin: 0 }}>{credit ? 'No money moves. The bonus comes off what you owe this supplier, oldest bill first; anything left waits for their next bill.' : 'The supplier paid the bonus in cash, by bank or by wallet.'}</p>
          </fieldset>
        ) : null}
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="eb-inc-amount">Amount (৳)</label>
            <input id="eb-inc-amount" className={'gc-input ac-fig' + (show('amount') ? ' gc-input--error' : '')} inputMode="decimal" value={amount} onChange={(e) => setAmount(cleanAmount(e.target.value))} aria-invalid={!!show('amount')} aria-describedby={show('amount') ? 'eb-inc-amount-err' : undefined} />
            {show('amount') ? <p id="eb-inc-amount-err" className="gc-help gc-help--error">{errors.amount}</p> : null}
          </div>
          {credit ? null : <AccountSelect id="eb-inc-account" label="Received into" value={account} onChange={setAccount} />}
        </div>
        <div className="ac-two">
          {credit ? null : (
            <div>
              <label className="gc-label" htmlFor="eb-inc-date">Received on</label>
              <input id="eb-inc-date" type="date" className={'gc-input' + (show('date') ? ' gc-input--error' : '')} value={date} max={today} onChange={(e) => setDate(e.target.value)} aria-invalid={!!show('date')} aria-describedby={show('date') ? 'eb-inc-date-err' : undefined} />
              {show('date') ? <p id="eb-inc-date-err" className="gc-help gc-help--error">{errors.date}</p> : null}
            </div>
          )}
          <div>
            <label className="gc-label" htmlFor="eb-inc-note">Note</label>
            <input id="eb-inc-note" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={bonus ? 'Optional, e.g. target bonus · September' : 'Optional'} />
          </div>
        </div>
        {credit && sup && amt > owe ? (
          <div className="ac-note ac-note--info" role="status"><Icon name="info" width="16" height="16" aria-hidden="true" /><span><b>{money(amt - owe)} more than you owe {sup.name} now.</b> The rest comes off their next bill.</span></div>
        ) : null}
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
