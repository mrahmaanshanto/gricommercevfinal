'use client';
// Generated from design/templates/console/SystemStates.dc.html by scripts/convert-design.mjs.
// System states
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() {
    return {};
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:var(--font-data);font-size:var(--text-xs);letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:var(--radius-md);background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

`;

// ---- markup ----

export default class SystemStatesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="SystemStates">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="cs-boardscroll">
          <div data-board="" style={{ width: "1440px", height: "2640px", overflow: "hidden", background: "#e9eef5" }}>
            <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "36px 80px 40px" }}>
              <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                  <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>Step 1 · Console foundation</p>
                  <nav aria-label="Step 1 boards" style={{ display: "flex", gap: "8px" }}>
                    <__Link href="/core-ui-plan" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>← UI plan</__Link>
                    <__Link href="/console-shell" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Console shell</__Link>
                    <__Link href="/console-shell-dark" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Dark</__Link>
                    <__Link href="/chart-kit" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Chart and KPI kit</__Link>
                    <__Link href="/tenant-context-bar" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Tenant context bar</__Link>
                    <__Link href="/system-states" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)", background: "rgba(127,212,245,.22)" }} aria-current="page">System states</__Link>
                  </nav>
                </div>
                <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>System states</h1>
                <p style={{ margin: "0", maxWidth: "820px", fontSize: "var(--text-base)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>The eight states every console screen falls into when it is not simply showing data. Written once here, so no screen invents its own.</p>
              </div>
            </header>
            <section style={{ padding: "56px 80px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "36px 28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>01</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Loading</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Skeleton in the final layout. Appears only after 300 ms, stays at least 500 ms, so fast loads never flash.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Tenants</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Merchants</span>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div aria-busy="true" aria-label="Loading merchants" style={{ display: "flex", flexDirection: "column", gap: "14px", flexGrow: "1" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                          <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div className="sk" style={{ height: "10px", width: "55%" }} />
                            <div className="sk" style={{ height: "22px", width: "70%" }} />
                          </div>
                          <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div className="sk" style={{ height: "10px", width: "55%" }} />
                            <div className="sk" style={{ height: "22px", width: "70%" }} />
                          </div>
                          <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div className="sk" style={{ height: "10px", width: "55%" }} />
                            <div className="sk" style={{ height: "22px", width: "70%" }} />
                          </div>
                          <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div className="sk" style={{ height: "10px", width: "55%" }} />
                            <div className="sk" style={{ height: "22px", width: "70%" }} />
                          </div>
                        </div>
                        <div style={{ flexGrow: "1", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", overflow: "hidden" }}>
                          <div style={{ height: "36px" }} />
                          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.6fr 100px 100px", gap: "14px", alignItems: "center", height: "44px", padding: "0 16px", borderTop: "1px solid #eef2f7" }}>
                            <div className="sk" style={{ height: "12px", width: "80%" }} />
                            <div className="sk" style={{ height: "12px", width: "70%" }} />
                            <div className="sk" style={{ height: "12px" }} />
                            <div className="sk" style={{ height: "12px" }} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.6fr 100px 100px", gap: "14px", alignItems: "center", height: "44px", padding: "0 16px", borderTop: "1px solid #eef2f7" }}>
                            <div className="sk" style={{ height: "12px", width: "80%" }} />
                            <div className="sk" style={{ height: "12px", width: "70%" }} />
                            <div className="sk" style={{ height: "12px" }} />
                            <div className="sk" style={{ height: "12px" }} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.6fr 100px 100px", gap: "14px", alignItems: "center", height: "44px", padding: "0 16px", borderTop: "1px solid #eef2f7" }}>
                            <div className="sk" style={{ height: "12px", width: "80%" }} />
                            <div className="sk" style={{ height: "12px", width: "70%" }} />
                            <div className="sk" style={{ height: "12px" }} />
                            <div className="sk" style={{ height: "12px" }} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.6fr 100px 100px", gap: "14px", alignItems: "center", height: "44px", padding: "0 16px", borderTop: "1px solid #eef2f7" }}>
                            <div className="sk" style={{ height: "12px", width: "80%" }} />
                            <div className="sk" style={{ height: "12px", width: "70%" }} />
                            <div className="sk" style={{ height: "12px" }} />
                            <div className="sk" style={{ height: "12px" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>02</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Empty, because of filters</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Names the filters, how many stores exist, and which single filter to drop.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Tenants</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Merchants</span>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ display: "inline-flex", color: "#475569" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z" />
                          </svg>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 6px 0 12px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Wholesale<button type="button" aria-label="Remove filter Wholesale" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", border: "0", borderRadius: "var(--radius-full)", background: "transparent", color: "#003087", cursor: "pointer" }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
</button></span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 6px 0 12px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Past due<button type="button" aria-label="Remove filter Past due" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", border: "0", borderRadius: "var(--radius-full)", background: "transparent", color: "#003087", cursor: "pointer" }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
</button></span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 6px 0 12px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Health under 40<button type="button" aria-label="Remove filter Health under 40" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", border: "0", borderRadius: "var(--radius-full)", background: "transparent", color: "#003087", cursor: "pointer" }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
</button></span>
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", textAlign: "center", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #eef2f7", padding: "20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#e0e6f1", color: "#003087" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                          </svg>
                        </span>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>No stores match these three filters</div>
                        <div style={{ maxWidth: "420px", fontSize: "var(--text-xs-plus)", lineHeight: "1.6", color: "#475569" }}>62 stores exist. Removing <strong>Health under 40</strong> would show 2.</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <button className="btn solid" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Clear filters</button>
                          <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Remove one</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>03</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Empty, and good news</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>An empty queue is a result. Say so, and when it was last not empty.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Operations</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Incidents</span>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", textAlign: "center", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #eef2f7", padding: "20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>No open incidents</div>
                        <div style={{ maxWidth: "420px", fontSize: "var(--text-xs-plus)", lineHeight: "1.6", color: "#475569" }}>Every integration and service is healthy. The last incident, Steadfast webhook delays, closed 12 Aug 2026 after 26 minutes.</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <a className="btn ghost" href="#" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Incident history</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>04</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>No permission</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Says who can see it, the user's role, and what they can see instead.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Billing</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Invoices</span>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", textAlign: "center", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #eef2f7", padding: "20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#f1f5f9", color: "#475569" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="4" y="11" width="16" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                          </svg>
                        </span>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Invoices are limited to finance staff</div>
                        <div style={{ maxWidth: "420px", fontSize: "var(--text-xs-plus)", lineHeight: "1.6", color: "#475569" }}>Your role is <strong>Support lead</strong>. You can see a store's billing state on its profile, but not its invoices.</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <button className="btn solid" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Ask an admin for access</button>
                          <a className="btn ghost" href="#" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>See role permissions</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>05</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Store not found</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>For a domain, phone or tenant number that resolves to nothing; offers the closest match.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Console</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Search</span>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #eef2f7", padding: "20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#f1f5f9", color: "#475569" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 9 4.5 4h15L21 9" />
                            <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                            <path d="M5 12v9h14v-9" />
                          </svg>
                        </span>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>No store at dhakagadget.com.bd</div>
                        <div style={{ maxWidth: "440px", fontSize: "var(--text-xs-plus)", lineHeight: "1.6", color: "#475569" }}>No tenant owns this domain. It may have been removed, or the store uses a different address. Closest match:</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px", padding: "12px 14px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", textAlign: "left", width: "420px" }}>
                          <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                            <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
                          </svg>
                          <div>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Dhaka Gadget Hub</div>
                            <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0031 · dhakagadgethub.com.bd</div>
                          </div>
                          <a className="rowlink" href="#" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Open →</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>06</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Stale data</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Shows the last good figures, dimmed, with their age and the delayed job.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Monitoring</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Health and risk</span>
                    </div>
                    <div role="status" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", background: "#fff4e0", borderBottom: "1px solid #ffd699", fontSize: "var(--text-xs-plus)", color: "#7a3e05" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span><strong>Health scores are 38 minutes old.</strong> The scoring job is delayed; figures may not reflect the last half hour.</span>
                      <a href="#" style={{ marginLeft: "auto", fontWeight: "var(--weight-medium)", color: "#7a3e05" }}>Job status</a>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px", opacity: ".72" }}>
                        <div style={{ padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Healthy</div>
                          <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>44</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>as of 13:54</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Watch</div>
                          <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>13</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>as of 13:54</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>At risk</div>
                          <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>5</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>as of 13:54</div>
                        </div>
                      </div>
                      <div style={{ flexGrow: "1", marginTop: "12px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", opacity: ".72" }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>07</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Could not load</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Says which service failed and that nothing changed; retry in place and a copyable error ID.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Billing</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Invoices</span>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", textAlign: "center", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #eef2f7", padding: "20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#ffece5", color: "#c2410c" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                            <path d="M12 9v4M12 17h.01" />
                          </svg>
                        </span>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Invoices could not load</div>
                        <div style={{ maxWidth: "420px", fontSize: "var(--text-xs-plus)", lineHeight: "1.6", color: "#475569" }}>The billing service did not answer within 10 seconds. Nothing was changed. Retry now, or quote the error ID to engineering.</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <button className="btn solid" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5" />
</svg>Retry</button>
                          <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span className="mono" style={{ fontSize: "var(--text-xs)" }}>ERR-7F3A-0931</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0070a0" }}>08</span>
                    <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Connection lost</span>
                  </div>
                  <p style={{ margin: "-4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Keeps the page, pauses actions that write, and reconnects on its own.</p>
                  <div style={{ display: "flex", flexDirection: "column", height: "380px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f4f7fb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 18px", background: "#fff", borderBottom: "1px solid #eef2f7", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Billing</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Collections</span>
                    </div>
                    <div role="alert" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", background: "#0f172a", color: "#fff", fontSize: "var(--text-xs-plus)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.4-1.8M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8A15 15 0 0 0 11 5M12 20h.01" />
                      </svg>
                      <span><strong>Connection lost.</strong> Reconnecting in <span className="num">5</span> s. Actions are paused so nothing is sent twice.</span>
                      <button type="button" className="btn" style={{ marginLeft: "auto", minHeight: "32px", padding: "0 12px", fontSize: "var(--text-xs-plus)", background: "rgba(255,255,255,.12)", color: "#fff" }}>Try now</button>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", padding: "18px", minHeight: "0" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexGrow: "1", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7", padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "0" }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Nodi Organic</span>
                          <span className="mono" style={{ color: "var(--text-muted)" }}>TXN 8KJ21M0QX</span>
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳1,000 · bKash</span>
                          <button className="btn ghost" type="button" disabled style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", opacity: ".5", cursor: "not-allowed" }}>Verify</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Kolpo Books</span>
                          <span className="mono" style={{ color: "var(--text-muted)" }}>TXN 3HD90PL2A</span>
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳1,000 · Nagad</span>
                          <button className="btn ghost" type="button" disabled style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", opacity: ".5", cursor: "not-allowed" }}>Verify</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Shonali Crafts</span>
                          <span className="mono" style={{ color: "var(--text-muted)" }}>TXN 9QW4R7T1Z</span>
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳2,500 · bKash</span>
                          <button className="btn ghost" type="button" disabled style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", opacity: ".5", cursor: "not-allowed" }}>Verify</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section style={{ padding: "64px 80px 80px" }}>
              <div className="card" style={{ padding: "28px 32px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Copy</p>
                <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Every state answers four questions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "14px", marginTop: "18px" }}>
                  <div style={{ padding: "18px 20px", borderRadius: "var(--radius-xl)", background: "#f4f7fb" }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>What happened</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>“Invoices could not load”, not “Something went wrong”.</div>
                  </div>
                  <div style={{ padding: "18px 20px", borderRadius: "var(--radius-xl)", background: "#f4f7fb" }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Why, if known</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Name the service, the store or the filter; never a stack trace.</div>
                  </div>
                  <div style={{ padding: "18px 20px", borderRadius: "var(--radius-xl)", background: "#f4f7fb" }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>What to do</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>One primary action: retry, clear filters, ask for access.</div>
                  </div>
                  <div style={{ padding: "18px 20px", borderRadius: "var(--radius-xl)", background: "#f4f7fb" }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>What did not happen</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Say nothing was changed or sent, whenever a write was in flight.</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
}
