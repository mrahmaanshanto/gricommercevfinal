// purchaseData — purchase orders, supplier bills and suppliers for the app's purchase screens, in one shape.
// Same books as the web: purchase orders made here and on the web (purchaseOrders.js › getPOs) come first, then the
// demo orders (DEMO_POS), like Purchase orders on the web; supplier bills and payments are supplierBills.js.
//   poRows()          [{ no, stored, supplier, place, at, s, label, tone, shape, total, paid, left, got, of, lines, expected,
//                       receivable, terms, approval }]  s = draft | approval | approved | ordered | partial | received | closed | cancelled
//   poBy(no)          one order (stored or demo), or null
//   billRows()        supplier bills, newest first: [{ ...bill, supplierName, phone, left, status, tone }]
//   owedSummary()     { total, suppliers, late }  what the shop owes suppliers now
//   supplierLines(name)  SKUs bought from a supplier before (its bills and orders), for "fill with low items"
//   lastSupplierOf(sku)  the supplier a SKU was last bought from (name), or ''
//   buyingMode()      { orders, direct }  what Settings › Stock setup allows (stockSetup.js; editions without purchase
//                     orders always buy direct)
//   RECEIVABLE_DEMO   the demo order Receive goods opens on the web (PO-2609-0020)

import { getPOs, DEMO_POS, poPieces, poReceived } from '@/lib/purchaseOrders';
import { getDb, getSuppliers, billLeft, billStatus, findSupplier, supplierById, dayStart } from '@/lib/supplierBills';
import { getStockSetup, usesOrders, buysDirect } from '@/lib/stockSetup';
import { hasModule } from '@/lib/edition';
import { safe } from './stockData';

export const RECEIVABLE_DEMO = 'PO-2609-0020';
const STORED_KEY = { Draft: 'draft', Sent: 'ordered', 'Partly received': 'partial', Received: 'received' };
export const PO_LABEL = { draft: 'Draft', approval: 'Waiting approval', approved: 'Approved', ordered: 'Ordered', partial: 'Partly received', received: 'Received', closed: 'Closed', cancelled: 'Cancelled' };
const PO_TONE = { draft: ['grey', false], approval: ['warn', true], approved: ['nav', false], ordered: ['nav', false], partial: ['warn', true], received: ['ok', true], closed: ['grey', false], cancelled: ['err', true] };
export const BILL_TONE = { Paid: ['ok', true], 'Partly paid': ['warn', true], Open: ['nav', false], Overdue: ['err', true] };

function stored(p, bills) {
  const mine = bills.filter((b) => b.po === p.no);
  const billed = mine.reduce((a, b) => a + (b.amount || 0), 0);
  const left = mine.reduce((a, b) => a + billLeft(b), 0);
  const s = p.approval === 'waiting' && p.status === 'Draft' ? 'approval' : STORED_KEY[p.status] || 'draft';
  const sup = safe(() => findSupplier(p.supplier), null);
  return {
    no: p.no, stored: true, supplier: p.supplier, place: p.place, at: p.at, s, label: PO_LABEL[s], tone: PO_TONE[s][0], shape: PO_TONE[s][1],
    total: p.total, billed, paid: billed - left, left, got: poReceived(p.lines), of: poPieces(p.lines), lines: p.lines, expected: p.expected || '',
    terms: p.terms, approval: p.approval, sentAt: p.sentAt, deliveries: p.deliveries || [], phone: sup ? sup.phone : '', by: p.by || '',
    receivable: p.status !== 'Received' && !(p.status === 'Draft'),
  };
}
function demo(r) {
  const sup = safe(() => findSupplier(r.supplier), null);
  return {
    no: r.no, stored: false, supplier: r.supplier, place: r.place, at: r.at, s: r.s, label: PO_LABEL[r.s], tone: PO_TONE[r.s][0], shape: PO_TONE[r.s][1],
    total: r.total, billed: r.total, paid: r.paid, left: r.s === 'cancelled' ? 0 : Math.max(0, r.total - r.paid), got: r.got, of: r.of, lines: r.lines, expected: '', due: r.due, overdue: !!r.overdue,
    terms: sup ? sup.terms : undefined, deliveries: [], phone: sup ? sup.phone : '', receivable: r.no === RECEIVABLE_DEMO,
  };
}

export function poRows() {
  const bills = safe(() => getDb().bills, []);
  return [...safe(() => getPOs(), []).map((p) => stored(p, bills)), ...DEMO_POS.map(demo)];
}
export const poBy = (no) => poRows().find((p) => p.no === no) || null;

export function billRows() {
  const today = dayStart();
  return safe(() => getDb().bills, []).map((b) => {
    const sup = safe(() => supplierById(b.supplier) || findSupplier(b.supplier), null);
    const status = billStatus(b, today);
    return { ...b, supplierName: sup ? sup.name : b.supplier, phone: sup ? sup.phone : '', left: billLeft(b), status, tone: (BILL_TONE[status] || ['grey'])[0], shape: (BILL_TONE[status] || [0, false])[1] };
  }).sort((a, b) => (b.at || 0) - (a.at || 0));
}

export function owedSummary() {
  const bills = billRows().filter((b) => b.left > 0);
  const sups = new Set(bills.map((b) => b.supplier));
  const late = new Set(bills.filter((b) => b.status === 'Overdue').map((b) => b.supplier));
  return { total: bills.reduce((a, b) => a + b.left, 0), suppliers: sups.size, late: late.size };
}

export function supplierLines(name) {
  const sup = safe(() => findSupplier(name), null);
  const skus = new Set();
  safe(() => getDb().bills, []).filter((b) => sup && b.supplier === sup.id).forEach((b) => (b.lines || []).forEach((l) => { if (l.sku) skus.add(l.sku); }));
  poRows().filter((p) => p.supplier === name).forEach((p) => p.lines.forEach((l) => { if (l.sku) skus.add(l.sku); }));
  return [...skus];
}
export function lastSupplierOf(sku) {
  const bills = safe(() => getDb().bills, []).filter((b) => (b.lines || []).some((l) => l.sku === sku)).sort((a, b) => b.at - a.at);
  if (bills[0]) { const s = safe(() => supplierById(bills[0].supplier), null); if (s) return s.name; }
  const po = poRows().filter((p) => p.lines.some((l) => l.sku === sku)).sort((a, b) => b.at - a.at)[0];
  return po ? po.supplier : '';
}

export function buyingMode() {
  const s = safe(() => getStockSetup(), { buying: 'direct' });
  const can = safe(() => hasModule('purchasing'), false);
  return { orders: can && usesOrders(s), direct: buysDirect(s) || !can };
}

export const suppliers = () => safe(() => getSuppliers(), []);
