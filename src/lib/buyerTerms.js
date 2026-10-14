// buyerTerms — payment terms per buyer (WH-F6) and the overdue credit hold (WH-F8).
//
//   Payment terms are picked from a list (Net 0 · 7 · 15 · 30 · 45). They are set on the buyer (or on their company,
//   which every contact person of that company follows). An invoice's due date is the sale date + the terms' days;
//   Dues and the customer's Invoices area count lateness from that due date.
//     TERMS                     the list: [{ k: 'Net 30', days: 30, label }]
//     termsDays(text)           'Net 30' → 30, 'Due on receipt' / 'Net 0' → 0, anything else → null
//     termsOf(customer)         { terms, days, from: 'buyer' | 'company' | 'default' } or null (no terms: retail rules)
//     termsForPhone(phone)      the same, found by mobile number (invoices only keep the customer's name and phone)
//     setTerms(customer, terms) save a buyer's terms ('' clears them)
//
//   Overdue hold: a buyer with an invoice more than `days` days past its due date is put on hold. On hold, a sale
//   that leaves money unpaid (or every sale, `scope: 'all'`) is refused, or needs a manager's PIN (`action`).
//     getHoldRules() / saveHoldRules(patch)   { on, days, action: 'pin' | 'block', scope: 'due' | 'all' }
//
// Front end only: kept in this browser (gc.buyer.terms, gc.credit.hold). A real shop keeps both on the server.

import { getCustomers, findCustomer, phoneDigits, resolveCustomer } from './customers';

const TERMS_KEY = 'gc.buyer.terms';     // { customer id: 'Net 30' }
const HOLD_KEY = 'gc.credit.hold';
export const TERMS_EVENT = 'gc:buyer-terms';
export const HOLD_EVENT = 'gc:credit-hold';
const DAY = 864e5;

export const TERMS = [
  { k: 'Net 0', days: 0, label: 'Net 0 · pay on delivery' },
  { k: 'Net 7', days: 7, label: 'Net 7 · 7 days' },
  { k: 'Net 15', days: 15, label: 'Net 15 · 15 days' },
  { k: 'Net 30', days: 30, label: 'Net 30 · 30 days' },
  { k: 'Net 45', days: 45, label: 'Net 45 · 45 days' },
];
/** Wholesale buyers with no terms of their own pay in 30 days (what every wholesale invoice used before). */
export const DEFAULT_TERMS = 'Net 30';

// demo buyers' terms (Dazzle Shop's wholesale book); ABC Electronics keeps its own 'Net 30' on the company row
const SEED = { 'C-08012': 'Net 15', 'C-08013': 'Net 7', 'C-08020': 'Net 7', 'C-08031': 'Net 30', 'C-08044': 'Net 45' };

const ssr = () => typeof window === 'undefined';
function readJSON(key, fallback) {
  if (ssr()) return fallback;
  try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
}
function writeJSON(key, value, event) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent(event)); } catch { /* storage blocked */ }
  cache.clear();
}

/** Days of a terms text: 'Net 30' → 30; 'Net 0', 'Cash', 'COD', 'Due on receipt' → 0; unknown → null. */
export function termsDays(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const m = /net\s*-?\s*(\d{1,3})/i.exec(t) || /^(\d{1,3})\s*days?$/i.exec(t);
  if (m) return Number(m[1]);
  if (/^(cash|cod|due on receipt|on delivery|advance)/i.test(t)) return 0;
  return null;
}
/** The list entry for a terms text (an old free-text value that names a known term maps onto it). */
export const termsEntry = (text) => { const d = termsDays(text); return d == null ? null : TERMS.find((x) => x.days === d) || { k: 'Net ' + d, days: d, label: 'Net ' + d + ' · ' + d + ' days' }; };

const saved = () => ({ ...SEED, ...readJSON(TERMS_KEY, {}) });
const isWholesale = (c) => !!(c && (c.types || []).includes('Wholesale'));
// one lookup per customer while nothing changes (Dues and the invoice lists ask for every invoice)
const cache = new Map();
let cacheAt = 0;
const fresh = () => { if (Date.now() - cacheAt > 3000) { cache.clear(); cacheAt = Date.now(); } };

/** A customer row (book or directory), a customer ID or a phone → the directory row (with company link), or the row itself. */
function profileOf(customer) {
  if (!customer) return null;
  if (typeof customer === 'string') {
    const d = phoneDigits(customer);
    const book = d.length >= 10 ? findCustomer(getCustomers(), d) : null;
    return (book && (safeResolve(book.id) || book)) || safeResolve(customer);
  }
  return (customer.id && safeResolve(customer.id)) || customer;
}
function safeResolve(ref) { try { return ssr() ? null : resolveCustomer(ref); } catch { return null; } }

/** The terms a customer pays on: their own, else their company's, else Net 30 for a wholesale buyer, else null. */
export function termsOf(customer) {
  const c = profileOf(customer);
  if (!c) return null;
  const own = saved();
  const pick = (text, from) => { const e = termsEntry(text); return e ? { terms: e.k, days: e.days, label: e.label, from } : null; };
  const mine = pick(own[c.id], 'buyer') || pick(c.terms, 'buyer');
  if (mine) return mine;
  if (c.companyId) {
    const co = safeResolve(c.companyId);
    const theirs = co && (pick(own[co.id], 'company') || pick(co.terms, 'company'));
    if (theirs) return { ...theirs, company: co.name };
  }
  return isWholesale(c) || c.kind === 'company' ? { ...pick(DEFAULT_TERMS, 'default') } : null;
}
/** termsOf for the customer with this mobile number (cached for a few seconds). */
export function termsForPhone(phone) {
  const d = phoneDigits(phone);
  if (!d || ssr()) return null;
  fresh();
  if (!cache.has(d)) cache.set(d, termsOf(d));
  return cache.get(d);
}
/** Save a buyer's (or company's) terms: one of TERMS' k, or '' to clear them. */
export function setTerms(customer, terms) {
  const c = profileOf(customer);
  if (!c || !c.id) return null;
  const next = readJSON(TERMS_KEY, {});
  next[c.id] = terms ? (termsEntry(terms) || {}).k || '' : '';
  writeJSON(TERMS_KEY, next, TERMS_EVENT);
  return termsOf(c);
}
/** When an invoice made at `at` for this customer falls due, or null when they have no terms. */
export function dueByTerms(customer, at = Date.now()) {
  const t = typeof customer === 'string' ? termsForPhone(customer) : termsOf(customer);
  return t ? at + t.days * DAY : null;
}

// ---- overdue credit hold ----------------------------------------------------------------------------------------
export const DEFAULT_HOLD = { on: true, days: 14, action: 'pin', scope: 'due' };
export const HOLD_ACTIONS = [['pin', 'Ask for a manager’s PIN'], ['block', 'Refuse the sale']];
export const HOLD_SCOPES = [['due', 'Sales left unpaid'], ['all', 'Every sale']];
export function getHoldRules() {
  return { ...DEFAULT_HOLD, ...readJSON(HOLD_KEY, {}) };
}
export function saveHoldRules(patch) {
  const next = { ...getHoldRules(), ...patch };
  next.days = Math.min(365, Math.max(0, Math.round(Number(next.days) || 0)));
  if (!HOLD_ACTIONS.some((x) => x[0] === next.action)) next.action = DEFAULT_HOLD.action;
  if (!HOLD_SCOPES.some((x) => x[0] === next.scope)) next.scope = DEFAULT_HOLD.scope;
  writeJSON(HOLD_KEY, next, HOLD_EVENT);
  return next;
}
