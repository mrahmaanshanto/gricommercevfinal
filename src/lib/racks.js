// racks — where stock sits inside a place: rack → shelf → bin, and what is in each bin.
//   rack   { id, place (place id), code 'A', name 'Fast movers', shelves 4, bins 6 (per shelf), capacity 40 (pieces per bin) }
//   slot   { id, place, rack (rack id), shelf, bin, sku, qty }   one product in one bin
// A bin's code is rack-shelf-bin: A-2-05 is rack A, shelf 2, bin 5.
// Rules (checked here, shown by Racks & bins):
//   - what is put into bins for a product at a place can't be more than it has on hand there (stockAt)
//   - a bin can't hold more pieces than its capacity
//   - a rack with products in it can't be removed, and can't lose shelves or bins that hold stock
// Front end only: kept in this browser (localStorage 'gc.stock.racks'); starts from demo racks at
// Central Warehouse and Dhanmondi branch that stay within their stock.

import { stockAt, productBy, getCatalog } from './stock';
import { placeById, getPlaces } from './locations';

const KEY = 'gc.stock.racks';
const pad2 = (n) => String(n).padStart(2, '0');
export const binCode = (rack, shelf, bin) => `${rack.code}-${shelf}-${pad2(bin)}`;

const R = (id, place, code, name, shelves, bins, capacity) => ({ id, place, code, name, shelves, bins, capacity });
const SEED_RACKS = [
  R('RK-cw-A', 'cw', 'A', 'Fast movers', 4, 6, 40),
  R('RK-cw-B', 'cw', 'B', 'Bulk grocery', 3, 4, 80),
  R('RK-cw-C', 'cw', 'C', 'Electronics cage', 3, 4, 20),
  R('RK-dh-S', 'dh', 'S', 'Shop floor', 3, 4, 30),
];
let n = 0;
const S = (place, rack, shelf, bin, sku, qty) => ({ id: 'SL-' + String(++n).padStart(3, '0'), place, rack, shelf, bin, sku, qty });
const SEED_SLOTS = [
  S('cw', 'RK-cw-A', 1, 1, 'SK-SUN-50', 30), S('cw', 'RK-cw-A', 1, 2, 'SK-SUN-50', 30), S('cw', 'RK-cw-A', 1, 3, 'SK-TON-150', 36),
  S('cw', 'RK-cw-A', 2, 1, 'SK-SHA-340', 40), S('cw', 'RK-cw-A', 2, 2, 'SK-SHA-340', 40), S('cw', 'RK-cw-A', 2, 3, 'SK-SHA-340', 20),
  S('cw', 'RK-cw-A', 3, 1, 'CL-TEE-BM', 40), S('cw', 'RK-cw-A', 3, 2, 'CL-TEE-BM', 30), S('cw', 'RK-cw-A', 3, 4, 'CL-JNS-32', 35),
  S('cw', 'RK-cw-A', 4, 1, 'CL-SNK-42', 10), S('cw', 'RK-cw-A', 4, 2, 'CL-LEG-CL', 20),
  S('cw', 'RK-cw-B', 1, 1, 'GR-RICE-5', 80), S('cw', 'RK-cw-B', 1, 2, 'GR-RICE-5', 80), S('cw', 'RK-cw-B', 1, 3, 'GR-DAL-1', 60),
  S('cw', 'RK-cw-B', 2, 1, 'GR-SOY-2', 60), S('cw', 'RK-cw-B', 2, 2, 'GR-ATTA-2', 70),
  S('cw', 'RK-cw-B', 3, 1, 'HM-BTL-750', 60), S('cw', 'RK-cw-B', 3, 2, 'HM-RCK-18', 30),
  S('cw', 'RK-cw-C', 1, 1, 'EL-PHN-128', 20), S('cw', 'RK-cw-C', 1, 2, 'EL-EAR-PRO', 20), S('cw', 'RK-cw-C', 2, 1, 'EL-EAR-PRO', 20),
  S('dh', 'RK-dh-S', 1, 1, 'SK-SHA-340', 30), S('dh', 'RK-dh-S', 1, 2, 'SK-TON-150', 30), S('dh', 'RK-dh-S', 1, 3, 'SK-SUN-50', 4),
  S('dh', 'RK-dh-S', 2, 1, 'CL-JNS-32', 24), S('dh', 'RK-dh-S', 2, 2, 'CL-TEE-BM', 12),
  S('dh', 'RK-dh-S', 3, 1, 'GR-RICE-5', 20), S('dh', 'RK-dh-S', 3, 2, 'HM-BTL-750', 20),
];
/** The demo racks (the same on the server and in the browser, for a first render). */
export const SEED = { racks: SEED_RACKS, slots: SEED_SLOTS };

