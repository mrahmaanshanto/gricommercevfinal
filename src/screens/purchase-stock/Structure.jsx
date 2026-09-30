'use client';
// Generated from design/templates/purchase-stock/Structure.dc.html by scripts/convert-design.mjs.
// Structure — menu, PO journey, barcodes
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class StructureScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="Structure">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1780px", background: "#f8fafc", padding: "64px 72px", display: "flex", flexDirection: "column", gap: "56px", overflow: "hidden" }}>
          <div>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", color: "var(--accent-text)" }}>{"GRIDCOMMERCE · PURCHASE & STOCK"}</div>
            <h1 style={{ margin: "12px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>How buying and stock will work</h1>
            <p style={{ margin: "12px 0 0", maxWidth: "760px", fontSize: "var(--text-base)", lineHeight: "26px", color: "#475569" }}>Rebuilt from the GridShop dashboard for shop owners who don’t use computers much: fewer pages, plain words, and a scanner instead of a keyboard.</p>
          </div>
          <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "var(--accent-text)" }}>01</span>
              <div>
                <h2 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Menu: from one long list to three clear places</h2>
                <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Buying things, keeping things, and customer returns are different jobs — so they get different menus.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
              <div style={{ width: "250px", flexShrink: "0", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px dashed #cbd5e1", background: "#f1f5f9" }}>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Today in GridShop</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "10px" }}>One menu, 9 pages mixed together</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Purchase order</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Product Stock</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Stock adjustment</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Damage</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Customer returns</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Return Requests</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Replacements</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Supplier returns</div>
                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "30px", color: "#475569", borderTop: "1px solid #e2e8f0" }}>Stock transfer</div>
              </div>
              <div style={{ alignSelf: "center", color: "var(--text-muted)", flexShrink: "0" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "rgba(0,48,135,.08)", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Purchase</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Buying from suppliers</div>
                  </div>
                </div>
                <ul style={{ listStyle: "none", margin: "0", padding: "0" }}>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#003087", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M10 9H8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Purchase orders</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Was “Purchase order”. New statuses, approvals, files</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#003087", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                        <path d="M15 18H9" />
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                        <circle cx="17" cy="18" r="2" />
                        <circle cx="7" cy="18" r="2" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Receive goods</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>New. Scan each delivery — one receipt (GRN) per delivery</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#003087", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="8" height="4" x="8" y="2" rx="1" />
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <path d="M12 11h4" />
                        <path d="M12 16h4" />
                        <path d="M8 11h.01" />
                        <path d="M8 16h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Requests</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>New. Staff ask for items, you turn them into orders</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#003087", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{"Suppliers & dues"}</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Money owed, due dates, payments and returns to supplier</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Stock</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>What you have, and where</div>
                  </div>
                </div>
                <ul style={{ listStyle: "none", margin: "0", padding: "0" }}>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "var(--accent-text)", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Stock list</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Was “Product Stock”. Low stock, real cost, value</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "var(--accent-text)", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="8" height="4" x="8" y="2" rx="1" />
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <path d="m9 14 2 2 4-4" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Stock count</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>New. Count shelves by scanning</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "var(--accent-text)", flexShrink: "0", marginTop: "1px" }}>
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
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Stock changes</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>“Stock adjustment” + “Damage” in one page, pick a reason</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "var(--accent-text)", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 3 4 7l4 4" />
                        <path d="M4 7h16" />
                        <path d="m16 21 4-4-4-4" />
                        <path d="M20 17H4" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Transfers</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Was “Stock transfer”. Scan out, scan in</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "var(--accent-text)", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Barcode labels</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>New. Print labels for any product or delivery</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#fff1e6", color: "#b4410c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 14 4 9l5-5" />
                      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Orders › Returns</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Moved out of stock</div>
                  </div>
                </div>
                <ul style={{ listStyle: "none", margin: "0", padding: "0" }}>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#b4410c", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 14 4 9l5-5" />
                        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Customer returns</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Moved from stock — it starts with a customer order</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#b4410c", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="8" height="4" x="8" y="2" rx="1" />
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <path d="M12 11h4" />
                        <path d="M12 16h4" />
                        <path d="M8 11h.01" />
                        <path d="M8 16h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Return requests</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Moved. Customer asks, you approve</div>
                    </div>
                  </li>
                  <li style={{ display: "flex", gap: "10px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                    <span style={{ color: "#b4410c", flexShrink: "0", marginTop: "1px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 3 4 7l4 4" />
                        <path d="M4 7h16" />
                        <path d="m16 21 4-4-4-4" />
                        <path d="M20 17H4" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Replacements</div>
                      <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Moved. Swap an item for the customer</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "var(--accent-text)" }}>02</span>
              <div>
                <h2 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>The life of a purchase order</h2>
                <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Six steps. The screen always shows one big button for the next step.</p>
              </div>
            </div>
            <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", marginRight: "4px" }}>Ways to start an order</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="8" height="4" x="8" y="2" rx="1" />
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  <path d="M12 11h4" />
  <path d="M12 16h4" />
  <path d="M8 11h.01" />
  <path d="M8 16h.01" />
