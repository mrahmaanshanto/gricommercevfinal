'use client';
// Generated from design/templates/products/AddProduct.dc.html by scripts/convert-design.mjs.
// AddProduct — Products — Add product / Edit product, laid out exactly like the reference app's product editor
// (docs/reference-add-product.md): header (Preview · Duplicate · Save draft), then a main column (title and rich-text
// description, media, classification + template, specifications, pricing, product model, variants, and one-line cards
// that open drawers for inventory & identifiers, shipping, SEO and relationships) and a side column (status,
// publishing, organization, product data, Google readiness, warranty, activity). Drawers are Sheets with Cancel / Save:
// Cancel puts back what the drawer changed. Our kit, font and colours (docs/shopify-style.md).
// Edit freely: this file is now the source for the screen. Parts: AddProductParts.jsx, RichText.jsx.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { InfoTip as __InfoTip, Dialog as __Dialog } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import ProductChannels from '@/components/ProductChannels';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { findProduct, saveProduct, codeOwner, newProductId, getSavedProducts, duplicateProduct, allProducts } from '@/lib/products';
import { getStockSetup, isOnePlace } from '@/lib/stockSetup';
import { addMove, stockAt, getCatalog, isVirtualRow, UNTRACKED } from '@/lib/stock';
import { onlinePlace, getBranchNames } from '@/lib/locations';
import { ManagerPin } from '@/components/ManagerPin';
import { UNITS, unitOf, packsOf, packLine } from '@/lib/units';
import { ID_TYPES, idLabel, validateId, idOwner, gtinOk } from '@/lib/identifiers';
import { TEMPLATES, tplBy, templateFor, templateOfCategory, groupsOf, fieldValue, hiddenValues, tplDefaults, TPL_SOURCE, CAP_LABEL } from '@/lib/productTemplates';
import { saveDraft, draftFor, dropDraft, agoText, AUTOSAVE_MS } from '@/lib/productDrafts';
import { versionsOf, latestVersion, openEdit, closeEdit, editorsOf, takeOver, staleSince, needsPriceApproval, priceChangePct, priceLimit, requestPrice, openPriceRequests, decidePrice, VERSIONS_EVENT } from '@/lib/productVersions';
import { REL_KINDS, relationIds, setRelation } from '@/lib/productRelations';
import { keysOf, freeKeys, addKeys, maskKey } from '@/lib/licenceKeys';
import { BUNDLE_TYPES } from '@/lib/bundles';
import { setWeighed } from '@/lib/scaleBarcode';
import { currentUser } from '@/lib/team';
import { formatDateTime } from '@/lib/format';
import { whyNotSellable } from '@/lib/sellable';
import { hasModule } from '@/lib/edition';
import { getChannels } from '@/lib/channels';
import { lastPurchaseCost, inventoryCost } from '@/lib/productCostFacts';
import { readImage } from '@/screens/channels/chShared';
import RichText, { RTE_CSS, plainText, toHtml } from './RichText';
import { Err, Switch, Seg, AiBtn, AiCheck, OrderBtns, Drawer, MultiCheck, specModel, layoutOf, swap, PARTS_CSS } from './AddProductParts';

// ---- helpers ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }

// ---- form helpers: validation and unsaved-changes tracking ----
// State that is not part of the product itself (open drawers, AI review marks, errors, raw text of comma lists).
var TRANSIENT = { ai: 1, prev: 1, assistOpen: 1, catOpen: 1, aiSel: 1, facts: 1, msg: 1, bad: 1, errors: 1, dirty: 1, tab: 1, stripL: 1, stripR: 1, savedList: 1,
  recover: 1, autosavedAt: 1, editors: 1, loadedV: 1, verOpen: 1, verView: 1, priceAsk: 1, pinFor: 1, keysText: 1, tick: 1,
  sheet: 1, sheetSnap: 1, seoOpen: 1, colText: 1, tagText: 1, altText: 1 };
var FIELD_ORDER = ['title', 'price', 'cost', 'wholesale', 'moq', 'opts', 'sku', 'barcode', 'internal', 'ids', 'packs', 'variants', 'bundle', 'shelf'];
// fields that live in a drawer: a save error opens the drawer and puts the cursor there
var FIELD_SHEET = { sku: 'ids', barcode: 'ids', internal: 'ids', ids: 'ids', packs: 'ids', shelf: 'ids', bundle: 'rel' };
// a product format (Nayeem's Product brief #1 › 1.1): digital formats have no stock, courier or weight
var FORMATS = [['physical', 'Physical'], ['digital', 'Digital / downloadable'], ['licence', 'Digital licence'], ['service', 'Service / non-stock']];
var SELL_MODES = [['retail', 'Retail'], ['wholesale', 'Wholesale'], ['both', 'Retail + Wholesale']];
var SELLABILITY = [['normal', 'Normal'], ['preorder', 'Preorder'], ['backorder', 'Backorder'], ['gift', 'Gift-only'], ['catalogue', 'Catalogue-only'], ['mto', 'Made-to-order']];
var INV_MODES = [['quantity', 'Quantity'], ['serial', 'Serial'], ['imei', 'IMEI'], ['batch', 'Batch / expiry'], ['weight', 'Variable weight'], ['none', 'Not tracked']];
var ST_LABEL = { active: 'Active', draft: 'Draft', scheduled: 'Scheduled', archived: 'Archived', deleted: 'Deleted' };
function formEl() { return typeof document === 'undefined' ? null : document.getElementById('product-form'); }
function fieldEls(form) { return form ? Array.prototype.filter.call(form.elements, function (el) { return /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'file' && !el.closest('[data-nodirty]'); }) : []; }
function domSnap(form) { return fieldEls(form).map(function (el) { return el.type === 'checkbox' || el.type === 'radio' ? (el.checked ? '1' : '0') : el.value; }); }
function moneyError(x, required, what) {
  var t = String(x == null ? '' : x).trim();
  if (!t) return required ? 'Enter the ' + what + '.' : '';
  var n = t.replace(/[৳,\s]/g, '');
  if (!/^\d+(\.\d+)?$/.test(n)) return 'Enter the ' + what + ' as a number, for example ৳1,250.';
  if (required && +n <= 0) return 'The ' + what + ' must be more than ৳0.';
  return '';
}
function wholeNum(x) { var t = String(x == null ? '' : x).trim(); return /^\d+$/.test(t) ? +t : null; }
function moneyNum(x) { var t = String(x == null ? '' : x).replace(/[৳,\s]/g, ''); return /^\d+(\.\d+)?$/.test(t) ? +t : null; }
// Wholesale price and MOQ: required=true when the product is sold wholesale and this is not a draft.
function wholesaleError(x, required) {
  var t = String(x == null ? '' : x).trim();
  if (!t) return required ? 'Enter the wholesale price.' : '';
  var n = moneyNum(t);
  if (n == null) return 'Enter the wholesale price as a number, for example 62500.';
  if (n <= 0) return 'The wholesale price must be more than ৳0.';
  return '';
}
function moqError(x, required) {
  var t = String(x == null ? '' : x).trim();
  if (!t) return required ? 'Enter the minimum order quantity.' : '';
  var n = wholeNum(t);
  if (n == null) return 'Enter the minimum order as a whole number of pieces.';
  if (n < 1) return 'The minimum order must be at least 1 piece.';
  return '';
}
function catLeaf(path) { var parts = String(path || '').split(' › '); return parts[parts.length - 1]; }
function catPathOf(cat) { return cat ? (PARENT[cat] ? PARENT[cat] + ' › ' : '') + cat : ''; }
function slugOf(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
// Barcodes (Nayeem's Product brief #1): a manufacturer's barcode (GTIN, printed on the pack) is kept apart from a code
// the shop makes for itself. "Generate" makes an in-store EAN-13 (starting with 2, the range kept for use inside a shop),
// marked barcodeType 'internal', so it is never sent to Google as a GTIN. The product keeps one main barcode (the GTIN
// when there is one, else the internal code); when it has both, the internal code is kept as an extra identifier.
function classifyBarcode(code, type) {
  var d = String(code || '').trim();
  if (!d) return '';
  if (type === 'gtin' || type === 'internal') return type;
  return /^\d{8,14}$/.test(d) && !(d.length === 13 && d[0] === '2') ? 'gtin' : 'internal';
}
function inStoreCode() {
  var b = '2'; for (var i = 0; i < 11; i++) b += Math.floor(Math.random() * 10);
  var sum = 0; for (var j = 0; j < 12; j++) sum += (+b[11 - j]) * (j % 2 === 0 ? 3 : 1);
  return b + ((10 - (sum % 10)) % 10);
}
var codeOf = function (x) { return String(x).replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase(); };
var combos = function (list) { return list.reduce(function (acc, o) { var out = []; acc.forEach(function (a) { o.values.forEach(function (val) { out.push(a.concat(val)); }); }); return out; }, [[]]); };
// Opening stock (Inventory drawer): posted as stock moves when the product is saved
var OPEN_PLACES = ['Central Warehouse', 'Dhanmondi branch'];
// The product's values as form state (edit mode).
function prefillFrom(p) {
  var money = function (n) { return n == null || n === '' ? '' : bdt(n); };
  var str = function (n) { return n == null || n === '' ? '' : String(n); };
  var bt = classifyBarcode(p.barcode, p.barcodeType);
  var ids0 = (p.ids || []).map(function (x) { return assign({}, x); });
  var intId = ids0.filter(function (x) { return x.internal; })[0];
  var leaf = catLeaf(p.cat);
  return {
    editId: p.id, orig: p, basePrice: p.price, title: p.name, short: p.short || '', long: p.long || '', seoT: p.seoT || '', seoD: p.seoD || '', tags: p.tags || [],
    price: money(p.price), cost: money(p.cost), mrp: money(p.mrp), wholesale: str(p.wholesale), moq: str(p.moq), sell: p.sell || 'retail',
    sku: p.sku || '', gtin: bt === 'gtin' ? p.barcode : '', internalBc: bt === 'internal' ? p.barcode : (intId ? intId.value : ''),
    oversell: !!p.oversell, cat: leaf, brand: p.brand || '', status: p.st || 'active', opts: (p.opts || []).map(function (o) { return { name: o.name, values: (o.values || []).slice() }; }),
    variants: (p.variants || []).map(function (x) { return assign(assign({}, x), { wholesale: str(x.wholesale), moq: str(x.moq) }); }),
    // brief #1: units & packs, identifiers, template + specification values, format, selling modes, bundle, relations
    unit: p.unit || 'pc', packs: packsOf({ sku: p.sku, packs: p.packs }).map(function (k) { return assign({}, k); }), ids: ids0.filter(function (x) { return !x.internal; }),
    template: p.template || '', data: assign({}, p.data || {}), format: p.format || 'physical', digital: p.digital || null,
    backorder: !!p.backorder, restockAt: p.restockAt || '', giftOnly: !!p.giftOnly, bundle: p.bundle ? { type: p.bundle.type, parts: p.bundle.parts.map(function (x) { return assign({}, x); }) } : null,
    rel: relationIds(p.id),
    // the reference page's fields (kept on the product record)
    invMode: p.invMode || null, saleUnit: p.saleUnit || null, buyUnit: p.buyUnit || null, sellability: p.sellability || null,
    subcats: Array.isArray(p.subcats) ? p.subcats.map(catLeaf) : (PARENT[leaf] ? [leaf] : []), collections: (p.collections || []).slice(),
    media: (p.media || []).map(function (m) { return assign({}, m); }), handle: p.handle || '', noindex: !!p.noindex, faqs: p.faqs || [],
    ship: p.ship ? assign({}, p.ship) : null, wq: p.warranty ? (p.warranty.has ? 'yes' : 'no') : null, wp: p.warranty ? p.warranty.policy : null, wtext: p.warranty ? p.warranty.text : null,
    snt: p.snType || null, shelfN: p.shelf ? String(p.shelf.n) : null, shelfU: p.shelf ? p.shelf.u : null, lowAt: p.lowAt != null ? String(p.lowAt) : null,
    specLayout: p.specLayout || null, publishing: p.publishing || null, google: p.google || null, sg: p.sizeGuide || null
  };
}

var AI_TXT = {
  short: '6.7-inch AMOLED, 5000 mAh battery and a 50 MP camera — with 1 year official Samsung warranty in Bangladesh.',
  long: '<p>Meet the 5G Smartphone Pro — a big, bright 6.7-inch AMOLED screen that stays sharp in the sun, and a 5000 mAh battery that lasts a full day and more.</p><h3>What you get</h3><ul><li>256 GB or 512 GB storage, 8 GB RAM</li><li>50 MP main camera with night mode</li><li>Fast 45 W charging</li><li>Dual SIM, 5G ready for Grameenphone and Robi</li></ul><p>Every phone is official, PTA approved and comes with a 1-year brand warranty. The IMEI is printed on your invoice.</p>',
  bangla: '<p>বাংলায়: ৬.৭ ইঞ্চি AMOLED স্ক্রিন, ৫০০০ mAh ব্যাটারি ও ৫০ MP ক্যামেরা। অফিসিয়াল ১ বছরের ওয়ারেন্টি।</p>',
  seoT: '5G Smartphone Pro 256GB Price in Bangladesh | GridShop',
  seoD: 'Buy the 5G Smartphone Pro 256GB at the best price in BD. Official warranty, 6.7" AMOLED, 5000 mAh. Cash on delivery all over Bangladesh.'
};
var FAQ_AI = [['Is this the official version?', 'Yes. Every phone is official and PTA approved, with a 1-year brand warranty.'], ['Does it support 5G in Bangladesh?', 'Yes, it works on 5G where Grameenphone and Robi have it, and on 4G everywhere else.'], ['Can I pay by EMI?', 'Yes, 3 to 12 months EMI on most bank cards.']];
// the shop's categories (Products › Categories): main categories and their subcategories
var CATS = [['Skin care', 0], ['Sunscreen', 1], ['Toner', 1], ['Gel', 1], ['Clothing', 0], ['Men', 1], ['Women', 1], ['Electronics', 0], ['Phones', 1], ['Laptops', 1], ['Audio', 1], ['Grocery', 0], ['Rice', 1], ['Fresh', 1], ['Home', 0], ['Books', 0], ['Software', 0], ['Digital', 0], ['Gifts', 0]];
var PARENT = { Sunscreen: 'Skin care', Toner: 'Skin care', Gel: 'Skin care', Men: 'Clothing', Women: 'Clothing', Phones: 'Electronics', Laptops: 'Electronics', Audio: 'Electronics', Rice: 'Grocery', Fresh: 'Grocery' };
var MAIN_CATS = CATS.filter(function (c) { return !c[1]; }).map(function (c) { return c[0]; });
var BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'ASUS', 'SoundMax', 'Beauty of Joseon', 'Nature Republic', 'GridShop', 'Chashi', 'Walton'];
var COLLECTIONS = ['New arrivals', 'Best sellers', 'Eid picks', 'Smartphones', 'Gift ideas', 'Clearance'];
// Google product category, mapped from our category (Product data › Google product data: "Auto mapping")
var GOOGLE_CAT = { Electronics: 'Electronics', Phones: 'Electronics > Communications > Telephony > Mobile Phones', Laptops: 'Electronics > Computers > Laptops', Audio: 'Electronics > Audio',
  'Skin care': 'Health & Beauty > Personal Care > Cosmetics > Skin Care', Clothing: 'Apparel & Accessories > Clothing', Men: 'Apparel & Accessories > Clothing', Women: 'Apparel & Accessories > Clothing',
  Grocery: 'Food, Beverages & Tobacco > Food Items', Rice: 'Food, Beverages & Tobacco > Food Items > Grains, Rice & Cereal', Fresh: 'Food, Beverages & Tobacco > Food Items > Meat, Seafood & Eggs',
  Home: 'Home & Garden', Books: 'Media > Books', Software: 'Software', Digital: 'Media', Gifts: 'Arts & Entertainment > Party & Celebration > Gift Giving' };
var WP = { brand1y: [['Period', '12 months'], ['Proof needed', 'Invoice + IMEI'], ['Claim at', 'Service centre, Mirpur 10']], shop6m: [['Period', '6 months'], ['Type', 'Shop service'], ['Claim at', 'Your shop']], rep7d: [['Period', '7 days'], ['Type', 'Replacement'], ['Claim at', 'Your shop']], elec2y: [['Period', '2 years'], ['Type', 'Parts + service'], ['Claim at', 'Brand centre']] };
var WP_LINE = { brand1y: '12 months brand warranty', shop6m: '6 months shop service', rep7d: '7-day replacement', elec2y: '2 years parts, 1 year service' };
var WPS = { brand1y: 'Delivery date', shop6m: 'Delivery date', rep7d: 'Delivery date', elec2y: 'Invoice date' };
var WPT = { brand1y: '12 months brand warranty. Covers manufacturing defects, battery below 80% health, and motherboard or display faults. Not covered: physical or liquid damage, phones opened by a third party, software issues after rooting. Repair first; replaced if it cannot be repaired within 15 days.', shop6m: 'We repair or replace parts at no cost for 6 months.', rep7d: 'Swap for a new piece within 7 days if faulty.', elec2y: 'Parts are free for 2 years; service is free for the first year.' };
var SG = { shirt: [['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)', 'Sleeve (in)'], [['S', '38', '27', '17', '8'], ['M', '40', '28', '18', '8.5'], ['L', '42', '29', '19', '9'], ['XL', '44', '30', '20', '9.5']]], kurti: [['Size', 'Bust (in)', 'Length (in)', 'Waist (in)', 'Hip (in)'], [['S', '34', '42', '30', '38'], ['M', '36', '43', '32', '40'], ['L', '38', '44', '34', '42'], ['XL', '40', '45', '36', '44']]], shoe: [['BD', 'EU', 'UK', 'Foot length (cm)', 'Width'], [['39', '39', '6', '24.5', 'Regular'], ['40', '40', '6.5', '25.1', 'Regular'], ['41', '41', '7.5', '25.8', 'Regular'], ['42', '42', '8', '26.4', 'Wide']]] };
var AIF = [['short', 'Short description'], ['long', 'Long description'], ['seo', 'SEO title and description'], ['tags', 'Tags'], ['faq', 'FAQ'], ['alt', 'Photo alt text']];
var ALT_VIEWS = ['front view', 'back view', 'side view', 'in the box', 'in hand'];
var PUB_CHANNELS = [['online', 'Online store'], ['pos', 'POS'], ['meta', 'Meta'], ['gmc', 'Google'], ['wholesale', 'Wholesale']];

