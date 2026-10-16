// affiliates — the shop's affiliate programme (Batch B step 3, "Remaining work" item 5, part 2). People who promote the
// shop (reviewers, Facebook groups, YouTubers) get a link (/store?ref=CODE) and a code; an order that comes through the
// link (within the link days) or with the code typed at checkout is theirs. The commission waits until the order is
// delivered and the return window has passed, then it is payable; Make payouts turns what is payable (from the minimum
// payout up) into money owed in Finances › Liabilities (lib/liabilities.js, type 'affiliate'), where the shop pays it.
// An affiliate's own orders never count.
//
//   affSettings() · saveAffSettings(patch) · AFF_DEFAULTS (10%, 30-day link, ৳500 minimum, paid after a 7-day return window)
//   getAffiliates() · affiliateBy(id) · affiliateByCode(code) · affiliateOfPhone(phone) · updateAffiliate(id, patch)
//   getApplications() · applyAffiliate(form) · approveApplication(id, by) · rejectApplication(id, reason, by)
//   captureRef(code) (a store page opened with ?ref=) · currentRef() · attributeOrder(order, { phone, code, lines })
//   commissionsOf(affId) → [{ order, at, amount, base, rate, state, label, payableAt }] · getCommissions()
//   statsOf(aff) → { clicks, orders, pending, approved, owed, paid } · payoutsOf(aff) · makePayouts(by)
//   affLink(aff, origin) · AFF_EVENT
// Withdrawal requests (Batch C step 6): an affiliate asks for what is payable from My account › Affiliate within the
// shop's rules (affSettings: wdMin = minPayout, wdMax per request, wdEvery days between requests, wdApproval auto or
// manual, wdMethods); the shop approves or rejects it (with a reason) in Marketing › Affiliates › Withdrawals. Approving
// makes the request's Liabilities payout line (one liability per request), paid in Finances › Liabilities as before.
//   withdrawRules(aff) · requestPlan(aff, amount) · requestWithdrawal(affId, { amount, method, number })
//   getWithdrawals() · withdrawalsOf(affId) · approveWithdrawal(id, by) · rejectWithdrawal(id, reason, by) · WD_LABEL
// Front end only (browser storage gc.aff.*). A live store records clicks and orders on its server.

import { getOrders } from './orders';
import { allProducts } from './products';
import { clockNow } from './settlements';
import { getLiabilities, addLiability } from './liabilities';
import { requestsForOrder } from './returnRequests';

export const AFF_EVENT = 'gc:affiliates';
const K = { settings: 'gc.aff.settings', list: 'gc.aff.list', apps: 'gc.aff.apps', clicks: 'gc.aff.clicks', orders: 'gc.aff.orders', ref: 'gc.aff.ref', wd: 'gc.aff.withdrawals' };
const DAY = 864e5;
const r2 = (n) => Math.round(n * 100) / 100;
const ssr = () => typeof window === 'undefined';
const read = (k, d) => { if (ssr()) return d; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(AFF_EVENT)); } catch { /* ignore */ } };
const digits = (t) => String(t || '').replace(/\D/g, '').replace(/^(?:00)?88(?=01)/, '');
const at = (m, d, h = 12) => new Date(2026, m - 1, d, h).getTime();

