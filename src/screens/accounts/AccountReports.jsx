'use client';
// AccountReports — Accounts › Reports: how the shop did over a period, in plain words.
//   Profit & loss  money in from sales plus other income (supplier bonuses, interest, scrap …) minus
//                  what was spent: stock, expenses, salaries, sales commission, affiliate payouts,
//                  promotions and partner fees (cash basis: counted when money moved), compared with
//                  the period before. Moves between the shop's own accounts and partner payouts are
//                  left out; money the owner took is shown under the result. Profit by channel, counted
//                  when owed, is on Sales & profit (/sales-profit).
//   Cash flow      each account (cash, bank, mobile wallets, partners) from opening to closing, and
//                  a day-by-day in/out chart of the shop's own accounts.
//   Partner fees   what each gateway and courier collected and what it kept (fee + delivery charge).
//   VAT            the rates set on the VAT page and an estimate of the VAT inside sales.
// Front end only: reads the books in ledger.js (demo month September 2026) and settlements.js.

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, InfoTip } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { ACCOUNTS, accountBy, balanceOf, getEntries } from '@/lib/ledger';
import { clockNow, costsOf, dayKey, fromKey, getItems, getPartners, startOfDay } from '@/lib/settlements';
import { loadVat } from '@/lib/vat';
import { AccPage, accName, money, useBooks } from './accShared';

// ---- words and dates ----------------------------------------------------------------------------
const r2 = (n) => Math.round(n * 100) / 100;
/** ৳1,250 or −৳1,250 */
const fig = (n) => (r2(n) < 0 ? '−' : '') + money(n);
const pctText = (n) => (Math.round(n * 10) / 10).toLocaleString('en', { maximumFractionDigits: 1 }) + '%';
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
/** The period [from, to) and the one it is compared with. */
function periodOf(preset, now, custom) {
  const today = startOfDay(now), tomorrow = addDays(today, 1);
  if (preset === 'month') {
    const from = monthStart(now), pFrom = monthStart(now, -1);
    return { from, to: tomorrow, pFrom, pTo: Math.min(addDays(pFrom, Math.round((tomorrow - from) / 864e5)), from) };
  }
  if (preset === 'last') return { from: monthStart(now, -1), to: monthStart(now), pFrom: monthStart(now, -2), pTo: monthStart(now, -1) };
  if (preset === 'week') { const from = addDays(tomorrow, -7); return { from, to: tomorrow, pFrom: addDays(from, -7), pTo: from }; }
  let a = fromKey(custom.from), b = fromKey(custom.to);
  if (b < a) [a, b] = [b, a];
  const to = addDays(b, 1), days = Math.round((to - a) / 864e5);
  return { from: a, to, pFrom: addDays(a, -days), pTo: a };
}

// ---- profit & loss ------------------------------------------------------------------------------
const SALE_KINDS = [['sale', 'Sales at the counter and online'], ['invoice payment', 'Invoice payments'], ['order payment', 'Order payments'], ['collected', 'Collected by gateways and couriers']];
const isHolding = (e) => (accountBy(e.account) || {}).type === 'Holding';

function profitOf(entries, from, to) {
  const list = entries.filter((e) => e.at >= from && e.at < to);
  const sum = (f) => r2(list.filter(f).reduce((a, e) => a + e.amount, 0));
  const sales = SALE_KINDS.map(([k, label]) => ({ key: 'in:' + k, label, value: sum((e) => e.kind === k && e.amount > 0) }));
  const refunds = sum((e) => e.kind === 'refund');   // negative
  const salesIn = r2(sales.reduce((a, s) => a + s.value, 0) + refunds);
  // money in that is not a sale, by its income category
  const income = {};
  list.filter((e) => e.kind === 'income').forEach((e) => { const c = e.cat || 'Other income'; income[c] = r2((income[c] || 0) + e.amount); });
  const otherIn = r2(Object.values(income).reduce((a, v) => a + v, 0));
  const cats = {};
  list.filter((e) => e.kind === 'expense' || e.kind === 'paid out').forEach((e) => {
    const c = e.cat || (e.kind === 'paid out' ? 'Paid out at the counter' : 'Other');
    cats[c] = r2((cats[c] || 0) - e.amount);
  });
  const stock = -sum((e) => e.kind === 'supplier payment');
  const salary = -sum((e) => e.kind === 'salary');
  const commission = -sum((e) => e.kind === 'commission');
  const affiliate = -sum((e) => e.kind === 'affiliate payout');
  const promotion = -sum((e) => e.kind === 'promotion');
  const fees = -sum((e) => e.kind === 'partner fee' && isHolding(e));
  const charges = -sum((e) => e.kind === 'courier charge' && isHolding(e));
  const diff = -sum((e) => e.kind === 'settlement difference' && isHolding(e));
  const costs = r2(stock + salary + commission + affiliate + promotion + fees + charges + diff + Object.values(cats).reduce((a, v) => a + v, 0));
  return {
    sales, refunds, salesIn, income, otherIn, cats, stock, salary, commission, affiliate, promotion, fees, charges, diff, costs,
    profit: r2(salesIn + otherIn - costs),
    ownerOut: -sum((e) => e.kind === 'owner withdraw'),
    ownerIn: sum((e) => e.kind === 'investment'),
    count: list.length,
  };
}

