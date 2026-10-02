'use client';
// Generated from design/templates/products/AddProduct.dc.html by scripts/convert-design.mjs.
// AddProduct — Products — Add product / Edit product, laid out like Shopify's product page (docs/shopify-style.md).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge, InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import ProductChannels from '@/components/ProductChannels';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { findProduct, saveProduct, codeOwner, newProductId, getSavedProducts, SELL_TO } from '@/lib/products';
import { getStockSetup, isOnePlace } from '@/lib/stockSetup';
import { addMove, stockAt } from '@/lib/stock';
import { onlinePlace } from '@/lib/locations';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }

// ---- form helpers: validation and unsaved-changes tracking ----
// State that is not part of the product itself (open panels, AI review marks, errors, the tab).
var TRANSIENT = { ai: 1, prev: 1, assistOpen: 1, catOpen: 1, aiSel: 1, facts: 1, msg: 1, bad: 1, errors: 1, dirty: 1, tab: 1, stripL: 1, stripR: 1, savedList: 1 };
var FIELD_ORDER = ['title', 'price', 'cost', 'wholesale', 'moq', 'sku', 'barcode', 'variants', 'shelf'];
var FIELD_TAB = { title: 'basics', price: 'pricing', cost: 'pricing', shelf: 'validity' };
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
// The product's values as form state (edit mode).
// Barcodes (Nayeem's Product brief #1): a manufacturer's barcode (GTIN, printed on the pack) is kept apart
// from a code the shop makes for itself. "Make one" makes an in-store EAN-13 (starting with 2, the range kept
// for use inside a shop), marked barcodeType 'internal', so it is never sent to Google as a GTIN.
function gtinOk(code) {
  var d = String(code || '').trim();
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(d)) return false;
  var sum = 0, n = d.length;
  for (var i = 0; i < n - 1; i++) sum += (+d[n - 2 - i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === +d[n - 1];
}
function barcodeTypeOf(code) { var d = String(code || '').trim(); return !d ? '' : gtinOk(d) && !(d.length === 13 && d[0] === '2') ? 'gtin' : 'internal'; }
function inStoreCode() {
  var b = '2'; for (var i = 0; i < 11; i++) b += Math.floor(Math.random() * 10);
  var sum = 0; for (var j = 0; j < 12; j++) sum += (+b[11 - j]) * (j % 2 === 0 ? 3 : 1);
  return b + ((10 - (sum % 10)) % 10);
}
// Opening stock (Inventory card): the two rows of the card, posted as stock moves when the product is saved
var OPEN_PLACES = ['Central Warehouse', 'Dhanmondi branch'];
function prefillFrom(p) {
  var money = function (n) { return n == null || n === '' ? '' : bdt(n); };
  var str = function (n) { return n == null || n === '' ? '' : String(n); };
  return {
    editId: p.id, orig: p, basePrice: p.price, title: p.name, short: p.short || '', long: p.long || '', seoT: p.seoT || p.name, seoD: p.seoD || '', tags: p.tags || [],
    price: money(p.price), cost: money(p.cost), mrp: money(p.mrp), wholesale: str(p.wholesale), moq: str(p.moq), sell: p.sell || 'retail',
    sku: p.sku || '', barcode: p.barcode || '', barcodeType: p.barcodeType || '', oversell: !!p.oversell, cat: catLeaf(p.cat), brand: p.brand || '', status: p.st || 'active', opts: p.opts || [],
    variants: (p.variants || []).map(function (x) { return assign(assign({}, x), { wholesale: str(x.wholesale), moq: str(x.moq) }); })
  };
}

var AI_TXT = {
  short: '6.7-inch AMOLED, 5000 mAh battery and a 50 MP camera — with 1 year official Samsung warranty in Bangladesh.',
  long: 'Meet the 5G Smartphone Pro — a big, bright 6.7-inch AMOLED screen that stays sharp in the sun, and a 5000 mAh battery that lasts a full day and more.\n\nWhat you get\n• 256 GB or 512 GB storage, 8 GB RAM\n• 50 MP main camera with night mode\n• Fast 45 W charging\n• Dual SIM, 5G ready for Grameenphone and Robi\n\nEvery phone is official, PTA approved and comes with a 1-year brand warranty. The IMEI is printed on your invoice.',
  bangla: '\n\nবাংলায়: ৬.৭ ইঞ্চি AMOLED স্ক্রিন, ৫০০০ mAh ব্যাটারি ও ৫০ MP ক্যামেরা। অফিসিয়াল ১ বছরের ওয়ারেন্টি।',
  seoT: '5G Smartphone Pro 256GB Price in Bangladesh | GridShop',
  seoD: 'Buy the 5G Smartphone Pro 256GB at the best price in BD. Official warranty, 6.7" AMOLED, 5000 mAh. Cash on delivery all over Bangladesh.'
};
var FAQ_AI = [['Is this the official version?', 'Yes. Every phone is official and PTA approved, with a 1-year brand warranty.'], ['Does it support 5G in Bangladesh?', 'Yes, it works on 5G where Grameenphone and Robi have it, and on 4G everywhere else.'], ['Can I pay by EMI?', 'Yes, 3 to 12 months EMI on most bank cards.']];
var CATS = [['Skin care', 0, 64], ['Sunscreen', 1, 12], ['Toner', 1, 9], ['Gel', 1, 5], ['Clothing', 0, 118], ['Men', 1, 52], ['Women', 1, 66], ['Electronics', 0, 41], ['Phones', 1, 18], ['Laptops', 1, 7], ['Audio', 1, 16], ['Grocery', 0, 89], ['Rice', 1, 14], ['Home', 0, 23]];
var PARENT = { Sunscreen: 'Skin care', Toner: 'Skin care', Gel: 'Skin care', Men: 'Clothing', Women: 'Clothing', Phones: 'Electronics', Laptops: 'Electronics', Audio: 'Electronics', Rice: 'Grocery' };
var BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'ASUS', 'SoundMax', 'Beauty of Joseon', 'Nature Republic', 'GridShop', 'Chashi', 'Walton'];
var CF = { Phones: [['RAM', 'dropdown', '8 GB'], ['Network', 'dropdown', '5G'], ['Display size', 'number', '6.7 inch'], ['Battery', 'number', '5000 mAh'], ['PTA approved', 'yes / no', 'Yes'], ['Country of origin', 'text', 'Vietnam']],
  Sunscreen: [['Skin type', 'dropdown', 'Oily, combination'], ['SPF', 'number', '50'], ['Expiry date', 'date', '12 Aug 2028'], ['Key ingredients', 'text', 'Rice extract, probiotics'], ['Country of origin', 'text', 'South Korea'], ['Volume', 'number', '50 ml']],
  Toner: [['Skin type', 'dropdown', 'All skin types'], ['Expiry date', 'date', '3 Mar 2028'], ['Key ingredients', 'text', 'Hyaluronic acid, panthenol'], ['Country of origin', 'text', 'South Korea'], ['Volume', 'number', '150 ml'], ['Alcohol free', 'yes / no', 'Yes']],
  _: [['Material', 'text', ''], ['Country of origin', 'text', ''], ['Care instructions', 'text', '']] };
