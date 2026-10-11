'use client';
// Merchant app · Notifications (/m-notifications). The design board's layout (design/templates/app/MNotifications.dc.html)
// with live data: what the web top bar's bell and Home's "Needs you" tell the team, read from the shared books.
//   Orders    new online orders waiting (On hold / Processing / Pending), orders ready for the courier, and in the
//             Retail edition the latest counter sales (lib/orders.js)
//   Stock     low stock per place (reports/dailySummary › low, the same list as Home and the 8 PM summary)
//   Payments  late payouts, payouts that arrived, the evening check (lib/settlements.js › duePrompts, the bell's
//             "Did the expected money reach your bank?"), supplier bills past due (lib/supplierBills.js)
//   also      unread chats (lib/inbox.js), meetings starting soon or waiting for a note (lib/meetings.js › staffAlerts,
//             the bell's meeting rows), support tickets past their reply time (lib/supportTickets.js), money requests
//             waiting for approval (lib/approvals.js) and the open to-do items other pages reported (lib/actionItems.js)
// Each kind follows the edition (lib/edition.js) and this phone's choices (Settings › Notifications, gc.app.notify).
// A tap marks the row read and opens the app's screen for it, or the web page when the app has none (appNav.canUse).
// "Read all" marks every row read. Read state: this phone's gc.app.notes.read.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, AppBar, Content, Card, Chips, Icon, EmptyState, Skeleton, Note,
  useAppData, money, ago,
} from './kit/AppKit';
import { canUse } from './kit/appNav';
import { hasModule } from '@/lib/edition';
import { canSee } from '@/lib/team';
import { getOrders, isCounterSale } from '@/lib/orders';
import { NEW_KEYS, orderStatus } from '@/lib/orderStatus';
import { dailySummary } from '@/lib/reports/dailySummary';
import { clockNow, startOfDay, duePrompts, getPayouts, dayKey } from '@/lib/settlements';
import { getBills, billLeft, billStatus, supplierById } from '@/lib/supplierBills';
import { getConvs, lastLine, channelName } from '@/lib/inbox';
import { staffAlerts } from '@/lib/meetings';
import { waitingRequests } from '@/lib/approvals';
import { listItems } from '@/lib/actionItems';
import { getTickets, slaOf, ref as ticketRef } from '@/lib/supportTickets';
import { getNotify, NOTIFY_TYPES } from './settings/settingsData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const READ_KEY = 'gc.app.notes.read';
const DAY = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- read state (this phone) -------------------------------------------------------------------------------------
const readMap = () => { try { return JSON.parse(window.localStorage.getItem(READ_KEY)) || {}; } catch { return {}; } };
function markRead(keys) {
  const m = readMap();
  const now = Date.now();
  keys.forEach((k) => { m[k] = now; });
  // keep the newest 400
  const kept = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 400);
  try { window.localStorage.setItem(READ_KEY, JSON.stringify(Object.fromEntries(kept))); window.dispatchEvent(new CustomEvent('gc:app')); } catch { /* ignore */ }
}

// web pages the app has a screen for (the rest open on the web)
const APP_OF = [
  [/^\/(merchant-orders|orders)(\?|$)/, () => '/m-orders'],
  [/^\/order-detail\?id=([^&]+)/, (m) => '/m-order-detail?id=' + m[1]],
  [/^\/stock(\?|$)/, () => '/m-stock'],
  [/^\/merchant-inbox(\?|$)/, () => '/m-inbox'],
  [/^\/settlements(\?|$)/, () => '/m-payouts'],
  [/^\/dues(\?|$)/, () => '/m-dues'],
  [/^\/(purchase-orders|purchases)(\?|$)/, () => '/m-purchase'],
  [/^\/support-tickets(\?|$)/, () => '/m-tickets'],
  [/^\/tasks(\?|$)/, () => '/m-tasks'],
  [/^\/(all-products|products)(\?|$)/, () => '/m-products'],
];
/** The app's screen for a web address when the person can use it, else the web address. */
export function appHref(web, ctx) {
  const href = String(web || '');
  if (href.startsWith('/m-')) return canUse(href.split('?')[0], ctx) ? href : '/m-home';
  for (const [re, to] of APP_OF) {
    const m = href.match(re);
    if (m) { const a = to(m); if (canUse(a.split('?')[0], ctx)) return a; }
  }
  return href || '/m-home';
}
const orderHref = (id, ctx) => appHref('/order-detail?id=' + encodeURIComponent(id), ctx);

