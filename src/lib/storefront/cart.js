// storefront/cart — the shopper's cart in this browser (customer pages): add, remove, change the number; the side cart
// opens on an event; Checkout takes these lines when the cart has items (else its demo cart). Lines are catalogue SKUs
// (stock.js › getCatalog: a product, or one of its variants), so prices and stock always come from the one catalogue.
// Also remembers the last products viewed (the "Recently viewed" section).
//
//   getCart() → [{ sku, qty }] · cartCount() · addToCart(sku, qty) · setQty(sku, qty) · removeFromCart(sku) · clearCart()
//   cartLines() → [{ sku, qty, name, variant, price, mrp, stock, productId, oversell }] (sellable rows only)
//   cartTotal(lines) · skuForProduct(productId, variantName?) · openSideCart() · CART_EVENT · OPEN_CART_EVENT
//   viewed(productId) · recentlyViewed() → [productId]
//   checkoutHref() · goCheckout(values): the checkout page, or the pop-up checkout when the theme's checkoutMode is
//   'popup' (CHECKOUT_OPEN_EVENT, drawn by storeChrome › CheckoutPop)
// Front end only (gc.store.cart). A live store keeps the cart on its server with the customer's session.

import { orderableItems } from '../sellable';
import { onlinePlace } from '../locations';

const KEY = 'gc.store.cart';
const SEEN = 'gc.store.viewed';
export const CART_EVENT = 'gc:store-cart';
export const OPEN_CART_EVENT = 'gc:store-cart-open';
const ssr = () => typeof window === 'undefined';
const readJson = (k, d) => { if (ssr()) return d; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const writeJson = (k, v, ev) => { try { window.localStorage.setItem(k, JSON.stringify(v)); if (ev) window.dispatchEvent(new CustomEvent(ev)); } catch { /* ignore */ } };

export const getCart = () => (readJson(KEY, []) || []).filter((l) => l && l.sku && l.qty > 0);
export const cartCount = () => getCart().reduce((n, l) => n + l.qty, 0);
export function addToCart(sku, qty = 1) {
  if (!sku) return false;
  const list = getCart();
  const i = list.findIndex((l) => l.sku === sku);
  if (i >= 0) list[i] = { ...list[i], qty: list[i].qty + qty }; else list.push({ sku, qty });
  writeJson(KEY, list, CART_EVENT);
  return true;
}
export function setQty(sku, qty) { writeJson(KEY, getCart().map((l) => (l.sku === sku ? { ...l, qty: Math.max(0, Math.round(qty)) } : l)).filter((l) => l.qty > 0), CART_EVENT); }
export const removeFromCart = (sku) => writeJson(KEY, getCart().filter((l) => l.sku !== sku), CART_EVENT);
export const clearCart = () => writeJson(KEY, [], CART_EVENT);
export const CHECKOUT_OPEN_EVENT = 'gc:store-checkout-open';
/** The checkout's address, keeping a staff preview (and its preset) on. */
export function checkoutHref() {
  let to = '/checkout';
  try { const q = new URLSearchParams(window.location.search); if (q.get('preview') === '1') to += '?preview=1' + (q.get('preset') ? '&preset=' + q.get('preset') : ''); } catch { /* ignore */ }
  return to;
}
/** Go to checkout: the pop-up when the theme opens checkout as a pop-up (not on the checkout page itself), else the page. */
export function goCheckout(values) {
  if (values && values.checkoutMode === 'popup' && !/^\/checkout/.test(window.location.pathname)) { window.dispatchEvent(new CustomEvent(CHECKOUT_OPEN_EVENT)); return; }
  window.location.href = checkoutHref();
}
export const openSideCart = () => { try { window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT)); } catch { /* ignore */ } };

let items = null;
const orderable = () => { if (!items) { try { items = orderableItems({ channel: 'online', place: onlinePlace() }).filter((it) => it.format !== 'service'); } catch { items = []; } } return items; };
if (!ssr()) { try { window.addEventListener('storage', () => { items = null; }); window.addEventListener(CART_EVENT, () => { items = null; }); } catch { /* ignore */ } }

/** The cart with names, prices and free stock (lines that can't be sold any more drop out). */
export function cartLines() {
  items = null;
  const all = orderable();
  return getCart().map((l) => { const it = all.find((x) => x.sku === l.sku); return it ? { ...it, qty: l.qty } : null; }).filter(Boolean);
}
export const cartTotal = (lines) => (lines || []).reduce((a, l) => a + l.price * l.qty, 0);
/** The catalogue SKU to add for a product (its variant by name, else the first one that can be sold). */
export function skuForProduct(productId, variantName = '') {
  items = null;
  const rows = orderable().filter((it) => it.productId === productId);
  if (!rows.length) return '';
  const v = variantName && rows.find((r) => String(r.variant) === variantName || String(r.name).endsWith(' · ' + variantName));
  return (v || rows.find((r) => r.stock > 0 || r.oversell) || rows[0]).sku;
}

export function viewed(productId) {
  if (!productId) return;
  const list = [productId, ...(readJson(SEEN, []) || []).filter((x) => x !== productId)].slice(0, 12);
  writeJson(SEEN, list);
}
export const recentlyViewed = () => readJson(SEEN, []) || [];
