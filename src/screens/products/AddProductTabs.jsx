'use client';
// Generated from design/templates/products/AddProductTabs.dc.html by scripts/convert-design.mjs.
// Add product · tabs version — Products — Add product (tabs), laid out like Shopify's product page with the left
// column split into steps (docs/shopify-style.md). The fields and their logic are the same as before.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge, InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';

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
var TRANSIENT = { ai: 1, prev: 1, assistOpen: 1, catOpen: 1, aiSel: 1, facts: 1, msg: 1, bad: 1, errors: 1, dirty: 1, tab: 1, stripL: 1, stripR: 1 };
var FIELD_ORDER = ['title', 'price', 'cost', 'shelf'];
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

var AI_TXT = {
  short: 'Sun-dried green mangoes in cold-pressed mustard oil, made in small batches with no preservatives. Best within 1 month.',
  long: 'Our mango pickle is made the old way — raw green mangoes, sun-dried for three days, then slow-cooked with mustard oil, panch phoron and chilli.\n\nWhat’s inside\n• Green mango, mustard oil, salt, chilli, turmeric, panch phoron\n• No preservatives, no artificial colour\n• 400 g glass jar\n\nKeep it in a cool, dry place and use a dry spoon. Because it has no preservatives, it is best within 1 month of making — the date is printed on every jar.',
  bangla: '\n\nবাংলায়: রোদে শুকানো কাঁচা আম, সরিষার তেল ও পাঁচফোড়নে তৈরি। কোনো প্রিজারভেটিভ নেই। তৈরির ১ মাসের মধ্যে খাওয়া ভালো।',
  seoT: 'Mango Pickle (Aam Achar) 400g — No Preservatives | GridShop',
  seoD: 'Homestyle green mango pickle in mustard oil. Small batch, no preservatives, 400 g jar. Cash on delivery across Bangladesh.'
};
var FAQ_AI = [['How long does it stay good?', 'Best within 1 month of making. The making and expiry dates are printed on the jar.'], ['Does it need the fridge?', 'Not before opening. After opening, keep it in the fridge and use a dry spoon.'], ['Is it spicy?', 'Medium hot. Ask for the mild version in the order note.']];
var CATS = [['Grocery', 0, 89], ['Pickles', 1, 14], ['Snacks', 1, 22], ['Skin care', 0, 64], ['Sunscreen', 1, 12], ['Toner', 1, 9], ['Clothing', 0, 118], ['Men', 1, 52], ['Women', 1, 66], ['Electronics', 0, 41], ['Phones', 1, 18], ['Laptops', 1, 7], ['Audio', 1, 16], ['Grocery', 0, 89]];
var PARENT = { Pickles: 'Grocery', Snacks: 'Grocery',  Sunscreen: 'Skin care', Toner: 'Skin care', Men: 'Clothing', Women: 'Clothing', Phones: 'Electronics', Laptops: 'Electronics', Audio: 'Electronics' };
var CF = { Pickles: [['Ingredients', 'text', 'Green mango, mustard oil, salt, chilli, panch phoron'], ['Allergens', 'checkboxes', 'Mustard'], ['Halal certified', 'yes / no', 'Yes'], ['Storage', 'dropdown', 'Cool, dry place'], ['Net weight', 'number', '400 g'], ['BSTI licence', 'text', 'BSTI-FD-2024-1182']],  Phones: [['RAM', 'dropdown', '8 GB'], ['Network', 'dropdown', '5G'], ['Display size', 'number', '6.7 inch'], ['Battery', 'number', '5000 mAh'], ['PTA approved', 'yes / no', 'Yes'], ['Country of origin', 'text', 'Vietnam']],
  Sunscreen: [['Skin type', 'dropdown', 'Oily, combination'], ['SPF', 'number', '50'], ['Expiry date', 'date', '12 Aug 2028'], ['Key ingredients', 'text', 'Rice extract, probiotics'], ['Country of origin', 'text', 'South Korea'], ['Volume', 'number', '50 ml']],
  Toner: [['Skin type', 'dropdown', 'All skin types'], ['Expiry date', 'date', '3 Mar 2028'], ['Key ingredients', 'text', 'Hyaluronic acid, panthenol'], ['Country of origin', 'text', 'South Korea'], ['Volume', 'number', '150 ml'], ['Alcohol free', 'yes / no', 'Yes']],
  _: [['Material', 'text', ''], ['Country of origin', 'text', ''], ['Care instructions', 'text', '']] };
