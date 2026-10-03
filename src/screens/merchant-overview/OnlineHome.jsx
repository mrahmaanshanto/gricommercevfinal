'use client';
// OnlineHome — the Home page of the Online edition (GridCommerce Online), laid out like Home.jsx (Shopify's Home):
// today's key figures (sales, orders, visitors, conversion, money in hand), a greeting with "Ask GridAI" and the
// day's to-do as short pills (each opens the page where the work is done), then two cards: sales over the last
// 30 days by order source and the latest orders. Courier, stock, wallet, visitors by hour, top products and top
// customers each live on their own page (Orders, Stock, Money / Settlements, Analytics, Reports, Customers).
// Everything is read from the shared books: orders (with the live orders of liveOrders.js), the sales book, the
// ledger and payouts, stock and traffic. It refreshes each minute.
// Colours: the --viz-N series tokens, one colour per order source (Facebook is always slot 1, the website slot 2 …).
// HOME_CSS, Fig and Hero are shared with CommsHome (the Connect edition's Home).
// Brief #10, as on Home.jsx: the to-do pills are action items (lib/actionItems.js; snooze / dismiss, View all), "As of"
// with a refresh, Export (today's figures as CSV), the first-run checklist and an Insights card apart from the to-do.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Spark, Menu, figIcon } from '@/components/ui/IndexKit';
import { CHART_CSS, ColumnChart, Legend } from '@/components/charts/DashCharts';
import { StockSetupBanner } from '@/components/StockSetupBanner';
import { closeMonths } from '@/lib/platformUsage';
import { formatBDT, formatTime } from '@/lib/format';
import { addDays } from '@/lib/reports/period';
import { clockNow, startOfDay, getPayouts } from '@/lib/settlements';
import { getSales, getSaleLines } from '@/lib/salesBook';
import { getOrders, isCounterSale, orderHref, courierReturns, rtoState } from '@/lib/orders';
import { orderStatus } from '@/lib/orderStatus';
import { OWN_ACCOUNTS, balanceOf, getEntries } from '@/lib/ledger';
import { getBills, billLeft, billStatus } from '@/lib/supplierBills';
import { getLiabilities, leftOf, liabStatus } from '@/lib/liabilities';
import { getAdjustments } from '@/lib/stockAdjustments';
import { getPlaces } from '@/lib/locations';
import { placeStock } from '@/lib/stock';
import { visitsOn } from '@/lib/traffic';
import { currentUser } from '@/lib/team';
import { hasModule } from '@/lib/edition';
import { downloadCsv } from '@/lib/reports/period';
import { trackItems, ACTIONS_EVENT, SEVERITY, ageOf, ageText } from '@/lib/actionItems';
import { formatDate } from '@/lib/format';
import { PILLS_CSS } from './ActionPills';
import { AsOf, Readiness, InsightsCard, changeInsight, isNewShop, EXTRAS_CSS } from './HomeExtras';

