// stock — the product catalogue with stock per place, and the numbers every screen shows:
//   on hand   what is physically there (base count + recorded stock moves)
//   held      set aside for an order (stock holds)
//   damaged   set aside, not for sale
//   available on hand − held − damaged
//   in transit on its way to the place (transfers not yet received)
// Damaged stock sits in the 'Returns & damaged' bay (DAMAGED_PLACE): a damaged hold has left the
// shelf it came from (hold.from) and counts as on hand, damaged and never available in the bay.
// Front end only: base counts are demo data; moves (adjustments, receipts, transfers) are kept in this browser.

import { getHolds } from './stockHolds';
import { getTransfers, inTransit } from './transfers';
import { STOCK_PLACES, DAMAGED_PLACE, namesOf, getPlaces } from './locations';

const MOVES = 'gc.stock.moves';
// sku, name, variant, barcode, category, retail price, wholesale price, MOQ for wholesale, sold to, on hand by place, in transit by place
const P = (sku, name, variant, barcode, cat, price, wholesale, moq, sell, on, transit) => ({ sku, name, variant, barcode, cat, price, wholesale, moq, sell, on, transit: transit || {} });
export const CATALOG = [
  P('GR-RICE-5', 'Premium Miniket Rice 5kg', 'Sack · 5kg', '8941100100011', 'Grocery', 780, 700, 10, 'both', { 'Central Warehouse': 300, 'Chattogram hub': 80, 'Dhanmondi branch': 60, 'Mirpur branch': 40, 'Gulshan-1 branch': 20 }),
  P('GR-DAL-1', 'Chickpeas Boot Dal 1kg', 'Loose · 1kg', '8941100100028', 'Grocery', 165, 148, 20, 'both', { 'Central Warehouse': 200, 'Dhanmondi branch': 34, 'Mirpur branch': 30 }),
  P('GR-SOY-2', 'Soybean Cooking Oil 2L', 'Bottle · 2L', '8941100100035', 'Grocery', 390, 355, 12, 'both', { 'Central Warehouse': 150, 'Dhanmondi branch': 24, 'Mirpur branch': 30, 'Gulshan-1 branch': 12 }, { 'Dhanmondi branch': 12 }),
  P('GR-MUS-1', 'Mustard Oil 1L Pure Ghani', 'Bottle · 1L', '8941100100042', 'Grocery', 320, 290, 12, 'retail', { 'Central Warehouse': 60, 'Dhanmondi branch': 14, 'Mirpur branch': 12 }),
  P('GR-ATTA-2', 'Atta Wheat Flour 2kg', 'Pack · 2kg', '8941100100059', 'Grocery', 145, 130, 20, 'both', { 'Central Warehouse': 180, 'Dhanmondi branch': 40, 'Mirpur branch': 33 }),
  P('CL-TEE-BM', 'Premium Cotton Oversized T-Shirt', 'Black · M', '8941200200016', 'Clothing', 1240, 1050, 6, 'both', { 'Central Warehouse': 120, 'Dhanmondi branch': 22, 'Mirpur branch': 20, 'Gulshan-1 branch': 8 }, { 'Gulshan-1 branch': 10 }),
  P('CL-LEG-CL', 'Compression Leggings', 'Charcoal · L', '8941200200023', 'Clothing', 1850, 1600, 6, 'retail', { 'Central Warehouse': 30, 'Dhanmondi branch': 6 }),
  P('CL-SNK-42', 'Classic White Sneakers', 'White · 42', '8941200200030', 'Clothing', 3450, 3000, 4, 'retail', { 'Central Warehouse': 12 }, { 'Dhanmondi branch': 6 }),
  P('CL-JNS-32', 'Denim Jeans · Blue · 32', 'Blue · 32', '8941200200214', 'Clothing', 1890, 1600, 6, 'both', { 'Central Warehouse': 75, 'Dhanmondi branch': 40, 'Mirpur branch': 12 }),
  P('SK-SHA-340', 'Daily Care Shampoo 340ml', 'Anti-dandruff', '8941300300017', 'Skin care', 420, 378, 24, 'both', { 'Central Warehouse': 210, 'Dhanmondi branch': 88, 'Mirpur branch': 40 }),
  P('SK-SUN-50', 'Sunscreen SPF 50 · 50ml', 'Tube · 50ml', '8941300300024', 'Skin care', 1250, 1063, 12, 'both', { 'Central Warehouse': 124, 'Dhanmondi branch': 4, 'Mirpur branch': 18, 'Gulshan-1 branch': 6 }, { 'Dhanmondi branch': 24 }),
  P('SK-TON-150', 'Hyaluronic Toner 150ml', 'Bottle · 150ml', '8941300300031', 'Skin care', 990, 891, 12, 'both', { 'Central Warehouse': 90, 'Dhanmondi branch': 60, 'Mirpur branch': 22 }),
  P('EL-PHN-128', 'Budget Android Phone 6/128', 'Midnight · 128GB', '8941400400018', 'Electronics', 14990, 13491, 2, 'both', { 'Central Warehouse': 30, 'Chattogram hub': 8, 'Dhanmondi branch': 12, 'Mirpur branch': 5 }),
  P('EL-EAR-PRO', 'Wireless Earbuds Pro', 'Black', '8941400400025', 'Electronics', 3490, 3141, 5, 'both', { 'Central Warehouse': 64, 'Chattogram hub': 10, 'Dhanmondi branch': 9, 'Mirpur branch': 6, 'Gulshan-1 branch': 4 }, { 'Gulshan-1 branch': 4 }),
  P('HM-BTL-750', 'Steel Water Bottle 750ml', 'Steel · 750ml', '8941500500019', 'Home', 650, 585, 24, 'both', { 'Central Warehouse': 180, 'Dhanmondi branch': 31, 'Mirpur branch': 24 }),
  P('HM-RCK-18', 'Rice Cooker 1.8L Walton', '1.8L', '8941500500026', 'Home', 2950, 2508, 4, 'both', { 'Central Warehouse': 40, 'Dhanmondi branch': 4, 'Mirpur branch': 3 }),
];

