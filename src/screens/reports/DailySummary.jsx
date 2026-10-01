'use client';
// DailySummary — the owner's end-of-day pack for one day (/daily-summary?day=YYYY-MM-DD, default today):
//   sales by channel and by branch · online orders placed, delivered, returned · cash, banks and wallets
//   at closing · payouts that arrived and those running late · low stock · dues collected · expenses ·
//   the day's top 5 products. Each block opens the full report or page behind it.
// Actions: Download PDF, Download CSV. Sending it every evening is set up in Automation › Scheduled reports.
// The figures come from src/lib/reports/dailySummary.js (also used by Scheduled reports).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ReportsShell, useDataTick } from '@/components/reports/ReportsShell';
import { PrintLetterhead, PrintSignOff, LETTERHEAD_CSS, savePdf } from '@/components/reports/PrintLetterhead';
import { dailySummary } from '@/lib/reports/dailySummary';
import { fmt, downloadCsv, csvValue, clockNow, dayKey, fromKey, addDays, startOfDay } from '@/lib/reports/period';

const REPORT = { id: 'daily-summary', title: 'Daily summary' };
const CSS = `
.ds-day{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-4) var(--space-5)}
.ds-day .gc-input{width:auto;min-width:0;max-width:200px;font-family:var(--font-data)}
.ds-day p{flex:1 1 220px;margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ds-day p b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ds-iconbtn{display:inline-grid;place-items:center;width:44px;height:44px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-body);cursor:pointer}
.ds-iconbtn:hover:not(:disabled){background:var(--surface-subtle)}
.ds-iconbtn:disabled{opacity:.45;cursor:not-allowed}
.ds-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:var(--space-3)}
.ds-kpi{display:flex;flex-direction:column;gap:2px;min-width:0;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.ds-kpi span{font-size:var(--text-xs);color:var(--text-muted)}
.ds-kpi b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ds-kpi small{font-size:var(--text-xs);color:var(--text-muted)}
.ds-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:var(--space-5);align-items:start}
.ds-card{display:flex;flex-direction:column;min-width:0;overflow:hidden}
.ds-card .rp-head{padding:var(--space-4) var(--space-5) var(--space-3)}
.ds-card .rp-head > div{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.ds-more{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-link);text-decoration:none;white-space:nowrap}
.ds-more:hover{text-decoration:underline}
.ds-list{margin:0;padding:0 var(--space-5) var(--space-4);list-style:none;display:flex;flex-direction:column}
.ds-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.ds-list li:first-child{border-top:0}
.ds-list li > span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ds-list li small{display:block;font-size:var(--text-xs);color:var(--text-muted);white-space:normal}
.ds-list li b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading);text-align:right;white-space:nowrap}
.ds-list li.is-total b,.ds-list li.is-total > span{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ds-list li.is-warn b{color:var(--text-danger)}
.ds-sub{margin:0;padding:var(--space-2) var(--space-5) var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ds-none{margin:0;padding:0 var(--space-5) var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.ds-cash{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ds-cash th{padding:var(--space-2) var(--space-3);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:right;white-space:nowrap}
.ds-cash td{padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);text-align:right;font-family:var(--font-data);color:var(--text-body);white-space:nowrap}
.ds-cash th:first-child,.ds-cash td:first-child{text-align:left;font-family:var(--font-sans);padding-left:var(--space-5)}
.ds-cash th:last-child,.ds-cash td:last-child{padding-right:var(--space-5)}
.ds-cash td:last-child,.ds-cash tfoot td{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ds-cash-wrap{padding-bottom:var(--space-3)}
@media print{section[aria-label="Day"],.ds-day{display:none!important}.ds-grid{display:block}.ds-grid > *{margin-bottom:var(--space-4)}}
`;

const money = (n) => fmt(n, 'money0');
const longDay = (t) => new Date(t).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const readDay = () => { try { const v = new URLSearchParams(window.location.search).get('day'); return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? fromKey(v) : null; } catch { return null; } };

function Block({ icon, title, sub, href, more = 'Full report', children }) {
  return (
    <section className="gc-card ds-card" aria-label={title}>
      <div className="rp-head">
        <div><span className="rp-tile" aria-hidden="true"><Icon name={icon} width="18" height="18" /></span><div><h2>{title}</h2>{sub ? <p>{sub}</p> : null}</div></div>
        {href ? <Link className="ds-more rp-noprint" href={href}>{more} <Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link> : null}
      </div>
      {children}
    </section>
  );
}
const Row = ({ label, note, value, cls }) => <li className={cls || undefined}><span>{label}{note ? <small>{note}</small> : null}</span><b>{value}</b></li>;

