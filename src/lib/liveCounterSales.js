// liveCounterSales — the shop's counters keep selling after the demo September, the way liveOrders.js keeps the
// online shop going: every day from 1 October up to now, Dazzle Shop's Dhanmondi counters (1 and 2) and the
// Mirpur counter make their sales, the same way every time (a fixed random seed per date and branch).
// Each sale has the shape of a POS sale the register saves (posSale.js › commitSale): frozen lines, totals with
// VAT, one tender (cash with change, bKash, Nagad or card), cashier and salesperson, a customer on about a
// third of the sales (most phone buyers leave their number for the warranty) and an IMEI for every phone sold.
// They are read, never saved: sales made in this browser stay in gc.pos.sales and are counted on their own,
// so nothing is counted twice. Who reads them:
//   orders.js       liveCounterOrders(now)   one order per sale (Retail orders, customer profile, warranty)
//   salesBook.js    liveCounterSales(now)    sales by channel, sale lines (Home, Daily summary, profit, reports)
//   ledger.js       liveCounterLedger(now)   the day's money per branch: cash into the counter drawers (emptied
//                                            into the shop safe at closing), bKash, Nagad, card (paid out by
//                                            the bank the next day, less its fee)
//   customerWarranty.js  liveSaleOf(orderId) the sale behind an order (Sold by, IMEI on the order page)
// Stock is not moved by these sales (the demo has no restocking after September). Front end only.

import { CATALOG } from './stock';
import { vatRateFor, vatOf } from './vat';
import { FIRST, LAST } from './demoPeople';
import { editionChannels } from './edition';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LIVE_FROM = new Date(2026, 9, 1).getTime();
const LIVE_DAYS = 90;
const CLOSE_H = 21, CLOSE_M = 30;     // the counters close and count their drawers at 9:30 PM
const VAT = { rates: {}, notReg: false, inclusive: true };   // the demo shop's standard VAT rates, shelf prices include VAT (vat.js defaults)

// the counters, the people who work them and how busy each branch is (posStore.js SEED_COUNTERS, hr.js)
const BRANCHES = [
  { key: 'DH', place: 'Dhanmondi branch', short: 'Dhanmondi', seed: 7, range: [22, 40], counters: [
    { id: 'REG-01', code: 'D1', name: 'Dhanmondi · Counter 1', share: 0.6, staff: ['Sadia Akter', 'Rakib Hasan'] },
    { id: 'REG-02', code: 'D2', name: 'Dhanmondi · Counter 2', share: 0.4, staff: ['Rafi Ahmed', 'Sadia Akter'] },
  ], sellers: ['Rafi Ahmed', 'Rakib Hasan'] },
  { key: 'MP', place: 'Mirpur branch', short: 'Mirpur', seed: 11, range: [15, 30], counters: [
    { id: 'REG-03', code: 'M1', name: 'Mirpur · Counter 1', share: 1, staff: ['Moumita Das', 'Nabila Rahman'] },
  ], sellers: ['Arif Rahman', 'Nabila Rahman'] },
];
const HOURS = { 10: 3, 11: 4, 12: 5, 13: 5, 14: 4, 15: 5, 16: 6, 17: 8, 18: 10, 19: 10, 20: 8, 21: 2 };
const CAT_WEIGHT = { Accessories: 5, Audio: 3, Phones: 2.2, 'Power banks': 1.4, Wearables: 0.8 };
const METHODS = { Cash: 55, bKash: 25, Card: 14, Nagad: 6 };
const ACCOUNT = { Cash: 'drawer', bKash: 'bkash', Nagad: 'nagad', Card: 'card' };
const CARD_FEE = 1.8;   // settlements.js › card partner: 1.8 %, paid out the next day to BRAC Bank
// regular customers the demo already knows at the counters (salesBook.js RETAIL_PEOPLE)
const REGULARS = [
  ['Shirin Akter', '01811843300'], ['Tahmina Akter', '01712408813'], ['Abdul Karim', '01819552074'], ['Farzana Yasmin', '01915663021'],
  ['Rezaul Karim', '01673228410'], ['Habibur Rahman', '01717330958'], ['Nasrin Akter', '01924551870'], ['Jahangir Alam', '01811290467'],
  ['Rumana Haque', '01734118802'], ['Kamal Hossain', '01675903318'], ['Mitu Rahman', '01628447190'], ['Shahidul Islam', '01913805562'],
];

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
const r2 = (n) => Math.round(n * 100) / 100;
const pad = (n, w) => String(n).padStart(w, '0');
const ymd = (t) => { const d = new Date(t); return d.getFullYear() + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2); };
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const nextDay = (t) => { const d = new Date(t); d.setDate(d.getDate() + 1); return d.getTime(); };
const closeOf = (day) => new Date(day).setHours(CLOSE_H, CLOSE_M, 0, 0);
const phoneText = (p) => p.slice(0, 5) + '-' + p.slice(5);
const luhn = (body) => { let s = 0; String(body).split('').reverse().forEach((d, i) => { let n = Number(d); if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; } s += n; }); return String((10 - (s % 10)) % 10); };
const nowMs = () => { try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); } };

