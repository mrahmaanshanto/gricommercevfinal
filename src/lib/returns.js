// returns — one history of everything that came back: online, retail and wholesale together.
// Rows come from three places: the Return & exchange page and ended online holds (saved here),
// returns and exchanges made at the POS register (read from its sales), and demo rows.
// A return made on the Return & exchange page for a POS sale is saved here AND noted on the sale
// (sale.refunds, with `rt` = the row id), so getReturns() skips those sale entries to count it once.
// Money: a row that gave money back has money 'refunded', amount and method; when the money left one
// of the shop's accounts it also has `account` (ledger account id) and `ledger` (the ledger entry ids).
// "Cut from due" and store credit move no money, so they have no account.
// Front end only: kept in this browser.

import { POS_KEYS, load } from './posStore';
import { accountForMethod } from './ledger';
import { wholesaleOn } from './edition';

const KEY = 'gc.returns';
export const RETURN_CHANNELS = ['Online', 'Retail', 'Wholesale'].filter((c) => c !== 'Wholesale' || wholesaleOn());
const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const SEED = [
  { id: 'RT-0009', at: at(30, 9, 30), channel: 'Online', ref: '#136804', customer: 'Salma Begum', items: 'Baseus Car Phone Holder × 1', type: 'return', amount: 1890, money: 'refunded', method: 'bKash', stock: 'restock', reason: 'Returned without damage', place: 'Central Warehouse', by: 'System' },
  { id: 'RT-0008', at: at(29, 11, 0), channel: 'Online', ref: '#136799', customer: 'Rafiq Mia', items: 'Type-C Wired Earphones × 1', type: 'return', amount: 990, money: 'refunded', method: 'bKash', stock: 'damaged', reason: 'Returned damaged: bottle leaked', place: 'Central Warehouse', by: 'System' },
  { id: 'RT-0007', at: at(29, 16, 45), channel: 'Wholesale', ref: 'INV-0230', customer: 'Habib Telecom', items: 'Wireless Earbuds Pro × 1', type: 'exchange', amount: 0, money: 'even', method: '', stock: 'damaged', reason: 'Faulty item', place: 'Dhanmondi branch', by: 'Rafi Ahmed' },
  { id: 'RT-0006', at: at(28, 13, 10), channel: 'Wholesale', ref: 'INV-0228', customer: 'Bismillah Mobile Corner', items: 'Foldable Phone Stand × 4', type: 'return', amount: 2212, money: 'credited', method: 'Cut from due', stock: 'restock', reason: 'Wrong item given', place: 'Central Warehouse', by: 'Sadia Akter' },
  { id: 'RT-0005', at: at(29, 12, 20), channel: 'Retail', ref: 'Memo #1031', customer: 'Salma Begum', items: 'Cleaning spray 100 ml × 1', type: 'return', amount: 240, money: 'refunded', method: 'Cash', stock: 'damaged', reason: 'Faulty item', place: 'Mirpur branch', by: 'Babu' },
  { id: 'RT-0004', at: at(29, 10, 5), channel: 'Retail', ref: 'Memo #1024', customer: 'Nasrin Akter', items: 'Case Galaxy A35 → A55', type: 'exchange', amount: 0, money: 'even', method: '', stock: 'restock', reason: 'Wrong size', place: 'Mirpur branch', by: 'Rina' },
];

const saved = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };

/** Record a return or exchange made outside the POS register. Returns the saved row (with its id). */
export function addReturn(row) {
  const list = saved();
  const n = list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-').pop()) || 0), 100) + 1;
  const saved1 = { id: 'RT-' + String(n).padStart(4, '0'), at: Date.now(), ...row };
  try { window.localStorage.setItem(KEY, JSON.stringify([saved1, ...list])); } catch { /* ignore */ }
  return saved1;
}

/** Every return and exchange, newest first. */
export function getReturns() {
  if (typeof window === 'undefined') return [];
  const mine = saved();
  const seen = new Set(mine.map((r) => r.ref + '|' + r.at));
  const pos = load(POS_KEYS.sales, []).flatMap((s) => (s.refunds || [])
    // entries written by the Return & exchange page already have their own row above
    .map((r, i) => ({ r, i })).filter(({ r }) => !r.rt && !seen.has(s.id + '|' + r.at))
    .map(({ r, i }) => ({
      id: s.id + '-R' + (i + 1), at: r.at, channel: s.wholesale ? 'Wholesale' : 'Retail', ref: s.id, customer: (s.customer && s.customer.name) || 'Walk-in customer',
      items: r.items || (r.given ? 'Exchanged for ' + r.given.join(', ') : 'Items from the sale'), type: r.type || 'return',
      amount: r.collected || r.amount, money: r.collected ? 'collected' : r.amount ? 'refunded' : 'even', method: r.method,
      stock: /damag|fault/i.test(r.reason || '') ? 'damaged' : 'restock', reason: r.reason, place: s.counter, by: s.cashier,
      account: accountForMethod(r.method, true) || '',
    })));
  const seed = SEED.map((r) => ({ ...r, account: r.money === 'refunded' ? accountForMethod(r.method, false) || '' : '' }));
  // wholesale returns show only while wholesale is on (edition.js; off for now)
  return [...mine.map((r) => ({ account: '', ledger: [], ...r })), ...pos, ...seed].filter((r) => r.channel !== 'Wholesale' || wholesaleOn()).sort((a, b) => b.at - a.at);
}

/** Put the money given back on the history rows saved for `ref` since `since` (the newest one carries it).
 *  `refund` is { amount, method, account, ledger, note }; money becomes 'refunded' (or stays 'even' with amount 0). */
export function setRefund(ref, since, refund) {
  const list = saved();
  const i = list.findIndex((r) => r.ref === ref && r.at >= since);
  if (i < 0) return null;
  const paid = refund.amount > 0;
  list[i] = { ...list[i], amount: paid ? refund.amount : 0, money: paid ? 'refunded' : 'even', method: paid ? refund.method : refund.method || '', account: refund.account || '', ledger: refund.ledger || [], refundNote: refund.note || '' };
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
  return list[i];
}

/** Money already given back on a sale or order, from every row of the history. */
export const refundedFor = (ref) => getReturns().filter((r) => r.ref === ref && r.money === 'refunded').reduce((a, r) => a + (r.amount || 0), 0);

/** Quantities already taken back per line of a sale, from the rows saved here: { lineId: qty }. */
export function returnedFromHistory(ref) {
  const out = {};
  if (typeof window === 'undefined') return out;
  saved().filter((r) => r.ref === ref && r.returned).forEach((r) => Object.entries(r.returned).forEach(([id, n]) => { out[id] = (out[id] || 0) + n; }));
  return out;
}

/** Money already taken off a sale's due by returns saved here. */
export const cutFromHistory = (ref) => (typeof window === 'undefined' ? 0 : saved().filter((r) => r.ref === ref).reduce((a, r) => a + (r.cut || 0), 0));

/** Store credit a customer has from returns, by mobile number. */
export const storeCreditFor = (phone) => (typeof window === 'undefined' || !phone ? 0 : saved().filter((r) => r.phone === phone && r.method === 'Store credit').reduce((a, r) => a + (r.amount || 0), 0));
