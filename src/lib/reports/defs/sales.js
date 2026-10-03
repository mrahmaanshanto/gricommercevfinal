// Reports · Sales group. See ../catalogue.js for the definition contract.
// Every figure comes from the sale lines of the sales book (salesBook.getSaleLines): one row per item
// sold with its channel, place, counter, cashier, salesperson, payment method, discount, VAT and cost
// frozen at the time of sale. Returns come from the return history (returns.js), voids and overrides
// from the POS audit log (auditLog.js), cancelled online orders from salesBook.getOnlineOrders.
// Sales below are before VAT and before returns unless a column says otherwise.

import * as salesBook from '../../salesBook';
import { getReturns } from '../../returns';
import { getAuditLog } from '../../auditLog';
import { logOf } from '../../orders';
import { getCatalog, productBy, stockAt, getMoves } from '../../stock';
import { getHolds } from '../../stockHolds';
import { getTransfers } from '../../transfers';
import { getCounters, POS_KEYS, load } from '../../posStore';
import { namesOf } from '../../locations';
import { partnerBy } from '../../settlements';
import { CHANNELS } from '../../categories';
import { bucketsOf, sum, groupBy, fmt, addDays, startOfDay } from '../period';

// ---- shared helpers -------------------------------------------------------------------------------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const num = (n) => Number(n) || 0;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const rate = (a, b) => (b ? a / b : 0);
const DAY = 864e5;
const TONES = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];
const CH_TONE = { Retail: 'primary', Online: 'info', Wholesale: 'warning' };
const productHref = (sku) => (sku ? '/add-product?sku=' + encodeURIComponent(sku) : null);
const orderHref = (id) => '/order-detail?id=' + encodeURIComponent(id);
const pctText = (a, b) => (b ? `${Math.round((a / b) * 1000) / 10}%` : '0%');

/** Every sale line in [from, to), with the channel / place / category filters applied. */
function linesIn(from, to, f = {}) {
  const all = typeof salesBook.getSaleLines === 'function' ? safe(() => salesBook.getSaleLines(), []) : [];
  const places = f.place ? safe(() => namesOf(f.place), [f.place]) : null;
  return (Array.isArray(all) ? all : []).filter((l) => l && typeof l.at === 'number' && l.at >= from && l.at < to
    && (!f.channel || l.channel === f.channel)
    && (!places || places.includes(l.place))
    && (!f.category || l.cat === f.category));
}
const gross = (l) => num(l.qty) * num(l.price);
const saleCount = (list) => new Set(list.map((l) => l.saleId || l.id)).size;

/** Which place a counter belongs to (for returns made at a POS counter). */
const counterPlaceIndex = () => Object.fromEntries(safe(() => getCounters(), []).map((c) => [c.name, c.location]));
/** Returns and exchanges in [from, to) with the channel / place filters applied. */
function returnsIn(from, to, f = {}) {
  const places = f.place ? safe(() => namesOf(f.place), [f.place]) : null;
  const cp = places ? counterPlaceIndex() : {};
  return safe(() => getReturns(), []).filter((r) => r && r.at >= from && r.at < to
    && (!f.channel || r.channel === f.channel)
    && (!places || places.includes(r.place) || places.includes(cp[r.place])));
}
/** Money given back (or taken off a due) on returns — the rule salesBook.returnsIn uses. */
const isMoneyBack = (r) => r.type === 'return' && num(r.amount) > 0;

/** "Name × 2, Other × 1" → [{ name, qty }] (an exchange like "Polo T-shirt M → L" counts as one piece). */
function itemsOf(text) {
  return String(text || '').split(/,\s+(?=[^,]*×\s*\d+\s*$)|,\s+(?=[^,]*×\s*\d+\s*,)/).map((s) => s.trim()).filter(Boolean).map((s) => {
    const m = /^(.*?)\s*×\s*(\d+)\s*$/.exec(s);
    return m ? { name: m[1].trim(), qty: Number(m[2]) || 1 } : { name: s.replace(/\s+\S+\s*→.*$/, '').trim() || s, qty: 1 };
  });
}
/** The catalogue product a returned item name points at (by name, then by its start). */
function productOfName(name, catalog) {
  const p = safe(() => productBy(name, catalog), null);
  if (p) return p;
  const n = String(name || '').toLowerCase();
  return catalog.find((x) => n && (n.startsWith(String(x.name).toLowerCase()) || String(x.name).toLowerCase().startsWith(n))) || null;
}
/** Returned pieces and money per product key (sku, else the item name) from return rows. */
function returnedByProduct(rows, catalog) {
  const out = {};
  rows.forEach((r) => {
    const items = itemsOf(r.items);
    const pieces = items.reduce((a, x) => a + x.qty, 0) || 1;
    items.forEach((it) => {
      const p = productOfName(it.name, catalog);
      const key = p ? p.sku : it.name;
      const x = out[key] || (out[key] = { key, name: p ? p.name : it.name, cat: p ? p.cat : 'Other', qty: 0, value: 0, count: 0, restock: 0, damaged: 0, reasons: {} });
      x.qty += it.qty; x.count += 1;
      x.value += isMoneyBack(r) ? num(r.amount) * it.qty / pieces : 0;
      if (r.stock === 'damaged') x.damaged += it.qty; else x.restock += it.qty;
      const why = r.reason || 'No reason given';
      x.reasons[why] = (x.reasons[why] || 0) + 1;
    });
  });
  return out;
}

/** Stock now of a product (everywhere, or at the chosen place): on hand. Reads the browser data once. */
function stockReader(place) {
  const holds = safe(() => getHolds(), []), moves = safe(() => getMoves(), []), transfers = typeof window === 'undefined' ? null : safe(() => getTransfers(), []);
  return (sku) => (sku ? safe(() => stockAt(sku, place || '', holds, moves, transfers).onHand, 0) : null);
}
/** Days in the period that have happened (a month still running counts up to today). */
const daysSoFar = (from, to, now) => Math.max(1, Math.round((Math.min(to, addDays(startOfDay(now || Date.now()), 1)) - from) / DAY));

/** Lines grouped by a key into product-style rows: qty, revenue, cost, profit, margin. */
function profitRows(lines, keyFn, base) {
  return [...groupBy(lines, keyFn)].map(([key, list]) => {
    const revenue = sum(list, (l) => l.revenue), cost = sum(list, (l) => l.cost);
    return { key, ...base(list[0], list), qty: sum(list, (l) => l.qty), orders: saleCount(list), gross: sum(list, gross), disc: sum(list, (l) => l.disc), revenue, cost, profit: r2(revenue - cost), margin: rate(revenue - cost, revenue) };
  });
}

