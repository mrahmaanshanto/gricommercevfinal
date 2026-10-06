// batches — stock that expires. A purchase line with an expiry date (Purchases › New purchase) becomes a batch:
//   { id, sku, name, place, qty, expiry (end of that day, ms), ref (bill no.), supplier, at, done, doneAt, doneWhy }
// leftOf(batch): what is still on the shelf from it — the batch's pieces, never more than the place has now (sales
// take the oldest first, so a later batch keeps its pieces longest).
// expiryList(): batches that are expired or expire within `days`, with what is left, for Damaged & expired.
// writeOffBatch(): the expired pieces leave the stock (a write-off move) and the batch is closed.
// Front end only (gc.stock.batches); a few demo batches from earlier purchases.

import { addMove, stockAt, productBy, unitValue } from './stock';
import { onlinePlace } from './locations';

const KEY = 'gc.stock.batches';
export const BATCH_EVENT = 'gc:batches';
const DAY = 864e5;
const endOf = (y, m, d) => new Date(y, m - 1, d, 23, 59, 59).getTime();
const B = (id, sku, name, qty, expiry, ref, supplier, at) => ({ id, sku, name, place: 'Central Warehouse', qty, expiry, ref, supplier, at, done: false, seed: true });
const SEED = [
  B('BT-0001', 'AU-EAR-TC', 'Type-C Wired Earphones', 12, endOf(2026, 9, 29), 'PB-0003', 'Dhaka Audio Imports', endOf(2026, 3, 2)),
  B('BT-0002', 'AC-LNS-PR', 'Camera Lens Protector', 30, endOf(2026, 10, 9), 'PB-0005', 'Rahman Telecom', endOf(2026, 8, 9)),
  B('BT-0003', 'AC-CHG-20', 'Anker 20W USB-C Charger', 24, endOf(2026, 10, 18), 'PB-0003', 'Dhaka Audio Imports', endOf(2026, 4, 10)),
  B('BT-0004', 'AC-CBL-LTG', 'Lightning Cable 1m', 18, endOf(2026, 10, 26), 'PB-0006', 'Rahman Telecom', endOf(2026, 5, 3)),
  B('BT-0005', 'AC-GLS-9H', 'Tempered Glass 9H', 20, endOf(2026, 12, 20), 'PB-0005', 'Rahman Telecom', endOf(2026, 8, 9)),
];

const read = () => { if (typeof window === 'undefined') return SEED; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(BATCH_EVENT)); } catch { /* ignore */ } };
export const getBatches = () => read();

/** Add batches from a purchase: lines [{ sku, name, qty, expiry (ms) }]. */
export function addBatches(lines, { place = onlinePlace(), ref = '', supplier = '' } = {}) {
  const list = read();
  const n = list.length;
  const made = lines.filter((l) => l.expiry && l.qty > 0).map((l, i) => ({ id: 'BT-' + String(n + i + 1).padStart(4, '0'), sku: l.sku, name: l.name, place, qty: l.qty, expiry: endOf(...isoParts(l.expiry)), ref, supplier, at: Date.now(), done: false }));
  if (made.length) write([...made, ...list]);
  return made;
}
const isoParts = (t) => { const d = new Date(t); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; };

/** What is still on the shelf from a batch. */
export function leftOf(b) {
  if (b.done) return 0;
  const p = productBy(b.sku) || productBy(b.name);
  if (!p) return 0;
  const onHand = Math.max(0, stockAt(p.sku, b.place).onHand);
  // newer batches of the same product at the same place are sold last: they keep their pieces first
  const newer = read().filter((x) => !x.done && x.id !== b.id && x.sku === b.sku && x.place === b.place && x.expiry > b.expiry).reduce((a, x) => a + x.qty, 0);
  return Math.max(0, Math.min(b.qty, onHand - newer));
}

/** Batches expired or expiring within `days`, soonest first: [{ ...batch, left, daysLeft, value, expired }]. */
export function expiryList({ days = 30, now = Date.now() } = {}) {
  return read().filter((b) => !b.done && b.expiry - now <= days * DAY).map((b) => {
    const p = productBy(b.sku) || productBy(b.name);
    const left = leftOf(b);
    return { ...b, left, daysLeft: Math.ceil((b.expiry - now) / DAY), expired: b.expiry < now, value: left * (p ? unitValue(p) : 0) };
  }).filter((b) => b.left > 0).sort((a, b) => a.expiry - b.expiry);
}

/** Expired (or about to): the pieces leave the stock for good and the batch is closed. */
export function writeOffBatch(id, by = 'Staff') {
  const list = read();
  const b = list.find((x) => x.id === id);
  if (!b) return null;
  const left = leftOf(b);
  const p = productBy(b.sku) || productBy(b.name);
  if (p && left) addMove({ sku: p.sku, place: b.place, qty: -left, kind: 'write-off', reason: b.expiry < Date.now() ? 'Expired' : 'Expiring · written off early', by, ref: b.id, batch: b.id, op: b.id + ':writeoff' });
  write(list.map((x) => (x.id === id ? { ...x, done: true, doneAt: Date.now(), doneWhy: 'Written off', left } : x)));
  return { ...b, left };
}
