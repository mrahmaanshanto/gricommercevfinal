// storePages — the online store's own pages (Online Store › Pages): About us, Contact us, delivery and return
// policies, privacy, terms and any other page the shop writes. Content uses the blog's blocks (lib/blog.js), so the
// page editor reuses the blog's block editor and the storefront draws them the same way.
//
//   STATUSES            published (on the website) · draft (not finished) · hidden (kept, but off the website)
//   TEMPLATES           ready pages to start from; make() fills in the shop's phone, email and address from
//                       Settings › General and the privacy texts from Settings › Privacy & consent
//   getPages() · getPage(id) · pageByHandle(handle) · blankPage() · fromTemplate(id)
//   savePage(p) · setStatus(ids, status) · deletePages(ids) · duplicatePage(id)
//   uniqueHandle(base, list, selfId) · handleTaken(handle, list, selfId) · pageUrl(p) · storefrontHref(handle)
//   seoProblems(p) · STORE_PAGES_EVENT ('gc:store-pages')
//
// Front end only: kept in this browser (gc.storePages). The demo pages are dated from today (worked out in the
// browser, after mount), so "last edited" stays recent. On the live website these pages are served by the store's
// server (dazzleshop.com.bd/pages/<handle>); here /page?handle=<handle> shows them.

import { uid, slugify, newBlock } from './blog';
import { businessProfile } from './businessProfile';
import { currentVersion } from './consents';
import { autoRedirect } from './redirects';
import { deliveryTable } from './deliveryRates';

const KEY = 'gc.storePages';
export const STORE_PAGES_EVENT = 'gc:store-pages';
export const SITE = 'dazzleshop.com.bd';
export const PAGE_BASE = SITE + '/pages/';
const PAGE_PATH = '/pages/';

export const STATUSES = {
  published: { label: 'Published', tone: 'success', icon: 'check', help: 'On the website' },
  draft: { label: 'Draft', tone: 'neutral', icon: 'pencil-line', help: 'Not finished, not on the website' },
  hidden: { label: 'Hidden', tone: 'warning', icon: 'eye-off', help: 'Kept, but off the website' },
};

// old addresses Settings › Privacy used before these pages existed
const ALIASES = { privacy: 'privacy-policy', terms: 'terms-of-service', refund: 'return-refund', returns: 'return-refund', shipping: 'shipping-delivery', about: 'about-us', contact: 'contact-us' };

// ---- blocks ---------------------------------------------------------------------------------------
const P = (text) => ({ ...newBlock('p'), text });
const H = (text) => ({ ...newBlock('h2'), text });
const L = (items, ordered = false) => ({ ...newBlock('list'), items, ordered });
const T = (rows) => ({ ...newBlock('table'), header: true, rows });
const Q = (items) => ({ ...newBlock('faq'), items });
const B = (label, url) => ({ ...newBlock('cta'), label, url, style: 'solid' });

/** The shop's details for the templates (Settings › General). */
function shop() {
  let p = null;
  try { p = businessProfile(); } catch { p = null; }
  const c = (p && p.contact) || {};
  return {
    name: (p && p.brand && p.brand.name) || 'Dazzle Shop',
    legal: (p && p.legal && p.legal.name) || 'Dazzle Shop Ltd.',
    phone: c.phone || '+8801811843300',
    email: c.email || 'hello@dazzleshop.com.bd',
    address: c.address || 'House 42, Road 27, Dhanmondi, Dhaka 1209',
    hours: c.hours || 'Sat–Thu, 10:00 AM – 8:00 PM',
  };
}
const consent = (type) => { try { return currentVersion(type); } catch { return { v: 1, text: '' }; } };

