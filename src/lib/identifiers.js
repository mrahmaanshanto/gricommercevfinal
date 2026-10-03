// identifiers — every code a product can be found by, and the one function every scan goes through (Nayeem's
// Product brief #1 › 1.3A "Retail-grade identifier and scan model", 1.3B "Barcode must understand Unit & Packaging").
//
//   A product keeps its SKU and main barcode (GTIN or an in-store code), plus `ids`: [{ type, value, variant, pack }]
//     type     one of ID_TYPES below
//     variant  the variant's SKU when the code belongs to one variant ('' = the product)
//     pack     a pack id from the product's packs (units.js) when the code is printed on a box / carton
//   Pack barcodes typed on a pack (units.js packs[].barcode) count as identifiers too.
//
//   resolveScan(code) → { code, type, sku, row, productId, variant, pack, qty, weight, serial } or null
//     sku / row   the stock-catalogue row (stock.js getCatalog) the code belongs to
//     pack        { id, name, qty } when a pack was scanned; qty is then pack.qty base units
//     weight      kg read from a shop-scale label (scaleBarcode.js › decodeScale, or a product's own scale code)
//     serial      the serial / IMEI when a unit's own number was scanned (serialTrace.js)
//   validateId(type, value) → '' or what is wrong · idOwner(value, ownId) → who else uses it
// The screens that scan (stock count, transfers, adjustments, labels, the stock list search) call resolveScan; stock.js
// › productBy also finds a row by any of these codes, so every other lookup sees them too.

import { getCatalog } from './stock';
import { packsOf } from './units';
import { findUnit } from './serialTrace';
import { decodeScale } from './scaleBarcode';

export const ID_TYPES = [
  { k: 'gtin', label: 'GTIN / EAN / UPC', hint: 'Printed by the maker. Sent to Google.' },
  { k: 'alt', label: 'Other barcode', hint: 'Old packaging or a second code. Scans as the same item.' },
  { k: 'supplier', label: 'Supplier code', hint: 'The supplier’s own code, for receiving.' },
  { k: 'pack', label: 'Pack barcode', hint: 'On a box or carton. Scans as the whole pack.' },
  { k: 'plu', label: 'PLU', hint: '4–5 digits for loose goods.' },
  { k: 'scale', label: 'Scale code', hint: 'The item code inside a scale label.' },
  { k: 'mpn', label: 'MPN', hint: 'Maker’s part number. Search and Google only.' },
  { k: 'isbn', label: 'ISBN', hint: 'Books. 10 or 13 digits.' },
];
const OTHER = { sku: 'SKU', barcode: 'Barcode', serial: 'Serial / IMEI' };
export const idLabel = (k) => (ID_TYPES.find((t) => t.k === k) || { label: OTHER[k] || k }).label;
/** Types a till can scan (MPN is for search and feeds only). */
const SCANNABLE = { gtin: 1, alt: 1, supplier: 1, pack: 1, plu: 1, scale: 1, isbn: 1 };

const norm = (v) => String(v == null ? '' : v).replace(/\s+/g, '').toLowerCase();