/** Statement rows for this period and the one before. good: 'up' when more is better, 'down' for costs. */
function statementRows(cur, prev) {
  const rows = [];
  const line = (key, label, a, b, good, extra = {}) => rows.push({ key, label, cur: a, prev: b, good, type: 'line', ...extra });
  rows.push({ key: 'h-in', label: 'Money in from sales', type: 'head' });
  cur.sales.forEach((s, i) => { if (s.value || prev.sales[i].value) line(s.key, s.label, s.value, prev.sales[i].value, 'up'); });
  if (cur.refunds || prev.refunds) line('refunds', 'Refunds paid back', cur.refunds, prev.refunds, 'up');
  rows.push({ key: 'salesIn', label: 'Total money in from sales', cur: cur.salesIn, prev: prev.salesIn, good: 'up', type: 'sub' });
  if (cur.otherIn || prev.otherIn) {
    rows.push({ key: 'h-other', label: 'Other income', type: 'head' });
    const inc = [...new Set([...Object.keys(cur.income), ...Object.keys(prev.income)])].sort((a, b) => (cur.income[b] || 0) - (cur.income[a] || 0));
    inc.forEach((c) => line('inc:' + c, c, cur.income[c] || 0, prev.income[c] || 0, 'up', { help: 'Not a sale' }));
    rows.push({ key: 'otherIn', label: 'Total other income', cur: cur.otherIn, prev: prev.otherIn, good: 'up', type: 'sub' });
  }
  rows.push({ key: 'h-out', label: 'Costs', type: 'head' });
  if (cur.stock || prev.stock) line('stock', 'Paid for stock', -cur.stock, -prev.stock, 'down', { help: 'Supplier payments' });
  const cats = [...new Set([...Object.keys(cur.cats), ...Object.keys(prev.cats)])].sort((a, b) => (cur.cats[b] || 0) - (cur.cats[a] || 0));
  cats.forEach((c) => line('cat:' + c, c, -(cur.cats[c] || 0), -(prev.cats[c] || 0), 'down', { help: 'Expense' }));
  if (cur.salary || prev.salary) line('salary', 'Salaries', -cur.salary, -prev.salary, 'down');
  if (cur.commission || prev.commission) line('commission', 'Sales commission', -cur.commission, -prev.commission, 'down', { help: 'Paid to sales staff' });
  if (cur.affiliate || prev.affiliate) line('affiliate', 'Affiliate payouts', -cur.affiliate, -prev.affiliate, 'down');
  if (cur.promotion || prev.promotion) line('promotion', 'Promotions', -cur.promotion, -prev.promotion, 'down', { help: 'Influencers, agencies, printing, stalls' });
  if (cur.fees || prev.fees) line('fees', 'Gateway and COD fees', -cur.fees, -prev.fees, 'down', { help: 'Counted when the payout arrives' });
  if (cur.charges || prev.charges) line('charges', 'Delivery charges', -cur.charges, -prev.charges, 'down', { help: 'Kept by couriers from COD money' });
  if (cur.diff || prev.diff) line('diff', 'Payout differences', -cur.diff, -prev.diff, 'down', { help: 'Payouts that came short or extra' });
  rows.push({ key: 'costs', label: 'Total costs', cur: -cur.costs, prev: -prev.costs, good: 'down', type: 'sub' });
  rows.push({ key: 'profit', label: cur.profit < 0 ? 'Loss this period' : 'Profit this period', cur: cur.profit, prev: prev.profit, good: 'up', type: 'total' });
  return rows;
}
/** Change against the period before: { text, tone } — tone good/bad/flat. */
function deltaOf(cur, prev, good) {
  if (!prev) return { text: cur ? 'New' : '—', tone: 'flat' };
  if (good === 'flat') return { text: (cur > prev ? '+' : '−') + pctText(Math.abs(((cur - prev) / Math.abs(prev)) * 100)), tone: 'flat' };
  const pct = ((cur - prev) / Math.abs(prev)) * 100;
  if (Math.abs(pct) < 0.05) return { text: '0%', tone: 'flat' };
  // costs are shown as negative figures, so a smaller cost is also a bigger number: higher is better
  const better = cur > prev;
  return { text: (pct > 0 ? '+' : '−') + pctText(Math.abs(pct)), tone: better ? 'good' : 'bad' };
}

// ---- cash flow ----------------------------------------------------------------------------------
const TYPES = [['Cash', 'Cash', 'banknote'], ['Bank', 'Bank', 'landmark'], ['Mobile', 'Mobile wallets', 'smartphone'], ['Holding', 'With partners', 'hand-coins']];
const INTERNAL = ['transfer', 'cash pickup'];   // moves between the shop's own accounts