const pools = {};
/** What a branch sells: retail products with stock there and a price. */
const poolOf = (place) => pools[place] || (pools[place] = CATALOG.filter((p) => p.sell !== 'wholesale' && p.price > 0 && ((p.on || {})[place] || 0) > 0));

/** One branch's sales for one day, in the order they were rung up (full day; read up to "now"). */
function makeBranchDay(day, b) {
  const date = ymd(day);
  const rand = seeded(Number(date) * 10 + b.seed);
  const n = Math.floor((day - LIVE_FROM) / DAY);
  const weekday = new Date(day).getDay();
  const [lo, hi] = b.range;
  // Fridays and Saturdays are busier; the shop grows a little week by week
  const count = Math.round((lo + rand() * (hi - lo)) * (weekday === 5 || weekday === 6 ? 1.15 : 1) * (1 + n * 0.003));
  const pool = poolOf(b.place);
  const raw = [];
  for (let i = 0; i < count; i++) {
    const c = pickW(rand, b.counters, (x) => x.share);
    const h = Number(pickMix(rand, HOURS));
    const at = new Date(day).setHours(h, Math.floor(rand() * (h === 21 ? 30 : 60)), Math.floor(rand() * 60), 0);
    // the basket: one item most of the time, now and then two or three
    const items = 1 + (rand() < 0.3 ? 1 : 0) + (rand() < 0.08 ? 1 : 0);
    const lines = [];
    for (let j = 0; j < items; j++) {
      const p = pickW(rand, pool, (x) => (CAT_WEIGHT[x.cat] || 1) / (1 + x.price / 2500));
      const same = lines.find((l) => l.sku === p.sku);
      if (same) { if (p.cat !== 'Phones') same.qty += 1; continue; }
      lines.push({ sku: p.sku, name: p.name, cat: p.cat, price: p.price, qty: p.cat === 'Accessories' && rand() < 0.2 ? 2 : 1 });
    }
    const phone = lines.some((l) => l.cat === 'Phones');
    // who bought: phone buyers mostly leave their number (warranty); others now and then
    let customer = { name: '', phone: '' };
    if (rand() < (phone ? 0.8 : 0.25)) {
      if (rand() < 0.45) { const k = REGULARS[Math.floor(rand() * REGULARS.length)]; customer = { name: k[0], phone: k[1] }; } else {
        customer = { name: FIRST[Math.floor(rand() * FIRST.length)] + ' ' + LAST[Math.floor(rand() * LAST.length)], phone: '01' + (3 + Math.floor(rand() * 7)) + pad(Math.floor(rand() * 1e8), 8) };
      }
    }
    const cashier = (n + c.code.charCodeAt(1)) % 7 === 3 ? c.staff[1] : c.staff[0];
    const sellers = b.sellers.filter((s) => s !== cashier);
    const salesperson = rand() < 0.45 || !sellers.length ? cashier : sellers[Math.floor(rand() * sellers.length)];
    // a phone is often paid by card or bKash; small items mostly in cash
    const method = phone && rand() < 0.45 ? (rand() < 0.6 ? 'Card' : 'bKash') : pickMix(rand, METHODS);
    const gross = lines.reduce((a, l) => a + l.price * l.qty, 0);
    // now and then the cashier rounds the bill down a little
    const cartDisc = rand() < 0.1 ? Math.min(Math.round(gross * (0.02 + rand() * 0.03) / 10) * 10, 500) : 0;
    raw.push({ at, c, lines, customer, cashier, salesperson, method, gross, cartDisc, tender: rand() });
  }
  raw.sort((a, b2) => a.at - b2.at);
  const seq = {};
  return raw.map((s) => {
    seq[s.c.code] = (seq[s.c.code] || 0) + 1;
    const id = `ORD-${date}-${s.c.code}-${pad(seq[s.c.code], 3)}`;
    const base = s.gross;
    const share = base ? (base - s.cartDisc) / base : 0;
    // the shelf price includes VAT (MRP): the customer pays the price, the VAT is inside it
    const tax = r2(s.lines.reduce((a, l) => a + vatOf(l.price * l.qty * share, vatRateFor(l.cat, VAT), true), 0));
    const total = r2(base - s.cartDisc);
    const taxable = r2(total - tax);
    const lines = s.lines.map((l, i) => ({
      id: 'L' + (i + 1), sku: l.sku, name: l.name, cat: l.cat, qty: l.qty, price: l.price, basePrice: l.price, disc: 0,
      // every phone sold is registered with its IMEI (a fixed number per sale and line)
      ...(l.cat === 'Phones' ? { serials: Array.from({ length: l.qty }, (_, k) => { const body = '35' + date.slice(2) + s.c.code.charCodeAt(0) % 10 + s.c.code[1] + pad(seq[s.c.code], 3) + k; return body.slice(0, 14) + luhn(body.slice(0, 14)); }) } : {}),
    }));
    // cash is handed over in notes: the change goes back from the drawer
    const given = s.method === 'Cash' ? Math.ceil(total / (total > 2000 ? 500 : 100)) * (total > 2000 ? 500 : 100) + (s.tender < 0.3 ? (total > 2000 ? 500 : 100) : 0) : total;
    const tenders = [{ method: s.method, amount: s.method === 'Cash' ? given : total, account: ACCOUNT[s.method], ...(s.method === 'Card' ? { via: 'Card machine' } : {}) }];
    return {
      id, orderId: id, live: true, wholesale: false, tier: '', atRetail: false, invoice: false, rev: 1, payments: [], at: s.at, lines,
      customer: s.customer, member: null, earned: 0,
      totals: { gross: r2(base), lineDisc: 0, cartDisc: s.cartDisc, couponDisc: 0, promo: null, memberDisc: 0, pointsUsed: 0, pointsDisc: 0, taxable, tax, total, vatIncluded: true, units: lines.reduce((a, l) => a + l.qty, 0) },
      coupon: '', tenders, change: s.method === 'Cash' ? r2(given - total) : 0, due: 0, creditBy: '', printed: true,
      cashier: s.cashier, salesperson: s.salesperson, counter: s.c.name, counterId: s.c.id, place: b.place, offline: false, returned: {}, stockOut: true, deliveries: [],
    };
  });
}