const read = () => {
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && Array.isArray(v.racks) && Array.isArray(v.slots) ? v : SEED; } catch { return SEED; }
};
const write = (data) => { try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ } };
/** Racks and bin contents in this browser: { racks, slots }. The demo racks on the server. */
export const getRackData = () => (typeof window === 'undefined' ? SEED : read());

// ---- reading ---------------------------------------------------------------------------------------
export const racksAt = (place, data = getRackData()) => data.racks.filter((r) => r.place === place).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
export const rackById = (id, data = getRackData()) => data.racks.find((r) => r.id === id) || null;
/** Every bin of a rack, top shelf first: [{ shelf, bin, code }]. */
export function binsOf(rack) {
  const out = [];
  for (let s = rack.shelves; s >= 1; s--) for (let b = 1; b <= rack.bins; b++) out.push({ shelf: s, bin: b, code: binCode(rack, s, b) });
  return out;
}
const qtyOf = (list) => list.reduce((a, x) => a + (Number(x.qty) || 0), 0);
export const slotsIn = (rackId, shelf, bin, data = getRackData()) => data.slots.filter((x) => x.rack === rackId && x.shelf === shelf && x.bin === bin && x.qty > 0);
export const binUsed = (rackId, shelf, bin, data = getRackData()) => qtyOf(slotsIn(rackId, shelf, bin, data));
/** Pieces of a product in bins at a place. */
export const binnedAt = (place, sku, data = getRackData()) => qtyOf(data.slots.filter((x) => x.place === place && x.sku === sku));
/** Bins that hold a product at a place: [{ code, qty, slot }]. */
export function binsFor(place, sku, data = getRackData()) {
  return data.slots.filter((x) => x.place === place && x.sku === sku && x.qty > 0).map((x) => {
    const r = rackById(x.rack, data);
    return { code: r ? binCode(r, x.shelf, x.bin) : '?', qty: x.qty, slot: x };
  }).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
}
/** Racks, bins and pieces at a place: { racks, bins, used (bins with stock), pieces, capacity }. */
export function placeBinStats(place, data = getRackData()) {
  const racks = racksAt(place, data);
  let bins = 0, used = 0, capacity = 0;
  racks.forEach((r) => {
    bins += r.shelves * r.bins;
    capacity += r.shelves * r.bins * r.capacity;
    const full = new Set(data.slots.filter((x) => x.rack === r.id && x.qty > 0).map((x) => x.shelf + '-' + x.bin));
    used += full.size;
  });
  return { racks: racks.length, bins, used, pieces: qtyOf(data.slots.filter((x) => x.place === place)), capacity };
}
const nameOfPlace = (place) => { const p = placeById(place); return p ? p.name : place; };
/** On hand at a place from the stock list (the limit for what can be put into bins). */
export const onHandAt = (place, sku) => stockAt(sku, nameOfPlace(place)).onHand;

/** Find where a product sits: by name, SKU or barcode, across every place. [{ p, place, placeName, bins: [{ code, qty }], binned }] */
export function findInBins(query, data = getRackData()) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const places = getPlaces();
  const hits = getCatalog().filter((p) => [p.sku, p.name, p.variant, p.barcode].some((x) => String(x || '').toLowerCase().includes(q)));
  const out = [];
  hits.forEach((p) => {
    const at = [...new Set(data.slots.filter((x) => x.sku === p.sku && x.qty > 0).map((x) => x.place))];
    if (!at.length) { out.push({ p, place: '', placeName: '', bins: [], binned: 0 }); return; }
    at.forEach((pl) => {
      const bins = binsFor(pl, p.sku, data);
      out.push({ p, place: pl, placeName: (places.find((x) => x.id === pl) || {}).name || pl, bins, binned: qtyOf(bins) });
    });
  });
  return out;
}