var WP = { brand1y: [['Period', '12 months'], ['Proof needed', 'Invoice + IMEI'], ['Claim at', 'Service centre, Mirpur 10']], shop6m: [['Period', '6 months'], ['Type', 'Shop service'], ['Claim at', 'Your shop']], rep7d: [['Period', '7 days'], ['Type', 'Replacement'], ['Claim at', 'Your shop']], elec2y: [['Period', '2 years'], ['Type', 'Parts + service'], ['Claim at', 'Brand centre']] };
var WPS = { brand1y: 'Delivery date', shop6m: 'Delivery date', rep7d: 'Delivery date', elec2y: 'Invoice date' };
var WPT = { brand1y: '12 months brand warranty. Covers manufacturing defects, battery below 80% health, and motherboard or display faults. Not covered: physical or liquid damage, phones opened by a third party, software issues after rooting. Repair first; replaced if it cannot be repaired within 15 days.', shop6m: 'We repair or replace parts at no cost for 6 months.', rep7d: 'Swap for a new piece within 7 days if faulty.', elec2y: 'Parts are free for 2 years; service is free for the first year.' };
var SG = { shirt: [['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)', 'Sleeve (in)'], [['S', '38', '27', '17', '8'], ['M', '40', '28', '18', '8.5'], ['L', '42', '29', '19', '9'], ['XL', '44', '30', '20', '9.5']]], kurti: [['Size', 'Bust (in)', 'Length (in)', 'Waist (in)', 'Hip (in)'], [['S', '34', '42', '30', '38'], ['M', '36', '43', '32', '40'], ['L', '38', '44', '34', '42'], ['XL', '40', '45', '36', '44']]], shoe: [['BD', 'EU', 'UK', 'Foot length (cm)', 'Width'], [['39', '39', '6', '24.5', 'Regular'], ['40', '40', '6.5', '25.1', 'Regular'], ['41', '41', '7.5', '25.8', 'Regular'], ['42', '42', '8', '26.4', 'Wide']]] };
var AIF = [['short', 'Short description'], ['long', 'Long description'], ['seo', 'SEO title and description'], ['tags', 'Tags'], ['faq', 'FAQ'], ['alt', 'Photo alt text']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  // /add-product adds a new product; /add-product?sku=… (or ?id=…) opens that product for editing.
  componentDidMount() {
    // wholesale price, MOQ and "sell to" only where the shop sells wholesale (stockSetup.js)
    this.setState({ wsOn: getStockSetup().wholesale });
    var self = this, qs = new URLSearchParams(window.location.search), saved = getSavedProducts();
    var key = { id: qs.get('id') || '', sku: qs.get('sku') || '' };
    var p = key.id || key.sku ? findProduct(key, saved) : null;
    var pre = p ? prefillFrom(p) : {};
    this.setState(assign({ savedList: saved }, pre), function () {
      var dom = domSnap(formEl());
      self.base = { dom: dom, key: JSON.stringify(dom), snap: self._snap, state: pre };
      if (!p && (key.id || key.sku)) __toast('That product was not found. You are adding a new one.', { tone: 'info' });
    });
  }
  componentDidUpdate(prevProps, prevState) { this.checkDirty(); }
  // Dirty = the fields or the switches differ from the last saved (or first loaded) values.
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
    Object.keys(s).forEach(function (k) { if (k !== 'tab' && k !== 'stripL' && k !== 'stripR' && k !== 'savedList') p[k] = null; });
    assign(p, this.base.state);
    this.setState(p, function () {
      var els = fieldEls(formEl()), dom = self.base.dom;
      if (els.length === dom.length) els.forEach(function (el, i) {
        if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked !== (dom[i] === '1')) el.checked = dom[i] === '1'; }
        else if (el.value !== dom[i]) el.value = dom[i];
      });
      self.checkDirty();
    });
  }
  renderVals() {
    var self = this, s = this.state || {};
    var ai = s.ai || {}, prev = s.prev || {};
    var f = function (k, d) { return s[k] != null ? s[k] : d; };
    var editing = !!s.editId, orig = s.orig || null;
    var short = f('short', ''), long = f('long', ''), seoT = f('seoT', ''), seoD = f('seoD', ''), tags = f('tags', []), faqs = f('faqs', []);
    var setAi = function (k, patch) { var p = assign({}, patch); var a = assign({}, ai); a[k] = true; p.ai = a; var pv = assign({}, prev); pv[k] = {}; Object.keys(patch).forEach(function (x) { pv[k][x] = s[x]; }); p.prev = pv; self.setState(p); };
    var gen = { short: function () { setAi('short', { short: AI_TXT.short }); }, long: function () { setAi('long', { long: AI_TXT.long }); }, seo: function () { setAi('seo', { seoT: AI_TXT.seoT, seoD: AI_TXT.seoD }); }, tags: function () { setAi('tags', { tags: ['5G', 'Samsung', 'AMOLED', '5000mAh', 'Official warranty', 'Android phone'] }); }, faq: function () { setAi('faq', { faqs: FAQ_AI }); }, alt: function () { toast(self, 'Alt text written for 5 photos, for example “Black 5G Smartphone Pro, front view”.'); } };
    var keep = function (k) { return function () { var a = assign({}, ai); delete a[k]; self.setState({ ai: a }); }; };
    var undo = function (k) { return function () { var a = assign({}, ai); delete a[k]; var p = assign({ ai: a }, prev[k] || {}); self.setState(p); }; };
    var aiSel = s.aiSel || { short: true, long: true, seo: true, tags: true, faq: false, alt: false };
    var price = f('price', ''), cost = f('cost', ''), mrp = f('mrp', '');
    var wsOn = s.wsOn !== false;   // an online-only shop: purchase price and sale price only
    var sell = wsOn ? f('sell', 'retail') : 'retail', sellsWs = sell !== 'retail', wholesale = f('wholesale', ''), moq = f('moq', '');
    var sku = f('sku', ''), barcode = f('barcode', ''), brand = f('brand', ''), variants = f('variants', []), opts = f('opts', []);
    var ownId = s.editId || '', savedList = s.savedList || [];
    var num = function (x) { return +(String(x).replace(/[^\d.]/g, '')) || 0; };
    var pr = num(price), co = num(cost), prof = pr - co, mr = num(mrp);
    var shift = s.basePrice != null && String(price).trim() ? pr - s.basePrice : 0; // a new selling price moves every variant by the same amount
    var cat = f('cat', ''), catOpen = !!s.catOpen;
    var sn = f('sn', 'imei'), imei = f('imei', '2'), wp = WP[f('wp', 'brand1y')] ? f('wp', 'brand1y') : 'brand1y', sg = SG[f('sg', 'none')] ? f('sg', 'none') : 'none';
    var hasW = mkSw(this, 'hasW', true);
    var shelfN = s.shelfN != null ? s.shelfN : '12', shelfU = s.shelfU || 'months';
    var wq = f('wq', 'yes'), sq = f('sq', 'yes'), snt = f('snt', 'imei2');
    var seg = function (opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); };
    var snLabel = sn === 'imei' ? 'IMEI numbers' : 'Serial numbers';
    var v = {
      assistOpen: !!s.assistOpen, assistBtn: s.assistOpen ? 'Hide' : 'Show', toggleAssist: function () { self.setState({ assistOpen: !s.assistOpen }); },
      facts: f('facts', '6.7 inch AMOLED, 5000 mAh, 50 MP camera, 1 year official warranty, PTA approved'), typeFacts: function (e) { self.setState({ facts: e.target.value }); },
      aiFields: AIF.map(function (x) { var on = !!aiSel[x[0]]; return { label: x[1], on: on, cls: on ? 'chip on' : 'chip', pick: function () { var o = assign({}, aiSel); o[x[0]] = !on; self.setState({ aiSel: o }); } }; }),
      aiCount: AIF.filter(function (x) { return aiSel[x[0]]; }).length,
      runAssist: function () { var p = {}, a = assign({}, ai), pv = assign({}, prev); var add = function (k, patch) { a[k] = true; pv[k] = {}; Object.keys(patch).forEach(function (x) { pv[k][x] = s[x]; p[x] = patch[x]; }); };
        if (aiSel.short) add('short', { short: AI_TXT.short }); if (aiSel.long) add('long', { long: AI_TXT.long }); if (aiSel.seo) add('seo', { seoT: AI_TXT.seoT, seoD: AI_TXT.seoD }); if (aiSel.tags) add('tags', { tags: ['5G', 'Samsung', 'AMOLED', '5000mAh', 'Official warranty', 'Android phone'] }); if (aiSel.faq) add('faq', { faqs: FAQ_AI });
        p.ai = a; p.prev = pv; p.assistOpen = false; self.setState(p); toast(self, 'AI filled ' + Object.keys(a).length + ' fields. Purple borders show what to check.'); },
      title: f('title', ''), typeTitle: function (e) { self.setState({ title: e.target.value }); },
      short: short, typeShort: function (e) { self.setState({ short: e.target.value }); }, shortCount: short.length + ' / 160', shortBorder: ai.short ? '#a78bfa' : '#cbd5e1',
      long: long, typeLong: function (e) { self.setState({ long: e.target.value }); }, longBorder: ai.long ? '#a78bfa' : '#cbd5e1',
      ai: { short: !!ai.short, long: !!ai.long, seo: !!ai.seo, faq: !!ai.faq },
      aiShort: gen.short, aiLong: gen.long, aiSeo: gen.seo, aiTags: gen.tags, aiFaq: gen.faq, aiAlt: gen.alt,
      aiImprove: function () { setAi('long', { long: (long || '').replace(/^Official/, 'An official') + ' Sharper wording, same facts.' }); },
      aiBangla: function () { setAi('long', { long: long + AI_TXT.bangla }); },
      keep_short: keep('short'), keep_long: keep('long'), keep_seo: keep('seo'), keep_faq: keep('faq'), undo_short: undo('short'), undo_long: undo('long'), undo_seo: undo('seo'), undo_faq: undo('faq'),
      price: price, typePrice: function (e) { self.setState({ price: e.target.value }); }, cost: cost, typeCost: function (e) { self.setState({ cost: e.target.value }); },
      mrp: mrp, typeMrp: function (e) { self.setState({ mrp: e.target.value }); }, priceReq: sell !== 'wholesale', wsOn: wsOn, costReq: !wsOn,
      sellOpts: seg(SELL_TO, sell, 'sell'), sellsWs: sellsWs, sellHelp: sell === 'retail' ? 'Sold one at a time at the selling price.' : sell === 'wholesale' ? 'Sold only in bulk, at the wholesale price, from the minimum order up.' : 'Sold at the selling price, and at the wholesale price from the minimum order up.',
      wholesale: wholesale, typeWholesale: function (e) { self.setState({ wholesale: e.target.value }); }, moq: moq, typeMoq: function (e) { self.setState({ moq: e.target.value }); },
      profit: pr && co ? bdt(prof) : '—', margin: pr && co ? Math.round(prof / pr * 100) + '%' : '—', profitColor: prof < 0 ? '#b83210' : '#047857', saves: mr > pr && pr > 0 ? bdt(mr - pr) + ' (' + Math.round((mr - pr) / mr * 100) + '%)' : '—',
      sku: sku, typeSku: function (e) { self.setState({ sku: e.target.value }); },
      barcode: barcode, typeBarcode: function (e) { self.setState({ barcode: e.target.value, barcodeType: barcodeTypeOf(e.target.value) }); },
      genBarcode: function () { var b, i = 0; do { b = inStoreCode(); i++; } while (codeOwner('barcode', b, ownId, savedList) && i < 50); self.setState({ barcode: b, barcodeType: 'internal' }); toast(self, 'New EAN-13 barcode made. It is unique in your shop.'); },
      // Inventory card: pre-order switch, opening stock per row and the live stock of this product there
      oversell: !!f('oversell', false), toggleOversell: function (e) { self.setState({ oversell: e.target.checked }); },
      open0: f('open0', '0'), typeOpen0: function (e) { self.setState({ open0: e.target.value }); },
      open1: f('open1', '0'), typeOpen1: function (e) { self.setState({ open1: e.target.value }); },
      stockHere: OPEN_PLACES.map(function (pl) {
        if (typeof window === 'undefined') return { avail: 0, held: 0 };
        var keys = variants.length ? variants.map(function (x) { return x.sku; }).filter(Boolean) : [sku || ownId].filter(Boolean);
        return keys.reduce(function (a, k) { var st = stockAt(k, pl); return { avail: a.avail + Math.max(0, st.available), held: a.held + st.held }; }, { avail: 0, held: 0 });
      }),
      track: mkSw(this, 'track', true), fragile: mkSw(this, 'fragile', true), snRecv: mkSw(this, 'snRecv', true), snSale: mkSw(this, 'snSale', true), hasW: hasW,
      expires: mkSw(this, 'expires', false),
      shelfN: shelfN, typeShelf: function (e) { self.setState({ shelfN: e.target.value }); }, shelfU: shelfU, setShelfU: function (e) { self.setState({ shelfU: e.target.value }); },
      shelfEx: 'Made today → good until ' + (function () { var d = new Date(Date.UTC(2026, 8, 19)); var n = +shelfN || 0; if (shelfU === 'days') d.setUTCDate(d.getUTCDate() + n); else if (shelfU === 'weeks') d.setUTCDate(d.getUTCDate() + n * 7); else if (shelfU === 'months') d.setUTCMonth(d.getUTCMonth() + n); else d.setUTCFullYear(d.getUTCFullYear() + n); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); })(),
      wqOpts: seg([['yes', 'Yes'], ['no', 'No']], wq, 'wq'), wYes: wq === 'yes', sqOpts: seg([['yes', 'Yes'], ['no', 'No']], sq, 'sq'), sYes: sq === 'yes',
      sntOpts: seg([['serial', 'Serial number'], ['imei1', '1 IMEI'], ['imei2', '2 IMEIs (dual SIM)']], snt, 'snt'), snCount: sq === 'yes' ? '38 IMEIs' : '—', wpStart: WPS[wp],
      wp: wp, setWp: function (e) { self.setState({ wp: e.target.value }); }, wpInfo: WP[wp].map(function (x) { return { k: x[0], v: x[1] }; }), wpText: WPT[wp],
      sg: sg, setSg: function (e) { self.setState({ sg: e.target.value }); }, hasSg: sg !== 'none', noSg: sg === 'none',
      sgHead: sg !== 'none' ? SG[sg][0].map(function (t) { return { t: t }; }) : [], sgRows: sg !== 'none' ? SG[sg][1].map(function (r) { return { c: r.map(function (t) { return { t: t }; }) }; }) : [],
      cfs: (CF[cat] || CF._).map(function (x) { return { l: x[0], type: '· ' + x[1], v: x[2] }; }),
      handle: ((brand ? brand + ' ' : '') + (f('title', '') || 'new product')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), seoTitle: seoT, seoDesc: seoD || 'Add a short description so people know what they will find.', typeSeoT: function (e) { self.setState({ seoT: e.target.value }); }, typeSeoD: function (e) { self.setState({ seoD: e.target.value }); }, seoTCount: seoT.length + ' of 70 letters',
      faqs: faqs.map(function (q) { return { q: q[0], a: q[1], cls: ai.faq ? 'fade' : '', border: ai.faq ? '#c4b5fd' : '#e6eaf0' }; }),
      status: f('status', 'active'), setStatus: function (e) { self.setState({ status: e.target.value }); }, isArchived: f('status', 'active') === 'archived' || (orig && orig.st === 'archived'), isDeleted: f('status', 'active') === 'deleted' || (orig && orig.st === 'deleted'),
      brand: brand, brands: BRANDS.indexOf(brand) >= 0 || !brand ? BRANDS : BRANDS.concat(brand), setBrand: function (e) { if (e.target.value === '__add') { toast(self, 'Add new brands in Catalog setup, then pick them here.'); return; } self.setState({ brand: e.target.value }); },
      catBadge: cat ? 'From “' + catPathOf(cat) + '”' : '',
      catPath: cat ? catPathOf(cat) : 'Pick a category', catOpen: catOpen, toggleCat: function () { self.setState({ catOpen: !catOpen }); },
      cats: CATS.map(function (c) { var on = c[0] === cat; return { name: c[0], n: c[2], pad: c[1] ? '28px' : '10px', fw: c[1] ? 400 : 600, bg: on ? 'rgba(0,48,135,.08)' : 'transparent', fg: on ? '#003087' : '#0f172a', pick: function () { self.setState({ cat: c[0], catOpen: false }); toast(self, 'Category set to ' + (PARENT[c[0]] ? PARENT[c[0]] + ' › ' : '') + c[0] + '. The extra fields changed to match.'); } }; }),
      tags: tags.map(function (t) { return { t: t, bg: ai.tags ? '#f3e8ff' : '#eef2f6', fg: ai.tags ? '#6d28d9' : '#334155', remove: function () { self.setState({ tags: tags.filter(function (x) { return x !== t; }) }); } }; }),
      checks: [['Title', !!String(f('title', '')).trim()], ['Photos (5)', true], ['Short description', !!short], ['Price and cost', (sell === 'wholesale' ? moneyNum(wholesale) > 0 : pr > 0) && co > 0], ['Category', !!cat], ['SKU and barcode', !!sku.trim() && !!barcode.trim()], ['Warranty', wq === 'yes'], ['SEO', !!seoD]].map(function (k) { return { l: k[0], bg: k[1] ? '#10b981' : '#cbd5e1', fg: k[1] ? '#0f172a' : '#94a3b8' }; })
    };

    // ---- validation, unsaved changes and save ----
    var errs = s.errors || {};
    // SKU and barcode must not belong to another product (list, stock catalogue or saved in this browser).
    var skuOwner = codeOwner('sku', sku, ownId, savedList), bcOwner = codeOwner('barcode', barcode, ownId, savedList);
    var dupSku = skuOwner ? 'This SKU is already used by “' + skuOwner.name + '”.' : '';
    var dupBc = bcOwner ? 'This barcode is already used by “' + bcOwner.name + '”.' : '';
    var setVar = function (i, k, val) {
      var list = variants.map(function (x, j) { if (j !== i) return x; var o = assign({}, x); o[k] = val; return o; });
      var p = { variants: list }, ek = (k === 'wholesale' ? 'vw' : 'vm') + i;
      if (errs[ek]) { var o = assign({}, errs); delete o[ek]; p.errors = o; }
      self.setState(p);
    };
    assign(v, {
      // Switching Sell to drops the wholesale errors: those fields may no longer apply.
      sellOpts: v.sellOpts.map(function (o, i) { return assign(o, { pick: function () { var e = {}; Object.keys(errs).forEach(function (k) { if (!/^(wholesale|moq|vw\d+|vm\d+|price)$/.test(k)) e[k] = errs[k]; }); self.setState({ sell: SELL_TO[i][0], errors: Object.keys(e).length ? e : null }); } }); }),
      skuErr: errs.sku || dupSku, barcodeErr: errs.barcode || dupBc,
      optRows: opts.map(function (o) { return { name: o.name, values: o.values }; }), hasOpts: opts.length > 0,
      hasVariants: variants.length > 0,
      wsPh: moneyNum(wholesale) ? String(moneyNum(wholesale)) : '', moqPh: wholeNum(moq) ? String(wholeNum(moq)) : '',
      varRows: variants.map(function (x, i) {
        var st = +x.stock || 0;
        return { key: (x.sku || x.name) + i, name: x.name, swatch: x.swatch || '#eef2f6', price: x.price != null && x.price !== '' ? bdt(+x.price + shift) : '—', stock: st, stockColor: st <= 3 ? '#a14f06' : '#0f172a',
          sku: x.sku || '—', barcode: x.barcode || '—', ws: x.wholesale == null ? '' : x.wholesale, moq: x.moq == null ? '' : x.moq, wsId: 'pf-vw' + i, moqId: 'pf-vm' + i,
          wsErr: errs['vw' + i] || '', moqErr: errs['vm' + i] || '',
          typeWs: function (e) { setVar(i, 'wholesale', e.target.value); }, typeMoq: function (e) { setVar(i, 'moq', e.target.value); } };
      })
    });
    var check = function (draft) {
      var e = {}, t = String(v.title).trim();
      if (!t) e.title = 'Enter a product title.'; else if (t.length > 120) e.title = 'Keep the title under 120 letters.';
      var pe = moneyError(price, !draft && sell !== 'wholesale', 'selling price'); if (pe) e.price = pe;
      var ce = moneyError(cost, !draft && !wsOn, 'buying price'); if (ce) e.cost = ce;
      if (sellsWs) {
        var we = wholesaleError(wholesale, !draft); if (we) e.wholesale = we;
        var me = moqError(moq, !draft); if (me) e.moq = me;
        variants.forEach(function (x, i) { var a = wholesaleError(x.wholesale, false), b = moqError(x.moq, false); if (a) e['vw' + i] = a; if (b) e['vm' + i] = b; });
      }
      if (dupSku) e.sku = dupSku;
      if (dupBc) e.barcode = dupBc;
      if (v.expires.on && !(/^\d+$/.test(String(shelfN).trim()) && +shelfN > 0)) e.shelf = 'Enter how long it stays good as a whole number above 0.';
      return e;
    };
    var clr = function (k, fn) { return function (ev) { fn(ev); if (errs[k]) { var o = assign({}, errs); delete o[k]; self.setState({ errors: o }); } }; };
    v.typeTitle = clr('title', v.typeTitle); v.typePrice = clr('price', v.typePrice); v.typeCost = clr('cost', v.typeCost); v.typeShelf = clr('shelf', v.typeShelf);
    v.typeSku = clr('sku', v.typeSku); v.typeBarcode = clr('barcode', v.typeBarcode); v.typeWholesale = clr('wholesale', v.typeWholesale); v.typeMoq = clr('moq', v.typeMoq);
    // The product as it is stored (src/lib/products.js). Values not on this form are kept from the original.
    var buildRecord = function (draft) {
      var o = orig || {}, status = f('status', 'active');
      var flags = (o.flags || []).filter(function (x) { return x !== 'No description'; });
      if (!String(short).trim() && !String(long).trim()) flags.push('No description');
      return assign(assign({}, o), {
        id: s.editId || newProductId(), name: String(v.title).trim(), sku: String(sku).trim(), barcode: String(barcode).trim(), cat: catPathOf(cat), brand: brand,
        st: draft || status === 'scheduled' ? 'draft' : status,
        price: moneyNum(price), cost: moneyNum(cost), mrp: moneyNum(mrp), sell: sell,
        oversell: !!f('oversell', false), barcodeType: String(barcode).trim() ? (s.barcodeType != null ? s.barcodeType : (o.barcodeType || '')) : '',
        wholesale: sellsWs ? moneyNum(wholesale) : null, moq: sellsWs ? wholeNum(moq) : null,
        opts: opts, variants: variants.map(function (x) { return assign(assign({}, x), { price: x.price != null && x.price !== '' ? +x.price + shift : null, wholesale: sellsWs ? moneyNum(x.wholesale) : null, moq: sellsWs ? wholeNum(x.moq) : null }); }),
        short: short, long: long, seoT: seoT, seoD: seoD, tags: tags, flags: flags, missing: flags.indexOf('No description') >= 0 || flags.indexOf('No photo') >= 0,
        inv: o.inv || 0, loc: o.loc || 0, tbg: o.tbg || '#eef2f6'
      });
    };
    var trySave = function (draft, okMsg) {
      var e = check(draft);
      var order = [].concat.apply([], FIELD_ORDER.map(function (k) { return k === 'variants' ? [].concat.apply([], variants.map(function (x, i) { return ['vw' + i, 'vm' + i]; })) : [k]; }));
      var first = order.filter(function (k) { return e[k]; })[0];
      if (first) {
        var p = { errors: e };
        self.setState(p, function () { var el = document.getElementById('pf-' + first); if (el) { el.focus(); if (el.scrollIntoView) el.scrollIntoView({ block: 'center' }); } });
        return;
      }
      var rec = saveProduct(buildRecord(draft)), pre = prefillFrom(rec);
      // opening stock typed in the Inventory card goes into stock once (the boxes go back to 0 after saving)
      var opening = OPEN_PLACES.map(function (pl, i) { return { place: isOnePlace() ? onlinePlace() : pl, qty: wholeNum(f('open' + i, '0')) || 0 }; }).filter(function (x) { return x.qty > 0; });
      if (opening.length && rec.variants && rec.variants.length) __toast('Opening stock for a product with variants is added per variant in Stock › Stock adjustments', { tone: 'info' });
      else opening.forEach(function (x) { addMove({ sku: rec.sku || rec.id, place: x.place, qty: x.qty, kind: 'opening', reason: 'Opening stock', by: 'Staff', ref: rec.id }); });
      // A new product becomes an edit of itself, so the next save updates it instead of adding another.
      window.history.replaceState(window.history.state, '', window.location.pathname + (rec.sku ? '?sku=' + encodeURIComponent(rec.sku) : '?id=' + encodeURIComponent(rec.id)));
      self.setState({ errors: null, editId: rec.id, orig: rec, basePrice: rec.price, variants: pre.variants, status: draft ? 'draft' : f('status', 'active'), savedList: getSavedProducts(), open0: '0', open1: '0' }, function () { self.markSaved(); toast(self, okMsg); });
    };
    var errCount = Object.keys(errs).length;
    assign(v, {
      editing: editing, heading: editing ? 'Edit product' : 'Add product',
      err: errs, hasErr: errCount > 0, errSummary: errCount === 1 ? '1 field needs fixing' : errCount + ' fields need fixing', dirty: !!s.dirty,
      submit: function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); trySave(false, editing ? 'Changes saved. All products shows the new details.' : 'Product saved and live on the online shop, POS and Facebook shop.'); },
      saveDraft: function () { trySave(true, 'Saved as a draft. Customers can’t see it yet.'); },
      discard: function () {
        __confirm({ title: 'Discard unsaved changes?', body: 'Every field goes back to how it was when you last saved.', confirmLabel: 'Discard changes', tone: 'danger' })
          .then(function (ok) { if (ok) { self.restore(); __toast('Changes discarded', { tone: 'info' }); } });
      },
      formInput: function () { self.checkDirty(); },
      // Enter in a single-line field must not save the whole product by accident.
      formKey: function (ev) { var t = ev.target; if (ev.key === 'Enter' && t && t.tagName === 'INPUT' && t.type !== 'checkbox' && t.type !== 'submit') ev.preventDefault(); }
    });
    this._snap = JSON.stringify([v.track.on, v.fragile.on, v.snRecv.on, v.snSale.on, v.hasW.on, v.expires.on, wq, sq, snt, cat, tags, faqs, sell]);
    return assign(v, msgV(s));
  }
}
// ---- styles ----
// Kit classes (design-system.css › Index kit, records and forms) do the layout; these are the form's own parts.
// .pcard / .psec style the Sales channels card (components/ProductChannels.jsx), which still uses those names.

