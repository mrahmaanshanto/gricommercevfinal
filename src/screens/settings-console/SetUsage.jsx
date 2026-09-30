'use client';
// Generated from design/templates/settings-console/SetUsage.dc.html by scripts/convert-design.mjs.
// SetUsage
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

const CSS = `html,body{height:100%}`;

// ---- markup ----

export default class SetUsageScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetUsage">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome embedded /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar embedded crumb="AI Usage" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail embedded active="usage" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>AI Usage</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>A reporting view that lives inside settings: what the assistant cost this month, by model, against the cap you set.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "190px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <__Icon name="calendar" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>September 2026</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="chart-line" strokeWidth="1.75" width="15" height="15" />Compare</button>
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Read-only · mirrors provider billing</span>
                      </span>
                    </header>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Spend against budget</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>September 2026 · cap $120.00 · billed by Anthropic in USD.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>35% used</span>
                          <a href="#" style={{ fontSize: "12px", fontWeight: "500", color: "#003087", textDecoration: "none" }}>Change cap</a>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "18px" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "10px", paddingBottom: "8px" }}>
                            <b style={{ fontSize: "28px", fontWeight: "600", letterSpacing: "-.02em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$42.18</b>
                            <span style={{ fontSize: "12.5px", color: "#64748b" }}>of $120.00 · ৳5,120 at ৳121.40</span>
                            <span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>Projected <b style={{ fontWeight: "600", color: "#1e293b" }}>$58.40</b> by 30 Sep</span>
                          </span>
                          <span style={{ display: "block", position: "relative", height: "10px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                            <span style={{ display: "block", width: "35%", height: "100%", borderRadius: "9999px", background: "#003087" }} />
                            <span style={{ position: "absolute", left: "35%", width: "14%", height: "100%", background: "repeating-linear-gradient(135deg,rgba(0,156,222,.5) 0 4px,rgba(0,156,222,.18) 4px 8px)" }} />
                          </span>
                          <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "5px", fontSize: "10.5px", color: "#94a3b8" }}>
                            <span>Spent</span>
                            <span>Projected</span>
                            <span>Cap $120</span>
                          </span>
                        </span>
                        <span style={{ display: "flex", gap: "12px" }}>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Replies</span>
                            <span style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-.01em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>1,596</span>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>+18% vs August</span>
                          </div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Avg cost / reply</span>
                            <span style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-.01em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$0.026</span>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>≈ ৳3.20</span>
                          </div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Resolved without a human</span>
                            <span style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-.01em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>71%</span>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>1,133 of 1,596 threads</span>
                          </div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Days at this rate</span>
                            <span style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-.01em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>87</span>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>before the cap is reached</span>
                          </div>
                        </span>
                        <span style={{ display: "block", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 15px" }}>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "10px", paddingBottom: "10px" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Daily spend</span>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>1–30 September · peak $2.41 on 27 Sep</span>
                            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "#64748b" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#003087" }} />Settled</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#009cde" }} />Not yet billed</span>
                            </span>
                          </span>
                          <span style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "92px" }}>
                            <span title="1 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "22%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="2 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "34%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="3 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "18%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="4 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "41%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="5 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "52%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="6 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "30%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="7 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "26%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="8 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "48%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="9 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "61%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="10 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "44%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="11 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "38%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="12 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "55%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="13 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "70%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="14 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "62%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="15 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "49%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="16 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "33%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="17 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "58%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="18 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "66%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="19 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "74%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="20 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "51%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="21 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "43%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="22 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "60%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="23 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "68%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="24 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "57%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="25 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "46%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="26 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "72%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="27 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "80%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="28 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "65%", borderRadius: "3px 3px 0 0", background: "#009cde", opacity: "1" }} />
                            </span>
                            <span title="29 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "54%", borderRadius: "3px 3px 0 0", background: "#009cde", opacity: "1" }} />
                            </span>
                            <span title="30 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "47%", borderRadius: "3px 3px 0 0", background: "#009cde", opacity: "1" }} />
                            </span>
                          </span>
                          <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", fontSize: "10.5px", color: "#94a3b8" }}>
                            <span>1 Sep</span>
                            <span>15 Sep</span>
                            <span>30 Sep</span>
                          </span>
                        </span>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Usage by model</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Read-only. Figures come from the provider’s billing API and are refreshed hourly.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Refreshed 4:00 pm</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="download" strokeWidth="1.75" width="15" height="15" />Export CSV</button>
                        </span>
                      </div>
                      <div style={{ overflow: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Model</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Replies</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Input tokens</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Output tokens</th>
                              <th style={{ padding: "9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Cost (USD)</th>
                              <th style={{ padding: "9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Share</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Claude Sonnet 5</span>
                                <span style={{ display: "block", fontSize: "11px", color: "#94a3b8" }}>Anthropic · current default</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>842</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>1,184,220</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>253,640</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$7.36</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "92%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Claude Haiku 4.5</span>
                                <span style={{ display: "block", fontSize: "11px", color: "#94a3b8" }}>Anthropic · used for FAQ intents</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>396</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>412,880</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>86,410</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$0.84</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "11%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Claude Opus 4.8</span>
                                <span style={{ display: "block", fontSize: "11px", color: "#94a3b8" }}>Anthropic · escalated threads only</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>46</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>96,140</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>31,880</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$1.28</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "16%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Llama-4-70b</span>
                                <span style={{ display: "block", fontSize: "11px", color: "#94a3b8" }}>Custom provider · Bangla-first replies</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>312</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>388,600</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>92,300</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$0.31</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "4%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr style={{ background: "#f8fafc" }}>
                              <td style={{ padding: "11px 16px", fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>September total</td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1,596</td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2,081,840</td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>464,230</td>
                              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$42.18</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "12px 15px" }}>
                      <__Icon name="info" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#94a3b8" }} />
                      <span style={{ flex: "1", minWidth: "0", fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>This tab is a report, not a form — nothing here is editable, so it has no save bar of its own. Change the cap or the model in <a href="#" style={{ fontWeight: "500", color: "#003087", textDecoration: "none" }}>AI Auto-Reply</a>.</span>
                    </div>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Spend vs budget<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }} /></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Usage by model<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>4</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Token counts include system prompts and retrieved product context.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}><__Icon name="lock" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />Read-only tab — nothing to save</span>
                  <span style={{ flex: "1" }} />
                  <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="arrow-up-right" strokeWidth="1.75" width="15" height="15" />Open AI Auto-Reply settings</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
