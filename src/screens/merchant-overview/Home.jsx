'use client';
// Home (/merchant-overview) — the owner's morning briefing, built from the shared books (no sample numbers):
//   Today at a glance · Needs your attention · Orders · Money to collect (and to pay) · Stock · Last 7 days ·
//   Monthly target · Recent activity. Customise shows / hides sections (gc.home.layout) and sets the target.
// Deep analysis lives in Reports; every block links to the page where the work is done.
// The day's figures come from reports/dailySummary (the same pack as the 8 PM summary), so they always agree.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, Sheet, StatusBadge } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { dailySummary } from '@/lib/reports/dailySummary';
import { addDays, monthStart } from '@/lib/reports/period';
import { clockNow, startOfDay, getPayouts } from '@/lib/settlements';
import { getSales, salesByChannel } from '@/lib/salesBook';
import { getOrders, isCounterSale, orderHref, courierReturns, rtoState } from '@/lib/orders';
import { ORDER_STATUSES, orderStatus } from '@/lib/orderStatus';
import { getInvoices } from '@/lib/invoices';
import { getAdjustments } from '@/lib/stockAdjustments';
import { DEMO_POS, DEMO_STATUS, getPOs } from '@/lib/purchaseOrders';
import { getTransfers } from '@/lib/transfers';
import { getBills, billLeft, billStatus } from '@/lib/supplierBills';
import { getLiabilities, leftOf, liabStatus } from '@/lib/liabilities';
import { getEntries, KIND_LABEL, accountBy } from '@/lib/ledger';
import { getPlaces } from '@/lib/locations';
import { currentUser } from '@/lib/team';
import { hasModule, editionChannels, currentEditionId, LOCKED, EDITION_EVENT } from '@/lib/edition';
import CommsHome from './CommsHome';
import OnlineHome from './OnlineHome';

