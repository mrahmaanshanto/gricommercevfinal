// invoices — every sale made out to a customer is an invoice, and an invoice is only ever Unpaid or
// Paid. There is no separate wholesale system: an unpaid invoice is a sale from New sale (the POS
// register) that was completed without full payment. Recording the payment turns it into a Paid
// invoice and a completed order.
// Front end only: POS sales live in gc.pos.sales; the demo invoices below live in gc.invoices.

import { POS_KEYS, load, save } from './posStore';
import { updateOrder } from './orderLinks';
import { accountForMethod, postEntry, getEntries } from './ledger';
import { freezeLine } from './productCost';
import { wholesaleOn } from './edition';
import { formatBDT } from './format';

const KEY = 'gc.invoices';
const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const r2 = (n) => Math.round(n * 100) / 100;

function seed(id, when, customer, lines, paid, method, retail = false) {
  const gross = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = r2(gross * 0.05);
  const total = r2(gross + tax);
  return {
    id, at: when, customer, wholesale: !retail, tier: retail ? null : customer.tier, invoice: true, cashier: 'Sadia Akter', counter: 'Dhanmondi · Counter 1',
    lines: lines.map((l, i) => ({ id: id + '-' + i, disc: 0, ...l })),
    totals: { gross, lineDisc: 0, cartDisc: 0, couponDisc: 0, memberDisc: 0, pointsUsed: 0, pointsDisc: 0, taxable: gross, tax, total, units: lines.reduce((s, l) => s + l.qty, 0) },
    tenders: paid ? [{ method, amount: paid }] : [], change: 0, due: r2(total - paid), payments: [], returned: {}, rev: 1, sentAt: when, deliveries: [],
  };
}
const SEED = [
  seed('INV-0231', at(25, 11, 20), { name: 'Jamal Telecom', phone: '01819447210', tier: 'Wholesale A · shops' }, [{ name: 'Wireless Earbuds Pro', qty: 8, price: 3141 }, { name: 'Foldable Phone Stand', qty: 24, price: 585 }], 0),
  seed('INV-0230', at(24, 16, 5), { name: 'Habib Telecom', phone: '01715332908', tier: 'Wholesale A · shops' }, [{ name: 'Realme Note 50 6/128GB', qty: 2, price: 13491 }, { name: 'Wireless Earbuds Pro', qty: 3, price: 3141 }], 10000, 'bKash'),
  seed('INV-0229', at(22, 12, 40), { name: 'Maa Fatema Mobile', phone: '01912804551', tier: 'Wholesale A · shops' }, [{ name: 'Lightning Cable 1m', qty: 40, price: 378 }, { name: 'Type-C Wired Earphones', qty: 10, price: 891 }], 0),
  seed('INV-0228', at(12, 10, 15), { name: 'Bismillah Mobile Corner', phone: '01674210987', tier: 'Wholesale B · distributors' }, [{ name: 'Anker Power Bank 10000mAh', qty: 12, price: 2508 }, { name: 'Foldable Phone Stand', qty: 40, price: 553 }], 20000, 'Cash'),
  seed('INV-0226', at(20, 15, 30), { name: 'New Madina Telecom', phone: '01845667302', tier: 'Wholesale B · distributors' }, [{ name: 'Anker 20W USB-C Charger', qty: 16, price: 1063 }], 17858.4, 'Bank'),
  // retail customers buying on due (Settings › Customers › Credit & dues)
  seed('INV-0232', at(27, 13, 10), { name: 'Shirin Akter', phone: '01811843300' }, [{ name: 'Anker Power Bank 10000mAh', qty: 1, price: 3200 }, { name: 'Foldable Phone Stand', qty: 2, price: 650 }], 1500, 'Cash', true),
  seed('INV-0233', at(29, 17, 45), { name: 'Nusrat Jahan', phone: '01553336655' }, [{ name: 'Wireless Earbuds Pro', qty: 1, price: 3490 }], 0, '', true),
  seed('INV-0234', at(30, 12, 5), { name: 'Maa Fatema Mobile', phone: '01912804551' }, [{ name: 'Lightning Cable 1m', qty: 6, price: 420 }, { name: 'Type-C Wired Earphones', qty: 2, price: 990 }], 0, '', true),
];
// demo: INV-0232 was accepted before part of it was paid; INV-0234 was revised (8 cables became 6) and accepted again
(() => {
  const i32 = SEED.find((x) => x.id === 'INV-0232');
  Object.assign(i32, { acceptedAt: at(27, 13, 30), acceptedBy: 'Sadia Akter', acceptedRev: 1, dueAt: at(27, 13, 10) + 14 * 864e5 });
  const i34 = SEED.find((x) => x.id === 'INV-0234');
  const was = i34.lines.map((l) => (l.name === 'Lightning Cable 1m' ? { ...l, qty: 8 } : l));
  const gross = was.reduce((t, l) => t + l.price * l.qty, 0), tax = r2(gross * 0.05);
  Object.assign(i34, {
    rev: 2, editedAt: at(30, 15, 20), editedBy: 'Rakib Hasan', acceptedAt: at(30, 15, 25), acceptedBy: 'Rakib Hasan', acceptedRev: 2,
    revisions: [{ rev: 1, at: at(30, 15, 20), madeAt: i34.at, by: 'Rakib Hasan', reason: 'The shop took 6 cables, not 8', lines: was, totals: { ...i34.totals, gross, taxable: gross, tax, total: r2(gross + tax), units: was.reduce((t, l) => t + l.qty, 0) }, accepted: null }],
  });
})();
/** The demo invoices kept in this browser, plus any demo rows added since they were first saved. */
function demoRows() {
  const saved = load(KEY, SEED);
  const ids = new Set(saved.map((x) => x.id));
  return [...saved, ...SEED.filter((x) => !ids.has(x.id))];
}
/** Wholesale invoices show only while wholesale is on (edition.js › WHOLESALE; off for now). */
const shown = (s) => !s.wholesale || wholesaleOn();

