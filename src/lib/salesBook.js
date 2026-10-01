// salesBook — every sale by channel (Online, Retail, Wholesale), counted on the day it was made,
// with its cost of goods, so Accounts can show sales and profit per channel, and every sale line
// (getSaleLines) for the reports.
//   Retail     the counters' daily Z-reports (demo September, same figures as the ledger) and the
//              POS sales made in this browser
//   Online     demo September order days, and the orders made in this browser (not cancelled)
//   Wholesale  demo September invoices, and every invoice (the demo ones and those made at the POS)
//   Returns    from the return history, taken off the channel they came from
// Cost of goods: each line's product buying price (products.js cost, else purchase cost); days
// without lines use the channel's usual cost share (COST_SHARE) and are marked `est`.
//
// Sale lines (getSaleLines): one row per item sold, see the contract above getSaleLines().
// Demo September has no item lines of its own, so they are generated from the day totals, the same
// way every time (a fixed random seed per day): each Z-report day is split over the Dhanmondi and
// Mirpur counters, their cashiers and sales staff, and real catalogue products at their prices, and
// its Cash / bKash / Nagad split is the ledger's. Online days become orders (website, Facebook, phone,
// order link) with zones, couriers and times; the demo orders of orders.js are part of their day.
// These lines are marked `est: true`; their revenue adds up to each day's figure to the taka.
// Front end only.

import { LEDGER_SEED } from './ledgerSeed';
import { getInvoices } from './invoices';
import { getOrders, isCounterSale, demoOrders, holdPlaceOf, RTO_REASONS } from './orders';
import { getReturns } from './returns';
import { POS_KEYS, load, getCounters } from './posStore';
import { CATALOG, productBy } from './stock';
import { productCostOf } from './productCost';
import { loadVat, vatRateFor } from './vat';
import { CHANNELS } from './categories';

export { CHANNELS, productCostOf };
/** Usual cost of goods as a share of sales, for demo days without item lines. */
export const COST_SHARE = { Retail: 0.66, Online: 0.62, Wholesale: 0.81 };
const r2 = (n) => Math.round(n * 100) / 100;
const at = (d, h = 12) => new Date(2026, 8, d, h).getTime();

let seed = 11;
const rnd = (lo, hi) => { seed = (seed * 9301 + 49297) % 233280; return lo + (seed / 233280) * (hi - lo); };

// ---- demo September ----------------------------------------------------------------------------
// retail: one record per day from the counters' Z-report in the ledger (cash + bKash + Nagad)
const retailDays = {};
const METHOD_OF_ACCOUNT = { drawer: 'Cash', bkash: 'bKash', nagad: 'Nagad' };
LEDGER_SEED.filter((e) => e.kind === 'sale' && /^Z-/.test(e.ref || '')).forEach((e) => {
  const d = retailDays[e.ref] || (retailDays[e.ref] = { id: e.ref, at: new Date(e.at).setHours(21, 0, 0, 0), channel: 'Retail', ref: e.ref, party: 'Counter sales · Dhanmondi and Mirpur', revenue: 0, split: {} });
  d.revenue += e.amount;
  const m = METHOD_OF_ACCOUNT[e.account] || 'Cash';
  d.split[m] = (d.split[m] || 0) + e.amount;
});
const RETAIL_SEED = Object.values(retailDays).map(({ split, ...d }) => ({ ...d, orders: Math.round(d.revenue / 780), cost: r2(d.revenue * COST_SHARE.Retail), paid: d.revenue, due: 0, est: true }));
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