// ---- the programme ------------------------------------------------------------------------------------------------
export const AFF_DEFAULTS = {
  on: true, type: 'percent', rate: 10, fixed: 100, cats: [], linkDays: 30, minPayout: 500, approval: 'manual', returnDays: 7,
  // withdrawal requests (Batch C): the minimum is minPayout; 0 = no maximum / no wait
  wdOn: true, wdMax: 20000, wdEvery: 7, wdApproval: 'manual', wdMethods: ['bkash', 'nagad', 'bank'],
  terms: 'Promote our products honestly and say you earn a commission. No ads on our brand name, no coupon sites, no spam. Your own orders do not count. Commission is paid after delivery and the return window, once it reaches the minimum payout.',
};
export const affSettings = () => ({ ...AFF_DEFAULTS, ...read(K.settings, {}) });
export function saveAffSettings(patch) {
  const next = { ...affSettings(), ...patch };
  next.rate = Math.max(0, Math.min(90, Number(next.rate) || 0));
  next.fixed = Math.max(0, Number(next.fixed) || 0);
  next.linkDays = Math.max(1, Math.min(365, Math.round(Number(next.linkDays) || 30)));
  next.minPayout = Math.max(0, Number(next.minPayout) || 0);
  next.returnDays = Math.max(0, Math.min(60, Math.round(Number(next.returnDays) || 0)));
  next.cats = (next.cats || []).filter((c) => c && c.cat).map((c) => ({ cat: c.cat, rate: Math.max(0, Math.min(90, Number(c.rate) || 0)) }));
  next.wdOn = next.wdOn !== false;
  next.wdMax = Math.max(0, Number(next.wdMax) || 0);
  if (next.wdMax && next.wdMax < next.minPayout) next.wdMax = next.minPayout;
  next.wdEvery = Math.max(0, Math.min(90, Math.round(Number(next.wdEvery) || 0)));
  next.wdApproval = next.wdApproval === 'auto' ? 'auto' : 'manual';
  next.wdMethods = (next.wdMethods || []).filter((m) => ['bkash', 'nagad', 'bank'].includes(m));
  if (!next.wdMethods.length) next.wdMethods = ['bkash'];
  write(K.settings, next);
  return next;
}
/** "10% of each sale" / "৳100 for each order" (with the affiliate's own rate when set). */
export function rateText(aff, s = affSettings()) {
  if (s.type === 'fixed') return `৳${Math.round(aff && aff.fixed != null ? aff.fixed : s.fixed).toLocaleString('en-IN')} for each order`;
  return `${aff && aff.rate != null ? aff.rate : s.rate}% of each sale`;
}

// ---- affiliates and applications -----------------------------------------------------------------------------------
// the three affiliates the September payout already names (lib/liabilities.js › LB-0003)
const SEED = [
  { id: 'AF-001', name: 'Nabila Tech Reviews', person: 'Nabila Karim', phone: '01755123456', email: 'nabila.reviews@gmail.com', where: 'Instagram · @nabila.techreviews', audience: '48K followers', code: 'NABILA', rate: 8, status: 'active', joined: at(5, 12), payout: { method: 'bkash', number: '01755123456' }, before: { orders: 42, clicks: 1180 } },
  { id: 'AF-002', name: 'TechReview BD', person: 'Rashed Alam', phone: '01819445566', email: 'hello@techreviewbd.com', where: 'YouTube · TechReview BD', audience: '120K subscribers', code: 'TECHBD', rate: 6, status: 'active', joined: at(1, 10), payout: { method: 'bank', number: 'BRAC Bank · 1501 2024 7781 001' }, before: { orders: 31, clicks: 2240 } },
  { id: 'AF-003', name: 'Deal Hunters BD', person: 'Shakil Ahmed', phone: '01911223344', email: 'dealhuntersbd@gmail.com', where: 'Facebook group · Deal Hunters BD', audience: '65K members', code: 'DEALBD', rate: 5, status: 'active', joined: at(6, 20), payout: { method: 'nagad', number: '01911223344' }, before: { orders: 18, clicks: 960 } },
];
const SEED_APPS = [
  { id: 'AP-004', name: 'Gadget Gossip', person: 'Tania Rahman', phone: '01688776655', email: 'gadgetgossip.bd@gmail.com', where: 'TikTok · @gadgetgossip', audience: '22K followers', how: 'Short unboxing videos of budget phones', at: at(10, 9, 16), status: 'pending' },
  { id: 'AP-005', name: 'Coupon World BD', person: 'Masud Rana', phone: '01577889900', email: 'couponworldbd@gmail.com', where: 'couponworldbd.com', audience: '—', how: 'A coupon website', at: at(10, 11, 11), status: 'pending' },
];
// demo orders that came through an affiliate
const SEED_ORDERS = [
  { order: '#136737', code: 'TECHBD', at: at(9, 4, 10), via: 'link' },
  { order: '#136410', code: 'TECHBD', at: at(2, 14, 12), via: 'link' },
  { order: '#136771', code: 'NABILA', at: at(9, 6, 11), via: 'link' },
  { order: '#136764', code: 'DEALBD', at: at(9, 6, 9), via: 'code' },
  { order: '#136742', code: 'NABILA', at: at(9, 5, 13), via: 'link' },
  // early-October orders (lib/liveOrders.js: delivered by 3–7 Oct, so payable now) for the withdrawal demo (Batch C)
  { order: '#136826', code: 'NABILA', at: at(10, 1, 15), via: 'link' },
  { order: '#136825', code: 'NABILA', at: at(10, 1, 11), via: 'link' },
  { order: '#136836', code: 'NABILA', at: at(10, 2, 16), via: 'code' },
  { order: '#136815', code: 'DEALBD', at: at(10, 1, 9), via: 'code' },
];

