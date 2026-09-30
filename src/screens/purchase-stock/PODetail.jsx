'use client';
// Generated from design/templates/purchase-stock/PODetail.dc.html by scripts/convert-design.mjs.
// PODetail — Purchase & Stock module — Purchase order PO-2609-0020.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() { return {}; }
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

export default class PODetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PODetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1800px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-orders" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Purchase › Purchase orders" page="Order details" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="mono" style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>PO-2609-0020</span>
                      <span className="badge b-partial">Partly received</span>
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", gap: "28px", flexWrap: "wrap", fontSize: "14px", lineHeight: "20px" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Supplier</div>
                        <div style={{ fontWeight: "600" }}>Nabil Fashion House</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Warehouse</div>
                        <div style={{ fontWeight: "500" }}>Central Warehouse</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Ordered on</div>
                        <div style={{ fontWeight: "500" }}>12 Sep 2026</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Supplier invoice</div>
                        <div className="mono" style={{ fontWeight: "500" }}>NF-2231</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <svg width="150" height="38" viewBox="0 0 150 38" aria-hidden="true">
                      <rect x="0" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="4" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="7" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="11" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="14" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="18" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="21" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="25" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="28" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="32" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="35" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="38" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="40" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="44" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="47" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="50" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="55" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="59" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="64" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="67" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="71" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="76" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="79" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="82" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="87" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="91" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="96" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="98" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="103" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="105" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="108" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="110" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="114" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="117" y="0" width="3" height="38" fill="#0f172a" />
                      <rect x="121" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="124" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="129" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="131" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="134" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="137" y="0" width="2" height="38" fill="#0f172a" />
                      <rect x="140" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="143" y="0" width="1" height="38" fill="#0f172a" />
                      <rect x="146" y="0" width="3" height="38" fill="#0f172a" />
                    </svg>
                    <div className="mono" style={{ fontSize: "11px", color: "#334155" }}>PO-2609-0020</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "210px" }}>
                    <__Link href="/receive-goods" className="btn solid big" style={{ width: "100%" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                      <span>Receive goods</span>
                    </__Link>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" className="btn line sm" style={{ flexGrow: "1" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                          <rect x="6" y="14" width="12" height="8" rx="1" />
                        </svg>
                        <span>Print</span>
                      </button>
                      <__Link href="/supplier-return" className="btn line sm" style={{ flexGrow: "1" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9 14 4 9l5-5" />
                          <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
                        </svg>
                        <span>Return</span>
                      </__Link>
                      <button type="button" className="ib" aria-label="More actions" style={{ border: "1px solid #cbd5e1", borderRadius: "8px", height: "36px", width: "36px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <ol aria-label="Order progress" style={{ listStyle: "none", margin: "0", padding: "0", display: "flex" }}>
                  <li style={{ position: "relative", flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <span style={{ position: "absolute", left: "calc(50% + 26px)", right: "calc(-50% + 26px)", top: "17px", height: "2px", background: "#10b981" }} />
                    <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Draft</span>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>12 Sep</span>
                  </li>
                  <li style={{ position: "relative", flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <span style={{ position: "absolute", left: "calc(50% + 26px)", right: "calc(-50% + 26px)", top: "17px", height: "2px", background: "#10b981" }} />
                    <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Approved</span>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>12 Sep · Admin</span>
                  </li>
                  <li style={{ position: "relative", flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <span style={{ position: "absolute", left: "calc(50% + 26px)", right: "calc(-50% + 26px)", top: "17px", height: "2px", background: "#10b981" }} />
                    <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Ordered</span>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>13 Sep · sent on WhatsApp</span>
                  </li>
                  <li style={{ position: "relative", flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <span style={{ position: "absolute", left: "calc(50% + 26px)", right: "calc(-50% + 26px)", top: "17px", height: "2px", background: "#e2e8f0" }} />
                    <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#ff9800", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 6px #fff1e6" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                        <path d="M15 18H9" />
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                        <circle cx="17" cy="18" r="2" />
                        <circle cx="7" cy="18" r="2" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#b4410c" }}>Partly received</span>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>2 deliveries</span>
                  </li>
                  <li style={{ position: "relative", flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <span style={{ position: "absolute", left: "calc(50% + 26px)", right: "calc(-50% + 26px)", top: "17px", height: "2px", background: "#e2e8f0" }} />
                    <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#ffffff", border: "2px solid #cbd5e1", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>5</span>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#64748b" }}>Received</span>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }} />
                  </li>
                  <li style={{ position: "relative", flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#ffffff", border: "2px solid #cbd5e1", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>6</span>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#64748b" }}>Closed</span>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>after full payment</span>
                  </li>
                </ol>
              </section>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}>
                      <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Products</h2>
                      <span style={{ fontSize: "13px", color: "#475569" }}><strong style={{ color: "#0f172a" }}>140</strong> of 240 received · <strong style={{ color: "#b4410c" }}>100 still coming</strong></span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th">Product</th>
                          <th className="th" style={{ textAlign: "center" }}>Ordered</th>
                          <th className="th" style={{ textAlign: "center" }}>Received</th>
                          <th className="th" style={{ textAlign: "center" }}>Still coming</th>
                          <th className="th">Progress</th>
                          <th className="th" style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="row">
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>Men’s Polo Shirt · Navy · M</div>
                            <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>8941200100118</div>
                          </td>
                          <td className="td" style={{ textAlign: "center" }}>60</td>
                          <td className="td" style={{ textAlign: "center", fontWeight: "600" }}>40</td>
                          <td className="td" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "600", color: "#b4410c" }}>20</span>
                          </td>
                          <td className="td">
                            <div style={{ width: "100px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                              <div style={{ width: "67%", height: "8px", borderRadius: "999px", background: "#ff9800" }} />
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>৳25,200</td>
                        </tr>
                        <tr className="row">
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>Men’s Polo Shirt · Navy · L</div>
                            <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>8941200100125</div>
                          </td>
                          <td className="td" style={{ textAlign: "center" }}>60</td>
                          <td className="td" style={{ textAlign: "center", fontWeight: "600" }}>40</td>
                          <td className="td" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "600", color: "#b4410c" }}>20</span>
                          </td>
                          <td className="td">
                            <div style={{ width: "100px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                              <div style={{ width: "67%", height: "8px", borderRadius: "999px", background: "#ff9800" }} />
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>৳25,200</td>
                        </tr>
                        <tr className="row">
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>Denim Jeans · Blue · 32</div>
                            <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>8941200200214</div>
                          </td>
                          <td className="td" style={{ textAlign: "center" }}>40</td>
                          <td className="td" style={{ textAlign: "center", fontWeight: "600" }}>30</td>
                          <td className="td" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "600", color: "#b4410c" }}>10</span>
                          </td>
                          <td className="td">
                            <div style={{ width: "100px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                              <div style={{ width: "75%", height: "8px", borderRadius: "999px", background: "#ff9800" }} />
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>৳28,800</td>
                        </tr>
                        <tr className="row">
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>Denim Jeans · Blue · 34</div>
                            <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>8941200200221</div>
                          </td>
                          <td className="td" style={{ textAlign: "center" }}>40</td>
                          <td className="td" style={{ textAlign: "center", fontWeight: "600" }}>30</td>
                          <td className="td" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "600", color: "#b4410c" }}>10</span>
                          </td>
                          <td className="td">
                            <div style={{ width: "100px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                              <div style={{ width: "75%", height: "8px", borderRadius: "999px", background: "#ff9800" }} />
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>৳28,800</td>
                        </tr>
                        <tr className="row">
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>Cotton T-shirt · Black · M</div>
                            <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>8941200300317</div>
                          </td>
                          <td className="td" style={{ textAlign: "center" }}>40</td>
                          <td className="td" style={{ textAlign: "center", fontWeight: "600" }}>0</td>
                          <td className="td" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "600", color: "#b4410c" }}>40</span>
                          </td>
                          <td className="td">
                            <div style={{ width: "100px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                              <div style={{ width: "0%", height: "8px", borderRadius: "999px", background: "#ff9800" }} />
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>৳4,600</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                  <section className="card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}>
                      <div>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Deliveries received</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>Each delivery gets its own receipt (GRN) with a barcode.</p>
                      </div>
                      <__Link href="/receive-goods" className="btn soft sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span>Receive next delivery</span>
                      </__Link>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderTop: "1px solid #eef2f6" }}>
                      <span style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                          <path d="M15 18H9" />
                          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                          <circle cx="17" cy="18" r="2" />
                          <circle cx="7" cy="18" r="2" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Delivery on 15 Sep 2026 · 80 pieces</div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Received by Karim (store) · Challan photo attached</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <svg width="110" height="26" viewBox="0 0 110 26" aria-hidden="true">
                          <rect x="0" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="4" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="7" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="11" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="14" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="18" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="22" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="26" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="31" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="35" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="38" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="42" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="46" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="48" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="51" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="55" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="59" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="62" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="67" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="70" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="72" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="75" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="78" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="80" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="84" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="88" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="92" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="94" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="98" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="102" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="105" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="107" y="0" width="2" height="26" fill="#0f172a" />
                        </svg>
                        <div className="mono" style={{ fontSize: "11px", color: "#475569" }}>GRN-0112</div>
                      </div>
                      <a className="btn line sm" href="#">View</a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderTop: "1px solid #eef2f6" }}>
                      <span style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                          <path d="M15 18H9" />
                          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                          <circle cx="17" cy="18" r="2" />
                          <circle cx="7" cy="18" r="2" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Delivery on 17 Sep 2026 · 60 pieces</div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Received by Karim (store) · 2 jeans had loose stitching — kept, noted</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <svg width="110" height="26" viewBox="0 0 110 26" aria-hidden="true">
                          <rect x="0" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="5" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="7" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="10" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="15" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="17" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="21" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="23" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="26" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="29" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="32" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="36" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="39" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="43" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="46" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="48" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="51" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="53" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="57" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="60" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="64" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="66" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="70" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="74" y="0" width="3" height="26" fill="#0f172a" />
                          <rect x="78" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="80" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="84" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="87" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="90" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="93" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="95" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="98" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="102" y="0" width="2" height="26" fill="#0f172a" />
                          <rect x="106" y="0" width="1" height="26" fill="#0f172a" />
                          <rect x="108" y="0" width="1" height="26" fill="#0f172a" />
                        </svg>
                        <div className="mono" style={{ fontSize: "11px", color: "#475569" }}>GRN-0118</div>
                      </div>
                      <a className="btn line sm" href="#">View</a>
                    </div>
                  </section>
                </div>
                <aside style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Payment</h2>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "#475569" }}>Order total</span>
                      <span style={{ fontWeight: "500" }}>৳1,12,600</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "#475569" }}>Paid (15 Sep, bKash)</span>
                      <span style={{ fontWeight: "500", color: "#047857" }}>৳50,000</span>
                    </div>
                    <div style={{ height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                      <div style={{ width: "44%", height: "8px", borderRadius: "999px", background: "#10b981" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>Still to pay</span>
                      <span style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>৳62,600</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: "#f1f5f9", fontSize: "13px", lineHeight: "18px", color: "#334155" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M16 2v4" />
                        <path d="M8 2v4" />
                        <path d="M3 10h18" />
                      </svg>
                      <span>30 days credit · due <strong style={{ fontWeight: "600" }}>12 Oct 2026</strong> (in 24 days)</span>
                    </div>
                    <__Link href="/supplier-detail" className="btn line" style={{ width: "100%" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                      <span>Record a payment</span>
                    </__Link>
                  </section>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Extra costs</h2>
                      <span style={{ fontSize: "12px", color: "#475569" }}>+৳10.71 per piece</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "#475569" }}>Transport · GRN-0112</span>
                      <span style={{ fontWeight: "500" }}>৳1,200</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "#475569" }}>Labour · GRN-0118</span>
                      <span style={{ fontWeight: "500" }}>৳300</span>
                    </div>
                    <div style={{ height: "1px", background: "#e2e8f0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ fontWeight: "600" }}>Total</span>
                      <span style={{ fontWeight: "700" }}>৳1,500</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Added to the real cost of the 140 pieces received so far. You can add costs any time, even after the goods arrive.</p>
                    <button type="button" className="btn soft sm" style={{ alignSelf: "flex-start" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      <span>Add a cost</span>
                    </button>
                  </section>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Files</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                      <span style={{ color: "#b83210" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 9H8" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                        </svg>
                      </span>
                      <span style={{ flexGrow: "1" }}>supplier-invoice-NF-2231.pdf</span>
                      <span style={{ color: "#64748b" }}>1.2 MB</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                      <span style={{ color: "#0089c3" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </span>
                      <span style={{ flexGrow: "1" }}>challan-15-sep.jpg</span>
                      <span style={{ color: "#64748b" }}>860 KB</span>
                    </div>
                    <button type="button" className="btn soft sm" style={{ alignSelf: "flex-start" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span>Add file or photo</span>
                    </button>
                  </section>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Note</h2>
                    <p style={{ margin: "0", fontSize: "13px", lineHeight: "20px", color: "#334155" }}>Supplier will send the T-shirts with the next batch, before 22 Sep.</p>
                  </section>
                  <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>History</h2>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ width: "10px", height: "10px", marginTop: "5px", borderRadius: "999px", background: "#10b981", flexShrink: "0" }} />
                      <div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#0f172a" }}>Second delivery received (60 pcs)</div>
                        <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>17 Sep 2026 · 4:10 PM</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ width: "10px", height: "10px", marginTop: "5px", borderRadius: "999px", background: "#10b981", flexShrink: "0" }} />
                      <div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#0f172a" }}>Paid ৳50,000 by bKash</div>
                        <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>15 Sep 2026 · 6:32 PM</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ width: "10px", height: "10px", marginTop: "5px", borderRadius: "999px", background: "#10b981", flexShrink: "0" }} />
                      <div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#0f172a" }}>First delivery received (80 pcs)</div>
                        <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>15 Sep 2026 · 11:05 AM</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ width: "10px", height: "10px", marginTop: "5px", borderRadius: "999px", background: "#003087", flexShrink: "0" }} />
                      <div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#0f172a" }}>Sent to supplier on WhatsApp</div>
                        <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>13 Sep 2026 · 10:20 AM</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ width: "10px", height: "10px", marginTop: "5px", borderRadius: "999px", background: "#0089c3", flexShrink: "0" }} />
                      <div>
                        <div style={{ fontSize: "13px", lineHeight: "18px", color: "#0f172a" }}>Approved by Admin</div>
                        <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>12 Sep 2026 · 7:48 PM</div>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
