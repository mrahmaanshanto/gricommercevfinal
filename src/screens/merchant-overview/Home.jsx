'use client';
// Home (/merchant-overview) — laid out like Shopify's Home: the day's key figures at the top, a greeting with "Ask GridAI"
// and the day's to-do as small pills (each opens the page where the work is done), then two cards: sales over the
// last 7 days and the best sellers. Nothing else: orders, stock and money each live on their own page.
// The day's figures come from reports/dailySummary (the same pack as the 8 PM summary), so they always agree.
// The monthly target is kept in gc.home.layout (tap "This month" to change it).
// Brief #10: the to-do pills are action items (lib/actionItems.js: owner, severity, age, one key per issue; snooze or
// dismiss from a pill's ⋯, View all lists them); "As of" says when the figures were worked out (with a refresh);
// Export saves the chosen day and place's figures as CSV; a new shop sees a setup checklist (HomeExtras › Readiness)
// instead of empty charts; Insights (observations with their numbers) sit apart from the to-do.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Sheet } from '@/components/ui';
import { HomeWidgets, WIDGETS_CSS } from '@/components/dashboard/HomeWidgets';
import { Spark, Menu, figIcon } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { trackItems, ACTIONS_EVENT, SEVERITY, ageOf, ageText } from '@/lib/actionItems';
import { PILLS_CSS } from './ActionPills';
import { AsOf, Readiness, InsightsCard, changeInsight, isNewShop, EXTRAS_CSS } from './HomeExtras';
import { formatBDT, formatDate } from '@/lib/format';
import { dailySummary } from '@/lib/reports/dailySummary';
import { addDays, monthStart } from '@/lib/reports/period';
import { clockNow, startOfDay, getPayouts } from '@/lib/settlements';
import { getSales, salesByChannel } from '@/lib/salesBook';
import { getOrders, isCounterSale, courierReturns, rtoState } from '@/lib/orders';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getInvoices } from '@/lib/invoices';
import { getAdjustments } from '@/lib/stockAdjustments';
import { DEMO_POS, DEMO_STATUS, getPOs } from '@/lib/purchaseOrders';
import { getTransfers } from '@/lib/transfers';
import { getBills, billLeft, billStatus } from '@/lib/supplierBills';
import { getLiabilities, leftOf, liabStatus } from '@/lib/liabilities';
import { getPlaces } from '@/lib/locations';
import { currentUser } from '@/lib/team';
import { hasModule, editionChannels, currentEditionId, LOCKED, EDITION_EVENT } from '@/lib/edition';
import CommsHome from './CommsHome';
import { StockSetupBanner } from '@/components/StockSetupBanner';
import OnlineHome from './OnlineHome';

