'use client';
// Accounts (/admin/accounts) — where GridCommerce keeps its money, adapted from the merchant panel's Money page
// (screens/accounts/Money.jsx) and Account reports (Reports.jsx): what each account holds (figures by kind), then one
// card with the views as tabs:
//   Accounts            each account with its balance and this month's money in and out; a row opens its ledger
//   Ledger              every movement (payments in, messaging credits, money not yet matched, expenses paid, refunds,
//                       transfers, capital) for one account or all, with a running balance for one account
//   Transfers           moves between the accounts ("Move money" in the title row → addTransfer)
//   Financial reports   a month's profit and loss and what the company had and owed at its end; print on the
//                       letterhead (finShared › Letterhead, printed alone with printNode) or CSV
// Data: lib/admin/finance (ledger, balances, monthReport, addTransfer). ?tab= ?account= ?month= ?do=transfer.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, MetricStrip } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { printNode } from '@/lib/printNode';
import { startOfMonth, periodOf, dmhm } from '@/lib/platform/util';
import { ledger, balances, monthReport, bookPeriods, addTransfer, KIND_LABEL, ACCOUNT_TYPES, SOURCES, periodLabel, COMPANY } from '@/lib/admin/finance';
import { AdminShell } from '../AdminShell';
import {
  FIN_CSS, PRINT_CSS, useFinance, money, net, signed, plural, when, dmy, readParams, setParams, rowGo, rowKey, Field, ctl, errOf, FormSheet,
  AccountSelect, accName, Skeleton, ErrorCard, useErr, Letterhead, SignOff,
} from './finShared';

const PAGE = 50;
const TABS = [['accounts', 'Accounts'], ['ledger', 'Ledger'], ['transfers', 'Transfers'], ['reports', 'Financial reports']];
const TYPE_ICON = { Bank: 'landmark', Mobile: 'smartphone', Cash: 'banknote', Float: 'messages-square' };

function TransferSheet({ F, bal, from, close }) {
  const [f, setF] = useState({ from: from || '', to: '', amount: '', note: '' });
  const [err, setErr] = useErr();
  const submit = () => {
    const r = addTransfer(f);
    if (!r.ok) { setErr(r); return; }
    toast(`${money(r.transfer.amount)} moved from ${accName(F, r.transfer.from)} to ${accName(F, r.transfer.to)}`);
    close();
  };
  return (
    <FormSheet id="fn-tr" title="Move money" close={close} onSubmit={submit} submit="Move money" err={err}>
      <AccountSelect id="tr-f" label="From" F={F} bal={bal} value={f.from} onChange={(v) => { setErr(null); setF({ ...f, from: v }); }} error={errOf(err, 'from')} />
      <AccountSelect id="tr-t" label="To" F={F} bal={bal} value={f.to} exclude={f.from} onChange={(v) => { setErr(null); setF({ ...f, to: v }); }} error={errOf(err, 'to')} />
      <Field id="tr-a" label="Amount (৳)" error={errOf(err, 'amount')}>
        <input id="tr-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={(e) => { setErr(null); setF({ ...f, amount: e.target.value }); }} />
      </Field>
      <Field id="tr-n" label="Note (optional)" hint="Wallet sweep, petty cash, card top-up …">
        <input id="tr-n" {...ctl(null)} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      </Field>
    </FormSheet>
  );
}

