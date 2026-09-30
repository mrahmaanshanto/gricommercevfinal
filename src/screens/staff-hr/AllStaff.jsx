'use client';
// Generated from design/templates/staff-hr/AllStaff.dc.html by scripts/convert-design.mjs.
// All staff — Staff & HR — All staff.
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
// [code, name, designation, department, branch, shift, basic(gross), type, status, phone, joined, role]
var STAFF = [
  ['EMP-0118', 'Rakib Hasan', 'Branch manager', 'Store operations', 'Dhanmondi branch', 'morning', 38000, 'Full-time', 'active', '01712-XX4410', '3 Feb 2022', 'Manager'],
  ['EMP-0142', 'Sadia Akter', 'Cashier', 'Store operations', 'Dhanmondi branch', 'morning', 22000, 'Full-time', 'active', '01712-XX8821', '12 Mar 2024', 'Cashier'],
  ['EMP-0151', 'Rafi Ahmed', 'Sales associate', 'Store operations', 'Dhanmondi branch', 'evening', 16000, 'Full-time', 'active', '01819-XX2207', '8 Jan 2025', 'Sales staff'],
  ['EMP-0121', 'Nabila Rahman', 'Branch manager', 'Store operations', 'Mirpur branch', 'morning', 35000, 'Full-time', 'active', '01715-XX6630', '19 Jun 2022', 'Manager'],
  ['EMP-0149', 'Moumita Das', 'Cashier', 'Store operations', 'Mirpur branch', 'evening', 20000, 'Full-time', 'leave', '01911-XX0194', '2 Sep 2024', 'Cashier'],
  ['EMP-0160', 'Arif Rahman', 'Sales associate', 'Store operations', 'Mirpur branch', 'morning', 16000, 'Probation', 'probation', '01633-XX5582', '1 Jul 2026', 'Sales staff'],
  ['EMP-0133', 'Tareq Aziz', 'Stock keeper', 'Warehouse', 'Central Warehouse', 'warehouse', 18000, 'Full-time', 'active', '01556-XX7713', '14 Oct 2023', 'Stock staff'],
  ['EMP-0155', 'Sabbir Hossain', 'Packer', 'Warehouse', 'Central Warehouse', 'warehouse', 14000, 'Full-time', 'active', '01798-XX3301', '5 May 2025', 'Stock staff'],
  ['EMP-0145', 'Jahid Hasan', 'Delivery rider', 'Delivery', 'Central Warehouse', 'warehouse', 15000, 'Full-time', 'active', '01877-XX9046', '21 Nov 2024', 'Rider'],
  ['EMP-0163', 'Sohel Rana', 'Security guard', 'Warehouse', 'Central Warehouse', 'night', 12500, 'Contract', 'active', '01309-XX1128', '10 Feb 2026', 'No login'],
  ['EMP-0137', 'Lamia Sultana', 'Customer care', 'Customer care', 'Head office', 'office', 20000, 'Full-time', 'active', '01521-XX4467', '7 Aug 2023', 'Support'],
  ['EMP-0158', 'Rumana Islam', 'Accountant', 'Accounts', 'Head office', 'office', 40000, 'Full-time', 'active', '01711-XX0625', '15 Jan 2023', 'Accounts'],
  ['EMP-0161', 'Jannatul Ferdous', 'Social media executive', 'Marketing', 'Head office', 'office', 12000, 'Part-time', 'active', '01404-XX8872', '3 Aug 2026', 'Marketing'],
  ['EMP-0112', 'Kamrul Islam', 'Senior sales associate', 'Store operations', 'Dhanmondi branch', 'evening', 19000, 'Full-time', 'suspended', '01670-XX2254', '11 Apr 2021', 'Sales staff']
];
var SHIFTS = { morning: ['Morning', '9:00 am – 5:00 pm', '#e0f3fb', '#075985'], evening: ['Evening', '1:00 pm – 9:00 pm', '#f3e8ff', '#6d28d9'], warehouse: ['Warehouse', '8:00 am – 4:00 pm', '#fff4e0', '#a14f06'], office: ['Office', '9:30 am – 6:00 pm', '#e7f8f1', '#047857'], night: ['Night guard', '9:00 pm – 7:00 am', '#e2e8f0', '#334155'] };
var AV = [['#e0f3fb', '#075985'], ['#f3e8ff', '#6d28d9'], ['#fff4e0', '#a14f06'], ['#e7f8f1', '#047857'], ['#ffece6', '#b83210'], ['#e0e7ff', '#3730a3']];
function ini(n) { var p = n.split(' '); return (p[0].charAt(0) + (p[1] || '').charAt(0)).toUpperCase(); }
function av(n, i) { var c = AV[i % AV.length]; return { ini: ini(n), ab: c[0], af: c[1] }; }
var PROFILE = '../staff-profile/StaffProfile.dc.html';
var TD = { 'EMP-0151': ['Late · 1:24 pm', '#b45309'], 'EMP-0160': ['Late · 9:18 am', '#b45309'], 'EMP-0149': ['On sick leave', '#1d4ed8'], 'EMP-0161': ['Starts 2:00 pm', '#64748b'], 'EMP-0112': ['—', '#94a3b8'] };
var ST = { active: ['Active', '#e7f8f1', '#047857'], leave: ['On leave', '#e0f2fe', '#075985'], probation: ['Probation', '#fff4e0', '#a14f06'], suspended: ['Suspended', '#ffece6', '#b83210'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var f = s.f || 'all', br = s.br || 'all', q = (s.q || '').toLowerCase(), view = s.view || this.props.view || 'table', sel = s.sel || [];
    var list = STAFF.map(function (r, i) { return [r, i]; }).filter(function (x) { var r = x[0]; return (f === 'all' || r[8] === f) && (br === 'all' || r[4] === br) && (!q || (r[1] + r[0] + r[9]).toLowerCase().indexOf(q) >= 0); });
    var cnt = function (k) { return STAFF.filter(function (r) { return k === 'all' || r[8] === k; }).length; };
    var tot = 0; STAFF.forEach(function (r) { if (r[8] !== 'suspended') tot += r[6]; });
    var v = {
      kAll: String(STAFF.length), kPay: bdt(tot),
      imp: function () { toast(self, 'Download the template, fill one row per person, upload it back.'); }, exp: function () { toast(self, 'Staff list exported as CSV.'); },
      chips: [['all', 'All'], ['active', 'Active'], ['probation', 'Probation'], ['leave', 'On leave'], ['suspended', 'Suspended']].map(function (c) { var on = c[0] === f; return { l: c[1], c: cnt(c[0]), on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ f: c[0] }); } }; }),
      br: br, setBr: function (e) { self.setState({ br: e.target.value }); }, q: s.q || '', typeQ: function (e) { self.setState({ q: e.target.value }); },
      views: segv(self, [['table', 'Table'], ['cards', 'Cards']], view, 'view'), isTable: view === 'table', isCards: view === 'cards', none: !list.length,
      rows: list.map(function (x) { var r = x[0], i = x[1]; var sh = SHIFTS[r[5]]; var st = ST[r[8]]; var t = TD[r[0]] || ['Present · in on time', '#047857']; var on = sel.indexOf(r[0]) >= 0;
        return assign(av(r[1], i), { n: r[1], code: r[0] + ' · ' + r[9], phone: r[9], des: r[2], dep: r[3], type: r[7], br: r[4], sh: sh[0] + ' ' + sh[1], sb: sh[2], sf: sh[3], today: t[0], tc: t[1], role: r[11], sal: bdt(r[6]), pt: st[0], pb: st[1], pf: st[2], link: PROFILE, on: on,
          tick: function () { self.setState({ sel: on ? sel.filter(function (c) { return c !== r[0]; }) : sel.concat([r[0]]) }); } }); }),
      hasSel: sel.length > 0, selN: sel.length,
      bulkMsg: function () { toast(self, 'SMS drafted for ' + sel.length + ' staff.'); }, bulkShift: function () { toast(self, 'Pick a shift in Shifts & roster — ' + sel.length + ' staff selected.'); }, bulkCsv: function () { toast(self, sel.length + ' staff exported.'); }
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

