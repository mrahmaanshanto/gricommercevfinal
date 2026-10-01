'use client';
// Generated from design/templates/purchase-stock/ExpiryDisposal.dc.html by scripts/convert-design.mjs.
// Damaged & expired — Stocks & inventory — Damaged & expired. Imported from Retail Commerce and merged.
// Edit freely: this file is now the source for the screen.
// The real damaged stock (damaged holds in the Returns & damaged bay) is listed by DamagedStockPanel,
// above the expiry lists and the demo damage log.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import DamagedStockPanel from './DamagedStockPanel';

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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "hsub": ["নষ্ট আর মেয়াদ পেরোনো মালের হিসাব — লস কমান, সময়মতো ফেরত দিন", "Track damaged and expiring goods — cut losses, return on time"], "toStock": ["স্টক দেখুন", "See stock"], "record": ["ড্যামেজ লিখুন", "Record damage"], "kLoss": ["এই মাসে লস", "Loss this month"], "kExp": ["১৫ দিনে মেয়াদ শেষ হবে", "Expiring in 15 days"], "kRet": ["সাপ্লায়ারকে ফেরত দেওয়া যাবে", "Can go back to suppliers"], "cProd": ["প্রোডাক্ট", "Product"], "cBatch": ["ব্যাচ", "Batch"], "cDate": ["মেয়াদ শেষের তারিখ", "Expiry date"], "cQty": ["পরিমাণ", "Qty"], "cVal": ["কেনা দামে মূল্য", "Value at cost"], "cDo": ["কী করবেন", "What to do"], "cWhat": ["কী হয়েছে", "What happened"], "cLossC": ["লস", "Loss"], "cWho": ["কে জানালো", "Reported by"], "cPhoto": ["ছবি", "Photo"], "cAction": ["কী করা হলো", "Action taken"], "retYes": ["ফেরত নেয়", "Takes returns"], "retNo": ["ফেরত নেয় না", "No returns"], "soonNote": ["৭ দিনের কম বাকি থাকলে আজই ছাড় দিয়ে সামনের তাকে রাখুন, না হলে সাপ্লায়ারকে ফেরত দিন।", "Under 7 days left? Put it on the front shelf with a discount today, or send it back to the supplier."], "goneNote": ["মেয়াদ শেষ মাল বেচবেন না। সাপ্লায়ার ফেরত নিলে ফেরত দিন, না হলে ফেলে দিন — লস হিসাবে লেখা হবে।", "Never sell expired goods. Return them if the supplier accepts, otherwise throw them out — it is recorded as a loss."], "whyH": ["এই মাসে লস কেন হলো", "Why we lost money this month"], "dTitle": ["ড্যামেজ লিখুন", "Record damage"], "dFind": ["কোন প্রোডাক্ট? নাম লিখুন", "Which product? Type a name"], "dQty": ["কতগুলো নষ্ট", "How many damaged"], "dWhy": ["কী হয়েছে", "What happened"], "dPhoto": ["ছবি তুলুন", "Take a photo"], "dPhotoOk": ["ছবি যোগ হয়েছে", "Photo added"], "dPhotoHint": ["ছবি থাকলে সাপ্লায়ার সহজে ফেরত নেয়", "Suppliers accept returns more easily with a photo"], "dDo": ["এখন কী করবেন", "What now"], "dPrice": ["কত টাকায় বেচবেন (প্রতিটা)", "Sell for (each)"], "inStock": ["স্টকে আছে", "In stock"], "pageTitle": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"]};
var AI = [["কোন মালের মেয়াদ শেষ হচ্ছে?", "What is about to expire?", "১৫ দিনে ৪টা মালের মেয়াদ শেষ — সবচেয়ে জরুরি গুঁড়া দুধ ৫০০ গ্রাম, মাত্র ৪ দিন বাকি (৮ প্যাকেট, ৳৩,০৪০)।", "4 items expire within 15 days — most urgent is AA battery 4-pack, 4 days left (8 packs, ৳3,040)."], ["একটা তেলের বোতল ভেঙে গেছে", "One oil bottle broke", "ড্যামেজ লিখছি: সয়াবিন তেল ৫ লি. × ১, কারণ \"ভেঙে গেছে\"। ফেলে দিলে লস ৳৮২০। ছবি তুলবেন?", "Recording: 20W USB-C fast charger × 1, reason \"broken\". Throwing it away is a ৳820 loss. Take a photo?"], ["প্রাণের কোন মাল ফেরত দেওয়া যায়?", "What can go back to Dhaka Gadget Hub?", "প্রাণ ডিস্ট্রিবিউশনকে ফেরত দেওয়া যায়: বিস্কুট ২৪ প্যাকেট, জুস ৩৬ পিস, চানাচুর ৬ প্যাকেট — মোট ৳২,৫২০।", "Returnable to Dhaka Gadget Hub: biscuits 24 packs, juice 36 pcs, chanachur 6 packs — ৳2,520 in all."]];
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

