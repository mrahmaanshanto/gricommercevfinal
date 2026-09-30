'use client';
// Generated from design/templates/sales/SalesBook.dc.html by scripts/convert-design.mjs.
// Sales book — Sales — Sales book. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["বেচার খাতা", "Sales book"], "hsub": ["কবে কত বেচা হলো, কে বেচল, টাকা কীভাবে এলো — সব এক জায়গায়", "What sold when, who sold it and how the money came in — all in one place"], "excel": ["এক্সেলে নামান", "Download Excel"], "fDate": ["সময়", "Date"], "fPay": ["পেমেন্ট", "Payment"], "fStaff": ["কে বেচেছে", "Sold by"], "from": ["থেকে", "From"], "to": ["পর্যন্ত", "To"], "kSales": ["মোট বেচা", "Total sales"], "kMemos": ["মেমো সংখ্যা", "Memos"], "kProfit": ["লাভ", "Profit"], "kDue": ["বাকিতে বেচা", "Sold on due"], "kRet": ["ফেরত", "Returns"], "memos": ["মেমোগুলো", "Memos"], "tapRow": ["যেকোনো মেমোতে চাপ দিলে পুরোটা দেখাবে", "Click any memo to see it in full"], "cNo": ["মেমো নং", "Memo no."], "cTime": ["সময়", "Time"], "cCust": ["কাস্টমার", "Customer"], "cItems": ["আইটেম", "Items"], "cPay": ["পেমেন্ট", "Payment"], "cAmt": ["টাকা", "Amount"], "cStaff": ["কে বেচেছে", "Sold by"], "noRows": ["এই ফিল্টারে কোনো মেমো নেই। অন্য পেমেন্ট বা স্টাফ বাছুন।", "No memos match this filter. Try another payment or staff."], "memo": ["মেমো", "Memo"], "soldBy": ["বেচেছেন", "Sold by"], "itemsH": ["যা যা নিয়েছে", "Items bought"], "subtotal": ["মোট", "Subtotal"], "disc": ["ছাড়", "Discount"], "grand": ["সর্বমোট", "Grand total"], "paid": ["টাকা পেলাম", "Received"], "dueLeft": ["বাকি রইল", "Left as due"], "reprint": ["আবার প্রিন্ট", "Print again"], "retEx": ["ফেরত / বদল", "Return / exchange"], "edit": ["মেমো ঠিক করুন", "Edit memo"], "sms": ["SMS-এ পাঠান", "Send by SMS"], "payBy": ["পেমেন্ট", "Payment"], "noMobile": ["মোবাইল নম্বর নেই", "No mobile number"], "pageTitle": ["বেচার খাতা", "Sales book"]};
var AI = [["গতকাল কত বেচা হয়েছিল?", "How much did we sell yesterday?", "গতকাল (সোমবার) বেচা হয়েছিল ৳৪৩,৪০০, ৫৫টা মেমো। লাভ ৳৮,৬৫০।", "Yesterday (Monday) sales were ৳43,400 across 55 memos. Profit ৳8,650."], ["আজ বিকাশে কত এলো?", "How much came by bKash today?", "আজ বিকাশে এসেছে ৳৯,৮৫০। \"বিকাশ\" ফিল্টার চালু করলাম — নিচে সেই মেমোগুলো দেখুন।", "bKash brought in ৳9,850 today. I turned on the bKash filter — see those memos below."], ["মেমো ১০৪০ দেখাও", "Show memo 1040", "মেমো #১০৪০ খুললাম — করিম সাহেব, ৳৫,২০০, পুরোটা বাকিতে। বেচেছেন সুমন।", "Opened memo #1040 — Karim Saheb, ৳5,200, all on due. Sold by Sumon."]];
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

