// channels — Sales channels (product sync): Meta Commerce (the Facebook & Instagram catalog), Google Merchant Center
// (Google Shopping), WooCommerce and Shopify; and Google Business Profile (Search & Maps; its page is under Marketing).
// Every connection is made from Connections (src/lib/connections.js, /connections); this file keeps the product side. Front end only: there are no APIs here. Connections, syncs, statuses and
// problems are simulated in this browser (localStorage 'gc.channels') from the real product list (products.js + the
// stock catalogue), so names, SKUs, prices and stock match Products.
//
//   CHANNELS / channelBy(key)        the three channels: name, plain sub-line, logo, page
//   STATUS                           the one list of status words and badge tones (Synced, Needs attention, Failed,
//                                    Processing, Not published, Approved, Limited, Disapproved)
//   ISSUES                           every problem in plain words: what is wrong, the fix, and the technical detail
//                                    (shown only under "Technical details")
//   getChannels()                    connections, settings and Google Business data
//   channelProducts(ch)              every product with its status on Meta ('meta') or Google ('gmc')
//   getIssues()                      open and resolved problems on all channels (Sync issues, Overview, product page)
//   startSync / syncJob / lastResult a sync runs for a few seconds (progress follows the clock) and then lands
//   retryItem / fixItem / setPublished / connect / disconnect / setAuto / saveSettings
//   Google Business: gbpLocations, getReviews, saveReply, aiReply, getPosts, savePost, deletePost, getInfo, saveInfo,
//                    confirmHours, getMedia, addMedia, removeMedia, getServices, saveService, removeService
// Everything that changes fires CHANNELS_EVENT. `?sync=failed` on a page makes the next sync fail (to see that state).

import { allProducts, getSavedProducts, saveProduct } from './products';
import { CATALOG } from './stock';
import { getPlaces } from './locations';
import { isOnePlace } from './stockSetup';

export const CHANNELS_EVENT = 'gc:channels';
const KEY = 'gc.channels';
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/** The app's clock (the evening check's test offset moves it too). */
export const nowMs = () => { try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); } };

const META_LOGO = '/assets/41f77fbf774c3a1c10208ca2b086bc14.png';
const GOOGLE_LOGO = '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png';

export const CHANNELS = [
  { key: 'meta', name: 'Meta Commerce', short: 'Meta', sub: 'Facebook & Instagram', logo: META_LOGO, mark: 'facebook', page: '/meta-commerce', company: 'Meta', icon: 'store',
    empty: { title: 'Sell across Facebook and Instagram', body: 'Connect your Meta account to keep your products, prices and inventory synced.', action: 'Connect Meta' } },
  { key: 'gmc', name: 'Google Merchant Center', short: 'Google Merchant', sub: 'Google Shopping', logo: GOOGLE_LOGO, mark: 'shopping-bag', page: '/google-merchant', company: 'Google', icon: 'shopping-bag',
    empty: { title: 'Show your products on Google', body: 'Connect Google Merchant Center so your products appear in Google Search and the Shopping tab.', action: 'Connect Google Merchant' } },
  { key: 'woo', name: 'WooCommerce', short: 'WooCommerce', sub: 'Your WordPress store', brand: 'woocommerce', mark: 'shopping-cart', page: '/woocommerce', company: 'WooCommerce', icon: 'shopping-cart', settings: '/woo-sync',
    empty: { title: 'Sell on your WordPress store', body: 'Connect WooCommerce to send your products, prices and stock to your WordPress shop, and bring its orders here.', action: 'Connect WooCommerce' } },
  { key: 'shopify', name: 'Shopify', short: 'Shopify', sub: 'Your Shopify store', brand: 'shopify', mark: 'shopping-bag', page: '/shopify', company: 'Shopify', icon: 'shopping-bag',
    empty: { title: 'Sell on your Shopify store', body: 'Connect Shopify to keep its products, prices and stock the same as here, and bring its orders into Orders.', action: 'Connect Shopify' } },
  { key: 'gbp', name: 'Google Business', short: 'Google Business', sub: 'Google Search & Maps', logo: '/assets/brands/google-business.png', mark: 'map-pin', page: '/google-business', company: 'Google', icon: 'map-pin',
    empty: { title: 'Manage your Google Business Profile', body: 'Connect Google Business to keep your shop’s hours, photos and reviews up to date on Search and Maps.', action: 'Connect Google Business' } },
];
export const channelBy = (k) => CHANNELS.find((c) => c.key === k) || null;
/** The Connections app of each channel, and the address that connects it (the one connect flow). */
export const APP_OF = { meta: 'meta-catalog', gmc: 'gmc', woo: 'woocommerce', shopify: 'shopify', gbp: 'gbp' };
export const connectHref = (ch) => '/connect?app=' + (APP_OF[ch] || ch);
/** The channels that carry products (Sales channels › product sync). */
export const PRODUCT_CHS = ['meta', 'gmc', 'woo', 'shopify'];
export const PRODUCT_CHANNELS = CHANNELS.filter((c) => PRODUCT_CHS.includes(c.key));
/** The word for a product that is fine on a channel. */
const okOf = (ch) => (ch === 'gmc' ? 'approved' : 'synced');

/** Status words and badge tones (StatusBadge). One list, used by every Channels page and the product page. */
export const STATUS = {
  synced: { label: 'Synced', tone: 'success', icon: 'check' },
  approved: { label: 'Approved', tone: 'success', icon: 'check' },
  attention: { label: 'Needs attention', tone: 'warning', icon: 'triangle-alert' },
  limited: { label: 'Limited', tone: 'warning', icon: 'eye-off' },
  failed: { label: 'Failed', tone: 'error', icon: 'circle-x' },
  disapproved: { label: 'Disapproved', tone: 'error', icon: 'circle-x' },
  processing: { label: 'Processing', tone: 'info', icon: 'loader' },
  unpublished: { label: 'Not published', tone: 'neutral', icon: 'minus' },
  resolved: { label: 'Resolved', tone: 'success', icon: 'check' },
  verified: { label: 'Verified', tone: 'success', icon: 'badge-check' },
};
export const isOk = (st) => st === 'synced' || st === 'approved';

