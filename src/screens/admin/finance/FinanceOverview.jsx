'use client';
// Finance overview (/admin/finance) — GridCommerce's own money at a glance, adapted from the merchant panel's Money
// overview (screens/accounts/AccountsHome.jsx): the key figures for the period (revenue, expenses, net, owed to us, cash
// in the accounts), what needs someone (at most five grouped rows: expenses to approve, refunds to send, payments to
// match, overdue stores), revenue against expenses for twelve months, revenue by source, spend by category and the
// accounts. Each card opens the page where the work is done.
// Data: lib/admin/finance (revenue from lib/platform payments + messaging, expenses and accounts from its own books).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip, ShopHeader } from '@/components/ui/IndexKit';
import { ColumnChart, Donut, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { startOfMonth, addMonths, periodOf, DAY } from '@/lib/platform/util';
import {
  revenueIn, revenueMonths, expenseMonths, spendByCategory, owedNow, ledger, balances, todo, SOURCES, ACCOUNT_TYPES, periodLabel,
} from '@/lib/admin/finance';
import { AdminShell } from '../AdminShell';
import { FIN_CSS, SOURCE_COLORS, useFinance, money, net, short, tick, Skeleton, ErrorCard, Card } from './finShared';

const PERIODS = [['month', 'This month'], ['last', 'Last month'], ['90', 'Last 3 months'], ['year', 'Last 12 months']];

/** [from, to) of a period and its words. */
function rangeOf(period, t) {
  const m0 = startOfMonth(t);
  if (period === 'last') return { from: addMonths(m0, -1, 1), to: m0, words: periodLabel(periodOf(m0 - DAY)) };
  if (period === '90') return { from: addMonths(m0, -2, 1), to: t + 1, words: 'last 3 months' };
  if (period === 'year') return { from: addMonths(m0, -11, 1), to: t + 1, words: 'last 12 months' };
  return { from: m0, to: t + 1, words: 'this month so far' };
}

function work(db, F, t, period) {
  const R = rangeOf(period, t);
  const rev = revenueIn(db, F, R.from, R.to);
  const cats = spendByCategory(F, R.from, R.to).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);
  const spent = cats.reduce((s, c) => s + c.value, 0);
  const rows = ledger(db, F, t);
  const bal = balances(db, F, t, t, rows);
  const cash = Object.values(bal).reduce((s, v) => s + v, 0);
  const revM = revenueMonths(db, F, t, 12);
  const expM = expenseMonths(F, t, 12);
  const months = revM.map((m, i) => ({
    label: m.label, title: m.title, values: SOURCES.map(([k]) => m[k]),
    line: m.period < F.startPeriod ? null : expM[i].total,
  }));
  return { R, rev, cats, spent, net: rev.net - spent, owed: owedNow(db, t), bal, cash, months, todo: todo(db, F, t), spark: revM.slice(-6).map((m) => m.total) };
}

