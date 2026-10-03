// events — one event shape for everything the shop tracks, and the intake that cleans it (Nayeem's brief #14,
// "one canonical Grid event, mapped to each platform; dedup by event identity").
//
// An event: { event_id, name, occurred_at, received_at, source, schema_version, order_id, customer_id, value,
//             currency, consent, dedup_key }
//   name      one of EVENT_NAMES (page_view … refunded)
//   source    'browser' (the store's pixel) · 'server' (GridCommerce) · 'courier' · 'gateway'
//   event_id  the same logical event sent by the browser and by the server carries the same id; the second copy is
//             dropped as a duplicate, so it is never counted twice
// intake(batch) → { accepted, duplicates, rejected: [{ event, reason }] } checks each event against the schema, drops
// ids already seen and keeps day counts (received, accepted, de-duplicated, rejected) by source and by name.
// eventHealth({ from, to }) reads them back for Event health; lastSeen(name, source) feeds the "event stopped" alert.
//
// Demo: syncDemoEvents() replays what the online orders did (placed, payment, shipped, delivered, returned) since the
// last sync, from the browser and the server as a real store would, with a few broken events. A real shop receives
// these on the tracking server; front end only (kept in this browser, gc.events).

import { getOnlineOrders } from './salesBook';

export const SCHEMA_VERSION = 1;
export const EVENT_NAMES = ['page_view', 'product_view', 'search', 'add_to_cart', 'begin_checkout', 'order_placed', 'payment_verified', 'shipped', 'delivered', 'returned', 'refunded'];
export const EVENT_LABEL = {
  page_view: 'Page view', product_view: 'Product view', search: 'Search', add_to_cart: 'Add to cart', begin_checkout: 'Checkout started',
  order_placed: 'Order placed', payment_verified: 'Payment verified', shipped: 'Shipped', delivered: 'Delivered', returned: 'Returned', refunded: 'Refunded',
};
export const SOURCES = ['browser', 'server', 'courier', 'gateway'];
export const SOURCE_LABEL = { browser: 'Browser (pixel)', server: 'Server', courier: 'Courier', gateway: 'Payment gateway' };
const VALUE_EVENTS = ['order_placed', 'payment_verified', 'delivered', 'returned', 'refunded', 'add_to_cart', 'begin_checkout'];

