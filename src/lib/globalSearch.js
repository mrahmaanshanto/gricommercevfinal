// globalSearch — the top bar's search (src/shell/gc-topbar.js loads this lib on first use, so pages don't pay for it).
// One light index, built in the browser from the shared libs and kept for a few seconds:
//   orders (number, customer, phone) · customers (name, phone, email, customer ID) · products (name, SKU, barcode,
//   variant SKUs and barcodes) · invoices (number, customer, phone) · pages (the menu the person may open:
//   role, edition, plan — lib/team.js › navFor) · settings fields (lib/settingsRegistry.js › searchSettings).
// A kind is searched only when the person's menu has its list page (All orders, All customers, All products,
// Invoices), so search never shows what the person can't open. Orders and invoices follow the edition's channels.
// Recent searches are kept in this browser (RECENT_KEY).

import { getOrders, orderHref, invoiceHref } from './orders';
import { getInvoices, statusOf as invoiceStatus } from './invoices';
import { getDirectory, customerMatches } from './customers';
import { allProducts } from './products';
import { searchSettings } from './settingsRegistry';
import { currentUser, navFor, hrefOfItem } from './team';
import { formatBDT } from './format';

export const RECENT_KEY = 'gc.search.recent';
const RECENT_MAX = 6;
const TTL = 15000; // the index is rebuilt when it is older than this (orders keep arriving)

/** Scopes of the top bar's "Search in" list: [key, label]. */
export const SCOPES = [['all', 'All'], ['orders', 'Orders'], ['customers', 'Customers'], ['products', 'Products'], ['invoices', 'Invoices'], ['pages', 'Pages'], ['settings', 'Settings']];
/** The list page a kind needs in the person's menu. */
const NEEDS = { orders: 'orders-all', customers: 'customers', products: 'products-all', invoices: 'sales-invoices' };
const GROUP_LABEL = { orders: 'Orders', customers: 'Customers', products: 'Products', invoices: 'Invoices', pages: 'Pages', settings: 'Settings' };
const ICON = { orders: 'cart', customers: 'user', products: 'box', invoices: 'receipt', pages: 'file', settings: 'gear' };

const low = (s) => String(s == null ? '' : s).toLowerCase();
const digits = (s) => String(s == null ? '' : s).replace(/\D/g, '');

let cache = null; // { at, user, items: { orders: [], … }, can: Set }

/** The pages of the person's menu (create flows too, named as actions), with their area. */
function menuPages(nav) {
  const out = [];
  nav.forEach((g) => g.items.forEach((it) => {
    const kids = it.children && it.children.length ? it.children : [it];
    kids.forEach((c) => {
      if (c.locked) return;
      const href = hrefOfItem(c);
      if (!href) return;
      out.push({ kind: 'pages', id: 'page:' + c.id, title: c.label, sub: (c.hidden ? 'Action · ' : '') + (it === c ? g.label : it.label), href, hay: low([c.label, c.tab, it.label, g.label].filter(Boolean).join(' ')) });
    });
  }));
  return out;
}
/** Every menu id the person can open (areas and pages). */
const menuIds = (nav) => new Set(nav.flatMap((g) => g.items.flatMap((it) => [it.id, ...(it.children || []).filter((c) => !c.locked).map((c) => c.id)])));

/** Builds (or reuses) the index for the signed-in person. Browser only. */
export function buildIndex(force = false) {
  const user = currentUser();
  const now = Date.now();
  if (!force && cache && cache.user === user.id && now - cache.at < TTL) return cache;
  let nav = [];
  try { nav = navFor(user); } catch { nav = []; }
  const can = menuIds(nav);
  const items = { orders: [], customers: [], products: [], invoices: [], pages: menuPages(nav) };
  const safe = (fn) => { try { return fn(); } catch { return []; } };
  if (can.has(NEEDS.orders)) {
    items.orders = safe(getOrders).map((o) => ({
      kind: 'orders', id: o.id, title: o.id, sub: [o.customer, o.phone && o.phone !== '—' ? o.phone : '', o.total, o.status].filter(Boolean).join(' · '),
      href: orderHref(o.id), at: o.at || 0, num: digits(o.id), phone: digits(o.phone), hay: low([o.id, o.customer, o.invoiceId].join(' ')),
    })).sort((a, b) => b.at - a.at);
  }
  if (can.has(NEEDS.customers)) {
    const dir = safe(getDirectory);
    items.customers = dir.map((c) => ({ kind: 'customers', id: c.id, title: c.name, sub: [c.id, c.phone, c.area || c.city].filter(Boolean).join(' · '), href: '/customer-crm?id=' + encodeURIComponent(c.id), raw: c }));
    items.customers.dir = dir;
  }
  if (can.has(NEEDS.products)) {
    items.products = safe(allProducts).filter((p) => p.st !== 'deleted').map((p) => {
      const codes = [p.sku, p.barcode, ...(p.variants || []).flatMap((v) => [v.sku, v.barcode]), ...(p.ids || []).map((x) => x && x.value)].filter(Boolean);
      return { kind: 'products', id: p.id, title: p.name, sub: [p.sku, formatBDT(p.price || 0), (p.inv || 0) + ' in stock'].filter(Boolean).join(' · '),
        href: p.sku ? '/add-product?sku=' + encodeURIComponent(p.sku) : '/add-product?id=' + encodeURIComponent(p.id), codes: codes.map(low), hay: low([p.name, p.brand, p.cat].join(' ')) };
    });
  }
  if (can.has(NEEDS.invoices)) {
    const ST = { paid: 'Paid', partial: 'Partly paid', unpaid: 'Unpaid' };
    items.invoices = safe(getInvoices).map((r) => ({
      kind: 'invoices', id: r.id, title: r.id, sub: [(r.customer || {}).name, formatBDT((r.totals || {}).total || 0), ST[invoiceStatus(r)]].filter(Boolean).join(' · '),
      href: invoiceHref(r.id), at: r.at || 0, phone: digits((r.customer || {}).phone), hay: low([r.id, (r.customer || {}).name].join(' ')),
    })).sort((a, b) => b.at - a.at);
  }
  cache = { at: now, user: user.id, items, can };
  return cache;
}
/** Forget the index (after data changed, or another person signed in). */
export const resetIndex = () => { cache = null; };

