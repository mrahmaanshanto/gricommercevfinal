// serials — the register of serial and IMEI numbers: one row per tracked unit, with its state.
//   in stock   on the shelf at `place`, can be sold
//   sold       sold on `saleId` (the POS register binds it to the sale line)
//   returned   came back on a return (Return & exchange or a voided offline sale)
// Which products are tracked: a product flagged IMEI or Serial in Products (flags), plus the demo phone below.
// The POS register asks for the number when a tracked product is added, checks it is not sold already and
// marks it sold when the sale completes. Inventory screens may read the register (getSerials, serialsAt).
// Front end only: the demo units below plus every change made in this browser (gc.serials). A real backend
// would lock a unit for one sale at a time; here the check runs again when the sale is saved or synced.

import { productBy } from './stock';
import { allProducts } from './products';   // read at run time only

const KEY = 'gc.serials';
export const SERIAL_STATES = { stock: 'In stock', sold: 'Sold', returned: 'Returned' };

/** Products the catalogue knows as tracked even without a flag (the demo phone of the POS). */
const TRACKED = { 'EL-PHN-128': 'imei' };

// ---- IMEI check digit (Luhn) ----------------------------------------------------------------------
const luhnDigit = (body) => {
  let sum = 0;
  String(body).split('').reverse().forEach((d, i) => { let n = Number(d); if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; } sum += n; });
  return String((10 - (sum % 10)) % 10);
};
/** A valid IMEI is 15 digits with a correct last (Luhn) digit. */
export const isImei = (s) => /^\d{15}$/.test(s) && luhnDigit(s.slice(0, 14)) === s[14];
const imei = (body14) => body14 + luhnDigit(body14);

// ---- demo units -----------------------------------------------------------------------------------
const at = (d, h, m) => new Date(2026, 8, d, h, m).getTime();
const unit = (serial, sku, product, kind, place, extra = {}) => ({ serial, sku, product, kind, place, state: 'stock', at: at(20, 10, 0), ...extra });
function seed() {
  const out = [];
  const PH = 'Budget Android Phone 6/128';
  [['Dhanmondi branch', '35867411020', 6], ['Mirpur branch', '35867411030', 3], ['Central Warehouse', '35867411040', 5]].forEach(([place, base, n]) => {
    for (let i = 1; i <= n; i += 1) out.push(unit(imei(base + String(i).padStart(3, '0')), 'EL-PHN-128', PH, 'imei', place));
  });
  [['PH-5GP-256-BK', 'Phantom Black / 256 GB', '3542871200'], ['PH-5GP-256-SV', 'Silver / 256 GB', '3542871201'], ['PH-5GP-256-BL', 'Ocean Blue / 256 GB', '3542871202'], ['PH-5GP-512-BK', 'Phantom Black / 512 GB', '3542871203']].forEach(([sku, v, base]) => {
    for (let i = 1; i <= 4; i += 1) out.push(unit(imei(base + String(i).padStart(4, '0')), sku, '5G Smartphone Pro 256GB · ' + v, 'imei', 'Central Warehouse'));
  });
  [['Dhanmondi branch', 'SMX-EP-24A0', 5], ['Mirpur branch', 'SMX-EP-24B0', 3], ['Central Warehouse', 'SMX-EP-24C0', 6]].forEach(([place, base, n]) => {
    for (let i = 1; i <= n; i += 1) out.push(unit(base + String(i).padStart(3, '0'), 'EL-EAR-PRO', 'Wireless Earbuds Pro', 'serial', place));
  });
  // one phone already sold and one earbuds returned, so the checks have something to find
  out.push(unit(imei('35867411020900'), 'EL-PHN-128', PH, 'imei', 'Dhanmondi branch', { state: 'sold', saleId: 'ORD-20260928-0014', soldAt: at(28, 15, 12), customer: 'Karim Saheb' }));
  out.push(unit('SMX-EP-24A0900', 'EL-EAR-PRO', 'Wireless Earbuds Pro', 'serial', 'Dhanmondi branch', { state: 'returned', saleId: 'ORD-20260921-0007', soldAt: at(21, 12, 40), returnedAt: at(24, 11, 5) }));
  return out;
}
const SEED = seed();

const read = () => { try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent('gc:serials')); } catch { /* ignore */ } };
const norm = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