const KEY = 'gc.events';
const DAY = 864e5;
export const EVENTS_EVENT = 'gc:events';
const blank = () => ({ cursor: 0, seen: {}, days: {}, log: [], last: {} });
const ssr = () => typeof window === 'undefined';
function load() { if (ssr()) return blank(); try { return { ...blank(), ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return blank(); } }
function save(st) {
  // keep 14 days of ids and counts, the last 80 log rows
  const cut = Date.now() - 14 * DAY;
  Object.keys(st.seen).forEach((id) => { if (st.seen[id] < cut) delete st.seen[id]; });
  Object.keys(st.days).forEach((k) => { if (new Date(k + 'T00:00').getTime() < cut - DAY) delete st.days[k]; });
  st.log = st.log.slice(0, 80);
  try { window.localStorage.setItem(KEY, JSON.stringify(st)); window.dispatchEvent(new CustomEvent(EVENTS_EVENT)); } catch { /* full: counts stay for this page */ }
}
const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/** Why an event does not fit the schema, or '' when it does. */
export function checkEvent(e, now = Date.now()) {
  if (!e || typeof e !== 'object') return 'Not an event';
  if (!e.event_id) return 'No event ID';
  if (!EVENT_NAMES.includes(e.name)) return `Unknown event name “${e.name || ''}”`;
  if (!(Number(e.occurred_at) > 0)) return 'No time';
  if (e.occurred_at > now + 5 * 60 * 1000) return 'Time is in the future';
  if (!SOURCES.includes(e.source)) return 'Unknown source';
  if (VALUE_EVENTS.includes(e.name) && (e.value == null || Number.isNaN(Number(e.value)) || Number(e.value) < 0)) return 'Value missing or not a number';
  if (['order_placed', 'payment_verified', 'shipped', 'delivered', 'returned', 'refunded'].includes(e.name) && !e.order_id) return 'No order ID';
  return '';
}

/** Build an event in the standard shape. */
export function makeEvent({ event_id, name, occurred_at, source, order_id = '', customer_id = '', value = null, consent = 'granted' }) {
  return { event_id, name, occurred_at, received_at: null, source, schema_version: SCHEMA_VERSION, order_id, customer_id, value, currency: 'BDT', consent, dedup_key: name + ':' + (order_id || event_id) };
}

/**
 * Take a batch of events in. Each is checked, then dropped when its event_id was already received.
 * → { accepted: [...], duplicates: [...], rejected: [{ event, reason }] }
 */
export function intake(batch, now = Date.now()) {
  const st = load();
  const out = { accepted: [], duplicates: [], rejected: [] };
  (batch || []).forEach((raw) => {
    const e = { ...raw, received_at: now };
    const k = dayKey(e.occurred_at > 0 ? Math.min(e.occurred_at, now) : now);
    const d = st.days[k] || (st.days[k] = { received: 0, accepted: 0, deduped: 0, rejected: 0, source: {}, name: {}, both: 0 });
    d.received += 1;
    d.source[e.source] = (d.source[e.source] || 0) + 1;
    const reason = checkEvent(e, now);
    let status;
    if (reason) { d.rejected += 1; d.reasons = d.reasons || {}; d.reasons[reason] = (d.reasons[reason] || 0) + 1; out.rejected.push({ event: e, reason }); status = 'rejected'; }
    else if (st.seen[e.event_id]) { d.deduped += 1; out.duplicates.push(e); status = 'duplicate'; if (e.source !== st.seen['src:' + e.event_id]) d.both += 1; }
    else {
      st.seen[e.event_id] = e.occurred_at; st.seen['src:' + e.event_id] = e.source;
      d.accepted += 1; d.name[e.name] = (d.name[e.name] || 0) + 1;
      const lk = e.name + '|' + e.source;
      st.last[lk] = Math.max(st.last[lk] || 0, e.occurred_at);
      out.accepted.push(e); status = 'accepted';
    }
    st.log.unshift({ id: e.event_id, name: e.name, source: e.source, at: e.occurred_at, order: e.order_id || '', value: e.value, status, reason: reason || '' });
  });
  // ids of the source map are bookkeeping, not events: prune with the ids
  Object.keys(st.seen).forEach((id) => { if (id.startsWith('src:') && !st.seen[id.slice(4)]) delete st.seen[id]; });
  save(st);
  return out;
}

// ---- demo feed: what the online orders did, as browser + server events -------------------------------------------
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/** Events an online order produced up to `now`, oldest first. */
function orderEvents(o, now) {
  const h = hash(String(o.id));
  const id = String(o.id).replace(/^#/, '');
  const cust = o.phone ? 'c_' + String(o.phone).slice(-6) : '';
  const t = o.times || {};
  const list = [];
  const add = (name, at, source, extra = {}) => { if (at && at <= now) list.push(makeEvent({ event_id: `${name}_${id}`, name, occurred_at: at, source, order_id: o.id, customer_id: cust, value: o.subtotal, ...extra })); };
  const web = o.source === 'Website' || o.source === 'Facebook';
  // checkout from the store: the pixel and the server both send it (same id: one is a duplicate)
  if (web) {
    add('begin_checkout', o.at - 4 * 60 * 1000, 'browser');
    if (h % 7 !== 0) add('order_placed', o.at, 'browser', { consent: h % 5 === 0 ? 'denied' : 'granted' });   // some pixels blocked
    if (h % 41 === 3) list.push({ ...makeEvent({ event_id: `order_placed_${id}_x`, name: 'order_placed', occurred_at: o.at, source: 'browser', order_id: o.id, value: 'NaN' }) });   // broken pixel payload
  }
  add('order_placed', o.at + 1500, 'server');
  if (o.method === 'Gateway') add('payment_verified', o.at + 3 * 60 * 1000, 'gateway');
  add('shipped', t.shipped, 'courier');
  add('delivered', t.delivered, 'courier');
  if (t.delivered && h % 3 === 0) add('delivered', t.delivered + 40 * 1000, 'server');   // the courier webhook arrived twice
  add('returned', t.returned, 'courier');
  if (h % 97 === 11 && t.shipped) list.push(makeEvent({ event_id: `shipped_${id}_old`, name: 'shipped', occurred_at: t.shipped, source: 'courier', order_id: '' }));   // a courier update without the order
  return list;
}

/** Replay the online orders' events since the last sync (the last 7 days the first time). Safe to call on every open. */
export function syncDemoEvents(now = Date.now()) {
  if (ssr()) return null;
  const st = load();
  const from = st.cursor || now - 7 * DAY;
  if (now - from < 30 * 1000) return null;
  let orders = [];
  try { orders = getOnlineOrders(); } catch { orders = []; }
  const batch = orders.filter((o) => o.status !== 'Cancelled' || (o.times && o.times.cancelled)).flatMap((o) => orderEvents(o, now)).filter((e) => e.occurred_at >= from && e.occurred_at < now).sort((a, b) => a.occurred_at - b.occurred_at);
  const res = intake(batch, now);
  const st2 = load(); st2.cursor = now; save(st2);
  return res;
}

/** A test batch from Event health: one new event, the same event again from the server, one broken event. */
export function sendTestEvents(now = Date.now()) {
  const id = 'test_' + now.toString(36);
  return intake([
    makeEvent({ event_id: id, name: 'add_to_cart', occurred_at: now, source: 'browser', value: 1250, customer_id: 'c_test' }),
    makeEvent({ event_id: id, name: 'add_to_cart', occurred_at: now, source: 'server', value: 1250, customer_id: 'c_test' }),
    makeEvent({ event_id: id + '_bad', name: 'add_to_bag', occurred_at: now, source: 'browser', value: 1250 }),
  ], now);
}

/**
 * Counts for [from, to): { received, accepted, deduped, rejected, dedupRate, bySource: { source: n },
 *   byName: { name: n }, both, days: [{ day, received, accepted, deduped, rejected }], log, reasons: { reason: n } }
 */
export function eventHealth({ from, to }) {
  const st = load();
  const out = { received: 0, accepted: 0, deduped: 0, rejected: 0, both: 0, bySource: {}, byName: {}, days: [], log: [], reasons: {} };
  Object.entries(st.days).sort(([a], [b]) => (a < b ? -1 : 1)).forEach(([k, d]) => {
    const t = new Date(k + 'T00:00').getTime();
    if (t < from - DAY + 1 || t >= to) return;
    out.received += d.received; out.accepted += d.accepted; out.deduped += d.deduped; out.rejected += d.rejected; out.both += d.both || 0;
    Object.entries(d.source || {}).forEach(([s, n]) => { out.bySource[s] = (out.bySource[s] || 0) + n; });
    Object.entries(d.name || {}).forEach(([s, n]) => { out.byName[s] = (out.byName[s] || 0) + n; });
    Object.entries(d.reasons || {}).forEach(([s, n]) => { out.reasons[s] = (out.reasons[s] || 0) + n; });
    out.days.push({ day: t, received: d.received, accepted: d.accepted, deduped: d.deduped, rejected: d.rejected });
  });
  out.log = st.log.filter((r) => r.at >= from - DAY && r.at < to + DAY);
  out.dedupRate = out.received ? out.deduped / out.received : 0;
  return out;
}

/** When `name` (from `source`, or any source) was last accepted; 0 if never. */
export function lastSeen(name, source) {
  const st = load();
  if (source) return st.last[name + '|' + source] || 0;
  return Object.entries(st.last).filter(([k]) => k.startsWith(name + '|')).reduce((m, [, t]) => Math.max(m, t), 0);
}