export default function FinanceOverview() {
  const { db, F, t, ready } = useFinance();
  const [period, setPeriod] = useState('month');
  let x = null, error = null;
  if (ready) { try { x = work(db, F, t, period); } catch (e) { error = e; } }
  const periodName = (PERIODS.find(([k]) => k === period) || [])[1];

  const exportCsv = () => {
    if (!x) return;
    downloadCsv(`gridcommerce-finance-${period}.csv`, [
      ['GridCommerce · Finance overview', periodName],
      [],
      ['Revenue', 'BDT'], ...SOURCES.map(([k, l]) => [l, x.rev[k]]), ['Refunds to stores', -x.rev.refunds], ['Net revenue', x.rev.net],
      [],
      ['Expenses', 'BDT'], ...x.cats.map((c) => [c.name, c.value]), ['Total expenses', x.spent],
      [],
      ['Net', x.net], ['Owed to us now', x.owed.total], ['Cash in accounts now', Math.round(x.cash)],
      [],
      ['Month', ...SOURCES.map(([, l]) => l), 'Expenses'], ...x.months.map((m) => [m.title, ...m.values.map((v) => v || 0), m.line ?? '']),
    ]);
    toast('Finance overview exported');
  };

  const header = (
    <ShopHeader icon="landmark" title="Finance"
      about="GridCommerce's own books, not the merchants': money in from subscriptions, add-ons, messaging credits and one-off charges (as stores paid), money out on salaries, servers, providers, marketing and the office, and what is in each account. Pick the period at the top; each card opens the page where the work is done."
      middle={<select className="ix-pick" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>{PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv, disabled: !x }]}
      more={[{ label: 'Record payment', href: '/admin/payments?add=1' }, { label: 'Move money', href: '/admin/accounts?do=transfer' }, { label: 'Financial reports', href: '/admin/accounts?tab=reports' }]}
      primary={{ label: 'Add expense', icon: 'plus', href: '/admin/expenses?add=1' }} />
  );

  let body;
  if (!ready) body = <Skeleton label="Loading the finance overview" />;
  else if (error) body = <ErrorCard what="The finance figures" />;
  else {
    const srcParts = SOURCES.map(([k, l]) => ({ name: l, value: x.rev[k], color: SOURCE_COLORS[k] })).filter((p) => p.value > 0);
    const byType = ACCOUNT_TYPES.map(([type, label]) => ({ type, label, list: F.accounts.filter((a) => a.type === type) }));
    body = (
      <>
        <MetricStrip label={'Key figures, ' + x.R.words} items={[
          { label: 'Revenue', value: short(x.rev.net), sub: x.rev.refunds ? `after ${money(x.rev.refunds)} refunds` : x.R.words, spark: x.spark, href: '/admin/revenue' },
          { label: 'Expenses', value: short(x.spent), sub: x.R.words, href: '/admin/expenses', icon: 'receipt' },
          { label: 'Net', value: (x.net < 0 ? '−' : '') + short(Math.abs(x.net)), sub: x.net < 0 ? 'loss' : 'profit', href: '/admin/accounts?tab=reports', icon: 'scale' },
          { label: 'Owed to us', value: short(x.owed.total), sub: x.owed.overdue ? `${short(x.owed.overdue)} overdue` : `${x.owed.stores} stores`, href: '/admin/collections', icon: 'hourglass' },
          { label: 'Cash in accounts', value: short(x.cash), sub: `${F.accounts.length} accounts`, href: '/admin/accounts', icon: 'wallet' },
        ]} />

        <section className="ix-card" aria-label="Needs someone">
          <div className="ix-card__head"><h2>Needs someone</h2></div>
          {x.todo.length ? (
            <div className="fn-todo">
              {x.todo.map((r) => (
                <Link key={r.key} href={r.href}>
                  <span className={'fn-todo__ic' + (r.tone === 'err' ? ' fn-todo__ic--err' : '')} aria-hidden="true"><Icon name={r.tone === 'err' ? 'circle-alert' : 'clock'} width="16" height="16" /></span>
                  <span className="fn-todo__txt"><b>{r.title}</b><small>{r.sub}</small></span>
                  <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : <span className="fn-done"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Nothing is waiting for anyone.</span>}
        </section>

        <div className="fn-grid fn-grid--2">
          <Card title="Revenue and expenses" action={<Link href="/admin/revenue">Revenue</Link>}>
            <ColumnChart label="Revenue by source and expenses, last 12 months" data={x.months}
              series={SOURCES.map(([k, l]) => ({ name: l, color: SOURCE_COLORS[k] }))} line={{ name: 'Expenses', color: 'var(--viz-2)' }}
              fmt={money} tickFmt={tick} height={220} now={11} />
            <div className="fn-legend"><Legend items={[...SOURCES.map(([k, l]) => ({ name: l, color: SOURCE_COLORS[k] })), { name: 'Expenses', color: 'var(--viz-2)', kind: 'line' }]} /></div>
            <div className="fn-foot">
              <span>Books from<b>{periodLabel(F.startPeriod)}</b></span>
              <span>Payments in the period<b>{x.rev.payments}</b></span>
            </div>
          </Card>
          <Card title="Revenue by source" action={<Link href="/admin/revenue">Details</Link>}>
            {srcParts.length ? (
              <div className="fn-donut">
                <Donut label={'Revenue by source, ' + x.R.words} parts={srcParts} fmt={money} total={short(x.rev.total)} totalLabel="revenue" size={128} thickness={16} />
                <Legend items={srcParts.map((p) => ({ name: p.name, color: p.color, value: money(p.value) }))} />
              </div>
            ) : <p className="fn-empty">No money came in during this period.</p>}
            <div className="fn-foot">
              <span>Refunds<b>{money(x.rev.refunds)}</b></span>
              <span>Net<b>{money(x.rev.net)}</b></span>
            </div>
          </Card>
        </div>

        <div className="fn-grid fn-grid--half">
          <Card title="Expenses by category" action={<Link href="/admin/expenses">Expenses</Link>}>
            {x.cats.length ? (
              <HBars Link={Link} rows={x.cats.map((c) => ({ key: c.key, label: c.name, value: c.value, text: money(c.value), color: 'var(--viz-2)', href: '/admin/expenses?cat=' + c.key }))} />
            ) : <p className="fn-empty">No expenses in this period.</p>}
            <div className="fn-foot"><span>Total<b>{money(x.spent)}</b></span><span>Net<b className={x.net < 0 ? 'fn-bad' : ''}>{net(x.net)}</b></span></div>
          </Card>
          <Card title="Accounts" action={<Link href="/admin/accounts">Ledger</Link>}>
            <div className="fn-rows">
              {byType.map((g) => g.list.map((a) => (
                <Link key={a.id} className="fn-row" href={'/admin/accounts?tab=ledger&account=' + a.id}><span>{a.name}</span><b>{net(x.bal[a.id])}</b></Link>
              )))}
              <div className="fn-row fn-row--total"><span>Total</span><b>{net(x.cash)}</b></div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdminShell active="finance" title="Finance">
      <style dangerouslySetInnerHTML={{ __html: FIN_CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
    </AdminShell>
  );
}