/**
 * Problems in plain words. kind 'retry': a try again may solve it (shown as Failed); kind 'fix': the merchant must
 * change something (Needs attention); `field` is what the Fix panel asks for; `tech` stays under "Technical details".
 */
export const ISSUES = {
  'meta-image': { ch: 'meta', st: 'failed', kind: 'retry', title: 'Image could not sync', hint: 'Meta could not download the photo.', fix: 'Retry. If it fails again, upload the photo again.', tech: { code: 'IMAGE_FETCH_FAILED', field: 'image_link', msg: 'HTTP 404 while downloading the image from the product URL.' } },
  'meta-nophoto': { ch: 'meta', st: 'attention', kind: 'fix', field: 'photo', title: 'Photo missing', hint: 'Meta does not show products without a photo.', fix: 'Add at least one photo to the product.', tech: { code: 'MISSING_IMAGE', field: 'image_link', msg: 'Required field image_link is empty.' } },
  'meta-nosku': { ch: 'meta', st: 'attention', kind: 'fix', field: 'sku', title: 'SKU missing', hint: 'Meta needs a SKU to tell this product apart.', fix: 'Add a SKU to the product.', tech: { code: 'MISSING_RETAILER_ID', field: 'retailer_id', msg: 'Required field retailer_id (id) is empty.' } },
  'gmc-gtin': { ch: 'gmc', st: 'limited', kind: 'fix', field: 'barcode', title: 'Missing GTIN', hint: 'Add a barcode to improve product eligibility.', fix: 'Add the barcode (GTIN) printed on the pack.', tech: { code: 'missing_gtin', field: 'gtin', msg: 'Limited performance due to missing value [gtin].' } },
  'gmc-nophoto': { ch: 'gmc', st: 'disapproved', kind: 'fix', field: 'photo', title: 'Photo missing', hint: 'Google does not show products without a photo.', fix: 'Add a clear photo of the product.', tech: { code: 'image_link_missing', field: 'image_link', msg: 'Missing value [image_link].' } },
  'gmc-small': { ch: 'gmc', st: 'disapproved', kind: 'fix', field: 'photo', title: 'Image too small', hint: 'Google needs a photo at least 100 × 100 pixels.', fix: 'Upload a bigger photo (800 × 800 is best).', tech: { code: 'image_too_small', field: 'image_link', msg: 'Image too small [image_link]: 64 × 64 px.' } },
  'gmc-price': { ch: 'gmc', st: 'disapproved', kind: 'retry', title: 'Price doesn’t match your website', hint: 'Google saw a different price on your product page.', fix: 'Retry to send the latest price.', tech: { code: 'price_mismatch', field: 'price', msg: 'Mismatched value (page crawl) [price]: 2,750.00 BDT on landing page.' } },
  'gmc-shipping': { ch: 'gmc', st: 'disapproved', kind: 'fix', field: 'shipping', title: 'Delivery charge missing', hint: 'Google needs a delivery charge for this weight.', fix: 'Set delivery charges for items over 2 kg.', tech: { code: 'missing_shipping', field: 'shipping', msg: 'Missing value [shipping] for country BD, weight 2.1 kg.' } },
  'woo-sku': { ch: 'woo', st: 'attention', kind: 'fix', field: 'sku', title: 'SKU already used on your website', hint: 'Another product on your WordPress store has this SKU.', fix: 'Give this product its own SKU.', tech: { code: 'product_invalid_sku', field: 'sku', msg: 'Invalid or duplicated SKU (WooCommerce REST API, 400).' } },
  'woo-image': { ch: 'woo', st: 'failed', kind: 'retry', title: 'Image could not sync', hint: 'Your WordPress store could not download the photo.', fix: 'Retry. If it fails again, check the store is online.', tech: { code: 'woocommerce_product_image_upload_error', field: 'images', msg: 'Error getting remote image (timeout after 15 s).' } },
  'shopify-weight': { ch: 'shopify', st: 'attention', kind: 'fix', field: 'weight', title: 'Weight missing', hint: 'Shopify needs the weight to work out delivery charges.', fix: 'Add the weight of one piece.', tech: { code: 'INVALID_WEIGHT', field: 'variants.weight', msg: 'Weight must be greater than 0 for shippable variants.' } },
  'shopify-image': { ch: 'shopify', st: 'failed', kind: 'retry', title: 'Image could not sync', hint: 'Shopify could not download the photo.', fix: 'Retry. If it fails again, upload the photo again.', tech: { code: 'IMAGE_DOWNLOAD_FAILURE', field: 'images.src', msg: 'Image download failed (HTTP 503).' } },
  'gbp-hours': { ch: 'gbp', st: 'attention', kind: 'fix', field: 'hours', title: 'Opening hours need confirmation', hint: 'Google asked you to check your hours.', fix: 'Confirm the hours, or change them.', tech: { code: 'HOURS_CONFIRMATION_REQUESTED', field: 'regularHours', msg: 'Location has pending hours verification.' } },
};
/** What the Fix panel asks for. */
export const FIX_FIELDS = {
  barcode: { label: 'Barcode (GTIN)', help: '8 to 14 digits, from the pack.', placeholder: 'e.g. 8941100100073', test: (v) => /^\d{8,14}$/.test(String(v).trim()), err: 'Enter 8 to 14 digits.' },
  sku: { label: 'SKU', help: 'Your own code for this product. Letters, numbers and dashes.', placeholder: 'e.g. CL-GMC-01', test: (v) => /^[A-Za-z0-9-]{3,24}$/.test(String(v).trim()), err: 'Use 3 to 24 letters, numbers or dashes.' },
  photo: { label: 'Photo', help: 'JPG or PNG, at least 800 × 800 for the best result.' },
  weight: { label: 'Weight of one piece (kg)', help: 'For example 0.5 for half a kilo.', placeholder: 'e.g. 1.2', test: (v) => Number(v) > 0 && Number(v) < 1000, err: 'Enter the weight in kg, more than 0.' },
};