export function getAffiliates() {
  const own = read(K.list, {});
  const seeded = SEED.map((a) => ({ ...a, ...(own[a.id] || {}) }));
  const added = Object.values(own).filter((a) => !SEED.some((x) => x.id === a.id));
  return [...seeded, ...added];
}
export const affiliateBy = (id) => getAffiliates().find((a) => a.id === id) || null;
export const affiliateByCode = (code) => { const c = String(code || '').trim().toUpperCase(); return c ? getAffiliates().find((a) => a.code === c) || null : null; };
export const affiliateOfPhone = (phone) => { const d = digits(phone); return d ? getAffiliates().find((a) => digits(a.phone) === d) || null : null; };
export function updateAffiliate(id, patch) {
  const a = affiliateBy(id);
  if (!a) return null;
  if (patch.code) {
    const c = String(patch.code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (c.length < 3) return { error: 'Use at least 3 letters or numbers.' };
    if (getAffiliates().some((x) => x.id !== id && x.code === c)) return { error: 'Another affiliate has this code.' };
    patch = { ...patch, code: c };
  }
  const own = read(K.list, {});
  own[id] = { ...(own[id] || {}), ...(SEED.some((x) => x.id === id) ? {} : a), ...patch };
  write(K.list, own);
  return affiliateBy(id);
}

export const getApplications = () => { const own = read(K.apps, null); return (own || SEED_APPS).slice().sort((a, b) => b.at - a.at); };
const saveApps = (list) => write(K.apps, list);
function codeFrom(name) {
  const base = String(name || 'AFF').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'AFF';
  const taken = new Set(getAffiliates().map((a) => a.code));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 999; i += 1) if (!taken.has(base + i)) return base + i;
  return base + Date.now().toString(36).slice(-3).toUpperCase();
}
function makeAffiliate(app) {
  const own = read(K.list, {});
  const n = getAffiliates().reduce((m, a) => Math.max(m, Number(String(a.id).slice(3)) || 0), 0) + 1;
  const a = { id: 'AF-' + String(n).padStart(3, '0'), name: app.name, person: app.person || app.name, phone: digits(app.phone), email: app.email || '', where: app.where || '', audience: app.audience || '', code: codeFrom(app.name), rate: null, status: 'active', joined: clockNow(), payout: { method: 'bkash', number: digits(app.phone) }, before: { orders: 0, clicks: 0 }, app: app.id };
  own[a.id] = a;
  write(K.list, own);
  return a;
}
/** "Become an affiliate": an application; approved at once when the programme approves automatically. */
export function applyAffiliate(form = {}) {
  const s = affSettings();
  if (!s.on) return { ok: false, error: 'The affiliate programme is closed right now.' };
  if (!String(form.name || '').trim()) return { ok: false, error: 'Add your name or your page’s name.' };
  if (!/^01[3-9]\d{8}$/.test(digits(form.phone))) return { ok: false, error: 'Add an 11-digit mobile number.' };
  if (!String(form.where || '').trim()) return { ok: false, error: 'Tell us where you will share the link.' };
  if (!form.agree) return { ok: false, error: 'Tick the box to agree to the terms.' };
  if (affiliateOfPhone(form.phone)) return { ok: false, error: 'This number is already an affiliate. Sign in to see your dashboard.' };
  const apps = getApplications();
  if (apps.some((x) => digits(x.phone) === digits(form.phone) && x.status === 'pending')) return { ok: false, error: 'You have applied already. We will message you soon.' };
  const app = { id: 'AP-' + String(apps.reduce((m, x) => Math.max(m, Number(x.id.slice(3)) || 0), 0) + 1).padStart(3, '0'), name: form.name.trim(), person: String(form.person || form.name).trim(), phone: digits(form.phone), email: String(form.email || '').trim(), where: form.where.trim(), audience: String(form.audience || '').trim(), how: String(form.how || '').trim(), at: clockNow(), status: 'pending' };
  if (s.approval === 'auto') {
    const a = makeAffiliate(app);
    saveApps([{ ...app, status: 'approved', decidedAt: clockNow(), by: 'Automatic', affiliate: a.id }, ...apps]);
    return { ok: true, approved: true, affiliate: a };
  }
  saveApps([app, ...apps]);
  return { ok: true, approved: false, application: app };
}
export function approveApplication(id, by = 'Staff') {
  const apps = getApplications();
  const app = apps.find((x) => x.id === id);
  if (!app || app.status !== 'pending') return null;
  const a = makeAffiliate(app);
  saveApps(apps.map((x) => (x.id === id ? { ...x, status: 'approved', decidedAt: clockNow(), by, affiliate: a.id } : x)));
  return a;
}
export function rejectApplication(id, reason, by = 'Staff') {
  const apps = getApplications();
  if (!apps.some((x) => x.id === id && x.status === 'pending')) return false;
  saveApps(apps.map((x) => (x.id === id ? { ...x, status: 'rejected', reason: String(reason || '').trim(), decidedAt: clockNow(), by } : x)));
  return true;
}

