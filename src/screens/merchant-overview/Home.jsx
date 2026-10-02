'use client';
// Home (/merchant-overview) — laid out like Shopify's Home: the day's key figures at the top, a greeting with "Ask GridAI"
// and the day's to-do as small pills (each opens the page where the work is done), then two cards: sales over the
// last 7 days and the best sellers. Nothing else: orders, stock and money each live on their own page.
// The day's figures come from reports/dailySummary (the same pack as the 8 PM summary), so they always agree.
// The monthly target is kept in gc.home.layout (tap "This month" to change it).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Sheet } from '@/components/ui';
import { Spark, Menu, figIcon } from '@/components/ui/IndexKit';
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
.hm-figs{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-6)}
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
.hm-todo{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--space-2);max-width:760px}
.hm-todo a{display:inline-flex;align-items:center;gap:var(--space-2);height:32px;padding:0 5px 0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;white-space:nowrap;transition:var(--transition-colors)}
.hm-todo a:hover{border-color:var(--primary);color:var(--primary)}
.hm-todo b{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hm-done{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-success)}
.hm-cards{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
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
  .hm-figs{flex-wrap:nowrap;width:calc(100% + 28px);margin:0 -14px;padding:0 14px;overflow-x:auto;gap:var(--space-5);scrollbar-width:none}
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

  // the day's to-do as short pills ("Verify orders 4"), most urgent first; each opens the page where it is done
  const toVerify = byStatus.onhold + byStatus.processing + byStatus.pending;
  const todo = [
    has('online') && toVerify > 0 && ['Verify orders', toVerify, '/merchant-orders?status=onhold'],
    has('online') && byStatus.ready > 0 && ['Send to courier', byStatus.ready, '/merchant-orders?status=ready'],
    has('money') && m.late.length > 0 && ['Check payouts', m.late.length, '/settlements'],
    has('money') && m.supplierOverdue.length > 0 && ['Pay suppliers', m.supplierOverdue.length, '/dues?tab=owe'],
    has('money') && m.toPayOverdue.length > 0 && ['Pay bills', m.toPayOverdue.length, '/liabilities'],
    has('catalog') && adjustments.length > 0 && ['Approve stock adjustments', adjustments.length, '/stock-adjustments'],
    has('catalog') && poApproval.length > 0 && ['Approve purchase orders', poApproval.length, '/purchase-orders'],
    has('online') && returnsToReceive.length > 0 && ['Receive returns', returnsToReceive.length, '/courier-returns'],
    has('catalog') && stock.lowCount > 0 && ['Restock', stock.lowCount, '/stock'],
  ].filter(Boolean).map(([label, n, href]) => ({ label, n, href }));
  // online orders placed on each of the last 7 days (the Orders figure's trend line)
  const ordersTrend = trend.map((t) => orders.filter((o) => (o.at || 0) >= t.from && (o.at || 0) < addDays(t.from, 1)).length);

  return { chans: CH, now, day, d, prev, sales, byStatus, money: m, stock, trend, ordersTrend, month, todo };
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
  const askAi = (e) => { e.preventDefault(); if (!ask.trim()) return; window.dispatchEvent(new CustomEvent('gc:gridai', { detail: { q: ask.trim() } })); setAsk(''); };

  return (
    <div className="dc-screen ds" data-screen="Home">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main">
          <Topbar crumb="Home" page="Dashboard" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow hm">
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
                  {data && data.todo.length ? `Here's what needs you ${dayName}.` : "You're all caught up."}
                </h1>
                <form className="hm-ask" onSubmit={askAi} role="search">
                  <Icon name="sparkles" width="18" height="18" aria-hidden="true" />
                  <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Ask GridAI about sales, orders or stock…" aria-label="Ask GridAI" />
                  <button type="submit" disabled={!ask.trim()} aria-label="Ask"><Icon name="arrow-up" width="16" height="16" aria-hidden="true" /></button>
                </form>
                {data ? (
                  data.todo.length ? (
                    <nav className="hm-todo" aria-label="To do">
                      {data.todo.map((t) => <Link key={t.label} href={t.href}>{t.label}<b>{t.n}</b></Link>)}
                    </nav>
                  ) : <span className="hm-done"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Nothing is waiting for you.</span>
                ) : null}
              </section>

              {!data ? (
                <div className="hm-cards" aria-busy="true"><div className="hm-skel" /><div className="hm-skel" /></div>
              ) : (
                <div className="hm-cards">
                  <section className="ix-card" aria-label="Sales, last 7 days">
                    <header className="ix-card__head"><h2>Sales · last 7 days</h2><Link href="/reports-centre">Reports</Link></header>
                    <div className="ix-card__body">
                      <p className="hm-total">{short(data.trend.reduce((a, t) => a + t.total, 0))}<small>{place || 'All places'}</small></p>
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
                      {data.chans.length > 1 ? <div className="hm-legend">{data.chans.map(([c, col]) => <span key={c}><i className="hm-dot" style={{ background: col }} />{c}</span>)}</div> : null}
                    </div>
                  </section>
                  <section className="ix-card" aria-label={'Best sellers ' + dayName}>
                    <header className="ix-card__head"><h2>Best sellers {dayName}</h2><Link href="/all-products">Products</Link></header>
                    <div className="ix-card__body">
                      {data.d.top.length ? (
                        <div className="hm-list">
                          {data.d.top.slice(0, 5).map((p) => <div key={p.sku || p.name} className="hm-row"><span><b>{p.name}</b><small>{p.qty} sold</small></span><span className="hm-num">{money(p.revenue)}</span></div>)}
                        </div>
                      ) : <p className="hm-empty">No sales {dayName} yet.</p>}
                    </div>
                  </section>
                </div>
              )}
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
