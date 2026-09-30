'use client';
// Generated from design/templates/support-tickets/SupportTickets.dc.html by scripts/convert-design.mjs.
// SupportTickets — Ticket desk for the omnichannel inbox — Kanban assignment board, list view, and a detail panel to assign, reply and solve.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ChannelIcon as __ChannelIcon } from '@/components/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Demo tickets shown on the board, the list and in the detail panel.
const CHANNEL_NAME = { instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', tiktok: 'TikTok', telegram: 'Telegram', linkedin: 'LinkedIn', phone: 'Phone' };
const PRIORITY_TONE = { Urgent: ['rgba(255,87,36,.12)', '#c23a12'], High: ['rgba(255,152,0,.12)', '#a15f00'], Normal: ['#e9eef5', '#475569'], Low: ['#e9eef5', '#475569'] };
const TICKETS = {
  '2304': { subject: 'Add one more saree to GC-10482 before dispatch', customer: 'Nusrat Jahan', initials: 'NJ', img: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', imgPos: '52% 22%', meta: 'VIP · 14 orders · ৳84,600 LTV', ch: 'instagram', priority: 'Urgent', status: 'New', sla: 'SLA 18m', hot: true, order: 'GC-10482', orderTotal: '৳4,850', assignee: '', full: true },
  '2303': { subject: 'bKash payment not reflecting on order', customer: 'Rakib Hasan', initials: 'RH', ch: 'whatsapp', priority: 'Normal', status: 'New', sla: '3h left', assignee: '' },
  '2302': { subject: 'Asks for size chart in Bangla', customer: '@tanvir.rides', initials: 'TR', ch: 'tiktok', priority: 'Low', status: 'New', sla: '5h left', assignee: '' },
  '2298': { subject: 'Wrong colour delivered — wants exchange', customer: 'Sadia Ferdous', initials: 'SF', img: '/assets/48a47ed6468079a61846b91934211c40.png', imgPos: '55% 18%', ch: 'facebook', priority: 'High', status: 'Assigned', sla: '2h left', order: 'GC-10455', assignee: 'Tasnim' },
  '2295': { subject: 'Refund not received for GC-10190', customer: 'Farhana Jahan', initials: 'FJ', img: '/assets/25e820cfa3e50978f934abe93e0c3db7.png', imgPos: '50% 20%', ch: 'telegram', priority: 'Normal', status: 'Assigned', sla: 'Overdue 40m', hot: true, order: 'GC-10190', assignee: 'Mehedi' },
  '2290': { subject: 'Wholesale quote for 200 staff kits', customer: 'Imran Rahman', initials: 'IR', meta: 'B2B lead', ch: 'linkedin', priority: 'Normal', status: 'Assigned', sla: '1d left', assignee: 'Rina' },
  '2291': { subject: 'Third complaint about missing refund', customer: 'Arif Karim', initials: 'AK', ch: 'phone', priority: 'Urgent', status: 'In progress', sla: 'SLA 6m', hot: true, assignee: 'Rina' },
  '2287': { subject: 'Courier lost parcel — claim filed', customer: 'Katrina West', initials: 'KW', ch: 'whatsapp', priority: 'High', status: 'In progress', sla: '4h left', assignee: 'Tasnim' },
  '2279': { subject: 'Asked for photo of the damaged item', customer: '@rumana.s', initials: 'RS', ch: 'instagram', priority: 'Normal', status: 'Waiting on customer', sla: 'Waiting 2d', assignee: 'Rina' },
  '2271': { subject: 'Waiting for a new delivery address', customer: 'Shafin Mahmud', initials: 'SM', ch: 'facebook', priority: 'Low', status: 'Waiting on customer', sla: 'Closes in 1d', assignee: 'Mehedi' },
  '2288': { subject: 'Payment verified and order released', customer: 'Rakib Hasan', initials: 'RH', ch: 'whatsapp', priority: 'Normal', status: 'Solved', sla: 'SLA met', assignee: 'Mehedi' },
  '2284': { subject: 'Size exchange arranged for Friday', customer: 'Mahmuda Alam', initials: 'MA', ch: 'instagram', priority: 'Normal', status: 'Solved', sla: 'SLA met', assignee: 'Tasnim' },
};

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: props.view === 'list' ? 'list' : 'board', detail: props.detailPanel !== false, reply: 'public', sel: '2304', mobileDetail: false };
  }
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const board = this.state.view === 'board', pub = this.state.reply === 'public';
    const sel = TICKETS[this.state.sel] ? this.state.sel : '2304';
    const t = { id: sel, ...TICKETS[sel] };
    t.channel = CHANNEL_NAME[t.ch];
    t.tone = PRIORITY_TONE[t.priority];
    const narrow = () => typeof window !== 'undefined' && window.matchMedia('(max-width:1023px)').matches;
    return {
      t, mobileDetail: this.state.mobileDetail,
      // One ticket is open at a time; below 1024px the detail panel replaces the board.
      pick: (id) => () => this.setState({ sel: id, detail: true, mobileDetail: true }),
      cur: (id) => (this.state.detail && sel === id ? 'true' : undefined),
      label: (id) => { const k = TICKETS[id]; return 'TKT-' + id + ', ' + k.subject + ', ' + k.customer + ', ' + CHANNEL_NAME[k.ch] + ', ' + k.priority; },
      isBoard: board, isList: !board, showDetail: this.state.detail, isPublic: pub, isInternal: !pub,
      openBoard: () => this.setState({ view: 'board' }),
      openList: () => this.setState({ view: 'list' }),
      toggleDetail: () => this.setState(s => (narrow() ? { detail: true, mobileDetail: !s.mobileDetail } : { detail: !s.detail, mobileDetail: false })),
      setPublic: () => this.setState({ reply: 'public' }),
      setInternal: () => this.setState({ reply: 'internal' })
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:var(--radius-full)}
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
.dc-h813:hover{background:#dde5ef !important}
.mg-row{appearance:none;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mg-list{list-style:none;margin:0;padding:0}
.mg-head>*{max-width:100%}
@media (max-width:1279px){.mg-head{height:auto!important;flex-wrap:wrap;row-gap:10px!important;padding-top:12px!important;padding-bottom:12px!important}}
@media (max-width:1023px){.mg-head{padding-left:16px!important;padding-right:16px!important}}
.tk-open{appearance:none;display:block;width:100%;margin:0;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:inherit}
.tk-open::after{content:"";position:absolute;inset:0;border-radius:var(--radius-lg)}
.ds .tk-open:focus-visible{box-shadow:none}
.tk-open:focus-visible::after{box-shadow:0 0 0 3px var(--focus-ring)}
.tk-card button:not(.tk-open),.tk-row button:not(.tk-open),.tk-card a,.tk-row a{position:relative;z-index:1}
.tk-card:has(.tk-open[aria-current="true"]){box-shadow:0 0 0 2px #003087 !important;opacity:1 !important}
.tk-row:has(.tk-open[aria-current="true"]){background:rgba(0,48,135,.06) !important;box-shadow:inset 3px 0 0 #003087}
.tk-back{display:none}
@media (max-width:1023px){.tk-panes[data-m="0"] .tk-side{display:none}.tk-panes[data-m="1"] .tk-main{display:none}.tk-side{width:100%!important;border-left:0!important}.tk-back{display:inline-flex}}`;

// ---- markup ----

export default class SupportTicketsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SupportTickets">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="tickets" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            <__Topbar crumb="Customers" page="Support tickets" />
            <header className="mg-head" style={{ zIndex: "90", display: "flex", minHeight: "72px", flex: "none", alignItems: "center", gap: "16px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Support tickets</h1>
              <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                {v.isBoard ? (<>
                  <button onClick={v.openBoard} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="columns-3" strokeWidth="1.75" width="15" height="15" />Board</button>
                  {" "}
                  <button onClick={v.openList} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="list" strokeWidth="1.75" width="15" height="15" />List</button>
                </>) : null}
                {v.isList ? (<>
                  <button onClick={v.openBoard} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="columns-3" strokeWidth="1.75" width="15" height="15" />Board</button>
                  {" "}
                  <button onClick={v.openList} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="list" strokeWidth="1.75" width="15" height="15" />List</button>
                </>) : null}
              </span>
              <span style={{ position: "relative", display: "inline-block", width: "230px" }}>
                <input aria-label="Search tickets, orders, people" type="search" placeholder="Search tickets, orders, people…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                </span>
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "-6px" }}>
                  <span style={{ width: "28px", height: "28px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", border: "2px solid #fff" }} title="3 more agents online"><span aria-hidden="true">+3</span><span className="sr-only">3 more agents online</span></span>
                </span>
                <button className="dc-h767" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><__Icon name="filter" strokeWidth="1.75" width="15" height="15" />Filters<span style={{ display: "inline-grid", placeItems: "center", minWidth: "16px", height: "16px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>2</span></button>
                <button className="dc-h768" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />New ticket</button>
                <button className="dc-h769" onClick={v.toggleDetail} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Toggle ticket panel">
                  <__Icon name="panel-right" width="20" height="20" strokeWidth="1.75" />
                </button>
              </div>
            </header>
            <div className="tk-panes" data-m={v.mobileDetail ? "1" : "0"} style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div className="tk-main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.12)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}><__Icon name="alert-triangle" strokeWidth="1.75" width="14" height="14" />2 breaching SLA</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>5 unassigned</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}>14 solved today</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>First reply 12m</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>All agents</button>
                    <button className="dc-h770" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Mine 6</button>
                    <button className="dc-h771" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Group by assignee</button>
                  </span>
                </div>
                {v.isBoard ? (<>
                  <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "18px 20px 24px" }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", minWidth: "1240px" }}>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#697a9b" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#334155" }}>New</p>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>5</span>
                          <button className="dc-h772" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Add ticket">
                            <__Icon name="plus" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Unassigned — drag onto an agent</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="tk-card dc-h773" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", borderLeft: "3px solid #ff5724" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="instagram" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2304</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2304")} aria-label={v.label("2304")} onClick={v.pick("2304")}>Add one more saree to GC-10482 before dispatch</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan · VIP</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />18m</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="12" height="12" />From call</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="paperclip" strokeWidth="1.75" width="12" height="12" />1</span>
                              <button className="dc-h774" style={{ marginLeft: "auto", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="12" height="12" />Assign</button>
                            </div>
                          </div>
                          <div className="tk-card dc-h775" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="whatsapp" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2303</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2303")} aria-label={v.label("2303")} onClick={v.pick("2303")}>bKash payment not reflecting on order</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RH</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Rakib Hasan</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />3h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="message-square" strokeWidth="1.75" width="12" height="12" />4</span>
                              <button className="dc-h776" style={{ marginLeft: "auto", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="12" height="12" />Assign</button>
                            </div>
                          </div>
                          <div className="tk-card dc-h777" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="tiktok" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2302</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Low</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2302")} aria-label={v.label("2302")} onClick={v.pick("2302")}>Asks for size chart in Bangla</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>TR</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>@tanvir.rides</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />5h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="at-sign" strokeWidth="1.75" width="12" height="12" />From comment</span>
                              <button className="dc-h778" style={{ marginLeft: "auto", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="12" height="12" />Assign</button>
                            </div>
                          </div>
                          <button className="dc-h779" style={{ height: "36px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", cursor: "pointer" }}>Show 2 more</button>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#334155" }}>Assigned</p>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>4</span>
                          <button className="dc-h780" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Add ticket">
                            <__Icon name="plus" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Owner set, work not started</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="tk-card dc-h781" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="facebook" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2298</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2298")} aria-label={v.label("2298")} onClick={v.pick("2298")}>Wrong colour delivered — wants exchange</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="Sadia Ferdous" style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "55% 18%" }} />
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Sadia Ferdous</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />2h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#003087" }}>GC-10455</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>TA</span>Tasnim</span>
                            </div>
                          </div>
                          <div className="tk-card dc-h782" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="telegram" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2295</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2295")} aria-label={v.label("2295")} onClick={v.pick("2295")}>Refund not received for GC-10190</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="Farhana Jahan" style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "50% 20%" }} />
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Farhana Jahan</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />Overdue</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="message-square" strokeWidth="1.75" width="12" height="12" />7</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>MK</span>Mehedi</span>
                            </div>
                          </div>
                          <div className="tk-card dc-h783" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="linkedin" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2290</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2290")} aria-label={v.label("2290")} onClick={v.pick("2290")}>Wholesale quote for 200 staff kits</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>IR</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Imran Rahman · B2B</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />1d</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(0,48,135,.08)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Sales</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#334155" }}>In progress</p>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>3</span>
                          <button className="dc-h784" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Add ticket">
                            <__Icon name="plus" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>WIP limit 5 per agent</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="tk-card dc-h785" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="phone" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2291</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2291")} aria-label={v.label("2291")} onClick={v.pick("2291")}>Third complaint about missing refund</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.12)", color: "#c23a12", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>AK</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Arif Karim</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />SLA 6m</span>
                            </div>
                            <span style={{ display: "block", height: "4px", marginTop: "10px", borderRadius: "var(--radius-full)", background: "#f1f5f9" }}>
                              <span style={{ display: "block", width: "86%", height: "4px", borderRadius: "var(--radius-full)", background: "#ff5724" }} />
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="git-branch" strokeWidth="1.75" width="12" height="12" />Escalated</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina</span>
                            </div>
                          </div>
                          <div className="tk-card dc-h786" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="whatsapp" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2287</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2287")} aria-label={v.label("2287")} onClick={v.pick("2287")}>Courier lost parcel — claim filed</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>KW</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Katrina West</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "#a15f00" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" />4h</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,152,0,.1)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#a15f00" }}>Waiting on courier</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>TA</span>Tasnim</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#009cde" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#334155" }}>Waiting on customer</p>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2</span>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Auto-close after 5 days</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="tk-card dc-h787" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="instagram" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2279</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2279")} aria-label={v.label("2279")} onClick={v.pick("2279")}>Asked for photo of the damaged item</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RS</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>@rumana.s</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2d</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="bell" strokeWidth="1.75" width="12" height="12" />Reminder sent</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina</span>
                            </div>
                          </div>
                          <div className="tk-card dc-h788" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="facebook" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2271</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Low</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2271")} aria-label={v.label("2271")} onClick={v.pick("2271")}>Waiting for a new delivery address</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>SM</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Shafin Mahmud</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>4d</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,152,0,.1)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#a15f00" }}>Closes in 1d</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>MK</span>Mehedi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "288px", flex: "none", display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                          <p style={{ margin: "0", flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#334155" }}>Solved</p>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>14</span>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Today · CSAT 4.7</p>
                        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                          <div className="tk-card dc-h789" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", opacity: ".85" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="whatsapp" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2288</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}><__Icon name="check" strokeWidth="1.75" width="11" height="11" />Solved</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2288")} aria-label={v.label("2288")} onClick={v.pick("2288")}>Payment verified and order released</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RH</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Rakib Hasan</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "var(--text-xs)", color: "#a15f00" }}><__Icon name="star" strokeWidth="1.75" width="12" height="12" aria-hidden="true" /><span className="sr-only">Customer rating </span>5.0</span>
                            </div>
                          </div>
                          <div className="tk-card dc-h790" style={{ position: "relative", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)", padding: "12px", opacity: ".85" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <__ChannelIcon channel="instagram" size={20} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TKT-2284</span>
                              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}><__Icon name="check" strokeWidth="1.75" width="11" height="11" />Solved</span>
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}><button type="button" className="tk-open" aria-current={v.cur("2284")} aria-label={v.label("2284")} onClick={v.pick("2284")}>Size exchange arranged for Friday</button></p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                              <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>MA</span>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569" }}>Mahmuda Alam</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "var(--text-xs)", color: "#a15f00" }}><__Icon name="star" strokeWidth="1.75" width="12" height="12" aria-hidden="true" /><span className="sr-only">Customer rating </span>4.0</span>
                            </div>
                          </div>
                          <button className="dc-h791" style={{ height: "36px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", cursor: "pointer" }}>Show 12 more</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>) : null}
                {v.isList ? (<>
                  <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "18px 20px 24px" }}>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden", minWidth: "1080px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", padding: "10px 16px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Ticket</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Subject</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Customer</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Status</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Priority</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>SLA</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Assignee</span>
                      </div>
                      <div className="tk-row dc-h792" style={{ position: "relative", display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <__ChannelIcon channel="instagram" size={20} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>2304</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><button type="button" className="tk-open" aria-current={v.cur("2304")} aria-label={v.label("2304")} onClick={v.pick("2304")}>Add one more saree to GC-10482 before dispatch</button></p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="" style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nusrat Jahan</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>New</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}>18m left</span>
                        <button className="dc-h793" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="13" height="13" />Assign</button>
                      </div>
                      <div className="tk-row dc-h794" style={{ position: "relative", display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <__ChannelIcon channel="phone" size={20} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>2291</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><button type="button" className="tk-open" aria-current={v.cur("2291")} aria-label={v.label("2291")} onClick={v.pick("2291")}>Third complaint about missing refund</button></p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.12)", color: "#c23a12", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>AK</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Arif Karim</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>In progress</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Urgent</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}>6m left</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina</span>
                      </div>
                      <div className="tk-row dc-h795" style={{ position: "relative", display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <__ChannelIcon channel="facebook" size={20} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>2298</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><button type="button" className="tk-open" aria-current={v.cur("2298")} aria-label={v.label("2298")} onClick={v.pick("2298")}>Wrong colour delivered — wants exchange</button></p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <img src="/assets/48a47ed6468079a61846b91934211c40.png" alt="" style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "55% 18%" }} />
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sadia Ferdous</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(0,48,135,.1)", color: "#003087" }}>Assigned</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>High</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>3h left</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>TA</span>Tasnim</span>
                      </div>
                      <div className="tk-row dc-h796" style={{ position: "relative", display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <__ChannelIcon channel="telegram" size={20} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>2295</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><button type="button" className="tk-open" aria-current={v.cur("2295")} aria-label={v.label("2295")} onClick={v.pick("2295")}>Refund not received for GC-10190</button></p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <img src="/assets/25e820cfa3e50978f934abe93e0c3db7.png" alt="" style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "50% 20%" }} />
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Farhana Jahan</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(0,48,135,.1)", color: "#003087" }}>Assigned</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}>Overdue 40m</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>MK</span>Mehedi</span>
                      </div>
                      <div className="tk-row dc-h797" style={{ position: "relative", display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <__ChannelIcon channel="tiktok" size={20} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>2302</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><button type="button" className="tk-open" aria-current={v.cur("2302")} aria-label={v.label("2302")} onClick={v.pick("2302")}>Asks for size chart in Bangla</button></p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>TR</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@tanvir.rides</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>New</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Low</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>1d left</span>
                        <button className="dc-h798" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="user-plus" strokeWidth="1.75" width="13" height="13" />Assign</button>
                      </div>
                      <div className="tk-row dc-h799" style={{ position: "relative", display: "grid", gridTemplateColumns: "96px 1fr 150px 140px 116px 128px 132px", gap: "12px", alignItems: "center", padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <__ChannelIcon channel="whatsapp" size={20} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>2288</span>
                        </span>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><button type="button" className="tk-open" aria-current={v.cur("2288")} aria-label={v.label("2288")} onClick={v.pick("2288")}>Payment verified and order released</button></p>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                          <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RH</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rakib Hasan</span>
                        </span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Solved</span>
                        <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Normal</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Met</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>MK</span>Mehedi</span>
                      </div>
                    </div>
                  </div>
                </>) : null}
              </div>
              {v.showDetail ? (<>
                <aside className="gc-side tk-side" aria-label="Ticket details" style={{ width: "376px", flex: "none", background: "#fff", borderLeft: "1px solid #e2e8f0", padding: "18px 18px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>TKT-{v.t.id}</span>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: v.t.tone[0], color: v.t.tone[1] }}>{v.t.priority}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "22px", borderRadius: "var(--radius-full)", background: v.t.hot ? "rgba(255,87,36,.12)" : "#e9eef5", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: v.t.hot ? "#c23a12" : "#475569" }}><__Icon name="timer" strokeWidth="1.75" width="12" height="12" aria-hidden="true" />{v.t.sla}</span>
                    <button className="dc-h800" onClick={v.toggleDetail} style={{ marginLeft: "auto", flex: "none", width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close ticket panel">
                      <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                    </button>
                  </div>
                  <h2 style={{ margin: "10px 0 0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", textWrap: "pretty" }}>{v.t.subject}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                    {v.t.img ? (<img src={v.t.img} alt="" style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: v.t.imgPos }} />) : (<span aria-hidden="true" style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{v.t.initials}</span>)}
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.t.customer}</p>
                      <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t.meta || (v.t.channel + " customer")}</p>
                    </span>
                    <button className="dc-h801" title={"Call " + v.t.customer} aria-label={"Call " + v.t.customer} style={{ width: "32px", height: "32px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", cursor: "pointer" }}>
                      <__Icon name="phone" strokeWidth="1.75" width="16" height="16" />
                    </button>
                    <button className="dc-h802" title="Open conversation" aria-label={"Open conversation with " + v.t.customer} style={{ width: "32px", height: "32px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", cursor: "pointer" }}>
                      <__Icon name="message-square" strokeWidth="1.75" width="16" height="16" />
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Status</span>
                      <select aria-label="Status" key={"st" + v.t.id} defaultValue={v.t.status} style={{ flex: "1", minWidth: "0", height: "34px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                        <option>New</option>
                        <option>Assigned</option>
                        <option>In progress</option>
                        <option>Waiting on customer</option>
                        <option>Solved</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Assignee</span>
                      <span style={{ flex: "1", minWidth: "0", display: "flex", gap: "6px" }}>
                        <button className="dc-h803" aria-label={"Assignee: " + (v.t.assignee || "Unassigned")} style={{ flex: "1", height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}><__Icon name={v.t.assignee ? "user" : "user-plus"} strokeWidth="1.75" width="15" height="15" aria-hidden="true" />{v.t.assignee || "Unassigned"}<__Icon name="chevron-down" strokeWidth="1.75" width="14" height="14" style={{ marginLeft: "auto" }} /></button>
                        {v.t.assignee ? null : (<button className="dc-h804" style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Take it</button>)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Team</span>
                      <select aria-label="Team" style={{ flex: "1", minWidth: "0", height: "34px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                        <option>Order support</option>
                        <option>Payments</option>
                        <option>Delivery</option>
                        <option>Sales</option>
                      </select>
                    </div>
                    {v.t.order ? (<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "92px", flex: "none", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Linked order</span>
                      <span style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "8px", height: "34px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "0 10px" }}>
                        <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>{v.t.order}</span>
                        {v.t.orderTotal ? (<span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t.orderTotal}</span>) : null}
                        <a href="/merchant-orders" aria-label={"Open order " + v.t.order} style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Open</a>
                      </span>
                    </div>) : null}
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px 0 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}><__ChannelIcon channel={v.t.ch} size={20} />{v.t.channel}</span>
                    {v.t.full ? (<><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}><__Icon name="phone-incoming" strokeWidth="1.75" width="13" height="13" />Created from call</span>
                    <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}>order-change</span></>) : null}
                    <button className="dc-h805" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="12" height="12" />Tag</button>
                  </div>
                  <h3 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Activity</h3>
                  {v.t.full ? (<div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                        <__Icon name="phone-incoming" strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <span>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Ticket created from inbound call by <span style={{ fontWeight: "var(--weight-medium)" }}>Rina</span></p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Today 11:06 · recording attached (2:14)</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "26px", height: "26px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                      <span>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>“Ekta saree add korte chai, difference bKash e dicchi.”</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Today 11:04 · call transcript</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.12)", color: "#a15f00", display: "grid", placeItems: "center" }}>
                        <__Icon name="sticky-note" strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <span>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Stock confirmed — 6 left of JAM-114. Courier pickup 5 PM, needs packing hold.</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Internal note · Rina</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center" }}>
                        <__Icon name="message-square" strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <span>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Earlier Instagram DM thread merged into this ticket</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Today 10:11 · 4 messages</p>
                      </span>
                    </div>
                  </div>) : (<div style={{ display: "flex", gap: "10px" }}>
                      <__ChannelIcon channel={v.t.ch} size={26} />
                      <span>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Ticket opened from {v.t.channel} by <span style={{ fontWeight: "var(--weight-medium)" }}>{v.t.customer}</span></p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.t.status} · {v.t.sla}</p>
                      </span>
                    </div>)}
                  <h3 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Reply</h3>
                  <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                    {v.isPublic ? (<>
                      <button onClick={v.setPublic} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087" }}>Reply to customer</button>
                      {" "}
                      <button onClick={v.setInternal} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}>Internal note</button>
                    </>) : null}
                    {v.isInternal ? (<>
                      <button onClick={v.setPublic} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}>Reply to customer</button>
                      {" "}
                      <button onClick={v.setInternal} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#a15f00" }}>Internal note</button>
                    </>) : null}
                  </span>
                  {v.isPublic ? (<>
                    <textarea aria-label={"Reply to " + v.t.customer + " on " + v.t.channel} rows="3" placeholder={"Reply on " + v.t.channel + " — the channel the customer used…"} style={{ width: "100%", boxSizing: "border-box", marginTop: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "10px 12px", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none" }} />
                  </>) : null}
                  {v.isInternal ? (<>
                    <textarea aria-label={"Internal note on TKT-" + v.t.id} rows="3" placeholder="Note for the team — the customer will not see this." style={{ width: "100%", boxSizing: "border-box", marginTop: "8px", border: "1px solid #ffb951", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.06)", padding: "10px 12px", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none" }} />
                  </>) : null}
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                    <button className="dc-h806" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Payment link</button>
                    <button className="dc-h807" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Dispatch time</button>
                    <button className="dc-h808" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Bangla version</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <button className="dc-h809" style={{ flex: "1", height: "36px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="check-check" strokeWidth="1.75" width="16" height="16" />Solve ticket</button>
                    <button className="dc-h810" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Send reply</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button className="dc-h811" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Escalate</button>
                    <button className="dc-h812" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Snooze 2h</button>
                    <button className="dc-h813" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Merge</button>
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