/** Sales that count as invoices: made out to a customer, or with money still due. Newest first. */
export function getInvoices() {
  if (typeof window === 'undefined') return [];
  const pos = load(POS_KEYS.sales, []).filter((s) => (s.due > 0 || s.wholesale || s.invoice) && shown(s)).map((s) => ({ rev: 1, payments: [], ...s, src: 'pos' }));
  const demo = demoRows().filter(shown).map((s) => ({ ...s, src: 'demo' }));
  return [...pos, ...demo].sort((a, b) => b.at - a.at);
}
export function saveInvoice(inv) {
  const { src, ...row } = inv;
  const key = src === 'pos' ? POS_KEYS.sales : KEY;
  const list = src === 'pos' ? load(key, []) : demoRows();
  save(key, list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [...list, row]);
}
export const paidSoFar = (inv) => r2(inv.totals.total - inv.due);
export const isPaid = (inv) => inv.due <= 0;
/** 'paid', 'partial' (some money received) or 'unpaid'. */
export const statusOf = (inv) => (inv.due <= 0 ? 'paid' : paidSoFar(inv) > 0 ? 'partial' : 'unpaid');

// ---- accept, then pay -----------------------------------------------------------------------------
// A member of staff checks an unpaid invoice (items, prices, customer) and accepts it before money is recorded
// against it. Acceptance belongs to one revision: editing the invoice makes a new revision that must be accepted again.
/** True when the invoice's current revision has been accepted. */
export const isAccepted = (inv) => !!inv.acceptedAt && (inv.acceptedRev || 1) === (inv.rev || 1);
/** 'review' (to accept), 'accepted' (to pay) or 'paid'. */
export const stageOf = (inv) => (inv.due <= 0 ? 'paid' : isAccepted(inv) ? 'accepted' : 'review');
export const STAGES = { review: { label: 'To accept', tone: 'warning', icon: 'clipboard-check' }, accepted: { label: 'Accepted', tone: 'info', icon: 'check' }, paid: { label: 'Paid', tone: 'success', icon: 'circle-check' } };
/** Accept the invoice as it stands now. Returns the saved invoice. */
export function acceptInvoice(inv, by) {
  const next = { ...inv, acceptedAt: Date.now(), acceptedBy: by || 'Staff', acceptedRev: inv.rev || 1 };
  saveInvoice(next);
  return next;
}
/** When the money is due: the date set on the invoice, or 30 days after the sale. */
export const dueDateOf = (inv) => inv.dueAt || inv.at + 30 * 864e5;
/** True when money is still owed after the due date. */
export const isOverdue = (inv, now = Date.now()) => inv.due > 0 && dueDateOf(inv) < now;

