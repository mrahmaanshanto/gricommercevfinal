// Reports · Online & delivery group. See ../catalogue.js for the definition contract.
// Orders come from salesBook.getOnlineOrders (the demo September orders behind the online days plus
// every online order in Orders), else from orders.js; POS and wholesale counter sales are left out.
// Money the couriers collected comes from settlements.js; sales per zone and source come from the
// sale lines (salesBook), so they match Sales & profit.

import { getOrders, isCounterSale, duplicatesOf, rtoState, logOf } from '../../orders';
import { courierHistory, DELIVERY_RATES } from '../../orderLinks';
import { getItems, getPayouts, costsOf, partnerBy, courierPartner, courierChargeOf, PARTNERS } from '../../settlements';
import { productBy, unitValue } from '../../stock';
import * as salesBook from '../../salesBook';
import { NEW_KEYS, statusKeyOf } from '../../orderStatus';
import { sum, groupBy, fmt } from '../period';

// ---- shared helpers -------------------------------------------------------------------------------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const rate = (a, b) => (b ? a / b : 0);
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const orderHref = (id) => '/order-detail?id=' + encodeURIComponent(id);
const ZONES = ['Inside Dhaka', 'Sub-Dhaka', 'Outside Dhaka'];
const SOURCES = ['Website', 'Facebook', 'Phone', 'Order link', 'Chat'];
const TONES = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];

const norm = (o) => {
  const lines = o.lines || [];
  return {
    ...o, amount: Number(o.amount) || 0, subtotal: Number(o.subtotal) || 0, shipping: Number(o.shipping) || 0,
    statusKey: o.statusKey || statusKeyOf(o.status, o.payment),
    units: o.units != null ? o.units : sum(lines, (l) => l.qty),
    itemTitle: o.itemTitle || (lines[0] ? lines[0].name + (lines.length > 1 ? ` + ${lines.length - 1} more` : '') : ''),
  };
};
/** Online orders (not counter or wholesale sales), each with statusKey, amount, units and itemTitle. */
function onlineOrders() {
  const built = typeof salesBook.getOnlineOrders === 'function' ? safe(() => salesBook.getOnlineOrders(), null) : null;
  const list = built && built.length ? built : safe(() => getOrders(), []).filter((o) => o && !o.isInvoice && !safe(() => isCounterSale(o), false));
  return list.filter(Boolean).map(norm);
}
const inP = (t, from, to) => typeof t === 'number' && t >= from && t < to;
const keyOf = (o) => o.statusKey;
/** The order page for a real order; demo orders made from the day totals have no page. */
const hrefOf = (o) => (o.est ? null : orderHref(o.id));
/** Delivered and returned among parcels whose trip has ended; the RTO rate is returned ÷ both. */
const ended = (list) => { const d = list.filter((o) => keyOf(o) === 'delivered').length, r = list.filter((o) => keyOf(o) === 'returned').length; return { d, r, n: d + r, rto: rate(r, d + r) }; };
const wentOut = (o) => ['shipped', 'delivered', 'returned'].includes(keyOf(o));
const timeOf = (o, k) => (o.times && typeof o.times[k] === 'number' ? o.times[k] : null);
/** Where an order came from: its own `source`, else read from the channel it was taken on. */
export function sourceOf(o) {
  if (o.source && SOURCES.includes(o.source)) return o.source;
  const ch = String(o.channel || o.source || '').toLowerCase();
  if (/facebook|fb|instagram/.test(ch)) return 'Facebook';
  if (/link/.test(ch)) return 'Order link';
  if (/chat|inbox|messenger|whatsapp/.test(ch)) return 'Chat';
  if (/manual|phone|call/.test(ch)) return 'Phone';
  return 'Website';
}
const zoneOf = (z) => (ZONES.includes(z) ? z : /sub/i.test(z || '') ? 'Sub-Dhaka' : /outside/i.test(z || '') ? 'Outside Dhaka' : /inside|dhaka/i.test(z || '') ? 'Inside Dhaka' : 'Not set');
/** The courier partner of an order (Pathao, Steadfast …) or null for not assigned / store pickup. */
const partnerOf = (o) => safe(() => courierPartner(o.courier), null);
const courierName = (id) => (partnerBy(id) || {}).short || id;
/** Parcels: orders given to a courier and not cancelled. */
const parcelsOf = (list) => list.filter((o) => partnerOf(o) && keyOf(o) !== 'cancelled');

/**
 * Online sales [{ id, at, zone, source, revenue, est }] in [from, to): from the sale lines when the sales
 * book has them (one sale per saleId), else from the orders that were not cancelled.
 */
