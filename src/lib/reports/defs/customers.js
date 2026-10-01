// Reports · Customers & loyalty group. See ../catalogue.js for the definition contract.
// A customer is a mobile number. Their purchases are joined by number across the sale lines
// (salesBook, when they exist), online orders, invoices (wholesale and counter sales made out to a
// customer); each purchase is counted once (by its order or invoice number). Loyalty members add
// their join date (they bought before) and their loyalty total (lifetime value, when higher). Customers' buying before September comes from salesBook.getCustomerHistory()
// (totals only, no lines). Walk-in sales without a number are not customers: where a table shows
// totals they are one line, "Walk-in sales".

import { getOrders, isCounterSale } from '../../orders';
import { getInvoices } from '../../invoices';
import { getCustomers } from '../../customers';
import { getMembers, getPointEntries, getWalletEntries, getReferralRecords, getLoyaltySettings, pointsLiability, walletLiability } from '../../loyalty';
import * as salesBook from '../../salesBook';
import { bucketsOf, sum, groupBy, fmt } from '../period';

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const rate = (a, b) => (b ? a / b : 0);
const DAY = 864e5;
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const MOBILE = /^01[3-9]\d{8}$/;
const CHANNELS = ['Online', 'Retail', 'Wholesale'];
const custHref = (phone) => '/customer-statement?phone=' + encodeURIComponent(phone);

// ---- facts ------------------------------------------------------------------------------------------
const saleLines = () => (typeof salesBook.getSaleLines === 'function' ? safe(() => salesBook.getSaleLines(), []) : []).filter(Boolean);
/** Buying before the sales book starts: [{ name, phone, type, address, firstBoughtAt, lastBoughtAt, orders, spent }]. */
const history = () => (typeof salesBook.getCustomerHistory === 'function' ? safe(() => salesBook.getCustomerHistory(), []) : []).filter((h) => h && MOBILE.test(digits(h.phone)));
/** Each earlier-history customer as one purchase on their last day (orders and spend are totals). */
const historyEvents = () => history().map((h) => ({ id: 'H-' + digits(h.phone), at: h.lastBoughtAt, phone: digits(h.phone), channel: CHANNELS.includes(h.type) ? h.type : 'Online', amount: Number(h.spent) || 0, orders: Number(h.orders) || 1, hist: true }));
/** Sales without a mobile number (walk-ins): [{ id, at, channel, amount }]. */
const walkIns = () => [...groupBy(saleLines().filter((l) => !MOBILE.test(digits(l.customer && l.customer.phone))), (l) => l.saleId || l.id)]
  .map(([id, list]) => ({ id, at: list[0].at, channel: list[0].channel, amount: sum(list, (x) => x.revenue) }));
const WALK_IN = 'Walk-in sales';
/** Every purchase with a mobile number: [{ id, at, phone, name, channel, amount, zone, address }], oldest first. */
function purchases() {
  const out = new Map();
  const add = (e) => {
    const phone = digits(e.phone);
    if (!e.id || out.has(e.id) || !MOBILE.test(phone) || typeof e.at !== 'number') return;
    out.set(e.id, { zone: '', address: '', ...e, phone, channel: CHANNELS.includes(e.channel) ? e.channel : 'Online', amount: r2(e.amount) });
  };
  [...groupBy(saleLines().filter((l) => l.customer && l.customer.phone), (l) => l.saleId || l.id)].forEach(([id, list]) => {
    const l = list[0];
    add({ id, at: l.at, phone: l.customer.phone, name: l.customer.name, channel: l.channel, amount: sum(list, (x) => x.revenue), zone: l.zone || '', address: l.customer.address || '' });
  });
  safe(() => getOrders(), []).filter((o) => !safe(() => isCounterSale(o), true) && o.statusKey !== 'cancelled').forEach((o) => {
    add({ id: o.id, at: o.at, phone: o.phone, name: o.customer, channel: 'Online', amount: Number(o.subtotal) || 0, zone: o.zone || '', address: o.address || '' });
  });
  safe(() => getInvoices(), []).forEach((i) => {
    const t = i.totals || {};
    add({ id: i.id, at: i.at, phone: i.customer && i.customer.phone, name: i.customer && i.customer.name, channel: i.wholesale ? 'Wholesale' : 'Retail', amount: (t.total || 0) - (t.tax || 0) });
  });
  return [...out.values()].sort((a, b) => a.at - b.at);
}