export default function DailySummary() {
  const tick = useDataTick();
  const [day, setDay] = useState(null);       // start of the chosen day, set after mount

  useEffect(() => {
    const read = () => setDay(startOfDay(readDay() ?? clockNow()));
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const pick = (t) => {
    const d = startOfDay(t);
    setDay(d);
    const u = new URL(window.location.href);
    if (d === startOfDay(clockNow())) u.searchParams.delete('day'); else u.searchParams.set('day', dayKey(d));
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const s = useMemo(() => (day == null || !tick ? null : dailySummary(day)), [day, tick]);
  const today = startOfDay(clockNow());
  const isToday = day === today;
  const range = s ? `&p=custom&from=${dayKey(s.from)}&to=${dayKey(s.from)}` : '';

  const csv = () => {
    if (!s) return;
    const rows = [['Daily summary'], [longDay(s.from)], []];
    rows.push(['Sales by channel', 'Sales', 'Returns', 'Bills / orders']);
    s.sales.byChannel.forEach((c) => rows.push([c.channel, csvValue(c.revenue, 'money'), csvValue(c.returns, 'money'), c.orders]));
    rows.push(['All channels', csvValue(s.sales.total, 'money'), csvValue(s.sales.returns, 'money'), s.sales.orders], []);
    if (s.sales.byPlace.length) { rows.push(['Sales by branch', 'Sales', 'Bills']); s.sales.byPlace.forEach((p) => rows.push([p.place, csvValue(p.revenue, 'money'), p.bills])); rows.push([]); }
    rows.push(['Online orders', 'Count'], ['Placed', s.orders.placed], ['Delivered', s.orders.delivered], ['Returned', s.orders.returned], ['Cancelled', s.orders.cancelled], ['Waiting to approve (now)', s.orders.waiting], []);
    rows.push(['Money at closing', 'Opening', 'In', 'Out', 'Closing']);
    s.cash.forEach((c) => rows.push([c.label, csvValue(c.opening, 'money'), csvValue(c.in, 'money'), csvValue(c.out, 'money'), csvValue(c.closing, 'money')]));
    rows.push(['Total', '', '', '', csvValue(s.cashTotal, 'money')], []);
    rows.push(['Payouts arrived', 'Amount']); s.payouts.arrived.forEach((p) => rows.push([p.partner, csvValue(p.amount, 'money')]));
    rows.push(['Payouts late', 'Amount']); s.payouts.late.forEach((p) => rows.push([p.partner, csvValue(p.amount, 'money')]));
    rows.push([], ['Dues collected', csvValue(s.dues.collected, 'money')], ['Expenses', csvValue(s.expenses.total, 'money')]);
    s.expenses.byCat.forEach((e) => rows.push(['  ' + e.cat, csvValue(e.amount, 'money')]));
    rows.push([], ['Low stock (now)', s.low.count]); s.low.items.forEach((x) => rows.push(['  ' + x.name + ' · ' + x.place, x.available]));
    rows.push([], ['Top products', 'Qty', 'Sales']); s.top.forEach((p) => rows.push([p.name, p.qty, csvValue(p.revenue, 'money')]));
    downloadCsv(`daily-summary-${dayKey(s.from)}.csv`, rows);
    toast('CSV downloaded');
  };

  const actions = (
    <span className="rp-noprint" style={{ display: 'contents' }}>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={csv} disabled={!s}><Icon name="sheet" width="18" height="18" aria-hidden="true" /> Download CSV</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={() => savePdf('Daily summary - ' + longDay(day))} disabled={!s}><Icon name="file-down" width="18" height="18" aria-hidden="true" /> Download PDF</button>
    </span>
  );

  return (
    <ReportsShell screen="DailySummary" active="rep-daily" page="Daily summary" title="Daily summary" description="The day in one page: sales, orders, money at closing, payouts, stock, dues and expenses." actions={actions} css={CSS + LETTERHEAD_CSS}>
      {day != null ? <PrintLetterhead kind="Daily report" title="Daily summary" meta={[['Day', longDay(day)], ['Prepared', fmt(clockNow(), 'datetime')], ['Prepared by', 'Mehedi Rahman · Owner']]} /> : null}
      <section className="gc-card" aria-label="Day">
        <div className="ds-day">
          <button type="button" className="ds-iconbtn rp-noprint" aria-label="Day before" onClick={() => pick(addDays(day, -1))} disabled={day == null}><Icon name="chevron-left" width="18" height="18" aria-hidden="true" /></button>
          <label className="sr-only" htmlFor="ds-date">Day</label>
          <input id="ds-date" type="date" className="gc-input" value={day == null ? '' : dayKey(day)} max={dayKey(today)} onChange={(e) => { if (e.target.value) pick(fromKey(e.target.value)); }} />
          <button type="button" className="ds-iconbtn rp-noprint" aria-label="Next day" onClick={() => pick(addDays(day, 1))} disabled={day == null || day >= today}><Icon name="chevron-right" width="18" height="18" aria-hidden="true" /></button>
          {day != null && !isToday ? <button type="button" className="gc-btn gc-btn--neutral rp-noprint" onClick={() => pick(today)}>Today</button> : null}
          <p aria-live="polite">{day != null ? <><b>{longDay(day)}</b>{isToday ? `So far today, as of ${fmt(clockNow(), 'datetime').split(', ')[1]}` : 'The whole day'}{s && s.sales.est ? ' · demo September figures' : ''}</> : null}</p>
        </div>
      </section>

      {s ? (
        <>
          <div className="ds-kpis">
            <div className="ds-kpi"><span>Sales</span><b>{money(s.sales.total)}</b><small>{s.sales.orders} bills and orders</small></div>
            <div className="ds-kpi"><span>Online orders placed</span><b>{s.orders.placed}</b><small>{s.orders.delivered} delivered · {s.orders.returned} returned</small></div>
            <div className="ds-kpi"><span>Money at closing</span><b>{money(s.cashTotal)}</b><small>Cash, banks and wallets</small></div>
            <div className="ds-kpi"><span>Dues collected</span><b>{money(s.dues.collected)}</b><small>{s.dues.count} payment{s.dues.count === 1 ? '' : 's'}</small></div>
            <div className="ds-kpi"><span>Expenses</span><b>{money(s.expenses.total)}</b><small>{s.expenses.count} payment{s.expenses.count === 1 ? '' : 's'}</small></div>
          </div>

          <div className="ds-grid">
            <Block icon="chart-column" title="Sales by channel" sub={`${money(s.sales.net)} after returns · gross profit ${money(s.sales.gross)}`} href="/sales-profit">
              <ul className="ds-list">
                {s.sales.byChannel.map((c) => <Row key={c.channel} label={c.channel} note={`${c.orders} ${c.channel === 'Online' ? 'orders' : 'bills'}${c.returns ? ` · ${money(c.returns)} returned` : ''}`} value={money(c.revenue)} />)}
                <Row cls="is-total" label="All channels" value={money(s.sales.total)} />
              </ul>
            </Block>

            <Block icon="store" title="Sales by branch" sub="Where the goods left from" href="/sales-book" more="Sales book">
              {s.sales.byPlace.length ? (
                <ul className="ds-list">{s.sales.byPlace.map((p) => <Row key={p.place} label={p.place} note={`${p.bills} bill${p.bills === 1 ? '' : 's'} · ${p.channels}`} value={money(p.revenue)} />)}</ul>
              ) : <p className="ds-none">{s.sales.total ? 'This day’s sales were not kept per branch.' : 'No sales on this day.'}</p>}
            </Block>

            <Block icon="truck" title="Online orders" sub={`${s.orders.waiting} waiting to be approved now`} href="/merchant-orders" more="Orders">
              <ul className="ds-list">
                <Row label="Placed" value={s.orders.placed} />
                <Row label="Delivered" value={s.orders.delivered} />
                <Row label="Returned by the courier" value={s.orders.returned} cls={s.orders.returned ? 'is-warn' : ''} />
                <Row label="Cancelled" value={s.orders.cancelled} />
              </ul>
            </Block>

            <Block icon="wallet" title="Money at closing" sub={`${money(s.cashTotal)} in the shop’s own accounts`} href="/money-book" more="Money book">
              <div className="gc-table-wrap ds-cash-wrap">
                <table className="ds-cash">
                  <thead><tr><th scope="col">Where</th><th scope="col">Opening</th><th scope="col">In</th><th scope="col">Out</th><th scope="col">Closing</th></tr></thead>
                  <tbody>{s.cash.map((c) => <tr key={c.type}><td>{c.label}</td><td>{money(c.opening)}</td><td>{c.in ? '+' + money(c.in) : '—'}</td><td>{c.out ? '−' + money(c.out) : '—'}</td><td>{money(c.closing)}</td></tr>)}</tbody>
                  <tfoot><tr><td>Total</td><td>{money(s.cash.reduce((a, c) => a + c.opening, 0))}</td><td /><td /><td>{money(s.cashTotal)}</td></tr></tfoot>
                </table>
              </div>
            </Block>

            <Block icon="hourglass" title="Payouts" sub={`${money(s.payouts.arrivedTotal)} arrived${s.payouts.late.length ? ` · ${s.payouts.late.length} late` : ''}`} href="/settlements" more="Settlements">
              {s.payouts.arrived.length ? <><p className="ds-sub">Arrived</p><ul className="ds-list">{s.payouts.arrived.map((p) => <Row key={p.id} label={p.partner} note={p.short ? `Expected ${money(p.expected)} · needs a look` : ''} value={money(p.amount)} cls={p.short ? 'is-warn' : ''} />)}</ul></> : null}
              {s.payouts.late.length ? <><p className="ds-sub">Running late</p><ul className="ds-list">{s.payouts.late.map((p) => <Row key={p.id} label={p.partner} note={`Was due ${fmt(p.due, 'date')}`} value={money(p.amount)} cls="is-warn" />)}</ul></> : null}
              {s.payouts.dueToday.length ? <><p className="ds-sub">Expected this day</p><ul className="ds-list">{s.payouts.dueToday.map((p) => <Row key={p.id} label={p.partner} value={money(p.amount)} />)}</ul></> : null}
              {!s.payouts.arrived.length && !s.payouts.late.length && !s.payouts.dueToday.length ? <p className="ds-none">No payouts arrived or were due on this day.</p> : null}
            </Block>

            <Block icon="package-minus" title="Low stock" sub={`${s.low.count} product${s.low.count === 1 ? '' : 's'} at 5 or fewer free to sell · as of now`} href="/stock" more="Stock list">
              {s.low.items.length ? <ul className="ds-list">{s.low.items.map((x) => <Row key={x.sku + x.place} label={x.name} note={x.place} value={`${x.available} left`} cls={x.available <= 0 ? 'is-warn' : ''} />)}</ul> : <p className="ds-none">Nothing is running low.</p>}
            </Block>

            <Block icon="hand-coins" title="Dues collected" sub="Payments received on unpaid invoices" href="/dues" more="Dues">
              {s.dues.list.length ? <ul className="ds-list">{s.dues.list.map((d, i) => <Row key={d.ref + i} label={d.party || d.ref} note={d.ref} value={money(d.amount)} />)}<Row cls="is-total" label="Collected" value={money(s.dues.collected)} /></ul> : <p className="ds-none">No dues were collected on this day.</p>}
            </Block>

            <Block icon="receipt" title="Expenses" sub="Paid out of the shop’s accounts" href={'/report?id=expenses-by-category' + range}>
              {s.expenses.byCat.length ? <ul className="ds-list">{s.expenses.byCat.map((e) => <Row key={e.cat} label={e.cat} value={money(e.amount)} />)}<Row cls="is-total" label="Spent" value={money(s.expenses.total)} /></ul> : <p className="ds-none">No expenses on this day.</p>}
            </Block>

            <Block icon="trophy" title="Top 5 products" sub="By sales on this day" href="/reports-centre?group=sales" more="Sales reports">
              {s.top.length ? <ul className="ds-list">{s.top.map((p, i) => <Row key={p.sku + p.name} label={`${i + 1}. ${p.name}`} note={`${p.qty} sold`} value={money(p.revenue)} />)}</ul> : <p className="ds-none">{s.sales.total ? 'This day’s sales were not kept per product.' : 'No sales on this day.'}</p>}
            </Block>
          </div>
        </>
      ) : null}
      {day != null ? <PrintSignOff when={fmt(clockNow(), 'datetime')} /> : null}
    </ReportsShell>
  );
}
