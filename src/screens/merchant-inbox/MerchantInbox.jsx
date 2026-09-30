'use client';
// Generated from design/templates/merchant-inbox/MerchantInbox.dc.html by scripts/convert-design.mjs.
// MerchantInbox — Omnichannel inbox — Instagram, Facebook, WhatsApp, TikTok, LinkedIn and Telegram conversations in one thread view with a CRM panel, plus a public-comment moderation side.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ChannelIcon as __ChannelIcon, EmptyState as __EmptyState } from '@/components/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Demo data for the two lists. Only the first conversation and the first post have a full sample thread.
const CH_NAME = { instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', tiktok: 'TikTok', linkedin: 'LinkedIn', telegram: 'Telegram' };
const CH_TINT = { instagram: ['rgba(240,0,185,.08)', '#c1008f'], facebook: ['rgba(0,48,135,.08)', '#003087'], tiktok: ['rgba(30,41,59,.08)', '#1e293b'], linkedin: ['rgba(0,156,222,.1)', 'var(--accent-text)'] };
const TONE = { slate: ['#e9eef5', '#475569'], warn: ['rgba(255,152,0,.12)', '#a15f00'], success: ['rgba(16,185,129,.1)', '#0f7a5a'], info: ['rgba(14,165,233,.1)', '#0272a8'], pink: ['rgba(240,0,185,.1)', '#c1008f'], danger: ['rgba(255,87,36,.12)', '#c23a12'] };
const AVATAR = { green: ['rgba(16,185,129,.12)', '#0f7a5a'], dark: ['rgba(30,41,59,.08)', '#1e293b'], sky: ['rgba(0,156,222,.12)', 'var(--accent-text)'], grey: ['rgba(105,122,155,.15)', 'var(--text-muted)'] };
const CONVS = [
  { id: 'nusrat', name: 'Nusrat Jahan', ch: 'instagram', time: '2m', text: 'Saree ta ki stock e ache? Ami 3 pcs nite chai', unread: 3, img: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', imgPos: '52% 22%', tags: [['GC-10482', 'slate', true], ['Reply in 12m', 'warn']], full: true },
  { id: 'rakib', name: 'Rakib Hasan', ch: 'whatsapp', time: '9m', text: 'Payment done — bKash trxn 8FJ2K4LP', unread: 1, initials: 'RH', tint: 'green', tags: [['Payment claim', 'success']] },
  { id: 'sadia', name: 'Sadia Ferdous', ch: 'facebook', time: '24m', text: 'Do you deliver to Cumilla? COD ache?', img: '/assets/48a47ed6468079a61846b91934211c40.png', imgPos: '55% 18%', tags: [['Unassigned', 'slate']] },
  { id: 'tanvir', name: '@tanvir.rides', ch: 'tiktok', time: '1h', text: 'Price koto vai? Link den', initials: 'TR', tint: 'dark', tags: [['From a comment', 'info']] },
  { id: 'farhana', name: 'Farhana Jahan', ch: 'telegram', time: '2h', text: 'Refund status for GC-10190?', unread: 2, img: '/assets/25e820cfa3e50978f934abe93e0c3db7.png', imgPos: '50% 20%', tags: [['Refund', 'pink'], ['Overdue 40m', 'danger']] },
  { id: 'imran', name: 'Imran Rahman', ch: 'linkedin', time: 'Tue', text: 'Wholesale enquiry — 200 pcs for staff kits', initials: 'IR', tint: 'sky', tags: [['B2B lead', 'slate']] },
  { id: 'katrina', name: 'Katrina West', ch: 'whatsapp', time: 'Tue', text: 'Parcel received, thank you', initials: 'KW', tint: 'grey', read: true, tags: [['Resolved by Rina', 'success']] },
];
const POSTS = [
  { id: 'eid', kind: 'POST', ch: 'instagram', title: 'Eid collection drop', date: '4 Sep', meta: '84 comments · ৳86,400 attributed', open: '9 unanswered', tone: 'warn', full: true },
  { id: 'delivery', kind: 'POST', ch: 'facebook', title: 'Free delivery in Dhaka', date: '3 Sep', meta: '41 comments · ৳22,100 attributed', open: '3 unanswered', tone: 'warn' },
  { id: 'jamdani', kind: 'REEL', ch: 'tiktok', title: 'Jamdani weaving, behind the scenes', date: '2 Sep', meta: '213 comments · 41k views', open: '27 unanswered', tone: 'danger' },
  { id: 'live', kind: 'LIVE', ch: 'facebook', title: 'Live sale replay — Friday 9 PM', date: '29 Aug', meta: '66 comments · ৳1,14,800 attributed', open: 'All answered', tone: 'success' },
  { id: 'hiring', kind: 'POST', ch: 'linkedin', title: 'Hiring two fulfilment leads', date: '27 Aug', meta: '18 comments · 6 applications', open: '2 unanswered', tone: 'warn' },
];
const RULES = ['Hide phone numbers', 'Hide competitor links', 'Hide abusive language', 'Auto-answer price questions'];

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: props.view === 'comments' ? 'comments' : 'inbox', lang: props.language === 'bn' ? 'bn' : 'en', crm: props.customerPanel !== false, composer: 'reply', ticket: props.ticketForm === true, sel: 'nusrat', post: 'eid', chan: 'all', q: '', pane: 'list', rules: [true, true, true, false] };
  }
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const inbox = this.state.view === 'inbox', bn = this.state.lang === 'bn', reply = this.state.composer === 'reply';
    const q = this.state.q.trim().toLowerCase(), chan = this.state.chan;
    const hit = (ch, words) => (chan === 'all' || ch === chan) && (!q || words.toLowerCase().includes(q));
    const convs = CONVS.filter(c => hit(c.ch, c.name + ' ' + c.text + ' ' + c.tags.map(g => g[0]).join(' ')));
    const posts = POSTS.filter(p => hit(p.ch, p.title + ' ' + p.meta));
    return {
      convs, posts, chan, q: this.state.q, pane: this.state.pane,
      conv: CONVS.find(c => c.id === this.state.sel) || CONVS[0],
      post: POSTS.find(p => p.id === this.state.post) || POSTS[0],
      rules: RULES.map((label, i) => ({ label, on: this.state.rules[i] })),
      // Opening a row also switches to the thread pane, which is the only pane shown below 1024px.
      pick: (id) => () => this.setState({ sel: id, ticket: false, pane: 'thread' }),
      pickPost: (id) => () => this.setState({ post: id, pane: 'thread' }),
      backToList: () => this.setState({ pane: 'list' }),
      setChan: (ch) => () => this.setState({ chan: ch }),
      setQ: (e) => this.setState({ q: e.target.value }),
      clearFilters: () => this.setState({ q: '', chan: 'all' }),
      unreadOn: (ch) => CONVS.some(c => c.ch === ch && c.unread),
      toggleRule: (i) => () => this.setState(s => ({ rules: s.rules.map((on, k) => (k === i ? !on : on)) })),
      isInbox: inbox, isComments: !inbox, bangla: bn, english: !bn, showCrm: this.state.crm, isReply: reply, isNote: !reply, ticketOpen: this.state.ticket,
      openTicket: () => this.setState({ view: 'inbox', ticket: true, pane: 'thread' }),
      closeTicket: () => this.setState({ ticket: false }),
      openInbox: () => this.setState({ view: 'inbox', chan: 'all', pane: 'list' }),
      openComments: () => this.setState({ view: 'comments', chan: 'all', pane: 'list' }),
      setEn: () => this.setState({ lang: 'en' }), setBn: () => this.setState({ lang: 'bn' }),
      setReply: () => this.setState({ composer: 'reply' }), setNote: () => this.setState({ composer: 'note' }),
      toggleCrm: () => this.setState(s => ({ crm: !s.crm }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:var(--radius-full)}
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
.dc-h212:hover{background:#dde5ef !important}
.mg-row{appearance:none;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mg-list{list-style:none;margin:0;padding:0}
.mg-head>*{max-width:100%}
@media (max-width:1279px){.mg-head{height:auto!important;flex-wrap:wrap;row-gap:10px!important;padding-top:12px!important;padding-bottom:12px!important}}
@media (max-width:1023px){.mg-head{padding-left:16px!important;padding-right:16px!important}}
.ibx-row{border-left:3px solid transparent}
.ibx-row:hover{background:#f8fafc}
.ibx-row[aria-current="true"]{background:rgba(0,48,135,.06);border-left-color:#003087}
.ds .ibx-row:focus-visible{box-shadow:inset 0 0 0 3px var(--focus-ring)}
.ibx-chan:hover{background:#dde5ef !important}
.ibx-chan[aria-pressed="true"]{box-shadow:0 0 0 2px #fff,0 0 0 4px #003087}
.ibx-back{display:none}
@media (max-width:1279px){.ibx-panes{flex-wrap:wrap}.ibx-thread{min-width:320px}.ibx-side{flex:1 1 100%!important;width:auto!important;border-left:0!important;border-top:1px solid #e2e8f0}.ibx-thead{flex-wrap:wrap}}
@media (max-width:1023px){.ibx-panes{flex-direction:column;flex-wrap:nowrap}.ibx-panes>*{flex:none!important;width:100%!important;min-width:0!important}.ibx-list{border-right:0!important}.ibx-panes[data-pane="list"] .ibx-thread,.ibx-panes[data-pane="list"] .ibx-side,.ibx-panes[data-pane="thread"] .ibx-list{display:none!important}.ibx-back{display:grid}.ibx-msgs{padding:20px 16px!important}.ibx-composer{padding:14px 16px!important}.ibx-cmts{padding:16px!important}.ibx-thead{padding:12px 16px!important}}
@media (max-width:767px){.ibx-tform{grid-template-columns:minmax(0,1fr)!important}}`;

// ---- markup ----

export default class MerchantInboxScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const tag = ([label, tone, data], i) => (<span key={i} style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: TONE[tone][0], padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: TONE[tone][1], fontFamily: data ? "var(--font-data)" : undefined }}>{label}</span>);
    const avatar = (c, size) => (c.img
      ? (<img src={c.img} alt="" style={{ width: size, height: size, flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: c.imgPos }} />)
      : (<span aria-hidden="true" style={{ width: size, height: size, flex: "none", borderRadius: "var(--radius-full)", background: AVATAR[c.tint][0], color: AVATAR[c.tint][1], display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{c.initials}</span>));
    const badge = (ch) => (<span style={{ position: "absolute", bottom: "-4px", right: "-4px", display: "grid", borderRadius: "var(--radius-full)", border: "2px solid #fff", background: "#fff" }}><__ChannelIcon channel={ch} size={20} /></span>);
    const chanBtn = (ch, dot) => (<button key={ch} type="button" className="ibx-chan" aria-pressed={v.chan === ch} aria-label={CH_NAME[ch] + (dot && v.unreadOn(ch) ? ", unread messages" : "")} title={CH_NAME[ch]} onClick={v.setChan(ch)} style={{ width: "32px", height: "32px", flex: "none", position: "relative", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", cursor: "pointer" }}><__ChannelIcon channel={ch} size={20} />{dot && v.unreadOn(ch) ? (<span aria-hidden="true" style={{ position: "absolute", top: "-1px", right: "-1px", width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "var(--fill-danger)", border: "2px solid #fff" }} />) : null}</button>);
    const noMatch = (what) => (<__EmptyState title={"No " + what + " match these filters"} body="Check the spelling, or clear the search and channel filter." actionLabel="Clear filters" onAction={v.clearFilters} />);
    return (
      <div className="dc-screen ds" data-screen="MerchantInbox">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="inbox" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            <__Topbar crumb="Customers" page="Inbox" />
            <header className="mg-head" style={{ zIndex: "90", display: "flex", height: "72px", flex: "none", alignItems: "center", gap: "16px", padding: "0 28px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                {v.isInbox ? (<>
                  <button onClick={v.openInbox} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="message-square" strokeWidth="1.75" width="15" height="15" />Conversations<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>18</span></button>
                  {" "}
                  <button onClick={v.openComments} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="at-sign" strokeWidth="1.75" width="15" height="15" />Public comments<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>39</span></button>
                </>) : null}
                {v.isComments ? (<>
                  <button onClick={v.openInbox} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="message-square" strokeWidth="1.75" width="15" height="15" />Conversations<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>18</span></button>
                  {" "}
                  <button onClick={v.openComments} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="at-sign" strokeWidth="1.75" width="15" height="15" />Public comments<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>39</span></button>
                </>) : null}
              </span>
              <span style={{ position: "relative", display: "inline-block", width: "260px" }}>
                <input aria-label="Search people, messages, order IDs" type="search" value={v.q} onChange={v.setQ} placeholder="Search people, messages, order IDs…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                </span>
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "28px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />6 channels connected</span>
                {v.english ? (<>
                  <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                    <button onClick={v.setEn} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087" }}>EN</button>
                    <button onClick={v.setBn} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "var(--font-bn)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}>বাংলা</button>
                  </span>
                </>) : null}
                {v.bangla ? (<>
                  <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                    <button onClick={v.setEn} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}>EN</button>
                    <button onClick={v.setBn} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "var(--font-bn)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087" }}>বাংলা</button>
                  </span>
                </>) : null}
                <button className="dc-h146" onClick={v.toggleCrm} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Toggle customer panel">
                  <__Icon name="panel-right" width="20" height="20" strokeWidth="1.75" />
                </button>
              </div>
            </header>
            <div className="ibx-panes" data-pane={v.pane} style={{ flex: "1", minHeight: "0", display: "flex" }}>
              {v.isComments ? (<>
                <section className="ibx-list" style={{ width: "328px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", padding: "16px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Posts and reels</h1>
                      <button className="dc-h147" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="14" height="14" />Sync</button>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>39 unanswered comments across 6 channels</p>
                    {v.bangla ? (<>
                      <p style={{ margin: "2px 0 0", fontFamily: "var(--font-bn)", fontSize: "var(--text-sm-plus)", color: "var(--text-muted)" }}>৬টি চ্যানেলে ৩৯টি মন্তব্যের উত্তর বাকি</p>
                    </>) : null}
                    <div role="group" aria-label="Filter by channel" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
                      <button style={{ flex: "none", height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }} aria-pressed={v.chan === "all"} onClick={v.setChan("all")}>All<span style={{ fontVariantNumeric: "tabular-nums" }}>39</span></button>
                      {["instagram", "facebook", "tiktok", "linkedin"].map((ch) => chanBtn(ch, false))}
                    </div>
                    <select aria-label="Sort posts" style={{ width: "100%", boxSizing: "border-box", height: "32px", marginTop: "10px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                      <option>Sort: most unanswered</option>
                      <option>Sort: newest post</option>
                      <option>Sort: most comments</option>
                      <option>Sort: attributed sales</option>
                    </select>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", borderTop: "1px solid #e2e8f0" }}>
                    {v.posts.length ? (
                      <ul className="mg-list" aria-label="Posts and reels">
                        {v.posts.map((p) => (
                          <li key={p.id}>
                            <button type="button" className="mg-row ibx-row" aria-current={v.post.id === p.id ? "true" : undefined} aria-label={p.title + ", " + CH_NAME[p.ch] + " " + p.kind.toLowerCase() + ", " + p.open} onClick={v.pickPost(p.id)} style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                              <span style={{ position: "relative", flex: "none", alignSelf: "flex-start" }}>
                                <span aria-hidden="true" style={{ width: "44px", height: "44px", borderRadius: "var(--radius-lg)", background: CH_TINT[p.ch][0], color: CH_TINT[p.ch][1], display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>{p.kind}</span>
                                {badge(p.ch)}
                              </span>
                              <span style={{ flex: "1", minWidth: "0" }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                                  <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                                  <span style={{ flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{p.date}</span>
                                </span>
                                <span style={{ display: "block", marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>{p.meta}</span>
                                <span style={{ display: "flex", marginTop: "6px" }}>{tag([p.open, p.tone], 0)}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : noMatch("posts")}
                  </div>
                </section>
              </>) : null}
              {v.isInbox ? (<>
                <section className="ibx-list" style={{ width: "328px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", padding: "16px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Shared inbox</h1>
                      <button className="dc-h156" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="14" height="14" />New</button>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>18 open — 4 waiting on you</p>
                    {v.bangla ? (<>
                      <p style={{ margin: "2px 0 0", fontFamily: "var(--font-bn)", fontSize: "var(--text-sm-plus)", color: "var(--text-muted)" }}>১৮টি খোলা — ৪টি আপনার উত্তরের অপেক্ষায়</p>
                    </>) : null}
                    <div role="group" aria-label="Filter by channel" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
                      <button style={{ flex: "none", height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }} aria-pressed={v.chan === "all"} onClick={v.setChan("all")}>All<span style={{ fontVariantNumeric: "tabular-nums" }}>18</span></button>
                      {["instagram", "facebook", "whatsapp", "tiktok", "linkedin", "telegram"].map((ch) => chanBtn(ch, true))}
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                      <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Unassigned 5</button>
                      <button className="dc-h163" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Mine 7</button>
                      <button className="dc-h164" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>SLA risk 2</button>
                    </div>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", borderTop: "1px solid #e2e8f0" }}>
                    {v.convs.length ? (
                      <ul className="mg-list" aria-label="Conversations">
                        {v.convs.map((c) => (
                          <li key={c.id}>
                            <button type="button" className="mg-row ibx-row" aria-current={v.conv.id === c.id ? "true" : undefined} aria-label={c.name + ", " + CH_NAME[c.ch] + (c.unread ? ", " + c.unread + " unread" : "")} aria-describedby={"ibx-prev-" + c.id} onClick={v.pick(c.id)} style={{ display: "flex", gap: "12px", padding: "12px 16px" }}>
                              <span style={{ position: "relative", flex: "none", alignSelf: "flex-start", display: "flex" }}>
                                {avatar(c, "40px")}
                                {badge(c.ch)}
                              </span>
                              <span style={{ flex: "1", minWidth: "0" }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                                  <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: c.read ? "#475569" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                                  <span style={{ flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{c.time}</span>
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                                  <span id={"ibx-prev-" + c.id} style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: c.read ? "var(--text-muted)" : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.text}</span>
                                  {c.unread ? (<span aria-hidden="true" style={{ flex: "none", minWidth: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "grid", placeItems: "center", padding: "0 5px" }}>{c.unread}</span>) : null}
                                </span>
                                <span style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>{c.tags.map(tag)}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : noMatch("conversations")}
                  </div>
                </section>
              </>) : null}
              {v.isInbox ? (<>
                <section className="ibx-thread" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  <div className="ibx-thead" style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", minHeight: "72px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <button type="button" className="ibx-back" onClick={v.backToList} aria-label="Back to conversations" style={{ width: "36px", height: "36px", flex: "none", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", cursor: "pointer" }}><__Icon name="arrow-left" strokeWidth="1.75" width="18" height="18" aria-hidden="true" /></button>
                    <span style={{ position: "relative", flex: "none", display: "flex" }}>
                      {avatar(v.conv, "38px")}
                      {badge(v.conv.ch)}
                    </span>
                    <span style={{ flex: "1", minWidth: "160px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>
                        <span>{v.conv.name}</span>
                        {v.conv.full ? (<>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "#a15f00", whiteSpace: "nowrap" }}><__Icon name="crown" strokeWidth="1.75" width="12" height="12" aria-hidden="true" />VIP</span>
                          <span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(14,165,233,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "#0272a8", whiteSpace: "nowrap" }}>Repeat buyer</span>
                        </>) : null}
                      </h2>
                      <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.conv.full ? "Instagram DM · @nusrat.wears · active 4m ago" : CH_NAME[v.conv.ch] + " · last message " + v.conv.time}</p>
                    </span>
                    <button className="dc-h171" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 6px 0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", cursor: "pointer" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Rina Ahmed<__Icon name="chevron-down" strokeWidth="1.75" width="15" height="15" /></button>
                    <button className="dc-h172" title={"Call " + v.conv.name} aria-label={"Call " + v.conv.name} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="phone" strokeWidth="1.75" width="15" height="15" />Call</button>
                    <button className="dc-h173" onClick={v.openTicket} style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="life-buoy" strokeWidth="1.75" width="15" height="15" />Ticket</button>
                    <button className="dc-h174" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="More actions">
                      <__Icon name="more-vertical" width="20" height="20" strokeWidth="1.75" />
                    </button>
                  </div>
                  {v.ticketOpen ? (<>
                    <div style={{ flex: "none", padding: "16px 24px", background: "rgba(0,48,135,.04)", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                          <__Icon name="life-buoy" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <p style={{ margin: "0", flex: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>New ticket from this conversation</p>
                        <button className="dc-h175" onClick={v.closeTicket} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close">
                          <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                        </button>
                      </div>
                      <div className="ibx-tform" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 190px 160px", gap: "10px", marginTop: "12px" }}>
                        <input aria-label="Ticket subject" defaultValue="Add one more saree to GC-10482 before dispatch" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                        <select aria-label="Ticket category" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-sm)", color: "#475569" }}>
                          <option>Order change</option>
                          <option>Refund</option>
                          <option>Delivery</option>
                          <option>Product question</option>
                        </select>
                        <select aria-label="Ticket priority" style={{ boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-sm)", color: "#475569" }}>
                          <option>Priority: Urgent</option>
                          <option>Priority: High</option>
                          <option>Priority: Normal</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#334155" }}><__Icon name="message-square" strokeWidth="1.75" width="14" height="14" />4 messages attached</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#334155", fontFamily: "var(--font-data)" }}>GC-10482</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>RA</span>Assign to me</span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                          <button className="dc-h176" onClick={v.closeTicket} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Cancel</button>
                          <button className="dc-h177" onClick={v.closeTicket} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Create ticket</button>
                        </span>
                      </div>
                    </div>
                  </>) : null}
                  <div className="ibx-msgs" role="log" aria-label={"Messages with " + v.conv.name} style={{ flex: "1", minHeight: "0", padding: "28px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {v.conv.full ? (<>
                    <p style={{ margin: "0", textAlign: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Today · Asia/Dhaka</p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "5px 12px", fontSize: "var(--text-xs)", color: "#475569" }}><__Icon name="corner-up-right" strokeWidth="1.75" width="14" height="14" />Started from a comment on “Eid collection drop” — moved to DM by Rina</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%", alignSelf: "flex-end" }} />
                      <span>
                        <span style={{ display: "block", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px 14px", fontSize: "var(--text-sm)", color: "#1e293b" }}>Apu, saree ta ki stock e ache? Ami 3 pcs nite chai — Dhanmondi te deliver hobe?</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>10:02 AM · Instagram</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%", alignSelf: "flex-end", flexDirection: "row-reverse" }}>
                      <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", alignSelf: "flex-end" }}>RA</span>
                      <span style={{ textAlign: "right" }}>
                        <span style={{ display: "block", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "12px 14px", fontSize: "var(--text-sm)", color: "#0d2352", textAlign: "left" }}>Assalamu alaikum. Ji, 3 pcs stock e ache. Dhanmondi te next day delivery — COD o nite paren.</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>10:04 AM · Rina Ahmed · <span style={{ color: "#0f7a5a" }}>Seen</span></span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%", alignSelf: "flex-end", flexDirection: "row-reverse" }}>
                      <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", alignSelf: "flex-end" }}>RA</span>
                      <span>
                        <span style={{ display: "flex", gap: "12px", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px", width: "280px", textAlign: "left" }}>
                          <span style={{ width: "64px", height: "64px", flex: "none", borderRadius: "var(--radius-md)", background: "rgba(0,48,135,.08)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>JS</span>
                          <span style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Jamdani cotton saree</p>
                            <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>SKU JAM-114 · 6 in stock</p>
                            <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳2,425</p>
                          </span>
                        </span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "right" }}>10:05 AM · Product card sent</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%", alignSelf: "flex-end" }} />
                      <span>
                        <span style={{ display: "block", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px 14px", fontSize: "var(--text-sm)", color: "#1e293b" }}>Order korlam. bKash e payment diyechi — screenshot ta pathaLam. WhatsApp e update diben?</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>10:11 AM · Instagram</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%", paddingLeft: "38px" }}>
                      <span style={{ display: "block", borderRadius: "var(--radius-lg)", border: "1px dashed #ffb951", background: "rgba(255,152,0,.08)", padding: "10px 12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#a15f00" }}>INTERNAL NOTE — not sent to customer</p>
                        <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Payment verified against bKash statement. Asked warehouse to pack today; courier pickup 5 PM.</p>
                        <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>10:14 AM · Rina Ahmed</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "5px 12px", fontSize: "var(--text-xs)", color: "#0f7a5a" }}><__Icon name="link" strokeWidth="1.75" width="14" height="14" />Same customer also messages on WhatsApp — threads merged</span>
                    </div>
                    </>) : (<>
                    <p style={{ margin: "0", textAlign: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{"Last message · " + v.conv.time}</p>
                    <div style={{ display: "flex", gap: "10px", maxWidth: "78%" }}>
                      <span style={{ display: "flex", flex: "none", alignSelf: "flex-end" }}>{avatar(v.conv, "28px")}</span>
                      <span>
                        <span style={{ display: "block", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "12px 14px", fontSize: "var(--text-sm)", color: "#1e293b" }}>{v.conv.text}</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.conv.time + " · " + CH_NAME[v.conv.ch]}</span>
                      </span>
                    </div>
                    </>)}
                  </div>
                  <div className="ibx-composer" style={{ flex: "none", background: "#fff", borderTop: "1px solid #e2e8f0", padding: "18px 40px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                        {v.isReply ? (<>
                          <button onClick={v.setReply} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087" }}>Reply</button>
                          {" "}
                          <button onClick={v.setNote} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}>Internal note</button>
                        </>) : null}
                        {v.isNote ? (<>
                          <button onClick={v.setReply} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}>Reply</button>
                          {" "}
                          <button onClick={v.setNote} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#a15f00" }}>Internal note</button>
                        </>) : null}
                      </span>
                    </div>
                    {v.isNote ? (<>
                      <textarea aria-label={"Internal note about " + v.conv.name} rows="3" placeholder="Note for your team — the customer will not see this." style={{ width: "100%", boxSizing: "border-box", marginTop: "10px", border: "1px solid #ffb951", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.06)", padding: "10px 12px", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none" }} />
                    </>) : null}
                    {v.isReply ? (<>
                      <textarea aria-label={"Reply to " + v.conv.name} rows="3" placeholder="Write a reply — press Enter to send, Shift+Enter for a new line" style={{ width: "100%", boxSizing: "border-box", marginTop: "10px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none" }} />
                    </>) : null}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                      <button className="dc-h178" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Attach file">
                        <__Icon name="paperclip" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h179" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Attach image">
                        <__Icon name="image" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h180" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Insert product">
                        <__Icon name="package" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h181" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Saved replies">
                        <__Icon name="zap" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <button className="dc-h182" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Translate to Bangla">
                        <__Icon name="languages" strokeWidth="1.75" width="18" height="18" />
                      </button>
                      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.conv.full ? "Instagram allows replies for 7 days after the last message" : "Replying on " + CH_NAME[v.conv.ch]}</span>
                        <button className="dc-h183" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Send<__Icon name="send" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                    </div>
                  </div>
                </section>
              </>) : null}
              {v.isComments ? (<>
                <section className="ibx-thread" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", minHeight: "72px", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                    <button type="button" className="ibx-back" onClick={v.backToList} aria-label="Back to posts" style={{ width: "36px", height: "36px", flex: "none", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", cursor: "pointer" }}><__Icon name="arrow-left" strokeWidth="1.75" width="18" height="18" aria-hidden="true" /></button>
                    <span style={{ flex: "1", minWidth: "200px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.post.full ? "Eid collection drop — 12 new sarees" : v.post.title}</h2>
                      <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.post.full ? "Instagram post · 4 Sep 2026, 6:40 PM · 84 comments · 9 unanswered" : CH_NAME[v.post.ch] + " " + v.post.kind.toLowerCase() + " · " + v.post.date + " 2026 · " + v.post.meta}</p>
                    </span>
                    {v.post.full ? (<span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Unanswered 9</button>
                      <button className="dc-h184" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Questions 14</button>
                      <button className="dc-h185" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Negative 3</button>
                      <button className="dc-h186" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Hidden 5</button>
                    </span>) : null}
                    <button className="dc-h187" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Open post">
                      <__Icon name="external-link" width="20" height="20" strokeWidth="1.75" />
                    </button>
                  </div>
                  <div className="ibx-cmts" style={{ flex: "1", minHeight: "0", padding: "20px 24px 24px", display: "grid", gap: "16px", alignContent: "start" }}>
                    <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>39</p>
                          <span style={{ color: "var(--text-warning)" }}>
                            <__Icon name="message-circle-question" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Unanswered</p>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>8</span></span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>14m</p>
                          <span style={{ color: "#003087" }}>
                            <__Icon name="timer" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Median first reply</p>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-down" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Down </span>6m</span></span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>23</p>
                          <span style={{ color: "var(--text-success)" }}>
                            <__Icon name="shopping-bag" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Comments to orders</p>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}><__Icon name="arrow-up" strokeWidth="2" width="12" height="12" aria-hidden="true" /><span className="sr-only">Up </span>5</span></span>
                        </div>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>17</p>
                          <span style={{ color: "var(--text-muted)" }}>
                            <__Icon name="eye-off" width="20" height="20" strokeWidth="1.75" />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Hidden by rules</p>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>this week</span>
                        </div>
                      </div>
                    </div>
                    {v.post.full ? (<>
                    <div style={{ display: "flex", gap: "16px", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <span style={{ width: "88px", height: "88px", flex: "none", borderRadius: "var(--radius-xl)", background: "rgba(240,0,185,.08)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)" }}>POST</span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#1e293b" }}>Twelve new Jamdani and cotton sarees, woven in Narayanganj. Free delivery inside Dhaka until Friday. Sizes and prices in the comments.</p>
                        <span style={{ display: "flex", flexWrap: "wrap", gap: "12px 26px", marginTop: "12px" }}>
                          <span>
                            <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>2,140</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Reactions</p>
                          </span>
                          <span>
                            <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>84</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Comments</p>
                          </span>
                          <span>
                            <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>61</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Shares</p>
                          </span>
                          <span>
                            <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳86,400</p>
                            <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Attributed sales</p>
                          </span>
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#e9eef5", padding: "8px 12px" }}>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>3 selected</span>
                      <button className="dc-h188" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#fff", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="zap" strokeWidth="1.75" width="14" height="14" />Saved reply</button>
                      <button className="dc-h189" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#fff", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />Hide</button>
                      <button className="dc-h190" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#fff", color: "#c23a12", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="trash-2" strokeWidth="1.75" width="14" height="14" />Delete</button>
                      <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Auto-hide rules: phone numbers, competitor links</span>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", color: "#c1008f", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>TR</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 8px" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>@tanvir.rides</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,152,0,.12)", color: "#a15f00" }}>Question</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>18m ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "#1e293b" }}>Price koto vai? Ar Cumilla te COD ache ki?</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            <button className="dc-h191" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="corner-up-left" strokeWidth="1.75" width="14" height="14" />Reply publicly</button>
                            <button className="dc-h192" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="send" strokeWidth="1.75" width="14" height="14" />Move to DM</button>
                            <button className="dc-h193" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="shopping-bag" strokeWidth="1.75" width="14" height="14" />Create order</button>
                            <button className="dc-h194" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />Hide</button>
                          </div>
                          <div style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", border: "1px solid #cbd5e1", background: "#fff", padding: "10px 12px" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Replying publicly as GridCommerce · Shopno Fashion</p>
                            <textarea aria-label="Public reply to @tanvir.rides" rows="2" placeholder="Answer the question, then invite them to DM for size and stock…" style={{ width: "100%", boxSizing: "border-box", marginTop: "6px", border: "none", padding: "0", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none", outline: "none" }} />
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                              <button className="dc-h195" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Price + COD</button>
                              <button className="dc-h196" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Bangla version</button>
                              <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                                <button className="dc-h197" style={{ height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Reply and DM</button>
                                <button className="dc-h198" style={{ height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Post reply</button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>MA</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 8px" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Mahmuda Alam</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Answered</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>42m ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "#1e293b" }}>Ordered last week, parcel came in two days. Kapor quality onek valo.</p>
                          <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}><__Icon name="heart" strokeWidth="1.75" width="14" height="14" />Liked by page</span>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>·</span>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>2 replies</span>
                          </div>
                          <div style={{ marginTop: "12px", paddingLeft: "14px", borderLeft: "2px solid #e2e8f0", display: "grid", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>SF</span>
                              <span>
                                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                  <span style={{ fontWeight: "var(--weight-medium)" }}>Shopno Fashion</span>
                                  {" "}
                                  <span style={{ color: "var(--text-muted)" }}>· page reply · 38m ago</span>
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Dhonnobad Mahmuda apa. Eid collection ta o dekhte paren — free delivery Friday porjonto.</p>
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <span style={{ width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RS</span>
                              <span>
                                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                  <span style={{ fontWeight: "var(--weight-medium)" }}>@rumana.s</span>
                                  {" "}
                                  <span style={{ color: "var(--text-muted)" }}>· 21m ago</span>
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Ami o nite chai. Inbox e size chart ta diben?</p>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.12)", color: "#c23a12", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>AK</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 8px" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Arif Karim</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(255,87,36,.12)", color: "#c23a12" }}>Complaint</span>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Order GC-10190</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1h ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "#1e293b" }}>Refund ta ekhono paini. Ei niye 3 bar likhlam.</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            <button className="dc-h199" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="send" strokeWidth="1.75" width="14" height="14" />Move to DM and apologise</button>
                            <button className="dc-h200" onClick={v.openTicket} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="life-buoy" strokeWidth="1.75" width="14" height="14" />Create ticket</button>
                            <button className="dc-h201" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sticky-note" strokeWidth="1.75" width="14" height="14" />Add internal note</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px", opacity: ".75" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(105,122,155,.15)", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>SP</span>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 8px" }}>
                            <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>@shop_promo_bd</p>
                            <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Hidden by rule</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2h ago</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Cheaper saree available, call 017xxxxxxxx</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button className="dc-h202" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="eye" strokeWidth="1.75" width="14" height="14" />Unhide</button>
                            <button className="dc-h203" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#c23a12", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="ban" strokeWidth="1.75" width="14" height="14" />Block author</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    </>) : (<__EmptyState icon="message-square-dashed" title={"No sample comments for “" + v.post.title + "”"} body="This demo includes the comment thread for Eid collection drop only." actionLabel="Open Eid collection drop" onAction={v.pickPost("eid")} />)}
                  </div>
                </section>
              </>) : null}
              {v.showCrm ? (<>
                <aside className="gc-side ibx-side" aria-label="Details" style={{ width: "320px", flex: "none", background: "#fff", borderLeft: "1px solid #e2e8f0", padding: "20px 16px 28px" }}>
                  {v.isComments ? (<>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ position: "relative", flex: "none" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-full)", background: "rgba(30,41,59,.08)", color: "#1e293b", display: "grid", placeItems: "center", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>TR</span>
                        <span style={{ position: "absolute", bottom: "-2px", right: "-2px", display: "grid", borderRadius: "var(--radius-full)", border: "2px solid #fff", background: "#fff" }}><__ChannelIcon channel="tiktok" size={20} /></span>
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>@tanvir.rides</p>
                        <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>First comment · not a customer yet</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button className="dc-h204" style={{ flex: "1", height: "32px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Move to DM</button>
                      <button className="dc-h205" style={{ flex: "1", height: "32px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Add customer</button>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Sentiment this week</h2>
                    <span style={{ display: "flex", height: "8px", borderRadius: "var(--radius-full)", overflow: "hidden", background: "#e9eef5" }}>
                      <span style={{ width: "68%", background: "#10b981" }} />
                      <span style={{ width: "24%", background: "#697a9b" }} />
                      <span style={{ width: "8%", background: "#ff5724" }} />
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#475569" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Positive</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>68%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#475569" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#697a9b" }} />Neutral</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>24%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#475569" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#ff5724" }} />Negative</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>8%</span>
                    </div>
                    <h2 style={{ margin: "20px 0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>What people ask</h2>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Price</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>31</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "100%", height: "6px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Delivery and COD</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>24</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "77%", height: "6px", borderRadius: "var(--radius-full)", background: "#009cde" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Size and stock</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>18</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "58%", height: "6px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <span>Refund status</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>7</span>
                        </div>
                        <span style={{ display: "block", height: "6px", marginTop: "4px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                          <span style={{ display: "block", width: "23%", height: "6px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />
                        </span>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>By channel</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="tiktok" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>TikTok</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>27</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="instagram" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Instagram</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>9</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="facebook" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Facebook</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="linkedin" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>LinkedIn</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 8px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Auto-moderation</h2>
                      <a href="#" aria-label="Edit auto-moderation rules" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Edit</a>
                    </div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      {v.rules.map((r, i) => (
                        <button key={r.label} type="button" role="switch" aria-checked={r.on} className="mg-row" onClick={v.toggleRule(i)} style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "32px", padding: "0", fontSize: "var(--text-sm)", color: r.on ? "#1e293b" : "#475569" }}>
                          <span aria-hidden="true" style={{ width: "34px", height: "20px", flex: "none", borderRadius: "var(--radius-full)", background: r.on ? "#003087" : "#64748b", position: "relative" }}>
                            <span style={{ position: "absolute", top: "2px", left: r.on ? "16px" : "2px", width: "16px", height: "16px", borderRadius: "var(--radius-full)", background: "#fff" }} />
                          </span>
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Saved replies</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Price + COD (Bangla)</p>
                          <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Used 128 times</p>
                        </span>
                        <button className="dc-h206" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Use</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Check your inbox</p>
                          <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Used 74 times</p>
                        </span>
                        <button className="dc-h207" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Use</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Refund timeline</p>
                          <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Used 31 times</p>
                        </span>
                        <button className="dc-h208" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#334155", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Use</button>
                      </div>
                    </div>
                  </>) : null}
                  {v.isInbox && v.conv.full ? (<>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img src="/assets/9f66d32bb99031029a6fbcfd91e221f2.png" alt="Nusrat Jahan" style={{ width: "44px", height: "44px", flex: "none", borderRadius: "var(--radius-full)", objectFit: "cover", objectPosition: "52% 22%" }} />
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Nusrat Jahan<span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "#a15f00" }}><__Icon name="crown" strokeWidth="1.75" width="12" height="12" aria-hidden="true" />VIP</span><span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "#0f7a5a" }}>14 orders</span><span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.08)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "#003087" }}>৳68k LTV</span><span style={{ display: "inline-flex", alignItems: "center", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(14,165,233,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "#0272a8" }}>Repeat buyer</span></p>
                        <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Customer since Mar 2024</p>
                      </span>
                      <button className="dc-h209" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Edit customer">
                        <__Icon name="pencil" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(240,0,185,.1)", color: "#c1008f" }}>VIP</span>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Repeat</span>
                      <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#e9eef5", color: "#475569" }}>Dhaka metro</span>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "8px", marginTop: "16px" }}>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳84,600</p>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Lifetime value</p>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>14</p>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Orders</p>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳6,043</p>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Avg. order</p>
                      </div>
                      <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f5f9", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>1</p>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Returns</p>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Contact</h2>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="phone" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>+880 1712 345 678</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="mail" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>nusrat.jahan@gmail.com</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                        <span style={{ color: "var(--text-muted)", paddingTop: "2px" }}>
                          <__Icon name="map-pin" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span>House 14, Road 7, Dhanmondi<br />Dhaka 1205</span>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Linked channels</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="instagram" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@nusrat.wears</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Primary</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="whatsapp" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>+880 1712 345 678</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <__ChannelIcon channel="facebook" size={20} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>Nusrat Jahan</span>
                      </div>
                      <button className="dc-h210" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", height: "32px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Link another profile</button>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Recent orders</h2>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>GC-10482</p>
                          <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>4 Sep 2026 · ৳4,850</p>
                        </span>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(14,165,233,.12)", color: "#0272a8" }}>Shipped</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#003087" }}>GC-10344</p>
                          <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>18 Aug 2026 · ৳12,400</p>
                        </span>
                        <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "rgba(16,185,129,.1)", color: "#0f7a5a" }}>Delivered</span>
                      </div>
                    </div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Internal note</h2>
                    <textarea aria-label="Internal note about this customer" rows="3" placeholder="Anything the next agent should know…" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "10px 12px", fontSize: "var(--text-sm)", color: "#1e293b", resize: "none" }} defaultValue={"Prefers Bangla replies. Asked about bulk pricing for 20+ pieces — follow up before Eid."} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button className="dc-h211" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>New order</button>
                      <button className="dc-h212" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Full profile</button>
                    </div>
                  </>) : null}
                  {v.isInbox && !v.conv.full ? (<>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {avatar(v.conv, "44px")}
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", overflowWrap: "anywhere" }}>{v.conv.name}</p>
                        <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Not saved as a customer yet</p>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>{v.conv.tags.map(tag)}</div>
                    <h2 style={{ margin: "20px 0 8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Linked channels</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px 10px" }}>
                      <__ChannelIcon channel={v.conv.ch} size={20} />
                      <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>{CH_NAME[v.conv.ch]}</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Primary</span>
                    </div>
                    <p style={{ margin: "16px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Orders, lifetime value and notes appear here once this person is saved as a customer.</p>
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button className="dc-h211" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Add customer</button>
                      <button className="dc-h212" style={{ flex: "1", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#334155", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>New order</button>
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
