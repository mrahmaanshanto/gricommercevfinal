// units — units & packaging (Nayeem's Product brief #1 › 1.3 / 1.3B, Inventory brief #2 › "The ledger must always
// normalise to a base unit").
//
//   A product has one base unit (piece, kg, litre …) and any number of packs: { id, name, qty, barcode }, where qty is
//   how many base units one pack holds ("Box of 12" = 12 pieces, "Carton of 48" = 48 pieces). Stock is always kept in
//   base units: a stock move of 3 cartons of 48 is stored as qty 144 with the pack it was entered in (pack, packs), so
//   a later change to the pack size never changes old quantities.
//
//   unitOf(key)            the unit's definition (accepts old labels such as 'Piece', 'Box', 'kg')
//   packsOf(row)           the packs of a catalogue row or a product (demo packs for catalogue-only items)
//   toBase(row, n, packId) n packs (or n base units when packId is empty) as base units
//   fmtQty(row, base)      "3 cartons + 4 pcs" / "1.25 kg"
//   roundQty(row, q)       whole numbers for counted units, 3 decimals for weight / volume / length
// Front end only: packs are stored on the product (products.js); catalogue-only demo items use DEMO_PACKS below.

export const UNITS = [
  { k: 'pc', label: 'Piece', short: 'pcs', one: 'pc', frac: false },
  { k: 'pair', label: 'Pair', short: 'pairs', one: 'pair', frac: false },
  { k: 'dozen', label: 'Dozen', short: 'dozen', one: 'dozen', frac: false },
  { k: 'packet', label: 'Packet', short: 'packets', one: 'packet', frac: false },
  { k: 'box', label: 'Box', short: 'boxes', one: 'box', frac: false },
  { k: 'kg', label: 'kg', short: 'kg', one: 'kg', frac: true },
  { k: 'g', label: 'Gram', short: 'g', one: 'g', frac: true },
  { k: 'l', label: 'Litre', short: 'L', one: 'L', frac: true },
  { k: 'ml', label: 'ml', short: 'ml', one: 'ml', frac: true },
  { k: 'm', label: 'Metre', short: 'm', one: 'm', frac: true },
  { k: 'yd', label: 'Yard', short: 'yd', one: 'yd', frac: true },
  { k: 'sqft', label: 'Square foot', short: 'sq ft', one: 'sq ft', frac: true },
];
const OLD = { piece: 'pc', pieces: 'pc', pcs: 'pc', box: 'box', pack: 'packet', kg: 'kg', litre: 'l', liter: 'l', gram: 'g' };
export const unitOf = (key) => {
  const k = String(key || 'pc').trim();
  return UNITS.find((u) => u.k === k || u.label.toLowerCase() === k.toLowerCase()) || UNITS.find((u) => u.k === OLD[k.toLowerCase()]) || UNITS[0];
};

// Packs of stock-catalogue items that have no product record of their own (stock.js CATALOG). A product's own
// packs (product.packs) always win.
export const DEMO_PACKS = {
  'GR-RICE-5': [{ id: 'bale10', name: 'Bale of 10', qty: 10, barcode: '18941100100018' }],
  'GR-SOY-2': [{ id: 'ctn12', name: 'Carton of 12', qty: 12, barcode: '18941100100032' }],
  'GR-ATTA-2': [{ id: 'bag20', name: 'Sack of 20', qty: 20, barcode: '18941100100056' }],
  'SK-SUN-50': [{ id: 'box12', name: 'Box of 12', qty: 12, barcode: '18941300300021' }, { id: 'ctn48', name: 'Carton of 48', qty: 48, barcode: '28941300300028' }],
  'SK-SHA-340': [{ id: 'ctn24', name: 'Carton of 24', qty: 24, barcode: '18941300300014' }],
  'HM-BTL-750': [{ id: 'ctn24', name: 'Carton of 24', qty: 24, barcode: '18941500500016' }],
  'EL-EAR-PRO': [{ id: 'ctn20', name: 'Carton of 20', qty: 20, barcode: '18941400400022' }],
};

const clean = (list) => (Array.isArray(list) ? list : []).filter((x) => x && x.name && Number(x.qty) > 0).map((x, i) => ({ id: x.id || 'pk' + (i + 1), name: String(x.name), qty: Number(x.qty), barcode: x.barcode ? String(x.barcode) : '' }));

/** The packs of a catalogue row or a product record, largest first. */
export function packsOf(row) {
  if (!row) return [];
  // a product that has its own pack list (even an empty one) uses it; other items use the demo packs
  const list = Array.isArray(row.packs) ? clean(row.packs) : clean(DEMO_PACKS[row.sku]);
  return list.sort((a, b) => b.qty - a.qty);
}
export const packBy = (row, id) => packsOf(row).find((p) => p.id === id) || null;

export const isFractional = (row) => unitOf(row && row.unit).frac;
/** Whole numbers for counted units, up to 3 decimals for weight, volume and length. */
export const roundQty = (row, q) => {
  const n = Number(q) || 0;
  return isFractional(row) ? Math.round(n * 1000) / 1000 : Math.round(n);
};

/** n of a pack (or of the base unit when packId is empty) as base units. */
export function toBase(row, n, packId) {
  const p = packId ? packBy(row, packId) : null;
  return roundQty(row, (Number(n) || 0) * (p ? p.qty : 1));
}

const plural = (name, n) => {
  const w = String(name).split(' ')[0].toLowerCase();
  if (n === 1) return w;
  return /(x|s|ch|sh)$/.test(w) ? w + 'es' : w + 's';
};
/** A base quantity written with the packs: "3 cartons + 4 pcs". Weight and volume: "1.25 kg". */
export function fmtQty(row, base) {
  const u = unitOf(row && row.unit);
  const n = Number(base) || 0;
  if (u.frac) return roundQty(row, n) + ' ' + u.short;
  const packs = packsOf(row);
  if (!packs.length || Math.abs(n) < packs[packs.length - 1].qty) return n + ' ' + (Math.abs(n) === 1 ? u.one : u.short);
  let left = Math.abs(n);
  const parts = [];
  packs.forEach((p) => { const k = Math.floor(left / p.qty); if (k > 0) { parts.push(k + ' ' + plural(p.name, k)); left -= k * p.qty; } });
  if (left) parts.push(left + ' ' + (left === 1 ? u.one : u.short));
  return (n < 0 ? '−' : '') + parts.join(' + ');
}
/** "Box of 12 = 12 pcs" for a pack. */
export const packLine = (row, p) => p.name + ' = ' + p.qty + ' ' + unitOf(row && row.unit).short;
