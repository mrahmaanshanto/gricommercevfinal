// Smart offers (Marketing › Smart offers, /smart-offers): an offer goes out by itself when a customer does something
// (buys from a category, stops buying, looks at a product without buying …) or when the shop sends it to a group.
// Every customer gets their own one-time code. Send rules (rest time between offers, sending hours) apply to all.
// Front end only: browser storage ('gc.smartOffers', 'gc.smartOffers.rules', 'gc.smartOffers.log'), seeded from the
// 21 Sep design (GridCommerce-Design › recovery/SmartOffers). Sending is simulated: it adds to the send log.
//
// An offer: { id, name, trig ('auto' | 'manual'), group (manual: customer group), sit (trigger key) + its value
// (sCat, sProd, sViews, sAmt, sCount, sIdle, sLevel, sGroup, sFest), wait, off (reward key) + oPct, oCap, oTk, oCat,
// oProd, oMult, oMin, days (code valid for), ch [channels], msg, on, sent, used, sales, discount, at }

import { formatBDT } from './format';
import { allProducts } from './products';

const KEY = 'gc.smartOffers', RULES_KEY = 'gc.smartOffers.rules', LOG_KEY = 'gc.smartOffers.log';
export const OFFERS_EVENT = 'gc:smart-offers';
const money = (n) => formatBDT(Number(n) || 0);

// ---- triggers ("Send it when a customer …") -------------------------------------------------------------------
// [key, menu label, group, value it needs, sentence, when the wait counts from]
export const TRIGGERS = [
  ['buy_cat', 'Buys from a category', 'Buying', 'cat', 'buys from {cat}', 'after delivery'],
  ['buy_prod', 'Buys a specific product', 'Buying', 'prod', 'buys {prod}', 'after delivery'],
  ['buy_any', 'Places any order', 'Buying', '', 'places any order', 'after delivery'],
  ['order_over', 'Places an order above an amount', 'Buying', 'amount', 'places an order above {amt}', 'after delivery'],
  ['nth_order', 'Reaches a number of orders', 'Buying', 'count', 'reaches their {count} order', 'after delivery'],
  ['first_order', 'Gets their first order delivered', 'Buying', '', 'gets their first order delivered', 'after delivery'],
  ['view_prod', 'Looks at a product but doesn’t buy', 'Looking and wishlist', 'prod,views', 'looks at {prod} {views}+ times without buying', 'after the last look'],
  ['view_cat', 'Browses a category but doesn’t buy', 'Looking and wishlist', 'cat', 'browses {cat} without buying', 'after the last visit'],
  ['wishlist', 'Adds to wishlist but doesn’t buy', 'Looking and wishlist', '', 'adds something to their wishlist but doesn’t buy', 'after adding it'],
  ['wish_drop', 'Wishlist item price drops', 'Looking and wishlist', '', 'has a wishlist item whose price drops', 'after the price drops'],
  ['wish_back', 'Wishlist item is back in stock', 'Looking and wishlist', '', 'has a wishlist item back in stock', 'after it is back'],
  ['cart_after', 'Leaves a cart and ignores the reminders', 'Coming back', '', 'leaves a cart and ignores all reminders', 'after the last reminder'],
  ['stopped', 'Stops buying for a while', 'Coming back', 'idle', 'has not ordered for {idle} days', 'after that'],
  ['refill', 'Is due to buy a category again', 'Coming back', 'cat', 'is due to buy {cat} again', 'before they usually run out'],
  ['group_join', 'Moves into a customer group', 'Loyalty and dates', 'group', 'moves into the “{group}” group', 'after they join'],
  ['level_up', 'Reaches a member level', 'Loyalty and dates', 'level', 'reaches {level} level', 'after they reach it'],
  ['spend_total', 'Total buying crosses an amount', 'Loyalty and dates', 'amount', 'crosses {amt} in total buying', 'after that'],
  ['points_expire', 'Has points about to expire', 'Loyalty and dates', '', 'has points about to expire', 'before they expire'],
  ['birthday', 'Has a birthday coming', 'Loyalty and dates', '', 'has a birthday coming', 'before the birthday'],
  ['anniversary', 'Joined your shop a year ago', 'Loyalty and dates', '', 'joined your shop a year ago', 'after the day'],
  ['festival', 'A festival is coming', 'Loyalty and dates', 'fest', '{fest} is coming (all customers)', 'before the festival'],
  ['referral', 'Brings a friend who orders', 'Service', '', 'brings a friend who orders', 'after the friend’s delivery'],
  ['review', 'Writes a product review', 'Service', '', 'writes a product review', 'after the review'],
  ['returned', 'Returns an item', 'Service', '', 'returns an item', 'after the return'],
  ['late', 'Gets a late delivery', 'Service', '', 'gets a late delivery', 'after delivery'],
].map(([k, label, group, needs, text, from]) => ({ k, label, group, needs: needs ? needs.split(',') : [], text, from }));
export const TRIGGER_GROUPS = ['Buying', 'Looking and wishlist', 'Coming back', 'Loyalty and dates', 'Service'];
export const triggerBy = (k) => TRIGGERS.find((t) => t.k === k) || TRIGGERS[0];

