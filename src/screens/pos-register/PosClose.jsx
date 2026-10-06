'use client';
// Generated from design/templates/pos-register/PosClose.dc.html by scripts/convert-design.mjs.
// PosClose · open / close shift — POS register — Open / close shift. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "Dazzle Shop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "toPos": ["POS-এ ফিরুন", "Back to POS"], "h": ["শিফট খোলা / বন্ধ", "Open / close shift"], "hsub": ["মিরপুর শাখা · কাউন্টার ১ · আজ ২৯ সেপ্টেম্বর", "Mirpur branch · Counter 1 · today 29 Sep"], "clock": ["১০:৪৫", "10:45"], "count": ["ড্রয়ারের টাকা গুনুন", "Count the cash drawer"], "countHint": ["প্রতিটা নোট কয়টা আছে লিখুন বা + / − চাপুন", "Type how many of each note, or tap + / −"], "counted": ["মোট গোনা টাকা", "Total counted"], "expTitle": ["হিসাব অনুযায়ী ড্রয়ারে থাকার কথা", "What the drawer should have"], "expected": ["থাকার কথা", "Expected"], "digital": ["বিকাশ, নগদ ও কার্ড", "bKash, Nagad & card"], "auto": ["নিজে থেকে হিসাব", "Auto-counted"], "digiHint": ["এই টাকা ড্রয়ারে থাকে না — সরাসরি দোকানের অ্যাকাউন্টে গেছে।", "This money is not in the drawer — it went straight to the shop’s accounts."], "shiftSales": ["এই শিফটে মোট বেচা", "Sales this shift"], "note": ["নোট", "Note"], "notePh": ["যেমন: ১৫০ টাকা ভাংতি দেওয়ার সময় ভুল হয়েছে", "e.g. gave ৳150 extra change by mistake"], "closeBtn": ["শিফট বন্ধ করে রিপোর্ট প্রিন্ট", "Close shift & print report"], "who": ["কে কাউন্টারে বসছেন?", "Who is on the counter?"], "counterL": ["কাউন্টার", "Counter"], "startCash": ["শুরুর টাকা গুনুন", "Count the starting cash"], "startHint": ["ড্রয়ারে ভাংতি হিসেবে যা রাখছেন", "Change you are keeping in the drawer"], "leftPrev": ["আগের শিফট রেখে গেছে", "Left by the last shift"], "startTotal": ["শুরুর টাকা", "Starting cash"], "startBtn": ["শিফট শুরু করুন", "Start shift"], "goPos": ["POS খুলুন", "Open POS"], "pageTitle": ["শিফট খোলা / বন্ধ", "Open / close shift"]};
var AI = [["ড্রয়ারে কত টাকা থাকার কথা?", "How much should be in the drawer?", "থাকার কথা ৳৩২,৪০০ — শুরুর ৳৫,০০০ + ক্যাশ বেচা ৳৩১,৮৪০ − ফেরত ৳১,২৫০ − খরচ ৳৩,১৯০।", "It should hold ৳32,400 — ৳5,000 start + ৳31,840 cash sales − ৳1,250 refunds − ৳3,190 expenses."], ["১০০০ টাকার নোট ২০টা, ৫০০ টাকার ১৫টা", "Twenty 1000 notes, fifteen 500 notes", "বসিয়ে দিলাম: ৳১০০০ × ২০ = ৳২০,০০০, ৳৫০০ × ১৫ = ৳৭,৫০০।", "Filled in: ৳1000 × 20 = ৳20,000, ৳500 × 15 = ৳7,500."], ["আজ বিকাশে কত এলো?", "How much came by bKash?", "এই শিফটে বিকাশে ৳৯,৪৬০ এসেছে, ১৮টা লেনদেন।", "This shift: ৳9,460 by bKash across 18 payments."]];
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

