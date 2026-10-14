// productReviews — the shop's product reviews (Online Store › Reviews): what buyers wrote about a product, with
// stars, text and photos, checked against the shop's own orders ("Verified buyer" = the same phone number had a
// delivered order with that product), moderated (pending → published / hidden with a reason / spam) and answered
// with a public reply that shows under the review.
//
//   getReviews(now?)                   every review, newest first, with `verified`, `order` and `status` worked out
//   summaryOf(sku | product, list?)    { avg, count, pending, stars: {5: n …} } of the published reviews of a product
//   publish(ids) · hide(ids, reason) · markSpam(ids) · reply(id, text) · removeReply(id) · deleteReviews(ids)
//   getSettings() · saveSettings(patch)    auto-publish (min stars, verified buyers only)
//   askRule() · setAsk({ on, days })       the review request: the automation "Ask for a review after delivery"
//                                          (lib/automationRules.js › r3) — its wait is the days after delivery
//   HIDE_REASONS · STATUS · REVIEWS_EVENT ('gc:reviews')
//
// Demo data: reviews are made from the shop's real delivered online orders (orders.js, including the live orders of
// liveOrders.js that keep coming after September), with a fixed random seed per order, so the same order always gets
// the same review and new deliveries bring new reviews as the days go by. A few reviews come from people with no order
// (not verified) and a few are spam (links, ads). Everything is worked out in the browser, after mount.
// Front end only: the moderation, replies and settings are kept in this browser (gc.reviews.*). On the live website
// the storefront posts reviews to the store's server and shows the published ones with the replies.

import { getOrders, isCounterSale } from './orders';
import { productBy, getCatalog } from './stock';
import { demoNow } from './demoClock';
import { getRules, setRuleOn, saveRule, RULES_EVENT } from './automationRules';

const K = { edits: 'gc.reviews.edits', settings: 'gc.reviews.settings' };
export const REVIEWS_EVENT = 'gc:reviews';
const HOUR = 36e5;
const DAY = 24 * HOUR;
const isBrowser = typeof window !== 'undefined';
const read = (k, fb) => { if (!isBrowser) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(REVIEWS_EVENT)); } catch { /* full or private mode */ } };

export const STATUS = {
  pending: { label: 'Pending', tone: 'warning', icon: 'clock', help: 'Waiting for you. Not on the website yet.' },
  published: { label: 'Published', tone: 'success', icon: 'check', help: 'Shown on the website' },
  hidden: { label: 'Hidden', tone: 'neutral', icon: 'eye-off', help: 'Kept, but not on the website' },
  spam: { label: 'Spam', tone: 'error', icon: 'ban', help: 'Ads, links or fake. Never shown.' },
};
export const HIDE_REASONS = ['Not about the product', 'Rude or abusive words', 'Has personal details (phone, address)', 'About delivery, not the product', 'Looks fake', 'Other'];