function cashFlowOf(entries, from, to) {
  const accounts = ACCOUNTS.map((a) => {
    const mine = entries.filter((e) => e.account === a.id);
    const opening = r2(a.opening + mine.filter((e) => e.at < from).reduce((s, e) => s + e.amount, 0));
    const inPeriod = mine.filter((e) => e.at >= from && e.at < to);
    const inn = r2(inPeriod.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0));
    const out = r2(inPeriod.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0));
    return { ...a, opening, inn, out, closing: r2(opening + inn + out), moves: inPeriod.length };
  });
  const groups = TYPES.map(([type, label, icon]) => {
    const list = accounts.filter((a) => a.type === type);
    const t = (f) => r2(list.reduce((s, a) => s + a[f], 0));
    return { type, label, icon, list, opening: t('opening'), inn: t('inn'), out: t('out'), closing: t('closing') };
  });
  // day by day: the shop's own accounts, leaving out moves between them
  const days = Math.max(1, Math.round((to - from) / 864e5));
  const size = Math.ceil(days / 31);
  const bars = [];
  for (let i = 0; i < days; i += size) bars.push({ start: addDays(from, i), end: Math.min(addDays(from, i + size), to), inn: 0, out: 0 });
  entries.forEach((e) => {
    if (e.at < from || e.at >= to || INTERNAL.includes(e.kind)) return;
    const acc = accountBy(e.account);
    if (!acc || acc.type === 'Holding') return;
    const b = bars[Math.floor(Math.round((startOfDay(e.at) - from) / 864e5) / size)];
    if (!b) return;
    if (e.amount > 0) b.inn += e.amount; else b.out -= e.amount;
  });
  bars.forEach((b) => { b.inn = r2(b.inn); b.out = r2(b.out); });
  return { accounts, groups, bars, size };
}
const barLabel = (b, size) => (size === 1 ? `${new Date(b.start).getDate()} ${MON(b.start)}` : rangeText(b.start, b.end));

// ---- partner fees -------------------------------------------------------------------------------
function partnerFeesOf(from, to) {
  const items = getItems().filter((i) => !i.removed && i.at >= from && i.at < to);
  const rows = getPartners().map((p) => {
    const list = items.filter((i) => i.partner === p.id);
    const s = list.reduce((a, i) => { const c = costsOf(i, p); a.collected += i.gross; a.fee += c.fee; a.charge += c.charge; return a; }, { collected: 0, fee: 0, charge: 0 });
    const collected = r2(s.collected), fee = r2(s.fee), charge = r2(s.charge);
    return { p, count: list.length, collected, fee, charge, cost: r2(fee + charge), pct: collected ? ((fee + charge) / collected) * 100 : 0, feePct: collected ? (fee / collected) * 100 : 0 };
  }).sort((a, b) => b.collected - a.collected);
  const total = rows.reduce((a, r) => ({ count: a.count + r.count, collected: r2(a.collected + r.collected), fee: r2(a.fee + r.fee), charge: r2(a.charge + r.charge) }), { count: 0, collected: 0, fee: 0, charge: 0 });
  total.cost = r2(total.fee + total.charge);
  total.pct = total.collected ? (total.cost / total.collected) * 100 : 0;
  const courierCharges = r2(rows.filter((r) => r.p.kind === 'Courier').reduce((a, r) => a + r.charge, 0));
  const gateways = rows.filter((r) => r.p.kind === 'Gateway' && r.collected > 0);
  const priciest = gateways.length ? gateways.reduce((a, b) => (b.feePct > a.feePct ? b : a)) : null;
  return { rows, total, courierCharges, priciest };
}

// ---- VAT ----------------------------------------------------------------------------------------
// the categories and starting rates of the VAT page (Accounts › VAT); the merchant's own rates win
const VAT_CATS = [['rice', 'Cables & chargers', 0], ['oil', 'Cases & covers', 5], ['soap', 'Screen care', 7.5], ['snack', 'Audio', 5], ['drink', 'Power banks', 5], ['cloth', 'Clothing', 7.5], ['elec', 'Electronics', 15]];
function vatOf(salesIn) {
  const vat = loadVat();
  const cats = VAT_CATS.map(([key, label, def]) => ({ key, label, rate: Number(vat.rates && vat.rates[key] != null ? vat.rates[key] : def) || 0 }));
  const avg = cats.length ? cats.reduce((a, c) => a + c.rate, 0) / cats.length : 0;
  const inside = vat.notReg ? 0 : r2(Math.max(0, salesIn) * avg / (100 + avg));
  return { notReg: !!vat.notReg, cats, avg, inside };
}

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
const TABS = [['pnl', 'Profit & loss'], ['cash', 'Cash flow'], ['partners', 'Partner fees'], ['vat', 'VAT']];