/** Every notification for this person and edition, newest first: { key, cat, kind, icon, title, sub, at, href }. */
export function buildNotifications(ctx, { prefs = getNotify() } = {}) {
  const { ed, user } = ctx;
  const has = (m) => hasModule(m, ed);
  const sees = (id) => safe(() => canSee(user, id), true);
  const now = clockNow();
  const out = [];
  const add = (n) => out.push({ at: now, ...n });
  const d = safe(() => dailySummary(startOfDay(now), now), null);

  // ---- orders ----
  if (prefs.orders && has('commerce')) {
    const orders = safe(() => getOrders(), []);
    if (has('online')) {
      orders.filter((o) => !isCounterSale(o) && NEW_KEYS.includes(o.statusKey) && o.at > now - 3 * DAY).sort((a, b) => b.at - a.at).slice(0, 6).forEach((o) => {
        const s = orderStatus(o.statusKey);
        add({ key: 'order:' + o.id, cat: 'orders', kind: 'orders', icon: 'bag', title: `New order ${o.id}`, sub: [o.customer, money(o.amount), o.payment === 'Paid' ? 'Paid' : o.payment || (s && s.label)].filter(Boolean).join(' · '), at: o.at, href: orderHref(o.id, ctx) });
      });
      const ready = orders.filter((o) => !isCounterSale(o) && o.statusKey === 'ready');
      if (ready.length) add({ key: 'to-courier:' + ready.length + ':' + dayKey(now), cat: 'orders', kind: 'orders', icon: 'truck', title: `${ready.length} ${ready.length === 1 ? 'order' : 'orders'} ready for the courier`, sub: 'Packed and waiting for pickup', href: appHref('/merchant-orders?status=ready', ctx) });
    } else {
      orders.filter((o) => isCounterSale(o) && o.at > now - DAY).sort((a, b) => b.at - a.at).slice(0, 3).forEach((o) => {
        add({ key: 'sale:' + o.id, cat: 'orders', kind: 'orders', icon: 'cart', title: `Counter sale ${o.id}`, sub: [o.channel.replace(/^POS\s*·?\s*/, ''), money(o.amount), o.method || o.payment].filter(Boolean).join(' · '), at: o.at, href: orderHref(o.id, ctx) });
      });
    }
  }

  // ---- stock ----
  if (prefs.stock && has('catalog') && d && sees('stock-list')) {
    d.low.items.slice(0, 4).forEach((r) => add({
      key: `low:${r.sku}@${r.place}:${r.available}`, cat: 'stock', kind: 'stock', icon: 'box', title: `${r.available ? 'Low stock' : 'Out of stock'}: ${r.name}`,
      sub: `${r.available} left at ${r.place}`, href: appHref('/stock', ctx),
    }));
    if (d.low.count > 4) add({ key: 'low-more:' + d.low.count + ':' + dayKey(now), cat: 'stock', kind: 'stock', icon: 'layers', title: `${d.low.count - 4} more items running low`, sub: 'See the stock list', at: now - 1, href: appHref('/stock', ctx) });
  }

  // ---- payments ----
  if (prefs.payouts && has('money') && sees('acc-settle')) {
    const prompts = safe(() => duePrompts(now), { count: 0, pays: [] });
    if (prompts.count) {
      const total = prompts.pays.reduce((a, p) => a + p.net, 0);
      add({ key: 'evening:' + dayKey(now) + ':' + prompts.count, cat: 'payments', kind: 'payouts', icon: 'wallet', title: total ? `Did ${money(total)} reach your bank?` : 'Check today’s payouts', sub: 'Tap to answer the payout check', href: canUse('/m-payouts', ctx) ? '/m-payouts' : '/settlements?check=1' });
    }
    const late = d ? d.payouts.late : [];
    const short = (t) => { const x = new Date(t); return x.getDate() + ' ' + MONTHS[x.getMonth()]; };
    if (late.length > 2) {
      // many late payouts are one row (the web Home's "Check payouts")
      const oldest = Math.min(...late.map((p) => p.due));
      add({ key: 'payouts-late:' + late.map((p) => p.id).join(','), cat: 'payments', kind: 'payouts', icon: 'alert', title: `${late.length} payouts are late`, sub: `${money(d.payouts.lateTotal)} · the oldest was due ${short(oldest)}`, at: Math.max(...late.map((p) => p.due)), href: appHref('/settlements', ctx) });
    } else {
      late.forEach((p) => add({ key: 'payout-late:' + p.id, cat: 'payments', kind: 'payouts', icon: 'alert', title: `Payout late: ${p.partner}`, sub: `${money(p.amount)} was due ${short(p.due)}`, at: p.due, href: appHref('/settlements', ctx) }));
    }
    safe(() => getPayouts(now), []).filter((p) => p.status === 'received' && p.at && p.at > now - 3 * DAY).sort((a, b) => b.at - a.at).slice(0, 4).forEach((p) => add({
      key: 'payout-in:' + p.id, cat: 'payments', kind: 'payouts', icon: 'wallet', title: 'Payout received',
      sub: `${(p.p && (p.p.short || p.p.name)) || p.partner} · ${money(p.received != null ? p.received : p.net)} for ${p.items.length} ${p.items.length === 1 ? 'order' : 'orders'}`, at: p.at, href: appHref('/settlements', ctx),
    }));
  }
  if (prefs.payouts && has('money') && sees('acc-dues')) {
    safe(() => getBills(), []).filter((b) => billLeft(b) > 0 && billStatus(b) === 'Overdue').sort((a, b) => b.due - a.due).slice(0, 3).forEach((b) => add({
      key: 'bill:' + b.no, cat: 'payments', kind: 'payouts', icon: 'receipt', title: `Supplier bill past due: ${safe(() => supplierById(b.supplier).name, b.supplier)}`,
      sub: `${money(billLeft(b))} left to pay · ${b.no}`, at: b.due, href: appHref('/dues?tab=owe', ctx),
    }));
  }

  // ---- messages ----
  if (prefs.messages && has('comms')) {
    if (sees('inbox')) {
      safe(() => getConvs(), []).filter((c) => c.unread).map((c) => ({ c, last: c.messages[c.messages.length - 1] || {} })).sort((a, b) => (b.last.at || 0) - (a.last.at || 0)).slice(0, 4).forEach(({ c, last }) => add({
        key: `chat:${c.id}:${last.id || last.at}`, cat: 'messages', kind: 'messages', icon: 'chat', title: `Message from ${c.name}`, sub: `${safe(() => channelName(c.ch), c.ch)} · ${safe(() => lastLine(c), '')}`, at: last.at || now,
        href: canUse('/m-chat', ctx) || canUse('/m-inbox', ctx) ? '/m-chat?id=' + encodeURIComponent(c.id) : '/merchant-inbox',
      }));
    }
    const meet = safe(() => staffAlerts(now), { soon: [], note: [] });
    meet.soon.forEach((m) => add({ key: 'meet-soon:' + m.id, cat: 'messages', kind: 'messages', icon: 'calendar', title: `Meeting at ${new Date(m.at).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })}: ${m.with.name}`, sub: m.title, at: m.at, href: '/meetings?id=' + encodeURIComponent(m.id) }));
    meet.note.slice(0, 3).forEach((m) => add({ key: 'meet-note:' + m.id, cat: 'messages', kind: 'messages', icon: 'edit', title: `Add a note: ${m.with.name}`, sub: m.title, at: m.at, href: '/meetings?id=' + encodeURIComponent(m.id) }));
    if (sees('tickets')) {
      safe(() => getTickets(), []).filter((t) => slaOf(t, now).late).slice(0, 3).forEach((t) => add({
        key: 'ticket-late:' + t.id + ':' + t.updatedAt, cat: 'messages', kind: 'messages', icon: 'ticket', title: `Reply overdue: ${ticketRef(t)}`, sub: `${t.customer} · ${t.subject}`, at: t.updatedAt,
        href: canUse('/m-ticket-detail', ctx) || canUse('/m-tickets', ctx) ? '/m-ticket-detail?id=' + t.id : '/support-tickets',
      }));
    }
  }

  // ---- approvals ----
  if (prefs.approvals && has('money') && sees('acc-home')) {
    safe(() => waitingRequests(), []).filter((r) => !user || r.by !== user.id).slice(0, 4).forEach((r) => add({
      key: 'approval:' + r.id, cat: 'payments', kind: 'approvals', icon: 'check', title: `Approve: ${r.title}`, sub: `${money(r.amount)} · asked by ${r.byName}`, at: r.at, href: '/money-approvals',
    }));
  }

  // ---- the to-do other pages reported (Home's own keys are already above) ----
  const OWN = ['orders:verify', 'orders:to-courier', 'inbox:chats', 'finance:late-payouts', 'finance:supplier-bills', 'stock:restock'];
  safe(() => listItems({ user, now }), []).filter((r) => !OWN.includes(r.key) && r.href).slice(0, 5).forEach((r) => add({
    key: 'todo:' + r.key + ':' + (r.n || ''), cat: 'todo', kind: null, icon: 'tasks', title: r.label + (r.n && !String(r.label).includes(String(r.n)) ? ` (${r.n})` : ''), sub: r.sub || 'Needs you', at: r.since || r.firstSeen || now, href: appHref(r.href, ctx),
  }));

  return out.sort((a, b) => b.at - a.at);
}

