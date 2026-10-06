// stock — the product catalogue with stock per place, and the numbers every screen shows:
//   on hand   what is physically there (base count + recorded stock moves)
//   held      set aside for an order (stock holds)
//   damaged   set aside, not for sale
//   available on hand − held − damaged
//   in transit on its way to the place (transfers not yet received)
// Damaged stock sits in the 'Returns & damaged' bay (DAMAGED_PLACE): a damaged hold has left the
// shelf it came from (hold.from) and counts as on hand, damaged and never available in the bay.
// Front end only: base counts are demo data; moves (adjustments, receipts, transfers) are kept in this browser.
//
// Base units, operation keys and the offline queue (Nayeem's Inventory brief #2):
//   - Every move is in base units (units.js). A move entered in packs ({ pack, packs }) is stored as packs × pack size
//     with the pack it was entered in, so a later pack-size change never rewrites history.
//   - Every move carries an operation key (`op`). Posting the same key again is ignored, so a double tap, a retried
//     scan or a replayed offline queue never counts stock twice. Callers that can repeat (receiving, counts,
//     transfers, custody) pass a key made from their document and line; others get a fresh key.
//   - Posted while the browser is offline, a move counts at once and waits in the queue (getQueue) until the browser
//     is back online (flushQueue). In a real build the queue goes to the server with the same keys.
// Products that are not physical stock: digital downloads and services are not tracked (UNTRACKED available);
// a licence product's stock is its free keys (licenceKeys.js), and a sale takes a key; a virtual bundle has no
// stock of its own: what can be sold is worked out from its parts, and a sale of the bundle moves the parts.

import { getHolds } from './stockHolds';
import { getTransfers, inTransit } from './transfers';
import { STOCK_PLACES, DAMAGED_PLACE, namesOf, getPlaces, onlinePlace } from './locations';
import { isOnePlace } from './stockSetup';
import { productCostOf } from './productCost';   // called at run time only (productCost reads this module too)
import { DEMO_PRODUCTS } from './products';       // read at run time only (products.js reads this module too)
import { packsOf, roundQty } from './units';
import { takeKeys, releaseKeys, freeKeys } from './licenceKeys';
import { recordSerial } from './serialTrace';      // called at run time only (serialTrace reads this module too)

