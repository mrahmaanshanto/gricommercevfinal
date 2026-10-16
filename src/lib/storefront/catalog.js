// storefront/catalog — what the customer pages list, from the shop's real data (read after mount, in the browser):
// products for sale on the website (Active, sold to Retail or Both, a price, not gift-only, not services), the shop's
// categories (not hidden), brands, published reviews, published blog posts and the website's live flash sale.
//
//   storeProducts() → [SP]   SP { id, name, handle, href, price, mrp, off, cat, brand, img, img2, tbg, stock, oversell,
//                                 rating { avg, count }, sold, createdRank, keys [[label, value]], isNew }
//   productsBy({ source, cat, picked, count, exclude, relatedTo }) — source new · best · sale · category · picked · related
//   searchProducts(q, cat) · sortProducts(list, by) · filterProducts(list, { brands, min, max, inStock })
//   storeCategories() → [{ id, name, path, lv, handle, href, count }] · catChildren(path) · catByPath(path)
//   storeBrands() · storeReviews(n) · storePosts(n) · liveFlashSale(offerId?)
// Cached per page load; re-read on demand with refreshCatalog().

import { allProducts, getSavedProducts, productHandle } from '../products';
import { getCategories, categoryHandle, productsIn } from '../productCategories';
import { getBrands } from '../brands';
import { getReviews, summaryOf } from '../productReviews';
import { getPosts } from '../blog';
import { getSaleLines } from '../salesBook';
import { websiteOffers } from '../storeOffers';
import { clockNow } from '../settlements';
import { demoHref } from '../seo';
import { templateFor, fieldsOf, fieldValue } from '../productTemplates';
import { getPlaces } from '../locations';

let cache = null;
export function refreshCatalog() { cache = null; }

function soldBySku() {
  const out = {};
  try { getSaleLines().forEach((l) => { if (l.sku) out[l.sku] = (out[l.sku] || 0) + (Number(l.qty) || 0); }); } catch { /* ignore */ }
  return out;
}
/** Up to four key features from the product's template ("RAM: 8 GB"), for spec-style product cards. */
function keysOf(p) {
  try {
    const t = templateFor(p);
    return fieldsOf(t.id).filter((f) => f.key).map((f) => { const v = fieldValue(p, f); const val = v && v.value; return val === '' || val == null ? null : [f.l, (f.t === 'yes' ? (val === true || val === 'Yes' ? 'Yes' : 'No') : String(val)) + (f.u ? ' ' + f.u : '')]; }).filter(Boolean).slice(0, 4);
  } catch { return []; }
}
const imgOf = (p, n = 0) => { const m = (p.media || []).filter((x) => x.src && (x.kind || 'image') === 'image'); return m[n] ? m[n].src : ''; };

/** Products on sale on the website. */
export function storeProducts() {
  if (cache && cache.products) return cache.products;
  let list = [];
  try { list = allProducts(getSavedProducts()); } catch { list = []; }
  const sold = soldBySku();
  let reviews = [];
  try { reviews = getReviews(); } catch { reviews = []; }
  const out = list
    .filter((p) => p.st === 'active' && !p.giftOnly && p.sell !== 'wholesale' && Number(p.price) > 0 && p.format !== 'service' && p.sellability !== 'catalogue')
    .map((p, i) => {
      const stock = (p.variants || []).length ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0) : Number(p.inv) || 0;
      const skus = [p.sku, ...(p.variants || []).map((v) => v.sku)].filter(Boolean);
      let rating = { avg: 0, count: 0 };
      try { rating = summaryOf(p, reviews); } catch { /* ignore */ }
      const handle = productHandle(p);
      return {
        id: p.id, name: p.name, handle, href: demoHref('product', handle), price: Number(p.price), mrp: Number(p.mrp) || 0,
        off: p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0, cat: p.cat || '', brand: p.brand || '',
        img: imgOf(p), img2: imgOf(p, 1), tbg: p.tbg || '#eef2f6', stock, oversell: !!p.oversell || !!p.backorder, rating,
        sold: skus.reduce((a, s) => a + (sold[s] || 0), 0), createdRank: p.savedNew ? 10000 + i : list.length - i, variants: p.variants || [], opts: p.opts || [],
        keys: keysOf(p), unit: p.size || p.netQty || '', warranty: p.warranty || '',
      };
    });
  // the eight newest carry a NEW badge on cards that show one
  const fresh = out.slice().sort((a, b) => b.createdRank - a.createdRank).slice(0, 8).map((x) => x.id);
  out.forEach((x) => { x.isNew = fresh.includes(x.id); });
  cache = { ...(cache || {}), products: out };
  return out;
}

export function sortProducts(list, by) {
  const l = list.slice();
  if (by === 'price-asc') return l.sort((a, b) => a.price - b.price);
  if (by === 'price-desc') return l.sort((a, b) => b.price - a.price);
  if (by === 'newest') return l.sort((a, b) => b.createdRank - a.createdRank);
  if (by === 'best') return l.sort((a, b) => b.sold - a.sold);
  return l.sort((a, b) => (b.stock > 0) - (a.stock > 0) || b.rating.count - a.rating.count || b.sold - a.sold);
}
export function filterProducts(list, f = {}) {
  return list.filter((p) => (!f.brands || !f.brands.length || f.brands.includes(p.brand))
    && (!f.min || p.price >= f.min) && (!f.max || p.price <= f.max) && (!f.inStock || p.stock > 0 || p.oversell));
}
const under = (path, cat) => !!path && !!cat && (cat === path || String(cat).indexOf(path + ' › ') === 0);

