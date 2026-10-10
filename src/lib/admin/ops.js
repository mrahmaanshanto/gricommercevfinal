// admin/ops — Platform ops for the super admin (front end only; every figure is simulated, nothing is monitored live).
// Servers, APIs, integrations, resource limits and incidents. Measurements are worked out from the time (a fixed seed
// per minute / hour), so they "move" as the clock runs and a period always adds up the same; what staff change
// (retries, paused syncs, limit overrides, incidents) is kept in the browser: createStore key `ops` (gc.admin.ops).
//
// It agrees with what the rest of the admin says (lib/admin/company.js): one open incident, INC-114 "Steadfast webhooks
// delayed · 38 stores" (since 09:40 today; store 0031 Dhaka Gadget Hub; ticket T-2291), uptime 99.96% over 30 days, the
// same services and their uptime / P95, and the fleet's CPU, memory, disk and error rate (serverLoad). Ticket numbers
// INC-109, INC-103 and INC-097 (support.js) and INC-108 (an outage credit in lib/platform) are resolved incidents here.
//
//   Reading
//     services(t), serverLoad(t)        the same shapes as company.js (the dashboard and the menu card can switch to these)
//     UPTIME_30D                        99.96
//     SERVERS, servers(t)               each server now: cpu, ram, disk, net in/out, uptime, status
//     serverSeries(key|'all', range, t) points for 1h (per minute) · 24h · 7d (per hour): { label, title, cpu, ram, in, out }
//     database(t)                       connections, slow queries, replication lag, backups
//     QUEUES, queues(t), failedJobs(q, t)   background jobs: waiting, running, failed, retrying, oldest age
//     ENDPOINTS, endpoints(t), endpointDetail(id, t), apiTotals(t)    the API over the last 24 h
//     INTEGRATIONS, GROUPS, integrations(t), integration(key, t)       providers: status, success, failures, stores
//     LIMITS, planDefaults(db), limitsOf(db, shop, t), limitRows(db, t), overridesOf(shopId), limitLog(shopId?)
//     incidents(), incidentById(id), activeIncidents(), STATUSES, SEVERITIES, incidentStats(t)
//   Changing (each returns { ok, error? } and saves)
//     retryJobs(queue, ids|'all') · backupNow() · retryIntegration(key) · pauseIntegration(key, reason) · resumeIntegration(key)
//     setOverride(shopId, key, limit, reason, until) · removeOverride(shopId, key, reason)
//     declareIncident(f) · postUpdate(id, { status, text, notify }) · resolveIncident(id, note, notify) · reopenIncident(id) · setOwner(id, name)
//     linkTicket(id, ticketId) · savePostmortem(id, f)

import { createStore } from './store';
import { DAY, MIN, rng, startOfDay, at, hash, dmy } from '@/lib/platform/util';
import { db as platformDB, staff as currentStaff } from '@/lib/platform/store';
import { UNLIMITED, PLAN_NAME, LADDERS, PLAN_IDS } from '@/lib/platform/catalogue';
import { subOf, subState, isPaying, planOf } from '@/lib/platform/billing';
import { usageOf } from './merchants';
import { services as baseServices, serverLoad as baseLoad } from './company';

const H = 3600e3;
export const UPTIME_30D = 99.96;
const me = () => { try { return currentStaff().name; } catch { return 'Mahin Khan'; } };
const noise = (key, i) => rng(key + ':' + i)();
/** A smooth value in [0,1) that drifts over `step` units. */
const smooth = (key, x, step) => { const i = Math.floor(x / step); const f = x / step - i; const a = noise(key, i), b = noise(key, i + 1); return a + (b - a) * (f * f * (3 - 2 * f)); };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r1 = (v) => Math.round(v * 10) / 10;
const floorMin = (t) => Math.floor(t / MIN) * MIN;
const floorHour = (t) => Math.floor(t / H) * H;
/** Dhaka hour of the day, 0–23. */
const hourOf = (ms) => Math.floor(((ms + 6 * H) % DAY) / H);
/** How busy shops are at this hour (Bangladesh: lunch and late evening peaks, quiet before dawn). */
const CURVE = [0.35, 0.25, 0.18, 0.14, 0.12, 0.15, 0.25, 0.4, 0.6, 0.8, 0.95, 1.05, 1.1, 1.05, 0.95, 0.9, 0.9, 0.95, 1, 1.1, 1.2, 1.25, 1.1, 0.7];
const busy = (ms) => CURVE[hourOf(ms)];

// ==== servers =========================================================================================================
// Offsets around the fleet's level sum to zero, so the fleet average follows company.serverLoad (CPU, memory; a few points
// of drift so the charts move) with disk at 61% and the same error rate.
export const SERVERS = [
  { key: 'app-1', role: 'App server', region: 'Singapore · zone a', size: '8 vCPU · 16 GB', cpu: 8, ram: -2, disk: 52, net: [42, 58], bootDays: 12, uptime30: 99.98 },
  { key: 'app-2', role: 'App server', region: 'Singapore · zone b', size: '8 vCPU · 16 GB', cpu: 6, ram: -4, disk: 51, net: [40, 55], bootDays: 12, uptime30: 99.98 },
  { key: 'worker-1', role: 'Background jobs', region: 'Singapore · zone a', size: '4 vCPU · 8 GB', cpu: 12, ram: -8, disk: 58, net: [18, 26], bootDays: 3, uptime30: 99.95 },
  { key: 'db-primary', role: 'Database · primary', region: 'Singapore · zone a', size: '8 vCPU · 32 GB', cpu: 2, ram: 16, disk: 79, net: [30, 34], bootDays: 84, uptime30: 99.99 },
  { key: 'db-replica', role: 'Database · replica', region: 'Singapore · zone b', size: '8 vCPU · 32 GB', cpu: -9, ram: 12, disk: 78, net: [24, 8], bootDays: 84, uptime30: 99.99 },
  { key: 'cache', role: 'Cache (Redis)', region: 'Singapore · zone a', size: '2 vCPU · 8 GB', cpu: -12, ram: 10, disk: 34, net: [36, 40], bootDays: 47, uptime30: 100 },
  { key: 'storage', role: 'File storage', region: 'Singapore · zone a', size: '2 vCPU · 4 GB · 2 TB', cpu: -7, ram: -24, disk: 75, net: [12, 64], bootDays: 210, uptime30: 100 },
];
const level = (ms) => baseLoad(ms);
function fleetAt(ms) {
  const L = level(ms);
  const m = ms / MIN;
  const nc = SERVERS.map((s) => (smooth('cpu' + s.key, m, 7) - 0.5) * 9);
  const nr = SERVERS.map((s) => (smooth('ram' + s.key, m, 23) - 0.5) * 3);
  const mc = nc.reduce((a, v) => a + v, 0) / SERVERS.length;
  const mr = nr.reduce((a, v) => a + v, 0) / SERVERS.length;
  const b = busy(ms);
  // the whole fleet drifts a little around the hour's level (a few points either way)
  const dc = (smooth('fleetcpu', m, 9) - 0.5) * 7, dr = (smooth('fleetram', m, 17) - 0.5) * 2.5;
  return SERVERS.map((s, i) => ({
    key: s.key,
    cpu: clamp(L.cpu + dc + s.cpu + nc[i] - mc, 1, 99),
    ram: clamp(L.ram + dr + s.ram + nr[i] - mr, 5, 99),
    disk: s.disk,
    in: r1(s.net[0] * (0.5 + b * 0.6) * (0.85 + smooth('in' + s.key, m, 5) * 0.3)),
    out: r1(s.net[1] * (0.5 + b * 0.6) * (0.85 + smooth('out' + s.key, m, 5) * 0.3)),
  }));
}
const statusOf = (v) => (v.cpu >= 85 || v.ram >= 90 || v.disk >= 85 ? 'down' : v.cpu >= 75 || v.ram >= 85 || v.disk >= 80 ? 'warn' : 'ok');

/** Each server now. */
export function servers(t) {
  const now = fleetAt(floorMin(t));
  const d = ops.get();
  return SERVERS.map((s, i) => {
    const v = now[i];
    const bootedAt = (d.boots && d.boots[s.key]) || t - s.bootDays * DAY;
    const spark = []; for (let k = 11; k >= 0; k--) spark.push(Math.round(fleetAt(floorMin(t) - k * 5 * MIN)[i].cpu));
    const sparkRam = []; for (let k = 11; k >= 0; k--) sparkRam.push(Math.round(fleetAt(floorMin(t) - k * 5 * MIN)[i].ram));
    const row = { ...s, name: s.key, cpu: Math.round(v.cpu), ram: Math.round(v.ram), disk: v.disk, in: v.in, out: v.out, bootedAt, spark, sparkRam };
    return { ...row, status: statusOf(row) };
  });
}
/** The fleet now (the same shape as company.serverLoad). */
export function serverLoad(t) {
  const now = fleetAt(floorMin(t));
  const avg = (k) => now.reduce((a, v) => a + v[k], 0) / now.length;
  return { cpu: Math.round(avg('cpu')), ram: Math.round(avg('ram')), disk: Math.round(avg('disk')), errorRate: level(t).errorRate };
}
export const RANGES = [['1h', 'Last hour'], ['24h', '24 hours'], ['7d', '7 days']];
/** Points for a chart: one server or 'all' (the fleet average). */
export function serverSeries(key, range, t) {
  const idx = SERVERS.findIndex((s) => s.key === key);
  const pick = (ms) => {
    const f = fleetAt(ms);
    if (idx >= 0) return f[idx];
    const avg = (k) => f.reduce((a, v) => a + v[k], 0) / f.length;
    return { cpu: avg('cpu'), ram: avg('ram'), in: f.reduce((a, v) => a + v.in, 0), out: f.reduce((a, v) => a + v.out, 0) };
  };
  const out = [];
  if (range === '1h') {
    const end = floorMin(t);
    for (let k = 59; k >= 0; k--) { const ms = end - k * MIN; const v = pick(ms); out.push({ label: clock(ms), title: clock(ms), ms, cpu: r1(v.cpu), ram: r1(v.ram), in: r1(v.in), out: r1(v.out) }); }
  } else {
    const n = range === '7d' ? 168 : 24;
    const end = floorHour(t);
    for (let k = n - 1; k >= 0; k--) {
      const ms = end - k * H;
      const v = pick(Math.min(t, ms + 30 * MIN));
      out.push({ label: range === '7d' ? (hourOf(ms) === 0 ? dayShort(ms) : '') : clock(ms), title: dayShort(ms) + ' ' + clock(ms), ms, cpu: r1(v.cpu), ram: r1(v.ram), in: r1(v.in), out: r1(v.out) });
    }
  }
  return out;
}
const p2 = (n) => String(n).padStart(2, '0');
const clock = (ms) => { const d = new Date(ms + 6 * H); return p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()); };
const dayShort = (ms) => dmy(ms).slice(0, 6);

