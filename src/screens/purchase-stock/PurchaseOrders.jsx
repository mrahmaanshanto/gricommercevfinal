'use client';
// Generated from design/templates/purchase-stock/PurchaseOrders.dc.html by scripts/convert-design.mjs.
// PurchaseOrders — Purchase & Stock module — Purchase orders.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
var PO_ROWS = [
  { no: 'PO-2609-0024', date: '18 Sep 2026', supplier: 'Rahman Traders', got: 0, of: 120, total: 86400, paid: 0, due: '', s: 'approval' },
  { no: 'PO-2609-0023', date: '17 Sep 2026', supplier: 'Dhaka Beauty Imports', got: 0, of: 48, total: 38250, paid: 0, due: '', s: 'draft' },
  { no: 'PO-2609-0022', date: '16 Sep 2026', supplier: 'Chattogram Packaging Co.', got: 0, of: 500, total: 27500, paid: 0, due: '', s: 'approved' },
  { no: 'PO-2609-0021', date: '14 Sep 2026', supplier: 'Rahman Traders', got: 0, of: 200, total: 64800, paid: 0, due: '', s: 'approval' },
  { no: 'PO-2609-0020', date: '12 Sep 2026', supplier: 'Nabil Fashion House', got: 140, of: 240, total: 112600, paid: 50000, due: 'Due 12 Oct 2026', s: 'partial' },
  { no: 'PO-2609-0019', date: '5 Sep 2026', supplier: 'Dhaka Beauty Imports', got: 96, of: 96, total: 52980, paid: 52980, due: '', s: 'received' },
  { no: 'PO-2608-0017', date: '20 Aug 2026', supplier: 'Mim Enterprise', got: 60, of: 60, total: 41300, paid: 0, due: 'Overdue 15 days', s: 'received', overdue: true },
  { no: 'PO-2609-0018', date: '3 Sep 2026', supplier: 'Rahman Traders', got: 0, of: 150, total: 48600, paid: 0, due: 'Due on delivery', s: 'ordered' },
  { no: 'PO-2608-0015', date: '12 Aug 2026', supplier: 'Rahman Traders', got: 300, of: 300, total: 95000, paid: 95000, due: '', s: 'closed' },
  { no: 'PO-2608-0014', date: '8 Aug 2026', supplier: 'Nabil Fashion House', got: 0, of: 80, total: 22000, paid: 0, due: '', s: 'cancelled' }
];
var PO_STATUS = [
  { k: 'all', label: 'All' }, { k: 'draft', label: 'Draft' }, { k: 'approval', label: 'Waiting approval' }, { k: 'approved', label: 'Approved' },
  { k: 'ordered', label: 'Ordered' }, { k: 'partial', label: 'Partly received' }, { k: 'received', label: 'Received' }, { k: 'closed', label: 'Closed' }, { k: 'cancelled', label: 'Cancelled' }
];
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var tab = (this.state && this.state.tab) || 'all';
    var names = {}; PO_STATUS.forEach(function (x) { names[x.k] = x.label; });
    var tabs = PO_STATUS.map(function (x) {
      var n = x.k === 'all' ? PO_ROWS.length : PO_ROWS.filter(function (r) { return r.s === x.k; }).length;
      var on = x.k === tab;
      return { label: x.label, count: n, on: on, cls: on ? 'tab on' : 'tab', countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { self.setState({ tab: x.k }); } };
    });
    var rows = PO_ROWS.filter(function (r) { return tab === 'all' || r.s === tab; }).map(function (r) {
      var dueAmt = r.total - r.paid;
      var pay, paySub, payColor = '#334155';
      if (r.s === 'cancelled') { pay = '—'; paySub = ''; }
      else if (dueAmt <= 0) { pay = 'Paid'; paySub = 'in full'; payColor = '#047857'; }
      else if (r.paid > 0) { pay = bdt(dueAmt) + ' due'; paySub = r.due; }
      else if (r.overdue) { pay = bdt(dueAmt) + ' due'; paySub = r.due; payColor = '#b83210'; }
      else { pay = 'Not paid'; paySub = r.due || 'Due after delivery'; }
      var pct = r.of ? Math.round(r.got / r.of * 100) : 0;
      return {
        no: r.no, date: r.date, supplier: r.supplier, total: bdt(r.total),
        recv: r.got + ' / ' + r.of, pct: pct + '%', barColor: pct >= 100 ? '#10b981' : '#ff9800',
        pay: pay, paySub: paySub, payColor: r.overdue ? '#b83210' : payColor,
        status: names[r.s], badge: 'badge b-' + r.s
      };
    });
    return { tabs: tabs, rows: rows, empty: rows.length === 0, showApproval: function () { self.setState({ tab: 'approval' }); } };
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
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class PurchaseOrdersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PurchaseOrders">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1350px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-orders" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Purchase" page="Purchase orders" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <__Link href="/new-po" className="card" style={{ flexGrow: "1", flexBasis: "0", minWidth: "0", display: "flex", alignItems: "center", gap: "14px", padding: "18px", textDecoration: "none", background: "#003087", color: "#ffffff" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "rgba(255,255,255,0.14)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "15px", lineHeight: "22px", fontWeight: "600" }}>New purchase order</span>
                    <span style={{ display: "block", marginTop: "2px", fontSize: "13px", lineHeight: "18px", color: "rgba(255,255,255,0.8)" }}>Blank, copy old, CSV or low stock</span>
                  </span>
                </__Link>
                <__Link href="/receive-goods" className="card" style={{ flexGrow: "1", flexBasis: "0", minWidth: "0", display: "flex", alignItems: "center", gap: "14px", padding: "18px", textDecoration: "none", background: "#ffffff", color: "#0f172a" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "15px", lineHeight: "22px", fontWeight: "600" }}>Receive goods</span>
                    <span style={{ display: "block", marginTop: "2px", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Scan items as they arrive</span>
                  </span>
                </__Link>
                <__Link href="/requests" className="card" style={{ flexGrow: "1", flexBasis: "0", minWidth: "0", display: "flex", alignItems: "center", gap: "14px", padding: "18px", textDecoration: "none", background: "#ffffff", color: "#0f172a" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="8" height="4" x="8" y="2" rx="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="M12 11h4" />
                      <path d="M12 16h4" />
                      <path d="M8 11h.01" />
                      <path d="M8 16h.01" />
                    </svg>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "15px", lineHeight: "22px", fontWeight: "600" }}>Staff requests</span>
                    <span style={{ display: "block", marginTop: "2px", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>4 waiting for you</span>
                  </span>
                </__Link>
                <__Link href="/suppliers" className="card" style={{ flexGrow: "1", flexBasis: "0", minWidth: "0", display: "flex", alignItems: "center", gap: "14px", padding: "18px", textDecoration: "none", background: "#ffffff", color: "#0f172a" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: "15px", lineHeight: "22px", fontWeight: "600" }}>Supplier dues</span>
                    <span style={{ display: "block", marginTop: "2px", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>৳1,03,900 due · 1 overdue</span>
                  </span>
                </__Link>
              </div>
              <div role="status" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "12px", background: "#fff4e0" }}>
                <span style={{ color: "#a14f06" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#5c2d03" }}><strong style={{ fontWeight: "600" }}>2 orders are waiting for your approval.</strong> Staff orders above ৳50,000 need an admin to approve. Your own orders as admin go straight through.</div>
                <button type="button" className="btn warnbtn sm" onClick={v.showApproval}>Review now</button>
              </div>
              <section className="card" style={{ display: "flex", flexDirection: "column", minHeight: "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}<span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: ${tb?.countBg ?? ""}; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span></button>
                    </React.Fragment>))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" }}>
                  <label style={{ position: "relative", flexGrow: "1", maxWidth: "420px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "#64748b" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp" type="search" placeholder="Scan PO barcode or type PO no. / supplier" aria-label="Find a purchase order" style={{ paddingLeft: "44px" }} />
                  </label>
                  <button type="button" className="chip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>All suppliers</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="chip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                    <span>This month</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div style={{ flexGrow: "1" }} />
                  <button type="button" className="btn line sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="M17 8 12 3 7 8" />
                      <path d="M12 3v12" />
                    </svg>
                    <span>Export</span>
                  </button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th">Purchase order</th>
                      <th className="th">Supplier</th>
                      <th className="th">Items received</th>
                      <th className="th" style={{ textAlign: "right" }}>Total</th>
                      <th className="th">Payment</th>
                      <th className="th">Status</th>
                      <th className="th" style={{ width: "56px" }}>
                        <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row fade">
                          <td className="td">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ color: "#64748b" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                  <path d="M8 7v10" />
                                  <path d="M12 7v10" />
                                  <path d="M17 7v10" />
                                </svg>
                              </span>
                              <div>
                                <__Link href="/po-detail" className="mono" style={{ fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>{r?.no}</__Link>
                                <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.date}</div>
                              </div>
                            </div>
                          </td>
                          <td className="td" style={{ fontWeight: "500" }}>{r?.supplier}</td>
                          <td className="td">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "96px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                                <div style={__sx(`height: 8px; border-radius: 999px; width: ${r?.pct ?? ""}; background: ${r?.barColor ?? ""};`)} />
                              </div>
                              <span style={{ fontSize: "13px", color: "#475569" }}>{r?.recv}</span>
                            </div>
                          </td>
                          <td className="td" style={{ textAlign: "right", fontWeight: "600" }}>{r?.total}</td>
                          <td className="td">
                            <div style={__sx(`font-size: 13px; line-height: 18px; font-weight: 500; color: ${r?.payColor ?? ""};`)}>{r?.pay}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.paySub}</div>
                          </td>
                          <td className="td">
                            <span className={r?.badge}>{r?.status}</span>
                          </td>
                          <td className="td">
                            <__Link href="/po-detail" className="ib" aria-label={`Open ${r?.no ?? ""}`}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </__Link>
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.empty ? (<>
                  <div style={{ padding: "48px 16px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>No orders with this status. Try another tab.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
