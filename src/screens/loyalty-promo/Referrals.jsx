'use client';
// Generated from design/templates/loyalty-promo/Referrals.dc.html by scripts/convert-design.mjs.
// Referrals — Loyalty, rewards & promo — Referrals.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var R = [
  { id: 1, name: 'Farzana Akter', phone: '01711-2X4-518', code: 'FARZANA10', joined: 24, bought: 19, sales: 86400, earned: 4320, due: 1120 },
  { id: 2, name: 'Rakibul Hasan', phone: '01819-0X7-332', code: 'RAKIB250', joined: 17, bought: 12, sales: 51250, earned: 2560, due: 640 },
  { id: 3, name: 'Nusrat Jahan', phone: '01552-3X1-907', code: 'NUSRAT22', joined: 11, bought: 9, sales: 32800, earned: 1640, due: 0 },
  { id: 4, name: 'Tanvir Ahmed', phone: '01914-6X2-045', code: 'TANVIR7', joined: 8, bought: 5, sales: 18900, earned: 945, due: 310 },
  { id: 5, name: 'Sharmin Sultana', phone: '01678-4X9-281', code: 'SHARMIN5', joined: 6, bought: 4, sales: 12450, earned: 620, due: 0 }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, kind = s.kind || 'points', paid = s.paid || {};
    var rv = kind === 'points' ? stepN(this, 'rvP', 100, 10, 10, 1000) : stepN(this, 'rvC', 5, 1, 1, 30);
    var rows = R.map(function (r, i) {
      var isPaid = !!paid[r.id], due = isPaid ? 0 : r.due;
      return { rank: i + 1, rankBg: i === 0 ? '#fff4e0' : '#eef2f6', rankFg: i === 0 ? '#a14f06' : '#475569', name: r.name, phone: r.phone, code: r.code, joined: r.joined, bought: r.bought, sales: bdt(r.sales), earned: bdt(r.earned), due: due ? bdt(due) : '—',
        canPay: due > 0, paid: isPaid,
        pay: function () { var p = assign({}, paid); p[r.id] = true; clearTimeout(self.t); self.setState({ paid: p, msg: bdt(r.due) + ' moved to ' + r.name + '’s wallet. They can spend it or cash out.' }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2600); } };
    });
    return {
      kinds: [{ k: 'points', label: 'Give points' }, { k: 'comm', label: 'Give % of sale (commission)' }].map(function (o) { var on = o.k === kind; return { label: o.label, on: on, bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ kind: o.k }); } }; }),
      rv: rv, ruleQ: kind === 'points' ? 'Both the customer and the friend get' : 'Customer gets this share of the friend’s first order', ruleUnit: kind === 'points' ? 'points each' : '%',
      friendGets: kind === 'points' ? rv.v + ' welcome points' : '5% off the first order',
      youGet: kind === 'points' ? rv.v + ' points (' + bdt(rv.v) + ')' : rv.v + '% of the order, in the wallet',
      rows: rows, hasMsg: !!s.msg, msg: s.msg || ''
    };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:12px;box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:8px;color:#475569;font-size:14px;font-weight:500;letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;color:#64748b;padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:8px;border:0;font:inherit;font-size:14px;font-weight:500;letter-spacing:.025em;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:15px}