var D = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
var COL = { 1000: ['#eef3fb', '#003087', '#d6e0ef'], 500: ['#e7f8f1', '#047857', '#bfe8d6'], 200: ['#fff4e0', '#a14f06', '#fde3b5'], 100: ['#fdecf5', '#a3195b', '#f6c6de'], 50: ['#e0f2f1', '#0f766e', '#b7e1dc'], 20: ['#fff1e7', '#c2410c', '#fbd5bd'], 10: ['#eef2f6', '#475569', '#dbe2ec'], 5: ['#f1f5f9', '#334155', '#dbe2ec'], 2: ['#f1f5f9', '#334155', '#dbe2ec'], 1: ['#f1f5f9', '#334155', '#dbe2ec'] };
var closeCnt = s.closeCnt || { 1000: 20, 500: 15, 200: 10, 100: 18, 50: 12, 20: 9, 10: 13, 5: 4, 2: 6, 1: 8 };
var openCnt = s.openCnt || { 1000: 2, 500: 4, 200: 0, 100: 8, 50: 4, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 };
var totalOf = function (c2) { return D.reduce(function (n, d) { return n + d * (c2[d] || 0); }, 0); };
var rowsFor = function (key, c2) { return D.map(function (d) {
  var n = c2[d] || 0, cc = COL[d];
  var setN = function (v) { var o = assign({}, c2); o[d] = Math.max(0, v); var p = {}; p[key] = o; self.setState(p); };
  return { l: money(d, bn), qty: dg(n, bn), total: money(d * n, bn), tfg: n ? '#0f172a' : '#94a3b8', bg: cc[0], fg: cc[1], bd: cc[2],
    aria: L(money(d, true) + '-এর নোট কয়টা', 'How many ' + money(d, false) + ' notes'), incL: L(money(d, true) + ' একটা বাড়ান', 'One more ' + money(d, false)), decL: L(money(d, true) + ' একটা কমান', 'One less ' + money(d, false)),
    inc: function () { setN(n + 1); }, dec: function () { setN(n - 1); }, type: function (e) { setN(num(unbn(e.target.value))); } };
}); };
var mode = s.mode || 'close';
var START = 5000, CASH_SALES = 31840, REFUNDS = 1250, EXP = 3190;
var expected = START + CASH_SALES - REFUNDS - EXP;
var counted = totalOf(closeCnt);
var diff = counted - expected;
var note = s.note || '';
var startTotal = totalOf(openCnt);
var who = s.who || 'rina', counter = s.counter || 'c1';
var CASH = [['rina', 'রিনা', 'Rina', 'ক্যাশিয়ার', 'Cashier', 'রি', 'R', '#fdecf5', '#a3195b'], ['babu', 'বাবু', 'Babu', 'সেলসম্যান', 'Salesman', 'বা', 'B', '#e7f8f1', '#047857'], ['sumon', 'সুমন', 'Sumon', 'ম্যানেজার', 'Manager', 'সু', 'S', '#eef3fb', '#003087']];
var whoName = CASH.filter(function (x) { return x[0] === who; })[0];
return {
  modes: seg(self, [['open', 'খুলুন', 'Open'], ['close', 'বন্ধ করুন', 'Close']], mode, 'mode', i),
  isClose: mode === 'close', isOpen: mode === 'open',
  modeSub: mode === 'close' ? L('রিনার শিফট চলছে ৯:০০ থেকে · বন্ধ করার আগে ড্রয়ারের টাকা গুনে মিলিয়ে নিন', 'Rina’s shift is running since 9:00 · count and match the drawer before closing') : L('নতুন শিফট শুরু করতে ক্যাশিয়ার বাছুন আর শুরুর টাকা গুনুন', 'Pick the cashier and count the starting cash to begin'),
  closeNotes: rowsFor('closeCnt', closeCnt), openNotes: rowsFor('openCnt', openCnt),
  counted: money(counted, bn), expected: money(expected, bn),
  expRows: [
    ['+', 'শুরুর টাকা', 'Starting cash', 'সকাল ৯:০০ · রিনা গুনে রেখেছে', '9:00 AM · counted by Rina', START, '#334155'],
    ['+', 'ক্যাশ বেচা', 'Cash sales', '৩৪টা মেমো', '34 memos', CASH_SALES, '#047857'],
    ['−', 'ফেরত', 'Refunds', '২টা মাল ফেরত', '2 returns', REFUNDS, '#b83210'],
    ['−', 'খরচ', 'Expenses', 'চা-নাস্তা, ভ্যান ভাড়া', 'Staff tea, van fare', EXP, '#b83210']
  ].map(function (r) { return { sign: r[0], l: r[1 + i], sub: r[3 + i], amt: money(r[5], bn), fg: r[6] }; }),
  isMatch: diff === 0, notMatch: diff !== 0,
  resLbl: diff === 0 ? L('মিলেছে', 'It matches') : diff < 0 ? L('কম আছে', 'Short by') : L('বেশি আছে', 'Over by'),
  resVal: diff === 0 ? money(0, bn) : money(Math.abs(diff), bn),
  resBg: diff === 0 ? '#e7f8f1' : diff < 0 ? '#ffece6' : '#fff4e0', resFg: diff === 0 ? '#047857' : diff < 0 ? '#b83210' : '#a14f06',
  resBd: diff === 0 ? '#bfe8d6' : diff < 0 ? '#f7c9bb' : '#fde3b5',
  digi: [['বি', 'B', 'বিকাশ', 'bKash', '১৮টা লেনদেন', '18 payments', 9460, '#fdecf5', '#a3195b'], ['ন', 'N', 'নগদ', 'Nagad', '৬টা লেনদেন', '6 payments', 3220, '#fff1e7', '#c2410c'], ['কা', 'C', 'কার্ড', 'Card', '২টা লেনদেন', '2 payments', 2480, '#eef3fb', '#003087']].map(function (d) { return { ini: d[i], isMob: d[1] !== 'C', isCard: d[1] === 'C', l: d[2 + i], n: d[4 + i], amt: money(d[6], bn), bg: d[7], fg: d[8] }; }),
  sales: money(CASH_SALES + 9460 + 3220 + 2480, bn), salesN: L('৬০টা মেমো · ক্যাশ + মোবাইল + কার্ড', '60 memos · cash + mobile + card'),
  note: note, typeNote: function (e) { self.setState({ note: e.target.value }); },
  noteReq: diff !== 0,
  noteHint: diff !== 0 && !note ? L('টাকা কম/বেশি হলে কারণ লিখতে হবে — ম্যানেজার দেখবেন।', 'If cash is short or over, write why — the manager will see it.') : L('রিপোর্টে এই নোট ছাপা হবে।', 'This note is printed on the report.'),
  noteFg: diff !== 0 && !note ? '#b83210' : '#64748b',
  closeShift: function () { if (diff !== 0 && !note) { toast(self, L('কম/বেশির কারণ নোটে লিখুন, তারপর বন্ধ করুন।', 'Write the reason for the difference first.')); return; } toast(self, L('রিনার শিফট বন্ধ হলো · রিপোর্ট প্রিন্ট হচ্ছে।', 'Rina’s shift closed · printing the report.')); },
  startTotal: money(startTotal, bn), prevLeft: money(START, bn),
  startNoteCls: startTotal === START ? 'note n-ok' : 'note n-warn',
  startNote: startTotal === START ? L('মিলেছে — আগের শিফট যা রেখে গেছে, ড্রয়ারে তাই আছে।', 'Matches what the last shift left in the drawer.') : L('আগের শিফটের সাথে ' + money(Math.abs(startTotal - START), true) + ' পার্থক্য — আবার গুনে দেখুন।', money(Math.abs(startTotal - START), false) + ' different from what the last shift left — please recount.'),
  cashiers: CASH.map(function (x) { var on = x[0] === who; return { name: x[1 + i], role: x[3 + i], ini: x[5 + i], bg: x[7], fg: x[8], on: on, bd: on ? '#003087' : '#e6eaf0', bgc: on ? '#f5f8ff' : '#fff', pick: function () { self.setState({ who: x[0] }); } }; }),
  counters: seg(self, [['c1', 'কাউন্টার ১', 'Counter 1'], ['c2', 'কাউন্টার ২', 'Counter 2']], counter, 'counter', i),
  startShift: function () { toast(self, L('শিফট শুরু হলো · ' + whoName[1] + ' · শুরুর টাকা ' + money(startTotal, true), 'Shift started · ' + whoName[2] + ' · starting cash ' + money(startTotal, false))); }
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

/* fluid layout + counter touch sizes (44px controls, 52px primary) */
.pcl-root{container:pcl / inline-size;width:100%;height:100vh;height:calc(100dvh - var(--pos-band,0px))}
.pcl-root--embedded{height:100%}
.pcl-body{flex:1 1 auto;min-height:0;overflow:auto;padding:18px 20px 20px;display:flex;flex-direction:column;gap:16px}
.pcl-root .ib{width:44px;height:44px}
.pcl-root .sgb{height:44px;padding:0 16px;font-size:var(--text-sm)}
.pcl-root .btn{min-height:44px}
.pcl-root .btn.big,.pcl-root .big{height:52px}
.pcl-root .chip,.pcl-root .chipq,.pcl-root .abtn,.pcl-root .btn.sm{height:44px}
.pcl-root .seg{flex-wrap:wrap}
.pcl-root .h1{font-size:var(--text-xl);line-height:28px}
.pcl-root button{min-height:44px}
@container pcl (max-width:599px){
  .pcl-body{padding:12px 12px 88px}
  .pcl-row{gap:8px!important;padding:5px 12px!important}
  .pcl-root .gc-cols-3{grid-template-columns:minmax(0,1fr)!important}
}
`;

// ---- markup ----

export default class PosCloseScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosClose">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={v.rootCls + " pcl-root" + (this.props.embedded ? " pcl-root--embedded" : "")} style={{ position: "relative", background: "#e9eef5", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <header style={{ minHeight: "64px", flexShrink: "0", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
            <__Link href="/pos-idle" className="ib" aria-label={v.t?.toPos} title={v.t?.toPos}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.t?.shopInitial}</span>
            <div style={{ lineHeight: "19px" }}>
              <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.shop}</div>
              <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.hsub}</div>
            </div>
            <span style={{ flexGrow: "1" }} />
            <span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", padding: "0 4px" }}>{v.t?.clock}</span>
          </header>
          <main className="pcl-body">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 16px" }}>
              <span style={{ width: "52px", height: "52px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
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
              </span>
              <div style={{ flex: "1 1 220px", minWidth: "0" }}>
                <h1 className="h1">{v.t?.h}</h1>
                <div className="sub">{v.modeSub}</div>
              </div>
              <div className="seg" role="group" aria-label={v.t?.h} style={{ padding: "5px" }}>
                {__list(v.modes).map((md, $index) => (<React.Fragment key={$index}>
                    <button type="button" className={md?.cls} aria-pressed={md?.on} onClick={md?.pick} style={{ height: "44px", padding: "0 26px", fontSize: "var(--text-base)" }}>{md?.l}</button>
                  </React.Fragment>))}
              </div>
            </div>
            {v.isClose ? (<>
              <div className="fade pcl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(400px,100%),1fr))", gap: "16px", alignItems: "start" }}>
                <section className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 18px 8px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                      <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                      <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                      <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                      <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                      <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                    </svg>
                    <div>
                      <h2 className="h2">{v.t?.count}</h2>
                      <div className="hint" style={{ fontSize: "var(--text-sm)" }}>{v.t?.countHint}</div>
                    </div>
                  </div>
                  {__list(v.closeNotes).map((n, $index) => (<React.Fragment key={$index}>
                      <div className="pcl-row" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "5px 18px" }}>
                        <span className="num" style={__sx(`width: 82px; height: 40px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${n?.bg ?? ""}; color: ${n?.fg ?? ""}; border: 1px solid ${n?.bd ?? ""}; font-size: var(--text-base); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{n?.l}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button type="button" className="ib" onClick={n?.dec} aria-label={n?.decL} style={{ width: "44px", height: "44px" }}><__Icon name="minus" strokeWidth="1.75" width="18" height="18" /></button>
                          <input className="inp num" value={n?.qty} onInput={n?.type} onChange={n?.type} aria-label={n?.aria} inputMode="numeric" style={{ width: "64px", height: "44px", padding: "0 6px", textAlign: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }} />
                          <button type="button" className="ib" onClick={n?.inc} aria-label={n?.incL} style={{ width: "44px", height: "44px" }}><__Icon name="plus" strokeWidth="1.75" width="18" height="18" /></button>
                        </div>
                        <span className="num" style={__sx(`flex-grow: 1; text-align: right; font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${n?.tfg ?? ""};`)}>{n?.total}</span>
                      </div>
                    </React.Fragment>))}
                  <div style={{ marginTop: "8px", padding: "12px 18px", borderTop: "1px solid #eef2f6", display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
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
                    <span style={{ flexGrow: "1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.counted}</span>
                    <span className="num" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.counted}</span>
                  </div>
                </section>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                        <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                        <path d="M14 27H16.5A1 1 0 0 1 17.5 28V36A1 1 0 0 1 16.5 37H14A1 1 0 0 1 13 36V28A1 1 0 0 1 14 27Z" fill="#7dd3fc" />
                        <path d="M20.5 21H23.0A1 1 0 0 1 24.0 22V36A1 1 0 0 1 23.0 37H20.5A1 1 0 0 1 19.5 36V22A1 1 0 0 1 20.5 21Z" fill="#0ea5e9" />
                        <path d="M27 15H29.5A1 1 0 0 1 30.5 16V36A1 1 0 0 1 29.5 37H27A1 1 0 0 1 26 36V16A1 1 0 0 1 27 15Z" fill="#0ea5e9" />
                        <path d="M28 34a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#e0f2fe" />
                        <path d="M29 34a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M39.5 38.5L44 43" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <h2 className="h2">{v.t?.expTitle}</h2>
                    </div>
                    {__list(v.expRows).map((e, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={__sx(`width: 18px; font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${e?.fg ?? ""};`)}>{e?.sign}</span>
                          <span style={{ flexGrow: "1" }}>
                            <span style={{ display: "block", fontSize: "var(--text-sm-plus)" }}>{e?.l}</span>
                            <span className="num hint">{e?.sub}</span>
                          </span>
                          <span className="num" style={__sx(`font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${e?.fg ?? ""};`)}>{e?.amt}</span>
                        </div>
                      </React.Fragment>))}
                    <div style={{ display: "flex", alignItems: "baseline", paddingTop: "8px" }}>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>= {v.t?.expected}</span>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{v.expected}</span>
                    </div>
                  </section>
                  <section className="card" role="status" style={__sx(`padding: 18px; display: flex; flex-direction: column; gap: 12px; border: 2px solid ${v.resBd ?? ""};`)}>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                      <div style={{ padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                        <div className="hint" style={{ fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: "6px" }}><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
</svg>{v.t?.counted}</div>
                        <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{v.counted}</div>
                      </div>
                      <div style={{ padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                        <div className="hint" style={{ fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: "6px" }}><svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
  <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
  <path d="M14 27H16.5A1 1 0 0 1 17.5 28V36A1 1 0 0 1 16.5 37H14A1 1 0 0 1 13 36V28A1 1 0 0 1 14 27Z" fill="#7dd3fc" />
  <path d="M20.5 21H23.0A1 1 0 0 1 24.0 22V36A1 1 0 0 1 23.0 37H20.5A1 1 0 0 1 19.5 36V22A1 1 0 0 1 20.5 21Z" fill="#0ea5e9" />
  <path d="M27 15H29.5A1 1 0 0 1 30.5 16V36A1 1 0 0 1 29.5 37H27A1 1 0 0 1 26 36V16A1 1 0 0 1 27 15Z" fill="#0ea5e9" />
  <path d="M28 34a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#e0f2fe" />
  <path d="M29 34a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M39.5 38.5L44 43" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.expected}</div>
                        <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{v.expected}</div>
                      </div>
                    </div>
                    <div style={__sx(`display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: var(--radius-xl); background: ${v.resBg ?? ""}; color: ${v.resFg ?? ""};`)}>
                      <span style={{ width: "52px", height: "52px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {v.isMatch ? (<>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </>) : null}
                        {v.notMatch ? (<>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                          </svg>
                        </>) : null}
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.resLbl}</div>
                        <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)" }}>{v.resVal}</div>
                      </div>
                    </div>
                  </section>
                  <button type="button" className="btn okb big" onClick={v.closeShift} style={{ height: "62px", fontSize: "var(--text-lg)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.t?.closeBtn}</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
                        <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
                        <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
                        <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
                        <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
                        <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
                      </svg>
                      <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.digital}</h2>
                      <span className="pill p-info">{v.t?.auto}</span>
                    </div>
                    {__list(v.digi).map((d, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={__sx(`width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${d?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                            {d?.isMob ? (<>
                              <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
                                <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
                                <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
                                <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
                                <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
                                <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
                              </svg>
                            </>) : null}
                            {d?.isCard ? (<>
                              <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M7.5 10H40.5A4.5 4.5 0 0 1 45 14.5V33.5A4.5 4.5 0 0 1 40.5 38H7.5A4.5 4.5 0 0 1 3 33.5V14.5A4.5 4.5 0 0 1 7.5 10Z" fill="#0ea5e9" />
                                <path d="M3 16h42v6h-42Z" fill="#003087" />
                                <path d="M9.8 26H15.2A1.8 1.8 0 0 1 17 27.8V31.2A1.8 1.8 0 0 1 15.2 33H9.8A1.8 1.8 0 0 1 8 31.2V27.8A1.8 1.8 0 0 1 9.8 26Z" fill="#7dd3fc" />
                                <path d="M22.3 28H37.7A1.3 1.3 0 0 1 39 29.3V29.3A1.3 1.3 0 0 1 37.7 30.6H22.3A1.3 1.3 0 0 1 21 29.3V29.3A1.3 1.3 0 0 1 22.3 28Z" fill="#ffffff" />
                              </svg>
                            </>) : null}
                          </span>
                          <span style={{ flexGrow: "1" }}>
                            <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{d?.l}</span>
                            <span className="num hint">{d?.n}</span>
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{d?.amt}</span>
                        </div>
                      </React.Fragment>))}
                    <div className="hint" style={{ paddingTop: "8px" }}>{v.t?.digiHint}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#e7f8f1" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                        <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                        <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                        <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                        <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", color: "#065f46" }}>{v.t?.shiftSales}<span className="num" style={{ display: "block", fontSize: "var(--text-xs-plus)" }}>{v.salesN}</span></span>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.sales}</span>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
  <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
  <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
  <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
  <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
  <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
  <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
  <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
</svg>{v.t?.note} {v.noteReq ? (<>
  <span className="req">*</span>
</>) : null}</span>
                    <textarea className="inp" aria-label={v.t?.note} value={v.note} onInput={v.typeNote} onChange={v.typeNote} placeholder={v.t?.notePh} style={{ height: "88px", padding: "10px 14px", resize: "none", lineHeight: "22px" }} />
                    <span className="hint" style={__sx(`color: ${v.noteFg ?? ""};`)}>{v.noteHint}</span>
                  </section>
                </div>
              </div>
            </>) : null}
            {v.isOpen ? (<>
              <div className="fade pcl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(400px,100%),470px))", gap: "16px", alignItems: "start" }}>
                <section className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 18px 8px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                      <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                      <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                      <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                      <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                      <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                    </svg>
                    <div>
                      <h2 className="h2">{v.t?.startCash}</h2>
                      <div className="hint" style={{ fontSize: "var(--text-sm)" }}>{v.t?.startHint}</div>
                    </div>
                  </div>
                  {__list(v.openNotes).map((n, $index) => (<React.Fragment key={$index}>
                      <div className="pcl-row" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "5px 18px" }}>
                        <span className="num" style={__sx(`width: 82px; height: 40px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${n?.bg ?? ""}; color: ${n?.fg ?? ""}; border: 1px solid ${n?.bd ?? ""}; font-size: var(--text-base); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{n?.l}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button type="button" className="ib" onClick={n?.dec} aria-label={n?.decL} style={{ width: "44px", height: "44px" }}><__Icon name="minus" strokeWidth="1.75" width="18" height="18" /></button>
                          <input className="inp num" value={n?.qty} onInput={n?.type} onChange={n?.type} aria-label={n?.aria} inputMode="numeric" style={{ width: "64px", height: "44px", padding: "0 6px", textAlign: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }} />
                          <button type="button" className="ib" onClick={n?.inc} aria-label={n?.incL} style={{ width: "44px", height: "44px" }}><__Icon name="plus" strokeWidth="1.75" width="18" height="18" /></button>
                        </div>
                        <span className="num" style={__sx(`flex-grow: 1; text-align: right; font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${n?.tfg ?? ""};`)}>{n?.total}</span>
                      </div>
                    </React.Fragment>))}
                  <div style={{ marginTop: "8px", padding: "12px 18px", borderTop: "1px solid #eef2f6", display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
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
                    <span style={{ flexGrow: "1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.startTotal}</span>
                    <span className="num" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.startTotal}</span>
                  </div>
                </section>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                        <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
                        <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
                        <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
                        <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
                      </svg>
                      <h2 className="h2">{v.t?.who}</h2>
                    </div>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                      {__list(v.cashiers).map((cs, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={cs?.pick} aria-pressed={cs?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: var(--radius-xl); border: 2px solid ${cs?.bd ?? ""}; background: ${cs?.bgc ?? ""}; cursor: pointer;`)}>
                            <span style={__sx(`width: 48px; height: 48px; border-radius: var(--radius-full); background: ${cs?.bg ?? ""}; color: ${cs?.fg ?? ""}; font-size: var(--text-lg); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{cs?.ini}</span>
                            <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{cs?.name}</span>
                            <span className="hint">{cs?.role}</span>
                          </button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M9 18H39A1 1 0 0 1 40 19V41A1 1 0 0 1 39 42H9A1 1 0 0 1 8 41V19A1 1 0 0 1 9 18Z" fill="#e0f2fe" />
                        <path d="M7 9H41A2 2 0 0 1 43 11V17A2 2 0 0 1 41 19H7A2 2 0 0 1 5 17V11A2 2 0 0 1 7 9Z" fill="#0ea5e9" />
                        <path d="M11 9h6v10h-6Z" fill="#ffffff" />
                        <path d="M23 9h6v10h-6Z" fill="#ffffff" />
                        <path d="M35 9h5v10h-5Z" fill="#ffffff" />
                        <path d="M21 28H28A1 1 0 0 1 29 29V41A1 1 0 0 1 28 42H21A1 1 0 0 1 20 41V29A1 1 0 0 1 21 28Z" fill="#0ea5e9" />
                        <path d="M12.5 23H17.0A1 1 0 0 1 18.0 24V28A1 1 0 0 1 17.0 29H12.5A1 1 0 0 1 11.5 28V24A1 1 0 0 1 12.5 23Z" fill="#7dd3fc" />
                        <path d="M32 23H36.5A1 1 0 0 1 37.5 24V28A1 1 0 0 1 36.5 29H32A1 1 0 0 1 31 28V24A1 1 0 0 1 32 23Z" fill="#7dd3fc" />
                      </svg>
                      <span className="lbl" style={{ flexGrow: "1" }}>{v.t?.counterL}</span>
                      <div className="seg" role="group" aria-label={v.t?.counterL}>
                        {__list(v.counters).map((co, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={co?.cls} aria-pressed={co?.on} onClick={co?.pick}>{co?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M4 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z" fill="#e0f2fe" />
                        <path d="M8.5 24a13.5 13.5 0 1 0 27.0 0a13.5 13.5 0 1 0 -27.0 0Z" fill="#ffffff" />
                        <path d="M22 16V24.5L28 28" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M29 36a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
                        <path d="M33 36l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", color: "#475569" }}>{v.t?.leftPrev}</span>
                      <span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.prevLeft}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                        <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                        <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                        <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                        <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                        <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", color: "#475569" }}>{v.t?.startTotal}</span>
                      <span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.startTotal}</span>
                    </div>
                    <div className={v.startNoteCls} role="status">{v.startNote}</div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <__Link href="/pos-idle" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 4h16v10H4zM8 18h8M12 14v4M7 21h10" />
</svg>{v.t?.goPos}</__Link>
                      <button type="button" className="btn solid" onClick={v.startShift} style={{ flexGrow: "1" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.startBtn}</button>
                    </div>
                  </section>
                </div>
              </div>
            </>) : null}
          </main>
          {v.hasMsg ? (<>
            <div className="fade" role="status" style={{ position: "absolute", top: "90px", left: "50%", transform: "translateX(-50%)", zIndex: "30", display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", borderRadius: "var(--radius-xl)", background: "#0f172a", color: "#fff", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", boxShadow: "0 16px 36px -14px rgba(15,23,42,.6)", width: "max-content", maxWidth: "min(640px, calc(100% - 24px))" }}>
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
