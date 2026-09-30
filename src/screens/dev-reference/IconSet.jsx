'use client';
// Generated from design/templates/dev-reference/IconSet.dc.html by scripts/convert-design.mjs.
// Icon set — Developer reference — Icon set. Imported from Retail Commerce and merged.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

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
var T = {"menu": ["মেনু", "Menu"], "shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "branch": ["মিরপুর শাখা", "Mirpur branch"], "newSale": ["নতুন বেচা", "New sale"], "gDaily": ["প্রতিদিনের কাজ", "Daily work"], "gGoods": ["মাল ও স্টক", "Goods & stock"], "gPeople": ["মানুষজন", "People"], "gAccounts": ["হিসাব", "Accounts"], "nHome": ["হোম", "Home"], "nSalesBook": ["বেচার খাতা", "Sales book"], "nInvoices": ["পাইকারি ও ইনভয়েস", "Wholesale & invoices"], "nReturn": ["ফেরত ও বদল", "Return & exchange"], "nPurchase": ["মাল কেনা", "Purchase"], "nMoney": ["টাকা আসা-যাওয়া", "Money in & out"], "nProducts": ["প্রোডাক্ট", "Products"], "nCategories": ["ক্যাটাগরি", "Categories"], "nBarcode": ["বারকোড", "Barcodes"], "nStock": ["স্টক ও গুদাম", "Stock & warehouses"], "nDamage": ["ড্যামেজ ও মেয়াদ শেষ", "Damaged & expired"], "nWarranty": ["ওয়ারেন্টি", "Warranty"], "nCatalog": ["ক্যাটালগ", "Catalogue"], "nCustomers": ["কাস্টমার ও বাকি", "Customers & dues"], "nSuppliers": ["সাপ্লায়ার ও দেনা", "Suppliers & payables"], "nStaff": ["স্টাফ", "Staff"], "nBook": ["হিসাব খাতা ও খরচ", "Cash book & expenses"], "nVat": ["ভ্যাট", "VAT"], "nReports": ["রিপোর্ট", "Reports"], "nPos": ["POS খুলুন", "Open POS"], "nSettings": ["সেটিংস", "Settings"], "search": ["প্রোডাক্ট, কাস্টমার বা মেমো নম্বর খুঁজুন", "Search products, customers or memo no."], "voiceSearch": ["কথা বলে খুঁজুন", "Search by voice"], "notif": ["নোটিফিকেশন", "Notifications"], "owner": ["মোস্তাফিজ", "Mostafiz"], "ownerInitial": ["মো", "M"], "role": ["মালিক", "Owner"], "aiAsk": ["কথা বলুন", "Ask by voice"], "aiTitle": ["গ্রিড সহকারী", "Grid assistant"], "aiSub": ["বাংলায় বলুন বা লিখুন — যেকোনো স্ক্রিন থেকে", "Speak or type — from any screen"], "close": ["বন্ধ করুন", "Close"], "aiType": ["এখানে লিখুন…", "Type here…"], "aiSpeak": ["কথা বলুন", "Speak"], "back": ["পেছনে", "Back"], "tHome": ["হোম", "Home"], "tSales": ["বেচা", "Sales"], "tStock": ["স্টক", "Stock"], "tMore": ["আরও", "More"], "save": ["সেভ করুন", "Save"], "cancel": ["বাতিল", "Cancel"], "seeAll": ["সব দেখুন", "See all"], "h": ["রিটেইল আইকন সেট", "Retail icon set"], "sub": ["সব স্ক্রিনে এই রঙিন আইকনগুলো ব্যবহার হয় — কোড নামসহ, ডেভেলপারদের জন্য", "Icons in navy, sky and white, used across all screens — with code names for developers"], "m_cart": ["মাল কেনা", "Purchase"], "m_bag": ["বেচা", "Sale"], "m_bookBuy": ["কেনার খাতা", "Purchase book"], "m_bookSale": ["বেচার খাতা", "Sales book"], "m_bookDue": ["বাকির খাতা", "Due book"], "m_bookExp": ["খরচের খাতা", "Expense book"], "m_bookCash": ["হিসাব খাতা", "Cash book"], "m_contacts": ["কাস্টমার ও সাপ্লায়ার", "Contacts"], "m_box": ["প্রোডাক্ট", "Product"], "m_stock": ["স্টক", "Stock"], "m_report": ["রিপোর্ট", "Report"], "m_cashbox": ["ক্যাশ বক্স / POS", "Cash box / POS"], "m_money": ["টাকা আসা-যাওয়া", "Money in & out"], "m_moneyIn": ["টাকা পেলাম", "Money received"], "m_moneyOut": ["টাকা দিলাম", "Money paid"], "m_cash": ["ক্যাশ", "Cash"], "m_return": ["ফেরত ও বদল", "Return"], "m_invoice": ["ইনভয়েস / মেমো", "Invoice / memo"], "m_scan": ["বারকোড স্ক্যান", "Scan"], "m_shield": ["ওয়ারেন্টি", "Warranty"], "m_expired": ["মেয়াদ শেষ", "Expired"], "m_damage": ["ড্যামেজ পণ্য", "Damaged goods"], "m_catalog": ["ক্যাটালগ", "Catalogue"], "m_staff": ["স্টাফ", "Staff"], "m_vat": ["ভ্যাট", "VAT"], "m_warehouse": ["গুদাম", "Warehouse"], "m_shop": ["দোকান / শাখা", "Shop / branch"], "m_category": ["ক্যাটাগরি", "Category"], "m_printer": ["প্রিন্টার", "Printer"], "m_settings": ["সেটিংস", "Settings"], "m_help": ["সাহায্য", "Help"], "m_sms": ["SMS / তাগাদা", "SMS / reminder"], "m_truck": ["সাপ্লায়ার", "Supplier"], "m_due": ["কাস্টমারের বাকি", "Customer due"], "m_wallet": ["খরচ", "Expense"], "m_profit": ["লাভ", "Profit"], "m_mic": ["কথা বলে কাজ (AI)", "Voice / AI"], "m_calendar": ["তারিখ / শোধের দিন", "Date / due date"], "m_clock": ["হাজিরা / সময়", "Attendance / time"], "m_lock": ["অনুমতি / লক", "Access / lock"], "m_tag": ["দাম / ট্যাগ", "Price / tag"], "m_rack": ["র‍্যাক ও তাক", "Rack & shelf"], "m_pin": ["ঠিকানা", "Location"], "m_bell": ["নোটিফিকেশন", "Notification"], "m_discount": ["ছাড়", "Discount"], "m_phone": ["মোবাইল ব্যাংকিং", "Mobile banking"], "m_barcodeLabel": ["বারকোড লেবেল", "Barcode label"], "m_handshake": ["পাইকারি / ডিল", "Wholesale / deal"], "m_people": ["কাস্টমার দল", "Customer group"], "m_bank": ["ব্যাংক", "Bank"], "m_card": ["কার্ড", "Card"], "m_home": ["হোম", "Home"], "pageTitle": ["আইকন সেট", "Icon set"]};
var AI = [["আজকে কত টাকার বেচা হলো?", "How much did we sell today?", "আজকে এখন পর্যন্ত ৳৪৮,৬৫০ টাকার বেচা হয়েছে, ৬২টা মেমো। গতকালের চেয়ে ১২% বেশি।", "So far today: ৳48,650 across 62 memos — 12% more than yesterday."], ["কার কাছে বাকি সবচেয়ে বেশি?", "Who owes me the most?", "সবচেয়ে বেশি বাকি করিম সাহেবের — ৳১৮,৫০০, ৪২ দিন ধরে। বলুন \"তাগাদা পাঠাও\", আমি SMS পাঠিয়ে দেব।", "Karim Saheb owes the most — ৳18,500 for 42 days. Say \"send reminder\" and I will SMS him."], ["কোন মাল শেষ হয়ে যাচ্ছে?", "What is running out?", "৭টা মাল প্রায় শেষ। সবচেয়ে জরুরি সয়াবিন তেল ৫ লি. — মাত্র ৩টা আছে।", "7 items are nearly out. Most urgent: 20W USB-C fast charger — only 3 left."]];
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
return {};
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
`;

// ---- markup ----

export default class IconSetScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="IconSet">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={v.rootCls} style={{ width: "1440px", height: "1000px", position: "relative", background: "#e9eef5", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M6 8H22A2 2 0 0 1 24 10V39A2 2 0 0 1 22 41H6A2 2 0 0 1 4 39V10A2 2 0 0 1 6 8Z" fill="#e0f2fe" />
                <path d="M26 8H42A2 2 0 0 1 44 10V39A2 2 0 0 1 42 41H26A2 2 0 0 1 24 39V10A2 2 0 0 1 26 8Z" fill="#7dd3fc" />
                <path d="M23 8h2v33h-2Z" fill="#003087" />
                <path d="M9.0 12H12.5A1.5 1.5 0 0 1 14.0 13.5V17.0A1.5 1.5 0 0 1 12.5 18.5H9.0A1.5 1.5 0 0 1 7.5 17.0V13.5A1.5 1.5 0 0 1 9.0 12Z" fill="#0ea5e9" />
                <path d="M16.5 12H20.0A1.5 1.5 0 0 1 21.5 13.5V17.0A1.5 1.5 0 0 1 20.0 18.5H16.5A1.5 1.5 0 0 1 15 17.0V13.5A1.5 1.5 0 0 1 16.5 12Z" fill="#0ea5e9" />
                <path d="M9.0 21H12.5A1.5 1.5 0 0 1 14.0 22.5V26.0A1.5 1.5 0 0 1 12.5 27.5H9.0A1.5 1.5 0 0 1 7.5 26.0V22.5A1.5 1.5 0 0 1 9.0 21Z" fill="#0ea5e9" />
                <path d="M16.5 21H20.0A1.5 1.5 0 0 1 21.5 22.5V26.0A1.5 1.5 0 0 1 20.0 27.5H16.5A1.5 1.5 0 0 1 15 26.0V22.5A1.5 1.5 0 0 1 16.5 21Z" fill="#0ea5e9" />
                <path d="M8.7 31H20.3A1.2 1.2 0 0 1 21.5 32.2V32.199999999999996A1.2 1.2 0 0 1 20.3 33.4H8.7A1.2 1.2 0 0 1 7.5 32.199999999999996V32.2A1.2 1.2 0 0 1 8.7 31Z" fill="#7dd3fc" />
                <path d="M29.5 12H38.5A2 2 0 0 1 40.5 14V22A2 2 0 0 1 38.5 24H29.5A2 2 0 0 1 27.5 22V14A2 2 0 0 1 29.5 12Z" fill="#ffffff" />
                <path d="M29.0 27H39.0A1.5 1.5 0 0 1 40.5 28.5V28.5A1.5 1.5 0 0 1 39.0 30H29.0A1.5 1.5 0 0 1 27.5 28.5V28.5A1.5 1.5 0 0 1 29.0 27Z" fill="#003087" />
                <path d="M28.7 32.5H35.3A1.2 1.2 0 0 1 36.5 33.7V33.699999999999996A1.2 1.2 0 0 1 35.3 34.9H28.7A1.2 1.2 0 0 1 27.5 33.699999999999996V33.7A1.2 1.2 0 0 1 28.7 32.5Z" fill="#ffffff" />
              </svg>
              <div style={{ flexGrow: "1" }}>
                <h1 className="h1">{v.t?.h}</h1>
                <div className="sub">{v.t?.sub}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_cart}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>cart</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M14 16H34A5 5 0 0 1 39 21V38A5 5 0 0 1 34 43H14A5 5 0 0 1 9 38V21A5 5 0 0 1 14 16Z" fill="#0ea5e9" />
                  <path d="M12 16H36A3 3 0 0 1 39 19V19A3 3 0 0 1 36 22H12A3 3 0 0 1 9 19V19A3 3 0 0 1 12 16Z" fill="#003087" />
                  <path d="M17 17V13a7 7 0 0 1 14 0V17" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M26 33a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#0ea5e9" />
                  <path d="M28.5 33a4.5 4.5 0 1 0 9.0 0a4.5 4.5 0 1 0 -9.0 0Z" fill="#7dd3fc" />
                  <path d="M33.0 29.5H33.0A1.2 1.2 0 0 1 34.2 30.7V35.3A1.2 1.2 0 0 1 33.0 36.5H33.0A1.2 1.2 0 0 1 31.8 35.3V30.7A1.2 1.2 0 0 1 33.0 29.5Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bag}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bag</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
                  <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#003087" />
                  <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                  <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                  <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                  <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                  <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                  <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                  <path d="M35 30.5V39.5M31 35.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bookBuy}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bookBuy</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bookSale}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bookSale</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
                  <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#0ea5e9" />
                  <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                  <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                  <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                  <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                  <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                  <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                  <path d="M30.4 35a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0Z" fill="#ffffff" />
                  <path d="M35 32.5V35l2 1.5" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bookDue}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bookDue</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bookExp}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bookExp</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bookCash}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bookCash</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24.5 15a6.5 6.5 0 1 0 13.0 0a6.5 6.5 0 1 0 -13.0 0Z" fill="#7dd3fc" />
                  <path d="M29.5 23H33.5A8.5 8.5 0 0 1 42 31.5V31.5A8.5 8.5 0 0 1 33.5 40H29.5A8.5 8.5 0 0 1 21 31.5V31.5A8.5 8.5 0 0 1 29.5 23Z" fill="#0ea5e9" />
                  <path d="M10.5 17a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                  <path d="M14.5 26H21.5A8.5 8.5 0 0 1 30 34.5V34.5A8.5 8.5 0 0 1 21.5 43H14.5A8.5 8.5 0 0 1 6 34.5V34.5A8.5 8.5 0 0 1 14.5 26Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_contacts}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>contacts</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
                  <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
                  <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
                  <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
                  <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_box}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>box</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8 24H21A2 2 0 0 1 23 26V39A2 2 0 0 1 21 41H8A2 2 0 0 1 6 39V26A2 2 0 0 1 8 24Z" fill="#7dd3fc" />
                  <path d="M13 24h3v7h-3Z" fill="#e0f2fe" />
                  <path d="M27 24H40A2 2 0 0 1 42 26V39A2 2 0 0 1 40 41H27A2 2 0 0 1 25 39V26A2 2 0 0 1 27 24Z" fill="#0ea5e9" />
                  <path d="M32 24h3v7h-3Z" fill="#e0f2fe" />
                  <path d="M17 8H30A2 2 0 0 1 32 10V22A2 2 0 0 1 30 24H17A2 2 0 0 1 15 22V10A2 2 0 0 1 17 8Z" fill="#7dd3fc" />
                  <path d="M22 8h3v7h-3Z" fill="#e0f2fe" />
                  <path d="M30.5 11a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                  <path d="M34 11l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_stock}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>stock</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                  <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                  <path d="M14 27H16.5A1 1 0 0 1 17.5 28V36A1 1 0 0 1 16.5 37H14A1 1 0 0 1 13 36V28A1 1 0 0 1 14 27Z" fill="#7dd3fc" />
                  <path d="M20.5 21H23.0A1 1 0 0 1 24.0 22V36A1 1 0 0 1 23.0 37H20.5A1 1 0 0 1 19.5 36V22A1 1 0 0 1 20.5 21Z" fill="#0ea5e9" />
                  <path d="M27 15H29.5A1 1 0 0 1 30.5 16V36A1 1 0 0 1 29.5 37H27A1 1 0 0 1 26 36V16A1 1 0 0 1 27 15Z" fill="#0ea5e9" />
                  <path d="M28 34a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#e0f2fe" />
                  <path d="M29 34a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M39.5 38.5L44 43" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_report}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>report</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_cashbox}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>cashbox</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M5 18a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                  <path d="M19 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="#e0f2fe" />
                  <path d="M17 24V12M12 16.5l5 -5 5 5" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M31 24V36M26 31.5l5 5 5 -5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_money}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>money</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                  <path d="M36 17.5V8.5M32 12.5l4 -4 4 4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_moneyIn}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>moneyIn</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                  <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_moneyOut}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>moneyOut</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
                  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
                  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
                  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
                  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_cash}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>cash</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M15 19H32A2 2 0 0 1 34 21V36A2 2 0 0 1 32 38H15A2 2 0 0 1 13 36V21A2 2 0 0 1 15 19Z" fill="#7dd3fc" />
                  <path d="M21.5 19h4v8h-4Z" fill="#e0f2fe" />
                  <path d="M41 25A17 17 0 1 0 36 37" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M35 18L44 22L37 27Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_return}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>return</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_invoice}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>invoice</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_scan}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>scan</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 4L41 10.5V22C41 33 33.5 40.5 24 44.5C14.5 40.5 7 33 7 22V10.5Z" fill="#0ea5e9" />
                  <path d="M24 8.5L37 13.5V22.5C37 31 31.5 37 24 40Z" fill="#0ea5e9" />
                  <path d="M16.5 24l5.5 5.5 10 -11" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_shield}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>shield</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_expired}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>expired</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M9 14H38A2 2 0 0 1 40 16V39A2 2 0 0 1 38 41H9A2 2 0 0 1 7 39V16A2 2 0 0 1 9 14Z" fill="#0ea5e9" />
                  <path d="M20 14h7v27h-7Z" fill="#7dd3fc" />
                  <path d="M15 14L19.5 22L14 27.5L20.5 34.5L17 41" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M30.0 12a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#0ea5e9" />
                  <path d="M38.5 7H38.49999999999999A1.2 1.2 0 0 1 39.699999999999996 8.2V12.3A1.2 1.2 0 0 1 38.49999999999999 13.5H38.5A1.2 1.2 0 0 1 37.3 12.3V8.2A1.2 1.2 0 0 1 38.5 7Z" fill="#ffffff" />
                  <path d="M37.0 16.3a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_damage}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>damage</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M6 8H22A2 2 0 0 1 24 10V39A2 2 0 0 1 22 41H6A2 2 0 0 1 4 39V10A2 2 0 0 1 6 8Z" fill="#e0f2fe" />
                  <path d="M26 8H42A2 2 0 0 1 44 10V39A2 2 0 0 1 42 41H26A2 2 0 0 1 24 39V10A2 2 0 0 1 26 8Z" fill="#7dd3fc" />
                  <path d="M23 8h2v33h-2Z" fill="#003087" />
                  <path d="M9.0 12H12.5A1.5 1.5 0 0 1 14.0 13.5V17.0A1.5 1.5 0 0 1 12.5 18.5H9.0A1.5 1.5 0 0 1 7.5 17.0V13.5A1.5 1.5 0 0 1 9.0 12Z" fill="#0ea5e9" />
                  <path d="M16.5 12H20.0A1.5 1.5 0 0 1 21.5 13.5V17.0A1.5 1.5 0 0 1 20.0 18.5H16.5A1.5 1.5 0 0 1 15 17.0V13.5A1.5 1.5 0 0 1 16.5 12Z" fill="#0ea5e9" />
                  <path d="M9.0 21H12.5A1.5 1.5 0 0 1 14.0 22.5V26.0A1.5 1.5 0 0 1 12.5 27.5H9.0A1.5 1.5 0 0 1 7.5 26.0V22.5A1.5 1.5 0 0 1 9.0 21Z" fill="#0ea5e9" />
                  <path d="M16.5 21H20.0A1.5 1.5 0 0 1 21.5 22.5V26.0A1.5 1.5 0 0 1 20.0 27.5H16.5A1.5 1.5 0 0 1 15 26.0V22.5A1.5 1.5 0 0 1 16.5 21Z" fill="#0ea5e9" />
                  <path d="M8.7 31H20.3A1.2 1.2 0 0 1 21.5 32.2V32.199999999999996A1.2 1.2 0 0 1 20.3 33.4H8.7A1.2 1.2 0 0 1 7.5 32.199999999999996V32.2A1.2 1.2 0 0 1 8.7 31Z" fill="#7dd3fc" />
                  <path d="M29.5 12H38.5A2 2 0 0 1 40.5 14V22A2 2 0 0 1 38.5 24H29.5A2 2 0 0 1 27.5 22V14A2 2 0 0 1 29.5 12Z" fill="#ffffff" />
                  <path d="M29.0 27H39.0A1.5 1.5 0 0 1 40.5 28.5V28.5A1.5 1.5 0 0 1 39.0 30H29.0A1.5 1.5 0 0 1 27.5 28.5V28.5A1.5 1.5 0 0 1 29.0 27Z" fill="#003087" />
                  <path d="M28.7 32.5H35.3A1.2 1.2 0 0 1 36.5 33.7V33.699999999999996A1.2 1.2 0 0 1 35.3 34.9H28.7A1.2 1.2 0 0 1 27.5 33.699999999999996V33.7A1.2 1.2 0 0 1 28.7 32.5Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_catalog}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>catalog</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M15.5 14.5a8.5 8.5 0 1 0 17.0 0a8.5 8.5 0 1 0 -17.0 0Z" fill="#7dd3fc" />
                  <path d="M18.7 5.5H29.3A3.2 3.2 0 0 1 32.5 8.7V8.8A3.2 3.2 0 0 1 29.3 12.0H18.7A3.2 3.2 0 0 1 15.5 8.8V8.7A3.2 3.2 0 0 1 18.7 5.5Z" fill="#003087" />
                  <path d="M19 25H29A10 10 0 0 1 39 35V35A10 10 0 0 1 29 45H19A10 10 0 0 1 9 35V35A10 10 0 0 1 19 25Z" fill="#003087" />
                  <path d="M18.5 25L24 32L29.5 25Z" fill="#ffffff" />
                  <path d="M22.8 30.5L25.2 30.5L26.8 40L24 43L21.2 40Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_staff}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>staff</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M10 5L38 5L38 42L34 39L30 42L26 39L22 42L18 39L14 42L10 39Z" fill="#e0f2fe" />
                  <path d="M14.7 16a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#0ea5e9" />
                  <path d="M25.7 27a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#0ea5e9" />
                  <path d="M31 13L17 30" fill="none" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2 34H32.8A1.2 1.2 0 0 1 34 35.2V35.199999999999996A1.2 1.2 0 0 1 32.8 36.4H15.2A1.2 1.2 0 0 1 14 35.199999999999996V35.2A1.2 1.2 0 0 1 15.2 34Z" fill="#7dd3fc" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_vat}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>vat</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M3 19L24 6L45 19Z" fill="#0ea5e9" />
                  <path d="M8 18H40A1 1 0 0 1 41 19V41A1 1 0 0 1 40 42H8A1 1 0 0 1 7 41V19A1 1 0 0 1 8 18Z" fill="#e0f2fe" />
                  <path d="M16 25H32A1 1 0 0 1 33 26V41A1 1 0 0 1 32 42H16A1 1 0 0 1 15 41V26A1 1 0 0 1 16 25Z" fill="#7dd3fc" />
                  <path d="M15 29h18v1.6h-18Z" fill="#003087" />
                  <path d="M15 33h18v1.6h-18Z" fill="#003087" />
                  <path d="M15 37h18v1.6h-18Z" fill="#003087" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_warehouse}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>warehouse</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M9 18H39A1 1 0 0 1 40 19V41A1 1 0 0 1 39 42H9A1 1 0 0 1 8 41V19A1 1 0 0 1 9 18Z" fill="#e0f2fe" />
                  <path d="M7 9H41A2 2 0 0 1 43 11V17A2 2 0 0 1 41 19H7A2 2 0 0 1 5 17V11A2 2 0 0 1 7 9Z" fill="#0ea5e9" />
                  <path d="M11 9h6v10h-6Z" fill="#ffffff" />
                  <path d="M23 9h6v10h-6Z" fill="#ffffff" />
                  <path d="M35 9h5v10h-5Z" fill="#ffffff" />
                  <path d="M21 28H28A1 1 0 0 1 29 29V41A1 1 0 0 1 28 42H21A1 1 0 0 1 20 41V29A1 1 0 0 1 21 28Z" fill="#0ea5e9" />
                  <path d="M12.5 23H17.0A1 1 0 0 1 18.0 24V28A1 1 0 0 1 17.0 29H12.5A1 1 0 0 1 11.5 28V24A1 1 0 0 1 12.5 23Z" fill="#7dd3fc" />
                  <path d="M32 23H36.5A1 1 0 0 1 37.5 24V28A1 1 0 0 1 36.5 29H32A1 1 0 0 1 31 28V24A1 1 0 0 1 32 23Z" fill="#7dd3fc" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_shop}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>shop</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M10 6H18A4 4 0 0 1 22 10V18A4 4 0 0 1 18 22H10A4 4 0 0 1 6 18V10A4 4 0 0 1 10 6Z" fill="#0ea5e9" />
                  <path d="M25 14a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
                  <path d="M14 26L22.5 41.5L5.5 41.5Z" fill="#0ea5e9" />
                  <path d="M30 26H38A4 4 0 0 1 42 30V38A4 4 0 0 1 38 42H30A4 4 0 0 1 26 38V30A4 4 0 0 1 30 26Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_category}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>category</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M15 4H33A2 2 0 0 1 35 6V16A2 2 0 0 1 33 18H15A2 2 0 0 1 13 16V6A2 2 0 0 1 15 4Z" fill="#e0f2fe" />
                  <path d="M16.0 5.5H32.0A1.5 1.5 0 0 1 33.5 7.0V16.0A1.5 1.5 0 0 1 32.0 17.5H16.0A1.5 1.5 0 0 1 14.5 16.0V7.0A1.5 1.5 0 0 1 16.0 5.5Z" fill="#ffffff" />
                  <path d="M9 16H39A4 4 0 0 1 43 20V30A4 4 0 0 1 39 34H9A4 4 0 0 1 5 30V20A4 4 0 0 1 9 16Z" fill="#003087" />
                  <path d="M10.5 25H37.5A1.5 1.5 0 0 1 39 26.5V27.5A1.5 1.5 0 0 1 37.5 29H10.5A1.5 1.5 0 0 1 9 27.5V26.5A1.5 1.5 0 0 1 10.5 25Z" fill="#003087" />
                  <path d="M15 27H33A2 2 0 0 1 35 29V42A2 2 0 0 1 33 44H15A2 2 0 0 1 13 42V29A2 2 0 0 1 15 27Z" fill="#e0f2fe" />
                  <path d="M16.0 28H32.0A1.5 1.5 0 0 1 33.5 29.5V41.0A1.5 1.5 0 0 1 32.0 42.5H16.0A1.5 1.5 0 0 1 14.5 41.0V29.5A1.5 1.5 0 0 1 16.0 28Z" fill="#ffffff" />
                  <path d="M18.5 32H29.5A1 1 0 0 1 30.5 33V33A1 1 0 0 1 29.5 34H18.5A1 1 0 0 1 17.5 33V33A1 1 0 0 1 18.5 32Z" fill="#7dd3fc" />
                  <path d="M18.5 36H25.5A1 1 0 0 1 26.5 37V37A1 1 0 0 1 25.5 38H18.5A1 1 0 0 1 17.5 37V37A1 1 0 0 1 18.5 36Z" fill="#7dd3fc" />
                  <path d="M35 21a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_printer}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>printer</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M12 7H36A7 7 0 0 1 43 14V34A7 7 0 0 1 36 41H12A7 7 0 0 1 5 34V14A7 7 0 0 1 12 7Z" fill="#e0f2fe" />
                  <path d="M12.5 15H35.5A1.5 1.5 0 0 1 37 16.5V16.5A1.5 1.5 0 0 1 35.5 18H12.5A1.5 1.5 0 0 1 11 16.5V16.5A1.5 1.5 0 0 1 12.5 15Z" fill="#7dd3fc" />
                  <path d="M12.5 23H35.5A1.5 1.5 0 0 1 37 24.5V24.5A1.5 1.5 0 0 1 35.5 26H12.5A1.5 1.5 0 0 1 11 24.5V24.5A1.5 1.5 0 0 1 12.5 23Z" fill="#7dd3fc" />
                  <path d="M12.5 31H35.5A1.5 1.5 0 0 1 37 32.5V32.5A1.5 1.5 0 0 1 35.5 34H12.5A1.5 1.5 0 0 1 11 32.5V32.5A1.5 1.5 0 0 1 12.5 31Z" fill="#7dd3fc" />
                  <path d="M13.7 16.5a4.3 4.3 0 1 0 8.6 0a4.3 4.3 0 1 0 -8.6 0Z" fill="#0ea5e9" />
                  <path d="M25.7 24.5a4.3 4.3 0 1 0 8.6 0a4.3 4.3 0 1 0 -8.6 0Z" fill="#0ea5e9" />
                  <path d="M17.7 32.5a4.3 4.3 0 1 0 8.6 0a4.3 4.3 0 1 0 -8.6 0Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_settings}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>settings</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M12 7H27A8 8 0 0 1 35 15V22A8 8 0 0 1 27 30H12A8 8 0 0 1 4 22V15A8 8 0 0 1 12 7Z" fill="#0ea5e9" />
                  <path d="M11 28L9 37L19 29.5Z" fill="#0ea5e9" />
                  <path d="M10.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
                  <path d="M17.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
                  <path d="M24.7 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="#ffffff" />
                  <path d="M29 22H37A7 7 0 0 1 44 29V32A7 7 0 0 1 37 39H29A7 7 0 0 1 22 32V29A7 7 0 0 1 29 22Z" fill="#0ea5e9" />
                  <path d="M37.5 37L41 43L32.5 38Z" fill="#0ea5e9" />
                  <path d="M28.3 29H37.7A1.3 1.3 0 0 1 39 30.3V30.3A1.3 1.3 0 0 1 37.7 31.6H28.3A1.3 1.3 0 0 1 27 30.3V30.3A1.3 1.3 0 0 1 28.3 29Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_help}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>help</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M15.5 3H27.5A4.5 4.5 0 0 1 32 7.5V40.5A4.5 4.5 0 0 1 27.5 45H15.5A4.5 4.5 0 0 1 11 40.5V7.5A4.5 4.5 0 0 1 15.5 3Z" fill="#003087" />
                  <path d="M15.5 7.5H27.5A2 2 0 0 1 29.5 9.5V36.5A2 2 0 0 1 27.5 38.5H15.5A2 2 0 0 1 13.5 36.5V9.5A2 2 0 0 1 15.5 7.5Z" fill="#e0f2fe" />
                  <path d="M20.2 41.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" fill="#7dd3fc" />
                  <path d="M27 10H40A5 5 0 0 1 45 15V19A5 5 0 0 1 40 24H27A5 5 0 0 1 22 19V15A5 5 0 0 1 27 10Z" fill="#0ea5e9" />
                  <path d="M27 23L25.5 29.5L32 24Z" fill="#0ea5e9" />
                  <path d="M26.3 17a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#ffffff" />
                  <path d="M31.8 17a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#ffffff" />
                  <path d="M37.3 17a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_sms}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>sms</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_truck}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>truck</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M11.5 14.5a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                  <path d="M14.5 24H23.5A9.5 9.5 0 0 1 33 33.5V33.5A9.5 9.5 0 0 1 23.5 43H14.5A9.5 9.5 0 0 1 5 33.5V33.5A9.5 9.5 0 0 1 14.5 24Z" fill="#0ea5e9" />
                  <path d="M25 31a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z" fill="#0ea5e9" />
                  <path d="M28 31a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z" fill="#7dd3fc" />
                  <path d="M31 31H39" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_due}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>due</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M11 7H28A2 2 0 0 1 30 9V16A2 2 0 0 1 28 18H11A2 2 0 0 1 9 16V9A2 2 0 0 1 11 7Z" fill="#7dd3fc" />
                  <path d="M10 12H34A6 6 0 0 1 40 18V34A6 6 0 0 1 34 40H10A6 6 0 0 1 4 34V18A6 6 0 0 1 10 12Z" fill="#0ea5e9" />
                  <path d="M8 12H36A4 4 0 0 1 40 16V16A4 4 0 0 1 36 20H8A4 4 0 0 1 4 16V16A4 4 0 0 1 8 12Z" fill="#003087" />
                  <path d="M32.5 22H39.5A3.5 3.5 0 0 1 43 25.5V28.5A3.5 3.5 0 0 1 39.5 32H32.5A3.5 3.5 0 0 1 29 28.5V25.5A3.5 3.5 0 0 1 32.5 22Z" fill="#7dd3fc" />
                  <path d="M32 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#003087" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_wallet}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>wallet</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8.5 28H12.5A1.5 1.5 0 0 1 14 29.5V39.5A1.5 1.5 0 0 1 12.5 41H8.5A1.5 1.5 0 0 1 7 39.5V29.5A1.5 1.5 0 0 1 8.5 28Z" fill="#7dd3fc" />
                  <path d="M18.5 22H22.5A1.5 1.5 0 0 1 24 23.5V39.5A1.5 1.5 0 0 1 22.5 41H18.5A1.5 1.5 0 0 1 17 39.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#7dd3fc" />
                  <path d="M28.5 16H32.5A1.5 1.5 0 0 1 34 17.5V39.5A1.5 1.5 0 0 1 32.5 41H28.5A1.5 1.5 0 0 1 27 39.5V17.5A1.5 1.5 0 0 1 28.5 16Z" fill="#0ea5e9" />
                  <path d="M6 21L16 13L24 17L39 7" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M33 5.5L42.5 4.5L41 13.5Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_profit}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>profit</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M3 24a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z" fill="#e0f2fe" />
                  <path d="M24.0 9H24.0A5.5 5.5 0 0 1 29.5 14.5V22.5A5.5 5.5 0 0 1 24.0 28H24.0A5.5 5.5 0 0 1 18.5 22.5V14.5A5.5 5.5 0 0 1 24.0 9Z" fill="#0ea5e9" />
                  <path d="M22 13H26A1 1 0 0 1 27 14V14A1 1 0 0 1 26 15H22A1 1 0 0 1 21 14V14A1 1 0 0 1 22 13Z" fill="#7dd3fc" />
                  <path d="M13.5 22a10.5 10.5 0 0 0 21 0M24 32.5V38M18.5 38.5H29.5" fill="none" stroke="#003087" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M38 5L39.6 9.4L44 11L39.6 12.6L38 17L36.4 12.6L32 11L36.4 9.4Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_mic}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>mic</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
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
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_calendar}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>calendar</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M4 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z" fill="#e0f2fe" />
                  <path d="M8.5 24a13.5 13.5 0 1 0 27.0 0a13.5 13.5 0 1 0 -27.0 0Z" fill="#ffffff" />
                  <path d="M22 16V24.5L28 28" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M29 36a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
                  <path d="M33 36l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_clock}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>clock</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M16 22V15.5a8 8 0 0 1 16 0V22" fill="none" stroke="#003087" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 21H33A5 5 0 0 1 38 26V38A5 5 0 0 1 33 43H15A5 5 0 0 1 10 38V26A5 5 0 0 1 15 21Z" fill="#0ea5e9" />
                  <path d="M20.7 30.5a3.3 3.3 0 1 0 6.6 0a3.3 3.3 0 1 0 -6.6 0Z" fill="#003087" />
                  <path d="M24.0 31.5H24.0A1.2 1.2 0 0 1 25.2 32.7V36.8A1.2 1.2 0 0 1 24.0 38.0H24.0A1.2 1.2 0 0 1 22.8 36.8V32.7A1.2 1.2 0 0 1 24.0 31.5Z" fill="#003087" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_lock}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>lock</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M6 8a3 3 0 0 1 3 -3H22L43 26L27 42L6 21Z" fill="#0ea5e9" />
                  <path d="M9 9H21L39 27L27 39L9 21Z" fill="#7dd3fc" />
                  <path d="M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_tag}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>tag</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M6.5 4H7.0A1.5 1.5 0 0 1 8.5 5.5V42.5A1.5 1.5 0 0 1 7.0 44H6.5A1.5 1.5 0 0 1 5 42.5V5.5A1.5 1.5 0 0 1 6.5 4Z" fill="#003087" />
                  <path d="M41.0 4H41.5A1.5 1.5 0 0 1 43.0 5.5V42.5A1.5 1.5 0 0 1 41.5 44H41.0A1.5 1.5 0 0 1 39.5 42.5V5.5A1.5 1.5 0 0 1 41.0 4Z" fill="#003087" />
                  <path d="M6 15H42A1 1 0 0 1 43 16V17A1 1 0 0 1 42 18H6A1 1 0 0 1 5 17V16A1 1 0 0 1 6 15Z" fill="#003087" />
                  <path d="M6 28H42A1 1 0 0 1 43 29V30A1 1 0 0 1 42 31H6A1 1 0 0 1 5 30V29A1 1 0 0 1 6 28Z" fill="#003087" />
                  <path d="M6 41H42A1 1 0 0 1 43 42V43A1 1 0 0 1 42 44H6A1 1 0 0 1 5 43V42A1 1 0 0 1 6 41Z" fill="#003087" />
                  <path d="M11.5 7H18.5A1.5 1.5 0 0 1 20 8.5V13.5A1.5 1.5 0 0 1 18.5 15H11.5A1.5 1.5 0 0 1 10 13.5V8.5A1.5 1.5 0 0 1 11.5 7Z" fill="#7dd3fc" />
                  <path d="M24.5 9H29.5A1.5 1.5 0 0 1 31 10.5V13.5A1.5 1.5 0 0 1 29.5 15H24.5A1.5 1.5 0 0 1 23 13.5V10.5A1.5 1.5 0 0 1 24.5 9Z" fill="#7dd3fc" />
                  <path d="M12.5 20H17.5A1.5 1.5 0 0 1 19 21.5V26.5A1.5 1.5 0 0 1 17.5 28H12.5A1.5 1.5 0 0 1 11 26.5V21.5A1.5 1.5 0 0 1 12.5 20Z" fill="#7dd3fc" />
                  <path d="M23.5 21H35.5A1.5 1.5 0 0 1 37 22.5V26.5A1.5 1.5 0 0 1 35.5 28H23.5A1.5 1.5 0 0 1 22 26.5V22.5A1.5 1.5 0 0 1 23.5 21Z" fill="#0ea5e9" />
                  <path d="M11.5 34H21.5A1.5 1.5 0 0 1 23 35.5V39.5A1.5 1.5 0 0 1 21.5 41H11.5A1.5 1.5 0 0 1 10 39.5V35.5A1.5 1.5 0 0 1 11.5 34Z" fill="#7dd3fc" />
                  <path d="M27.5 33H33.5A1.5 1.5 0 0 1 35 34.5V39.5A1.5 1.5 0 0 1 33.5 41H27.5A1.5 1.5 0 0 1 26 39.5V34.5A1.5 1.5 0 0 1 27.5 33Z" fill="#7dd3fc" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_rack}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>rack</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 3C15.7 3 9.5 9.2 9.5 17.3C9.5 28.5 24 45 24 45C24 45 38.5 28.5 38.5 17.3C38.5 9.2 32.3 3 24 3Z" fill="#ef4444" />
                  <path d="M17.8 17.5a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_pin}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>pin</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 5C16.5 5 12 10.5 12 18V27L8 33H40L36 27V18C36 10.5 31.5 5 24 5Z" fill="#0ea5e9" />
                  <path d="M23 34H25A3 3 0 0 1 28 37V37A3 3 0 0 1 25 40H23A3 3 0 0 1 20 37V37A3 3 0 0 1 23 34Z" fill="#0ea5e9" />
                  <path d="M30.5 10a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bell}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bell</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M5 24a19 19 0 1 0 38 0a19 19 0 1 0 -38 0Z" fill="#ef4444" />
                  <path d="M14.4 18a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#ffffff" />
                  <path d="M26.4 30a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" fill="#ffffff" />
                  <path d="M31 16L17 32" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_discount}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>discount</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
                  <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
                  <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
                  <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
                  <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
                  <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_phone}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>phone</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8 10H40A4 4 0 0 1 44 14V34A4 4 0 0 1 40 38H8A4 4 0 0 1 4 34V14A4 4 0 0 1 8 10Z" fill="#e0f2fe" />
                  <path d="M8 14h2.5v16h-2.5Z" fill="#003087" />
                  <path d="M12 14h1.3v16h-1.3Z" fill="#003087" />
                  <path d="M15 14h3v16h-3Z" fill="#003087" />
                  <path d="M20 14h1.3v16h-1.3Z" fill="#003087" />
                  <path d="M23 14h2.5v16h-2.5Z" fill="#003087" />
                  <path d="M27 14h1.3v16h-1.3Z" fill="#003087" />
                  <path d="M30 14h2.5v16h-2.5Z" fill="#003087" />
                  <path d="M34 14h1.3v16h-1.3Z" fill="#003087" />
                  <path d="M37 14h3v16h-3Z" fill="#003087" />
                  <path d="M9.2 32H38.8A1.2 1.2 0 0 1 40 33.2V33.199999999999996A1.2 1.2 0 0 1 38.8 34.4H9.2A1.2 1.2 0 0 1 8 33.199999999999996V33.2A1.2 1.2 0 0 1 9.2 32Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_barcodeLabel}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>barcodeLabel</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M7 18H13A3 3 0 0 1 16 21V31A3 3 0 0 1 13 34H7A3 3 0 0 1 4 31V21A3 3 0 0 1 7 18Z" fill="#0ea5e9" />
                  <path d="M35 18H41A3 3 0 0 1 44 21V31A3 3 0 0 1 41 34H35A3 3 0 0 1 32 31V21A3 3 0 0 1 35 18Z" fill="#0ea5e9" />
                  <path d="M14 22L23 16L34 22L30 30L24 33L17 30Z" fill="#7dd3fc" />
                  <path d="M20 24L25 28M23 22L28 26" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_handshake}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>handshake</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8.5 16a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#7dd3fc" />
                  <path d="M12 23H16A7 7 0 0 1 23 30V31A7 7 0 0 1 16 38H12A7 7 0 0 1 5 31V30A7 7 0 0 1 12 23Z" fill="#0ea5e9" />
                  <path d="M28.5 16a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#7dd3fc" />
                  <path d="M32 23H36A7 7 0 0 1 43 30V31A7 7 0 0 1 36 38H32A7 7 0 0 1 25 31V30A7 7 0 0 1 32 23Z" fill="#0ea5e9" />
                  <path d="M17.5 20a6.5 6.5 0 1 0 13.0 0a6.5 6.5 0 1 0 -13.0 0Z" fill="#7dd3fc" />
                  <path d="M21 28H27A8 8 0 0 1 35 36V36A8 8 0 0 1 27 44H21A8 8 0 0 1 13 36V36A8 8 0 0 1 21 28Z" fill="#0ea5e9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_people}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>people</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M4 17L24 5L44 17Z" fill="#0ea5e9" />
                  <path d="M7 16H41A1 1 0 0 1 42 17V19A1 1 0 0 1 41 20H7A1 1 0 0 1 6 19V17A1 1 0 0 1 7 16Z" fill="#003087" />
                  <path d="M9 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                  <path d="M17 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                  <path d="M26.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                  <path d="M34.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
                  <path d="M6.5 35H41.5A1.5 1.5 0 0 1 43 36.5V39.5A1.5 1.5 0 0 1 41.5 41H6.5A1.5 1.5 0 0 1 5 39.5V36.5A1.5 1.5 0 0 1 6.5 35Z" fill="#003087" />
                  <path d="M21.8 12.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z" fill="#7dd3fc" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_bank}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>bank</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M7.5 10H40.5A4.5 4.5 0 0 1 45 14.5V33.5A4.5 4.5 0 0 1 40.5 38H7.5A4.5 4.5 0 0 1 3 33.5V14.5A4.5 4.5 0 0 1 7.5 10Z" fill="#0ea5e9" />
                  <path d="M3 16h42v6h-42Z" fill="#003087" />
                  <path d="M9.8 26H15.2A1.8 1.8 0 0 1 17 27.8V31.2A1.8 1.8 0 0 1 15.2 33H9.8A1.8 1.8 0 0 1 8 31.2V27.8A1.8 1.8 0 0 1 9.8 26Z" fill="#7dd3fc" />
                  <path d="M22.3 28H37.7A1.3 1.3 0 0 1 39 29.3V29.3A1.3 1.3 0 0 1 37.7 30.6H22.3A1.3 1.3 0 0 1 21 29.3V29.3A1.3 1.3 0 0 1 22.3 28Z" fill="#ffffff" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_card}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>card</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 6px", borderRadius: "14px", background: "#fff", border: "1px solid #e6eaf0", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M4 22L24 5L44 22Z" fill="#0ea5e9" />
                  <path d="M11 20H37A2 2 0 0 1 39 22V41A2 2 0 0 1 37 43H11A2 2 0 0 1 9 41V22A2 2 0 0 1 11 20Z" fill="#e0f2fe" />
                  <path d="M21.5 29H26.5A1.5 1.5 0 0 1 28 30.5V41.5A1.5 1.5 0 0 1 26.5 43H21.5A1.5 1.5 0 0 1 20 41.5V30.5A1.5 1.5 0 0 1 21.5 29Z" fill="#0ea5e9" />
                  <path d="M13.5 25H17.0A1 1 0 0 1 18.0 26V29.5A1 1 0 0 1 17.0 30.5H13.5A1 1 0 0 1 12.5 29.5V26A1 1 0 0 1 13.5 25Z" fill="#7dd3fc" />
                  <path d="M31 25H34.5A1 1 0 0 1 35.5 26V29.5A1 1 0 0 1 34.5 30.5H31A1 1 0 0 1 30 29.5V26A1 1 0 0 1 31 25Z" fill="#7dd3fc" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "17px" }}>{v.t?.m_home}</span>
                <span className="mono" style={{ fontSize: "11.5px", color: "#64748b" }}>home</span>
              </div>
            </div>
          </div>
          {v.hasMsg ? (<>
            <div className="fade" role="status" style={{ position: "absolute", top: "90px", left: "50%", transform: "translateX(-50%)", zIndex: "30", display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", borderRadius: "14px", background: "#0f172a", color: "#fff", fontSize: "15px", fontWeight: "500", boxShadow: "0 16px 36px -14px rgba(15,23,42,.6)", maxWidth: "640px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{v.msg}</span>
            </div>
          </>) : null}
        </div>
      </div>
    );
  }
}
