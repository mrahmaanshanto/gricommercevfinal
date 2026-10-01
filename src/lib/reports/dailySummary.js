// reports/dailySummary — the owner's end-of-day pack for one day, worked out from the shared books:
//   sales by channel (sales book) and by branch (sale lines) · orders placed, delivered, returned
//   cash, bank and wallets at closing (ledger) · payouts that arrived and those running late (settlements)
//   low stock (as of now) · dues collected (invoice payments) · expenses · the day's top 5 products
// Used by the Daily summary page and by Scheduled reports (the message preview). Pure: reads only.

import * as salesBook from '../salesBook';
import { getOrders, isCounterSale } from '../orders';
import { getEntries, OWN_ACCOUNTS } from '../ledger';
import { getPayouts, clockNow, startOfDay } from '../settlements';
import { getPlaces } from '../locations';
import { placeStock } from '../stock';
import { getInvoices } from '../invoices';
import { POS_KEYS, load } from '../posStore';
import { formatBDT } from '../format';
import { addDays } from './period';
import { EXPENSE_KINDS } from './defs/finance';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const inDay = (t, from, to) => typeof t === 'number' && t >= from && t < to;
const CHANNELS = ['Retail', 'Online', 'Wholesale'];
const money = (n) => (n < 0 ? '−' : '') + formatBDT(Math.abs(Math.round(n)));

