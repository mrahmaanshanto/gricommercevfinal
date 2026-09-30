'use client';
// Generated from design/templates/recovery/AbandonedCarts.dc.html by scripts/convert-design.mjs.
// AbandonedCarts — Abandoned carts — contact list with Call, WhatsApp and SMS, plus one auto-reminder switch.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return '৳' + s; }
var CARTS = [
  { id: 1, name: 'Nusrat Jahan', phone: '01552-3X1-907', items: 'Sunscreen SPF 50 · 50ml', more: '+ 2 more items', v: 3240, ago: '35 min ago', last: null },
  { id: 2, name: 'Guest', phone: '01716-4X8-220', items: 'Denim Jeans · Blue · 32', more: '+ 1 more item', v: 2180, ago: '2 hours ago', last: 'Auto SMS · 1 hr ago' },
  { id: 3, name: 'Rafiq Uddin', phone: '01911-7X3-608', items: 'Gaming Laptop RTX Edition', more: '1 item', v: 124500, ago: '3 hours ago', last: null },
  { id: 4, name: 'Sabrina Chowdhury', phone: '01511-5X3-770', items: 'Men’s Polo Shirt · Navy · M', more: '+ 3 more items', v: 5860, ago: '5 hours ago', last: 'WhatsApp by Rupa · 3 hr ago' },
  { id: 5, name: 'Tanvir Ahmed', phone: '01914-6X2-045', items: 'Rice Water Cleanser 150ml', more: '1 item', v: 1540, ago: 'Yesterday', last: 'Called by Shanto', won: true },
  { id: 6, name: 'Guest', phone: '01822-1X5-947', items: '5G Smartphone 128GB', more: '1 item', v: 32990, ago: 'Yesterday', last: 'Auto SMS · yesterday' },
  { id: 7, name: 'Mahmudul Islam', phone: '01733-8X0-614', items: 'Premium Miniket Rice 5kg', more: '+ 4 more items', v: 1320, ago: '2 days ago', last: null },
  { id: 8, name: 'Farzana Akter', phone: '01711-2X4-518', items: 'Aloe Vera Soothing Gel 300ml', more: '+ 1 more item', v: 1890, ago: '2 days ago', last: 'Auto SMS · 2 days ago', won: true }
];
var CHIPS = [{ k: 'all', label: 'All' }, { k: 'new', label: 'Not contacted' }, { k: 'done', label: 'Contacted' }, { k: 'won', label: 'Ordered' }];
var VERB = { call: 'Called', wa: 'WhatsApp', sms: 'SMS' };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, f = s.f || 'all', act = s.act || {};
    var autoOn = s.auto != null ? s.auto : true;
    var lastOf = function (c) { return act[c.id] ? VERB[act[c.id]] + ' by you · just now' : c.last; };
    var stOf = function (c) { return c.won ? 'won' : (lastOf(c) ? 'done' : 'new'); };
    var doAct = function (c, k) {
      var a = {}; for (var x in act) a[x] = act[x]; a[c.id] = k;
      var m = k === 'call' ? 'Calling ' + c.phone + ' … logged as called.' : k === 'wa' ? 'WhatsApp opened for ' + c.phone + ' with the cart link filled in.' : 'SMS sent to ' + c.phone + ' with a link that brings the cart back.';
      clearTimeout(self.t); self.setState({ act: a, msg: m }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800);
    };
    var list = CARTS.filter(function (c) { return f === 'all' || stOf(c) === f; });
    var rows = list.map(function (c) {
      var guest = c.name === 'Guest', l = lastOf(c);
      return { name: c.name, phone: c.phone, initial: guest ? '?' : c.name.charAt(0), avBg: guest ? '#eef2f6' : '#e0f3fb', avFg: guest ? '#64748b' : '#003087',
        items: c.items, more: c.more, value: bdt(c.v), ago: c.ago,
        last: l || 'Not contacted', lastCls: l ? 'badge b-approved' : 'badge b-draft',
        open: !c.won, won: !!c.won,
        callLabel: 'Call ' + c.name, waLabel: 'WhatsApp ' + c.name, smsLabel: 'SMS ' + c.name,
        call: function () { doAct(c, 'call'); }, wa: function () { doAct(c, 'wa'); }, sms: function () { doAct(c, 'sms'); } };
    });
    var cnt = { all: CARTS.length }; CARTS.forEach(function (c) { var k = stOf(c); cnt[k] = (cnt[k] || 0) + 1; });
    var chips = CHIPS.map(function (x) { var on = x.k === f; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', count: String(cnt[x.k] || 0), pick: function () { self.setState({ f: x.k }); } }; });
    var waiting = CARTS.filter(function (c) { return !c.won; }).reduce(function (a, c) { return a + c.v; }, 0);
    return {
      kLeft: String(CARTS.length), kWaiting: bdt(waiting), kBack: String(CARTS.filter(function (c) { return c.won; }).length),
      autoOn: autoOn, autoCls: autoOn ? 'sw on' : 'sw',
      autoNote: autoOn ? 'On — one SMS goes out 1 hour after a customer leaves, with a link back to their cart.' : 'Off — no reminder is sent. Contact customers from the list below.',
      toggleAuto: function () { self.setState({ auto: !autoOn }); },
      chips: chips, rows: rows, empty: !rows.length,
      hasMsg: !!s.msg, msg: s.msg || ''
    };
  }
}

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

