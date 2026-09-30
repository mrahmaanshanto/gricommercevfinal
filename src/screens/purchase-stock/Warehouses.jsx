'use client';
// Generated from design/templates/purchase-stock/Warehouses.dc.html by scripts/convert-design.mjs.
// Warehouses — Stocks & Inventory — Warehouses.
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
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
var WH = [
  { k: 'cw', code: 'CW', n: 'Central Warehouse', addr: 'Plot 12, Tejgaon I/A, Dhaka', st: 'Main', use: 72, skus: '1,284', val: '৳39,40,000', racks: 48, staff: 4, mgr: 'Tareq Aziz', sup: 'Dhanmondi, Mirpur, online', tb: '#e0f3fb', tf: '#003087',
    zones: [['Receiving', 'Unload, check, scan', 55, '6 racks', '#0a5bd0', '38 SKUs'], ['Storage A', 'Fast movers', 84, '16 racks', '#10b981', '612 SKUs'], ['Storage B', 'Slow movers and bulk', 71, '14 racks', '#14b8a6', '541 SKUs'], ['Cold room', '2–8 °C · serums and food', 63, '4 racks', '#6366f1', '58 SKUs'], ['Quarantine · expired', 'Blocked from sale', 30, '2 racks', '#e11d48', '6 SKUs'], ['Dispatch', 'Packed orders waiting for courier', 40, '6 racks', '#f59e0b', '29 orders']] },
  { k: 'ctg', code: 'CH', n: 'Chattogram hub', addr: 'Agrabad C/A, Chattogram', st: 'Hub', use: 46, skus: '312', val: '৳6,85,000', racks: 12, staff: 2, mgr: 'Sabbir Hossain', sup: 'Online orders in Chattogram', tb: '#fff4e0', tf: '#a14f06',
    zones: [['Receiving', 'Transfers from Dhaka', 20, '2 racks', '#0a5bd0', '4 SKUs'], ['Storage', 'Top 300 sellers', 58, '8 racks', '#10b981', '298 SKUs'], ['Dispatch', 'Courier pickup 5 pm', 35, '2 racks', '#f59e0b', '11 orders']] },
  { k: 'ret', code: 'RD', n: 'Returns & damaged', addr: 'Inside Central Warehouse · cage R', st: 'Virtual', use: 22, skus: '41', val: '৳2,37,300', racks: 3, staff: 1, mgr: 'Tareq Aziz', sup: 'Nobody — not for sale', tb: '#ffece6', tf: '#b83210',
    zones: [['Check returns', 'Decide: restock, repair or write off', 40, '1 rack', '#f59e0b', '18 SKUs'], ['Damaged', 'Waiting for supplier or disposal', 25, '1 rack', '#e11d48', '15 SKUs'], ['Warranty repairs', 'Sent to or back from brand', 10, '1 rack', '#6366f1', '8 SKUs']] }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var pk = s.pk || 'cw', W = WH.filter(function (w) { return w.k === pk; })[0];
    var v = {
      addWh: function () { toast(self, 'Add a name, address and manager — then add zones and racks.'); },
      kN: String(WH.length), kUse: '68%',
      whs: WH.map(function (w) { var on = w.k === pk; var uc = w.use > 80 ? '#b83210' : w.use > 60 ? '#b45309' : '#047857'; return { code: w.code, n: w.n, addr: w.addr, pt: w.st, pb: w.st === 'Main' ? '#e0f3fb' : w.st === 'Hub' ? '#fff4e0' : '#f1f5f9', pf: w.st === 'Main' ? '#075985' : w.st === 'Hub' ? '#a14f06' : '#475569', tb: w.tb, tf: w.tf, use: w.use + '%', uc: uc, mgr: w.mgr, sup: w.sup,
        st: [[w.skus, 'SKUs'], [w.val, 'Stock value'], [String(w.racks), 'Racks'], [String(w.staff), 'Staff']].map(function (x) { return { v: x[0], l: x[1] }; }), on: on, bd: on ? '#003087' : '#e6eaf0', bg: on ? '#f5f8ff' : '#fff', pick: function () { self.setState({ pk: w.k }); } }; }),
      selN: W.n,
      zones: W.zones.map(function (z) { return { n: z[0], d: z[1], u: z[2] + '%', r: z[3], c: z[4], sk: z[5] }; }),
      defOnline: mkSw(this, 'on_' + pk, pk !== 'ret'), replen: mkSw(this, 'rp_' + pk, pk === 'cw'), negStock: mkSw(this, 'ng_' + pk, true)
    };
    return assign(v, msgV(s));
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
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#64748b}
.num{font-variant-numeric:tabular-nums}
.ai{height:30px;padding:0 10px;border-radius:8px;border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:12.5px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:48px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:#64748b;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:600}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#eef2f6;color:#475569;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:10px;border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#003087}
`;

// ---- markup ----

export default class WarehousesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Warehouses">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1420px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="stock-wh" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Stocks & Inventory"} page="Warehouses" placeholder="Search product, SKU, rack or bin" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Where stock is kept in bulk. Each warehouse has zones and racks, and sends stock to your branches.</div>
                <__Link href="/racks" className="btn line">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 3v18" />
                    <path d="M15 3v18" />
                  </svg>
                  <span>{"Racks & bins"}</span>
                </__Link>
                <button type="button" className="btn solid" onClick={v.addWh}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add warehouse</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                      <path d="M2 7h20" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>{v.kN}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Warehouses</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>1 main, 1 hub, 1 returns</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="12" x="2" y="6" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>৳48,62,300</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Stock value</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>At cost, all warehouses</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#a14f06" }}>{v.kUse}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Space used</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Across all racks</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#f3e8ff", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>3 deliveries</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Waiting to receive</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>From suppliers and returns</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                {__list(v.whs).map((wh, $index) => (<React.Fragment key={$index}>
                    <button type="button" onClick={wh?.pick} aria-pressed={wh?.on} style={__sx(`text-align: left; padding: 18px; border-radius: 18px; border: 1.5px solid ${wh?.bd ?? ""}; background: ${wh?.bg ?? ""}; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 2px rgba(15,23,42,.04);`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={__sx(`width: 44px; height: 44px; border-radius: 12px; background: ${wh?.tb ?? ""}; color: ${wh?.tf ?? ""}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;`)}>{wh?.code}</span>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{wh?.n}</div>
                          <div style={{ fontSize: "12.5px", color: "#64748b" }}>{wh?.addr}</div>
                        </div>
                        <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; background: ${wh?.pb ?? ""}; color: ${wh?.pf ?? ""};`)}>{wh?.pt}</span>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                          <span style={{ color: "#64748b" }}>Space used</span>
                          <b style={__sx(`color: ${wh?.uc ?? ""};`)}>{wh?.use}</b>
                        </div>
                        <div style={{ height: "10px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                          <div style={__sx(`width: ${wh?.use ?? ""}; height: 100%; border-radius: 999px; background: ${wh?.uc ?? ""};`)} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1.4fr) auto auto", gap: "8px 14px" }}>
                        {__list(wh?.st).map((ws, $index) => (<React.Fragment key={$index}>
                            <div>
                              <div className="num" style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{ws?.v}</div>
                              <div style={{ fontSize: "11.5px", color: "#64748b" }}>{ws?.l}</div>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#475569" }}>Manager: <b>{wh?.mgr}</b> · Supplies: {wh?.sup}</div>
                    </button>
                  </React.Fragment>))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: "18px", alignItems: "start" }}>
                <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flexGrow: "1" }}>
                      <h2 style={{ margin: "0", fontSize: "16px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Zones in {v.selN}</h2>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>Zones group racks by purpose. Stock in Quarantine and Expired cannot be sold.</p>
                    </div>
                    <__Link href="/racks" className="abtn" style={{ textDecoration: "none" }}>Open rack map <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></__Link>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                    {__list(v.zones).map((zn, $index) => (<React.Fragment key={$index}>
                        <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid #e6eaf0", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={__sx(`width: 10px; height: 10px; border-radius: 3px; background: ${zn?.c ?? ""};`)} />
                            <span style={{ fontWeight: "700", flexGrow: "1" }}>{zn?.n}</span>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>{zn?.r}</span>
                          </div>
                          <div style={{ fontSize: "12.5px", color: "#475569" }}>{zn?.d}</div>
                          <div style={{ height: "8px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                            <div style={__sx(`width: ${zn?.u ?? ""}; height: 100%; background: ${zn?.c ?? ""};`)} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{zn?.u} full · {zn?.sk}</div>
                        </div>
                      </React.Fragment>))}
                  </div>
                </section>
                <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flexGrow: "1" }}>
                      <h2 style={{ margin: "0", fontSize: "16px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>How {v.selN} works</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                        <path d="M15 18H9" />
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                        <circle cx="17" cy="18" r="2" />
                        <circle cx="7" cy="18" r="2" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Ships online orders</div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Online orders are picked here when the branch near the customer has no stock</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.defOnline?.on} aria-label="Ships online orders" className={v.defOnline?.cls} onClick={v.defOnline?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Refill branches by itself</div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>When a branch drops below its minimum, a transfer is drafted for you to approve</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.replen?.on} aria-label="Refill branches by itself" className={v.replen?.cls} onClick={v.replen?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m4.9 4.9 14.2 14.2" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Block selling what is not there</div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Stock can never go below zero here</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.negStock?.on} aria-label="Block selling what is not there" className={v.negStock?.cls} onClick={v.negStock?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Pick order</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>Which stock leaves first</div>
                    </div>
                    <select className="inp" aria-label="Pick order" style={{ width: "210px" }}>
                      <option>Expiring first (FEFO)</option>
                      <option>Oldest first (FIFO)</option>
                      <option>Nearest bin first</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Receiving goes to</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>Where new deliveries land before put-away</div>
                    </div>
                    <select className="inp" aria-label="Receiving" style={{ width: "210px" }}>
                      <option>Receiving zone</option>
                      <option>Straight to rack</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Stock count</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>How often racks are counted</div>
                    </div>
                    <select className="inp" aria-label="Count" style={{ width: "210px" }}>
                      <option>One aisle every week</option>
                      <option>Full count monthly</option>
                      <option>Only when I start one</option>
                    </select>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
