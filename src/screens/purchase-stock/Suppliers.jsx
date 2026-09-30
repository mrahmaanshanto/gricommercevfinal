'use client';
// Generated from design/templates/purchase-stock/Suppliers.dc.html by scripts/convert-design.mjs.
// Suppliers & payables — Purchase — Suppliers & payables. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "hsub": ["কাকে কত টাকা দিতে হবে, কবে দিতে হবে — এক নজরে।", "Who you owe, how much, and when it is due."], "newSup": ["নতুন সাপ্লায়ার", "New supplier"], "newBuy": ["নতুন কেনা", "New purchase"], "kOwe": ["মোট দেনা", "Total payable"], "kToday": ["আজ দিতে হবে", "Due today"], "kWeek": ["এই সপ্তাহে দিতে হবে", "Due this week"], "kOver": ["মেয়াদ পেরিয়েছে", "Overdue"], "cal": ["দেনা শোধের ক্যালেন্ডার", "Payment calendar"], "calSub": ["২৪ সেপ্টেম্বর – ৭ অক্টোবর · দিনে চাপ দিলে কাকে দিতে হবে দেখাবে", "24 Sep – 7 Oct · tap a day to see who"], "nothing": ["এই দিনে কিছু দিতে হবে না", "Nothing due on this day"], "cSup": ["সাপ্লায়ার", "Supplier"], "cGoods": ["কী মাল দেয়", "Supplies"], "cYear": ["মোট কেনা (এই বছর)", "Bought this year"], "cOwe": ["দেনা", "Payable"], "cNext": ["পরের শোধের তারিখ", "Next due"], "cLast": ["শেষ পেমেন্ট", "Last payment"], "cAct": ["", ""], "pay": ["টাকা দিন", "Pay"], "ledger": ["খাতা দেখুন", "Ledger"], "noDue": ["দেনা নেই", "Nothing owed"], "payTitle": ["টাকা দিন", "Pay supplier"], "amount": ["কত টাকা দিচ্ছেন", "Amount"], "method": ["কীভাবে দিচ্ছেন", "Paid by"], "which": ["কোন চালানের টাকা", "Which invoices this settles"], "whichHint": ["টিক দিলে টাকার ঘর নিজে থেকে বসে যাবে", "Ticking fills in the amount for you"], "note": ["নোট", "Note"], "notePh": ["যেমন: সেলসম্যান রাজুর হাতে দিলাম", "e.g. handed to salesman Raju"], "paid": ["টাকা দিলাম", "Paid"], "nowOwe": ["এখন দেনা", "Owed now"], "after": ["দেওয়ার পর থাকবে", "Left after this"], "dTitle": ["নতুন সাপ্লায়ার", "New supplier"], "fName": ["সাপ্লায়ার / দোকানের নাম", "Supplier / shop name"], "fMobile": ["মোবাইল নম্বর", "Mobile number"], "fCompany": ["কোম্পানি / ব্র্যান্ড", "Company / brand"], "fGoods": ["কী মাল দেয়", "What they supply"], "fCredit": ["কত দিনের বাকি দেয়", "Credit they give"], "fOpen": ["আগের দেনা আছে?", "Any payable already?"], "fOpenHint": ["না থাকলে ০ রাখুন", "Leave 0 if none"], "fAddr": ["ঠিকানা", "Address"], "pageTitle": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"]};
var AI = [["আজ কাকে কত দিতে হবে?", "Who do I pay today?", "আজ ৩ জনকে মোট ৳৮৫,০০০: প্রাণ ডিস্ট্রিবিউশন ৳৪০,০০০, মেঘনা ট্রেডার্স ৳২৫,০০০, ইউনিলিভার ডিলার ৳২০,০০০।", "Three payments today, ৳85,000 in all: Dhaka Gadget Hub ৳40,000, Techland Imports ৳25,000, Mobile Mart ৳20,000."], ["মেঘনাকে ২৫ হাজার ক্যাশ দিলাম", "Paid Techland 25k cash", "লিখলাম: মেঘনা ট্রেডার্সকে ৳২৫,০০০ ক্যাশ, চালান MGT-1098 শোধ। বাকি দেনা ৳২৩,০০০।", "Noted: ৳25,000 cash to Techland Imports, invoice MGT-1098 settled. ৳23,000 still owed."], ["কার টাকা দিতে দেরি হয়ে গেছে?", "Whose payment is late?", "২ জনের তারিখ পেরিয়েছে: রহিম হোলসেল ৳৪,০০০ (৫ দিন), এসিআই ডিস্ট্রিবিউটর ৳৯,৫০০ (৩ দিন)।", "Two are overdue: Rahim Wholesale ৳4,000 (5 days) and CleanTech Supplies ৳9,500 (3 days)."]];
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