export default class AbandonedCartsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AbandonedCarts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1400px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="orders-carts" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Orders" page="Abandoned carts" placeholder="Search customer by name or phone" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>{v.kLeft}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Carts left this week</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>people added items but did not order</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#a14f06" }}>{v.kWaiting}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Money waiting</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>in open carts</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                      <path d="M16 17h6v-6" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>{v.kBack}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Came back and ordered</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>this week</div>
                  </div>
                </div>
              </div>
              <section className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "12px", background: "rgba(0,48,135,.08)", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", minWidth: "0" }}>
                  <div style={{ fontSize: "15px", lineHeight: "22px", fontWeight: "600", color: "#0f172a" }}>Send an automatic reminder</div>
                  <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>{v.autoNote}</div>
                </div>
                <__Link href="/auto-reminders" style={{ fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" }}>Edit message</__Link>
                <button type="button" className={v.autoCls} role="switch" aria-checked={v.autoOn} aria-label="Automatic reminder" onClick={v.toggleAuto} />
              </section>
              <section className="card" style={{ overflow: "hidden", flexGrow: "1", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  {__list(v.chips).map((c, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}<span style={{ minWidth: "22px", height: "20px", padding: "0 6px", borderRadius: "999px", background: "#eef2f6", color: "#475569", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{c?.count}</span></button>
                    </React.Fragment>))}
                  <div style={{ flexGrow: "1" }} />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Newest first</span>
                </div>
                {v.hasMsg ? (<>
                  <div style={{ padding: "14px 16px 0" }}>
                    <div className="fade" role="status" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: "#e7f8f1", color: "#065f46", fontSize: "14px", fontWeight: "500" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span>{v.msg}</span>
                    </div>
                  </div>
                </>) : null}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th">Customer</th>
                      <th className="th">In the cart</th>
                      <th className="th" style={{ textAlign: "right" }}>Amount</th>
                      <th className="th">Left</th>
                      <th className="th">Last contact</th>
                      <th className="th" style={{ textAlign: "right" }}>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row">
                          <td className="td">
                            <__Link href="/customer-profile" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                              <span style={__sx(`width: 40px; height: 40px; flex-shrink: 0; border-radius: 999px; background: ${r?.avBg ?? ""}; color: ${r?.avFg ?? ""}; display: flex; align-items: center; justify-content: center; font-weight: 600;`)}>{r?.initial}</span>
                              <span>
                                <span style={{ display: "block", fontWeight: "500" }}>{r?.name}</span>
                                <span className="mono" style={{ display: "block", fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.phone}</span>
                              </span>
                            </__Link>
                          </td>
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>{r?.items}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.more}</div>
                          </td>
                          <td className="td" style={{ textAlign: "right", fontSize: "16px", fontWeight: "700", whiteSpace: "nowrap" }}>{r?.value}</td>
                          <td className="td" style={{ whiteSpace: "nowrap", color: "#475569" }}>{r?.ago}</td>
                          <td className="td">
                            <span className={r?.lastCls}>{r?.last}</span>
                          </td>
                          <td className="td" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {r?.open ? (<>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                <button type="button" className="btn solid sm" onClick={r?.call} aria-label={r?.callLabel}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  <span>Call</span>
                                </button>
                                <button type="button" className="btn line sm" onClick={r?.wa} aria-label={r?.waLabel} style={{ color: "#166534" }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                  </svg>
                                  <span>WhatsApp</span>
                                </button>
                                <button type="button" className="btn line sm" onClick={r?.sms} aria-label={r?.smsLabel}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                  </svg>
                                  <span>SMS</span>
                                </button>
                              </div>
                            </>) : null}
                            {r?.won ? (<>
                              <span className="badge b-received">Ordered</span>
                            </>) : null}
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.empty ? (<>
                  <div style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>No carts here.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
