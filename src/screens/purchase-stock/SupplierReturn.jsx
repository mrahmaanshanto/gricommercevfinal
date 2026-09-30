'use client';
// Generated from design/templates/purchase-stock/SupplierReturn.dc.html by scripts/convert-design.mjs.
// SupplierReturn — Purchase & Stock module — Return goods to supplier.
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
function flashMsg(self, msg, bad, patch) { clearTimeout(self.t); var p = patch || {}; p.msg = msg; p.bad = !!bad; self.setState(p); self.t = setTimeout(function () { self.setState({ flash: null }); }, 900); }
function msgVals(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#ffece6' : '#e7f8f1', msgFg: s.bad ? '#8a2a0c' : '#065f46' }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
var RL = [
  { name: 'Denim Jeans · Blue · 32', code: '8941200200214', recv: 30, cost: 720 },
  { name: 'Denim Jeans · Blue · 34', code: '8941200200221', recv: 30, cost: 720 }
];
var REASONS = [{ k: 'damaged', label: 'Damaged' }, { k: 'wrong', label: 'Wrong item or size' }, { k: 'quality', label: 'Poor quality' }, { k: 'expired', label: 'Expired' }, { k: 'extra', label: 'Sent too many' }];
var SETTLE = [
  { k: 'credit', label: 'Reduce what I owe', sub: 'Most common. The value comes off your next payment.' },
  { k: 'cash', label: 'Money back', sub: 'The supplier pays you back in cash, bKash or bank.' },
  { k: 'replace', label: 'Send new items', sub: 'The supplier replaces them. The order waits for them.' }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var q = s.q || [2, 0], reason = s.reason || 'quality', st = s.st || 'credit', done = !!s.done;
    var setQ = function (i, v) { var x = q.slice(); x[i] = Math.max(0, Math.min(RL[i].recv, v)); self.setState({ q: x, flash: i }); };
    var pcs = q[0] + q[1], val = q[0] * RL[0].cost + q[1] * RL[1].cost;
    var effect = st === 'credit' ? 'You will owe Nabil Fashion House ' + bdt(62600 - val) + ' instead of ৳62,600.' : (st === 'cash' ? 'Nabil Fashion House will pay you back ' + bdt(val) + '. We will remind you until it is paid.' : pcs + ' new pieces will be added to PO-2609-0020 as still coming.');
    return assign({
      lines: RL.map(function (r, i) { return { name: r.name, code: r.code, initial: r.name.charAt(0), recv: r.recv, qty: q[i], cost: bdt(r.cost), value: bdt(q[i] * r.cost), rowCls: s.flash === i ? 'row flash' : 'row', inc: function () { setQ(i, q[i] + 1); }, dec: function () { setQ(i, q[i] - 1); } }; }),
      scan: function () { var n = s.n || 0; var i = n % 2; var x = q.slice(); x[i] = Math.min(RL[i].recv, x[i] + 1); flashMsg(self, 'Beep — +1 ' + RL[i].name, false, { q: x, n: n + 1, flash: i }); },
      reasons: mkChips(this, REASONS, reason, 'reason'),
      settle: SETTLE.map(function (x) { var on = x.k === st; return { label: x.label, sub: x.sub, on: on, border: on ? '#003087' : '#e2e8f0', bg: on ? 'rgba(0,48,135,.05)' : '#ffffff', pick: function () { self.setState({ st: x.k }); } }; }),
      pcs: pcs, val: bdt(val), effect: effect, notDone: !done, done: done,
      save: function () { if (pcs > 0) self.setState({ done: true }); },
      doneText: pcs + ' pieces removed from Central Warehouse stock. ' + effect
    }, msgVals(s));
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

export default class SupplierReturnScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SupplierReturn">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1350px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-suppliers" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Purchase › Suppliers & dues"} page="Return goods to supplier" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Which delivery are the goods from?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Scan the delivery slip (GRN) or pick the supplier.</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="rt-sup">Supplier</label>
                        <select id="rt-sup" className="inp">
                          <option>Nabil Fashion House</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="rt-grn">Delivery</label>
                        <div style={{ position: "relative" }}>
                          <select id="rt-grn" className="inp">
                            <option>GRN-0118 · 17 Sep 2026 · PO-2609-0020</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Scan the items going back</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Only items from this delivery can be returned.</p>
                      </div>
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
                        <input className="inp" type="search" placeholder="Scan an item you are sending back" aria-label="Scan an item you are sending back" style={{ height: "54px", paddingLeft: "50px", fontSize: "15px", border: "2px solid #003087" }} />
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
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th" style={{ paddingLeft: "0" }}>Product</th>
                          <th className="th" style={{ textAlign: "center" }}>Received</th>
                          <th className="th">Returning</th>
                          <th className="th" style={{ textAlign: "right" }}>Unit cost</th>
                          <th className="th" style={{ textAlign: "right" }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.lines).map((r, $index) => (<React.Fragment key={$index}>
                            <tr className={r?.rowCls}>
                              <td className="td" style={{ paddingLeft: "0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>{r?.initial}</span>
                                  <div>
                                    <div style={{ fontWeight: "500" }}>{r?.name}</div>
                                    <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.code}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td" style={{ textAlign: "center" }}>{r?.recv}</td>
                              <td className="td">
                                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                                  <button type="button" className="ib" aria-label="Less " onClick={r?.dec} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "600" }}>{r?.qty}</span>
                                  <button type="button" className="ib" aria-label="More " onClick={r?.inc} style={{ borderRadius: "0" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="td" style={{ textAlign: "right" }}>{r?.cost}</td>
                              <td className="td" style={{ textAlign: "right", fontWeight: "600" }}>{r?.value}</td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>3</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Why are they going back?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>Pick one reason. Add a photo so the supplier can’t argue.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.reasons).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: "16px" }}>
                      <button type="button" className="btn line" style={{ height: "110px", flexDirection: "column", borderStyle: "dashed", borderWidth: "2px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        <span>Add photo</span>
                      </button>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="rt-note">Note for the supplier</label>
                        <textarea id="rt-note" className="inp" style={{ height: "86px", padding: "12px 14px", resize: "none", lineHeight: "20px" }} defaultValue={"Loose stitching on the seams. Please replace."} />
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "999px", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>4</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>How will the supplier settle it?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>This decides what happens to the money you owe.</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                      {__list(v.settle).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={x?.pick} aria-pressed={x?.on} style={__sx(`text-align: left; padding: 16px; border-radius: 12px; border: 2px solid ${x?.border ?? ""}; background: ${x?.bg ?? ""}; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 4px;`)}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{x?.label}</span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#475569" }}>{x?.sub}</span>
                          </button>
                        </React.Fragment>))}
                    </div>
                  </section>
                </div>
                <aside style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {v.notDone ? (<>
                    <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <h2 style={{ margin: "0", fontSize: "17px", lineHeight: "24px", fontWeight: "600", color: "#0f172a" }}>Return summary</h2>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ color: "#475569" }}>Pieces going back</span>
                        <span style={{ fontWeight: "600" }}>{v.pcs}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ color: "#475569" }}>Value</span>
                        <span style={{ fontWeight: "600" }}>{v.val}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ color: "#475569" }}>Stock</span>
                        <span style={{ fontWeight: "600", color: "#b83210" }}>−{v.pcs} pcs</span>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0" }} />
                      <div style={{ fontSize: "13px", lineHeight: "19px", color: "#334155" }}>{v.effect}</div>
                      <button type="button" className="btn solid big" style={{ width: "100%" }} onClick={v.save}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                          <rect x="6" y="14" width="12" height="8" rx="1" />
                        </svg>
                        <span>Save and print return slip</span>
                      </button>
                      <p style={{ margin: "0", fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>The slip has a barcode. Give it to the supplier with the goods.</p>
                    </section>
                  </>) : null}
                  {v.done ? (<>
                    <section className="card fade" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", textAlign: "center" }}>
                      <span style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#e7f8f1", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <h2 style={{ margin: "0", fontSize: "20px", lineHeight: "28px", fontWeight: "700", color: "#0f172a" }}>Return saved</h2>
                      <p style={{ margin: "0", fontSize: "14px", lineHeight: "22px", color: "#475569" }}>{v.doneText}</p>
                      <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                        <svg width="160" height="34" viewBox="0 0 160 34" aria-hidden="true">
                          <rect x="0" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="4" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="8" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="11" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="14" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="16" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="18" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="22" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="25" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="29" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="32" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="37" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="42" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="46" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="49" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="51" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="56" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="60" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="64" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="68" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="70" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="73" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="78" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="81" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="83" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="86" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="88" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="92" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="96" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="99" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="101" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="105" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="108" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="113" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="117" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="123" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="127" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="131" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="136" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="140" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="143" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="149" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="152" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="155" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="158" y="0" width="2" height="34" fill="#0f172a" />
                        </svg>
                        <div className="mono" style={{ fontSize: "11px", color: "#334155" }}>RTS-0010</div>
                      </div>
                      <__Link href="/suppliers" className="btn line" style={{ width: "100%" }}>Back to suppliers</__Link>
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
