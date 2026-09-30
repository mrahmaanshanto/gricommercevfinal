'use client';
// Generated from design/templates/staff-hr/Attendance.dc.html by scripts/convert-design.mjs.
// Attendance — Staff & HR — Attendance.
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
// code: [in, out, worked, late, ot, source, status]
var DAY = { 'EMP-0118': ['8:52 AM', '—', '2 h 38 m', '', '', 'Fingerprint', 'in'], 'EMP-0142': ['8:57 AM', '—', '2 h 33 m', '', '', 'POS log-in', 'in'], 'EMP-0151': ['1:24 PM', '—', '—', '24 min', '', 'Staff app', 'late'], 'EMP-0121': ['8:49 AM', '—', '2 h 41 m', '', '', 'Fingerprint', 'in'], 'EMP-0149': ['—', '—', '—', '', '', 'Leave', 'leave'], 'EMP-0160': ['9:18 AM', '—', '2 h 12 m', '18 min', '', 'Fingerprint', 'late'], 'EMP-0133': ['7:55 AM', '—', '3 h 35 m', '', '', 'Fingerprint', 'in'], 'EMP-0155': ['8:03 AM', '—', '3 h 27 m', '', '', 'Fingerprint', 'in'], 'EMP-0145': ['8:10 AM', '—', '3 h 20 m', '', '', 'Rider app', 'in'], 'EMP-0163': ['9:01 PM', '7:02 AM', '10 h 01 m', '', '1 h 00 m', 'Fingerprint', 'done'], 'EMP-0137': ['9:26 AM', '—', '2 h 04 m', '', '', 'Staff app', 'in'], 'EMP-0158': ['9:31 AM', '—', '1 h 59 m', '', '', 'Staff app', 'in'], 'EMP-0161': ['—', '—', '—', '', '', '—', 'wait'], 'EMP-0112': ['—', '—', '—', '', '', '—', 'off'] };
var DST = { in: ['Present', '#e7f8f1', '#047857'], late: ['Late', '#fff4e0', '#a14f06'], leave: ['On leave', '#e0f2fe', '#075985'], done: ['Shift done', '#e2e8f0', '#334155'], wait: ['Not in yet', '#f1f5f9', '#64748b'], off: ['Suspended', '#ffece6', '#b83210'] };
var CELL = { P: ['#e7f8f1', '#047857'], L: ['#fff4e0', '#a14f06'], A: ['#ffece6', '#b83210'], V: ['#e0f2fe', '#1d4ed8'], W: ['#f1f5f9', '#94a3b8'], H: ['#f3e8ff', '#6d28d9'], '·': ['transparent', '#cbd5e1'] };
var WD = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var view = s.view || this.props.view || 'day', off = s.off || 0, fixed = s.fixed || {};
    var d = 19 + off;
    var v = {
      bulk: function () { toast(self, 'Bulk entry: tick staff, set one in/out time, save.'); },
      imp: function () { toast(self, 'Upload the CSV from the fingerprint device — duplicates are skipped.'); },
      add: function () { toast(self, 'Pick staff, date, in and out. It shows as “Manual” with your name.'); },
      prev: function () { self.setState({ off: off - (view === 'day' ? 1 : 0) }); }, next: function () { if (off < 0) self.setState({ off: off + 1 }); },
      dateL: view === 'day' ? (off === 0 ? 'Today · Sat 19 Sep 2026' : WD[(d - 1 + 70) % 7] + ' ' + d + ' Sep 2026') : 'September 2026',
      views: segv(self, [['day', 'Day'], ['month', 'Month register']], view, 'view'), isDay: view === 'day', isMonth: view === 'month',
      sums: [['11', 'Present', '#10b981'], ['2', 'Late', '#f59e0b'], ['1', 'On leave', '#3b82f6'], ['0', 'Absent', '#ef4444'], ['1 h', 'Overtime today', '#8b5cf6'], ['96%', 'On time this month', '#0a5bd0']].map(function (x) { return { n: x[0], l: x[1], c: x[2] }; }),
      rows: STAFF.map(function (r, i) { var a = DAY[r[0]]; var sh = SHIFTS[r[5]]; var st = fixed[r[0]] ? 'in' : a[6]; var t = DST[st];
        return assign(av(r[1], i), { n: r[1], br: r[4], link: PROFILE, sh: sh[0], sb: sh[2], sf: sh[3], in: a[0], out: a[1], wk: a[2], late: fixed[r[0]] ? '—' : a[3] || '—', lc: a[3] && !fixed[r[0]] ? '#b45309' : '#94a3b8', ot: a[4] || '—', src: fixed[r[0]] ? 'Manual · you' : a[5], pt: t[0], pb: t[1], pf: t[2], bg: st === 'late' ? '#fffcf5' : 'transparent',
          fix: function () { var n = assign({}, fixed); n[r[0]] = true; self.setState({ fixed: n }); toast(self, r[1] + ': marked present on time. Change saved in the activity log.'); } }); }),
      fixes: (s.fx || [0, 1]).map(function (k) { var F = [['Arif Rahman · 16 Sep', 'Forgot to punch out. Says left at 5:05 PM.'], ['Rafi Ahmed · 14 Sep', 'Device was down. Says in at 12:58 PM.']][k]; var rest = function () { return (s.fx || [0, 1]).filter(function (x) { return x !== k; }); };
        return { n: F[0], t: F[1], yes: function () { self.setState({ fx: rest() }); toast(self, 'Accepted — ' + F[0] + ' updated.'); }, no: function () { self.setState({ fx: rest() }); toast(self, 'Rejected — staff told by SMS.', true); } }; }),
      days: Array.apply(null, Array(30)).map(function (_, i) { var w = WD[i % 7]; return { d: i + 1, w: w.charAt(0), c: w === 'Fri' ? '#94a3b8' : i + 1 === 19 ? '#003087' : '#475569' }; }),
      reg: STAFF.map(function (r, si) { var p = 0, l = 0, a = 0, lv = 0;
        var cells = Array.apply(null, Array(30)).map(function (_, i) { var day = i + 1, w = WD[i % 7], t;
          if (day > 19) t = '·'; else if (r[8] === 'suspended' && day > 8) t = '·'; else if (w === 'Fri') t = 'W'; else if (r[0] === 'EMP-0149' && day >= 19) t = 'V'; else if (r[0] === 'EMP-0161' && day < 3) t = '·'; else if ((si * 7 + day * 3) % 23 === 0) t = 'L'; else if ((si + day) % 29 === 0) t = 'A'; else if ((si * 5 + day) % 31 === 0) t = 'V'; else t = 'P';
          if (t === 'P') p++; if (t === 'L') { l++; p++; } if (t === 'A') a++; if (t === 'V') lv++;
          var c = CELL[t]; return { t: t === 'P' ? '' : t, b: t === 'P' ? '#e7f8f1' : c[0], f: c[1] }; });
        return { n: r[1], cells: cells, p: p, l: l, a: a, lv: lv }; }),
      legend: [['', 'Present', 'P'], ['L', 'Late', 'L'], ['A', 'Absent', 'A'], ['V', 'Leave', 'V'], ['W', 'Weekly off', 'W'], ['H', 'Holiday', 'H']].map(function (x) { var c = CELL[x[2]]; return { t: x[0], l: x[1], b: x[2] === 'P' ? '#e7f8f1' : c[0], f: c[1] }; }),
      printReg: function () { toast(self, 'Attendance register for September sent to the printer.'); }
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

export default class AttendanceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Attendance">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="hr-attendance" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Staff & HR"} page="Attendance" placeholder="Search staff by name, phone or code" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Attendance" />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Punches come in from the fingerprint device, POS log-in and the staff app. Fix anything wrong here — every change is logged.</div>
                <button type="button" className="btn line" onClick={v.bulk}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 3v18" />
                    <path d="M15 3v18" />
                  </svg>
                  <span>Bulk entry</span>
                </button>
                <button type="button" className="btn line" onClick={v.imp}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                    <path d="M2 12a10 10 0 0 1 18-6" />
                    <path d="M2 16h.01" />
                    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                  </svg>
                  <span>Import from device</span>
                </button>
                <button type="button" className="btn solid" onClick={v.add}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add attendance</span>
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
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                  <button type="button" className="ib" onClick={v.prev} aria-label="Previous">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <span style={{ minWidth: "200px", textAlign: "center", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.dateL}</span>
                  <button type="button" className="ib" onClick={v.next} aria-label="Next">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                  {__list(v.views).map((vw, $index) => (<React.Fragment key={$index}>
                      <button type="button" onClick={vw?.pick} aria-pressed={vw?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${vw?.bg ?? ""}; color: ${vw?.fg ?? ""};`)}>{vw?.l}</button>
                    </React.Fragment>))}
                </div>
                <span style={{ flexGrow: "1" }} />
                <select className="inp" aria-label="Location" style={{ width: "190px", height: "40px" }}>
                  <option>All locations</option>
                  <option>Dhanmondi branch</option>
                  <option>Mirpur branch</option>
                  <option>Central Warehouse</option>
                  <option>Head office</option>
                </select>
              </div>
              <div className="gc-cols-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "12px" }}>
                {__list(v.sums).map((sm, $index) => (<React.Fragment key={$index}>
                    <div className="pcard" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={__sx(`width: 10px; height: 34px; border-radius: var(--radius-full); background: ${sm?.c ?? ""};`)} />
                      <div>
                        <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{sm?.n}</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{sm?.l}</div>
                      </div>
                    </div>
                  </React.Fragment>))}
              </div>
              <section className="pcard" style={{ overflow: "hidden" }}>
                {v.isDay ? (<>
                  <div style={{ display: "flex" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div className="gc-table-wrap">
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th className="th">Staff</th>
                              <th className="th">Shift</th>
                              <th className="th">In</th>
                              <th className="th">Out</th>
                              <th className="th">Worked</th>
                              <th className="th">Late</th>
                              <th className="th">Overtime</th>
                              <th className="th">Source</th>
                              <th className="th">Status</th>
                              <th className="th" />
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.rows).map((ar, $index) => (<React.Fragment key={$index}>
                                <tr className="row" style={__sx(`background: ${ar?.bg ?? ""};`)}>
                                  <td className="td">
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                      <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-full); background: ${ar?.ab ?? ""}; color: ${ar?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{ar?.ini}</span>
                                      <div style={{ minWidth: "0" }}>
                                        <__A href={ar?.link} style={{ display: "block", fontWeight: "var(--weight-medium)", color: "#0f172a", textDecoration: "none" }}>{ar?.n}</__A>
                                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ar?.br}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="td">
                                    <span style={__sx(`display: inline-flex; height: 22px; padding: 0 8px; border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: var(--weight-medium); align-items: center; background: ${ar?.sb ?? ""}; color: ${ar?.sf ?? ""};`)}>{ar?.sh}</span>
                                  </td>
                                  <td className="td num" style={{ fontWeight: "var(--weight-medium)" }}>{ar?.in}</td>
                                  <td className="td num" style={{ color: "#475569" }}>{ar?.out}</td>
                                  <td className="td num">{ar?.wk}</td>
                                  <td className="td num" style={__sx(`color: ${ar?.lc ?? ""}; font-weight: var(--weight-medium);`)}>{ar?.late}</td>
                                  <td className="td num" style={{ color: "#6d28d9", fontWeight: "var(--weight-medium)" }}>{ar?.ot}</td>
                                  <td className="td" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{ar?.src}</td>
                                  <td className="td">
                                    <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-medium); white-space: nowrap; background: ${ar?.pb ?? ""}; color: ${ar?.pf ?? ""};`)}>{ar?.pt}</span>
                                  </td>
                                  <td className="td">
                                    <button type="button" className="abtn" onClick={ar?.fix}>Fix</button>
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <aside className="gc-side" style={{ width: "320px", flexShrink: "0", borderLeft: "1px solid #eef2f6", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", background: "#fbfcfe" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Correction requests</div>
                      {__list(v.fixes).map((fx, $index) => (<React.Fragment key={$index}>
                          <div style={{ padding: "12px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{fx?.n}</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{fx?.t}</div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button type="button" className="abtn" onClick={fx?.no}>Reject</button>
                              <button type="button" className="btn solid sm" onClick={fx?.yes}>Accept</button>
                            </div>
                          </div>
                        </React.Fragment>))}
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", marginTop: "4px" }}>Today’s rules</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                        <div>• 10 minutes grace after shift start</div>
                        <div>• 3 lates in a month = 1 day’s pay cut</div>
                        <div>• Under 4 hours worked = half day</div>
                        <div>• Overtime paid at 2× hourly basic</div>
                      </div>
                      <__Link href="/hr-setup" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Change rules in HR setup</__Link>
                    </aside>
                  </div>
                </>) : null}
                {v.isMonth ? (<>
                  <div style={{ overflowX: "auto", padding: "4px 0 8px" }}>
                    <table style={{ borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
                      <thead>
                        <tr>
                          <th className="th" style={{ position: "sticky", left: "0", background: "#fff", minWidth: "170px" }}>Staff</th>
                          {__list(v.days).map((dy, $index) => (<React.Fragment key={$index}>
                              <th style={__sx(`width: 30px; padding: 8px 0; text-align: center; font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${dy?.c ?? ""}; border-bottom: 1px solid #e2e8f0;`)}>{dy?.d}<div style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>{dy?.w}</div></th>
                            </React.Fragment>))}
                          <th className="th" style={{ textAlign: "right" }}>P</th>
                          <th className="th" style={{ textAlign: "right" }}>L</th>
                          <th className="th" style={{ textAlign: "right" }}>A</th>
                          <th className="th" style={{ textAlign: "right" }}>Lv</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.reg).map((rg, $index) => (<React.Fragment key={$index}>
                            <tr>
                              <td style={{ position: "sticky", left: "0", background: "#fff", padding: "6px 12px", borderBottom: "1px solid #eef2f6", fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs-plus)", whiteSpace: "nowrap" }}>{rg?.n}</td>
                              {__list(rg?.cells).map((ce, $index) => (<React.Fragment key={$index}>
                                  <td style={{ padding: "3px", borderBottom: "1px solid #eef2f6", textAlign: "center" }}>
                                    <span style={__sx(`display: inline-flex; width: 24px; height: 24px; border-radius: var(--radius-md); align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${ce?.b ?? ""}; color: ${ce?.f ?? ""};`)}>{ce?.t}</span>
                                  </td>
                                </React.Fragment>))}
                              <td className="td num" style={{ textAlign: "right", padding: "6px 10px", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{rg?.p}</td>
                              <td className="td num" style={{ textAlign: "right", padding: "6px 10px", color: "#b45309" }}>{rg?.l}</td>
                              <td className="td num" style={{ textAlign: "right", padding: "6px 10px", color: "#b83210" }}>{rg?.a}</td>
                              <td className="td num" style={{ textAlign: "right", padding: "6px 10px", color: "#1d4ed8" }}>{rg?.lv}</td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", gap: "14px", padding: "12px 16px", borderTop: "1px solid #eef2f6", fontSize: "var(--text-xs-plus)", color: "#475569", flexWrap: "wrap" }}>
                    {__list(v.legend).map((lg, $index) => (<React.Fragment key={$index}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={__sx(`width: 18px; height: 18px; border-radius: var(--radius-sm); background: ${lg?.b ?? ""}; color: ${lg?.f ?? ""}; font-size: var(--text-2xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{lg?.t}</span>{lg?.l}</span>
                      </React.Fragment>))}
                    <span style={{ flexGrow: "1" }} />
                    <button type="button" className="abtn" onClick={v.printReg}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
  <rect x="6" y="14" width="12" height="8" rx="1" />
</svg>Print register</button>
                  </div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
