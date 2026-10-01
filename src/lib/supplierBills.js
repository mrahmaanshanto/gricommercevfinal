// supplierBills — suppliers, what the shop owes them and every payment against it.
//   Bill         one delivery the shop must pay for: { no, supplier (id), po, grn, ref (supplier's challan),
//                at, amount, due, paid, credited, status, lines, extra, notes }. Receive goods adds one per
//                delivery (accepted pieces × order price + extra costs).
//   Payment      money paid to a supplier: { no, supplier, bills (nos), alloc { billNo: amount }, amount,
//                method, account (ledger account id), by, ref, note, at }. Paying posts to the ledger.
//   Credit note  value that comes off what the shop owes, from goods returned to the supplier:
//                { no, supplier, ret, po, amount, applied { billNo: amount }, unused, lines, note, at }.
//   Return       goods sent back to a supplier (Supplier return): { no, supplier, lines, reason, how, note, by, at, credit, value }.
// What the shop owes on a bill = amount − paid − credited. A supplier's payable = open bill balances − unused credit.
// Front end only: starts from demo rows and is kept in this browser.

import { postEntry } from './ledger';
import { DEMO_POS } from './purchaseOrders';

const KEY = 'gc.supplier.bills';
const OLD_KEY = 'gc.suppliers';   // the Suppliers page's own store before this library
const DAY = 864e5;
const d = (day, m) => new Date(2026, m - 1, day).getTime();

/** Start of a day, as a timestamp. */
export const dayStart = (t = Date.now()) => { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); };
/** Whole days from `today` to `t` (negative = in the past). */
export const daysFrom = (t, today = dayStart()) => Math.round((dayStart(t) - today) / DAY);

export const TERMS = [[0, 'On delivery'], [7, '7 days'], [14, '14 days'], [15, '15 days'], [30, '30 days']];
export const DEFAULT_TERMS = 15;
export const termsLabel = (days) => (!days ? 'Pay on delivery' : `${days} days’ credit`);

// ---- demo suppliers (terms = days they give to pay)
const S = (id, name, phone, kind, goods, year, terms, person, address, since) => ({ id, name, phone, kind, goods, year, terms, person, address, since });
export const SUPPLIERS = [
  S('dgh', 'Dhaka Gadget Hub', '01713-456789', 'Importer', 'Glass, adapters', 685000, 14, 'Tanvir Hossain', 'Level 4, Multiplan Center, Elephant Road, Dhaka', 2022),
  S('tli', 'Techland Imports', '01819-234567', 'Wholesaler · Moulvibazar', 'Cables, chargers', 940000, 30, 'Jashim Uddin (owner)', '42 Moulvibazar, Chawkbazar, Dhaka-1211', 2021),
  S('mm', 'Mobile Mart', '01711-908070', 'Patuatuli', 'Cases, cleaning kits', 420000, 15, 'Rubel Mia', '18 Patuatuli Road, Dhaka-1100', 2023),
  S('ee', 'Eastern Electronics', '01730-112233', 'Motijheel', 'Car mounts, grips', 365000, 15, 'Farhana Kabir', '9 Dilkusha C/A, Motijheel, Dhaka', 2022),
  S('kf', 'Kazi Farms dealer', '01912-445566', 'Kazi Farms', 'Batteries', 88000, 7, 'Selim Reza', 'Kazi Farms depot, Mohakhali, Dhaka', 2024),
  S('pc', 'PowerCell Traders', '01555-667788', 'Battery dealer', 'Cables, SIM tools', 290000, 14, 'Abdul Mannan', '27 Nawabpur Road, Dhaka', 2023),
  S('pr', 'PackRight Supplies', '01670-889900', 'Tejgaon', 'Packaging, pouches', 145000, 14, 'Shirin Akter', 'Plot 51, Tejgaon I/A, Dhaka', 2024),
  S('ct', 'CleanTech Supplies', '01799-334455', 'Cleaning · Gulshan', 'Cleaning kits', 160000, 14, 'Mahbub Alam', 'Road 90, Gulshan-2, Dhaka', 2024),
  S('rw', 'Rahim Wholesale', '01822-778899', 'Local wholesaler · Mirpur 1', 'Mixed accessories', 110000, 7, 'Abdur Rahim', 'Shah Ali Market, Mirpur 1, Dhaka', 2023),
  S('rt', 'Rahman Traders', '01711-223344', 'Wholesaler · Chawkbazar', 'Skin care, towels', 310000, 30, 'Habibur Rahman', '7 Chawkbazar Road, Dhaka-1211', 2020),
  S('nfh', 'Nabil Fashion House', '01914-556677', 'Clothing maker · Narayanganj', 'Shirts, jeans, T-shirts', 290000, 30, 'Nabil Chowdhury', 'BSCIC Industrial Area, Narayanganj', 2022),
  S('dbi', 'Dhaka Beauty Imports', '01552-889900', 'Importer · Banani', 'Skin care', 180000, 15, 'Sharmin Nahar', 'Road 11, Banani, Dhaka', 2023),
  S('cpc', 'Chattogram Packaging Co.', '01819-667700', 'Packaging · Chattogram', 'Shipping boxes, tape', 64000, 15, 'Rashed Karim', 'Agrabad C/A, Chattogram', 2024),
  S('mim', 'Mim Enterprise', '01716-334455', 'Local wholesaler · Mirpur 10', 'Home and kitchen', 41300, 14, 'Mim Akter', 'Section 10, Mirpur, Dhaka', 2025),
];

