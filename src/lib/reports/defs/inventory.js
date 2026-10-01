// Reports · Inventory group. See ../catalogue.js for the definition contract.
//
// How stock is counted here (the same numbers as Stock list, Warehouses and Branches):
//   on hand now   stockAt(sku, place).onHand for every place (base count + stock moves − damaged holds)
//   value         on hand × unitValue (the buying price when known, else the wholesale price)
//   history       stock at an earlier time = on hand now − every change after that time. The changes
//                 ("flows") are the stock moves recorded in this browser plus the demo history the moves
//                 do not hold: received demo transfers, approved demo adjustments, open damaged holds and
//                 the demo September sale lines (est). So opening + in − out = closing for every row.
// Sales (velocity, slow-moving, ABC) come from the sale lines (salesBook.getSaleLines); without them, from
// the stock moves of kind 'sale'.

import * as salesBook from '../../salesBook';
import { getCatalog, productBy, stockAt, placeStock, getMoves, unitValue, LOW_AT } from '../../stock';
import { getPlaces, placeName, DAMAGED_PLACE } from '../../locations';
import { getHolds } from '../../stockHolds';
import { getTransfers, missingOf } from '../../transfers';
import { getAdjustments } from '../../stockAdjustments';
import { getRackData, placeBinStats } from '../../racks';
import { getPOs, DEMO_POS } from '../../purchaseOrders';
import { getBills, getSuppliers } from '../../supplierBills';
import { bucketsOf, sum, groupBy } from '../period';

const DAY = 864e5;
const TONES = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const num = (v) => Number(v) || 0;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const nowOf = (ctx) => ctx.now || Date.now();
const productHref = (sku) => '/add-product?sku=' + encodeURIComponent(sku);

// ---- places ---------------------------------------------------------------------------------------
/** Today's name of a place (old names and renamed places land on one name). */
export const canon = (name) => (name ? safe(() => placeName(name), name) || name : '');
/** Every place that holds stock on shelves (all places but the damaged bay). */
const shelfPlaces = () => safe(() => getPlaces(), []).map((p) => p.name).filter((n) => n !== DAMAGED_PLACE);
/** The places a report covers: the chosen place, or every shelf place. */
const placesFor = (f) => (f.place ? [canon(f.place)] : shelfPlaces());
const catOk = (p, f) => !!p && (!f.category || p.cat === f.category);

// ---- the stock picture ------------------------------------------------------------------------------
/** Everything stock reports read, once per compute. */
export function stockData() {
  return {
    catalog: safe(() => getCatalog(), []),
    holds: safe(() => getHolds(), []),
    moves: safe(() => getMoves(), []).filter((m) => m && m.status === 'done'),
    transfers: safe(() => getTransfers(), []),
  };
}
/** On hand now of one product at one place. */
const onHandNow = (sku, place, d) => num(safe(() => stockAt(sku, place, d.holds, d.moves, d.transfers), {}).onHand);

// ---- sale lines -----------------------------------------------------------------------------------
/**
 * Every sale line with a catalogue product: { at, saleId, channel, place, sku, name, cat, qty, revenue, cost, est }.
 * From salesBook.getSaleLines() when it exists; otherwise from the stock moves of kind 'sale'/'delivery'.
 */
export function saleLines(d = stockData()) {
  const get = salesBook.getSaleLines;
  if (typeof get === 'function') {
    const list = safe(() => get(), []);
    return (Array.isArray(list) ? list : []).map((l) => {
      const p = productBy(l.sku) || productBy(l.name);
      if (!p) return null;
      const qty = num(l.qty);
      const revenue = l.revenue != null ? num(l.revenue) : qty * num(l.price) - num(l.disc);
      return { at: num(l.at), saleId: l.saleId || l.id || '', channel: l.channel || '', place: canon(l.place) || 'Central Warehouse', sku: p.sku, name: p.name, cat: p.cat, qty, revenue, cost: l.cost != null ? num(l.cost) : qty * unitValue(p), est: !!l.est, p };
    }).filter(Boolean);
  }
  return d.moves.filter((m) => ['sale', 'delivery'].includes(m.kind) && num(m.qty) < 0).map((m) => {
    const p = productBy(m.sku);
    if (!p) return null;
    const qty = -num(m.qty);
    return { at: num(m.at), saleId: m.ref || '', channel: '', place: canon(m.place), sku: p.sku, name: p.name, cat: p.cat, qty, revenue: qty * num(p.price), cost: qty * unitValue(p), est: false, p };
  }).filter(Boolean);
}
export const hasSaleLines = () => typeof salesBook.getSaleLines === 'function';

// ---- flows: every change to on hand, by product and place -------------------------------------------
// col: received | returned | sold | tin | tout | adjusted | other   (qty is signed: + in, − out)
const MOVE_COL = { receive: 'received', return: 'returned', rto: 'returned', sale: 'sold', delivery: 'sold', exchange: 'sold', adjust: 'adjusted', count: 'adjusted', 'write-off': 'adjusted', writeoff: 'adjusted' };
export function stockFlows(d = stockData(), lines = null) {
  const out = [];
  const push = (at, key, place, qty, col, ref) => {
    const p = productBy(key);
    if (!p || !qty || !place) return;
    out.push({ at: num(at), sku: p.sku, p, place: canon(place), qty: num(qty), col, ref: ref || '' });
  };
  const refs = new Set(d.moves.map((m) => m.ref).filter(Boolean));
  d.moves.forEach((m) => {
    const col = m.kind === 'transfer' ? (num(m.qty) > 0 ? 'tin' : 'tout') : MOVE_COL[m.kind] || 'other';
    push(m.at, m.sku, m.place, m.qty, col, m.ref);
  });
  // demo transfers that were received before this browser recorded moves
  d.transfers.filter((t) => t.status === 'received' && !refs.has(t.no)).forEach((t) => (t.lines || []).forEach((l) => {
    push(t.receivedAt || t.at, l.sku, t.from, -num(l.got), 'tout', t.no);
    push(t.receivedAt || t.at, l.sku, t.to, num(l.got), 'tin', t.no);
  }));
  // approved demo adjustments
  safe(() => getAdjustments(), []).filter((a) => a.status === 'approved' && !refs.has(a.id)).forEach((a) => push(a.decidedAt || a.at, a.sku, a.place, a.qty, 'adjusted', a.id));
  // open damaged holds: off the shelf they came from, into the damaged bay (as stockAt counts them)
  d.holds.filter((h) => h.status === 'damaged').forEach((h) => {
    const t = h.closedAt || h.at;
    // pieces reported damaged on arrival (from the bay itself) came in through their 'receive' move
    if (!h.from || canon(h.from) === DAMAGED_PLACE) return;
    push(t, h.product, DAMAGED_PLACE, h.qty, 'other', h.id);
    push(t, h.product, h.from, -num(h.qty), 'other', h.id);
  });
  // demo sale lines (made from daily totals; no stock move holds them)
  (lines || (hasSaleLines() ? saleLines(d) : [])).filter((l) => l.est).forEach((l) => push(l.at, l.sku, l.place || 'Central Warehouse', -l.qty, 'sold', l.saleId));
  return out;
}

