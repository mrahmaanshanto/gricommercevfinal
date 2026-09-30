// settlementSeed — demo money the payment gateways and couriers were holding on 1 Oct 2026, and
// the payouts already made from it. Kept apart from settlements.js so ledger.js can read the
// holding balances without an import cycle.

const at = (m, d, h = 12) => new Date(2026, m - 1, d, h).getTime();
let n = 0;
const I = (partner, when, ref, party, gross, extra = {}) => ({ id: 'SI-' + String(++n).padStart(3, '0'), partner, at: when, ref, party, gross, ...extra });

// settled: true = already paid out (part of a payout in PAYOUT_SEED)
export const ITEM_SEED = [
  // bKash gateway, next working day
  I('bkash-pgw', at(9, 29, 11), '#136802', 'Nusrat Jahan', 1200, { settled: true }),
  I('bkash-pgw', at(9, 29, 15), '#136803', 'Imran Kabir', 2450, { settled: true }),
  I('bkash-pgw', at(9, 29, 19), '#136805', 'Sadia Afrin', 860, { settled: true }),
  I('bkash-pgw', at(9, 30, 10), '#136806', 'Tanvir Hasan', 3490),
  I('bkash-pgw', at(9, 30, 13), '#136807', 'Farhana Islam', 1250),
  I('bkash-pgw', at(9, 30, 17), '#136808', 'Rakib Uddin', 990),
  I('bkash-pgw', at(9, 30, 20), '#136809', 'Mostafizur Rahman', 18490),
  I('bkash-pgw', at(10, 1, 10), '#136813', 'Salma Begum', 1890),
  I('bkash-pgw', at(10, 1, 14), '#136814', 'Karim Saheb', 3450),
  // Nagad gateway
  I('nagad-pgw', at(9, 30, 12), '#136815', 'Nasrin Akter', 4200),
  I('nagad-pgw', at(9, 30, 18), '#136816', 'Rafiq Mia', 2000),
  I('nagad-pgw', at(10, 1, 11), '#136820', 'Shirin Akter', 1250),
  // SSLCOMMERZ, two working days
  I('sslcommerz', at(9, 27, 13), '#136790', 'Arif Rahman', 14990),
  I('sslcommerz', at(9, 27, 16), '#136791', 'Moumita Das', 3490),
  I('sslcommerz', at(9, 29, 12), '#136797', 'Habib Telecom', 12000),
  I('sslcommerz', at(9, 29, 17), '#136798', 'Tania Akter', 8300),
  I('sslcommerz', at(9, 30, 11), '#136821', 'Imran Kabir', 6500),
  I('sslcommerz', at(9, 30, 19), '#136822', 'Sadia Afrin', 4200),
  // EPS: stays in the EPS wallet until withdrawn
  I('eps', at(9, 22, 12), '#136760', 'Kamrul Hasan', 2400),
  I('eps', at(9, 24, 15), '#136766', 'Tanvir Ahmed', 3100),
  I('eps', at(9, 27, 11), '#136785', 'Rakib Hasan', 1850),
  I('eps', at(9, 29, 18), '#136800', 'Nusrat Jahan', 2650),
  I('eps', at(9, 30, 16), '#136823', 'Farhana Islam', 2400),
  // card payments at the POS counters
  I('card', at(9, 30, 13), 'ORD-20260930-0011', 'Walk-in customer', 3200),
  I('card', at(9, 30, 18), 'ORD-20260930-0019', 'Shirin Akter', 2120),
  // Pathao COD, next working day; charge = delivery charge kept by the courier
  I('pathao', at(9, 29, 14), '#136779', 'Nusrat Jahan', 1000, { charge: 70, dhaka: true }),
  I('pathao', at(9, 29, 15), '#136778', 'Mostafizur Rahman', 1860, { charge: 150, dhaka: false }),
  I('pathao', at(9, 29, 16), '#136764', 'Sadia Afrin', 14900, { charge: 70, dhaka: true }),
  I('pathao', at(9, 29, 18), '#136750', 'Imran Kabir', 2450, { charge: 70, dhaka: true }),
  I('pathao', at(9, 30, 15), '#136742', 'Farhana Islam', 3900, { charge: 150, dhaka: false }),
  I('pathao', at(9, 30, 17), '#136737', 'Rakib Uddin', 5600, { charge: 70, dhaka: true }),
  // Steadfast pays on Sundays and Wednesdays
  I('steadfast', at(9, 28, 13), '#136771', 'Tanvir Hasan', 412, { charge: 70, dhaka: true, settled: true }),
  I('steadfast', at(9, 29, 12), '#136787', 'Moumita Das', 2950, { charge: 150, dhaka: false, settled: true }),
  I('steadfast', at(9, 30, 16), '#136824', 'Arif Rahman', 1890, { charge: 150, dhaka: false }),
  I('steadfast', at(10, 1, 13), '#136825', 'Kamrul Hasan', 3490, { charge: 70, dhaka: true }),
  // RedX: 0% COD inside Dhaka, 1% outside
  I('redx', at(9, 30, 14), '#136826', 'Nasrin Akter', 2450, { charge: 60, dhaka: true }),
  I('redx', at(9, 30, 17), '#136827', 'Karim Saheb', 1860, { charge: 130, dhaka: false }),
  // Carrybee
  I('carrybee', at(9, 30, 15), '#136828', 'Salma Begum', 3450, { charge: 70, dhaka: true }),
];

// payouts already recorded: bKash for 29 Sep arrived; Steadfast's Wednesday payout arrived;
// Pathao's payout for 29 Sep came ৳180 short and waits for review.
/** Where settlement items are kept (ledger.js adds one for every payment into a holding account). */
export const ITEMS_KEY = 'gc.settle.items';

export const PAYOUT_SEED = [
  { id: 'bkash-pgw:2026-09-30', partner: 'bkash-pgw', date: '2026-09-30', items: ['SI-001', 'SI-002', 'SI-003'], status: 'received', received: 4442.35, account: 'brac', at: at(9, 30, 16) },
  { id: 'steadfast:2026-09-30', partner: 'steadfast', date: '2026-09-30', items: ['SI-032', 'SI-033'], status: 'received', received: 3108.38, account: 'citybank', at: at(9, 30, 17) },
  { id: 'pathao:2026-09-30', partner: 'pathao', date: '2026-09-30', items: ['SI-026', 'SI-027', 'SI-028', 'SI-029'], status: 'review', received: 19467.9, account: 'citybank', at: at(9, 30, 18) },
];

/** What each holding account held at the start: every seeded item not yet paid out. */
export const HOLDING_OF = { 'bkash-pgw': 'h-bkash', 'nagad-pgw': 'h-nagad', sslcommerz: 'h-ssl', eps: 'h-eps', card: 'card', pathao: 'h-pathao', steadfast: 'h-steadfast', redx: 'h-redx', carrybee: 'h-carrybee' };
export const HOLDING_OPENING = ITEM_SEED.filter((i) => !i.settled).reduce((acc, i) => { const h = HOLDING_OF[i.partner]; acc[h] = (acc[h] || 0) + i.gross; return acc; }, {});
