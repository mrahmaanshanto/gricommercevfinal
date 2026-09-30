'use client';
// Generated from design/templates/pos-register/PosPay.dc.html by scripts/convert-design.mjs.
// PosPay
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { PaymentLogo } from '@/components/PaymentLogo';
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
@keyframes scanring{0%,100%{box-shadow:0 0 0 3px rgba(0,48,135,.5)}50%{box-shadow:0 0 0 5px rgba(0,48,135,.28)}}
.dc-h382:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h383:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h384:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h385:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h386:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h387:hover{background:#e2e8f0 !important}
.dc-h388:hover{background:#e2e8f0 !important}
.dc-h389:hover{background:#e2e8f0 !important}
.dc-h390:hover{background:#e2e8f0 !important}
.dc-h391:hover{background:rgba(0,48,135,.2) !important}
.dc-h392:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h393:hover{background:#e2e8f0 !important}
.dc-h394:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosPayScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosPay">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div data-pos-fit="1380x880" style={{ position: "relative", width: "100%", minWidth: "1380px", height: "100vh", minHeight: "880px", maxHeight: "100%", overflow: "hidden", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive embedded /></div>
          <div style={{ position: "absolute", inset: "0", background: "rgba(15,23,42,.6)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "860px", borderRadius: "8px", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.5)", overflow: "hidden", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                <__Icon name="wallet" strokeWidth="1.75" width="20" height="20" />
              </span>
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Take payment</span>
                <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#64748b" }}>ORD-20260907-0001 · Shirin Akter — +8801811843300</span>
              </span>
              <span style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b" }}>Total due</span>
                <span style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span>
              </span>
              <button className="dc-h382" aria-label="Close" style={{ width: "36px", height: "36px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
              <div style={{ padding: "16px 20px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#64748b" }}>Add a tender</span>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "8px" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: "9px", height: "52px", padding: "0 12px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.08)", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#003087", cursor: "pointer", textAlign: "left" }}><__Icon name="banknote" strokeWidth="1.75" width="18" height="18" />Cash<span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "#fff", padding: "0 6px", fontSize: "11px", fontWeight: "600" }}>F1</span></button>
                  <button className="dc-h383" style={{ display: "flex", alignItems: "center", gap: "9px", height: "52px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="credit-card" strokeWidth="1.75" width="18" height="18" style={{ color: "#64748b" }} />Card<span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "#f1f5f9", padding: "0 6px", fontSize: "11px", fontWeight: "600", color: "#475569" }}>F2</span></button>
                  <button className="dc-h384" style={{ display: "flex", alignItems: "center", gap: "9px", height: "52px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><PaymentLogo provider="bkash" size={26} radius={6} decorative />bKash</button>
                  <button className="dc-h385" style={{ display: "flex", alignItems: "center", gap: "9px", height: "52px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><PaymentLogo provider="nagad" size={26} radius={6} decorative />Nagad</button>
                  <button className="dc-h386" style={{ display: "flex", alignItems: "center", gap: "9px", height: "52px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><PaymentLogo provider="rocket" size={26} radius={6} decorative />Rocket</button>
                  <button aria-disabled="true" style={{ display: "flex", alignItems: "center", gap: "9px", height: "52px", padding: "0 12px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#64748b", cursor: "not-allowed", textAlign: "left" }}><__Icon name="clock" strokeWidth="1.75" width="18" height="18" />Due / credit</button>
                </div>
                <span style={{ display: "block", fontSize: "12px", lineHeight: "17px", color: "#64748b", textWrap: "pretty" }}>Due / credit is off because <span style={{ fontWeight: "500", color: "#1e293b" }}>Require full payment</span> is on for this counter.</span>
                <div style={{ height: "1px", background: "#e2e8f0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Cash tendered</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Remaining ৳3,500.00</span>
                  </span>
                  <span style={{ position: "relative", display: "block" }}>
                    <span style={{ position: "absolute", left: "14px", top: "0", height: "56px", display: "flex", alignItems: "center", fontSize: "20px", fontWeight: "600", color: "#64748b" }}>৳</span>
                    <input defaultValue="4,000.00" style={{ width: "100%", height: "56px", border: "1px solid #003087", borderRadius: "8px", background: "#fff", padding: "0 14px 0 34px", fontFamily: "inherit", fontSize: "22px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums", animation: "scanring 2.6s ease-in-out infinite" }} />
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button className="dc-h387" style={{ height: "34px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 13px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>Exact ৳3,500</button>
                    <button className="dc-h388" style={{ height: "34px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 13px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>৳4,000</button>
                    <button className="dc-h389" style={{ height: "34px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 13px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>৳5,000</button>
                    <button className="dc-h390" style={{ height: "34px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 13px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer" }}>Keypad</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", background: "rgba(16,185,129,.1)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#047857" }}><__Icon name="coins" strokeWidth="1.75" width="16" height="16" />Change due</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#047857", fontVariantNumeric: "tabular-nums" }}>৳500.00</span>
                  </div>
                  <button className="dc-h391" style={{ height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#003087", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="17" height="17" />Add cash tender</button>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#64748b" }}>Tenders on this sale</span>
                  <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", background: "#e9eef5", padding: "0 9px", fontSize: "12px", fontWeight: "500", color: "#475569" }}>Split · 2 of 3</span>
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#f1f5f9", color: "#475569" }}>
                      <__Icon name="smartphone" strokeWidth="1.75" width="17" height="17" />
                    </span>
                    <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>bKash</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Ref TRX8QK41M · +8801811843300 · confirmed 3:41 PM</span>
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,720.60</span>
                    <button className="dc-h392" aria-label="Remove tender" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                      <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#fff", color: "#003087" }}>
                        <__Icon name="banknote" strokeWidth="1.75" width="17" height="17" />
                      </span>
                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Cash</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Tendered ৳4,000.00 · change ৳500.00</span>
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳3,500.00</span>
                      <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", background: "rgba(0,48,135,.1)", padding: "0 8px", fontSize: "11px", fontWeight: "500", color: "#003087" }}>Pending</span>
                    </div>
                  </div>
                </div>
                <div style={{ height: "1px", background: "#e2e8f0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Total due</span>
                    <span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Tendered so far</span>
                    <span style={{ fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: "8px", background: "#f8fafc" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b" }}>Remaining to pay</span>
                    <span style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#047857", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                    <span style={{ display: "flex", height: "6px", flex: "1", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                      <span style={{ width: "67%", background: "#003087" }} />
                      <span style={{ width: "33%", background: "#009CDE" }} />
                    </span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>Cash 67% · bKash 33%</span>
                  </div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", gap: "8px", paddingTop: "4px" }}>
                  <button className="dc-h393" style={{ height: "48px", padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer" }}>Cancel</button>
                  <button className="dc-h394" style={{ flex: "1", height: "48px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "15px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Complete sale<span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(255,255,255,.2)", padding: "0 6px", fontSize: "11px", fontWeight: "600" }}>F4</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
