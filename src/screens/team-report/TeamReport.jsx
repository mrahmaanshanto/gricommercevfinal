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

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:var(--radius-full)}
.dc-h814:hover{background:#f8fafc !important}
.dc-h815:hover{background:#f8fafc !important}
.dc-h816:hover{background:#f8fafc !important}
.dc-h817:hover{background:#f8fafc !important}
.dc-h818:hover{background:#f8fafc !important}
.dc-h819:hover{background:#f8fafc !important}
.mg-row{appearance:none;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mg-list{list-style:none;margin:0;padding:0}
.mg-head>*{max-width:100%}
@media (max-width:1279px){.mg-head{height:auto!important;flex-wrap:wrap;row-gap:10px!important;padding-top:12px!important;padding-bottom:12px!important}}
@media (max-width:1023px){.mg-head{padding-left:16px!important;padding-right:16px!important}}
.tr-board>div{min-width:640px}
.tr-content h2{overflow-wrap:anywhere}
@media (max-width:1279px){.tr-cols{grid-template-columns:minmax(0,1fr)!important}}
@media (max-width:1023px){.tr-content{padding:20px 16px 32px!important;gap:20px!important}}
/* phones: title and subtitle take the full width, period + Export share the next row;
   the leaderboard becomes one card per agent (name, then the four numbers with their labels) */
@media (max-width:640px){
  .tr-head{gap:var(--space-2) var(--space-2)!important}
  .tr-head>span:first-child{flex:1 1 100%!important}
  .tr-period{flex:1 1 0;min-width:0;height:44px!important}
  .tr-export{height:44px!important}
  .tr-board{overflow-x:visible!important;contain:none!important}
  .tr-board>div{min-width:0!important}
  .tr-board>div:first-child{padding:0 16px 14px!important}
  .tr-lb-head{display:none!important}
  .tr-lb-row{grid-template-columns:repeat(4,minmax(0,1fr))!important;row-gap:28px!important;padding:14px 16px!important}
  .tr-lb-head+.tr-lb-row{border-top:1px solid #f1f5f9}
  .tr-lb-row>span:first-child{grid-column:1/-1}
  .tr-lb-row>[data-label]{position:relative;justify-self:start}
  .tr-lb-row>[data-label]::before{content:attr(data-label);position:absolute;left:0;bottom:100%;margin-bottom:2px;white-space:nowrap;font-size:var(--text-xs);font-weight:var(--weight-regular);line-height:16px;color:var(--text-muted);background:none}
}`;

// ---- markup ----

export default class TeamReportScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="TeamReport">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="rep-marketing" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            <__Topbar crumb="Reports" page="Team performance" />
            <header className="mg-head tr-head" style={{ zIndex: "90", display: "flex", minHeight: "76px", flex: "none", alignItems: "center", gap: "16px", padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ flex: "1", minWidth: "0" }}>
                <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Team performance</h1>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Support and sales · 6 agents · Asia/Dhaka</p>
              </span>
              <select className="tr-period" aria-label="Reporting period" style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 10px", fontSize: "var(--text-sm)", color: "#475569" }}>
                <option>Last 7 days</option>
                <option>Today</option>
                <option>Last 30 days</option>
                <option>This quarter</option>
              </select>
              <button className="dc-h814 tr-export" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><__Icon name="download" strokeWidth="1.75" width="16" height="16" />Export</button>
            </header>
            <div className="tr-content" style={{ flex: "1", minHeight: "0", padding: "32px 36px 44px", display: "grid", gap: "28px", alignContent: "start" }}>
              <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "20px" }}>
                <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>1,284</p>
                    <span style={{ color: "#003087" }}>
                      <__Icon name="message-square" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Conversations handled</p>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>11%</span></span>
                  </div>
                </div>
                <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>2m 14s</p>
                    <span style={{ color: "var(--text-warning)" }}>
                      <__Icon name="timer" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>First response</p>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-down" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Down </span>38s</span></span>
                  </div>
                </div>
                <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>94%</p>
                    <span style={{ color: "#0f7a5a" }}>
                      <__Icon name="check-circle" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Resolution rate</p>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>3pt</span></span>
                  </div>
                </div>
                <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳6.42L</p>
                    <span style={{ color: "#003087" }}>
                      <__Icon name="trending-up" width="20" height="20" strokeWidth="1.75" />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Revenue from chat</p>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>18%</span></span>
                  </div>
                </div>
              </div>
              <div className="tr-cols" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: "20px" }}>
                <div className="tr-board gc-table-wrap" style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px 0 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px 18px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Agent leaderboard</h2>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Ranked by resolved</span>
                  </div>
                  <div className="tr-lb-head" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", padding: "10px 24px", background: "#f1f5f9", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Agent</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Resolved</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>First reply</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Revenue</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>CSAT</span>
                  </div>
                  <div className="dc-h815 tr-lb-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RA</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rina Ahmed</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Support lead</p>
                      </span>
                    </span>
                    <span data-label="Resolved" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>318</span>
                    <span data-label="First reply" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1m 42s</span>
                    <span data-label="Revenue" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳2.1L</span>
                    <span data-label="CSAT" style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.8</span>
                  </div>
                  <div className="dc-h816 tr-lb-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>TA</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Tasnim Akter</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sales</p>
                      </span>
                    </span>
                    <span data-label="Resolved" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>276</span>
                    <span data-label="First reply" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2m 05s</span>
                    <span data-label="Revenue" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1.8L</span>
                    <span data-label="CSAT" style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.7</span>
                  </div>
                  <div className="dc-h817 tr-lb-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>MK</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Mehedi Karim</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Support</p>
                      </span>
                    </span>
                    <span data-label="Resolved" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>241</span>
                    <span data-label="First reply" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2m 38s</span>
                    <span data-label="Revenue" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1.1L</span>
                    <span data-label="CSAT" style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.6</span>
                  </div>
                  <div className="dc-h818 tr-lb-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>SI</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sabbir Islam</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Support</p>
                      </span>
                    </span>
                    <span data-label="Resolved" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>198</span>
                    <span data-label="First reply" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3m 11s</span>
                    <span data-label="Revenue" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳74k</span>
                    <span data-label="CSAT" style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.14)", color: "#a15f00" }}>4.2</span>
                  </div>
                  <div className="dc-h819 tr-lb-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 108px 96px 88px", gap: "12px", alignItems: "center", padding: "14px 24px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                      <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>NF</span>
                      <span style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nabila Ferdous</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sales · part time</p>
                      </span>
                    </span>
                    <span data-label="Resolved" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>142</span>
                    <span data-label="First reply" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2m 52s</span>
                    <span data-label="Revenue" style={{ fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳68k</span>
                    <span data-label="CSAT" style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.12)", color: "#0f7a5a" }}>4.5</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: "20px", alignContent: "start" }}>
                  <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                    <h2 style={{ margin: "0 0 18px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Where conversations come from</h2>
                    <div style={{ display: "grid", gap: "16px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Instagram DM</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>462</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9" }}>
                          <div style={{ width: "72%", height: "8px", borderRadius: "var(--radius-full)", background: "#c1008f" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>WhatsApp</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>381</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9" }}>
                          <div style={{ width: "60%", height: "8px", borderRadius: "var(--radius-full)", background: "#0f7a5a" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Calls</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>248</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9" }}>
                          <div style={{ width: "39%", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Facebook</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>193</span>
                        </div>
                        <div style={{ height: "8px", marginTop: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9" }}>
                          <div style={{ width: "30%", height: "8px", borderRadius: "var(--radius-full)", background: "#0089c3" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>First response by day</h2>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>minutes</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "132px", marginTop: "20px" }}>
                      <span style={{ flex: "1", height: "58%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "74%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "46%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "88%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "#003087" }} />
                      <span style={{ flex: "1", height: "52%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "38%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "rgba(0,48,135,.18)" }} />
                      <span style={{ flex: "1", height: "30%", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "rgba(0,48,135,.18)" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sat</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sun</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Mon</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Tue</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Wed</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Thu</span>
                      <span style={{ flex: "1", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Fri</span>
                    </div>
                    <p style={{ margin: "16px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569", textWrap: "pretty" }}>Tuesday peaks at 3m 20s — the Eid campaign send lands at 11 AM with only two agents rostered.</p>
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
