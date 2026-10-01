// Reports · POS group. See ../catalogue.js for the definition contract.
// Shifts, counters and cash movements come from the POS store (posStore.js: getShifts, getCash,
// getCounters), counter sales from the sale lines of the sales book, and manager PIN approvals from
// the audit log (auditLog.js). A shift belongs to the period it was closed in.

import { getShifts, getCash, getCounters, CASH_LABEL } from '../../posStore';
import { getAuditLog } from '../../auditLog';
import * as salesBook from '../../salesBook';
import { sum, groupBy, fmt } from '../period';

// ---- shared helpers -------------------------------------------------------------------------------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const num = (n) => Number(n) || 0;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const rate = (a, b) => (b ? a / b : 0);
const HOUR = 36e5;
const TONES = ['primary', 'success', 'info', 'warning', 'slate', 'danger'];
const METHOD_ORDER = ['Cash', 'bKash', 'Nagad', 'Card', 'Rocket', 'Bank'];

/** Closed shifts in [from, to), newest first, with the counter / staff filters applied. */
function closedShifts(from, to, f = {}) {
  return safe(() => getShifts(), []).filter((s) => s && s.closedAt && s.closedAt >= from && s.closedAt < to
    && (!f.counter || s.counter === f.counter) && (!f.staff || s.cashier === f.staff)
    && (!f.place || placeOfCounter(s.counter) === f.place))
    .sort((a, b) => b.closedAt - a.closedAt);
}
let counterIdx = null;
const placeOfCounter = (name) => {
  if (!counterIdx) counterIdx = Object.fromEntries(safe(() => getCounters(), []).map((c) => [c.name, c.location]));
  return counterIdx[name] || '';
};
const hoursOf = (s) => Math.max(0, (num(s.closedAt) - num(s.openedAt)) / HOUR);
/** Payment methods a list of shifts took, in the usual order. */
const methodsOf = (shifts) => {
  const set = new Set();
  shifts.forEach((s) => Object.keys(s.byMethod || {}).forEach((m) => set.add(m)));
  return [...set].sort((a, b) => (METHOD_ORDER.indexOf(a) + 1 || 99) - (METHOD_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b));
};

// ---- H1 Shift / Z-report ---------------------------------------------------------------------------
const zReport = {
  id: 'shift-z-report',
  group: 'pos',
  title: 'Shift Z-reports',
  description: 'Each closed shift: who worked which counter, what it sold by payment method, and whether the cash counted matched.',
  icon: 'receipt-text',
  keywords: 'z report shift close end of day drawer cash counted expected over short register',
  filters: ['counter', 'staff'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const shifts = closedShifts(from, to, f);
    counterIdx = null;
    const methods = methodsOf(shifts);
    const rows = shifts.map((s) => {
      const r = {
        _key: s.id, id: s.id, counter: s.counter || '', cashier: s.cashier || '', opened: s.openedAt, closed: s.closedAt, count: num(s.count), sold: num(s.sold),
        discounts: num(s.discounts), refunds: num(s.refunds), pickups: num(s.pickups), expected: num(s.expected), counted: num(s.counted), diff: num(s.diff), note: s.note || '', _href: '/pos-manage',
      };
      methods.forEach((m) => { r['m_' + m] = num((s.byMethod || {})[m]); });
      return r;
    });
    const sold = sum(rows, (r) => r.sold), diff = sum(rows, (r) => r.diff);
    const off = rows.filter((r) => Math.abs(r.diff) > 0.004);
    const labels = [...rows].reverse().map((r) => `${r.id} · ${r.cashier.split(' ')[0]}`);
    return {
      kpis: [
        { key: 'shifts', label: 'Shifts closed', value: rows.length, format: 'int', good: 'none', sub: `${fmt(sum(rows, (r) => r.count), 'int')} sales` },
        { key: 'sold', label: 'Sold in shifts', value: sold, format: 'money', good: 'up', sub: 'VAT included' },
        { key: 'expected', label: 'Cash expected', value: sum(rows, (r) => r.expected), format: 'money', good: 'none', sub: `Counted ${fmt(sum(rows, (r) => r.counted), 'money0')}` },
        { key: 'diff', label: 'Over / short', value: diff, format: 'money', good: 'none', sub: `${off.length} shift${off.length === 1 ? '' : 's'} did not match` },
      ],
      chart: { type: 'stacked', labels, series: methods.map((m, i) => ({ name: m, tone: TONES[i % TONES.length], values: [...rows].reverse().map((r) => r['m_' + m]) })), format: 'money0' },
      table: {
        columns: [
          { key: 'id', label: 'Shift' },
          { key: 'counter', label: 'Counter' },
          { key: 'cashier', label: 'Cashier' },
          { key: 'opened', label: 'Opened', format: 'datetime' },
          { key: 'closed', label: 'Closed', format: 'datetime' },
          { key: 'count', label: 'Sales', format: 'int', total: 'sum' },
          ...methods.map((m) => ({ key: 'm_' + m, label: m, format: 'money', total: 'sum' })),
          { key: 'sold', label: 'Sold', format: 'money', total: 'sum' },
          { key: 'refunds', label: 'Refunds', format: 'money', total: 'sum' },
          { key: 'pickups', label: 'Picked up', format: 'money', total: 'sum' },
          { key: 'expected', label: 'Cash expected', format: 'money', total: 'sum' },
          { key: 'counted', label: 'Cash counted', format: 'money', total: 'sum' },
          { key: 'diff', label: 'Over / short', format: 'money', total: 'sum' },
          { key: 'note', label: 'Note' },
        ],
        rows,
        sort: { key: 'closed', dir: 'desc' },
      },
      notes: ['Cash expected is the opening float plus cash sales, less cash refunds, pickups and paid-outs, plus cash added. Over / short is counted minus expected.'],
    };
  },
};

