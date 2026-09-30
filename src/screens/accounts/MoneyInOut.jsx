'use client';
// Generated from design/templates/accounts/MoneyInOut.dc.html by scripts/convert-design.mjs.
// Money in & out — Accounts — Money in & out. Imported from Retail Commerce and merged.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

var BND = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function dg(s, bn) { s = String(s); return bn ? s.replace(/[0-9]/g, function (d) { return BND[+d]; }) : s; }
function money(n, bn) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return dg((n < 0 ? '−' : '') + '৳' + s, bn); }
function num(x) { return +(String(x).replace(/[^\d.]/g, '').replace(/^$/, '0')) || 0; }
function unbn(x) { return String(x).replace(/[০-৯]/g, function (d) { return BND.indexOf(d); }); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, { tone: bad ? 'error' : 'success' }); }
function setQuery(key, value) { if (typeof window === 'undefined') return; var u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
function getQuery(key) { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get(key) || ''; }
function seg(self, opts, cur, key, i, base) { return opts.map(function (o) { var on = o[0] === cur; return { k: o[0], l: o[1 + i], on: on, cls: (base || 'sgb') + (on ? ' on' : ''), pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function sw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["টাকা আসা-যাওয়া", "Money in & out"], "hsub": ["কোন টাকা কোথা থেকে এলো, কোথায় গেলো — সব এক জায়গায়", "Where money came from and where it went — all in one place"], "gotBtn": ["টাকা পেলাম", "Money received"], "paidBtn": ["টাকা দিলাম", "Money paid"], "move": ["টাকা সরান", "Move money"], "dueToday": ["আজকের মধ্যে যা দিতে হবে", "To pay by today"], "payNow": ["দিন", "Pay"], "done": ["দেওয়া হয়েছে", "Paid"], "txTitle": ["আজকের লেনদেন", "Today’s transactions"], "cTime": ["সময়", "Time"], "cWhat": ["কী বাবদ", "What for"], "cAcc": ["অ্যাকাউন্ট", "Account"], "cIn": ["এলো", "In"], "cOut": ["গেলো", "Out"], "cBy": ["কে লিখেছে", "Entered by"], "fromWhom": ["কার কাছ থেকে পেলেন", "Received from"], "toWhom": ["কাকে দিলেন", "Paid to"], "who": ["কে", "Who"], "amount": ["কত টাকা", "Amount"], "intoAcc": ["কোথায় রাখলেন", "Into which account"], "fromAcc": ["কোথা থেকে দিলেন", "From which account"], "note": ["নোট (দরকার হলে)", "Note (optional)"], "saveIn": ["টাকা পেলাম · সেভ করুন", "Save money received"], "saveOut": ["টাকা দিলাম · সেভ করুন", "Save money paid"], "trFrom": ["কোথা থেকে সরাবেন", "Move from"], "trTo": ["কোথায় রাখবেন", "Move to"], "trHint": ["এটা আয় বা খরচ না — শুধু এক জায়গার টাকা আরেক জায়গায় গেলো।", "This is not income or expense — money just moves from one place to another."], "otherPh": ["যেমন: পুরনো কার্টন বিক্রি", "e.g. sold old cartons"], "otherOutPh": ["যেমন: দোকান মেরামত", "e.g. shop repair"], "empty": ["এই ফিল্টারে কোনো লেনদেন নেই", "No transactions for this filter"], "pageTitle": ["টাকা আসা-যাওয়া", "Money in & out"]};
var AI = [["আজ কত টাকা এলো আর কত গেলো?", "How much came in and went out today?", "আজ এলো ৳৫৩,৮৫০, গেলো ৳৯৭,৩০০। বেশি গেছে কারণ মেঘনা ট্রেডার্সকে ৳৬০,০০০ দেনা শোধ করেছেন। হাতে মোট আছে ৳৩,৯৩,৪০০।", "In today: ৳53,850, out: ৳97,300 — mostly the ৳60,000 paid to Techland Imports. Total in hand: ৳3,93,400."], ["ক্যাশ থেকে ২০ হাজার ব্যাংকে জমা দিলাম", "Deposited 20k cash into the bank", "লিখলাম: ক্যাশ ড্রয়ার থেকে ৳২০,০০০ ডাচ-বাংলা ব্যাংকে। ক্যাশে থাকবে ৳১২,৪০০। ঠিক আছে?", "Noted: ৳20,000 from the cash drawer to DBBL. Cash left: ৳12,400. Correct?"], ["প্রাণকে ৪০ হাজার দিলাম ব্যাংক থেকে", "Paid Dhaka Gadget Hub 40k from the bank", "লিখলাম: প্রাণ ডিস্ট্রিবিউশনকে ৳৪০,০০০ দেনা শোধ, DBBL থেকে। আজ আর দিতে বাকি ৳৪৫,০০০ — স্কয়ার আর ফ্রেশ।", "Noted: ৳40,000 paid to Dhaka Gadget Hub from DBBL. Still to pay today: ৳45,000 — Square and Fresh."]];
var NAVC = {"stock": "7", "customers": "12", "suppliers": "3"};

class Component extends DCLogic {
  // Deep links: /money-in-out?type=in|out opens that form first (Home quick actions use it).
  // ?show=in|out keeps the transaction filter and ?period=week|month the period across reloads.
  componentDidMount() {
    var self = this, p = {}, ty = getQuery('type'), show = getQuery('show'), per = getQuery('period');
    if (ty === 'in') p = { m: 'in', inT: 'due', amt: null, who: null, acc: null };
    else if (ty === 'out') p = { m: 'out', outT: 'sup', amt: null, who: null, acc: null };
    if (show === 'in' || show === 'out') p.tf = show;
    if (per === 'week' || per === 'month') p.per = per;
    if (Object.keys(p).length) this.setState(p);
    this.onKey = function (e) { if (e.key === 'Escape' && (self.state || {}).m) { self.setState({ m: '' }); setQuery('type', ''); } };
    document.addEventListener('keydown', this.onKey);
  }
  componentDidUpdate(prevProps, prevState) {
    var was = (prevState || {}).m || '', now = (this.state || {}).m || '';
    if (now && !was) { this.opener = document.activeElement; var d = document.getElementById('mio-dialog'); if (d) d.focus(); }
    if (!now && was && this.opener && this.opener.focus && document.body.contains(this.opener)) { this.opener.focus(); this.opener = null; }
  }
  componentWillUnmount() { clearTimeout(this.t); document.removeEventListener('keydown', this.onKey); }
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
      hasMsg: false, msg: ''
    };
    var extra = (function () {

var ACC = [
  ['cash', 'ক্যাশ ড্রয়ার', 'Cash drawer', 'ক্যাশ', 'Cash', 32400, 'দোকানের ড্রয়ারে', 'In the shop drawer', '#047857', 'pill p-ok'],
  ['bkash', 'বিকাশ', 'bKash', 'বিকাশ', 'bKash', 18750, '০১৭১১-৫৫৬৬৭৭ · মার্চেন্ট', '01711-556677 · merchant', '#a3195b', 'pill p-bk'],
  ['nagad', 'নগদ', 'Nagad', 'নগদ', 'Nagad', 6200, '০১৮১৯-৩৩৪৪৫৫', '01819-334455', '#d97706', 'pill p-warn'],
  ['rocket', 'রকেট', 'Rocket', 'রকেট', 'Rocket', 2150, '০১৯১২-৬৬৭৭৮৮৫', '01912-6677885', '#6d28d9', 'pill p-grey'],
  ['dbbl', 'ডাচ-বাংলা ব্যাংক', 'DBBL', 'DBBL', 'DBBL', 245600, 'DBBL', 'DBBL', '#003087', 'pill p-info'],
  ['city', 'সিটি ব্যাংক', 'City Bank', 'City', 'City', 88300, 'City', 'City', '#003087', 'pill p-info']
];
var A = {}; ACC.forEach(function (a) { A[a[0]] = a; });
var KIND = { cash: 'cash', bkash: 'phone', nagad: 'phone', rocket: 'phone', dbbl: 'bank', city: 'bank', bank: 'bank' };
var TINT = { cash: '#e7f8f1', bkash: '#fdecf5', nagad: '#fff1e3', rocket: '#f1ebfd', dbbl: '#eef3fb', city: '#eef3fb', bank: '#eef3fb' };
var accIc = function (k) { return { isCash: KIND[k] === 'cash', isPhone: KIND[k] === 'phone', isBank: KIND[k] === 'bank', tint: TINT[k] }; };
var typeIc = function (ty) { return { isSale: ty === 'sale', isDue: ty === 'due', isExp: ty === 'exp', isSup: ty === 'sup', isSal: ty === 'sal', isOther: ty === 'other' }; };
var txType = function (ttl) { return ttl.indexOf('বেচা') === 0 ? 'sale' : ttl.indexOf('বাকি আদায়') === 0 ? 'due' : ttl.indexOf('খরচ') === 0 ? 'exp' : ttl.indexOf('দেনা শোধ') === 0 ? 'sup' : ttl.indexOf('বেতন') === 0 ? 'sal' : 'other'; };
var TX = [
  ['১০:৪২', '10:42', 'in', 'বেচা #১০৪২', 'Sale #1042', 'রফিক মিয়া', 'Rafiq Mia', 'cash', 2450, 'রিনা', 'Rina'],
  ['১০:৩৫', '10:35', 'in', 'বেচা #১০৪১', 'Sale #1041', 'হেঁটে আসা কাস্টমার', 'Walk-in customer', 'bkash', 860, 'রিনা', 'Rina'],
  ['১০:৩০', '10:30', 'out', 'খরচ — বিদ্যুৎ বিল', 'Expense — electricity bill', 'সেপ্টেম্বর · গ্যাস সহ', 'September · incl. gas', 'bkash', 10300, 'সুমন', 'Suman'],
  ['১০:১৫', '10:15', 'in', 'বাকি আদায় — জামাল স্টোর', 'Due collected — Jamal Telecom', '', '', 'dbbl', 15000, 'সুমন', 'Suman'],
  ['১০:১০', '10:10', 'in', 'বেচা #১০৩৯', 'Sale #1039', 'হাবিব ট্রেডার্স · পাইকারি', 'Habib Telecom · wholesale', 'nagad', 12600, 'বাবু', 'Babu'],
  ['১০:০৫', '10:05', 'out', 'দেনা শোধ — মেঘনা ট্রেডার্স', 'Payable paid — Techland Imports', 'চালান #এম-৪৪১', 'Invoice #M-441', 'city', 60000, 'মোস্তাফিজ', 'Mostafiz'],
  ['৯:৫৫', '9:55', 'in', 'বেচা — সকালের ক্যাশ', 'Sales — morning cash', 'মেমো #১০০১–#১০৩৭', 'Memos #1001–#1037', 'cash', 20940, 'রিনা', 'Rina'],
  ['৯:৩০', '9:30', 'out', 'বেতন — রিনা', 'Salary — Rina', 'সেপ্টেম্বর', 'September', 'cash', 12000, 'মোস্তাফিজ', 'Mostafiz'],
  ['৯:১০', '9:10', 'in', 'বাকি আদায় — করিম সাহেব', 'Due collected — Karim Saheb', '', '', 'cash', 2000, 'রিনা', 'Rina'],
  ['৯:০০', '9:00', 'out', 'খরচ — দোকান ভাড়া', 'Expense — shop rent', 'অক্টোবর', 'October', 'dbbl', 15000, 'মোস্তাফিজ', 'Mostafiz']
];
var PER = { today: [53850, 6, 97300, 4], week: [284600, 41, 312900, 23], month: [1248300, 312, 1106750, 118] };
var IN_T = [['due', 'কাস্টমারের বাকি', 'Customer due'], ['sale', 'বেচা', 'Sale'], ['other', 'অন্য আয়', 'Other income']];
var OUT_T = [['sup', 'সাপ্লায়ার', 'Supplier'], ['exp', 'খরচ', 'Expense'], ['sal', 'বেতন', 'Salary'], ['other', 'অন্য কিছু', 'Other']];
var WHO = {
  due: [['karim', 'করিম সাহেব', 'Karim Saheb', 18500, 'বাকি ', 'due '], ['jamal', 'জামাল স্টোর', 'Jamal Telecom', 32600, 'বাকি ', 'due '], ['habib', 'হাবিব ট্রেডার্স', 'Habib Telecom', 24800, 'বাকি ', 'due '], ['rafiq', 'রফিক মিয়া', 'Rafiq Mia', 6200, 'বাকি ', 'due ']],
  sale: [['walk', 'হেঁটে আসা কাস্টমার', 'Walk-in customer', 0, '', '']],
  sup: [['pran', 'প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', 40000, 'আজ দিতে হবে ', 'due today '], ['square', 'স্কয়ার কনজিউমার', 'Eastern Electronics', 28000, 'আজ দিতে হবে ', 'due today '], ['fresh', 'ফ্রেশ এন্টারপ্রাইজ', 'PowerCell Traders', 17000, 'আজ দিতে হবে ', 'due today '], ['unilever', 'ইউনিলিভার ডিলার', 'Mobile Mart', 22500, 'দেনা ', 'payable ']],
  exp: [['van', 'ভ্যান ভাড়া', 'Van fare', 500, '', ''], ['tea', 'চা-নাস্তা', 'Tea & snacks', 250, '', ''], ['net', 'ইন্টারনেট বিল', 'Internet bill', 1200, '', ''], ['gen', 'জেনারেটর তেল', 'Generator fuel', 800, '', '']],
  sal: [['suman', 'সুমন · ম্যানেজার', 'Suman · manager', 18000, 'বেতন ', 'salary '], ['kamal', 'কামাল · স্টোরকিপার', 'Kamal · store keeper', 11000, 'বেতন ', 'salary '], ['babu', 'বাবু · সেলসম্যান', 'Babu · salesman', 10000, 'বেতন ', 'salary ']]
};
var DUES = ['pran', 'square', 'fresh'];
var per = s.per || 'today', tf = s.tf || 'all', m = s.m || '';
var added = s.added || [], delta = s.delta || {};
var bal = function (k) { return A[k][5] + (delta[k] || 0); };
var addIn = added.reduce(function (n, x) { return n + (x[2] === 'in' ? x[8] : 0); }, 0);
var addOut = added.reduce(function (n, x) { return n + (x[2] === 'out' ? x[8] : 0); }, 0);
var addInN = added.filter(function (x) { return x[2] === 'in'; }).length, addOutN = added.length - addInN;
var P = PER[per];
var inV = P[0] + addIn, outV = P[2] + addOut, net = inV - outV;
var hand = ACC.reduce(function (n, a) { return n + bal(a[0]); }, 0);
var PL = { today: ['আজ', 'Today'], week: ['এই সপ্তাহে', 'This week'], month: ['এই মাসে', 'This month'] };
var paidSup = {}; added.forEach(function (x) { if (x[11]) paidSup[x[11]] = 1; });
var all = added.concat(TX);
var shown = all.filter(function (x) { return tf === 'all' || x[2] === tf; }).slice(0, 10);
var amtState = s.amt;
var isIn = m === 'in', isOut = m === 'out';
var ty = isIn ? (s.inT || 'due') : (s.outT || 'sup');
var whoList = WHO[ty] || [];
var whoId = s.who && whoList.filter(function (w) { return w[0] === s.who; }).length ? s.who : (whoList[0] ? whoList[0][0] : '');
var whoRow = whoList.filter(function (w) { return w[0] === whoId; })[0];
var acc = s.acc || (isIn ? 'cash' : (ty === 'sup' ? 'dbbl' : 'cash'));
var amt = amtState == null ? (whoRow && whoRow[3] ? whoRow[3] : 1000) : amtState;
var short = function (k) { return A[k][3 + i]; };
var accPick = ACC.map(function (a) { var on = a[0] === acc; return assign(accIc(a[0]), { l: a[3 + i], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ acc: a[0] }); } }); });
var low = isOut && amt > bal(acc);
var trF = s.trF || 'cash', trT = s.trT || 'dbbl';
var trAmt = amtState == null ? 20000 : amtState;
var openM = function (p) { self.setState(assign({ m: p.m, amt: null, who: null, acc: null }, p)); setQuery('type', p.m === 'in' || p.m === 'out' ? p.m : ''); };
var ioCol = isIn ? '#047857' : '#b83210';
return {
  pers: seg(self, [['today', 'আজ', 'Today'], ['week', 'এই সপ্তাহ', 'This week'], ['month', 'এই মাস', 'This month']], per, 'per', i, 'chip').map(function (o) { return assign(o, { pick: function () { self.setState({ per: o.k }); setQuery('period', o.k === 'today' ? '' : o.k); } }); }),
  openIn: function () { openM({ m: 'in', inT: 'due' }); },
  openOut: function () { openM({ m: 'out', outT: 'sup' }); },
  k: {
    inL: PL[per][i] + L(' এলো', ' — in'), inV: money(inV, bn), inN: L(dg(P[1] + addInN, true) + 'টা লেনদেন', (P[1] + addInN) + ' transactions'),
    outL: PL[per][i] + L(' গেলো', ' — out'), outV: money(outV, bn), outN: L(dg(P[3] + addOutN, true) + 'টা লেনদেন', (P[3] + addOutN) + ' transactions'),
    netL: L('নিট (এলো − গেলো)', 'Net (in − out)'), netV: (net > 0 ? '+' : '') + money(net, bn), netFg: net < 0 ? '#b83210' : '#047857',
    netN: net < 0 ? (per === 'today' ? L('আজ বেশি গেছে — মেঘনার দেনা শোধ হয়েছে', 'More went out today — Techland was paid') : L('যত এলো, তার চেয়ে বেশি গেছে', 'More went out than came in')) : L('যত গেলো, তার চেয়ে বেশি এসেছে', 'More came in than went out'),
    handL: L('হাতে মোট', 'Total in hand'), handV: money(hand, bn), handN: L('ক্যাশ + মোবাইল + ব্যাংক মিলিয়ে', 'Cash + mobile + bank together')
  },
  accs: [['cash'], ['bkash'], ['nagad'], ['rocket'], ['bank']].map(function (x) {
    var k = x[0];
    if (k === 'bank') return assign(accIc('bank'), { name: L('ব্যাংক', 'Bank'), bal: money(bal('dbbl') + bal('city'), bn), sub: 'DBBL ' + money(bal('dbbl'), bn), sub2: 'City ' + money(bal('city'), bn), hasSub2: true, col: '#003087', move: function () { openM({ m: 'tr', trF: 'dbbl', trT: 'cash' }); } });
    var a = A[k];
    return assign(accIc(k), { name: a[1 + i], bal: money(bal(k), bn), sub: a[6 + i], sub2: '', hasSub2: false, col: a[8], move: function () { openM({ m: 'tr', trF: k, trT: k === 'cash' ? 'dbbl' : 'cash' }); } });
  }),
  dueTot: money(DUES.reduce(function (n, d) { return n + (paidSup[d] ? 0 : WHO.sup.filter(function (w) { return w[0] === d; })[0][3]); }, 0), bn),
  dues: DUES.map(function (d) { var w = WHO.sup.filter(function (x) { return x[0] === d; })[0], pd = !!paidSup[d]; return { name: w[1 + i], amt: money(w[3], bn), fg: pd ? '#047857' : '#a14f06', open: !pd, paid: pd, pay: function () { openM({ m: 'out', outT: 'sup', who: d, acc: 'dbbl' }); } }; }),
  tfs: seg(self, [['in', 'এলো', 'In'], ['out', 'গেলো', 'Out'], ['all', 'সব', 'All']], tf, 'tf', i, 'chip').map(function (o) { o.pick = function () { self.setState({ tf: o.k }); setQuery('show', o.k === 'all' ? '' : o.k); }; var n = all.filter(function (x) { return o.k === 'all' || x[2] === o.k; }).length; return assign(o, { n: dg(n, bn), icon: { 'in': 'M12 5v14M5 12l7 7 7-7', out: 'M12 19V5M5 12l7-7 7 7', all: 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3' }[o.k] }); }),
  txs: shown.map(function (x) {
    var inn = x[2] === 'in', a = A[x[7]];
    return assign(typeIc(txType(x[3])), {
      time: x[i], title: x[3 + i], sub: x[5 + i], acc: a[3 + i], aCls: a[9],
      inA: inn ? '+' + money(x[8], bn) : '', outA: inn ? '' : '−' + money(x[8], bn), by: x[9 + i],
      ibg: inn ? '#e7f8f1' : '#ffece6', ifg: inn ? '#047857' : '#b83210', icon: inn ? 'M12 5v14M5 12l7 7 7-7' : 'M12 19V5M5 12l7-7 7 7',
      bg: x[0] === 'এইমাত্র' ? '#f5f8ff' : '#fff'
    });
  }),
  noTx: shown.length === 0,
  mOpen: !!m, isIO: isIn || isOut, isTr: m === 'tr',
  closeM: function () { self.setState({ m: '' }); setQuery('type', ''); },
  mTitle: isIn ? t.gotBtn : (isOut ? t.paidBtn : t.move),
  mSub: isIn ? L('কারো কাছ থেকে টাকা এলে এখানে লিখুন', 'Record money that came in') : (isOut ? L('কাউকে টাকা দিলে এখানে লিখুন', 'Record money you paid out') : L('যেমন: ক্যাশ থেকে ব্যাংকে জমা', 'e.g. deposit cash into the bank')),
  mIsIn: isIn, mIsOut: isOut,
  mIbg: isIn ? '#e7f8f1' : (isOut ? '#ffece6' : '#eef3fb'), mIfg: isIn ? '#047857' : (isOut ? '#b83210' : '#003087'),
  mIcon: isIn ? 'M12 5v14M5 12l7 7 7-7' : (isOut ? 'M12 19V5M5 12l7-7 7 7' : 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3'),
  typeAmt: function (e) { self.setState({ amt: num(unbn(e.target.value)) }); },
  accPick: accPick,
  io: {
    typeL: isIn ? t.fromWhom : t.toWhom, accL: isIn ? t.intoAcc : t.fromAcc, col: ioCol,
    types: seg(self, isIn ? IN_T : OUT_T, ty, isIn ? 'inT' : 'outT', i, 'chip').map(function (o) { return assign(assign(o, typeIc(o.k)), { pick: function () { var p = { amt: null, who: null, acc: null }; p[isIn ? 'inT' : 'outT'] = o.k; self.setState(p); } }); }),
    hasWho: whoList.length > 0, isFree: ty === 'other',
    freePh: isIn ? t.otherPh : t.otherOutPh,
    whos: whoList.map(function (w) { var on = w[0] === whoId; return { l: w[1 + i], h: w[3] ? w[4 + i] + money(w[3], bn) : L('এখনকার বেচা', 'current sale'), hfg: ty === 'due' ? '#b83210' : (ty === 'sup' ? '#a14f06' : '#64748b'), on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ who: w[0], amt: null }); } }; }),
    amtTxt: dg(amt, bn),
    noteCls: low ? 'note n-due' : 'note n-info',
    noteTxt: low ? L(short(acc) + '-এ আছে ' + money(bal(acc), true) + ' — এত টাকা নেই। অন্য অ্যাকাউন্ট বাছুন।', short(acc) + ' has only ' + money(bal(acc), false) + ' — not enough. Pick another account.') : L(short(acc) + (isIn ? ' বেড়ে হবে ' + money(bal(acc) + amt, true) : ' কমে হবে ' + money(bal(acc) - amt, true)), short(acc) + (isIn ? ' will go up to ' + money(bal(acc) + amt, false) : ' will go down to ' + money(bal(acc) - amt, false))),
    btn: isIn ? L(money(amt, true) + ' পেলাম · সেভ করুন', 'Save ' + money(amt, false) + ' received') : L(money(amt, true) + ' দিলাম · সেভ করুন', 'Save ' + money(amt, false) + ' paid'),
    save: function () {
      if (amt <= 0) { toast(self, L('টাকার পরিমাণ লিখুন', 'Enter the amount'), true); return; }
      if (low) { toast(self, L(short(acc) + '-এ এত টাকা নেই', 'Not enough in ' + short(acc)), true); return; }
      var tl = isIn ? IN_T : OUT_T, tn = tl.filter(function (x) { return x[0] === ty; })[0];
      var nm = whoRow ? whoRow : ['', L('অন্য', 'Other'), 'Other'];
      var PRE = { due: ['বাকি আদায় — ', 'Due collected — '], sale: ['বেচা — ', 'Sale — '], other: [isIn ? 'অন্য আয়' : 'অন্য খরচ', isIn ? 'Other income' : 'Other payment'], sup: ['দেনা শোধ — ', 'Payable paid — '], exp: ['খরচ — ', 'Expense — '], sal: ['বেতন — ', 'Salary — '] };
      var ttlBn = ty === 'other' ? PRE.other[0] : PRE[ty][0] + nm[1].split(' · ')[0], ttlEn = ty === 'other' ? PRE.other[1] : PRE[ty][1] + nm[2].split(' · ')[0];
      var row = ['এইমাত্র', 'Just now', isIn ? 'in' : 'out', ttlBn, ttlEn, '', '', acc, amt, 'মোস্তাফিজ', 'Mostafiz', ty === 'sup' ? whoId : ''];
      var d2 = assign({}, delta); d2[acc] = (d2[acc] || 0) + (isIn ? amt : -amt);
      self.setState({ added: [row].concat(added), delta: d2, m: '', amt: null, who: null, acc: null }); setQuery('type', '');
      toast(self, isIn ? L(money(amt, true) + ' পেলাম — ' + short(acc) + '-এ জমা হলো।', money(amt, false) + ' received into ' + short(acc) + '.') : L(money(amt, true) + ' দিলাম — ' + short(acc) + ' থেকে।', money(amt, false) + ' paid from ' + short(acc) + '.'));
    }
  },
  tr: {
    froms: ACC.map(function (a) { var on = a[0] === trF; return assign(accIc(a[0]), { l: a[3 + i], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ trF: a[0], trT: a[0] === trT ? (a[0] === 'cash' ? 'dbbl' : 'cash') : trT }); } }); }),
    tos: ACC.filter(function (a) { return a[0] !== trF; }).map(function (a) { var on = a[0] === trT; return assign(accIc(a[0]), { l: a[3 + i], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ trT: a[0] }); } }); }),
    amtTxt: dg(trAmt, bn),
    fromName: A[trF][1 + i], fromBefore: money(bal(trF), bn), fromAfter: money(bal(trF) - trAmt, bn),
    toName: A[trT][1 + i], toBefore: money(bal(trT), bn), toAfter: money(bal(trT) + trAmt, bn),
    noteCls: trAmt > bal(trF) ? 'note n-due' : 'note n-info',
    note: trAmt > bal(trF) ? L(A[trF][1] + '-এ এত টাকা নেই।', 'Not enough in ' + A[trF][2] + '.') : t.trHint,
    btn: L(money(trAmt, true) + ' সরান', 'Move ' + money(trAmt, false)),
    save: function () {
      if (trAmt <= 0 || trAmt > bal(trF)) { toast(self, L('সঠিক টাকার পরিমাণ লিখুন', 'Enter a valid amount'), true); return; }
      var d2 = assign({}, delta); d2[trF] = (d2[trF] || 0) - trAmt; d2[trT] = (d2[trT] || 0) + trAmt;
      self.setState({ delta: d2, m: '', amt: null });
      toast(self, L(money(trAmt, true) + ' ' + A[trF][1] + ' থেকে ' + A[trT][1] + '-এ সরানো হলো।', money(trAmt, false) + ' moved from ' + A[trF][2] + ' to ' + A[trT][2] + '.'));
    }
  }
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
.scrim{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;border-radius:inherit;cursor:default;background:rgba(15,23,42,.42);z-index:15}
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

export default class MoneyInOutScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MoneyInOut">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="acc-money" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb="Accounts" page={"Money in & out"} placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                    <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                    <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", minWidth: "0" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <div role="group" aria-label={v.t?.h} style={{ display: "flex", gap: "6px" }}>
                  {__list(v.pers).map((o, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick}>{o?.l}</button>
                    </React.Fragment>))}
                </div>
                <button type="button" className="btn okb big" onClick={v.openIn} style={{ padding: "0 20px 0 8px" }}><span style={{ width: "42px", height: "42px", borderRadius: "var(--radius-lg)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
    <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
    <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
    <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
    <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</span>{v.t?.gotBtn}</button>
                <button type="button" className="btn big" onClick={v.openOut} style={{ padding: "0 20px 0 8px", background: "#b83210", color: "#fff" }}><span style={{ width: "42px", height: "42px", borderRadius: "var(--radius-lg)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
    <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
    <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
    <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
    <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</span>{v.t?.paidBtn}</button>
              </div>
              <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                <div className="card kpi" style={{ padding: "16px 20px", borderColor: "#b7e4cf", background: "#f6fcf9" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                      <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                      <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                      <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                      <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="k">{v.k?.inL}</span>
                  </span>
                  <span className="v num" style={{ fontSize: "var(--text-3xl)", color: "#047857" }}>{v.k?.inV}</span>
                  <span className="hint num">{v.k?.inN}</span>
                </div>
                <div className="card kpi" style={{ padding: "16px 20px", borderColor: "#f7c9bb", background: "#fffaf8" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                      <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                      <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                      <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                      <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="k">{v.k?.outL}</span>
                  </span>
                  <span className="v num" style={{ fontSize: "var(--text-3xl)", color: "#b83210" }}>{v.k?.outV}</span>
                  <span className="hint num">{v.k?.outN}</span>
                </div>
                <div className="card kpi" style={{ padding: "16px 20px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M8.5 28H12.5A1.5 1.5 0 0 1 14 29.5V39.5A1.5 1.5 0 0 1 12.5 41H8.5A1.5 1.5 0 0 1 7 39.5V29.5A1.5 1.5 0 0 1 8.5 28Z" fill="#7dd3fc" />
                      <path d="M18.5 22H22.5A1.5 1.5 0 0 1 24 23.5V39.5A1.5 1.5 0 0 1 22.5 41H18.5A1.5 1.5 0 0 1 17 39.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#7dd3fc" />
                      <path d="M28.5 16H32.5A1.5 1.5 0 0 1 34 17.5V39.5A1.5 1.5 0 0 1 32.5 41H28.5A1.5 1.5 0 0 1 27 39.5V17.5A1.5 1.5 0 0 1 28.5 16Z" fill="#0ea5e9" />
                      <path d="M6 21L16 13L24 17L39 7" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M33 5.5L42.5 4.5L41 13.5Z" fill="#0ea5e9" />
                    </svg>
                    <span className="k">{v.k?.netL}</span>
                  </span>
                  <span className="v num" style={__sx(`color: ${v.k?.netFg ?? ""};`)}>{v.k?.netV}</span>
                  <span className="hint num">{v.k?.netN}</span>
                </div>
                <div className="card kpi" style={{ padding: "16px 20px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M14 10H27A2 2 0 0 1 29 12V20A2 2 0 0 1 27 22H14A2 2 0 0 1 12 20V12A2 2 0 0 1 14 10Z" fill="#003087" />
                      <path d="M15 12H26A1 1 0 0 1 27 13V17A1 1 0 0 1 26 18H15A1 1 0 0 1 14 17V13A1 1 0 0 1 15 12Z" fill="#7dd3fc" />
                      <path d="M9 22H39A4 4 0 0 1 43 26V37A4 4 0 0 1 39 41H9A4 4 0 0 1 5 37V26A4 4 0 0 1 9 22Z" fill="#0ea5e9" />
                      <path d="M11 26H13.5A1 1 0 0 1 14.5 27V28A1 1 0 0 1 13.5 29H11A1 1 0 0 1 10 28V27A1 1 0 0 1 11 26Z" fill="#7dd3fc" />
                      <path d="M17.5 26H20.0A1 1 0 0 1 21.0 27V28A1 1 0 0 1 20.0 29H17.5A1 1 0 0 1 16.5 28V27A1 1 0 0 1 17.5 26Z" fill="#7dd3fc" />
                      <path d="M24 26H26.5A1 1 0 0 1 27.5 27V28A1 1 0 0 1 26.5 29H24A1 1 0 0 1 23 28V27A1 1 0 0 1 24 26Z" fill="#7dd3fc" />
                      <path d="M30.5 26H33.0A1 1 0 0 1 34.0 27V28A1 1 0 0 1 33.0 29H30.5A1 1 0 0 1 29.5 28V27A1 1 0 0 1 30.5 26Z" fill="#7dd3fc" />
                      <path d="M10.5 33H37.5A1.5 1.5 0 0 1 39 34.5V37.0A1.5 1.5 0 0 1 37.5 38.5H10.5A1.5 1.5 0 0 1 9 37.0V34.5A1.5 1.5 0 0 1 10.5 33Z" fill="#003087" />
                      <path d="M22 34.7H26A1 1 0 0 1 27 35.7V35.7A1 1 0 0 1 26 36.7H22A1 1 0 0 1 21 35.7V35.7A1 1 0 0 1 22 34.7Z" fill="#7dd3fc" />
                      <path d="M32.0 12a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#0ea5e9" />
                      <path d="M34.7 12a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0Z" fill="#0ea5e9" />
                    </svg>
                    <span className="k">{v.k?.handL}</span>
                  </span>
                  <span className="v num" style={{ color: "#003087" }}>{v.k?.handV}</span>
                  <span className="hint num">{v.k?.handN}</span>
                </div>
              </div>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "14px" }}>
                <div className="gc-cols-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px" }}>
                  {__list(v.accs).map((a, $index) => (<React.Fragment key={$index}>
                      <div className="card" style={__sx(`padding: 12px; border-radius: var(--radius-xl); display: flex; flex-direction: column; gap: 4px; border-top: 4px solid ${a?.col ?? ""};`)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${a?.tint ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                            {a?.isCash ? (<>
                              <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                                <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                                <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                                <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                                <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                                <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                              </svg>
                            </>) : null}
                            {a?.isPhone ? (<>
                              <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
                                <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
                                <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
                                <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
                                <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
                                <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
                              </svg>
                            </>) : null}
                            {a?.isBank ? (<>
                              <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M4 17L24 5L44 17Z" fill="#0ea5e9" />
                                <path d="M7 16H41A1 1 0 0 1 42 17V19A1 1 0 0 1 41 20H7A1 1 0 0 1 6 19V17A1 1 0 0 1 7 16Z" fill="#003087" />
                                <path d="M9 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                                <path d="M17 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                                <path d="M26.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                                <path d="M34.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                                <path d="M6.5 35H41.5A1.5 1.5 0 0 1 43 36.5V39.5A1.5 1.5 0 0 1 41.5 41H6.5A1.5 1.5 0 0 1 5 39.5V36.5A1.5 1.5 0 0 1 6.5 35Z" fill="#003087" />
                                <path d="M21.8 12.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z" fill="#7dd3fc" />
                              </svg>
                            </>) : null}
                          </span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", lineHeight: "20px", color: "#334155", minWidth: "0" }}>{a?.name}</span>
                        </span>
                        <span className="num" style={{ fontSize: "var(--text-xl)", lineHeight: "28px", fontWeight: "var(--weight-semibold)" }}>{a?.bal}</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "17px", color: "var(--text-muted)" }}>{a?.sub}</span>
                        {a?.hasSub2 ? (<>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "17px", color: "var(--text-muted)" }}>{a?.sub2}</span>
                        </>) : null}
                        <span style={{ flexGrow: "1" }} />
                        <button type="button" className="btn line sm" onClick={a?.move} style={{ height: "36px", marginTop: "6px", padding: "0 8px", fontSize: "var(--text-sm)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" />
</svg>{v.t?.move}</button>
                      </div>
                    </React.Fragment>))}
                </div>
                <section className="card" style={{ padding: "12px 14px", borderColor: "#fde3b5", background: "#fffcf5", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
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
                    <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#7a3b04" }}>{v.t?.dueToday}</span>
                    <span className="pill p-warn num">{v.dueTot}</span>
                  </div>
                  {__list(v.dues).map((d, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "42px", padding: "4px 0", borderTop: "1px solid #f7ead0" }}>
                        <span style={{ flexGrow: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d?.name}</span>
                        <span className="num" style={__sx(`font-size: var(--text-sm); font-weight: var(--weight-semibold); color: ${d?.fg ?? ""};`)}>{d?.amt}</span>
                        {d?.open ? (<>
                          <button type="button" className="btn sm" onClick={d?.pay} style={{ height: "36px", padding: "0 14px", background: "#a14f06", color: "#fff" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M7 7h11l-3-3M17 17H6l3 3" />
</svg>{v.t?.payNow}</button>
                        </>) : null}
                        {d?.paid ? (<>
                          <span className="pill p-ok"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg> {v.t?.done}</span>
                        </>) : null}
                      </div>
                    </React.Fragment>))}
                </section>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px" }}>
                  <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#003087" />
                    <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#003087" />
                    <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                    <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                    <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                    <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                    <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                    <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                    <path d="M35 31V39M31 35H39" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.txTitle}</h2>
                  <div role="group" aria-label={v.t?.txTitle} style={{ display: "flex", gap: "6px" }}>
                    {__list(v.tfs).map((o, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d={o?.icon} />
</svg>{o?.l}<span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>{o?.n}</span></button>
                      </React.Fragment>))}
                  </div>
                </div>
                <div className="gc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th className="th" style={{ paddingLeft: "16px" }}>{v.t?.cTime}</th>
                        <th className="th">{v.t?.cWhat}</th>
                        <th className="th">{v.t?.cAcc}</th>
                        <th className="th" style={{ textAlign: "right" }}>{v.t?.cIn}</th>
                        <th className="th" style={{ textAlign: "right" }}>{v.t?.cOut}</th>
                        <th className="th" style={{ paddingRight: "16px" }}>{v.t?.cBy}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.txs).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className="trow" style={__sx(`background: ${r?.bg ?? ""};`)}>
                            <td className="td num" style={{ padding: "10px 14px 10px 16px", color: "#475569", whiteSpace: "nowrap" }}>{r?.time}</td>
                            <td className="td" style={{ padding: "10px 14px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`position: relative; width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${r?.ibg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                                  {r?.isSale ? (<>
                                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                                      <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                                      <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                                      <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                                      <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                                    </svg>
                                  </>) : null}
                                  {r?.isDue ? (<>
                                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                                      <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
                                      <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
                                      <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
                                      <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </>) : null}
                                  {r?.isExp ? (<>
                                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
                                      <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
                                      <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
                                      <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
                                      <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                                    </svg>
                                  </>) : null}
                                  {r?.isSup ? (<>
                                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
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
                                  </>) : null}
                                  {r?.isSal ? (<>
                                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                                      <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
                                      <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
                                      <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
                                      <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
                                    </svg>
                                  </>) : null}
                                  {r?.isOther ? (<>
                                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                                      <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                                      <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </>) : null}
                                  <span style={__sx(`position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: var(--radius-full); background: ${r?.ifg ?? ""}; color: #fff; border: 2px solid #fff; display: flex; align-items: center; justify-content: center;`)}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d={r?.icon} />
                                    </svg>
                                  </span>
                                </span>
                                <span className="num" style={{ fontWeight: "var(--weight-medium)" }}>{r?.title}</span>
                                <span className="num" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{r?.sub}</span>
                              </span>
                            </td>
                            <td className="td" style={{ padding: "10px 14px" }}>
                              <span className={r?.aCls}>{r?.acc}</span>
                            </td>
                            <td className="td num" style={{ padding: "10px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{r?.inA}</td>
                            <td className="td num" style={{ padding: "10px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{r?.outA}</td>
                            <td className="td" style={{ padding: "10px 16px 10px 14px", color: "#334155" }}>{r?.by}</td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                {v.noTx ? (<>
                  <div style={{ padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-muted)" }}>
                    <svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#003087" />
                      <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#003087" />
                      <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                      <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                      <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                      <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                      <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                      <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                      <path d="M35 31V39M31 35H39" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{v.t?.empty}</span>
                  </div>
                </>) : null}
              </section>
              {v.mOpen ? (<>
                <button type="button" className="scrim" tabIndex={-1} aria-label={v.t?.close} onClick={v.closeM} />
                <section id="mio-dialog" tabIndex={-1} className="modal fade" role="dialog" aria-modal="true" aria-label={v.mTitle} style={{ overflow: "hidden", width: "600px", maxWidth: "calc(100% - 24px)", outline: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={__sx(`width: 50px; height: 50px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${v.mIbg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                      {v.mIsIn ? (<>
                        <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                          <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                          <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                          <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                          <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>) : null}
                      {v.mIsOut ? (<>
                        <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                          <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                          <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                          <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                          <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>) : null}
                      {v.isTr ? (<>
                        <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                          <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                          <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>) : null}
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.mTitle}</h2>
                      <div className="sub">{v.mSub}</div>
                    </div>
                    <button type="button" className="ib" onClick={v.closeM} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {v.isIO ? (<>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div className="fld">
                        <span className="lbl">{v.io?.typeL}</span>
                        <div role="group" aria-label={v.io?.typeL} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {__list(v.io?.types).map((o, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ height: "44px", paddingLeft: "8px" }}>{o?.isSale ? (<>
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
    <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
    <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
    <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
    <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
  </svg>
</>) : null}{o?.isDue ? (<>
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
    <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
    <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
    <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
    <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.isExp ? (<>
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
    <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
    <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
    <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
    <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
  </svg>
</>) : null}{o?.isSup ? (<>
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
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
</>) : null}{o?.isSal ? (<>
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
    <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
    <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
    <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
    <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
  </svg>
</>) : null}{o?.isOther ? (<>
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
    <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
    <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                      {v.io?.hasWho ? (<>
                        <div className="fld">
                          <span className="lbl">{v.t?.who}</span>
                          <div role="group" aria-label={v.t?.who} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {__list(v.io?.whos).map((o, $index) => (<React.Fragment key={$index}>
                                <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ height: "auto", minHeight: "44px", padding: "6px 14px", flexDirection: "column", alignItems: "flex-start", gap: "0" }}>
                                  <span>{o?.l}</span>
                                  <span className="num" style={__sx(`font-size: var(--text-xs-plus); font-weight: var(--weight-medium); color: ${o?.hfg ?? ""};`)}>{o?.h}</span>
                                </button>
                              </React.Fragment>))}
                          </div>
                        </div>
                      </>) : null}
                      {v.io?.isFree ? (<>
                        <label className="fld">
                          <span className="lbl">{v.t?.who}</span>
                          <input className="inp" placeholder={v.io?.freePh} aria-label={v.t?.who} />
                        </label>
                      </>) : null}
                      <div style={{ display: "grid", gridTemplateColumns: "210px minmax(0, 1fr)", gap: "14px", alignItems: "end" }}>
                        <label className="fld">
                          <span className="lbl">{v.t?.amount}</span>
                          <input className="inp num" value={v.io?.amtTxt} onInput={v.typeAmt} onChange={v.typeAmt} inputMode="numeric" aria-label={v.t?.amount} style={__sx(`height: 56px; font-size: var(--text-2xl); font-weight: var(--weight-semibold); border-color: ${v.io?.col ?? ""};`)} />
                        </label>
                        <div className="fld">
                          <span className="lbl">{v.io?.accL}</span>
                          <div role="group" aria-label={v.io?.accL} style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {__list(v.accPick).map((o, $index) => (<React.Fragment key={$index}>
                                <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ padding: "0 11px 0 7px" }}>{o?.isCash ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.isPhone ? (<>
  <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-md); background: ${o?.tint ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
                      </div>
                      <div className={v.io?.noteCls}>
                        <span className="num">{v.io?.noteTxt}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", padding: "14px 20px 18px", borderTop: "1px solid #eef2f6" }}>
                      <button type="button" className="btn line" onClick={v.closeM}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18M6 6l12 12" />
</svg>{v.t?.cancel}</button>
                      <button type="button" className="btn big" onClick={v.io?.save} style={__sx(`flex-grow: 1; background: ${v.io?.col ?? ""}; color: #fff;`)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="num">{v.io?.btn}</span>
                      </button>
                    </div>
                  </>) : null}
                  {v.isTr ? (<>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div className="fld">
                        <span className="lbl">{v.t?.trFrom}</span>
                        <div role="group" aria-label={v.t?.trFrom} style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {__list(v.tr?.froms).map((o, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ padding: "0 12px 0 7px" }}>{o?.isCash ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.isPhone ? (<>
  <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-md); background: ${o?.tint ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
                        <span className="lbl">{v.t?.trTo}</span>
                        <div role="group" aria-label={v.t?.trTo} style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {__list(v.tr?.tos).map((o, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ padding: "0 12px 0 7px" }}>{o?.isCash ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.isPhone ? (<>
  <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-md); background: ${o?.tint ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
                      <label className="fld">
                        <span className="lbl">{v.t?.amount}</span>
                        <input className="inp num" value={v.tr?.amtTxt} onInput={v.typeAmt} onChange={v.typeAmt} inputMode="numeric" aria-label={v.t?.amount} style={{ height: "56px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", width: "240px" }} />
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 36px minmax(0, 1fr)", gap: "8px", alignItems: "center" }}>
                        <div style={{ padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#fff4f0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{v.tr?.fromName}</div>
                          <div className="num" style={{ fontSize: "var(--text-sm-plus)" }}>{v.tr?.fromBefore} → <span style={{ fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{v.tr?.fromAfter}</span></div>
                        </div>
                        <span style={{ display: "flex", justifyContent: "center", color: "var(--text-muted)" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                        <div style={{ padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#e7f8f1" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{v.tr?.toName}</div>
                          <div className="num" style={{ fontSize: "var(--text-sm-plus)" }}>{v.tr?.toBefore} → <span style={{ fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.tr?.toAfter}</span></div>
                        </div>
                      </div>
                      <div className={v.tr?.noteCls}>{v.tr?.note}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", padding: "14px 20px 18px", borderTop: "1px solid #eef2f6" }}>
                      <button type="button" className="btn line" onClick={v.closeM}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18M6 6l12 12" />
</svg>{v.t?.cancel}</button>
                      <button type="button" className="btn solid big" onClick={v.tr?.save} style={{ flexGrow: "1" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" />
                        </svg>
                        <span className="num">{v.tr?.btn}</span>
                      </button>
                    </div>
                  </>) : null}
                </section>
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
