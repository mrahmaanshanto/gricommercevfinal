// Reports · Purchase & suppliers group. See ../catalogue.js for the definition contract.
//
// Purchase orders: the ones made in this browser (purchaseOrders.getPOs) and the demo orders
// (purchaseOrders.DEMO_POS, the rows the Purchase orders list shows). Bills, payments, credit notes and
// supplier returns: supplierBills.js. Prices: the item lines of bills (what was received) and of purchase
// orders not received yet. An order without an expected date is expected LEAD_DAYS after it was placed.

import { productBy } from '../../stock';
import { getHolds } from '../../stockHolds';
import { getPOs, poTotal, unitCost, lineCost, DEMO_POS, DEMO_STATUS } from '../../purchaseOrders';
import { getBills, getSuppliers, findSupplier, billLeft, daysFrom, dayStart, payableOf, getDb } from '../../supplierBills';
import { getEntries } from '../../ledger';
import { bucketsOf, sum, groupBy, change } from '../period';
import { canon } from './inventory';

const DAY = 864e5;
const LEAD_DAYS = 7;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const num = (v) => Number(v) || 0;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const nowOf = (ctx) => ctx.now || Date.now();
const supplierHref = (id) => (id ? '/supplier-detail?id=' + encodeURIComponent(id) : '/suppliers');
const poHref = (no) => '/po-detail?no=' + encodeURIComponent(no);
const TONES = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];

// ---- purchase orders --------------------------------------------------------------------------------
const NOT_SENT = ['Draft', 'Waiting approval', 'Approved'];
const OPEN = ['Sent', 'Partly received'];
const parseDay = (v) => { if (!v) return null; const t = typeof v === 'number' ? v : Date.parse(v); return Number.isFinite(t) ? t : null; };

/** Every purchase order, normalised:
 *  { no, at, supplier (name), supId, place, status, pieces, got, total, gotValue, expected, expectedSet, deliveries: [{ at, qty }], lines, demo } */
export function allPOs(sups = safe(() => getSuppliers(), []), bills = safe(() => getBills(), [])) {
  const sup = (s) => safe(() => findSupplier(s, sups), null);
  const mine = safe(() => getPOs(), []).map((p) => {
    const lines = Array.isArray(p.lines) ? p.lines : [];
    const s = sup(p.supplier);
    const exp = parseDay(p.expected);
    return {
      no: p.no, at: num(p.at), supplier: s ? s.name : p.supplier || '—', supId: s ? s.id : '', place: canon(p.place || 'Central Warehouse'),
      status: p.approval === 'waiting' && p.status === 'Draft' ? 'Waiting approval' : p.status || 'Draft',
      pieces: sum(lines, (l) => l.qty), got: sum(lines, (l) => l.received), total: num(p.total) || poTotal(lines), gotValue: sum(lines, (l) => num(l.received) * num(l.cost)),
      expected: exp || num(p.at) + LEAD_DAYS * DAY, expectedSet: !!exp,
      deliveries: (p.deliveries || []).map((x) => ({ at: num(x.at), qty: num(x.qty) })), lines, demo: false,
    };
  });
  const seen = new Set(mine.map((p) => p.no));
  const demo = DEMO_POS.filter((r) => !seen.has(r.no)).map((r) => {
    const s = sup(r.supplier);
    const billed = bills.filter((b) => b.po === r.no);
    const lines = (r.lines || []).map((l) => ({ ...l }));
    return {
      no: r.no, at: num(r.at) || parseDay(r.date) || 0, supplier: r.supplier, supId: s ? s.id : '', place: canon(r.place || 'Central Warehouse'), status: DEMO_STATUS[r.s] || 'Draft',
      pieces: num(r.of), got: num(r.got), total: num(r.total), gotValue: lines.length ? sum(lines, (l) => num(l.received) * num(l.cost)) : (r.of ? r2((r.total * r.got) / r.of) : 0),
      expected: (num(r.at) || parseDay(r.date) || 0) + LEAD_DAYS * DAY, expectedSet: false,
      deliveries: billed.map((b) => ({ at: num(b.at), qty: num(r.got) / billed.length })), lines, demo: true,
    };
  });
  return [...mine, ...demo].sort((a, b) => b.at - a.at);
}
const supOk = (f, id, name) => !f.supplier || f.supplier === id || f.supplier === name;
/** Deliveries in [from, to) with whether each came on time: [{ po, supId, supplier, at, qty, late (days) }]. */
function deliveriesIn(pos, from, to) {
  const out = [];
  pos.forEach((p) => p.deliveries.forEach((x) => {
    if (x.at < from || x.at >= to) return;
    const late = Math.max(0, Math.floor((dayStart(x.at) - dayStart(p.expected)) / DAY));
    out.push({ po: p.no, supId: p.supId, supplier: p.supplier, at: x.at, qty: x.qty, late });
  }));
  return out;
}

// ---- prices -----------------------------------------------------------------------------------------
/** Every purchase price: bill lines (received) and lines of orders not received yet.
 *  [{ at, key, name, sku, cat, supId, supplier, qty, cost, landed, ref, kind: 'bill'|'order' }] */