/** Database health now. */
export function database(t) {
  const L = level(t);
  const m = t / MIN;
  const d = ops.get();
  const lag = (ms) => r1(0.2 + smooth('lag', ms / MIN, 6) * 1.1 + (busy(ms) > 1 ? 0.3 : 0));
  const lagSeries = []; for (let k = 29; k >= 0; k--) lagSeries.push(lag(floorMin(t) - k * 2 * MIN));
  let full = at(t, 3, 18); if (full > t) full -= DAY;
  let inc = floorHour(t) + 17 * MIN; if (inc > t) inc -= H;
  const manual = (d.backups || []).filter((b) => b.at <= t).sort((a, b) => b.at - a.at)[0] || null;
  const days = Math.max(0, Math.floor((t - Date.UTC(2026, 8, 1)) / DAY));
  return {
    connections: Math.round(54 + L.cpu * 0.8 + smooth('conn', m, 4) * 12), maxConnections: 200,
    slowQueries: 3 + Math.floor(noise('slow', Math.floor(t / (10 * MIN))) * 8), slowOver: 1000,
    topSlow: [
      { q: 'SELECT … FROM orders WHERE shop_id = ? AND status IN (…) ORDER BY created_at', avg: 1840 + Math.round(noise('sq1', hourOf(t)) * 600), n: 6, where: 'Orders list, big stores' },
      { q: 'SELECT … FROM stock_moves GROUP BY product_id, place_id', avg: 1420 + Math.round(noise('sq2', hourOf(t)) * 400), n: 3, where: 'Stock report' },
      { q: 'UPDATE parcels SET status = ? WHERE tracking_id IN (…)', avg: 1180 + Math.round(noise('sq3', hourOf(t)) * 500), n: 4, where: 'Courier sync (Steadfast backlog)' },
    ],
    lag: lag(t), lagSeries, lagWarn: 5,
    size: r1(48.2 + days * 0.04),
    backups: { full, fullTook: 18, incremental: inc, retention: 30, restoreTest: startOfDay(t) - 12 * DAY + 11 * H, manual },
    uptime30: 99.99, failover: d.failoverAt || null,
  };
}

// ==== background jobs ==================================================================================================
export const QUEUES = [
  { key: 'billing-run', name: 'Billing run', what: 'Bills, renewals and payment reminders', workers: 2, wait: [0, 4], run: [0, 1], oldest: 40, p: 0.01, incident: 0 },
  { key: 'sms-send', name: 'SMS send', what: 'Order and marketing SMS through SSL Wireless / Alpha SMS', workers: 6, wait: [14, 34], run: [3, 6], oldest: 25, p: 0.12, incident: 0 },
  { key: 'courier-sync', name: 'Courier sync', what: 'Bookings and parcel status from the couriers', workers: 4, wait: [6, 14], run: [2, 4], oldest: 50, p: 0.05, incident: 28 },
  { key: 'webhooks-in', name: 'Webhooks in', what: 'Incoming webhooks: couriers, payments, stores', workers: 4, wait: [4, 10], run: [2, 4], oldest: 20, p: 0.04, incident: 30 },
  { key: 'report-email', name: 'Report email', what: 'Scheduled reports and daily summaries by email', workers: 1, wait: [0, 8], run: [0, 1], oldest: 90, p: 0.02, incident: 0 },
  { key: 'search-index', name: 'Search index', what: 'Product search for storefronts and the POS', workers: 2, wait: [3, 11], run: [1, 2], oldest: 30, p: 0.01, incident: 0 },
];
const JOB_ERRORS = {
  'billing-run': ['bKash auto-debit declined: insufficient balance', 'Invoice PDF timed out'],
  'sms-send': ['DLR timeout from operator (Grameenphone)', 'Invalid number: 11 digits needed', 'Provider returned 429: too many requests'],
  'courier-sync': ['Steadfast returned 504 Gateway Timeout', 'Steadfast status API took longer than 30 s', 'Pathao token expired; refreshed'],
  'webhooks-in': ['Steadfast event arrived 14 min late; order already moved', 'Payload older than 10 min (stale event)', 'Signature check failed'],
  'report-email': ['Amazon SES: recipient mailbox full'],
  'search-index': ['Product image missing; skipped'],
};
/** Is an incident that holds up this queue open at ms? */
function queueHeld(q, ms) {
  return incidents().some((x) => (x.queues || []).includes(q) && x.startedAt <= ms && (!x.resolvedAt || x.resolvedAt > ms) && x.status !== 'Resolved');
}
function queueHeldNow(q, ms) {
  return incidents().some((x) => (x.queues || []).includes(q) && x.startedAt <= ms && !x.resolvedAt);
}
/** Failed jobs from the last 6 hours that are not yet retried. */
export function failedJobs(key, t) {
  const q = QUEUES.find((x) => x.key === key);
  if (!q) return [];
  const st = (ops.get().queues || {})[key] || {};
  const cleared = st.clearedAt || 0;
  const retried = new Set((st.retried || []).map((x) => x.id));
  const users = storesFor(key === 'courier-sync' || key === 'webhooks-in' ? 'steadfast' : 'ses');
  const out = [];
  const end = Math.floor(t / (10 * MIN));
  for (let b = end - 36; b <= end; b++) {
    const ms = b * 10 * MIN;
    const r = rng('fail:' + key + ':' + b);
    const held = queueHeld(key, ms);
    const n = held ? r.int(0, 2) : r() < q.p ? 1 : 0;
    for (let j = 0; j < n; j++) {
      const when = ms + Math.floor(r() * 10 * MIN);
      if (when > t) continue;
      const errs = JOB_ERRORS[key];
      const err = held ? errs[0] : r.pick(errs);
      out.push({ id: 'J' + (hash(key + b + ':' + j) % 900000 + 100000), queue: key, at: when, error: err, attempts: 3, shopId: users.length ? r.pick(users) : null });
    }
  }
  return out.filter((j) => j.at >= cleared && !retried.has(j.id)).sort((a, b) => b.at - a.at);
}
/** Each queue now. */
export function queues(t) {
  const st = ops.get().queues || {};
  return QUEUES.map((q) => {
    const b = Math.floor(t / (2 * MIN));
    const r = rng('q:' + q.key + ':' + b);
    const held = queueHeldNow(q.key, t);
    const waiting = r.int(q.wait[0], q.wait[1]) + (held ? q.incident + r.int(0, 6) : 0) + (q.key === 'billing-run' && hourOf(t) === 0 ? 40 : 0);
    const running = r.int(q.run[0], q.run[1]);
    const failed = failedJobs(q.key, t);
    const retrying = ((st[q.key] || {}).retried || []).filter((x) => t - x.at < 2 * MIN).length + ((st[q.key] || {}).clearedAt && t - st[q.key].clearedAt < 2 * MIN ? st[q.key].clearedN || 0 : 0);
    const oldest = waiting ? Math.round((q.oldest + r() * q.oldest * 0.6) + (held ? 14 * 60 : 0)) : 0;   // seconds
    const status = held ? 'warn' : failed.length >= 10 ? 'warn' : 'ok';
    return { ...q, waiting, running, failed: failed.length, retrying, oldest, status, held };
  });
}