// ---- stored state ----------------------------------------------------------------------------------------
function read() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem(KEY)) || null; } catch { return null; }
}
function write(s, quiet) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* full: keep going */ }
  if (!quiet) { try { window.dispatchEvent(new CustomEvent(CHANNELS_EVENT)); } catch { /* ignore */ } }
}

export const DEFAULT_SETTINGS = {
  auto: true, products: true, inventory: true, prices: true, images: true,
  notify: { app: true, email: true, sms: false },
  every: '15', variants: 'each', hideOutOfStock: false, tech: false,
};

function seed(now) {
  return {
    v: 2,
    seededAt: now,
    conn: {
      meta: { business: 'GridShop BD', catalog: 'GridShop · Main catalog', catalogId: '1048227199340', account: 'Mehedi Hasan', at: now - 52 * DAY, lastSync: now - 12 * MIN, auto: true, what: { products: true, inventory: true, prices: true, images: true } },
      gmc: { account: 'GridShop BD', merchantId: '5123498722', website: 'gridshop.com.bd', at: now - 40 * DAY, lastSync: now - 35 * MIN, auto: true, what: { products: true, inventory: true, prices: true, images: true } },
      woo: { store: 'gridshop-bd.com', account: 'GridShop BD', version: 'WooCommerce 9.3', at: now - 75 * DAY, lastSync: now - 20 * MIN, auto: true, what: { products: true, inventory: true, prices: true, images: true, orders: true } },
      shopify: null,
      gbp: { account: 'GridShop BD', at: now - 120 * DAY, lastSync: now - 2 * HOUR, auto: true, what: { info: true, hours: true, reviews: true, posts: true } },
    },
    items: { meta: {}, gmc: {}, woo: {}, shopify: {} },
    fixes: {},
    jobs: {},
    results: {},
    settings: DEFAULT_SETTINGS,
    resolved: [
      { id: 'r1', ch: 'gmc', key: 'GR-DAL-1', name: 'Chickpeas Boot Dal 1kg', issue: 'gmc-gtin', at: now - 26 * HOUR, how: 'Barcode added' },
      { id: 'r2', ch: 'meta', key: 'HM-BTL-750', name: 'Steel Water Bottle 750ml', issue: 'meta-image', at: now - 2 * DAY, how: 'Retried' },
    ],
    gbp: { replies: {}, info: {}, confirmed: {}, posts: null, media: {}, services: null },
  };
}

let mem = null;
/** The whole stored state (seeded on first use). */
function state() {
  const now = nowMs();
  let s = read();
  if (s && s.v === 1) {
    // v2 adds WooCommerce (connected) and Shopify (not yet) as product channels
    const fresh = seed(now);
    s = { ...s, v: 2, conn: { ...s.conn, woo: fresh.conn.woo, shopify: null }, items: { ...s.items, woo: {}, shopify: {} } };
    write(s, true);
  }
  if (!s || s.v !== 2) { s = seed(now); write(s, true); }
  mem = s;
  return s;
}
function save(mut) { const s = state(); mut(s); write(s); return s; }

// ---- products on the channels ------------------------------------------------------------------------------
// base status per channel by SKU (the demo shop's real picture); everything else is synced / approved
const BASE = {
  meta: { 'EL-EAR-PRO': 'meta-image', 'CL-SNK-42': 'meta-image', 'CL-KRT-01': 'meta-nophoto', 'GR-ATTA-2': 'unpublished', 'GR-MUS-1': 'unpublished' },
  gmc: { 'GR-MSR-1': 'gmc-gtin', 'CL-KRT-01': 'gmc-nophoto', 'CL-LEG-CL': 'gmc-small', 'HM-RCK-18': 'gmc-price', 'GR-SOY-2': 'gmc-shipping', 'GR-ATTA-2': 'unpublished' },
  woo: { 'CL-TEE-BM': 'woo-sku', 'HM-BTL-750': 'woo-image', 'GR-ATTA-2': 'unpublished', 'GR-MUS-1': 'unpublished' },
  shopify: { 'GR-RICE-5': 'shopify-weight', 'EL-PHN-128': 'shopify-image' },
};
// products that were just changed: shown as Processing for a while after the first visit
const BASE_PROCESSING = { meta: { 'CL-JNS-32': 40 * MIN }, gmc: { 'CL-TEE-BM': 3 * HOUR }, woo: {}, shopify: {} };

const keyOf = (p) => p.sku || p.id;
const sumOn = (on) => Object.values(on || {}).reduce((a, x) => a + (Number(x) || 0), 0);

/** Every product a channel can carry: active and draft products with a retail price, from Products and the catalogue. */
export function channelUniverse() {
  const list = allProducts(getSavedProducts()).filter((p) => p.st !== 'deleted' && p.st !== 'archived' && p.sell !== 'wholesale');
  const skus = new Set(list.map((p) => p.sku).filter(Boolean));
  const rows = list.map((p) => ({ key: keyOf(p), id: p.id, sku: p.sku || '', barcode: p.barcode || '', name: p.name, cat: p.cat || '', brand: p.brand || '', price: p.price, mrp: p.mrp || null, stock: Number(p.inv) || 0, draft: p.st === 'draft', tbg: p.tbg, variants: (p.variants || []).length, noPhoto: (p.flags || []).includes('No photo'), inList: true }));
  CATALOG.filter((c) => !skus.has(c.sku) && c.sell !== 'wholesale').forEach((c) => rows.push({ key: c.sku, id: 'cat-' + c.sku, sku: c.sku, barcode: c.barcode || '', name: c.name, cat: c.cat, brand: '', price: c.price, mrp: null, stock: sumOn(c.on), draft: false, tbg: '#eef2f6', variants: 0, noPhoto: false, inList: false }));
  return rows;
}

