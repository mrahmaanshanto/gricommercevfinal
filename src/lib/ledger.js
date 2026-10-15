// ledger — where money sits and every movement in or out of it. Sales, invoice payments, refunds,
// supplier payments and cash pickups post here, so Accounts (cash book, bank accounts) and every
// "pay from account" choice show the same balances.
// Front end only: opening balances are demo figures; entries are kept in this browser.

const KEY = 'gc.ledger';
import { ITEM_SEED, ITEMS_KEY } from './settlementSeed';
import { LEDGER_SEED } from './ledgerSeed';
import { platformRows } from './platformCosts';
import { liveCounterLedger } from './liveCounterSales';

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
  // prepaid balance for SMS, WhatsApp, email and AI calls (platformCosts.js): usage is billed from it each month
  { id: 'gc-credits', name: 'GridCommerce credits', type: 'Mobile', brand: 'gridcommerce', opening: 4645.5, credits: true },
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
  if (m === 'cheque') return 'brac';   // a buyer's cheque is paid into the bank (Collections, WH-F7)
  return null;   // due / credit / store credit: no money moved
}
/** Accounts a payment method can be paid from (for "pay from account" choices). */
export function accountsForMethod(method) {
  const m = String(method || '').toLowerCase();
  const type = m === 'cash' ? 'Cash' : m === 'bank' || m === 'card' || m === 'bank transfer' ? 'Bank' : 'Mobile';
  return ACCOUNTS.filter((a) => a.type === type && !a.credits && !isArchived(a.id) && (m !== 'bkash' || a.id === 'bkash') && (m !== 'nagad' || a.id === 'nagad') && (m !== 'rocket' || a.id === 'rocket'));
}
/** The shop's own money accounts (not the partners' holding accounts, not the GridCommerce credits balance). */
export const OWN_ACCOUNTS = () => ACCOUNTS.filter((a) => a.type !== 'Holding' && !a.credits);
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
/** Every entry, newest first: the ones made in this browser, the platform's own monthly bills (platformCosts.js),
 *  the counters' takings after September (liveCounterSales.js), then the demo month (ledgerSeed.js). */
export const getEntries = () => (typeof window === 'undefined' ? [...platformRows(), ...LEDGER_SEED] : withMeta([...read(), ...platformRows(), ...liveCounterLedger(), ...recurringRows(), ...LEDGER_SEED]).sort((a, b) => b.at - a.at));

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
  // both sides carry the same `pair`, so opening one finds the other (and reversing one reverses both)
  const pair = meta.pair || 'TP-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  postEntry({ ...meta, pair, account: from, amount: -Math.abs(amount), kind: meta.kind || 'transfer' });
  postEntry({ ...meta, pair, account: to, amount: Math.abs(amount), kind: meta.kind || 'transfer' });
}
/** Current balance: opening + every entry. */
export function balanceOf(idOrName, entries = getEntries()) {
  const acc = accountBy(idOrName);
  if (!acc) return 0;
  return Math.round((acc.opening + entries.filter((x) => x.account === acc.id).reduce((a, x) => a + x.amount, 0)) * 100) / 100;
}