/** On hand now per product per place (shelf places, or the chosen place), for the products a filter keeps. */
function anchors(d, f) {
  const places = placesFor(f);
  const out = [];
  d.catalog.filter((p) => catOk(p, f)).forEach((p) => places.forEach((place) => out.push({ p, place, now: onHandNow(p.sku, place, d) })));
  return out;
}

/** Daily sales (pieces) of each product over [from, to) at the places a filter keeps: { sku: qty }. */
function soldBySku(lines, from, to, f) {
  const out = {};
  lines.forEach((l) => {
    if (l.at < from || l.at >= to) return;
    if (f.place && l.place !== canon(f.place)) return;
    if (f.category && l.cat !== f.category) return;
    if (f.channel && l.channel !== f.channel) return;
    out[l.sku] = (out[l.sku] || 0) + l.qty;
  });
  return out;
}

// ---- E1 · stock value -------------------------------------------------------------------------------
const stockValue = {
  id: 'stock-value',
  group: 'inventory',
  title: 'Stock on hand & value',
  description: 'What your stock is worth right now at cost and at selling price, product by product and place by place.',
  icon: 'boxes',
  keywords: 'inventory value worth on hand cost retail potential profit warehouse branch',
  filters: ['place', 'category'],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ filters }) {
    const d = stockData();
    const places = placesFor(filters);
    const byPlace = places.map((place) => {
      const st = safe(() => placeStock(place, { holds: d.holds, moves: d.moves, transfers: d.transfers, catalog: d.catalog }), { rows: [] });
      const rows = st.rows.filter((r) => catOk(r.p, filters));
      return { place, rows };
    });
    const prod = new Map();
    byPlace.forEach(({ place, rows }) => rows.forEach((r) => {
      const k = r.p.sku;
      const x = prod.get(k) || { name: r.p.name, sku: k, cat: r.p.cat, onHand: 0, value: 0, retail: 0, places: 0, _href: productHref(k) };
      const pcs = Math.max(0, r.onHand);
      x.onHand += r.onHand; x.value += r.value; x.retail += pcs * num(r.p.price);
      if (pcs > 0) x.places += 1;
      prod.set(k, x);
    }));
    const rows = [...prod.values()].filter((x) => x.onHand || x.value).map((x) => ({ ...x, value: r2(x.value), retail: r2(x.retail), profit: r2(x.retail - x.value), margin: x.retail ? (x.retail - x.value) / x.retail : 0 }));
    const value = sum(rows, (x) => x.value), retail = sum(rows, (x) => x.retail);
    const placeVals = byPlace.map(({ place, rows: rs }) => ({ place, value: sum(rs, (r) => r.value) })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
    const catVals = [...groupBy(rows, (x) => x.cat || 'Other')].map(([cat, list]) => ({ cat, value: sum(list, (x) => x.value) })).sort((a, b) => b.value - a.value);
    const chart = filters.place
      ? { type: 'donut', labels: catVals.slice(0, 6).map((c) => c.cat), series: [{ name: 'Value at cost', values: catVals.slice(0, 6).map((c) => c.value), tone: 'primary' }], format: 'money0' }
      : { type: 'hbar', labels: placeVals.slice(0, 10).map((x) => x.place), series: [{ name: 'Value at cost', values: placeVals.slice(0, 10).map((x) => x.value), tone: 'primary' }], format: 'money0' };
    return {
      kpis: [
        { key: 'value', label: 'Stock value at cost', value, format: 'money0', good: 'none', sub: `${rows.filter((x) => x.onHand > 0).length} products in stock` },
        { key: 'retail', label: 'Value at selling price', value: retail, format: 'money0', good: 'none' },
        { key: 'profit', label: 'Profit if all sells', value: r2(retail - value), format: 'money0', good: 'up', sub: retail ? `${Math.round(((retail - value) / retail) * 100)}% margin` : '' },
        { key: 'pieces', label: 'Pieces on hand', value: sum(rows, (x) => Math.max(0, x.onHand)), format: 'int', good: 'none' },
      ],
      chart,
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'sku', label: 'SKU' },
          { key: 'cat', label: 'Category' },
          { key: 'places', label: 'Places', format: 'int', align: 'right' },
          { key: 'onHand', label: 'On hand', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value at cost', format: 'money', align: 'right', total: 'sum' },
          { key: 'retail', label: 'Value at selling price', format: 'money', align: 'right', total: 'sum' },
          { key: 'profit', label: 'Potential profit', format: 'money', align: 'right', total: 'sum' },
          { key: 'margin', label: 'Margin', format: 'pct', align: 'right' },
        ],
        rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'Values match Warehouses and Branches: on hand × the buying price when known, else the wholesale price. Stock at Returns & damaged is not counted (see Damaged & expired).',
        'Selling price is the retail price; wholesale-only products use their wholesale price.',
      ],
    };
  },
};

