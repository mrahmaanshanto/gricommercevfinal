// quotes — quotes (proformas) for business buyers: wholesale buyers (while wholesale is on), companies and business
// leads (WH-F4). Nayeem's Sales & Orders brief #4 › Wholesale: quote → customer approval → sales order → fulfil →
// invoice → collect, on the same order primitives (no second wholesale engine).
//   saveQuote({ id, customer, lines, validDays, vatRate, discount, note, by, send })
//                customer: { name, phone, kind: 'wholesale' | 'company' | 'lead', id, tier, types, leadId, company }
//                priced by the caller through the one price rule (wholesalePrice.js › priceFor); editable until converted
//   sendQuote · acceptQuote · declineQuote · quoteState(q)   draft · sent · accepted · converted · declined · expired
//   quotesFor({ phone, id, leadId })   the quotes of one buyer or lead (buyer profile, lead page)
//   checkQuote(q, { place })   what converting would run into, as at the POS (salesOrder.js › checkSale): credit limit
//                and overdue hold, customer restrictions, MOQ, free stock at the place
//   convertQuote(q, { place, by, approvedBy })  runs checkQuote first: refused when something blocks it, and over the
//                credit limit / on overdue hold it needs the manager who approved (approvedBy). Then it makes what a
//                sales order makes (salesOrder.js › makeSale): an order (Approved, Unpaid), an unpaid invoice and the
//                goods held at the place until the invoice's deliveries hand them over (the IMEI / serial numbers are
//                taken on the delivery). A lead's quote first makes the lead a customer (Won). Converting twice
//                returns the first result.
// Kept in this browser (gc.quotes). Front end only.

import { load, save } from './posStore';
import { clockNow } from './settlements';
import { phoneDigits } from './customers';
import { checkSale, makeSale, isWholesaleBuyer, buyerOfQuote } from './salesOrder';
import { dueByTerms } from './buyerTerms';
import { moveStage } from './leads';
import { wholesaleOn } from './edition';
import { perDay, shiftPast, shiftTime } from './demoClock';

const KEY = 'gc.quotes';
const DAY = 24 * 60 * 60 * 1000;
const r2 = (n) => Math.round(n * 100) / 100;
const at = (m, d, h) => new Date(2026, m, d, h, 0).getTime();

export const QUOTE_STATE = {
  draft: ['Draft', 'neutral'], sent: ['Sent', 'info'], accepted: ['Accepted', 'success'],
  converted: ['Converted', 'success'], declined: ['Declined', 'neutral'], expired: ['Expired', 'warning'],
};

const SEED = [
  { id: 'QT-0003', at: at(8, 30, 15), customer: { name: 'Jamal Telecom', phone: '01819447210', tier: 'A', kind: 'wholesale', id: 'C-08012', types: ['Wholesale'] }, lines: [{ name: 'Wireless Earbuds Pro', qty: 20, price: 3141 }, { name: 'Foldable Phone Stand', qty: 48, price: 585 }], vatRate: 5, discount: 2000, validUntil: at(9, 10, 23), note: 'Delivery to Mirpur shop', state: 'sent', sentAt: at(8, 30, 16), by: 'Sadia Akter' },
  { id: 'QT-0002', at: at(9, 2, 11), customer: { name: 'Habib Telecom', phone: '01715332908', tier: 'A', kind: 'wholesale', id: 'C-08013', types: ['Wholesale'] }, lines: [{ name: 'Realme Note 50 6/128GB', qty: 5, price: 13491 }], vatRate: 5, discount: 0, validUntil: at(9, 16, 23), note: '', state: 'draft', by: 'Sadia Akter' },
  // business buyers that are not wholesale: a company (its Corporate price list) and a lead at "Quote sent" (WH-F4)
  { id: 'QT-0005', at: at(8, 29, 12), customer: { name: 'ABC Electronics Ltd.', phone: '01713550200', kind: 'company', id: 'C-30001', tier: 'B', types: ['Wholesale'] }, lines: [{ name: 'Redmi Note 13 8/256GB', sku: 'PH-RDM-N13', qty: 10, price: 25500, listPrice: 26999 }, { name: 'Anker Power Bank 10000mAh', sku: 'PB-ANK-10K', qty: 20, price: 2600, listPrice: 2950 }], vatRate: 5, discount: 0, validUntil: at(9, 14, 23), note: 'Phones for the Bashundhara branch staff', state: 'sent', sentAt: at(8, 29, 13), by: 'Tania' },
  { id: 'QT-0004', at: at(8, 25, 18), customer: { name: 'Arman Hossain · Hossain Builders', phone: '01866554411', kind: 'lead', leadId: 'LD-1012', company: 'Hossain Builders' }, lines: [{ name: 'Galaxy A15 6/128GB', sku: 'PH-GAL-A15', qty: 15, price: 18900, listPrice: 19999 }], vatRate: 5, discount: 0, validUntil: at(9, 9, 23), note: 'Phones for site engineers, first 15 of 40', state: 'sent', sentAt: at(8, 25, 18), by: 'Arafat' },
  { id: 'QT-0001', at: at(8, 12, 10), customer: { name: 'New Madina Telecom', phone: '01845667302', tier: 'B', kind: 'wholesale', id: 'C-08044', types: ['Wholesale'] }, lines: [{ name: 'Anker 20W USB-C Charger', qty: 24, price: 1063 }], vatRate: 5, discount: 0, validUntil: at(8, 25, 23), note: '', state: 'sent', sentAt: at(8, 12, 11), by: 'Arif Rahman' },
];

