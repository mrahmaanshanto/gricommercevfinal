// bundles — products made of other products (Nayeem's Product brief #1 › 1.5 and Inventory brief #2 › "Kitting &
// Bundles"):
//   virtual bundle  a combo offer with no stock of its own. What can be sold is worked out from its parts (stock.js ›
//                   stockAt), and selling one moves the parts (stock.js › addMove).
//   kit             a pack assembled in the warehouse (a gift hamper). Assembling takes the parts out of stock and puts
//                   finished kits in; taking kits apart does the reverse. Both are stock moves ('assemble' /
//                   'disassemble') with one operation key per run, so a repeated tap does nothing.
//   bundleOf(sku)            { type, parts: [{ sku, qty, row, name, available }] } or null
//   canAssemble(sku, place)  how many kits the parts at the place allow
//   assembleKit(sku, place, n, by) / disassembleKit(sku, place, n, by) → { ok, error, ref }

import { productBy, stockAt, addMove } from './stock';

export const BUNDLE_TYPES = { virtual: 'Combo (from parts)', kit: 'Kit (assembled)' };

export function bundleOf(sku, place = '') {
  const row = productBy(sku);
  if (!row || !row.bundle) return null;
  return {
    type: row.bundle.type === 'kit' ? 'kit' : 'virtual', row,
    parts: row.bundle.parts.map((pt) => { const r = productBy(pt.sku); return { sku: pt.sku, qty: Math.max(1, Number(pt.qty) || 1), row: r, name: r ? r.name : pt.sku, available: r ? stockAt(r.sku, place).available : 0 }; }),
  };
}
/** How many kits the parts at a place allow. */
export function canAssemble(sku, place) {
  const b = bundleOf(sku, place);
  if (!b || !b.parts.length) return 0;
  return Math.max(0, Math.min(...b.parts.map((p) => Math.floor(p.available / p.qty))));
}
let runs = 0;
const refOf = () => 'KIT-' + Date.now().toString(36).toUpperCase() + (runs++ % 36).toString(36).toUpperCase();

/** Assemble n kits at a place: the parts go out, the kits come in. */
export function assembleKit(sku, place, n, by = 'Staff') {
  const b = bundleOf(sku, place);
  const k = Math.max(0, Math.round(Number(n) || 0));
  if (!b || b.type !== 'kit') return { ok: false, error: 'This product is not a kit.' };
  if (!k) return { ok: false, error: 'Enter how many to assemble.' };
  const short = b.parts.find((p) => p.available < p.qty * k);
  if (short) return { ok: false, error: 'Not enough ' + short.name + ' at ' + place + ': ' + short.available + ' free, ' + short.qty * k + ' needed.' };
  const ref = refOf();
  b.parts.forEach((p) => addMove({ sku: p.sku, place, qty: -p.qty * k, kind: 'assemble', reason: 'Used in ' + k + ' × ' + b.row.name, by, ref, op: ref + ':' + p.sku }));
  addMove({ sku: b.row.sku, place, qty: k, kind: 'assemble', reason: 'Assembled from parts', by, ref, op: ref + ':' + b.row.sku });
  return { ok: true, ref };
}
/** Take n kits apart at a place: the kits go out, the parts come back. */
export function disassembleKit(sku, place, n, by = 'Staff') {
  const b = bundleOf(sku, place);
  const k = Math.max(0, Math.round(Number(n) || 0));
  if (!b || b.type !== 'kit') return { ok: false, error: 'This product is not a kit.' };
  const have = stockAt(b.row.sku, place).available;
  if (!k || k > have) return { ok: false, error: 'Only ' + have + ' free at ' + place + '.' };
  const ref = refOf();
  addMove({ sku: b.row.sku, place, qty: -k, kind: 'disassemble', reason: 'Taken apart', by, ref, op: ref + ':' + b.row.sku });
  b.parts.forEach((p) => addMove({ sku: p.sku, place, qty: p.qty * k, kind: 'disassemble', reason: 'From ' + k + ' × ' + b.row.name, by, ref, op: ref + ':' + p.sku }));
  return { ok: true, ref };
}