/** Land everything whose time has come: processing items, finished syncs. Called by every reader. */
function settle(s, now) {
  let changed = false;
  PRODUCT_CHS.forEach((ch) => {
    const items = s.items[ch] || {};
    Object.keys(items).forEach((k) => {
      const it = items[k];
      if (it.st === 'processing' && it.until && it.until <= now) {
        it.st = it.then || okOf(ch);
        it.at = it.until;
        if (isOk(it.st) && it.was) s.resolved.unshift({ id: 'r' + now.toString(36) + k, ch, key: k, name: it.name || k, issue: it.was, at: it.until, how: it.how || 'Retried' });
        delete it.until; delete it.then; delete it.was; delete it.how;
        changed = true;
      }
    });
  });
  Object.keys(s.jobs || {}).forEach((ch) => {
    const j = s.jobs[ch];
    if (!j || now < j.startedAt + j.dur) return;
    if (s.conn[ch]) {
      if (j.fail) s.results[ch] = { at: j.startedAt + j.dur, failed: true, total: j.total };
      else {
        s.conn[ch].lastSync = j.startedAt + j.dur;
        // what is still wrong after the sync
        const rows = ch === 'gbp' ? [] : productsOn(s, ch, j.startedAt + j.dur);
        const bad = rows.filter((r) => r.st !== 'unpublished' && !isOk(r.st) && r.st !== 'processing').length;
        const proc = rows.filter((r) => r.st === 'processing').length;
        s.results[ch] = { at: j.startedAt + j.dur, total: j.total, bad, processing: proc, first: !!j.first };
      }
    }
    delete s.jobs[ch];
    changed = true;
  });
  if (s.resolved.length > 40) s.resolved.length = 40;
  return changed;
}

function productsOn(s, ch, now) {
  const items = s.items[ch] || {};
  const conn = s.conn[ch];
  const fixes = s.fixes || {};
  return channelUniverse().map((p) => {
    const it = items[p.key] || {};
    let st; let issue = null;
    if (p.draft) st = 'unpublished';
    else if (it.removed) st = 'unpublished';
    else {
      const base = BASE[ch][p.key] || (ch === 'meta' && !p.sku ? 'meta-nosku' : ch === 'gmc' && !p.barcode ? 'gmc-gtin' : null);
      const fixedBy = base && ISSUES[base] && ISSUES[base].field ? (fixes[p.key] || {})[ISSUES[base].field] : null;
      const added = it.added;                                 // published by the merchant after being off
      if (base === 'unpublished' && !added) st = 'unpublished';
      else if (base && base !== 'unpublished' && !fixedBy && !it.cleared) { issue = base; st = ISSUES[base].st; }
      else st = okOf(ch);
      // a product changed recently is still being processed on the first visit
      const bp = BASE_PROCESSING[ch][p.key];
      if (bp && !it.seen && conn && (s.seededAt || 0) + bp > now) st = 'processing';
    }
    if (it.st === 'processing' && it.until > now) { st = 'processing'; }
    else if (it.st && !it.removed && it.st !== 'processing' && it.final) st = it.st;
    const at = it.at || (conn ? conn.lastSync : null) || null;
    return { ...p, ch, st, issue: st === 'processing' || isOk(st) || st === 'unpublished' ? null : issue, at, until: it.until || null, why: p.draft ? 'Draft products are not sent.' : it.removed ? 'Removed from ' + channelBy(ch).short + '.' : (BASE[ch][p.key] === 'unpublished' && !it.added) ? 'Not added yet.' : '' };
  });
}

/** Every product with its status on a channel ('meta' | 'gmc'). */
export function channelProducts(ch) {
  const s = state();
  const now = nowMs();
  if (settle(s, now)) write(s, true);
  return productsOn(s, ch, now);
}

/** One product's status on both product channels (product page, product list). */
export function productChannels(key) {
  return Object.fromEntries(PRODUCT_CHS.map((ch) => [ch, channelProducts(ch).find((r) => r.key === key) || null]));
}
/** Status of every product on both channels, by key (one pass, for the product list). */
export function channelMap() {
  const out = {};
  const conn = state().conn;
  PRODUCT_CHS.filter((ch) => conn[ch]).forEach((ch) => channelProducts(ch).forEach((r) => { (out[r.key] = out[r.key] || {})[ch] = r; }));
  return out;
}

// ---- connections, syncs ------------------------------------------------------------------------------------
/** Connections, settings, running syncs and their last results. */
export function getChannels() {
  const s = state();
  const now = nowMs();
  if (settle(s, now)) write(s, true);
  return { conn: s.conn, settings: { ...DEFAULT_SETTINGS, ...s.settings, notify: { ...DEFAULT_SETTINGS.notify, ...(s.settings || {}).notify } }, jobs: s.jobs, results: s.results, now };
}
export const isConnected = (ch) => !!getChannels().conn[ch];

const syncSize = (ch) => (ch === 'gbp' ? gbpLocations().length * 6 : channelProducts(ch).filter((r) => r.st !== 'unpublished').length);
/** Start a sync (or the first sync after connecting). Returns the job. */
export function startSync(ch, { first = false } = {}) {
  const now = nowMs();
  let fail = false;
  try { fail = new URLSearchParams(window.location.search).get('sync') === 'failed' || window.navigator.onLine === false; } catch { /* ignore */ }
  const total = Math.max(1, syncSize(ch));
  const dur = Math.min(7000, Math.max(3200, total * 220));
  let job = null;
  save((s) => {
    if (!s.conn[ch]) return;
    job = { startedAt: now, total, dur, first, fail };
    s.jobs[ch] = job;
    delete s.results[ch];
    // items waiting on a retry land with this sync
    const items = s.items[ch] || {};
    Object.values(items).forEach((it) => { if (it.st === 'processing' && it.until > now + dur) it.until = now + dur; });
  });
  return job;
}
/** The running sync: { running, done, total, pct, left } or null. */
export function syncJob(ch, ch0 = getChannels()) {
  const j = ch0.jobs[ch];
  if (!j) return null;
  const t = Math.min(1, (ch0.now - j.startedAt) / j.dur);
  // a little slower at the start (connecting), steady after
  const eased = t < 0.12 ? t * 0.5 : 0.06 + (t - 0.12) * (0.94 / 0.88);
  const done = Math.min(j.total, Math.floor(eased * j.total));
  return { running: true, done, total: j.total, pct: Math.round(eased * 100), phase: t < 0.12 ? 'connecting' : 'syncing', first: j.first };
}
export const lastResult = (ch, ch0 = getChannels()) => ch0.results[ch] || null;
export function dismissResult(ch) { save((s) => { delete s.results[ch]; }); }

