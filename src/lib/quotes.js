// quotes — quotes (proformas) for wholesale buyers. Nayeem's Sales & Orders brief #4 › Wholesale: quote → customer
// approval → sales order → fulfil → invoice → collect, on the same order primitives (no second wholesale engine).
//   createQuote({ customer, lines, validDays, vatRate, discount, note, by })   priced from the buyer's price list
//                (customers.js › tierOf / tierPrice); a quote can be edited until it is converted
//   sendQuote · declineQuote · quoteState(q)   draft · sent · accepted · converted · declined · expired
//   convertQuote(q, { place, by })  makes what New sale makes for a wholesale buyer who takes the goods later: an
//                order (Orders, Approved, Unpaid), an unpaid invoice (Invoices, gc.pos.sales) and the goods held at
//                the place until the invoice's deliveries hand them over. Converting twice returns the first result.
// Kept in this browser (gc.quotes). Front end only.

import { addOrder } from './orderLinks';
import { POS_KEYS, load, save } from './posStore';
import { addHolds } from './stockHolds';
import { freezeLine } from './productCost';
import { clockNow } from './settlements';
import { PRICE_TIERS } from './customers';

const KEY = 'gc.quotes';
const DAY = 24 * 60 * 60 * 1000;
const r2 = (n) => Math.round(n * 100) / 100;
const at = (m, d, h) => new Date(2026, m, d, h, 0).getTime();

export const QUOTE_STATE = {
  draft: ['Draft', 'neutral'], sent: ['Sent', 'info'], accepted: ['Accepted', 'success'],
  converted: ['Converted', 'success'], declined: ['Declined', 'neutral'], expired: ['Expired', 'warning'],
};

const SEED = [
  { id: 'QT-0003', at: at(8, 30, 15), customer: { name: 'Jamal Telecom', phone: '01819447210', tier: 'A' }, lines: [{ name: 'Wireless Earbuds Pro', qty: 20, price: 3141 }, { name: 'Steel Water Bottle 750ml', qty: 48, price: 585 }], vatRate: 5, discount: 2000, validUntil: at(9, 10, 23), note: 'Delivery to Mirpur shop', state: 'sent', sentAt: at(8, 30, 16), by: 'Sadia Akter' },
  { id: 'QT-0002', at: at(9, 2, 11), customer: { name: 'Habib Telecom', phone: '01715332908', tier: 'A' }, lines: [{ name: 'Budget Android Phone 6/128', qty: 5, price: 13491 }], vatRate: 5, discount: 0, validUntil: at(9, 16, 23), note: '', state: 'draft', by: 'Sadia Akter' },
  { id: 'QT-0001', at: at(8, 12, 10), customer: { name: 'New Madina Telecom', phone: '01845667302', tier: 'B' }, lines: [{ name: 'Sunscreen SPF 50 · 50ml', qty: 24, price: 1063 }], vatRate: 5, discount: 0, validUntil: at(8, 25, 23), note: '', state: 'sent', sentAt: at(8, 12, 11), by: 'Arif Rahman' },
];

export function getQuotes() { return typeof window === 'undefined' ? SEED : load(KEY, SEED); }
export const quoteBy = (id) => getQuotes().find((q) => q.id === id) || null;
function put(q) { const list = getQuotes(); save(KEY, list.some((x) => x.id === q.id) ? list.map((x) => (x.id === q.id ? q : x)) : [q, ...list]); return q; }

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

export function saveQuote({ id, customer, lines, validDays = 7, vatRate = 5, discount = 0, note = '', by = 'Staff', send = false }) {
  const list = getQuotes();
  const was = id ? list.find((x) => x.id === id) : null;
  if (was && was.state === 'converted') return was;
  const now = clockNow();
  const q = {
    ...(was || {}),
    id: was ? was.id : 'QT-' + String(list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-')[1]) || 0), 0) + 1).padStart(4, '0'),
    at: was ? was.at : now, customer, lines: lines.filter((l) => Number(l.qty) > 0).map((l) => ({ name: l.name, qty: Number(l.qty), price: Number(l.price) || 0, listPrice: l.listPrice != null ? Number(l.listPrice) : undefined, sku: l.sku || '' })),
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

/** Turn an accepted (or sent) quote into an order + unpaid invoice with the goods held. Returns { ok, error, orderId, invoiceId }. */
export function convertQuote(q, { place, by = 'Staff' }) {
  const fresh = quoteBy(q.id) || q;
  if (fresh.state === 'converted') return { ok: true, orderId: fresh.orderId, invoiceId: fresh.invoiceId, again: true };
  if (['declined'].includes(fresh.state)) return { ok: false, error: 'This quote was declined.' };
  if (!fresh.lines.length) return { ok: false, error: 'The quote has no items.' };
  const t = quoteTotals(fresh);
  const sales = load(POS_KEYS.sales, []);
  const invoiceId = 'SO-' + String(fresh.id).replace(/^QT-/, '');
  const lines = fresh.lines.map((l, i) => ({ ...freezeLine({ name: l.name, qty: l.qty, price: l.price, sku: l.sku }), id: invoiceId + '-' + i, disc: 0 }));
  const order = addOrder({ lines, customer: fresh.customer.name, phone: fresh.customer.phone, zone: 'Wholesale', total: t.total, status: 'Approved', payment: 'Unpaid', channel: 'Wholesale · Quote ' + fresh.id, source: 'Quote', discount: t.discount, vat: t.tax, vatRate: fresh.vatRate, note: fresh.note });
  const sale = {
    id: invoiceId, orderId: order.id, quoteId: fresh.id, wholesale: true, tier: (PRICE_TIERS[fresh.customer.tier] || {}).label || '', invoice: true, rev: 1, payments: [], at: clockNow(),
    lines, customer: { name: fresh.customer.name, phone: fresh.customer.phone },
    totals: { gross: t.gross, lineDisc: 0, cartDisc: t.discount, couponDisc: 0, memberDisc: 0, pointsUsed: 0, pointsDisc: 0, taxable: t.taxable, tax: t.tax, total: t.total, units: t.units },
    tenders: [], change: 0, due: t.total, cashier: by, salesperson: by, counter: 'Quote ' + fresh.id, place, returned: {}, stockOut: false, deliveries: [],
  };
  save(POS_KEYS.sales, [sale, ...sales]);
  addHolds({ type: 'retail', ref: invoiceId, who: fresh.customer.name, place, note: `Quote ${fresh.id} · waiting for delivery`, by }, lines.map((l) => ({ name: l.name, qty: l.qty })));
  put({ ...fresh, state: 'converted', convertedAt: clockNow(), orderId: order.id, invoiceId, place });
  return { ok: true, orderId: order.id, invoiceId };
}