/** How many notifications this phone has not read (for the bell's dot on Home). */
export function unreadNotifications(ctx) {
  const m = readMap();
  return safe(() => buildNotifications(ctx).filter((n) => !m[n.key]).length, 0);
}

const CHIPS = [['all', 'All'], ['orders', 'Orders'], ['stock', 'Stock'], ['payments', 'Payments']];

function NoteRow({ n, unread, onOpen }) {
  return (
    <Link className="row" href={n.href} onClick={() => onOpen(n)} style={{ alignItems: 'flex-start' }}>
      <span className="ico"><Icon name={n.icon} /></span>
      <span className="m">
        <span className="t" style={{ display: 'block', fontWeight: unread ? 'var(--weight-semibold)' : 'var(--weight-medium)' }}>{n.title}</span>
        {n.sub ? <span className="s" style={{ display: 'block' }}>{n.sub}</span> : null}
        <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>{n.when}</span>
      </span>
      {unread ? <span style={{ flex: 'none', width: '9px', height: '9px', marginTop: '8px', borderRadius: 'var(--radius-full)', background: 'var(--sky)' }} role="img" aria-label="Unread" /> : null}
    </Link>
  );
}

export default function MNotificationsScreen() {
  const { ready, tick, ctx } = useAppData(['gc:meet', 'gc:meetings', 'gc:tickets', 'gc:app-settings', 'gc:settle', 'gc:actions'], { every: 60000 });
  const [cat, setCat] = useState('all');
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!ready || !ctx) return undefined;
    const id = window.setTimeout(() => {
      const prefs = getNotify();
      setData({ list: safe(() => buildNotifications(ctx, { prefs }), []), read: readMap(), now: clockNow(), prefs });
    }, 0);
    return () => window.clearTimeout(id);
  }, [ready, tick, ctx]);

  // a chip per kind the edition has and this person gets
  const chips = useMemo(() => {
    if (!ctx || !data) return CHIPS.map(([key, label]) => ({ key, label }));
    const show = { orders: hasModule('commerce', ctx.ed), stock: hasModule('catalog', ctx.ed), payments: hasModule('money', ctx.ed) };
    return CHIPS.filter(([k]) => k === 'all' || (show[k] && data.list.some((n) => n.cat === k))).map(([key, label]) => ({ key, label: key === 'orders' && !hasModule('online', ctx.ed) ? 'Sales' : label }));
  }, [ctx, data]);

  const list = data ? data.list.filter((n) => cat === 'all' || n.cat === cat) : [];
  const today = data ? startOfDay(data.now) : 0;
  const withWhen = list.map((n) => ({ ...n, when: n.at >= data.now - 30000 ? 'Now' : ago(n.at, data.now) }));
  const groups = [
    ['Today', withWhen.filter((n) => n.at >= today)],
    ['Earlier', withWhen.filter((n) => n.at < today).slice(0, 20)],
  ].filter(([, l]) => l.length);
  const unreadKeys = data ? data.list.filter((n) => !data.read[n.key]).map((n) => n.key) : [];
  const off = data && ctx ? NOTIFY_TYPES.filter((t) => (!t.module || hasModule(t.module, ctx.ed)) && !data.prefs[t.key]) : [];

  const open = (n) => { markRead([n.key]); };
  const readAll = () => {
    if (!unreadKeys.length) return;
    markRead(unreadKeys);
    setData((d0) => (d0 ? { ...d0, read: readMap() } : d0));
  };

  return (
    <AppScreen name="MNotifications" title="Notifications">
      <AppBar
        title="Notifications"
        back="/m-home"
        actions={(
          <button type="button" className="tap" onClick={readAll} disabled={!unreadKeys.length}
            style={{ padding: '0 12px', height: '36px', border: 0, background: 'none', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: unreadKeys.length ? 'var(--brand)' : 'var(--muted)', cursor: unreadKeys.length ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
            Read all
          </button>
        )}
      />
      <Content top={103} bottom={0}>
        <Chips items={chips} value={cat} onChange={setCat} style={{ marginTop: '4px' }} />
        {off.length ? (
          <Link href="/m-settings?sheet=notify" style={{ display: 'block', margin: '14px 20px 0' }}>
            <Note tone="info" icon="bell">{off.length === 1 ? `${off[0].label} alerts are off on this phone.` : `${off.length} kinds of alerts are off on this phone.`} <span style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }}>Change</span></Note>
          </Link>
        ) : null}
        {!data ? <div style={{ marginTop: '18px' }}><Skeleton rows={4} /></div> : groups.length ? groups.map(([label, rows], i) => (
          <React.Fragment key={label}>
            <div className="sec" style={i === 0 ? { marginTop: '18px' } : undefined}><h2>{label}</h2></div>
            <Card>
              {rows.map((n) => <NoteRow key={n.key} n={n} unread={!data.read[n.key]} onOpen={open} />)}
            </Card>
          </React.Fragment>
        )) : (
          <Card style={{ marginTop: '18px' }}><EmptyState icon="bell" title={cat === 'all' ? 'You are all caught up' : 'Nothing here right now'} /></Card>
        )}
        <div style={{ height: '8px' }} />
      </Content>
    </AppScreen>
  );
}
