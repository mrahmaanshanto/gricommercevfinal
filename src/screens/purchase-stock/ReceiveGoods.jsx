'use client';
// Generated from design/templates/purchase-stock/ReceiveGoods.dc.html by scripts/convert-design.mjs.
// ReceiveGoods — Purchase & Stock module — Receive goods.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

var RC = [
  { name: 'Men’s Polo Shirt · Navy · M', code: '8941200100118', pending: 20 },
  { name: 'Men’s Polo Shirt · Navy · L', code: '8941200100125', pending: 20 },
  { name: 'Denim Jeans · Blue · 32', code: '8941200200214', pending: 10 },
  { name: 'Denim Jeans · Blue · 34', code: '8941200200221', pending: 10 },
  { name: 'Cotton T-shirt · Black · M', code: '8941200300317', pending: 40 }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var got = s.got || [12, 12, 6, 4, 0];
    var n = s.n || 0, done = !!s.done;
    var total = got.reduce(function (a, b) { return a + b; }, 0);
    var pend = RC.reduce(function (a, r) { return a + r.pending; }, 0);
    var setGot = function (i, v, extra) { var g = got.slice(); g[i] = Math.max(0, v); var p = { got: g }; for (var k in (extra || {})) p[k] = extra[k]; self.setState(p); };
    var lines = RC.map(function (r, i) {
      var g = got[i], state, badge;
      if (g === 0) { state = 'Not scanned'; badge = 'badge b-draft'; }
      else if (g < r.pending) { state = (r.pending - g) + ' short'; badge = 'badge b-partial'; }
      else if (g === r.pending) { state = 'All here'; badge = 'badge b-received'; }
      else { state = (g - r.pending) + ' extra'; badge = 'badge b-over'; }
      return { name: r.name, code: r.code, pending: r.pending, got: g, state: state, badge: badge, rowCls: s.flash === i ? 'row flash' : 'row',
        inc: function () { setGot(i, g + 1); }, dec: function () { setGot(i, g - 1); } };
    });
    var costs = s.costs || [{ label: 'Transport (van from supplier)', amt: 1200, hint: 'From order' }, { label: 'Labour / unloading', amt: 300, hint: '' }];
    var setCosts = function (c) { self.setState({ costs: c }); };
    var ctot = costs.reduce(function (a, c) { return a + (+c.amt || 0); }, 0);
    var shortBy = pend - total;
    return {
      costs: costs.map(function (c, i) { return { label: c.label, amt: c.amt, hint: c.hint,
        setLabel: function (e) { var x = costs.slice(); x[i] = { label: e.target.value, amt: c.amt, hint: '' }; setCosts(x); },
        setAmt: function (e) { var x = costs.slice(); var v = e.target.value.replace(/[^0-9]/g, ''); x[i] = { label: c.label, amt: v === '' ? 0 : +v, hint: c.hint }; setCosts(x); },
        remove: function () { var x = costs.slice(); x.splice(i, 1); setCosts(x); } }; }),
      addCost: function () { setCosts(costs.concat([{ label: '', amt: 0, hint: '' }])); },
      costTotal: '৳' + ctot.toLocaleString('en-IN'), perPiece: total ? '+৳' + (ctot / total).toFixed(2) + ' per piece' : 'Scan items first',
      lines: lines, got: total, pending: pend, pct: Math.min(100, Math.round(total / pend * 100)) + '%',
      hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#ffece6' : '#e7f8f1', msgFg: s.bad ? '#8a2a0c' : '#065f46',
      scan: function () {
        clearTimeout(self.t);
        if (n % 6 === 5) { self.setState({ n: n + 1, msg: 'Barcode 8941100500112 is not on this order. Put it aside and tell the manager.', bad: true, flash: null }); }
        else {
          var order = [4, 0, 1, 2, 3, 4]; var i = order[n % order.length];
          setGot(i, got[i] + 1, { n: n + 1, msg: 'Beep — +1 ' + RC[i].name, bad: false, flash: i });
        }
        self.t = setTimeout(function () { self.setState({ flash: null }); }, 900);
      },
      notDone: !done, done: done,
      short: shortBy > 0, shortText: shortBy + ' pieces are still missing. You can save now — the order stays “Partly received” until the rest arrive.',
      save: function () { self.setState({ done: true }); },
      doneText: total + ' pieces added to Central Warehouse stock. Real cost updated with ৳' + ctot.toLocaleString('en-IN') + ' extra costs.',
      s2bg: done ? '#e7f8f1' : 'rgba(0,48,135,.08)', s2fg: done ? '#065f46' : '#003087', s2dot: done ? '#10b981' : '#003087',
      s3bg: done ? '#e7f8f1' : '#f1f5f9', s3fg: done ? '#065f46' : '#475569', s3dot: done ? '#10b981' : '#94a3b8'
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

export default class ReceiveGoodsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ReceiveGoods">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1300px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-receive" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Purchase" page="Receive goods" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px 10px 10px", borderRadius: "999px", background: "#e7f8f1", color: "#065f46", fontSize: "14px", fontWeight: "500" }}><span style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</span>Order chosen</div>
                <span style={{ width: "32px", height: "2px", background: "#cbd5e1" }} />
                <div style={__sx(`display: flex; align-items: center; gap: 10px; padding: 10px 16px 10px 10px; border-radius: 999px; background: ${v.s2bg ?? ""}; color: ${v.s2fg ?? ""}; font-size: 14px; font-weight: 500;`)}><span style={__sx(`width: 28px; height: 28px; border-radius: 999px; background: ${v.s2dot ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;`)}>2</span>Scan the items</div>
                <span style={{ width: "32px", height: "2px", background: "#cbd5e1" }} />
                <div style={__sx(`display: flex; align-items: center; gap: 10px; padding: 10px 16px 10px 10px; border-radius: 999px; background: ${v.s3bg ?? ""}; color: ${v.s3fg ?? ""}; font-size: 14px; font-weight: 500;`)}><span style={__sx(`width: 28px; height: 28px; border-radius: 999px; background: ${v.s3dot ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;`)}>3</span>Save and update stock</div>
              </div>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(0,48,135,.08)", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M10 9H8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="mono" style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>PO-2609-0020</span>
                        <span className="badge b-partial">Partly received</span>
                      </div>
                      <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Nabil Fashion House · Central Warehouse · 100 pieces still coming</div>
                    </div>
                    <button type="button" className="btn line sm">Choose another order</button>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", gap: "24px", alignItems: "stretch" }}>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <h2 style={{ margin: "0", fontSize: "20px", lineHeight: "28px", fontWeight: "700", color: "#0f172a" }}>Scan each item as you unpack it</h2>
                      <p style={{ margin: "0", fontSize: "14px", lineHeight: "22px", color: "#475569" }}>Every beep adds one piece. No typing needed. If a box has many of the same item, scan once and type the number.</p>
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
                          <input className="inp" type="text" placeholder="Ready — scan a barcode" aria-label="Scan a barcode" style={{ height: "54px", paddingLeft: "50px", fontSize: "15px", border: "2px solid #003087" }} />
                        </label>
                        <button type="button" className="btn solid big" onClick={v.scan}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          <span>Scan with camera</span>
                        </button>
                      </div>
                      {v.hasMsg ? (<>
                        <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; line-height: 20px; font-weight: 500;`)}>
                          <span style={{ flexShrink: "0" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                              <path d="M8 7v10" />
                              <path d="M12 7v10" />
                              <path d="M17 7v10" />
                            </svg>
                          </span>
                          <span>{v.msg}</span>
                        </div>
                      </>) : null}
                    </div>
                    <div style={{ width: "220px", flexShrink: "0", borderRadius: "12px", background: "#012169", color: "#ffffff", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "6px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".08em", color: "#7fcff0" }}>THIS DELIVERY</div>
                      <div style={{ fontSize: "52px", lineHeight: "60px", fontWeight: "700" }}>{v.got}</div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,.78)" }}>of {v.pending} pieces still coming</div>
                      <div style={{ width: "100%", height: "8px", marginTop: "8px", borderRadius: "999px", background: "rgba(255,255,255,.16)", overflow: "hidden" }}>
                        <div style={__sx(`height: 8px; border-radius: 999px; background: #10b981; width: ${v.pct ?? ""}; transition: width 300ms ease-out;`)} />
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th">Product</th>
                          <th className="th" style={{ textAlign: "center" }}>Still coming</th>
                          <th className="th" style={{ textAlign: "center" }}>In this delivery</th>
                          <th className="th">Check</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                            <tr className={l?.rowCls}>
                              <td className="td">
                                <div style={{ fontWeight: "500" }}>{l?.name}</div>
                                <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{l?.code}</div>
                              </td>
                              <td className="td" style={{ textAlign: "center", fontSize: "15px" }}>{l?.pending}</td>
                              <td className="td" style={{ textAlign: "center" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                  <button type="button" className="ib" aria-label={`One less ${l?.name ?? ""}`} onClick={l?.dec}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span style={{ minWidth: "48px", fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>{l?.got}</span>
                                  <button type="button" className="ib" aria-label={`One more ${l?.name ?? ""}`} onClick={l?.inc}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="td">
                                <span className={l?.badge}>{l?.state}</span>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </section>
                  <section className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Extra costs for this delivery</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Transport, labour or anything you paid to bring these goods in. It is added to the real cost of each piece.</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: "0" }}>
                        <div style={{ fontSize: "22px", lineHeight: "30px", fontWeight: "700", color: "#0f172a" }}>{v.costTotal}</div>
                        <div style={{ fontSize: "12px", lineHeight: "16px", color: "#475569" }}>{v.perPiece}</div>
                      </div>
                    </div>
                    {__list(v.costs).map((c, $index) => (<React.Fragment key={$index}>
                        <div className="fade" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 180px 40px", gap: "12px", alignItems: "center" }}>
                          <div style={{ position: "relative" }}>
                            <input className="inp" type="text" value={c?.label} onChange={c?.setLabel} aria-label="Cost name" placeholder="What was it for? e.g. Van rent" />
                            <span style={{ position: "absolute", right: "12px", top: "13px", fontSize: "12px", color: "#64748b" }}>{c?.hint}</span>
                          </div>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "11px", fontSize: "14px", color: "#64748b" }}>৳</span>
                            <input className="inp" type="text" inputMode="numeric" value={c?.amt} onChange={c?.setAmt} aria-label="Amount" style={{ paddingLeft: "30px" }} />
                          </div>
                          <button type="button" className="ib" aria-label="Remove this cost" onClick={c?.remove}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                      </React.Fragment>))}
                    <button type="button" className="btn line sm" style={{ alignSelf: "flex-start" }} onClick={v.addCost}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      <span>Add another cost</span>
                    </button>
                  </section>
                </div>
                <aside style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {v.notDone ? (<>
                    <section className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Delivery details</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="rc-ch">Supplier challan / invoice no.</label>
                        <div style={{ position: "relative" }}>
                          <input id="rc-ch" className="inp" type="text" defaultValue="NF-2231-B" style={{ paddingRight: "52px" }} />
                          <button type="button" className="ib" aria-label="Scan challan" style={{ position: "absolute", right: "2px", top: "2px" }}>
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Photo of challan</span>
                        <button type="button" className="btn line" style={{ height: "64px", borderStyle: "dashed", borderWidth: "2px" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          <span>Take photo</span>
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="rc-by">Received by</label>
                        <select id="rc-by" className="inp">
                          <option>Karim (store)</option>
                        </select>
                      </div>
                      <button type="button" className="btn line sm" style={{ alignSelf: "flex-start" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                        <span>Report damaged or wrong items</span>
                      </button>
                      <div style={{ height: "1px", background: "#e2e8f0" }} />
                      {v.short ? (<>
                        <p style={{ margin: "0", fontSize: "13px", lineHeight: "18px", color: "#475569" }}>{v.shortText}</p>
                      </>) : null}
                      <button type="button" className="btn solid big" style={{ width: "100%" }} onClick={v.save}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span>Save delivery</span>
                      </button>
                    </section>
                  </>) : null}
                  {v.done ? (<>
                    <section className="card fade" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", textAlign: "center" }}>
                      <span style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#e7f8f1", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <h2 style={{ margin: "0", fontSize: "20px", lineHeight: "28px", fontWeight: "700", color: "#0f172a" }}>Delivery saved</h2>
                      <p style={{ margin: "0", fontSize: "14px", lineHeight: "22px", color: "#475569" }}>{v.doneText}</p>
                      <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                        <svg width="160" height="34" viewBox="0 0 160 34" aria-hidden="true">
                          <rect x="0" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="5" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="9" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="12" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="18" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="21" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="24" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="28" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="31" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="34" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="37" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="40" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="43" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="48" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="51" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="54" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="57" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="61" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="64" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="67" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="70" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="73" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="76" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="78" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="80" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="84" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="87" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="90" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="93" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="98" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="103" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="107" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="110" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="112" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="114" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="116" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="119" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="121" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="125" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="128" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="132" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="137" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="143" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="146" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="150" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="153" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="158" y="0" width="1" height="34" fill="#0f172a" />
                        </svg>
                        <div className="mono" style={{ fontSize: "11px", color: "#334155" }}>GRN-0121</div>
                      </div>
                      <button type="button" className="btn solid" style={{ width: "100%" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                          <rect x="6" y="14" width="12" height="8" rx="1" />
                        </svg>
                        <span>Print barcode labels ({v.got})</span>
                      </button>
                      <__Link href="/po-detail" className="btn line" style={{ width: "100%" }}>Back to order</__Link>
                    </section>
                  </>) : null}
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
