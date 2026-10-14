// productStock — a product's live stock for the product list (Products › All products): what is free to sell across
// its SKUs (the product's own SKU when the stock catalogue has it, else one SKU per variant, the same rows
// stock.js › getCatalog makes), at how many places, and whether it is low or out against its alert level (reorder.js).
//   skusOf(product)            the catalogue SKUs the product's stock is kept under
//   productStock(product)      { available, onHand, places, low, out, skus } — every place (a one-place shop: its place);
//                              low = a SKU under its level, or (with variants) one variant sold out while others are left
// Browser only (reads the stock moves, holds and transfers kept in this browser): call it after mount.

import { getCatalog, stockAt, getMoves } from './stock';
import { getHolds } from './stockHolds';
import { getTransfers } from './transfers';
import { getStockPlaces, namesOf, onlinePlace } from './locations';
import { isOnePlace } from './stockSetup';
import { levelAt, isLow, isOut } from './reorder';

const lc = (x) => String(x == null ? '' : x).trim().toLowerCase();

/** The catalogue SKUs a product's stock is kept under (see the header). */
export function skusOf(p, catalog = getCatalog()) {
  if (!p) return [];
  const bySku = new Map(catalog.map((c) => [lc(c.sku), c.sku]));
  if (p.sku && bySku.has(lc(p.sku))) return [bySku.get(lc(p.sku))];
  const vars = Array.isArray(p.variants) ? p.variants : [];
  const keys = vars.length ? vars.map((v, n) => v.sku || (p.sku || p.id) + '-' + (n + 1)) : [p.sku || p.id];
  return keys.map((k) => bySku.get(lc(k))).filter(Boolean);
}

/** A product's stock everywhere, with its low / out state (see the header). */
export function productStock(p, data) {
  const d = data || { catalog: getCatalog(), holds: getHolds(), moves: getMoves(), transfers: getTransfers() };
  const skus = skusOf(p, d.catalog);
  const one = isOnePlace();
  const places = one ? [onlinePlace()] : getStockPlaces();
  const seen = new Set();
  let available = 0, onHand = 0, low = false;
  skus.forEach((sku) => {
    const row = d.catalog.find((c) => c.sku === sku);
    const total = stockAt(sku, one ? places[0] : '', d.holds, d.moves, d.transfers);
    available += total.available; onHand += total.onHand;
    // the places that carry it: a base count there, or stock there now
    const carried = places.filter((x) => {
      const base = namesOf(x).some((n) => ((row && row.on) || {})[n] > 0);
      const here = base || stockAt(sku, x, d.holds, d.moves, d.transfers).onHand > 0;
      if (here) seen.add(x);
      return here;
    });
    // low: one SKU under its level, or one variant sold out while others are left
    if (isLow(total.available, levelAt(row || { sku }, one ? places[0] : '', carried)) || (skus.length > 1 && isOut(total.available))) low = true;
  });
  const out = skus.length === 0 || isOut(available);
  return { available, onHand, places: seen.size, low: !out && low, out, skus: skus.length };
}