/** Everyone known: the customer book, loyalty members and anyone who bought. phone → customer. */
function people(list = purchases()) {
  const book = safe(() => getCustomers(), []);
  const members = safe(() => getMembers(), []);
  const map = new Map();
  const get = (phone) => {
    if (!map.has(phone)) map.set(phone, { phone, name: '', address: '', types: new Set(), member: null, events: [], first: null, last: null });
    return map.get(phone);
  };
  book.forEach((c) => { const p = digits(c.phone); if (!MOBILE.test(p)) return; const x = get(p); x.name = c.name || x.name; x.address = c.address || ''; (c.types || []).forEach((t) => x.types.add(t)); x.book = c; });
  members.forEach((m) => { const p = digits(m.phone); if (!MOBILE.test(p)) return; const x = get(p); x.member = m; if (!x.name) x.name = m.name; });
  history().forEach((h) => { const x = get(digits(h.phone)); x.hist = h; if (!x.name) x.name = h.name; if (!x.address && h.address) x.address = h.address; if (CHANNELS.includes(h.type)) x.types.add(h.type); });
  list.forEach((e) => {
    const x = get(e.phone);
    x.events.push(e);
    x.types.add(e.channel);
    if (!x.name && e.name) x.name = e.name;
    if (!x.address && e.address) x.address = e.address;
    if (e.zone && !x.zone && ['Inside Dhaka', 'Sub-Dhaka', 'Outside Dhaka'].includes(e.zone)) x.zone = e.zone;
  });
  map.forEach((x) => {
    const at = x.events.map((e) => e.at);
    const m = x.member, h = x.hist;
    x.firstEvent = at.length ? Math.min(...at) : null;
    // bought before: earlier history, or a loyalty member who joined before their first purchase here
    x.first = [x.firstEvent, m && m.joined, h && h.firstBoughtAt].filter((t) => typeof t === 'number' && t > 0).reduce((a, t) => Math.min(a, t), Infinity);
    if (x.first === Infinity) x.first = null;
    x.last = [...at, h && h.lastBoughtAt].filter((t) => typeof t === 'number' && t > 0).reduce((a, t) => Math.max(a, t), 0) || null;
    x.histOrders = h ? Number(h.orders) || 0 : 0;
    x.spent = r2(sum(x.events, (e) => e.amount) + (h ? Number(h.spent) || 0 : 0));
    x.value = Math.max(x.spent, (m && m.bought) || 0);
    x.count = x.events.length + x.histOrders || (m && m.bought > 0 ? 1 : 0);
    x.name = x.name || 'Customer · ' + x.phone;
    x.type = CHANNELS.filter((t) => x.types.has(t)).join(', ') || '—';
  });
  return map;
}
const isType = (x, type) => !type || x.types.has(type);
/** Walk-in sales in [from, to) as one table line (not a customer), or null when there are none. */
function walkInLine(from, to, type, make) {
  const list = walkIns().filter((w) => w.at >= from && w.at < to && (!type || w.channel === type));
  return list.length ? { ...make(list.length, sum(list, (w) => w.amount)), _walkin: true } : null;
}

