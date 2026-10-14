// landingPages — single-product landing pages (Online Store › Landing pages): one page per product, built in the
// landing page builder (/landing-page-builder?id=), with an order form on the page.
//
//   getLandingPages() · getLandingPage(id) · pagesOfProduct(sku)
//   newLandingPage({ product, template }) · saveLandingPage(p) · publishLandingPage(id) · unpublishLandingPage(id)
//   duplicateLandingPage(id) · deleteLandingPages(ids)
//   uniqueHandle(base, selfId) · handleProblem(handle, selfId) · pageUrl(p) · TEMPLATES · STATUSES
//   statsOf(p, orders, now) → { visits, orders, sales, conversion }
//   LANDING_EVENT ('gc:landing-pages')
//
// A page: { id, title, sku, productId, productName, template, handle, lang, offerLine, status ('draft'|'published'),
//           createdAt, updatedAt, publishedAt }
// Figures (demo): the server would tag each order with the page it came from. Here a page's orders are the shop's
// website and order-link orders of its product placed since the page went live (orders.js, live orders included),
// and visits are worked out from them with a fixed seed per page, so the numbers move with real orders.
// Front end only: kept in this browser (gc.landingPages). The demo pages are dated from today, worked out after mount.

import { getOrders, isCounterSale } from './orders';
import { demoNow } from './demoClock';
import { toHandle } from './handles';
import { autoRedirect } from './redirects';

const KEY = 'gc.landingPages';
export const LANDING_EVENT = 'gc:landing-pages';
export const SITE = 'dazzleshop.com.bd';
export const LP_BASE = SITE + '/lp/';
const DAY = 864e5;
const isBrowser = typeof window !== 'undefined';

export const STATUSES = {
  published: { label: 'Published', tone: 'success', icon: 'check', help: 'On the website: orders come in' },
  draft: { label: 'Draft', tone: 'neutral', icon: 'pencil-line', help: 'Not on the website' },
};
export const TEMPLATES = [
  { id: 'cod', name: 'COD single product', icon: 'banknote', parts: 11, blurb: 'Order form near the top' },
  { id: 'long', name: 'Long-form offer', icon: 'scroll-text', parts: 17, blurb: 'Benefits, reviews, FAQ, countdown' },
  { id: 'video', name: 'Video first', icon: 'play-circle', parts: 9, blurb: 'Video, then order form' },
  { id: 'blank', name: 'Blank page', icon: 'plus', parts: 3, blurb: 'Start with 3 suggested parts' },
];
export const templateOf = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export const slugify = (s) => toHandle(s).slice(0, 60).replace(/-+$/, '');
export const pageUrl = (p) => LP_BASE + (p.handle || '');

// demo pages, dated from today: two live, one draft (real Dazzle Shop products)
function seed(now) {
  const t = (days, h = 11) => { const d = new Date(now - days * DAY); d.setHours(h, 20, 0, 0); return d.getTime(); };
  return [
    { id: 'LP-1001', title: 'Anker 20W charger — fast charging', sku: 'AC-CHG-20', productId: 'p-charger-20', productName: 'Anker 20W USB-C Charger', template: 'long', handle: 'anker-20w', lang: 'both', offerLine: 'Free delivery all over Bangladesh', status: 'published', createdAt: t(16), updatedAt: t(9, 15), publishedAt: t(9, 16), demo: true },
    { id: 'LP-1002', title: 'Wireless Earbuds Pro', sku: 'AU-EAR-PRO', productId: 'p-earbuds-pro', productName: 'Wireless Earbuds Pro', template: 'cod', handle: 'earbuds-pro', lang: 'both', offerLine: 'Cash on delivery, 7-day easy return', status: 'published', createdAt: t(24), updatedAt: t(12), publishedAt: t(20), demo: true },
    { id: 'LP-1003', title: 'Redmi Note 13 — Puja offer', sku: 'PH-RDM-N13', productId: 'p-redmi-n13', productName: 'Redmi Note 13 8/256GB', template: 'video', handle: 'redmi-note-13', lang: 'bn', offerLine: '', status: 'draft', createdAt: t(2), updatedAt: t(1, 18), publishedAt: null, demo: true },
  ];
}