// ---- clicks and attribution -----------------------------------------------------------------------------------------
/** A store page opened with ?ref=CODE: remember the affiliate for the link days and count one click per visit. */
export function captureRef(code) {
  const a = affiliateByCode(code);
  if (!a || a.status !== 'active' || !affSettings().on) return null;
  const now = clockNow();
  try {
    const seen = window.sessionStorage.getItem('gc.aff.seen');
    if (seen !== a.code) {
      const clicks = read(K.clicks, {});
      clicks[a.code] = [...(clicks[a.code] || []), now].slice(-500);
      window.sessionStorage.setItem('gc.aff.seen', a.code);
      write(K.clicks, clicks);
    }
  } catch { /* ignore */ }
  write(K.ref, { code: a.code, at: now });
  return a;
}
/** The affiliate this visitor came from, while the link days last. */
export function currentRef() {
  const r = read(K.ref, null);
  if (!r || !r.code) return null;
  if (clockNow() - r.at > affSettings().linkDays * DAY) return null;
  const a = affiliateByCode(r.code);
  return a && a.status === 'active' ? a : null;
}
/** Tie a new order to an affiliate: a code typed at checkout wins over the link. Not for the affiliate's own orders. */
export function attributeOrder(order, { phone = '', code = '' } = {}) {
  if (!order || !affSettings().on) return null;
  const typed = code ? affiliateByCode(code) : null;
  const a = typed && typed.status === 'active' ? typed : currentRef();
  if (!a) return null;
  if (digits(a.phone) && digits(a.phone) === digits(phone || order.phone)) return null;   // own orders don't count
  const list = read(K.orders, []);
  if (list.some((x) => x.order === order.id)) return null;
  const row = { order: order.id, code: a.code, at: clockNow(), via: typed ? 'code' : 'link' };
  write(K.orders, [row, ...list]);
  return { ...row, affiliate: a };
}
export const isAffiliateCode = (code) => { const a = affiliateByCode(code); return !!(a && a.status === 'active'); };

