'use client';
// Generated from design/templates/pos-register/PosKeypad.dc.html by scripts/convert-design.mjs.
// PosKeypad
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { POS_CSS } from '@/screens/pos-register/posLayout';
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

const CSS = POS_CSS + `.pos-float{display:contents}
@container pos (max-width:1023px){
  .pos-float{display:flex;position:absolute;inset:12px;gap:12px;align-items:flex-start;justify-content:center;overflow:auto}
  .pos-float>*{position:static!important;flex:none;margin-top:auto}
  .pos-float>.pos-float__edit{flex:0 1 466px;min-width:0;width:auto!important}
}
@container pos (max-width:767px){
  .pos-float{flex-direction:column;align-items:stretch;justify-content:flex-start}
  .pos-float>*,.pos-float>.pos-float__edit{width:auto!important;flex:none;margin-top:0}
}
input,select{box-sizing:border-box}
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
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={"pos-stage" + (this.props.embedded ? " pos-stage--embedded" : "")} style={{ fontFamily: "var(--font-sans)" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive embedded /></div>
          <div className="pos-scrim" aria-hidden="true" style={{ background: "rgba(15,23,42,.42)" }} />
          <div className="pos-float">
          <div className="pos-float__pad" role="group" aria-label="Keypad" style={{ position: "absolute", left: "120px", top: "170px", width: "326px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.5)", overflow: "hidden", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                <__Icon name="grid-3x3" strokeWidth="1.75" width="17" height="17" />
              </span>
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Keypad</span>
                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Docked · stays open while scanning</span>
              </span>
              <button type="button" className="dc-h338" aria-label="Dock keypad away" style={{ marginLeft: "auto", width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <__Icon name="panel-bottom-close" strokeWidth="1.75" width="17" height="17" />
              </button>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div role="group" aria-label="Keypad mode" style={{ display: "flex", gap: "4px", padding: "3px", borderRadius: "var(--radius-lg)", background: "#e9eef5" }}>
                <button type="button" aria-pressed="true" style={{ flex: "1", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>Qty</button>
                <button type="button" aria-pressed="false" style={{ flex: "1", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Price</button>
                <button type="button" aria-pressed="false" style={{ flex: "1", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Discount</button>
                <button type="button" aria-pressed="false" style={{ flex: "1", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Cash</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Quantity · Baseus USB-C Cable 100W 1m</span>
                <span style={{ fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>3</span>
              </div>
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                <button type="button" className="dc-h339" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>1</button>
                <button type="button" className="dc-h340" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>2</button>
                <button type="button" className="dc-h341" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>3</button>
                <button type="button" className="dc-h342" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>4</button>
                <button type="button" className="dc-h343" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>5</button>
                <button type="button" className="dc-h344" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>6</button>
                <button type="button" className="dc-h345" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>7</button>
                <button type="button" className="dc-h346" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>8</button>
                <button type="button" className="dc-h347" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>9</button>
                <button type="button" className="dc-h348" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer" }}>.</button>
                <button type="button" className="dc-h349" style={{ height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>0</button>
                <button type="button" className="dc-h350" aria-label="Backspace" style={{ height: "52px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", cursor: "pointer" }}>
                  <__Icon name="delete" strokeWidth="1.75" width="20" height="20" />
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="dc-h351" style={{ flex: "1", height: "52px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}>Clear</button>
                <button type="button" className="dc-h352" style={{ flex: "1.4", height: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}><__Icon name="check" strokeWidth="1.75" width="17" height="17" />Apply</button>
              </div>
            </div>
          </div>
          <div className="pos-float__edit" role="dialog" aria-label="Edit line: Baseus USB-C Cable 100W 1m" style={{ position: "absolute", left: "464px", top: "206px", width: "466px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.55)", overflow: "hidden", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
              <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>P</span>
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Baseus USB-C Cable 100W 1m</span>
                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Black · 1m · line 2 of 6 · ৳780.00 list price</span>
              </span>
              <button type="button" className="dc-h353" aria-label="Close line editor" style={{ marginLeft: "auto", width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
              </button>
            </div>
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "10px" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Quantity</span>
                  <input defaultValue="3" aria-label="Quantity" inputMode="numeric" style={{ width: "100%", height: "48px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }} />
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>120 in stock · max 40 per sale</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Manual price (৳)</span>
                  <input defaultValue="760.00" aria-label="Manual price in taka" inputMode="decimal" style={{ width: "100%", height: "48px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }} />
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-warning)" }}>৳20.00 below list — needs manager approval</span>
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Line discount</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span role="group" aria-label="Discount type" style={{ display: "flex", height: "50px", padding: "3px", borderRadius: "var(--radius-lg)", background: "#e9eef5", flex: "none" }}>
                    <button type="button" aria-label="Discount in taka" aria-pressed="true" style={{ width: "46px", border: "none", borderRadius: "var(--radius-md)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>৳</button>
                    <button type="button" aria-label="Discount in percent" aria-pressed="false" style={{ width: "46px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>%</button>
                  </span>
                  <input defaultValue="0.00" aria-label="Line discount amount" inputMode="decimal" style={{ flex: "1", minWidth: "0", height: "50px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>New line total</span>
                <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳2,280.00</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button type="button" className="dc-h354" style={{ height: "44px", padding: "0 16px", border: "none", borderRadius: "var(--radius-lg)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-danger)", cursor: "pointer" }}>Remove line</button>
                <button type="button" className="dc-h355" style={{ marginLeft: "auto", height: "44px", padding: "0 16px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}>Cancel</button>
                <button type="button" className="dc-h356" style={{ height: "44px", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Save line<span className="pos-kbd" style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.2)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Enter</span></button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
}