function onlineSales(from, to) {
  const lines = typeof salesBook.getSaleLines === 'function' ? safe(() => salesBook.getSaleLines(), []) : [];
  const online = (lines || []).filter((l) => l && l.channel === 'Online');
  if (online.length) {
    return [...groupBy(online.filter((l) => inP(l.at, from, to)), (l) => l.saleId || l.id)].map(([id, list]) => ({
      id, at: list[0].at, zone: zoneOf(list[0].zone), source: SOURCES.includes(list[0].source) ? list[0].source : 'Website',
      revenue: sum(list, (l) => l.revenue), delivery: null, est: list.some((l) => l.est),
    }));
  }
  return onlineOrders().filter((o) => inP(o.at, from, to) && keyOf(o) !== 'cancelled')
    .map((o) => ({ id: o.id, at: o.at, zone: zoneOf(o.zone), source: sourceOf(o), revenue: Number(o.subtotal) || 0, delivery: Number(o.shipping) || 0, est: false }));
}
const feeOf = (zone) => (DELIVERY_RATES.find((r) => r.label === zone) || {}).fee || 0;

// ---- order funnel ---------------------------------------------------------------------------------
const RANK = { pending: 0, approved: 1, ready: 1, shipped: 2, delivered: 3, returned: 2, cancelled: 0 };
const orderFunnel = {
  id: 'order-funnel',
  group: 'online',
  title: 'Order funnel',
  description: 'How many online orders got approved, shipped and delivered, where they dropped off and how long each step took.',
  icon: 'filter',
  keywords: 'conversion approved shipped delivered cancelled returned steps time',
  filters: ['zone'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const list = onlineOrders().filter((o) => inP(o.at, from, to) && (!filters.zone || zoneOf(o.zone) === filters.zone));
    const reached = (o, step) => {
      const k = keyOf(o);
      if (timeOf(o, step) != null) return true;
      if (step === 'placed') return true;
      if (step === 'returned' || step === 'cancelled') return k === step;
      return (RANK[k] ?? 0) >= { approved: 1, shipped: 2, delivered: 3 }[step];
    };
    const steps = ['placed', 'approved', 'shipped', 'delivered'];
    const hoursBetween = (a, b) => {
      const gaps = list.map((o) => { const x = a === 'placed' ? (timeOf(o, 'placed') ?? o.at) : timeOf(o, a); const y = timeOf(o, b); return x != null && y != null && y >= x ? (y - x) / 36e5 : null; }).filter((h) => h != null);
      return gaps.length ? gaps.reduce((s, h) => s + h, 0) / gaps.length : null;
    };
    const count = (step) => list.filter((o) => reached(o, step)).length;
    const value = (step) => sum(list.filter((o) => reached(o, step)), (o) => o.amount);
    const placed = list.length;
    const LABEL = { placed: 'Placed', approved: 'Approved', shipped: 'Sent to courier', delivered: 'Delivered', returned: 'Returned by the courier', cancelled: 'Cancelled' };
    const rows = steps.map((s, i) => ({
      step: LABEL[s], orders: count(s), value: value(s), ofPlaced: rate(count(s), placed),
      ofBefore: i ? rate(count(s), count(steps[i - 1])) : null, hours: i ? hoursBetween(steps[i - 1], s) : null, _order: i,
    }));
    ['returned', 'cancelled'].forEach((s, i) => rows.push({ step: LABEL[s], orders: count(s), value: value(s), ofPlaced: rate(count(s), placed), ofBefore: null, hours: hoursBetween(s === 'returned' ? 'shipped' : 'placed', s), _order: 4 + i }));
    const timed = list.some((o) => o.times);
    const toDeliver = hoursBetween('placed', 'delivered');
    return {
      kpis: [
        { key: 'placed', label: 'Orders placed', value: placed, format: 'int', good: 'up' },
        { key: 'delivered', label: 'Delivered', value: rate(count('delivered'), placed), format: 'pct', good: 'up', sub: `${count('delivered')} orders` },
        { key: 'returned', label: 'Returned by the courier', value: rate(count('returned'), placed), format: 'pct', good: 'down', sub: `${count('returned')} orders` },
        { key: 'cancelled', label: 'Cancelled', value: rate(count('cancelled'), placed), format: 'pct', good: 'down', sub: `${count('cancelled')} orders` },
        { key: 'hours', label: 'Hours from order to delivery', value: toDeliver, format: 'num', good: 'down', sub: timed ? 'Average' : 'Needs order status times' },
      ],
      chart: { type: 'hbar', labels: rows.map((r) => r.step), series: [{ name: 'Orders', values: rows.map((r) => r.orders), tone: 'primary' }], format: 'int' },
      table: {
        columns: [
          { key: 'step', label: 'Step' },
          { key: 'orders', label: 'Orders', format: 'int', align: 'right' },
          { key: 'value', label: 'Order value', format: 'money0', align: 'right' },
          { key: 'ofPlaced', label: 'Of orders placed', format: 'pct', align: 'right' },
          { key: 'ofBefore', label: 'Of the step before', format: 'pct', align: 'right' },
          { key: 'hours', label: 'Hours from the step before', format: 'num', align: 'right' },
        ],
        rows,
        sort: { key: '_order', dir: 'asc' },
      },
      notes: [
        'Online orders placed in the period (POS and wholesale counter sales are left out). An order counts at every step it has reached, so a returned parcel also counts as shipped.',
        timed ? 'Hours are worked out from the time each status was set.' : 'Hours show once orders keep the time each status was set.',
      ],
    };
  },
};

