'use client';
// Merchant app · Home (/m-home). The design board's layout (design/templates/app/MHome.dc.html) with live data:
//   header      the person (lib/team.js), the shop name (Settings › General, lib/businessProfile.js) and their place;
//               EN / বাংলা, Scan and the notifications bell (dot when something needs them)
//   greeting    today's date and "Good afternoon, <first name>"
//   Sales today the same pack as the web Home and the 8 PM summary (lib/reports/dailySummary.js): sales, change
//               against the same weekday last week up to this time, and three figures (online editions: orders,
//               to ship, average order; Retail: sales, returns, average sale). Only people with the Dashboard or
//               Finance see the whole shop's; the rest see their part (kit/appScope.js, the web's access rules and
//               My dashboard's blocks): online sales, their branch's or warehouse's, or their own
//   quick actions edition- and role-aware (appNav.canUse), at most four
//   Needs you   the day's to-do as action items (lib/actionItems.js, source 'app'; the same keys as the web Home, so
//               snoozing or dismissing one on the web hides it here too), at most four, most urgent first
//   This week   sales of the last 7 days (salesBook.salesByChannel), today in brand blue
//   Recent orders the latest three (online orders, or counter sales in the Retail edition); people who can't open
//               Orders see the latest sales of their part instead
// Everything is read after mount (Netlify prerenders in UTC) and again when the books change (useAppData).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, Content, TabBar, Section, Card, ListRow, Tile, TileGrid, Avatar, IconButton, EmptyState, Skeleton,
  LangSwitch, Icon, useAppData, useLocale, money, ago, initials,
} from './kit/AppKit';
import { canUse } from './kit/appNav';
import { hasModule } from '@/lib/edition';
import { firstName } from '@/lib/team';
import { businessProfile } from '@/lib/businessProfile';
import { dailySummary } from '@/lib/reports/dailySummary';
import { addDays } from '@/lib/reports/period';
import { clockNow, startOfDay } from '@/lib/settlements';
import { getSales, salesByChannel } from '@/lib/salesBook';
import { getOrders, isCounterSale } from '@/lib/orders';
import { orderStatus } from '@/lib/orderStatus';
import { getBills, billLeft, billStatus } from '@/lib/supplierBills';
import { liveCount } from '@/lib/liveCounts';
import { trackItems, ageOf, ageText } from '@/lib/actionItems';
import { salesScope, scopedSales } from './kit/appScope';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SEV_TONE = { critical: 'err', high: 'warn', normal: 'nav', low: 'grey' };
const NEW = ['onhold', 'processing', 'pending'];