const CSS = `
.ap-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ap-field>.gc-label,.ap-lbl .gc-label{margin:0}
.ap-lbl{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;min-height:24px}
.ap-lbl>.gc-label{flex:0 1 auto;min-width:0}
.ap-lbl>.ap-push{margin-left:auto}
.ap-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.ap-body{display:flex;flex-direction:column;gap:var(--space-4)}
.ap-req{color:var(--text-danger)}
.ap-err{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.ap-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ap-count{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ap-form .gc-input[aria-invalid="true"]{border-color:var(--text-danger)}
.ap-form textarea.gc-input{resize:vertical}
.ap-mono{font-family:var(--font-data)}
.ap-num{font-variant-numeric:tabular-nums}
.ap-sub{margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.ap-links{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);font-size:var(--text-xs-plus)}
.ap-links a{font-weight:var(--weight-medium)}
/* AI: quiet buttons, a purple edge on what AI wrote, and a "please check" row under it */
.ap-ai{color:var(--viz-7)}
.ap-ai-on{border-color:var(--viz-7)!important}
.ap-aicheck{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ap-aitag{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--viz-7) 10%,transparent);color:var(--viz-7);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ap-assist{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ap-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ap-row>.gc-input{width:auto;min-width:0}
.ap-grow{flex:1 1 auto}
/* long description: a small toolbar on top of the box */
.ap-rte{display:flex;flex-direction:column}
.ap-rte__bar{display:flex;gap:2px;padding:4px;border:1px solid var(--border-field);border-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0;background:var(--surface-subtle)}
.ap-rte__bar .ix-btn{color:var(--text-muted)}
.ap-rte textarea.gc-input{border-radius:0 0 var(--radius-lg) var(--radius-lg)}
/* media: the cover first, the rest beside it, then the drop target */
.ap-media{display:grid;grid-template-columns:2fr repeat(3,minmax(0,1fr));grid-auto-rows:88px;gap:var(--space-2)}
.ap-tile{display:flex;align-items:flex-end;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.ap-tile--cover{position:relative;grid-row:span 2;padding:var(--space-3);background:linear-gradient(135deg,var(--brand-navy-deep),var(--primary));color:#fff;font-size:var(--text-sm);font-weight:var(--weight-medium)}
.ap-tile--cover>small{position:absolute;top:8px;left:8px;padding:2px 6px;border-radius:var(--radius-md);background:rgba(255,255,255,.2);font-size:var(--text-xs)}
.ap-tile--info{background:var(--fill-info-soft)}.ap-tile--violet{background:var(--fill-secondary-soft)}.ap-tile--green{background:var(--fill-success-soft)}
.ap-drop{grid-column:span 2;display:flex;align-items:center;justify-content:center;gap:var(--space-2);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ap-drop:hover{background:var(--surface-subtle)}
/* profit, margin and saving under the prices */
.ap-figs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-fig{display:flex;flex-direction:column;gap:2px;min-width:0;padding:var(--space-2) var(--space-3);border-left:1px solid var(--border-subtle)}
.ap-fig:first-child{border-left:0}
.ap-fig>span{font-size:var(--text-xs);color:var(--text-muted)}
.ap-fig>b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-suffix{position:relative;display:block}
.ap-suffix>.gc-input{padding-right:64px}
.ap-suffix>span{position:absolute;top:0;right:12px;bottom:0;display:flex;align-items:center;font-size:var(--text-sm);color:var(--text-muted);pointer-events:none}
/* a setting with a switch, a yes / no question */
.ap-switch,.ap-q{display:flex;align-items:center;gap:var(--space-3)}
.ap-switch>span,.ap-q>span{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-panel{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ap-panel .gc-input:not(select){background:var(--surface-card)}
.ap-readonly{display:flex;align-items:center;background:var(--surface-subtle);color:var(--text-body)}
.ap-sep{height:1px;margin:0;border:0;background:var(--border-subtle)}
.ap-sncount{flex:none;text-align:right}
.ap-sncount>b{display:block;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-sncount>span{font-size:var(--text-xs);color:var(--text-muted)}
/* tables inside the form (variants, size guide) */
.ap-tbl .gc-input{height:28px;padding:0 8px;text-align:right}
.ap-tbl .ap-err{max-width:160px;margin-top:4px;white-space:normal}
.ap-tbl td{vertical-align:top}
.ap-swatch{display:inline-block;width:12px;height:12px;flex:none;border:1px solid var(--border-strong);border-radius:var(--radius-full)}
.ap-vname{display:flex;align-items:center;gap:var(--space-2)}
.ap-opt{display:flex;align-items:center;gap:var(--space-2);padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-opt>b{width:80px;flex:none;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-opt>span{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs)}
/* search engine preview */
.ap-serp{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-serp>small{font-size:var(--text-xs);color:var(--text-success);overflow-wrap:anywhere}
.ap-serp>b{font-size:var(--text-sm-plus);font-weight:var(--weight-medium);color:var(--text-link)}
.ap-serp>span{font-size:var(--text-xs-plus);color:var(--text-body)}
.ap-faq{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-faq>b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-faq>span{font-size:var(--text-xs-plus);color:var(--text-body)}
/* side column: category picker, tags, stock here, ready to sell */
.ap-pick{display:flex;align-items:center;gap:var(--space-2);height:auto;min-height:var(--control-height);padding:6px 10px;text-align:left;cursor:pointer}
.ap-pick>span{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.ap-pick>svg{flex:none;color:var(--text-muted)}
.ap-cats{display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.ap-cats>.gc-input{height:32px;margin-bottom:4px}
.ap-cats>button{display:flex;align-items:center;gap:var(--space-2);min-height:32px;padding-right:10px;border:0;border-radius:var(--radius-md);font:inherit;font-size:var(--text-xs-plus);text-align:left;cursor:pointer}
.ap-cats>button>span{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted)}
.ap-cats>a{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.ap-tags{display:flex;flex-wrap:wrap;gap:6px}
.ap-tag{display:inline-flex;align-items:center;gap:2px;height:24px;padding:0 2px 0 8px;border-radius:var(--radius-full);font-size:var(--text-xs-plus)}
.ap-tag>button{display:grid;place-items:center;width:20px;height:20px;border:0;border-radius:var(--radius-full);background:none;color:inherit;cursor:pointer}
.ap-tag>button:hover{background:var(--surface-quiet)}
.ap-stock{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ap-stock th{padding:0 0 6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:right}
.ap-stock th:first-child,.ap-stock td:first-child{text-align:left}
.ap-stock td{padding:6px 0;border-top:1px solid var(--border-subtle);text-align:right;font-variant-numeric:tabular-nums}
.ap-stock td+td,.ap-stock th+th{padding-left:var(--space-3)}
.ap-ready{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.ap-ready li{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.ap-ready i{display:grid;flex:none;place-items:center;width:16px;height:16px;border-radius:var(--radius-full);color:#fff}
.ap-side .pcard{border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card);padding:var(--space-3) var(--space-4) var(--space-4)!important}
.ap-side .psec{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
/* the save bar: shown while there is something to save or fix */
.savebar{position:sticky;bottom:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.savebar__note{display:flex;flex:1 1 160px;align-items:center;gap:var(--space-2);min-width:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body)}
.savebar__note.is-bad{color:var(--text-danger)}
.savebar__dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full);background:var(--fill-warning)}
@media (prefers-reduced-motion:no-preference){.ap-fade{animation:apFade 200ms ease-out}@keyframes apFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}}
@media (max-width:640px){
  .ap-grid2{grid-template-columns:minmax(0,1fr)}
  .ap-media{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:72px}
  .ap-tile--cover{grid-column:span 2}
  .ap-figs{grid-template-columns:minmax(0,1fr)}
  .ap-fig{flex-direction:row;justify-content:space-between;border-left:0;border-top:1px solid var(--border-subtle)}
  .ap-fig:first-child{border-top:0}
  .ap-q{flex-wrap:wrap}
  .ap-q>span{flex:1 1 100%}
  .ap-q>.gc-seg{width:100%}
  .ap-q>.gc-seg>.gc-seg__btn{flex:1 1 0}
  .savebar{padding:var(--space-2)}
  .savebar__note{flex:1 1 100%;font-size:var(--text-xs)}
  .savebar>.ix-btn{flex:1 1 auto}
}
`;

