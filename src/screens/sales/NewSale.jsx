'use client';
// Generated from design/templates/sales/NewSale.dc.html by scripts/convert-design.mjs.
// New sale — Sales — New sale. Imported from Retail Commerce and merged.
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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["নতুন বেচা", "New sale"], "memoNo": ["মেমো নং", "Memo no."], "scan": ["প্রোডাক্টের নাম লিখুন বা বারকোড স্ক্যান করুন", "Type a product name or scan a barcode"], "inStock": ["স্টকে", "in stock"], "customer": ["কাস্টমার", "Customer"], "walkin": ["হেঁটে আসা কাস্টমার", "Walk-in customer"], "changeCust": ["বদলান", "Change"], "oldDue": ["আগের বাকি", "Previous due"], "items": ["যা যা নিচ্ছে", "Items"], "empty": ["বাম পাশ থেকে প্রোডাক্ট বাছুন বা স্ক্যান করুন", "Pick products on the left or scan them"], "subtotal": ["মোট", "Subtotal"], "discount": ["ছাড়", "Discount"], "vat": ["ভ্যাট (৫%)", "VAT (5%)"], "grand": ["সর্বমোট", "Grand total"], "howPay": ["কীভাবে টাকা দিচ্ছে?", "How are they paying?"], "received": ["কত টাকা পেলেন", "Amount received"], "change": ["ফেরত দিন", "Give change"], "willDue": ["বাকি থাকবে", "Will stay due"], "hold": ["পরে করব (হোল্ড)", "Hold for later"], "finish": ["বেচা শেষ · মেমো প্রিন্ট", "Finish sale · print memo"], "dueWarn": ["বাকিতে বেচতে কাস্টমারের নাম ও মোবাইল লাগবে", "To sell on due, add the customer’s name and mobile"], "remove": ["বাদ দিন", "Remove"], "all": ["সব", "All"], "pageTitle": ["নতুন বেচা", "New sale"]};
var AI = [["২টা চিনি আর ১টা তেল যোগ করো", "Add 2 sugar and 1 oil", "যোগ করলাম: চিনি ১ কেজি × ২, সয়াবিন তেল ৫ লি. × ১। সর্বমোট এখন দেখুন ডান পাশে।", "Added: Lightning cable 1 m × 2, 20W USB-C fast charger × 1. See the new total on the right."], ["করিম সাহেবের নামে বাকিতে দাও", "Put it on Karim Saheb’s due", "কাস্টমার করিম সাহেব বাছলাম। আগের বাকি ৳১৮,৫০০ — এই মেমো যোগ হলে মোট বাকি বাড়বে।", "Customer set to Karim Saheb. He already owes ৳18,500 — this memo will add to it."], ["৫০ টাকা ছাড় দাও", "Give 50 taka discount", "ঠিক আছে, ৳৫০ ছাড় দিলাম।", "Done — ৳50 discount applied."]];
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