const CSS = `
.ar-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3)}
.ar-bar .ac-seg{flex-wrap:wrap}
.ar-range{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ar-range b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ar-custom{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3)}
.ar-custom > div{min-width:0}
.ar-custom .gc-input{width:auto;max-width:100%}
.ar-tabbar{padding:0 var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ar-tabbar .gc-tabs{border-bottom:0;flex-wrap:wrap;overflow:visible}
.ar-stmt th[scope="row"]{font-weight:var(--weight-regular);color:var(--text-body);text-align:left}
.ar-stmt .is-head th{padding-top:var(--space-4);font-size:var(--text-xs);text-transform:uppercase;letter-spacing:var(--tracking-wide);font-weight:var(--weight-semibold);color:var(--text-muted);background:none;border-bottom:1px solid var(--border-subtle)}
.ar-stmt .is-line th[scope="row"]{padding-left:calc(var(--space-5) + var(--space-4))}
.ar-stmt .is-sub th,.ar-stmt .is-sub td{font-weight:var(--weight-medium);color:var(--text-heading);border-top:1px solid var(--border-subtle)}
.ar-stmt .is-total th,.ar-stmt .is-total td{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle);font-size:var(--text-sm-plus)}
.ar-stmt .is-below th,.ar-stmt .is-below td{color:var(--text-muted)}
.ar-stmt .ac-sub{display:inline;margin-left:var(--space-2)}
.ar-pos{color:var(--text-success)}
.ar-neg{color:var(--text-danger)}
.ar-delta{display:inline-flex;align-items:center;padding:1px 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.ar-delta.is-good{background:var(--fill-success-soft);color:var(--text-success)}
.ar-delta.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.ar-delta.is-flat{color:var(--text-muted)}
.ar-foot{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.ar-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-4)}
.ar-group{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);padding:var(--space-3) var(--space-4);background:var(--surface-card);min-width:0}
.ar-group h3{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ar-group .ar-big{display:block;margin:2px 0 var(--space-2);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ar-group dl{display:grid;grid-template-columns:auto 1fr;gap:2px var(--space-3);margin:0;font-size:var(--text-xs)}
.ar-group dt{color:var(--text-muted)}
.ar-group dd{margin:0;text-align:right}
.ar-chartbox{padding:0 var(--space-5) var(--space-5)}
.ar-legend{display:flex;flex-wrap:wrap;gap:var(--space-4);font-size:var(--text-xs);color:var(--text-muted)}
.ar-legend span{display:inline-flex;align-items:center;gap:6px}
.ar-legend i{display:inline-block;width:10px;height:10px;border-radius:var(--radius-full)}
.ar-chart{display:flex;align-items:stretch;gap:2px;height:160px;margin-top:var(--space-3);padding-bottom:1px;border-bottom:1px solid var(--border-subtle)}
.ar-col{flex:1 1 0;min-width:0;display:flex;align-items:flex-end;gap:1px}
.ar-col i{flex:1 1 0;min-width:0;min-height:1px;border-radius:var(--radius-sm) var(--radius-sm) 0 0}
.ar-col:hover i,.ar-col:focus i{opacity:.8}
.ar-in-bar{background:var(--text-success)}
.ar-out-bar{background:var(--text-danger)}
.ar-axis{display:flex;gap:2px;margin-top:6px}
.ar-axis span{flex:1 1 0;min-width:0;text-align:center;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data);white-space:nowrap;overflow:visible}
.ar-vat{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-4)}
.ar-vat > div{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);padding:var(--space-3) var(--space-4)}
.ar-vat dt{font-size:var(--text-xs);color:var(--text-muted)}
.ar-vat dd{margin:2px 0 0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ar-vat .is-key{background:var(--fill-primary-soft)}
.ar-vat .is-key dd{color:var(--primary)}
.ar-pad{padding:0 var(--space-5) var(--space-4)}
.ac-card tfoot th,.ac-card tfoot td{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle)}
.ar-link{color:var(--primary);font-weight:var(--weight-medium);text-decoration:none}
.ar-link:hover{text-decoration:underline}
.ar-grouprow th{font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);background:var(--surface-subtle);text-align:left}
@media (max-width:640px){
  /* phone table-cards: a group heading row is a plain section heading, not an empty card */
  table.gc-cards-on>tbody>tr.is-head,table.gc-cards-on>tbody>tr.ar-grouprow{border:0!important;background:none!important;padding:var(--space-3) var(--space-1) 0!important}
  /* a line with nothing in the period before shows only this period (no "Before ৳0 · New" on every card) */
  table.gc-cards-on>tbody>tr>td.ar-noprev{display:none!important}
  table.gc-cards-on>tbody>tr.is-head>th,table.gc-cards-on>tbody>tr.ar-grouprow>th{text-align:left!important;padding:0!important;font-size:var(--text-xs)!important;text-transform:uppercase;letter-spacing:var(--tracking-wide);font-weight:var(--weight-semibold);color:var(--text-muted)}
}
@media print{
  gc-sidebar,gc-topbar,.ar-noprint,.gc-pagehead__actions{display:none!important}
  [data-screen="AccountReports"] .gc-shell__main{border:0!important}
  [data-screen="AccountReports"] .gc-shell__content{padding:0!important}
  .ar-tabbar .gc-tab:not(.gc-tab--active){display:none}
}
`;