var EXP = [
  ['e1', 'গুঁড়া দুধ ৫০০ গ্রাম', 'AA battery 4-pack', 'মেঘনা ট্রেডার্স', 'Techland Imports', 'B-2291', '৩ অক্টোবর ২০২৬', '3 Oct 2026', 4, 8, 'প্যাকেট', 'packs', 380, false],
  ['e2', 'বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 'প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', 'PR-0917', '৬ অক্টোবর ২০২৬', '6 Oct 2026', 7, 24, 'প্যাকেট', 'packs', 50, true],
  ['e3', 'জুস ২৫০ মি.লি.', 'AAA battery 4-pack', 'প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', 'PR-0822', '১০ অক্টোবর ২০২৬', '10 Oct 2026', 11, 36, 'পিস', 'pcs', 25, true],
  ['e4', 'কেক', 'Lens cleaning pen', 'ফ্রেশ এন্টারপ্রাইজ', 'PowerCell Traders', 'FE-1102', '১৩ অক্টোবর ২০২৬', '13 Oct 2026', 14, 32, 'পিস', 'pcs', 40, true],
  ['e5', 'শ্যাম্পু ১৮০ মি.লি.', 'Cleaning spray 100 ml', 'ইউনিলিভার ডিলার', 'Mobile Mart', 'UL-5530', '২৮ অক্টোবর ২০২৬', '28 Oct 2026', 29, 6, 'বোতল', 'pcs', 205, false],
  ['e6', 'নুডলস', 'Thermal paste 3 g', 'স্কয়ার কনজিউমার', 'Eastern Electronics', 'SQ-7781', '১২ নভেম্বর ২০২৬', '12 Nov 2026', 44, 48, 'প্যাকেট', 'packs', 18, false],
  ['x1', 'পাউরুটি', 'Phone ring holder', 'ফ্রেশ এন্টারপ্রাইজ', 'PowerCell Traders', 'FE-0925', '২৭ সেপ্টেম্বর ২০২৬', '27 Sep 2026', -2, 10, 'পিস', 'pcs', 45, true],
  ['x2', 'চানাচুর ৩০০ গ্রাম', 'USB-C OTG adapter', 'প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', 'PR-0710', '২৬ সেপ্টেম্বর ২০২৬', '26 Sep 2026', -3, 6, 'প্যাকেট', 'packs', 70, true],
  ['x3', 'টমেটো সস ৩৪০ গ্রাম', 'Tomato sauce 340 g', 'স্কয়ার কনজিউমার', 'Eastern Electronics', 'SQ-6620', '২০ সেপ্টেম্বর ২০২৬', '20 Sep 2026', -9, 4, 'বোতল', 'pcs', 150, false]
];
var WHY = [['break', 'ভেঙে গেছে', 'Broken'], ['rot', 'পচে গেছে', 'Rotten'], ['rat', 'ইঁদুরে কেটেছে', 'Rats'], ['water', 'পানিতে নষ্ট', 'Water damage'], ['exp', 'মেয়াদ শেষ', 'Expired']];
var WN = {}; WHY.forEach(function (w) { WN[w[0]] = w; });
var wf = function (k) { return { w_break: k === 'break', w_rot: k === 'rot', w_rat: k === 'rat', w_water: k === 'water', w_exp: k === 'exp' }; };
var af = function (k) { return { a_throw: k === 'throw', a_ret: k === 'ret', a_disc: k === 'disc' }; };
var ACT = { throw: ['ফেলে দেওয়া হয়েছে · লস', 'Thrown away · loss', 'pill p-due'], ret: ['সাপ্লায়ারকে ফেরত', 'Returned to supplier', 'pill p-ok'], disc: ['ছাড়ে বেচা', 'Sold at discount', 'pill p-warn'] };
var DMG = [
  ['সয়াবিন তেল ৫ লি.', '20W USB-C fast charger', 'break', 1, 'বোতল', 'pcs', 820, 'কামাল', 'Kamal', '২৭ সেপ্টেম্বর', '27 Sep', 'মিরপুর শাখা', 'Mirpur', true, 'throw', 0],
  ['ডিম (ডজন)', 'Wired earphones 3.5 mm', 'rot', 2, 'ডজন', 'dozen', 130, 'বাবু', 'Babu', '২৫ সেপ্টেম্বর', '25 Sep', 'মিরপুর শাখা', 'Mirpur', false, 'throw', 0],
  ['মিনিকেট চাল ২৫ কেজি', 'Power bank 20,000 mAh', 'water', 1, 'বস্তা', 'box', 1780, 'কামাল', 'Kamal', '২১ সেপ্টেম্বর', '21 Sep', 'তেজগাঁও গুদাম', 'Tejgaon', true, 'disc', 1200],
  ['আটা ২ কেজি', 'Car charger dual USB', 'rat', 3, 'প্যাকেট', 'packs', 110, 'সুমন', 'Sumon', '১৮ সেপ্টেম্বর', '18 Sep', 'তেজগাঁও গুদাম', 'Tejgaon', true, 'throw', 0],
  ['ব্লেন্ডার', 'Blender', 'break', 1, 'পিস', 'pc', 2400, 'রিনা', 'Rina', '১৫ সেপ্টেম্বর', '15 Sep', 'ধানমন্ডি শাখা', 'Dhanmondi', true, 'ret', 0],
  ['টমেটো সস ৩৪০ গ্রাম', 'Tomato sauce 340 g', 'exp', 6, 'বোতল', 'pcs', 150, 'বাবু', 'Babu', '১২ সেপ্টেম্বর', '12 Sep', 'মিরপুর শাখা', 'Mirpur', false, 'ret', 0]
];
var lossOf = function (d) { return d[14] === 'throw' ? d[3] * d[6] : (d[14] === 'disc' ? Math.max(0, d[3] * d[6] - d[15]) : 0); };
var totalLoss = DMG.reduce(function (a, d) { return a + lossOf(d); }, 0);
var saved = DMG.filter(function (d) { return d[14] === 'ret'; }).reduce(function (a, d) { return a + d[3] * d[6]; }, 0);
var soon = EXP.filter(function (e) { return e[8] > 0 && e[8] <= 15; });
var soonV = soon.reduce(function (a, e) { return a + e[9] * e[12]; }, 0);
var retRows = EXP.filter(function (e) { return e[13]; });
var retV = retRows.reduce(function (a, e) { return a + e[9] * e[12]; }, 0);
var tab = s.tab || 'soon';
var acts = s.acts || {};
var rows = EXP.filter(function (e) { return tab === 'soon' ? e[8] > 0 : e[8] < 0; });
var byWhy = {}; DMG.forEach(function (d) { var l = lossOf(d); if (l) byWhy[d[2]] = (byWhy[d[2]] || 0) + l; });
var whyList = Object.keys(byWhy).sort(function (a, b) { return byWhy[b] - byWhy[a]; });
var maxW = whyList.length ? byWhy[whyList[0]] : 1;

var DP = [
  ['oil', 'সয়াবিন তেল ৫ লি.', '20W USB-C fast charger', 820, 'বোতল', 'pcs', 3],
  ['egg', 'ডিম (ডজন)', 'Wired earphones 3.5 mm', 130, 'ডজন', 'dozen', 20],
  ['rice', 'মিনিকেট চাল ২৫ কেজি', 'Power bank 20,000 mAh', 1780, 'বস্তা', 'boxes', 18],
  ['atta', 'আটা ২ কেজি', 'Car charger dual USB', 110, 'প্যাকেট', 'packs', 30],
  ['bisc', 'বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 50, 'প্যাকেট', 'packs', 72],
  ['lux', 'লাক্স সাবান ১০০ গ্রাম', 'Screen cleaning wipes', 54, 'পিস', 'pcs', 55],
  ['blender', 'ব্লেন্ডার', 'Blender', 2400, 'পিস', 'pcs', 4]
];
var dq = s.dq || '', dpid = s.dp || 'oil';
var dp = DP.filter(function (x) { return x[0] === dpid; })[0];
var found = DP.filter(function (x) { return !dq || (x[1] + ' ' + x[2]).toLowerCase().indexOf(dq.toLowerCase()) >= 0; });
if (!dq) found = DP.slice(0, 3);
if (found.indexOf(dp) < 0) found = [dp].concat(found);
found = found.slice(0, 4);
var dqty = s.dqty == null ? 1 : s.dqty;
var ddo = s.ddo || 'throw';
var price = s.price == null ? Math.round(dp[3] * 0.6) : s.price;
var loss = ddo === 'throw' ? dqty * dp[3] : (ddo === 'disc' ? Math.max(0, dqty * (dp[3] - price)) : 0);
var hasPhoto = !!s.photo;
return {
  openDr: function () { self.setState({ dr: true, dq: '', dp: 'oil', dqty: 1, ddo: 'throw', price: null, photo: false, dwhy: 'break' }); },
  closeDr: function () { self.setState({ dr: false }); }, drOpen: !!s.dr,
  k: {
    loss: money(totalLoss, bn), lossSub: L(dg(DMG.filter(function (d) { return lossOf(d) > 0; }).length, true) + 'টা ঘটনায় · ফেরত দিয়ে বাঁচলো ' + money(saved, true), 'From ' + DMG.filter(function (d) { return lossOf(d) > 0; }).length + ' incidents · returns saved ' + money(saved, false)),
    expN: dg(soon.length, bn) + L('টা', ' items'), expV: money(soonV, bn), expSub: L('কেনা দামে · তালিকা দেখুন ›', 'at cost · see list ›'),
    ret: money(retV, bn), retSub: L(dg(retRows.length, true) + 'টা ব্যাচ · প্রাণ আর ফ্রেশ এন্টারপ্রাইজ ফেরত নেয়', retRows.length + ' batches · Dhaka Gadget Hub and PowerCell Traders take returns')
  },
  goSoon: function () { self.setState({ tab: 'soon' }); },
  tabs: [['soon', 'মেয়াদ শেষ হবে', 'Expiring soon', EXP.filter(function (e) { return e[8] > 0; }).length], ['gone', 'মেয়াদ শেষ হয়ে গেছে', 'Already expired', EXP.filter(function (e) { return e[8] < 0; }).length], ['dmg', 'ড্যামেজ পণ্য', 'Damage log', DMG.length]].map(function (x) { var on = tab === x[0]; return { l: x[1 + i] + ' (' + dg(x[3], bn) + ')', on: on, i0: x[0] === 'soon', i1: x[0] === 'gone', i2: x[0] === 'dmg', cls: on ? 'tl on' : 'tl', pick: function () { self.setState({ tab: x[0] }); } }; }),
  isExp: tab !== 'dmg', isDmg: tab === 'dmg',
  noteCls: tab === 'soon' ? 'note n-warn' : 'note n-due', noteTxt: tab === 'soon' ? t.soonNote : t.goneNote,
  daysHead: tab === 'soon' ? L('কত দিন বাকি', 'Days left') : L('কবে শেষ হয়েছে', 'Expired'),
  exps: rows.map(function (e) {
    var d = e[8], cur = acts[e[0]];
    var opts = d > 0 ? [['disc', 'ছাড় দিয়ে বেচুন', 'Sell at discount'], ['ret', 'সাপ্লায়ারকে ফেরত', 'Return to supplier']] : [['throw', 'ফেলে দিন', 'Throw away'], ['ret', 'সাপ্লায়ারকে ফেরত', 'Return to supplier']];
    return {
      name: e[1 + i], tint: d <= 7 ? '#fff4f0' : '#fff8eb', sup: e[3 + i], retTxt: e[13] ? t.retYes : t.retNo, retFg: e[13] ? '#047857' : '#64748b', batch: dg(e[5], bn), date: e[6 + i],
      days: d > 0 ? dg(d, bn) + L(' দিন', d === 1 ? ' day' : ' days') : dg(-d, bn) + L(' দিন আগে', ' days ago'),
      dfg: d <= 0 ? '#b83210' : (d <= 7 ? '#b83210' : (d <= 15 ? '#a14f06' : '#475569')),
      qty: dg(e[9], bn) + ' ' + e[10 + i], val: money(e[9] * e[12], bn),
      sugg: opts.map(function (o) { var on = cur === o[0]; return { l: o[1 + i], on: on, a_throw: o[0] === 'throw', a_ret: o[0] === 'ret', a_disc: o[0] === 'disc', cls: on ? 'chip on' : 'chip', pick: function () {
        if (o[0] === 'ret' && !e[13]) { toast(self, L(e[3] + ' মেয়াদ শেষ মাল ফেরত নেয় না — ছাড় দিয়ে বেচুন।', e[4] + ' doesn’t take expired goods back — sell at a discount.')); return; }
        var a = assign({}, acts); a[e[0]] = o[0]; self.setState({ acts: a });
        toast(self, o[0] === 'disc' ? L(e[1] + ' ছাড়ের তালিকায় গেল — POS-এ ২০% ছাড় দেখাবে।', e[2] + ' added to discounts — POS will show 20% off.') : (o[0] === 'ret' ? L(e[3] + '-কে ফেরতের তালিকায় যোগ হলো। পরের চালানে ফেরত যাবে।', 'Added to the return list for ' + e[4] + '. Goes back with the next delivery.') : L('ফেলে দেওয়া হলো — লস ' + money(e[9] * e[12], true) + ' লেখা হলো।', 'Thrown away — loss of ' + money(e[9] * e[12], false) + ' recorded.')));
      } }; })
    };
  }),
  dmgs: DMG.map(function (d) {
    var l = lossOf(d), A = ACT[d[14]];
    return assign(wf(d[2]), {
      name: d[i], why: WN[d[2]][1 + i], qty: dg(d[3], bn) + ' ' + d[4 + i], loss: l ? money(l, bn) : L('লস নেই', 'No loss'), lfg: l ? '#b83210' : '#047857',
      who: d[7 + i], date: d[9 + i], place: d[11 + i], act: A[i], acls: A[2],
      phBg: d[13] ? '#eef3fb' : '#f8fafc', phFg: d[13] ? '#003087' : '#94a3b8', phBd: d[13] ? '#9fb6e0' : '#cbd5e1', photoAria: d[13] ? L('ছবি আছে', 'Photo attached') : L('ছবি নেই', 'No photo')
    });
  }),
  whyBars: whyList.map(function (k) { return assign(wf(k), { l: WN[k][1 + i], v: money(byWhy[k], bn), w: Math.round(byWhy[k] / maxW * 100) + '%' }); }),

  dq: dq, typeDq: function (e) { self.setState({ dq: e.target.value }); },
  dProds: found.map(function (x) { var on = x[0] === dpid; return { l: x[1 + i], sub: L('কেনা ', 'Cost ') + money(x[3], bn), on: on, bd: on ? '#003087' : '#e2e8f0', bg: on ? '#eef3fb' : '#fff', pick: function () { self.setState({ dp: x[0], dqty: 1, price: null }); } }; }),
  dStock: dg(dp[6], bn) + ' ' + dp[4 + i], dUnit: dp[4 + i], dQtyTxt: dg(dqty, bn),
  incQ: function () { self.setState({ dqty: Math.min(dp[6], dqty + 1) }); }, decQ: function () { self.setState({ dqty: Math.max(1, dqty - 1) }); },
  dWhy: seg(self, WHY, s.dwhy || 'break', 'dwhy', i, 'chip').map(function (x, j) { return assign(x, wf(WHY[j][0])); }),
  hasPhoto: hasPhoto, togglePhoto: function () { self.setState({ photo: !hasPhoto }); },
  phLbl: hasPhoto ? t.dPhotoOk : t.dPhoto, phBd: hasPhoto ? '#047857' : '#94a3b8', phBg: hasPhoto ? '#e7f8f1' : '#f8fafc', phFg: hasPhoto ? '#047857' : '#475569',
  dDo: seg(self, [['throw', 'ফেলে দিন', 'Throw away'], ['ret', 'সাপ্লায়ারকে ফেরত', 'Return'], ['disc', 'ছাড়ে বেচুন', 'Sell cheap']], ddo, 'ddo', i, 'chip').map(function (x, j) { return assign(x, af(['throw', 'ret', 'disc'][j])); }),
  isDisc: ddo === 'disc', dPriceTxt: dg(price, bn), typePrice: function (e) { self.setState({ price: num(unbn(e.target.value)) }); },
  dPriceHint: L('কেনা দাম ছিল ', 'Bought at ') + money(dp[3], bn),
  lossLbl: loss > 0 ? L('লস হবে', 'You will lose') : L('লস হবে না', 'No loss'),
  lossVal: money(loss, bn), lossBg: loss > 0 ? '#ffece6' : '#e7f8f1', lossFg: loss > 0 ? '#b83210' : '#047857',
  lossNote: (ddo === 'ret' ? L('সাপ্লায়ার মাল বা টাকা ফেরত দেবে · ', 'Supplier gives goods or money back · ') : '') + L('স্টক থেকে ' + dg(dqty, true) + ' ' + dp[4] + ' বাদ যাবে', dqty + ' ' + dp[5] + ' will be removed from stock'),
  saveDmg: function () { self.setState({ dr: false }); toast(self, L('ড্যামেজ লেখা হলো: ' + dp[1] + ' × ' + dg(dqty, true) + (loss ? ' · লস ' + money(loss, true) : ' · লস নেই'), 'Damage recorded: ' + dp[2] + ' × ' + dqty + (loss ? ' · loss ' + money(loss, false) : ' · no loss'))); }
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
@media (max-width:767px){.tabl{overflow-x:auto;scrollbar-width:none}.tabl::-webkit-scrollbar{display:none}.tabl>.tl{flex:none}}
/* phones: no decorative page icon above the title; the title matches the other pages' headers */
@media (max-width:640px){.ed-hicon{display:none!important}.ed-hicon+div .h1{font-size:var(--text-xl);line-height:var(--text-xl-lh)}}
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

export default class ExpiryDisposalScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ExpiryDisposal">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-expiry" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb={"Stocks & inventory"} page={"Damaged & expired"} placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="ed-hicon" style={{ width: "52px", height: "52px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                    <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                    <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                    <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                    <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <__Link href="/stock" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7l8.7 5 8.7-5M12 22V12" />
</svg>{v.t?.toStock}</__Link>
                <button type="button" className="btn solid" onClick={v.openDr}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>{v.t?.record}</button>
              </div>
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                <div className="card kpi" style={{ borderColor: "#f7c9bb", background: "#fffaf8" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                      <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                      <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                      <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                      <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="k">{v.t?.kLoss}</span>
                  </span>
                  <span className="v num" style={{ color: "#b83210" }}>{v.k?.loss}</span>
                  <span className="num" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{v.k?.lossSub}</span>
                </div>
                <button type="button" className="card kpi" onClick={v.goSoon} style={{ textAlign: "left", cursor: "pointer", borderColor: "#fde3b5", background: "#fffcf5" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M9 8H32A4 4 0 0 1 36 12V35A4 4 0 0 1 32 39H9A4 4 0 0 1 5 35V12A4 4 0 0 1 9 8Z" fill="#e0f2fe" />
                      <path d="M9.5 9.5H31.5A3 3 0 0 1 34.5 12.5V34.5A3 3 0 0 1 31.5 37.5H9.5A3 3 0 0 1 6.5 34.5V12.5A3 3 0 0 1 9.5 9.5Z" fill="#ffffff" />
                      <path d="M9 8H32A4 4 0 0 1 36 12V14A4 4 0 0 1 32 18H9A4 4 0 0 1 5 14V12A4 4 0 0 1 9 8Z" fill="#0ea5e9" />
                      <path d="M5 13h31v5h-31Z" fill="#0ea5e9" />
                      <path d="M13.6 4H13.6A1.6 1.6 0 0 1 15.2 5.6V10.4A1.6 1.6 0 0 1 13.6 12H13.6A1.6 1.6 0 0 1 12 10.4V5.6A1.6 1.6 0 0 1 13.6 4Z" fill="#003087" />
                      <path d="M27.6 4H27.599999999999998A1.6 1.6 0 0 1 29.2 5.6V10.4A1.6 1.6 0 0 1 27.599999999999998 12H27.6A1.6 1.6 0 0 1 26 10.4V5.6A1.6 1.6 0 0 1 27.6 4Z" fill="#003087" />
                      <path d="M12 22H14.5A1 1 0 0 1 15.5 23V25A1 1 0 0 1 14.5 26H12A1 1 0 0 1 11 25V23A1 1 0 0 1 12 22Z" fill="#7dd3fc" />
                      <path d="M19.5 22H22.0A1 1 0 0 1 23.0 23V25A1 1 0 0 1 22.0 26H19.5A1 1 0 0 1 18.5 25V23A1 1 0 0 1 19.5 22Z" fill="#7dd3fc" />
                      <path d="M27 22H29.5A1 1 0 0 1 30.5 23V25A1 1 0 0 1 29.5 26H27A1 1 0 0 1 26 25V23A1 1 0 0 1 27 22Z" fill="#7dd3fc" />
                      <path d="M12 29H14.5A1 1 0 0 1 15.5 30V32A1 1 0 0 1 14.5 33H12A1 1 0 0 1 11 32V30A1 1 0 0 1 12 29Z" fill="#7dd3fc" />
                      <path d="M19.5 29H22.0A1 1 0 0 1 23.0 30V32A1 1 0 0 1 22.0 33H19.5A1 1 0 0 1 18.5 32V30A1 1 0 0 1 19.5 29Z" fill="#7dd3fc" />
                      <path d="M26.5 35a9.5 9.5 0 1 0 19.0 0a9.5 9.5 0 1 0 -19.0 0Z" fill="#0ea5e9" />
                      <path d="M29 35a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#ffffff" />
                      <path d="M36 31V35.5L39 37.5" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="k">{v.t?.kExp}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                    <span className="v num" style={{ color: "#a14f06" }}>{v.k?.expN}</span>
                    <span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.k?.expV}</span>
                  </span>
                  <span style={{ fontSize: "var(--text-sm)", color: "#a14f06", fontWeight: "var(--weight-medium)" }}>{v.k?.expSub}</span>
                </button>
                <div className="card kpi">
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
                      <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
                      <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
                    </svg>
                    <span className="k">{v.t?.kRet}</span>
                  </span>
                  <span className="v num" style={{ color: "#047857" }}>{v.k?.ret}</span>
                  <span className="num" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{v.k?.retSub}</span>
                </div>
              </div>
              <DamagedStockPanel />
              <section className="card" style={{ overflow: "hidden" }}>
                <div className="tabl" role="tablist" style={{ padding: "0 12px" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" className={tb?.cls} aria-selected={tb?.on} onClick={tb?.pick} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>{tb?.i0 ? (<>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />
  </svg>
</>) : null}{tb?.i1 ? (<>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
  </svg>
</>) : null}{tb?.i2 ? (<>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </svg>
</>) : null}{tb?.l}</button>
                    </React.Fragment>))}
                </div>
                {v.isExp ? (<>
                  <div className="fade">
                    <div style={{ padding: "14px 16px 4px" }}>
                      <div className={v.noteCls} style={{ alignItems: "center" }}>
                        <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M9 8H32A4 4 0 0 1 36 12V35A4 4 0 0 1 32 39H9A4 4 0 0 1 5 35V12A4 4 0 0 1 9 8Z" fill="#e0f2fe" />
                          <path d="M9.5 9.5H31.5A3 3 0 0 1 34.5 12.5V34.5A3 3 0 0 1 31.5 37.5H9.5A3 3 0 0 1 6.5 34.5V12.5A3 3 0 0 1 9.5 9.5Z" fill="#ffffff" />
                          <path d="M9 8H32A4 4 0 0 1 36 12V14A4 4 0 0 1 32 18H9A4 4 0 0 1 5 14V12A4 4 0 0 1 9 8Z" fill="#0ea5e9" />
                          <path d="M5 13h31v5h-31Z" fill="#0ea5e9" />
                          <path d="M13.6 4H13.6A1.6 1.6 0 0 1 15.2 5.6V10.4A1.6 1.6 0 0 1 13.6 12H13.6A1.6 1.6 0 0 1 12 10.4V5.6A1.6 1.6 0 0 1 13.6 4Z" fill="#003087" />
                          <path d="M27.6 4H27.599999999999998A1.6 1.6 0 0 1 29.2 5.6V10.4A1.6 1.6 0 0 1 27.599999999999998 12H27.6A1.6 1.6 0 0 1 26 10.4V5.6A1.6 1.6 0 0 1 27.6 4Z" fill="#003087" />
                          <path d="M12 22H14.5A1 1 0 0 1 15.5 23V25A1 1 0 0 1 14.5 26H12A1 1 0 0 1 11 25V23A1 1 0 0 1 12 22Z" fill="#7dd3fc" />
                          <path d="M19.5 22H22.0A1 1 0 0 1 23.0 23V25A1 1 0 0 1 22.0 26H19.5A1 1 0 0 1 18.5 25V23A1 1 0 0 1 19.5 22Z" fill="#7dd3fc" />
                          <path d="M27 22H29.5A1 1 0 0 1 30.5 23V25A1 1 0 0 1 29.5 26H27A1 1 0 0 1 26 25V23A1 1 0 0 1 27 22Z" fill="#7dd3fc" />
                          <path d="M12 29H14.5A1 1 0 0 1 15.5 30V32A1 1 0 0 1 14.5 33H12A1 1 0 0 1 11 32V30A1 1 0 0 1 12 29Z" fill="#7dd3fc" />
                          <path d="M19.5 29H22.0A1 1 0 0 1 23.0 30V32A1 1 0 0 1 22.0 33H19.5A1 1 0 0 1 18.5 32V30A1 1 0 0 1 19.5 29Z" fill="#7dd3fc" />
                          <path d="M26.5 35a9.5 9.5 0 1 0 19.0 0a9.5 9.5 0 1 0 -19.0 0Z" fill="#0ea5e9" />
                          <path d="M29 35a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#ffffff" />
                          <path d="M36 31V35.5L39 37.5" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{v.noteTxt}</span>
                      </div>
                    </div>
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">{v.t?.cProd}</th>
                            <th className="th">{v.t?.cBatch}</th>
                            <th className="th">{v.t?.cDate}</th>
                            <th className="th">{v.daysHead}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cQty}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cVal}</th>
                            <th className="th">{v.t?.cDo}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.exps).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className="trow">
                                <td className="td" style={{ padding: "10px 12px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={__sx(`width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${r?.tint ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M9 8H32A4 4 0 0 1 36 12V35A4 4 0 0 1 32 39H9A4 4 0 0 1 5 35V12A4 4 0 0 1 9 8Z" fill="#e0f2fe" />
                                        <path d="M9.5 9.5H31.5A3 3 0 0 1 34.5 12.5V34.5A3 3 0 0 1 31.5 37.5H9.5A3 3 0 0 1 6.5 34.5V12.5A3 3 0 0 1 9.5 9.5Z" fill="#ffffff" />
                                        <path d="M9 8H32A4 4 0 0 1 36 12V14A4 4 0 0 1 32 18H9A4 4 0 0 1 5 14V12A4 4 0 0 1 9 8Z" fill="#0ea5e9" />
                                        <path d="M5 13h31v5h-31Z" fill="#0ea5e9" />
                                        <path d="M13.6 4H13.6A1.6 1.6 0 0 1 15.2 5.6V10.4A1.6 1.6 0 0 1 13.6 12H13.6A1.6 1.6 0 0 1 12 10.4V5.6A1.6 1.6 0 0 1 13.6 4Z" fill="#003087" />
                                        <path d="M27.6 4H27.599999999999998A1.6 1.6 0 0 1 29.2 5.6V10.4A1.6 1.6 0 0 1 27.599999999999998 12H27.6A1.6 1.6 0 0 1 26 10.4V5.6A1.6 1.6 0 0 1 27.6 4Z" fill="#003087" />
                                        <path d="M12 22H14.5A1 1 0 0 1 15.5 23V25A1 1 0 0 1 14.5 26H12A1 1 0 0 1 11 25V23A1 1 0 0 1 12 22Z" fill="#7dd3fc" />
                                        <path d="M19.5 22H22.0A1 1 0 0 1 23.0 23V25A1 1 0 0 1 22.0 26H19.5A1 1 0 0 1 18.5 25V23A1 1 0 0 1 19.5 22Z" fill="#7dd3fc" />
                                        <path d="M27 22H29.5A1 1 0 0 1 30.5 23V25A1 1 0 0 1 29.5 26H27A1 1 0 0 1 26 25V23A1 1 0 0 1 27 22Z" fill="#7dd3fc" />
                                        <path d="M12 29H14.5A1 1 0 0 1 15.5 30V32A1 1 0 0 1 14.5 33H12A1 1 0 0 1 11 32V30A1 1 0 0 1 12 29Z" fill="#7dd3fc" />
                                        <path d="M19.5 29H22.0A1 1 0 0 1 23.0 30V32A1 1 0 0 1 22.0 33H19.5A1 1 0 0 1 18.5 32V30A1 1 0 0 1 19.5 29Z" fill="#7dd3fc" />
                                        <path d="M26.5 35a9.5 9.5 0 1 0 19.0 0a9.5 9.5 0 1 0 -19.0 0Z" fill="#0ea5e9" />
                                        <path d="M29 35a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#ffffff" />
                                        <path d="M36 31V35.5L39 37.5" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                    <span style={{ minWidth: "0" }}>
                                      <span style={{ display: "block", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>{r?.name}</span>
                                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{r?.sup} · <span style={__sx(`color: ${r?.retFg ?? ""}; font-weight: var(--weight-medium);`)}>{r?.retTxt}</span></span>
                                    </span>
                                  </span>
                                </td>
                                <td className="td mono" style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>{r?.batch}</td>
                                <td className="td num" style={{ padding: "10px 12px", fontSize: "var(--text-sm-plus)", whiteSpace: "nowrap" }}>{r?.date}</td>
                                <td className="td" style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                                  <span className="num" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${r?.dfg ?? ""};`)}>{r?.days}</span>
                                </td>
                                <td className="td num" style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>{r?.qty}</td>
                                <td className="td num" style={{ padding: "10px 12px", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{r?.val}</td>
                                <td className="td" style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                                  <span style={{ display: "inline-flex", gap: "6px" }}>
                                    {__list(r?.sugg).map((sg, $index) => (<React.Fragment key={$index}>
                                        <button type="button" className={sg?.cls} aria-pressed={sg?.on} onClick={sg?.pick} style={{ height: "36px", padding: "0 11px", fontSize: "var(--text-sm)", display: "inline-flex", alignItems: "center", gap: "5px" }}>{sg?.a_disc ? (<>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />
    </svg>
  </>) : null}{sg?.a_ret ? (<>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
    </svg>
  </>) : null}{sg?.a_throw ? (<>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  </>) : null}{sg?.l}</button>
                                      </React.Fragment>))}
                                  </span>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>) : null}
                {v.isDmg ? (<>
                  <div className="fade">
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">{v.t?.cProd}</th>
                            <th className="th">{v.t?.cWhat}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cQty}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cLossC}</th>
                            <th className="th">{v.t?.cWho}</th>
                            <th className="th">{v.t?.cPhoto}</th>
                            <th className="th">{v.t?.cAction}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.dmgs).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className="trow">
                                <td className="td" style={{ padding: "10px 12px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#fff4f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {r?.w_break ? (<>
                                        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                                          <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                                          <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                                          <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                                          <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                                        </svg>
                                      </>) : null}
                                      {r?.w_rot ? (<>
                                        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M9 28a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z" fill="#0ea5e9" />
                                          <path d="M12.5 28a11.5 11.5 0 1 0 23.0 0a11.5 11.5 0 1 0 -23.0 0Z" fill="#0ea5e9" />
                                          <path d="M14.4 25a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#003087" />
                                          <path d="M24.9 32.5a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0Z" fill="#003087" />
                                          <path d="M26.7 21a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#003087" />
                                          <path d="M17 35a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                                          <path d="M24 13V7" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M25 10L35 5L32 13Z" fill="#0ea5e9" />
                                          <path d="M38 13q3 -3 0 -6M43 16q3 -3 0 -6" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </>) : null}
                                      {r?.w_rat ? (<>
                                        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M9 34C2 34 2 43 10 43H22" fill="none" stroke="#0ea5e9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M17.5 22H28.5A9.5 9.5 0 0 1 38 31.5V31.5A9.5 9.5 0 0 1 28.5 41H17.5A9.5 9.5 0 0 1 8 31.5V31.5A9.5 9.5 0 0 1 17.5 22Z" fill="#7dd3fc" />
                                          <path d="M26.5 27a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                                          <path d="M26.5 18.5a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#7dd3fc" />
                                          <path d="M29 18.5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#7dd3fc" />
                                          <path d="M36.8 25.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#003087" />
                                          <path d="M41.5 29a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
                                          <path d="M40 32l5 2M40 31l5 -1" fill="none" stroke="#003087" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </>) : null}
                                      {r?.w_water ? (<>
                                        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M8 30H30A2 2 0 0 1 32 32V42A2 2 0 0 1 30 44H8A2 2 0 0 1 6 42V32A2 2 0 0 1 8 30Z" fill="#7dd3fc" />
                                          <path d="M16 30h6v14h-6Z" fill="#e0f2fe" />
                                          <path d="M31 3C31 3 19 16 19 24a12 12 0 0 0 24 0C43 16 31 3 31 3Z" fill="#0ea5e9" />
                                          <path d="M25 25a6 6 0 0 0 6 6" fill="none" stroke="#e0f2fe" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M7 22a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#7dd3fc" />
                                          <path d="M12 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                                        </svg>
                                      </>) : null}
                                      {r?.w_exp ? (<>
                                        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M9 8H32A4 4 0 0 1 36 12V35A4 4 0 0 1 32 39H9A4 4 0 0 1 5 35V12A4 4 0 0 1 9 8Z" fill="#e0f2fe" />
                                          <path d="M9.5 9.5H31.5A3 3 0 0 1 34.5 12.5V34.5A3 3 0 0 1 31.5 37.5H9.5A3 3 0 0 1 6.5 34.5V12.5A3 3 0 0 1 9.5 9.5Z" fill="#ffffff" />
                                          <path d="M9 8H32A4 4 0 0 1 36 12V14A4 4 0 0 1 32 18H9A4 4 0 0 1 5 14V12A4 4 0 0 1 9 8Z" fill="#0ea5e9" />
                                          <path d="M5 13h31v5h-31Z" fill="#0ea5e9" />
                                          <path d="M13.6 4H13.6A1.6 1.6 0 0 1 15.2 5.6V10.4A1.6 1.6 0 0 1 13.6 12H13.6A1.6 1.6 0 0 1 12 10.4V5.6A1.6 1.6 0 0 1 13.6 4Z" fill="#003087" />
                                          <path d="M27.6 4H27.599999999999998A1.6 1.6 0 0 1 29.2 5.6V10.4A1.6 1.6 0 0 1 27.599999999999998 12H27.6A1.6 1.6 0 0 1 26 10.4V5.6A1.6 1.6 0 0 1 27.6 4Z" fill="#003087" />
                                          <path d="M12 22H14.5A1 1 0 0 1 15.5 23V25A1 1 0 0 1 14.5 26H12A1 1 0 0 1 11 25V23A1 1 0 0 1 12 22Z" fill="#7dd3fc" />
                                          <path d="M19.5 22H22.0A1 1 0 0 1 23.0 23V25A1 1 0 0 1 22.0 26H19.5A1 1 0 0 1 18.5 25V23A1 1 0 0 1 19.5 22Z" fill="#7dd3fc" />
                                          <path d="M27 22H29.5A1 1 0 0 1 30.5 23V25A1 1 0 0 1 29.5 26H27A1 1 0 0 1 26 25V23A1 1 0 0 1 27 22Z" fill="#7dd3fc" />
                                          <path d="M12 29H14.5A1 1 0 0 1 15.5 30V32A1 1 0 0 1 14.5 33H12A1 1 0 0 1 11 32V30A1 1 0 0 1 12 29Z" fill="#7dd3fc" />
                                          <path d="M19.5 29H22.0A1 1 0 0 1 23.0 30V32A1 1 0 0 1 22.0 33H19.5A1 1 0 0 1 18.5 32V30A1 1 0 0 1 19.5 29Z" fill="#7dd3fc" />
                                          <path d="M26.5 35a9.5 9.5 0 1 0 19.0 0a9.5 9.5 0 1 0 -19.0 0Z" fill="#0ea5e9" />
                                          <path d="M29 35a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#ffffff" />
                                          <path d="M36 31V35.5L39 37.5" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </>) : null}
                                    </span>
                                    <span style={{ minWidth: "0" }}>
                                      <span style={{ display: "block", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>{r?.name}</span>
                                      <span className="num" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{r?.date} · {r?.place}</span>
                                    </span>
                                  </span>
                                </td>
                                <td className="td" style={{ padding: "10px 12px" }}>
                                  <span className="pill p-grey">{r?.why}</span>
                                </td>
                                <td className="td num" style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>{r?.qty}</td>
                                <td className="td num" style={__sx(`padding: 10px 12px; text-align: right; font-weight: var(--weight-semibold); color: ${r?.lfg ?? ""}; white-space: nowrap;`)}>{r?.loss}</td>
                                <td className="td" style={{ padding: "10px 12px", fontSize: "var(--text-sm-plus)" }}>{r?.who}</td>
                                <td className="td" style={{ padding: "10px 12px" }}>
                                  <span role="img" aria-label={r?.photoAria} style={__sx(`width: 48px; height: 40px; border-radius: var(--radius-lg); background: ${r?.phBg ?? ""}; color: ${r?.phFg ?? ""}; border: 1px dashed ${r?.phBd ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                                    </svg>
                                  </span>
                                </td>
                                <td className="td" style={{ padding: "10px 12px" }}>
                                  <span className={r?.acls}>{r?.act}</span>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>) : null}
              </section>
              <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
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
                  <h2 className="h2">{v.t?.whyH}</h2>
                </div>
                <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px 28px" }}>
                  {__list(v.whyBars).map((wb, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "var(--text-sm-plus)" }}>
                        {wb?.w_break ? (<>
                          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                            <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                            <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                            <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                            <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                          </svg>
                        </>) : null}
                        {wb?.w_rot ? (<>
                          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M9 28a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z" fill="#0ea5e9" />
                            <path d="M12.5 28a11.5 11.5 0 1 0 23.0 0a11.5 11.5 0 1 0 -23.0 0Z" fill="#0ea5e9" />
                            <path d="M14.4 25a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#003087" />
                            <path d="M24.9 32.5a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0Z" fill="#003087" />
                            <path d="M26.7 21a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#003087" />
                            <path d="M17 35a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                            <path d="M24 13V7" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M25 10L35 5L32 13Z" fill="#0ea5e9" />
                            <path d="M38 13q3 -3 0 -6M43 16q3 -3 0 -6" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        {wb?.w_rat ? (<>
                          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M9 34C2 34 2 43 10 43H22" fill="none" stroke="#0ea5e9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17.5 22H28.5A9.5 9.5 0 0 1 38 31.5V31.5A9.5 9.5 0 0 1 28.5 41H17.5A9.5 9.5 0 0 1 8 31.5V31.5A9.5 9.5 0 0 1 17.5 22Z" fill="#7dd3fc" />
                            <path d="M26.5 27a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                            <path d="M26.5 18.5a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#7dd3fc" />
                            <path d="M29 18.5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#7dd3fc" />
                            <path d="M36.8 25.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#003087" />
                            <path d="M41.5 29a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
                            <path d="M40 32l5 2M40 31l5 -1" fill="none" stroke="#003087" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        {wb?.w_water ? (<>
                          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M8 30H30A2 2 0 0 1 32 32V42A2 2 0 0 1 30 44H8A2 2 0 0 1 6 42V32A2 2 0 0 1 8 30Z" fill="#7dd3fc" />
                            <path d="M16 30h6v14h-6Z" fill="#e0f2fe" />
                            <path d="M31 3C31 3 19 16 19 24a12 12 0 0 0 24 0C43 16 31 3 31 3Z" fill="#0ea5e9" />
                            <path d="M25 25a6 6 0 0 0 6 6" fill="none" stroke="#e0f2fe" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 22a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#7dd3fc" />
                            <path d="M12 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                          </svg>
                        </>) : null}
                        {wb?.w_exp ? (<>
                          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M9 8H32A4 4 0 0 1 36 12V35A4 4 0 0 1 32 39H9A4 4 0 0 1 5 35V12A4 4 0 0 1 9 8Z" fill="#e0f2fe" />
                            <path d="M9.5 9.5H31.5A3 3 0 0 1 34.5 12.5V34.5A3 3 0 0 1 31.5 37.5H9.5A3 3 0 0 1 6.5 34.5V12.5A3 3 0 0 1 9.5 9.5Z" fill="#ffffff" />
                            <path d="M9 8H32A4 4 0 0 1 36 12V14A4 4 0 0 1 32 18H9A4 4 0 0 1 5 14V12A4 4 0 0 1 9 8Z" fill="#0ea5e9" />
                            <path d="M5 13h31v5h-31Z" fill="#0ea5e9" />
                            <path d="M13.6 4H13.6A1.6 1.6 0 0 1 15.2 5.6V10.4A1.6 1.6 0 0 1 13.6 12H13.6A1.6 1.6 0 0 1 12 10.4V5.6A1.6 1.6 0 0 1 13.6 4Z" fill="#003087" />
                            <path d="M27.6 4H27.599999999999998A1.6 1.6 0 0 1 29.2 5.6V10.4A1.6 1.6 0 0 1 27.599999999999998 12H27.6A1.6 1.6 0 0 1 26 10.4V5.6A1.6 1.6 0 0 1 27.6 4Z" fill="#003087" />
                            <path d="M12 22H14.5A1 1 0 0 1 15.5 23V25A1 1 0 0 1 14.5 26H12A1 1 0 0 1 11 25V23A1 1 0 0 1 12 22Z" fill="#7dd3fc" />
                            <path d="M19.5 22H22.0A1 1 0 0 1 23.0 23V25A1 1 0 0 1 22.0 26H19.5A1 1 0 0 1 18.5 25V23A1 1 0 0 1 19.5 22Z" fill="#7dd3fc" />
                            <path d="M27 22H29.5A1 1 0 0 1 30.5 23V25A1 1 0 0 1 29.5 26H27A1 1 0 0 1 26 25V23A1 1 0 0 1 27 22Z" fill="#7dd3fc" />
                            <path d="M12 29H14.5A1 1 0 0 1 15.5 30V32A1 1 0 0 1 14.5 33H12A1 1 0 0 1 11 32V30A1 1 0 0 1 12 29Z" fill="#7dd3fc" />
                            <path d="M19.5 29H22.0A1 1 0 0 1 23.0 30V32A1 1 0 0 1 22.0 33H19.5A1 1 0 0 1 18.5 32V30A1 1 0 0 1 19.5 29Z" fill="#7dd3fc" />
                            <path d="M26.5 35a9.5 9.5 0 1 0 19.0 0a9.5 9.5 0 1 0 -19.0 0Z" fill="#0ea5e9" />
                            <path d="M29 35a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#ffffff" />
                            <path d="M36 31V35.5L39 37.5" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        <span style={{ width: "130px", flexShrink: "0" }}>{wb?.l}</span>
                        <span className="bar" style={{ flexGrow: "1", height: "10px" }}>
                          <span style={__sx(`width: ${wb?.w ?? ""}; height: 10px; background: #e0431b;`)} />
                        </span>
                        <span className="num" style={{ width: "70px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{wb?.v}</span>
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              {v.drOpen ? (<>
                <div role="button" tabIndex={0} className="scrim" onClick={v.closeDr} />
                <section className="drawer fade" aria-label={v.t?.dTitle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 20px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#fff4f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                        <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                        <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                        <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                        <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                      </svg>
                    </span>
                    <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.dTitle}</h2>
                    <button type="button" className="ib" onClick={v.closeDr} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ flexGrow: "1", overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="fld">
                      <label style={{ height: "48px", display: "flex", alignItems: "center", gap: "8px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-xl)", color: "var(--text-muted)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
                        </svg>
                        <input value={v.dq} onInput={v.typeDq} onChange={v.typeDq} placeholder={v.t?.dFind} aria-label={v.t?.dFind} style={{ flexGrow: "1", minWidth: "0", border: "0", outline: "none", font: "inherit", fontSize: "var(--text-sm-plus)", background: "transparent", color: "#0f172a" }} />
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {__list(v.dProds).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`display: flex; align-items: center; gap: 10px; min-height: 46px; padding: 6px 12px; border-radius: var(--radius-xl); border: 2px solid ${o?.bd ?? ""}; background: ${o?.bg ?? ""}; cursor: pointer; text-align: left;`)}>
                              <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{o?.l}</span>
                              <span className="num hint">{o?.sub}</span>
                            </button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ flexGrow: "1" }}>
                        <span className="lbl" style={{ display: "block" }}>{v.t?.dQty}</span>
                        <span className="hint num">{v.t?.inStock} {v.dStock}</span>
                      </span>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-xl)" }}>
                        <button type="button" className="ib" onClick={v.decQ} aria-label="−" style={{ border: "0", fontSize: "var(--text-2xl)" }}>−</button>
                        <span className="num" style={{ minWidth: "44px", textAlign: "center", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{v.dQtyTxt}</span>
                        <button type="button" className="ib" onClick={v.incQ} aria-label="+" style={{ border: "0", fontSize: "var(--text-2xl)" }}>+</button>
                      </div>
                      <span style={{ fontSize: "var(--text-sm-plus)", color: "#475569", minWidth: "44px" }}>{v.dUnit}</span>
                    </div>
                    <div className="fld">
                      <span className="lbl">{v.t?.dWhy}</span>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {__list(v.dWhy).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>{o?.w_break ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
    <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
    <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
    <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
    <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
  </svg>
</>) : null}{o?.w_rot ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 28a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z" fill="#0ea5e9" />
    <path d="M12.5 28a11.5 11.5 0 1 0 23.0 0a11.5 11.5 0 1 0 -23.0 0Z" fill="#0ea5e9" />
    <path d="M14.4 25a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#003087" />
    <path d="M24.9 32.5a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0Z" fill="#003087" />
    <path d="M26.7 21a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#003087" />
    <path d="M17 35a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
    <path d="M24 13V7" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 10L35 5L32 13Z" fill="#0ea5e9" />
    <path d="M38 13q3 -3 0 -6M43 16q3 -3 0 -6" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.w_rat ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 34C2 34 2 43 10 43H22" fill="none" stroke="#0ea5e9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 22H28.5A9.5 9.5 0 0 1 38 31.5V31.5A9.5 9.5 0 0 1 28.5 41H17.5A9.5 9.5 0 0 1 8 31.5V31.5A9.5 9.5 0 0 1 17.5 22Z" fill="#7dd3fc" />
    <path d="M26.5 27a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
    <path d="M26.5 18.5a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#7dd3fc" />
    <path d="M29 18.5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#7dd3fc" />
    <path d="M36.8 25.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#003087" />
    <path d="M41.5 29a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
    <path d="M40 32l5 2M40 31l5 -1" fill="none" stroke="#003087" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.w_water ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M8 30H30A2 2 0 0 1 32 32V42A2 2 0 0 1 30 44H8A2 2 0 0 1 6 42V32A2 2 0 0 1 8 30Z" fill="#7dd3fc" />
    <path d="M16 30h6v14h-6Z" fill="#e0f2fe" />
    <path d="M31 3C31 3 19 16 19 24a12 12 0 0 0 24 0C43 16 31 3 31 3Z" fill="#0ea5e9" />
    <path d="M25 25a6 6 0 0 0 6 6" fill="none" stroke="#e0f2fe" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 22a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#7dd3fc" />
    <path d="M12 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.w_exp ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 8H32A4 4 0 0 1 36 12V35A4 4 0 0 1 32 39H9A4 4 0 0 1 5 35V12A4 4 0 0 1 9 8Z" fill="#e0f2fe" />
    <path d="M9.5 9.5H31.5A3 3 0 0 1 34.5 12.5V34.5A3 3 0 0 1 31.5 37.5H9.5A3 3 0 0 1 6.5 34.5V12.5A3 3 0 0 1 9.5 9.5Z" fill="#ffffff" />
    <path d="M9 8H32A4 4 0 0 1 36 12V14A4 4 0 0 1 32 18H9A4 4 0 0 1 5 14V12A4 4 0 0 1 9 8Z" fill="#0ea5e9" />
    <path d="M5 13h31v5h-31Z" fill="#0ea5e9" />
    <path d="M13.6 4H13.6A1.6 1.6 0 0 1 15.2 5.6V10.4A1.6 1.6 0 0 1 13.6 12H13.6A1.6 1.6 0 0 1 12 10.4V5.6A1.6 1.6 0 0 1 13.6 4Z" fill="#003087" />
    <path d="M27.6 4H27.599999999999998A1.6 1.6 0 0 1 29.2 5.6V10.4A1.6 1.6 0 0 1 27.599999999999998 12H27.6A1.6 1.6 0 0 1 26 10.4V5.6A1.6 1.6 0 0 1 27.6 4Z" fill="#003087" />
    <path d="M12 22H14.5A1 1 0 0 1 15.5 23V25A1 1 0 0 1 14.5 26H12A1 1 0 0 1 11 25V23A1 1 0 0 1 12 22Z" fill="#7dd3fc" />
    <path d="M19.5 22H22.0A1 1 0 0 1 23.0 23V25A1 1 0 0 1 22.0 26H19.5A1 1 0 0 1 18.5 25V23A1 1 0 0 1 19.5 22Z" fill="#7dd3fc" />
    <path d="M27 22H29.5A1 1 0 0 1 30.5 23V25A1 1 0 0 1 29.5 26H27A1 1 0 0 1 26 25V23A1 1 0 0 1 27 22Z" fill="#7dd3fc" />
    <path d="M12 29H14.5A1 1 0 0 1 15.5 30V32A1 1 0 0 1 14.5 33H12A1 1 0 0 1 11 32V30A1 1 0 0 1 12 29Z" fill="#7dd3fc" />
    <path d="M19.5 29H22.0A1 1 0 0 1 23.0 30V32A1 1 0 0 1 22.0 33H19.5A1 1 0 0 1 18.5 32V30A1 1 0 0 1 19.5 29Z" fill="#7dd3fc" />
    <path d="M26.5 35a9.5 9.5 0 1 0 19.0 0a9.5 9.5 0 1 0 -19.0 0Z" fill="#0ea5e9" />
    <path d="M29 35a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#ffffff" />
    <path d="M36 31V35.5L39 37.5" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <button type="button" onClick={v.togglePhoto} aria-pressed={v.hasPhoto} style={__sx(`width: 110px; height: 84px; flex-shrink: 0; border-radius: var(--radius-xl); border: 2px dashed ${v.phBd ?? ""}; background: ${v.phBg ?? ""}; color: ${v.phFg ?? ""}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer;`)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
</svg>{v.phLbl}</button>
                      <span className="hint" style={{ fontSize: "var(--text-sm)" }}>{v.t?.dPhotoHint}</span>
                    </div>
                    <div className="fld">
                      <span className="lbl">{v.t?.dDo}</span>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                        {__list(v.dDo).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ justifyContent: "center", height: "52px", display: "inline-flex", alignItems: "center", gap: "7px" }}>{o?.a_throw ? (<>
  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10 10H38A2 2 0 0 1 40 12V13A2 2 0 0 1 38 15H10A2 2 0 0 1 8 13V12A2 2 0 0 1 10 10Z" fill="#003087" />
    <path d="M19 10V6.5h10V10" fill="none" stroke="#003087" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 16L37 16L34.5 43L13.5 43Z" fill="#0ea5e9" />
    <path d="M19 21V38M24 21V38M29 21V38" fill="none" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M29 36a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
    <path d="M34 33l6 6M40 33l-6 6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.a_ret ? (<>
  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
    <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
    <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
  </svg>
</>) : null}{o?.a_disc ? (<>
  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M5 24a19 19 0 1 0 38 0a19 19 0 1 0 -38 0Z" fill="#ef4444" />
    <path d="M14.4 18a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#ffffff" />
    <path d="M26.4 30a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#ffffff" />
    <path d="M31 16L17 32" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    {v.isDisc ? (<>
                      <label className="fld fade">
                        <span className="lbl">{v.t?.dPrice}</span>
                        <input className="inp num" value={v.dPriceTxt} onInput={v.typePrice} onChange={v.typePrice} aria-label={v.t?.dPrice} style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }} />
                        <span className="hint num">{v.dPriceHint}</span>
                      </label>
                    </>) : null}
                    <div style={__sx(`padding: 14px 16px; border-radius: var(--radius-xl); background: ${v.lossBg ?? ""}; display: flex; flex-direction: column; gap: 2px;`)}>
                      <span style={__sx(`font-size: var(--text-sm); color: ${v.lossFg ?? ""}; font-weight: var(--weight-medium);`)}>{v.lossLbl}</span>
                      <span className="num" style={__sx(`font-size: var(--text-3xl); line-height: 36px; font-weight: var(--weight-semibold); color: ${v.lossFg ?? ""};`)}>{v.lossVal}</span>
                      <span className="num" style={{ fontSize: "var(--text-sm)", color: "#475569" }}>{v.lossNote}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", padding: "14px 20px", borderTop: "1px solid #eef2f6" }}>
                    <button type="button" className="btn line" onClick={v.closeDr}>{v.t?.cancel}</button>
                    <button type="button" className="btn solid big" onClick={v.saveDmg} style={{ flexGrow: "1" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.save}</button>
                  </div>
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