export function priceEvents(sups = safe(() => getSuppliers(), []), bills = safe(() => getBills(), []), pos = allPOs(sups, bills)) {
  const out = [];
  const nameOf = (id) => (sups.find((s) => s.id === id) || {}).name || id || '—';
  const item = (l) => { const p = productBy(l.sku) || productBy(l.name); return { key: p ? p.sku : l.name, name: p ? p.name : l.name, sku: p ? p.sku : '', cat: p ? p.cat : '' }; };
  const billed = new Set();
  bills.forEach((b) => {
    const lines = (b.lines || []).filter((l) => num(l.qty) > 0);
    if (!lines.length) return;
    if (b.po) billed.add(b.po);
    const goods = sum(lines, (l) => num(l.qty) * num(l.cost));
    const lift = goods ? num(b.extra) / goods : 0;
    lines.forEach((l) => out.push({ at: num(b.at), ...item(l), supId: b.supplier, supplier: nameOf(b.supplier), qty: num(l.qty), cost: num(l.cost), landed: r2(num(l.cost) * (1 + lift)), ref: b.no, kind: 'bill' }));
  });
  pos.filter((p) => !billed.has(p.no) && p.status !== 'Cancelled' && !NOT_SENT.includes(p.status)).forEach((p) => p.lines.forEach((l) => {
    if (!num(l.qty)) return;
    out.push({ at: p.at, ...item(l), supId: p.supId, supplier: p.supplier, qty: num(l.qty), cost: num(l.cost), landed: num(l.cost), ref: p.no, kind: 'order' });
  }));
  return out.sort((a, b) => a.at - b.at);
}

// ---- receiving discrepancies --------------------------------------------------------------------------
const HOLD_STATE = { damaged: 'At Returns & damaged', returned: 'Sent back', delivered: 'Sent back', disposed: 'Written off' };
/** Damaged, wrong, short and over pieces found when receiving, in [from, to). */
export function discrepancies(from, to, pos = allPOs(), now = Date.now()) {
  const sups = safe(() => getSuppliers(), []);
  const rows = [];
  const add = (r) => { if (r.at >= from && r.at < to && r.qty > 0) rows.push(r); };
  safe(() => getHolds(), []).filter((h) => h.type === 'damaged' && /^PO-/.test(h.ref || '') && h.status !== 'released').forEach((h) => {
    const s = safe(() => findSupplier(h.who, sups), null);
    const p = productBy(h.product);
    const cost = safe(() => lineCost(h.ref, h.product), 0) || safe(() => unitCost(h.product), 0);
    add({ at: num(h.at), po: h.ref, supId: s ? s.id : '', supplier: s ? s.name : h.who || '—', name: h.product, sku: p ? p.sku : '', cat: p ? p.cat : '', issue: /wrong/i.test(h.note || '') ? 'Wrong item' : 'Damaged', qty: num(h.qty), value: r2(num(h.qty) * cost), state: HOLD_STATE[h.status] || h.status, _href: poHref(h.ref) });
  });
  pos.forEach((po) => {
    po.lines.forEach((l) => {
      const over = num(l.received) - num(l.qty);
      if (over > 0) {
        const p = productBy(l.sku) || productBy(l.name);
        add({ at: po.deliveries.length ? po.deliveries[0].at : po.at, po: po.no, supId: po.supId, supplier: po.supplier, name: l.name, sku: p ? p.sku : '', cat: p ? p.cat : '', issue: 'Over', qty: over, value: r2(over * num(l.cost)), state: 'Kept', _href: poHref(po.no) });
      }
    });
    if (po.status === 'Partly received' && po.expected < dayStart(now)) {
      const left = po.pieces - po.got;
      const each = po.pieces ? po.total / po.pieces : 0;
      if (po.lines.length) {
        po.lines.forEach((l) => {
          const miss = num(l.qty) - num(l.received);
          if (miss <= 0) return;
          const p = productBy(l.sku) || productBy(l.name);
          add({ at: po.expected, po: po.no, supId: po.supId, supplier: po.supplier, name: l.name, sku: p ? p.sku : '', cat: p ? p.cat : '', issue: 'Short', qty: miss, value: r2(miss * num(l.cost)), state: 'Not arrived', _href: poHref(po.no) });
        });
      } else add({ at: po.expected, po: po.no, supId: po.supId, supplier: po.supplier, name: 'Several products', sku: '', cat: '', issue: 'Short', qty: left, value: r2(left * each), state: 'Not arrived', _href: poHref(po.no) });
    }
  });
  return rows;
}