// the seed is written as of 1 October; in the browser it moves with the clock (demoClock.js), so its sent quotes stay open
const rebased = perDay((days) => SEED.map((q) => ({ ...q, at: shiftPast(q.at, days), validUntil: shiftTime(q.validUntil, days), ...(q.sentAt ? { sentAt: shiftPast(q.sentAt, days) } : {}) })));
const all = () => (typeof window === 'undefined' ? SEED : load(KEY, null) || rebased());
/** Every quote, newest first. A wholesale buyer's quotes show only while wholesale is on (read in the browser). */
export function getQuotes() { return all().filter((q) => (q.customer || {}).kind !== 'wholesale' || wholesaleOn()).sort((a, b) => b.at - a.at); }
export const quoteBy = (id) => all().find((q) => q.id === id) || null;
function put(q) { const list = all(); save(KEY, list.some((x) => x.id === q.id) ? list.map((x) => (x.id === q.id ? q : x)) : [q, ...list]); return q; }

/** { gross, discount, taxable, tax, total, units } */
export function quoteTotals(q) {
  const gross = q.lines.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);
  const discount = Math.min(gross, Math.max(0, Number(q.discount) || 0));
  const taxable = gross - discount;
  const tax = r2(taxable * (Number(q.vatRate) || 0) / 100);
  return { gross, discount, taxable, tax, total: r2(taxable + tax), units: q.lines.reduce((s, l) => s + (Number(l.qty) || 0), 0) };
}
/** draft · sent · accepted · converted · declined · expired (a sent or draft quote past its date). */
export function quoteState(q, now = clockNow()) {
  if (['converted', 'declined', 'accepted'].includes(q.state)) return q.state;
  return q.validUntil && now > q.validUntil ? 'expired' : q.state;
}

