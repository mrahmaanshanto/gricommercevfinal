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

import { getCatalog, stockAt } from './stock';

const STATE_TEXT = { draft: 'Draft', archived: 'Archived', deleted: 'Deleted' };

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
  }));
}
/** Can this item be added at this quantity? { ok, free, preorder } (preorder: allowed only because of pre-order). */
export function canAdd(item, qty = 1) {
  const free = Math.max(0, Number(item.stock) || 0);
  if (free >= qty) return { ok: true, free, preorder: false };
  return { ok: !!item.oversell, free, preorder: !!item.oversell };
}