// ---- changes -----------------------------------------------------------------------------------------
const fail = (error, extra) => ({ ok: false, error, ...extra });
const whole = (v) => Math.floor(Number(v) || 0);

/** Add or change a rack. Checks the code, the size and that no bin with stock is lost or overfilled. */
export function saveRack(input) {
  const data = read();
  const code = String(input.code || '').trim().toUpperCase();
  const shelves = whole(input.shelves), bins = whole(input.bins), capacity = whole(input.capacity);
  if (!input.place) return fail('Choose a place.');
  if (!/^[A-Z0-9]{1,3}$/.test(code)) return fail('Use 1 to 3 letters or numbers for the rack code, for example A.', { field: 'code' });
  if (data.racks.some((r) => r.place === input.place && r.code === code && r.id !== input.id)) return fail(`Rack ${code} already exists here.`, { field: 'code' });
  if (shelves < 1 || shelves > 12) return fail('A rack has 1 to 12 shelves.', { field: 'shelves' });
  if (bins < 1 || bins > 30) return fail('A shelf has 1 to 30 bins.', { field: 'bins' });
  if (capacity < 1) return fail('Enter how many pieces one bin holds.', { field: 'capacity' });
  const before = input.id ? data.racks.find((r) => r.id === input.id) : null;
  if (before) {
    const mine = data.slots.filter((x) => x.rack === before.id && x.qty > 0);
    const cut = [...new Set(mine.filter((x) => x.shelf > shelves || x.bin > bins).map((x) => binCode(before, x.shelf, x.bin)))];
    if (cut.length) return fail(`Empty ${cut.join(', ')} first: ${cut.length === 1 ? 'that bin' : 'those bins'} would be removed.`, { field: 'shelves', bins: cut });
    const over = [];
    const seen = {};
    mine.forEach((x) => { const k = x.shelf + '-' + x.bin; seen[k] = (seen[k] || 0) + x.qty; });
    Object.entries(seen).forEach(([k, q]) => { if (q > capacity) { const [s, b] = k.split('-'); over.push(`${binCode(before, s, b)} has ${q}`); } });
    if (over.length) return fail(`Some bins hold more than ${capacity}: ${over.join(', ')}.`, { field: 'capacity' });
  }
  const rack = { id: before ? before.id : 'RK-' + Date.now().toString(36), place: input.place, code, name: String(input.name || '').trim(), shelves, bins, capacity };
  const racks = before ? data.racks.map((r) => (r.id === rack.id ? rack : r)) : [...data.racks, rack];
  const next = { ...data, racks };
  write(next);
  return { ok: true, rack, data: next };
}
/** Remove an empty rack. With stock in it, says which bins to empty. */
export function removeRack(id) {
  const data = read();
  const rack = data.racks.find((r) => r.id === id);
  if (!rack) return fail('Rack not found.');
  const full = binsWithStock(rack, data);
  if (full.length) return fail(`Rack ${rack.code} still holds stock in ${full.map((b) => `${b.code} (${b.qty})`).join(', ')}. Move or take it out first.`, { bins: full });
  const next = { racks: data.racks.filter((r) => r.id !== id), slots: data.slots.filter((x) => x.rack !== id) };
  write(next);
  return { ok: true, data: next };
}
/** Bins of a rack that hold stock: [{ code, qty }]. */
export function binsWithStock(rack, data = getRackData()) {
  const seen = {};
  data.slots.filter((x) => x.rack === rack.id && x.qty > 0).forEach((x) => { const c = binCode(rack, x.shelf, x.bin); seen[c] = (seen[c] || 0) + x.qty; });
  return Object.entries(seen).map(([code, qty]) => ({ code, qty })).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
}

/** Room left in a bin. */
export const roomIn = (rack, shelf, bin, data = getRackData()) => rack.capacity - binUsed(rack.id, shelf, bin, data);
/** Pieces of a product at a place that are not in a bin yet (on hand − in bins; never below 0). */
export const unbinnedAt = (place, sku, data = getRackData()) => Math.max(0, onHandAt(place, sku) - binnedAt(place, sku, data));