// ---- templates --------------------------------------------------------------------------------------
export const TEMPLATES = [
  { id: 'blank', name: 'Blank page', icon: 'file', blurb: 'Start from an empty page.',
    make: () => ({ title: '', blocks: [P('')], seo: { title: '', description: '' } }) },
  { id: 'about', name: 'About us', icon: 'store', handle: 'about-us', blurb: 'Who you are and why people buy from you.',
    make: (s = shop()) => ({ title: 'About us', blocks: [
      P(`${s.name} sells original smartphones, accessories, audio and wearables, with official warranty and fast delivery across Bangladesh.`),
      H('Why shop with us'),
      L(['Only original, brand-warranted products', 'Cash on delivery all over Bangladesh', 'Easy 7-day returns', 'Repairs and warranty service at our branches']),
      H('Visit us'),
      P(`${s.address}. Open ${s.hours}.`),
      B('Shop now', '/'),
    ], seo: { title: `About ${s.name}`, description: `${s.name}: original phones and accessories with warranty, cash on delivery and easy returns across Bangladesh.` } }) },
  { id: 'contact', name: 'Contact us', icon: 'phone', handle: 'contact-us', blurb: 'Your phone, email, address and hours.',
    make: (s = shop()) => ({ title: 'Contact us', blocks: [
      P('Questions about an order, a product or a repair? We are happy to help.'),
      T([['How to reach us', ''], ['Phone', s.phone], ['Email', s.email], ['Address', s.address], ['Hours', s.hours]]),
      P(`For an order, keep your order number ready. You can also message us on Facebook or WhatsApp at ${s.phone}.`),
    ], seo: { title: `Contact ${s.name}`, description: `Call ${s.phone} or email ${s.email}. ${s.address}. Open ${s.hours}.` } }) },
  { id: 'shipping', name: 'Shipping & delivery', icon: 'truck', handle: 'shipping-delivery', blurb: 'Delivery areas, charges and times.',
    make: () => ({ title: 'Shipping & delivery', blocks: [
      P('We deliver all over Bangladesh through trusted couriers. You can pay cash on delivery.'),
      T([['Area', 'Charge', 'Time'], ...deliveryTable()]),   // Settings › Delivery's charges and times
      H('Good to know'),
      L(['We call to confirm every cash-on-delivery order before it ships.', 'You get an SMS with the tracking number when your parcel leaves.', 'Check the parcel in front of the rider before you pay.']),
    ], seo: { title: 'Shipping & delivery', description: 'Delivery charges and times inside Dhaka and across Bangladesh, with cash on delivery.' } }) },
  { id: 'returns', name: 'Return & refund', icon: 'undo-2', handle: 'return-refund', blurb: 'How customers return items and get money back.',
    make: (s = shop()) => ({ title: 'Return & refund', blocks: [
      P('Not happy with your item? You can return it within 7 days of delivery.'),
      H('What can be returned'),
      L(['Unused items in the original box, with all accessories', 'Items that arrived damaged or are not what you ordered', 'Phones only with the seal unbroken, unless faulty']),
      H('How refunds work'),
      L(['Call or message us with your order number.', 'We book a pickup or you bring it to a branch.', 'We check the item within 2 working days.', 'You get the money back by bKash, Nagad or bank, or as store credit.'], true),
      Q([{ q: 'Who pays the return delivery?', a: 'We do when the item is faulty or wrong. Otherwise the delivery charge is taken from the refund.' }, { q: 'How long does a refund take?', a: 'Up to 7 working days after we receive the item.' }]),
      P(`Questions: ${s.phone} · ${s.email}`),
    ], seo: { title: 'Return & refund policy', description: 'Return unused items within 7 days. Refunds by bKash, Nagad, bank or store credit after a quick check.' } }) },
  { id: 'privacy', name: 'Privacy policy', icon: 'shield', handle: 'privacy-policy', blurb: 'What you collect and why. Uses your texts from Settings › Privacy & consent.',
    make: (s = shop()) => {
      const mkt = consent('marketing'), ck = consent('cookies'), legal = consent('legal');
      return { title: 'Privacy policy', blocks: [
        P(`${s.legal} (“${s.name}”) runs this website. This page explains what we keep about you and why.`),
        H('What we collect'),
        L(['Your name, phone, email and delivery address, to deliver your orders', 'What you bought, to handle returns and warranty', 'Messages you send us, to answer you']),
        H('Marketing messages'),
        P(`We send offers only if you agreed at checkout. The text you saw: “${mkt.text}” (version ${mkt.v}). Order and delivery messages are sent either way.`),
        H('Cookies'),
        P(`${ck.text} (version ${ck.v})`),
        H('Your choices'),
        L(['Ask us for a copy of your data', 'Ask us to correct or delete it', 'Stop marketing messages at any time']),
        P(`At checkout you confirm: “${legal.text}” Contact us at ${s.email} or ${s.phone}.`),
      ], seo: { title: 'Privacy policy', description: `How ${s.name} uses your name, phone and address, what cookies we use and how to stop marketing messages.` } };
    } },
  { id: 'terms', name: 'Terms of service', icon: 'scale', handle: 'terms-of-service', blurb: 'The rules for buying from your store.',
    make: (s = shop()) => ({ title: 'Terms of service', blocks: [
      P(`By ordering from ${s.name} you agree to these terms.`),
      H('Orders and prices'),
      L(['Prices are in Bangladeshi Taka and include VAT.', 'We may call to confirm an order before it ships.', 'We may cancel an order if an item is out of stock or the price was wrong; you get any advance back.']),
      H('Payment'),
      P('Pay cash on delivery, by bKash, Nagad or card. Some items need an advance before they ship.'),
      H('Warranty and returns'),
      P('Warranty follows the brand or the shop warranty shown on each product. Returns follow our Return & refund page.'),
      P(`${s.legal} · ${s.address}`),
    ], seo: { title: 'Terms of service', description: `The terms for buying from ${s.name}: orders, prices, payment, warranty and returns.` } }) },
];
export const templateBy = (id) => TEMPLATES.find((t) => t.id === id) || null;

