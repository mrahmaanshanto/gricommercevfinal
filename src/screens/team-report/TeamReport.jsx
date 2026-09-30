'use client';
// Generated from design/templates/team-report/TeamReport.dc.html by scripts/convert-design.mjs.
// TeamReport — Support and sales team performance — headline KPIs, agent leaderboard, channel mix and response-time trend for a chosen period.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:9999px}
.dc-h814:hover{background:#f8fafc !important}
.dc-h815:hover{background:#f8fafc !important}
.dc-h816:hover{background:#f8fafc !important}
.dc-h817:hover{background:#f8fafc !important}
.dc-h818:hover{background:#f8fafc !important}
.dc-h819:hover{background:#f8fafc !important}`;

// ---- markup ----

export default class TeamReportScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="TeamReport">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ display: "flex", gap: "12px", padding: "12px", height: "100vh", boxSizing: "border-box", overflow: "hidden", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="team-report" />
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc", overflow: "hidden" }}>
            <__Topbar crumb="Reports" page="Team performance" />
            <header style={{ zIndex: "90", display: "flex", minHeight: "76px", flex: "none", alignItems: "center", gap: "16px", padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ flex: "1", minWidth: "0" }}>
                <h1 style={{ margin: "0", fontSize: "18px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Team performance</h1>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>Support and sales · 6 agents · Asia/Dhaka</p>
              </span>
              <select style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 10px", fontSize: "14px", color: "#475569" }}>
                <option>Last 7 days</option>
                <option>Today</option>
                <option>Last 30 days</option>
                <option>This quarter</option>
              </select>
              <button className="dc-h814" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}><__Icon name="download" strokeWidth="1.75" width="16" height="16" />Export</button>
            </header>
            <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "32px 36px 44px", display: "grid", gap: "28px", alignContent: "start" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "20px" }}>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "26px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>1,284</p>
                    <span style={{ color: "#003087" }}>
                      <__Icon name="message-square" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Conversations handled</p>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f7a5a" }}>▲ 11%</span>
                  </div>
                </div>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "26px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>2m 14s</p>
                    <span style={{ color: "#ff9800" }}>
                      <__Icon name="timer" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>First response</p>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f7a5a" }}>▼ 38s</span>
                  </div>
                </div>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "26px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>94%</p>
                    <span style={{ color: "#0f7a5a" }}>
                      <__Icon name="check-circle" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Resolution rate</p>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f7a5a" }}>▲ 3pt</span>
                  </div>
                </div>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "26px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳6.42L</p>
                    <span style={{ color: "#003087" }}>
                      <__Icon name="trending-up" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Revenue from chat</p>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f7a5a" }}>▲ 18%</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: "20px" }}>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px 0 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px 18px" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Agent leaderboard</h2>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Ranked by resolved</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", padding: "10px 24px", background: "#f1f5f9", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Agent</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Resolved</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>First reply</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Revenue</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>CSAT</span>
                  </div>
                  <div className="dc-h815" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600" }}>RA</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Rina Ahmed</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Support lead</p>
                      </span>
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>318</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1m 42s</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳2.1L</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.8</span>
                  </div>
                  <div className="dc-h816" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600" }}>TA</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Tasnim Akter</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Sales</p>
                      </span>
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>276</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2m 05s</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1.8L</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.7</span>
                  </div>
                  <div className="dc-h817" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600" }}>MK</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Mehedi Karim</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Support</p>
                      </span>
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>241</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2m 38s</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1.1L</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.6</span>
                  </div>
                  <div className="dc-h818" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600" }}>SI</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Sabbir Islam</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Support</p>
                      </span>
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>198</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3m 11s</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳74k</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(255,152,0,.14)", color: "#a15f00" }}>4.2</span>
                  </div>
                  <div className="dc-h819" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600" }}>NF</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Nabila Ferdous</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Sales · part time</p>
                      </span>
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>142</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2m 52s</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳68k</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.5</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: "20px", alignContent: "start" }}>
                  <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                    <h2 style={{ margin: "0 0 18px", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Where conversations come from</h2>
                    <div style={{ display: "grid", gap: "16px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Instagram DM</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>462</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "9999px", background: "#f1f5f9" }}>
                          <div style={{ width: "72%", height: "8px", borderRadius: "9999px", background: "#c1008f" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>WhatsApp</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>381</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "9999px", background: "#f1f5f9" }}>
                          <div style={{ width: "60%", height: "8px", borderRadius: "9999px", background: "#0f7a5a" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Calls</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>248</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "9999px", background: "#f1f5f9" }}>
                          <div style={{ width: "39%", height: "8px", borderRadius: "9999px", background: "#003087" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Facebook</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>193</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "9999px", background: "#f1f5f9" }}>
                          <div style={{ width: "30%", height: "8px", borderRadius: "9999px", background: "#0089c3" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>First response by day</h2>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>minutes</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "132px", marginTop: "20px" }}>
                      <span style={{ flex: "1", height: "58%", borderRadius: "6px 6px 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "74%", borderRadius: "6px 6px 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "46%", borderRadius: "6px 6px 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "88%", borderRadius: "6px 6px 0 0", background: "#003087" }} />
                      <span style={{ flex: "1", height: "52%", borderRadius: "6px 6px 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "38%", borderRadius: "6px 6px 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "30%", borderRadius: "6px 6px 0 0", background: "rgba(0,48,135,.18)" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Sat</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Sun</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Mon</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Tue</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Wed</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Thu</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>Fri</span>
                    </div>
                    <p style={{ margin: "16px 0 0", fontSize: "13px", color: "#475569", textWrap: "pretty" }}>Tuesday peaks at 3m 20s — the Eid campaign send lands at 11 AM with only two agents rostered.</p>
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