const cleanCustomer = (c) => Object.fromEntries(Object.entries({ name: c.name, phone: c.phone, tier: c.tier || '', kind: c.kind || 'wholesale', id: c.id || '', types: c.types || [], leadId: c.leadId || '', company: c.company || '', creditLimit: c.creditLimit || 0 }).filter(([, v]) => v !== '' && v !== 0 && !(Array.isArray(v) && !v.length)));
export function saveQuote({ id, customer, lines, validDays = 7, vatRate = 5, discount = 0, note = '', by = 'Staff', send = false }) {
  const list = all();
  const was = id ? list.find((x) => x.id === id) : null;
  if (was && was.state === 'converted') return was;
  const now = clockNow();
  const q = {
    ...(was || {}),
    id: was ? was.id : 'QT-' + String(all().reduce((m, x) => Math.max(m, Number(String(x.id).split('-')[1]) || 0), 0) + 1).padStart(4, '0'),
    at: was ? was.at : now, customer: cleanCustomer(customer), lines: lines.filter((l) => Number(l.qty) > 0).map((l) => ({ name: l.name, qty: Number(l.qty), price: Number(l.price) || 0, listPrice: l.listPrice != null ? Number(l.listPrice) : undefined, sku: l.sku || '' })),
    vatRate: Number(vatRate) || 0, discount: Math.max(0, Number(discount) || 0), note,
    // valid for N days from when it was sent (or made, while a draft)
    validUntil: (send ? now : was ? was.sentAt || was.at : now) + Math.max(1, Number(validDays) || 7) * DAY, state: send ? 'sent' : was ? (was.state === 'expired' ? 'draft' : was.state) : 'draft', by,
    ...(send ? { sentAt: now } : {}), rev: was ? (was.rev || 1) + 1 : 1,
  };
  return put(q);
}
export const sendQuote = (q) => put({ ...q, state: 'sent', sentAt: clockNow(), validUntil: Math.max(q.validUntil || 0, clockNow() + 7 * DAY) });
export const acceptQuote = (q) => put({ ...q, state: 'accepted', acceptedAt: clockNow() });
export const declineQuote = (q, reason = '') => put({ ...q, state: 'declined', declinedAt: clockNow(), reason });

/** The quotes of one buyer or lead, newest first. ref: { phone, id, leadId }. */
export function quotesFor({ phone, id, leadId } = {}) {
  const d = phoneDigits(phone);
  return getQuotes().filter((q) => (leadId && q.customer.leadId === leadId) || (id && q.customer.id === id) || (d && phoneDigits(q.customer.phone) === d))
    .sort((a, b) => b.at - a.at);
}

/** What converting this quote at `place` would run into: { ok, blocks, warnings, needPin, pinReason, lines }. */
export function checkQuote(q, { place } = {}) {
  const fresh = q.lines ? q : quoteBy(q.id) || q;   // the dialog passes the quote as it is on screen
  const t = quoteTotals(fresh);
  // a quote becomes an unpaid invoice: the whole total is left on credit
  return checkSale({ customer: fresh.customer, lines: fresh.lines, unpaid: t.total, place, wholesale: isWholesaleBuyer(fresh.customer) });
}

/** Turn an accepted (or sent) quote into an order + unpaid invoice with the goods held. Returns { ok, error, check, orderId, invoiceId }. */
export function convertQuote(q, { place, by = 'Staff', approvedBy = '' }) {
  const fresh = quoteBy(q.id) || q;
  if (fresh.state === 'converted') return { ok: true, orderId: fresh.orderId, invoiceId: fresh.invoiceId, again: true };
  if (['declined'].includes(fresh.state)) return { ok: false, error: 'This quote was declined.' };
  if (!fresh.lines.length) return { ok: false, error: 'The quote has no items.' };
  // the same checks as the POS: blocked → refused; over the limit / on hold → a manager approves first
  const check = checkQuote(fresh, { place });
  if (!check.ok) return { ok: false, error: check.blocks[0], check };
  if (check.needPin && !approvedBy) return { ok: false, error: check.pinReason, check, needPin: true };
  // a lead becomes a customer when its quote turns into an order
  let customer = fresh.customer;
  if (customer.leadId) {
    moveStage(customer.leadId, 'won', { by });
    customer = { ...customer, kind: 'customer' };
  }
  const t = quoteTotals(fresh);
  // the invoice is due by the buyer's payment terms (Net 7, Net 30 …; buyerTerms.js), when they have terms
  const dueAt = dueByTerms(buyerOfQuote(customer) || customer.phone, clockNow()) || undefined;
  const r = makeSale({ customer, lines: fresh.lines, discount: t.discount, vatRate: fresh.vatRate, note: fresh.note, place, by, quoteId: fresh.id, approvedBy, dueAt, idBase: 'SO-' + String(fresh.id).replace(/^QT-/, '') });
  if (!r.ok) return r;
  put({ ...fresh, state: 'converted', convertedAt: clockNow(), orderId: r.orderId, invoiceId: r.invoiceId, place, ...(approvedBy ? { approvedBy } : {}) });
  return { ok: true, orderId: r.orderId, invoiceId: r.invoiceId, route: r.route, warnings: check.warnings };
}