const MOVES = 'gc.stock.moves';
// sku, name, variant, barcode, category, retail price, wholesale price, MOQ for wholesale, sold to, on hand by place, in transit by place
const P = (sku, name, variant, barcode, cat, price, wholesale, moq, sell, on, transit) => ({ sku, name, variant, barcode, cat, price, wholesale, moq, sell, on, transit: transit || {} });
export const CATALOG = [
  P('AU-EAR-PRO', 'Wireless Earbuds Pro', 'Black', '8941400400025', 'Audio', 3490, 3141, 5, 'both', { 'Central Warehouse': 64, 'Dhanmondi branch': 9, 'Mirpur branch': 6 }, { 'Mirpur branch': 4 }),
  P('PH-RLM-N50', 'Realme Note 50 6/128GB', 'Midnight Black · 128GB', '8941400400018', 'Phones', 14990, 13491, 2, 'both', { 'Central Warehouse': 30, 'Dhanmondi branch': 12, 'Mirpur branch': 5 }),
  P('PH-RDM-N13', 'Redmi Note 13 8/256GB', 'Graphite Grey · 256GB', '8941400400032', 'Phones', 26999, 25200, 2, 'both', { 'Central Warehouse': 22, 'Dhanmondi branch': 6, 'Mirpur branch': 4 }),
  P('PH-GAL-A15', 'Galaxy A15 6/128GB', 'Blue Black · 128GB', '8941400400049', 'Phones', 19999, 18600, 2, 'both', { 'Central Warehouse': 18, 'Dhanmondi branch': 5, 'Mirpur branch': 6 }),
  P('PH-IPH-15', 'iPhone 15 128GB', 'Black · 128GB', '8941400400056', 'Phones', 119999, 114000, 1, 'retail', { 'Central Warehouse': 6, 'Dhanmondi branch': 2, 'Mirpur branch': 1 }),
  P('PH-SYM-D50', 'Symphony D50 Feature Phone', 'Black', '8941400400063', 'Phones', 1650, 1500, 10, 'both', { 'Central Warehouse': 80, 'Dhanmondi branch': 20, 'Mirpur branch': 16 }),
  P('AC-CBL-100', 'Baseus USB-C Cable 100W 1m', 'Black · 1m', '8941100100011', 'Accessories', 780, 700, 10, 'both', { 'Central Warehouse': 300, 'Dhanmondi branch': 60, 'Mirpur branch': 40 }),
  P('AC-CLN-KIT', 'Screen Cleaning Kit', 'Spray · 50ml', '8941100100028', 'Accessories', 165, 148, 20, 'both', { 'Central Warehouse': 200, 'Dhanmondi branch': 34, 'Mirpur branch': 30 }),
  P('AC-GLS-9H', 'Tempered Glass 9H', 'Universal 6.7 inch', '8941100100035', 'Accessories', 390, 355, 12, 'both', { 'Central Warehouse': 150, 'Dhanmondi branch': 24, 'Mirpur branch': 42 }, { 'Dhanmondi branch': 12 }),
  P('AC-OTG-C', 'USB-C OTG Adapter', 'Silver', '8941100100042', 'Accessories', 320, 290, 12, 'retail', { 'Central Warehouse': 60, 'Dhanmondi branch': 14, 'Mirpur branch': 12 }),
  P('AC-LNS-PR', 'Camera Lens Protector', 'Clear', '8941100100059', 'Accessories', 145, 130, 20, 'both', { 'Central Warehouse': 180, 'Dhanmondi branch': 40, 'Mirpur branch': 33 }),
  P('AC-CSE-A55', 'Spigen Tough Armor Case · Galaxy A55', 'Black', '8941200200016', 'Accessories', 1240, 1050, 6, 'both', { 'Central Warehouse': 120, 'Dhanmondi branch': 22, 'Mirpur branch': 28 }, { 'Mirpur branch': 10 }),
  P('AC-CHG-25', 'Samsung 25W Fast Charger', 'White', '8941200200023', 'Accessories', 1850, 1600, 6, 'retail', { 'Central Warehouse': 30, 'Dhanmondi branch': 6 }),
  P('WR-BND-08', 'Xiaomi Smart Band 8', 'Graphite Black', '8941200200030', 'Wearables', 3450, 3000, 4, 'retail', { 'Central Warehouse': 12 }, { 'Dhanmondi branch': 6 }),
  P('AC-HLD-CAR', 'Baseus Car Phone Holder', 'Black', '8941200200214', 'Accessories', 1890, 1600, 6, 'both', { 'Central Warehouse': 75, 'Dhanmondi branch': 40, 'Mirpur branch': 12 }),
  P('AC-CBL-LTG', 'Lightning Cable 1m', 'White · 1m', '8941300300017', 'Accessories', 420, 378, 24, 'both', { 'Central Warehouse': 210, 'Dhanmondi branch': 88, 'Mirpur branch': 40 }),
  P('AC-CHG-20', 'Anker 20W USB-C Charger', 'White', '8941300300024', 'Accessories', 1250, 1063, 12, 'both', { 'Central Warehouse': 124, 'Dhanmondi branch': 4, 'Mirpur branch': 24 }, { 'Dhanmondi branch': 24 }),
  P('AU-EAR-TC', 'Type-C Wired Earphones', 'White', '8941300300031', 'Audio', 990, 891, 12, 'both', { 'Central Warehouse': 90, 'Dhanmondi branch': 60, 'Mirpur branch': 22 }),
  P('AC-STD-FLD', 'Foldable Phone Stand', 'Aluminium', '8941500500019', 'Accessories', 650, 585, 24, 'both', { 'Central Warehouse': 180, 'Dhanmondi branch': 31, 'Mirpur branch': 24 }),
  P('PB-ANK-10K', 'Anker Power Bank 10000mAh', 'Black', '8941500500026', 'Power banks', 2950, 2508, 4, 'both', { 'Central Warehouse': 40, 'Dhanmondi branch': 4, 'Mirpur branch': 3 }),
];

