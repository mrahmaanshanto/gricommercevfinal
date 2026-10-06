// promotions — the one promotion engine (Nayeem's brief #9, "One Promotion Rule Engine"). Coupons, flash sales,
// automatic discounts, Buy X Get Y, quantity tiers, free gifts, free delivery and payment offers are all one kind of
// record, an offer, and one function decides what a cart gets: evaluate(cart, customer, channel). The POS register,
// Create order and the website checkout call it, so a code gives the same result everywhere. Coupons, Flash sales and
// Offers are views of getOffers().
//
// ---- the offer (rule) model ------------------------------------------------------------------------------------------
//   { id, name, code, activation, type, reward, conditions, channels, schedule, limits, stacking, status, ... }
//   activation  'code' (customer types it) · 'auto' (no code) · 'flash' (sale price for a time) · 'payment' (by payment)
//   type        'amount' ৳ off · 'percent' % off · 'free-delivery' · 'bxgy' Buy X Get Y · 'tiered' quantity tiers ·
//               'gift' free gift · 'price' flash price
//   reward      { value, cap }                                  amount / percent (cap = most ৳ off)
//               { buy: { skus, cats, qty }, get: { skus, cats, qty, pct } }    bxgy (pct 100 = free)
//               { brackets: [{ min, pct }] }                     tiered: pieces of the products in scope
//               { gift: { sku, name, qty, value } }              gift (added at ৳0, checked against stock)
//               { pct, prices: { sku: price } }                  flash price (pct off or a fixed price per SKU)
//               { cap }                                          free delivery (most ৳ off the delivery charge)
//   conditions  { minSpend, minQty, products: { mode: 'all'|'cats'|'skus', cats, skus },
//                 customer: 'all'|'first'|'tiers'|'one'|'members'|'segment', tiers: ['gold','plat'], customerKey,
//                 segment, payment: { mode: 'any'|'online'|'cod'|'split', methods: [], split: { method: pct } } }
//   channels    ['online', 'pos', 'wholesale']
//   schedule    { start, end (ms, end = null: no end), days: [0-6] | null, hours: [fromHour, toHour] | null }
//   limits      { total (uses; pieces for a flash sale), perCustomer, perOrder (times a bxgy repeats), budget (৳) }
//   stacking    { class: 'product'|'order'|'delivery'|'flash', with: [classes it may join], priority (higher first),
//                 exclusive (joins nothing) } — two offers join only when each allows the other's class.
//   status      'draft' | 'active' | 'paused' | 'archived' (what the merchant set); lifecycleOf() adds Scheduled,
//               Exhausted and Ended from the dates and the usage.
//
// ---- evaluate(cart, customer, channel) ---------------------------------------------------------------------------------
//   cart      { lines: [{ sku, name, price, qty, cat? }], delivery: ৳, payment: 'bkash'|'nagad'|'card'|'cod'|'cash'…,
//               codes: ['EID300'], at: ms, ref }
//   customer  { id?, phone?, tier? ('gold'), firstOrder? (bool), orders? (count), segments? [] } or null (guest)
//   channel   'online' | 'pos' | 'wholesale' (also 'Online' / 'Retail' / 'Wholesale')
//   returns   { subtotal, discount, deliveryDiscount, delivery, total, gifts: [{ sku, name, qty, value }],
//               lines: [{ sku, qty, price, amount, discount, net }],
//               applied:  [{ id, name, code, type, class, discount, delivery, gifts, label }],
//               eligible: [{ id, name, code, type, class, value }]           everything that qualified on its own,
//               skipped:  [{ id, name, code, reason }]                       did not qualify or lost the combination,
//               codeErrors: { CODE: reason }, hints: [{ id, text }] }        e.g. "Add 1 more to get 10% off"
//
// ---- usage: reserve → commit, or release; reverse on a return -----------------------------------------------------------
//   reserve(result, { ref, customer, ttlMin })  holds a limited offer's use for an open checkout (15 min by default)
//   commit(ref, result?)                        the order is placed / paid: the held uses become used (or are used now)
//   release(ref)                                the checkout was abandoned or payment failed: the holds go back
//   reverse(ref)                                the order was returned or cancelled after commit: the uses come back
// A limited coupon or flash slot is never used up just because a checkout started (brief #9, "limited usage").
//
// ---- for the POS register, Create order and the checkout --------------------------------------------------------------
//   applyCode(code, cart, customer, channel) → { ok, reason, result }   for a coupon box
//   evaluate(...).discount / deliveryDiscount / gifts                      what to take off the bill
//   commit(orderRef, result) when the sale is saved; reverse(orderRef) when it is returned.
// Front end only: offers and usage are kept in this browser (gc.promo.*). A real server would make reserve/commit
// atomic across devices; here one browser is the only writer.

import { clockNow } from './settlements';
import { productBy, stockAt } from './stock';
import { findMember } from './loyalty';
import { customerKey } from './customerRef';