export default function AccountReports() {
  const tick = useBooks();
  const [preset, setPreset] = useState(null);   // null = pick for me (see below)
  const [custom, setCustom] = useState(null);
  const [tab, setTab] = useState('pnl');
  const tabRefs = useRef([]);

  const now = useMemo(() => clockNow(), [tick]);
  const entries = useMemo(() => getEntries(), [tick]);
  // default: this month, or last month when this month has hardly started (fewer than 10 entries)
  const autoPreset = useMemo(() => (entries.filter((e) => e.at >= monthStart(now) && e.at <= now).length < 10 ? 'last' : 'month'), [entries, now]);
  const active = preset || autoPreset;
  const customRange = custom || { from: dayKey(monthStart(now, -1)), to: dayKey(now) };
  const per = useMemo(() => periodOf(active, now, customRange), [active, now, customRange.from, customRange.to]);   // eslint-disable-line react-hooks/exhaustive-deps

  const cur = useMemo(() => profitOf(entries, per.from, per.to), [entries, per]);
  const prev = useMemo(() => profitOf(entries, per.pFrom, per.pTo), [entries, per]);
  const rows = useMemo(() => statementRows(cur, prev), [cur, prev]);
  const flow = useMemo(() => cashFlowOf(entries, per.from, per.to), [entries, per]);
  const fees = useMemo(() => partnerFeesOf(per.from, per.to), [per, tick]);   // eslint-disable-line react-hooks/exhaustive-deps
  const vat = useMemo(() => vatOf(cur.salesIn), [cur.salesIn, tick]);   // eslint-disable-line react-hooks/exhaustive-deps
  const withPartners = useMemo(() => r2(ACCOUNTS.filter((a) => a.type === 'Holding').reduce((s, a) => s + balanceOf(a.id, entries), 0)), [entries]);

  const periodText = rangeText(per.from, per.to);
  const prevText = rangeText(per.pFrom, per.pTo);
  const profitDelta = deltaOf(cur.profit, prev.profit, 'up');

  const pickPreset = (id) => {
    setPreset(id);
    if (id === 'custom' && !custom) setCustom(customRange);
  };
  const setCustomDay = (field, value) => { if (value) setCustom({ ...customRange, [field]: value }); };
  const onTabKey = (e, i) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + TABS.length) % TABS.length;
    setTab(TABS[next][0]);
    tabRefs.current[next]?.focus();
  };

  const exportCsv = () => {
    const head = [['GridCommerce · ' + TABS.find((t) => t[0] === tab)[1]], ['Period', periodText]];
    let body;
    if (tab === 'pnl') {
      body = [['Compared with', prevText], [], ['Item', 'This period (BDT)', 'Previous period (BDT)', 'Change'],
        ...rows.map((r) => (r.type === 'head' ? [r.label] : [r.label, r2(r.cur), r2(r.prev), deltaOf(r.cur, r.prev, r.good).text])),
        [], ['Taken by the owner', r2(-cur.ownerOut), r2(-prev.ownerOut)], ['Put in by the owner', r2(cur.ownerIn), r2(prev.ownerIn)],
        ['Left in the business', r2(cur.profit - cur.ownerOut + cur.ownerIn), r2(prev.profit - prev.ownerOut + prev.ownerIn)],
        [], ['Cash basis: counted when money moved. Profit by channel, counted when owed, is on Sales & profit.']];
    } else if (tab === 'cash') {
      body = [[], ['Account', 'Type', 'Opening (BDT)', 'Money in (BDT)', 'Money out (BDT)', 'Closing (BDT)'],
        ...flow.accounts.map((a) => [accName(a.id), TYPES.find((t) => t[0] === a.type)[1], a.opening, a.inn, a.out, a.closing]),
        [], ['Day', 'Money in (BDT)', 'Money out (BDT)'], ...flow.bars.map((b) => [barLabel(b, flow.size), b.inn, -b.out])];
    } else if (tab === 'partners') {
      body = [[], ['Partner', 'Kind', 'Payments', 'Collected (BDT)', 'Fee (BDT)', 'Delivery charges (BDT)', 'Total kept (BDT)', '% of collected'],
        ...fees.rows.map((r) => [r.p.name, r.p.kind, r.count, r.collected, r.fee, r.charge, r.cost, r2(r.pct)]),
        ['Total', '', fees.total.count, fees.total.collected, fees.total.fee, fees.total.charge, fees.total.cost, r2(fees.total.pct)]];
    } else {
      body = [[], ['Category', 'VAT rate %'], ...vat.cats.map((c) => [c.label, c.rate]), [],
        ['Money in from sales (BDT)', cur.salesIn], ['Average rate %', r2(vat.avg)], ['VAT inside sales, estimate (BDT)', vat.inside]];
    }
    const name = `gridcommerce-${tab}-${dayKey(per.from)}-to-${dayKey(addDays(per.to, -1))}.csv`;
    try { downloadCsv(name, [...head, ...body]); toast(`${name} downloaded`); } catch { toast('Could not make the CSV file in this browser', { tone: 'error' }); }
  };

  const actions = (
    <>
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

  return (
    <AccPage screen="AccountReports" active="rep-finance" page="Reports" title="Reports" css={CSS}
      about="How the shop did over a period: profit, where the money went, what partners kept, and VAT."
      actions={actions}>

      <div className="ar-bar">
        <div className="ar-custom">
          <div className="ac-seg ar-noprint" role="group" aria-label="Period">
            {PRESETS.map(([id, label]) => <button key={id} type="button" aria-pressed={active === id} onClick={() => pickPreset(id)}>{label}</button>)}
          </div>
          {active === 'custom' ? (
            <>
              <div className="ar-noprint"><label className="gc-label" htmlFor="ar-from">From</label><input id="ar-from" type="date" className="gc-input" value={customRange.from} max={customRange.to} onChange={(e) => setCustomDay('from', e.target.value)} /></div>
              <div className="ar-noprint"><label className="gc-label" htmlFor="ar-to">To</label><input id="ar-to" type="date" className="gc-input" value={customRange.to} min={customRange.from} onChange={(e) => setCustomDay('to', e.target.value)} /></div>
            </>
          ) : null}
        </div>
        <p className="ar-range" aria-live="polite"><b>{periodText}</b> · {prev.count ? 'compared with ' + prevText : 'nothing recorded before it to compare'}</p>
      </div>

      <div className="gc-kpis gc-kpis--tight">
        {kpi('arrow-down-left', 'var(--fill-success-soft)', 'var(--text-success)', 'Money in from sales', money(cur.salesIn), cur.otherIn ? `+ ${money(cur.otherIn)} other income` : 'after refunds')}
        {kpi('arrow-up-right', 'var(--fill-error-soft)', 'var(--text-danger)', 'Costs', money(cur.costs), 'stock, expenses, staff, fees')}
        {kpi(cur.profit < 0 ? 'trending-down' : 'trending-up', cur.profit < 0 ? 'var(--fill-error-soft)' : 'var(--fill-primary-soft)', cur.profit < 0 ? 'var(--text-danger)' : 'var(--primary)', cur.profit < 0 ? 'Loss' : 'Profit', fig(cur.profit), profitDelta.tone === 'flat' ? 'no earlier figures' : profitDelta.text + ' vs before', cur.profit < 0 ? 'ar-neg' : '')}
        {kpi('hand-coins', 'var(--fill-warning-soft)', 'var(--text-warning)', 'With partners now', money(withPartners), 'to be paid out')}
      </div>

      <section className="gc-card ac-card">
        <div className="ar-tabbar">
          <div className="gc-tabs" role="tablist" aria-label="Reports">
            {TABS.map(([id, label], i) => (
              <button key={id} ref={(el) => { tabRefs.current[i] = el; }} type="button" role="tab" id={'ar-tab-' + id} aria-controls={tab === id ? 'ar-panel' : undefined}
                aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} className={'gc-tab' + (tab === id ? ' gc-tab--active' : '')}
                onClick={() => setTab(id)} onKeyDown={(e) => onTabKey(e, i)}>{label}</button>
            ))}
          </div>
        </div>

        <div role="tabpanel" id="ar-panel" aria-labelledby={'ar-tab-' + tab}>
          {tab === 'pnl' ? <ProfitPanel rows={rows} cur={cur} prev={prev} periodText={periodText} prevText={prevText} /> : null}
          {tab === 'cash' ? <CashPanel flow={flow} periodText={periodText} /> : null}
          {tab === 'partners' ? <PartnerPanel fees={fees} periodText={periodText} /> : null}
          {tab === 'vat' ? <VatPanel vat={vat} salesIn={cur.salesIn} periodText={periodText} /> : null}
        </div>
      </section>
    </AccPage>
  );
}