/** The pack for the day that contains `day`. */
export function dailySummary(day, now = clockNow()) {
  const from = startOfDay(day), to = addDays(from, 1);
  const asOf = Math.min(to - 1, now);

  // ---- sales ----
  const ch = safe(() => salesBook.salesByChannel(from, to), null);
  const byChannel = CHANNELS.map((c) => ({ channel: c, revenue: ch ? ch[c].revenue : 0, returns: ch ? ch[c].returns : 0, orders: ch ? ch[c].orders : 0 }));
  const lines = safe(() => (typeof salesBook.getSaleLines === 'function' ? salesBook.getSaleLines() : []), []).filter((l) => inDay(l.at, from, to));
  const placeMap = new Map();
  lines.forEach((l) => {
    const key = l.place || (l.channel === 'Online' ? 'Online store' : 'Place not recorded');
    const p = placeMap.get(key) || placeMap.set(key, { place: key, revenue: 0, bills: new Set(), channels: new Set() }).get(key);
    p.revenue += Number(l.revenue) || 0; p.bills.add(l.saleId || l.id); p.channels.add(l.channel);
  });
  const byPlace = [...placeMap.values()].map((p) => ({ place: p.place, revenue: r2(p.revenue), bills: p.bills.size, channels: [...p.channels].join(', ') })).sort((a, b) => b.revenue - a.revenue);
  const sales = { total: ch ? ch.all.revenue : 0, returns: ch ? ch.all.returns : 0, net: ch ? ch.all.net : 0, orders: ch ? ch.all.orders : 0, gross: ch ? ch.all.gross : 0, est: !!(ch && ch.all.est), byChannel, byPlace, hasLines: lines.length > 0 };

  // ---- top products ----
  let items = lines.map((l) => ({ key: l.sku || l.name, name: l.name, sku: l.sku || '', qty: Number(l.qty) || 0, revenue: Number(l.revenue) || 0 }));
  if (!lines.length) {
    // before the line book: the bills made in this browser and the demo invoices
    const pos = safe(() => load(POS_KEYS.sales, []), []);
    const ids = new Set(pos.map((s) => s.id));
    const bills = [...pos, ...safe(() => getInvoices(), []).filter((i) => !ids.has(i.id))].filter((s) => inDay(s.at, from, to));
    items = bills.flatMap((s) => (s.lines || []).map((l) => ({ key: l.sku || l.name, name: l.name, sku: l.sku || '', qty: Number(l.qty) || 0, revenue: (Number(l.qty) || 0) * (Number(l.price) || 0) - (Number(l.disc) || 0) })));
  }
  const prodMap = new Map();
  items.forEach((x) => { const p = prodMap.get(x.key) || prodMap.set(x.key, { name: x.name, sku: x.sku, qty: 0, revenue: 0 }).get(x.key); p.qty += x.qty; p.revenue += x.revenue; });
  const top = [...prodMap.values()].map((p) => ({ ...p, revenue: r2(p.revenue) })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // ---- orders ----
  const all = safe(() => getOrders(), []).filter((o) => !isCounterSale(o));
  const when = (o, k, status) => (o.times && o.times[k] != null ? o.times[k] : !o.times && o.statusKey === status ? o.at : null);
  const orders = {
    placed: ch ? ch.Online.orders : all.filter((o) => inDay(o.at, from, to)).length,
    delivered: all.filter((o) => inDay(when(o, 'delivered', 'delivered'), from, to)).length,
    returned: all.filter((o) => inDay(when(o, 'returned', 'returned'), from, to)).length,
    cancelled: all.filter((o) => inDay(when(o, 'cancelled', 'cancelled'), from, to)).length,
    waiting: all.filter((o) => o.statusKey === 'pending').length,
  };

  // ---- money at closing ----
  const entries = safe(() => getEntries(), []);
  const own = safe(() => OWN_ACCOUNTS(), []);
  const ownIds = new Map(own.map((a) => [a.id, a.type]));
  const cash = ['Cash', 'Bank', 'Mobile'].map((type) => {
    const accs = own.filter((a) => a.type === type);
    const ids = new Set(accs.map((a) => a.id));
    const mine = entries.filter((e) => ids.has(e.account));
    const opening = r2(accs.reduce((a, x) => a + (Number(x.opening) || 0), 0) + mine.filter((e) => e.at < from).reduce((a, e) => a + e.amount, 0));
    const today = mine.filter((e) => inDay(e.at, from, to));
    const cin = r2(today.filter((e) => e.amount > 0).reduce((a, e) => a + e.amount, 0));
    const out = r2(-today.filter((e) => e.amount < 0).reduce((a, e) => a + e.amount, 0));
    return { type, label: type === 'Mobile' ? 'Mobile wallets' : type === 'Bank' ? 'Banks' : 'Cash', accounts: accs.length, opening, in: cin, out, closing: r2(opening + cin - out) };
  });

  // ---- payouts ----
  const payouts = safe(() => getPayouts(asOf), []);
  const arrived = payouts.filter((p) => (p.status === 'received' || p.status === 'review') && inDay(p.at, from, to)).map((p) => ({ id: p.id, partner: (p.p && (p.p.short || p.p.name)) || p.partner, amount: r2(p.received != null ? p.received : p.net), expected: p.net, short: p.status === 'review' }));
  const late = payouts.filter((p) => p.late).map((p) => ({ id: p.id, partner: (p.p && (p.p.short || p.p.name)) || p.partner, amount: p.net, due: p.due }));
  const dueToday = payouts.filter((p) => (p.status === 'expected' || p.status === 'delayed') && !p.late && inDay(p.due, from, to)).map((p) => ({ id: p.id, partner: (p.p && (p.p.short || p.p.name)) || p.partner, amount: p.net }));

  // ---- low stock (now) ----
  const low = [];
  safe(() => getPlaces({ active: true }), []).filter((p) => !p.noSale && !p.opening).forEach((pl) => {
    safe(() => placeStock(pl.name).rows, []).filter((r) => r.low).forEach((r) => low.push({ name: r.p.name, sku: r.p.sku, place: pl.name, available: r.available }));
  });
  low.sort((a, b) => a.available - b.available);

  // ---- dues collected, expenses ----
  const duesList = entries.filter((e) => e.kind === 'invoice payment' && e.amount > 0 && ownIds.has(e.account) && inDay(e.at, from, to));
  const expList = entries.filter((e) => EXPENSE_KINDS.includes(e.kind) && e.amount < 0 && inDay(e.at, from, to));
  const expCats = new Map();
  expList.forEach((e) => { const k = e.cat || (e.kind === 'paid out' ? 'Paid out at counters' : e.kind === 'salary' ? 'Salary' : 'Other'); expCats.set(k, r2((expCats.get(k) || 0) - e.amount)); });

  const out = {
    from, to, asOf, sales, top, orders, cash,
    cashTotal: r2(cash.reduce((a, c) => a + c.closing, 0)),
    payouts: { arrived, arrivedTotal: r2(arrived.reduce((a, p) => a + p.amount, 0)), late, lateTotal: r2(late.reduce((a, p) => a + p.amount, 0)), dueToday },
    low: { count: low.length, items: low.slice(0, 5) },
    dues: { collected: r2(duesList.reduce((a, e) => a + e.amount, 0)), count: duesList.length, list: duesList.map((e) => ({ ref: e.ref || '', party: e.party || '', amount: e.amount })) },
    expenses: { total: r2(expList.reduce((a, e) => a - e.amount, 0)), count: expList.length, byCat: [...expCats].map(([cat, amount]) => ({ cat, amount })).sort((a, b) => b.amount - a.amount) },
  };
  out.figures = keyFigures(out);
  return out;
}

/** The short list of figures a message carries: [[label, text]]. */
export function keyFigures(d) {
  return [
    ['Sales', `${money(d.sales.total)} · ${CHANNELS.map((c) => `${c} ${money((d.sales.byChannel.find((x) => x.channel === c) || {}).revenue || 0)}`).join(', ')}`],
    ['Orders', `${d.orders.placed} online placed · ${d.orders.delivered} delivered · ${d.orders.returned} returned`],
    ['Money at closing', `${money(d.cashTotal)} (${d.cash.map((c) => `${c.label} ${money(c.closing)}`).join(', ')})`],
    ['Payouts', `${money(d.payouts.arrivedTotal)} arrived${d.payouts.late.length ? ` · ${d.payouts.late.length} late (${money(d.payouts.lateTotal)})` : ''}`],
    ['Dues collected', money(d.dues.collected)],
    ['Expenses', money(d.expenses.total)],
    ['Low stock', `${d.low.count} product${d.low.count === 1 ? '' : 's'} at or under the low mark`],
    ...(d.top[0] ? [['Best seller', `${d.top[0].name} (${money(d.top[0].revenue)})`]] : []),
  ];
}
