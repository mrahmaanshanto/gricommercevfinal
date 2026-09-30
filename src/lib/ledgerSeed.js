// ledgerSeed — a month of demo money movements (September 2026), so balances, the money list and
// the reports have something real to show on the first day. The opening balances in ledger.js are
// the balances on 1 September; these entries are always added under the ones made in this browser.

import { ITEM_SEED, HOLDING_OF } from './settlementSeed';

const at = (d, h = 12, m = 0) => new Date(2026, 8, d, h, m).getTime();
let seed = 7;
const rnd = (lo, hi) => { seed = (seed * 9301 + 49297) % 233280; return Math.round((lo + (seed / 233280) * (hi - lo)) / 10) * 10; };
let n = 0;
const E = (d, h, account, amount, kind, party, note = '', extra = {}) => ({ id: 'LS-' + String(++n).padStart(4, '0'), at: at(d, h, n % 60), account, amount, kind, party, note, by: extra.by || 'Arif Rahman', seed: true, ...extra });

const rows = [];
for (let d = 1; d <= 30; d++) {
  const cash = rnd(16000, 31000), bk = rnd(3500, 9000), ng = rnd(800, 3200);
  rows.push(E(d, 21, 'drawer', cash, 'sale', 'Counter sales', 'Cash · Dhanmondi and Mirpur counters', { ref: 'Z-' + String(d).padStart(2, '0') + '09' }));
  rows.push(E(d, 21, 'bkash', bk, 'sale', 'Counter sales', 'bKash · counters', { ref: 'Z-' + String(d).padStart(2, '0') + '09' }));
  rows.push(E(d, 21, 'nagad', ng, 'sale', 'Counter sales', 'Nagad · counters', { ref: 'Z-' + String(d).padStart(2, '0') + '09' }));
  // the drawers are emptied into the safe at closing
  rows.push(E(d, 22, 'drawer', -cash, 'cash pickup', 'Counter drawers', 'End of day pickup'));
  rows.push(E(d, 22, 'safe', cash, 'cash pickup', 'Counter drawers', 'End of day pickup'));
}
// the safe goes to the bank every Sunday and Wednesday
[2, 6, 9, 13, 16, 20, 23, 27, 30].forEach((d) => {
  const amt = d === 2 ? 60000 : 95000;
  rows.push(E(d, 11, 'safe', -amt, 'transfer', 'BRAC Bank current', 'Cash deposit'));
  rows.push(E(d, 11, 'brac', amt, 'transfer', 'Shop safe', 'Cash deposit'));
});
rows.push(
  E(1, 10, 'brac', -45000, 'expense', 'Rahman Properties', 'Shop rent · September', { cat: 'Rent' }),
  E(3, 15, 'bkash', -2000, 'expense', 'Link3', 'Internet · September', { cat: 'Internet & phone' }),
  E(4, 12, 'cash-shop', -3250, 'expense', 'Pathao Parcel', 'Van hire for stock move', { cat: 'Transport' }),
  E(7, 16, 'citybank', -15000, 'expense', 'Meta Platforms', 'Facebook ads', { cat: 'Marketing' }),
  E(10, 11, 'bkash', -8420, 'expense', 'DESCO', 'Electricity · August', { cat: 'Utilities' }),
  E(12, 13, 'cash-shop', -6350, 'expense', 'Dhaka Packaging', 'Poly mailers and boxes', { cat: 'Packaging' }),
  E(14, 18, 'cash-shop', -1800, 'expense', 'Tea and snacks', 'Staff tea', { cat: 'Office' }),
  E(18, 14, 'citybank', -12000, 'expense', 'Meta Platforms', 'Facebook ads', { cat: 'Marketing' }),
  E(21, 12, 'cash-shop', -4200, 'expense', 'Rafiq Electric', 'AC repair · Dhanmondi', { cat: 'Repairs' }),
  E(24, 17, 'cash-shop', -2600, 'expense', 'Pathao Parcel', 'Van hire', { cat: 'Transport' }),
  E(8, 12, 'brac', -85000, 'supplier payment', 'Karim Traders', 'PAY-0141', { ref: 'BILL-0917' }),
  E(15, 12, 'citybank', -42500, 'supplier payment', 'Sunrise Distributors', 'PAY-0144', { ref: 'BILL-0921' }),
  E(26, 12, 'brac', -28000, 'supplier payment', 'Bengal Packaging', 'PAY-0149', { ref: 'BILL-0930' }),
  E(20, 19, 'brac', -30000, 'owner withdraw', 'Mehedi Rahman', 'Owner draw'),
  // August salaries were paid on 1 Sep (a liability of August); September's are owed, paid on 1 Oct (liabilities.js)
  E(1, 11, 'brac', -294180, 'salary', 'Staff salaries', 'August salaries · 13 staff', { cat: 'Salary', liab: 'LB-AUG' }),
  E(18, 14, 'bkash', -5000, 'promotion', 'Nabila Style', 'Influencer shoot · Eid collection · advance', { cat: 'Promotion', liab: 'LB-0005', ref: 'LB-0005' }),
  // money that is not from sales
  E(11, 13, 'brac', 12500, 'income', 'Sunrise Distributors', 'Target bonus · August', { cat: 'Bonus from suppliers' }),
  E(19, 17, 'cash-shop', 1850, 'income', 'Kabari shop', 'Old cartons and packing', { cat: 'Scrap and carton sale' }),
  E(25, 10, 'dbbl', 1573, 'income', 'Dutch-Bangla Bank', 'Savings interest · Q3', { cat: 'Bank interest' }),
  E(30, 16, 'brac', 4442.35, 'settlement', 'bKash Payment Gateway', 'From bKash', { ref: 'bkash-pgw:2026-09-30' }),
  E(30, 17, 'citybank', 3108.38, 'settlement', 'Steadfast Courier', 'From Steadfast', { ref: 'steadfast:2026-09-30' }),
  E(30, 18, 'citybank', 19467.9, 'settlement', 'Pathao Courier', 'From Pathao · ৳180 short, check it', { ref: 'pathao:2026-09-30' }),
);