class Component extends DCLogic {
  componentWillUnmount() {
    clearTimeout(this.t); clearInterval(this.autoT); clearInterval(this.lockT);
    if (this.lockId) closeEdit(this.lockId, this.tabId);
    if (this.onStore) { window.removeEventListener('storage', this.onStore); window.removeEventListener(VERSIONS_EVENT, this.onStore); }
  }
  // Autosave (productDrafts.js): while there are unsaved changes, keep them as a draft every few seconds.
  autosave() {
    var s = this.state || {};
    if (!s.dirty) return;
    var keep = {};
    Object.keys(s).forEach(function (k) { if (!TRANSIENT[k] && k !== 'orig' && s[k] != null) keep[k] = s[k]; });
    this.setState({ autosavedAt: saveDraft(s.editId || 'new', keep) });
  }
  // Edit locks (productVersions.js): this tab has the product open; who else has it open now.
  watchLock(id) {
    var self = this, me = currentUser();
    if (this.lockId && this.lockId !== id) closeEdit(this.lockId, this.tabId);
    this.lockId = id;
    openEdit(id, me, this.tabId);
    clearInterval(this.lockT);
    this.lockT = setInterval(function () { openEdit(id, me, self.tabId); self.setState({ editors: editorsOf(id, me, self.tabId) }); }, 30000);
    this.setState({ editors: editorsOf(id, me, this.tabId) });
  }
  // /add-product adds a new product; /add-product?sku=… (or ?id=…) opens that product for editing.
  componentDidMount() {
    // wholesale price, MOQ and selling mode only where the shop sells wholesale (stockSetup.js)
    this.setState({ wsOn: getStockSetup().wholesale });
    var self = this, qs = new URLSearchParams(window.location.search), saved = getSavedProducts();
    var key = { id: qs.get('id') || '', sku: qs.get('sku') || '' };
    var p = key.id || key.sku ? findProduct(key, saved) : null;
    var pre = p ? prefillFrom(p) : {};
    this.tabId = 'tab-' + Math.random().toString(36).slice(2, 8);
    // unsaved work from an earlier visit (newer than the product's last save) is offered back
    var draft = draftFor(p ? p.id : 'new', p ? p.savedAt || 0 : 0);
    this.setState(assign({ savedList: saved, recover: draft, loadedV: p ? (latestVersion(p.id) || {}).v || 0 : 0 }, pre), function () {
      var dom = domSnap(formEl());
      self.base = { dom: dom, key: JSON.stringify(dom), snap: self._snap, state: pre };
      if (!p && (key.id || key.sku)) __toast('That product was not found. You are adding a new one.', { tone: 'info' });
    });
    if (p) this.watchLock(p.id);
    this.autoT = setInterval(function () { self.autosave(); }, AUTOSAVE_MS);
    this.onStore = function () { var st = self.state || {}; if (st.editId) self.setState({ editors: editorsOf(st.editId, currentUser(), self.tabId), tick: Date.now() }); };
    window.addEventListener('storage', this.onStore);
    window.addEventListener(VERSIONS_EVENT, this.onStore);
  }
  componentDidUpdate() { this.checkDirty(); }
  // Dirty = the product's values differ from the last saved (or first loaded) values. Every field is controlled, so
  // the values are compared as one snapshot (_snap, built in renderVals); fields outside data-nodirty still count too.
  checkDirty() {
    if (!this.base) return;
    var d = JSON.stringify(domSnap(formEl())) !== this.base.key || this._snap !== this.base.snap;
    if (d !== !!(this.state || {}).dirty) this.setState({ dirty: d });
  }
  markSaved() {
    var s = this.state || {}, keep = {}, dom = domSnap(formEl());
    Object.keys(s).forEach(function (k) { if (!TRANSIENT[k] && s[k] != null) keep[k] = s[k]; });
    this.base = { dom: dom, key: JSON.stringify(dom), snap: this._snap, state: keep };
    this.setState({ dirty: false });
  }
  // Discard: put every field back to the last saved (or first loaded) value.
  restore() {
    var self = this, s = this.state || {}, p = {};
    Object.keys(s).forEach(function (k) { if (k !== 'tab' && k !== 'stripL' && k !== 'stripR' && k !== 'savedList' && k !== 'editors' && k !== 'loadedV' && k !== 'wsOn') p[k] = null; });
    assign(p, this.base.state);
    this.setState(p, function () { self.checkDirty(); });
  }
  // Drawers: opening one keeps a copy of the product's values, so Cancel can put back what the drawer changed.
  snapOf() { var s = this.state || {}, o = {}; Object.keys(s).forEach(function (k) { if (!TRANSIENT[k]) o[k] = s[k]; }); return o; }
  openSheet(name) { this.setState({ sheet: name, sheetSnap: this.snapOf() }); }
  cancelSheet() {
    var s = this.state || {}, snap = s.sheetSnap || {}, p = { sheet: null, sheetSnap: null, altText: null, tagText: null };
    Object.keys(s).forEach(function (k) { if (!TRANSIENT[k] && !(k in snap)) p[k] = null; });
    this.setState(assign(p, snap));
  }
  closeSheet() { this.setState({ sheet: null, sheetSnap: null }); }
  renderVals() {
    var self = this, s = this.state || {};
    var live = !!s.savedList;   // browser data is read after mount (the first render matches the server's)
    var ai = s.ai || {}, prev = s.prev || {};
    var f = function (k, d) { return s[k] != null ? s[k] : d; };
    var editing = !!s.editId, orig = s.orig || null;
    var title = f('title', ''), short = f('short', ''), long = f('long', ''), seoT = f('seoT', ''), seoD = f('seoD', ''), tags = f('tags', []), faqs = f('faqs', []);
    var setAi = function (k, patch) { var p = assign({}, patch); var a = assign({}, ai); a[k] = true; p.ai = a; var pv = assign({}, prev); pv[k] = {}; Object.keys(patch).forEach(function (x) { pv[k][x] = s[x]; }); p.prev = pv; self.setState(p); };
    var media = f('media', []);
    var gen = {
      short: function () { setAi('short', { short: AI_TXT.short }); }, long: function () { setAi('long', { long: AI_TXT.long }); }, seo: function () { setAi('seo', { seoT: AI_TXT.seoT, seoD: AI_TXT.seoD }); },
      tags: function () { setAi('tags', { tags: ['5G', 'Samsung', 'AMOLED', '5000mAh', 'Official warranty', 'Android phone'], tagText: null }); }, faq: function () { setAi('faq', { faqs: FAQ_AI }); },
      alt: function () {
        if (!media.length) { toast(self, 'Add photos first. AI writes alt text for each one.'); return; }
        self.setState({ media: media.map(function (m, i) { return m.alt ? m : assign(assign({}, m), { alt: (title || 'Product') + ', ' + ALT_VIEWS[i % ALT_VIEWS.length] }); }) });
        toast(self, 'Alt text written for ' + media.length + (media.length === 1 ? ' photo.' : ' photos.') + ' Check each one.');
      }
    };
    var keep = function (k) { return function () { var a = assign({}, ai); delete a[k]; self.setState({ ai: a }); }; };
    var undo = function (k) { return function () { var a = assign({}, ai); delete a[k]; var p = assign({ ai: a }, prev[k] || {}); self.setState(p); }; };
    var aiSel = s.aiSel || { short: true, long: true, seo: true, tags: true, faq: false, alt: false };
    var price = f('price', ''), cost = f('cost', ''), mrp = f('mrp', '');
    var wsOn = s.wsOn !== false;   // an online-only shop: purchase price and sale price only
    var sell = wsOn ? f('sell', 'retail') : 'retail', sellsWs = sell !== 'retail', wholesale = f('wholesale', ''), moq = f('moq', '');
    var sku = f('sku', ''), gtin = f('gtin', ''), internalBc = f('internalBc', ''), brand = f('brand', ''), variants = f('variants', []), opts = f('opts', []);
    var barcode = String(gtin).trim() || String(internalBc).trim();
    var ownId = s.editId || '', savedList = s.savedList || [];
    var num = function (x) { return +(String(x).replace(/[^\d.]/g, '')) || 0; };
    var pr = num(price), co = num(cost), prof = pr - co, mr = num(mrp);
    var shift = s.basePrice != null && String(price).trim() ? pr - s.basePrice : 0; // a new selling price moves every variant by the same amount
    var cat = f('cat', ''), subcats = f('subcats', []), mainCat = PARENT[cat] || cat;
    var status = f('status', editing ? 'active' : 'draft');
    var seg = function (list, cur, key) { return list.map(function (o) { return { l: o[1], on: o[0] === cur, pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); };

    // ---- template, format, units, identifiers ----
    var catPath = catPathOf(cat), tplOwn = f('template', ''), data = f('data', {}), format = f('format', 'physical');
    var tpl = templateFor({ template: tplOwn, cat: catPath }), catTpl = templateOfCategory(catPath);
    var caps = tpl.tpl.caps || [], flags0 = (orig && orig.flags) || [];
    var asProduct = { template: tplOwn, cat: catPath, data: data };
    var unit = f('unit', 'pc'), packs = f('packs', []), ids = f('ids', []), bundle = f('bundle', null), rel = f('rel', null) || { related: [], accessories: [], substitutes: [], successor: '', fbt: [] };
    var physical = format === 'physical';
    var invDef = flags0.indexOf('IMEI') >= 0 || caps.indexOf('imei') >= 0 ? 'imei' : flags0.indexOf('Serial') >= 0 || caps.indexOf('serial') >= 0 ? 'serial' : flags0.indexOf('Expiry') >= 0 || caps.indexOf('expiry') >= 0 ? 'batch' : caps.indexOf('weight') >= 0 || unit === 'kg' ? 'weight' : 'quantity';
    var invMode = f('invMode', invDef), expiresOn = physical && invMode === 'batch', serialOn = physical && (invMode === 'serial' || invMode === 'imei');
    var snt = invMode === 'serial' ? 'serial' : f('snt', 'imei2') === 'imei1' ? 'imei1' : 'imei2';
    var shelfN = f('shelfN', '12'), shelfU = f('shelfU', 'months'), lowAt = f('lowAt', '5');
    var saleUnit = f('saleUnit', ''), buyUnit = f('buyUnit', '');
    var wq = f('wq', caps.indexOf('warranty') >= 0 || flags0.indexOf('Warranty') >= 0 ? 'yes' : 'no'), wp = WP[f('wp', 'brand1y')] ? f('wp', 'brand1y') : 'brand1y', wtext = f('wtext', WPT[wp]);
    var sg = SG[f('sg', 'none')] ? f('sg', 'none') : 'none';
    var oversell = !!f('oversell', false), backorder = !!f('backorder', false), giftOnly = !!f('giftOnly', false);
    var sellability = f('sellability', '') || (giftOnly ? 'gift' : oversell ? 'preorder' : backorder ? 'backorder' : 'normal');
    var ship = assign({ weight: '', length: '', width: '', height: '', parcel: 'box', fragile: false }, f('ship', {}));
    var google = assign({ category: '', condition: 'new', color: '', size: '' }, f('google', {}));
    var setData = function (k, val, inherited) { var d = assign({}, data); if (val === '' || val === inherited) delete d[k]; else d[k] = val; self.setState({ data: d }); };
    var catalog = !live ? [] : getCatalog();
    var choices = !live ? [] : allProducts(savedList).filter(function (x) { return x.st !== 'deleted' && x.id !== ownId; });
    var nameOfId = function (id) { var x = choices.filter(function (c) { return c.id === id; })[0]; return x ? x.name : id; };
    var errs = s.errors || {};
    var baseGroups = groupsOf(tpl.id);
    var tplFields = baseGroups.reduce(function (a, g) { return a.concat(g.fields); }, []);
    var hasKey = tplFields.some(function (fd) { return fd.key; });
    var inline = {};
    // a short template shows every row; a long one its key features (and anything filled in), the rest behind "View all"
    var few = tplFields.length <= 8;
    tplFields.forEach(function (fd, i) { var own = data[fd.k]; if (few || (hasKey ? fd.key || fd.req : i < 6) || (own != null && own !== '')) inline[fd.k] = true; });
    var sm = specModel(tpl.id, baseGroups, f('specLayout', null));
    var setLayout = function (fn) { var L = layoutOf(sm); fn(L); self.setState({ specLayout: L }); };
    var labelOf = function (k) { var fd = sm.fieldBy[k]; return (sm.extra[k] ? sm.extra[k].l : sm.labels[k]) || (fd ? fd.l : k); };
    var fieldRow = function (k, idp) {
      var fd = sm.fieldBy[k], val = fieldValue(asProduct, fd), inh = val.source === 'product' ? val.inherited : val;
      return { k: k, l: labelOf(k), unit: fd.u || '', t: fd.t, o: fd.t === 'yes' ? ['Yes', 'No'] : fd.o, value: val.value, source: val.source, label: val.label, own: !!sm.extra[k],
        resetLabel: inh.source === 'category' ? 'Reset to category default' : inh.source === 'template' ? 'Reset to template default' : 'Reset',
        canReset: val.source === 'product' && inh.value !== '', id: idp + k,
        onChange: function (e) { setData(k, e.target.value, inh.value); }, reset: function () { var d2 = assign({}, data); delete d2[k]; self.setState({ data: d2 }); } };
    };
    var v = {};

    // ---- title, descriptions, AI ----
    assign(v, {
      facts: f('facts', '6.7 inch AMOLED, 5000 mAh, 50 MP camera, 1 year official warranty, PTA approved'), typeFacts: function (e) { self.setState({ facts: e.target.value }); },
      aiFields: AIF.map(function (x) { var on = !!aiSel[x[0]]; return { label: x[1], on: on, pick: function () { var o = assign({}, aiSel); o[x[0]] = !on; self.setState({ aiSel: o }); } }; }),
      aiCount: AIF.filter(function (x) { return aiSel[x[0]]; }).length,
      runAssist: function () { var p = {}, a = assign({}, ai), pv = assign({}, prev); var add = function (k, patch) { a[k] = true; pv[k] = {}; Object.keys(patch).forEach(function (x) { pv[k][x] = s[x]; p[x] = patch[x]; }); };
        if (aiSel.short) add('short', { short: AI_TXT.short }); if (aiSel.long) add('long', { long: AI_TXT.long }); if (aiSel.seo) add('seo', { seoT: AI_TXT.seoT, seoD: AI_TXT.seoD }); if (aiSel.tags) add('tags', { tags: ['5G', 'Samsung', 'AMOLED', '5000mAh', 'Official warranty', 'Android phone'], tagText: null }); if (aiSel.faq) add('faq', { faqs: FAQ_AI });
        p.ai = a; p.prev = pv; p.sheet = null; p.sheetSnap = null; self.setState(p, function () { if (aiSel.alt) gen.alt(); }); toast(self, 'AI filled ' + Object.keys(a).length + ' fields. Purple borders show what to check.'); },
      title: title, typeTitle: function (e) { self.setState({ title: e.target.value }); },
      short: short, typeShort: function (e) { self.setState({ short: e.target.value }); }, shortCount: short.length + ' / 160',
      long: long, typeLong: function (html) { self.setState({ long: html }); },
      ai: { short: !!ai.short, long: !!ai.long, seo: !!ai.seo, faq: !!ai.faq, tags: !!ai.tags },
      aiShort: gen.short, aiLong: gen.long, aiSeo: gen.seo, aiTags: gen.tags, aiFaq: gen.faq, aiAlt: gen.alt,
      aiImprove: function () { setAi('long', { long: toHtml(long).replace(/Official/, 'An official') + '<p>Sharper wording, same facts.</p>' }); },
      aiBangla: function () { setAi('long', { long: toHtml(long) + AI_TXT.bangla }); },
      keep_short: keep('short'), keep_long: keep('long'), keep_seo: keep('seo'), keep_faq: keep('faq'), keep_tags: keep('tags'), undo_short: undo('short'), undo_long: undo('long'), undo_seo: undo('seo'), undo_faq: undo('faq'), undo_tags: undo('tags'),
      rteError: function (m) { toast(self, m, true); }
    });

    // ---- media: photos and videos, first = primary, alt text, reorder ----
    var setMedia = function (list) { self.setState({ media: list }); };
    assign(v, {
      media: media.map(function (m, i) {
        return { key: m.id || 'm' + i, src: m.src || '', kind: m.kind || 'image', name: m.name || '', alt: m.alt || '', primary: i === 0, n: i + 1, first: i === 0, last: i === media.length - 1,
          typeAlt: function (e) { setMedia(media.map(function (x, j) { return j === i ? assign(assign({}, x), { alt: e.target.value }) : x; })); },
          left: function () { setMedia(swap(media, i, i - 1)); }, right: function () { setMedia(swap(media, i, i + 1)); },
          primaryIt: function () { var l = media.slice(); var it = l.splice(i, 1)[0]; l.unshift(it); setMedia(l); },
          remove: function () { setMedia(media.filter(function (x, j) { return j !== i; })); } };
      }),
      addFiles: function (files) {
        var list = Array.prototype.slice.call(files || []);
        if (!list.length) return;
        var done = [], left = list.length;
        var finish = function () { left--; if (left > 0) return; var cur = (self.state && self.state.media) || []; var added = done.filter(Boolean); if (added.length) { self.setState({ media: cur.concat(added) }); toast(self, added.length === 1 ? 'Media added' : added.length + ' media added'); } };
        list.forEach(function (file, k) {
          var id = 'md' + Date.now().toString(36) + k;
          if (/^video\//.test(file.type)) { done[k] = { id: id, kind: 'video', name: file.name, alt: '' }; finish(); return; }
          readImage(file, 1000).then(function (url) { done[k] = { id: id, kind: 'image', src: url, name: file.name, alt: '' }; finish(); }, function (er) { toast(self, er.message, true); finish(); });
        });
      }
    });

    // ---- classification: main category, subcategories, template ----
    assign(v, {
      mainCat: mainCat, mainCats: MAIN_CATS,
      setMainCat: function (e) {
        var m = e.target.value, subs = subcats.filter(function (x) { return PARENT[x] === m; });
        self.setState({ cat: subs[0] || m, subcats: subcats });
      },
      subGroups: (function () {
        var parents = MAIN_CATS.filter(function (m) { return CATS.some(function (c) { return PARENT[c[0]] === m; }); });
        parents.sort(function (a, b) { return (b === mainCat) - (a === mainCat); });
        return parents.map(function (m) {
          return { name: m, items: CATS.filter(function (c) { return PARENT[c[0]] === m; }).map(function (c) {
            var on = subcats.indexOf(c[0]) >= 0;
            return { k: c[0], label: c[0], on: on, toggle: function () {
              var next = on ? subcats.filter(function (x) { return x !== c[0]; }) : subcats.concat(c[0]);
              var main = mainCat || PARENT[c[0]];
              var inMain = next.filter(function (x) { return PARENT[x] === main; });
              self.setState({ subcats: next, cat: inMain[0] || main });
            } };
          }) };
        });
      })(),
      tplSel: tplOwn, tplName: tpl.tpl.name, catTplName: tplBy(catTpl).name, tplCaps: caps.map(function (c) { return CAP_LABEL[c]; }).filter(Boolean),
      tplSource: tpl.source === 'category' ? 'From category · ' + tpl.from : TPL_SOURCE[tpl.source],
      setTpl: function (e) {
        var id = e.target.value, d = tplDefaults(id || catTpl), patch = { template: id };
        if (!editing && !s.unit && d.unit !== 'pc') patch.unit = d.unit;
        if (!editing && d.format !== 'physical') patch.format = d.format;
        self.setState(patch);
      },
      templates: TEMPLATES
    });

    // ---- specifications: the template's groups as tables; this product can reorder, rename, add and hide ----
    var shownGroups = [];
    var specGroups = sm.groups.map(function (g, gi) {
      var rows = g.keys.filter(function (k) { return s.allData || inline[k] || sm.extra[k] || sm.labels[k]; });
      var show = rows.length > 0 || g.keys.length === 0 || !!s.allData;
      if (show) shownGroups.push(gi);
      return { gi: gi, name: g.name, show: show, total: g.keys.length,
        rename: function (e) { var val = e.target.value; setLayout(function (L) { L.groups[gi].name = val; }); },
        remove: function () { setLayout(function (L) { L.groups[gi].keys.forEach(function (k) { if (L.extra[k]) delete L.extra[k]; else L.hidden.push(k); }); L.groups.splice(gi, 1); }); toast(self, 'Group removed from this product. Its values are kept.'); },
        addSpec: function () { var k = 'x_' + Date.now().toString(36); setLayout(function (L) { L.extra[k] = { l: 'New specification' }; L.groups[gi].keys.push(k); }); },
        rows: rows.map(function (k, ri) {
          var r = fieldRow(k, 'pf-d-');
          var moveTo = function (other) { var a = g.keys.indexOf(k), b = g.keys.indexOf(other); setLayout(function (L) { L.groups[gi].keys = swap(L.groups[gi].keys, a, b); }); };
          return assign(r, {
            first: ri === 0, last: ri === rows.length - 1,
            up: function () { if (ri > 0) moveTo(rows[ri - 1]); }, down: function () { if (ri < rows.length - 1) moveTo(rows[ri + 1]); },
            remove: function () { setLayout(function (L) { L.groups[gi].keys = L.groups[gi].keys.filter(function (x) { return x !== k; }); if (L.extra[k]) delete L.extra[k]; else L.hidden.push(k); }); },
            rename: function (e) { var val = e.target.value; setLayout(function (L) { if (L.extra[k]) L.extra[k].l = val; else L.labels[k] = val; }); }
          });
        })
      };
    });
    specGroups.forEach(function (g) {
      var at = shownGroups.indexOf(g.gi), before = shownGroups[at - 1], after = shownGroups[at + 1];
      g.first = before == null; g.last = after == null;
      g.up = function () { if (before != null) setLayout(function (L) { L.groups = swap(L.groups, g.gi, before); }); };
      g.down = function () { if (after != null) setLayout(function (L) { L.groups = swap(L.groups, g.gi, after); }); };
    });
    var structured = sm.groups.reduce(function (a, g) { return a.concat(g.keys); }, []);
    assign(v, {
      specGroups: specGroups.filter(function (g) { return g.show; }),
      addGroup: function () { setLayout(function (L) { L.groups.push({ name: 'New group', keys: [] }); }); },
      specTotal: structured.length, specMore: structured.filter(function (k) { return !(inline[k] || sm.extra[k] || sm.labels[k]); }).length, allData: !!s.allData,
      toggleAllData: function () { self.setState({ allData: !s.allData }); },
      hiddenRows: sm.hidden.length, showHidden: function () { setLayout(function (L) { L.hidden = []; }); },
      hiddenCount: hiddenValues(asProduct, tpl.id).filter(function (k) { return !sm.extra[k] && k.indexOf('x_') !== 0; }).length,
      // Product data drawer: every structured field by group, then the Google mapping
      dataGroups: sm.groups.filter(function (g) { return g.keys.length; }).map(function (g) { return { name: g.name, rows: g.keys.map(function (k) { return fieldRow(k, 'pf-dd-'); }) }; }),
      dataChips: structured.slice(0, 5).map(labelOf), dataCount: structured.length
    });

    // ---- pricing ----
    var lastBuy = live ? lastPurchaseCost(String(sku).trim() || (variants[0] && variants[0].sku) || '', title) : null;
    var invCost = live ? inventoryCost(String(sku).trim()) || (variants[0] && variants[0].sku ? inventoryCost(variants[0].sku) : 0) : 0;
    var setSell = function (k) { var e = {}; Object.keys(errs).forEach(function (x) { if (!/^(wholesale|moq|vw\d+|vm\d+|price)$/.test(x)) e[x] = errs[x]; }); self.setState({ sell: k, errors: Object.keys(e).length ? e : null }); };
    assign(v, {
      price: String(price).replace(/^৳/, ''), typePrice: function (e) { self.setState({ price: e.target.value }); }, cost: String(cost).replace(/^৳/, ''), typeCost: function (e) { self.setState({ cost: e.target.value }); },
      mrp: String(mrp).replace(/^৳/, ''), typeMrp: function (e) { self.setState({ mrp: e.target.value }); }, priceReq: sell !== 'wholesale', wsOn: wsOn, costReq: !wsOn,
      margin: pr ? Math.round(prof / pr * 100) + '% est. margin' : '0% est. margin', marginBad: pr > 0 && prof < 0,
      profit: pr && co ? bdt(prof) : '—', saves: mr > pr && pr > 0 ? bdt(mr - pr) + ' (' + Math.round((mr - pr) / mr * 100) + '%)' : '—',
      lastBuy: lastBuy ? bdt(lastBuy.cost) : '—', lastBuyRef: lastBuy ? lastBuy.ref : '', invCost: invCost ? bdt(invCost) : '—',
      sell: sell, sellModes: SELL_MODES, setSell: function (e) { setSell(e.target.value); }, sellsWs: sellsWs,
      sellHelp: sell === 'retail' ? 'Sold one at a time at the selling price.' : sell === 'wholesale' ? 'Sold only in bulk, at the wholesale price, from the minimum order up.' : 'Sold at the selling price, and at the wholesale price from the minimum order up.',
      wholesale: wholesale, typeWholesale: function (e) { self.setState({ wholesale: e.target.value }); }, moq: moq, typeMoq: function (e) { self.setState({ moq: e.target.value }); }
    });

    // ---- product model: format, selling mode, sellability ----
    assign(v, {
      format: format, physical: physical, formats: FORMATS, setFormat: function (e) { self.setState({ format: e.target.value }); },
      sellability: sellability, sellabilities: SELLABILITY,
      setSellability: function (e) {
        var k = e.target.value;
        self.setState({ sellability: k, oversell: k === 'preorder' || k === 'mto', backorder: k === 'backorder', giftOnly: k === 'gift' });
      },
      backorder: backorder, restockAt: f('restockAt', ''), typeRestock: function (e) { self.setState({ restockAt: e.target.value }); },
      sellabilityHelp: { normal: 'Stops selling at 0.', preorder: 'Keeps selling when out of stock (pre-order).', backorder: 'Takes orders while out of stock, with the date it is back.', gift: 'Not for sale: only offers give it away.', catalogue: 'Shown in the catalogue, not sold online.', mto: 'Made after the order: keeps selling at 0.' }[sellability],
      digital: f('digital', null) || { file: '', version: '1.0', limit: '5', days: '365' },
      setDigital: function (k) { return function (e) { var d = assign({}, f('digital', null) || { file: '', version: '1.0', limit: '5', days: '365' }); d[k] = e.target.value; self.setState({ digital: d }); }; },
      keysFree: live && format === 'licence' && (sku || ownId) ? freeKeys(sku || ownId) : 0, keysAll: live && format === 'licence' && (sku || ownId) ? keysOf(sku || ownId) : [],
      keysText: s.keysText || '', typeKeys: function (e) { self.setState({ keysText: e.target.value }); },
      addKeys: function () {
        var k = String(sku || '').trim();
        if (!k) { toast(self, 'Give the product a SKU first. Keys are kept by SKU.', true); return; }
        var r = addKeys(k, s.keysText || '');
        self.setState({ keysText: '' });
        toast(self, r.added + ' keys added' + (r.dupes ? ' · ' + r.dupes + ' already in a pool, skipped' : ''));
      }
    });

    // ---- variants: options and their values make the combinations; each keeps its own price, codes and publishing ----
    var applyOpts = function (next, mapParts) {
      var by = {};
      variants.forEach(function (x) {
        var parts = opts.length ? String(x.name).split(' / ') : [];
        var np = mapParts(parts);
        if (!np) return;
        var n = np.join(' / ');
        if (!by[n]) by[n] = assign(assign({}, x), { name: n });
      });
      var list = next.length ? combos(next).map(function (c) {
        var n = c.join(' / ');
        return by[n] || { name: n, swatch: '', price: null, mrp: null, stock: 0, sku: String(sku).trim() ? String(sku).trim() + '-' + c.map(codeOf).join('-') : '', barcode: '', wholesale: '', moq: '', published: true };
      }) : [];
      var p = { opts: next, variants: list };
      if (errs.opts) { var o = assign({}, errs); delete o.opts; p.errors = o; }
      self.setState(p);
    };
    var setOpt = function (i, patch) { return opts.map(function (o, j) { return j === i ? assign({ name: o.name, values: o.values.slice() }, patch) : o; }); };
    var setVar = function (i, k, val) {
      var list = variants.map(function (x, j) { if (j !== i) return x; var o = assign({}, x); o[k] = val; return o; });
      var p = { variants: list }, ek = (k === 'wholesale' ? 'vw' : 'vm') + i;
      if (errs[ek]) { var o = assign({}, errs); delete o[ek]; p.errors = o; }
      self.setState(p);
    };
    var varFields = tplFields.filter(function (fd) { return fd.variant; });
    assign(v, {
      hasOpts: opts.length > 0, hasVariants: variants.length > 0, optCount: opts.length, varCount: variants.length,
      addOption: function () {
        var n = opts.length + 1;
        applyOpts(opts.concat({ name: 'Option ' + n, values: ['Value 1'] }), function (parts) { return parts.concat('Value 1'); });
      },
      optRows: opts.map(function (o, i) {
        return { key: 'o' + i, id: 'pf-opt-' + i, name: o.name, first: i === 0, last: i === opts.length - 1,
          rename: function (e) { self.setState({ opts: setOpt(i, { name: e.target.value }) }); },
          up: function () { applyOpts(swap(opts, i, i - 1), function (parts) { return swap(parts, i, i - 1); }); },
          down: function () { applyOpts(swap(opts, i, i + 1), function (parts) { return swap(parts, i, i + 1); }); },
          remove: function () { applyOpts(opts.filter(function (x, j) { return j !== i; }), function (parts) { return parts.filter(function (x, j) { return j !== i; }); }); },
          addValue: function () { var n = o.values.length + 1; while (o.values.indexOf('Value ' + n) >= 0) n++; applyOpts(setOpt(i, { values: o.values.concat('Value ' + n) }), function (parts) { return parts; }); },
          values: o.values.map(function (val, j) {
            return { key: 'v' + j, value: val, only: o.values.length === 1,
              rename: function (e) { var nv = e.target.value, vals = o.values.slice(); vals[j] = nv; applyOpts(setOpt(i, { values: vals }), function (parts) { return parts.map(function (pp, k) { return k === i && pp === val ? nv : pp; }); }); },
              remove: function () { applyOpts(setOpt(i, { values: o.values.filter(function (x, k) { return k !== j; }) }), function (parts) { return parts[i] === val ? null : parts; }); } };
          }) };
      }),
      varRows: variants.map(function (x, i) {
        var avail = live && x.sku ? stockAt(x.sku, '').available : 0;
        var ownData = x.data || {};
        return { key: 'vr' + i, i: i, name: x.name, swatch: x.swatch || '',
          price: x.price != null && x.price !== '' ? String(+x.price + shift) : '', pricePh: pr ? String(pr) : '',
          typePrice: function (e) { var t = e.target.value.replace(/[^\d.]/g, ''); setVar(i, 'price', t === '' ? null : +t - shift); },
          mrp: x.mrp != null && x.mrp !== '' ? String(x.mrp) : '', mrpPh: mr ? String(mr) : '', typeMrp: function (e) { var t = e.target.value.replace(/[^\d.]/g, ''); setVar(i, 'mrp', t === '' ? null : +t); },
          sku: x.sku || '', typeSku: function (e) { setVar(i, 'sku', e.target.value); },
          gtin: x.barcode || '', typeGtin: function (e) { setVar(i, 'barcode', e.target.value); },
          avail: avail >= UNTRACKED ? '—' : String(avail),
          published: x.published !== false, togglePub: function () { setVar(i, 'published', x.published === false); },
          mediaId: x.media || '', setMedia: function (e) { setVar(i, 'media', e.target.value); },
          ws: x.wholesale == null ? '' : x.wholesale, moq: x.moq == null ? '' : x.moq, wsId: 'pf-vw' + i, moqId: 'pf-vm' + i,
          wsErr: errs['vw' + i] || '', moqErr: errs['vm' + i] || '',
          typeWs: function (e) { setVar(i, 'wholesale', e.target.value); }, typeMoq: function (e) { setVar(i, 'moq', e.target.value); },
          data: varFields.map(function (fd) {
            return { k: fd.k, l: fd.l + (fd.u ? ' (' + fd.u + ')' : ''), o: fd.t === 'yes' ? ['Yes', 'No'] : fd.o, value: ownData[fd.k] || '',
              onChange: function (e) { var d = assign({}, ownData); if (e.target.value) d[fd.k] = e.target.value; else delete d[fd.k]; setVar(i, 'data', d); } };
          }) };
      }),
      mediaChoices: media.map(function (m, i) { return { id: m.id || 'm' + i, label: (i === 0 ? 'Primary media' : 'Media ' + (i + 1)) + (m.name ? ' · ' + m.name : '') }; }),
      wsPh: moneyNum(wholesale) ? String(moneyNum(wholesale)) : '', moqPh: wholeNum(moq) ? String(wholeNum(moq)) : '',
      unpublishedVars: variants.filter(function (x) { return x.published === false; }).length
    });

    // ---- inventory, identifiers & units (drawer) ----
    var idRows = ids.map(function (x, i) {
      var set = function (key) { return function (e) { var l = ids.map(function (y, j) { if (j !== i) return y; var o = assign({}, y); o[key] = e.target.value; return o; }); var p2 = { ids: l, altText: null }; if (errs.ids) { var o2 = assign({}, errs); delete o2.ids; p2.errors = o2; } self.setState(p2); }; };
      var bad = x.value ? validateId(x.type, x.value) : '';
      var owner = live && x.value && !bad ? idOwner(x.value, ownId || sku) : null;
      return { key: 'id' + i, type: x.type, value: x.value, variant: x.variant || '', hint: (ID_TYPES.filter(function (t) { return t.k === x.type; })[0] || {}).hint || '',
        shown: !((x.type === 'alt' || x.type === 'mpn') && !x.variant),
        err: bad || (owner ? 'Used by “' + owner.name + '”' : ''), setType: set('type'), setValue: set('value'), setVariant: set('variant'),
        remove: function () { self.setState({ ids: ids.filter(function (y, j) { return j !== i; }), altText: null }); } };
    });
    var mpnIdx = -1;
    ids.forEach(function (x, i) { if (mpnIdx < 0 && x.type === 'mpn' && !x.variant) mpnIdx = i; });
    var mpn = mpnIdx >= 0 ? ids[mpnIdx].value : '';
    var altList = ids.filter(function (x) { return x.type === 'alt' && !x.variant; }).map(function (x) { return x.value; });
    var gtinBad = String(gtin).trim() ? validateId('gtin', String(gtin).trim()) : '';
    var unitPacks = packs.filter(function (k) { return String(k.name || '').trim() && Number(k.qty) > 0; });
    var unitOpts = [{ k: '', label: unitOf(unit).label }].concat(unitPacks.map(function (k) { return { k: k.id || k.name, label: k.name }; }));
    var packOfUnit = function (k) { return unitPacks.filter(function (x) { return (x.id || x.name) === k; })[0]; };
    var salePack = packOfUnit(saleUnit);
    assign(v, {
      invMode: invMode, invModes: INV_MODES,
      setInvMode: function (e) { var k = e.target.value, p = { invMode: k }; if (k === 'weight' && !unitOf(unit).frac) p.unit = 'kg'; self.setState(p); },
      invLine: INV_MODES.filter(function (x) { return x[0] === invMode; })[0][1] + (String(sku).trim() ? ' · SKU ' + String(sku).trim() : '') + ' · ' + unitOf(unit).label,
      serialOn: serialOn, expiresOn: expiresOn, weightOn: physical && invMode === 'weight',
      sntOpts: (invMode === 'serial' ? [['serial', 'Serial number']] : [['imei1', '1 IMEI'], ['imei2', '2 IMEIs (dual SIM)']]).map(function (o) { return { l: o[1], on: o[0] === snt, pick: function () { self.setState({ snt: o[0] }); } }; }),
      snCount: live && serialOn ? (String(sku).trim() || variants.length ? (function () { var keys = variants.length ? variants.map(function (x) { return x.sku; }).filter(Boolean) : [String(sku).trim()]; var n = keys.reduce(function (a, k) { return a + Math.max(0, stockAt(k, '').onHand); }, 0); return n + (invMode === 'imei' ? (n === 1 ? ' IMEI' : ' IMEIs') : (n === 1 ? ' serial' : ' serials')); })() : '—') : '—',
      shelfN: shelfN, typeShelf: function (e) { var p = { shelfN: e.target.value }; if (errs.shelf) { var o = assign({}, errs); delete o.shelf; p.errors = o; } self.setState(p); }, shelfU: shelfU, setShelfU: function (e) { self.setState({ shelfU: e.target.value }); },
      shelfEx: 'Made today → good until ' + (function () { var d = new Date(Date.UTC(2026, 8, 19)); var n = +shelfN || 0; if (shelfU === 'days') d.setUTCDate(d.getUTCDate() + n); else if (shelfU === 'weeks') d.setUTCDate(d.getUTCDate() + n * 7); else if (shelfU === 'months') d.setUTCMonth(d.getUTCMonth() + n); else d.setUTCFullYear(d.getUTCFullYear() + n); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); })(),
      lowAt: lowAt, typeLowAt: function (e) { self.setState({ lowAt: e.target.value.replace(/\D/g, '') }); },
      sku: sku, typeSku: function (e) { var p = { sku: e.target.value }; if (errs.sku) { var o = assign({}, errs); delete o.sku; p.errors = o; } self.setState(p); },
      gtin: gtin, typeGtin: function (e) { var p = { gtin: e.target.value }; if (errs.barcode) { var o = assign({}, errs); delete o.barcode; p.errors = o; } self.setState(p); },
      gtinWarn: gtinBad, mpn: mpn,
      typeMpn: function (e) { var val = e.target.value, l = ids.slice(); if (mpnIdx >= 0) { if (val) l[mpnIdx] = assign(assign({}, l[mpnIdx]), { value: val }); else l.splice(mpnIdx, 1); } else if (val) l.push({ type: 'mpn', value: val, variant: '' }); self.setState({ ids: l }); },
      altText: s.altText != null ? s.altText : altList.join(', '),
      typeAlt: function (e) {
        var text = e.target.value, parsed = text.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        var l = ids.filter(function (x) { return !(x.type === 'alt' && !x.variant); }).concat(parsed.map(function (x) { return { type: 'alt', value: x, variant: '' }; }));
        var p = { ids: l, altText: text }; if (errs.ids) { var o = assign({}, errs); delete o.ids; p.errors = o; } self.setState(p);
      },
      internalBc: internalBc, typeInternal: function (e) { var p = { internalBc: e.target.value }; if (errs.internal) { var o = assign({}, errs); delete o.internal; p.errors = o; } self.setState(p); },
      genBarcode: function () { var b, i = 0; do { b = inStoreCode(); i++; } while (codeOwner('barcode', b, ownId, savedList) && i < 50); self.setState({ internalBc: b }); toast(self, 'New in-store barcode made. It is unique in your shop.'); },
      idTypes: ID_TYPES, idRows: idRows.filter(function (r) { return r.shown; }), idErr: errs.ids || '',
      addId: function () { self.setState({ ids: ids.concat({ type: 'supplier', value: '', variant: '' }) }); },
      variantSkus: variants.map(function (x) { return { sku: x.sku, name: x.name }; }).filter(function (x) { return x.sku; }),
      // units & packs: stock is kept in the base unit; a pack is a number of base units
      unit: unit, units: UNITS, setUnit: function (e) { self.setState({ unit: e.target.value }); }, unitShort: unitOf(unit).short,
      unitOpts: unitOpts, saleUnit: saleUnit, setSaleUnit: function (e) { self.setState({ saleUnit: e.target.value }); }, buyUnit: buyUnit, setBuyUnit: function (e) { self.setState({ buyUnit: e.target.value }); },
      packConv: salePack ? '1 ' + salePack.name + ' = ' + salePack.qty + ' ' + unitOf(unit).short : '1 ' + unitOf(unit).one + ' = 1 ' + unitOf(unit).one,
      packRows: packs.map(function (k, i) {
        var set = function (key) { return function (e) { var l = packs.map(function (x, j) { return j === i ? assign(assign({}, x), (function () { var o = {}; o[key] = key === 'qty' ? e.target.value.replace(/[^\d.]/g, '') : e.target.value; return o; })()) : x; }); self.setState({ packs: l }); }; };
        return { key: (k.id || 'pk') + i, name: k.name, qty: k.qty, barcode: k.barcode || '', line: k.name && Number(k.qty) > 0 ? packLine({ unit: unit }, { name: k.name, qty: Number(k.qty) }) : '',
          typeName: set('name'), typeQty: set('qty'), typeBarcode: set('barcode'), remove: function () { self.setState({ packs: packs.filter(function (x, j) { return j !== i; }) }); } };
      }),
      addPack: function () { self.setState({ packs: packs.concat({ id: 'pk' + Date.now().toString(36), name: 'Box of 12', qty: '12', barcode: '' }) }); },
      packErr: errs.packs || '',
      // opening stock (posted once on save) and the live stock of this product at each place
      open0: f('open0', '0'), typeOpen0: function (e) { self.setState({ open0: e.target.value }); },
      open1: f('open1', '0'), typeOpen1: function (e) { self.setState({ open1: e.target.value }); },
      openPlaces: OPEN_PLACES,
      stockHere: OPEN_PLACES.map(function (pl) {
        if (!live) return { avail: 0, held: 0 };
        var keys = variants.length ? variants.map(function (x) { return x.sku; }).filter(Boolean) : [sku || ownId].filter(Boolean);
        return keys.reduce(function (a, k) { var st = stockAt(k, pl); return { avail: a.avail + Math.max(0, st.available), held: a.held + st.held }; }, { avail: 0, held: 0 });
      }),
      showStock: physical && !(bundle && bundle.type !== 'kit')
    });

    // ---- shipping & fulfilment (drawer) ----
    var setShip = function (k) { return function (e) { var o = assign({}, ship); o[k] = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : !ship[k]; self.setState({ ship: o }); }; };
    var dims = [ship.length, ship.width, ship.height].filter(function (x) { return String(x).trim(); });
    assign(v, {
      ship: ship, setShip: setShip, toggleFragile: function () { var o = assign({}, ship); o.fragile = !ship.fragile; self.setState({ ship: o }); },
      shipLine: format === 'digital' ? 'Digital / downloadable · file, download limit and access' : format === 'licence' ? 'Digital licence · ' + (live ? freeKeys(sku || ownId) : 0) + ' free keys' : format === 'service' ? 'Service / non-stock · nothing to ship' :
        (String(ship.weight).trim() || dims.length ? 'Physical · ' + [String(ship.weight).trim() ? ship.weight + ' kg' : '', dims.length === 3 ? dims.join(' × ') + ' cm' : '', ship.fragile ? 'Fragile' : ''].filter(Boolean).join(' · ') : 'Physical · shipping weight/dimensions · parcel defaults'),
      shipFrom: live ? onlinePlace() : ''
    });

    // ---- search engine listing ----
    var handleAuto = slugOf(title) || 'untitled-product', handle = f('handle', '') || handleAuto;
    assign(v, {
      seoOpen: !!s.seoOpen, toggleSeo: function () { self.setState({ seoOpen: !s.seoOpen }); },
      handle: handle, handleOwn: f('handle', ''), handleAuto: handleAuto, typeHandle: function (e) { self.setState({ handle: slugOf(e.target.value) === handleAuto ? '' : e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') }); },
      serpTitle: seoT || (title || 'Untitled product') + ' Price in Bangladesh', serpDesc: seoD || plainText(short) || 'Add a short description to improve the search preview.',
      seoT: seoT, seoD: seoD, typeSeoT: function (e) { self.setState({ seoT: e.target.value }); }, typeSeoD: function (e) { self.setState({ seoD: e.target.value }); }, seoTCount: seoT.length + ' of 70 letters',
      noindex: !!f('noindex', false), indexOpts: [['index', 'Index'], ['noindex', 'Noindex']].map(function (o) { var on = (o[0] === 'noindex') === !!f('noindex', false); return { l: o[1], on: on, pick: function () { self.setState({ noindex: o[0] === 'noindex' }); } }; }),
      faqs: faqs.map(function (q) { return { q: q[0], a: q[1] }; }),
      addFaq: function () { self.setState({ faqs: faqs.concat([['New question', 'Answer']]) }); },
      setFaq: function (i, k) { return function (e) { self.setState({ faqs: faqs.map(function (q, j) { if (j !== i) return q; var n = q.slice(); n[k] = e.target.value; return n; }) }); }; },
      removeFaq: function (i) { return function () { self.setState({ faqs: faqs.filter(function (q, j) { return j !== i; }) }); }; }
    });

    // ---- relationships + bundle (drawer) ----
    assign(v, {
      relRows: REL_KINDS.map(function (rk) {
        var cur = rk.many ? rel[rk.k] || [] : rel[rk.k] ? [rel[rk.k]] : [];
        return { k: rk.k, label: rk.label, many: rk.many, items: cur.map(function (id) { return { id: id, name: nameOfId(id), remove: function () { var r2 = assign({}, rel); r2[rk.k] = rk.many ? cur.filter(function (x) { return x !== id; }) : ''; self.setState({ rel: r2 }); } }; }),
          options: choices.filter(function (c) { return cur.indexOf(c.id) < 0; }).map(function (c) { return { id: c.id, name: c.name }; }),
          add: function (e) { var id = e.target.value; if (!id) return; var r2 = assign({}, rel); r2[rk.k] = rk.many ? cur.concat(id) : id; self.setState({ rel: r2 }); e.target.value = ''; } };
      }),
      relCount: REL_KINDS.reduce(function (a, rk) { return a + (rk.many ? (rel[rk.k] || []).length : rel[rk.k] ? 1 : 0); }, 0),
      isBundle: !!bundle, bundleType: bundle ? bundle.type : 'virtual', bundleTypes: BUNDLE_TYPES, bundleErr: errs.bundle || '',
      toggleBundle: function () { self.setState({ bundle: bundle ? null : { type: 'virtual', parts: [] } }); },
      setBundleType: function (k) { return function () { self.setState({ bundle: assign(assign({}, bundle), { type: k }) }); }; },
      partChoices: catalog.filter(function (c) { return !isVirtualRow(c) && c.sku !== sku && !c.bundle; }),
      partRows: (bundle ? bundle.parts : []).map(function (pt, i) {
        var row = catalog.filter(function (c) { return c.sku === pt.sku; })[0];
        var set = function (key) { return function (e) { var l = bundle.parts.map(function (x, j) { if (j !== i) return x; var o = assign({}, x); o[key] = key === 'qty' ? e.target.value.replace(/\D/g, '') : e.target.value; return o; }); self.setState({ bundle: assign(assign({}, bundle), { parts: l }) }); }; };
        return { key: 'pt' + i, sku: pt.sku, qty: pt.qty, free: row ? stockAt(row.sku, '').available : 0, setSku: set('sku'), setQty: set('qty'),
          remove: function () { self.setState({ bundle: assign(assign({}, bundle), { parts: bundle.parts.filter(function (x, j) { return j !== i; }) }) }); } };
      }),
      addPart: function () { self.setState({ bundle: assign(assign({}, bundle), { parts: (bundle.parts || []).concat({ sku: '', qty: '1' }) }) }); },
      bundleCan: bundle && bundle.parts.length && live ? Math.max(0, Math.min.apply(null, bundle.parts.map(function (pt) { var q = Math.max(1, Number(pt.qty) || 1); return pt.sku ? Math.floor(stockAt(pt.sku, '').available / q) : 0; }))) : 0
    });

    // ---- side: status, organization, warranty ----
    var collections = f('collections', []);
    assign(v, {
      status: status, setStatus: function (e) { self.setState({ status: e.target.value }); },
      isDeleted: status === 'deleted' || !!(orig && orig.st === 'deleted'),
      brand: brand, brands: BRANDS, typeBrand: function (e) { self.setState({ brand: e.target.value }); },
      collections: collections.map(function (c) { return { name: c, remove: function () { self.setState({ collections: collections.filter(function (x) { return x !== c; }) }); } }; }),
      colOpen: s.colText != null, colText: s.colText || '', colSuggest: COLLECTIONS.filter(function (c) { return collections.indexOf(c) < 0; }),
      openCol: function () { self.setState({ colText: '' }); }, typeCol: function (e) { self.setState({ colText: e.target.value }); },
      addCol: function () { var t = String(s.colText || '').trim(); if (t && collections.indexOf(t) < 0) self.setState({ collections: collections.concat(t), colText: null }); else self.setState({ colText: null }); },
      colKey: function (e) { if (e.key === 'Enter') { e.preventDefault(); v.addCol(); } else if (e.key === 'Escape') self.setState({ colText: null }); },
      tagText: s.tagText != null ? s.tagText : tags.join(', '),
      typeTags: function (e) { var t = e.target.value; self.setState({ tagText: t, tags: t.split(',').map(function (x) { return x.trim(); }).filter(Boolean) }); },
      wYes: wq === 'yes', wqOpts: seg([['yes', 'Yes'], ['no', 'No']], wq, 'wq'), wp: wp, setWp: function (e) { self.setState({ wp: e.target.value, wtext: null }); },
      wpInfo: WP[wp].map(function (x) { return { k: x[0], v: x[1] }; }), wpText: wtext, typeWtext: function (e) { self.setState({ wtext: e.target.value }); }, wpStart: WPS[wp],
      warrantyLine: wq === 'yes' ? WP_LINE[wp] : 'No warranty',
      sg: sg, setSg: function (e) { self.setState({ sg: e.target.value }); }, hasSg: sg !== 'none',
      sgHead: sg !== 'none' ? SG[sg][0] : [], sgRows: sg !== 'none' ? SG[sg][1] : []
    });

    // ---- Google product data and listing readiness ----
    var gCatAuto = GOOGLE_CAT[cat] || GOOGLE_CAT[mainCat] || '';
    var setG = function (k) { return function (e) { var o = assign({}, google); o[k] = e.target.value; self.setState({ google: o }); }; };
    var gtinState = !String(gtin).trim() ? ['Review', 'warn'] : gtinBad ? ['Fix', 'bad'] : ['Ready', 'ok'];
    var readiness = [
      ['Brand', brand.trim() ? ['Ready', 'ok'] : ['Missing', 'warn']],
      ['GTIN', gtinState],
      ['Google category', google.category || gCatAuto ? ['Ready', 'ok'] : ['Review', 'warn']],
      ['Condition', ['Ready', 'ok']]
    ];
    assign(v, {
      google: google, setG: setG, gCatAuto: gCatAuto || 'Pick a main category first',
      readiness: readiness.map(function (r) { return { l: r[0], st: r[1][0], tone: r[1][1] }; })
    });

    // ---- publishing: channels with their readiness, catalogues, variant exceptions ----
    var pub = f('publishing', null) || {};
    var conn = live ? getChannels().conn : {};
    var pubCh = assign({ online: true, pos: true, meta: !!conn.meta, gmc: !!conn.gmc, wholesale: sellsWs }, pub.channels || {});
    var branches = live ? getBranchNames() : [];
    var catalogues = [['retail', 'Retail catalogue']].concat(wsOn ? [['b2b', 'Wholesale / B2B']] : []).concat(branches.map(function (b) { return ['br:' + b, b]; }));
    var pubCat = pub.catalogues || {};
    var row0 = { st: status === 'scheduled' ? 'draft' : status, sell: sell, price: moneyNum(price), wholesale: moneyNum(wholesale), giftOnly: giftOnly };
    var noDesc = !String(short).trim() && !plainText(long).trim();
    var issuesOf = function (k) {
      var l = [];
      var why = whyNotSellable(row0, k === 'wholesale' ? 'wholesale' : 'online');
      if (why) l.push(why);
      if (sellability === 'catalogue' && k !== 'wholesale') l.push('Catalogue-only');
      if (k === 'online' || k === 'meta' || k === 'gmc') { if (!media.length) l.push('No photo'); }
      if (k === 'online' && noDesc) l.push('No description');
      if (k === 'meta' && !String(sku).trim()) l.push('SKU missing');
      if (k === 'gmc') { if (gtinState[1] !== 'ok') l.push(gtinState[1] === 'bad' ? 'GTIN is not valid' : 'Missing GTIN'); if (!(google.category || gCatAuto)) l.push('No Google category'); }
      if ((k === 'meta' || k === 'gmc') && live && !conn[k]) l.push('Not connected');
      return l;
    };
    var pubAvail = PUB_CHANNELS.filter(function (c) { return c[0] === 'online' ? !live || hasModule('online') : c[0] === 'pos' ? !live || hasModule('pos') : c[0] === 'wholesale' ? wsOn : !live || hasModule('channels'); });
    var setPub = function (patch) { self.setState({ publishing: assign(assign({}, pub), patch) }); };
    assign(v, {
      pubRows: pubAvail.map(function (c) {
        var iss = issuesOf(c[0]), on = !!pubCh[c[0]];
        return { k: c[0], label: c[1], on: on, issues: iss, ready: iss.length ? (iss.length === 1 ? '1 readiness issue' : iss.length + ' readiness issues') : 'Ready',
          toggle: function () { var o = assign({}, pubCh); o[c[0]] = !on; setPub({ channels: o }); } };
      }),
      catRows: catalogues.map(function (c) { var on = pubCat[c[0]] !== false; return { k: c[0], label: c[1], on: on, toggle: function () { var o = assign({}, pubCat); o[c[0]] = !on; setPub({ catalogues: o }); } }; }),
      pubPills: status === 'active' ? pubAvail.filter(function (c) { return pubCh[c[0]]; }).map(function (c) { return c[1]; }) : [],
      checks: [['Title', !!String(title).trim()], ['Photos', media.length > 0], ['Short description', !!String(short).trim()], ['Price and cost', (sell === 'wholesale' ? moneyNum(wholesale) > 0 : pr > 0) && co > 0], ['Category', !!cat], ['SKU and barcode', !!String(sku).trim() && !!barcode], ['Warranty', wq === 'yes'], ['SEO', !!seoD]].map(function (k) { return { l: k[0], ok: k[1] }; })
    });

    // ---- validation, unsaved changes and save ----
    // SKU and barcode must not belong to another product (list, stock catalogue or saved in this browser).
    var skuOwner = live ? codeOwner('sku', sku, ownId, savedList) : null;
    var gtinOwner = live && String(gtin).trim() ? codeOwner('barcode', gtin, ownId, savedList) : null, intOwner = live && String(internalBc).trim() ? codeOwner('barcode', internalBc, ownId, savedList) : null;
    var dupSku = skuOwner ? 'This SKU is already used by “' + skuOwner.name + '”.' : '';
    var dupGtin = gtinOwner ? 'This barcode is already used by “' + gtinOwner.name + '”.' : '';
    var dupInt = intOwner ? 'This barcode is already used by “' + intOwner.name + '”.' : String(internalBc).trim() && String(internalBc).trim() === String(gtin).trim() ? 'The internal barcode is the same as the GTIN.' : '';
    assign(v, { skuErr: errs.sku || dupSku, barcodeErr: errs.barcode || dupGtin, internalErr: errs.internal || dupInt, optErr: errs.opts || '' });
    var check = function (draft) {
      var e = {}, t = String(title).trim();
      if (!t) e.title = 'Enter a product title.'; else if (t.length > 120) e.title = 'Keep the title under 120 letters.';
      var pe = moneyError(price, !draft && sell !== 'wholesale', 'selling price'); if (pe) e.price = pe;
      var ce = moneyError(cost, !draft && !wsOn, 'buying price'); if (ce) e.cost = ce;
      if (sellsWs) {
        var we = wholesaleError(wholesale, !draft); if (we) e.wholesale = we;
        var me = moqError(moq, !draft); if (me) e.moq = me;
        variants.forEach(function (x, i) { var a = wholesaleError(x.wholesale, false), b = moqError(x.moq, false); if (a) e['vw' + i] = a; if (b) e['vm' + i] = b; });
      }
      // options: named, and each value once
      opts.forEach(function (o) {
        if (e.opts) return;
        if (!String(o.name || '').trim()) { e.opts = 'Name every option, for example Colour.'; return; }
        var seen0 = {};
        o.values.forEach(function (x) { var k = String(x || '').trim().toLowerCase(); if (e.opts) return; if (!k) e.opts = o.name + ': name every value.'; else if (seen0[k]) e.opts = o.name + ': ' + x + ' is there twice.'; seen0[k] = 1; });
      });
      if (dupSku) e.sku = dupSku;
      if (dupGtin) e.barcode = dupGtin;
      if (dupInt) e.internal = dupInt;
      // more identifiers: valid for their type, used once (in this product and in the whole catalogue)
      var seen = {};
      ids.forEach(function (x) {
        if (e.ids || !String(x.value || '').trim()) return;
        var k = String(x.value).trim().toLowerCase(), bad = validateId(x.type, x.value), owner = !bad && idOwner(x.value, ownId || sku);
        if (bad) e.ids = idLabel(x.type) + ': ' + bad;
        else if (owner) e.ids = idLabel(x.type) + ' ' + x.value + ' is used by “' + owner.name + '”.';
        else if (seen[k] || k === String(gtin).trim().toLowerCase() || k === String(internalBc).trim().toLowerCase() || k === String(sku).trim().toLowerCase()) e.ids = 'The code ' + x.value + ' is on this product twice.';
        seen[k] = 1;
      });
      // packs: a name and how many base units; a pack barcode is used once
      packs.forEach(function (k) {
        if (e.packs) return;
        if (!String(k.name || '').trim()) e.packs = 'Name each pack, for example Box of 12.';
        else if (!(Number(k.qty) > 1)) e.packs = k.name + ': a pack holds more than 1 ' + unitOf(unit).one + '.';
        else if (k.barcode && idOwner(k.barcode, ownId || sku)) e.packs = k.name + ': barcode ' + k.barcode + ' is used by “' + idOwner(k.barcode, ownId || sku).name + '”.';
        else if (k.barcode && seen[String(k.barcode).toLowerCase()]) e.packs = k.name + ': barcode ' + k.barcode + ' is on this product twice.';
        if (k.barcode) seen[String(k.barcode).toLowerCase()] = 1;
      });
      // a bundle needs its parts
      if (bundle) {
        if (!bundle.parts.filter(function (x) { return x.sku; }).length) e.bundle = 'Add the products this bundle is made of.';
        else if (bundle.parts.some(function (x) { return x.sku && !(Number(x.qty) > 0); })) e.bundle = 'Each part needs a quantity of 1 or more.';
      }
      if (expiresOn && !(/^\d+$/.test(String(shelfN).trim()) && +shelfN > 0)) e.shelf = 'Enter how long it stays good as a whole number above 0.';
      return e;
    };
    var clr = function (k, fn) { return function (ev) { fn(ev); if (errs[k]) { var o = assign({}, errs); delete o[k]; self.setState({ errors: o }); } }; };
    v.typeTitle = clr('title', v.typeTitle); v.typePrice = clr('price', v.typePrice); v.typeCost = clr('cost', v.typeCost);
    v.typeWholesale = clr('wholesale', v.typeWholesale); v.typeMoq = clr('moq', v.typeMoq);
    // The product as it is stored (src/lib/products.js). Values not on this form are kept from the original.
    var buildRecord = function (draft) {
      var o = orig || {};
      var flags = (o.flags || []).filter(function (x) { return x !== 'No description' && !(x === 'No photo' && media.length); });
      if (noDesc) flags.push('No description');
      var g = String(gtin).trim(), it = String(internalBc).trim();
      var idList = ids.filter(function (x) { return String(x.value || '').trim(); }).map(function (x) { return { type: x.type, value: String(x.value).trim(), variant: x.variant || '' }; });
      if (g && it) idList.push({ type: 'alt', value: it, variant: '', internal: true });
      return assign(assign({}, o), {
        id: s.editId || newProductId(), name: String(title).trim(), sku: String(sku).trim(), barcode: g || it, cat: catPathOf(cat), brand: String(brand).trim(),
        st: draft || status === 'scheduled' ? 'draft' : status,
        price: moneyNum(price), cost: moneyNum(cost), mrp: moneyNum(mrp), sell: sell,
        oversell: oversell, barcodeType: g ? (gtinOk(g) ? 'gtin' : '') : it ? 'internal' : '',
        wholesale: sellsWs ? moneyNum(wholesale) : null, moq: sellsWs ? wholeNum(moq) : null,
        opts: opts, variants: variants.map(function (x) { return assign(assign({}, x), { price: x.price != null && x.price !== '' ? +x.price + shift : null, wholesale: sellsWs ? moneyNum(x.wholesale) : null, moq: sellsWs ? wholeNum(x.moq) : null }); }),
        short: short, long: long, seoT: seoT, seoD: seoD, tags: tags, flags: flags, missing: flags.indexOf('No description') >= 0 || flags.indexOf('No photo') >= 0,
        inv: o.inv || 0, loc: o.loc || 0, tbg: o.tbg || '#eef2f6',
        unit: unit, packs: packs.filter(function (k) { return String(k.name || '').trim() && Number(k.qty) > 0; }).map(function (k, i) { return { id: k.id || 'pk' + (i + 1), name: String(k.name).trim(), qty: Number(k.qty), barcode: String(k.barcode || '').trim() }; }),
        ids: idList,
        template: tplOwn, data: data, format: format, digital: format === 'digital' ? f('digital', null) : null,
        backorder: backorder && !oversell, restockAt: backorder ? f('restockAt', '') : '', giftOnly: giftOnly,
        bundle: bundle ? { type: bundle.type, parts: bundle.parts.filter(function (x) { return x.sku; }).map(function (x) { return { sku: x.sku, qty: Math.max(1, Number(x.qty) || 1) }; }) } : null,
        // the reference page's fields
        sellability: sellability, invMode: invMode, snType: serialOn ? snt : null, shelf: expiresOn ? { n: +shelfN, u: shelfU } : null, lowAt: wholeNum(lowAt),
        saleUnit: saleUnit, buyUnit: buyUnit, subcats: subcats.map(catPathOf), collections: collections, media: media, handle: f('handle', ''), noindex: !!f('noindex', false), faqs: faqs,
        ship: physical ? ship : null, warranty: { has: wq === 'yes', policy: wp, text: wtext }, specLayout: f('specLayout', null), publishing: f('publishing', null), google: f('google', null), sizeGuide: sg === 'none' ? null : sg
      });
    };
    var trySave = function (draft, okMsg, opt) {
      opt = opt || {};
      var e = check(draft);
      var order = [].concat.apply([], FIELD_ORDER.map(function (k) { return k === 'variants' ? [].concat.apply([], variants.map(function (x, i) { return ['vw' + i, 'vm' + i]; })) : [k]; }));
      var first = order.filter(function (k) { return e[k]; })[0];
      if (first) {
        var sheet = FIELD_SHEET[first] || (/^v[wm]\d+$/.test(first) ? 'variants' : null);
        var p = { errors: e };
        if (sheet && s.sheet !== sheet) { p.sheet = sheet; p.sheetSnap = self.snapOf(); }
        self.setState(p, function () { setTimeout(function () { var el = document.getElementById('pf-' + first); if (el) { el.focus(); if (el.scrollIntoView) el.scrollIntoView({ block: 'center' }); } }, 80); });
        return;
      }
      // someone else saved this product after this form opened it (optimistic lock): ask before writing over it
      var me = currentUser();
      if (!opt.force && s.editId) {
        var newer = staleSince(s.editId, s.loadedV);
        if (newer && newer.by !== me.name) {
          __confirm({ title: 'Someone else changed this product', body: newer.by + ' saved it ' + agoText(newer.at) + (newer.changes.length ? ' (' + newer.changes.slice(0, 3).join(', ') + ')' : '') + '. Save your version over theirs?', confirmLabel: 'Save mine', tone: 'danger' })
            .then(function (ok) { if (ok) trySave(draft, okMsg, assign(assign({}, opt), { force: true })); });
          return;
        }
      }
      // a big change to the selling price needs a manager (productVersions.js › priceLimit)
      var oldP = orig && orig.price, newP = moneyNum(price);
      if (!draft && !opt.approved && !opt.keepPrice && s.editId && needsPriceApproval(oldP, newP)) { self.setState({ priceAsk: { draft: draft, okMsg: okMsg, opt: opt, from: oldP, to: newP } }); return; }
      var rec0 = buildRecord(draft);
      if (opt.keepPrice) { rec0.price = oldP; rec0.variants = rec0.variants.map(function (x, i) { var ov = ((orig && orig.variants) || [])[i]; return ov ? assign(assign({}, x), { price: ov.price }) : x; }); }
      var rec = saveProduct(rec0, { by: me.name, note: opt.approved ? 'Price change approved by ' + opt.approved : '' }), pre = prefillFrom(rec);
      if (opt.keepPrice) requestPrice({ productId: rec.id, name: rec.name, field: 'price', from: oldP, to: newP, by: me.name });
      // relations, the old draft, a PLU for the shop scale
      REL_KINDS.forEach(function (rk) { setRelation(rec.id, rk.k, rel[rk.k]); });
      dropDraft('new'); dropDraft(rec.id);
      var plu = (rec.ids || []).filter(function (x) { return x.type === 'plu' || x.type === 'scale'; })[0];
      if (plu && rec.sku && rec.unit === 'kg') { try { setWeighed(rec.sku, plu.value); } catch (er) { /* ignore */ } }
      if (!s.editId) self.watchLock(rec.id);
      // opening stock typed in the Inventory drawer goes into stock once (the boxes go back to 0 after saving)
      var opening = format !== 'physical' || (bundle && bundle.type !== 'kit') ? [] : OPEN_PLACES.map(function (pl, i) { return { place: isOnePlace() ? onlinePlace() : pl, qty: wholeNum(f('open' + i, '0')) || 0 }; }).filter(function (x) { return x.qty > 0; });
      if (opening.length && rec.variants && rec.variants.length) __toast('Opening stock for a product with variants is added per variant in Stock › Stock adjustments', { tone: 'info' });
      else opening.forEach(function (x) { addMove({ sku: rec.sku || rec.id, place: x.place, qty: x.qty, kind: 'opening', reason: 'Opening stock', by: me.name, ref: rec.id, op: rec.id + ':opening:' + x.place + ':' + (rec.version || 0) }); });
      // A new product becomes an edit of itself, so the next save updates it instead of adding another.
      window.history.replaceState(window.history.state, '', window.location.pathname + (rec.sku ? '?sku=' + encodeURIComponent(rec.sku) : '?id=' + encodeURIComponent(rec.id)));
      self.setState({ errors: null, editId: rec.id, orig: rec, basePrice: rec.price, variants: pre.variants, status: rec.st, savedList: getSavedProducts(), open0: '0', open1: '0', loadedV: rec.version || 0, autosavedAt: null, recover: null, price: opt.keepPrice ? pre.price : f('price', ''), ids: pre.ids, internalBc: pre.internalBc, gtin: pre.gtin, altText: null },
        function () { self.markSaved(); toast(self, opt.keepPrice ? 'Saved. The new price waits for a manager’s approval.' : okMsg); });
    };
    var errCount = Object.keys(errs).length;
    var drafty = status === 'draft' || status === 'scheduled';
    var saveState = s.autosavedAt ? 'Draft autosaved ' + agoText(s.autosavedAt) : s.dirty ? 'Unsaved changes' : editing && orig && orig.savedAt ? 'Saved ' + agoText(orig.savedAt) : editing ? 'All changes saved' : 'Draft autosave ready';
    var lastV = s.editId ? versionsOf(s.editId) : [];
    assign(v, {
      editing: editing, heading: editing ? 'Edit product' : 'Add product', pageTitle: String(title).trim() || (editing && orig ? orig.name : 'Untitled product'),
      meta: [ST_LABEL[status] || status, mainCat || 'Other', saveState].join(' · '),
      err: errs, hasErr: errCount > 0, errSummary: errCount === 1 ? '1 field needs fixing' : errCount + ' fields need fixing', dirty: !!s.dirty,
      submit: function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); trySave(false, status !== 'active' ? 'Changes saved.' : editing ? 'Changes saved. All products shows the new details.' : 'Product saved and live on the online shop, POS and Facebook shop.'); },
      saveDraft: function () { trySave(true, 'Saved as a draft. Customers can’t see it yet.'); },
      saveLabel: drafty ? 'Save draft' : 'Save', drafty: drafty,
      discard: function () {
        __confirm({ title: 'Discard unsaved changes?', body: 'Every field goes back to how it was when you last saved.', confirmLabel: 'Discard changes', tone: 'danger' })
          .then(function (ok) { if (ok) { dropDraft(s.editId || 'new'); self.restore(); __toast('Changes discarded', { tone: 'info' }); } });
      },
      goBack: function () {
        if (!s.dirty) { window.location.assign('/all-products'); return; }
        __confirm({ title: 'Leave without saving?', body: 'Your changes are kept as a draft on this browser for two weeks.', confirmLabel: 'Leave', tone: 'danger' })
          .then(function (ok) { if (ok) { self.autosave(); window.location.assign('/all-products'); } });
      },
      // autosave and draft recovery (productDrafts.js)
      recover: s.recover ? agoText(s.recover.at) : '',
      restoreDraft: function () { var d = s.recover; self.setState(assign(assign({}, d.state), { recover: null, editId: s.editId, orig: s.orig }), function () { self.checkDirty(); toast(self, 'Unsaved work is back. Save to keep it.'); }); },
      dismissDraft: function () { dropDraft(s.editId || 'new'); self.setState({ recover: null }); },
      // who else has this product open (productVersions.js)
      editors: (s.editors || []).map(function (x) { return x.name; }),
      editAnyway: function () { takeOver(s.editId); self.setState({ editors: editorsOf(s.editId, currentUser(), self.tabId) }); },
      // duplicate: a copy as a new draft
      duplicate: function () {
        if (!s.editId) { toast(self, 'Save the product first, then duplicate it.', true); return; }
        var go = function () { var rec = duplicateProduct(s.editId); if (rec) { toast(self, 'Copied as a draft: ' + rec.name); window.location.href = '/add-product?id=' + encodeURIComponent(rec.id); } };
        if (s.dirty) __confirm({ title: 'Duplicate without your changes?', body: 'The copy is made from the last saved version.', confirmLabel: 'Duplicate' }).then(function (ok) { if (ok) go(); }); else go();
      },
      // version history: view and restore
      versions: lastV, verOpen: !!s.verOpen,
      openVersions: function () { if (!s.editId) { toast(self, 'Save the product first. Every save keeps a version.'); return; } self.setState({ verOpen: true }); },
      closeVersions: function () { self.setState({ verOpen: false, verView: null }); },
      verView: s.verView || null, viewVersion: function (x) { self.setState({ verOpen: true, verView: x }); },
      restoreVersion: function (x) {
        __confirm({ title: 'Restore version ' + x.v + '?', body: 'The product goes back to how it was on ' + formatDateTime(x.at) + '. This is saved as a new version, so you can undo it.', confirmLabel: 'Restore' }).then(function (ok) {
          if (!ok) return;
          var cur = findProduct({ id: s.editId }, getSavedProducts()) || orig || {};
          var back = assign({}, x.rec); delete back.partial;
          var rec = saveProduct(assign(assign({}, cur), back), { by: currentUser().name, note: 'Restored version ' + x.v });
          var pre = prefillFrom(rec);
          dropDraft(rec.id);
          self.setState(assign(assign({}, pre), { verOpen: false, verView: null, savedList: getSavedProducts(), loadedV: rec.version || 0, altText: null, tagText: null }), function () { self.markSaved(); toast(self, 'Version ' + x.v + ' restored.'); });
        });
      },
      lastEdited: lastV.length ? formatDateTime(lastV[0].at) + ' · ' + lastV[0].by : orig && orig.savedAt ? formatDateTime(orig.savedAt) : editing ? 'Not changed here yet' : 'Not saved yet',
      // price changes over the limit: a manager approves now, or the change waits
      priceAsk: s.priceAsk || null, priceLimit: priceLimit(),
      priceAskText: s.priceAsk ? bdt(s.priceAsk.from) + ' → ' + bdt(s.priceAsk.to) + ' is a ' + priceChangePct(s.priceAsk.from, s.priceAsk.to) + '% change. Changes over ' + priceLimit() + '% need a manager.' : '',
      closePriceAsk: function () { self.setState({ priceAsk: null }); },
      sendPrice: function () { var a = s.priceAsk; self.setState({ priceAsk: null }); trySave(a.draft, a.okMsg, assign(assign({}, a.opt), { keepPrice: true })); },
      approvePriceNow: function () { var a = s.priceAsk; self.setState({ priceAsk: null, pinFor: { kind: 'save', a: a } }); },
      priceReqs: s.editId && live ? openPriceRequests(s.editId) : [],
      approveReq: function (r) { self.setState({ pinFor: { kind: 'req', r: r } }); },
      rejectReq: function (r) { decidePrice(r.id, false, currentUser().name); self.setState({ tick: Date.now() }); toast(self, 'Price change rejected. The price stays ' + bdt(r.from) + '.'); },
      pinFor: s.pinFor || null, closePin: function () { self.setState({ pinFor: null }); },
      pinReason: s.pinFor ? (s.pinFor.kind === 'save' ? 'Change the selling price of ' + (title || 'this product') + ' from ' + bdt(s.pinFor.a.from) + ' to ' + bdt(s.pinFor.a.to) + ' (' + priceChangePct(s.pinFor.a.from, s.pinFor.a.to) + '%).' : 'Approve ' + s.pinFor.r.by + '’s price change: ' + bdt(s.pinFor.r.from) + ' → ' + bdt(s.pinFor.r.to) + '.') : '',
      pinApprove: function (manager) {
        var pf = s.pinFor;
        self.setState({ pinFor: null });
        if (pf.kind === 'save') { trySave(pf.a.draft, pf.a.okMsg, assign(assign({}, pf.a.opt), { approved: manager })); return; }
        decidePrice(pf.r.id, true, manager);
        var cur = findProduct({ id: s.editId }, getSavedProducts());
        if (cur) {
          var d = pf.r.to - (cur.price || 0);
          var rec = saveProduct(assign(assign({}, cur), { price: pf.r.to, variants: (cur.variants || []).map(function (x) { return x.price != null ? assign(assign({}, x), { price: x.price + d }) : x; }) }), { by: manager, note: 'Price change approved by ' + manager });
          var pre = prefillFrom(rec);
          self.setState({ orig: rec, basePrice: rec.price, price: pre.price, variants: pre.variants, savedList: getSavedProducts(), loadedV: rec.version || 0 }, function () { self.markSaved(); });
        }
        toast(self, 'Price change approved by ' + manager + '. New price ' + bdt(pf.r.to) + '.');
      },
      // drawers
      sheet: s.sheet || null, open: function (name) { return function () { self.openSheet(name); }; }, cancelSheet: function () { self.cancelSheet(); }, closeSheet: function () { self.closeSheet(); },
      // Enter in a single-line field must not save the whole product by accident.
      formKey: function (ev) { var t = ev.target; if (ev.key === 'Enter' && t && t.tagName === 'INPUT' && t.type !== 'checkbox' && t.type !== 'submit') ev.preventDefault(); }
    });
    v.primarySave = drafty ? v.saveDraft : v.submit;
    // everything the product is made of, as one snapshot (unsaved changes = it differs from the saved one)
    this._snap = JSON.stringify([title, short, long, seoT, seoD, f('handle', ''), !!f('noindex', false), tags, faqs, String(price), String(cost), String(mrp), String(wholesale), String(moq), sell,
      sku, gtin, internalBc, ids, packs, unit, saleUnit, buyUnit, invMode, snt, shelfN, shelfU, lowAt, f('open0', '0'), f('open1', '0'), oversell, backorder, f('restockAt', ''), giftOnly, sellability,
      cat, subcats, brand, collections, status, tplOwn, data, f('specLayout', null), format, f('digital', null), bundle, rel, opts, variants, media, ship, wq, wp, wtext, f('publishing', null), f('google', null), sg]);
    return v;
  }
}

// ---- styles ----
// Kit classes (design-system.css › Index kit) do the cards; these are the page's own parts. .pcard / .psec style the
// channel rows (components/ProductChannels.jsx) shown in the Manage publishing drawer.
const CSS = `
@media (min-width:1024px){.ap-form.ix-record{grid-template-columns:minmax(0,1fr) minmax(280px,340px)}}
.ap-head{align-items:flex-start}
.ap-head>div:first-child{min-width:0}
.ap-acts{display:flex;flex:none;justify-content:flex-end;gap:var(--space-2)}
.ap-body{display:flex;flex-direction:column;gap:var(--space-3)}
.ap-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ap-field>.gc-label,.ap-lbl .gc-label{margin:0}
.ap-lbl{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;min-height:24px}
.ap-lbl>.gc-label{flex:0 1 auto;min-width:0}
.ap-push{margin-left:auto}
.ap-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ap-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.ap-req{color:var(--text-danger)}
.ap-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ap-src{font-size:var(--text-xs);color:var(--text-muted)}
.ap-src.is-own{color:var(--primary)}
.ap-count{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ap-form .gc-input[aria-invalid="true"]{border-color:var(--text-danger)}
.ap-form textarea.gc-input,.gc-sheet textarea.gc-input{resize:vertical}
.ap-mono{font-family:var(--font-data)}
.ap-num{font-variant-numeric:tabular-nums}
.ap-sep{height:1px;margin:0;border:0;background:var(--border-subtle)}
.ap-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ap-grow{flex:1 1 auto}
.ap-reset{align-self:flex-start;padding:0;height:auto}
.ap-linkbtn{display:inline-flex;align-items:center;min-height:24px;padding:0;border:0;background:none;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-link);cursor:pointer;white-space:nowrap}
.ap-linkbtn:hover{text-decoration:underline}
/* money inputs with the taka sign inside */
.ap-money{position:relative;display:block}
.ap-money>span{position:absolute;top:0;bottom:0;left:10px;display:flex;align-items:center;font-size:var(--text-sm);color:var(--text-muted);pointer-events:none}
.ap-money>.gc-input{padding-left:24px}
.ap-pill{display:inline-flex;align-items:center;flex:none;height:22px;padding:0 8px;border-radius:var(--radius-full);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.ap-pill.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.ap-costs{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px var(--space-4);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs-plus);color:var(--text-muted)}
.ap-costs>span{display:inline-flex;align-items:baseline;gap:6px}
.ap-costs b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-costs a{font-weight:var(--weight-medium)}
/* media: a drop zone and an add tile; filled, tiles with order controls and alt text */
.ap-dropwrap{display:grid;grid-template-columns:2fr 1fr;gap:var(--space-2);max-width:620px}
.ap-drop,.ap-addtile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:128px;padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:none;font:inherit;color:var(--text-body);cursor:pointer;text-align:center}
.ap-drop:hover,.ap-addtile:hover,.ap-dropwrap.is-over .ap-drop{background:var(--surface-subtle)}
.ap-drop b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-drop span,.ap-addtile span{font-size:var(--text-xs-plus)}
.ap-mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:var(--space-3)}
.ap-mgrid .ap-addtile{min-height:0;aspect-ratio:1}
.ap-mtile{display:flex;flex-direction:column;gap:6px;margin:0;min-width:0}
.ap-mtile__img{position:relative;aspect-ratio:1;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ap-mtile__img img{display:block;width:100%;height:100%;object-fit:cover}
.ap-mtile__vid{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;height:100%;padding:var(--space-2);font-size:var(--text-xs);color:var(--text-body);text-align:center;overflow-wrap:anywhere}
.ap-mtile__badge{position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-card);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-mtile__ctl{position:absolute;right:6px;bottom:6px;left:6px;display:flex;justify-content:flex-end;gap:4px}
.ap-mtile .gc-input{height:28px;font-size:var(--text-xs-plus)}
/* classification */
.ap-tplrow{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,320px);align-items:start;gap:var(--space-3)}
.ap-tplrow>div{display:flex;flex-direction:column;gap:4px}
/* specifications */
.ap-sgrp{display:flex;flex-direction:column;gap:var(--space-2)}
.ap-sgrp+.ap-sgrp{padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.ap-sgrp__head{display:flex;align-items:center;gap:var(--space-2)}
.ap-sgrp__name{flex:1 1 auto;min-width:0;height:32px;padding:0 6px;margin-left:-6px;border:1px solid transparent;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-sgrp__name:hover,.ap-cellin:hover{border-color:var(--border-subtle)}
.ap-sgrp__name:focus,.ap-cellin:focus{outline:none;border-color:var(--border-field-focus);background:var(--surface-card)}
.ap-twrap{overflow-x:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-spec{width:100%;min-width:520px;border-collapse:collapse;font-size:var(--text-sm)}
.ap-spec th{height:32px;padding:0 10px;background:var(--surface-subtle);text-align:left;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted);white-space:nowrap}
.ap-spec td{padding:4px 10px;border-top:1px solid var(--border-subtle);vertical-align:middle}
.ap-spec__l{width:34%;background:var(--surface-subtle)}
.ap-spec__l>span{display:flex;align-items:center;gap:4px}
.ap-spec__ord{width:1%;white-space:nowrap;text-align:right}
.ap-spec td .gc-input{height:30px}
.ap-spec__val{display:flex;flex-direction:column;gap:2px}
.ap-spec__empty{color:var(--text-muted);font-size:var(--text-xs-plus)}
.ap-cellin{width:100%;min-width:0;height:30px;padding:0 6px;border:1px solid transparent;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.ap-unit{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.ap-specfoot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3)}
/* variants */
.ap-opt{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-opt__head{display:flex;align-items:center;gap:var(--space-2)}
.ap-vals{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.ap-val{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-md);background:var(--surface-card);overflow:hidden}
.ap-val input{width:112px;height:28px;padding:0 8px;border:0;background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading);outline:none}
.ap-val button{display:grid;place-items:center;width:28px;height:28px;border:0;border-left:1px solid var(--border-subtle);background:none;color:var(--text-body);cursor:pointer}
.ap-val button:disabled{opacity:.4;cursor:default}
.ap-val:focus-within{border-color:var(--border-field-focus)}
.ap-vstrip{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px var(--space-3);padding:8px 12px;border-radius:var(--radius-md);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.ap-vstrip b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-vt td{vertical-align:middle}
.ap-vt td,.ap-vt th{padding-left:8px;padding-right:8px}
.ap-vt .gc-input{width:84px;height:28px;padding:0 8px}
.ap-vt .gc-input.ap-wide-in{width:128px}
.ap-avail{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:22px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.ap-vname{display:flex;align-items:center;gap:var(--space-2);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.ap-swatch{display:inline-block;width:12px;height:12px;flex:none;border:1px solid var(--border-strong);border-radius:var(--radius-full)}
.ap-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:var(--space-4) var(--space-3) var(--space-5);text-align:center}
.ap-empty b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-empty span{font-size:var(--text-xs-plus);color:var(--text-body)}
.ap-empty .ix-btn{margin-top:var(--space-2)}
/* one-line cards that open a drawer */
.ap-one{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.ap-one>div{min-width:0}
.ap-one h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-one__val{margin:4px 0 0;font-size:var(--text-xs);color:var(--text-body);overflow-wrap:anywhere}
.ap-one__err{display:flex;align-items:center;gap:6px;margin:4px 0 0;font-size:var(--text-xs);color:var(--text-danger)}
/* search preview */
.ap-serp{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ap-serp>b{font-size:var(--text-sm-plus);font-weight:var(--weight-medium);color:var(--text-link);overflow-wrap:anywhere}
.ap-serp>small{font-size:var(--text-xs);color:var(--text-success);overflow-wrap:anywhere}
.ap-serp>span{font-size:var(--text-xs-plus);color:var(--text-body)}
.ap-prefix{display:flex;align-items:center;min-width:0;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);overflow:hidden}
.ap-prefix>span{flex:none;padding:0 4px 0 10px;font-size:var(--text-xs-plus);color:var(--text-muted);white-space:nowrap}
.ap-prefix>.gc-input{flex:1 1 auto;min-width:0;border:0;border-radius:0;padding-left:0}
.ap-faq{display:flex;flex-direction:column;gap:6px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-faq.is-ai{border-color:var(--viz-7)}
/* side column */
.ap-side .ix-card__head{min-height:0}
.ap-side .ix-card__body{padding-top:var(--space-2)}
.ap-chips{display:flex;flex-wrap:wrap;gap:6px}
.ap-chip{display:inline-flex;align-items:center;gap:2px;height:22px;padding:0 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.ap-chip>button{display:grid;place-items:center;width:18px;height:18px;margin-right:-4px;border:0;border-radius:var(--radius-full);background:none;color:inherit;cursor:pointer}
.ap-chip>button:hover{background:var(--surface-quiet)}
.ap-chip--add{cursor:pointer;font:inherit;font-size:var(--text-xs)}
.ap-colin{width:150px;height:28px}
.ap-rrows{display:flex;flex-direction:column}
.ap-rrow{display:flex;align-items:center;gap:var(--space-2);min-height:32px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.ap-rrow:first-child{border-top:0}
.ap-rrow>b{margin-left:auto;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.ap-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full);background:var(--fill-success)}
.ap-dot.is-warn{background:var(--fill-warning)}
.ap-dot.is-bad{background:var(--fill-danger)}
.ap-big{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-preq{display:flex;flex-direction:column;gap:6px;padding-top:var(--space-2);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
/* drawers */
.ap-dsec{display:flex;flex-direction:column;gap:var(--space-3)}
.ap-dsec+.ap-dsec{padding-top:var(--space-4);border-top:1px solid var(--border-subtle)}
.ap-dh{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-dh>.ap-push{font-weight:var(--weight-regular)}
.ap-amber{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);color:var(--text-warning);font-size:var(--text-xs-plus)}
.ap-panel{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ap-panel .gc-input:not(select){background:var(--surface-card)}
.ap-readonly{display:flex;align-items:center;background:var(--surface-subtle);color:var(--text-body)}
.ap-idrow{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ap-idrow>.gc-input{flex:1 1 120px;width:auto;min-width:0}
.ap-idrow>select.gc-input{flex:0 1 170px}
.ap-idrow__err{flex:1 1 100%}
.ap-suffix{position:relative;display:block}
.ap-suffix>.gc-input{padding-right:48px}
.ap-suffix>span{position:absolute;top:0;right:10px;bottom:0;display:flex;align-items:center;font-size:var(--text-xs-plus);color:var(--text-muted);pointer-events:none}
.ap-packqty{flex:0 0 110px}
.ap-free{font-size:var(--text-xs);white-space:nowrap}
.ap-ftag{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.ap-switch{display:flex;align-items:center;gap:var(--space-3)}
.ap-switch>span{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-check{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.ap-check>span{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.ap-check small{font-size:var(--text-xs);color:var(--text-muted)}
.ap-check>em{font-style:normal;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success);white-space:nowrap}
.ap-check>em.is-warn{color:var(--text-warning)}
.ap-vcard{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-vcard__head{display:flex;align-items:center;gap:var(--space-2)}
.ap-vcard__head>b{flex:1;min-width:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-stock{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ap-stock th{padding:0 0 6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:right}
.ap-stock th:first-child,.ap-stock td:first-child{text-align:left}
.ap-stock td{padding:6px 0;border-top:1px solid var(--border-subtle);text-align:right;font-variant-numeric:tabular-nums}
.ap-stock td+td,.ap-stock th+th{padding-left:var(--space-3)}
.ap-ready{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.ap-ready li{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.ap-ready i{display:grid;flex:none;place-items:center;width:16px;height:16px;border-radius:var(--radius-full);background:var(--border-strong);color:#fff}
.ap-ready i.is-ok{background:var(--fill-success)}
.ap-ready li.is-off span{color:var(--text-muted)}
.ap-pub .pcard{padding:0!important;box-shadow:none;background:none}
.ap-pub .pcard>div:has(#pc-title){display:none}
.ap-keys{display:flex;flex-direction:column;margin:0;padding:0;list-style:none;font-size:var(--text-sm)}
.ap-keys li{display:flex;justify-content:space-between;gap:var(--space-3);padding:6px 0;border-top:1px solid var(--border-subtle)}
.ap-keys li:first-child{border-top:0}
.ap-sg{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ap-sg th,.ap-sg td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);text-align:left;white-space:nowrap}
.ap-sg th{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
/* preview */
.ap-pv{display:flex;flex-direction:column;gap:var(--space-3)}
.ap-pv__img{aspect-ratio:1;overflow:hidden;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ap-pv__img img{display:block;width:100%;height:100%;object-fit:cover}
.ap-pv__img>span{display:grid;place-items:center;height:100%;color:var(--text-muted)}
.ap-pv h3{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-pv__price{display:flex;align-items:baseline;gap:var(--space-2);font-family:var(--font-data)}
.ap-pv__price b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-pv__price s{font-size:var(--text-xs-plus);color:var(--text-muted)}
.ap-pv__long{font-size:var(--text-sm);line-height:1.6;color:var(--text-body);overflow-wrap:anywhere}
.ap-pv__long img{max-width:100%;height:auto}
.ap-pv__long table{width:100%;border-collapse:collapse}
.ap-pv__long th,.ap-pv__long td{padding:4px 6px;border:1px solid var(--border-subtle);text-align:left}
/* notes above the form, the save bar, versions */
.ap-note{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);font-size:var(--text-sm)}
.ap-note>svg{flex:none;color:var(--primary)}
.ap-note>span{flex:1 1 240px;min-width:0}
.ap-note b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-note small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ap-note--warn{background:var(--fill-warning-soft)}
.ap-note--warn>svg{color:var(--text-warning)}
.savebar{position:sticky;bottom:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.savebar__note{display:flex;flex:1 1 160px;align-items:center;gap:var(--space-2);min-width:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body)}
.savebar__note.is-bad{color:var(--text-danger)}
.savebar__dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full);background:var(--fill-warning)}
.ap-vers{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ap-vers li{border-top:1px solid var(--border-subtle)}
.ap-vers li:first-child{border-top:0}
.ap-verbtn{display:block;width:100%;padding:var(--space-2) 0;border:0;background:none;font:inherit;font-size:var(--text-sm);text-align:left;color:var(--text-heading);cursor:pointer}
.ap-verbtn:hover b{color:var(--primary)}
.ap-verbtn b{font-weight:var(--weight-medium)}
.ap-verbtn small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
@media (prefers-reduced-motion:no-preference){.ap-fade{animation:apFade 200ms ease-out}@keyframes apFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}}
@media (max-width:640px){
  .ap-grid2,.ap-grid3,.ap-tplrow{grid-template-columns:minmax(0,1fr)}
  .ap-head{flex-wrap:wrap}
  .ap-acts{flex-wrap:wrap;justify-content:flex-start}
  .ap-dropwrap{grid-template-columns:minmax(0,1fr)}
  .ap-drop,.ap-addtile{min-height:104px}
  .ap-mgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ap-one{flex-wrap:wrap}
  .ap-one>.ix-btn{flex:none}
  .ap-val input{width:96px;height:36px}
  .ap-val button{width:36px;height:36px}
  .ap-linkbtn{min-height:36px}
  .ap-chip{height:auto;min-height:28px}
  .ap-chip>button{width:28px;height:28px}
  .ap-chip--add{width:36px;height:36px;justify-content:center}
  .ap-sgrp__name{height:36px}
  .savebar{padding:var(--space-2)}
  .savebar__note{flex:1 1 100%;font-size:var(--text-xs)}
  .savebar>.ix-btn{flex:1 1 auto}
}
`;

// ---- markup ----

function MoneyIn({ id, value, onChange, label, invalid, describedBy, placeholder }) {
  return (
    <span className="ap-money"><span aria-hidden="true">৳</span>
      <input id={id} className="gc-input ap-num" inputMode="decimal" value={value} onChange={onChange} aria-label={label} placeholder={placeholder}
        aria-invalid={invalid ? 'true' : undefined} aria-describedby={describedBy} />
    </span>
  );
}

function ValueIn({ r, cls }) {
  if (r.o) {
    return (
      <select id={r.id} className={'gc-input gc-select ' + (cls || '')} value={r.value} onChange={r.onChange} aria-label={r.l}>
        <option value="">—</option>
        {__list(r.o).map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
    );
  }
  return <input id={r.id} className={'gc-input ' + (cls || '')} type={r.t === 'date' ? 'date' : 'text'} inputMode={r.t === 'number' ? 'decimal' : undefined} value={r.value} onChange={r.onChange} placeholder="Enter value" aria-label={r.l} />;
}

const pickMedia = () => { const el = typeof document !== 'undefined' && document.getElementById('ap-media-file'); if (el) el.click(); };

export default class AddProductScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const sh = v.sheet;
    const more = [
      v.drafty ? null : { label: 'Save as draft', onClick: v.saveDraft },
      { label: 'AI writing assistant', onClick: v.open('ai') },
      v.editing ? { label: 'Version history', onClick: v.openVersions } : null,
    ].filter(Boolean);
    const idsBad = v.skuErr || v.barcodeErr || v.internalErr || v.idErr || v.packErr || v.err?.shelf;
    return (
      <div className="dc-screen ds" data-screen="AddProduct">
        <style dangerouslySetInnerHTML={{ __html: PARTS_CSS + RTE_CSS + CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active={v.editing ? "products-all" : "products-add"} />
          <main className="gc-shell__main">
            <__Topbar crumb="Products / All products" page={v.heading} placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader onBack={v.goBack} backLabel="Back to products" title={v.pageTitle} meta={v.meta}
                  about="Connected to Purchase, Stock and POS — you never enter stock twice."
                  secondary={[{ label: 'Preview', onClick: v.open('preview') }, { label: 'Duplicate', onClick: v.duplicate }]}
                  more={more}
                  primary={{ label: v.saveLabel, onClick: v.primarySave }} />

                {v.recover ? (
                  <div className="ix-card ap-note" role="status">
                    <__Icon name="history" width="16" height="16" aria-hidden="true" />
                    <span><b>Recover unsaved product work?</b><small>{'Changes from ' + v.recover + ' were not saved.'}</small></span>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={v.dismissDraft}>Dismiss</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={v.restoreDraft}>Restore</button>
                  </div>
                ) : null}
                {v.editors && v.editors.length ? (
                  <div className="ix-card ap-note ap-note--warn" role="status">
                    <__Icon name="users" width="16" height="16" aria-hidden="true" />
                    <span><b>{v.editors.join(', ') + (v.editors.length === 1 ? ' is' : ' are') + ' editing this product'}</b><small>If you both save, the second save asks before it overwrites.</small></span>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={v.editAnyway}>Edit anyway</button>
                  </div>
                ) : null}

                <form id="product-form" className="ix-record ap-form" data-nodirty="" noValidate aria-label={v.heading} onSubmit={v.submit} onKeyDown={v.formKey}>
                  <div className="ix-main">
                    {/* ---- 1. title, short and long description ---- */}
                    <section className="ix-card" aria-label="Title and description">
                      <div className="ix-card__body ap-body" style={{ paddingTop: "var(--space-4)" }}>
                        <div className="ap-field">
                          <label className="gc-label" htmlFor="pf-title">Title <span className="ap-req" aria-hidden="true">*</span></label>
                          <input className="gc-input" value={v.title} onChange={v.typeTitle} placeholder="Untitled product" id="pf-title" aria-required="true" aria-invalid={v.err?.title ? "true" : undefined} aria-describedby={v.err?.title ? "pf-title-err" : undefined} />
                          <Err id="pf-title-err" text={v.err?.title} />
                        </div>
                        <div className="ap-field">
                          <div className="ap-lbl">
                            <label className="gc-label" htmlFor="pf-short">Short description</label>
                            <span className="ap-count ap-push">{v.shortCount}</span>
                            <AiBtn onClick={v.aiShort}>Write with AI</AiBtn>
                          </div>
                          <textarea id="pf-short" className={'gc-input' + (v.ai?.short ? ' ap-ai-on' : '')} rows="3" value={v.short} onChange={v.typeShort} />
                          <p className="ap-help">Concise copy for product cards, feeds and quick previews.</p>
                          {v.ai?.short ? <AiCheck onKeep={v.keep_short} onUndo={v.undo_short} /> : null}
                        </div>
                        <div className="ap-field">
                          <div className="ap-lbl">
                            <span className="gc-label" id="ap-l-long">Long description</span>
                            <span className="ap-push" />
                            <AiBtn onClick={v.aiLong}>Write with AI</AiBtn>
                            <AiBtn onClick={v.aiImprove}>Improve</AiBtn>
                            <AiBtn onClick={v.aiBangla}>Add Bangla</AiBtn>
                          </div>
                          <RichText id="pf-long" value={v.long} onChange={v.typeLong} labelledBy="ap-l-long" aiOn={v.ai?.long} onError={v.rteError} />
                          {v.ai?.long ? <AiCheck onKeep={v.keep_long} onUndo={v.undo_long} /> : null}
                        </div>
                      </div>
                    </section>

                    {/* ---- 2. media ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-media">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-media">Media</h2><p className="ix-card__sub">Images/video · drag-order equivalent controls · first item is the primary media · alt text editable.</p></div>
                        <span className="ap-acts">
                          {v.media.length ? <AiBtn onClick={v.aiAlt}>Alt text with AI</AiBtn> : null}
                          <button type="button" className="ix-btn" onClick={pickMedia}>Add media</button>
                        </span>
                      </div>
                      <div className="ix-card__body" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); v.addFiles(e.dataTransfer && e.dataTransfer.files); }}>
                        {v.media.length ? (
                          <div className="ap-mgrid">
                            {__list(v.media).map((m) => (
                              <figure key={m.key} className="ap-mtile">
                                <div className="ap-mtile__img">
                                  {m.kind === 'video' ? <span className="ap-mtile__vid"><__Icon name="film" width="16" height="16" aria-hidden="true" />{m.name}</span> : <img src={m.src} alt={m.alt} />}
                                  {m.primary ? <span className="ap-mtile__badge">Primary</span> : null}
                                  <span className="ap-mtile__ctl">
                                    <button type="button" className="ap-obtn" aria-label="Move earlier" onClick={m.left} disabled={m.first}><__Icon name="arrow-left" width="14" height="14" aria-hidden="true" /></button>
                                    <button type="button" className="ap-obtn" aria-label="Move later" onClick={m.right} disabled={m.last}><__Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></button>
                                    {m.primary ? null : <button type="button" className="ap-obtn" aria-label="Make primary" title="Make primary" onClick={m.primaryIt}><__Icon name="star" width="14" height="14" aria-hidden="true" /></button>}
                                    <button type="button" className="ap-obtn" aria-label="Remove media" onClick={m.remove}><__Icon name="x" width="14" height="14" aria-hidden="true" /></button>
                                  </span>
                                </div>
                                <input className="gc-input" value={m.alt} onChange={m.typeAlt} placeholder="Alt text" aria-label={'Alt text for media ' + m.n} />
                              </figure>
                            ))}
                            <button type="button" className="ap-addtile" onClick={pickMedia}><__Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add image or video</span></button>
                          </div>
                        ) : (
                          <div className="ap-dropwrap">
                            <button type="button" className="ap-drop" onClick={pickMedia}><b>Drop product media here</b><span>or use Add media</span></button>
                            <button type="button" className="ap-addtile" onClick={pickMedia}><__Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add image or video</span></button>
                          </div>
                        )}
                        <input id="ap-media-file" type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { v.addFiles(e.target.files); e.target.value = ''; }} />
                      </div>
                    </section>

                    {/* ---- 3. classification: main category, subcategories, template ---- */}
                    <section className="ix-card ix-card--open" aria-labelledby="ap-h-class">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-class">Product classification</h2><p className="ix-card__sub">Use one main category for taxonomy/defaults, then assign as many relevant subcategories as needed.</p></div>
                      </div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-grid2">
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-maincat">Main category</label>
                            <select id="pf-maincat" className="gc-input gc-select" value={v.mainCat} onChange={v.setMainCat}>
                              <option value="">Other</option>
                              {__list(v.mainCats).map((c) => (<option key={c} value={c}>{c}</option>))}
                            </select>
                            <p className="ap-help">Primary taxonomy path, defaults and reporting category.</p>
                          </div>
                          <div className="ap-field">
                            <span className="gc-label" id="ap-l-subs">Subcategories <span className="ix-muted">multiple allowed</span></span>
                            <MultiCheck id="pf-subcats" groups={v.subGroups} placeholder="Select subcategories" labelledBy="ap-l-subs" />
                            <p className="ap-help"><__Link href="/categories">Manage categories</__Link></p>
                          </div>
                        </div>
                        <hr className="ap-sep" />
                        <div className="ap-tplrow">
                          <div>
                            <label className="gc-label" htmlFor="pf-tpl" style={{ margin: 0 }}>Product template</label>
                            <p className="ap-help">Controls the starting specification schema. Existing values with matching field names are preserved</p>
                            <span className="ap-src">{v.tplSource}{v.tplCaps.length ? ' · Turns on: ' + v.tplCaps.join(', ') : ''}</span>
                          </div>
                          <select id="pf-tpl" className="gc-input gc-select" value={v.tplSel} onChange={v.setTpl}>
                            <option value="">{'Category’s: ' + v.catTplName}</option>
                            {__list(v.templates).map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                          </select>
                        </div>
                      </div>
                    </section>

                    {/* ---- 4. specifications: SPECIFICATION | VALUE | ORDER per group ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-spec">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-spec">Specifications</h2><p className="ix-card__sub">{v.tplName + ' template · reorder groups/rows, rename anything, or add merchant-specific specifications.'}</p></div>
                        <button type="button" className="ix-btn" onClick={v.addGroup}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add group</button>
                      </div>
                      <div className="ix-card__body ap-body">
                        {__list(v.specGroups).map((g) => (
                          <div key={g.gi} className="ap-sgrp">
                            <div className="ap-sgrp__head">
                              <input className="ap-sgrp__name" value={g.name} onChange={g.rename} aria-label="Group name" />
                              <OrderBtns what="group" onUp={g.up} onDown={g.down} upOff={g.first} downOff={g.last} onRemove={g.remove} removeText="Remove" />
                            </div>
                            <div className="ap-twrap">
                              <table className="ap-spec gc-table--keep">
                                <thead><tr><th scope="col">Specification</th><th scope="col">Value</th><th scope="col" className="ap-spec__ord">Order</th></tr></thead>
                                <tbody>
                                  {__list(g.rows).map((r) => (
                                    <tr key={r.k}>
                                      <td className="ap-spec__l"><span><input className="ap-cellin" value={r.l} onChange={r.rename} aria-label="Specification name" />{r.unit ? <span className="ap-unit">{r.unit}</span> : null}</span></td>
                                      <td>
                                        <span className="ap-spec__val">
                                          <ValueIn r={r} />
                                          {r.label && r.source !== 'product' ? <span className="ap-src">{r.label}</span> : null}
                                          {r.canReset ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain ap-reset" onClick={r.reset}>{r.resetLabel}</button> : null}
                                        </span>
                                      </td>
                                      <td className="ap-spec__ord"><OrderBtns what="specification" onUp={r.up} onDown={r.down} upOff={r.first} downOff={r.last} onRemove={r.remove} /></td>
                                    </tr>
                                  ))}
                                  {!g.rows.length ? <tr><td colSpan="3" className="ap-spec__empty">No specifications in this group yet.</td></tr> : null}
                                </tbody>
                              </table>
                            </div>
                            <div><button type="button" className="ix-btn ix-btn--sm" onClick={g.addSpec}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add specification</button></div>
                          </div>
                        ))}
                        {!v.specGroups.length ? <p className="ap-help">This template has no specifications. Add a group to start.</p> : null}
                        <div className="ap-specfoot">
                          {v.specMore > 0 || v.allData ? <button type="button" className="ap-linkbtn" aria-expanded={v.allData} onClick={v.toggleAllData}>{v.allData ? 'Show key features only' : 'View all product data (' + v.specTotal + ')'}</button> : null}
                          {v.hiddenRows ? <button type="button" className="ap-linkbtn" onClick={v.showHidden}>{v.hiddenRows === 1 ? 'Show 1 hidden specification' : 'Show ' + v.hiddenRows + ' hidden specifications'}</button> : null}
                          {v.hiddenCount ? <span className="ap-help">{v.hiddenCount === 1 ? '1 value is kept from another template. Switch back to see it.' : v.hiddenCount + ' values are kept from another template. Switch back to see them.'}</span> : null}
                        </div>
                      </div>
                    </section>

                    {/* ---- 5. pricing ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-price">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-price">Pricing</h2><p className="ix-card__sub">Margin planning only; procurement and inventory remain the source of live cost truth.</p></div>
                        <span className={'ap-pill' + (v.marginBad ? ' is-bad' : '')}>{v.margin}</span>
                      </div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-grid3">
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-price">Selling price {v.priceReq ? <span className="ap-req" aria-hidden="true">*</span> : null}</label>
                            <MoneyIn id="pf-price" value={v.price} onChange={v.typePrice} label="Selling price" invalid={v.err?.price} describedBy={v.err?.price ? "pf-price-err" : undefined} />
                            <Err id="pf-price-err" text={v.err?.price} />
                          </div>
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-mrp">MRP / Compare-at</label>
                            <MoneyIn id="pf-mrp" value={v.mrp} onChange={v.typeMrp} label="MRP / Compare-at" />
                          </div>
                          <div className="ap-field">
                            <div className="ap-lbl"><label className="gc-label" htmlFor="pf-cost">Estimated/default cost {v.costReq ? <span className="ap-req" aria-hidden="true">*</span> : null}</label><__InfoTip text="Customers never see this" /></div>
                            <MoneyIn id="pf-cost" value={v.cost} onChange={v.typeCost} label="Estimated/default cost" invalid={v.err?.cost} describedBy={v.err?.cost ? "pf-cost-err" : undefined} />
                            <Err id="pf-cost-err" text={v.err?.cost} />
                          </div>
                        </div>
                        <div className="ap-grid3">
                          {v.sellsWs ? (<>
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-wholesale">Wholesale price <span className="ap-req" aria-hidden="true">*</span></label><__InfoTip text="Price per piece for bulk buyers" /></div>
                              <MoneyIn id="pf-wholesale" value={v.wholesale} onChange={v.typeWholesale} label="Wholesale price" invalid={v.err?.wholesale} describedBy={v.err?.wholesale ? "pf-wholesale-err" : undefined} />
                              <Err id="pf-wholesale-err" text={v.err?.wholesale} />
                            </div>
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-moq">Minimum order (MOQ) <span className="ap-req" aria-hidden="true">*</span></label><__InfoTip text="Wholesale price starts from this many" /></div>
                              <span className="ap-suffix">
                                <input className="gc-input ap-num" inputMode="numeric" value={v.moq} onChange={v.typeMoq} id="pf-moq" aria-label="Wholesale minimum order in pieces" aria-invalid={v.err?.moq ? "true" : undefined} aria-describedby={v.err?.moq ? "pf-moq-err" : undefined} />
                                <span aria-hidden="true">pieces</span>
                              </span>
                              <Err id="pf-moq-err" text={v.err?.moq} />
                            </div>
                          </>) : null}
                          <label className="ap-field">
                            <span className="gc-label">VAT / tax</span>
                            <select className="gc-input gc-select" aria-label="Tax rate">
                              <option>Standard VAT 15%</option>
                              <option>Reduced 7.5%</option>
                              <option>No VAT</option>
                            </select>
                          </label>
                        </div>
                        <div className="ap-costs">
                          <span>Last purchase cost <b>{v.lastBuy}</b> <__Link href="/purchases" title={v.lastBuyRef || undefined}>Purchase</__Link></span>
                          <span>Current inventory cost <b>{v.invCost}</b> <__Link href="/stock">Inventory</__Link></span>
                          <span>Profit per piece <b>{v.profit}</b></span>
                          <span>Customer saves <b>{v.saves}</b></span>
                        </div>
                      </div>
                    </section>

                    {/* ---- 6. product model: format, selling mode, sellability ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-model">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-model">Product model</h2><p className="ix-card__sub">Independent behaviours prevent product-type explosion.</p></div>
                      </div>
                      <div className="ix-card__body ap-body">
                        <div className={v.wsOn ? 'ap-grid3' : 'ap-grid2'}>
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-format">Product format</label>
                            <select id="pf-format" className="gc-input gc-select" value={v.format} onChange={v.setFormat}>
                              {__list(v.formats).map((x) => (<option key={x[0]} value={x[0]}>{x[1]}</option>))}
                            </select>
                          </div>
                          {v.wsOn ? (
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-sell">Selling mode</label><__InfoTip text={v.sellHelp} /></div>
                              <select id="pf-sell" className="gc-input gc-select" value={v.sell} onChange={v.setSell}>
                                {__list(v.sellModes).map((x) => (<option key={x[0]} value={x[0]}>{x[1]}</option>))}
                              </select>
                            </div>
                          ) : null}
                          <div className="ap-field">
                            <div className="ap-lbl"><label className="gc-label" htmlFor="pf-sellability">Sellability</label><__InfoTip text={v.sellabilityHelp} /></div>
                            <select id="pf-sellability" className="gc-input gc-select" value={v.sellability} onChange={v.setSellability}>
                              {__list(v.sellabilities).map((x) => (<option key={x[0]} value={x[0]}>{x[1]}</option>))}
                            </select>
                          </div>
                        </div>
                        {v.backorder ? (
                          <label className="ap-row" style={{ fontSize: "var(--text-sm)" }}>
                            <span>Back in stock on</span>
                            <input type="date" className="ix-date" aria-label="Expected back in stock" value={v.restockAt} onChange={v.typeRestock} />
                          </label>
                        ) : null}
                      </div>
                    </section>

                    {/* ---- 7. variants: options, combinations, full editor ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-var">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-var">Variants</h2><p className="ix-card__sub">Create any number of option dimensions. Variants remain editable after publication; stock shown here is read-only from Inventory.</p></div>
                        <span className="ap-acts">
                          <button type="button" id="pf-opts" className="ix-btn" onClick={v.addOption}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add option</button>
                          <button type="button" className="ix-btn" onClick={v.open('variants')}>Full editor</button>
                        </span>
                      </div>
                      <div className="ix-card__body ap-body">
                        <Err id="pf-opts-err" text={v.optErr} />
                        {v.hasOpts ? (<>
                          {__list(v.optRows).map((o) => (
                            <div key={o.key} className="ap-opt">
                              <div className="ap-opt__head">
                                <input id={o.id} className="ap-sgrp__name" value={o.name} onChange={o.rename} aria-label="Option name" />
                                <OrderBtns what="option" onUp={o.up} onDown={o.down} upOff={o.first} downOff={o.last} onRemove={o.remove} />
                              </div>
                              <div className="ap-vals">
                                {__list(o.values).map((x) => (
                                  <span key={x.key} className="ap-val">
                                    <input value={x.value} onChange={x.rename} aria-label="Option value" />
                                    <button type="button" aria-label="Remove value" onClick={x.remove} disabled={x.only}><__Icon name="x" width="12" height="12" aria-hidden="true" /></button>
                                  </span>
                                ))}
                                <button type="button" className="ix-btn ix-btn--sm" onClick={o.addValue}><__Icon name="plus" width="14" height="14" aria-hidden="true" />Add value</button>
                              </div>
                            </div>
                          ))}
                          <div className="ap-vstrip"><b>{v.varCount === 1 ? '1 variant combination' : v.varCount + ' variant combinations'}</b><span>Every combination can have independent price, identifier, media and publishing.</span></div>
                          {v.hasVariants ? (
                            <div className="ix-table-wrap ix-table-wrap--show">
                              <table className="ix-table ix-table--static ap-vt gc-table--keep">
                                <thead>
                                  <tr><th scope="col">Variant</th><th scope="col">Price</th><th scope="col">MRP</th><th scope="col">SKU</th><th scope="col">GTIN</th><th scope="col">Available</th><th scope="col">Publish</th></tr>
                                </thead>
                                <tbody>
                                  {__list(v.varRows).map((r) => (
                                    <tr key={r.key}>
                                      <td><span className="ap-vname">{r.swatch ? <span className="ap-swatch" style={{ background: r.swatch }} /> : null}{r.name}</span></td>
                                      <td><input className="gc-input ap-num" inputMode="decimal" value={r.price} placeholder={r.pricePh} onChange={r.typePrice} aria-label={'Price for ' + r.name} /></td>
                                      <td><input className="gc-input ap-num" inputMode="decimal" value={r.mrp} placeholder={r.mrpPh} onChange={r.typeMrp} aria-label={'MRP for ' + r.name} /></td>
                                      <td><input className="gc-input ap-mono ap-wide-in" value={r.sku} onChange={r.typeSku} aria-label={'SKU for ' + r.name} /></td>
                                      <td><input className="gc-input ap-mono ap-wide-in" value={r.gtin} onChange={r.typeGtin} aria-label={'GTIN for ' + r.name} /></td>
                                      <td><span className="ap-avail">{r.avail}</span></td>
                                      <td><input type="checkbox" className="gc-check" checked={r.published} onChange={r.togglePub} aria-label={'Publish ' + r.name} /></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : null}
                        </>) : (
                          <div className="ap-empty">
                            <b>This product has no variants.</b>
                            <span>Add options such as Colour, Size, Storage, Material, Pack or Region.</span>
                            <button type="button" className="ix-btn ix-btn--primary" onClick={v.addOption}>Add first option</button>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* ---- 8–11: one-line cards that open drawers ---- */}
                    <section className="ix-card ap-one" aria-labelledby="ap-h-inv">
                      <div>
                        <h2 id="ap-h-inv">Inventory, identifiers & units</h2>
                        <p className="ix-card__sub">Inventory policy only here · live quantity remains Inventory truth</p>
                        <p className="ap-one__val">{v.invLine}</p>
                        {idsBad ? <p className="ap-one__err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />Check the codes in Manage.</p> : null}
                      </div>
                      <button type="button" className="ix-btn" onClick={v.open('ids')}>Manage</button>
                    </section>

                    <section className="ix-card ap-one" aria-labelledby="ap-h-ship">
                      <div>
                        <h2 id="ap-h-ship">Shipping & fulfilment</h2>
                        <p className="ix-card__sub">{v.shipLine}</p>
                      </div>
                      <button type="button" className="ix-btn" onClick={v.open('ship')}>Edit</button>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-seo">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-seo">Search engine listing</h2><p className="ix-card__sub">Website SEO is separate from Product Data and Google listing data.</p></div>
                        <button type="button" className="ix-btn" aria-expanded={v.seoOpen} onClick={v.toggleSeo}>{v.seoOpen ? 'Hide advanced' : 'Edit SEO'}</button>
                      </div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-serp">
                          <b>{v.serpTitle}</b>
                          <small>{'gridshop.com.bd/products/' + v.handle}</small>
                          <span>{v.serpDesc}</span>
                        </div>
                        {v.seoOpen ? (
                          <div className="ap-body ap-fade">
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-seot">Page title</label><span className="ap-count ap-push">{v.seoTCount}</span><AiBtn onClick={v.aiSeo}>Write with AI</AiBtn></div>
                              <input id="pf-seot" className={'gc-input' + (v.ai?.seo ? ' ap-ai-on' : '')} value={v.seoT} placeholder={v.serpTitle} onChange={v.typeSeoT} />
                            </div>
                            <div className="ap-field">
                              <label className="gc-label" htmlFor="pf-seod">Meta description</label>
                              <textarea id="pf-seod" className={'gc-input' + (v.ai?.seo ? ' ap-ai-on' : '')} rows="2" value={v.seoD} placeholder="Add a short description so people know what they will find." onChange={v.typeSeoD} />
                            </div>
                            {v.ai?.seo ? <AiCheck onKeep={v.keep_seo} onUndo={v.undo_seo} /> : null}
                            <div className="ap-grid2">
                              <div className="ap-field">
                                <label className="gc-label" htmlFor="pf-handle">URL handle</label>
                                <span className="ap-prefix"><span aria-hidden="true">/products/</span><input id="pf-handle" className="gc-input" value={v.handle} onChange={v.typeHandle} /></span>
                              </div>
                              <div className="ap-field">
                                <span className="gc-label" id="ap-l-index">Search engines</span>
                                <Seg opts={v.indexOpts} labelledBy="ap-l-index" />
                              </div>
                            </div>
                            <div className="ap-field">
                              <div className="ap-lbl"><span className="gc-label">Product FAQ</span><__InfoTip text="Shown on the product page. Answers the questions customers ask most." /><span className="ap-push" /><AiBtn onClick={v.aiFaq}>Suggest with AI</AiBtn></div>
                              {__list(v.faqs).map((q, i) => (
                                <div key={i} className={'ap-faq' + (v.ai?.faq ? ' is-ai' : '')}>
                                  <div className="ap-row" style={{ flexWrap: "nowrap" }}><input className="gc-input ap-grow" value={q.q} onChange={v.setFaq(i, 0)} aria-label="Question" /><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove question" onClick={v.removeFaq(i)}><__Icon name="x" width="16" height="16" aria-hidden="true" /></button></div>
                                  <textarea className="gc-input" rows="2" value={q.a} onChange={v.setFaq(i, 1)} aria-label="Answer" />
                                </div>
                              ))}
                              {v.ai?.faq ? <AiCheck onKeep={v.keep_faq} onUndo={v.undo_faq} /> : null}
                              <div><button type="button" className="ix-btn ix-btn--sm" onClick={v.addFaq}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a question</button></div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="ix-card ap-one" aria-labelledby="ap-h-rel">
                      <div>
                        <h2 id="ap-h-rel">Product relationships</h2>
                        <p className="ix-card__sub">Compatible accessories · substitutes · successor/predecessor · components · frequently bought together.</p>
                        {v.relCount || v.isBundle ? <p className="ap-one__val">{[v.relCount ? (v.relCount === 1 ? '1 linked product' : v.relCount + ' linked products') : '', v.isBundle ? 'Bundle of ' + v.partRows.length + (v.partRows.length === 1 ? ' part' : ' parts') : ''].filter(Boolean).join(' · ')}</p> : null}
                        {v.bundleErr ? <p className="ap-one__err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.bundleErr}</p> : null}
                      </div>
                      <button type="button" className="ix-btn" onClick={v.open('rel')}>Manage</button>
                    </section>

                    {/* ---- the save bar, while there is something to save or fix ---- */}
                    {v.dirty || v.hasErr ? (
                      <div className="savebar" role="group" aria-label="Save product">
                        <span className={'savebar__note' + (v.hasErr ? ' is-bad' : '')} role="status">
                          {v.hasErr ? (<><__Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />{v.errSummary}</>) : (<><span className="savebar__dot" aria-hidden="true" />Unsaved changes</>)}
                        </span>
                        {v.dirty ? <button type="button" className="ix-btn" onClick={v.discard}>Discard</button> : <__Link href="/all-products" className="ix-btn">Cancel</__Link>}
                        <button type="button" className="ix-btn ix-btn--primary" onClick={v.primarySave}><__Icon name="check" width="16" height="16" aria-hidden="true" /><span>{v.saveLabel}</span></button>
                      </div>
                    ) : null}
                  </div>

                  <aside className="ix-side ap-side">
                    <section className="ix-card" aria-labelledby="ap-h-status">
                      <div className="ix-card__head"><h2 id="ap-h-status">Status</h2></div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-2)" }}>
                        <select id="pf-status" className="gc-input gc-select" value={v.status} onChange={v.setStatus} aria-labelledby="ap-h-status">
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Go live on a date</option>
                          <option value="archived">Archived</option>
                          {v.isDeleted ? (<option value="deleted">Deleted — restore by picking another status</option>) : null}
                        </select>
                        <p className="ap-help">Archive instead of destructive delete once transaction history exists.</p>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-pub">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-pub">Publishing</h2><p className="ix-card__sub">Channels and catalogues</p></div>
                        <button type="button" className="ap-linkbtn" onClick={v.open('pub')}>Manage</button>
                      </div>
                      <div className="ix-card__body">
                        {v.pubPills.length ? <div className="ap-chips">{v.pubPills.map((p) => <span key={p} className="ap-chip">{p}</span>)}</div> : <p className="ap-help">Not published yet</p>}
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-org">
                      <div className="ix-card__head"><h2 id="ap-h-org">Organization</h2></div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-field">
                          <label className="gc-label" htmlFor="pf-brand">Brand</label>
                          <input id="pf-brand" className="gc-input" list="ap-brands" value={v.brand} onChange={v.typeBrand} />
                          <datalist id="ap-brands">{__list(v.brands).map((b) => <option key={b} value={b} />)}</datalist>
                        </div>
                        <div className="ap-field">
                          <span className="gc-label">Collections</span>
                          <div className="ap-chips">
                            {__list(v.collections).map((c) => (
                              <span key={c.name} className="ap-chip">{c.name}<button type="button" onClick={c.remove} aria-label={'Remove ' + c.name}><__Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>
                            ))}
                            {v.colOpen ? (
                              <span className="ap-row">
                                <input className="gc-input ap-colin" list="ap-cols" value={v.colText} onChange={v.typeCol} onKeyDown={v.colKey} onBlur={v.addCol} aria-label="Collection" autoFocus />
                                <datalist id="ap-cols">{__list(v.colSuggest).map((c) => <option key={c} value={c} />)}</datalist>
                              </span>
                            ) : <button type="button" className="ap-chip ap-chip--add" aria-label="Add a collection" onClick={v.openCol}><__Icon name="plus" width="12" height="12" aria-hidden="true" /></button>}
                          </div>
                        </div>
                        <div className="ap-field">
                          <div className="ap-lbl"><label className="gc-label" htmlFor="pf-tags">Tags</label><span className="ap-push" /><AiBtn onClick={v.aiTags}>AI</AiBtn></div>
                          <input id="pf-tags" className={'gc-input' + (v.ai?.tags ? ' ap-ai-on' : '')} value={v.tagText} onChange={v.typeTags} placeholder="5G, Android" />
                          {v.ai?.tags ? <AiCheck onKeep={v.keep_tags} onUndo={v.undo_tags} /> : null}
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-data">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-data">Product data</h2><p className="ix-card__sub">{v.dataCount + ' structured fields · ' + v.tplName}</p></div>
                        <button type="button" className="ap-linkbtn" onClick={v.open('data')}>View all</button>
                      </div>
                      <div className="ix-card__body">
                        {v.dataChips.length ? <div className="ap-chips">{v.dataChips.map((c, i) => <span key={i} className="ap-chip">{c}</span>)}</div> : <p className="ap-help">No structured fields yet.</p>}
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-gready">
                      <div className="ix-card__head">
                        <h2 id="ap-h-gready">Google listing readiness</h2>
                        <button type="button" className="ap-linkbtn" onClick={v.open('data')}>Edit</button>
                      </div>
                      <div className="ix-card__body">
                        <div className="ap-rrows">
                          {__list(v.readiness).map((r) => (
                            <div key={r.l} className="ap-rrow"><span className={'ap-dot' + (r.tone === 'ok' ? '' : r.tone === 'bad' ? ' is-bad' : ' is-warn')} aria-hidden="true" />{r.l}<b>{r.st}</b></div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-war">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-war">Warranty</h2><p className="ix-card__sub">Customer-facing policy</p></div>
                        <button type="button" className="ap-linkbtn" onClick={v.open('warranty')}>Manage</button>
                      </div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-2)" }}>
                        <p className="ap-big">{v.warrantyLine}</p>
                        <p className="ap-help">Supplier warranty stays in Purchasing; serial traceability stays in Inventory; claims stay in After-sales.</p>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-act">
                      <div className="ix-card__head ap-head">
                        <div><h2 id="ap-h-act">Activity & governance</h2><p className="ix-card__sub">Version and audit trail</p></div>
                        <button type="button" className="ap-linkbtn" onClick={v.openVersions}>View</button>
                      </div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-2)" }}>
                        <dl className="ix-kv">
                          <dt>Last edited</dt><dd>{v.lastEdited}</dd>
                          <dt>Approval</dt><dd>{v.priceReqs.length ? (v.priceReqs.length === 1 ? '1 price change waiting' : v.priceReqs.length + ' price changes waiting') : 'Not required'}</dd>
                          {v.versions.length ? (<><dt>Versions</dt><dd>{v.versions.length}</dd></>) : null}
                        </dl>
                        {__list(v.priceReqs).map((r) => (
                          <div key={r.id} className="ap-preq">
                            <span><b>{bdt(r.from) + ' → ' + bdt(r.to)}</b><span className="ap-src" style={{ display: "block" }}>{'Asked by ' + r.by + ' · ' + agoText(r.at)}</span></span>
                            <span className="ap-row"><button type="button" className="ix-btn ix-btn--sm" onClick={() => v.rejectReq(r)}>Reject</button><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => v.approveReq(r)}>Approve</button></span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </aside>
                </form>
              </div>
            </div>
          </main>
        </div>

        {/* ---- drawers ---- */}
        <Drawer open={sh === 'ids'} title="Identifiers, units & inventory policy" sub={v.pageTitle} onCancel={v.cancelSheet} onSave={v.closeSheet}>
          <div className="ap-dsec">
            <div className="ap-field">
              <label className="gc-label" htmlFor="pf-invmode">Inventory behaviour</label>
              {v.physical ? (
                <select id="pf-invmode" className="gc-input gc-select" value={v.invMode} onChange={v.setInvMode}>
                  {__list(v.invModes).map((x) => (<option key={x[0]} value={x[0]}>{x[1]}</option>))}
                </select>
              ) : <div className="gc-input ap-readonly">Not tracked</div>}
              <p className="ap-help">{v.physical ? 'This declares how the product should be tracked. Existing live stock migration remains an Inventory workflow.' : v.format === 'licence' ? 'Stock is the number of free licence keys.' : 'Not counted in stock. No courier, weight or opening stock.'}</p>
            </div>
            {v.serialOn ? (
              <div className="ap-panel ap-fade">
                {v.invMode === 'imei' ? <div className="ap-row"><span className="gc-label" id="ap-snt" style={{ margin: 0 }}>Which number?</span><Seg opts={v.sntOpts} labelledBy="ap-snt" /></div> : null}
                <p className="ap-help" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>You do not type the numbers here. Staff scan them in <b>Stock</b> when goods arrive, and the POS asks for the number at sale.</p>
                <div className="ap-row"><__Link href="/receive-goods">Receive goods</__Link><__Link href="/warranty-claims">Serial number register</__Link><span className="ap-push ap-src">{v.snCount + ' in stock now'}</span></div>
              </div>
            ) : null}
            {v.expiresOn ? (
              <div className="ap-panel ap-fade">
                <div className="ap-row">
                  <span style={{ fontSize: "var(--text-sm)" }}>It stays good for</span>
                  <input className="gc-input ap-num" inputMode="numeric" value={v.shelfN} onChange={v.typeShelf} aria-label="Shelf life" id="pf-shelf" aria-invalid={v.err?.shelf ? "true" : undefined} style={{ width: "72px", textAlign: "center" }} />
                  <select className="gc-input gc-select" value={v.shelfU} onChange={v.setShelfU} aria-label="Shelf life unit" style={{ width: "112px" }}>
                    <option value="days">days</option><option value="weeks">weeks</option><option value="months">months</option><option value="years">years</option>
                  </select>
                </div>
                <span className="ap-src">{v.shelfEx}</span>
                <Err id="pf-shelf-err" text={v.err?.shelf} />
                <div className="ap-grid2">
                  <label className="ap-field"><span className="gc-label">Stop selling</span>
                    <select className="gc-input gc-select" aria-label="Stop selling"><option>3 days before expiry</option><option>On the expiry date</option><option>7 days before expiry</option></select>
                  </label>
                  <label className="ap-field"><span className="gc-label">Warn me</span>
                    <select className="gc-input gc-select" aria-label="Warn before"><option>14 days before expiry</option><option>7 days before</option><option>30 days before</option></select>
                  </label>
                </div>
                <p className="ap-help">Batch dates are entered when stock arrives in Purchase. Expired stock moves to <__Link href="/expiry-disposal">{"Expiry & disposal"}</__Link>.</p>
              </div>
            ) : null}
            {v.weightOn ? <p className="ap-help">Sold by weight. Stock is kept in kg; PLU and scale codes below work at the till.</p> : null}
          </div>
          <div className="ap-dsec">
            <h3 className="ap-dh">Identifiers</h3>
            <div className="ap-field">
              <label className="gc-label" htmlFor="pf-sku">SKU</label>
              <input id="pf-sku" className="gc-input ap-mono" value={v.sku} onChange={v.typeSku} placeholder="For example PH-5GP-256" aria-invalid={v.skuErr ? "true" : undefined} aria-describedby={v.skuErr ? "pf-sku-err" : undefined} />
              <Err id="pf-sku-err" text={v.skuErr} />
            </div>
            <div className="ap-field">
              <label className="gc-label" htmlFor="pf-barcode">GTIN / EAN / UPC</label>
              <input id="pf-barcode" className="gc-input ap-mono" value={v.gtin} onChange={v.typeGtin} placeholder="Manufacturer / GS1 assigned value" inputMode="numeric" aria-invalid={v.barcodeErr ? "true" : undefined} aria-describedby={v.barcodeErr ? "pf-barcode-err" : undefined} />
              <Err id="pf-barcode-err" text={v.barcodeErr} />
              {!v.barcodeErr && v.gtinWarn ? <p className="ap-help">{v.gtinWarn + ' Google may not accept it.'}</p> : null}
            </div>
            <div className="ap-field">
              <label className="gc-label" htmlFor="pf-mpn">MPN</label>
              <input id="pf-mpn" className="gc-input ap-mono" value={v.mpn} onChange={v.typeMpn} />
            </div>
            <div className="ap-field">
              <label className="gc-label" htmlFor="pf-alt">Alternate barcodes</label>
              <input id="pf-alt" className="gc-input ap-mono" value={v.altText} onChange={v.typeAlt} placeholder="Comma-separated" />
            </div>
            <div className="ap-field">
              <label className="gc-label" htmlFor="pf-internal">Internal barcode</label>
              <div className="ap-row" style={{ flexWrap: "nowrap" }}>
                <input id="pf-internal" className="gc-input ap-mono ap-grow" value={v.internalBc} onChange={v.typeInternal} aria-invalid={v.internalErr ? "true" : undefined} aria-describedby={v.internalErr ? "pf-internal-err" : undefined} />
                <button type="button" className="ix-btn" onClick={v.genBarcode}>Generate</button>
                <__Link href="/barcode-labels" className="ix-btn ix-btn--icon" aria-label="Print labels" title="Print labels"><__Icon name="printer" width="16" height="16" aria-hidden="true" /></__Link>
              </div>
              <Err id="pf-internal-err" text={v.internalErr} />
            </div>
            <p className="ap-amber">Grid may generate an internal barcode, but must never fabricate or export it as a GTIN/EAN.</p>
            <div className="ap-field">
              <div className="ap-lbl"><span className="gc-label">Other codes</span><__InfoTip text="Supplier codes, pack barcodes, PLU, scale codes, ISBN, and codes for one variant. Every code here scans as this product." /></div>
              {__list(v.idRows).map((r) => (
                <div key={r.key} className="ap-idrow">
                  <select className="gc-input gc-select" aria-label="Kind of code" value={r.type} onChange={r.setType}>
                    {__list(v.idTypes).map((t) => (<option key={t.k} value={t.k}>{t.label}</option>))}
                  </select>
                  <input className="gc-input ap-mono" aria-label="Code" value={r.value} onChange={r.setValue} placeholder="Code" aria-invalid={r.err ? 'true' : undefined} title={r.hint} />
                  {v.variantSkus.length ? (
                    <select className="gc-input gc-select" aria-label="Variant" value={r.variant} onChange={r.setVariant}>
                      <option value="">All variants</option>
                      {__list(v.variantSkus).map((x) => (<option key={x.sku} value={x.sku}>{x.name}</option>))}
                    </select>
                  ) : null}
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove code" onClick={r.remove}><__Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                  {r.err ? <span className="ap-err ap-idrow__err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{r.err}</span> : null}
                </div>
              ))}
              <div><button type="button" id="pf-ids" className="ix-btn ix-btn--sm" onClick={v.addId}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a code</button></div>
              <Err id="pf-ids-err" text={v.idErr} />
            </div>
          </div>
          {v.physical ? (
            <div className="ap-dsec">
              <h3 className="ap-dh">Units & packaging</h3>
              <div className="ap-grid2">
                <label className="ap-field"><span className="gc-label">Inventory unit</span>
                  <select className="gc-input gc-select" value={v.unit} onChange={v.setUnit}>{__list(v.units).map((u) => (<option key={u.k} value={u.k}>{u.label}</option>))}</select>
                </label>
                <label className="ap-field"><span className="gc-label">Retail sale unit</span>
                  <select className="gc-input gc-select" value={v.saleUnit} onChange={v.setSaleUnit}>{__list(v.unitOpts).map((u) => (<option key={u.k} value={u.k}>{u.label}</option>))}</select>
                </label>
                <label className="ap-field"><span className="gc-label">Purchase unit</span>
                  <select className="gc-input gc-select" value={v.buyUnit} onChange={v.setBuyUnit}>{__list(v.unitOpts).map((u) => (<option key={u.k} value={u.k}>{u.label}</option>))}</select>
                </label>
                <div className="ap-field"><span className="gc-label">Pack conversion</span><div className="gc-input ap-readonly">{v.packConv}</div></div>
              </div>
              <div className="ap-field">
                <div className="ap-lbl"><span className="gc-label">{'Packs · stock is counted in ' + v.unitShort}</span><__InfoTip text="A pack is a number of base units, for example Carton of 48. Scanning a pack barcode adds the whole pack." /></div>
                {__list(v.packRows).map((r) => (
                  <div key={r.key} className="ap-idrow">
                    <input className="gc-input" aria-label="Pack name" value={r.name} onChange={r.typeName} placeholder="Box of 12" />
                    <span className="ap-suffix ap-packqty"><input className="gc-input ap-num" aria-label="Units in the pack" inputMode="numeric" value={r.qty} onChange={r.typeQty} /><span aria-hidden="true">{v.unitShort}</span></span>
                    <input className="gc-input ap-mono" aria-label="Pack barcode" value={r.barcode} onChange={r.typeBarcode} placeholder="Pack barcode" />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove pack" onClick={r.remove}><__Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                  </div>
                ))}
                <div><button type="button" id="pf-packs" className="ix-btn ix-btn--sm" onClick={v.addPack}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a pack</button></div>
                <Err id="pf-packs-err" text={v.packErr} />
              </div>
            </div>
          ) : null}
          {v.showStock ? (
            <div className="ap-dsec">
              <h3 className="ap-dh">Stock<span className="ap-push" /><__Link href="/stock" className="ap-src">Stock history</__Link></h3>
              <table className="ap-stock gc-table--keep">
                <thead><tr><th scope="col">Location</th><th scope="col">Available</th><th scope="col">Reserved for orders</th></tr></thead>
                <tbody>
                  {__list(v.openPlaces).map((pl, i) => (<tr key={pl}><td>{pl}</td><td className="ix-strong">{v.stockHere?.[i]?.avail ?? 0}</td><td className="ix-muted">{v.stockHere?.[i]?.held ?? 0}</td></tr>))}
                </tbody>
              </table>
              <div className="ap-field">
                <span className="gc-label">Opening stock</span>
                <div className="ap-grid2">
                  <label className="ap-field"><span className="ap-src">Central Warehouse</span><input className="gc-input ap-num" value={v.open0} onChange={v.typeOpen0} inputMode="numeric" aria-label="Opening stock Central Warehouse" /></label>
                  <label className="ap-field"><span className="ap-src">Dhanmondi branch</span><input className="gc-input ap-num" value={v.open1} onChange={v.typeOpen1} inputMode="numeric" aria-label="Opening stock Dhanmondi branch" /></label>
                </div>
                <p className="ap-help">Added to stock once, when you save.</p>
              </div>
              <label className="ap-row" style={{ fontSize: "var(--text-sm)" }}>
                <span>Alert me when stock is below</span>
                <input className="gc-input ap-num" value={v.lowAt} onChange={v.typeLowAt} inputMode="numeric" aria-label="Low stock alert" style={{ width: "72px" }} />
              </label>
            </div>
          ) : null}
        </Drawer>

        <Drawer open={sh === 'ship'} title="Shipping & fulfilment" sub={v.pageTitle} onCancel={v.cancelSheet} onSave={v.closeSheet}>
          {v.physical ? (<>
            <div className="ap-dsec">
              <div className="ap-grid2">
                <label className="ap-field"><span className="gc-label">Shipping weight</span><span className="ap-suffix"><input className="gc-input ap-num" inputMode="decimal" value={v.ship.weight} onChange={v.setShip('weight')} placeholder="0.45" /><span aria-hidden="true">kg</span></span></label>
                <label className="ap-field"><span className="gc-label">Parcel</span>
                  <select className="gc-input gc-select" value={v.ship.parcel} onChange={v.setShip('parcel')}>
                    <option value="box">Box</option><option value="envelope">Envelope</option><option value="bag">Poly bag</option><option value="own">Ships in its own box</option>
                  </select>
                </label>
              </div>
              <div className="ap-grid3">
                <label className="ap-field"><span className="gc-label">Length</span><span className="ap-suffix"><input className="gc-input ap-num" inputMode="decimal" value={v.ship.length} onChange={v.setShip('length')} /><span aria-hidden="true">cm</span></span></label>
                <label className="ap-field"><span className="gc-label">Width</span><span className="ap-suffix"><input className="gc-input ap-num" inputMode="decimal" value={v.ship.width} onChange={v.setShip('width')} /><span aria-hidden="true">cm</span></span></label>
                <label className="ap-field"><span className="gc-label">Height</span><span className="ap-suffix"><input className="gc-input ap-num" inputMode="decimal" value={v.ship.height} onChange={v.setShip('height')} /><span aria-hidden="true">cm</span></span></label>
              </div>
              <div className="ap-switch">
                <span>Fragile — handle with care<__InfoTip text="Printed on the courier label" /></span>
                <Switch on={v.ship.fragile} onToggle={v.toggleFragile} label="Fragile — handle with care" />
              </div>
              {v.shipFrom ? <p className="ap-help">{'Online orders ship from ' + v.shipFrom + '.'}</p> : null}
            </div>
          </>) : v.format === 'digital' ? (
            <div className="ap-dsec">
              <h3 className="ap-dh">Download</h3>
              <div className="ap-grid2">
                <label className="ap-field"><span className="gc-label">File</span><input className="gc-input" value={v.digital.file || ''} onChange={v.setDigital('file')} placeholder="recipes.pdf" /></label>
                <label className="ap-field"><span className="gc-label">Version</span><input className="gc-input" value={v.digital.version || ''} onChange={v.setDigital('version')} /></label>
                <label className="ap-field"><span className="gc-label">Downloads per order</span><input className="gc-input ap-num" inputMode="numeric" value={v.digital.limit || ''} onChange={v.setDigital('limit')} /></label>
                <label className="ap-field"><span className="gc-label">Access for (days)</span><input className="gc-input ap-num" inputMode="numeric" value={v.digital.days || ''} onChange={v.setDigital('days')} /></label>
              </div>
              <p className="ap-help">Sent to the customer as soon as the order is paid.</p>
            </div>
          ) : v.format === 'licence' ? (
            <div className="ap-dsec">
              <h3 className="ap-dh">Licence keys<span className="ap-push ap-src">{v.keysFree + ' free · ' + v.keysAll.length + ' in all'}</span></h3>
              <label className="ap-field">
                <span className="gc-label">Add keys, one per line</span>
                <textarea className="gc-input ap-mono" rows="3" value={v.keysText} onChange={v.typeKeys} />
              </label>
              <div><button type="button" className="ix-btn ix-btn--sm" onClick={v.addKeys}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add keys</button></div>
              {v.keysAll.length ? (
                <ul className="ap-keys">
                  {__list(v.keysAll.slice(-6).reverse()).map((k) => (
                    <li key={k.key}><span className="ap-mono">{maskKey(k.key)}</span><span className="ix-muted">{k.status === 'free' ? 'Free' : k.status === 'assigned' ? (k.ref + (k.who ? ' · ' + k.who : '')) : k.status === 'replaced' ? 'Replaced' : k.status}</span></li>
                  ))}
                </ul>
              ) : <p className="ap-help">A sale takes one free key. When the pool is empty the product shows as out of stock.</p>}
            </div>
          ) : <p className="ap-help">A service is not shipped and not counted in stock.</p>}
        </Drawer>

        <Drawer open={sh === 'rel'} title="Product relationships" sub={v.pageTitle} onCancel={v.cancelSheet} onSave={v.closeSheet}>
          <div className="ap-dsec">
            <p className="ap-help">Shown on the product page and offered at checkout. Substitutes are offered when this one is out of stock.</p>
            {__list(v.relRows).map((r) => (
              <div key={r.k} className="ap-field">
                <span className="gc-label">{r.label}</span>
                <div className="ap-chips">
                  {__list(r.items).map((it) => (<span key={it.id} className="ap-chip">{it.name}<button type="button" onClick={it.remove} aria-label={'Remove ' + it.name}><__Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>))}
                </div>
                {r.many || !r.items.length ? (
                  <select className="gc-input gc-select" aria-label={'Add to ' + r.label} value="" onChange={r.add}>
                    <option value="">{r.many ? 'Add a product' : 'Pick a product'}</option>
                    {__list(r.options).map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
                  </select>
                ) : null}
              </div>
            ))}
          </div>
          <div className="ap-dsec">
            <div className="ap-switch">
              <span>Components (bundle)<__InfoTip text="A combo sells as many as its parts allow. A kit is put together in the warehouse first." /></span>
              <Switch on={v.isBundle} onToggle={v.toggleBundle} label="This product is made of other products" />
            </div>
            {v.isBundle ? (<>
              <div className="gc-seg" role="group" aria-label="Kind of bundle">
                {Object.keys(v.bundleTypes).map((k) => (<button key={k} type="button" className={'gc-seg__btn' + (v.bundleType === k ? ' gc-seg__btn--active' : '')} aria-pressed={v.bundleType === k} onClick={v.setBundleType(k)}>{v.bundleTypes[k]}</button>))}
              </div>
              {__list(v.partRows).map((r) => (
                <div key={r.key} className="ap-idrow">
                  <select className="gc-input gc-select" aria-label="Part" value={r.sku} onChange={r.setSku}>
                    <option value="">Pick a product</option>
                    {__list(v.partChoices).map((c) => (<option key={c.sku} value={c.sku}>{c.name}{c.variant ? ' · ' + c.variant : ''}</option>))}
                  </select>
                  <span className="ap-suffix ap-packqty"><input className="gc-input ap-num" aria-label="How many" inputMode="numeric" value={r.qty} onChange={r.setQty} /><span aria-hidden="true">each</span></span>
                  <span className="ix-muted ap-free">{r.sku ? r.free + ' free' : ''}</span>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove part" onClick={r.remove}><__Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                </div>
              ))}
              <div><button type="button" id="pf-bundle" className="ix-btn ix-btn--sm" onClick={v.addPart}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a part</button></div>
              <Err id="pf-bundle-err" text={v.bundleErr} />
              <p className="ap-help">{v.bundleType === 'kit' ? 'Assemble kits in Stock: the parts go out and finished kits come in.' : 'Can sell ' + v.bundleCan + ' now. Selling one takes its parts out of stock.'}</p>
            </>) : null}
          </div>
        </Drawer>

        <Drawer open={sh === 'variants'} wide title="Variant editor" sub={v.optCount + (v.optCount === 1 ? ' option dimension · ' : ' option dimensions · ') + v.varCount + (v.varCount === 1 ? ' generated variant' : ' generated variants') + ' · price, identifiers, media and publishing per variant.'} onCancel={v.cancelSheet} onSave={v.closeSheet}>
          {v.hasVariants ? __list(v.varRows).map((r) => (
            <div key={r.key} className="ap-vcard">
              <div className="ap-vcard__head">
                {r.swatch ? <span className="ap-swatch" style={{ background: r.swatch }} /> : null}
                <b>{r.name}</b>
                <span className="ap-src">Published</span>
                <Switch on={r.published} onToggle={r.togglePub} label={'Publish ' + r.name} />
              </div>
              <div className="ap-grid2">
                <label className="ap-field"><span className="gc-label">Price</span><MoneyIn value={r.price} onChange={r.typePrice} placeholder={r.pricePh} label={'Price for ' + r.name} /></label>
                <label className="ap-field"><span className="gc-label">MRP</span><MoneyIn value={r.mrp} onChange={r.typeMrp} placeholder={r.mrpPh} label={'MRP for ' + r.name} /></label>
                <label className="ap-field"><span className="gc-label">SKU</span><input className="gc-input ap-mono" value={r.sku} onChange={r.typeSku} /></label>
                <label className="ap-field"><span className="gc-label">GTIN</span><input className="gc-input ap-mono" value={r.gtin} onChange={r.typeGtin} inputMode="numeric" /></label>
                {v.sellsWs ? (<>
                  <div className="ap-field">
                    <label className="gc-label" htmlFor={r.wsId}>Wholesale price</label>
                    <input className="gc-input ap-num" inputMode="decimal" value={r.ws} placeholder={v.wsPh} onChange={r.typeWs} id={r.wsId} aria-invalid={r.wsErr ? "true" : undefined} aria-describedby={r.wsErr ? `${r.wsId}-err` : undefined} />
                    <Err id={`${r.wsId}-err`} text={r.wsErr} />
                  </div>
                  <div className="ap-field">
                    <label className="gc-label" htmlFor={r.moqId}>Minimum order</label>
                    <input className="gc-input ap-num" inputMode="numeric" value={r.moq} placeholder={v.moqPh} onChange={r.typeMoq} id={r.moqId} aria-invalid={r.moqErr ? "true" : undefined} aria-describedby={r.moqErr ? `${r.moqId}-err` : undefined} />
                    <Err id={`${r.moqId}-err`} text={r.moqErr} />
                  </div>
                </>) : null}
                <label className="ap-field"><span className="gc-label">Media</span>
                  <select className="gc-input gc-select" value={r.mediaId} onChange={r.setMedia}>
                    <option value="">Same as the product</option>
                    {__list(v.mediaChoices).map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
                  </select>
                </label>
                <div className="ap-field"><span className="gc-label">Available from Inventory</span><div className="gc-input ap-readonly ap-num">{r.avail}</div></div>
              </div>
              {r.data.length ? (
                <div className="ap-field">
                  <span className="gc-label">Product data</span>
                  <div className="ap-grid2">
                    {r.data.map((d) => (
                      <label key={d.k} className="ap-field"><span className="ap-src">{d.l}</span>
                        {d.o ? (
                          <select className="gc-input gc-select" value={d.value} onChange={d.onChange}><option value="">Same as the product</option>{d.o.map((o) => (<option key={o} value={o}>{o}</option>))}</select>
                        ) : <input className="gc-input" value={d.value} onChange={d.onChange} placeholder="Same as the product" />}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )) : <p className="ap-help">This product has no variants. Add an option first.</p>}
          {v.hasVariants ? <p className="ap-help">{v.sellsWs ? 'Leave a variant’s wholesale price or MOQ empty to use the product’s own (shown in grey). ' : ''}Available stock is intentionally read-only. Quantity changes must create Inventory ledger movements.</p> : null}
        </Drawer>

        <Drawer open={sh === 'pub'} title="Manage publishing" sub={v.pageTitle} saveLabel="Apply" onCancel={v.cancelSheet} onSave={v.closeSheet}>
          <div className="ap-dsec">
            <h3 className="ap-dh">Sales channels</h3>
            {__list(v.pubRows).map((r) => (
              <label key={r.k} className="ap-check">
                <input type="checkbox" className="gc-check" checked={r.on} onChange={r.toggle} />
                <span><b style={{ fontWeight: "var(--weight-medium)" }}>{r.label}</b>{r.issues.length ? <small>{r.issues.join(' · ')}</small> : null}</span>
                <em className={r.issues.length ? 'is-warn' : ''}>{r.ready}</em>
              </label>
            ))}
            {v.status !== 'active' ? <p className="ap-help">Draft products are not sent. Make the product active to publish it.</p> : null}
          </div>
          <div className="ap-dsec ap-pub">
            <h3 className="ap-dh">Channel sync<span className="ap-push" /><__Link href="/channels" className="ap-src">Channels</__Link></h3>
            <ProductChannels draft={v.status !== 'active'} />
          </div>
          <div className="ap-dsec">
            <h3 className="ap-dh">Catalogues</h3>
            {__list(v.catRows).map((r) => (
              <label key={r.k} className="ap-check">
                <input type="checkbox" className="gc-check" checked={r.on} onChange={r.toggle} />
                <span><b style={{ fontWeight: "var(--weight-medium)" }}>{r.label}</b><small>Availability can be restricted by catalogue or location</small></span>
              </label>
            ))}
          </div>
          <div className="ap-dsec">
            <h3 className="ap-dh">Variant exceptions</h3>
            <p className="ap-help">Individual variants can override parent publishing when necessary.</p>
            {v.hasVariants ? __list(v.varRows).map((r) => (
              <label key={r.key} className="ap-check">
                <input type="checkbox" className="gc-check" checked={r.published} onChange={r.togglePub} />
                <span>{r.name}</span>
              </label>
            )) : <p className="ap-help">No variants.</p>}
          </div>
          <div className="ap-dsec">
            <h3 className="ap-dh">Ready to sell?</h3>
            <ul className="ap-ready">
              {__list(v.checks).map((k, i) => (
                <li key={i} className={k.ok ? '' : 'is-off'}><i className={k.ok ? 'is-ok' : ''} aria-hidden="true"><__Icon name="check" width="10" height="10" strokeWidth="3" /></i><span>{k.l}</span></li>
              ))}
            </ul>
          </div>
        </Drawer>

        <Drawer open={sh === 'data'} title="Product data" sub={v.pageTitle} onCancel={v.cancelSheet} onSave={v.closeSheet}>
          <p className="ap-help">This is the full structured Product Data view for the selected template. Add/reorder fields in the main Specifications card; edit values here without leaving the product.</p>
          {__list(v.dataGroups).map((g) => (
            <div key={g.name} className="ap-dsec">
              <h3 className="ap-dh">{g.name}<span className="ap-push ap-src">{g.rows.length === 1 ? '1 field' : g.rows.length + ' fields'}</span></h3>
              {g.rows.map((r) => (
                <div key={r.k} className="ap-field">
                  <div className="ap-lbl"><label className="gc-label" htmlFor={r.id}>{r.l + (r.unit ? ' (' + r.unit + ')' : '')}</label><span className="ap-push ap-ftag">{r.own ? 'Product field' : 'Template field'}</span></div>
                  <ValueIn r={r} />
                  {r.label && r.source !== 'product' ? <span className="ap-src">{r.label}</span> : null}
                </div>
              ))}
            </div>
          ))}
          <div className="ap-dsec">
            <h3 className="ap-dh">Google product data<span className="ap-push ap-src">Channel mapping</span></h3>
            <div className="ap-field">
              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-gcat">Google category</label><span className="ap-push ap-ftag">Auto mapping</span></div>
              <input id="pf-gcat" className="gc-input" value={v.google.category} onChange={v.setG('category')} placeholder={v.gCatAuto} />
            </div>
            <div className="ap-field">
              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-dg-gtin">GTIN</label><span className="ap-push ap-ftag">Channel field</span></div>
              <input id="pf-dg-gtin" className="gc-input ap-mono" value={v.gtin} onChange={v.typeGtin} inputMode="numeric" placeholder="Manufacturer / GS1 assigned value" />
              {v.gtinWarn ? <span className="ap-src">{v.gtinWarn}</span> : null}
            </div>
            <div className="ap-field">
              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-dg-mpn">MPN</label><span className="ap-push ap-ftag">Channel field</span></div>
              <input id="pf-dg-mpn" className="gc-input ap-mono" value={v.mpn} onChange={v.typeMpn} />
            </div>
            <div className="ap-field">
              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-dg-cond">Condition</label><span className="ap-push ap-ftag">Channel field</span></div>
              <select id="pf-dg-cond" className="gc-input gc-select" value={v.google.condition} onChange={v.setG('condition')}>
                <option value="new">New</option><option value="refurbished">Refurbished</option><option value="used">Used</option>
              </select>
            </div>
            <div className="ap-grid2">
              <div className="ap-field">
                <div className="ap-lbl"><label className="gc-label" htmlFor="pf-dg-color">Colour</label><span className="ap-push ap-ftag">Channel field</span></div>
                <input id="pf-dg-color" className="gc-input" value={v.google.color} onChange={v.setG('color')} />
              </div>
              <div className="ap-field">
                <div className="ap-lbl"><label className="gc-label" htmlFor="pf-dg-size">Size</label><span className="ap-push ap-ftag">Channel field</span></div>
                <input id="pf-dg-size" className="gc-input" value={v.google.size} onChange={v.setG('size')} />
              </div>
            </div>
          </div>
          <div className="ap-dsec">
            <h3 className="ap-dh">Size guide<span className="ap-push" /><__Link href="/catalog-setup" className="ap-src">Make a size chart</__Link></h3>
            <select className="gc-input gc-select" value={v.sg} onChange={v.setSg} aria-label="Size guide">
              <option value="none">No size guide</option>
              <option value="shirt">Men’s shirts and polos</option>
              <option value="kurti">Women’s kurti</option>
              <option value="shoe">Shoes (BD / EU / UK)</option>
            </select>
            {v.hasSg ? (
              <div className="ap-twrap">
                <table className="ap-sg gc-table--keep">
                  <thead><tr>{v.sgHead.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                  <tbody>{v.sgRows.map((r, i) => (<tr key={i}>{r.map((c, j) => <td key={j} className="ap-num">{c}</td>)}</tr>))}</tbody>
                </table>
              </div>
            ) : null}
          </div>
        </Drawer>

        <Drawer open={sh === 'warranty'} title="Warranty" sub={v.pageTitle} onCancel={v.cancelSheet} onSave={v.closeSheet}>
          <div className="ap-dsec">
            <div className="ap-switch">
              <span id="ap-q-war">Does this product come with a warranty?</span>
              <Seg opts={v.wqOpts} labelledBy="ap-q-war" />
            </div>
            {v.wYes ? (<>
              <div className="ap-grid2">
                <div className="ap-field">
                  <div className="ap-lbl"><label className="gc-label" htmlFor="pf-wp">Warranty policy</label><__InfoTip text="Written once in Stock › Warranty policies" /></div>
                  <select id="pf-wp" className="gc-input gc-select" value={v.wp} onChange={v.setWp}>
                    <option value="brand1y">Smartphone brand warranty · 12 months</option>
                    <option value="shop6m">6 months shop service warranty</option>
                    <option value="rep7d">7-day replacement guarantee</option>
                    <option value="elec2y">2 years parts, 1 year service</option>
                  </select>
                </div>
                <div className="ap-field">
                  <div className="ap-lbl"><span className="gc-label">Starts from</span><__InfoTip text="Set by the policy" /></div>
                  <div className="gc-input ap-readonly">{v.wpStart}</div>
                </div>
              </div>
              <dl className="ix-kv">
                {__list(v.wpInfo).map((w, i) => (<React.Fragment key={i}><dt>{w.k}</dt><dd>{w.v}</dd></React.Fragment>))}
              </dl>
              <div className="ap-field">
                <div className="ap-lbl"><label className="gc-label" htmlFor="pf-wtext">Warranty description for this product</label><__InfoTip text="Shown on the product page under the price, with a link to the full policy. Filled from the policy — change it only if this product is different." /></div>
                <textarea id="pf-wtext" className="gc-input" rows="4" value={v.wpText} onChange={v.typeWtext} />
              </div>
              <div className="ap-row">
                <__Link href="/warranty-policies">Open warranty policies</__Link>
                <span className="ap-src">Printed on the invoice and warranty card</span>
              </div>
            </>) : null}
            <p className="ap-help">Supplier warranty stays in Purchasing; serial traceability stays in Inventory; claims stay in After-sales.</p>
          </div>
        </Drawer>

        <Drawer open={sh === 'ai'} title="AI writing assistant" sub="You check every word before saving." saveLabel={'Write ' + v.aiCount + ' fields'} onCancel={v.cancelSheet} onSave={v.runAssist}>
          <label className="ap-field">
            <span className="gc-label">Key facts about the product</span>
            <input className="gc-input" value={v.facts} onChange={v.typeFacts} />
          </label>
          <div className="ap-field">
            <span className="gc-label">Fill these</span>
            <div className="ix-chips">
              {__list(v.aiFields).map((c, i) => (
                <button key={i} type="button" className="ix-chip" aria-pressed={!!c.on} onClick={c.pick}>{c.on ? <__Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{c.label}</button>
              ))}
            </div>
          </div>
          <div className="ap-grid2">
            <label className="ap-field"><span className="gc-label">Language</span>
              <select className="gc-input gc-select"><option>English</option><option>বাংলা</option><option>English + বাংলা</option></select>
            </label>
            <label className="ap-field"><span className="gc-label">Tone</span>
              <select className="gc-input gc-select"><option>Premium</option><option>Friendly</option><option>Simple and short</option></select>
            </label>
          </div>
        </Drawer>

        <Drawer open={sh === 'preview'} title="Preview" sub="How the product page shows it" cancelLabel={null} saveLabel="Close" onCancel={v.closeSheet} onSave={v.closeSheet}>
          <div className="ap-pv">
            <div className="ap-pv__img">{v.media.length && v.media[0].src ? <img src={v.media[0].src} alt={v.media[0].alt} /> : <span><__Icon name="image" width="16" height="16" aria-hidden="true" /></span>}</div>
            <h3>{v.pageTitle}</h3>
            <div className="ap-pv__price"><b>{v.price ? '৳' + v.price : '—'}</b>{v.mrp ? <s>{'৳' + v.mrp}</s> : null}</div>
            {v.short ? <p className="ap-help" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{v.short}</p> : null}
            {sh === 'preview' && v.long ? <div className="ap-pv__long" dangerouslySetInnerHTML={{ __html: toHtml(v.long) }} /> : null}
            {v.wYes ? <p className="ap-src">{v.warrantyLine}</p> : null}
          </div>
        </Drawer>

        <__Dialog open={v.verOpen} title={v.verView ? 'Version ' + v.verView.v : 'Version history'} onClose={v.closeVersions} width={560}
          footer={v.verView ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => v.viewVersion(null)}>All versions</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => v.restoreVersion(v.verView)} disabled={v.verView.v === (v.versions[0] || {}).v}>Restore this version</button></> : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.closeVersions}>Done</button>}>
          {v.verView ? (
            <dl className="ix-kv">
              {[['Saved', formatDateTime(v.verView.at) + ' · ' + v.verView.by], ['Changed', v.verView.note || v.verView.changes.join(', ') || '—'], ['Title', v.verView.rec.name], ['Selling price', v.verView.rec.price != null ? bdt(v.verView.rec.price) : '—'], ['MRP', v.verView.rec.mrp != null ? bdt(v.verView.rec.mrp) : '—'], ['Cost', v.verView.rec.cost != null ? bdt(v.verView.rec.cost) : '—'], ['Status', v.verView.rec.st || '—'], ['SKU', v.verView.rec.sku || '—'], ['Category', v.verView.rec.cat || '—']].map(([k, val]) => (<React.Fragment key={k}><dt>{k}</dt><dd>{val}</dd></React.Fragment>))}
            </dl>
          ) : v.versions.length ? (
            <ul className="ap-vers">
              {__list(v.versions).map((x) => (
                <li key={x.v}><button type="button" className="ap-verbtn" onClick={() => v.viewVersion(x)}><b>{'Version ' + x.v + (x === v.versions[0] ? ' · current' : '')}</b><small>{formatDateTime(x.at) + ' · ' + x.by}</small><small>{x.note || x.changes.join(', ') || 'Saved'}</small></button></li>
              ))}
            </ul>
          ) : <p className="gc-help" style={{ margin: 0 }}>No versions yet. Every save keeps one.</p>}
        </__Dialog>

        <__Dialog open={!!v.priceAsk} title="Price change needs approval" onClose={v.closePriceAsk} width={460}
          footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closePriceAsk}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.sendPrice}>Send for approval</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.approvePriceNow}>Approve now</button></>}>
          <p className="gc-help" style={{ margin: 0 }}>{v.priceAskText}</p>
          <p className="gc-help" style={{ margin: "var(--space-2) 0 0" }}>Send for approval saves your other changes now. The new price goes live when a manager approves it.</p>
        </__Dialog>
        <ManagerPin open={!!v.pinFor} reason={v.pinReason} onApprove={v.pinApprove} onClose={v.closePin} action="Product price change" refId={this.state && this.state.editId} />
      </div>
    );
  }
}