const LAYOUT_KEY = 'gc.home.layout';
const SECTIONS = [
  ['attention', 'Needs your attention'],
  ['orders', 'Orders'],
  ['money', 'Money to collect'],
  ['stock', 'Stock'],
  ['trend', 'Last 7 days'],
  ['target', 'Monthly target'],
  ['activity', 'Recent activity'],
];
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
.hm-glance{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-3)}
.hm-stat{display:flex;flex-direction:column;gap:4px;min-width:0;padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-decoration:none;color:inherit;transition:border-color var(--duration-base) var(--ease-out)}
a.hm-stat:hover{border-color:var(--primary)}
.hm-stat__label{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.hm-stat__value{font-family:var(--font-data);font-size:var(--text-xl);line-height:1.2;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-stat__sub{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-up{color:var(--text-success)}.hm-down{color:var(--text-danger)}
.hm-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.hm-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.hm-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.hm-card>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-4) var(--space-5) var(--space-2)}
.hm-card>header h2{display:flex;align-items:center;gap:8px;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hm-card>header h2 svg{color:var(--text-muted)}
.hm-card>header a{font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.hm-body{padding:var(--space-2) var(--space-5) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.hm-att{display:flex;flex-direction:column}
.hm-att a{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.hm-att a:first-child{border-top:0}
.hm-att a:hover .hm-att__text b{color:var(--primary)}
.hm-att__icon{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-full)}
.hm-att__text{flex:1;min-width:0;display:flex;flex-direction:column}
.hm-att__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hm-att__text span{font-size:var(--text-xs);color:var(--text-muted)}
.hm-att__go{color:var(--text-muted)}
.hm-tone-error{background:var(--fill-error-soft);color:var(--text-danger)}
.hm-tone-warning{background:var(--fill-warning-soft);color:var(--text-warning)}
.hm-tone-info{background:var(--fill-primary-soft);color:var(--primary)}
.hm-tone-success{background:var(--fill-success-soft);color:var(--text-success)}
.hm-clear{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-sm);font-weight:var(--weight-medium)}
.hm-pipe{display:flex;height:10px;overflow:hidden;border-radius:var(--radius-full);background:var(--surface-subtle)}
.hm-pipe span{display:block;height:100%}
.hm-steps{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:var(--space-2)}
.hm-steps a{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);color:inherit;text-decoration:none}
.hm-steps a:hover{background:var(--fill-primary-soft)}
.hm-steps b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hm-steps span{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.hm-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full)}
.hm-list{display:flex;flex-direction:column}
.hm-row{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none;font-size:var(--text-sm)}
.hm-row:first-child{border-top:0}
a.hm-row:hover .hm-row__main b{color:var(--primary)}
.hm-row__main{flex:1;min-width:0;display:flex;flex-direction:column}
.hm-row__main b{font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-row__main span{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-num{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;text-align:right}
.hm-sub{font-size:var(--text-xs);color:var(--text-muted)}
.hm-split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.hm-box{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);color:inherit;text-decoration:none;min-width:0}
a.hm-box:hover{background:var(--fill-primary-soft)}
.hm-box span{font-size:var(--text-xs);color:var(--text-muted)}
.hm-box b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-box small{font-size:var(--text-xs);color:var(--text-muted)}
.hm-h3{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.hm-bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:var(--space-2);align-items:end;height:150px;padding-top:var(--space-2)}
.hm-bar{display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;height:100%;gap:4px;min-width:0}
.hm-bar__stack{display:flex;flex-direction:column-reverse;border-radius:var(--radius-sm) var(--radius-sm) 0 0;overflow:hidden;min-height:2px;background:var(--surface-subtle)}
.hm-bar__stack span{display:block}
.hm-bar__day{font-size:var(--text-xs);color:var(--text-muted);text-align:center;white-space:nowrap}
.hm-bar.is-today .hm-bar__day{color:var(--text-heading);font-weight:var(--weight-semibold)}
.hm-legend{display:flex;flex-wrap:wrap;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.hm-legend span{display:inline-flex;align-items:center;gap:6px}
.hm-meter{height:12px;overflow:hidden;border-radius:var(--radius-full);background:var(--surface-subtle)}
.hm-meter span{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.hm-skel{height:96px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-subtle),var(--surface-card),var(--surface-subtle));background-size:200% 100%;animation:hm-shine 1.2s linear infinite}
@keyframes hm-shine{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.hm-skel{animation:none}}
.hm-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hm-quick{display:flex;flex-wrap:wrap;gap:var(--space-1);margin-left:auto}
.hm-cust{display:flex;flex-direction:column;gap:var(--space-2)}
.hm-cust label{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.hm-cust input[type=checkbox]{width:18px;height:18px;accent-color:var(--primary)}
@media (max-width:1279px){.hm-glance{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1023px){.hm-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .hm-glance{display:flex;overflow-x:auto;gap:8px;margin-inline:-14px;padding:0 14px 2px;scrollbar-width:none;scroll-snap-type:x proximity}
  .hm-glance::-webkit-scrollbar{display:none}
  .hm-stat{flex:0 0 auto;min-width:156px;max-width:220px;padding:var(--space-3);scroll-snap-align:start}
  .hm-stat__value{font-size:var(--text-lg)}
  .hm-card>header{padding:var(--space-3) var(--space-4) var(--space-1)}
  .hm-body{padding:var(--space-2) var(--space-4) var(--space-4)}
  .hm-bars{height:120px;gap:4px}
  /* day switch and place picker each get a full row */
  .hm-tools .gc-seg{flex:1 1 100%}
  .hm-tools .gc-seg>.gc-seg__btn{flex:1 1 0}
  .hm-tools select{flex:1 1 100%;width:100%!important;min-width:0!important}
  .hm-quick{flex-wrap:nowrap;overflow-x:auto;width:calc(100% + 28px);margin:0 -14px;padding:0 14px;scrollbar-width:none}
  .hm-quick::-webkit-scrollbar{display:none}
  .hm-quick a{flex:none;border:1px solid var(--border-subtle)}
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
  const latest = [...orders].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 5);
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

  // activity
  const activity = safe(() => getEntries(), [])
    .filter((e) => e.at <= now && e.amount)
    .sort((a, b) => b.at - a.at).slice(0, 7)
    .map((e) => ({ id: e.id || `${e.at}-${e.account}`, at: e.at, what: KIND_LABEL[e.kind] || e.kind, who: e.party || e.ref || '', account: (safe(() => accountBy(e.account), null) || {}).name || '', amount: e.amount }));

  // what needs attention, most urgent first
  const att = [];
  const add = (show, item) => { if (show) att.push(item); };
  add(has('online') && (byStatus.onhold + byStatus.processing + byStatus.pending) > 0, { icon: 'clock', tone: 'warning', title: `${(byStatus.onhold + byStatus.processing + byStatus.pending)} order${(byStatus.onhold + byStatus.processing + byStatus.pending) === 1 ? '' : 's'} to verify`, sub: 'Call, then approve', href: '/merchant-orders?status=onhold' });
  add(has('money') && m.late.length > 0, { icon: 'clock-alert', tone: 'error', title: `${m.late.length} payout${m.late.length === 1 ? '' : 's'} overdue · ${money(m.lateTotal)}`, sub: 'Payment partners should have paid already', href: '/settlements' });
  add(has('money') && m.supplierOverdue.length > 0, { icon: 'receipt', tone: 'error', title: `${m.supplierOverdue.length} supplier bill${m.supplierOverdue.length === 1 ? '' : 's'} overdue`, sub: `${money(m.supplierOverdue.reduce((a, b) => a + billLeft(b), 0))} past the due date`, href: '/dues?tab=owe' });
  add(has('money') && m.toPayOverdue.length > 0, { icon: 'file-clock', tone: 'error', title: `${m.toPayOverdue.length} bill${m.toPayOverdue.length === 1 ? '' : 's'} to pay overdue`, sub: 'Salaries, commission or promotions', href: '/liabilities' });
  add(has('catalog') && stock.lowCount > 0, { icon: 'triangle-alert', tone: 'warning', title: `${stock.lowCount} product${stock.lowCount === 1 ? '' : 's'} low on stock`, sub: place ? `At ${place}` : 'Reorder or move stock from another place', href: '/stock' });
  add(has('catalog') && adjustments.length > 0, { icon: 'clipboard-check', tone: 'warning', title: `${adjustments.length} stock adjustment${adjustments.length === 1 ? '' : 's'} to approve`, sub: 'A manager approves every decrease', href: '/stock-adjustments' });
  add(has('catalog') && poApproval.length > 0, { icon: 'shopping-bag', tone: 'info', title: `${poApproval.length} purchase order${poApproval.length === 1 ? '' : 's'} to approve`, sub: money(poApproval.reduce((a, p) => a + (Number(p.total) || 0), 0)), href: '/purchase-orders' });
  add(has('online') && returnsToReceive.length > 0, { icon: 'package-x', tone: 'info', title: `${returnsToReceive.length} courier return${returnsToReceive.length === 1 ? '' : 's'} to receive`, sub: 'Check the parcels back into stock', href: '/courier-returns' });
  add(has('catalog') && transfers.length > 0, { icon: 'truck', tone: 'info', title: `${transfers.length} transfer${transfers.length === 1 ? '' : 's'} on the way`, sub: 'Receive them when they arrive', href: '/transfers' });
  add(has('wholesale') && m.invoiceCount > 0, { icon: 'file-text', tone: 'info', title: `${m.invoiceCount} invoice${m.invoiceCount === 1 ? '' : 's'} not fully paid`, sub: `${money(m.invoices)} due from customers`, href: '/sales-invoices' });

  return { chans: CH, now, day, d, prev, sales, byStatus, total: orders.length, latest, money: m, stock, trend, month, activity, att };
}

function Stat({ icon, label, value, sub, href, tone }) {
  const inner = (<>
    <span className="hm-stat__label"><Icon name={icon} width="14" height="14" aria-hidden="true" />{label}</span>
    <span className="hm-stat__value">{value}</span>
    {sub ? <span className={'hm-stat__sub' + (tone ? ' hm-' + tone : '')}>{sub}</span> : null}
  </>);
  return href ? <Link href={href} className="hm-stat">{inner}</Link> : <div className="hm-stat">{inner}</div>;
}

function Card({ icon, title, link, children }) {
  return (
    <section className="hm-card" aria-label={title}>
      <header><h2><Icon name={icon} width="16" height="16" aria-hidden="true" />{title}</h2>{link ? <Link href={link[0]}>{link[1]}</Link> : null}</header>
      <div className="hm-body">{children}</div>
    </section>
  );
}

function greeting(hour) { return hour < 12 ? ['Good morning', 'শুভ সকাল'] : hour < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা']; }

export default function Home() {
  // the site's edition (src/lib/edition.js): a preview picked on the full site is read after mount
  const [ed, setEd] = useState(() => (LOCKED ? currentEditionId() : 'full'));
  const has = (m) => hasModule(m, ed);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [place, setPlace] = useState('');
  const [layout, setLayout] = useState({});
  const [custom, setCustom] = useState(false);
  const [locale, setLoc] = useState('en');

  useEffect(() => {
    setLayout(readLayout()); setLoc(getLocale()); setEd(currentEditionId()); setReady(true);
    const edChange = () => { setEd(currentEditionId()); setTick((n) => n + 1); };
    window.addEventListener(EDITION_EVENT, edChange);
    const again = () => setTick((n) => n + 1);
    const loc = () => setLoc(getLocale());
    ['gc:ledger', 'gc:orders', 'storage', 'focus'].forEach((e) => window.addEventListener(e, again));
    window.addEventListener('gc:locale', loc);
    return () => { ['gc:ledger', 'gc:orders', 'storage', 'focus'].forEach((e) => window.removeEventListener(e, again)); window.removeEventListener('gc:locale', loc); window.removeEventListener(EDITION_EVENT, edChange); };
  }, []);

  // worked out after the first paint, so the page shows its outline at once
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!ready) return undefined;
    const id = window.setTimeout(() => setData(build({ dayOffset, place, ed })), 0);
    return () => window.clearTimeout(id);
  }, [ready, dayOffset, place, tick, ed]);
  const places = useMemo(() => (ready ? safe(() => getPlaces({ active: true }).filter((p) => p.type === 'Branch' || p.type === 'Warehouse'), []) : []), [ready]);
  const SECTION_MODULE = { orders: 'online', money: 'money', stock: 'catalog', activity: 'money' };
  const shown = (k) => layout[k] !== false && (!SECTION_MODULE[k] || has(SECTION_MODULE[k]));
  const toggle = (k) => { const next = { ...layout, [k]: !shown(k) }; setLayout(next); writeLayout(next); };
  const target = Number(layout.target) || DEFAULT_TARGET;
  const user = ready ? safe(() => currentUser(), null) : null;
  const [hello, helloBn] = data ? greeting(new Date(data.now).getHours()) : ['Dashboard', 'Dashboard'];
  const first = user && user.name ? user.name.split(' ')[0] : '';

  const actions = (<>
    <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCustom(true)}><Icon name="layout-grid" width="18" height="18" aria-hidden="true" /> Customise</button>
    {has('online') ? <Link href="/new-order" className={'gc-btn ' + (has('pos') ? 'gc-btn--neutral' : 'gc-btn--solid')}><Icon name="file-plus" width="18" height="18" aria-hidden="true" /> New order</Link> : null}
    {has('pos') ? <Link href="/pos" className="gc-btn gc-btn--solid"><Icon name="scan-barcode" width="18" height="18" aria-hidden="true" /> New sale</Link> : null}
  </>);
  const shortcuts = [['/add-product', 'package-plus', 'Add product', 'catalog'], ['/receive-goods', 'package-check', 'Receive goods', 'catalog'], ['/new-po', 'shopping-bag', 'Purchase order', 'catalog'], ['/expenses-bills', 'wallet', 'Add expense', 'money'], ['/sales-invoices', 'file-text', 'Invoices', 'wholesale']].filter((x) => has(x[3]));

  if (ed === 'comms') return <CommsHome />;
  if (ed === 'online') return <OnlineHome />;

  const dayName = data ? (dayOffset === 0 ? 'today' : 'yesterday') : 'today';
  const change = data ? pct(data.sales.today, data.sales.prev) : null;

  return (
    <div className="dc-screen ds" data-screen="Home">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="General" page="Dashboard" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title={!data ? 'Dashboard' : locale === 'bn' ? `${helloBn}${first ? ', ' + first : ''}` : `${hello}${first ? ', ' + first : ''}`}
              description={data ? `${formatDate(data.day)} · ${place || 'All places'} · updated ${formatTime(data.now)}` : 'Loading today’s figures…'}
              actions={actions}
            />

            <div className="hm-tools" role="group" aria-label="What to show">
              <div className="gc-seg" role="group" aria-label="Day">
                {[[0, 'Today'], [1, 'Yesterday']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (dayOffset === k ? ' gc-seg__btn--active' : '')} aria-pressed={dayOffset === k} onClick={() => setDayOffset(k)}>{l}</button>)}
              </div>
              <select className="gc-input gc-select" style={{ width: 'auto', minWidth: 180 }} aria-label="Branch or warehouse" value={place} onChange={(e) => setPlace(e.target.value)}>
                <option value="">All places</option>
                {places.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
              <nav className="hm-quick" aria-label="Shortcuts">
                {shortcuts.map(([href, icon, label]) => <Link key={href} href={href} className="gc-btn gc-btn--flat gc-btn--sm"><Icon name={icon} width="16" height="16" aria-hidden="true" /> {label}</Link>)}
              </nav>
            </div>

            {!data ? (
              <div className="hm-glance" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="hm-skel" />)}</div>
            ) : (<>
              <div className="hm-glance" aria-label={`At a glance, ${dayName}`}>
                <Stat icon="banknote" label={`Sales ${dayName}`} value={money(data.sales.today)} href="/daily-summary"
                  sub={!data.sales.today ? `Day before ${money(data.sales.prev)}` : change == null ? `${data.sales.bills} bill${data.sales.bills === 1 ? '' : 's'}` : `${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}% vs day before`} tone={!data.sales.today || change == null ? '' : change >= 0 ? 'up' : 'down'} />
                {has('online') ? <Stat icon="shopping-cart" label={`Online orders ${dayName}`} value={String(data.d.orders.placed)} href="/merchant-orders" sub={`${data.d.orders.delivered} delivered · ${data.d.orders.returned} returned`} /> : has('wholesale') ? <Stat icon="file-text" label="Customer invoices due" value={short(data.money.invoices)} href="/sales-invoices" sub={`${data.money.invoiceCount} invoice${data.money.invoiceCount === 1 ? '' : 's'} not fully paid`} /> : null}
                {has('money') ? <Stat icon="wallet" label="Money in hand" value={short(data.money.cashTotal)} href="/money" sub={data.money.cash.map((c) => `${c.label.replace('Mobile wallets', 'Wallets')} ${short(c.closing)}`).join(' · ')} /> : null}
                {has('money') ? <Stat icon="hourglass" label="Payouts this week" value={short(data.money.thisWeek)} href="/settlements" sub={data.money.late.length ? `${data.money.late.length} overdue` : 'None overdue'} tone={data.money.late.length ? 'down' : ''} /> : null}
                {has('money') ? <Stat icon="receipt" label={`Expenses ${dayName}`} value={money(data.d.expenses.total)} href="/expenses-bills" sub={data.d.expenses.byCat[0] ? `Most: ${data.d.expenses.byCat[0].cat}` : 'Nothing spent'} /> : null}
              </div>

              <div className="hm-grid">
                <div className="hm-col">
                  {shown('attention') ? (
                    <Card icon="bell-ring" title="Needs your attention">
                      {data.att.length ? (
                        <div className="hm-att">
                          {data.att.map((a) => (
                            <Link key={a.title} href={a.href}>
                              <span className={'hm-att__icon hm-tone-' + a.tone}><Icon name={a.icon} width="18" height="18" aria-hidden="true" /></span>
                              <span className="hm-att__text"><b>{a.title}</b><span>{a.sub}</span></span>
                              <Icon name="chevron-right" width="18" height="18" aria-hidden="true" className="hm-att__go" />
                            </Link>
                          ))}
                        </div>
                      ) : <div className="hm-clear"><Icon name="circle-check" width="20" height="20" aria-hidden="true" />All clear — nothing is waiting for you.</div>}
                    </Card>
                  ) : null}

                  {shown('orders') ? (
                    <Card icon="shopping-cart" title="Orders" link={['/merchant-orders', 'All orders']}>
                      <div className="hm-pipe" role="img" aria-label={ORDER_STATUSES.map((s) => `${s.label} ${data.byStatus[s.key]}`).join(', ')}>
                        {ORDER_STATUSES.map((s) => <span key={s.key} style={{ width: `${data.total ? (data.byStatus[s.key] / data.total) * 100 : 0}%`, background: `var(--fill-${s.tone === 'error' ? 'danger' : s.tone === 'neutral' ? 'info-soft' : s.tone})` }} />)}
                      </div>
                      <div className="hm-steps">
                        {ORDER_STATUSES.map((s) => (
                          <Link key={s.key} href={`/merchant-orders?status=${s.key}`}>
                            <b>{data.byStatus[s.key]}</b>
                            <span><i className="hm-dot" style={{ background: `var(--fill-${s.tone === 'error' ? 'danger' : s.tone === 'neutral' ? 'info-soft' : s.tone})` }} />{s.label}</span>
                          </Link>
                        ))}
                      </div>
                      <h3 className="hm-h3">Latest orders</h3>
                      <div className="hm-list">
                        {data.latest.map((o) => {
                          const st = orderStatus(o.statusKey) || { label: o.statusKey, tone: 'neutral' };
                          return (
                            <Link key={o.id} href={orderHref(o.id)} className="hm-row">
                              <span className="hm-row__main"><b>{o.customer || o.name || o.id}</b><span>{o.id}{o.at ? ' · ' + formatDate(o.at) : ''}</span></span>
                              <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                              <span className="hm-num">{money(o.amount)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </Card>
                  ) : null}

                  {shown('trend') ? (
                    <Card icon="chart-column" title="Last 7 days" link={['/reports-centre', 'Reports']}>
                      {(() => {
                        const max = Math.max(1, ...data.trend.map((t) => t.total));
                        return (
                          <div className="hm-bars" role="img" aria-label={data.trend.map((t) => `${formatDate(t.from)} ${money(t.total)}`).join(', ')}>
                            {data.trend.map((t) => (
                              <div key={t.from} className={'hm-bar' + (t.today ? ' is-today' : '')} title={`${formatDate(t.from)} · ${money(t.total)}`}>
                                <div className="hm-bar__stack" style={{ height: `${(t.total / max) * 100}%` }}>
                                  {t.parts.map((v, i) => <span key={data.chans[i][0]} style={{ height: `${t.total ? (v / t.total) * 100 : 0}%`, background: data.chans[i][1] }} />)}
                                </div>
                                <span className="hm-bar__day">{new Date(t.from).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <div className="hm-legend">{data.chans.map(([c, col]) => <span key={c}><i className="hm-dot" style={{ background: col }} />{c}</span>)}<span>Week {short(data.trend.reduce((a, t) => a + t.total, 0))}</span></div>
                      {data.d.top.length ? (<>
                        <h3 className="hm-h3">Best sellers {dayName}</h3>
                        <div className="hm-list">{data.d.top.map((p) => <div key={p.sku || p.name} className="hm-row"><span className="hm-row__main"><b>{p.name}</b><span>{p.qty} sold</span></span><span className="hm-num">{money(p.revenue)}</span></div>)}</div>
                      </>) : null}
                    </Card>
                  ) : null}
                </div>

                <div className="hm-col">
                  {shown('money') ? (
                    <Card icon="hand-coins" title="Money to collect" link={['/dues', 'Dues']}>
                      <div className="hm-split">
                        {has('online') ? <Link href="/settlements" className="hm-box"><span>Cash on delivery with couriers</span><b>{short(data.money.cod)}</b><small>{data.money.codCount} payout{data.money.codCount === 1 ? '' : 's'} to come</small></Link> : null}
                        <Link href="/settlements" className="hm-box"><span>bKash, Nagad & card payouts</span><b>{short(data.money.gateways)}</b><small>{data.money.gateCount} payout{data.money.gateCount === 1 ? '' : 's'} to come</small></Link>
                        {has('wholesale') ? <Link href="/sales-invoices" className="hm-box"><span>Customer invoices due</span><b>{short(data.money.invoices)}</b><small>{data.money.invoiceCount} invoice{data.money.invoiceCount === 1 ? '' : 's'}</small></Link> : null}
                        <Link href="/settlements" className="hm-box"><span>Arriving in 7 days</span><b>{short(data.money.thisWeek)}</b><small>{data.d.payouts.dueToday.length ? `${data.d.payouts.dueToday.length} due today` : 'Nothing due today'}</small></Link>
                      </div>
                      <h3 className="hm-h3">Money you owe</h3>
                      <div className="hm-split">
                        <Link href="/dues?tab=owe" className="hm-box"><span>Supplier bills</span><b>{short(data.money.supplier)}</b><small>{data.money.supplierOverdue.length ? `${data.money.supplierOverdue.length} overdue` : 'None overdue'}</small></Link>
                        <Link href="/liabilities" className="hm-box"><span>Bills to pay</span><b>{short(data.money.toPay)}</b><small>Salaries, commission, promotions</small></Link>
                      </div>
                    </Card>
                  ) : null}

                  {shown('stock') ? (
                    <Card icon="boxes" title="Stock" link={['/stock', 'Stock']}>
                      <div className="hm-split">
                        <Link href="/receive-goods" className="hm-box"><span>Coming from suppliers</span><b>{data.stock.incomingPcs.toLocaleString('en-IN')} pcs</b><small>{data.stock.incoming.length} purchase order{data.stock.incoming.length === 1 ? '' : 's'}</small></Link>
                        <Link href="/transfers" className="hm-box"><span>On the way between places</span><b>{data.stock.transferPcs.toLocaleString('en-IN')} pcs</b><small>{data.stock.transfers.length} transfer{data.stock.transfers.length === 1 ? '' : 's'}</small></Link>
                      </div>
                      <h3 className="hm-h3">Low stock{data.stock.lowCount ? ` · ${data.stock.lowCount}` : ''}</h3>
                      {data.stock.low.length ? (
                        <div className="hm-list">
                          {data.stock.low.map((x) => (
                            <div key={x.sku + x.place} className="hm-row">
                              <span className="hm-row__main"><b>{x.name}</b><span>{x.place}</span></span>
                              <span className="hm-num" style={{ color: x.available <= 0 ? 'var(--text-danger)' : 'var(--text-warning)' }}>{x.available <= 0 ? 'Out' : `${x.available} left`}</span>
                            </div>
                          ))}
                          <Link href="/new-po" className="gc-btn gc-btn--neutral gc-btn--sm" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" /> Reorder</Link>
                        </div>
                      ) : <p className="hm-sub" style={{ margin: 0 }}>Nothing is low{place ? ` at ${place}` : ''}.</p>}
                    </Card>
                  ) : null}

                  {shown('target') ? (
                    <Card icon="target" title="Monthly target">
                      {(() => {
                        const share = Math.min(1, data.month / target);
                        const d0 = new Date(data.day);
                        const days = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate();
                        const left = Math.max(0, target - data.month);
                        const daysLeft = days - d0.getDate();
                        return (<>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <span className="hm-num" style={{ fontSize: 'var(--text-xl)' }}>{short(data.month)}</span>
                            <span className="hm-sub">of {short(target)} · {Math.round(share * 100)}%</span>
                          </div>
                          <div className="hm-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share * 100)} aria-label="Monthly target"><span style={{ width: `${share * 100}%` }} /></div>
                          <p className="hm-sub" style={{ margin: 0 }}>{left > 0 ? `${short(left)} to go${daysLeft > 0 ? ` · about ${short(left / daysLeft)} a day for ${daysLeft} more day${daysLeft === 1 ? '' : 's'}` : ''}.` : 'Target reached this month.'}</p>
                        </>);
                      })()}
                    </Card>
                  ) : null}

                  {shown('activity') ? (
                    <Card icon="history" title="Recent activity" link={['/money', 'Cash, bank & wallets']}>
                      {data.activity.length ? (
                        <div className="hm-list">
                          {data.activity.map((e) => (
                            <div key={e.id} className="hm-row">
                              <span className="hm-row__main"><b>{e.what}{e.who ? ` · ${e.who}` : ''}</b><span>{formatDate(e.at)} {formatTime(e.at)}{e.account ? ` · ${e.account}` : ''}</span></span>
                              <span className="hm-num" style={{ color: e.amount < 0 ? 'var(--text-danger)' : 'var(--text-success)' }}>{e.amount < 0 ? '−' : '+'}{money(Math.abs(e.amount))}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="hm-sub" style={{ margin: 0 }}>No money has moved yet.</p>}
                    </Card>
                  ) : null}
                </div>
              </div>
            </>)}
          </div>
        </main>
      </div>

      <Sheet open={custom} title="Customise your dashboard" onClose={() => setCustom(false)}
        footer={<button type="button" className="gc-btn gc-btn--solid" onClick={() => { setCustom(false); toast('Dashboard saved'); }}>Done</button>}>
        <p className="hm-sub" style={{ margin: 0 }}>Choose what you see. Today at a glance always stays at the top.</p>
        <div className="hm-cust">
          {SECTIONS.filter(([k]) => !SECTION_MODULE[k] || has(SECTION_MODULE[k])).map(([k, l]) => <label key={k}><input type="checkbox" checked={shown(k)} onChange={() => toggle(k)} />{l}</label>)}
        </div>
        <div>
          <label className="gc-label" htmlFor="hm-target">Monthly sales target (৳)</label>
          <input id="hm-target" className="gc-input" type="number" min="0" step="10000" inputMode="numeric" value={target}
            onChange={(e) => { const next = { ...layout, target: Math.max(0, Number(e.target.value) || 0) }; setLayout(next); writeLayout(next); }} />
        </div>
      </Sheet>
    </div>
  );
}
