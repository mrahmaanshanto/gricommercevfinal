'use client';
// Generated from design/templates/loyalty-promo/Promo.dc.html by scripts/convert-design.mjs.
// Promo — Loyalty, rewards & promo — Promo.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var B = [
  { name: 'EID300 — ৳300 off', k: 'coupon', from: 5, to: 20, st: 'live' },
  { name: 'Weekend Mega Sale', k: 'flash', from: 18, to: 20, st: 'live' },
  { name: 'FIRST20 — 20% off', k: 'coupon', from: 1, to: 30, st: 'live' },
  { name: 'Free delivery ৳1,500+', k: 'coupon', from: 8, to: 14, st: 'ended' },
  { name: 'Skin care week', k: 'flash', from: 22, to: 28, st: 'soon' },
  { name: 'PUJA10 — 10% off', k: 'coupon', from: 25, to: 29, st: 'soon' }
];
var L = [
  { id: 1, name: 'Weekend Mega Sale', sub: '12 products, up to 40% off', type: 'Flash sale', left: '2 days 06:14:22', used: '184 sold', sales: 142300, st: 'live' },
  { id: 2, name: 'EID300', sub: '৳300 off on ৳2,000+', type: 'Coupon', left: '2 days', used: '318', sales: 96400, st: 'live' },
  { id: 3, name: 'FIRST20', sub: '20% off first order, max ৳400', type: 'Coupon', left: '12 days', used: '140', sales: 73700, st: 'live' },
  { id: 4, name: 'Skin care week', sub: '8 products, 25% off', type: 'Flash sale', left: 'Starts 22 Sep', used: '—', sales: 0, st: 'soon' },
  { id: 5, name: 'PUJA10', sub: '10% off, up to ৳250', type: 'Coupon', left: 'Starts 25 Sep', used: '—', sales: 0, st: 'soon' }
];
var COL = { live: '#10b981', soon: '#0ea5e9', ended: '#94a3b8' };
var ST_LABEL = { live: 'Running', soon: 'Coming soon', ended: 'Ended' };
var FG = { coupon: '#003087', flash: '#a14f06', msg: '#047857' };
var COLORS = [{ k: '#003087', label: 'Navy' }, { k: '#b83210', label: 'Red' }, { k: '#047857', label: 'Green' }, { k: '#0f172a', label: 'Black' }];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {}, paused = s.paused || {};
    var stripSw = mkSw(this, 'strip', true), clr = s.clr || '#b83210';
    return {
      bars: B.map(function (b) { return { name: b.name, dates: b.from === b.to ? b.from + ' Sep' : b.from + '–' + b.to + ' Sep', stLabel: ST_LABEL[b.st], fg: FG[b.k], isCoupon: b.k === 'coupon', isFlash: b.k === 'flash', isMsg: b.k === 'msg', col: (b.from + 1) + ' / ' + (b.to + 2), bg: COL[b.st], label: b.from === b.to ? '' : (b.from + '–' + b.to + ' Sep') }; }),
      live: L.map(function (r) {
        var p = !!paused[r.id], soon = r.st === 'soon';
        return { name: r.name, sub: r.sub, type: r.type, left: p ? 'Paused' : r.left, tColor: p ? '#a14f06' : (soon ? '#075985' : '#b83210'), used: r.used, sales: r.sales ? bdt(r.sales) : '—',
          status: p ? 'Paused' : soon ? 'Coming soon' : 'Running', sCls: p ? 'badge b-paused' : soon ? 'badge b-sched' : 'badge b-live',
          running: !p, stopped: p, btn: p ? 'Start again' : 'Pause',
          toggle: function () { var q = assign({}, paused); q[r.id] = !p; self.setState({ paused: q }); } };
      }),
      stripSw: stripSw, stripOn: stripSw.on, stripBg: clr,
      stripText: s.text != null ? s.text : 'উইকেন্ড মেগা সেল — ৪০% পর্যন্ত ছাড়! কোড: EID300',
      typeStrip: function (e) { self.setState({ text: e.target.value }); },
      colors: COLORS.map(function (c) { var on = c.k === clr; return { label: c.label, on: on, bg: c.k, ring: on ? '#93c5fd' : '#ffffff', pick: function () { self.setState({ clr: c.k }); } }; })
    };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// offer-type icon for the phone list (same drawings as the timeline rows)
