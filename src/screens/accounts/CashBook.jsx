'use client';
// Generated from design/templates/accounts/CashBook.dc.html by scripts/convert-design.mjs.
// Cash book & expenses — Accounts — Cash book & expenses. Imported from Retail Commerce and merged.
// Edit freely: this file is now the source for the screen.
// Live ledger (src/lib/ledger.js): the balances strip shows every money account; today's day book adds
// the entries posted today to the cash accounts (sales, refunds, due collected, supplier payments,
// pickups) after the demo rows, and "Add expense" posts the expense to the account it was paid from.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { getEntries, postEntry, accountForMethod, accountBy } from '@/lib/ledger';
import { formatTime } from '@/lib/format';
import LedgerBalances from './LedgerBalances';

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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "Dazzle Shop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "hsub": ["ক্যাশে কত এলো, কত গেলো — আর মাসের খরচ ও আসল লাভ", "What came into and left the cash drawer — plus monthly expenses and real profit"], "prevDay": ["আগের দিন", "Previous day"], "nextDay": ["পরের দিন", "Next day"], "goToday": ["আজকের দিনে যান", "Go to today"], "addExp": ["খরচ লিখুন", "Add expense"], "openLbl": ["দিনের শুরুতে ছিল", "Opening cash"], "inLbl": ["এলো", "Came in"], "outLbl": ["গেলো", "Went out"], "endLbl": ["দিন শেষে থাকার কথা", "Should be in the drawer"], "count": ["ক্যাশ মিলিয়ে দেখুন", "Check the cash"], "counted": ["ড্রয়ারে গুনে কত পেলেন?", "How much did you count?"], "countHint": ["টাকা গুনে লিখুন — খাতার সাথে মিলছে কিনা সাথে সাথে দেখাবে।", "Count the notes and type the total — we compare it with the book instantly."], "countSave": ["মিলিয়ে সেভ করুন", "Save the check"], "print": ["প্রিন্ট", "Print"], "cTime": ["সময়", "Time"], "cDesc": ["বিবরণ", "Details"], "cType": ["ধরন", "Type"], "cIn": ["জমা", "In"], "cOut": ["খরচ", "Out"], "cBal": ["ব্যালান্স", "Balance"], "startRow": ["দিনের শুরুতে ক্যাশ", "Opening cash"], "startRowT": ["সকাল ৯:০০", "9:00 AM"], "dayTotal": ["দিনের মোট", "Day total"], "recentExp": ["এই মাসের খরচ", "This month’s expenses"], "more18": ["আগের আরও খরচ দেখুন", "See older expenses"], "eDate": ["তারিখ", "Date"], "eCat": ["খরচের ধরন", "Type"], "eDesc": ["বিবরণ", "Details"], "ePay": ["কীভাবে দিলেন", "Paid by"], "eAmt": ["টাকা", "Amount"], "eRc": ["রসিদ", "Receipt"], "seeRc": ["রসিদের ছবি দেখুন", "View receipt photo"], "noneF": ["এই ধরনের কোনো খরচ নেই", "No expenses of this type"], "monthExp": ["সেপ্টেম্বরের মোট খরচ", "Total expenses, September"], "catHint": ["কোনো ধরনে চাপ দিলে শুধু সেগুলো দেখাবে", "Tap a type to show only those"], "clearF": ["সব দেখান", "Show all"], "plSales": ["বেচা", "Sales"], "plSalesH": ["এই মাসে মোট যত টাকার মাল বেচেছেন", "Everything you sold this month"], "plCogs": ["বেচা মালের কেনা দাম", "Buying cost of goods sold"], "plCogsH": ["যে মাল বেচলেন, সেটা কিনতে যত লেগেছিল", "What those goods cost you to buy"], "plGross": ["মোট লাভ", "Gross profit"], "plExp": ["দোকানের খরচ", "Shop expenses"], "plExpH": ["ভাড়া, বিল, বেতন, নাস্তা, পরিবহন…", "Rent, bills, salary, tea, transport…"], "seeExp": ["খরচ দেখুন", "See expenses"], "plNet": ["আসল লাভ", "Real profit"], "plNetH": ["সব খরচ বাদ দিয়ে যা আপনার থাকল", "What is left for you after every cost"], "plOfSales": ["বেচার", "of sales"], "last6": ["গত ৬ মাসের আসল লাভ", "Real profit, last 6 months"], "last6H": ["কোনো মাসে চাপ দিলে তার হিসাব বাম পাশে দেখাবে", "Tap a month to see its calculation on the left"], "drawerSub": ["খরচটা লিখে রাখুন — মাস শেষে লাভ-লস নিজে থেকে হিসাব হবে", "Note it down — profit & loss is worked out for you"], "amt": ["কত টাকা খরচ হলো?", "How much was spent?"], "zero": ["০", "0"], "whatFor": ["কীসের খরচ?", "What was it for?"], "paidFrom": ["কোথা থেকে দিলেন?", "Paid from"], "note": ["বিবরণ", "Note"], "notePh": ["যেমন: সেপ্টেম্বরের দোকান ভাড়া", "e.g. September shop rent"], "date": ["তারিখ", "Date"], "receipt": ["রসিদের ছবি", "Receipt photo"], "recur": ["প্রতি মাসে লিখবে", "Repeat every month"], "pageTitle": ["হিসাব খাতা ও খরচ", "Cash book & expenses"]};
var AI = [["আজকে ক্যাশে কত থাকার কথা?", "How much cash should I have today?", "দিনের শুরুতে ছিল ৳২৫,০০০, এলো ৳৫৩,৮৫০, গেলো ৳৪৬,৪৫০। দিন শেষে ড্রয়ারে থাকার কথা ৳৩২,৪০০।", "You started with ৳25,000, ৳53,850 came in and ৳46,450 went out. The drawer should have ৳32,400."], ["চা-নাস্তায় ৩৫০ টাকা খরচ লেখো", "Add 350 taka for tea", "লিখলাম: নাস্তা-চা ৳৩৫০, ক্যাশ থেকে। সেভ করব?", "Noted: Tea & snacks ৳350, paid in cash. Shall I save it?"], ["এই মাসে আসল লাভ কত?", "What is my real profit this month?", "সেপ্টেম্বরে মোট লাভ ৳২,৫৪,৮০০। খরচ ৳৭৪,৩০০ বাদ দিলে আসল লাভ ৳১,৮০,৫০০।", "September: gross profit ৳2,54,800 minus ৳74,300 expenses = real profit ৳1,80,500."]];
var NAVC = {"stock": "7", "customers": "12", "suppliers": "3"};

/** Ledger kinds as day-book types. */
var KIND_TYPE = { sale: 'sale', 'invoice payment': 'due', refund: 'refund', 'supplier payment': 'sup', expense: 'exp', 'paid out': 'exp', 'cash pickup': 'move', transfer: 'move', 'cash in': 'move' };
var KIND_LABEL = { sale: 'Sale', 'invoice payment': 'Due collected', refund: 'Refund', 'supplier payment': 'Supplier paid', expense: 'Expense', 'paid out': 'Paid out', 'cash pickup': 'Cash pickup', transfer: 'Transfer', 'cash in': 'Cash added' };

