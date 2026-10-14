// stockData — what the app's product, stock, purchase and POS screens read, composed from the merchant libs
// (the same books as the web panel, so a change made in the app shows on the web and the other way round).
//   allowed(route, ctx)    the route is in the edition and open to the person (appNav.canUse without the "built" check,
//                          so a screen can guard itself before the lead lists it in ROUTES_BUILT)
//   rowsOf()               the catalogue rows (stock.getCatalog: one per SKU / variant) with their product (products.js),
//                          photo, status and tile colour; deleted products left out
//   productOfRow(row)      the product a catalogue row belongs to (products.findProduct)
//   thumbOf(row)           { src, letter, bg } for the 44–84px square
//   placeList()            stock places the person can pick (locations.getStockPlaces: one place in the Online edition)
//   reorderOf(sku, place)  the alert level the web Stock page uses (reorder.js; every place when no place)
//   stockTone(st, re)      'err' (out) | 'warn' (low: under the reorder level) | 'ok'
//   soldPerDay(sku)        pieces sold a day over the last 30 days (salesBook.getSaleLines)
//   me()                   the signed-in person's name (lib/team)
//   isAdmin()              the person's role opens everything (owner / CEO): no approval needed on purchase orders
//   costOf(row)            buying price of one piece (productCost, else 70% of the price like purchaseOrders.unitCost)
//   tracksExpiry(row)      the product is set to track expiry (flag 'Expiry')
//   photoFromFile(file)    a picked photo as a data URL, longest side 480px (like orderFlow.setLinePhoto)

import { hasModule } from '@/lib/edition';
import { APP_ROUTES } from '../kit/appNav';
import { getCatalog, stockAt, productBy, isUntracked } from '@/lib/stock';
import { findProduct } from '@/lib/products';
import { getStockPlaces, onlinePlace } from '@/lib/locations';
import { isOnePlace } from '@/lib/stockSetup';
import { levelAt, DEFAULT_LEVEL } from '@/lib/reorder';
import { getSaleLines, getSales } from '@/lib/salesBook';
import { productCostOf } from '@/lib/productCost';
import { currentUser, roleOf } from '@/lib/team';

export const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };

/** Is the route in the edition and open to the person? (no "built" check) */
export function allowed(route, ctx) {
  const r = APP_ROUTES[route];
  if (!r || !ctx) return false;
  if (r.module && !hasModule(r.module, ctx.ed)) return false;
  if (!r.nav) return true;
  return r.nav.some((id) => ctx.ids.has(id));
}

const TILES = ['#fff4e0', '#e0f3fb', '#eef2f6', '#e7f7f0', '#fde7ef', '#f3e8ff'];
const tileOf = (s) => TILES[String(s || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % TILES.length];

/** The product a catalogue row belongs to. */
export function productOfRow(row) {
  if (!row) return null;
  return safe(() => findProduct({ id: row.productId, sku: row.sku }), null);
}

/** Catalogue rows with their product's photo and status. */
export function rowsOf() {
  return safe(() => getCatalog(), []).map((r) => {
    const p = productOfRow(r);
    const media = p && Array.isArray(p.media) ? p.media.filter((m) => m && m.src && (m.kind || 'image') === 'image') : [];
    return { ...r, product: p, st: r.st || (p && p.st) || 'active', photo: media.length ? media[0].src : '', tbg: (p && p.tbg) || tileOf(r.sku), flags: (p && p.flags) || [] };
  }).filter((r) => r.st !== 'deleted');
}

/** The square picture of a row: its photo, or its first letter on the product's colour. */
export const thumbOf = (row) => ({ src: (row && row.photo) || '', letter: String((row && row.name) || '?').trim().charAt(0).toUpperCase(), bg: (row && row.tbg) || '#eef2f6' });

/** Stock places to pick from (the Online edition has one). */
export function placeList() {
  if (safe(() => isOnePlace(), false)) return [safe(() => onlinePlace(), 'Central Warehouse')];
  return safe(() => getStockPlaces(), ['Central Warehouse']);
}
export const onePlace = () => safe(() => isOnePlace(), false);

// the alert level the web Stock page uses (lib/reorder.js: the product's "Alert me when stock is below", or a place's own)
export const reorderOf = (sku, place) => safe(() => levelAt(productBy(sku) || { sku }, place || ''), DEFAULT_LEVEL);
/** 'err' out of stock · 'warn' under the reorder level · 'ok' */
export const stockTone = (available, re) => (available <= 0 ? 'err' : available < re ? 'warn' : 'ok');

let soldCache = { at: 0, map: null };
/** Pieces of each SKU sold in the last 30 days: { sku: qty } (worked out once a minute). */
export function sold30() {
  const now = Date.now();
  if (soldCache.map && now - soldCache.at < 60000) return soldCache.map;
  const from = now - 30 * 864e5;
  const map = {};
  safe(() => getSaleLines(getSales()), []).forEach((l) => { if (l.sku && (l.at || 0) >= from) map[l.sku] = (map[l.sku] || 0) + (Number(l.qty) || 0); });
  soldCache = { at: now, map };
  return map;
}
export const soldPerDay = (sku) => Math.round(((sold30()[sku] || 0) / 30) * 10) / 10;

export const me = () => safe(() => currentUser().name, 'Staff');
export const isAdmin = () => safe(() => roleOf(currentUser()).access === '*', false);

/** Buying price of one piece. */
export function costOf(row) {
  if (!row) return 0;
  const c = safe(() => productCostOf(row.sku) || productCostOf(row.name), 0);
  return c || Math.round(((Number(row.price) || 0) * 0.7) / 5) * 5;
}
export const tracksExpiry = (row) => !!row && ((row.flags || []).includes('Expiry') || ((productOfRow(row) || {}).flags || []).includes('Expiry'));
export const isTracked = (row) => !!row && !isUntracked(row);

/** Available, on hand, held and on the way of one SKU at a place ('' = every place). */
export const stockOf = (sku, place) => safe(() => stockAt(sku, place || ''), { onHand: 0, held: 0, damaged: 0, available: 0, transit: 0 });
export const rowBy = (key) => safe(() => productBy(key), null);

/** A picked photo as a data URL, longest side 480px. */
export function photoFromFile(file, max = 480) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('No file')); return; }
    const r = new FileReader();
    r.onerror = () => reject(new Error('Could not read the photo'));
    r.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Not a photo'));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "12 Sep" */
export const dayText = (t) => { if (!t) return ''; const d = new Date(t); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
/** yyyy-mm-dd for a date input, and back. */
export const isoDay = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const fromIso = (s) => { const [y, m, d] = String(s || '').split('-').map(Number); return y ? new Date(y, m - 1, d, 12).getTime() : null; };
