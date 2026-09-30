'use client';
// Generated from design/templates/loyalty-promo/Coupons.dc.html by scripts/convert-design.mjs.
// Coupons — Loyalty, rewards & promo — Coupons.
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
var C = [
  { id: 1, code: 'EID300', gets: '৳300 off', rule: 'On bills of ৳2,000 or more', where: 'Website + POS', who: 'Everyone', dates: '5 – 20 Sep', left: '2 days left', used: 318, limit: 500, sales: 96400, st: 'live', on: true },
  { id: 2, code: 'FIRST20', gets: '20% off', rule: 'Up to ৳400 off', where: 'Website', who: 'First order only', dates: '1 – 30 Sep', left: '12 days left', used: 140, limit: 0, sales: 73700, st: 'live', on: true },
  { id: 3, code: 'SKIN15', gets: '15% off', rule: 'Skin care products only', where: 'Website + POS', who: 'Everyone', dates: '10 – 25 Sep', left: '7 days left', used: 96, limit: 300, sales: 31200, st: 'live', on: true },
  { id: 4, code: 'GOLD500', gets: '৳500 off', rule: 'On bills of ৳5,000 or more', where: 'Website + POS', who: 'Gold and Platinum members', dates: '1 – 30 Sep', left: '12 days left', used: 22, limit: 150, sales: 13500, st: 'live', on: true },
  { id: 5, code: 'PUJA10', gets: '10% off', rule: 'Up to ৳250 off', where: 'Website + POS', who: 'Everyone', dates: '25 Sep – 5 Oct', left: 'Starts in 7 days', used: 0, limit: 1000, sales: 0, st: 'soon', on: true },
  { id: 6, code: 'FREESHIP', gets: 'Free delivery', rule: 'On bills of ৳1,500 or more', where: 'Website', who: 'Everyone', dates: '8 – 14 Sep', left: 'Ended', used: 211, limit: 0, sales: 58900, st: 'ended', on: false },
  { id: 7, code: 'SORRY100', gets: '৳100 off', rule: 'Any bill', where: 'Website + POS', who: 'One customer per code', dates: 'No end date', left: 'Always on', used: 4, limit: 20, sales: 5200, st: 'off', on: false }
];
var TABS = [{ k: 'live', label: 'Running' }, { k: 'soon', label: 'Coming soon' }, { k: 'ended', label: 'Ended' }, { k: 'off', label: 'Turned off' }];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'live', sw = s.sw || {};
    var isOn = function (c) { return sw[c.id] == null ? c.on : sw[c.id]; };
    var flash = function (m) { clearTimeout(self.t); self.setState({ msg: m }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2400); };
    var rows = C.filter(function (c) { return c.st === tab; }).map(function (c) {
      var on = isOn(c), pct = c.limit ? Math.round(c.used / c.limit * 100) : Math.min(100, Math.round(c.used / 3));
      return { code: c.code, gets: c.gets, rule: c.rule, where: c.where, who: c.who, dates: c.dates, left: c.left, leftColor: /2 days|Ended/.test(c.left) ? '#b83210' : '#64748b',
        used: c.limit ? c.used + ' of ' + c.limit : c.used + ' times', pct: pct + '%', sales: c.sales ? bdt(c.sales) : '—', on: on, swCls: on ? 'sw on' : 'sw',
        copy: function () { flash(c.code + ' copied. Paste it in your Facebook post or SMS.'); },
        toggle: function () { var q = assign({}, sw); q[c.id] = !on; self.setState({ sw: q }); flash(c.code + (on ? ' turned off. Customers can’t use it now.' : ' turned on.')); } };
    });
    var cnt = {}; TABS.forEach(function (t) { cnt[t.k] = C.filter(function (c) { return c.st === t.k; }).length; });
    return { tabs: mkTabs(this, TABS, tab, 'tab', cnt), rows: rows, empty: !rows.length, nLive: cnt.live, hasMsg: !!s.msg, msg: s.msg || '' };
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

export default class CouponsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Coupons">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1000px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="promo-coupons" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Promo" page="Discount codes" placeholder="Search a code" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M9 9h.01" />
                      <path d="m15 9-6 6" />
                      <path d="M15 15h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>{v.nLive}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Codes running</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>right now</div>
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
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>642</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Used this month</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>times</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>৳2,14,800</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Sales with codes</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>this month</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 5 5 19" />
                      <circle cx="6.5" cy="6.5" r="2.5" />
                      <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#a14f06" }}>৳19,420</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Discount given</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>this month</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>A discount code gives money off when the customer types it on your website or tells it at the counter.</div>
                <__Link href="/new-coupon" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Make a new code</span>
                </__Link>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: ${tb?.countBg ?? ""}; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
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
                      <th className="th">Code</th>
                      <th className="th">Customer gets</th>
                      <th className="th">Where</th>
                      <th className="th">Dates</th>
                      <th className="th">Used</th>
                      <th className="th" style={{ textAlign: "right" }}>Sales</th>
                      <th className="th">On / off</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row">
                          <td className="td">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span className="mono" style={{ padding: "5px 10px", borderRadius: "6px", border: "1.5px dashed #003087", background: "#f2f6fc", fontWeight: "700", color: "#003087" }}>{r?.code}</span>
                              <button type="button" className="ib" aria-label={`Copy code ${r?.code ?? ""}`} onClick={r?.copy} style={{ width: "32px", height: "32px" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect width="14" height="14" x="8" y="8" rx="2" />
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="td">
                            <div style={{ fontWeight: "600" }}>{r?.gets}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.rule}</div>
                          </td>
                          <td className="td">
                            <div>{r?.where}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.who}</div>
                          </td>
                          <td className="td" style={{ whiteSpace: "nowrap" }}>
                            <div>{r?.dates}</div>
                            <div style={__sx(`font-size: 12px; line-height: 16px; color: ${r?.leftColor ?? ""};`)}>{r?.left}</div>
                          </td>
                          <td className="td" style={{ minWidth: "140px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "500" }}>{r?.used}</div>
                            <div style={{ height: "6px", marginTop: "6px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                              <div style={__sx(`width: ${r?.pct ?? ""}; height: 100%; border-radius: 999px; background: #0a5bd0;`)} />
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right", fontWeight: "600" }}>{r?.sales}</td>
                          <td className="td">
                            <button type="button" role="switch" aria-checked={r?.on} aria-label={`Turn ${r?.code ?? ""} on or off`} className={r?.swCls} onClick={r?.toggle} />
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.empty ? (<>
                  <div style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>No codes here.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