// ---- rewards ("What do they get?") ----------------------------------------------------------------------------
export const REWARDS = [
  ['pct_order', '% off the whole order', 'pct,cap'],
  ['tk_order', '৳ off the next order', 'tk'],
  ['ship', 'Free delivery', ''],
  ['pct_cat', '% off a category', 'pct,cap,cat'],
  ['pct_prod', '% off a product', 'pct,cap,prod'],
  ['gift', 'A free gift', 'prod'],
  ['points', 'Extra loyalty points', 'mult'],
].map(([k, label, needs]) => ({ k, label, needs: needs ? needs.split(',') : [] }));
export const rewardBy = (k) => REWARDS.find((r) => r.k === k) || REWARDS[0];

export const WAITS = [['0', 'Right away'], ['1h', '1 hour'], ['6h', '6 hours'], ['1', '1 day'], ['2', '2 days'], ['3', '3 days'], ['5', '5 days'], ['7', '7 days'], ['14', '14 days'], ['30', '30 days']];
export const ORDER_COUNTS = [['2', '2nd'], ['3', '3rd'], ['5', '5th'], ['10', '10th'], ['25', '25th']];
export const LEVELS = ['Silver', 'Gold', 'Platinum'];
export const FESTIVALS = ['Eid-ul-Fitr', 'Eid-ul-Adha', 'Durga Puja', 'Pohela Boishakh', 'Victory Day', '11.11 sale'];
export const CHANNELS = [['fav', 'Their favourite'], ['sms', 'SMS'], ['wa', 'WhatsApp'], ['email', 'Email']];
export const channelName = (k) => (CHANNELS.find((c) => c[0] === k) || [k, k])[1];
// customer groups (CRM) and about how many customers are in each
export const GROUPS = [['All customers', 2452], ['Loyal', 312], ['Big spenders', 124], ['At risk', 198], ['Lost', 264], ['Window shoppers', 1420], ['New', 86], ['Gold and Platinum members', 150]];
export const groupSize = (g) => (GROUPS.find((x) => x[0] === g) || [g, 0])[1];
export const REST = [['3', '3 days'], ['5', '5 days'], ['7', '7 days'], ['10', '10 days'], ['14', '14 days'], ['30', '30 days']];
export const HOURS = [['9-21', '9 am – 9 pm'], ['10-20', '10 am – 8 pm'], ['any', 'Any time']];
export const VARS = ['{name}', '{offer}', '{code}', '{expiry}', '{shop}', '{link}'];

/** Categories and products to pick from (the shop's own catalogue). */
export function pickLists() {
  const list = allProducts().filter((p) => p.st !== 'deleted');
  const cats = Array.from(new Set(list.map((p) => String(p.cat || '').split(' › ').pop()).filter(Boolean))).sort();
  return { cats: cats.length ? cats : ['Smartphones', 'Chargers & cables', 'Cases & covers', 'Earbuds'], prods: list.map((p) => p.name).slice(0, 60) };
}