// ---- E2 · low stock & reorder -----------------------------------------------------------------------
/** Pieces still to come on open purchase orders, by product and place: { 'sku|place': qty }. */
function onOrder() {
  const out = {};
  safe(() => getPOs(), []).filter((po) => !['Received', 'Cancelled'].includes(po.status)).forEach((po) => (po.lines || []).forEach((l) => {
    const p = productBy(l.sku) || productBy(l.name);
    if (!p) return;
    const k = p.sku + '|' + canon(po.place || 'Central Warehouse');
    out[k] = (out[k] || 0) + Math.max(0, num(l.qty) - num(l.received));
  }));
  return out;
}
/** The supplier a product was last bought from (purchase orders and bills with item lines). */
function lastSupplierOf() {
  const seen = {};
  const sups = safe(() => getSuppliers(), []);
  const nameOf = (s) => (sups.find((x) => x.id === s || x.name === s) || {}).name || s;
  const note = (key, sup, at) => { const p = productBy(key); if (!p || !sup) return; if (!seen[p.sku] || seen[p.sku].at < at) seen[p.sku] = { name: nameOf(sup), at }; };
  safe(() => getPOs(), []).concat(DEMO_POS.filter((po) => ['ordered', 'partial', 'received', 'closed'].includes(po.s))).forEach((po) => (po.lines || []).forEach((l) => note(l.sku || l.name, po.supplier, num(po.at))));
  safe(() => getBills(), []).forEach((b) => (b.lines || []).forEach((l) => note(l.sku || l.name, b.supplier, num(b.at))));
  return seen;
}
const lowStock = {
  id: 'low-stock-reorder',
  group: 'inventory',
  title: 'Low stock & reorder list',
  description: 'What is running out, how fast it sells, how many days it will last and how many to order.',
  icon: 'package-minus',
  keywords: 'reorder low stock out of stock velocity days of cover purchase suggestion',
  filters: ['place', 'category'],
  snapshot: true,
  defaultPeriod: 'month',
  compute(ctx) {
    const { filters } = ctx;
    const now = nowOf(ctx);
    const d = stockData();
    const lines = saleLines(d);
    const coming = onOrder();
    const supplierOf = lastSupplierOf();
    const rows = [];
    placesFor(filters).forEach((place) => {
      const st = safe(() => placeStock(place, { holds: d.holds, moves: d.moves, transfers: d.transfers, catalog: d.catalog }), { rows: [] });
      const sold = soldBySku(lines, now - 30 * DAY, now, { place });
      st.rows.filter((r) => r.low && catOk(r.p, filters)).forEach((r) => {
        const perDay = (sold[r.p.sku] || 0) / 30;
        const ordered = coming[r.p.sku + '|' + place] || 0;
        const need = Math.max(0, Math.ceil(perDay * 30 - Math.max(0, r.onHand) - ordered - r.transit));
        rows.push({
          name: r.p.name, sku: r.p.sku, place, onHand: r.onHand, available: r.available, held: r.held, transit: r.transit, ordered,
          perDay: r2(perDay), cover: perDay ? Math.max(0, r.available) / perDay : null, suggest: need, cost: r2(need * unitValue(r.p)),
          supplier: (supplierOf[r.p.sku] || {}).name || '—', state: r.available <= 0 ? 'Out of stock' : 'Low', _href: productHref(r.p.sku),
        });
      });
    });
    const top = rows.slice().sort((a, b) => b.suggest - a.suggest).filter((x) => x.suggest > 0).slice(0, 10);
    return {
      kpis: [
        { key: 'low', label: 'Low at a place', value: rows.length, format: 'int', good: 'down', sub: `${LOW_AT} or fewer free to sell` },
        { key: 'out', label: 'Out of stock', value: rows.filter((x) => x.available <= 0).length, format: 'int', good: 'down' },
        { key: 'suggest', label: 'Pieces to order', value: sum(rows, (x) => x.suggest), format: 'int', good: 'none', sub: 'for 30 days of sales' },
        { key: 'cost', label: 'Cost of the order', value: sum(rows, (x) => x.cost), format: 'money0', good: 'none' },
      ],
      chart: { type: 'hbar', labels: top.map((x) => `${x.name} · ${x.place}`), series: [{ name: 'Suggested order', values: top.map((x) => x.suggest), tone: 'warning' }], format: 'int' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'place', label: 'Place' },
          { key: 'state', label: 'Status' },
          { key: 'available', label: 'Free to sell', format: 'int', align: 'right' },
          { key: 'onHand', label: 'On hand', format: 'int', align: 'right', total: 'sum' },
          { key: 'perDay', label: 'Sold a day', format: 'num', align: 'right' },
          { key: 'cover', label: 'Days of cover', format: 'num', align: 'right' },
          { key: 'transit', label: 'On the way', format: 'int', align: 'right', total: 'sum' },
          { key: 'ordered', label: 'On order', format: 'int', align: 'right', total: 'sum' },
          { key: 'suggest', label: 'Order', format: 'int', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Order cost', format: 'money', align: 'right', total: 'sum' },
          { key: 'supplier', label: 'Last bought from' },
        ],
        rows,
        sort: { key: 'suggest', dir: 'desc' },
      },
      notes: [
        `A product is low at a place when ${LOW_AT} or fewer are free to sell there. Sold a day is the average of the last 30 days at that place.`,
        'Order = 30 days of sales − on hand − pieces on the way from another place − pieces still to come on open purchase orders.',
      ],
    };
  },
};

// ---- E3 · slow-moving & dead stock --------------------------------------------------------------------
const AGE_SALE = ['Sold in the last 30 days', '31–60 days ago', '61–90 days ago', 'Over 90 days ago', 'No sale recorded'];
const slowMoving = {
  id: 'slow-moving',
  group: 'inventory',
  title: 'Slow-moving & dead stock',
  description: 'Stock that did not sell, or sells so slowly it will sit for months, and the money tied up in it.',
  icon: 'snail',
  keywords: 'dead stock no sale ageing tied up money clearance 30 60 90 days',
  filters: ['place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const d = stockData();
    const lines = saleLines(d);
    const days = Math.max(1, Math.round((to - from) / DAY));
    const sold = soldBySku(lines, from, to, filters);
    const last = {};
    lines.forEach((l) => { if (l.at < to && (!filters.place || l.place === canon(filters.place)) && (!last[l.sku] || last[l.sku] < l.at)) last[l.sku] = l.at; });
    const stock = {};
    anchors(d, filters).forEach((a) => { stock[a.p.sku] = stock[a.p.sku] || { p: a.p, qty: 0 }; stock[a.p.sku].qty += a.now; });
    const rows = [];
    Object.values(stock).forEach(({ p, qty }) => {
      if (qty <= 0) return;
      const n = sold[p.sku] || 0;
      const cover = n ? qty / (n / days) : null;
      if (n && cover <= 90) return;
      const since = last[p.sku] ? Math.floor((to - last[p.sku]) / DAY) : null;
      const age = since == null ? AGE_SALE[4] : since <= 30 ? AGE_SALE[0] : since <= 60 ? AGE_SALE[1] : since <= 90 ? AGE_SALE[2] : AGE_SALE[3];
      rows.push({ name: p.name, sku: p.sku, cat: p.cat, onHand: qty, value: r2(qty * unitValue(p)), sold: n, cover: cover == null ? null : Math.round(cover), last: last[p.sku] || null, since, age, state: n ? 'Slow' : 'No sale in the period', _href: productHref(p.sku) });
    });
    const total = sum(Object.values(stock), (x) => Math.max(0, x.qty) * unitValue(x.p));
    const dead = rows.filter((x) => !x.sold), slow = rows.filter((x) => x.sold);
    const top = rows.slice().sort((a, b) => b.value - a.value).slice(0, 10);
    return {
      kpis: [
        { key: 'dead', label: 'No sale in the period', value: sum(dead, (x) => x.value), format: 'money0', good: 'down', sub: `${dead.length} product${dead.length === 1 ? '' : 's'}` },
        { key: 'slow', label: 'Selling slowly', value: sum(slow, (x) => x.value), format: 'money0', good: 'down', sub: `${slow.length} with over 90 days of stock` },
        { key: 'share', label: 'Share of stock value', value: total ? sum(rows, (x) => x.value) / total : 0, format: 'pct', good: 'down' },
        { key: 'pieces', label: 'Pieces sitting', value: sum(rows, (x) => x.onHand), format: 'int', good: 'down' },
      ],
      chart: { type: 'hbar', labels: top.map((x) => x.name), series: [{ name: 'Value tied up', values: top.map((x) => x.value), tone: 'warning' }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'state', label: 'Status' },
          { key: 'onHand', label: 'On hand', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value tied up', format: 'money', align: 'right', total: 'sum' },
          { key: 'sold', label: 'Sold in the period', format: 'int', align: 'right', total: 'sum' },
          { key: 'cover', label: 'Days of stock', format: 'int', align: 'right' },
          { key: 'last', label: 'Last sold', format: 'date' },
          { key: 'age', label: 'Last sale' },
        ],
        rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'Listed: products with stock now that did not sell in the period, or that have more than 90 days of stock at the period’s pace.',
        hasSaleLines() ? 'Sales come from every sale line (Online, Retail, Wholesale).' : 'Sales come from the stock moves recorded when goods left (POS sales and delivered orders).',
      ],
    };
  },
};