export default class AllStaffScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllStaff">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "2100px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="hr-staff" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Staff & HR"} page="All staff" placeholder="Search staff by name, phone or code" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Everyone who works for you — shop, warehouse, riders and office. <span className="bn">সব কর্মী এক জায়গায়।</span></div>
                <button type="button" className="btn line" onClick={v.imp}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8 12 3 7 8" />
                    <path d="M12 3v12" />
                  </svg>
                  <span>Import CSV</span>
                </button>
                <button type="button" className="btn line" onClick={v.exp}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                  <span>Export</span>
                </button>
                <__Link href="/staff-profile" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add staff</span>
                </__Link>
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>{v.kAll}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Total staff</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Across 4 locations</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>11</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Present today</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>2 late · 1 on leave</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="12" x="2" y="6" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>{v.kPay}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Monthly salary</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Gross, before deductions</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#f3e8ff", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>12</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>With admin login</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>2 roles changed this month</div>
                  </div>
                </div>
              </div>
              <section className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef2f6", flexWrap: "wrap" }}>
                  {__list(v.chips).map((ch, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={ch?.cls} onClick={ch?.pick} aria-pressed={ch?.on} style={{ height: "34px" }}>{ch?.l}<span style={{ fontSize: "11px", opacity: ".7" }}>{ch?.c}</span></button>
                    </React.Fragment>))}
                  <span style={{ flexGrow: "1" }} />
                  <select className="inp" value={v.br} onChange={v.setBr} aria-label="Branch" style={{ width: "190px", height: "38px" }}>
                    <option value="all">All locations</option>
                    <option value="Dhanmondi branch">Dhanmondi branch</option>
                    <option value="Mirpur branch">Mirpur branch</option>
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="Head office">Head office</option>
                  </select>
                  <label style={{ position: "relative", width: "240px", display: "block" }}>
                    <span style={{ position: "absolute", left: "12px", top: "9px", color: "#64748b" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp" value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder="Name, phone or EMP code" aria-label="Search staff" style={{ height: "38px", paddingLeft: "38px" }} />
                  </label>
                  <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                    {__list(v.views).map((vw, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={vw?.pick} aria-pressed={vw?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${vw?.bg ?? ""}; color: ${vw?.fg ?? ""};`)}>{vw?.l}</button>
                      </React.Fragment>))}
                  </div>
                </div>
                {v.hasSel ? (<>
                  <div className="fade" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#0b1733", color: "#fff", fontSize: "13.5px" }}>
                    <b>{v.selN} selected</b>
                    <span style={{ flexGrow: "1" }} />
                    <button type="button" className="btn sm" onClick={v.bulkMsg} style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Send SMS</button>
                    <button type="button" className="btn sm" onClick={v.bulkShift} style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Assign shift</button>
                    <button type="button" className="btn sm" onClick={v.bulkCsv} style={{ background: "#fff", color: "#0b1733" }}>Export</button>
                  </div>
                </>) : null}
                {v.isTable ? (<>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th" />
                        <th className="th">Staff</th>
                        <th className="th">Designation</th>
                        <th className="th">Location · shift</th>
                        <th className="th">Today</th>
                        <th className="th">Login role</th>
                        <th className="th" style={{ textAlign: "right" }}>Salary</th>
                        <th className="th">Status</th>
                        <th className="th" />
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((rw, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td className="td" style={{ width: "40px" }}>
                              <input type="checkbox" checked={rw?.on} onChange={rw?.tick} aria-label="Select" style={{ width: "17px", height: "17px", accentColor: "#003087" }} />
                            </td>
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: 999px; background: ${rw?.ab ?? ""}; color: ${rw?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;`)}>{rw?.ini}</span>
                                <div style={{ minWidth: "0" }}>
                                  <__A href={rw?.link} style={{ display: "block", fontWeight: "600", color: "#0f172a", textDecoration: "none" }}>{rw?.n}</__A>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>{rw?.code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="td">
                              <div style={{ fontWeight: "500" }}>{rw?.des}</div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>{rw?.dep} · {rw?.type}</div>
                            </td>
                            <td className="td">
                              <div>{rw?.br}</div>
                              <span style={__sx(`display: inline-flex; height: 22px; padding: 0 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; align-items: center; margin-top: 3px; background: ${rw?.sb ?? ""}; color: ${rw?.sf ?? ""};`)}>{rw?.sh}</span>
                            </td>
                            <td className="td">
                              <span style={__sx(`font-size: 13px; font-weight: 600; color: ${rw?.tc ?? ""};`)}>{rw?.today}</span>
                            </td>
                            <td className="td">
                              <span className="badge b-draft">{rw?.role}</span>
                            </td>
                            <td className="td num" style={{ textAlign: "right", fontWeight: "600" }}>{rw?.sal}</td>
                            <td className="td">
                              <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; background: ${rw?.pb ?? ""}; color: ${rw?.pf ?? ""};`)}>{rw?.pt}</span>
                            </td>
                            <td className="td">
                              <__A className="abtn" href={rw?.link} style={{ textDecoration: "none" }}>Open</__A>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </>) : null}
                {v.isCards ? (<>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px", padding: "16px" }}>
                    {__list(v.rows).map((cd, $index) => (<React.Fragment key={$index}>
                        <__A href={cd?.link} className="actc" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", borderRadius: "16px", background: "#fff", border: "1px solid #e6eaf0", textDecoration: "none", color: "inherit" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={__sx(`width: 44px; height: 44px; flex-shrink: 0; border-radius: 999px; background: ${cd?.ab ?? ""}; color: ${cd?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;`)}>{cd?.ini}</span>
                            <div style={{ flexGrow: "1", minWidth: "0" }}>
                              <div style={{ fontWeight: "600", color: "#0f172a" }}>{cd?.n}</div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>{cd?.des}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; background: ${cd?.pb ?? ""}; color: ${cd?.pf ?? ""};`)}>{cd?.pt}</span>
                            <span style={__sx(`display: inline-flex; height: 24px; padding: 0 8px; border-radius: 999px; font-size: 12px; font-weight: 600; align-items: center; background: ${cd?.sb ?? ""}; color: ${cd?.sf ?? ""};`)}>{cd?.sh}</span>
                          </div>
                          <div style={{ fontSize: "12.5px", color: "#475569" }}>{cd?.br} · {cd?.phone}</div>
                          <div style={__sx(`font-size: 12.5px; font-weight: 600; color: ${cd?.tc ?? ""};`)}>{cd?.today}</div>
                        </__A>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.none ? (<>
                  <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No staff match these filters.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