// ---- markup ----

// Shopify's product page (components/ui/IndexKit.jsx › RecordHeader): back to the list, the title, Save. The work
// (description, media, prices, stock, variants and the rest) is on the left; status, channels, organisation and the
// stock at each place are on the right. Every field, check and handler is the same as before.
const ST_BADGE = { active: ['success', 'Active'], draft: ['info', 'Draft'], archived: ['neutral', 'Archived'], deleted: ['error', 'Deleted'] };

function AiCheck({ onKeep, onUndo }) {
  return (
    <div className="ap-aicheck ap-fade">
      <span className="ap-aitag"><__Icon name="sparkles" width="12" height="12" aria-hidden="true" />AI wrote this — please check</span>
      <button type="button" className="ix-btn ix-btn--sm" onClick={onKeep}>Looks good</button>
      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={onUndo}>Undo</button>
    </div>
  );
}

function AiBtn({ onClick, children }) {
  return <button type="button" className="ix-btn ix-btn--sm ix-btn--plain ap-ai" onClick={onClick}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" />{children}</button>;
}

function Switch({ sw, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!(sw && sw.on)} aria-label={label} className="gc-switch" onClick={sw && sw.toggle}><span className="gc-switch__knob" /></button>
  );
}

function Seg({ opts, label, labelledBy }) {
  return (
    <div className="gc-seg" role="group" aria-label={label} aria-labelledby={labelledBy}>
      {__list(opts).map((o, i) => (
        <button key={i} type="button" className={'gc-seg__btn' + (o.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!o.on} onClick={o.pick}>{o.l}</button>
      ))}
    </div>
  );
}

function Err({ id, text }) {
  return text ? <span id={id} className="ap-err" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{text}</span> : null;
}

export default class AddProductScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const s = this.state || {};
    const saved = s.orig && s.orig.st ? ST_BADGE[s.orig.st] : null;
    const title = v.editing && s.orig && s.orig.name ? s.orig.name : v.heading;
    return (
      <div className="dc-screen ds" data-screen="AddProduct">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active={v.editing ? "products-all" : "products-add"} />
          <main className="gc-shell__main">
            <__Topbar crumb="Products / All products" page={v.heading} placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader back="/all-products" title={title}
                  badges={v.editing && saved ? <__StatusBadge tone={saved[0]} icon="circle">{saved[1]}</__StatusBadge> : null}
                  about="Connected to Purchase, Stock and POS — you never enter stock twice."
                  secondary={[{ label: 'Save as draft', onClick: v.saveDraft }]}
                  primary={{ label: 'Save product', onClick: v.submit }} />

                <form id="product-form" className="ix-record ap-form" noValidate aria-label={v.heading} onSubmit={v.submit} onInput={v.formInput} onChange={v.formInput} onKeyDown={v.formKey}>
                  <div className="ix-main">
                    {/* ---- title and description, with the AI writing assistant folded into the card ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-desc">
                      <div className="ix-card__head">
                        <h2 id="ap-h-desc">Title and description</h2>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain ap-ai" onClick={v.toggleAssist} aria-expanded={v.assistOpen} aria-controls={v.assistOpen ? "ai-assist-panel" : undefined} aria-label={`${v.assistBtn ?? ""} the AI writing assistant`}>
                          <__Icon name="sparkles" width="16" height="16" aria-hidden="true" />AI writing assistant<__Icon name={v.assistOpen ? "chevron-up" : "chevron-down"} width="14" height="14" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="ix-card__body ap-body">
                        {v.assistOpen ? (
                          <div id="ai-assist-panel" data-nodirty="" className="ap-assist ap-fade">
                            <p className="ap-help">You check every word before saving.</p>
                            <label className="ap-field">
                              <span className="gc-label">Key facts about the product</span>
                              <input className="gc-input" value={v.facts} onInput={v.typeFacts} onChange={v.typeFacts} aria-label="Key facts" />
                            </label>
                            <div className="ix-chips" style={{ alignItems: "center" }}>
                              <span className="ap-sub">Fill these:</span>
                              {__list(v.aiFields).map((c, i) => (
                                <button key={i} type="button" className="ix-chip" aria-pressed={!!c.on} onClick={c.pick}>{c.on ? <__Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{c.label}</button>
                              ))}
                            </div>
                            <div className="ap-row">
                              <select className="gc-input gc-select" aria-label="Language">
                                <option>English</option>
                                <option>বাংলা</option>
                                <option>English + বাংলা</option>
                              </select>
                              <select className="gc-input gc-select" aria-label="Tone">
                                <option>Premium</option>
                                <option>Friendly</option>
                                <option>Simple and short</option>
                              </select>
                              <span className="ap-grow" />
                              <button type="button" className="ix-btn ix-btn--primary" onClick={v.runAssist}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span>Write {v.aiCount} fields</span></button>
                            </div>
                          </div>
                        ) : null}
                        <div className="ap-field">
                          <label className="gc-label" htmlFor="pf-title">Title <span className="ap-req" aria-hidden="true">*</span></label>
                          <input className="gc-input" value={v.title} onInput={v.typeTitle} onChange={v.typeTitle} aria-label="Title" id="pf-title" aria-required="true" aria-invalid={v.err?.title ? "true" : undefined} aria-describedby={v.err?.title ? "pf-title-err" : undefined} />
                          <Err id="pf-title-err" text={v.err?.title} />
                        </div>
                        <div className="ap-field">
                          <div className="ap-lbl">
                            <label className="gc-label" htmlFor="pf-short">Short description</label>
                            <__InfoTip text="Shown next to the price and in search results. One or two lines." />
                            <span className="ap-count ap-push">{v.shortCount}</span>
                            <AiBtn onClick={v.aiShort}>Write with AI</AiBtn>
                          </div>
                          <textarea id="pf-short" className={'gc-input' + (v.ai?.short ? ' ap-ai-on' : '')} rows="2" value={v.short} onInput={v.typeShort} onChange={v.typeShort} aria-label="Short description" />
                          {v.ai?.short ? <AiCheck onKeep={v.keep_short} onUndo={v.undo_short} /> : null}
                        </div>
                        <div className="ap-field">
                          <div className="ap-lbl">
                            <label className="gc-label" htmlFor="pf-long">Long description</label>
                            <span className="ap-push" />
                            <AiBtn onClick={v.aiLong}>Write with AI</AiBtn>
                            <AiBtn onClick={v.aiImprove}>Improve</AiBtn>
                            <AiBtn onClick={v.aiBangla}>Add Bangla</AiBtn>
                          </div>
                          <div className="ap-rte">
                            <div className="ap-rte__bar">
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Bold"><__Icon name="bold" width="16" height="16" aria-hidden="true" /></button>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Italic"><__Icon name="italic" width="16" height="16" aria-hidden="true" /></button>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="List"><__Icon name="list" width="16" height="16" aria-hidden="true" /></button>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Link"><__Icon name="link" width="16" height="16" aria-hidden="true" /></button>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Picture"><__Icon name="image" width="16" height="16" aria-hidden="true" /></button>
                            </div>
                            <textarea id="pf-long" className={'gc-input' + (v.ai?.long ? ' ap-ai-on' : '')} rows="7" value={v.long} onInput={v.typeLong} onChange={v.typeLong} aria-label="Long description" style={{ fontFamily: "var(--font-sans), var(--font-bn)" }} />
                          </div>
                          {v.ai?.long ? <AiCheck onKeep={v.keep_long} onUndo={v.undo_long} /> : null}
                        </div>
                      </div>
                    </section>

                    {/* ---- media ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-media">
                      <div className="ix-card__head">
                        <h2 id="ap-h-media">Media <__InfoTip text="Drag to reorder. The first photo is the cover." /></h2>
                        <AiBtn onClick={v.aiAlt}>Alt text with AI</AiBtn>
                      </div>
                      <div className="ix-card__body">
                        <div className="ap-media">
                          <div className="ap-tile ap-tile--cover"><small>COVER</small>Front · main photo</div>
                          <div className="ap-tile ap-tile--info">Back</div>
                          <div className="ap-tile">Side</div>
                          <div className="ap-tile ap-tile--violet">Box</div>
                          <div className="ap-tile ap-tile--green">In hand</div>
                          <button type="button" className="ap-drop"><__Icon name="upload" width="16" height="16" aria-hidden="true" />Add photos or a video</button>
                        </div>
                      </div>
                    </section>

                    {/* ---- pricing ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-price">
                      <div className="ix-card__head"><h2 id="ap-h-price">Pricing</h2></div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-grid2">
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-price">Selling price {v.priceReq ? <span className="ap-req" aria-hidden="true">*</span> : null}</label>
                            <input className="gc-input ap-num" inputMode="decimal" placeholder="৳0" value={v.price} onInput={v.typePrice} onChange={v.typePrice} aria-label="Selling price" id="pf-price" aria-required={v.priceReq ? "true" : undefined} aria-invalid={v.err?.price ? "true" : undefined} aria-describedby={v.err?.price ? "pf-price-err" : undefined} />
                            <Err id="pf-price-err" text={v.err?.price} />
                          </div>
                          <div className="ap-field">
                            <div className="ap-lbl"><label className="gc-label" htmlFor="pf-mrp">{v.wsOn ? 'MRP (compare-at price)' : 'Compare-at price (optional)'}</label><__InfoTip text="Shown crossed out" /></div>
                            <input id="pf-mrp" className="gc-input ap-num" inputMode="decimal" placeholder="৳0" value={v.mrp} onInput={v.typeMrp} onChange={v.typeMrp} aria-label="MRP" />
                          </div>
                          <div className="ap-field">
                            <div className="ap-lbl"><label className="gc-label" htmlFor="pf-cost">Buying price (cost) {v.costReq ? <span className="ap-req" aria-hidden="true">*</span> : null}</label><__InfoTip text="Customers never see this" /></div>
                            <input className="gc-input ap-num" inputMode="decimal" placeholder="৳0" value={v.cost} onInput={v.typeCost} onChange={v.typeCost} aria-label="Buying price" id="pf-cost" aria-invalid={v.err?.cost ? "true" : undefined} aria-describedby={v.err?.cost ? "pf-cost-err" : undefined} />
                            <Err id="pf-cost-err" text={v.err?.cost} />
                          </div>
                          <label className="ap-field">
                            <span className="gc-label">VAT / tax</span>
                            <select className="gc-input gc-select" aria-label="Tax rate">
                              <option>Standard VAT 15%</option>
                              <option>Reduced 7.5%</option>
                              <option>No VAT</option>
                            </select>
                          </label>
                        </div>
                        <div className="ap-figs">
                          <div className="ap-fig"><span>Profit per piece</span><b style={{ color: v.profitColor }}>{v.profit}</b></div>
                          <div className="ap-fig"><span>Margin</span><b style={{ color: v.profitColor }}>{v.margin}</b></div>
                          <div className="ap-fig"><span>Customer saves</span><b>{v.saves}</b></div>
                        </div>
                        {v.wsOn ? (
                          <div className="ap-field">
                            <div className="ap-lbl"><span className="gc-label" id="pf-sell-label">Sell to</span><__InfoTip text={v.sellHelp} /></div>
                            <Seg opts={v.sellOpts} labelledBy="pf-sell-label" />
                          </div>
                        ) : null}
                        {v.sellsWs ? (
                          <div className="ap-grid2">
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-wholesale">Wholesale price (৳) <span className="ap-req" aria-hidden="true">*</span></label><__InfoTip text="Price per piece for bulk buyers" /></div>
                              <input className="gc-input ap-num" type="number" inputMode="decimal" min="0" step="1" placeholder="0" value={v.wholesale} onInput={v.typeWholesale} onChange={v.typeWholesale} aria-label="Wholesale price" id="pf-wholesale" aria-required="true" aria-invalid={v.err?.wholesale ? "true" : undefined} aria-describedby={v.err?.wholesale ? "pf-wholesale-err" : undefined} />
                              <Err id="pf-wholesale-err" text={v.err?.wholesale} />
                            </div>
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-moq">Minimum order (MOQ) <span className="ap-req" aria-hidden="true">*</span></label><__InfoTip text="Wholesale price starts from this many" /></div>
                              <span className="ap-suffix">
                                <input className="gc-input ap-num" type="number" inputMode="numeric" min="1" step="1" placeholder="1" value={v.moq} onInput={v.typeMoq} onChange={v.typeMoq} aria-label="Wholesale minimum order in pieces" id="pf-moq" aria-required="true" aria-invalid={v.err?.moq ? "true" : undefined} aria-describedby={v.err?.moq ? "pf-moq-err" : undefined} />
                                <span aria-hidden="true">pieces</span>
                              </span>
                              <Err id="pf-moq-err" text={v.err?.moq} />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {/* ---- inventory: codes, tracking, opening stock (posted once on save), pre-order ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-inv">
                      <div className="ix-card__head">
                        <h2 id="ap-h-inv">Inventory</h2>
                        <__Link href="/stock">Stock history</__Link>
                      </div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-grid2">
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-sku">SKU</label>
                            <input className="gc-input ap-mono" placeholder="For example PH-5GP-256" value={v.sku} onInput={v.typeSku} onChange={v.typeSku} aria-label="SKU" id="pf-sku" aria-invalid={v.skuErr ? "true" : undefined} aria-describedby={v.skuErr ? "pf-sku-err" : undefined} />
                            <Err id="pf-sku-err" text={v.skuErr} />
                          </div>
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="pf-barcode">Barcode (EAN-13)</label>
                            <div className="ap-row" style={{ flexWrap: "nowrap" }}>
                              <input className="gc-input ap-mono ap-grow" placeholder="13 digits" value={v.barcode} onInput={v.typeBarcode} onChange={v.typeBarcode} aria-label="Barcode" id="pf-barcode" aria-invalid={v.barcodeErr ? "true" : undefined} aria-describedby={v.barcodeErr ? "pf-barcode-err" : undefined} />
                              <button type="button" className="ix-btn" onClick={v.genBarcode}><__Icon name="hash" width="16" height="16" aria-hidden="true" />Make one</button>
                              <__Link href="/barcode-labels" className="ix-btn ix-btn--icon" aria-label="Label" title="Label"><__Icon name="printer" width="16" height="16" aria-hidden="true" /></__Link>
                            </div>
                            <Err id="pf-barcode-err" text={v.barcodeErr} />
                          </div>
                        </div>
                        <div className="ap-switch">
                          <span>Track stock for this product<__InfoTip text="Stock goes up with purchase orders and returns, down with sales and damage" /></span>
                          <Switch sw={v.track} label="Track stock for this product" />
                        </div>
                        <div className="ap-field">
                          <span className="ap-sub">Opening stock</span>
                          <div className="ap-grid2">
                            <label className="ap-field">
                              <span className="gc-label">Central Warehouse</span>
                              <input className="gc-input ap-num" value={v.open0} onChange={v.typeOpen0} inputMode="numeric" aria-label="Opening stock Central Warehouse" />
                            </label>
                            <label className="ap-field">
                              <span className="gc-label">Dhanmondi branch</span>
                              <input className="gc-input ap-num" value={v.open1} onChange={v.typeOpen1} inputMode="numeric" aria-label="Opening stock Dhanmondi branch" />
                            </label>
                          </div>
                        </div>
                        <div className="ap-row">
                          <span className="ap-help" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>Alert me when stock is below</span>
                          <input className="gc-input ap-num" defaultValue="5" aria-label="Low stock alert" style={{ width: "72px" }} />
                        </div>
                        <label className="ap-row" style={{ fontSize: "var(--text-sm)", color: "var(--text-heading)", cursor: "pointer" }}>
                          <input type="checkbox" className="gc-check" checked={!!v.oversell} onChange={v.toggleOversell} />Keep selling when out of stock (pre-order)
                        </label>
                      </div>
                    </section>

                    {/* ---- variants ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-var">
                      <div className="ix-card__head">
                        <h2 id="ap-h-var">Variants <__InfoTip text="Colour, size, storage… each variant keeps its own price, stock and barcode." /></h2>
                        <button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add option</button>
                      </div>
                      <div className="ix-card__body ap-body">
                        {v.hasOpts ? (
                          <div className="ap-body" style={{ gap: "var(--space-2)" }}>
                            {__list(v.optRows).map((o, i) => (
                              <div key={i} className="ap-opt">
                                <__Icon name="grip-vertical" width="16" height="16" aria-hidden="true" style={{ color: "var(--text-muted)", flex: "none" }} />
                                <b>{o.name}</b>
                                {__list(o.values).map((val) => <span key={val}>{val}</span>)}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {v.hasVariants ? (
                          <div className="ix-table-wrap ix-table-wrap--show">
                            <table className="ix-table ix-table--static ap-tbl gc-table--keep">
                              <thead>
                                <tr>
                                  <th scope="col">Variant</th>
                                  <th scope="col" className="ix-num">Price</th>
                                  <th scope="col" className="ix-num">Stock</th>
                                  <th scope="col">SKU</th>
                                  <th scope="col">Barcode</th>
                                  {v.wsOn ? <th scope="col">Wholesale price</th> : null}
                                  {v.wsOn ? <th scope="col">MOQ</th> : null}
                                </tr>
                              </thead>
                              <tbody>
                                {__list(v.varRows).map((r) => (
                                  <tr key={r.key}>
                                    <td><span className="ap-vname"><span className="ap-swatch" style={{ background: r.swatch }} />{r.name}</span></td>
                                    <td className="ix-num">{r.price}</td>
                                    <td className="ix-num" style={{ color: r.stockColor, fontWeight: "var(--weight-medium)" }}>{r.stock}</td>
                                    <td className="ap-mono ix-muted">{r.sku}</td>
                                    <td className="ap-mono ix-muted">{r.barcode}</td>
                                    {v.sellsWs ? (<>
                                      <td>
                                        <input className="gc-input ap-num" type="number" inputMode="decimal" min="0" step="1" value={r.ws} placeholder={v.wsPh} onInput={r.typeWs} onChange={r.typeWs} id={r.wsId} aria-label={`Wholesale price for ${r.name ?? ""}`} aria-invalid={r.wsErr ? "true" : undefined} aria-describedby={r.wsErr ? `${r.wsId}-err` : undefined} style={{ width: "104px" }} />
                                        <Err id={`${r.wsId}-err`} text={r.wsErr} />
                                      </td>
                                      <td>
                                        <input className="gc-input ap-num" type="number" inputMode="numeric" min="1" step="1" value={r.moq} placeholder={v.moqPh} onInput={r.typeMoq} onChange={r.typeMoq} id={r.moqId} aria-label={`Minimum order in pieces for ${r.name ?? ""}`} aria-invalid={r.moqErr ? "true" : undefined} aria-describedby={r.moqErr ? `${r.moqId}-err` : undefined} style={{ width: "72px" }} />
                                        <Err id={`${r.moqId}-err`} text={r.moqErr} />
                                      </td>
                                    </>) : v.wsOn ? (<>
                                      <td className="ix-muted">—</td>
                                      <td className="ix-muted">—</td>
                                    </>) : null}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="ap-help">No variants. This product is sold as one item with the SKU, barcode and prices above.</p>
                        )}
                        {v.hasVariants ? <p className="ap-help">{v.sellsWs ? "Leave a variant’s wholesale price or MOQ empty to use the product’s own (shown in grey)." : "Wholesale price and MOQ per variant open when Sell to is Wholesale or Both."}</p> : null}
                      </div>
                    </section>

                    {/* ---- expiry ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-exp">
                      <div className="ix-card__head"><h2 id="ap-h-exp">Product validity (expiry)</h2></div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-switch">
                          <span>This product expires<__InfoTip text="Turn on for food, medicine, cosmetics — anything with a best-before date" /></span>
                          <Switch sw={v.expires} label="This product expires" />
                        </div>
                        {v.expires?.on ? (
                          <div className="ap-panel ap-fade">
                            <div className="ap-row">
                              <span style={{ fontSize: "var(--text-sm)" }}>It stays good for</span>
                              <input className="gc-input ap-num" inputMode="numeric" value={v.shelfN} onInput={v.typeShelf} onChange={v.typeShelf} aria-label="Shelf life" id="pf-shelf" aria-required="true" aria-invalid={v.err?.shelf ? "true" : undefined} aria-describedby={v.err?.shelf ? "pf-shelf-err" : undefined} style={{ width: "72px", textAlign: "center" }} />
                              <select className="gc-input gc-select" value={v.shelfU} onChange={v.setShelfU} aria-label="Shelf life unit" style={{ width: "120px" }}>
                                <option value="days">days</option>
                                <option value="weeks">weeks</option>
                                <option value="months">months</option>
                                <option value="years">years</option>
                              </select>
                              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--primary)" }}>{v.shelfEx}</span>
                            </div>
                            <Err id="pf-shelf-err" text={v.err?.shelf} />
                            <div className="ap-grid2">
                              <div className="ap-field">
                                <div className="ap-lbl"><label className="gc-label" htmlFor="pf-stopsell">Stop selling</label><__InfoTip text="Hidden from the website and blocked at POS" /></div>
                                <select id="pf-stopsell" className="gc-input gc-select" aria-label="Stop selling">
                                  <option>3 days before expiry</option>
                                  <option>On the expiry date</option>
                                  <option>7 days before expiry</option>
                                </select>
                              </div>
                              <div className="ap-field">
                                <div className="ap-lbl"><label className="gc-label" htmlFor="pf-warn">Warn me</label><__InfoTip text={"Shows in Stock › Expiry & disposal"} /></div>
                                <select id="pf-warn" className="gc-input gc-select" aria-label="Warn before">
                                  <option>14 days before expiry</option>
                                  <option>7 days before</option>
                                  <option>30 days before</option>
                                </select>
                              </div>
                            </div>
                            <p className="ap-help">Batch dates are entered when stock arrives in Purchase. Expired stock moves to <__Link href="/expiry-disposal">{"Expiry & disposal"}</__Link>.</p>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {/* ---- warranty and serial numbers ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-war">
                      <div className="ix-card__head"><h2 id="ap-h-war">Warranty and serial numbers</h2></div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-q">
                          <span id="ap-q-war">Does this product come with a warranty?</span>
                          <Seg opts={v.wqOpts} labelledBy="ap-q-war" />
                        </div>
                        {v.wYes ? (
                          <div className="ap-panel ap-fade">
                            <div className="ap-grid2">
                              <div className="ap-field">
                                <div className="ap-lbl"><label className="gc-label" htmlFor="pf-wp">Warranty policy</label><__InfoTip text="Written once in Stock › Warranty policies" /></div>
                                <select id="pf-wp" className="gc-input gc-select" value={v.wp} onChange={v.setWp} aria-label="Warranty policy">
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
                              <textarea id="pf-wtext" className="gc-input" rows="3" aria-label="Warranty description" defaultValue={`${v.wpText ?? ""}`} />
                            </div>
                            <div className="ap-links">
                              <__Link href="/warranty-policies">Open warranty policies</__Link>
                              <span className="ix-muted">Printed on the invoice and warranty card</span>
                            </div>
                          </div>
                        ) : null}
                        <hr className="ap-sep" />
                        <div className="ap-q">
                          <span id="ap-q-sn">Does each piece have its own serial or IMEI number?<__InfoTip text="Phones, laptops, TVs — so you know exactly which piece was sold" /></span>
                          <Seg opts={v.sqOpts} labelledBy="ap-q-sn" />
                        </div>
                        {v.sYes ? (
                          <div className="ap-panel ap-fade">
                            <div className="ap-row">
                              <span className="gc-label" id="ap-snt" style={{ margin: 0 }}>Which number?</span>
                              <Seg opts={v.sntOpts} labelledBy="ap-snt" />
                            </div>
                            <div className="ap-row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                              <div className="ap-grow" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <p className="ap-help" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>You do not type the numbers here. Staff scan them in <b>Stock</b> when goods arrive, and the POS asks for the number at sale.</p>
                                <div className="ap-links">
                                  <__Link href="/receive-goods">Receive goods</__Link>
                                  <__Link href="/warranty-claims">Serial number register</__Link>
                                </div>
                              </div>
                              <span className="ap-sncount"><b>{v.snCount}</b><span>in stock now</span></span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {/* ---- size guide ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-sg">
                      <div className="ix-card__head">
                        <h2 id="ap-h-sg">Size guide {v.noSg ? <__InfoTip text="Not needed for phones. Clothing and shoes should have one — it cuts returns." /> : null}</h2>
                        <__Link href="/catalog-setup">Make a size chart</__Link>
                      </div>
                      <div className="ix-card__body ap-body">
                        <select className="gc-input gc-select" value={v.sg} onChange={v.setSg} aria-label="Size guide" style={{ maxWidth: "360px" }}>
                          <option value="none">No size guide</option>
                          <option value="shirt">Men’s shirts and polos</option>
                          <option value="kurti">Women’s kurti</option>
                          <option value="shoe">Shoes (BD / EU / UK)</option>
                        </select>
                        {v.hasSg ? (
                          <div className="ix-table-wrap ix-table-wrap--show ap-fade">
                            <table className="ix-table ix-table--static ap-tbl gc-table--keep">
                              <thead><tr>{__list(v.sgHead).map((h, i) => <th key={i} scope="col">{h.t}</th>)}</tr></thead>
                              <tbody>
                                {__list(v.sgRows).map((r, i) => (
                                  <tr key={i}>{__list(r.c).map((cc, j) => <td key={j} className="ap-num">{cc.t}</td>)}</tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {/* ---- category fields ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-more">
                      <div className="ix-card__head">
                        <h2 id="ap-h-more">More details <__InfoTip text="These fields come from the category. Change the category and the fields change with it." /></h2>
                        <__Link href="/catalog-setup">Manage custom fields</__Link>
                      </div>
                      <div className="ix-card__body ap-body">
                        {v.catBadge ? <span><__StatusBadge tone="info" icon="folder">{v.catBadge}</__StatusBadge></span> : null}
                        <div className="ap-grid2">
                          {__list(v.cfs).map((f, i) => (
                            <label key={i} className="ap-field">
                              <span className="gc-label">{f.l} <span className="ix-muted" style={{ fontWeight: "var(--weight-regular)" }}>{f.type}</span></span>
                              <input className="gc-input" defaultValue={f.v} aria-label={f.l} />
                            </label>
                          ))}
                        </div>
                        <div><button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a field just for this product</button></div>
                      </div>
                    </section>

                    {/* ---- shipping ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-ship">
                      <div className="ix-card__head"><h2 id="ap-h-ship">Shipping</h2></div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-grid2">
                          <label className="ap-field"><span className="gc-label">Weight</span><input className="gc-input ap-num" defaultValue="0.45 kg" aria-label="Weight" /></label>
                          <label className="ap-field"><span className="gc-label">Length</span><input className="gc-input ap-num" defaultValue="18 cm" aria-label="Length" /></label>
                          <label className="ap-field"><span className="gc-label">Width</span><input className="gc-input ap-num" defaultValue="10 cm" aria-label="Width" /></label>
                          <label className="ap-field"><span className="gc-label">Height</span><input className="gc-input ap-num" defaultValue="6 cm" aria-label="Height" /></label>
                        </div>
                        <div className="ap-switch">
                          <span>Fragile — handle with care<__InfoTip text="Printed on the courier label" /></span>
                          <Switch sw={v.fragile} label="Fragile — handle with care" />
                        </div>
                      </div>
                    </section>

                    {/* ---- search engine listing ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-seo">
                      <div className="ix-card__head">
                        <h2 id="ap-h-seo">Search engine listing</h2>
                        <AiBtn onClick={v.aiSeo}>Write with AI</AiBtn>
                      </div>
                      <div className="ix-card__body ap-body">
                        <div className="ap-serp">
                          <small>gridshop.com.bd › products › {v.handle}</small>
                          <b>{v.seoTitle}</b>
                          <span>{v.seoDesc}</span>
                        </div>
                        <div className="ap-field">
                          <div className="ap-lbl"><label className="gc-label" htmlFor="pf-seot">Page title</label><span className="ap-count ap-push">{v.seoTCount}</span></div>
                          <input id="pf-seot" className={'gc-input' + (v.ai?.seo ? ' ap-ai-on' : '')} value={v.seoTitle} onInput={v.typeSeoT} onChange={v.typeSeoT} aria-label="Page title" />
                        </div>
                        <div className="ap-field">
                          <label className="gc-label" htmlFor="pf-seod">Meta description</label>
                          <textarea id="pf-seod" className={'gc-input' + (v.ai?.seo ? ' ap-ai-on' : '')} rows="2" value={v.seoDesc} onInput={v.typeSeoD} onChange={v.typeSeoD} aria-label="Meta description" />
                        </div>
                        {v.ai?.seo ? <AiCheck onKeep={v.keep_seo} onUndo={v.undo_seo} /> : null}
                      </div>
                    </section>

                    {/* ---- product FAQ ---- */}
                    <section className="ix-card" aria-labelledby="ap-h-faq">
                      <div className="ix-card__head">
                        <h2 id="ap-h-faq">Product FAQ <__InfoTip text="Shown on the product page. Answers the questions customers ask most." /></h2>
                        <AiBtn onClick={v.aiFaq}>Suggest with AI</AiBtn>
                      </div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-2)" }}>
                        {__list(v.faqs).map((q, i) => (
                          <div key={i} className={'ap-faq ' + (q.cls ? 'ap-fade' : '')} style={{ borderColor: v.ai?.faq ? 'var(--viz-7)' : undefined }}>
                            <b>{q.q}</b>
                            <span>{q.a}</span>
                          </div>
                        ))}
                        {v.ai?.faq ? <AiCheck onKeep={v.keep_faq} onUndo={v.undo_faq} /> : null}
                        <div><button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a question</button></div>
                      </div>
                    </section>

                    {/* ---- the save bar, while there is something to save or fix ---- */}
                    {v.dirty || v.hasErr ? (
                      <div className="savebar" role="group" aria-label="Save product">
                        <span className={'savebar__note' + (v.hasErr ? ' is-bad' : '')} role="status">
                          {v.hasErr ? (<><__Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />{v.errSummary}</>) : (<><span className="savebar__dot" aria-hidden="true" />Unsaved changes</>)}
                        </span>
                        {v.dirty ? <button type="button" className="ix-btn" onClick={v.discard}>Discard</button> : <__Link href="/all-products" className="ix-btn">Cancel</__Link>}
                        <button type="submit" className="ix-btn ix-btn--primary"><__Icon name="check" width="16" height="16" aria-hidden="true" /><span>Save product</span></button>
                      </div>
                    ) : null}
                  </div>

                  <aside className="ix-side ap-side">
                    <section className="ix-card" aria-labelledby="ap-h-status">
                      <div className="ix-card__head"><h2 id="ap-h-status">Status</h2></div>
                      <div className="ix-card__body">
                        <select className="gc-input gc-select" value={v.status} onChange={v.setStatus} aria-label="Status">
                          <option value="active">Active — customers can buy</option>
                          <option value="draft">Draft — hidden</option>
                          <option value="scheduled">Go live on a date</option>
                          {v.isArchived ? (<option value="archived">Archived — hidden, kept for records</option>) : null}
                          {v.isDeleted ? (<option value="deleted">Deleted — restore by picking another status</option>) : null}
                        </select>
                      </div>
                    </section>

                    {/* where it is sold and how it is doing there (online store, POS, Meta, Google) */}
                    <ProductChannels draft={v.status !== 'active'} />

                    <section className="ix-card" aria-labelledby="ap-h-org">
                      <div className="ix-card__head"><h2 id="ap-h-org">Organisation</h2></div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-3)" }}>
                        <div className="ap-field">
                          <div className="ap-lbl"><span className="gc-label">Category</span><__InfoTip text="Sets the tax, the extra fields and where it shows in your shop menu." /></div>
                          <button type="button" onClick={v.toggleCat} aria-expanded={v.catOpen} aria-label={`Category: ${v.catPath ?? ""}`} className="gc-input ap-pick">
                            <__Icon name="folder" width="16" height="16" aria-hidden="true" />
                            <span>{v.catPath}</span>
                            <__Icon name="chevron-down" width="16" height="16" aria-hidden="true" />
                          </button>
                          {v.catOpen ? (
                            <div className="ap-cats ap-fade">
                              <input className="gc-input" placeholder="Search categories" aria-label="Search categories" data-nodirty="" />
                              {__list(v.cats).map((ct, i) => (
                                <button key={i} type="button" onClick={ct.pick} style={{ paddingLeft: ct.pad, background: ct.bg, color: ct.fg, fontWeight: ct.fw === 600 ? "var(--weight-semibold)" : "var(--weight-regular)" }}>{ct.name}<span>{ct.n}</span></button>
                              ))}
                              <__Link href="/categories"><__Icon name="plus" width="14" height="14" aria-hidden="true" />New category</__Link>
                            </div>
                          ) : null}
                        </div>
                        <label className="ap-field">
                          <span className="gc-label">Brand</span>
                          <select className="gc-input gc-select" aria-label="Brand" value={v.brand} onChange={v.setBrand}>
                            <option value="">No brand</option>
                            {__list(v.brands).map((b) => (<option key={b} value={b}>{b}</option>))}
                            <option value="__add">Add a brand…</option>
                          </select>
                        </label>
                        <label className="ap-field">
                          <span className="gc-label">Unit</span>
                          <select className="gc-input gc-select" aria-label="Unit">
                            <option>Piece</option>
                            <option>Box</option>
                            <option>kg</option>
                            <option>Litre</option>
                            <option>Pack</option>
                          </select>
                        </label>
                        <div className="ap-field">
                          <div className="ap-lbl"><span className="gc-label">Tags</span><span className="ap-push" /><AiBtn onClick={v.aiTags}>AI</AiBtn></div>
                          <div className="ap-tags">
                            {__list(v.tags).map((t, i) => (
                              <span key={i} className="ap-tag" style={{ background: t.bg, color: t.fg }}>{t.t}<button type="button" onClick={t.remove} aria-label={`Remove ${t.t ?? ""}`}><__Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>
                            ))}
                          </div>
                        </div>
                        <label className="ap-field">
                          <span className="gc-label">Collections</span>
                          <select className="gc-input gc-select" aria-label="Collections">
                            <option>New arrivals, Eid picks</option>
                          </select>
                        </label>
                      </div>
                    </section>

                    {/* the live stock of this product at each place (available after holds, held for orders) */}
                    <section className="ix-card" aria-labelledby="ap-h-stock">
                      <div className="ix-card__head">
                        <h2 id="ap-h-stock">Stock</h2>
                        <__Link href="/stock">Stock history</__Link>
                      </div>
                      <div className="ix-card__body">
                        <table className="ap-stock gc-table--keep">
                          <thead><tr><th scope="col">Location</th><th scope="col">Available</th><th scope="col">Reserved for orders</th></tr></thead>
                          <tbody>
                            <tr><td>Central Warehouse</td><td className="ix-strong">{v.stockHere?.[0]?.avail ?? 0}</td><td className="ix-muted">{v.stockHere?.[0]?.held ?? 0}</td></tr>
                            <tr><td>Dhanmondi branch</td><td className="ix-strong">{v.stockHere?.[1]?.avail ?? 0}</td><td className="ix-muted">{v.stockHere?.[1]?.held ?? 0}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ap-h-ready">
                      <div className="ix-card__head"><h2 id="ap-h-ready">Ready to sell?</h2></div>
                      <div className="ix-card__body">
                        <ul className="ap-ready">
                          {__list(v.checks).map((k, i) => (
                            <li key={i}><i style={{ background: k.bg }} aria-hidden="true"><__Icon name="check" width="10" height="10" strokeWidth="3" /></i><span style={{ color: k.fg }}>{k.l}</span></li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  </aside>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