// ---- H2 Counter performance ------------------------------------------------------------------------
const counterPerformance = {
  id: 'counter-performance',
  group: 'pos',
  title: 'Counter performance',
  description: 'How each counter does: shifts worked, hours open, sales, average sale and sales per hour.',
  icon: 'monitor-smartphone',
  keywords: 'counter register till performance sales per hour average sale shifts hours',
  filters: ['place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    counterIdx = null;
    const shifts = closedShifts(from, to, f);
    const lines = (typeof salesBook.getSaleLines === 'function' ? safe(() => salesBook.getSaleLines(), []) : [])
      .filter((l) => l && l.counter && l.at >= from && l.at < to && (!f.place || l.place === f.place));
    const counters = safe(() => getCounters(), []).filter((c) => !f.place || c.location === f.place);
    const names = [...new Set([...counters.map((c) => c.name), ...shifts.map((s) => s.counter), ...lines.map((l) => l.counter)])].filter(Boolean);
    const byShift = groupBy(shifts, (s) => s.counter);
    const byLine = groupBy(lines, (l) => l.counter);
    const rows = names.map((name) => {
      const c = counters.find((x) => x.name === name) || {};
      const sh = byShift.get(name) || [], ls = byLine.get(name) || [];
      const hours = r2(sh.reduce((a, s) => a + hoursOf(s), 0));
      const shiftSold = sum(sh, (s) => s.sold), shiftCount = sum(sh, (s) => s.count);
      const revenue = sum(ls, (l) => l.revenue), orders = new Set(ls.map((l) => l.saleId || l.id)).size;
      return {
        _key: name, counter: name, place: c.location || placeOfCounter(name) || (ls[0] || {}).place || '', state: c.active === false ? 'Closed' : 'Open',
        revenue, orders, aov: orders ? revenue / orders : 0, units: sum(ls, (l) => l.qty),
        shifts: sh.length, hours, shiftSold, perHour: hours ? shiftSold / hours : null, diff: sum(sh, (s) => s.diff), _href: '/pos-manage',
      };
    }).filter((r) => r.orders || r.shifts || r.state === 'Open').sort((a, b) => b.revenue - a.revenue);
    const revenue = sum(rows, (r) => r.revenue), orders = sum(rows, (r) => r.orders);
    const hours = sum(rows, (r) => r.hours), shiftSold = sum(rows, (r) => r.shiftSold);
    const best = [...rows].filter((r) => r.perHour).sort((a, b) => b.perHour - a.perHour)[0];
    return {
      kpis: [
        { key: 'revenue', label: 'Counter sales', value: revenue, format: 'money', good: 'up', sub: `${rows.filter((r) => r.orders).length} counters selling` },
        { key: 'aov', label: 'Average sale', value: orders ? revenue / orders : 0, format: 'money', good: 'up', sub: `${fmt(orders, 'int')} sales` },
        { key: 'perHour', label: 'Sales per hour open', value: hours ? shiftSold / hours : 0, format: 'money', good: 'up', sub: `${fmt(hours, 'num')} hours in ${sum(rows, (r) => r.shifts)} recorded shifts` },
        { key: 'best', label: 'Busiest counter per hour', value: best ? best.counter : '—', format: 'text', good: 'none', sub: best ? `${fmt(best.perHour, 'money0')} an hour` : '' },
      ],
      chart: { type: 'hbar', labels: rows.map((r) => r.counter), series: [{ name: 'Sales', tone: 'primary', values: rows.map((r) => r.revenue) }], format: 'money0' },
      table: {
        columns: [
          { key: 'counter', label: 'Counter' },
          { key: 'place', label: 'Branch' },
          { key: 'state', label: 'Status' },
          { key: 'orders', label: 'Sales', format: 'int', total: 'sum' },
          { key: 'revenue', label: 'Sold', format: 'money', total: 'sum' },
          { key: 'aov', label: 'Average sale', format: 'money', total: orders ? r2(revenue / orders) : 0 },
          { key: 'shifts', label: 'Shifts', format: 'int', total: 'sum' },
          { key: 'hours', label: 'Hours open', format: 'num', total: 'sum' },
          { key: 'shiftSold', label: 'Sold in shifts', format: 'money', total: 'sum' },
          { key: 'perHour', label: 'Per hour open', format: 'money', total: hours ? r2(shiftSold / hours) : 'none' },
          { key: 'diff', label: 'Over / short', format: 'money', total: 'sum' },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        'Sold and average sale come from the sales book (before VAT, wholesale invoices at a counter included). Hours open and sales per hour come from the shifts closed at the register (VAT included).',
      ],
    };
  },
};

// ---- H3 Cash variance history ----------------------------------------------------------------------
const cashVariance = {
  id: 'cash-variance-history',
  group: 'pos',
  title: 'Cash over & short by cashier',
  description: 'Every shift where the drawer did not match, by cashier over time, flagging people who are short again and again.',
  icon: 'scale',
  keywords: 'cash variance over short drawer cashier shortage missing money discrepancy',
  filters: ['staff', 'counter'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    counterIdx = null;
    const shifts = closedShifts(from, to, f).sort((a, b) => a.closedAt - b.closedAt);
    const run = {};
    const shortCount = {};
    shifts.forEach((s) => { if (num(s.diff) < -0.004) shortCount[s.cashier] = (shortCount[s.cashier] || 0) + 1; });
    const rows = shifts.map((s) => {
      run[s.cashier] = r2((run[s.cashier] || 0) + num(s.diff));
      const d = num(s.diff);
      return {
        _key: s.id, id: s.id, closed: s.closedAt, cashier: s.cashier || '', counter: s.counter || '', expected: num(s.expected), counted: num(s.counted), diff: d,
        result: d > 0.004 ? 'Over' : d < -0.004 ? 'Short' : 'Matched', running: run[s.cashier],
        flag: (shortCount[s.cashier] || 0) >= 2 ? `Short ${shortCount[s.cashier]} times` : '', note: s.note || '', _href: '/pos-manage',
      };
    });
    const people = [...groupBy(rows, (r) => r.cashier)].map(([name, list]) => ({
      name, short: -sum(list.filter((r) => r.diff < 0), (r) => r.diff), over: sum(list.filter((r) => r.diff > 0), (r) => r.diff), shifts: list.length,
    })).sort((a, b) => b.short - a.short || b.over - a.over);
    const flagged = Object.keys(shortCount).filter((k) => shortCount[k] >= 2);
    const short = sum(people, (p) => p.short), over = sum(people, (p) => p.over);
    return {
      kpis: [
        { key: 'net', label: 'Net over / short', value: r2(over - short), format: 'money', good: 'none', sub: `${rows.length} shift${rows.length === 1 ? '' : 's'} closed` },
        { key: 'short', label: 'Total short', value: short, format: 'money', good: 'down', sub: `${rows.filter((r) => r.result === 'Short').length} shifts short` },
        { key: 'over', label: 'Total over', value: over, format: 'money', good: 'none', sub: `${rows.filter((r) => r.result === 'Over').length} shifts over` },
        { key: 'flagged', label: 'Short more than once', value: flagged.length, format: 'int', good: 'down', sub: flagged.join(', ') || 'Nobody' },
      ],
      chart: {
        type: 'hbar', labels: people.map((p) => p.name),
        series: [{ name: 'Short', tone: 'danger', values: people.map((p) => p.short) }, { name: 'Over', tone: 'success', values: people.map((p) => p.over) }], format: 'money0',
      },
      table: {
        columns: [
          { key: 'closed', label: 'Closed', format: 'datetime' },
          { key: 'id', label: 'Shift' },
          { key: 'cashier', label: 'Cashier' },
          { key: 'counter', label: 'Counter' },
          { key: 'expected', label: 'Expected', format: 'money', total: 'sum' },
          { key: 'counted', label: 'Counted', format: 'money', total: 'sum' },
          { key: 'diff', label: 'Over / short', format: 'money', total: 'sum' },
          { key: 'result', label: 'Result' },
          { key: 'running', label: 'Cashier’s running total', format: 'money', total: 'none' },
          { key: 'flag', label: 'Flag' },
          { key: 'note', label: 'Note' },
        ],
        rows,
        sort: { key: 'closed', dir: 'desc' },
      },
      notes: ['A cashier is flagged when their drawer was short two or more times in the period. The running total adds up each cashier’s over and short shift by shift.'],
    };
  },
};

// ---- H4 Cash pickups & paid-outs ---------------------------------------------------------------------
const cashMoves = {
  id: 'cash-pickups-paidouts',
  group: 'pos',
  title: 'Cash pickups & paid-outs',
  description: 'Cash taken from the drawers to the safe, the bank or head office, cash added for change, and money paid out with the reason.',
  icon: 'banknote',
  keywords: 'cash pickup drop safe bank deposit paid out petty cash float drawer',
  filters: ['counter'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const moves = safe(() => getCash(), []).filter((m) => m && m.at >= from && m.at < to && (!f.counter || m.counter === f.counter)).sort((a, b) => b.at - a.at);
    const where = (m) => (m.type === 'pickup' ? m.to || 'Shop safe' : CASH_LABEL[m.type] || m.type);
    const rows = moves.map((m) => ({
      _key: m.id, at: m.at, id: m.id, type: CASH_LABEL[m.type] || m.type, counter: m.counter || '', cashier: m.cashier || '', by: m.by || '', to: m.type === 'pickup' ? m.to || '' : m.type === 'in' ? 'Into the drawer' : 'Paid out',
      reason: m.note || '', amount: num(m.amount), signed: m.type === 'in' ? num(m.amount) : -num(m.amount), _href: '/pos-manage',
    }));
    const total = (pred) => sum(moves.filter(pred), (m) => m.amount);
    const picked = total((m) => m.type === 'pickup');
    const slices = [...groupBy(moves, where)].map(([name, list]) => ({ name, v: sum(list, (m) => m.amount) })).sort((a, b) => b.v - a.v);
    return {
      kpis: [
        { key: 'picked', label: 'Picked up', value: picked, format: 'money', good: 'none', sub: `${moves.filter((m) => m.type === 'pickup').length} pickups` },
        { key: 'bank', label: 'Sent to the bank', value: total((m) => m.type === 'pickup' && m.to === 'Bank deposit'), format: 'money', good: 'none' },
        { key: 'safe', label: 'Into the safe', value: total((m) => m.type === 'pickup' && m.to !== 'Bank deposit'), format: 'money', good: 'none', sub: 'Shop safe and head office' },
        { key: 'out', label: 'Paid out', value: total((m) => m.type === 'out'), format: 'money', good: 'down', sub: `${moves.filter((m) => m.type === 'out').length} payments` },
        { key: 'in', label: 'Cash added', value: total((m) => m.type === 'in'), format: 'money', good: 'none', sub: 'Change for the drawer' },
      ],
      chart: { type: 'donut', labels: slices.map((s) => s.name), series: [{ name: 'Amount', values: slices.map((s) => s.v) }], format: 'money0' },
      table: {
        columns: [
          { key: 'at', label: 'When', format: 'datetime' },
          { key: 'id', label: 'Ref' },
          { key: 'type', label: 'Type' },
          { key: 'counter', label: 'Counter' },
          { key: 'cashier', label: 'Cashier' },
          { key: 'by', label: 'Done by' },
          { key: 'to', label: 'Went to' },
          { key: 'reason', label: 'Reason or slip' },
          { key: 'amount', label: 'Amount', format: 'money', total: 'sum' },
          { key: 'signed', label: 'Drawer change', format: 'money', total: 'sum' },
        ],
        rows,
        sort: { key: 'at', dir: 'desc' },
      },
      notes: ['Recorded at the register (F10) or in POS management. Pickups move cash to the safe or bank, so they are not spending; paid-outs are.'],
    };
  },
};

// ---- H5 POS audit (manager PIN log) ----------------------------------------------------------------
const posAudit = {
  id: 'pos-audit',
  group: 'pos',
  title: 'Manager approvals (PIN log)',
  description: 'Every manager PIN asked for: voids, price overrides, big discounts, refunds and late returns, who asked, who approved, and wrong PINs.',
  icon: 'shield-check',
  keywords: 'audit manager pin approval override void refund wrong pin security log',
  filters: ['staff', 'counter'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const log = safe(() => getAuditLog(), []).filter((a) => a && a.at >= from && a.at < to && (!f.staff || a.by === f.staff || a.approvedBy === f.staff) && (!f.counter || a.counter === f.counter));
    const rows = log.map((a) => ({
      _key: a.id, at: a.at, id: a.id, action: a.action || '', detail: a.detail || '', by: a.by || '', approvedBy: a.approvedBy || '—', amount: num(a.amount),
      result: a.ok === false ? 'Wrong PIN' : 'Approved', counter: a.counter || a.place || '', ref: a.ref || '', _href: '/pos-manage',
    }));
    const failed = rows.filter((r) => r.result === 'Wrong PIN');
    const approved = rows.filter((r) => r.result === 'Approved');
    const people = [...groupBy(rows, (r) => r.by || 'Not recorded')].map(([name, list]) => ({ name, ok: list.filter((r) => r.result === 'Approved').length, bad: list.filter((r) => r.result !== 'Approved').length })).sort((a, b) => b.ok + b.bad - (a.ok + a.bad));
    const voids = approved.filter((r) => /^Void/.test(r.action));
    return {
      kpis: [
        { key: 'asked', label: 'Approvals asked', value: rows.length, format: 'int', good: 'none', sub: `${approved.length} approved` },
        { key: 'failed', label: 'Wrong PIN', value: failed.length, format: 'int', good: 'down', sub: failed.length ? `${fmt(sum(failed, (r) => r.amount), 'money0')} stopped` : '' },
        { key: 'voids', label: 'Voids approved', value: voids.length, format: 'int', good: 'down', sub: fmt(sum(voids, (r) => r.amount), 'money0') },
        { key: 'amount', label: 'Value approved', value: sum(approved, (r) => r.amount), format: 'money', good: 'down' },
        { key: 'top', label: 'Asked most', value: people[0] ? people[0].name : '—', format: 'text', good: 'none', sub: people[0] ? `${people[0].ok + people[0].bad} times` : '' },
      ],
      chart: {
        type: 'hbar', labels: people.slice(0, 10).map((p) => p.name),
        series: [{ name: 'Approved', tone: 'primary', values: people.slice(0, 10).map((p) => p.ok) }, { name: 'Wrong PIN', tone: 'danger', values: people.slice(0, 10).map((p) => p.bad) }], format: 'int',
      },
      table: {
        columns: [
          { key: 'at', label: 'When', format: 'datetime' },
          { key: 'action', label: 'Action' },
          { key: 'detail', label: 'Detail' },
          { key: 'by', label: 'Asked by' },
          { key: 'approvedBy', label: 'Approved by' },
          { key: 'counter', label: 'Counter' },
          { key: 'ref', label: 'Sale' },
          { key: 'amount', label: 'Amount', format: 'money', total: 'sum' },
          { key: 'result', label: 'Result' },
        ],
        rows,
        sort: { key: 'at', dir: 'desc' },
      },
      notes: ['Every manager PIN entered at the POS and in stock screens is logged, approved or not. A wrong PIN means the action did not happen. Sales cancelled at the counter before payment are logged as voids without a PIN.'],
    };
  },
};

export default [zReport, counterPerformance, cashVariance, cashMoves, posAudit];