const LAYOUT_KEY = 'gc.home.layout';
const CHANNELS = [['Retail', 'var(--chart-1)'], ['Online', 'var(--chart-2)'], ['Wholesale', 'var(--chart-3)']];
const DEFAULT_TARGET = 2500000;

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const short = (n) => {
  const v = Math.abs(Number(n) || 0);
  if (v >= 1e7) return '৳' + r2(v / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (v >= 1e5) return '৳' + r2(v / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return money(v);
};
const pct = (a, b) => (b ? Math.round(((a - b) / Math.abs(b)) * 100) : null);

function readLayout() {
  try { const v = JSON.parse(window.localStorage.getItem(LAYOUT_KEY)); return v && typeof v === 'object' ? v : {}; } catch { return {}; }
}
function writeLayout(v) { try { window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

const CSS = `
.hm-fig{flex-direction:row!important;align-items:center;gap:8px}
.hm-fig__col{display:flex;flex-direction:column;gap:2px;min-width:0}
.hm{gap:var(--space-5)}
.hm-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3)}
.hm-pick{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hm-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));align-items:center;gap:var(--space-3);flex:1 1 100%;width:100%;padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.hm-fig{display:flex;flex-direction:column;gap:2px;padding:0;border:0;background:none;font:inherit;text-align:left;color:inherit;text-decoration:none;cursor:pointer}
.hm-fig__label{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);white-space:nowrap;text-decoration:underline dotted var(--border-strong);text-underline-offset:3px}
.hm-fig__row{display:flex;align-items:center;gap:6px;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.hm-fig__row small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.hm-fig .ix-spark{width:44px;height:18px}
.hm-fig:hover .hm-fig__label{color:var(--primary)}
.hm-hero{display:flex;flex-direction:column;align-items:center;gap:var(--space-4);padding:var(--space-10) 0 var(--space-5);text-align:center}
.hm-hello{margin:0;font-size:var(--text-2xl);line-height:1.3;font-weight:var(--weight-semibold);color:var(--text-heading)}
.hm-hello span{display:block;color:var(--text-muted)}
.hm-ask{display:flex;align-items:center;gap:var(--space-2);width:min(560px,100%);height:44px;padding:0 6px 0 14px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-card)}
.hm-ask:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.hm-ask>svg{flex:none;color:var(--primary)}
.hm-ask input{flex:1;min-width:0;height:100%;border:0;outline:0;background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.hm-ask input::placeholder{color:var(--text-muted)}
.hm-ask button{display:grid;flex:none;place-items:center;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:var(--primary);color:#fff;cursor:pointer}
.hm-ask button:disabled{background:var(--surface-subtle);color:var(--text-muted);cursor:default}
.hm-cards{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.hm-side{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.hm-total{display:flex;align-items:baseline;gap:var(--space-2);margin:0;font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hm-total small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.hm-bars{display:flex;align-items:flex-end;gap:var(--space-3);height:132px;margin-top:var(--space-4)}
.hm-bar{display:flex;flex:1;flex-direction:column;align-items:center;gap:6px;height:100%;min-width:0}
.hm-bar__stack{display:flex;flex-direction:column-reverse;width:100%;max-width:32px;min-height:2px;margin-top:auto;border-radius:var(--radius-md) var(--radius-md) var(--radius-sm) var(--radius-sm);overflow:hidden;background:var(--surface-subtle)}
.hm-bar__day{font-size:var(--text-xs);color:var(--text-muted)}
.hm-bar.is-today .hm-bar__day{font-weight:var(--weight-medium);color:var(--text-heading)}
.hm-legend{display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-3);font-size:var(--text-xs);color:var(--text-body)}
.hm-dot{display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:var(--radius-full)}
.hm-list{display:flex;flex-direction:column}
.hm-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.hm-row:first-child{border-top:0}
.hm-row>span{display:flex;flex-direction:column;min-width:0}
.hm-row b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.hm-row small{font-size:var(--text-xs);color:var(--text-muted)}
.hm-num{flex:none;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.hm-empty{margin:0;padding:var(--space-4) 0;font-size:var(--text-sm);color:var(--text-muted)}
.hm-skel{height:120px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-subtle),var(--surface-card),var(--surface-subtle));background-size:200% 100%;animation:hm-shine 1.4s linear infinite}
@keyframes hm-shine{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.hm-skel{animation:none}}
@media (max-width:1023px){.hm-cards{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .hm-figs{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:var(--space-5);scrollbar-width:none}
  .hm-figs>*{flex:none}
  .hm-figs::-webkit-scrollbar{display:none}
  .hm-hero{padding:var(--space-5) 0 var(--space-2)}
  .hm-hello{font-size:var(--text-xl)}
  .hm-bars{gap:6px;height:112px}
}
`;

/** Everything the page shows, worked out once from the books. */
function build({ dayOffset, place, ed = 'full' }) {
  const has = (m) => hasModule(m, ed);
  const CH = CHANNELS.filter(([c]) => editionChannels(ed).includes(c));
  const now = clockNow();
  const day = addDays(startOfDay(now), -dayOffset);
  const d = dailySummary(day, now);
  const prev = dailySummary(addDays(day, -1), now);

  // sales (all places or one branch)
  const salesOf = (x) => (place ? ((x.sales.byPlace.find((p) => p.place === place) || {}).revenue || 0) : x.sales.total);
  const billsOf = (x) => (place ? ((x.sales.byPlace.find((p) => p.place === place) || {}).bills || 0) : x.sales.orders);
  const sales = { today: salesOf(d), prev: salesOf(prev), bills: billsOf(d) };

  // orders
  const orders = safe(() => getOrders(), []).filter((o) => !isCounterSale(o));
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, 0]));
  orders.forEach((o) => { if (byStatus[o.statusKey] != null) byStatus[o.statusKey] += 1; });
  const returnsToReceive = safe(() => courierReturns(orders).filter((o) => rtoState(o).left > 0), []);

  // money
  const payouts = safe(() => getPayouts(now), []);
  const open = payouts.filter((p) => p.status === 'expected' || p.status === 'delayed');
  const sumNet = (list) => r2(list.reduce((a, p) => a + (Number(p.net) || 0), 0));
  const cod = open.filter((p) => p.p && p.p.kind === 'Courier');
  const gate = open.filter((p) => !(p.p && p.p.kind === 'Courier'));
  const week = addDays(startOfDay(now), 7);
  const invoices = safe(() => getInvoices(), []).filter((i) => (Number(i.due) || 0) > 0);
  const bills = safe(() => getBills(), []).filter((b) => billLeft(b) > 0);
  const liabs = safe(() => getLiabilities(), []).filter((l) => leftOf(l) > 0);
  const m = {
    cod: sumNet(cod), codCount: cod.length,
    gateways: sumNet(gate), gateCount: gate.length,
    thisWeek: sumNet(open.filter((p) => p.due < week)),
    late: d.payouts.late, lateTotal: d.payouts.lateTotal,
    invoices: r2(invoices.reduce((a, i) => a + Number(i.due), 0)), invoiceCount: invoices.length,
    supplier: r2(bills.reduce((a, b) => a + billLeft(b), 0)), supplierOverdue: bills.filter((b) => billStatus(b) === 'Overdue'),
    toPay: r2(liabs.reduce((a, l) => a + leftOf(l), 0)), toPayOverdue: liabs.filter((l) => liabStatus(l, now) === 'Overdue'),
    cash: d.cash, cashTotal: d.cashTotal,
  };

  // stock
  const low = place ? d.low.items.filter((x) => x.place === place) : d.low.items;
  const pos = [...safe(() => getPOs(), []), ...DEMO_POS.filter((x) => !safe(() => getPOs(), []).some((p) => p.no === x.no))];
  const poStatus = (p) => p.status || DEMO_STATUS[p.s] || '';
  const incoming = pos.filter((p) => ['Sent', 'Partly received'].includes(poStatus(p)));
  const poApproval = pos.filter((p) => poStatus(p) === 'Waiting approval');
  const transfers = safe(() => getTransfers(), []).filter((t) => t.status === 'way' && (!place || t.to === place));
  const adjustments = safe(() => getAdjustments(), []).filter((a) => a.status === 'waiting' && (!place || a.place === place));
  const stock = {
    lowCount: place ? low.length : d.low.count, low: low.slice(0, 5),
    incoming, incomingPcs: incoming.reduce((a, p) => a + (p.lines || []).reduce((b, l) => b + Math.max(0, (l.qty || 0) - (l.received || 0)), 0), 0),
    transfers, transferPcs: transfers.reduce((a, t) => a + t.lines.reduce((b, l) => b + (l.qty || 0), 0), 0),
  };

  // last 7 days by channel
  const all = safe(() => getSales(), []);
  const trend = [];
  for (let i = 6; i >= 0; i -= 1) {
    const from = addDays(day, -i), to = addDays(from, 1);
    const ch = safe(() => salesByChannel(from, to, all), null);
    trend.push({ from, today: i === 0, total: ch ? ch.all.revenue : 0, parts: CH.map(([c]) => (ch ? ch[c].revenue : 0)) });
  }
  const month = safe(() => salesByChannel(monthStart(day), addDays(day, 1), all).all.revenue, 0);

  // the day's to-do as action items ("Verify orders 4"; lib/actionItems.js): one key per issue, who owns it, how
  // urgent it is and since when; each opens the page where it is done
  const toVerify = byStatus.onhold + byStatus.processing + byStatus.pending;
  const oldest = (list, f = (x) => x.at) => { const ts = list.map(f).filter((t) => Number(t) > 0); return ts.length ? Math.min(...ts) : undefined; };
  const verifyList = orders.filter((o) => ['onhold', 'processing', 'pending'].includes(o.statusKey));
  const todo = [
    has('online') && toVerify > 0 && { key: 'orders:verify', label: 'Verify orders', n: toVerify, href: '/merchant-orders?status=onhold', severity: 'high', area: 'area-orders', owner: ['orders', 'comms', 'online-sales'], since: oldest(verifyList) },
    has('online') && byStatus.ready > 0 && { key: 'orders:to-courier', label: 'Send to courier', n: byStatus.ready, href: '/merchant-orders?status=ready', severity: 'high', area: 'area-orders', owner: ['orders', 'wh-manager', 'wh-supervisor'], since: oldest(orders.filter((o) => o.statusKey === 'ready')) },
    has('money') && m.late.length > 0 && { key: 'finance:late-payouts', label: 'Check payouts', n: m.late.length, value: m.lateTotal, href: '/settlements', severity: 'critical', area: 'area-payments', owner: ['ceo'], since: oldest(m.late, (p) => p.due) },
    has('money') && m.supplierOverdue.length > 0 && { key: 'finance:supplier-bills', label: 'Pay suppliers', n: m.supplierOverdue.length, href: '/dues?tab=owe', severity: 'high', area: 'area-finances', owner: ['ceo', 'wh-manager'], since: oldest(m.supplierOverdue, (b) => b.due) },
    has('money') && m.toPayOverdue.length > 0 && { key: 'finance:bills', label: 'Pay bills', n: m.toPayOverdue.length, href: '/liabilities', severity: 'high', area: 'area-finances', owner: ['ceo', 'hr'], since: oldest(m.toPayOverdue, (l) => l.due) },
    has('catalog') && adjustments.length > 0 && { key: 'stock:adjustments', label: 'Approve stock adjustments', n: adjustments.length, href: '/stock-adjustments', severity: 'normal', area: 'area-inventory', owner: ['wh-manager'], since: oldest(adjustments) },
    has('catalog') && poApproval.length > 0 && { key: 'purchasing:po-approval', label: 'Approve purchase orders', n: poApproval.length, href: '/purchase-orders', severity: 'normal', area: 'area-inventory', owner: ['ceo', 'wh-manager'], since: oldest(poApproval) },
    has('online') && returnsToReceive.length > 0 && { key: 'orders:returns', label: 'Receive returns', n: returnsToReceive.length, href: '/courier-returns', severity: 'normal', area: 'area-orders', owner: ['orders', 'wh-manager', 'wh-supervisor'], since: oldest(returnsToReceive) },
    has('catalog') && stock.lowCount > 0 && { key: 'stock:restock', label: 'Restock', n: stock.lowCount, href: '/stock', severity: 'low', area: 'area-inventory', owner: ['wh-manager', 'shop-manager'] },
  ].filter(Boolean);
  // online orders placed on each of the last 7 days (the Orders figure's trend line)
  const ordersTrend = trend.map((t) => orders.filter((o) => (o.at || 0) >= t.from && (o.at || 0) < addDays(t.from, 1)).length);

  // insights: observations with their numbers (not to-dos), company-wide; shown only when the change is clear
  const DAY = 24 * 60 * 60 * 1000;
  const cut = dayOffset === 0 ? Math.max(1, now - day) : DAY;   // today: up to this time of day; yesterday: the whole day
  const salesIn = (from, to) => safe(() => salesByChannel(from, to, all).all, { revenue: 0, orders: 0 });
  const weekAgo = addDays(day, -7);
  const sameDay = { a: salesIn(day, day + cut).revenue, b: salesIn(weekAgo, weekAgo + cut).revenue };
  const lastWeekday = new Date(weekAgo).toLocaleDateString('en-GB', { weekday: 'long' });
  const wk = salesIn(addDays(day, -6), addDays(day, 1)), wkBefore = salesIn(addDays(day, -13), addDays(day, -6));
  const avg = (x) => (x.orders ? x.revenue / x.orders : 0);
  const share = (from, to) => { const c = safe(() => salesByChannel(from, to, all), null); return c && c.all.revenue ? Object.fromEntries(CH.map(([k]) => [k, c[k].revenue / c.all.revenue])) : null; };
  const shNow = share(addDays(day, -6), addDays(day, 1)), shBefore = share(addDays(day, -13), addDays(day, -6));
  let shift = null;
  if (shNow && shBefore && CH.length > 1) {
    CH.forEach(([k]) => { const dlt = Math.round((shNow[k] - shBefore[k]) * 100); if (!shift || Math.abs(dlt) > Math.abs(shift.dlt)) shift = { k, dlt }; });
    if (shift && Math.abs(shift.dlt) < 5) shift = null;
  }
  const insights = [
    changeInsight({ key: 'sales-sameday', what: 'Sales', now: sameDay.a, before: sameDay.b, vs: 'last ' + lastWeekday, evidence: `${money(sameDay.a)} vs ${money(sameDay.b)}${dayOffset === 0 ? ' by this time' : ''}`, href: '/daily-summary' }),
    changeInsight({ key: 'avg-sale', what: 'Average sale', now: avg(wk), before: avg(wkBefore), vs: 'the week before', evidence: `${money(avg(wk))} vs ${money(avg(wkBefore))} · last 7 days`, href: '/reports-centre' }),
    shift && { key: 'channel-share', text: `${shift.k} ${shift.dlt >= 0 ? 'rose' : 'fell'} to ${Math.round(shNow[shift.k] * 100)}% of sales this week`, evidence: `${Math.round(shBefore[shift.k] * 100)}% the week before`, href: '/sales-profit', dir: shift.dlt >= 0 ? 'up' : 'down' },
  ].filter(Boolean);

  return { chans: CH, now, asOf: now, day, d, prev, sales, byStatus, money: m, stock, trend, ordersTrend, month, todo, insights };
}

function greeting(hour) { return hour < 12 ? ['Good morning', 'শুভ সকাল'] : hour < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা']; }

/** A key figure in the top row: label, value and a small trend line; opens its page (or runs onClick). */
function Fig({ label, value, sub, spark, href, onClick }) {
  const body = (<><span className="ix-metric__icon" aria-hidden="true"><Icon name={figIcon(label)} width="16" height="16" /></span><span className="hm-fig__col"><span className="hm-fig__label">{label}</span><span className="hm-fig__row">{value}{sub ? <small>{sub}</small> : null}{spark ? <Spark values={spark} /> : null}</span></span></>);
  return href ? <Link href={href} className="hm-fig">{body}</Link> : <button type="button" className="hm-fig" onClick={onClick}>{body}</button>;
}

export default function Home() {
  // the site's edition (src/lib/edition.js): a preview picked on the full site is read after mount
  const [ed, setEd] = useState(() => (LOCKED ? currentEditionId() : 'full'));
  const has = (m) => hasModule(m, ed);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [place, setPlace] = useState('');
  const [layout, setLayout] = useState({});
  const [targetOpen, setTargetOpen] = useState(false);
  const [ask, setAsk] = useState('');
  const [locale, setLoc] = useState('en');

  useEffect(() => {
    setLayout(readLayout()); setLoc(getLocale()); setEd(currentEditionId()); setReady(true);
    const edChange = () => { setEd(currentEditionId()); setTick((n) => n + 1); };
    window.addEventListener(EDITION_EVENT, edChange);
    const again = () => setTick((n) => n + 1);
    const loc = () => setLoc(getLocale());
    ['gc:ledger', 'gc:orders', 'storage', 'focus', ACTIONS_EVENT].forEach((e) => window.addEventListener(e, again));
    window.addEventListener('gc:locale', loc);
    return () => { ['gc:ledger', 'gc:orders', 'storage', 'focus', ACTIONS_EVENT].forEach((e) => window.removeEventListener(e, again)); window.removeEventListener('gc:locale', loc); window.removeEventListener(EDITION_EVENT, edChange); };
  }, []);

  // worked out after the first paint, so the page shows its outline at once
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!ready || ed === 'comms' || ed === 'online') return undefined;   // those editions have their own Home
    const id = window.setTimeout(() => {
      const next = build({ dayOffset, place, ed });
      // the to-do as action items: today for all places updates the records; another day or one place only reads them
      next.todo = trackItems('home', next.todo, { sync: dayOffset === 0 && !place, user: safe(() => currentUser(), null) });
      next.fresh = isNewShop();
      setData(next);
    }, 0);
    return () => window.clearTimeout(id);
  }, [ready, dayOffset, place, tick, ed]);
  const places = useMemo(() => (ready ? safe(() => getPlaces({ active: true }).filter((p) => p.type === 'Branch' || p.type === 'Warehouse'), []) : []), [ready]);
  const target = Number(layout.target) || DEFAULT_TARGET;
  const user = ready ? safe(() => currentUser(), null) : null;
  const [hello, helloBn] = data ? greeting(new Date(data.now).getHours()) : ['Hello', 'হ্যালো'];
  const first = user && user.name ? user.name.split(' ')[0] : '';
  const create = [
    has('pos') && { label: 'New sale', icon: 'scan-barcode', href: '/pos' },
    has('online') && { label: 'New order', icon: 'file-plus', href: '/new-order' },
    has('catalog') && { label: 'Add product', icon: 'package-plus', href: '/add-product' },
    has('catalog') && { label: 'Receive goods', icon: 'package-check', href: '/receive-goods' },
    has('money') && { label: 'Add expense', icon: 'wallet', href: '/expenses-bills' },
  ].filter(Boolean);

  if (ed === 'comms') return <CommsHome />;
  if (ed === 'online') return <OnlineHome />;

  const dayName = dayOffset === 0 ? 'today' : 'yesterday';
  const change = data ? pct(data.sales.today, data.sales.prev) : null;
  // the chosen day and place's figures as CSV (what Home shows, plus the 7 days, best sellers and the to-do)
  const exportCsv = () => {
    if (!data) return;
    const x = data, dayIso = new Date(x.day).toISOString().slice(0, 10);
    const rows = [
      ['GridCommerce · Home', formatDate(x.day), place || 'All places', 'As of ' + formatDate(x.asOf) + ' ' + new Date(x.asOf).toLocaleTimeString('en-GB')],
      [],
      ['Figure', 'Value', 'Day before', 'Change %'],
      ['Sales', Math.round(x.sales.today), Math.round(x.sales.prev), change == null ? '' : change],
      ['Bills', x.sales.bills, '', ''],
      ...(has('online') ? [['Online orders placed', x.d.orders.placed, '', '']] : []),
      ...(has('money') ? [['Money in hand', Math.round(x.money.cashTotal), '', ''], ['Payouts due this week', Math.round(x.money.thisWeek), '', ''], ['COD with couriers', Math.round(x.money.cod), '', ''], ['Invoices due', Math.round(x.money.invoices), '', ''], ['Owed to suppliers', Math.round(x.money.supplier), '', ''], ['Bills to pay', Math.round(x.money.toPay), '', '']] : []),
      ['This month', Math.round(x.month), 'Target ' + target, Math.round(Math.min(1, x.month / target) * 100) + '% of target'],
      ...(has('catalog') ? [['Low stock items', x.stock.lowCount, '', '']] : []),
      [],
      ['Day', ...x.chans.map(([c]) => c), 'Total'],
      ...x.trend.map((t) => [formatDate(t.from), ...t.parts.map((v) => Math.round(v)), Math.round(t.total)]),
      [],
      ['Best seller', 'Sold', 'Sales'],
      ...x.d.top.slice(0, 5).map((p) => [p.name, p.qty, Math.round(p.revenue)]),
      [],
      ['To do', 'Count', 'Priority', 'Waiting'],
      ...x.todo.map((t) => [t.label, t.n, (SEVERITY[t.severity] || SEVERITY.normal).label, t.item ? ageText(ageOf(t.item)) : '']),
    ];
    downloadCsv(`home-${dayIso}-${(place || 'all-places').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, rows);
    toast('Home exported');
  };
  const askAi = (e) => { e.preventDefault(); if (!ask.trim()) return; window.dispatchEvent(new CustomEvent('gc:gridai', { detail: { q: ask.trim() } })); setAsk(''); };

  return (
    <div className="dc-screen ds" data-screen="Home">
      <style dangerouslySetInnerHTML={{ __html: CSS + PILLS_CSS + EXTRAS_CSS + WIDGETS_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main">
          <Topbar crumb="Home" page="Dashboard" />
          <div className="gc-shell__content">
            <div className="ix-page hm">
              <div className="ix-page hm-top-wrap">
              <span className="gc-pagehead__about" hidden>The day at a glance: the key figures, what needs you today, and sales over the last 7 days. Tap a figure or a task to open its page.</span>
              <StockSetupBanner />
              <div className="hm-top">
                <div className="hm-pick">
                  <select className="ix-pick" aria-label="Day" value={dayOffset} onChange={(e) => setDayOffset(Number(e.target.value))}>
                    <option value={0}>Today</option><option value={1}>Yesterday</option>
                  </select>
                  {places.length > 1 ? (
                    <select className="ix-pick" aria-label="Branch or warehouse" value={place} onChange={(e) => setPlace(e.target.value)}>
                      <option value="">All places</option>
                      {places.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  ) : null}
                  <Menu label="Create" icon="plus" cls="ix-btn" align="start" items={create} />
                  <button type="button" className="ix-btn" onClick={exportCsv} disabled={!data}><Icon name="download" width="16" height="16" aria-hidden="true" />Export</button>
                  {data ? <AsOf at={data.asOf} onRefresh={() => setTick((n) => n + 1)} /> : null}
                </div>
                {data ? (
                  <div className="hm-figs" aria-label={'Key figures, ' + dayName}>
                    <Fig label="Sales" value={money(data.sales.today)} sub={change == null ? null : (change >= 0 ? '▲' : '▼') + Math.abs(change) + '%'} spark={data.trend.map((t) => t.total)} href="/daily-summary" />
                    {has('online') ? <Fig label="Orders" value={String(data.d.orders.placed)} spark={data.ordersTrend} href="/merchant-orders" /> : null}
                    {has('money') ? <Fig label="Money in hand" value={short(data.money.cashTotal)} href="/money" /> : null}
                    <Fig label="This month" value={short(data.month)} sub={Math.round(Math.min(1, data.month / target) * 100) + '% of target'} onClick={() => setTargetOpen(true)} />
                  </div>
                ) : null}
              </div>

              <section className="hm-hero" aria-label="Today">
                <h1 className="hm-hello">
                  <span>{locale === 'bn' ? helloBn : hello}{first ? ', ' + first : ''}!</span>
                  {`Here's your shop ${dayName}.`}
                </h1>
                <form className="hm-ask" onSubmit={askAi} role="search">
                  <Icon name="sparkles" width="18" height="18" aria-hidden="true" />
                  <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Ask GridAI about sales, orders or stock…" aria-label="Ask GridAI" />
                  <button type="submit" disabled={!ask.trim()} aria-label="Ask"><Icon name="arrow-up" width="16" height="16" aria-hidden="true" /></button>
                </form>
              </section>

              <Readiness ed={ed} />

              {data && !data.fresh && data.insights && data.insights.length ? <InsightsCard items={data.insights} scope={place ? 'All places' : ''} /> : null}
              </div>
              {!data ? <div className="hm-cards" aria-busy="true"><div className="hm-skel" /><div className="hm-skel" /></div> : data.fresh ? null : <HomeWidgets has={has} />}
            </div>
          </div>
        </main>
      </div>

      <Sheet open={targetOpen} title="Monthly sales target" onClose={() => setTargetOpen(false)}
        footer={<button type="button" className="gc-btn gc-btn--solid" onClick={() => { setTargetOpen(false); toast('Target saved'); }}>Done</button>}>
        <label className="gc-label" htmlFor="hm-target">Sales target for the month (৳)</label>
        <input id="hm-target" className="gc-input" type="number" min="0" step="10000" inputMode="numeric" value={target}
          onChange={(e) => { const next = { ...layout, target: Math.max(0, Number(e.target.value) || 0) }; setLayout(next); writeLayout(next); }} />
        {data ? <p className="gc-help" style={{ margin: 0 }}>{short(data.month)} sold so far this month.</p> : null}
      </Sheet>
    </div>
  );
}
