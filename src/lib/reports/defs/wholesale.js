// Reports · Wholesale group. See ../catalogue.js for the definition contract.
// Sales come from the sales book (salesBook.getSales, channel Wholesale), so they match Sales & profit;
// invoices, payments, deliveries and dues come from invoices.js; credit limits from customers.js.

import { getInvoices, statusOf, deliveryOf, sentOf, stockOutAtSale, creditOf, discountsOf, challanNo } from '../../invoices';
import { getCustomers, tierOf } from '../../customers';
import { holdsFor } from '../../stockHolds';
import * as salesBook from '../../salesBook';
import { sum, groupBy, fmt } from '../period';

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const rate = (a, b) => (b ? a / b : 0);
const DAY = 864e5;
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const invHref = (id) => '/sales-invoice?id=' + encodeURIComponent(id);
const custHref = (phone) => (phone ? '/wholesale-customer?phone=' + encodeURIComponent(phone) : '/sales-invoices');
const nameOf = (inv) => (inv.customer && inv.customer.name) || 'Walk-in customer';
const phoneOf = (inv) => digits(inv.customer && inv.customer.phone);
const allInvoices = () => safe(() => getInvoices(), []).filter((i) => i && i.totals);
const wholesaleInvoices = () => allInvoices().filter((i) => i.wholesale);
const ageOf = (inv, now) => Math.max(0, Math.floor((now - inv.at) / DAY));
const STATUS = { paid: 'Paid', partial: 'Part paid', unpaid: 'Unpaid' };
/** The customer book entry for a phone or a name. */
function bookFinder() {
  const book = safe(() => getCustomers(), []);
  return (phone, name) => book.find((c) => (phone && digits(c.phone) === phone)) || book.find((c) => name && c.name === name) || null;
}