// ==== the API ===========================================================================================================
// [id, method, path, group, per hour, avg ms, p95 ms, error weight, timeout share, 4xx share, integration]
const EP = [
  ['orders-create', 'POST', '/v1/orders', 'Orders', 620, 180, 420, 1, 0.1, 0.03],
  ['orders-list', 'GET', '/v1/orders', 'Orders', 1900, 95, 260, 0.6, 0.15, 0.01],
  ['orders-get', 'GET', '/v1/orders/{id}', 'Orders', 2600, 40, 110, 0.4, 0.05, 0.02],
  ['orders-status', 'PATCH', '/v1/orders/{id}/status', 'Orders', 540, 120, 310, 0.8, 0.05, 0.04],
  ['products-list', 'GET', '/v1/products', 'Products', 3100, 85, 240, 0.5, 0.1, 0.005],
  ['products-create', 'POST', '/v1/products', 'Products', 140, 260, 640, 1, 0.1, 0.06],
  ['products-update', 'PATCH', '/v1/products/{id}', 'Products', 420, 150, 380, 0.8, 0.05, 0.04],
  ['products-stock', 'GET', '/v1/products/{id}/stock', 'Products', 1500, 35, 90, 0.3, 0.05, 0.01],
  ['stock-moves', 'POST', '/v1/stock/moves', 'Products', 380, 140, 360, 0.8, 0.05, 0.02],
  ['customers-list', 'GET', '/v1/customers', 'Customers', 700, 90, 250, 0.5, 0.05, 0.01],
  ['customers-create', 'POST', '/v1/customers', 'Customers', 260, 110, 280, 0.6, 0.05, 0.05],
  ['pay-bkash', 'POST', '/v1/payments/bkash/callback', 'Payments', 160, 210, 940, 2.2, 0.2, 0.02, 'bkash'],
  ['pay-nagad', 'POST', '/v1/payments/nagad/callback', 'Payments', 70, 240, 1010, 2.2, 0.2, 0.02, 'nagad'],
  ['pay-ssl', 'POST', '/v1/payments/sslcommerz/ipn', 'Payments', 90, 230, 820, 1.8, 0.2, 0.02, 'sslcommerz'],
  ['pay-links', 'POST', '/v1/payments/links', 'Payments', 60, 160, 380, 0.8, 0.05, 0.03],
  ['wh-steadfast', 'POST', '/v1/webhooks/steadfast', 'Couriers', 170, 380, 2400, 1.5, 0.35, 0.01, 'steadfast'],
  ['wh-pathao', 'POST', '/v1/webhooks/pathao', 'Couriers', 140, 160, 610, 1.2, 0.2, 0.01, 'pathao'],
  ['wh-redx', 'POST', '/v1/webhooks/redx', 'Couriers', 60, 170, 700, 1.2, 0.2, 0.01, 'redx'],
  ['wh-paperfly', 'POST', '/v1/webhooks/paperfly', 'Couriers', 25, 190, 760, 1.2, 0.2, 0.01, 'paperfly'],
  ['courier-book', 'POST', '/v1/couriers/bookings', 'Couriers', 260, 640, 1900, 2, 0.4, 0.03, 'steadfast'],
  ['sms-send', 'POST', '/v1/messages/sms', 'Messaging', 900, 260, 1500, 1.4, 0.2, 0.02, 'ssl-wireless'],
  ['email-send', 'POST', '/v1/messages/email', 'Messaging', 700, 120, 300, 0.6, 0.1, 0.01, 'ses'],
  ['wh-meta', 'POST', '/v1/webhooks/meta', 'Messaging', 820, 90, 260, 0.6, 0.1, 0.01, 'meta'],
  ['ai-replies', 'POST', '/v1/ai/replies', 'Messaging', 300, 1400, 3800, 1.2, 0.3, 0.01],
  ['meta-catalog', 'POST', '/v1/channels/meta/catalog-sync', 'Channels', 45, 900, 1100, 1.2, 0.2, 0.04, 'meta'],
  ['google-feed', 'POST', '/v1/channels/google/feed', 'Channels', 30, 700, 650, 1, 0.2, 0.04, 'google'],
  ['wh-woo', 'POST', '/v1/webhooks/woocommerce', 'Channels', 40, 150, 420, 1, 0.1, 0.02, 'woocommerce'],
  ['wh-shopify', 'POST', '/v1/webhooks/shopify', 'Channels', 15, 140, 400, 1, 0.1, 0.02, 'shopify'],
  ['pos-sales', 'POST', '/v1/pos/sales', 'POS', 480, 130, 330, 0.8, 0.05, 0.02],
  ['pos-sync', 'GET', '/v1/pos/sync', 'POS', 900, 70, 210, 0.4, 0.05, 0.005],
  ['storefront-products', 'GET', '/v1/storefront/products', 'Storefront', 5200, 60, 180, 0.3, 0.05, 0.004],
  ['auth-token', 'POST', '/v1/auth/token', 'Platform', 350, 75, 190, 0.5, 0.05, 0.08],
  ['reports-daily', 'GET', '/v1/reports/daily-summary', 'Platform', 210, 520, 1400, 0.8, 0.2, 0.01],
];
export const ENDPOINTS = EP.map(([id, method, path, group, perHour, avg, p95, w, tShare, c4, integration]) => ({ id, method, path, group, perHour, avg, p95, w, tShare, c4, integration: integration || null }));
export const API_GROUPS = [...new Set(ENDPOINTS.map((e) => e.group))];
const EP_ERRORS = {
  'wh-steadfast': [[503, 'Queue busy, retry later'], [504, 'Timed out waiting for courier sync'], [409, 'Stale status event']],
  'courier-book': [[504, 'Steadfast booking API timed out after 30 s'], [502, 'Bad gateway from courier'], [422, 'Phone number missing on the order']],
  'pay-bkash': [[401, 'Signature check failed'], [500, 'Payment not found for paymentID'], [504, 'bKash query API timed out']],
  'pay-nagad': [[401, 'Signature check failed'], [500, 'Order reference not found']],
  'pay-ssl': [[500, 'IPN validation failed'], [504, 'Validation API timed out']],
  'sms-send': [[502, 'Provider rejected the batch'], [504, 'SSL Wireless timed out'], [429, 'Too many requests']],
  'ai-replies': [[504, 'Model took longer than 20 s'], [500, 'Reply was empty']],
};
const DEFAULT_ERRORS = [[500, 'Internal error'], [504, 'Timed out after 30 s'], [503, 'Service busy'], [422, 'Validation failed']];
/** Is an incident linked to this integration open at ms? Returns the factor its failures grow by. */
function incidentFactor(integration, ms) {
  if (!integration) return { f: 1, slow: 1 };
  for (const x of incidents()) {
    if (x.integration !== integration || x.startedAt > ms || (x.resolvedAt && x.resolvedAt <= ms)) continue;
    const mon = x.monitoringAt && x.monitoringAt <= ms;
    const sev = x.severity === 'SEV1' ? 3 : 1;
    return { f: (mon ? 6 : 28) * sev, slow: mon ? 1.4 : 2.6 };
  }
  return { f: 1, slow: 1 };
}
const pausedAt = (integration, ms) => { const p = ((ops.get().integrations || {})[integration] || {}).paused; return p && p.at <= ms; };
/** One hour of the API: per endpoint requests, failed, timeouts, 4xx, avg and P95 latency. */
const hourCache = new Map();
function apiHour(h, t) {
  const partial = h + H > t;
  const frac = partial ? clamp((t - h) / H, 0, 1) : 1;
  const key = h + ':' + (partial ? Math.floor(t / MIN) : 'x') + ':' + version + (ops.isLive() ? 'L' : 'S');
  if (hourCache.has(key)) return hourCache.get(key);
  const mid = Math.min(t, h + 30 * MIN);
  const b = busy(mid);
  const L = level(mid);
  const rows = ENDPOINTS.map((e) => {
    const r = rng('api:' + e.id + ':' + h);
    const inc = incidentFactor(e.integration, mid);
    const paused = e.integration && pausedAt(e.integration, mid);
    const req = paused ? 0 : Math.round(e.perHour * b * (0.85 + r() * 0.3) * frac);
    const load = 1 + (L.cpu - 40) / 200;
    return { e, req, inc, r, avg: Math.round(e.avg * (0.9 + r() * 0.2) * load * inc.slow), p95: Math.round(e.p95 * (0.9 + r() * 0.25) * load * inc.slow), c4: Math.round(req * e.c4 * (0.6 + r() * 0.8)) };
  });
  const total = rows.reduce((a, x) => a + x.req, 0);
  const budget = Math.round(total * L.errorRate / 100);
  const wsum = rows.reduce((a, x) => a + x.req * x.e.w * x.inc.f, 0) || 1;
  const out = rows.map((x) => {
    const failed = Math.min(x.req, Math.round(budget * (x.req * x.e.w * x.inc.f) / wsum));
    const ts = x.inc.f > 1 ? Math.min(0.6, x.e.tShare * 1.6) : x.e.tShare;
    return { id: x.e.id, req: x.req, failed, timeouts: Math.round(failed * ts), c4: x.c4, avg: x.avg, p95: x.p95 };
  });
  if (hourCache.size > 900) hourCache.clear();
  hourCache.set(key, out);
  return out;
}
/** The last 24 hours, hour by hour (oldest first). */
function apiDay(t) {
  const end = floorHour(t);
  const hours = [];
  for (let k = 23; k >= 0; k--) hours.push({ h: end - k * H, rows: apiHour(end - k * H, t) });
  return hours;
}
function sumEndpoint(day, i) {
  let req = 0, failed = 0, timeouts = 0, c4 = 0, lat = 0, p95 = 0;
  for (const { rows } of day) { const x = rows[i]; req += x.req; failed += x.failed; timeouts += x.timeouts; c4 += x.c4; lat += x.avg * x.req; p95 = Math.max(p95, x.p95); }
  // P95 over the day: the busiest hours weigh most; take the 90th of the hourly P95s
  const hp = day.map(({ rows }) => rows[i].p95).sort((a, b) => a - b);
  return { req, failed, timeouts, c4, avg: req ? Math.round(lat / req) : 0, p95: hp[Math.floor(hp.length * 0.9)] || p95, errorRate: req ? (failed / req) * 100 : 0 };
}
/** Every endpoint over the last 24 hours. */
export function endpoints(t) {
  const day = apiDay(t);
  return ENDPOINTS.map((e, i) => ({ ...e, ...sumEndpoint(day, i) }));
}
/** Totals for the API over the last 24 hours. */
export function apiTotals(t) {
  const list = endpoints(t);
  const req = list.reduce((a, x) => a + x.req, 0);
  const failed = list.reduce((a, x) => a + x.failed, 0);
  const timeouts = list.reduce((a, x) => a + x.timeouts, 0);
  const avg = req ? Math.round(list.reduce((a, x) => a + x.avg * x.req, 0) / req) : 0;
  const ps = list.filter((x) => x.req).map((x) => [x.p95, x.req]).sort((a, b) => a[0] - b[0]);
  let acc = 0, p95 = 0; for (const [p, n] of ps) { acc += n; p95 = p; if (acc >= req * 0.95) break; }
  const day = apiDay(t);
  return { req, failed, timeouts, avg, p95, errorRate: req ? (failed / req) * 100 : 0, perHour: day.map(({ h, rows }) => ({ h, req: rows.reduce((a, x) => a + x.req, 0), failed: rows.reduce((a, x) => a + x.failed, 0) })) };
}
/** One endpoint: its 24 hours, the status codes, recent errors and timeouts by hour. */
export function endpointDetail(id, t) {
  const i = ENDPOINTS.findIndex((e) => e.id === id);
  if (i < 0) return null;
  const e = ENDPOINTS[i];
  const day = apiDay(t);
  const sum = sumEndpoint(day, i);
  const hours = day.map(({ h, rows }) => ({ h, label: clock(h), title: dayShort(h) + ' ' + clock(h), ...rows[i] }));
  const errs = EP_ERRORS[id] || DEFAULT_ERRORS;
  const users = storesFor(e.integration || 'ses');
  const recent = [];
  for (let k = hours.length - 1; k >= 0 && recent.length < 10; k--) {
    const x = hours[k];
    const r = rng('err:' + id + ':' + x.h);
    const n = Math.min(4, x.failed + (x.c4 > 0 && r() < 0.4 ? 1 : 0));
    const list = [];
    for (let j = 0; j < n; j++) {
      const when = x.h + Math.floor(r() * Math.min(H, t - x.h));
      const pick = j < x.timeouts ? (errs.find(([c]) => c === 504) || [504, 'Timed out after 30 s']) : r.pick(errs);
      list.push({ id: id + x.h + j, at: when, code: pick[0], msg: pick[1], shopId: users.length ? r.pick(users) : null, ms: pick[0] === 504 ? 30000 : Math.round(x.p95 * (0.6 + r() * 0.8)) });
    }
    list.sort((a, b) => b.at - a.at).forEach((y) => { if (recent.length < 10) recent.push(y); });
  }
  const c2 = Math.max(0, sum.req - sum.failed - sum.c4);
  return { ...e, ...sum, hours, recent, codes: [{ name: '2xx', value: c2 }, { name: '4xx', value: sum.c4 }, { name: '5xx', value: Math.max(0, sum.failed - sum.timeouts) }, { name: 'Timeouts', value: sum.timeouts }] };
}