// ---- courier performance --------------------------------------------------------------------------
const courierItems = (from, to) => safe(() => getItems(), []).filter((i) => (partnerBy(i.partner) || {}).kind === 'Courier' && !i.carry && inP(i.at, from, to));
const courierPerformance = {
  id: 'courier-performance',
  group: 'online',
  title: 'Courier performance',
  description: 'Each courier side by side: parcels, delivered and returned, delivery days, cash on delivery collected and what they cost you.',
  icon: 'truck',
  keywords: 'pathao steadfast redx carrybee delivery rto cod charges parcels',
  filters: ['courier', 'zone'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const want = (id) => !filters.courier || courierName(id) === filters.courier;
    const orders = onlineOrders().filter((o) => inP(o.at, from, to) && partnerOf(o) && want(partnerOf(o)) && (!filters.zone || zoneOf(o.zone) === filters.zone));
    const items = courierItems(from, to).filter((i) => want(i.partner) && (!filters.zone || (filters.zone === 'Inside Dhaka') === !!i.dhaka));
    const ids = [...new Set([...PARTNERS.filter((p) => p.kind === 'Courier').map((p) => p.id), ...orders.map(partnerOf), ...items.map((i) => i.partner)])].filter(want);
    const rows = ids.map((id) => {
      const mine = orders.filter((o) => partnerOf(o) === id);
      const parcels = parcelsOf(mine);
      const delivered = parcels.filter((o) => keyOf(o) === 'delivered');
      const returned = parcels.filter((o) => keyOf(o) === 'returned');
      const days = delivered.map((o) => { const a = timeOf(o, 'shipped') ?? timeOf(o, 'placed') ?? o.at, b = timeOf(o, 'delivered'); return b != null && b >= a ? (b - a) / 864e5 : null; }).filter((d) => d != null);
      const its = items.filter((i) => i.partner === id && !i.removed);
      const p = partnerBy(id);
      const out = parcels.filter(wentOut);
      const charges = sum(out, (o) => safe(() => courierChargeOf(id, zoneOf(o.zone)), 0));
      const fees = sum(its, (i) => costsOf(i, p).fee);
      const sales = sum(delivered, (o) => o.subtotal);
      return {
        courier: courierName(id), parcels: parcels.length, delivered: delivered.length, returned: returned.length,
        transit: parcels.length - delivered.length - returned.length,
        deliveredPct: rate(delivered.length, delivered.length + returned.length), rtoPct: rate(returned.length, delivered.length + returned.length),
        days: days.length ? days.reduce((a, d) => a + d, 0) / days.length : null, sales,
        codParcels: its.length, collected: sum(its, (i) => i.gross), pending: sum(its.filter((i) => !i.settled), (i) => i.gross),
        charges, fees, cost: r2(charges + fees), perParcel: out.length ? charges / out.length : null, costPct: rate(charges + fees, sales),
        _ended: delivered.length + returned.length, _href: '/settlements',
      };
    }).filter((r) => r.parcels || r.codParcels);
    const T = (k) => sum(rows, (r) => r[k]);
    const parcels = T('parcels');
    const best = rows.filter((r) => r._ended).sort((a, b) => a.rtoPct - b.rtoPct)[0];
    return {
      kpis: [
        { key: 'parcels', label: 'Parcels', value: parcels, format: 'int', good: 'up' },
        { key: 'delivered', label: 'Delivered', value: rate(T('delivered'), T('_ended')), format: 'pct', good: 'up', sub: `${T('transit')} still on the way` },
        { key: 'rto', label: 'Returned (RTO)', value: rate(T('returned'), T('_ended')), format: 'pct', good: 'down' },
        { key: 'collected', label: 'Cash on delivery collected', value: T('collected'), format: 'money0', good: 'up', sub: `${fmt(T('pending'), 'money0')} not paid out yet` },
        { key: 'cost', label: 'Courier charges and fees', value: T('cost'), format: 'money0', good: 'down', sub: `${fmt(rate(T('cost'), T('sales')), 'pct')} of delivered sales` + (best ? ` · fewest returns: ${best.courier}` : '') },
      ],
      chart: {
        type: 'hbar', labels: rows.map((r) => r.courier), format: 'int',
        series: [{ name: 'Delivered', values: rows.map((r) => r.delivered), tone: 'success' }, { name: 'On the way', values: rows.map((r) => r.transit), tone: 'info' }, { name: 'Returned', values: rows.map((r) => r.returned), tone: 'danger' }],
      },
      table: {
        columns: [
          { key: 'courier', label: 'Courier' },
          { key: 'parcels', label: 'Parcels', format: 'int', align: 'right', total: 'sum' },
          { key: 'transit', label: 'On the way', format: 'int', align: 'right', total: 'sum' },
          { key: 'deliveredPct', label: 'Delivered', format: 'pct', align: 'right', total: rate(T('delivered'), T('_ended')) },
          { key: 'rtoPct', label: 'Returned', format: 'pct', align: 'right', total: rate(T('returned'), T('_ended')) },
          { key: 'days', label: 'Days to deliver', format: 'num', align: 'right' },
          { key: 'sales', label: 'Delivered sales', format: 'money0', align: 'right', total: 'sum' },
          { key: 'collected', label: 'COD collected', format: 'money0', align: 'right', total: 'sum' },
          { key: 'pending', label: 'Not paid out yet', format: 'money0', align: 'right', total: 'sum' },
          { key: 'charges', label: 'Delivery charges', format: 'money0', align: 'right', total: 'sum' },
          { key: 'fees', label: 'COD fees', format: 'money0', align: 'right', total: 'sum' },
          { key: 'perParcel', label: 'Cost per parcel', format: 'money0', align: 'right' },
          { key: 'costPct', label: 'Cost % of sales', format: 'pct', align: 'right', total: rate(T('cost'), T('sales')) },
        ],
        rows,
        sort: { key: 'parcels', dir: 'desc' },
      },
      notes: [
        'Parcels are online orders placed in the period that were given to the courier and not cancelled. Delivered and returned are shares of the parcels whose trip has ended; days to deliver run from shipping to delivery.',
        'Delivery charges use the courier’s rate per area for every parcel that went out (Settlements setup). Cash on delivery and COD fees come from the money the courier collected in the period (Accounts › Settlements). Cost % = charges and fees ÷ delivered sales.',
      ],
    };
  },
};