// ---- new vs returning --------------------------------------------------------------------------------
const newVsReturning = {
  id: 'new-vs-returning',
  group: 'customers',
  title: 'New and returning customers',
  description: 'How many customers bought for the first time and how many came back, and how much of your sales returning customers bring.',
  icon: 'user-plus',
  keywords: 'new returning repeat rate retention first purchase customers',
  filters: ['customerType'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const all = purchases();
    const map = people(all);
    const inPeriod = all.filter((e) => e.at >= from && e.at < to && (!filters.customerType || e.channel === filters.customerType));
    const rows = [...groupBy(inPeriod, (e) => e.phone)].map(([phone, list]) => {
      const x = map.get(phone);
      const isNew = x.first == null || x.first >= from;
      const earlier = x.hist && x.hist.firstBoughtAt < to ? x.histOrders : x.member && x.member.joined && x.firstEvent && x.member.joined < x.firstEvent ? 1 : 0;
      const before = x.events.filter((e) => e.at < to).length + earlier;
      return {
        customer: x.name, phone, type: x.type, first: x.first, status: isNew ? 'New' : 'Returning', orders: list.length,
        spent: sum(list, (e) => e.amount), last: Math.max(...list.map((e) => e.at)), _repeat: before >= 2, _href: custHref(phone),
      };
    });
    const fresh = rows.filter((r) => r.status === 'New');
    const back = rows.filter((r) => r.status === 'Returning');
    const total = sum(rows, (r) => r.spent);
    const walk = walkInLine(from, to, filters.customerType, (n, amount) => ({ customer: WALK_IN, phone: '', type: 'No mobile number', status: '—', first: null, orders: n, spent: amount, last: null }));
    const { buckets, keyOf } = bucketsOf(from, to);
    const newS = buckets.map(() => new Set()), retS = buckets.map(() => new Set());
    inPeriod.forEach((e) => {
      const i = buckets.findIndex((b) => b.key === keyOf(e.at));
      if (i < 0) return;
      const x = map.get(e.phone);
      (x.first != null && x.first < buckets[i].from ? retS : newS)[i].add(e.phone);
    });
    return {
      kpis: [
        { key: 'customers', label: 'Customers who bought', value: rows.length, format: 'int', good: 'up' },
        { key: 'new', label: 'New customers', value: fresh.length, format: 'int', good: 'up' },
        { key: 'returning', label: 'Returning customers', value: back.length, format: 'int', good: 'up' },
        { key: 'repeat', label: 'Repeat rate', value: rate(rows.filter((r) => r._repeat).length, rows.length), format: 'pct', good: 'up', sub: 'Bought more than once' },
        { key: 'share', label: 'Sales from returning', value: rate(sum(back, (r) => r.spent), total), format: 'pct', good: 'up' },
      ],
      chart: { type: 'stacked', labels: buckets.map((b) => b.label), format: 'int', series: [{ name: 'New', values: newS.map((s) => s.size), tone: 'success' }, { name: 'Returning', values: retS.map((s) => s.size), tone: 'primary' }] },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'type', label: 'Buys' },
          { key: 'status', label: 'New or returning' },
          { key: 'first', label: 'First purchase', format: 'date' },
          { key: 'orders', label: 'Purchases', format: 'int', align: 'right', total: 'sum' },
          { key: 'spent', label: 'Spent', format: 'money0', align: 'right', total: 'sum' },
          { key: 'last', label: 'Last purchase', format: 'date' },
        ],
        rows: walk ? [...rows, walk] : rows,
        sort: { key: 'spent', dir: 'desc' },
      },
      notes: [
        'Customers are matched by mobile number across sales, online orders and invoices. Walk-in sales without a number are not counted as customers; they show as one line so the totals are complete.',
        'New = first purchase in the period; anyone who bought before it (earlier history, or a loyalty member who joined earlier) is returning. Repeat rate = customers who have bought more than once. Spent is before VAT and delivery.',
      ],
    };
  },
};