var P = [
  ['p1', 'মিনিকেট চাল ২৫ কেজি', 'Power bank 20,000 mAh', 1950, 18, 'বস্তা', 'box', 'rice'],
  ['p2', 'সয়াবিন তেল ৫ লি.', '20W USB-C fast charger', 890, 3, 'বোতল', 'pc', 'oil'],
  ['p3', 'চিনি ১ কেজি', 'Lightning cable 1 m', 135, 64, 'প্যাকেট', 'pack', 'rice'],
  ['p4', 'মসুর ডাল ১ কেজি', 'Micro-USB cable 1 m', 145, 40, 'প্যাকেট', 'pack', 'rice'],
  ['p5', 'লবণ ১ কেজি', 'SIM ejector pin pack', 42, 90, 'প্যাকেট', 'pack', 'oil'],
  ['p6', 'হলুদ গুঁড়া ২০০ গ্রাম', 'Pop-up phone grip', 95, 26, 'প্যাকেট', 'pack', 'oil'],
  ['p7', 'লাক্স সাবান ১০০ গ্রাম', 'Screen cleaning wipes', 65, 55, 'পিস', 'pc', 'soap'],
  ['p8', 'ডিটারজেন্ট ১ কেজি', 'Shockproof case A15', 180, 12, 'প্যাকেট', 'pack', 'soap'],
  ['p9', 'শ্যাম্পু ১৮০ মি.লি.', 'Cleaning spray 100 ml', 240, 9, 'বোতল', 'pc', 'soap'],
  ['p10', 'বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 60, 72, 'প্যাকেট', 'pack', 'snack'],
  ['p11', 'চানাচুর ৩০০ গ্রাম', 'USB-C OTG adapter', 85, 30, 'প্যাকেট', 'pack', 'snack'],
  ['p12', 'পানি ২ লি.', 'Cable protector pack', 35, 120, 'বোতল', 'pc', 'drink']
];
var CATS = [['all', 'সব', 'All'], ['rice', 'চাল-ডাল-চিনি', 'Cables & chargers'], ['oil', 'তেল-মসলা', 'Cases & covers'], ['soap', 'সাবান-শ্যাম্পু', 'Screen care'], ['snack', 'বিস্কুট-চানাচুর', 'Audio'], ['drink', 'পানীয়', 'Power banks']];
var BGS = [['#eef3fb', '#003087'], ['#e7f8f1', '#047857'], ['#fff4e0', '#a14f06'], ['#fdecf5', '#a3195b']];
var byId = {}; P.forEach(function (p) { byId[p[0]] = p; });
var cart = s.cart || [['p1', 1], ['p2', 2], ['p3', 3]];
var cat = s.cat || 'all', q = s.q || '';
var setQty = function (id, d) { var nc = cart.map(function (x) { return x[0] === id ? [x[0], x[1] + d] : x; }).filter(function (x) { return x[1] > 0; }); self.setState({ cart: nc }); };
var add = function (id) { var f = cart.filter(function (x) { return x[0] === id; })[0]; if (f) setQty(id, 1); else self.setState({ cart: cart.concat([[id, 1]]) }); };
var sub = cart.reduce(function (n, x) { return n + byId[x[0]][3] * x[1]; }, 0);
var disc = s.disc == null ? 50 : s.disc;
var vat = Math.round((sub - disc) * 0.05);
var grand = Math.max(0, sub - disc + vat);
var pay = s.pay || 'cash';
var recv = s.recv == null ? (pay === 'due' ? 0 : Math.ceil(grand / 100) * 100) : s.recv;
var diff = recv - grand;
var cust = s.cust || 'walk';
var custs = { walk: [L('হেঁটে আসা কাস্টমার', 'Walk-in customer'), '?', 0], karim: [L('করিম সাহেব · ০১৭১১-২৩৪৫৬৭', 'Karim Saheb · 01711-234567'), L('ক', 'K'), 18500] };
var cu = custs[cust];
var payList = seg(self, [['cash', 'ক্যাশ', 'Cash'], ['bkash', 'বিকাশ', 'bKash'], ['nagad', 'নগদ', 'Nagad'], ['card', 'কার্ড', 'Card'], ['due', 'বাকি', 'Due']], pay, 'pay', i, 'chip');
var pm = {}; ['cash', 'bkash', 'nagad', 'card', 'due'].forEach(function (k, j) { pm[k] = payList[j]; });
return {
  memo: dg('#1043', bn), today: L('আজ, ২৯ সেপ্টেম্বর · সকাল ১০:৪৫', 'Today, 29 Sep · 10:45 AM'),
  q: q, typeQ: function (e) { self.setState({ q: e.target.value }); },
  cats: seg(self, CATS, cat, 'cat', i, 'chip'),
  prods: P.filter(function (p) { return (cat === 'all' || p[7] === cat) && (!q || (p[1] + p[2]).toLowerCase().indexOf(q.toLowerCase()) >= 0); }).map(function (p, j) {
    var inCart = cart.filter(function (x) { return x[0] === p[0]; }).length > 0; var b = BGS[j % 4];
    return { name: p[1 + i], ini: p[1 + i].slice(0, 1), price: money(p[3], bn), stock: dg(p[4], bn) + ' ' + t.inStock, sfg: p[4] <= 5 ? '#b83210' : '#64748b', bg: b[0], fg: b[1], bd: inCart ? '#003087' : '#e6eaf0', add: function () { add(p[0]); } };
  }),
  custName: cu[0], custIni: cu[1], custBg: cust === 'walk' ? '#eef2f6' : '#e0e9f7', custFg: cust === 'walk' ? '#64748b' : '#003087',
  hasOldDue: cu[2] > 0, oldDue: money(cu[2], bn),
  switchCust: function () { self.setState({ cust: cust === 'walk' ? 'karim' : 'walk' }); },
  lineCount: dg(cart.length, bn) + L('টা আইটেম', ' items'), isEmpty: cart.length === 0,
  lines: cart.map(function (x) { var p = byId[x[0]]; return { name: p[1 + i], unit: money(p[3], bn) + ' / ' + p[5 + i], qty: dg(x[1], bn), total: money(p[3] * x[1], bn), inc: function () { setQty(x[0], 1); }, dec: function () { setQty(x[0], -1); } }; }),
  sub: money(sub, bn), discTxt: dg(disc, bn), typeDisc: function (e) { self.setState({ disc: num(unbn(e.target.value)) }); },
  vat: money(vat, bn), grand: money(grand, bn),
  pays: payList, pm: pm, isChange: diff >= 0, isShort: diff < 0,
  recvTxt: dg(recv, bn), typeRecv: function (e) { self.setState({ recv: num(unbn(e.target.value)) }); },
  resLbl: diff >= 0 ? t.change : t.willDue, resVal: money(Math.abs(diff), bn),
  resBg: diff >= 0 ? '#e7f8f1' : '#ffece6', resFg: diff >= 0 ? '#047857' : '#b83210',
  needCust: diff < 0 && cust === 'walk',
  hold: function () { toast(self, L('মেমো হোল্ড করা হলো। পরে "বেচার খাতা" থেকে খুলুন।', 'Memo put on hold. Open it later from the sales book.')); },
  finish: function () { if (diff < 0 && cust === 'walk') { toast(self, t.dueWarn); return; } toast(self, L('বেচা সেভ হলো, মেমো প্রিন্ট হচ্ছে।', 'Sale saved. Printing memo…')); self.setState({ cart: [], recv: null, disc: 0 }); }
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

export default class NewSaleScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewSale">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="sales-new" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb="Sales" page="New sale" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                    <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                    <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                    <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                    <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.h}</h1>
                  <div className="sub num">{v.t?.memoNo} {v.memo} · {v.today}</div>
                </div>
                <__Link href="/sales-book" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
</svg>{v.t?.nSalesBook}</__Link>
              </div>
              <div style={{ display: "flex", gap: "18px", flexGrow: "1", minHeight: "0" }}>
                <section style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label style={{ height: "60px", display: "flex", alignItems: "center", gap: "12px", padding: "0 8px 0 18px", border: "2px solid #003087", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
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
                    <input value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder={v.t?.scan} aria-label={v.t?.scan} style={{ flexGrow: "1", border: "0", outline: "none", font: "inherit", fontSize: "var(--text-lg)", background: "transparent" }} />
                    <button type="button" className="ib" onClick={v.openAi} aria-label={v.t?.voiceSearch} style={{ border: "0", background: "#eef3fb", color: "#003087" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 2h6v12H9zM5 10a7 7 0 0 0 14 0M12 17v5" />
                      </svg>
                    </button>
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {__list(v.cats).map((ct, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={ct?.cls} aria-pressed={ct?.on} onClick={ct?.pick}>{ct?.l}</button>
                      </React.Fragment>))}
                  </div>
                  <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                    {__list(v.prods).map((p, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={p?.add} style={__sx(`display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 14px; border-radius: var(--radius-xl); border: 1px solid ${p?.bd ?? ""}; background: #fff; cursor: pointer; text-align: left; min-height: 124px;`)}>
                          <span style={__sx(`width: 40px; height: 40px; border-radius: var(--radius-xl); background: ${p?.bg ?? ""}; color: ${p?.fg ?? ""}; font-size: var(--text-lg); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{p?.ini}</span>
                          <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "20px" }}>{p?.name}</span>
                          <span style={{ display: "flex", width: "100%", alignItems: "baseline" }}>
                            <span className="num" style={{ flexGrow: "1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{p?.price}</span>
                            <span className="num" style={__sx(`font-size: var(--text-xs-plus); color: ${p?.sfg ?? ""}; font-weight: var(--weight-medium);`)}>{p?.stock}</span>
                          </span>
                        </button>
                      </React.Fragment>))}
                  </div>
                </section>
                <aside className="card gc-side" style={{ width: "440px", flexShrink: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={__sx(`width: 42px; height: 42px; border-radius: var(--radius-full); background: ${v.custBg ?? ""}; color: ${v.custFg ?? ""}; font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{v.custIni}</span>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div className="hint">{v.t?.customer}</div>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.custName}</div>
                      {v.hasOldDue ? (<>
                        <div className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#b83210", fontWeight: "var(--weight-medium)" }}>{v.t?.oldDue} {v.oldDue}</div>
                      </>) : null}
                    </div>
                    <button type="button" className="btn line sm" onClick={v.switchCust}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" />
</svg>{v.t?.changeCust}</button>
                  </div>
                  <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: "8px" }} className="hint">
                    <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                      <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                      <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                      <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                      <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                    </svg>
                    <span>{v.t?.items} · {v.lineCount}</span>
                  </div>
                  <div style={{ flexGrow: "1", overflow: "hidden", padding: "4px 8px" }}>
                    {v.isEmpty ? (<>
                      <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm-plus)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
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
                        <span>{v.t?.empty}</span>
                      </div>
                    </>) : null}
                    {__list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{l?.name}</div>
                            <div className="num hint">{l?.unit}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                            <button type="button" className="ib" onClick={l?.dec} aria-label="−" style={{ width: "36px", height: "36px", border: "0", fontSize: "var(--text-xl)" }}>−</button>
                            <span className="num" style={{ minWidth: "30px", textAlign: "center", fontWeight: "var(--weight-semibold)" }}>{l?.qty}</span>
                            <button type="button" className="ib" onClick={l?.inc} aria-label="+" style={{ width: "36px", height: "36px", border: "0", fontSize: "var(--text-xl)" }}>+</button>
                          </div>
                          <span className="num" style={{ width: "86px", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{l?.total}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #eef2f6", display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-sm-plus)" }}>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.subtotal}</span>
                      <span className="num">{v.sub}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.discount}</span>
                      <input className="inp num" value={v.discTxt} onInput={v.typeDisc} onChange={v.typeDisc} aria-label={v.t?.discount} style={{ width: "110px", height: "36px", textAlign: "right" }} />
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1", color: "#475569" }}>{v.t?.vat}</span>
                      <span className="num">{v.vat}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", paddingTop: "6px", borderTop: "1px dashed #cbd5e1" }}>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.t?.grand}</span>
                      <span className="num" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.grand}</span>
                    </div>
                  </div>
                  <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span className="lbl">{v.t?.howPay}</span>
                    <div className="gc-cols-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "6px" }}>
                      <button type="button" className={v.pm?.cash?.cls} aria-pressed={v.pm?.cash?.on} onClick={v.pm?.cash?.pick} style={{ height: "68px", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px", borderRadius: "var(--radius-lg)" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#e7f8f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                            <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                            <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                            <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                            <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                            <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                          </svg>
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>{v.pm?.cash?.l}</span>
                      </button>
                      <button type="button" className={v.pm?.bkash?.cls} aria-pressed={v.pm?.bkash?.on} onClick={v.pm?.bkash?.pick} style={{ height: "68px", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px", borderRadius: "var(--radius-lg)" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#e2136e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
                            <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
                            <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
                            <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
                            <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
                            <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
                          </svg>
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>{v.pm?.bkash?.l}</span>
                      </button>
                      <button type="button" className={v.pm?.nagad?.cls} aria-pressed={v.pm?.nagad?.on} onClick={v.pm?.nagad?.pick} style={{ height: "68px", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px", borderRadius: "var(--radius-lg)" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#f26522", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
                            <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
                            <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
                            <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
                            <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
                            <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
                          </svg>
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>{v.pm?.nagad?.l}</span>
                      </button>
                      <button type="button" className={v.pm?.card?.cls} aria-pressed={v.pm?.card?.on} onClick={v.pm?.card?.pick} style={{ height: "68px", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px", borderRadius: "var(--radius-lg)" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M7.5 10H40.5A4.5 4.5 0 0 1 45 14.5V33.5A4.5 4.5 0 0 1 40.5 38H7.5A4.5 4.5 0 0 1 3 33.5V14.5A4.5 4.5 0 0 1 7.5 10Z" fill="#0ea5e9" />
                            <path d="M3 16h42v6h-42Z" fill="#003087" />
                            <path d="M9.8 26H15.2A1.8 1.8 0 0 1 17 27.8V31.2A1.8 1.8 0 0 1 15.2 33H9.8A1.8 1.8 0 0 1 8 31.2V27.8A1.8 1.8 0 0 1 9.8 26Z" fill="#7dd3fc" />
                            <path d="M22.3 28H37.7A1.3 1.3 0 0 1 39 29.3V29.3A1.3 1.3 0 0 1 37.7 30.6H22.3A1.3 1.3 0 0 1 21 29.3V29.3A1.3 1.3 0 0 1 22.3 28Z" fill="#ffffff" />
                          </svg>
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>{v.pm?.card?.l}</span>
                      </button>
                      <button type="button" className={v.pm?.due?.cls} aria-pressed={v.pm?.due?.on} onClick={v.pm?.due?.pick} style={{ height: "68px", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px", borderRadius: "var(--radius-lg)" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#ffece6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                            <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
                            <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
                            <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
                            <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>{v.pm?.due?.l}</span>
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                      <label className="fld" style={{ flexGrow: "1" }}>
                        <span className="lbl">{v.t?.received}</span>
                        <input className="inp num" value={v.recvTxt} onInput={v.typeRecv} onChange={v.typeRecv} aria-label={v.t?.received} style={{ height: "52px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }} />
                      </label>
                      <div style={__sx(`width: 180px; height: 52px; border-radius: var(--radius-xl); background: ${v.resBg ?? ""}; color: ${v.resFg ?? ""}; display: flex; align-items: center; gap: 8px; padding: 0 10px;`)}>
                        {v.isChange ? (<>
                          <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                            <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                            <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                            <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                            <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        {v.isShort ? (<>
                          <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                            <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
                            <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
                            <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
                            <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>) : null}
                        <span style={{ display: "flex", flexDirection: "column", minWidth: "0" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{v.resLbl}</span>
                          <span className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{v.resVal}</span>
                        </span>
                      </div>
                    </div>
                    {v.needCust ? (<>
                      <div className="note n-due fade" style={{ alignItems: "center" }}>
                        <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M24.5 15a6.5 6.5 0 1 0 13.0 0a6.5 6.5 0 1 0 -13.0 0Z" fill="#7dd3fc" />
                          <path d="M29.5 23H33.5A8.5 8.5 0 0 1 42 31.5V31.5A8.5 8.5 0 0 1 33.5 40H29.5A8.5 8.5 0 0 1 21 31.5V31.5A8.5 8.5 0 0 1 29.5 23Z" fill="#0ea5e9" />
                          <path d="M10.5 17a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                          <path d="M14.5 26H21.5A8.5 8.5 0 0 1 30 34.5V34.5A8.5 8.5 0 0 1 21.5 43H14.5A8.5 8.5 0 0 1 6 34.5V34.5A8.5 8.5 0 0 1 14.5 26Z" fill="#0ea5e9" />
                        </svg>
                        <span>{v.t?.dueWarn}</span>
                      </div>
                    </>) : null}
                  </div>
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px" }}>
                    <button type="button" className="btn line" onClick={v.hold}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />
</svg>{v.t?.hold}</button>
                    <button type="button" className="btn okb big" onClick={v.finish} style={{ flexGrow: "1" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.t?.finish}</button>
                  </div>
                </aside>
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