// ==== integrations ======================================================================================================
export const GROUPS = ['Payments', 'Messaging', 'Couriers', 'Channels', 'Store sync'];
export const INTEGRATIONS = [
  { key: 'sslcommerz', name: 'SSLCOMMERZ', group: 'Payments', brand: 'sslcommerz', kind: 'Card and wallet checkout', perHour: 90, fail: 0.004, service: 'sslcommerz', share: 0.5, what: 'payment notices' },
  { key: 'bkash', name: 'bKash', group: 'Payments', brand: 'bkash', kind: 'Checkout and auto-debit', perHour: 160, fail: 0.003, service: 'bkash', share: 0.8, what: 'payment callbacks' },
  { key: 'nagad', name: 'Nagad', group: 'Payments', brand: 'nagad', kind: 'Checkout', perHour: 70, fail: 0.005, share: 0.45, what: 'payment callbacks' },
  { key: 'ssl-wireless', name: 'SSL Wireless', group: 'Messaging', brand: 'sms', kind: 'SMS (main)', perHour: 900, fail: 0.006, service: 'sms', share: 0.85, what: 'SMS' },
  { key: 'alpha-sms', name: 'Alpha SMS', group: 'Messaging', brand: 'sms', kind: 'SMS (backup)', perHour: 120, fail: 0.008, share: 0.2, what: 'SMS' },
  { key: 'ses', name: 'Amazon SES', group: 'Messaging', brand: 'email', kind: 'Email', perHour: 700, fail: 0.002, service: 'email', share: 1, what: 'emails' },
  { key: 'pathao', name: 'Pathao', group: 'Couriers', brand: 'pathao', kind: 'Courier', perHour: 140, fail: 0.004, service: 'pathao', share: 0.7, what: 'bookings and status updates' },
  { key: 'steadfast', name: 'Steadfast', group: 'Couriers', brand: 'steadfast', kind: 'Courier', perHour: 170, fail: 0.005, service: 'steadfast', share: 0, what: 'status webhooks' },
  { key: 'redx', name: 'RedX', group: 'Couriers', brand: 'redx', kind: 'Courier', perHour: 60, fail: 0.006, service: 'redx', share: 0.35, what: 'bookings and status updates' },
  { key: 'paperfly', name: 'Paperfly', group: 'Couriers', brand: 'paperfly', kind: 'Courier', perHour: 25, fail: 0.008, share: 0.15, what: 'bookings and status updates' },
  { key: 'meta', name: 'Meta', group: 'Channels', brand: 'meta', kind: 'Catalog, Messenger and Instagram', perHour: 300, fail: 0.006, service: 'meta', share: 0.65, onlineOnly: true, what: 'catalog and message events' },
  { key: 'google', name: 'Google', group: 'Channels', brand: 'google', kind: 'Merchant Center and Business Profile', perHour: 80, fail: 0.004, service: 'google', share: 0.4, onlineOnly: true, what: 'feed updates' },
  { key: 'woocommerce', name: 'WooCommerce', group: 'Store sync', brand: 'woocommerce', kind: 'Store sync', perHour: 40, fail: 0.01, share: 0.12, onlineOnly: true, what: 'product and order syncs' },
  { key: 'shopify', name: 'Shopify', group: 'Store sync', brand: 'shopify', kind: 'Store sync', perHour: 15, fail: 0.01, share: 0.06, onlineOnly: true, what: 'product and order syncs' },
];
const INT_ERRORS = {
  sslcommerz: ['IPN validation failed (val_id not found)', 'Validation API timed out'],
  bkash: ['Callback signature mismatch', 'Query payment timed out', 'Auto-debit declined: insufficient balance'],
  nagad: ['Callback signature mismatch', 'Order reference not found'],
  'ssl-wireless': ['DLR timeout from Grameenphone', 'Masking name not approved for this store', 'Rate limited (429)'],
  'alpha-sms': ['Low balance on the backup account', 'DLR timeout'],
  ses: ['Bounce: mailbox does not exist', 'Throttled: sending rate exceeded'],
  pathao: ['Booking rejected: area not covered', 'Access token expired; refreshed'],
  steadfast: ['Status webhook arrived 14 min late', 'Status API returned 504', 'Booking timed out after 30 s', 'Webhook out of order (Delivered before In transit)'],
  redx: ['Booking rejected: COD above ৳50,000', 'Status API returned 502'],
  paperfly: ['Pickup point not set for this store', 'Status API timed out'],
  meta: ['Catalog item rejected: image smaller than 500 px', 'Messenger token expired: page needs to reconnect'],
  google: ['Feed item disapproved: missing GTIN', 'Business Profile API quota reached'],
  woocommerce: ['Store returned 401: API key revoked', 'Store did not answer in 30 s'],
  shopify: ['Webhook HMAC check failed', 'Store returned 429: slow down'],
};
const eligible = (shop) => shop.status === 'live' && (shop.segs || []).some((s) => s !== 'Wholesale');
/** The stores that use an integration (fixed from the store list; Steadfast: 38 stores including 0031). */
const usersCache = new Map();
export function storesFor(key) {
  const shops = (platformDB().shops || []);
  const ck = key + ':' + shops.length;
  if (usersCache.has(ck)) return usersCache.get(ck);
  const it = INTEGRATIONS.find((x) => x.key === key);
  let list;
  if (key === 'ses') list = shops.filter((s) => s.status === 'live').map((s) => s.id);
  else {
    const pool = shops.filter((s) => (it && it.group === 'Payments' ? s.status === 'live' : eligible(s)) && (!it || !it.onlineOnly || (s.segs || []).includes('Online')));
    const ranked = pool.slice().sort((a, b) => hash(key + a.id) - hash(key + b.id)).map((s) => s.id);
    if (key === 'steadfast') list = ['0031', ...ranked.filter((id) => id !== '0031')].slice(0, 38);
    else list = ranked.slice(0, Math.max(1, Math.round(pool.length * (it ? it.share : 0.5))));
  }
  list = list.slice().sort();
  usersCache.set(ck, list);
  return list;
}
/** Requests and failures of an integration in one hour. */
function intHour(it, h, t) {
  const partial = h + H > t;
  const frac = partial ? clamp((t - h) / H, 0, 1) : 1;
  const mid = Math.min(t, h + 30 * MIN);
  const r = rng('int:' + it.key + ':' + h);
  if (pausedAt(it.key, mid)) return { h, req: 0, failed: 0 };
  const inc = incidentFactor(it.key, mid);
  const req = Math.round(it.perHour * busy(mid) * (0.85 + r() * 0.3) * frac);
  const rate = inc.f > 1 ? Math.min(0.45, it.fail * inc.f * 2.4) : it.fail;
  return { h, req, failed: Math.min(req, Math.round(req * rate * (0.5 + r()))) };
}
function activeIncidentFor(key) {
  return incidents().find((x) => x.integration === key && x.status !== 'Resolved') || null;
}
/** Every integration now (24 h figures). */
export function integrations(t) {
  return INTEGRATIONS.map((it) => integration(it.key, t, true));
}
/** One integration; `brief` leaves out the failure log. */
export function integration(key, t, brief) {
  const it = INTEGRATIONS.find((x) => x.key === key);
  if (!it) return null;
  const st = (ops.get().integrations || {})[key] || {};
  const end = floorHour(t);
  const hours = []; for (let k = 23; k >= 0; k--) hours.push(intHour(it, end - k * H, t));
  const req = hours.reduce((a, x) => a + x.req, 0);
  const failed = hours.reduce((a, x) => a + x.failed, 0);
  const inc = activeIncidentFor(key);
  const status = st.paused ? 'paused' : inc ? (inc.severity === 'SEV1' ? 'down' : 'degraded') : 'ok';
  const lastRetry = st.retriedAt || 0;
  // failures not sent again yet: those since the last "Retry failed" (within 24 h)
  let pending = 0;
  for (const x of hours) {
    const stop = Math.min(t, x.h + H);
    if (stop <= lastRetry) continue;
    pending += x.h >= lastRetry ? x.failed : Math.round(x.failed * ((stop - lastRetry) / Math.max(1, stop - x.h)));
  }
  const users = storesFor(key);
  const lastSuccess = st.paused ? st.paused.at - 40 * 1000 : status === 'degraded' ? t - (3 + Math.floor(noise('ls' + key, Math.floor(t / (5 * MIN))) * 4)) * MIN : t - (5 + Math.floor(noise('ls' + key, Math.floor(t / MIN)) * 80)) * 1000;
  const base = baseServices(t).find((s) => s.key === it.service);
  const out = {
    ...it, status, paused: st.paused || null, incident: inc ? inc.id : null, req, failed, pending, success: req ? (1 - failed / req) * 100 : 100,
    lastSuccess, retriedAt: st.retriedAt || null, retriedBy: st.retriedBy || null, users, uptime: base ? base.uptime : 99.9,
    hours,
  };
  // the stores hit: everyone on an open incident; otherwise the stores with a failure not yet sent again in the last 6 h
  const log = failureLog(it, hours, t, lastRetry, users);
  out.affected = inc ? (inc.stores || []).slice() : [...new Set(log.filter((x) => x.at > t - 6 * H && x.state === 'Failed').map((x) => x.shopId).filter(Boolean))].sort();
  if (!brief) out.log = log.slice(0, 30);
  return out;
}
function failureLog(it, hours, t, lastRetry, users) {
  const out = [];
  for (let k = hours.length - 1; k >= 0; k--) {
    const x = hours[k];
    if (!x.failed) continue;
    const r = rng('log:' + it.key + ':' + x.h);
    const n = Math.min(incidentFactor(it.key, x.h + 30 * MIN).f > 1 ? 4 : 2, x.failed);
    const span = Math.min(H, Math.max(MIN, t - x.h));
    const list = [];
    for (let j = 0; j < n; j++) {
      const when = x.h + Math.floor(r() * span);
      const inc = incidentFactor(it.key, when).f > 1;
      const errs = INT_ERRORS[it.key] || ['Request failed'];
      list.push({ id: it.key + x.h + j, at: when, msg: inc ? errs[r.int(0, Math.min(1, errs.length - 1))] : r.pick(errs), shopId: users.length ? r.pick(users) : null, state: when < lastRetry ? 'Sent again' : 'Failed', of: x.failed });
    }
    list.sort((a, b) => b.at - a.at).forEach((y) => out.push(y));
  }
  return out;
}

