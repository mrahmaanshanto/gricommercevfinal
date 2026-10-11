// customerData — the phone app's customer helpers, composed from the libs the web Customers pages read:
// lib/crm.js (getCrmRows: one row per customer with orders, spend, due, views and restrictions), customers.js
// (resolveCustomer, saveCustomerOnce, updateIdentity), segments.js, invoices.js, customerWarranty.js, orders.js.
//   VIEWS                        the list's chips (the web's ready views that fit a phone)
//   inView(row, key)             does a row belong to a view
//   profileOf(ref, rows, orders) one customer by customer ID or any phone: the CRM row, or — for a number that only
//                                appears on orders (a guest) — a row built from those orders
//   moneyOf(phones)              { invoices (unpaid), owed, overdue, credit } from the invoices book
// Front end only (this browser).

import { resolveCustomer, isCustomerId, normalizePhone } from '@/lib/customers';
import { crmRow } from '@/lib/crm';
import { getInvoices, stageOf, STAGES, isOverdue, creditOf } from '@/lib/invoices';

export const VIEWS = [
  { key: 'all', label: 'All' },
  { key: 'repeat', label: 'Repeat buyers' },
  { key: 'big', label: 'Big spenders' },
  { key: 'due', label: 'With dues' },
  { key: 'week', label: 'New this week' },
  { key: 'restricted', label: 'Restricted' },
];
export function inView(r, key) {
  if (key === 'all') return true;
  if (key === 'due') return (r.due || 0) > 0;
  return (r.f || []).includes(key);
}

const digits = (p) => normalizePhone(p) || String(p || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
/** Every usable number of a row (digits). */
export const phonesOf = (c) => [...new Set([...(c.phones || []).map((p) => digits(p.value)), digits(c.bookPhone), digits(c.phone)].filter((d) => d && d.length >= 10))];

/** One customer by ID or phone. → { c, guest } or null */
export function profileOf(ref, rows, orders) {
  const text = String(ref || '').trim();
  if (!text) return null;
  if (isCustomerId(text)) { const c = crmRow(text.toUpperCase(), rows); return c ? { c, guest: false } : null; }
  const hit = resolveCustomer(text);
  const c = hit ? crmRow(hit.id, rows) : null;
  if (c) return { c, guest: false };
  // a number that is only on orders: a guest, built from the orders
  const d = digits(text);
  const mine = orders.filter((o) => digits(o.phone) === d).sort((a, b) => (b.at || 0) - (a.at || 0));
  if (!mine.length) return null;
  const last = mine[0];
  const done = mine.filter((o) => o.statusKey !== 'cancelled');
  return {
    guest: true,
    c: {
      id: '', name: last.customer || 'Customer', phone: last.phone, digits: d, phones: [{ value: last.phone, verified: false }], address: last.address || '',
      area: '', status: 'Active', tags: [], notes: [], orders: done.length, spent: done.reduce((a, o) => a + (o.amount || 0), 0), due: 0,
      restrictions: [], restrictionShort: [], level: '', signup: '', kind: 'person',
    },
  };
}

/** Unpaid invoices, what is owed and overdue, and store credit, for a customer's numbers. */
export function moneyOf(phones) {
  const want = new Set(phones);
  const inv = getInvoices().filter((r) => want.has(digits(r.customer && r.customer.phone)));
  const open = inv.filter((r) => r.due > 0);
  return {
    invoices: open.map((r) => ({ id: r.id, at: r.at, due: r.due, total: r.totals ? r.totals.total : 0, stage: (STAGES[stageOf(r)] || {}).label || '', late: isOverdue(r) })),
    owed: open.reduce((a, r) => a + r.due, 0),
    overdue: open.filter((r) => isOverdue(r)).length,
    credit: phones.reduce((a, p) => a + (creditOf(p) || 0), 0),
  };
}