export function setAuto(ch, on) { save((s) => { if (s.conn[ch]) s.conn[ch].auto = !!on; }); }
export function saveSettings(patch) { save((s) => { s.settings = { ...DEFAULT_SETTINGS, ...s.settings, ...patch, notify: { ...DEFAULT_SETTINGS.notify, ...(s.settings || {}).notify, ...(patch.notify || {}) } }; }); }

/** Connect a channel (the wizard's answers) and start the first sync. */
export function connect(ch, info) {
  const now = nowMs();
  save((s) => {
    s.conn[ch] = { ...info, at: now, lastSync: null, auto: true };
    s.items[ch] = s.items[ch] || {};
    delete s.results[ch];
  });
  return startSync(ch, { first: true });
}
export function disconnect(ch) {
  save((s) => { s.conn[ch] = null; delete s.jobs[ch]; delete s.results[ch]; if (s.items[ch]) s.items[ch] = {}; });
}

// ---- product actions ---------------------------------------------------------------------------------------
const nameOf = (key) => (channelUniverse().find((p) => p.key === key) || {}).name || key;
/** Try again: the item goes to Processing and lands a few seconds later. A 'fix' problem stays until it is fixed. */
export function retryItem(ch, key) {
  const row = channelProducts(ch).find((r) => r.key === key);
  if (!row) return;
  const now = nowMs();
  const issue = row.issue && ISSUES[row.issue];
  const solves = !issue || issue.kind === 'retry';
  save((s) => {
    const it = (s.items[ch] = s.items[ch] || {})[key] = { ...(s.items[ch] || {})[key], seen: true };
    it.st = 'processing'; it.until = now + 3500 + Math.round(Math.random() * 1500); it.name = row.name;
    if (solves) { it.then = okOf(ch); it.cleared = true; it.was = row.issue || null; it.how = 'Retried'; it.final = true; }
    else { it.then = issue.st; it.final = false; }
  });
}
export function retryMany(list) { list.forEach(([ch, key]) => retryItem(ch, key)); }

/** Fix a product: save the missing value (barcode, SKU, photo) and send it again on every channel that needed it. */
export function fixItem(key, field, value) {
  const now = nowMs();
  const p = channelUniverse().find((x) => x.key === key);
  if (p && p.inList && (field === 'barcode' || field === 'sku')) {
    const prod = allProducts(getSavedProducts()).find((x) => x.id === p.id);
    if (prod) saveProduct({ ...prod, [field]: String(value).trim() });
  }
  const before = Object.fromEntries(PRODUCT_CHS.map((ch) => [ch, channelProducts(ch).find((r) => r.key === key)]));
  save((s) => {
    s.fixes[key] = { ...(s.fixes[key] || {}), [field]: field === 'photo' ? true : String(value).trim() };
    if (field === 'photo' && value) s.fixes[key].photoUrl = value;
    PRODUCT_CHS.forEach((ch) => {
      const r = before[ch];
      if (!r || !r.issue || ISSUES[r.issue].field !== field) return;
      const it = (s.items[ch] = s.items[ch] || {})[key] = { ...(s.items[ch] || {})[key], seen: true };
      it.st = 'processing'; it.until = now + 4000 + Math.round(Math.random() * 2000); it.then = okOf(ch); it.final = true;
      it.cleared = true; it.was = r.issue; it.name = r.name; it.how = field === 'photo' ? 'Photo added' : field === 'barcode' ? 'Barcode added' : field === 'weight' ? 'Weight added' : 'SKU added';
    });
  });
  // a product that only lived in the catalogue keeps its new key under the old one (the SKU did not change there)
  return nameOf(key);
}
export const photoOf = (key) => { const s = state(); return ((s.fixes || {})[key] || {}).photoUrl || null; };

/** Publish to / remove from a channel. */
export function setPublished(ch, keys, on) {
  const now = nowMs();
  const rows = channelProducts(ch);
  let n = 0;
  save((s) => {
    keys.forEach((key) => {
      const r = rows.find((x) => x.key === key);
      if (!r || r.draft) return;
      const it = (s.items[ch] = s.items[ch] || {})[key] = { ...(s.items[ch] || {})[key], seen: true };
      if (on) {
        if (r.st !== 'unpublished') return;
        it.removed = false; it.added = true; it.st = 'processing'; it.until = now + 3000 + Math.round(Math.random() * 1500); it.final = false; it.name = r.name;
        it.then = null;
        n += 1;
      } else {
        if (r.st === 'unpublished') return;
        it.removed = true; it.st = null; it.until = null; it.final = false;
        n += 1;
      }
    });
  });
  return n;
}

// ---- problems ----------------------------------------------------------------------------------------------
/**
 * Open problems and resolved ones, newest first:
 * { id, ch, key, name, issue (ISSUES key), st ('attention' | 'failed' | 'processing' | 'resolved'), at, sku, how }
 */