// ---- generated demo lines ------------------------------------------------------------------------
// A small seeded random generator per day, so the same day always gets the same sales.
function seeded(n) {
  let a = n >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pickW = (rand, list, weight) => {
  const total = list.reduce((a, x) => a + weight(x), 0);
  let r = rand() * total;
  for (const x of list) { r -= weight(x); if (r <= 0) return x; }
  return list[list.length - 1];
};
const pickMix = (rand, mix) => pickW(rand, Object.keys(mix), (k) => mix[k]);
const hourAt = (rand, day, hours) => { const h = Number(pickMix(rand, hours)); return new Date(2026, 8, day, h, Math.floor(rand() * 60), Math.floor(rand() * 60)).getTime(); };
const digits = (phone) => String(phone || '').replace(/\D/g, '').replace(/^88/, '');

/**
 * Fill a basket worth `target` from `pool`: items are added while they fit, so the basket is worth at
 * most the target. `final` keeps adding until nothing fits, then closes the gap with one more item and
 * a discount (so the target is met exactly); otherwise that happens only now and then (`discChance`).
 * Returns { lines: [{ p, qty, price }], disc, used }.
 */
function fillBasket(rand, target, pool, o) {
  const lines = [];
  let left = target;
  const cheapest = Math.min(...pool.map(o.price));
  for (let guard = 0; left >= cheapest && guard < 40; guard++) {
    if (!o.final && lines.length >= o.maxLines) break;
    const fits = pool.filter((p) => o.price(p) <= left);
    const p = lines.length >= o.maxLines ? fits.reduce((a, x) => (o.price(x) > o.price(a) ? x : a)) : pickW(rand, fits, o.weight);
    const price = o.price(p);
    const most = Math.floor(left / price);
    const qty = lines.length >= o.maxLines ? most : Math.min(most, o.qty(rand, p));
    const same = lines.find((l) => l.p === p);
    if (same) same.qty += qty; else lines.push({ p, qty, price });
    left -= qty * price;
  }
  let disc = 0;
  if (left > 0 && (o.final || rand() < (o.discChance || 0))) {
    const over = pool.filter((p) => o.price(p) >= left).sort((a, b) => o.price(a) - o.price(b))[0];
    const gross = lines.reduce((a, l) => a + l.qty * l.price, 0);
    if (over && (o.final || o.price(over) - left <= 0.15 * (gross + o.price(over)))) {
      const same = lines.find((l) => l.p === over);
      if (same) same.qty += 1; else lines.push({ p: over, qty: 1, price: o.price(over) });
      disc = o.price(over) - left;
      left = 0;
    }
  }
  return { lines, disc, used: target - left };
}
/** Spread a whole-taka discount over lines by their value (the rest on the biggest line). */
function spreadDisc(lines, disc) {
  const gross = lines.map((l) => l.qty * l.price);
  const total = gross.reduce((a, x) => a + x, 0);
  const share = gross.map((g) => (total ? Math.floor(disc * g / total) : 0));
  let rest = disc - share.reduce((a, x) => a + x, 0);
  const big = gross.indexOf(Math.max(...gross));
  share[big] += rest; rest = 0;
  return share;
}
/** Split `total` into `n` whole parts by random weights (an occasional big one). */
function splitTotal(rand, total, n, bigChance = 0.04, bigTimes = 6) {
  const w = Array.from({ length: n }, () => (0.35 + rand() * 1.3) * (rand() < bigChance ? bigTimes : 1));
  const sw = w.reduce((a, x) => a + x, 0);
  const parts = w.map((x) => Math.floor(total * x / sw));
  parts[n - 1] += total - parts.reduce((a, x) => a + x, 0);
  return parts;
}
/** Make `count` baskets that use up `total` exactly (what one basket leaves is carried to the next). */
function basketsFor(rand, total, count, pool, o) {
  const out = [];
  let carry = 0;
  splitTotal(rand, total, Math.max(1, count), o.bigChance, o.bigTimes).forEach((part, i, all) => {
    const b = fillBasket(rand, part + carry, pool, { ...o, final: i === all.length - 1 });
    carry = part + carry - b.used;
    if (b.lines.length) out.push(b);
  });
  return out;
}

// what the demo uses: counters, staff, customers, product mixes
const BRANCHES = [
  { place: 'Dhanmondi branch', share: 0.6, counters: [{ name: 'Dhanmondi · Counter 1', share: 0.6, staff: ['Sadia Akter', 'Rakib Hasan'] }, { name: 'Dhanmondi · Counter 2', share: 0.4, staff: ['Rafi Ahmed', 'Sadia Akter'] }], sellers: ['Rafi Ahmed', 'Rakib Hasan', 'Kamrul Islam'] },
  { place: 'Mirpur branch', share: 0.4, counters: [{ name: 'Mirpur · Counter 1', share: 1, staff: ['Moumita Das', 'Nabila Rahman'] }], sellers: ['Arif Rahman', 'Nabila Rahman'] },
];
const SUSPENDED_FROM = { 'Kamrul Islam': 9 };   // hr.js: suspended from 9 September
const RETAIL_PEOPLE = [
  ['Shirin Akter', '01811843300'], ['Mostafizur Rahman', '01711902244'], ['Tahmina Akter', '01712408813'], ['Abdul Karim', '01819552074'],
  ['Farzana Yasmin', '01915663021'], ['Rezaul Karim', '01673228410'], ['Sharmin Sultana', '01556774102'], ['Habibur Rahman', '01717330958'],
  ['Nasrin Akter', '01924551870'], ['Salma Begum', '01912330845'], ['Jahangir Alam', '01811290467'], ['Rumana Haque', '01734118802'],
  ['Kamal Hossain', '01675903318'], ['Mitu Rahman', '01628447190'], ['Shahidul Islam', '01913805562'], ['Laila Arjumand', '01552918406'],
];
const ONLINE_PEOPLE = {
  'Inside Dhaka': [['Nusrat Jahan', '01553336655'], ['Karim Saheb', '01718445120'], ['Rakib Uddin', '01677220945'], ['Imran Kabir', '01533889001'], ['Shirin Akter', '01811843300'], ['Tasnim Ahmed', '01716223419'], ['Fahim Chowdhury', '01819340276'], ['Anika Tabassum', '01911874503'], ['Sabrina Hossain', '01552407718'], ['Mehedi Hasan', '01679551283'], ['Nadia Islam', '01733920641'], ['Arafat Rahman', '01817736452'], ['Sumaiya Akter', '01923405817'], ['Tanjila Haque', '01644210395']],
  'Sub-Dhaka': [['Salma Begum', '01912330845'], ['Tanvir Hasan', '01822771190'], ['Jannat Ara', '01715609824'], ['Rubel Mia', '01831447265'], ['Sharif Uddin', '01676390142'], ['Afroza Khatun', '01558214906']],
  'Outside Dhaka': [['Rafiq Mia', '01676221904'], ['Mahmudul Hasan', '01815667723'], ['Sadia Afrin', '01966330012'], ['Farhana Islam', '01744556677'], ['Mostafizur Rahman', '01711902244'], ['Ziaul Haque', '01819203447'], ['Popy Akter', '01717584033'], ['Nazmul Huda', '01534668210'], ['Sajib Das', '01985220417'], ['Mithila Roy', '01767301985']],
};
const WHOLESALE_PHONES = { 'Rahim Traders': '01711458822', 'Jamal Telecom': '01819447210', 'Habib Telecom': '01715332908', 'Maa Fatema Mobile': '01912804551', 'Bismillah Mobile Corner': '01674210987', 'New Madina Telecom': '01845667302' };
const WHOLESALE_METHODS = ['Cash', 'bKash', 'Bank', 'Cash', 'Bank', 'bKash', 'Cash', 'Bank'];
const RETAIL_HOURS = { 10: 3, 11: 4, 12: 5, 13: 5, 14: 4, 15: 5, 16: 6, 17: 8, 18: 10, 19: 10, 20: 8, 21: 3 };
const ONLINE_HOURS = { 8: 1, 9: 2, 10: 3, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 5, 18: 5, 19: 6, 20: 8, 21: 8, 22: 6, 23: 3 };
const RETAIL_CAT = { Grocery: 5, 'Skin care': 3, Clothing: 2.2, Home: 1.4, Electronics: 0.8 };
const ONLINE_CAT = { 'Skin care': 3, Clothing: 3, Electronics: 1.5, Home: 1.2, Grocery: 1.2 };
export const ONLINE_SOURCES = { Website: 45, Facebook: 35, Phone: 15, 'Order link': 5 };
const ONLINE_ZONES = { 'Inside Dhaka': 55, 'Sub-Dhaka': 20, 'Outside Dhaka': 25 };
const ONLINE_METHODS = { COD: 60, Gateway: 30, bKash: 10 };
const SHIPPING = { 'Inside Dhaka': 70, 'Sub-Dhaka': 110, 'Outside Dhaka': 150 };
const COURIERS = { 'Inside Dhaka': { Pathao: 60, Carrybee: 25, RedX: 15 }, 'Sub-Dhaka': { Steadfast: 50, Pathao: 30, RedX: 20 }, 'Outside Dhaka': { Steadfast: 60, RedX: 30, Pathao: 10 } };
const DELIVERY_DAYS = { 'Inside Dhaka': [1, 2], 'Sub-Dhaka': [2, 3], 'Outside Dhaka': [2, 5] };
const RTO_RATE = { 'Inside Dhaka': 0.05, 'Sub-Dhaka': 0.08, 'Outside Dhaka': 0.14 };
const HOUR = 60 * 60 * 1000;
const CUTOFF = new Date(2026, 9, 1, 10, 0).getTime();   // the demo's "now": nothing happens after this

const unitCostMemo = {};
const unitCostFor = (p) => (unitCostMemo[p.sku] != null ? unitCostMemo[p.sku] : (unitCostMemo[p.sku] = productCostOf(p.sku) || productCostOf(p.name) || Math.round(p.price * 0.7)));
const lineOf = (base, i, l, disc) => {
  const unit = unitCostFor(l.p);
  return {
    ...base, id: base.saleId + ':' + i, sku: l.p.sku, name: l.p.name, cat: l.p.cat || 'Other', qty: l.qty, price: l.price,
    disc, revenue: l.qty * l.price - disc, vat: 0, cost: r2(unit * l.qty), est: true,
  };
};
const linesOfBasket = (base, b) => { const share = spreadDisc(b.lines, b.disc); return b.lines.map((l, i) => lineOf(base, i, l, share[i])); };

/** Demo retail lines: each Z-report day split over counters, cashiers and payment methods. */
function retailSeedLines(day) {
  const rec = RETAIL_SEED.find((r) => r.id === 'Z-' + String(day).padStart(2, '0') + '09');
  const split = retailDays[rec.id].split;
  const rand = seeded(1000 + day);
  const methods = Object.keys(split).filter((m) => split[m] > 0);
  // number of sales per method, in proportion to the money (at least one each)
  const counts = methods.map((m) => Math.max(1, Math.round(rec.orders * split[m] / rec.revenue)));
  const out = [];
  let n = 0;
  methods.forEach((m, mi) => {
    // where each sale happens: a branch, then one of its counters
    const where = Array.from({ length: counts[mi] }, () => { const b = pickW(rand, BRANCHES, (x) => x.share); return { b, c: pickW(rand, b.counters, (x) => x.share) }; });
    // baskets are filled per sale from the products that branch stocks
    let carry = 0;
    const parts = splitTotal(rand, split[m], counts[mi], 0.035, 8);
    parts.forEach((part, i) => {
      const { b, c } = where[i];
      const pool = CATALOG.filter((p) => p.sell !== 'wholesale' && ((p.on || {})[b.place] || 0) > 0);
      const bk = fillBasket(rand, part + carry, pool, { final: i === parts.length - 1, maxLines: 4, discChance: 0.12, price: (p) => p.price, weight: (p) => (RETAIL_CAT[p.cat] || 1) / (1 + p.price / 2000), qty: (r, p) => 1 + Math.floor(r() * (p.cat === 'Grocery' ? 3 : 2)) });
      carry = part + carry - bk.used;
      if (!bk.lines.length) return;
      n += 1;
      const cashier = day % 7 === (c.name.length % 7) ? c.staff[1] : c.staff[0];
      const sellers = b.sellers.filter((s) => s !== cashier && !(SUSPENDED_FROM[s] && day >= SUSPENDED_FROM[s]));
      const salesperson = rand() < 0.5 || !sellers.length ? cashier : sellers[Math.floor(rand() * sellers.length)];
      const who = rand() < 0.22 ? RETAIL_PEOPLE[Math.floor(rand() * RETAIL_PEOPLE.length)] : null;
      const base = {
        saleId: rec.id + '-' + String(n).padStart(3, '0'), at: hourAt(rand, day, RETAIL_HOURS), channel: 'Retail',
        place: b.place, counter: c.name, cashier, salesperson,
        customer: who ? { name: who[0], phone: who[1], type: 'Retail' } : { name: 'Walk-in customer', phone: '', type: 'Retail' },
        method: m, source: '', zone: '',
      };
      out.push(...linesOfBasket(base, bk));
    });
  });
  return out;
}

/** What happened to a demo online order after it was placed: status, courier and times. */
function orderLife(rand, placed, zone) {
  const times = { placed, approved: null, ready: null, shipped: null, delivered: null, returned: null, cancelled: null };
  const morning = (t) => { const d = new Date(t); const h = d.getHours(); if (h >= 22) d.setDate(d.getDate() + 1); if (h >= 22 || h < 9) d.setHours(9, 30 + Math.floor(rand() * 60), 0, 0); return d.getTime(); };
  const courier = pickMix(rand, COURIERS[zone]);
  times.approved = morning(placed + (0.3 + rand() * 3.5) * HOUR);
  times.ready = times.approved + (1 + rand() * 4) * HOUR;
  times.shipped = times.ready + (2 + rand() * 16) * HOUR;
  const [lo, hi] = DELIVERY_DAYS[zone];
  const days = lo + Math.floor(rand() * (hi - lo + 1));
  const rto = rand() < RTO_RATE[zone];
  const end = times.shipped + (days + (rto ? 1 : 0)) * 24 * HOUR - (rand() * 8) * HOUR;
  let status;
  if (times.ready > CUTOFF) { times.ready = null; times.shipped = null; status = 'Approved'; } else if (times.shipped > CUTOFF) { times.shipped = null; status = 'Ready to ship'; } else if (end > CUTOFF) status = 'Shipped';
  else if (rto) { times.returned = end; status = 'Returned'; } else { times.delivered = end; status = 'Delivered'; }
  Object.keys(times).forEach((k) => { if (times[k]) times[k] = Math.round(times[k]); });
  return { status, courier, times, rtoReason: status === 'Returned' ? RTO_REASONS[Math.floor(rand() * RTO_REASONS.length)] : '', deliveryDays: status === 'Delivered' ? r2((times.delivered - times.shipped) / (24 * HOUR)) : null };
}

/** Demo online lines and orders for one day; the demo orders of orders.js placed that day are part of it. */
function onlineSeedDay(day, demo) {
  const rec = ONLINE_SEED[day - 1];
  const rand = seeded(2000 + day);
  const mine = demo.filter((o) => new Date(o.at).getDate() === day && new Date(o.at).getMonth() === 8 && !isCounterSale(o) && o.status !== 'Cancelled');
  const lines = [];
  const orders = [];
  mine.forEach((o) => {
    const base = { saleId: o.id, at: o.at, channel: 'Online', place: 'Central Warehouse', counter: '', cashier: '', salesperson: o.source === 'Phone' ? 'Lamia Sultana' : '', customer: { name: o.customer, phone: digits(o.phone), type: 'Online' }, method: o.payment === 'COD' || o.payment === 'Unpaid' ? 'COD' : o.payment === 'Partial' ? 'Mixed' : 'Gateway', source: o.source, zone: o.zone };
    lines.push(...o.lines.map((l, i) => { const p = productBy(l.name, CATALOG) || { sku: '', name: l.name, cat: 'Other', price: l.price }; const unit = unitCostFor(p); return { ...base, id: o.id + ':' + i, sku: p.sku, name: l.name, cat: p.cat || 'Other', qty: l.qty, price: l.price, disc: 0, revenue: l.qty * l.price, vat: 0, cost: r2(unit * l.qty), est: false }; }));
  });
  const left = rec.revenue - mine.reduce((a, o) => a + o.subtotal, 0);
  const pool = CATALOG.filter((p) => p.sell !== 'wholesale' && ((p.on || {})['Central Warehouse'] || 0) > 0);
  const opts = { maxLines: 3, discChance: 0.1, bigChance: 0.03, bigTimes: 5, price: (p) => p.price, weight: (p) => (ONLINE_CAT[p.cat] || 1) / (1 + p.price / 3000), qty: (r) => 1 + (r() < 0.25 ? 1 : 0) };
  basketsFor(rand, left, Math.max(1, rec.orders - mine.length), pool, opts).forEach((b, i) => {
    const zone = pickMix(rand, ONLINE_ZONES);
    const people = ONLINE_PEOPLE[zone];
    const who = people[Math.floor(rand() * people.length)];
    const source = pickMix(rand, ONLINE_SOURCES);
    const placed = hourAt(rand, day, ONLINE_HOURS);
    const id = 'ON-' + String(day).padStart(2, '0') + '09-' + String(i + 1).padStart(2, '0');
    const base = { saleId: id, at: placed, channel: 'Online', place: 'Central Warehouse', counter: '', cashier: '', salesperson: source === 'Phone' ? 'Lamia Sultana' : '', customer: { name: who[0], phone: who[1], type: 'Online' }, method: pickMix(rand, ONLINE_METHODS), source, zone };
    const ls = linesOfBasket(base, b);
    lines.push(...ls);
    const subtotal = ls.reduce((a, l) => a + l.revenue, 0);
    orders.push({ id, at: placed, customer: base.customer.name, phone: base.customer.phone, zone, source, method: base.method, subtotal, shipping: SHIPPING[zone], amount: subtotal + SHIPPING[zone], units: ls.reduce((a, l) => a + l.qty, 0), lines: ls.map((l) => ({ name: l.name, qty: l.qty, price: l.price })), est: true, ...orderLife(rand, placed, zone) });
  });
  // orders that were cancelled before they went out: not sales, but part of the order funnel
  const crand = seeded(3000 + day);
  const cancelled = Math.floor(crand() * 3);
  for (let i = 0; i < cancelled; i++) {
    const zone = pickMix(crand, ONLINE_ZONES);
    const who = ONLINE_PEOPLE[zone][Math.floor(crand() * ONLINE_PEOPLE[zone].length)];
    const b = fillBasket(crand, 800 + Math.floor(crand() * 2500), pool, { ...opts, final: false, discChance: 0 });
    if (!b.lines.length) continue;
    const placed = hourAt(crand, day, ONLINE_HOURS);
    const subtotal = b.lines.reduce((a, l) => a + l.qty * l.price, 0);
    orders.push({ id: 'ON-' + String(day).padStart(2, '0') + '09-C' + (i + 1), at: placed, customer: who[0], phone: who[1], zone, source: pickMix(crand, ONLINE_SOURCES), method: pickMix(crand, ONLINE_METHODS), subtotal, shipping: SHIPPING[zone], amount: subtotal + SHIPPING[zone], units: b.lines.reduce((a, l) => a + l.qty, 0), lines: b.lines.map((l) => ({ name: l.p.name, qty: l.qty, price: l.price })), est: true, status: 'Cancelled', courier: 'Not assigned', rtoReason: '', deliveryDays: null, cancelled: true, times: { placed, approved: null, ready: null, shipped: null, delivered: null, returned: null, cancelled: Math.round(placed + (0.5 + crand() * 5) * HOUR) } });
  }
  return { lines, orders };
}

/** Demo wholesale lines for the September invoices before the ones in invoices.js. */
function wholesaleSeedLines(rec, i) {
  const rand = seeded(4000 + i);
  const pool = CATALOG.filter((p) => p.sell !== 'retail' && p.wholesale > 0 && ((p.on || {})['Central Warehouse'] || 0) > 0);
  const b = fillBasket(rand, rec.revenue, pool, { final: true, maxLines: 4, price: (p) => p.wholesale, weight: (p) => (p.cat === 'Electronics' ? 3 : p.cat === 'Grocery' ? 1 : 2), qty: (r, p) => Math.max(1, p.moq || 1) * (1 + Math.floor(r() * 3)) });
  const base = {
    saleId: rec.id, at: rec.at, channel: 'Wholesale', place: 'Dhanmondi branch', counter: 'Dhanmondi · Counter 1', cashier: 'Sadia Akter', salesperson: 'Rakib Hasan',
    customer: { name: rec.party, phone: WHOLESALE_PHONES[rec.party] || '', type: 'Wholesale' }, method: WHOLESALE_METHODS[i % WHOLESALE_METHODS.length], source: '', zone: '',
  };
  return linesOfBasket(base, b);
}

// ---- demo customers ------------------------------------------------------------------------------
// Who bought on the generated demo sales is decided after the baskets are made (its own random
// seed), so the sales themselves never change. Online: most buyers order once, some 2–3 times, a few
// often; each has a name, mobile number and an address in their delivery zone. Retail: about 70% are
// walk-ins with no number, the rest loyalty members and regular customers. Loyalty members only buy
// up to the last visit the loyalty seed gives them; members whose last visit was in August do not
// appear in September at all (they show as inactive).
const FIRST = ['Ayesha', 'Fatema', 'Nusrat', 'Sumaiya', 'Tasnim', 'Farhana', 'Jannatul', 'Sadia', 'Mim', 'Riya', 'Tania', 'Nadia', 'Sabrina', 'Lamia', 'Afsana', 'Moushumi', 'Rupa', 'Shapla', 'Sharmin', 'Ishrat', 'Tahmina', 'Rokeya', 'Mahiya', 'Anika', 'Sanjida',
  'Rahim', 'Karim', 'Tanvir', 'Imran', 'Rakib', 'Sakib', 'Fahim', 'Nayeem', 'Mehedi', 'Arif', 'Sohel', 'Jahid', 'Shuvo', 'Rifat', 'Hasan', 'Mamun', 'Sajjad', 'Tareq', 'Rubel', 'Shakil', 'Ashik', 'Rasel', 'Zahid', 'Masud', 'Habib'];
const LAST = ['Rahman', 'Hossain', 'Islam', 'Ahmed', 'Akter', 'Chowdhury', 'Khan', 'Uddin', 'Sarker', 'Mia', 'Haque', 'Alam', 'Begum', 'Sultana', 'Talukder', 'Bhuiyan', 'Mondal', 'Sheikh', 'Kabir', 'Siddique', 'Karim', 'Hasan', 'Das', 'Roy', 'Mahmud'];
const AREAS = {
  'Inside Dhaka': ['Mirpur 10, Dhaka 1216', 'Mirpur 2, Dhaka 1216', 'Dhanmondi, Dhaka 1209', 'Mohammadpur, Dhaka 1207', 'Uttara Sector 7, Dhaka 1230', 'Uttara Sector 11, Dhaka 1230', 'Banani, Dhaka 1213', 'Gulshan 1, Dhaka 1212', 'Badda, Dhaka 1212', 'Rampura, Dhaka 1219', 'Bashundhara R/A, Dhaka 1229', 'Khilgaon, Dhaka 1219', 'Malibagh, Dhaka 1217', 'Shyamoli, Dhaka 1207', 'Lalbagh, Dhaka 1211', 'Jatrabari, Dhaka 1204', 'Farmgate, Dhaka 1215', 'Wari, Dhaka 1203'],
  'Sub-Dhaka': ['Savar, Dhaka 1340', 'Ashulia, Savar 1341', 'Gazipur Chowrasta, Gazipur 1700', 'Tongi, Gazipur 1710', 'Konabari, Gazipur 1751', 'Chashara, Narayanganj 1400', 'Fatullah, Narayanganj 1421', 'Keraniganj, Dhaka 1310'],
  'Outside Dhaka': ['Agrabad, Chattogram 4100', 'GEC Circle, Chattogram 4000', 'Zindabazar, Sylhet 3100', 'Shaheb Bazar, Rajshahi 6100', 'Sonadanga, Khulna 9100', 'Band Road, Barishal 8200', 'Kandirpar, Cumilla 3500', 'Jahaj Company Mor, Rangpur 5400', 'Ganginarpar, Mymensingh 2200', 'Satmatha, Bogura 5800', 'Doratana, Jashore 7400', 'Court Para, Kushtia 7000'],
};
/** Loyalty members (loyalty.js seed) with the last day they bought in September; 0 = not in September. */
const MEMBERS = [
  ['Farzana Akter', '01711245518', 21, 7], ['Rakibul Hasan', '01819072332', 16, 4], ['Mostafizur Rahman', '01711902244', 14, 5], ['Tanvir Ahmed', '01914622045', 15, 3],
  ['Shirin Akter', '01811843300', 25, 6], ['Sharmin Sultana', '01678492281', 2, 1], ['Mahmudul Islam', '01733808614', 18, 1], ['Sabrina Chowdhury', '01511537770', 0, 0], ['Arif Rahman', '01890226153', 0, 0],
];
/** A deterministic roster of new people (name, mobile, address) for one zone or the counters. */
function roster(rand, used) {
  return (zone) => {
    let name, phone;
    do { name = FIRST[Math.floor(rand() * FIRST.length)] + ' ' + LAST[Math.floor(rand() * LAST.length)]; } while (used.has(name));
    do { phone = '01' + (3 + Math.floor(rand() * 7)) + String(Math.floor(rand() * 1e8)).padStart(8, '0'); } while (used.has(phone));
    used.add(name); used.add(phone);
    const area = zone ? AREAS[zone][Math.floor(rand() * AREAS[zone].length)] : '';
    return { name, phone, address: area ? `House ${1 + Math.floor(rand() * 60)}, Road ${1 + Math.floor(rand() * 15)}, ${area}` : '' };
  };
}
/** How many purchases each new customer makes: once, 2–3 times or often. */
const timesOf = (rand, mix) => { const r = rand(); return r < mix[0] ? 1 : r < mix[0] + mix[1] ? 2 + Math.floor(rand() * 2) : 4 + Math.floor(rand() * 4); };
/** Spread customers over events (in time order): each customer gets their number of events. */
function assign(rand, events, people) {
  const slots = [];
  people.forEach((p) => { for (let i = 0; i < p.times; i++) slots.push(p); });
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  events.forEach((e, i) => { if (slots[i]) e.set(slots[i]); });
}
function seedCustomers(retail, online, onlineOrders) {
  const rand = seeded(5150);
  const used = new Set(MEMBERS.flatMap((m) => [m[0], m[1]]));
  Object.values(ONLINE_PEOPLE).forEach((list) => list.forEach(([n, ph]) => { used.add(n); used.add(ph); }));
  RETAIL_PEOPLE.forEach(([n, ph]) => { used.add(n); used.add(ph); });
  const newPerson = roster(rand, used);
  // online: the generated orders of each zone (the demo orders keep their own customers)
  const sales = onlineOrders.filter((o) => !o.cancelled && /^ON-/.test(o.id)).sort((a, b) => a.at - b.at);
  const linesOf = {};
  Object.values(online).forEach((list) => list.forEach((l) => { (linesOf[l.saleId] = linesOf[l.saleId] || []).push(l); }));
  const zonePeople = {};
  Object.keys(ONLINE_ZONES).forEach((zone) => {
    const mine = sales.filter((o) => o.zone === zone);
    // the customers the demo already knows in this zone come back now and then
    const people = ONLINE_PEOPLE[zone].map(([name, phone]) => ({ name, phone, address: `House ${1 + Math.floor(rand() * 60)}, Road ${1 + Math.floor(rand() * 15)}, ${AREAS[zone][Math.floor(rand() * AREAS[zone].length)]}`, times: 1 + Math.floor(rand() * 2) }));
    let n = people.reduce((a, p) => a + p.times, 0);
    while (n < mine.length) { const p = { ...newPerson(zone), times: timesOf(rand, [0.8, 0.16]) }; people.push(p); n += p.times; }
    // too many purchases planned: the last ones are cut back
    for (let i = people.length - 1; n > mine.length && i >= 0; i--) { const cut = Math.min(people[i].times - 1, n - mine.length); people[i].times -= cut; n -= cut; if (n > mine.length && people[i].times === 1 && people.length > 1) { people.splice(i, 1); n -= 1; } }
    zonePeople[zone] = people;
    assign(rand, mine.map((o) => ({ set: (p) => {
      const customer = { name: p.name, phone: p.phone, type: 'Online', address: p.address };
      o.customer = p.name; o.phone = p.phone; o.address = p.address;
      (linesOf[o.id] || []).forEach((l) => { l.customer = customer; });
    } })), people);
  });
  // cancelled orders: someone from the same zone
  onlineOrders.filter((o) => o.cancelled).forEach((o) => { const list = zonePeople[o.zone]; const p = list[Math.floor(rand() * list.length)]; o.customer = p.name; o.phone = p.phone; o.address = p.address; });
  // retail: about 30% of the counter sales are by a known customer
  const bySale = {};
  Object.values(retail).forEach((list) => list.forEach((l) => { (bySale[l.saleId] = bySale[l.saleId] || []).push(l); }));
  const order = Object.keys(bySale).sort((a, b) => bySale[a][0].at - bySale[b][0].at);
  const known = [];
  const walkIn = () => ({ name: 'Walk-in customer', phone: '', type: 'Retail' });
  order.forEach((id) => { if (rand() < 0.3) known.push(id); else { const c = walkIn(); bySale[id].forEach((l) => { l.customer = c; }); } });
  const dayOf = (id) => new Date(bySale[id][0].at).getDate();
  const give = (id, p) => { const c = { name: p.name, phone: p.phone, type: 'Retail' }; bySale[id].forEach((l) => { l.customer = c; }); };
  let free = known.slice();
  // loyalty members: some visits up to their last visit, one of them on that day
  MEMBERS.filter((m) => m[2]).forEach(([name, phone, last, times]) => {
    const onLast = free.find((id) => dayOf(id) === last) || order.find((id) => dayOf(id) === last && !known.includes(id));
    if (!onLast) return;
    const before = free.filter((id) => id !== onLast && dayOf(id) < last);
    const pick = [onLast];
    for (let i = 1; i < times && before.length; i++) pick.push(before.splice(Math.floor(rand() * before.length), 1)[0]);
    pick.forEach((id) => give(id, { name, phone }));
    free = free.filter((id) => !pick.includes(id));
  });
  // regulars the demo already knew, then new faces
  const people = RETAIL_PEOPLE.filter(([, ph]) => !MEMBERS.some((m) => m[1] === ph)).map(([name, phone]) => ({ name, phone, times: 2 + Math.floor(rand() * 4) }));
  let n = people.reduce((a, p) => a + p.times, 0);
  while (n < free.length) { const p = { ...newPerson(''), times: timesOf(rand, [0.65, 0.25]) }; people.push(p); n += p.times; }
  for (let i = people.length - 1; n > free.length && i >= 0; i--) { const cut = Math.min(people[i].times - 1, n - free.length); people[i].times -= cut; n -= cut; if (n > free.length && people[i].times === 1) { people.splice(i, 1); n -= 1; } }
  assign(rand, free.map((id) => ({ set: (p) => give(id, p) })), people);
}

/**
 * Customers' buying before September (demo): who last bought in June, July or August and has not
 * come back, so "inactive for 30 / 60 / 90 days" lists have people in them. No sales lines stand
 * behind these figures (the sales book starts on 1 September). Each:
 * { name, phone, type: 'Online'|'Retail', address, firstBoughtAt, lastBoughtAt, orders, spent, est: true }
 */
export function getCustomerHistory() {
  if (HISTORY) return HISTORY;
  const rand = seeded(6060);
  const used = new Set();
  getSaleLines(getSales()).forEach((l) => { if (l.customer && l.customer.phone) { used.add(l.customer.phone); used.add(l.customer.name); } });
  MEMBERS.forEach((m) => { used.add(m[0]); used.add(m[1]); });
  const newPerson = roster(rand, used);
  const day = (m, d) => new Date(2026, m, d, 11 + Math.floor(rand() * 9), Math.floor(rand() * 60)).getTime();
  const out = [
    { name: 'Sabrina Chowdhury', phone: '01511537770', type: 'Retail', address: '', firstBoughtAt: day(8, 2) - 31 * 864e5, lastBoughtAt: new Date(2026, 7, 28, 17, 10).getTime(), orders: 2, spent: 2980, est: true },
    { name: 'Arif Rahman', phone: '01890226153', type: 'Retail', address: '', firstBoughtAt: new Date(2026, 6, 30, 12, 0).getTime(), lastBoughtAt: new Date(2026, 7, 9, 18, 40).getTime(), orders: 1, spent: 1250, est: true },
  ];
  for (let i = 0; i < 46; i++) {
    const online = i < 32;
    const zone = online ? pickMix(rand, ONLINE_ZONES) : '';
    const p = newPerson(zone);
    const m = 5 + Math.floor(rand() * 3);                   // June, July or August
    const last = day(m, 1 + Math.floor(rand() * 28));
    const orders = timesOf(rand, [0.6, 0.3]);
    out.push({ ...p, type: online ? 'Online' : 'Retail', firstBoughtAt: orders > 1 ? last - (20 + Math.floor(rand() * 120)) * 864e5 : last, lastBoughtAt: last, orders, spent: orders * Math.round((online ? 1200 + rand() * 1600 : 500 + rand() * 1500) / 10) * 10, est: true });
  }
  HISTORY = out.sort((a, b) => b.lastBoughtAt - a.lastBoughtAt);
  return HISTORY;
}
let HISTORY = null;

// built once: the generated lines do not change (VAT is added when they are read)
let SEED_BUILT = null;
function seedBuilt() {
  if (SEED_BUILT) return SEED_BUILT;
  const demo = demoOrders();
  const retail = {}, online = {}, wholesale = {}, onlineOrders = [];
  RETAIL_SEED.forEach((r) => { retail[r.id] = retailSeedLines(new Date(r.at).getDate()); });
  ONLINE_SEED.forEach((r, i) => { const d = onlineSeedDay(i + 1, demo); online[r.id] = d.lines; onlineOrders.push(...d.orders); });
  WHOLESALE_SEED.forEach((r, i) => { wholesale[r.id] = wholesaleSeedLines(r, i); });
  seedCustomers(retail, online, onlineOrders);
  SEED_BUILT = { lines: { ...retail, ...online, ...wholesale }, onlineOrders: onlineOrders.sort((a, b) => b.at - a.at) };
  return SEED_BUILT;
}

// ---- VAT on lines -----------------------------------------------------------------------------------
/** VAT of each line: the sale's own VAT spread by each line's rate (vat.js), or, for demo September
 *  retail and wholesale lines, the category rate on the line's revenue. Online orders carry no VAT. */
function withVat(lines, tax, vat) {
  if (!lines.length) return lines;
  if (!(tax > 0)) return lines.map((l) => ({ ...l, vat: 0 }));
  const raw = lines.map((l) => l.revenue * vatRateFor(l.cat, vat) / 100);
  const s = raw.reduce((a, x) => a + x, 0);
  const rev = lines.reduce((a, l) => a + l.revenue, 0);
  let given = 0;
  return lines.map((l, i) => {
    const v = i === lines.length - 1 ? r2(tax - given) : r2(s > 0 ? tax * raw[i] / s : rev ? tax * l.revenue / rev : 0);
    given = r2(given + v);
    return { ...l, vat: v };
  });
}
const estVat = (lines, vat) => lines.map((l) => (l.channel === 'Online' ? l : { ...l, vat: r2(l.revenue * vatRateFor(l.cat, vat) / 100) }));

// ---- lines of real sales ----------------------------------------------------------------------------
const TENDER_METHOD = { 'Due / credit': 'Due', 'Customer credit': 'Due' };
/** The main payment method of a POS sale or invoice, as it was taken at the sale. */
function methodOfSale(s) {
  const t = s.totals || {};
  const tenders = (s.tenders || []).filter((x) => x.amount > 0);
  const set = new Set(tenders.map((x) => TENDER_METHOD[x.method] || x.method));
  const paidNow = tenders.filter((x) => !TENDER_METHOD[x.method]).reduce((a, x) => a + x.amount, 0) - (s.change || 0);
  if ((t.total || 0) - paidNow > 0.5) set.add('Due');
  return set.size === 0 ? 'Due' : set.size === 1 ? [...set][0] : 'Mixed';
}
/**
 * The lines of a POS sale or an invoice: each line's own discount plus its share of the sale's
 * cart, coupon, member and points discounts; revenue adds up to the sale's revenue (before VAT).
 */
function saleLines(s, rec, vat) {
  const t = s.totals || {};
  const raw = (s.lines || []).map((l) => {
    const p = productBy(l.sku || l.name) || productBy(l.name);
    const qty = Number(l.qty) || 0, price = Number(l.price) || 0;
    const lineDisc = Math.min(qty * price, Number(l.disc) || 0);
    const unit = Number(l.cost) > 0 ? Number(l.cost) : productCostOf(l.sku || l.name) || productCostOf(l.name) || r2(price * 0.7);
    return { sku: l.sku || (p ? p.sku : ''), name: l.name, cat: l.cat || (p ? p.cat : '') || 'Other', qty, price, lineDisc, base: qty * price - lineDisc, cost: r2(unit * qty) };
  });
  const sumBase = raw.reduce((a, l) => a + l.base, 0);
  const other = r2(sumBase - rec.revenue);   // the sale's own discounts (and rounding)
  let done = 0;
  const lines = raw.map((l, i) => {
    const revenue = i === raw.length - 1 ? r2(rec.revenue - done) : r2(l.base - (sumBase ? other * l.base / sumBase : 0));
    done = r2(done + revenue);
    return {
      id: rec.id + ':' + i, saleId: rec.id, at: rec.at, channel: rec.channel, place: rec.place, counter: rec.counter, cashier: rec.cashier, salesperson: rec.salesperson,
      customer: rec.customer, sku: l.sku, name: l.name, cat: l.cat, qty: l.qty, price: l.price, disc: r2(l.qty * l.price - revenue), revenue, vat: 0, cost: l.cost,
      method: rec.method, source: '', zone: '', est: false,
    };
  });
  return withVat(lines, r2(t.tax || 0), vat);
}
/** The lines of an online order made in this browser (no discounts, no VAT). */
function orderLines(o, rec) {
  return (o.lines || []).map((l, i) => {
    const p = productBy(l.sku || l.name) || productBy(l.name);
    const qty = Number(l.qty) || 0, price = Number(l.price) || 0;
    const unit = Number(l.cost) > 0 ? Number(l.cost) : productCostOf(l.sku || l.name) || productCostOf(l.name) || r2(price * 0.7);
    return {
      id: rec.id + ':' + i, saleId: rec.id, at: rec.at, channel: 'Online', place: rec.place, counter: '', cashier: '', salesperson: '',
      customer: rec.customer, sku: l.sku || (p ? p.sku : ''), name: l.name, cat: l.cat || (p ? p.cat : '') || 'Other', qty, price, disc: 0, revenue: r2(qty * price), vat: 0, cost: r2(unit * qty),
      method: rec.method, source: rec.source, zone: rec.zone, est: false,
    };
  });
}
const linesCost = (lines) => r2(lines.reduce((a, l) => a + l.cost, 0));
const counterPlace = (name) => { try { return (getCounters().find((c) => c.name === name) || {}).location || ''; } catch { return ''; } };
const ORDER_METHOD = { COD: 'COD', Paid: 'Gateway', Partial: 'Mixed', Unpaid: 'Due' };

// ---- the book ------------------------------------------------------------------------------------
/**
 * Every sale record, newest first:
 * { id, at, channel, ref, party, revenue (before VAT), cost, orders, paid, due, est?,
 *   place, counter, cashier, salesperson, source, zone, method, lines }
 * A demo September retail or online record is a whole day; its lines are that day's sales.
 */
export function getSales() {
  const vat = loadVat();
  const built = seedBuilt();
  const lineMix = (lines, key) => { const set = new Set(lines.map((l) => l[key]).filter(Boolean)); return set.size === 1 ? [...set][0] : ''; };
  const seedRec = (r) => {
    const lines = estVat(built.lines[r.id] || [], vat);
    return { ...r, place: lineMix(lines, 'place'), counter: lineMix(lines, 'counter'), cashier: lineMix(lines, 'cashier'), salesperson: lineMix(lines, 'salesperson'), source: lineMix(lines, 'source'), zone: lineMix(lines, 'zone'), method: lineMix(lines, 'method') || 'Mixed', lines };
  };
  const out = [...RETAIL_SEED, ...ONLINE_SEED, ...WHOLESALE_SEED].map(seedRec);
  if (typeof window === 'undefined') return out.sort((a, b) => b.at - a.at);
  const invoices = getInvoices();
  const invoiceIds = new Set(invoices.map((i) => i.id));
  const sold = (s) => {
    const t = s.totals || {};
    const channel = s.wholesale ? 'Wholesale' : 'Retail';
    const rec = {
      id: s.id, at: s.at, channel, ref: s.id, party: (s.customer && s.customer.name) || 'Walk-in customer', revenue: r2((t.total || 0) - (t.tax || 0)), orders: 1,
      place: s.place || counterPlace(s.counter), counter: s.counter || '', cashier: s.cashier || '', salesperson: s.salesperson || s.cashier || '', source: '', zone: '', method: methodOfSale(s),
      customer: { name: (s.customer && s.customer.name) || 'Walk-in customer', phone: digits(s.customer && s.customer.phone), type: s.wholesale ? 'Wholesale' : 'Retail' },
    };
    rec.lines = saleLines(s, rec, vat);
    rec.cost = linesCost(rec.lines);
    return rec;
  };
  invoices.forEach((inv) => {
    const rec = sold(inv);
    out.push({ ...rec, paid: r2(((inv.totals || {}).total || 0) - Math.max(0, inv.due)), due: Math.max(0, inv.due) });
  });
  // POS sales made in this browser that are not invoices
  load(POS_KEYS.sales, []).filter((s) => !invoiceIds.has(s.id)).forEach((s) => {
    const rec = sold(s);
    out.push({ ...rec, paid: (s.totals || {}).total || 0, due: 0 });
  });
  // online orders made in this browser
  getOrders().filter((o) => o.made && !isCounterSale(o) && o.status !== 'Cancelled').forEach((o) => {
    const rec = {
      id: o.id, at: o.at, channel: 'Online', ref: o.id, party: o.customer, revenue: o.subtotal, orders: 1, paid: o.paid || 0, due: r2(Math.max(0, o.amount - (o.paid || 0))), delivery: o.shipping || 0,
      place: holdPlaceOf(o.id), counter: '', cashier: '', salesperson: '', source: o.source || 'Phone', zone: o.zone || '', method: o.method || ORDER_METHOD[o.payment] || 'COD',
      customer: { name: o.customer, phone: digits(o.phone), type: 'Online' },
    };
    rec.lines = orderLines(o, rec);
    rec.cost = linesCost(rec.lines);
    out.push(rec);
  });
  return out.sort((a, b) => b.at - a.at);
}

/**
 * Every line sold, newest first (returns are not taken off here: reports read returns.js):
 * { id, saleId, at, channel: 'Online'|'Retail'|'Wholesale',
 *   place, counter, cashier, salesperson,          place = branch / warehouse; counter and cashier '' online
 *   customer: { name, phone (digits), type },      type 'Online'|'Retail'|'Wholesale'
 *   sku, name, cat, qty, price,                    price = unit price before discount
 *   disc,                                          this line's discount with its share of the sale's discounts
 *   revenue,                                       qty × price − disc, before VAT
 *   vat, cost,                                     cost = qty × buying price at the time of sale
 *   method,                                        'Cash'|'bKash'|'Nagad'|'Card'|'Rocket'|'Bank'|'Wallet'|'COD'|'Gateway'|'Due'|'Mixed'
 *   source, zone,                                  online only
 *   est }                                          true for demo September lines made from the day totals
 * Pass `sales` (from getSales) to reuse records already read.
 */
export function getSaleLines(sales = getSales()) {
  const out = [];
  sales.forEach((s) => { (s.lines || []).forEach((l) => out.push(l)); });
  return out.sort((a, b) => b.at - a.at);
}

/**
 * Online orders with what happened to them, newest first: the demo September orders behind the
 * online days (with couriers, times, delivered or returned; a few cancelled ones too) and every
 * online order in Orders (getOrders). Each: { id, at, customer, phone, zone, source, method, subtotal,
 * shipping, amount, units, lines, status, courier, times: { placed, approved, ready, shipped, delivered,
 * returned, cancelled }, rtoReason, deliveryDays, est }.
 */
export function getOnlineOrders() {
  const built = seedBuilt().onlineOrders;
  const real = getOrders().filter((o) => !isCounterSale(o) && !o.isInvoice).map((o) => ({
    id: o.id, at: o.at, customer: o.customer, phone: digits(o.phone), zone: o.zone, source: o.source, method: o.method || ORDER_METHOD[o.payment] || 'COD',
    subtotal: o.subtotal, shipping: o.shipping || 0, amount: o.amount, units: o.units, lines: o.lines, status: o.status, courier: o.courier, times: o.times,
    rtoReason: o.rtoReason || '', deliveryDays: o.times && o.times.delivered && o.times.shipped ? r2((o.times.delivered - o.times.shipped) / (24 * HOUR)) : null, est: false, made: !!o.made,
  }));
  return [...real, ...built].sort((a, b) => b.at - a.at);
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