var WP = { brand1y: [['Period', '12 months'], ['Proof needed', 'Invoice + IMEI'], ['Claim at', 'Service centre, Mirpur 10']], shop6m: [['Period', '6 months'], ['Type', 'Shop service'], ['Claim at', 'Your shop']], rep7d: [['Period', '7 days'], ['Type', 'Replacement'], ['Claim at', 'Your shop']], elec2y: [['Period', '2 years'], ['Type', 'Parts + service'], ['Claim at', 'Brand centre']] };
var WPS = { brand1y: 'Delivery date', shop6m: 'Delivery date', rep7d: 'Delivery date', elec2y: 'Invoice date' };
var WPT = { brand1y: '12 months brand warranty. Covers manufacturing defects, battery below 80% health, and motherboard or display faults. Not covered: physical or liquid damage, phones opened by a third party, software issues after rooting. Repair first; replaced if it cannot be repaired within 15 days.', shop6m: 'We repair or replace parts at no cost for 6 months.', rep7d: 'Swap for a new piece within 7 days if faulty.', elec2y: 'Parts are free for 2 years; service is free for the first year.' };
var SG = { shirt: [['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)', 'Sleeve (in)'], [['S', '38', '27', '17', '8'], ['M', '40', '28', '18', '8.5'], ['L', '42', '29', '19', '9'], ['XL', '44', '30', '20', '9.5']]], kurti: [['Size', 'Bust (in)', 'Length (in)', 'Waist (in)', 'Hip (in)'], [['S', '34', '42', '30', '38'], ['M', '36', '43', '32', '40'], ['L', '38', '44', '34', '42'], ['XL', '40', '45', '36', '44']]], shoe: [['BD', 'EU', 'UK', 'Foot length (cm)', 'Width'], [['39', '39', '6', '24.5', 'Regular'], ['40', '40', '6.5', '25.1', 'Regular'], ['41', '41', '7.5', '25.8', 'Regular'], ['42', '42', '8', '26.4', 'Wide']]] };
var AIF = [['short', 'Short description'], ['long', 'Long description'], ['seo', 'SEO title and description'], ['tags', 'Tags'], ['faq', 'FAQ'], ['alt', 'Photo alt text']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); if (this.onResize) window.removeEventListener('resize', this.onResize); }
  componentDidMount() {
    var dom = domSnap(formEl());
    this.base = { dom: dom, key: JSON.stringify(dom), snap: this._snap, state: {} };
    var self = this; this.onResize = function () { self.measureStrip(); }; window.addEventListener('resize', this.onResize); this.measureStrip();
  }
  componentDidUpdate(prevProps, prevState) { this.checkDirty(); if (((prevState || {}).tab || 'validity') !== ((this.state || {}).tab || 'validity')) this.centerTab(); this.measureStrip(); }
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
    Object.keys(s).forEach(function (k) { if (k !== 'tab' && k !== 'stripL' && k !== 'stripR') p[k] = null; });
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
  // Step tabs: the strip scrolls sideways without a scrollbar; the arrows show only when there is more.
  measureStrip() {
    var el = document.getElementById('product-steps'); if (!el) return;
    var l = el.scrollLeft > 2, r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2, s = this.state || {};
    if (l !== !!s.stripL || r !== !!s.stripR) this.setState({ stripL: l, stripR: r });
  }
  centerTab() {
    var strip = document.getElementById('product-steps'), el = document.getElementById('ptab-' + ((this.state || {}).tab || 'validity'));
    if (!strip || !el) return;
    strip.scrollTo({ left: Math.max(0, el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2), behavior: 'smooth' });
    var box = strip.getBoundingClientRect(); if (box.top < 0 || box.bottom > window.innerHeight) strip.scrollIntoView({ block: 'nearest' });
  }
  renderVals() {
    var self = this, s = this.state || {};
    var ai = s.ai || {}, prev = s.prev || {};
    var f = function (k, d) { return s[k] != null ? s[k] : d; };
    var short = f('short', ''), long = f('long', 'Homemade mango pickle in mustard oil.'), seoT = f('seoT', 'Mango Pickle 400g'), seoD = f('seoD', ''), tags = f('tags', ['Pickle', 'Homemade']), faqs = f('faqs', []);
    var setAi = function (k, patch) { var p = assign({}, patch); var a = assign({}, ai); a[k] = true; p.ai = a; var pv = assign({}, prev); pv[k] = {}; Object.keys(patch).forEach(function (x) { pv[k][x] = s[x]; }); p.prev = pv; self.setState(p); };
    var gen = { short: function () { setAi('short', { short: AI_TXT.short }); }, long: function () { setAi('long', { long: AI_TXT.long }); }, seo: function () { setAi('seo', { seoT: AI_TXT.seoT, seoD: AI_TXT.seoD }); }, tags: function () { setAi('tags', { tags: ['Pickle', 'Achar', 'Mango', 'No preservatives', 'Homemade', 'Mustard oil'] }); }, faq: function () { setAi('faq', { faqs: FAQ_AI }); }, alt: function () { toast(self, 'Alt text written for 5 photos, for example “Mango pickle in a 400 g glass jar”.'); } };
    var keep = function (k) { return function () { var a = assign({}, ai); delete a[k]; self.setState({ ai: a }); }; };
    var undo = function (k) { return function () { var a = assign({}, ai); delete a[k]; var p = assign({ ai: a }, prev[k] || {}); self.setState(p); }; };
    var aiSel = s.aiSel || { short: true, long: true, seo: true, tags: true, faq: false, alt: false };
    var price = f('price', '৳350'), cost = f('cost', '৳190');
    var num = function (x) { return +(String(x).replace(/[^\d.]/g, '')) || 0; };
    var pr = num(price), co = num(cost), prof = pr - co;
    var cat = f('cat', 'Pickles'), catOpen = !!s.catOpen;
    var sn = f('sn', 'none'), imei = f('imei', '2'), wp = WP[f('wp', 'brand1y')] ? f('wp', 'brand1y') : 'brand1y', sg = SG[f('sg', 'none')] ? f('sg', 'none') : 'none';
    var hasW = mkSw(this, 'hasW', false);
    var wq = f('wq', 'no'), sq = f('sq', 'no'), snt = f('snt', 'imei2');
    var seg = function (opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); };
    var snLabel = sn === 'imei' ? 'IMEI numbers' : 'Serial numbers';
    var TABS = [['basics', 'Basics'], ['pricing', 'Pricing'], ['stock', 'Inventory'], ['validity', 'Validity'], ['variants', 'Variants'], ['track', 'Warranty'], ['details', 'Details'], ['ship', 'Shipping'], ['seo', 'SEO & FAQ']];
    var DONE = { basics: true, pricing: true, stock: true, variants: true };
    var tab = s.tab || 'validity', ti = 0; TABS.forEach(function (t, i) { if (t[0] === tab) ti = i; });
    var vm = s.vm || 'shelf', shelfN = s.shelfN != null ? s.shelfN : '1', shelfU = s.shelfU || 'months';
    var batches = s.batches || [['B-0912', '12 Sep 2026', '12 Oct 2026', 23, 84, 'Central Warehouse'], ['B-0901', '1 Sep 2026', '1 Oct 2026', 12, 38, 'Dhanmondi branch'], ['B-0822', '22 Aug 2026', '22 Sep 2026', 3, 6, 'Dhanmondi branch'], ['B-0810', '10 Aug 2026', '10 Sep 2026', -9, 4, 'Central Warehouse']];
    var v = {
      assistOpen: s.assistOpen == null ? true : s.assistOpen, assistBtn: (s.assistOpen == null || s.assistOpen) ? 'Hide' : 'Show', toggleAssist: function () { self.setState({ assistOpen: !(s.assistOpen == null || s.assistOpen) }); },
      facts: f('facts', 'Green mango, mustard oil, no preservatives, 400 g jar, lasts 1 month, BSTI approved'), typeFacts: function (e) { self.setState({ facts: e.target.value }); },
      aiFields: AIF.map(function (x) { var on = !!aiSel[x[0]]; return { label: x[1], on: on, cls: on ? 'chip on' : 'chip', pick: function () { var o = assign({}, aiSel); o[x[0]] = !on; self.setState({ aiSel: o }); } }; }),
      aiCount: AIF.filter(function (x) { return aiSel[x[0]]; }).length,
      runAssist: function () { var p = {}, a = assign({}, ai), pv = assign({}, prev); var add = function (k, patch) { a[k] = true; pv[k] = {}; Object.keys(patch).forEach(function (x) { pv[k][x] = s[x]; p[x] = patch[x]; }); };
        if (aiSel.short) add('short', { short: AI_TXT.short }); if (aiSel.long) add('long', { long: AI_TXT.long }); if (aiSel.seo) add('seo', { seoT: AI_TXT.seoT, seoD: AI_TXT.seoD }); if (aiSel.tags) add('tags', { tags: ['Pickle', 'Achar', 'Mango', 'No preservatives', 'Homemade', 'Mustard oil'] }); if (aiSel.faq) add('faq', { faqs: FAQ_AI });
        p.ai = a; p.prev = pv; p.assistOpen = false; self.setState(p); toast(self, 'AI filled ' + Object.keys(a).length + ' fields. Purple borders show what to check.'); },
      title: f('title', 'Mango Pickle (Aam Achar) 400g'), typeTitle: function (e) { self.setState({ title: e.target.value }); },
      short: short, typeShort: function (e) { self.setState({ short: e.target.value }); }, shortCount: short.length + ' / 160', shortBorder: ai.short ? '#a78bfa' : '#cbd5e1',
      long: long, typeLong: function (e) { self.setState({ long: e.target.value }); }, longBorder: ai.long ? '#a78bfa' : '#cbd5e1',
      ai: { short: !!ai.short, long: !!ai.long, seo: !!ai.seo, faq: !!ai.faq },
      aiShort: gen.short, aiLong: gen.long, aiSeo: gen.seo, aiTags: gen.tags, aiFaq: gen.faq, aiAlt: gen.alt,
      aiImprove: function () { setAi('long', { long: (long || '').replace(/^Official/, 'An official') + ' Sharper wording, same facts.' }); },
      aiBangla: function () { setAi('long', { long: long + AI_TXT.bangla }); },
      keep_short: keep('short'), keep_long: keep('long'), keep_seo: keep('seo'), keep_faq: keep('faq'), undo_short: undo('short'), undo_long: undo('long'), undo_seo: undo('seo'), undo_faq: undo('faq'),
      price: price, typePrice: function (e) { self.setState({ price: e.target.value }); }, cost: cost, typeCost: function (e) { self.setState({ cost: e.target.value }); },
      profit: bdt(prof), margin: pr ? Math.round(prof / pr * 100) + '%' : '—', profitColor: prof < 0 ? '#b83210' : '#047857', saves: bdt(420 - pr) + ' (' + Math.round((420 - pr) / 420 * 100) + '%)',
      barcode: f('barcode', '8941600200146'), typeBarcode: function (e) { self.setState({ barcode: e.target.value }); }, genBarcode: function () { self.setState({ barcode: '894150010' + (1000 + Math.floor(Math.random() * 8999)) }); toast(self, 'New EAN-13 barcode made. It is unique in your shop.'); },
      track: mkSw(this, 'track', true), fragile: mkSw(this, 'fragile', true), snRecv: mkSw(this, 'snRecv', true), snSale: mkSw(this, 'snSale', true), hasW: hasW,
      wqOpts: seg([['yes', 'Yes'], ['no', 'No']], wq, 'wq'), wYes: wq === 'yes', sqOpts: seg([['yes', 'Yes'], ['no', 'No']], sq, 'sq'), sYes: sq === 'yes',
      sntOpts: seg([['serial', 'Serial number'], ['imei1', '1 IMEI'], ['imei2', '2 IMEIs (dual SIM)']], snt, 'snt'), snCount: sq === 'yes' ? '—' : '—', wpStart: WPS[wp],
      wp: wp, setWp: function (e) { self.setState({ wp: e.target.value }); }, wpInfo: WP[wp].map(function (x) { return { k: x[0], v: x[1] }; }), wpText: WPT[wp],
      sg: sg, setSg: function (e) { self.setState({ sg: e.target.value }); }, hasSg: sg !== 'none', noSg: sg === 'none',
      sgHead: sg !== 'none' ? SG[sg][0].map(function (t) { return { t: t }; }) : [], sgRows: sg !== 'none' ? SG[sg][1].map(function (r) { return { c: r.map(function (t) { return { t: t }; }) }; }) : [],
      cfs: (CF[cat] || CF._).map(function (x) { return { l: x[0], type: '· ' + x[1], v: x[2] }; }),
      handle: 'mango-pickle-aam-achar-400g', seoTitle: seoT, seoDesc: seoD || 'Add a short description so people know what they will find.', typeSeoT: function (e) { self.setState({ seoT: e.target.value }); }, typeSeoD: function (e) { self.setState({ seoD: e.target.value }); }, seoTCount: seoT.length + ' of 70 letters',
      faqs: faqs.map(function (q) { return { q: q[0], a: q[1], cls: ai.faq ? 'fade' : '', border: ai.faq ? '#c4b5fd' : '#e6eaf0' }; }),
      status: f('status', 'active'), setStatus: function (e) { self.setState({ status: e.target.value }); },
      catPath: (PARENT[cat] ? PARENT[cat] + ' › ' : '') + cat, catOpen: catOpen, toggleCat: function () { self.setState({ catOpen: !catOpen }); },
      cats: CATS.map(function (c) { var on = c[0] === cat; return { name: c[0], n: c[2], pad: c[1] ? '28px' : '10px', fw: c[1] ? 400 : 600, bg: on ? 'rgba(0,48,135,.08)' : 'transparent', fg: on ? '#003087' : '#0f172a', pick: function () { self.setState({ cat: c[0], catOpen: false }); toast(self, 'Category set to ' + (PARENT[c[0]] ? PARENT[c[0]] + ' › ' : '') + c[0] + '. The extra fields changed to match.'); } }; }),
      tags: tags.map(function (t) { return { t: t, bg: ai.tags ? '#f3e8ff' : '#eef2f6', fg: ai.tags ? '#6d28d9' : '#334155', remove: function () { self.setState({ tags: tags.filter(function (x) { return x !== t; }) }); } }; }),
      checks: [['Title', true], ['Photos (4)', true], ['Short description', !!short], ['Price and cost', pr > 0 && co > 0], ['Category', true], ['Barcode', true], ['Expiry rule', mkSw(this, 'expires', true).on], ['SEO', !!seoD]].map(function (k) { return { l: k[0], bg: k[1] ? '#10b981' : '#cbd5e1', fg: k[1] ? '#0f172a' : '#94a3b8' }; }),
      tabs: TABS.map(function (t, i) { var on = t[0] === tab; var bad = FIELD_ORDER.some(function (k) { return (s.errors || {})[k] && FIELD_TAB[k] === t[0]; }); var done = DONE[t[0]] && !bad && (t[0] !== 'basics' || !!String(f('title', 'x')).trim()) && (t[0] !== 'pricing' || pr > 0); if (bad) return { l: t[1], n: i + 1, dn: false, bad: true, on: on, id: 'ptab-' + t[0], panel: 'ppanel-' + t[0], tabIndex: on ? 0 : -1, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#334155', dbg: 'var(--fill-danger)', dfg: '#fff', pick: function () { self.setState({ tab: t[0] }); } }; return { l: t[1], n: i + 1, dn: !!done && !on, bad: false, id: 'ptab-' + t[0], panel: 'ppanel-' + t[0], tabIndex: on ? 0 : -1, on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#334155', dbg: on ? 'rgba(255,255,255,.18)' : done ? '#10b981' : '#eef2f6', dfg: on || done ? '#fff' : '#475569', pick: function () { self.setState({ tab: t[0] }); } }; }),
      stepN: ti + 1, prevLbl: ti ? TABS[ti - 1][1] : 'Back', nextLbl: ti < TABS.length - 1 ? 'Next: ' + TABS[ti + 1][1] : 'Save product',
      prevTab: function () { if (ti) self.setState({ tab: TABS[ti - 1][0] }); }, nextTab: function () { if (ti < TABS.length - 1) self.setState({ tab: TABS[ti + 1][0] }); else v.submit(); },
      isFirst: ti === 0, isLast: ti === TABS.length - 1,
      tabKey: function (ev) {
        var n2 = ti; if (ev.key === 'ArrowRight') n2 = (ti + 1) % TABS.length; else if (ev.key === 'ArrowLeft') n2 = (ti + TABS.length - 1) % TABS.length; else if (ev.key === 'Home') n2 = 0; else if (ev.key === 'End') n2 = TABS.length - 1; else return;
        ev.preventDefault(); var k = TABS[n2][0]; self.setState({ tab: k }, function () { var el = document.getElementById('ptab-' + k); if (el) el.focus(); });
      },
      stripL: !!s.stripL, stripR: !!s.stripR, stripScroll: function () { self.measureStrip(); },
      stripBy: function (d) { return function () { var el = document.getElementById('product-steps'); if (el) el.scrollBy({ left: d * Math.max(160, el.clientWidth * 0.6), behavior: 'smooth' }); }; },
      expires: mkSw(this, 'expires', true), fefo: mkSw(this, 'fefo', true), showExp: mkSw(this, 'showExp', true), nearDisc: mkSw(this, 'nearDisc', true),
      vModes: seg([['shelf', 'Same shelf life for every batch'], ['batch', 'Enter the date for each batch']], vm, 'vm'), isShelf: vm === 'shelf', isBatch: vm === 'batch',
      shelfN: shelfN, typeShelf: function (e) { self.setState({ shelfN: e.target.value }); }, shelfU: shelfU, setShelfU: function (e) { self.setState({ shelfU: e.target.value }); },
      shelfEx: 'Made today → expires ' + (function () { var d = new Date(Date.UTC(2026, 8, 19)); var n = +shelfN || 0; if (shelfU === 'days') d.setUTCDate(d.getUTCDate() + n); else if (shelfU === 'weeks') d.setUTCDate(d.getUTCDate() + n * 7); else if (shelfU === 'months') d.setUTCMonth(d.getUTCMonth() + n); else d.setUTCFullYear(d.getUTCFullYear() + n); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); })(),
      batches: batches.map(function (b) { var tot = 30, left = b[3], p = Math.max(0, Math.min(100, left / tot * 100)); var st = left < 0 ? 'Expired' : left <= 3 ? 'Stopped · 3 days rule' : left <= 14 ? 'Expiring soon' : 'Fresh';
        return { no: b[0], made: b[1], exp: b[2], left: left < 0 ? 'Expired ' + (-left) + ' days ago' : left + ' days left', w: p + '%', c: left < 0 ? '#b83210' : left <= 7 ? '#d97706' : '#10b981', q: b[4], loc: b[5], st: st, sCls: left < 0 ? 'badge b-cancelled' : left <= 3 ? 'badge b-over' : left <= 14 ? 'badge b-approval' : 'badge b-received', cls: b[6] ? 'flash' : '' }; }),
      addBatch: function () { self.setState({ batches: [['B-0926', '19 Sep 2026', '19 Oct 2026', 30, 60, 'Central Warehouse', true]].concat(batches.map(function (x) { return x.slice(0, 6); })) }); toast(self, 'Batch B-0926 added. Expiry set by itself from the 1-month shelf life.'); },
      stepTotal: TABS.length
    };

    // ---- validation, unsaved changes and save ----
    var errs = s.errors || {};
    var check = function (draft) {
      var e = {}, t = String(v.title).trim();
      if (!t) e.title = 'Enter a product title.'; else if (t.length > 120) e.title = 'Keep the title under 120 letters.';
      var pe = moneyError(price, !draft, 'selling price'); if (pe) e.price = pe;
      var ce = moneyError(cost, false, 'buying price'); if (ce) e.cost = ce;
      if (v.expires.on && vm === 'shelf' && !(/^\d+$/.test(String(shelfN).trim()) && +shelfN > 0)) e.shelf = 'Enter how long it stays good as a whole number above 0.';
      return e;
    };
    var clr = function (k, fn) { return function (ev) { fn(ev); if (errs[k]) { var o = assign({}, errs); delete o[k]; self.setState({ errors: o }); } }; };
    v.typeTitle = clr('title', v.typeTitle); v.typePrice = clr('price', v.typePrice); v.typeCost = clr('cost', v.typeCost); v.typeShelf = clr('shelf', v.typeShelf);
    var trySave = function (draft, okMsg) {
      var e = check(draft), first = FIELD_ORDER.filter(function (k) { return e[k]; })[0];
      if (first) {
        var p = { errors: e }; p.tab = FIELD_TAB[first];
        self.setState(p, function () { var el = document.getElementById('pf-' + first); if (el) { el.focus(); if (el.scrollIntoView) el.scrollIntoView({ block: 'center' }); } });
        return;
      }
      self.setState({ errors: null }, function () { self.markSaved(); toast(self, okMsg); });
    };
    var errCount = Object.keys(errs).length;
    assign(v, {
      err: errs, hasErr: errCount > 0, errSummary: errCount === 1 ? '1 field needs fixing' : errCount + ' fields need fixing', dirty: !!s.dirty,
      submit: function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); trySave(false, 'Product saved and live on the online shop, POS and Facebook shop.'); },
      saveDraft: function () { trySave(true, 'Saved as a draft. Customers can’t see it yet.'); },
      discard: function () {
        __confirm({ title: 'Discard unsaved changes?', body: 'Every field goes back to how it was when you last saved.', confirmLabel: 'Discard changes', tone: 'danger' })
          .then(function (ok) { if (ok) { self.restore(); __toast('Changes discarded', { tone: 'info' }); } });
      },
      formInput: function () { self.checkDirty(); },
      // Enter in a single-line field must not save the whole product by accident.
      formKey: function (ev) { var t = ev.target; if (ev.key === 'Enter' && t && t.tagName === 'INPUT' && t.type !== 'checkbox' && t.type !== 'submit') ev.preventDefault(); }
    });
    this._snap = JSON.stringify([v.track.on, v.fragile.on, v.snRecv.on, v.snSale.on, v.hasW.on, v.expires.on, wq, sq, snt, cat, tags, faqs, v.fefo.on, v.showExp.on, v.nearDisc.on, vm, batches.length]);
    TABS.forEach(function (t) { v['is_' + t[0]] = t[0] === tab; });
    return assign(v, msgV(s));
  }
}

