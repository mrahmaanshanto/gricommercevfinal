'use client';
// Generated from design/templates/customers-crm/AllCustomers.dc.html by scripts/convert-design.mjs.
// AllCustomers — Customers CRM — All customers.
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
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var C = [
  { name: 'Nusrat Jahan', phone: '01552-3X1-907', email: 'nusrat.jahan@example.com', city: 'Dhaka', signup: '2 Mar 2026', orders: 14, spent: 58200, last: '12 Sep 2026', pts: 1845, level: 'Gold', status: 'Active', src: 'Facebook ad', f: ['repeat', 'big', 'cart'] },
  { name: 'Rafiq Uddin', phone: '01911-7X3-608', email: 'rafiq.u@example.com', city: 'Chattogram', signup: '19 Sep 2026', orders: 1, spent: 124500, last: '19 Sep 2026', pts: 0, level: 'Member', status: 'Active', src: 'Google', f: ['signToday', 'orderToday', 'big', 'week'] },
  { name: 'Farzana Akter', phone: '01711-2X4-518', email: 'farzana.a@example.com', city: 'Dhaka', signup: '11 Jan 2025', orders: 31, spent: 186400, last: '19 Sep 2026', pts: 4820, level: 'Platinum', status: 'Active', src: 'Invite a friend', f: ['orderToday', 'repeat', 'big'] },
  { name: 'Sadia Islam', phone: '01624-9X2-310', email: 'sadia.i@example.com', city: 'Sylhet', signup: '19 Sep 2026', orders: 0, spent: 0, last: '—', pts: 50, level: 'Member', status: 'Active', src: 'Facebook ad', f: ['signToday', 'noOrder', 'week'] },
  { name: 'Tanvir Ahmed', phone: '01914-6X2-045', email: 'tanvir.a@example.com', city: 'Khulna', signup: '8 May 2026', orders: 8, spent: 24300, last: '15 Sep 2026', pts: 640, level: 'Silver', status: 'COD blocked', src: 'Instagram', f: ['repeat', 'codBlock', 'pts'] },
  { name: 'Mahmudul Islam', phone: '01733-8X0-614', email: 'mahmud.i@example.com', city: 'Dhaka', signup: '14 Sep 2026', orders: 2, spent: 4650, last: '19 Sep 2026', pts: 92, level: 'Member', status: 'Active', src: 'TikTok', f: ['orderToday', 'week', 'cart'] },
  { name: 'Sabrina Chowdhury', phone: '01511-5X3-770', email: 'sabrina.c@example.com', city: 'Rajshahi', signup: '2 Feb 2026', orders: 3, spent: 2980, last: '28 Aug 2026', pts: 58, level: 'Member', status: 'Active', src: 'Shop counter (POS)', f: ['pts', 'bday'] },
  { name: 'Rakibul Hasan', phone: '01819-0X7-332', email: 'rakib.h@example.com', city: 'Dhaka', signup: '20 Jul 2025', orders: 19, spent: 72850, last: '16 Sep 2026', pts: 2310, level: 'Gold', status: 'Active', src: 'Facebook ad', f: ['repeat', 'big', 'bday'] },
  { name: 'Guest · 01822-1X5-947', phone: '01822-1X5-947', email: '—', city: 'Dhaka', signup: '18 Sep 2026', orders: 0, spent: 0, last: '—', pts: 0, level: 'Member', status: 'Active', src: 'Google', f: ['noOrder', 'cart', 'week'] },
  { name: 'Kamrul Hossain', phone: '01777-3X8-129', email: 'kamrul.h@example.com', city: 'Outside Dhaka', signup: '3 Apr 2026', orders: 6, spent: 9100, last: '1 Aug 2026', pts: 0, level: 'Member', status: 'Suspended', src: 'Facebook ad', f: ['suspended'] }
];
var VIEWS = [
  { k: 'all', label: 'All customers', n: 2452 }, { k: 'signToday', label: 'Signed up today', n: 14 }, { k: 'orderToday', label: 'Ordered today', n: 38 }, { k: 'week', label: 'New this week', n: 61 },
  { k: 'noOrder', label: 'Signed up, no order yet', n: 212 }, { k: 'repeat', label: 'Repeat buyers', n: 486 }, { k: 'big', label: 'Big spenders', n: 124 }, { k: 'cart', label: 'Left a cart', n: 31 },
  { k: 'pts', label: 'Points expiring', n: 64 }, { k: 'bday', label: 'Birthday this month', n: 97 }, { k: 'codBlock', label: 'COD blocked', n: 3 }, { k: 'suspended', label: 'Suspended', n: 6 }
];
var COLS = [
  { k: 'email', l: 'Email' }, { k: 'city', l: 'City' }, { k: 'signup', l: 'Signed up' }, { k: 'orders', l: 'Orders', al: 'right' }, { k: 'spent', l: 'Total spent', al: 'right' },
  { k: 'last', l: 'Last order' }, { k: 'pts', l: 'Points', al: 'right' }, { k: 'level', l: 'Level' }, { k: 'src', l: 'Came from' }, { k: 'status', l: 'Status' }
];
var DEFCUSTOM = { city: true, orders: true, spent: true, last: true, status: true };
var SCLS = { 'Active': 'badge b-received', 'Suspended': 'badge b-cancelled', 'COD blocked': 'badge b-approval' };
var LCLS = { Member: 'badge t-member', Silver: 'badge t-silver', Gold: 'badge t-gold', Platinum: 'badge t-plat' };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var view = s.view || 'all', mode = s.mode || 'full', pick = s.pick || DEFCUSTOM, sel = s.sel || {};
    var cols = COLS.filter(function (c) { return mode === 'full' || pick[c.k]; });
    var list = C.filter(function (c) { return view === 'all' || c.f.indexOf(view) >= 0; });
    var V = VIEWS.filter(function (v) { return v.k === view; })[0];
    var selN = list.filter(function (c) { return sel[c.phone]; }).length;
    var cell = function (c, k) {
      var v = c[k], o = { al: 'left', fw: 400, color: '#334155', isBadge: false, isText: true, cls: '', v: v };
      if (k === 'spent') { o.v = v ? bdt(v) : '—'; o.al = 'right'; o.fw = 600; o.color = '#0f172a'; }
      if (k === 'orders' || k === 'pts') { o.al = 'right'; o.v = typeof v === 'number' ? v.toLocaleString('en-IN') : v; }
      if (k === 'status' || k === 'level') { o.isBadge = true; o.isText = false; o.cls = k === 'status' ? SCLS[v] : LCLS[v]; }
      if (k === 'email' || k === 'signup' || k === 'last') o.color = '#64748b';
      return o;
    };
    return assign({
      views: VIEWS.map(function (v) { var on = v.k === view; return { label: v.label, count: v.n.toLocaleString('en-IN'), on: on, cls: on ? 'chip on' : 'chip', cBg: on ? 'rgba(0,48,135,.14)' : '#eef2f6', pick: function () { self.setState({ view: v.k, sel: {} }); } }; }),
      modes: [{ k: 'full', l: 'Full view' }, { k: 'custom', l: 'Custom view' }].map(function (m) { var on = m.k === mode; return { l: m.l, on: on, bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ mode: m.k, colsOpen: m.k === 'custom' }); } }; }),
      isCustom: mode === 'custom', colsOpen: mode === 'custom' && !!s.colsOpen, toggleCols: function () { self.setState({ colsOpen: !s.colsOpen }); },
      colChips: COLS.map(function (c) { var on = !!pick[c.k]; return { label: c.l, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = assign({}, pick); p[c.k] = !on; self.setState({ pick: p }); } }; }),
      fOpen: !!s.fOpen, toggleF: function () { self.setState({ fOpen: !s.fOpen }); }, fBtnCls: s.fOpen ? 'btn soft sm' : 'btn line sm', hasF: !!s.fApplied, fCount: 3,
      clearF: function () { self.setState({ fApplied: false }); }, applyF: function () { self.setState({ fApplied: true, fOpen: false }); toast(self, 'Filters applied.'); },
      saveView: function () { self.setState({ fOpen: false, fApplied: true }); toast(self, 'Saved as a view. It now shows with the other views.'); },
      print: function () { toast(self, 'Opening a print-ready list of ' + (V.n).toLocaleString('en-IN') + ' customers with the columns you see.'); },
      csv: function () { toast(self, 'Downloading ' + (selN || V.n).toLocaleString('en-IN') + ' customers as CSV — ' + cols.length + 2 + ' columns.'); },
      heads: cols.map(function (c) { return { l: c.l, al: c.al || 'left' }; }),
      rows: list.map(function (c) { var on = !!sel[c.phone]; return { name: c.name, phone: c.phone, initial: c.name.charAt(0), sel: on, bg: on ? '#f2f6fc' : 'transparent', cells: cols.map(function (k) { return cell(c, k.k); }), toggle: function () { var o = assign({}, sel); o[c.phone] = !on; self.setState({ sel: o }); } }; }),
      allSel: list.length > 0 && selN === list.length, toggleAll: function () { var o = {}; if (selN !== list.length) list.forEach(function (c) { o[c.phone] = true; }); self.setState({ sel: o }); },
      hasSel: selN > 0, selCount: selN,
      bulkSms: function () { toast(self, 'SMS composer opened for ' + selN + ' customers.'); }, bulkCoupon: function () { toast(self, 'A one-time coupon was assigned to ' + selN + ' customers.'); }, bulkTag: function () { toast(self, 'Tag added to ' + selN + ' customers.'); },
      empty: !list.length, shown: list.length, total: V.n.toLocaleString('en-IN')
    }, msgV(s));
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

