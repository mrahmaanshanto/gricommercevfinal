'use client';
// SalesProfit — Accounts › Sales & profit: how much each channel (Online, Retail, Wholesale) sold
// over a period and how much profit each made.
// Shopify-style (docs/shopify-style.md): the period, four key figures, then
//   Sales trend     day-by-day stacked bars per channel (grouped when the period is long).
//   Insights        two or three plain sentences worked out from the figures ("What stands out").
//   Statement       profit by channel: sales − returns − cost of goods = gross profit − the channel's
//                   own costs = channel profit; then shared costs and other income give net profit;
//                   then each channel's orders, average order, share of sales and what is still due.
// Counted on the day of the sale (profit.js / salesBook.js). Which channel an expense belongs to is
// set per category in Setup › Categories. Front end only: demo month September 2026.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, InfoTip } from '@/components/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { clockNow, dayKey, fromKey, startOfDay } from '@/lib/settlements';
import { getSales } from '@/lib/salesBook';
import { profitByChannel } from '@/lib/profit';
import { AccPage, money, useBooks } from './accShared';

// ---- words and dates ----------------------------------------------------------------------------
const r2 = (n) => Math.round(n * 100) / 100;
/** ৳1,250 or −৳1,250 */
const fig = (n) => (r2(n) < 0 ? '−' : '') + money(n);
const pct = (n) => (Math.round(n * 1000) / 10).toLocaleString('en', { maximumFractionDigits: 1 }) + '%';
const pct0 = (n) => Math.round(n * 100) + '%';
const addDays = (t, n) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime(); };
const monthStart = (t, add = 0) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth() + add, 1).getTime(); };
const MON = (t) => new Date(t).toLocaleString('en', { month: 'short' });
/** '1–30 Sep 2026' · '28 Sep – 4 Oct 2026' for [from, to) */
function rangeText(from, to) {
  const a = new Date(from), b = new Date(addDays(to, -1));
  if (a.getTime() >= b.getTime()) return `${a.getDate()} ${MON(a)} ${a.getFullYear()}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return `${a.getDate()}–${b.getDate()} ${MON(b)} ${b.getFullYear()}`;
  return `${a.getDate()} ${MON(a)}${a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : ''} – ${b.getDate()} ${MON(b)} ${b.getFullYear()}`;
}

const PRESETS = [['month', 'This month'], ['last', 'Last month'], ['week', 'Last 7 days'], ['custom', 'Custom']];
/** The period [from, to). */
function periodOf(preset, now, custom) {
  const tomorrow = addDays(startOfDay(now), 1);
  if (preset === 'month') return { from: monthStart(now), to: tomorrow };
  if (preset === 'last') return { from: monthStart(now, -1), to: monthStart(now) };
  if (preset === 'week') return { from: addDays(tomorrow, -7), to: tomorrow };
  let a = fromKey(custom.from), b = fromKey(custom.to);
  if (b < a) [a, b] = [b, a];
  return { from: a, to: addDays(b, 1) };
}

// ---- channels -----------------------------------------------------------------------------------
const CH = [
  { id: 'Online', color: 'var(--primary)', help: 'Website, Facebook and phone orders' },
  { id: 'Retail', color: 'var(--fill-success)', help: 'Counter sales at the shops' },
  { id: 'Wholesale', color: 'var(--fill-warning)', help: 'Invoices to wholesale customers' },
];
const IDS = CH.map((c) => c.id);

/** Zero figures, used before the books are read in the browser. */
function blankProfit() {
  const s = () => ({ revenue: 0, returns: 0, net: 0, cost: 0, gross: 0, margin: 0, orders: 0, avg: 0, due: 0, days: {}, est: false, costs: [], costsTotal: 0, profit: 0, profitMargin: 0 });
  return { channels: { Online: s(), Retail: s(), Wholesale: s() }, all: s(), channelProfit: 0, shared: { lines: [], total: 0 }, income: { lines: [], total: 0 }, net: 0, netMargin: 0 };
}

/** Rows of the profit-by-channel statement. cells: { Online, Retail, Wholesale, all } (null = blank). */
function statementOf(p) {
  const ch = p.channels;
  const per = (f) => { const o = {}; IDS.forEach((id) => { o[id] = f(ch[id]); }); return o; };
  const rows = [];
  const add = (key, label, cells, type = 'line', extra = {}) => rows.push({ key, label, cells, type, ...extra });
  add('sales', 'Sales', { ...per((c) => c.revenue), all: p.all.revenue });
  add('returns', 'Returns', { ...per((c) => (c.returns ? -c.returns : 0)), all: p.all.returns ? -p.all.returns : 0 });
  add('net', 'Net sales', { ...per((c) => c.net), all: p.all.net }, 'sub');
  add('cogs', 'Cost of goods', { ...per((c) => (c.cost ? -c.cost : 0)), all: p.all.cost ? -p.all.cost : 0 });
  add('gross', 'Gross profit', { ...per((c) => c.gross), all: p.all.gross }, 'sub', { margins: { ...per((c) => (c.net ? c.gross / c.net : null)), all: p.all.net ? p.all.gross / p.all.net : null } });
  // the channels' own costs: one row per label, largest first
  const labels = {};
  IDS.forEach((id) => ch[id].costs.forEach((x) => { labels[x.label] = (labels[x.label] || 0) + x.amount; }));
  const costRows = Object.keys(labels).sort((a, b) => labels[b] - labels[a]);
  if (costRows.length) rows.push({ key: 'h-own', label: 'Costs of each channel', type: 'head', help: 'fees, delivery, ads, commission and expenses filed under the channel' });
  costRows.forEach((label) => {
    const cells = per((c) => { const x = c.costs.find((y) => y.label === label); return x ? -x.amount : null; });
    add('own:' + label, label, { ...cells, all: -r2(labels[label]) }, 'line', { indent: true });
  });
  add('chprofit', 'Channel profit', { ...per((c) => c.profit), all: p.channelProfit }, 'sub', { margins: { ...per((c) => (c.net ? c.profit / c.net : null)), all: p.all.net ? p.channelProfit / p.all.net : null } });
  const none = { Online: null, Retail: null, Wholesale: null };
  if (p.shared.lines.length) {
    rows.push({ key: 'h-shared', label: 'Shared costs', type: 'head', help: 'costs of the whole shop' });
    p.shared.lines.forEach((x) => add('shared:' + x.label, x.label, { ...none, all: -x.amount }, 'line', { indent: true }));
  }
  if (p.income.lines.length) {
    rows.push({ key: 'h-income', label: 'Other income', type: 'head', help: 'money that is not from sales' });
    p.income.lines.forEach((x) => add('income:' + x.label, x.label, { ...none, all: x.amount }, 'line', { indent: true }));
  }
  add('netprofit', p.net < 0 ? 'Net loss' : 'Net profit', { ...none, all: p.net }, 'total', { margins: { ...none, all: p.all.net ? p.netMargin : null } });
  return rows;
}

/** Up to three plain sentences about the figures. */
function insightsOf(p) {
  const list = IDS.map((id) => ({ id, ...p.channels[id] })).filter((c) => c.net > 0);
  if (!list.length) return [];
  const out = [];
  const best = list.reduce((a, b) => (b.profit > a.profit ? b : a));
  if (best.profit > 0) out.push({ icon: 'trophy', text: <><b>{best.id} made the most profit:</b> {money(best.profit)} ({pct0(best.profitMargin)} of its sales).</> });
  // the channel whose own costs take the biggest bite out of its gross profit
  const costly = list.filter((c) => c.costsTotal > 0 && c.id !== best.id).sort((a, b) => b.costsTotal / b.net - a.costsTotal / a.net)[0]
    || list.filter((c) => c.costsTotal > 0).sort((a, b) => b.costsTotal / b.net - a.costsTotal / a.net)[0];
  if (costly) {
    const top = costly.costs.slice(0, 3).map((x) => x.label.toLowerCase());
    const words = top.length > 1 ? top.slice(0, -1).join(', ') + ' and ' + top[top.length - 1] : top[0];
    out.push({ icon: 'receipt', text: <><b>{costly.id} keeps {pct0(costly.profitMargin)} of its sales</b> after {words}: its own costs were {money(costly.costsTotal)}, taking it down from a {pct0(costly.margin)} gross margin.</> });
  }
  const thin = list.filter((c) => c.margin < 0.25).sort((a, b) => a.margin - b.margin)[0];
  if (thin) out.push({ icon: 'triangle-alert', text: <><b>{thin.id} margin is thin at {pct0(thin.margin)}:</b> its goods cost {pct0(thin.net ? thin.cost / thin.net : 0)} of sales.</> });
  else if (p.shared.total > 0 && p.channelProfit > 0) out.push({ icon: 'building-2', text: <><b>Shared costs took {pct0(p.shared.total / p.channelProfit)}</b> of what the channels made ({money(p.shared.total)} of {money(p.channelProfit)}).</> });
  return out.slice(0, 3);
}

/** Day-by-day sales per channel, at most 31 bars. */
function trendOf(p, from, to) {
  const days = Math.max(1, Math.round((to - from) / 864e5));
  const size = Math.ceil(days / 31);
  const bars = [];
  for (let i = 0; i < days; i += size) bars.push({ start: addDays(from, i), end: Math.min(addDays(from, i + size), to), Online: 0, Retail: 0, Wholesale: 0, total: 0 });
  IDS.forEach((id) => Object.entries(p.channels[id].days).forEach(([k, v]) => {
    const b = bars[Math.floor(Math.round((fromKey(k) - from) / 864e5) / size)];
    if (!b) return;
    b[id] += v; b.total += v;
  }));
  bars.forEach((b) => { IDS.forEach((id) => { b[id] = r2(b[id]); }); b.total = r2(b.total); });
  return { bars, size };
}
const barLabel = (b, size) => (size === 1 ? `${new Date(b.start).getDate()} ${MON(b.start)}` : rangeText(b.start, b.end));

// ---- CSV ----------------------------------------------------------------------------------------
const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
function downloadCsv(name, rows) {
  const text = '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- page ---------------------------------------------------------------------------------------
const CSS = `
.sp-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.sp-grid--one{grid-template-columns:minmax(0,1fr)}
.sp-legend{display:flex;flex-wrap:wrap;gap:var(--space-4);font-size:var(--text-xs);color:var(--text-muted)}
.sp-legend span{display:inline-flex;align-items:center;gap:6px}
.sp-legend i{display:inline-block;width:10px;height:10px;border-radius:var(--radius-full)}
.sp-legend b{font-weight:var(--weight-medium);color:var(--text-heading);font-family:var(--font-data)}
.sp-chart{display:flex;align-items:stretch;gap:3px;height:160px;margin-top:var(--space-3);padding-bottom:1px;border-bottom:1px solid var(--border-subtle)}
.sp-col{flex:1 1 0;min-width:0;display:flex;flex-direction:column-reverse}
.sp-col i{display:block;flex:none;min-width:0}
.sp-col i:last-child{border-radius:var(--radius-sm) var(--radius-sm) 0 0}
.sp-col:hover i{opacity:.8}
.sp-axis{display:flex;gap:3px;margin-top:6px}
.sp-axis span{flex:1 1 0;min-width:0;text-align:center;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data);white-space:nowrap;overflow:visible}
.sp-notes{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.sp-notes li{display:flex;gap:var(--space-2);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-body)}
.sp-notes li:first-child{border-top:0;padding-top:0}
.sp-notes svg{flex:none;margin-top:2px;color:var(--text-muted)}
.sp-notes b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-stmt th,.sp-stmt td{white-space:nowrap}
.sp-stmt thead th{text-align:right}
.sp-stmt thead th:first-child{text-align:left}
.sp-stmt tbody th[scope="row"],.sp-stmt thead th:first-child{position:sticky;left:0;z-index:1;background:var(--surface-card);text-align:left}
.sp-stmt thead th:first-child{background:var(--surface-subtle)}
.sp-stmt .is-indent th[scope="row"]{padding-left:calc(var(--space-4) + var(--space-4))}
.sp-stmt .is-head th{padding-top:var(--space-3);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);background:var(--surface-card);text-align:left;border-bottom:1px solid var(--border-subtle)}
.sp-stmt .is-head th span{margin-left:var(--space-2);font-weight:var(--weight-regular)}
.sp-stmt .is-sub th,.sp-stmt .is-sub td{font-weight:var(--weight-semibold);color:var(--text-heading);border-top:1px solid var(--border-strong)}
.sp-stmt .is-total th,.sp-stmt .is-total td{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle);border-top:1px solid var(--border-strong)}
.sp-stmt .is-all{background:var(--surface-subtle)}
.sp-stmt .is-total .is-all{background:var(--fill-primary-soft)}
.sp-stmt .sp-m{display:block;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.sp-stmt .sp-blank{color:var(--text-faint)}
.sp-est{font-family:var(--font-data);color:var(--text-warning);margin-left:2px}
.sp-pos{color:var(--text-success)!important}
.sp-neg{color:var(--text-danger)!important}
@media (max-width:1023px){.sp-grid{grid-template-columns:minmax(0,1fr)}}
@media print{[data-screen="SalesProfit"] .gc-shell__content{padding:0!important}}
`;
const ABOUT = 'How much each channel sold, and how much profit each one made after its own costs.';

export default function SalesProfit() {
  const tick = useBooks();
  const ready = tick > 0;
  const [preset, setPreset] = useState(null);   // null = pick for me (see below)
  const [custom, setCustom] = useState(null);

  const now = useMemo(() => clockNow(), [tick]);   // eslint-disable-line react-hooks/exhaustive-deps
  // default: this month, or last month when this month has hardly any sales yet (fewer than 10 records)
  const autoPreset = useMemo(() => {
    if (!ready) return 'last';
    const from = monthStart(now);
    return getSales().filter((s) => s.at >= from && s.at <= now).length < 10 ? 'last' : 'month';
  }, [ready, now, tick]);   // eslint-disable-line react-hooks/exhaustive-deps
  const active = preset || autoPreset;
  const customRange = custom || { from: dayKey(monthStart(now, -1)), to: dayKey(now) };
  const per = useMemo(() => periodOf(active, now, customRange), [active, now, customRange.from, customRange.to]);   // eslint-disable-line react-hooks/exhaustive-deps

  const p = useMemo(() => (ready ? profitByChannel(per.from, per.to) : blankProfit()), [ready, tick, per]);   // eslint-disable-line react-hooks/exhaustive-deps
  const rows = useMemo(() => statementOf(p), [p]);
  const trend = useMemo(() => trendOf(p, per.from, per.to), [p, per]);
  const insights = useMemo(() => (ready ? insightsOf(p) : []), [p, ready]);

  const periodText = rangeText(per.from, per.to);
  const F = (n) => (ready ? fig(n) : '—');
  const P = (n) => (ready && n != null ? pct(n) : '—');
  const empty = ready && !p.all.revenue && !p.all.returns;
  const anyEst = IDS.some((id) => p.channels[id].est);

  const pickPreset = (id) => {
    setPreset(id);
    if (id === 'custom' && !custom) setCustom(customRange);
  };
  const setCustomDay = (field, value) => { if (value) setCustom({ ...customRange, [field]: value }); };

  const exportCsv = () => {
    if (!ready) return;
    const num = (v) => (v == null ? '' : r2(v));
    const body = rows.map((r) => (r.type === 'head'
      ? [r.label + (r.help ? ' (' + r.help + ')' : '')]
      : [r.label, ...IDS.map((id) => num(r.cells[id])), num(r.cells.all)]));
    const margins = rows.filter((r) => r.margins).map((r) => [r.label + ' margin %', ...IDS.map((id) => (r.margins[id] == null ? '' : r2(r.margins[id] * 100))), r.margins.all == null ? '' : r2(r.margins.all * 100)]);
    const csv = [
      ['GridCommerce · Profit by channel'], ['Period', periodText], ['Counted on the day of the sale. Figures in BDT; costs and returns are negative.'], [],
      ['Item', ...IDS.map((id) => id + (p.channels[id].est ? ' (estimated cost)' : '')), 'All'],
      ...body, [], ...margins, [],
      ['Orders', ...IDS.map((id) => p.channels[id].orders), p.all.orders],
      ['Average order', ...IDS.map((id) => r2(p.channels[id].avg)), r2(p.all.avg)],
      ['Still due', ...IDS.map((id) => r2(p.channels[id].due)), r2(p.all.due)],
    ];
    const name = `gridcommerce-profit-by-channel-${dayKey(per.from)}-to-${dayKey(addDays(per.to, -1))}.csv`;
    try { downloadCsv(name, csv); toast(`${name} downloaded`); } catch { toast('Could not make the CSV file in this browser', { tone: 'error' }); }
  };

  const loss = ready && p.net < 0;
  // orders, average order, share of sales and what is still due: the rest of each channel's numbers
  const extra = [
    { key: 'orders', label: 'Orders', cell: (c) => (ready ? c.orders.toLocaleString('en') : '—') },
    { key: 'avg', label: 'Average order', cell: (c) => (ready ? money(c.avg) : '—') },
    { key: 'share', label: 'Share of sales', cell: (c, id) => (id === 'all' ? (ready && p.all.net ? pct(1) : '—') : P(p.all.net > 0 ? Math.max(0, c.net / p.all.net) : null)) },
    { key: 'due', label: 'Still due', cell: (c) => (ready && c.due > 0 ? <Link href="/dues" style={{ color: 'var(--text-warning)' }}>{money(c.due)}</Link> : F(c.due)) },
  ];

  return (
    <AccPage screen="SalesProfit" active="rep-finance" page="Sales & profit" title="Sales & profit" css={CSS} icon="chart-pie" about={ABOUT}
      secondary={[{ label: 'Print', onClick: () => window.print() }]}
      more={[{ label: 'Expense categories', href: '/account-setup?tab=categories' }, { label: 'Reports', href: '/account-reports' }]}
      primary={{ label: 'Download CSV', onClick: exportCsv }}>

      <div className="ac-period">
        <select className="ix-pick ac-noprint" aria-label="Period" value={active} onChange={(e) => pickPreset(e.target.value)}>
          {PRESETS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        {active === 'custom' ? (<>
          <input type="date" className="ix-date ac-noprint" aria-label="From" value={customRange.from} max={customRange.to} onChange={(e) => setCustomDay('from', e.target.value)} />
          <input type="date" className="ix-date ac-noprint" aria-label="To" value={customRange.to} min={customRange.from} onChange={(e) => setCustomDay('to', e.target.value)} />
        </>) : null}
        <span className="ac-period__text" aria-live="polite"><b>{ready ? periodText : '—'}</b> · counted on the day of the sale</span>
      </div>

      <MetricStrip label={periodText} items={[
        { label: 'All channels · net sales', value: F(p.all.net), sub: ready ? `${p.all.orders.toLocaleString('en')} orders` : '' },
        { label: 'Gross profit', value: F(p.all.gross), sub: ready ? `${P(p.all.net ? p.all.gross / p.all.net : null)} margin` : '' },
        { label: loss ? 'Net loss' : 'Net profit', value: <span className={ready ? (loss ? 'sp-neg' : 'sp-pos') : ''}>{F(p.net)}</span>, sub: ready ? `${P(p.all.net ? p.netMargin : null)} of sales` : '' },
        { label: 'Still due', value: F(p.all.due), sub: 'online and wholesale', href: '/dues' },
      ]} />

      {empty ? (
        <section className="ix-card"><div className="ix-empty"><EmptyState icon="chart-no-axes-column" title="No sales in this period" body="Pick another period above." /></div></section>
      ) : (
        <>
          <div className={'sp-grid' + (insights.length ? '' : ' sp-grid--one')}>
            <section className="ix-card" aria-labelledby="sp-trend-h">
              <header className="ix-card__head"><h2 id="sp-trend-h">Sales trend <InfoTip text={`Sales before returns, ${trend.size > 1 ? `${trend.size} days per bar` : 'day by day'}, ${ready ? periodText : ''}.`} /></h2></header>
              <div className="ix-card__body"><Trend trend={trend} p={p} ready={ready} periodText={periodText} /></div>
            </section>
            {insights.length ? (
              <section className="ix-card" aria-labelledby="sp-notes-h">
                <header className="ix-card__head"><h2 id="sp-notes-h">What stands out</h2></header>
                <div className="ix-card__body">
                  <ul className="sp-notes">{insights.map((x, i) => <li key={i}><Icon name={x.icon} width="16" height="16" aria-hidden="true" /><span>{x.text}</span></li>)}</ul>
                </div>
              </section>
            ) : null}
          </div>

          <section className="ix-card ac-card" aria-labelledby="sp-stmt-h">
            <header className="ix-card__head">
              <h2 id="sp-stmt-h">Profit by channel <InfoTip text={`What each channel sold, what its goods and its own costs were, and what it left as profit. Counted on the day of the sale. Cost of goods is each product’s buying price; days marked ~ use the usual cost share.${anyEst ? ' Channels marked ~ include such days.' : ''} Sales commission, affiliate payouts and promotions count when they are owed, not when they are paid.`} /></h2>
              <Link href="/account-setup?tab=categories" className="ac-noprint">Expense categories</Link>
            </header>
            <div className="gc-table-wrap" style={{ marginTop: 'var(--space-3)' }}>
              <table className="gc-table gc-table--compact sp-stmt">
                <caption className="sr-only">Profit by channel, {periodText}. Costs and returns are shown with a minus sign.</caption>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    {CH.map((c) => <th key={c.id} scope="col" className="ac-num" title={c.help}>{c.id}{p.channels[c.id].est ? <span className="sp-est" title="Cost of goods partly estimated">~<span className="sr-only"> (cost partly estimated)</span></span> : null}</th>)}
                    <th scope="col" className="ac-num">All</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (r.type === 'head' ? (
                    <tr key={r.key} className="is-head"><th scope="colgroup" colSpan={5}>{r.label}{r.help ? <span>· {r.help}</span> : null}</th></tr>
                  ) : (
                    <tr key={r.key} className={'is-' + r.type + (r.indent ? ' is-indent' : '')}>
                      <th scope="row">{r.label}</th>
                      {[...IDS, 'all'].map((id) => {
                        const v = r.cells[id];
                        const m = r.margins ? r.margins[id] : null;
                        const tone = r.type === 'total' && id === 'all' && ready ? (v < 0 ? ' sp-neg' : ' sp-pos') : '';
                        return (
                          <td key={id} className={'ac-num ac-fig' + (id === 'all' ? ' is-all' : '') + tone}>
                            {v == null ? <><span className="sp-blank" aria-hidden="true">—</span><span className="sr-only">none</span></> : F(v)}
                            {r.margins && v != null ? <span className="sp-m">{P(m)} margin</span> : null}
                          </td>
                        );
                      })}
                    </tr>
                  )))}
                  <tr className="is-head"><th scope="colgroup" colSpan={5}>Orders and dues</th></tr>
                  {extra.map((x) => (
                    <tr key={x.key} className="is-line is-indent">
                      <th scope="row">{x.label}</th>
                      {[...IDS, 'all'].map((id) => <td key={id} className={'ac-num ac-fig' + (id === 'all' ? ' is-all' : '')}>{x.cell(id === 'all' ? p.all : p.channels[id], id)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AccPage>
  );
}

// ---- parts --------------------------------------------------------------------------------------
function Trend({ trend, p, ready, periodText }) {
  const { bars, size } = trend;
  const max = Math.max(1, ...bars.map((b) => b.total));
  const every = bars.length > 10 ? 5 : 1;
  return (
    <div>
      <div className="sp-legend" aria-hidden="true">
        {CH.map((c) => <span key={c.id}><i style={{ background: c.color }} /> {c.id} <b>{ready ? money(p.channels[c.id].revenue) : '—'}</b></span>)}
      </div>
      <div className="sp-chart" aria-hidden="true">
        {bars.map((b) => (
          <div key={b.start} className="sp-col" title={ready ? `${barLabel(b, size)} · ${CH.map((c) => `${c.id} ${money(b[c.id])}`).join(' · ')}` : undefined}>
            {CH.map((c) => (b[c.id] > 0 ? <i key={c.id} style={{ height: (b[c.id] / max) * 100 + '%', background: c.color }} /> : null))}
          </div>
        ))}
      </div>
      <div className="sp-axis" aria-hidden="true">
        {bars.map((b, i) => <span key={b.start}>{i % every === 0 ? new Date(b.start).getDate() : ''}</span>)}
      </div>
      {ready ? (
        <table className="sr-only">
          <caption>Sales by channel before returns, {periodText}</caption>
          <thead><tr><th scope="col">{size > 1 ? 'Days' : 'Day'}</th>{CH.map((c) => <th key={c.id} scope="col">{c.id}</th>)}<th scope="col">All</th></tr></thead>
          <tbody>{bars.map((b) => <tr key={b.start}><th scope="row">{barLabel(b, size)}</th>{CH.map((c) => <td key={c.id}>{money(b[c.id])}</td>)}<td>{money(b.total)}</td></tr>)}</tbody>
        </table>
      ) : null}
    </div>
  );
}