// ---- F1 · purchases by supplier ---------------------------------------------------------------------
const purchasesBySupplier = {
  id: 'purchases-by-supplier',
  group: 'purchase',
  title: 'Purchases by supplier',
  description: 'What you ordered, received and paid for each supplier, and how often their deliveries came on time.',
  icon: 'shopping-bag',
  keywords: 'purchase supplier spend bought ordered received bills paid on time',
  filters: ['supplier'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const db = safe(() => getDb(), { suppliers: [], bills: [], payments: [], credits: [] });
    const pos = allPOs(db.suppliers, db.bills);
    const rows = new Map();
    const row = (id, name) => {
      const k = id || name;
      if (!rows.has(k)) rows.set(k, { supplier: name || id, supId: id, orders: 0, ordered: 0, billed: 0, paid: 0, credit: 0, deliveries: 0, onTime: 0, _href: supplierHref(id) });
      return rows.get(k);
    };
    const name = (id) => (db.suppliers.find((s) => s.id === id) || {}).name || id;
    pos.filter((p) => p.at >= from && p.at < to && !NOT_SENT.includes(p.status) && p.status !== 'Cancelled' && supOk(filters, p.supId, p.supplier)).forEach((p) => { const x = row(p.supId, p.supplier); x.orders += 1; x.ordered += p.total; });
    db.bills.filter((b) => b.at >= from && b.at < to && supOk(filters, b.supplier)).forEach((b) => { row(b.supplier, name(b.supplier)).billed += num(b.amount); });
    db.payments.filter((p) => p.at >= from && p.at < to && supOk(filters, p.supplier)).forEach((p) => { row(p.supplier, name(p.supplier)).paid += num(p.amount); });
    db.credits.filter((c) => c.at >= from && c.at < to && supOk(filters, c.supplier)).forEach((c) => { row(c.supplier, name(c.supplier)).credit += num(c.amount); });
    deliveriesIn(pos, from, to).filter((x) => supOk(filters, x.supId, x.supplier)).forEach((x) => { const r = row(x.supId, x.supplier); r.deliveries += 1; if (!x.late) r.onTime += 1; });
    const list = [...rows.values()].map((x) => ({ ...x, ordered: r2(x.ordered), billed: r2(x.billed), paid: r2(x.paid), owed: x.supId ? safe(() => payableOf(x.supId, db), 0) : 0, onTimePct: x.deliveries ? x.onTime / x.deliveries : null }));
    const top = list.slice().sort((a, b) => b.billed - a.billed).filter((x) => x.billed > 0).slice(0, 10);
    const dl = sum(list, (x) => x.deliveries);
    return {
      kpis: [
        { key: 'ordered', label: 'Ordered', value: sum(list, (x) => x.ordered), format: 'money0', good: 'none', sub: `${sum(list, (x) => x.orders)} orders sent` },
        { key: 'billed', label: 'Received (billed)', value: sum(list, (x) => x.billed), format: 'money0', good: 'none' },
        { key: 'paid', label: 'Paid to suppliers', value: sum(list, (x) => x.paid), format: 'money0', good: 'none' },
        { key: 'ontime', label: 'Deliveries on time', value: dl ? sum(list, (x) => x.onTime) / dl : 0, format: 'pct', good: 'up', sub: `${dl} deliver${dl === 1 ? 'y' : 'ies'}` },
      ],
      chart: { type: 'hbar', labels: top.map((x) => x.supplier), series: [{ name: 'Received (billed)', values: top.map((x) => x.billed), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'supplier', label: 'Supplier' },
          { key: 'orders', label: 'Orders', format: 'int', align: 'right', total: 'sum' },
          { key: 'ordered', label: 'Ordered', format: 'money', align: 'right', total: 'sum' },
          { key: 'billed', label: 'Received (billed)', format: 'money', align: 'right', total: 'sum' },
          { key: 'paid', label: 'Paid', format: 'money', align: 'right', total: 'sum' },
          { key: 'credit', label: 'Credit notes', format: 'money', align: 'right', total: 'sum' },
          { key: 'owed', label: 'Owed now', format: 'money', align: 'right', total: 'sum' },
          { key: 'deliveries', label: 'Deliveries', format: 'int', align: 'right', total: 'sum' },
          { key: 'onTimePct', label: 'On time', format: 'pct', align: 'right' },
        ],
        rows: list,
        sort: { key: 'billed', dir: 'desc' },
      },
      notes: [
        'Ordered counts orders placed with the supplier in the period (not drafts or cancelled ones). Received is the bills for goods that arrived in the period, extra costs included.',
        `A delivery is on time when it arrived by the order’s expected date (${LEAD_DAYS} days after the order when no date was set).`,
      ],
    };
  },
};

