// reorder — when a product counts as low stock: its alert level ("Alert me when stock is below"), set per product
// and, when needed, per place.
//   - The product's own level (Add product › Inventory › "Alert me when stock is below", saved as `lowAt`; stock.js
//     copies it onto the catalogue rows) is the level at every place.
//   - Stock › a product (with a place picked) can set another level for that one place. It is kept by the place's id,
//     so a renamed place keeps it.
//   - Products without a level of their own: the demo levels below (Dazzle Shop's catalogue), else DEFAULT_LEVEL (the
//     product form's starting value).
//   levelAt(row, place, carried)  the level at one place. Without a place: a one-place shop uses its one place; a shop
//                                 with many places adds up the levels of the places that carry the product (`carried`:
//                                 place names; by default the places with a base count of it)
//   isLow(available, level)       something left, but less than the level · isOut(available): nothing left to sell
// Front end only: the per-place levels are kept in this browser (gc.stock.reorder). Leaf module: imports locations.js
// and stockSetup.js only (stock.js reads this file).

import { placeByName, getStockPlaces, namesOf, onlinePlace } from './locations';
import { isOnePlace } from './stockSetup';

const KEY = 'gc.stock.reorder';
export const REORDER_EVENT = 'gc:reorder';
/** The level a product starts with (the product form's "Alert me when stock is below" box). */
export const DEFAULT_LEVEL = 5;
// Dazzle Shop's demo levels for the catalogue products that have no level of their own yet
const SEED = {
  'AC-CBL-100': 60, 'AC-CLN-KIT': 40, 'AC-GLS-9H': 30, 'AC-OTG-C': 20, 'AC-LNS-PR': 40, 'AC-CSE-A55': 20, 'AC-CHG-25': 10, 'WR-BND-08': 8,
  'AC-HLD-CAR': 15, 'AC-CBL-LTG': 30, 'AC-CHG-20': 24, 'AU-EAR-TC': 20, 'PH-RLM-N50': 6, 'AU-EAR-PRO': 10, 'AC-STD-FLD': 30, 'PB-ANK-10K': 5,
};

const whole = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Math.max(0, Math.round(Number(v))));
const read = () => { if (typeof window === 'undefined') return {}; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };
const keyOf = (place) => { const p = placeByName(place); return p ? p.id : String(place || ''); };
const skuOf = (row) => String((row && row.sku) || row || '');

/** The product's own level: its "Alert me when stock is below" value, else the demo level, else DEFAULT_LEVEL. */
export function productLevel(row) {
  const own = row && typeof row === 'object' ? whole(row.lowAt) : null;
  if (own != null) return own;
  const sku = skuOf(row);
  return SEED[sku] != null ? SEED[sku] : DEFAULT_LEVEL;
}
/** The level set for one place in Stock (null when the place uses the product's level). */
export function placeLevel(row, place) {
  if (!place) return null;
  const mine = read()[skuOf(row)] || {};
  const k = keyOf(place);
  if (mine[k] != null) return whole(mine[k]);
  // a level saved under an old name of the place still counts
  const old = namesOf(place).find((n) => mine[n] != null);
  return old ? whole(mine[old]) : null;
}
/** The level at a place (see the header). */
export function levelAt(row, place, carried) {
  if (!place && isOnePlace()) place = onlinePlace();
  if (place) { const own = placeLevel(row, place); return own != null ? own : productLevel(row); }
  const on = (row && row.on) || {};
  const list = carried || getStockPlaces().filter((x) => namesOf(x).some((n) => (on[n] || 0) > 0));
  if (!list.length) return productLevel(row);
  return list.reduce((a, x) => a + levelAt(row, x), 0);
}
/** Set (a whole number) or clear (null / '') the level for one place. Returns the level now in use there. */
export function setPlaceLevel(row, place, n) {
  const sku = skuOf(row);
  if (!sku || !place || typeof window === 'undefined') return levelAt(row, place);
  const all = read(), mine = { ...(all[sku] || {}) };
  namesOf(place).forEach((x) => { delete mine[x]; });
  const v = whole(n);
  if (v == null) delete mine[keyOf(place)]; else mine[keyOf(place)] = v;
  if (Object.keys(mine).length) all[sku] = mine; else delete all[sku];
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent(REORDER_EVENT)); } catch { /* ignore */ }
  return levelAt(row, place);
}
/** Out of stock: nothing left to sell (an online order may take it below zero). */
export const isOut = (available) => (Number(available) || 0) <= 0;
/** Low stock: something left, but less than the level. */
export const isLow = (available, level) => !isOut(available) && Number(available) < Number(level);