// ==== services (the dashboard's and the menu's list) ===================================================================
/** The platform's services now, in company.js's shape, with the state kept here (incidents, paused syncs). */
export function services(t) {
  const list = baseServices(t);
  const open = activeIncidents();
  const q = queues(t);
  return list.map((s) => {
    const it = INTEGRATIONS.find((x) => x.service === s.key);
    const inc = open.find((x) => (it && x.integration === it.key) || (x.services || []).includes(s.key));
    const st = it ? ((ops.get().integrations || {})[it.key] || {}) : {};
    const row = { ...s, status: 'ok' };
    delete row.note; delete row.incident;
    if (s.key === 'jobs') row.note = q.reduce((a, x) => a + x.waiting, 0) + ' waiting';
    if (inc) { row.status = inc.severity === 'SEV1' ? 'down' : 'warn'; row.note = inc.note + ' · ' + (inc.stores || []).length + ' stores'; row.incident = inc.id; }
    else if (st.paused) { row.status = 'warn'; row.note = 'Sync paused'; }
    return row;
  });
}

// ==== resource limits ===================================================================================================
export const LIMITS = [
  ['api', 'API requests', 'a month'], ['storage', 'Storage', 'GB'], ['orders', 'Orders', 'a month'], ['ai', 'AI usage', 'credits a month'],
  ['sms', 'SMS', 'a month'], ['email', 'Email', 'a month'], ['jobs', 'Background jobs', 'a month'],
].map(([key, label, unit]) => ({ key, label, unit }));
const limitLabel = (key) => (LIMITS.find((l) => l.key === key) || {}).label || key;
/** Limits the plans don't carry yet: email and background jobs by plan; the API cap as on the merchant page. */
const EXTRA = {
  growth: { api: 250000, email: 2000, jobs: 20000 },
  business: { api: 250000, email: 10000, jobs: 100000 },
  enterprise: { api: 250000, email: 50000, jobs: 500000 },
};
/** The plan defaults: one row per package (ladder × plan) from the live plan version. */
export function planDefaults(db) {
  const rows = [];
  for (const l of LADDERS) {
    const ladder = (db.plans || {})[l.id];
    if (!ladder) continue;
    const ver = ladder.versions.find((v) => v.v === ladder.live) || ladder.versions[ladder.versions.length - 1];
    for (const p of PLAN_IDS) {
      const plan = ver.plans[p];
      if (!plan) continue;
      const lim = plan.limits || {};
      rows.push({ ladder: l.id, ladderLabel: l.label, plan: p, name: (l.label + ' ' + (plan.name || PLAN_NAME[p])), version: ver.v, warnAt: plan.warnAt || 80,
        limits: { api: EXTRA[p].api, storage: lim.storage ?? 0, orders: lim.orders ?? 0, ai: lim.ai ?? 0, sms: lim.sms ?? 0, email: EXTRA[p].email, jobs: EXTRA[p].jobs } });
    }
  }
  return rows;
}
const liveOverride = (o, t) => !o.until || o.until > t;
export const overridesOf = (shopId, t) => (ops.get().overrides || []).filter((o) => o.shopId === shopId && (t == null || liveOverride(o, t)));
export const limitLog = (shopId) => (ops.get().limitLog || []).filter((x) => !shopId || x.shopId === shopId).slice().sort((a, b) => b.at - a.at);
/** A store's usage this month against its limits (plan default, or the override). */
export function limitsOf(db, shop, t) {
  const sub = subOf(db, shop.id);
  if (!sub) return [];
  const plan = planOf(db, sub);
  const u = usageOf(db, shop, t);
  const res = Object.fromEntries(u.resources.map((x) => [x.key, x]));
  const email = (u.comms.find((c) => c.key === 'email') || {}).count || 0;
  const r = rng('jobs' + shop.id);
  const jobs = Math.round(u.orders * 9 + (res.sms ? res.sms.used : 0) + email + 400 * r());
  const used = { api: res.api ? res.api.used : 0, storage: res.storage ? res.storage.used : 0, orders: res.orders ? res.orders.used : 0, ai: res.ai ? res.ai.used : 0, sms: res.sms ? res.sms.used : 0, email, jobs };
  const lim = plan.limits || {};
  const ex = EXTRA[sub.plan] || EXTRA.growth;
  const base = { api: ex.api, storage: lim.storage ?? 0, orders: lim.orders ?? 0, ai: lim.ai ?? 0, sms: lim.sms ?? 0, email: ex.email, jobs: ex.jobs };
  const ovs = overridesOf(shop.id, t);
  return LIMITS.map((l) => {
    const o = ovs.find((x) => x.key === l.key) || null;
    const limit = o ? o.limit : base[l.key];
    const unlimited = limit >= UNLIMITED;
    const pct = unlimited ? 0 : limit > 0 ? (used[l.key] / limit) * 100 : used[l.key] > 0 ? 100 : 0;
    return { ...l, used: used[l.key], base: base[l.key], limit, unlimited, override: o, pct, warnAt: plan.warnAt || 80 };
  });
}
/** Every billed store with its limits, the worst first. */
export function limitRows(db, t) {
  const rows = [];
  for (const shop of db.shops || []) {
    const st = subState(db, shop.id, t);
    if (!(isPaying(st) || st.key === 'trial')) continue;
    const sub = subOf(db, shop.id);
    const lim = limitsOf(db, shop, t);
    const hot = lim.filter((x) => !x.unlimited && x.limit > 0 && x.pct >= x.warnAt);
    const worst = lim.filter((x) => !x.unlimited && x.limit > 0).sort((a, b) => b.pct - a.pct)[0] || null;
    rows.push({ id: shop.id, name: shop.name, plan: sub ? PLAN_NAME[sub.plan] : '—', ladder: sub ? sub.ladder : '', state: st, limits: lim, hot, over: hot.filter((x) => x.pct >= 100), worst, overrides: overridesOf(shop.id, t).length });
  }
  return rows.sort((a, b) => (b.worst ? b.worst.pct : 0) - (a.worst ? a.worst.pct : 0));
}

