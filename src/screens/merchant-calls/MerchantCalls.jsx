'use client';
// Generated from design/templates/merchant-calls/MerchantCalls.dc.html by scripts/convert-design.mjs.
// MerchantCalls — Inbound and outbound calling for the omnichannel inbox — live queue, click-to-call dialer, active call controls, call log and one-click ticket creation.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ChannelIcon as __ChannelIcon } from '@/components/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: props.view === 'log' ? 'log' : 'live', pane: props.pane === 'dialer' ? 'dialer' : 'active', crm: props.customerPanel !== false, available: true, ticket: props.ticketForm === true };
  }
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const live = this.state.view === 'live', act = this.state.pane === 'active';
    return {
      isLive: live, isLog: !live, isActive: act, isDialer: !act,
      showCrm: this.state.crm, available: this.state.available, away: !this.state.available, ticketOpen: this.state.ticket,
      openLive: () => this.setState({ view: 'live' }),
      openLog: () => this.setState({ view: 'log' }),
      openDialer: () => this.setState({ view: 'live', pane: 'dialer' }),
      openActive: () => this.setState({ view: 'live', pane: 'active' }),
      openTicket: () => this.setState({ view: 'live', pane: 'active', ticket: true }),
      closeTicket: () => this.setState({ ticket: false }),
      toggleAvailable: () => this.setState(s => ({ available: !s.available })),
      toggleCrm: () => this.setState(s => ({ crm: !s.crm }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:var(--radius-full)}@keyframes pulseRing{0%{opacity:.55;transform:scale(1)}70%{opacity:0;transform:scale(1.6)}100%{opacity:0;transform:scale(1.6)}}
.dc-h89:hover{background:#f8fafc !important}
.dc-h90:hover{background:#f8fafc !important}
.dc-h91:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h92:hover{background:rgba(0,48,135,.2) !important}
.dc-h93:hover{background:#f1f5f9 !important}
.dc-h94:hover{background:#f1f5f9 !important}
.dc-h95:hover{background:#065f46 !important}
.dc-h96:hover{background:#dde5ef !important}
.dc-h97:hover{background:#f8fafc !important}
.dc-h98:hover{background:rgba(16,185,129,.24) !important}
.dc-h99:hover{background:#f8fafc !important}
.dc-h100:hover{background:rgba(16,185,129,.24) !important}
.dc-h101:hover{background:#f8fafc !important}
.dc-h102:hover{background:rgba(16,185,129,.24) !important}
.dc-h103:hover{background:#f8fafc !important}
.dc-h104:hover{background:#dde5ef !important}
.dc-h105:hover{background:#f8fafc !important}
.dc-h106:hover{background:#dde5ef !important}
.dc-h107:hover{background:#f1f5f9 !important}
.dc-h108:hover{background:#f1f5f9 !important}
.dc-h109:hover{background:#f1f5f9 !important}
.dc-h110:hover{background:#f1f5f9 !important}
.dc-h111:hover{background:#f1f5f9 !important}
.dc-h112:hover{background:#f1f5f9 !important}
.dc-h113:hover{background:#f1f5f9 !important}
.dc-h114:hover{background:#f1f5f9 !important}
.dc-h115:hover{background:#f1f5f9 !important}
.dc-h116:hover{background:#f1f5f9 !important}
.dc-h117:hover{background:#f1f5f9 !important}
.dc-h118:hover{background:#f1f5f9 !important}
.dc-h119:hover{background:#065f46 !important}
.dc-h120:hover{background:rgba(16,185,129,.24) !important}
.dc-h121:hover{background:rgba(16,185,129,.24) !important}
.dc-h122:hover{background:rgba(16,185,129,.24) !important}
.dc-h123:hover{background:#f1f5f9 !important}
.dc-h124:hover{background:#f1f5f9 !important}
.dc-h125:hover{background:#f1f5f9 !important}
.dc-h126:hover{background:rgba(0,48,135,.2) !important}
.dc-h127:hover{background:#9a3412 !important}
.dc-h128:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h129:hover{background:#dde5ef !important}
.dc-h130:hover{background:#002a77 !important}
.dc-h131:hover{background:rgba(16,185,129,.24) !important}
.dc-h132:hover{background:#f1f5f9 !important}
.dc-h133:hover{background:#f1f5f9 !important}
.dc-h134:hover{background:#f1f5f9 !important}
.dc-h135:hover{background:#f8fafc !important}
.dc-h136:hover{background:#f8fafc !important}
.dc-h137:hover{background:#f8fafc !important}
.dc-h138:hover{background:#f8fafc !important}
.dc-h139:hover{background:#f8fafc !important}
.dc-h140:hover{background:#f8fafc !important}
.dc-h141:hover{background:rgba(16,185,129,.24) !important}
.dc-h142:hover{background:rgba(16,185,129,.24) !important}
.dc-h143:hover{background:#dde5ef !important}
.dc-h144:hover{background:rgba(0,48,135,.2) !important}
.dc-h145:hover{background:#dde5ef !important}
.mg-row{appearance:none;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mg-list{list-style:none;margin:0;padding:0}
.mg-head>*{max-width:100%}
@media (max-width:1279px){.mg-head{height:auto!important;flex-wrap:wrap;row-gap:10px!important;padding-top:12px!important;padding-bottom:12px!important}}
@media (max-width:1023px){.mg-head{padding-left:16px!important;padding-right:16px!important}}
@media (max-width:1279px){.cl-panes{flex-wrap:wrap}.cl-side{flex:1 1 100%!important;width:auto!important;border-left:0!important;border-top:1px solid #e2e8f0}}
@media (max-width:1023px){.cl-panes{flex-direction:column;flex-wrap:nowrap}.cl-panes>*{flex:none!important;width:100%!important}.cl-queue{border-right:0!important;border-bottom:1px solid #e2e8f0}.cl-dialer{grid-template-columns:minmax(0,1fr)!important}.cl-banner{flex-wrap:wrap;padding:20px 16px!important}.cl-main{padding:20px 16px 32px!important}}
@media (max-width:767px){.cl-tform{grid-template-columns:minmax(0,1fr)!important}}`;

// ---- markup ----

export default class MerchantCallsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MerchantCalls">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="calls" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            <__Topbar crumb="Customers" page="Calls" />
            <header className="mg-head" style={{ zIndex: "90", display: "flex", minHeight: "72px", flex: "none", alignItems: "center", gap: "16px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                {v.isLive ? (<>
                  <button onClick={v.openLive} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="radio" strokeWidth="1.75" width="15" height="15" />Live calls<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>3</span></button>
                  {" "}
                  <button onClick={v.openLog} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="list" strokeWidth="1.75" width="15" height="15" />Call log<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>248</span></button>
                </>) : null}
                {v.isLog ? (<>
                  <button onClick={v.openLive} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="radio" strokeWidth="1.75" width="15" height="15" />Live calls<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>3</span></button>
                  {" "}
                  <button onClick={v.openLog} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="list" strokeWidth="1.75" width="15" height="15" />Call log<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>248</span></button>
                </>) : null}
              </span>
              <span style={{ position: "relative", display: "inline-block", width: "240px" }}>
                <input aria-label="Search number, name, order ID" type="search" placeholder="Search number, name, order ID…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                </span>
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Softphone ready · +880 9612 100 100</span>
                {v.available ? (<>
                  <button className="dc-h89" onClick={v.toggleAvailable} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Available<__Icon name="chevron-down" strokeWidth="1.75" width="14" height="14" /></button>
                </>) : null}
                {v.away ? (<>
                  <button className="dc-h90" onClick={v.toggleAvailable} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />On break<__Icon name="chevron-down" strokeWidth="1.75" width="14" height="14" /></button>
                </>) : null}
                <button className="dc-h91" onClick={v.toggleCrm} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Toggle customer panel">
                  <__Icon name="panel-right" width="20" height="20" strokeWidth="1.75" />
                </button>
              </div>
            </header>
            <div className="cl-panes" style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <section className="cl-queue" aria-label="Call queue" style={{ width: "328px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                <div style={{ flex: "none", padding: "16px 16px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Call queue</h1>
                    <button className="dc-h92" onClick={v.openDialer} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="grid-3x3" strokeWidth="1.75" width="14" height="14" />Dialer</button>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>2 waiting · longest 1m 12s</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
                    <button style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="14" height="14" />Inbound<span style={{ fontVariantNumeric: "tabular-nums" }}>2</span></button>
                    <button className="dc-h93" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone-outgoing" strokeWidth="1.75" width="14" height="14" />Outbound<span style={{ fontVariantNumeric: "tabular-nums" }}>9</span></button>
                    <button className="dc-h94" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone-missed" strokeWidth="1.75" width="14" height="14" />Missed<span style={{ fontVariantNumeric: "tabular-nums" }}>4</span></button>
                  </div>
                </div>
                <div style={{ flex: "1", minHeight: "0", borderTop: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0", padding: "10px 16px 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Ringing now</p>
                  <div style={{ display: "flex", gap: "12px", padding: "12px 16px", background: "rgba(0,48,135,.06)", borderLeft: "3px solid #003087" }}>
                    <span style={{ position: "relative", flex: "none", alignSelf: "flex-start" }}>
                      <span style={{ position: "absolute", inset: "-4px", borderRadius: "var(--radius-full)", border: "2px solid #003087", animation: "pulseRing 1.6s ease-out infinite" }} />
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                      <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", border: "2px solid #fff" }}>
                        <__Icon name="phone-incoming" strokeWidth="1.75" width="9" height="9" />
                      </span>
                    </span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan</p>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", fontVariantNumeric: "tabular-nums" }}>0:42</span>
                      </span>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678 · VIP</p>
                      <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#e9eef5", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", fontFamily: "var(--font-data)" }}>GC-10482</span>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(240,0,185,.1)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c1008f" }}>IVR: order status</span>
                      </span>
                      {" "}
                      <span style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        <button className="dc-h95" onClick={v.openActive} style={{ height: "28px", flex: "1", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "var(--fill-success)", color: "#fff", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="14" height="14" />Answer</button>
                        <button className="dc-h96" style={{ height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Decline</button>
                      </span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                    <span style={{ position: "relative", flex: "none", alignSelf: "flex-start" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>AK</span>
                      <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", border: "2px solid #fff" }}>
                        <__Icon name="phone-incoming" strokeWidth="1.75" width="9" height="9" />
                      </span>
                    </span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Arif Karim</p>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#a15f00", fontVariantNumeric: "tabular-nums" }}>1:12</span>
                      </span>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>+880 1911 220 145 · queue position 2</p>
                      <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,87,36,.12)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}>Open ticket TKT-2291</span>
                      </span>
                    </span>
                  </div>
                  <p style={{ margin: "0", padding: "14px 16px 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Call back list</p>
                  <div className="dc-h97" style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                    <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="Sadia Ferdous" style={{ width: "40px", height: "40px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "55% 18%" }} />
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sadia Ferdous</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Asked for COD confirmation · Facebook</p>
                    </span>
                    <button className="dc-h98" title="Call Sadia Ferdous" aria-label="Call Sadia Ferdous" style={{ width: "36px", height: "36px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                      <__Icon name="phone" strokeWidth="1.75" width="17" height="17" />
                    </button>
                  </div>
                  <div className="dc-h99" style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                    <span style={{ width: "40px", height: "40px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>RH</span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rakib Hasan</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Missed call 22m ago · WhatsApp</p>
                    </span>
                    <button className="dc-h100" title="Call Rakib Hasan" aria-label="Call Rakib Hasan" style={{ width: "36px", height: "36px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                      <__Icon name="phone" strokeWidth="1.75" width="17" height="17" />
                    </button>
                  </div>
                  <div className="dc-h101" style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                    <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="Farhana Jahan" style={{ width: "40px", height: "40px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "50% 20%" }} />
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Farhana Jahan</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Refund GC-10190 · promised today</p>
                    </span>
                    <button className="dc-h102" title="Call Farhana Jahan" aria-label="Call Farhana Jahan" style={{ width: "36px", height: "36px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                      <__Icon name="phone" strokeWidth="1.75" width="17" height="17" />
                    </button>
                  </div>
                  <p style={{ margin: "0", padding: "14px 16px 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Outbound tasks</p>
                  <div className="dc-h103" style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                    <span style={{ width: "40px", height: "40px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.12)", color: "#a15f00", display: "grid", placeItems: "center" }}>
                      <__Icon name="shopping-cart" strokeWidth="1.75" width="18" height="18" />
                    </span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Abandoned checkout</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>6 customers · ৳38,200 at risk</p>
                    </span>
                    <button className="dc-h104" style={{ height: "28px", flex: "none", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Start</button>
                  </div>
                  <div className="dc-h105" style={{ display: "flex", gap: "12px", padding: "12px 16px 20px" }}>
                    <span style={{ width: "40px", height: "40px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", display: "grid", placeItems: "center" }}>
                      <__Icon name="truck" strokeWidth="1.75" width="18" height="18" />
                    </span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Delivery confirmation</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>3 customers · courier retry</p>
                    </span>
                    <button className="dc-h106" style={{ height: "28px", flex: "none", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Start</button>
                  </div>
                </div>
              </section>
              {v.isLive ? (<>
                <section style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  <div className="cl-main" style={{ flex: "1", minHeight: "0", padding: "32px 36px 40px", display: "grid", gap: "24px", alignContent: "start" }}>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "20px" }}>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>86</p>
                          <span style={{ color: "#003087" }}>
                            <__Icon name="phone-incoming" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Inbound today</p>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>12</span></span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>54</p>
                          <span style={{ color: "var(--text-success)" }}>
                            <__Icon name="phone-outgoing" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Outbound today</p>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>9</span></span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>18s</p>
                          <span style={{ color: "var(--text-warning)" }}>
                            <__Icon name="timer" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Avg wait</p>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-down" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Down </span>6s</span></span>
                        </div>
                      </div>
                    </div>
                    {v.isDialer ? (<>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "20px", display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", gap: "28px" }} className="cl-dialer">
                        <div>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Dialer</p>
                          <input aria-label="Phone number to call" type="tel" inputMode="tel" autoComplete="off" defaultValue="+880 17" style={{ width: "100%", boxSizing: "border-box", marginTop: "10px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }} />
                          <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px", marginTop: "10px" }}>
                            <button className="dc-h107" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>1</button>
                            <button className="dc-h108" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>2</button>
                            <button className="dc-h109" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>3</button>
                            <button className="dc-h110" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>4</button>
                            <button className="dc-h111" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>5</button>
                            <button className="dc-h112" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>6</button>
                            <button className="dc-h113" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>7</button>
                            <button className="dc-h114" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>8</button>
                            <button className="dc-h115" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>9</button>
                            <button className="dc-h116" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>*</button>
                            <button className="dc-h117" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>0</button>
                            <button className="dc-h118" style={{ height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>#</button>
                          </div>
                          <button className="dc-h119" onClick={v.openActive} style={{ width: "100%", height: "44px", marginTop: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "var(--fill-success)", color: "#fff", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="17" height="17" />Call</button>
                        </div>
                        <div>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Click to call</p>
                          <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Any customer, conversation or order — one click dials through the softphone.</p>
                          <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                              <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                              <span style={{ flex: "1", minWidth: "0" }}>
                                <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Nusrat Jahan</p>
                                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678 · 14 orders</p>
                              </span>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(240,0,185,.1)", color: "#c1008f" }}>VIP</span>
                              <button className="dc-h120" onClick={v.openActive} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="14" height="14" />Call</button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                              <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="Sadia Ferdous" style={{ width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "55% 18%" }} />
                              <span style={{ flex: "1", minWidth: "0" }}>
                                <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Sadia Ferdous</p>
                                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1811 907 004 · 2 orders</p>
                              </span>
                              <button className="dc-h121" onClick={v.openActive} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="14" height="14" />Call</button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                              <span style={{ width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>RH</span>
                              <span style={{ flex: "1", minWidth: "0" }}>
                                <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Rakib Hasan</p>
                                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1622 771 830 · 5 orders</p>
                              </span>
                              <button className="dc-h122" onClick={v.openActive} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="14" height="14" />Call</button>
                            </div>
                          </div>
                          <p style={{ margin: "16px 0 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Caller ID</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                            <button style={{ height: "28px", border: "1px solid #003087", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.08)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>+880 9612 100 100 · Support</button>
                            <button style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-full)", background: "#fff", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>+880 9612 100 200 · Sales</button>
                            <button style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-full)", background: "#fff", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>WhatsApp voice</button>
                          </div>
                        </div>
                      </div>
                    </>) : null}
                    {v.isActive ? (<>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
                        <div className="cl-banner" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "24px 28px", background: "#003087", color: "#fff" }}>
                          <span style={{ position: "relative", flex: "none" }}>
                            <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "52px", height: "52px", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                            <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", color: "#fff", display: "grid", placeItems: "center", border: "2px solid #003087" }}>
                              <__Icon name="phone" strokeWidth="1.75" width="10" height="10" />
                            </span>
                          </span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)" }}>Nusrat Jahan</p>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,255,255,.18)" }}>Inbound · connected</span>
                            </span>
                            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--text-on-dark-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678 · via IVR “Order status” · recording on</p>
                          </span>
                          <span style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "28px" }}>
                            <span style={{ width: "3px", height: "10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.5)" }} />
                            <span style={{ width: "3px", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.75)" }} />
                            <span style={{ width: "3px", height: "28px", borderRadius: "var(--radius-full)", background: "#fff" }} />
                            <span style={{ width: "3px", height: "15px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.6)" }} />
                            <span style={{ width: "3px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.85)" }} />
                            <span style={{ width: "3px", height: "8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.4)" }} />
                            <span style={{ width: "3px", height: "18px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.7)" }} />
                          </span>
                          <p style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", fontVariantNumeric: "tabular-nums", letterSpacing: "var(--tracking-wide)" }}>02:14</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 28px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                          <button className="dc-h123" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><__Icon name="mic-off" strokeWidth="1.75" width="16" height="16" />Mute</button>
                          <button className="dc-h124" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><__Icon name="pause" strokeWidth="1.75" width="16" height="16" />Hold</button>
                          <button className="dc-h125" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><__Icon name="arrow-right-left" strokeWidth="1.75" width="16" height="16" />Transfer</button>
                          <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                            <button className="dc-h126" onClick={v.openTicket} style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="life-buoy" strokeWidth="1.75" width="16" height="16" />Create ticket</button>
                            <button className="dc-h127" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "var(--fill-danger)", color: "#fff", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="phone-off" strokeWidth="1.75" width="16" height="16" />End call</button>
                          </span>
                        </div>
                        {v.ticketOpen ? (<>
                          <div style={{ padding: "20px 24px", background: "rgba(0,48,135,.04)", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                                <__Icon name="life-buoy" strokeWidth="1.75" width="16" height="16" />
                              </span>
                              <p style={{ margin: "0", flex: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>New ticket from this call</p>
                              <button className="dc-h128" onClick={v.closeTicket} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close">
                                <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                              </button>
                            </div>
                            <div className="cl-tform" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 200px 160px", gap: "10px", marginTop: "12px" }}>
                              <input aria-label="Ticket subject" defaultValue="Order GC-10482 — asks to add 1 more saree before dispatch" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                              <select aria-label="Ticket category" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-sm)", color: "#475569" }}>
                                <option>Order change</option>
                                <option>Refund</option>
                                <option>Delivery</option>
                                <option>Product question</option>
                              </select>
                              <select aria-label="Ticket priority" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-sm)", color: "#475569" }}>
                                <option>Priority: High</option>
                                <option>Priority: Normal</option>
                                <option>Priority: Urgent</option>
                              </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#334155" }}><__Icon name="paperclip" strokeWidth="1.75" width="14" height="14" />Call recording attached</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#334155", fontFamily: "var(--font-data)" }}>GC-10482</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Assign to me</span>
                              <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                                <button className="dc-h129" onClick={v.closeTicket} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Cancel</button>
                                <button className="dc-h130" onClick={v.closeTicket} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Create ticket</button>
                              </span>
                            </div>
                          </div>
                        </>) : null}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 28px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Wrap-up</span>
                          <select aria-label="Call outcome" style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 10px", fontSize: "var(--text-sm)", color: "#475569" }}>
                            <option>Disposition: order changed</option>
                            <option>Disposition: resolved</option>
                            <option>Disposition: escalated</option>
                            <option>Disposition: callback needed</option>
                          </select>
                          <button className="dc-h131" style={{ marginLeft: "auto", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Save and close</button>
                        </div>
                      </div>
                    </>) : null}
                  </div>
                </section>
              </>) : null}
              {v.isLog ? (<>
                <section style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                    <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>All 248</button>
                    <button className="dc-h132" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Inbound 152</button>
                    <button className="dc-h133" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Outbound 84</button>
                    <button className="dc-h134" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Missed 12</button>
                    <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                      <select aria-label="Call log period" style={{ height: "32px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                        <option>Last 7 days</option>
                        <option>Today</option>
                        <option>Last 30 days</option>
                      </select>
                      <button className="dc-h135" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><__Icon name="download" strokeWidth="1.75" width="14" height="14" />Export</button>
                    </span>
                  </div>
                  <div className="gc-table-wrap" style={{ flex: "1", minHeight: "0", padding: "20px 24px 24px" }}>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden", minWidth: "900px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "132px minmax(0,1fr) 120px 108px 120px 150px 92px", gap: "12px", padding: "10px 16px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Direction</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Customer</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>When</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Duration</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Agent</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Outcome</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Ticket</span>
                      </div>
                      <div className="dc-h136" style={{ display: "grid", gridTemplateColumns: "132px minmax(0,1fr) 120px 108px 120px 150px 92px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="15" height="15" />Inbound</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                          <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678</p>
                          </span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Today 11:04</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>02:14</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Order changed</span>
                        <a href="#" style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>TKT-2304</a>
                      </div>
                      <div className="dc-h137" style={{ display: "grid", gridTemplateColumns: "132px minmax(0,1fr) 120px 108px 120px 150px 92px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}><__Icon name="phone-outgoing" strokeWidth="1.75" width="15" height="15" />Outbound</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                          <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RH</span>
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rakib Hasan</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1622 771 830</p>
                          </span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Today 10:38</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>01:02</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>MK</span>Mehedi</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Payment verified</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>—</span>
                      </div>
                      <div className="dc-h138" style={{ display: "grid", gridTemplateColumns: "132px minmax(0,1fr) 120px 108px 120px 150px 92px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}><__Icon name="phone-missed" strokeWidth="1.75" width="15" height="15" />Missed</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                          <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>AK</span>
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Arif Karim</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1911 220 145</p>
                          </span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Today 09:52</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>—</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Unassigned</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Callback due</span>
                        <a href="#" style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>TKT-2291</a>
                      </div>
                      <div className="dc-h139" style={{ display: "grid", gridTemplateColumns: "132px minmax(0,1fr) 120px 108px 120px 150px 92px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="15" height="15" />Inbound</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                          <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "55% 18%" }} />
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sadia Ferdous</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1811 907 004</p>
                          </span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Yesterday</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>04:31</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>TA</span>Tasnim</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(14,165,233,.12)", color: "#0272a8" }}>New order ৳3,200</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>—</span>
                      </div>
                      <div className="dc-h140" style={{ display: "grid", gridTemplateColumns: "132px minmax(0,1fr) 120px 108px 120px 150px 92px", gap: "12px", alignItems: "center", padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}><__Icon name="phone-outgoing" strokeWidth="1.75" width="15" height="15" />Outbound</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                          <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "50% 20%" }} />
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Farhana Jahan</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>+880 1741 550 921</p>
                          </span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Yesterday</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>00:48</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>No answer</span>
                        <a href="#" style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>TKT-2288</a>
                      </div>
                    </div>
                  </div>
                </section>
              </>) : null}
              {v.showCrm ? (<>
                <aside className="gc-side cl-side" aria-label="Caller details" style={{ width: "320px", flex: "none", background: "#fff", borderLeft: "1px solid #e2e8f0", padding: "20px 16px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "44px", height: "44px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Nusrat Jahan</p>
                      <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>On the line now · VIP</p>
                    </span>
                  </div>
                  <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "8px", marginTop: "14px" }}>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳84,600</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Lifetime value</p>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>14</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Orders</p>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>9</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Calls all time</p>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>2</p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Open tickets</p>
                    </div>
                  </div>
                  <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Reach her on</h2>
                  <div style={{ display: "grid", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                      <span style={{ width: "20px", height: "20px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                        <__Icon name="phone" strokeWidth="1.75" width="11" height="11" />
                      </span>
                      <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678</span>
                      <button className="dc-h141" title="Call this number" aria-label="Call this number" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                        <__Icon name="phone" strokeWidth="1.75" width="13" height="13" />
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                      <__ChannelIcon channel="whatsapp" size={20} />
                      <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>WhatsApp voice</span>
                      <button className="dc-h142" title="WhatsApp call" aria-label="WhatsApp call" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                        <__Icon name="phone" strokeWidth="1.75" width="13" height="13" />
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                      <__ChannelIcon channel="instagram" size={20} />
                      <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>@nusrat.wears</span>
                      <button className="dc-h143" title="Open DM" aria-label="Open DM" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", cursor: "pointer" }}>
                        <__Icon name="message-square" strokeWidth="1.75" width="13" height="13" />
                      </button>
                    </div>
                  </div>
                  <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Open tickets</h2>
                  <div style={{ display: "grid", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>TKT-2304</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Add item before dispatch</p>
                      </span>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>TKT-2266</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Bulk pricing request</p>
                      </span>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                    </div>
                  </div>
                  <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Agent note</h2>
                  <textarea aria-label="Anything the next agent should know" rows="3" placeholder="Anything the next agent should know…" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "10px 12px", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none" }} defaultValue={"Prefers Bangla. Calls around lunch. Always confirm courier time."} />
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <button className="dc-h144" onClick={v.openTicket} style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>New ticket</button>
                    <button className="dc-h145" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Full profile</button>
                  </div>
                </aside>
              </>) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