// ---- A1 Sales summary ------------------------------------------------------------------------------
const salesSummary = {
  id: 'sales-summary',
  group: 'sales',
  title: 'Sales summary',
  description: 'How much you sold, gave away in discounts and took back in returns, day by day, across every channel.',
  icon: 'chart-column',
  keywords: 'sales revenue turnover net gross discounts returns vat orders aov average order units daily weekly monthly',
  filters: ['channel', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const lines = linesIn(from, to, f);
    const back = returnsIn(from, to, f).filter(isMoneyBack);
    const g = sum(lines, gross), disc = sum(lines, (l) => l.disc), revenue = sum(lines, (l) => l.revenue), vat = sum(lines, (l) => l.vat);
    const returns = sum(back, (r) => r.amount), units = sum(lines, (l) => l.qty), orders = saleCount(lines);
    const net = r2(revenue - returns);
    const { unit, buckets, keyOf } = bucketsOf(from, to);
    const idx = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
    const chans = f.channel ? [f.channel] : CHANNELS;
    const series = chans.map((c) => ({ name: c, tone: CH_TONE[c] || 'slate', values: buckets.map(() => 0) }));
    const rows = buckets.map((b) => ({ start: b.from, _ids: new Set(), units: 0, gross: 0, disc: 0, revenue: 0, returns: 0, vat: 0 }));
    lines.forEach((l) => {
      const i = idx[keyOf(l.at)];
      if (i == null) return;
      const s = series.find((x) => x.name === l.channel);
      if (s) s.values[i] += num(l.revenue);
      const r = rows[i];
      r._ids.add(l.saleId || l.id); r.units += num(l.qty); r.gross += gross(l); r.disc += num(l.disc); r.revenue += num(l.revenue); r.vat += num(l.vat);
    });
    back.forEach((x) => { const i = idx[keyOf(x.at)]; if (i != null) rows[i].returns += num(x.amount); });
    const table = rows.map(({ _ids, ...r }) => ({
      ...r, orders: _ids.size, gross: r2(r.gross), disc: r2(r.disc), revenue: r2(r.revenue), returns: r2(r.returns), vat: r2(r.vat), net: r2(r.revenue - r.returns), aov: _ids.size ? (r.revenue - r.returns) / _ids.size : 0,
    })).filter((r) => r.orders || r.returns);
    const unitLabel = unit === 'day' ? 'Day' : unit === 'week' ? 'Week from' : 'Month from';
    return {
      kpis: [
        { key: 'net', label: 'Net sales', value: net, format: 'money', good: 'up', sub: `Sales ${fmt(revenue, 'money0')} − returns ${fmt(returns, 'money0')} · VAT ${fmt(vat, 'money0')} on top` },
        { key: 'orders', label: 'Orders', value: orders, format: 'int', good: 'up', sub: `${fmt(units, 'int')} pieces sold` },
        { key: 'aov', label: 'Average order', value: orders ? net / orders : 0, format: 'money', good: 'up', sub: 'Net sales ÷ orders' },
        { key: 'disc', label: 'Discounts given', value: disc, format: 'money', good: 'down', sub: `${pctText(disc, g)} of ${fmt(g, 'money0')} at full price` },
        { key: 'returns', label: 'Returns', value: returns, format: 'money', good: 'down', sub: `${pctText(returns, revenue)} of sales` },
      ],
      chart: { type: 'stacked', labels: buckets.map((b) => b.label), series, format: 'money0' },
      table: {
        columns: [
          { key: 'start', label: unitLabel, format: 'date' },
          { key: 'orders', label: 'Orders', format: 'int', total: 'sum' },
          { key: 'units', label: 'Pieces', format: 'int', total: 'sum' },
          { key: 'gross', label: 'At full price', format: 'money', total: 'sum' },
          { key: 'disc', label: 'Discounts', format: 'money', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money', total: 'sum' },
          { key: 'returns', label: 'Returns', format: 'money', total: 'sum' },
          { key: 'net', label: 'Net sales', format: 'money', total: 'sum' },
          { key: 'vat', label: 'VAT', format: 'money', total: 'sum' },
          { key: 'aov', label: 'Average order', format: 'money', total: orders ? r2(net / orders) : 0 },
        ],
        rows: table,
        sort: { key: 'start', dir: 'asc' },
      },
      notes: [
        'Sales are what customers paid for the goods after discounts, before VAT and without delivery charges. Net sales take off the money given back on returns in the same period.',
        'September counter and online days are built from each day’s totals (the Z-reports and order days), split into sales the same way every time.',
      ],
    };
  },
};

// ---- A2 Sales by branch & counter -----------------------------------------------------------------
const salesByBranch = {
  id: 'sales-by-branch-counter',
  group: 'sales',
  title: 'Sales by branch & counter',
  description: 'Which shop and which counter sells the most, with orders, average sale and share of the total.',
  icon: 'store',
  keywords: 'branch counter shop register location place dhanmondi mirpur performance',
  filters: ['channel'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const lines = linesIn(from, to, f).filter((l) => l.channel !== 'Online' && l.place);
    const total = sum(lines, (l) => l.revenue);
    const rows = [...groupBy(lines, (l) => l.place + '|' + (l.counter || ''))].map(([key, list]) => {
      const revenue = sum(list, (l) => l.revenue), orders = saleCount(list);
      return {
        _key: key, place: list[0].place, counter: list[0].counter || 'No counter (invoice)', revenue, orders, aov: orders ? revenue / orders : 0, units: sum(list, (l) => l.qty),
        retail: sum(list.filter((l) => l.channel === 'Retail'), (l) => l.revenue), wholesale: sum(list.filter((l) => l.channel === 'Wholesale'), (l) => l.revenue),
        disc: sum(list, (l) => l.disc), share: rate(revenue, total), _href: '/pos-manage',
      };
    }).sort((a, b) => b.revenue - a.revenue);
    const byPlace = [...groupBy(lines, (l) => l.place)].map(([place, list]) => ({ place, revenue: sum(list, (l) => l.revenue) })).sort((a, b) => b.revenue - a.revenue);
    const orders = saleCount(lines);
    const top = rows.slice(0, 10);
    const chans = (f.channel ? [f.channel] : ['Retail', 'Wholesale']).filter((c) => c !== 'Online');
    return {
      kpis: [
        { key: 'net', label: 'Sales at branches', value: total, format: 'money', good: 'up', sub: `${byPlace.length} place${byPlace.length === 1 ? '' : 's'} · ${rows.length} counter${rows.length === 1 ? '' : 's'}` },
        { key: 'orders', label: 'Sales made', value: orders, format: 'int', good: 'up' },
        { key: 'aov', label: 'Average sale', value: orders ? total / orders : 0, format: 'money', good: 'up' },
        { key: 'topPlace', label: 'Best branch', value: byPlace[0] ? byPlace[0].place : '—', format: 'text', good: 'none', sub: byPlace[0] ? `${pctText(byPlace[0].revenue, total)} of sales` : '' },
        { key: 'topCounter', label: 'Best counter', value: rows[0] ? rows[0].counter : '—', format: 'text', good: 'none', sub: rows[0] ? fmt(rows[0].revenue, 'money0') : '' },
      ],
      chart: { type: 'hbar', labels: top.map((r) => r.counter), series: chans.map((c) => ({ name: c, tone: CH_TONE[c], values: top.map((r) => (c === 'Retail' ? r.retail : r.wholesale)) })), format: 'money0' },
      table: {
        columns: [
          { key: 'place', label: 'Branch or warehouse' },
          { key: 'counter', label: 'Counter' },
          { key: 'orders', label: 'Sales', format: 'int', total: 'sum' },
          { key: 'units', label: 'Pieces', format: 'int', total: 'sum' },
          { key: 'retail', label: 'Retail', format: 'money', total: 'sum' },
          { key: 'wholesale', label: 'Wholesale', format: 'money', total: 'sum' },
          { key: 'revenue', label: 'Net sales', format: 'money', total: 'sum' },
          { key: 'aov', label: 'Average sale', format: 'money', total: orders ? r2(total / orders) : 0 },
          { key: 'share', label: 'Share', format: 'pct', total: total ? 1 : 0 },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: ['Counter and wholesale sales, after discounts and before VAT, counted at the branch where they were made. Online orders ship from the warehouse and are left out here.'],
    };
  },
};

// ---- A3 Sales by product ---------------------------------------------------------------------------
/** Product rows (with returns and stock) shared by the product and category reports. */
function productTable(from, to, now, f) {
  const lines = linesIn(from, to, f);
  const catalog = safe(() => getCatalog(), []);
  const back = returnedByProduct(returnsIn(from, to, f), catalog);
  const onHand = stockReader(f.place);
  const days = daysSoFar(from, to, now);
  const rows = profitRows(lines, (l) => l.sku || l.name, (l) => ({ name: l.name, sku: l.sku || '', cat: l.cat || 'Other' })).map((r) => {
    const ret = back[r.key] || { qty: 0, value: 0 };
    const left = r.sku ? onHand(r.sku) : null;
    const perDay = r.qty / days;
    return { ...r, _key: r.key, retQty: ret.qty, retValue: r2(ret.value), retRate: rate(ret.qty, r.qty), stock: left, cover: left == null || !perDay ? null : Math.max(0, left) / perDay, _href: productHref(r.sku) };
  });
  return { lines, rows, back, days };
}
const salesByProduct = {
  id: 'sales-by-product',
  group: 'sales',
  title: 'Sales by product',
  description: 'Best and worst sellers: pieces, sales, cost, profit and margin per product, with returns and how long the stock left will last.',
  icon: 'package',
  keywords: 'product sku item best seller worst top selling profit margin cost returns stock cover',
  filters: ['channel', 'place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, now, filters }) {
    const f = filters || {};
    const { rows } = productTable(from, to, now, f);
    rows.sort((a, b) => b.revenue - a.revenue);
    const revenue = sum(rows, (r) => r.revenue), cost = sum(rows, (r) => r.cost), profit = r2(revenue - cost);
    const qty = sum(rows, (r) => r.qty), retQty = sum(rows, (r) => r.retQty);
    const top = rows.slice(0, 10);
    const best = [...rows].sort((a, b) => b.profit - a.profit)[0];
    return {
      kpis: [
        { key: 'revenue', label: 'Sales', value: revenue, format: 'money', good: 'up', sub: `${rows.length} product${rows.length === 1 ? '' : 's'} · ${fmt(qty, 'int')} pieces` },
        { key: 'profit', label: 'Gross profit', value: profit, format: 'money', good: 'up', sub: `Cost of goods ${fmt(cost, 'money0')}` },
        { key: 'margin', label: 'Margin', value: rate(profit, revenue), format: 'pct', good: 'up' },
        { key: 'best', label: 'Most profit from', value: best ? best.name : '—', format: 'text', good: 'none', sub: best ? fmt(best.profit, 'money0') : '' },
        { key: 'returns', label: 'Pieces returned', value: retQty, format: 'int', good: 'down', sub: `${pctText(retQty, qty)} of pieces sold` },
      ],
      chart: { type: 'hbar', labels: top.map((r) => r.name), series: [{ name: 'Sales', tone: 'primary', values: top.map((r) => r.revenue) }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'sku', label: 'SKU' },
          { key: 'cat', label: 'Category' },
          { key: 'qty', label: 'Pieces', format: 'int', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money', total: 'sum' },
          { key: 'cost', label: 'Cost', format: 'money', total: 'sum' },
          { key: 'profit', label: 'Gross profit', format: 'money', total: 'sum' },
          { key: 'margin', label: 'Margin', format: 'pct', total: rate(profit, revenue) },
          { key: 'retRate', label: 'Returned', format: 'pct', total: rate(retQty, qty) },
          { key: 'stock', label: 'Stock left', format: 'int', total: 'sum' },
          { key: 'cover', label: 'Days of cover', format: 'days', total: 'none' },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        'Cost is the buying price at the time of sale. Returned is the share of pieces sold that came back in the same period (from the return history).',
        'Stock left is on hand now' + (f.place ? ` at ${f.place}` : ' everywhere') + '; days of cover is how many days it lasts at this period’s daily sales.',
      ],
    };
  },
};

// ---- A4 Sales by category ---------------------------------------------------------------------------
const salesByCategory = {
  id: 'sales-by-category',
  group: 'sales',
  title: 'Sales by category',
  description: 'Which category drives sales and profit, with its ABC class, returns and the stock left.',
  icon: 'layout-grid',
  keywords: 'category department abc analysis pareto profit margin grocery clothing skin care electronics',
  filters: ['channel', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, now, filters }) {
    const f = filters || {};
    const { rows: products } = productTable(from, to, now, f);
    const revenueAll = sum(products, (r) => r.revenue);
    const rows = [...groupBy(products, (r) => r.cat)].map(([cat, list]) => {
      const revenue = sum(list, (r) => r.revenue), cost = sum(list, (r) => r.cost), qty = sum(list, (r) => r.qty), retQty = sum(list, (r) => r.retQty);
      const stocked = list.filter((r) => r.stock != null);
      const stock = sum(stocked, (r) => Math.max(0, r.stock)), sold = sum(stocked, (r) => r.qty);
      return {
        _key: cat, cat, products: list.length, qty, revenue, cost, profit: r2(revenue - cost), margin: rate(revenue - cost, revenue), share: rate(revenue, revenueAll),
        retRate: rate(retQty, qty), stock, cover: sold ? stock / (sold / daysSoFar(from, to, now)) : null,
      };
    }).sort((a, b) => b.revenue - a.revenue);
    // ABC: the categories that make the first 80% of sales are A, the next 15% B, the rest C
    let run = 0;
    rows.forEach((r) => { const before = run; run += r.share; r.abc = before < 0.8 ? 'A' : before < 0.95 ? 'B' : 'C'; });
    const revenue = sum(rows, (r) => r.revenue), cost = sum(rows, (r) => r.cost), profit = r2(revenue - cost);
    const byProfit = [...rows].sort((a, b) => b.profit - a.profit);
    const bestMargin = [...rows].filter((r) => r.revenue > 0).sort((a, b) => b.margin - a.margin)[0];
    return {
      kpis: [
        { key: 'revenue', label: 'Sales', value: revenue, format: 'money', good: 'up', sub: `${rows.length} categor${rows.length === 1 ? 'y' : 'ies'}` },
        { key: 'profit', label: 'Gross profit', value: profit, format: 'money', good: 'up', sub: `Margin ${pctText(profit, revenue)}` },
        { key: 'top', label: 'Most profit from', value: byProfit[0] ? byProfit[0].cat : '—', format: 'text', good: 'none', sub: byProfit[0] ? `${pctText(byProfit[0].profit, profit)} of gross profit` : '' },
        { key: 'margin', label: 'Best margin', value: bestMargin ? bestMargin.cat : '—', format: 'text', good: 'none', sub: bestMargin ? pctText(bestMargin.margin, 1) : '' },
      ],
      chart: { type: 'hbar', labels: byProfit.slice(0, 10).map((r) => r.cat), series: [{ name: 'Gross profit', tone: 'success', values: byProfit.slice(0, 10).map((r) => r.profit) }], format: 'money0' },
      table: {
        columns: [
          { key: 'cat', label: 'Category' },
          { key: 'abc', label: 'Class' },
          { key: 'products', label: 'Products', format: 'int', total: 'sum' },
          { key: 'qty', label: 'Pieces', format: 'int', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money', total: 'sum' },
          { key: 'share', label: 'Share', format: 'pct', total: revenue ? 1 : 0 },
          { key: 'cost', label: 'Cost', format: 'money', total: 'sum' },
          { key: 'profit', label: 'Gross profit', format: 'money', total: 'sum' },
          { key: 'margin', label: 'Margin', format: 'pct', total: rate(profit, revenue) },
          { key: 'retRate', label: 'Returned', format: 'pct', total: 'none' },
          { key: 'stock', label: 'Stock left', format: 'int', total: 'sum' },
          { key: 'cover', label: 'Days of cover', format: 'days', total: 'none' },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: ['Class A categories bring the first 80% of sales, B the next 15%, C the rest. Cost is the buying price at the time of sale.'],
    };
  },
};

// ---- A5 Sales by staff -----------------------------------------------------------------------------
const COMMISSION = { Retail: 0.01, Wholesale: 0.005, Online: 0 };
const salesByStaff = {
  id: 'sales-by-staff',
  group: 'sales',
  title: 'Sales by staff & cashier',
  description: 'Who sells the most, who rings up the sales, the discounts they gave, the returns they handled and the commission earned.',
  icon: 'user-round-check',
  keywords: 'staff cashier salesperson sold by commission discounts returns leaderboard employee',
  filters: ['place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const lines = linesIn(from, to, f);
    const rets = returnsIn(from, to, f);
    const people = new Map();
    const get = (name) => people.get(name) || people.set(name, { name, sold: [], rung: [], rets: [] }).get(name);
    lines.forEach((l) => { if (l.salesperson) get(l.salesperson).sold.push(l); if (l.cashier) get(l.cashier).rung.push(l); });
    rets.forEach((r) => { if (r.by && r.by !== 'System') get(r.by).rets.push(r); });
    const rows = [...people.values()].map((p) => {
      const revenue = sum(p.sold, (l) => l.revenue), orders = saleCount(p.sold);
      const commission = r2(p.sold.reduce((a, l) => a + num(l.revenue) * (COMMISSION[l.channel] || 0), 0));
      const role = p.sold.length && p.rung.length ? 'Sells and cashier' : p.rung.length ? 'Cashier' : p.sold.length ? 'Salesperson' : 'Returns only';
      return {
        _key: p.name, name: p.name, role, place: (p.sold[0] || p.rung[0] || {}).place || (p.rets[0] || {}).place || '', revenue, orders, aov: orders ? revenue / orders : 0,
        rung: saleCount(p.rung), rungValue: sum(p.rung, (l) => l.revenue), disc: sum(p.rung, (l) => l.disc), discRate: rate(sum(p.rung, (l) => l.disc), sum(p.rung, gross)),
        returns: p.rets.length, retValue: sum(p.rets.filter(isMoneyBack), (r) => r.amount), commission, _href: '/staff-profile',
      };
    }).sort((a, b) => b.revenue - a.revenue || b.rungValue - a.rungValue);
    const sold = sum(rows, (r) => r.revenue), commission = sum(rows, (r) => r.commission), disc = sum(rows, (r) => r.disc);
    const top = rows.filter((r) => r.revenue > 0).slice(0, 10);
    const generous = [...rows].sort((a, b) => b.disc - a.disc)[0];
    return {
      kpis: [
        { key: 'sold', label: 'Sold by staff', value: sold, format: 'money', good: 'up', sub: `${rows.filter((r) => r.revenue > 0).length} people selling` },
        { key: 'top', label: 'Top seller', value: top[0] ? top[0].name : '—', format: 'text', good: 'none', sub: top[0] ? fmt(top[0].revenue, 'money0') : '' },
        { key: 'commission', label: 'Commission earned', value: commission, format: 'money', good: 'none', sub: '1% of counter sales, 0.5% of wholesale' },
        { key: 'disc', label: 'Discounts given', value: disc, format: 'money', good: 'down', sub: generous && generous.disc ? `Most by ${generous.name} (${fmt(generous.disc, 'money0')})` : '' },
      ],
      chart: { type: 'hbar', labels: top.map((r) => r.name), series: [{ name: 'Sold', tone: 'primary', values: top.map((r) => r.revenue) }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Staff' },
          { key: 'role', label: 'Worked as' },
          { key: 'place', label: 'Branch' },
          { key: 'orders', label: 'Sales made', format: 'int', total: 'sum' },
          { key: 'revenue', label: 'Sold', format: 'money', total: 'sum' },
          { key: 'aov', label: 'Average sale', format: 'money', total: 'none' },
          { key: 'rung', label: 'Rung up', format: 'int', total: 'sum' },
          { key: 'disc', label: 'Discounts given', format: 'money', total: 'sum' },
          { key: 'discRate', label: 'Discount %', format: 'pct', total: 'none' },
          { key: 'returns', label: 'Returns handled', format: 'int', total: 'sum' },
          { key: 'commission', label: 'Commission', format: 'money', total: 'sum' },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        'Sold counts the sales a person is named on as salesperson ("Sold by"); rung up and discounts count the sales they took at the counter as cashier.',
        'Commission is 1% of counter sales and 0.5% of wholesale sales, before VAT. Phone orders taken by customer care count as sales but earn no commission.',
      ],
    };
  },
};

// ---- A6 Hour & weekday heatmap ---------------------------------------------------------------------
const WEEK = [['Sat', 6], ['Sun', 0], ['Mon', 1], ['Tue', 2], ['Wed', 3], ['Thu', 4], ['Fri', 5]];
const DAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);   // 8 AM to 11 PM
const hourText = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
const heatmap = {
  id: 'hour-weekday-heatmap',
  group: 'sales',
  title: 'Busy hours & days',
  description: 'When customers buy, by hour and day of the week, so you can staff up and time your offers.',
  icon: 'calendar-clock',
  keywords: 'heatmap hour weekday busy peak time staffing rush footfall when',
  filters: ['channel', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, now, filters }) {
    const f = filters || {};
    const lines = linesIn(from, to, f).filter((l) => f.channel || l.channel !== 'Wholesale');
    // how many of each weekday the period has (so every cell is an average day)
    const end = Math.min(to, addDays(startOfDay(now || Date.now()), 1));
    const times = [0, 0, 0, 0, 0, 0, 0];
    for (let t = from; t < end; t = addDays(t, 1)) times[new Date(t).getDay()] += 1;
    const cell = {}, ids = {}, byHour = {}, byDay = [0, 0, 0, 0, 0, 0, 0];
    lines.forEach((l) => {
      const d = new Date(l.at), wd = d.getDay(), h = d.getHours();
      const k = wd + '|' + h;
      cell[k] = (cell[k] || 0) + num(l.revenue);
      byDay[wd] += num(l.revenue);
      const bh = byHour[h] || (byHour[h] = { revenue: 0, ids: new Set() });
      bh.revenue += num(l.revenue); bh.ids.add(l.saleId || l.id);
      (ids[k] || (ids[k] = new Set())).add(l.saleId || l.id);
    });
    const hours = [...new Set([...HOURS, ...Object.keys(byHour).map(Number)])].sort((a, b) => a - b);
    const avg = (wd, h) => (times[wd] ? (cell[wd + '|' + h] || 0) / times[wd] : 0);
    const values = WEEK.map(([, wd]) => hours.map((h) => r2(avg(wd, h))));
    const total = sum(lines, (l) => l.revenue);
    const dayCount = times.reduce((a, x) => a + x, 0) || 1;
    const hourRows = hours.map((h) => { const x = byHour[h] || { revenue: 0, ids: new Set() }; return { _key: String(h), hour: h, label: hourText(h) + ' – ' + hourText((h + 1) % 24), orders: x.ids.size, revenue: r2(x.revenue), avg: x.revenue / dayCount, share: rate(x.revenue, total) }; });
    const bestHour = [...hourRows].sort((a, b) => b.revenue - a.revenue)[0];
    const dayAvg = byDay.map((v, wd) => (times[wd] ? v / times[wd] : 0));
    const bestDay = dayAvg.indexOf(Math.max(...dayAvg));
    let slot = null;
    WEEK.forEach(([name, wd], i) => hours.forEach((h, j) => { if (!slot || values[i][j] > slot.v) slot = { v: values[i][j], text: `${name} ${hourText(h)}` }; }));
    const evening = sum(hourRows.filter((r) => r.hour >= 17), (r) => r.revenue);
    return {
      kpis: [
        { key: 'bestHour', label: 'Busiest hour', value: bestHour && bestHour.revenue ? hourText(bestHour.hour) : '—', format: 'text', good: 'none', sub: bestHour && bestHour.revenue ? `${fmt(bestHour.avg, 'money0')} on an average day` : '' },
        { key: 'bestDay', label: 'Busiest day', value: total ? DAY_NAME[bestDay] : '—', format: 'text', good: 'none', sub: total ? `${fmt(dayAvg[bestDay], 'money0')} on an average ${DAY_NAME[bestDay]}` : '' },
        { key: 'slot', label: 'Peak slot', value: slot && slot.v ? slot.text : '—', format: 'text', good: 'none', sub: slot && slot.v ? `${fmt(slot.v, 'money0')} an hour` : '' },
        { key: 'evening', label: 'Sold after 5 PM', value: rate(evening, total), format: 'pct', good: 'none', sub: fmt(evening, 'money0') },
      ],
      chart: { type: 'heatmap', rows: WEEK.map(([n]) => n), cols: hours.map((h) => String(h)), values, format: 'money0' },
      table: {
        columns: [
          { key: 'label', label: 'Hour' },
          { key: 'orders', label: 'Sales', format: 'int', total: 'sum' },
          { key: 'revenue', label: 'Sold', format: 'money', total: 'sum' },
          { key: 'avg', label: 'On an average day', format: 'money', total: 'none' },
          { key: 'share', label: 'Share', format: 'pct', total: total ? 1 : 0 },
        ],
        rows: hourRows,
        sort: { key: 'hour', dir: 'asc' },
      },
      notes: [
        'Each square is the average sold in that hour on that day of the week (hours on the 24-hour clock). Counter and online sales are counted; wholesale only when you choose it.',
        'Online orders count at the hour they were placed.',
      ],
    };
  },
};

// ---- A7 Payment methods ----------------------------------------------------------------------------
/** The partner whose fee a payment method pays (online wallets go through their gateways). */
const FEE_PARTNER = (method, channel) => (method === 'Card' ? 'card' : method === 'Gateway' ? 'sslcommerz' : channel === 'Online' && method === 'bKash' ? 'bkash-pgw' : channel === 'Online' && method === 'Nagad' ? 'nagad-pgw' : '');
const METHOD_LABEL = { Gateway: 'Online payment (card / wallet)', COD: 'Cash on delivery', Due: 'Due (unpaid)', Mixed: 'Split payment' };
const paymentMethods = {
  id: 'payment-methods',
  group: 'sales',
  title: 'Payment methods',
  description: 'How customers paid: cash, bKash, Nagad, card, online payment, cash on delivery or due, and what the payment partners charged.',
  icon: 'wallet',
  keywords: 'payment method cash bkash nagad card cod gateway due mixed fees tender',
  filters: ['channel'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const lines = linesIn(from, to, f);
    const fees = {};
    const feeRate = (id) => (id in fees ? fees[id] : (fees[id] = num(safe(() => partnerBy(id), {}).fee) / 100));
    const total = sum(lines, (l) => num(l.revenue) + num(l.vat));
    const rows = [...groupBy(lines, (l) => l.method || 'Not recorded')].map(([method, list]) => {
      const amount = sum(list, (l) => num(l.revenue) + num(l.vat));
      const fee = r2(list.reduce((a, l) => { const id = FEE_PARTNER(method, l.channel); return a + (id ? (num(l.revenue) + num(l.vat)) * feeRate(id) : 0); }, 0));
      const chans = [...new Set(list.map((l) => l.channel))].join(', ');
      return { _key: method, method: METHOD_LABEL[method] || method, raw: method, channels: chans, count: saleCount(list), amount, share: rate(amount, total), fee, feeRate: rate(fee, amount), net: r2(amount - fee) };
    }).sort((a, b) => b.amount - a.amount);
    const slices = rows.length > 6 ? [...rows.slice(0, 5), { method: 'Everything else', amount: sum(rows.slice(5), (r) => r.amount) }] : rows;
    const cash = sum(rows.filter((r) => r.raw === 'Cash'), (r) => r.amount);
    const due = sum(rows.filter((r) => r.raw === 'Due'), (r) => r.amount);
    const cod = sum(rows.filter((r) => r.raw === 'COD'), (r) => r.amount);
    const digital = r2(total - cash - due - cod - sum(rows.filter((r) => r.raw === 'Mixed'), (r) => r.amount));
    const fee = sum(rows, (r) => r.fee);
    return {
      kpis: [
        { key: 'total', label: 'Paid for goods', value: total, format: 'money', good: 'up', sub: `${fmt(saleCount(lines), 'int')} sales, VAT included` },
        { key: 'cash', label: 'Cash at the counter', value: rate(cash, total), format: 'pct', good: 'none', sub: fmt(cash, 'money0') },
        { key: 'digital', label: 'Digital payments', value: rate(digital, total), format: 'pct', good: 'up', sub: `${fmt(digital, 'money0')} by bKash, Nagad, card and online` },
        { key: 'cod', label: 'Cash on delivery', value: cod, format: 'money', good: 'none', sub: `${pctText(cod, total)} of sales` },
        { key: 'fee', label: 'Partner fees', value: fee, format: 'money', good: 'down', sub: due ? `Due (unpaid) ${fmt(due, 'money0')}` : '' },
      ],
      chart: { type: 'donut', labels: slices.map((r) => r.method), series: [{ name: 'Paid', values: slices.map((r) => r.amount) }], format: 'money0' },
      table: {
        columns: [
          { key: 'method', label: 'Paid by' },
          { key: 'channels', label: 'Channels' },
          { key: 'count', label: 'Sales', format: 'int', total: 'sum' },
          { key: 'amount', label: 'Amount', format: 'money', total: 'sum' },
          { key: 'share', label: 'Share', format: 'pct', total: total ? 1 : 0 },
          { key: 'feeRate', label: 'Fee rate', format: 'pct', total: rate(fee, total) },
          { key: 'fee', label: 'Fees', format: 'money', total: 'sum' },
          { key: 'net', label: 'After fees', format: 'money', total: 'sum' },
        ],
        rows,
        sort: { key: 'amount', dir: 'desc' },
      },
      notes: [
        'Amounts are what customers paid for the goods with VAT, without delivery charges, by the main way the sale was paid (a sale paid two ways is a split payment).',
        'Fees use the rates set in Accounts › Settlements: card machine for card, SSLCOMMERZ for online payments, the bKash and Nagad gateways for online wallet payments. Counter bKash and Nagad go to the shop’s own wallet with no fee.',
      ],
    };
  },
};

// ---- A8 Discounts given ----------------------------------------------------------------------------
const discountsGiven = {
  id: 'discounts-given',
  group: 'sales',
  title: 'Discounts given',
  description: 'What discounts cost you: every discounted sale with who gave it, where, on which products and the coupon used.',
  icon: 'badge-percent',
  keywords: 'discount coupon markdown price cut promotion staff cashier leakage',
  filters: ['channel', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const lines = linesIn(from, to, f);
    const g = sum(lines, gross);
    const coupons = typeof window === 'undefined' ? {} : Object.fromEntries(safe(() => load(POS_KEYS.sales, []), []).filter((s) => s && s.coupon).map((s) => [s.id, s.coupon]));
    const off = lines.filter((l) => num(l.disc) > 0.004);
    const offIds = new Set(off.map((l) => l.saleId || l.id));
    const sales = [...groupBy(lines.filter((l) => offIds.has(l.saleId || l.id)),(l) => l.saleId || l.id)].map(([id, list]) => {
      const disc = sum(list, (l) => l.disc), full = sum(list, gross);
      const l0 = list[0];
      const items = list.filter((l) => num(l.disc) > 0.004).sort((a, b) => b.disc - a.disc).map((l) => l.name);
      return {
        _key: id, at: l0.at, id, channel: l0.channel, place: l0.place || '', staff: l0.cashier || l0.salesperson || (l0.channel === 'Online' ? 'Online order' : ''), products: items.join(', '),
        coupon: coupons[id] || '', full, disc, rate: rate(disc, full), revenue: sum(list, (l) => l.revenue),
        _href: l0.channel === 'Online' && !l0.est ? orderHref(id) : l0.channel === 'Wholesale' && !l0.est ? '/sales-invoice?id=' + encodeURIComponent(id) : l0.channel === 'Retail' && !l0.est ? '/sales-book' : null,
      };
    }).sort((a, b) => b.disc - a.disc);
    const disc = sum(lines, (l) => l.disc);
    const byStaff = [...groupBy(sales, (s) => s.staff || 'Not recorded')].map(([name, list]) => ({ name, disc: sum(list, (s) => s.disc) })).sort((a, b) => b.disc - a.disc);
    const byProduct = [...groupBy(off, (l) => l.name)].map(([name, list]) => ({ name, disc: sum(list, (l) => l.disc) })).sort((a, b) => b.disc - a.disc);
    const byPlace = [...groupBy(sales, (s) => s.place || s.channel)].map(([name, list]) => ({ name, disc: sum(list, (s) => s.disc) })).sort((a, b) => b.disc - a.disc);
    const top = byStaff.slice(0, 10);
    return {
      kpis: [
        { key: 'disc', label: 'Discounts given', value: disc, format: 'money', good: 'down', sub: `${pctText(disc, g)} of ${fmt(g, 'money0')} at full price` },
        { key: 'sales', label: 'Sales with a discount', value: sales.length, format: 'int', good: 'down', sub: `${pctText(sales.length, saleCount(lines))} of all sales` },
        { key: 'staff', label: 'Most given by', value: byStaff[0] ? byStaff[0].name : '—', format: 'text', good: 'none', sub: byStaff[0] ? fmt(byStaff[0].disc, 'money0') : '' },
        { key: 'product', label: 'Most discounted product', value: byProduct[0] ? byProduct[0].name : '—', format: 'text', good: 'none', sub: byProduct[0] ? fmt(byProduct[0].disc, 'money0') : '' },
        { key: 'place', label: 'Most discounts at', value: byPlace[0] ? byPlace[0].name : '—', format: 'text', good: 'none', sub: byPlace[0] ? fmt(byPlace[0].disc, 'money0') : '' },
      ],
      chart: { type: 'hbar', labels: top.map((r) => r.name), series: [{ name: 'Discount', tone: 'warning', values: top.map((r) => r.disc) }], format: 'money0' },
      table: {
        columns: [
          { key: 'at', label: 'When', format: 'datetime' },
          { key: 'id', label: 'Sale' },
          { key: 'channel', label: 'Channel' },
          { key: 'place', label: 'Place' },
          { key: 'staff', label: 'Given by' },
          { key: 'products', label: 'Discounted products' },
          { key: 'coupon', label: 'Coupon' },
          { key: 'full', label: 'At full price', format: 'money', total: 'sum' },
          { key: 'disc', label: 'Discount', format: 'money', total: 'sum' },
          { key: 'rate', label: 'Discount %', format: 'pct', total: rate(sum(sales, (s) => s.disc), sum(sales, (s) => s.full)) },
        ],
        rows: sales,
        sort: { key: 'disc', dir: 'desc' },
      },
      notes: [
        'A sale’s discount includes line discounts and its share of cart, coupon, member and points discounts. Counter discounts count under the cashier who took the sale.',
        'Coupons show for sales made at this POS since coupons were saved on the sale.',
      ],
    };
  },
};

// ---- A9 Returns analysis ---------------------------------------------------------------------------
const returnsAnalysis = {
  id: 'returns-analysis',
  group: 'sales',
  title: 'Returns analysis',
  description: 'What comes back and why: return rate by product and channel, reasons, restocked or damaged, and how the money went back.',
  icon: 'undo-2',
  keywords: 'returns exchange refund reason damaged restock return rate faulty wrong size',
  filters: ['channel'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const rows0 = returnsIn(from, to, f);
    const lines = linesIn(from, to, f);
    const catalog = safe(() => getCatalog(), []);
    const per = returnedByProduct(rows0, catalog);
    const soldBy = {};
    lines.forEach((l) => { const k = l.sku || l.name; const x = soldBy[k] || (soldBy[k] = { qty: 0, revenue: 0 }); x.qty += num(l.qty); x.revenue += num(l.revenue); });
    const rows = Object.values(per).map((x) => {
      const sold = soldBy[x.key] || { qty: 0, revenue: 0 };
      const top = Object.entries(x.reasons).sort((a, b) => b[1] - a[1])[0];
      return { _key: x.key, name: x.name, cat: x.cat, count: x.count, qty: x.qty, value: r2(x.value), sold: sold.qty, rate: sold.qty ? x.qty / sold.qty : null, restock: x.restock, damaged: x.damaged, reason: top ? top[0] : '', _href: productHref(catalog.some((p) => p.sku === x.key) ? x.key : '') };
    }).sort((a, b) => b.qty - a.qty);
    const money = rows0.filter(isMoneyBack);
    const back = sum(money, (r) => r.amount);
    const revenue = sum(lines, (l) => l.revenue);
    const restock = sum(rows, (r) => r.restock), damaged = sum(rows, (r) => r.damaged);
    const reasons = [...groupBy(rows0, (r) => r.reason || 'No reason given')].map(([name, list]) => ({ name, n: list.length })).sort((a, b) => b.n - a.n).slice(0, 10);
    const chanText = CHANNELS.filter((c) => !f.channel || c === f.channel).map((c) => {
      const amt = sum(money.filter((r) => r.channel === c), (r) => r.amount), rev = sum(lines.filter((l) => l.channel === c), (l) => l.revenue);
      return `${c} ${pctText(amt, rev)}`;
    }).join(' · ');
    const methods = [...groupBy(money, (r) => r.method || 'Not recorded')].map(([m, list]) => `${m} ${fmt(sum(list, (r) => r.amount), 'money0')}`).join(' · ');
    return {
      kpis: [
        { key: 'count', label: 'Returns & exchanges', value: rows0.length, format: 'int', good: 'down', sub: `${rows0.filter((r) => r.type === 'exchange').length} exchanges` },
        { key: 'back', label: 'Money given back', value: back, format: 'money', good: 'down', sub: methods || 'None' },
        { key: 'rate', label: 'Return rate', value: rate(back, revenue), format: 'pct', good: 'down', sub: chanText },
        { key: 'restock', label: 'Back on the shelf', value: rate(restock, restock + damaged), format: 'pct', good: 'up', sub: `${fmt(restock, 'int')} restocked · ${fmt(damaged, 'int')} damaged` },
      ],
      chart: { type: 'hbar', labels: reasons.map((r) => r.name), series: [{ name: 'Returns', tone: 'danger', values: reasons.map((r) => r.n) }], format: 'int' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'count', label: 'Returns', format: 'int', total: 'sum' },
          { key: 'qty', label: 'Pieces back', format: 'int', total: 'sum' },
          { key: 'sold', label: 'Pieces sold', format: 'int', total: 'sum' },
          { key: 'rate', label: 'Return rate', format: 'pct', total: 'none' },
          { key: 'value', label: 'Money back', format: 'money', total: 'sum' },
          { key: 'restock', label: 'Restocked', format: 'int', total: 'sum' },
          { key: 'damaged', label: 'Damaged', format: 'int', total: 'sum' },
          { key: 'reason', label: 'Main reason' },
        ],
        rows,
        sort: { key: 'qty', dir: 'desc' },
      },
      notes: [
        'From the return history (Online, Retail and Wholesale). The return rate is money given back against sales in the same period; per product it is pieces back against pieces sold.',
        'Money back includes refunds and amounts taken off a customer’s due; exchanges move no money.',
      ],
    };
  },
};

// ---- A10 Cancelled & void sales --------------------------------------------------------------------
const VOID_ACTIONS = ['Void sale', 'Void line', 'Price override', 'Discount above limit', 'Credit limit'];
/** Usual reasons an online order is cancelled before it ships (demo orders made from the day totals
 *  carry no note, so they are given one of these the same way every time). */
const CANCEL_REASONS = ['Customer changed their mind', 'Could not reach the customer to confirm', 'Duplicate order', 'Item out of stock', 'Delivery charge too high'];
const hashOf = (s) => String(s).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function cancelReason(o) {
  if (!o.est) {
    const e = safe(() => logOf(o.id), []).find((x) => x && x.icon === 'circle-x');
    if (e && e.title && e.title !== 'Order cancelled') return e.title;
    return 'Not recorded';
  }
  return CANCEL_REASONS[hashOf(o.id) % CANCEL_REASONS.length];
}
const cancelledVoids = {
  id: 'cancelled-voids',
  group: 'sales',
  title: 'Cancelled & void sales',
  description: 'Leakage at the counter and online: cancelled orders by reason, and voids and price overrides at the POS by staff.',
  icon: 'ban',
  keywords: 'cancelled void cancel override leakage loss manager pin price change counter fraud',
  filters: ['channel'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const showOnline = !f.channel || f.channel === 'Online';
    const showPos = !f.channel || f.channel !== 'Online';
    const orders = showOnline && typeof salesBook.getOnlineOrders === 'function' ? safe(() => salesBook.getOnlineOrders(), []) : [];
    const cancelled = orders.filter((o) => o && o.status === 'Cancelled').map((o) => ({ o, when: (o.times && o.times.cancelled) || o.at })).filter((x) => x.when >= from && x.when < to);
    const audit = showPos ? safe(() => getAuditLog(), []).filter((a) => a && VOID_ACTIONS.includes(a.action) && a.at >= from && a.at < to) : [];
    const rows = [
      ...cancelled.map(({ o, when }) => ({ _key: o.id, at: when, kind: 'Online order cancelled', ref: o.id, who: o.customer || '', staff: '', reason: cancelReason(o), amount: num(o.subtotal), status: 'Cancelled', _href: o.est ? null : orderHref(o.id) })),
      ...audit.map((a) => ({ _key: a.id, at: a.at, kind: a.action, ref: a.ref || a.id, who: a.counter || a.place || '', staff: a.by || '', reason: a.detail || '', amount: num(a.amount), status: a.ok === false ? 'Refused (wrong PIN)' : a.approvedBy ? `Approved by ${a.approvedBy}` : 'Done', _href: '/pos-manage' })),
    ].sort((a, b) => b.at - a.at);
    const lost = sum(rows.filter((r) => !/^Refused/.test(r.status)), (r) => r.amount);
    const onlineLost = sum(rows.filter((r) => r.kind === 'Online order cancelled'), (r) => r.amount);
    const voids = rows.filter((r) => r.kind !== 'Online order cancelled' && !/^Refused/.test(r.status));
    const byStaff = [...groupBy(voids, (r) => r.staff || 'Not recorded')].map(([name, list]) => ({ name, n: list.length, amount: sum(list, (r) => r.amount) })).sort((a, b) => b.n - a.n || b.amount - a.amount);
    const reasons = [...groupBy(rows.filter((r) => !/^Refused/.test(r.status)), (r) => (r.kind === 'Online order cancelled' ? r.reason : 'POS: ' + r.kind.toLowerCase()))].map(([name, list]) => ({ name, n: list.length })).sort((a, b) => b.n - a.n).slice(0, 10);
    const refused = rows.filter((r) => /^Refused/.test(r.status)).length;
    return {
      kpis: [
        { key: 'cancelled', label: 'Online orders cancelled', value: cancelled.length, format: 'int', good: 'down', sub: `${fmt(onlineLost, 'money0')} of goods` },
        { key: 'voids', label: 'Voids & overrides', value: voids.length, format: 'int', good: 'down', sub: `${fmt(sum(voids, (r) => r.amount), 'money0')} at the counters` },
        { key: 'staff', label: 'Most voids by', value: byStaff[0] ? byStaff[0].name : '—', format: 'text', good: 'none', sub: byStaff[0] ? `${byStaff[0].n} · ${fmt(byStaff[0].amount, 'money0')}` : '' },
        { key: 'refused', label: 'Refused by a manager', value: refused, format: 'int', good: 'none', sub: 'Wrong PIN, so it did not happen' },
        { key: 'lost', label: 'Value cancelled', value: lost, format: 'money', good: 'down' },
      ],
      chart: { type: 'hbar', labels: reasons.map((r) => r.name), series: [{ name: 'Times', tone: 'danger', values: reasons.map((r) => r.n) }], format: 'int' },
      table: {
        columns: [
          { key: 'at', label: 'When', format: 'datetime' },
          { key: 'kind', label: 'What' },
          { key: 'ref', label: 'Order or ref' },
          { key: 'staff', label: 'Staff' },
          { key: 'who', label: 'Customer or counter' },
          { key: 'reason', label: 'Reason' },
          { key: 'amount', label: 'Amount', format: 'money', total: 'sum' },
          { key: 'status', label: 'Result' },
        ],
        rows,
        sort: { key: 'at', dir: 'desc' },
      },
      notes: [
        'Online: orders cancelled before they went out, at the value of the goods. POS: voided sales and lines, price overrides and discounts or credit above the limit from the manager approval log.',
        'September demo cancellations carry a typical reason; orders you cancel show the reason you gave.',
      ],
    };
  },
};

export default [salesSummary, salesByBranch, salesByProduct, salesByCategory, salesByStaff, heatmap, paymentMethods, discountsGiven, returnsAnalysis, cancelledVoids];
