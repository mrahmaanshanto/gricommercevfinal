'use client';
// Generated from design/templates/staff-hr/Shifts.dc.html by scripts/convert-design.mjs.
// Shifts & roster — Staff & HR — Shifts & roster.
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
var SHIFTS = { morning: ['Morning', '9:00 AM – 5:00 PM', '#e0f3fb', '#075985'], evening: ['Evening', '1:00 PM – 9:00 PM', '#f3e8ff', '#6d28d9'], warehouse: ['Warehouse', '8:00 AM – 4:00 PM', '#fff4e0', '#a14f06'], office: ['Office', '9:30 AM – 6:00 PM', '#e7f8f1', '#047857'], night: ['Night guard', '9:00 PM – 7:00 AM', '#e2e8f0', '#334155'] };
var AV = [['#e0f3fb', '#075985'], ['#f3e8ff', '#6d28d9'], ['#fff4e0', '#a14f06'], ['#e7f8f1', '#047857'], ['#ffece6', '#b83210'], ['#e0e7ff', '#3730a3']];
function ini(n) { var p = n.split(' '); return (p[0].charAt(0) + (p[1] || '').charAt(0)).toUpperCase(); }
function av(n, i) { var c = AV[i % AV.length]; return { ini: ini(n), ab: c[0], af: c[1] }; }
var PROFILE = '../staff-profile/StaffProfile.dc.html';
var ORDER = ['morning', 'evening', 'warehouse', 'office', 'night', 'off', 'leave'];
var XTRA = { off: ['Weekly off', '', '#f8fafc', 'var(--text-muted)'], leave: ['Leave', '', '#e0f2fe', '#1d4ed8'] };
var HRS = { morning: 8, evening: 8, warehouse: 8, office: 8.5, night: 10, off: 0, leave: 0 };
var DAYS = [['Sat', '19 Sep'], ['Sun', '20 Sep'], ['Mon', '21 Sep'], ['Tue', '22 Sep'], ['Wed', '23 Sep'], ['Thu', '24 Sep'], ['Fri', '25 Sep']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var ov = s.ov || {};
    var base = function (r, di) { if (r[8] === 'suspended') return 'off'; if (r[0] === 'EMP-0149' && di < 3) return 'leave'; if (r[0] === 'EMP-0151' && (di === 5)) return 'leave'; if (di === 6) return r[5] === 'night' ? 'night' : 'off'; if (r[0] === 'EMP-0161' && (di === 1 || di === 3)) return 'off'; if (r[5] === 'morning' && di === 4 && r[4] === 'Dhanmondi branch') return 'evening'; return r[5]; };
    var get = function (r, di) { var k = r[0] + ':' + di; return ov[k] || base(r, di); };
    var cntDay = function (di, br) { return STAFF.filter(function (r) { var x = get(r, di); return r[4] === br && x !== 'off' && x !== 'leave'; }).length; };
    var v = {
      copyWeek: function () { toast(self, 'Last week’s roster copied. Leave already approved is kept.'); },
      publish: function () { toast(self, 'Roster published. 13 staff got their week by SMS.'); },
      shifts: ['morning', 'evening', 'warehouse', 'office', 'night'].map(function (k) { var x = SHIFTS[k]; var X = { morning: 'Break 60 min · grace 10 min', evening: 'Break 45 min · grace 10 min', warehouse: 'Break 60 min · grace 5 min', office: 'Break 60 min · grace 15 min', night: 'No break · overtime after 10 h' }; return { l: x[0], t: x[1], f: x[3], x: X[k], n: STAFF.filter(function (r) { return r[5] === k; }).length }; }),
      editing: !!s.edit, newShift: function () { self.setState({ edit: true }); }, closeShift: function () { self.setState({ edit: false }); }, saveShift: function () { self.setState({ edit: false }); toast(self, 'Shift saved. It now shows in the roster.'); },
      wdays: DAYS.map(function (d, i) { return { l: d[0], d: d[1], c: i === 0 ? '#003087' : 'var(--text-muted)', off: i === 6 }; }),
      roster: STAFF.map(function (r, i) { var h = 0;
        var cells = DAYS.map(function (d, di) { var k = get(r, di); var x = SHIFTS[k] || XTRA[k]; h += HRS[k];
          return { l: x[0], t: (x[1] || '').replace(' – ', '–').replace(/:00/g, ''), b: x[2], f: x[3], bd: k === 'off' ? '#cbd5e1' : 'transparent', bs: k === 'off' ? 'dashed' : 'solid', aria: r[1] + ' ' + d[0] + ' ' + x[0],
            cycle: function () { if (k === 'leave') { toast(self, 'Leave is changed from the Leave page.', true); return; } var nx = ORDER[(ORDER.indexOf(k) + 1) % 6]; var n = assign({}, ov); n[r[0] + ':' + di] = nx; self.setState({ ov: n }); } }; });
        return assign(av(r[1], i), { n: r[1], des: r[2] + ' · ' + r[4].replace(' branch', ''), link: PROFILE, cells: cells, h: h + ' h', hc: h > 48 ? '#b83210' : '#0f172a' }); }),
      warn: cntDay(3, 'Mirpur branch') < 2 ? 'Mirpur branch has only ' + cntDay(3, 'Mirpur branch') + ' person on Tue 22 Sep — add cover.' : 'Mirpur branch is short on Sat–Mon: Moumita is on sick leave, only 2 people on the floor.'
    };
    return assign(v, msgV(s));
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
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}
`;

// ---- markup ----

export default class ShiftsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Shifts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="hr-shifts" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Staff & HR"} page={"Shifts & roster"} placeholder="Search staff by name, phone or code" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title={"Shifts & roster"} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Set your shifts once, then plan the week. Staff get the roster by SMS when you publish it.</div>
                <button type="button" className="btn line" onClick={v.copyWeek}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copy last week</span>
                </button>
                <button type="button" className="btn solid" onClick={v.publish}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                    <path d="m21.854 2.147-10.94 10.939" />
                  </svg>
                  <span>Publish roster</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div className="gc-cols-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "12px" }}>
                {__list(v.shifts).map((sf, $index) => (<React.Fragment key={$index}>
                    <div className="pcard" style={__sx(`padding: 16px; display: flex; flex-direction: column; gap: 8px; border-top: 4px solid ${sf?.f ?? ""};`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a", flexGrow: "1" }}>{sf?.l}</span>
                        <span className="pcnt">{sf?.n}</span>
                      </div>
                      <div className="num" style={__sx(`font-size: var(--text-sm); font-weight: var(--weight-medium); color: ${sf?.f ?? ""};`)}>{sf?.t}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{sf?.x}</div>
                    </div>
                  </React.Fragment>))}
                <button type="button" onClick={v.newShift} style={{ borderRadius: "var(--radius-lg)", border: "1.5px dashed #94a3b8", background: "transparent", font: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "120px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>New shift</button>
              </div>
              {v.editing ? (<>
                <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px", border: "1.5px solid #003087" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-base)", flexGrow: "1" }}>New shift</h2>
                    <button type="button" className="ib" onClick={v.closeShift} aria-label="Close">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1fr", gap: "12px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Name</span>
                      <input className="inp" placeholder="e.g. Friday half day" aria-label="Shift name" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Starts</span>
                      <input className="inp" type="time" defaultValue="10:00" aria-label="Starts" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Ends</span>
                      <input className="inp" type="time" defaultValue="18:00" aria-label="Ends" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Break</span>
                      <input className="inp" defaultValue="60 min" aria-label="Break" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Grace</span>
                      <input className="inp" defaultValue="10 min" aria-label="Grace" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Colour</span>
                      <select className="inp" aria-label="Colour">
                        <option>Blue</option>
                        <option>Green</option>
                        <option>Purple</option>
                        <option>Amber</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn line" onClick={v.closeShift}>Cancel</button>
                    <button type="button" className="btn solid" onClick={v.saveShift}>Save shift</button>
                  </div>
                </section>
              </>) : null}
              <section className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button type="button" className="ib" aria-label="Previous week">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <span style={{ fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Week of 19 – 25 Sep 2026</span>
                    <button type="button" className="ib" aria-label="Next week">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Click a cell to change the shift</span>
                  <span style={{ flexGrow: "1" }} />
                  <select className="inp" aria-label="Location" style={{ width: "190px", height: "38px" }}>
                    <option>All locations</option>
                    <option>Dhanmondi branch</option>
                    <option>Mirpur branch</option>
                    <option>Central Warehouse</option>
                    <option>Head office</option>
                  </select>
                </div>
                <div className="gc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th" style={{ width: "220px" }}>Staff</th>
                        {__list(v.wdays).map((wd, $index) => (<React.Fragment key={$index}>
                            <th className="th" style={__sx(`text-align: center; color: ${wd?.c ?? ""};`)}>{wd?.l}<div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "none", letterSpacing: "0" }}>{wd?.d}</div></th>
                          </React.Fragment>))}
                        <th className="th" style={{ textAlign: "right" }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.roster).map((ro, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-full); background: ${ro?.ab ?? ""}; color: ${ro?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{ro?.ini}</span>
                                <div style={{ minWidth: "0" }}>
                                  <__A href={ro?.link} style={{ display: "block", minHeight: "24px", lineHeight: "24px", fontWeight: "var(--weight-medium)", color: "#0f172a", textDecoration: "none" }}>{ro?.n}</__A>
                                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ro?.des}</div>
                                </div>
                              </div>
                            </td>
                            {__list(ro?.cells).map((rc, $index) => (<React.Fragment key={$index}>
                                <td style={{ padding: "6px 4px", borderBottom: "1px solid #eef2f6" }}>
                                  <button type="button" onClick={rc?.cycle} aria-label={rc?.aria} style={__sx(`width: 100%; height: 44px; border-radius: var(--radius-lg); border: 1px ${rc?.bs ?? ""} ${rc?.bd ?? ""}; background: ${rc?.b ?? ""}; color: ${rc?.f ?? ""}; font: inherit; font-size: var(--text-xs); font-weight: var(--weight-medium); cursor: pointer; line-height: 17px;`)}>{rc?.l}<div style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", opacity: ".85" }}>{rc?.t}</div></button>
                                </td>
                              </React.Fragment>))}
                            <td className="td num" style={__sx(`text-align: right; font-weight: var(--weight-semibold); color: ${ro?.hc ?? ""};`)}>{ro?.h}</td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", fontSize: "var(--text-xs-plus)", color: "#7a3b04", background: "#fffaf0", borderTop: "1px solid #f5e6c8" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <span>{v.warn}</span>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
