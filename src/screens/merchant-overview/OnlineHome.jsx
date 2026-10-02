'use client';
// OnlineHome — the Home page of the Online edition (GridCommerce Online): an online shop's day at a glance.
//   Wallet · Sales summary (today so far against yesterday by this time) · Revenue overview (30 days by
//   order source) · Needs your attention · Latest orders today · In courier · Website visitors today by hour ·
//   Low stock alert · Top products · Top customers (30 days)
// Everything is read from the shared books: orders (with the live orders of liveOrders.js), the sales book,
// the ledger and payouts, stock and traffic. Customise hides sections (gc.home.online). It refreshes each minute.
// Colours: the --viz-N series tokens, one colour per thing on the whole page (Facebook is always slot 1,
// the website slot 2 …); zones are an ordered blue ramp. Charts: components/charts/DashCharts.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, Sheet, StatusBadge } from '@/components/ui';
import { CHART_CSS, ColumnChart, Sparkline, Donut, StackBar, HBars, Legend } from '@/components/charts/DashCharts';
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
import { placeStock, LOW_AT } from '@/lib/stock';
import { visitsOn, SOURCES as VISIT_SOURCES } from '@/lib/traffic';
import { currentUser } from '@/lib/team';

const LAYOUT_KEY = 'gc.home.online';
const SECTIONS = [
  ['wallet', 'Wallet'], ['summary', 'Sales summary'], ['revenue', 'Revenue overview'], ['attention', 'Needs your attention'],
  ['latest', 'Latest orders today'], ['courier', 'In courier'], ['visitors', 'Website visitors today'], ['low', 'Low stock alert'],
  ['products', 'Top products'], ['customers', 'Top customers'],
];
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