// ---- demo bills and payments
// bill: no, supplier, bought on, amount, due on, po, grn
const B = (no, supplier, at, amount, due, po, grn) => ({ no, supplier, at, amount, due, po: po || '', grn: grn || '', ref: no, paid: 0, credited: 0, lines: [], extra: 0, notes: '', seed: true });
// payment: supplier, at, amount, method, account, by, ref, { bill: amount }
const P = (supplier, at, amount, method, account, by, ref, alloc) => ({ supplier, at, amount, method, account, by, ref, alloc, bills: Object.keys(alloc), note: '', seed: true });
// item lines of the demo bills: { sku, name, qty, cost }, adding up to the bill's amount exactly.
// A bill for a demo purchase order carries that order's lines.
const BL = (sku, name, qty, cost) => ({ sku, name, qty, cost });
const EAR = (q, c) => BL('EL-EAR-PRO', 'Wireless Earbuds Pro', q, c);
const PHN = (q, c) => BL('EL-PHN-128', 'Budget Android Phone 6/128', q, c);
const BTL = (q, c) => BL('HM-BTL-750', 'Steel Water Bottle 750ml', q, c);
const BOX = (q, c) => BL('', 'Shipping box · Medium', q, c);
const TAPE = (q, c) => BL('', 'Packing tape 2 inch', q, c);
const SHA = (q, c) => BL('SK-SHA-340', 'Daily Care Shampoo 340ml', q, c);
const SOY = (q, c) => BL('GR-SOY-2', 'Soybean Cooking Oil 2L', q, c);
const ATTA = (q, c) => BL('GR-ATTA-2', 'Atta Wheat Flour 2kg', q, c);
const DAL = (q, c) => BL('GR-DAL-1', 'Chickpeas Boot Dal 1kg', q, c);
const poLines = (no) => ((DEMO_POS.find((p) => p.no === no) || {}).lines || []).map((l) => BL(l.sku, l.name, l.qty, l.cost));
const SEED_LINES = {
  'DGH-58011': [EAR(4, 2500)], 'DGH-58102': [PHN(1, 10520), EAR(11, 2680)], 'DGH-58190': [EAR(1, 2650), PHN(2, 11175)],
  'TLI-1019': [PHN(1, 9960), EAR(12, 2420)], 'TLI-1043': [PHN(5, 10280), EAR(4, 2525)], 'TLI-1071': [EAR(5, 2575), PHN(3, 10375)],
  'TLI-1098': [PHN(1, 10560), EAR(16, 2590)], 'TLI-1127': [EAR(2, 2680), PHN(3, 10880)],
  'MM-8990': [BTL(20, 500)], 'MM-9031': [BTL(15, 460), EAR(5, 2620)], 'MM-9058': [BTL(17, 500)],
  'EE-44702': [EAR(4, 2500)], 'EE-44781': [EAR(3, 2600), BTL(16, 450)], 'EE-44820': [EAR(4, 2640), BTL(14, 460)],
  'KF-5490': [BL('GR-RICE-5', 'Premium Miniket Rice 5kg', 2, 640), DAL(28, 115)], 'KF-5521': [DAL(20, 115), ATTA(7, 100)],
  'PC-2174': [EAR(2, 2555), BTL(2, 445)], 'PC-2210': [EAR(2, 2630), BTL(28, 455)],
  'PR-3265': [BOX(30, 18), TAPE(172, 55)], 'PR-3302': [BOX(8, 19), TAPE(33, 56)],
  'CT-7702': [SHA(14, 295), BTL(2, 435)], 'CT-7765': [SHA(20, 295), BTL(8, 450)],
  'RW-112': [SOY(6, 275), BTL(10, 455)], 'RW-118': [SOY(5, 280), ATTA(26, 100)],
  'RT-4410': poLines('PO-2608-0015'), 'NFH-2231-A': poLines('PO-2609-0020'), 'DBI-7702': poLines('PO-2609-0019'), 'MIM-0817': poLines('PO-2608-0017'),
};
/** A demo bill saved before it had item lines gets them (nothing else changes). */
const withSeedLines = (b) => (b && b.seed && !(b.lines && b.lines.length) && SEED_LINES[b.no] ? { ...b, lines: SEED_LINES[b.no].map((l) => ({ ...l })) } : b);
const SEED_BILLS = [
  B('DGH-58102', 'dgh', d(15, 9), 40000, d(29, 9)), B('DGH-58190', 'dgh', d(22, 9), 25000, d(6, 10)), B('DGH-58011', 'dgh', d(8, 9), 10000, d(22, 9)),
  B('TLI-1019', 'tli', d(20, 6), 39000, d(20, 7)), B('TLI-1043', 'tli', d(12, 7), 61500, d(11, 8)), B('TLI-1071', 'tli', d(5, 8), 44000, d(4, 9)),
  B('TLI-1098', 'tli', d(30, 8), 52000, d(29, 9)), B('TLI-1127', 'tli', d(29, 9), 38000, d(29, 10)),
  B('MM-9031', 'mm', d(14, 9), 20000, d(29, 9)), B('MM-9058', 'mm', d(27, 9), 8500, d(7, 10)), B('MM-8990', 'mm', d(12, 9), 10000, d(27, 9)),
  B('EE-44781', 'ee', d(16, 9), 15000, d(1, 10)), B('EE-44820', 'ee', d(28, 9), 17000, d(12, 10)), B('EE-44702', 'ee', d(13, 9), 10000, d(28, 9)),
  B('KF-5521', 'kf', d(25, 9), 3000, d(2, 10)), B('KF-5490', 'kf', d(18, 9), 4500, d(25, 9)),
  B('PC-2210', 'pc', d(19, 9), 18000, d(3, 10)), B('PC-2174', 'pc', d(5, 9), 6000, d(19, 9)),
  B('PR-3302', 'pr', d(20, 9), 2000, d(4, 10)), B('PR-3265', 'pr', d(6, 9), 10000, d(20, 9)),
  B('CT-7765', 'ct', d(12, 9), 9500, d(26, 9)), B('CT-7702', 'ct', d(29, 8), 5000, d(12, 9)),
  B('RW-118', 'rw', d(17, 9), 4000, d(24, 9)), B('RW-112', 'rw', d(20, 9), 6200, d(27, 9)),
  B('RT-4410', 'rt', d(12, 8), 95000, d(11, 9), 'PO-2608-0015', 'GRN-0104'),
  B('NFH-2231-A', 'nfh', d(12, 9), 112600, d(12, 10), 'PO-2609-0020', 'GRN-0118'),
  B('DBI-7702', 'dbi', d(5, 9), 52980, d(20, 9), 'PO-2609-0019', 'GRN-0112'),
  B('MIM-0817', 'mim', d(20, 8), 41300, d(3, 9), 'PO-2608-0017', 'GRN-0101'),
];
const SEED_PAYMENTS = [
  P('dgh', d(22, 9), 10000, 'bKash', 'bkash', 'Rakib Hasan', 'TrxID 8JD4K2LQ', { 'DGH-58011': 10000 }),
  P('tli', d(20, 7), 39000, 'Bank', 'brac', 'Rakib Hasan', 'Transfer BRAC-77120', { 'TLI-1019': 39000 }),
  P('tli', d(11, 8), 61500, 'Bank', 'dbbl', 'Rakib Hasan', 'Cheque · Dutch-Bangla 004512', { 'TLI-1043': 61500 }),
  P('tli', d(22, 8), 30000, 'Cash', 'safe', 'Rafi Ahmed', 'Handed to Jashim', { 'TLI-1071': 30000 }),
  P('tli', d(30, 8), 20000, 'Cash', 'cash-shop', 'Sadia Akter', 'At delivery', { 'TLI-1098': 20000 }),
  P('tli', d(4, 9), 14000, 'Cash', 'cash-shop', 'Rafi Ahmed', '', { 'TLI-1071': 14000 }),
  P('tli', d(15, 9), 7000, 'bKash', 'bkash', 'Rakib Hasan', 'TrxID 9KX2M7Q', { 'TLI-1098': 7000 }),
  P('tli', d(29, 9), 15000, 'Cash', 'cash-shop', 'Rakib Hasan', 'At delivery', { 'TLI-1127': 15000 }),
  P('mm', d(27, 9), 10000, 'Bank', 'brac', 'Rakib Hasan', 'Transfer BRAC-78004', { 'MM-8990': 10000 }),
  P('ee', d(28, 9), 10000, 'Bank', 'brac', 'Rakib Hasan', 'Transfer BRAC-78031', { 'EE-44702': 10000 }),
  P('kf', d(25, 9), 4500, 'Cash', 'cash-shop', 'Sadia Akter', '', { 'KF-5490': 4500 }),
  P('pc', d(19, 9), 6000, 'Cash', 'cash-shop', 'Rafi Ahmed', '', { 'PC-2174': 6000 }),
  P('pr', d(20, 9), 10000, 'bKash', 'bkash', 'Rakib Hasan', 'TrxID 7QP3N8RT', { 'PR-3265': 10000 }),
  P('ct', d(12, 9), 5000, 'Cash', 'safe', 'Rafi Ahmed', '', { 'CT-7702': 5000 }),
  P('rw', d(27, 9), 6200, 'Cash', 'cash-shop', 'Sadia Akter', '', { 'RW-112': 6200 }),
  P('rt', d(5, 9), 95000, 'Bank', 'brac', 'Rakib Hasan', 'Transfer BRAC-76650', { 'RT-4410': 95000 }),
  P('nfh', d(17, 9), 50000, 'Bank', 'dbbl', 'Rakib Hasan', 'Cheque · Dutch-Bangla 004530', { 'NFH-2231-A': 50000 }),
  P('dbi', d(12, 9), 52980, 'bKash', 'bkash', 'Rakib Hasan', 'TrxID 6LM2W9XA', { 'DBI-7702': 52980 }),
].map((p, i) => ({ ...p, no: 'SP-' + String(i + 1).padStart(4, '0') }));

