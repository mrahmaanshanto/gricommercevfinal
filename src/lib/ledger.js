// ledger — where money sits and every movement in or out of it. Sales, invoice payments, refunds,
// supplier payments and cash pickups post here, so Accounts (cash book, bank accounts) and every
// "pay from account" choice show the same balances.
// Front end only: opening balances are demo figures; entries are kept in this browser.

const KEY = 'gc.ledger';
import { ITEM_SEED, ITEMS_KEY } from './settlementSeed';
import { LEDGER_SEED } from './ledgerSeed';

// type: Cash · Bank · Mobile (the shop's own money) · Holding (money a payment gateway or courier
// has collected for the shop and has not paid out yet — see settlements.js)
export const ACCOUNTS = [
  { id: 'cash-shop', name: 'Cash in hand · shop', type: 'Cash', brand: 'cash', opening: 68400 },
  { id: 'safe', name: 'Shop safe', type: 'Cash', brand: 'safe', opening: 215000 },
  { id: 'drawer', name: 'Counter drawers', type: 'Cash', brand: 'drawer', opening: 12600 },
  { id: 'citybank', name: 'City Bank current', type: 'Bank', brand: 'citybank', opening: 356400 },
  { id: 'brac', name: 'BRAC Bank current', type: 'Bank', brand: 'bracbank', opening: 642300 },
  { id: 'dbbl', name: 'Dutch-Bangla savings', type: 'Bank', brand: 'dbbl', opening: 188750 },
  { id: 'bkash', name: 'bKash merchant · 01700-000000', type: 'Mobile', brand: 'bkash', opening: 84250 },
  { id: 'nagad', name: 'Nagad merchant · 01700-000000', type: 'Mobile', brand: 'nagad', opening: 31900 },
  { id: 'rocket', name: 'Rocket merchant · 01700-000000', type: 'Mobile', brand: 'rocket', opening: 18300 },
  { id: 'h-bkash', name: 'bKash gateway (to be paid out)', type: 'Holding', brand: 'bkash', partner: 'bkash-pgw', opening: 0 },
  { id: 'h-nagad', name: 'Nagad gateway (to be paid out)', type: 'Holding', brand: 'nagad', partner: 'nagad-pgw', opening: 0 },
  { id: 'h-ssl', name: 'SSLCOMMERZ (to be paid out)', type: 'Holding', brand: 'sslcommerz', partner: 'sslcommerz', opening: 0 },
  { id: 'h-eps', name: 'EPS wallet (withdraw to use)', type: 'Holding', brand: 'eps', partner: 'eps', opening: 0 },
  { id: 'card', name: 'Card payments (to be paid out)', type: 'Holding', brand: 'card', partner: 'card', opening: 0 },
  { id: 'h-pathao', name: 'Pathao COD (to be paid out)', type: 'Holding', brand: 'pathao', partner: 'pathao', opening: 0 },
  { id: 'h-steadfast', name: 'Steadfast COD (to be paid out)', type: 'Holding', brand: 'steadfast', partner: 'steadfast', opening: 0 },
  { id: 'h-redx', name: 'RedX COD (to be paid out)', type: 'Holding', brand: 'redx', partner: 'redx', opening: 0 },
  { id: 'h-carrybee', name: 'Carrybee COD (to be paid out)', type: 'Holding', brand: 'carrybee', partner: 'carrybee', opening: 0 },
];
/** Labels for every kind of entry, for lists and filters. */
export const KIND_LABEL = {
  sale: 'Sale', 'invoice payment': 'Invoice payment', 'order payment': 'Order payment', refund: 'Refund',
  'supplier payment': 'Supplier payment', 'cash pickup': 'Cash pickup', 'cash in': 'Cash added', 'paid out': 'Paid out',
  expense: 'Expense', transfer: 'Transfer', collected: 'Collected by partner', settlement: 'Payout',
  'partner fee': 'Gateway / COD fee', 'courier charge': 'Delivery charge', 'settlement difference': 'Payout difference',
  withdraw: 'Withdraw', 'owner withdraw': 'Owner withdraw', investment: 'Investment', salary: 'Salary',
  income: 'Other income', commission: 'Sales commission', 'affiliate payout': 'Affiliate payout', promotion: 'Promotion',
  'staff loan': 'Staff loan / advance', 'loan repayment': 'Loan repaid by staff',
  'wallet top-up': 'Customer wallet top-up', 'wallet refund': 'Wallet paid back', 'loyalty reward': 'Loyalty reward', 'referral reward': 'Referral reward',
};
export const accountBy = (idOrName) => ACCOUNTS.find((a) => a.id === idOrName || a.name === idOrName) || null;