// ---- words ----------------------------------------------------------------------------------------------------
/** "a customer buys from Smartphones" — what makes the offer go out. */
export function triggerText(o) {
  if (o.trig === 'manual') return 'You send it to “' + (o.group || 'All customers') + '”';
  const t = triggerBy(o.sit);
  const s = t.text.replace('{cat}', o.sCat || '…').replace('{prod}', o.sProd || '…').replace('{views}', o.sViews || '3')
    .replace('{amt}', money(o.sAmt)).replace('{count}', (ORDER_COUNTS.find((c) => c[0] === o.sCount) || ['', o.sCount + 'th'])[1])
    .replace('{idle}', o.sIdle || '30').replace('{group}', o.sGroup || '…').replace('{level}', o.sLevel || 'Gold').replace('{fest}', o.sFest || '…');
  return (o.sit === 'festival' ? '' : 'When a customer ') + s;
}
/** "5 days after delivery" */
export function waitText(o) {
  if (o.trig === 'manual') return '';
  const w = WAITS.find((x) => x[0] === o.wait);
  return !w || w[0] === '0' ? 'right away' : w[1] + ' ' + triggerBy(o.sit).from;
}
/** "10% off Cases & covers products (up to ৳200)" — what the customer gets. */
export function rewardText(o) {
  const min = Number(o.oMin) ? ' on orders above ' + money(o.oMin) : '';
  const cap = Number(o.oCap) ? ' (up to ' + money(o.oCap) + ')' : '';
  switch (o.off) {
    case 'pct_order': return (o.oPct || 0) + '% off the whole order' + cap + min;
    case 'tk_order': return money(o.oTk) + ' off the next order' + min;
    case 'ship': return 'Free delivery' + min;
    case 'pct_cat': return (o.oPct || 0) + '% off ' + (o.oCat || '…') + cap + min;
    case 'pct_prod': return (o.oPct || 0) + '% off ' + (o.oProd || '…') + cap + min;
    case 'gift': return 'A free ' + (o.oProd || '…') + min;
    case 'points': return (o.oMult || 2) + '× loyalty points' + min;
    default: return '';
  }
}