// ==== incidents =========================================================================================================
export const STATUSES = ['Investigating', 'Identified', 'Monitoring', 'Resolved'];
export const SEVERITIES = [
  ['SEV1', 'Down for many stores (checkout, orders or payments stop)'],
  ['SEV2', 'A main feature broken or badly slow for many stores'],
  ['SEV3', 'A feature degraded or a few stores affected'],
  ['SEV4', 'Minor; no store work stopped'],
];
export const OWNERS = ['Rakib Hasan', 'Mahin Khan', 'Farhana Akter', 'Imran Chowdhury'];
export const incidents = () => ops.get().incidents || [];
export const incidentById = (id) => incidents().find((x) => x.id === String(id || '').trim().toUpperCase()) || null;
export const activeIncidents = () => incidents().filter((x) => x.status !== 'Resolved');
/** The 90-day picture: count, mean time to resolve, SEV1–2 count. */
export function incidentStats(t) {
  const list = incidents().filter((x) => x.startedAt >= t - 90 * DAY);
  const done = list.filter((x) => x.resolvedAt);
  const mttr = done.length ? done.reduce((a, x) => a + (x.resolvedAt - x.startedAt), 0) / done.length : 0;
  return { total: list.length, active: list.filter((x) => x.status !== 'Resolved').length, mttr, major: list.filter((x) => x.severity === 'SEV1' || x.severity === 'SEV2').length, uptime: UPTIME_30D };
}

function seedIncidents(now) {
  const shopsOf = (key, n) => { const u = storesFor(key); return n >= u.length ? u : u.slice().sort((a, b) => hash('i' + key + a) - hash('i' + key + b)).slice(0, n).sort(); };
  let s = at(now, 9, 40);
  if (now - s < 70 * MIN) s = now - 70 * MIN;
  const upd = (o, i) => ({ id: 'u' + i, notified: 0, ...o });
  const inc114 = {
    id: 'INC-114', title: 'Steadfast webhooks delayed', note: 'Webhooks delayed', severity: 'SEV2', status: 'Identified',
    services: ['steadfast'], components: ['Steadfast status webhooks', 'Webhooks in queue', 'Courier sync queue'], integration: 'steadfast', queues: ['webhooks-in', 'courier-sync'],
    stores: ['0031', ...storesFor('steadfast').filter((id) => id !== '0031')], tickets: ['T-2291'], owner: 'Rakib Hasan', startedAt: s, detectedAt: s + 4 * MIN, monitoringAt: null, resolvedAt: null,
    resolution: '', postmortem: null, by: 'Rakib Hasan',
    updates: [
      upd({ at: s + 4 * MIN, status: 'Investigating', by: 'Rakib Hasan', text: 'Alert from the webhooks-in queue: Steadfast status updates are 10+ minutes late. Looking into it.' }, 1),
      upd({ at: s + 18 * MIN, status: 'Identified', by: 'Rakib Hasan', text: 'Steadfast’s webhook sender is backing up on their side (their status page confirms a partial outage). Bookings still go through; parcel statuses arrive late. 38 stores use Steadfast.', notified: 38 }, 2),
      upd({ at: s + 50 * MIN, status: 'Identified', by: 'Rakib Hasan', text: 'Turned on polling every 10 minutes for Steadfast parcels so order statuses keep moving. Kamrul Hasan (Steadfast partnerships) says a fix is rolling out.' }, 3),
    ],
  };
  const D = (n, h, m) => at(now - n * DAY, h, m);
  const done = (o) => ({ status: 'Resolved', monitoringAt: null, postmortem: null, queues: [], components: [], tickets: [], ...o });
  const pm = (summary, cause, impact, actions) => ({ summary, cause, impact, actions: actions.map(([text, owner, ok]) => ({ text, owner, done: !!ok })), by: 'Rakib Hasan', at: null });
  const R = (o) => {
    const st = o.startedAt;
    const u = o.steps.map(([min, status, text, by, n], i) => upd({ at: st + min * MIN, status, text, by: by || o.owner, notified: n || 0 }, i + 1));
    const res = u[u.length - 1];
    const mon = u.find((x) => x.status === 'Monitoring');
    const out = done({ ...o, updates: u, resolvedAt: res.at, monitoringAt: mon ? mon.at : null, detectedAt: st + 3 * MIN, by: o.owner });
    delete out.steps;
    if (out.postmortem) { out.postmortem.at = res.at + DAY; out.postmortem.by = o.owner; }
    return out;
  };
  const list = [
    R({ id: 'INC-113', title: 'SMS to Grameenphone numbers delayed', note: 'SMS delayed', severity: 'SEV3', services: ['sms'], integration: 'ssl-wireless', stores: shopsOf('ssl-wireless', 21), owner: 'Rakib Hasan', startedAt: D(6, 19, 5),
      resolution: 'SSL Wireless cleared their Grameenphone route; we moved OTP and order SMS to Alpha SMS while it lasted.',
      steps: [[3, 'Investigating', 'Delivery reports from Grameenphone numbers are 20+ minutes late.'], [25, 'Identified', 'SSL Wireless confirms a route problem with Grameenphone. Switching order SMS to Alpha SMS.', null, 21], [70, 'Monitoring', 'Order SMS go through Alpha SMS; SSL Wireless working on the route.'], [130, 'Resolved', 'Grameenphone route back to normal; order SMS moved back to SSL Wireless.', null, 21]],
      postmortem: pm('Order SMS to Grameenphone numbers were delayed for about 2 hours.', 'A route problem at SSL Wireless toward Grameenphone.', '21 stores; about 3,400 SMS delayed, none lost.', [['Switch to the backup provider by itself when delivery reports lag 10 min', 'Rakib Hasan', true], ['Ask SSL Wireless for route alerts by email', 'Mahin Khan', false]]) }),
    R({ id: 'INC-112', title: 'Orders list slow for large stores', note: 'Orders list slow', severity: 'SEV3', services: ['db'], stores: ['0007', '0023', '0025', '0026', '0031', '0036'], owner: 'Mahin Khan', startedAt: D(12, 12, 20),
      resolution: 'Added an index on orders (shop_id, status, created_at); the list loads in under a second again.',
      steps: [[4, 'Investigating', 'Orders list takes 8–12 s for stores with 20,000+ orders.'], [40, 'Identified', 'A query plan changed after the September data growth; it scans all orders of the store.'], [95, 'Monitoring', 'New index added on the primary; replica caught up.'], [150, 'Resolved', 'List back under one second for every store.']],
      postmortem: pm('The orders list took 8–12 seconds for the six biggest stores for about 2.5 hours at lunchtime.', 'A missing index on orders by status and date; the planner switched to a full scan as tables grew.', '6 stores; slow pages, no lost data.', [['Weekly check of the slowest queries', 'Mahin Khan', true], ['Load test with a 100,000-order store before releases', 'Rakib Hasan', false]]) }),
    R({ id: 'INC-111', title: 'bKash callbacks failing', note: 'Callbacks failing', severity: 'SEV2', services: ['bkash'], integration: 'bkash', stores: shopsOf('bkash', 27), owner: 'Rakib Hasan', startedAt: D(19, 15, 10), tickets: ['T-2186'],
      resolution: 'bKash rotated their signing key without notice; the new key is in place and the 214 missed payments were matched.',
      steps: [[2, 'Investigating', 'bKash payment callbacks fail the signature check.'], [20, 'Identified', 'bKash changed their signing key. Asked their merchant team for the new one.', null, 27], [55, 'Monitoring', 'New key in place; matching the payments that came in meanwhile.'], [100, 'Resolved', 'All 214 payments matched to their orders.', null, 27]],
      postmortem: pm('bKash payments were taken but not marked paid on orders for about 1.5 hours.', 'bKash rotated the callback signing key; we only had the old key.', '27 stores; 214 payments marked paid late; no money lost.', [['Read the signing key from bKash’s key endpoint each hour', 'Rakib Hasan', true], ['Alert when 5 callbacks in a row fail the check', 'Rakib Hasan', true]]) }),
    R({ id: 'INC-110', title: 'Report emails not sent', note: 'Report emails late', severity: 'SEV4', services: ['email'], integration: 'ses', stores: shopsOf('ses', 14), owner: 'Imran Chowdhury', startedAt: D(25, 7, 0),
      resolution: 'Amazon SES lifted the sending pause after we removed 40 bounced addresses; reports went out by 10:30.',
      steps: [[10, 'Investigating', 'Daily summary emails stuck in report-email.'], [35, 'Identified', 'Amazon SES paused sending: bounce rate over 5% from old addresses.'], [180, 'Resolved', 'SES sending resumed; all reports sent.']] }),
    R({ id: 'INC-109', title: 'Pathao booking timeouts', note: 'Bookings timing out', severity: 'SEV3', services: ['pathao'], integration: 'pathao', stores: shopsOf('pathao', 22), owner: 'Rakib Hasan', startedAt: D(31, 11, 30), tickets: ['T-2104'],
      resolution: 'Pathao scaled their booking API; we added a retry with back-off for bookings.',
      steps: [[3, 'Investigating', 'Pathao bookings time out after 30 s.'], [30, 'Identified', 'Pathao booking API overloaded at lunchtime.', null, 22], [80, 'Monitoring', 'Bookings retry with back-off.'], [120, 'Resolved', 'Bookings normal for 40 minutes.']],
      postmortem: pm('Pathao bookings timed out for 2 hours.', 'Load on Pathao’s booking API.', '22 stores; about 300 bookings delayed.', [['Retry bookings with back-off', 'Rakib Hasan', true]]) }),
    R({ id: 'INC-108', title: 'RedX status updates stopped', note: 'Status updates stopped', severity: 'SEV2', services: ['redx'], integration: 'redx', stores: Array.from(new Set(['0017', ...shopsOf('redx', 11)])).sort(), owner: 'Rakib Hasan', startedAt: D(38, 10, 0),
      resolution: 'RedX fixed their webhook sender after two days; statuses were pulled by hand meanwhile. Outage credits given (ADJ-0040 and others).',
      steps: [[5, 'Investigating', 'No RedX status webhooks since 10:00.'], [60, 'Identified', 'RedX webhook service down on their side.', null, 12], [24 * 60, 'Monitoring', 'Pulling statuses every 30 minutes until RedX is back.'], [48 * 60 + 40, 'Resolved', 'RedX webhooks back; statuses up to date.', null, 12]],
      postmortem: pm('RedX parcel statuses did not update for 2 days.', 'An outage of RedX’s webhook service.', '12 stores; COD reconciliation late; outage credits approved.', [['Poll couriers when no webhook arrives for 30 min', 'Rakib Hasan', true], ['Outage credit rule for courier outages over 24 h', 'Nusrat Islam', true]]) }),
    R({ id: 'INC-106', title: 'Storefront images slow', note: 'Images slow', severity: 'SEV3', services: ['storage'], stores: shopsOf('meta', 18), owner: 'Imran Chowdhury', startedAt: D(47, 20, 15),
      resolution: 'The image cache node was replaced; images load from the CDN again.',
      steps: [[6, 'Investigating', 'Product images take 4–6 s on storefronts.'], [25, 'Identified', 'One image cache node is failing; requests fall back to storage.'], [50, 'Resolved', 'Cache node replaced.']] }),
    R({ id: 'INC-103', title: 'Checkout down after a release', note: 'Checkout down', severity: 'SEV1', services: ['api'], stores: (platformDB().shops || []).filter((x) => x.status === 'live').map((x) => x.id), owner: 'Mahin Khan', startedAt: D(58, 21, 2), tickets: ['T-1987', 'T-1988'],
      resolution: 'Release 4.18.0 rolled back after 23 minutes; fixed in 4.18.1 the next morning.',
      steps: [[2, 'Investigating', 'Checkout returns 500 for every store.', 'Mahin Khan', 0], [9, 'Identified', 'Release 4.18.0 broke the VAT step of checkout. Rolling back.', 'Mahin Khan', 60], [23, 'Monitoring', 'Rolled back to 4.17.3; checkout works.'], [60, 'Resolved', 'Normal for 40 minutes; 4.18.1 will carry the fix.', 'Mahin Khan', 60]],
      postmortem: pm('Checkout was down for every store for 23 minutes at night.', 'Release 4.18.0 changed how VAT is worked out; stores without a VAT number hit an error.', 'All live stores; about 140 checkouts failed; customers could retry.', [['Checkout test for a store without VAT before each release', 'Mahin Khan', true], ['Release to 5 stores first, then everyone', 'Mahin Khan', true], ['Status page for merchants', 'Farhana Akter', false]]) }),
    R({ id: 'INC-100', title: 'Meta catalog sync rejected', note: 'Catalog sync rejected', severity: 'SEV3', services: ['meta'], integration: 'meta', stores: shopsOf('meta', 16), owner: 'Rakib Hasan', startedAt: D(70, 14, 0),
      resolution: 'Meta’s API change for image sizes handled; products resized to 500 px and synced again.',
      steps: [[10, 'Investigating', 'Catalog syncs fail for many stores.'], [45, 'Identified', 'Meta now rejects images under 500 px.', null, 16], [240, 'Resolved', 'Images resized; catalogs synced.', null, 16]] }),
    R({ id: 'INC-097', title: 'Database failover, 6 min read-only', note: 'Read-only', severity: 'SEV2', services: ['db'], stores: (platformDB().shops || []).filter((x) => x.status === 'live').map((x) => x.id), owner: 'Mahin Khan', startedAt: D(84, 4, 12),
      resolution: 'The primary database host failed; the replica took over after 6 minutes read-only. A new replica was built the same day.',
      steps: [[1, 'Investigating', 'Writes failing on the primary database.'], [4, 'Identified', 'Primary host hardware failure; failing over to the replica.'], [6, 'Monitoring', 'Replica promoted; writes work.'], [90, 'Resolved', 'New replica built and in sync.']],
      postmortem: pm('Stores could read but not save for 6 minutes before dawn.', 'Hardware failure of the primary database host.', 'All live stores; few were open at 04:12.', [['Automatic failover in under 60 s', 'Mahin Khan', false], ['Monthly restore test', 'Imran Chowdhury', true]]) }),
  ];
  return [inc114, ...list];
}