export default class AllCustomersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllCustomers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1900px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="customers" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Customers" page="All customers" placeholder="Search customer by name or phone" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>2,452</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>All customers</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>+86 this month</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>14</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Signed up today</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>9 from Facebook ads</div>
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
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>38</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Ordered today</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>৳1,24,600 in sales</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f2fe", color: "#0a5bd0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                      <path d="M16 17h6v-6" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0a5bd0" }}>734</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Active in 30 days</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>30% of all customers</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.9 4.9 14.2 14.2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#b83210" }}>9</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Suspended or blocked</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>3 blocked for COD</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Every person who signed up or bought from you. Pick a ready view, or filter on anything.</div>
                <button type="button" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add customer</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {__list(v.views).map((v, $index) => (<React.Fragment key={$index}>
                    <button type="button" className={v?.cls} aria-pressed={v?.on} onClick={v?.pick} style={{ height: "36px" }}>{v?.label}<span style={__sx(`min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: ${v?.cBg ?? ""}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;`)}>{v?.count}</span></button>
                  </React.Fragment>))}
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
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <label style={{ position: "relative", width: "360px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "#64748b" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp" type="search" placeholder="Name, phone, email or order number" aria-label="Search customers" style={{ paddingLeft: "44px" }} />
                  </label>
                  <button type="button" className={v.fBtnCls} onClick={v.toggleF}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Filters</span>
                    {v.hasF ? (<>
                      <span style={{ minWidth: "20px", height: "20px", borderRadius: "999px", background: "#003087", color: "#fff", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{v.fCount}</span>
                    </>) : null}
                  </button>
                  <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                    {__list(v.modes).map((m, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={m?.pick} aria-pressed={m?.on} style={__sx(`height: 34px; padding: 0 14px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""};`)}>{m?.l}</button>
                      </React.Fragment>))}
                  </div>
                  {v.isCustom ? (<>
                    <button type="button" className="btn line sm" onClick={v.toggleCols}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                        <path d="M15 3v18" />
                      </svg>
                      <span>Columns</span>
                    </button>
                  </>) : null}
                  <span style={{ flexGrow: "1" }} />
                  <button type="button" className="btn line sm" onClick={v.print}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                      <rect x="6" y="14" width="12" height="8" rx="1" />
                    </svg>
                    <span>Print</span>
                  </button>
                  <button type="button" className="btn line sm" onClick={v.csv}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M12 15V3" />
                    </svg>
                    <span>Download CSV</span>
                  </button>
                </div>
                {v.fOpen ? (<>
                  <div className="fade" style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Signed up</span>
                      <select className="inp" aria-label="Signed up">
                        <option>Any time</option>
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>This year</option>
                        <option>Pick dates</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Last order</span>
                      <select className="inp" aria-label="Last order">
                        <option>Any time</option>
                        <option>Today</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>More than 60 days ago</option>
                        <option>Never ordered</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Total spent</span>
                      <select className="inp" aria-label="Total spent">
                        <option>Any amount</option>
                        <option>Under ৳1,000</option>
                        <option>৳1,000 – ৳10,000</option>
                        <option>৳10,000 – ৳50,000</option>
                        <option>Above ৳50,000</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Number of orders</span>
                      <select className="inp" aria-label="Number of orders">
                        <option>Any</option>
                        <option>0 orders</option>
                        <option>1 order</option>
                        <option>2–4 orders</option>
                        <option>5+ orders</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">City or area</span>
                      <select className="inp" aria-label="City or area">
                        <option>All</option>
                        <option>Dhaka</option>
                        <option>Chattogram</option>
                        <option>Sylhet</option>
                        <option>Khulna</option>
                        <option>Rajshahi</option>
                        <option>Outside Dhaka</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Member level</span>
                      <select className="inp" aria-label="Member level">
                        <option>All</option>
                        <option>Member</option>
                        <option>Silver</option>
                        <option>Gold</option>
                        <option>Platinum</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Came from</span>
                      <select className="inp" aria-label="Came from">
                        <option>All</option>
                        <option>Facebook ad</option>
                        <option>Instagram</option>
                        <option>Google</option>
                        <option>TikTok</option>
                        <option>Invite a friend</option>
                        <option>Shop counter (POS)</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Paid with</span>
                      <select className="inp" aria-label="Paid with">
                        <option>Any</option>
                        <option>Cash on delivery</option>
                        <option>bKash</option>
                        <option>Nagad</option>
                        <option>Card</option>
                        <option>Wallet</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Account status</span>
                      <select className="inp" aria-label="Account status">
                        <option>All</option>
                        <option>Active</option>
                        <option>Suspended</option>
                        <option>COD blocked</option>
                        <option>Gateway blocked</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Has</span>
                      <select className="inp" aria-label="Has">
                        <option>Anything</option>
                        <option>Abandoned cart</option>
                        <option>Unused coupon</option>
                        <option>Points expiring</option>
                        <option>Open support ticket</option>
                        <option>Items in wishlist</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Tag</span>
                      <select className="inp" aria-label="Tag">
                        <option>Any</option>
                        <option>VIP</option>
                        <option>Wholesale</option>
                        <option>Influencer</option>
                        <option>Staff</option>
                        <option>Fraud watch</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Birthday</span>
                      <select className="inp" aria-label="Birthday">
                        <option>Any</option>
                        <option>This week</option>
                        <option>This month</option>
                      </select>
                    </label>
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn line sm" onClick={v.clearF}>Clear</button>
                      <button type="button" className="btn solid sm" onClick={v.applyF}>Show customers</button>
                      <button type="button" className="btn soft sm" onClick={v.saveView}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <span>Save as a view</span>
                      </button>
                    </div>
                  </div>
                </>) : null}
                {v.colsOpen ? (<>
                  <div className="fade" style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span className="lbl">Show columns:</span>
                    {__list(v.colChips).map((c, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "34px" }}>{c?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{c?.label}</button>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.hasSel ? (<>
                  <div className="fade" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#003087", color: "#fff", fontSize: "14px" }}>
                    <b>{v.selCount} selected</b>
                    <span style={{ flexGrow: "1" }} />
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.bulkSms}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                      <span>Send SMS</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.bulkCoupon}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M9 9h.01" />
                        <path d="m15 9-6 6" />
                        <path d="M15 15h.01" />
                      </svg>
                      <span>Assign coupon</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.bulkTag}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                        <circle cx="7.5" cy="7.5" r="1" />
                      </svg>
                      <span>Add tag</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.csv}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M12 15V3" />
                      </svg>
                      <span>Export</span>
                    </button>
                  </div>
                </>) : null}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th" style={{ width: "44px" }}>
                          <input type="checkbox" aria-label="Select all" checked={v.allSel} onChange={v.toggleAll} style={{ width: "18px", height: "18px" }} />
                        </th>
                        <th className="th">Customer</th>
                        {__list(v.heads).map((h, $index) => (<React.Fragment key={$index}>
                            <th className="th" style={__sx(`text-align: ${h?.al ?? ""};`)}>{h?.l}</th>
                          </React.Fragment>))}
                        <th className="th" />
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className="row" style={__sx(`background: ${r?.bg ?? ""};`)}>
                            <td className="td">
                              <input type="checkbox" aria-label={`Select ${r?.name ?? ""}`} checked={r?.sel} onChange={r?.toggle} style={{ width: "18px", height: "18px" }} />
                            </td>
                            <td className="td">
                              <__Link href="/customer-crm" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                                <span style={{ width: "38px", height: "38px", flexShrink: "0", borderRadius: "999px", background: "#e0f3fb", color: "#003087", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>{r?.initial}</span>
                                <span>
                                  <span style={{ display: "block", fontWeight: "600", color: "#0f172a" }}>{r?.name}</span>
                                  <span className="mono" style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{r?.phone}</span>
                                </span>
                              </__Link>
                            </td>
                            {__list(r?.cells).map((cl, $index) => (<React.Fragment key={$index}>
                                <td className="td" style={__sx(`text-align: ${cl?.al ?? ""}; font-weight: ${cl?.fw ?? ""}; color: ${cl?.color ?? ""}; white-space: nowrap;`)}>
                                  {cl?.isBadge ? (<>
                                    <span className={cl?.cls}>{cl?.v}</span>
                                  </>) : null}
                                  {cl?.isText ? (<>{cl?.v}</>) : null}
                                </td>
                              </React.Fragment>))}
                            <td className="td" style={{ textAlign: "right" }}>
                              <__Link href="/customer-crm" className="btn soft sm">Open <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></__Link>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                {v.empty ? (<>
                  <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>No customers match this view.</div>
                </>) : null}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", fontSize: "13px", color: "#64748b" }}>
                  <span style={{ flexGrow: "1" }}>Showing {v.shown} of {v.total} customers</span>
                  <span>Rows per page</span>
                  <select className="inp" aria-label="Rows per page" style={{ width: "90px", height: "36px" }}>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <button type="button" className="btn line sm">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="btn line sm">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