// ---- one product master: the product list joins the catalogue -------------------------------------
// Nayeem's Product brief (#1): one SKU, one product record. Every product in Products › All products
// (products.js: its demo rows and the products saved in this browser) is a row here too, so orders, the
// register, stock and reports all see the same products:
//   - a product whose SKU is already in the catalogue is that row (a saved edit changes its name, prices,
//     MOQ, barcode and "sold to");
//   - any other product, or each of its variants, is a new row: a demo product brings its own stock at the
//     home place, a product added in this browser starts at 0 (Add product › Opening stock adds to it).
// Every row carries the product's status (st), pre-order switch (oversell), id, MRP and barcode kind, which
// sellable.js reads. Saved products are read straight from localStorage; the demo product list is read from
// products.js at run time only (products.js imports this file too).
const SAVED_PRODUCTS = 'gc.products.saved';
const HOME = 'Central Warehouse';
let cache = { raw: null, list: [] };   // many lookups per render: parse only when the saved list changed
const NONE = [];
const readSaved = () => {
  if (typeof window === 'undefined') return NONE;
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

// what a catalogue row learns from its product (sellable.js, identifiers.js, units.js and the stock maths read these)
const lc = (x) => String(x == null ? '' : x).replace(/\s+/g, '').toLowerCase();
/** A product's identifiers that belong to this row: the product's own (or this variant's) codes and pack barcodes. */
function idsFor(p, v) {
  const own = (Array.isArray(p.ids) ? p.ids : []).filter((x) => x && x.value && (!x.variant || (v && x.variant === v.sku)));
  const packs = packsOf({ sku: (v && v.sku) || p.sku, packs: p.packs }).filter((k) => k.barcode).map((k) => ({ type: 'pack', value: String(k.barcode), pack: k.id }));
  return own.map((x) => ({ type: x.type || 'alt', value: String(x.value).trim(), pack: x.pack || '' })).concat(packs);
}
const metaOf = (p, v) => {
  const ids = idsFor(p, v);
  const bundle = p.bundle && Array.isArray(p.bundle.parts) && p.bundle.parts.length ? p.bundle : null;
  return {
    st: p.st || 'active', oversell: !!p.oversell, productId: p.id, mrp: num((v && v.mrp) ?? p.mrp), barcodeType: (v && v.barcodeType) || p.barcodeType || '',
    unit: p.unit || 'pc', ...(Array.isArray(p.packs) ? { packs: p.packs } : {}), ids, codes: ids.map((x) => lc(x.value)),
    format: p.format || 'physical', backorder: !!p.backorder, restockAt: p.restockAt || '', giftOnly: !!p.giftOnly, catalogueOnly: p.sellability === 'catalogue', bundle, template: p.template || '',
  };
};

/** The one catalogue: the stock catalogue and the product list (demo + saved in this browser), see above. */
let built = { from: undefined, list: CATALOG };
export function getCatalog(saved = readSaved()) {
  if (built.from === saved) return built.list;
  const demo = demoProducts();
  if (!demo) return CATALOG;                             // products.js not ready yet (module start-up): don't cache
  const products = listProducts(saved, demo);
  const list = CATALOG.slice();
  const at = (sku) => list.findIndex((c) => c.sku.toLowerCase() === String(sku || '').trim().toLowerCase());
  const mine = new Set(saved.map((p) => p && p.id));
  products.filter((p) => p && p.st !== 'deleted').forEach((p) => {
    const edited = mine.has(p.id);                       // saved in this browser: its values win
    const demoStock = !p.savedNew;                       // a demo product brings its own stock; a new one starts at 0
    const i = at(p.sku);
    if (p.sku && i >= 0) { list[i] = { ...(edited ? applyEdit(list[i], p) : list[i]), ...metaOf(p) }; return; }
    const vars = Array.isArray(p.variants) ? p.variants : [];
    if (!vars.length) {
      const sku = p.sku || p.id;
      if (sku && at(sku) < 0) {
        const row = fresh(sku, p.name, '', p.barcode, topCat(p.cat), num(p.price), num(p.wholesale), num(p.moq), p.sell, p.brand);
        if (demoStock && p.inv > 0) row.on = { [HOME]: Number(p.inv) };
        list.push({ ...row, saved: edited || !!p.savedNew, ...metaOf(p) });
      }
      return;
    }
    vars.forEach((v, n) => {
      const sku = v.sku || (p.sku || p.id) + '-' + (n + 1);
      const j = at(sku);
      const row = { name: p.name + ' · ' + v.name, price: num(v.price) ?? num(p.price), wholesale: num(v.wholesale) ?? num(p.wholesale), moq: num(v.moq) ?? num(p.moq), barcode: v.barcode, sell: p.sell };
      if (j >= 0) { list[j] = { ...(edited ? applyEdit(list[j], row) : list[j]), ...metaOf(p, v) }; return; }
      const add = fresh(sku, row.name, v.name, row.barcode, topCat(p.cat), row.price, row.wholesale, row.moq, row.sell, p.brand);
      if (demoStock && Number(v.stock) > 0) add.on = { [HOME]: Number(v.stock) };
      list.push({ ...add, saved: edited || !!p.savedNew, ...metaOf(p, v) });
    });
  });
  // catalogue-only items with demo packs (units.js) can be found by their pack barcodes too
  list.forEach((r, i) => { if (!r.codes) { const pk = packsOf(r).filter((k) => k.barcode); if (pk.length) list[i] = { ...r, ids: pk.map((k) => ({ type: 'pack', value: k.barcode, pack: k.id })), codes: pk.map((k) => lc(k.barcode)) }; } });
  built = { from: saved, list };
  return list;
}
function demoProducts() { try { return Array.isArray(DEMO_PRODUCTS) ? DEMO_PRODUCTS : null; } catch { return null; } }
/** The product list with saved edits applied; products added in this browser are marked savedNew. */
function listProducts(saved, demo) {
  const ids = new Set(demo.map((p) => p.id));
  const byId = new Map(saved.filter((p) => p && ids.has(p.id)).map((p) => [p.id, p]));
  const added = saved.filter((p) => p && !ids.has(p.id)).map((p) => ({ ...p, savedNew: true }));
  return added.concat(demo.map((p) => (byId.has(p.id) ? { ...p, ...byId.get(p.id), variants: byId.get(p.id).variants || p.variants } : p)));
}
// a row is found by its SKU, name, barcode, old name, or any other code it has (identifiers.js: other barcodes,
// supplier codes, pack barcodes, PLU, MPN, ISBN)
const matches = (p, key) => p.sku === key || p.name === key || p.barcode === key || (p.aka && p.aka === key) || (!!p.codes && p.codes.length > 0 && p.codes.indexOf(lc(key)) >= 0);
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
const QUEUE = 'gc.stock.queue';
export const STOCK_EVENT = 'gc:stock';
const readQueue = () => { try { return JSON.parse(window.localStorage.getItem(QUEUE)) || []; } catch { return []; } };
let seq = 0;
const newId = () => 'MV-' + Date.now().toString(36) + (seq++ % 1296).toString(36).padStart(2, '0');
const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
const SALE_OUT = { sale: 1, delivery: 1 };
const SALE_BACK = { return: 1, rto: 1 };
/** Stock moves recorded in this browser: adjustments, receipts, transfers, sales. */
export const getMoves = () => (typeof window === 'undefined' ? [] : read());
/** Was this operation key posted already? */
export const hasOp = (op) => !!op && typeof window !== 'undefined' && read().some((m) => m.op === op);
/**
 * Record a change to what is on hand: { sku, place, qty (+ in / − out, base units), kind, reason, by, ref, status,
 * op (operation key: the same key twice is ignored), pack + packs (entered as packs: qty = packs × pack size),
 * serial, batch }. Returns the list of moves.
 */
export function addMove(move) {
  const list = read();
  if (move.op && list.some((m) => m.op === move.op)) return list;            // the same operation twice: ignored
  const row = productBy(move.sku);
  let qty = Number(move.qty) || 0, pack;
  if (move.pack && move.packs != null && row) {
    const pk = packsOf(row).find((k) => k.id === move.pack || k.name === move.pack);
    if (pk) { qty = (Number(move.packs) || 0) * pk.qty; pack = { id: pk.id, name: pk.name, qty: pk.qty }; }
  }
  if (row) qty = roundQty(row, qty);
  // a virtual bundle has no stock of its own: its parts move instead
  if (row && row.bundle && row.bundle.type !== 'kit' && !move.part) {
    let out = list;
    row.bundle.parts.forEach((pt) => { out = addMove({ ...move, sku: pt.sku, qty: qty * (Number(pt.qty) || 1), pack: undefined, packs: undefined, part: row.sku, op: move.op ? move.op + ':' + pt.sku : undefined, reason: [move.reason, 'part of ' + row.name].filter(Boolean).join(' · ') }); });
    return out;
  }
  const id = newId();
  const rec = { id, at: Date.now(), status: 'done', ...move, qty, op: move.op || id };
  if (pack) rec.pack = pack; else { delete rec.pack; delete rec.packs; }
  // a licence product: a sale takes keys from the pool, a return or cancelled sale puts them back
  if (row && row.format === 'licence') {
    if (SALE_OUT[rec.kind] && qty < 0) rec.keys = takeKeys(row.sku, -qty, rec.ref, rec.who).map((k) => k.key);
    else if (SALE_BACK[rec.kind] && qty > 0) releaseKeys(row.sku, rec.ref, qty);
  }
  if (isOffline()) { rec.sync = 'queued'; try { window.localStorage.setItem(QUEUE, JSON.stringify([...readQueue(), rec.op])); } catch { /* ignore */ } }
  const next = [rec, ...list];
  try { window.localStorage.setItem(MOVES, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(STOCK_EVENT, { detail: rec })); } catch { /* ignore */ }
  if (rec.serial && row) { try { recordSerial(rec.serial, { kind: rec.kind, place: rec.place, ref: rec.ref, by: rec.by, note: rec.reason }, { sku: row.sku, name: row.name }); } catch { /* ignore */ } }
  return next;
}
/** Moves waiting to be sent (posted while offline). */
export const getQueue = () => (typeof window === 'undefined' ? [] : read().filter((m) => m.sync === 'queued'));
/** Send the waiting moves. Each goes once: the server keeps the operation keys (here: the moves are marked sent). */
export function flushQueue() {
  if (typeof window === 'undefined' || isOffline()) return 0;
  const ops = new Set(readQueue());
  let n = 0;
  const list = read().map((m) => (m.sync === 'queued' || ops.has(m.op) ? (n++, { ...m, sync: 'sent', syncedAt: Date.now() }) : m));
  try { window.localStorage.setItem(MOVES, JSON.stringify(list)); window.localStorage.removeItem(QUEUE); if (n) window.dispatchEvent(new CustomEvent(STOCK_EVENT)); } catch { /* ignore */ }
  return n;
}
if (typeof window !== 'undefined' && !window.__gcStockQueue) { window.__gcStockQueue = true; window.addEventListener('online', () => { flushQueue(); }); }

/** Find products by SKU, name, variant or barcode (for pickers). Empty query returns the whole catalogue. */
export function searchProducts(query) {
  const q = String(query || '').trim().toLowerCase();
  const all = getCatalog();
  if (!q) return all;
  return all.filter((p) => [p.sku, p.name, p.variant, p.barcode].some((x) => String(x).toLowerCase().includes(q)) || (p.codes || []).includes(lc(q)));
}
/** One line for a product in a picker: "SKU · name · variant". */
export const productLabel = (p) => [p.sku, p.name, p.variant].filter(Boolean).join(' · ');

const sum = (list) => list.reduce((a, x) => a + (Number(x.qty) || 0), 0);

/**
 * Stock of one product at one place (or everywhere when place is empty).
 * `transfers` defaults to the transfers in this browser; pass null to use the catalogue's demo
 * in-transit numbers (for the first render, before the browser data is read).
 */
export function stockAt(key, place, holds = getHolds(), moves = getMoves(), transfers = typeof window === 'undefined' ? null : getTransfers(), depth = 0) {
  // a one-place shop's stock is its one place (stock left at other places is merged in Settings › Stock setup)
  if (!place && isOnePlace()) place = onlinePlace();
  const p = productBy(key);
  if (!p) return { onHand: 0, held: 0, damaged: 0, available: 0, transit: 0 };
  // not physical stock: downloads and services are not counted; a licence product has its free keys
  if (p.format === 'digital' || p.format === 'service') return { onHand: 0, held: 0, damaged: 0, available: UNTRACKED, transit: 0, untracked: true };
  if (p.format === 'licence') { const free = typeof window === 'undefined' ? 0 : freeKeys(p.sku); return { onHand: free, held: 0, damaged: 0, available: free, transit: 0, keys: true }; }
  // a virtual bundle: as many as its scarcest part allows, less the bundles already held for orders
  if (p.bundle && p.bundle.type !== 'kit') {
    if (depth > 3) return { onHand: 0, held: 0, damaged: 0, available: 0, transit: 0 };
    const parts = p.bundle.parts.map((pt) => ({ q: Math.max(1, Number(pt.qty) || 1), st: stockAt(pt.sku, place, holds, moves, transfers, depth + 1) }));
    const most = (k) => Math.max(0, Math.min(...parts.map((x) => Math.floor((x.st[k] || 0) / x.q))));
    const heldB = sum(holds.filter((h) => (h.product === p.name || h.product === p.sku) && h.status === 'held' && (!place || namesOf(place).includes(h.place))));
    return { onHand: most('onHand'), held: heldB, damaged: 0, available: Math.max(0, most('available') - heldB), transit: most('transit'), virtual: true };
  }
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
/** Available stock shown for products that are not counted (downloads, services). */
export const UNTRACKED = 9999;
/** True for a catalogue row whose stock is not counted (a download or a service). */
export const isUntracked = (row) => !!row && (row.format === 'digital' || row.format === 'service');
/** True for a row that has no shelf stock of its own (not counted, a licence, or a virtual bundle). */
export const isVirtualRow = (row) => !!row && (isUntracked(row) || row.format === 'licence' || (!!row.bundle && row.bundle.type !== 'kit'));

/** Built-in stock places plus every name of the places the merchant added or renamed (browser only). */
function allStockPlaces() {
  if (typeof window === 'undefined') return STOCK_PLACES;
  const extra = [];
  getPlaces().forEach((pl) => [pl.name, ...pl.aka].forEach((n) => { if (!STOCK_PLACES.includes(n) && !extra.includes(n) && !pl.noSale && !(pl.opening && pl.builtIn)) extra.push(n); }));
  return extra.length ? STOCK_PLACES.concat(extra) : STOCK_PLACES;
}

// ---- one place at a glance (Warehouses, Branches, Racks) ------------------------------------------
/** What one piece is worth on the shelf: its cost (buying price) — the purchase cost the shop knows, never a selling price. */
export const unitValue = (p) => Number(p.cost) || productCostOf(p.sku) || productCostOf(p.name) || 0;
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
    if (isVirtualRow(p)) return;                         // downloads, licences and virtual bundles have no shelf stock
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
