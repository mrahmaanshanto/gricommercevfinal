// reports/metrics — the metric dictionary: one definition per figure, so "Net sales" or "Delivered ROAS" means the same
// thing on Home, in Reports, on the analytics pages and in alerts (Nayeem's brief #14, "one metric definition, many views").
//
// A metric: { id, name, formula, basis, scope, compare, tax, cost, format, good, version, changes: [{ v, at, note }],
//             source, compute(ctx) → number | null }
//   basis    the date a figure is counted on (BASES): sold, placed, delivered, paid (payment date), visit, event
//   compare  how the change is worked out against another period
//   version  goes up when the formula changes; old exports keep the version they were made with
//   compute  ctx = { from, to, channel? }  ([from, to) in ms). Reads the shared books only: salesBook, the online orders
//            (with attribution.js for credit), adSpend and traffic. null = no data (shown as "—").
//
// metricBy(id) · metricValue(id, ctx) · explain(id) (the text behind "How is this calculated?") · metricLabel(id)
// KPI_METRIC maps the key figures of report definitions (report id + kpi key) to a metric id.

import { salesByChannel, COST_SHARE } from '../salesBook';
import { productCostOf } from '../productCost';
import { getAdSpend } from '../adSpend';
import { visitsOn } from '../traffic';
import { onlineOrders, creditTable, modelLabel, basisTime } from '../attribution';

export const DICTIONARY_VERSION = '2026.10';
const DAY = 864e5;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Date bases, shown next to every attributed or delivered figure. */
export const BASES = {
  sold: 'Day of sale',
  placed: 'Order placed',
  delivered: 'Delivered',
  paid: 'Payment date',
  visit: 'Visit date',
  event: 'Event time',
};

// ---- reading the books (memoised for a moment so a page with many figures reads them once) -------------
const memo = new Map();
function once(key, fn) {
  const hit = memo.get(key);
  const t = Date.now();
  if (hit && t - hit.at < 3000) return hit.v;
  let v;
  try { v = fn(); } catch { v = null; }
  memo.set(key, { at: t, v });
  if (memo.size > 200) memo.clear();
  return v;
}
const channelTotals = (from, to) => once('ch|' + from + '|' + to, () => salesByChannel(from, to));
const chanOf = (ctx) => (ctx && ctx.channel && ['Online', 'Retail', 'Wholesale'].includes(ctx.channel) ? ctx.channel : 'all');
const sales = (ctx, k) => { const c = channelTotals(ctx.from, ctx.to); return c ? c[chanOf(ctx)][k] : null; };

const spendIn = (from, to, platforms) => once('ad|' + from + '|' + to + '|' + (platforms || []).join(), () => getAdSpend().filter((a) => a.at >= from && a.at < to && (!platforms || platforms.includes(a.platform))).reduce((s, a) => s + a.amount, 0));
const ordersIn = (from, to, basis) => once('oo|' + from + '|' + to + '|' + basis, () => onlineOrders().filter((o) => o.status !== 'Cancelled').filter((o) => { const t = basisTime(o, basis); return t != null && t >= from && t < to; }));
const credit = (from, to) => once('cr|' + from + '|' + to + '|' + modelLabel(), () => creditTable({ from, to, basis: 'delivered' }));
/** Ad-paid credit in the period: delivered orders and their net sales credited to paid channels under the reporting model. */
const paidCredit = (from, to) => { const t = credit(from, to); if (!t) return { delivered: 0, deliveredSales: 0 }; return t.rows.filter((r) => r.paid).reduce((a, r) => ({ delivered: a.delivered + r.delivered, deliveredSales: a.deliveredSales + r.deliveredSales }), { delivered: 0, deliveredSales: 0 }); };

