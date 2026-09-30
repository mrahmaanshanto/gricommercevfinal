'use client';
// Generated from design/templates/staff-hr/LoansAdvances.dc.html by scripts/convert-design.mjs.
// Loans & advances — Staff & HR — Loans & advances.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';

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
// idx, type, date, amount, paid, emi, next, status
var LN = [[6, 'Advance', '19 Sep 2026', 5000, 0, 2500, 'Oct 2026', 'req'], [1, 'Advance', '28 Aug 2026', 2000, 1000, 1000, 'Sep 2026', 'run'], [1, 'Loan', '1 Mar 2026', 24000, 14400, 2400, 'Sep 2026', 'run'], [3, 'Loan', '1 Jan 2026', 60000, 40000, 5000, 'Sep 2026', 'run'], [6, 'Advance', '5 Aug 2026', 5000, 2500, 2500, 'Sep 2026', 'run'], [8, 'Advance', '2 Jul 2026', 3000, 3000, 1500, '—', 'done'], [11, 'Loan', '1 Jun 2025', 50000, 50000, 5000, '—', 'done']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || 'open', st = s.st || {}, typ = s.typ || 'adv', amt = s.amt != null ? s.amt : '5000', n = s.n || '2';
    var stat = function (i) { return st[i] || LN[i][7]; };
    var out = 0; LN.forEach(function (l, i) { if (stat(i) === 'run') out += l[3] - l[4]; });
    var a = +String(amt).replace(/[^0-9]/g, '') || 0, emi = Math.ceil(a / (+n));
    var v = {
      kOut: bdt(out), kReq: String(LN.filter(function (_, i) { return stat(i) === 'req'; }).length),
      tabs: pTabs(self, [{ k: 'open', label: 'Running' }, { k: 'req', label: 'Requests' }, { k: 'done', label: 'Paid back' }], tab, 'tab', { open: LN.filter(function (_, i) { return stat(i) === 'run'; }).length, req: LN.filter(function (_, i) { return stat(i) === 'req'; }).length }),
      rows: LN.map(function (l, i) { return [l, i]; }).filter(function (x) { var k = stat(x[1]); return tab === 'open' ? k === 'run' : tab === 'req' ? k === 'req' : k === 'done' || k === 'no'; }).map(function (x) { var l = x[0], i = x[1], r = STAFF[l[0]], k = stat(i);
        // Writes one row's status; `null` puts it back to the demo data's own value.
        var put = function (v2) { self.setState(function (p) { var nn = assign({}, (p && p.st) || {}); if (v2 == null) delete nn[i]; else nn[i] = v2; return { st: nn }; }); };
        var prev = st[i] == null ? null : st[i], what = l[1].toLowerCase();
        return assign(av(r[1], l[0]), { n: r[1], des: r[2], link: PROFILE, type: l[1], d: l[2], amt: bdt(l[3]), w: l[4] / l[3] * 100 + '%', pd: bdt(l[4]) + ' of ' + bdt(l[3]), emi: bdt(l[5]), next: l[6], req: k === 'req', nreq: k !== 'req', pt: k === 'run' ? 'Running' : k === 'no' ? 'Rejected' : 'Paid back', pb: k === 'run' ? '#e0f2fe' : k === 'no' ? '#ffece6' : '#e7f8f1', pf: k === 'run' ? '#075985' : k === 'no' ? '#b83210' : '#047857',
          yes: function () { put('run'); __toast(r[1] + '’s ' + what + ' approved. ' + bdt(l[5]) + ' will be cut from October and November.', { undo: function () { put(prev); } }); },
          no: function () { __confirm({ title: 'Reject ' + r[1] + '’s ' + what + '?', body: bdt(l[3]) + ' ' + what + ' asked on ' + l[2] + '. ' + r[1] + ' will be told by SMS and no money is paid out.', confirmLabel: 'Reject ' + what, tone: 'danger' }).then(function (ok) { if (!ok) return; put('no'); __toast('Rejected. ' + r[1] + ' gets an SMS.', { tone: 'info' }); }); },
          yesAria: 'Approve ' + r[1] + '’s ' + what + ' of ' + bdt(l[3]), noAria: 'Reject ' + r[1] + '’s ' + what + ' of ' + bdt(l[3]) }); }),
      showNew: s.nw !== false, openNew: function () { self.setState({ nw: true }); }, closeNew: function () { self.setState({ nw: false }); },
      types: segv(self, [['adv', 'Advance'], ['loan', 'Loan']], typ, 'typ'),
      amt: amt, typeAmt: function (e) { self.setState({ amt: e.target.value }); }, n: n, setN: function (e) { self.setState({ n: e.target.value }); },
      emi: bdt(emi), emiSub: n + ' month' + (n === '1' ? '' : 's') + ' · no interest · shows on each payslip', over: typ === 'adv' && a > 4950,
      give: function () { toast(self, bdt(a) + ' ' + (typ === 'adv' ? 'advance' : 'loan') + ' saved. ' + bdt(emi) + ' will be cut each month.'); self.setState({ nw: false }); }
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.pcard{overflow-x:auto}
.plink{display:block;min-height:24px;line-height:24px}
.pexp{width:28px;height:28px;flex-shrink:0;padding:0;border:0;border-radius:var(--radius-lg);background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color 200ms}
.pexp:hover{background:#e2e8f0;color:#0f172a}
.pexp:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.pexp[aria-expanded="true"]{background:rgba(0,48,135,.1);color:#003087}

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
.td{padding:12px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
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

export default class LoansAdvancesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="LoansAdvances">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="hr-loans" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Staff & HR"} page={"Loans & advances"} placeholder="Search staff by name, phone or code" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title={"Loans & advances"} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Money given to staff ahead of salary. Instalments are cut from payroll by themselves until it is paid back.</div>
                <button type="button" className="btn solid" onClick={v.openNew}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Give advance or loan</span>
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
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{v.kOut}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Outstanding</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Still to recover</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#eef2f6", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="12" x="2" y="6" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>৳10,900</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Recover in September</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>From 3 salaries</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.kReq}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Requests waiting</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>From the staff app</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#003087" }}>50% of basic</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Limit</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Per advance · set in HR setup</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <section className="pcard" style={{ overflow: "hidden", flexGrow: "1", minWidth: "0" }}>
                  <div className="ptabs" role="tablist">
                    {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                        <button type="button" role="tab" className={tb?.pcls} aria-selected={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                      </React.Fragment>))}
                  </div>
                  <div className="gc-table-wrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th">Staff</th>
                          <th className="th">Type</th>
                          <th className="th">Given</th>
                          <th className="th" style={{ textAlign: "right" }}>Amount</th>
                          <th className="th">Paid back</th>
                          <th className="th" style={{ textAlign: "right" }}>Per month</th>
                          <th className="th">Next cut</th>
                          <th className="th">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.rows).map((ln, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td className="td">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <span style={__sx(`width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-full); background: ${ln?.ab ?? ""}; color: ${ln?.af ?? ""}; display: inline-flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{ln?.ini}</span>
                                  <div style={{ minWidth: "0" }}>
                                    <__A href={ln?.link} className="plink" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textDecoration: "none" }}>{ln?.n}</__A>
                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ln?.des}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td">{ln?.type}</td>
                              <td className="td" style={{ color: "#475569" }}>{ln?.d}</td>
                              <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>{ln?.amt}</td>
                              <td className="td" style={{ width: "170px" }}>
                                <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                                  <div style={__sx(`width: ${ln?.w ?? ""}; height: 100%; background: #10b981;`)} />
                                </div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "3px" }}>{ln?.pd}</div>
                              </td>
                              <td className="td num" style={{ textAlign: "right" }}>{ln?.emi}</td>
                              <td className="td" style={{ color: "#475569" }}>{ln?.next}</td>
                              <td className="td">
                                {ln?.req ? (<>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button type="button" className="abtn" onClick={ln?.no} aria-label={ln?.noAria}>Reject</button>
                                    <button type="button" className="btn solid sm" onClick={ln?.yes} aria-label={ln?.yesAria}>Approve</button>
                                  </div>
                                </>) : null}
                                {ln?.nreq ? (<>
                                  <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-medium); white-space: nowrap; background: ${ln?.pb ?? ""}; color: ${ln?.pf ?? ""};`)}>{ln?.pt}</span>
                                </>) : null}
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </section>
                {v.showNew ? (<>
                  <aside className="pcard fade gc-side" style={{ width: "380px", flexShrink: "0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-base)", flexGrow: "1" }}>Give advance or loan</h2>
                      <button type="button" className="ib" onClick={v.closeNew} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Staff</span>
                      <select className="inp" aria-label="Staff">
                        <option>Tareq Aziz · Stock keeper</option>
                        <option>Sadia Akter · Cashier</option>
                        <option>Rafi Ahmed · Sales associate</option>
                      </select>
                      <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Basic ৳9,900 · limit for one advance ৳4,950</span>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Type</span>
                      <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                        {__list(v.types).map((ty, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={ty?.pick} aria-pressed={ty?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${ty?.bg ?? ""}; color: ${ty?.fg ?? ""};`)}>{ty?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Amount</span>
                        <input className="inp num" value={v.amt} onInput={v.typeAmt} onChange={v.typeAmt} aria-label="Amount" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Pay back in</span>
                        <select className="inp" value={v.n} onChange={v.setN} aria-label="Instalments">
                          <option value="1">1 month</option>
                          <option value="2">2 months</option>
                          <option value="3">3 months</option>
                          <option value="6">6 months</option>
                          <option value="10">10 months</option>
                          <option value="12">12 months</option>
                        </select>
                      </label>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">First cut from</span>
                      <select className="inp" aria-label="Start">
                        <option>October 2026 salary</option>
                        <option>November 2026 salary</option>
                      </select>
                    </label>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#f5f8ff", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Cut every month</div>
                      <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.emi}</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.emiSub}</div>
                    </div>
                    {v.over ? (<>
                      <div style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#fff4e0", color: "#7a3b04", fontSize: "var(--text-xs-plus)" }}>More than the limit — the owner has to approve it.</div>
                    </>) : null}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Paid out by</span>
                      <select className="inp" aria-label="Paid by">
                        <option>Cash from Dhanmondi drawer</option>
                        <option>bKash</option>
                        <option>Bank transfer</option>
                      </select>
                    </label>
                    <button type="button" className="btn solid" onClick={v.give}>Save and pay out</button>
                  </aside>
                </>) : null}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
