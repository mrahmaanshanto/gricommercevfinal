'use client';
// Generated from design/templates/pos-register/PosReturn.dc.html by scripts/convert-design.mjs.
// PosReturn
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

const CSS = POS_CSS + `input,select{box-sizing:border-box}
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
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={"pos-stage" + (this.props.embedded ? " pos-stage--embedded" : "")} style={{ fontFamily: "var(--font-sans)" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive embedded /></div>
          <div className="pos-scrim" aria-hidden="true" style={{ background: "rgba(15,23,42,.6)" }} />
          <div className="pos-panel pos-panel--center" role="dialog" aria-modal="true" aria-label="Exchange or return" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(1040px, calc(100% - 24px))", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 24px 60px -20px rgba(15,23,42,.5)", color: "#475569" }}>
            <div className="pos-panel__head" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", padding: "12px 12px 12px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                <__Icon name="rotate-ccw" strokeWidth="1.75" width="20" height="20" />
              </span>
              <span style={{ display: "block", flex: "1 1 200px", minWidth: "0" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Exchange / return</h2>
                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Find the original sale, pick the lines coming back, settle the difference</span>
              </span>
              <span style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 8px" }}>
                <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />Step 1 · sale found</span>
                <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Step 2 · pick lines</span>
                <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Step 3 · settle</span>
              </span>
              <button type="button" className="dc-h395" aria-label="Close exchange or return" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
              </button>
            </div>
            <div className="pos-flat" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,380px)" }}>
              <div style={{ padding: "16px 20px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ position: "relative", display: "block", flex: "1 1 200px", minWidth: "0" }}>
                    <input defaultValue="ORD-20260905-0042" aria-label="Find the original sale: order ID, receipt barcode, phone or card last 4" style={{ width: "100%", height: "44px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px 0 40px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#003087" }}>
                      <__Icon name="search" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </span>
                  <button type="button" className="dc-h396" style={{ height: "44px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="scan-line" strokeWidth="1.75" width="16" height="16" />Scan receipt</button>
                </div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Order ID, receipt barcode, customer phone or card last-4.</span>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 12px", padding: "12px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.05)" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>KH</span>
                  <span style={{ display: "block", flex: "1 1 160px", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Kamrul Hasan — +8801711002244</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>ORD-20260905-0042 · 5 Sep 2026, 6:12 PM · Gulshan-1 Counter 1 · card ····4417</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳8,120.00</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Paid in full</span>
                  </span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>Within 7-day window</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Lines on the original sale</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2 of 5 selected · 3 units coming back</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 11px", padding: "10px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.05)" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff" }}>
                      <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                    </span>
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>C</span>
                    <span style={{ display: "block", flex: "1 1 160px", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Classic White Sneakers</span>
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>White · 42 · ৳3,450.00 each · sold 2</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <button type="button" className="dc-h397" aria-label="Return fewer: Classic White Sneakers" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "24px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                      <button type="button" className="dc-h398" aria-label="Return more: Classic White Sneakers" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ minWidth: "84px", marginLeft: "auto", flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳6,900.00</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 11px", padding: "10px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.05)" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff" }}>
                      <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                    </span>
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>D</span>
                    <span style={{ display: "block", flex: "1 1 160px", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Daily Care Shampoo 340ml</span>
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Anti-dandruff · ৳420.00 each · sold 1</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <button type="button" className="dc-h399" aria-label="Return fewer: Daily Care Shampoo 340ml" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                      <span style={{ minWidth: "24px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                      <button type="button" className="dc-h400" aria-label="Return more: Daily Care Shampoo 340ml" style={{ width: "44px", height: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                    </span>
                    <span style={{ minWidth: "84px", marginLeft: "auto", flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                  </div>
                  <div className="dc-h401" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#fff" }} />
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>P</span>
                    <span style={{ display: "block", flex: "1 1 160px", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Premium Cotton Oversized T-Shirt</span>
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Black · M · ৳1,240.00 each · sold 1</span>
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Keep</span>
                    <span style={{ minWidth: "84px", marginLeft: "auto", flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</span>
                  </div>
                  <div className="dc-h402" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#fff" }} />
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>S</span>
                    <span style={{ display: "block", flex: "1 1 160px", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Steel Water Bottle 750ml</span>
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Brushed steel · ৳650.00 each · sold 1</span>
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Keep</span>
                    <span style={{ minWidth: "84px", marginLeft: "auto", flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳650.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", opacity: ".65" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#f1f5f9" }} />
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>C</span>
                    <span style={{ display: "block", flex: "1 1 160px", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Chickpeas Boot Dal 1kg</span>
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-danger)" }}>Perishable — not returnable</span>
                    </span>
                    <span style={{ minWidth: "84px", marginLeft: "auto", flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳165.00</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", padding: "11px 12px", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.07)", border: "1px solid rgba(0,156,222,.3)" }}>
                  <__Icon name="repeat" strokeWidth="1.75" width="17" height="17" style={{ color: "var(--accent-text)", flex: "none" }} />
                  <span style={{ flex: "1 1 220px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569" }}>Exchanging instead? Add the replacement items to the current sale — the refund is applied against the new total and only the difference is settled.</span>
                  <button type="button" className="dc-h403" style={{ marginLeft: "auto", flex: "none", height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>Start exchange</button>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Settlement</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "#475569" }}>Returned lines · 3 units</span>
                    <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳7,320.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "#475569" }}>Promotion clawback</span>
                    <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>＋ ৳345.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "#475569" }}>VAT reversed</span>
                    <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>− ৳366.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "#475569" }}>Restocking fee</span>
                    <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                  </div>
                  <div style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}>Refund due</span>
                    <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳7,299.00</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Refund to</span>
                  <button type="button" style={{ display: "flex", alignItems: "center", gap: "9px", height: "44px", padding: "0 12px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.05)", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="credit-card" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Original card ····4417<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2–5 days</span></button>
                  <button type="button" className="dc-h404" style={{ display: "flex", alignItems: "center", gap: "9px", height: "44px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="banknote" strokeWidth="1.75" width="17" height="17" style={{ color: "var(--text-muted)" }} />Cash from drawer<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Instant</span></button>
                  <button type="button" className="dc-h405" style={{ display: "flex", alignItems: "center", gap: "9px", height: "44px", padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><__Icon name="gift" strokeWidth="1.75" width="17" height="17" style={{ color: "var(--text-muted)" }} />Store credit<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>+৳300 bonus</span></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Reason</span>
                  <select aria-label="Reason for return" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>Wrong size</option>
                    <option>Damaged on arrival</option>
                    <option>Changed mind</option>
                  </select>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Restock returned items" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "var(--radius-full)", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</button>Restock to Central Warehouse</span>
                <div className="pos-sticky" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 11px", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.12)", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-warning)" }}><__Icon name="shield-check" strokeWidth="1.75" width="16" height="16" style={{ flex: "none" }} />Refunds over ৳5,000 are logged against Rahim Uddin and appear on the shift report.</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" className="dc-h406" style={{ height: "52px", padding: "0 16px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}>Cancel</button>
                    <button type="button" className="dc-h407" style={{ flex: "1", height: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Settle refund</button>
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
