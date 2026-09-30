// posStore — what the POS register and the POS management screen share: counters, the employees who
// can work them, shifts, cash movements (pickups, cash in, paid out) and the POS settings.
// Front end only: everything is kept in this browser; the lists start from demo data.

export const POS_KEYS = {
  shift: 'gc.pos.shift', held: 'gc.pos.held', sales: 'gc.pos.sales', points: 'gc.pos.points',
  counters: 'gc.pos.counters', shifts: 'gc.pos.shifts', cash: 'gc.pos.cash', settings: 'gc.pos.settings',
};

export const load = (key, fallback) => { try { return JSON.parse(window.localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
export const save = (key, value) => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } };

// Branches and warehouses a counter can be registered at (the same places as Stocks & Inventory > Branches).
import { LOCATIONS as PLACES } from './locations';
export const LOCATIONS = PLACES.map((l) => ({ name: l.name, type: l.type }));

// People from Staff who can work a counter or collect cash from one.
export const EMPLOYEES = [
  { name: 'Sadia Akter', role: 'Cashier', branch: 'Dhanmondi branch' },
  { name: 'Rafi Ahmed', role: 'Sales associate', branch: 'Dhanmondi branch' },
  { name: 'Rakib Hasan', role: 'Branch manager', branch: 'Dhanmondi branch' },
  { name: 'Moumita Das', role: 'Cashier', branch: 'Mirpur branch' },
  { name: 'Arif Rahman', role: 'Sales associate', branch: 'Mirpur branch' },
  { name: 'Nabila Rahman', role: 'Branch manager', branch: 'Mirpur branch' },
];
export const MANAGERS = EMPLOYEES.filter((e) => e.role === 'Branch manager').map((e) => e.name);
export const CASH_PLACES = ['Shop safe', 'Bank deposit', 'Head office'];

const SEED_COUNTERS = [
  { id: 'REG-01', name: 'Dhanmondi · Counter 1', location: 'Dhanmondi branch', stock: 'Dhanmondi branch', printer: 'Epson TM-T82 · USB', float: 2000, staff: ['Sadia Akter', 'Rafi Ahmed', 'Rakib Hasan'], active: true },
  { id: 'REG-02', name: 'Dhanmondi · Counter 2', location: 'Dhanmondi branch', stock: 'Dhanmondi branch', printer: 'Epson TM-T82 · LAN', float: 3000, staff: ['Rafi Ahmed', 'Sadia Akter', 'Rakib Hasan'], active: true },
  { id: 'REG-03', name: 'Mirpur · Counter 1', location: 'Mirpur branch', stock: 'Mirpur branch', printer: 'Xprinter XP-80 · USB', float: 2000, staff: ['Moumita Das', 'Arif Rahman', 'Nabila Rahman'], active: true },
  { id: 'REG-04', name: 'Warehouse · Wholesale counter', location: 'Central Warehouse', stock: 'Central Warehouse', printer: 'No printer', float: 1000, staff: ['Arif Rahman'], active: false },
];

const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const SEED_SHIFTS = [
  { id: 'SH-0012', cashier: 'Sadia Akter', counter: 'Dhanmondi · Counter 1', openedAt: at(29, 10, 2), closedAt: at(29, 18, 5), float: 2000, count: 41, units: 96, sold: 38640, discounts: 1240, byMethod: { Cash: 21450, bKash: 9870, Card: 5320, Nagad: 2000 }, refunds: 890, cashRefunds: 890, pickups: 15000, paidOut: 0, added: 0, expected: 7560, counted: 7560, diff: 0, note: '' },
  { id: 'SH-0011', cashier: 'Moumita Das', counter: 'Mirpur · Counter 1', openedAt: at(29, 10, 10), closedAt: at(29, 21, 2), float: 2000, count: 33, units: 71, sold: 27410, discounts: 620, byMethod: { Cash: 16900, bKash: 7310, Card: 3200 }, refunds: 0, cashRefunds: 0, pickups: 10000, paidOut: 0, added: 0, expected: 8900, counted: 8850, diff: -50, note: 'Short ৳50, change given by mistake.' },
  { id: 'SH-0010', cashier: 'Rafi Ahmed', counter: 'Dhanmondi · Counter 2', openedAt: at(29, 14, 0), closedAt: at(29, 22, 1), float: 3000, count: 28, units: 64, sold: 31980, discounts: 1980, byMethod: { Cash: 12480, bKash: 11200, Card: 8300 }, refunds: 1240, cashRefunds: 1240, pickups: 8000, paidOut: 0, added: 0, expected: 6240, counted: 6300, diff: 60, note: '' },
  { id: 'SH-0009', cashier: 'Sadia Akter', counter: 'Dhanmondi · Counter 1', openedAt: at(28, 10, 0), closedAt: at(28, 18, 12), float: 2000, count: 37, units: 88, sold: 34210, discounts: 900, byMethod: { Cash: 19800, bKash: 8410, Card: 6000 }, refunds: 0, cashRefunds: 0, pickups: 14000, paidOut: 0, added: 1000, expected: 8800, counted: 8800, diff: 0, note: '' },
];
const SEED_CASH = [
  { id: 'CM-0007', type: 'pickup', counter: 'Dhanmondi · Counter 2', amount: 8000, by: 'Rakib Hasan', to: 'Shop safe', note: '', cashier: 'Rafi Ahmed', at: at(29, 19, 45), shiftAt: at(29, 14, 0) },
  { id: 'CM-0006', type: 'pickup', counter: 'Mirpur · Counter 1', amount: 10000, by: 'Nabila Rahman', to: 'Bank deposit', note: 'City Bank, slip 44812', cashier: 'Moumita Das', at: at(29, 16, 10), shiftAt: at(29, 10, 10) },
  { id: 'CM-0005', type: 'pickup', counter: 'Dhanmondi · Counter 1', amount: 15000, by: 'Rakib Hasan', to: 'Shop safe', note: '', cashier: 'Sadia Akter', at: at(29, 15, 30), shiftAt: at(29, 10, 2) },
  { id: 'CM-0004', type: 'pickup', counter: 'Dhanmondi · Counter 1', amount: 14000, by: 'Rakib Hasan', to: 'Bank deposit', note: 'BRAC Bank, slip 20931', cashier: 'Sadia Akter', at: at(28, 16, 0), shiftAt: at(28, 10, 0) },
  { id: 'CM-0003', type: 'in', counter: 'Dhanmondi · Counter 1', amount: 1000, by: 'Rakib Hasan', to: '', note: 'Small notes for change', cashier: 'Sadia Akter', at: at(28, 12, 20), shiftAt: at(28, 10, 0) },
];

export const DEFAULT_SETTINGS = {
  float: 2000,            // opening cash suggested when a register opens
  pickupLimit: 20000,     // the register asks for a cash pickup above this much in the drawer
  requireFull: true,      // a sale cannot be completed with money still due
  printReceipt: true,     // print the receipt when the sale completes
  maxDiscount: 15,        // the most a cashier can give as a manual discount, in percent
  returnDays: 7,          // days a receipt can be exchanged or returned
  footer: 'Thank you for shopping with us.',
};

export const getCounters = () => load(POS_KEYS.counters, SEED_COUNTERS);
export const saveCounters = (list) => save(POS_KEYS.counters, list);
export const getShifts = () => load(POS_KEYS.shifts, SEED_SHIFTS);
export const saveShifts = (list) => save(POS_KEYS.shifts, list);
export const getCash = () => load(POS_KEYS.cash, SEED_CASH);
export const saveCash = (list) => save(POS_KEYS.cash, list);
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...load(POS_KEYS.settings, {}) });
export const saveSettings = (cfg) => save(POS_KEYS.settings, cfg);
export const nextId = (prefix, list) => prefix + '-' + String(list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-').pop()) || 0), 0) + 1).padStart(prefix === 'REG' ? 2 : 4, '0');

export const CASH_LABEL = { pickup: 'Cash pickup', in: 'Cash added', out: 'Paid out' };

// ---- money in the ledger (lib/ledger) -----------------------------------------------------------
import { transferBetween, postEntry, accountForMethod } from './ledger';
/** The ledger account behind each "Cash goes to" choice of a pickup. */
export const CASH_ACCOUNT = { 'Shop safe': 'safe', 'Bank deposit': 'brac', 'Head office': 'cash-shop' };
/** Post a cash drawer movement: a pickup leaves the drawer for the safe, the bank or head office;
 *  cash added comes from the safe; paid out leaves the drawer. `m` is the saved movement. */
export function postCashMove(m) {
  const meta = { ref: m.id, by: m.by, party: m.counter, note: [m.counter, m.to, m.note].filter(Boolean).join(' · ') };
  if (m.type === 'pickup') transferBetween('drawer', CASH_ACCOUNT[m.to] || 'safe', m.amount, { ...meta, kind: 'cash pickup' });
  else if (m.type === 'in') transferBetween('safe', 'drawer', m.amount, { ...meta, kind: 'cash in' });
  else if (m.type === 'out') postEntry({ ...meta, account: 'drawer', amount: -Math.abs(m.amount), kind: 'paid out' });
}
/** Post the money a POS sale took, one entry per payment method; cash is net of the change given.
 *  Due / credit and store credit move no money. */
export function postSaleTenders(sale) {
  const by = {};
  (sale.tenders || []).forEach((x) => { by[x.method] = (by[x.method] || 0) + x.amount; });
  if (sale.change) by.Cash = (by.Cash || 0) - sale.change;
  Object.entries(by).forEach(([method, amount]) => {
    const account = accountForMethod(method, true);
    if (account && amount > 0) postEntry({ account, amount: Math.round(amount * 100) / 100, kind: 'sale', ref: sale.id, party: (sale.customer && sale.customer.name) || 'Walk-in customer', by: sale.cashier, note: `${method} · ${sale.counter}` });
  });
}

/** Everything a shift sold and the cash its drawer should hold, from the sales and cash movements. */
export function shiftReport(shift, sales, cash, until = Infinity) {
  const mine = sales.filter((s) => s.at >= shift.openedAt && s.at <= until);
  const byMethod = {};
  let refunds = 0, cashRefunds = 0, cashCollected = 0, discounts = 0, units = 0;
  mine.forEach((s) => {
    s.tenders.forEach((x) => { byMethod[x.method] = (byMethod[x.method] || 0) + x.amount; });
    if (s.change) byMethod.Cash = (byMethod.Cash || 0) - s.change;
    (s.refunds || []).forEach((r) => {
      refunds += r.amount;
      if (r.method === 'Cash') { cashRefunds += r.amount; cashCollected += r.collected || 0; }
    });
    const t = s.totals;
    discounts += (t.lineDisc || 0) + (t.cartDisc || 0) + (t.couponDisc || 0) + (t.memberDisc || 0) + (t.pointsDisc || 0);
    units += t.units;
  });
  // money received later against an unpaid invoice counts in the shift that was open when it came in
  sales.forEach((s) => (s.payments || []).forEach((p) => { if (p.account === 'drawer' && p.at >= shift.openedAt && p.at <= until) byMethod[p.method] = (byMethod[p.method] || 0) + p.amount; }));
  const moves = cash.filter((m) => m.shiftAt === shift.openedAt);
  const sum = (type) => moves.filter((m) => m.type === type).reduce((a, m) => a + m.amount, 0);
  const pickups = sum('pickup'), paidOut = sum('out'), added = sum('in');
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    count: mine.length, units, sold: r2(mine.reduce((a, s) => a + s.totals.total, 0)), discounts: r2(discounts),
    byMethod: Object.fromEntries(Object.entries(byMethod).map(([k, v]) => [k, r2(v)])),
    refunds: r2(refunds), cashRefunds: r2(cashRefunds), cashCollected: r2(cashCollected), pickups, paidOut, added, moves,
    expected: r2(shift.float + (byMethod.Cash || 0) + cashCollected - cashRefunds - pickups - paidOut + added),
  };
}