function seed(now) {
  const overrides = [
    { id: 'OV-7', shopId: '0031', key: 'orders', limit: 3000, until: at(now + 21 * DAY, 23, 59), reason: 'Eid campaign: approved 1,000 more orders this month', by: 'Mahin Khan', at: now - 4 * DAY },
    { id: 'OV-6', shopId: '0007', key: 'sms', limit: 2000, until: null, reason: 'Puja campaign SMS; extra SMS paid from credits', by: 'Farhana Akter', at: now - 9 * DAY },
    { id: 'OV-5', shopId: '0025', key: 'api', limit: 500000, until: null, reason: 'ERP sync pulls stock every 5 minutes', by: 'Rakib Hasan', at: now - 16 * DAY },
    { id: 'OV-4', shopId: '0013', key: 'storage', limit: 40, until: null, reason: 'Product videos; storage add-on ৳300 a month', by: 'Nusrat Islam', at: now - 27 * DAY },
  ];
  const limitLog = [
    { id: 'LL-8', shopId: '0031', key: 'orders', from: 2000, to: 3000, reason: overrides[0].reason, by: 'Mahin Khan', at: now - 4 * DAY, action: 'set' },
    { id: 'LL-7', shopId: '0007', key: 'sms', from: 1000, to: 2000, reason: overrides[1].reason, by: 'Farhana Akter', at: now - 9 * DAY, action: 'set' },
    { id: 'LL-6', shopId: '0025', key: 'api', from: 250000, to: 500000, reason: overrides[2].reason, by: 'Rakib Hasan', at: now - 16 * DAY, action: 'set' },
    { id: 'LL-5', shopId: '0023', key: 'orders', from: 3000, to: 2500, reason: 'Pohela Boishakh campaign ended', by: 'Mahin Khan', at: now - 20 * DAY, action: 'removed' },
    { id: 'LL-4', shopId: '0013', key: 'storage', from: 25, to: 40, reason: overrides[3].reason, by: 'Nusrat Islam', at: now - 27 * DAY, action: 'set' },
    { id: 'LL-3', shopId: '0023', key: 'orders', from: 2500, to: 3000, reason: 'Pohela Boishakh campaign', by: 'Mahin Khan', at: now - 52 * DAY, action: 'set' },
  ];
  return {
    incidents: seedIncidents(now), seq: { inc: 115, ov: 8, ll: 9, bk: 1 },
    queues: {}, integrations: {}, overrides, limitLog, backups: [], boots: {},
  };
}

export const ops = createStore({ key: 'ops', version: 1, seed });
let version = 0;
ops.subscribe(() => { version += 1; usersCache.clear(); });

// ==== changes ===========================================================================================================
const fail = (error, field) => ({ ok: false, error, field });

/** Retry failed jobs of a queue: 'all' or a list of ids. */
export function retryJobs(queue, ids) {
  const q = QUEUES.find((x) => x.key === queue);
  if (!q) return fail('No such queue.');
  return ops.commit((d, t) => {
    const list = failedJobs(queue, t);
    const pick = ids === 'all' ? list : list.filter((j) => (ids || []).includes(j.id));
    if (!pick.length) return fail('Nothing to retry.');
    d.queues = d.queues || {};
    const st = d.queues[queue] = d.queues[queue] || { retried: [] };
    if (ids === 'all') { st.clearedAt = t + 1; st.clearedN = pick.length; }
    else st.retried = [...(st.retried || []), ...pick.map((j) => ({ id: j.id, at: t, by: me() }))].slice(-200);
    return { ok: true, n: pick.length };
  });
}
/** Take a database backup now (demo: done at once). */
export function backupNow() {
  return ops.commit((d, t) => {
    const last = (d.backups || [])[0];
    if (last && t - last.at < 10 * MIN) return fail('A backup was taken less than 10 minutes ago.');
    d.backups = [{ id: 'BK-' + d.seq.bk++, at: t, by: me(), size: database(t).size }, ...(d.backups || [])].slice(0, 20);
    return { ok: true };
  });
}
/** Send an integration's failed deliveries again. */
export function retryIntegration(key) {
  const it = INTEGRATIONS.find((x) => x.key === key);
  if (!it) return fail('No such integration.');
  const cur = integration(key, ops.now(), true);
  if (cur.paused) return fail(it.name + ' is paused. Resume it first.');
  if (!cur.pending) return fail('No failed ' + it.what + ' to send again.');
  return ops.commit((d, t) => {
    d.integrations = d.integrations || {};
    d.integrations[key] = { ...(d.integrations[key] || {}), retriedAt: t, retriedBy: me() };
    return { ok: true, n: cur.pending };
  });
}
export function pauseIntegration(key, reason) {
  const it = INTEGRATIONS.find((x) => x.key === key);
  if (!it) return fail('No such integration.');
  const why = String(reason || '').trim();
  if (why.length < 5) return fail('Say why it is paused (5 characters or more).', 'reason');
  return ops.commit((d, t) => {
    d.integrations = d.integrations || {};
    const cur = d.integrations[key] || {};
    if (cur.paused) return fail(it.name + ' is already paused.');
    d.integrations[key] = { ...cur, paused: { at: t, by: me(), reason: why } };
    return { ok: true, n: storesFor(key).length };
  });
}
export function resumeIntegration(key) {
  const it = INTEGRATIONS.find((x) => x.key === key);
  if (!it) return fail('No such integration.');
  return ops.commit((d) => {
    const cur = (d.integrations || {})[key];
    if (!cur || !cur.paused) return fail(it.name + ' is not paused.');
    d.integrations[key] = { ...cur, paused: null };
    return { ok: true };
  });
}

