'use client';
// Generated from design/templates/purchase-stock/Requests.dc.html by scripts/convert-design.mjs.
// Requests — Purchase & Stock module — Staff requests.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

var RQ = [
  { name: 'Sunscreen SPF 50 · 50ml', code: '8941100500235', stock: 4, qty: 48, by: 'Tania', branch: 'Dhanmondi shop', need: '22 Sep 2026', supplier: 'Rahman Traders' },
  { name: 'Aloe Vera Soothing Gel 300ml', code: '8941100500112', stock: 9, qty: 36, by: 'Tania', branch: 'Dhanmondi shop', need: '22 Sep 2026', supplier: 'Rahman Traders' },
  { name: 'Shipping box · Medium', code: '8941300900014', stock: 0, qty: 500, by: 'Karim', branch: 'Central Warehouse', need: '20 Sep 2026', supplier: 'Chattogram Packaging Co.' },
  { name: 'Cotton T-shirt · Black · M', code: '8941200300317', stock: 2, qty: 60, by: 'Rafi', branch: 'Online orders', need: '25 Sep 2026', supplier: 'Nabil Fashion House' }
];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var sel = s.sel || [true, true, true, false];
    var rows = RQ.map(function (r, i) {
      return { name: r.name, code: r.code, stock: r.stock === 0 ? 'Out' : r.stock + ' left', stockColor: r.stock === 0 ? '#b83210' : (r.stock < 10 ? '#b4410c' : '#0f172a'),
        qty: r.qty, by: r.by, branch: r.branch, need: r.need, supplier: r.supplier, on: sel[i],
        toggle: function () { var x = sel.slice(); x[i] = !x[i]; self.setState({ sel: x }); } };
    });
    var picked = RQ.filter(function (r, i) { return sel[i]; });
    var sups = {}; picked.forEach(function (r) { sups[r.supplier] = 1; });
    var ns = Object.keys(sups).length;
    return { rows: rows, any: picked.length > 0, selText: picked.length + ' selected',
      supText: Object.keys(sups).join(' · '),
      cta: ns === 1 ? 'Make 1 purchase order' : 'Make ' + ns + ' purchase orders' };
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

export default class RequestsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Requests">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "940px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="po-requests" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Purchase" page="Staff requests" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Staff asks</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>From shop or phone, by scanning</div>
                  </div>
                </div>
                <span style={{ width: "28px", height: "2px", background: "#cbd5e1" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>You approve</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Or change the quantity</div>
                  </div>
                </div>
                <span style={{ width: "28px", height: "2px", background: "#cbd5e1" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#e0f3fb", color: "#0089c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Becomes a purchase order</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>One order per supplier</div>
                  </div>
                </div>
                <div style={{ flexGrow: "1" }} />
                <button type="button" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>New request</span>
                </button>
              </section>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <button type="button" className="tab on" aria-pressed="true">Waiting<span style={{ minWidth: "22px", height: "20px", padding: "0 6px", borderRadius: "999px", background: "rgba(255,255,255,.2)", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>4</span></button>
                  <button type="button" className="tab">Approved</button>
                  <button type="button" className="tab">Turned into orders</button>
                  <button type="button" className="tab">Rejected</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th" style={{ width: "56px" }}>
                        <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Select</span>
                      </th>
                      <th className="th">Product</th>
                      <th className="th" style={{ textAlign: "center" }}>In stock now</th>
                      <th className="th" style={{ textAlign: "center" }}>Asked for</th>
                      <th className="th">Asked by</th>
                      <th className="th">Needed by</th>
                      <th className="th">Buy from</th>
                      <th className="th" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row">
                          <td className="td">
                            <input type="checkbox" checked={r?.on} onChange={r?.toggle} aria-label={`Select ${r?.name ?? ""}`} style={{ width: "20px", height: "20px", margin: "0", accentColor: "#003087" }} />
                          </td>
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>{r?.name}</div>
                            <div className="mono" style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.code}</div>
                          </td>
                          <td className="td" style={{ textAlign: "center" }}>
                            <span style={__sx(`font-weight: 600; color: ${r?.stockColor ?? ""};`)}>{r?.stock}</span>
                          </td>
                          <td className="td" style={{ textAlign: "center", fontSize: "16px", fontWeight: "700" }}>{r?.qty}</td>
                          <td className="td">
                            <div style={{ fontWeight: "500" }}>{r?.by}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.branch}</div>
                          </td>
                          <td className="td">{r?.need}</td>
                          <td className="td">{r?.supplier}</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <button type="button" className="btn soft sm" aria-label={`Approve ${r?.name ?? ""}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                                <span>Approve</span>
                              </button>
                              <button type="button" className="ib" aria-label={`Reject ${r?.name ?? ""}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
              </section>
              {v.any ? (<>
                <div className="fade" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderRadius: "12px", background: "#012169", color: "#ffffff", boxShadow: "0 12px 30px -12px rgba(1,33,105,.5)" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>{v.selText}</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,.78)" }}>{v.supText}</span>
                  <div style={{ flexGrow: "1" }} />
                  <button type="button" className="btn big" style={{ background: "#009cde", color: "#ffffff" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                    <span>{v.cta}</span>
                  </button>
                </div>
              </>) : null}
            </div>
          </main>
        </div>
      </div>
    );
  }
}
