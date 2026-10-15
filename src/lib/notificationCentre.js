// notificationCentre — what the bell in the top bar and the Notifications page (/notifications) show, and each
// person's notification settings (MS-F12). Nothing here is sample data: every row is read from the shared books.
//   feed({ user, now })   the person's notifications, newest first:
//     orders     new online orders waiting to be checked (orders.js, last 3 days)
//     dues       invoices past their due date (invoices.js)
//     stock      products running low (stock.js, LOW_AT)
//     payouts    payouts that are late (settlements.js)
//     approvals  money waiting for someone's approval (approvals.js)
//     meetings   meetings that ended without a note (meetings.js)
//     tickets    new and urgent support tickets (supportTickets.js)
//     mentions   notes that @mention a person and new social mentions (inbox.js)
//     todo       the other open to-do items pages reported (actionItems.js: verify orders, pay suppliers …)
//   Each row: { id, type, icon, title, detail, at, href, severity }. Only types in the edition (edition.js), pages the
//   person can open (team.js canSee) and types they keep "In the app" are shown.
//   Read state per person: isRead / markRead / markAllRead / unreadCount (gc.notify.read).
//   Settings per person: getPrefs / savePrefs (gc.notify.prefs): per type In the app · Sound · Email · SMS, and quiet
//   hours (no sound). A sound plays in this browser (chime); email and SMS are sent by the server once it is built —
//   this front end only keeps the choice (a code comment, never a "sent" message).
// Events: NOTIFY_EVENT ('gc:notify') when read state or settings change. Front end only, kept in this browser.

import { getOrders, isCounterSale } from './orders';
import { getInvoices, isOverdue, dueDateOf } from './invoices';
import { getCatalog, stockAt, isVirtualRow, LOW_AT } from './stock';
import { settlementSummary, partnerBy, clockNow } from './settlements';
import { waitingRequests } from './approvals';
import { getMeetings, needsNote } from './meetings';
import { getTickets, isHot, ref as ticketRef } from './supportTickets';
import { teamMentions, getMentions } from './inbox';
import { listItems } from './actionItems';
import { currentUser, canSee } from './team';
import { hasModule } from './edition';
import { formatBDT } from './format';

export const NOTIFY_EVENT = 'gc:notify';
/** [type, label, icon (lucide), module, page id the person must be able to open] */
export const TYPES = [
  ['orders', 'New orders', 'shopping-cart', 'online', 'orders-all'],
  ['dues', 'Payments due', 'file-clock', 'money', 'sales-invoices'],
  ['stock', 'Low stock', 'package', 'catalog', 'stock-list'],
  ['payouts', 'Late payouts', 'wallet', 'money', 'acc-settle'],
  ['approvals', 'Approvals', 'badge-check', 'money', 'acc-approvals'],
  ['meetings', 'Meeting notes', 'video', 'comms', 'meetings'],
  ['tickets', 'Support tickets', 'life-buoy', 'comms', 'tickets'],
  ['mentions', 'Mentions', 'at-sign', 'comms', 'inbox-mentions'],
  ['todo', 'To-do', 'list-checks', '', ''],
];
export const typeBy = (k) => TYPES.find((t) => t[0] === k) || TYPES[TYPES.length - 1];
export const CHANNELS = [['app', 'In the app'], ['sound', 'Sound'], ['email', 'Email'], ['sms', 'SMS']];
const DEFAULT_ON = { app: true, sound: false, email: false, sms: false };
const DEFAULTS = {
  types: Object.fromEntries(TYPES.map(([k]) => [k, { ...DEFAULT_ON, ...(k === 'orders' ? { sound: true } : {}), ...(k === 'payouts' || k === 'approvals' ? { email: true } : {}) }])),
  quiet: { on: true, from: '22:00', to: '08:00' },
};

const DAY = 864e5;
const ssr = () => typeof window === 'undefined';
const safe = (fn, d) => { try { return fn(); } catch { return d; } };
const readJSON = (k, d) => { try { return JSON.parse(window.localStorage.getItem(k)) || d; } catch { return d; } };
const writeJSON = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const announce = () => { try { window.dispatchEvent(new CustomEvent(NOTIFY_EVENT)); } catch { /* ignore */ } };
const meOf = (u) => (u && u.id) || safe(() => currentUser().id, 'me');
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

