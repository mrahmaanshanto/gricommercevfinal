'use client';
// Generated from design/templates/accounts/Reports.dc.html by scripts/convert-design.mjs.
// Reports — Accounts — Reports. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "Dazzle Shop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["রিপোর্ট", "Reports"], "hsub": ["সময় বাছুন, তারপর যেকোনো রিপোর্ট দেখুন বা Excel / PDF নামান", "Pick a period, then open any report or download it as Excel / PDF"], "range": ["সময়", "Period"], "from": ["থেকে", "From"], "to": ["পর্যন্ত", "To"], "wa": ["রিপোর্ট প্রতিদিন রাতে WhatsApp-এ পাঠাও", "Send the report on WhatsApp every night"], "waTo": ["রাত ১০টায় এই নম্বরে", "At 10:00 PM to this number"], "waNum": ["WhatsApp নম্বর", "WhatsApp number"], "view": ["দেখুন", "View"], "close2": ["রিপোর্ট বন্ধ করুন", "Close report"], "pickOne": ["উপরের যেকোনো রিপোর্টে \"দেখুন\" চাপুন — এখানে বড় করে দেখাবে", "Tap \"View\" on any report above — it opens here"], "mMonth": ["মাস", "Month"], "mSales": ["বেচা", "Sales"], "mCogs": ["কেনা দাম", "Buying cost"], "mExp": ["খরচ", "Expenses"], "mProfit": ["লাভ", "Profit"], "total6": ["৬ মাসে মোট", "6-month total"], "legSales": ["বেচা", "Sales"], "legProfit": ["আসল লাভ", "Real profit"], "pNo": ["#", "#"], "pName": ["প্রোডাক্ট", "Product"], "pQty": ["কতগুলো", "Qty"], "pAmt": ["টাকা", "Amount"], "pProfit": ["লাভ", "Profit"], "pShare": ["বেচার ভাগ", "Share of sales"], "fullIn": ["পুরো রিপোর্ট Excel বা PDF-এ নামান", "Download the full report as Excel or PDF"], "pageTitle": ["রিপোর্ট", "Reports"]};
var AI = [["এই মাসে কোন মাল সবচেয়ে বেশি চলেছে?", "What sold most this month?", "পাওয়ার ব্যাংক ২০,০০০ mAh — ১১৮ বস্তা, ৳২,৩০,১০০। তারপর ২০W USB-C চার্জার আর চিনি।", "Power bank 20,000 mAh — 118 pieces, ৳2,30,100. Then the 20W charger and Lightning cables."], ["গত মাসের লাভ-লস PDF বানাও", "Make last month’s P&L as PDF", "আগস্টের লাভ-লস PDF তৈরি — আসল লাভ ৳১,৭৪,৩০০। WhatsApp-এ পাঠাব?", "August P&L PDF is ready — real profit ৳1,74,300. Send it on WhatsApp?"], ["৬০ দিনের বেশি পুরনো বাকি কত?", "How much due is over 60 days old?", "৬০ দিনের বেশি পুরনো বাকি মোট ৳১৪,৫০০। \"কাস্টমারের বাকি\" রিপোর্টে নাম দেখুন।", "Dues older than 60 days total ৳14,500. Open \"Customer dues\" to see who."]];
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