// ---- top customers (RFM) --------------------------------------------------------------------------------
const SEGMENTS = ['Champions', 'Loyal', 'New', 'Needs attention', 'At risk', 'Lost'];
const segmentOf = (days, f, top) => (days <= 30 && (f >= 3 || top) ? 'Champions' : days <= 60 && f >= 2 ? 'Loyal' : days <= 30 ? 'New' : days <= 60 ? 'Needs attention' : days <= 120 ? 'At risk' : 'Lost');
const topCustomers = {
  id: 'top-customers',
  group: 'customers',
  title: 'Top customers and segments',
  description: 'Your best customers by how recently, how often and how much they bought, grouped as champions, loyal, at risk and lost.',
  icon: 'crown',
  keywords: 'rfm recency frequency monetary best customers champions loyal at risk lost segment vip',
  filters: ['customerType'],
  defaultPeriod: 'year',
  compute({ from, to, now, filters }) {
    const all = purchases();
    const map = people(all);
    const end = Math.min(to, now || to);
    const list = [...all, ...historyEvents()].filter((e) => e.at >= from && e.at < to && (!filters.customerType || e.channel === filters.customerType));
    const base = [...groupBy(list, (e) => e.phone)].map(([phone, mine]) => ({ phone, x: map.get(phone), f: sum(mine, (e) => e.orders || 1), m: sum(mine, (e) => e.amount), last: Math.max(...mine.map((e) => e.at)) }));
    const sorted = base.map((b) => b.m).sort((a, b) => a - b);
    const p75 = sorted.length ? sorted[Math.floor(sorted.length * 0.75)] : 0;
    const rows = base.map((b) => {
      const days = Math.max(0, Math.floor((end - b.last) / DAY));
      return {
        customer: b.x.name, phone: b.phone, type: b.x.type, recency: days, frequency: b.f, monetary: b.m, aov: b.f ? b.m / b.f : 0,
        segment: segmentOf(days, b.f, b.m >= p75 && b.m > 0), last: b.last, lifetime: b.x.value, points: b.x.member ? b.x.member.points : null, _href: custHref(b.phone),
      };
    });
    const walk = walkInLine(from, to, filters.customerType, (n, amount) => ({ customer: WALK_IN, phone: '', type: 'No mobile number', segment: '—', recency: null, frequency: n, monetary: amount, aov: amount / n, last: null, lifetime: null, points: null }));
    const total = sum(rows, (r) => r.monetary);
    const seg = (s) => rows.filter((r) => r.segment === s);
    const top10 = rows.slice().sort((a, b) => b.monetary - a.monetary).slice(0, 10);
    const risky = [...seg('At risk'), ...seg('Lost')];
    const shown = SEGMENTS.filter((s) => seg(s).length);
    return {
      kpis: [
        { key: 'customers', label: 'Customers', value: rows.length, format: 'int', good: 'up' },
        { key: 'champions', label: 'Champions', value: seg('Champions').length, format: 'int', good: 'up', sub: `${fmt(rate(sum(seg('Champions'), (r) => r.monetary), total), 'pct')} of sales` },
        { key: 'loyal', label: 'Loyal', value: seg('Loyal').length, format: 'int', good: 'up' },
        { key: 'risk', label: 'At risk or lost', value: risky.length, format: 'int', good: 'down', sub: fmt(sum(risky, (r) => r.monetary), 'money0') + ' spent before' },
        { key: 'top10', label: 'Top 10 share of sales', value: rate(sum(top10, (r) => r.monetary), total), format: 'pct', good: 'none' },
      ],
      chart: { type: 'donut', labels: shown, series: [{ name: 'Sales', values: shown.map((s) => sum(seg(s), (r) => r.monetary)) }], format: 'money0' },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'type', label: 'Buys' },
          { key: 'segment', label: 'Segment' },
          { key: 'recency', label: 'Days since last purchase', format: 'int', align: 'right' },
          { key: 'frequency', label: 'Purchases', format: 'int', align: 'right', total: 'sum' },
          { key: 'monetary', label: 'Spent', format: 'money0', align: 'right', total: 'sum' },
          { key: 'aov', label: 'Average purchase', format: 'money0', align: 'right' },
          { key: 'last', label: 'Last purchase', format: 'date' },
          { key: 'lifetime', label: 'Lifetime value', format: 'money0', align: 'right' },
          { key: 'points', label: 'Points', format: 'int', align: 'right' },
        ],
        rows: walk ? [...rows, walk] : rows,
        sort: { key: 'monetary', dir: 'desc' },
      },
      notes: [
        'Purchases and spend are counted in the period (earlier buying with no sales lines counts on the customer’s last purchase day); days since the last purchase count to the end of the period. Spent is before VAT and delivery. Walk-in sales are one line, not a customer.',
        'Champions: bought in the last 30 days, 3+ times or among the top quarter by spend · Loyal: 2+ purchases, last within 60 days · New: one purchase in 30 days · Needs attention: 31–60 days · At risk: 61–120 days · Lost: over 120 days.',
      ],
    };
  },
};

// ---- inactive customers ----------------------------------------------------------------------------------
const INACTIVE = [['30–59 days', 30, 59], ['60–89 days', 60, 89], ['90 days or more', 90, Infinity]];
const inactiveCustomers = {
  id: 'inactive-customers',
  group: 'customers',
  title: 'Inactive customers (win-back list)',
  description: 'Customers who have not bought for 30, 60 or 90+ days, with what they spent before — who to call or send an offer to.',
  icon: 'user-x',
  keywords: 'inactive lapsed win back churn sleeping no purchase 30 60 90 days reactivate',
  filters: ['customerType'],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ now, filters }) {
    const t = now || Date.now();
    const rows = [];
    people().forEach((x) => {
      if (!x.last || !isType(x, filters.customerType)) return;
      const days = Math.floor((t - x.last) / DAY);
      const band = INACTIVE.find(([, lo, hi]) => days >= lo && days <= hi);
      if (!band) return;
      rows.push({
        customer: x.name, phone: x.phone, type: x.type, last: x.last, days, band: band[0], purchases: x.count, value: x.value,
        aov: x.count ? x.value / x.count : 0, points: x.member ? x.member.points : null, wallet: x.member ? x.member.wallet : null, _href: custHref(x.phone),
      });
    });
    const by = (b) => rows.filter((r) => r.band === b);
    return {
      kpis: [
        { key: 'inactive', label: 'Inactive customers', value: rows.length, format: 'int', good: 'down' },
        ...INACTIVE.map(([b], i) => ({ key: 'b' + i, label: b, value: by(b).length, format: 'int', good: 'down' })),
        { key: 'value', label: 'They spent before', value: sum(rows, (r) => r.value), format: 'money0', good: 'none', sub: 'Lifetime value' },
      ],
      chart: { type: 'donut', labels: INACTIVE.map(([b]) => b), series: [{ name: 'Customers', values: INACTIVE.map(([b]) => by(b).length) }], format: 'int' },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'type', label: 'Buys' },
          { key: 'last', label: 'Last purchase', format: 'date' },
          { key: 'days', label: 'Days since', format: 'int', align: 'right' },
          { key: 'band', label: 'Inactive for' },
          { key: 'purchases', label: 'Purchases', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Lifetime value', format: 'money0', align: 'right', total: 'sum' },
          { key: 'aov', label: 'Average purchase', format: 'money0', align: 'right' },
          { key: 'points', label: 'Points', format: 'int', align: 'right', total: 'sum' },
          { key: 'wallet', label: 'Wallet', format: 'money0', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'As of today: customers with a mobile number whose last purchase was 30 days ago or more. Lifetime value is what they spent here, or their loyalty total when it is higher (purchases from before).',
        'Points and wallet money are a good reason to call: remind them what they can still use.',
      ],
    };
  },
};