// ---- F2 · purchases by product -----------------------------------------------------------------------
const purchasesByProduct = {
  id: 'purchases-by-product',
  group: 'purchase',
  title: 'Purchases by product',
  description: 'How many of each product you bought, what you paid on average and last time, and how the price moved.',
  icon: 'package-check',
  keywords: 'purchase product quantity average cost last cost price change bought',
  filters: ['supplier', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const ev = priceEvents().filter((e) => supOk(filters, e.supId, e.supplier) && (!filters.category || e.cat === filters.category));
    const inP = ev.filter((e) => e.at >= from && e.at < to);
    // pieces still to come on open orders, by product
    const coming = {};
    allPOs().filter((p) => OPEN.includes(p.status) && supOk(filters, p.supId, p.supplier)).forEach((p) => p.lines.forEach((l) => {
      const pr = productBy(l.sku) || productBy(l.name);
      const k = pr ? pr.sku : l.name;
      coming[k] = (coming[k] || 0) + Math.max(0, num(l.qty) - num(l.received));
    }));
    const rows = [...groupBy(inP, (e) => e.key)].map(([key, list]) => {
      const got = list.filter((e) => e.kind === 'bill');
      const qty = sum(got, (e) => e.qty), value = sum(got, (e) => e.qty * e.cost);
      const last = list[list.length - 1];
      const prev = ev.filter((e) => e.key === key && e.at < from).pop();
      return {
        name: last.name, sku: last.sku, cat: last.cat || '—', qty, onOrder: coming[key] || 0, value, avg: qty ? r2(value / qty) : last.cost, last: last.cost, landed: last.landed,
        prev: prev ? prev.cost : null, change: prev ? change(last.cost, prev.cost) : null, supplier: last.supplier, at: last.at, _href: last.sku ? '/add-product?sku=' + encodeURIComponent(last.sku) : '/purchase-orders',
      };
    });
    const top = rows.slice().sort((a, b) => b.value - a.value).filter((x) => x.value > 0).slice(0, 10);
    const up = rows.filter((x) => x.change > 0);
    return {
      kpis: [
        { key: 'value', label: 'Bought (received)', value: sum(rows, (x) => x.value), format: 'money0', good: 'none' },
        { key: 'qty', label: 'Pieces received', value: sum(rows, (x) => x.qty), format: 'int', good: 'none', sub: `${rows.length} products` },
        { key: 'onOrder', label: 'Still to come on orders', value: sum(rows, (x) => x.onOrder), format: 'int', good: 'none', sub: 'for these products' },
        { key: 'up', label: 'Bought dearer than before', value: up.length, format: 'int', good: 'down' },
      ],
      chart: { type: 'hbar', labels: top.map((x) => x.name), series: [{ name: 'Bought', values: top.map((x) => x.value), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'qty', label: 'Received', format: 'int', align: 'right', total: 'sum' },
          { key: 'onOrder', label: 'Still to come', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Bought', format: 'money', align: 'right', total: 'sum' },
          { key: 'avg', label: 'Average cost', format: 'money', align: 'right' },
          { key: 'last', label: 'Last cost', format: 'money', align: 'right' },
          { key: 'landed', label: 'Last landed cost', format: 'money', align: 'right' },
          { key: 'prev', label: 'Before the period', format: 'money', align: 'right' },
          { key: 'change', label: 'Change', format: 'pct', align: 'right' },
          { key: 'supplier', label: 'Last supplier' },
        ],
        rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'Received pieces come from the item lines of supplier bills (Receive goods). Older demo bills have no item lines, so they show under Purchases by supplier only.',
        'Landed cost adds the bill’s extra costs (transport, labour) to each piece in proportion to its price. Change compares the last cost with the last price paid before the period.',
      ],
    };
  },
};

// ---- F3 · purchase order status ----------------------------------------------------------------------
const STATUS_GROUP = (s) => (NOT_SENT.includes(s) ? 'Not sent yet' : s === 'Sent' ? 'Sent, waiting' : s);
const poStatus = {
  id: 'po-status',
  group: 'purchase',
  title: 'Purchase order status',
  description: 'Every purchase order: not sent, sent, partly received or received, and which are late to arrive.',
  icon: 'clipboard-list',
  keywords: 'purchase order status draft sent partly received overdue late arrival',
  filters: ['supplier', 'place'],
  snapshot: true,
  defaultPeriod: 'month',
  compute(ctx) {
    const { filters } = ctx;
    const today = dayStart(nowOf(ctx));
    const rows = allPOs().filter((p) => supOk(filters, p.supId, p.supplier) && (!filters.place || p.place === canon(filters.place))).map((p) => {
      const left = Math.max(0, p.pieces - p.got);
      const open = OPEN.includes(p.status);
      const late = open && left > 0 && p.expected < today ? Math.floor((today - dayStart(p.expected)) / DAY) : 0;
      return {
        no: p.no, supplier: p.supplier, at: p.at, status: p.status, place: p.place, expected: open || (NOT_SENT.includes(p.status) && p.expectedSet) ? p.expected : null,
        pieces: p.pieces, got: p.got, left: p.status === 'Cancelled' ? 0 : left, total: p.total, leftValue: open ? r2(Math.max(0, p.total - p.gotValue)) : NOT_SENT.includes(p.status) ? p.total : 0,
        late, state: late ? `${late} day${late === 1 ? '' : 's'} late` : open ? 'On the way' : p.status === 'Received' ? 'Done' : NOT_SENT.includes(p.status) ? 'Not sent' : '—',
        _href: poHref(p.no),
      };
    });
    const groups = ['Not sent yet', 'Sent, waiting', 'Partly received', 'Received', 'Cancelled'].map((g) => ({ g, value: sum(rows.filter((x) => STATUS_GROUP(x.status) === g), (x) => x.total) })).filter((x) => x.value > 0);
    const open = rows.filter((x) => OPEN.includes(x.status));
    const late = rows.filter((x) => x.late > 0);
    return {
      kpis: [
        { key: 'open', label: 'Open orders', value: open.length, format: 'int', good: 'none', sub: 'sent or partly received' },
        { key: 'coming', label: 'Still to arrive', value: sum(open, (x) => x.leftValue), format: 'money0', good: 'none', sub: `${sum(open, (x) => x.left)} pieces` },
        { key: 'late', label: 'Late to arrive', value: late.length, format: 'int', good: 'down', sub: late.length ? `on average ${Math.round(sum(late, (x) => x.late) / late.length)} days late` : '' },
        { key: 'notsent', label: 'Not sent yet', value: rows.filter((x) => NOT_SENT.includes(x.status)).length, format: 'int', good: 'none', sub: 'draft, waiting approval or approved' },
      ],
      chart: { type: 'donut', labels: groups.map((x) => x.g), series: [{ name: 'Order value', values: groups.map((x) => x.value), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'no', label: 'Order' },
          { key: 'supplier', label: 'Supplier' },
          { key: 'at', label: 'Placed', format: 'date' },
          { key: 'status', label: 'Status' },
          { key: 'expected', label: 'Expected', format: 'date' },
          { key: 'state', label: 'Arrival' },
          { key: 'pieces', label: 'Ordered', format: 'int', align: 'right', total: 'sum' },
          { key: 'got', label: 'Received', format: 'int', align: 'right', total: 'sum' },
          { key: 'left', label: 'To come', format: 'int', align: 'right', total: 'sum' },
          { key: 'total', label: 'Order value', format: 'money', align: 'right', total: 'sum' },
          { key: 'late', label: 'Days late', format: 'int', align: 'right' },
        ],
        rows,
        sort: { key: 'late', dir: 'desc' },
      },
      notes: [`Late = sent or partly received, with pieces still to come after the expected date. Orders without an expected date are expected ${LEAD_DAYS} days after they were placed.`],
    };
  },
};

// ---- F4 · receiving discrepancies -------------------------------------------------------------------
const ISSUES = ['Damaged', 'Wrong item', 'Short', 'Over'];
const ISSUE_TONE = { Damaged: 'danger', 'Wrong item': 'warning', Short: 'info', Over: 'slate' };
const receivingDiscrepancies = {
  id: 'receiving-discrepancies',
  group: 'purchase',
  title: 'Receiving problems',
  description: 'Damaged, wrong, short and extra pieces found when supplier deliveries arrived, by supplier and product.',
  icon: 'package-search',
  keywords: 'receiving discrepancy damaged wrong short over delivery grn supplier quality',
  filters: ['supplier', 'category'],
  defaultPeriod: 'lastmonth',
  compute(ctx) {
    const { from, to, filters } = ctx;
    const rows = discrepancies(from, to, allPOs(), nowOf(ctx)).filter((x) => supOk(filters, x.supId, x.supplier) && (!filters.category || x.cat === filters.category));
    const sups = [...groupBy(rows, (x) => x.supplier)].map(([s, list]) => ({ s, list, value: sum(list, (x) => x.value) })).sort((a, b) => b.value - a.value).slice(0, 10);
    const worst = sups[0];
    return {
      kpis: [
        { key: 'count', label: 'Problems found', value: rows.length, format: 'int', good: 'down' },
        { key: 'pieces', label: 'Pieces affected', value: sum(rows, (x) => x.qty), format: 'int', good: 'down', sub: ISSUES.map((i) => { const n = sum(rows.filter((x) => x.issue === i), (x) => x.qty); return n ? `${n} ${i.toLowerCase()}` : ''; }).filter(Boolean).join(' · ') },
        { key: 'value', label: 'Value at order price', value: sum(rows, (x) => x.value), format: 'money0', good: 'down' },
        { key: 'worst', label: 'Most problems', value: worst ? worst.s : '—', format: 'text', good: 'none', sub: worst ? `${sum(worst.list, (x) => x.qty)} pieces` : '' },
      ],
      chart: { type: 'stacked', labels: sups.map((x) => x.s), series: ISSUES.map((i) => ({ name: i, tone: ISSUE_TONE[i], values: sups.map((x) => sum(x.list.filter((r) => r.issue === i), (r) => r.qty)) })).filter((s) => s.values.some(Boolean)), format: 'int' },
      table: {
        columns: [
          { key: 'at', label: 'Date', format: 'date' },
          { key: 'po', label: 'Order' },
          { key: 'supplier', label: 'Supplier' },
          { key: 'name', label: 'Product' },
          { key: 'issue', label: 'Problem' },
          { key: 'qty', label: 'Pieces', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Value', format: 'money', align: 'right', total: 'sum' },
          { key: 'state', label: 'Now' },
        ],
        rows,
        sort: { key: 'at', dir: 'desc' },
      },
      notes: [
        'Damaged and wrong pieces are the ones reported in Receive goods (kept at Returns & damaged until they go back). Over = more received than ordered.',
        `Short = an order partly received whose expected date has passed (${LEAD_DAYS} days after the order when no date was set).`,
      ],
    };
  },
};

// ---- F5 · supplier payables ageing -------------------------------------------------------------------
const AGE = ['Not due yet', '1–30 days late', '31–60 days late', 'Over 60 days late'];
const AGE_KEY = ['notDue', 'd30', 'd60', 'd60p'];
const payablesAgeing = {
  id: 'supplier-payables-ageing',
  group: 'purchase',
  title: 'Supplier dues by age',
  description: 'What you owe each supplier now, split by how late the bills are.',
  icon: 'calendar-clock',
  keywords: 'payables ageing owed suppliers overdue bills due late dues creditors',
  filters: ['supplier'],
  snapshot: true,
  defaultPeriod: 'month',
  compute(ctx) {
    const { filters } = ctx;
    const today = dayStart(nowOf(ctx));
    const db = safe(() => getDb(), { suppliers: [], bills: [], credits: [] });
    const name = (id) => (db.suppliers.find((s) => s.id === id) || {}).name || id;
    const rows = new Map();
    db.bills.filter((b) => billLeft(b) > 0 && supOk(filters, b.supplier)).forEach((b) => {
      const x = rows.get(b.supplier) || { supplier: name(b.supplier), supId: b.supplier, bills: 0, notDue: 0, d30: 0, d60: 0, d60p: 0, total: 0, oldest: null, _href: supplierHref(b.supplier) };
      const late = -daysFrom(b.due, today);
      const left = billLeft(b);
      x[late <= 0 ? 'notDue' : late <= 30 ? 'd30' : late <= 60 ? 'd60' : 'd60p'] += left;
      x.total += left; x.bills += 1;
      if (late > 0 && (x.oldest == null || late > x.oldest)) x.oldest = late;
      rows.set(b.supplier, x);
    });
    const list = [...rows.values()].map((x) => {
      const credit = sum(db.credits.filter((c) => c.supplier === x.supId), (c) => c.unused);
      return { ...x, credit, net: Math.max(0, r2(x.total - credit)) };
    });
    const total = sum(list, (x) => x.total);
    const per = AGE_KEY.map((k) => sum(list, (x) => x[k]));
    return {
      kpis: [
        { key: 'total', label: 'Owed on bills', value: total, format: 'money0', good: 'down', sub: `${list.length} supplier${list.length === 1 ? '' : 's'} · ${sum(list, (x) => x.bills)} bills` },
        { key: 'late', label: 'Overdue', value: r2(per[1] + per[2] + per[3]), format: 'money0', good: 'down' },
        { key: 'old', label: 'Over 60 days late', value: per[3], format: 'money0', good: 'down' },
        { key: 'credit', label: 'Unused credit notes', value: sum(list, (x) => x.credit), format: 'money0', good: 'none' },
      ],
      chart: { type: 'donut', labels: AGE, series: [{ name: 'Owed', values: per, tone: 'warning' }], format: 'money0' },
      table: {
        columns: [
          { key: 'supplier', label: 'Supplier' },
          { key: 'bills', label: 'Open bills', format: 'int', align: 'right', total: 'sum' },
          { key: 'notDue', label: AGE[0], format: 'money', align: 'right', total: 'sum' },
          { key: 'd30', label: AGE[1], format: 'money', align: 'right', total: 'sum' },
          { key: 'd60', label: AGE[2], format: 'money', align: 'right', total: 'sum' },
          { key: 'd60p', label: AGE[3], format: 'money', align: 'right', total: 'sum' },
          { key: 'total', label: 'Owed on bills', format: 'money', align: 'right', total: 'sum' },
          { key: 'credit', label: 'Unused credit', format: 'money', align: 'right', total: 'sum' },
          { key: 'net', label: 'To pay', format: 'money', align: 'right', total: 'sum' },
          { key: 'oldest', label: 'Oldest late (days)', format: 'int', align: 'right' },
        ],
        rows: list,
        sort: { key: 'total', dir: 'desc' },
      },
      notes: ['Owed on a bill = amount − paid − credit notes used on it. Late counts days past the bill’s due date (the supplier’s credit terms). To pay takes off credit notes not used yet, as on Suppliers and Dues.'],
    };
  },
};

// ---- F6 · supplier returns, credit notes & bonuses ------------------------------------------------------
const returnsCredits = {
  id: 'supplier-returns-credits',
  group: 'purchase',
  title: 'Supplier returns, credits & bonuses',
  description: 'Goods sent back to suppliers, the credit notes you got for them and the bonuses suppliers paid.',
  icon: 'undo-2',
  keywords: 'supplier return credit note bonus rebate target refund',
  filters: ['supplier'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const db = safe(() => getDb(), { suppliers: [], returns: [], credits: [] });
    const name = (id) => (db.suppliers.find((s) => s.id === id) || {}).name || id;
    const rows = new Map();
    const row = (id, label) => {
      const k = id || label;
      if (!rows.has(k)) rows.set(k, { supplier: label || name(id), supId: id, returns: 0, pieces: 0, goods: 0, credit: 0, used: 0, unused: 0, bonus: 0, _href: supplierHref(id) });
      return rows.get(k);
    };
    (db.returns || []).filter((r) => r.at >= from && r.at < to && supOk(filters, r.supplier)).forEach((r) => {
      const x = row(r.supplier, name(r.supplier)); x.returns += 1; x.pieces += sum(r.lines || [], (l) => l.qty); x.goods += num(r.value);
    });
    (db.credits || []).filter((c) => c.at >= from && c.at < to && supOk(filters, c.supplier)).forEach((c) => {
      const x = row(c.supplier, name(c.supplier)); x.credit += num(c.amount); x.unused += num(c.unused); x.used += num(c.amount) - num(c.unused);
    });
    safe(() => getEntries(), []).filter((e) => e.cat === 'Bonus from suppliers' && num(e.amount) > 0 && e.at >= from && e.at < to).forEach((e) => {
      const s = safe(() => findSupplier(e.party, db.suppliers), null);
      if (!supOk(filters, s ? s.id : '', e.party)) return;
      row(s ? s.id : '', s ? s.name : e.party || 'Supplier').bonus += num(e.amount);
    });
    const list = [...rows.values()].map((x) => ({ ...x, back: r2(x.credit + x.bonus) }));
    const top = list.slice().sort((a, b) => b.back - a.back).slice(0, 10);
    return {
      kpis: [
        { key: 'goods', label: 'Goods sent back', value: sum(list, (x) => x.goods), format: 'money0', good: 'none', sub: `${sum(list, (x) => x.pieces)} pieces · ${sum(list, (x) => x.returns)} returns` },
        { key: 'credit', label: 'Credit notes', value: sum(list, (x) => x.credit), format: 'money0', good: 'up' },
        { key: 'unused', label: 'Credit not used yet', value: sum(list, (x) => x.unused), format: 'money0', good: 'none' },
        { key: 'bonus', label: 'Bonuses received', value: sum(list, (x) => x.bonus), format: 'money0', good: 'up' },
      ],
      chart: {
        type: 'stacked', labels: top.map((x) => x.supplier),
        series: [{ name: 'Credit notes', tone: 'primary', values: top.map((x) => x.credit) }, { name: 'Bonuses', tone: 'success', values: top.map((x) => x.bonus) }],
        format: 'money0',
      },
      table: {
        columns: [
          { key: 'supplier', label: 'Supplier' },
          { key: 'returns', label: 'Returns', format: 'int', align: 'right', total: 'sum' },
          { key: 'pieces', label: 'Pieces back', format: 'int', align: 'right', total: 'sum' },
          { key: 'goods', label: 'Goods value', format: 'money', align: 'right', total: 'sum' },
          { key: 'credit', label: 'Credit notes', format: 'money', align: 'right', total: 'sum' },
          { key: 'used', label: 'Used on bills', format: 'money', align: 'right', total: 'sum' },
          { key: 'unused', label: 'Not used yet', format: 'money', align: 'right', total: 'sum' },
          { key: 'bonus', label: 'Bonuses', format: 'money', align: 'right', total: 'sum' },
        ],
        rows: list,
        sort: { key: 'goods', dir: 'desc' },
      },
      notes: ['A supplier return makes a credit note for the goods’ value, used on the supplier’s open bills straight away (oldest due first). Bonuses are money in under Bonus from suppliers in the Money book.'],
    };
  },
};

// ---- F7 · purchase price history -------------------------------------------------------------------------
const priceHistory = {
  id: 'price-history',
  group: 'purchase',
  title: 'Purchase price history',
  description: 'What you paid for each product over time, the latest price, landed cost and how much it changed.',
  icon: 'chart-line',
  keywords: 'price history purchase cost trend increase landed cost inflation',
  filters: ['supplier', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const ev = priceEvents().filter((e) => supOk(filters, e.supId, e.supplier) && (!filters.category || e.cat === filters.category));
    const inP = ev.filter((e) => e.at >= from && e.at < to);
    const rows = [...groupBy(inP, (e) => e.key)].map(([key, list]) => {
      const prev = ev.filter((e) => e.key === key && e.at < from).pop();
      const first = list[0], last = list[list.length - 1];
      const base = prev ? prev.cost : first.cost;
      const costs = list.map((e) => e.cost);
      return {
        key, name: last.name, sku: last.sku, cat: last.cat || '—', buys: list.length, start: base, first: first.cost, last: last.cost, low: Math.min(...costs), high: Math.max(...costs),
        landed: last.landed, change: change(last.cost, base), spend: sum(list, (e) => e.qty * e.cost), supplier: last.supplier, at: last.at,
        _href: last.sku ? '/add-product?sku=' + encodeURIComponent(last.sku) : '/purchase-orders',
      };
    });
    // the 5 products with most spend, cost carried from one time bucket to the next
    const { buckets } = bucketsOf(from, to);
    const top = rows.slice().sort((a, b) => b.spend - a.spend).slice(0, 5);
    const series = top.map((r, i) => {
      let cur = r.start;
      return { name: r.name, tone: TONES[i], values: buckets.map((b) => { const hit = inP.filter((e) => e.key === r.key && e.at >= b.from && e.at < b.to); if (hit.length) cur = hit[hit.length - 1].cost; return cur; }) };
    });
    const ups = rows.filter((x) => x.change > 0), downs = rows.filter((x) => x.change < 0);
    const avg = rows.length ? rows.reduce((a, x) => a + (x.change || 0), 0) / rows.length : 0;
    return {
      kpis: [
        { key: 'products', label: 'Products bought', value: rows.length, format: 'int', good: 'none', sub: `${inP.length} purchases` },
        { key: 'avg', label: 'Average price change', value: avg, format: 'pct', good: 'down' },
        { key: 'up', label: 'Got dearer', value: ups.length, format: 'int', good: 'down' },
        { key: 'down', label: 'Got cheaper', value: downs.length, format: 'int', good: 'up' },
      ],
      chart: { type: 'line', labels: buckets.map((b) => b.label), series, format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'cat', label: 'Category' },
          { key: 'buys', label: 'Purchases', format: 'int', align: 'right', total: 'sum' },
          { key: 'start', label: 'Price before', format: 'money', align: 'right' },
          { key: 'low', label: 'Lowest', format: 'money', align: 'right' },
          { key: 'high', label: 'Highest', format: 'money', align: 'right' },
          { key: 'last', label: 'Latest', format: 'money', align: 'right' },
          { key: 'landed', label: 'Latest landed', format: 'money', align: 'right' },
          { key: 'change', label: 'Change', format: 'pct', align: 'right' },
          { key: 'at', label: 'Last bought', format: 'date' },
          { key: 'supplier', label: 'From' },
        ],
        rows,
        sort: { key: 'change', dir: 'desc' },
      },
      notes: [
        'Prices come from the item lines of supplier bills and of purchase orders sent but not received yet. Price before is the last price paid before the period (or the first in it).',
        'Landed cost adds the bill’s extra costs (transport, labour) to each piece in proportion to its price.',
      ],
    };
  },
};

