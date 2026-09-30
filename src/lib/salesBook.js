// salesBook — every sale by channel (Online, Retail, Wholesale), counted on the day it was made,
// with its cost of goods, so Accounts can show sales and profit per channel.
//   Retail     the counters' daily Z-reports (demo September, same figures as the ledger) and the
//              POS sales made in this browser
//   Online     demo September order days, and the orders made in this browser (not cancelled)
//   Wholesale  demo September invoices, and every invoice (the demo ones and those made at the POS)
//   Returns    from the return history, taken off the channel they came from
// Cost of goods: each line's product buying price (products.js cost, else purchase cost); days
// without lines use the channel's usual cost share (COST_SHARE) and are marked `est`.
// Front end only.

import { LEDGER_SEED } from './ledgerSeed';
import { getInvoices } from './invoices';
import { getOrders, isCounterSale } from './orders';
import { getReturns } from './returns';
import { POS_KEYS, load } from './posStore';
import { allProducts } from './products';
import { unitCost } from './purchaseOrders';
import { CHANNELS } from './categories';

export { CHANNELS };
/** Usual cost of goods as a share of sales, for demo days without item lines. */
export const COST_SHARE = { Retail: 0.66, Online: 0.62, Wholesale: 0.81 };
const r2 = (n) => Math.round(n * 100) / 100;
const at = (d, h = 12) => new Date(2026, 8, d, h).getTime();

let seed = 11;
const rnd = (lo, hi) => { seed = (seed * 9301 + 49297) % 233280; return lo + (seed / 233280) * (hi - lo); };

// ---- demo September ----------------------------------------------------------------------------
// retail: one record per day from the counters' Z-report in the ledger (cash + bKash + Nagad)
const retailDays = {};
LEDGER_SEED.filter((e) => e.kind === 'sale' && /^Z-/.test(e.ref || '')).forEach((e) => {
  const d = retailDays[e.ref] || (retailDays[e.ref] = { id: e.ref, at: new Date(e.at).setHours(21, 0, 0, 0), channel: 'Retail', ref: e.ref, party: 'Counter sales · Dhanmondi and Mirpur', revenue: 0 });
  d.revenue += e.amount;
});
const RETAIL_SEED = Object.values(retailDays).map((d) => ({ ...d, orders: Math.round(d.revenue / 780), cost: r2(d.revenue * COST_SHARE.Retail), paid: d.revenue, due: 0, est: true }));
// online: orders taken each day on the website, Facebook and by phone
const ONLINE_SEED = Array.from({ length: 30 }, (_, i) => {
  const orders = Math.round(rnd(7, 17));
  const revenue = Math.round(orders * rnd(1500, 2300) / 10) * 10;
  return { id: 'ON-09' + String(i + 1).padStart(2, '0'), at: at(i + 1, 20), channel: 'Online', ref: `${orders} orders`, party: 'Website, Facebook and phone orders', revenue, orders, cost: r2(revenue * COST_SHARE.Online), paid: revenue, due: 0, est: true };
});
// wholesale: invoices before the demo ones in invoices.js (all paid)
const WHOLESALE_SEED = [
  [2, 'Rahim Traders', 48600], [4, 'Jamal Telecom', 22400], [6, 'Bismillah Mobile Corner', 36850], [9, 'Habib Telecom', 18900],
  [11, 'New Madina Telecom', 41200], [14, 'Maa Fatema Mobile', 15600], [16, 'Rahim Traders', 52300], [18, 'Jamal Telecom', 27450],
].map(([d, party, revenue], i) => ({ id: 'INV-02' + String(10 + i), at: at(d, 15), channel: 'Wholesale', ref: 'INV-02' + String(10 + i), party, revenue, orders: 1, cost: r2(revenue * COST_SHARE.Wholesale), paid: revenue, due: 0, est: true }));

// ---- lines to cost -------------------------------------------------------------------------------
let costIndex = null;
function costOf(name, price) {
  if (!costIndex) { costIndex = {}; try { allProducts().forEach((p) => { if (p.cost) costIndex[p.name] = p.cost; }); } catch { /* ignore */ } }
  return costIndex[name] || unitCost(name) || r2(price * 0.7);
}
const linesCost = (lines) => r2((lines || []).reduce((a, l) => a + costOf(l.name, l.price) * (l.qty || 0), 0));