// ---- products saved in Products join the catalogue ----------------------------------------------
// Read straight from localStorage (products.js imports this file, so it cannot be imported here).
// A saved product whose SKU is already in the catalogue changes its name, prices, MOQ, barcode and
// "sold to"; any other saved product (or variant) is new and starts with 0 on hand everywhere.
const SAVED_PRODUCTS = 'gc.products.saved';
let cache = { raw: null, list: [] };   // many lookups per render: parse only when the saved list changed
const readSaved = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_PRODUCTS);
    if (raw !== cache.raw) { const v = JSON.parse(raw); cache = { raw, list: Array.isArray(v) ? v : [] }; }
    return cache.list;
  } catch { return []; }
};
const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const topCat = (cat) => String(cat || '').split('›')[0].trim() || 'Other';
function applyEdit(c, x) {
  const price = num(x.price), wholesale = num(x.wholesale), moq = num(x.moq);
  return {
    ...c, aka: c.name !== x.name && x.name ? c.name : c.aka, name: x.name || c.name,
    price: price ?? wholesale ?? c.price, wholesale: x.wholesale === undefined ? c.wholesale : wholesale ?? c.wholesale,
    moq: moq ?? c.moq, barcode: x.barcode ? String(x.barcode) : c.barcode, sell: x.sell || c.sell,
  };
}
const fresh = (sku, name, variant, barcode, cat, price, wholesale, moq, sell, brand) => ({
  sku, name, variant, barcode: barcode ? String(barcode) : '', cat, price: price ?? wholesale ?? 0, wholesale: wholesale ?? price ?? 0,
  moq: moq ?? 0, sell: sell || 'retail', on: {}, transit: {}, saved: true, brand: brand || '',
});