// ---- E4 · stock movement ------------------------------------------------------------------------------
const COLS = ['received', 'returned', 'tin', 'sold', 'tout', 'adjusted', 'other'];
/** Opening, each kind of change and closing per product for [from, to) at the places a filter keeps. */
function movement(from, to, filters, d = stockData()) {
  const flows = stockFlows(d);
  const places = new Set(placesFor(filters));
  const rows = new Map();
  anchors(d, filters).forEach(({ p, now }) => {
    const x = rows.get(p.sku) || { p, name: p.name, sku: p.sku, cat: p.cat, now: 0, after: 0, received: 0, returned: 0, tin: 0, sold: 0, tout: 0, adjusted: 0, other: 0 };
    x.now += now;
    rows.set(p.sku, x);
  });
  flows.forEach((fl) => {
    const x = rows.get(fl.sku);
    if (!x || !places.has(fl.place)) return;
    if (fl.at >= to) x.after += fl.qty;
    else if (fl.at >= from) x[fl.col] += fl.qty;
  });
  return [...rows.values()].map((x) => {
    const closing = x.now - x.after;
    const net = COLS.reduce((a, k) => a + x[k], 0);
    return {
      ...x, opening: closing - net, closing, received: x.received, returned: x.returned, tin: x.tin, sold: -x.sold, tout: -x.tout,
      value: r2(Math.max(0, closing) * unitValue(x.p)), _href: productHref(x.sku),
    };
  });
}
const stockMovement = {
  id: 'stock-movement',
  group: 'inventory',
  title: 'Stock movement',
  description: 'For each product: stock at the start, what came in, what went out and stock at the end of the period.',
  icon: 'arrow-left-right',
  keywords: 'stock ledger opening closing received sold returned adjusted transfer in out movement',
  filters: ['place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const d = stockData();
    const all = movement(from, to, filters, d);
    const rows = all.filter((x) => x.opening || x.closing || COLS.some((k) => x[k]));
    const came = (x) => x.received + x.returned + x.tin + Math.max(0, x.adjusted) + Math.max(0, x.other);
    const went = (x) => x.sold + x.tout + Math.max(0, -x.adjusted) + Math.max(0, -x.other);
    // trend: pieces in and out per day / week / month
    const { buckets, keyOf } = bucketsOf(from, to);
    const series = [{ name: 'Came in', tone: 'success', values: buckets.map(() => 0) }, { name: 'Went out', tone: 'warning', values: buckets.map(() => 0) }];
    const places = new Set(placesFor(filters));
    const keep = new Set(rows.map((x) => x.sku));
    stockFlows(d).forEach((fl) => {
      if (fl.at < from || fl.at >= to || !places.has(fl.place) || !keep.has(fl.sku)) return;
      const i = buckets.findIndex((b) => b.key === keyOf(fl.at));
      if (i >= 0) series[fl.qty > 0 ? 0 : 1].values[i] += Math.abs(fl.qty);
    });
    return {
      kpis: [
        { key: 'opening', label: 'Stock at the start', value: sum(rows, (x) => x.opening), format: 'int', good: 'none' },
        { key: 'in', label: 'Came in', value: sum(rows, came), format: 'int', good: 'none', sub: `${sum(rows, (x) => x.received)} received from suppliers` },
        { key: 'out', label: 'Went out', value: sum(rows, went), format: 'int', good: 'none', sub: `${sum(rows, (x) => x.sold)} sold` },
        { key: 'closing', label: 'Stock at the end', value: sum(rows, (x) => x.closing), format: 'int', good: 'none' },
        { key: 'value', label: 'Value at the end', value: sum(rows, (x) => x.value), format: 'money0', good: 'none' },
      ],
      chart: { type: 'bar', labels: buckets.map((b) => b.label), series, format: 'int' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'opening', label: 'Opening', format: 'int', align: 'right', total: 'sum' },
          { key: 'received', label: 'Received', format: 'int', align: 'right', total: 'sum' },
          { key: 'returned', label: 'Returned', format: 'int', align: 'right', total: 'sum' },
          { key: 'tin', label: 'Transfer in', format: 'int', align: 'right', total: 'sum' },
          { key: 'sold', label: 'Sold', format: 'int', align: 'right', total: 'sum' },
          { key: 'tout', label: 'Transfer out', format: 'int', align: 'right', total: 'sum' },
          { key: 'adjusted', label: 'Adjusted ±', format: 'int', align: 'right', total: 'sum' },
          { key: 'other', label: 'Damaged & other ±', format: 'int', align: 'right', total: 'sum' },
          { key: 'closing', label: 'Closing', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Closing value', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'sold', dir: 'desc' },
      },
      notes: [
        'Opening + received + returned + transfer in − sold − transfer out ± adjusted ± damaged & other = closing. Closing for today matches the Stock list.',
        'Adjusted covers approved adjustments, stock counts and write-offs. Damaged & other covers stock set aside as damaged, returns to suppliers and repaired stock. All places leaves out the Returns & damaged bay.',
      ],
    };
  },
};

