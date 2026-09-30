'use client';
// Generated from design/templates/pos-register/PosSales.dc.html by scripts/convert-design.mjs.
// PosSales
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
.dc-h408:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h409:hover{color:#1e293b !important}
.dc-h410:hover{background:rgba(255,87,36,.1) !important}
.dc-h411:hover{background:#002a77 !important}
.dc-h412:hover{border-color:#99acd0 !important}
.dc-h413:hover{background:rgba(255,87,36,.1) !important}
.dc-h414:hover{background:rgba(0,48,135,.2) !important}
.dc-h415:hover{border-color:#99acd0 !important}
.dc-h416:hover{background:rgba(255,87,36,.1) !important}
.dc-h417:hover{background:rgba(0,48,135,.2) !important}
.dc-h418:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h419:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h420:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h421:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h422:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h423:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h424:hover{background:#e2e8f0 !important}
.dc-h425:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosSalesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosSales">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={"pos-stage" + (this.props.embedded ? " pos-stage--embedded" : "")} style={{ fontFamily: "var(--font-sans)" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive embedded /></div>
          <div className="pos-scrim" aria-hidden="true" style={{ background: "rgba(15,23,42,.5)" }} />
          <div className="pos-panel--side" role="dialog" aria-modal="true" aria-label="Sales at this counter" style={{ position: "absolute", right: "0", top: "0", bottom: "0", width: "min(560px, 100%)", boxSizing: "border-box", background: "#fff", boxShadow: "-24px 0 60px -20px rgba(15,23,42,.45)", display: "flex", flexDirection: "column", color: "#475569" }}>
            <div style={{ flex: "none", padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ display: "block" }}>
                  <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Sales at this counter</h2>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Gulshan-1 · Counter 2 · REG-02 · 7 Sep 2026</span>
                </span>
                <button type="button" className="dc-h408" aria-label="Close sales panel" style={{ marginLeft: "auto", width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
                </button>
              </div>
              <div style={{ display: "flex", gap: "22px", borderBottom: "1px solid #e2e8f0" }}>
                <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "44px", border: "none", borderBottom: "2px solid #003087", background: "none", padding: "0", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}><__Icon name="pause" strokeWidth="1.75" width="17" height="17" />Held sales<span style={{ display: "inline-flex", height: "20px", minWidth: "20px", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", background: "#003087", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#fff" }}>3</span></button>
                <button type="button" className="dc-h409" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "44px", border: "none", borderBottom: "2px solid transparent", background: "none", padding: "0", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", cursor: "pointer" }}><__Icon name="receipt-text" strokeWidth="1.75" width="17" height="17" />Recent sales<span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>28</span></button>
              </div>
            </div>
            <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Parked sales stay on this register for 12 hours, then expire back to the catalogue.</span>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>KH</span>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Kamrul Hasan — +8801711002244</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>HOLD-0007 · 4 items · 6 units · held 14 min ago by Rahim Uddin</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳3,860.00</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2:58 PM</span>
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "0 9px", fontWeight: "var(--weight-medium)" }}>Waiting on card machine</span>
                  <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 9px", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Expires in 11h 46m</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    <button type="button" className="dc-h410" aria-label="Discard held sale HOLD-0007" style={{ height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Discard</button>
                    <button type="button" className="dc-h411" aria-label="Resume held sale HOLD-0007" style={{ height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}>Resume sale</button>
                  </span>
                </div>
              </div>
              <div className="dc-h412" style={{ flex: "none", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><__Icon name="user-round" strokeWidth="1.75" width="16" height="16" /></span>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Walk-in customer</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>HOLD-0006 · 2 items · 2 units · held 46 min ago by Nusrat Jahan</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,405.00</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2:26 PM</span>
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "0 9px", fontWeight: "var(--weight-medium)" }}>Customer stepped out</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    <button type="button" className="dc-h413" aria-label="Discard held sale HOLD-0006" style={{ height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Discard</button>
                    <button type="button" className="dc-h414" aria-label="Resume held sale HOLD-0006" style={{ height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}>Resume sale</button>
                  </span>
                </div>
              </div>
              <div className="dc-h415" style={{ flex: "none", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>SB</span>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Sumaiya Binte Alam — +8801933551188</span>
                    <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>HOLD-0005 · 9 items · 14 units · held 1 h 22 min ago by Rahim Uddin</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳12,740.00</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1:50 PM</span>
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", padding: "0 9px", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>Bulk order · awaiting approval</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    <button type="button" className="dc-h416" aria-label="Discard held sale HOLD-0005" style={{ height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Discard</button>
                    <button type="button" className="dc-h417" aria-label="Resume held sale HOLD-0005" style={{ height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}>Resume sale</button>
                  </span>
                </div>
              </div>
              <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                <span style={{ height: "1px", flex: "1", background: "#e2e8f0" }} />
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Recent sales tab</span>
                <span style={{ height: "1px", flex: "1", background: "#e2e8f0" }} />
              </div>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div style={{ flex: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", padding: "9px 12px", borderBottom: "1px solid #f1f5f9", background: "#fff" }}>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Shirin Akter · 3 items · cash + bKash</span>
                    <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>ORD-20260907-0044 · 3:41 PM</span>
                  </span>
                  <span style={{ flex: "none", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>৳2,410.00</span>
                  <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)", whiteSpace: "nowrap" }}>Paid</span>
                  <button type="button" className="dc-h418" aria-label="Reprint receipt for ORD-20260907-0044" title="Reprint receipt" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                    <__Icon name="printer" strokeWidth="1.75" width="17" height="17" />
                  </button>
                  <button type="button" className="dc-h419" aria-label="Open sale ORD-20260907-0044" title="Open details" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                    <__Icon name="arrow-up-right" strokeWidth="1.75" width="17" height="17" />
                  </button>
                </div>
                <div style={{ flex: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", padding: "9px 12px", borderBottom: "1px solid #f1f5f9", background: "#fff" }}>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Walk-in · 1 item · cash</span>
                    <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>ORD-20260907-0043 · 3:12 PM</span>
                  </span>
                  <span style={{ flex: "none", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>৳650.00</span>
                  <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)", whiteSpace: "nowrap" }}>Paid</span>
                  <button type="button" className="dc-h420" aria-label="Reprint receipt for ORD-20260907-0043" title="Reprint receipt" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                    <__Icon name="printer" strokeWidth="1.75" width="17" height="17" />
                  </button>
                  <button type="button" className="dc-h421" aria-label="Open sale ORD-20260907-0043" title="Open details" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                    <__Icon name="arrow-up-right" strokeWidth="1.75" width="17" height="17" />
                  </button>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", background: "#fff" }}>
                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Kamrul Hasan · 5 items · card</span>
                    <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>ORD-20260907-0042 · 2:44 PM</span>
                  </span>
                  <span style={{ flex: "none", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>৳8,120.00</span>
                  <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.12)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c1008f", whiteSpace: "nowrap" }}>Refunded</span>
                  <button type="button" className="dc-h422" aria-label="Reprint receipt for ORD-20260907-0042" title="Reprint receipt" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                    <__Icon name="printer" strokeWidth="1.75" width="17" height="17" />
                  </button>
                  <button type="button" className="dc-h423" aria-label="Open sale ORD-20260907-0042" title="Open details" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                    <__Icon name="arrow-up-right" strokeWidth="1.75" width="17" height="17" />
                  </button>
                </div>
              </div>
              <span style={{ flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Reprint the receipt or open the full sale — refunds and exchanges start from the sale details.</span>
              <div style={{ flex: "none", borderTop: "1px solid #e2e8f0", padding: "12px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>3 held · ৳18,005.00 parked</span>
                <button type="button" className="dc-h424" style={{ marginLeft: "auto", height: "44px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}>Print held list</button>
                <button type="button" className="dc-h425" style={{ height: "44px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" />New sale</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