/** A section's products. */
export function productsBy({ source = 'new', cat = '', picked = [], count = 8, relatedTo = null } = {}) {
  const all = storeProducts();
  let list;
  if (source === 'best') list = sortProducts(all, 'best');
  else if (source === 'sale') list = all.filter((p) => p.off > 0).sort((a, b) => b.off - a.off);
  else if (source === 'category') list = sortProducts(all.filter((p) => under(cat, p.cat)), 'featured');
  else if (source === 'picked') list = (picked || []).map((id) => all.find((p) => p.id === id)).filter(Boolean);
  else if (source === 'related') {
    const top = relatedTo ? String(relatedTo.cat || '').split(' › ')[0] : '';
    list = relatedTo ? sortProducts(all.filter((p) => p.id !== relatedTo.id && (under(relatedTo.cat, p.cat) || (top && under(top, p.cat)) || (relatedTo.brand && p.brand === relatedTo.brand))), 'best') : sortProducts(all, 'best');
    if (list.length < count) list = [...list, ...sortProducts(all, 'best').filter((p) => (!relatedTo || p.id !== relatedTo.id) && !list.includes(p))];
  } else list = sortProducts(all, 'newest');
  // products with a photo lead every list (not a hand-picked one), so a shop that has photographed only part of its range
  // still looks complete; each source starts the photographed ones at a different place, so sections don't repeat
  if (source !== 'picked') {
    const shot = list.filter((p) => p.img);
    const turn = shot.length ? ({ best: 1, sale: 2, related: 3 }[source] || 0) % shot.length : 0;
    list = [...shot.slice(turn), ...shot.slice(0, turn), ...list.filter((p) => !p.img)];
  }
  return list.slice(0, Math.max(1, Math.min(24, Number(count) || 8)));
}

export function searchProducts(q, cat = '') {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  return storeProducts().filter((p) => (!cat || under(cat, p.cat)) && words.every((w) => [p.name, p.brand, p.cat].join(' ').toLowerCase().includes(w)));
}

/** The shop's categories that show on the website. */
export function storeCategories() {
  if (cache && cache.cats) return cache.cats;
  let list = [];
  try { list = getCategories(); } catch { list = []; }
  const hiddenPaths = list.filter((c) => c.hidden).map((c) => c.path);
  const all = storeProducts();
  const out = list.filter((c) => !hiddenPaths.some((h) => under(h, c.path)))
    .map((c) => { const handle = categoryHandle(c); return { id: c.id, name: c.name, path: c.path, lv: c.lv, handle, href: demoHref('category', handle), count: all.filter((p) => under(c.path, p.cat)).length, desc: c.desc || '', img: c.image || (all.find((p) => under(c.path, p.cat) && p.img) || {}).img || '' }; })
    .filter((c) => c.count > 0 || c.lv === 0);
  cache = { ...(cache || {}), cats: out };
  return out;
}
export const catByPath = (path) => storeCategories().find((c) => c.path === path) || null;
export const catChildren = (path) => storeCategories().filter((c) => c.path.indexOf(path + ' › ') === 0 && c.path.split(' › ').length === path.split(' › ').length + 1);
export const topCategories = () => storeCategories().filter((c) => c.lv === 0 && c.count > 0);
/** Products in a category (and below), for the category page. */
export function categoryProducts(path) {
  let ids = null;
  try { ids = new Set(productsIn(path).map((p) => p.id)); } catch { ids = null; }
  return storeProducts().filter((p) => (ids ? ids.has(p.id) : under(path, p.cat)));
}

export function storeBrands() {
  const all = storeProducts();
  let list = [];
  try { list = getBrands(); } catch { list = []; }
  // brands with products first; a brand with a logo shows on the brand wall even before its products are listed
  return list.map((b) => ({ ...b, count: all.filter((p) => p.brand === b.name).length })).filter((b) => b.count > 0 || b.image).sort((a, b) => b.count - a.count || (b.image ? 1 : 0) - (a.image ? 1 : 0));
}
export function storeReviews(n = 3) {
  let list = [];
  try { list = getReviews().filter((r) => r.status === 'published' && r.stars >= 4 && String(r.text || '').length > 20); } catch { list = []; }
  return list.slice(0, n);
}
export function storePosts(n = 3) {
  let list = [];
  try { list = getPosts().filter((p) => p.status === 'published'); } catch { list = []; }
  return list.slice(0, n);
}
/** The live flash sale (the one named, else the first live one), or null. */
export function liveFlashSale(offerId = '') {
  let list = [];
  try { list = websiteOffers(clockNow()); } catch { list = []; }
  const live = list.filter((o) => o.kind === 'flash' && o.state !== 'ended');
  return (offerId && live.find((o) => o.id === offerId)) || live.find((o) => o.state === 'live') || live[0] || null;
}
export const flashSales = () => { try { return websiteOffers(clockNow()).filter((o) => o.kind === 'flash'); } catch { return []; } };

/** The shop's branches for the Store locator section (Inventory › Places): name, address, hours, phone, map link. */
export function storeBranches() {
  let list = [];
  try { list = getPlaces({ active: true }); } catch { list = []; }
  return list.filter((p) => /branch|shop|store/i.test(String(p.type || '')) && p.address).map((p) => ({
    name: p.name, address: p.address, hours: p.hours || '', phone: p.phone || '',
    map: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.address),
  }));
}