var MB = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
var ME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var WB = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'], WE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var D = function (d, m) { return bn ? dg(d, true) + ' ' + MB[m - 1] : d + ' ' + ME[m - 1]; };
var TODAY = 29 + 30; // day index: Sep d -> d + 30, Oct d -> d + 60
var dix = function (d, m) { return m === 9 ? d + 30 : m === 10 ? d + 60 : d; };
var fromIx = function (x) { return x > 60 ? [x - 60, 10] : [x - 30, 9]; };
// key, bn, en, mobile, company bn/en, goods bn/en, year purchase, colour idx, last pay [d, m, amt, method]
var SUP = [
  ['pran', 'প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', '01713-456789', 'প্রাণ-আরএফএল গ্রুপ', 'Importer', 'জুস, পানি, বিস্কুট, চানাচুর', 'Glass, adapters', 685000, 0, [22, 9, 10000, 'bkash']],
  ['meghna', 'মেঘনা ট্রেডার্স', 'Techland Imports', '01819-234567', 'পাইকার · মৌলভীবাজার', 'Wholesaler · Moulvibazar', 'চাল, ডাল, চিনি, সয়াবিন তেল', 'Cables, chargers', 940000, 1, [29, 9, 15000, 'cash']],
  ['unilever', 'ইউনিলিভার ডিলার', 'Mobile Mart', '01711-908070', 'ইউনিলিভার বাংলাদেশ', 'Patuatuli', 'সাবান, শ্যাম্পু, ডিটারজেন্ট', 'Cases, cleaning kits', 420000, 3, [27, 9, 10000, 'bank']],
  ['square', 'স্কয়ার কনজিউমার', 'Eastern Electronics', '01730-112233', 'স্কয়ার গ্রুপ', 'Motijheel', 'মসলা, সরিষার তেল', 'Car mounts, grips', 365000, 0, [28, 9, 10000, 'bank']],
  ['kazi', 'কাজী ফার্মস ডিলার', 'Kazi Farms dealer', '01912-445566', 'কাজী ফার্মস', 'Kazi Farms', 'ডিম, ফ্রোজেন খাবার', 'Batteries', 88000, 2, [25, 9, 4500, 'cash']],
  ['fresh', 'ফ্রেশ এন্টারপ্রাইজ', 'PowerCell Traders', '01555-667788', 'ফ্রেশ ব্র্যান্ড ডিলার', 'Battery dealer', 'আটা, চিনি, লবণ', 'Cables, SIM tools', 290000, 1, [19, 9, 6000, 'cash']],
  ['bsf', 'বসুন্ধরা ফুড ডিলার', 'PackRight Supplies', '01670-889900', 'বসুন্ধরা গ্রুপ', 'Tejgaon', 'আটা, ময়দা, টিস্যু', 'Packaging, pouches', 145000, 3, [20, 9, 10000, 'bkash']],
  ['aci', 'এসিআই ডিস্ট্রিবিউটর', 'CleanTech Supplies', '01799-334455', 'এসিআই লিমিটেড', 'Cleaning · Gulshan', 'লবণ, অ্যারোসল, স্যাভলন', 'Cleaning kits', 160000, 2, [12, 9, 5000, 'cash']],
  ['rahim', 'রহিম হোলসেল', 'Rahim Wholesale', '01822-778899', 'স্থানীয় পাইকার · মিরপুর ১', 'Local wholesaler · Mirpur 1', 'পেঁয়াজ, রসুন, আলু', 'Mixed accessories', 110000, 0, [27, 9, 6200, 'cash']]
];
// open invoices: no, supplier, bought d/m, amount owed, due d/m
var INV = [
  ['PRN-58102', 'pran', 15, 9, 40000, 29, 9], ['PRN-58190', 'pran', 22, 9, 25000, 6, 10],
  ['MGT-1098', 'meghna', 30, 8, 25000, 29, 9], ['MGT-1127', 'meghna', 29, 9, 23000, 29, 10],
  ['ULD-9031', 'unilever', 14, 9, 20000, 29, 9], ['ULD-9058', 'unilever', 27, 9, 8500, 7, 10],
  ['SQ-44781', 'square', 16, 9, 15000, 1, 10], ['SQ-44820', 'square', 28, 9, 17000, 12, 10],
  ['KF-5521', 'kazi', 25, 9, 3000, 2, 10], ['FE-2210', 'fresh', 19, 9, 18000, 3, 10], ['BSF-3302', 'bsf', 20, 9, 2000, 4, 10],
  ['CleanTech-7765', 'aci', 12, 9, 9500, 26, 9], ['RHW-118', 'rahim', 17, 9, 4000, 24, 9]
];
var MET = { cash: ['ক্যাশ', 'Cash'], bkash: ['বিকাশ', 'bKash'], bank: ['ব্যাংক', 'Bank'] };
var BGS = [['#eef3fb', '#003087'], ['#e7f8f1', '#047857'], ['#fff4e0', '#a14f06'], ['#fdecf5', '#a3195b']];
var settled = s.settled || {};
var open = INV.filter(function (v) { return !settled[v[0]]; });
var byKey = {}; SUP.forEach(function (x) { byKey[x[0]] = x; });
var oweOf = function (k) { return open.filter(function (v) { return v[1] === k; }).reduce(function (n, v) { return n + v[4]; }, 0) - (s.extra && s.extra[k] || 0); };
var nextOf = function (k) { var vs = open.filter(function (v) { return v[1] === k; }).sort(function (a, b) { return dix(a[5], a[6]) - dix(b[5], b[6]); }); return vs[0]; };
var relTxt = function (off) { return off === 0 ? L('আজ', 'Today') : off === 1 ? L('কাল', 'Tomorrow') : off > 0 ? dg(off, bn) + L(' দিন পর', ' days left') : dg(-off, bn) + L(' দিন পেরিয়েছে', ' days overdue'); };
var relCls = function (off) { return off < 0 ? 'pill p-due' : off === 0 ? 'pill p-warn' : 'pill p-grey'; };
var sumWhere = function (fn) { return open.filter(fn).reduce(function (n, v) { return n + v[4]; }, 0); };
var cntWhere = function (fn) { var o = {}; open.filter(fn).forEach(function (v) { o[v[1]] = 1; }); return Object.keys(o).length; };
var offOf = function (v) { return dix(v[5], v[6]) - TODAY; };
var totalOwe = SUP.reduce(function (n, x) { return n + oweOf(x[0]); }, 0);
var fl = s.fl || 'all', q = (s.q || '').toLowerCase();
var selIx = s.day == null ? TODAY : s.day;
var list = SUP.filter(function (x) {
  var nx = nextOf(x[0]); var off = nx ? offOf(nx) : 999;
  var ok = fl === 'all' || (fl === 'today' && off === 0) || (fl === 'week' && off >= 0 && off <= 6) || (fl === 'over' && off < 0);
  return ok && (!q || (x[1] + x[2] + x[3]).toLowerCase().indexOf(q) >= 0);
});
var pk = s.payFor, ps = byKey[pk || 'meghna'];
var pInv = open.filter(function (v) { return v[1] === ps[0]; });
var ticks = s.ticks || (pInv[0] ? (function () { var o = {}; o[pInv[0][0]] = 1; return o; })() : {});
var tickSum = pInv.filter(function (v) { return ticks[v[0]]; }).reduce(function (n, v) { return n + v[4]; }, 0);
var amt = s.payAmt == null ? tickSum : s.payAmt;
var pOwe = oweOf(ps[0]);
var pm = s.pm || 'cash';
return {
  k: {
    owe: money(totalOwe, bn), oweN: dg(cntWhere(function () { return true; }), bn) + L(' জন সাপ্লায়ার', ' suppliers'),
    today: money(sumWhere(function (v) { return offOf(v) === 0; }), bn), todayN: dg(cntWhere(function (v) { return offOf(v) === 0; }), bn) + L(' জন · প্রাণ, মেঘনা, ইউনিলিভার', ' suppliers · Dhaka Gadget Hub, Techland, Mobile Mart'),
    week: money(sumWhere(function (v) { var o = offOf(v); return o >= 0 && o <= 6; }), bn), weekN: L('আজ থেকে ৫ অক্টোবর · ', 'Today to 5 Oct · ') + dg(cntWhere(function (v) { var o = offOf(v); return o >= 0 && o <= 6; }), bn) + L(' জন', ' suppliers'),
    over: money(sumWhere(function (v) { return offOf(v) < 0; }), bn), overN: dg(cntWhere(function (v) { return offOf(v) < 0; }), bn) + L(' জন · এসিআই, রহিম হোলসেল', ' suppliers · CleanTech, Rahim Wholesale')
  },
  days: (function () { var out = []; for (var x = TODAY - 5; x < TODAY + 9; x++) { (function (ix) {
    var dm = fromIx(ix), due = open.filter(function (v) { return dix(v[5], v[6]) === ix; }).reduce(function (n, v) { return n + v[4]; }, 0);
    var isToday = ix === TODAY, over = ix < TODAY && due > 0, on = ix === selIx, wd = (2 + ix - TODAY + 70) % 7;
    out.push({
      wd: isToday ? L('আজ', 'Today') : (bn ? WB[wd] : WE[wd]), d: dg(dm[0], bn), amt: due ? money(due, bn) : '—',
      bg: over ? '#ffece6' : isToday ? '#003087' : due ? '#fffcf5' : '#fff',
      bd: on ? '2px solid #0f172a' : over ? '1px solid #f3b7a5' : isToday ? '1px solid #003087' : due ? '1px solid #fde3b5' : '1px solid #e6eaf0',
      wfg: isToday ? '#dbe6fb' : over ? '#b83210' : '#64748b', dfg: isToday ? '#fff' : ix < TODAY ? '#94a3b8' : '#0f172a',
      afg: isToday ? '#fff' : over ? '#b83210' : due ? '#a14f06' : '#cbd5e1',
      on: on, aria: D(dm[0], dm[1]) + ' · ' + (due ? money(due, bn) : t.nothing),
      pick: function () { self.setState({ day: ix }); }
    }); })(x); } return out; })(),
  selDay: (function () { var dm = fromIx(selIx), vs = open.filter(function (v) { return dix(v[5], v[6]) === selIx; }); return { l: D(dm[0], dm[1]) + (selIx === TODAY ? L(' (আজ)', ' (today)') : selIx < TODAY ? L(' (পেরিয়েছে)', ' (overdue)') : ''), who: vs.length ? vs.map(function (v) { return byKey[v[1]][1 + i] + ' ' + money(v[4], bn); }).join(' · ') : t.nothing }; })(),
  filters: seg(self, [['all', 'সব (৯)', 'All (9)'], ['today', 'আজ দিতে হবে', 'Due today'], ['week', 'এই সপ্তাহে', 'This week'], ['over', 'মেয়াদ পেরিয়েছে', 'Overdue']], fl, 'fl', i, 'chip').map(function (o) { return assign(o, { fAll: o.k === 'all', fToday: o.k === 'today', fWeek: o.k === 'week', fOver: o.k === 'over' }); }),
  q: s.q || '', typeQ: function (e) { self.setState({ q: e.target.value }); },
  rows: list.map(function (x) {
    var b = BGS[x[9]], ow = oweOf(x[0]), nx = nextOf(x[0]), off = nx ? offOf(nx) : null, lp = x[10];
    return {
      ini: x[1 + i].slice(0, 1), bg: b[0], fg: b[1], name: x[1 + i], mobile: dg(x[3], bn), company: x[4 + i], goods: x[6 + i],
      year: money(x[8], bn), owe: ow > 0 ? money(ow, bn) : '—', oweFg: ow > 0 ? '#a14f06' : '#94a3b8', hasOwe: ow > 0,
      nextRel: nx ? relTxt(off) : t.noDue, nextCls: nx ? relCls(off) : 'pill p-ok', nextSub: nx ? D(nx[5], nx[6]) + ' · ' + money(nx[4], bn) : '',
      last: D(lp[0], lp[1]), lastSub: money(lp[2], bn) + ' · ' + MET[lp[3]][i],
      pay: function () { self.setState({ payFor: x[0], payOpen: true, ticks: null, payAmt: null, pm: 'cash' }); }
    };
  }),
  isEmpty: !list.length,
  payOpen: !!s.payOpen, closePay: function () { self.setState({ payOpen: false }); },
  pm: {
    name: ps[1 + i], owe: money(pOwe, bn), amtTxt: dg(amt, bn), amtMoney: money(amt, bn), left: money(Math.max(0, pOwe - amt), bn),
    typeAmt: function (e) { self.setState({ payAmt: num(unbn(e.target.value)) }); },
    methods: seg(self, [['cash', 'ক্যাশ', 'Cash'], ['bkash', 'বিকাশ', 'bKash'], ['bank', 'ব্যাংক', 'Bank']], pm, 'pm', i, 'chip').map(function (o) { return assign(o, { isCash: o.k === 'cash', isBk: o.k === 'bkash', isBank: o.k === 'bank' }); }),
    invs: pInv.map(function (v) { var on = !!ticks[v[0]], off = offOf(v); return {
      no: dg(v[0], bn), sub: L('কেনা ', 'Bought ') + D(v[2], v[3]), due: off === 0 ? L('আজ', 'Today') : D(v[5], v[6]), dueCls: relCls(off), amt: money(v[4], bn), on: on,
      bd: on ? '#003087' : '#e2e8f0', bg: on ? '#f5f8ff' : '#fff', boxBd: on ? '#003087' : '#94a3b8', boxBg: on ? '#003087' : '#fff',
      toggle: function () { var o = assign({}, ticks); if (on) delete o[v[0]]; else o[v[0]] = 1; self.setState({ ticks: o, payAmt: null }); }
    }; }),
    confirm: function () {
      if (!amt) { toast(self, L('কত টাকা দিচ্ছেন লিখুন।', 'Enter the amount first.')); return; }
      var st2 = assign({}, settled), left = amt;
      pInv.filter(function (v) { return ticks[v[0]]; }).forEach(function (v) { if (left >= v[4]) { st2[v[0]] = 1; left -= v[4]; } });
      var ex = assign({}, s.extra || {}); ex[ps[0]] = (ex[ps[0]] || 0) + left;
      self.setState({ payOpen: false, settled: st2, extra: ex, ticks: null, payAmt: null });
      toast(self, L(ps[1] + 'কে ' + money(amt, true) + ' দেওয়া হলো (' + MET[pm][0] + ')। বাকি দেনা ' + money(Math.max(0, pOwe - amt), true) + '।', 'Paid ' + money(amt, false) + ' to ' + ps[2] + ' (' + MET[pm][1] + '). Still owed: ' + money(Math.max(0, pOwe - amt), false) + '.'));
    }
  },
  newOpen: !!s.newOpen, openNew: function () { self.setState({ newOpen: true }); }, closeNew: function () { self.setState({ newOpen: false }); },
  nf: { name: L('নিউ বেঙ্গল ট্রেডার্স', 'New Bengal Gadgets'), mobile: dg('01716-552244', bn), company: L('পুষ্টি ব্র্যান্ড ডিলার', 'Pusti brand dealer'), goods: L('আটা, সয়াবিন তেল', 'Chargers, adapters'), open: dg(0, bn), addr: L('কারওয়ান বাজার, ঢাকা', 'Karwan Bazar, Dhaka') },
  credits: seg(self, [[0, 'নগদে দিতে হয়', 'Cash only'], [7, '৭ দিন', '7 days'], [15, '১৫ দিন', '15 days'], [30, '৩০ দিন', '30 days']], s.credit == null ? 15 : s.credit, 'credit', i, 'chip'),
  saveNew: function () { self.setState({ newOpen: false }); toast(self, L('নতুন সাপ্লায়ার যোগ হলো: নিউ বেঙ্গল ট্রেডার্স।', 'Supplier added: New Bengal Gadgets.')); }
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

export default class SuppliersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Suppliers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={v.rootCls} style={{ width: "1440px", height: "1500px", position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-suppliers" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "18px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <__Topbar crumb="Purchase" page={"Suppliers & payables"} placeholder="Search products, customers or memo no." />
            <div style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", borderRadius: "15px", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
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
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <__Link href="/buy-goods" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.5L22 8H6M9 21h.01M18 21h.01" />
</svg>{v.t?.newBuy}</__Link>
                <button type="button" className="btn solid" onClick={v.openNew}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>{v.t?.newSup}</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                <div className="card kpi" style={{ borderColor: "#fde3b5", background: "#fffcf5" }}>
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
  <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.kOwe}</span>
                  <span className="v" style={{ color: "#a14f06" }}>{v.k?.owe}</span>
                  <span className="hint num">{v.k?.oweN}</span>
                </div>
                <div className="card kpi">
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.t?.kToday}</span>
                  <span className="v">{v.k?.today}</span>
                  <span className="hint num">{v.k?.todayN}</span>
                </div>
                <div className="card kpi">
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M4 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z" fill="#e0f2fe" />
  <path d="M8.5 24a13.5 13.5 0 1 0 27.0 0a13.5 13.5 0 1 0 -27.0 0Z" fill="#ffffff" />
  <path d="M22 16V24.5L28 28" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M29 36a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
  <path d="M33 36l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.kWeek}</span>
                  <span className="v">{v.k?.week}</span>
                  <span className="hint num">{v.k?.weekN}</span>
                </div>
                <div className="card kpi" style={{ borderColor: "#f7c9bb", background: "#fffaf8" }}>
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M24 5C16.5 5 12 10.5 12 18V27L8 33H40L36 27V18C36 10.5 31.5 5 24 5Z" fill="#0ea5e9" />
  <path d="M23 34H25A3 3 0 0 1 28 37V37A3 3 0 0 1 25 40H23A3 3 0 0 1 20 37V37A3 3 0 0 1 23 34Z" fill="#0ea5e9" />
  <path d="M30.5 10a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#0ea5e9" />
</svg>{v.t?.kOver}</span>
                  <span className="v" style={{ color: "#b83210" }}>{v.k?.over}</span>
                  <span className="hint num">{v.k?.overN}</span>
                </div>
              </div>
              <section className="card" style={{ padding: "14px 18px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                  <h2 className="h2">{v.t?.cal}</h2>
                  <span className="hint">{v.t?.calSub}</span>
                  <span style={{ flexGrow: "1" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(14, minmax(0, 1fr))", gap: "6px" }}>
                  {__list(v.days).map((dd, $index) => (<React.Fragment key={$index}>
                      <button type="button" onClick={dd?.pick} aria-pressed={dd?.on} aria-label={dd?.aria} style={__sx(`height: 84px; padding: 6px 2px; border-radius: 12px; border: ${dd?.bd ?? ""}; background: ${dd?.bg ?? ""}; display: flex; flex-direction: column; align-items: center; justify-content: space-between; cursor: pointer;`)}>
                        <span style={__sx(`font-size: 12px; color: ${dd?.wfg ?? ""}; font-weight: 600;`)}>{dd?.wd}</span>
                        <span className="num" style={__sx(`font-size: 19px; line-height: 22px; font-weight: 700; color: ${dd?.dfg ?? ""};`)}>{dd?.d}</span>
                        <span className="num" style={__sx(`font-size: 12px; font-weight: 700; color: ${dd?.afg ?? ""};`)}>{dd?.amt}</span>
                      </button>
                    </React.Fragment>))}
                </div>
                <div className="num" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14.5px" }}>
                  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
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
                  <b>{v.selDay?.l}:</b>
                  <span style={{ color: "#334155" }}>{v.selDay?.who}</span>
                </div>
              </section>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid #eef2f6" }}>
                  {__list(v.filters).map((o, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick}>{o?.fAll ? (<>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a5 5 0 0 0-4-5" />
  </svg>
</>) : null}{o?.fToday ? (<>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
  </svg>
</>) : null}{o?.fWeek ? (<>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />
  </svg>
</>) : null}{o?.fOver ? (<>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />
  </svg>
</>) : null}{o?.l}</button>
                    </React.Fragment>))}
                  <span style={{ flexGrow: "1" }} />
                  <label style={{ width: "260px", height: "40px", display: "flex", alignItems: "center", gap: "8px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "10px", color: "#64748b" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
                    </svg>
                    <input value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder={v.t?.cSup} aria-label={v.t?.cSup} style={{ flexGrow: "1", minWidth: "0", border: "0", outline: "none", font: "inherit", fontSize: "14.5px", background: "transparent", color: "#0f172a" }} />
                  </label>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th className="th">{v.t?.cSup}</th>
                      <th className="th">{v.t?.cGoods}</th>
                      <th className="th" style={{ textAlign: "right" }}>{v.t?.cYear}</th>
                      <th className="th" style={{ textAlign: "right" }}>{v.t?.cOwe}</th>
                      <th className="th">{v.t?.cNext}</th>
                      <th className="th">{v.t?.cLast}</th>
                      <th className="th" />
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="trow">
                          <td className="td" style={{ padding: "8px 14px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={__sx(`width: 36px; height: 36px; border-radius: 10px; background: ${r?.bg ?? ""}; color: ${r?.fg ?? ""}; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>{r?.ini}</span>
                              <span style={{ minWidth: "0" }}>
                                <span style={{ display: "block", fontWeight: "700", lineHeight: "20px" }}>{r?.name}</span>
                                <span className="num" style={{ display: "block", fontSize: "12.5px", color: "#64748b", whiteSpace: "nowrap" }}>{r?.mobile} · {r?.company}</span>
                              </span>
                            </span>
                          </td>
                          <td className="td" style={{ paddingTop: "8px", paddingBottom: "8px", fontSize: "14px", color: "#475569", lineHeight: "19px" }}>{r?.goods}</td>
                          <td className="td num" style={{ textAlign: "right" }}>{r?.year}</td>
                          <td className="td num" style={__sx(`text-align: right; font-size: 16px; font-weight: 700; color: ${r?.oweFg ?? ""};`)}>{r?.owe}</td>
                          <td className="td" style={{ paddingTop: "8px", paddingBottom: "8px" }}>
                            <span className={r?.nextCls}>{r?.nextRel}</span>
                            <span className="num" style={{ display: "block", fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>{r?.nextSub}</span>
                          </td>
                          <td className="td" style={{ paddingTop: "8px", paddingBottom: "8px" }}>
                            <span className="num" style={{ display: "block", fontSize: "14px", fontWeight: "600" }}>{r?.last}</span>
                            <span className="num" style={{ display: "block", fontSize: "12.5px", color: "#64748b" }}>{r?.lastSub}</span>
                          </td>
                          <td className="td" style={{ padding: "8px 12px 8px 4px" }}>
                            <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              {r?.hasOwe ? (<>
                                <button type="button" className="btn solid sm" onClick={r?.pay}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M7 7h11l-3-3M17 17H6l3 3" />
</svg>{v.t?.pay}</button>
                              </>) : null}
                              <__Link href="/supplier-detail" className="btn line sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
</svg>{v.t?.ledger}</__Link>
                            </span>
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.isEmpty ? (<>
                  <div style={{ padding: "36px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center", color: "#64748b" }}><svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.t?.noDue}</div>
                </>) : null}
              </section>
              {v.payOpen ? (<>
                <div className="scrim" onClick={v.closePay} />
                <section className="modal fade" role="dialog" aria-label={v.t?.payTitle} style={{ top: "90px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 22px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff8eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                        <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                        <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                        <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                        <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.t?.payTitle} · {v.pm?.name}</h2>
                      <div className="num" style={{ fontSize: "14px", color: "#475569" }}>{v.t?.nowOwe} <b style={{ color: "#a14f06" }}>{v.pm?.owe}</b></div>
                    </div>
                    <button type="button" className="ib" onClick={v.closePay} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                      <label className="fld" style={{ flexGrow: "1" }}>
                        <span className="lbl">{v.t?.amount}</span>
                        <input className="inp num" value={v.pm?.amtTxt} onInput={v.pm?.typeAmt} onChange={v.pm?.typeAmt} aria-label={v.t?.amount} style={{ height: "58px", fontSize: "26px", fontWeight: "700" }} />
                      </label>
                      <div style={{ width: "180px", height: "58px", padding: "0 12px", borderRadius: "12px", background: "#fff4e0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#7a3b04" }}>{v.t?.after}</span>
                        <span className="num" style={{ fontSize: "19px", fontWeight: "700", color: "#a14f06" }}>{v.pm?.left}</span>
                      </div>
                    </div>
                    <div className="fld">
                      <span className="lbl">{v.t?.method}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {__list(v.pm?.methods).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ flex: "1", justifyContent: "center", height: "48px" }}>{o?.isCash ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.isBk ? (<>
  <span style={{ width: "24px", height: "24px", borderRadius: "7px", background: "#fdecf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
      <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
      <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
      <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
      <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
      <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
    </svg>
  </span>
</>) : null}{o?.isBank ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M4 17L24 5L44 17Z" fill="#0ea5e9" />
    <path d="M7 16H41A1 1 0 0 1 42 17V19A1 1 0 0 1 41 20H7A1 1 0 0 1 6 19V17A1 1 0 0 1 7 16Z" fill="#003087" />
    <path d="M9 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M17 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M26.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M34.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M6.5 35H41.5A1.5 1.5 0 0 1 43 36.5V39.5A1.5 1.5 0 0 1 41.5 41H6.5A1.5 1.5 0 0 1 5 39.5V36.5A1.5 1.5 0 0 1 6.5 35Z" fill="#003087" />
    <path d="M21.8 12.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div className="fld">
                      <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
  <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
  <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
  <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
  <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
  <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
  <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
  <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
</svg>{v.t?.which}</span>
                      <span className="hint">{v.t?.whichHint}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                        {__list(v.pm?.invs).map((v, $index) => (<React.Fragment key={$index}>
                            <button type="button" role="checkbox" aria-checked={v?.on} onClick={v?.toggle} style={__sx(`display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; border: 1px solid ${v?.bd ?? ""}; background: ${v?.bg ?? ""}; cursor: pointer; text-align: left;`)}>
                              <span style={__sx(`width: 24px; height: 24px; border-radius: 7px; border: 2px solid ${v?.boxBd ?? ""}; background: ${v?.boxBg ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </span>
                              <span style={{ flexGrow: "1" }}>
                                <span className="num mono" style={{ display: "block", fontSize: "14.5px", fontWeight: "700" }}>{v?.no}</span>
                                <span className="num" style={{ display: "block", fontSize: "13px", color: "#64748b" }}>{v?.sub}</span>
                              </span>
                              <span className={v?.dueCls}>{v?.due}</span>
                              <span className="num" style={{ width: "90px", textAlign: "right", fontWeight: "700" }}>{v?.amt}</span>
                            </button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <label className="fld">
                      <span className="lbl">{v.t?.note}</span>
                      <input className="inp" placeholder={v.t?.notePh} aria-label={v.t?.note} />
                    </label>
                  </div>
                  <div style={{ padding: "14px 22px 18px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn line" onClick={v.closePay}>{v.t?.cancel}</button>
                    <button type="button" className="btn okb" onClick={v.pm?.confirm} style={{ minWidth: "200px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.paid} · {v.pm?.amtMoney}</button>
                  </div>
                </section>
              </>) : null}
              {v.newOpen ? (<>
                <div className="scrim" onClick={v.closeNew} />
                <section className="drawer fade" aria-label={v.t?.dTitle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 22px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff8eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
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
                    <h2 className="h2" style={{ flexGrow: "1", fontSize: "21px" }}>{v.t?.dTitle}</h2>
                    <button type="button" className="ib" onClick={v.closeNew} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ flexGrow: "1", overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <label className="fld">
                      <span className="lbl">{v.t?.fName} <span className="req">*</span></span>
                      <input className="inp" defaultValue={v.nf?.name} aria-label={v.t?.fName} style={{ fontWeight: "600" }} />
                    </label>
                    <label className="fld">
                      <span className="lbl">{v.t?.fMobile} <span className="req">*</span></span>
                      <input className="inp num" defaultValue={v.nf?.mobile} inputMode="tel" aria-label={v.t?.fMobile} />
                    </label>
                    <label className="fld">
                      <span className="lbl">{v.t?.fCompany}</span>
                      <input className="inp" defaultValue={v.nf?.company} aria-label={v.t?.fCompany} />
                    </label>
                    <label className="fld">
                      <span className="lbl">{v.t?.fGoods}</span>
                      <input className="inp" defaultValue={v.nf?.goods} aria-label={v.t?.fGoods} />
                    </label>
                    <div className="fld">
                      <span className="lbl">{v.t?.fCredit}</span>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {__list(v.credits).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick}>{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <label className="fld">
                      <span className="lbl">{v.t?.fOpen}</span>
                      <input className="inp num" defaultValue={v.nf?.open} aria-label={v.t?.fOpen} />
                      <span className="hint">{v.t?.fOpenHint}</span>
                    </label>
                    <label className="fld">
                      <span className="lbl">{v.t?.fAddr}</span>
                      <input className="inp" defaultValue={v.nf?.addr} aria-label={v.t?.fAddr} />
                    </label>
                  </div>
                  <div style={{ padding: "14px 22px 20px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px" }}>
                    <button type="button" className="btn line" onClick={v.closeNew} style={{ flex: "1" }}>{v.t?.cancel}</button>
                    <button type="button" className="btn solid" onClick={v.saveNew} style={{ flex: "2" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.save}</button>
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