class Component extends DCLogic {
  componentDidMount() { this.setState({ ledger: getEntries() }); }
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

var P_HOME = 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z';
var P_BOLT = 'M13 2 3 14h9l-1 8 10-12h-9z';
var P_USERS = 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a5 5 0 0 0-4-5';
var P_CUP = 'M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3';
var P_TRUCK = 'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';
var P_WIFI = 'M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01';
var P_WRENCH = 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z';
var P_DOTS = 'M5 12h.01M12 12h.01M19 12h.01M3 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0M17 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0';
var CAT = [
  ['rent', 'দোকান ভাড়া', 'Shop rent', P_HOME, '#eef3fb', '#003087'],
  ['elec', 'বিদ্যুৎ বিল', 'Electricity', P_BOLT, '#fff4e0', '#a14f06'],
  ['salary', 'স্টাফ বেতন', 'Staff salary', P_USERS, '#e7f8f1', '#047857'],
  ['tea', 'নাস্তা-চা', 'Tea & snacks', P_CUP, '#fdecef', '#be123c'],
  ['transport', 'পরিবহন', 'Transport', P_TRUCK, '#eef2f6', '#334155'],
  ['net', 'ইন্টারনেট/মোবাইল', 'Internet / mobile', P_WIFI, '#f1edfc', '#6d28d9'],
  ['repair', 'মেরামত', 'Repairs', P_WRENCH, '#e6f6f9', '#0e7490'],
  ['other', 'অন্যান্য', 'Other', P_DOTS, '#eef2f6', '#475569']
];
var catBy = {}; CAT.forEach(function (x) { catBy[x[0]] = x; });
function byKey(arr) { var o = {}; arr.forEach(function (x, j) { o[CAT[j][0]] = x; }); return o; }
var CATAMT = { rent: 15000, elec: 3850, salary: 42000, tea: 4200, transport: 3600, net: 1500, repair: 2300, other: 1850 };
var PAY = { cash: ['ক্যাশ', 'Cash', 'pill p-grey'], bkash: ['বিকাশ', 'bKash', 'pill p-bk'], bank: ['ব্যাংক', 'Bank', 'pill p-info'] };
var TYPE = { refund: ['ফেরত', 'Refund', 'pill p-due'], move: ['টাকা সরানো', 'Moved', 'pill p-grey'], sale: ['বেচা', 'Sale', 'pill p-ok'], due: ['বাকি আদায়', 'Due collected', 'pill p-info'], sup: ['দেনা শোধ', 'Supplier paid', 'pill p-warn'], exp: ['খরচ', 'Expense', 'pill p-due'], staff: ['স্টাফ অগ্রিম', 'Staff advance', 'pill p-grey'], bank: ['ব্যাংকে জমা', 'To bank', 'pill p-grey'] };
var ENTRIES = [
  ['সকাল ৯:৪০', '9:40 AM', 'সকালের নগদ বেচা · ১৪টা মেমো', 'Morning cash sales · 14 memos', 'sale', 8400, 0],
  ['সকাল ১০:০৫', '10:05 AM', 'প্রাণ ডিস্ট্রিবিউশনকে দেনা শোধ', 'Paid Dhaka Gadget Hub', 'sup', 0, 20000],
  ['সকাল ১০:৩০', '10:30 AM', 'বাকি আদায় — রফিক মিয়া', 'Due collected — Rafiq Mia', 'due', 3500, 0],
  ['সকাল ১১:১৫', '11:15 AM', 'স্টাফদের চা-বিস্কুট', 'Staff tea', 'exp', 0, 350],
  ['দুপুর ১২:৪০', '12:40 PM', 'দুপুরের নগদ বেচা · ১৬টা মেমো', 'Midday cash sales · 16 memos', 'sale', 14200, 0],
  ['দুপুর ১:৩০', '1:30 PM', 'দোকান ভাড়া (সেপ্টেম্বর)', 'Shop rent (September)', 'exp', 0, 15000],
  ['বিকাল ৩:১০', '3:10 PM', 'বাকি আদায় — করিম সাহেব', 'Due collected — Karim Saheb', 'due', 5000, 0],
  ['বিকাল ৪:২০', '4:20 PM', 'বিদ্যুৎ বিল (আগস্ট)', 'Electricity bill (August)', 'exp', 0, 3850],
  ['বিকাল ৫:৪৫', '5:45 PM', 'বিকেলের নগদ বেচা · ১৮টা মেমো', 'Afternoon cash sales · 18 memos', 'sale', 16250, 0],
  ['সন্ধ্যা ৬:৩০', '6:30 PM', 'অগ্রিম — বাবু (সেলসম্যান)', 'Advance — Babu (salesman)', 'staff', 0, 2000],
  ['সন্ধ্যা ৭:১৫', '7:15 PM', 'ভ্যান ভাড়া — গুদাম থেকে মাল', 'Van fare — goods from warehouse', 'exp', 0, 450],
  ['রাত ৮:৩০', '8:30 PM', 'রাতের নগদ বেচা · ৯টা মেমো', 'Evening cash sales · 9 memos', 'sale', 6500, 0],
  ['রাত ৮:৫০', '8:50 PM', 'ব্যাংকে জমা দিলেন', 'Deposited to bank', 'bank', 0, 4800]
];
var DAYS = [['আজ · মঙ্গল, ২৯ সেপ্টেম্বর', 'Today · Tue, 29 Sep'], ['সোম, ২৮ সেপ্টেম্বর', 'Mon, 28 Sep'], ['রবি, ২৭ সেপ্টেম্বর', 'Sun, 27 Sep'], ['শনি, ২৬ সেপ্টেম্বর', 'Sat, 26 Sep'], ['শুক্র, ২৫ সেপ্টেম্বর', 'Fri, 25 Sep']];
var DAYF = [1, 0.92, 0.85, 1.08, 1.2];
var OPEN = [25000, 22400, 19800, 24600, 21000];
var EXP = [
  ['২৯ সেপ্টে.', '29 Sep', 'rent', 'সেপ্টেম্বর মাসের দোকান ভাড়া', 'September shop rent', 'cash', 15000, true],
  ['২৯ সেপ্টে.', '29 Sep', 'elec', 'বিদ্যুৎ বিল (আগস্ট)', 'Electricity bill (August)', 'cash', 3850, true],
  ['২৯ সেপ্টে.', '29 Sep', 'transport', 'ভ্যান ভাড়া — গুদাম থেকে মাল', 'Van fare — goods from warehouse', 'cash', 450, false],
  ['২৯ সেপ্টে.', '29 Sep', 'tea', 'স্টাফদের চা-বিস্কুট', 'Staff tea', 'cash', 350, false],
  ['২৮ সেপ্টে.', '28 Sep', 'net', 'দোকানের ওয়াইফাই বিল', 'Shop Wi-Fi bill', 'bkash', 1000, true],
  ['২৭ সেপ্টে.', '27 Sep', 'repair', 'ফ্রিজের কম্প্রেসার ঠিক করা', 'Fridge compressor repair', 'cash', 2300, true],
  ['২৬ সেপ্টে.', '26 Sep', 'other', 'ঝাড়ু, ফিনাইল, পলিথিন', 'Broom, phenyl, poly bags', 'cash', 420, false],
  ['২৫ সেপ্টে.', '25 Sep', 'net', 'মোবাইল রিচার্জ (দোকানের নম্বর)', 'Mobile top-up (shop number)', 'bkash', 500, false],
  ['০৫ সেপ্টে.', '5 Sep', 'salary', 'আগস্টের বেতন — ৪ জন স্টাফ', 'August salary — 4 staff', 'bank', 42000, true]
];
var MONTHS = [['এপ্রিল', 'Apr', 1140000, 915600, 72400], ['মে', 'May', 1210500, 970900, 71200], ['জুন', 'Jun', 1085300, 870300, 73800], ['জুলাই', 'Jul', 1162800, 931400, 71600], ['আগস্ট', 'Aug', 1244100, 996300, 73500], ['সেপ্টেম্বর', 'Sep', 1286400, 1031600, 74300]];
var MFULL = ['April', 'May', 'June', 'July', 'August', 'September'];
function kmoney(n) { return n >= 100000 ? dg('৳' + (n / 100000).toFixed(2).replace(/\.?0+$/, ''), bn) + L(' লাখ', ' lakh') : n >= 1000 ? dg('৳' + (n / 1000).toFixed(1).replace(/\.0$/, ''), bn) + L(' হা.', 'k') : money(n, bn); }

// ---- day book
var d = s.d || 0, f = DAYF[d];
var r50 = function (x) { return Math.round(x * f / 50) * 50; };
var added = s.added || [];
var addSum = added.reduce(function (n, a) { return n + a.amt; }, 0);
var led = ENTRIES.map(function (e) { return { time: e[i], dsc: e[2 + i], ty: e[4], inn: r50(e[5]), out: r50(e[6]) }; });
// today: money posted to the cash accounts in this browser (expenses saved here are among them)
var t0 = new Date(); t0.setHours(0, 0, 0, 0);
var liveCash = d === 0 ? (s.ledger || []).filter(function (e) { var a = accountBy(e.account); return a && a.type === 'Cash' && e.at >= t0.getTime(); }).sort(function (a, b) { return a.at - b.at; }) : [];
liveCash.forEach(function (e) {
  var a = accountBy(e.account);
  led.push({ time: formatTime(e.at), dsc: (KIND_LABEL[e.kind] || 'Entry') + (e.party ? ' — ' + e.party : '') + (e.ref ? ' · ' + e.ref : '') + ' · ' + a.name, ty: KIND_TYPE[e.kind] || 'move', inn: e.amount > 0 ? e.amount : 0, out: e.amount < 0 ? -e.amount : 0 });
});
var open = OPEN[d], bal = open, tin = 0, tout = 0;
var ledRows = led.map(function (e) { bal += e.inn - e.out; tin += e.inn; tout += e.out; var ty = TYPE[e.ty]; return { isSale: e.ty === 'sale', isDue: e.ty === 'due', isSup: e.ty === 'sup', isExp: e.ty === 'exp', isStaff: e.ty === 'staff', isBank: e.ty === 'bank', time: e.time, dsc: e.dsc, ty: ty[i], pcls: ty[2], inn: e.inn ? money(e.inn, bn) : '', out: e.out ? money(e.out, bn) : '', bal: money(bal, bn) }; });
var end = bal;
var counted = s.counted == null ? end - 200 : s.counted;
var diff = counted - end;
var cnt = diff === 0 ? { l: L('মিলে গেছে', 'It matches'), bg: '#e7f8f1', fg: '#047857' } : diff < 0 ? { l: money(-diff, bn) + L(' কম আছে', ' short'), bg: '#ffece6', fg: '#b83210' } : { l: money(diff, bn) + L(' বেশি আছে', ' extra'), bg: '#fff4e0', fg: '#a14f06' };
var tab = s.tab || 'day';

// ---- expenses
var fcat = s.fcat || '';
var expRows = added.slice().reverse().map(function (a) { return ['২৯ সেপ্টে.', '29 Sep', a.cat, a.note || catBy[a.cat][1], a.note || catBy[a.cat][2], a.pay, a.amt, a.photo, true]; }).concat(EXP);
var shown = expRows.filter(function (e) { return !fcat || e[2] === fcat; });
var catTot = {}; CAT.forEach(function (x) { catTot[x[0]] = CATAMT[x[0]]; }); added.forEach(function (a) { catTot[a.cat] += a.amt; });
var maxCat = Math.max.apply(null, CAT.map(function (x) { return catTot[x[0]]; }));

// ---- profit & loss
var pm = s.pm == null ? 5 : s.pm;
var MS = MONTHS.map(function (m, j) { var e = m[4] + (j === 5 ? addSum : 0); return { sales: m[2], cogs: m[3], exp: e, gross: m[2] - m[3], net: m[2] - m[3] - e }; });
var cur = MS[pm];
var maxNet = Math.max.apply(null, MS.map(function (m) { return m.net; }));
var cmpTxt = '';
if (pm > 0) { var dn = cur.net - MS[pm - 1].net; cmpTxt = L('আগের মাসের চেয়ে ' + money(Math.abs(dn), true) + (dn >= 0 ? ' বেশি লাভ' : ' কম লাভ'), (dn >= 0 ? 'Up ' : 'Down ') + money(Math.abs(dn)) + ' on the month before'); }
else cmpTxt = L('৬ মাসে মোট আসল লাভ ', 'Real profit over 6 months: ') + money(MS.reduce(function (n, m) { return n + m.net; }, 0), bn);

// ---- drawer
var dCat = s.dCat || 'rent', dPay = s.dPay || 'cash', amt = s.amt || 0, note = s.note || '', photo = !!s.photo;
var rec = sw(self, 'rec', false);

return {
  dayLbl: DAYS[d][i], nextOp: d === 0 ? 0.4 : 1,
  prevDay: function () { self.setState({ d: Math.min(4, d + 1), counted: null }); },
  nextDay: function () { self.setState({ d: Math.max(0, d - 1), counted: null }); },
  goToday: function () { self.setState({ d: 0, counted: null }); },
  st: { open: money(open, bn), inn: money(tin, bn), out: money(tout, bn), end: money(end, bn) },
  countOpen: !!s.countOpen, toggleCount: function () { self.setState({ countOpen: !s.countOpen }); },
  countedTxt: dg(counted, bn), typeCounted: function (e) { self.setState({ counted: num(unbn(e.target.value)) }); },
  cnt: cnt,
  saveCount: function () { toast(self, diff === 0 ? L('ক্যাশ মিলেছে — খাতায় সেভ হলো।', 'Cash matches — saved to the book.') : L('ক্যাশ গোনা সেভ হলো। পার্থক্য ' + money(Math.abs(diff), true) + ' খাতায় লেখা থাকল।', 'Cash count saved. Difference of ' + money(Math.abs(diff)) + ' noted in the book.')); self.setState({ countOpen: false }); },
  tb: (function () { var a = seg(self, [['day', 'দিনের খাতা', 'Day book'], ['exp', 'খরচ', 'Expenses'], ['pl', 'লাভ-লস', 'Profit & loss']], tab, 'tab', i, 'tl'); return { day: a[0], exp: a[1], pl: a[2] }; })(),
  isDay: tab === 'day', isExp: tab === 'exp', isPl: tab === 'pl',
  dayTitle: L('দিনের খাতা · ', 'Day book · ') + DAYS[d][i].replace('আজ · ', '').replace('Today · ', ''),
  entryCount: dg(ledRows.length, bn) + L('টা লেনদেন', ' entries') + (liveCash.length ? ' · ' + liveCash.length + ' from the ledger' : ''),
  ledgerTick: (s.ledger || []).length,
  led: ledRows,
  printDay: function () { toast(self, L('দিনের খাতা প্রিন্ট হচ্ছে…', 'Printing the day book…')); },
  exps: shown.map(function (e) { var k2 = catBy[e[2]], p = PAY[e[5]]; return { dt: e[i], cat: k2[1 + i], d: k2[3], bg: k2[4], fg: k2[5], desc: e[3 + i], pay: p[i], pcls: p[2], amt: money(e[6], bn), hasRc: !!e[7], noRc: !e[7], rowBg: e[8] ? '#f5fbf8' : 'transparent', seeRc: function () { toast(self, L('রসিদের ছবি খুলছে…', 'Opening receipt photo…')); } }; }),
  noExp: shown.length === 0,
  hasF: !!fcat, fName: fcat ? catBy[fcat][1 + i] : '', clearF: function () { self.setState({ fcat: '' }); },
  expTotal: money(74300 + addSum, bn),
  ck: byKey(CAT.map(function (x) { var on = fcat === x[0]; return { l: x[1 + i], d: x[3], bg: x[4], fg: x[5], v: money(catTot[x[0]], bn), w: Math.max(3, Math.round(catTot[x[0]] / maxCat * 100)) + '%', on: on, bd: on ? '#003087' : 'transparent', bgc: on ? '#eef3fb' : '#fff', pick: function () { self.setState({ fcat: on ? '' : x[0] }); } }; })),
  plTitle: bn ? MONTHS[pm][0] + ' ২০২৬-এর লাভ-লস' + (pm === 5 ? ' (আজ পর্যন্ত)' : '') : 'Profit & loss, ' + MFULL[pm] + ' 2026' + (pm === 5 ? ' (so far)' : ''),
  pl: { sales: money(cur.sales, bn), cogs: money(cur.cogs, bn), gross: money(cur.gross, bn), exp: money(cur.exp, bn), net: money(cur.net, bn), pct: dg(Math.round(cur.net / cur.sales * 100), bn) + '% ' + t.plOfSales },
  goExp: function () { self.setState({ tab: 'exp' }); },
  months: MS.map(function (m, j) { var on = j === pm; return { l: MONTHS[j][i], v: kmoney(m.net), h: Math.round(m.net / maxNet * 160) + 'px', bg: on ? '#047857' : '#bfe6d4', fg: on ? '#047857' : '#64748b', fw: on ? 700 : 500, on: on, pick: function () { self.setState({ pm: j }); } }; }),
  cmp: cmpTxt,
  drawerOpen: !!s.drawer,
  openDrawer: function () { self.setState({ drawer: true }); },
  closeDrawer: function () { self.setState({ drawer: false }); },
  amtTxt: amt ? dg(amt, bn) : '', typeAmt: function (e) { self.setState({ amt: num(unbn(e.target.value)) }); },
  dk: byKey(CAT.map(function (x) { var on = dCat === x[0]; return { l: x[1 + i], d: x[3], bg: x[4], fg: x[5], on: on, bd: on ? '#003087' : '#e6eaf0', bgc: on ? '#eef3fb' : '#fff', pick: function () { self.setState({ dCat: x[0] }); } }; })),
  dp: (function () { var a = seg(self, [['cash', 'ক্যাশ', 'Cash'], ['bkash', 'বিকাশ', 'bKash'], ['bank', 'ব্যাংক', 'Bank']], dPay, 'dPay', i, 'chip'); return { cash: a[0], bkash: a[1], bank: a[2] }; })(),
  note: note, typeNote: function (e) { self.setState({ note: e.target.value }); },
  dateVal: L('২৯/০৯/২০২৬', '29/09/2026'),
  photoOn: photo, togglePhoto: function () { self.setState({ photo: !photo }); },
  ph: photo ? { l: L('রসিদ যোগ হলো', 'Receipt added'), bd: '#047857', bg: '#e7f8f1', fg: '#047857' } : { l: L('ছবি তুলুন', 'Take a photo'), bd: '#94a3b8', bg: '#f8fafc', fg: '#475569' },
  rec: rec,
  recHint: rec.on ? L('প্রতি মাসের ২৯ তারিখে এই খরচ নিজে থেকে খাতায় উঠবে', 'Added to the book automatically on the 29th every month') : L('যেমন দোকান ভাড়া, ওয়াইফাই বিল — প্রতি মাসে একই খরচ', 'For fixed monthly costs like rent or Wi-Fi'),
  saveLbl: amt ? L('সেভ করুন · ', 'Save · ') + money(amt, bn) : t.save,
  saveExp: function () {
    if (!amt) { toast(self, L('আগে কত টাকা খরচ হলো লিখুন', 'Enter the amount first')); return; }
    var na = added.concat([{ cat: dCat, pay: dPay, amt: amt, note: note, photo: photo }]);
    // the money leaves the account it was paid from
    postEntry({ account: accountForMethod(dPay, false), amount: -amt, kind: 'expense', party: catBy[dCat][2], note: note, by: 'Staff' });
    self.setState({ added: na, drawer: false, amt: 0, note: '', photo: false, tab: 'exp', fcat: '', ledger: getEntries() });
    toast(self, L('খরচ লেখা হলো: ' + catBy[dCat][1] + ' ' + money(amt, true) + ', ' + PAY[dPay][0] + ' থেকে' + (rec.on ? ' · প্রতি মাসে নিজে থেকে লিখবে' : ''), 'Expense saved: ' + catBy[dCat][2] + ' ' + money(amt) + ', paid by ' + PAY[dPay][1] + (rec.on ? ' · repeats monthly' : '')));
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

export default class CashBookScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="CashBook">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="acc-cashbook" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb="Accounts" page={"Cash book & expenses"} placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
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
                </span>
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button type="button" className="ib" onClick={v.prevDay} aria-label={v.t?.prevDay}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" onClick={v.goToday} aria-label={v.t?.goToday} style={{ height: "44px", minWidth: "230px", padding: "0 16px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a", cursor: "pointer" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                    </svg>
                    <span className="num">{v.dayLbl}</span>
                  </button>
                  <button type="button" className="ib" onClick={v.nextDay} aria-label={v.t?.nextDay} style={__sx(`opacity: ${v.nextOp ?? ""};`)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <button type="button" className="btn solid" onClick={v.openDrawer}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>{v.t?.addExp}</button>
              </div>
              <section className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "var(--text-sm)", color: "#475569", fontWeight: "var(--weight-medium)" }}><svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
</svg>{v.t?.openLbl}</span>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{v.st?.open}</span>
                </div>
                <span style={{ color: "var(--text-muted)", display: "flex" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "var(--text-sm)", color: "#475569", fontWeight: "var(--weight-medium)" }}><svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
  <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</svg>+ {v.t?.inLbl}</span>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.st?.inn}</span>
                </div>
                <span style={{ color: "var(--text-muted)", display: "flex" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "var(--text-sm)", color: "#475569", fontWeight: "var(--weight-medium)" }}><svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
  <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</svg>− {v.t?.outLbl}</span>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.st?.out}</span>
                </div>
                <span style={{ color: "var(--text-muted)", display: "flex" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", padding: "10px 18px", borderRadius: "var(--radius-xl)", background: "#eef3fb", display: "flex", flexDirection: "column" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)", color: "#1e3a6e", fontWeight: "var(--weight-medium)" }}><svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
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
</svg>{v.t?.endLbl}</span>
                  <span className="num" style={{ fontSize: "var(--text-3xl)", lineHeight: "40px", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.st?.end}</span>
                </div>
                <button type="button" className="btn okb" onClick={v.toggleCount} aria-pressed={v.countOpen}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.count}</button>
              </section>
              {v.countOpen ? (<>
                <section className="card fade" style={{ padding: "16px 20px", display: "flex", alignItems: "flex-end", gap: "16px" }}>
                  <span style={{ alignSelf: "center", display: "flex" }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                      <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                      <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                      <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                      <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                      <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                    </svg>
                  </span>
                  <label className="fld" style={{ width: "250px" }}>
                    <span className="lbl">{v.t?.counted}</span>
                    <input className="inp num" value={v.countedTxt} onInput={v.typeCounted} onChange={v.typeCounted} inputMode="numeric" aria-label={v.t?.counted} style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }} />
                  </label>
                  <div role="status" style={__sx(`height: 48px; padding: 0 18px; border-radius: var(--radius-xl); background: ${v.cnt?.bg ?? ""}; color: ${v.cnt?.fg ?? ""}; display: flex; align-items: center; font-size: var(--text-lg); font-weight: var(--weight-semibold);`)}>
                    <span className="num">{v.cnt?.l}</span>
                  </div>
                  <div className="hint" style={{ flexGrow: "1", paddingBottom: "4px" }}>{v.t?.countHint}</div>
                  <button type="button" className="btn solid" onClick={v.saveCount}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.countSave}</button>
                </section>
              </>) : null}
              <LedgerBalances tick={v.ledgerTick} />
              <div className="tabl" role="tablist">
                <button type="button" role="tab" className={v.tb?.day?.cls} aria-selected={v.tb?.day?.on} onClick={v.tb?.day?.pick} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