/** One month's profit and loss and balance, as two summary blocks (also what is printed). */
function Statements({ F, rep, t }) {
  const pl = rep.pl, bs = rep.bs;
  const title = periodLabel(rep.period) + (rep.partial ? ' (so far)' : '');
  return (
    <>
      <Letterhead kind="Financial report" title={'Profit and loss · ' + title} meta={[['Company', COMPANY.name], ['Period', title], ['Prepared', dmy(t)], ['Basis', 'Cash in, bills by date']]} />
      <div className="fn-grid fn-grid--half">
        <section className="ix-card" aria-label={'Profit and loss, ' + title}>
          <div className="ix-card__head"><h2>Profit and loss</h2></div>
          <div className="fn-body">
            <dl className="fn-sum">
              <dt className="is-head">Revenue</dt>
              {SOURCES.map(([k, l]) => <React.Fragment key={k}><dt className="is-sub">{l}</dt><dd>{money(pl.revenue[k])}</dd></React.Fragment>)}
              <dt className="is-sub">Refunds to stores</dt><dd>{pl.revenue.refunds ? '−' + money(pl.revenue.refunds) : '—'}</dd>
              <dt className="is-total">Net revenue</dt><dd className="is-total">{money(pl.revenue.net)}</dd>
              <dt className="is-head">Expenses</dt>
              {pl.expenses.filter((c) => c.value).map((c) => <React.Fragment key={c.key}><dt className="is-sub">{c.name}</dt><dd>{money(c.value)}</dd></React.Fragment>)}
              {!pl.expenses.some((c) => c.value) ? <><dt className="is-sub">No expenses</dt><dd>—</dd></> : null}
              <dt className="is-total">Total expenses</dt><dd className="is-total">{money(pl.spent)}</dd>
              <dt className="is-total">{pl.net < 0 ? 'Loss' : 'Profit'}</dt><dd className={'is-total' + (pl.net < 0 ? ' fn-bad' : '')}>{net(pl.net)}</dd>
            </dl>
          </div>
        </section>
        <section className="ix-card" aria-label={'Balance at the end of ' + title}>
          <div className="ix-card__head"><h2>Balance {rep.partial ? 'today' : 'at month end'}</h2></div>
          <div className="fn-body">
            <dl className="fn-sum">
              <dt className="is-head">What we have</dt>
              {bs.accounts.map((a) => <React.Fragment key={a.id}><dt className="is-sub">{a.name}</dt><dd>{net(a.value)}</dd></React.Fragment>)}
              <dt className="is-sub">Owed to us by stores</dt><dd>{money(bs.receivable)}</dd>
              <dt className="is-total">Total</dt><dd className="is-total">{money(bs.assets)}</dd>
              <dt className="is-head">What we owe</dt>
              <dt className="is-sub">Bills not paid yet</dt><dd>{bs.payable ? money(bs.payable) : '—'}</dd>
              <dt className="is-sub">Refunds approved, not sent</dt><dd>{bs.refundsOwed ? money(bs.refundsOwed) : '—'}</dd>
              <dt className="is-total">Total</dt><dd className="is-total">{money(bs.liabilities)}</dd>
              <dt className="is-total">Net assets</dt><dd className="is-total">{net(bs.net)}</dd>
              <dt className="is-sub fn-muted">Capital put in so far</dt><dd className="fn-muted">{money(bs.capital)}</dd>
            </dl>
          </div>
        </section>
      </div>
      <SignOff when={dmhm(t)} />
    </>
  );
}

