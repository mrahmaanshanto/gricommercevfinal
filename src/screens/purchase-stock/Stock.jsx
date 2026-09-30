'use client';
// Generated from design/templates/purchase-stock/Stock.dc.html by scripts/convert-design.mjs.
// Stock — Purchase & Stock module — Stock list.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
var SK = [
  { name: 'Sunscreen SPF 50 · 50ml', code: '8941100500235', wh: 'Dhanmondi shop', rack: 'A-2', qty: 4, re: 24, cost: 561.6 },
  { name: 'Aloe Vera Soothing Gel 300ml', code: '8941100500112', wh: 'Dhanmondi shop', rack: 'A-1', qty: 9, re: 20, cost: 332.8 },
  { name: 'Shipping box · Medium', code: '8941300900014', wh: 'Central Warehouse', rack: 'P-4', qty: 0, re: 200, cost: 55 },
  { name: 'Men’s Polo Shirt · Navy · M', code: '8941200100118', wh: 'Central Warehouse', rack: 'C-3', qty: 52, re: 20, cost: 436.2 },
  { name: 'Denim Jeans · Blue · 32', code: '8941200200214', wh: 'Central Warehouse', rack: 'C-5', qty: 34, re: 15, cost: 748 },
  { name: 'Cotton T-shirt · Black · M', code: '8941200300317', wh: 'Online orders', rack: 'B-1', qty: 2, re: 30, cost: 119.4 },
  { name: 'Rice Water Cleanser 150ml', code: '8941100500341', wh: 'Central Warehouse', rack: 'A-6', qty: 88, re: 24, cost: 426.1 },
  { name: 'Lip Balm Strawberry 4g', code: '8941100500563', wh: 'Dhanmondi shop', rack: 'A-9', qty: 0, re: 40, cost: 98.7, exp: false },
  { name: 'Cotton Face Towel (pack of 3)', code: '8941100500457', wh: 'Central Warehouse', rack: 'D-2', qty: 140, re: 30, cost: 187.2, exp: true }
];
var FL = [{ k: 'all', label: 'All' }, { k: 'low', label: 'Low stock' }, { k: 'out', label: 'Out of stock' }, { k: 'exp', label: 'Expiring soon' }];
class Component extends DCLogic {
  renderVals() {
    var self = this, f = (this.state && this.state.f) || 'all';
    var rows = SK.filter(function (r) {
      if (f === 'low') return r.qty > 0 && r.qty < r.re; if (f === 'out') return r.qty === 0; if (f === 'exp') return !!r.exp; return true;
    }).map(function (r) {
      var out = r.qty === 0, low = !out && r.qty < r.re;
      return { name: r.name, code: r.code, initial: r.name.charAt(0), wh: r.wh, rack: r.rack, qty: r.qty, reorder: r.re,
        qtyColor: out ? '#b83210' : (low ? '#b4410c' : '#0f172a'), flag: out || low || !!r.exp,
        flagCls: out ? 'badge b-cancelled' : (low ? 'badge b-partial' : 'badge b-approval'), flagText: out ? 'Out' : (low ? 'Low' : 'Expires in 20 days'),
        cost: '৳' + r.cost.toFixed(2), value: bdt(r.qty * r.cost) };
    });
    return { rows: rows, filters: FL.map(function (x) { var on = x.k === f; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ f: x.k }); } }; }) };
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
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class StockScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Stock">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1400px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="stock-list" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Stock" page="Stock list" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>৳18,42,300</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Stock value</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>at real cost</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>412</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Products in stock</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>in 3 warehouses</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fff1e6", color: "#b4410c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                      <path d="M16 17h6v-6" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#b4410c" }}>6</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Low stock</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>below reorder level</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#b83210" }}>2</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Out of stock</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>selling now, none left</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "12px", background: "#fff1e6" }}>
                <span style={{ color: "#b4410c" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                    <path d="M16 17h6v-6" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#5c2303" }}><strong style={{ fontWeight: "600" }}>8 products need buying.</strong> We filled in quantities from the last 30 days of sales.</div>
                <__Link href="/new-po" className="btn solid sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                  <span>Make purchase order</span>
                </__Link>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  <label style={{ position: "relative", width: "360px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "#003087" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                    </span>
                    <input className="inp" type="search" placeholder="Scan or search a product" aria-label="Scan or search a product" style={{ paddingLeft: "44px" }} />
                  </label>
                  <button type="button" className="chip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                      <path d="M2 7h20" />
                    </svg>
                    <span>All warehouses</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {__list(v.filters).map((f, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={f?.cls} aria-pressed={f?.on} onClick={f?.pick}>{f?.label}</button>
                    </React.Fragment>))}
                  <div style={{ flexGrow: "1" }} />
                  <__Link href="/stock-count" className="btn line sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="8" height="4" x="8" y="2" rx="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
                    <span>Stock count</span>
                  </__Link>
                  <__Link href="/barcode-labels" className="btn line sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                      <rect x="6" y="14" width="12" height="8" rx="1" />
                    </svg>
                    <span>Print labels</span>
                  </__Link>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th">Product</th>
                      <th className="th">Where</th>
                      <th className="th" style={{ textAlign: "right" }}>In stock</th>
                      <th className="th" style={{ textAlign: "right" }}>Buy again at</th>
                      <th className="th" style={{ textAlign: "right" }}>Real cost</th>
                      <th className="th" style={{ textAlign: "right" }}>Value</th>
                      <th className="th" style={{ textAlign: "right" }}>Quick actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row fade">
                          <td className="td">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>{r?.initial}</span>
                              <div>
                                <div style={{ fontWeight: "500" }}>{r?.name}</div>
                                <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="td">
                            <div>{r?.wh}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Rack {r?.rack}</div>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <div style={__sx(`font-size: 16px; font-weight: 700; color: ${r?.qtyColor ?? ""};`)}>{r?.qty}</div>
                            {r?.flag ? (<>
                              <span className={r?.flagCls}>{r?.flagText}</span>
                            </>) : null}
                          </td>
                          <td className="td" style={{ textAlign: "right", color: "#475569" }}>{r?.reorder}</td>
                          <td className="td" style={{ textAlign: "right" }}>{r?.cost}</td>
                          <td className="td" style={{ textAlign: "right", fontWeight: "600" }}>{r?.value}</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "2px" }}>
                              <__Link href="/expiry-disposal" className="ib" aria-label={`Change stock of ${r?.name ?? ""}`}>
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
                              </__Link>
                              <__Link href="/new-transfer" className="ib" aria-label={`Move ${r?.name ?? ""} to another warehouse`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M8 3 4 7l4 4" />
                                  <path d="M4 7h16" />
                                  <path d="m16 21 4-4-4-4" />
                                  <path d="M20 17H4" />
                                </svg>
                              </__Link>
                              <__Link href="/barcode-labels" className="ib" aria-label={`Print barcode label for ${r?.name ?? ""}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                  <path d="M8 7v10" />
                                  <path d="M12 7v10" />
                                  <path d="M17 7v10" />
                                </svg>
                              </__Link>
                              <button type="button" className="ib" aria-label={`Stock history of ${r?.name ?? ""}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
