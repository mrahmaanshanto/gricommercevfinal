'use client';
// Generated from design/templates/products/AllProducts.dc.html by scripts/convert-design.mjs.
// AllProducts — Products — All products.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var P = [
  { name: '5G Smartphone Pro 256GB', sku: 'PH-5GP-256', vars: '4 variants', st: 'active', inv: 38, loc: 2, cat: 'Electronics › Phones', brand: 'Samsung', by: 'own', price: '৳64,990 – ৳69,990', flags: ['IMEI', 'Warranty'], tbg: '#e0f2fe' },
  { name: 'Sunscreen SPF 50 · 50ml', sku: 'SK-SUN-50', vars: '1 variant', st: 'active', inv: 124, loc: 2, cat: 'Skin care › Sunscreen', brand: 'Beauty of Joseon', by: 'own', price: '৳1,250', flags: ['Expiry'], tbg: '#fff4e0' },
  { name: 'Men’s Polo Shirt', sku: 'CL-POLO', vars: '12 variants', st: 'active', inv: 6, loc: 2, cat: 'Clothing › Men', brand: 'GridShop', by: 'own', price: '৳1,450', flags: ['Size guide'], tbg: '#eef2f6', low: true },
  { name: 'Hyaluronic Toner 150ml', sku: 'SK-TON-150', vars: '1 variant', st: 'draft', inv: 60, loc: 1, cat: 'Skin care › Toner', brand: 'Beauty of Joseon', by: 'own', price: '৳990', flags: ['No description'], tbg: '#e7f8f1', missing: true },
  { name: 'Wireless Earbuds Pro', sku: 'EL-EAR-PRO', vars: '2 variants', st: 'active', inv: 0, loc: 2, cat: 'Electronics › Audio', brand: 'SoundMax', by: 'seller', seller: 'TechHub BD', price: '৳3,490', flags: ['Serial', 'Warranty'], tbg: '#f3e8ff' },
  { name: 'Printed Everyday Kurti', sku: 'CL-KRT-01', vars: '8 variants', st: 'active', inv: 42, loc: 2, cat: 'Clothing › Women', brand: 'GridShop', by: 'seller', seller: 'Aarong Crafts', price: '৳1,290', flags: ['Size guide', 'No photo'], tbg: '#fde7f1', missing: true },
  { name: 'Premium Miniket Rice 5kg', sku: 'GR-RICE-5', vars: '1 variant', st: 'active', inv: 210, loc: 1, cat: 'Grocery › Rice', brand: 'Chashi', by: 'own', price: '৳520', flags: [], tbg: '#fef9c3' },
  { name: 'Gaming Laptop RTX Edition', sku: 'EL-LAP-RTX', vars: '2 variants', st: 'archived', inv: 3, loc: 1, cat: 'Electronics › Laptops', brand: 'ASUS', by: 'own', price: '৳1,24,500', flags: ['Serial', 'Warranty'], tbg: '#e0f2fe' },
  { name: 'Aloe Vera Gel 300ml (old pack)', sku: 'SK-ALO-300', vars: '1 variant', st: 'deleted', inv: 0, loc: 0, cat: 'Skin care › Gel', brand: 'Nature Republic', by: 'own', price: '৳650', flags: [], tbg: '#eef2f6' }
];
var FL = { 'IMEI': ['#e0f2fe', '#075985', 'Tracked by IMEI'], 'Serial': ['#e0f2fe', '#075985', 'Tracked by serial number'], 'Warranty': ['#e7f8f1', '#047857', 'Has a warranty policy'], 'Expiry': ['#fff4e0', '#a14f06', 'Has an expiry date'], 'Size guide': ['#eef2f6', '#334155', 'Has a size guide'], 'No description': ['#f3e8ff', '#6d28d9', 'Missing — fill with AI'], 'No photo': ['#ffece6', '#b83210', 'Missing photo'] };
var ST = { active: ['Active', 'badge b-received'], draft: ['Draft', 'badge b-draft'], archived: ['Archived', 'badge b-closed'], deleted: ['Deleted', 'badge b-cancelled'] };
var TABS = [{ k: 'all', label: 'All' }, { k: 'active', label: 'Active' }, { k: 'draft', label: 'Draft' }, { k: 'archived', label: 'Archived' }, { k: 'missing', label: 'Missing info' }, { k: 'deleted', label: 'Deleted' }];
var AIC = ['Short description', 'Long description', 'SEO title', 'SEO description', 'Tags', 'Product FAQ', 'Image alt text'];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'all', sel = s.sel || {}, aic = s.aic || { 'Short description': true, 'Long description': true };
    var list = P.filter(function (p) { return tab === 'all' ? p.st !== 'deleted' : tab === 'missing' ? p.missing : p.st === tab; });
    var n = list.filter(function (p) { return sel[p.sku]; }).length;
    var cnt = { all: 412, active: 386, draft: 14, archived: 12, missing: 34, deleted: 9 };
    return assign({
      tabs: pTabs(this, TABS, tab, 'tab', cnt),
      rows: list.map(function (p) { var on = !!sel[p.sku];
        return { name: p.name, sku: p.sku, vars: p.vars, initial: p.name.charAt(0), tbg: p.tbg, sel: on, bg: on ? '#f2f6fc' : 'transparent', st: ST[p.st][0], stCls: ST[p.st][1],
          inv: p.inv === 0 ? 'Out of stock' : p.inv + ' in stock', invSub: p.loc ? 'at ' + p.loc + (p.loc > 1 ? ' places' : ' place') : 'not tracked', invColor: p.inv === 0 ? '#b83210' : p.low ? '#a14f06' : '#0f172a',
          cat: p.cat, brand: p.brand, by: p.by === 'own' ? 'Own' : p.seller, byCls: p.by === 'own' ? 'badge b-ordered' : 'badge b-approval', price: p.price,
          flags: p.flags.map(function (f) { return { l: f, bg: FL[f][0], fg: FL[f][1], t: FL[f][2] }; }),
          toggle: function () { var o = assign({}, sel); o[p.sku] = !on; self.setState({ sel: o }); } }; }),
      empty: !list.length, shown: list.length, total: cnt[tab],
      allSel: list.length > 0 && n === list.length, toggleAll: function () { var o = {}; if (n !== list.length) list.forEach(function (p) { o[p.sku] = true; }); self.setState({ sel: o }); },
      hasSel: n > 0, selCount: n,
      aiOpen: !!s.aiOpen && n > 0, openAi: function () { self.setState({ aiOpen: true }); }, closeAi: function () { self.setState({ aiOpen: false }); },
      aiCols: AIC.map(function (c) { var on = !!aic[c]; return { label: c, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var o = assign({}, aic); o[c] = !on; self.setState({ aic: o }); } }; }),
      aiTotal: n * AIC.filter(function (c) { return aic[c]; }).length,
      runAi: function () { self.setState({ aiOpen: false }); toast(self, 'AI is writing ' + n * AIC.filter(function (c) { return aic[c]; }).length + ' fields. They will wait in “Review AI text” before going live.'); },
      importCsv: function () { toast(self, 'Upload a CSV — download the template first to see the columns.'); }, exportCsv: function () { toast(self, 'Exporting ' + cnt[tab] + ' products as CSV.'); },
      bulkCat: function () { toast(self, 'Pick a new category for ' + n + ' products.'); }, bulkLbl: function () { toast(self, 'Barcode labels ready to print for ' + n + ' products.'); },
      bulkArchive: function () { toast(self, n + ' products archived.'); }, bulkDelete: function () { toast(self, n + ' products moved to Deleted. You can restore them for 30 days.', true); }
    }, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:12px;box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:8px;color:#475569;font-size:14px;font-weight:500;letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;color:#64748b;padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:8px;border:0;font:inherit;font-size:14px;font-weight:500;letter-spacing:.025em;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:15px}