function read() {
  if (!isBrowser) return null;
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : null; } catch { return null; }
}
function write(list) {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(LANDING_EVENT)); } catch { /* full or private mode */ }
}
/** Every landing page, last changed first (the demo pages until the shop changes the list). */
export function getLandingPages() {
  if (!isBrowser) return [];
  const list = read() || seed(demoNow());
  return list.map(due).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
/** A page scheduled to go live (goLiveAt, set in its SEO panel) is published once that time has passed. */
const due = (p) => (p && p.goLiveAt && p.status !== 'published' && new Date(p.goLiveAt).getTime() <= demoNow()
  ? { ...p, status: 'published', publishedAt: new Date(p.goLiveAt).getTime(), goLiveAt: null } : p);
const store = () => read() || seed(demoNow());
export const getLandingPage = (id) => getLandingPages().find((p) => p.id === id) || null;
export const pagesOfProduct = (sku) => getLandingPages().filter((p) => p.sku === sku);

export function handleProblem(handle, selfId) {
  const h = String(handle || '');
  if (!h) return 'Add a page link.';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(h)) return 'Use small letters, numbers and dashes only.';
  const other = getLandingPages().find((p) => p.id !== selfId && p.handle === h);
  return other ? `“/${h}” is already used by ${other.title}.` : '';
}
export function uniqueHandle(base, selfId) {
  const b = slugify(base) || 'page';
  let h = b; let n = 2;
  while (getLandingPages().some((p) => p.id !== selfId && p.handle === h)) h = `${b}-${n++}`;
  return h;
}

/** A new page for a product (not saved until saveLandingPage). */
export function newLandingPage({ product, template = 'cod' }) {
  const now = demoNow();
  return {
    id: 'LP-' + now.toString(36).toUpperCase(), title: product.name, sku: product.sku || '', productId: product.id || '', productName: product.name,
    template, handle: uniqueHandle(product.name), lang: 'both', offerLine: '', status: 'draft', createdAt: now, updatedAt: now, publishedAt: null,
  };
}
/** Add or update a page (matched by id). Returns the stored page. */
export function saveLandingPage(p) {
  const rec = { ...p, updatedAt: demoNow() };
  // a live landing page that moved keeps its old address working
  const old = store().find((x) => x.id === rec.id);
  if (old && old.status === 'published' && old.handle && rec.handle && old.handle !== rec.handle) autoRedirect('/lp/' + old.handle, '/lp/' + rec.handle, 'Landing page address changed');
  write([rec, ...store().filter((x) => x.id !== rec.id)]);
  return rec;
}
export function publishLandingPage(id) {
  const p = store().find((x) => x.id === id);
  if (!p) return null;
  const err = handleProblem(p.handle, p.id);
  if (err) return { error: err };
  return saveLandingPage({ ...p, status: 'published', publishedAt: p.status === 'published' ? p.publishedAt : demoNow() });
}
export function unpublishLandingPage(id) {
  const p = store().find((x) => x.id === id);
  return p ? saveLandingPage({ ...p, status: 'draft' }) : null;
}
/** Copy a page as a new draft with its own link. */
export function duplicateLandingPage(id) {
  const p = store().find((x) => x.id === id);
  if (!p) return null;
  const now = demoNow();
  const copy = { ...p, id: 'LP-' + now.toString(36).toUpperCase(), title: p.title + ' (copy)', handle: uniqueHandle(p.handle + '-copy'), status: 'draft', createdAt: now, publishedAt: null, demo: false };
  return saveLandingPage(copy);
}
export function deleteLandingPages(ids) { const set = new Set([].concat(ids)); write(store().filter((p) => !set.has(p.id))); }

// ---- figures ------------------------------------------------------------------------------------------------------------
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const FROM_PAGE = ['Website', 'Order link'];
/** Orders, sales and visits of a page since it went live (see the note at the top). */
export function statsOf(p, orders = getOrders(), now = demoNow()) {
  if (!p.publishedAt) return { visits: 0, orders: 0, sales: 0, conversion: 0, live: false };
  const mine = orders.filter((o) => !isCounterSale(o) && o.at >= p.publishedAt && o.at <= now && FROM_PAGE.includes(o.source)
    && o.statusKey !== 'cancelled' && (o.lines || []).some((l) => l.sku === p.sku || l.name === p.productName));
  const days = Math.max(1, Math.round((Math.min(now, p.status === 'published' ? now : p.updatedAt) - p.publishedAt) / DAY));
  const h = hash(p.id);
  // a landing page converts 2–4% of its visits; the rest is the page's own traffic
  const visits = Math.round(mine.length * (28 + (h % 20)) + days * (35 + (h % 40)));
  const sales = mine.reduce((a, o) => a + (o.lines || []).filter((l) => l.sku === p.sku || l.name === p.productName).reduce((b, l) => b + l.price * l.qty, 0), 0);
  return { visits, orders: mine.length, sales, conversion: visits ? Math.round((mine.length / visits) * 1000) / 10 : 0, live: true };
}