var PR = {
  rice: ['মিনিকেট চাল ২৫ কেজি', 'Power bank 20,000 mAh', 1950], oil: ['সয়াবিন তেল ৫ লি.', '20W USB-C fast charger', 890], sugar: ['চিনি ১ কেজি', 'Lightning cable 1 m', 135],
  lentil: ['মসুর ডাল ১ কেজি', 'Micro-USB cable 1 m', 145], salt: ['লবণ ১ কেজি', 'SIM ejector pin pack', 42], lux: ['লাক্স সাবান ১০০ গ্রাম', 'Screen cleaning wipes', 65],
  det: ['ডিটারজেন্ট ১ কেজি', 'Shockproof case A15', 180], sham: ['শ্যাম্পু ১৮০ মি.লি.', 'Cleaning spray 100 ml', 240], bisc: ['বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 60],
  water: ['পানি ২ লি.', 'Cable protector pack', 35], chana: ['চানাচুর ৩০০ গ্রাম', 'USB-C OTG adapter', 85], polo: ['পোলো টি-শার্ট', 'Polo T-shirt', 550],
  cooker: ['রাইস কুকার ১.৮ লি.', 'Bluetooth speaker Mini', 3200], blender: ['ব্লেন্ডার', 'Blender', 2850]
};
var CU = { walk: ['হেঁটে আসা কাস্টমার', 'Walk-in customer', ''], karim: ['করিম সাহেব', 'Karim Saheb', '01711-234567'], rafiq: ['রফিক মিয়া', 'Rafiq Mia', '01819-445566'], nasrin: ['নাসরিন আক্তার', 'Nasrin Akter', '01912-778899'], salma: ['সালমা বেগম', 'Salma Begum', '01556-112233'], jamal: ['জামাল স্টোর', 'Jamal Telecom', '01713-908070'], habib: ['হাবিব ট্রেডার্স', 'Habib Telecom', '01819-300400'] };
var ST = { rina: ['রিনা', 'Rina'], babu: ['বাবু', 'Babu'], sumon: ['সুমন', 'Sumon'], owner: ['মোস্তাফিজ', 'Mostafiz'] };
var PAY = { cash: ['ক্যাশ', 'Cash', '#e7f8f1', '#047857'], bkash: ['বিকাশ', 'bKash', '#fdecf5', '#a3195b'], nagad: ['নগদ', 'Nagad', '#fff1e6', '#c2410c'], card: ['কার্ড', 'Card', '#eef2f6', '#475569'], due: ['বাকি', 'Due', '#ffece6', '#b83210'] };
// [memo no, hour, minute, customer, payment, staff, [[product, qty]…]]
var SETS = {
  today: [
    [1042, 10, 42, 'rafiq', 'cash', 'rina', [['rice', 1], ['sugar', 2], ['lentil', 1], ['chana', 1]]],
    [1041, 10, 35, 'walk', 'bkash', 'babu', [['sham', 1], ['lux', 4], ['det', 2]]],
    [1040, 10, 21, 'karim', 'due', 'sumon', [['rice', 1], ['oil', 2], ['sugar', 5], ['lentil', 5], ['water', 2]]],
    [1039, 10, 8, 'nasrin', 'nagad', 'rina', [['oil', 1], ['det', 1], ['lentil', 1], ['bisc', 1], ['lux', 1]]],
    [1038, 9, 55, 'walk', 'cash', 'babu', [['det', 1], ['lux', 1], ['bisc', 1], ['chana', 1]]],
    [1037, 9, 48, 'salma', 'card', 'owner', [['cooker', 1]]],
    [1036, 9, 31, 'habib', 'bkash', 'sumon', [['rice', 2]]],
    [1035, 9, 12, 'walk', 'cash', 'rina', [['sugar', 1], ['salt', 1]]],
    [1034, 8, 56, 'jamal', 'cash', 'sumon', [['oil', 10]]],
    [1033, 8, 40, 'walk', 'nagad', 'babu', [['bisc', 5]]]
  ],
  yday: [
    [980, 21, 10, 'walk', 'cash', 'rina', [['water', 2], ['bisc', 2], ['chana', 1]]],
    [979, 20, 44, 'salma', 'bkash', 'babu', [['sham', 1], ['oil', 1], ['bisc', 1], ['salt', 1]]],
    [975, 20, 5, 'jamal', 'due', 'sumon', [['rice', 2]]],
    [968, 18, 30, 'rafiq', 'cash', 'rina', [['polo', 2]]],
    [951, 15, 15, 'walk', 'nagad', 'babu', [['blender', 1]]],
    [947, 14, 2, 'habib', 'card', 'owner', [['oil', 4]]],
    [940, 12, 20, 'nasrin', 'cash', 'owner', [['lentil', 2], ['sugar', 2], ['salt', 1], ['lux', 2]]],
    [933, 10, 5, 'walk', 'bkash', 'rina', [['det', 1], ['sham', 1]]]
  ],
  sep15: [
    [596, 20, 50, 'habib', 'due', 'sumon', [['rice', 4], ['oil', 4]]],
    [594, 20, 12, 'walk', 'cash', 'rina', [['sugar', 2], ['det', 1]]],
    [590, 19, 2, 'karim', 'due', 'sumon', [['rice', 1], ['oil', 1], ['lentil', 3]]],
    [583, 17, 40, 'salma', 'bkash', 'babu', [['cooker', 1]]],
    [577, 15, 5, 'walk', 'card', 'owner', [['blender', 1]]],
    [569, 13, 10, 'nasrin', 'nagad', 'rina', [['sham', 1], ['lux', 3]]],
    [561, 11, 30, 'rafiq', 'cash', 'rina', [['rice', 1], ['chana', 2]]],
    [552, 9, 40, 'jamal', 'cash', 'sumon', [['oil', 6]]]
  ]
};
var HOURS = { today: [1200, 2850, 4100, 3600, 2900, 2100, 1800, 2600, 3400, 4300, 5200, 6100, 5300, 3200], yday: [900, 2400, 3600, 3300, 2500, 1900, 1700, 2300, 3100, 4000, 4700, 5400, 4600, 3000] };
var MONTH = [46550, 48300, 38250, 47300, 52550, 37250, 50050, 38500, 39000, 37250, 43250, 48300, 43250, 40750, 49450, 42200, 43800, 45400, 41650, 39800, 55300, 50000, 38200, 41500, 52800, 44100, 39600, 43400, 48650];
var WD = [['বুধ', 'Wed'], ['বৃহঃ', 'Thu'], ['শুক্র', 'Fri'], ['শনি', 'Sat'], ['রবি', 'Sun'], ['সোম', 'Mon'], ['আজ', 'Today']];
var R = {
  today: { sales: 48650, memos: 62, profit: 9820, due: 5200, dueN: 1, ret: 1130, retN: 3, lbl: ['আজ', 'today'], note: ['মঙ্গলবার, ২৯ সেপ্টেম্বর', 'Tuesday, 29 September'], set: 'today', pre: null },
  yday: { sales: 43400, memos: 55, profit: 8650, due: 3900, dueN: 1, ret: 450, retN: 1, lbl: ['গতকাল', 'yesterday'], note: ['সোমবার, ২৮ সেপ্টেম্বর', 'Monday, 28 September'], set: 'yday', pre: null },
  week: { sales: 308250, memos: 402, profit: 61400, due: 28600, dueN: 14, ret: 4380, retN: 9, lbl: ['এই সপ্তাহ', 'this week'], note: ['২৩ – ২৯ সেপ্টেম্বর', '23 – 29 September'], set: 'today', pre: ['২৯ সেপ্টে · ', '29 Sep · '] },
  month: { sales: 1286400, memos: 1688, profit: 254800, due: 112300, dueN: 51, ret: 15920, retN: 31, lbl: ['এই মাস', 'this month'], note: ['১ – ২৯ সেপ্টেম্বর', '1 – 29 September'], set: 'today', pre: ['২৯ সেপ্টে · ', '29 Sep · '] },
  custom: { sales: 660000, memos: 865, profit: 131000, due: 51200, dueN: 22, ret: 8150, retN: 16, lbl: ['বাছাই করা সময়', 'chosen dates'], note: ['১ – ১৫ সেপ্টেম্বর', '1 – 15 September'], set: 'sep15', pre: ['১৫ সেপ্টে · ', '15 Sep · '] }
};
var grp = function (n) { return money(n, bn).replace('৳', ''); };
var rng = s.rng || 'today', payF = s.payF || 'all', stF = s.stF || 'all';
var r = R[rng];
var tm = function (h, m) { var h12 = h > 12 ? h - 12 : h, mm = (m < 10 ? '0' : '') + m; return bn ? (h < 12 ? 'সকাল ' : h < 15 ? 'দুপুর ' : h < 18 ? 'বিকেল ' : h < 20 ? 'সন্ধ্যা ' : 'রাত ') + dg(h12 + ':' + mm, true) : h12 + ':' + mm + (h < 12 ? ' am' : ' pm'); };
var kmoney = function (n) { return n >= 100000 ? dg('৳' + (n / 100000).toFixed(2).replace(/\.?0+$/, ''), bn) + L(' লাখ', ' lakh') : n >= 1000 ? dg('৳' + (n / 1000).toFixed(1).replace(/\.0$/, ''), bn) + L(' হা.', 'k') : money(n, bn); };
var total = function (m) { return m[6].reduce(function (n, x) { return n + PR[x[0]][2] * x[1]; }, 0); };
var allSets = SETS.today.concat(SETS.yday, SETS.sep15);
var whenOf = function (m) { var set = SETS.today.indexOf(m) >= 0 ? 'today' : SETS.yday.indexOf(m) >= 0 ? 'yday' : 'sep15'; return { today: L('আজ, ২৯ সেপ্টেম্বর', 'Today, 29 Sep'), yday: L('গতকাল, ২৮ সেপ্টেম্বর', 'Yesterday, 28 Sep'), sep15: L('১৫ সেপ্টেম্বর', '15 Sep') }[set] + ' · ' + tm(m[1], m[2]); };
var list = SETS[r.set].filter(function (m) { return (payF === 'all' || m[4] === payF) && (stF === 'all' || m[5] === stF); });
var shown = list.slice(0, 8);
var sel = s.sel || 0;
var dm = allSets.filter(function (m) { return m[0] === sel; })[0] || SETS.today[0];
var dTot = total(dm), dPaid = dm[4] === 'due' ? 0 : dTot;
var bars, barTitle, peakLbl;
if (rng === 'today' || rng === 'yday') {
  var hv = HOURS[rng], hmx = Math.max.apply(null, hv), hi = hv.indexOf(hmx);
  bars = hv.map(function (v, j) { var h = 8 + j; return { d: bn ? dg(h > 12 ? h - 12 : h, true) + 'টা' : (h > 12 ? h - 12 : h) + (h < 12 ? 'am' : 'pm'), v: kmoney(v), val: v, lab: tm(h, 0), on: j === hi }; });
  barTitle = L('ঘণ্টা অনুযায়ী বেচা · সকাল ৮টা থেকে রাত ৯টা', 'Sales by hour · 8 am to 9 pm');
  peakLbl = L('সবচেয়ে বেশি: ', 'Busiest: ') + tm(8 + hi, 0) + ' · ' + money(hmx, bn);
} else {
  var dv = rng === 'week' ? MONTH.slice(22) : rng === 'month' ? MONTH : MONTH.slice(0, 15);
  var dmx = Math.max.apply(null, dv), di = dv.indexOf(dmx);
  bars = dv.map(function (v, j) { var day = rng === 'week' ? 23 + j : 1 + j; return { d: rng === 'week' ? WD[j][i] : dg(day, bn), v: kmoney(v), val: v, lab: dg(day, bn) + L(' সেপ্টেম্বর', ' Sep'), on: j === di }; });
  barTitle = L('দিন অনুযায়ী বেচা · ', 'Sales by day · ') + r.note[i];
  peakLbl = L('সবচেয়ে বেশি: ', 'Best day: ') + dg(rng === 'week' ? 23 + di : 1 + di, bn) + L(' সেপ্টেম্বর', ' Sep') + ' · ' + money(dmx, bn);
}
var bmx = Math.max.apply(null, bars.map(function (b) { return b.val; }));
var few = bars.length <= 15;
var payList = seg(self, [['all', 'সব', 'All'], ['cash', 'ক্যাশ', 'Cash'], ['bkash', 'বিকাশ', 'bKash'], ['nagad', 'নগদ', 'Nagad'], ['card', 'কার্ড', 'Card'], ['due', 'বাকি', 'Due']], payF, 'payF', i, 'chip');
var pf = {}; payList.forEach(function (o) { pf[o.k] = o; });
var pfl = function (k) { return { isCash: k === 'cash', isBk: k === 'bkash', isNg: k === 'nagad', isCard: k === 'card', isDuePay: k === 'due' }; };
var ranges = seg(self, [['today', 'আজ', 'Today'], ['yday', 'গতকাল', 'Yesterday'], ['week', 'এই সপ্তাহ', 'This week'], ['month', 'এই মাস', 'This month'], ['custom', 'তারিখ বাছুন', 'Pick dates']], rng, 'rng', i, 'chip');
ranges.forEach(function (o) { o.pick = function () { self.setState({ rng: o.k, sel: 0 }); }; });
return {
  excel: function () { toast(self, L('এক্সেল ফাইল বানানো হচ্ছে — ' + r.note[0] + ', ' + grp(r.memos) + 'টা মেমো। ডাউনলোডে পাবেন।', 'Building the Excel file — ' + r.note[1] + ', ' + grp(r.memos) + ' memos. Check your downloads.')); },
  ranges: ranges, isCustom: rng === 'custom',
  fromTxt: s.fromTxt == null ? dg('01/09/2026', bn) : s.fromTxt, toTxt: s.toTxt == null ? dg('15/09/2026', bn) : s.toTxt,
  typeFrom: function (e) { self.setState({ fromTxt: e.target.value }); }, typeTo: function (e) { self.setState({ toTxt: e.target.value }); },
  payF: payList, pf: pf,
  staffF: seg(self, [['all', 'সব স্টাফ', 'All staff'], ['rina', 'রিনা', 'Rina'], ['babu', 'বাবু', 'Babu'], ['sumon', 'সুমন', 'Sumon'], ['owner', 'মোস্তাফিজ', 'Mostafiz']], stF, 'stF', i, 'chip'),
  k: {
    rangeLbl: bn ? r.lbl[0] : r.lbl[1], sales: money(r.sales, bn), salesNote: r.note[i],
    memos: grp(r.memos) + L('টা', ''), memosNote: L('গড় মেমো ', 'Average memo ') + money(Math.round(r.sales / r.memos), bn),
    profit: money(r.profit, bn), profitNote: L('লাভের হার ', 'Margin ') + dg(Math.round(r.profit / r.sales * 100), bn) + '%',
    due: money(r.due, bn), dueNote: dg(r.dueN, bn) + L(' জন কাস্টমারের কাছে', r.dueN === 1 ? ' customer' : ' customers'),
    ret: money(r.ret, bn), retNote: dg(r.retN, bn) + L('টা ফেরত / বদল', ' returns / exchanges')
  },
  barTitle: barTitle, barPeak: peakLbl, barGap: few ? '10px' : '5px',
  bars: bars.map(function (b) { return { d: b.d, v: b.v, showV: few, tip: b.lab + ' · ' + money(b.val, bn), h: Math.max(4, Math.round(b.val / bmx * (few ? 58 : 76))) + 'px', bg: b.on ? '#003087' : '#c9d7ee', vfg: b.on ? '#003087' : '#64748b', dfg: b.on ? '#003087' : '#64748b', dfw: b.on ? 700 : 500 }; }),
  caption: L('দেখাচ্ছে ', 'Showing ') + dg(shown.length, bn) + L('টা · ', ' · ') + L('মোট ' + grp(r.memos) + 'টা মেমো · নতুনগুলো আগে', grp(r.memos) + ' memos in all · newest first'),
  noRows: shown.length === 0,
  rows: shown.map(function (m) { var p = PAY[m[4]]; var open = function () { self.setState({ sel: m[0] }); };
    return assign({ no: dg('#' + m[0], bn), time: (r.pre ? r.pre[i] : '') + tm(m[1], m[2]), cust: CU[m[3]][i], items: dg(m[6].length, bn) + L('টা', m[6].length === 1 ? ' item' : ' items'), pay: p[i], pbg: p[2], pfg: p[3], amt: money(total(m), bn), staff: ST[m[5]][i], bg: m[0] === sel ? '#eef3fb' : 'transparent', open: open }, pfl(m[4])); }),
  drawerOpen: !!s.sel, closeDrawer: function () { self.setState({ sel: 0 }); },
  d: assign(pfl(dm[4]), {
    title: L('মেমো ', 'Memo ') + dg('#' + dm[0], bn), when: whenOf(dm), pay: PAY[dm[4]][i], pbg: PAY[dm[4]][2], pfg: PAY[dm[4]][3],
    cust: CU[dm[3]][i], mobile: CU[dm[3]][2] ? dg(CU[dm[3]][2], bn) : t.noMobile, ini: dm[3] === 'walk' ? '?' : CU[dm[3]][i].slice(0, 1), cbg: dm[3] === 'walk' ? '#eef2f6' : '#e0e9f7', cfg: dm[3] === 'walk' ? '#64748b' : '#003087',
    staff: ST[dm[5]][i], itemsN: dg(dm[6].length, bn) + L('টা আইটেম', dm[6].length === 1 ? ' item' : ' items'),
    lines: dm[6].map(function (x) { var p = PR[x[0]]; return { name: p[i], qp: dg(x[1], bn) + ' × ' + money(p[2], bn), total: money(p[2] * x[1], bn) }; }),
    sub: money(dTot, bn), disc: money(0, bn), grand: money(dTot, bn), paid: money(dPaid, bn), isDue: dTot - dPaid > 0, due: money(dTot - dPaid, bn)
  }),
  reprint: function () { toast(self, L('মেমো ' + dg('#' + dm[0], true) + ' আবার প্রিন্ট হচ্ছে।', 'Printing memo #' + dm[0] + ' again.')); },
  editMemo: function () { toast(self, L('মেমো ঠিক করার জন্য খুলছে। সেভ করলে পুরোনোটার পাশে "বদলানো" লেখা থাকবে।', 'Opening the memo for editing. The old version stays marked as "edited".')); },
  sendSms: function () { toast(self, CU[dm[3]][2] ? L('মেমো SMS করা হলো: ' + dg(CU[dm[3]][2], true), 'Memo sent by SMS to ' + CU[dm[3]][2]) : L('এই কাস্টমারের মোবাইল নম্বর নেই।', 'This customer has no mobile number.')); }
};

    })();
    return assign(base, extra || {});
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#e9eef5;color:#0f172a;-webkit-font-smoothing:antialiased;font-family:'Hind Siliguri','Poppins',system-ui,sans-serif}
a{color:#003087;text-decoration:none}
button{font:inherit;color:inherit}
.fbn{font-family:'Hind Siliguri','Poppins',system-ui,sans-serif}
.fen{font-family:'Poppins','Hind Siliguri',system-ui,sans-serif}
.num{font-variant-numeric:tabular-nums}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.card{background:#fff;border:1px solid #e6eaf0;border-radius:18px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 10px 28px -18px rgba(15,23,42,.14)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 20px;border-radius:12px;border:0;font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;text-decoration:none;transition:background-color 200ms,border-color 200ms}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.line{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#0f172a}
.soft{background:#eef3fb;color:#003087}.soft:hover{background:#e0e9f7;color:#003087}
.okb{background:#047857;color:#fff}.okb:hover{background:#065f46;color:#fff}
.dang{background:#fff;color:#b83210;border:1px solid #f3b7a5}.dang:hover{background:#fff4f0;color:#b83210}
.sm{height:38px;padding:0 14px;font-size:14px;border-radius:10px}
.big{height:56px;padding:0 26px;font-size:17px;border-radius:14px}
.ib{width:44px;height:44px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#334155;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex-shrink:0}
.ib:hover{background:#f1f5f9}
.seg{display:inline-flex;padding:4px;gap:2px;border-radius:12px;background:#e9eef5}
.sgb{height:36px;padding:0 14px;border:0;border-radius:9px;background:transparent;font-size:14px;font-weight:500;color:#475569;cursor:pointer;white-space:nowrap}
.sgb.on{background:#fff;color:#003087;font-weight:700;box-shadow:0 1px 3px rgba(15,23,42,.14)}
.chip{height:38px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font-size:14px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:#eef3fb;color:#003087;font-weight:600}
.pill{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap}
.p-ok{background:#e7f8f1;color:#047857}.p-due{background:#ffece6;color:#b83210}.p-warn{background:#fff4e0;color:#a14f06}.p-info{background:#eef3fb;color:#003087}.p-grey{background:#eef2f6;color:#475569}.p-bk{background:#fdecf5;color:#a3195b}
.inp{width:100%;height:48px;padding:0 14px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;font:inherit;font-size:15px;color:#0f172a}
.inp:focus{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.inp::placeholder{color:#64748b}
.lbl{font-size:14px;font-weight:600;color:#334155}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.hint{font-size:13px;line-height:18px;color:#64748b}
.req{color:#b83210}
.th{font-size:13px;font-weight:600;color:#64748b;text-align:left;padding:10px 14px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:15px;vertical-align:middle}
.trow:hover{background:#f8fafc}
.h1{margin:0;font-size:26px;line-height:34px;font-weight:700}
.h2{margin:0;font-size:18px;line-height:24px;font-weight:700}
.sub{font-size:14.5px;color:#64748b}
.kpi{padding:18px 20px;display:flex;flex-direction:column;gap:4px}
.kpi .k{font-size:14.5px;color:#475569;font-weight:500}
.kpi .v{font-size:28px;line-height:36px;font-weight:700;font-variant-numeric:tabular-nums}
.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.tabl{display:flex;gap:4px;border-bottom:1px solid #e2e8f0}
.tl{position:relative;height:46px;padding:0 14px;border:0;background:transparent;font-size:15px;font-weight:500;color:#64748b;cursor:pointer;white-space:nowrap}
.tl.on{color:#003087;font-weight:700}.tl.on::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:3px;border-radius:3px 3px 0 0;background:#003087}
.row{display:flex;align-items:center;gap:12px;padding:14px 16px}
.row + .row{border-top:1px solid #eef2f6}
.bar{height:8px;border-radius:999px;background:#eef2f6;overflow:hidden;display:block}.bar>span{display:block;height:8px;border-radius:999px}
.note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:12px;font-size:14px;line-height:20px}
.n-info{background:#eef3fb;color:#1e3a6e}.n-warn{background:#fff8eb;color:#7a3b04;border:1px solid #fde3b5}.n-ok{background:#e7f8f1;color:#065f46}.n-due{background:#fff4f0;color:#8a2a0d;border:1px solid #f7c9bb}
.chipq{height:38px;padding:0 12px;border-radius:999px;border:1px solid #d6e0ef;background:#f5f8ff;color:#003087;font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap}
.wave span{display:inline-block;width:4px;margin:0 2px;border-radius:4px;background:#003087;animation:wv 900ms ease-in-out infinite}
.wave span:nth-child(2){animation-delay:.15s}.wave span:nth-child(3){animation-delay:.3s}.wave span:nth-child(4){animation-delay:.45s}.wave span:nth-child(5){animation-delay:.6s}
@keyframes wv{0%,100%{height:8px}50%{height:26px}}
.fade{animation:fd 240ms cubic-bezier(0,0,.2,1)}
@keyframes fd{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.btn:focus-visible,.ib:focus-visible,.sgb:focus-visible,.chip:focus-visible,.tl:focus-visible,.sw:focus-visible,.chipq:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}

.nav{display:flex;align-items:center;gap:11px;height:38px;padding:0 10px;border-radius:10px;color:#334155;font-size:14.5px;font-weight:500;text-decoration:none;transition:background-color 200ms,color 200ms}
.nav:hover{background:#f1f5f9;color:#0f172a}
.nav.on{background:rgba(0,48,135,.09);color:#003087;font-weight:700}
.nav .cnt{margin-left:auto;min-width:24px;height:21px;padding:0 7px;border-radius:999px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
.navh{font-size:12px;font-weight:600;letter-spacing:.04em;color:#64748b;padding:12px 10px 2px}
.act{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-radius:16px;border:1px solid #e6eaf0;background:#fff;cursor:pointer;text-align:left;text-decoration:none;color:#0f172a;transition:border-color 200ms,box-shadow 200ms}
.act:hover{border-color:#003087;box-shadow:0 8px 20px -12px rgba(0,48,135,.35);color:#0f172a}
.act .ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.alert{display:flex;align-items:center;gap:14px;padding:12px 16px;border-top:1px solid #eef2f6}
.abtn{height:38px;padding:0 14px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;font-size:14px;font-weight:600;color:#003087;cursor:pointer;white-space:nowrap}
.abtn:hover{background:#f1f5f9}
.mic{position:absolute;right:28px;bottom:28px;height:60px;padding:0 22px 0 8px;border-radius:999px;border:0;background:#003087;color:#fff;display:flex;align-items:center;gap:12px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 16px 32px -12px rgba(0,48,135,.6);z-index:20}
.mic .dotc{width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.42);z-index:15}
.drawer{position:absolute;top:0;right:0;bottom:0;width:520px;background:#fff;z-index:16;display:flex;flex-direction:column;box-shadow:-20px 0 50px -20px rgba(15,23,42,.35)}
.modal{position:absolute;left:50%;top:120px;transform:translateX(-50%);width:560px;background:#fff;border-radius:20px;z-index:16;box-shadow:0 30px 70px -20px rgba(15,23,42,.45)}

/* merged: English, compact controls, GridAI button */
body{font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif}
.btn{height:40px;padding:0 16px;font-size:14px;border-radius:10px}
.btn.sm,.sm{height:34px;padding:0 12px;font-size:13px;border-radius:9px}
.btn.big,.big{height:48px;padding:0 22px;font-size:15px;border-radius:12px}
.ib{width:40px;height:40px;border-radius:10px}
.chip{height:34px;padding:0 12px;font-size:13px}
.sgb{height:32px;padding:0 12px;font-size:13px}
.gfab{position:absolute;right:28px;bottom:28px;z-index:20;display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 20px 0 16px;border-radius:999px;background:#003087;color:#fff;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 14px 30px -12px rgba(0,48,135,.6)}
.gfab:hover{background:#002a77;color:#fff}
.gfab:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:3px}
.th,.td{white-space:normal}
`;

// ---- markup ----

export default class SalesBookScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SalesBook">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={v.rootCls} style={{ width: "1440px", height: "1350px", position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="sales-book" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "18px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <__Topbar crumb="Sales" page="Sales book" placeholder="Search products, customers or memo no." />
            <div style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", borderRadius: "15px", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
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
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <button type="button" className="btn line" onClick={v.excel}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12l7 7 7-7" />
</svg>{v.t?.excel}</button>
                <__Link href="/new-sale" className="btn solid"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>{v.t?.newSale}</__Link>
              </div>
              <section className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span className="lbl" style={{ width: "100px", flexShrink: "0", display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.t?.fDate}</span>
                  {__list(v.ranges).map((r, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={r?.cls} aria-pressed={r?.on} onClick={r?.pick}>{r?.l}</button>
                    </React.Fragment>))}
                  {v.isCustom ? (<>
                    <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px", paddingLeft: "14px", borderLeft: "1px solid #e2e8f0" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="lbl">{v.t?.from}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px", padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#475569" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                          </svg>
                          <input className="num" value={v.fromTxt} onInput={v.typeFrom} onChange={v.typeFrom} aria-label={v.t?.from} style={{ width: "118px", border: "0", outline: "none", font: "inherit", fontSize: "14.5px", color: "#0f172a", background: "transparent" }} />
                        </span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="lbl">{v.t?.to}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px", padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#475569" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                          </svg>
                          <input className="num" value={v.toTxt} onInput={v.typeTo} onChange={v.typeTo} aria-label={v.t?.to} style={{ width: "118px", border: "0", outline: "none", font: "inherit", fontSize: "14.5px", color: "#0f172a", background: "transparent" }} />
                        </span>
                      </label>
                    </div>
                  </>) : null}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span className="lbl" style={{ width: "100px", flexShrink: "0", display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
  <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
  <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.fPay}</span>
                  <button type="button" className={v.pf?.all?.cls} aria-pressed={v.pf?.all?.on} onClick={v.pf?.all?.pick} style={{ padding: "0 14px 0 8px" }}><span style={{ color: "#64748b", display: "flex" }}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18M7 12h10M10 18h4" />
  </svg>
</span>{v.pf?.all?.l}</button>
                  <button type="button" className={v.pf?.cash?.cls} aria-pressed={v.pf?.cash?.on} onClick={v.pf?.cash?.pick} style={{ padding: "0 14px 0 8px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
</svg>{v.pf?.cash?.l}</button>
                  <button type="button" className={v.pf?.bkash?.cls} aria-pressed={v.pf?.bkash?.on} onClick={v.pf?.bkash?.pick} style={{ padding: "0 14px 0 8px" }}><span style={{ width: "24px", height: "24px", borderRadius: "7px", background: "#e2136e", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</span>{v.pf?.bkash?.l}</button>
                  <button type="button" className={v.pf?.nagad?.cls} aria-pressed={v.pf?.nagad?.on} onClick={v.pf?.nagad?.pick} style={{ padding: "0 14px 0 8px" }}><span style={{ width: "24px", height: "24px", borderRadius: "7px", background: "#f26522", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</span>{v.pf?.nagad?.l}</button>
                  <button type="button" className={v.pf?.card?.cls} aria-pressed={v.pf?.card?.on} onClick={v.pf?.card?.pick} style={{ padding: "0 14px 0 8px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M7.5 10H40.5A4.5 4.5 0 0 1 45 14.5V33.5A4.5 4.5 0 0 1 40.5 38H7.5A4.5 4.5 0 0 1 3 33.5V14.5A4.5 4.5 0 0 1 7.5 10Z" fill="#0ea5e9" />
  <path d="M3 16h42v6h-42Z" fill="#003087" />
  <path d="M9.8 26H15.2A1.8 1.8 0 0 1 17 27.8V31.2A1.8 1.8 0 0 1 15.2 33H9.8A1.8 1.8 0 0 1 8 31.2V27.8A1.8 1.8 0 0 1 9.8 26Z" fill="#7dd3fc" />
  <path d="M22.3 28H37.7A1.3 1.3 0 0 1 39 29.3V29.3A1.3 1.3 0 0 1 37.7 30.6H22.3A1.3 1.3 0 0 1 21 29.3V29.3A1.3 1.3 0 0 1 22.3 28Z" fill="#ffffff" />
</svg>{v.pf?.card?.l}</button>
                  <button type="button" className={v.pf?.due?.cls} aria-pressed={v.pf?.due?.on} onClick={v.pf?.due?.pick} style={{ padding: "0 14px 0 8px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
  <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
  <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
  <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
  <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.pf?.due?.l}</button>
                  <span style={{ width: "1px", height: "26px", background: "#e2e8f0", margin: "0 8px" }} />
                  <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
  <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
  <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
  <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
  <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
</svg>{v.t?.fStaff}</span>
                  {__list(v.staffF).map((p, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={p?.cls} aria-pressed={p?.on} onClick={p?.pick}>{p?.l}</button>
                    </React.Fragment>))}
                </div>
              </section>
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr", gap: "14px" }}>
                <div style={{ padding: "16px 20px", borderRadius: "18px", background: "#003087", color: "#fff", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                        <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                        <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                        <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                        <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "14.5px", fontWeight: "500", opacity: ".85" }}>{v.t?.kSales} · {v.k?.rangeLbl}</span>
                  </div>
                  <div className="num" style={{ fontSize: "32px", lineHeight: "40px", fontWeight: "700" }}>{v.k?.sales}</div>
                  <div className="num" style={{ fontSize: "13.5px", opacity: ".85" }}>{v.k?.salesNote}</div>
                </div>
                <div className="card kpi" style={{ padding: "16px 18px" }}>
                  <div className="k" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
  <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
  <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
  <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
  <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
  <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
  <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
  <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
</svg>{v.t?.kMemos}</div>
                  <div className="v" style={{ fontSize: "26px", lineHeight: "34px" }}>{v.k?.memos}</div>
                  <div className="num hint">{v.k?.memosNote}</div>
                </div>
                <div className="card kpi" style={{ padding: "16px 18px" }}>
                  <div className="k" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M8.5 28H12.5A1.5 1.5 0 0 1 14 29.5V39.5A1.5 1.5 0 0 1 12.5 41H8.5A1.5 1.5 0 0 1 7 39.5V29.5A1.5 1.5 0 0 1 8.5 28Z" fill="#7dd3fc" />
  <path d="M18.5 22H22.5A1.5 1.5 0 0 1 24 23.5V39.5A1.5 1.5 0 0 1 22.5 41H18.5A1.5 1.5 0 0 1 17 39.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#7dd3fc" />
  <path d="M28.5 16H32.5A1.5 1.5 0 0 1 34 17.5V39.5A1.5 1.5 0 0 1 32.5 41H28.5A1.5 1.5 0 0 1 27 39.5V17.5A1.5 1.5 0 0 1 28.5 16Z" fill="#0ea5e9" />
  <path d="M6 21L16 13L24 17L39 7" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M33 5.5L42.5 4.5L41 13.5Z" fill="#0ea5e9" />
</svg>{v.t?.kProfit}</div>
                  <div className="v" style={{ fontSize: "26px", lineHeight: "34px", color: "#047857" }}>{v.k?.profit}</div>
                  <div className="num hint">{v.k?.profitNote}</div>
                </div>
                <div className="card kpi" style={{ padding: "16px 18px", borderColor: "#f7c9bb", background: "#fffaf8" }}>
                  <div className="k" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
  <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
  <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
  <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
  <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.kDue}</div>
                  <div className="v" style={{ fontSize: "26px", lineHeight: "34px", color: "#b83210" }}>{v.k?.due}</div>
                  <div className="num hint">{v.k?.dueNote}</div>
                </div>
                <div className="card kpi" style={{ padding: "16px 18px", borderColor: "#fde3b5", background: "#fffcf5" }}>
                  <div className="k" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
  <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
  <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
</svg>{v.t?.kRet}</div>
                  <div className="v" style={{ fontSize: "26px", lineHeight: "34px", color: "#a14f06" }}>{v.k?.ret}</div>
                  <div className="num hint">{v.k?.retNote}</div>
                </div>
              </div>
              <section className="card" style={{ padding: "14px 18px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                    <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                    <path d="M14 27H16.5A1 1 0 0 1 17.5 28V36A1 1 0 0 1 16.5 37H14A1 1 0 0 1 13 36V28A1 1 0 0 1 14 27Z" fill="#7dd3fc" />
                    <path d="M20.5 21H23.0A1 1 0 0 1 24.0 22V36A1 1 0 0 1 23.0 37H20.5A1 1 0 0 1 19.5 36V22A1 1 0 0 1 20.5 21Z" fill="#0ea5e9" />
                    <path d="M27 15H29.5A1 1 0 0 1 30.5 16V36A1 1 0 0 1 29.5 37H27A1 1 0 0 1 26 36V16A1 1 0 0 1 27 15Z" fill="#0ea5e9" />
                    <path d="M28 34a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#e0f2fe" />
                    <path d="M29 34a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M39.5 38.5L44 43" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2 className="h2" style={{ flexGrow: "1", fontSize: "16px" }}>{v.barTitle}</h2>
                  <span className="num hint" style={{ fontSize: "13.5px" }}>{v.barPeak}</span>
                </div>
                <div style={__sx(`height: 104px; display: flex; align-items: flex-end; gap: ${v.barGap ?? ""};`)}>
                  {__list(v.bars).map((b, $index) => (<React.Fragment key={$index}>
                      <div style={{ flex: "1 1 0", minWidth: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        {b?.showV ? (<>
                          <span className="num" style={__sx(`font-size: 11.5px; color: ${b?.vfg ?? ""}; font-weight: 600; white-space: nowrap;`)}>{b?.v}</span>
                        </>) : null}
                        <span title={b?.tip} style={__sx(`width: 100%; height: ${b?.h ?? ""}; border-radius: 6px 6px 2px 2px; background: ${b?.bg ?? ""};`)} />
                        <span className="num" style={__sx(`font-size: 12px; color: ${b?.dfg ?? ""}; font-weight: ${b?.dfw ?? ""}; white-space: nowrap;`)}>{b?.d}</span>
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px 10px" }}>
                  <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                    <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                    <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
                    <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
                    <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
                    <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
                    <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
                    <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
                  </svg>
                  <h2 className="h2" style={{ fontSize: "17px" }}>{v.t?.memos}</h2>
                  <span className="num hint" style={{ flexGrow: "1" }}>{v.caption}</span>
                  <span className="hint">{v.t?.tapRow}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th className="th">{v.t?.cNo}</th>
                      <th className="th">{v.t?.cTime}</th>
                      <th className="th">{v.t?.cCust}</th>
                      <th className="th">{v.t?.cItems}</th>
                      <th className="th">{v.t?.cPay}</th>
                      <th className="th" style={{ textAlign: "right" }}>{v.t?.cAmt}</th>
                      <th className="th">{v.t?.cStaff}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="trow" onClick={r?.open} style={__sx(`cursor: pointer; background: ${r?.bg ?? ""};`)}>
                          <td className="td num">
                            <button type="button" onClick={r?.open} style={{ border: "0", padding: "0", background: "transparent", font: "inherit", fontWeight: "700", color: "#003087", cursor: "pointer" }}>{r?.no}</button>
                          </td>
                          <td className="td num" style={{ color: "#475569", whiteSpace: "nowrap" }}>{r?.time}</td>
                          <td className="td" style={{ fontWeight: "600" }}>{r?.cust}</td>
                          <td className="td num" style={{ color: "#475569" }}>{r?.items}</td>
                          <td className="td">
                            <span className="pill" style={__sx(`background: ${r?.pbg ?? ""}; color: ${r?.pfg ?? ""}; gap: 5px; padding-left: 6px;`)}>{r?.isCash ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{r?.isBk ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</>) : null}{r?.isNg ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</>) : null}{r?.isCard ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M7.5 10H40.5A4.5 4.5 0 0 1 45 14.5V33.5A4.5 4.5 0 0 1 40.5 38H7.5A4.5 4.5 0 0 1 3 33.5V14.5A4.5 4.5 0 0 1 7.5 10Z" fill="#0ea5e9" />
    <path d="M3 16h42v6h-42Z" fill="#003087" />
    <path d="M9.8 26H15.2A1.8 1.8 0 0 1 17 27.8V31.2A1.8 1.8 0 0 1 15.2 33H9.8A1.8 1.8 0 0 1 8 31.2V27.8A1.8 1.8 0 0 1 9.8 26Z" fill="#7dd3fc" />
    <path d="M22.3 28H37.7A1.3 1.3 0 0 1 39 29.3V29.3A1.3 1.3 0 0 1 37.7 30.6H22.3A1.3 1.3 0 0 1 21 29.3V29.3A1.3 1.3 0 0 1 22.3 28Z" fill="#ffffff" />
  </svg>
</>) : null}{r?.isDuePay ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
    <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
    <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
    <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
    <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{r?.pay}</span>
                          </td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "700" }}>{r?.amt}</td>
                          <td className="td" style={{ color: "#475569" }}>{r?.staff}</td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.noRows ? (<>
                  <div style={{ padding: "28px", textAlign: "center", color: "#64748b", fontSize: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
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
                    <span>{v.t?.noRows}</span>
                  </div>
                </>) : null}
              </section>
              {v.drawerOpen ? (<>
                <div className="scrim" onClick={v.closeDrawer} aria-hidden="true" />
                <section className="drawer fade" aria-label={v.d?.title}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 22px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "13px", background: "#eef3fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                        <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                        <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
                        <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
                        <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
                        <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
                        <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
                        <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="h2 num" style={{ fontSize: "20px" }}>{v.d?.title}</h2>
                      <div className="num sub">{v.d?.when}</div>
                    </div>
                    <span className="pill" style={__sx(`background: ${v.d?.pbg ?? ""}; color: ${v.d?.pfg ?? ""}; gap: 5px; padding-left: 6px;`)}>{v.d?.isCash ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{v.d?.isBk ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</>) : null}{v.d?.isNg ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</>) : null}{v.d?.isCard ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M7.5 10H40.5A4.5 4.5 0 0 1 45 14.5V33.5A4.5 4.5 0 0 1 40.5 38H7.5A4.5 4.5 0 0 1 3 33.5V14.5A4.5 4.5 0 0 1 7.5 10Z" fill="#0ea5e9" />
    <path d="M3 16h42v6h-42Z" fill="#003087" />
    <path d="M9.8 26H15.2A1.8 1.8 0 0 1 17 27.8V31.2A1.8 1.8 0 0 1 15.2 33H9.8A1.8 1.8 0 0 1 8 31.2V27.8A1.8 1.8 0 0 1 9.8 26Z" fill="#7dd3fc" />
    <path d="M22.3 28H37.7A1.3 1.3 0 0 1 39 29.3V29.3A1.3 1.3 0 0 1 37.7 30.6H22.3A1.3 1.3 0 0 1 21 29.3V29.3A1.3 1.3 0 0 1 22.3 28Z" fill="#ffffff" />
  </svg>
</>) : null}{v.d?.isDuePay ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
    <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
    <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
    <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
    <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{v.d?.pay}</span>
                    <button type="button" className="ib" onClick={v.closeDrawer} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ flexGrow: "1", overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #eef2f6" }}>
                      <span style={__sx(`width: 44px; height: 44px; border-radius: 999px; background: ${v.d?.cbg ?? ""}; color: ${v.d?.cfg ?? ""}; font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center;`)}>{v.d?.ini}</span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700" }}>{v.d?.cust}</div>
                        <div className="num hint" style={{ fontSize: "14px" }}>{v.d?.mobile}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="hint">{v.t?.soldBy}</div>
                        <div style={{ fontSize: "15px", fontWeight: "600" }}>{v.d?.staff}</div>
                      </div>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                          <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                          <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                          <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                          <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                        </svg>
                        <span>{v.t?.itemsH} · <span className="num">{v.d?.itemsN}</span></span>
                      </div>
                      {__list(v.d?.lines).map((ln, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ flexGrow: "1", minWidth: "0" }}>
                              <div style={{ fontSize: "15px", fontWeight: "600" }}>{ln?.name}</div>
                              <div className="num hint">{ln?.qp}</div>
                            </div>
                            <span className="num" style={{ fontSize: "15px", fontWeight: "700" }}>{ln?.total}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "15px" }}>
                      <div style={{ display: "flex" }}>
                        <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.subtotal}</span>
                        <span className="num">{v.d?.sub}</span>
                      </div>
                      <div style={{ display: "flex" }}>
                        <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.disc}</span>
                        <span className="num">{v.d?.disc}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
                        <span style={{ flexGrow: "1", fontSize: "17px", fontWeight: "700" }}>{v.t?.grand}</span>
                        <span className="num" style={{ fontSize: "28px", fontWeight: "700", color: "#003087" }}>{v.d?.grand}</span>
                      </div>
                      <div style={{ display: "flex" }}>
                        <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.paid} ({v.d?.pay})</span>
                        <span className="num" style={{ fontWeight: "600", color: "#047857" }}>{v.d?.paid}</span>
                      </div>
                      {v.d?.isDue ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", background: "#ffece6", color: "#b83210", fontWeight: "700" }}>
                          <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                            <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
                            <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
                            <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
                            <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ flexGrow: "1" }}>{v.t?.dueLeft}</span>
                          <span className="num">{v.d?.due}</span>
                        </div>
                      </>) : null}
                    </div>
                  </div>
                  <div style={{ padding: "16px 22px 20px", borderTop: "1px solid #eef2f6", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                    <button type="button" className="btn solid" onClick={v.reprint}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.t?.reprint}</button>
                    <__Link href="/return-exchange" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
</svg>{v.t?.retEx}</__Link>
                    <button type="button" className="btn line" onClick={v.editMemo}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
</svg>{v.t?.edit}</button>
                    <button type="button" className="btn line" onClick={v.sendSms}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
</svg>{v.t?.sms}</button>
                  </div>
                </section>
              </>) : null}
            </div>
          </main>
          {v.hasMsg ? (<>
            <div className="fade" role="status" style={{ position: "absolute", top: "90px", left: "50%", transform: "translateX(-50%)", zIndex: "30", display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", borderRadius: "14px", background: "#0f172a", color: "#fff", fontSize: "15px", fontWeight: "500", boxShadow: "0 16px 36px -14px rgba(15,23,42,.6)", maxWidth: "640px" }}>
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