/** Every tracked unit (demo units plus this browser's changes). */
export const getSerials = () => (typeof window === 'undefined' ? SEED : read());
/** One unit by its number, or null. */
export const serialBy = (serial) => getSerials().find((x) => x.serial === norm(serial)) || null;
/** Units of one product that can be sold at a place (in stock or back from a return). */
export const serialsAt = (sku, place) => getSerials().filter((x) => x.sku === sku && x.place === place && x.state !== 'sold');

/** 'imei' | 'serial' | '' — whether a product (SKU, name or barcode) asks for a number at the sale. */
export function trackingOf(key) {
  const c = productBy(key);
  if (!c) return '';
  if (TRACKED[c.sku]) return TRACKED[c.sku];
  let p = null;
  try { p = allProducts().find((x) => (c.productId && x.id === c.productId) || (x.sku && x.sku === c.sku)) || null; } catch { p = null; }
  const flags = (p && p.flags) || [];
  if (flags.includes('IMEI')) return 'imei';
  if (flags.includes('Serial')) return 'serial';
  // a unit already in the register tells us the product is tracked
  const u = getSerials().find((x) => x.sku === c.sku);
  return u ? u.kind : '';
}

/**
 * Check a number before it goes on a sale line. `taken` = numbers already in this sale.
 * Returns { ok, serial, error?, warn?, unit? }. Unknown numbers are allowed (the unit was never registered).
 */
export function checkSerial(raw, { sku, kind, place, taken = [], units = getSerials() } = {}) {
  const serial = norm(raw);
  if (!serial) return { ok: false, serial, error: kind === 'imei' ? 'Scan or type the IMEI.' : 'Scan or type the serial number.' };
  if (kind === 'imei' && !/^\d{15}$/.test(serial)) return { ok: false, serial, error: 'An IMEI has 15 digits.' };
  if (kind === 'imei' && !isImei(serial)) return { ok: false, serial, error: 'This IMEI is not valid. Check the last digit.' };
  if (kind !== 'imei' && serial.length < 4) return { ok: false, serial, error: 'A serial number has at least 4 characters.' };
  if (taken.map(norm).includes(serial)) return { ok: false, serial, error: 'Already in this sale.' };
  const u = units.find((x) => x.serial === serial);
  if (!u) return { ok: true, serial, warn: 'Not in the serial list. It will be added as sold.' };
  if (u.sku !== sku) return { ok: false, serial, unit: u, error: `This number belongs to ${u.product}.` };
  if (u.state === 'sold') return { ok: false, serial, unit: u, error: `Already sold on ${u.saleId}.` };
  if (place && u.place !== place) return { ok: true, serial, unit: u, warn: `Listed at ${u.place}.` };
  return { ok: true, serial, unit: u };
}

/** Mark a sale's numbers sold. Safe to call twice for the same sale. Returns the numbers that were already
 *  sold on another sale (a conflict), so the caller can report them. */
export function sellSerials(sale) {
  const list = read().slice();
  const clash = [];
  (sale.lines || []).forEach((l) => (l.serials || []).forEach((raw) => {
    const serial = norm(raw);
    const i = list.findIndex((x) => x.serial === serial);
    const row = { state: 'sold', saleId: sale.id, soldAt: sale.at, customer: (sale.customer && sale.customer.name) || 'Walk-in customer', place: sale.place, by: sale.cashier };
    if (i < 0) { list.unshift({ serial, sku: l.sku, product: l.name, kind: /^\d{15}$/.test(serial) ? 'imei' : 'serial', at: Date.now(), added: 'At the sale', ...row }); return; }
    if (list[i].state === 'sold' && list[i].saleId === sale.id) return;   // already done
    if (list[i].state === 'sold') clash.push({ serial, saleId: list[i].saleId });
    list[i] = { ...list[i], ...row, ...(list[i].state === 'sold' ? { clash: list[i].saleId } : {}) };
  }));
  write(list);
  return clash;
}
/** Units of one sale that are sold now (used by the offline sync to find a number sold meanwhile). */
export const soldElsewhere = (serial, saleId) => { const u = serialBy(serial); return u && u.state === 'sold' && u.saleId !== saleId ? u : null; };

/** A unit came back (a return, or a voided sale): it can be sold again at `place`. */
export function returnSerial(serial, { ref = '', place } = {}) {
  const s = norm(serial);
  write(read().map((x) => (x.serial === s ? { ...x, state: 'returned', returnedAt: Date.now(), returnRef: ref, ...(place ? { place } : {}) } : x)));
}