// ---- styles ----
// Kit classes (design-system.css › Index kit, records and forms) do the layout; these are the form's own parts
// (the same as Add product's) and the step strip.

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
.ap-ready{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.ap-ready li{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.ap-ready i{display:grid;flex:none;place-items:center;width:16px;height:16px;border-radius:var(--radius-full);color:#fff}
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
/* the step strip, the panels and Back / Next */
.apt-strip{display:flex;align-items:center;gap:4px;padding:6px}
.apt-steps{position:relative;display:flex;flex:1;gap:2px;min-width:0;overflow-x:auto;scrollbar-width:none} /* keeps the steps' screen-reader text inside the strip */
.apt-steps::-webkit-scrollbar{display:none}
.apt-step{flex:none}
.apt-n{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:var(--radius-full);background:var(--surface-quiet);color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.apt-step.is-done .apt-n{background:var(--success);color:#fff}
.apt-step.is-bad .apt-n{background:var(--fill-danger);color:#fff}
.apt-step[aria-selected="true"] .apt-n{background:var(--primary);color:#fff}
.apt-step:focus-visible{outline-offset:-3px}
.apt-panel{display:flex;flex-direction:column;gap:var(--space-4)}
.apt-panel[hidden]{display:none}
.apt-nav{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3)}
.apt-nav>span{flex:1;text-align:center;font-size:var(--text-xs-plus);color:var(--text-muted)}
.apt-life{display:block;width:96px;height:6px;border-radius:var(--radius-full);background:var(--surface-quiet);overflow:hidden}
.apt-life>span{display:block;height:100%;border-radius:var(--radius-full)}
.apt-life+small{display:block;margin-top:3px;font-size:var(--text-xs);font-weight:var(--weight-medium)}
@media (max-width:640px){
  .apt-nav{flex-wrap:wrap}
  .apt-nav>span{order:-1;flex:1 1 100%}
  .apt-nav>.ix-btn{flex:1 1 0;min-width:0}
}
`;

// ---- markup ----

// The tab version of Shopify's product page: the same header (back, title, Save) and the same right column; the
// left column shows one section at a time behind a strip of numbered steps, with Back / Next under it. Every
// panel stays in the page (hidden when not chosen), so unsaved-changes tracking sees every field.
const BATCH_TONE = { Expired: 'error', 'Stopped · 3 days rule': 'error', 'Expiring soon': 'warning', Fresh: 'success' };

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
  return <button type="button" role="switch" aria-checked={!!(sw && sw.on)} aria-label={label} className="gc-switch" onClick={sw && sw.toggle}><span className="gc-switch__knob" /></button>;
}
function Seg({ opts, labelledBy }) {
  return (
    <div className="gc-seg" role="group" aria-labelledby={labelledBy}>
      {__list(opts).map((o, i) => <button key={i} type="button" className={'gc-seg__btn' + (o.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!o.on} onClick={o.pick}>{o.l}</button>)}
    </div>
  );
}
function Err({ id, text }) {
  return text ? <span id={id} className="ap-err" role="alert"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{text}</span> : null;
}
function Panel({ id, on, children }) {
  return <div role="tabpanel" id={'ppanel-' + id} aria-labelledby={'ptab-' + id} hidden={!on} className={'apt-panel' + (on ? ' ap-fade' : '')}>{children}</div>;
}

export default class AddProductTabsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AddProductTabs">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="products-add" />
          <main className="gc-shell__main">
            <__Topbar crumb="Products / All products" page="Add product · tab view" placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader back="/all-products" title="Add product · tab view"
                  about="Connected to Purchase, Stock and POS — you never enter stock twice."
                  secondary={[{ label: 'Save as draft', onClick: v.saveDraft }]}
                  primary={{ label: 'Save product', onClick: v.submit }} />

                <form id="product-form" className="ix-record ap-form" noValidate aria-label="Add product" onSubmit={v.submit} onInput={v.formInput} onChange={v.formInput} onKeyDown={v.formKey}>
                  <div className="ix-main">
                    {/* the steps: scroll sideways, arrows only when there is more */}
                    <div className="ix-card apt-strip">
                      {v.stripL ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" tabIndex={-1} aria-label="Scroll the steps left" onClick={v.stripBy(-1)}><__Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button> : null}
                      <div id="product-steps" className="apt-steps" role="tablist" aria-label="Product sections" onKeyDown={v.tabKey} onScroll={v.stripScroll}>
                        {__list(v.tabs).map((tb, i) => (
                          <button key={i} type="button" role="tab" id={tb.id} className={'ix-tab apt-step' + (tb.dn ? ' is-done' : '') + (tb.bad ? ' is-bad' : '')} aria-selected={!!tb.on} aria-controls={tb.panel} tabIndex={tb.tabIndex} onClick={tb.pick}>
                            <span className="apt-n">{tb.dn ? <__Icon name="check" width="12" height="12" strokeWidth="3" aria-hidden="true" /> : tb.n}</span>{tb.l}
                            {tb.dn ? <span className="sr-only">, completed</span> : null}{tb.bad ? <span className="sr-only">, has an error</span> : null}
                          </button>
                        ))}
                      </div>
                      {v.stripR ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" tabIndex={-1} aria-label="Scroll the steps right" onClick={v.stripBy(1)}><__Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button> : null}
                    </div>

                    <Panel id="basics" on={v.is_basics}>
                      <section className="ix-card" aria-labelledby="apt-h-desc">
                        <div className="ix-card__head">
                          <h2 id="apt-h-desc">Title and description</h2>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain ap-ai" onClick={v.toggleAssist} aria-expanded={v.assistOpen} aria-controls={v.assistOpen ? "ai-assist-panel" : undefined} aria-label={`${v.assistBtn ?? ""} the AI writing assistant`}>
                            <__Icon name="sparkles" width="16" height="16" aria-hidden="true" />AI writing assistant<__Icon name={v.assistOpen ? "chevron-up" : "chevron-down"} width="14" height="14" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="ix-card__body ap-body">
                          {v.assistOpen ? (
                            <div id="ai-assist-panel" data-nodirty="" className="ap-assist ap-fade">
                              <p className="ap-help">Tell it a few facts. Pick the fields you want filled. You check every word before saving.</p>
                              <div className="ap-field">
                                <div className="ap-lbl"><label className="gc-label" htmlFor="apt-facts">Key facts about the product</label><__InfoTip text="For example: 6.7 inch AMOLED, 5000 mAh, 1 year official warranty, PTA approved." /></div>
                                <input id="apt-facts" className="gc-input" value={v.facts} onInput={v.typeFacts} onChange={v.typeFacts} aria-label="Key facts" />
                              </div>
                              <div className="ix-chips" style={{ alignItems: "center" }}>
                                <span className="ap-sub">Fill these:</span>
                                {__list(v.aiFields).map((c, i) => <button key={i} type="button" className="ix-chip" aria-pressed={!!c.on} onClick={c.pick}>{c.on ? <__Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{c.label}</button>)}
                              </div>
                              <div className="ap-row">
                                <select className="gc-input gc-select" aria-label="Language"><option>English</option><option>বাংলা</option><option>English + বাংলা</option></select>
                                <select className="gc-input gc-select" aria-label="Tone"><option>Premium</option><option>Friendly</option><option>Simple and short</option></select>
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
                              <label className="gc-label" htmlFor="apt-short">Short description</label>
                              <__InfoTip text="Shown next to the price and in search results. One or two lines." />
                              <span className="ap-count ap-push">{v.shortCount}</span>
                              <AiBtn onClick={v.aiShort}>Write with AI</AiBtn>
                            </div>
                            <textarea id="apt-short" className={'gc-input' + (v.ai?.short ? ' ap-ai-on' : '')} rows="2" value={v.short} onInput={v.typeShort} onChange={v.typeShort} aria-label="Short description" />
                            {v.ai?.short ? <AiCheck onKeep={v.keep_short} onUndo={v.undo_short} /> : null}
                          </div>
                          <div className="ap-field">
                            <div className="ap-lbl">
                              <label className="gc-label" htmlFor="apt-long">Long description</label>
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
                              <textarea id="apt-long" className={'gc-input' + (v.ai?.long ? ' ap-ai-on' : '')} rows="7" value={v.long} onInput={v.typeLong} onChange={v.typeLong} aria-label="Long description" style={{ fontFamily: "var(--font-sans), var(--font-bn)" }} />
                            </div>
                            {v.ai?.long ? <AiCheck onKeep={v.keep_long} onUndo={v.undo_long} /> : null}
                          </div>
                        </div>
                      </section>
                      <section className="ix-card" aria-labelledby="apt-h-media">
                        <div className="ix-card__head">
                          <h2 id="apt-h-media">Media <__InfoTip text="Drag to reorder. The first photo is the cover." /></h2>
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
                    </Panel>

                    <Panel id="pricing" on={v.is_pricing}>
                      <section className="ix-card" aria-labelledby="apt-h-price">
                        <div className="ix-card__head"><h2 id="apt-h-price">Pricing</h2></div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-grid2">
                            <div className="ap-field">
                              <label className="gc-label" htmlFor="pf-price">Selling price <span className="ap-req" aria-hidden="true">*</span></label>
                              <input className="gc-input ap-num" inputMode="decimal" value={v.price} onInput={v.typePrice} onChange={v.typePrice} aria-label="Selling price" id="pf-price" aria-required="true" aria-invalid={v.err?.price ? "true" : undefined} aria-describedby={v.err?.price ? "pf-price-err" : undefined} />
                              <Err id="pf-price-err" text={v.err?.price} />
                            </div>
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="apt-mrp">MRP (compare-at price)</label><__InfoTip text="Shown crossed out" /></div>
                              <input id="apt-mrp" className="gc-input ap-num" defaultValue="৳420" aria-label="MRP" />
                            </div>
                            <div className="ap-field">
                              <div className="ap-lbl"><label className="gc-label" htmlFor="pf-cost">Buying price (cost)</label><__InfoTip text="Customers never see this" /></div>
                              <input className="gc-input ap-num" inputMode="decimal" value={v.cost} onInput={v.typeCost} onChange={v.typeCost} aria-label="Buying price" id="pf-cost" aria-invalid={v.err?.cost ? "true" : undefined} aria-describedby={v.err?.cost ? "pf-cost-err" : undefined} />
                              <Err id="pf-cost-err" text={v.err?.cost} />
                            </div>
                            <label className="ap-field">
                              <span className="gc-label">VAT / tax</span>
                              <select className="gc-input gc-select" aria-label="Tax rate"><option>Standard VAT 15%</option><option>Reduced 7.5%</option><option>No VAT</option></select>
                            </label>
                          </div>
                          <div className="ap-figs">
                            <div className="ap-fig"><span>Profit per piece</span><b style={{ color: v.profitColor }}>{v.profit}</b></div>
                            <div className="ap-fig"><span>Margin</span><b style={{ color: v.profitColor }}>{v.margin}</b></div>
                            <div className="ap-fig"><span>Customer saves</span><b>{v.saves}</b></div>
                          </div>
                          <div className="ap-grid2">
                            <label className="ap-field"><span className="gc-label">Wholesale price</span><input className="gc-input ap-num" defaultValue="৳300" aria-label="Wholesale price" /></label>
                            <label className="ap-field"><span className="gc-label">Wholesale from</span><input className="gc-input ap-num" defaultValue="12 jars" aria-label="Wholesale minimum" /></label>
                          </div>
                        </div>
                      </section>
                    </Panel>

                    <Panel id="stock" on={v.is_stock}>
                      <section className="ix-card" aria-labelledby="apt-h-inv">
                        <div className="ix-card__head">
                          <h2 id="apt-h-inv">Inventory <__InfoTip text="Connected to Purchase, Stock and POS. Batches and expiry dates are in the next tab." /></h2>
                          <__Link href="/stock">Stock history</__Link>
                        </div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-grid2">
                            <label className="ap-field"><span className="gc-label">SKU</span><input className="gc-input ap-mono" defaultValue="FD-PKL-400" aria-label="SKU" /></label>
                            <div className="ap-field">
                              <label className="gc-label" htmlFor="apt-barcode">Barcode (EAN-13)</label>
                              <div className="ap-row" style={{ flexWrap: "nowrap" }}>
                                <input id="apt-barcode" className="gc-input ap-mono ap-grow" value={v.barcode} onInput={v.typeBarcode} onChange={v.typeBarcode} aria-label="Barcode" />
                                <button type="button" className="ix-btn" onClick={v.genBarcode}><__Icon name="hash" width="16" height="16" aria-hidden="true" />Make one</button>
                                <__Link href="/barcode-labels" className="ix-btn ix-btn--icon" aria-label="Label" title="Label"><__Icon name="printer" width="16" height="16" aria-hidden="true" /></__Link>
                              </div>
                            </div>
                          </div>
                          <div className="ap-switch">
                            <span>Track stock for this product<__InfoTip text="Stock goes up with purchase orders and returns, down with sales and damage" /></span>
                            <Switch sw={v.track} label="Track stock for this product" />
                          </div>
                          <div className="ix-table-wrap ix-table-wrap--show">
                            <table className="ix-table ix-table--static ap-tbl">
                              <thead><tr><th scope="col">Location</th><th scope="col" className="ix-num">Available</th><th scope="col" className="ix-num">Reserved for orders</th><th scope="col" className="ix-num">Opening stock</th></tr></thead>
                              <tbody>
                                <tr><td>Central Warehouse</td><td className="ix-num ix-strong">86</td><td className="ix-num ix-muted">3</td><td className="ix-num"><input className="gc-input ap-num" defaultValue="0" aria-label="Opening stock Central Warehouse" style={{ width: "88px" }} /></td></tr>
                                <tr><td>Dhanmondi branch</td><td className="ix-num ix-strong">40</td><td className="ix-num ix-muted">1</td><td className="ix-num"><input className="gc-input ap-num" defaultValue="0" aria-label="Opening stock Dhanmondi branch" style={{ width: "88px" }} /></td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="ap-row">
                            <span style={{ fontSize: "var(--text-sm)" }}>Alert me when stock is below</span>
                            <input className="gc-input ap-num" defaultValue="5" aria-label="Low stock alert" style={{ width: "72px" }} />
                          </div>
                          <label className="ap-row" style={{ fontSize: "var(--text-sm)", color: "var(--text-heading)", cursor: "pointer" }}><input type="checkbox" className="gc-check" />Keep selling when out of stock (pre-order)</label>
                        </div>
                      </section>
                    </Panel>

                    <Panel id="validity" on={v.is_validity}>
                      <section className="ix-card" aria-labelledby="apt-h-exp">
                        <div className="ix-card__head"><h2 id="apt-h-exp">Product validity (expiry) <__InfoTip text="Tell the system how long the product stays good. It warns you, stops sales in time and moves expired stock to disposal." /></h2></div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-switch">
                            <span>This product expires<__InfoTip text="Food, medicine, cosmetics — anything with a best-before or expiry date" /></span>
                            <Switch sw={v.expires} label="This product expires" />
                          </div>
                          {v.expires?.on ? (
                            <div className="ap-body ap-fade">
                              <div className="ap-field">
                                <span className="gc-label" id="apt-vm">How is the expiry date set?</span>
                                <Seg opts={v.vModes} labelledBy="apt-vm" />
                              </div>
                              {v.isShelf ? (
                                <div className="ap-panel ap-fade">
                                  <div className="ap-row">
                                    <span style={{ fontSize: "var(--text-sm)" }}>Every batch lasts</span>
                                    <input className="gc-input ap-num" inputMode="numeric" value={v.shelfN} onInput={v.typeShelf} onChange={v.typeShelf} aria-label="Shelf life" id="pf-shelf" aria-required="true" aria-invalid={v.err?.shelf ? "true" : undefined} aria-describedby={v.err?.shelf ? "pf-shelf-err" : undefined} style={{ width: "64px", textAlign: "center" }} />
                                    <select className="gc-input gc-select" value={v.shelfU} onChange={v.setShelfU} aria-label="Shelf life unit" style={{ width: "112px" }}>
                                      <option value="days">days</option><option value="weeks">weeks</option><option value="months">months</option><option value="years">years</option>
                                    </select>
                                    <span style={{ fontSize: "var(--text-sm)" }}>from its</span>
                                    <select className="gc-input gc-select" aria-label="Counted from" style={{ width: "150px" }}><option>making date</option><option>receiving date</option><option>opening date</option></select>
                                  </div>
                                  <Err id="pf-shelf-err" text={v.err?.shelf} />
                                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--primary)" }}>{v.shelfEx}</span>
                                </div>
                              ) : null}
                              {v.isBatch ? <p className="ap-panel ap-fade" style={{ margin: 0, fontSize: "var(--text-sm)" }}>Staff type or scan the expiry date printed on the pack each time goods arrive. Good for imported items with different dates.</p> : null}
                              <div className="ap-grid2">
                                <div className="ap-field">
                                  <div className="ap-lbl"><label className="gc-label" htmlFor="apt-stop">Stop selling</label><__InfoTip text="Hidden from the website and blocked at the POS" /></div>
                                  <select id="apt-stop" className="gc-input gc-select" aria-label="Stop selling"><option>3 days before expiry</option><option>On the expiry date</option><option>7 days before expiry</option><option>1 day before expiry</option></select>
                                </div>
                                <div className="ap-field">
                                  <div className="ap-lbl"><label className="gc-label" htmlFor="apt-warn">Warn me</label><__InfoTip text={"Shows in Expiry & disposal and on the dashboard"} /></div>
                                  <select id="apt-warn" className="gc-input gc-select" aria-label="Warn before"><option>14 days before expiry</option><option>7 days before</option><option>30 days before</option></select>
                                </div>
                              </div>
                              <div className="ap-switch">
                                <span>Sell the oldest first<__InfoTip text="Picking and POS always take the batch that expires first" /></span>
                                <Switch sw={v.fefo} label="Sell the oldest first" />
                              </div>
                              <div className="ap-switch">
                                <span>Show the expiry date to customers<__InfoTip text="On the product page, invoice and shelf label" /></span>
                                <Switch sw={v.showExp} label="Show the expiry date to customers" />
                              </div>
                              <div className="ap-switch">
                                <span>Auto discount near expiry<__InfoTip text="Clears stock before it goes bad" /></span>
                                <Switch sw={v.nearDisc} label="Auto discount near expiry" />
                              </div>
                              {v.nearDisc?.on ? (
                                <div className="ap-row ap-fade" style={{ fontSize: "var(--text-sm)" }}>
                                  <select className="gc-input gc-select" aria-label="Discount" style={{ width: "120px" }}><option>20% off</option><option>10% off</option><option>30% off</option><option>50% off</option></select>
                                  <span>when</span>
                                  <select className="gc-input gc-select" aria-label="Days left" style={{ width: "160px" }}><option>7 days are left</option><option>5 days are left</option><option>10 days are left</option></select>
                                </div>
                              ) : null}
                              <div className="ap-row">
                                <span className="ap-sub ap-grow">Batches in stock</span>
                                <button type="button" className="ix-btn ix-btn--sm" onClick={v.addBatch}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add batch</button>
                                <__Link href="/expiry-disposal" className="ix-btn ix-btn--sm">{"Expiry & disposal"}</__Link>
                              </div>
                              <div className="ix-table-wrap ix-table-wrap--show">
                                <table className="ix-table ix-table--static ap-tbl gc-table--keep">
                                  <thead><tr><th scope="col">Batch</th><th scope="col">Made on</th><th scope="col">Expires</th><th scope="col">Life left</th><th scope="col" className="ix-num">Qty</th><th scope="col">Where</th><th scope="col">Status</th></tr></thead>
                                  <tbody>
                                    {__list(v.batches).map((b, i) => (
                                      <tr key={i} className={b.cls ? 'ap-fade' : ''}>
                                        <td className="ap-mono ix-nowrap">{b.no}</td>
                                        <td className="ix-nowrap">{b.made}</td>
                                        <td className="ix-nowrap">{b.exp}</td>
                                        <td><span className="apt-life"><span style={{ width: b.w, background: b.c }} /></span><small style={{ color: b.c }}>{b.left}</small></td>
                                        <td className="ix-num">{b.q}</td>
                                        <td className="ix-muted">{b.loc}</td>
                                        <td><__StatusBadge tone={BATCH_TONE[b.st] || 'neutral'}>{b.st}</__StatusBadge></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </section>
                    </Panel>

                    <Panel id="variants" on={v.is_variants}>
                      <section className="ix-card" aria-labelledby="apt-h-var">
                        <div className="ix-card__head">
                          <h2 id="apt-h-var">Variants</h2>
                          <button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add option</button>
                        </div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-opt">
                            <__Icon name="grip-vertical" width="16" height="16" aria-hidden="true" style={{ color: "var(--text-muted)", flex: "none" }} />
                            <b>Size</b><span>400 g</span><span>1 kg</span>
                          </div>
                          <div className="ix-table-wrap ix-table-wrap--show">
                            <table className="ix-table ix-table--static ap-tbl">
                              <thead><tr><th scope="col">Variant</th><th scope="col" className="ix-num">Price</th><th scope="col" className="ix-num">Stock</th><th scope="col">SKU</th><th scope="col">Barcode</th></tr></thead>
                              <tbody>
                                <tr><td>400 g jar</td><td className="ix-num">৳350</td><td className="ix-num">126</td><td className="ap-mono ix-muted">FD-PKL-400</td><td className="ap-mono ix-muted">8941600200146</td></tr>
                                <tr><td>1 kg jar</td><td className="ix-num">৳780</td><td className="ix-num">48</td><td className="ap-mono ix-muted">FD-PKL-1K</td><td className="ap-mono ix-muted">8941600200153</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </section>
                    </Panel>

                    <Panel id="track" on={v.is_track}>
                      <section className="ix-card" aria-labelledby="apt-h-war">
                        <div className="ix-card__head"><h2 id="apt-h-war">Warranty and serial numbers</h2></div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-q">
                            <span id="apt-q-war">Does this product come with a warranty?</span>
                            <Seg opts={v.wqOpts} labelledBy="apt-q-war" />
                          </div>
                          {v.wYes ? (
                            <div className="ap-panel ap-fade">
                              <div className="ap-grid2">
                                <div className="ap-field">
                                  <div className="ap-lbl"><label className="gc-label" htmlFor="apt-wp">Warranty policy</label><__InfoTip text="Written once in Stock › Warranty policies" /></div>
                                  <select id="apt-wp" className="gc-input gc-select" value={v.wp} onChange={v.setWp} aria-label="Warranty policy">
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
                              <dl className="ix-kv">{__list(v.wpInfo).map((w, i) => (<React.Fragment key={i}><dt>{w.k}</dt><dd>{w.v}</dd></React.Fragment>))}</dl>
                              <div className="ap-field">
                                <div className="ap-lbl"><label className="gc-label" htmlFor="apt-wtext">Warranty description for this product</label><__InfoTip text="Shown on the product page under the price, with a link to the full policy. Filled from the policy — change it only if this product is different." /></div>
                                <textarea id="apt-wtext" className="gc-input" rows="3" aria-label="Warranty description" defaultValue={`${v.wpText ?? ""}`} />
                              </div>
                              <div className="ap-links"><__Link href="/warranty-policies">Open warranty policies</__Link><span className="ix-muted">Printed on the invoice and warranty card</span></div>
                            </div>
                          ) : null}
                          <hr className="ap-sep" />
                          <div className="ap-q">
                            <span id="apt-q-sn">Does each piece have its own serial or IMEI number?<__InfoTip text="Phones, laptops, TVs — so you know exactly which piece was sold" /></span>
                            <Seg opts={v.sqOpts} labelledBy="apt-q-sn" />
                          </div>
                          {v.sYes ? (
                            <div className="ap-panel ap-fade">
                              <div className="ap-row"><span className="gc-label" id="apt-snt" style={{ margin: 0 }}>Which number?</span><Seg opts={v.sntOpts} labelledBy="apt-snt" /></div>
                              <div className="ap-row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                                <div className="ap-grow" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <p className="ap-help" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>You do not type the numbers here. Staff scan them in <b>Stock</b> when goods arrive, and the POS asks for the number at sale.</p>
                                  <div className="ap-links"><__Link href="/receive-goods">Receive goods</__Link><__Link href="/warranty-claims">Serial number register</__Link></div>
                                </div>
                                <span className="ap-sncount"><b>{v.snCount}</b><span>in stock now</span></span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </section>
                    </Panel>

                    <Panel id="details" on={v.is_details}>
                      <section className="ix-card" aria-labelledby="apt-h-more">
                        <div className="ix-card__head">
                          <h2 id="apt-h-more">More details <__InfoTip text="These fields come from the category. Change the category and the fields change with it." /></h2>
                          <__Link href="/catalog-setup">Manage custom fields</__Link>
                        </div>
                        <div className="ix-card__body ap-body">
                          <span><__StatusBadge tone="info" icon="folder">From “Grocery › Pickles”</__StatusBadge></span>
                          <div className="ap-grid2">
                            {__list(v.cfs).map((f, i) => (
                              <label key={i} className="ap-field"><span className="gc-label">{f.l} <span className="ix-muted" style={{ fontWeight: "var(--weight-regular)" }}>{f.type}</span></span><input className="gc-input" defaultValue={f.v} aria-label={f.l} /></label>
                            ))}
                          </div>
                          <div><button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a field just for this product</button></div>
                        </div>
                      </section>
                      <section className="ix-card" aria-labelledby="apt-h-sg">
                        <div className="ix-card__head">
                          <h2 id="apt-h-sg">Size guide {v.noSg ? <__InfoTip text="Not needed for phones. Clothing and shoes should have one — it cuts returns." /> : null}</h2>
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
                                <tbody>{__list(v.sgRows).map((r, i) => <tr key={i}>{__list(r.c).map((cc, j) => <td key={j} className="ap-num">{cc.t}</td>)}</tr>)}</tbody>
                              </table>
                            </div>
                          ) : null}
                        </div>
                      </section>
                    </Panel>

                    <Panel id="ship" on={v.is_ship}>
                      <section className="ix-card" aria-labelledby="apt-h-ship">
                        <div className="ix-card__head"><h2 id="apt-h-ship">Shipping</h2></div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-grid2">
                            <label className="ap-field"><span className="gc-label">Weight</span><input className="gc-input ap-num" defaultValue="0.52 kg" aria-label="Weight" /></label>
                            <label className="ap-field"><span className="gc-label">Length</span><input className="gc-input ap-num" defaultValue="9 cm" aria-label="Length" /></label>
                            <label className="ap-field"><span className="gc-label">Width</span><input className="gc-input ap-num" defaultValue="9 cm" aria-label="Width" /></label>
                            <label className="ap-field"><span className="gc-label">Height</span><input className="gc-input ap-num" defaultValue="12 cm" aria-label="Height" /></label>
                          </div>
                          <div className="ap-switch">
                            <span>Fragile — glass jar<__InfoTip text="Printed on the courier label" /></span>
                            <Switch sw={v.fragile} label="Fragile — glass jar" />
                          </div>
                        </div>
                      </section>
                    </Panel>

                    <Panel id="seo" on={v.is_seo}>
                      <section className="ix-card" aria-labelledby="apt-h-seo">
                        <div className="ix-card__head"><h2 id="apt-h-seo">Search engine listing</h2><AiBtn onClick={v.aiSeo}>Write with AI</AiBtn></div>
                        <div className="ix-card__body ap-body">
                          <div className="ap-serp"><small>gridshop.com.bd › products › {v.handle}</small><b>{v.seoTitle}</b><span>{v.seoDesc}</span></div>
                          <div className="ap-field">
                            <div className="ap-lbl"><label className="gc-label" htmlFor="apt-seot">Page title</label><span className="ap-count ap-push">{v.seoTCount}</span></div>
                            <input id="apt-seot" className={'gc-input' + (v.ai?.seo ? ' ap-ai-on' : '')} value={v.seoTitle} onInput={v.typeSeoT} onChange={v.typeSeoT} aria-label="Page title" />
                          </div>
                          <div className="ap-field">
                            <label className="gc-label" htmlFor="apt-seod">Meta description</label>
                            <textarea id="apt-seod" className={'gc-input' + (v.ai?.seo ? ' ap-ai-on' : '')} rows="2" value={v.seoDesc} onInput={v.typeSeoD} onChange={v.typeSeoD} aria-label="Meta description" />
                          </div>
                          {v.ai?.seo ? <AiCheck onKeep={v.keep_seo} onUndo={v.undo_seo} /> : null}
                        </div>
                      </section>
                      <section className="ix-card" aria-labelledby="apt-h-faq">
                        <div className="ix-card__head">
                          <h2 id="apt-h-faq">Product FAQ <__InfoTip text="Shown on the product page. Answers the questions customers ask most." /></h2>
                          <AiBtn onClick={v.aiFaq}>Suggest with AI</AiBtn>
                        </div>
                        <div className="ix-card__body ap-body" style={{ gap: "var(--space-2)" }}>
                          {__list(v.faqs).map((q, i) => (
                            <div key={i} className={'ap-faq' + (q.cls ? ' ap-fade' : '')} style={{ borderColor: v.ai?.faq ? 'var(--viz-7)' : undefined }}><b>{q.q}</b><span>{q.a}</span></div>
                          ))}
                          {v.ai?.faq ? <AiCheck onKeep={v.keep_faq} onUndo={v.undo_faq} /> : null}
                          <div><button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add a question</button></div>
                        </div>
                      </section>
                    </Panel>

                    {/* back / next through the steps */}
                    <div className="ix-card apt-nav">
                      <button type="button" className="ix-btn" onClick={v.prevTab} disabled={v.isFirst}><__Icon name="chevron-left" width="16" height="16" aria-hidden="true" /><span>{v.prevLbl}</span></button>
                      <span>Step {v.stepN} of {v.stepTotal} · you can jump to any tab</span>
                      <button type="button" className="ix-btn ix-btn--primary" onClick={v.nextTab}><span>{v.nextLbl}</span><__Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
                    </div>

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

                  <aside className="ix-side">
                    <section className="ix-card" aria-labelledby="apt-h-status">
                      <div className="ix-card__head"><h2 id="apt-h-status">Status</h2></div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-3)" }}>
                        <select className="gc-input gc-select" value={v.status} onChange={v.setStatus} aria-label="Status">
                          <option value="active">Active — customers can buy</option>
                          <option value="draft">Draft — hidden</option>
                          <option value="scheduled">Go live on a date</option>
                        </select>
                        <div className="ap-field">
                          <span className="gc-label">Sell on</span>
                          <label className="ap-row" style={{ fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" className="gc-check" defaultChecked={true} />Online shop</label>
                          <label className="ap-row" style={{ fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" className="gc-check" defaultChecked={true} />POS counter</label>
                          <label className="ap-row" style={{ fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" className="gc-check" defaultChecked={true} />Facebook shop</label>
                          <label className="ap-row" style={{ fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" className="gc-check" defaultChecked={false} />Seller marketplace</label>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="apt-h-org">
                      <div className="ix-card__head"><h2 id="apt-h-org">Organisation</h2></div>
                      <div className="ix-card__body ap-body" style={{ gap: "var(--space-3)" }}>
                        <div className="ap-field">
                          <div className="ap-lbl"><span className="gc-label">Category</span><__InfoTip text="Sets the tax, the extra fields and where it shows in your shop menu." /></div>
                          <button type="button" onClick={v.toggleCat} aria-expanded={v.catOpen} aria-label={`Category: ${v.catPath ?? ""}`} className="gc-input ap-pick">
                            <__Icon name="folder" width="16" height="16" aria-hidden="true" /><span>{v.catPath}</span><__Icon name="chevron-down" width="16" height="16" aria-hidden="true" />
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
                          <select className="gc-input gc-select" aria-label="Brand"><option>Ruchi</option><option>Pran</option><option>GridShop Kitchen</option><option>Add a brand…</option></select>
                        </label>
                        <div className="ap-grid2">
                          <label className="ap-field">
                            <span className="gc-label">Unit</span>
                            <select className="gc-input gc-select" aria-label="Unit"><option>Jar</option><option>Piece</option><option>kg</option><option>Litre</option><option>Pack</option></select>
                          </label>
                          <label className="ap-field">
                            <span className="gc-label">Sold by</span>
                            <select className="gc-input gc-select" aria-label="Sold by"><option>Own product</option><option>Nanir Ranna (seller)</option></select>
                          </label>
                        </div>
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
                          <select className="gc-input gc-select" aria-label="Collections"><option>New arrivals, Eid picks</option></select>
                        </label>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="apt-h-ready">
                      <div className="ix-card__head"><h2 id="apt-h-ready">Ready to sell?</h2></div>
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