const DAY = 24 * 60 * 60 * 1000;
// one colour per order source, the same on every chart
const ORDER_SOURCES = ['Facebook', 'Website', 'Phone', 'Order link'];
const SOURCE_COLOR = { Facebook: 'var(--viz-1)', Website: 'var(--viz-2)', Phone: 'var(--viz-3)', 'Order link': 'var(--viz-4)' };

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const short = (n) => {
  const v = Math.abs(Number(n) || 0);
  if (v >= 1e7) return '৳' + (v / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (v >= 1e5) return '৳' + (v / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return money(v);
};
const tick = (v) => (v >= 1e5 ? '৳' + (v / 1e5).toFixed(1).replace(/\.0$/, '') + 'L' : v >= 1e3 ? '৳' + (v / 1e3).toFixed(v % 1000 ? 1 : 0).replace(/\.0$/, '') + 'k' : '৳' + v);
const pct = (a, b) => (b ? Math.round(((a - b) / Math.abs(b)) * 100) : null);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (t) => { const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/** The Home layout shared by the edition Homes (the same as Home.jsx): top row, figures, greeting, pills, cards. */
export const HOME_CSS = `
.hk-fig{flex-direction:row!important;align-items:center;gap:8px}
.hk-fig__col{display:flex;flex-direction:column;gap:2px;min-width:0}
.hk{gap:var(--space-5)}
.hk-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3)}
.hk-pick{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hk-today{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.hk-today svg{color:var(--text-muted)}
.hk-figs{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-6)}
.hk-fig{display:flex;flex-direction:column;gap:2px;padding:0;border:0;background:none;font:inherit;text-align:left;color:inherit;text-decoration:none;cursor:pointer}
.hk-fig__label{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);white-space:nowrap;text-decoration:underline dotted var(--border-strong);text-underline-offset:3px}
.hk-fig__row{display:flex;align-items:center;gap:6px;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.hk-fig__row small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.hk-fig .ix-spark{width:44px;height:18px}
.hk-fig:hover .hk-fig__label{color:var(--primary)}
.hk-hero{display:flex;flex-direction:column;align-items:center;gap:var(--space-4);padding:var(--space-10) 0 var(--space-5);text-align:center}
.hk-hello{margin:0;font-size:var(--text-2xl);line-height:1.3;font-weight:var(--weight-semibold);color:var(--text-heading)}
.hk-hello span{display:block;color:var(--text-muted)}
.hk-ask{display:flex;align-items:center;gap:var(--space-2);width:min(560px,100%);height:44px;padding:0 6px 0 14px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-card)}
.hk-ask:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.hk-ask>svg{flex:none;color:var(--primary)}
.hk-ask input{flex:1;min-width:0;height:100%;border:0;outline:0;background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.hk-ask input::placeholder{color:var(--text-muted)}
.hk-ask button{display:grid;flex:none;place-items:center;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:var(--primary);color:#fff;cursor:pointer}
.hk-ask button:disabled{background:var(--surface-subtle);color:var(--text-muted);cursor:default}
.hk-cards{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.hk-cards--even{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.hk-side{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.hk-total{display:flex;align-items:baseline;gap:var(--space-2);margin:0 0 var(--space-3);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hk-total small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.hk-list{display:flex;flex-direction:column}
.hk-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:4px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:inherit;text-decoration:none}
.hk-row:first-child{border-top:0}
.hk-row>span:first-child{display:flex;flex-direction:column;min-width:0}
.hk-row b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.hk-row small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
a.hk-row:hover b{color:var(--primary)}
.hk-num{flex:none;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.hk-empty{margin:0;padding:var(--space-4) 0;font-size:var(--text-sm);color:var(--text-muted)}
.hk-skel{height:120px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-subtle),var(--surface-card),var(--surface-subtle));background-size:200% 100%;animation:hk-shine 1.4s linear infinite}
@keyframes hk-shine{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.hk-skel{animation:none}}
@media (max-width:1023px){.hk-cards,.hk-cards--even{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .hk-figs{flex-wrap:nowrap;width:calc(100% + 28px);margin:0 -14px;padding:0 14px;overflow-x:auto;gap:var(--space-5);scrollbar-width:none}
  .hk-figs::-webkit-scrollbar{display:none}
  .hk-hero{padding:var(--space-5) 0 var(--space-2)}
  .hk-hello{font-size:var(--text-xl)}
}
`;

/** A key figure in the top row: label, value and a small trend line; opens its page (or runs onClick). */
export function Fig({ label, value, sub, spark, href, onClick }) {
  const body = (<><span className="ix-metric__icon" aria-hidden="true"><Icon name={figIcon(label)} width="16" height="16" /></span><span className="hk-fig__col"><span className="hk-fig__label">{label}</span><span className="hk-fig__row">{value}{sub ? <small>{sub}</small> : null}{spark ? <Spark values={spark} /> : null}</span></span></>);
  return href ? <Link href={href} className="hk-fig">{body}</Link> : <button type="button" className="hk-fig" onClick={onClick}>{body}</button>;
}

/** The greeting (the page's h1) and "Ask GridAI". The day's to-do still syncs to the action items (`todo` sets the line
 *  under the greeting); the pills are not shown on Home.
 *  todo: trackItems() rows { key, label, n, href, severity, item } (null while loading); source: the action-item source. */
export function Hero({ greeting, todo, source, placeholder = 'Ask GridAI about sales, orders or stock…' }) {
  const [ask, setAsk] = useState('');
  const submit = (e) => { e.preventDefault(); if (!ask.trim()) return; window.dispatchEvent(new CustomEvent('gc:gridai', { detail: { q: ask.trim() } })); setAsk(''); };
  return (
    <section className="hk-hero" aria-label="Today">
      <h1 className="hk-hello">
        <span>{greeting}!</span>
        {"Here's your shop today."}
      </h1>
      <form className="hk-ask" onSubmit={submit} role="search">
        <Icon name="sparkles" width="18" height="18" aria-hidden="true" />
        <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder={placeholder} aria-label="Ask GridAI" />
        <button type="submit" disabled={!ask.trim()} aria-label="Ask"><Icon name="arrow-up" width="16" height="16" aria-hidden="true" /></button>
      </form>
    </section>
  );
}

export function greeting(hour) { return hour < 12 ? ['Good morning', 'শুভ সকাল'] : hour < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা']; }

// ---- the figures -------------------------------------------------------------------------------------------
function build() {
  const now = clockNow();
  const today = startOfDay(now);
  const yest = addDays(today, -1);
  const yestNow = now - DAY;

  // online sale lines (cancelled orders are not sales) and online orders
  const sales = safe(() => getSales(), []).filter((s) => s.channel === 'Online');
  const lines = safe(() => getSaleLines(sales), []).filter((l) => l.at <= now);
  const orders = safe(() => getOrders(), []).filter((o) => !isCounterSale(o) && !o.isInvoice && o.at <= now);
  const sourceOf = (s) => (ORDER_SOURCES.includes(s) ? s : s === 'Chat' ? 'Phone' : 'Website');

  // per day: revenue, orders and revenue by source, for the last 36 days (30 shown + 6 for the average)
  const days = [];
  for (let i = 35; i >= 0; i--) days.push({ from: addDays(today, -i), revenue: 0, ids: new Set(), src: Object.fromEntries(ORDER_SOURCES.map((s) => [s, 0])) });
  const byStart = new Map(days.map((d) => [d.from, d]));
  lines.forEach((l) => {
    if (l.at < days[0].from) return;
    const d = byStart.get(startOfDay(l.at));
    if (!d) return;
    d.revenue += l.revenue; d.ids.add(l.saleId); d.src[sourceOf(l.source)] += l.revenue;
  });
  days.forEach((d) => { d.orders = d.ids.size; d.visitors = visitsOn(d.from, now).total; });

  // today so far against yesterday by this time; the trend lines are the 14 whole days before today
  const span = (from, to) => {
    const ls = lines.filter((l) => l.at >= from && l.at <= to);
    return { revenue: r2(ls.reduce((a, l) => a + l.revenue, 0)), orders: new Set(ls.map((l) => l.saleId)).size };
  };
  const tNow = span(today, now), tYest = span(yest, yestNow);
  const vNow = visitsOn(today, now);
  const conv = (o, v) => (v ? (o / v) * 100 : 0);
  const last14 = days.slice(-15, -1);
  const figs = {
    revenue: tNow.revenue, change: tNow.orders ? pct(tNow.revenue, tYest.revenue) : null, revenueSpark: last14.map((d) => r2(d.revenue)),
    orders: tNow.orders, ordersSpark: last14.map((d) => d.orders),
    visitors: vNow.total, visitorsSpark: last14.map((d) => d.visitors),
    conv: conv(tNow.orders, vNow.total),
  };

  // sales over the last 30 days by source, with the 7-day average
  const shown = days.slice(-30);
  const avg7 = (k) => { const w = days.slice(Math.max(0, k - 6), k + 1); return w.reduce((a, d) => a + d.revenue, 0) / w.length; };
  const revenue = {
    points: shown.map((d, i) => ({ label: i === shown.length - 1 ? 'Today' : dayLabel(d.from), title: (i === shown.length - 1 ? 'Today so far · ' : '') + dayLabel(d.from) + ` · ${plural(d.orders, 'order')}`, values: ORDER_SOURCES.map((s) => r2(d.src[s])), line: Math.round(avg7(days.length - 30 + i)) })),
    total: r2(shown.reduce((a, d) => a + d.revenue, 0)),
    bySource: ORDER_SOURCES.map((s) => ({ name: s, color: SOURCE_COLOR[s], value: r2(shown.reduce((a, d) => a + d.src[s], 0)) })),
  };

  // latest orders today (yesterday's when none yet)
  const todayOrders = orders.filter((o) => o.at >= today).sort((a, b) => b.at - a.at);
  const latest = (todayOrders.length ? todayOrders : orders.filter((o) => o.at >= yest && o.at < today).sort((a, b) => b.at - a.at)).slice(0, 5);

  // money in hand: the shop's own accounts (not what payment partners still hold)
  const entries = safe(() => getEntries(), []);
  const cash = r2(safe(() => OWN_ACCOUNTS(), []).filter((a) => !a.credits).reduce((t, a) => t + safe(() => balanceOf(a.id, entries), 0), 0));
  const late = safe(() => getPayouts(now), []).filter((p) => p.late);

  // low stock (as of now)
  let low = 0;
  safe(() => getPlaces({ active: true }), []).filter((p) => !p.noSale && !p.opening).forEach((pl) => { low += safe(() => placeStock(pl.name).rows, []).filter((r) => r.low).length; });

  // as action items (lib/actionItems.js), with the same keys as the full Home so one issue is one item
  const oldest = (list, f = (x) => x.at) => { const ts = list.map(f).filter((t) => Number(t) > 0); return ts.length ? Math.min(...ts) : undefined; };
  const pendingList = orders.filter((o) => ['onhold', 'processing', 'pending'].includes(o.statusKey));
  const readyList = orders.filter((o) => o.statusKey === 'ready');
  const billList = safe(() => getBills(), []).filter((b) => billLeft(b) > 0 && billStatus(b) === 'Overdue');
  const liabList = safe(() => getLiabilities(), []).filter((l) => leftOf(l) > 0 && liabStatus(l, now) === 'Overdue');
  const adjList = safe(() => getAdjustments(), []).filter((a) => a.status === 'waiting');
  const recList = safe(() => courierReturns(orders).filter((o) => rtoState(o).left > 0), []);
  const todo = [
    pendingList.length > 0 && { key: 'orders:verify', label: 'Verify orders', n: pendingList.length, href: '/merchant-orders?status=onhold', severity: 'high', area: 'area-orders', owner: ['orders', 'comms', 'online-sales'], since: oldest(pendingList) },
    readyList.length > 0 && { key: 'orders:to-courier', label: 'Send to courier', n: readyList.length, href: '/merchant-orders?status=ready', severity: 'high', area: 'area-orders', owner: ['orders', 'wh-manager', 'wh-supervisor'], since: oldest(readyList) },
    late.length > 0 && { key: 'finance:late-payouts', label: 'Check payouts', n: late.length, href: '/settlements', severity: 'critical', area: 'area-payments', owner: ['ceo'], since: oldest(late, (p) => p.due) },
    recList.length > 0 && { key: 'orders:returns', label: 'Receive returns', n: recList.length, href: '/courier-returns', severity: 'normal', area: 'area-orders', owner: ['orders', 'wh-manager', 'wh-supervisor'], since: oldest(recList) },
    billList.length > 0 && { key: 'finance:supplier-bills', label: 'Pay suppliers', n: billList.length, href: '/dues?tab=owe', severity: 'high', area: 'area-finances', owner: ['ceo', 'wh-manager'], since: oldest(billList, (b) => b.due) },
    liabList.length > 0 && { key: 'finance:bills', label: 'Pay bills', n: liabList.length, href: '/liabilities', severity: 'high', area: 'area-finances', owner: ['ceo', 'hr'], since: oldest(liabList, (l) => l.due) },
    low > 0 && { key: 'stock:restock', label: 'Restock', n: low, href: '/stock', severity: 'low', area: 'area-inventory', owner: ['wh-manager', 'shop-manager'] },
    adjList.length > 0 && { key: 'stock:adjustments', label: 'Approve stock adjustments', n: adjList.length, href: '/stock-adjustments', severity: 'normal', area: 'area-inventory', owner: ['wh-manager'], since: oldest(adjList) },
  ].filter(Boolean);

  // insights: today so far against the same weekday last week by this time, and the last 7 days against the 7 before
  const weekAgo = addDays(today, -7);
  const wNow = span(weekAgo, now - 7 * DAY);
  const vWeek = visitsOn(weekAgo, now - 7 * DAY);
  const lastWeekday = new Date(weekAgo).toLocaleDateString('en-GB', { weekday: 'long' });
  const sum7 = (list) => list.reduce((a, d) => ({ revenue: a.revenue + d.revenue, orders: a.orders + d.orders }), { revenue: 0, orders: 0 });
  const w1 = sum7(days.slice(-8, -1)), w0 = sum7(days.slice(-15, -8));
  const aov = (x) => (x.orders ? x.revenue / x.orders : 0);
  const insights = [
    changeInsight({ key: 'online-sales-sameday', what: 'Sales', now: tNow.revenue, before: wNow.revenue, vs: 'last ' + lastWeekday, evidence: `${money(tNow.revenue)} vs ${money(wNow.revenue)} by this time`, href: '/daily-summary' }),
    changeInsight({ key: 'online-conversion', what: 'Conversion', now: conv(tNow.orders, vNow.total), before: conv(wNow.orders, vWeek.total), vs: 'last ' + lastWeekday, evidence: `${conv(tNow.orders, vNow.total).toFixed(1)}% vs ${conv(wNow.orders, vWeek.total).toFixed(1)}% by this time`, href: '/analytics-hub' }),
    changeInsight({ key: 'online-aov', what: 'Average order', now: aov(w1), before: aov(w0), vs: 'the week before', evidence: `${money(aov(w1))} vs ${money(aov(w0))} · last 7 days`, href: '/reports-centre' }),
  ].filter(Boolean);

  return { now, figs, cash, revenue, latest, latestToday: todayOrders.length > 0, todo, insights };
}

export default function OnlineHome() {
  const [data, setData] = useState(null);
  const [tickN, setTick] = useState(0);
  const [locale, setLoc] = useState('en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoc(getLocale()); setUser(safe(() => currentUser(), null));
    const again = () => setTick((n) => n + 1);
    const loc = () => setLoc(getLocale());
    ['gc:ledger', 'gc:orders', 'storage', 'focus', ACTIONS_EVENT].forEach((e) => window.addEventListener(e, again));
    window.addEventListener('gc:locale', loc);
    const timer = window.setInterval(again, 60 * 1000);   // orders move on with the clock
    return () => { ['gc:ledger', 'gc:orders', 'storage', 'focus', ACTIONS_EVENT].forEach((e) => window.removeEventListener(e, again)); window.removeEventListener('gc:locale', loc); window.clearInterval(timer); };
  }, []);
  // worked out after the first paint, so the page shows its outline at once
  useEffect(() => {
    const id = window.setTimeout(() => {
      closeMonths();
      const next = build();
      next.todo = trackItems('home-online', next.todo, { user: safe(() => currentUser(), null) });
      next.fresh = isNewShop();
      setData(next);
    }, 0);
    return () => window.clearTimeout(id);
  }, [tickN]);

  const d = data;
  const [hello, helloBn] = d ? greeting(new Date(d.now).getHours()) : ['Hello', 'হ্যালো'];
  const first = user && user.name ? user.name.split(' ')[0] : '';
  // what can be made from here (read after mount, with the edition)
  const create = d ? [
    hasModule('online') && { label: 'New order', icon: 'file-plus', href: '/new-order' },
    hasModule('catalog') && { label: 'Add product', icon: 'package-plus', href: '/add-product' },
    hasModule('money') && { label: 'Add expense', icon: 'wallet', href: '/expenses-bills' },
  ].filter(Boolean) : [];
  // today's figures as CSV: the key figures, the 30 days by source, the latest orders and the to-do
  const exportCsv = () => {
    if (!d) return;
    const rows = [
      ['GridCommerce Online · Home', formatDate(d.now), 'Online store', 'As of ' + formatDate(d.now) + ' ' + new Date(d.now).toLocaleTimeString('en-GB')],
      [],
      ['Figure', 'Value', 'Change % vs yesterday by this time'],
      ['Sales', Math.round(d.figs.revenue), d.figs.change == null ? '' : d.figs.change],
      ['Orders', d.figs.orders, ''],
      ['Visitors', d.figs.visitors, ''],
      ['Conversion %', Math.round(d.figs.conv * 10) / 10, ''],
      ['Money in hand', Math.round(d.cash), ''],
      [],
      ['Day', ...ORDER_SOURCES, '7-day average'],
      ...d.revenue.points.map((x) => [x.label, ...x.values.map((v) => Math.round(v)), x.line]),
      [],
      ['Order', 'Customer', 'Time', 'Amount'],
      ...d.latest.map((o) => [o.id, o.customer, formatTime(o.at), Math.round(o.amount)]),
      [],
      ['To do', 'Count', 'Priority', 'Waiting'],
      ...d.todo.map((t) => [t.label, t.n, (SEVERITY[t.severity] || SEVERITY.normal).label, t.item ? ageText(ageOf(t.item)) : '']),
    ];
    downloadCsv(`home-${new Date(d.now).toISOString().slice(0, 10)}-online.csv`, rows);
    toast('Home exported');
  };

  return (
    <div className="dc-screen ds" data-screen="Home">
      <style dangerouslySetInnerHTML={{ __html: CHART_CSS + HOME_CSS + PILLS_CSS + EXTRAS_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main">
          <Topbar crumb="General" page="Dashboard" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow hk">
              <span className="gc-pagehead__about" hidden>The online shop's day at a glance: today's figures, what needs you today, sales over the last 30 days and the latest orders. Tap a figure or a task to open its page.</span>
              <StockSetupBanner />
              <div className="hk-top">
                <div className="hk-pick">
                  <span className="hk-today"><Icon name="calendar" width="16" height="16" aria-hidden="true" />Today</span>
                  {create.length ? <Menu label="Create" icon="plus" cls="ix-btn" align="start" items={create} /> : null}
                  <button type="button" className="ix-btn" onClick={exportCsv} disabled={!d}><Icon name="download" width="16" height="16" aria-hidden="true" />Export</button>
                  {d ? <AsOf at={d.now} onRefresh={() => setTick((n) => n + 1)} /> : null}
                </div>
                {d ? (
                  <div className="hk-figs" aria-label="Key figures, today">
                    <Fig label="Sales" value={money(d.figs.revenue)} sub={d.figs.change == null ? null : (d.figs.change >= 0 ? '▲' : '▼') + Math.abs(d.figs.change) + '%'} spark={d.figs.revenueSpark} href="/daily-summary" />
                    <Fig label="Orders" value={String(d.figs.orders)} spark={d.figs.ordersSpark} href="/merchant-orders" />
                    <Fig label="Visitors" value={d.figs.visitors.toLocaleString('en-IN')} spark={d.figs.visitorsSpark} href="/analytics-hub" />
                    <Fig label="Conversion" value={d.figs.conv.toFixed(1) + '%'} href="/analytics-hub" />
                    <Fig label="Money in hand" value={short(d.cash)} href="/money" />
                  </div>
                ) : null}
              </div>

              <Hero greeting={(locale === 'bn' ? helloBn : hello) + (first ? ', ' + first : '')} todo={d ? d.todo : null} source="home-online" />

              <Readiness ed="online" />

              {!d ? (
                <div className="hk-cards" aria-busy="true"><div className="hk-skel" /><div className="hk-skel" /></div>
              ) : d.fresh ? null : (
                <div className="hk-cards">
                  <section className="ix-card" aria-label="Sales, last 30 days">
                    <header className="ix-card__head"><h2>Sales · last 30 days</h2><Link href="/reports-centre">Reports</Link></header>
                    <div className="ix-card__body">
                      <p className="hk-total">{short(d.revenue.total)}<small>Online</small></p>
                      <ColumnChart data={d.revenue.points} series={ORDER_SOURCES.map((s) => ({ name: s, color: SOURCE_COLOR[s] }))} line={{ name: '7-day average', color: 'var(--text-heading)' }}
                        height={200} fmt={money} tickFmt={tick} label="Online sales per day for the last 30 days, by order source, with the 7-day average" now={d.revenue.points.length - 1} delay={200} />
                      <Legend items={[...d.revenue.bySource.map((s) => ({ name: s.name, color: s.color, value: short(s.value) })), { name: '7-day average', color: 'var(--text-heading)', kind: 'line' }]} />
                    </div>
                  </section>
                  <div className="hk-side">
                  <section className="ix-card" aria-label="Latest orders">
                    <header className="ix-card__head"><h2>{d.latestToday ? 'Latest orders' : "Yesterday's orders"}</h2><Link href="/merchant-orders">View all</Link></header>
                    <div className="ix-card__body">
                      {d.latest.length ? (
                        <div className="hk-list">
                          {d.latest.map((o) => {
                            const st = orderStatus(o.statusKey) || { label: o.status };
                            return <Link key={o.id} href={orderHref(o.id, 'home')} className="hk-row"><span><b>{o.customer}</b><small>{o.id} · {formatTime(o.at)} · {st.label}</small></span><span className="hk-num">{money(o.amount)}</span></Link>;
                          })}
                        </div>
                      ) : <p className="hk-empty">No orders yet today.</p>}
                    </div>
                  </section>
                  <InsightsCard items={d.insights} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
