'use client';
// Generated from design/templates/sales/ReturnExchange.dc.html by scripts/convert-design.mjs.
// Return & exchange — Sales — Return & exchange. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["ফেরত ও বদল", "Return & exchange"], "hsub": ["মেমো খুঁজুন, কোন মাল ফেরত আসছে টিক দিন — টাকা আর স্টকের হিসাব নিজে থেকে হবে", "Find the memo and tick what is coming back — money and stock are updated for you"], "stepA": ["মেমো খুঁজুন", "Find the memo"], "searchPh": ["মেমো নম্বর বা কাস্টমারের মোবাইল", "Memo number or customer mobile"], "find": ["খুঁজুন", "Find"], "recentM": ["আজকের মেমো:", "Today’s memos:"], "notFound": ["এই নম্বরে কোনো মেমো পাওয়া যায়নি। মেমো নম্বরটা আবার দেখুন, বা কাস্টমারের মোবাইল নম্বর লিখুন।", "No memo found for that number. Check the memo number, or type the customer’s mobile."], "stepB": ["কোন মাল ফেরত আসছে?", "What is coming back?"], "stepBsub": ["টিক দিন, তারপর কয়টা ফেরত আসছে ঠিক করুন", "Tick the items, then set how many"], "notRet": ["ফেরত নয়", "Not returned"], "why": ["কেন ফেরত আসছে?", "Why is it coming back?"], "what": ["কী করবেন?", "What will you do?"], "refundBy": ["টাকা ফেরত:", "Refund by:"], "newItem": ["বদলে কোন মাল দেবেন?", "What will you give instead?"], "newPh": ["নতুন মালের নাম লিখুন", "Type the new item’s name"], "howMany": ["কয়টা", "Qty"], "resellQ": ["ফেরত আসা মাল কি আবার বেচা যাবে?", "Can the returned item be sold again?"], "sum": ["হিসাব", "Summary"], "retItems": ["ফেরত আসা মাল", "Items coming back"], "retVal": ["ফেরত মালের দাম", "Value of returned items"], "newVal": ["নতুন মাল", "New item"], "printSlip": ["ফেরতের রসিদ প্রিন্ট করব", "Print a return slip"], "todayRet": ["আজকের ফেরত", "Today’s returns"], "pageTitle": ["ফেরত ও বদল", "Return & exchange"]};
var AI = [["মেমো ১০৪০ খোঁজো", "Find memo 1040", "মেমো #১০৪০ পেলাম — করিম সাহেব, আজ সকাল ১০:২১, ৫টা আইটেম, পুরোটা বাকিতে।", "Found memo #1040 — Karim Saheb, today 10:21 am, 5 items, all on due."], ["ডিটারজেন্টটা খারাপ, ফেরত নাও", "The detergent is faulty, take it back", "ডিটারজেন্ট ১ কেজি × ১ টিক দিলাম, কারণ \"খারাপ মাল\"। মালটা ড্যামেজে যাবে, কাস্টমারকে ৳১৮০ ফেরত দিন।", "Ticked Shockproof case A15 × 1, reason \"Faulty\". It goes to damaged goods — give back ৳180."], ["২ কেজির ডিটারজেন্ট দিয়ে বদলে দাও", "Swap it for the A15 case in black", "বদল করলাম: ডিটারজেন্ট ২ কেজি (৳৩৪০)। কাস্টমার আরও ৳১৬০ দেবে।", "Exchange set: Detergent 2 kg (৳340). The customer pays ৳160 more."]];
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
  lentil: ['মসুর ডাল ১ কেজি', 'Micro-USB cable 1 m', 145], lux: ['লাক্স সাবান ১০০ গ্রাম', 'Screen cleaning wipes', 65], det: ['ডিটারজেন্ট ১ কেজি', 'Shockproof case A15', 180],
  det2: ['ডিটারজেন্ট ২ কেজি', 'Detergent 2 kg', 340], sham: ['শ্যাম্পু ১৮০ মি.লি.', 'Cleaning spray 100 ml', 240], bisc: ['বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 60],
  water: ['পানি ২ লি.', 'Cable protector pack', 35], chana: ['চানাচুর ৩০০ গ্রাম', 'USB-C OTG adapter', 85], lux3: ['লাক্স সাবান (৩টার প্যাক)', 'Lux soap (pack of 3)', 185],
  oil2: ['সয়াবিন তেল ২ লি.', 'Soybean oil 2 L', 370], salt: ['লবণ ১ কেজি', 'SIM ejector pin pack', 42]
};
var PAY = { cash: ['ক্যাশ', 'Cash', '#e7f8f1', '#047857'], due: ['বাকি', 'Due', '#ffece6', '#b83210'] };
var MEMOS = {
  '1038': { cust: null, when: ['আজ, ২৯ সেপ্টেম্বর · সকাল ৯:৫৫', 'Today, 29 Sep · 9:55 am'], pay: 'cash', staff: ['বাবু', 'Babu'], lines: [['det', 1], ['lux', 1], ['bisc', 1], ['chana', 1]], def: { det: 1 }, newDef: 'det2' },
  '1040': { cust: ['করিম সাহেব', 'Karim Saheb', '01711-234567'], when: ['আজ, ২৯ সেপ্টেম্বর · সকাল ১০:২১', 'Today, 29 Sep · 10:21 am'], pay: 'due', staff: ['সুমন', 'Sumon'], lines: [['rice', 1], ['oil', 2], ['sugar', 5], ['lentil', 5], ['water', 2]], def: { oil: 1 }, newDef: 'oil2' }
};
var REASONS = [['bad', 'খারাপ মাল', 'Faulty item'], ['size', 'সাইজ মেলেনি', 'Wrong size'], ['wrong', 'ভুল মাল দেওয়া হয়েছে', 'Wrong item given'], ['mind', 'কাস্টমার মত বদলেছে', 'Customer changed mind'], ['exp', 'মেয়াদ শেষ', 'Expired']];
var CANDS = ['det2', 'oil2', 'lux3', 'sham', 'sugar', 'lentil', 'chana', 'bisc', 'water', 'salt', 'rice'];
var TODAY = [
  [1031, 'সালমা বেগম', 'Salma Begum', 'শ্যাম্পু ১৮০ মি.লি. × ১ · খারাপ মাল', 'Cleaning spray 100 ml × 1 · Faulty', 'ret', 240, 'ক্যাশ', 'Cash'],
  [1024, 'নাসরিন আক্তার', 'Nasrin Akter', 'পোলো টি-শার্ট M → L · সাইজ মেলেনি', 'Polo T-shirt M → L · Wrong size', 'exch', 0, '', ''],
  [1016, 'রফিক মিয়া', 'Rafiq Mia', 'সয়াবিন তেল ৫ লি. × ১ · ভুল মাল', '20W USB-C fast charger × 1 · Wrong item', 'ret', 890, 'বিকাশ', 'bKash']
];
var q = s.q == null ? dg('#1038', bn) : s.q;
var qd = unbn(q).replace(/\D/g, '');
var key = /1040|1711/.test(qd) ? '1040' : /1038/.test(qd) ? '1038' : null;
var M = MEMOS[key || '1038'];
var allPicks = s.picks || {};
var picks = allPicks[key || '1038'] || M.def;
var setPicks = function (np) { var o = assign({}, allPicks); o[key || '1038'] = np; self.setState({ picks: o }); };
var reason = s.reason || 'bad';
var resell = s.resell == null ? !(reason === 'bad' || reason === 'exp') : s.resell;
var mode = s.mode || 'ret';
var refund = s.refund || (M.pay === 'due' ? 'due' : 'cash');
if (refund === 'due' && !M.cust) refund = 'cash';
var retVal = 0, pcsN = 0, retNames = [];
M.lines.forEach(function (x) { var n = picks[x[0]] || 0; if (n) { retVal += PR[x[0]][2] * n; pcsN += n; retNames.push(PR[x[0]][i] + ' × ' + dg(n, bn)); } });
var newId = (s.newIds || {})[key || '1038'] || M.newDef;
var newQty = s.newQty || 1;
var newVal = PR[newId][2] * newQty;
var diff = newVal - retVal;
var nq = s.nq || '';
var cands = CANDS.filter(function (c2) { return !nq || (PR[c2][0] + ' ' + PR[c2][1]).toLowerCase().indexOf(nq.toLowerCase()) >= 0; }).slice(0, 4);
var custName = M.cust ? M.cust[i] : L('হেঁটে আসা কাস্টমার', 'Walk-in customer');
var big;
if (mode === 'ret') {
  big = refund === 'due'
    ? [L(custName + 'ের বাকি থেকে কমবে', 'Taken off ' + custName + '’s due'), retVal, '#eef3fb', '#003087', L('কাস্টমারকে নগদ টাকা দিতে হবে না', 'No cash goes out')]
    : [L('কাস্টমারকে ফেরত দিন', 'Give back to customer') + ' (' + (refund === 'cash' ? L('ক্যাশ', 'Cash') : L('বিকাশ', 'bKash')) + ')', retVal, '#fff4e0', '#a14f06', L('হাতের টাকা থেকে কমবে', 'Comes out of cash in hand')];
} else {
  big = diff > 0 ? [L('কাস্টমার আরও দেবে', 'Customer pays extra'), diff, '#e7f8f1', '#047857', L('নতুন মালের দাম বেশি', 'The new item costs more')]
    : diff < 0 ? [L('আপনি কাস্টমারকে দেবেন', 'You give back'), -diff, '#fff4e0', '#a14f06', L('নতুন মালের দাম কম', 'The new item costs less')]
    : [L('সমান সমান', 'Even swap'), 0, '#eef2f6', '#334155', L('কেউ কাউকে কিছু দেবে না', 'Nobody pays anything')];
}
var done = s.done || [];
var todays = done.concat(TODAY.map(function (x) { return { no: x[0], cust: [x[1], x[2]], item: [x[3], x[4]], mode: x[5], amt: x[6], by: [x[7], x[8]] }; }));
var todaySum = todays.reduce(function (n, x) { return n + (x.mode === 'ret' ? x.amt : 0); }, 0);
var modeSeg = seg(self, [['ret', 'ফেরত (টাকা ফেরত)', 'Return (refund)'], ['exch', 'বদল (অন্য মাল)', 'Exchange (other item)']], mode, 'mode', i);
var refundOpts = [['cash', 'ক্যাশ', 'Cash'], ['bkash', 'বিকাশ', 'bKash'], ['due', 'বাকি থেকে কাটা', 'Cut from due']];
var refundSeg = seg(self, refundOpts, refund, 'refund', i, 'chip');
var reasonList = REASONS.map(function (r2) { var on = r2[0] === reason; return { k: r2[0], l: r2[1 + i], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ reason: r2[0], resell: null }); } }; });
return {
  waitTxt: L('আগে উপরে মেমোটা খুঁজে বের করুন।', 'Find the memo above first.'),
  n1: dg(1, bn), n2: dg(2, bn), n2bg: key ? '#003087' : '#94a3b8',
  q: q, typeQ: function (e) { self.setState({ q: e.target.value }); },
  find: function () { toast(self, key ? L('মেমো পাওয়া গেছে: ', 'Memo found: ') + dg('#' + key, bn) : t.notFound); },
  quick: [['1038', dg('#1038', bn) + L(' · হেঁটে আসা', ' · Walk-in')], ['1040', dg('#1040', bn) + L(' · করিম সাহেব', ' · Karim Saheb')], ['1711', L('০১৭১১-২৩৪৫৬৭', '01711-234567')]].map(function (x) { var on = x[0] === '1711' ? /1711/.test(qd) : qd === x[0]; return { l: x[1], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ q: x[0] === '1711' ? dg('01711-234567', bn) : dg('#' + x[0], bn) }); } }; }),
  found: !!key, notFound: !key,
  m: {
    title: L('মেমো ', 'Memo ') + dg('#' + (key || '1038'), bn), cust: custName, when: M.when[i],
    meta: dg(M.lines.length, bn) + L('টা আইটেম · বেচেছেন ', ' items · sold by ') + M.staff[i] + (M.cust ? ' · ' + dg(M.cust[2], bn) : ''),
    total: money(M.lines.reduce(function (n, x) { return n + PR[x[0]][2] * x[1]; }, 0), bn), pay: PAY[M.pay][i], pbg: PAY[M.pay][2], pfg: PAY[M.pay][3], isCash: M.pay === 'cash', isDuePay: M.pay === 'due'
  },
  items: M.lines.map(function (x, j) {
    var n = picks[x[0]] || 0, p = PR[x[0]];
    var set = function (v) { var o = assign({}, picks); if (v) o[x[0]] = v; else delete o[x[0]]; setPicks(o); };
    return { name: p[i], sold: L('কিনেছিল ' + dg(x[1], true) + 'টা · ' + money(p[2], true) + ' করে', 'Bought ' + x[1] + ' · ' + money(p[2]) + ' each'),
      on: n > 0, off: n === 0, qty: dg(n, bn), val: n ? money(p[2] * n, bn) : '—', vfg: n ? '#0f172a' : '#94a3b8',
      bt: j ? '1px solid #eef2f6' : '0', bg: n ? '#f5f8ff' : '#fff', cbd: n ? '#003087' : '#94a3b8', cbg: n ? '#003087' : '#fff',
      decLbl: L('একটা কমান', 'One less'), incLbl: L('একটা বাড়ান', 'One more'),
      toggle: function () { set(n ? 0 : 1); }, dec: function () { set(Math.max(1, n - 1)); }, inc: function () { set(Math.min(x[1], n + 1)); } };
  }),
  rsn: (function () { var o = {}; reasonList.forEach(function (x) { o[x.k] = x; }); return o; })(),
  reasons: reasonList,
  modes: modeSeg, mo: { ret: modeSeg[0], exch: modeSeg[1] }, resellOn: !!resell, resellOff: !resell, isRet: mode === 'ret', isExch: mode === 'exch',
  refunds: refundSeg, rfd: (function () { var o = {}; refundSeg.forEach(function (x) { o[x.k] = x; }); return o; })(), hasDueRefund: !!M.cust,
  nq: nq, typeNq: function (e) { self.setState({ nq: e.target.value }); },
  cands: cands.map(function (c2) { var on = c2 === newId; return { l: PR[c2][i], p: money(PR[c2][2], bn), on: on, bd: on ? '#003087' : '#e6eaf0', bg: on ? '#eef3fb' : '#fff', pick: function () { var o = assign({}, s.newIds || {}); o[key || '1038'] = c2; self.setState({ newIds: o }); } }; }),
  newQtyTxt: dg(newQty, bn), newDec: function () { self.setState({ newQty: Math.max(1, newQty - 1) }); }, newInc: function () { self.setState({ newQty: newQty + 1 }); },
  newName: PR[newId][i] + ' × ' + dg(newQty, bn), newValTxt: money(newVal, bn),
  resellOpts: seg(self, [[true, 'হ্যাঁ', 'Yes'], [false, 'না', 'No']], resell, 'resell', i),
  rsHint: resell ? L('মাল আবার স্টকে যোগ হবে', 'It goes back into stock') : L('মাল "ড্যামেজ পণ্য"-তে যাবে, স্টকে যোগ হবে না', 'It goes to "Damaged goods", not back into stock'),
  rsBg: resell ? '#f3fbf7' : '#fff8f5', rsBd: resell ? '#bfe8d5' : '#f7c9bb', rsFg: resell ? '#047857' : '#b83210',
  pcs: dg(pcsN, bn) + L(' পিস', pcsN === 1 ? ' piece' : ' pieces'), retValTxt: money(retVal, bn),
  bi: { out: (mode === 'ret' && refund !== 'due') || (mode === 'exch' && diff < 0), due: mode === 'ret' && refund === 'due', inn: mode === 'exch' && diff > 0, even: mode === 'exch' && diff === 0 },
  bigLbl: big[0], bigVal: money(big[1], bn), bigBg: big[2], bigFg: big[3], bigNote: big[4],
  stockCls: resell ? 'n-ok' : 'n-due',
  stockNote: pcsN ? (retNames.join(', ') + (resell ? L(' — আবার স্টকে যোগ হবে', ' — back into stock') : L(' — ড্যামেজ পণ্যে যাবে', ' — goes to damaged goods'))) : L('এখনো কোনো মাল টিক দেননি', 'No item ticked yet'),
  newStockNote: PR[newId][i] + ' × ' + dg(newQty, bn) + L(' স্টক থেকে কমবে', ' will leave stock'),
  slip: sw(self, 'slip', true),
  confirmLbl: mode === 'ret' ? L('ফেরত নিশ্চিত করুন', 'Confirm return') : L('বদল নিশ্চিত করুন', 'Confirm exchange'),
  confirm: function () {
    if (!key) { toast(self, t.notFound); return; }
    if (!pcsN) { toast(self, L('আগে কোন মাল ফেরত আসছে টিক দিন।', 'Tick the items coming back first.')); return; }
    var rn = REASONS.filter(function (r2) { return r2[0] === reason; })[0];
    var row = { no: +key, cust: [M.cust ? M.cust[0] : 'হেঁটে আসা কাস্টমার', M.cust ? M.cust[1] : 'Walk-in customer'], mode: mode,
      item: [M.lines.filter(function (x) { return picks[x[0]]; }).map(function (x) { return PR[x[0]][0] + ' × ' + dg(picks[x[0]], true); }).join(', ') + ' · ' + rn[1], M.lines.filter(function (x) { return picks[x[0]]; }).map(function (x) { return PR[x[0]][1] + ' × ' + picks[x[0]]; }).join(', ') + ' · ' + rn[2]],
      amt: mode === 'ret' ? retVal : Math.abs(diff), by: mode === 'ret' ? { cash: ['ক্যাশ', 'Cash'], bkash: ['বিকাশ', 'bKash'], due: ['বাকি থেকে', 'From due'] }[refund] : ['', ''] };
    self.setState({ done: [row].concat(done) });
    toast(self, mode === 'ret' ? L('ফেরত নেওয়া হলো। ' + money(retVal, true) + (refund === 'due' ? ' বাকি থেকে কাটা হলো।' : ' কাস্টমারকে দিন।'), 'Return saved. ' + money(retVal) + (refund === 'due' ? ' taken off the due.' : ' — give it to the customer.')) : L('বদল হলো। ' + big[0] + ' ' + money(big[1], true) + '।', 'Exchange saved. ' + big[0] + ' ' + money(big[1]) + '.'));
  },
  todayTotal: L('মোট ফেরত ', 'Refunded ') + money(todaySum, bn),
  todays: todays.slice(0, 4).map(function (x) { return { head: dg('#' + x.no, bn) + ' · ' + x.cust[i], item: x.item[i], amt: x.mode === 'ret' ? money(x.amt, bn) : (x.amt ? money(x.amt, bn) : '—'), kind: x.mode === 'ret' ? L('ফেরত', 'Return') + (x.by[i] ? ' · ' + x.by[i] : '') : L('বদল', 'Exchange'), pcls: x.mode === 'ret' ? 'p-warn' : 'p-info', isRet: x.mode === 'ret', isExch: x.mode !== 'ret', tint: x.mode === 'ret' ? '#fff4e0' : '#eef3fb' }; })
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