// ---- data -----------------------------------------------------------------------------------------------------
export const DEFAULT_MSG = 'Hi {name}, {offer} just for you at {shop}! Code {code}, valid till {expiry}. {link}';
export function blankOffer() {
  return { id: '', name: '', trig: 'auto', group: 'All customers', sit: 'buy_cat', sCat: '', sProd: '', sViews: '3', sAmt: '5000', sCount: '5', sIdle: '30', sLevel: 'Gold', sGroup: 'At risk', sFest: 'Durga Puja',
    wait: '5', off: 'pct_order', oPct: '10', oCap: '300', oTk: '100', oCat: '', oProd: '', oMult: '2', oMin: '', days: '7', ch: ['fav'], msg: DEFAULT_MSG, on: true, sent: 0, used: 0, sales: 0, discount: 0 };
}
const seed = (o) => ({ ...blankOffer(), ...o, at: Date.UTC(2026, 8, 1) });
const SEED = [
  seed({ id: 'so-cross', name: 'Bought a phone, add a case', sit: 'buy_cat', sCat: 'Smartphones', wait: '5', off: 'pct_cat', oCat: 'Cases & covers', oPct: '10', oCap: '200', sent: 1060, used: 104, sales: 118200, discount: 7400, msg: 'Hi {name}, enjoying your new phone? Protect it with {offer} on cases! Code {code}, till {expiry}. {link}' }),
  seed({ id: 'so-win', name: 'Win them back', sit: 'stopped', sIdle: '30', wait: '0', off: 'pct_order', oPct: '10', oCap: '300', oMin: '1000', ch: ['sms', 'wa'], sent: 640, used: 71, sales: 186400, discount: 14200, msg: 'আমরা আপনাকে মিস করছি, {name}! {offer} — কোড {code}, {expiry} পর্যন্ত। {link}' }),
  seed({ id: 'so-view', name: 'Looked but didn’t buy', sit: 'view_prod', sProd: 'Redmi Note 13 8/256GB', sViews: '3', wait: '1', off: 'pct_prod', oProd: 'Redmi Note 13 8/256GB', oPct: '10', oCap: '', days: '3', ch: ['wa'], sent: 522, used: 96, sales: 142800, discount: 9600 }),
  seed({ id: 'so-refill', name: 'Time for a new glass', sit: 'refill', sCat: 'Screen protection', wait: '3', off: 'ship', ch: ['sms'], sent: 410, used: 88, sales: 96700, discount: 5300 }),
  seed({ id: 'so-wish', name: 'Wishlist price drop', sit: 'wish_drop', wait: '0', off: 'tk_order', oTk: '100', days: '3', ch: ['wa', 'email'], sent: 188, used: 41, sales: 52400, discount: 4100 }),
  seed({ id: 'so-vip', name: 'Welcome to Gold', sit: 'level_up', sLevel: 'Gold', wait: '0', off: 'points', oMult: '2', days: '30', ch: ['sms', 'email'], sent: 128, used: 24, sales: 32800, discount: 700 }),
  seed({ id: 'so-puja', name: 'Puja gift', trig: 'manual', group: 'Loyal', off: 'gift', oProd: 'Phone Pouch (gift)', oMin: '2000', days: '14', on: false, msg: 'শুভ পূজা, {name}! ৳২,০০০+ অর্ডারে ফ্রি উপহার। কোড {code}, {expiry} পর্যন্ত। {link}' }),
];
const LOG_SEED = [
  ['2026-09-19T09:02', 'Farzana Akter', 'Win them back', 'wa', 'FAR7Q2', 'used', 'Ordered ৳3,420'],
  ['2026-09-19T09:05', 'Rafiqul Islam', 'Bought a phone, add a case', 'sms', 'RAF4K8', 'delivered', ''],
  ['2026-09-19T09:10', 'Nusrat Jahan', 'Looked but didn’t buy', 'sms', 'NUS7Q2', 'delivered', ''],
  ['2026-09-19T09:40', 'Tanvir Hasan', 'Wishlist price drop', 'email', 'TAN2M5', 'opened', ''],
  ['2026-09-19T10:12', 'Sumaiya Rahman', 'Time for a new glass', 'sms', 'SUM9P1', 'failed', 'Number switched off'],
  ['2026-09-19T10:30', 'Mehedi Hasan', 'Win them back', 'wa', 'MEH3D7', 'read', ''],
  ['2026-09-19T11:05', 'Ayesha Siddika', 'Welcome to Gold', 'email', 'AYE6G2', 'delivered', ''],
  ['2026-09-18T16:20', 'Kamrul Hasan', 'Bought a phone, add a case', 'wa', 'KAM8T4', 'used', 'Ordered ৳1,980'],
  ['2026-09-18T15:02', 'Shirin Akter', 'Looked but didn’t buy', 'wa', 'SHI5V9', 'read', ''],
  ['2026-09-18T12:44', 'Arif Chowdhury', 'Win them back', 'sms', 'ARI1W3', 'delivered', ''],
].map(([at, who, offer, ch, code, status, note], i) => ({ id: 'sl-' + i, at: new Date(at + ':00+06:00').getTime(), who, offer, ch, code, status, note }));

const read = (k) => { if (typeof window === 'undefined') return null; try { return JSON.parse(window.localStorage.getItem(k)); } catch { return null; } };
function write(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } window.dispatchEvent(new CustomEvent(OFFERS_EVENT)); }

export const getOffers = () => { const v = read(KEY); return Array.isArray(v) ? v : SEED; };
export const getRules = () => ({ rest: '7', hours: '9-21', ...(read(RULES_KEY) || {}) });
export const saveRules = (r) => write(RULES_KEY, { rest: r.rest, hours: r.hours });
export const getLog = () => { const v = read(LOG_KEY); return (Array.isArray(v) ? v : LOG_SEED).slice().sort((a, b) => b.at - a.at); };