// ---- RTO analysis ---------------------------------------------------------------------------------
const rtoAnalysis = {
  id: 'rto-analysis',
  group: 'online',
  title: 'Returns to origin (RTO)',
  description: 'Parcels the courier brought back: how often, from which areas, products and customers, why, and what they cost you.',
  icon: 'undo-2',
  keywords: 'rto returned parcel refused not reachable wrong address damaged courier return loss',
  filters: ['courier', 'zone'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const parcels = parcelsOf(onlineOrders().filter((o) => inP(o.at, from, to)))
      .filter((o) => (!filters.courier || courierName(partnerOf(o)) === filters.courier) && (!filters.zone || zoneOf(o.zone) === filters.zone));
    const back = parcels.filter((o) => keyOf(o) === 'returned');
    const rows = back.map((o) => {
      const st = safe(() => rtoState(o), { good: 0, damaged: 0, left: 0, sent: o.units || 0, lines: [] });
      const charge = safe(() => courierChargeOf(partnerOf(o), zoneOf(o.zone)), 0) || 0;
      const damagedValue = sum(st.lines || [], (l) => (l.damaged || 0) * (safe(() => unitValue(productBy(l.name) || {}), 0) || (l.price || 0) * 0.7));
      return {
        id: o.id, placed: o.at, customer: o.customer, phone: o.phone, zone: zoneOf(o.zone), courier: courierName(partnerOf(o)),
        items: o.itemTitle || '', reason: o.rtoReason || 'Not given', value: Number(o.amount) || 0,
        state: st.status === 'received' || (o.est && timeOf(o, 'returned') != null) ? 'Received back' : st.status === 'partial' ? 'Partly received' : 'With the courier',
        damaged: st.damaged || 0, charge, damagedValue: r2(damagedValue), loss: r2(charge + damagedValue), _href: hrefOf(o),
      };
    });
    const by = (f) => [...groupBy(parcels, f)].map(([k, list]) => ({ k, back: ended(list).r, pct: ended(list).rto }));
    const zones = by((o) => zoneOf(o.zone)).filter((z) => z.back).sort((a, b) => b.pct - a.pct);
    const reasons = [...groupBy(rows, (r) => r.reason)].map(([k, list]) => [k, list.length]).sort((a, b) => b[1] - a[1]);
    const products = {};
    back.forEach((o) => (o.lines || []).forEach((l) => { products[l.name] = (products[l.name] || 0) + (l.qty || 0); }));
    const topProduct = Object.entries(products).sort((a, b) => b[1] - a[1])[0];
    const loss = sum(rows, (r) => r.loss);
    return {
      kpis: [
        { key: 'rto', label: 'Parcels returned', value: back.length, format: 'int', good: 'down', sub: `of ${parcels.length} parcels` },
        { key: 'rate', label: 'RTO rate', value: ended(parcels).rto, format: 'pct', good: 'down', sub: `${ended(parcels).d} delivered` },
        { key: 'loss', label: 'Lost on returns', value: loss, format: 'money0', good: 'down', sub: 'Courier charges and damaged goods' },
        { key: 'value', label: 'Order value sent back', value: sum(rows, (r) => r.value), format: 'money0', good: 'down' },
        { key: 'zone', label: 'Worst area', value: zones[0] ? zones[0].k : '—', format: 'text', good: 'none', sub: zones[0] ? `${fmt(zones[0].pct, 'pct')} returned` + (topProduct ? ` · most returned: ${topProduct[0]}` : '') : '' },
      ],
      chart: { type: 'hbar', labels: reasons.map((r) => r[0]), series: [{ name: 'Parcels', values: reasons.map((r) => r[1]), tone: 'danger' }], format: 'int' },
      table: {
        columns: [
          { key: 'id', label: 'Order' },
          { key: 'placed', label: 'Placed', format: 'date' },
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'zone', label: 'Area' },
          { key: 'courier', label: 'Courier' },
          { key: 'items', label: 'Items' },
          { key: 'reason', label: 'Reason' },
          { key: 'state', label: 'Goods' },
          { key: 'value', label: 'Order value', format: 'money0', align: 'right', total: 'sum' },
          { key: 'charge', label: 'Courier charge', format: 'money0', align: 'right', total: 'sum' },
          { key: 'damagedValue', label: 'Damaged goods', format: 'money0', align: 'right', total: 'sum' },
          { key: 'loss', label: 'Loss', format: 'money0', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'placed', dir: 'desc' },
      },
      notes: [
        'RTO rate = parcels returned ÷ parcels delivered or returned (online orders placed in the period; parcels still on the way are left out).',
        'Loss = the delivery charge the courier keeps for the trip plus damaged pieces at their buying price. Search the table by area, product or customer.',
      ],
    };
  },
};