// ---- customer value -------------------------------------------------------------------------------------
const customerValue = {
  id: 'customer-value',
  group: 'customers',
  title: 'Customer lifetime value',
  description: 'What a customer is worth over time and per purchase, for online, retail and wholesale buyers.',
  icon: 'gem',
  keywords: 'lifetime value ltv clv aov average order value per customer channel',
  filters: ['customerType'],
  snapshot: true,
  defaultPeriod: 'month',
  compute({ filters }) {
    const all = purchases();
    const map = people(all);
    const rows = [];
    map.forEach((x) => {
      if (!x.count || !isType(x, filters.customerType)) return;
      const byCh = CHANNELS.map((c) => [c, sum(x.events.filter((e) => e.channel === c), (e) => e.amount) + (x.hist && x.hist.type === c ? Number(x.hist.spent) || 0 : 0)]).sort((a, b) => b[1] - a[1]);
      rows.push({
        customer: x.name, phone: x.phone, type: x.type, main: byCh[0][1] ? byCh[0][0] : (x.type.split(', ')[0] || '—'), purchases: x.count, value: x.value,
        aov: x.count ? x.value / x.count : 0, first: x.first, last: x.last, months: x.first && x.last ? Math.max(1, Math.round((x.last - x.first) / (30 * DAY))) : 1, _href: custHref(x.phone),
      });
    });
    const everything = [...all, ...historyEvents()];
    const ch = CHANNELS.map((c) => {
      const ev = everything.filter((e) => e.channel === c);
      const custs = new Set(ev.map((e) => e.phone)).size;
      const amt = sum(ev, (e) => e.amount), n = sum(ev, (e) => e.orders || 1);
      return { c, custs, aov: n ? amt / n : 0, ltv: custs ? amt / custs : 0 };
    });
    const walk = walkInLine(-Infinity, Infinity, filters.customerType, (n, amount) => ({ customer: WALK_IN, phone: '', type: 'No mobile number', main: 'Retail', purchases: n, value: amount, aov: amount / n, first: null, last: null }));
    const value = sum(rows, (r) => r.value), count = sum(rows, (r) => r.purchases);
    const best = ch.slice().sort((a, b) => b.ltv - a.ltv)[0];
    return {
      kpis: [
        { key: 'customers', label: 'Customers', value: rows.length, format: 'int', good: 'up' },
        { key: 'ltv', label: 'Average lifetime value', value: rows.length ? value / rows.length : 0, format: 'money0', good: 'up' },
        { key: 'aov', label: 'Average purchase', value: count ? value / count : 0, format: 'money0', good: 'up' },
        { key: 'freq', label: 'Purchases per customer', value: rate(count, rows.length), format: 'num', good: 'up' },
        { key: 'best', label: 'Most valuable buyers', value: best && best.ltv ? best.c : '—', format: 'text', good: 'none', sub: best && best.ltv ? fmt(best.ltv, 'money0') + ' per customer' : '' },
      ],
      chart: { type: 'bar', labels: CHANNELS, format: 'money0', series: [{ name: 'Value per customer', values: ch.map((x) => x.ltv), tone: 'primary' }, { name: 'Average purchase', values: ch.map((x) => x.aov), tone: 'info' }] },
      table: {
        columns: [
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'type', label: 'Buys' },
          { key: 'main', label: 'Main channel' },
          { key: 'purchases', label: 'Purchases', format: 'int', align: 'right', total: 'sum' },
          { key: 'value', label: 'Lifetime value', format: 'money0', align: 'right', total: 'sum' },
          { key: 'aov', label: 'Average purchase', format: 'money0', align: 'right' },
          { key: 'first', label: 'Customer since', format: 'date' },
          { key: 'last', label: 'Last purchase', format: 'date' },
        ],
        rows: walk ? [...rows, walk] : rows,
        sort: { key: 'value', dir: 'desc' },
      },
      notes: [
        'Everything bought to date, before VAT and delivery, matched by mobile number, including buying before September (totals only). Lifetime value uses the loyalty total when it is higher. Walk-in sales are one line, not a customer.',
        'The chart, per channel: value per customer = sales ÷ customers who bought in that channel.',
      ],
    };
  },
};