// ---- F8 · supplier scorecard ------------------------------------------------------------------------------
const scorecard = {
  id: 'supplier-scorecard',
  group: 'purchase',
  title: 'Supplier scorecard',
  description: 'How each supplier did: deliveries on time, problems on arrival, price changes and how much you spent.',
  icon: 'trophy',
  keywords: 'supplier scorecard rating performance on time quality price trend spend vendor',
  filters: ['supplier'],
  defaultPeriod: 'lastmonth',
  compute(ctx) {
    const { from, to, filters } = ctx;
    const db = safe(() => getDb(), { suppliers: [], bills: [], returns: [] });
    const pos = allPOs(db.suppliers, db.bills);
    const name = (id) => (db.suppliers.find((s) => s.id === id) || {}).name || id;
    const rows = new Map();
    const row = (id, label) => {
      const k = id || label;
      if (!rows.has(k)) rows.set(k, { supplier: label || name(id), supId: id, spend: 0, orders: 0, deliveries: 0, onTime: 0, lateDays: 0, received: 0, issues: 0, returned: 0, changes: [], _href: supplierHref(id) });
      return rows.get(k);
    };
    db.bills.filter((b) => b.at >= from && b.at < to && supOk(filters, b.supplier)).forEach((b) => { row(b.supplier).spend += num(b.amount); });
    pos.filter((p) => p.at >= from && p.at < to && !NOT_SENT.includes(p.status) && p.status !== 'Cancelled' && supOk(filters, p.supId, p.supplier)).forEach((p) => { row(p.supId, p.supplier).orders += 1; });
    deliveriesIn(pos, from, to).filter((x) => supOk(filters, x.supId, x.supplier)).forEach((x) => {
      const r = row(x.supId, x.supplier); r.deliveries += 1; r.received += x.qty; r.lateDays += x.late; if (!x.late) r.onTime += 1;
    });
    discrepancies(from, to, pos, nowOf(ctx)).filter((x) => x.issue !== 'Short' && supOk(filters, x.supId, x.supplier)).forEach((x) => { row(x.supId, x.supplier).issues += x.qty; });
    (db.returns || []).filter((r) => r.at >= from && r.at < to && supOk(filters, r.supplier)).forEach((r) => { row(r.supplier).returned += num(r.value); });
    const ev = priceEvents(db.suppliers, db.bills, pos);
    [...groupBy(ev.filter((e) => e.at >= from && e.at < to && supOk(filters, e.supId, e.supplier)), (e) => (e.supId || e.supplier) + '|' + e.key)].forEach(([, list]) => {
      const last = list[list.length - 1];
      const prev = ev.filter((e) => e.key === last.key && e.at < from && e.supplier === last.supplier).pop();
      const c = change(last.cost, prev ? prev.cost : list[0].cost);
      if (c != null) row(last.supId, last.supplier).changes.push(c);
    });
    const list = [...rows.values()].map((x) => {
      const onTimePct = x.deliveries ? x.onTime / x.deliveries : null;
      const issueRate = x.received ? x.issues / (x.received + x.issues) : null;
      const trend = x.changes.length ? x.changes.reduce((a, b) => a + b, 0) / x.changes.length : null;
      const parts = [];
      if (onTimePct != null) parts.push([0.5, onTimePct]);
      if (issueRate != null) parts.push([0.3, Math.max(0, 1 - issueRate * 5)]);
      if (trend != null) parts.push([0.2, trend <= 0 ? 1 : Math.max(0, 1 - trend * 5)]);
      const w = parts.reduce((a, p) => a + p[0], 0);
      const score = w ? Math.round((parts.reduce((a, p) => a + p[0] * p[1], 0) / w) * 100) : null;
      return {
        ...x, spend: r2(x.spend), onTimePct, avgLate: x.deliveries ? x.lateDays / x.deliveries : null, issueRate, trend, score,
        rating: score == null ? 'Not enough data' : score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Watch',
      };
    });
    const dl = sum(list, (x) => x.deliveries), recv = sum(list, (x) => x.received), iss = sum(list, (x) => x.issues);
    const top = list.slice().sort((a, b) => b.spend - a.spend).filter((x) => x.spend > 0).slice(0, 10);
    return {
      kpis: [
        { key: 'spend', label: 'Spent with suppliers', value: sum(list, (x) => x.spend), format: 'money0', good: 'none', sub: `${list.filter((x) => x.spend > 0).length} suppliers billed` },
        { key: 'ontime', label: 'Deliveries on time', value: dl ? sum(list, (x) => x.onTime) / dl : 0, format: 'pct', good: 'up' },
        { key: 'issues', label: 'Problem rate on arrival', value: recv + iss ? iss / (recv + iss) : 0, format: 'pct', good: 'down', sub: `${iss} pieces damaged, wrong or over` },
        { key: 'watch', label: 'Suppliers to watch', value: list.filter((x) => x.rating === 'Watch').length, format: 'int', good: 'down' },
      ],
      chart: { type: 'hbar', labels: top.map((x) => x.supplier), series: [{ name: 'Spend', values: top.map((x) => x.spend), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'supplier', label: 'Supplier' },
          { key: 'spend', label: 'Spend', format: 'money', align: 'right', total: 'sum' },
          { key: 'orders', label: 'Orders', format: 'int', align: 'right', total: 'sum' },
          { key: 'deliveries', label: 'Deliveries', format: 'int', align: 'right', total: 'sum' },
          { key: 'onTimePct', label: 'On time', format: 'pct', align: 'right' },
          { key: 'avgLate', label: 'Days late (avg)', format: 'num', align: 'right' },
          { key: 'issueRate', label: 'Problem rate', format: 'pct', align: 'right' },
          { key: 'trend', label: 'Price change', format: 'pct', align: 'right' },
          { key: 'returned', label: 'Sent back', format: 'money', align: 'right', total: 'sum' },
          { key: 'score', label: 'Score', format: 'int', align: 'right' },
          { key: 'rating', label: 'Rating' },
        ],
        rows: list,
        sort: { key: 'spend', dir: 'desc' },
      },
      notes: [
        'Score out of 100: deliveries on time (half), problems on arrival (30%, 20% of pieces with problems scores 0) and price change (20%, a 20% rise scores 0). Parts without data are left out.',
        'Spend is the bills for goods received in the period. Price change compares each product’s latest price with the price paid before the period.',
      ],
    };
  },
};

export default [purchasesBySupplier, purchasesByProduct, poStatus, receivingDiscrepancies, payablesAgeing, returnsCredits, priceHistory, scorecard];