export default function Accounts() {
  const { db, F, t, ready } = useFinance();
  const [tab, setTab] = useState('accounts');
  const [acc, setAcc] = useState('');
  const [kind, setKind] = useState('');
  const [month, setMonth] = useState('');
  const [repMonth, setRepMonth] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);
  const report = useRef(null);

  useEffect(() => {
    const p = readParams();
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (p.get('account')) setAcc(p.get('account'));
    if (p.get('month')) setRepMonth(p.get('month'));
    if (p.get('do') === 'transfer') setSheet({ kind: 'transfer', from: p.get('from') || '' });
  }, []);
  const go = (k) => { setTab(k); setPage(0); setParams({ tab: k === 'accounts' ? '' : k }); };
  const openLedger = (id) => { setAcc(id); setTab('ledger'); setPage(0); setParams({ tab: 'ledger', account: id }); };
  const closeSheet = () => { setSheet(null); setParams({ do: '', from: '' }); };

  let d = null, error = null;
  if (ready) {
    try {
      const rows = ledger(db, F, t);
      const bal = balances(db, F, t, t, rows);
      const m0 = startOfMonth(t);
      const flow = {};
      for (const a of F.accounts) flow[a.id] = { in: 0, out: 0 };
      for (const r of rows) if (r.at >= m0 && flow[r.account]) { if (r.amount > 0) flow[r.account].in += r.amount; else flow[r.account].out -= r.amount; }
      const types = ACCOUNT_TYPES.map(([type, label]) => ({ type, label, total: F.accounts.filter((a) => a.type === type).reduce((s, a) => s + bal[a.id], 0) }));
      const periods = bookPeriods(F, t);
      const rm = periods.includes(repMonth) ? repMonth : periods[periods[0] === periodOf(t) && periods.length > 1 ? 1 : 0];
      d = { rows, bal, flow, types, total: Object.values(bal).reduce((s, v) => s + v, 0), periods, rm, rep: tab === 'reports' ? monthReport(db, F, t, rm) : null };
    } catch (e) { error = e; }
  }

  // ledger rows: a running balance when one account is chosen
  let led = [];
  if (d && tab === 'ledger') {
    let run = acc ? (F.accounts.find((a) => a.id === acc) || { opening: 0 }).opening : null;
    const list = [];
    for (const r of d.rows) {
      if (acc && r.account !== acc) continue;
      if (acc) run += r.amount;
      list.push({ ...r, after: acc ? run : null });
    }
    const s = q.trim().toLowerCase();
    led = list.reverse().filter((r) => (!kind || r.kind === kind) && (!month || periodOf(r.at) === month) && (!s || [r.text, r.ref, r.id, KIND_LABEL[r.kind]].join(' ').toLowerCase().includes(s)));
  }
  const pages = Math.max(1, Math.ceil(led.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shownLed = led.slice(pg * PAGE, pg * PAGE + PAGE);
  const ledIn = led.reduce((s, r) => s + (r.amount > 0 ? r.amount : 0), 0);
  const ledOut = led.reduce((s, r) => s + (r.amount < 0 ? -r.amount : 0), 0);
  const transfers = d ? [...F.transfers].sort((a, b) => b.at - a.at) : [];

  const exportCsv = () => {
    if (!d) return;
    if (tab === 'ledger') {
      downloadCsv(`gridcommerce-ledger${acc ? '-' + acc : ''}.csv`, [['Date', 'Account', 'What', 'Kind', 'Reference', 'In (BDT)', 'Out (BDT)', ...(acc ? ['Balance (BDT)'] : [])],
        ...led.map((r) => [dmy(r.at), accName(F, r.account), r.text, KIND_LABEL[r.kind] || r.kind, r.ref || '', r.amount > 0 ? r.amount : '', r.amount < 0 ? -r.amount : '', ...(acc ? [Math.round(r.after)] : [])])]);
    } else if (tab === 'transfers') {
      downloadCsv('gridcommerce-transfers.csv', [['Transfer', 'Date', 'From', 'To', 'Amount (BDT)', 'Note', 'By'], ...transfers.map((x) => [x.id, dmy(x.at), accName(F, x.from), accName(F, x.to), x.amount, x.note, x.by])]);
    } else if (tab === 'reports') {
      const { pl, bs } = d.rep;
      downloadCsv(`gridcommerce-financial-report-${d.rm}.csv`, [
        [COMPANY.name, 'Financial report', periodLabel(d.rm)], [],
        ['Profit and loss', 'BDT'], ...SOURCES.map(([k, l]) => [l, pl.revenue[k]]), ['Refunds to stores', -pl.revenue.refunds], ['Net revenue', pl.revenue.net],
        ...pl.expenses.map((c) => [c.name, -c.value]), ['Total expenses', -pl.spent], [pl.net < 0 ? 'Loss' : 'Profit', pl.net], [],
        ['Balance', 'BDT'], ...bs.accounts.map((a) => [a.name, a.value]), ['Owed to us by stores', bs.receivable], ['Total we have', bs.assets],
        ['Bills not paid yet', -bs.payable], ['Refunds approved, not sent', -bs.refundsOwed], ['Net assets', bs.net],
      ]);
    } else {
      downloadCsv('gridcommerce-accounts.csv', [['Account', 'Type', 'Number', 'In this month (BDT)', 'Out this month (BDT)', 'Balance (BDT)'], ...F.accounts.map((a) => [a.name, a.type, a.number, d.flow[a.id].in, d.flow[a.id].out, Math.round(d.bal[a.id])])]);
    }
    toast('Exported');
  };
  const print = () => {
    if (!report.current) return;
    printNode(report.current, { title: `${COMPANY.name} - Financial report ${periodLabel(d.rm)}`, css: PRINT_CSS });
  };

  const header = (
    <ShopHeader icon="landmark" title="Accounts"
      about="The accounts GridCommerce keeps money in — City Bank and BRAC Bank, the bKash and Nagad merchant wallets, office cash and the credits float (what stores prepay for SMS, email and AI, used to pay those providers) — and every taka in or out of them since the books started. Financial reports show a month's profit and loss and what the company had and owed at its end; print them on the letterhead."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Print financial report', onClick: () => { if (tab !== 'reports') { go('reports'); toast('Pick the month, then print'); } else print(); } }, { label: 'Expenses', href: '/admin/expenses' }, { label: 'Payments', href: '/admin/payments' }]}
      primary={{ label: 'Move money', icon: 'arrow-left-right', onClick: () => setSheet({ kind: 'transfer', from: tab === 'ledger' ? acc : '' }) }} />
  );

  let body;
  if (!ready) body = <Skeleton label="Loading the accounts" />;
  else if (error) body = <ErrorCard what="The accounts" />;
  else {
    const tabs = TABS.map(([k, label]) => ({ key: k, id: 'acc-tab-' + k, label, count: k === 'accounts' ? F.accounts.length : k === 'transfers' ? F.transfers.length : null, on: tab === k, onClick: () => go(k) }));
    let view;
    if (tab === 'accounts') {
      view = (
        <>
          <ul className="ix-plist" aria-label="Accounts">
            {F.accounts.map((a) => (
              <li key={a.id}><button type="button" className="ix-pitem" onClick={() => openLedger(a.id)}>
                <span className="ix-pitem__top"><b>{a.name}</b><span className={'fn-fig' + (d.bal[a.id] < 0 ? ' fn-bad' : '')}>{net(d.bal[a.id])}</span></span>
                <span className="ix-pitem__mid">{a.number} · in {money(d.flow[a.id].in)} · out {money(d.flow[a.id].out)} this month</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Accounts and balances</caption>
              <thead><tr><th scope="col">Account</th><th scope="col">Type</th><th scope="col" className="ix-num">In this month</th><th scope="col" className="ix-num">Out this month</th><th scope="col" className="ix-num">Balance</th></tr></thead>
              <tbody>
                {F.accounts.map((a) => (
                  <tr key={a.id} tabIndex={0} onClick={rowGo(() => openLedger(a.id))} onKeyDown={rowKey(() => openLedger(a.id))}>
                    <td><span className="fn-name"><b>{a.name}</b><small>{a.number} · {a.bank}</small></span></td>
                    <td className="ix-nowrap"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name={TYPE_ICON[a.type] || 'wallet'} width="16" height="16" aria-hidden="true" />{(ACCOUNT_TYPES.find(([k]) => k === a.type) || [a.type, a.type])[1]}</span></td>
                    <td className="ix-num"><span className="fn-fig fn-in">{d.flow[a.id].in ? '+' + money(d.flow[a.id].in) : '—'}</span></td>
                    <td className="ix-num"><span className="fn-fig fn-out">{d.flow[a.id].out ? '−' + money(d.flow[a.id].out) : '—'}</span></td>
                    <td className="ix-num"><span className={'fn-fig' + (d.bal[a.id] < 0 ? ' fn-bad' : '')}>{net(d.bal[a.id])}</span></td>
                  </tr>
                ))}
                <tr className="fn-total"><td colSpan={4}>Total in every account</td><td className="ix-num"><span className="fn-fig">{net(d.total)}</span></td></tr>
              </tbody>
            </table>
          </div>
          <div className="ix-foot"><span>Opening balances on {dmy(F.start)} · {plural(F.accounts.length, 'account')}</span></div>
        </>
      );
    } else if (tab === 'ledger') {
      const months = [...new Set(d.rows.map((r) => periodOf(r.at)))].sort().reverse();
      const filters = [
        { key: 'acc', label: 'Account', all: 'All accounts', value: acc, options: F.accounts.map((a) => [a.id, a.name]), onChange: (v) => { setAcc(v); setPage(0); setParams({ account: v }); } },
        { key: 'kind', label: 'Kind', all: 'Every kind', value: kind, options: Object.entries(KIND_LABEL), onChange: (v) => { setKind(v); setPage(0); } },
        { key: 'month', label: 'Month', all: 'All months', value: month, options: months.map((m) => [m, periodLabel(m)]), onChange: (v) => { setMonth(v); setPage(0); } },
      ];
      view = (
        <>
          <div className="fn-filters"><FilterBar label="Filter the ledger" filters={filters} search={{ value: q, onChange: (v) => { setQ(v); setPage(0); }, placeholder: 'Search what, reference or ID' }} onClear={() => setQ('')} /></div>
          {!led.length ? (
            <div className="ix-empty"><EmptyState title="No money moved that matches." actionLabel="Clear filters" onAction={() => { setAcc(''); setKind(''); setMonth(''); setQ(''); setParams({ account: '' }); }} /></div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Ledger">
                {shownLed.map((r) => (
                  <li key={r.id}>{r.href ? (
                    <Link href={r.href} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{r.text}</b><span className={'fn-fig ' + (r.amount > 0 ? 'fn-in' : 'fn-out')}>{signed(r.amount)}</span></span>
                      <span className="ix-pitem__mid">{when(r.at, t)} · {KIND_LABEL[r.kind]} · {accName(F, r.account)}{r.after != null ? ' · balance ' + net(r.after) : ''}</span>
                    </Link>
                  ) : (
                    <div className="ix-pitem">
                      <span className="ix-pitem__top"><b>{r.text}</b><span className={'fn-fig ' + (r.amount > 0 ? 'fn-in' : 'fn-out')}>{signed(r.amount)}</span></span>
                      <span className="ix-pitem__mid">{when(r.at, t)} · {KIND_LABEL[r.kind]} · {accName(F, r.account)}</span>
                    </div>
                  )}</li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table ix-table--static">
                  <caption className="sr-only">Ledger{acc ? ' of ' + accName(F, acc) : ''}</caption>
                  <thead><tr><th scope="col">Date</th><th scope="col">What</th>{acc ? null : <th scope="col">Account</th>}<th scope="col">Reference</th><th scope="col" className="ix-num">In</th><th scope="col" className="ix-num">Out</th>{acc ? <th scope="col" className="ix-num">Balance</th> : null}</tr></thead>
                  <tbody>
                    {shownLed.map((r) => (
                      <tr key={r.id}>
                        <td className="ix-nowrap ix-muted">{dmy(r.at)}</td>
                        <td><span className="fn-name">{r.href ? <Link href={r.href}>{r.text}</Link> : <b>{r.text}</b>}<small>{KIND_LABEL[r.kind]}</small></span></td>
                        {acc ? null : <td className="ix-nowrap ix-muted">{accName(F, r.account)}</td>}
                        <td className="ix-nowrap"><span className="fn-data ix-muted">{r.ref || '—'}</span></td>
                        <td className="ix-num"><span className="fn-fig fn-in">{r.amount > 0 ? money(r.amount) : ''}</span></td>
                        <td className="ix-num"><span className="fn-fig fn-out">{r.amount < 0 ? money(r.amount) : ''}</span></td>
                        {acc ? <td className="ix-num"><span className={'fn-fig' + (r.after < 0 ? ' fn-bad' : '')}>{net(r.after)}</span></td> : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Pager label={<span className="fn-tfoot"><span>{led.length ? `${pg * PAGE + 1}–${pg * PAGE + shownLed.length} of ${led.length}` : '0 movements'}</span><span>In <b>{money(ledIn)}</b></span><span>Out <b>{money(ledOut)}</b></span>{acc ? <span>Balance now <b>{net(d.bal[acc])}</b></span> : null}</span>}
            atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </>
      );
    } else if (tab === 'transfers') {
      view = !transfers.length ? (
        <div className="ix-empty"><EmptyState icon="arrow-left-right" title="No money has moved between accounts." actionLabel="Move money" onAction={() => setSheet({ kind: 'transfer' })} /></div>
      ) : (
        <>
          <ul className="ix-plist" aria-label="Transfers">
            {transfers.map((x) => (
              <li key={x.id}><div className="ix-pitem">
                <span className="ix-pitem__top"><b>{accName(F, x.from)} → {accName(F, x.to)}</b><span className="fn-fig">{money(x.amount)}</span></span>
                <span className="ix-pitem__mid">{when(x.at, t)} · {x.note} · {x.by}</span>
              </div></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static">
              <caption className="sr-only">Transfers between accounts</caption>
              <thead><tr><th scope="col">Date</th><th scope="col">From</th><th scope="col">To</th><th scope="col">Note</th><th scope="col">By</th><th scope="col" className="ix-num">Amount</th></tr></thead>
              <tbody>
                {transfers.map((x) => (
                  <tr key={x.id}>
                    <td className="ix-nowrap ix-muted">{dmy(x.at)}</td>
                    <td className="ix-nowrap">{accName(F, x.from)}</td>
                    <td className="ix-nowrap">{accName(F, x.to)}</td>
                    <td>{x.note}</td>
                    <td className="ix-nowrap ix-muted">{x.by}</td>
                    <td className="ix-num"><span className="fn-fig">{money(x.amount)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ix-foot"><span>{plural(transfers.length, 'transfer')}</span></div>
        </>
      );
    } else {
      view = (
        <>
          <div className="ix-bar fn-noprint" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span className="fn-pick">
              <label className="sr-only" htmlFor="rep-m">Month</label>
              <select id="rep-m" className="ix-pick" value={d.rm} onChange={(e) => { setRepMonth(e.target.value); setParams({ month: e.target.value }); }}>
                {d.periods.map((p) => <option key={p} value={p}>{periodLabel(p)}{p === periodOf(t) ? ' (so far)' : ''}</option>)}
              </select>
            </span>
            <span className="fn-pick">
              <button type="button" className="ix-btn ix-btn--sm" onClick={exportCsv}><Icon name="download" width="16" height="16" aria-hidden="true" />CSV</button>
              <button type="button" className="ix-btn ix-btn--sm" onClick={print}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print</button>
            </span>
          </div>
          <div className="fn-body" ref={report}>
            <Statements F={F} rep={d.rep} t={t} />
          </div>
        </>
      );
    }
    body = (
      <>
        <MetricStrip label="Money in the accounts" items={[
          { label: 'In every account', value: net(d.total), sub: plural(F.accounts.length, 'account'), icon: 'wallet' },
          ...d.types.map((g) => ({ label: g.label, value: net(g.total), sub: F.accounts.filter((a) => a.type === g.type).map((a) => a.name.split(' ')[0]).join(', '), icon: TYPE_ICON[g.type], onClick: () => { const first = F.accounts.find((a) => a.type === g.type); if (first) openLedger(first.id); } })),
        ]} />
        <section className="ix-card" aria-label="Accounts">
          <div className="ix-bar fn-noprint"><IndexTabs tabs={tabs} label="Account views" /></div>
          {view}
        </section>
      </>
    );
  }

  return (
    <AdminShell active="accounts" title="Accounts">
      <style dangerouslySetInnerHTML={{ __html: FIN_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      {sheet && sheet.kind === 'transfer' && d ? <TransferSheet F={F} bal={d.bal} from={sheet.from} close={closeSheet} /> : null}
    </AdminShell>
  );
}