export function gtinOk(code) {
  const d = String(code || '').trim();
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(d)) return false;
  let sum = 0; const n = d.length;
  for (let i = 0; i < n - 1; i++) sum += Number(d[n - 2 - i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(d[n - 1]);
}
function isbnOk(v) {
  const d = String(v || '').replace(/[-\s]/g, '').toUpperCase();
  if (/^\d{13}$/.test(d)) return gtinOk(d) && /^97[89]/.test(d);
  if (!/^\d{9}[\dX]$/.test(d)) return false;
  let s = 0; for (let i = 0; i < 10; i++) s += (d[i] === 'X' ? 10 : Number(d[i])) * (10 - i);
  return s % 11 === 0;
}
/** '' when the value fits its type, else what is wrong. */
export function validateId(type, value) {
  const v = String(value || '').trim();
  if (!v) return 'Enter the code.';
  if (type === 'gtin' && !gtinOk(v)) return 'Not a valid GTIN. Check the digits, or save it as Other barcode.';
  if (type === 'isbn' && !isbnOk(v)) return 'Not a valid ISBN.';
  if (type === 'plu' && !/^\d{4,5}$/.test(v)) return 'A PLU is 4 or 5 digits.';
  if (type === 'scale' && !/^\d{5}$/.test(v)) return 'A scale code is 5 digits.';
  if (v.length > 40) return 'Keep the code under 40 characters.';
  return '';
}

/** Every identifier of a product record (its ids plus pack barcodes), as [{ type, value, variant, pack }]. */
export function idsOf(p) {
  if (!p) return [];
  const own = (Array.isArray(p.ids) ? p.ids : []).filter((x) => x && x.value).map((x) => ({ type: x.type || 'alt', value: String(x.value).trim(), variant: x.variant || '', pack: x.pack || '' }));
  const packs = packsOf(p).filter((k) => k.barcode).map((k) => ({ type: 'pack', value: k.barcode, variant: '', pack: k.id }));
  return own.concat(packs.filter((k) => !own.some((o) => norm(o.value) === norm(k.value))));
}
/** The lower-case codes a catalogue row can be found by (stock.js keeps them on the row as `codes`). */
export const codesFor = (ids) => ids.filter((x) => SCANNABLE[x.type] || x.type === 'mpn').map((x) => norm(x.value));

/** Who else uses this code (main SKU / barcode, identifiers, pack barcodes)? { name } or null. */
export function idOwner(value, ownId, catalog = getCatalog()) {
  const k = norm(value);
  if (!k) return null;
  for (const r of catalog) {
    if (ownId && (r.productId === ownId || r.sku === ownId)) continue;
    if (norm(r.sku) === k || norm(r.barcode) === k || (r.codes || []).includes(k)) return { name: r.name, sku: r.sku };
  }
  const u = findUnit(value);
  if (u) return { name: u.name + ' (serial)', sku: u.sku };
  return null;
}

const hit = (code, type, row, extra) => ({ code: String(code).trim(), type, sku: row.sku, row, productId: row.productId || '', variant: row.variant || '', pack: null, qty: 1, weight: null, serial: '', ...(extra || {}) });

/**
 * One scan → one item. Order: the SKU or main barcode, a pack barcode, any other identifier, a scale label, a PLU
 * typed by hand, a serial / IMEI. Returns null when nothing matches.
 */
export function resolveScan(code, catalog = getCatalog()) {
  const raw = String(code == null ? '' : code).trim();
  const k = norm(raw);
  if (!k) return null;
  // 1. the SKU or the main barcode of a product or variant
  let row = catalog.find((r) => norm(r.sku) === k || (r.barcode && norm(r.barcode) === k));
  if (row) return hit(raw, norm(row.sku) === k ? 'sku' : 'barcode', row);
  // 2. a pack barcode, then 3. any other identifier
  for (const r of catalog) {
    const pk = packsOf(r).find((x) => x.barcode && norm(x.barcode) === k);
    if (pk) return hit(raw, 'pack', r, { pack: { id: pk.id, name: pk.name, qty: pk.qty }, qty: pk.qty });
  }
  for (const r of catalog) {
    const id = (r.ids || []).find((x) => SCANNABLE[x.type] && norm(x.value) === k);
    if (!id) continue;
    if (id.pack) { const pk = packsOf(r).find((x) => x.id === id.pack); if (pk) return hit(raw, id.type, r, { pack: { id: pk.id, name: pk.name, qty: pk.qty }, qty: pk.qty }); }
    return hit(raw, id.type, r);
  }
  // 4. a scale label (scaleBarcode.js: 2 T PPPPP VVVVV C, weight or price) — the register reads the same labels
  const sc = decodeScale(raw);
  if (sc && sc.ok) { const r = catalog.find((x) => x.sku === sc.sku); if (r) return hit(raw, 'scale', r, { qty: sc.kg, weight: sc.kg, price: sc.price }); }
  if (/^\d{13}$/.test(raw) && raw[0] === '2') {
    const item = raw.slice(2, 7), r = catalog.find((x) => (x.ids || []).some((i) => (i.type === 'scale' || i.type === 'plu') && String(i.value).padStart(5, '0') === item));
    if (r) { const kg = Number(raw.slice(7, 12)) / 1000; return hit(raw, 'scale', r, { qty: kg, weight: kg }); }
  }
  // 5. a PLU typed at the till
  if (/^\d{4,5}$/.test(raw)) {
    const r = catalog.find((x) => (x.ids || []).some((i) => i.type === 'plu' && String(i.value) === raw));
    if (r) return hit(raw, 'plu', r);
  }
  // 6. one unit's own serial number or IMEI
  const u = findUnit(raw);
  if (u) { row = catalog.find((r) => r.sku === u.sku); if (row) return hit(raw, 'serial', row, { serial: u.code }); }
  // 7. MPN (search only)
  row = catalog.find((r) => (r.ids || []).some((x) => x.type === 'mpn' && norm(x.value) === k));
  if (row) return hit(raw, 'mpn', row);
  return null;
}
/** A short line for what a scan found: "Carton of 48 → 48 pcs", "0.846 kg", "IMEI 3567…". */
export function scanLine(r) {
  if (!r) return '';
  if (r.pack) return r.pack.name + ' → ' + r.qty;
  if (r.weight != null) return r.weight + ' kg';
  if (r.serial) return (/^\d{15}$/.test(r.serial) ? 'IMEI ' : 'Serial ') + r.serial;
  return idLabel(r.type);
}
