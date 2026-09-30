'use client';
// Generated from design/templates/staff-hr/Payroll.dc.html by scripts/convert-design.mjs.
// Payroll — Staff & HR — Payroll.
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
// per code: [days payable (of 30), ot, incentive, cuts (late/absence), advance+loan, method]
var PAY = { 'EMP-0118': [30, 0, 4500, 0, 0, 'bank'], 'EMP-0142': [30, 350, 1200, 0, 3400, 'bkash'], 'EMP-0151': [29, 0, 900, 533, 0, 'bkash'], 'EMP-0121': [30, 0, 3800, 0, 5000, 'bank'], 'EMP-0149': [30, 0, 600, 0, 0, 'bank'], 'EMP-0160': [30, 0, 400, 533, 0, 'cash'], 'EMP-0133': [30, 1350, 0, 0, 2500, 'bkash'], 'EMP-0155': [28, 1170, 0, 933, 0, 'cash'], 'EMP-0145': [30, 0, 3150, 0, 0, 'bkash'], 'EMP-0163': [30, 1250, 0, 0, 0, 'cash'], 'EMP-0137': [30, 0, 500, 0, 0, 'bank'], 'EMP-0158': [30, 0, 0, 0, 0, 'bank'], 'EMP-0161': [30, 0, 0, 0, 0, 'bank'] };
var MM = { bank: ['Bank', '#e0f3fb', '#075985'], bkash: ['bKash', '#fce7f3', '#9d174d'], cash: ['Cash', '#e7f8f1', '#047857'] };
var STEPS = [['Check attendance', 'Lates, absences, overtime'], ['Review sheet', 'Edit one-time lines'], ['Owner approval', 'Locks the numbers'], ['Pay', 'Bank, bKash or cash'], ['Payslips', 'SMS, WhatsApp, print']];
function words(n) { return 'Taka ' + bdt(n).replace('৳', '') + ' only'; }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var step = +(s.step || this.props.step || 2), run = s.run || 'sep', pk = s.pk || 'EMP-0142', extra = s.extra || {};
    var rows = STAFF.map(function (r, i) { return [r, i]; }).filter(function (x) { return PAY[x[0][0]]; });
    var T = { g: 0, ot: 0, inc: 0, cut: 0, adv: 0, net: 0 }, BM = { bank: [0, 0], bkash: [0, 0], cash: [0, 0] };
    var calc = function (r) { var p = PAY[r[0]]; var ex = extra[r[0]] || 0; return { g: r[6], ot: p[1], inc: p[2] + ex, cut: p[3], adv: p[4], net: r[6] + p[1] + p[2] + ex - p[3] - p[4] }; };
    rows.forEach(function (x) { var c = calc(x[0]); ['g', 'ot', 'inc', 'cut', 'adv', 'net'].forEach(function (k) { T[k] += c[k]; }); var m = PAY[x[0][0]][5]; BM[m][0]++; BM[m][1] += c.net; });
    var dash = function (n, neg) { return n ? (neg ? '−' : '') + bdt(n) : '—'; };
    var P = STAFF.filter(function (r) { return r[0] === pk; })[0], PI = STAFF.indexOf(P), pc = calc(P), pp = PAY[pk];
    var gross = P[6];
    var sep = run === 'sep';
    var v = {
      bonusRun: function () { toast(self, 'Festival bonus run: pick the festival, % of basic and who is eligible (6+ months).'); },
      runs: [['sep', 'Sep 2026', sep ? (step >= 5 ? 'Paid' : step >= 3 ? 'Approved' : 'Draft') : 'Draft', T.net, 'Pay day 1 Oct · 13 staff'], ['aug', 'Aug 2026', 'Paid', 294180, 'Paid 1 Sep · 13 staff'], ['jul', 'Jul 2026', 'Paid', 287460, 'Paid 1 Aug · 12 staff'], ['eid', 'Eid-ul-Adha bonus', 'Paid', 128000, 'Paid 22 May · 12 staff'], ['jun', 'Jun 2026', 'Paid', 283950, 'Paid 1 Jul · 12 staff']].map(function (x) { var on = x[0] === run; var paid = x[2] === 'Paid'; return { l: x[1], pt: x[2], pb: paid ? '#e7f8f1' : x[2] === 'Approved' ? '#e0f2fe' : '#fff4e0', pf: paid ? '#047857' : x[2] === 'Approved' ? '#075985' : '#a14f06', amt: bdt(x[3]), sub: x[4], on: on, bd: on ? '#003087' : '#e6eaf0', bg: on ? '#f5f8ff' : '#fff', pick: function () { self.setState({ run: x[0] }); if (x[0] !== 'sep') toast(self, x[1] + ' is paid and locked — open to reprint payslips.'); } }; }),
      steps: STEPS.map(function (x, i) { var n = i + 1; var done = n < step, cur = n === step; return { l: x[0], s: x[1], n: done ? '✓' : n, dot: done ? '#10b981' : cur ? '#003087' : '#cbd5e1', bg: cur ? '#f5f8ff' : 'transparent', fg: done || cur ? '#0f172a' : '#94a3b8' }; }),
      runL: 'September 2026', xls: function () { toast(self, 'Salary sheet downloaded as Excel.'); }, prt: function () { toast(self, 'Salary sheet sent to the printer.'); },
      rows: rows.map(function (x) { var r = x[0], c = calc(r), p = PAY[r[0]], m = MM[p[5]]; return assign(av(r[1], x[1]), { n: r[1], des: r[2], link: PROFILE, days: p[0] + ' / 30', dc: p[0] < 30 ? '#b83210' : '#334155', g: bdt(c.g), ot: dash(c.ot), inc: dash(c.inc), cut: dash(c.cut, 1), adv: dash(c.adv, 1), net: bdt(c.net), m: m[0], mb: m[1], mf: m[2], bg: r[0] === pk ? '#f5f8ff' : 'transparent', pick: function () { self.setState({ pk: r[0] }); } }); }),
      nPaid: rows.length, tG: bdt(T.g), tOt: bdt(T.ot), tInc: bdt(T.inc), tCut: '−' + bdt(T.cut), tAdv: '−' + bdt(T.adv), tNet: bdt(T.net),
      ps: assign(av(P[1], PI), { n: P[1], code: P[0], des: P[2] + ' · ' + P[4], link: PROFILE, net: bdt(pc.net), words: words(pc.net) }),
      earn: [['Basic (55%)', Math.round(gross * .55)], ['House rent (25%)', Math.round(gross * .25)], ['Medical', Math.round(gross * .075)], ['Transport', Math.round(gross * .075)], ['Mobile', gross - Math.round(gross * .55) - Math.round(gross * .25) - 2 * Math.round(gross * .075)], ['Overtime', pc.ot], ['Sales incentive', pc.inc]].filter(function (x) { return x[1]; }).map(function (x) { return { l: x[0], v: bdt(x[1]) }; }),
      ded: [['Late / absence', pc.cut], ['Advance recovery', pk === 'EMP-0142' ? 1000 : pk === 'EMP-0133' ? 2500 : 0], ['Loan instalment', pk === 'EMP-0142' ? 2400 : pk === 'EMP-0121' ? 5000 : 0]].filter(function (x) { return x[1]; }).map(function (x) { return { l: x[0], v: '−' + bdt(x[1]) }; }),
      addLine: function () { var n = assign({}, extra); n[pk] = (n[pk] || 0) + 500; self.setState({ extra: n }); toast(self, '৳500 one-time bonus added for ' + P[1] + '.'); },
      actT: ['Before you continue', 'Ready for approval?', 'Owner approval', 'Pay ' + bdt(T.net), 'Send payslips'][step - 1],
      byM: [['bank', 'Bank transfer', '#0a5bd0'], ['bkash', 'bKash', '#db2777'], ['cash', 'Cash', '#10b981']].map(function (x) { return { l: x[1], c: x[2], n: BM[x[0]][0], v: bdt(BM[x[0]][1]) }; }),
      checks: (step <= 2 ? [['✓', 'All attendance fixes closed', '#047857'], ['✓', 'Leave for September approved', '#047857'], ['!', 'Jannatul Ferdous has no bank account — add it or pay by bKash', '#b45309']] : step === 3 ? [['✓', 'Sheet reviewed by Rumana Islam (Accounts)', '#047857'], ['!', 'Numbers lock once you approve', '#b45309']] : step === 4 ? [['✓', 'Approved by you · 19 Sep 2026', '#047857']] : [['✓', 'Paid · 1 Oct 2026', '#047857'], ['✓', 'Salary expense posted to Accounting', '#047857']]).map(function (c) { return { i: c[0], t: c[1], c: c[2] }; }),
      isPay: step === 4, canBack: step > 1 && step < 5,
      actBtn: ['Attendance checked — next', 'Send for owner approval', 'Approve and lock', 'Mark as paid', 'Send payslips by SMS'][step - 1],
      advance: function () { if (step < 5) { self.setState({ step: step + 1 }); toast(self, ['Attendance locked for September.', 'Sent to the owner for approval.', 'Approved. Numbers are locked.', 'Marked as paid. Advances and loan balances updated.'][step - 1]); } else toast(self, 'Payslips sent to 13 staff by SMS. Print copies are ready.'); },
      back: function () { self.setState({ step: step - 1 }); }
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.pcard{overflow-x:auto}.pcard th,.pcard td{white-space:normal;padding-left:8px!important;padding-right:8px!important}.pcard th{font-size:10.5px!important;letter-spacing:.04em!important}

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

export default class PayrollScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Payroll">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "2150px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="hr-payroll" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Staff & HR"} page="Payroll" placeholder="Search staff by name, phone or code" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Attendance, leave, overtime, sales incentive, advances and loans flow in by themselves. Check the sheet, approve, pay, send payslips.</div>
                <button type="button" className="btn line" onClick={v.bonusRun}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="8" width="18" height="4" rx="1" />
                    <path d="M12 8v13" />
                    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                  </svg>
                  <span>Festival bonus run</span>
                </button>
                <__Link href="/hr-setup" className="btn line">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 4h-7" />
                    <path d="M10 4H3" />
                    <path d="M21 12h-9" />
                    <path d="M8 12H3" />
                    <path d="M21 20h-5" />
                    <path d="M12 20H3" />
                    <path d="M14 2v4" />
                    <path d="M8 10v4" />
                    <path d="M16 18v4" />
                  </svg>
                  <span>Salary components</span>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "12px" }}>
                {__list(v.runs).map((rn, $index) => (<React.Fragment key={$index}>
                    <button type="button" onClick={rn?.pick} aria-pressed={rn?.on} style={__sx(`text-align: left; padding: 14px 16px; border-radius: 16px; border: 1.5px solid ${rn?.bd ?? ""}; background: ${rn?.bg ?? ""}; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 6px;`)}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", flexGrow: "1" }}>{rn?.l}</span>
                        <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; background: ${rn?.pb ?? ""}; color: ${rn?.pf ?? ""};`)}>{rn?.pt}</span>
                      </div>
                      <div className="num" style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>{rn?.amt}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{rn?.sub}</div>
                    </button>
                  </React.Fragment>))}
              </div>
              <div className="pcard" style={{ padding: "14px", display: "flex", gap: "8px" }}>
                {__list(v.steps).map((sp, $index) => (<React.Fragment key={$index}>
                    <div style={__sx(`flex: 1; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: ${sp?.bg ?? ""};`)}>
                      <span style={__sx(`width: 28px; height: 28px; border-radius: 999px; background: ${sp?.dot ?? ""}; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;`)}>{sp?.n}</span>
                      <div>
                        <div style={__sx(`font-size: 13.5px; font-weight: 600; color: ${sp?.fg ?? ""};`)}>{sp?.l}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{sp?.s}</div>
                      </div>
                    </div>
                  </React.Fragment>))}
              </div>
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0" }}>
                  <section className="pcard" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef2f6" }}>
                      <h2 style={{ margin: "0", fontSize: "16px", flexGrow: "1" }}>Salary sheet · {v.runL}</h2>
                      <span style={{ fontSize: "12.5px", color: "#64748b" }}>Click a row to see the breakdown</span>
                      <button type="button" className="abtn" onClick={v.xls}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>Excel</button>
                      <button type="button" className="abtn" onClick={v.prt}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
  <rect x="6" y="14" width="12" height="8" rx="1" />
</svg>Print</button>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th">Staff</th>
                          <th className="th">Days</th>
                          <th className="th" style={{ textAlign: "right" }}>Gross</th>
                          <th className="th" style={{ textAlign: "right" }}>Overtime</th>
                          <th className="th" style={{ textAlign: "right" }}>Incentive</th>
                          <th className="th" style={{ textAlign: "right" }}>Cuts</th>
                          <th className="th" style={{ textAlign: "right" }}>Advance · loan</th>
                          <th className="th" style={{ textAlign: "right" }}>Net pay</th>
                          <th className="th">Pay by</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.rows).map((py, $index) => (<React.Fragment key={$index}>
                            <tr className="row" onClick={py?.pick} style={__sx(`cursor: pointer; background: ${py?.bg ?? ""};`)}>
                              <td className="td">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: 999px; background: ${py?.ab ?? ""}; color: ${py?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;`)}>{py?.ini}</span>
                                  <div style={{ minWidth: "0" }}>
                                    <__A href={py?.link} style={{ display: "block", fontWeight: "600", color: "#0f172a", textDecoration: "none" }}>{py?.n}</__A>
                                    <div style={{ fontSize: "12px", color: "#64748b" }}>{py?.des}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td num" style={__sx(`color: ${py?.dc ?? ""};`)}>{py?.days}</td>
                              <td className="td num" style={{ textAlign: "right" }}>{py?.g}</td>
                              <td className="td num" style={{ textAlign: "right", color: "#6d28d9" }}>{py?.ot}</td>
                              <td className="td num" style={{ textAlign: "right", color: "#047857" }}>{py?.inc}</td>
                              <td className="td num" style={{ textAlign: "right", color: "#b83210" }}>{py?.cut}</td>
                              <td className="td num" style={{ textAlign: "right", color: "#b83210" }}>{py?.adv}</td>
                              <td className="td num" style={{ textAlign: "right", fontWeight: "700", color: "#0f172a" }}>{py?.net}</td>
                              <td className="td">
                                <span style={__sx(`display: inline-flex; height: 24px; padding: 0 9px; border-radius: 6px; font-size: 12px; font-weight: 600; align-items: center; background: ${py?.mb ?? ""}; color: ${py?.mf ?? ""};`)}>{py?.m}</span>
                              </td>
                            </tr>
                          </React.Fragment>))}
                        <tr style={{ background: "#f8fafc" }}>
                          <td className="td" style={{ fontWeight: "700" }}>Total · {v.nPaid} staff</td>
                          <td className="td" />
                          <td className="td num" style={{ textAlign: "right", fontWeight: "700" }}>{v.tG}</td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "700", color: "#6d28d9" }}>{v.tOt}</td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "700", color: "#047857" }}>{v.tInc}</td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "700", color: "#b83210" }}>{v.tCut}</td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "700", color: "#b83210" }}>{v.tAdv}</td>
                          <td className="td num" style={{ textAlign: "right", fontWeight: "800", fontSize: "15px", color: "#0f172a" }}>{v.tNet}</td>
                          <td className="td" />
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ padding: "12px 16px", fontSize: "12.5px", color: "#64748b", borderTop: "1px solid #eef2f6" }}>Kamrul Islam is suspended — his salary is on hold and not in this run.</div>
                  </section>
                </div>
                <div style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <section className="pcard" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "600" }}>{v.actT}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {__list(v.byM).map((bm, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", padding: "10px 12px", borderRadius: "10px", background: "#f7f9fc" }}>
                            <span style={__sx(`width: 10px; height: 10px; border-radius: 999px; background: ${bm?.c ?? ""};`)} />
                            <span style={{ flexGrow: "1" }}>{bm?.l} <span style={{ color: "#64748b" }}>· {bm?.n} staff</span></span>
                            <span className="num" style={{ fontWeight: "700" }}>{bm?.v}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {__list(v.checks).map((ck, $index) => (<React.Fragment key={$index}>
                          <div style={__sx(`display: flex; gap: 8px; font-size: 13px; color: ${ck?.c ?? ""};`)}>
                            <span style={{ fontWeight: "700" }}>{ck?.i}</span>
                            <span>{ck?.t}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                    {v.isPay ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                        <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked="" style={{ accentColor: "#003087" }} />Bank file for 6 staff (BEFTN)</label>
                        <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked="" style={{ accentColor: "#003087" }} />bKash bulk payment for 4 staff</label>
                        <label style={{ display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked="" style={{ accentColor: "#003087" }} />Cash sign sheet for 3 staff</label>
                      </div>
                    </>) : null}
                    <button type="button" className="btn solid" onClick={v.advance} style={{ width: "100%" }}>{v.actBtn}</button>
                    {v.canBack ? (<>
                      <button type="button" className="btn line sm" onClick={v.back} style={{ width: "100%" }}>Go back a step</button>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={__sx(`width: 42px; height: 42px; flex-shrink: 0; border-radius: 999px; background: ${v.ps?.ab ?? ""}; color: ${v.ps?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;`)}>{v.ps?.ini}</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700" }}>{v.ps?.n}</div>
                        <div style={{ fontSize: "12.5px", opacity: ".75" }}>{v.ps?.code} · {v.ps?.des}</div>
                      </div>
                      <__A href={v.ps?.link} style={{ color: "#fff", fontSize: "12.5px", fontWeight: "600" }}>Profile</__A>
                    </div>
                    <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div className="psec" style={{ color: "#047857" }}>Earnings</div>
                      {__list(v.earn).map((er, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", fontSize: "13.5px", padding: "3px 0" }}>
                            <span style={{ flexGrow: "1", color: "#334155" }}>{er?.l}</span>
                            <span className="num" style={{ fontWeight: "600" }}>{er?.v}</span>
                          </div>
                        </React.Fragment>))}
                      <div className="psec" style={{ color: "#b83210", marginTop: "10px" }}>Deductions</div>
                      {__list(v.ded).map((dd, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", fontSize: "13.5px", padding: "3px 0" }}>
                            <span style={{ flexGrow: "1", color: "#334155" }}>{dd?.l}</span>
                            <span className="num" style={{ fontWeight: "600", color: "#b83210" }}>{dd?.v}</span>
                          </div>
                        </React.Fragment>))}
                      <div style={{ display: "flex", alignItems: "baseline", paddingTop: "10px", marginTop: "6px", borderTop: "1px dashed #cbd5e1" }}>
                        <span style={{ flexGrow: "1", fontWeight: "700" }}>Net pay</span>
                        <span className="num" style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{v.ps?.net}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{v.ps?.words}</div>
                      <button type="button" className="btn line sm" onClick={v.addLine} style={{ marginTop: "8px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span>Add a one-time line</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
