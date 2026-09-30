'use client';
// Generated from design/templates/purchase-stock/NewPO.dc.html by scripts/convert-design.mjs.
// NewPO — Purchase & Stock module — New purchase order.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
var CATALOG = [
  { name: 'Aloe Vera Soothing Gel 300ml', code: '8941100500112', cost: 320, vat: 15 },
  { name: 'Sunscreen SPF 50 · 50ml', code: '8941100500235', cost: 540, vat: 15 },
  { name: 'Rice Water Cleanser 150ml', code: '8941100500341', cost: 410, vat: 15 },
  { name: 'Cotton Face Towel (pack of 3)', code: '8941100500457', cost: 180, vat: 7.5 },
  { name: 'Lip Balm Strawberry 4g', code: '8941100500563', cost: 95, vat: 15 }
];
var TERMS = [{ d: 0, label: 'Cash now' }, { d: 3, label: '3 days' }, { d: 7, label: '7 days' }, { d: 10, label: '10 days' }, { d: 15, label: '15 days' }, { d: 30, label: '30 days' }, { d: 45, label: '45 days' }];
class Component extends DCLogic {
  st() {
    var s = this.state || {};
    return {
      lines: s.lines || [{ i: 0, qty: 60 }, { i: 1, qty: 48 }, { i: 2, qty: 40 }],
      ship: s.ship != null ? s.ship : 1500, customs: s.customs != null ? s.customs : 0, courier: s.courier != null ? s.courier : 600,
      split: s.split || 'value', term: s.term != null ? s.term : 30, next: s.next || 3, toast: s.toast || '', flash: s.flash
    };
  }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.st(), limit = this.props.approvalLimit ?? 50000;
    var set = function (patch) { self.setState(patch); };
    var sub = 0, vat = 0, pieces = 0;
    s.lines.forEach(function (l) { var p = CATALOG[l.i]; sub += p.cost * l.qty; vat += p.cost * l.qty * p.vat / 100; pieces += l.qty; });
    var extra = (+s.ship || 0) + (+s.customs || 0) + (+s.courier || 0);
    var items = s.lines.map(function (l, idx) {
      var p = CATALOG[l.i];
      var per = s.split === 'value' ? (sub ? extra * p.cost / sub : 0) : (pieces ? extra / pieces : 0);
      var upd = function (q) { var ls = s.lines.slice(); if (q <= 0) ls.splice(idx, 1); else ls[idx] = { i: l.i, qty: q }; set({ lines: ls }); };
      return {
        name: p.name, code: p.code, initial: p.name.charAt(0), qty: l.qty, cost: bdt(p.cost), vat: p.vat + '%',
        landed: '৳' + (p.cost + per).toFixed(2), extra: '+৳' + per.toFixed(2) + ' extra',
        total: bdt(p.cost * l.qty * (1 + p.vat / 100)), rowCls: s.flash === l.i ? 'row flash' : 'row',
        inc: function () { upd(l.qty + 1); }, dec: function () { upd(l.qty - 1); }, remove: function () { upd(0); }
      };
    });
    var total = sub + vat + extra;
    var d = new Date(2026, 8, 18 + s.term);
    var due = s.term === 0 ? 'Today, on delivery' : fmtDate(d);
    var admin = (this.props.role ?? 'admin') === 'admin';
    var needs = !admin && total > limit;
    var num = function (k) { return function (e) { var v = e.target.value.replace(/[^0-9]/g, ''); var p = {}; p[k] = v === '' ? 0 : +v; set(p); }; };
    return {
      items: items, itemCount: s.lines.length + ' products · ' + pieces + ' pieces', pieces: pieces,
      toast: s.toast,
      scan: function () {
        var i = s.next % CATALOG.length; var ls = s.lines.slice(); var found = -1;
        ls.forEach(function (l, k) { if (l.i === i) found = k; });
        var msg;
        if (found >= 0) { ls[found] = { i: i, qty: ls[found].qty + 1 }; msg = 'Scanned again: ' + CATALOG[i].name + ' — quantity +1'; }
        else { ls.push({ i: i, qty: 12 }); msg = 'Added ' + CATALOG[i].name + ' (' + CATALOG[i].code + ')'; }
        set({ lines: ls, next: s.next + 1, toast: msg, flash: i });
        clearTimeout(self.t); self.t = setTimeout(function () { self.setState({ toast: '', flash: null }); }, 2600);
      },
      ship: s.ship, customs: s.customs, courier: s.courier,
      shipIn: num('ship'), customsIn: num('customs'), courierIn: num('courier'),
      byValue: s.split === 'value', byQty: s.split !== 'value',
      byValueCls: s.split === 'value' ? 'chip on' : 'chip', byQtyCls: s.split !== 'value' ? 'chip on' : 'chip',
      setValue: function () { set({ split: 'value' }); }, setQty: function () { set({ split: 'qty' }); },
      terms: TERMS.map(function (t) { var on = t.d === s.term; return { label: t.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { set({ term: t.d }); } }; }),
      dueDate: due,
      sub: bdt(sub), vat: bdt(vat), extra: bdt(extra), total: bdt(total),
      needsApproval: needs, noApproval: !needs, isAdmin: admin, smallOrder: !admin && total <= limit,
      primaryLabel: needs ? 'Send for approval' : 'Place order'
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
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class NewPOScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewPO">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1950px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-orders" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Purchase › Purchase orders" page="New purchase order" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginRight: "4px" }}>Start from</span>
                <button type="button" className="chip on" aria-pressed="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                  <span>Blank order</span>
                </button>
                <button type="button" className="chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copy a past order</span>
                </button>
                <button type="button" className="chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8 12 3 7 8" />
                    <path d="M12 3v12" />
                  </svg>
                  <span>Import CSV</span>
                </button>
                <button type="button" className="chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                    <path d="M16 17h6v-6" />
                  </svg>
                  <span>Low-stock list (8 items)</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Supplier and delivery</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Who you are buying from and where the goods will go.</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="po-sup">Supplier</label>
                        <div style={{ position: "relative" }}>
                          <select id="po-sup" className="inp" style={{ appearance: "none", paddingRight: "40px" }}>
                            <option>Rahman Traders</option>
                          </select>
                          <span style={{ position: "absolute", right: "12px", top: "12px", color: "#64748b", pointerEvents: "none" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="po-wh">Receive at warehouse</label>
                        <div style={{ position: "relative" }}>
                          <select id="po-wh" className="inp" style={{ appearance: "none", paddingRight: "40px" }}>
                            <option>Central Warehouse</option>
                          </select>
                          <span style={{ position: "absolute", right: "12px", top: "12px", color: "#64748b", pointerEvents: "none" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="po-date">Expected delivery</label>
                        <input id="po-date" className="inp" type="text" defaultValue="25 Sep 2026" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="po-inv">Supplier invoice no. <span style={{ fontWeight: "400", color: "#64748b" }}>(optional)</span></label>
                        <div style={{ position: "relative" }}>
                          <input id="po-inv" className="inp" type="text" placeholder="Type or scan" style={{ paddingRight: "52px" }} />
                          <button type="button" className="ib" aria-label="Scan supplier invoice" style={{ position: "absolute", right: "2px", top: "2px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                              <path d="M8 7v10" />
                              <path d="M12 7v10" />
                              <path d="M17 7v10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", background: "#f1f5f9", fontSize: "13px", lineHeight: "18px", color: "#334155" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>Rahman Traders gives you <strong style={{ fontWeight: "600" }}>30 days credit</strong>. Last order: PO-2609-0021 on 14 Sep 2026.</span>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Products</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Scan each product once, then set how many you are buying.</p>
                      </div>
                      <span style={{ fontSize: "13px", color: "#475569" }}>{v.itemCount}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <label style={{ position: "relative", flexGrow: "1" }}>
                        <span style={{ position: "absolute", left: "16px", top: "15px", color: "#003087" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <path d="M8 7v10" />
                            <path d="M12 7v10" />
                            <path d="M17 7v10" />
                          </svg>
                        </span>
                        <input className="inp" type="search" placeholder="Scan a barcode or type product name" aria-label="Scan a barcode or type product name" style={{ height: "54px", paddingLeft: "50px", fontSize: "15px", borderColor: "#003087" }} />
                      </label>
                      <button type="button" className="btn solid big" onClick={v.scan}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        <span>Scan with camera</span>
                      </button>
                    </div>
                    {v.toast ? (<>
                      <div className="fade" role="status" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: "#e7f8f1", color: "#065f46", fontSize: "13px", lineHeight: "18px", fontWeight: "500" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        <span>{v.toast}</span>
                      </div>
                    </>) : null}
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th" style={{ paddingLeft: "0" }}>Product</th>
                          <th className="th">Quantity</th>
                          <th className="th">Buy price</th>
                          <th className="th">VAT</th>
                          <th className="th" style={{ textAlign: "right" }}>Real cost / unit</th>
                          <th className="th" style={{ textAlign: "right" }}>Line total</th>
                          <th className="th" style={{ width: "48px" }} />
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.items).map((it, $index) => (<React.Fragment key={$index}>
                            <tr className={it?.rowCls}>
                              <td className="td" style={{ paddingLeft: "0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600" }}>{it?.initial}</span>
                                  <div>
                                    <div style={{ fontWeight: "500" }}>{it?.name}</div>
                                    <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{it?.code}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td">
                                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" }}>
                                  <button type="button" className="ib" aria-label="Less" onClick={it?.dec} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{it?.qty}</span>
                                  <button type="button" className="ib" aria-label="More" onClick={it?.inc} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="td">{it?.cost}</td>
                              <td className="td">
                                <span style={{ display: "inline-flex", height: "28px", padding: "0 10px", alignItems: "center", borderRadius: "999px", background: "#f1f5f9", fontSize: "12px", fontWeight: "600", color: "#334155" }}>{it?.vat}</span>
                              </td>
                              <td className="td" style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: "500" }}>{it?.landed}</div>
                                <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{it?.extra}</div>
                              </td>
                              <td className="td" style={{ textAlign: "right", fontWeight: "600" }}>{it?.total}</td>
                              <td className="td">
                                <button type="button" className="ib" aria-label={`Remove ${it?.name ?? ""}`} onClick={it?.remove}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="btn line sm" onClick={v.scan}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span>Add product</span>
                      </button>
                      <button type="button" className="btn line sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M17 8 12 3 7 8" />
                          <path d="M12 3v12" />
                        </svg>
                        <span>Import lines from CSV</span>
                      </button>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>3</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Extra costs <span style={{ fontWeight: "400", color: "#64748b" }}>(if you know them now)</span></h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Transport, customs and courier are added to each product’s cost, so your profit is correct. Don’t know yet? Skip this — you can add them when the goods arrive.</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="x-ship">Transport / shipping</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "14px", top: "11px", fontSize: "14px", color: "#64748b" }}>৳</span>
                          <input id="x-ship" className="inp" type="text" inputMode="numeric" value={v.ship} onChange={v.shipIn} style={{ paddingLeft: "30px" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="x-cus">{"Customs & LC charges"}</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "14px", top: "11px", fontSize: "14px", color: "#64748b" }}>৳</span>
                          <input id="x-cus" className="inp" type="text" inputMode="numeric" value={v.customs} onChange={v.customsIn} style={{ paddingLeft: "30px" }} />
                        </div>
                        <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>For imported goods</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="x-cour">{"Courier & labour"}</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "14px", top: "11px", fontSize: "14px", color: "#64748b" }}>৳</span>
                          <input id="x-cour" className="inp" type="text" inputMode="numeric" value={v.courier} onChange={v.courierIn} style={{ paddingLeft: "30px" }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span className="lbl">Share extra costs by</span>
                      <button type="button" className={v.byValueCls} aria-pressed={v.byValue} onClick={v.setValue}>Product price</button>
                      <button type="button" className={v.byQtyCls} aria-pressed={v.byQty} onClick={v.setQty}>Number of pieces</button>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>4</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Payment, files and notes</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>When you must pay, and anything the team should know.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="lbl">How long before you must pay the supplier?</span>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {__list(v.terms).map((tm, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={tm?.cls} aria-pressed={tm?.on} onClick={tm?.pick}>{tm?.label}</button>
                          </React.Fragment>))}
                      </div>
                      <span style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Payment due on <strong style={{ fontWeight: "600", color: "#0f172a" }}>{v.dueDate}</strong>. We will remind you 3 days before.</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Supplier invoice or photo</span>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", height: "112px", border: "2px dashed #cbd5e1", borderRadius: "12px", color: "#475569", fontSize: "13px", textAlign: "center" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          <span><strong style={{ fontWeight: "600", color: "#003087" }}>Take a photo</strong> or drop a PDF here</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "#f1f5f9", fontSize: "13px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                          </svg>
                          <span style={{ flexGrow: "1" }}>rahman-quotation.pdf · 240 KB</span>
                          <button type="button" className="ib" aria-label="Remove file" style={{ width: "32px", height: "32px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="po-note">Note</label>
                        <textarea id="po-note" className="inp" style={{ height: "164px", padding: "12px 14px", resize: "none", lineHeight: "20px" }} placeholder="Example: Deliver after 3 PM. Check expiry dates." />
                      </div>
                    </div>
                  </section>
                </div>
                <aside style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Order total</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", lineHeight: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#475569" }}>Products ({v.pieces} pcs)</span>
                        <span>{v.sub}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#475569" }}>VAT</span>
                        <span>{v.vat}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#475569" }}>Extra costs</span>
                        <span>{v.extra}</span>
                      </div>
                    </div>
                    <div style={{ height: "1px", background: "#e2e8f0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>Total</span>
                      <span style={{ fontSize: "30px", lineHeight: "38px", fontWeight: "700", letterSpacing: "-0.02em", color: "#0f172a" }}>{v.total}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                      <span>Pay by</span>
                      <span style={{ fontWeight: "500", color: "#0f172a" }}>{v.dueDate}</span>
                    </div>
                    {v.needsApproval ? (<>
                      <div className="fade" style={{ display: "flex", gap: "10px", padding: "12px", borderRadius: "8px", background: "#fff4e0", color: "#5c2d03", fontSize: "13px", lineHeight: "18px" }}>
                        <span style={{ color: "#a14f06", flexShrink: "0" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </span>
                        <span><strong style={{ fontWeight: "600" }}>Admin approval needed.</strong> Staff orders above ৳50,000 are checked by an admin before they go to the supplier.</span>
                      </div>
                    </>) : null}
                    {v.isAdmin ? (<>
                      <div className="fade" style={{ display: "flex", gap: "10px", padding: "12px", borderRadius: "8px", background: "#e7f8f1", color: "#065f46", fontSize: "13px", lineHeight: "18px" }}>
                        <span style={{ flexShrink: "0" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </span>
                        <span><strong style={{ fontWeight: "600" }}>You’re ordering as admin.</strong> No approval needed — the order goes straight to the supplier.</span>
                      </div>
                    </>) : null}
                    {v.smallOrder ? (<>
                      <div className="fade" style={{ display: "flex", gap: "10px", padding: "12px", borderRadius: "8px", background: "#e7f8f1", color: "#065f46", fontSize: "13px", lineHeight: "18px" }}>
                        <span style={{ flexShrink: "0" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </span>
                        <span>Under ৳50,000 — no approval needed. You can order right away.</span>
                      </div>
                    </>) : null}
                    <button type="button" className="btn solid big" style={{ width: "100%" }}>{v.primaryLabel}</button>
                    <button type="button" className="btn line" style={{ width: "100%" }}>Save as draft</button>
                  </div>
                  <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>After you place the order</div>
                    <p style={{ margin: "0", fontSize: "13px", lineHeight: "20px", color: "#475569" }}>Send the order to the supplier on WhatsApp or print it. Every printed order carries its own barcode, so your staff can scan it when the goods arrive.</p>
                    <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff" }}>
                      <svg width="200" height="40" viewBox="0 0 200 40" aria-hidden="true">
                        <rect x="0" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="4" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="7" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="11" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="16" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="20" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="22" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="26" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="31" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="35" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="39" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="41" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="46" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="49" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="54" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="56" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="61" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="64" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="67" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="72" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="75" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="79" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="83" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="87" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="91" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="95" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="100" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="102" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="104" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="106" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="108" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="113" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="116" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="120" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="123" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="125" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="128" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="130" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="136" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="142" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="146" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="151" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="154" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="157" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="161" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="165" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="167" y="0" width="3" height="40" fill="#0f172a" />
                        <rect x="172" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="175" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="178" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="181" y="0" width="1" height="40" fill="#0f172a" />
                        <rect x="184" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="188" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="191" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="194" y="0" width="2" height="40" fill="#0f172a" />
                        <rect x="198" y="0" width="2" height="40" fill="#0f172a" />
                      </svg>
                      <div className="mono" style={{ marginTop: "4px", fontSize: "11px", textAlign: "center", color: "#334155" }}>PO-2609-0025</div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