/** Everything Home shows, worked out once from the books. */
export function build(ctx) {
  const { ed, user } = ctx;
  const has = (m) => hasModule(m, ed);
  const use = (r) => canUse(r, ctx);
  const now = clockNow();
  const day = startOfDay(now);
  const d = dailySummary(day, now);

  // sales today against the same weekday last week, up to this time of day; the whole shop's only for people with
  // the Dashboard or Finance, else their part (online, their place, or their own)
  const scope = salesScope(user);
  const all = safe(() => getSales(), []);
  const revenue = scope.kind === 'shop'
    ? (from, to) => safe(() => salesByChannel(from, to, all).all.revenue, 0)
    : (from, to) => safe(() => scopedSales(scope, user, from, to, all).total, 0);
  // both sides cover the same hours: today from midnight up to now, and that weekday last week from midnight up to
  // the same time of day (not the whole of last week's day, and not sales stamped later today)
  const upTo = Math.max(1, now - day + 1);
  const weekAgo = addDays(day, -7);
  const soFar = revenue(day, day + upTo);
  const before = revenue(weekAgo, weekAgo + upTo);
  const change = before ? Math.round(((soFar - before) / Math.abs(before)) * 100) : null;
  const trend = [];
  for (let i = 6; i >= 0; i -= 1) { const from = addDays(day, -i); trend.push({ from, today: i === 0, total: revenue(from, addDays(from, 1)) }); }

  // orders
  const orders = safe(() => getOrders(), []);
  const online = orders.filter((o) => !isCounterSale(o));
  const count = (keys) => online.filter((o) => keys.includes(o.statusKey)).length;
  const oldest = (list, f = (x) => x.at) => { const ts = list.map(f).filter((t) => Number(t) > 0); return ts.length ? Math.min(...ts) : undefined; };
  const mine = scope.kind === 'shop' ? null : safe(() => scopedSales(scope, user, day, addDays(day, 1), all), { total: 0, count: 0, units: 0, recent: [] });
  const total = mine ? mine.total : d.sales.total;
  const avg = mine ? (mine.count ? mine.total / mine.count : 0) : d.sales.orders ? d.sales.total / d.sales.orders : 0;
  let figures;
  if (scope.kind === 'online') figures = [[String(mine.count), 'Orders'], [String(count(['approved', 'ready'])), 'To ship'], [money(avg), 'Avg. order']];
  else if (mine) figures = [[String(mine.count), 'Sales'], [String(mine.units), 'Items'], [money(avg), 'Avg. sale']];
  else if (has('online')) figures = [[String(d.sales.orders), 'Orders'], [String(count(['approved', 'ready'])), 'To ship'], [money(avg), 'Avg. order']];
  else figures = [[String(d.sales.orders), 'Sales'], [money(d.sales.returns), 'Returns'], [money(avg), 'Avg. sale']];

  // the day's to-do (same keys as the web Home: one record per issue)
  const waiting = online.filter((o) => NEW.includes(o.statusKey));
  const ready = online.filter((o) => o.statusKey === 'ready');
  const chats = has('comms') ? safe(() => liveCount('chats'), 0) || 0 : 0;
  const overdue = has('money') ? safe(() => getBills().filter((b) => billLeft(b) > 0 && billStatus(b) === 'Overdue'), []) : [];
  const firstLow = d.low.items[0];
  const pick = (route, web) => (use(route) ? route : web);
  const rows = [
    has('online') && waiting.length > 0 && { key: 'orders:verify', label: 'Verify orders', n: waiting.length, icon: 'bag', href: pick('/m-orders', '/merchant-orders?status=onhold'), severity: 'high', area: 'area-orders', owner: ['orders', 'comms', 'online-sales'], since: oldest(waiting) },
    has('online') && ready.length > 0 && { key: 'orders:to-courier', label: 'Send to courier', n: ready.length, icon: 'truck', href: pick('/m-orders', '/merchant-orders?status=ready'), severity: 'high', area: 'area-orders', owner: ['orders', 'wh-manager', 'wh-supervisor'], since: oldest(ready) },
    chats > 0 && { key: 'inbox:chats', label: 'Reply to chats', n: chats, icon: 'chat', href: pick('/m-inbox', '/merchant-inbox'), severity: 'high', area: 'area-inbox', owner: ['comms', 'orders', 'online-sales'] },
    has('money') && d.payouts.late.length > 0 && { key: 'finance:late-payouts', label: 'Check payouts', n: d.payouts.late.length, value: d.payouts.lateTotal, sub: money(d.payouts.lateTotal) + ' late', icon: 'cash', href: pick('/m-payouts', '/settlements'), severity: 'critical', area: 'area-payments', owner: ['ceo'], since: oldest(d.payouts.late, (p) => p.due) },
    overdue.length > 0 && { key: 'finance:supplier-bills', label: 'Pay suppliers', n: overdue.length, icon: 'receipt', href: pick('/m-dues', '/dues?tab=owe'), severity: 'high', area: 'area-finances', owner: ['ceo', 'wh-manager'], since: oldest(overdue, (b) => b.due) },
    has('catalog') && d.low.count > 0 && { key: 'stock:restock', label: 'Restock', n: d.low.count, icon: 'box', sub: firstLow ? `${firstLow.name} · ${firstLow.available} left` : '', href: pick('/m-stock', '/stock'), severity: 'low', area: 'area-inventory', owner: ['wh-manager', 'shop-manager'] },
  ].filter(Boolean);
  const todo = safe(() => trackItems('app', rows, { user }), rows);

  // recent orders (counter sales in the Retail edition); people who can't open Orders see their part's latest sales
  const ordersOpen = use('/m-orders') && (scope.kind === 'shop' || scope.kind === 'online');
  const recent = ordersOpen ? [...(has('online') ? online : orders)].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 3) : [];
  const recentSales = ordersOpen || !mine ? [] : mine.recent;

  // quick actions: the first four this person can use
  const actions = [
    ['/m-new-order', 'New order', 'plus'],
    ['/m-pos', 'New sale', 'cart'],
    ['/m-scan', 'Scan', 'scan'],
    ['/m-product-edit', 'Add product', 'box'],
    ['/m-receive', 'Receive goods', 'download'],
    ['/m-expense-new', 'Add expense', 'minus'],
    ['/m-customers', 'Customers', 'users'],
  ].filter(([r]) => use(r)).slice(0, 4);

  return { now, d, total, scope, change, figures, trend, todo, recent, recentSales, actions, place: (user && user.place) || '' };
}

