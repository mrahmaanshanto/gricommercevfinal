'use client';
// Generated from design/templates/loyalty-promo/FlashSales.dc.html by scripts/convert-design.mjs.
// FlashSales — Loyalty, rewards & promo — Flash sales.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { clockNow } from '@/lib/settlements';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
// Demo dates follow today (clockNow): two sales are running now, two start later; the ended ones stay as they were.
var DAY = 864e5;
function dayAt(n, h, m) { var d = new Date(clockNow() + n * DAY); d.setHours(h, m || 0, 0, 0); return d; }
function dm(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()]; }
function hm(d) { var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM'); }
function span(a, b, time) { return time ? dm(a) + ', ' + hm(a) + ' – ' + (dm(a) === dm(b) ? '' : dm(b) + ', ') + hm(b) : dm(a) + ' – ' + dm(b); }
function p2(n) { return (n < 10 ? '0' : '') + n; }
function countdown(end) { var t = Math.max(0, Math.floor((end - clockNow()) / 1000)), d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60), sec = t % 60; return (d ? d + 'd ' : '') + p2(h) + ':' + p2(m) + ':' + p2(sec); }
function startsIn(start) { var t = Math.max(0, start - clockNow()), d = Math.floor(t / DAY), h = Math.floor(t % DAY / 36e5); return d >= 7 ? 'Starts in ' + d + ' days' : 'Starts in ' + (d ? d + 'd ' : '') + h + 'h'; }
function salesNow() {
  var hr = new Date(clockNow()); hr.setMinutes(0, 0, 0);
  var megaA = dayAt(-1, 18), megaB = dayAt(2, 23, 59), nightA = new Date(hr.getTime() - 2 * 36e5), nightB = new Date(nightA.getTime() + 6 * 36e5);
  var skinA = dayAt(3, 10), skinB = dayAt(9, 23, 59), pujaA = dayAt(19, 0), pujaB = dayAt(24, 23, 59);
  return [
  { name: 'Weekend Mega Sale', sub: '12 products · up to 40% off', dates: span(megaA, megaB, true), left: countdown(megaB), sold: 184, stock: 300, sales: 142300, st: 'live', featured: true, bg: 'linear-gradient(135deg, #b83210, #f59e0b)' },
  { name: 'Night Deals', sub: '6 products · 25% off', dates: span(nightA, nightB, true), left: countdown(nightB), sold: 38, stock: 120, sales: 44600, st: 'live', featured: false, bg: 'linear-gradient(135deg, #012169, #0a5bd0)' },
  { name: 'Skin care week', sub: '8 products · 25% off', dates: span(skinA, skinB), left: startsIn(skinA), sold: 0, stock: 200, sales: 0, st: 'soon', featured: true, bg: 'linear-gradient(135deg, #047857, #10b981)' },
  { name: 'Puja Special', sub: '15 products · up to 30% off', dates: span(pujaA, pujaB), left: startsIn(pujaA), sold: 0, stock: 450, sales: 0, st: 'soon', featured: false, bg: 'linear-gradient(135deg, #7c2d12, #db2777)' }
  ].concat(ENDED);
}
var ENDED = [
  { name: 'Month-end Clearance', sub: '20 products · up to 50% off', dates: '28 Aug – 31 Aug', left: 'Ended', sold: 402, stock: 450, sales: 198400, st: 'ended', featured: false, bg: 'linear-gradient(135deg, #334155, #64748b)' },
  { name: 'Independence Day Deals', sub: '10 products · 16% off', dates: '15 Aug – 17 Aug', left: 'Ended', sold: 215, stock: 250, sales: 87100, st: 'ended', featured: false, bg: 'linear-gradient(135deg, #065f46, #b83210)' }
];
var TABS = [{ k: 'live', label: 'Running' }, { k: 'soon', label: 'Coming soon' }, { k: 'ended', label: 'Ended' }];
var SN = { live: ['Running', 'badge b-live'], soon: ['Coming soon', 'badge b-sched'], ended: ['Ended', 'badge b-ended'] };
class Component extends DCLogic {
  renderVals() {
    var s = this.state || {}, tab = s.tab || 'live', F = salesNow();
    var cnt = {}; TABS.forEach(function (t) { cnt[t.k] = F.filter(function (f) { return f.st === t.k; }).length; });
    return { tabs: mkTabs(this, TABS, tab, 'tab', cnt),
      cards: F.filter(function (f) { return f.st === tab; }).map(function (f) { var p = Math.round(f.sold / f.stock * 100); return { name: f.name, sub: f.sub, dates: f.dates, left: f.left, tColor: f.st === 'live' ? '#b83210' : f.st === 'soon' ? '#075985' : '#64748b', sold: f.sold + ' of ' + f.stock + ' pieces sold', pct: p + '%', pctLabel: p + '%', sales: f.sales ? bdt(f.sales) : '—', status: SN[f.st][0], sCls: SN[f.st][1], featured: f.featured, bg: f.bg }; }) };
  }
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
/* phones: the intro takes the full width with the button under it; the status tabs stay on one scrolling row */
@media (max-width:640px){
  .fs-intro{flex-direction:column;align-items:stretch!important}
  .fs-tabs{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none}
  .fs-tabs::-webkit-scrollbar{display:none}
  .fs-tabs>.tab{flex:none}
}
`;

// ---- markup ----

export default class FlashSalesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlashSales">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="promo-flash" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Promo" page="Flash sales" placeholder="Search a sale" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Flash sales" />
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#047857" }}>৳1,86,900</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Flash sale sales</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>this month</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#003087" }}>612</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Pieces sold</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>in flash sales this month</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Denim Jeans</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Best seller</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>96 sold in Weekend Mega Sale</div>
                  </div>
                </div>
              </div>
              <div className="fs-intro" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}></div>
                <__Link href="/new-flash-sale" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                  </svg>
                  <span>Start a flash sale</span>
                </__Link>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div className="fs-tabs" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: var(--radius-full); background: ${tb?.countBg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                <div className="gc-cols-3" style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {__list(v.cards).map((c, $index) => (<React.Fragment key={$index}>
                      <article className="fade" style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" }}>
                        <div style={__sx(`height: 112px; background: ${c?.bg ?? ""}; color: #fff; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; position: relative;`)}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className={c?.sCls} style={{ background: "rgba(255,255,255,.92)" }}>{c?.status}</span>
                            {c?.featured ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.2)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
</svg> Home page</span>
                            </>) : null}
                          </div>
                          <div>
                            <div style={{ fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)" }}>{c?.name}</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", opacity: ".9" }}>{c?.sub}</div>
                          </div>
                        </div>
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect width="18" height="18" x="3" y="4" rx="2" />
                              <path d="M16 2v4" />
                              <path d="M8 2v4" />
                              <path d="M3 10h18" />
                            </svg>
                            <span suppressHydrationWarning>{c?.dates}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={__sx(`color: ${c?.tColor ?? ""};`)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                            </span>
                            <span suppressHydrationWarning className="mono" style={__sx(`font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${c?.tColor ?? ""};`)}>{c?.left}</span>
                          </div>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                              <span style={{ color: "#475569" }}>{c?.sold}</span>
                              <span style={{ fontWeight: "var(--weight-medium)" }}>{c?.pctLabel}</span>
                            </div>
                            <div style={{ height: "8px", marginTop: "6px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                              <div style={__sx(`width: ${c?.pct ?? ""}; height: 100%; border-radius: var(--radius-full); background: #f59e0b;`)} />
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #eef2f6", paddingTop: "12px" }}>
                            <div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sales</div>
                              <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{c?.sales}</div>
                            </div>
                            <__Link href="/new-flash-sale" className="btn soft sm">Open <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></__Link>
                          </div>
                        </div>
                      </article>
                    </React.Fragment>))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