// money the gateways, card machine and couriers collected (settlementSeed.js), and the two payouts
// that already arrived: the holding account pays out, the partner keeps its fee and delivery charges
const NAMES = { 'bkash-pgw': 'bKash Payment Gateway', 'nagad-pgw': 'Nagad Payment Gateway', sslcommerz: 'SSLCOMMERZ', eps: 'EPS', card: 'Card payments', pathao: 'Pathao Courier', steadfast: 'Steadfast Courier', redx: 'RedX', carrybee: 'Carrybee' };
ITEM_SEED.forEach((i) => rows.push({ id: 'LS-C' + i.id.slice(3), at: i.at, account: HOLDING_OF[i.partner], amount: i.gross, kind: 'collected', ref: i.ref, party: i.party, note: NAMES[i.partner], by: 'System', seed: true }));
const paidOut = (partner, ids, feePct, received, bank, when) => {
  const list = ITEM_SEED.filter((i) => ids.includes(i.id));
  const fee = Math.round(list.reduce((a, i) => a + i.gross * feePct / 100, 0) * 100) / 100;
  const charge = list.reduce((a, i) => a + (i.charge || 0), 0);
  const h = HOLDING_OF[partner], ref = partner + ':2026-09-30';
  rows.push({ id: 'LS-P' + partner, at: when, account: h, amount: -received, kind: 'settlement', ref, party: bank, note: 'Paid out', by: 'System', seed: true });
  rows.push({ id: 'LS-F' + partner, at: when, account: h, amount: -fee, kind: 'partner fee', ref, party: NAMES[partner], note: feePct + '%', by: 'System', seed: true });
  if (charge) rows.push({ id: 'LS-D' + partner, at: when, account: h, amount: -charge, kind: 'courier charge', ref, party: NAMES[partner], note: 'Delivery charges', by: 'System', seed: true });
};
paidOut('bkash-pgw', ['SI-001', 'SI-002', 'SI-003'], 1.5, 4442.35, 'BRAC Bank current', at(30, 16));
paidOut('steadfast', ['SI-032', 'SI-033'], 1, 3108.38, 'City Bank current', at(30, 17));

export const LEDGER_SEED = rows.sort((a, b) => b.at - a.at);