// ---- wholesale sales by customer -------------------------------------------------------------------
const byCustomer = {
  id: 'wholesale-by-customer',
  group: 'wholesale',
  title: 'Wholesale sales by customer',
  description: 'Who buys the most wholesale, at which price list, with what margin and discount, when they last ordered and what they owe.',
  icon: 'warehouse',
  keywords: 'wholesale customer dealer shop distributor price list tier margin discount volume',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to, now }) {
    const find = bookFinder();
    const allSales = safe(() => salesBook.getSales(), []).filter((s) => s.channel === 'Wholesale');
    const sales = allSales.filter((s) => s.at >= from && s.at < to);
    const invoices = wholesaleInvoices();
    const lines = (typeof salesBook.getSaleLines === 'function' ? safe(() => salesBook.getSaleLines(), []) : []).filter((l) => l && l.channel === 'Wholesale' && l.at >= from && l.at < to);
    const rows = [...groupBy(sales, (s) => s.party || 'Customer')].map(([name, list]) => {
      const inv = invoices.filter((i) => nameOf(i) === name);
      const phone = (inv[0] && phoneOf(inv[0])) || digits((find('', name) || {}).phone);
      const c = find(phone, name);
      const ids = new Set(list.map((s) => s.ref || s.id));
      const mineLines = lines.filter((l) => ids.has(l.saleId) || (l.customer && l.customer.name === name));
      const periodInv = inv.filter((i) => ids.has(i.id));
      const units = mineLines.length ? sum(mineLines, (l) => l.qty) : sum(periodInv, (i) => i.totals.units || sum(i.lines || [], (l) => l.qty));
      const disc = mineLines.length ? sum(mineLines, (l) => l.disc) : sum(periodInv, (i) => discountsOf(i));
      const revenue = sum(list, (s) => s.revenue), cost = sum(list, (s) => s.cost);
      const last = Math.max(...allSales.filter((s) => s.party === name && s.at < to).map((s) => s.at), 0);
      return {
        customer: name, phone: phone || '', tier: c ? (safe(() => tierOf(c), null) || {}).label || '' : (inv[0] && inv[0].tier) || '',
        orders: list.length, units, revenue, disc, cost, margin: r2(revenue - cost), marginPct: rate(revenue - cost, revenue),
        last: last || null, due: sum(invoices.filter((i) => (phone && phoneOf(i) === phone) || nameOf(i) === name), (i) => Math.max(0, i.due)),
        est: list.some((s) => s.est), _href: custHref(phone),
      };
    });
    const total = sum(rows, (r) => r.revenue);
    const top = rows.slice().sort((a, b) => b.revenue - a.revenue);
    const sleeping = rows.filter((r) => r.last && (now || to) - r.last > 30 * DAY).length;
    return {
      kpis: [
        { key: 'sales', label: 'Wholesale sales', value: total, format: 'money0', good: 'up' },
        { key: 'margin', label: 'Gross margin', value: rate(sum(rows, (r) => r.margin), total), format: 'pct', good: 'up', sub: fmt(sum(rows, (r) => r.margin), 'money0') },
        { key: 'customers', label: 'Customers who bought', value: rows.length, format: 'int', good: 'up', sub: sleeping ? `${sleeping} not ordered in 30 days` : '' },
        { key: 'top', label: 'Biggest customer', value: top[0] ? top[0].customer : '—', format: 'text', good: 'none', sub: top[0] ? `${fmt(rate(top[0].revenue, total), 'pct')} of wholesale` : '' },
        { key: 'due', label: 'They owe you now', value: sum(rows, (r) => r.due), format: 'money0', good: 'down' },
      ],
      chart: { type: 'hbar', labels: top.slice(0, 10).map((r) => r.customer), series: [{ name: 'Sales', values: top.slice(0, 10).map((r) => r.revenue), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'tier', label: 'Price list' },
          { key: 'orders', label: 'Invoices', format: 'int', align: 'right', total: 'sum' },
          { key: 'units', label: 'Units', format: 'int', align: 'right', total: 'sum' },
          { key: 'revenue', label: 'Sales', format: 'money0', align: 'right', total: 'sum' },
          { key: 'disc', label: 'Discount', format: 'money0', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Cost of goods', format: 'money0', align: 'right', total: 'sum' },
          { key: 'margin', label: 'Margin', format: 'money0', align: 'right', total: 'sum' },
          { key: 'marginPct', label: 'Margin %', format: 'pct', align: 'right', total: rate(sum(rows, (r) => r.margin), total) },
          { key: 'last', label: 'Last order', format: 'date' },
          { key: 'due', label: 'Due now', format: 'money0', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        'Sales are before VAT, on the day of the invoice, the same as Sales & profit. Cost is the buying price of the goods; older invoices without item lines use the usual wholesale cost share.',
        'Units and discount come from invoices with item lines. Due now is everything the customer owes today.',
      ],
    };
  },
};

// ---- invoice status --------------------------------------------------------------------------------
const invoiceStatus = {
  id: 'invoice-status',
  group: 'wholesale',
  title: 'Invoice status',
  description: 'Every invoice as paid, part paid or unpaid, with what is still due and which are more than 30 days old.',
  icon: 'file-text',
  keywords: 'invoice unpaid partial paid overdue due collection receivable',
  filters: ['customerType'],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ now, filters }) {
    const t = now || Date.now();
    const list = allInvoices().filter((i) => !filters.customerType || (i.wholesale ? 'Wholesale' : 'Retail') === filters.customerType);
    const rows = list.map((i) => {
      const st = statusOf(i);
      const age = ageOf(i, t);
      const due = Math.max(0, i.due);
      return {
        id: i.id, at: i.at, customer: nameOf(i), type: i.wholesale ? 'Wholesale' : 'Retail', total: i.totals.total || 0,
        paid: r2((i.totals.total || 0) - due), due, status: STATUS[st], age: st === 'paid' ? null : age,
        overdue: st !== 'paid' && age > 30 ? 'Over 30 days' : '', paidAt: i.paidAt || null, _st: st, _href: invHref(i.id),
      };
    });
    const of = (st) => rows.filter((r) => r._st === st);
    const overdue = rows.filter((r) => r.overdue);
    const due = sum(rows, (r) => r.due);
    return {
      kpis: [
        { key: 'due', label: 'Still due', value: due, format: 'money0', good: 'down', sub: `${of('unpaid').length + of('partial').length} invoices` },
        { key: 'unpaid', label: 'Unpaid', value: of('unpaid').length, format: 'int', good: 'down', sub: fmt(sum(of('unpaid'), (r) => r.due), 'money0') },
        { key: 'partial', label: 'Part paid', value: of('partial').length, format: 'int', good: 'down', sub: fmt(sum(of('partial'), (r) => r.due), 'money0') + ' left' },
        { key: 'overdue', label: 'Over 30 days', value: sum(overdue, (r) => r.due), format: 'money0', good: 'down', sub: `${overdue.length} invoice${overdue.length === 1 ? '' : 's'}` },
        { key: 'paid', label: 'Paid', value: of('paid').length, format: 'int', good: 'up' },
      ],
      chart: { type: 'donut', labels: ['Unpaid', 'Part paid', 'Paid'], series: [{ name: 'Invoices', values: [of('unpaid').length, of('partial').length, of('paid').length] }], format: 'int' },
      table: {
        columns: [
          { key: 'id', label: 'Invoice' },
          { key: 'at', label: 'Date', format: 'date' },
          { key: 'customer', label: 'Customer' },
          { key: 'type', label: 'Type' },
          { key: 'total', label: 'Total', format: 'money', align: 'right', total: 'sum' },
          { key: 'paid', label: 'Paid', format: 'money', align: 'right', total: 'sum' },
          { key: 'due', label: 'Due', format: 'money', align: 'right', total: 'sum' },
          { key: 'status', label: 'Status' },
          { key: 'age', label: 'Days open', format: 'int', align: 'right' },
          { key: 'overdue', label: 'Overdue' },
        ],
        rows,
        sort: { key: 'due', dir: 'desc' },
      },
      notes: ['Every invoice as of now (wholesale invoices and counter sales made out to a customer). Days open count from the invoice date; there are no payment terms yet, so over 30 days is treated as overdue.'],
    };
  },
};

