'use client';
// Generated from design/templates/settings-console/SetGeneral.dc.html by scripts/convert-design.mjs.
// SetGeneral
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
.dc-h434:hover{background:#f8fafc !important}
.dc-h435:hover{color:#1e293b !important}
.dc-h436:hover{color:#1e293b !important}
.dc-h437:hover{color:#1e293b !important}
.dc-h438:hover{color:#1e293b !important}`;

// ---- markup ----

export default class SetGeneralScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetGeneral">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__SettingsSwitcher />
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar crumb="General" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail active="general" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>General</h1>
                        <p style={{ margin: "0", maxWidth: "620px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Store identity, formats and contact details. These values appear on the storefront, on invoices, on POS receipts and in every outgoing message. Fields marked <span style={{ color: "#c2380f" }}>*</span> are required.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />Configured · 26 settings</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Last saved 7 Sep 2026, 3:12 pm</span>
                      </span>
                    </header>
                    <section id="identity" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Store identity</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>The name and legal text shown to customers.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "11.5px", color: "#94a3b8" }}>3 settings</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Store name <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Used in the browser title, invoice header, receipt header and the sender name on emails.</span>
                          <div style={{ display: "flex", alignItems: "center", height: "38px", maxWidth: "420px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>Sellino — Smart Commerce</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Copyright line <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Sits in the storefront footer. Plain text — no HTML.</span>
                          <div style={{ minHeight: "56px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontSize: "13.5px", lineHeight: "20px", color: "#1e293b" }}>© 2026 Sellino — Smart Commerce. All rights reserved. Trade licence 1043/FEN-2021.</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Footer about</span>
                            <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>212 / 400</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Short description under the logo in the storefront footer. Two or three sentences reads best.</span>
                          <div style={{ minHeight: "82px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontSize: "13.5px", lineHeight: "20px", color: "#1e293b" }}>Sellino is a multi-warehouse commerce platform for Bangladeshi retailers — one catalogue, one stock ledger and one register across every branch. Shop online or visit us in Feni, Gulshan and Chattogram.</div>
                        </div>
                      </div>
                    </section>
                    <section id="formats" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>{"Formats & locale"}</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Every format shows a live sample of what it produces.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "11.5px", color: "#94a3b8" }}>6 settings</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Currency <span style={{ color: "#c2380f" }}>*</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", color: "#b36a00" }}><__Icon name="shield-alert" strokeWidth="1.75" width="12" height="12" />Confirm to change</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Sets the symbol and decimal rule everywhere. Prices already stored are <b style={{ fontWeight: "600", color: "#475569" }}>not</b> converted.</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>Bangladeshi Taka — ৳ (BDT)<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "#94a3b8" }} /></span>
                          </div>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Preview<b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Default country <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Pre-selected on checkout, seller onboarding and address forms.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>Bangladesh<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "#94a3b8" }} /></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Timezone <span style={{ color: "#c2380f" }}>*</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", color: "#b36a00" }}><__Icon name="shield-alert" strokeWidth="1.75" width="12" height="12" />Confirm to change</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Stamps orders, reports and register shifts. Changing it re-labels historical timestamps.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>(UTC+06:00) Asia/Dhaka<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "#94a3b8" }} /></span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Now<b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4:14 pm · 7 Sep 2026</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Date format <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Applies to admin tables, invoices and customer-facing dates.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>Mon D, YYYY<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "#94a3b8" }} /></span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Preview<b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>Sep 7, 2026</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Time format <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Bangla staff commonly read 12-hour time; reports stay 24-hour regardless.</span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "2px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "3px" }}>
                            <span style={{ display: "inline-flex", height: "30px", alignItems: "center", borderRadius: "6px", background: "#fff", padding: "0 13px", fontSize: "13px", fontWeight: "600", color: "#1e293b", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>12-hour</span>
                            <span style={{ display: "inline-flex", height: "30px", alignItems: "center", borderRadius: "6px", padding: "0 13px", fontSize: "13px", color: "#64748b" }}>24-hour</span>
                          </span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Preview<b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4:14 pm</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Rows per page</span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>How many records every admin table loads at once. Above 100 slows reports on large catalogues.</span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", height: "38px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", overflow: "hidden" }}>
                            <span style={{ flex: "1", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>25</span>
                            <span style={{ display: "flex", flexDirection: "column", flex: "none", width: "28px", height: "100%", borderLeft: "1px solid #e2e8f0" }}>
                              <span style={{ flex: "1", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                                <__Icon name="chevron-up" strokeWidth="1.75" width="13" height="13" />
                              </span>
                              <span style={{ flex: "1", display: "grid", placeItems: "center", color: "#64748b" }}>
                                <__Icon name="chevron-down" strokeWidth="1.75" width="13" height="13" />
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="assets" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Brand assets</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Eight images used across storefront, invoices and receipts. Each tile states its own size and format.</span>
                        </span>
                        <span className="dc-h434" style={{ marginLeft: "auto", flex: "none", display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontSize: "12.5px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Manage all 8<__Icon name="arrow-up-right" strokeWidth="1.75" width="15" height="15" /></span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "grid", placeItems: "center", height: "74px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "repeating-linear-gradient(135deg,#f8fafc 0 6px,#f1f5f9 6px 12px)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: "600", color: "#003087" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "6px", background: "#003087", fontSize: "11px", color: "#fff" }}>S</span>Sellino</span>
                          </span>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Light theme logo</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>SVG or PNG · 320×80</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "grid", placeItems: "center", height: "74px", border: "1px solid #26334d", borderRadius: "8px", background: "#192132" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: "600", color: "#66c4eb" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "6px", background: "#009cde", fontSize: "11px", color: "#0b1524" }}>S</span>Sellino</span>
                          </span>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Dark theme logo</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>SVG or PNG · 320×80</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "grid", placeItems: "center", height: "74px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "8px", background: "#003087", fontSize: "14px", fontWeight: "600", color: "#fff" }}>S</span>
                          </span>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Favicon</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>PNG · 64×64</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", height: "74px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#f8fafc", color: "#94a3b8" }}>
                            <__Icon name="image-plus" strokeWidth="1.75" width="18" height="18" />
                            <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10px" }}>fallback image</span>
                          </span>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Fallback image</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#b36a00" }}>Not set · 600×600</span>
                        </div>
                      </div>
                    </section>
                    <section id="support" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Support information</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Published in the footer, on invoices and in the storefront help widget.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "11.5px", color: "#94a3b8" }}>8 settings</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Support phone <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Shown as a tap-to-call link on mobile. Include the country code.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="phone" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />+8801811843300</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Support email <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Receives contact-form messages and appears as the reply-to on order mail.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}><__Icon name="mail" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />info@bugbuild.com</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Working hours text</span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Free text shown to customers — write it the way you would say it.</span>
                          <span style={{ display: "flex", alignItems: "center", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>Sat–Thu, 10:00 am – 8:00 pm</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Store address <span style={{ color: "#c2380f" }}>*</span></span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Printed on invoices and used as the return address for courier pickups.</span>
                          <div style={{ minHeight: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontSize: "13.5px", lineHeight: "19px", color: "#1e293b" }}>4th floor, Feni Center, Feni-3900, Bangladesh</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Support line hours</span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>When the phone line is staffed. Outside these hours the widget offers the AI reply instead.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />09:00 am</span>
                            <span style={{ flex: "none", fontSize: "12px", color: "#94a3b8" }}>to</span>
                            <span style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />10:00 pm</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Service window</span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Hours in which delivery slots can be booked by customers.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />10:00 am</span>
                            <span style={{ flex: "none", fontSize: "12px", color: "#94a3b8" }}>to</span>
                            <span style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />08:00 pm</span>
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="location" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Store location</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>The map embedded on the contact page.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "11.5px", color: "#94a3b8" }}>1 setting</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Google Maps embed code</span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Google Maps → Share → <b style={{ fontWeight: "600", color: "#475569" }}>Embed a map</b> → copy the whole <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>{"<iframe>"}</span>. Pasted code is sanitised before it is stored.</span>
                          <div style={{ minHeight: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", padding: "9px 11px", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", lineHeight: "18px", color: "#334155", wordBreak: "break-all" }}>{"<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.62!2d91.3976!3d23.0159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1\" width=\"100%\" height=\"360\" loading=\"lazy\"></iframe>"}</div>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#059669" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Valid embed · resolves to Feni Center, Feni</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Preview</span>
                          <span style={{ display: "grid", placeItems: "center", height: "130px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "repeating-linear-gradient(135deg,#f8fafc 0 8px,#f1f5f9 8px 16px)", color: "#94a3b8" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                              <__Icon name="map-pin" strokeWidth="1.75" width="20" height="20" style={{ color: "#003087" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px" }}>map preview · 23.0159, 91.3976</span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#identity" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Store identity<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>3</span></a>
                      <a className="dc-h435" href="#formats" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>{"Formats & locale"}<span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>6</span></a>
                      <a className="dc-h436" href="#assets" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Brand assets<span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>8</span></a>
                      <a className="dc-h437" href="#support" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Support info<span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>8</span></a>
                      <a className="dc-h438" href="#location" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Store location<span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>1</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Changes to currency, timezone and storage driver ask for confirmation before they save.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}><__Icon name="circle-check" strokeWidth="1.75" width="17" height="17" style={{ color: "#10b981" }} />All changes saved<span style={{ color: "#94a3b8" }}>· 3:12 pm by Ashiq Khan</span></span>
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