const unitOf = (l) => r2((l.price * l.qty - (l.disc || 0)) / (l.qty || 1));
const orderDiscOf = (totals) => r2(discountsOf({ totals }) - (totals.lineDisc || 0));
/** What changed from one version of an invoice to the next (a and b are { lines, totals }): qty, price, lines, discount. */
export function invoiceChanges(a, b) {
  const out = [];
  a.lines.forEach((l) => {
    const m = b.lines.find((x) => x.id === l.id);
    if (!m) { out.push(`${l.name} removed (was ${l.qty} × ${formatBDT(unitOf(l))})`); return; }
    if (m.qty !== l.qty) out.push(`${l.name}: qty ${l.qty} → ${m.qty}`);
    if (unitOf(m) !== unitOf(l)) out.push(`${l.name}: price ${formatBDT(unitOf(l))} → ${formatBDT(unitOf(m))}`);
  });
  b.lines.filter((m) => !a.lines.some((l) => l.id === m.id)).forEach((m) => out.push(`${m.name} added (${m.qty} × ${formatBDT(unitOf(m))})`));
  const da = orderDiscOf(a.totals), db = orderDiscOf(b.totals);
  if (da !== db) out.push(`Discount ${formatBDT(da)} → ${formatBDT(db)}`);
  return out.length ? out : ['No change to items or prices'];
}
/** Every revision as { rev, at, by, reason, changes, from, to } (newest first). */
export function revisionsOf(inv) {
  const list = inv.revisions || [];
  return list.map((v, i) => {
    const nxt = list[i + 1] || inv;
    return { rev: v.rev, at: v.at, by: v.by, reason: v.reason || '', changes: invoiceChanges(v, nxt), from: v.totals.total, to: nxt.totals.total };
  }).reverse();
}

// ---- customer credit (advance) ------------------------------------------------------------------
// Money a customer paid beyond what they owed, kept for their next invoice. gc.customer.credit holds
// phone -> balance; gc.customer.credit.log keeps every change for the customer statement.
const CREDIT = 'gc.customer.credit';
const CREDIT_LOG = 'gc.customer.credit.log';
export const CREDIT_METHOD = 'Customer credit';
const readJSON = (key, fallback) => { try { return JSON.parse(window.localStorage.getItem(key)) || fallback; } catch { return fallback; } };
const writeJSON = (key, value) => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } };
const digits = (phone) => String(phone || '').replace(/[^0-9]/g, '').replace(/^88/, '');
/** The advance / credit balance a customer has with the shop. */
export const creditOf = (phone) => (typeof window === 'undefined' || !digits(phone) ? 0 : r2(readJSON(CREDIT, {})[digits(phone)] || 0));
/** Every change to customers' credit, newest first: { phone, at, amount (+ kept / − used), kind, note, ref }. */
export const creditLog = (phone) => (typeof window === 'undefined' ? [] : readJSON(CREDIT_LOG, []).filter((x) => !phone || x.phone === digits(phone)));
/** Add (+) or take (−) customer credit. kind: 'advance' | 'used' | 'returned' | 'revision'. The balance never goes below 0. */
export function addCredit(phone, amount, kind, note, ref) {
  const d = digits(phone);
  if (!d || !amount) return 0;
  const all = readJSON(CREDIT, {});
  const before = r2(all[d] || 0);
  const after = Math.max(0, r2(before + amount));
  all[d] = after;
  writeJSON(CREDIT, all);
  writeJSON(CREDIT_LOG, [{ phone: d, at: Date.now(), amount: r2(after - before), kind, note, ref }, ...readJSON(CREDIT_LOG, [])]);
  return after;
}