// ---- seeded words -------------------------------------------------------------------------------------------------
function seeded(n) {
  let a = n >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (rand, list) => list[Math.floor(rand() * list.length) % list.length];

const TEXT = {
  5: {
    Phones: ['Original phone, sealed box. IMEI matched on the official site. Delivery in 2 days.', 'Camera is very good and battery easily lasts a full day. Thank you Dazzle Shop.', 'Phone ta original, box sealed chilo. Delivery fast. Highly recommended.', 'একদম অরিজিনাল ফোন, অফিসিয়াল ওয়ারেন্টি সহ। ধন্যবাদ।', 'Third phone I bought from here. Never had a problem.'],
    Audio: ['Sound is clear and bass is good for the price. Fits well.', 'Sound quality khub valo, battery o onek khon thake.', 'চমৎকার সাউন্ড, কল কোয়ালিটিও ভালো।', 'Exactly as shown. Pairing was instant.'],
    Accessories: ['Good quality, fits perfectly. Packaging was neat.', 'Charging fast hoy, original product. Thanks!', 'প্রোডাক্ট কোয়ালিটি ভালো, যেমন ছবিতে দেখেছি তেমনই।', 'Works perfectly. Will order again.'],
    Wearables: ['Battery lasts more than a week. Sleep tracking is accurate.', 'Strap is comfortable and the screen is bright outside.', 'খুব সুন্দর, দাম অনুযায়ী সেরা।'],
    'Power banks': ['Charges my phone 2 times fully. Solid build.', 'Original Anker, fast charging works.', 'পাওয়ার ব্যাংক ভালো, দ্রুত চার্জ হয়।'],
    any: ['Very good product. Delivery man was polite.', 'Exactly what I ordered. Thank you.', 'Product valo, delivery o fast.'],
  },
  4: {
    Phones: ['Good phone. Box was a little dented but the phone is fine.', 'Performance is smooth. Charger is a bit slow.', 'Valo phone, kintu delivery te 1 din beshi laglo.'],
    Audio: ['Good sound. The case scratches easily.', 'Valo, but bass aro ektu beshi hole valo hoto.', 'ভালো, তবে কানে একটু বড় লাগে।'],
    Accessories: ['Good, but the colour is a bit darker than the photo.', 'Works fine. The box was a little damaged.', 'Valo product, dam ektu beshi.'],
    any: ['Good product. Packaging could be better.', 'Satisfied. Delivery took 3 days.'],
  },
  3: {
    any: ['It is okay for the price. Nothing special.', 'Average. Expected a bit better quality.', 'Thik ache, kintu aro valo asha korechilam.', 'মোটামুটি। দাম অনুযায়ী ঠিক আছে।'],
  },
  2: {
    any: ['Stopped working properly after a week. Asked for a replacement.', 'Product was fine but the colour was different from what I ordered.', 'Delivery late hoyeche, product o average.'],
  },
  1: {
    any: ['Got the wrong model. Still waiting for the exchange.', 'Very bad. It does not charge at all.', 'Kharap product, return korte chai. Call e kew dhore na.'],
  },
};
const REPLIES = {
  low: ['Sorry for the trouble. Our team has called you and the replacement is on its way.', 'We are sorry. Please message us with your order number and we will fix it within 24 hours.'],
  high: ['Thank you for shopping with Dazzle Shop!', 'Thanks a lot for the kind words. Enjoy your new purchase.'],
};
const textFor = (rand, stars, cat) => { const pool = TEXT[stars] || TEXT[3]; return pick(rand, pool[cat] || pool.any || TEXT[3].any); };
const STARS = [[5, 50], [4, 28], [3, 10], [2, 7], [1, 5]];
const starsOf = (rand) => { let r = rand() * 100; for (const [s, w] of STARS) { r -= w; if (r <= 0) return s; } return 5; };
const PHOTO_TONES = ['#e0f3fb', '#fff4e0', '#e7f8f1', '#eef2f6', '#fde7f3'];

// a few people who never ordered (not verified) and a few spam posts: placed relative to today
const EXTRA = [
  { key: 'x1', ago: 0.4, name: 'Shuvo Ahmed', phone: '01845-220931', sku: 'AU-EAR-PRO', stars: 5, text: 'Bought this from your Dhanmondi shop last month, very happy with it.' },
  { key: 'x2', ago: 1.2, name: 'Tania Rahman', phone: '', sku: 'PH-RDM-N13', stars: 2, text: 'My cousin has this phone and it heats a lot while gaming.' },
  { key: 'x3', ago: 3.5, name: 'Mithila Hossain', phone: '01790-114502', sku: 'AC-CHG-20', stars: 4, text: 'Gift for my father, he likes it.' },
  { key: 's1', ago: 0.8, name: 'Earn Online BD', phone: '', sku: 'AU-EAR-PRO', stars: 5, spam: true, text: 'Earn ৳5,000 daily from home!!! WhatsApp now and visit bit.ly/earn-bd-fast' },
  { key: 's2', ago: 2.3, name: 'Cheap iPhone Deals', phone: '', sku: 'PH-IPH-15', stars: 5, spam: true, text: 'Get iPhone 15 at half price, original!! www.cheap-iphone-bd.shop' },
  { key: 's3', ago: 6.1, name: 'Follower Seller', phone: '', sku: 'AC-CBL-100', stars: 1, spam: true, text: 'Buy 10K Facebook followers ৳999 only. Inbox me. t.me/fbgrowbd' },
];
const LINKY = /(https?:\/\/|www\.|bit\.ly|t\.me\/|\.shop\b|whatsapp now)/i;

// ---- settings -----------------------------------------------------------------------------------------------------
const DEFAULT_SETTINGS = { autoPublish: true, minStars: 4, verifiedOnly: true, changedAt: 0 };
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...read(K.settings, {}) });
/** Change the review settings. New reviews (written after this moment) follow them; earlier ones keep their status. */
export function saveSettings(patch) { write(K.settings, { ...getSettings(), ...patch, changedAt: demoNow() }); }
const autoPublishes = (r, s) => s.autoPublish && r.stars >= (s.minStars || 4) && (!s.verifiedOnly || r.verified);