// ---- commission --------------------------------------------------------------------------------------------------
const attributions = () => [...read(K.orders, []), ...SEED_ORDERS.filter((x) => !read(K.orders, []).some((y) => y.order === x.order))];
let PCACHE = null;
function catOfLine(l) {
  if (l.cat) return l.cat;
  if (!PCACHE) { try { PCACHE = allProducts(); } catch { PCACHE = []; } }
  const p = PCACHE.find((x) => x.id === l.productId) || PCACHE.find((x) => x.name === l.name) || PCACHE.find((x) => String(l.name).indexOf(x.name) === 0);
  return (p && p.cat) || '';
}
const under = (path, cat) => !!path && !!cat && (cat === path || String(cat).indexOf(path + ' › ') === 0);
/** The commission on an order for an affiliate: { base, amount, rate } (items after the order's discount; no delivery). */
export function commissionFor(o, aff, s = affSettings()) {
  const lines = o.lines || [];
  const items = lines.reduce((a, l) => a + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);
  const share = items > 0 ? Math.max(0, items - (Number(o.discount) || 0)) / items : 1;
  if (s.type === 'fixed') { const f = aff && aff.fixed != null ? aff.fixed : s.fixed; return { base: r2(items * share), amount: r2(f), rate: null }; }
  let amount = 0;
  lines.forEach((l) => {
    const cat = catOfLine(l);
    const special = (s.cats || []).find((c) => under(c.cat, cat));
    const rate = special ? special.rate : aff && aff.rate != null ? aff.rate : s.rate;
    amount += (Number(l.price) || 0) * (Number(l.qty) || 0) * share * rate / 100;
  });
  return { base: r2(items * share), amount: r2(amount), rate: aff && aff.rate != null ? aff.rate : s.rate };
}
export const COMMISSION_LABEL = { pending: 'Pending', approved: 'Payable', requested: 'Requested', owed: 'In a payout', paid: 'Paid', cancelled: 'Cancelled' };
/** Every attributed order with its commission and where it stands. */
export function getCommissions(now = clockNow()) {
  const s = affSettings();
  let orders = [];
  try { orders = getOrders(); } catch { orders = []; }
  const affs = getAffiliates();
  const liabs = getLiabilities();
  // orders in a withdrawal request still waiting for the shop's answer
  const inRequest = new Map();
  readWithdrawals().filter((w) => w.status === 'pending').forEach((w) => (w.orders || []).forEach((id) => inRequest.set(id, w.id)));
  return attributions().map((x) => {
    const a = affs.find((y) => y.code === x.code);
    const o = orders.find((y) => y.id === x.order);
    if (!a || !o) return null;
    const c = commissionFor(o, a, s);
    const delivered = o.times && o.times.delivered;
    const payableAt = delivered ? delivered + s.returnDays * DAY : null;
    let refunded = false;
    try { refunded = requestsForOrder(o.id).some((r) => r.stage === 'refunded'); } catch { refunded = false; }
    let state;
    let label;
    if (['cancelled', 'returned'].includes(o.statusKey) || refunded) { state = 'cancelled'; label = o.statusKey === 'cancelled' ? 'Order cancelled' : 'Order returned'; }
    else if (!delivered || o.statusKey !== 'delivered') { state = 'pending'; label = 'Waiting for delivery'; }
    else if (now < payableAt) { state = 'pending'; label = 'Payable on ' + new Date(payableAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
    else if (inRequest.has(o.id)) { state = 'requested'; label = 'In withdrawal ' + inRequest.get(o.id); }
    else if (x.payout) {
      const l = liabs.find((y) => y.id === x.payout);
      const line = l && l.lines.find((y) => y.name === payeeName(a));
      const paid = line && (line.paid || 0) >= line.amount;
      state = paid ? 'paid' : 'owed'; label = paid ? 'Paid' : 'In payout ' + x.payout;
    } else { state = 'approved'; label = 'Payable'; }
    return { order: o.id, code: a.code, affiliate: a.id, at: x.at, via: x.via, customer: o.customer, amount: c.amount, base: c.base, rate: c.rate, state, label, payableAt, payout: x.payout || '', orderStatus: o.statusKey };
  }).filter(Boolean).sort((p, q) => q.at - p.at);
}
export const commissionsOf = (affId, list = getCommissions()) => list.filter((c) => c.affiliate === affId);

// ---- payouts -------------------------------------------------------------------------------------------------------
// the name on the liability line; the September payout used "Name (platform)"
const payeeName = (a) => a.name;
const linesFor = (a) => {
  const out = [];
  getLiabilities().filter((l) => l.type === 'affiliate').forEach((l) => l.lines.forEach((x) => { if (x.name === a.name || String(x.name).indexOf(a.name + ' (') === 0) out.push({ liab: l.id, title: l.title, due: l.due, at: l.at, amount: x.amount, paid: x.paid || 0, note: x.note }); }));
  return out.sort((p, q) => q.at - p.at);
};
export const payoutsOf = (a) => (a ? linesFor(a) : []);
export function statsOf(a, list = commissionsOf(a.id)) {
  const sum = (st) => r2(list.filter((c) => c.state === st).reduce((x, c) => x + c.amount, 0));
  const pays = linesFor(a);
  const clicks = (a.before ? a.before.clicks || 0 : 0) + ((read(K.clicks, {})[a.code] || []).length);
  return {
    clicks, orders: (a.before ? a.before.orders || 0 : 0) + list.filter((c) => c.state !== 'cancelled').length,
    pending: sum('pending'), approved: sum('approved'), requested: sum('requested'),
    owed: r2(pays.reduce((x, p) => x + Math.max(0, p.amount - p.paid), 0)), paid: r2(pays.reduce((x, p) => x + p.paid, 0)),
  };
}
const ACCOUNT_OF = { bkash: 'bkash', nagad: 'nagad', bank: 'brac' };
export const PAYOUT_METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['bank', 'Bank transfer']];
/** What Make payouts would do now: [{ affiliate, amount, orders }] (payable from the minimum payout up). */
export function payoutPreview(list = getCommissions()) {
  const s = affSettings();
  return getAffiliates().map((a) => {
    const due = list.filter((c) => c.affiliate === a.id && c.state === 'approved');
    const amount = r2(due.reduce((x, c) => x + c.amount, 0));
    return { affiliate: a, amount, orders: due.map((c) => c.order) };
  }).filter((x) => x.amount > 0 && x.amount >= s.minPayout);
}
/** Turn what is payable into money owed (Finances › Liabilities). Returns the liability, or null when nothing is due. */
export function makePayouts(by = 'Staff') {
  const rows = payoutPreview();
  if (!rows.length) return null;
  const d = new Date(clockNow());
  const l = addLiability({
    type: 'affiliate', title: 'Affiliate payouts · ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), party: rows.length + ' affiliate' + (rows.length === 1 ? '' : 's'),
    period: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), due: clockNow() + 5 * DAY, channel: 'Online', note: 'Made in Marketing › Affiliates by ' + by + '.',
    lines: rows.map((r) => ({ name: payeeName(r.affiliate), note: `${r.orders.length} order${r.orders.length === 1 ? '' : 's'} · ${(r.affiliate.payout || {}).method === 'bank' ? 'bank' : (r.affiliate.payout || {}).method || 'bKash'} ${(r.affiliate.payout || {}).number || ''}`.trim(), amount: r.amount, account: ACCOUNT_OF[(r.affiliate.payout || {}).method] || 'bkash', channel: 'Online' })),
  });
  markPaidOut(rows.flatMap((r) => r.orders), l.id);
  return { liability: l, rows };
}
// tie orders to the liability that pays them (the attribution's `payout`)
function markPaidOut(orderIds, liabId) {
  const ids = new Set(orderIds);
  const own = read(K.orders, []);
  const seededHere = SEED_ORDERS.filter((x) => ids.has(x.order) && !own.some((y) => y.order === x.order));
  write(K.orders, [...own.map((x) => (ids.has(x.order) ? { ...x, payout: liabId } : x)), ...seededHere.map((x) => ({ ...x, payout: liabId }))]);
}