// days are made once, in order, from 1 October
const DAYS = [];
function daysUpTo(now) {
  const last = dayStart(now);
  let day = DAYS.length ? nextDay(DAYS[DAYS.length - 1].day) : LIVE_FROM;
  while (day <= last) {
    DAYS.push({ day, branches: BRANCHES.map((b) => ({ b, sales: makeBranchDay(day, b) })) });
    day = nextDay(day);
  }
  return DAYS.filter((d) => d.day <= last && d.day > last - LIVE_DAYS * DAY);
}

/** The counter sales rung up by `now`, newest first (POS sale shape, `live: true`). Empty on the server. */
export function liveCounterSales(now = nowMs()) {
  if (typeof window === 'undefined' || !(now >= LIVE_FROM)) return [];
  const out = [];
  daysUpTo(now).forEach((d) => d.branches.forEach((x) => x.sales.forEach((s) => { if (s.at <= now) out.push(s); })));
  return out.sort((a, b) => b.at - a.at);
}

/** The counter code in a sale number (ORD-<yyyymmdd>-<code>-<nnn>) of the demo counters: REG-01 → D1. */
export const LIVE_COUNTER_CODES = Object.fromEntries(BRANCHES.flatMap((b) => b.counters.map((c) => [c.id, c.code])));
/** How many sales the generated day has at one counter (the whole day, also the part still to come), so a sale
 *  rung up on the register takes the next number and never one a generated sale uses later the same day. */
export function liveDayCount(at, code) {
  if (typeof window === 'undefined' || !(at >= LIVE_FROM)) return 0;
  const day = dayStart(at);
  const d = daysUpTo(Math.max(at, day)).find((x) => x.day === day);
  if (!d) return 0;
  return d.branches.reduce((n, x) => n + x.sales.filter((s) => s.id.split('-')[2] === code).length, 0);
}

let BY_ID = { sig: '', map: null };
/** The generated sale behind an order (or sale) number, or null. */
export function liveSaleOf(id, now = nowMs()) {
  if (!/^ORD-\d{8}-[DM]\d-\d{3}$/.test(String(id || ''))) return null;
  const sig = Math.floor(now / 60000);
  if (BY_ID.sig !== sig) BY_ID = { sig, map: new Map(liveCounterSales(now).map((s) => [s.id, s])) };
  return BY_ID.map.get(id) || null;
}