// ---- seed -----------------------------------------------------------------------------------------
const DAY = 864e5;
const ago = (days, h = 11, m = 0) => { const d = new Date(Date.now() - days * DAY); d.setHours(h, m, 0, 0); return d.toISOString(); };
function seed() {
  const s = shop();
  const mk = (tplId, status, created, edited, extra = {}) => {
    const t = templateBy(tplId);
    const body = t.make(s);
    return { id: 'pg-' + tplId, template: tplId, handle: t.handle, status, noindex: false, createdAt: ago(created), updatedAt: ago(edited, 15, 20), publishedAt: status === 'published' ? ago(created, 12) : null, ...body, ...extra };
  };
  return [
    mk('about', 'published', 210, 21),
    mk('contact', 'published', 210, 6),
    mk('shipping', 'published', 180, 12),
    mk('returns', 'published', 180, 3),
    mk('privacy', 'published', 95, 14),
    {
      id: 'pg-warranty', template: 'blank', handle: 'warranty-repairs', status: 'draft', noindex: false, createdAt: ago(2, 10), updatedAt: ago(1, 17, 40), publishedAt: null,
      title: 'Warranty & repairs',
      blocks: [P('Every phone we sell comes with the brand’s official warranty. Accessories have a 6-month shop warranty.'), H('Bring it to a branch'), L(['Dhanmondi branch', 'Mirpur branch']), P('Keep your invoice or order number. We check the item and tell you the cost before any paid repair.')],
      seo: { title: '', description: '' },
    },
  ];
}

// ---- storage --------------------------------------------------------------------------------------
let cache = { raw: undefined, list: null };
function read() {
  if (typeof window === 'undefined') return [];
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw === cache.raw && cache.list) return cache.list;
  let list = null;
  try { list = raw ? JSON.parse(raw) : null; } catch { list = null; }
  if (!Array.isArray(list)) list = seed();
  cache = { raw, list };
  return list;
}
function write(list) {
  try {
    const raw = JSON.stringify(list);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, list };
    window.dispatchEvent(new CustomEvent(STORE_PAGES_EVENT));
  } catch { /* ignore */ }
  return list;
}

/** A page scheduled to go live (goLiveAt, set in its SEO panel) is published once that time has passed. */
const due = (p) => (p && p.goLiveAt && p.status !== 'published' && new Date(p.goLiveAt).getTime() <= Date.now()
  ? { ...p, status: 'published', publishedAt: p.goLiveAt, goLiveAt: null, autoPublishedAt: p.goLiveAt } : p);
