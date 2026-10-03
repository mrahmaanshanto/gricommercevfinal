// productRelations — how products relate to each other (Nayeem's Product brief #1 › "Frequently bought together /
// combo", product relationship graph). Kinds:
//   related      similar products to show beside this one
//   accessories  add-ons that go with it (case, charger)
//   substitutes  can be sold instead when this one is out of stock
//   successor    the newer model that replaces this one (one product)
//   fbt          frequently bought together (offered at checkout)
// Relations are stored by product id. Other pages read them: relationsOf(id) (this product's lists, resolved to
// products), relatedTo(id) (who points at this product), substitutesInStock(id) (substitutes with free stock, for an
// out-of-stock item), fbtFor(id).
// Front end only: gc.products.relations (demo links for the demo products).

import { allProducts } from './products';
import { stockAt } from './stock';

const KEY = 'gc.products.relations';
export const REL_EVENT = 'gc:product-relations';
export const REL_KINDS = [
  { k: 'related', label: 'Related products', many: true },
  { k: 'accessories', label: 'Accessories', many: true },
  { k: 'substitutes', label: 'Substitutes', many: true },
  { k: 'successor', label: 'Replaced by', many: false },
  { k: 'fbt', label: 'Frequently bought together', many: true },
];
const SEED = {
  'p-phone-5gp': { related: ['p-laptop-rtx'], accessories: ['p-phone-case', 'p-earbuds-pro'], substitutes: [], successor: '', fbt: ['p-phone-case'] },
  'p-sunscreen-50': { related: ['p-toner-150'], accessories: [], substitutes: [], successor: '', fbt: ['p-toner-150'] },
  'p-toner-150': { related: ['p-sunscreen-50'], accessories: [], substitutes: [], successor: '', fbt: ['p-sunscreen-50'] },
  'p-rice-5': { related: ['p-masur-dal'], accessories: [], substitutes: ['p-rice-25'], successor: '', fbt: ['p-masur-dal'] },
  'p-aloe-300': { related: [], accessories: [], substitutes: [], successor: 'p-sunscreen-50', fbt: [] },
  'p-earbuds-pro': { related: [], accessories: [], substitutes: [], successor: '', fbt: ['p-phone-case'] },
};
const EMPTY = { related: [], accessories: [], substitutes: [], successor: '', fbt: [] };

const read = () => { if (typeof window === 'undefined') return SEED; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && typeof v === 'object' ? { ...SEED, ...v } : SEED; } catch { return SEED; } };

/** The raw relation ids of a product: { related: [ids], accessories, substitutes, successor: id, fbt }. */
export const relationIds = (id) => ({ ...EMPTY, ...(read()[id] || {}) });
/** Save one kind of relation for a product (ids, or one id for successor). */
export function setRelation(id, kind, value) {
  if (!id) return;
  let saved = {};
  try { saved = JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { saved = {}; }
  const cur = relationIds(id);
  cur[kind] = kind === 'successor' ? String(value || '') : Array.from(new Set((value || []).filter((x) => x && x !== id)));
  saved[id] = cur;
  try { window.localStorage.setItem(KEY, JSON.stringify(saved)); window.dispatchEvent(new CustomEvent(REL_EVENT)); } catch { /* ignore */ }
}

const byId = () => { const m = new Map(); allProducts().forEach((p) => m.set(p.id, p)); return m; };
/** A product's relations resolved to products (missing or deleted products are left out). */
export function relationsOf(id) {
  const r = relationIds(id), m = byId();
  const get = (x) => { const p = m.get(x); return p && p.st !== 'deleted' ? p : null; };
  const out = {};
  REL_KINDS.forEach(({ k, many }) => { out[k] = many ? r[k].map(get).filter(Boolean) : get(r[k]); });
  return out;
}
/** Products that point at this one, by kind: { related: [products], accessories: […] (it is an accessory of), … }. */
export function relatedTo(id) {
  const all = read(), m = byId(), out = { related: [], accessories: [], substitutes: [], successor: [], fbt: [] };
  Object.keys(all).forEach((src) => {
    if (src === id) return;
    const r = { ...EMPTY, ...all[src] };
    REL_KINDS.forEach(({ k, many }) => { if (many ? r[k].includes(id) : r[k] === id) { const p = m.get(src); if (p) out[k].push(p); } });
  });
  return out;
}
/** Substitutes with free stock somewhere (or at `place`), for an item that has run out. */
export function substitutesInStock(id, place = '') {
  return relationsOf(id).substitutes.filter((p) => (p.sku ? stockAt(p.sku, place).available > 0 : false));
}
export const fbtFor = (id) => relationsOf(id).fbt;
/** How many links a product has (for a summary line). */
export const relationCount = (id) => { const r = relationIds(id); return r.related.length + r.accessories.length + r.substitutes.length + (r.successor ? 1 : 0) + r.fbt.length; };
