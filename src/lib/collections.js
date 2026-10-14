// collections — what to collect from buyers, by due date and by area (Wholesale review WH-F7).
//   collectionRows(now) → one row per buyer with money due, most urgent first:
//     { key, name, phone, address, area, invoices (oldest first), due, overdue, overdueCount, late (days, oldest),
//       nextDueAt, bucket: 'overdue' | 'week' | 'later', terms }
//   areaOf(address)      the area a buyer is in (a known Dhaka area, else the town/district at the end of the address),
//                        used as the collection route until reps and beats exist (WH-F10)
//   collectedIn(from, to) payments taken here (money receipts) in a period
// A payment is taken with allocations.js › allocatePayment (oldest invoice first) and gives a money receipt.
// Front end only: built from the invoices (invoices.js) and the customer book.

import { getInvoices, dueDateOf } from './invoices';
import { customerKeyOf, getAllocations } from './allocations';
import { getCustomers, findCustomer } from './customers';
import { termsForPhone } from './buyerTerms';
import { demoNow } from './demoClock';

const DAY = 864e5;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');

// areas a Dhaka shop's buyers are grouped by (first match in the address wins)
const AREAS = ['Mirpur', 'Mohammadpur', 'Dhanmondi', 'Uttara', 'Gulshan', 'Banani', 'Motijheel', 'Old Dhaka', 'Jatrabari', 'Badda', 'Rampura', 'Tejgaon',
  'Farmgate', 'Shyamoli', 'Mohakhali', 'Bashundhara', 'Khilgaon', 'Malibagh', 'Savar', 'Tongi', 'Gazipur', 'Narayanganj', 'Keraniganj', 'Ashulia'];
/** The area of an address: a known area, else the last part (town or district), else 'No area'. */
export function areaOf(address) {
  const a = String(address || '');
  if (!a.trim()) return 'No area';
  const hit = AREAS.find((x) => new RegExp('\\b' + x + '\\b', 'i').test(a));
  if (hit) return hit;
  const parts = a.split(',').map((x) => x.replace(/\d{4}/g, '').trim()).filter(Boolean);
  const last = parts[parts.length - 1] || '';
  return /^dhaka$/i.test(last) && parts.length > 1 ? parts[parts.length - 2] : last || 'No area';
}

/** Every buyer with money due, most urgent first (overdue longest, then soonest due). */
export function collectionRows(now = demoNow()) {
  if (typeof window === 'undefined') return [];
  const book = getCustomers();
  const groups = new Map();
  getInvoices().filter((inv) => inv.due > 0).forEach((inv) => {
    const key = customerKeyOf(inv);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(inv);
  });
  const rows = [...groups.entries()].map(([key, list]) => {
    const invoices = list.slice().sort((a, b) => a.at - b.at);
    const first = invoices[0];
    const phone = digits(first.customer && first.customer.phone);
    const cust = phone ? findCustomer(book, phone) : null;
    const address = (cust && cust.address) || (first.customer && first.customer.address) || '';
    const lateOf = (inv) => Math.floor((now - dueDateOf(inv)) / DAY);
    const over = invoices.filter((inv) => lateOf(inv) > 0);
    const late = over.reduce((a, inv) => Math.max(a, lateOf(inv)), 0);
    const nextDueAt = invoices.reduce((a, inv) => Math.min(a, dueDateOf(inv)), Infinity);
    const bucket = over.length ? 'overdue' : nextDueAt - now <= 7 * DAY ? 'week' : 'later';
    let terms = null;
    try { terms = phone ? termsForPhone(phone) : null; } catch { terms = null; }
    return {
      key, name: (cust && cust.name) || first.customer.name || 'Walk-in customer', phone, address, area: areaOf(address),
      wholesale: invoices.some((inv) => inv.wholesale), invoices, due: r2(invoices.reduce((a, inv) => a + inv.due, 0)),
      overdue: r2(over.reduce((a, inv) => a + inv.due, 0)), overdueCount: over.length, late, nextDueAt, bucket, terms: terms && terms.terms,
    };
  });
  return rows.sort((a, b) => b.late - a.late || a.nextDueAt - b.nextDueAt);
}
/** Days late (positive) or days left (negative) for a due date. */
export const daysLate = (dueAt, now = demoNow()) => Math.floor((now - dueAt) / DAY);
/** Payments taken as money receipts in [from, to). */
export const collectedIn = (from, to) => getAllocations().filter((a) => a.at >= from && a.at < to);