</svg>{v.tb?.day?.l}</button>
                <button type="button" role="tab" className={v.tb?.exp?.cls} aria-selected={v.tb?.exp?.on} onClick={v.tb?.exp?.pick} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2zM8 9h8M8 13h5" />
</svg>{v.tb?.exp?.l}</button>
                <button type="button" role="tab" className={v.tb?.pl?.cls} aria-selected={v.tb?.pl?.on} onClick={v.tb?.pl?.pick} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />
</svg>{v.tb?.pl?.l}</button>
              </div>
              {v.isDay ? (<>
                <section className="card fade" style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px" }}>
                    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
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
                    <h2 className="h2" style={{ flexGrow: "1" }}>{v.dayTitle}</h2>
                    <span className="hint num">{v.entryCount}</span>
                    <button type="button" className="btn line sm" onClick={v.printDay}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.t?.print}</button>
                  </div>
                  <div className="gc-table-wrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          <th className="th" style={{ width: "130px" }}>{v.t?.cTime}</th>
                          <th className="th">{v.t?.cDesc}</th>
                          <th className="th">{v.t?.cType}</th>
                          <th className="th" style={{ textAlign: "right" }}>{v.t?.cIn}</th>
                          <th className="th" style={{ textAlign: "right" }}>{v.t?.cOut}</th>
                          <th className="th" style={{ textAlign: "right" }}>{v.t?.cBal}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ background: "#fbfcfe" }}>
                          <td className="td num" style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{v.t?.startRowT}</td>
                          <td className="td" style={{ padding: "10px 14px", fontWeight: "var(--weight-medium)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
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
  </svg>{v.t?.startRow}</span>
                          </td>
                          <td className="td" style={{ padding: "10px 14px" }} />
                          <td className="td" style={{ padding: "10px 14px" }} />
                          <td className="td" style={{ padding: "10px 14px" }} />
                          <td className="td num" style={{ padding: "10px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{v.st?.open}</td>
                        </tr>
                        {__list(v.led).map((r, $index) => (<React.Fragment key={$index}>
                            <tr className="trow">
                              <td className="td num" style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{r?.time}</td>
                              <td className="td" style={{ padding: "10px 14px", fontWeight: "var(--weight-medium)" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  {r?.isSale ? (<>
                                    <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                                      <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                                      <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                                      <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                                      <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                                    </svg>
                                  </>) : null}
                                  {r?.isDue ? (<>
                                    <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                                      <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                                      <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                                      <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                                      <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </>) : null}
                                  {r?.isSup ? (<>
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
                                  </>) : null}
                                  {r?.isExp ? (<>
                                    <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
                                      <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
                                      <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
                                      <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
                                      <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                                    </svg>
                                  </>) : null}
                                  {r?.isStaff ? (<>
                                    <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                      <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                                      <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
                                      <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
                                      <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
                                      <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
                                    </svg>
                                  </>) : null}
                                  {r?.isBank ? (<>
                                    <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
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
                                  <span>{r?.dsc}</span>
                                </span>
                              </td>
                              <td className="td" style={{ padding: "10px 14px" }}>
                                <span className={r?.pcls}>{r?.ty}</span>
                              </td>
                              <td className="td num" style={{ padding: "10px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{r?.inn}</td>
                              <td className="td num" style={{ padding: "10px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{r?.out}</td>
                              <td className="td num" style={{ padding: "10px 14px", textAlign: "right", color: "#475569" }}>{r?.bal}</td>
                            </tr>
                          </React.Fragment>))}
                        <tr style={{ background: "#f8fafc" }}>
                          <td className="td" style={{ padding: "12px 14px" }} />
                          <td className="td" style={{ padding: "12px 14px", fontWeight: "var(--weight-semibold)" }}>{v.t?.dayTotal}</td>
                          <td className="td" style={{ padding: "12px 14px" }} />
                          <td className="td num" style={{ padding: "12px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.st?.inn}</td>
                          <td className="td num" style={{ padding: "12px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.st?.out}</td>
                          <td className="td num" style={{ padding: "12px 14px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#003087", fontSize: "var(--text-lg)" }}>{v.st?.end}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>) : null}
              {v.isExp ? (<>
                <div className="fade" style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                  <section className="card" style={{ flexGrow: "1", minWidth: "0", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px" }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
                        <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#0ea5e9" />
                        <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                        <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                        <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                        <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                        <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                        <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                        <path d="M31 35H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <h2 className="h2" style={{ flexGrow: "1" }}>{v.t?.recentExp}</h2>
                      {v.hasF ? (<>
                        <button type="button" className="chip on" onClick={v.clearF} aria-label={v.t?.clearF}>{v.fName} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18M6 6l12 12" />
</svg></button>
                      </>) : null}
                    </div>
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="th">{v.t?.eDate}</th>
                            <th className="th">{v.t?.eCat}</th>
                            <th className="th">{v.t?.eDesc}</th>
                            <th className="th">{v.t?.ePay}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.eAmt}</th>
                            <th className="th" style={{ textAlign: "center" }}>{v.t?.eRc}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.exps).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className="trow" style={__sx(`background: ${r?.rowBg ?? ""};`)}>
                                <td className="td num" style={{ color: "#475569", fontSize: "var(--text-sm)", whiteSpace: "nowrap" }}>{r?.dt}</td>
                                <td className="td">
                                  <span className="pill" style={__sx(`background: ${r?.bg ?? ""}; color: ${r?.fg ?? ""}; gap: 5px; padding-left: 8px;`)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={r?.d} />
  </svg>{r?.cat}</span>
                                </td>
                                <td className="td" style={{ fontWeight: "var(--weight-medium)" }}>{r?.desc}</td>
                                <td className="td">
                                  <span className={r?.pcls}>{r?.pay}</span>
                                </td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{r?.amt}</td>
                                <td className="td" style={{ textAlign: "center" }}>
                                  {r?.hasRc ? (<>
                                    <button type="button" className="ib" onClick={r?.seeRc} aria-label={v.t?.seeRc} style={{ width: "36px", height: "36px", color: "#003087", background: "#eef3fb", border: "0" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                                      </svg>
                                    </button>
                                  </>) : null}
                                  {r?.noRc ? (<>
                                    <span style={{ color: "var(--text-muted)" }}>—</span>
                                  </>) : null}
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                    {v.noExp ? (<>
                      <div style={{ padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "var(--text-sm-plus)" }}><svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
  <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#0ea5e9" />
  <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
  <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
  <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
  <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
  <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
  <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
  <path d="M31 35H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.noneF}</div>
                    </>) : null}
                    <div style={{ padding: "12px 18px", borderTop: "1px solid #eef2f6" }}>
                      <a href="#" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{v.t?.more18} ›</a>
                    </div>
                  </section>
                  <aside className="card gc-side" style={{ width: "330px", flexShrink: "0", padding: "18px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ padding: "0 4px 6px" }}>
                      <div className="lbl" style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
  <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
  <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
  <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
  <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
</svg>{v.t?.monthExp}</div>
                      <div className="num" style={{ fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.expTotal}</div>
                      <div className="hint">{v.t?.catHint}</div>
                    </div>
                    <button type="button" onClick={v.ck?.rent?.pick} aria-pressed={v.ck?.rent?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.rent?.bd ?? ""}; background: ${v.ck?.rent?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.rent?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
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
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.rent?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.rent?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.rent?.w ?? ""}; background: ${v.ck?.rent?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.elec?.pick} aria-pressed={v.ck?.elec?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.elec?.bd ?? ""}; background: ${v.ck?.elec?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.elec?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M4 24a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z" fill="#e0f2fe" />
                            <path d="M28 4L11 27L22 27L19 44L37 20L26 20L30 4Z" fill="#0ea5e9" />
                            <path d="M27 9L16 24L21 24Z" fill="#7dd3fc" />
                          </svg>
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.elec?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.elec?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.elec?.w ?? ""}; background: ${v.ck?.elec?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.salary?.pick} aria-pressed={v.ck?.salary?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.salary?.bd ?? ""}; background: ${v.ck?.salary?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.salary?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                            <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
                            <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
                            <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
                            <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
                          </svg>
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.salary?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.salary?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.salary?.w ?? ""}; background: ${v.ck?.salary?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.tea?.pick} aria-pressed={v.ck?.tea?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.tea?.bd ?? ""}; background: ${v.ck?.tea?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.tea?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M17 4c-2.5 3 2.5 5 0 9M25 4c-2.5 3 2.5 5 0 9" fill="none" stroke="#7dd3fc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 17H33V29a10 10 0 0 1 -10 10H17a10 10 0 0 1 -10 -10Z" fill="#0ea5e9" />
                            <path d="M33 21H36a5 5 0 0 1 0 10H32" fill="none" stroke="#003087" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9.5 16H30.5A2.5 2.5 0 0 1 33 18.5V18.5A2.5 2.5 0 0 1 30.5 21H9.5A2.5 2.5 0 0 1 7 18.5V18.5A2.5 2.5 0 0 1 9.5 16Z" fill="#003087" />
                            <path d="M12.5 24H12.5A1.5 1.5 0 0 1 14 25.5V31.5A1.5 1.5 0 0 1 12.5 33H12.5A1.5 1.5 0 0 1 11 31.5V25.5A1.5 1.5 0 0 1 12.5 24Z" fill="#7dd3fc" />
                            <path d="M5 40H39A2 2 0 0 1 41 42V42A2 2 0 0 1 39 44H5A2 2 0 0 1 3 42V42A2 2 0 0 1 5 40Z" fill="#003087" />
                          </svg>
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.tea?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.tea?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.tea?.w ?? ""}; background: ${v.ck?.tea?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.transport?.pick} aria-pressed={v.ck?.transport?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.transport?.bd ?? ""}; background: ${v.ck?.transport?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.transport?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.transport?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.transport?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.transport?.w ?? ""}; background: ${v.ck?.transport?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.net?.pick} aria-pressed={v.ck?.net?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.net?.bd ?? ""}; background: ${v.ck?.net?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.net?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M3 24a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z" fill="#e0f2fe" />
                            <path d="M9 21a21 21 0 0 1 30 0" fill="none" stroke="#0ea5e9" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14.5 27a13 13 0 0 1 19 0" fill="none" stroke="#0ea5e9" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.2 34a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#0ea5e9" />
                          </svg>
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.net?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.net?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.net?.w ?? ""}; background: ${v.ck?.net?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.repair?.pick} aria-pressed={v.ck?.repair?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.repair?.bd ?? ""}; background: ${v.ck?.repair?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.repair?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M17 16V12.5a2.5 2.5 0 0 1 2.5 -2.5H28.5a2.5 2.5 0 0 1 2.5 2.5V16" fill="none" stroke="#003087" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 15H40A4 4 0 0 1 44 19V38A4 4 0 0 1 40 42H8A4 4 0 0 1 4 38V19A4 4 0 0 1 8 15Z" fill="#003087" />
                            <path d="M8 15H40A4 4 0 0 1 44 19V21A4 4 0 0 1 40 25H8A4 4 0 0 1 4 21V19A4 4 0 0 1 8 15Z" fill="#003087" />
                            <path d="M4 20h40v5h-40Z" fill="#003087" />
                            <path d="M22 21H26A2 2 0 0 1 28 23V27A2 2 0 0 1 26 29H22A2 2 0 0 1 20 27V23A2 2 0 0 1 22 21Z" fill="#0ea5e9" />
                          </svg>
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.repair?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.repair?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.repair?.w ?? ""}; background: ${v.ck?.repair?.fg ?? ""};`)} />
                      </span>
                    </button>
                    <button type="button" onClick={v.ck?.other?.pick} aria-pressed={v.ck?.other?.on} style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-radius: var(--radius-xl); border: 1px solid ${v.ck?.other?.bd ?? ""}; background: ${v.ck?.other?.bgc ?? ""}; cursor: pointer; text-align: left; width: 100%;`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <span style={__sx(`width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${v.ck?.other?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M10 6H18A4 4 0 0 1 22 10V18A4 4 0 0 1 18 22H10A4 4 0 0 1 6 18V10A4 4 0 0 1 10 6Z" fill="#0ea5e9" />
                            <path d="M25 14a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
                            <path d="M14 26L22.5 41.5L5.5 41.5Z" fill="#0ea5e9" />
                            <path d="M30 26H38A4 4 0 0 1 42 30V38A4 4 0 0 1 38 42H30A4 4 0 0 1 26 38V30A4 4 0 0 1 30 26Z" fill="#0ea5e9" />
                          </svg>
                        </span>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.other?.l}</span>
                        <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.ck?.other?.v}</span>
                      </span>
                      <span className="bar" style={{ width: "100%" }}>
                        <span style={__sx(`width: ${v.ck?.other?.w ?? ""}; background: ${v.ck?.other?.fg ?? ""};`)} />
                      </span>
                    </button>
                  </aside>
                </div>
              </>) : null}
              {v.isPl ? (<>
                <div className="fade" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: "18px", alignItems: "start" }}>
                  <section className="card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M8.5 28H12.5A1.5 1.5 0 0 1 14 29.5V39.5A1.5 1.5 0 0 1 12.5 41H8.5A1.5 1.5 0 0 1 7 39.5V29.5A1.5 1.5 0 0 1 8.5 28Z" fill="#7dd3fc" />
                        <path d="M18.5 22H22.5A1.5 1.5 0 0 1 24 23.5V39.5A1.5 1.5 0 0 1 22.5 41H18.5A1.5 1.5 0 0 1 17 39.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#7dd3fc" />
                        <path d="M28.5 16H32.5A1.5 1.5 0 0 1 34 17.5V39.5A1.5 1.5 0 0 1 32.5 41H28.5A1.5 1.5 0 0 1 27 39.5V17.5A1.5 1.5 0 0 1 28.5 16Z" fill="#0ea5e9" />
                        <path d="M6 21L16 13L24 17L39 7" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M33 5.5L42.5 4.5L41 13.5Z" fill="#0ea5e9" />
                      </svg>
                      <h2 className="h2">{v.plTitle}</h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                      <span style={{ width: "24px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }} />
                      <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                        <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                        <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                        <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                        <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                      </svg>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.plSales}</div>
                        <div className="hint">{v.t?.plSalesH}</div>
                      </div>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{v.pl?.sales}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                      <span style={{ width: "24px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>−</span>
                      <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
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
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.plCogs}</div>
                        <div className="hint">{v.t?.plCogsH}</div>
                      </div>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#475569" }}>{v.pl?.cogs}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderTop: "2px solid #cbd5e1" }}>
                      <span style={{ width: "24px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>=</span>
                      <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M6 8a3 3 0 0 1 3 -3H22L43 26L27 42L6 21Z" fill="#0ea5e9" />
                        <path d="M9 9H21L39 27L27 39L9 21Z" fill="#7dd3fc" />
                        <path d="M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#ffffff" />
                      </svg>
                      <div style={{ flexGrow: "1", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.t?.plGross}</div>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{v.pl?.gross}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                      <span style={{ width: "24px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>−</span>
                      <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
                        <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
                        <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
                        <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
                        <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                      </svg>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.plExp}</div>
                        <div className="hint">{v.t?.plExpH} <button type="button" onClick={v.goExp} style={{ border: "0", background: "transparent", padding: "0", color: "#003087", fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs-plus)", cursor: "pointer" }}>{v.t?.seeExp} ›</button></div>
                      </div>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.pl?.exp}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", borderTop: "3px solid #047857" }}>
                      <span style={{ width: "24px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#047857" }}>=</span>
                      <span style={{ width: "46px", height: "46px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M8.5 28H12.5A1.5 1.5 0 0 1 14 29.5V39.5A1.5 1.5 0 0 1 12.5 41H8.5A1.5 1.5 0 0 1 7 39.5V29.5A1.5 1.5 0 0 1 8.5 28Z" fill="#7dd3fc" />
                          <path d="M18.5 22H22.5A1.5 1.5 0 0 1 24 23.5V39.5A1.5 1.5 0 0 1 22.5 41H18.5A1.5 1.5 0 0 1 17 39.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#7dd3fc" />
                          <path d="M28.5 16H32.5A1.5 1.5 0 0 1 34 17.5V39.5A1.5 1.5 0 0 1 32.5 41H28.5A1.5 1.5 0 0 1 27 39.5V17.5A1.5 1.5 0 0 1 28.5 16Z" fill="#0ea5e9" />
                          <path d="M6 21L16 13L24 17L39 7" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M33 5.5L42.5 4.5L41 13.5Z" fill="#0ea5e9" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#065f46" }}>{v.t?.plNet}</div>
                        <div style={{ fontSize: "var(--text-sm)", color: "#065f46" }}>{v.t?.plNetH}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.pl?.net}</span>
                        <span className="pill" style={{ background: "#fff", color: "#047857" }}>{v.pl?.pct}</span>
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                      <div>
                        <h2 className="h2">{v.t?.last6}</h2>
                        <div className="hint">{v.t?.last6H}</div>
                      </div>
                    </div>
                    <div style={{ height: "230px", display: "flex", alignItems: "flex-end", gap: "12px", paddingTop: "10px" }}>
                      {__list(v.months).map((m, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={m?.pick} aria-pressed={m?.on} style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px", border: "0", background: "transparent", cursor: "pointer", padding: "0" }}>
                            <span className="num" style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${m?.fg ?? ""};`)}>{m?.v}</span>
                            <span style={__sx(`width: 100%; height: ${m?.h ?? ""}; border-radius: var(--radius-lg) var(--radius-lg) 3px 3px; background: ${m?.bg ?? ""};`)} />
                            <span style={__sx(`font-size: var(--text-sm); font-weight: ${m?.fw ?? ""}; color: ${m?.fg ?? ""};`)}>{m?.l}</span>
                          </button>
                        </React.Fragment>))}
                    </div>
                    <div className="note n-ok num" style={{ marginTop: "6px", alignItems: "center" }}>
                      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                        <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                        <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                        <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                        <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{v.cmp}</span>
                    </div>
                  </section>
                </div>
              </>) : null}
              {v.drawerOpen ? (<>
                <div role="button" tabIndex={0} className="scrim" onClick={v.closeDrawer} />
                <section className="drawer fade" role="dialog" aria-label={v.t?.addExp}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 22px", borderBottom: "1px solid #eef2f6" }}>
                    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
                      <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#0ea5e9" />
                      <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                      <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                      <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                      <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                      <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                      <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                      <path d="M31 35H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.t?.addExp}</h2>
                      <div className="hint">{v.t?.drawerSub}</div>
                    </div>
                    <button type="button" className="ib" onClick={v.closeDrawer} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ flexGrow: "1", overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <label className="fld">
                      <span className="lbl">{v.t?.amt} <span className="req">*</span></span>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "76px", padding: "0 18px", border: "2px solid #003087", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                        <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>৳</span>
                        <input className="num" value={v.amtTxt} onInput={v.typeAmt} onChange={v.typeAmt} inputMode="numeric" placeholder={v.t?.zero} aria-label={v.t?.amt} style={{ flexGrow: "1", minWidth: "0", border: "0", outline: "none", background: "transparent", font: "inherit", fontSize: "var(--text-4xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }} />
                      </span>
                    </label>
                    <div className="fld">
                      <span className="lbl">{v.t?.whatFor}</span>
                      <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
                        <button type="button" onClick={v.dk?.rent?.pick} aria-pressed={v.dk?.rent?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.rent?.bd ?? ""}; background: ${v.dk?.rent?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.rent?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 18H39A1 1 0 0 1 40 19V41A1 1 0 0 1 39 42H9A1 1 0 0 1 8 41V19A1 1 0 0 1 9 18Z" fill="#e0f2fe" />
    <path d="M7 9H41A2 2 0 0 1 43 11V17A2 2 0 0 1 41 19H7A2 2 0 0 1 5 17V11A2 2 0 0 1 7 9Z" fill="#0ea5e9" />
    <path d="M11 9h6v10h-6Z" fill="#ffffff" />
    <path d="M23 9h6v10h-6Z" fill="#ffffff" />
    <path d="M35 9h5v10h-5Z" fill="#ffffff" />
    <path d="M21 28H28A1 1 0 0 1 29 29V41A1 1 0 0 1 28 42H21A1 1 0 0 1 20 41V29A1 1 0 0 1 21 28Z" fill="#0ea5e9" />
    <path d="M12.5 23H17.0A1 1 0 0 1 18.0 24V28A1 1 0 0 1 17.0 29H12.5A1 1 0 0 1 11.5 28V24A1 1 0 0 1 12.5 23Z" fill="#7dd3fc" />
    <path d="M32 23H36.5A1 1 0 0 1 37.5 24V28A1 1 0 0 1 36.5 29H32A1 1 0 0 1 31 28V24A1 1 0 0 1 32 23Z" fill="#7dd3fc" />
  </svg>
</span>{v.dk?.rent?.l}</button>
                        <button type="button" onClick={v.dk?.elec?.pick} aria-pressed={v.dk?.elec?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.elec?.bd ?? ""}; background: ${v.dk?.elec?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.elec?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M4 24a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z" fill="#e0f2fe" />
    <path d="M28 4L11 27L22 27L19 44L37 20L26 20L30 4Z" fill="#0ea5e9" />
    <path d="M27 9L16 24L21 24Z" fill="#7dd3fc" />
  </svg>
</span>{v.dk?.elec?.l}</button>
                        <button type="button" onClick={v.dk?.salary?.pick} aria-pressed={v.dk?.salary?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.salary?.bd ?? ""}; background: ${v.dk?.salary?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.salary?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
    <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
    <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
    <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
    <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
  </svg>
</span>{v.dk?.salary?.l}</button>
                        <button type="button" onClick={v.dk?.tea?.pick} aria-pressed={v.dk?.tea?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.tea?.bd ?? ""}; background: ${v.dk?.tea?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.tea?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 4c-2.5 3 2.5 5 0 9M25 4c-2.5 3 2.5 5 0 9" fill="none" stroke="#7dd3fc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 17H33V29a10 10 0 0 1 -10 10H17a10 10 0 0 1 -10 -10Z" fill="#0ea5e9" />
    <path d="M33 21H36a5 5 0 0 1 0 10H32" fill="none" stroke="#003087" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 16H30.5A2.5 2.5 0 0 1 33 18.5V18.5A2.5 2.5 0 0 1 30.5 21H9.5A2.5 2.5 0 0 1 7 18.5V18.5A2.5 2.5 0 0 1 9.5 16Z" fill="#003087" />
    <path d="M12.5 24H12.5A1.5 1.5 0 0 1 14 25.5V31.5A1.5 1.5 0 0 1 12.5 33H12.5A1.5 1.5 0 0 1 11 31.5V25.5A1.5 1.5 0 0 1 12.5 24Z" fill="#7dd3fc" />
    <path d="M5 40H39A2 2 0 0 1 41 42V42A2 2 0 0 1 39 44H5A2 2 0 0 1 3 42V42A2 2 0 0 1 5 40Z" fill="#003087" />
  </svg>
</span>{v.dk?.tea?.l}</button>
                        <button type="button" onClick={v.dk?.transport?.pick} aria-pressed={v.dk?.transport?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.transport?.bd ?? ""}; background: ${v.dk?.transport?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.transport?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
</span>{v.dk?.transport?.l}</button>
                        <button type="button" onClick={v.dk?.net?.pick} aria-pressed={v.dk?.net?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.net?.bd ?? ""}; background: ${v.dk?.net?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.net?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M3 24a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z" fill="#e0f2fe" />
    <path d="M9 21a21 21 0 0 1 30 0" fill="none" stroke="#0ea5e9" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 27a13 13 0 0 1 19 0" fill="none" stroke="#0ea5e9" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.2 34a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#0ea5e9" />
  </svg>
</span>{v.dk?.net?.l}</button>
                        <button type="button" onClick={v.dk?.repair?.pick} aria-pressed={v.dk?.repair?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.repair?.bd ?? ""}; background: ${v.dk?.repair?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.repair?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 16V12.5a2.5 2.5 0 0 1 2.5 -2.5H28.5a2.5 2.5 0 0 1 2.5 2.5V16" fill="none" stroke="#003087" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 15H40A4 4 0 0 1 44 19V38A4 4 0 0 1 40 42H8A4 4 0 0 1 4 38V19A4 4 0 0 1 8 15Z" fill="#003087" />
    <path d="M8 15H40A4 4 0 0 1 44 19V21A4 4 0 0 1 40 25H8A4 4 0 0 1 4 21V19A4 4 0 0 1 8 15Z" fill="#003087" />
    <path d="M4 20h40v5h-40Z" fill="#003087" />
    <path d="M22 21H26A2 2 0 0 1 28 23V27A2 2 0 0 1 26 29H22A2 2 0 0 1 20 27V23A2 2 0 0 1 22 21Z" fill="#0ea5e9" />
  </svg>
</span>{v.dk?.repair?.l}</button>
                        <button type="button" onClick={v.dk?.other?.pick} aria-pressed={v.dk?.other?.on} style={__sx(`display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; min-height: 92px; border-radius: var(--radius-xl); border: 2px solid ${v.dk?.other?.bd ?? ""}; background: ${v.dk?.other?.bgc ?? ""}; cursor: pointer; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); line-height: 18px; text-align: center; color: #0f172a;`)}><span style={__sx(`width: 46px; height: 46px; border-radius: var(--radius-xl); background: ${v.dk?.other?.bg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
  <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10 6H18A4 4 0 0 1 22 10V18A4 4 0 0 1 18 22H10A4 4 0 0 1 6 18V10A4 4 0 0 1 10 6Z" fill="#0ea5e9" />
    <path d="M25 14a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
    <path d="M14 26L22.5 41.5L5.5 41.5Z" fill="#0ea5e9" />
    <path d="M30 26H38A4 4 0 0 1 42 30V38A4 4 0 0 1 38 42H30A4 4 0 0 1 26 38V30A4 4 0 0 1 30 26Z" fill="#0ea5e9" />
  </svg>
</span>{v.dk?.other?.l}</button>
                      </div>
                    </div>
                    <div className="fld">
                      <span className="lbl">{v.t?.paidFrom}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" className={v.dp?.cash?.cls} aria-pressed={v.dp?.cash?.on} onClick={v.dp?.cash?.pick} style={{ height: "44px", flex: "1", justifyContent: "center" }}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
</svg>{v.dp?.cash?.l}</button>
                        <button type="button" className={v.dp?.bkash?.cls} aria-pressed={v.dp?.bkash?.on} onClick={v.dp?.bkash?.pick} style={{ height: "44px", flex: "1", justifyContent: "center" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#fbe3ef", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
    <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
    <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
    <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
    <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
    <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
  </svg>
</span>{v.dp?.bkash?.l}</button>
                        <button type="button" className={v.dp?.bank?.cls} aria-pressed={v.dp?.bank?.on} onClick={v.dp?.bank?.pick} style={{ height: "44px", flex: "1", justifyContent: "center" }}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M4 17L24 5L44 17Z" fill="#0ea5e9" />
  <path d="M7 16H41A1 1 0 0 1 42 17V19A1 1 0 0 1 41 20H7A1 1 0 0 1 6 19V17A1 1 0 0 1 7 16Z" fill="#003087" />
  <path d="M9 21h4.5v14h-4.5Z" fill="#7dd3fc" />
  <path d="M17 21h4.5v14h-4.5Z" fill="#7dd3fc" />
  <path d="M26.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
  <path d="M34.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
  <path d="M6.5 35H41.5A1.5 1.5 0 0 1 43 36.5V39.5A1.5 1.5 0 0 1 41.5 41H6.5A1.5 1.5 0 0 1 5 39.5V36.5A1.5 1.5 0 0 1 6.5 35Z" fill="#003087" />
  <path d="M21.8 12.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z" fill="#7dd3fc" />
</svg>{v.dp?.bank?.l}</button>
                      </div>
                    </div>
                    <label className="fld">
                      <span className="lbl">{v.t?.note}</span>
                      <input className="inp" value={v.note} onInput={v.typeNote} onChange={v.typeNote} placeholder={v.t?.notePh} aria-label={v.t?.note} />
                    </label>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "12px" }}>
                      <label className="fld">
                        <span className="lbl">{v.t?.date}</span>
                        <input className="inp num" defaultValue={v.dateVal} aria-label={v.t?.date} />
                      </label>
                      <div className="fld">
                        <span className="lbl">{v.t?.receipt}</span>
                        <button type="button" onClick={v.togglePhoto} aria-pressed={v.photoOn} style={__sx(`height: 48px; border-radius: var(--radius-xl); border: 2px dashed ${v.ph?.bd ?? ""}; background: ${v.ph?.bg ?? ""}; color: ${v.ph?.fg ?? ""}; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: var(--text-sm-plus); font-weight: var(--weight-semibold); cursor: pointer;`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
</svg>{v.ph?.l}</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f8fafc", border: "1px solid #e6eaf0" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.t?.recur}</div>
                        <div className="hint">{v.recHint}</div>
                      </div>
                      <button type="button" className={v.rec?.cls} aria-pressed={v.rec?.on} aria-label={v.t?.recur} onClick={v.rec?.toggle} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", padding: "14px 22px 18px", borderTop: "1px solid #eef2f6" }}>
                    <button type="button" className="btn line big" onClick={v.closeDrawer}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18M6 6l12 12" />
</svg>{v.t?.cancel}</button>
                    <button type="button" className="btn solid big" onClick={v.saveExp} style={{ flexGrow: "1" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.saveLbl}</button>
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
