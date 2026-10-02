'use client';
// SalesProfit — Accounts › Sales & profit: how much each channel (Online, Retail, Wholesale) sold
// over a period and how much profit each made.
//   Channel cards   net sales, orders and average order, gross and channel profit with margins,
//                   returns, what is still due, and the channel's share of all sales.
//   Sales trend     day-by-day stacked bars per channel (grouped when the period is long).
//   Statement       profit by channel: sales − returns − cost of goods = gross profit − the channel's
//                   own costs = channel profit; then shared costs and other income give net profit.
//   Insights        two or three plain sentences worked out from the figures.
// Counted on the day of the sale (profit.js / salesBook.js). Which channel an expense belongs to is
// set per category in Setup › Categories. Front end only: demo month September 2026.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
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
  { id: 'Online', icon: 'globe', color: 'var(--primary)', soft: 'var(--fill-primary-soft)', ink: 'var(--primary)', help: 'Website, Facebook and phone orders' },
  { id: 'Retail', icon: 'store', color: 'var(--fill-success)', soft: 'var(--fill-success-soft)', ink: 'var(--text-success)', help: 'Counter sales at the shops' },
  { id: 'Wholesale', icon: 'warehouse', color: 'var(--fill-warning)', soft: 'var(--fill-warning-soft)', ink: 'var(--text-warning)', help: 'Invoices to wholesale customers' },
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
.sp-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3)}
.sp-bar .ac-seg{flex-wrap:wrap}
.sp-custom{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3)}
.sp-custom > div{min-width:0}
.sp-custom .gc-input{width:auto;max-width:100%}
.sp-range{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sp-range b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sp-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:var(--space-4)}
.sp-ch{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4) var(--space-5);min-width:0}
.sp-ch__head{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.sp-ch__icon{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-full)}
.sp-ch__head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-ch__head p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sp-ch__head .gc-badge{margin-left:auto}
.sp-big{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-big-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sp-share{display:flex;flex-direction:column;gap:4px}
.sp-share__track{height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.sp-share__fill{display:block;height:100%;border-radius:var(--radius-full)}
.sp-share small{font-size:var(--text-xs);color:var(--text-muted)}
.sp-dl{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-3);margin:0;padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sp-dl dt{color:var(--text-muted)}
.sp-dl dd{margin:0;text-align:right;color:var(--text-heading)}
.sp-dl dd small{margin-left:6px;font-size:var(--text-xs);color:var(--text-muted)}
.sp-dl .is-key dt,.sp-dl .is-key dd{font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-dl > div{display:contents}
.sp-chartbox{padding:0 var(--space-5) var(--space-5)}
.sp-legend{display:flex;flex-wrap:wrap;gap:var(--space-4);font-size:var(--text-xs);color:var(--text-muted)}
.sp-legend span{display:inline-flex;align-items:center;gap:6px}
.sp-legend i{display:inline-block;width:10px;height:10px;border-radius:var(--radius-full)}
.sp-legend b{font-weight:var(--weight-medium);color:var(--text-heading);font-family:var(--font-data)}
.sp-chart{display:flex;align-items:stretch;gap:3px;height:180px;margin-top:var(--space-3);padding-bottom:1px;border-bottom:1px solid var(--border-subtle)}
.sp-col{flex:1 1 0;min-width:0;display:flex;flex-direction:column-reverse}
.sp-col i{display:block;flex:none;min-width:0}
.sp-col i:last-child{border-radius:var(--radius-sm) var(--radius-sm) 0 0}
.sp-col:hover i{opacity:.8}
.sp-axis{display:flex;gap:3px;margin-top:6px}
.sp-axis span{flex:1 1 0;min-width:0;text-align:center;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data);white-space:nowrap;overflow:visible}
.sp-stmt th,.sp-stmt td{white-space:nowrap}
.sp-stmt thead th{text-align:right}
.sp-stmt thead th:first-child{text-align:left}
.sp-stmt tbody th[scope="row"],.sp-stmt thead th:first-child{position:sticky;left:0;z-index:1;background:var(--surface-card);text-align:left}
.sp-stmt thead th:first-child{background:var(--surface-table-head)}
.sp-stmt .is-indent th[scope="row"]{padding-left:calc(var(--space-5) + var(--space-4))}
.sp-stmt .is-head th{padding-top:var(--space-4);font-size:var(--text-xs);text-transform:uppercase;letter-spacing:var(--tracking-wide);font-weight:var(--weight-semibold);color:var(--text-muted);background:var(--surface-card);text-align:left;border-bottom:1px solid var(--border-subtle)}
.sp-stmt .is-head th span{margin-left:var(--space-2);text-transform:none;letter-spacing:0;font-weight:var(--weight-regular)}
.sp-stmt .is-sub th,.sp-stmt .is-sub td{font-weight:var(--weight-semibold);color:var(--text-heading);border-top:1px solid var(--border-strong)}
.sp-stmt .is-total th,.sp-stmt .is-total td{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle);font-size:var(--text-sm-plus);border-top:1px solid var(--border-strong)}
.sp-stmt .is-all{background:var(--surface-subtle)}
.sp-stmt .is-total .is-all{background:var(--fill-primary-soft)}
.sp-stmt .sp-m{display:block;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.sp-stmt .sp-blank{color:var(--text-faint)}
.sp-est{font-family:var(--font-data);color:var(--text-warning);margin-left:2px}
.sp-pos{color:var(--text-success)!important}
.sp-neg{color:var(--text-danger)!important}
.sp-foot{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-2)}
.sp-foot p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sp-foot a{color:var(--text-link);font-weight:var(--weight-medium)}
.sp-notes{display:flex;flex-direction:column;gap:var(--space-2)}
@media print{
  gc-sidebar,gc-topbar,.sp-noprint,.gc-pagehead__actions{display:none!important}
  [data-screen="SalesProfit"] .gc-shell__main{border:0!important}
  [data-screen="SalesProfit"] .gc-shell__content{padding:0!important}
}
`;

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

  const actions = (
    <>
      <Link href="/account-setup?tab=categories" className="gc-btn gc-btn--neutral"><Icon name="tags" width="18" height="18" aria-hidden="true" /> Expense categories</Link>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => window.print()}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={exportCsv}><Icon name="download" width="18" height="18" aria-hidden="true" /> Download CSV</button>
    </>
  );

  const kpi = (icon, bg, color, label, value, small, valueClass = '') => (
    <div className="gc-kpi">
      <span className="gc-kpi__icon" style={{ background: bg, color }}><Icon name={icon} width="24" height="24" aria-hidden="true" /></span>
      <div className="gc-kpi__text"><p className="gc-kpi__label">{label}</p><p className={'gc-kpi__value ac-fig ' + valueClass}>{value}<small>{small}</small></p></div>
    </div>
  );
  const loss = ready && p.net < 0;

  return (
    <AccPage screen="SalesProfit" active="rep-finance" page="Sales & profit" title="Sales & profit" css={CSS}
      about="How much each channel sold, and how much profit each one made after its own costs."
      actions={actions}>

      <div className="sp-bar">
        <div className="sp-custom">
          <div className="ac-seg sp-noprint" role="group" aria-label="Period">
            {PRESETS.map(([id, label]) => <button key={id} type="button" aria-pressed={active === id} onClick={() => pickPreset(id)}>{label}</button>)}
          </div>
          {active === 'custom' ? (
            <>
              <div className="sp-noprint"><label className="gc-label" htmlFor="sp-from">From</label><input id="sp-from" type="date" className="gc-input" value={customRange.from} max={customRange.to} onChange={(e) => setCustomDay('from', e.target.value)} /></div>
              <div className="sp-noprint"><label className="gc-label" htmlFor="sp-to">To</label><input id="sp-to" type="date" className="gc-input" value={customRange.to} min={customRange.from} onChange={(e) => setCustomDay('to', e.target.value)} /></div>
            </>
          ) : null}
        </div>
        <p className="sp-range" aria-live="polite"><b>{ready ? periodText : '—'}</b> · counted on the day of the sale</p>
      </div>

      <div className="gc-kpis gc-kpis--tight">
        {kpi('shopping-bag', 'var(--fill-primary-soft)', 'var(--primary)', 'All channels · net sales', F(p.all.net), ready ? `${p.all.orders.toLocaleString('en')} orders` : '')}
        {kpi('layers', 'var(--fill-success-soft)', 'var(--text-success)', 'Gross profit', F(p.all.gross), ready ? `${P(p.all.net ? p.all.gross / p.all.net : null)} margin` : '')}
        {kpi(loss ? 'trending-down' : 'trending-up', loss ? 'var(--fill-error-soft)' : 'var(--fill-success-soft)', loss ? 'var(--text-danger)' : 'var(--text-success)', loss ? 'Net loss' : 'Net profit', F(p.net), ready ? `${P(p.all.net ? p.netMargin : null)} of sales` : '', ready ? (loss ? 'sp-neg' : 'sp-pos') : '')}
        {kpi('hand-coins', 'var(--fill-warning-soft)', 'var(--text-warning)', 'Still due', F(p.all.due), 'online and wholesale')}
      </div>

      {empty ? (
        <section className="gc-card ac-card">
          <EmptyState icon="chart-no-axes-column" title="No sales in this period" body="Pick another period above." />
        </section>
      ) : (
        <>
          <div className="sp-cards">
            {CH.map((c) => <ChannelCard key={c.id} c={c} s={p.channels[c.id]} total={p.all.net} ready={ready} F={F} P={P} />)}
          </div>

          <section className="gc-card ac-card" aria-labelledby="sp-trend-h">
            <div className="ac-head"><div><h2 id="sp-trend-h">Sales trend</h2><p>Sales before returns, {trend.size > 1 ? `${trend.size} days per bar` : 'day by day'}, {ready ? periodText : '—'}.</p></div></div>
            <Trend trend={trend} p={p} ready={ready} periodText={periodText} />
          </section>

          <section className="gc-card ac-card" aria-labelledby="sp-stmt-h">
            <div className="ac-head">
              <div><h2 id="sp-stmt-h">Profit by channel</h2><p>What each channel sold, what its goods and its own costs were, and what it left as profit.</p></div>
            </div>
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact sp-stmt">
                <caption className="sr-only">Profit by channel, {periodText}. Costs and returns are shown with a minus sign.</caption>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    {CH.map((c) => <th key={c.id} scope="col" className="ac-num">{c.id}{p.channels[c.id].est ? <span className="sp-est" title="Cost of goods partly estimated">~<span className="sr-only"> (cost partly estimated)</span></span> : null}</th>)}
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
                </tbody>
              </table>
            </div>
            <div className="sp-foot">
              <p>Counted on the day of the sale. Cost of goods is each product’s buying price; days marked ~ use the usual cost share.{anyEst ? ' Channels marked ~ include such days.' : ''}</p>
              <p className="sp-noprint">Change which channel a cost belongs to in <Link href="/account-setup?tab=categories">Setup › Categories</Link>. Sales commission, affiliate payouts and promotions count when they are owed, not when they are paid.</p>
            </div>
          </section>

          {insights.length ? (
            <section className="sp-notes" aria-label="What stands out">
              {insights.map((x, i) => <div key={i} className="ac-note ac-note--info"><Icon name={x.icon} width="16" height="16" aria-hidden="true" /><span>{x.text}</span></div>)}
            </section>
          ) : null}
        </>
      )}
    </AccPage>
  );
}

// ---- parts --------------------------------------------------------------------------------------
function ChannelCard({ c, s, total, ready, F, P }) {
  const share = ready && total > 0 ? Math.max(0, s.net / total) : 0;
  const neg = (n) => (!ready ? '—' : n ? '−' + money(n) : money(0));
  return (
    <section className="gc-card ac-card sp-ch" aria-labelledby={'sp-ch-' + c.id}>
      <div className="sp-ch__head">
        <span className="sp-ch__icon" style={{ background: c.soft, color: c.ink }}><Icon name={c.icon} width="20" height="20" aria-hidden="true" /></span>
        <div style={{ minWidth: 0 }}><h2 id={'sp-ch-' + c.id}>{c.id}</h2><p>{c.help}</p></div>
        {ready && s.est ? <span className="gc-badge gc-badge--warning" title="Some days use the usual cost share instead of each product’s buying price">~ estimated</span> : null}
      </div>
      <div>
        <p className="sp-big ac-fig">{F(s.net)}</p>
        <p className="sp-big-sub">Net sales · {ready ? `${s.orders.toLocaleString('en')} order${s.orders === 1 ? '' : 's'}, average ${money(s.avg)}` : '—'}</p>
      </div>
      <div className="sp-share">
        <div className="sp-share__track" aria-hidden="true"><span className="sp-share__fill" style={{ width: share * 100 + '%', background: c.color }} /></div>
        <small>{ready ? `${pct(share)} of all sales` : '—'}</small>
      </div>
      <dl className="sp-dl">
        <div><dt>Gross profit</dt><dd className="ac-fig">{F(s.gross)}<small>{P(s.net ? s.margin : null)}</small></dd></div>
        <div><dt>Own costs</dt><dd className="ac-fig">{neg(s.costsTotal)}</dd></div>
        <div className="is-key"><dt>Channel profit</dt><dd className={'ac-fig' + (ready && s.profit < 0 ? ' sp-neg' : '')}>{F(s.profit)}<small>{P(s.net ? s.profitMargin : null)}</small></dd></div>
        <div><dt>Returns</dt><dd className="ac-fig">{neg(s.returns)}</dd></div>
        <div><dt>Still due</dt><dd className="ac-fig">{ready && s.due > 0 ? <Link href="/dues" style={{ color: 'var(--text-warning)' }}>{money(s.due)}</Link> : F(s.due)}</dd></div>
      </dl>
    </section>
  );
}

function Trend({ trend, p, ready, periodText }) {
  const { bars, size } = trend;
  const max = Math.max(1, ...bars.map((b) => b.total));
  const every = bars.length > 10 ? 5 : 1;
  return (
    <div className="sp-chartbox">
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