// ---- pending deliveries -----------------------------------------------------------------------------
const pendingDeliveries = {
  id: 'pending-deliveries',
  group: 'wholesale',
  title: 'Goods waiting for delivery',
  description: 'Invoices whose goods have not all been handed over: what was ordered, what went out on challans, what is left and for how long.',
  icon: 'package-open',
  keywords: 'delivery challan partial pending sent ordered held gate pass waiting',
  filters: [],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ now }) {
    const t = now || Date.now();
    const rows = allInvoices().map((i) => ({ i, d: deliveryOf(i) }))
      .filter(({ i, d }) => d.left > 0 && (!stockOutAtSale(i) || (i.deliveries || []).length > 0))
      .map(({ i, d }) => {
        const sent = sentOf(i);
        const valueLeft = sum(i.lines || [], (l) => Math.max(0, (l.qty || 0) - (sent[l.id] || 0)) * (l.price || 0));
        const held = sum(safe(() => holdsFor(i.id), []), (h) => h.qty);
        const challans = (i.deliveries || []).length;
        const lastAt = challans ? Math.max(...i.deliveries.map((x) => x.at || 0)) : null;
        return {
          id: i.id, at: i.at, customer: nameOf(i), ordered: d.total, sent: d.sent, left: d.left, valueLeft: r2(valueLeft), held,
          challans, lastChallan: challans ? safe(() => challanNo(i, challans - 1), '') : '', lastAt, state: d.status === 'partial' ? 'Partly delivered' : 'Not delivered',
          days: ageOf(i, t), payment: STATUS[statusOf(i)], _href: invHref(i.id),
        };
      });
    const customers = [...groupBy(rows, (r) => r.customer)].map(([name, list]) => [name, sum(list, (r) => r.valueLeft)]).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const oldest = rows.reduce((m, r) => Math.max(m, r.days), 0);
    return {
      kpis: [
        { key: 'invoices', label: 'Invoices waiting', value: rows.length, format: 'int', good: 'down' },
        { key: 'partial', label: 'Partly delivered', value: rows.filter((r) => r.sent > 0).length, format: 'int', good: 'none' },
        { key: 'units', label: 'Units still to send', value: sum(rows, (r) => r.left), format: 'int', good: 'down', sub: `${sum(rows, (r) => r.held)} held on shelves` },
        { key: 'value', label: 'Value not delivered', value: sum(rows, (r) => r.valueLeft), format: 'money0', good: 'down' },
        { key: 'oldest', label: 'Longest wait', value: oldest, format: 'days', good: 'down' },
      ],
      chart: { type: 'hbar', labels: customers.map((c) => c[0]), series: [{ name: 'Value left to deliver', values: customers.map((c) => c[1]), tone: 'warning' }], format: 'money0' },
      table: {
        columns: [
          { key: 'id', label: 'Invoice' },
          { key: 'at', label: 'Date', format: 'date' },
          { key: 'customer', label: 'Customer' },
          { key: 'state', label: 'Delivery' },
          { key: 'ordered', label: 'Ordered', format: 'int', align: 'right', total: 'sum' },
          { key: 'sent', label: 'Sent', format: 'int', align: 'right', total: 'sum' },
          { key: 'left', label: 'Left', format: 'int', align: 'right', total: 'sum' },
          { key: 'held', label: 'Held', format: 'int', align: 'right', total: 'sum' },
          { key: 'valueLeft', label: 'Value left', format: 'money0', align: 'right', total: 'sum' },
          { key: 'challans', label: 'Challans', format: 'int', align: 'right', total: 'sum' },
          { key: 'lastChallan', label: 'Last challan' },
          { key: 'days', label: 'Days waiting', format: 'int', align: 'right' },
          { key: 'payment', label: 'Payment' },
        ],
        rows,
        sort: { key: 'days', dir: 'desc' },
      },
      notes: ['Held = pieces set aside on a shelf for the invoice (Stock holds). Value left is at the invoice price before VAT. Record a delivery from the invoice page.'],
    };
  },
};