// ---- customers by area -----------------------------------------------------------------------------------
const KNOWN = ['Uttara', 'Mirpur', 'Dhanmondi', 'Mohammadpur', 'Banani', 'Gulshan', 'Badda', 'Rampura', 'Motijheel', 'Tejgaon', 'Kalabagan', 'Bashundhara', 'Khilgaon', 'Jatrabari', 'Lalbagh', 'Farmgate', 'Mohakhali', 'Savar', 'Ashulia', 'Tongi', 'Keraniganj', 'Narayanganj', 'Gazipur'];
const SUB = ['Savar', 'Ashulia', 'Tongi', 'Keraniganj', 'Narayanganj', 'Gazipur', 'Dhamrai'];
/** { area, city, zone } from an address like "House 9, Road 4, Dhanmondi, Dhaka 1205". */
export function placeOf(address, zone) {
  const parts = String(address || '').split(',').map((s) => s.replace(/\b\d{4}\b/g, '').trim()).filter(Boolean);
  const Z = ['Inside Dhaka', 'Sub-Dhaka', 'Outside Dhaka'];
  if (!parts.length) return Z.includes(zone) ? { area: zone + ' (no address)', city: '', zone } : { area: 'No address', city: '', zone: '' };
  const city = parts[parts.length - 1].replace(/-\d+$/, '').trim();
  const head = parts.slice(0, -1).join(', ');
  const known = KNOWN.map((k) => [k, head.search(new RegExp('\\b' + k + '\\b', 'i'))]).filter((x) => x[1] >= 0).sort((a, b) => a[1] - b[1]).map((x) => x[0])[0];
  const plain = parts.slice(0, -1).reverse().find((p) => !/^(house|road|flat|shop|holding|block|sector|plot|level|apt|lane)\b/i.test(p) && !/\d/.test(p.slice(0, 3)) && !/road$/i.test(p));
  const area = (known || plain || city).replace(/-\d+$/, '').replace(/\s+R\/A$/i, '');
  const z = Z.includes(zone) ? zone : SUB.includes(area) || SUB.includes(city) ? 'Sub-Dhaka' : /dhaka/i.test(city) ? 'Inside Dhaka' : 'Outside Dhaka';
  return { area, city: city === area ? '' : city, zone: z };
}
const customersByArea = {
  id: 'customers-by-area',
  group: 'customers',
  title: 'Customers by area',
  description: 'Where your customers live: customers, purchases and sales per area, inside Dhaka, sub-Dhaka and outside.',
  icon: 'map',
  keywords: 'area location city zone dhaka district address map customers',
  filters: ['zone', 'customerType'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const all = purchases();
    const map = people(all);
    const list = all.filter((e) => e.at >= from && e.at < to && (!filters.customerType || e.channel === filters.customerType));
    const placeCache = {};
    const placeFor = (x) => placeCache[x.phone] || (placeCache[x.phone] = placeOf(x.address, x.zone));
    const withPlace = list.map((e) => ({ e, x: map.get(e.phone), pl: placeFor(map.get(e.phone)) })).filter(({ pl }) => !filters.zone || pl.zone === filters.zone);
    const rows = [...groupBy(withPlace, ({ pl }) => pl.area + '|' + pl.city)].map(([, l]) => {
      const pl = l[0].pl;
      const phones = new Set(l.map(({ e }) => e.phone));
      const amount = sum(l, ({ e }) => e.amount);
      return {
        area: pl.area, city: pl.city, zone: pl.zone || '—', customers: phones.size, newCustomers: [...phones].filter((p) => { const x = map.get(p); return x.first == null || x.first >= from; }).length,
        purchases: l.length, sales: amount, aov: l.length ? amount / l.length : 0,
      };
    });
    const customers = sum(rows, (r) => r.customers);
    const total = sum(rows, (r) => r.sales);
    const top = rows.slice().sort((a, b) => b.sales - a.sales);
    const dhaka = sum(rows.filter((r) => r.zone === 'Inside Dhaka'), (r) => r.customers);
    const walk = filters.zone ? null : walkInLine(from, to, filters.customerType, (n, amount) => ({ area: WALK_IN, city: '', zone: 'No mobile number', customers: null, newCustomers: null, purchases: n, sales: amount, aov: amount / n }));
    const allSales = total + (walk ? walk.sales : 0), allBuys = withPlace.length + (walk ? walk.purchases : 0);
    return {
      kpis: [
        { key: 'areas', label: 'Areas', value: rows.length, format: 'int', good: 'up' },
        { key: 'customers', label: 'Customers', value: customers, format: 'int', good: 'up' },
        { key: 'dhaka', label: 'Inside Dhaka', value: rate(dhaka, customers), format: 'pct', good: 'none', sub: 'of customers' },
        { key: 'top', label: 'Top area', value: top[0] ? top[0].area : '—', format: 'text', good: 'none', sub: top[0] ? fmt(rate(top[0].sales, total), 'pct') + ' of sales' : '' },
      ],
      chart: { type: 'hbar', labels: top.slice(0, 10).map((r) => r.area + (r.city ? ', ' + r.city : '')), series: [{ name: 'Sales', values: top.slice(0, 10).map((r) => r.sales), tone: 'primary' }], format: 'money0' },
      table: {
        columns: [
          { key: 'area', label: 'Area' },
          { key: 'city', label: 'City' },
          { key: 'zone', label: 'Delivery zone' },
          { key: 'customers', label: 'Customers', format: 'int', align: 'right', total: 'sum' },
          { key: 'newCustomers', label: 'New', format: 'int', align: 'right', total: 'sum' },
          { key: 'purchases', label: 'Purchases', format: 'int', align: 'right', total: 'sum' },
          { key: 'sales', label: 'Sales', format: 'money0', align: 'right', total: 'sum' },
          { key: 'aov', label: 'Average purchase', format: 'money0', align: 'right', total: allBuys ? allSales / allBuys : null },
        ],
        rows: walk ? [...rows, walk] : rows,
        sort: { key: 'sales', dir: 'desc' },
      },
      notes: ['The area is read from the customer’s address (customer book, else the delivery address on their orders); the delivery zone of an online order wins when it has one. Customers are people with a mobile number; walk-in sales are one line so the sales total is complete.'],
    };
  },
};

