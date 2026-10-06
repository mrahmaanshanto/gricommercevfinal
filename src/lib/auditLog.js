// auditLog — every manager approval asked for at the POS and in stock screens, approved or refused:
// voids, price overrides, line discounts, discounts above the limit, refunds and late returns,
// credit-limit overrides, stock adjustments and counts. ManagerPin writes a row for every PIN tried.
// Front end only: kept in this browser (gc.audit.log) on top of a small September demo history that
// matches the POS demo staff and the demo sales (refs are sale numbers in salesBook).
//   { id, at, action, detail, by, approvedBy, ok, ref, amount?, counter?, place? }
//   by          who asked (the cashier or staff member)
//   approvedBy  the manager whose PIN was entered
//   ok          false when the PIN was wrong (the action did not happen)

export const AUDIT_KEY = 'gc.audit.log';
export const AUDIT_ACTIONS = ['Void sale', 'Void line', 'Price override', 'Line discount', 'Discount above limit', 'Refund', 'Late return', 'Credit limit', 'Stock adjustment', 'Stock count', 'Manager approval'];

const at = (d, h, m) => new Date(2026, 8, d, h, m).getTime();
const D1 = 'Dhanmondi · Counter 1', D2 = 'Dhanmondi · Counter 2', M1 = 'Mirpur · Counter 1';
const DH = 'Dhanmondi branch', MP = 'Mirpur branch';
const row = (id, when, action, detail, by, approvedBy, ok, ref, amount, counter, place) => ({ id, at: when, action, detail, by, approvedBy, ok, ref, amount, counter, place, seed: true });
const SEED = [
  row('AU-0001', at(3, 13, 42), 'Void sale', 'Sale cancelled after payment was taken: customer changed their mind', 'Kamrul Islam', 'Rakib Hasan', true, '', 2340, D2, DH),
  row('AU-0002', at(3, 10, 58), 'Line discount', 'Discount of ৳218 on a bulk grocery basket', 'Moumita Das', 'Nabila Rahman', true, 'Z-0309-021', 218, M1, MP),
  row('AU-0003', at(5, 19, 5), 'Void sale', 'Sale cancelled after payment was taken: wrong items scanned', 'Kamrul Islam', 'Rakib Hasan', true, '', 3190, D2, DH),
  row('AU-0004', at(5, 19, 2), 'Void sale', 'Sale cancelled after payment was taken: wrong items scanned', 'Kamrul Islam', 'Rakib Hasan', false, '', 3190, D2, DH),
  row('AU-0005', at(7, 20, 31), 'Void line', 'Wireless Earbuds Pro removed after the bill was printed', 'Kamrul Islam', 'Rakib Hasan', true, '', 3490, D2, DH),
  row('AU-0006', at(8, 18, 14), 'Void sale', 'Sale cancelled after payment was taken: customer had no change', 'Kamrul Islam', 'Rakib Hasan', true, '', 1880, D2, DH),
  row('AU-0007', at(11, 12, 20), 'Refund', 'Cash refund: Baseus USB-C Cable 100W 1m × 1, sack torn', 'Sadia Akter', 'Rakib Hasan', true, 'Z-1109-019', 780, D1, DH),
  row('AU-0008', at(14, 17, 36), 'Price override', 'Wireless Earbuds Pro from ৳3,490 to ৳2,982 (display piece)', 'Rafi Ahmed', 'Rakib Hasan', true, 'Z-1409-035', 508, D1, DH),
  row('AU-0009', at(16, 15, 50), 'Discount above limit', '20% discount for a staff family purchase (limit 15%)', 'Arif Rahman', 'Nabila Rahman', true, '', 1240, M1, MP),
  row('AU-0010', at(17, 17, 57), 'Line discount', 'Discount of ৳70 on Camera Lens Protector (dented packs)', 'Rafi Ahmed', 'Rakib Hasan', true, 'Z-1709-010', 70, D2, DH),
  row('AU-0011', at(17, 19, 22), 'Line discount', 'Discount of ৳166 for a regular customer', 'Moumita Das', 'Nabila Rahman', true, 'Z-1709-022', 166, M1, MP),
  row('AU-0012', at(19, 13, 30), 'Late return', 'Return 9 days after the sale (window 7 days): Spigen Tough Armor Case · Galaxy A55', 'Arif Rahman', 'Nabila Rahman', true, 'Z-1909-026', 1240, M1, MP),
  row('AU-0013', at(22, 15, 18), 'Discount above limit', '18% discount asked on a ৳6,295 basket (limit 15%); sold at full price', 'Sadia Akter', 'Rakib Hasan', false, 'Z-2209-022', 1133, D1, DH),
  row('AU-0014', at(24, 12, 40), 'Late return', 'Exchange 10 days after the sale (window 7 days): Baseus Car Phone Holder, size', 'Moumita Das', 'Nabila Rahman', true, '', 1890, M1, MP),
  row('AU-0015', at(26, 18, 40), 'Refund', 'bKash refund: Type-C Wired Earphones × 1, seal broken', 'Rafi Ahmed', 'Rakib Hasan', true, 'Z-2609-046', 990, D2, DH),
  row('AU-0016', at(27, 19, 25), 'Price override', 'Lightning Cable 1m from ৳420 to ৳380 (price tag was wrong)', 'Rafi Ahmed', 'Rakib Hasan', false, 'Z-2709-019', 120, D2, DH),
  row('AU-0017', at(29, 16, 25), 'Refund', 'Cash refund: Anker 20W USB-C Charger × 1, wrong shade', 'Rafi Ahmed', 'Rakib Hasan', true, 'Z-2909-018', 1250, D2, DH),
  row('AU-0018', at(29, 11, 5), 'Stock adjustment', 'Foldable Phone Stand at Mirpur branch: −2 pieces (damaged)', 'Arif Rahman', 'Nabila Rahman', true, '', 1300, '', MP),
];

const read = () => { try { const v = JSON.parse(window.localStorage.getItem(AUDIT_KEY)); return Array.isArray(v) ? v : []; } catch { return []; } };

/** Every approval asked for, newest first: the ones made in this browser, then the demo history. */
export function getAuditLog() {
  const mine = typeof window === 'undefined' ? [] : read();
  return [...mine, ...SEED].sort((a, b) => b.at - a.at);
}

/** Add one row: { action, detail, by, approvedBy, ok, ref, amount?, counter?, place? }. Returns it. */
export function logAudit(entry) {
  if (typeof window === 'undefined') return null;
  const list = read();
  const n = list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-').pop()) || 0), 100) + 1;
  const saved = { id: 'AU-' + String(n).padStart(4, '0'), at: Date.now(), action: 'Manager approval', detail: '', by: 'Staff', approvedBy: '', ok: true, ref: '', ...entry };
  try { window.localStorage.setItem(AUDIT_KEY, JSON.stringify([saved, ...list].slice(0, 2000))); } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent('gc:audit')); } catch { /* ignore */ }
  return saved;
}