// ---- the book ------------------------------------------------------------------------------------
/** Every sale record { id, at, channel, ref, party, revenue (before VAT), cost, orders, paid, due, est? }, newest first. */
export function getSales() {
  const out = [...RETAIL_SEED, ...ONLINE_SEED, ...WHOLESALE_SEED];
  if (typeof window === 'undefined') return out.sort((a, b) => b.at - a.at);
  const invoices = getInvoices();
  const invoiceIds = new Set(invoices.map((i) => i.id));
  invoices.forEach((inv) => {
    const t = inv.totals || {};
    const revenue = r2((t.total || 0) - (t.tax || 0));
    out.push({ id: inv.id, at: inv.at, channel: inv.wholesale ? 'Wholesale' : 'Retail', ref: inv.id, party: (inv.customer && inv.customer.name) || 'Walk-in customer', revenue, orders: 1, cost: linesCost(inv.lines), paid: r2((t.total || 0) - Math.max(0, inv.due)), due: Math.max(0, inv.due) });
  });
  // POS sales made in this browser that are not invoices
  load(POS_KEYS.sales, []).filter((s) => !invoiceIds.has(s.id)).forEach((s) => {
    const t = s.totals || {};
    out.push({ id: s.id, at: s.at, channel: s.wholesale ? 'Wholesale' : 'Retail', ref: s.id, party: (s.customer && s.customer.name) || 'Walk-in customer', revenue: r2((t.total || 0) - (t.tax || 0)), orders: 1, cost: linesCost(s.lines), paid: t.total || 0, due: 0 });
  });
  // online orders made in this browser
  getOrders().filter((o) => o.made && !isCounterSale(o) && o.status !== 'Cancelled').forEach((o) => {
    out.push({ id: o.id, at: o.at, channel: 'Online', ref: o.id, party: o.customer, revenue: o.subtotal, orders: 1, cost: linesCost(o.lines), paid: o.paid || 0, due: r2(Math.max(0, o.amount - (o.paid || 0))), delivery: o.shipping || 0 });
  });
  return out.sort((a, b) => b.at - a.at);
}

/** Money given back on returns, by channel, in [from, to). */
export function returnsIn(from, to) {
  const out = { Online: 0, Retail: 0, Wholesale: 0 };
  getReturns().filter((r) => r.type === 'return' && r.amount > 0 && r.at >= from && r.at < to).forEach((r) => { if (out[r.channel] != null) out[r.channel] += r.amount; });
  return out;
}

/**
 * Totals per channel for [from, to):
 * { Online: { revenue, returns, net, cost, gross, margin, orders, avg, due, days: { 'YYYY-MM-DD': revenue } }, … , all: {…} }
 */
export function salesByChannel(from, to, sales = getSales()) {
  const back = returnsIn(from, to);
  const blank = () => ({ revenue: 0, returns: 0, net: 0, cost: 0, gross: 0, margin: 0, orders: 0, avg: 0, due: 0, days: {}, est: false });
  const out = { Online: blank(), Retail: blank(), Wholesale: blank(), all: blank() };
  sales.filter((s) => s.at >= from && s.at < to).forEach((s) => {
    const c = out[s.channel];
    if (!c) return;
    const d = new Date(s.at); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    [c, out.all].forEach((x) => { x.revenue += s.revenue; x.cost += s.cost; x.orders += s.orders || 1; x.due += s.due || 0; x.days[k] = (x.days[k] || 0) + s.revenue; if (s.est) x.est = true; });
  });
  CHANNELS.forEach((ch) => {
    const c = out[ch];
    c.returns = r2(back[ch]);
    // goods that came back are back in stock: their cost comes off too
    c.cost = r2(c.cost - back[ch] * COST_SHARE[ch]);
    out.all.returns += c.returns;
  });
  out.all.cost = r2(CHANNELS.reduce((a, ch) => a + out[ch].cost, 0));
  [...CHANNELS, 'all'].forEach((k) => {
    const c = out[k];
    c.revenue = r2(c.revenue); c.returns = r2(c.returns); c.net = r2(c.revenue - c.returns); c.gross = r2(c.net - c.cost);
    c.margin = c.net ? c.gross / c.net : 0; c.avg = c.orders ? c.net / c.orders : 0; c.due = r2(c.due);
  });
  return out;
}