/** The stock catalogue with the products saved in Products: CATALOG + new products, edits applied. */
let built = { from: null, list: CATALOG };
export function getCatalog(saved = readSaved()) {
  if (!saved.length) return CATALOG;
  if (built.from === saved) return built.list;
  const list = CATALOG.slice();
  const at = (sku) => list.findIndex((c) => c.sku.toLowerCase() === String(sku || '').trim().toLowerCase());
  saved.filter((p) => p && p.st !== 'deleted').forEach((p) => {
    const i = at(p.sku);
    if (p.sku && i >= 0) { list[i] = applyEdit(list[i], p); return; }
    const vars = Array.isArray(p.variants) ? p.variants : [];
    if (!vars.length) {
      const sku = p.sku || p.id;
      if (sku && at(sku) < 0) list.push(fresh(sku, p.name, '', p.barcode, topCat(p.cat), num(p.price), num(p.wholesale), num(p.moq), p.sell, p.brand));
      return;
    }
    vars.forEach((v, n) => {
      const sku = v.sku || (p.sku || p.id) + '-' + (n + 1);
      const j = at(sku);
      const row = { name: p.name + ' · ' + v.name, price: num(v.price) ?? num(p.price), wholesale: num(v.wholesale) ?? num(p.wholesale), moq: num(v.moq) ?? num(p.moq), barcode: v.barcode, sell: p.sell };
      if (j >= 0) list[j] = applyEdit(list[j], row);
      else list.push(fresh(sku, row.name, v.name, row.barcode, topCat(p.cat), row.price, row.wholesale, row.moq, row.sell, p.brand));
    });
  });
  built = { from: saved, list };
  return list;
}
const matches = (p, key) => p.sku === key || p.name === key || p.barcode === key || (p.aka && p.aka === key);
export const productBy = (key, catalog = getCatalog()) => (key ? catalog.find((p) => matches(p, key)) || null : null);

// ---- negative stock: a place may sell more than it has (set per place in Warehouses / Branches) --
const NEGATIVE = 'gc.stock.negative';
const readNegative = () => { try { return JSON.parse(window.localStorage.getItem(NEGATIVE)) || {}; } catch { return {}; } };
/** Whether a place lets the register sell beyond what is available. Off unless switched on.
 *  A renamed place keeps its switch (every name it had is checked). */
export const allowNegative = (place) => {
  if (typeof window === 'undefined') return false;
  const all = readNegative();
  const names = namesOf(place);
  return names[0] in all ? !!all[names[0]] : names.some((n) => !!all[n]);
};
/** Switch negative stock on or off at a place (under every name the place has had). */
export function setAllowNegative(place, on) {
  const all = readNegative();
  namesOf(place).forEach((n) => { all[n] = !!on; });
  all[place] = !!on;
  try { window.localStorage.setItem(NEGATIVE, JSON.stringify(all)); } catch { /* ignore */ }
  return all;
}

const read = () => { try { return JSON.parse(window.localStorage.getItem(MOVES)) || []; } catch { return []; } };
/** Stock moves recorded in this browser: adjustments, receipts, transfers, sales. */
export const getMoves = () => (typeof window === 'undefined' ? [] : read());
/** Record a change to what is on hand: { sku, place, qty (+ in / − out), kind, reason, by, ref, status }. */
export function addMove(move) {
  const list = [{ id: 'MV-' + Date.now().toString(36), at: Date.now(), status: 'done', ...move }, ...read()];
  try { window.localStorage.setItem(MOVES, JSON.stringify(list)); } catch { /* ignore */ }
  return list;
}

/** Find products by SKU, name, variant or barcode (for pickers). Empty query returns the whole catalogue. */
export function searchProducts(query) {
  const q = String(query || '').trim().toLowerCase();
  const all = getCatalog();
  if (!q) return all;
  return all.filter((p) => [p.sku, p.name, p.variant, p.barcode].some((x) => String(x).toLowerCase().includes(q)));
}
/** One line for a product in a picker: "SKU · name · variant". */
export const productLabel = (p) => [p.sku, p.name, p.variant].filter(Boolean).join(' · ');

const sum = (list) => list.reduce((a, x) => a + (Number(x.qty) || 0), 0);

/**
 * Stock of one product at one place (or everywhere when place is empty).
 * `transfers` defaults to the transfers in this browser; pass null to use the catalogue's demo
 * in-transit numbers (for the first render, before the browser data is read).
 */
