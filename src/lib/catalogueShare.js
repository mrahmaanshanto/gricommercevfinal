// catalogueShare — the products a buyer sees in a shared catalogue or price list, with real prices and stock
// (Wholesale review WH-U5 / WH-F5). Built from the one catalogue (stock.js › getCatalog), priced by the one price rule
// (wholesalePrice.js › priceFor: the buyer's price list in wholesale mode, else the retail price).
//
//   catalogueItems({ customer, cats, all })   [{ sku, name, variant, cat, price, listPrice, source, note, moq, stock,
//                                             state: 'ok' | 'low' | 'out' | 'preorder', units }]
//       customer   a business buyer → their prices (wholesale on); none → retail prices and retail products
//       cats       only these categories (omit for all)
//   catalogueCats(items)                      [{ k, label, n }] categories with how many products each
//   getCatalogueSettings() / saveCatalogueSettings(s)   the catalogue page's settings (name, categories, price mode,
//                                             show stock, WhatsApp number, buyer)
// Front end only: settings live in this browser (gc.catalogue). The public catalogue page needs a server.

import { getCatalog, stockAt, isUntracked } from './stock';
import { sellStateOf, isGiftOnly } from './sellable';
import { priceFor, unitsFor, isBusinessBuyer } from './wholesalePrice';
import { wholesaleOn } from './edition';

const KEY = 'gc.catalogue';
export const CATALOGUE_EVENT = 'gc:catalogue';
const LOW = 5;

/** Products a catalogue or price list shows, priced for this buyer. */
export function catalogueItems({ customer = null, cats = null, all = false } = {}) {
  if (typeof window === 'undefined') return [];
  const business = !!customer && wholesaleOn() && isBusinessBuyer(customer);
  return getCatalog()
    .filter((r) => sellStateOf(r) === 'active' && !isGiftOnly(r) && (business ? r.sell !== 'retail' : r.sell !== 'wholesale'))
    .filter((r) => all || !cats || cats.includes(r.cat || 'Other'))
    .map((r) => {
      const p = business ? priceFor({ customer, sku: r.sku, qty: 1, channel: 'wholesale' }) : { price: Number(r.price) || 0, listPrice: Number(r.price) || 0, source: 'retail', moq: 0 };
      const untracked = isUntracked(r);
      const stock = untracked ? null : stockAt(r.sku).available;
      const state = untracked ? 'ok' : stock > 0 ? (stock <= (Number(r.lowAt) || LOW) ? 'low' : 'ok') : r.oversell ? 'preorder' : 'out';
      let units = [];
      try { units = business ? unitsFor(r.sku).slice(1) : []; } catch { units = []; }
      return { sku: r.sku, name: r.name, variant: r.variant || '', cat: r.cat || 'Other', price: p.price, listPrice: p.listPrice, source: p.source, note: p.note || '', moq: business ? Number(p.moq || r.moq) || 0 : 0, stock, state, units };
    })
    .filter((x) => x.price > 0 || x.source !== 'retail');
}
/** The categories in a list of items, biggest first. */
export function catalogueCats(items) {
  const m = new Map();
  items.forEach((x) => m.set(x.cat, (m.get(x.cat) || 0) + 1));
  return [...m.entries()].map(([k, n]) => ({ k, label: k, n })).sort((a, b) => b.n - a.n || a.k.localeCompare(b.k));
}

const DEFAULTS = { name: 'New arrivals', cats: null, priceMode: 'show', showStock: true, wa: '', buyer: '' };
export function getCatalogueSettings() {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try { return { ...DEFAULTS, ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return { ...DEFAULTS }; }
}
/** Save the settings. Returns true when they were kept (false: the browser's storage is blocked). */
export function saveCatalogueSettings(s) {
  try { window.localStorage.setItem(KEY, JSON.stringify({ ...s, savedAt: Date.now() })); window.dispatchEvent(new CustomEvent(CATALOGUE_EVENT)); return true; } catch { return false; }
}