// ---- credit usage -----------------------------------------------------------------------------------
const creditUsage = {
  id: 'credit-usage',
  group: 'wholesale',
  title: 'Credit limit usage',
  description: 'How much of each wholesale customer’s credit limit is used by what they owe, and who is over or near the limit.',
  icon: 'gauge',
  keywords: 'credit limit used over limit dues wholesale customer risk',
  filters: [],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ now }) {
    const t = now || Date.now();
    const invoices = allInvoices();
    const book = safe(() => getCustomers(), []).filter((c) => (c.types || []).includes('Wholesale') || c.creditLimit > 0);
    const rows = book.map((c) => {
      const phone = digits(c.phone);
      const open = invoices.filter((i) => phoneOf(i) === phone && i.due > 0);
      const used = sum(open, (i) => i.due);
      const limit = Number(c.creditLimit) || 0;
      const pct = limit ? used / limit : null;
      const oldest = open.length ? Math.max(...open.map((i) => ageOf(i, t))) : null;
      return {
        customer: c.name, phone, tier: (safe(() => tierOf(c), null) || {}).label || '', limit, used, pct, left: limit ? r2(Math.max(0, limit - used)) : null,
        flag: !limit ? (used ? 'No limit set' : '—') : used > limit ? 'Over by ' + fmt(used - limit, 'money0') : pct >= 0.8 ? 'Near the limit' : 'Within limit',
        advance: safe(() => creditOf(phone), 0), invoices: open.length, oldest, _over: limit && used > limit ? 1 : 0, _href: custHref(phone),
      };
    });
    const limit = sum(rows, (r) => r.limit), used = sum(rows, (r) => r.used);
    const over = rows.filter((r) => r._over);
    const near = rows.filter((r) => r.limit && !r._over && r.pct >= 0.8);
    const chartRows = rows.filter((r) => r.limit || r.used).sort((a, b) => (b.pct || 0) - (a.pct || 0)).slice(0, 10);
    return {
      kpis: [
        { key: 'limit', label: 'Credit given', value: limit, format: 'money0', good: 'none', sub: `${rows.filter((r) => r.limit).length} customers with a limit` },
        { key: 'used', label: 'Used (owed now)', value: used, format: 'money0', good: 'down' },
        { key: 'pct', label: 'Share used', value: rate(used, limit), format: 'pct', good: 'down' },
        { key: 'over', label: 'Over the limit', value: over.length, format: 'int', good: 'down', sub: over.length ? fmt(sum(over, (r) => r.used - r.limit), 'money0') + ' above' : 'Nobody' },
        { key: 'near', label: 'Near the limit', value: near.length, format: 'int', good: 'down', sub: '80% or more used' },
      ],
      chart: {
        type: 'hbar', labels: chartRows.map((r) => r.customer), format: 'money0',
        series: [{ name: 'Used', values: chartRows.map((r) => (r.limit ? Math.min(r.used, r.limit) : r.used)), tone: 'warning' }, { name: 'Over the limit', values: chartRows.map((r) => (r.limit ? Math.max(0, r.used - r.limit) : 0)), tone: 'danger' }, { name: 'Left to use', values: chartRows.map((r) => r.left || 0), tone: 'success' }],
      },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'tier', label: 'Price list' },
          { key: 'limit', label: 'Credit limit', format: 'money0', align: 'right', total: 'sum' },
          { key: 'used', label: 'Used', format: 'money0', align: 'right', total: 'sum' },
          { key: 'pct', label: 'Used %', format: 'pct', align: 'right', total: rate(used, limit) },
          { key: 'left', label: 'Left to use', format: 'money0', align: 'right', total: 'sum' },
          { key: 'flag', label: 'Status' },
          { key: 'invoices', label: 'Unpaid invoices', format: 'int', align: 'right', total: 'sum' },
          { key: 'oldest', label: 'Oldest (days)', format: 'int', align: 'right' },
          { key: 'advance', label: 'Advance held', format: 'money0', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'pct', dir: 'desc' },
      },
      notes: ['Used = what the customer owes on all their invoices now. Set or change a limit on the customer’s page. Advance held is money they paid ahead, kept for their next invoice.'],
    };
  },
};

