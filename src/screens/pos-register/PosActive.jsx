'use client';
// Generated from design/templates/pos-register/PosActive.dc.html by scripts/convert-design.mjs.
// PosActive
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `input,select{box-sizing:border-box}
html,body{height:100%}
@keyframes scanring{0%,100%{box-shadow:0 0 0 3px rgba(0,48,135,.5)}50%{box-shadow:0 0 0 5px rgba(0,48,135,.28)}}@keyframes scanringdark{0%,100%{box-shadow:0 0 0 3px rgba(0,156,222,.5)}50%{box-shadow:0 0 0 5px rgba(0,156,222,.28)}}
.dc-h244:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h245:hover{background:#e9eef5 !important}
.dc-h246:hover{background:#e9eef5 !important}
.dc-h247:hover{background:#e9eef5 !important}
.dc-h248:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h249:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h250:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h251:hover{background:rgba(203,213,225,.2) !important}
.dc-h252:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h253:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h254:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h255:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h256:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h257:hover{border-color:#99acd0 !important}
.dc-h258:hover{border-color:#99acd0 !important}
.dc-h259:hover{border-color:#99acd0 !important}
.dc-h260:hover{border-color:#99acd0 !important}
.dc-h261:hover{border-color:#99acd0 !important}
.dc-h262:hover{border-color:#99acd0 !important}
.dc-h263:hover{border-color:#99acd0 !important}
.dc-h264:hover{border-color:#99acd0 !important}
.dc-h265:hover{border-color:#99acd0 !important}
.dc-h266:hover{border-color:#99acd0 !important}
.dc-h267:hover{border-color:#99acd0 !important}
.dc-h268:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h269:hover{background:#f1f5f9 !important}
.dc-h270:hover{background:#f1f5f9 !important}
.dc-h271:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h272:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h273:hover{background:#f1f5f9 !important}
.dc-h274:hover{background:#f1f5f9 !important}
.dc-h275:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h276:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h277:hover{background:#f1f5f9 !important}
.dc-h278:hover{background:#f1f5f9 !important}
.dc-h279:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h280:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h281:hover{background:#f1f5f9 !important}
.dc-h282:hover{background:#f1f5f9 !important}
.dc-h283:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h284:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h285:hover{background:#f1f5f9 !important}
.dc-h286:hover{background:#f1f5f9 !important}
.dc-h287:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h288:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h289:hover{background:#f1f5f9 !important}
.dc-h290:hover{background:#f1f5f9 !important}
.dc-h291:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h292:hover{color:#1e293b !important}
.dc-h293:hover{background:#eef2f7 !important}
.dc-h294:hover{background:#eef2f7 !important}
.dc-h295:hover{background:#eef2f7 !important}
.dc-h296:hover{background:#eef2f7 !important}
.dc-h297:hover{background:#eef2f7 !important}
.dc-h298:hover{background:#e2e8f0 !important}
.dc-h299:hover{background:#e2e8f0 !important}
.dc-h300:hover{background:rgba(255,87,36,.1) !important}
.dc-h301:hover{background:rgba(0,48,135,.2) !important}
.dc-h302:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosActiveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosActive">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__PosFit />
        <__PosSwitcher />
        <div data-pos-fit="1380x880" style={{ width: "100%", minWidth: "1380px", height: "100vh", minHeight: "880px", maxHeight: "100%", display: "flex", gap: "12px", padding: "12px", overflow: "hidden", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <__Sidebar collapsed="" fill="" active="pos" />
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <header style={{ height: "61px", flex: "none", display: "flex", alignItems: "center", gap: "14px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <button className="dc-h244" aria-label="Expand navigation" style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                <__Icon name="panel-left" width="20" height="20" strokeWidth="1.75" />
              </button>
              <h1 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", whiteSpace: "nowrap" }}>Point of sale</h1>
              <span style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0", height: "30px", borderRadius: "9999px", background: "#f1f5f9", padding: "0 4px", whiteSpace: "nowrap" }}>
                <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#10b981" }} /><__Icon name="wifi" strokeWidth="1.75" width="14" height="14" />Online</span>
                <span style={{ width: "1px", height: "14px", background: "#cbd5e1" }} />
                <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#10b981" }} /><__Icon name="printer" strokeWidth="1.75" width="14" height="14" />Printer</span>
                <span style={{ width: "1px", height: "14px", background: "#cbd5e1" }} />
                <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#64748b" }} /><__Icon name="inbox" strokeWidth="1.75" width="14" height="14" />Drawer closed</span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                <button className="dc-h245" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="pause" strokeWidth="1.75" width="16" height="16" />Held sales<span style={{ display: "inline-flex", height: "18px", minWidth: "18px", alignItems: "center", justifyContent: "center", borderRadius: "9999px", background: "#003087", padding: "0 5px", fontSize: "11px", fontWeight: "600", color: "#fff" }}>3</span></button>
                <button className="dc-h246" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="receipt-text" strokeWidth="1.75" width="16" height="16" />Recent sales</button>
                <button className="dc-h247" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="16" height="16" />Exchange / return</button>
                <span style={{ width: "1px", height: "24px", background: "#e2e8f0", margin: "0 2px" }} />
                <span style={{ display: "flex", padding: "2px", borderRadius: "9999px", background: "#e9eef5" }}>
                  <button style={{ height: "28px", border: "none", borderRadius: "9999px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", color: "#1e293b", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>EN</button>
                  <button style={{ height: "28px", border: "none", borderRadius: "9999px", background: "none", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>বাংলা</button>
                </span>
                <button className="dc-h248" aria-label="Apps" style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                  <__Icon name="layout-grid" width="20" height="20" strokeWidth="1.75" />
                </button>
                <button className="dc-h249" aria-label="Notifications" style={{ position: "relative", width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                  <__Icon name="bell" width="20" height="20" strokeWidth="1.75" />
                  <span style={{ position: "absolute", top: "7px", right: "8px", width: "7px", height: "7px", borderRadius: "9999px", background: "#ff5724", border: "1.5px solid #fff" }} />
                </button>
                <button className="dc-h250" aria-label="Dark mode" style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                  <__Icon name="moon" width="20" height="20" strokeWidth="1.75" />
                </button>
                <button className="dc-h251" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", border: "none", borderRadius: "9999px", background: "none", padding: "0 8px 0 4px", fontFamily: "inherit", cursor: "pointer" }}>
                  <span style={{ width: "30px", height: "30px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "500" }}>RU</span>
                  <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                </button>
              </div>
            </header>
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <button className="dc-h252" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="warehouse" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", lineHeight: "1.2" }}>Warehouse</span>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b", lineHeight: "1.35" }}>Central Warehouse</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
              </button>
              <button className="dc-h253" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="store" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", lineHeight: "1.2" }}>Counter</span>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b", lineHeight: "1.35" }}>Gulshan-1 · Counter 2</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
              </button>
              <button className="dc-h254" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="calculator" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", lineHeight: "1.2" }}>Register</span>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b", lineHeight: "1.35" }}>REG-02 · open 9:02 AM</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
              </button>
              <button className="dc-h255" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="user-round" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", lineHeight: "1.2" }}>Cashier</span>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b", lineHeight: "1.35" }}>Rahim Uddin — Super Admin</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
              </button>
              <button className="dc-h256" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "8px", background: "rgba(0,156,222,.12)", color: "#0089c3", fontSize: "12px", fontWeight: "600" }}>SA</span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", lineHeight: "1.2" }}>Customer</span>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b", lineHeight: "1.35" }}>Shirin Akter — +8801811843300</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
              </button>
            </div>
            <div style={{ flex: "1", minHeight: "0", display: "flex", gap: "16px", padding: "16px 20px" }}>
              <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ flex: "none", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  <span style={{ position: "relative", display: "block", flex: "1 1 220px", minWidth: "220px" }}>
                    <input defaultValue="rice" placeholder="Search products by name, SKU or brand" style={{ width: "100%", height: "44px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px 0 40px", fontFamily: "inherit", fontSize: "14px", color: "#1e293b" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      <__Icon name="search" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </span>
                  <select aria-label="Category" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,#94a3b8 50%),linear-gradient(135deg,#94a3b8 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>All categories</option>
                    <option>Apparel</option>
                    <option>Grocery</option>
                  </select>
                  <select aria-label="Brand" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,#94a3b8 50%),linear-gradient(135deg,#94a3b8 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>All brands</option>
                    <option>Aarong</option>
                    <option>Walton</option>
                  </select>
                  <span style={{ display: "flex", height: "44px", padding: "3px", borderRadius: "8px", background: "#e9eef5", flex: "none" }}>
                    <button aria-label="Grid view" style={{ width: "40px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "#fff", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>
                      <__Icon name="layout-grid" strokeWidth="1.75" width="18" height="18" />
                    </button>
                    <button aria-label="List view" style={{ width: "40px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", color: "#64748b", cursor: "pointer" }}>
                      <__Icon name="list" strokeWidth="1.75" width="18" height="18" />
                    </button>
                  </span>
                </div>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "12px", alignContent: "start" }}>
                  <button style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #003087", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>P</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>120 in stock</span>
                      <span style={{ position: "absolute", top: "6px", right: "6px", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "600" }}>2</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Premium Miniket Rice 5kg</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Sack · 5kg</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳780.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "#003087", color: "#fff" }}>
                        <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h257" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>64 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Chickpeas Boot Dal 1kg</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Loose · 1kg</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳165.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h258" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>S</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>54 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Soybean Cooking Oil 2L</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Bottle · 2L</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳390.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h259" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>T</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>42 in stock</span>
                      <span style={{ position: "absolute", top: "6px", right: "6px", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "600" }}>2</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Premium Cotton Oversized T-Shirt</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Black · M</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "#003087", color: "#fff" }}>
                        <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h260" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#b36a00" }}>Low · 6 left</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Compression Leggings</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Charcoal · L</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳1,850.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h261" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>D</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>88 in stock</span>
                      <span style={{ position: "absolute", top: "6px", right: "6px", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "600" }}>1</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Daily Care Shampoo 340ml</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Anti-dandruff</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "#003087", color: "#fff" }}>
                        <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h262" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>B</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>12 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Budget Android Phone</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Midnight · 128GB</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳14,990.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h263" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,87,36,.16)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#c2380f" }}>Out of stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Classic White Sneakers</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>White · 42</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>৳3,450.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "#f1f5f9", color: "#64748b" }}>
                        <__Icon name="ban" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h264" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>S</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>31 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Steel Water Bottle 750ml</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Brushed steel</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳650.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h265" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>M</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>26 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Mustard Oil 1L Pure Ghani</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Bottle · 1L</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳340.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h266" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>A</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>73 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Atta Wheat Flour 2kg</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Pack · 2kg</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳150.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button className="dc-h267" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "8px", background: "#eef2f7", overflow: "hidden" }}>
                      <span style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "600", color: "#a9b8d4" }}>R</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "11px", fontWeight: "500", color: "#b36a00" }}>Low · 4 left</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Rice Cooker 1.8L Walton</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>White · 700W</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳3,190.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                  <span>Showing 12 of 486 products · Central Warehouse</span>
                  <span>Grocery · “rice” · 12 matches</span>
                </div>
              </main>
              <aside style={{ width: "clamp(380px,36%,520px)", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRadius: "8px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
                <div style={{ flex: "none", padding: "12px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ position: "relative", display: "block" }}>
                    <input placeholder="Scan barcode or type SKU" style={{ width: "100%", height: "48px", border: "1px solid #003087", borderRadius: "8px", background: "#fff", padding: "0 116px 0 42px", fontFamily: "inherit", fontSize: "15px", color: "#1e293b", animation: "scanring 2.6s ease-in-out infinite" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "42px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#003087" }}>
                      <__Icon name="scan-line" strokeWidth="1.75" width="20" height="20" />
                    </span>
                    <span style={{ position: "absolute", right: "10px", top: "9px", display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", padding: "0 10px", fontSize: "11px", fontWeight: "500", color: "#003087" }}><__Icon name="crosshair" strokeWidth="1.75" width="13" height="13" />Auto-focused</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "7px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#059669" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#10b981" }} />Scanner ready</span>
                    <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>ORD-20260907-0001</span>
                  </div>
                </div>
                <div style={{ flex: "1 1 auto", minHeight: "132px", position: "relative", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Line items</span>
                      <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>6 lines · 9 units</span>
                    </span>
                    <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", gap: "5px", borderRadius: "9999px", background: "#f1f5f9", padding: "0 9px", fontSize: "11px", fontWeight: "500", color: "#64748b", whiteSpace: "nowrap" }}><__Icon name="arrow-up" strokeWidth="1.75" width="12" height="12" />2 above</span>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="dc-h268" style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>T</span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Premium Cotton Oversized T-Shirt</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Black · M · ৳1,240.00</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "2px" }}>
                        <button className="dc-h269" aria-label="Decrease quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        <button className="dc-h270" aria-label="Increase quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                      </span>
                      <span style={{ width: "82px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳2,480.00</span>
                      <button className="dc-h271" aria-label="Remove line" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h272" style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>P</span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Premium Miniket Rice 5kg</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Sack · 5kg · ৳780.00</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "2px" }}>
                        <button className="dc-h273" aria-label="Decrease quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        <button className="dc-h274" aria-label="Increase quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                      </span>
                      <span style={{ width: "82px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,560.00</span>
                      <button className="dc-h275" aria-label="Remove line" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h276" style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>D</span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Daily Care Shampoo 340ml</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Anti-dandruff · ৳420.00</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "2px" }}>
                        <button className="dc-h277" aria-label="Decrease quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                        <button className="dc-h278" aria-label="Increase quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                      </span>
                      <span style={{ width: "82px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                      <button className="dc-h279" aria-label="Remove line" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h280" style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>C</span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Chickpeas Boot Dal 1kg</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Loose · 1kg · ৳165.00</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "2px" }}>
                        <button className="dc-h281" aria-label="Decrease quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        <button className="dc-h282" aria-label="Increase quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                      </span>
                      <span style={{ width: "82px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳330.00</span>
                      <button className="dc-h283" aria-label="Remove line" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h284" style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>S</span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Steel Water Bottle 750ml</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Brushed steel · ৳650.00</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "2px" }}>
                        <button className="dc-h285" aria-label="Decrease quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                        <button className="dc-h286" aria-label="Increase quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                      </span>
                      <span style={{ width: "82px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳650.00</span>
                      <button className="dc-h287" aria-label="Remove line" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h288" style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>A</span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", lineHeight: "18px", fontWeight: "500", color: "#1e293b" }}>Atta Wheat Flour 2kg</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Pack · 2kg · ৳150.00</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "2px" }}>
                        <button className="dc-h289" aria-label="Decrease quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                        <button className="dc-h290" aria-label="Increase quantity" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                      </span>
                      <span style={{ width: "82px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳150.00</span>
                      <button className="dc-h291" aria-label="Remove line" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                  </div>
                  <span style={{ position: "absolute", left: "14px", right: "14px", top: "32px", height: "14px", background: "linear-gradient(#fff,rgba(255,255,255,0))", pointerEvents: "none" }} />
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ flex: "none", fontSize: "11px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Discount</span>
                  <span style={{ flex: "none", display: "flex", height: "38px", padding: "3px", borderRadius: "8px", background: "#e9eef5" }}>
                    <button style={{ width: "40px", border: "none", borderRadius: "6px", background: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>৳</button>
                    <button className="dc-h292" style={{ width: "40px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", color: "#64748b", cursor: "pointer" }}>%</button>
                  </span>
                  <input defaultValue="100.00" aria-label="Discount amount" style={{ flex: "1", minWidth: "0", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }} />
                  <input placeholder="Coupon code" aria-label="Coupon code" style={{ width: "118px", flex: "none", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#1e293b" }} />
                  <button style={{ flex: "none", height: "38px", padding: "0 14px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#003087", cursor: "pointer", whiteSpace: "nowrap" }}>Apply</button>
                </div>
                <div style={{ flex: "none", position: "relative", borderTop: "1px solid #e2e8f0", padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
                    <span className="dc-h293" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "6px", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>Subtotal · 9 units<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#cbd5e1", flex: "none" }} /></span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>৳5,590.00</span>
                    </span>
                    <span className="dc-h294" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "6px", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>Promotion<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#cbd5e1", flex: "none" }} /></span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#059669", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳248.00</span>
                    </span>
                    <span className="dc-h295" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "6px", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>Manual discount<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#cbd5e1", flex: "none" }} /></span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#059669", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳100.00</span>
                    </span>
                    <span className="dc-h296" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "6px", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>Coupon<span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11px", color: "#1e293b" }}>EIDSAVE10</span><__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#cbd5e1", flex: "none" }} /></span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#059669", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳150.00</span>
                    </span>
                    <span className="dc-h297" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "6px", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>Loyalty · 240 pts<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#cbd5e1", flex: "none" }} /></span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#059669", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳120.00</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "6px", background: "rgba(0,48,135,.08)", outline: "1px solid rgba(0,48,135,.18)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: "#1e293b", whiteSpace: "nowrap" }}>Tax · 5% VAT<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#003087", flex: "none" }} /></span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>＋ ৳248.60</span>
                    </span>
                    <span style={{ gridColumn: "1/-1", display: "flex", alignItems: "flex-start", gap: "7px", padding: "6px 9px", borderRadius: "6px", background: "#f8fafc", fontSize: "12px", lineHeight: "17px", color: "#475569" }}><__Icon name="info" strokeWidth="1.75" width="13" height="13" style={{ color: "#94a3b8", flex: "none", marginTop: "2px" }} />Tax: 5% VAT on ৳4,972.00 taxable — subtotal less every discount. Grocery lines are zero-rated.</span>
                  </div>
                  <div style={{ height: "1px", background: "#e2e8f0" }} />
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>Payment taken<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#cbd5e1" }} /><span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳0.00</span></span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#b36a00" }}>Due <span style={{ fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span></span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b" }}>Total due</span>
                      <span style={{ fontSize: "32px", lineHeight: "38px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span>
                    </span>
                  </div>
                </div>
                <div style={{ flex: "none", borderTop: "1px solid #e2e8f0", padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", fontWeight: "500", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Require full payment" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "9999px", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff" }} />
</button>Require full payment</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", fontWeight: "500", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Print receipt" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "9999px", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff" }} />
</button>Print receipt</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="dc-h298" style={{ flex: "1", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" />New sale</button>
                    <button className="dc-h299" style={{ flex: "1", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer" }}><__Icon name="pause" strokeWidth="1.75" width="16" height="16" />Hold sale</button>
                    <button className="dc-h300" style={{ flex: "1", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "8px", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#c2380f", cursor: "pointer" }}>Cancel sale</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="dc-h301" style={{ flex: "1", height: "48px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "15px", fontWeight: "500", letterSpacing: ".025em", color: "#003087", cursor: "pointer", whiteSpace: "nowrap" }}>Take payment<span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "#fff", padding: "0 6px", fontSize: "11px", fontWeight: "600" }}>Alt+P</span></button>
                    <button className="dc-h302" style={{ flex: "1.2", height: "48px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "15px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Complete sale<span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(255,255,255,.2)", padding: "0 6px", fontSize: "11px", fontWeight: "600" }}>F4</span></button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