/** The account a payment method lands in by default. `atCounter` = taken at a POS counter. */
export function accountForMethod(method, atCounter) {
  const m = String(method || '').toLowerCase();
  if (m === 'cash') return atCounter ? 'drawer' : 'cash-shop';
  if (m === 'bkash') return 'bkash';
  if (m === 'nagad') return 'nagad';
  if (m === 'rocket') return 'rocket';
  if (m === 'card') return 'card';   // card money is paid out by the bank later (settlements.js)
  if (m === 'bkash online' || m === 'bkash gateway') return 'h-bkash';
  if (m === 'nagad online' || m === 'nagad gateway') return 'h-nagad';
  if (m === 'sslcommerz') return 'h-ssl';
  if (m === 'eps') return 'h-eps';
  if (m === 'bank' || m === 'bank transfer') return 'brac';
  return null;   // due / credit / store credit: no money moved
}
/** Accounts a payment method can be paid from (for "pay from account" choices). */
export function accountsForMethod(method) {
  const m = String(method || '').toLowerCase();
  const type = m === 'cash' ? 'Cash' : m === 'bank' || m === 'card' || m === 'bank transfer' ? 'Bank' : 'Mobile';
  return ACCOUNTS.filter((a) => a.type === type && (m !== 'bkash' || a.id === 'bkash') && (m !== 'nagad' || a.id === 'nagad') && (m !== 'rocket' || a.id === 'rocket'));
}
/** The shop's own money accounts (not the partners' holding accounts). */
export const OWN_ACCOUNTS = () => ACCOUNTS.filter((a) => a.type !== 'Holding');
export const HOLDING_ACCOUNTS = () => ACCOUNTS.filter((a) => a.type === 'Holding');


// accounts the merchant added in Accounts › Setup
const EXTRA_KEY = 'gc.ledger.accounts';
if (typeof window !== 'undefined') {
  try { (JSON.parse(window.localStorage.getItem(EXTRA_KEY)) || []).forEach((a) => { if (!ACCOUNTS.some((x) => x.id === a.id)) ACCOUNTS.push(a); }); } catch { /* ignore */ }
}
/** Add a bank, wallet or cash account: { name, type: 'Cash'|'Bank'|'Mobile', brand, opening }. */
export function addAccount(a) {
  const row = { ...a, id: 'acc-' + Date.now().toString(36), opening: Number(a.opening) || 0, custom: true };
  ACCOUNTS.push(row);
  try { const list = JSON.parse(window.localStorage.getItem(EXTRA_KEY)) || []; window.localStorage.setItem(EXTRA_KEY, JSON.stringify([...list, row])); } catch { /* ignore */ }
  changed();
  return row;
}
const changed = () => { try { window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
/** Every entry, newest first: the ones made in this browser, then the demo month (ledgerSeed.js). */
export const getEntries = () => (typeof window === 'undefined' ? LEDGER_SEED : [...read(), ...LEDGER_SEED]);

/**
 * Record money moving. amount > 0 comes in, amount < 0 goes out.
 * { account (id or name), amount, kind: 'sale'|'invoice payment'|'refund'|'supplier payment'|'cash pickup'|'cash in'|'paid out'|'expense'|'transfer', ref, party, note, by, at }
 * Returns the saved entry, or null when there is no account (e.g. "Due").
 */
export function postEntry(e) {
  const acc = accountBy(e.account);
  if (!acc || !e.amount) return null;
  const { item, charge, dhaka, ...rest } = e;
  const row = { id: 'LG-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: Date.now(), ...rest, account: acc.id };
  try { window.localStorage.setItem(KEY, JSON.stringify([row, ...read()])); } catch { /* ignore */ }
  // money taken by a gateway, card machine or courier: it also waits in that partner's next payout
  // (settlements.js posts its own payouts and fees with item: false)
  if (acc.type === 'Holding' && item !== false) addSettleItem({ id: 'SI-' + row.id.slice(3), partner: acc.partner, at: row.at, ref: e.ref || '', party: e.party || '', gross: Math.round(e.amount * 100) / 100, charge: charge || 0, dhaka: dhaka !== false });
  changed();
  return row;
}
function addSettleItem(it) {
  try { const list = JSON.parse(window.localStorage.getItem(ITEMS_KEY)) || ITEM_SEED; window.localStorage.setItem(ITEMS_KEY, JSON.stringify([...list, it])); } catch { /* ignore */ }
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
