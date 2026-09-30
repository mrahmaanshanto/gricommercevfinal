'use client';
// Generated from design/templates/support-tickets/SupportTickets.dc.html by scripts/convert-design.mjs.
// SupportTickets — Ticket desk for the omnichannel inbox — Kanban assignment board, list view, and a detail panel to assign, reply and solve.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: props.view === 'list' ? 'list' : 'board', detail: props.detailPanel !== false, reply: 'public' };
  }
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const board = this.state.view === 'board', pub = this.state.reply === 'public';
    return {
      isBoard: board, isList: !board, showDetail: this.state.detail, isPublic: pub, isInternal: !pub,
      openBoard: () => this.setState({ view: 'board' }),
      openList: () => this.setState({ view: 'list' }),
      selectTicket: () => this.setState({ detail: true }),
      toggleDetail: () => this.setState(s => ({ detail: !s.detail })),
      setPublic: () => this.setState({ reply: 'public' }),
      setInternal: () => this.setState({ reply: 'internal' })
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:9999px}
.dc-h767:hover{background:#f8fafc !important}
.dc-h768:hover{background:#002a77 !important}
.dc-h769:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h770:hover{background:#f1f5f9 !important}
.dc-h771:hover{background:#f1f5f9 !important}
.dc-h772:hover{background:rgba(203,213,225,.4) !important;color:#475569 !important}
.dc-h773:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h774:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h775:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h776:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h777:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h778:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h779:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h780:hover{background:rgba(203,213,225,.4) !important;color:#475569 !important}
.dc-h781:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h782:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h783:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h784:hover{background:rgba(203,213,225,.4) !important;color:#475569 !important}
.dc-h785:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h786:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h787:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h788:hover{box-shadow:0 3px 10px 0 rgba(48,46,56,.12) !important}
.dc-h789:hover{opacity:1 !important}
.dc-h790:hover{opacity:1 !important}
.dc-h791:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h792:hover{background:#f8fafc !important}
.dc-h793:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h794:hover{background:#f8fafc !important}
.dc-h795:hover{background:#f8fafc !important}
.dc-h796:hover{background:#f8fafc !important}
.dc-h797:hover{background:#f8fafc !important}
.dc-h798:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h799:hover{background:#f8fafc !important}
.dc-h800:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h801:hover{background:rgba(16,185,129,.24) !important}
.dc-h802:hover{background:#dde5ef !important}
.dc-h803:hover{background:#f8fafc !important}
.dc-h804:hover{background:rgba(0,48,135,.2) !important}
.dc-h805:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h806:hover{background:#dde5ef !important}
.dc-h807:hover{background:#dde5ef !important}
.dc-h808:hover{background:#dde5ef !important}
.dc-h809:hover{background:rgba(16,185,129,.24) !important}
.dc-h810:hover{background:#002a77 !important}
.dc-h811:hover{background:#dde5ef !important}
.dc-h812:hover{background:#dde5ef !important}
.dc-h813:hover{background:#dde5ef !important}`;

// ---- markup ----

export default class SupportTicketsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SupportTickets">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ display: "flex", gap: "12px", padding: "12px", height: "100vh", boxSizing: "border-box", overflow: "hidden", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="tickets" />
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc", overflow: "hidden" }}>
            <__Topbar crumb="Customers" page="Support tickets" />
            <header style={{ zIndex: "90", display: "flex", minHeight: "72px", flex: "none", alignItems: "center", gap: "16px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <h1 style={{ margin: "0", fontSize: "16px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Support tickets</h1>
              <span style={{ display: "inline-flex", borderRadius: "9999px", background: "#e9eef5", padding: "3px" }}>
                {v.isBoard ? (<>
                  <button onClick={v.openBoard} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="columns-3" strokeWidth="1.75" width="15" height="15" />Board</button>
                  {" "}
                  <button onClick={v.openList} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="list" strokeWidth="1.75" width="15" height="15" />List</button>
                </>) : null}
                {v.isList ? (<>
                  <button onClick={v.openBoard} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="columns-3" strokeWidth="1.75" width="15" height="15" />Board</button>
                  {" "}
                  <button onClick={v.openList} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="list" strokeWidth="1.75" width="15" height="15" />List</button>
                </>) : null}
              </span>
              <span style={{ position: "relative", display: "inline-block", width: "230px" }}>
                <input type="search" placeholder="Search tickets, orders, people…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "13px", color: "#1e293b" }} />
                <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "#94a3b8", pointerEvents: "none" }}>
                  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                </span>
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "-6px" }}>
                  <span style={{ width: "28px", height: "28px", marginLeft: "-8px", borderRadius: "9999px", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "600", border: "2px solid #fff" }}>+3</span>
                </span>
                <button className="dc-h767" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer" }}><__Icon name="filter" strokeWidth="1.75" width="15" height="15" />Filters<span style={{ display: "inline-grid", placeItems: "center", minWidth: "16px", height: "16px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", fontSize: "10px", fontWeight: "600" }}>2</span></button>
                <button className="dc-h768" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />New ticket</button>
                <button className="dc-h769" onClick={v.toggleDetail} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Toggle ticket panel">
                  <__Icon name="panel-right" width="20" height="20" strokeWidth="1.75" />
                </button>
              </div>
            </header>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "9999px", background: "rgba(255,87,36,.12)", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#c23a12" }}><__Icon name="alert-triangle" strokeWidth="1.75" width="14" height="14" />2 breaching SLA</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "9999px", background: "#e9eef5", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#334155" }}>5 unassigned</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "9999px", background: "rgba(16,185,129,.1)", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#0f7a5a" }}>14 solved today</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "9999px", background: "#e9eef5", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#334155" }}>First reply 12m</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    <button style={{ height: "28px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>All agents</button>
                    <button className="dc-h770" style={{ height: "28px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Mine 6</button>
                    <button className="dc-h771" style={{ height: "28px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Group by assignee</button>
                  </span>
                </div>
                {v.isBoard ? (<>
                  <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "18px 20px 24px" }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", minWidth: "1240px" }}>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#697a9b" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#334155" }}>New</p>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#697a9b", fontVariantNumeric: "tabular-nums" }}>5</span>
                          <button className="dc-h772" style={{ width: "24px", height: "24px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Add ticket">
                            <__Icon name="plus" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>Unassigned — drag onto an agent</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="dc-h773" onClick={v.selectTicket} style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer", borderLeft: "3px solid #ff5724" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2304</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Add one more saree to GC-10482 before dispatch</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "22px", height: "22px", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan · VIP</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "500", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />18m</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="12" height="12" />From call</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="paperclip" strokeWidth="1.75" width="12" height="12" />1</span>
                              <button className="dc-h774" style={{ marginLeft: "auto", height: "24px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="12" height="12" />Assign</button>
                            </div>
                          </div>
                          <div className="dc-h775" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2303</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>bKash payment not reflecting on order</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>RH</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Rakib Hasan</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />3h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="message-square" strokeWidth="1.75" width="12" height="12" />4</span>
                              <button className="dc-h776" style={{ marginLeft: "auto", height: "24px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="12" height="12" />Assign</button>
                            </div>
                          </div>
                          <div className="dc-h777" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="TikTok" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2302</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Low</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Asks for size chart in Bangla</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>TR</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>@tanvir.rides</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />5h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="at-sign" strokeWidth="1.75" width="12" height="12" />From comment</span>
                              <button className="dc-h778" style={{ marginLeft: "auto", height: "24px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="12" height="12" />Assign</button>
                            </div>
                          </div>
                          <button className="dc-h779" style={{ height: "34px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#697a9b", cursor: "pointer" }}>Show 2 more</button>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#003087" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#334155" }}>Assigned</p>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#697a9b", fontVariantNumeric: "tabular-nums" }}>4</span>
                          <button className="dc-h780" style={{ width: "24px", height: "24px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Add ticket">
                            <__Icon name="plus" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>Owner set, work not started</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="dc-h781" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2298</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Wrong colour delivered — wants exchange</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="Sadia Ferdous" style={{ width: "22px", height: "22px", borderRadius: "9999px", objectFit: "cover", objectPosition: "55% 18%" }} />
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Sadia Ferdous</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />2h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#003087" }}>GC-10455</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.14)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>TA</span>Tasnim</span>
                            </div>
                          </div>
                          <div className="dc-h782" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "16px", height: "16px", borderRadius: "9999px", background: "#0ea5e9", color: "#fff", display: "grid", placeItems: "center", fontSize: "7px", fontWeight: "600" }}>TG</span>
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2295</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Refund not received for GC-10190</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="Farhana Jahan" style={{ width: "22px", height: "22px", borderRadius: "9999px", objectFit: "cover", objectPosition: "50% 20%" }} />
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Farhana Jahan</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "500", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />Overdue</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="message-square" strokeWidth="1.75" width="12" height="12" />7</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>MK</span>Mehedi</span>
                            </div>
                          </div>
                          <div className="dc-h783" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "16px", height: "16px", borderRadius: "9999px", background: "#009cde", color: "#fff", display: "grid", placeItems: "center", fontSize: "7px", fontWeight: "600" }}>LI</span>
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2290</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Wholesale quote for 200 staff kits</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,156,222,.12)", color: "#0089c3", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>IR</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Imran Rahman · B2B</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />1d</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(0,48,135,.08)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#003087" }}>Sales</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>RA</span>Rina</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#ff9800" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#334155" }}>In progress</p>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#697a9b", fontVariantNumeric: "tabular-nums" }}>3</span>
                          <button className="dc-h784" style={{ width: "24px", height: "24px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Add ticket">
                            <__Icon name="plus" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>WIP limit 5 per agent</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="dc-h785" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "16px", height: "16px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                                <__Icon name="phone" strokeWidth="1.75" width="9" height="9" />
                              </span>
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2291</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Third complaint about missing refund</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(255,87,36,.12)", color: "#c23a12", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>AK</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Arif Karim</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "500", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />SLA 6m</span>
                            </div>
                            <span style={{ display: "block", height: "4px", marginTop: "10px", borderRadius: "9999px", background: "#f1f5f9" }}>
                              <span style={{ display: "block", width: "86%", height: "4px", borderRadius: "9999px", background: "#ff5724" }} />
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="git-branch" strokeWidth="1.75" width="12" height="12" />Escalated</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>RA</span>Rina</span>
                            </div>
                          </div>
                          <div className="dc-h786" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2287</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Courier lost parcel — claim filed</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>KW</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Katrina West</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#a15f00" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />4h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(255,152,0,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#a15f00" }}>Waiting on courier</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.14)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>TA</span>Tasnim</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#009cde" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#334155" }}>Waiting on customer</p>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#697a9b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>Auto-close after 5 days</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="dc-h787" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2279</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Asked for photo of the damaged item</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>RS</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>@rumana.s</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}>2d</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}><__Icon name="bell" strokeWidth="1.75" width="12" height="12" />Reminder sent</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>RA</span>Rina</span>
                            </div>
                          </div>
                          <div className="dc-h788" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2271</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Low</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Waiting for a new delivery address</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>SM</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Shafin Mahmud</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}>4d</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(255,152,0,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#a15f00" }}>Closes in 1d</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>MK</span>Mehedi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#10b981" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#334155" }}>Solved</p>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#697a9b", fontVariantNumeric: "tabular-nums" }}>14</span>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>Today · CSAT 4.7</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="dc-h789" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer", opacity: ".85" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2288</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}><__Icon name="check" strokeWidth="1.75" width="11" height="11" />Solved</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Payment verified and order released</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>RH</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Rakib Hasan</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#a15f00" }}>★ 5.0</span>
                            </div>
                          </div>
                          <div className="dc-h790" style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", cursor: "pointer", opacity: ".85" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ width: "16px", height: "16px" }} />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#697a9b" }}>TKT-2284</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "9999px", padding: "0 8px", fontSize: "11px", fontWeight: "600", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}><__Icon name="check" strokeWidth="1.75" width="11" height="11" />Solved</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>Size exchange arranged for Friday</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>MA</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#475569" }}>Mahmuda Alam</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#a15f00" }}>★ 4.0</span>
                            </div>
                          </div>
                          <button className="dc-h791" style={{ height: "34px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#697a9b", cursor: "pointer" }}>Show 12 more</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>) : null}
                {v.isList ? (<>
                  <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "18px 20px 24px" }}>
                    <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden", minWidth: "1080px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", padding: "10px 16px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Ticket</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Subject</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Customer</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Status</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Priority</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>SLA</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#697a9b" }}>Assignee</span>
                      </div>
                      <div className="dc-h792" onClick={v.selectTicket} style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ width: "15px", height: "15px" }} />
                          <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>2304</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Add one more saree to GC-10482 before dispatch</p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="" style={{ width: "24px", height: "24px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                          <span style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "#e9eef5", color: "#475569" }}>New</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#c23a12" }}>18m left</span>
                        <button className="dc-h793" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="13" height="13" />Assign</button>
                      </div>
                      <div className="dc-h794" style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "15px", height: "15px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                            <__Icon name="phone" strokeWidth="1.75" width="9" height="9" />
                          </span>
                          <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>2291</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Third complaint about missing refund</p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "9999px", background: "rgba(255,87,36,.12)", color: "#c23a12", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>AK</span>
                          <span style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Arif Karim</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>In progress</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#c23a12" }}>6m left</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>RA</span>Rina</span>
                      </div>
                      <div className="dc-h795" style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ width: "15px", height: "15px" }} />
                          <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>2298</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Wrong colour delivered — wants exchange</p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="" style={{ width: "24px", height: "24px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "55% 18%" }} />
                          <span style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sadia Ferdous</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(0,48,135,.1)", color: "#003087" }}>Assigned</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                        <span style={{ fontSize: "13px", color: "#475569" }}>3h left</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "9999px", background: "rgba(16,185,129,.14)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>TA</span>Tasnim</span>
                      </div>
                      <div className="dc-h796" style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "15px", height: "15px", borderRadius: "9999px", background: "#0ea5e9", color: "#fff", display: "grid", placeItems: "center", fontSize: "6px", fontWeight: "600" }}>TG</span>
                          <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>2295</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Refund not received for GC-10190</p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="" style={{ width: "24px", height: "24px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "50% 20%" }} />
                          <span style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Farhana Jahan</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(0,48,135,.1)", color: "#003087" }}>Assigned</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Normal</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#c23a12" }}>Overdue 40m</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>MK</span>Mehedi</span>
                      </div>
                      <div className="dc-h797" style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="TikTok" style={{ width: "15px", height: "15px" }} />
                          <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>2302</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Asks for size chart in Bangla</p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "9999px", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>TR</span>
                          <span style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@tanvir.rides</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "#e9eef5", color: "#475569" }}>New</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Low</span>
                        <span style={{ fontSize: "13px", color: "#475569" }}>1d left</span>
                        <button className="dc-h798" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="13" height="13" />Assign</button>
                      </div>
                      <div className="dc-h799" style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ width: "15px", height: "15px" }} />
                          <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>2288</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "14px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Payment verified and order released</p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "500" }}>RH</span>
                          <span style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rakib Hasan</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Solved</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}>Normal</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Met</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>MK</span>Mehedi</span>
                      </div>
                    </div>
                  </div>
                </>) : null}
              </div>
              {v.showDetail ? (<>
                <aside style={{ width: "376px", flex: "none", overflowY: "auto", background: "#fff", borderLeft: "1px solid #e2e8f0", padding: "18px 18px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#697a9b" }}>TKT-2304</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "22px", borderRadius: "9999px", background: "rgba(255,87,36,.12)", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />SLA 18m</span>
                    <button className="dc-h800" onClick={v.toggleDetail} style={{ marginLeft: "auto", width: "26px", height: "26px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Close panel">
                      <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                    </button>
                  </div>
                  <h2 style={{ margin: "10px 0 0", fontSize: "16px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", textWrap: "pretty" }}>Add one more saree to GC-10482 before dispatch</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                    <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "36px", height: "36px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Nusrat Jahan</p>
                      <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>VIP · 14 orders · ৳84,600 LTV</p>
                    </span>
                    <button className="dc-h801" title="Call Nusrat" style={{ width: "32px", height: "32px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                      <__Icon name="phone" strokeWidth="1.75" width="16" height="16" />
                    </button>
                    <button className="dc-h802" title="Open conversation" style={{ width: "32px", height: "32px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#475569", cursor: "pointer" }}>
                      <__Icon name="message-square" strokeWidth="1.75" width="16" height="16" />
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "13px", color: "#94a3b8" }}>Status</span>
                      <select style={{ flex: "1", minWidth: "0", height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 8px", fontSize: "13px", color: "#1e293b" }}>
                        <option>New</option>
                        <option>Assigned</option>
                        <option>In progress</option>
                        <option>Waiting on customer</option>
                        <option>Solved</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "13px", color: "#94a3b8" }}>Assignee</span>
                      <span style={{ flex: "1", minWidth: "0", display: "flex", gap: "6px" }}>
                        <button className="dc-h803" style={{ flex: "1", height: "34px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 8px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="15" height="15" />Unassigned<__Icon name="chevron-down" strokeWidth="1.75" width="14" height="14" style={{ marginLeft: "auto" }} /></button>
                        <button className="dc-h804" style={{ height: "34px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Take it</button>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "13px", color: "#94a3b8" }}>Team</span>
                      <select style={{ flex: "1", minWidth: "0", height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 8px", fontSize: "13px", color: "#1e293b" }}>
                        <option>Order support</option>
                        <option>Payments</option>
                        <option>Delivery</option>
                        <option>Sales</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "13px", color: "#94a3b8" }}>Linked order</span>
                      <span style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "8px", height: "34px", borderRadius: "8px", background: "#f8fafc", padding: "0 10px" }}>
                        <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>GC-10482</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>৳4,850</span>
                        <a href="#" style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "500" }}>Open</a>
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#334155" }}><img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="" style={{ width: "13px", height: "13px" }} />Instagram DM</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#334155" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="13" height="13" />Created from call</span>
                    <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#334155" }}>order-change</span>
                    <button className="dc-h805" style={{ height: "24px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="12" height="12" />Tag</button>
                  </div>
                  <h3 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Activity</h3>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                        <__Icon name="phone-incoming" strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <span>
                        <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>Ticket created from inbound call by <span style={{ fontWeight: "500" }}>Rina</span></p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Today 11:06 · recording attached (2:14)</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="" style={{ width: "26px", height: "26px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                      <span>
                        <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>“Ekta saree add korte chai, difference bKash e dicchi.”</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Today 11:04 · call transcript</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "9999px", background: "rgba(255,152,0,.12)", color: "#a15f00", display: "grid", placeItems: "center" }}>
                        <__Icon name="sticky-note" strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <span>
                        <p style={{ margin: "0", fontSize: "13px", color: "#475569" }}>Stock confirmed — 6 left of JAM-114. Courier pickup 5 PM, needs packing hold.</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Internal note · Rina</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center" }}>
                        <__Icon name="message-square" strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <span>
                        <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>Earlier Instagram DM thread merged into this ticket</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Today 10:11 · 4 messages</p>
                      </span>
                    </div>
                  </div>
                  <h3 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Reply</h3>
                  <span style={{ display: "inline-flex", borderRadius: "9999px", background: "#e9eef5", padding: "3px" }}>
                    {v.isPublic ? (<>
                      <button onClick={v.setPublic} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#003087" }}>Reply to customer</button>
                      {" "}
                      <button onClick={v.setInternal} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#475569" }}>Internal note</button>
                    </>) : null}
                    {v.isInternal ? (<>
                      <button onClick={v.setPublic} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#475569" }}>Reply to customer</button>
                      {" "}
                      <button onClick={v.setInternal} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#a15f00" }}>Internal note</button>
                    </>) : null}
                  </span>
                  {v.isPublic ? (<>
                    <textarea rows="3" placeholder="Reply on Instagram — the channel the customer used…" style={{ width: "100%", boxSizing: "border-box", marginTop: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#1e293b", resize: "none" }} />
                  </>) : null}
                  {v.isInternal ? (<>
                    <textarea rows="3" placeholder="Note for the team — the customer will not see this." style={{ width: "100%", boxSizing: "border-box", marginTop: "8px", border: "1px solid #ffb951", borderRadius: "8px", background: "rgba(255,152,0,.06)", padding: "10px 12px", fontSize: "14px", color: "#1e293b", resize: "none" }} />
                  </>) : null}
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                    <button className="dc-h806" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Payment link</button>
                    <button className="dc-h807" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Dispatch time</button>
                    <button className="dc-h808" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Bangla version</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <button className="dc-h809" style={{ flex: "1", height: "38px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "8px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}><__Icon name="check-check" strokeWidth="1.75" width="16" height="16" />Solve ticket</button>
                    <button className="dc-h810" style={{ flex: "1", height: "38px", border: "none", borderRadius: "8px", background: "#003087", color: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Send reply</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button className="dc-h811" style={{ flex: "1", height: "34px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Escalate</button>
                    <button className="dc-h812" style={{ flex: "1", height: "34px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Snooze 2h</button>
                    <button className="dc-h813" style={{ flex: "1", height: "34px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Merge</button>
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
