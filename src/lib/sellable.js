// sellable — what can be sold right now, and why not (Nayeem's Product brief #1 + Sales & Orders brief #4).
// The product decides whether it can be sold; the order screens and the register ask here instead of keeping
// their own product lists. A row is a stock-catalogue row (stock.js › getCatalog: the product list and the
// stock catalogue as one), which carries its product's status (st), pre-order switch (oversell) and prices.
//
//   sellStateOf(row)              active · draft · archived · deleted (a catalogue row with no product = active)
//   whyNotSellable(row, channel)  '' when it can be sold, else the reason (status, sold-to, no price)
//   orderableItems({ place })     what Create order offers: every sellable product and variant with its
//                                 free stock at the place and whether it may be sold out of stock (pre-order)
//   isStatusSellable(row)         status only (the register: wholesale prices are its own business)
// Orders already placed are never blocked by a later status change: an order keeps what was sold (orderLinks.js).
//
// How a product sells when it runs out (sellModeOf): 'normal' (stops at 0), 'preorder' (the "Keep selling when out of
// stock (pre-order)" switch, oversell: sold before it is in stock), 'backorder' (a normal item, out for now: orders are
// taken with an expected restock date, restockAt). Gift-only items (giftOnly) are real stock with a real cost that
// is never sold: only offers give them away (isGiftable). Digital downloads and services are not counted; a licence
// product sells while it has free keys; a virtual bundle sells as many as its parts allow (stock.js › stockAt).

import { getCatalog, stockAt } from './stock';

const STATE_TEXT = { draft: 'Draft', archived: 'Archived', deleted: 'Deleted' };
export const SELL_MODES = { normal: 'Stops at 0', preorder: 'Pre-order', backorder: 'Backorder' };

/** 'normal' | 'preorder' | 'backorder' — what happens when the item is out of stock. */
export const sellModeOf = (row) => (!row ? 'normal' : row.oversell ? 'preorder' : row.backorder ? 'backorder' : 'normal');
/** A gift-only item: not for sale, given away by offers. */
export const isGiftOnly = (row) => !!(row && row.giftOnly);
/** Can an offer give this item away? Active, gift-only or not, and with free stock. */
export const isGiftable = (row, place = '') => !!row && sellStateOf(row) === 'active' && stockAt(row.sku, place).available > 0;
/** "Back 15 Oct" for a backorder with a restock date. */
export function restockText(row) {
  if (!row || !row.restockAt) return '';
  const d = new Date(row.restockAt);
  if (Number.isNaN(d.getTime())) return '';
  return 'Back ' + d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
}

export const sellStateOf = (row) => (row && row.st) || 'active';
export const isStatusSellable = (row) => sellStateOf(row) === 'active';

/**
 * Why a product can't be sold on a channel ('' when it can):
 *   online / retail  needs status Active, sold to Retail or Both, and a selling price
 *   wholesale        needs status Active, sold to Wholesale or Both, and a wholesale price
 */
export function whyNotSellable(row, channel = 'online') {
  if (!row) return 'Not in the product list';
  const st = sellStateOf(row);
  if (st !== 'active') return STATE_TEXT[st] || st;
  if (isGiftOnly(row)) return 'Gift only';
  if (row.catalogueOnly) return 'Catalogue only';   // shown in the catalogue, never sold (Add product › Sellability)
  if (channel === 'wholesale') {
    if (row.sell === 'retail') return 'Not sold wholesale';
    if (!(Number(row.wholesale) > 0)) return 'No wholesale price';
    return '';
  }
  if (row.sell === 'wholesale') return 'Wholesale only';
  if (!(Number(row.price) > 0)) return 'No selling price';
  return '';
}
export const isSellable = (row, channel) => !whyNotSellable(row, channel);

/**
 * Products and variants an order can take, from the one catalogue:
 *   [{ id, sku, name, variant, barcode, cat, price, listPrice, mrp, stock, oversell, productId }]
 * `stock` is what is free at the place (held and damaged pieces left out); a product may be added when it
 * has free stock, or when its "Keep selling when out of stock (pre-order)" switch is on (oversell).
 */
export function orderableItems({ channel = 'online', place = '' } = {}) {
  return getCatalog().filter((row) => isSellable(row, channel)).map((row) => ({
    id: row.sku, sku: row.sku, name: row.name, variant: row.variant || 'Single', barcode: row.barcode || '', cat: row.cat || '',
    price: channel === 'wholesale' ? Number(row.wholesale) : Number(row.price), listPrice: channel === 'wholesale' ? Number(row.wholesale) : Number(row.price),
    mrp: row.mrp || null, stock: stockAt(row.sku, place).available, oversell: !!row.oversell, productId: row.productId || '',
    backorder: !!row.backorder && !row.oversell, restockAt: row.restockAt || '', format: row.format || 'physical', unit: row.unit || 'pc', bundle: !!row.bundle,
  }));
}
/** Can this item be added at this quantity? { ok, free, preorder, backorder } (preorder / backorder: allowed only
 *  because the item is sold before it is in stock, or taken on backorder until it is restocked). */
export function canAdd(item, qty = 1) {
  const free = Math.max(0, Number(item.stock) || 0);
  if (free >= qty) return { ok: true, free, preorder: false, backorder: false };
  const back = !item.oversell && !!item.backorder;
  return { ok: !!item.oversell || back, free, preorder: !!item.oversell, backorder: back };
}
