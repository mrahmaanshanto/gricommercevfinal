'use client';
// Generated from design/templates/purchase-stock/Transfers.dc.html by scripts/convert-design.mjs.
// Transfers — Purchase & Stock module — Transfers.
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
var TR = [
  { no: 'TRF-0010', date: '18 Sep 2026', by: 'Karim', from: 'Central Warehouse', to: 'Dhanmondi shop', pcs: 64, got: 0, s: 'way' },
  { no: 'TRF-0009', date: '17 Sep 2026', by: 'Karim', from: 'Central Warehouse', to: 'Online orders', pcs: 40, got: 0, s: 'draft' },
  { no: 'TRF-0008', date: '16 Sep 2026', by: 'Karim', from: 'Central Warehouse', to: 'Online orders', pcs: 40, got: 40, s: 'done' },
  { no: 'TRF-0007', date: '12 Sep 2026', by: 'Tania', from: 'Dhanmondi shop', to: 'Central Warehouse', pcs: 12, got: 10, s: 'short' },
  { no: 'TRF-0006', date: '8 Sep 2026', by: 'Karim', from: 'Central Warehouse', to: 'Chattogram DC', pcs: 120, got: 120, s: 'done' }
];
var TS = { draft: ['Not sent yet', 'badge b-draft'], way: ['On the way', 'badge b-ordered'], done: ['Received', 'badge b-received'], short: ['2 missing', 'badge b-cancelled'] };
var TABS = [{ k: 'all', label: 'All' }, { k: 'way', label: 'On the way' }, { k: 'done', label: 'Received' }, { k: 'short', label: 'With a problem' }, { k: 'draft', label: 'Not sent yet' }];
class Component extends DCLogic {
  renderVals() {
    var t = (this.state && this.state.t) || 'all';
    var cnt = { all: TR.length }; TR.forEach(function (r) { cnt[r.s] = (cnt[r.s] || 0) + 1; });
    var rows = TR.filter(function (r) { return t === 'all' || r.s === t; }).map(function (r) {
      var p = Math.round(r.got / r.pcs * 100);
      return { no: r.no, date: r.date, by: r.by, from: r.from, to: r.to, pcs: r.pcs, got: r.got + ' / ' + r.pcs, pct: p + '%', bar: r.s === 'short' ? '#ff5724' : '#10b981',
        status: TS[r.s][0], badge: TS[r.s][1], canReceive: r.s === 'way', noReceive: r.s !== 'way' };
    });
    return { tabs: mkTabs(this, TABS, t, 't', cnt), rows: rows, empty: rows.length === 0 };
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

export default class TransfersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Transfers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "960px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="stock-transfers" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Stock" page="Transfers" placeholder="Search or scan any barcode" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "rgba(0,48,135,.08)", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>1</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>On the way</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>64 pcs · ৳28,858</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>2</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Received this month</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>all scanned in</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#b83210" }}>1</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>With a problem</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>2 pcs missing on arrival</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Move stock between your warehouses and shops. Scan out when it leaves, scan in when it arrives.</div>
                <__Link href="/new-transfer" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                  <span>New transfer</span>
                </__Link>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: ${tb?.countBg ?? ""}; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th">Transfer</th>
                      <th className="th">From</th>
                      <th className="th" />
                      <th className="th">To</th>
                      <th className="th" style={{ textAlign: "center" }}>Pieces</th>
                      <th className="th">Arrived</th>
                      <th className="th">Status</th>
                      <th className="th" style={{ textAlign: "right" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr className="row fade">
                          <td className="td">
                            <div className="mono" style={{ fontWeight: "600" }}>{r?.no}</div>
                            <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{r?.date} · by {r?.by}</div>
                          </td>
                          <td className="td" style={{ fontWeight: "500" }}>{r?.from}</td>
                          <td className="td" style={{ color: "#94a3b8", padding: "0" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </td>
                          <td className="td" style={{ fontWeight: "500" }}>{r?.to}</td>
                          <td className="td" style={{ textAlign: "center", fontWeight: "600" }}>{r?.pcs}</td>
                          <td className="td">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "80px", height: "8px", borderRadius: "999px", background: "#e9eef5", overflow: "hidden" }}>
                                <div style={__sx(`height: 8px; border-radius: 999px; width: ${r?.pct ?? ""}; background: ${r?.bar ?? ""};`)} />
                              </div>
                              <span style={{ fontSize: "13px", color: "#475569" }}>{r?.got}</span>
                            </div>
                          </td>
                          <td className="td">
                            <span className={r?.badge}>{r?.status}</span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            {r?.canReceive ? (<>
                              <button type="button" className="btn solid sm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                  <path d="M8 7v10" />
                                  <path d="M12 7v10" />
                                  <path d="M17 7v10" />
                                </svg>
                                <span>Scan in</span>
                              </button>
                            </>) : null}
                            {r?.noReceive ? (<>
                              <button type="button" className="btn line sm">View</button>
                            </>) : null}
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
                {v.empty ? (<>
                  <div style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>No transfers here.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