// ---- wholesale dues ageing ---------------------------------------------------------------------------
const BUCKETS = [['b30', '0–30 days', 0, 30], ['b60', '31–60 days', 31, 60], ['b90', '61–90 days', 61, 90], ['b90p', 'Over 90 days', 91, Infinity]];
const duesAgeing = {
  id: 'wholesale-dues-ageing',
  group: 'wholesale',
  title: 'Wholesale dues by age',
  description: 'What each wholesale customer owes, split by how old the invoices are, so you know whom to chase first.',
  icon: 'hourglass',
  keywords: 'ageing aging dues receivable overdue collection wholesale 30 60 90',
  filters: [],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ now }) {
    const t = now || Date.now();
    const find = bookFinder();
    const open = wholesaleInvoices().filter((i) => i.due > 0);
    const rows = [...groupBy(open, (i) => phoneOf(i) || nameOf(i))].map(([key, list]) => {
      const row = { customer: nameOf(list[0]), phone: phoneOf(list[0]), invoices: list.length, total: sum(list, (i) => i.due), oldest: Math.max(...list.map((i) => ageOf(i, t))) };
      BUCKETS.forEach(([k, , lo, hi]) => { row[k] = sum(list.filter((i) => { const a = ageOf(i, t); return a >= lo && a <= hi; }), (i) => i.due); });
      const c = find(row.phone, row.customer);
      row.limit = c ? Number(c.creditLimit) || 0 : 0;
      row._href = custHref(row.phone || key);
      return row;
    });
    const total = sum(rows, (r) => r.total);
    const T = (k) => sum(rows, (r) => r[k]);
    const chartRows = rows.slice().sort((a, b) => b.total - a.total).slice(0, 10);
    const tones = ['success', 'info', 'warning', 'danger'];
    return {
      kpis: [
        { key: 'total', label: 'Wholesale dues', value: total, format: 'money0', good: 'down', sub: `${open.length} invoices · ${rows.length} customers` },
        ...BUCKETS.map(([k, label]) => ({ key: k, label, value: T(k), format: 'money0', good: k === 'b30' ? 'none' : 'down', sub: fmt(rate(T(k), total), 'pct') + ' of dues' })),
      ],
      chart: { type: 'hbar', labels: chartRows.map((r) => r.customer), format: 'money0', series: BUCKETS.map(([k, label], i) => ({ name: label, values: chartRows.map((r) => r[k]), tone: tones[i] })) },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'invoices', label: 'Invoices', format: 'int', align: 'right', total: 'sum' },
          ...BUCKETS.map(([k, label]) => ({ key: k, label, format: 'money0', align: 'right', total: 'sum' })),
          { key: 'total', label: 'Total due', format: 'money0', align: 'right', total: 'sum' },
          { key: 'oldest', label: 'Oldest (days)', format: 'int', align: 'right' },
          { key: 'limit', label: 'Credit limit', format: 'money0', align: 'right' },
        ],
        rows,
        sort: { key: 'total', dir: 'desc' },
      },
      notes: ['Age counts from the invoice date. Send reminders from Finance › Dues or the customer’s page.'],
    };
  },
};

export default [byCustomer, invoiceStatus, pendingDeliveries, creditUsage, duesAgeing];