function barIcon(b) {
  if (b.isFlash) return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>);
  if (b.isMsg) return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg>);
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M9 9h.01" /><path d="m15 9-6 6" /><path d="M15 15h.01" /></svg>);
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
/* "This month at a glance": the day timeline on wide screens, a plain list of offers on phones */
.pr-glist{display:none;margin:0;padding:0;list-style:none}
.pr-glist__item{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2-5) 0;border-bottom:1px solid #f1f5f9}
.pr-glist__item:last-child{border-bottom:0}
.pr-glist__ic{display:inline-flex;flex:none}
.pr-glist__main{display:flex;flex-direction:column;min-width:0}
.pr-glist__name{font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium);color:#0f172a}
.pr-glist__meta{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);line-height:16px;color:#475569}
.pr-glist__dot{flex:none;width:8px;height:8px;border-radius:var(--radius-full)}
@media (max-width:1023px){
  .pr-acts{flex-wrap:wrap}
  .pr-acts>*{flex:1 1 calc(50% - 8px)!important;min-width:0}
}
@media (max-width:640px){
  /* action cards: full width, icon beside the text */
  .pr-acts{flex-direction:column;gap:var(--space-2)!important}
  .pr-acts>*{flex:none!important;display:grid!important;grid-template-columns:auto minmax(0,1fr);gap:2px var(--space-3)!important;align-items:center;padding:var(--space-3) var(--space-4)!important}
  .pr-acts>*>span:first-child{grid-row:1/4;width:44px!important;height:44px!important;align-self:start}
  .pr-acts>*>div{grid-column:2;margin-top:0!important}
  .pr-glance{padding:var(--space-4)!important;gap:var(--space-3)!important}
  .pr-ghead{flex-wrap:wrap;gap:var(--space-2) var(--space-3)!important}
  .pr-ghead>div:first-child{flex:1 1 100%!important}
  .pr-gantt{display:none}
  .pr-glist{display:block}
}
`;

// ---- markup ----

export default class PromoScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Promo">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="promo-home" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Promo" page={"Offers & promo"} placeholder="Search customer by name or phone" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title={"Offers & promo"} />
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                      <path d="M16 17h6v-6" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#047857" }}>৳3,12,400</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Sales from offers</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>this month</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 5 5 19" />
                      <circle cx="6.5" cy="6.5" r="2.5" />
                      <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>৳28,950</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Discount given</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>9.3% of offer sales</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M9 9h.01" />
                      <path d="m15 9-6 6" />
                      <path d="M15 15h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#003087" }}>642</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Codes used</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>by 511 customers</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>4</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Running now</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>2 more coming soon</div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <div>
                    <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>What do you want to do?</h2>
                  </div>
                </div>
                <div className="pr-acts" style={{ display: "flex", gap: "16px" }}>
                  <__Link href="/new-coupon" className="card actc" style={{ flex: "1 1 0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", textDecoration: "none", color: "#0f172a" }}>
                    <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M9 9h.01" />
                        <path d="m15 9-6 6" />
                        <path d="M15 15h.01" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)" }}>Give a discount code</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Like EID300 or FIRST20. Works online and at the POS.</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Start <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></div>
                  </__Link>
                  <__Link href="/new-flash-sale" className="card actc" style={{ flex: "1 1 0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", textDecoration: "none", color: "#0f172a" }}>
                    <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)" }}>Start a flash sale</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Low price on some products for a short time, with a countdown.</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Start <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></div>
                  </__Link>
                  <__Link href="/offers" className="card actc" style={{ flex: "1 1 0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", textDecoration: "none", color: "#0f172a" }}>
                    <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)" }}>See your Offers page</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Every running offer shows here for customers, with a day counter.</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Open <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></div>
                  </__Link>
                  <a href="#strip" className="card actc" style={{ flex: "1 1 0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", textDecoration: "none", color: "#0f172a" }}>
                    <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#fde7f1", color: "#b0145a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m3 11 18-5v12L3 14v-3z" />
                        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)" }}>Show a top banner</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>A thin line on top of your website and app.</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Start <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></div>
                  </a>
                </div>
              </div>
              <section className="card pr-glance" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="pr-ghead" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flexGrow: "1" }}>
                    <div>
                      <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>This month at a glance</h2>
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#10b981" }} />Running</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#0ea5e9" }} />Coming soon</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#94a3b8" }} />Ended</span>
                </div>
                <ul className="pr-glist" aria-label="Offers this month">
                  {__list(v.bars).map((b, $index) => (
                    <li key={$index} className="pr-glist__item">
                      <span className="pr-glist__ic" style={{ color: b?.fg }}>{barIcon(b)}</span>
                      <span className="pr-glist__main">
                        <span className="pr-glist__name">{b?.name}</span>
                        <span className="pr-glist__meta"><i className="pr-glist__dot" style={{ background: b?.bg }} aria-hidden="true" />{b?.stLabel} · {b?.dates}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="pr-gantt" style={{ position: "relative" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "220px repeat(30, 1fr)", fontSize: "var(--text-xs)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
                    <span>September 2026</span>
                    <span style={{ textAlign: "center" }}>1</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>4</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>7</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>10</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>13</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>16</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>19</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>22</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>25</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }}>28</span>
                    <span style={{ textAlign: "center" }} />
                    <span style={{ textAlign: "center" }} />
                  </div>
                  {__list(v.bars).map((b, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "grid", gridTemplateColumns: "220px repeat(30, 1fr)", alignItems: "center", height: "46px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                          <span style={__sx(`color: ${b?.fg ?? ""};`)}>
                            {b?.isCoupon ? (<>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                <path d="M9 9h.01" />
                                <path d="m15 9-6 6" />
                                <path d="M15 15h.01" />
                              </svg>
                            </>) : null}
                            {b?.isFlash ? (<>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                              </svg>
                            </>) : null}
                            {b?.isMsg ? (<>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                              </svg>
                            </>) : null}
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b?.name}</span>
                        </div>
                        <div style={__sx(`grid-column: ${b?.col ?? ""}; height: 26px; border-radius: var(--radius-md); background: ${b?.bg ?? ""}; color: #ffffff; font-size: var(--text-xs); font-weight: var(--weight-medium); display: flex; align-items: center; padding: 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 26px;`)} title={b?.label}>{b?.label}</div>
                      </div>
                    </React.Fragment>))}
                  <div style={{ position: "absolute", top: "0", bottom: "0", left: "calc(220px + (100% - 220px) * 17 / 30)", width: "2px", background: "#b83210" }}>
                    <span style={{ position: "absolute", top: "-2px", left: "-18px", padding: "1px 6px", borderRadius: "var(--radius-sm)", background: "#b83210", color: "#fff", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>Today</span>
                  </div>
                </div>
              </section>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Running and coming soon</h2>
                  </div>
                </div>
                <div className="gc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th">Offer</th>
                        <th className="th">Type</th>
                        <th className="th">Time left</th>
                        <th className="th" style={{ textAlign: "right" }}>Used</th>
                        <th className="th" style={{ textAlign: "right" }}>Sales</th>
                        <th className="th">Status</th>
                        <th className="th" />
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.live).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td className="td">
                              <div style={{ fontWeight: "var(--weight-medium)" }}>{r?.name}</div>
                              <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.sub}</div>
                            </td>
                            <td className="td">{r?.type}</td>
                            <td className="td">
                              <span style={__sx(`font-weight: var(--weight-medium); color: ${r?.tColor ?? ""};`)}>{r?.left}</span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>{r?.used}</td>
                            <td className="td" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>{r?.sales}</td>
                            <td className="td">
                              <span className={r?.sCls}>{r?.status}</span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <button type="button" className="btn line sm" onClick={r?.toggle}>
                                {r?.running ? (<>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                  </svg>
                                </>) : null}
                                {r?.stopped ? (<>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polygon points="6 3 20 12 6 21 6 3" />
                                  </svg>
                                </>) : null}
                                <span>{r?.btn}</span>
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section id="strip" className="card" style={{ padding: "24px", display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 280px", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Top banner</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>A thin line shown on top of your website and app</p>
                      </div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.stripSw?.on} aria-label="Show top banner" className={v.stripSw?.cls} onClick={v.stripSw?.toggle} />
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Message</span>
                    <input className="inp bn" value={v.stripText} onInput={v.typeStrip} onChange={v.typeStrip} aria-label="Banner message" />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Short is best — about 50 letters.</span>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">When someone taps it, open</span>
                    <select className="inp">
                      <option>Flash sale — Weekend Mega Sale</option>
                      <option>Coupon page</option>
                      <option>All products</option>
                    </select>
                  </label>
                  <div className="lbl">Colour</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {__list(v.colors).map((c, $index) => (<React.Fragment key={$index}>
                        <button type="button" aria-label={c?.label} aria-pressed={c?.on} onClick={c?.pick} style={__sx(`width: 40px; height: 40px; border-radius: var(--radius-full); border: 3px solid ${c?.ring ?? ""}; background: ${c?.bg ?? ""}; cursor: pointer;`)} />
                      </React.Fragment>))}
                  </div>
                </div>
                <div style={{ width: "300px", maxWidth: "100%", flexShrink: "1", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <div className="lbl" style={{ alignSelf: "flex-start" }}>Preview on phone</div>
                  <div style={{ width: "280px", maxWidth: "100%", boxSizing: "border-box", height: "300px", borderRadius: "28px 28px 0 0", border: "8px solid #0f172a", borderBottom: "0", overflow: "hidden", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "22px", background: "#0f172a" }} />
                    {v.stripOn ? (<>
                      <div className="fade bn" style={__sx(`padding: 8px 12px; background: ${v.stripBg ?? ""}; color: #ffffff; font-size: var(--text-xs); line-height: 16px; font-weight: var(--weight-medium); text-align: center; white-space: normal; overflow-wrap: anywhere;`)}>{v.stripText}</div>
                    </>) : null}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                      <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="GridCommerce" style={{ height: "18px", objectFit: "contain" }} />
                      <span style={{ color: "#475569" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </span>
                    </div>
                    <div className="gc-cols-2" style={{ padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ height: "96px", borderRadius: "var(--radius-lg)", background: "#e2e8f0" }} />
                      <div style={{ height: "96px", borderRadius: "var(--radius-lg)", background: "#e2e8f0" }} />
                      <div style={{ height: "96px", borderRadius: "var(--radius-lg)", background: "#e2e8f0" }} />
                      <div style={{ height: "96px", borderRadius: "var(--radius-lg)", background: "#e2e8f0" }} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
