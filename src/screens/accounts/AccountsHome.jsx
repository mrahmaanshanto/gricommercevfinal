'use client';
// AccountsHome — the money overview, laid out like Shopify's Finance overview (docs/shopify-style.md):
//   figures   where the money is: cash, banks, mobile wallets, what partners hold, and this month's net profit
//   to-dos    what needs the owner, as short pills (late or short payouts, wallets to withdraw, today's
//             payouts, money waiting for approval, payments to check (manual payments, failed refunds and
//             card batch differences together), statement lines to match, supplier bills and other bills due, a full drawer); each
//             opens the page where it is done
//   cards     what is coming in over the next payout days (a chart), and money in and out by kind
// Sales by channel, dues and the latest movements live on their own pages (Sales & profit, Dues, Money).
// Front end only: figures come from lib/ledger, lib/settlements, lib/profit and the bills / liabilities books.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { OWN_ACCOUNTS, getEntries, balanceOf, KIND_LABEL } from '@/lib/ledger';
import { getPayouts, getWallets, getPartners, heldBy, clockNow, startOfDay } from '@/lib/settlements';
import { getBills, billLeft } from '@/lib/supplierBills';
import { getLiabilities, leftOf } from '@/lib/liabilities';
import { profitByChannel } from '@/lib/profit';
import { waitingRequests } from '@/lib/approvals';
import { getManualPayments } from '@/lib/manualPayments';
import { getRefunds } from '@/lib/refunds';
import { batchRows, needsLook } from '@/lib/terminalBatches';
import { getLines } from '@/lib/statementImport';
import { AccPage, useBooks, money, signed, dayLabel, shortDate } from './accShared';

const CSS = `
.ov-todo{display:flex;flex-direction:column;gap:var(--space-2)}
.ov-cards{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.ov-total{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2);margin:0;font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-total small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.ov-total a{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-danger)}
.ov-bars{display:flex;align-items:flex-end;gap:var(--space-4);height:150px;margin-top:var(--space-4)}
.ov-bar{display:flex;flex:1;flex-direction:column;align-items:center;gap:4px;height:100%;min-width:0}
.ov-bar__col{width:100%;max-width:44px;min-height:2px;margin-top:auto;border-radius:var(--radius-md) var(--radius-md) var(--radius-sm) var(--radius-sm);background:var(--chart-1)}
.ov-bar.is-delayed .ov-bar__col{background:var(--chart-4)}
.ov-bar__day{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.ov-bar__amt{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.ov-flow{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin:0 0 var(--space-3)}
.ov-flow dt{font-size:var(--text-xs);color:var(--text-muted)}
.ov-flow dd{margin:2px 0 0;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.ov-fig{font-family:var(--font-data);font-weight:var(--weight-semibold)}
.ov-flow{padding-bottom:var(--space-3);border-bottom:1px solid var(--border-subtle)}
.ov-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.ov-in{color:var(--text-success)}
.ov-out{color:var(--text-danger)}
@media (max-width:1023px){.ov-cards{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.ov-bars{gap:var(--space-2);height:120px}}
`;
const RANGES = [['today', 'Today'], ['7', '7 days'], ['30', '30 days']];
const ABOUT = 'Where your money is, what needs you today, and what is on the way.';
const DAY = 864e5;