const lineCost = (o) => (o.lines || []).reduce((a, l) => a + (Number(l.qty) || 0) * (productCostOf(l.sku || l.name) || 0), 0);
/** Cost of goods of an online order, with whether it had to be estimated from the usual cost share. */
function orderCost(o) {
  const c = lineCost(o);
  return c > 0 ? { cost: c, est: false } : { cost: (o.subtotal || 0) * COST_SHARE.Online, est: true };
}
// variable costs of a delivered online order (estimates until the courier and gateway bills are matched)
const COURIER = { 'Inside Dhaka': 70, 'Sub-Dhaka': 110, 'Outside Dhaka': 150 };
const courierCost = (o) => COURIER[o.zone] || 110;
const payFee = (o) => (o.method === 'Gateway' ? 0.0185 : 0.01) * (o.amount || o.subtotal || 0);   // gateway fee, else the courier's 1% COD charge
const RTO_COST = 1.5;   // a parcel that comes back costs the trip out and half again for the return

/** Contribution before ads for orders delivered or returned in [from, to). */
function contribution(from, to) {
  return once('cb|' + from + '|' + to, () => {
    const del = ordersIn(from, to, 'delivered');
    const back = onlineOrders().filter((o) => o.times && o.times.returned && o.times.returned >= from && o.times.returned < to);
    let netSales = 0, cogs = 0, est = false, variable = 0;
    del.forEach((o) => { const c = orderCost(o); netSales += o.subtotal || 0; cogs += c.cost; if (c.est) est = true; variable += courierCost(o) + payFee(o); });
    back.forEach((o) => { variable += courierCost(o) * RTO_COST; });
    return { netSales, cogs, gross: netSales - cogs, variable, value: netSales - cogs - variable, estCogs: est };
  });
}

// ---- the dictionary --------------------------------------------------------------------------------
const M = (id, name, o) => ({ id, name, version: 1, changes: [{ v: 1, at: '2026-07-01', note: 'First definition' }], good: 'up', format: 'money', compare: 'Against the period before of the same length, or the same dates last year.', tax: 'VAT not included.', cost: 'Complete', ...o });