// ---- withdrawal requests (Batch C step 6) -------------------------------------------------------------------------
export const WD_LABEL = { pending: 'To review', approved: 'Approved', rejected: 'Rejected' };
const methodName = (m) => (PAYOUT_METHODS.find(([k]) => k === m) || [m, m])[1];
// the demo: Deal Hunters BD asked for its payable commission on 15 Oct (amount worked out from the order)
const SEED_WD = [{ id: 'WD-0001', affiliate: 'AF-003', name: 'Deal Hunters BD', code: 'DEALBD', orders: ['#136815'], method: 'nagad', number: '01911223344', at: at(10, 15, 10), status: 'pending', seed: true }];
function readWithdrawals() {
  const own = read(K.wd, null);
  if (own) return own;
  if (ssr()) return [];
  let orders = [];
  try { orders = getOrders(); } catch { orders = []; }
  const s = affSettings();
  return SEED_WD.map((w) => {
    const o = orders.find((x) => x.id === w.orders[0]);
    const amount = o && o.statusKey === 'delivered' ? commissionFor(o, affiliateBy(w.affiliate), s).amount : 0;
    return { ...w, amount, asked: amount };
  }).filter((w) => w.amount > 0);
}
export const getWithdrawals = () => readWithdrawals().slice().sort((a, b) => b.at - a.at);
export const withdrawalsOf = (affId) => getWithdrawals().filter((w) => w.affiliate === affId);
const nextWdId = (list) => 'WD-' + String(list.reduce((m, w) => Math.max(m, Number(String(w.id).slice(3)) || 0), 0) + 1).padStart(4, '0');

