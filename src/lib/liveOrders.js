// liveOrders — the online shop keeps taking orders after the demo September: every day from 1 October up
// to now gets its website, Facebook, phone and order-link orders, made the same way every time (a fixed
// random seed per date), so the dashboard, Orders and Reports always have a today and a yesterday.
// Each order moves on with the clock: waiting to be confirmed for a few hours, approved, packed, with
// the courier, then delivered or brought back (RTO); a few are cancelled before they go out.
// orders.js lists them with the demo orders (same shape, `live: true`); the sales book counts them.
// Only the last LIVE_DAYS days are kept. Front end only.

import { CATALOG } from './stock';
import { ONLINE_PEOPLE, FIRST, LAST, AREAS } from './demoPeople';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LIVE_FROM = new Date(2026, 9, 1).getTime();
const LIVE_DAYS = 90;
const FIRST_NO = 136813;   // the demo orders end at #136812

const ZONES = { 'Inside Dhaka': 55, 'Sub-Dhaka': 20, 'Outside Dhaka': 25 };
const SOURCES = { Website: 45, Facebook: 35, Phone: 14, 'Order link': 6 };
const CHANNEL_OF = { Website: 'Online store', Facebook: 'Facebook shop', Phone: 'Phone order', 'Order link': 'Order link' };
const SHIPPING = { 'Inside Dhaka': 70, 'Sub-Dhaka': 110, 'Outside Dhaka': 150 };
const COURIERS = { 'Inside Dhaka': { Pathao: 55, Carrybee: 25, RedX: 20 }, 'Sub-Dhaka': { Steadfast: 50, Pathao: 30, RedX: 20 }, 'Outside Dhaka': { Steadfast: 60, RedX: 30, Pathao: 10 } };
const PREFIX = { Pathao: 'PT', Steadfast: 'SF', RedX: 'RX', Carrybee: 'CB' };
const DELIVERY_DAYS = { 'Inside Dhaka': [1, 2], 'Sub-Dhaka': [2, 3], 'Outside Dhaka': [2, 4] };
const RTO_RATE = { 'Inside Dhaka': 0.05, 'Sub-Dhaka': 0.08, 'Outside Dhaka': 0.13 };
const RTO_REASONS = ['Customer refused the parcel', 'Customer not reachable', 'Wrong address', 'Customer cancelled at the door', 'Parcel damaged in transit'];
// when people order (hour → weight): quiet at night, a lunch bump, busiest after dinner
const HOURS = { 0: 2, 1: 1, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 5, 13: 6, 14: 5, 15: 4, 16: 4, 17: 4, 18: 5, 19: 6, 20: 8, 21: 9, 22: 8, 23: 5 };
const CAT_WEIGHT = { 'Skin care': 3, Clothing: 3, Electronics: 1.6, Home: 1.2, Grocery: 1 };

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
const dateKey = (t) => { const d = new Date(t); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const nextDay = (t) => { const d = new Date(t); d.setDate(d.getDate() + 1); return d.getTime(); };
const phoneText = (p) => p.slice(0, 5) + '-' + p.slice(5);

/** The products sold online (not wholesale-only, kept at the central warehouse). */
let POOL = null;
const pool = () => POOL || (POOL = CATALOG.filter((p) => p.sell !== 'wholesale' && ((p.on || {})['Central Warehouse'] || 0) > 0 && p.price > 0));

/** One day's orders, in the order they were placed: full life planned (times are cut at "now" when read). */
function makeDay(day, firstNo) {
  const key = dateKey(day);
  const rand = seeded(key);
  const n = Math.floor((day - LIVE_FROM) / DAY);
  const weekday = new Date(day).getDay();
  // a growing shop: 11–21 orders a day, a little more each week, Fridays and Saturdays busier
  const count = Math.round((11 + rand() * 10) * (1 + n * 0.004) * (weekday === 5 || weekday === 6 ? 1.15 : 1));
  const used = new Set();
  const out = [];
  for (let i = 0; i < count; i++) {
    const zone = pickMix(rand, ZONES);
    const source = pickMix(rand, SOURCES);
    const h = Number(pickMix(rand, HOURS));
    const placed = new Date(day).setHours(h, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
    // about a third are customers the shop already knows; the rest are new
    let name, phone;
    if (rand() < 0.32) { const k = ONLINE_PEOPLE[zone][Math.floor(rand() * ONLINE_PEOPLE[zone].length)]; [name, phone] = k; } else {
      do { name = FIRST[Math.floor(rand() * FIRST.length)] + ' ' + LAST[Math.floor(rand() * LAST.length)]; } while (used.has(name));
      phone = '01' + (3 + Math.floor(rand() * 7)) + String(Math.floor(rand() * 1e8)).padStart(8, '0');
    }
    used.add(name);
    const area = AREAS[zone][Math.floor(rand() * AREAS[zone].length)];
    // the basket: one to three products, now and then two of one
    const items = 1 + (rand() < 0.35 ? 1 : 0) + (rand() < 0.12 ? 1 : 0);
    const lines = [];
    for (let j = 0; j < items; j++) {
      const p = pickW(rand, pool(), (x) => (CAT_WEIGHT[x.cat] || 1) / (1 + x.price / 3000));
      const same = lines.find((l) => l.sku === p.sku);
      if (same) same.qty += 1; else lines.push({ name: p.name, sku: p.sku, qty: 1 + (rand() < 0.2 ? 1 : 0), price: p.price });
    }
    const paidOnline = rand() < 0.38;
    const courier = pickMix(rand, COURIERS[zone]);
    const cancelled = rand() < 0.07;
    // what happens next: confirmed within a few hours (orders after 10 PM wait for the morning)
    const morning = (t) => { const d = new Date(t); const hh = d.getHours(); if (hh >= 22) d.setDate(d.getDate() + 1); if (hh >= 22 || hh < 9) d.setHours(9, 20 + Math.floor(rand() * 70), 0, 0); return d.getTime(); };
    const plan = { placed, approved: null, ready: null, shipped: null, delivered: null, returned: null, cancelled: null };
    if (cancelled) plan.cancelled = Math.round(placed + (0.4 + rand() * 4) * HOUR);
    else {
      plan.approved = morning(placed + (0.3 + rand() * 3) * HOUR);
      plan.ready = Math.round(plan.approved + (1 + rand() * 4) * HOUR);
      plan.shipped = Math.round(plan.ready + (2 + rand() * 14) * HOUR);
      const [lo, hi] = DELIVERY_DAYS[zone];
      const rto = rand() < RTO_RATE[zone];
      const end = Math.round(plan.shipped + (lo + Math.floor(rand() * (hi - lo + 1)) + (rto ? 1 : 0)) * DAY - rand() * 8 * HOUR);
      if (rto) plan.returned = end; else plan.delivered = end;
    }
    out.push({
      id: '#' + (firstNo + i), at: placed, channel: CHANNEL_OF[source], source, customer: name, phone: phoneText(phone), zone,
      address: `House ${1 + Math.floor(rand() * 60)}, Road ${1 + Math.floor(rand() * 15)}, ${area}`,
      lines, shipping: SHIPPING[zone], total: lines.reduce((a, l) => a + l.qty * l.price, 0) + SHIPPING[zone], courier, consignment: PREFIX[courier] + '-' + String(4400000 + Math.floor(rand() * 5599999)),
      payment: paidOnline ? 'Paid' : 'COD', method: paidOnline ? (rand() < 0.6 ? 'Gateway' : 'bKash') : 'COD',
      rtoReason: RTO_REASONS[Math.floor(rand() * RTO_REASONS.length)], plan, live: true,
    });
  }
  return out.sort((a, b) => a.at - b.at).map((o, i) => ({ ...o, id: '#' + (firstNo + i) }));
}

// days are made in order from 1 October, so order numbers run on from day to day
const DAYS = [];
function daysUpTo(now) {
  const last = dayStart(now);
  let day = DAYS.length ? nextDay(DAYS[DAYS.length - 1].day) : LIVE_FROM;
  while (day <= last) {
    const prev = DAYS[DAYS.length - 1];
    const firstNo = prev ? prev.firstNo + prev.orders.length : FIRST_NO;
    DAYS.push({ day, firstNo, orders: makeDay(day, firstNo) });
    day = nextDay(day);
  }
  return DAYS.filter((d) => d.day <= last && d.day > last - LIVE_DAYS * DAY);
}

/** Status and times of a live order at `now` (only what has happened by then). */
function asAt(o, now) {
  const t = {};
  Object.keys(o.plan).forEach((k) => { t[k] = o.plan[k] != null && o.plan[k] <= now ? o.plan[k] : null; });
  const status = t.cancelled ? 'Cancelled' : t.returned ? 'Returned' : t.delivered ? 'Delivered' : t.shipped ? 'Shipped' : t.ready ? 'Ready to ship' : t.approved ? 'Approved' : 'Pending';
  const { plan, rtoReason, courier, consignment, ...rest } = o;
  const out = { ...rest, status, times: t, courier: t.shipped ? courier : 'Not assigned', consignment: t.shipped ? consignment : '—' };
  if (status === 'Returned') out.rtoReason = rtoReason;
  return out;
}

/** The live online orders placed by `now`, newest first, as they stand at `now`. */
export function liveOrders(now) {
  if (typeof window === 'undefined' || !(now >= LIVE_FROM)) return [];
  const out = [];
  daysUpTo(now).forEach((d) => d.orders.forEach((o) => { if (o.at <= now) out.push(asAt(o, now)); }));
  return out.reverse();
}
