// ledger — where money sits and every movement in or out of it. Sales, invoice payments, refunds,
// supplier payments and cash pickups post here, so Accounts (cash book, bank accounts) and every
// "pay from account" choice show the same balances.
// Front end only: opening balances are demo figures; entries are kept in this browser.

const KEY = 'gc.ledger';
export const ACCOUNTS = [
  { id: 'cash-shop', name: 'Cash in hand · shop', type: 'Cash', opening: 68400 },
  { id: 'safe', name: 'Shop safe', type: 'Cash', opening: 215000 },
  { id: 'drawer', name: 'Counter drawers', type: 'Cash', opening: 12600 },
  { id: 'bkash', name: 'bKash merchant · 01700-000000', type: 'Mobile', opening: 84250 },
  { id: 'nagad', name: 'Nagad merchant · 01700-000000', type: 'Mobile', opening: 31900 },
  { id: 'brac', name: 'BRAC Bank current', type: 'Bank', opening: 642300 },
  { id: 'dbbl', name: 'Dutch-Bangla savings', type: 'Bank', opening: 188750 },
  { id: 'card', name: 'Card settlements (to BRAC Bank)', type: 'Bank', opening: 0 },
];
export const accountBy = (idOrName) => ACCOUNTS.find((a) => a.id === idOrName || a.name === idOrName) || null;

/** The account a payment method lands in by default. `atCounter` = taken at a POS counter. */
export function accountForMethod(method, atCounter) {
  const m = String(method || '').toLowerCase();
  if (m === 'cash') return atCounter ? 'drawer' : 'cash-shop';
  if (m === 'bkash') return 'bkash';
  if (m === 'nagad' || m === 'rocket') return 'nagad';
  if (m === 'card') return 'card';
  if (m === 'bank') return 'brac';
  return null;   // due / credit / store credit: no money moved
}
/** Accounts a payment method can be paid from (for "pay from account" choices). */
export function accountsForMethod(method) {
  const m = String(method || '').toLowerCase();
  const type = m === 'cash' ? 'Cash' : m === 'bank' || m === 'card' ? 'Bank' : 'Mobile';
  return ACCOUNTS.filter((a) => a.type === type && (m !== 'bkash' || a.id === 'bkash') && (m !== 'nagad' || a.id === 'nagad') && a.id !== 'card');
}

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
export const getEntries = () => (typeof window === 'undefined' ? [] : read());

/**
 * Record money moving. amount > 0 comes in, amount < 0 goes out.
 * { account (id or name), amount, kind: 'sale'|'invoice payment'|'refund'|'supplier payment'|'cash pickup'|'cash in'|'paid out'|'expense'|'transfer', ref, party, note, by, at }
 * Returns the saved entry, or null when there is no account (e.g. "Due").
 */
export function postEntry(e) {
  const acc = accountBy(e.account);
  if (!acc || !e.amount) return null;
  const row = { id: 'LG-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: Date.now(), ...e, account: acc.id };
  try { window.localStorage.setItem(KEY, JSON.stringify([row, ...read()])); } catch { /* ignore */ }
  return row;
}
/** Move money between two of the shop's own accounts (e.g. drawer → safe). */
export function transferBetween(from, to, amount, meta = {}) {
  postEntry({ ...meta, account: from, amount: -Math.abs(amount), kind: meta.kind || 'transfer' });
  postEntry({ ...meta, account: to, amount: Math.abs(amount), kind: meta.kind || 'transfer' });
}
/** Current balance: opening + every entry. */
export function balanceOf(idOrName, entries = getEntries()) {
  const acc = accountBy(idOrName);
  if (!acc) return 0;
  return Math.round((acc.opening + entries.filter((x) => x.account === acc.id).reduce((a, x) => a + x.amount, 0)) * 100) / 100;
}