/** Put a product into a bin: { rack (id), shelf, bin, sku, qty }. Checks on hand and capacity. */
export function putAway({ rack: rackId, shelf, bin, sku, qty }) {
  const data = read();
  const rack = data.racks.find((r) => r.id === rackId);
  const p = productBy(sku);
  const q = whole(qty);
  if (!rack) return fail('Choose a bin.');
  if (!p) return fail('Choose a product.', { field: 'sku' });
  if (q < 1) return fail('Enter how many pieces.', { field: 'qty' });
  shelf = whole(shelf); bin = whole(bin);
  if (shelf < 1 || shelf > rack.shelves || bin < 1 || bin > rack.bins) return fail('That bin is not on this rack.');
  const code = binCode(rack, shelf, bin);
  const onHand = onHandAt(rack.place, p.sku), inBins = binnedAt(rack.place, p.sku, data);
  if (inBins + q > onHand) return fail(`Only ${Math.max(0, onHand - inBins)} of ${p.name} are not in a bin yet (${onHand} on hand, ${inBins} already in bins).`, { field: 'qty' });
  const room = roomIn(rack, shelf, bin, data);
  if (q > room) return fail(`${code} has room for ${Math.max(0, room)} more (holds ${rack.capacity}).`, { field: 'qty' });
  const at = data.slots.findIndex((x) => x.rack === rack.id && x.shelf === shelf && x.bin === bin && x.sku === p.sku);
  const slots = data.slots.slice();
  if (at >= 0) slots[at] = { ...slots[at], qty: slots[at].qty + q };
  else slots.push({ id: 'SL-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), place: rack.place, rack: rack.id, shelf, bin, sku: p.sku, qty: q });
  const next = { ...data, slots };
  write(next);
  return { ok: true, data: next, code, product: p, qty: q };
}
/** Take pieces out of a bin (picked, sold or counted short). */
export function takeOut(slotId, qty) {
  const data = read();
  const s = data.slots.find((x) => x.id === slotId);
  const q = whole(qty);
  if (!s) return fail('Not found.');
  if (q < 1 || q > s.qty) return fail(`Enter 1 to ${s.qty}.`, { field: 'qty' });
  const slots = data.slots.map((x) => (x.id === slotId ? { ...x, qty: x.qty - q } : x)).filter((x) => x.qty > 0);
  const next = { ...data, slots };
  write(next);
  return { ok: true, data: next };
}
/** Move pieces from one bin to another at the same place: { slot (id), rack (id), shelf, bin, qty }. */
export function moveBetweenBins({ slot: slotId, rack: rackId, shelf, bin, qty }) {
  const data = read();
  const s = data.slots.find((x) => x.id === slotId);
  const rack = data.racks.find((r) => r.id === rackId);
  const q = whole(qty);
  shelf = whole(shelf); bin = whole(bin);
  if (!s) return fail('Not found.');
  if (!rack || rack.place !== s.place) return fail('Choose a bin at the same place.', { field: 'to' });
  if (rack.id === s.rack && shelf === s.shelf && bin === s.bin) return fail('Choose a different bin.', { field: 'to' });
  if (q < 1 || q > s.qty) return fail(`Enter 1 to ${s.qty}.`, { field: 'qty' });
  const code = binCode(rack, shelf, bin);
  const room = roomIn(rack, shelf, bin, data);
  if (q > room) return fail(`${code} has room for ${Math.max(0, room)} more (holds ${rack.capacity}).`, { field: 'qty' });
  let slots = data.slots.map((x) => (x.id === slotId ? { ...x, qty: x.qty - q } : x));
  const at = slots.findIndex((x) => x.rack === rack.id && x.shelf === shelf && x.bin === bin && x.sku === s.sku);
  if (at >= 0) slots[at] = { ...slots[at], qty: slots[at].qty + q };
  else slots.push({ id: 'SL-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), place: s.place, rack: rack.id, shelf, bin, sku: s.sku, qty: q });
  slots = slots.filter((x) => x.qty > 0);
  const next = { ...data, slots };
  write(next);
  return { ok: true, data: next, code };
}