const billLeftRaw = (b) => Math.max(0, (b.amount || 0) - (b.paid || 0) - (b.credited || 0));
const statusFor = (b) => (billLeftRaw(b) <= 0 ? 'Paid' : (b.paid || 0) + (b.credited || 0) > 0 ? 'Partly paid' : 'Open');
const withStatus = (b) => ({ ...b, status: statusFor(b) });

function seedDb() {
  const bills = SEED_BILLS.map((b) => withSeedLines({ ...b }));
  SEED_PAYMENTS.forEach((p) => Object.entries(p.alloc).forEach(([no, amt]) => { const b = bills.find((x) => x.no === no); if (b) b.paid += amt; }));
  return { suppliers: [], bills: bills.map(withStatus), payments: SEED_PAYMENTS.slice(), credits: [], returns: [] };
}

// suppliers added on the old Suppliers page come along
function fromOld(db) {
  try {
    const old = JSON.parse(window.localStorage.getItem(OLD_KEY));
    if (!old || !Array.isArray(old.added)) return db;
    const days = { 'On delivery': 0, '7 days': 7, '15 days': 15, '30 days': 30 };
    return { ...db, suppliers: old.added.map((s) => ({ id: s.id, name: s.name, phone: s.phone, kind: s.kind, goods: s.goods, year: 0, terms: days[s.terms] ?? DEFAULT_TERMS, person: '', address: '', since: new Date().getFullYear() })) };
  } catch { return db; }
}