export function getIssues() {
  const c = getChannels();
  const out = [];
  PRODUCT_CHS.forEach((ch) => {
    if (!c.conn[ch]) return;
    channelProducts(ch).forEach((r) => {
      if (r.st === 'processing' && r.until) out.push({ id: ch + ':' + r.key, ch, key: r.key, name: r.name, sku: r.sku, issue: null, st: 'processing', at: r.until - 4000 });
      else if (r.issue) out.push({ id: ch + ':' + r.key, ch, key: r.key, name: r.name, sku: r.sku, issue: r.issue, st: ISSUES[r.issue].kind === 'retry' ? 'failed' : 'attention', at: (r.at || c.now) - attemptAge(r.key) });
    });
  });
  const s = state();
  s.resolved.filter((r) => PRODUCT_CHS.includes(r.ch)).forEach((r) => out.push({ id: 'res:' + r.id, ch: r.ch, key: r.key, name: r.name, sku: '', issue: r.issue, st: 'resolved', at: r.at, how: r.how }));
  return out.sort((a, b) => (a.st === 'resolved') - (b.st === 'resolved') || b.at - a.at);
}
// spread the "last attempt" times a little so the list reads naturally
const attemptAge = (key) => (String(key).split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % 9) * 60 * 1000;

/** Counts for the health view: { synced|approved, attention, failed, processing, unpublished, limited, disapproved, total }. */
export function healthOf(ch) {
  const rows = channelProducts(ch);
  const n = (st) => rows.filter((r) => r.st === st).length;
  return { total: rows.length, synced: n('synced'), approved: n('approved'), attention: n('attention'), failed: n('failed'), processing: n('processing'), unpublished: n('unpublished'), limited: n('limited'), disapproved: n('disapproved') };
}

// ---- Google Business ---------------------------------------------------------------------------------------
const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']];
export const WEEK = DAYS;
const hoursFrom = (from, to, closed = ['fri']) => Object.fromEntries(DAYS.map(([d]) => [d, closed.includes(d) ? { open: false, from, to } : { open: true, from, to }]));

/** The shop's places on Google: its branches (a shop with many places) or one profile (an online-only shop). */
export function gbpLocations() {
  const s = state();
  const confirmed = (s.gbp || {}).confirmed || {};
  let list;
  if (isOnePlace()) {
    list = [{ id: 'on', name: 'GridShop', area: 'Tejgaon, Dhaka', address: 'Plot 12, Tejgaon I/A, Dhaka (hidden — you deliver to customers)', serviceArea: 'Delivers across Dhaka, Gazipur and Narayanganj', phone: '09610-XX0400', hours: hoursFrom('10:00', '20:00', []), st: 'attention', rating: 4.5, reviews: 214 }];
  } else {
    const by = (id) => getPlaces({ all: true }).find((p) => p.id === id) || {};
    list = [
      { id: 'dh', name: 'GridShop Dhanmondi', area: 'Dhanmondi, Dhaka', address: by('dh').address || 'House 42, Road 27, Dhanmondi, Dhaka', phone: by('dh').phone || '01712-XX4410', hours: hoursFrom('10:00', '22:00'), st: 'verified', rating: 4.6, reviews: 128 },
      { id: 'mp', name: 'GridShop Mirpur', area: 'Mirpur, Dhaka', address: by('mp').address || 'Plot 8, Section 10, Mirpur, Dhaka', phone: by('mp').phone || '01715-XX6630', hours: hoursFrom('10:00', '21:00'), st: 'verified', rating: 4.4, reviews: 86 },
      { id: 'gl', name: 'GridShop Gulshan', area: 'Gulshan, Dhaka', address: by('gl').address || 'Road 11, Gulshan-1, Dhaka', phone: by('gl').phone || '01713-XX2215', hours: hoursFrom('11:00', '21:00'), st: 'attention', rating: 4.7, reviews: 41 },
    ];
  }
  const info = (s.gbp || {}).info || {};
  return list.map((l) => {
    const saved = info[l.id] || {};
    const st = l.st === 'attention' && confirmed[l.id] ? 'verified' : l.st;
    return { ...l, ...pick(saved, ['name', 'phone', 'address', 'hours']), st, reason: st === 'attention' ? 'gbp-hours' : null };
  });
}
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] != null && o[k] !== '').map((k) => [k, o[k]]));
export const gbpLocation = (id) => gbpLocations().find((l) => l.id === id) || null;