export default function AccountsHome() {
  const tick = useBooks();
  const [range, setRange] = useState('30');

  const d = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const today = startOfDay(now);
    const entries = getEntries();
    const own = OWN_ACCOUNTS();
    const group = (type) => { const list = own.filter((a) => a.type === type); return { list, total: list.reduce((s, a) => s + balanceOf(a.id, entries), 0) }; };
    const partners = getPartners();
    const pays = getPayouts(now);
    const wallets = getWallets().filter((w) => w.net > 0);
    const open = pays.filter((p) => p.status === 'expected' || p.status === 'delayed');
    const late = open.filter((p) => p.late);
    const review = pays.filter((p) => p.status === 'review');
    const dueToday = open.filter((p) => !p.late && p.due === today);
    const bills = getBills().map((b) => ({ ...b, left: billLeft(b) })).filter((b) => b.left > 0 && b.due && startOfDay(b.due) <= today + 3 * DAY).sort((a, b) => a.due - b.due);
    const liabs = getLiabilities().filter((l) => leftOf(l) > 0 && startOfDay(l.due) <= today + 3 * DAY).sort((a, b) => a.due - b.due);
    const drawer = balanceOf('drawer', entries);
    const approvals = waitingRequests();
    const toCheck = getManualPayments().filter((m) => m.status === 'waiting');
    const failedRefunds = getRefunds().filter((r) => r.stage === 'failed');
    const batchDiffs = batchRows().filter(needsLook);
    const stmtOpen = getLines().filter((l) => l.status === 'open');
    const payLook = toCheck.length + failedRefunds.length + batchDiffs.length;

    // what needs the owner, most urgent first; each pill opens the page (or the window) where it is done
    const one = (list, href, many) => (list.length === 1 ? href(list[0]) : many);
    const todo = [
      late.length && { key: 'late', label: 'Check late payouts', n: late.length, late: true, href: one(late, (p) => '/settlements?payout=' + encodeURIComponent(p.id), '/settlements') },
      review.length && { key: 'review', label: 'Explain short payouts', n: review.length, late: true, href: one(review, (p) => '/settlements?payout=' + encodeURIComponent(p.id), '/settlements?tab=review') },
      wallets.length && { key: 'wallets', label: 'Withdraw from wallets', n: money(wallets.reduce((a, w) => a + w.net, 0)), href: one(wallets, (w) => '/settlements?withdraw=' + encodeURIComponent(w.partner), '/settlements') },
      dueToday.length && { key: 'today', label: 'Check today’s payouts', n: dueToday.length, onClick: () => window.dispatchEvent(new CustomEvent('gc:check')) },
      bills.length && { key: 'bills', label: 'Pay suppliers', n: bills.length, late: bills.some((b) => startOfDay(b.due) < today), href: one(bills, (b) => '/suppliers?pay=' + encodeURIComponent(b.supplier), '/dues?tab=owe') },
      liabs.length && { key: 'liabs', label: 'Pay bills', n: liabs.length, late: liabs.some((l) => startOfDay(l.due) < today), href: one(liabs, (l) => '/liabilities?id=' + encodeURIComponent(l.id), '/liabilities') },
      approvals.length && { key: 'approvals', label: 'Approve money', n: approvals.length, late: approvals.some((r) => now - r.at > DAY), href: approvals.length === 1 ? '/money-approvals?id=' + encodeURIComponent(approvals[0].id) : '/money-approvals' },
      // payments to look at: manual payments to check, failed refunds and card batch differences, as one pill
      payLook && { key: 'payments', label: 'Check payments', n: payLook, late: failedRefunds.length > 0, href: toCheck.length ? '/payment-ops?tab=tx' : failedRefunds.length ? '/payment-ops?tab=refunds&view=failed' : '/payment-ops?tab=batches' },
      stmtOpen.length && { key: 'stmt', label: 'Match statement lines', n: stmtOpen.length, href: '/statement-match?account=' + encodeURIComponent(stmtOpen[0].account) },
      drawer > 50000 && { key: 'drawer', label: 'Move drawer cash', n: money(drawer), href: '/money?do=transfer&from=drawer' },
    ].filter(Boolean);

    // net profit this month, or last month early in a month
    const m0 = new Date(now); m0.setDate(1); m0.setHours(0, 0, 0, 0);
    const lm0 = new Date(m0); lm0.setMonth(lm0.getMonth() - 1);
    let pr = profitByChannel(m0.getTime(), now + 1);
    let prLabel = m0.toLocaleString('en', { month: 'long' }) + ' so far';
    if (pr.all.net < 1000) { pr = profitByChannel(lm0.getTime(), m0.getTime()); prLabel = lm0.toLocaleString('en', { month: 'long', year: 'numeric' }); }

    // coming in: the next payout days
    const days = [];
    open.filter((p) => !p.late && p.due >= today).forEach((p) => { let g = days.find((x) => x.due === p.due); if (!g) { g = { due: p.due, list: [] }; days.push(g); } g.list.push(p); });
    days.sort((a, b) => a.due - b.due);

    // money in and out of the shop's own accounts (moves between them left out)
    const from = range === 'today' ? today : today - (Number(range) - 1) * DAY;
    const moves = entries.filter((e) => e.at >= from && own.some((a) => a.id === e.account) && !['transfer', 'cash pickup', 'cash in'].includes(e.kind));
    const byKind = {};
    moves.forEach((e) => { byKind[e.kind] = (byKind[e.kind] || 0) + e.amount; });
    return {
      now, pr, prLabel, todo,
      cash: group('Cash'), bank: group('Bank'), mobile: group('Mobile'), partners, held: partners.reduce((s, p) => s + heldBy(p.id), 0),
      todayIn: dueToday.reduce((s, p) => s + p.net, 0), days: days.slice(0, 5), late: late.reduce((s, p) => s + p.net, 0),
      moneyIn: moves.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0), moneyOut: moves.filter((e) => e.amount < 0).reduce((s, e) => s - e.amount, 0),
      kinds: Object.entries(byKind).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 5),
    };
  }, [tick, range]);

  const head = {
    icon: 'landmark', about: ABOUT,
    secondary: [{ label: 'Move money', href: '/money?do=transfer' }],
    more: [
      { label: 'Payouts', href: '/settlements' }, { label: 'Payments', href: '/payment-ops' }, { label: 'Approvals', href: '/money-approvals' }, { label: 'Match statements', href: '/statement-match' }, { label: 'Dues', href: '/dues' }, { label: 'Bills to pay', href: '/liabilities' },
      { label: 'Sales & profit', href: '/sales-profit' }, { label: 'Reports', href: '/account-reports' }, { label: 'Setup', href: '/account-setup' },
    ],
    primary: { label: 'Record expense', href: '/expenses-bills?add=expense' },
  };
  // the books live in this browser: draw the figures once they are read, so the first render matches the server
  if (!d) return <AccPage screen="AccountsHome" active="acc-home" page="Money overview" title="Money overview" css={CSS} narrow {...head} />;

  const accounts = (g) => `${g.list.length} account${g.list.length === 1 ? '' : 's'}`;
  const max = Math.max(1, ...d.days.map((g) => g.list.reduce((s, p) => s + p.net, 0)));
  const coming = d.days.reduce((s, g) => s + g.list.reduce((a, p) => a + p.net, 0), 0);

  return (
    <AccPage screen="AccountsHome" active="acc-home" page="Money overview" title="Money overview" css={CSS} narrow {...head}>
      <MetricStrip label="Where the money is" items={[
        { label: 'Cash', value: money(d.cash.total), sub: accounts(d.cash), href: '/money?type=Cash' },
        { label: 'In banks', value: money(d.bank.total), sub: accounts(d.bank), href: '/money?type=Bank' },
        { label: 'Mobile wallets', value: money(d.mobile.total), sub: accounts(d.mobile), href: '/money?type=Mobile' },
        { label: 'With partners', value: money(d.held), sub: d.todayIn ? `${money(d.todayIn)} due today` : `${d.partners.length} partners`, href: '/settlements' },
        { label: 'Net profit', value: (d.pr.net < 0 ? '−' : '') + money(d.pr.net), sub: d.prLabel, href: '/sales-profit' },
      ]} />

      <section className="ov-todo" aria-labelledby="ov-todo">
        <h2 id="ov-todo" className="ix-section-title">Needs you</h2>
        {d.todo.length ? (
          <nav className="ac-todo" aria-label="Needs you">
            {d.todo.map((t) => (t.href
              ? <Link key={t.key} href={t.href} className={t.late ? 'is-late' : undefined}>{t.label}<b>{t.n}</b></Link>
              : <button key={t.key} type="button" onClick={t.onClick}>{t.label}<b>{t.n}</b></button>))}
          </nav>
        ) : <span className="ac-done"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Nothing is waiting for you.</span>}
      </section>

      <div className="ov-cards">
        <section className="ix-card" aria-labelledby="ov-coming">
          <header className="ix-card__head"><h2 id="ov-coming">Coming in</h2><Link href="/settlements">Payouts</Link></header>
          <div className="ix-card__body">
            <p className="ov-total">{money(coming)}{d.late ? <Link href="/settlements"><span>Late</span> {money(d.late)}</Link> : null}</p>
            {d.days.length ? (
              <div className="ov-bars" role="img" aria-label={d.days.map((g) => `${shortDate(g.due)} ${money(g.list.reduce((s, p) => s + p.net, 0))}`).join(', ')}>
                {d.days.map((g) => {
                  const sum = g.list.reduce((s, p) => s + p.net, 0);
                  return (
                    <div key={g.due} className={'ov-bar' + (g.list.some((p) => p.status === 'delayed') ? ' is-delayed' : '')} title={`${shortDate(g.due)} · ${g.list.map((p) => `${p.p.short} ${money(p.net)}${p.status === 'delayed' ? ' (delayed)' : ''}`).join(', ')}`}>
                      <span className="ov-bar__col" style={{ height: `${(sum / max) * 100}%` }} />
                      <span className="ov-bar__day">{dayLabel(g.due, d.now)}</span>
                      <span className="ov-bar__amt">{money(sum)}</span>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon="calendar-check" title="Nothing expected" body="New online payments and delivered COD parcels show here." />}
          </div>
        </section>

        <section className="ix-card" aria-labelledby="ov-flow">
          <header className="ix-card__head">
            <h2 id="ov-flow">In and out</h2>
            <select className="ix-pick" aria-label="Period" value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </header>
          <div className="ix-card__body">
            <dl className="ov-flow">
              <div><dt>Money in</dt><dd className="ov-in">{money(d.moneyIn)}</dd></div>
              <div><dt>Money out</dt><dd className="ov-out">{money(d.moneyOut)}</dd></div>
            </dl>
            {d.kinds.length ? (
              <dl className="ix-sum">{d.kinds.map(([k, v]) => <React.Fragment key={k}><dt>{KIND_LABEL[k] || k}</dt><dd className={'ov-fig ' + (v > 0 ? 'ov-in' : 'ov-out')}>{signed(v)}</dd></React.Fragment>)}</dl>
            ) : <p className="ov-empty">No money moved in this period.</p>}
          </div>
        </section>
      </div>
    </AccPage>
  );
}
