// customerFacts — two facts about a customer row (lib/crm.js › getCrmRows) that the segment engine and the
// Customers list's More filters read (review CX-U3):
//   paidWithOf(c) → ['COD' | 'bKash' | 'Nagad' | 'Card' | 'Cash' | 'Bank' | 'Store credit']  how they have paid
//   hasOf(c)      → ['cart' | 'points' | 'due']   an abandoned cart, points about to expire, money they still owe
//   PAY_METHODS, HAS_FACTS   the choices, with their labels
// Customers in the customer book: from their invoices (tenders and payments). The demo customers (customers.js
// DEMO_LIST) carry no order rows, so their payment methods are part of the demo data below.
// Front end only.

import { getInvoices } from './invoices';

export const PAY_METHODS = [['COD', 'Cash on delivery'], ['bKash', 'bKash'], ['Nagad', 'Nagad'], ['Card', 'Card'], ['Cash', 'Cash'], ['Bank', 'Bank transfer'], ['Store credit', 'Store credit']];
export const HAS_FACTS = [['cart', 'Abandoned cart'], ['points', 'Points expiring'], ['due', 'Money due']];

// how each demo customer paid for their orders (customers.js › DEMO_LIST ids)
const DEMO_PAID = {
  c01: ['COD', 'bKash'], c02: ['Card'], c03: ['bKash', 'Card', 'Cash'], c05: ['COD'], c06: ['COD', 'Nagad'], c07: ['Cash'],
  c08: ['bKash', 'COD'], c10: ['COD'], c11: ['Cash', 'bKash'], c12: ['Nagad'],
};
/** One payment method name as the filters use it. */
export function payKey(m) {
  const s = String(m || '').toLowerCase();
  if (/bkash/.test(s)) return 'bKash';
  if (/nagad/.test(s)) return 'Nagad';
  if (/cod|on delivery/.test(s)) return 'COD';
  if (/card|visa|master|amex/.test(s)) return 'Card';
  if (/credit|wallet/.test(s)) return 'Store credit';
  if (/bank|transfer|cheque/.test(s)) return 'Bank';
  if (/cash/.test(s)) return 'Cash';
  return m ? String(m) : '';
}
let cache = { at: 0, inv: null };
const invoices = () => {
  if (typeof window === 'undefined') return [];
  const now = Date.now();
  if (!cache.inv || now - cache.at > 2000) cache = { at: now, inv: getInvoices() };   // one read per list render
  return cache.inv;
};
export function paidWithOf(c) {
  if (!c) return [];
  if (c.paidWith) return c.paidWith;
  if (c.origin === 'demo') return DEMO_PAID[c.demoId] || [];
  if (c.bookPhone) {
    const set = new Set();
    invoices().filter((r) => r.customer && r.customer.phone === c.bookPhone).forEach((r) => {
      [...(r.tenders || []), ...(r.payments || [])].forEach((p) => { const k = payKey(p.method); if (k) set.add(k); });
    });
    return [...set];
  }
  return [];
}
export function hasOf(c) {
  if (!c) return [];
  const f = c.f || [];
  return [f.includes('cart') ? 'cart' : '', f.includes('pts') ? 'points' : '', c.due > 0 ? 'due' : ''].filter(Boolean);
}
