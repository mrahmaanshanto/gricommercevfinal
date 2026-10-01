// invoices — every sale made out to a customer is an invoice, and an invoice is only ever Unpaid or
// Paid. There is no separate wholesale system: an unpaid invoice is a sale from New sale (the POS
// register) that was completed without full payment. Recording the payment turns it into a Paid
// invoice and a completed order.
// Front end only: POS sales live in gc.pos.sales; the demo invoices below live in gc.invoices.

import { POS_KEYS, load, save } from './posStore';
import { updateOrder } from './orderLinks';
import { accountForMethod, postEntry, getEntries } from './ledger';
import { freezeLine } from './productCost';

const KEY = 'gc.invoices';
const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const r2 = (n) => Math.round(n * 100) / 100;

function seed(id, when, customer, lines, paid, method) {
  const gross = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = r2(gross * 0.05);
  const total = r2(gross + tax);
  return {
    id, at: when, customer, wholesale: true, tier: customer.tier, cashier: 'Sadia Akter', counter: 'Dhanmondi · Counter 1',
    lines: lines.map((l, i) => ({ id: id + '-' + i, disc: 0, ...l })),
    totals: { gross, lineDisc: 0, cartDisc: 0, couponDisc: 0, memberDisc: 0, pointsUsed: 0, pointsDisc: 0, taxable: gross, tax, total, units: lines.reduce((s, l) => s + l.qty, 0) },
    tenders: paid ? [{ method, amount: paid }] : [], change: 0, due: r2(total - paid), payments: [], returned: {}, rev: 1, sentAt: when, deliveries: [],
  };
}
const SEED = [
  seed('INV-0231', at(25, 11, 20), { name: 'Jamal Telecom', phone: '01819447210', tier: 'Wholesale A · shops' }, [{ name: 'Wireless Earbuds Pro', qty: 8, price: 3141 }, { name: 'Steel Water Bottle 750ml', qty: 24, price: 585 }], 0),
  seed('INV-0230', at(24, 16, 5), { name: 'Habib Telecom', phone: '01715332908', tier: 'Wholesale A · shops' }, [{ name: 'Budget Android Phone 6/128', qty: 2, price: 13491 }, { name: 'Wireless Earbuds Pro', qty: 3, price: 3141 }], 10000, 'bKash'),
  seed('INV-0229', at(22, 12, 40), { name: 'Maa Fatema Mobile', phone: '01912804551', tier: 'Wholesale A · shops' }, [{ name: 'Daily Care Shampoo 340ml', qty: 40, price: 378 }, { name: 'Hyaluronic Toner 150ml', qty: 10, price: 891 }], 0),
  seed('INV-0228', at(12, 10, 15), { name: 'Bismillah Mobile Corner', phone: '01674210987', tier: 'Wholesale B · distributors' }, [{ name: 'Rice Cooker 1.8L Walton', qty: 12, price: 2508 }, { name: 'Steel Water Bottle 750ml', qty: 40, price: 553 }], 20000, 'Cash'),
  seed('INV-0226', at(20, 15, 30), { name: 'New Madina Telecom', phone: '01845667302', tier: 'Wholesale B · distributors' }, [{ name: 'Sunscreen SPF 50 · 50ml', qty: 16, price: 1063 }], 17858.4, 'Bank'),
];

/** Sales that count as invoices: made out to a customer, or with money still due. Newest first. */
export function getInvoices() {
  if (typeof window === 'undefined') return [];
  const pos = load(POS_KEYS.sales, []).filter((s) => s.due > 0 || s.wholesale || s.invoice).map((s) => ({ rev: 1, payments: [], ...s, src: 'pos' }));
  const demo = load(KEY, SEED).map((s) => ({ ...s, src: 'demo' }));
  return [...pos, ...demo].sort((a, b) => b.at - a.at);
}
export function saveInvoice(inv) {
  const { src, ...row } = inv;
  const key = src === 'pos' ? POS_KEYS.sales : KEY;
  const list = load(key, src === 'pos' ? [] : SEED);
  save(key, list.map((x) => (x.id === row.id ? row : x)));
}
export const paidSoFar = (inv) => r2(inv.totals.total - inv.due);
export const isPaid = (inv) => inv.due <= 0;
/** 'paid', 'partial' (some money received) or 'unpaid'. */
export const statusOf = (inv) => (inv.due <= 0 ? 'paid' : paidSoFar(inv) > 0 ? 'partial' : 'unpaid');

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
export function reviseInvoice(inv, lines, discount, by) {
  const gross = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const cartDisc = Math.min(gross, Math.max(0, discount));
  const taxable = gross - cartDisc;
  const rate = inv.totals.taxable ? inv.totals.tax / inv.totals.taxable : 0;
  const tax = r2(taxable * rate);
  const total = r2(taxable + tax);
  const paid = paidSoFar(inv);
  const prev = { rev: inv.rev || 1, at: Date.now(), madeAt: inv.editedAt || inv.at, by: by || 'Staff', lines: inv.lines, totals: inv.totals };
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