// ---- E5 · valuation at a date -------------------------------------------------------------------------
const valuationAtDate = {
  id: 'valuation-at-date',
  group: 'inventory',
  title: 'Stock value at a date',
  description: 'What your stock was worth at the end of the period, and how the value moved during it.',
  icon: 'calendar-check',
  keywords: 'valuation closing stock value month end balance sheet inventory value date',
  filters: ['place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const d = stockData();
    const flows = stockFlows(d);
    const places = new Set(placesFor(filters));
    const qty = new Map();
    anchors(d, filters).forEach(({ p, now }) => { const x = qty.get(p.sku) || { p, now: 0, after: 0, afterFrom: 0 }; x.now += now; qty.set(p.sku, x); });
    const mine = flows.filter((fl) => places.has(fl.place) && qty.has(fl.sku));
    mine.forEach((fl) => { const x = qty.get(fl.sku); if (fl.at >= to) x.after += fl.qty; if (fl.at >= from) x.afterFrom += fl.qty; });
    const rows = [...qty.values()].map(({ p, now, after, afterFrom }) => {
      const end = now - after, start = now - afterFrom;
      const uv = unitValue(p);
      return { name: p.name, sku: p.sku, cat: p.cat, qty: end, unit: uv, value: r2(end * uv), retail: r2(end * num(p.price)), start: r2(start * uv), _href: productHref(p.sku) };
    }).map((x) => ({ ...x, change: r2(x.value - x.start) })).filter((x) => x.qty || x.start);
    const valueNow = sum([...qty.values()], (x) => x.now * unitValue(x.p));
    // value at the end of each bucket: value now − value of every change after that moment
    const { buckets } = bucketsOf(from, to);
    const values = buckets.map((b) => r2(valueNow - sum(mine.filter((fl) => fl.at >= Math.min(b.to, to)), (fl) => fl.qty * unitValue(fl.p))));
    const end = sum(rows, (x) => x.value), start = sum(rows, (x) => x.start);
    return {
      kpis: [
        { key: 'value', label: 'Value at the end', value: end, format: 'money0', good: 'none', sub: `${sum(rows, (x) => Math.max(0, x.qty))} pieces` },
        { key: 'start', label: 'Value at the start', value: start, format: 'money0', good: 'none' },
        { key: 'change', label: 'Change in the period', value: r2(end - start), format: 'money0', good: 'none' },
        { key: 'retail', label: 'At selling price', value: sum(rows, (x) => x.retail), format: 'money0', good: 'none' },
      ],
      chart: { type: 'line', labels: buckets.map((b) => b.label), series: [{ name: 'Stock value', values: values, tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'qty', label: 'Pieces at the end', format: 'int', align: 'right', total: 'sum' },
          { key: 'unit', label: 'Unit value', format: 'money', align: 'right' },
          { key: 'start', label: 'Value at the start', format: 'money', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value at the end', format: 'money', align: 'right', total: 'sum' },
          { key: 'change', label: 'Change', format: 'money', align: 'right', total: 'sum' },
          { key: 'retail', label: 'At selling price', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'Stock at a date is today’s stock with every later change undone (sales, receipts, transfers, adjustments, damaged stock).',
        'Every date uses today’s unit value: the buying price when known, else the wholesale price.',
      ],
    };
  },
};

// ---- E6 · stock ageing -------------------------------------------------------------------------------
const AGE_BUCKETS = ['0–30 days', '31–60 days', '61–90 days', 'Over 90 days', 'Not recorded'];
const stockAgeing = {
  id: 'stock-ageing',
  group: 'inventory',
  title: 'Stock ageing',
  description: 'How long stock has been sitting since it was last received at each place.',
  icon: 'hourglass',
  keywords: 'ageing age old stock receipt days since received fifo',
  filters: ['place', 'category'],
  snapshot: true,
  defaultPeriod: 'month',
  compute(ctx) {
    const { filters } = ctx;
    const now = nowOf(ctx);
    const d = stockData();
    const lastIn = {};
    stockFlows(d, []).filter((fl) => fl.qty > 0 && (fl.col === 'received' || fl.col === 'tin') && fl.at <= now).forEach((fl) => {
      const k = fl.sku + '|' + fl.place;
      if (!lastIn[k] || lastIn[k].at < fl.at) lastIn[k] = { at: fl.at, how: fl.col === 'received' ? 'From a supplier' : 'Transfer' };
    });
    const rows = anchors(d, filters).filter((a) => a.now > 0).map(({ p, place, now: qty }) => {
      const r = lastIn[p.sku + '|' + place];
      const days = r ? Math.floor((now - r.at) / DAY) : null;
      const bucket = days == null ? AGE_BUCKETS[4] : days <= 30 ? AGE_BUCKETS[0] : days <= 60 ? AGE_BUCKETS[1] : days <= 90 ? AGE_BUCKETS[2] : AGE_BUCKETS[3];
      return { name: p.name, sku: p.sku, place, qty, value: r2(qty * unitValue(p)), last: r ? r.at : null, how: r ? r.how : '—', days, bucket, _href: productHref(p.sku) };
    });
    const per = AGE_BUCKETS.map((b) => ({ b, value: sum(rows.filter((x) => x.bucket === b), (x) => x.value) }));
    const known = rows.filter((x) => x.days != null);
    const wDays = sum(known, (x) => x.value) ? sum(known, (x) => x.days * x.value) / sum(known, (x) => x.value) : 0;
    return {
      kpis: [
        { key: 'fresh', label: 'Received in the last 30 days', value: per[0].value, format: 'money0', good: 'up' },
        { key: 'old', label: 'Older than 90 days', value: per[3].value, format: 'money0', good: 'down' },
        { key: 'avg', label: 'Average age', value: wDays, format: 'days', good: 'down', sub: 'weighted by value, where a receipt is recorded' },
        { key: 'unknown', label: 'No receipt recorded', value: per[4].value, format: 'money0', good: 'none' },
      ],
      chart: { type: 'bar', labels: AGE_BUCKETS, series: [{ name: 'Value at cost', values: per.map((x) => x.value), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'place', label: 'Place' },
          { key: 'qty', label: 'On hand', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value', format: 'money', align: 'right', total: 'sum' },
          { key: 'last', label: 'Last received', format: 'date' },
          { key: 'how', label: 'How' },
          { key: 'days', label: 'Days since', format: 'int', align: 'right' },
          { key: 'bucket', label: 'Age' },
        ],
        rows,
        sort: { key: 'days', dir: 'desc' },
      },
      notes: ['Age counts from the last time the product arrived at the place: a supplier delivery (Receive goods) or a transfer received. Stock that was there before the system recorded receipts shows as Not recorded.'],
    };
  },
};

// ---- E7 · shrinkage -----------------------------------------------------------------------------------
const shrinkage = {
  id: 'shrinkage',
  group: 'inventory',
  title: 'Shrinkage: adjustments & counts',
  description: 'Stock lost or found by hand adjustments, stock counts and write-offs: how much, why and who recorded it.',
  icon: 'scale',
  keywords: 'shrinkage loss theft lost found count variance adjustment write off expired damaged',
  filters: ['place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const d = stockData();
    const places = new Set(placesFor(filters).concat(filters.place ? [] : [DAMAGED_PLACE]));
    const rows = [];
    const add = (at, key, place, qty, source, reason, by, ref) => {
      const p = productBy(key);
      if (!p || !catOk(p, filters) || at < from || at >= to || !places.has(canon(place))) return;
      rows.push({ at, name: p.name, sku: p.sku, place: canon(place), qty: num(qty), value: r2(num(qty) * unitValue(p)), source, reason, by: by || '—', ref: ref || '', _href: source === 'Adjustment' ? '/stock-adjustments' : source === 'Stock count' ? '/stock-count' : '/stock' });
    };
    const adjs = safe(() => getAdjustments(), []);
    adjs.filter((a) => a.status === 'approved').forEach((a) => add(a.decidedAt || a.at, a.sku, a.place, a.qty, 'Adjustment', a.reason || 'Other', a.by + (a.decidedBy && a.decidedBy !== 'Auto' ? ' · approved by ' + a.decidedBy : ''), a.id));
    d.moves.forEach((m) => {
      if (m.kind === 'count') add(m.at, m.sku, m.place, m.qty, 'Stock count', 'Count difference', m.by, m.ref);
      else if (m.kind === 'write-off' || m.kind === 'writeoff') add(m.at, m.sku, m.place, m.qty, 'Write-off', /missing in/i.test(m.reason || '') ? 'Missing in transfer' : 'Written off', m.by, m.ref);
    });
    const lost = rows.filter((x) => x.qty < 0), found = rows.filter((x) => x.qty > 0);
    const reasons = [...groupBy(lost, (x) => x.reason)].map(([reason, list]) => ({ reason, value: -sum(list, (x) => x.value) })).sort((a, b) => b.value - a.value).slice(0, 10);
    const waiting = adjs.filter((a) => a.status === 'waiting' && a.at >= from && a.at < to).length;
    return {
      kpis: [
        { key: 'lost', label: 'Lost at cost', value: -sum(lost, (x) => x.value), format: 'money0', good: 'down', sub: `${-sum(lost, (x) => x.qty)} pieces` },
        { key: 'found', label: 'Found at cost', value: sum(found, (x) => x.value), format: 'money0', good: 'none', sub: `${sum(found, (x) => x.qty)} pieces` },
        { key: 'net', label: 'Net change', value: sum(rows, (x) => x.value), format: 'money0', good: 'up' },
        { key: 'records', label: 'Records', value: rows.length, format: 'int', good: 'none', sub: waiting ? `${waiting} waiting for approval` : '' },
      ],
      chart: { type: 'hbar', labels: reasons.map((x) => x.reason), series: [{ name: 'Lost at cost', values: reasons.map((x) => x.value), tone: 'danger' }], format: 'money0' },
      table: {
        columns: [
          { key: 'at', label: 'Date', format: 'date' },
          { key: 'name', label: 'Product' },
          { key: 'place', label: 'Place' },
          { key: 'source', label: 'From' },
          { key: 'reason', label: 'Reason' },
          { key: 'qty', label: 'Pieces ±', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'At cost ±', format: 'money', align: 'right', total: 'sum' },
          { key: 'by', label: 'Recorded by' },
          { key: 'ref', label: 'Ref' },
        ],
        rows,
        sort: { key: 'value', dir: 'asc' },
      },
      notes: ['Only approved adjustments count; rejected ones and those waiting for a manager change no stock. Cost is the unit value used for stock (buying price when known, else wholesale price).'],
    };
  },
};

// ---- E8 · damaged & expired ---------------------------------------------------------------------------
const damagedExpired = {
  id: 'damaged-expired',
  group: 'inventory',
  title: 'Damaged & expired stock',
  description: 'What is set aside at Returns & damaged, what it cost, where it came from and what can go back to the supplier.',
  icon: 'package-x',
  keywords: 'damaged expired broken returns bay write off supplier return claim',
  filters: ['place', 'category'],
  snapshot: true,
  defaultPeriod: 'month',
  compute(ctx) {
    const { filters } = ctx;
    const now = nowOf(ctx);
    const d = stockData();
    const rows = d.holds.filter((h) => h.status === 'damaged').map((h) => {
      const p = productBy(h.product);
      if (p && !catOk(p, filters)) return null;
      if (!p && filters.category) return null;
      const from = canon(h.from) || DAMAGED_PLACE;
      if (filters.place && from !== canon(filters.place) && canon(filters.place) !== DAMAGED_PLACE) return null;
      const supplierRef = /^PO-/.test(h.ref || '');
      const source = supplierRef ? 'Arrived damaged or wrong' : h.type === 'damaged' ? 'Damaged in store' : 'Customer return';
      const since = h.closedAt || h.at;
      const uv = p ? unitValue(p) : 0;
      return {
        id: h.id, name: h.product, sku: p ? p.sku : '', qty: num(h.qty), value: r2(num(h.qty) * uv), from, source, note: h.note || '', since, days: Math.max(0, Math.floor((now - since) / DAY)),
        back: supplierRef ? 'Yes · ' + (h.who || 'supplier') : 'No', ref: h.ref || '',
        _href: supplierRef ? '/supplier-return?hold=' + encodeURIComponent(h.id) : '/stock-holds',
      };
    }).filter(Boolean);
    // expired stock written off in the last 30 days
    const since30 = now - 30 * DAY;
    const expired = safe(() => getAdjustments(), []).filter((a) => a.status === 'approved' && a.reason === 'Expired' && (a.decidedAt || a.at) >= since30)
      .concat(d.moves.filter((m) => (m.kind === 'write-off' || m.kind === 'adjust') && /expir/i.test(m.reason || '') && m.at >= since30 && !/^ADJ-/.test(m.ref || '')));
    const expiredValue = -sum(expired, (x) => { const p = productBy(x.sku); return p && catOk(p, filters) && (!filters.place || canon(x.place) === canon(filters.place)) ? num(x.qty) * unitValue(p) : 0; });
    const sources = [...groupBy(rows, (x) => x.source)].map(([s, list]) => ({ s, value: sum(list, (x) => x.value) }));
    const back = rows.filter((x) => x.back !== 'No');
    return {
      kpis: [
        { key: 'value', label: 'Damaged stock at cost', value: sum(rows, (x) => x.value), format: 'money0', good: 'down', sub: `${sum(rows, (x) => x.qty)} pieces` },
        { key: 'back', label: 'Can go back to the supplier', value: sum(back, (x) => x.value), format: 'money0', good: 'none', sub: `${back.length} item${back.length === 1 ? '' : 's'}` },
        { key: 'old', label: 'Waiting over 7 days', value: rows.filter((x) => x.days > 7).length, format: 'int', good: 'down' },
        { key: 'expired', label: 'Expired, written off (30 days)', value: expiredValue, format: 'money0', good: 'down' },
      ],
      chart: { type: 'donut', labels: sources.map((x) => x.s), series: [{ name: 'Value at cost', values: sources.map((x) => x.value), tone: 'danger' }], format: 'money0' },
      table: {
        columns: [
          { key: 'id', label: 'Hold' },
          { key: 'name', label: 'Product' },
          { key: 'qty', label: 'Pieces', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'At cost', format: 'money', align: 'right', total: 'sum' },
          { key: 'from', label: 'Came from' },
          { key: 'source', label: 'How' },
          { key: 'note', label: 'Reason' },
          { key: 'since', label: 'Since', format: 'date' },
          { key: 'days', label: 'Days', format: 'int', align: 'right' },
          { key: 'back', label: 'Back to supplier' },
        ],
        rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'Items that arrived damaged or wrong on a purchase order can be returned to the supplier for a credit note (Supplier return). Expiry dates are not recorded per batch yet, so expired stock shows only once written off.',
      ],
    };
  },
};

// ---- E9 · transfers ----------------------------------------------------------------------------------
const transfersReport = {
  id: 'transfers-report',
  group: 'inventory',
  title: 'Transfers between places',
  description: 'Stock sent between warehouses and branches: what arrived, what went missing and what is still on the way.',
  icon: 'truck',
  keywords: 'transfer route sent received missing in transit van courier',
  filters: ['place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const d = stockData();
    const place = filters.place ? canon(filters.place) : '';
    const list = d.transfers.filter((t) => t.at >= from && t.at < to && (!place || canon(t.from) === place || canon(t.to) === place));
    const sent = list.filter((t) => t.status !== 'draft');
    const routes = new Map();
    let missingOpen = 0;
    const daysTo = [];
    sent.forEach((t) => {
      const route = canon(t.from) + ' → ' + canon(t.to);
      const x = routes.get(route) || { route, from: canon(t.from), to: canon(t.to), transfers: 0, sent: 0, got: 0, missing: 0, way: 0, value: 0, missingValue: 0, _href: '/transfers' };
      let any = false;
      (t.lines || []).forEach((l) => {
        const p = productBy(l.sku);
        if (filters.category && !(p && p.cat === filters.category)) return;
        any = true;
        const uv = p ? unitValue(p) : 0;
        const miss = missingOf(t, l);
        x.sent += num(l.qty); x.value += num(l.qty) * uv;
        if (t.status === 'received') { x.got += num(l.got); x.missing += miss; x.missingValue += miss * uv; if (miss && !l.res) missingOpen += miss; }
        else x.way += num(l.qty);
      });
      if (!any) return;
      x.transfers += 1;
      if (t.status === 'received' && t.receivedAt) daysTo.push((t.receivedAt - t.at) / DAY);
      routes.set(route, x);
    });
    const rows = [...routes.values()].map((x) => ({ ...x, value: r2(x.value), missingValue: r2(x.missingValue) }));
    const top = rows.slice().sort((a, b) => b.sent - a.sent).slice(0, 10);
    const drafts = list.filter((t) => t.status === 'draft').length;
    return {
      kpis: [
        { key: 'sent', label: 'Pieces sent', value: sum(rows, (x) => x.sent), format: 'int', good: 'none', sub: `${sum(rows, (x) => x.transfers)} transfers${drafts ? ` · ${drafts} draft` : ''}` },
        { key: 'way', label: 'Still on the way', value: sum(rows, (x) => x.way), format: 'int', good: 'down' },
        { key: 'missing', label: 'Missing on arrival', value: sum(rows, (x) => x.missing), format: 'int', good: 'down', sub: missingOpen ? `${missingOpen} not dealt with yet` : '' },
        { key: 'days', label: 'Average days to arrive', value: daysTo.length ? daysTo.reduce((a, b) => a + b, 0) / daysTo.length : 0, format: 'num', good: 'down' },
      ],
      chart: {
        type: 'stacked', labels: top.map((x) => x.route),
        series: [{ name: 'Received', tone: 'success', values: top.map((x) => x.got) }, { name: 'Missing', tone: 'danger', values: top.map((x) => x.missing) }, { name: 'On the way', tone: 'info', values: top.map((x) => x.way) }],
        format: 'int',
      },
      table: {
        columns: [
          { key: 'route', label: 'Route' },
          { key: 'transfers', label: 'Transfers', format: 'int', align: 'right', total: 'sum' },
          { key: 'sent', label: 'Sent', format: 'int', align: 'right', total: 'sum' },
          { key: 'got', label: 'Received', format: 'int', align: 'right', total: 'sum' },
          { key: 'missing', label: 'Missing', format: 'int', align: 'right', total: 'sum' },
          { key: 'way', label: 'On the way', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value sent', format: 'money', align: 'right', total: 'sum' },
          { key: 'missingValue', label: 'Value missing', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'sent', dir: 'desc' },
      },
      notes: ['Transfers are counted on the day they were sent; drafts are not sent yet. Missing = sent − scanned in at the other end.'],
    };
  },
};

// ---- E10 · stock holds ---------------------------------------------------------------------------------
const HOLD_AGE = ['Under 1 day', '1–3 days', '4–7 days', 'Over 7 days'];
const HOLD_LABEL = { online: 'Online order', retail: 'Retail order' };
const holdsReport = {
  id: 'holds-report',
  group: 'inventory',
  title: 'Stock holds',
  description: 'Stock set aside for online orders and retail customers, and how long it has been waiting.',
  icon: 'lock',
  keywords: 'holds reserved held stock online orders invoices waiting age',
  filters: ['place', 'category'],
  snapshot: true,
  defaultPeriod: 'month',
  compute(ctx) {
    const { filters } = ctx;
    const now = nowOf(ctx);
    const d = stockData();
    const rows = d.holds.filter((h) => h.status === 'held' && (!filters.place || canon(h.place) === canon(filters.place))).map((h) => {
      const p = productBy(h.product);
      if (filters.category && !(p && p.cat === filters.category)) return null;
      const age = (now - h.at) / DAY;
      const ref = h.ref || '';
      const href = /^#/.test(ref) ? '/order-detail?id=' + encodeURIComponent(ref) : /^INV-/.test(ref) ? '/sales-invoice?id=' + encodeURIComponent(ref) : '/stock-holds';
      return {
        id: h.id, type: HOLD_LABEL[h.type] || 'Other', ref, who: h.who || '—', name: h.product, qty: num(h.qty), place: canon(h.place), at: h.at, days: Math.max(0, Math.floor(age)),
        bucket: age < 1 ? HOLD_AGE[0] : age <= 3 ? HOLD_AGE[1] : age <= 7 ? HOLD_AGE[2] : HOLD_AGE[3], value: r2(num(h.qty) * (p ? unitValue(p) : 0)), note: h.note || '', _href: href,
      };
    }).filter(Boolean);
    const types = ['Online order', 'Retail order', 'Other'].filter((t) => rows.some((x) => x.type === t));
    return {
      kpis: [
        { key: 'holds', label: 'Open holds', value: rows.length, format: 'int', good: 'none', sub: `${sum(rows, (x) => x.qty)} pieces` },
        { key: 'value', label: 'Value held', value: sum(rows, (x) => x.value), format: 'money0', good: 'none' },
        { key: 'online', label: 'For online orders', value: sum(rows.filter((x) => x.type === 'Online order'), (x) => x.qty), format: 'int', good: 'none' },
        { key: 'old', label: 'Held over 7 days', value: rows.filter((x) => x.bucket === HOLD_AGE[3]).length, format: 'int', good: 'down' },
      ],
      chart: { type: 'stacked', labels: HOLD_AGE, series: types.map((t, i) => ({ name: t, tone: TONES[i], values: HOLD_AGE.map((b) => sum(rows.filter((x) => x.type === t && x.bucket === b), (x) => x.qty)) })), format: 'int' },
      table: {
        columns: [
          { key: 'id', label: 'Hold' },
          { key: 'type', label: 'For' },
          { key: 'ref', label: 'Order / invoice' },
          { key: 'who', label: 'Customer' },
          { key: 'name', label: 'Product' },
          { key: 'qty', label: 'Pieces', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value', format: 'money', align: 'right', total: 'sum' },
          { key: 'place', label: 'Place' },
          { key: 'at', label: 'Held since', format: 'datetime' },
          { key: 'days', label: 'Days', format: 'int', align: 'right' },
        ],
        rows,
        sort: { key: 'days', dir: 'desc' },
      },
      notes: ['An online order holds its stock from approval until delivery; a retail hold waits for the customer to collect. Damaged stock is in Damaged & expired.'],
    };
  },
};

// ---- E11 · bin utilisation ------------------------------------------------------------------------------
const binUtilisation = {
  id: 'bin-utilisation',
  group: 'inventory',
  title: 'Racks & bin use',
  description: 'How full the racks are at each place and how much stock is not in any bin.',
  icon: 'layout-grid',
  keywords: 'racks bins shelves capacity utilisation warehouse space not binned',
  filters: ['place'],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ filters }) {
    const d = stockData();
    const data = safe(() => getRackData(), { racks: [], slots: [] });
    const places = safe(() => getPlaces(), []).filter((p) => p.name !== DAMAGED_PLACE && (!filters.place || p.name === canon(filters.place)));
    const rows = places.map((pl) => {
      const s = safe(() => placeBinStats(pl.id, data), { racks: 0, bins: 0, used: 0, pieces: 0, capacity: 0 });
      const st = safe(() => placeStock(pl.name, { holds: d.holds, moves: d.moves, transfers: d.transfers, catalog: d.catalog }), { rows: [] });
      const onHand = st.rows.reduce((a, r) => a + Math.max(0, r.onHand), 0);
      return {
        place: pl.name, racks: s.racks, bins: s.bins, used: s.used, usedPct: s.bins ? s.used / s.bins : 0, capacity: s.capacity, pieces: s.pieces,
        fill: s.capacity ? s.pieces / s.capacity : 0, onHand, loose: Math.max(0, onHand - s.pieces), _href: '/racks',
      };
    }).filter((x) => x.racks || x.onHand);
    const bins = sum(rows, (x) => x.bins), cap = sum(rows, (x) => x.capacity);
    return {
      kpis: [
        { key: 'used', label: 'Bins in use', value: bins ? sum(rows, (x) => x.used) / bins : 0, format: 'pct', good: 'none', sub: `${sum(rows, (x) => x.used)} of ${bins} bins` },
        { key: 'fill', label: 'Rack space used', value: cap ? sum(rows, (x) => x.pieces) / cap : 0, format: 'pct', good: 'none', sub: `${sum(rows, (x) => x.pieces)} of ${cap} pieces` },
        { key: 'loose', label: 'Pieces not in a bin', value: sum(rows, (x) => x.loose), format: 'int', good: 'down' },
        { key: 'noracks', label: 'Places without racks', value: rows.filter((x) => !x.racks).length, format: 'int', good: 'down' },
      ],
      chart: {
        type: 'stacked', labels: rows.map((x) => x.place),
        series: [{ name: 'In bins', tone: 'success', values: rows.map((x) => x.pieces) }, { name: 'Not in a bin', tone: 'warning', values: rows.map((x) => x.loose) }],
        format: 'int',
      },
      table: {
        columns: [
          { key: 'place', label: 'Place' },
          { key: 'racks', label: 'Racks', format: 'int', align: 'right', total: 'sum' },
          { key: 'bins', label: 'Bins', format: 'int', align: 'right', total: 'sum' },
          { key: 'used', label: 'Bins used', format: 'int', align: 'right', total: 'sum' },
          { key: 'usedPct', label: 'Bins used %', format: 'pct', align: 'right' },
          { key: 'capacity', label: 'Capacity (pieces)', format: 'int', align: 'right', total: 'sum' },
          { key: 'pieces', label: 'In bins', format: 'int', align: 'right', total: 'sum' },
          { key: 'fill', label: 'Space used', format: 'pct', align: 'right' },
          { key: 'onHand', label: 'On hand', format: 'int', align: 'right', total: 'sum' },
          { key: 'loose', label: 'Not in a bin', format: 'int', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'loose', dir: 'desc' },
      },
      notes: ['Not in a bin = on hand at the place − pieces put into bins (Racks & bins). Space used = pieces in bins ÷ what the bins can hold.'],
    };
  },
};

// ---- E12 · ABC analysis & sell-through -------------------------------------------------------------------
const abcAnalysis = {
  id: 'abc-analysis',
  group: 'inventory',
  title: 'ABC analysis & sell-through',
  description: 'Which few products bring most of your sales (A), which bring little (C), and how much of the stock sold.',
  icon: 'chart-pie',
  keywords: 'abc pareto 80 20 best sellers sell through revenue share ranking',
  filters: ['channel', 'place', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const d = stockData();
    const lines = saleLines(d).filter((l) => l.at >= from && l.at < to && (!filters.channel || l.channel === filters.channel) && (!filters.place || l.place === canon(filters.place)) && (!filters.category || l.cat === filters.category));
    const stock = {};
    anchors(d, filters).forEach((a) => { stock[a.p.sku] = (stock[a.p.sku] || 0) + Math.max(0, a.now); });
    const prods = [...groupBy(lines, (l) => l.sku)].map(([sku, list]) => ({ sku, p: list[0].p, qty: sum(list, (l) => l.qty), revenue: sum(list, (l) => l.revenue), cost: sum(list, (l) => l.cost) }))
      .sort((a, b) => b.revenue - a.revenue);
    const total = sum(prods, (x) => x.revenue);
    let run = 0;
    const rows = prods.map((x, i) => {
      const before = total ? run / total : 0;
      run += x.revenue;
      const cls = before < 0.8 ? 'A' : before < 0.95 ? 'B' : 'C';
      const onHand = stock[x.sku] || 0;
      return {
        rank: i + 1, name: x.p.name, sku: x.sku, cat: x.p.cat, cls, qty: x.qty, revenue: x.revenue, profit: r2(x.revenue - x.cost), share: total ? x.revenue / total : 0, cum: total ? run / total : 0,
        onHand, through: x.qty + onHand ? x.qty / (x.qty + onHand) : 0, _href: productHref(x.sku),
      };
    });
    // products with stock that did not sell are C
    Object.entries(stock).forEach(([sku, onHand]) => {
      if (!onHand || rows.some((x) => x.sku === sku)) return;
      const p = productBy(sku);
      if (p) rows.push({ rank: rows.length + 1, name: p.name, sku, cat: p.cat, cls: 'C', qty: 0, revenue: 0, profit: 0, share: 0, cum: 1, onHand, through: 0, _href: productHref(sku) });
    });
    const by = (c) => rows.filter((x) => x.cls === c);
    const sold = sum(rows, (x) => x.qty), left = sum(rows, (x) => x.onHand);
    const share = (c) => (total ? sum(by(c), (x) => x.revenue) / total : 0);
    return {
      kpis: [
        { key: 'a', label: 'A products', value: by('A').length, format: 'int', good: 'none', sub: `${Math.round(share('A') * 100)}% of sales` },
        { key: 'b', label: 'B products', value: by('B').length, format: 'int', good: 'none', sub: `${Math.round(share('B') * 100)}% of sales` },
        { key: 'c', label: 'C products', value: by('C').length, format: 'int', good: 'none', sub: `${Math.round(share('C') * 100)}% of sales` },
        { key: 'through', label: 'Sell-through', value: sold + left ? sold / (sold + left) : 0, format: 'pct', good: 'up', sub: 'sold ÷ (sold + on hand)' },
        { key: 'revenue', label: 'Sales', value: total, format: 'money0', good: 'up' },
      ],
      chart: { type: 'donut', labels: ['A', 'B', 'C'], series: [{ name: 'Sales', values: ['A', 'B', 'C'].map((c) => sum(by(c), (x) => x.revenue)), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'rank', label: '#', format: 'int', align: 'right' },
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'cls', label: 'Class' },
          { key: 'qty', label: 'Sold', format: 'int', align: 'right', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money', align: 'right', total: 'sum' },
          { key: 'profit', label: 'Gross profit', format: 'money', align: 'right', total: 'sum' },
          { key: 'share', label: 'Share', format: 'pct', align: 'right' },
          { key: 'cum', label: 'Running share', format: 'pct', align: 'right' },
          { key: 'onHand', label: 'On hand now', format: 'int', align: 'right', total: 'sum' },
          { key: 'through', label: 'Sell-through', format: 'pct', align: 'right' },
        ],
        rows,
        sort: { key: 'rank', dir: 'asc' },
      },
      notes: [
        'A = the best sellers that make the first 80% of sales, B = the next 15%, C = the last 5% and stock that did not sell. Sales are before VAT, after discounts.',
        'Sell-through = pieces sold in the period ÷ (pieces sold + pieces on hand now).',
      ],
    };
  },
};

export default [stockValue, lowStock, slowMoving, stockMovement, valuationAtDate, stockAgeing, shrinkage, damagedExpired, transfersReport, holdsReport, binUtilisation, abcAnalysis];
export { movement };
