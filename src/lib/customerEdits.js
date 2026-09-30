// customerEdits — changes made on the Customers pages to the demo customer list (the rows that are
// not in the customer book), merges of duplicate customers, and pairs marked "not the same".
// Book customers are changed through updateCustomer / mergeCustomers in customers.js; the demo list
// rows are kept here, by row id, and applied when the list loads.
// Front end only: everything is kept in this browser.

import { CUSTOMER_KEY, phoneDigits } from './customers';

export const DEMO_EDITS_KEY = 'gc.customers.demoEdits';   // demo row id -> { name, phone, address, types, tier, creditLimit }
export const MERGES_KEY = 'gc.customers.merges';          // [{ keep, drop, dropName, dropPhone, orders, spent, due, at }]
export const NOT_DUPES_KEY = 'gc.customers.notDupes';     // [pair id]

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
}
function write(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
}

export const getDemoEdits = () => read(DEMO_EDITS_KEY, {});
export function saveDemoEdit(id, patch) {
  const all = getDemoEdits();
  all[id] = { ...(all[id] || {}), ...patch };
  write(DEMO_EDITS_KEY, all);
}

export const getMerges = () => read(MERGES_KEY, []);
/** Record that `drop` was merged into `keep` (row keys), with the orders, spend and due it brings. */
export function addMerge(entry) { write(MERGES_KEY, [...getMerges(), { at: Date.now(), ...entry }]); }
/** Mobile numbers (digits) of the book customers merged into this one. */
export const mergedPhonesOf = (phone) => getMerges().filter((m) => m.keep === 'b:' + phoneDigits(phone) && m.drop.indexOf('b:') === 0).map((m) => m.drop.slice(2));

export const getNotDupes = () => read(NOT_DUPES_KEY, []);
export function addNotDupe(pairId) { write(NOT_DUPES_KEY, [...getNotDupes().filter((x) => x !== pairId), pairId]); }

/** Take a customer added in this browser back out of the customer book (undo of Add customer). */
export function removeFromBook(phone) {
  const d = phoneDigits(phone);
  const list = read(CUSTOMER_KEY, []);
  write(CUSTOMER_KEY, list.filter((c) => c.phone !== d));
}

/**
 * A demo list customer that was made a wholesale buyer on the Customers page, in the shape of a
 * book customer, so the wholesale profile can open it. `id` is the demo row id when known.
 */
export function demoCustomer(phone, id) {
  const edits = getDemoEdits();
  const d = phoneDigits(phone);
  const merged = new Set(getMerges().map((m) => m.drop));
  const pick = id && edits[id] ? [id, edits[id]] : Object.entries(edits).find(([, e]) => e.phone && phoneDigits(e.phone) === d);
  if (!pick || merged.has('d:' + pick[0])) return null;
  const [rowId, e] = pick;
  return { creditLimit: 0, types: [], ...e, phone: phoneDigits(e.phone) || d, shownPhone: e.phone, demoId: rowId };
}
