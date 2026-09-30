'use client';
// Generated from design/templates/pos-register/PosReturn.dc.html by scripts/convert-design.mjs.
// PosReturn
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __PosActive from '@/screens/pos-register/PosActive';

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
.dc-h395:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h396:hover{background:#e2e8f0 !important}
.dc-h397:hover{background:#f1f5f9 !important}
.dc-h398:hover{background:#f1f5f9 !important}
.dc-h399:hover{background:#f1f5f9 !important}
.dc-h400:hover{background:#f1f5f9 !important}
.dc-h401:hover{border-color:#99acd0 !important}
.dc-h402:hover{border-color:#99acd0 !important}
.dc-h403:hover{background:#f1f5f9 !important}
.dc-h404:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h405:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h406:hover{background:#e2e8f0 !important}
.dc-h407:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosReturnScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosReturn">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__PosFit />
        <__PosSwitcher />
        <div data-pos-fit="1380x880" style={{ position: "relative", width: "100%", minWidth: "1380px", height: "100vh", minHeight: "880px", maxHeight: "100%", overflow: "hidden", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive /></div>
          <div style={{ position: "absolute", inset: "0", background: "rgba(15,23,42,.6)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "1040px", borderRadius: "8px", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.5)", overflow: "hidden", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                <__Icon name="rotate-ccw" strokeWidth="1.75" width="20" height="20" />
              </span>
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Exchange / return</span>
                <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Find the original sale, pick the lines coming back, settle the difference</span>
              </span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#059669" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />Step 1 · sale found</span>
                <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#003087" }}>Step 2 · pick lines</span>
                <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "#f1f5f9", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Step 3 · settle</span>
              </span>
              <button className="dc-h395" aria-label="Close" style={{ width: "36px", height: "36px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px" }}>
              <div style={{ padding: "16px 20px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ position: "relative", display: "block", flex: "1 1 220px", minWidth: "220px" }}>
                    <input defaultValue="ORD-20260905-0042" style={{ width: "100%", height: "44px", border: "1px solid #003087", borderRadius: "8px", background: "#fff", padding: "0 12px 0 40px", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "14px", color: "#1e293b" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#003087" }}>
                      <__Icon name="search" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </span>
                  <button className="dc-h396" style={{ height: "44px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="scan-line" strokeWidth="1.75" width="16" height="16" />Scan receipt</button>
                </div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Order ID, receipt barcode, customer phone or card last-4.</span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.05)" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", fontSize: "12px", fontWeight: "600", color: "#003087" }}>KH</span>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Kamrul Hasan — +8801711002244</span>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>ORD-20260905-0042 · 5 Sep 2026, 6:12 PM · Gulshan-1 Counter 1 · card ····4417</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳8,120.00</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Paid in full</span>
                  </span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 9px", fontSize: "11px", fontWeight: "500", color: "#059669" }}>Within 7-day window</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#64748b" }}>Lines on the original sale</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>2 of 5 selected · 3 units coming back</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.05)" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "6px", background: "#003087", color: "#fff" }}>
                      <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                    </span>
                    <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "13px", fontWeight: "600", color: "#a9b8d4" }}>C</span>
                    <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Classic White Sneakers</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>White · 42 · ৳3,450.00 each · sold 2</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "2px", background: "#fff" }}>
                      <button className="dc-h397" aria-label="Fewer" style={{ width: "30px", height: "30px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                      <span style={{ minWidth: "24px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                      <button className="dc-h398" aria-label="More" style={{ width: "30px", height: "30px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                    </span>
                    <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳6,900.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.05)" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "6px", background: "#003087", color: "#fff" }}>
                      <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                    </span>
                    <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "13px", fontWeight: "600", color: "#a9b8d4" }}>D</span>
                    <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Daily Care Shampoo 340ml</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Anti-dandruff · ৳420.00 each · sold 1</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "2px", background: "#fff" }}>
                      <button className="dc-h399" aria-label="Fewer" style={{ width: "30px", height: "30px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>−</button>
                      <span style={{ minWidth: "24px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                      <button className="dc-h400" aria-label="More" style={{ width: "30px", height: "30px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "15px", color: "#475569", cursor: "pointer" }}>+</button>
                    </span>
                    <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                  </div>
                  <div className="dc-h401" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }} />
                    <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "13px", fontWeight: "600", color: "#a9b8d4" }}>P</span>
                    <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Premium Cotton Oversized T-Shirt</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Black · M · ৳1,240.00 each · sold 1</span>
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Keep</span>
                    <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</span>
                  </div>
                  <div className="dc-h402" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }} />
                    <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "13px", fontWeight: "600", color: "#a9b8d4" }}>S</span>
                    <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Steel Water Bottle 750ml</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Brushed steel · ৳650.00 each · sold 1</span>
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Keep</span>
                    <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>৳650.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", opacity: ".65" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f1f5f9" }} />
                    <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "13px", fontWeight: "600", color: "#a9b8d4" }}>C</span>
                    <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Chickpeas Boot Dal 1kg</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#c2380f" }}>Perishable — not returnable</span>
                    </span>
                    <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>৳165.00</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", borderRadius: "8px", background: "rgba(0,156,222,.07)", border: "1px solid rgba(0,156,222,.3)" }}>
                  <__Icon name="repeat" strokeWidth="1.75" width="17" height="17" style={{ color: "#0089c3", flex: "none" }} />
                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#475569" }}>Exchanging instead? Add the replacement items to the current sale — the refund is applied against the new total and only the difference is settled.</span>
                  <button className="dc-h403" style={{ marginLeft: "auto", flex: "none", height: "34px", border: "none", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>Start exchange</button>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#64748b" }}>Settlement</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Returned lines · 3 units</span>
                    <span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳7,320.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Promotion clawback</span>
                    <span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>＋ ৳345.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>VAT reversed</span>
                    <span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>− ৳366.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Restocking fee</span>
                    <span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                  </div>
                  <div style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b" }}>Refund due</span>
                    <span style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳7,299.00</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#334155" }}>Refund to</span>
                  <button style={{ display: "flex", alignItems: "center", gap: "9px", height: "44px", padding: "0 12px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.05)", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="credit-card" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Original card ····4417<span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>2–5 days</span></button>
                  <button className="dc-h404" style={{ display: "flex", alignItems: "center", gap: "9px", height: "44px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="banknote" strokeWidth="1.75" width="17" height="17" style={{ color: "#64748b" }} />Cash from drawer<span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>Instant</span></button>
                  <button className="dc-h405" style={{ display: "flex", alignItems: "center", gap: "9px", height: "44px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="gift" strokeWidth="1.75" width="17" height="17" style={{ color: "#64748b" }} />Store credit<span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>+৳300 bonus</span></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#334155" }}>Reason</span>
                  <select style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "13px", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,#94a3b8 50%),linear-gradient(135deg,#94a3b8 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>Wrong size</option>
                    <option>Damaged on arrival</option>
                    <option>Changed mind</option>
                  </select>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", fontWeight: "500", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Restock returned items" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "9999px", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff" }} />
</button>Restock to Central Warehouse</span>
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 11px", borderRadius: "8px", background: "rgba(255,152,0,.12)", fontSize: "12px", lineHeight: "17px", color: "#8a5200" }}><__Icon name="shield-check" strokeWidth="1.75" width="16" height="16" style={{ flex: "none" }} />Refunds over ৳5,000 are logged against Rahim Uddin and appear on the shift report.</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="dc-h406" style={{ height: "48px", padding: "0 16px", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer" }}>Cancel</button>
                    <button className="dc-h407" style={{ flex: "1", height: "48px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "15px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Settle refund</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
