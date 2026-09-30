'use client';
// Generated from design/templates/pos-register/PosKeypad.dc.html by scripts/convert-design.mjs.
// PosKeypad
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
.dc-h338:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h339:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h340:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h341:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h342:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h343:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h344:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h345:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h346:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h347:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h348:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h349:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h350:hover{background:#e2e8f0 !important}
.dc-h351:hover{background:#e2e8f0 !important}
.dc-h352:hover{background:#002a77 !important}
.dc-h353:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h354:hover{background:rgba(255,87,36,.1) !important}
.dc-h355:hover{background:#e2e8f0 !important}
.dc-h356:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosKeypadScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosKeypad">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__PosFit />
        <__PosSwitcher />
        <div data-pos-fit="1380x880" style={{ position: "relative", width: "100%", minWidth: "1380px", height: "100vh", minHeight: "880px", maxHeight: "100%", overflow: "hidden", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive /></div>
          <div style={{ position: "absolute", left: "0", top: "0", right: "0", bottom: "0", background: "rgba(15,23,42,.42)" }} />
          <div style={{ position: "absolute", left: "120px", top: "170px", width: "326px", borderRadius: "8px", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.5)", overflow: "hidden", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                <__Icon name="grid-3x3" strokeWidth="1.75" width="17" height="17" />
              </span>
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Keypad</span>
                <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Docked · stays open while scanning</span>
              </span>
              <button className="dc-h338" aria-label="Dock keypad away" style={{ marginLeft: "auto", width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#64748b", cursor: "pointer" }}>
                <__Icon name="panel-bottom-close" strokeWidth="1.75" width="17" height="17" />
              </button>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "4px", padding: "3px", borderRadius: "8px", background: "#e9eef5" }}>
                <button style={{ flex: "1", height: "34px", border: "none", borderRadius: "6px", background: "#fff", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>Qty</button>
                <button style={{ flex: "1", height: "34px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Price</button>
                <button style={{ flex: "1", height: "34px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Discount</button>
                <button style={{ flex: "1", height: "34px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cash</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", padding: "10px 12px", borderRadius: "8px", background: "#f8fafc" }}>
                <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b" }}>Quantity · Premium Miniket Rice 5kg</span>
                <span style={{ fontSize: "28px", lineHeight: "32px", fontWeight: "700", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>3</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                <button className="dc-h339" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>1</button>
                <button className="dc-h340" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>2</button>
                <button className="dc-h341" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>3</button>
                <button className="dc-h342" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>4</button>
                <button className="dc-h343" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>5</button>
                <button className="dc-h344" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>6</button>
                <button className="dc-h345" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>7</button>
                <button className="dc-h346" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>8</button>
                <button className="dc-h347" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>9</button>
                <button className="dc-h348" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "18px", fontWeight: "600", color: "#1e293b", cursor: "pointer" }}>.</button>
                <button className="dc-h349" style={{ height: "56px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "20px", fontWeight: "600", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>0</button>
                <button className="dc-h350" aria-label="Backspace" style={{ height: "56px", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#475569", cursor: "pointer" }}>
                  <__Icon name="delete" strokeWidth="1.75" width="20" height="20" />
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="dc-h351" style={{ flex: "1", height: "44px", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer" }}>Clear</button>
                <button className="dc-h352" style={{ flex: "1.4", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}><__Icon name="check" strokeWidth="1.75" width="17" height="17" />Apply</button>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: "464px", top: "206px", width: "466px", borderRadius: "8px", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.55)", overflow: "hidden", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "8px", background: "#eef2f7", fontSize: "14px", fontWeight: "600", color: "#a9b8d4" }}>P</span>
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Premium Miniket Rice 5kg</span>
                <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Sack · 5kg · line 2 of 6 · ৳780.00 list price</span>
              </span>
              <button className="dc-h353" aria-label="Close" style={{ marginLeft: "auto", width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#64748b", cursor: "pointer" }}>
                <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
              </button>
            </div>
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "10px" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#334155" }}>Quantity</span>
                  <input defaultValue="3" style={{ width: "100%", height: "48px", border: "1px solid #003087", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "18px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }} />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>120 in stock · max 40 per sale</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#334155" }}>Manual price (৳)</span>
                  <input defaultValue="760.00" style={{ width: "100%", height: "48px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "18px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }} />
                  <span style={{ fontSize: "12px", color: "#b36a00" }}>৳20.00 below list — needs manager approval</span>
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#334155" }}>Line discount</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ display: "flex", height: "44px", padding: "3px", borderRadius: "8px", background: "#e9eef5", flex: "none" }}>
                    <button style={{ width: "46px", border: "none", borderRadius: "6px", background: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>৳</button>
                    <button style={{ width: "46px", border: "none", borderRadius: "6px", background: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>%</button>
                  </span>
                  <input defaultValue="0.00" style={{ flex: "1", minWidth: "0", height: "44px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "15px", fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: "8px", background: "#f8fafc" }}>
                <span style={{ fontSize: "13px", color: "#475569" }}>New line total</span>
                <span style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳2,280.00</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="dc-h354" style={{ height: "44px", padding: "0 16px", border: "none", borderRadius: "8px", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#c2380f", cursor: "pointer" }}>Remove line</button>
                <button className="dc-h355" style={{ marginLeft: "auto", height: "44px", padding: "0 16px", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer" }}>Cancel</button>
                <button className="dc-h356" style={{ height: "44px", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Save line<span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(255,255,255,.2)", padding: "0 6px", fontSize: "11px", fontWeight: "600" }}>Enter</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
