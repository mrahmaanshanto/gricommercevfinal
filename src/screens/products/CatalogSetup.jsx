'use client';
// Generated from design/templates/products/CatalogSetup.dc.html by scripts/convert-design.mjs.
// CatalogSetup — Products — Catalog setup.
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
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var SECS = [['fields', 'Custom fields', 14], ['attrs', 'Attributes and values', 5], ['brands', 'Brands', 38], ['units', 'Units', 6], ['tax', 'Tax rates', 3], ['size', 'Size charts', 4], ['warranty', 'Warranty policies', 4]];
var CF = [['RAM', 'Dropdown', '4 GB, 6 GB, 8 GB, 12 GB', 'Phones, Laptops', 'Yes', 'Yes', 'No'], ['Network', 'Dropdown', '4G, 5G', 'Phones', 'Yes', 'Yes', 'No'], ['PTA approved', 'Yes / no', '—', 'Phones', 'Yes', 'Yes', 'No'], ['Display size', 'Number · inch', '—', 'Electronics', 'No', 'Yes', 'Yes'], ['Skin type', 'Checkboxes', 'Dry, Oily, Combination, Sensitive, All', 'Skin care', 'Yes', 'Yes', 'Yes'], ['Key ingredients', 'Text', '—', 'Skin care', 'No', 'Yes', 'Yes'], ['Expiry date', 'Date', '—', 'Skin care, Grocery', 'Yes', 'Yes', 'No'], ['Material', 'Text', '—', 'Clothing', 'Yes', 'Yes', 'Yes'], ['Country of origin', 'Dropdown', 'Bangladesh, China, South Korea, Vietnam…', 'All categories', 'No', 'Yes', 'Yes']];
var ATTR = [['Colour', [['Black', '#111827'], ['White', '#ffffff'], ['Navy', '#1e3a8a'], ['Red', '#dc2626'], ['Silver', '#cbd5e1']], 'used by 186 products'], ['Size', [['S'], ['M'], ['L'], ['XL'], ['XXL']], 'used by 118 products'], ['Storage', [['128 GB'], ['256 GB'], ['512 GB']], 'used by 24 products'], ['Volume', [['50 ml'], ['100 ml'], ['150 ml'], ['300 ml']], 'used by 42 products'], ['Shoe size', [['39'], ['40'], ['41'], ['42'], ['43']], 'used by 30 products']];
var CH = { shirt: ['Men’s shirts and polos', 'Clothing › Men', ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'], [['S', 38, 27, 17, 8], ['M', 40, 28, 18, 8.5], ['L', 42, 29, 19, 9], ['XL', 44, 30, 20, 9.5]]], kurti: ['Women’s kurti', 'Clothing › Women', ['Size', 'Bust', 'Length', 'Waist', 'Hip'], [['S', 34, 42, 30, 38], ['M', 36, 43, 32, 40], ['L', 38, 44, 34, 42], ['XL', 40, 45, 36, 44]]], jeans: ['Jeans', 'Clothing › Men › Jeans', ['Size', 'Waist', 'Hip', 'Length', 'Thigh'], [['30', 30, 38, 40, 22], ['32', 32, 40, 41, 23], ['34', 34, 42, 41, 24], ['36', 36, 44, 42, 25]]], shoe: ['Shoes (BD / EU / UK)', 'Shoes', ['BD', 'EU', 'UK', 'Foot length', 'Width'], [['39', 39, 6, 24.5, 'Regular'], ['40', 40, 6.5, 25.1, 'Regular'], ['41', 41, 7.5, 25.8, 'Regular'], ['42', 42, 8, 26.4, 'Wide']]] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, sec = s.sec || 'fields', ch = s.ch || 'shirt', unit = s.unit || 'in';
    var C = CH[ch];
    var conv = function (x) { return typeof x === 'number' && unit === 'cm' && ch !== 'shoe' ? (x * 2.54).toFixed(1) : x; };
    var v = {
      secs: SECS.map(function (x) { var on = x[0] === sec; return { l: x[1], c: x[2], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#334155', fw: on ? 600 : 500, pick: function () { self.setState({ sec: x[0] }); } }; }),
      cf: CF.map(function (r) { return { l: r[0], t: r[1], o: r[2], c: r[3], req: r[4], show: r[5], ai: r[6] }; }),
      cfOpen: !!s.cfOpen, openCf: function () { self.setState({ cfOpen: true }); }, closeCf: function () { self.setState({ cfOpen: false }); }, saveCf: function () { self.setState({ cfOpen: false }); toast(self, 'Field added. Every Electronics product now asks for it.'); },
      attrs: ATTR.map(function (a) { return { l: a[0], used: a[2], v: a[1].map(function (x) { return { t: x[0], c: x[1] || '', sw: !!x[1] }; }) }; }),
      brands: [['Samsung', 18, '#1428a0'], ['Beauty of Joseon', 22, '#a16207'], ['GridShop', 96, '#003087'], ['Xiaomi', 9, '#ea580c'], ['ASUS', 7, '#0f172a'], ['Nature Republic', 14, '#047857'], ['Chashi', 11, '#65a30d'], ['SoundMax', 6, '#6d28d9']].map(function (b) { return { l: b[0], n: b[1], bg: b[2], i: b[0].charAt(0) }; }),
      units: [['Piece', 'pc', 'No', 312], ['Kilogram', 'kg', 'Yes', 48], ['Gram', 'g', 'Yes', 16], ['Litre', 'L', 'Yes', 21], ['Pack', 'pack', 'No', 12], ['Dozen', 'dz', 'No', 3]].map(function (u) { return { l: u[0], s: u[1], d: u[2], n: u[3] }; }),
      taxes: [['Standard VAT', '15%', 'Yes', 'Skin care, Clothing, Electronics', 298], ['Reduced VAT', '7.5%', 'Yes', '—', 25], ['No VAT', '0%', '—', 'Grocery', 89]].map(function (t) { return { l: t[0], r: t[1], inc: t[2], c: t[3], n: t[4] }; }),
      charts: Object.keys(CH).map(function (k) { var on = k === ch; return { l: CH[k][0], u: CH[k][1], border: on ? '#003087' : '#e6eaf0', bg: on ? '#f2f6fc' : '#fff', pick: function () { self.setState({ ch: k }); } }; }),
      units2: [['in', 'Inches'], ['cm', 'Centimetres']].map(function (m) { var on = m[0] === unit; return { l: m[1], bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ unit: m[0] }); } }; }),
      chHead: C[2].map(function (t, i) { return { t: i && ch !== 'shoe' ? t + ' (' + unit + ')' : t }; }), chRows: C[3].map(function (r) { return { c: r.map(function (x) { return { t: conv(x) }; }) }; }), chUsed: C[1] + ' · 24 products',
      wps: [['1 year official brand warranty', '1 year', 'Brand', 'Brand service centre', 31], ['6 months shop service warranty', '6 months', 'Shop service', 'Your shop', 12], ['7-day replacement only', '7 days', 'Replacement', 'Your shop', 64], ['2 years parts, 1 year service', '2 years', 'Parts + service', 'Brand centre', 7]].map(function (w) { return { l: w[0], p: w[1], t: w[2], c: w[3], n: w[4] }; }),
      addItem: function () { toast(self, 'A new row is ready to fill in.'); }
    };
    SECS.forEach(function (x) { v['is_' + x[0]] = x[0] === sec; });
    return assign(v, msgV(s));
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

export default class CatalogSetupScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="CatalogSetup">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1260px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="products-setup" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Products" page="Catalog setup" placeholder="Search products, SKU or barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Everything products are built from. Set it once, reuse it on every product.</div>
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
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <nav className="pcard" aria-label="Catalog setup" style={{ width: "260px", flexShrink: "0", padding: "10px", display: "flex", flexDirection: "column", gap: "2px", alignSelf: "flex-start" }}>
                  {__list(v.secs).map((n, $index) => (<React.Fragment key={$index}>
                      <button type="button" onClick={n?.pick} aria-current={n?.on} style={__sx(`height: 46px; padding: 0 12px; border: 0; border-radius: 10px; background: ${n?.bg ?? ""}; color: ${n?.fg ?? ""}; font: inherit; font-size: 14px; font-weight: ${n?.fw ?? ""}; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px;`)}>
                        <span style={{ flexGrow: "1" }}>{n?.l}</span>
                        <span className="pcnt">{n?.c}</span>
                      </button>
                    </React.Fragment>))}
                </nav>
                <div style={{ flexGrow: "1", minWidth: "0" }}>
                  {v.is_fields ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Custom fields</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Extra details products can have — like RAM for phones or skin type for creams. Each field belongs to categories.</div>
                        </div>
                        <button type="button" className="btn solid sm" onClick={v.openCf}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          <span>Add field</span>
                        </button>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Field</th>
                            <th className="th">Type</th>
                            <th className="th">Choices</th>
                            <th className="th">Categories</th>
                            <th className="th">Required</th>
                            <th className="th">Shown to customers</th>
                            <th className="th">AI can fill</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.cf).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td className="td" style={{ fontWeight: "600" }}>{r?.l}</td>
                                <td className="td">
                                  <span className="badge b-draft">{r?.t}</span>
                                </td>
                                <td className="td" style={{ fontSize: "12.5px", color: "#475569", maxWidth: "220px" }}>{r?.o}</td>
                                <td className="td" style={{ fontSize: "13px" }}>{r?.c}</td>
                                <td className="td">{r?.req}</td>
                                <td className="td">{r?.show}</td>
                                <td className="td">{r?.ai}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                      {v.cfOpen ? (<>
                        <div className="fade" style={{ padding: "18px", borderRadius: "14px", border: "1.5px solid #003087", background: "#fbfcfe", display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div style={{ fontSize: "15px", fontWeight: "600" }}>New custom field</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Field name</span>
                              <input className="inp" defaultValue="Warranty card included" aria-label="Field name" />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Type</span>
                              <select className="inp" aria-label="Field type">
                                <option>Yes / no</option>
                                <option>Text</option>
                                <option>Number with unit</option>
                                <option>Date</option>
                                <option>Dropdown (one choice)</option>
                                <option>Checkboxes (many)</option>
                                <option>Colour</option>
                                <option>File or PDF</option>
                              </select>
                            </label>
                            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Categories</span>
                              <select className="inp" aria-label="Categories">
                                <option>Electronics (and all inside)</option>
                                <option>All categories</option>
                              </select>
                            </label>
                          </div>
                          <div style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
                            <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" style={{ width: "16px", height: "16px" }} />Required</label>
                            <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />Show on product page</label>
                            <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked={true} style={{ width: "16px", height: "16px" }} />Use in shop filters</label>
                            <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" style={{ width: "16px", height: "16px" }} />AI can fill it</label>
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button type="button" className="btn solid sm" onClick={v.saveCf}>Add field</button>
                            <button type="button" className="btn line sm" onClick={v.closeCf}>Cancel</button>
                          </div>
                        </div>
                      </>) : null}
                    </section>
                  </>) : null}
                  {v.is_attrs ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Attributes and values</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Used to make variants — pick them when you add colours or sizes to a product.</div>
                        </div>
                        <button type="button" className="btn solid sm" onClick={v.addItem}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          <span>Add attribute</span>
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {__list(v.attrs).map((a, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "12px", border: "1px solid #e6eaf0" }}>
                              <span style={{ width: "120px", fontWeight: "600" }}>{a?.l}</span>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flexGrow: "1" }}>
                                {__list(a?.v).map((x, $index) => (<React.Fragment key={$index}>
                                    <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#eef2f6", fontSize: "12.5px", display: "inline-flex", alignItems: "center", gap: "6px" }}>{x?.sw ? (<>
  <span style={__sx(`width: 12px; height: 12px; border-radius: 999px; background: ${x?.c ?? ""}; border: 1px solid #cbd5e1;`)} />
</>) : null}{x?.t}</span>
                                  </React.Fragment>))}
                                <button type="button" className="abtn" style={{ height: "28px" }}>+ value</button>
                              </div>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>{a?.used}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                  </>) : null}
                  {v.is_brands ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Brands</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Shown on product pages and used in filters.</div>
                        </div>
                        <button type="button" className="btn solid sm" onClick={v.addItem}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          <span>Add brand</span>
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                        {__list(v.brands).map((b, $index) => (<React.Fragment key={$index}>
                            <div style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={__sx(`width: 42px; height: 42px; border-radius: 10px; background: ${b?.bg ?? ""}; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center;`)}>{b?.i}</span>
                              <div>
                                <div style={{ fontWeight: "600" }}>{b?.l}</div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>{b?.n} products</div>
                              </div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                  </>) : null}
                  {v.is_units ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Units</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>How a product is counted and sold.</div>
                        </div>
                        <button type="button" className="btn solid sm" onClick={v.addItem}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          <span>Add unit</span>
                        </button>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Unit</th>
                            <th className="th">Short</th>
                            <th className="th">Half units allowed</th>
                            <th className="th" style={{ textAlign: "right" }}>Products</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.units).map((u, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td className="td" style={{ fontWeight: "600" }}>{u?.l}</td>
                                <td className="td mono">{u?.s}</td>
                                <td className="td">{u?.d}</td>
                                <td className="td num" style={{ textAlign: "right" }}>{u?.n}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </section>
                  </>) : null}
                  {v.is_tax ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Tax rates</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>VAT added to prices. Each category has a default; a product can change it.</div>
                        </div>
                        <button type="button" className="btn solid sm" onClick={v.addItem}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          <span>Add tax rate</span>
                        </button>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Name</th>
                            <th className="th" style={{ textAlign: "right" }}>Rate</th>
                            <th className="th">Price includes VAT?</th>
                            <th className="th">Default for</th>
                            <th className="th" style={{ textAlign: "right" }}>Products</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.taxes).map((t, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td className="td" style={{ fontWeight: "600" }}>{t?.l}</td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "700" }}>{t?.r}</td>
                                <td className="td">{t?.inc}</td>
                                <td className="td" style={{ color: "#475569" }}>{t?.c}</td>
                                <td className="td num" style={{ textAlign: "right" }}>{t?.n}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </section>
                  </>) : null}
                  {v.is_size ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Size charts</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Show customers the right size. Fewer returns.</div>
                        </div>
                        <button type="button" className="btn solid sm" onClick={v.addItem}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          <span>New size chart</span>
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ width: "220px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {__list(v.charts).map((c, $index) => (<React.Fragment key={$index}>
                              <button type="button" onClick={c?.pick} style={__sx(`text-align: left; padding: 12px; border-radius: 10px; border: 1.5px solid ${c?.border ?? ""}; background: ${c?.bg ?? ""}; font: inherit; cursor: pointer;`)}>
                                <div style={{ fontSize: "14px", fontWeight: "600" }}>{c?.l}</div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>{c?.u}</div>
                              </button>
                            </React.Fragment>))}
                        </div>
                        <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span className="lbl">Measure in</span>
                            <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                              {__list(v.units2).map((m, $index) => (<React.Fragment key={$index}>
                                  <button type="button" onClick={m?.pick} style={__sx(`height: 30px; padding: 0 14px; border: 0; border-radius: 999px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""};`)}>{m?.l}</button>
                                </React.Fragment>))}
                            </div>
                            <span style={{ flexGrow: "1" }} />
                            <button type="button" className="abtn">+ Row</button>
                            <button type="button" className="abtn">+ Column</button>
                          </div>
                          <table style={{ width: "100%%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                {__list(v.chHead).map((h, $index) => (<React.Fragment key={$index}>
                                    <th className="th">{h?.t}</th>
                                  </React.Fragment>))}
                              </tr>
                            </thead>
                            <tbody>
                              {__list(v.chRows).map((cr, $index) => (<React.Fragment key={$index}>
                                  <tr>
                                    {__list(cr?.c).map((cx, $index) => (<React.Fragment key={$index}>
                                        <td className="td" style={{ padding: "6px" }}>
                                          <input className="inp num" defaultValue={cx?.t} aria-label="Size value" style={{ height: "36px" }} />
                                        </td>
                                      </React.Fragment>))}
                                  </tr>
                                </React.Fragment>))}
                            </tbody>
                          </table>
                          <div style={{ fontSize: "13px", color: "#475569" }}>Used by <b>{v.chUsed}</b></div>
                        </div>
                      </div>
                    </section>
                  </>) : null}
                  {v.is_warranty ? (<>
                    <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Warranty policies</h2>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>Made in Settings. Pick one on any product.</div>
                        </div>
                        <__Link href="/settings-console" className="btn line sm">Manage in Settings</__Link>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Policy</th>
                            <th className="th">Period</th>
                            <th className="th">Type</th>
                            <th className="th">Claim at</th>
                            <th className="th" style={{ textAlign: "right" }}>Products</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.wps).map((w, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td className="td" style={{ fontWeight: "600" }}>{w?.l}</td>
                                <td className="td">{w?.p}</td>
                                <td className="td">{w?.t}</td>
                                <td className="td" style={{ color: "#475569" }}>{w?.c}</td>
                                <td className="td num" style={{ textAlign: "right" }}>{w?.n}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </section>
                  </>) : null}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