/** What this affiliate may ask for now: { open, available, min, max, every, nextAt, methods, approval, why }. */
export function withdrawRules(a, now = clockNow()) {
  const s = affSettings();
  const list = a ? commissionsOf(a.id).filter((c) => c.state === 'approved') : [];
  const available = r2(list.reduce((x, c) => x + c.amount, 0));
  const mine = a ? withdrawalsOf(a.id) : [];
  const waiting = mine.find((w) => w.status === 'pending');
  const last = mine.filter((w) => w.status !== 'rejected').sort((p, q) => q.at - p.at)[0];
  const nextAt = last && s.wdEvery ? last.at + s.wdEvery * DAY : 0;
  let why = '';
  if (!s.wdOn) why = 'The shop pays affiliates itself; requests are off.';
  else if (!a || a.status !== 'active') why = 'Your affiliate account is paused.';
  else if (waiting) why = `Your request ${waiting.id} is being checked.`;
  else if (nextAt && now < nextAt) why = 'You can ask again on ' + new Date(nextAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '.';
  else if (available < s.minPayout) why = `You can ask once ${'৳' + Math.round(s.minPayout).toLocaleString('en-IN')} is payable.`;
  return { open: !why, why, available, min: s.minPayout, max: s.wdMax, every: s.wdEvery, nextAt, methods: s.wdMethods, approval: s.wdApproval, orders: list };
}
/** Whole orders that fit in `amount` and the rules' maximum, largest first so as little as possible is left over:
 *  { amount, orders }. */
export function requestPlan(a, amount) {
  const r = withdrawRules(a);
  const cap = Math.min(Number(amount) || 0, r.max || Infinity);
  const out = [];
  let sum = 0;
  r.orders.slice().sort((p, q) => q.amount - p.amount || (p.payableAt || 0) - (q.payableAt || 0)).forEach((c) => { if (sum + c.amount <= cap + 0.001) { out.push(c.order); sum = r2(sum + c.amount); } });
  return { amount: sum, orders: out };
}
/** The affiliate asks for a withdrawal. Returns { ok, request } or { ok: false, error }. */
export function requestWithdrawal(affId, { amount, method, number } = {}) {
  const a = affiliateBy(affId);
  const r = withdrawRules(a);
  if (!r.open) return { ok: false, error: r.why };
  if (!r.methods.includes(method)) return { ok: false, error: 'Choose one of the ways the shop pays.' };
  if (!String(number || '').trim()) return { ok: false, error: method === 'bank' ? 'Add the bank and account number.' : `Add your ${methodName(method)} number.` };
  if (method !== 'bank' && !/^01[3-9]\d{8}$/.test(digits(number))) return { ok: false, error: `Check the ${methodName(method)} number (11 digits, 01…).` };
  const want = Number(amount) || 0;
  if (want < r.min) return { ok: false, error: `The smallest withdrawal is ৳${Math.round(r.min).toLocaleString('en-IN')}.` };
  if (r.max && want > r.max) return { ok: false, error: `The most you can ask for at once is ৳${Math.round(r.max).toLocaleString('en-IN')}.` };
  if (want > r.available + 0.001) return { ok: false, error: 'That is more than is payable now.' };
  const plan = requestPlan(a, want);
  if (plan.amount < r.min || !plan.orders.length) return { ok: false, error: 'No whole orders add up to that. Try the full amount.' };
  const list = readWithdrawals();
  const w = { id: nextWdId(list), affiliate: a.id, name: a.name, code: a.code, amount: plan.amount, asked: want, orders: plan.orders, method, number: String(number).trim(), at: clockNow(), status: 'pending' };
  write(K.wd, [w, ...list]);
  updateAffiliate(a.id, { payout: { method, number: w.number } });
  if (r.approval === 'auto') return { ok: true, request: approveWithdrawal(w.id, 'Automatic') || w };
  return { ok: true, request: w };
}
/** Approve: the request becomes the affiliate's payout line in Finances › Liabilities. Returns the request. */
export function approveWithdrawal(id, by = 'Staff') {
  const list = readWithdrawals();
  const w = list.find((x) => x.id === id);
  if (!w || w.status !== 'pending') return null;
  const a = affiliateBy(w.affiliate);
  const d = new Date(clockNow());
  const l = addLiability({
    type: 'affiliate', title: `Affiliate withdrawal ${w.id} · ${w.name}`, party: w.name,
    period: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), due: clockNow() + 3 * DAY, channel: 'Online', note: `Withdrawal request ${w.id}, approved by ${by}.`,
    lines: [{ name: a ? payeeName(a) : w.name, note: `${w.orders.length} order${w.orders.length === 1 ? '' : 's'} · ${methodName(w.method)} ${w.number}`, amount: w.amount, account: ACCOUNT_OF[w.method] || 'bkash', channel: 'Online' }],
  });
  const done = { ...w, status: 'approved', by, decidedAt: clockNow(), liab: l.id };
  write(K.wd, list.map((x) => (x.id === id ? done : x)));
  markPaidOut(w.orders, l.id);
  return done;
}
/** Reject with a reason (shown to the affiliate); the orders become payable again. */
export function rejectWithdrawal(id, reason, by = 'Staff') {
  const why = String(reason || '').trim();
  if (!why) return null;
  const list = readWithdrawals();
  const w = list.find((x) => x.id === id);
  if (!w || w.status !== 'pending') return null;
  const done = { ...w, status: 'rejected', reason: why, by, decidedAt: clockNow() };
  write(K.wd, list.map((x) => (x.id === id ? done : x)));
  return done;
}

/** The affiliate's link to the store. */
export const affLink = (a, origin = '') => (origin || 'https://dazzleshop.com.bd') + '/store?ref=' + encodeURIComponent(a.code);