// ---- zone sales -----------------------------------------------------------------------------------
const zoneSales = {
  id: 'zone-sales',
  group: 'online',
  title: 'Sales by delivery area',
  description: 'Inside Dhaka, sub-Dhaka and outside Dhaka: orders, order value, delivery charges collected against what couriers charge, and returns.',
  icon: 'map-pin',
  keywords: 'zone area dhaka outside sub-dhaka delivery charge aov rto',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const sales = onlineSales(from, to);
    const placed = onlineOrders().filter((o) => inP(o.at, from, to));
    const byId = new Map(placed.map((o) => [o.id, o]));
    const parcels = parcelsOf(placed);
    const names = [...ZONES, ...(sales.some((s) => s.zone === 'Not set') ? ['Not set'] : [])];
    const total = sum(sales, (s) => s.revenue);
    const rows = names.map((zone) => {
      const mine = sales.filter((s) => s.zone === zone);
      const p = parcels.filter((o) => zoneOf(o.zone) === zone);
      const e = ended(p);
      const collected = sum(mine, (s) => (byId.has(s.id) ? byId.get(s.id).shipping : s.delivery != null ? s.delivery : feeOf(zone)));
      const paid = sum(p.filter(wentOut), (o) => safe(() => courierChargeOf(partnerOf(o), zone), 0));
      const revenue = sum(mine, (s) => s.revenue);
      return { zone, orders: mine.length, revenue, aov: mine.length ? revenue / mine.length : null, share: rate(revenue, total), collected, paid, margin: r2(collected - paid), parcels: p.length, rto: e.rto, _back: e.r, _ended: e.n };
    });
    const orders = sales.length;
    const outside = rows.find((r) => r.zone === 'Outside Dhaka') || { revenue: 0 };
    const worst = rows.filter((r) => r.parcels).sort((a, b) => b.rto - a.rto)[0];
    const est = sales.some((s) => !byId.has(s.id) && s.delivery == null);
    return {
      kpis: [
        { key: 'sales', label: 'Online sales', value: total, format: 'money0', good: 'up' },
        { key: 'orders', label: 'Orders', value: orders, format: 'int', good: 'up' },
        { key: 'aov', label: 'Average order', value: orders ? total / orders : 0, format: 'money0', good: 'up' },
        { key: 'outside', label: 'Outside Dhaka share', value: rate(outside.revenue, total), format: 'pct', good: 'none' },
        { key: 'margin', label: 'Delivery charge kept', value: sum(rows, (r) => r.margin), format: 'money0', good: 'up', sub: worst ? `Most returns: ${worst.zone} (${fmt(worst.rto, 'pct')})` : 'Collected minus courier charges' },
      ],
      chart: { type: 'donut', labels: rows.map((r) => r.zone), series: [{ name: 'Sales', values: rows.map((r) => r.revenue) }], format: 'money0' },
      table: {
        columns: [
          { key: 'zone', label: 'Area' },
          { key: 'orders', label: 'Orders', format: 'int', align: 'right', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money0', align: 'right', total: 'sum' },
          { key: 'share', label: 'Share', format: 'pct', align: 'right' },
          { key: 'aov', label: 'Average order', format: 'money0', align: 'right', total: orders ? total / orders : null },
          { key: 'collected', label: 'Delivery charge collected', format: 'money0', align: 'right', total: 'sum' },
          { key: 'paid', label: 'Courier charges', format: 'money0', align: 'right', total: 'sum' },
          { key: 'margin', label: 'Kept', format: 'money0', align: 'right', total: 'sum' },
          { key: 'parcels', label: 'Parcels', format: 'int', align: 'right', total: 'sum' },
          { key: 'rto', label: 'Returned', format: 'pct', align: 'right', total: rate(sum(rows, (r) => r._back), sum(rows, (r) => r._ended)) },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        'Sales are before VAT and delivery charges, the same as Sales & profit. Delivery charge collected is what the orders charged the customer' + (est ? ' (the area’s usual rate where an order is not found)' : '') + '; courier charges are the courier’s rate per area for each parcel that went out.',
        'Returned = parcels returned ÷ parcels delivered or returned, from the online orders placed in the period.',
      ],
    };
  },
};

// ---- order source -----------------------------------------------------------------------------------
const orderSource = {
  id: 'order-source',
  group: 'online',
  title: 'Orders by source',
  description: 'Website, Facebook, phone, order links and chat: which brings the most orders, the biggest orders and the fewest returns.',
  icon: 'git-branch',
  keywords: 'source website facebook phone order link chat channel aov returns',
  filters: ['zone'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const sales = onlineSales(from, to).filter((s) => !filters.zone || s.zone === filters.zone);
    const orders = onlineOrders().filter((o) => inP(o.at, from, to) && (!filters.zone || zoneOf(o.zone) === filters.zone));
    const total = sum(sales, (s) => s.revenue);
    const rows = SOURCES.map((source) => {
      const mine = sales.filter((s) => s.source === source);
      const ord = orders.filter((o) => sourceOf(o) === source);
      const e = ended(parcelsOf(ord));
      const cancelled = ord.filter((o) => keyOf(o) === 'cancelled').length;
      const revenue = sum(mine, (s) => s.revenue);
      return { source, orders: mine.length, revenue, share: rate(revenue, total), aov: mine.length ? revenue / mine.length : null, rto: e.rto, cancelled: rate(cancelled, ord.length), _back: e.r, _parcels: e.n };
    });
    const top = rows.slice().sort((a, b) => b.revenue - a.revenue)[0];
    const fb = rows.find((r) => r.source === 'Facebook');
    return {
      kpis: [
        { key: 'orders', label: 'Orders', value: sales.length, format: 'int', good: 'up' },
        { key: 'sales', label: 'Online sales', value: total, format: 'money0', good: 'up' },
        { key: 'aov', label: 'Average order', value: sales.length ? total / sales.length : 0, format: 'money0', good: 'up' },
        { key: 'top', label: 'Biggest source', value: top && top.revenue ? top.source : '—', format: 'text', good: 'none', sub: top && top.revenue ? `${fmt(top.share, 'pct')} of sales` : '' },
        { key: 'facebook', label: 'Facebook share', value: fb ? fb.share : 0, format: 'pct', good: 'none' },
      ],
      chart: { type: 'donut', labels: rows.filter((r) => r.revenue).map((r) => r.source), series: [{ name: 'Sales', values: rows.filter((r) => r.revenue).map((r) => r.revenue) }], format: 'money0' },
      table: {
        columns: [
          { key: 'source', label: 'Source' },
          { key: 'orders', label: 'Orders', format: 'int', align: 'right', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money0', align: 'right', total: 'sum' },
          { key: 'share', label: 'Share', format: 'pct', align: 'right' },
          { key: 'aov', label: 'Average order', format: 'money0', align: 'right', total: sales.length ? total / sales.length : null },
          { key: 'rto', label: 'Returned by courier', format: 'pct', align: 'right', total: rate(sum(rows, (r) => r._back), sum(rows, (r) => r._parcels)) },
          { key: 'cancelled', label: 'Cancelled', format: 'pct', align: 'right' },
        ],
        rows: rows.map((r) => ({ ...r, _href: '/merchant-orders' })),
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        'Sales are before VAT and delivery. Returned and cancelled rates come from the online orders placed in the period.',
        'Conversion from visits to orders needs website traffic, which is not recorded yet.',
      ],
    };
  },
};

// ---- risky orders -----------------------------------------------------------------------------------
const OPEN = [...NEW_KEYS, 'approved', 'ready'];
const riskyOrders = {
  id: 'risky-orders',
  group: 'online',
  title: 'Risky and duplicate orders',
  description: 'Orders from numbers with a poor courier record or past returns, and duplicate orders — check them before you ship.',
  icon: 'shield-alert',
  keywords: 'fraud fake risk duplicate merged courier history rto phone check',
  filters: ['zone'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const all = onlineOrders();
    const list = all.filter((o) => inP(o.at, from, to) && (!filters.zone || zoneOf(o.zone) === filters.zone));
    const histCache = {};
    const rows = [];
    list.forEach((o) => {
      const phone = digits(o.phone);
      if (phone.length < 10) return;
      const hist = histCache[phone] !== undefined ? histCache[phone] : (histCache[phone] = safe(() => courierHistory(phone), null));
      const before = ended(all.filter((x) => x.id !== o.id && digits(x.phone) === phone && x.at < o.at));
      const ours = before.r;
      const badRecord = ours && before.rto >= 1 / 3;
      // only open orders can still be merged or cancelled
      const dups = OPEN.includes(keyOf(o)) ? safe(() => duplicatesOf(o, all), []).filter((d) => OPEN.includes(keyOf(d))) : [];
      const log = safe(() => logOf(o.id), []);
      const merged = log.find((e) => /^Merged into/.test(e.title || '')) || log.find((e) => /merged in$/.test(e.title || ''));
      const flags = [];
      let level = 0;
      if (hist && hist.total >= 3 && hist.rate != null && hist.rate < 80) { flags.push(`Courier record ${hist.rate}% delivered`); level = Math.max(level, hist.rate < 70 ? 2 : 1); }
      if (badRecord) { flags.push(`${ours} of ${before.n} parcels came back to you`); level = Math.max(level, ours >= 2 && before.rto >= 0.5 ? 2 : 1); }
      if (dups.length) { flags.push('Possible duplicate of ' + dups.map((d) => d.id).join(', ')); level = Math.max(level, 1); }
      if (merged) { flags.push(merged.title); level = Math.max(level, 1); }
      if (!flags.length) return;
      rows.push({
        id: o.id, placed: o.at, customer: o.customer, phone: o.phone, status: o.status, zone: zoneOf(o.zone),
        record: hist && hist.total ? `${hist.delivered} of ${hist.total} delivered` : 'No courier record', success: hist && hist.rate != null ? hist.rate / 100 : null,
        returns: badRecord ? ours : 0, flags: flags.join(' · '), risk: level === 2 ? 'High' : 'Check', _level: level, _rank: (OPEN.includes(keyOf(o)) ? 10 : 0) + level, amount: Number(o.amount) || 0,
        _open: OPEN.includes(keyOf(o)), _dup: dups.length > 0, _merged: !!merged, _href: hrefOf(o),
      });
    });
    const open = rows.filter((r) => r._open);
    const reasons = [
      ['Poor courier record', rows.filter((r) => /Courier record/.test(r.flags)).length],
      ['Earlier returns', rows.filter((r) => r.returns).length],
      ['Duplicate', rows.filter((r) => r._dup).length],
      ['Merged', rows.filter((r) => r._merged).length],
    ].filter((x) => x[1]);
    return {
      kpis: [
        { key: 'risky', label: 'Orders to check', value: rows.length, format: 'int', good: 'down', sub: `of ${list.length} orders` },
        { key: 'high', label: 'High risk', value: rows.filter((r) => r._level === 2).length, format: 'int', good: 'down' },
        { key: 'open', label: 'Not shipped yet', value: open.length, format: 'int', good: 'down', sub: `${fmt(sum(open, (r) => r.amount), 'money0')} at stake` },
        { key: 'dups', label: 'Duplicates', value: rows.filter((r) => r._dup).length, format: 'int', good: 'down', sub: `${rows.filter((r) => r._merged).length} merged` },
      ],
      chart: { type: 'hbar', labels: reasons.map((r) => r[0]), series: [{ name: 'Orders', values: reasons.map((r) => r[1]), tone: 'warning' }], format: 'int' },
      table: {
        columns: [
          { key: 'id', label: 'Order' },
          { key: 'placed', label: 'Placed', format: 'datetime' },
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'status', label: 'Status' },
          { key: 'record', label: 'Courier record' },
          { key: 'success', label: 'Delivered', format: 'pct', align: 'right' },
          { key: 'returns', label: 'Returns with you', format: 'int', align: 'right' },
          { key: 'flags', label: 'Why' },
          { key: 'risk', label: 'Risk' },
          { key: 'amount', label: 'Order value', format: 'money0', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: '_rank', dir: 'desc' },
      },
      notes: [
        'Courier record is the number’s history with Pathao, Steadfast and RedX: below 80% delivered (3 parcels or more) needs a check, below 70% is high risk. A third or more of earlier parcels returned to you also needs a check.',
        'A duplicate is another open order from the same number with the same product within 48 hours (both not shipped yet). Merge or cancel it from the order page.',
      ],
    };
  },
};

// ---- COD payouts ------------------------------------------------------------------------------------
const codPayouts = {
  id: 'cod-payouts',
  group: 'online',
  title: 'Cash on delivery payouts',
  description: 'Cash the couriers collected for you, what they paid out, what is still with them and any payout that came short.',
  icon: 'hand-coins',
  keywords: 'cod cash on delivery payout settlement short courier reconciliation pathao steadfast',
  filters: ['courier'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const items = courierItems(from, to).filter((i) => !i.removed && (!filters.courier || courierName(i.partner) === filters.courier));
    const inPeriod = new Set(items.map((i) => i.id));
    const pays = safe(() => getPayouts(), []).filter((p) => p.p && p.p.kind === 'Courier');
    const seen = new Set();
    const rows = [];
    pays.forEach((pay) => {
      const mine = (pay.items || []).filter((i) => inPeriod.has(i.id));
      if (!mine.length) return;
      mine.forEach((i) => seen.add(i.id));
      const c = mine.map((i) => costsOf(i, pay.p));
      const gross = sum(mine, (i) => i.gross), cost = r2(sum(c, (x) => x.fee) + sum(c, (x) => x.charge)), net = sum(c, (x) => x.net);
      const done = pay.status === 'received' || pay.status === 'review';
      const received = done ? r2((pay.received || 0) * rate(net, pay.net || net)) : 0;
      const short = done ? r2(net - received) : 0;
      const status = pay.status === 'received' ? (short > 0 ? 'Paid out short' : 'Paid out') : pay.status === 'review' ? 'Arrived short · check' : pay.status === 'delayed' ? 'Delayed' : pay.late ? 'Late' : 'Expected';
      rows.push({
        day: [...new Set(mine.map((i) => fmt(i.at, 'date')))].join(', '), _at: Math.min(...mine.map((i) => i.at)), courier: pay.p.short, parcels: mine.length,
        gross, cost, net, received, short, waiting: done ? 0 : net, date: pay.due || pay.date, status, _href: '/settlements',
      });
    });
    // items in no payout (a partner with no payout day) still count as waiting
    items.filter((i) => !seen.has(i.id)).forEach((i) => {
      const c = costsOf(i, partnerBy(i.partner));
      rows.push({ day: fmt(i.at, 'date'), _at: i.at, courier: courierName(i.partner), parcels: 1, gross: i.gross, cost: r2(c.fee + c.charge), net: c.net, received: i.settled ? c.net : 0, short: 0, waiting: i.settled ? 0 : c.net, date: null, status: i.settled ? 'Paid out' : 'Waiting', _href: '/settlements' });
    });
    const T = (k) => sum(rows, (r) => r[k]);
    const couriers = [...groupBy(rows, (r) => r.courier)].map(([name, list]) => ({ name, received: sum(list, (r) => r.received), waiting: sum(list, (r) => r.waiting), short: sum(list, (r) => r.short) }));
    const late = rows.filter((r) => r.status === 'Late' || r.status === 'Delayed');
    return {
      kpis: [
        { key: 'gross', label: 'COD collected', value: T('gross'), format: 'money0', good: 'up', sub: `${T('parcels')} parcels` },
        { key: 'received', label: 'Paid out to you', value: T('received'), format: 'money0', good: 'up' },
        { key: 'waiting', label: 'Still with couriers', value: T('waiting'), format: 'money0', good: 'down', sub: late.length ? `${late.length} payout${late.length === 1 ? '' : 's'} late` : 'None late' },
        { key: 'short', label: 'Came short', value: T('short'), format: 'money', good: 'down' },
        { key: 'cost', label: 'Charges and fees', value: T('cost'), format: 'money0', good: 'down' },
      ],
      chart: {
        type: 'hbar', labels: couriers.map((c) => c.name), format: 'money0',
        series: [{ name: 'Paid out', values: couriers.map((c) => c.received), tone: 'success' }, { name: 'Still with courier', values: couriers.map((c) => c.waiting), tone: 'warning' }, { name: 'Short', values: couriers.map((c) => c.short), tone: 'danger' }],
      },
      table: {
        columns: [
          { key: 'day', label: 'Collected on' },
          { key: 'courier', label: 'Courier' },
          { key: 'parcels', label: 'Parcels', format: 'int', align: 'right', total: 'sum' },
          { key: 'gross', label: 'COD collected', format: 'money', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Charges and fees', format: 'money', align: 'right', total: 'sum' },
          { key: 'net', label: 'Due to you', format: 'money', align: 'right', total: 'sum' },
          { key: 'received', label: 'Paid out', format: 'money', align: 'right', total: 'sum' },
          { key: 'short', label: 'Short', format: 'money', align: 'right', total: 'sum' },
          { key: 'date', label: 'Payout day', format: 'date' },
          { key: 'status', label: 'Status' },
        ],
        rows: rows.sort((a, b) => a._at - b._at),
        sort: { key: '_at', dir: 'asc' },
      },
      notes: [
        'COD collected = charges and fees + paid out + short + still with couriers. Parcels the courier brought back before paying out are left out.',
        'Record or check a payout in Accounts › Settlements.',
      ],
    };
  },
};

export default [orderFunnel, courierPerformance, rtoAnalysis, zoneSales, orderSource, riskyOrders, codPayouts];