// ---- money in the ledger ------------------------------------------------------------------------
// A payment recorded here posts to the account its method lands in (lib/ledger); paying from the
// customer's credit moves no money. Payments taken with a POS sale were posted by the register
// (atCounter); a later payment carries the account it was posted to (row.account).
const partyOf = (inv) => (inv.customer && inv.customer.name) || 'Walk-in customer';
/** The account a payment was posted to, or null when it never reached the ledger (old demo data). */
function postedTo(inv, p) {
  if (p.account) return p.account;
  if (p.withSale) {
    const acc = accountForMethod(p.method, true);
    return acc && getEntries().some((e) => e.ref === inv.id && e.kind === 'sale' && e.account === acc) ? acc : null;
  }
  return null;
}
function postPayment(inv, account, amount, note, by) {
  if (!account || !amount) return;
  postEntry({ account, amount: r2(amount), kind: 'invoice payment', ref: inv.id, party: partyOf(inv), note, by });
}

// paid in full completes the order; it shows Delivered once the goods have been handed over too
const syncOrder = (inv, due) => {
  if (!inv.orderId) return;
  const handed = stockOutAtSale(inv) || deliveryOf(inv).status === 'full';
  updateOrder(inv.orderId, due ? { payment: 'Partial' } : { payment: 'Paid', ...(handed ? { status: 'Delivered' } : {}) });
};

/**
 * Record money received. When nothing is left due the invoice is Paid and its order is completed.
 * opts: { ref, keepExtra } — keepExtra keeps money above the due as the customer's credit.
 * Paying with CREDIT_METHOD uses up the customer's credit.
 */
export function recordPayment(inv, method, amount, by, opts = {}) {
  const phone = inv.customer && inv.customer.phone;
  let take = amount;
  if (method === CREDIT_METHOD) take = Math.min(amount, creditOf(phone));
  const applied = r2(Math.min(take, Math.max(0, inv.due)));
  const extra = opts.keepExtra && phone && method !== CREDIT_METHOD ? r2(Math.max(0, take - applied)) : 0;
  if (!applied && !extra) return inv;
  const due = Math.max(0, r2(inv.due - applied));
  const row = { method, amount: applied, by, at: Date.now() };
  if (opts.ref) row.ref = opts.ref;
  if (extra) row.extra = extra;
  const account = method === CREDIT_METHOD ? null : accountForMethod(method, false);
  if (account) row.account = account;
  const next = { ...inv, due, payments: [...(inv.payments || []), row], paidAt: due ? undefined : Date.now() };
  saveInvoice(next);
  if (method === CREDIT_METHOD && applied) addCredit(phone, -applied, 'used', `Paid ${inv.id} from credit`, inv.id);
  if (extra) addCredit(phone, extra, 'advance', `Kept from a payment on ${inv.id}`, inv.id);
  // the money received (with any part kept as credit) lands in the method's account
  postPayment(inv, account, applied + extra, `${method} payment on ${inv.id}${opts.ref ? ' · ' + opts.ref : ''}`, by);
  syncOrder(inv, due);
  return next;
}

/**
 * Every payment on an invoice, voided ones too: what was taken with the sale (key 'sale-<n>'), then
 * what came in later ('pay-<n>'). Payments taken with a POS sale keep their tender untouched; edits
 * and voids to them are kept in inv.saleEdits.
 */
export function paymentLog(inv) {
  const edits = inv.saleEdits || {};
  const sale = (inv.tenders || []).map((x, i) => [x, i]).filter(([x]) => x.method !== 'Due / credit').map(([x, i]) => ({
    key: 'sale-' + i, method: x.method, amount: x.method === 'Cash' ? r2(x.amount - (inv.change || 0)) : x.amount, at: inv.at, by: inv.cashier, withSale: true, ...(edits[i] || {}),
  }));
  const later = (inv.payments || []).map((p, i) => ({ key: 'pay-' + i, ...p }));
  return [...sale, ...later];
}
/** Payments that count (not voided). */
export const activePayments = (inv) => paymentLog(inv).filter((p) => !p.void);