/** The problems with an offer before it can be saved: { field: message }. */
export function offerErrors(o, list = getOffers()) {
  const e = {};
  const name = String(o.name || '').trim();
  if (!name) e.name = 'Give the offer a name.';
  else if (list.some((x) => x.id !== o.id && x.name.toLowerCase() === name.toLowerCase())) e.name = 'There is already an offer called “' + name + '”.';
  if (o.trig === 'auto') {
    const t = triggerBy(o.sit);
    if (t.needs.includes('cat') && !o.sCat) e.trigger = 'Choose the category.';
    if (t.needs.includes('prod') && !o.sProd) e.trigger = 'Choose the product.';
    if (t.needs.includes('amount') && !(Number(o.sAmt) > 0)) e.trigger = 'Enter the amount.';
  }
  const r = rewardBy(o.off);
  if (r.needs.includes('pct') && !(Number(o.oPct) >= 1 && Number(o.oPct) <= 90)) e.reward = 'Enter a discount from 1% to 90%.';
  if (r.needs.includes('tk') && !(Number(o.oTk) > 0)) e.reward = 'Enter the amount off.';
  if (r.needs.includes('cat') && !o.oCat) e.reward = 'Choose the category.';
  if (r.needs.includes('prod') && !o.oProd) e.reward = 'Choose the product.';
  if (!(Number(o.days) >= 1)) e.days = 'Enter how many days the code works.';
  if (!(o.ch || []).length) e.ch = 'Choose at least one way to send it.';
  if (!String(o.msg || '').trim()) e.msg = 'Write the message.';
  else if (!String(o.msg).includes('{code}')) e.msg = 'Put {code} in the message so the customer gets their code.';
  return e;
}

/** Add or save an offer. Returns { ok, offer } or { ok: false, errors }. */
export function saveOffer(input) {
  const list = getOffers();
  const errors = offerErrors(input, list);
  if (Object.keys(errors).length) return { ok: false, errors };
  const clean = { ...input, name: String(input.name).trim(), msg: String(input.msg).trim() };
  let offer;
  if (clean.id && list.some((x) => x.id === clean.id)) {
    offer = { ...list.find((x) => x.id === clean.id), ...clean };
    write(KEY, list.map((x) => (x.id === clean.id ? offer : x)));
  } else {
    offer = { ...blankOffer(), ...clean, id: 'so-' + Date.now().toString(36), sent: 0, used: 0, sales: 0, discount: 0, at: Date.now() };
    write(KEY, [offer, ...list]);
  }
  return { ok: true, offer };
}
export const setOfferOn = (id, on) => write(KEY, getOffers().map((x) => (x.id === id ? { ...x, on } : x)));
export const deleteOffer = (id) => write(KEY, getOffers().filter((x) => x.id !== id));

/** About how many customers a "Send now" reaches: the group for a sent-by-you offer, else today's matches. */
export function audienceOf(o) {
  if (o.trig === 'manual') return groupSize(o.group);
  const h = [...String(o.id || o.name)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return 12 + (h % 60);
}

const NAMES = ['Farhana Yasmin', 'Rakib Hossain', 'Jannatul Ferdous', 'Sabbir Ahmed', 'Tahmina Akter', 'Imran Kabir', 'Nadia Islam', 'Shakil Ahmed'];
/** Send an offer now (simulated): its sent count goes up and the first messages are added to the send log. */
export function sendNow(id) {
  const list = getOffers();
  const o = list.find((x) => x.id === id);
  if (!o) return 0;
  const n = audienceOf(o), now = Date.now();
  const ch = (o.ch || ['sms']).filter((c) => c !== 'fav');
  const rows = NAMES.slice(0, Math.min(n, NAMES.length)).map((who, i) => ({
    id: 'sl-' + now.toString(36) + i, at: now - i * 1000, who, offer: o.name, ch: ch.length ? ch[i % ch.length] : ['sms', 'wa'][i % 2],
    code: who.slice(0, 3).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(), status: 'sent', note: '',
  }));
  write(LOG_KEY, [...rows, ...getLog()].slice(0, 200));
  write(KEY, list.map((x) => (x.id === id ? { ...x, sent: (x.sent || 0) + n } : x)));
  return n;
}

/** This month's totals for the key figures. */
export function totals(list = getOffers()) {
  const t = list.reduce((a, o) => ({ sent: a.sent + (o.sent || 0), used: a.used + (o.used || 0), sales: a.sales + (o.sales || 0), discount: a.discount + (o.discount || 0) }), { sent: 0, used: 0, sales: 0, discount: 0 });
  return { ...t, usedPct: t.sent ? Math.round((t.used / t.sent) * 100) : 0, costPct: t.sales ? Math.round((t.discount / t.sales) * 1000) / 10 : 0 };
}