/** Set a store's own limit for one resource. limit: a number, or UNLIMITED. until: ms or null. */
export function setOverride(shopId, key, limit, reason, until = null) {
  const db = platformDB();
  const shop = (db.shops || []).find((s) => s.id === shopId);
  if (!shop) return fail('Pick a store.', 'shopId');
  if (!LIMITS.some((l) => l.key === key)) return fail('Pick a resource.', 'key');
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return fail('Enter a limit above 0.', 'limit');
  const why = String(reason || '').trim();
  if (why.length < 8) return fail('Give a reason (8 characters or more).', 'reason');
  if (until != null && !(until > ops.now())) return fail('The end date must be in the future.', 'until');
  const cur = limitsOf(db, shop, ops.now()).find((x) => x.key === key);
  const value = n >= UNLIMITED ? UNLIMITED : key === 'storage' ? Math.round(n * 10) / 10 : Math.round(n);
  if (cur && cur.limit === value && (cur.override ? cur.override.until || null : null) === (until || null)) return fail('That is already the limit.', 'limit');
  return ops.commit((d, t) => {
    d.overrides = (d.overrides || []).filter((o) => !(o.shopId === shopId && o.key === key));
    d.overrides.push({ id: 'OV-' + d.seq.ov++, shopId, key, limit: value, until: until || null, reason: why, by: me(), at: t });
    d.limitLog = [{ id: 'LL-' + d.seq.ll++, shopId, key, from: cur ? cur.limit : null, to: value, until: until || null, reason: why, by: me(), at: t, action: 'set' }, ...(d.limitLog || [])];
    return { ok: true, label: limitLabel(key) };
  });
}
/** Go back to the plan default. */
export function removeOverride(shopId, key, reason) {
  const why = String(reason || '').trim();
  if (why.length < 8) return fail('Give a reason (8 characters or more).', 'reason');
  const db = platformDB();
  const shop = (db.shops || []).find((s) => s.id === shopId);
  if (!shop) return fail('Pick a store.');
  const cur = limitsOf(db, shop, ops.now()).find((x) => x.key === key);
  if (!cur || !cur.override) return fail('This store uses the plan default already.');
  return ops.commit((d, t) => {
    d.overrides = (d.overrides || []).filter((o) => !(o.shopId === shopId && o.key === key));
    d.limitLog = [{ id: 'LL-' + d.seq.ll++, shopId, key, from: cur.limit, to: cur.base, reason: why, by: me(), at: t, action: 'removed' }, ...(d.limitLog || [])];
    return { ok: true, label: limitLabel(key), base: cur.base };
  });
}

/** Declare an incident: { title, severity, services[], integration, stores[], owner, text, notify }. */
export function declareIncident(f) {
  const title = String(f.title || '').trim();
  if (title.length < 6) return fail('Give it a short title (6 characters or more).', 'title');
  if (!SEVERITIES.some(([k]) => k === f.severity)) return fail('Pick a severity.', 'severity');
  if (!(f.services || []).length) return fail('Pick at least one affected service.', 'services');
  const text = String(f.text || '').trim();
  if (text.length < 10) return fail('Say what is happening (10 characters or more).', 'text');
  if (!OWNERS.includes(f.owner)) return fail('Pick an owner.', 'owner');
  return ops.commit((d, t) => {
    const id = 'INC-' + d.seq.inc++;
    const stores = [...new Set(f.stores || [])].sort();
    const notified = f.notify ? stores.length : 0;
    d.incidents.unshift({
      id, title, note: f.note || title, severity: f.severity, status: 'Investigating', services: f.services, components: [], integration: f.integration || null, queues: [],
      stores, tickets: [], owner: f.owner, startedAt: t, detectedAt: t, monitoringAt: null, resolvedAt: null, resolution: '', postmortem: null, by: me(),
      updates: [{ id: 'u1', at: t, status: 'Investigating', by: me(), text, notified }],
    });
    return { ok: true, id, notified };
  });
}
/** Post a timeline update; moves the status. Resolving goes through resolveIncident (it needs a resolution note). */
export function postUpdate(id, { status, text, notify }) {
  const x = incidentById(id);
  if (!x) return fail('No such incident.');
  if (x.status === 'Resolved') return fail(x.id + ' is resolved. Reopen it to post an update.');
  if (!STATUSES.includes(status) || status === 'Resolved') return fail('Pick a status.', 'status');
  const msg = String(text || '').trim();
  if (msg.length < 5) return fail('Write the update (5 characters or more).', 'text');
  return ops.commit((d, t) => {
    const inc = d.incidents.find((y) => y.id === x.id);
    const notified = notify ? inc.stores.length : 0;
    inc.updates.push({ id: 'u' + (inc.updates.length + 1), at: t, status, by: me(), text: msg, notified });
    inc.status = status;
    if (status === 'Monitoring' && !inc.monitoringAt) inc.monitoringAt = t;
    if (status !== 'Monitoring') inc.monitoringAt = status === 'Investigating' || status === 'Identified' ? null : inc.monitoringAt;
    return { ok: true, notified };
  });
}
export function resolveIncident(id, note, notify) {
  const x = incidentById(id);
  if (!x) return fail('No such incident.');
  if (x.status === 'Resolved') return fail(x.id + ' is already resolved.');
  const msg = String(note || '').trim();
  if (msg.length < 10) return fail('Write what fixed it (10 characters or more).', 'note');
  return ops.commit((d, t) => {
    const inc = d.incidents.find((y) => y.id === x.id);
    const notified = notify ? inc.stores.length : 0;
    inc.updates.push({ id: 'u' + (inc.updates.length + 1), at: t, status: 'Resolved', by: me(), text: msg, notified });
    inc.status = 'Resolved'; inc.resolvedAt = t; inc.resolution = msg;
    return { ok: true, notified };
  });
}
export function reopenIncident(id) {
  const x = incidentById(id);
  if (!x || x.status !== 'Resolved') return fail('Only a resolved incident can be reopened.');
  return ops.commit((d, t) => {
    const inc = d.incidents.find((y) => y.id === x.id);
    inc.status = 'Investigating'; inc.resolvedAt = null; inc.monitoringAt = null;
    inc.updates.push({ id: 'u' + (inc.updates.length + 1), at: t, status: 'Investigating', by: me(), text: 'Reopened: the problem came back.', notified: 0 });
    return { ok: true };
  });
}
export function setOwner(id, name) {
  if (!OWNERS.includes(name)) return fail('Pick an owner.');
  const x = incidentById(id);
  if (!x) return fail('No such incident.');
  if (x.owner === name) return { ok: true, same: true };
  return ops.commit((d) => { d.incidents.find((y) => y.id === x.id).owner = name; return { ok: true }; });
}
export function linkTicket(id, ticket) {
  const tk = String(ticket || '').trim().toUpperCase();
  if (!/^T-\d{3,5}$/.test(tk)) return fail('A ticket number looks like T-2291.');
  const x = incidentById(id);
  if (!x) return fail('No such incident.');
  if (x.tickets.includes(tk)) return fail(tk + ' is linked already.');
  return ops.commit((d) => { d.incidents.find((y) => y.id === x.id).tickets.push(tk); return { ok: true, ticket: tk }; });
}
/** Save the post-mortem: { summary, cause, impact, actions: [{ text, owner, done }] }. */
export function savePostmortem(id, f) {
  const x = incidentById(id);
  if (!x) return fail('No such incident.');
  if (x.status !== 'Resolved') return fail('Write the post-mortem once the incident is resolved.');
  const summary = String(f.summary || '').trim(), cause = String(f.cause || '').trim();
  if (summary.length < 10) return fail('Write what happened (10 characters or more).', 'summary');
  if (cause.length < 5) return fail('Write the cause.', 'cause');
  const actions = (f.actions || []).map((a) => ({ text: String(a.text || '').trim(), owner: a.owner || '', done: !!a.done })).filter((a) => a.text);
  return ops.commit((d, t) => {
    d.incidents.find((y) => y.id === x.id).postmortem = { summary, cause, impact: String(f.impact || '').trim(), actions, by: me(), at: t };
    return { ok: true };
  });
}