function patchPayment(inv, key, patch) {
  const [kind, n] = key.split('-');
  const i = Number(n);
  if (kind === 'sale') return { ...inv, saleEdits: { ...(inv.saleEdits || {}), [i]: { ...((inv.saleEdits || {})[i] || {}), ...patch } } };
  return { ...inv, payments: (inv.payments || []).map((p, j) => (j === i ? { ...p, ...patch } : p)) };
}

/** Correct a payment: amount, method or who received it. The due moves by the difference. */
export function editPayment(inv, key, { amount, method, by }, editedBy) {
  const old = paymentLog(inv).find((p) => p.key === key);
  if (!old || old.void) return inv;
  const phone = inv.customer && inv.customer.phone;
  let amt = r2(Math.max(0, Math.min(amount, old.amount + Math.max(0, inv.due))));
  // money taken from credit goes back first, then the new amount is taken again
  if (old.method === CREDIT_METHOD) addCredit(phone, old.amount, 'returned', `Payment on ${inv.id} corrected`, inv.id);
  if (method === CREDIT_METHOD) { amt = Math.min(amt, creditOf(phone)); addCredit(phone, -amt, 'used', `Paid ${inv.id} from credit (corrected)`, inv.id); }
  const due = Math.max(0, r2(inv.due + old.amount - amt));
  const history = [...(old.edits || []), { at: Date.now(), by: editedBy || by, from: { amount: old.amount, method: old.method, by: old.by } }];
  // the ledger moves by the difference: same account, the change in amount; another account, the
  // old amount leaves the old one and the new amount lands in the new one
  const was = postedTo(inv, old);
  const now = method === CREDIT_METHOD ? null : accountForMethod(method, !!old.withSale);
  const note = `Payment on ${inv.id} corrected`;
  if (was && was === now) postPayment(inv, now, amt - old.amount, note, editedBy || by);
  else {
    if (was) postPayment(inv, was, -old.amount, note, editedBy || by);
    postPayment(inv, now, was || old.method === CREDIT_METHOD ? amt : amt - old.amount, note, editedBy || by);
  }
  const next = { ...patchPayment(inv, key, { amount: amt, method, by, edits: history, ...(now ? { account: now } : {}) }), due, paidAt: due ? undefined : inv.paidAt || Date.now() };
  saveInvoice(next);
  syncOrder(inv, due);
  return next;
}

/** Void a wrong payment. It stays in the history, struck through, with the reason; the due goes back up. */
export function voidPayment(inv, key, reason, by) {
  const old = paymentLog(inv).find((p) => p.key === key);
  if (!old || old.void) return inv;
  const phone = inv.customer && inv.customer.phone;
  if (old.method === CREDIT_METHOD) addCredit(phone, old.amount, 'returned', `Payment on ${inv.id} voided`, inv.id);
  if (old.extra) addCredit(phone, -old.extra, 'returned', `Advance from a voided payment on ${inv.id} taken back`, inv.id);
  const due = r2(Math.max(0, inv.due) + old.amount);
  const next = { ...patchPayment(inv, key, { void: { reason, by, at: Date.now() } }), due, paidAt: due ? undefined : inv.paidAt };
  saveInvoice(next);
  // the money goes back out of the account it was posted to
  postPayment(inv, postedTo(inv, old), -(old.amount + (old.extra || 0)), `Payment on ${inv.id} voided: ${reason}`, by);
  syncOrder(inv, due);
  return next;
}

/**
 * Rebuild the totals after an edit: new lines and one discount, VAT at the rate the invoice had.
 * Lines keep their sku, category and buying price (cost of one piece); new lines get them now.
 * The version being replaced is kept in inv.revisions. If the new total is below what was already
 * paid, the difference is kept as the customer's credit.
 */