export default class ReturnExchangeScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ReturnExchange">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={v.rootCls} style={{ width: "1440px", height: "1270px", position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="sales-return" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "18px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <__Topbar crumb="Sales" page={"Return & exchange"} placeholder="Search products, customers or memo no." />
            <div style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", borderRadius: "15px", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
                    <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
                    <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <__Link href="/sales-book" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2zM8 9h8M8 13h5" />
</svg>{v.t?.nSalesBook}</__Link>
              </div>
              <section className="card" style={{ padding: "16px 20px", display: "flex", gap: "18px", alignItems: "stretch" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="num" style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#003087", color: "#fff", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>{v.n1}</span>
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
                    <h2 className="h2">{v.t?.stepA}</h2>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ flexGrow: "1", height: "52px", display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", border: "2px solid #003087", borderRadius: "14px", background: "#fff", color: "#003087" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
                      </svg>
                      <input className="num" value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder={v.t?.searchPh} aria-label={v.t?.searchPh} style={{ flexGrow: "1", minWidth: "0", border: "0", outline: "none", font: "inherit", fontSize: "17px", fontWeight: "600", background: "transparent", color: "#0f172a" }} />
                    </label>
                    <button type="button" className="btn solid" onClick={v.find} style={{ height: "52px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
</svg>{v.t?.find}</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="hint" style={{ fontSize: "14px" }}>{v.t?.recentM}</span>
                    {__list(v.quick).map((qm, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={qm?.cls} aria-pressed={qm?.on} onClick={qm?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2zM8 9h8M8 13h5" />
</svg>{qm?.l}</button>
                      </React.Fragment>))}
                  </div>
                </div>
                <div style={{ width: "440px", flexShrink: "0", display: "flex" }}>
                  {v.found ? (<>
                    <div className="fade" style={{ flexGrow: "1", display: "flex", gap: "14px", alignItems: "center", padding: "14px 16px", borderRadius: "14px", background: "#f5f8ff", border: "1px solid #d6e0ef" }}>
                      <span style={{ width: "50px", height: "50px", flexShrink: "0", borderRadius: "13px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #d6e0ef" }}>
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
                        <div className="num" style={{ fontSize: "16px", fontWeight: "700" }}>{v.m?.title} · {v.m?.cust}</div>
                        <div className="num" style={{ fontSize: "14px", color: "#475569" }}>{v.m?.when}</div>
                        <div className="num" style={{ fontSize: "13.5px", color: "#64748b" }}>{v.m?.meta}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span className="num" style={{ fontSize: "20px", fontWeight: "700" }}>{v.m?.total}</span>
                        <span className="pill" style={__sx(`background: ${v.m?.pbg ?? ""}; color: ${v.m?.pfg ?? ""}; gap: 5px; padding-left: 6px;`)}>{v.m?.isCash ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{v.m?.isDuePay ? (<>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
    <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
    <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
    <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
    <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</>) : null}{v.m?.pay}</span>
                      </div>
                    </div>
                  </>) : null}
                  {v.notFound ? (<>
                    <div className="note n-warn fade" style={{ flexGrow: "1", alignItems: "center" }}>
                      <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M12 7H27A8 8 0 0 1 35 15V22A8 8 0 0 1 27 30H12A8 8 0 0 1 4 22V15A8 8 0 0 1 12 7Z" fill="#0ea5e9" />
                        <path d="M11 28L9 37L19 29.5Z" fill="#0ea5e9" />
                        <path d="M10.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
                        <path d="M17.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
                        <path d="M24.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
                        <path d="M29 22H37A7 7 0 0 1 44 29V32A7 7 0 0 1 37 39H29A7 7 0 0 1 22 32V29A7 7 0 0 1 29 22Z" fill="#0ea5e9" />
                        <path d="M37.5 37L41 43L32.5 38Z" fill="#0ea5e9" />
                        <path d="M28.3 29H37.7A1.3 1.3 0 0 1 39 30.3V30.3A1.3 1.3 0 0 1 37.7 31.6H28.3A1.3 1.3 0 0 1 27 30.3V30.3A1.3 1.3 0 0 1 28.3 29Z" fill="#ffffff" />
                      </svg>
                      <span>{v.t?.notFound}</span>
                    </div>
                  </>) : null}
                </div>
              </section>
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <section className="card" style={{ flexGrow: "1", minWidth: "0", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="num" style={__sx(`width: 28px; height: 28px; border-radius: 999px; background: ${v.n2bg ?? ""}; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center;`)}>{v.n2}</span>
                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                      <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                      <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                      <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                      <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                    </svg>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.t?.stepB}</h2>
                      <div className="hint" style={{ fontSize: "14px" }}>{v.t?.stepBsub}</div>
                    </div>
                  </div>
                  {v.notFound ? (<>
                    <div className="hint" style={{ fontSize: "15px", padding: "8px 0 4px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M5 14V9a3 3 0 0 1 3 -3H14M34 6H40a3 3 0 0 1 3 3V14M43 34V39a3 3 0 0 1 -3 3H34M14 42H8a3 3 0 0 1 -3 -3V34" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 13h2.5v22h-2.5Z" fill="#003087" />
                        <path d="M16 13h1.3v22h-1.3Z" fill="#003087" />
                        <path d="M19 13h3v22h-3Z" fill="#003087" />
                        <path d="M24 13h1.3v22h-1.3Z" fill="#003087" />
                        <path d="M27 13h2.5v22h-2.5Z" fill="#003087" />
                        <path d="M31 13h1.3v22h-1.3Z" fill="#003087" />
                        <path d="M34 13h2.5v22h-2.5Z" fill="#003087" />
                        <path d="M9.3 23H38.7A1.3 1.3 0 0 1 40 24.3V24.3A1.3 1.3 0 0 1 38.7 25.6H9.3A1.3 1.3 0 0 1 8 24.3V24.3A1.3 1.3 0 0 1 9.3 23Z" fill="#0ea5e9" />
                      </svg>
                      <span>{v.waitTxt}</span>
                    </div>
                  </>) : null}
                  {v.found ? (<>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ border: "1px solid #e6eaf0", borderRadius: "14px", overflow: "hidden" }}>
                        {__list(v.items).map((it, $index) => (<React.Fragment key={$index}>
                            <div style={__sx(`display: flex; align-items: center; gap: 10px; padding: 2px 14px 2px 4px; border-top: ${it?.bt ?? ""}; background: ${it?.bg ?? ""};`)}>
                              <button type="button" role="checkbox" aria-checked={it?.on} aria-label={it?.name} onClick={it?.toggle} style={{ width: "44px", height: "44px", flexShrink: "0", border: "0", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <span style={__sx(`width: 26px; height: 26px; border-radius: 8px; border: 2px solid ${it?.cbd ?? ""}; background: ${it?.cbg ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center;`)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                </span>
                              </button>
                              <div style={{ flexGrow: "1", minWidth: "0" }}>
                                <div style={{ fontSize: "15px", fontWeight: "600" }}>{it?.name}</div>
                                <div className="num hint">{it?.sold}</div>
                              </div>
                              {it?.on ? (<>
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
                                  <button type="button" className="ib" onClick={it?.dec} aria-label={it?.decLbl} style={{ width: "38px", height: "38px", border: "0", fontSize: "20px" }}>−</button>
                                  <span className="num" style={{ minWidth: "28px", textAlign: "center", fontWeight: "700" }}>{it?.qty}</span>
                                  <button type="button" className="ib" onClick={it?.inc} aria-label={it?.incLbl} style={{ width: "38px", height: "38px", border: "0", fontSize: "20px" }}>+</button>
                                </div>
                              </>) : null}
                              {it?.off ? (<>
                                <span className="hint" style={{ width: "116px", textAlign: "center" }}>{v.t?.notRet}</span>
                              </>) : null}
                              <span className="num" style={__sx(`width: 84px; text-align: right; font-weight: 700; color: ${it?.vfg ?? ""};`)}>{it?.val}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M12 7H27A8 8 0 0 1 35 15V22A8 8 0 0 1 27 30H12A8 8 0 0 1 4 22V15A8 8 0 0 1 12 7Z" fill="#0ea5e9" />
  <path d="M11 28L9 37L19 29.5Z" fill="#0ea5e9" />
  <path d="M10.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
  <path d="M17.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
  <path d="M24.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
  <path d="M29 22H37A7 7 0 0 1 44 29V32A7 7 0 0 1 37 39H29A7 7 0 0 1 22 32V29A7 7 0 0 1 29 22Z" fill="#0ea5e9" />
  <path d="M37.5 37L41 43L32.5 38Z" fill="#0ea5e9" />
  <path d="M28.3 29H37.7A1.3 1.3 0 0 1 39 30.3V30.3A1.3 1.3 0 0 1 37.7 31.6H28.3A1.3 1.3 0 0 1 27 30.3V30.3A1.3 1.3 0 0 1 28.3 29Z" fill="#ffffff" />
</svg>{v.t?.why}</span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button type="button" className={v.rsn?.bad?.cls} aria-pressed={v.rsn?.bad?.on} onClick={v.rsn?.bad?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
</svg>{v.rsn?.bad?.l}</button>
                          <button type="button" className={v.rsn?.size?.cls} aria-pressed={v.rsn?.size?.on} onClick={v.rsn?.size?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />
</svg>{v.rsn?.size?.l}</button>
                          <button type="button" className={v.rsn?.wrong?.cls} aria-pressed={v.rsn?.wrong?.on} onClick={v.rsn?.wrong?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" />
</svg>{v.rsn?.wrong?.l}</button>
                          <button type="button" className={v.rsn?.mind?.cls} aria-pressed={v.rsn?.mind?.on} onClick={v.rsn?.mind?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a5 5 0 0 0-4-5" />
</svg>{v.rsn?.mind?.l}</button>
                          <button type="button" className={v.rsn?.exp?.cls} aria-pressed={v.rsn?.exp?.on} onClick={v.rsn?.exp?.pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
</svg>{v.rsn?.exp?.l}</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
  <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
  <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
</svg>{v.t?.what}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                          <div className="seg" role="group" aria-label={v.t?.what}>
                            <button type="button" className={v.mo?.ret?.cls} aria-pressed={v.mo?.ret?.on} onClick={v.mo?.ret?.pick} style={{ height: "40px", padding: "0 18px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
</svg>{v.mo?.ret?.l}</button>
                            <button type="button" className={v.mo?.exch?.cls} aria-pressed={v.mo?.exch?.on} onClick={v.mo?.exch?.pick} style={{ height: "40px", padding: "0 18px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" />
</svg>{v.mo?.exch?.l}</button>
                          </div>
                          {v.isRet ? (<>
                            <div className="fade" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className="lbl">{v.t?.refundBy}</span>
                              <button type="button" className={v.rfd?.cash?.cls} aria-pressed={v.rfd?.cash?.on} onClick={v.rfd?.cash?.pick} style={{ padding: "0 14px 0 8px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
</svg>{v.rfd?.cash?.l}</button>
                              <button type="button" className={v.rfd?.bkash?.cls} aria-pressed={v.rfd?.bkash?.on} onClick={v.rfd?.bkash?.pick} style={{ padding: "0 14px 0 8px" }}><span style={{ width: "24px", height: "24px", borderRadius: "7px", background: "#e2136e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</span>{v.rfd?.bkash?.l}</button>
                              {v.hasDueRefund ? (<>
                                <button type="button" className={v.rfd?.due?.cls} aria-pressed={v.rfd?.due?.on} onClick={v.rfd?.due?.pick} style={{ padding: "0 14px 0 8px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
  <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
  <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
  <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
  <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.rfd?.due?.l}</button>
                              </>) : null}
                            </div>
                          </>) : null}
                        </div>
                      </div>
                      {v.isExch ? (<>
                        <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 14px", borderRadius: "14px", background: "#fbfcfe", border: "1px solid #e6eaf0" }}>
                          <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
  <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
  <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
  <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
  <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
</svg>{v.t?.newItem}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <label style={{ flexGrow: "1", height: "44px", display: "flex", alignItems: "center", gap: "10px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "12px", background: "#fff", color: "#64748b" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" />
                              </svg>
                              <input value={v.nq} onInput={v.typeNq} onChange={v.typeNq} placeholder={v.t?.newPh} aria-label={v.t?.newPh} style={{ flexGrow: "1", minWidth: "0", border: "0", outline: "none", font: "inherit", fontSize: "15px", background: "transparent", color: "#0f172a" }} />
                            </label>
                            <span className="lbl">{v.t?.howMany}</span>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
                              <button type="button" className="ib" onClick={v.newDec} aria-label={`${v.t?.howMany ?? ""} −`} style={{ width: "40px", height: "40px", border: "0", fontSize: "20px" }}>−</button>
                              <span className="num" style={{ minWidth: "28px", textAlign: "center", fontWeight: "700" }}>{v.newQtyTxt}</span>
                              <button type="button" className="ib" onClick={v.newInc} aria-label={`${v.t?.howMany ?? ""} +`} style={{ width: "40px", height: "40px", border: "0", fontSize: "20px" }}>+</button>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
                            {__list(v.cands).map((cd, $index) => (<React.Fragment key={$index}>
                                <button type="button" onClick={cd?.pick} aria-pressed={cd?.on} style={__sx(`display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 10px 12px; border-radius: 12px; border: 2px solid ${cd?.bd ?? ""}; background: ${cd?.bg ?? ""}; cursor: pointer; text-align: left; font: inherit;`)}>
                                  <span style={{ fontSize: "14px", fontWeight: "600", lineHeight: "18px" }}>{cd?.l}</span>
                                  <span className="num" style={{ fontSize: "14px", fontWeight: "700", color: "#003087" }}>{cd?.p}</span>
                                </button>
                              </React.Fragment>))}
                          </div>
                        </div>
                      </>) : null}
                      <div style={__sx(`display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 14px; background: ${v.rsBg ?? ""}; border: 1px solid ${v.rsBd ?? ""};`)}>
                        {v.resellOn ? (<>
                          <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M8 24H21A2 2 0 0 1 23 26V39A2 2 0 0 1 21 41H8A2 2 0 0 1 6 39V26A2 2 0 0 1 8 24Z" fill="#7dd3fc" />
                            <path d="M13 24h3v7h-3Z" fill="#e0f2fe" />
                            <path d="M27 24H40A2 2 0 0 1 42 26V39A2 2 0 0 1 40 41H27A2 2 0 0 1 25 39V26A2 2 0 0 1 27 24Z" fill="#0ea5e9" />
                            <path d="M32 24h3v7h-3Z" fill="#e0f2fe" />
                            <path d="M17 8H30A2 2 0 0 1 32 10V22A2 2 0 0 1 30 24H17A2 2 0 0 1 15 22V10A2 2 0 0 1 17 8Z" fill="#7dd3fc" />
                            <path d="M22 8h3v7h-3Z" fill="#e0f2fe" />
                            <path d="M30.5 11a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                            <path d="M34 11l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        {v.resellOff ? (<>
                          <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                            <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                            <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                            <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                            <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                          </svg>
                        </>) : null}
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "15px", fontWeight: "700" }}>{v.t?.resellQ}</div>
                          <div style={__sx(`font-size: 14px; color: ${v.rsFg ?? ""}; font-weight: 600;`)}>{v.rsHint}</div>
                        </div>
                        <div className="seg" role="group" aria-label={v.t?.resellQ}>
                          {__list(v.resellOpts).map((ro, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={ro?.cls} aria-pressed={ro?.on} onClick={ro?.pick} style={{ height: "40px", padding: "0 18px", fontSize: "15px" }}>{ro?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </div>
                  </>) : null}
                </section>
                <aside style={{ width: "370px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {v.found ? (<>
                    <section className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                          <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                          <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.sum}</h2>
                        <span className="num hint" style={{ fontSize: "14px" }}>{v.m?.title}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "15px" }}>
                        <div style={{ display: "flex" }}>
                          <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.retItems}</span>
                          <span className="num" style={{ fontWeight: "600" }}>{v.pcs}</span>
                        </div>
                        <div style={{ display: "flex" }}>
                          <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.retVal}</span>
                          <span className="num" style={{ fontWeight: "600" }}>{v.retValTxt}</span>
                        </div>
                        {v.isExch ? (<>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.newVal} · {v.newName}</span>
                            <span className="num" style={{ fontWeight: "600" }}>{v.newValTxt}</span>
                          </div>
                        </>) : null}
                      </div>
                      <div style={__sx(`padding: 16px; border-radius: 16px; background: ${v.bigBg ?? ""}; color: ${v.bigFg ?? ""}; display: flex; flex-direction: column; gap: 2px;`)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "600" }}><span style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
  {v.bi?.out ? (<>
    <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
      <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
      <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
      <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
      <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </>) : null}
  {v.bi?.due ? (<>
    <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
      <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
      <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
      <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
      <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </>) : null}
  {v.bi?.inn ? (<>
    <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
      <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
      <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
      <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
      <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </>) : null}
  {v.bi?.even ? (<>
    <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M7 18H13A3 3 0 0 1 16 21V31A3 3 0 0 1 13 34H7A3 3 0 0 1 4 31V21A3 3 0 0 1 7 18Z" fill="#0ea5e9" />
      <path d="M35 18H41A3 3 0 0 1 44 21V31A3 3 0 0 1 41 34H35A3 3 0 0 1 32 31V21A3 3 0 0 1 35 18Z" fill="#0ea5e9" />
      <path d="M14 22L23 16L34 22L30 30L24 33L17 30Z" fill="#7dd3fc" />
      <path d="M20 24L25 28M23 22L28 26" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </>) : null}
</span>{v.bigLbl}</span>
                        <span className="num" style={{ fontSize: "40px", lineHeight: "48px", fontWeight: "700" }}>{v.bigVal}</span>
                        <span style={{ fontSize: "13.5px", fontWeight: "500", opacity: ".9" }}>{v.bigNote}</span>
                      </div>
                      <div className={`note ${v.stockCls ?? ""}`} style={{ alignItems: "center" }}>
                        {v.resellOn ? (<>
                          <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M8 24H21A2 2 0 0 1 23 26V39A2 2 0 0 1 21 41H8A2 2 0 0 1 6 39V26A2 2 0 0 1 8 24Z" fill="#7dd3fc" />
                            <path d="M13 24h3v7h-3Z" fill="#e0f2fe" />
                            <path d="M27 24H40A2 2 0 0 1 42 26V39A2 2 0 0 1 40 41H27A2 2 0 0 1 25 39V26A2 2 0 0 1 27 24Z" fill="#0ea5e9" />
                            <path d="M32 24h3v7h-3Z" fill="#e0f2fe" />
                            <path d="M17 8H30A2 2 0 0 1 32 10V22A2 2 0 0 1 30 24H17A2 2 0 0 1 15 22V10A2 2 0 0 1 17 8Z" fill="#7dd3fc" />
                            <path d="M22 8h3v7h-3Z" fill="#e0f2fe" />
                            <path d="M30.5 11a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                            <path d="M34 11l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        {v.resellOff ? (<>
                          <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                            <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                            <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                            <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                            <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                          </svg>
                        </>) : null}
                        <span>{v.stockNote}</span>
                      </div>
                      {v.isExch ? (<>
                        <div className="note n-info" style={{ alignItems: "center" }}>
                          <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                            <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                            <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                            <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                            <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                          </svg>
                          <span>{v.newStockNote}</span>
                        </div>
                      </>) : null}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}><button type="button" className={v.slip?.cls} aria-pressed={v.slip?.on} aria-label={v.t?.printSlip} onClick={v.slip?.toggle} /><svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M15 4H33A2 2 0 0 1 35 6V16A2 2 0 0 1 33 18H15A2 2 0 0 1 13 16V6A2 2 0 0 1 15 4Z" fill="#e0f2fe" />
  <path d="M16.0 5.5H32.0A1.5 1.5 0 0 1 33.5 7.0V16.0A1.5 1.5 0 0 1 32.0 17.5H16.0A1.5 1.5 0 0 1 14.5 16.0V7.0A1.5 1.5 0 0 1 16.0 5.5Z" fill="#ffffff" />
  <path d="M9 16H39A4 4 0 0 1 43 20V30A4 4 0 0 1 39 34H9A4 4 0 0 1 5 30V20A4 4 0 0 1 9 16Z" fill="#003087" />
  <path d="M10.5 25H37.5A1.5 1.5 0 0 1 39 26.5V27.5A1.5 1.5 0 0 1 37.5 29H10.5A1.5 1.5 0 0 1 9 27.5V26.5A1.5 1.5 0 0 1 10.5 25Z" fill="#003087" />
  <path d="M15 27H33A2 2 0 0 1 35 29V42A2 2 0 0 1 33 44H15A2 2 0 0 1 13 42V29A2 2 0 0 1 15 27Z" fill="#e0f2fe" />
  <path d="M16.0 28H32.0A1.5 1.5 0 0 1 33.5 29.5V41.0A1.5 1.5 0 0 1 32.0 42.5H16.0A1.5 1.5 0 0 1 14.5 41.0V29.5A1.5 1.5 0 0 1 16.0 28Z" fill="#ffffff" />
  <path d="M18.5 32H29.5A1 1 0 0 1 30.5 33V33A1 1 0 0 1 29.5 34H18.5A1 1 0 0 1 17.5 33V33A1 1 0 0 1 18.5 32Z" fill="#7dd3fc" />
  <path d="M18.5 36H25.5A1 1 0 0 1 26.5 37V37A1 1 0 0 1 25.5 38H18.5A1 1 0 0 1 17.5 37V37A1 1 0 0 1 18.5 36Z" fill="#7dd3fc" />
  <path d="M35 21a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
</svg>{v.t?.printSlip}</div>
                      <button type="button" className="btn okb big" onClick={v.confirm} style={{ width: "100%" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.confirmLbl}</button>
                    </section>
                  </>) : null}
                  <section className="card" style={{ padding: "16px 18px 8px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
                        <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
                        <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
                      </svg>
                      <h2 className="h2" style={{ flexGrow: "1", fontSize: "17px" }}>{v.t?.todayRet}</h2>
                      <span className="num" style={{ fontSize: "14px", fontWeight: "700", color: "#a14f06" }}>{v.todayTotal}</span>
                    </div>
                    {__list(v.todays).map((tx, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={__sx(`width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px; background: ${tx?.tint ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                            {tx?.isRet ? (<>
                              <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                                <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                                <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                                <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                                <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </>) : null}
                            {tx?.isExch ? (<>
                              <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
                                <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
                                <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
                              </svg>
                            </>) : null}
                          </span>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div className="num" style={{ fontSize: "14.5px", fontWeight: "600" }}>{tx?.head}</div>
                            <div className="num hint">{tx?.item}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                            <span className="num" style={{ fontSize: "15px", fontWeight: "700" }}>{tx?.amt}</span>
                            <span className={`pill ${tx?.pcls ?? ""}`}>{tx?.kind}</span>
                          </div>
                        </div>
                      </React.Fragment>))}
                  </section>
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