// ---- panels -------------------------------------------------------------------------------------
function Delta({ cur, prev, good }) {
  const d = deltaOf(cur, prev, good);
  return <span className={'ar-delta is-' + d.tone}>{d.text}</span>;
}

function ProfitPanel({ rows, cur, prev, periodText, prevText }) {
  const empty = !cur.count;
  const cmp = prev.count > 0;   // no money moved in the period before: leave the comparison out
  const kept = r2(cur.profit - cur.ownerOut + cur.ownerIn);
  return (
    <>
      <div className="ac-head">
        <div>
          <h2>Profit & loss</h2>
          <p>Cash basis: counted when money moved, {periodText}. Moves between your own accounts and partner payouts are left out.</p>
          <p className="ar-noprint">By channel and counted when owed: see <Link href="/sales-profit" className="ar-link">Sales & profit</Link></p>
        </div>
      </div>
      {empty ? <EmptyState icon="file-bar-chart" title="No money moved in this period" body="Pick another period above, or record sales and expenses first." /> : (
        <>
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact ar-stmt">
              <caption className="sr-only">Profit and loss for {periodText}, compared with {prevText}</caption>
              <thead><tr><th scope="col">Item</th><th scope="col" className="ac-num">This period</th>{cmp ? <><th scope="col" className="ac-num">Before <span className="ac-sub">{prevText}</span></th><th scope="col" className="ac-num">Change</th></> : null}</tr></thead>
              <tbody>
                {rows.map((r) => (r.type === 'head' ? (
                  <tr key={r.key} className="is-head"><th scope="colgroup" colSpan={cmp ? 4 : 2}>{r.label}</th></tr>
                ) : (
                  <tr key={r.key} className={'is-' + r.type}>
                    <th scope="row">{r.label}{r.help ? <span className="ac-sub">{r.help}</span> : null}</th>
                    <td className={'ac-num ac-fig' + (r.type === 'total' ? (r.cur < 0 ? ' ar-neg' : ' ar-pos') : '')}>{fig(r.cur)}</td>
                    {cmp ? <><td className={'ac-num ac-fig' + (r.prev ? '' : ' ar-noprev')} style={{ color: 'var(--text-muted)' }}>{fig(r.prev)}</td>
                    <td className={'ac-num' + (r.prev ? '' : ' ar-noprev')}><Delta cur={r.cur} prev={r.prev} good={r.good} /></td></> : null}
                  </tr>
                )))}
                <tr className="is-head"><th scope="colgroup" colSpan={cmp ? 4 : 2}>Not part of the profit</th></tr>
                <tr className="is-line is-below"><th scope="row">Taken by the owner</th><td className="ac-num ac-fig">{fig(-cur.ownerOut)}</td>{cmp ? <><td className={'ac-num ac-fig' + (prev.ownerOut ? '' : ' ar-noprev')}>{fig(-prev.ownerOut)}</td><td className={'ac-num' + (prev.ownerOut ? '' : ' ar-noprev')}><Delta cur={-cur.ownerOut} prev={-prev.ownerOut} good="flat" /></td></> : null}</tr>
                {cur.ownerIn || prev.ownerIn ? <tr className="is-line is-below"><th scope="row">Put in by the owner</th><td className="ac-num ac-fig">{fig(cur.ownerIn)}</td>{cmp ? <><td className={'ac-num ac-fig' + (prev.ownerIn ? '' : ' ar-noprev')}>{fig(prev.ownerIn)}</td><td className={'ac-num' + (prev.ownerIn ? '' : ' ar-noprev')}><Delta cur={cur.ownerIn} prev={prev.ownerIn} good="flat" /></td></> : null}</tr> : null}
                <tr className="is-sub"><th scope="row">Left in the business</th><td className={'ac-num ac-fig ' + (kept < 0 ? 'ar-neg' : '')}>{fig(kept)}</td>{cmp ? <><td className={'ac-num ac-fig' + (r2(prev.profit - prev.ownerOut + prev.ownerIn) ? '' : ' ar-noprev')} style={{ color: 'var(--text-muted)' }}>{fig(r2(prev.profit - prev.ownerOut + prev.ownerIn))}</td><td /></> : null}</tr>
              </tbody>
            </table>
          </div>
          <div className="ar-foot">
            <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Gateway and COD fees and delivery charges show here on the day the partner’s payout arrives. See <b>Partner fees</b> for what each partner kept on the payments taken in this period.</span></div>
          </div>
        </>
      )}
    </>
  );
}

