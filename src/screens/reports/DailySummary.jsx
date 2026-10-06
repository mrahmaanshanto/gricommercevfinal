'use client';
// DailySummary — the owner's end-of-day pack for one day (/daily-summary?day=YYYY-MM-DD, default today), laid out
// like Shopify's Analytics: the day picker, one strip of key figures, then small cards (at most five rows each on
// screen; the PDF carries every row): sales by channel and by branch · online orders · cash, banks and wallets at
// closing · payouts · low stock · dues collected · expenses · the day's top 5 products. Each card opens the page
// behind it.
// Actions: Download PDF, Download CSV. Sending it every evening is set up in Automation › Scheduled reports.
// The figures come from src/lib/reports/dailySummary.js (also used by Scheduled reports).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ReportsShell, useDataTick } from '@/components/reports/ReportsShell';
import { PrintLetterhead, PrintSignOff, LETTERHEAD_CSS, savePdf } from '@/components/reports/PrintLetterhead';
import { dailySummary } from '@/lib/reports/dailySummary';
import { hasModule } from '@/lib/edition';
import { fmt, downloadCsv, csvValue, clockNow, dayKey, fromKey, addDays, startOfDay } from '@/lib/reports/period';

const LIMIT = 5;   // rows a card shows on screen; the rest print (the PDF carries every row) and open from the card's link
const CSS = `
.ds-day{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ds-when{flex:1 1 220px;font-size:var(--text-xs);color:var(--text-muted)}
.ds-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4);align-items:start}
.ds-note{margin:0 0 var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.ds-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column}
.ds-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--space-3);min-height:40px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.ds-list li:first-child{border-top:0}
.ds-list li.is-extra{display:none}
.ds-list li > span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ds-list li small{display:block;font-size:var(--text-xs);color:var(--text-muted);white-space:normal}
.ds-list li b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading);text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.ds-list li.is-total b,.ds-list li.is-total > span{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ds-list li.is-warn b{color:var(--text-danger)}
.ds-sub{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ds-sub:first-child{margin-top:0}
.ds-none{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.ds-cash{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ds-cash th{height:32px;padding:0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:right;white-space:nowrap}
.ds-cash td{height:40px;padding:0 var(--space-2);border-top:1px solid var(--border-subtle);text-align:right;font-family:var(--font-data);color:var(--text-body);white-space:nowrap;font-variant-numeric:tabular-nums}
.ds-cash th:first-child,.ds-cash td:first-child{padding-left:0;text-align:left;font-family:var(--font-sans)}
.ds-cash th:last-child,.ds-cash td:last-child{padding-right:0}
.ds-cash td:last-child,.ds-cash tfoot td{font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1023px){.ds-grid{grid-template-columns:minmax(0,1fr)}}
@media print{.ds-day{display:none!important}.ds-grid{display:block}.ds-grid > *{margin-bottom:var(--space-4)}.ds-list li.is-extra{display:grid}.ix-head{display:none!important}}
`;

const money = (n) => fmt(n, 'money0');
const longDay = (t) => new Date(t).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const readDay = () => { try { const v = new URLSearchParams(window.location.search).get('day'); return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? fromKey(v) : null; } catch { return null; } };