/** The review request: Automation › "Ask for a review after delivery" (an SMS with the review link). */
export const ASK_RULE = 'r3';
export function askRule() {
  const r = getRules().find((x) => x.id === ASK_RULE);
  return r ? { on: r.on !== false, days: Math.max(1, Math.round((r.wait || 48) / 24)), name: r.name, channel: ((r.actions || [])[0] || {}).channel || 'sms', text: ((r.actions || [])[0] || {}).text || '' } : null;
}
export function setAsk({ on, days }) {
  const r = askRule();
  if (!r) return;
  if (on != null && on !== r.on) setRuleOn(ASK_RULE, on);
  if (days != null && days !== r.days) saveRule(ASK_RULE, { wait: days * 24 }, 'Shanto', `Changed in Online Store › Reviews: ${days} day${days === 1 ? '' : 's'} after delivery`);
}
export { RULES_EVENT };

// ---- building the list ------------------------------------------------------------------------------------------------
const nameKey = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
/** The catalogue row of an order line (by SKU, else by name). */
function lineItem(l, catalog) {
  const p = productBy(l.sku || l.name, catalog);
  return p ? { sku: p.sku, name: p.name, cat: p.cat || '' } : null;
}

function seedReviews(now) {
  const orders = getOrders().filter((o) => !isCounterSale(o) && o.statusKey === 'delivered' && o.phone && o.phone !== '—');
  const catalog = getCatalog();
  const out = [];
  orders.forEach((o) => {
    const rand = seeded(hash(o.id));
    if (rand() > 0.34) return;                      // about one buyer in three writes a review
    const lines = (o.lines || []).filter((l) => !/repair|licence|guide/i.test(l.name));
    if (!lines.length) return;
    const line = lines[Math.floor(rand() * lines.length)];
    const item = lineItem(line, catalog);
    if (!item) return;
    const delivered = (o.times && o.times.delivered) || o.at;
    const at = Math.round(delivered + (6 + rand() * 90) * HOUR);
    if (at > now) return;
    const stars = starsOf(rand);
    const photos = stars >= 4 && rand() < 0.3 ? Array.from({ length: 1 + Math.floor(rand() * 2) }, (_, i) => ({ id: `${o.id}-${i}`, tone: pick(rand, PHOTO_TONES) })) : [];
    out.push({
      id: 'RV-' + o.id.replace('#', ''), sku: item.sku, product: item.name, cat: item.cat || '', name: o.customer, phone: o.phone,
      orderId: o.id, stars, text: textFor(rand, stars, item.cat), photos, at, seedRand: rand(), seedRand2: rand(),
    });
  });
  EXTRA.forEach((x) => {
    const p = productBy(x.sku, catalog) || { sku: x.sku, name: x.sku, cat: '' };
    // anchored to today's noon, so the time doesn't move while the page is open
    const noon = new Date(now); noon.setHours(12, 0, 0, 0);
    const d = new Date(Math.min(noon.getTime() - x.ago * DAY, now - 40 * 60000));
    out.push({ id: 'RV-' + x.key.toUpperCase(), sku: p.sku, product: p.name, cat: p.cat || '', name: x.name, phone: x.phone, orderId: '', stars: x.stars, text: x.text, photos: [], at: d.getTime(), spamSeed: !!x.spam, seedRand: 0.5, seedRand2: 0.5 });
  });
  return out;
}

/** Which delivered order makes this review a "Verified buyer" one (same phone, the product in it), or null. */
function verifyingOrder(r, delivered) {
  if (!r.phone) return null;
  const list = delivered.get(r.phone) || [];
  return list.find((o) => (o.id === r.orderId || !r.orderId) && (o.lines || []).some((l) => (l.sku && l.sku === r.sku) || nameKey(l.name) === nameKey(r.product))) || null;
}

/** Its status before anyone touched it: spam with links or ads; auto-published by the settings at the time; older
 *  ones were already decided by the shop (published, or hidden for a reason); the rest wait. */
function seedStatus(r, now, settings) {
  if (r.spamSeed || LINKY.test(r.text)) return { status: 'spam', auto: 'Has a link or an ad' };
  const rule = r.at > (settings.changedAt || 0) ? settings : DEFAULT_SETTINGS;
  if (autoPublishes(r, rule)) return { status: 'published', auto: 'Published automatically' };
  if (now - r.at < 4 * DAY || r.seedRand > 0.88) return { status: 'pending' };
  if (r.stars <= 2 && r.seedRand < 0.3) return { status: 'hidden', hideReason: 'About delivery, not the product', decidedAt: r.at + 20 * HOUR };
  return { status: 'published', decidedAt: r.at + 20 * HOUR };
}
function seedReply(r, st) {
  if (st.status !== 'published' || r.seedRand2 > (r.stars <= 3 ? 0.85 : 0.18)) return null;
  const pool = r.stars <= 3 ? REPLIES.low : REPLIES.high;
  return { text: pool[Math.floor(r.seedRand2 * 10) % pool.length], at: r.at + 22 * HOUR, by: 'Shanto' };
}

