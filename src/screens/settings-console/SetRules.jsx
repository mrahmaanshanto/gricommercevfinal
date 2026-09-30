'use client';
// Generated from design/templates/settings-console/SetRules.dc.html by scripts/convert-design.mjs.
// SetRules
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
.dc-h466:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h467:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h468:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h469:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h470:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h471:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h472:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h473:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h474:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h475:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h476:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h477:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h478:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h479:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h480:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h481:hover{background:#f1f5f9 !important;color:#475569 !important}`;

// ---- markup ----

export default class SetRulesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetRules">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome embedded /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar embedded crumb="Auto-Reply Rules" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail embedded active="rules" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>Auto-Reply Rules</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Deterministic answers that run before the AI does — for the questions where an exact reply matters more than a clever one.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>5 rules · 4 on</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Last edited 6 Sep 2026, 9:41 pm</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Rules</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Checked top to bottom; the first match wins. Anything unmatched goes to the AI reply, or to the inbox if AI is off.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>5 rules · 4 on</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "150px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>All channels</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#003087", color: "#fff" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />Add rule</button>
                        </span>
                      </div>
                      <div style={{ overflow: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "9px 8px 9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Priority</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Type</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Channel</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Trigger</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>Response</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }}>On</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b" }} />
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />1</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>Keyword</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>All channels</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>“order status”, “অর্ডার কোথায়”</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "280px" }}>Asks for the order code, then returns live status from the courier.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button className="dc-h466" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h467" aria-label="Duplicate" title="Duplicate" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h468" aria-label="Delete" title="Delete" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />2</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>Keyword</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>WhatsApp · Widget</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>“bkash number”, “payment number”</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "280px" }}>Sends the bKash merchant number and the send-money steps.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button className="dc-h469" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h470" aria-label="Duplicate" title="Duplicate" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h471" aria-label="Delete" title="Delete" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr style={{ background: "rgba(0,48,135,.05)" }}>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />3</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Intent</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>All channels</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>return_or_exchange</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "280px" }}>Explains the 7-day policy and offers to open a return request.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button className="dc-h472" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h473" aria-label="Duplicate" title="Duplicate" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h474" aria-label="Delete" title="Delete" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />4</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "#b36a00" }}>Schedule</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>Widget · Messenger</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>outside 10:00–20:00</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "280px" }}>Posts the office-hours notice in Bangla and English, then queues the thread.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button className="dc-h475" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h476" aria-label="Duplicate" title="Duplicate" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h477" aria-label="Delete" title="Delete" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />5</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>Keyword</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>Messenger</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", color: "#1e293b" }}>
                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "11.5px", color: "#334155" }}>“wholesale”, “পাইকারি”</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "280px" }}>Collects quantity and city, then tags the thread for the B2B desk.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button className="dc-h478" aria-label="Edit rule" title="Edit rule" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h479" aria-label="Duplicate" title="Duplicate" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button className="dc-h480" aria-label="Delete" title="Delete" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "11px 16px", fontSize: "11.5px", color: "#64748b" }}><__Icon name="info" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />Drag the handle to reorder. Rule 3 is open in the editor.<span style={{ marginLeft: "auto" }}>1,284 rule matches this month · 43% of all replies</span></div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "352px", flex: "none", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 12px 30px -16px rgba(15,23,42,.3)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ display: "block" }}>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Edit rule 3</span>
                        <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Intent · return_or_exchange</span>
                      </span>
                      <button className="dc-h481" aria-label="Close" style={{ marginLeft: "auto", width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
                      </button>
                    </div>
                    <div style={{ flex: "1", minHeight: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Rule type</span>
                        </span>
                        <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Keyword matches text; intent uses the model’s classification; schedule fires on time of day.</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                          <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Intent</span>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Intent</span>
                        </span>
                        <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Trained intents from your last 90 days of conversations.</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                          <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>return_or_exchange</span>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Channels</span>
                        </span>
                        <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Leave all three on unless the wording differs per channel.</span>
                        <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", border: "1px solid #003087", borderRadius: "9999px", background: "rgba(0,48,135,.08)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#003087" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />Website widget</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", border: "1px solid #003087", borderRadius: "9999px", background: "rgba(0,48,135,.08)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#003087" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />WhatsApp</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", border: "1px solid #003087", borderRadius: "9999px", background: "rgba(0,48,135,.08)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#003087" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />Messenger</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Response</span>
                        </span>
                        <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>{"Supports {order_code}, {customer_name} and {policy_days}. Bangla version is generated on send."}</span>
                        <div style={{ minHeight: "96px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontSize: "12.5px", lineHeight: "19px", color: "#1e293b" }}>{"Returns are accepted within {policy_days} days of delivery with the original packaging. Share your order code and I’ll start the request for you."}</div>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#94a3b8" }}><__Icon name="languages" strokeWidth="1.75" width="13" height="13" />Bangla preview available after saving</span>
                      </div>
                      <span style={{ display: "flex", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Priority</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Lower runs first.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "80px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>3</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Then</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>What happens after the reply.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Offer return form</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                        </div>
                      </span>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Rule enabled</span>
                          <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Turning this off keeps the rule but stops it matching.</span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                        </span>
                      </div>
                    </div>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "12px 16px" }}>
                      <button style={{ height: "36px", border: "none", borderRadius: "8px", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Delete</button>
                      <span style={{ flex: "1" }} />
                      <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}>Cancel</button>
                      <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#003087", color: "#fff" }}><__Icon name="check" strokeWidth="1.75" width="15" height="15" />Save rule</button>
                    </div>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}><__Icon name="circle-check" strokeWidth="1.75" width="17" height="17" style={{ color: "#10b981" }} />All changes saved<span style={{ color: "#94a3b8" }}>· 9:41 pm by Nusrat Jahan</span></span>
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
