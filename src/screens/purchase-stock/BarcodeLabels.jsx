'use client';
// Generated from design/templates/purchase-stock/BarcodeLabels.dc.html by scripts/convert-design.mjs.
// Barcode labels — Stocks & inventory — Barcode labels. Imported from Retail Commerce and merged.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

var BND = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function dg(s, bn) { s = String(s); return bn ? s.replace(/[0-9]/g, function (d) { return BND[+d]; }) : s; }
function money(n, bn) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return dg((n < 0 ? '−' : '') + '৳' + s, bn); }
function num(x) { return +(String(x).replace(/[^\d.]/g, '').replace(/^$/, '0')) || 0; }
function unbn(x) { return String(x).replace(/[০-৯]/g, function (d) { return BND.indexOf(d); }); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m) { clearTimeout(self.t); self.setState({ msg: m }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 3200); }
function seg(self, opts, cur, key, i, base) { return opts.map(function (o) { var on = o[0] === cur; return { k: o[0], l: o[1 + i], on: on, cls: (base || 'sgb') + (on ? ' on' : ''), pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function sw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["বারকোড লেবেল প্রিন্ট", "Print barcode labels"], "hsub": ["কোন মালে লেবেল লাগবে বাছুন, কয়টা লাগবে দিন, তারপর প্রিন্ট করুন।", "Pick the items, set how many labels, then print."], "toProducts": ["প্রোডাক্ট তালিকা", "Product list"], "s1": ["১. কোন মালের লেবেল?", "1. Labels for which items?"], "byStock": ["স্টক অনুযায়ী", "Match stock"], "find": ["প্রোডাক্ট খুঁজুন", "Find a product"], "inStock": ["স্টকে", "In stock"], "noCode": ["যে প্রোডাক্টের বারকোড নেই: ৫টা", "Products without a barcode: 5"], "makeCode": ["বানিয়ে দিন", "Make them"], "madeCode": ["৫টা প্রোডাক্টের বারকোড বানানো হলো। এখন ওদের লেবেলও প্রিন্ট করা যাবে।", "Barcodes made for 5 products. You can print their labels now."], "less": ["কমান", "Less"], "more": ["বাড়ান", "More"], "s2": ["২. লেবেল কেমন হবে", "2. Label layout"], "size": ["লেবেলের মাপ", "Label size"], "showOn": ["লেবেলে যা থাকবে", "Show on label"], "oShop": ["দোকানের নাম", "Shop name"], "oName": ["প্রোডাক্টের নাম", "Product name"], "oPrice": ["দাম", "Price"], "oMrp": ["এমআরপি", "MRP"], "printer": ["প্রিন্টার", "Printer"], "s3": ["৩. দেখে নিন, তারপর প্রিন্ট", "3. Check, then print"], "mrp": ["এমআরপি", "MRP"], "totalLbl": ["মোট লেবেল", "Total labels"], "pageTitle": ["বারকোড লেবেল", "Barcode labels"]};
var AI = [["টি-শার্টের সব সাইজের লেবেল প্রিন্ট করো", "Print labels for all T-shirt sizes", "পোলো টি-শার্টের ৬টা সাইজ/রং, স্টক অনুযায়ী মোট ৩৮টা লেবেল বসালাম। প্রিন্ট করব?", "Set 38 labels for the 6 Polo T-shirt sizes/colours, matching stock. Print now?"], ["লেবেলে দাম দেখাবে না", "Don’t show price on the label", "ঠিক আছে, দাম বন্ধ করলাম। ডান পাশে দেখে নিন।", "Done — price turned off. Check the preview on the right."], ["যে মালের বারকোড নেই সেগুলোর বানাও", "Make barcodes for items without one", "৫টা প্রোডাক্টের বারকোড বানালাম — যেমন খোলা চাল, খোলা ডাল। এখন লেবেল প্রিন্ট করা যাবে।", "Made barcodes for 5 products, like loose rice and loose lentils. You can print their labels now."]];
var NAVC = {"stock": "7", "customers": "12", "suppliers": "3"};

class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var lang = 'en', bn = false, i = bn ? 0 : 1;
    var t = {}; Object.keys(T).forEach(function (k) { t[k] = T[k][i]; });
    var L = function (a, b) { return bn ? a : b; };
    var c = {}; Object.keys(NAVC).forEach(function (k) { c[k] = dg(NAVC[k], bn); });
    var ak = s.aiKey == null ? 0 : s.aiKey;
    var base = {
      t: t, c: c, rootCls: bn ? 'fbn' : 'fen', isBn: bn, isEn: !bn,
      bnCls: bn ? 'sgb on' : 'sgb', enCls: bn ? 'sgb' : 'sgb on', bnPill: bn ? 'on' : '', enPill: bn ? '' : 'on',
      setBn: function () { self.setState({ lang: 'bn' }); }, setEn: function () { self.setState({ lang: 'en' }); },
      aiOpen: !!s.aiOpen, aiClosed: !s.aiOpen,
      openAi: function () { self.setState({ aiOpen: true, listening: true }); },
      closeAi: function () { self.setState({ aiOpen: false, listening: false }); },
      listening: !!s.listening, micBg: s.listening ? '#e0431b' : '#003087', micFg: s.listening ? '#e0431b' : '#475569',
      micLbl: s.listening ? L('শুনছি… বলুন', 'Listening… go ahead') : L('চাপ দিয়ে বলুন', 'Tap and speak'),
      toggleListen: function () { self.setState({ listening: !s.listening }); },
      aiQ: AI[ak][i], aiA: AI[ak][2 + i],
      sugg: AI.map(function (q, j) { return { l: q[i], pick: function () { self.setState({ aiKey: j, listening: false }); } }; }),
      hasMsg: !!s.msg, msg: s.msg || ''
    };
    var extra = (function () {

var SHOW_IC = {"home": "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", "box": "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7l8.7 5 8.7-5M12 22V12", "tag": "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01", "memo": "M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2zM8 9h8M8 13h5"};
var EAN = ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'];
// id, bn, en, ini, swatch, code, stock, sell, mrp, defaultQty, tile
var IT = [
  ['v1', 'পোলো টি-শার্ট · M নেভি', 'Polo T-shirt · M Navy', 'প', '#1e3a6e', '8941230551007', 8, 550, 600, 8],
  ['v2', 'পোলো টি-শার্ট · M কালো', 'Polo T-shirt · M Black', 'প', '#111827', '8941230551014', 6, 550, 600, 6],
  ['v3', 'পোলো টি-শার্ট · L নেভি', 'Polo T-shirt · L Navy', 'প', '#1e3a6e', '8941230551021', 10, 550, 600, 10],
  ['v4', 'পোলো টি-শার্ট · L কালো', 'Polo T-shirt · L Black', 'প', '#111827', '8941230551038', 7, 550, 600, 7],
  ['v5', 'পোলো টি-শার্ট · XL নেভি', 'Polo T-shirt · XL Navy', 'প', '#1e3a6e', '8941230551045', 4, 550, 600, 4],
  ['v6', 'পোলো টি-শার্ট · XL কালো', 'Polo T-shirt · XL Black', 'প', '#111827', '8941230551052', 3, 550, 600, 3],
  ['p9', 'লাক্স সাবান ১০০ গ্রাম', 'Screen cleaning wipes', 'ল', '', '8941100504108', 55, 65, 70, 10],
  ['p4', 'চিনি ১ কেজি', 'Lightning cable 1 m', 'চ', '', '8941100503118', 64, 135, 140, 0],
  ['p8', 'মসুর ডাল ১ কেজি', 'Micro-USB cable 1 m', 'ম', '', '8941100503217', 40, 145, 150, 0]
];
var SIZES = {
  s38: { cols: 3, gap: 10, h: 120, pad: 8, rad: 8, g: 3, f1: 10.5, f2: 12.5, barH: 34, f3: 10, f4: 15, mod: 1, sheetBg: '#eef2f6', per: 9 },
  s50: { cols: 2, gap: 12, h: 170, pad: 12, rad: 10, g: 4, f1: 12.5, f2: 15, barH: 52, f3: 12, f4: 19, mod: 2, sheetBg: '#eef2f6', per: 4 },
  a4: { cols: 5, gap: 5, h: 60, pad: 3, rad: 3, g: 1, f1: 7, f2: 8, barH: 14, f3: 7, f4: 8.5, mod: 0.9, sheetBg: '#ffffff', per: 30 }
};
var size = s.size || 's38', z = SIZES[size];
var qtys = s.qtys || {};
var qOf = function (it) { return qtys[it[0]] == null ? it[9] : qtys[it[0]]; };
var setQ = function (id, v) { var o = assign({}, qtys); o[id] = Math.max(0, v); self.setState({ qtys: o }); };
var q = s.q || '';
var total = IT.reduce(function (n, it) { return n + qOf(it); }, 0);
var bars = function (code) {
  var out = [], push = function (w, dark) { out.push({ w: +(w * z.mod).toFixed(2), bg: dark ? '#0f172a' : 'transparent' }); };
  push(1, 1); push(1, 0); push(1, 1);
  for (var k = 1; k < 13; k++) {
    var p = EAN[+code[k]];
    if (k === 7) { push(1, 0); push(1, 1); push(1, 0); push(1, 1); push(1, 0); }
    var right = k >= 7;
    for (var m = 0; m < 4; m++) push(+p[m], right ? (m % 2 === 0) : (m % 2 === 1));
  }
  push(1, 1); push(1, 0); push(1, 1);
  return out;
};
var fmtCode = function (c) { return dg(c.slice(0, 1) + ' ' + c.slice(1, 7) + ' ' + c.slice(7), bn); };
var showShop = sw(self, 'oShop', true), showName = sw(self, 'oName', true), showPrice = sw(self, 'oPrice', true), showMrp = sw(self, 'oMrp', false);
var labels = [];
IT.forEach(function (it) { var n = qOf(it); if (!n) return; var br = bars(it[5]); for (var k = 0; k < n && labels.length < z.per; k++) labels.push({ name: it[1 + i], bars: br, num: fmtCode(it[5]), price: money(it[7], bn), mrp: money(it[8], bn) }); });
var printer = s.printer || (size === 'a4' ? 'a4' : 'xp');
var pages = Math.max(1, Math.ceil(total / 65));
return {
  fillStock: function () { var picked = IT.filter(function (it) { return qOf(it) > 0; }); var use = picked.length ? picked : IT; var o = assign({}, qtys); use.forEach(function (it) { o[it[0]] = it[6]; }); self.setState({ qtys: o }); toast(self, L('স্টক যতগুলো, লেবেলও ততগুলো বসানো হলো।', 'Label counts now match stock.')); },
  q: q, typeQ: function (e) { self.setState({ q: e.target.value }); },
  codeMissing: !s.made, codeMade: !!s.made,
  makeCodes: function () { self.setState({ made: true }); toast(self, L('৫টা নতুন বারকোড বানানো হলো।', '5 new barcodes created.')); },
  items: IT.filter(function (it) { return !q || (it[1] + ' ' + it[2] + ' ' + it[5]).toLowerCase().indexOf(unbn(q).toLowerCase()) >= 0 || (it[1] + it[2]).indexOf(q) >= 0; }).map(function (it, j) {
    var n = qOf(it), sel = n > 0;
    return { name: it[1 + i], ini: it[1 + i].slice(0, 1), hasSw: !!it[4], sw: it[4] || 'transparent', code: dg(it[5], bn), stock: dg(it[6], bn),
      qty: dg(n, bn), qFg: sel ? '#003087' : '#94a3b8', bd: sel ? '#003087' : '#cbd5e1', bg: sel ? '#f7f9fd' : '#fff', line: j === 0 ? 'transparent' : '#eef2f6',
      tileBg: sel ? '#eef3fb' : '#f1f5f9', tileFg: sel ? '#003087' : '#64748b',
      inc: function () { setQ(it[0], n + 1); }, dec: function () { setQ(it[0], n - 1); } };
  }),
  totalTxt: dg(total, bn) + L('টা', ''),
  sizes: seg(self, [['s38', '৩৮×২৫ মিমি', '38×25 mm'], ['s50', '৫০×৩০ মিমি', '50×30 mm'], ['a4', 'A4 শিটে ৬৫টা', 'A4 sheet, 65 up']], size, 'size', i),
  shows: [[showShop, 'oShop', 'home', '#eef3fb', '#003087'], [showName, 'oName', 'box', '#e7f8f1', '#047857'], [showPrice, 'oPrice', 'tag', '#fff4e0', '#a14f06'], [showMrp, 'oMrp', 'memo', '#fdecf5', '#a3195b']].map(function (x) { return { l: t[x[1]], on: x[0].on, cls: x[0].cls, toggle: x[0].toggle, icon: SHOW_IC[x[2]], tint: x[3], fg: x[4] }; }),
  printer: printer, pickPrinter: function (e) { self.setState({ printer: e.target.value === 'a4' ? 'a4' : 'xp' }); },
  printers: [{ k: 'xp', l: L('Xprinter XP-365B · লেবেল প্রিন্টার', 'Xprinter XP-365B · label printer') }, { k: 'a4', l: L('Canon LBP2900 · সাধারণ A4 প্রিন্টার', 'Canon LBP2900 · regular A4 printer') }],
  z: z, labels: labels,
  showShop: showShop.on, showName: showName.on, showPrice: showPrice.on, showMrp: showMrp.on, showPriceRow: showPrice.on || showMrp.on,
  previewNote: size === 'a4' ? L('প্রথম ৩০টা দেখাচ্ছে · ' + dg(pages, true) + 'টা A4 শিট লাগবে', 'First 30 shown · ' + pages + ' A4 sheet' + (pages > 1 ? 's' : '') + ' needed') : L('প্রথম ' + dg(labels.length, true) + 'টা দেখাচ্ছে · মোট ' + dg(total, true) + 'টা', 'First ' + labels.length + ' shown · ' + total + ' in total'),
  printLbl: L('প্রিন্ট করুন (' + dg(total, true) + 'টা লেবেল)', 'Print (' + total + ' labels)'),
  print: function () { if (!total) { toast(self, L('আগে বাম পাশে লেবেলের সংখ্যা দিন।', 'Set label counts on the left first.')); return; } toast(self, L(dg(total, true) + 'টা লেবেল প্রিন্টারে পাঠানো হলো।', total + ' labels sent to the printer.')); }
};

    })();
    return assign(base, extra || {});
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `/* phones: rows of label + buttons wrap instead of running out of the card */
@media (max-width:640px){.gc-shell__content [style*="display:flex"]:not([role="tablist"]):not([style*="column"]),.gc-shell__content [style*="display: flex"]:not([role="tablist"]):not([style*="column"]){flex-wrap:wrap}.gc-shell__content select,.gc-shell__content input{min-width:0;max-width:100%}.gc-shell__content .mono,.gc-shell__content [class*="badge"]{overflow-wrap:anywhere}}

*{box-sizing:border-box}
body{margin:0;background:#e9eef5;color:#0f172a;-webkit-font-smoothing:antialiased;font-family:var(--font-bn)}
a{color:#003087;text-decoration:none}
button{font:inherit;color:inherit}
.fbn{font-family:var(--font-bn)}
.fen{font-family:var(--font-sans)}
.num{font-variant-numeric:tabular-nums}
.mono{font-family:var(--font-data)}
.card{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 10px 28px -18px rgba(15,23,42,.14)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;white-space:nowrap;text-decoration:none;transition:background-color 200ms,border-color 200ms}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.line{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#0f172a}
.soft{background:#eef3fb;color:#003087}.soft:hover{background:#e0e9f7;color:#003087}
.okb{background:#047857;color:#fff}.okb:hover{background:#065f46;color:#fff}
.dang{background:#fff;color:#b83210;border:1px solid #f3b7a5}.dang:hover{background:#fff4f0;color:#b83210}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus);border-radius:var(--radius-lg)}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus);border-radius:var(--radius-lg)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:1px solid #e2e8f0;background:#fff;color:#334155;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex-shrink:0}
.ib:hover{background:#f1f5f9}
.seg{display:inline-flex;padding:4px;gap:2px;border-radius:var(--radius-xl);background:#e9eef5}
.sgb{height:36px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:transparent;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569;cursor:pointer;white-space:nowrap}
.sgb.on{background:#fff;color:#003087;font-weight:var(--weight-semibold);box-shadow:0 1px 3px rgba(15,23,42,.14)}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:#eef3fb;color:#003087;font-weight:var(--weight-medium)}
.pill{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:var(--radius-full);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);white-space:nowrap}
.p-ok{background:#e7f8f1;color:#047857}.p-due{background:#ffece6;color:#b83210}.p-warn{background:#fff4e0;color:#a14f06}.p-info{background:#eef3fb;color:#003087}.p-grey{background:#eef2f6;color:#475569}.p-bk{background:#fdecf5;color:#a3195b}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#0f172a}
.inp:focus{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.hint{font-size:var(--text-xs-plus);line-height:18px;color:var(--text-muted)}
.req{color:#b83210}
.th{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;padding:10px 14px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:var(--text-sm);vertical-align:middle}
.trow:hover{background:#f8fafc}
.h1{margin:0;font-size:var(--text-2xl);line-height:34px;font-weight:var(--weight-semibold)}
.h2{margin:0;font-size:var(--text-lg);line-height:24px;font-weight:var(--weight-semibold)}
.sub{font-size:var(--text-sm-plus);color:var(--text-muted)}
.kpi{padding:18px 20px;display:flex;flex-direction:column;gap:4px}
.kpi .k{font-size:var(--text-sm-plus);color:#475569;font-weight:var(--weight-medium)}
.kpi .v{font-size:var(--text-3xl);line-height:36px;font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.tabl{display:flex;gap:4px;border-bottom:1px solid #e2e8f0}
.tl{position:relative;height:44px;padding:0 14px;border:0;background:transparent;font-size:var(--text-sm-plus);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;white-space:nowrap}
.tl.on{color:#003087;font-weight:var(--weight-semibold)}.tl.on::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:3px;border-radius:3px 3px 0 0;background:#003087}
.row{display:flex;align-items:center;gap:12px;padding:14px 16px}
.row + .row{border-top:1px solid #eef2f6}
.bar{height:8px;border-radius:var(--radius-full);background:#eef2f6;overflow:hidden;display:block}.bar>span{display:block;height:8px;border-radius:var(--radius-full)}
.note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.n-info{background:#eef3fb;color:#1e3a6e}.n-warn{background:#fff8eb;color:#7a3b04;border:1px solid #fde3b5}.n-ok{background:#e7f8f1;color:#065f46}.n-due{background:#fff4f0;color:#8a2a0d;border:1px solid #f7c9bb}
.chipq{height:36px;padding:0 12px;border-radius:var(--radius-full);border:1px solid #d6e0ef;background:#f5f8ff;color:#003087;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;white-space:nowrap}
.wave span{display:inline-block;width:4px;margin:0 2px;border-radius:var(--radius-sm);background:#003087;animation:wv 900ms ease-in-out infinite}
.wave span:nth-child(2){animation-delay:.15s}.wave span:nth-child(3){animation-delay:.3s}.wave span:nth-child(4){animation-delay:.45s}.wave span:nth-child(5){animation-delay:.6s}
@keyframes wv{0%,100%{height:8px}50%{height:26px}}
.fade{animation:fd 240ms cubic-bezier(0,0,.2,1)}
@keyframes fd{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.btn:focus-visible,.ib:focus-visible,.sgb:focus-visible,.chip:focus-visible,.tl:focus-visible,.sw:focus-visible,.chipq:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}

.nav{display:flex;align-items:center;gap:11px;height:38px;padding:0 10px;border-radius:var(--radius-lg);color:#334155;font-size:var(--text-sm-plus);font-weight:var(--weight-medium);text-decoration:none;transition:background-color 200ms,color 200ms}
.nav:hover{background:#f1f5f9;color:#0f172a}
.nav.on{background:rgba(0,48,135,.09);color:#003087;font-weight:var(--weight-semibold)}
.nav .cnt{margin-left:auto;min-width:24px;height:21px;padding:0 7px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.navh{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:.04em;color:var(--text-muted);padding:12px 10px 2px}
.act{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-radius:var(--radius-xl);border:1px solid #e6eaf0;background:#fff;cursor:pointer;text-align:left;text-decoration:none;color:#0f172a;transition:border-color 200ms,box-shadow 200ms}
.act:hover{border-color:#003087;box-shadow:0 8px 20px -12px rgba(0,48,135,.35);color:#0f172a}
.act .ic{width:44px;height:44px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center}
.alert{display:flex;align-items:center;gap:14px;padding:12px 16px;border-top:1px solid #eef2f6}
.abtn{height:36px;padding:0 14px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#003087;cursor:pointer;white-space:nowrap}
.abtn:hover{background:#f1f5f9}
.mic{position:absolute;right:28px;bottom:28px;height:60px;padding:0 22px 0 8px;border-radius:var(--radius-full);border:0;background:#003087;color:#fff;display:flex;align-items:center;gap:12px;font-size:var(--text-base);font-weight:var(--weight-semibold);cursor:pointer;box-shadow:0 16px 32px -12px rgba(0,48,135,.6);z-index:20}
.mic .dotc{width:44px;height:44px;border-radius:var(--radius-full);background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.42);z-index:15}
.drawer{position:absolute;top:0;right:0;bottom:0;width:520px;background:#fff;z-index:16;display:flex;flex-direction:column;box-shadow:-20px 0 50px -20px rgba(15,23,42,.35)}
.modal{position:absolute;left:50%;top:120px;transform:translateX(-50%);width:560px;background:#fff;border-radius:var(--radius-xl);z-index:16;box-shadow:0 30px 70px -20px rgba(15,23,42,.45)}

/* merged: English, compact controls, GridAI button */
body{font-family:var(--font-sans)}
.btn{height:44px;padding:0 18px;font-size:var(--text-sm);border-radius:var(--radius-lg)}
.btn.sm,.sm{height:34px;padding:0 12px;font-size:var(--text-xs-plus);border-radius:var(--radius-lg)}
.btn.big,.big{height:48px;padding:0 22px;font-size:var(--text-sm-plus);border-radius:var(--radius-xl)}
.ib{width:36px;height:36px;border-radius:var(--radius-full)}
.chip{height:36px;padding:0 14px;font-size:var(--text-xs-plus)}
.sgb{height:32px;padding:0 12px;font-size:var(--text-xs-plus)}
.gfab{position:absolute;right:28px;bottom:28px;z-index:20;display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 20px 0 16px;border-radius:var(--radius-full);background:#003087;color:#fff;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);text-decoration:none;box-shadow:0 14px 30px -12px rgba(0,48,135,.6)}
.gfab:hover{background:#002a77;color:#fff}
.gfab:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:3px}
.th,.td{white-space:normal}

/* tablets and phones: the item list stacks above the layout and preview and takes the full width */
@media (max-width:1023px){
  .bl-layout{flex-direction:column!important;align-items:stretch!important}
  .bl-items{width:100%!important;max-width:100%;min-width:0}
}
@media (max-width:640px){
  .bl-hicon{display:none!important}
  .bl-head>h2{flex:1 1 calc(100% - 38px)!important;min-width:0}
  .bl-items .note{flex-wrap:wrap}
  .bl-items .note>span{flex:1 1 calc(100% - 46px)!important;min-width:0}
  .bl-items .note>.btn{margin-left:46px}
  .bl-item{flex-wrap:wrap!important;row-gap:6px!important}
  .bl-item>div:first-of-type{flex:1 1 calc(100% - 46px)!important}
  .bl-item>div:last-child{margin-left:46px}
  .bl-total{flex-wrap:nowrap!important}
  .bl-row>.lbl{width:100%!important}
}
`;

// ---- markup ----

export default class BarcodeLabelsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="BarcodeLabels">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-labels" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb={"Stocks & inventory"} page="Barcode labels" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span className="bl-hicon" style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M8 10H40A4 4 0 0 1 44 14V34A4 4 0 0 1 40 38H8A4 4 0 0 1 4 34V14A4 4 0 0 1 8 10Z" fill="#e0f2fe" />
                    <path d="M8 14h2.5v16h-2.5Z" fill="#003087" />
                    <path d="M12 14h1.3v16h-1.3Z" fill="#003087" />
                    <path d="M15 14h3v16h-3Z" fill="#003087" />
                    <path d="M20 14h1.3v16h-1.3Z" fill="#003087" />
                    <path d="M23 14h2.5v16h-2.5Z" fill="#003087" />
                    <path d="M27 14h1.3v16h-1.3Z" fill="#003087" />
                    <path d="M30 14h2.5v16h-2.5Z" fill="#003087" />
                    <path d="M34 14h1.3v16h-1.3Z" fill="#003087" />
                    <path d="M37 14h3v16h-3Z" fill="#003087" />
                    <path d="M9.2 32H38.8A1.2 1.2 0 0 1 40 33.2V33.199999999999996A1.2 1.2 0 0 1 38.8 34.4H9.2A1.2 1.2 0 0 1 8 33.199999999999996V33.2A1.2 1.2 0 0 1 9.2 32Z" fill="#0ea5e9" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", minWidth: "0" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <__Link href="/all-products" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7l8.7 5 8.7-5M12 22V12" />
</svg>{v.t?.toProducts}</__Link>
              </div>
              <div className="bl-layout" style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <section className="card bl-items" style={{ width: "470px", flexShrink: "0", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="bl-head" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                      <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                      <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                      <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                      <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                    </svg>
                    <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.s1}</h2>
                    <button type="button" className="btn soft sm" onClick={v.fillStock}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7l8.7 5 8.7-5M12 22V12" />
</svg>{v.t?.byStock}</button>
                  </div>
                  <label style={{ height: "46px", display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-xl)", background: "#fff", color: "var(--text-muted)" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
                    </svg>
                    <input value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder={v.t?.find} aria-label={v.t?.find} style={{ flexGrow: "1", minWidth: "0", border: "0", outline: "none", background: "transparent", font: "inherit", fontSize: "var(--text-sm-plus)", color: "#0f172a" }} />
                  </label>
                  {v.codeMissing ? (<>
                    <div className="note n-warn" style={{ alignItems: "center" }}>
                      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M8 10H40A4 4 0 0 1 44 14V34A4 4 0 0 1 40 38H8A4 4 0 0 1 4 34V14A4 4 0 0 1 8 10Z" fill="#e0f2fe" />
                        <path d="M8 14h2.5v16h-2.5Z" fill="#003087" />
                        <path d="M12 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M15 14h3v16h-3Z" fill="#003087" />
                        <path d="M20 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M23 14h2.5v16h-2.5Z" fill="#003087" />
                        <path d="M27 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M30 14h2.5v16h-2.5Z" fill="#003087" />
                        <path d="M34 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M37 14h3v16h-3Z" fill="#003087" />
                        <path d="M9.2 32H38.8A1.2 1.2 0 0 1 40 33.2V33.199999999999996A1.2 1.2 0 0 1 38.8 34.4H9.2A1.2 1.2 0 0 1 8 33.199999999999996V33.2A1.2 1.2 0 0 1 9.2 32Z" fill="#0ea5e9" />
                      </svg>
                      <span style={{ flexGrow: "1" }}>{v.t?.noCode}</span>
                      <button type="button" className="btn sm" onClick={v.makeCodes} style={{ height: "36px", background: "#a14f06", color: "#fff" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>{v.t?.makeCode}</button>
                    </div>
                  </>) : null}
                  {v.codeMade ? (<>
                    <div className="note n-ok fade" style={{ alignItems: "center" }}>
                      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M8 10H40A4 4 0 0 1 44 14V34A4 4 0 0 1 40 38H8A4 4 0 0 1 4 34V14A4 4 0 0 1 8 10Z" fill="#e0f2fe" />
                        <path d="M8 14h2.5v16h-2.5Z" fill="#003087" />
                        <path d="M12 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M15 14h3v16h-3Z" fill="#003087" />
                        <path d="M20 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M23 14h2.5v16h-2.5Z" fill="#003087" />
                        <path d="M27 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M30 14h2.5v16h-2.5Z" fill="#003087" />
                        <path d="M34 14h1.3v16h-1.3Z" fill="#003087" />
                        <path d="M37 14h3v16h-3Z" fill="#003087" />
                        <path d="M9.2 32H38.8A1.2 1.2 0 0 1 40 33.2V33.199999999999996A1.2 1.2 0 0 1 38.8 34.4H9.2A1.2 1.2 0 0 1 8 33.199999999999996V33.2A1.2 1.2 0 0 1 9.2 32Z" fill="#0ea5e9" />
                      </svg>
                      <span>{v.t?.madeCode}</span>
                    </div>
                  </>) : null}
                  <div style={{ border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                    {__list(v.items).map((it, $index) => (<React.Fragment key={$index}>
                        <div className="bl-item" style={__sx(`display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 12px; border-top: 1px solid ${it?.line ?? ""}; background: ${it?.bg ?? ""};`)}>
                          <span style={__sx(`width: 36px; height: 36px; border-radius: var(--radius-lg); background: ${it?.tileBg ?? ""}; color: ${it?.tileFg ?? ""}; font-size: var(--text-sm-plus); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;`)}>{it?.ini}{it?.hasSw ? (<>
  <span style={__sx(`position: absolute; right: -3px; bottom: -3px; width: 14px; height: 14px; border-radius: var(--radius-full); background: ${it?.sw ?? ""}; border: 2px solid #fff;`)} />
</>) : null}</span>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "20px" }}>{it?.name}</div>
                            <div className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}><span className="mono">{it?.code}</span> · {v.t?.inStock} {it?.stock}</div>
                          </div>
                          <div style={__sx(`display: flex; align-items: center; border: 1px solid ${it?.bd ?? ""}; border-radius: var(--radius-lg); background: #fff;`)}>
                            <button type="button" className="ib" onClick={it?.dec} aria-label={`${v.t?.less ?? ""} ${it?.name ?? ""}`} style={{ width: "36px", height: "36px", border: "0", fontSize: "var(--text-xl)" }}>−</button>
                            <span className="num" style={__sx(`min-width: 32px; text-align: center; font-weight: var(--weight-semibold); color: ${it?.qFg ?? ""};`)}>{it?.qty}</span>
                            <button type="button" className="ib" onClick={it?.inc} aria-label={`${v.t?.more ?? ""} ${it?.name ?? ""}`} style={{ width: "36px", height: "36px", border: "0", fontSize: "var(--text-xl)" }}>+</button>
                          </div>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="bl-total" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 4px" }}>
                    <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M6 8a3 3 0 0 1 3 -3H22L43 26L27 42L6 21Z" fill="#0ea5e9" />
                      <path d="M9 9H21L39 27L27 39L9 21Z" fill="#7dd3fc" />
                      <path d="M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#ffffff" />
                    </svg>
                    <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", color: "#475569" }}>{v.t?.totalLbl}</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.totalTxt}</span>
                  </div>
                </section>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M12 7H36A7 7 0 0 1 43 14V34A7 7 0 0 1 36 41H12A7 7 0 0 1 5 34V14A7 7 0 0 1 12 7Z" fill="#e0f2fe" />
                        <path d="M12.5 15H35.5A1.5 1.5 0 0 1 37 16.5V16.5A1.5 1.5 0 0 1 35.5 18H12.5A1.5 1.5 0 0 1 11 16.5V16.5A1.5 1.5 0 0 1 12.5 15Z" fill="#7dd3fc" />
                        <path d="M12.5 23H35.5A1.5 1.5 0 0 1 37 24.5V24.5A1.5 1.5 0 0 1 35.5 26H12.5A1.5 1.5 0 0 1 11 24.5V24.5A1.5 1.5 0 0 1 12.5 23Z" fill="#7dd3fc" />
                        <path d="M12.5 31H35.5A1.5 1.5 0 0 1 37 32.5V32.5A1.5 1.5 0 0 1 35.5 34H12.5A1.5 1.5 0 0 1 11 32.5V32.5A1.5 1.5 0 0 1 12.5 31Z" fill="#7dd3fc" />
                        <path d="M13.7 16.5a4.3 4.3 0 1 0 8.6 0a4.3 4.3 0 1 0 -8.6 0Z" fill="#0ea5e9" />
                        <path d="M25.7 24.5a4.3 4.3 0 1 0 8.6 0a4.3 4.3 0 1 0 -8.6 0Z" fill="#0ea5e9" />
                        <path d="M17.7 32.5a4.3 4.3 0 1 0 8.6 0a4.3 4.3 0 1 0 -8.6 0Z" fill="#0ea5e9" />
                      </svg>
                      <h2 className="h2">{v.t?.s2}</h2>
                    </div>
                    <div className="bl-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="lbl" style={{ width: "110px" }}>{v.t?.size}</span>
                      <div className="seg" role="group" aria-label={v.t?.size}>
                        {__list(v.sizes).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick}>{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span className="lbl" style={{ width: "110px", paddingTop: "12px" }}>{v.t?.showOn}</span>
                      <div className="gc-cols-2" style={{ flexGrow: "1", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                        {__list(v.shows).map((o, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", padding: "0 12px 0 6px", borderRadius: "var(--radius-xl)", background: "#f8fafc", fontSize: "var(--text-sm-plus)" }}>
                              <span style={__sx(`width: 32px; height: 32px; border-radius: var(--radius-lg); background: ${o?.tint ?? ""}; color: ${o?.fg ?? ""}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d={o?.icon} />
                                </svg>
                              </span>
                              <span style={{ flexGrow: "1" }}>{o?.l}</span>
                              <button type="button" className={o?.cls} aria-pressed={o?.on} aria-label={o?.l} onClick={o?.toggle} />
                            </div>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="lbl" style={{ width: "110px", display: "flex", alignItems: "center", gap: "6px" }}><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M15 4H33A2 2 0 0 1 35 6V16A2 2 0 0 1 33 18H15A2 2 0 0 1 13 16V6A2 2 0 0 1 15 4Z" fill="#e0f2fe" />
  <path d="M16.0 5.5H32.0A1.5 1.5 0 0 1 33.5 7.0V16.0A1.5 1.5 0 0 1 32.0 17.5H16.0A1.5 1.5 0 0 1 14.5 16.0V7.0A1.5 1.5 0 0 1 16.0 5.5Z" fill="#ffffff" />
  <path d="M9 16H39A4 4 0 0 1 43 20V30A4 4 0 0 1 39 34H9A4 4 0 0 1 5 30V20A4 4 0 0 1 9 16Z" fill="#003087" />
  <path d="M10.5 25H37.5A1.5 1.5 0 0 1 39 26.5V27.5A1.5 1.5 0 0 1 37.5 29H10.5A1.5 1.5 0 0 1 9 27.5V26.5A1.5 1.5 0 0 1 10.5 25Z" fill="#003087" />
  <path d="M15 27H33A2 2 0 0 1 35 29V42A2 2 0 0 1 33 44H15A2 2 0 0 1 13 42V29A2 2 0 0 1 15 27Z" fill="#e0f2fe" />
  <path d="M16.0 28H32.0A1.5 1.5 0 0 1 33.5 29.5V41.0A1.5 1.5 0 0 1 32.0 42.5H16.0A1.5 1.5 0 0 1 14.5 41.0V29.5A1.5 1.5 0 0 1 16.0 28Z" fill="#ffffff" />
  <path d="M18.5 32H29.5A1 1 0 0 1 30.5 33V33A1 1 0 0 1 29.5 34H18.5A1 1 0 0 1 17.5 33V33A1 1 0 0 1 18.5 32Z" fill="#7dd3fc" />
  <path d="M18.5 36H25.5A1 1 0 0 1 26.5 37V37A1 1 0 0 1 25.5 38H18.5A1 1 0 0 1 17.5 37V37A1 1 0 0 1 18.5 36Z" fill="#7dd3fc" />
  <path d="M35 21a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
</svg>{v.t?.printer}</span>
                      <select className="inp" value={v.printer} onInput={v.pickPrinter} onChange={v.pickPrinter} aria-label={v.t?.printer} style={{ flexGrow: "1" }}>
                        {__list(v.printers).map((o, $index) => (<React.Fragment key={$index}>
                            <option value={o?.k}>{o?.l}</option>
                          </React.Fragment>))}
                      </select>
                    </label>
                  </section>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M15 4H33A2 2 0 0 1 35 6V16A2 2 0 0 1 33 18H15A2 2 0 0 1 13 16V6A2 2 0 0 1 15 4Z" fill="#e0f2fe" />
                        <path d="M16.0 5.5H32.0A1.5 1.5 0 0 1 33.5 7.0V16.0A1.5 1.5 0 0 1 32.0 17.5H16.0A1.5 1.5 0 0 1 14.5 16.0V7.0A1.5 1.5 0 0 1 16.0 5.5Z" fill="#ffffff" />
                        <path d="M9 16H39A4 4 0 0 1 43 20V30A4 4 0 0 1 39 34H9A4 4 0 0 1 5 30V20A4 4 0 0 1 9 16Z" fill="#003087" />
                        <path d="M10.5 25H37.5A1.5 1.5 0 0 1 39 26.5V27.5A1.5 1.5 0 0 1 37.5 29H10.5A1.5 1.5 0 0 1 9 27.5V26.5A1.5 1.5 0 0 1 10.5 25Z" fill="#003087" />
                        <path d="M15 27H33A2 2 0 0 1 35 29V42A2 2 0 0 1 33 44H15A2 2 0 0 1 13 42V29A2 2 0 0 1 15 27Z" fill="#e0f2fe" />
                        <path d="M16.0 28H32.0A1.5 1.5 0 0 1 33.5 29.5V41.0A1.5 1.5 0 0 1 32.0 42.5H16.0A1.5 1.5 0 0 1 14.5 41.0V29.5A1.5 1.5 0 0 1 16.0 28Z" fill="#ffffff" />
                        <path d="M18.5 32H29.5A1 1 0 0 1 30.5 33V33A1 1 0 0 1 29.5 34H18.5A1 1 0 0 1 17.5 33V33A1 1 0 0 1 18.5 32Z" fill="#7dd3fc" />
                        <path d="M18.5 36H25.5A1 1 0 0 1 26.5 37V37A1 1 0 0 1 25.5 38H18.5A1 1 0 0 1 17.5 37V37A1 1 0 0 1 18.5 36Z" fill="#7dd3fc" />
                        <path d="M35 21a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
                      </svg>
                      <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.s3}</h2>
                      <span className="hint num">{v.previewNote}</span>
                    </div>
                    <div style={__sx(`height: 410px; overflow: hidden; padding: 14px; border-radius: var(--radius-xl); background: ${v.z?.sheetBg ?? ""}; border: 1px solid #e2e8f0;`)}>
                      <div style={__sx(`display: grid; grid-template-columns: repeat(${v.z?.cols ?? ""}, minmax(0, 1fr)); gap: ${v.z?.gap ?? ""}px;`)}>
                        {__list(v.labels).map((lb, $index) => (<React.Fragment key={$index}>
                            <div className="fade" style={__sx(`height: ${v.z?.h ?? ""}px; padding: ${v.z?.pad ?? ""}px; border-radius: ${v.z?.rad ?? ""}px; background: #fff; border: 1px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${v.z?.g ?? ""}px; overflow: hidden; color: #0f172a;`)}>
                              {v.showShop ? (<>
                                <span style={__sx(`font-size: ${v.z?.f1 ?? ""}px; line-height: 1.15; font-weight: var(--weight-medium); color: #475569; white-space: nowrap;`)}>{v.t?.shop}</span>
                              </>) : null}
                              {v.showName ? (<>
                                <span style={__sx(`max-width: 100%; font-size: ${v.z?.f2 ?? ""}px; line-height: 1.2; font-weight: var(--weight-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`)}>{lb?.name}</span>
                              </>) : null}
                              <span aria-hidden="true" style={__sx(`display: flex; height: ${v.z?.barH ?? ""}px; flex-shrink: 0;`)}>
                                {__list(lb?.bars).map((b, $index) => (<React.Fragment key={$index}>
                                    <span style={__sx(`width: ${b?.w ?? ""}px; background: ${b?.bg ?? ""};`)} />
                                  </React.Fragment>))}
                              </span>
                              <span className="mono" style={__sx(`font-size: ${v.z?.f3 ?? ""}px; line-height: 1.1; letter-spacing: var(--tracking-label);`)}>{lb?.num}</span>
                              {v.showPriceRow ? (<>
                                <span style={__sx(`display: flex; align-items: baseline; gap: ${v.z?.g ?? ""}px; white-space: nowrap;`)}>
                                  {v.showPrice ? (<>
                                    <span className="num" style={__sx(`font-size: ${v.z?.f4 ?? ""}px; font-weight: var(--weight-semibold);`)}>{lb?.price}</span>
                                  </>) : null}
                                  {v.showMrp ? (<>
                                    <span className="num" style={__sx(`font-size: ${v.z?.f3 ?? ""}px; color: #475569;`)}>{v.t?.mrp} {lb?.mrp}</span>
                                  </>) : null}
                                </span>
                              </>) : null}
                            </div>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <button type="button" className="btn okb big" onClick={v.print} style={{ width: "100%" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.printLbl}</button>
                  </section>
                </div>
              </div>
            </div>
          </main>
          {v.hasMsg ? (<>
            <div className="fade gc-on-dark" role="status" style={{ position: "absolute", top: "90px", left: "50%", transform: "translateX(-50%)", zIndex: "30", display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", borderRadius: "var(--radius-xl)", background: "#0f172a", color: "#fff", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", boxShadow: "0 16px 36px -14px rgba(15,23,42,.6)", maxWidth: "640px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{v.msg}</span>
            </div>
          </>) : null}
          <__Link href="/grid-ai" className="gfab" aria-label="Open GridAI">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
              <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
            </svg>
            <span>GridAI</span>
          </__Link>
        </div>
      </div>
    );
  }
}