// ---- account properties, archive / restore (brief #6) ---------------------------------------------
// Each money account carries: currency, branch, who may use it (roles from team.js), how its statement is
// matched, the date it was last matched and whether it is active or archived. Kept in gc.ledger.props
// (id -> changes); the defaults below are the demo shop's. An account can be archived only when it holds
// ৳0, so money never disappears from the books; its history stays. Front end only.
const PROPS_KEY = 'gc.ledger.props';
export const CURRENCIES = [['BDT', 'Bangladeshi taka (৳)']];
/** How statement lines are matched to this account's entries (statementImport.js). */
export const MATCH_RULES = [['amount', 'Same amount, within 3 days'], ['ref', 'Same amount and reference'], ['manual', 'By hand only']];
const PROPS_SEED = {
  'cash-shop': { branch: 'Head office', roles: ['ceo'], match: 'manual' },
  safe: { branch: 'Dhanmondi branch', roles: ['ceo', 'shop-manager'], match: 'manual' },
  drawer: { branch: 'Dhanmondi branch', roles: ['shop-manager', 'shop-supervisor', 'seller'], match: 'manual' },
  citybank: { branch: 'Head office', roles: ['ceo'], lastMatched: new Date(2026, 8, 30, 18, 0).getTime() },
  brac: { branch: 'Head office', roles: ['ceo'], match: 'amount', lastMatched: new Date(2026, 8, 25, 17, 0).getTime() },
  dbbl: { branch: 'Head office', roles: ['ceo'] },
  bkash: { branch: 'Head office', roles: ['ceo', 'orders'], match: 'ref', lastMatched: new Date(2026, 8, 30, 21, 0).getTime() },
  nagad: { branch: 'Head office', roles: ['ceo', 'orders'], match: 'ref' },
  rocket: { branch: 'Head office', roles: ['ceo'], match: 'ref' },
};
const readProps = () => { try { return JSON.parse(window.localStorage.getItem(PROPS_KEY)) || {}; } catch { return {}; } };
/** { currency, branch, roles: [], match, lastMatched (ms|null), status: 'active'|'archived', archivedAt, archivedBy } */
export function accountProps(id) {
  const acc = accountBy(id);
  const key = acc ? acc.id : id;
  const stored = typeof window === 'undefined' ? {} : readProps()[key] || {};
  return { currency: 'BDT', branch: '', roles: [], match: 'amount', lastMatched: null, status: 'active', ...(PROPS_SEED[key] || {}), ...stored };
}
export function setAccountProps(id, patch) {
  const acc = accountBy(id);
  if (!acc) return null;
  const all = readProps();
  all[acc.id] = { ...(all[acc.id] || {}), ...patch };
  try { window.localStorage.setItem(PROPS_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  changed();
  return accountProps(acc.id);
}
export const isArchived = (id) => accountProps(id).status === 'archived';
/** The shop's own accounts that are still in use (pickers hide archived ones; lists and history keep them). */
export const ACTIVE_ACCOUNTS = () => OWN_ACCOUNTS().filter((a) => !isArchived(a.id));
/**
 * Archive an account. Allowed only when it holds ৳0. Returns { ok, message }.
 * Partner holding accounts are archived by removing the partner (Setup › Payment partners), not here.
 */
export function archiveAccount(id, by = 'Staff') {
  const acc = accountBy(id);
  if (!acc) return { ok: false, message: 'That account could not be found.' };
  if (acc.type === 'Holding' || acc.credits) return { ok: false, message: `${acc.name} is kept by GridCommerce and can’t be archived.` };
  const bal = balanceOf(acc.id);
  if (Math.abs(bal) >= 0.005) {
    const amt = '৳' + Math.abs(bal).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    return { ok: false, balance: bal, message: bal > 0 ? `${acc.name} still holds ${amt}. Move it to another account first; only an account at ৳0 can be archived.` : `${acc.name} is ${amt} below zero. Bring it back to ৳0 first; only an account at ৳0 can be archived.` };
  }
  setAccountProps(acc.id, { status: 'archived', archivedAt: Date.now(), archivedBy: by });
  return { ok: true, message: `${acc.name} archived. Its history stays.` };
}
export function restoreAccount(id) {
  const acc = accountBy(id);
  if (!acc) return { ok: false, message: 'That account could not be found.' };
  setAccountProps(acc.id, { status: 'active', archivedAt: null, archivedBy: null });
  return { ok: true, message: `${acc.name} restored.` };
}

// ---- open a movement: its note, receipts and a reversal (MS-F7) ------------------------------------
// Nothing is ever edited or deleted. A wrong entry is put right by a reversal: a mirror entry (same account,
// kind and category, the opposite amount, dated when it is made) that names the entry it reverses (`reverses`),
// while the original gets `reversedBy`. Both stay in the books, so balances, profit and reports net out and
// the trail shows who reversed what and why. A move between two of the shop's accounts is reversed on both
// sides. Rows GridCommerce works out by itself (platform bills `auto`, the counters' live takings `live`)
// and money that belongs to another record (a sale, an invoice, a payout, a supplier bill, a bill to pay)
// can't be reversed here: they are put right where they were made (reverseCheck says where).
// Notes and receipt photos added later, and the reversal links, are kept per entry id in gc.ledger.meta, so
// they work for the demo month and the generated rows too. Front end only: a real build keeps this server-side.
const META_KEY = 'gc.ledger.meta';
const readMeta = () => { try { return JSON.parse(window.localStorage.getItem(META_KEY)) || {}; } catch { return {}; } };
const writeMeta = (m) => { try { window.localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { /* storage full or blocked */ } };
function withMeta(rows) {
  const m = readMeta();
  if (!Object.keys(m).length) return rows;
  return rows.map((r) => {
    const x = m[r.id];
    if (!x) return r;
    const { files, ...rest } = x;
    return { ...r, ...rest, files: [...(r.files || []), ...(files || [])] };
  });
}
export const entryBy = (id, entries = getEntries()) => entries.find((e) => e.id === id) || null;
/** Worked out by GridCommerce (platform bills, the counters' live takings): not a record anyone made. */
export const isGenerated = (e) => !!(e && (e.auto || e.live));

const FROM_RECORD = {
  sale: ['It comes from a sale. Return or cancel the sale instead.', '/sales-book', 'Sales book'],
  'order payment': ['It is an order’s payment. Change it on the order.', '', 'Order'],
  'invoice payment': ['It is an invoice payment. Void the payment on the invoice.', '/sales-invoices', 'Invoices'],
  refund: ['It is a refund. Refunds are handled in Payment operations.', '/payment-ops', 'Payment operations'],
  'supplier payment': ['It pays a supplier’s bill. Change it on the supplier’s bills.', '/dues?tab=owe', 'Dues'],
  'staff loan': ['It is a staff loan. Change it in Loans & advances.', '/loans-advances', 'Loans & advances'],
  'loan repayment': ['It is a loan repayment. Change it in Loans & advances.', '/loans-advances', 'Loans & advances'],
  'wallet top-up': ['It is store credit. Change it in Store credit.', '/wallet', 'Store credit'],
  'wallet refund': ['It is store credit. Change it in Store credit.', '/wallet', 'Store credit'],
  'loyalty reward': ['It is a loyalty reward. Change it in Loyalty & rewards.', '/loyalty', 'Loyalty & rewards'],
  'referral reward': ['It is a referral reward. Change it in Invite a friend.', '/referrals', 'Invite a friend'],
};
const PAYOUT_KINDS = ['collected', 'settlement', 'partner fee', 'courier charge', 'settlement difference', 'withdraw'];
/** Can this entry be reversed here? { ok } or { ok: false, why, href, label } (where it is put right instead). */
export function reverseCheck(e) {
  if (!e) return { ok: false, why: 'That entry could not be found.' };
  if (e.reverses) return { ok: false, why: 'This entry is a reversal. It can’t be reversed again.' };
  if (e.reversedBy) return { ok: false, why: 'This entry is already reversed.' };
  if (e.auto) return { ok: false, why: 'GridCommerce adds this bill every month. Ask GridCommerce support if it is wrong.', href: '/help-support', label: 'Help & support' };
  if (e.live) return { ok: false, why: 'It is worked out from the counters’ sales. Return or cancel the sale instead.', href: '/sales-book', label: 'Sales book' };
  const acc = accountBy(e.account);
  if ((acc && acc.type === 'Holding') || PAYOUT_KINDS.includes(e.kind)) return { ok: false, why: 'It is money a payment partner holds or paid out. Put it right in Payouts.', href: '/settlements', label: 'Payouts' };
  if (e.liab) return { ok: false, why: 'It pays a bill in Bills to pay. Change it there.', href: '/liabilities', label: 'Bills to pay' };
  const rec = FROM_RECORD[e.kind];
  if (rec) return { ok: false, why: rec[0], href: rec[1], label: rec[2] };
  return { ok: true };
}
/** The other side of a move between two of the shop's accounts (transfer, cash pickup), or null. */
export function pairOf(e, entries = getEntries()) {
  if (!e || !['transfer', 'cash pickup'].includes(e.kind)) return null;
  if (e.pair) return entries.find((x) => x.pair === e.pair && x.id !== e.id) || null;
  return entries.find((x) => x.id !== e.id && x.kind === e.kind && Math.abs(x.amount + e.amount) < 0.005 && Math.abs(x.at - e.at) <= 5 * 60000
    && (x.ref || '') === (e.ref || '') && (x.note || '') === (e.note || '')) || null;
}
/**
 * Reverse an entry (and the other side of a move between accounts): posts the mirror entry and links both ways.
 * Returns { ok, message, rows }.
 */
export function reverseEntry(id, why, by = 'Staff') {
  const all = getEntries();
  const e = entryBy(id, all);
  const chk = reverseCheck(e);
  if (!chk.ok) return { ok: false, message: chk.why };
  const reason = String(why || '').trim();
  if (!reason) return { ok: false, message: 'Say why it is reversed.' };
  const other = pairOf(e, all);
  const meta = readMeta();
  const rows = [e, other].filter(Boolean).map((x) => {
    const row = postEntry({
      account: x.account, amount: -x.amount, kind: x.kind, cat: x.cat, channel: x.channel, place: x.place, party: x.party,
      ref: x.ref, pair: x.pair ? x.pair + '-R' : undefined, note: reason, by, reverses: x.id, item: false,
    });
    if (row) meta[x.id] = { ...(meta[x.id] || {}), reversedBy: row.id, reversedAt: row.at, reversedByName: by, reversedWhy: reason };
    return row;
  }).filter(Boolean);
  writeMeta(meta);
  changed();
  return { ok: rows.length > 0, rows, message: rows.length > 1 ? 'Both sides of the move were reversed.' : 'Entry reversed.' };
}
/** Change an entry's note (the old one is kept in its history). */
export function setEntryNote(id, note, by = 'Staff') {
  const e = entryBy(id);
  if (!e) return null;
  const meta = readMeta();
  const cur = meta[id] || {};
  const log = [...(cur.noteLog || []), { at: Date.now(), by, was: e.note || '' }].slice(-10);
  meta[id] = { ...cur, note: String(note || '').trim(), noteBy: by, noteAt: Date.now(), noteLog: log };
  writeMeta(meta);
  changed();
  return entryBy(id);
}
/** Add a receipt or other file (a data URL, already made small) to an entry. Returns false when storage is full. */
export function addEntryFile(id, { name, url, type }, by = 'Staff') {
  const meta = readMeta();
  const cur = meta[id] || {};
  const file = { id: 'F-' + Date.now().toString(36), name: name || 'Receipt', url, type: type || 'image', at: Date.now(), by };
  meta[id] = { ...cur, files: [...(cur.files || []), file] };
  try { window.localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch { return false; }
  changed();
  return true;
}
export function removeEntryFile(id, fileId) {
  const meta = readMeta();
  const cur = meta[id];
  if (!cur || !cur.files) return;
  meta[id] = { ...cur, files: cur.files.filter((f) => f.id !== fileId) };
  writeMeta(meta);
  changed();
}

// ---- expenses that repeat every month (MS-F8) -------------------------------------------------------
// Rent, internet, a guard's pay …: the first payment is recorded as usual; the rule then adds the same expense on
// the same day of every following month (generated rows `recurring: <rule id>`, part of getEntries) until it is
// stopped. A generated month can be reversed like any entry (a month that was not paid). Rules are kept in
// gc.ledger.recurring. They post without the approval limits (lib/approvals.js): a real build runs them on the
// server and sends the month's payment for approval when it is over a limit.
const REC_KEY = 'gc.ledger.recurring';
const nowMs = () => { try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); } };
export const getRecurring = () => { try { return JSON.parse(window.localStorage.getItem(REC_KEY)) || []; } catch { return []; } };
const saveRecurring = (list) => { try { window.localStorage.setItem(REC_KEY, JSON.stringify(list)); } catch { /* ignore */ } changed(); };
/** { cat, kind, party, amount, account, place, channel, vat, note, startAt (the first payment), by } */
export function addRecurring(r) {
  const start = new Date(r.startAt || nowMs());
  const row = { ...r, id: 'RE-' + Date.now().toString(36), amount: Math.abs(Number(r.amount) || 0), day: Math.min(28, start.getDate()), startAt: start.getTime(), createdAt: Date.now() };
  saveRecurring([...getRecurring(), row]);
  return row;
}
export function stopRecurring(id, by = 'Staff') {
  saveRecurring(getRecurring().map((r) => (r.id === id ? { ...r, stoppedAt: nowMs(), stoppedBy: by } : r)));
}
const monthAt = (y, m, day) => new Date(y, m, day, 10, 0, 0, 0).getTime();
/** When a rule adds its next month (ms), or null when it is stopped. */
export function nextRun(r, now = nowMs()) {
  if (r.stoppedAt) return null;
  const s = new Date(r.startAt);
  let y = s.getFullYear(), m = s.getMonth() + 1;
  for (let i = 0; i < 600; i += 1) { const at = monthAt(y, m, r.day); if (at > now) return at; m += 1; if (m > 11) { m = 0; y += 1; } }
  return null;
}
/** Every month a rule has added so far (newest dates last). */
export function recurringRows(now = nowMs()) {
  if (typeof window === 'undefined') return [];
  const out = [];
  getRecurring().forEach((r) => {
    const s = new Date(r.startAt);
    let y = s.getFullYear(), m = s.getMonth() + 1;
    for (let i = 0; i < 600; i += 1) {
      const at = monthAt(y, m, r.day);
      if (at > now || (r.stoppedAt && at > r.stoppedAt)) break;
      out.push({ id: `REC-${r.id}-${y}${String(m + 1).padStart(2, '0')}`, at, account: r.account, amount: -r.amount, kind: r.kind || 'expense', cat: r.cat, channel: r.channel, place: r.place, vat: r.vat, party: r.party, note: r.note, by: r.by || 'Staff', recurring: r.id });
      m += 1; if (m > 11) { m = 0; y += 1; }
    }
  });
  return out;
}