const K = { offers: 'gc.promo.offers', edits: 'gc.promo.edits', usage: 'gc.promo.usage' };
export const PROMO_EVENT = 'gc:promo';
const DAY = 864e5;
const isBrowser = typeof window !== 'undefined';
const read = (key, fb) => { if (!isBrowser) return fb; try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fb : v; } catch { return fb; } };
const write = (key, v) => { try { window.localStorage.setItem(key, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(PROMO_EVENT)); } catch { /* full or private mode */ } };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dm = (t) => { const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const now = () => (isBrowser ? clockNow() : new Date(2026, 8, 18, 12).getTime());
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

// ---- words ------------------------------------------------------------------------------------------------------------
export const TYPES = {
  amount: 'Taka off', percent: '% off', 'free-delivery': 'Free delivery', bxgy: 'Buy X get Y', tiered: 'Quantity discount', gift: 'Free gift', price: 'Flash price',
};
export const ACTIVATIONS = { code: 'Coupon', auto: 'Automatic', flash: 'Flash sale', payment: 'Payment offer' };
export const CLASSES = { product: 'Product offers', order: 'Order discounts', delivery: 'Delivery offers', flash: 'Flash prices', points: 'Points' };
export const CHANNEL_LABEL = { online: 'Website', pos: 'POS', wholesale: 'Wholesale' };
export const LIFECYCLE = ['Draft', 'Scheduled', 'Active', 'Paused', 'Exhausted', 'Ended', 'Archived'];
export const LIFE_TONE = { Draft: 'neutral', Scheduled: 'info', Active: 'success', Paused: 'warning', Exhausted: 'neutral', Ended: 'neutral', Archived: 'neutral' };
/** What kind of offer it is, in the merchant's words. */
export function kindLabel(o) {
  if (o.activation === 'flash') return 'Flash sale';
  if (o.activation === 'payment') return 'Payment offer';
  if (o.type === 'bxgy') return 'Buy X get Y';
  if (o.type === 'tiered') return 'Quantity discount';
  if (o.type === 'gift') return 'Free gift';
  if (o.activation === 'code') return 'Coupon';
  return 'Automatic';
}
const normChannel = (c) => ({ online: 'online', web: 'online', website: 'online', retail: 'pos', pos: 'pos', counter: 'pos', wholesale: 'wholesale' }[String(c || '').toLowerCase()] || 'online');

// ---- demo offers (dates follow today, so running offers stay running) --------------------------------------------------
const ALL = { mode: 'all' };
const O = (id, more) => ({
  id, name: '', code: '', activation: 'code', type: 'amount', reward: {}, channels: ['online', 'pos'], status: 'active', usedBefore: 0, salesBefore: 0, discountBefore: 0,
  ...more,
  conditions: { minSpend: 0, minQty: 0, products: ALL, customer: 'all', payment: { mode: 'any' }, ...(more.conditions || {}) },
  limits: { total: 0, perCustomer: 0, perOrder: 0, budget: 0, ...(more.limits || {}) },
  stacking: { class: 'order', with: ['product', 'delivery', 'points'], priority: 10, exclusive: false, ...(more.stacking || {}) },
  sched: more.sched || null, schedule: more.schedule || null,
});
// sched: [fromDay, toDay] relative to today (toDay null = no end), or absolute schedule
function seedOffers(today) {
  const S = (from, to, h1 = 0, h2 = null) => ({ start: today + from * DAY + h1 * 36e5, end: to == null ? null : today + to * DAY + (h2 == null ? DAY - 60000 : h2 * 36e5), days: null, hours: null });
  const hr = new Date(now()); hr.setMinutes(0, 0, 0);
  return [
    // coupons (were three code sets: the Coupons list, the POS register and the checkout)
    O('PR-EID300', { name: 'EID300 — ৳300 off', code: 'EID300', type: 'amount', reward: { value: 300 }, conditions: { minSpend: 2000 }, stacking: { class: 'order', with: ['product', 'order', 'delivery', 'points'] }, schedule: S(-13, 2), limits: { total: 500, perCustomer: 1 }, usedBefore: 318, salesBefore: 96400, discountBefore: 95400 }),
    O('PR-FIRST20', { name: 'FIRST20 — 20% off', code: 'FIRST20', type: 'percent', reward: { value: 20, cap: 400 }, channels: ['online'], conditions: { customer: 'first' }, schedule: S(-17, 12), limits: { perCustomer: 1 }, usedBefore: 140, salesBefore: 73700, discountBefore: 41200 }),
    O('PR-SKIN15', { name: 'CASE15 — 15% off accessories', code: 'CASE15', type: 'percent', reward: { value: 15 }, conditions: { products: { mode: 'cats', cats: ['Accessories'] } }, stacking: { class: 'product', with: ['order', 'delivery', 'points'] }, schedule: S(-8, 7), limits: { total: 300 }, usedBefore: 96, salesBefore: 31200, discountBefore: 4680 }),
    O('PR-GOLD500', { name: 'GOLD500 — ৳500 off', code: 'GOLD500', type: 'amount', reward: { value: 500 }, conditions: { minSpend: 5000, customer: 'tiers', tiers: ['gold', 'plat'] }, schedule: S(-17, 12), limits: { total: 150, perCustomer: 1 }, usedBefore: 22, salesBefore: 13500, discountBefore: 11000 }),
    O('PR-PUJA10', { name: 'PUJA10 — 10% off', code: 'PUJA10', type: 'percent', reward: { value: 10, cap: 250 }, schedule: S(7, 17), limits: { total: 1000 } }),
    O('PR-FREESHIP', { name: 'FREESHIP — free delivery', code: 'FREESHIP', type: 'free-delivery', reward: {}, channels: ['online'], conditions: { minSpend: 1500 }, stacking: { class: 'delivery', with: ['product', 'order', 'flash', 'points'] }, schedule: S(-10, -4), usedBefore: 211, salesBefore: 58900, discountBefore: 16880 }),
    O('PR-SORRY100', { name: 'SORRY100 — ৳100 off', code: 'SORRY100', type: 'amount', reward: { value: 100 }, schedule: { start: today - 60 * DAY, end: null }, limits: { total: 20, perCustomer: 1 }, status: 'paused', pauseReason: 'Turned off', usedBefore: 4, salesBefore: 5200, discountBefore: 400 }),
    O('PR-EIDSAVE10', { name: 'EIDSAVE10 — 10% off', code: 'EIDSAVE10', type: 'percent', reward: { value: 10, cap: 150 }, channels: ['pos'], schedule: { start: today - 30 * DAY, end: null }, usedBefore: 57, salesBefore: 48200, discountBefore: 4100 }),
    O('PR-WELCOME50', { name: 'WELCOME50 — ৳50 off', code: 'WELCOME50', type: 'amount', reward: { value: 50 }, channels: ['pos'], schedule: { start: today - 30 * DAY, end: null }, usedBefore: 33, salesBefore: 21400, discountBefore: 1650 }),
    // payment offer (was hard-coded at the checkout)
    O('PR-BKASH10', { name: 'bKash 10% off', activation: 'payment', type: 'percent', reward: { value: 10, cap: 150 }, channels: ['online'], conditions: { minSpend: 500, payment: { mode: 'online', methods: ['bkash'] } }, stacking: { class: 'order', with: ['order', 'delivery', 'product', 'flash', 'points'], priority: 5 }, schedule: S(-20, 10), usedBefore: 402, salesBefore: 184300, discountBefore: 38900 }),
    // automatic offers (no code)
    O('PR-AUTO-DHAKA', { name: 'Free delivery over ৳2,500', activation: 'auto', type: 'free-delivery', reward: {}, channels: ['online'], conditions: { minSpend: 2500 }, stacking: { class: 'delivery', with: ['product', 'order', 'flash', 'points'] }, schedule: S(-5, 25), usedBefore: 86, salesBefore: 301200, discountBefore: 6020 }),
    O('PR-BXGY-TONER', { name: 'Buy 2 chargers, get earphones 50% off', activation: 'auto', type: 'bxgy', reward: { buy: { skus: ['AC-CHG-20'], qty: 2 }, get: { skus: ['AU-EAR-TC'], qty: 1, pct: 50 } }, conditions: {}, limits: { perOrder: 2 }, stacking: { class: 'product', with: ['product', 'order', 'delivery', 'points'] }, schedule: S(-3, 11), usedBefore: 19, salesBefore: 56400, discountBefore: 9400 }),
    O('PR-TIER-GROCERY', { name: 'Accessories: 3–5 pieces 5% off, 6+ 10% off', activation: 'auto', type: 'tiered', reward: { brackets: [{ min: 3, pct: 5 }, { min: 6, pct: 10 }] }, conditions: { products: { mode: 'cats', cats: ['Accessories'] } }, stacking: { class: 'product', with: ['product', 'order', 'delivery', 'points'] }, schedule: S(-6, 20), usedBefore: 64, salesBefore: 72800, discountBefore: 4900 }),
    O('PR-GIFT-PHONE', { name: 'Buy a phone, get a phone stand free', activation: 'auto', type: 'gift', reward: { gift: { sku: 'AC-STD-FLD', name: 'Foldable Phone Stand', qty: 1, value: 650 } }, conditions: { products: { mode: 'skus', skus: ['PH-RLM-N50'] }, minQty: 1 }, limits: { total: 50 }, stacking: { class: 'product', with: ['order', 'delivery', 'flash', 'points'] }, schedule: S(-2, 14), usedBefore: 7, salesBefore: 104900, discountBefore: 4550 }),
    // flash sales (Flash sales is a view of these)
    O('PR-FS-MEGA', { name: 'Weekend Mega Sale', sub: '12 products · up to 40% off', activation: 'flash', type: 'price', reward: { pct: 25 }, conditions: { products: { mode: 'skus', skus: ['AC-CSE-A55', 'AC-HLD-CAR', 'WR-BND-08', 'AU-EAR-PRO', 'PB-ANK-10K'] } }, limits: { total: 300, perCustomer: 2 }, stacking: { class: 'flash', with: ['delivery', 'points'], priority: 30 }, schedule: { start: dayStart(now()) - DAY + 18 * 36e5, end: dayStart(now()) + 3 * DAY - 60000, days: null, hours: null }, featured: true, usedBefore: 184, salesBefore: 142300, discountBefore: 35600 }),
    O('PR-FS-NIGHT', { name: 'Night Deals', sub: '6 products · 25% off', activation: 'flash', type: 'price', reward: { pct: 25 }, conditions: { products: { mode: 'skus', skus: ['AC-CBL-LTG', 'AC-STD-FLD'] } }, limits: { total: 120, perCustomer: 2 }, stacking: { class: 'flash', with: ['delivery', 'points'], priority: 30 }, schedule: { start: hr.getTime() - 2 * 36e5, end: hr.getTime() + 4 * 36e5, days: null, hours: null }, usedBefore: 38, salesBefore: 44600, discountBefore: 11150 }),
    O('PR-FS-SKIN', { name: 'Audio week', sub: '8 products · 25% off', activation: 'flash', type: 'price', reward: { pct: 25 }, conditions: { products: { mode: 'cats', cats: ['Audio'] } }, limits: { total: 200, perCustomer: 2 }, stacking: { class: 'flash', with: ['delivery', 'points'], priority: 30 }, schedule: S(3, 9, 10), featured: true }),
    O('PR-FS-PUJA', { name: 'Puja Special', sub: '15 products · up to 30% off', activation: 'flash', type: 'price', reward: { pct: 30 }, conditions: { products: { mode: 'cats', cats: ['Accessories', 'Wearables'] } }, limits: { total: 450, perCustomer: 2 }, stacking: { class: 'flash', with: ['delivery', 'points'], priority: 30 }, schedule: S(19, 24) }),
    O('PR-FS-MONTHEND', { name: 'Month-end Clearance', sub: '20 products · up to 50% off', activation: 'flash', type: 'price', reward: { pct: 40 }, conditions: { products: { mode: 'cats', cats: ['Accessories'] } }, limits: { total: 450 }, stacking: { class: 'flash', with: ['delivery'], priority: 30 }, schedule: { start: new Date(2026, 7, 28).getTime(), end: new Date(2026, 7, 31, 23, 59).getTime() }, usedBefore: 402, salesBefore: 198400, discountBefore: 99200 }),
    O('PR-FS-INDEP', { name: 'Independence Day Deals', sub: '10 products · 16% off', activation: 'flash', type: 'price', reward: { pct: 16 }, conditions: { products: { mode: 'cats', cats: ['Phones'] } }, limits: { total: 250 }, stacking: { class: 'flash', with: ['delivery'], priority: 30 }, schedule: { start: new Date(2026, 7, 15).getTime(), end: new Date(2026, 7, 17, 23, 59).getTime() }, usedBefore: 215, salesBefore: 87100, discountBefore: 16590 }),
  ];
}

// ---- reading and saving offers ----------------------------------------------------------------------------------------
/** Every offer: the ones made in this browser first, then the demo ones (with the merchant's changes). */
export function getOffers(at = now()) {
  const today = dayStart(at);
  const edits = read(K.edits, {});
  const mine = read(K.offers, []);
  const seeds = seedOffers(today).map((o) => (edits[o.id] ? { ...o, ...edits[o.id] } : o));
  return [...mine.map((o) => (edits[o.id] ? { ...o, ...edits[o.id] } : o)), ...seeds].map((o) => O(o.id, o));
}
export const offerBy = (id, list = getOffers()) => list.find((o) => o.id === id) || null;
export const offerByCode = (code, list = getOffers()) => { const c = String(code || '').trim().toUpperCase(); return c ? list.find((o) => o.code && o.code.toUpperCase() === c && o.status !== 'archived') || null : null; };

/** Save a new offer or a change to one. Returns { offer } or { error }. A code must be unique among live offers. */
export function saveOffer(input, by = 'Shanto') {
  const o = O(input.id || 'PR-' + Date.now().toString(36).toUpperCase(), { ...input, conditions: input.conditions || {}, limits: input.limits || {}, stacking: input.stacking || {} });
  if (o.activation === 'code') {
    o.code = String(o.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(o.code)) return { error: 'Use 3 to 20 letters or numbers, with no spaces or symbols.' };
    const clash = getOffers().find((x) => x.id !== o.id && x.code === o.code && x.status !== 'archived' && lifecycleOf(x) !== 'Ended');
    if (clash) return { error: `${o.code} is already used by another offer.` };
  } else o.code = '';
  if (!o.name) o.name = describe(o);
  const mine = read(K.offers, []);
  const isSeed = !mine.some((x) => x.id === o.id) && seedOffers(dayStart(now())).some((x) => x.id === o.id);
  if (isSeed) { const edits = read(K.edits, {}); edits[o.id] = { ...(edits[o.id] || {}), ...input, updatedAt: Date.now(), by }; write(K.edits, edits); }
  else write(K.offers, [{ ...o, createdAt: o.createdAt || Date.now(), by }, ...mine.filter((x) => x.id !== o.id)]);
  return { offer: offerBy(o.id) || o };
}
/** Change an offer's merchant status: 'active' | 'paused' | 'archived' | 'draft' (with a reason when pausing). */
export function setOfferStatus(id, status, reason = '') {
  const mine = read(K.offers, []);
  if (mine.some((x) => x.id === id)) write(K.offers, mine.map((x) => (x.id === id ? { ...x, status, pauseReason: status === 'paused' ? reason || 'Turned off' : '' } : x)));
  else { const edits = read(K.edits, {}); edits[id] = { ...(edits[id] || {}), status, pauseReason: status === 'paused' ? reason || 'Turned off' : '' }; write(K.edits, edits); }
}

/** One plain line for what the offer gives. */
export function describe(o) {
  const r = o.reward || {};
  const min = o.conditions && o.conditions.minSpend ? ` on ${tk(o.conditions.minSpend)}+` : '';
  switch (o.type) {
    case 'amount': return `${tk(r.value)} off${min}`;
    case 'percent': return `${r.value}% off${r.cap ? ', up to ' + tk(r.cap) : ''}${min}`;
    case 'free-delivery': return `Free delivery${min}`;
    case 'bxgy': return `Buy ${(r.buy || {}).qty || 1}, get ${(r.get || {}).qty || 1} ${(r.get || {}).pct >= 100 ? 'free' : ((r.get || {}).pct || 0) + '% off'}`;
    case 'tiered': return (r.brackets || []).map((b) => `${b.min}+ pieces ${b.pct}% off`).join(' · ');
    case 'gift': return `Free ${(r.gift || {}).name || 'gift'}${min}`;
    case 'price': return r.prices ? 'Sale prices' : `${r.pct}% off`;
    default: return '';
  }
}

// ---- usage ------------------------------------------------------------------------------------------------------------
const getUsage = () => read(K.usage, []);
const saveUsage = (rows) => write(K.usage, rows.slice(0, 5000));
const liveHold = (u, t) => u.state === 'reserved' && u.expires > t;
/** Uses of one offer: { used (committed, incl. before this browser), reserved (open checkouts), discount, sales }. */
export function usageOf(o, t = now(), rows = getUsage()) {
  const mine = rows.filter((u) => u.offerId === o.id);
  const used = (o.usedBefore || 0) + mine.filter((u) => u.state === 'committed').reduce((a, u) => a + (u.units || 1), 0);
  const reserved = mine.filter((u) => liveHold(u, t)).reduce((a, u) => a + (u.units || 1), 0);
  const discount = r2((o.discountBefore || 0) + mine.filter((u) => u.state === 'committed').reduce((a, u) => a + (u.discount || 0), 0));
  const sales = r2((o.salesBefore || 0) + mine.filter((u) => u.state === 'committed').reduce((a, u) => a + (u.sales || 0), 0));
  return { used, reserved, discount, sales };
}
const usedBy = (o, key, t, rows) => (key ? rows.filter((u) => u.offerId === o.id && u.customer === key && (u.state === 'committed' || liveHold(u, t))).length : 0);

/** Where an offer is in its life: Draft · Scheduled · Active · Paused · Exhausted · Ended · Archived. */
export function lifecycleOf(o, t = now(), rows = getUsage()) {
  if (o.status === 'archived') return 'Archived';
  if (o.status === 'draft') return 'Draft';
  const sch = o.schedule || {};
  if (sch.end && t > sch.end) return 'Ended';
  if (o.status === 'paused') return 'Paused';
  if (sch.start && t < sch.start) return 'Scheduled';
  const u = usageOf(o, t, rows);
  if (o.limits.total && u.used >= o.limits.total) return 'Exhausted';
  if (o.limits.budget && u.discount >= o.limits.budget) return 'Exhausted';
  return 'Active';
}
/** Is it on at this moment (dates, weekdays, hours)? */
function inSchedule(o, t) {
  const sch = o.schedule || {};
  if (sch.start && t < sch.start) return { ok: false, reason: 'Starts ' + dm(sch.start) };
  if (sch.end && t > sch.end) return { ok: false, reason: 'Ended' };
  const d = new Date(t);
  if (sch.days && sch.days.length && !sch.days.includes(d.getDay())) return { ok: false, reason: 'Not on this day' };
  if (sch.hours && sch.hours.length === 2) { const h = d.getHours(); const [a, b] = sch.hours; const inside = a <= b ? h >= a && h < b : h >= a || h < b; if (!inside) return { ok: false, reason: `Only ${a}:00–${b}:00` }; }
  return { ok: true };
}

// ---- evaluate ----------------------------------------------------------------------------------------------------------
const catOf = (line) => line.cat || ((productBy(line.sku) || {}).cat) || '';
const inScope = (o, line) => {
  const p = (o.conditions && o.conditions.products) || ALL;
  if (p.mode === 'cats') return (p.cats || []).includes(catOf(line));
  if (p.mode === 'skus') return (p.skus || []).includes(line.sku);
  return true;
};
const inSet = (set, line) => !!set && (((set.skus || []).includes(line.sku)) || ((set.cats || []).includes(catOf(line))));
function tierOfCustomer(c) {
  if (!c) return '';
  if (c.tier) return String(c.tier).toLowerCase().replace('platinum', 'plat');
  const m = c.phone ? findMember(c.phone) : null;
  return m ? m.tier : '';
}
const TIER_WORDS = { member: 'Member', silver: 'Silver', gold: 'Gold', plat: 'Platinum' };
const PAY_WORDS = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', card: 'card', wallet: 'store credit', cod: 'cash on delivery', cash: 'cash' };
const normPay = (p) => { const k = String(p || '').toLowerCase().replace(/\s+/g, ''); return k === 'cashondelivery' ? 'cod' : k; };

/** Who may use it: { ok, reason }. */
function customerOk(o, c, key, t, rows) {
  const cd = o.conditions;
  if (cd.customer === 'first') {
    if (!c) return { ok: false, reason: 'Only for a first order. Add the customer.' };
    const first = c.firstOrder != null ? !!c.firstOrder : c.orders != null ? c.orders === 0 : !(findMember(c.phone || '') || {}).bought;
    if (!first) return { ok: false, reason: 'Only for a first order' };
  }
  if (cd.customer === 'tiers') { const tier = tierOfCustomer(c); if (!(cd.tiers || []).includes(tier)) return { ok: false, reason: 'Only for ' + (cd.tiers || []).map((x) => TIER_WORDS[x] || x).join(' and ') + ' members' }; }
  if (cd.customer === 'members' && !tierOfCustomer(c)) return { ok: false, reason: 'Only for members' };
  if (cd.customer === 'one' && (!key || key !== cd.customerKey)) return { ok: false, reason: 'Only for one customer' };
  if (cd.customer === 'segment' && !((c && c.segments) || []).includes(cd.segment)) return { ok: false, reason: 'Not in this customer group' };
  if (o.limits.perCustomer && key && usedBy(o, key, t, rows) >= o.limits.perCustomer) return { ok: false, reason: 'Already used by this customer' };
  return { ok: true };
}

/** What one offer gives this cart on its own (lines already reduced by earlier offers). */
function valueOf(o, ctx) {
  const r = o.reward || {};
  const scoped = ctx.lines.filter((l) => inScope(o, l));
  const base = scoped.reduce((a, l) => a + l.net, 0);
  const qty = scoped.reduce((a, l) => a + l.qty, 0);
  const out = { discount: 0, delivery: 0, gifts: [], perLine: {}, hint: '' };
  const spread = (amount, lines) => { const tot = lines.reduce((a, l) => a + l.net, 0); let left = amount; lines.forEach((l, i) => { const part = i === lines.length - 1 ? left : r2(amount * (l.net / (tot || 1))); out.perLine[l.sku] = r2((out.perLine[l.sku] || 0) + part); left = r2(left - part); }); };
  if (o.type === 'percent' || o.type === 'amount') {
    let pct = r.value;
    if (o.conditions.payment && o.conditions.payment.mode === 'split') pct = (o.conditions.payment.split || {})[ctx.pay] || 0;
    let d = o.type === 'percent' ? r2(base * pct / 100) : Math.min(r.value, base);
    if (r.cap) d = Math.min(d, r.cap);
    out.discount = r2(Math.max(0, d));
    spread(out.discount, scoped);
  } else if (o.type === 'free-delivery') {
    out.delivery = r2(Math.min(ctx.delivery, r.cap || ctx.delivery));
    if (!ctx.delivery) out.hint = 'No delivery charge to take off';
  } else if (o.type === 'tiered') {
    const br = [...(r.brackets || [])].sort((a, b) => b.min - a.min).find((b) => qty >= b.min);
    const next = [...(r.brackets || [])].sort((a, b) => a.min - b.min).find((b) => qty < b.min);
    if (next) out.hint = `Add ${next.min - qty} more to get ${next.pct}% off`;
    if (br) { out.discount = r2(base * br.pct / 100); spread(out.discount, scoped); out.label = `${br.pct}% off ${qty} pieces`; }
  } else if (o.type === 'bxgy') {
    const buy = r.buy || {}, get = r.get || {};
    const buyLines = ctx.lines.filter((l) => inSet(buy, l));
    const getLines = ctx.lines.filter((l) => inSet(get, l));
    const same = buyLines.length && getLines.length && buyLines.every((l) => getLines.includes(l));
    const bq = buyLines.reduce((a, l) => a + l.qty, 0);
    let times = same ? Math.floor(bq / ((buy.qty || 1) + (get.qty || 1))) : Math.floor(bq / (buy.qty || 1));
    if (o.limits.perOrder) times = Math.min(times, o.limits.perOrder);
    if (!times) { out.hint = `Buy ${(buy.qty || 1) - (bq % (buy.qty || 1))} more to get the offer`; return out; }
    let free = times * (get.qty || 1);
    const units = [];
    getLines.forEach((l) => { for (let i = 0; i < l.qty; i += 1) units.push(l); });
    units.sort((a, b) => a.unit - b.unit);
    if (!units.length) { out.hint = `Add ${free} of the reward item to get it ${get.pct >= 100 ? 'free' : get.pct + '% off'}`; return out; }
    units.slice(0, free).forEach((l) => { const d = r2(l.unit * (get.pct || 100) / 100); out.perLine[l.sku] = r2((out.perLine[l.sku] || 0) + d); out.discount = r2(out.discount + d); });
    free = Math.min(free, units.length);
    out.label = `${free} × ${get.pct >= 100 ? 'free' : get.pct + '% off'}`;
  } else if (o.type === 'gift') {
    const g = r.gift || {};
    const st = isBrowser && g.sku ? stockAt(g.sku) : { available: 99 };
    if (st.available < (g.qty || 1)) { out.hint = 'Gift out of stock'; out.noStock = true; return out; }
    out.gifts.push({ sku: g.sku, name: g.name, qty: g.qty || 1, value: r2((g.value || 0) * (g.qty || 1)), offerId: o.id });
  } else if (o.type === 'price') {
    scoped.forEach((l) => {
      const target = r.prices && r.prices[l.sku] != null ? r.prices[l.sku] : r2(l.unit * (100 - (r.pct || 0)) / 100);
      const d = r2(Math.max(0, l.unit - target) * l.qty);
      if (d > 0) { out.perLine[l.sku] = r2((out.perLine[l.sku] || 0) + d); out.discount = r2(out.discount + d); }
    });
  }
  return out;
}
const value = (v) => v.discount + v.delivery + v.gifts.reduce((a, g) => a + g.value, 0);
const joins = (a, b) => {
  if (a.stacking.exclusive || b.stacking.exclusive) return false;
  return (a.stacking.with || []).includes(b.stacking.class) && (b.stacking.with || []).includes(a.stacking.class);
};
const CLASS_ORDER = { flash: 0, product: 1, order: 2, delivery: 3 };

/** What a cart gets: every offer checked, the best set that may combine applied, and why the others were not. */
export function evaluate(cart = {}, customer = null, channel = 'online', { offers = getOffers(), at } = {}) {
  const t = at || cart.at || now();
  const ch = normChannel(channel);
  const rows = getUsage();
  const key = customerKey(customer);
  const pay = normPay(cart.payment);
  const codes = (cart.codes || []).map((c) => String(c || '').trim().toUpperCase()).filter(Boolean);
  const lines = (cart.lines || []).filter((l) => l && l.qty > 0).map((l) => ({ sku: l.sku, name: l.name, cat: l.cat, qty: Number(l.qty) || 0, unit: Number(l.price) || 0, amount: r2((Number(l.price) || 0) * (Number(l.qty) || 0)) }))
    .map((l) => ({ ...l, net: l.amount }));
  const subtotal = r2(lines.reduce((a, l) => a + l.amount, 0));
  const delivery = Number(cart.delivery) || 0;
  const skipped = [], eligible = [], hints = [], codeErrors = {};
  const skip = (o, reason) => { skipped.push({ id: o.id, name: o.name, code: o.code, reason }); if (o.code && codes.includes(o.code)) codeErrors[o.code] = reason; };
  codes.forEach((c) => { if (!offers.some((o) => o.code === c)) codeErrors[c] = 'That code isn’t valid'; });

  // 1. which offers are in play and qualify on their own
  const candidates = [];
  offers.forEach((o) => {
    const typed = o.activation === 'code' && codes.includes(o.code);
    if (o.activation === 'code' && !typed) return;
    const life = lifecycleOf(o, t, rows);
    if (life !== 'Active') { if (typed) skip(o, life === 'Scheduled' ? 'Starts ' + dm(o.schedule.start) : life === 'Exhausted' ? 'Used up' : life === 'Paused' ? 'Turned off' : life); return; }
    const sc = inSchedule(o, t); if (!sc.ok) { if (typed) skip(o, sc.reason); return; }
    if (!(o.channels || []).includes(ch)) { if (typed || o.activation !== 'flash') skip(o, ch === 'pos' ? 'Not for the POS counter' : ch === 'online' ? 'Not for the website' : 'Not for wholesale'); return; }
    if (!lines.some((l) => inScope(o, l)) && o.type !== 'free-delivery') { if (typed) skip(o, 'No products in the cart get it'); return; }
    const scopedBase = lines.filter((l) => inScope(o, l)).reduce((a, l) => a + l.amount, 0);
    if (o.conditions.minSpend && scopedBase < o.conditions.minSpend) { skip(o, `Needs ${tk(o.conditions.minSpend - scopedBase)} more`); if (o.activation === 'auto' || typed) hints.push({ id: o.id, text: `Add ${tk(o.conditions.minSpend - scopedBase)} more for ${describe(o).replace(/ on ৳.*$/, '')}` }); return; }
    const scopedQty = lines.filter((l) => inScope(o, l)).reduce((a, l) => a + l.qty, 0);
    if (o.conditions.minQty && scopedQty < o.conditions.minQty) { skip(o, `Needs ${o.conditions.minQty} pieces`); return; }
    const pm = o.conditions.payment || { mode: 'any' };
    if (pm.mode === 'online' && !(pm.methods || []).includes(pay)) { skip(o, pay ? 'Pay by ' + (pm.methods || []).map((m) => PAY_WORDS[m] || m).join(' or ') + ' to get it' : 'Choose the payment to get it'); return; }
    if (pm.mode === 'cod' && pay !== 'cod') { skip(o, 'Only for cash on delivery'); return; }
    if (pm.mode === 'split' && !((pm.split || {})[pay] > 0)) { skip(o, 'No discount for this payment'); return; }
    const who = customerOk(o, customer, key, t, rows); if (!who.ok) { skip(o, who.reason); return; }
    const remaining = o.limits.total ? o.limits.total - usageOf(o, t, rows).used - usageOf(o, t, rows).reserved : Infinity;
    if (remaining <= 0) { skip(o, 'Used up'); return; }
    const alone = valueOf(o, { lines, delivery, pay });
    if (alone.hint) hints.push({ id: o.id, text: alone.hint });
    if (!(value(alone) > 0)) { skip(o, alone.noStock ? 'Gift out of stock' : alone.hint || 'Nothing to take off'); return; }
    eligible.push({ id: o.id, name: o.name, code: o.code, type: o.type, class: o.stacking.class, value: r2(value(alone)) });
    candidates.push({ o, alone });
  });

  // 2. pick: flash prices first, then product, order and delivery offers; within a class the higher priority and the
  //    bigger value first. An offer joins only when it may combine with every offer already applied.
  candidates.sort((a, b) => (CLASS_ORDER[a.o.stacking.class] ?? 9) - (CLASS_ORDER[b.o.stacking.class] ?? 9) || (b.o.stacking.priority || 0) - (a.o.stacking.priority || 0) || value(b.alone) - value(a.alone));
  const applied = [];
  let delOff = 0;
  const gifts = [];
  candidates.forEach(({ o }) => {
    const clash = applied.find((a) => !joins(a.o, o));
    if (clash) { skip(o, `Can’t join ${clash.o.name}`); return; }
    const v = valueOf(o, { lines, delivery: Math.max(0, delivery - delOff), pay });
    if (!(value(v) > 0)) { skip(o, 'Nothing left to take off'); return; }
    Object.entries(v.perLine).forEach(([sku, d]) => { let left = d; lines.filter((l) => l.sku === sku).forEach((l) => { const take = Math.min(left, l.net); l.net = r2(l.net - take); left = r2(left - take); }); });
    delOff = r2(delOff + v.delivery);
    v.gifts.forEach((g) => gifts.push(g));
    applied.push({ o, v });
  });
  const discount = r2(lines.reduce((a, l) => a + (l.amount - l.net), 0));
  return {
    subtotal, discount, delivery, deliveryDiscount: delOff, gifts, total: r2(subtotal - discount + delivery - delOff), channel: ch, customerKey: key,
    lines: lines.map((l) => ({ sku: l.sku, name: l.name, qty: l.qty, price: l.unit, amount: l.amount, discount: r2(l.amount - l.net), net: l.net })),
    applied: applied.map(({ o, v }) => ({ id: o.id, name: o.name, code: o.code, type: o.type, kind: kindLabel(o), class: o.stacking.class, discount: v.discount, delivery: v.delivery, gifts: v.gifts, label: v.label || describe(o), units: o.activation === 'flash' ? lines.filter((l) => inScope(o, l)).reduce((a, l) => a + l.qty, 0) : 1 })),
    eligible, skipped, codeErrors, hints: hints.filter((h, i, all) => all.findIndex((x) => x.id === h.id) === i && !applied.some((a) => a.o.id === h.id && !/more to get/.test(h.text))),
  };
}

/** For a coupon box: try one code on this cart. { ok, reason, result } — reason says why it did not apply. */
export function applyCode(code, cart = {}, customer = null, channel = 'online', opts = {}) {
  const c = String(code || '').trim().toUpperCase();
  if (!c) return { ok: false, reason: 'Enter a coupon code.' };
  const result = evaluate({ ...cart, codes: [...(cart.codes || []).filter((x) => String(x).toUpperCase() !== c), c] }, customer, channel, opts);
  const hit = result.applied.find((a) => a.code === c);
  if (hit) return { ok: true, reason: '', result, offer: hit };
  return { ok: false, reason: result.codeErrors[c] || 'That code isn’t valid', result };
}

// ---- reserve · commit · release · reverse ------------------------------------------------------------------------------
/** Hold the limited offers a result applied for an open checkout. { ok, holds, failed } */
export function reserve(result, { ref, customer, ttlMin = 15 } = {}) {
  if (!result || !ref) return { ok: false, holds: [], failed: [] };
  const t = now();
  let rows = getUsage().filter((u) => !(u.ref === ref && u.state === 'reserved'));   // a new try replaces its own holds
  const key = customerKey(customer) || result.customerKey || '';
  const holds = [], failed = [];
  result.applied.forEach((a) => {
    const o = offerBy(a.id);
    if (!o) return;
    const u = usageOf(o, t, rows);
    if (o.limits.total && u.used + u.reserved + (a.units || 1) > o.limits.total) { failed.push({ id: o.id, reason: 'Used up' }); return; }
    const row = { id: 'PU-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), offerId: o.id, code: o.code, ref, customer: key, state: 'reserved', at: t, expires: t + ttlMin * 60000, units: a.units || 1, discount: r2(a.discount + a.delivery + a.gifts.reduce((s, g) => s + g.value, 0)), sales: result.total };
    rows = [row, ...rows];
    holds.push(row.id);
  });
  saveUsage(rows);
  return { ok: !failed.length, holds, failed };
}
/** The order went through: its holds become uses. Without holds (a POS sale), pass the result to use them now. */
export function commit(ref, result = null, { customer } = {}) {
  if (!ref) return { count: 0 };
  const t = now();
  let rows = getUsage();
  if (rows.some((u) => u.ref === ref && u.state === 'committed')) return { count: 0, duplicate: true };   // the same order twice
  const held = rows.filter((u) => u.ref === ref && u.state === 'reserved');
  if (held.length) rows = rows.map((u) => (u.ref === ref && u.state === 'reserved' ? { ...u, state: 'committed', doneAt: t } : u));
  else if (result) {
    const key = customerKey(customer) || result.customerKey || '';
    rows = [...result.applied.map((a) => ({ id: 'PU-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), offerId: a.id, code: a.code, ref, customer: key, state: 'committed', at: t, doneAt: t, units: a.units || 1, discount: r2(a.discount + a.delivery + a.gifts.reduce((s, g) => s + g.value, 0)), sales: result.total })), ...rows];
  }
  saveUsage(rows);
  return { count: held.length || (result ? result.applied.length : 0) };
}
/** The checkout was abandoned or the payment failed: give the held uses back. */
export function release(ref) {
  const rows = getUsage();
  const n = rows.filter((u) => u.ref === ref && u.state === 'reserved').length;
  if (n) saveUsage(rows.map((u) => (u.ref === ref && u.state === 'reserved' ? { ...u, state: 'released', doneAt: now() } : u)));
  return { count: n };
}
/** The order was returned or cancelled: its uses come back (the offer can be used again). */
export function reverse(ref, reason = 'Returned') {
  const rows = getUsage();
  const n = rows.filter((u) => u.ref === ref && u.state === 'committed').length;
  if (n) saveUsage(rows.map((u) => (u.ref === ref && u.state === 'committed' ? { ...u, state: 'reversed', reason, doneAt: now() } : u)));
  return { count: n };
}
/** Usage rows of one offer (newest first), for its record. */
export const usageRows = (offerId) => getUsage().filter((u) => u.offerId === offerId).sort((a, b) => b.at - a.at);

// ---- views (Coupons, Flash sales, Offers) ------------------------------------------------------------------------------
/** Offers for a list: view 'coupons' | 'flash' | 'auto' (automatic, Buy X get Y, quantity, gift, payment) | 'all'. */
export function listOffers(view = 'all', t = now()) {
  const rows = getUsage();
  return getOffers(t).filter((o) => o.status !== 'archived').filter((o) => (view === 'coupons' ? o.activation === 'code' : view === 'flash' ? o.activation === 'flash' : view === 'auto' ? o.activation === 'auto' || o.activation === 'payment' : true))
    .map((o) => ({ ...o, life: lifecycleOf(o, t, rows), usage: usageOf(o, t, rows), kind: kindLabel(o), summary: describe(o) }));
}
/** Offers that would clash with a new one on the same products and dates (for a warning in the builder). */
export function overlaps(draft, t = now()) {
  const a = draft.schedule || {};
  return listOffers('all', t).filter((o) => o.id !== draft.id && ['Active', 'Scheduled'].includes(o.life)).filter((o) => {
    const b = o.schedule || {};
    const timeHit = (!a.end || !b.start || b.start <= a.end) && (!b.end || !a.start || a.start <= b.end);
    if (!timeHit) return false;
    const pa = (draft.conditions || {}).products || ALL, pb = o.conditions.products || ALL;
    const prodHit = pa.mode === 'all' || pb.mode === 'all' || (pa.cats || []).some((c) => (pb.cats || []).includes(c)) || (pa.skus || []).some((s) => (pb.skus || []).includes(s) || (pb.cats || []).includes((productBy(s) || {}).cat));
    return prodHit && !joins(O('x', { ...draft, stacking: draft.stacking || {} }), o);
  });
}