export function reviseInvoice(inv, lines, discount, by, reason = '') {
  const gross = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const cartDisc = Math.min(gross, Math.max(0, discount));
  const taxable = gross - cartDisc;
  const rate = inv.totals.taxable ? inv.totals.tax / inv.totals.taxable : 0;
  const tax = r2(taxable * rate);
  const total = r2(taxable + tax);
  const paid = paidSoFar(inv);
  const prev = { rev: inv.rev || 1, at: Date.now(), madeAt: inv.editedAt || inv.at, by: by || 'Staff', reason: String(reason || '').trim(), lines: inv.lines, totals: inv.totals, accepted: isAccepted(inv) ? { at: inv.acceptedAt, by: inv.acceptedBy } : null };
  const next = {
    ...inv, lines: lines.map((l) => ({ ...freezeLine(l), disc: 0 })), rev: (inv.rev || 1) + 1, editedAt: Date.now(), editedBy: by || 'Staff',
    revisions: [...(inv.revisions || []), prev],
    totals: { ...inv.totals, gross, lineDisc: 0, cartDisc, couponDisc: 0, memberDisc: 0, pointsDisc: 0, pointsUsed: 0, taxable, tax, total, units: lines.reduce((s, l) => s + l.qty, 0) },
    due: Math.max(0, r2(total - paid)),
  };
  saveInvoice(next);
  if (paid > total && inv.customer && inv.customer.phone) addCredit(inv.customer.phone, r2(paid - total), 'revision', `${inv.id} revised below the amount paid`, inv.id);
  return next;
}
// ---- delivery of a wholesale order: all at once, in parts, or not yet ---------------------------
/**
 * True when the goods of this invoice already left the shelf when it was sold (a POS sale that took
 * the stock out). Then a delivery only records the hand-over and no stock can be held for it.
 * New POS sales say so in `stockOut`; older POS sales always took the stock out; demo invoices did not.
 */
export const stockOutAtSale = (inv) => (inv.stockOut !== undefined ? !!inv.stockOut : inv.src === 'pos');
/** How many of each line have been handed over so far: { lineId: qty }. */
export function sentOf(inv) {
  const sent = {};
  (inv.deliveries || []).forEach((d) => Object.entries(d.lines).forEach(([id, n]) => { sent[id] = (sent[id] || 0) + n; }));
  return sent;
}
/** { sent, total, status } where status is 'none', 'partial' or 'full'. */
export function deliveryOf(inv) {
  const sent = Object.values(sentOf(inv)).reduce((a, n) => a + n, 0);
  const total = inv.lines.reduce((a, l) => a + l.qty, 0);
  return { sent, total, left: Math.max(0, total - sent), status: !sent ? 'none' : sent >= total ? 'full' : 'partial' };
}
/** Challan / gate pass number of the n-th delivery (0-based) of an invoice, e.g. CH-0231-1. */
export const challanNo = (inv, n) => ((inv.deliveries || [])[n] || {}).no || 'CH-' + String(inv.id).replace(/^[A-Za-z]+-/, '') + '-' + (n + 1);
/** Record goods handed over. `lines` is { lineId: qty sent now }; meta has from, how, by, taker, note. */
export function recordDelivery(inv, lines, meta) {
  const n = (inv.deliveries || []).length;
  const next = { ...inv, deliveries: [...(inv.deliveries || []), { at: Date.now(), lines, no: challanNo({ id: inv.id }, n), ...meta }] };
  saveInvoice(next);
  return next;
}

/** What one customer owes across all their invoices. */
export const dueForPhone = (phone) => getInvoices().filter((r) => r.customer.phone === phone).reduce((a, r) => a + Math.max(0, r.due), 0);

export const discountsOf = (inv) => { const t = inv.totals; return r2((t.lineDisc || 0) + (t.cartDisc || 0) + (t.couponDisc || 0) + (t.memberDisc || 0) + (t.pointsDisc || 0)); };