/** Every page, newest edit first. Empty on the server (pages are read after mount). */
export const getPages = () => read().map(due).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
export const getPage = (id) => due(read().find((p) => p.id === id) || null);
/** The page at an address (old Settings addresses like "privacy" still find theirs). */
export function pageByHandle(handle) {
  const h = String(handle || '').toLowerCase().replace(/^\/?(pages\/)?/, '');
  const list = read();
  return due(list.find((p) => p.handle === h) || list.find((p) => p.handle === ALIASES[h]) || null);
}
/** The handle a "/pages/x" or "/page?handle=x" address points to (aliases resolved). */
export function handleFromUrl(url) {
  const u = String(url || '').trim();
  const m = u.match(/[?&]handle=([^&#]+)/) || u.match(/\/pages\/([^/?#]+)/);
  if (!m) return '';
  const h = decodeURIComponent(m[1]).toLowerCase();
  return ALIASES[h] || h;
}

export function handleTaken(handle, list = read(), selfId) { return list.some((p) => p.id !== selfId && p.handle === handle); }
export function uniqueHandle(base, list = read(), selfId) {
  const root = slugify(base) || 'page';
  if (!handleTaken(root, list, selfId)) return root;
  let n = 2;
  while (handleTaken(`${root}-${n}`, list, selfId)) n++;
  return `${root}-${n}`;
}
/** The live address shown to the shop owner. */
export const pageUrl = (p) => PAGE_BASE + ((p && p.handle) || '…');
/** Where the storefront preview of a page opens in this app. */
export const storefrontHref = (handle, preview) => '/page?handle=' + encodeURIComponent(handle || '') + (preview ? '&preview=1' : '');

export function blankPage() {
  const now = new Date().toISOString();
  return { id: uid('pg-'), template: 'blank', handle: '', status: 'draft', noindex: false, createdAt: now, updatedAt: now, publishedAt: null, title: '', blocks: [P('')], seo: { title: '', description: '' } };
}
/** A new, unsaved page made from a template (its handle made unique). */
export function fromTemplate(id) {
  const t = templateBy(id);
  if (!t || t.id === 'blank') return blankPage();
  const body = t.make(shop());
  return { ...blankPage(), template: t.id, ...body, handle: uniqueHandle(t.handle || body.title) };
}
/** Insert or replace a page; sets updatedAt (and publishedAt the first time it goes live). */
export function savePage(p) {
  const list = read().slice();
  const now = new Date().toISOString();
  const saved = { ...p, updatedAt: now, publishedAt: p.status === 'published' ? (p.publishedAt || now) : p.publishedAt || null };
  const i = list.findIndex((x) => x.id === p.id);
  // a live page that moved keeps its old address working (Online Store › SEO › Redirects)
  if (i >= 0 && list[i].status === 'published' && list[i].handle && saved.handle && list[i].handle !== saved.handle) autoRedirect(PAGE_PATH + list[i].handle, PAGE_PATH + saved.handle, 'Page address changed');
  if (i >= 0) list[i] = saved; else list.unshift(saved);
  write(list);
  return saved;
}
export function setStatus(ids, status) {
  const set = new Set(ids);
  const now = new Date().toISOString();
  write(read().map((p) => (set.has(p.id) ? { ...p, status, updatedAt: now, publishedAt: status === 'published' ? (p.publishedAt || now) : p.publishedAt } : p)));
}
export function deletePages(ids) {
  const set = new Set(ids);
  write(read().filter((p) => !set.has(p.id)));
}
/** A copy saved as a draft ("Copy of …", its own address). Returns the copy. */
export function duplicatePage(id) {
  const src = getPage(id);
  if (!src) return null;
  const copy = JSON.parse(JSON.stringify(src));
  const now = new Date().toISOString();
  const title = 'Copy of ' + (src.title || 'untitled page');
  const out = { ...copy, id: uid('pg-'), title, handle: uniqueHandle(src.handle + '-copy'), status: 'draft', createdAt: now, publishedAt: null, blocks: copy.blocks.map((b) => ({ ...b, id: uid('b') })) };
  return savePage(out);
}
/** Put the demo pages back (drops changes made in this browser). */
export function resetPages() { try { window.localStorage.removeItem(KEY); } catch { /* ignore */ } cache = { raw: undefined, list: null }; write(seed()); }

/** What stops a page going live: [{ field, message }]. */
export function publishProblems(p) {
  const out = [];
  if (!String(p.title || '').trim()) out.push({ field: 'sp-title', message: 'Add a title.' });
  if (!String(p.handle || '').trim()) out.push({ field: 'sp-handle', message: 'Add a page address.' });
  const hasText = (p.blocks || []).some((b) => String(b.text || b.label || (b.items || []).join('') || (b.rows || []).flat().join('') || b.src || b.sku || '').trim());
  if (!hasText) out.push({ field: 'sp-content', message: 'Write some content.' });
  return out;
}
