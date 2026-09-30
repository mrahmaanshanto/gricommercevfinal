'use client';
// Generated from design/templates/products/AddProductTabs.dc.html by scripts/convert-design.mjs.
// Add product · tabs version — Products — Add product (tabs).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }

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
  componentWillUnmount() { clearTimeout(this.t); }
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
    var TABS = [['basics', 'Basics'], ['pricing', 'Pricing'], ['stock', 'Inventory'], ['validity', 'Validity & batches'], ['variants', 'Variants'], ['track', 'Warranty & serial'], ['details', 'Details'], ['ship', 'Shipping'], ['seo', 'SEO & FAQ']];
    var DONE = { basics: true, pricing: true, stock: true, variants: true };
    var tab = s.tab || 'validity', ti = 0; TABS.forEach(function (t, i) { if (t[0] === tab) ti = i; });
    var vm = s.vm || 'shelf', shelfN = s.shelfN != null ? s.shelfN : '1', shelfU = s.shelfU || 'months';
    var batches = s.batches || [['B-0912', '12 Sep 2026', '12 Oct 2026', 23, 84, 'Central Warehouse'], ['B-0901', '1 Sep 2026', '1 Oct 2026', 12, 38, 'Dhanmondi shop'], ['B-0822', '22 Aug 2026', '22 Sep 2026', 3, 6, 'Dhanmondi shop'], ['B-0810', '10 Aug 2026', '10 Sep 2026', -9, 4, 'Central Warehouse']];
    var v = {
      assistOpen: s.assistOpen == null ? true : s.assistOpen, assistBtn: (s.assistOpen == null || s.assistOpen) ? 'Hide' : 'Open', toggleAssist: function () { self.setState({ assistOpen: !(s.assistOpen == null || s.assistOpen) }); },
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
      saveHint: 'Unsaved changes',
      tabs: TABS.map(function (t, i) { var on = t[0] === tab; var done = DONE[t[0]]; return { l: t[1], n: done && !on ? '✓' : i + 1, on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#334155', dbg: on ? 'rgba(255,255,255,.18)' : done ? '#10b981' : '#eef2f6', dfg: on || done ? '#fff' : '#475569', pick: function () { self.setState({ tab: t[0] }); } }; }),
      stepN: ti + 1, prevLbl: ti ? TABS[ti - 1][1] : 'Back', nextLbl: ti < TABS.length - 1 ? 'Next: ' + TABS[ti + 1][1] : 'Save product',
      prevTab: function () { if (ti) self.setState({ tab: TABS[ti - 1][0] }); }, nextTab: function () { if (ti < TABS.length - 1) self.setState({ tab: TABS[ti + 1][0] }); else toast(self, 'Product saved.'); },
      expires: mkSw(this, 'expires', true), fefo: mkSw(this, 'fefo', true), showExp: mkSw(this, 'showExp', true), nearDisc: mkSw(this, 'nearDisc', true),
      vModes: seg([['shelf', 'Same shelf life for every batch'], ['batch', 'Enter the date for each batch']], vm, 'vm'), isShelf: vm === 'shelf', isBatch: vm === 'batch',
      shelfN: shelfN, typeShelf: function (e) { self.setState({ shelfN: e.target.value }); }, shelfU: shelfU, setShelfU: function (e) { self.setState({ shelfU: e.target.value }); },
      shelfEx: 'Made today → expires ' + (function () { var d = new Date(Date.UTC(2026, 8, 19)); var n = +shelfN || 0; if (shelfU === 'days') d.setUTCDate(d.getUTCDate() + n); else if (shelfU === 'weeks') d.setUTCDate(d.getUTCDate() + n * 7); else if (shelfU === 'months') d.setUTCMonth(d.getUTCMonth() + n); else d.setUTCFullYear(d.getUTCFullYear() + n); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); })(),
      batches: batches.map(function (b) { var tot = 30, left = b[3], p = Math.max(0, Math.min(100, left / tot * 100)); var st = left < 0 ? 'Expired' : left <= 3 ? 'Stopped · 3 days rule' : left <= 14 ? 'Expiring soon' : 'Fresh';
        return { no: b[0], made: b[1], exp: b[2], left: left < 0 ? 'Expired ' + (-left) + ' days ago' : left + ' days left', w: p + '%', c: left < 0 ? '#b83210' : left <= 7 ? '#d97706' : '#10b981', q: b[4], loc: b[5], st: st, sCls: left < 0 ? 'badge b-cancelled' : left <= 3 ? 'badge b-over' : left <= 14 ? 'badge b-approval' : 'badge b-received', cls: b[6] ? 'flash' : '' }; }),
      addBatch: function () { self.setState({ batches: [['B-0926', '19 Sep 2026', '19 Oct 2026', 30, 60, 'Central Warehouse', true]].concat(batches.map(function (x) { return x.slice(0, 6); })) }); toast(self, 'Batch B-0926 added. Expiry set by itself from the 1-month shelf life.'); },
      save: function () { toast(self, 'Product saved and live on the online shop, POS and Facebook shop.'); }, saveDraft: function () { toast(self, 'Saved as a draft. Customers can’t see it yet.'); }
    };
    TABS.forEach(function (t) { v['is_' + t[0]] = t[0] === tab; });
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:12px;box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:8px;color:#475569;font-size:14px;font-weight:500;letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;color:#64748b;padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:8px;border:0;font:inherit;font-size:14px;font-weight:500;letter-spacing:.025em;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:15px}
.sm{height:36px;padding:0 12px;font-size:13px}
.ib{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.tab{height:40px;padding:0 14px;border-radius:999px;border:0;background:transparent;font:inherit;font-size:13px;font-weight:500;color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:13px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:14px;line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#64748b}
.num{font-variant-numeric:tabular-nums}
.ai{height:30px;padding:0 10px;border-radius:8px;border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:12.5px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:48px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:#64748b;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:600}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#eef2f6;color:#475569;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:10px;border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#003087}
`;

// ---- markup ----

export default class AddProductTabsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AddProductTabs">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1700px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="products-add" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Products / All products" page="Add product · tab view" placeholder="Search products, SKU or barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ flexGrow: "1", fontSize: "14px", color: "#475569" }}>{v.saveHint}</span>
                <__Link href="/all-products" className="btn line">Discard</__Link>
                <button type="button" className="btn line" onClick={v.saveDraft}>Save as draft</button>
                <button type="button" className="btn solid" onClick={v.save}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Save product</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <nav className="pcard" aria-label="Product sections" style={{ display: "flex", gap: "4px", padding: "6px", overflowX: "auto" }}>
                    {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={tb?.pick} aria-current={tb?.on} style={__sx(`height: 42px; padding: 0 14px; border: 0; border-radius: 10px; background: ${tb?.bg ?? ""}; color: ${tb?.fg ?? ""}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;`)}><span style={__sx(`width: 20px; height: 20px; border-radius: 999px; background: ${tb?.dbg ?? ""}; color: ${tb?.dfg ?? ""}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.n}</span>{tb?.l}</button>
                      </React.Fragment>))}
                  </nav>
                  {v.is_basics ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "12px", borderColor: "#d9d2fb", background: "linear-gradient(135deg, #fbfaff, #f4f8ff)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #7c3aed, #0a5bd0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "15px", fontWeight: "600" }}>AI writing assistant</div>
                            <div style={{ fontSize: "12.5px", color: "#64748b" }}>Tell it a few facts. Pick the fields you want filled. You check every word before saving.</div>
                          </div>
                          <button type="button" className="abtn" onClick={v.toggleAssist}>{v.assistBtn}</button>
                        </div>
                        {v.assistOpen ? (<>
                          <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Key facts about the product</span>
                              <input className="inp" value={v.facts} onInput={v.typeFacts} onChange={v.typeFacts} aria-label="Key facts" />
                              <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>For example: 6.7 inch AMOLED, 5000 mAh, 1 year official warranty, PTA approved.</span>
                            </label>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                              <span className="lbl">Fill these:</span>
                              {__list(v.aiFields).map((c, $index) => (<React.Fragment key={$index}>
                                  <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "34px" }}>{c?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{c?.label}</button>
                                </React.Fragment>))}
                            </div>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Title and description</h2>
                          </div>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Title</span>
                          <input className="inp" value={v.title} onInput={v.typeTitle} onChange={v.typeTitle} aria-label="Title" style={{ height: "46px", fontSize: "15px", fontWeight: "500" }} />
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span className="lbl" style={{ flexGrow: "1" }}>Short description</span>
                            <span style={{ fontSize: "12px", color: "#64748b", marginRight: "10px" }}>{v.shortCount}</span>
                            <button type="button" className="ai" onClick={v.aiShort}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                          </div>
                          <textarea className="inp" rows="2" value={v.short} onInput={v.typeShort} onChange={v.typeShort} aria-label="Short description" style={__sx(`height: auto; padding: 12px 14px; line-height: 22px; resize: vertical; border-color: ${v.shortBorder ?? ""};`)} />
                          {v.ai?.short ? (<>
                            <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6d28d9" }}>
                              <span style={{ height: "22px", padding: "0 8px", borderRadius: "999px", background: "#f3e8ff", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                              <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.keep_short}>Looks good</button>
                              <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.undo_short}>Undo</button>
                            </div>
                          </>) : null}
                          <span style={{ fontSize: "12px", color: "#64748b" }}>Shown next to the price and in search results. One or two lines.</span>
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
                          <div style={{ display: "flex", gap: "2px", padding: "6px", border: "1px solid #cbd5e1", borderBottom: "0", borderRadius: "8px 8px 0 0", background: "#f8fafc" }}>
                            <button type="button" className="ib" aria-label="Bold" style={{ width: "32px", height: "32px", borderRadius: "6px", fontWeight: "800" }}>B</button>
                            <button type="button" className="ib" aria-label="Italic" style={{ width: "32px", height: "32px", borderRadius: "6px", fontStyle: "italic", fontFamily: "Georgia, serif" }}>I</button>
                            <button type="button" className="ib" aria-label="List" style={{ width: "32px", height: "32px", borderRadius: "6px" }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect width="8" height="4" x="8" y="2" rx="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <path d="M12 11h4" />
                                <path d="M12 16h4" />
                                <path d="M8 11h.01" />
                                <path d="M8 16h.01" />
                              </svg>
                            </button>
                            <button type="button" className="ib" aria-label="Link" style={{ width: "32px", height: "32px", borderRadius: "6px" }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </button>
                            <button type="button" className="ib" aria-label="Picture" style={{ width: "32px", height: "32px", borderRadius: "6px" }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            </button>
                          </div>
                          <textarea className="inp bn" rows="8" value={v.long} onInput={v.typeLong} onChange={v.typeLong} aria-label="Long description" style={__sx(`height: auto; padding: 12px 14px; line-height: 23px; border-radius: 0 0 8px 8px; resize: vertical; border-color: ${v.longBorder ?? ""};`)} />
                          {v.ai?.long ? (<>
                            <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6d28d9" }}>
                              <span style={{ height: "22px", padding: "0 8px", borderRadius: "999px", background: "#f3e8ff", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                              <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.keep_long}>Looks good</button>
                              <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.undo_long}>Undo</button>
                            </div>
                          </>) : null}
                        </div>
                      </section>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Media</h2>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Drag to reorder. The first photo is the cover.</div>
                          </div>
                          <button type="button" className="ai" onClick={v.aiAlt}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Alt text with AI</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gridTemplateRows: "110px 110px", gap: "10px" }}>
                          <div style={{ gridRow: "span 2", borderRadius: "12px", background: "linear-gradient(135deg, #0b1733, #0a5bd0)", color: "#fff", display: "flex", alignItems: "flex-end", padding: "14px", fontWeight: "600", position: "relative" }}>Front · main photo<span style={{ position: "absolute", top: "10px", left: "10px", height: "22px", padding: "0 8px", borderRadius: "6px", background: "rgba(255,255,255,.2)", fontSize: "11px", display: "inline-flex", alignItems: "center" }}>COVER</span></div>
                          <div style={{ borderRadius: "12px", background: "#e0f2fe", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "11px", color: "#334155" }}>Back</div>
                          <div style={{ borderRadius: "12px", background: "#eef2f6", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "11px", color: "#334155" }}>Side</div>
                          <div style={{ borderRadius: "12px", background: "#f3e8ff", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "11px", color: "#334155" }}>Box</div>
                          <div style={{ borderRadius: "12px", background: "#e7f8f1", display: "flex", alignItems: "flex-end", padding: "8px", fontSize: "11px", color: "#334155" }}>In hand</div>
                          <button type="button" style={{ gridColumn: "span 2", borderRadius: "12px", border: "2px dashed #94a3b8", background: "#f8fafc", font: "inherit", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <path d="M17 8 12 3 7 8" />
                              <path d="M12 3v12" />
                            </svg>
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>Add photos or a video</span>
                          </button>
                        </div>
                      </section>
                    </div>
                  </>) : null}
                  {v.is_pricing ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Pricing</h2>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Selling price</span>
                            <input className="inp num" value={v.price} onInput={v.typePrice} onChange={v.typePrice} aria-label="Selling price" />
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">MRP (compare-at price)</span>
                            <input className="inp num" defaultValue="৳420" aria-label="MRP" />
                            <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Shown crossed out</span>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Buying price (cost)</span>
                            <input className="inp num" value={v.cost} onInput={v.typeCost} onChange={v.typeCost} aria-label="Buying price" />
                            <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Customers never see this</span>
                          </label>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <div style={{ flex: "1 1 0", padding: "12px 14px", borderRadius: "12px", background: "#f8fafc" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>Profit per piece</div>
                            <div className="num" style={__sx(`font-size: 18px; font-weight: 700; color: ${v.profitColor ?? ""};`)}>{v.profit}</div>
                          </div>
                          <div style={{ flex: "1 1 0", padding: "12px 14px", borderRadius: "12px", background: "#f8fafc" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>Margin</div>
                            <div className="num" style={__sx(`font-size: 18px; font-weight: 700; color: ${v.profitColor ?? ""};`)}>{v.margin}</div>
                          </div>
                          <div style={{ flex: "1 1 0", padding: "12px 14px", borderRadius: "12px", background: "#f8fafc" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>Customer saves</div>
                            <div className="num" style={{ fontSize: "18px", fontWeight: "700" }}>{v.saves}</div>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">VAT / tax</span>
                            <select className="inp" aria-label="Tax rate">
                              <option>Standard VAT 15%</option>
                              <option>Reduced 7.5%</option>
                              <option>No VAT</option>
                            </select>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Wholesale price</span>
                            <input className="inp num" defaultValue="৳300" aria-label="Wholesale price" />
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Wholesale from</span>
                            <input className="inp num" defaultValue="12 jars" aria-label="Wholesale minimum" />
                          </label>
                        </div>
                      </section>
                    </div>
                  </>) : null}
                  {v.is_stock ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Inventory</h2>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Connected to Purchase, Stock and POS. Batches and expiry dates are in the next tab.</div>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "14px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">SKU</span>
                            <input className="inp mono" defaultValue="FD-PKL-400" aria-label="SKU" />
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Barcode (EAN-13)</span>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input className="inp mono" value={v.barcode} onInput={v.typeBarcode} onChange={v.typeBarcode} aria-label="Barcode" />
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
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                          <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                              <path d="m3.3 7 8.7 5 8.7-5" />
                              <path d="M12 22V12" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Track stock for this product</div>
                            <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Stock goes up with purchase orders and returns, down with sales and damage</div>
                          </div>
                          <button type="button" role="switch" aria-checked={v.track?.on} aria-label="Track stock for this product" className={v.track?.cls} onClick={v.track?.toggle} />
                        </div>
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
                              <td className="td num" style={{ textAlign: "right", fontWeight: "600" }}>86</td>
                              <td className="td num" style={{ textAlign: "right", color: "#64748b" }}>3</td>
                              <td className="td" style={{ textAlign: "right" }}>
                                <input className="inp num" defaultValue="0" aria-label="Opening stock Central Warehouse" style={{ width: "90px", height: "36px", textAlign: "right" }} />
                              </td>
                            </tr>
                            <tr className="row">
                              <td className="td">Dhanmondi shop</td>
                              <td className="td num" style={{ textAlign: "right", fontWeight: "600" }}>40</td>
                              <td className="td num" style={{ textAlign: "right", color: "#64748b" }}>1</td>
                              <td className="td" style={{ textAlign: "right" }}>
                                <input className="inp num" defaultValue="0" aria-label="Opening stock Dhanmondi shop" style={{ width: "90px", height: "36px", textAlign: "right" }} />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "13px", color: "#334155" }}>
                          <span>Alert me when stock is below</span>
                          <input className="inp num" defaultValue="5" aria-label="Low stock alert" style={{ width: "80px", height: "36px" }} />
                          <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" style={{ width: "16px", height: "16px" }} />Keep selling when out of stock (pre-order)</label>
                          <span style={{ flexGrow: "1" }} />
                          <__Link href="/stock" style={{ fontWeight: "600" }}>Stock history</__Link>
                        </div>
                      </section>
                    </div>
                  </>) : null}
                  {v.is_validity ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Product validity (expiry)</h2>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Tell the system how long the product stays good. It warns you, stops sales in time and moves expired stock to disposal.</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                          <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>This product expires</div>
                            <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Food, medicine, cosmetics — anything with a best-before or expiry date</div>
                          </div>
                          <button type="button" role="switch" aria-checked={v.expires?.on} aria-label="This product expires" className={v.expires?.cls} onClick={v.expires?.toggle} />
                        </div>
                        {v.expires?.on ? (<>
                          <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <span className="lbl">How is the expiry date set?</span>
                              <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                                {__list(v.vModes).map((o, $index) => (<React.Fragment key={$index}>
                                    <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                                  </React.Fragment>))}
                              </div>
                            </div>
                            {v.isShelf ? (<>
                              <div className="fade" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px", borderRadius: "12px", background: "#f2f6fc" }}>
                                <span style={{ fontSize: "14px" }}>Every batch lasts</span>
                                <input className="inp num" value={v.shelfN} onInput={v.typeShelf} onChange={v.typeShelf} aria-label="Shelf life" style={{ width: "80px", height: "40px", textAlign: "center", fontWeight: "700" }} />
                                <select className="inp" value={v.shelfU} onChange={v.setShelfU} aria-label="Shelf life unit" style={{ width: "120px", height: "40px" }}>
                                  <option value="days">days</option>
                                  <option value="weeks">weeks</option>
                                  <option value="months">months</option>
                                  <option value="years">years</option>
                                </select>
                                <span style={{ fontSize: "14px" }}>from its</span>
                                <select className="inp" aria-label="Counted from" style={{ width: "170px", height: "40px" }}>
                                  <option>making date</option>
                                  <option>receiving date</option>
                                  <option>opening date</option>
                                </select>
                                <span style={{ fontSize: "13px", color: "#003087", fontWeight: "600" }}>{v.shelfEx}</span>
                              </div>
                            </>) : null}
                            {v.isBatch ? (<>
                              <div className="fade" style={{ padding: "14px 16px", borderRadius: "12px", background: "#f2f6fc", fontSize: "14px", color: "#334155" }}>Staff type or scan the expiry date printed on the pack each time goods arrive. Good for imported items with different dates.</div>
                            </>) : null}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span className="lbl">Stop selling</span>
                                <select className="inp" aria-label="Stop selling">
                                  <option>3 days before expiry</option>
                                  <option>On the expiry date</option>
                                  <option>7 days before expiry</option>
                                  <option>1 day before expiry</option>
                                </select>
                                <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Hidden from the website and blocked at the POS</span>
                              </label>
                              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span className="lbl">Warn me</span>
                                <select className="inp" aria-label="Warn before">
                                  <option>14 days before expiry</option>
                                  <option>7 days before</option>
                                  <option>30 days before</option>
                                </select>
                                <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{"Shows in Expiry & disposal and on the dashboard"}</span>
                              </label>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                              <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                  <path d="m3.3 7 8.7 5 8.7-5" />
                                  <path d="M12 22V12" />
                                </svg>
                              </span>
                              <div style={{ flexGrow: "1" }}>
                                <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Sell the oldest first</div>
                                <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Picking and POS always take the batch that expires first</div>
                              </div>
                              <button type="button" role="switch" aria-checked={v.fefo?.on} aria-label="Sell the oldest first" className={v.fefo?.cls} onClick={v.fefo?.toggle} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                              <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </span>
                              <div style={{ flexGrow: "1" }}>
                                <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Show the expiry date to customers</div>
                                <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>On the product page, invoice and shelf label</div>
                              </div>
                              <button type="button" role="switch" aria-checked={v.showExp?.on} aria-label="Show the expiry date to customers" className={v.showExp?.cls} onClick={v.showExp?.toggle} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                              <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M19 5 5 19" />
                                  <circle cx="6.5" cy="6.5" r="2.5" />
                                  <circle cx="17.5" cy="17.5" r="2.5" />
                                </svg>
                              </span>
                              <div style={{ flexGrow: "1" }}>
                                <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Auto discount near expiry</div>
                                <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Clears stock before it goes bad</div>
                              </div>
                              <button type="button" role="switch" aria-checked={v.nearDisc?.on} aria-label="Auto discount near expiry" className={v.nearDisc?.cls} onClick={v.nearDisc?.toggle} />
                            </div>
                            {v.nearDisc?.on ? (<>
                              <div className="fade" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", paddingLeft: "54px" }}>
                                <select className="inp" aria-label="Discount" style={{ width: "110px", height: "36px" }}>
                                  <option>20% off</option>
                                  <option>10% off</option>
                                  <option>30% off</option>
                                  <option>50% off</option>
                                </select>
                                <span>when</span>
                                <select className="inp" aria-label="Days left" style={{ width: "170px", height: "36px" }}>
                                  <option>7 days are left</option>
                                  <option>5 days are left</option>
                                  <option>10 days are left</option>
                                </select>
                              </div>
                            </>) : null}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span className="lbl" style={{ flexGrow: "1" }}>Batches in stock</span>
                              <button type="button" className="abtn" onClick={v.addBatch}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add batch</button>
                              <__Link href="/expiry-disposal" className="abtn" style={{ textDecoration: "none" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 6h18" />
  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
</svg>{"Expiry & disposal"}</__Link>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  <th className="th">Batch</th>
                                  <th className="th">Made on</th>
                                  <th className="th">Expires</th>
                                  <th className="th" style={{ width: "180px" }}>Life left</th>
                                  <th className="th" style={{ textAlign: "right" }}>Qty</th>
                                  <th className="th">Where</th>
                                  <th className="th">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {__list(v.batches).map((b, $index) => (<React.Fragment key={$index}>
                                    <tr className={`row ${b?.cls ?? ""}`}>
                                      <td className="td mono" style={{ fontWeight: "600" }}>{b?.no}</td>
                                      <td className="td" style={{ color: "#475569" }}>{b?.made}</td>
                                      <td className="td" style={{ fontWeight: "600" }}>{b?.exp}</td>
                                      <td className="td">
                                        <div style={{ height: "8px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                                          <div style={__sx(`width: ${b?.w ?? ""}; height: 100%; border-radius: 999px; background: ${b?.c ?? ""};`)} />
                                        </div>
                                        <div style={__sx(`font-size: 11.5px; color: ${b?.c ?? ""}; margin-top: 3px; font-weight: 600;`)}>{b?.left}</div>
                                      </td>
                                      <td className="td num" style={{ textAlign: "right" }}>{b?.q}</td>
                                      <td className="td" style={{ color: "#475569" }}>{b?.loc}</td>
                                      <td className="td">
                                        <span className={b?.sCls}>{b?.st}</span>
                                      </td>
                                    </tr>
                                  </React.Fragment>))}
                              </tbody>
                            </table>
                          </div>
                        </>) : null}
                      </section>
                    </div>
                  </>) : null}
                  {v.is_variants ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Variants</h2>
                          </div>
                          <button type="button" className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add option</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e6eaf0" }}>
                          <span style={{ color: "#94a3b8" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </span>
                          <span style={{ width: "90px", fontSize: "13px", fontWeight: "600" }}>Size</span>
                          <div style={{ display: "flex", gap: "6px", flexGrow: "1" }}>
                            <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#eef2f6", fontSize: "12.5px", display: "inline-flex", alignItems: "center" }}>400 g</span>
                            <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#eef2f6", fontSize: "12.5px", display: "inline-flex", alignItems: "center" }}>1 kg</span>
                          </div>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th className="th">Variant</th>
                              <th className="th" style={{ textAlign: "right" }}>Price</th>
                              <th className="th" style={{ textAlign: "right" }}>Stock</th>
                              <th className="th">SKU</th>
                              <th className="th">Barcode</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="row">
                              <td className="td">400 g jar</td>
                              <td className="td num" style={{ textAlign: "right" }}>৳350</td>
                              <td className="td num" style={{ textAlign: "right", fontWeight: "600" }}>126</td>
                              <td className="td mono" style={{ color: "#475569" }}>FD-PKL-400</td>
                              <td className="td mono" style={{ color: "#475569" }}>8941600200146</td>
                            </tr>
                            <tr className="row">
                              <td className="td">1 kg jar</td>
                              <td className="td num" style={{ textAlign: "right" }}>৳780</td>
                              <td className="td num" style={{ textAlign: "right", fontWeight: "600" }}>48</td>
                              <td className="td mono" style={{ color: "#475569" }}>FD-PKL-1K</td>
                              <td className="td mono" style={{ color: "#475569" }}>8941600200153</td>
                            </tr>
                          </tbody>
                        </table>
                      </section>
                    </div>
                  </>) : null}
                  {v.is_track ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Warranty and serial numbers</h2>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Two quick questions. Details are managed in Stock.</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ width: "28px", height: "28px", flexShrink: "0", borderRadius: "999px", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>1</span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Does this product come with a warranty?</div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>
                              <span className="bn">এই পণ্যে কি ওয়ারেন্টি আছে?</span>
                            </div>
                          </div>
                          <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                            {__list(v.wqOpts).map((o, $index) => (<React.Fragment key={$index}>
                                <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                              </React.Fragment>))}
                          </div>
                        </div>
                        {v.wYes ? (<>
                          <div className="fade" style={{ marginLeft: "42px", display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "14px", background: "#f7f9fc", border: "1px solid #e6eaf0" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>
                              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span className="lbl">Warranty policy</span>
                                <select className="inp" value={v.wp} onChange={v.setWp} aria-label="Warranty policy">
                                  <option value="brand1y">Smartphone brand warranty · 12 months</option>
                                  <option value="shop6m">6 months shop service warranty</option>
                                  <option value="rep7d">7-day replacement guarantee</option>
                                  <option value="elec2y">2 years parts, 1 year service</option>
                                </select>
                                <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Written once in Stock › Warranty policies</span>
                              </label>
                              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span className="lbl">Starts from</span>
                                <div className="inp" style={{ display: "flex", alignItems: "center", background: "#f1f5f9", color: "#334155" }}>{v.wpStart}</div>
                                <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Set by the policy</span>
                              </label>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                              {__list(v.wpInfo).map((w, $index) => (<React.Fragment key={$index}>
                                  <div style={{ padding: "12px", borderRadius: "12px", background: "#fff", border: "1px solid #e6eaf0" }}>
                                    <div style={{ fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>{w?.k}</div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{w?.v}</div>
                                  </div>
                                </React.Fragment>))}
                            </div>
                            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Warranty description for this product</span>
                              <textarea className="inp" rows="3" aria-label="Warranty description" style={{ height: "84px", padding: "10px 14px", resize: "none" }} defaultValue={`${v.wpText ?? ""}`} />
                              <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Shown on the product page under the price, with a link to the full policy. Filled from the policy — change it only if this product is different.</span>
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                              <__Link href="/warranty-policies" style={{ fontWeight: "600" }}>Open warranty policies</__Link>
                              <span style={{ color: "#94a3b8" }}>·</span>
                              <span style={{ color: "#475569" }}>Printed on the invoice and warranty card</span>
                            </div>
                          </div>
                        </>) : null}
                        <div style={{ height: "1px", background: "#eef2f6" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ width: "28px", height: "28px", flexShrink: "0", borderRadius: "999px", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>2</span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Does each piece have its own serial or IMEI number?</div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>Phones, laptops, TVs — so you know exactly which piece was sold</div>
                          </div>
                          <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                            {__list(v.sqOpts).map((o, $index) => (<React.Fragment key={$index}>
                                <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                              </React.Fragment>))}
                          </div>
                        </div>
                        {v.sYes ? (<>
                          <div className="fade" style={{ marginLeft: "42px", display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "14px", background: "#f7f9fc", border: "1px solid #e6eaf0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                              <span className="lbl">Which number?</span>
                              <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                                {__list(v.sntOpts).map((o, $index) => (<React.Fragment key={$index}>
                                    <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.l}</button>
                                  </React.Fragment>))}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", borderRadius: "12px", background: "#e0f3fb", color: "#0c4a6e", fontSize: "13.5px", lineHeight: "20px" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                              </svg>
                              <div style={{ flexGrow: "1" }}>You do not type the numbers here. Staff scan them in <b>Stock</b> when goods arrive, and the POS asks for the number at sale. <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
  <__Link href="/receive-goods" style={{ fontWeight: "600" }}>Receive goods</__Link>
  <__Link href="/warranty-claims" style={{ fontWeight: "600" }}>Serial number register</__Link>
</div></div>
                              <span style={{ flexShrink: "0", textAlign: "right" }}>
                                <span style={{ display: "block", fontSize: "22px", fontWeight: "700", color: "#003087" }}>{v.snCount}</span>
                                <span style={{ fontSize: "12px" }}>in stock now</span>
                              </span>
                            </div>
                          </div>
                        </>) : null}
                      </section>
                    </div>
                  </>) : null}
                  {v.is_details ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>More details</h2>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>These fields come from the category. Change the category and the fields change with it.</div>
                          </div>
                          <span className="badge b-approved">From “Grocery › Pickles”</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                          {__list(v.cfs).map((f, $index) => (<React.Fragment key={$index}>
                              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span className="lbl">{f?.l} <span style={{ fontWeight: "400", color: "#94a3b8" }}>{f?.type}</span></span>
                                <input className="inp" defaultValue={f?.v} aria-label={f?.l} />
                              </label>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <button type="button" className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add a field just for this product</button>
                          <__Link href="/catalog-setup" style={{ fontSize: "13px", fontWeight: "600" }}>Manage custom fields</__Link>
                        </div>
                      </section>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Size guide</h2>
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
                        </>) : null}
                        {v.noSg ? (<>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Not needed for phones. Clothing and shoes should have one — it cuts returns.</div>
                        </>) : null}
                      </section>
                    </div>
                  </>) : null}
                  {v.is_ship ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Shipping</h2>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Weight</span>
                            <input className="inp num" defaultValue="0.52 kg" aria-label="Weight" />
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Length</span>
                            <input className="inp num" defaultValue="9 cm" aria-label="Length" />
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Width</span>
                            <input className="inp num" defaultValue="9 cm" aria-label="Width" />
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Height</span>
                            <input className="inp num" defaultValue="12 cm" aria-label="Height" />
                          </label>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                          <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                              <path d="M12 9v4" />
                              <path d="M12 17h.01" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Fragile — glass jar</div>
                            <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Printed on the courier label</div>
                          </div>
                          <button type="button" role="switch" aria-checked={v.fragile?.on} aria-label="Fragile — glass jar" className={v.fragile?.cls} onClick={v.fragile?.toggle} />
                        </div>
                      </section>
                    </div>
                  </>) : null}
                  {v.is_seo ? (<>
                    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Search engine listing</h2>
                          </div>
                          <button type="button" className="ai" onClick={v.aiSeo}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid #e6eaf0" }}>
                          <div style={{ fontSize: "12px", color: "#047857" }}>gridshop.com.bd › products › {v.handle}</div>
                          <div style={{ fontSize: "17px", color: "#1a0dab", margin: "2px 0" }}>{v.seoTitle}</div>
                          <div style={{ fontSize: "13px", color: "#475569", lineHeight: "19px" }}>{v.seoDesc}</div>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Page title</span>
                          <input className="inp" value={v.seoTitle} onInput={v.typeSeoT} onChange={v.typeSeoT} aria-label="Page title" />
                          <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{v.seoTCount}</span>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Meta description</span>
                          <textarea className="inp" rows="2" value={v.seoDesc} onInput={v.typeSeoD} onChange={v.typeSeoD} aria-label="Meta description" style={{ height: "auto", padding: "10px 12px" }} />
                        </label>
                        {v.ai?.seo ? (<>
                          <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6d28d9" }}>
                            <span style={{ height: "22px", padding: "0 8px", borderRadius: "999px", background: "#f3e8ff", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                            <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.keep_seo}>Looks good</button>
                            <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.undo_seo}>Undo</button>
                          </div>
                        </>) : null}
                      </section>
                      <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <h2 style={{ margin: "0", fontSize: "15.5px", fontWeight: "600", color: "#0f172a" }}>Product FAQ</h2>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Shown on the product page. Answers the questions customers ask most.</div>
                          </div>
                          <button type="button" className="ai" onClick={v.aiFaq}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Suggest with AI</button>
                        </div>
                        {__list(v.faqs).map((q, $index) => (<React.Fragment key={$index}>
                            <div className={q?.cls} style={__sx(`padding: 12px 14px; border-radius: 12px; border: 1px solid ${q?.border ?? ""};`)}>
                              <div style={{ fontSize: "14px", fontWeight: "600" }}>{q?.q}</div>
                              <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>{q?.a}</div>
                            </div>
                          </React.Fragment>))}
                        {v.ai?.faq ? (<>
                          <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6d28d9" }}>
                            <span style={{ height: "22px", padding: "0 8px", borderRadius: "999px", background: "#f3e8ff", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI wrote this — please check</span>
                            <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.keep_faq}>Looks good</button>
                            <button type="button" className="abtn" style={{ height: "26px" }} onClick={v.undo_faq}>Undo</button>
                          </div>
                        </>) : null}
                        <button type="button" className="abtn" style={{ alignSelf: "flex-start" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add a question</button>
                      </section>
                    </div>
                  </>) : null}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0" }}>
                    <button type="button" className="btn line" onClick={v.prevTab}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span>{v.prevLbl}</span>
                    </button>
                    <span style={{ flexGrow: "1", textAlign: "center", fontSize: "13px", color: "#64748b" }}>Step {v.stepN} of 9 · you can jump to any tab</span>
                    <button type="button" className="btn solid" onClick={v.nextTab}>
                      <span>{v.nextLbl}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <aside style={{ width: "350px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "18px", position: "sticky", top: "0" }}>
                  <section className="pcard" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="psec">Status</div>
                    <select className="inp" value={v.status} onChange={v.setStatus} aria-label="Status">
                      <option value="active">Active — customers can buy</option>
                      <option value="draft">Draft — hidden</option>
                      <option value="scheduled">Go live on a date</option>
                    </select>
                    <div className="lbl" style={{ marginTop: "4px" }}>Sell on</div>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />Online shop</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />POS counter</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />Facebook shop</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px" }}><input type="checkbox" defaultChecked={false} style={{ width: "16px", height: "16px" }} />Seller marketplace</label>
                  </section>
                  <section className="pcard" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="psec">Organisation</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Category</span>
                      <button type="button" onClick={v.toggleCat} className="inp" style={{ height: "auto", minHeight: "44px", padding: "8px 12px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                        </svg>
                        <span style={{ flexGrow: "1", fontSize: "13.5px" }}>{v.catPath}</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {v.catOpen ? (<>
                        <div className="fade" style={{ border: "1px solid #e6eaf0", borderRadius: "12px", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", maxHeight: "300px", overflowY: "auto", boxShadow: "0 12px 24px -12px rgba(15,23,42,.25)" }}>
                          <input className="inp" placeholder="Search categories" aria-label="Search categories" style={{ height: "36px", marginBottom: "4px" }} />
                          {__list(v.cats).map((ct, $index) => (<React.Fragment key={$index}>
                              <button type="button" onClick={ct?.pick} style={__sx(`height: 34px; padding: 0 10px 0 ${ct?.pad ?? ""}; border: 0; border-radius: 8px; background: ${ct?.bg ?? ""}; color: ${ct?.fg ?? ""}; font: inherit; font-size: 13px; font-weight: ${ct?.fw ?? ""}; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;`)}>{ct?.name}<span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>{ct?.n}</span></button>
                            </React.Fragment>))}
                          <__Link href="/categories" style={{ padding: "8px 10px", fontSize: "13px", fontWeight: "600" }}>+ New category</__Link>
                        </div>
                      </>) : null}
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Sets the tax, the extra fields and where it shows in your shop menu.</span>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Brand</span>
                      <select className="inp" aria-label="Brand">
                        <option>Ruchi</option>
                        <option>Pran</option>
                        <option>GridShop Kitchen</option>
                        <option>+ Add brand</option>
                      </select>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Unit</span>
                        <select className="inp" aria-label="Unit">
                          <option>Jar</option>
                          <option>Piece</option>
                          <option>kg</option>
                          <option>Litre</option>
                          <option>Pack</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Sold by</span>
                        <select className="inp" aria-label="Sold by">
                          <option>Own product</option>
                          <option>Nanir Ranna (seller)</option>
                        </select>
                      </label>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="lbl" style={{ flexGrow: "1" }}>Tags</span>
                        <button type="button" className="ai" onClick={v.aiTags}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI</button>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {__list(v.tags).map((t, $index) => (<React.Fragment key={$index}>
                            <span style={__sx(`height: 28px; padding: 0 6px 0 10px; border-radius: 999px; background: ${t?.bg ?? ""}; color: ${t?.fg ?? ""}; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;`)}>{t?.t}<button type="button" onClick={t?.remove} aria-label={`Remove ${t?.t ?? ""}`} style={{ width: "20px", height: "20px", border: "0", background: "transparent", cursor: "pointer", color: "inherit" }}>×</button></span>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                          <span style={__sx(`width: 18px; height: 18px; border-radius: 999px; background: ${k?.bg ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center;`)}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          <span style={__sx(`color: ${k?.fg ?? ""};`)}>{k?.l}</span>
                        </div>
                      </React.Fragment>))}
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