.sm{height:36px;padding:0 12px;font-size:13px}
.ib{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.tab{height:40px;padding:0 14px;border-radius:999px;border:0;background:transparent;font:inherit;font-size:13px;font-weight:500;color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:13px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:14px;line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class ReferralsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Referrals">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1120px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="loy-referrals" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Loyalty & rewards"} page="Invite a friend" placeholder="Search customer by name or phone" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>214</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Customers sharing</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>have an invite code</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>386</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>New customers from invites</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>this year</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>৳4,82,300</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Sales from invites</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>this year</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#a14f06" }}>৳24,115</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Rewards given</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>points + commission</div>
                  </div>
                </div>
              </div>
              <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>How “Invite a friend” works</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Customers share their code. When the friend’s first order is delivered, the reward is given.</p>
                  </div>
                  <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }} role="radiogroup" aria-label="Reward type">
                    {__list(v.kinds).map((o, $index) => (<React.Fragment key={$index}>
                        <button type="button" role="radio" aria-checked={o?.on} onClick={o?.pick} style={__sx(`height: 36px; padding: 0 16px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; background: ${o?.bg ?? ""}; color: ${o?.fg ?? ""};`)}>{o?.label}</button>
                      </React.Fragment>))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  <div style={{ flex: "1 1 0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".06em", color: "#0089c3" }}>STEP 1</div>
                      <div style={{ fontSize: "15px", lineHeight: "22px", fontWeight: "600", color: "#0f172a" }}>Customer shares code</div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>From the app, website or SMS — e.g. RAKIB250</div>
                    </div>
                  </div>
                  <span style={{ color: "#cbd5e1", paddingTop: "12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <div style={{ flex: "1 1 0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".06em", color: "#0089c3" }}>STEP 2</div>
                      <div style={{ fontSize: "15px", lineHeight: "22px", fontWeight: "600", color: "#0f172a" }}>Friend buys for the first time</div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Friend enters the code and gets {v.friendGets}</div>
                    </div>
                  </div>
                  <span style={{ color: "#cbd5e1", paddingTop: "12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <div style={{ flex: "1 1 0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M12 8v13" />
                        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".06em", color: "#0089c3" }}>STEP 3</div>
                      <div style={{ fontSize: "15px", lineHeight: "22px", fontWeight: "600", color: "#0f172a" }}>Customer gets a reward</div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>{v.youGet} after delivery</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span style={{ flexGrow: "1", fontSize: "14px", fontWeight: "500" }}>{v.ruleQ}</span>
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                    <button type="button" className="ib" aria-label="Less reward" onClick={v.rv?.dec} style={{ borderRadius: "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{v.rv?.v}</span>
                    <button type="button" className="ib" aria-label="More reward" onClick={v.rv?.inc} style={{ borderRadius: "0" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                  </div>
                  <span style={{ minWidth: "60px", fontSize: "14px", color: "#334155" }}>{v.ruleUnit}</span>
                </div>
              </section>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Top sharers</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Customers who brought the most new buyers</p>
                  </div>
                </div>
                {v.hasMsg ? (<>
                  <div className="fade" role="status" style={{ margin: "14px 16px 0", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: "#e7f8f1", color: "#065f46", fontSize: "14px", fontWeight: "500" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>{v.msg}</span>
                  </div>
                </>) : null}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th">Customer</th>
                      <th className="th">Invite code</th>
                      <th className="th" style={{ textAlign: "right" }}>Friends joined</th>
                      <th className="th" style={{ textAlign: "right" }}>Friends’ sales</th>
                      <th className="th" style={{ textAlign: "right" }}>Earned</th>
                      <th className="th" style={{ textAlign: "right" }}>Not paid yet</th>
                      <th className="th" />
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row">
                          <td className="td">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={__sx(`width: 32px; height: 32px; flex-shrink: 0; border-radius: 999px; background: ${r?.rankBg ?? ""}; color: ${r?.rankFg ?? ""}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;`)}>{r?.rank}</span>
                              <div>
                                <div style={{ fontWeight: "500" }}>{r?.name}</div>
                                <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="td">
                            <span className="mono" style={{ padding: "4px 10px", borderRadius: "6px", border: "1px dashed #94a3b8", fontWeight: "600", color: "#003087" }}>{r?.code}</span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <b>{r?.joined}</b>
                            {" "}
                            <span style={{ color: "#64748b", fontSize: "12px" }}>({r?.bought} bought)</span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>{r?.sales}</td>
                          <td className="td" style={{ textAlign: "right", color: "#047857", fontWeight: "600" }}>{r?.earned}</td>
                          <td className="td" style={{ textAlign: "right", fontWeight: "700" }}>{r?.due}</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            {r?.canPay ? (<>
                              <button type="button" className="btn soft sm" onClick={r?.pay}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                                </svg>
                                <span>Move to wallet</span>
                              </button>
                            </>) : null}
                            {r?.paid ? (<>
                              <span className="badge b-received">Paid</span>
                            </>) : null}
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
