'use client';
// Generated from design/templates/staff-hr/Leave.dc.html by scripts/convert-design.mjs.
// Leave — Staff & HR — Leave.
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
var LT = { Casual: ['#e0f3fb', '#075985'], Sick: ['#ffece6', '#b83210'], Earned: ['#e7f8f1', '#047857'], Festival: ['#f3e8ff', '#6d28d9'], Unpaid: ['#f1f5f9', '#475569'] };
// idx, type, dates, days, balance after, reason, warn, status
var REQ = [[2, 'Casual', '24 – 25 Sep', '2 days', '5 casual', 'Cousin’s wedding in Cumilla', 'Dhanmondi will have 2 people off on 25 Sep', 'wait'], [4, 'Sick', '19 – 21 Sep', '3 days', '9 sick', 'Fever — doctor’s note attached', '', 'wait'], [6, 'Earned', '4 – 8 Oct', '5 days', '6 earned', 'Going home to Rangpur', '', 'wait'], [10, 'Casual', '29 Sep', '1 day', '7 casual', 'Bank and passport office work', '', 'wait'], [1, 'Casual', '10 Sep', '1 day', '8 casual', 'Child’s school meeting', '', 'ok'], [7, 'Unpaid', '2 – 3 Sep', '2 days', '—', 'Personal', '', 'no']];
var WEEK = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'req', rf = s.rf || 'wait', st = s.st || {};
    var stat = function (i) { return st[i] || REQ[i][7]; };
    var nWait = REQ.filter(function (_, i) { return stat(i) === 'wait'; }).length;
    var v = {
      apply: function () { toast(self, 'Pick staff, leave type and dates — the balance is checked for you.'); },
      kWait: String(nWait),
      tabs: pTabs(self, [{ k: 'req', label: 'Requests' }, { k: 'cal', label: 'Leave calendar' }, { k: 'bal', label: 'Balances' }], tab, 'tab', { req: nWait }),
      is_req: tab === 'req', is_cal: tab === 'cal', is_bal: tab === 'bal',
      rf: [['wait', 'Waiting'], ['ok', 'Approved'], ['no', 'Rejected'], ['all', 'All']].map(function (x) { var on = x[0] === rf; return { l: x[1], c: REQ.filter(function (_, i) { return x[0] === 'all' || stat(i) === x[0]; }).length, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ rf: x[0] }); } }; }),
      reqs: REQ.map(function (q, i) { return [q, i]; }).filter(function (x) { return rf === 'all' || stat(x[1]) === rf; }).map(function (x) { var q = x[0], i = x[1], r = STAFF[q[0]]; var t = LT[q[1]]; var ss = stat(i);
        var set = function (k, m, bad) { var n = assign({}, st); n[i] = k; self.setState({ st: n }); toast(self, m, bad); };
        return assign(av(r[1], q[0]), { n: r[1], des: r[2] + ' · ' + r[4], link: PROFILE, type: q[1] + ' leave', tb: t[0], tf: t[1], dates: q[2], days: q[3], bal: q[4], why: q[5], warn: !!q[6], wt: q[6], open: ss === 'wait', closed: ss !== 'wait', pt: ss === 'ok' ? 'Approved' : 'Rejected', pb: ss === 'ok' ? '#e7f8f1' : '#ffece6', pf: ss === 'ok' ? '#047857' : '#b83210',
          yes: function () { set('ok', r[1] + '’s leave approved. Roster and payroll updated.'); }, no: function () { set('no', r[1] + '’s leave rejected. SMS sent with your reason.', true); } }); }),
      calLeg: ['Casual', 'Sick', 'Earned', 'Festival'].map(function (k) { return { l: k, c: LT[k][1] }; }),
      wk: WEEK.map(function (l) { return { l: l }; }),
      cells: (function () { var out = []; var EV = { 10: [['Sadia · casual', 'Casual']], 19: [['Moumita · sick', 'Sick']], 20: [['Moumita · sick', 'Sick']], 21: [['Moumita · sick', 'Sick']], 24: [['Rafi · casual', 'Casual']], 25: [['Rafi · casual', 'Casual']], 29: [['Lamia · casual', 'Casual']], 2: [['Sabbir · unpaid', 'Unpaid']], 3: [['Sabbir · unpaid', 'Unpaid']] };
        for (var c = 0; c < 35; c++) { var d = c - 2; var inM = d >= 1 && d <= 30; var fri = c % 7 === 6;
          out.push({ d: inM ? d : '', dc: d === 19 ? '#003087' : fri ? '#94a3b8' : '#334155', bg: !inM ? 'transparent' : fri ? '#f8fafc' : '#fff', bd: !inM ? 'transparent' : d === 19 ? '#003087' : '#eef2f6', ev: inM && EV[d] ? EV[d].map(function (e) { var t = LT[e[1]]; return { t: e[0], b: t[0], f: t[1] }; }) : [] }); }
        return out; })(),
      bals: STAFF.map(function (r, i) { var used = [(i * 3) % 7, (i * 5) % 6, (i * 2) % 5, 0]; var tot = [10, 14, 6 + (i % 9), 11];
        var cols = ['#0a5bd0', '#e11d48', '#10b981', '#8b5cf6'];
        var c = tot.map(function (tv, k) { var left = tv - used[k]; return { t: left + ' / ' + tv, w: left / tv * 100 + '%', c: cols[k] }; });
        return assign(av(r[1], i), { n: r[1], des: r[2], link: PROFILE, c: c, u: i === 7 ? '2' : '0', tk: used[0] + used[1] + used[2] + (i === 7 ? 2 : 0) }); })
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