/** One order per counter sale, in orders.js's shape (a paid, completed counter sale). */
export function liveCounterOrders(now = nowMs()) {
  return liveCounterSales(now).map((s) => ({
    id: s.id, at: s.at, channel: 'POS · ' + s.counter, customer: s.customer.name || 'Walk-in customer', phone: s.customer.phone ? phoneText(s.customer.phone) : '—',
    zone: 'Counter sale', address: '', lines: s.lines.map((l) => ({ name: l.name, sku: l.sku, qty: l.qty, price: l.price })), shipping: 0,
    courier: 'Store pickup', consignment: '—', status: 'Delivered', payment: 'Paid', total: s.totals.total, paid: s.totals.total, soldBy: s.cashier,
    ...(s.totals.cartDisc ? { discount: s.totals.cartDisc } : {}), ...(s.totals.tax ? { vat: s.totals.tax, vatIncluded: true } : {}),
    invoiceId: s.id, invoiceKind: 'Memo', source: '', live: true, method: s.tenders[0].method,
    times: { placed: s.at, approved: s.at, ready: null, shipped: null, delivered: s.at, returned: null, cancelled: null },
  }));
}

let LEDGER = { sig: '', rows: [] };
/**
 * The money the counters took, as ledger rows (ledger.js › getEntries merges them like the demo month):
 * per branch and day, one row per payment method at closing (cash net of change into the counter drawers,
 * bKash, Nagad, card), then the drawers emptied into the shop safe; card money is paid out to BRAC Bank the
 * next day at 3 PM less the card fee. Today's rows (before closing) show what was taken so far.
 */
export function liveCounterLedger(now = nowMs()) {
  // an edition without counters (Online) has no counter money
  if (typeof window === 'undefined' || !(now >= LIVE_FROM) || !editionChannels().includes('Retail')) return [];
  const sig = String(Math.floor(now / 60000));
  if (LEDGER.sig === sig) return LEDGER.rows;
  const rows = [];
  const row = (id, at, account, amount, kind, party, note, ref, extra = {}) => rows.push({ id, at, account, amount: r2(amount), kind, party, note, ref, by: 'System', seed: true, live: true, ...extra });
  daysUpTo(now).forEach((d) => {
    const date = ymd(d.day);
    const close = closeOf(d.day);
    const closed = close <= now;
    d.branches.forEach(({ b, sales }) => {
      const mine = sales.filter((s) => s.at <= now);
      if (!mine.length) return;
      const by = { Cash: 0, bKash: 0, Nagad: 0, Card: 0 };
      mine.forEach((s) => { const t = s.tenders[0]; by[t.method] += t.amount - (t.method === 'Cash' ? s.change : 0); });
      const at = closed ? close : mine[mine.length - 1].at;
      const ref = `Z-${date}-${b.key}`;
      const so = closed ? '' : ' · so far today';
      Object.keys(by).forEach((m) => { if (by[m] > 0) row(`LV-${ref}-${m}`, at, ACCOUNT[m], by[m], 'sale', 'Counter sales', `${m} · ${b.short} counters${so}`, ref); });
      if (closed && by.Cash > 0) {
        row(`LV-${ref}-pick-out`, close + 30 * 60000, 'drawer', -by.Cash, 'cash pickup', 'Counter drawers', `End of day pickup · ${b.short}`, ref);
        row(`LV-${ref}-pick-in`, close + 30 * 60000, 'safe', by.Cash, 'cash pickup', 'Counter drawers', `End of day pickup · ${b.short}`, ref);
      }
      const payAt = new Date(d.day).setHours(24 + 15, 0, 0, 0);
      if (by.Card > 0 && closed && payAt <= now) {
        const fee = r2(by.Card * CARD_FEE / 100);
        const ref2 = `card:${date}-${b.key}`;
        row(`LV-${ref}-card-paid`, payAt, 'card', -(by.Card - fee), 'settlement', 'BRAC Bank current', 'Paid out', ref2);
        row(`LV-${ref}-card-fee`, payAt, 'card', -fee, 'partner fee', 'Card payments', CARD_FEE + '%', ref2);
        row(`LV-${ref}-card-in`, payAt, 'brac', by.Card - fee, 'settlement', 'Card payments (POS)', `From the card machine · ${b.short}`, ref2);
      }
    });
  });
  LEDGER = { sig, rows: rows.sort((a, b) => b.at - a.at) };
  return LEDGER.rows;
}
