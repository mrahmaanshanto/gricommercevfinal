'use client';
// Generated from design/templates/products/AddProduct.dc.html by scripts/convert-design.mjs.
// AddProduct — Products — Add product.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { findProduct, saveProduct, codeOwner, newProductId, getSavedProducts, SELL_TO } from '@/lib/products';
import { getStockSetup } from '@/lib/stockSetup';

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
function prefillFrom(p) {
  var money = function (n) { return n == null || n === '' ? '' : bdt(n); };
  var str = function (n) { return n == null || n === '' ? '' : String(n); };
  return {
    editId: p.id, orig: p, basePrice: p.price, title: p.name, short: p.short || '', long: p.long || '', seoT: p.seoT || p.name, seoD: p.seoD || '', tags: p.tags || [],
    price: money(p.price), cost: money(p.cost), mrp: money(p.mrp), wholesale: str(p.wholesale), moq: str(p.moq), sell: p.sell || 'retail',
    sku: p.sku || '', barcode: p.barcode || '', cat: catLeaf(p.cat), brand: p.brand || '', status: p.st || 'active', opts: p.opts || [],
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
      assistOpen: s.assistOpen == null ? true : s.assistOpen, assistBtn: (s.assistOpen == null || s.assistOpen) ? 'Hide' : 'Show', toggleAssist: function () { self.setState({ assistOpen: !(s.assistOpen == null || s.assistOpen) }); },
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
      barcode: barcode, typeBarcode: function (e) { self.setState({ barcode: e.target.value }); },
      genBarcode: function () { var b, i = 0; do { b = '894150010' + (1000 + Math.floor(Math.random() * 8999)); i++; } while (codeOwner('barcode', b, ownId, savedList) && i < 50); self.setState({ barcode: b }); toast(self, 'New EAN-13 barcode made. It is unique in your shop.'); },
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
      // A new product becomes an edit of itself, so the next save updates it instead of adding another.
      window.history.replaceState(window.history.state, '', window.location.pathname + (rec.sku ? '?sku=' + encodeURIComponent(rec.sku) : '?id=' + encodeURIComponent(rec.id)));
      self.setState({ errors: null, editId: rec.id, orig: rec, basePrice: rec.price, variants: pre.variants, status: draft ? 'draft' : f('status', 'active'), savedList: getSavedProducts() }, function () { self.markSaved(); toast(self, okMsg); });
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

// ---- styles (from the design's <helmet>) ----

const CSS = `/* phones: rows of label + buttons wrap instead of running out of the card */
@media (max-width:640px){.gc-shell__content [style*="display:flex"]:not([role="tablist"]):not([style*="column"]),.gc-shell__content [style*="display: flex"]:not([role="tablist"]):not([style*="column"]){flex-wrap:wrap}#product-form{flex-wrap:nowrap!important}.gc-shell__content select,.gc-shell__content input{min-width:0;max-width:100%}.gc-shell__content .mono,.gc-shell__content [class*="badge"]{overflow-wrap:anywhere}}

body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.req{color:var(--text-danger)}
.inp[aria-invalid="true"]{border-color:var(--text-danger)!important}
.ferr{margin:0;font-size:var(--text-xs);line-height:16px;color:var(--text-danger);display:flex;align-items:center;gap:6px}
.savebar{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;border-radius:var(--radius-xl);background:#fff;border:1px solid #e6eaf0;box-shadow:0 -8px 20px -12px rgba(15,23,42,.28)}
.savebar__note{flex:1 1 140px;min-width:0;display:flex;align-items:center;gap:8px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569}
.savebar__dot{width:8px;height:8px;border-radius:var(--radius-full);background:var(--fill-warning);flex-shrink:0}
.tagx{width:24px;height:24px;border:0;border-radius:var(--radius-full);background:transparent;cursor:pointer;color:inherit;display:inline-flex;align-items:center;justify-content:center}
.tagx:hover{background:rgba(15,23,42,.08)}
.tagx:focus-visible,.abtn:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}

/* phones: a switch row keeps icon, text and switch on one line; two-way choices share the width; save bar on one row */
@media (max-width:640px){
  .gc-shell__content [style*="display"]:has(> button[role="switch"]){flex-wrap:nowrap!important}
  .gc-shell__content [style*="display"]:has(> button[role="switch"])>div{flex:1 1 0!important;min-width:0}
  .apt-seg{display:grid!important;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);width:100%;border-radius:var(--radius-xl)!important}
  .apt-seg>button{height:auto!important;min-height:36px;padding:6px 10px!important;border-radius:var(--radius-lg)!important;white-space:normal;line-height:16px}
  .savebar{flex-wrap:wrap;gap:8px!important;padding:10px 12px!important}
  .savebar__note:empty{display:none}
  .savebar__note{flex:1 1 100%!important;font-size:var(--text-xs)!important}
  .savebar>.btn{flex:1 1 auto;padding:0 12px}
  .savebar>.savebar__note+.btn{flex:0 0 auto;background:none;border-color:transparent;padding:0 8px}
  .savebar>.btn svg{display:none}
  body:has(.savebar) .gc-ai{bottom:84px}
  .gc-shell__content .ap-ai-opts{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)!important}
  .ap-ai-opts>select{width:auto!important;min-width:0}
  .ap-ai-opts>span{display:none}
  .ap-ai-opts>.btn{grid-column:1/-1}
}
`;

// ---- markup ----

export default class AddProductScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AddProduct">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active={v.editing ? "products-all" : "products-add"} />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Products / All products" page={v.heading} placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title={v.heading} />
              <form id="product-form" noValidate aria-label={v.heading} onSubmit={v.submit} onInput={v.formInput} onChange={v.formInput} onKeyDown={v.formKey} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Title and description</h2>
                        <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)", marginTop: "2px" }}>Fields marked <span className="req" aria-hidden="true">*</span><span className="sr-only">with a star</span> are required.</div>
                      </div>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Title <span className="req" aria-hidden="true">*</span></span>
                      <input className="inp" value={v.title} onInput={v.typeTitle} onChange={v.typeTitle} aria-label="Title" id="pf-title" aria-required="true" aria-invalid={v.err?.title ? "true" : undefined} aria-describedby={v.err?.title ? "pf-title-err" : undefined} style={{ height: "46px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }} />
                      {v.err?.title ? (<span id="pf-title-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.err.title}</span>) : null}
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="lbl" style={{ flexGrow: "1" }}>Short description</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginRight: "10px" }}>{v.shortCount}</span>
                        <button type="button" className="ai" onClick={v.aiShort}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                      </div>
                      <textarea className="inp" rows="2" value={v.short} onInput={v.typeShort} onChange={v.typeShort} aria-label="Short description" style={__sx(`height: auto; padding: 12px 14px; line-height: 22px; resize: vertical; border-color: ${v.shortBorder ?? ""};`)} />
                      {v.ai?.short ? (<>
                        <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#6d28d9" }}>
                          <span style={{ height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f3e8ff", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                          <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.keep_short}>Looks good</button>
                          <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.undo_short}>Undo</button>
                        </div>
                      </>) : null}
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Shown next to the price and in search results. One or two lines.</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="lbl" style={{ flexGrow: "1" }}>Long description</span>
                        <button type="button" className="ai" onClick={v.aiLong}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                        <button type="button" className="ai" onClick={v.aiImprove}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Improve</button>
                        <button type="button" className="ai" onClick={v.aiBangla}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Add Bangla</button>
                      </div>
                      <div style={{ display: "flex", gap: "2px", padding: "6px", border: "1px solid #cbd5e1", borderBottom: "0", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", background: "#f8fafc" }}>
                        <button type="button" className="ib" aria-label="Bold" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)" }}><__Icon name="bold" width="15" height="15" aria-hidden="true" /></button>
                        <button type="button" className="ib" aria-label="Italic" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)" }}><__Icon name="italic" width="15" height="15" aria-hidden="true" /></button>
                        <button type="button" className="ib" aria-label="List" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="8" height="4" x="8" y="2" rx="1" />
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <path d="M12 11h4" />
                            <path d="M12 16h4" />
                            <path d="M8 11h.01" />
                            <path d="M8 16h.01" />
                          </svg>
                        </button>
                        <button type="button" className="ib" aria-label="Link" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </button>
                        <button type="button" className="ib" aria-label="Picture" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </button>
                      </div>
                      <textarea className="inp bn" rows="8" value={v.long} onInput={v.typeLong} onChange={v.typeLong} aria-label="Long description" style={__sx(`height: auto; padding: 12px 14px; line-height: 23px; border-radius: 0 0 var(--radius-lg) var(--radius-lg); resize: vertical; border-color: ${v.longBorder ?? ""};`)} />
                      {v.ai?.long ? (<>
                        <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#6d28d9" }}>
                          <span style={{ height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f3e8ff", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                          <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.keep_long}>Looks good</button>
                          <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.undo_long}>Undo</button>
                        </div>
                      </>) : null}
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "12px", borderColor: "#d9d2fb", background: "linear-gradient(135deg, #fbfaff, #f4f8ff)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, #7c3aed, #0a5bd0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>AI writing assistant</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Tell it a few facts. Pick the fields you want filled. You check every word before saving.</div>
                      </div>
                      <button type="button" className="abtn" onClick={v.toggleAssist} aria-expanded={v.assistOpen} aria-controls={v.assistOpen ? "ai-assist-panel" : undefined} aria-label={`${v.assistBtn ?? ""} the AI writing assistant`}><__Icon name={v.assistOpen ? "chevron-up" : "chevron-down"} width="14" height="14" aria-hidden="true" />{v.assistBtn}</button>
                    </div>
                    {v.assistOpen ? (<>
                      <div id="ai-assist-panel" data-nodirty="" className="fade" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Key facts about the product</span>
                          <input className="inp" value={v.facts} onInput={v.typeFacts} onChange={v.typeFacts} aria-label="Key facts" />
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>For example: 6.7 inch AMOLED, 5000 mAh, 1 year official warranty, PTA approved.</span>
                        </label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <span className="lbl">Fill these:</span>
                          {__list(v.aiFields).map((c, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "36px" }}>{c?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{c?.label}</button>
                            </React.Fragment>))}
                        </div>
                        <div className="ap-ai-opts" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <select className="inp" aria-label="Language" style={{ width: "180px" }}>
                            <option>English</option>
                            <option>বাংলা</option>
                            <option>English + বাংলা</option>
                          </select>
                          <select className="inp" aria-label="Tone" style={{ width: "180px" }}>
                            <option>Premium</option>
                            <option>Friendly</option>
                            <option>Simple and short</option>
                          </select>
                          <span style={{ flexGrow: "1" }} />
                          <button type="button" className="btn solid" onClick={v.runAssist} style={{ background: "#6d28d9" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                            </svg>
                            <span>Write {v.aiCount} fields</span>
                          </button>
                        </div>
                      </div>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Media</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>Drag to reorder. The first photo is the cover.</div>
                      </div>
                      <button type="button" className="ai" onClick={v.aiAlt}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Alt text with AI</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gridTemplateRows: "110px 110px", gap: "10px" }}>
                      <div style={{ gridRow: "span 2", borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, #0b1733, #0a5bd0)", color: "#fff", display: "flex", alignItems: "flex-end", padding: "14px", fontWeight: "var(--weight-medium)", position: "relative" }}>Front · main photo<span style={{ position: "absolute", top: "10px", left: "10px", height: "22px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,.2)", fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center" }}>COVER</span></div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#e0f2fe", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "var(--text-xs)", color: "#334155" }}>Back</div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#eef2f6", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "var(--text-xs)", color: "#334155" }}>Side</div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#f3e8ff", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "var(--text-xs)", color: "#334155" }}>Box</div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#e7f8f1", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "var(--text-xs)", color: "#334155" }}>In hand</div>
                      <button type="button" style={{ gridColumn: "span 2", borderRadius: "var(--radius-lg)", border: "2px dashed #94a3b8", background: "#f8fafc", font: "inherit", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M17 8 12 3 7 8" />
                          <path d="M12 3v12" />
                        </svg>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Add photos or a video</span>
                      </button>
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Pricing</h2>
                      </div>
                    </div>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Selling price {v.priceReq ? (<span className="req" aria-hidden="true">*</span>) : null}</span>
                        <input className="inp num" inputMode="decimal" placeholder="৳0" value={v.price} onInput={v.typePrice} onChange={v.typePrice} aria-label="Selling price" id="pf-price" aria-required={v.priceReq ? "true" : undefined} aria-invalid={v.err?.price ? "true" : undefined} aria-describedby={v.err?.price ? "pf-price-err" : undefined} />
                        {v.err?.price ? (<span id="pf-price-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.err.price}</span>) : null}
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">{v.wsOn ? 'MRP (compare-at price)' : 'Compare-at price (optional)'}</span>
                        <input className="inp num" inputMode="decimal" placeholder="৳0" value={v.mrp} onInput={v.typeMrp} onChange={v.typeMrp} aria-label="MRP" />
                        <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Shown crossed out</span>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Buying price (cost) {v.costReq ? (<span className="req" aria-hidden="true">*</span>) : null}</span>
                        <input className="inp num" inputMode="decimal" placeholder="৳0" value={v.cost} onInput={v.typeCost} onChange={v.typeCost} aria-label="Buying price" id="pf-cost" aria-invalid={v.err?.cost ? "true" : undefined} aria-describedby={v.err?.cost ? "pf-cost-err" : undefined} />
                        {v.err?.cost ? (<span id="pf-cost-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.err.cost}</span>) : null}
                        <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Customers never see this</span>
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ flex: "1 1 0", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Profit per piece</div>
                        <div className="num" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${v.profitColor ?? ""};`)}>{v.profit}</div>
                      </div>
                      <div style={{ flex: "1 1 0", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Margin</div>
                        <div className="num" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${v.profitColor ?? ""};`)}>{v.margin}</div>
                      </div>
                      <div style={{ flex: "1 1 0", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Customer saves</div>
                        <div className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.saves}</div>
                      </div>
                    </div>
                    {v.wsOn ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                      <span className="lbl" id="pf-sell-label">Sell to</span>
                      <div role="group" aria-labelledby="pf-sell-label" style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                        {__list(v.sellOpts).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                      <span style={{ flex: "1 1 220px", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.sellHelp}</span>
                    </div>
                    ) : null}
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">VAT / tax</span>
                        <select className="inp" aria-label="Tax rate">
                          <option>Standard VAT 15%</option>
                          <option>Reduced 7.5%</option>
                          <option>No VAT</option>
                        </select>
                      </label>
                      {v.sellsWs ? (<>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Wholesale price (৳) <span className="req" aria-hidden="true">*</span></span>
                        <input className="inp num" type="number" inputMode="decimal" min="0" step="1" placeholder="0" value={v.wholesale} onInput={v.typeWholesale} onChange={v.typeWholesale} aria-label="Wholesale price" id="pf-wholesale" aria-required="true" aria-invalid={v.err?.wholesale ? "true" : undefined} aria-describedby={v.err?.wholesale ? "pf-wholesale-err" : undefined} />
                        {v.err?.wholesale ? (<span id="pf-wholesale-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.err.wholesale}</span>) : (<span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Price per piece for bulk buyers</span>)}
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Minimum order (MOQ) <span className="req" aria-hidden="true">*</span></span>
                        <span style={{ position: "relative", display: "block" }}>
                          <input className="inp num" type="number" inputMode="numeric" min="1" step="1" placeholder="1" value={v.moq} onInput={v.typeMoq} onChange={v.typeMoq} aria-label="Wholesale minimum order in pieces" id="pf-moq" aria-required="true" aria-invalid={v.err?.moq ? "true" : undefined} aria-describedby={v.err?.moq ? "pf-moq-err" : undefined} style={{ paddingRight: "70px" }} />
                          <span aria-hidden="true" style={{ position: "absolute", right: "14px", top: "0", height: "44px", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", color: "var(--text-muted)", pointerEvents: "none" }}>pieces</span>
                        </span>
                        {v.err?.moq ? (<span id="pf-moq-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.err.moq}</span>) : (<span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Wholesale price starts from this many</span>)}
                      </label>
                      </>) : null}
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Stock</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>Connected to Purchase, Stock and POS — you never enter stock twice.</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">SKU</span>
                        <input className="inp mono" placeholder="For example PH-5GP-256" value={v.sku} onInput={v.typeSku} onChange={v.typeSku} aria-label="SKU" id="pf-sku" aria-invalid={v.skuErr ? "true" : undefined} aria-describedby={v.skuErr ? "pf-sku-err" : undefined} />
                        {v.skuErr ? (<span id="pf-sku-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.skuErr}</span>) : null}
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Barcode (EAN-13)</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp mono" placeholder="13 digits" value={v.barcode} onInput={v.typeBarcode} onChange={v.typeBarcode} aria-label="Barcode" id="pf-barcode" aria-invalid={v.barcodeErr ? "true" : undefined} aria-describedby={v.barcodeErr ? "pf-barcode-err" : undefined} />
                          <button type="button" className="abtn" style={{ height: "44px" }} onClick={v.genBarcode}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <line x1="4" x2="20" y1="9" y2="9" />
  <line x1="4" x2="20" y1="15" y2="15" />
  <line x1="10" x2="8" y1="3" y2="21" />
  <line x1="16" x2="14" y1="3" y2="21" />
</svg>Make one</button>
                          <__Link href="/barcode-labels" className="abtn" style={{ height: "44px", textDecoration: "none" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
  <rect x="6" y="14" width="12" height="8" rx="1" />
</svg>Label</__Link>
                        </div>
                        {v.barcodeErr ? (<span id="pf-barcode-err" className="ferr" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.barcodeErr}</span>) : null}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Track stock for this product</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Stock goes up with purchase orders and returns, down with sales and damage</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.track?.on} aria-label="Track stock for this product" className={v.track?.cls} onClick={v.track?.toggle} />
                    </div>
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Location</th>
                            <th className="th" style={{ textAlign: "right" }}>Available</th>
                            <th className="th" style={{ textAlign: "right" }}>Reserved for orders</th>
                            <th className="th" style={{ textAlign: "right" }}>Opening stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="row">
                            <td className="td">Central Warehouse</td>
                            <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>24</td>
                            <td className="td num" style={{ textAlign: "right", color: "var(--text-muted)" }}>3</td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <input className="inp num" defaultValue="0" aria-label="Opening stock Central Warehouse" style={{ width: "90px", height: "36px", textAlign: "right" }} />
                            </td>
                          </tr>
                          <tr className="row">
                            <td className="td">Dhanmondi branch</td>
                            <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>14</td>
                            <td className="td num" style={{ textAlign: "right", color: "var(--text-muted)" }}>1</td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <input className="inp num" defaultValue="0" aria-label="Opening stock Dhanmondi branch" style={{ width: "90px", height: "36px", textAlign: "right" }} />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                      <span>Alert me when stock is below</span>
                      <input className="inp num" defaultValue="5" aria-label="Low stock alert" style={{ width: "80px", height: "36px" }} />
                      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" style={{ width: "16px", height: "16px" }} />Keep selling when out of stock (pre-order)</label>
                      <span style={{ flexGrow: "1" }} />
                      <__Link href="/stock" style={{ fontWeight: "var(--weight-medium)" }}>Stock history</__Link>
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Product validity (expiry)</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>Phones do not expire — leave this off. Food sellers turn it on.</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>This product expires</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Turn on for food, medicine, cosmetics — anything with a best-before date</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.expires?.on} aria-label="This product expires" className={v.expires?.cls} onClick={v.expires?.toggle} />
                    </div>
                    {v.expires?.on ? (<>
                      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f6fc" }}>
                          <span style={{ fontSize: "var(--text-sm)" }}>It stays good for</span>
                          <input className="inp num" inputMode="numeric" value={v.shelfN} onInput={v.typeShelf} onChange={v.typeShelf} aria-label="Shelf life" id="pf-shelf" aria-required="true" aria-invalid={v.err?.shelf ? "true" : undefined} aria-describedby={v.err?.shelf ? "pf-shelf-err" : undefined} style={{ width: "80px", height: "40px", textAlign: "center", fontWeight: "var(--weight-semibold)" }} />
                          {v.err?.shelf ? (<span id="pf-shelf-err" className="ferr" style={{ order: "9", flexBasis: "100%" }} role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{v.err.shelf}</span>) : null}
                          <select className="inp" value={v.shelfU} onChange={v.setShelfU} aria-label="Shelf life unit" style={{ width: "120px", height: "40px" }}>
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                            <option value="months">months</option>
                            <option value="years">years</option>
                          </select>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#003087", fontWeight: "var(--weight-medium)" }}>{v.shelfEx}</span>
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Stop selling</span>
                            <select className="inp" aria-label="Stop selling">
                              <option>3 days before expiry</option>
                              <option>On the expiry date</option>
                              <option>7 days before expiry</option>
                            </select>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Hidden from the website and blocked at POS</span>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Warn me</span>
                            <select className="inp" aria-label="Warn before">
                              <option>14 days before expiry</option>
                              <option>7 days before</option>
                              <option>30 days before</option>
                            </select>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{"Shows in Stock › Expiry & disposal"}</span>
                          </label>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Batch dates are entered when stock arrives in Purchase. Expired stock moves to <__Link href="/expiry-disposal" style={{ color: "#0a5bd0", fontWeight: "var(--weight-medium)" }}>{"Expiry & disposal"}</__Link>.</div>
                      </div>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Variants</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>Colour, size, storage… each variant keeps its own price, stock and barcode.</div>
                      </div>
                      <button type="button" className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add option</button>
                    </div>
                    {v.hasOpts ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {__list(v.optRows).map((o, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e6eaf0" }}>
                        <span style={{ color: "var(--text-muted)" }}><__Icon name="grip-vertical" width="16" height="16" aria-hidden="true" /></span>
                        <span style={{ width: "90px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{o?.name}</span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flexGrow: "1" }}>
                          {__list(o?.values).map((val) => (<span key={val} style={{ height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#eef2f6", fontSize: "var(--text-xs-plus)", display: "inline-flex", alignItems: "center" }}>{val}</span>))}
                        </div>
                      </div>
                      </React.Fragment>))}
                    </div>
                    ) : null}
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Variant</th>
                            <th className="th" style={{ textAlign: "right" }}>Price</th>
                            <th className="th" style={{ textAlign: "right" }}>Stock</th>
                            <th className="th">SKU</th>
                            <th className="th">Barcode</th>
                            {v.wsOn ? <th className="th">Wholesale price</th> : null}
                            {v.wsOn ? <th className="th">MOQ</th> : null}
                          </tr>
                        </thead>
                        <tbody>
                          {v.hasVariants ? __list(v.varRows).map((r) => (<React.Fragment key={r.key}>
                          <tr className="row">
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={__sx(`width: 14px; height: 14px; flex-shrink: 0; border-radius: var(--radius-full); background: ${r?.swatch ?? ""}; border: 1px solid #cbd5e1;`)} />{r?.name}</div>
                            </td>
                            <td className="td num" style={{ textAlign: "right", whiteSpace: "nowrap" }}>{r?.price}</td>
                            <td className="td num" style={__sx(`text-align: right; color: ${r?.stockColor ?? ""}; font-weight: var(--weight-medium);`)}>{r?.stock}</td>
                            <td className="td mono" style={{ color: "#475569", whiteSpace: "nowrap" }}>{r?.sku}</td>
                            <td className="td mono" style={{ color: "#475569", whiteSpace: "nowrap" }}>{r?.barcode}</td>
                            {v.sellsWs ? (<>
                            <td className="td" style={{ verticalAlign: "top" }}>
                              <input className="inp num" type="number" inputMode="decimal" min="0" step="1" value={r?.ws} placeholder={v.wsPh} onInput={r?.typeWs} onChange={r?.typeWs} id={r?.wsId} aria-label={`Wholesale price for ${r?.name ?? ""}`} aria-invalid={r?.wsErr ? "true" : undefined} aria-describedby={r?.wsErr ? `${r?.wsId}-err` : undefined} style={{ width: "110px", height: "36px", textAlign: "right" }} />
                              {r?.wsErr ? (<span id={`${r?.wsId}-err`} className="ferr" role="alert" style={{ marginTop: "4px", maxWidth: "160px" }}>{r.wsErr}</span>) : null}
                            </td>
                            <td className="td" style={{ verticalAlign: "top" }}>
                              <input className="inp num" type="number" inputMode="numeric" min="1" step="1" value={r?.moq} placeholder={v.moqPh} onInput={r?.typeMoq} onChange={r?.typeMoq} id={r?.moqId} aria-label={`Minimum order in pieces for ${r?.name ?? ""}`} aria-invalid={r?.moqErr ? "true" : undefined} aria-describedby={r?.moqErr ? `${r?.moqId}-err` : undefined} style={{ width: "80px", height: "36px", textAlign: "right" }} />
                              {r?.moqErr ? (<span id={`${r?.moqId}-err`} className="ferr" role="alert" style={{ marginTop: "4px", maxWidth: "140px" }}>{r.moqErr}</span>) : null}
                            </td>
                            </>) : v.wsOn ? (<>
                            <td className="td" style={{ color: "var(--text-muted)" }}>—</td>
                            <td className="td" style={{ color: "var(--text-muted)" }}>—</td>
                            </>) : null}
                          </tr>
                          </React.Fragment>)) : (
                          <tr>
                            <td className="td" colSpan={v.wsOn ? 7 : 5} style={{ color: "var(--text-muted)" }}>No variants. This product is sold as one item with the SKU, barcode and prices above.</td>
                          </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {v.hasVariants ? (<div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.sellsWs ? "Leave a variant’s wholesale price or MOQ empty to use the product’s own (shown in grey)." : "Wholesale price and MOQ per variant open when Sell to is Wholesale or Both."}</div>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Warranty and serial numbers</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>Two quick questions. Details are managed in Stock.</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "28px", height: "28px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Does this product come with a warranty?</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                          <span className="bn">এই পণ্যে কি ওয়ারেন্টি আছে?</span>
                        </div>
                      </div>
                      <div className="apt-seg" style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                        {__list(v.wqOpts).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    {v.wYes ? (<>
                      <div className="fade" style={{ marginLeft: "42px", display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "var(--radius-xl)", background: "#f7f9fc", border: "1px solid #e6eaf0" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Warranty policy</span>
                            <select className="inp" value={v.wp} onChange={v.setWp} aria-label="Warranty policy">
                              <option value="brand1y">Smartphone brand warranty · 12 months</option>
                              <option value="shop6m">6 months shop service warranty</option>
                              <option value="rep7d">7-day replacement guarantee</option>
                              <option value="elec2y">2 years parts, 1 year service</option>
                            </select>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Written once in Stock › Warranty policies</span>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Starts from</span>
                            <div className="inp" style={{ display: "flex", alignItems: "center", background: "#f1f5f9", color: "#334155" }}>{v.wpStart}</div>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Set by the policy</span>
                          </label>
                        </div>
                        <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                          {__list(v.wpInfo).map((w, $index) => (<React.Fragment key={$index}>
                              <div style={{ padding: "12px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0" }}>
                                <div style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>{w?.k}</div>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{w?.v}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Warranty description for this product</span>
                          <textarea className="inp" rows="3" aria-label="Warranty description" style={{ height: "84px", padding: "10px 14px", resize: "none" }} defaultValue={`${v.wpText ?? ""}`} />
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Shown on the product page under the price, with a link to the full policy. Filled from the policy — change it only if this product is different.</span>
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)" }}>
                          <__Link href="/warranty-policies" style={{ fontWeight: "var(--weight-medium)" }}>Open warranty policies</__Link>
                          <span style={{ color: "var(--text-muted)" }}>·</span>
                          <span style={{ color: "#475569" }}>Printed on the invoice and warranty card</span>
                        </div>
                      </div>
                    </>) : null}
                    <div style={{ height: "1px", background: "#eef2f6" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "28px", height: "28px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Does each piece have its own serial or IMEI number?</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Phones, laptops, TVs — so you know exactly which piece was sold</div>
                      </div>
                      <div className="apt-seg" style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                        {__list(v.sqOpts).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    {v.sYes ? (<>
                      <div className="fade" style={{ marginLeft: "42px", display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "var(--radius-xl)", background: "#f7f9fc", border: "1px solid #e6eaf0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span className="lbl">Which number?</span>
                          <div className="apt-seg" style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                            {__list(v.sntOpts).map((o, $index) => (<React.Fragment key={$index}>
                                <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                              </React.Fragment>))}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#0c4a6e", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          <div style={{ flexGrow: "1" }}>You do not type the numbers here. Staff scan them in <b>Stock</b> when goods arrive, and the POS asks for the number at sale. <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
  <__Link href="/receive-goods" style={{ fontWeight: "var(--weight-medium)" }}>Receive goods</__Link>
  <__Link href="/warranty-claims" style={{ fontWeight: "var(--weight-medium)" }}>Serial number register</__Link>
</div></div>
                          <span style={{ flexShrink: "0", textAlign: "right" }}>
                            <span style={{ display: "block", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.snCount}</span>
                            <span style={{ fontSize: "var(--text-xs)" }}>in stock now</span>
                          </span>
                        </div>
                      </div>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Size guide</h2>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select className="inp" value={v.sg} onChange={v.setSg} aria-label="Size guide" style={{ maxWidth: "360px" }}>
                        <option value="none">No size guide</option>
                        <option value="shirt">Men’s shirts and polos</option>
                        <option value="kurti">Women’s kurti</option>
                        <option value="shoe">Shoes (BD / EU / UK)</option>
                      </select>
                      <__Link href="/catalog-setup" className="abtn" style={{ textDecoration: "none" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
  <path d="m14.5 12.5 2-2" />
  <path d="m11.5 9.5 2-2" />
  <path d="m8.5 6.5 2-2" />
  <path d="m17.5 15.5 2-2" />
</svg>Make a size chart</__Link>
                    </div>
                    {v.hasSg ? (<>
                      <div className="gc-table-wrap">
                        <table className="fade" style={{ width: "100%%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {__list(v.sgHead).map((h, $index) => (<React.Fragment key={$index}>
                                  <th className="th">{h?.t}</th>
                                </React.Fragment>))}
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.sgRows).map((r, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  {__list(r?.c).map((cc, $index) => (<React.Fragment key={$index}>
                                      <td className="td num">{cc?.t}</td>
                                    </React.Fragment>))}
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </>) : null}
                    {v.noSg ? (<>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Not needed for phones. Clothing and shoes should have one — it cuts returns.</div>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>More details</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>These fields come from the category. Change the category and the fields change with it.</div>
                      </div>
                      {v.catBadge ? (<span className="badge b-approved">{v.catBadge}</span>) : null}
                    </div>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                      {__list(v.cfs).map((f, $index) => (<React.Fragment key={$index}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">{f?.l} <span style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>{f?.type}</span></span>
                            <input className="inp" defaultValue={f?.v} aria-label={f?.l} />
                          </label>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button type="button" className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add a field just for this product</button>
                      <__Link href="/catalog-setup" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Manage custom fields</__Link>
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Shipping</h2>
                      </div>
                    </div>
                    <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Weight</span>
                        <input className="inp num" defaultValue="0.45 kg" aria-label="Weight" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Length</span>
                        <input className="inp num" defaultValue="18 cm" aria-label="Length" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Width</span>
                        <input className="inp num" defaultValue="10 cm" aria-label="Width" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Height</span>
                        <input className="inp num" defaultValue="6 cm" aria-label="Height" />
                      </label>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Fragile — handle with care</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Printed on the courier label</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.fragile?.on} aria-label="Fragile — handle with care" className={v.fragile?.cls} onClick={v.fragile?.toggle} />
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Search engine listing</h2>
                      </div>
                      <button type="button" className="ai" onClick={v.aiSeo}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                    </div>
                    <div style={{ padding: "14px 16px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0" }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "#047857" }}>gridshop.com.bd › products › {v.handle}</div>
                      <div style={{ fontSize: "var(--text-lg)", color: "#1a0dab", margin: "2px 0" }}>{v.seoTitle}</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", lineHeight: "19px" }}>{v.seoDesc}</div>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Page title</span>
                      <input className="inp" value={v.seoTitle} onInput={v.typeSeoT} onChange={v.typeSeoT} aria-label="Page title" />
                      <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.seoTCount}</span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Meta description</span>
                      <textarea className="inp" rows="2" value={v.seoDesc} onInput={v.typeSeoD} onChange={v.typeSeoD} aria-label="Meta description" style={{ height: "auto", padding: "10px 12px" }} />
                    </label>
                    {v.ai?.seo ? (<>
                      <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#6d28d9" }}>
                        <span style={{ height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f3e8ff", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                        <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.keep_seo}>Looks good</button>
                        <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.undo_seo}>Undo</button>
                      </div>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Product FAQ</h2>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>Shown on the product page. Answers the questions customers ask most.</div>
                      </div>
                      <button type="button" className="ai" onClick={v.aiFaq}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Suggest with AI</button>
                    </div>
                    {__list(v.faqs).map((q, $index) => (<React.Fragment key={$index}>
                        <div className={q?.cls} style={__sx(`padding: 12px 14px; border-radius: var(--radius-xl); border: 1px solid ${q?.border ?? ""};`)}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{q?.q}</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", marginTop: "4px" }}>{q?.a}</div>
                        </div>
                      </React.Fragment>))}
                    {v.ai?.faq ? (<>
                      <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#6d28d9" }}>
                        <span style={{ height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f3e8ff", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                        <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.keep_faq}>Looks good</button>
                        <button type="button" className="abtn" style={{ height: "28px" }} onClick={v.undo_faq}>Undo</button>
                      </div>
                    </>) : null}
                    <button type="button" className="abtn" style={{ alignSelf: "flex-start" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add a question</button>
                  </section>
                  <div className="savebar" role="group" aria-label="Save product">
                    <span className="savebar__note" role="status">
                      {v.hasErr ? (<span style={{ color: "var(--text-danger)", display: "inline-flex", alignItems: "center", gap: "8px" }}><__Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />{v.errSummary}</span>) : v.dirty ? (<><span className="savebar__dot" aria-hidden="true" />Unsaved changes</>) : null}
                    </span>
                    {v.dirty ? (
                      <button type="button" className="btn line" onClick={v.discard}>Discard</button>
                    ) : (
                      <__Link href="/all-products" className="btn line">Cancel</__Link>
                    )}
                    <button type="button" className="btn line" onClick={v.saveDraft}>Save as draft</button>
                    <button type="submit" className="btn solid">
                      <__Icon name="check" width="18" height="18" strokeWidth="2" aria-hidden="true" />
                      <span>Save product</span>
                    </button>
                  </div>
                </div>
                <aside className="gc-side" style={{ width: "350px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "18px", position: "sticky", top: "0" }}>
                  <section className="pcard" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="psec">Status</div>
                    <select className="inp" value={v.status} onChange={v.setStatus} aria-label="Status">
                      <option value="active">Active — customers can buy</option>
                      <option value="draft">Draft — hidden</option>
                      <option value="scheduled">Go live on a date</option>
                      {v.isArchived ? (<option value="archived">Archived — hidden, kept for records</option>) : null}
                      {v.isDeleted ? (<option value="deleted">Deleted — restore by picking another status</option>) : null}
                    </select>
                    <div className="lbl" style={{ marginTop: "4px" }}>Sell on</div>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />Online shop</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />POS counter</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />Facebook shop</label>
                  </section>
                  <section className="pcard" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="psec">Organisation</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Category</span>
                      <button type="button" onClick={v.toggleCat} aria-expanded={v.catOpen} aria-label={`Category: ${v.catPath ?? ""}`} className="inp" style={{ height: "auto", minHeight: "44px", padding: "8px 12px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                        </svg>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{v.catPath}</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {v.catOpen ? (<>
                        <div className="fade" style={{ border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", maxHeight: "300px", overflowY: "auto", boxShadow: "0 12px 24px -12px rgba(15,23,42,.25)" }}>
                          <input className="inp" placeholder="Search categories" aria-label="Search categories" data-nodirty="" style={{ height: "36px", marginBottom: "4px" }} />
                          {__list(v.cats).map((ct, $index) => (<React.Fragment key={$index}>
                              <button type="button" onClick={ct?.pick} style={__sx(`height: 34px; padding: 0 10px 0 ${ct?.pad ?? ""}; border: 0; border-radius: var(--radius-lg); background: ${ct?.bg ?? ""}; color: ${ct?.fg ?? ""}; font: inherit; font-size: var(--text-xs-plus); font-weight: ${ct?.fw ?? ""}; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;`)}>{ct?.name}<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ct?.n}</span></button>
                            </React.Fragment>))}
                          <__Link href="/categories" style={{ padding: "8px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "6px" }}><__Icon name="plus" width="14" height="14" aria-hidden="true" />New category</__Link>
                        </div>
                      </>) : null}
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sets the tax, the extra fields and where it shows in your shop menu.</span>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Brand</span>
                      <select className="inp" aria-label="Brand" value={v.brand} onChange={v.setBrand}>
                        <option value="">No brand</option>
                        {__list(v.brands).map((b) => (<option key={b} value={b}>{b}</option>))}
                        <option value="__add">Add a brand…</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Unit</span>
                        <select className="inp" aria-label="Unit">
                          <option>Piece</option>
                          <option>Box</option>
                          <option>kg</option>
                          <option>Litre</option>
                          <option>Pack</option>
                        </select>
                      </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="lbl" style={{ flexGrow: "1" }}>Tags</span>
                        <button type="button" className="ai" onClick={v.aiTags}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI</button>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {__list(v.tags).map((t, $index) => (<React.Fragment key={$index}>
                            <span style={__sx(`height: 28px; padding: 0 2px 0 10px; border-radius: var(--radius-full); background: ${t?.bg ?? ""}; color: ${t?.fg ?? ""}; font-size: var(--text-xs-plus); display: inline-flex; align-items: center; gap: 4px;`)}>{t?.t}<button type="button" onClick={t?.remove} aria-label={`Remove ${t?.t ?? ""}`} className="tagx"><__Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Collections</span>
                      <select className="inp" aria-label="Collections">
                        <option>New arrivals, Eid picks</option>
                      </select>
                    </label>
                  </section>
                  <section className="pcard" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="psec">Ready to sell?</div>
                    {__list(v.checks).map((k, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                          <span style={__sx(`width: 18px; height: 18px; border-radius: var(--radius-full); background: ${k?.bg ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center;`)}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          <span style={__sx(`color: ${k?.fg ?? ""};`)}>{k?.l}</span>
                        </div>
                      </React.Fragment>))}
                  </section>
                </aside>
              </form>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