/** Which scopes this person can use: kinds whose list page is in their menu (`nav`, lib/team.js › navFor), plus
 *  pages and settings. Cheap: reads only the menu. */
export function scopesFor(nav) {
  let can;
  try { can = menuIds(nav || navFor(currentUser())); } catch { can = new Set(); }
  return SCOPES.filter(([k]) => !NEEDS[k] || can.has(NEEDS[k]));
}

// ---- matching -----------------------------------------------------------------------------------------
function scoreText(hay, words) {
  if (!words.every((w) => hay.includes(w))) return -1;
  return hay.startsWith(words[0]) ? 0 : hay.includes(' ' + words[0]) ? 1 : 2;
}
const MATCH = {
  orders(it, q, words, d) {
    if (low(it.id) === low(q).trim()) return -2;
    if (d.length >= 3 && it.num.includes(d)) return it.num === d ? -2 : it.num.startsWith(d) ? 0 : 1;
    if (d.length >= 4 && it.phone && it.phone.includes(d.replace(/^88/, ''))) return 1;
    return scoreText(it.hay, words);
  },
  customers(it, q, words, d, dir) {
    if (!customerMatches(it.raw, q, dir)) return -1;
    const n = low(it.raw.name);
    return low(it.id) === low(q) ? -2 : n.startsWith(words[0]) ? 0 : 1;
  },
  products(it, q, words) {
    const lq = low(q).trim();
    if (it.codes.some((c) => c === lq)) return -2;
    if (lq.length >= 3 && it.codes.some((c) => c.startsWith(lq))) return 0;
    return scoreText(it.hay, words);
  },
  invoices(it, q, words, d) {
    if (low(it.id) === low(q).trim()) return -2;
    if (d.length >= 4 && it.phone && it.phone.includes(d)) return 1;
    return scoreText(it.hay, words);
  },
  pages(it, q, words) { return scoreText(it.hay, words); },
};

/**
 * Search. Returns groups [{ key, label, icon, items: [{ kind, id, title, sub, href }] }] in a fixed order, and
 * `exact`: the one record the text names exactly (an order or invoice number, a customer ID, a SKU or barcode),
 * which Enter opens straight away.
 */
export function search(q, { scope = 'all', limit } = {}) {
  const text = String(q || '').trim();
  if (!text) return { groups: [], exact: null, total: 0 };
  const idx = buildIndex();
  const words = low(text).split(/\s+/).filter(Boolean);
  const d = digits(text);
  const per = limit || (scope === 'all' ? 4 : 20);
  const kinds = scope === 'all' ? ['orders', 'customers', 'products', 'invoices', 'pages', 'settings'] : [scope];
  let exact = null;
  const groups = [];
  kinds.forEach((k) => {
    let hits;
    if (k === 'settings') {
      hits = searchSettings(text, { limit: per }).map((e) => ({ kind: 'settings', id: e.id, title: e.label, sub: e.page + (e.owner && e.owner !== 'Settings' ? ' · ' + e.owner : ''), href: e.href, s: e.score }));
    } else {
      const list = idx.items[k] || [];
      const dir = k === 'customers' ? list.dir : null;
      hits = [];
      for (const it of list) {
        const s = MATCH[k](it, text, words, d, dir);
        if (s >= 0 || s === -2) hits.push({ it, s });
      }
      hits.sort((a, b) => a.s - b.s || (b.it.at || 0) - (a.it.at || 0));
      if (!exact) { const ex = hits.find((h) => h.s === -2); if (ex) exact = ex.it; }
      hits = hits.slice(0, per).map((h) => h.it);
    }
    if (hits.length) groups.push({ key: k, label: GROUP_LABEL[k], icon: ICON[k], items: hits.map(({ kind, id, title, sub, href }) => ({ kind, id, title, sub, href })) });
  });
  // an order number typed with or without "#" opens that order even when it isn't in the first rows
  if (!exact && /^#?\d{5,}$/.test(text) && idx.items.orders.length) {
    const o = idx.items.orders.find((x) => x.num === d);
    if (o) exact = o;
  }
  const total = groups.reduce((a, g) => a + g.items.length, 0);
  return { groups, exact: exact ? { kind: exact.kind, id: exact.id, title: exact.title, href: exact.href } : null, total };
}

// ---- recent searches (this browser) -------------------------------------------------------------------
/** The person's recent searches, newest first. */
export function getRecent() {
  try { const v = JSON.parse(window.localStorage.getItem(RECENT_KEY)); return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, RECENT_MAX) : []; } catch { return []; }
}
/** Remember a search (moves it to the front). */
export function addRecent(q) {
  const text = String(q || '').trim();
  if (text.length < 2) return;
  const list = [text, ...getRecent().filter((x) => low(x) !== low(text))].slice(0, RECENT_MAX);
  try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}
export function clearRecent() { try { window.localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ } }
