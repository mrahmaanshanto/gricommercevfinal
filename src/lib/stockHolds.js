// stockHolds — stock that is in the building but not free to sell.
//   Online order   held when the order is Approved; leaves when delivered, comes back when the parcel
//                  is returned without damage, moves to damaged stock when it comes back damaged.
//   Retail order   held for an invoice or a counter customer, from the place the merchant chooses.
//   Damaged        set aside, not for sale. Damaged stock moves to the 'Returns & damaged' bay
//                  (DAMAGED_PLACE); `from` keeps the place it came from.
// Front end only: kept in this browser; starts from demo rows.

const KEY = 'gc.stock.holds';
import { STOCK_PLACES, DAMAGED_PLACE, placeName, getStockPlaces, getFilterPlaces } from './locations';

export const HOLD_PLACES = STOCK_PLACES;
/** Places a hold can sit at, including the damaged bay (for place filters). */
export const HOLD_FILTER_PLACES = [...STOCK_PLACES, DAMAGED_PLACE];
/** Live lists (read them after mount; the constants above are the built-in lists for a first render):
 *  places a new hold can come from (active places only), and places for filters of past holds
 *  (active, then deactivated places, then the damaged bay). */
export const getHoldPlaces = () => (typeof window === 'undefined' ? HOLD_PLACES : getStockPlaces());
export const getHoldFilterPlaces = () => (typeof window === 'undefined' ? HOLD_FILTER_PLACES : [...getFilterPlaces(), DAMAGED_PLACE]);
export { DAMAGED_PLACE };
export const HOLD_TYPES = { online: 'Online order', retail: 'Retail order', damaged: 'Damaged' };

const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const SEED = [
  { id: 'HLD-0012', type: 'online', ref: '#136812', who: 'Nusrat Jahan', product: 'Sunscreen SPF 50 · 50ml', qty: 2, place: 'Central Warehouse', status: 'held', note: 'Order approved', at: at(30, 10, 12), by: 'System' },
  { id: 'HLD-0011', type: 'online', ref: '#136810', who: 'Karim Saheb', product: 'Wireless Earbuds Pro', qty: 1, place: 'Central Warehouse', status: 'held', note: 'Order approved · with courier', at: at(29, 17, 40), by: 'System' },
  { id: 'HLD-0010', type: 'online', ref: '#136804', who: 'Salma Begum', product: 'Denim Jeans · Blue · 32', qty: 1, place: 'Central Warehouse', status: 'released', note: 'Returned without damage', at: at(27, 12, 5), closedAt: at(30, 9, 30), by: 'System' },
  { id: 'HLD-0009', type: 'online', ref: '#136799', who: 'Rafiq Mia', product: 'Hyaluronic Toner 150ml', qty: 1, place: DAMAGED_PLACE, status: 'damaged', from: 'Central Warehouse', note: 'Returned damaged: bottle leaked', at: at(26, 15, 20), closedAt: at(29, 11, 0), by: 'System' },
  { id: 'HLD-0008', type: 'retail', ref: 'INV-0231', who: 'Jamal Telecom', product: 'Steel Water Bottle 750ml', qty: 24, place: 'Central Warehouse', status: 'held', note: 'Held until the invoice is collected', at: at(25, 11, 25), by: 'Sadia Akter' },
  { id: 'HLD-0007', type: 'retail', ref: 'Counter', who: 'Walk-in · will collect Friday', product: 'Rice Cooker 1.8L Walton', qty: 1, place: 'Dhanmondi branch', status: 'held', note: 'Advance ৳500 taken', at: at(29, 18, 10), by: 'Rafi Ahmed' },
  { id: 'HLD-0006', type: 'damaged', ref: '—', who: '—', product: 'Daily Care Shampoo 340ml', qty: 3, place: DAMAGED_PLACE, from: 'Mirpur branch', status: 'damaged', note: 'Cap broken on the shelf', at: at(28, 13, 0), closedAt: at(28, 13, 0), by: 'Moumita Das' },
];

/** Old place names become today's; damaged stock saved at a shelf moves to the damaged bay. */
const norm = (h) => {
  const place = placeName(h.place);
  if (h.status === 'damaged' && place !== DAMAGED_PLACE) return { ...h, place: DAMAGED_PLACE, from: placeName(h.from || place) };
  return { ...h, place, from: h.from ? placeName(h.from) : h.from };
};
/** Closing a hold as damaged moves it to the damaged bay. */
const toDamaged = (h) => (h.place === DAMAGED_PLACE ? h : { ...h, place: DAMAGED_PLACE, from: h.place });
const read = () => { try { return (JSON.parse(window.localStorage.getItem(KEY)) || SEED).map(norm); } catch { return SEED.map(norm); } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };

export const getHolds = () => (typeof window === 'undefined' ? [] : read());
const nextId = (list) => 'HLD-' + String(list.reduce((m, x) => Math.max(m, Number(x.id.split('-')[1]) || 0), 0) + 1).padStart(4, '0');

/** Hold one or more products. `lines` is [{ name, qty }]. Returns the new list.
 *  type 'damaged' takes the stock from `place` to the damaged bay (DAMAGED_PLACE). */
export function addHolds({ type, ref, who, place, note, by }, lines) {
  let list = read();
  const damaged = type === 'damaged';
  lines.forEach((l) => {
    list = [{ id: nextId(list), type, ref: ref || '—', who: who || '—', product: l.name, qty: l.qty, place: damaged ? DAMAGED_PLACE : place, from: damaged ? placeName(place) : undefined, status: damaged ? 'damaged' : 'held', note: note || '', at: Date.now(), closedAt: damaged ? Date.now() : undefined, by: by || 'Staff' }, ...list];
  });
  write(list);
  return list;
}
/** Close a hold: 'released' puts it back on sale, 'damaged' moves it to damaged stock, 'delivered' means it left. */
export function closeHold(id, status, note) {
  const list = read().map((h) => (h.id === id ? (status === 'damaged' ? toDamaged : (x) => x)({ ...h, status, note: note || h.note, closedAt: Date.now() }) : h));
  write(list);
  return list;
}
export const holdsFor = (ref) => getHolds().filter((h) => h.ref === ref && h.status === 'held');
/** End every open hold of an order or invoice at once, e.g. when it is cancelled. Returns the ended holds. */
export function endHoldsFor(ref, status, note) {
  const ended = holdsFor(ref);
  if (ended.length) write(read().map((h) => (h.ref === ref && h.status === 'held' ? (status === 'damaged' ? toDamaged : (x) => x)({ ...h, status, note: note || h.note, closedAt: Date.now() }) : h)));
  return ended;
}
