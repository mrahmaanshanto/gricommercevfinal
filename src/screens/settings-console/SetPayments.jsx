'use client';
// Generated from design/templates/settings-console/SetPayments.dc.html by scripts/convert-design.mjs.
// SetPayments
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __SetChrome from '@/screens/settings-console/SetChrome';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `html,body{height:100%}
.dc-h442:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h443:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h444:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h445:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h446:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h447:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h448:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h449:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h450:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h451:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h452:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h453:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h454:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h455:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h456:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h457:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h458:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h459:hover{background:#f1f5f9 !important;color:#475569 !important}`;

// ---- markup ----

export default class SetPaymentsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetPayments">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__SettingsSwitcher />
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar crumb="Payment Gateway" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail active="payment" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>Payment Gateway</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Ten payment routes on one screen. The list carries the state that matters — on, off, live or sandbox — and only the gateway you open shows its credential form.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>4 live · 1 sandbox · 3 offline</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Last saved 7 Sep 2026, 11:04 am</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Online gateways</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Enable a gateway here, then open it to enter credentials. Order of the list is the order customers see at checkout.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>4 live</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "#b36a00" }}>1 sandbox</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="arrow-up-down" strokeWidth="1.75" width="15" height="15" />Reorder</button>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#f1f5f9", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#475569" }}>COD</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>Cash on delivery</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>No credentials needed · 62% of orders last month</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Always live</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                        <button className="dc-h442" aria-label="Expand" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#003087", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>SSL</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>SSLCommerz</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Cards, internet banking and mobile wallets · merchant sellino_live</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>LIVE</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                        <button className="dc-h443" aria-label="Expand" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#00a651", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>EPS</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>EPS</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Test account · no live credentials entered yet</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "#b36a00" }}>SANDBOX</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#ff9800" }} />
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                        <button className="dc-h444" aria-label="Expand" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#f6821f", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>NGD</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>Nagad</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Merchant 6801811843300 · wallet only</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>LIVE</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                        <button className="dc-h445" aria-label="Expand" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div style={{ border: "1px solid #003087", borderRadius: "10px", margin: "0 10px 10px", background: "#fff", boxShadow: "0 8px 22px -14px rgba(0,48,135,.5)", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 14px", background: "rgba(0,48,135,.05)" }}>
                          <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#e2136e", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>bK</span>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>bKash</span>
                            <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Tokenised checkout · 31% of online payments</span>
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>LIVE</span>
                          <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                          <button aria-label="Collapse" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#fff", color: "#475569", cursor: "pointer" }}>
                            <__Icon name="chevron-up" strokeWidth="1.75" width="17" height="17" />
                          </button>
                        </div>
                        <div style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "11px", border: "1px solid rgba(255,152,0,.4)", borderRadius: "9px", background: "rgba(255,152,0,.08)", padding: "11px 13px" }}>
                            <__Icon name="triangle-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "#b36a00" }} />
                            <span style={{ display: "block", flex: "1", minWidth: "0", fontSize: "12.5px", lineHeight: "18px", color: "#7a4a00" }}>Live mode charges real customers on your production merchant account. Refunds must then be issued from the bKash portal — they cannot be reversed here.</span>
                            <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "2px", height: "34px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "3px" }}>
                              <span style={{ display: "inline-flex", height: "26px", alignItems: "center", borderRadius: "6px", padding: "0 12px", fontSize: "12px", color: "#64748b" }}>Sandbox</span>
                              <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "6px", borderRadius: "6px", background: "#b36a00", padding: "0 12px", fontSize: "12px", fontWeight: "600", color: "#fff" }}>Live</span>
                            </span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px 20px", padding: "16px 0 4px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>App key <span style={{ color: "#c2380f" }}>*</span></span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>bKash Merchant Portal → Developer → API Keys. Same value as “app_key” in the checkout SDK.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>••••••••••••4c9f</span>
                                <button className="dc-h446" aria-label="Reveal" title="Reveal" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                                </button>
                                <button className="dc-h447" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                </button>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>App secret <span style={{ color: "#c2380f" }}>*</span></span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Saved</span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Stored encrypted. Once saved it is never displayed again — replace it if you rotate the key.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#94a3b8" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Secret saved · 17 Aug 2026</span>
                                <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Replace</button>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Username <span style={{ color: "#c2380f" }}>*</span></span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>The merchant username issued with your bKash tokenised checkout account.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>sellino_bd</span>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Password <span style={{ color: "#c2380f" }}>*</span></span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Rotates every 90 days in the bKash portal. Reveal is logged in the audit trail.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>••••••••••</span>
                                <button className="dc-h448" aria-label="Reveal" title="Reveal" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                                </button>
                                <button className="dc-h449" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                </button>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Merchant number</span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Printed on customer receipts and used for offline send-money reconciliation.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "220px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>01811-843300</span>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Checkout label</span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>What customers see at checkout. Bangla label falls back to this if unset.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>bKash — pay from app or wallet</span>
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "11px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                            <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", borderRadius: "8px", background: "rgba(16,185,129,.1)", padding: "7px 11px", fontSize: "12px", color: "#047857" }}><__Icon name="circle-check" strokeWidth="1.75" width="15" height="15" style={{ color: "#059669" }} />Connected · grant token issued in 380 ms</span>
                            <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "#94a3b8" }}>Last tested 7 Sep 2026, 4:12 pm · 62 transactions today</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "16px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>Optional configuration</span>
                            <span style={{ height: "1px", flex: "1", background: "#e2e8f0" }} />
                            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>3 of 4 configured · collapsed sections keep their values</span>
                          </span>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe", cursor: "pointer" }}>
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#94a3b8" }} />
                              <__Icon name="link" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Webhook / callback URLs</span>
                                <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Generated for you — paste the IPN URL into the bKash Merchant Portal.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Copy only</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px" }}>
                              <span style={{ display: "block", maxWidth: "720px", fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>bKash Merchant Portal → <b style={{ fontWeight: "600", color: "#475569" }}>Application → Callback URL</b>. Tokenised Checkout returns the buyer through the Success URL directly; IPN is optional but recommended — it calls <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>payment/status</span> to confirm before the order is marked paid.</span>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>IPN / Webhook URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "#b36a00" }}>Required</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/ipn?sid=696</span>
                                    <button className="dc-h450" aria-label="Copy URL" title="Copy URL" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Last delivery 4:09 pm · 62 callbacks today, none failed</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Success URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Optional</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/success</span>
                                    <button className="dc-h451" aria-label="Copy URL" title="Copy URL" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Fail URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Optional</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/fail</span>
                                    <button className="dc-h452" aria-label="Copy URL" title="Copy URL" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Cancel URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Optional</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/cancel</span>
                                    <button className="dc-h453" aria-label="Copy URL" title="Copy URL" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe", cursor: "pointer" }}>
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#94a3b8" }} />
                              <__Icon name="sliders-horizontal" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Payment rules</span>
                                <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Order value limits, which payment modes this gateway may serve, and where it sits in the list.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>3 modes on</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "14px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Priority</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Lower shows first at checkout. Ties fall back to alphabetical.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>100</span>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Min order amount</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Gateway is hidden below this subtotal. Leave empty for no floor.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>No minimum</span>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Max order amount</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Useful where the wallet itself caps a single transaction — bKash allows ৳25,000.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>25,000.00</span>
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Allowed payment modes</span>
                                <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "620px" }}>What a buyer may pay online through this gateway. Anything not ticked falls to cash on delivery.</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "2px" }}>
                                  <span style={{ display: "flex", gap: "10px" }}>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", flex: "1", minWidth: "0", border: "1px solid #003087", borderRadius: "9px", background: "rgba(0,48,135,.05)", padding: "10px 12px", cursor: "pointer" }}>
                                      <span style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", flex: "none", marginTop: "1px", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
                                        <__Icon name="check" strokeWidth="1.75" width="12" height="12" />
                                      </span>
                                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                        <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Full payment</span>
                                        <span style={{ display: "block", paddingTop: "2px", fontSize: "11px", lineHeight: "16px", color: "#64748b" }}>Buyer pays the whole order online.</span>
                                      </span>
                                    </label>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", flex: "1", minWidth: "0", border: "1px solid #003087", borderRadius: "9px", background: "rgba(0,48,135,.05)", padding: "10px 12px", cursor: "pointer" }}>
                                      <span style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", flex: "none", marginTop: "1px", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
                                        <__Icon name="check" strokeWidth="1.75" width="12" height="12" />
                                      </span>
                                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                        <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Delivery charge only</span>
                                        <span style={{ display: "block", paddingTop: "2px", fontSize: "11px", lineHeight: "16px", color: "#64748b" }}>Buyer pays only the delivery charge; the courier collects the balance.</span>
                                      </span>
                                    </label>
                                  </span>
                                  <span style={{ display: "flex", gap: "10px" }}>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", flex: "1", minWidth: "0", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                                      <span style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", flex: "none", marginTop: "1px", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />
                                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                        <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Fixed advance</span>
                                        <span style={{ display: "block", paddingTop: "2px", fontSize: "11px", lineHeight: "16px", color: "#64748b" }}>Buyer pays a set amount up front.</span>
                                      </span>
                                    </label>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", flex: "1", minWidth: "0", border: "1px solid #003087", borderRadius: "9px", background: "rgba(0,48,135,.05)", padding: "10px 12px", cursor: "pointer" }}>
                                      <span style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", flex: "none", marginTop: "1px", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
                                        <__Icon name="check" strokeWidth="1.75" width="12" height="12" />
                                      </span>
                                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                        <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Percentage advance</span>
                                        <span style={{ display: "block", paddingTop: "2px", fontSize: "11px", lineHeight: "16px", color: "#64748b" }}>Buyer pays a share of the order up front.</span>
                                      </span>
                                    </label>
                                  </span>
                                  <span style={{ display: "flex", gap: "10px" }}>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", flex: "1", minWidth: "0", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                                      <span style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", flex: "none", marginTop: "1px", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />
                                      <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                        <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Required prepay (per product)</span>
                                        <span style={{ display: "block", paddingTop: "2px", fontSize: "11px", lineHeight: "16px", color: "#64748b" }}>Amount computed from each product’s own prepay rule.</span>
                                      </span>
                                    </label>
                                    <span style={{ flex: "1" }} />
                                  </span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderLeft: "2px solid #e2e8f0", padding: "6px 0 0 14px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Fixed advance amount</span>
                                    </span>
                                    <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Disabled — tick “Fixed advance” to set it.</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                      <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>৳ 0.00</span>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Advance percentage</span>
                                    </span>
                                    <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Applied to the order subtotal, before delivery charge.</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                      <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>20%</span>
                                    </span>
                                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>A ৳1,240 order asks for <b style={{ fontWeight: "600", color: "#1e293b" }}>৳248</b> now, <b style={{ fontWeight: "600", color: "#1e293b" }}>৳992</b> on delivery.</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ border: "1px solid #e2e8f0", borderRadius: "9px", padding: "2px 13px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Force full payment</span>
                                    <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>When this gateway is eligible, cash on delivery is not offered for the order at all.</span>
                                  </span>
                                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                                    <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe", cursor: "pointer" }}>
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#94a3b8" }} />
                              <__Icon name="star" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Payment discount</span>
                                <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Reward buyers for paying with this gateway. Applied to the online amount at checkout.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Off</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px" }}>
                              <div style={{ border: "1px solid #e2e8f0", borderRadius: "9px", padding: "2px 13px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Payment discount</span>
                                    <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Off — the four fields below are kept but ignored until this is on.</span>
                                  </span>
                                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                                    <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", opacity: ".6" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Discount type</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Percentage or a flat amount off.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Percentage</span>
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Value</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>bKash merchant cashback is commonly 1–2%.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1.5%</span>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Maximum discount</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Caps the reward on large orders.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>৳ 150.00</span>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Minimum order</span>
                                  </span>
                                  <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Below this subtotal no discount is given.</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>৳ 500.00</span>
                                  </span>
                                </div>
                              </div>
                              <span style={{ display: "flex", alignItems: "center", gap: "9px", borderRadius: "8px", background: "#f1f5f9", padding: "9px 12px", fontSize: "11.5px", color: "#64748b" }}><__Icon name="receipt" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />Checkout line would read <b style={{ fontWeight: "600", color: "#1e293b" }}>bKash discount −৳18.60</b> on a ৳1,240 order. The discount is your cost, not bKash’s.</span>
                            </div>
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe", cursor: "pointer" }}>
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#94a3b8" }} />
                              <__Icon name="git-branch" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Advanced conditions</span>
                                <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Different payment modes by delivery area, customer segment and cart category.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>2 areas · 4 segments</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "14px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <span style={{ display: "block" }}>
                                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Delivery area rules</span>
                                  <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Restrict the allowed modes by where the buyer wants delivery. Empty means the gateway rules above apply unchanged.</span>
                                </span>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Inside Dhaka</span>
                                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>Same-day and next-day zones</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Delivery charge only</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Fixed advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Percentage advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Required prepay (per product)</label>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Outside Dhaka</span>
                                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>Courier network · higher return rate</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Delivery charge only</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Fixed advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Percentage advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Required prepay (per product)</label>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <span style={{ display: "block" }}>
                                  <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Customer type rules</span>
                                  <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Applies to logged-in buyers only — guest checkout skips these and uses the gateway rules.</span>
                                </span>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>New customer</span>
                                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>No completed orders yet</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Delivery charge only</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Fixed advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Percentage advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Required prepay (per product)</label>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Returning customer</span>
                                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>At least one completed order</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Delivery charge only</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Fixed advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Percentage advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Required prepay (per product)</label>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Wholesale</span>
                                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>Merchant-tagged bulk buyer</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Delivery charge only</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Fixed advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Percentage advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Required prepay (per product)</label>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>VIP</span>
                                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>Merchant-tagged loyalty tier</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Delivery charge only</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Fixed advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Percentage advance</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "11.5px", color: "#475569", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "1.5px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#fff" }} />Required prepay (per product)</label>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <span style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                    <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Category rules</span>
                                    <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Force different modes when specific product categories are in the cart. First matching rule wins.</span>
                                  </span>
                                  <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />Add rule</button>
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "10px 12px" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "26px", flex: "none", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "11.5px", fontWeight: "500", color: "#334155" }}><__Icon name="tag" strokeWidth="1.75" width="13" height="13" style={{ color: "#94a3b8" }} />{"Mobile & Electronics"}</span>
                                    <__Icon name="arrow-right" strokeWidth="1.75" width="15" height="15" style={{ flex: "none", color: "#cbd5e1" }} />
                                    <span style={{ flex: "1", minWidth: "0", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Full payment</label>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Percentage advance</label>
                                    </span>
                                    <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                                      <button className="dc-h454" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                      <button className="dc-h455" aria-label="Delete rule" title="Delete rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "9px", background: "#fff", padding: "10px 12px" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "26px", flex: "none", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "11.5px", fontWeight: "500", color: "#334155" }}><__Icon name="tag" strokeWidth="1.75" width="13" height="13" style={{ color: "#94a3b8" }} />Grocery · Fresh</span>
                                    <__Icon name="arrow-right" strokeWidth="1.75" width="15" height="15" style={{ flex: "none", color: "#cbd5e1" }} />
                                    <span style={{ flex: "1", minWidth: "0", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "1px solid #003087", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "0 10px", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}><span style={{ display: "grid", placeItems: "center", width: "14px", height: "14px", flex: "none", border: "none", borderRadius: "4px", background: "#003087", color: "#fff" }}>
  <__Icon name="check" strokeWidth="1.75" width="10" height="10" />
</span>Delivery charge only</label>
                                    </span>
                                    <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                                      <button className="dc-h456" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                      <button className="dc-h457" aria-label="Delete rule" title="Delete rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#635bff", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>STR</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>Stripe</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>International cards · not configured</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Not set up</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", border: "1.5px solid #cbd5e1", boxSizing: "border-box" }} />
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                        </span>
                        <button className="dc-h458" aria-label="Expand" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#003087", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>PP</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>PayPal</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Export orders only · unavailable to BD-domiciled merchants</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Not set up</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", border: "1.5px solid #cbd5e1", boxSizing: "border-box" }} />
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                        </span>
                        <button className="dc-h459" aria-label="Expand" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Currency exchange rates</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Base currency is BDT. Used for the AI spend cap, Stripe settlements and export-order pricing.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Fetched 7 Sep, 6:00 am</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="15" height="15" />Refresh rates</button>
                        </span>
                      </div>
                      <div style={{ padding: "6px 0 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#94a3b8" }}>
                          <span style={{ width: "60px", flex: "none" }}>Code</span>
                          <span style={{ flex: "1" }}>Currency</span>
                          <span style={{ width: "40px", flex: "none" }} />
                          <span style={{ width: "150px", flex: "none" }}>Rate in ৳</span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right" }}>30-day</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>USD</span>
                          <span style={{ flex: "1", minWidth: "0", color: "#64748b" }}>US Dollar</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "#94a3b8" }}>1 USD</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>121.40</span>
                            </span>
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#059669" }}>+0.9%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>EUR</span>
                          <span style={{ flex: "1", minWidth: "0", color: "#64748b" }}>Euro</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "#94a3b8" }}>1 EUR</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>131.20</span>
                            </span>
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#059669" }}>+1.4%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>GBP</span>
                          <span style={{ flex: "1", minWidth: "0", color: "#64748b" }}>Pound Sterling</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "#94a3b8" }}>1 GBP</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>154.75</span>
                            </span>
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#c2380f" }}>−0.3%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", fontSize: "12.5px" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>INR</span>
                          <span style={{ flex: "1", minWidth: "0", color: "#64748b" }}>Indian Rupee</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "#94a3b8" }}>1 INR</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1.38</span>
                            </span>
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#059669" }}>+0.2%</span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Offline gateways</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Customer pays outside the platform, then submits the transaction ID. Orders wait in “payment review”.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>2 on</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />Add gateway</button>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#e2136e", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>bK</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>bKash send money</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Instructions shown at checkout, in Bangla and English. 14 orders awaiting review.</span>
                        </span>
                        <span style={{ width: "230px", flex: "none" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__Icon name="smartphone" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>01811-843300</span>
                          </span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#8a2be2", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>RKT</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>Rocket send money</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Dutch-Bangla mobile banking. Account must include the trailing digit.</span>
                        </span>
                        <span style={{ width: "230px", flex: "none" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__Icon name="smartphone" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>018118433001</span>
                          </span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "13px 16px" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#0f172a", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".02em", color: "#fff" }}>BNK</span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}>Bank transfer</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>City Bank PLC · Feni branch · A/C Sellino Smart Commerce Ltd.</span>
                        </span>
                        <span style={{ width: "230px", flex: "none" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__Icon name="landmark" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1402 3387 9915 004</span>
                          </span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Online gateways<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>7 + 4</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Exchange rates<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>4</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Offline gateways<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>3</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Optional configuration keeps its values while collapsed. A gateway in Live mode is marked in red everywhere it appears.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}><__Icon name="circle-check" strokeWidth="1.75" width="17" height="17" style={{ color: "#10b981" }} />All changes saved<span style={{ color: "#94a3b8" }}>· 11:04 am by Ashiq Khan</span></span>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>⌘S saves from anywhere on the page</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "40px", borderRadius: "8px", padding: "0 14px", fontSize: "13px", fontWeight: "500", color: "#cbd5e1", cursor: "not-allowed" }}>Discard</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "40px", borderRadius: "8px", background: "#f1f5f9", padding: "0 18px", fontSize: "13px", fontWeight: "500", letterSpacing: ".02em", color: "#94a3b8", cursor: "not-allowed" }}>Save changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
