'use client';
// Generated from design/templates/pos-register/PosOpen.dc.html by scripts/convert-design.mjs.
// PosOpen
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { POS_CSS } from '@/screens/pos-register/posLayout';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __PosIdle from '@/screens/pos-register/PosIdle';

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

const CSS = POS_CSS + `@container pos (max-width:1023px){.pos-panel .pos-denoms{grid-template-columns:minmax(0,1fr)!important}}
input,select{box-sizing:border-box}
html,body{height:100%}
.dc-h363:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h364:hover{background:#f1f5f9 !important}
.dc-h365:hover{background:#f1f5f9 !important}
.dc-h366:hover{background:#f1f5f9 !important}
.dc-h367:hover{background:#f1f5f9 !important}
.dc-h368:hover{background:#f1f5f9 !important}
.dc-h369:hover{background:#f1f5f9 !important}
.dc-h370:hover{background:#f1f5f9 !important}
.dc-h371:hover{background:#f1f5f9 !important}
.dc-h372:hover{background:#f1f5f9 !important}
.dc-h373:hover{background:#f1f5f9 !important}
.dc-h374:hover{background:#f1f5f9 !important}
.dc-h375:hover{background:#f1f5f9 !important}
.dc-h376:hover{background:#f1f5f9 !important}
.dc-h377:hover{background:#f1f5f9 !important}
.dc-h378:hover{background:#f1f5f9 !important}
.dc-h379:hover{background:#f1f5f9 !important}
.dc-h380:hover{background:#e2e8f0 !important}
.dc-h381:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosOpenScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosOpen">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={"pos-stage" + (this.props.embedded ? " pos-stage--embedded" : "")} style={{ fontFamily: "var(--font-sans)" }}>
          <div data-dc-import="PosIdle" style={{ width: "100%", height: "100%" }}><__PosIdle embedded /></div>
          <div className="pos-scrim" aria-hidden="true" style={{ background: "rgba(15,23,42,.6)" }} />
          <div className="pos-panel pos-panel--center pos-stack" role="dialog" aria-modal="true" aria-label="Open the register" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(940px, calc(100% - 24px))", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.5)", color: "#475569", display: "flex" }}>
            <div style={{ width: "284px", flex: "none", background: "#f8fafc", borderRight: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <span style={{ display: "block" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Open the register</h2>
                <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>REG-02 · Gulshan-1 Counter 2 · 7 Sep 2026</span>
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", gap: "11px" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}><__Icon name="check" strokeWidth="2" width="14" height="14" /></span>
                    <span style={{ width: "2px", flex: "1", minHeight: "26px", background: "#003087" }} />
                  </span>
                  <span style={{ display: "block", paddingBottom: "14px" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Confirm cashier</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Rahim Uddin — Super Admin</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "11px" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}><__Icon name="check" strokeWidth="2" width="14" height="14" /></span>
                    <span style={{ width: "2px", flex: "1", minHeight: "26px", background: "#003087" }} />
                  </span>
                  <span style={{ display: "block", paddingBottom: "14px" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{"Counter & register"}</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Counter 2 · drawer CD-02 linked</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "11px" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>3</span>
                    <span style={{ width: "2px", flex: "1", minHeight: "26px", background: "#e2e8f0" }} />
                  </span>
                  <span style={{ display: "block", paddingBottom: "14px" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Opening float</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Count the drawer note by note</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "11px" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>4</span>
                  </span>
                  <span style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{"Confirm & open"}</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Print the opening slip</span>
                  </span>
                </div>
              </div>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Yesterday’s close</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                  <span style={{ color: "#475569" }}>Counted out</span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳9,000.00</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                  <span style={{ color: "#475569" }}>Variance</span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "var(--text-success)", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                </div>
                <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Suggested float ৳9,000.00 — matches the last balanced close.</span>
              </div>
            </div>
            <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", padding: "12px 12px 12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ display: "block" }}>
                  <h3 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Step 3 · Opening float</h3>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Enter how many of each note and coin are in the drawer.</span>
                </span>
                <button type="button" className="dc-h363" aria-label="Close register opening" style={{ marginLeft: "auto", width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
                </button>
              </div>
              <div style={{ flex: "1", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="gc-cols-2 pos-denoms" role="group" aria-label="Notes and coins in the drawer" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,000</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h364" aria-label="Fewer 1000 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>5</span>
                      <button type="button" className="dc-h365" aria-label="More 1000 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳5,000.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳500</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h366" aria-label="Fewer 500 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4</span>
                      <button type="button" className="dc-h367" aria-label="More 500 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳2,000.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳200</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h368" aria-label="Fewer 200 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3</span>
                      <button type="button" className="dc-h369" aria-label="More 200 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳600.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳100</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #003087", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h370" aria-label="Fewer 100 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>10</span>
                      <button type="button" className="dc-h371" aria-label="More 100 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,000.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳50</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h372" aria-label="Fewer 50 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>6</span>
                      <button type="button" className="dc-h373" aria-label="More 50 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳300.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳20</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h374" aria-label="Fewer 20 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>5</span>
                      <button type="button" className="dc-h375" aria-label="More 20 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳100.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳10</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h376" aria-label="Fewer 10 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>10</span>
                      <button type="button" className="dc-h377" aria-label="More 10 notes" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳100.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "66px", flex: "none", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>Coins</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)" }}>
                      <button type="button" className="dc-h378" aria-label="Less coin value" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>40</span>
                      <button type="button" className="dc-h379" aria-label="More coin value" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳80.00</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                  <span style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}>Counted float</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>43 notes · 40 coins</span>
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳9,180.00</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.12)" }}>
                  <__Icon name="triangle-alert" strokeWidth="1.75" width="17" height="17" style={{ color: "var(--text-warning)", flex: "none" }} />
                  <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#8a5200" }}>৳180.00 above the suggested float. That is fine — the amount is recorded as the opening balance for this shift.</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Note (optional)</span>
                  <input aria-label="Note (optional)" placeholder="e.g. extra ৳180 change brought from the safe" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                </div>
              </div>
              <div style={{ position: "sticky", bottom: "0", zIndex: "1", flex: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", padding: "12px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Print opening slip" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "var(--radius-full)", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</button>Print opening slip</span>
                <button type="button" className="dc-h380" style={{ marginLeft: "auto", height: "52px", padding: "0 16px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}>Back</button>
                <button type="button" className="dc-h381" style={{ height: "52px", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Continue<__Icon name="arrow-right" strokeWidth="1.75" width="17" height="17" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