function greeting(h) { return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

export default function MHomeScreen() {
  const { ready, tick, ctx } = useAppData(['gc:actions', 'gc:meet'], { every: 60000 });
  const loc = useLocale();
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!ready || !ctx) return undefined;
    const id = window.setTimeout(() => setData(safe(() => build(ctx), null)), 0);
    return () => window.clearTimeout(id);
  }, [ready, tick, ctx]);

  const user = ctx ? ctx.user : null;
  const shop = useMemo(() => (ready ? safe(() => businessProfile().brand.name, '') : ''), [ready, tick]) || 'Your shop';
  const first = user ? firstName(user) : '';
  const now = data ? new Date(data.now) : null;
  const dateLine = now ? now.toLocaleDateString(loc === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ' ';
  const weekTotal = data ? data.trend.reduce((a, t) => a + t.total, 0) : 0;
  const peak = data ? Math.max(1, ...data.trend.map((t) => t.total)) : 1;
  const hasOnline = ctx ? hasModule('online', ctx.ed) : true;

  return (
    <AppScreen name="MHome" title="Home">
      <Content top={47} bottom={0}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px 0 20px' }}>
          <Link href="/m-more" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', flex: '1' }}>
            <Avatar text={user ? user.initials || initials(user.name) : ''} size={40} />
            <span style={{ minWidth: '0' }}>
              <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{shop}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                <span className="ell">{data ? data.place || shop : ' '}</span>
                <Icon name="down" size={16} stroke={2} />
              </span>
            </span>
          </Link>
          <LangSwitch />
          {ctx && canUse('/m-scan', ctx) ? <IconButton icon="scan" label="Scan a barcode" href="/m-scan" soft /> : null}
          <IconButton icon="bell" label="Notifications" href="/m-notifications" soft dot={!!(data && data.todo.length)} />
        </div>

        <div className="big" style={{ paddingTop: '18px' }}>
          <div className="eyebrow" lang={loc === 'bn' ? 'bn' : undefined}>{dateLine}</div>
          <h1>{now ? greeting(now.getHours()) : 'Hello'}{first ? <>, <span>{first}</span></> : null}</h1>
        </div>

        <div className="card" style={{ margin: '18px 20px 0', padding: '18px 20px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff', boxShadow: '0 16px 30px -18px rgba(0,48,135,.7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-xs-plus)', opacity: '.8' }}>{data ? data.scope.label : 'Sales today'}</span>
            {data && data.change != null ? (
              <span className="pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{`${data.change >= 0 ? '▲' : '▼'} ${Math.abs(data.change)}% vs last ${WEEKDAYS[now.getDay()]}`}</span>
            ) : null}
          </div>
          <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', marginTop: '4px' }}>{data ? money(data.total) : '—'}</div>
          <div style={{ display: 'flex', gap: '22px', marginTop: '10px', fontSize: 'var(--text-xs-plus)' }}>
            {(data ? data.figures : [['—', hasOnline ? 'Orders' : 'Sales'], ['—', hasOnline ? 'To ship' : 'Returns'], ['—', hasOnline ? 'Avg. order' : 'Avg. sale']]).map(([v, k]) => (
              <span key={k}>
                <b className="num" style={{ fontSize: 'var(--text-lg)', display: 'block' }}>{v}</b>
                <span style={{ opacity: '.75' }}>{k}</span>
              </span>
            ))}
          </div>
        </div>

        {data && data.actions.length ? (
          <TileGrid cols={4}>
            {data.actions.map(([href, label, icon]) => <Tile key={href} href={href} icon={icon} label={label} />)}
          </TileGrid>
        ) : null}

        <Section title="Needs you" action={data && data.todo.length && ctx && canUse('/m-notifications', ctx) ? { label: 'See all', href: '/m-notifications' } : null}>
          {!data ? <Skeleton rows={3} /> : data.todo.length ? (
            <Card>
              {data.todo.slice(0, 4).map((x) => (
                <ListRow
                  key={x.key}
                  href={x.href}
                  icon={x.icon}
                  title={x.label}
                  sub={x.sub || (x.item && x.since ? `Oldest waiting ${ageText(ageOf(x.item, data.now))}` : '')}
                  pill={{ tone: SEV_TONE[x.severity] || 'nav', n: x.n }}
                />
              ))}
            </Card>
          ) : (
            <Card><EmptyState icon="check" title="All caught up" /></Card>
          )}
        </Section>

        <Section title="This week" action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{data ? money(weekTotal) : ''}</span>}>
          <div className="card" style={{ margin: '0 20px', padding: '16px 16px 12px', display: 'flex', gap: '8px', alignItems: 'flex-end', height: '118px' }} role="img" aria-label={data ? `Sales in the last 7 days: ${money(weekTotal)}` : 'Sales in the last 7 days'}>
            {(data ? data.trend : Array.from({ length: 7 }, (_, i) => ({ from: i, total: 0, today: i === 6 }))).map((t) => (
              <span key={t.from} style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }} title={data ? money(t.total) : undefined}>
                <span style={{ width: '100%', height: Math.max(4, Math.round((t.total / peak) * 73)) + 'px', borderRadius: 'var(--radius-md)', background: t.today ? '#003087' : '#dbe6f7' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{data ? DAYS[new Date(t.from).getDay()] : ' '}</span>
              </span>
            ))}
          </div>
        </Section>

        {data && data.recentSales.length ? (
          <Section title={data.scope.kind === 'me' ? 'My recent sales' : 'Recent sales'}>
            <Card>
              {data.recentSales.map((x) => (
                <ListRow
                  key={x.id}
                  avatar={<Avatar text={initials(x.party)} tone={{ bg: '#e0f3fb', fg: '#003087' }} />}
                  title={x.party}
                  sub={<><span className="mono">{x.id}</span> · {ago(x.at, data.now)}</>}
                  end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(x.amount)}</span>}
                  chevron={false}
                />
              ))}
            </Card>
          </Section>
        ) : null}

        {data && data.recent.length ? (
          <Section title={hasOnline ? 'Recent orders' : 'Recent sales'} action={ctx && canUse('/m-orders', ctx) ? { label: 'See all', href: '/m-orders' } : null}>
            <Card>
              {data.recent.map((o) => {
                const s = orderStatus(o.statusKey);
                return (
                  <ListRow
                    key={o.id}
                    href={canUse('/m-orders', ctx) ? '/m-order-detail?id=' + encodeURIComponent(o.id) : undefined}
                    avatar={<Avatar text={o.initials || initials(o.customer)} tone={{ bg: '#e0f3fb', fg: '#003087' }} />}
                    title={o.customer || 'Walk-in customer'}
                    sub={<><span className="mono">{o.id}</span> · {ago(o.at, data.now)}{s ? ' · ' + s.label : ''}</>}
                    end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(o.amount)}</span>}
                    chevron={false}
                  />
                );
              })}
            </Card>
          </Section>
        ) : null}
        <div style={{ height: '8px' }} />
      </Content>
    </AppScreen>
  );
}