/** "Open now · Closes 10:00 PM" for a location at the app's clock. */
export function openNow(loc, now = nowMs()) {
  const d = new Date(now);
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];
  const h = loc.hours[day];
  const mins = d.getHours() * 60 + d.getMinutes();
  const toMin = (t) => { const [a, b] = String(t).split(':').map(Number); return a * 60 + (b || 0); };
  if (h && h.open && mins >= toMin(h.from) && mins < toMin(h.to)) return { open: true, text: 'Open now', sub: 'Closes ' + time12(h.to) };
  // next opening
  for (let i = 0; i < 7; i++) {
    const di = (d.getDay() + i) % 7;
    const dk = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][di];
    const x = loc.hours[dk];
    if (!x || !x.open) continue;
    if (i === 0 && mins >= toMin(x.from)) continue;
    return { open: false, text: 'Closed now', sub: 'Opens ' + (i === 0 ? '' : i === 1 ? 'tomorrow ' : DAYS.find((q) => q[0] === dk)[1] + ' ') + time12(x.from) };
  }
  return { open: false, text: 'Closed', sub: '' };
}
export function time12(t) {
  const [h, m] = String(t).split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m || 0).padStart(2, '0')} ${ap}`;
}
export function confirmHours(id) {
  save((s) => {
    s.gbp.confirmed = { ...(s.gbp.confirmed || {}), [id]: true };
    const l = gbpLocationsRaw(id);
    s.resolved.unshift({ id: 'r' + nowMs().toString(36), ch: 'gbp', key: id, name: l ? l.name : id, issue: 'gbp-hours', at: nowMs(), how: 'Hours confirmed' });
  });
}
const gbpLocationsRaw = (id) => gbpLocations().find((l) => l.id === id);

// business info, per location
const CATEGORY = 'Department store';
export const CATEGORIES = ['Department store', 'Clothing store', 'Grocery store', 'Cosmetics store', 'Electronics store', 'Shoe store', 'Gift shop', 'Online shop'];
export const ATTRIBUTES = [
  ['delivery', 'Home delivery'], ['cod', 'Cash on delivery'], ['pickup', 'In-store pickup'], ['bkash', 'Pays by bKash'], ['cards', 'Takes debit and credit cards'],
  ['wheelchair', 'Wheelchair-accessible entrance'], ['parking', 'Parking'], ['wifi', 'Free Wi-Fi'], ['women', 'Women-owned'],
];
export function getInfo(id) {
  const s = state();
  const l = gbpLocation(id);
  if (!l) return null;
  const saved = ((s.gbp || {}).info || {})[id] || {};
  return {
    name: l.name, category: CATEGORY, description: 'Clothing, skin care, groceries and electronics at fair prices. Order online for home delivery, or visit us.',
    phone: l.phone, website: 'https://gridshop.com.bd', address: l.address, hours: l.hours,
    special: [{ id: 'sp1', date: '2026-12-16', label: 'Victory Day', open: false, from: '10:00', to: '20:00' }, { id: 'sp2', date: '2026-12-25', label: 'Christmas', open: true, from: '12:00', to: '20:00' }],
    attrs: { delivery: true, cod: true, pickup: !isOnePlace(), bkash: true, cards: !isOnePlace(), wheelchair: false, parking: id === 'gl', wifi: false, women: false },
    ...saved,
  };
}
export function saveInfo(id, info) { save((s) => { s.gbp.info = { ...(s.gbp.info || {}), [id]: info }; if (s.conn.gbp) s.conn.gbp.lastSync = nowMs(); }); }

// reviews
const REVIEWS = [
  ['rv1', 'dh', 'Nusrat Jahan', 5, 'Very helpful staff and the kurti collection is beautiful. Got my size exchanged in five minutes.', 2 * HOUR],
  ['rv2', 'mp', 'Tanvir Ahmed', 4, 'Good prices on rice and oil. The queue at the counter was a bit long in the evening.', 7 * HOUR],
  ['rv3', 'gl', 'Farzana Akter', 2, 'Ordered earbuds online for pickup but they were not ready when I came. Had to wait 30 minutes.', 20 * HOUR],
  ['rv4', 'dh', 'Imran Hossain', 5, 'খুব ভালো সার্ভিস, দাম ঠিক আছে। আবার আসব।', 1 * DAY + 3 * HOUR],
  ['rv5', 'mp', 'Sumaiya Islam', 3, 'Products are fine but the shop gets very crowded on Saturday.', 2 * DAY],
  ['rv6', 'gl', 'Rafiq Uddin', 5, 'Clean shop, polite people, and they accept bKash. Recommended.', 3 * DAY, 'Thank you, Rafiq! We are happy you liked the shop. See you again soon.'],
  ['rv7', 'dh', 'Mitu Rahman', 4, 'Sunscreen was original and well priced. Parking is hard to find nearby.', 4 * DAY, 'Thank you, Mitu. Sorry about the parking — there is a car park on Road 27, two minutes away.'],
  ['rv8', 'mp', 'Kamal Pasha', 1, 'The rice cooker stopped working after a week and nobody called me back.', 5 * DAY],
  ['rv9', 'dh', 'Ayesha Siddiqua', 5, 'Fast service and they gift-wrapped my order for free.', 8 * DAY, 'Thank you, Ayesha! Happy to help — enjoy your gift.'],
  ['rv10', 'gl', 'Shahriar Kabir', 4, 'Nice collection of sneakers. Wish they had more sizes in stock.', 11 * DAY],
];
export function getReviews() {
  const s = state();
  const now = nowMs();
  const locs = gbpLocations();
  const one = locs.length === 1 ? locs[0].id : null;
  const replies = (s.gbp || {}).replies || {};
  return REVIEWS.map(([id, loc, name, stars, text, ago, reply]) => {
    const r = replies[id];
    return { id, loc: one || loc, name, stars, text, at: now - ago, reply: r ? r.text : reply || null, replyAt: r ? r.at : reply ? now - ago + 3 * HOUR : null };
  });
}
export function saveReply(id, text) { save((s) => { s.gbp.replies = { ...(s.gbp.replies || {}), [id]: { text: String(text).trim(), at: nowMs() } }; }); }
const AI = {
  high: [
    'Thank you so much, {first}! We are glad you had a good experience with us. See you again at {shop}.',
    'Thank you for the kind words, {first}. It means a lot to our team at {shop}. We hope to see you again soon.',
    'Thank you, {first}! We are happy you liked it. Your feedback keeps our team going.',
  ],
  mid: [
    'Thank you for your feedback, {first}. We are glad you liked most of it, and we will work on {topic}.',
    'Thanks, {first}. Good to hear the visit went well. We have shared your note about {topic} with the team.',
  ],
  low: [
    'Sorry about this, {first}. This is not the experience we want for you. Please call us at {phone} so we can make it right.',
    'We are sorry, {first}. Thank you for telling us. Our manager will call you today — or reach us at {phone}.',
  ],
};
/** A draft reply (the merchant reviews it and publishes it themselves). `n` picks another wording. */
export function aiReply(review, n = 0) {
  const loc = gbpLocation(review.loc) || {};
  const band = review.stars >= 5 ? 'high' : review.stars >= 3 ? 'mid' : 'low';
  const list = AI[band];
  const topic = /queue|wait|crowd/i.test(review.text) ? 'the waiting time' : /park/i.test(review.text) ? 'parking' : /size|stock/i.test(review.text) ? 'having more sizes in stock' : 'this';
  return list[n % list.length].replace('{first}', review.name.split(' ')[0]).replace('{shop}', loc.name || 'GridShop').replace('{phone}', loc.phone || 'our shop').replace('{topic}', topic);
}

// posts
const POSTS = [
  { id: 'po1', st: 'published', text: 'Puja collection is in! New kurtis and panjabis from ৳990. Visit us or order online for home delivery.', cta: 'order', link: 'https://gridshop.com.bd/puja', tone: '#fde7f1', icon: 'shirt', locs: 'all', ago: 3 * DAY, views: 1240 },
  { id: 'po2', st: 'published', text: 'Free gift wrapping on every order this week. Just ask at the counter.', cta: 'learn', link: 'https://gridshop.com.bd/offers', tone: '#e7f8f1', icon: 'gift', locs: 'all', ago: 9 * DAY, views: 860 },
  { id: 'po3', st: 'draft', text: 'Winter skin care is here: moisturisers, lip balm and sunscreen from top brands.', cta: 'buy', link: 'https://gridshop.com.bd/skin-care', tone: '#fff4e0', icon: 'sparkles', locs: 'all', ago: 1 * DAY },
  { id: 'po4', st: 'scheduled', text: 'Victory Day sale: 16% off on everything on 16 December.', cta: 'order', link: 'https://gridshop.com.bd/sale', tone: '#e0f2fe', icon: 'percent', locs: 'all', ahead: 6 * DAY },
];
export const CTAS = [['', 'No button'], ['order', 'Order online'], ['buy', 'Buy'], ['learn', 'Learn more'], ['call', 'Call now'], ['book', 'Book']];
export function getPosts() {
  const s = state();
  const now = nowMs();
  if (!s.gbp.posts) return POSTS.map((p) => ({ ...p, at: p.ahead ? now + p.ahead : now - p.ago }));
  return s.gbp.posts;
}
export function savePost(post) {
  const now = nowMs();
  const list = getPosts();
  save((s) => {
    const rec = { ...post, id: post.id || 'po' + now.toString(36), at: post.at || now };
    s.gbp.posts = [rec, ...list.filter((p) => p.id !== rec.id)];
  });
}
export function deletePost(id) { const list = getPosts(); save((s) => { s.gbp.posts = list.filter((p) => p.id !== id); }); }

// media
export const MEDIA_KINDS = [['logo', 'Logo'], ['cover', 'Cover'], ['outside', 'Shop front'], ['inside', 'Inside'], ['products', 'Products'], ['team', 'Team']];
const MEDIA = [
  { id: 'm1', kind: 'logo', tone: '#e7efff', icon: 'store' }, { id: 'm2', kind: 'cover', tone: '#e0f2fe', icon: 'image' },
  { id: 'm3', kind: 'outside', tone: '#eef2f6', icon: 'building-2' }, { id: 'm4', kind: 'outside', tone: '#eef2f6', icon: 'building-2' },
  { id: 'm5', kind: 'inside', tone: '#fff4e0', icon: 'shopping-basket' }, { id: 'm6', kind: 'inside', tone: '#fff4e0', icon: 'shirt' },
  { id: 'm7', kind: 'products', tone: '#fde7f1', icon: 'shirt' }, { id: 'm8', kind: 'products', tone: '#e7f8f1', icon: 'sparkles' },
  { id: 'm9', kind: 'products', tone: '#f3e8ff', icon: 'headphones' }, { id: 'm10', kind: 'team', tone: '#e7efff', icon: 'users' },
];
export function getMedia(loc) { const s = state(); const own = ((s.gbp.media || {})[loc]) || null; return own || MEDIA.map((m) => ({ ...m })); }
export function addMedia(loc, items) { const list = getMedia(loc); save((s) => { s.gbp.media = { ...(s.gbp.media || {}), [loc]: [...items, ...list].slice(0, 40) }; }); }
export function removeMedia(loc, id) { const list = getMedia(loc); save((s) => { s.gbp.media = { ...(s.gbp.media || {}), [loc]: list.filter((m) => m.id !== id) }; }); }

// services
const SERVICES = [
  { id: 's1', name: 'Home delivery', desc: 'Across Dhaka in 1–2 days.', price: 'From ৳60' },
  { id: 's2', name: 'Cash on delivery', desc: 'Pay when the parcel reaches you.', price: '' },
  { id: 's3', name: 'Gift wrapping', desc: 'Paper, ribbon and a card.', price: '৳50' },
  { id: 's4', name: 'Exchange in 7 days', desc: 'Unused items with the receipt.', price: 'Free' },
];
export function getServices() { const s = state(); return s.gbp.services || SERVICES.map((x) => ({ ...x })); }
export function saveService(svc) {
  const list = getServices();
  save((s) => { const rec = { ...svc, id: svc.id || 's' + nowMs().toString(36) }; s.gbp.services = svc.id ? list.map((x) => (x.id === svc.id ? rec : x)) : [...list, rec]; });
}
export function removeService(id) { const list = getServices(); save((s) => { s.gbp.services = list.filter((x) => x.id !== id); }); }

// ---- words -------------------------------------------------------------------------------------------------
/** "Just now", "12 min ago", "3 hours ago", "Yesterday", "28 Sep". */
export function ago(t, now = nowMs()) {
  if (!t) return 'Never';
  const d = Math.max(0, now - t);
  if (d < MIN) return 'Just now';
  if (d < HOUR) { const m = Math.round(d / MIN); return m + (m === 1 ? ' minute ago' : ' minutes ago'); }
  if (d < DAY) { const h = Math.round(d / HOUR); return h + (h === 1 ? ' hour ago' : ' hours ago'); }
  if (d < 2 * DAY) return 'Yesterday';
  if (d < 7 * DAY) return Math.floor(d / DAY) + ' days ago';
  const x = new Date(t);
  return x.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][x.getMonth()] + (x.getFullYear() !== new Date(now).getFullYear() ? ' ' + x.getFullYear() : '');
}
/** ago() inside a sentence: "last sync 12 minutes ago", "yesterday" — a date such as "23 Sep" keeps its capital. */
export function agoLow(t, now = nowMs()) { const x = ago(t, now); return /^\d+ [A-Z]/.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1); }
/** "in 6 days" for a scheduled post. */
export function inTime(t, now = nowMs()) {
  const d = t - now;
  if (d < HOUR) return 'in ' + Math.max(1, Math.round(d / MIN)) + ' min';
  if (d < DAY) return 'in ' + Math.round(d / HOUR) + ' hours';
  const n = Math.round(d / DAY);
  return n === 1 ? 'tomorrow' : 'in ' + n + ' days';
}
