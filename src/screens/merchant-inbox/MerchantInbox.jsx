'use client';
// Generated from design/templates/merchant-inbox/MerchantInbox.dc.html by scripts/convert-design.mjs.
// MerchantInbox — Omnichannel inbox — Instagram, Facebook, WhatsApp, TikTok, LinkedIn and Telegram conversations in one thread view with a CRM panel, plus a public-comment moderation side.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: props.view === 'comments' ? 'comments' : 'inbox', lang: props.language === 'bn' ? 'bn' : 'en', crm: props.customerPanel !== false, composer: 'reply', ticket: props.ticketForm === true };
  }
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const inbox = this.state.view === 'inbox', bn = this.state.lang === 'bn', reply = this.state.composer === 'reply';
    return {
      isInbox: inbox, isComments: !inbox, bangla: bn, english: !bn, showCrm: this.state.crm, isReply: reply, isNote: !reply, ticketOpen: this.state.ticket,
      openTicket: () => this.setState({ view: 'inbox', ticket: true }),
      closeTicket: () => this.setState({ ticket: false }),
      openInbox: () => this.setState({ view: 'inbox' }),
      openComments: () => this.setState({ view: 'comments' }),
      setEn: () => this.setState({ lang: 'en' }), setBn: () => this.setState({ lang: 'bn' }),
      setReply: () => this.setState({ composer: 'reply' }), setNote: () => this.setState({ composer: 'note' }),
      toggleCrm: () => this.setState(s => ({ crm: !s.crm }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:9999px}
.dc-h146:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h147:hover{background:#dde5ef !important}
.dc-h148:hover{background:rgba(240,0,185,.2) !important}
.dc-h149:hover{background:rgba(0,48,135,.2) !important}
.dc-h150:hover{background:rgba(30,41,59,.18) !important}
.dc-h151:hover{background:rgba(0,156,222,.22) !important}
.dc-h152:hover{background:#f8fafc !important}
.dc-h153:hover{background:#f8fafc !important}
.dc-h154:hover{background:#f8fafc !important}
.dc-h155:hover{background:#f8fafc !important}
.dc-h156:hover{background:rgba(0,48,135,.2) !important}
.dc-h157:hover{background:rgba(240,0,185,.2) !important}
.dc-h158:hover{background:rgba(0,48,135,.2) !important}
.dc-h159:hover{background:rgba(16,185,129,.22) !important}
.dc-h160:hover{background:rgba(30,41,59,.18) !important}
.dc-h161:hover{background:rgba(0,156,222,.22) !important}
.dc-h162:hover{background:rgba(14,165,233,.22) !important}
.dc-h163:hover{background:#f1f5f9 !important}
.dc-h164:hover{background:#f1f5f9 !important}
.dc-h165:hover{background:#f8fafc !important}
.dc-h166:hover{background:#f8fafc !important}
.dc-h167:hover{background:#f8fafc !important}
.dc-h168:hover{background:#f8fafc !important}
.dc-h169:hover{background:#f8fafc !important}
.dc-h170:hover{background:#f8fafc !important}
.dc-h171:hover{background:#f8fafc !important}
.dc-h172:hover{background:rgba(16,185,129,.22) !important}
.dc-h173:hover{background:rgba(0,48,135,.2) !important}
.dc-h174:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h175:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h176:hover{background:#dde5ef !important}
.dc-h177:hover{background:#002a77 !important}
.dc-h178:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h179:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h180:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h181:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h182:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h183:hover{background:#002a77 !important}
.dc-h184:hover{background:#f1f5f9 !important}
.dc-h185:hover{background:#f1f5f9 !important}
.dc-h186:hover{background:#f1f5f9 !important}
.dc-h187:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h188:hover{background:#f8fafc !important}
.dc-h189:hover{background:#f8fafc !important}
.dc-h190:hover{background:#f8fafc !important}
.dc-h191:hover{background:rgba(0,48,135,.2) !important}
.dc-h192:hover{background:#dde5ef !important}
.dc-h193:hover{background:#dde5ef !important}
.dc-h194:hover{background:#f1f5f9 !important}
.dc-h195:hover{background:#dde5ef !important}
.dc-h196:hover{background:#dde5ef !important}
.dc-h197:hover{background:#dde5ef !important}
.dc-h198:hover{background:#002a77 !important}
.dc-h199:hover{background:rgba(0,48,135,.2) !important}
.dc-h200:hover{background:#dde5ef !important}
.dc-h201:hover{background:#f1f5f9 !important}
.dc-h202:hover{background:#dde5ef !important}
.dc-h203:hover{background:#f1f5f9 !important}
.dc-h204:hover{background:rgba(0,48,135,.2) !important}
.dc-h205:hover{background:#dde5ef !important}
.dc-h206:hover{background:#dde5ef !important}
.dc-h207:hover{background:#dde5ef !important}
.dc-h208:hover{background:#dde5ef !important}
.dc-h209:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h210:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h211:hover{background:rgba(0,48,135,.2) !important}
.dc-h212:hover{background:#dde5ef !important}`;

// ---- markup ----

export default class MerchantInboxScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MerchantInbox">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ display: "flex", gap: "12px", padding: "12px", height: "100vh", boxSizing: "border-box", overflow: "hidden", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="inbox" />
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc", overflow: "hidden" }}>
            <__Topbar crumb="Customers" page="Inbox" />
            <header style={{ zIndex: "90", display: "flex", height: "72px", flex: "none", alignItems: "center", gap: "16px", padding: "0 28px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "inline-flex", borderRadius: "9999px", background: "#e9eef5", padding: "3px" }}>
                {v.isInbox ? (<>
                  <button onClick={v.openInbox} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="message-square" strokeWidth="1.75" width="15" height="15" />Conversations<span style={{ fontVariantNumeric: "tabular-nums", color: "#94a3b8" }}>18</span></button>
                  {" "}
                  <button onClick={v.openComments} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="at-sign" strokeWidth="1.75" width="15" height="15" />Public comments<span style={{ fontVariantNumeric: "tabular-nums", color: "#94a3b8" }}>39</span></button>
                </>) : null}
                {v.isComments ? (<>
                  <button onClick={v.openInbox} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="message-square" strokeWidth="1.75" width="15" height="15" />Conversations<span style={{ fontVariantNumeric: "tabular-nums", color: "#94a3b8" }}>18</span></button>
                  {" "}
                  <button onClick={v.openComments} style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="at-sign" strokeWidth="1.75" width="15" height="15" />Public comments<span style={{ fontVariantNumeric: "tabular-nums", color: "#94a3b8" }}>39</span></button>
                </>) : null}
              </span>
              <span style={{ position: "relative", display: "inline-block", width: "260px" }}>
                <input type="search" placeholder="Search people, messages, order IDs…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "13px", color: "#1e293b" }} />
                <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "#94a3b8", pointerEvents: "none" }}>
                  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                </span>
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "9999px", background: "rgba(16,185,129,.1)", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#0f7a5a" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />6 channels connected</span>
                {v.english ? (<>
                  <span style={{ display: "inline-flex", borderRadius: "9999px", background: "#e9eef5", padding: "3px" }}>
                    <button onClick={v.setEn} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#003087" }}>EN</button>
                    <button onClick={v.setBn} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "'Hind Siliguri',Poppins,sans-serif", fontSize: "13px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#475569" }}>বাংলা</button>
                  </span>
                </>) : null}
                {v.bangla ? (<>
                  <span style={{ display: "inline-flex", borderRadius: "9999px", background: "#e9eef5", padding: "3px" }}>
                    <button onClick={v.setEn} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#475569" }}>EN</button>
                    <button onClick={v.setBn} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "'Hind Siliguri',Poppins,sans-serif", fontSize: "13px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#003087" }}>বাংলা</button>
                  </span>
                </>) : null}
                <button className="dc-h146" onClick={v.toggleCrm} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Toggle customer panel">
                  <__Icon name="panel-right" width="20" height="20" strokeWidth="1.75" />
                </button>
              </div>
            </header>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              {v.isComments ? (<>
                <section style={{ width: "328px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", padding: "16px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h1 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Posts and reels</h1>
                      <button className="dc-h147" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="14" height="14" />Sync</button>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>39 unanswered comments across 6 channels</p>
                    {v.bangla ? (<>
                      <p style={{ margin: "2px 0 0", fontFamily: "'Hind Siliguri',Poppins,sans-serif", fontSize: "15px", color: "#94a3b8" }}>৬টি চ্যানেলে ৩৯টি মন্তব্যের উত্তর বাকি</p>
                    </>) : null}
                    <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
                      <button style={{ flex: "none", height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>All<span style={{ fontVariantNumeric: "tabular-nums" }}>39</span></button>
                      <button className="dc-h148" title="Instagram" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(240,0,185,.1)", cursor: "pointer" }}>
                        <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="" style={{ width: "19px", height: "19px" }} />
                      </button>
                      <button className="dc-h149" title="Facebook" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", cursor: "pointer" }}>
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="" style={{ width: "19px", height: "19px" }} />
                      </button>
                      <button className="dc-h150" title="TikTok" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(30,41,59,.1)", cursor: "pointer" }}>
                        <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="" style={{ width: "19px", height: "19px" }} />
                      </button>
                      <button className="dc-h151" title="LinkedIn" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(0,156,222,.12)", color: "#0089c3", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>LI</button>
                    </div>
                    <select style={{ width: "100%", boxSizing: "border-box", height: "32px", marginTop: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 8px", fontSize: "13px", color: "#475569" }}>
                      <option>Sort: most unanswered</option>
                      <option>Sort: newest post</option>
                      <option>Sort: most comments</option>
                      <option>Sort: attributed sales</option>
                    </select>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", gap: "12px", padding: "12px 16px", background: "rgba(0,48,135,.06)", borderLeft: "3px solid #003087", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(240,0,185,.08)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>POST</span>
                        <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Eid collection drop</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>4 Sep</span>
                        </span>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>84 comments · ৳86,400 attributed</p>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", marginTop: "6px", borderRadius: "4px", background: "rgba(255,152,0,.12)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#a15f00" }}>9 unanswered</span>
                      </span>
                    </div>
                    <div className="dc-h152" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(0,48,135,.08)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>POST</span>
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Free delivery in Dhaka</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>3 Sep</span>
                        </span>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>41 comments · ৳22,100 attributed</p>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", marginTop: "6px", borderRadius: "4px", background: "rgba(255,152,0,.12)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#a15f00" }}>3 unanswered</span>
                      </span>
                    </div>
                    <div className="dc-h153" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>REEL</span>
                        <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="TikTok" style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Jamdani weaving, behind the scenes</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>2 Sep</span>
                        </span>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>213 comments · 41k views</p>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", marginTop: "6px", borderRadius: "4px", background: "rgba(255,87,36,.12)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#c23a12" }}>27 unanswered</span>
                      </span>
                    </div>
                    <div className="dc-h154" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(0,48,135,.08)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>LIVE</span>
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Live sale replay — Friday 9 PM</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>29 Aug</span>
                        </span>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>66 comments · ৳1,14,800 attributed</p>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", marginTop: "6px", borderRadius: "4px", background: "rgba(16,185,129,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#0f7a5a" }}>All answered</span>
                      </span>
                    </div>
                    <div className="dc-h155" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(0,156,222,.1)", color: "#0089c3", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>POST</span>
                        <span style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "9999px", background: "#009cde", color: "#fff", display: "grid", placeItems: "center", fontSize: "8px", fontWeight: "600", border: "2px solid #fff" }}>LI</span>
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hiring two fulfilment leads</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>27 Aug</span>
                        </span>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>18 comments · 6 applications</p>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", marginTop: "6px", borderRadius: "4px", background: "rgba(255,152,0,.12)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#a15f00" }}>2 unanswered</span>
                      </span>
                    </div>
                  </div>
                </section>
              </>) : null}
              {v.isInbox ? (<>
                <section style={{ width: "328px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", padding: "16px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h1 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Shared inbox</h1>
                      <button className="dc-h156" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="14" height="14" />New</button>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>18 open — 4 waiting on you</p>
                    {v.bangla ? (<>
                      <p style={{ margin: "2px 0 0", fontFamily: "'Hind Siliguri',Poppins,sans-serif", fontSize: "15px", color: "#94a3b8" }}>১৮টি খোলা — ৪টি আপনার উত্তরের অপেক্ষায়</p>
                    </>) : null}
                    <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
                      <button style={{ flex: "none", height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>All<span style={{ fontVariantNumeric: "tabular-nums" }}>18</span></button>
                      <button className="dc-h157" title="Instagram" style={{ width: "32px", height: "32px", position: "relative", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                        <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="" style={{ width: "19px", height: "19px" }} />
                        <span style={{ position: "absolute", top: "-1px", right: "-1px", width: "8px", height: "8px", borderRadius: "9999px", background: "#ff5724", border: "2px solid #fff" }} />
                      </button>
                      <button className="dc-h158" title="Facebook" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="" style={{ width: "19px", height: "19px" }} />
                      </button>
                      <button className="dc-h159" title="WhatsApp" style={{ width: "32px", height: "32px", position: "relative", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                        <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="" style={{ width: "19px", height: "19px" }} />
                        <span style={{ position: "absolute", top: "-1px", right: "-1px", width: "8px", height: "8px", borderRadius: "9999px", background: "#ff5724", border: "2px solid #fff" }} />
                      </button>
                      <button className="dc-h160" title="TikTok" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(30,41,59,.1)", color: "#1e293b", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                        <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="" style={{ width: "19px", height: "19px" }} />
                      </button>
                      <button className="dc-h161" title="LinkedIn" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(0,156,222,.12)", color: "#0089c3", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>LI</button>
                      <button className="dc-h162" title="Telegram" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "rgba(14,165,233,.12)", color: "#0272a8", fontFamily: "inherit", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>TG</button>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                      <button style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Unassigned 5</button>
                      <button className="dc-h163" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Mine 7</button>
                      <button className="dc-h164" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>SLA risk 2</button>
                    </div>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", gap: "12px", padding: "12px 16px", background: "rgba(0,48,135,.06)", borderLeft: "3px solid #003087", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "40px", height: "40px", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                        <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>2m</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Saree ta ki stock e ache? Ami 3 pcs nite chai</p>
                          <span style={{ flex: "none", minWidth: "18px", height: "18px", borderRadius: "9999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "600", display: "grid", placeItems: "center", padding: "0 5px" }}>3</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "#e9eef5", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#475569", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>GC-10482</span>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", gap: "4px", borderRadius: "4px", background: "rgba(255,152,0,.12)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#a15f00" }}>Reply in 12m</span>
                        </span>
                      </span>
                    </div>
                    <div className="dc-h165" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "500" }}>RH</span>
                        <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rakib Hasan</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>9m</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Payment done — bKash trxn 8FJ2K4LP</p>
                          <span style={{ flex: "none", minWidth: "18px", height: "18px", borderRadius: "9999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "600", display: "grid", placeItems: "center", padding: "0 5px" }}>1</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(16,185,129,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#0f7a5a" }}>Payment claim</span>
                        </span>
                      </span>
                    </div>
                    <div className="dc-h166" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="Sadia Ferdous" style={{ width: "40px", height: "40px", borderRadius: "9999px", objectFit: "cover", objectPosition: "55% 18%" }} />
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sadia Ferdous</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>24m</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Do you deliver to Cumilla? COD ache?</p>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "#e9eef5", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#475569" }}>Unassigned</span>
                        </span>
                      </span>
                    </div>
                    <div className="dc-h167" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "500" }}>TR</span>
                        <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="TikTok" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@tanvir.rides</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>1h</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Price koto vai? Link den</p>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(14,165,233,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#0272a8" }}>From a comment</span>
                        </span>
                      </span>
                    </div>
                    <div className="dc-h168" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="Farhana Jahan" style={{ width: "40px", height: "40px", borderRadius: "9999px", objectFit: "cover", objectPosition: "50% 20%" }} />
                        <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#0ea5e9", color: "#fff", display: "grid", placeItems: "center", fontSize: "8px", fontWeight: "600", border: "2px solid #fff" }}>TG</span>
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Farhana Jahan</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>2h</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Refund status for GC-10190?</p>
                          <span style={{ flex: "none", minWidth: "18px", height: "18px", borderRadius: "9999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "600", display: "grid", placeItems: "center", padding: "0 5px" }}>2</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(240,0,185,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#c1008f" }}>Refund</span>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "rgba(255,87,36,.12)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#c23a12" }}>Overdue 40m</span>
                        </span>
                      </span>
                    </div>
                    <div className="dc-h169" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "rgba(0,156,222,.12)", color: "#0089c3", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "500" }}>IR</span>
                        <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#009cde", color: "#fff", display: "grid", placeItems: "center", fontSize: "8px", fontWeight: "600", border: "2px solid #fff" }}>LI</span>
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Imran Rahman</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Tue</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Wholesale enquiry — 200 pcs for staff kits</p>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "4px", background: "#e9eef5", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#475569" }}>B2B lead</span>
                        </span>
                      </span>
                    </div>
                    <div className="dc-h170" style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "500" }}>KW</span>
                        <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "500", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Katrina West</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Tue</span>
                        </span>
                        {" "}
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "13px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Parcel received, thank you</p>
                        </span>
                        {" "}
                        <span style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ display: "inline-flex", height: "20px", alignItems: "center", gap: "4px", borderRadius: "4px", background: "rgba(16,185,129,.1)", padding: "0 6px", fontSize: "11px", fontWeight: "500", color: "#0f7a5a" }}>Resolved by Rina</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </section>
              </>) : null}
              {v.isInbox ? (<>
                <section style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", minHeight: "72px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ position: "relative", flex: "none" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "38px", height: "38px", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                      <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "17px", height: "17px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                    </span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>
                        <span style={{ whiteSpace: "nowrap" }}>Nusrat Jahan</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".04em", color: "#a15f00", whiteSpace: "nowrap" }}><__Icon name="crown" strokeWidth="1.75" width="11" height="11" />VIP</span>
                        <span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "9999px", background: "rgba(14,165,233,.12)", padding: "0 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".04em", color: "#0272a8", whiteSpace: "nowrap" }}>Repeat buyer</span>
                      </p>
                      <p style={{ margin: "1px 0 0", fontSize: "13px", color: "#94a3b8" }}>Instagram DM · @nusrat.wears · active 4m ago</p>
                    </span>
                    <button className="dc-h171" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "9999px", background: "#fff", padding: "0 6px 0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#334155", cursor: "pointer" }}><span style={{ width: "20px", height: "20px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "600" }}>RA</span>Rina Ahmed<__Icon name="chevron-down" strokeWidth="1.75" width="15" height="15" /></button>
                    <button className="dc-h172" title="Call this customer" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="15" height="15" />Call</button>
                    <button className="dc-h173" onClick={v.openTicket} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}><__Icon name="life-buoy" strokeWidth="1.75" width="15" height="15" />Ticket</button>
                    <button className="dc-h174" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="More actions">
                      <__Icon name="more-vertical" width="20" height="20" strokeWidth="1.75" />
                    </button>
                  </div>
                  {v.ticketOpen ? (<>
                    <div style={{ flex: "none", padding: "16px 24px", background: "rgba(0,48,135,.04)", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                          <__Icon name="life-buoy" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <p style={{ margin: "0", flex: "1", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>New ticket from this conversation</p>
                        <button className="dc-h175" onClick={v.closeTicket} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Close">
                          <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 190px 160px", gap: "10px", marginTop: "12px" }}>
                        <input defaultValue="Add one more saree to GC-10482 before dispatch" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontSize: "14px", color: "#1e293b" }} />
                        <select style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 8px", fontSize: "14px", color: "#475569" }}>
                          <option>Order change</option>
                          <option>Refund</option>
                          <option>Delivery</option>
                          <option>Product question</option>
                        </select>
                        <select style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 8px", fontSize: "14px", color: "#475569" }}>
                          <option>Priority: Urgent</option>
                          <option>Priority: High</option>
                          <option>Priority: Normal</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "13px", color: "#334155" }}><__Icon name="message-square" strokeWidth="1.75" width="14" height="14" />4 messages attached</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "13px", color: "#334155", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>GC-10482</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "13px", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "9px", fontWeight: "600" }}>RA</span>Assign to me</span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                          <button className="dc-h176" onClick={v.closeTicket} style={{ height: "34px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
                          <button className="dc-h177" onClick={v.closeTicket} style={{ height: "34px", border: "none", borderRadius: "8px", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Create ticket</button>
                        </span>
                      </div>
                    </div>
                  </>) : null}
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "28px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <p style={{ margin: "0", textAlign: "center", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#94a3b8" }}>Today · Asia/Dhaka</p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "#e9eef5", padding: "5px 12px", fontSize: "12px", color: "#475569" }}><__Icon name="corner-up-right" strokeWidth="1.75" width="14" height="14" />Started from a comment on “Eid collection drop” — moved to DM by Rina</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%", alignSelf: "flex-end" }} />
                      <span>
                        <span style={{ display: "block", borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px 14px", fontSize: "14px", color: "#1e293b" }}>Apu, saree ta ki stock e ache? Ami 3 pcs nite chai — Dhanmondi te deliver hobe?</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>10:02 AM · Instagram</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%", alignSelf: "flex-end", flexDirection: "row-reverse" }}>
                      <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "500", alignSelf: "flex-end" }}>RA</span>
                      <span style={{ textAlign: "right" }}>
                        <span style={{ display: "block", borderRadius: "8px", background: "rgba(0,48,135,.1)", padding: "12px 14px", fontSize: "14px", color: "#0d2352", textAlign: "left" }}>Assalamu alaikum. Ji, 3 pcs stock e ache. Dhanmondi te next day delivery — COD o nite paren.</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>10:04 AM · Rina Ahmed · <span style={{ color: "#0f7a5a" }}>Seen</span></span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%", alignSelf: "flex-end", flexDirection: "row-reverse" }}>
                      <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "500", alignSelf: "flex-end" }}>RA</span>
                      <span>
                        <span style={{ display: "flex", gap: "12px", borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px", width: "280px", textAlign: "left" }}>
                          <span style={{ width: "64px", height: "64px", flex: "none", borderRadius: "6px", background: "rgba(0,48,135,.08)", color: "#003087", display: "grid", placeItems: "center", fontSize: "15px", fontWeight: "600" }}>JS</span>
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>Jamdani cotton saree</p>
                            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>SKU JAM-114 · 6 in stock</p>
                            <p style={{ margin: "6px 0 0", fontSize: "15px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳2,425</p>
                          </span>
                        </span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>10:05 AM · Product card sent</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%", alignSelf: "flex-end" }} />
                      <span>
                        <span style={{ display: "block", borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px 14px", fontSize: "14px", color: "#1e293b" }}>Order korlam. bKash e payment diyechi — screenshot ta pathaLam. WhatsApp e update diben?</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>10:11 AM · Instagram</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%", paddingLeft: "38px" }}>
                      <span style={{ display: "block", borderRadius: "8px", border: "1px dashed #ffb951", background: "rgba(255,152,0,.08)", padding: "10px 12px" }}>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".025em", color: "#a15f00" }}>INTERNAL NOTE — not sent to customer</p>
                        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#475569" }}>Payment verified against bKash statement. Asked warehouse to pack today; courier pickup 5 PM.</p>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>10:14 AM · Rina Ahmed</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "rgba(16,185,129,.1)", padding: "5px 12px", fontSize: "12px", color: "#0f7a5a" }}><__Icon name="link" strokeWidth="1.75" width="14" height="14" />Same customer also messages on WhatsApp — threads merged</span>
                    </div>
                  </div>
                  <div style={{ flex: "none", background: "#fff", borderTop: "1px solid #e2e8f0", padding: "18px 40px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", borderRadius: "9999px", background: "#e9eef5", padding: "3px" }}>
                        {v.isReply ? (<>
                          <button onClick={v.setReply} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#003087" }}>Reply</button>
                          {" "}
                          <button onClick={v.setNote} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#475569" }}>Internal note</button>
                        </>) : null}
                        {v.isNote ? (<>
                          <button onClick={v.setReply} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#475569" }}>Reply</button>
                          {" "}
                          <button onClick={v.setNote} style={{ height: "26px", border: "none", borderRadius: "9999px", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#a15f00" }}>Internal note</button>
                        </>) : null}
                      </span>
                    </div>
                    {v.isNote ? (<>
                      <textarea rows="3" placeholder="Note for your team — the customer will not see this." style={{ width: "100%", boxSizing: "border-box", marginTop: "10px", border: "1px solid #ffb951", borderRadius: "8px", background: "rgba(255,152,0,.06)", padding: "10px 12px", fontSize: "14px", color: "#1e293b", resize: "none" }} />
                    </>) : null}
                    {v.isReply ? (<>
                      <textarea rows="3" placeholder="Write a reply — press Enter to send, Shift+Enter for a new line" style={{ width: "100%", boxSizing: "border-box", marginTop: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "10px 12px", fontSize: "14px", color: "#1e293b", resize: "none" }} />
                    </>) : null}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                      <button className="dc-h178" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Attach file">
                        <__Icon name="paperclip" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h179" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Attach image">
                        <__Icon name="image" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h180" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Insert product">
                        <__Icon name="package" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h181" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Saved replies">
                        <__Icon name="zap" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h182" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Translate to Bangla">
                        <__Icon name="languages" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Instagram allows replies for 7 days after the last message</span>
                        <button className="dc-h183" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#003087", color: "#fff", padding: "0 16px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Send<__Icon name="send" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                    </div>
                  </div>
                </section>
              </>) : null}
              {v.isComments ? (<>
                <section style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", minHeight: "72px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Eid collection drop — 12 new sarees</p>
                      <p style={{ margin: "1px 0 0", fontSize: "13px", color: "#94a3b8" }}>Instagram post · 4 Sep 2026, 6:40 PM · 84 comments · 9 unanswered</p>
                    </span>
                    <span style={{ display: "flex", gap: "6px" }}>
                      <button style={{ height: "30px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Unanswered 9</button>
                      <button className="dc-h184" style={{ height: "30px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Questions 14</button>
                      <button className="dc-h185" style={{ height: "30px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Negative 3</button>
                      <button className="dc-h186" style={{ height: "30px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Hidden 5</button>
                    </span>
                    <button className="dc-h187" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Open post">
                      <__Icon name="external-link" width="20" height="20" strokeWidth="1.75" />
                    </button>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "20px 24px 24px", display: "grid", gap: "16px", alignContent: "start" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                      <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "20px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>39</p>
                          <span style={{ color: "#ff9800" }}>
                            <__Icon name="message-circle-question" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Unanswered</p>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#ff5724" }}>▲ 8</span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "20px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>14m</p>
                          <span style={{ color: "#003087" }}>
                            <__Icon name="timer" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Median first reply</p>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#10b981" }}>▼ 6m</span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "20px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>23</p>
                          <span style={{ color: "#10b981" }}>
                            <__Icon name="shopping-bag" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Comments to orders</p>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#10b981" }}>▲ 5</span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "20px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>17</p>
                          <span style={{ color: "#697a9b" }}>
                            <__Icon name="eye-off" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Hidden by rules</p>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>this week</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "16px", borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <span style={{ width: "88px", height: "88px", flex: "none", borderRadius: "12px", background: "rgba(240,0,185,.08)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600", letterSpacing: ".025em" }}>POST</span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "14px", color: "#1e293b" }}>Twelve new Jamdani and cotton sarees, woven in Narayanganj. Free delivery inside Dhaka until Friday. Sizes and prices in the comments.</p>
                        <span style={{ display: "flex", gap: "26px", marginTop: "12px" }}>
                          <span>
                            <p style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>2,140</p>
                            <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Reactions</p>
                          </span>
                          <span>
                            <p style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>84</p>
                            <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Comments</p>
                          </span>
                          <span>
                            <p style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>61</p>
                            <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Shares</p>
                          </span>
                          <span>
                            <p style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳86,400</p>
                            <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Attributed sales</p>
                          </span>
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#e9eef5", padding: "8px 12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#334155" }}>3 selected</span>
                      <button className="dc-h188" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", background: "#fff", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="zap" strokeWidth="1.75" width="14" height="14" />Saved reply</button>
                      <button className="dc-h189" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", background: "#fff", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />Hide</button>
                      <button className="dc-h190" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", background: "#fff", color: "#c23a12", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="trash-2" strokeWidth="1.75" width="14" height="14" />Delete</button>
                      <span style={{ marginLeft: "auto", fontSize: "13px", color: "#475569" }}>Auto-hide rules: phone numbers, competitor links</span>
                    </div>
                    <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "9999px", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "13px", fontWeight: "500" }}>TR</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>@tanvir.rides</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>Question</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>18m ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#1e293b" }}>Price koto vai? Ar Cumilla te COD ache ki?</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            <button className="dc-h191" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="corner-up-left" strokeWidth="1.75" width="14" height="14" />Reply publicly</button>
                            <button className="dc-h192" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="send" strokeWidth="1.75" width="14" height="14" />Move to DM</button>
                            <button className="dc-h193" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="shopping-bag" strokeWidth="1.75" width="14" height="14" />Create order</button>
                            <button className="dc-h194" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />Hide</button>
                          </div>
                          <div style={{ marginTop: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", padding: "10px 12px" }}>
                            <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>Replying publicly as GridCommerce · Shopno Fashion</p>
                            <textarea rows="2" placeholder="Answer the question, then invite them to DM for size and stock…" style={{ width: "100%", boxSizing: "border-box", marginTop: "6px", border: "none", padding: "0", fontSize: "14px", color: "#1e293b", resize: "none", outline: "none" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                              <button className="dc-h195" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Price + COD</button>
                              <button className="dc-h196" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Bangla version</button>
                              <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                                <button className="dc-h197" style={{ height: "30px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Reply and DM</button>
                                <button className="dc-h198" style={{ height: "30px", border: "none", borderRadius: "8px", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Post reply</button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "13px", fontWeight: "500" }}>MA</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Mahmuda Alam</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Answered</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>42m ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#1e293b" }}>Ordered last week, parcel came in two days. Kapor quality onek valo.</p>
                          <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#94a3b8" }}><__Icon name="heart" strokeWidth="1.75" width="14" height="14" />Liked by page</span>
                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>·</span>
                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>2 replies</span>
                          </div>
                          <div style={{ marginTop: "12px", paddingLeft: "14px", borderLeft: "2px solid #e2e8f0", display: "grid", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "500" }}>SF</span>
                              <span>
                                <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>
                                  <span style={{ fontWeight: "600" }}>Shopno Fashion</span>
                                  {" "}
                                  <span style={{ color: "#94a3b8" }}>· page reply · 38m ago</span>
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#475569" }}>Dhonnobad Mahmuda apa. Eid collection ta o dekhte paren — free delivery Friday porjonto.</p>
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "500" }}>RS</span>
                              <span>
                                <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>
                                  <span style={{ fontWeight: "600" }}>@rumana.s</span>
                                  {" "}
                                  <span style={{ color: "#94a3b8" }}>· 21m ago</span>
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#475569" }}>Ami o nite chai. Inbox e size chart ta diben?</p>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "9999px", background: "rgba(255,87,36,.12)", color: "#c23a12", display: "grid", placeItems: "center", fontSize: "13px", fontWeight: "500" }}>AK</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Arif Karim</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Complaint</span>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "#e9eef5", color: "#475569" }}>Order GC-10190</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>1h ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#1e293b" }}>Refund ta ekhono paini. Ei niye 3 bar likhlam.</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            <button className="dc-h199" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="send" strokeWidth="1.75" width="14" height="14" />Move to DM and apologise</button>
                            <button className="dc-h200" onClick={v.openTicket} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="life-buoy" strokeWidth="1.75" width="14" height="14" />Create ticket</button>
                            <button className="dc-h201" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="sticky-note" strokeWidth="1.75" width="14" height="14" />Add internal note</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px", opacity: ".75" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "9999px", background: "rgba(105,122,155,.15)", color: "#697a9b", display: "grid", placeItems: "center", fontSize: "13px", fontWeight: "500" }}>SP</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>@shop_promo_bd</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "#e9eef5", color: "#475569" }}>Hidden by rule</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>2h ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#475569" }}>Cheaper saree available, call 017xxxxxxxx</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button className="dc-h202" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="eye" strokeWidth="1.75" width="14" height="14" />Unhide</button>
                            <button className="dc-h203" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "9999px", background: "none", color: "#c23a12", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><__Icon name="ban" strokeWidth="1.75" width="14" height="14" />Block author</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>) : null}
              {v.showCrm ? (<>
                <aside style={{ width: "320px", flex: "none", overflowY: "auto", background: "#fff", borderLeft: "1px solid #e2e8f0", padding: "20px 16px 28px" }}>
                  {v.isComments ? (<>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "9999px", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "15px", fontWeight: "600" }}>TR</span>
                        <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="TikTok" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", border: "2px solid #fff" }} />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>@tanvir.rides</p>
                        <p style={{ margin: "1px 0 0", fontSize: "13px", color: "#94a3b8" }}>First comment · not a customer yet</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button className="dc-h204" style={{ flex: "1", height: "32px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Move to DM</button>
                      <button className="dc-h205" style={{ flex: "1", height: "32px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Add customer</button>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Sentiment this week</h2>
                    <span style={{ display: "flex", height: "8px", borderRadius: "9999px", overflow: "hidden", background: "#e9eef5" }}>
                      <span style={{ width: "68%", background: "#10b981" }} />
                      <span style={{ width: "24%", background: "#697a9b" }} />
                      <span style={{ width: "8%", background: "#ff5724" }} />
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#475569" }}><span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#10b981" }} />Positive</span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>68%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#475569" }}><span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#697a9b" }} />Neutral</span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>24%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#475569" }}><span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#ff5724" }} />Negative</span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>8%</span>
                    </div>
                    <h2 style={{ margin: "20px 0 10px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>What people ask</h2>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Price</span>
                          <span style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>31</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "9999px", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "100%", height: "6px", borderRadius: "9999px", background: "#003087" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Delivery and COD</span>
                          <span style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>24</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "9999px", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "77%", height: "6px", borderRadius: "9999px", background: "#009cde" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Size and stock</span>
                          <span style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>18</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "9999px", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "58%", height: "6px", borderRadius: "9999px", background: "#10b981" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                          <span>Refund status</span>
                          <span style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>7</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "9999px", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "23%", height: "6px", borderRadius: "9999px", background: "#ff9800" }} />
                        </span>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>By channel</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <img src="/assets/cfed82fd2598f2fb3d4fb3f6c87606e5.png" alt="TikTok" style={{ width: "20px", height: "20px", flex: "none" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b" }}>TikTok</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>27</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ width: "20px", height: "20px", flex: "none" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b" }}>Instagram</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>9</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ width: "20px", height: "20px", flex: "none" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b" }}>Facebook</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ width: "20px", height: "20px", flex: "none", borderRadius: "9999px", background: "#009cde", color: "#fff", display: "grid", placeItems: "center", fontSize: "9px", fontWeight: "600" }}>LI</span>
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b" }}>LinkedIn</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 8px" }}>
                      <h2 style={{ margin: "0", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Auto-moderation</h2>
                      <a href="#" style={{ fontSize: "13px", fontWeight: "500" }}>Edit</a>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#1e293b", cursor: "pointer" }}><span style={{ width: "34px", height: "20px", flex: "none", borderRadius: "9999px", background: "#003087", position: "relative" }}>
  <span style={{ position: "absolute", top: "2px", left: "16px", width: "16px", height: "16px", borderRadius: "9999px", background: "#fff" }} />
</span>Hide phone numbers</label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#1e293b", cursor: "pointer" }}><span style={{ width: "34px", height: "20px", flex: "none", borderRadius: "9999px", background: "#003087", position: "relative" }}>
  <span style={{ position: "absolute", top: "2px", left: "16px", width: "16px", height: "16px", borderRadius: "9999px", background: "#fff" }} />
</span>Hide competitor links</label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#1e293b", cursor: "pointer" }}><span style={{ width: "34px", height: "20px", flex: "none", borderRadius: "9999px", background: "#003087", position: "relative" }}>
  <span style={{ position: "absolute", top: "2px", left: "16px", width: "16px", height: "16px", borderRadius: "9999px", background: "#fff" }} />
</span>Hide abusive language</label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569", cursor: "pointer" }}><span style={{ width: "34px", height: "20px", flex: "none", borderRadius: "9999px", background: "#cbd5e1", position: "relative" }}>
  <span style={{ position: "absolute", top: "2px", left: "2px", width: "16px", height: "16px", borderRadius: "9999px", background: "#fff" }} />
</span>Auto-answer price questions</label>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Saved replies</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>Price + COD (Bangla)</p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Used 128 times</p>
                        </span>
                        <button className="dc-h206" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Use</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>Check your inbox</p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Used 74 times</p>
                        </span>
                        <button className="dc-h207" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Use</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "13px", color: "#1e293b" }}>Refund timeline</p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>Used 31 times</p>
                        </span>
                        <button className="dc-h208" style={{ height: "26px", border: "none", borderRadius: "9999px", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Use</button>
                      </div>
                    </div>
                  </>) : null}
                  {v.isInbox ? (<>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "44px", height: "44px", flex: "none", borderRadius: "9999px", objectFit: "cover", objectPosition: "52% 22%" }} />
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", display: "flex", alignItems: "center", gap: "6px", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Nusrat Jahan<span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".04em", color: "#a15f00" }}><__Icon name="crown" strokeWidth="1.75" width="11" height="11" />VIP</span><span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".04em", color: "#0f7a5a" }}>14 orders</span><span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "9999px", background: "rgba(0,48,135,.08)", padding: "0 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".04em", color: "#003087" }}>৳68k LTV</span><span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "9999px", background: "rgba(14,165,233,.12)", padding: "0 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".04em", color: "#0272a8" }}>Repeat buyer</span></p>
                        <p style={{ margin: "1px 0 0", fontSize: "13px", color: "#94a3b8" }}>Customer since Mar 2024</p>
                      </span>
                      <button className="dc-h209" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="Edit customer">
                        <__Icon name="pencil" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(240,0,185,.1)", color: "#c1008f" }}>VIP</span>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Repeat</span>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "#e9eef5", color: "#475569" }}>Dhaka metro</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "8px", marginTop: "16px" }}>
                      <div style={{ borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "17px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳84,600</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Lifetime value</p>
                      </div>
                      <div style={{ borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "17px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>14</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Orders</p>
                      </div>
                      <div style={{ borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "17px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳6,043</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Avg. order</p>
                      </div>
                      <div style={{ borderRadius: "12px", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "17px", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>1</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Returns</p>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Contact</h2>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#1e293b" }}>
                        <span style={{ color: "#94a3b8" }}>
                          <__Icon name="phone" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#1e293b" }}>
                        <span style={{ color: "#94a3b8" }}>
                          <__Icon name="mail" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>nusrat.jahan@gmail.com</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#1e293b" }}>
                        <span style={{ color: "#94a3b8", paddingTop: "2px" }}>
                          <__Icon name="map-pin" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span>House 14, Road 7, Dhanmondi<br />Dhaka 1205</span>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Linked channels</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <img src="/assets/2059102e8af8150fddf31a9c65d3cbc7.png" alt="Instagram" style={{ width: "20px", height: "20px", flex: "none" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@nusrat.wears</span>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Primary</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <img src="/assets/c55e357bc2f730b6740093422e5af4ca.png" alt="WhatsApp" style={{ width: "20px", height: "20px", flex: "none" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b" }}>+880 1712 345 678</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <img src="/assets/17dfdfcb88d830b24dda236b7fce7488.png" alt="Facebook" style={{ width: "20px", height: "20px", flex: "none" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "13px", color: "#1e293b" }}>Nusrat Jahan</span>
                      </div>
                      <button className="dc-h210" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", height: "32px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Link another profile</button>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Recent orders</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>GC-10482</p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>4 Sep 2026 · ৳4,850</p>
                        </span>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(14,165,233,.12)", color: "#0272a8" }}>Shipped</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>GC-10344</p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>18 Aug 2026 · ৳12,400</p>
                        </span>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", padding: "0 8px", fontSize: "12px", fontWeight: "500", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Delivered</span>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Internal note</h2>
                    <textarea rows="3" placeholder="Anything the next agent should know…" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#1e293b", resize: "none" }} defaultValue={"Prefers Bangla replies. Asked about bulk pricing for 20+ pieces — follow up before Eid."} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button className="dc-h211" style={{ flex: "1", height: "36px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>New order</button>
                      <button className="dc-h212" style={{ flex: "1", height: "36px", border: "none", borderRadius: "8px", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer" }}>Full profile</button>
                    </div>
                  </>) : null}
                </aside>
              </>) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