export const METRICS = [
  M('net_sales', 'Net sales', {
    formula: 'Sales after discounts, before VAT and without delivery charges, less the money given back on returns in the same period.',
    basis: 'sold', scope: 'All channels (Online, Retail, Wholesale); a channel filter narrows it.', source: 'Sales book',
    version: 2, changes: [{ v: 1, at: '2026-07-01', note: 'First definition' }, { v: 2, at: '2026-09-15', note: 'Returns come off in the period the money went back, not the period of the sale.' }],
    compute: (c) => sales(c, 'net'),
  }),
  M('sales', 'Sales', { formula: 'What customers paid for the goods after discounts, before VAT and without delivery charges.', basis: 'sold', scope: 'All channels.', source: 'Sales book', compute: (c) => sales(c, 'revenue') }),
  M('returns', 'Returns', { formula: 'Money given back to customers on returns in the period.', basis: 'paid', scope: 'All channels.', source: 'Return history', good: 'down', compute: (c) => sales(c, 'returns') }),
  M('cogs', 'Cost of goods', { formula: 'Buying price of the pieces sold, less the cost of pieces that came back. Days without item lines use the channel’s usual cost share.', basis: 'sold', scope: 'All channels.', source: 'Sales book, product buying prices', good: 'down', cost: 'Estimated where a day has no item lines', compute: (c) => sales(c, 'cost') }),
  M('gross_profit', 'Gross profit', { formula: 'Net sales − cost of goods. Not net profit: courier, fees, ads and running costs are not taken off.', basis: 'sold', scope: 'All channels.', source: 'Sales book', cost: 'Estimated where cost of goods is', compute: (c) => sales(c, 'gross') }),
  M('gross_margin', 'Gross margin', { formula: 'Gross profit ÷ net sales.', basis: 'sold', scope: 'All channels.', source: 'Sales book', format: 'pct', compute: (c) => { const n = sales(c, 'net'); return n ? sales(c, 'gross') / n : null; } }),
  M('orders', 'Orders', { formula: 'Bills, invoices and online orders made in the period (cancelled online orders not counted).', basis: 'sold', scope: 'All channels.', source: 'Sales book', format: 'int', compute: (c) => sales(c, 'orders') }),
  M('aov', 'Average order', { formula: 'Net sales ÷ orders.', basis: 'sold', scope: 'All channels.', source: 'Sales book', compute: (c) => sales(c, 'avg') }),
  M('online_orders', 'Orders placed (online)', { formula: 'Online orders placed in the period, not cancelled.', basis: 'placed', scope: 'Online.', source: 'Orders', format: 'int', compute: (c) => ordersIn(c.from, c.to, 'placed').length }),
  M('delivered_orders', 'Delivered orders', { formula: 'Online orders the courier delivered in the period.', basis: 'delivered', scope: 'Online.', source: 'Orders, courier updates', format: 'int', compute: (c) => ordersIn(c.from, c.to, 'delivered').length }),
  M('delivered_sales', 'Delivered net sales', { formula: 'Goods value (before VAT, without the delivery charge) of online orders delivered in the period.', basis: 'delivered', scope: 'Online.', source: 'Orders, courier updates', compute: (c) => r2(ordersIn(c.from, c.to, 'delivered').reduce((a, o) => a + (o.subtotal || 0), 0)) }),
  M('rto_rate', 'Return to origin (RTO)', {
    formula: 'Parcels the courier brought back ÷ (parcels delivered + brought back) in the period. Customer returns after delivery are a separate figure.',
    basis: 'delivered', scope: 'Online.', source: 'Orders, courier updates', format: 'pct', good: 'down',
    compute: (c) => { const d = ordersIn(c.from, c.to, 'delivered').length; const b = onlineOrders().filter((o) => o.times && o.times.returned && o.times.returned >= c.from && o.times.returned < c.to).length; return d + b ? b / (d + b) : null; },
  }),
  M('ad_spend', 'Ad spend', { formula: 'Money paid for ads in the period, as recorded in Ad spend (also a Marketing expense).', basis: 'paid', scope: 'Online; Facebook, Instagram, Google, TikTok.', source: 'Ad spend', good: 'down', compute: (c) => spendIn(c.from, c.to) }),
  M('delivered_roas', 'Delivered ROAS', {
    formula: 'Delivered net sales credited to ads ÷ ad spend. Credit follows the attribution model chosen on Attribution & UTM.',
    basis: 'delivered', scope: 'Online orders credited to Meta, Google and TikTok ads.', source: 'Orders, attribution, ad spend', format: 'x', attributed: true,
    version: 2, changes: [{ v: 1, at: '2026-07-01', note: 'All online sales ÷ spend ("Real return")' }, { v: 2, at: '2026-10-01', note: 'Only delivered sales credited to ads count, under the shop’s attribution model.' }],
    compute: (c) => { const s = spendIn(c.from, c.to); return s ? paidCredit(c.from, c.to).deliveredSales / s : null; },
  }),
  M('cost_per_delivered', 'Cost per delivered order', { formula: 'Ad spend ÷ delivered orders credited to ads.', basis: 'delivered', scope: 'Online.', source: 'Orders, attribution, ad spend', good: 'down', attributed: true, compute: (c) => { const s = spendIn(c.from, c.to), d = paidCredit(c.from, c.to).delivered; return s && d ? s / d : null; } }),
  M('contribution_before_ads', 'Contribution before ads', {
    formula: 'Delivered net sales − cost of goods − courier charges − payment fees − the cost of parcels that came back.',
    basis: 'delivered', scope: 'Online.', source: 'Orders, product buying prices, courier rates', cost: 'Estimated: courier and fee costs use the set rates until the bills are matched',
    compute: (c) => { const x = contribution(c.from, c.to); return x ? r2(x.value) : null; },
  }),
  M('contribution_after_ads', 'Contribution after ads', { formula: 'Contribution before ads − ad spend. Not net profit: running costs are not taken off.', basis: 'delivered', scope: 'Online.', source: 'Orders, ad spend', cost: 'Estimated (see Contribution before ads)', compute: (c) => { const x = contribution(c.from, c.to); return x ? r2(x.value - spendIn(c.from, c.to)) : null; } }),
  M('visitors', 'Visitors', { formula: 'Visits to the online store.', basis: 'visit', scope: 'Online store.', source: 'Store analytics', format: 'int', cost: 'Sampled', compute: (c) => visitorsIn(c.from, c.to) }),
  M('conversion_rate', 'Conversion rate', { formula: 'Online orders placed ÷ visitors.', basis: 'placed', scope: 'Online store.', source: 'Orders, store analytics', format: 'pct', compute: (c) => { const v = visitorsIn(c.from, c.to); return v ? ordersIn(c.from, c.to, 'placed').length / v : null; } }),
  M('new_customers', 'New customers (online)', { formula: 'People whose first online order (by phone number) was placed in the period.', basis: 'placed', scope: 'Online.', source: 'Orders', format: 'int', compute: (c) => newCustomers(c.from, c.to) }),
];
export const METRIC_BY = Object.fromEntries(METRICS.map((m) => [m.id, m]));
export const metricBy = (id) => METRIC_BY[id] || null;