let MEMO = { key: '', list: [] };
/** Every review (deleted ones left out), newest first. */
export function getReviews(now = isBrowser ? demoNow() : 0) {
  if (!isBrowser) return [];
  const edits = read(K.edits, {});
  const settings = getSettings();
  const key = Math.floor(now / 60000) + '|' + JSON.stringify(edits).length + '|' + (settings.changedAt || 0);
  if (MEMO.key === key) return MEMO.list;
  const delivered = new Map();
  getOrders().filter((o) => !isCounterSale(o) && o.statusKey === 'delivered').forEach((o) => { if (!delivered.has(o.phone)) delivered.set(o.phone, []); delivered.get(o.phone).push(o); });
  const list = seedReviews(now).filter((r) => !(edits[r.id] && edits[r.id].deleted)).map((r) => {
    const order = verifyingOrder(r, delivered);
    const base = { ...r, verified: !!order, order: order ? order.id : '' };
    const st = seedStatus(base, now, settings);
    const e = edits[r.id] || {};
    const reply = e.reply === null ? null : e.reply || seedReply(base, st);
    const { seedRand, seedRand2, spamSeed, ...clean } = base;
    return { ...clean, status: e.status || st.status, hideReason: e.status ? e.hideReason || '' : st.hideReason || '', auto: e.status ? '' : st.auto || '', decidedAt: e.decidedAt || st.decidedAt || null, decidedBy: e.by || '', reply };
  }).sort((a, b) => b.at - a.at);
  MEMO = { key, list };
  return list;
}

const skusOf = (p) => (typeof p === 'string' ? [p] : [p.sku, ...((p.variants || []).map((v) => v.sku))].filter(Boolean));
const matches = (r, skus) => skus.some((s) => r.sku === s || r.sku.startsWith(s + '-') || s.startsWith(r.sku + '-'));
/** The reviews of one product (a SKU, or a product with its variants' SKUs). */
export const reviewsOf = (p, list = getReviews()) => { const skus = skusOf(p); return skus.length ? list.filter((r) => matches(r, skus)) : []; };
/** Published reviews of a product: average stars (1 decimal), count, how many wait, per-star counts. */
export function summaryOf(p, list = getReviews()) {
  const mine = reviewsOf(p, list);
  const pub = mine.filter((r) => r.status === 'published');
  const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  pub.forEach((r) => { stars[r.stars] += 1; });
  const avg = pub.length ? Math.round((pub.reduce((a, r) => a + r.stars, 0) / pub.length) * 10) / 10 : 0;
  return { avg, count: pub.length, pending: mine.filter((r) => r.status === 'pending').length, total: mine.length, stars };
}
/** "4.6 ★ · 12 reviews" (or "No reviews yet"). */
export const summaryText = (s) => (s.count ? `${s.avg.toFixed(1)} ★ · ${s.count} review${s.count === 1 ? '' : 's'}` : 'No reviews yet');

// ---- moderation -------------------------------------------------------------------------------------------------------
function edit(ids, patch) {
  const e = read(K.edits, {});
  const at = demoNow();
  [].concat(ids).forEach((id) => { e[id] = { ...(e[id] || {}), ...patch, decidedAt: at, by: 'Shanto' }; });
  write(K.edits, e);
}
export const publish = (ids) => edit(ids, { status: 'published', hideReason: '' });
export const hide = (ids, reason) => edit(ids, { status: 'hidden', hideReason: reason || 'Other' });
export const markSpam = (ids) => edit(ids, { status: 'spam', hideReason: '' });
/** Put reviews back as they were (for Undo): { id: previous edit or undefined }. */
export function restore(prev) {
  const e = read(K.edits, {});
  Object.keys(prev).forEach((id) => { if (prev[id]) e[id] = prev[id]; else delete e[id]; });
  write(K.edits, e);
}
export const editsOf = (ids) => { const e = read(K.edits, {}); return Object.fromEntries([].concat(ids).map((id) => [id, e[id]])); };
export function reply(id, text) {
  const e = read(K.edits, {});
  e[id] = { ...(e[id] || {}), reply: { text: String(text).trim(), at: demoNow(), by: 'Shanto' } };
  write(K.edits, e);
}
export function removeReply(id) { const e = read(K.edits, {}); e[id] = { ...(e[id] || {}), reply: null }; write(K.edits, e); }
export function deleteReviews(ids) { const e = read(K.edits, {}); [].concat(ids).forEach((id) => { e[id] = { ...(e[id] || {}), deleted: true }; }); write(K.edits, e); }
