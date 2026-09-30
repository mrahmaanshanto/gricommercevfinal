'use client';
// Generated from design/templates/settings-console/SetPreference.dc.html by scripts/convert-design.mjs.
// SetPreference
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
.dc-h460:hover{background:#e9eef5 !important;color:#1e293b !important}`;

// ---- markup ----

export default class SetPreferenceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetPreference">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome embedded /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar embedded crumb="Preference" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail embedded active="preference" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>Preference</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Identifiers, login security, OTP delivery, order mail and what sellers may publish on their own. Around twenty switches — each one says what it does and what it costs you.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />Configured · 22 settings</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Saved a moment ago</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Identifiers</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Prefixes are prepended to generated codes. Existing records keep the ID they were created with.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>4 settings</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Customer ID prefix <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Shown on the membership card and in the POS customer search.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>SLC-</span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Next ID<b style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>SLC-004182</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Seller ID prefix <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Used in seller payouts and commission statements.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>SLS-</span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Next ID<b style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>SLS-000246</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Admin ID prefix <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Appears in the staff directory and audit log.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>SLA-</span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Next ID<b style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>SLA-000031</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Order code prefix <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Order codes combine the prefix, the order date and a daily counter.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>ORD-</span>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Next ID<b style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b" }}>ORD-20260907-0001</b></span>
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Security</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Applies to every admin and seller account on this store.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>7 settings</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Two-factor OTP on admin login<span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "10px", fontWeight: "600", color: "#059669" }}>Recommended</span></span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>After the password, admins enter a one-time code. Strongly recommended — an admin session can refund orders and export customer data.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Send OTP by email</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Delivered through the Mail tab settings. Free, but slower on some Bangladeshi providers.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Send OTP by SMS</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Delivered through MIM SMS. Each code costs roughly ৳0.35.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", borderTop: "1px solid #f1f5f9", padding: "14px 0 4px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>OTP length</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Six digits is the norm in Bangladesh. Four is easier to type; eight is harder to guess.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>6</span>
                            <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "7px", background: "#f1f5f9", padding: "0 9px", fontSize: "12px", color: "#64748b" }}>Sample<b style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600", color: "#1e293b", letterSpacing: ".14em" }}>418 023</b></span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>OTP validity</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Minutes before the code expires and a new one must be requested.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>5 minutes<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "#94a3b8" }} /></span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Secure delivery OTP</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>The delivery man must enter a code from the customer before an order is marked delivered. Cuts “never received” disputes.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 0 12px 0" }}>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>Applies to</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", height: "34px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "3px" }}>
                            <span style={{ display: "inline-flex", height: "26px", alignItems: "center", borderRadius: "6px", background: "#fff", padding: "0 12px", fontSize: "12px", fontWeight: "600", color: "#1e293b", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Platform orders only</span>
                            <span style={{ display: "inline-flex", height: "26px", alignItems: "center", borderRadius: "6px", padding: "0 12px", fontSize: "12px", color: "#64748b" }}>All sellers</span>
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Turning this on for all sellers notifies 246 sellers by email.</span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Order notification emails</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Master switch first; per-status mail can then be tuned. Customers always receive the order-placed receipt.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.14)", padding: "0 9px", fontSize: "11px", fontWeight: "600", color: "#059669" }}>4 of 4 on</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Send order notification emails</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>When off, no status mail is sent at all and the four switches below are ignored.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ marginTop: "8px", borderLeft: "2px solid #e2e8f0", paddingLeft: "14px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Processing</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Sent when the warehouse accepts the order. “আপনার অর্ডার প্রস্তুত হচ্ছে”</span>
                            </span>
                            <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                              <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>To be shipped</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Sent when the order is packed and waiting for pickup.</span>
                            </span>
                            <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                              <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Shipped</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Includes the courier name and the tracking code from Pathao or Steadfast.</span>
                            </span>
                            <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                              <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Cancelled</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Sent on cancellation with the refund route and expected timing.</span>
                            </span>
                            <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                              <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section id="s3" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Seller approvals</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>{"What a seller may publish without a review from your team. Approvals queue under Customers & Sellers."}</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>6 settings</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Products need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>246 sellers · 38 products waiting. Off means seller products go live immediately.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Brands need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Prevents duplicate and misspelled brand records in the catalogue.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Categories need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Sellers may request a category; your team places it in the tree.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Attributes need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Keeps the filter set on the storefront clean.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Attribute values need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Values like “XL” or “Matte black” added by sellers.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Sellers may add their own delivery men</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Seller-managed riders can accept secure-delivery OTPs for that seller’s own orders only.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="s4" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Discovery</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Small storefront behaviours.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>1 setting</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 12px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Recently viewed products</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Keeps the last 12 products a customer opened, stored in their browser for 30 days.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Identifiers<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>4</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Security<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>7</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Order emails<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>5</span></a>
                      <a href="#s3" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Seller approvals<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>6</span></a>
                      <a href="#s4" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Discovery<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>1</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Switches save individually; numeric fields wait for Save changes.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "13.5px", fontWeight: "500", color: "#059669" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.16)" }}>
  <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
</span>18 settings saved</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Just now · applied to all 3 warehouses</span>
                  <button className="dc-h460" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "9999px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="undo-2" strokeWidth="1.75" width="13" height="13" />Undo</button>
                  <span style={{ flex: "1" }} />
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