function visitorsIn(from, to) {
  return once('vis|' + from + '|' + to, () => {
    let n = 0;
    const now = Date.now();
    for (let d = from; d < to && d <= now; d += DAY) n += visitsOn(d, now).total;
    return n;
  });
}
function newCustomers(from, to) {
  return once('nc|' + from + '|' + to, () => {
    const first = new Map();
    onlineOrders().filter((o) => o.status !== 'Cancelled' && o.phone).forEach((o) => { const t = first.get(o.phone); if (t == null || o.at < t) first.set(o.phone, o.at); });
    let n = 0;
    first.forEach((t) => { if (t >= from && t < to) n += 1; });
    return n;
  });
}

/** The value of a metric for ctx = { from, to, channel? }; null when there is nothing to show. */
export function metricValue(id, ctx) {
  const m = metricBy(id);
  if (!m || !ctx) return null;
  try { const v = m.compute(ctx); return v == null || Number.isNaN(v) || !Number.isFinite(v) ? null : v; } catch { return null; }
}

/** "Delivered ROAS · v2" */
export const metricLabel = (id) => { const m = metricBy(id); return m ? `${m.name} · v${m.version}` : ''; };

/** The text behind "How is this calculated?": formula, date basis, scope, tax, cost completeness, version. */
export function explain(id) {
  const m = metricBy(id);
  if (!m) return '';
  const parts = [m.formula, `Counted on: ${BASES[m.basis] || m.basis}.`, `Covers: ${m.scope}`];
  if (m.attributed) parts.push(`Credit: ${modelLabel()}.`);
  if (m.format === 'money') parts.push(m.tax);
  if (m.cost && m.cost !== 'Complete') parts.push(`Costs: ${m.cost}.`);
  parts.push(`${m.name} · definition v${m.version}${m.changes && m.changes.length > 1 ? ` (changed ${m.changes[m.changes.length - 1].at}: ${m.changes[m.changes.length - 1].note})` : ''}.`);
  return parts.join(' ');
}

/** The key figures of report definitions that are dictionary metrics: 'reportId:kpiKey' → metric id. */
export const KPI_METRIC = {
  'sales-summary:net': 'net_sales', 'sales-summary:orders': 'orders', 'sales-summary:aov': 'aov', 'sales-summary:returns': 'returns',
  'ad-spend-roas:spend': 'ad_spend', 'ad-spend-roas:roas': 'delivered_roas', 'ad-spend-roas:cpo': 'cost_per_delivered',
};
/** The metric behind a report's key figure: its own `metric`, else the map above (keys alone are not enough:
 *  "returns" is money in one report and pieces in another). */
export function metricOfKpi(reportId, kpi) {
  if (!kpi) return null;
  if (kpi.metric && METRIC_BY[kpi.metric]) return kpi.metric;
  return KPI_METRIC[reportId + ':' + kpi.key] || null;
}

/** Daily values of a metric over [from, to): [{ day, value }] (for sparklines and alert periods). */
export function metricDays(id, from, to) {
  const out = [];
  for (let d = from; d < to; d += DAY) out.push({ day: d, value: metricValue(id, { from: d, to: Math.min(to, d + DAY) }) });
  return out;
}