var PATH = {
  memo: 'M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2zM8 9h8M8 13h5',
  chart: 'M3 3v18h18M7 15l4-4 3 3 5-6',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  warehouse: 'M3 21V8l9-5 9 5v13M7 21v-8h10v8M7 17h10',
  damage: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  users: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a5 5 0 0 0-4-5',
  truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  wallet: 'M3 7h18v13H3zM3 7l2-4h12l2 4M16 13.5h2',
  vat: 'M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  ret: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  staff: 'M3 7h18v14H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'
};
var COL = { blue: ['#eef3fb', '#003087', '#c9d7ee'], green: ['#e7f8f1', '#047857', '#bfe6d4'], amber: ['#fff4e0', '#a14f06', '#f6d9a8'], red: ['#ffece6', '#b83210', '#f5c3b3'], grey: ['#eef2f6', '#334155', '#cbd5e1'], violet: ['#f1edfc', '#6d28d9', '#d9ccf6'], teal: ['#e6f6f9', '#0e7490', '#b7e3ec'], rose: ['#fdecef', '#be123c', '#f5c2cd'] };
// period: [sales, gross profit, expenses, memos, label bn, label en]
var RANGE = {
  today: [48650, 9820, 19650, 62, 'আজ · ২৯ সেপ্টেম্বর', 'Today · 29 Sep'],
  yest: [43400, 8680, 1850, 55, 'গতকাল · ২৮ সেপ্টেম্বর', 'Yesterday · 28 Sep'],
  week: [308250, 61400, 24400, 402, 'এই সপ্তাহ · ২৩–২৯ সেপ্টেম্বর', 'This week · 23–29 Sep'],
  month: [1286400, 254800, 74300, 1688, 'এই মাস · ১–২৯ সেপ্টেম্বর', 'This month · 1–29 Sep'],
  last: [1244100, 247800, 73500, 1630, 'গত মাস · আগস্ট ২০২৬', 'Last month · August 2026'],
  custom: [1286400, 254800, 74300, 1688, '০১/০৯/২০২৬ – ২৯/০৯/২০২৬', '01/09/2026 – 29/09/2026']
};
var rk = s.rk || 'month', R = RANGE[rk], f = R[0] / 1286400;
var sc = function (n) { return Math.round(n * f); };
var ef = R[2] / 74300;
var SP = {
  sales: [38, 41, 36, 44, 47, 42, 45, 50, 46, 49, 52, 55], pl: [30, 34, 28, 36, 40, 33, 37, 42, 38, 41, 44, 47], prod: [20, 24, 22, 27, 25, 29, 31, 28, 33, 35, 32, 36],
  stock: [52, 50, 55, 53, 49, 51, 48, 50, 47, 49, 46, 48], low: [4, 5, 3, 6, 5, 7, 6, 8, 7, 6, 8, 9], due: [30, 32, 35, 33, 37, 40, 38, 41, 43, 42, 44, 46],
  pay: [40, 38, 42, 45, 41, 44, 47, 43, 46, 48, 45, 50], exp: [22, 18, 25, 20, 19, 24, 21, 23, 20, 26, 22, 24], vat: [30, 31, 29, 33, 32, 34, 33, 35, 34, 36, 35, 37],
  ret: [8, 6, 9, 5, 7, 6, 8, 5, 7, 4, 6, 5], staff: [35, 38, 36, 40, 39, 42, 41, 44, 43, 45, 44, 47], branch: [60, 62, 61, 63, 64, 63, 65, 66, 65, 67, 66, 68]
};
var net = R[1] - R[2];
function parts(list, scale) { var mx = Math.max.apply(null, list.map(function (x) { return x[2]; })); return list.map(function (x) { var v = scale ? Math.round(x[2] * scale) : x[2]; return { l: x[i], v: x[4] ? x[4 + i] : money(v, bn), w: Math.max(3, Math.round(x[2] / mx * 100)) + '%', c: x[3] }; }); }
var CARDS = [
  ['sales', 'বেচার রিপোর্ট', 'Sales report', 'memo', 'blue', money(R[0], bn), L(dg(R[3], true) + 'টা মেমো', R[3] + ' memos'), null,
    parts([['ক্যাশ', 'Cash', 703400, '#003087'], ['বিকাশ', 'bKash', 251300, '#a3195b'], ['নগদ', 'Nagad', 112600, '#c2410c'], ['কার্ড / ব্যাংক', 'Card / bank', 68900, '#475569'], ['বাকিতে বেচা', 'Sold on due', 150200, '#b83210']], f)],
  ['pl', 'লাভ-লস', 'Profit & loss', 'chart', 'green', money(net, bn), L('বেচার লাভ − দোকানের খরচ', 'Profit on sales − shop expenses'), net < 0 ? '#b83210' : '#047857', null],
  ['prod', 'প্রোডাক্ট অনুযায়ী বেচা', 'Sales by product', 'tag', 'violet', money(sc(230100), bn), L('সবচেয়ে বেশি চলে: পাওয়ার ব্যাংক ২০,০০০ mAh', 'Top seller: Power bank 20,000 mAh'), null, null],
  ['stock', 'স্টক রিপোর্ট', 'Stock report', 'warehouse', 'teal', money(845200, bn), L('স্টকের দাম · কেনা দামে · ৪১২টা প্রোডাক্ট', 'Stock value · at cost · 412 products'), null,
    parts([['চার্জার ও ক্যাবল', 'Cables & chargers', 312400, '#0e7490'], ['ফোন', 'Phones', 186000, '#0e7490'], ['কেস ও কভার', 'Cases & covers', 148300, '#0e7490'], ['পরিধানযোগ্য', 'Wearables', 102000, '#0e7490'], ['স্ক্রিন কেয়ার', 'Screen care', 96500, '#0e7490']], 0)],
  ['low', 'কম স্টক ও শেষ', 'Low & out of stock', 'damage', 'amber', L('৯টা প্রোডাক্ট', '9 products'), L('৭টা প্রায় শেষ · ২টা একদম শেষ', '7 almost out · 2 out of stock'), '#a14f06',
    parts([['২০W USB-C চার্জার', '20W USB-C fast charger', 3, '#b83210', 'মাত্র ৩টা', 'only 3'], ['পাওয়ার ব্যাংক ২০,০০০ mAh', 'Power bank 20,000 mAh', 4, '#a14f06', '৪ বস্তা', '4 bags'], ['ক্লিনিং স্প্রে ১০০ মি.লি.', 'Cleaning spray 100 ml', 9, '#a14f06', '৯টা', '9'], ['পপ-আপ ফোন গ্রিপ', 'Pop-up phone grip', 1, '#b83210', 'শেষ', 'out'], ['স্মার্ট ব্যান্ড', 'Smart band', 1, '#b83210', 'শেষ', 'out']], 0)],
  ['due', 'কাস্টমারের বাকি', 'Customer dues', 'users', 'red', money(124500, bn), L('৩৮ জন · ১২ জনের ৩০ দিন পার', '38 customers · 12 over 30 days'), '#b83210',
    parts([['০–১৫ দিন', '0–15 days', 38200, '#f59e0b'], ['১৬–৩০ দিন', '16–30 days', 38100, '#d97706'], ['৩১–৬০ দিন', '31–60 days', 33700, '#e0431b'], ['৬০ দিনের বেশি', 'Over 60 days', 14500, '#b83210']], 0)],
  ['pay', 'সাপ্লায়ারের দেনা', 'Supplier payables', 'truck', 'amber', money(210000, bn), L('৯ জন সাপ্লায়ার · ৩ জনকে আজ দিতে হবে', '9 suppliers · 3 due today'), '#a14f06',
    parts([['প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', 60000, '#a14f06'], ['মেঘনা ট্রেডার্স', 'Techland Imports', 45000, '#a14f06'], ['স্কয়ার কনজিউমার', 'Eastern Electronics', 38000, '#a14f06'], ['ইউনিলিভার ডিলার', 'Mobile Mart', 30000, '#a14f06'], ['আরও ৫ জন', '5 more', 37000, '#94a3b8']], 0)],
  ['exp', 'খরচের রিপোর্ট', 'Expense report', 'wallet', 'rose', money(R[2], bn), L('সবচেয়ে বড় খরচ: স্টাফ বেতন', 'Biggest: staff salary'), null,
    parts([['স্টাফ বেতন', 'Staff salary', 42000, '#047857'], ['দোকান ভাড়া', 'Shop rent', 15000, '#003087'], ['নাস্তা-চা', 'Tea & snacks', 4200, '#be123c'], ['বিদ্যুৎ বিল', 'Electricity', 3850, '#a14f06'], ['পরিবহন ও অন্যান্য', 'Transport & other', 9250, '#475569']], ef)],
  ['vat', 'ভ্যাট রিপোর্ট', 'VAT report', 'vat', 'grey', money(sc(23260), bn), L('ভ্যাট দিতে হবে · শেষ তারিখ ১৫ অক্টোবর', 'VAT to pay · due 15 Oct'), null,
    parts([['বেচায় ভ্যাট পেয়েছেন', 'Collected on sales', 54500, '#334155'], ['কেনায় ভ্যাট দিয়েছেন', 'Paid on purchases', 31240, '#94a3b8'], ['দিতে হবে', 'To pay', 23260, '#a14f06']], f)],
  ['ret', 'ফেরত ও ড্যামেজ', 'Returns & damage', 'ret', 'grey', money(sc(6840), bn), L('ফেরত ' + dg(Math.max(1, sc(14)), true) + 'টা · ড্যামেজ ' + dg(Math.max(0, sc(6)), true) + 'টা', 'Returns ' + Math.max(1, sc(14)) + ' · damaged ' + Math.max(0, sc(6))), null,
    parts([['কাস্টমার ফেরত', 'Customer returns', 4920, '#475569'], ['ড্যামেজ', 'Damaged', 1480, '#b83210'], ['মেয়াদ শেষ', 'Expired', 440, '#a14f06']], f)],
  ['staff', 'স্টাফ অনুযায়ী বেচা', 'Sales by staff', 'staff', 'blue', money(sc(412300), bn), L('সবচেয়ে বেশি: রিনা (ক্যাশিয়ার)', 'Top: Rina (cashier)'), null,
    parts([['রিনা · ক্যাশিয়ার', 'Rina · cashier', 412300, '#003087'], ['বাবু · সেলসম্যান', 'Babu · salesman', 338600, '#003087'], ['সুমন · ম্যানেজার', 'Sumon · manager', 296500, '#003087'], ['মোস্তাফিজ · মালিক', 'Mostafiz · owner', 239000, '#003087']], f)],
  ['branch', 'শাখা অনুযায়ী বেচা', 'Sales by branch', 'home', 'teal', L('মিরপুর ৬৮%', 'Mirpur 68%'), L('বাকি ৩২% ধানমন্ডি শাখায়', 'Remaining 32% in Dhanmondi'), null,
    parts([['মিরপুর শাখা', 'Mirpur branch', 874800, '#0e7490'], ['ধানমন্ডি শাখা', 'Dhanmondi branch', 411600, '#b7e3ec']], f)]
];
var open = s.open === undefined ? 'pl' : s.open;
var MONTHS = [['এপ্রিল', 'April', 1140000, 915600, 72400], ['মে', 'May', 1210500, 970900, 71200], ['জুন', 'June', 1085300, 870300, 73800], ['জুলাই', 'July', 1162800, 931400, 71600], ['আগস্ট', 'August', 1244100, 996300, 73500], ['সেপ্টেম্বর', 'September', 1286400, 1031600, 74300]];
var maxS = 1286400;
var PRODS = [
  ['পাওয়ার ব্যাংক ২০,০০০ mAh', 'Power bank 20,000 mAh', 118, 1950, 150, 'বস্তা', 'boxes'],
  ['২০W USB-C চার্জার', '20W USB-C fast charger', 164, 890, 60, 'বোতল', 'pcs'],
  ['লাইটনিং ক্যাবল ১ মি.', 'Lightning cable 1 m', 620, 135, 10, 'প্যাকেট', 'packs'],
  ['ব্লুটুথ স্পিকার মিনি', 'Bluetooth speaker Mini', 22, 3200, 450, 'পিস', 'pcs'],
  ['মাইক্রো-USB ক্যাবল ১ মি.', 'Micro-USB cable 1 m', 410, 145, 15, 'প্যাকেট', 'packs'],
  ['স্মার্ট ব্যান্ড', 'Smart band', 17, 2850, 400, 'পিস', 'pcs'],
  ['শকপ্রুফ কেস A15', 'Shockproof case A15', 236, 180, 25, 'প্যাকেট', 'packs'],
  ['সিলিকন কেস', 'Silicone case', 68, 550, 230, 'পিস', 'pcs'],
  ['ক্লিনিং স্প্রে ১০০ মি.লি.', 'Cleaning spray 100 ml', 142, 240, 35, 'বোতল', 'pcs'],
  ['স্ক্রিন ক্লিনিং ওয়াইপস', 'Screen cleaning wipes', 468, 65, 8, 'পিস', 'pcs']
];
var cardObjs = CARDS.map(function (x) {
  var cc = COL[x[4]], on = open === x[0], sp = SP[x[0]], mx = Math.max.apply(null, sp);
  var nm = x[1 + i];
  return {
    k: x[0], l: nm, d: PATH[x[3]], bg: cc[0], fg: cc[1], v: x[5], kl: x[6], vfg: x[7] || '#0f172a', parts: x[8] || [],
    sp: sp.map(function (n, j) { return { h: Math.round(n / mx * 30) + 'px', hb: Math.round(n / mx * 70) + 'px', bg: j === sp.length - 1 ? cc[1] : cc[2] }; }),
    bd: on ? '#003087' : 'transparent', on: on, vcls: on ? 'btn solid sm' : 'btn soft sm',
    open: function () { self.setState({ open: on ? '' : x[0] }); },
    xls: function () { toast(self, L(x[1] + ' — Excel ফাইল নামছে…', x[2] + ' — downloading Excel…')); },
    pdf: function () { toast(self, L(x[1] + ' — PDF ফাইল নামছে…', x[2] + ' — downloading PDF…')); }
  };
});
var pn = cardObjs.filter(function (x) { return x.k === open; })[0] || cardObjs[0];
var tot = { sales: 0, cogs: 0, exp: 0, net: 0 };
var plRows = MONTHS.map(function (m, j) { var n2 = m[2] - m[3] - m[4]; tot.sales += m[2]; tot.cogs += m[3]; tot.exp += m[4]; tot.net += n2; return { l: m[1 + i], sales: money(m[2], bn), cogs: money(m[3], bn), exp: money(m[4], bn), net: money(n2, bn), rbg: j === 5 ? '#f5fbf8' : 'transparent' }; });
var prodTot = 0;
var prods = PRODS.map(function (p, j) { var q = Math.max(1, Math.round(p[2] * f)), amt = q * p[3]; return { n: dg(j + 1, bn), nbg: j < 3 ? '#6d28d9' : '#f1edfc', nfg: j < 3 ? '#fff' : '#6d28d9', l: p[i], q: dg(q, bn) + ' ' + p[5 + i], amt: money(amt, bn), profit: money(q * p[4], bn), share: amt / R[0] }; });
return {
  wa: sw(self, 'wa', true), waNumV: L('০১৭১১-৫৫৮৮২২', '01711-558822'),
  waSub: (s.wa === false) ? L('বন্ধ আছে', 'Off') : t.waTo,
  ranges: seg(self, [['today', 'আজ', 'Today'], ['yest', 'গতকাল', 'Yesterday'], ['week', 'এই সপ্তাহ', 'This week'], ['month', 'এই মাস', 'This month'], ['last', 'গত মাস', 'Last month'], ['custom', 'তারিখ বাছুন', 'Pick dates']], rk, 'rk', i, 'chip'),
  isCustom: rk === 'custom', d1: L('০১/০৯/২০২৬', '01/09/2026'), d2: L('২৯/০৯/২০২৬', '29/09/2026'),
  cd: (function () { var o = {}; cardObjs.forEach(function (x) { o[x.k] = x; }); return o; })(),
  hasPanel: !!open, noPanel: !open,
  isPl: open === 'pl', isProd: open === 'prod', isGen: !!open && open !== 'pl' && open !== 'prod',
  pn: assign(assign({}, pn), { sub: open === 'pl' ? L('গত ৬ মাস · এপ্রিল – সেপ্টেম্বর ২০২৬', 'Last 6 months · April – September 2026') : open === 'prod' ? L('সবচেয়ে বেশি চলা ১০টা প্রোডাক্ট · ', 'Top 10 products · ') + R[4 + i] : R[4 + i] }),
  closePanel: function () { self.setState({ open: '' }); },
  plRows: plRows,
  pt: { sales: money(tot.sales, bn), cogs: money(tot.cogs, bn), exp: money(tot.exp, bn), net: money(tot.net, bn) },
  plBars: MONTHS.map(function (m) { var n2 = m[2] - m[3] - m[4]; return { l: bn ? m[0] : m[1].slice(0, 3), hs: Math.round(m[2] / maxS * 200) + 'px', hp: Math.round(n2 / maxS * 200) + 'px' }; }),
  prods: prods.map(function (p) { return assign(p, { w: Math.min(100, Math.round(p.share / 0.2 * 100)) + '%', pct: dg((p.share * 100).toFixed(1), bn) + '%' }); })
};

    })();
    return assign(base, extra || {});
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
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
`;

// ---- markup ----

export default class ReportsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Reports">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="rep-finance" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb="Accounts" page="Reports" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ width: "52px", height: "52px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                    <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                    <path d="M14 27H16.5A1 1 0 0 1 17.5 28V36A1 1 0 0 1 16.5 37H14A1 1 0 0 1 13 36V28A1 1 0 0 1 14 27Z" fill="#7dd3fc" />
                    <path d="M20.5 21H23.0A1 1 0 0 1 24.0 22V36A1 1 0 0 1 23.0 37H20.5A1 1 0 0 1 19.5 36V22A1 1 0 0 1 20.5 21Z" fill="#0ea5e9" />
                    <path d="M27 15H29.5A1 1 0 0 1 30.5 16V36A1 1 0 0 1 29.5 37H27A1 1 0 0 1 26 36V16A1 1 0 0 1 27 15Z" fill="#0ea5e9" />
                    <path d="M28 34a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#e0f2fe" />
                    <path d="M29 34a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M39.5 38.5L44 43" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", minWidth: "0" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <div className="card" style={{ padding: "8px 12px 8px 10px", display: "flex", alignItems: "center", gap: "12px", borderRadius: "var(--radius-xl)" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#e7f8f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M15.5 3H27.5A4.5 4.5 0 0 1 32 7.5V40.5A4.5 4.5 0 0 1 27.5 45H15.5A4.5 4.5 0 0 1 11 40.5V7.5A4.5 4.5 0 0 1 15.5 3Z" fill="#003087" />
                      <path d="M15.5 7.5H27.5A2 2 0 0 1 29.5 9.5V36.5A2 2 0 0 1 27.5 38.5H15.5A2 2 0 0 1 13.5 36.5V9.5A2 2 0 0 1 15.5 7.5Z" fill="#e0f2fe" />
                      <path d="M20.2 41.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" fill="#7dd3fc" />
                      <path d="M27 10H40A5 5 0 0 1 45 15V19A5 5 0 0 1 40 24H27A5 5 0 0 1 22 19V15A5 5 0 0 1 27 10Z" fill="#0ea5e9" />
                      <path d="M27 23L25.5 29.5L32 24Z" fill="#0ea5e9" />
                      <path d="M26.3 17a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#ffffff" />
                      <path d="M31.8 17a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#ffffff" />
                      <path d="M37.3 17a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#ffffff" />
                    </svg>
                  </span>
                  <div style={{ lineHeight: "19px" }}>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.t?.wa}</div>
                    <div className="hint">{v.waSub}</div>
                  </div>
                  {v.wa?.on ? (<>
                    <input className="inp num" defaultValue={v.waNumV} aria-label={v.t?.waNum} style={{ width: "150px", height: "40px", fontWeight: "var(--weight-medium)" }} />
                  </>) : null}
                  <button type="button" className={v.wa?.cls} aria-pressed={v.wa?.on} aria-label={v.t?.wa} onClick={v.wa?.toggle} />
                </div>
              </div>
              <div role="group" aria-label={v.t?.range} style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", marginRight: "2px" }}>
                  <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M10 8H38A5 5 0 0 1 43 13V37A5 5 0 0 1 38 42H10A5 5 0 0 1 5 37V13A5 5 0 0 1 10 8Z" fill="#e0f2fe" />
                    <path d="M10.5 9.5H37.5A4 4 0 0 1 41.5 13.5V36.5A4 4 0 0 1 37.5 40.5H10.5A4 4 0 0 1 6.5 36.5V13.5A4 4 0 0 1 10.5 9.5Z" fill="#ffffff" />
                    <path d="M10 8H38A5 5 0 0 1 43 13V14A5 5 0 0 1 38 19H10A5 5 0 0 1 5 14V13A5 5 0 0 1 10 8Z" fill="#0ea5e9" />
                    <path d="M5 14h38v5h-38Z" fill="#0ea5e9" />
                    <path d="M14.7 4H14.7A1.7 1.7 0 0 1 16.4 5.7V11.3A1.7 1.7 0 0 1 14.7 13H14.7A1.7 1.7 0 0 1 13 11.3V5.7A1.7 1.7 0 0 1 14.7 4Z" fill="#003087" />
                    <path d="M33.7 4H33.699999999999996A1.7 1.7 0 0 1 35.4 5.7V11.3A1.7 1.7 0 0 1 33.699999999999996 13H33.7A1.7 1.7 0 0 1 32 11.3V5.7A1.7 1.7 0 0 1 33.7 4Z" fill="#003087" />
                    <path d="M12.2 23H15.8A1.2 1.2 0 0 1 17 24.2V26.8A1.2 1.2 0 0 1 15.8 28H12.2A1.2 1.2 0 0 1 11 26.8V24.2A1.2 1.2 0 0 1 12.2 23Z" fill="#e0f2fe" />
                    <path d="M22.2 23H25.8A1.2 1.2 0 0 1 27 24.2V26.8A1.2 1.2 0 0 1 25.8 28H22.2A1.2 1.2 0 0 1 21 26.8V24.2A1.2 1.2 0 0 1 22.2 23Z" fill="#e0f2fe" />
                    <path d="M32.2 23H35.8A1.2 1.2 0 0 1 37 24.2V26.8A1.2 1.2 0 0 1 35.8 28H32.2A1.2 1.2 0 0 1 31 26.8V24.2A1.2 1.2 0 0 1 32.2 23Z" fill="#0ea5e9" />
                    <path d="M12.2 32H15.8A1.2 1.2 0 0 1 17 33.2V35.8A1.2 1.2 0 0 1 15.8 37H12.2A1.2 1.2 0 0 1 11 35.8V33.2A1.2 1.2 0 0 1 12.2 32Z" fill="#e0f2fe" />
                    <path d="M22.2 32H25.8A1.2 1.2 0 0 1 27 33.2V35.8A1.2 1.2 0 0 1 25.8 37H22.2A1.2 1.2 0 0 1 21 35.8V33.2A1.2 1.2 0 0 1 22.2 32Z" fill="#e0f2fe" />
                    <path d="M32.2 32H35.8A1.2 1.2 0 0 1 37 33.2V35.8A1.2 1.2 0 0 1 35.8 37H32.2A1.2 1.2 0 0 1 31 35.8V33.2A1.2 1.2 0 0 1 32.2 32Z" fill="#e0f2fe" />
                  </svg>
                </span>
                {__list(v.ranges).map((g, $index) => (<React.Fragment key={$index}>
                    <button type="button" className={g?.cls} aria-pressed={g?.on} onClick={g?.pick}>{g?.l}</button>
                  </React.Fragment>))}
                {v.isCustom ? (<>
                  <span className="fade" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginLeft: "6px" }}>
                    <input className="inp num" defaultValue={v.d1} aria-label={v.t?.from} style={{ width: "140px", height: "38px" }} />
                    <span className="hint">{v.t?.to}</span>
                    <input className="inp num" defaultValue={v.d2} aria-label={v.t?.to} style={{ width: "140px", height: "38px" }} />
                  </span>
                </>) : null}
              </div>
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.sales?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.sales?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
                        <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#003087" />
                        <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                        <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                        <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                        <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                        <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                        <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                        <path d="M35 39.5V30.5M31 34.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.sales?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.sales?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.sales?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.sales?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.sales?.v}</span>
                    <button type="button" className={v.cd?.sales?.vcls} aria-pressed={v.cd?.sales?.on} onClick={v.cd?.sales?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.sales?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.sales?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.pl?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.pl?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M8.5 28H12.5A1.5 1.5 0 0 1 14 29.5V39.5A1.5 1.5 0 0 1 12.5 41H8.5A1.5 1.5 0 0 1 7 39.5V29.5A1.5 1.5 0 0 1 8.5 28Z" fill="#7dd3fc" />
                        <path d="M18.5 22H22.5A1.5 1.5 0 0 1 24 23.5V39.5A1.5 1.5 0 0 1 22.5 41H18.5A1.5 1.5 0 0 1 17 39.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#7dd3fc" />
                        <path d="M28.5 16H32.5A1.5 1.5 0 0 1 34 17.5V39.5A1.5 1.5 0 0 1 32.5 41H28.5A1.5 1.5 0 0 1 27 39.5V17.5A1.5 1.5 0 0 1 28.5 16Z" fill="#0ea5e9" />
                        <path d="M6 21L16 13L24 17L39 7" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M33 5.5L42.5 4.5L41 13.5Z" fill="#0ea5e9" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.pl?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.pl?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.pl?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.pl?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.pl?.v}</span>
                    <button type="button" className={v.cd?.pl?.vcls} aria-pressed={v.cd?.pl?.on} onClick={v.cd?.pl?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.pl?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.pl?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.prod?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.prod?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                        <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                        <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                        <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                        <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.prod?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.prod?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.prod?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.prod?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.prod?.v}</span>
                    <button type="button" className={v.cd?.prod?.vcls} aria-pressed={v.cd?.prod?.on} onClick={v.cd?.prod?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.prod?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.prod?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.stock?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.stock?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M8 24H21A2 2 0 0 1 23 26V39A2 2 0 0 1 21 41H8A2 2 0 0 1 6 39V26A2 2 0 0 1 8 24Z" fill="#7dd3fc" />
                        <path d="M13 24h3v7h-3Z" fill="#e0f2fe" />
                        <path d="M27 24H40A2 2 0 0 1 42 26V39A2 2 0 0 1 40 41H27A2 2 0 0 1 25 39V26A2 2 0 0 1 27 24Z" fill="#0ea5e9" />
                        <path d="M32 24h3v7h-3Z" fill="#e0f2fe" />
                        <path d="M17 8H30A2 2 0 0 1 32 10V22A2 2 0 0 1 30 24H17A2 2 0 0 1 15 22V10A2 2 0 0 1 17 8Z" fill="#7dd3fc" />
                        <path d="M22 8h3v7h-3Z" fill="#e0f2fe" />
                        <path d="M30.5 11a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                        <path d="M34 11l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.stock?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.stock?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.stock?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.stock?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.stock?.v}</span>
                    <button type="button" className={v.cd?.stock?.vcls} aria-pressed={v.cd?.stock?.on} onClick={v.cd?.stock?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.stock?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.stock?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.low?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.low?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M24 5C16.5 5 12 10.5 12 18V27L8 33H40L36 27V18C36 10.5 31.5 5 24 5Z" fill="#0ea5e9" />
                        <path d="M23 34H25A3 3 0 0 1 28 37V37A3 3 0 0 1 25 40H23A3 3 0 0 1 20 37V37A3 3 0 0 1 23 34Z" fill="#0ea5e9" />
                        <path d="M30.5 10a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#0ea5e9" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.low?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.low?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.low?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.low?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.low?.v}</span>
                    <button type="button" className={v.cd?.low?.vcls} aria-pressed={v.cd?.low?.on} onClick={v.cd?.low?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.low?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.low?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.due?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.due?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                        <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
                        <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
                        <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
                        <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.due?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.due?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.due?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.due?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.due?.v}</span>
                    <button type="button" className={v.cd?.due?.vcls} aria-pressed={v.cd?.due?.on} onClick={v.cd?.due?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.due?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.due?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.pay?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.pay?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M5 11H27A2 2 0 0 1 29 13V30A2 2 0 0 1 27 32H5A2 2 0 0 1 3 30V13A2 2 0 0 1 5 11Z" fill="#0ea5e9" />
                        <path d="M8.6 16H16.4A1.1 1.1 0 0 1 17.5 17.1V17.099999999999998A1.1 1.1 0 0 1 16.4 18.2H8.6A1.1 1.1 0 0 1 7.5 17.099999999999998V17.1A1.1 1.1 0 0 1 8.6 16Z" fill="#7dd3fc" />
                        <path d="M8.6 21H20.4A1.1 1.1 0 0 1 21.5 22.1V22.099999999999998A1.1 1.1 0 0 1 20.4 23.2H8.6A1.1 1.1 0 0 1 7.5 22.099999999999998V22.1A1.1 1.1 0 0 1 8.6 21Z" fill="#7dd3fc" />
                        <path d="M29 17L38.5 17L45 25.5L45 32L29 32Z" fill="#0ea5e9" />
                        <path d="M31.5 19.5L37.5 19.5L41.5 25.5L31.5 25.5Z" fill="#7dd3fc" />
                        <path d="M4.5 31H43.5A1.5 1.5 0 0 1 45 32.5V34.0A1.5 1.5 0 0 1 43.5 35.5H4.5A1.5 1.5 0 0 1 3 34.0V32.5A1.5 1.5 0 0 1 4.5 31Z" fill="#003087" />
                        <path d="M7.2 37.5a4.8 4.8 0 1 0 9.6 0a4.8 4.8 0 1 0 -9.6 0Z" fill="#003087" />
                        <path d="M10.2 37.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0Z" fill="#ffffff" />
                        <path d="M31.2 37.5a4.8 4.8 0 1 0 9.6 0a4.8 4.8 0 1 0 -9.6 0Z" fill="#003087" />
                        <path d="M34.2 37.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0Z" fill="#ffffff" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.pay?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.pay?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.pay?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.pay?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.pay?.v}</span>
                    <button type="button" className={v.cd?.pay?.vcls} aria-pressed={v.cd?.pay?.on} onClick={v.cd?.pay?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.pay?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.pay?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.exp?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.exp?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
                        <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
                        <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
                        <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
                        <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.exp?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.exp?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.exp?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.exp?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.exp?.v}</span>
                    <button type="button" className={v.cd?.exp?.vcls} aria-pressed={v.cd?.exp?.on} onClick={v.cd?.exp?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.exp?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.exp?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.vat?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.vat?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10 5L38 5L38 42L34 39L30 42L26 39L22 42L18 39L14 42L10 39Z" fill="#e0f2fe" />
                        <path d="M14.7 16a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#0ea5e9" />
                        <path d="M25.7 27a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#0ea5e9" />
                        <path d="M31 13L17 30" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.2 34H32.8A1.2 1.2 0 0 1 34 35.2V35.199999999999996A1.2 1.2 0 0 1 32.8 36.4H15.2A1.2 1.2 0 0 1 14 35.199999999999996V35.2A1.2 1.2 0 0 1 15.2 34Z" fill="#7dd3fc" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.vat?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.vat?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.vat?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.vat?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.vat?.v}</span>
                    <button type="button" className={v.cd?.vat?.vcls} aria-pressed={v.cd?.vat?.on} onClick={v.cd?.vat?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.vat?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.vat?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.ret?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.ret?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
                        <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
                        <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.ret?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.ret?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.ret?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.ret?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.ret?.v}</span>
                    <button type="button" className={v.cd?.ret?.vcls} aria-pressed={v.cd?.ret?.on} onClick={v.cd?.ret?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.ret?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.ret?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.staff?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.staff?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                        <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
                        <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
                        <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
                        <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.staff?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.staff?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.staff?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.staff?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.staff?.v}</span>
                    <button type="button" className={v.cd?.staff?.vcls} aria-pressed={v.cd?.staff?.on} onClick={v.cd?.staff?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.staff?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.staff?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
                <div className="card" style={__sx(`padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border: 2px solid ${v.cd?.branch?.bd ?? ""};`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={__sx(`width: 46px; height: 46px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.cd?.branch?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M9 18H39A1 1 0 0 1 40 19V41A1 1 0 0 1 39 42H9A1 1 0 0 1 8 41V19A1 1 0 0 1 9 18Z" fill="#e0f2fe" />
                        <path d="M7 9H41A2 2 0 0 1 43 11V17A2 2 0 0 1 41 19H7A2 2 0 0 1 5 17V11A2 2 0 0 1 7 9Z" fill="#0ea5e9" />
                        <path d="M11 9h6v10h-6Z" fill="#ffffff" />
                        <path d="M23 9h6v10h-6Z" fill="#ffffff" />
                        <path d="M35 9h5v10h-5Z" fill="#ffffff" />
                        <path d="M21 28H28A1 1 0 0 1 29 29V41A1 1 0 0 1 28 42H21A1 1 0 0 1 20 41V29A1 1 0 0 1 21 28Z" fill="#0ea5e9" />
                        <path d="M12.5 23H17.0A1 1 0 0 1 18.0 24V28A1 1 0 0 1 17.0 29H12.5A1 1 0 0 1 11.5 28V24A1 1 0 0 1 12.5 23Z" fill="#7dd3fc" />
                        <path d="M32 23H36.5A1 1 0 0 1 37.5 24V28A1 1 0 0 1 36.5 29H32A1 1 0 0 1 31 28V24A1 1 0 0 1 32 23Z" fill="#7dd3fc" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.branch?.l}</div>
                      <div className="hint num" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.cd?.branch?.kl}</div>
                    </div>
                    <span aria-hidden="true" style={{ width: "78px", height: "30px", flexShrink: "0", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      {__list(v.cd?.branch?.sp).map((b, $index) => (<React.Fragment key={$index}>
                          <span style={__sx(`flex: 1; height: ${b?.h ?? ""}; background: ${b?.bg ?? ""}; border-radius: 2px 2px 0 0;`)} />
                        </React.Fragment>))}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="num" style={__sx(`flex-grow: 1; min-width: 0; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: ${v.cd?.branch?.vfg ?? ""}; white-space: nowrap;`)}>{v.cd?.branch?.v}</span>
                    <button type="button" className={v.cd?.branch?.vcls} aria-pressed={v.cd?.branch?.on} onClick={v.cd?.branch?.open} style={{ height: "36px", padding: "0 12px" }}>{v.t?.view}</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.branch?.xls} style={{ height: "36px", padding: "0 10px" }}>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.cd?.branch?.pdf} style={{ height: "36px", padding: "0 10px" }}>PDF</button>
                  </div>
                </div>
              </div>
              {v.hasPanel ? (<>
                <section className="card fade" style={{ overflow: "hidden", border: "2px solid #003087" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={__sx(`width: 40px; height: 40px; border-radius: var(--radius-xl); background: ${v.pn?.bg ?? ""}; color: ${v.pn?.fg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={v.pn?.d} />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.pn?.l}</h2>
                      <div className="hint num">{v.pn?.sub}</div>
                    </div>
                    <button type="button" className="btn line sm" onClick={v.pn?.xls}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12l7 7 7-7" />
</svg>Excel</button>
                    <button type="button" className="btn line sm" onClick={v.pn?.pdf}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12l7 7 7-7" />
</svg>PDF</button>
                    <button type="button" className="ib" onClick={v.closePanel} aria-label={v.t?.close2}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {v.isPl ? (<>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: "0" }}>
                      <div className="gc-table-wrap">
                        <table style={{ width: "100%", borderCollapse: "collapse", borderRight: "1px solid #eef2f6" }}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              <th className="th">{v.t?.mMonth}</th>
                              <th className="th" style={{ textAlign: "right" }}>{v.t?.mSales}</th>
                              <th className="th" style={{ textAlign: "right" }}>{v.t?.mCogs}</th>
                              <th className="th" style={{ textAlign: "right" }}>{v.t?.mExp}</th>
                              <th className="th" style={{ textAlign: "right" }}>{v.t?.mProfit}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.plRows).map((m, $index) => (<React.Fragment key={$index}>
                                <tr className="trow" style={__sx(`background: ${m?.rbg ?? ""};`)}>
                                  <td className="td" style={{ padding: "10px 14px", fontWeight: "var(--weight-medium)" }}>{m?.l}</td>
                                  <td className="td num" style={{ padding: "10px 14px", textAlign: "right" }}>{m?.sales}</td>
                                  <td className="td num" style={{ padding: "10px 14px", textAlign: "right", color: "#475569" }}>{m?.cogs}</td>
                                  <td className="td num" style={{ padding: "10px 14px", textAlign: "right", color: "#a14f06" }}>{m?.exp}</td>
                                  <td className="td num" style={{ padding: "10px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{m?.net}</td>
                                </tr>
                              </React.Fragment>))}
                            <tr style={{ background: "#f8fafc" }}>
                              <td className="td" style={{ padding: "11px 14px", fontWeight: "var(--weight-semibold)" }}>{v.t?.total6}</td>
                              <td className="td num" style={{ padding: "11px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{v.pt?.sales}</td>
                              <td className="td num" style={{ padding: "11px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#475569" }}>{v.pt?.cogs}</td>
                              <td className="td num" style={{ padding: "11px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.pt?.exp}</td>
                              <td className="td num" style={{ padding: "11px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857", fontSize: "var(--text-lg)" }}>{v.pt?.net}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "16px", fontSize: "var(--text-sm)", color: "#475569" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#c9d7ee" }} />{v.t?.legSales}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#047857" }} />{v.t?.legProfit}</span>
                        </div>
                        <div style={{ height: "250px", display: "flex", alignItems: "flex-end", gap: "14px" }}>
                          {__list(v.plBars).map((m, $index) => (<React.Fragment key={$index}>
                              <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: "3px", height: "210px" }}>
                                  <span style={__sx(`flex: 1; height: ${m?.hs ?? ""}; background: #c9d7ee; border-radius: var(--radius-sm) var(--radius-sm) 2px 2px;`)} />
                                  <span style={__sx(`flex: 1; height: ${m?.hp ?? ""}; background: #047857; border-radius: var(--radius-sm) var(--radius-sm) 2px 2px;`)} />
                                </span>
                                <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", fontWeight: "var(--weight-medium)" }}>{m?.l}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </div>
                  </>) : null}
                  {v.isProd ? (<>
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="th" style={{ width: "48px" }}>{v.t?.pNo}</th>
                            <th className="th">{v.t?.pName}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.pQty}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.pAmt}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.pProfit}</th>
                            <th className="th" style={{ width: "250px" }}>{v.t?.pShare}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.prods).map((p, $index) => (<React.Fragment key={$index}>
                              <tr className="trow">
                                <td className="td num" style={{ padding: "8px 14px" }}>
                                  <span style={__sx(`width: 28px; height: 28px; border-radius: var(--radius-lg); background: ${p?.nbg ?? ""}; color: ${p?.nfg ?? ""}; font-size: var(--text-xs-plus); font-weight: var(--weight-semibold); display: inline-flex; align-items: center; justify-content: center;`)}>{p?.n}</span>
                                </td>
                                <td className="td" style={{ padding: "8px 14px", fontWeight: "var(--weight-medium)" }}>{p?.l}</td>
                                <td className="td num" style={{ padding: "8px 14px", textAlign: "right", color: "#475569" }}>{p?.q}</td>
                                <td className="td num" style={{ padding: "8px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{p?.amt}</td>
                                <td className="td num" style={{ padding: "8px 14px", textAlign: "right", fontWeight: "var(--weight-medium)", color: "#047857" }}>{p?.profit}</td>
                                <td className="td" style={{ padding: "8px 14px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span className="bar" style={{ flexGrow: "1" }}>
                                      <span style={__sx(`width: ${p?.w ?? ""}; background: #6d28d9;`)} />
                                    </span>
                                    <span className="num" style={{ width: "44px", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{p?.pct}</span>
                                  </span>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </>) : null}
                  {v.isGen ? (<>
                    <div style={{ display: "flex", gap: "24px", padding: "18px 20px", alignItems: "flex-start" }}>
                      <div style={{ width: "280px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="num" style={__sx(`font-size: var(--text-3xl); line-height: 42px; font-weight: var(--weight-semibold); color: ${v.pn?.vfg ?? ""};`)}>{v.pn?.v}</span>
                        <span className="hint num" style={{ fontSize: "var(--text-sm)" }}>{v.pn?.kl}</span>
                        <span aria-hidden="true" style={{ height: "70px", display: "flex", alignItems: "flex-end", gap: "4px", marginTop: "8px" }}>
                          {__list(v.pn?.sp).map((b, $index) => (<React.Fragment key={$index}>
                              <span style={__sx(`flex: 1; height: ${b?.hb ?? ""}; background: ${b?.bg ?? ""}; border-radius: 3px 3px 0 0;`)} />
                            </React.Fragment>))}
                        </span>
                        <span className="hint">{v.t?.fullIn}</span>
                      </div>
                      <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {__list(v.pn?.parts).map((x, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              <div style={{ display: "flex", fontSize: "var(--text-sm-plus)" }}>
                                <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)" }}>{x?.l}</span>
                                <span className="num" style={{ fontWeight: "var(--weight-semibold)" }}>{x?.v}</span>
                              </div>
                              <span className="bar" style={{ height: "10px" }}>
                                <span style={__sx(`height: 10px; width: ${x?.w ?? ""}; background: ${x?.c ?? ""};`)} />
                              </span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </div>
                  </>) : null}
                </section>
              </>) : null}
              {v.noPanel ? (<>
                <div className="card fade" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm-plus)", borderStyle: "dashed" }}>
                  <svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                    <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                    <path d="M14 27H16.5A1 1 0 0 1 17.5 28V36A1 1 0 0 1 16.5 37H14A1 1 0 0 1 13 36V28A1 1 0 0 1 14 27Z" fill="#7dd3fc" />
                    <path d="M20.5 21H23.0A1 1 0 0 1 24.0 22V36A1 1 0 0 1 23.0 37H20.5A1 1 0 0 1 19.5 36V22A1 1 0 0 1 20.5 21Z" fill="#0ea5e9" />
                    <path d="M27 15H29.5A1 1 0 0 1 30.5 16V36A1 1 0 0 1 29.5 37H27A1 1 0 0 1 26 36V16A1 1 0 0 1 27 15Z" fill="#0ea5e9" />
                    <path d="M28 34a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#e0f2fe" />
                    <path d="M29 34a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M39.5 38.5L44 43" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{v.t?.pickOne}</span>
                </div>
              </>) : null}
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