</svg>Staff request</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
  <path d="M16 17h6v-6" />
</svg>Low-stock list</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="14" height="14" x="8" y="8" rx="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>Copy a past order</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="M17 8 12 3 7 8" />
  <path d="M12 3v12" />
</svg>CSV file</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Blank order</span>
              </div>
              <div className="gc-cardrow" style={{ display: "flex", gap: "10px" }}>
                <div style={{ flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span className="badge b-draft" style={{ alignSelf: "flex-start", height: "32px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Draft</span>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>Anyone makes it: scan items, copy an old order, import CSV or use the low-stock list.</p>
                </div>
                <div style={{ color: "var(--text-muted)", paddingTop: "6px", flexShrink: "0" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <div style={{ flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span className="badge b-approved" style={{ alignSelf: "flex-start", height: "32px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Approved</span>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>Staff orders above ৳50,000 wait for an admin to tap Approve. Admin orders and small orders skip this.</p>
                </div>
                <div style={{ color: "var(--text-muted)", paddingTop: "6px", flexShrink: "0" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <div style={{ flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span className="badge b-ordered" style={{ alignSelf: "flex-start", height: "32px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Ordered</span>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>Sent to the supplier on WhatsApp or printed. The paper has a barcode.</p>
                </div>
                <div style={{ color: "var(--text-muted)", paddingTop: "6px", flexShrink: "0" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <div style={{ flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span className="badge b-partial" style={{ alignSelf: "flex-start", height: "32px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Partly received</span>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>Each delivery is scanned in and saved as a receipt (GRN). Stock goes up right away.</p>
                </div>
                <div style={{ color: "var(--text-muted)", paddingTop: "6px", flexShrink: "0" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <div style={{ flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span className="badge b-received" style={{ alignSelf: "flex-start", height: "32px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Received</span>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>Everything has arrived. Extra costs added at order or at delivery update the real cost of each item.</p>
                </div>
                <div style={{ color: "var(--text-muted)", paddingTop: "6px", flexShrink: "0" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <div style={{ flexGrow: "1", flexBasis: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span className="badge b-closed" style={{ alignSelf: "flex-start", height: "32px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Closed</span>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>Fully paid and nothing pending. The order is locked.</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#ffece6", color: "#8a2a0c", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>
                <span className="badge b-cancelled">Cancelled</span>
                <span>Possible any time before the first delivery. After that, send items back with “Return to supplier”.</span>
              </div>
            </div>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "var(--accent-text)" }}>03</span>
              <div>
                <h2 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>A barcode at every step</h2>
                <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Scanning replaces typing wherever goods or papers change hands.</p>
              </div>
            </div>
            <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                    <circle cx="7.5" cy="7.5" r="1" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Product labels</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Every product gets a barcode. No barcode from the supplier? GridCommerce makes one and prints it.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Purchase order</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Printed and WhatsApp orders carry a barcode. Scan it to open the order.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M15 18H9" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Receiving goods</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Scan each item as it comes out of the box. Wrong items are flagged at once.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Supplier invoice</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Scan or photograph the challan / invoice and it is attached to the order.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="8" height="4" x="8" y="2" rx="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Stock count</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Walk the shelves and scan. Differences become a stock change with a reason.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Transfers</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Scan out at one warehouse, scan in at the other. Nothing gets lost on the way.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 14 4 9l5-5" />
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Damage and returns</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>Scan the item and pick a reason: damaged, expired, lost, back to supplier.</p>
              </div>
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Search anywhere</div>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>The search bar on every page accepts a scan: product, order, delivery or invoice.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
