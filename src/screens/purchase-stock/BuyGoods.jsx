'use client';
// Generated from design/templates/purchase-stock/BuyGoods.dc.html by scripts/convert-design.mjs.
// Buy goods — Purchase — Buy goods. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["মাল কেনা", "Buy goods"], "hsub": ["মাল এসেছে? এখানে লিখুন — সেভ করলেই স্টকে যোগ হবে, আলাদা অনুমোদন লাগবে না।", "Goods arrived? Enter them here — saving adds them to stock straight away."], "list": ["কেনার খাতা", "Purchase history"], "supplier": ["সাপ্লায়ার", "Supplier"], "change": ["বদলান", "Change"], "curDue": ["এখন দেনা", "You owe now"], "nextDue": ["পরের শোধ", "Next payment"], "pickSup": ["সাপ্লায়ার বাছুন", "Pick a supplier"], "chNo": ["চালান নং", "Supplier invoice no."], "date": ["তারিখ", "Date"], "where": ["কোথায় রাখবেন", "Where to keep it"], "items": ["কী কী মাল এলো", "Items received"], "scan": ["মালের নাম লিখুন বা বারকোড স্ক্যান করুন", "Type an item name or scan a barcode"], "scanBtn": ["স্ক্যান", "Scan"], "quick": ["এই সাপ্লায়ারের অন্য মাল", "More from this supplier"], "cProd": ["মাল", "Item"], "cUnit": ["একক", "Unit"], "cQty": ["পরিমাণ", "Qty"], "cPrice": ["কেনা দাম", "Buying price"], "cTotal": ["মোট", "Total"], "remove": ["বাদ দিন", "Remove"], "sellOk": ["বেচা দাম ঠিক আছে?", "Is the selling price still right?"], "sum": ["হিসাব", "Summary"], "subtotal": ["মোট", "Subtotal"], "disc": ["ছাড়", "Discount"], "carry": ["পরিবহন / লেবার খরচ", "Transport / labour"], "grand": ["সর্বমোট", "Grand total"], "pay": ["টাকা", "Payment"], "paidNow": ["এখন কত দিলেন", "Paid now"], "method": ["কীভাবে দিলেন", "Paid by"], "willOwe": ["বাকি থাকবে (দেনা)", "Left to pay (payable)"], "dueDate": ["দেনা শোধের তারিখ", "Pay the rest by"], "photo": ["চালানের ছবি তুলুন বা যোগ করুন", "Take or add a photo of the invoice"], "photoHint": ["পরে মিলিয়ে দেখতে কাজে লাগবে", "Handy for checking later"], "photoDone": ["চালানের ছবি যোগ হয়েছে", "Invoice photo attached"], "photoRe": ["আবার তুলুন", "Retake"], "saveBig": ["সেভ করুন · স্টকে যোগ", "Save · add to stock"], "pageTitle": ["মাল কেনা", "Purchase"]};
var AI = [["প্রাণের জুস ২০ কার্টন, দাম ৮৭০", "Dhaka Gadget Hub juice 20 cartons at 870", "যোগ করলাম: প্রাণ ম্যাঙ্গো জুস ১ লি. × ২০ কার্টন, ৳৮৭০ করে। আগে ছিল ৳৮৫০ — দাম ৳২০ বেড়েছে।", "Added: Wall charger 2-port × 20 boxes at ৳870. It was ৳850 before — up ৳20."], ["১০ হাজার ক্যাশ দিলাম, বাকিটা এক মাস পরে", "Paid 10k cash, rest in a month", "ঠিক আছে — এখন ৳১০,০০০ ক্যাশ, বাকি ৳২১,৫০০ দেনা। শোধের তারিখ ২৯ অক্টোবর বসালাম।", "Done — ৳10,000 cash now, ৳21,500 left as payable, due 29 October."], ["জুসের বেচা দাম কত রাখব?", "What should I sell the juice for?", "নতুন কেনা দামে প্রতি বোতল ৳৭২.৫ পড়ছে। ৳৮৫-তে লাভ ১৫%। ৳৯০ রাখলে লাভ প্রায় ২০% থাকবে।", "At the new price each bottle costs ৳72.5. At ৳85 your margin is 15%; at ৳90 it stays near 20%."]];
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
var D = function (d, m) { return bn ? dg(d, true) + ' ' + MB[m - 1] : d + ' ' + ME[m - 1]; };
var SUP = {
  pran: ['প্রাণ ডিস্ট্রিবিউশন', 'Dhaka Gadget Hub', '01713-456789', 65000, D(29, 9) + L(' (আজ)', ' (today)'), 40000],
  meghna: ['মেঘনা ট্রেডার্স', 'Techland Imports', '01819-234567', 48000, D(29, 9) + L(' (আজ)', ' (today)'), 25000],
  square: ['স্কয়ার কনজিউমার', 'Eastern Electronics', '01730-112233', 32000, D(1, 10), 15000],
  unilever: ['ইউনিলিভার ডিলার', 'Mobile Mart', '01711-908070', 28500, D(29, 9) + L(' (আজ)', ' (today)'), 20000],
  fresh: ['ফ্রেশ এন্টারপ্রাইজ', 'PowerCell Traders', '01555-667788', 18000, D(3, 10), 18000]
};
var SUPK = ['pran', 'meghna', 'square', 'unilever', 'fresh'];
// id, bn, en, pack, piece bn, piece en, carton price (old), sell price per piece
var CAT = {
  j1: ['প্রাণ ম্যাঙ্গো জুস ১ লি.', 'Wall charger 2-port', 12, 'বোতল', 'pc', 850, 85],
  w2: ['পানি ২ লি.', 'Cable protector pack', 6, 'বোতল', 'pc', 168, 35],
  b3: ['বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 24, 'প্যাকেট', 'pack', 1152, 60],
  c4: ['চানাচুর ৩০০ গ্রাম', 'USB-C OTG adapter', 20, 'প্যাকেট', 'pack', 1400, 85],
  l5: ['প্রাণ লাচ্ছি ২৫০ মি.লি.', 'Earbud silicone tips', 24, 'বোতল', 'pc', 480, 25],
  p6: ['পটাটা চিপস ২৫ গ্রাম', 'Phone lanyard strap', 48, 'প্যাকেট', 'pack', 720, 20],
  g7: ['প্রাণ ঘি ২০০ গ্রাম', 'Car phone mount', 12, 'কৌটা', 'tin', 3480, 340]
};
var BGS = [['#eef3fb', '#003087'], ['#e7f8f1', '#047857'], ['#fff4e0', '#a14f06'], ['#fdecf5', '#a3195b']];
var lines = s.lines || [
  { id: 'j1', u: 'box', q: 20, p: 870 }, { id: 'w2', u: 'box', q: 15, p: 168 },
  { id: 'b3', u: 'box', q: 5, p: 1152 }, { id: 'c4', u: 'box', q: 4, p: 1400 }
];
var sellOv = s.sellOv || {};
var fmt = function (n) { var r = Math.round(n * 10) / 10; return dg(r % 1 ? r.toFixed(1) : String(r), bn); };
var setLine = function (id, patch) { self.setState({ lines: lines.map(function (x) { return x.id === id ? assign(assign({}, x), patch) : x; }) }); };
var unitPrice = function (x) { var d = CAT[x.id]; return x.u === 'box' ? x.p : x.p / d[2]; };
var lineTotal = function (x) { return Math.round(unitPrice(x) * x.q); };
var sub = lines.reduce(function (n, x) { return n + lineTotal(x); }, 0);
var disc = s.disc == null ? 280 : s.disc, carry = s.carry == null ? 500 : s.carry;
var grand = Math.max(0, sub - disc + carry);
var paid = s.paid == null ? 10000 : s.paid;
var owe = Math.max(0, grand - paid);
var supK = s.sup || 'pran', sp = SUP[supK];
var dueIn = s.dueIn || 30;
var DUE = { 7: [6, 10], 15: [14, 10], 30: [29, 10] };
var q = s.q || '';
var inList = {}; lines.forEach(function (x) { inList[x.id] = 1; });
var addItem = function (id) { if (inList[id]) { setLine(id, { q: lines.filter(function (x) { return x.id === id; })[0].q + 1 }); return; } self.setState({ lines: lines.concat([{ id: id, u: 'box', q: 1, p: CAT[id][5] }]), q: '' }); };
var avail = Object.keys(CAT).filter(function (id) { return !inList[id] && (!q || (CAT[id][0] + CAT[id][1]).toLowerCase().indexOf(q.toLowerCase()) >= 0); });
var ctnCount = lines.reduce(function (n, x) { return n + (x.u === 'box' ? x.q : 0); }, 0);
var pcCount = lines.reduce(function (n, x) { return n + (x.u === 'pc' ? x.q : 0); }, 0);
var method = s.method || 'cash';
var mName = { cash: L('ক্যাশ', 'cash'), bkash: L('বিকাশ', 'bKash'), bank: L('ব্যাংক', 'bank') };
return {
  pickOpen: !!s.pickOpen, togglePick: function () { self.setState({ pickOpen: !s.pickOpen }); },
  sup: { ini: sp[i].slice(0, 1), name: sp[i], mobile: dg(sp[2], bn), due: money(sp[3], bn), next: sp[4], nextAmt: money(sp[5], bn) + L(' দিতে হবে', ' due') },
  supList: SUPK.map(function (k) { var x = SUP[k]; return { name: x[i], due: money(x[3], bn), on: k === supK, bg: k === supK ? '#eef3fb' : 'transparent', pick: function () { self.setState({ sup: k, pickOpen: false }); } }; }),
  chNo: dg('PRN-58214', bn), dateTxt: L('২৯/০৯/২০২৬ · মঙ্গলবার', '29/09/2026 · Tuesday'),
  whereOpts: seg(self, [['mirpur', 'মিরপুর শাখা', 'Mirpur branch'], ['dhanmondi', 'ধানমন্ডি শাখা', 'Dhanmondi branch'], ['tejgaon', 'তেজগাঁও গুদাম', 'Central Warehouse']], s.where || 'mirpur', 'where', i, 'chip').map(function (o) { return assign(o, { isShop: o.k !== 'tejgaon', isWh: o.k === 'tejgaon' }); }),
  lineCount: dg(lines.length, bn) + L('টা মাল', ' items'),
  q: q, typeQ: function (e) { self.setState({ q: e.target.value }); },
  scan: function () { var id = avail[0] || 'j1'; addItem(id); toast(self, L('বারকোড পড়া হলো: ', 'Barcode read: ') + CAT[id][i] + L(' যোগ হলো', ' added')); },
  quick: avail.slice(0, 3).map(function (id) { return { l: CAT[id][i], p: money(CAT[id][5], bn) + L('/কার্টন', '/box'), add: function () { addItem(id); } }; }),
  lines: lines.map(function (x, j) {
    var d = CAT[x.id], b = BGS[j % 4], pack = d[2];
    var old = x.u === 'box' ? d[5] : d[5] / pack, now = unitPrice(x);
    var costPc = x.p / pack, sell = sellOv[x.id] || d[6];
    var sugg = Math.ceil(costPc * 1.2 / 5) * 5;
    var margin = Math.round((sell - costPc) / sell * 100);
    var diff = now - old;
    var uName = [L('কার্টন', 'box'), bn ? d[3] : d[4]];
    return {
      name: d[i], ini: d[i].slice(0, 1), bg: b[0], fg: b[1],
      conv: L('১ কার্টন = ', '1 box = ') + dg(pack, bn) + ' ' + (bn ? d[3] : d[4] + 's'),
      units: seg(self, [['box', 'কার্টন', 'Box'], ['pc', d[3], d[4]]], x.u, '_u', i, 'sgb').map(function (o) { return assign(o, { pick: function () { if (o.k === x.u) return; setLine(x.id, { u: o.k, q: o.k === 'pc' ? x.q * pack : Math.max(1, Math.round(x.q / pack)) }); } }); }),
      qty: dg(x.q, bn), incLbl: L('এক বাড়ান', 'Increase'), decLbl: L('এক কমান', 'Decrease'),
      inc: function () { setLine(x.id, { q: x.q + 1 }); }, dec: function () { setLine(x.id, { q: Math.max(1, x.q - 1) }); },
      price: fmt(now), typeP: function (e) { var v = num(unbn(e.target.value)); setLine(x.id, { p: x.u === 'box' ? v : v * pack }); },
      pBd: Math.abs(diff) > 0.01 ? '#f5b454' : '#cbd5e1', pBg: Math.abs(diff) > 0.01 ? '#fffcf5' : '#fff',
      total: money(lineTotal(x), bn),
      remove: function () { self.setState({ lines: lines.filter(function (y) { return y.id !== x.id; }) }); },
      changed: Math.abs(diff) > 0.01,
      changeTxt: L('আগের দাম ', 'Was ') + money(old, bn) + ' → ' + L('এখন ', 'now ') + money(now, bn),
      changePct: (diff > 0 ? '+' : '−') + dg(Math.abs(Math.round(diff / old * 1000) / 10), bn) + '%',
      sellTxt: L('এখন বেচেন ', 'Selling at ') + money(sell, bn) + '/' + uName[1] + L(' · লাভ ', ' · margin ') + dg(margin, bn) + '%' + (sell < sugg ? L(' · পরামর্শ ', ' · suggest ') + money(sugg, bn) : ''),
      canFix: sell < sugg, fixed: !!sellOv[x.id],
      fixLbl: money(sugg, bn) + L(' করুন', ' — set'), fixedLbl: L('বেচা দাম বদলানো হলো', 'Selling price updated'),
      fix: function () { var o = assign({}, sellOv); o[x.id] = sugg; self.setState({ sellOv: o }); toast(self, d[i] + L(' — বেচা দাম এখন ', ' — selling price now ') + money(sugg, bn)); }
    };
  }),
  totUnits: L('মোট ', 'Total ') + dg(ctnCount, bn) + L(' কার্টন', ' boxes') + (pcCount ? ' + ' + dg(pcCount, bn) + L(' পিস', ' pcs') : ''),
  subTxt: money(sub, bn), grandTxt: money(grand, bn),
  discTxt: dg(disc, bn), typeDisc: function (e) { self.setState({ disc: num(unbn(e.target.value)) }); },
  carryTxt: dg(carry, bn), typeCarry: function (e) { self.setState({ carry: num(unbn(e.target.value)) }); },
  paidTxt: dg(paid, bn), typePaid: function (e) { self.setState({ paid: num(unbn(e.target.value)) }); },
  methods: seg(self, [['cash', 'ক্যাশ', 'Cash'], ['bkash', 'বিকাশ', 'bKash'], ['bank', 'ব্যাংক', 'Bank']], method, 'method', i, 'chip').map(function (o) { return assign(o, { isCash: o.k === 'cash', isBk: o.k === 'bkash', isBank: o.k === 'bank' }); }),
  hasOwe: owe > 0, noOwe: owe <= 0,
  oweLbl: owe > 0 ? t.willOwe : L('পুরো টাকা দেওয়া হলো', 'Paid in full'), oweTxt: money(owe, bn),
  oweBg: owe > 0 ? '#fff4e0' : '#e7f8f1', oweFg: owe > 0 ? '#a14f06' : '#047857',
  newTotalTxt: sp[i] + L('-এর মোট দেনা হবে ', ' total payable becomes ') + money(sp[3] + owe, bn),
  dueDateTxt: D(DUE[dueIn][0], DUE[dueIn][1]) + ' ' + dg('2026', bn),
  dueOpts: seg(self, [[7, '৭ দিন', '7 days'], [15, '১৫ দিন', '15 days'], [30, '৩০ দিন', '30 days']], dueIn, 'dueIn', i, 'chip'),
  noPhoto: !s.photo, hasPhoto: !!s.photo, photoName: dg('chalan_PRN-58214.jpg', bn),
  togglePhoto: function () { self.setState({ photo: !s.photo }); },
  save: function () {
    if (!lines.length) { toast(self, L('আগে অন্তত একটা মাল যোগ করুন।', 'Add at least one item first.')); return; }
    toast(self, owe > 0 ? L('স্টকে যোগ হলো, দেনা বাড়ল ', 'Added to stock. Payable up by ') + money(owe, bn) + L('। দিলেন ', '. Paid ') + money(Math.min(paid, grand), bn) + ' (' + mName[method] + ')' : L('স্টকে যোগ হলো, পুরো টাকা দেওয়া হয়েছে।', 'Added to stock. Paid in full.'));
  }
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

export default class BuyGoodsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="BuyGoods">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={v.rootCls} style={{ width: "1440px", height: "1400px", position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-buy" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "18px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <__Topbar crumb="Purchase" page="Buy goods" placeholder="Search products, customers or memo no." />
            <div style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", borderRadius: "15px", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M18.5 6H27.5A1.5 1.5 0 0 1 29 7.5V15.5A1.5 1.5 0 0 1 27.5 17H18.5A1.5 1.5 0 0 1 17 15.5V7.5A1.5 1.5 0 0 1 18.5 6Z" fill="#7dd3fc" />
                    <path d="M21.5 6h3v5h-3Z" fill="#e0f2fe" />
                    <path d="M29.5 10H37.5A1.5 1.5 0 0 1 39 11.5V16.5A1.5 1.5 0 0 1 37.5 18H29.5A1.5 1.5 0 0 1 28 16.5V11.5A1.5 1.5 0 0 1 29.5 10Z" fill="#0ea5e9" />
                    <path d="M32 10h3v4h-3Z" fill="#e0f2fe" />
                    <path d="M8 18L42 18L38.5 32L13 32Z" fill="#0ea5e9" />
                    <path d="M15.1 22H37.9A1.1 1.1 0 0 1 39 23.1V23.099999999999998A1.1 1.1 0 0 1 37.9 24.2H15.1A1.1 1.1 0 0 1 14 23.099999999999998V23.1A1.1 1.1 0 0 1 15.1 22Z" fill="#7dd3fc" />
                    <path d="M16.1 26.5H35.9A1.1 1.1 0 0 1 37 27.6V27.599999999999998A1.1 1.1 0 0 1 35.9 28.7H16.1A1.1 1.1 0 0 1 15 27.599999999999998V27.6A1.1 1.1 0 0 1 16.1 26.5Z" fill="#7dd3fc" />
                    <path d="M3 11H8L13 32H38" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.2 38.5a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#003087" />
                    <path d="M31.2 38.5a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#003087" />
                    <path d="M14.6 38.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#ffffff" />
                    <path d="M33.6 38.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#ffffff" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <__Link href="/purchase-orders" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
</svg>{v.t?.list}</__Link>
                <button type="button" className="btn solid" onClick={v.save}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.save}</button>
              </div>
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ position: "relative", width: "50px", height: "50px", borderRadius: "14px", background: "#fff8eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
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
                        <span style={{ position: "absolute", right: "-4px", bottom: "-4px", minWidth: "22px", height: "22px", padding: "0 4px", borderRadius: "999px", background: "#003087", color: "#fff", border: "2px solid #fff", fontSize: "11.5px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>{v.sup?.ini}</span>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <div className="hint">{v.t?.supplier}</div>
                        <div style={{ fontSize: "18px", fontWeight: "700", lineHeight: "24px" }}>{v.sup?.name}</div>
                        <div className="num hint">{v.sup?.mobile}</div>
                      </div>
                      <div style={{ padding: "8px 14px", borderRadius: "12px", background: "#fff4e0", minWidth: "170px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#7a3b04", fontWeight: "600" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
  <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.curDue}</div>
                        <div className="num" style={{ fontSize: "22px", fontWeight: "700", color: "#a14f06", lineHeight: "28px" }}>{v.sup?.due}</div>
                      </div>
                      <div style={{ padding: "8px 14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e6eaf0", minWidth: "180px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", fontWeight: "600" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.t?.nextDue}</div>
                        <div className="num" style={{ fontSize: "15px", fontWeight: "700", lineHeight: "20px" }}>{v.sup?.next}</div>
                        <div className="num" style={{ fontSize: "13px", color: "#a14f06", fontWeight: "600" }}>{v.sup?.nextAmt}</div>
                      </div>
                      <button type="button" className="btn line sm" onClick={v.togglePick} aria-expanded={v.pickOpen}>{v.t?.change}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m6 9 6 6 6-6" />
</svg></button>
                    </div>
                    {v.pickOpen ? (<>
                      <div className="card fade" role="listbox" aria-label={v.t?.pickSup} style={{ position: "absolute", top: "84px", right: "20px", width: "420px", zIndex: "12", padding: "6px" }}>
                        {__list(v.supList).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" role="option" aria-selected={o?.on} onClick={o?.pick} style={__sx(`width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 0; border-radius: 10px; background: ${o?.bg ?? ""}; cursor: pointer; text-align: left;`)}>
                              <span style={{ flexGrow: "1", fontSize: "15px", fontWeight: "600" }}>{o?.name}</span>
                              <span className="num" style={{ fontSize: "14px", fontWeight: "700", color: "#a14f06" }}>{o?.due}</span>
                            </button>
                          </React.Fragment>))}
                      </div>
                    </>) : null}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr", gap: "12px", paddingTop: "14px", borderTop: "1px solid #eef2f6" }}>
                      <label className="fld">
                        <span className="lbl">{v.t?.chNo}</span>
                        <input className="inp num" defaultValue={v.chNo} aria-label={v.t?.chNo} style={{ fontWeight: "600" }} />
                      </label>
                      <label className="fld">
                        <span className="lbl">{v.t?.date}</span>
                        <span style={{ position: "relative", display: "block" }}>
                          <input className="inp num" defaultValue={v.dateTxt} aria-label={v.t?.date} style={{ paddingLeft: "42px" }} />
                          <span style={{ position: "absolute", left: "14px", top: "14px", color: "#64748b", display: "flex" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                            </svg>
                          </span>
                        </span>
                      </label>
                      <div className="fld">
                        <span className="lbl">{v.t?.where}</span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {__list(v.whereOpts).map((o, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ height: "48px", borderRadius: "12px" }}>{o?.isShop ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 18H39A1 1 0 0 1 40 19V41A1 1 0 0 1 39 42H9A1 1 0 0 1 8 41V19A1 1 0 0 1 9 18Z" fill="#e0f2fe" />
    <path d="M7 9H41A2 2 0 0 1 43 11V17A2 2 0 0 1 41 19H7A2 2 0 0 1 5 17V11A2 2 0 0 1 7 9Z" fill="#0ea5e9" />
    <path d="M11 9h6v10h-6Z" fill="#ffffff" />
    <path d="M23 9h6v10h-6Z" fill="#ffffff" />
    <path d="M35 9h5v10h-5Z" fill="#ffffff" />
    <path d="M21 28H28A1 1 0 0 1 29 29V41A1 1 0 0 1 28 42H21A1 1 0 0 1 20 41V29A1 1 0 0 1 21 28Z" fill="#0ea5e9" />
    <path d="M12.5 23H17.0A1 1 0 0 1 18.0 24V28A1 1 0 0 1 17.0 29H12.5A1 1 0 0 1 11.5 28V24A1 1 0 0 1 12.5 23Z" fill="#7dd3fc" />
    <path d="M32 23H36.5A1 1 0 0 1 37.5 24V28A1 1 0 0 1 36.5 29H32A1 1 0 0 1 31 28V24A1 1 0 0 1 32 23Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.isWh ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M3 19L24 6L45 19Z" fill="#0ea5e9" />
    <path d="M8 18H40A1 1 0 0 1 41 19V41A1 1 0 0 1 40 42H8A1 1 0 0 1 7 41V19A1 1 0 0 1 8 18Z" fill="#e0f2fe" />
    <path d="M16 25H32A1 1 0 0 1 33 26V41A1 1 0 0 1 32 42H16A1 1 0 0 1 15 41V26A1 1 0 0 1 16 25Z" fill="#7dd3fc" />
    <path d="M15 29h18v1.6h-18Z" fill="#003087" />
    <path d="M15 33h18v1.6h-18Z" fill="#003087" />
    <path d="M15 37h18v1.6h-18Z" fill="#003087" />
  </svg>
</>) : null}{o?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                          <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                          <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                          <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                          <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                        </svg>
                        <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.items}</h2>
                        <span className="pill p-info num">{v.lineCount}</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <label style={{ flexGrow: "1", height: "52px", display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", border: "2px solid #003087", borderRadius: "14px", background: "#fff", color: "#003087" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
                          </svg>
                          <input value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder={v.t?.scan} aria-label={v.t?.scan} style={{ flexGrow: "1", border: "0", outline: "none", font: "inherit", fontSize: "16px", background: "transparent", color: "#0f172a" }} />
                        </label>
                        <button type="button" className="btn soft" onClick={v.scan} style={{ height: "52px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 7v10M12 7v10M16 7v10" />
</svg>{v.t?.scanBtn}</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span className="hint" style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.t?.quick}:</span>
                        {__list(v.quick).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className="chip" onClick={o?.add} style={{ height: "34px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>{o?.l} <span className="num" style={{ color: "#64748b", fontWeight: "500" }}>{o?.p}</span></button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 132px 108px 104px 92px 32px", gap: "10px", padding: "10px 20px", background: "#f8fafc", borderTop: "1px solid #eef2f6", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                      <span>{v.t?.cProd}</span>
                      <span>{v.t?.cUnit}</span>
                      <span style={{ textAlign: "center" }}>{v.t?.cQty}</span>
                      <span>{v.t?.cPrice}</span>
                      <span style={{ textAlign: "right" }}>{v.t?.cTotal}</span>
                      <span />
                    </div>
                    {__list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                        <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 132px 108px 104px 92px 32px", gap: "10px", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                              <span style={__sx(`width: 38px; height: 38px; border-radius: 10px; background: ${l?.bg ?? ""}; color: ${l?.fg ?? ""}; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>{l?.ini}</span>
                              <div style={{ minWidth: "0" }}>
                                <div style={{ fontSize: "15px", fontWeight: "600", lineHeight: "20px" }}>{l?.name}</div>
                                <div className="num" style={{ fontSize: "12.5px", color: "#64748b" }}>{l?.conv}</div>
                              </div>
                            </div>
                            <div className="seg" role="group" aria-label={v.t?.cUnit} style={{ padding: "3px" }}>
                              {__list(l?.units).map((u, $index) => (<React.Fragment key={$index}>
                                  <button type="button" className={u?.cls} aria-pressed={u?.on} onClick={u?.pick} style={{ height: "34px", padding: "0 9px", fontSize: "13.5px" }}>{u?.l}</button>
                                </React.Fragment>))}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
                              <button type="button" className="ib" onClick={l?.dec} aria-label={l?.decLbl} style={{ width: "36px", height: "38px", border: "0", fontSize: "20px" }}>−</button>
                              <span className="num" style={{ flexGrow: "1", textAlign: "center", fontWeight: "700" }}>{l?.qty}</span>
                              <button type="button" className="ib" onClick={l?.inc} aria-label={l?.incLbl} style={{ width: "36px", height: "38px", border: "0", fontSize: "20px" }}>+</button>
                            </div>
                            <input className="inp num" value={l?.price} onInput={l?.typeP} onChange={l?.typeP} aria-label={`${v.t?.cPrice ?? ""} ${l?.name ?? ""}`} style={__sx(`height: 40px; font-weight: 700; border-color: ${l?.pBd ?? ""}; background: ${l?.pBg ?? ""};`)} />
                            <span className="num" style={{ textAlign: "right", fontSize: "16px", fontWeight: "700" }}>{l?.total}</span>
                            <button type="button" className="ib" onClick={l?.remove} aria-label={`${v.t?.remove ?? ""} ${l?.name ?? ""}`} style={{ width: "32px", height: "32px", border: "0", color: "#94a3b8" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {l?.changed ? (<>
                            <div className="fade" style={{ display: "flex", gap: "10px", alignItems: "stretch", marginLeft: "48px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "10px", background: "#fff4e0", color: "#a14f06", fontSize: "14px", fontWeight: "600" }}>
                                <span className="num">{l?.changeTxt}</span>
                                <span className="pill num" style={{ background: "#fff", color: "#a14f06", height: "22px" }}>{l?.changePct}</span>
                              </div>
                              <div style={{ flexGrow: "1", display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "10px", border: "1px dashed #cbd5e1", fontSize: "14px" }}>
                                <span style={{ fontWeight: "700" }}>{v.t?.sellOk}</span>
                                <span className="num" style={{ flexGrow: "1", color: "#475569" }}>{l?.sellTxt}</span>
                                {l?.canFix ? (<>
                                  <button type="button" className="btn soft sm" onClick={l?.fix} style={{ height: "32px" }}>{l?.fixLbl}</button>
                                </>) : null}
                                {l?.fixed ? (<>
                                  <span className="pill p-ok">{l?.fixedLbl}</span>
                                </>) : null}
                              </div>
                            </div>
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                    <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#475569" }}>
                      <span style={{ flexGrow: "1" }}>{v.totUnits}</span>
                      <span>{v.t?.subtotal}</span>
                      <span className="num" style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>{v.subTxt}</span>
                    </div>
                  </section>
                </div>
                <aside style={{ width: "330px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                      <h2 className="h2">{v.t?.sum}</h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.subtotal}</span>
                      <span className="num" style={{ fontWeight: "600" }}>{v.subTxt}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.disc}</span>
                      <input className="inp num" value={v.discTxt} onInput={v.typeDisc} onChange={v.typeDisc} aria-label={v.t?.disc} style={{ width: "110px", height: "38px", textAlign: "right" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.carry}</span>
                      <input className="inp num" value={v.carryTxt} onInput={v.typeCarry} onChange={v.typeCarry} aria-label={v.t?.carry} style={{ width: "110px", height: "38px", textAlign: "right" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", paddingTop: "10px", borderTop: "1px dashed #cbd5e1" }}>
                      <span style={{ flexGrow: "1", fontSize: "17px", fontWeight: "700" }}>{v.t?.grand}</span>
                      <span className="num" style={{ fontSize: "30px", lineHeight: "36px", fontWeight: "700", color: "#003087" }}>{v.grandTxt}</span>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                        <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                        <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                        <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                        <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <h2 className="h2">{v.t?.pay}</h2>
                    </div>
                    <label className="fld">
                      <span className="lbl">{v.t?.paidNow}</span>
                      <input className="inp num" value={v.paidTxt} onInput={v.typePaid} onChange={v.typePaid} aria-label={v.t?.paidNow} style={{ height: "52px", fontSize: "20px", fontWeight: "700" }} />
                    </label>
                    <div className="fld">
                      <span className="lbl">{v.t?.method}</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
                        {__list(v.methods).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ justifyContent: "center", height: "44px", padding: "0 8px" }}>{o?.isCash ? (<>
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
                    <div style={__sx(`padding: 12px 14px; border-radius: 12px; background: ${v.oweBg ?? ""}; display: flex; flex-direction: column; gap: 2px;`)}>
                      <span style={__sx(`display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: ${v.oweFg ?? ""};`)}>{v.hasOwe ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
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
</>) : null}{v.noOwe ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{v.oweLbl}</span>
                      <span className="num" style={__sx(`font-size: 26px; line-height: 32px; font-weight: 700; color: ${v.oweFg ?? ""};`)}>{v.oweTxt}</span>
                      {v.hasOwe ? (<>
                        <span className="num" style={{ fontSize: "13px", color: "#7a3b04" }}>{v.newTotalTxt}</span>
                      </>) : null}
                    </div>
                    {v.hasOwe ? (<>
                      <div className="fld fade">
                        <span className="lbl">{v.t?.dueDate}</span>
                        <div className="inp num" style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" }}><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.dueDateTxt}</div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {__list(v.dueOpts).map((o, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ height: "34px", flex: "1", justifyContent: "center", padding: "0 8px" }}>{o?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </>) : null}
                  </section>
                  {v.noPhoto ? (<>
                    <button type="button" onClick={v.togglePhoto} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", border: "2px dashed #94a3b8", background: "#fff", cursor: "pointer", textAlign: "left", color: "#334155" }}>
                      <span style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#eef3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                        </svg>
                      </span>
                      <span>
                        <span style={{ display: "block", fontSize: "15px", fontWeight: "600" }}>{v.t?.photo}</span>
                        <span className="hint" style={{ display: "block" }}>{v.t?.photoHint}</span>
                      </span>
                    </button>
                  </>) : null}
                  {v.hasPhoto ? (<>
                    <div className="fade" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "16px", border: "1px solid #b7e4d0", background: "#e7f8f1" }}>
                      <span style={{ width: "46px", height: "56px", borderRadius: "8px", background: "#fff", border: "1px solid #b7e4d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
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
                      <span style={{ flexGrow: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "15px", fontWeight: "600", color: "#065f46" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.photoDone}</span>
                        <span className="num hint" style={{ display: "block" }}>{v.photoName}</span>
                      </span>
                      <button type="button" className="btn line sm" onClick={v.togglePhoto}>{v.t?.photoRe}</button>
                    </div>
                  </>) : null}
                  <button type="button" className="btn okb big" onClick={v.save} style={{ width: "100%" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.saveBig}</button>
                </aside>
              </div>
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