export function stockAt(key, place, holds = getHolds(), moves = getMoves(), transfers = typeof window === 'undefined' ? null : getTransfers()) {
  const p = productBy(key);
  if (!p) return { onHand: 0, held: 0, damaged: 0, available: 0, transit: 0 };
  // a renamed place still counts what was saved under its old names
  const names = place ? namesOf(place) : null;
  const isHere = (x) => names.includes(x);
  const places = place ? names : allStockPlaces();
  const mine = holds.filter((h) => h.product === p.name || h.product === p.sku || (p.aka && h.product === p.aka));
  const here = (h) => !place || isHere(h.place);
  const base = places.reduce((a, x) => a + ((p.on || {})[x] || 0), 0);
  const moved = sum(moves.filter((m) => m.sku === p.sku && m.status === 'done' && (!place || isHere(m.place))));
  const damaged = sum(mine.filter((h) => h.status === 'damaged' && here(h)));
  const bay = place === DAMAGED_PLACE;
  // stock moved to the damaged bay has left the shelf it came from
  const leftShelf = place && !bay ? sum(mine.filter((h) => h.status === 'damaged' && isHere(h.from) && !isHere(h.place))) : 0;
  // the bay counts damaged holds that came off a shelf; pieces reported damaged on arrival (from the bay
  // itself) are already in the bay through their 'receive' stock move, so they are not added twice
  const offShelf = bay ? sum(mine.filter((h) => h.status === 'damaged' && here(h) && h.from && h.from !== DAMAGED_PLACE)) : 0;
  const onHand = base + moved - leftShelf + offShelf;
  const held = sum(mine.filter((h) => h.status === 'held' && here(h)));
  let transit;
  if (transfers) { const t = inTransit(transfers); transit = places.reduce((a, x) => a + ((t[x] && t[x][p.sku]) || 0), 0); }
  else transit = places.reduce((a, x) => a + ((p.transit || {})[x] || 0), 0);
  const available = bay ? 0 : Math.max(0, onHand - held - damaged);
  return { onHand, held, damaged, available, transit };
}
/** Built-in stock places plus every name of the places the merchant added or renamed (browser only). */
function allStockPlaces() {
  if (typeof window === 'undefined') return STOCK_PLACES;
  const extra = [];
  getPlaces().forEach((pl) => [pl.name, ...pl.aka].forEach((n) => { if (!STOCK_PLACES.includes(n) && !extra.includes(n) && !pl.noSale && !(pl.opening && pl.builtIn)) extra.push(n); }));
  return extra.length ? STOCK_PLACES.concat(extra) : STOCK_PLACES;
}

// ---- one place at a glance (Warehouses, Branches, Racks) ------------------------------------------
/** What one piece is worth on the shelf: its cost when known, else the wholesale price, else retail. */
export const unitValue = (p) => Number(p.cost ?? p.wholesale ?? p.price) || 0;
/** A product counts as low at a place when this many or fewer are free to sell there. */
export const LOW_AT = 5;
/**
 * Stock at one place, product by product, with totals:
 *   { rows: [{ p, onHand, held, damaged, available, transit, value, low }], products, onHand, value, held,
 *     damaged, transitIn, transitOut, transfersIn, transfersOut, low, negative: rows below zero }
 * A product is listed when the place has stocked it (base count), or it has any on hand, held or on the way.
 */
export function placeStock(place, { holds = getHolds(), moves = getMoves(), transfers = typeof window === 'undefined' ? null : getTransfers(), catalog = getCatalog() } = {}) {
  const names = namesOf(place);
  const rows = [];
  catalog.forEach((p) => {
    const st = stockAt(p.sku, place, holds, moves, transfers);
    const stocked = names.some((n) => ((p.on || {})[n] || 0) > 0);
    if (!stocked && !st.onHand && !st.held && !st.transit && !st.damaged) return;
    rows.push({ p, ...st, value: Math.max(0, st.onHand) * unitValue(p), low: place !== DAMAGED_PLACE && st.onHand >= 0 && st.available <= LOW_AT });
  });
  const add = (k) => rows.reduce((a, r) => a + r[k], 0);
  const out = (transfers || []).filter((t) => t.status === 'way' && names.includes(t.from));
  const inn = (transfers || []).filter((t) => t.status === 'way' && names.includes(t.to));
  const pcs = (list) => list.reduce((a, t) => a + t.lines.reduce((b, l) => b + (Number(l.qty) || 0), 0), 0);
  return {
    rows, products: rows.filter((r) => r.onHand > 0).length, onHand: add('onHand'), value: add('value'), held: add('held'), damaged: add('damaged'),
    transitIn: transfers ? pcs(inn) : add('transit'), transitOut: pcs(out), transfersIn: inn, transfersOut: out,
    low: rows.filter((r) => r.low).length, negative: rows.filter((r) => r.onHand < 0),
  };
}