/** One compact card: a title, one link to the page behind it, and its rows. */
function Block({ title, href, more = 'Full report', children }) {
  return (
    <section className="ix-card" aria-label={title}>
      <header className="ix-card__head"><h2>{title}</h2>{href ? <Link className="rp-noprint" href={href}>{more}</Link> : null}</header>
      <div className="ix-card__body">{children}</div>
    </section>
  );
}
const Row = ({ label, note, value, cls }) => <li className={cls || undefined}><span>{label}{note ? <small>{note}</small> : null}</span><b>{value}</b></li>;
/** Rows past the first five are kept for the PDF and hidden on screen. */
const extra = (i, cls) => [cls, i >= LIMIT ? 'is-extra' : ''].filter(Boolean).join(' ');

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
  // a shop without online selling (Retail) has counter bills only: no online orders card or rows (read after mount, with s)
  const online = !!s && hasModule('online');
  const range = s ? `&p=custom&from=${dayKey(s.from)}&to=${dayKey(s.from)}` : '';

  const csv = () => {
    if (!s) return;
    const rows = [['Daily summary'], [longDay(s.from)], []];
    rows.push(['Sales by channel', 'Sales', 'Returns', 'Bills / orders']);
    s.sales.byChannel.forEach((c) => rows.push([c.channel, csvValue(c.revenue, 'money'), csvValue(c.returns, 'money'), c.orders]));
    rows.push(['All channels', csvValue(s.sales.total, 'money'), csvValue(s.sales.returns, 'money'), s.sales.orders], []);
    if (s.sales.byPlace.length) { rows.push(['Sales by branch', 'Sales', 'Bills']); s.sales.byPlace.forEach((p) => rows.push([p.place, csvValue(p.revenue, 'money'), p.bills])); rows.push([]); }
    if (online) rows.push(['Online orders', 'Count'], ['Placed', s.orders.placed], ['Delivered', s.orders.delivered], ['Returned', s.orders.returned], ['Cancelled', s.orders.cancelled], ['Waiting to approve (now)', s.orders.waiting], []);
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

  return (
    <ReportsShell screen="DailySummary" active="rep-daily" page="Daily summary" css={CSS + LETTERHEAD_CSS} narrow
      icon="sun" title="Daily summary" about="The day in one page: sales, orders, money at closing, payouts, stock, dues and expenses."
      secondary={[{ label: 'Download CSV', onClick: csv, disabled: !s }]}
      more={[{ label: 'Scheduled reports', href: '/scheduled-reports' }, { label: 'All reports', href: '/reports-centre' }]}
      primary={{ label: 'Download PDF', onClick: () => savePdf('Daily summary - ' + longDay(day)), disabled: !s }}>
      {day != null ? <PrintLetterhead kind="Daily report" title="Daily summary" meta={[['Day', longDay(day)], ['Prepared', fmt(clockNow(), 'datetime')], ['Prepared by', 'Mehedi Rahman · Owner']]} /> : null}
      <div className="ds-day rp-noprint" role="group" aria-label="Day">
        <button type="button" className="ix-btn ix-btn--icon" aria-label="Day before" onClick={() => pick(addDays(day, -1))} disabled={day == null}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
        <input id="ds-date" type="date" className="ix-date" aria-label="Day" value={day == null ? '' : dayKey(day)} max={day == null ? undefined : dayKey(today)} onChange={(e) => { if (e.target.value) pick(fromKey(e.target.value)); }} />
        <button type="button" className="ix-btn ix-btn--icon" aria-label="Next day" onClick={() => pick(addDays(day, 1))} disabled={day == null || day >= today}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
        {day != null && !isToday ? <button type="button" className="ix-btn" onClick={() => pick(today)}>Today</button> : null}
        <span className="ds-when" aria-live="polite">{day != null ? <>{isToday ? `So far today, as of ${fmt(clockNow(), 'datetime').split(', ')[1]}` : 'The whole day'}{s && s.sales.est ? ' · demo September figures' : ''}</> : null}</span>
      </div>

      {s ? (
        <>
          <MetricStrip label="Key figures" items={[
            { label: 'Sales', value: money(s.sales.total), href: '/sales-profit' },
            online ? { label: 'Online orders placed', value: String(s.orders.placed), href: '/merchant-orders' } : { label: 'Bills', value: String(s.sales.orders), href: '/sales-book' },
            { label: 'Money at closing', value: money(s.cashTotal), href: '/money-book' },
            { label: 'Dues collected', value: money(s.dues.collected), href: '/dues' },
            { label: 'Expenses', value: money(s.expenses.total), href: '/report?id=expenses-by-category' + range },
          ]} />

          <div className="ds-grid">
            <Block title="Sales by channel" href="/sales-profit">
              <ul className="ds-list">
                {s.sales.byChannel.map((c) => <Row key={c.channel} label={c.channel} note={`${c.orders} ${c.channel === 'Online' ? 'orders' : 'bills'}${c.returns ? ` · ${money(c.returns)} returned` : ''}`} value={money(c.revenue)} />)}
                <Row cls="is-total" label="All channels" note={`${money(s.sales.net)} after returns · gross profit ${money(s.sales.gross)}`} value={money(s.sales.total)} />
              </ul>
            </Block>

            {online ? <Block title="Online orders" href="/merchant-orders" more="Orders">
              <ul className="ds-list">
                <Row label="Placed" value={s.orders.placed} />
                <Row label="Delivered" value={s.orders.delivered} />
                <Row label="Returned by the courier" value={s.orders.returned} cls={s.orders.returned ? 'is-warn' : ''} />
                <Row label="Cancelled" value={s.orders.cancelled} />
                <Row label="Waiting to approve (now)" value={s.orders.waiting} />
              </ul>
            </Block> : null}

            <Block title="Sales by branch" href="/sales-book" more="Sales book">
              {s.sales.byPlace.length ? (
                <ul className="ds-list">{s.sales.byPlace.map((p, i) => <Row key={p.place} cls={extra(i)} label={p.place} note={`${p.bills} bill${p.bills === 1 ? '' : 's'} · ${p.channels}`} value={money(p.revenue)} />)}</ul>
              ) : <p className="ds-none">{s.sales.total ? 'This day’s sales were not kept per branch.' : 'No sales on this day.'}</p>}
            </Block>

            <Block title="Money at closing" href="/money-book" more="Money book">
              <div className="gc-table-wrap">
                <table className="ds-cash gc-table--keep">
                  <thead><tr><th scope="col">Where</th><th scope="col">Opening</th><th scope="col">In</th><th scope="col">Out</th><th scope="col">Closing</th></tr></thead>
                  <tbody>{s.cash.map((c) => <tr key={c.type}><td>{c.label}</td><td>{money(c.opening)}</td><td>{c.in ? '+' + money(c.in) : '—'}</td><td>{c.out ? '−' + money(c.out) : '—'}</td><td>{money(c.closing)}</td></tr>)}</tbody>
                  <tfoot><tr><td>Total</td><td>{money(s.cash.reduce((a, c) => a + c.opening, 0))}</td><td /><td /><td>{money(s.cashTotal)}</td></tr></tfoot>
                </table>
              </div>
            </Block>

            <Block title="Payouts" href="/settlements" more="Payouts">
              {s.payouts.arrived.length ? <><p className="ds-sub">Arrived</p><ul className="ds-list">{s.payouts.arrived.map((p, i) => <Row key={p.id} label={p.partner} note={p.short ? `Expected ${money(p.expected)} · needs a look` : ''} value={money(p.amount)} cls={extra(i, p.short ? 'is-warn' : '')} />)}</ul></> : null}
              {s.payouts.late.length ? <><p className="ds-sub">Running late</p><ul className="ds-list">{s.payouts.late.map((p, i) => <Row key={p.id} label={p.partner} note={`Was due ${fmt(p.due, 'date')}`} value={money(p.amount)} cls={extra(i, 'is-warn')} />)}</ul></> : null}
              {s.payouts.dueToday.length ? <><p className="ds-sub">Expected this day</p><ul className="ds-list">{s.payouts.dueToday.map((p, i) => <Row key={p.id} cls={extra(i)} label={p.partner} value={money(p.amount)} />)}</ul></> : null}
              {!s.payouts.arrived.length && !s.payouts.late.length && !s.payouts.dueToday.length ? <p className="ds-none">No payouts arrived or were due on this day.</p> : null}
            </Block>

            <Block title="Low stock" href="/stock" more="Stock list">
              {s.low.items.length ? <>
                <p className="ds-note">{`${s.low.count} product${s.low.count === 1 ? '' : 's'} at 5 or fewer free to sell · as of now`}</p>
                <ul className="ds-list">{s.low.items.map((x, i) => <Row key={x.sku + x.place} label={x.name} note={x.place} value={`${x.available} left`} cls={extra(i, x.available <= 0 ? 'is-warn' : '')} />)}</ul>
              </> : <p className="ds-none">Nothing is running low.</p>}
            </Block>

            <Block title="Dues collected" href="/dues" more="Dues">
              {s.dues.list.length ? <ul className="ds-list">{s.dues.list.map((d, i) => <Row key={d.ref + i} cls={extra(i)} label={d.party || d.ref} note={d.ref} value={money(d.amount)} />)}<Row cls="is-total" label="Collected" value={money(s.dues.collected)} /></ul> : <p className="ds-none">No dues were collected on this day.</p>}
            </Block>

            <Block title="Expenses" href={'/report?id=expenses-by-category' + range}>
              {s.expenses.byCat.length ? <ul className="ds-list">{s.expenses.byCat.map((e, i) => <Row key={e.cat} cls={extra(i)} label={e.cat} value={money(e.amount)} />)}<Row cls="is-total" label="Spent" value={money(s.expenses.total)} /></ul> : <p className="ds-none">No expenses on this day.</p>}
            </Block>

            <Block title="Top 5 products" href="/reports-centre?group=sales" more="Sales reports">
              {s.top.length ? <ul className="ds-list">{s.top.map((p, i) => <Row key={p.sku + p.name} label={`${i + 1}. ${p.name}`} note={`${p.qty} sold`} value={money(p.revenue)} />)}</ul> : <p className="ds-none">{s.sales.total ? 'This day’s sales were not kept per product.' : 'No sales on this day.'}</p>}
            </Block>
          </div>
        </>
      ) : null}
      {day != null ? <PrintSignOff when={fmt(clockNow(), 'datetime')} /> : null}
    </ReportsShell>
  );
}