function CashPanel({ flow, periodText }) {
  const max = Math.max(1, ...flow.bars.map((b) => Math.max(b.inn, b.out)));
  const every = flow.bars.length > 10 ? 5 : 1;
  const totIn = r2(flow.bars.reduce((a, b) => a + b.inn, 0)), totOut = r2(flow.bars.reduce((a, b) => a + b.out, 0));
  const all = flow.groups.reduce((a, g) => ({ opening: a.opening + g.opening, inn: a.inn + g.inn, out: a.out + g.out, closing: a.closing + g.closing }), { opening: 0, inn: 0, out: 0, closing: 0 });
  return (
    <>
      <div className="ac-head"><div><h2>Cash flow <InfoTip text={`Where the money sat at the start and end of ${periodText}, and what came in and went out.`} /></h2></div></div>
      <div className="ar-groups">
        {flow.groups.map((g) => (
          <div key={g.type} className="ar-group">
            <h3><Icon name={g.icon} width="14" height="14" aria-hidden="true" /> {g.label}</h3>
            <span className="ar-big ac-fig">{fig(g.closing)}</span>
            <dl>
              <dt>Opening</dt><dd className="ac-fig">{fig(g.opening)}</dd>
              <dt>In</dt><dd className="ac-fig ac-in">+{money(g.inn)}</dd>
              <dt>Out</dt><dd className="ac-fig ac-out">{g.out ? '−' + money(g.out) : money(0)}</dd>
            </dl>
          </div>
        ))}
      </div>

      <div className="ar-chartbox">
        <div className="ar-bar">
          <h3 className="ar-range" style={{ margin: 0 }}><b>Money in and out of your own accounts{flow.size > 1 ? `, ${flow.size} days per bar` : ', day by day'}</b></h3>
          <div className="ar-legend" aria-hidden="true"><span><i className="ar-in-bar" /> In {money(totIn)}</span><span><i className="ar-out-bar" /> Out {money(totOut)}</span></div>
        </div>
        <div className="ar-chart" aria-hidden="true">
          {flow.bars.map((b) => (
            <div key={b.start} className="ar-col" title={`${barLabel(b, flow.size)} · in ${money(b.inn)} · out ${money(b.out)}`}>
              <i className="ar-in-bar" style={{ height: (b.inn / max) * 100 + '%' }} />
              <i className="ar-out-bar" style={{ height: (b.out / max) * 100 + '%' }} />
            </div>
          ))}
        </div>
        <div className="ar-axis" aria-hidden="true">
          {flow.bars.map((b, i) => <span key={b.start}>{i % every === 0 ? new Date(b.start).getDate() : ''}</span>)}
        </div>
        <table className="sr-only">
          <caption>Money in and out of your own accounts, {periodText}. Moves between your own accounts are left out.</caption>
          <thead><tr><th scope="col">Day</th><th scope="col">In</th><th scope="col">Out</th></tr></thead>
          <tbody>{flow.bars.map((b) => <tr key={b.start}><th scope="row">{barLabel(b, flow.size)}</th><td>{money(b.inn)}</td><td>{money(b.out)}</td></tr>)}</tbody>
        </table>
        <p className="ar-range" style={{ marginTop: 'var(--space-2)' }}>Moving cash from the drawers to the safe or the bank is left out of the chart; partner payouts count as money in.</p>
      </div>

      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact gc-table--hoverable">
          <caption className="sr-only">Each account, {periodText}</caption>
          <thead><tr><th scope="col">Account</th><th scope="col" className="ac-num">Opening</th><th scope="col" className="ac-num">Money in</th><th scope="col" className="ac-num">Money out</th><th scope="col" className="ac-num">Closing</th></tr></thead>
          {flow.groups.map((g) => (
            <tbody key={g.type}>
              <tr className="ar-grouprow"><th scope="rowgroup" colSpan={5}>{g.label}</th></tr>
              {g.list.map((a) => (
                <tr key={a.id}>
                  <th scope="row" style={{ fontWeight: 'var(--weight-regular)', textAlign: 'left' }}><span className="ac-who"><BrandLogo brand={a.brand} size={28} decorative /><span><span className="ac-strong">{accName(a.id)}</span>{a.moves ? null : <span className="ac-sub">No money moved</span>}</span></span></th>
                  <td className="ac-num ac-fig">{fig(a.opening)}</td>
                  <td className="ac-num ac-fig ac-in">{a.inn ? '+' + money(a.inn) : '—'}</td>
                  <td className="ac-num ac-fig ac-out">{a.out ? '−' + money(a.out) : '—'}</td>
                  <td className="ac-num ac-fig ac-strong">{fig(a.closing)}</td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot><tr><th scope="row" style={{ textAlign: 'left' }}>All accounts</th><td className="ac-num ac-fig">{fig(all.opening)}</td><td className="ac-num ac-fig">+{money(all.inn)}</td><td className="ac-num ac-fig">{all.out ? '−' + money(all.out) : money(0)}</td><td className="ac-num ac-fig">{fig(all.closing)}</td></tr></tfoot>
        </table>
      </div>
      <div className="ar-foot"><p className="ar-range" style={{ margin: 0 }}>Account totals include moves between your own accounts (for example the safe to the bank), so the same money can show as out of one account and in to another.</p></div>
    </>
  );
}

function PartnerPanel({ fees, periodText }) {
  const { rows, total, courierCharges, priciest } = fees;
  const insight = [
    courierCharges ? `Couriers took ${money(courierCharges)} in delivery charges` : '',
    priciest ? `${priciest.p.short} is your most expensive gateway at ${pctText(priciest.feePct)}` : '',
  ].filter(Boolean).join('; ');
  return (
    <>
      <div className="ac-head"><div><h2>Partner fees <InfoTip text={`What each gateway and courier collected for you in ${periodText} and what it kept.`} /></h2></div></div>
      {!total.count ? <EmptyState icon="hand-coins" title="No partner payments in this period" body="Payments through gateways and COD parcels show here once they are collected." /> : (
        <>
          {insight ? <div className="ar-pad"><div className="ac-note ac-note--info" role="status"><Icon name="lightbulb" width="16" height="16" aria-hidden="true" /><span><b>{insight}.</b> Partners kept {money(total.cost)} of {money(total.collected)} ({pctText(total.pct)}).</span></div></div> : null}
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <caption className="sr-only">Partner fees, {periodText}</caption>
              <thead><tr><th scope="col">Partner</th><th scope="col" className="ac-num">Payments</th><th scope="col" className="ac-num">Collected</th><th scope="col" className="ac-num">Fee</th><th scope="col" className="ac-num">Delivery charges</th><th scope="col" className="ac-num">Kept in all</th><th scope="col" className="ac-num">% of collected</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.p.id}>
                    <th scope="row" style={{ fontWeight: 'var(--weight-regular)', textAlign: 'left' }}><span className="ac-who"><BrandLogo brand={r.p.brand} size={28} decorative /><span><span className="ac-strong">{r.p.short}</span><span className="ac-sub">{r.p.kind === 'Courier' ? 'Courier · COD' : 'Gateway'}</span></span></span></th>
                    <td className="ac-num ac-fig">{r.count || '—'}</td>
                    <td className="ac-num ac-fig">{r.collected ? money(r.collected) : '—'}</td>
                    <td className="ac-num ac-fig">{r.fee ? '−' + money(r.fee) : '—'}</td>
                    <td className="ac-num ac-fig">{r.charge ? '−' + money(r.charge) : '—'}</td>
                    <td className="ac-num ac-fig ac-strong">{r.cost ? '−' + money(r.cost) : '—'}</td>
                    <td className="ac-num ac-fig">{r.collected ? pctText(r.pct) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><th scope="row" style={{ textAlign: 'left' }}>All partners</th><td className="ac-num ac-fig">{total.count}</td><td className="ac-num ac-fig">{money(total.collected)}</td><td className="ac-num ac-fig">−{money(total.fee)}</td><td className="ac-num ac-fig">{total.charge ? '−' + money(total.charge) : '—'}</td><td className="ac-num ac-fig">−{money(total.cost)}</td><td className="ac-num ac-fig">{pctText(total.pct)}</td></tr></tfoot>
            </table>
          </div>
          <div className="ar-foot"><p className="ar-range" style={{ margin: 0 }}>Worked out on each payment from the rates in Setup. Profit & loss counts these costs when the payout arrives, so the two can differ at the edges of a period.</p></div>
        </>
      )}
    </>
  );
}

function VatPanel({ vat, salesIn, periodText }) {
  return (
    <>
      <div className="ac-head">
        <div><h2>VAT <InfoTip text={`A quick look at the VAT inside your sales for ${periodText}. Set the rates on the VAT page.`} /></h2></div>
        <Link href="/vat" className="gc-btn gc-btn--neutral ar-noprint"><Icon name="percent" width="18" height="18" aria-hidden="true" /> VAT rates by category</Link>
      </div>
      {vat.notReg ? (
        <div className="ar-pad"><div className="ac-note ac-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>The shop is set as <b>not VAT-registered</b>, so no VAT is worked out. Change this on the VAT page.</span></div></div>
      ) : (
        <>
          <dl className="ar-vat" style={{ margin: 0 }}>
            <div><dt>Money in from sales</dt><dd className="ac-fig">{money(salesIn)}</dd></div>
            <div><dt>Average VAT rate</dt><dd className="ac-fig">{pctText(vat.avg)}</dd></div>
            <div className="is-key"><dt>VAT inside sales (estimate)</dt><dd className="ac-fig">{money(vat.inside)}</dd></div>
          </dl>
          <div className="ar-pad"><div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>This is an <b>estimate</b>: sales × the average of your category rates, taken out of prices that already include VAT. Your VAT return should use the VAT on each sale.</span></div></div>
        </>
      )}
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact">
          <caption className="sr-only">VAT rate by category</caption>
          <thead><tr><th scope="col">Category</th><th scope="col" className="ac-num">VAT rate</th></tr></thead>
          <tbody>{vat.cats.map((c) => <tr key={c.key}><th scope="row" style={{ fontWeight: 'var(--weight-regular)', textAlign: 'left' }}>{c.label}</th><td className="ac-num ac-fig">{c.rate ? pctText(c.rate) : 'No VAT'}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
