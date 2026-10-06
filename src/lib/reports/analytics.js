// reports/analytics — the figures the analytics pages (Analytics hub, Campaigns & creatives, Products & traffic) show,
// read from the shared books through the metric dictionary's definitions instead of fixed demo numbers:
//   ad spend (adSpend.js), online orders with their touches and the shop's attribution model (attribution.js), the
//   courier's delivered / returned times (orders), product buying prices, visitors (traffic.js).
//
//   platformFacts({ from, to }) → { meta, google, tiktok } each { spend, reported, reportedOrders, placed, confirmed,
//       delivered, deliveredSales, returned, newCustomers, clicks, impressions, cogs, variable, rtoCost }
//   platformDays({ from, to, keys }) → { days: [t], sales: [credited delivered sales], spend: [ad spend] } per day
//   campaignFacts({ from, to }) → one row per ad campaign: spend, credited orders, delivered, sales, returned, RTO,
//       contribution after ads (cost completeness: estimated)
//   productFacts({ from, to }) → per product: net sales, cost of goods, variable costs, ad spend allocated by credited
//       revenue share, contribution after ads, cost completeness
//
// Platform-reported values (what Meta, Google and TikTok say they brought) are not in the shop's books: they come from
// the ad accounts' import. The demo stands in for that import with each platform's usual over-count, and keeps them
// apart from GridCommerce's own figures, never mixed. Clicks and impressions likewise (cost per click).

import { getAdSpend } from '../adSpend';
import { onlineOrders, creditOf, getSetting } from '../attribution';
import { productCostOf } from '../productCost';
import { COST_SHARE } from '../salesBook';

const DAY = 864e5;
export const PLATFORM_KEYS = ['meta', 'google', 'tiktok'];
export const PLATFORMS_OF = { meta: ['Facebook', 'Instagram'], google: ['Google'], tiktok: ['TikTok'] };
const PLATFORM_OF_CHANNEL = { meta_ads: 'meta', google_ads: 'google', tiktok_ads: 'tiktok' };
// what each platform's own report usually claims against the delivered sales credited here (demo import)
const REPORTED = { meta: 1.42, google: 1.24, tiktok: 1.85 };
const CPC = { meta: 3.2, google: 4.2, tiktok: 1.9 };
const CTR = { meta: 0.02, google: 0.043, tiktok: 0.009 };
const COURIER = { 'Inside Dhaka': 70, 'Sub-Dhaka': 110, 'Outside Dhaka': 150 };

const blank = () => ({ spend: 0, reported: 0, reportedOrders: 0, placed: 0, confirmed: 0, delivered: 0, deliveredSales: 0, returned: 0, newCustomers: 0, clicks: 0, impressions: 0, cogs: 0, variable: 0, rtoCost: 0 });
const inP = (t, from, to) => typeof t === 'number' && t >= from && t < to;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function firstOrders() {
  const first = new Map();
  onlineOrders().filter((o) => o.status !== 'Cancelled' && o.phone).forEach((o) => { const t = first.get(o.phone); if (!t || o.at < t.at) first.set(o.phone, o); });
  return new Set([...first.values()].map((o) => o.id));
}

/** Per-platform facts for [from, to). Order counts are credited shares (can be fractional). */
export function platformFacts({ from, to }) {
  const set = getSetting();
  const out = { meta: blank(), google: blank(), tiktok: blank() };
  getAdSpend().filter((a) => inP(a.at, from, to)).forEach((a) => { const k = PLATFORM_KEYS.find((p) => PLATFORMS_OF[p].includes(a.platform)); if (k) out[k].spend += a.amount; });
  const firsts = firstOrders();
  onlineOrders().forEach((o) => {
    const t = o.times || {};
    const placed = inP(o.at, from, to) && o.status !== 'Cancelled';
    const del = inP(t.delivered, from, to), back = inP(t.returned, from, to);
    if (!placed && !del && !back) return;
    creditOf(o, set).forEach((c) => {
      const k = PLATFORM_OF_CHANNEL[c.channel];
      if (!k) return;
      const x = out[k];
      if (placed) { x.placed += c.share; if (t.approved || ['Approved', 'Ready for courier', 'Sent to courier', 'In transit', 'Delivered', 'Returned'].includes(o.status)) x.confirmed += c.share; if (firsts.has(o.id)) x.newCustomers += c.share; }
      if (del) { const oc = orderCost(o); x.delivered += c.share; x.deliveredSales += c.share * (o.subtotal || 0); x.cogs += c.share * oc.cost; x.variable += c.share * variable(o); }
      if (back) { x.returned += c.share; x.rtoCost += c.share * (COURIER[o.zone] || 110) * 1.5; }
    });
  });
  PLATFORM_KEYS.forEach((k) => {
    const x = out[k];
    x.reported = Math.round(x.deliveredSales * REPORTED[k]);
    x.reportedOrders = Math.round(x.placed * REPORTED[k]);
    x.clicks = Math.round(x.spend / CPC[k]);
    x.impressions = Math.round(x.clicks / CTR[k]);
  });
  return out;
}
/** The facts of several platforms added up. */
export const sumFacts = (facts, keys = PLATFORM_KEYS) => keys.reduce((a, k) => { Object.keys(a).forEach((f) => { a[f] += facts[k][f]; }); return a; }, blank());