export default class LeaveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Leave">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1400px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="hr-leave" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Staff & HR"} page="Leave" placeholder="Search staff by name, phone or code" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Approve leave, see who is off, and keep balances right. Leave types follow the Bangladesh Labour Act by default. <__Link href="/hr-setup" style={{ fontWeight: "600" }}>Change in HR setup</__Link></div>
                <button type="button" className="btn solid" onClick={v.apply}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Apply on behalf</span>
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
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#a14f06" }}>{v.kWait}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Waiting for you</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Oldest: 2 days</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f2fe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#1d4ed8" }}>1</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Off today</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Moumita Das · sick</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#eef2f6", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>3</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Off this week</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>2 at Dhanmondi</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 3v18h18" />
                      <path d="M18 17V9" />
                      <path d="M13 17V5" />
                      <path d="M8 17v-3" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>86</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Days taken · 2026</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Across 14 staff</div>
                  </div>
                </div>
              </div>
              <section className="pcard" style={{ overflow: "hidden" }}>
                <div className="ptabs" role="tablist">
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" className={tb?.pcls} aria-selected={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                {v.is_req ? (<>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #eef2f6" }}>
                      {__list(v.rf).map((rx, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={rx?.cls} onClick={rx?.pick} style={{ height: "34px" }}>{rx?.l}<span style={{ fontSize: "11px", opacity: ".7" }}>{rx?.c}</span></button>
                        </React.Fragment>))}
                    </div>
                    {__list(v.reqs).map((lq, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderBottom: "1px solid #eef2f6" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: 999px; background: ${lq?.ab ?? ""}; color: ${lq?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;`)}>{lq?.ini}</span>
                            <div style={{ minWidth: "0" }}>
                              <__A href={lq?.link} style={{ display: "block", fontWeight: "600", color: "#0f172a", textDecoration: "none" }}>{lq?.n}</__A>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>{lq?.des}</div>
                            </div>
                          </div>
                          <div style={{ width: "170px", flexShrink: "0" }}>
                            <span style={__sx(`display: inline-flex; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; align-items: center; background: ${lq?.tb ?? ""}; color: ${lq?.tf ?? ""};`)}>{lq?.type}</span>
                          </div>
                          <div style={{ width: "190px", flexShrink: "0" }}>
                            <div style={{ fontWeight: "600", color: "#0f172a" }}>{lq?.dates}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{lq?.days} · balance after: {lq?.bal}</div>
                          </div>
                          <div style={{ flexGrow: "1", minWidth: "0", fontSize: "13px", color: "#334155" }}>{lq?.why}{lq?.warn ? (<>
  <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "600", color: "#b45309" }}>⚠ {lq?.wt}</div>
</>) : null}</div>
                          {lq?.open ? (<>
                            <div style={{ display: "flex", gap: "6px", flexShrink: "0" }}>
                              <button type="button" className="btn line sm" onClick={lq?.no}>Reject</button>
                              <button type="button" className="btn solid sm" onClick={lq?.yes}>Approve</button>
                            </div>
                          </>) : null}
                          {lq?.closed ? (<>
                            <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; background: ${lq?.pb ?? ""}; color: ${lq?.pf ?? ""};`)}>{lq?.pt}</span>
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.is_cal ? (<>
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "700" }}>September 2026</span>
                      <span style={{ flexGrow: "1" }} />
                      {__list(v.calLeg).map((cg, $index) => (<React.Fragment key={$index}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}><span style={__sx(`width: 12px; height: 12px; border-radius: 4px; background: ${cg?.c ?? ""};`)} />{cg?.l}</span>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px" }}>
                      {__list(v.wk).map((wn, $index) => (<React.Fragment key={$index}>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textAlign: "center", padding: "4px" }}>{wn?.l}</div>
                        </React.Fragment>))}
                      {__list(v.cells).map((cc, $index) => (<React.Fragment key={$index}>
                          <div style={__sx(`min-height: 96px; border-radius: 10px; border: 1px solid ${cc?.bd ?? ""}; background: ${cc?.bg ?? ""}; padding: 6px; display: flex; flex-direction: column; gap: 4px;`)}>
                            <span style={__sx(`font-size: 12px; font-weight: 600; color: ${cc?.dc ?? ""};`)}>{cc?.d}</span>
                            {__list(cc?.ev).map((ev, $index) => (<React.Fragment key={$index}>
                                <span style={__sx(`font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 6px; background: ${ev?.b ?? ""}; color: ${ev?.f ?? ""}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`)}>{ev?.t}</span>
                              </React.Fragment>))}
                          </div>
                        </React.Fragment>))}
                    </div>
                  </div>
                </>) : null}
                {v.is_bal ? (<>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th">Staff</th>
                        <th className="th">Casual · 10</th>
                        <th className="th">Sick · 14</th>
                        <th className="th">Earned</th>
                        <th className="th">Festival · 11</th>
                        <th className="th">Unpaid</th>
                        <th className="th">Taken 2026</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.bals).map((bl, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: 999px; background: ${bl?.ab ?? ""}; color: ${bl?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;`)}>{bl?.ini}</span>
                                <div style={{ minWidth: "0" }}>
                                  <__A href={bl?.link} style={{ display: "block", fontWeight: "600", color: "#0f172a", textDecoration: "none" }}>{bl?.n}</__A>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>{bl?.des}</div>
                                </div>
                              </div>
                            </td>
                            {__list(bl?.c).map((bc, $index) => (<React.Fragment key={$index}>
                                <td className="td">
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: "70px", height: "6px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                                      <div style={__sx(`width: ${bc?.w ?? ""}; height: 100%; background: ${bc?.c ?? ""};`)} />
                                    </div>
                                    <span className="num" style={{ fontSize: "13px", fontWeight: "600" }}>{bc?.t}</span>
                                  </div>
                                </td>
                              </React.Fragment>))}
                            <td className="td num" style={{ color: "#64748b" }}>{bl?.u}</td>
                            <td className="td num" style={{ fontWeight: "700" }}>{bl?.tk}</td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                  <div style={{ padding: "12px 16px", fontSize: "12.5px", color: "#64748b", borderTop: "1px solid #eef2f6" }}>Numbers show days left of the yearly allowance. Earned leave builds up at 1 day for every 18 days worked. <__Link href="/hr-setup" style={{ fontWeight: "600" }}>Leave policies</__Link></div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