.sm{height:36px;padding:0 12px;font-size:13px}
.ib{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.tab{height:40px;padding:0 14px;border-radius:999px;border:0;background:transparent;font:inherit;font-size:13px;font-weight:500;color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:13px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:14px;line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#64748b}
.num{font-variant-numeric:tabular-nums}
.ai{height:30px;padding:0 10px;border-radius:8px;border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:12.5px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:48px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:#64748b;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:600}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#eef2f6;color:#475569;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:10px;border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#003087}
`;

// ---- markup ----

export default class AllProductsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllProducts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1650px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="products-all" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Products" page="All products" placeholder="Search products, SKU or barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>386</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Active products</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>412 in total</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#a14f06" }}>23</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Low or out of stock</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>7 out of stock</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#f3e8ff", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
                      <path d="m14 7 3 3" />
                      <path d="M5 6v4" />
                      <path d="M19 14v4" />
                      <path d="M10 2v2" />
                      <path d="M7 8H3" />
                      <path d="M21 16h-4" />
                      <path d="M11 3H9" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#6d28d9" }}>34</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Missing information</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>no short description or photo</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>৳18,64,200</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Stock value</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>at buying price</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Every product in your shop. Stock numbers come straight from your warehouses and shops.</div>
                <__Link href="/catalog-setup" className="btn line">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 4h-7" />
                    <path d="M10 4H3" />
                    <path d="M21 12h-9" />
                    <path d="M8 12H3" />
                    <path d="M21 20h-5" />
                    <path d="M12 20H3" />
                    <path d="M14 2v4" />
                    <path d="M8 10v4" />
                    <path d="M16 18v4" />
                  </svg>
                  <span>Catalog setup</span>
                </__Link>
                <button type="button" className="btn line" onClick={v.importCsv}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8 12 3 7 8" />
                    <path d="M12 3v12" />
                  </svg>
                  <span>Import CSV</span>
                </button>
                <__Link href="/add-product" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add product</span>
                </__Link>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <section className="pcard" style={{ overflow: "hidden" }}>
                <div className="ptabs" role="tablist">
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" className={tb?.pcls} aria-selected={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderBottom: "1px solid #e6eaf0" }}>
                  <label style={{ position: "relative", width: "340px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "#64748b" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp" type="search" placeholder="Name, SKU, barcode or IMEI" aria-label="Search products" style={{ paddingLeft: "44px" }} />
                  </label>
                  <select className="inp" aria-label="Category" style={{ width: "190px" }}>
                    <option>All categories</option>
                    <option>Skin care › Sunscreen</option>
                    <option>Skin care › Toner</option>
                    <option>Clothing › Men</option>
                    <option>Electronics › Phones</option>
                    <option>Grocery</option>
                  </select>
                  <select className="inp" aria-label="Brand" style={{ width: "150px" }}>
                    <option>All brands</option>
                    <option>GridShop</option>
                    <option>Beauty of Joseon</option>
                    <option>Samsung</option>
                  </select>
                  <select className="inp" aria-label="Sold by" style={{ width: "150px" }}>
                    <option>Own and sellers</option>
                    <option>Own products</option>
                    <option>Seller products</option>
                  </select>
                  <span style={{ flexGrow: "1" }} />
                  <button type="button" className="abtn" onClick={v.exportCsv}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>Export</button>
                </div>
                {v.hasSel ? (<>
                  <div className="fade" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#0b1733", color: "#fff", fontSize: "14px" }}>
                    <b>{v.selCount} selected</b>
                    <span style={{ flexGrow: "1" }} />
                    <button type="button" className="ai" onClick={v.openAi}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Fill with AI</button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkCat}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                      </svg>
                      <span>Change category</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkLbl}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                      <span>Print labels</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkArchive}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      <span>Archive</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkDelete}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </>) : null}
                {v.aiOpen ? (<>
                  <div className="fade" style={{ margin: "14px 16px", padding: "18px", borderRadius: "14px", border: "1px solid #d9d2fb", background: "linear-gradient(135deg, #faf8ff, #f3f8ff)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "15px", fontWeight: "600" }}>Fill with AI for {v.selCount} products</div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>Pick the columns. AI only fills empty fields unless you tick “Replace”. You check everything before it goes live.</div>
                      </div>
                      <button type="button" className="ib" aria-label="Close" onClick={v.closeAi}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.aiCols).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "34px" }}>{c?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <select className="inp" aria-label="Language" style={{ width: "200px" }}>
                        <option>English</option>
                        <option>বাংলা</option>
                        <option>English + বাংলা</option>
                      </select>
                      <select className="inp" aria-label="Tone" style={{ width: "200px" }}>
                        <option>Friendly</option>
                        <option>Premium</option>
                        <option>Simple and short</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}><input type="checkbox" style={{ width: "16px", height: "16px" }} />Replace existing text</label>
                      <span style={{ flexGrow: "1" }} />
                      <button type="button" className="btn solid" onClick={v.runAi} style={{ background: "#6d28d9" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                        <span>Generate {v.aiTotal} fields</span>
                      </button>
                    </div>
                  </div>
                </>) : null}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th" style={{ width: "44px" }}>
                        <input type="checkbox" aria-label="Select all" checked={v.allSel} onChange={v.toggleAll} style={{ width: "18px", height: "18px" }} />
                      </th>
                      <th className="th">Product</th>
                      <th className="th">Status</th>
                      <th className="th">Inventory</th>
                      <th className="th">Category</th>
                      <th className="th">Brand</th>
                      <th className="th">Sold by</th>
                      <th className="th" style={{ textAlign: "right" }}>Price</th>
                      <th className="th">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row" style={__sx(`background: ${r?.bg ?? ""};`)}>
                          <td className="td">
                            <input type="checkbox" aria-label={`Select ${r?.name ?? ""}`} checked={r?.sel} onChange={r?.toggle} style={{ width: "18px", height: "18px" }} />
                          </td>
                          <td className="td">
                            <__Link href="/add-product" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                              <span className="thumb" style={__sx(`background: ${r?.tbg ?? ""};`)}>{r?.initial}</span>
                              <span>
                                <span style={{ display: "block", fontWeight: "600", color: "#0f172a" }}>{r?.name}</span>
                                <span className="mono" style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{r?.sku} · {r?.vars}</span>
                              </span>
                            </__Link>
                          </td>
                          <td className="td">
                            <span className={r?.stCls}>{r?.st}</span>
                          </td>
                          <td className="td">
                            <span style={__sx(`font-weight: 600; color: ${r?.invColor ?? ""};`)}>{r?.inv}</span>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{r?.invSub}</div>
                          </td>
                          <td className="td" style={{ color: "#334155" }}>{r?.cat}</td>
                          <td className="td" style={{ color: "#475569" }}>{r?.brand}</td>
                          <td className="td">
                            <span className={r?.byCls}>{r?.by}</span>
                          </td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "600" }}>{r?.price}</td>
                          <td className="td">
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {__list(r?.flags).map((f, $index) => (<React.Fragment key={$index}>
                                  <span title={f?.t} style={__sx(`height: 22px; padding: 0 7px; border-radius: 6px; background: ${f?.bg ?? ""}; color: ${f?.fg ?? ""}; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center;`)}>{f?.l}</span>
                                </React.Fragment>))}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.empty ? (<>
                  <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Nothing here.</div>
                </>) : null}
                <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", fontSize: "13px", color: "#64748b" }}>
                  <span style={{ flexGrow: "1" }}>Showing {v.shown} of {v.total}</span>
                  <button type="button" className="abtn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="abtn" style={{ marginLeft: "6px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