const read = () => {
  try {
    const s = JSON.parse(window.localStorage.getItem(KEY));
    if (s && Array.isArray(s.bills)) return { suppliers: [], payments: [], credits: [], returns: [], ...s, bills: s.bills.map((b) => withStatus(withSeedLines(b))) };
  } catch { /* ignore */ }
  return fromOld(seedDb());
};
const write = (db) => { try { window.localStorage.setItem(KEY, JSON.stringify(db)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } return db; };

/** Everything at once: { suppliers (demo + added), bills, payments, credits, returns }. The demo rows on the server. */
export function getDb() {
  const db = typeof window === 'undefined' ? seedDb() : read();
  return { ...db, suppliers: [...db.suppliers, ...SUPPLIERS] };
}
/** The demo data only, for a first render that must match the server. */
export function demoDb() { const db = seedDb(); return { ...db, suppliers: [...SUPPLIERS] }; }

export const getSuppliers = () => getDb().suppliers;
export const getBills = () => getDb().bills;
export const getPayments = () => getDb().payments;
export const getCredits = () => getDb().credits;
export const getSupplierReturns = () => getDb().returns;

export const supplierById = (id, list = getSuppliers()) => list.find((s) => s.id === id) || null;
export const supplierByName = (name, list = getSuppliers()) => list.find((s) => s.name.toLowerCase() === String(name || '').trim().toLowerCase()) || null;
/** Id or name → supplier. */
export const findSupplier = (key, list = getSuppliers()) => supplierById(key, list) || supplierByName(key, list);

/** Add a supplier: { name, phone, kind, goods, terms (days), person, address }. Returns it. */
export function addSupplier(s) {
  const db = read();
  const made = { id: 'sup-' + Date.now().toString(36), name: s.name.trim(), phone: s.phone || '—', kind: s.kind || 'Supplier', goods: s.goods || '—', year: 0, terms: s.terms ?? DEFAULT_TERMS, person: s.person || '', address: s.address || '', since: new Date().getFullYear() };
  write({ ...db, suppliers: [made, ...db.suppliers] });
  return made;
}
/** The supplier with this name, added (with the usual terms) when it is not on the list yet. */
export function ensureSupplier(name) {
  return supplierByName(name) || addSupplier({ name: String(name || 'Unknown supplier') });
}

export const billLeft = billLeftRaw;
/** 'Paid' | 'Partly paid' | 'Open' | 'Overdue' (open and past its due day). */
export function billStatus(b, today = dayStart()) {
  const s = statusFor(b);
  return s !== 'Paid' && daysFrom(b.due, today) < 0 ? 'Overdue' : s;
}
export const BILL_TONE = { Paid: 'success', 'Partly paid': 'warning', Open: 'slate', Overdue: 'error' };

function nextNo(list, prefix) {
  const last = list.reduce((m, x) => (x.no.startsWith(prefix) ? Math.max(m, Number(x.no.slice(prefix.length)) || 0) : m), 0);
  return prefix + String(last + 1).padStart(4, '0');
}

/** Use a supplier's unused credit notes on its open bills, oldest due first. Mutates `db`. */
function applyCredits(db, supplier) {
  db.credits.filter((c) => c.supplier === supplier && c.unused > 0).forEach((c) => {
    db.bills.filter((b) => b.supplier === supplier && billLeftRaw(b) > 0).sort((a, b) => a.due - b.due).forEach((b) => {
      if (c.unused <= 0) return;
      const take = Math.min(c.unused, billLeftRaw(b));
      b.credited = (b.credited || 0) + take;
      c.applied = { ...c.applied, [b.no]: (c.applied?.[b.no] || 0) + take };
      c.unused -= take;
      b.status = statusFor(b);
    });
  });
}

/**
 * Add a bill: { supplier (id or name), po, grn, ref, amount, lines: [{ name, qty, cost }], extra, notes, at, due }.
 * Without `due`, it falls due after the supplier's terms (15 days when unknown). Returns the bill.
 */
export function addBill(bill) {
  const sup = findSupplier(bill.supplier) || ensureSupplier(bill.supplier);
  const db = read();
  const at = bill.at || Date.now();
  const terms = sup.terms ?? DEFAULT_TERMS;
  const made = withStatus({
    no: nextNo(db.bills, 'PB-'), supplier: sup.id, po: bill.po || '', grn: bill.grn || '', ref: bill.ref || '', at,
    amount: Math.round(bill.amount || 0), due: bill.due || dayStart(at) + terms * DAY, paid: 0, credited: 0,
    lines: bill.lines || [], extra: bill.extra || 0, notes: bill.notes || '',
  });
  db.bills = [made, ...db.bills];
  applyCredits(db, sup.id);
  write(db);
  return db.bills.find((b) => b.no === made.no);
}

/**
 * Pay a supplier. { supplier (id), bills: [bill nos, paid in this order], amount, method, account (ledger id), by, ref, note }.
 * The money clears the bills in order; anything short stays on the last one. Posts the money leaving the account.
 * Returns the payment.
 */
export function paySupplier(p) {
  const db = read();
  const sup = findSupplier(p.supplier, [...db.suppliers, ...SUPPLIERS]);
  let left = Math.round(p.amount || 0);
  const alloc = {};
  p.bills.forEach((no) => {
    const b = db.bills.find((x) => x.no === no);
    if (!b || left <= 0) return;
    const take = Math.min(left, billLeftRaw(b));
    if (!take) return;
    b.paid = (b.paid || 0) + take; b.status = statusFor(b);
    alloc[no] = take; left -= take;
  });
  const amount = Math.round(p.amount || 0) - left;
  const pay = { no: nextNo(db.payments, 'SP-'), supplier: p.supplier, bills: Object.keys(alloc), alloc, amount, method: p.method, account: p.account, by: p.by || 'Staff', ref: p.ref || '', note: p.note || '', at: Date.now() };
  db.payments = [pay, ...db.payments];
  write(db);
  postEntry({ account: p.account, amount: -amount, kind: 'supplier payment', ref: pay.bills.join(', '), party: sup ? sup.name : p.supplier, note: [pay.no, p.ref].filter(Boolean).join(' · '), by: pay.by });
  return pay;
}

/**
 * Add a credit note: { supplier (id or name), amount, ret, po, lines, note }. It comes off the supplier's open bills
 * straight away (oldest due first); what is left waits for the next bill. Returns the credit note.
 */
export function addCredit(c) {
  const sup = findSupplier(c.supplier) || ensureSupplier(c.supplier);
  const db = read();
  const made = { no: nextNo(db.credits, 'CN-'), supplier: sup.id, ret: c.ret || '', po: c.po || '', amount: Math.round(c.amount || 0), applied: {}, unused: Math.round(c.amount || 0), lines: c.lines || [], note: c.note || '', at: Date.now() };
  db.credits = [made, ...db.credits];
  applyCredits(db, sup.id);
  write(db);
  return db.credits.find((x) => x.no === made.no);
}

/**
 * Record goods sent back to a supplier and the credit note for their value.
 * { supplier (id or name), lines: [{ holdId, name, sku, qty, cost, po }], reason, how, note, by }. Returns { ret, credit }.
 */
export function addSupplierReturn(r) {
  const sup = findSupplier(r.supplier) || ensureSupplier(r.supplier);
  const value = r.lines.reduce((a, l) => a + l.qty * l.cost, 0);
  const pos = [...new Set(r.lines.map((l) => l.po).filter(Boolean))];
  const db0 = read();
  const no = nextNo(db0.returns, 'SR-');
  const credit = value ? addCredit({ supplier: sup.id, amount: value, ret: no, po: pos.join(', '), lines: r.lines, note: r.reason }) : null;
  const db = read();
  const ret = { no, supplier: sup.id, lines: r.lines, reason: r.reason, how: r.how, note: r.note || '', by: r.by || 'Staff', at: Date.now(), credit: credit ? credit.no : '', value };
  db.returns = [ret, ...db.returns];
  write(db);
  return { ret, credit };
}

// ---- per supplier
export const billsOf = (id, db = getDb()) => db.bills.filter((b) => b.supplier === id);
export const paymentsOf = (id, db = getDb()) => db.payments.filter((p) => p.supplier === id);
export const creditsOf = (id, db = getDb()) => db.credits.filter((c) => c.supplier === id);
export const returnsOf = (id, db = getDb()) => db.returns.filter((r) => r.supplier === id);

/** What the shop owes a supplier now. */
export function payableOf(id, db = getDb()) {
  const open = billsOf(id, db).reduce((a, b) => a + billLeftRaw(b), 0);
  const unused = creditsOf(id, db).reduce((a, c) => a + (c.unused || 0), 0);
  return Math.max(0, open - unused);
}

/** Totals for one supplier: bought (all bills), paid, credit (returns), payable, overdue, due today, open bills. */
export function totalsOf(id, db = getDb(), today = dayStart()) {
  const bills = billsOf(id, db);
  const open = bills.filter((b) => billLeftRaw(b) > 0).sort((a, b) => a.due - b.due);
  const leftWhen = (test) => open.filter((b) => test(daysFrom(b.due, today))).reduce((a, b) => a + billLeftRaw(b), 0);
  return {
    bought: bills.reduce((a, b) => a + b.amount, 0),
    paid: paymentsOf(id, db).reduce((a, p) => a + p.amount, 0),
    credit: creditsOf(id, db).reduce((a, c) => a + c.amount, 0),
    payable: payableOf(id, db),
    overdue: leftWhen((o) => o < 0),
    today: leftWhen((o) => o === 0),
    open,
    first: bills.reduce((m, b) => Math.min(m, b.at), Infinity),
  };
}

/**
 * The supplier's ledger, oldest first, with a running balance (what the shop owes after each line).
 * Rows: { kind: 'bill'|'payment'|'credit', no, at, text, plus (bought), minus (paid or credit), balance, item }.
 */
export function ledgerOf(id, db = getDb()) {
  const rows = [
    ...billsOf(id, db).map((b) => ({ kind: 'bill', no: b.no, at: b.at, plus: b.amount, minus: 0, item: b })),
    ...paymentsOf(id, db).map((p) => ({ kind: 'payment', no: p.no, at: p.at, plus: 0, minus: p.amount, item: p })),
    ...creditsOf(id, db).map((c) => ({ kind: 'credit', no: c.no, at: c.at, plus: 0, minus: c.amount, item: c })),
  ].sort((a, b) => a.at - b.at || (a.kind === 'bill' ? -1 : 1));
  let bal = 0;
  return rows.map((r) => { bal += r.plus - r.minus; return { ...r, balance: bal }; });
}

/** The supplier's latest payment, or null. */
export const lastPaymentOf = (id, db = getDb()) => paymentsOf(id, db).reduce((m, p) => (!m || p.at > m.at ? p : m), null);
/** Bought this year: the demo figure plus bills added in this browser this year. */
export function boughtThisYear(s, db = getDb()) {
  const y = new Date().getFullYear();
  return (s.year || 0) + billsOf(s.id, db).filter((b) => !b.seed && new Date(b.at).getFullYear() === y).reduce((a, b) => a + b.amount, 0);
}