/** Day by day: credited delivered sales and ad spend for the platforms in `keys`. */
export function platformDays({ from, to, keys = PLATFORM_KEYS }) {
  const set = getSetting();
  const n = Math.max(1, Math.round((to - from) / DAY));
  const sales = Array(n).fill(0), spend = Array(n).fill(0), days = Array.from({ length: n }, (_, i) => from + i * DAY);
  const idx = (t) => Math.floor((t - from) / DAY);
  const plats = keys.flatMap((k) => PLATFORMS_OF[k]);
  getAdSpend().filter((a) => inP(a.at, from, to) && plats.includes(a.platform)).forEach((a) => { spend[idx(a.at)] += a.amount; });
  onlineOrders().forEach((o) => {
    const t = o.times && o.times.delivered;
    if (!inP(t, from, to)) return;
    creditOf(o, set).forEach((c) => { const k = PLATFORM_OF_CHANNEL[c.channel]; if (k && keys.includes(k)) sales[idx(t)] += c.share * (o.subtotal || 0); });
  });
  return { days, sales, spend };
}

const orderCost = (o) => { const c = (o.lines || []).reduce((a, l) => a + (Number(l.qty) || 0) * (productCostOf(l.sku || l.name) || 0), 0); return c > 0 ? { cost: c, est: false } : { cost: (o.subtotal || 0) * COST_SHARE.Online, est: true }; };
const variable = (o) => (COURIER[o.zone] || 110) + (o.method === 'Gateway' ? 0.0185 : 0.01) * (o.amount || o.subtotal || 0);

/** One row per ad campaign paid in or before the period (credited orders under the shop's model). */
export function campaignFacts({ from, to }) {
  const set = getSetting();
  const ads = getAdSpend();
  const rows = new Map();
  const row = (platform, campaign) => {
    const k = platform + '|' + campaign;
    return rows.get(k) || rows.set(k, { platform, campaign, lastPaid: 0, spend: 0, orders: 0, delivered: 0, sales: 0, returned: 0, cogs: 0, variable: 0, rtoCost: 0, est: false }).get(k);
  };
  ads.filter((a) => inP(a.at, from, to)).forEach((a) => { const r = row(a.platform, a.campaign); r.spend += a.amount; r.lastPaid = Math.max(r.lastPaid, a.at); });
  const platOf = (campaign) => (ads.find((a) => a.campaign === campaign) || {}).platform || 'Other';
  onlineOrders().forEach((o) => {
    const t = o.times || {};
    const placed = inP(o.at, from, to) && o.status !== 'Cancelled', del = inP(t.delivered, from, to), back = inP(t.returned, from, to);
    if (!placed && !del && !back) return;
    creditOf(o, set).forEach((c) => {
      if (!PLATFORM_OF_CHANNEL[c.channel] || !c.campaign) return;
      const r = row(platOf(c.campaign), c.campaign);
      if (placed) r.orders += c.share;
      if (del) { const oc = orderCost(o); r.delivered += c.share; r.sales += c.share * (o.subtotal || 0); r.cogs += c.share * oc.cost; r.variable += c.share * variable(o); if (oc.est) r.est = true; }
      if (back) { r.returned += c.share; r.rtoCost += c.share * (COURIER[o.zone] || 110) * 1.5; }
    });
  });
  return [...rows.values()].map((r) => {
    const before = r.sales - r.cogs - r.variable - r.rtoCost;
    return { ...r, sales: r2(r.sales), roas: r.spend ? r.sales / r.spend : null, cpd: r.delivered && r.spend ? r.spend / r.delivered : null, rto: r.delivered + r.returned ? r.returned / (r.delivered + r.returned) : null, contribution: r2(before - r.spend), completeness: r.est ? 'Estimated' : 'Courier and fees estimated' };
  });
}

/**
 * Per product, for orders delivered in [from, to): net sales, cost of goods, variable costs, ad spend allocated by the
 * product's share of the delivered sales credited to ads, contribution after ads. Spend that no delivered order was
 * credited to stays in "Not allocated" (it is not forced onto products).
 */
export function productFacts({ from, to }) {
  const set = getSetting();
  const spend = getAdSpend().filter((a) => inP(a.at, from, to)).reduce((s, a) => s + a.amount, 0);
  const by = new Map();
  let paidSales = 0;
  onlineOrders().forEach((o) => {
    const t = o.times && o.times.delivered;
    if (!inP(t, from, to)) return;
    const paidShare = creditOf(o, set).filter((c) => PLATFORM_OF_CHANNEL[c.channel]).reduce((a, c) => a + c.share, 0);
    const lines = o.lines || [];
    const gross = lines.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.price) || 0), 0) || o.subtotal || 1;
    const varCost = variable(o);
    lines.forEach((l) => {
      const name = l.name || l.sku || 'Item';
      const p = by.get(name) || by.set(name, { name, units: 0, sales: 0, cogs: 0, variable: 0, paidSales: 0, est: false }).get(name);
      const share = ((Number(l.qty) || 0) * (Number(l.price) || 0)) / gross;
      const sales = share * (o.subtotal || 0);
      const unit = productCostOf(l.sku || l.name);
      p.units += Number(l.qty) || 0; p.sales += sales; p.variable += share * varCost;
      if (unit) p.cogs += unit * (Number(l.qty) || 0); else { p.cogs += sales * COST_SHARE.Online; p.est = true; }
      p.paidSales += sales * paidShare; paidSales += sales * paidShare;
    });
  });
  const rows = [...by.values()].map((p) => {
    const ads = paidSales ? spend * (p.paidSales / paidSales) : 0;
    return { ...p, sales: r2(p.sales), cogs: r2(p.cogs), variable: r2(p.variable), ads: r2(ads), contribution: r2(p.sales - p.cogs - p.variable - ads), completeness: p.est ? 'Estimated' : 'Courier and fees estimated' };
  }).sort((a, b) => b.contribution - a.contribution);
  return { rows, spend, allocated: paidSales ? spend : 0, unallocated: paidSales ? 0 : spend };
}