// ---- loyalty summary -------------------------------------------------------------------------------------
const POINT_KIND = { earn: 'Earned on purchases', welcome: 'Welcome gift', birthday: 'Birthday gift', referral: 'Invite a friend', adjust: 'Given or taken by the shop', redeem: 'Used', expire: 'Expired', return: 'Taken back on returns' };
const WALLET_LABEL = { 'top-up': 'Top-ups', spend: 'Paid for orders', refund: 'Paid back to customers', reward: 'Reward credit given', points: 'Changed from points', return: 'Return credit', adjust: 'Corrections' };
const loyaltySummary = {
  id: 'loyalty-summary',
  group: 'customers',
  title: 'Loyalty, wallet and referrals',
  description: 'Points given and used, what unused points and wallet money you owe customers, and what invite-a-friend rewards cost.',
  icon: 'award',
  keywords: 'loyalty points redeemed expired liability wallet top-up referral invite reward members',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const s = safe(() => getLoyaltySettings(), { pointValue: 0.5 });
    const pv = s.pointValue || 0;
    const inP = (t) => typeof t === 'number' && t >= from && t < to;
    const pts = safe(() => getPointEntries(), []).filter((e) => inP(e.at));
    const wal = safe(() => getWalletEntries(), []).filter((e) => inP(e.at));
    const refs = safe(() => getReferralRecords(), []);
    const liab = safe(() => pointsLiability(), { points: 0, value: 0, members: 0 });
    const wl = safe(() => walletLiability(), { total: 0, wallets: 0, advances: 0 });
    const rows = [];
    Object.entries(POINT_KIND).forEach(([kind, label]) => {
      const list = pts.filter((e) => e.kind === kind);
      if (!list.length) return;
      const points = list.reduce((a, e) => a + (e.points || 0), 0);
      const value = kind === 'redeem' ? -sum(list, (e) => (e.value != null ? e.value : -e.points * pv)) : r2(points * pv);
      rows.push({ section: 'Points', item: label, count: list.length, points, value, _href: '/loyalty' });
    });
    Object.entries(WALLET_LABEL).forEach(([kind, label]) => {
      const list = wal.filter((e) => e.kind === kind);
      if (!list.length) return;
      rows.push({ section: 'Wallet', item: label, count: list.length, points: null, value: sum(list, (e) => e.amount), _href: '/wallet' });
    });
    const joined = refs.filter((r) => inP(r.joinedAt));
    const given = refs.filter((r) => r.status === 'given' && inP(r.givenAt));
    const due = refs.filter((r) => r.status === 'due');
    if (joined.length) rows.push({ section: 'Referrals', item: 'Friends who joined', count: joined.length, points: null, value: sum(joined.filter((r) => r.order), (r) => r.order.amount), _href: '/referrals' });
    if (given.length) rows.push({ section: 'Referrals', item: 'Rewards given', count: given.length, points: null, value: -sum(given, (r) => r.reward), _href: '/referrals' });
    if (due.length) rows.push({ section: 'Referrals', item: 'Rewards still to give (now)', count: due.length, points: null, value: -sum(due, (r) => r.reward), _href: '/referrals' });
    const issued = pts.filter((e) => e.points > 0).reduce((a, e) => a + e.points, 0);
    const used = -pts.filter((e) => e.kind === 'redeem').reduce((a, e) => a + e.points, 0);
    const usedValue = sum(pts.filter((e) => e.kind === 'redeem'), (e) => (e.value != null ? e.value : -e.points * pv));
    const expired = -pts.filter((e) => e.kind === 'expire').reduce((a, e) => a + e.points, 0);
    const topUps = sum(wal.filter((e) => e.kind === 'top-up'), (e) => e.amount);
    const spends = -sum(wal.filter((e) => e.kind === 'spend'), (e) => e.amount);
    const { buckets, keyOf } = bucketsOf(from, to);
    const issuedS = buckets.map(() => 0), usedS = buckets.map(() => 0);
    pts.forEach((e) => {
      const i = buckets.findIndex((b) => b.key === keyOf(e.at));
      if (i < 0) return;
      if (e.points > 0) issuedS[i] += e.points; else if (e.kind === 'redeem') usedS[i] += -e.points;
    });
    return {
      kpis: [
        { key: 'issued', label: 'Points given', value: issued, format: 'int', good: 'none', sub: fmt(issued * pv, 'money0') + ' in discount' },
        { key: 'used', label: 'Points used', value: used, format: 'int', good: 'none', sub: fmt(usedValue, 'money0') + ' taken off bills' + (expired ? ` · ${expired} expired` : '') },
        { key: 'liability', label: 'Unused points owed now', value: liab.value, format: 'money0', good: 'none', sub: `${(liab.points || 0).toLocaleString('en-IN')} points · ${liab.members || 0} members` },
        { key: 'wallet', label: 'Wallet money held now', value: wl.wallets, format: 'money0', good: 'none', sub: `Top-ups ${fmt(topUps, 'money0')} · spent ${fmt(spends, 'money0')} in the period` },
        { key: 'referral', label: 'Referral rewards given', value: sum(given, (r) => r.reward), format: 'money0', good: 'down', sub: `${joined.length} friends joined` },
      ],
      chart: { type: 'bar', labels: buckets.map((b) => b.label), format: 'int', series: [{ name: 'Points given', values: issuedS, tone: 'success' }, { name: 'Points used', values: usedS, tone: 'warning' }] },
      table: {
        columns: [
          { key: 'section', label: 'Part' },
          { key: 'item', label: 'What' },
          { key: 'count', label: 'Entries', format: 'int', align: 'right' },
          { key: 'points', label: 'Points', format: 'int', align: 'right' },
          { key: 'value', label: 'Amount', format: 'money', align: 'right' },
        ],
        rows,
        sort: null,
      },
      notes: [
        `Points are valued at ${fmt(pv, 'money')} each (Loyalty settings); points used show the discount actually given. Unused points and wallet money are as of now, the rest is in the period.`,
        'Referral rewards count when given (into the wallet, as points or paid out). Wallet amounts: + money in, − money out.',
      ],
    };
  },
};

export default [newVsReturning, topCustomers, inactiveCustomers, customerValue, customersByArea, loyaltySummary];