// ---- settings ----------------------------------------------------------------------------------------
const PREFS_KEY = 'gc.notify.prefs';
export function getPrefs(user) {
  if (ssr()) return DEFAULTS;
  const p = readJSON(PREFS_KEY, {})[meOf(user)] || {};
  return { types: Object.fromEntries(TYPES.map(([k]) => [k, { ...DEFAULTS.types[k], ...((p.types || {})[k] || {}) }])), quiet: { ...DEFAULTS.quiet, ...(p.quiet || {}) } };
}
export function savePrefs(prefs, user) {
  const all = readJSON(PREFS_KEY, {});
  all[meOf(user)] = prefs;
  writeJSON(PREFS_KEY, all);
  announce();
}
/** Is it quiet hours now (no sound)? */
export function isQuiet(prefs, now = clockNow()) {
  if (!prefs.quiet || !prefs.quiet.on) return false;
  const mins = (s) => { const [h, m] = String(s || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const d = new Date(now); const t = d.getHours() * 60 + d.getMinutes();
  const a = mins(prefs.quiet.from), b = mins(prefs.quiet.to);
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// ---- read state --------------------------------------------------------------------------------------
const READ_KEY = 'gc.notify.read';
const readState = (user) => (ssr() ? { seen: {}, before: 0 } : { seen: {}, before: 0, ...(readJSON(READ_KEY, {})[meOf(user)] || {}) });
export const isRead = (n, st) => !!(st.seen[n.id] || n.at <= (st.before || 0));
export function markRead(id, user) {
  const all = readJSON(READ_KEY, {});
  const me = meOf(user);
  const cur = { seen: {}, before: 0, ...(all[me] || {}) };
  cur.seen = { ...cur.seen, [id]: Date.now() };
  if (cur.unread && cur.unread[id]) { cur.unread = { ...cur.unread }; delete cur.unread[id]; }
  // keep the list short: entries read before the "all read" mark are covered by it
  const keys = Object.keys(cur.seen);
  if (keys.length > 400) keys.sort((a, b) => cur.seen[a] - cur.seen[b]).slice(0, keys.length - 400).forEach((k) => delete cur.seen[k]);
  all[me] = cur;
  writeJSON(READ_KEY, all);
  announce();
}
export function markUnread(id, user) {
  const all = readJSON(READ_KEY, {});
  const me = meOf(user);
  const cur = { seen: {}, before: 0, ...(all[me] || {}) };
  const seen = { ...cur.seen }; delete seen[id];
  all[me] = { ...cur, seen, unread: { ...(cur.unread || {}), [id]: true } };
  writeJSON(READ_KEY, all);
  announce();
}
export function markAllRead(user, now = clockNow()) {
  const all = readJSON(READ_KEY, {});
  all[meOf(user)] = { seen: {}, before: now, unread: {} };
  writeJSON(READ_KEY, all);
  announce();
}

// ---- the feed ----------------------------------------------------------------------------------------
let CACHE = { at: 0, key: '', rows: [] };
/** Throw away the cached feed (the bell and the page call it when the books change). */
export const refreshFeed = () => { CACHE = { at: 0, key: '', rows: [] }; };

function build(now) {
  const rows = [];
  const push = (r) => rows.push({ severity: 'normal', ...r });
  // new online orders waiting to be checked
  if (hasModule('online')) {
    safe(() => getOrders(), []).filter((o) => !isCounterSale(o) && ['onhold', 'processing', 'pending'].includes(o.statusKey) && o.at > now - 3 * DAY && o.at <= now)
      .sort((a, b) => b.at - a.at).slice(0, 12)
      .forEach((o) => push({ id: 'order:' + o.id, type: 'orders', title: 'New order ' + o.id, detail: [o.customer, money(o.amount), o.status].filter(Boolean).join(' · '), at: o.at, href: '/order-detail?id=' + encodeURIComponent(o.id), severity: 'high' }));
  }
  // invoices past their due date
  if (hasModule('money')) {
    safe(() => getInvoices(), []).filter((inv) => isOverdue(inv, now)).sort((a, b) => dueDateOf(b) - dueDateOf(a)).slice(0, 8)
      .forEach((inv) => push({ id: 'due:' + inv.id + ':' + Math.round(inv.due), type: 'dues', title: 'Payment due · ' + inv.id, detail: `${(inv.customer && inv.customer.name) || 'Customer'} · ${money(inv.due)} owed`, at: Math.min(now, dueDateOf(inv)), href: '/sales-invoice?id=' + encodeURIComponent(inv.id) }));
  }
  // products running low (one row a day per product while it stays low)
  if (hasModule('catalog')) {
    const today = startOfDay(now);
    safe(() => getCatalog().filter((r) => !isVirtualRow(r) && r.st !== 'archived' && r.st !== 'deleted' && r.st !== 'draft')
      .map((r) => ({ r, left: stockAt(r.sku).available })).filter((x) => x.left <= LOW_AT).sort((a, b) => a.left - b.left).slice(0, 6), [])
      .forEach(({ r, left }) => push({ id: 'stock:' + r.sku + ':' + today, type: 'stock', title: (left <= 0 ? 'Out of stock: ' : 'Low stock: ') + String(r.name).split(' · ')[0], detail: `${Math.max(0, left)} left · ${r.sku}`, at: today, href: '/stock?q=' + encodeURIComponent(r.sku), severity: left <= 0 ? 'high' : 'normal' }));
  }
  // late payouts
  if (hasModule('money')) {
    safe(() => settlementSummary(now).late, []).slice(0, 6).forEach((p) => {
      const partner = safe(() => partnerBy(p.partner).name, p.partner);
      push({ id: 'payout:' + p.id, type: 'payouts', title: 'Late payout · ' + partner, detail: `${money(p.net)} was due ${new Date(p.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, at: Math.min(now, p.due + DAY), href: '/settlements', severity: 'critical' });
    });
    // money waiting for approval
    safe(() => waitingRequests(), []).slice(0, 8).forEach((r) => push({ id: 'approval:' + r.id, type: 'approvals', title: 'Waiting for approval · ' + money(r.amount), detail: [r.title, r.byName].filter(Boolean).join(' · '), at: r.at, href: '/money-approvals', severity: 'high' }));
  }
  if (hasModule('comms')) {
    // meetings that ended without a note
    safe(() => getMeetings().filter((m) => needsNote(m, now)), []).slice(0, 6)
      .forEach((m) => push({ id: 'meet:' + m.id, type: 'meetings', title: 'Write meeting notes', detail: `${m.title || 'Meeting'} · ${(m.with && m.with.name) || ''}`, at: Math.min(now, m.at + (m.mins || 30) * 60000), href: '/meetings?id=' + encodeURIComponent(m.id) }));
    // new and urgent support tickets
    safe(() => getTickets().filter((t) => t.status === 'New' || isHot(t, now)), []).slice(0, 8)
      .forEach((t) => push({ id: 'ticket:' + t.id + (isHot(t, now) ? ':hot' : ''), type: 'tickets', title: (isHot(t, now) ? 'Reply soon · ' : 'New ticket · ') + ticketRef(t), detail: [t.customer, t.subject].filter(Boolean).join(' · '), at: t.createdAt || now, href: '/support-tickets?id=' + encodeURIComponent(t.id), severity: isHot(t, now) ? 'high' : 'normal' }));
    // notes that mention you, and new social mentions of the shop
    safe(() => teamMentions(), []).slice(0, 6).forEach((m) => push({ id: 'mention:' + m.id, type: 'mentions', title: `${m.by || 'Someone'} mentioned you`, detail: `${m.name} · ${String(m.text || '').slice(0, 80)}`, at: m.at, href: '/merchant-inbox?c=' + encodeURIComponent(m.convId) }));
    safe(() => getMentions().filter((m) => m.status === 'new'), []).slice(0, 6).forEach((m) => push({ id: 'social:' + m.id, type: 'mentions', title: `${m.name || m.handle || 'Someone'} mentioned the shop`, detail: String(m.text || m.caption || '').slice(0, 80), at: m.at || now, href: '/merchant-inbox?view=mentions' }));
  }
  return rows;
}
// to-do items the pages reported that the rows above don't already cover
const COVERED = new Set(['finance:late-payouts', 'meetings:notes', 'stock:restock']);
function todoRows(user, now) {
  return safe(() => listItems({ user, now }), []).filter((r) => !COVERED.has(r.key) && r.href).map((r) => ({
    id: 'todo:' + r.key + ':' + (r.since || r.firstSeen || 0), type: 'todo', title: r.label + (r.n != null && r.n !== '' ? ' · ' + r.n : ''), detail: r.value ? money(r.value) + ' at stake' : 'Needs someone',
    at: Math.min(now, r.since || r.firstSeen || now), href: r.href, severity: r.severity || 'normal',
  }));
}

/** The person's notifications, newest first, each with `read`. opts: { user, now, all (ignore "In the app" off) } */
export function feed({ user, now = clockNow(), all = false } = {}) {
  if (ssr()) return [];
  const u = user || safe(() => currentUser(), null);
  const key = (u && u.id) || '';
  if (!(CACHE.key === key && now - CACHE.at < 15000)) CACHE = { at: now, key, rows: [...build(now), ...todoRows(u, now)] };
  const prefs = getPrefs(u);
  const st = readState(u);
  const can = (t) => { const [, , , mod, page] = typeBy(t); return (!mod || hasModule(mod)) && (!page || !u || canSee(u, page)); };
  return CACHE.rows
    .filter((n) => can(n.type) && (all || prefs.types[n.type].app !== false))
    .map((n) => ({ ...n, icon: typeBy(n.type)[2], read: !(st.unread || {})[n.id] && isRead(n, st) }))
    .sort((a, b) => b.at - a.at);
}
export const unreadCount = (opts) => feed(opts).filter((n) => !n.read).length;

/** "now", "5 min", "3 h", "2 d", or a date. */
export function agoText(at, now = clockNow()) {
  const m = Math.round((now - at) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return m + ' min';
  const h = Math.round(m / 60);
  if (h < 24) return h + ' h';
  const d = Math.round(h / 24);
  return d < 7 ? d + ' d' : new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** A short two-note chime (the bell's sound), unless it is quiet hours. Browsers allow it after the first tap. */
export function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = chime.ctx || (chime.ctx = new AC());
    [[880, 0], [1320, 0.12]].forEach(([f, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.3);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.32);
    });
  } catch { /* no sound */ }
}