// one colour per thing, the same on every card
const ORDER_SOURCES = ['Facebook', 'Website', 'Phone', 'Order link'];
const SOURCE_COLOR = { Facebook: 'var(--viz-1)', Website: 'var(--viz-2)', Phone: 'var(--viz-3)', 'Order link': 'var(--viz-4)', Instagram: 'var(--viz-5)', Google: 'var(--viz-6)', Direct: 'var(--viz-7)', TikTok: 'var(--viz-8)' };
const COURIER_COLOR = { Pathao: 'var(--viz-8)', Steadfast: 'var(--viz-3)', RedX: 'var(--viz-2)', Carrybee: 'var(--viz-4)' };
const CAT_COLOR = { 'Skin care': 'var(--viz-5)', Clothing: 'var(--viz-7)', Electronics: 'var(--viz-1)', Home: 'var(--viz-4)', Grocery: 'var(--viz-6)', Other: 'var(--viz-quiet)' };
const ZONES = ['Inside Dhaka', 'Sub-Dhaka', 'Outside Dhaka'];
const ZONE_COLOR = { 'Inside Dhaka': 'var(--od-seq-3)', 'Sub-Dhaka': 'var(--od-seq-2)', 'Outside Dhaka': 'var(--od-seq-1)' };
// the wallet's accounts, in the order of their colours (checked on the dark card)
const WALLET = [['Banks', 'var(--viz-dark-1)'], ['Nagad', 'var(--viz-dark-2)'], ['Cash', 'var(--viz-dark-3)'], ['Rocket', 'var(--viz-dark-4)'], ['bKash', 'var(--viz-dark-5)']];

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
const hourLabel = (h) => (h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : h - 12 + 'p');
const hourName = (h) => { const f = (x) => ((x % 12) || 12) + (x % 24 < 12 ? ' AM' : ' PM'); return `${f(h)} – ${f(h + 1)}`; };
const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
function readLayout() { try { const v = JSON.parse(window.localStorage.getItem(LAYOUT_KEY)); return v && typeof v === 'object' ? v : {}; } catch { return {}; } }
function writeLayout(v) { try { window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

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

  // today so far against yesterday by this time
  const span = (from, to) => {
    const ls = lines.filter((l) => l.at >= from && l.at <= to);
    const ids = new Set(ls.map((l) => l.saleId));
    const revenue = r2(ls.reduce((a, l) => a + l.revenue, 0));
    return { revenue, orders: ids.size, aov: ids.size ? revenue / ids.size : 0 };
  };
  const tNow = span(today, now), tYest = span(yest, yestNow);
  const vNow = visitsOn(today, now), vYest = visitsOn(yest, yestNow);
  const conv = (o, v) => (v ? (o / v) * 100 : 0);
  // the trend lines are the 14 whole days before today (today is still filling up)
  const last14 = days.slice(-15, -1);
  const none = !tNow.orders;
  const summary = {
    tiles: [
      { key: 'revenue', icon: 'banknote', tone: 'info', label: 'Revenue', value: money(tNow.revenue), d: none ? null : pct(tNow.revenue, tYest.revenue), was: money(tYest.revenue), spark: last14.map((d) => r2(d.revenue)), fmt: money },
      { key: 'orders', icon: 'shopping-cart', tone: 'warning', label: 'Orders', value: String(tNow.orders), d: none ? null : pct(tNow.orders, tYest.orders), was: String(tYest.orders), spark: last14.map((d) => d.orders), fmt: String },
      { key: 'aov', icon: 'receipt', tone: 'success', label: 'Average order', value: none ? '—' : money(tNow.aov), d: none || !tYest.orders ? null : pct(tNow.aov, tYest.aov), was: money(tYest.aov), spark: last14.map((d) => (d.orders ? Math.round(d.revenue / d.orders) : 0)), fmt: money },
      { key: 'conv', icon: 'mouse-pointer-click', tone: 'secondary', label: 'Conversion', value: conv(tNow.orders, vNow.total).toFixed(1) + '%', d: none || !tYest.orders ? null : pct(conv(tNow.orders, vNow.total), conv(tYest.orders, vYest.total)), was: conv(tYest.orders, vYest.total).toFixed(1) + '%', spark: last14.map((d) => r2(conv(d.orders, d.visitors))), fmt: (v) => Number(v).toFixed(1) + '%' },
    ],
    labels: last14.map((d) => dayLabel(d.from)),
    none,
  };
  const todayOrders = orders.filter((o) => o.at >= today).sort((a, b) => b.at - a.at);
  summary.sources = ORDER_SOURCES.map((s) => ({ name: s, color: SOURCE_COLOR[s], value: todayOrders.filter((o) => o.status !== 'Cancelled' && sourceOf(o.source) === s).length }));
  summary.cancelled = todayOrders.filter((o) => o.status === 'Cancelled').length;

  // revenue overview: 30 days by source, with the 7-day average
  const shown = days.slice(-30);
  const avg7 = (k) => { const w = days.slice(Math.max(0, k - 6), k + 1); return w.reduce((a, d) => a + d.revenue, 0) / w.length; };
  const revenue = {
    points: shown.map((d, i) => ({ label: i === shown.length - 1 ? 'Today' : dayLabel(d.from), title: (i === shown.length - 1 ? 'Today so far · ' : '') + dayLabel(d.from) + ` · ${plural(d.orders, 'order')}`, values: ORDER_SOURCES.map((s) => r2(d.src[s])), line: Math.round(avg7(days.length - 30 + i)) })),
    total: r2(shown.reduce((a, d) => a + d.revenue, 0)),
    orders: shown.reduce((a, d) => a + d.orders, 0),
    // whole days only: the 7 days before today against the 7 before those
    week: r2(days.slice(-8, -1).reduce((a, d) => a + d.revenue, 0)),
    weekBefore: r2(days.slice(-15, -8).reduce((a, d) => a + d.revenue, 0)),
    best: shown.slice(0, -1).reduce((a, d) => (d.revenue > a.revenue ? d : a), shown[0]),
    bySource: ORDER_SOURCES.map((s) => ({ name: s, color: SOURCE_COLOR[s], value: r2(shown.reduce((a, d) => a + d.src[s], 0)) })),
  };

  // latest orders today (yesterday's when none yet)
  const latest = todayOrders.length ? todayOrders.slice(0, 7) : orders.filter((o) => o.at >= yest && o.at < today).sort((a, b) => b.at - a.at).slice(0, 5);

  // in courier
  const shipped = orders.filter((o) => o.statusKey === 'shipped');
  const couriers = Object.keys(COURIER_COLOR).map((c) => {
    const mine = shipped.filter((o) => o.courier === c);
    return { name: c, parcels: mine.length, cod: r2(mine.filter((o) => o.payment === 'COD').reduce((a, o) => a + (Number(o.amount) || 0), 0)) };
  }).filter((c) => c.parcels > 0).sort((a, b) => b.parcels - a.parcels);
  const inDay = (t) => t != null && t >= today && t <= now;
  const courier = {
    couriers, parcels: shipped.length, cod: r2(couriers.reduce((a, c) => a + c.cod, 0)),
    ready: orders.filter((o) => o.statusKey === 'ready').length,
    delivered: orders.filter((o) => o.times && inDay(o.times.delivered)).length,
    returned: orders.filter((o) => o.times && inDay(o.times.returned)).length,
  };

  // website visitors today by hour (yesterday as the line)
  const hourNow = new Date(now).getHours();
  const ordersByHour = Array(24).fill(0);
  todayOrders.forEach((o) => { if (o.status !== 'Cancelled') ordersByHour[new Date(o.at).getHours()] += 1; });
  const yFull = visitsOn(yest, now);
  const busiest = vNow.byHour.reduce((b, v, h) => (v != null && v > (vNow.byHour[b] || 0) ? h : b), 0);
  const visitors = {
    points: vNow.byHour.map((v, h) => ({ label: hourLabel(h), title: `${hourName(h)}${h === hourNow ? ' (so far)' : ''} · ${plural(ordersByHour[h], 'order')}`, values: [v], line: yFull.byHour[h] })),
    total: vNow.total, d: pct(vNow.total, vYest.total), now: hourNow, busiest, sources: vNow.sources.map((s) => ({ ...s, color: SOURCE_COLOR[s.name], value: s.visitors })),
    mobile: Math.round((vNow.devices.find((x) => x.name === 'Mobile') || { share: 0 }).share * 100), conv: conv(tNow.orders, vNow.total),
  };

  // last 30 days: top products and top customers
  const from30 = addDays(today, -29);
  const recent = lines.filter((l) => l.at >= from30);
  const prod = new Map();
  recent.forEach((l) => { const k = l.sku || l.name; const p = prod.get(k) || prod.set(k, { key: k, name: l.name, cat: l.cat || 'Other', qty: 0, revenue: 0 }).get(k); p.qty += l.qty; p.revenue += l.revenue; });
  const products = [...prod.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const cust = new Map();
  recent.forEach((l) => {
    const c = l.customer || {};
    const k = c.phone || c.name;
    if (!k) return;
    const x = cust.get(k) || cust.set(k, { key: k, name: c.name, phone: c.phone, zone: l.zone, ids: new Set(), spent: 0 }).get(k);
    x.ids.add(l.saleId); x.spent += l.revenue; if (!x.zone && l.zone) x.zone = l.zone;
  });
  const people = [...cust.values()].map((c) => ({ ...c, orders: c.ids.size, spent: r2(c.spent) }));
  const customers = people.sort((a, b) => b.spent - a.spent).slice(0, 6);
  const zones = ZONES.map((z) => ({ name: z, color: ZONE_COLOR[z], value: r2(recent.filter((l) => l.zone === z).reduce((a, l) => a + l.revenue, 0)) }));
  const buyers = people.length;
  const repeat = people.filter((c) => c.orders > 1).length;

  // wallet: the shop's own money, and what payment partners hold for it
  const entries = safe(() => getEntries(), []);
  const own = safe(() => OWN_ACCOUNTS(), []);
  const bal = (a) => safe(() => balanceOf(a.id, entries), 0);
  const group = { Banks: 0, Nagad: 0, Cash: 0, Rocket: 0, bKash: 0 };
  own.forEach((a) => {
    if (a.credits) return;
    const k = a.type === 'Bank' ? 'Banks' : a.type === 'Cash' ? 'Cash' : a.brand === 'nagad' ? 'Nagad' : a.brand === 'rocket' ? 'Rocket' : 'bKash';
    group[k] += bal(a);
  });
  const payouts = safe(() => getPayouts(now), []);
  const open = payouts.filter((p) => p.status === 'expected' || p.status === 'delayed');
  const sumNet = (list) => r2(list.reduce((a, p) => a + (Number(p.net) || 0), 0));
  const late = payouts.filter((p) => p.late);
  const wallet = {
    total: r2(Object.values(group).reduce((a, v) => a + v, 0)),
    parts: WALLET.map(([name, color]) => ({ name, color, value: r2(group[name]) })),
    cod: sumNet(open.filter((p) => p.p && p.p.kind === 'Courier')),
    gateways: sumNet(open.filter((p) => !(p.p && p.p.kind === 'Courier'))),
    week: sumNet(open.filter((p) => p.due < addDays(today, 7))),
    late: late.length, lateTotal: sumNet(late),
  };
  // payouts arriving each of the next 7 days (what is overdue sits on today)
  wallet.days = Array.from({ length: 7 }, (_, k) => {
    const from = addDays(today, k), to = addDays(from, 1);
    const due = sumNet(open.filter((p) => !p.late && p.due < to && (k === 0 || p.due >= from)));
    const wd = new Date(from).toLocaleDateString('en-GB', { weekday: 'short' });
    return { label: k === 0 ? 'Today' : wd, title: `${k === 0 ? 'Today' : wd} ${dayLabel(from)}`, values: [due, k === 0 ? wallet.lateTotal : 0] };
  });

  // low stock (as of now)
  const low = [];
  safe(() => getPlaces({ active: true }), []).filter((p) => !p.noSale && !p.opening).forEach((pl) => {
    safe(() => placeStock(pl.name).rows, []).filter((r) => r.low).forEach((r) => low.push({ key: r.p.sku + pl.name, name: r.p.name, sku: r.p.sku, place: pl.name, available: Math.max(0, r.available) }));
  });
  low.sort((a, b) => a.available - b.available);

  // what needs attention, most urgent first (the same rules as the full Home)
  const pending = orders.filter((o) => ['onhold', 'processing', 'pending'].includes(o.statusKey));
  const bills = safe(() => getBills(), []).filter((b) => billLeft(b) > 0 && billStatus(b) === 'Overdue');
  const liabs = safe(() => getLiabilities(), []).filter((l) => leftOf(l) > 0 && liabStatus(l, now) === 'Overdue');
  const adjustments = safe(() => getAdjustments(), []).filter((a) => a.status === 'waiting');
  const toReceive = safe(() => courierReturns(orders).filter((o) => rtoState(o).left > 0), []);
  const att = [];
  if (pending.length) att.push({ icon: 'clock', tone: 'warning', title: `${plural(pending.length, 'order')} to verify`, sub: 'Call, then approve', href: '/merchant-orders?status=onhold' });
  if (courier.ready) att.push({ icon: 'package', tone: 'info', title: `${plural(courier.ready, 'parcel')} ready for courier`, sub: 'Send to courier', href: '/merchant-orders?status=ready' });
  if (late.length) att.push({ icon: 'clock-alert', tone: 'error', title: `${plural(late.length, 'payout')} overdue · ${money(wallet.lateTotal)}`, sub: 'Payment partners should have paid already', href: '/settlements' });
  if (toReceive.length) att.push({ icon: 'package-x', tone: 'info', title: `${plural(toReceive.length, 'courier return')} to receive`, sub: 'Check the parcels back into stock', href: '/courier-returns' });
  if (bills.length) att.push({ icon: 'receipt', tone: 'error', title: `${plural(bills.length, 'supplier bill')} overdue`, sub: `${money(bills.reduce((a, b) => a + billLeft(b), 0))} past the due date`, href: '/dues?tab=owe' });
  if (liabs.length) att.push({ icon: 'file-clock', tone: 'error', title: `${plural(liabs.length, 'bill')} to pay overdue`, sub: 'Salaries, commission or promotions', href: '/liabilities' });
  if (low.length) att.push({ icon: 'triangle-alert', tone: 'warning', title: `${plural(low.length, 'product')} low on stock`, sub: 'Reorder or move stock from another place', href: '/stock' });
  if (adjustments.length) att.push({ icon: 'clipboard-check', tone: 'warning', title: `${plural(adjustments.length, 'stock adjustment')} to approve`, sub: 'A manager approves every decrease', href: '/stock-adjustments' });

  return { now, today, hourNow, summary, revenue, latest, latestToday: todayOrders.length > 0, todayCount: todayOrders.filter((o) => o.status !== 'Cancelled').length, todayRevenue: tNow.revenue, courier, visitors, products, customers, zones, buyers, repeat, wallet, low: { count: low.length, items: low.slice(0, 6) }, att };
}

// ---- pieces -------------------------------------------------------------------------------------------------
function Card({ icon, title, sub, link, span, i, children, className = '' }) {
  return (
    <section className={'od-card od-span-' + span + ' ' + className} style={{ '--i': i }} aria-label={title}>
      <header>
        <div><h2><Icon name={icon} width="16" height="16" aria-hidden="true" />{title}</h2>{sub ? <p>{sub}</p> : null}</div>
        {link ? <Link href={link[0]} className="od-link">{link[1]}<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link> : null}
      </header>
      <div className="od-body">{children}</div>
    </section>
  );
}
const Delta = ({ d, label }) => (d == null ? <span className="od-delta">{label}</span>
  : <span className={'od-delta ' + (d >= 0 ? 'is-up' : 'is-down')}><Icon name={d >= 0 ? 'trending-up' : 'trending-down'} width="14" height="14" aria-hidden="true" />{Math.abs(d)}% <span>{label}</span></span>);

function greeting(hour) { return hour < 12 ? ['Good morning', 'শুভ সকাল'] : hour < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা']; }

export default function OnlineHome() {
  const [data, setData] = useState(null);
  const [tickN, setTick] = useState(0);
  const [layout, setLayout] = useState({});
  const [custom, setCustom] = useState(false);
  const [locale, setLoc] = useState('en');
  const [user, setUser] = useState(null);
  const [allAtt, setAllAtt] = useState(false);

  useEffect(() => {
    setLayout(readLayout()); setLoc(getLocale()); setUser(safe(() => currentUser(), null));
    const again = () => setTick((n) => n + 1);
    const loc = () => setLoc(getLocale());
    ['gc:ledger', 'gc:orders', 'storage', 'focus'].forEach((e) => window.addEventListener(e, again));
    window.addEventListener('gc:locale', loc);
    const timer = window.setInterval(again, 60 * 1000);   // orders move on with the clock
    return () => { ['gc:ledger', 'gc:orders', 'storage', 'focus'].forEach((e) => window.removeEventListener(e, again)); window.removeEventListener('gc:locale', loc); window.clearInterval(timer); };
  }, []);
  // worked out after the first paint, so the page shows its outline at once
  useEffect(() => { const id = window.setTimeout(() => { closeMonths(); setData(build()); }, 0); return () => window.clearTimeout(id); }, [tickN]);

  const shown = (k) => layout[k] !== false;
  const toggle = (k) => { const next = { ...layout, [k]: !shown(k) }; setLayout(next); writeLayout(next); };
  const [hello, helloBn] = data ? greeting(new Date(data.now).getHours()) : ['Dashboard', 'Dashboard'];
  const first = user && user.name ? user.name.split(' ')[0] : '';
  const d = data;
  // cards in reading order; the index staggers their entrance
  let n = 0;
  const next = () => n++;

  return (
    <div className="dc-screen ds" data-screen="Home">
      <style dangerouslySetInnerHTML={{ __html: CHART_CSS + CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="home" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="General" page="Dashboard" />
          <div className="gc-shell__content od" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Dashboard"
              description={d ? new Date(d.now).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '\u00a0'}
              actions={<>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCustom(true)}><Icon name="layout-grid" width="18" height="18" aria-hidden="true" /> Customise</button>
                <Link href="/new-order" className="gc-btn gc-btn--solid"><Icon name="file-plus" width="18" height="18" aria-hidden="true" /> New order</Link>
              </>}
            />

            <StockSetupBanner />
            {!d ? (
              <div className="od-grid" aria-busy="true">{[5, 7, 8, 4].map((s, k) => <div key={k} className={'od-skel od-span-' + s} />)}</div>
            ) : (
              <div className="od-grid">
                {shown('attention') ? (
                  <Card icon="bell-ring" title="Needs your attention" sub={d.att.length ? plural(d.att.length, 'thing') + ' waiting' : 'Nothing waiting'} span={5} i={next()}>
                    {d.att.length ? (
                      <div className="od-att">
                        {(allAtt ? d.att : d.att.slice(0, 5)).map((a) => (
                          <Link key={a.title} href={a.href}>
                            <span className={'od-att__icon is-' + a.tone}><Icon name={a.icon} width="18" height="18" aria-hidden="true" /></span>
                            <span className="od-att__text"><b>{a.title}</b><span>{a.sub}</span></span>
                            <Icon name="chevron-right" width="18" height="18" aria-hidden="true" className="od-att__go" />
                          </Link>
                        ))}
                        {d.att.length > 5 ? <button type="button" className="gc-btn gc-btn--flat gc-btn--sm od-more" aria-expanded={allAtt} onClick={() => setAllAtt((v) => !v)}>{allAtt ? 'Show fewer' : `Show ${d.att.length - 5} more`}<Icon name={allAtt ? 'chevron-up' : 'chevron-down'} width="16" height="16" aria-hidden="true" /></button> : null}
                      </div>
                    ) : <div className="od-clear"><Icon name="circle-check" width="20" height="20" aria-hidden="true" />All clear — nothing is waiting for you.</div>}
                  </Card>
                ) : null}

                {shown('summary') ? (
                  <Card icon="chart-no-axes-combined" title="Sales summary" sub={`Today so far, against yesterday by ${formatTime(d.now)}`} link={['/daily-summary', 'Daily summary']} span={7} i={next()}>
                    <div className="od-tiles">
                      {d.summary.tiles.map((t, k) => (
                        <div key={t.key} className="od-tile">
                          <span className="od-tile__label"><i className={'od-chip is-' + t.tone}><Icon name={t.icon} width="14" height="14" aria-hidden="true" /></i>{t.label}</span>
                          <strong className="od-tile__value">{t.value}</strong>
                          <Delta d={t.d} label={t.d == null && d.summary.none ? `yesterday ${t.was}` : `vs ${t.was}`} />
                          <Sparkline values={t.spark} labels={d.summary.labels} color="var(--primary)" fmt={t.fmt} label={`${t.label}, the 14 days before today`} delay={260 + k * 60} />
                        </div>
                      ))}
                    </div>
                    <div className="od-split">
                      <div className="od-split__head"><span>Where today’s orders came from</span><b>{plural(d.todayCount, 'order')}{d.summary.cancelled ? ` · ${d.summary.cancelled} cancelled` : ''}</b></div>
                      {d.todayCount ? <StackBar parts={d.summary.sources} fmt={(v) => plural(v, 'order')} label="Today's orders by source" delay={420} /> : <p className="od-empty">No orders yet today.</p>}
                      <Legend items={d.summary.sources.map((s) => ({ name: s.name, color: s.color, value: s.value }))} />
                    </div>
                  </Card>
                ) : null}

                {shown('latest') ? (
                  <Card icon="list-ordered" title="Latest orders today" sub={d.latestToday ? `${plural(d.todayCount, 'order')} · ${money(d.todayRevenue)} so far` : 'No orders yet today — the last ones from yesterday'} link={['/merchant-orders', 'All orders']} span={8} i={next()}>
                    <div className="od-orders">
                      <div className="od-orders__head" aria-hidden="true"><span>Order</span><span>From</span><span>Status</span><span className="od-r">Amount</span></div>
                      {d.latest.map((o, k) => {
                        const st = orderStatus(o.statusKey) || { label: o.status, tone: 'neutral' };
                        const src = o.source === 'Chat' ? 'Phone' : o.source || 'Website';
                        return (
                          <Link key={o.id} href={orderHref(o.id, 'home')} className="od-orders__row" style={{ '--k': k }}>
                            <span className="od-orders__who"><i className="od-avatar" aria-hidden="true">{initials(o.customer)}</i><span><b>{o.customer}</b><small>{o.id} · {formatTime(o.at)} · {o.zone}</small></span></span>
                            <span className="od-src"><i style={{ background: SOURCE_COLOR[src] || 'var(--viz-quiet)' }} aria-hidden="true" />{src}<small>{o.payment === 'Paid' ? 'Paid online' : 'COD'}</small></span>
                            <span><StatusBadge tone={st.tone}>{st.label}</StatusBadge></span>
                            <span className="od-r od-amt">{money(o.amount)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </Card>
                ) : null}

                {shown('courier') ? (
                  <Card icon="truck" title="In courier" sub={`${plural(d.courier.parcels, 'parcel')} on the way · ${short(d.courier.cod)} cash to collect`} link={['/merchant-orders?status=shipped', 'Shipped']} span={4} i={next()}>
                    <div className="od-steps">
                      <Link href="/merchant-orders?status=ready"><b>{d.courier.ready}</b><span>Ready</span></Link>
                      <Link href="/merchant-orders?status=shipped"><b>{d.courier.parcels}</b><span>In transit</span></Link>
                      <Link href="/merchant-orders?status=delivered"><b>{d.courier.delivered}</b><span>Delivered today</span></Link>
                      <Link href="/courier-returns"><b>{d.courier.returned}</b><span>Returned today</span></Link>
                    </div>
                    {d.courier.couriers.length ? (
                      <HBars Link={Link} delay={240} rows={d.courier.couriers.map((c) => ({ key: c.name, label: c.name, sub: `${short(c.cod)} COD to collect`, value: c.parcels, text: plural(c.parcels, 'parcel'), color: COURIER_COLOR[c.name], href: '/merchant-orders?status=shipped' }))} />
                    ) : <p className="od-empty">No parcels with couriers right now.</p>}
                  </Card>
                ) : null}

                {shown('low') ? (
                  <Card icon="triangle-alert" title="Low stock alert" sub={d.low.count ? `${plural(d.low.count, 'product')} at or under ${LOW_AT} left` : 'Everything is in stock'} link={['/stock', 'Stock']} span={6} i={next()}>
                    {d.low.items.length ? (<>
                      <div className="od-low">
                        {d.low.items.map((x, k) => {
                          const out = x.available <= 0;
                          return (
                            <div key={x.key} className="od-low__row">
                              <span className="od-low__main"><b>{x.name}</b><small>{x.place}</small></span>
                              <span className={'od-low__tag ' + (out ? 'is-out' : 'is-low')}><Icon name={out ? 'circle-x' : 'triangle-alert'} width="14" height="14" aria-hidden="true" />{out ? 'Out of stock' : `${x.available} left`}</span>
                              <span className="od-meter" aria-hidden="true"><span className="dch-grow" style={{ width: `${Math.max(4, Math.min(100, (x.available / (LOW_AT * 2)) * 100))}%`, '--d': 260 + k * 50 + 'ms' }} data-out={out ? '1' : undefined} /></span>
                            </div>
                          );
                        })}
                      </div>
                      <Link href="/new-po" className="gc-btn gc-btn--neutral gc-btn--sm od-cta"><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" /> Reorder</Link>
                    </>) : <div className="od-clear"><Icon name="circle-check" width="20" height="20" aria-hidden="true" />Nothing is running low.</div>}
                  </Card>
                ) : null}

                {shown('wallet') ? (
                  <section className="od-card od-wallet od-span-6" style={{ '--i': next() }} aria-label="Wallet">
                    <header>
                      <div><h2><Icon name="wallet" width="16" height="16" aria-hidden="true" />Wallet</h2></div>
                      <Link href="/money" className="od-link">Accounts<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link>
                    </header>
                    <div className="od-body">
                      <div className="od-wallet__hero">
                        <span>Total balance</span>
                        <strong>{money(d.wallet.total)}</strong>
                      </div>
                      <div className="od-wallet__more">
                        <Link href="/settlements"><span>Arriving in 7 days</span><b>{short(d.wallet.week)}</b></Link>
                        {d.wallet.late ? <Link href="/settlements"><span>Overdue payouts · {d.wallet.late}</span><b style={{ color: 'var(--warning)' }}>{short(d.wallet.lateTotal)}</b></Link> : <Link href="/settlements"><span>COD with couriers</span><b>{short(d.wallet.cod)}</b></Link>}
                      </div>
                    </div>
                  </section>
                ) : null}
                {shown('revenue') ? (
                  <Card icon="chart-column-stacked" title="Revenue overview" sub="Last 30 days" link={['/reports-centre', 'Reports']} span={6} i={next()}>
                    <div className="od-kpis">
                      <div><span>30 days</span><strong>{short(d.revenue.total)}</strong><small>{plural(d.revenue.orders, 'order')}</small></div>
                      <div><span>Past 7 days</span><strong>{short(d.revenue.week)}</strong><Delta d={pct(d.revenue.week, d.revenue.weekBefore)} label="vs the 7 days before" /></div>
                      <div><span>Average order</span><strong>{money(d.revenue.orders ? d.revenue.total / d.revenue.orders : 0)}</strong><small>30 days</small></div>
                      <div><span>Best day</span><strong>{short(d.revenue.best.revenue)}</strong><small>{dayLabel(d.revenue.best.from)}</small></div>
                    </div>
                    <ColumnChart data={d.revenue.points} series={ORDER_SOURCES.map((s) => ({ name: s, color: SOURCE_COLOR[s] }))} line={{ name: '7-day average', color: 'var(--text-heading)' }}
                      height={240} fmt={money} tickFmt={tick} label="Online revenue per day for the last 30 days, by order source, with the 7-day average" now={d.revenue.points.length - 1} delay={200} />
                    <Legend items={[...d.revenue.bySource.map((s) => ({ name: s.name, color: s.color, value: short(s.value) })), { name: '7-day average', color: 'var(--text-heading)', kind: 'line' }]} />
                  </Card>
                ) : null}

                {shown('visitors') ? (
                  <Card icon="users-round" title="Website visitors today" sub="By hour, against yesterday" link={['/analytics-hub', 'Analytics']} span={6} i={next()}>
                    <div className="od-kpis">
                      <div><span>Visitors so far</span><strong>{d.visitors.total.toLocaleString('en-IN')}</strong><Delta d={d.visitors.d} label="vs yesterday by now" /></div>
                      <div><span>Conversion</span><strong>{d.visitors.conv.toFixed(1)}%</strong><small>visitors who ordered</small></div>
                      <div><span>Busiest hour</span><strong>{hourName(d.visitors.busiest).split(' – ')[0]}</strong><small>{(d.visitors.points[d.visitors.busiest].values[0] || 0).toLocaleString('en-IN')} visitors</small></div>
                      <div><span>On mobile</span><strong>{d.visitors.mobile}%</strong><small>of visitors</small></div>
                    </div>
                    <ColumnChart data={d.visitors.points} series={[{ name: 'Today', color: SOURCE_COLOR.Website }]} line={{ name: 'Yesterday', color: 'var(--viz-quiet)', dash: true }}
                      height={210} fmt={(v) => Number(v).toLocaleString('en-IN')} tickFmt={(v) => String(v)} label="Website visitors per hour today, with yesterday" now={d.visitors.now} delay={200} />
                    <Legend items={[{ name: 'Today', color: SOURCE_COLOR.Website }, { name: 'Yesterday', color: 'var(--viz-quiet)', kind: 'dash' }]} />
                    <div className="od-split">
                      <div className="od-split__head"><span>Where visitors came from</span><b>{d.visitors.total.toLocaleString('en-IN')}</b></div>
                      <StackBar parts={d.visitors.sources} fmt={(v) => `${Number(v).toLocaleString('en-IN')} visitors`} label="Visitors by source" delay={380} />
                      <Legend items={d.visitors.sources.map((s) => ({ name: s.name, color: s.color, value: d.visitors.total ? Math.round((s.value / d.visitors.total) * 100) + '%' : '0%' }))} />
                    </div>
                  </Card>
                ) : null}

                {shown('products') ? (
                  <Card icon="trophy" title="Top products" sub="Last 30 days, by sales" link={['/products', 'Products']} span={6} i={next()}>
                    <HBars delay={240} rows={d.products.map((p) => ({ key: p.key, label: p.name, sub: `${p.qty} sold · ${p.cat}`, value: p.revenue, text: short(p.revenue), color: CAT_COLOR[p.cat] || CAT_COLOR.Other }))} />
                    <Legend items={[...new Set(d.products.map((p) => (CAT_COLOR[p.cat] ? p.cat : 'Other')))].map((c) => ({ name: c, color: CAT_COLOR[c] }))} />
                  </Card>
                ) : null}

                {shown('customers') ? (
                  <Card icon="crown" title="Top customers" sub={`Last 30 days · ${plural(d.buyers, 'buyer')}, ${d.repeat} came back`} link={['/customers', 'Customers']} span={6} i={next()}>
                    <div className="od-cust">
                      <div className="od-cust__zones">
                        <Donut parts={d.zones} size={148} thickness={18} fmt={short} total={short(d.zones.reduce((a, z) => a + z.value, 0))} totalLabel="by delivery zone" label="Sales by delivery zone" delay={240} />
                        <Legend items={d.zones.map((z) => ({ name: z.name, color: z.color }))} />
                      </div>
                      <ol className="od-cust__list">
                        {d.customers.map((c, k) => (
                          <li key={c.key}>
                            <Link href={c.phone ? `/customer-profile?phone=${c.phone}` : '/customers'}>
                              <span className="od-rank">{k + 1}</span>
                              <i className="od-avatar" aria-hidden="true" style={{ boxShadow: `inset 0 0 0 2px ${ZONE_COLOR[c.zone] || 'var(--viz-quiet)'}` }}>{initials(c.name)}</i>
                              <span className="od-cust__who"><b>{c.name}</b><small>{plural(c.orders, 'order')} · {c.zone || 'Online'}</small></span>
                              <strong>{short(c.spent)}</strong>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </Card>
                ) : null}

              </div>
            )}
          </div>
        </main>
      </div>

      <Sheet open={custom} title="Customise your dashboard" onClose={() => setCustom(false)}
        footer={<button type="button" className="gc-btn gc-btn--solid" onClick={() => { setCustom(false); toast('Dashboard saved'); }}>Done</button>}>
        <p className="od-sub">Choose what you see on your dashboard.</p>
        <div className="od-custom">
          {SECTIONS.map(([k, l]) => <label key={k}><input type="checkbox" checked={shown(k)} onChange={() => toggle(k)} />{l}</label>)}
        </div>
      </Sheet>
    </div>
  );
}

const CSS = `
.od{--od-seq-1:#86b6ef;--od-seq-2:#2a78d6;--od-seq-3:#184f95;--od-ease:cubic-bezier(0.23,1,0.32,1)}
html.dark .od{--od-seq-1:#184f95;--od-seq-2:#3987e5;--od-seq-3:#86b6ef}
.od-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--space-4);align-items:stretch}
.od-span-4{grid-column:span 4}.od-span-5{grid-column:span 5}.od-span-6{grid-column:span 6}.od-span-7{grid-column:span 7}.od-span-8{grid-column:span 8}
.od-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.od-card>header{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-2)}
.od-card>header>div{min-width:0}
.od-card>header h2{display:flex;align-items:center;gap:8px;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.od-card>header h2 svg{color:var(--text-muted)}
.od-card>header p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.od-link{display:inline-flex;align-items:center;gap:4px;min-height:32px;font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;text-decoration:none}
.od-body{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-2) var(--space-5) var(--space-5);flex:1;min-width:0;container-type:inline-size}
.od-skel{height:280px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.od-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.od-sub{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.od-delta{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);white-space:nowrap}
.od-delta span{font-weight:var(--weight-regular);color:var(--text-muted)}
.od-delta.is-up{color:var(--text-success)}.od-delta.is-down{color:var(--text-danger)}

/* entrance: cards rise in, one after another */
@media (prefers-reduced-motion:no-preference){
  .od-card{animation:od-in 360ms var(--od-ease) both;animation-delay:calc(var(--i,0) * 45ms)}
  .od-orders__row{animation:od-fade 280ms var(--od-ease) both;animation-delay:calc(240ms + var(--k,0) * 35ms)}
}
@media (prefers-reduced-motion:reduce){.od-card{animation:dch-fade 200ms ease both}}
@keyframes od-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes od-fade{from{opacity:0}to{opacity:1}}

/* wallet: the dark card */
.od-wallet{position:relative;overflow:hidden;border:0;background:radial-gradient(120% 90% at 100% 0%,rgba(0,156,222,.35) 0%,rgba(0,156,222,0) 55%),linear-gradient(150deg,var(--primary-900) 0%,var(--primary-700) 100%);color:var(--text-on-dark)}
.od-wallet>header h2,.od-wallet>header h2 svg{color:var(--text-on-dark)}
.od-wallet>header p{color:var(--text-on-dark-muted)}
.od-wallet .od-link{color:var(--text-on-dark)}
.od-wallet .dch-stack{background:rgba(255,255,255,.12)}
.od-wallet .dch-legend,.od-wallet .dch-legend b,.od-wallet .od-split__head b{color:var(--text-on-dark)}
.od-wallet{--chart-grid:rgba(255,255,255,.14);--od-bar:rgba(255,255,255,.86)}
.od-wallet .od-split__head{color:var(--text-on-dark-muted)}
.od-wallet .dch-tick,.od-wallet .dch-x{fill:var(--text-on-dark-muted)}
.od-wallet .dch-x.is-on{fill:var(--text-on-dark)}
.od-wallet .dch-band{fill:rgba(255,255,255,.08)}
.od-wallet__hero{display:flex;flex-direction:column;gap:2px}
.od-wallet__hero span{font-size:var(--text-xs);color:var(--text-on-dark-muted)}
.od-wallet__hero strong{font-size:var(--text-3xl);line-height:1.15;font-weight:var(--weight-semibold);letter-spacing:-.01em}
.od-wallet__parts{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:var(--space-2) var(--space-3);margin:0;padding:0;list-style:none;font-size:var(--text-xs)}
.od-wallet__parts li{display:grid;grid-template-columns:10px minmax(0,1fr) auto;align-items:center;gap:6px;color:var(--text-on-dark-muted)}
.od-wallet__parts i{width:10px;height:10px;border-radius:3px}
.od-wallet__parts b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-on-dark)}
.od-wallet__more{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.od-wallet__more a{display:flex;flex-direction:column;gap:2px;min-width:0;padding:var(--space-3);border-radius:var(--radius-lg);background:rgba(255,255,255,.08);color:inherit;text-decoration:none;transition:background-color 150ms ease}
.od-wallet__more span{font-size:var(--text-xs);color:var(--text-on-dark-muted)}
.od-wallet__more b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-wallet__acts{display:flex;gap:var(--space-2);margin-top:auto}
.od-wallet__acts .gc-btn{background:rgba(255,255,255,.14);color:var(--text-on-dark);border-color:transparent}
@media (hover:hover) and (pointer:fine){
  .od-wallet__more a:hover{background:rgba(255,255,255,.14)}
  .od-wallet__acts .gc-btn:hover{background:rgba(255,255,255,.22)}
}

/* sales summary */
.od-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.od-tile{display:flex;flex-direction:column;gap:4px;min-width:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.od-tile__label{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.od-tile__value{font-size:var(--text-xl);line-height:1.25;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-tile .dch{margin-top:var(--space-1)}
.od-chip{display:grid;place-items:center;width:24px;height:24px;flex:none;border-radius:var(--radius-full)}
.od-chip.is-info{background:var(--fill-primary-soft);color:var(--primary)}
.od-chip.is-warning{background:var(--fill-warning-soft);color:var(--text-warning)}
.od-chip.is-success{background:var(--fill-success-soft);color:var(--text-success)}
.od-chip.is-secondary{background:var(--fill-secondary-soft);color:var(--secondary-focus)}
html.dark .od-chip.is-secondary{color:var(--secondary-light)}
.od-split{display:flex;flex-direction:column;gap:var(--space-2)}
.od-split__head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.od-split__head b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}

/* kpis above a chart */
.od-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.od-kpis>div{display:flex;flex-direction:column;gap:2px;min-width:0;padding-left:var(--space-3);border-left:2px solid var(--border-subtle)}
.od-kpis span{font-size:var(--text-xs);color:var(--text-muted)}
.od-kpis strong{font-size:var(--text-lg);line-height:1.3;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-kpis small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-kpis .od-delta{white-space:normal;flex-wrap:wrap}

/* attention */
.od-att{display:flex;flex-direction:column}
.od-att a{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.od-att a:first-child{border-top:0}
.od-att__icon{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-full)}
.od-att__icon.is-error{background:var(--fill-error-soft);color:var(--text-danger)}
.od-att__icon.is-warning{background:var(--fill-warning-soft);color:var(--text-warning)}
.od-att__icon.is-info{background:var(--fill-primary-soft);color:var(--primary)}
.od-att__text{flex:1;min-width:0;display:flex;flex-direction:column}
.od-att__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.od-att__text span{font-size:var(--text-xs);color:var(--text-muted)}
.od-att__go{color:var(--text-muted);flex:none;transition:transform 150ms var(--od-ease)}
@media (hover:hover) and (pointer:fine){.od-att a:hover .od-att__text b{color:var(--primary)}.od-att a:hover .od-att__go{transform:translateX(2px)}}
.od-more{align-self:flex-start;margin-top:var(--space-2)}
.od-clear{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-sm);font-weight:var(--weight-medium)}

/* latest orders */
.od-orders{display:flex;flex-direction:column}
.od-orders__head,.od-orders__row{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1.2fr) minmax(0,1fr) minmax(84px,auto);align-items:center;gap:var(--space-3)}
.od-orders__head{padding:0 var(--space-2) var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.od-orders__row{min-height:56px;padding:var(--space-2);border-top:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:inherit;text-decoration:none;transition:background-color 150ms ease}
@media (hover:hover) and (pointer:fine){.od-orders__row:hover{background:var(--surface-subtle)}.od-orders__row:hover b{color:var(--primary)}}
.od-orders__who{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.od-orders__who>span{display:flex;flex-direction:column;min-width:0}
.od-orders__who b,.od-cust__who b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-orders__who small,.od-cust__who small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-avatar{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-style:normal;font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.od-src{display:grid;grid-template-columns:10px minmax(0,1fr);align-items:center;column-gap:6px;font-size:var(--text-sm);color:var(--text-body);min-width:0}
.od-src i{width:10px;height:10px;border-radius:3px}
.od-src small{grid-column:2;font-size:var(--text-xs);color:var(--text-muted)}
.od-r{text-align:right}
.od-amt{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}

/* in courier */
.od-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.od-steps a{display:flex;align-items:baseline;gap:var(--space-2);min-width:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);color:inherit;text-decoration:none;transition:background-color 150ms ease}
@media (hover:hover) and (pointer:fine){.od-steps a:hover{background:var(--fill-primary-soft)}}
.od-steps b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.od-steps span{font-size:var(--text-xs);color:var(--text-muted);line-height:1.3}

/* low stock */
.od-low{display:flex;flex-direction:column;gap:var(--space-3)}
.od-low__row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px var(--space-3);align-items:center}
.od-low__main{display:flex;flex-direction:column;min-width:0}
.od-low__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.od-low__main small{font-size:var(--text-xs);color:var(--text-muted)}
.od-low__tag{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.od-low__tag.is-out{color:var(--text-danger)}.od-low__tag.is-low{color:var(--text-warning)}
.od-meter{grid-column:1 / -1;height:6px;border-radius:var(--radius-full);background:var(--fill-warning-soft)}
.od-meter>span{display:block;height:100%;border-radius:var(--radius-full);background:var(--warning)}
.od-meter>span[data-out]{background:var(--error)}
.od-cta{align-self:flex-start;margin-top:auto}

/* top customers */
.od-cust{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-5);align-items:start}
.od-cust__zones{display:flex;flex-direction:column;align-items:center;gap:var(--space-3)}
.od-cust__zones .dch-legend{flex-direction:column;gap:var(--space-1)}
.od-cust__list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.od-cust__list a{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-1) var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none;transition:background-color 150ms ease}
@media (hover:hover) and (pointer:fine){.od-cust__list a:hover{background:var(--surface-subtle)}.od-cust__list a:hover b{color:var(--primary)}}
.od-rank{width:16px;flex:none;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);text-align:center}
.od-cust__who{display:flex;flex-direction:column;flex:1;min-width:0}
.od-cust__list strong{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}

.od-custom{display:flex;flex-direction:column;gap:var(--space-2)}
.od-custom label{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.od-custom input[type=checkbox]{width:18px;height:18px;accent-color:var(--primary)}

/* the cards' insides follow the card's own width */
@container (max-width:620px){.od-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:560px){.od-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:600px){
  .od-cust{grid-template-columns:minmax(0,1fr)}
  .od-cust__zones{flex-direction:row;justify-content:center;flex-wrap:wrap;gap:var(--space-5)}
}
@media (max-width:1279px){
  .od-span-4,.od-span-5,.od-span-7,.od-span-8{grid-column:span 6}
}
@media (max-width:1023px){
  .od-grid>*{grid-column:1 / -1}
}
@media (max-width:640px){
  .od-card>header{padding:var(--space-3) var(--space-4) var(--space-1)}
  .od-body{padding:var(--space-2) var(--space-4) var(--space-4)}
  .od-wallet__hero strong{font-size:var(--text-2xl)}
  .od-orders__head{display:none}
  .od-orders__row{grid-template-columns:minmax(0,1fr) auto;row-gap:6px}
  .od-orders__row .od-src{grid-column:1;grid-row:2;display:flex;gap:6px}
  .od-orders__row .od-src small::before{content:'· '}
  .od-orders__row>span:nth-child(3){grid-column:2;grid-row:2;justify-self:end}
}
`;
